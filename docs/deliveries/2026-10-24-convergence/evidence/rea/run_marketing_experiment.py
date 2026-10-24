"""Create a NEW local REA run; original archived evidence is never overwritten.

Requires REA 6.7.0, Node, Python and a compatible Chromium executable.
Only the owned marketing preview and its declared navigation are exercised.
"""
import argparse
import functools
import hashlib
import http.server
import json
import os
import pathlib
import shutil
import subprocess
import sys
import threading
import time

HERE = pathlib.Path(__file__).resolve().parent


def find_repo():
    for candidate in HERE.parents:
        if (candidate / 'apps/marketing-01/build.py').is_file():
            return candidate
    raise RuntimeError('Repository not found; provide --repo')


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2) + '\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=pathlib.Path)
    parser.add_argument('--output', type=pathlib.Path, required=True, help='New empty output directory')
    parser.add_argument('--rea-cli', default=os.environ.get('REA_CLI'), help='REA entry point; alternatively REA_CLI or rea on PATH')
    parser.add_argument('--node', default=os.environ.get('REA_NODE_BINARY', 'node'))
    parser.add_argument('--browser', default=os.environ.get('CHROMIUM_EXECUTABLE_PATH'), help='Chromium executable; otherwise REA/Playwright default browser')
    args = parser.parse_args()
    repo = args.repo.resolve() if args.repo else find_repo()
    output = args.output.resolve()
    if output == HERE or HERE in output.parents:
        raise ValueError('Write fresh runs outside the retained evidence directory')
    if output.exists() and any(output.iterdir()):
        raise FileExistsError('Output directory must be empty: ' + str(output))
    entry = args.rea_cli or shutil.which('rea')
    if not entry:
        raise RuntimeError('Set REA_CLI or install the pinned CLI; no installation is performed by this runner')
    entry = str(pathlib.Path(entry).expanduser().resolve())
    cli = [args.node, entry] if entry.endswith(('.mjs', '.cjs', '.js')) else [entry]
    version = subprocess.run(cli + ['--version'], check=True, capture_output=True, text=True).stdout.strip()
    if version != '6.7.0':
        raise RuntimeError('Expected REA 6.7.0, received ' + repr(version))
    if args.browser and not pathlib.Path(args.browser).is_file():
        raise FileNotFoundError(args.browser)
    output.mkdir(parents=True, exist_ok=True)
    artifact = output / 'marketing-artifact'
    build = subprocess.run([sys.executable, str(repo / 'apps/marketing-01/build.py'), '--review-examples', '--output', str(artifact)], cwd=repo, capture_output=True, text=True)
    (output / 'marketing-build-stdout.txt').write_text(build.stdout)
    (output / 'marketing-build-stderr.txt').write_text(build.stderr)
    build.check_returncode()
    emitted = list((artifact / 'assets').glob('site.*.js'))
    if len(emitted) != 1:
        raise RuntimeError('Expected exactly one emitted site script')
    source = repo / 'apps/marketing-01/assets/site.js'
    context = {
        'schema': 'ardesia.rea.fresh-run-context.v1',
        'target_commit': subprocess.run(['git', '-C', str(repo), 'rev-parse', 'HEAD'], check=True, capture_output=True, text=True).stdout.strip(),
        'source_js_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'source_identity_note': 'Current working tree; HEAD alone does not identify uncommitted source edits',
        'artifact_js_relative': str(emitted[0].relative_to(output)),
        'rea_version': version,
        'rea_command': cli,
        'browser_executable': args.browser or 'REA/Playwright default',
        'scope': 'owned local marketing preview; no external links activated',
    }
    write_json(output / 'marketing-experiment-context.json', context)

    def run_stage(label, command):
        started = time.monotonic()
        with (output / f'marketing-{label}-evidence.json').open('w') as stdout, (output / f'marketing-{label}-stderr.txt').open('w') as stderr:
            result = subprocess.run(command, stdout=stdout, stderr=stderr, timeout=100)
        metadata = {'exit_code': result.returncode, 'elapsed_ms': round((time.monotonic() - started) * 1000), 'command': command, 'version': version, 'target': str(artifact)}
        write_json(output / f'marketing-{label}-run.json', metadata)
        result.check_returncode()

    run_stage('static', cli + ['analyze-javascript-application', str(artifact), '--analysis-timeout-ms', '30000', '--max-heap-mb', '256', '--format', 'json'])
    handler = functools.partial(QuietHandler, directory=str(artifact))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    origin = f'http://127.0.0.1:{server.server_port}'
    actions = [
        {'step_id': 'ready', 'action': 'wait_for', 'locator': {'kind': 'css', 'selector': 'h1'}, 'state': 'visible'},
        {'step_id': 'select-fluid-course', 'action': 'click', 'locator': {'kind': 'css', 'selector': '.path-index a[href$="#fluidi-termodinamica"]'}},
        {'step_id': 'open-original-example', 'action': 'click', 'locator': {'kind': 'css', 'selector': '#fluidi-termodinamica .example-teaser'}},
        {'step_id': 'open-hint', 'action': 'click', 'locator': {'kind': 'css', 'selector': '.example-hint > summary'}},
        {'step_id': 'open-reasoning', 'action': 'click', 'locator': {'kind': 'css', 'selector': '.example-reasoning > summary'}},
        {'step_id': 'open-error-explanation', 'action': 'click', 'locator': {'kind': 'css', 'selector': '.example-check > summary'}},
        {'step_id': 'return-to-course', 'action': 'click', 'locator': {'kind': 'css', 'selector': '.example-back'}},
        {'step_id': 'selected-course-ready', 'action': 'wait_for', 'locator': {'kind': 'css', 'selector': 'input[name="course"][value="fluidi-termodinamica"]:checked'}, 'state': 'attached'},
    ]
    for action in actions:
        action['timeout_ms'] = 8000
    browser = {'mode': 'launch', 'headless': True}
    if args.browser:
        browser['executable_path'] = str(pathlib.Path(args.browser).resolve())
    scenario = {
        'browser': browser,
        'start_url': {'url': origin + '/'},
        'environment': {'viewport': {'width': 390, 'height': 844}, 'locale': 'it-IT', 'timezone': 'Europe/Rome', 'reduced_motion': 'reduce'},
        'actions': actions,
        'capture': {'after_each_step': ['url', 'dom', 'accessibility', 'storage'], 'at_end': ['url', 'screenshot', 'dom'], 'events': ['console', 'page-errors', 'network']},
    }
    scenario_path = output / 'marketing-runtime-scenario.json'
    write_json(scenario_path, scenario)
    try:
        run_stage('runtime', cli + ['capture-browser-scenario', str(scenario_path), '--format', 'json'])
    finally:
        server.shutdown()
        server.server_close()
    print(json.dumps({'output': str(output), 'target_commit': context['target_commit'], 'source_js_sha256': context['source_js_sha256'], 'status': 'acquisition-complete; run independent verifier next'}))


if __name__ == '__main__':
    main()
