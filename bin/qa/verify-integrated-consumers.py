#!/usr/bin/env python3
"""Run actual compiled consumers against disposable, synthetic Core fixtures.

Only owned child processes are stopped. Private databases/session codes live in
fresh temporary directories; the evidence allowlist never includes those files.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
from urllib.error import HTTPError
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[2]
S20 = ROOT / 'apps/web/src/features/learning-journey/verification'


def inventory():
    paths = ['apps/web/src/App.tsx', 'apps/web/src/features/Classroom.tsx',
             'apps/web/src/features/Materials.tsx', 'apps/web/src/components/SourceViewer.tsx',
             'apps/studio/src/ReplayView.tsx', 'services/study-api/study_api/app.py',
             'packages/engine/lessonos/study/submissions.py']
    # The exact compiled inventory also binds lazy consumers and their assets.
    paths.extend(str(p.relative_to(ROOT)) for p in sorted((ROOT / 'apps/web/dist').rglob('*')) if p.is_file())
    return {path: hashlib.sha256((ROOT / path).read_bytes()).hexdigest()
            for path in paths if (ROOT / path).is_file()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=False)
    if not (ROOT / 'apps/web/dist/index.html').is_file():
        parser.error('build the ordinary Web application with VITE_S20_LEARNING_JOURNEY=1 first')
    head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    before = inventory()
    result = {'sourceCommit': head, 'sourceAndAssetsSha256': before, 'checks': [], 'status': 'RUNNING'}
    python = os.environ.get('ARDESIA_STUDY_PYTHON', str(ROOT / 'services/study-api/.venv/bin/python'))
    environment = {**os.environ, 'ARDESIA_STUDY_PYTHON': python}

    def run(name, script, env):
        started = time.monotonic()
        with (output / f'{name}.log').open('w') as log:
            completed = subprocess.run(['node', str(script)], cwd=ROOT, env=env,
                                       stdout=log, stderr=subprocess.STDOUT, timeout=600)
        result['checks'].append({'name': name, 'exitCode': completed.returncode,
                                 'seconds': round(time.monotonic() - started, 3)})
        completed.check_returncode()

    try:
        with tempfile.TemporaryDirectory(prefix='ardesia-integrated-core-') as private:
            private = Path(private)
            run('course-context', ROOT / 'bin/qa/course-context-browser.mjs', {
                **environment, 'ARDESIA_COURSE_CONTEXT_STATE': str(private / 'course-context'),
                'ARDESIA_COURSE_CONTEXT_EVIDENCE': str(output / 'course-context')})
            run('living-sources', ROOT / 'handoffs/swarm-v2/S18/proof/browser.mjs', {
                **environment, 'ARDESIA_S18_PROOF_STATE': str(private / 's18'),
                'ARDESIA_S18_FRONTEND': str(ROOT / 'apps/web/dist'),
                'ARDESIA_S18_EVIDENCE': str(output / 'living-sources'),
                'ARDESIA_S18_OUTPUTS': str(output / 'living-sources')})
            for name, scripts in [('journey', ['browser.mjs']), ('recovery', ['recovery.mjs', 'dialog.mjs'])]:
                env = {**environment, 'PYTHONPATH': 'packages/engine:services/study-api:plugins/s19-circuit-lab',
                       'S20_PRIVATE_DIR': str(private / name), 'S20_FRONTEND': str(ROOT / 'apps/web/dist'),
                       'S20_ORIGIN': 'http://127.0.0.1:5460', 'S20_EVIDENCE_DIR': str(output / name)}
                with (output / f'{name}-server.log').open('w') as log:
                    server = subprocess.Popen([python, '-m', 'uvicorn', 'server:app', '--app-dir', str(S20),
                                               '--host', '127.0.0.1', '--port', '5460'],
                                              cwd=ROOT, env=env, stdout=log, stderr=subprocess.STDOUT)
                    try:
                        for _ in range(100):
                            if server.poll() is not None:
                                raise RuntimeError('owned_fixture_server_failed')
                            try:
                                urlopen(env['S20_ORIGIN'] + '/study/me', timeout=1)
                            except HTTPError as error:
                                if error.code == 401:
                                    break
                            except OSError:
                                pass
                            time.sleep(.1)
                        else:
                            raise RuntimeError('owned_fixture_server_not_ready')
                        for script in scripts:
                            run(name + '-' + Path(script).stem, S20 / script, env)
                    finally:
                        server.terminate()
                        try:
                            server.wait(timeout=10)
                        except subprocess.TimeoutExpired:
                            server.kill()
                            server.wait()
        if inventory() != before or subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip() != head:
            raise RuntimeError('source_or_build_changed_during_verification')
        result['status'] = 'PASS'
    except Exception as error:
        result['status'] = 'FAIL'
        result['error'] = str(error)
        raise
    finally:
        (output / 'result.json').write_text(json.dumps(result, indent=2) + '\n')


if __name__ == '__main__':
    main()
