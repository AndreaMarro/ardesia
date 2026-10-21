"""Run the exam autosave contract against a temporary real Study API.

Exit status is Vitest's status: an unfixed regression remains a failing test.
No dependencies are installed and no repository files are modified by this runner.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo-root', default=os.environ.get('ARDESIA_REPO_ROOT'))
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--node-modules', type=Path)
    parser.add_argument('--python', default=sys.executable)
    parser.add_argument('--port', type=int, default=0, help='Loopback port; 0 chooses a free port.')
    args = parser.parse_args()
    if not args.repo_root:
        parser.error('--repo-root or ARDESIA_REPO_ROOT is required')
    if not 0 <= args.port <= 65535:
        parser.error('--port must be between 0 and 65535')
    repo = Path(args.repo_root).resolve()
    here = Path(__file__).resolve().parent
    modules = (args.node_modules or here / 'node_modules').resolve()
    out = args.output_dir.resolve()
    paths = [
        'apps/web/src/features/Exam.tsx',
        'apps/studio/src/study/apiClient.ts',
        'packages/engine/lessonos/study/exam.py',
        'services/study-api/study_api/app.py',
    ]
    for relative in paths:
        if not (repo / relative).is_file():
            parser.error(f'missing source: {relative}')
    if not (modules / '.bin/vitest').is_file():
        parser.error('Vitest is missing; run npm ci in the probe directory or supply --node-modules')
    out.mkdir(parents=True, exist_ok=True)
    revision = subprocess.run(['git', '-C', str(repo), 'rev-parse', 'HEAD'], capture_output=True, text=True)
    metadata = {
        'sourceSha': revision.stdout.strip() if revision.returncode == 0 else 'UNKNOWN',
        'sourceHashesSha256': {relative: hashlib.sha256((repo / relative).read_bytes()).hexdigest() for relative in paths},
        'pythonExecutable': args.python,
    }
    (out / 'source-metadata.json').write_text(json.dumps(metadata, indent=2) + '\n')
    env = dict(os.environ)
    env['PYTHONPATH'] = os.pathsep.join(filter(None, [str(repo / 'packages/engine'), str(repo / 'services/study-api'), env.get('PYTHONPATH')]))
    env['ARDESIA_REPO_ROOT'] = str(repo)
    env['ARDESIA_PROBE_OUTPUT_DIR'] = str(out)
    env['ARDESIA_PROBE_SOURCE_METADATA'] = str(out / 'source-metadata.json')
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    result_code = 2
    with tempfile.TemporaryDirectory(prefix='ardesia-exam-autosave-') as temporary:
        temp = Path(temporary)
        for name in ('package.json', 'vite.config.ts', 'ui-race.test.tsx'):
            shutil.copyfile(here / name, temp / name)
        (temp / 'node_modules').symlink_to(modules, target_is_directory=True)
        runtime = temp / 'runtime.json'
        env['ARDESIA_PROBE_RUNTIME_JSON'] = str(runtime)
        server = subprocess.Popen(
            [args.python, str(here / 'server.py'), '--directory', str(temp / 'database'), '--runtime-json', str(runtime), '--port', str(args.port)],
            env=env, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True,
        )
        try:
            deadline = time.monotonic() + 10
            while time.monotonic() < deadline:
                if server.poll() is not None:
                    raise RuntimeError('Synthetic API exited before startup: ' + (server.stderr.read() if server.stderr else ''))
                if runtime.is_file():
                    info = json.loads(runtime.read_text())
                    try:
                        opener.open(info['baseUrl'] + '/study/health', timeout=.25).read()
                        break
                    except OSError:
                        pass
                time.sleep(.1)
            else:
                raise RuntimeError('Synthetic loopback API startup timed out')
            result = subprocess.run(
                [str(modules / '.bin/vitest'), 'run', '--config', str(temp / 'vite.config.ts')],
                cwd=temp, env=env, capture_output=True, text=True, timeout=45,
            )
            log = result.stdout + result.stderr
            (out / 'vitest.log').write_text(log)
            print(log)
            result_code = result.returncode
        finally:
            server.terminate()
            try:
                _, server_error = server.communicate(timeout=5)
            except subprocess.TimeoutExpired:
                server.kill()
                _, server_error = server.communicate()
            if server_error:
                (out / 'server-stderr.log').write_text(server_error)
            (out / 'run-result.json').write_text(json.dumps({
                'exitCode': result_code,
                'status': 'PASS' if result_code == 0 else 'FAIL',
                'serverStopped': server.poll() is not None,
                'runtime': 'Real Exam.tsx + React/jsdom + loopback FastAPI + SQLite; transport ordering injected, responses not mocked.',
            }, indent=2) + '\n')
    return result_code


if __name__ == '__main__':
    raise SystemExit(main())
