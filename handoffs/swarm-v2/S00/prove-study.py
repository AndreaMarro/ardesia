"""Run the installed S06 browser contract with a disposable, real Core database.

Use services/study-api/.venv/bin/python, after npm run build:web on a clean HEAD.
Only this process's server is stopped; its temporary database/tokens are removed.
"""
import argparse
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import time
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[3]
parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True, type=Path)
args = parser.parse_args()
output = args.output.resolve()
output.mkdir(parents=True, exist_ok=True)
with socket.socket() as probe:
    probe.bind(('127.0.0.1', 5361))
sha = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
with tempfile.TemporaryDirectory(prefix='s00-study-') as temporary:
    env = {**os.environ, 'PYTHONPATH': 'packages/engine:services/study-api',
           'S06_COMPOSITION_DATA': temporary, 'S06_OUTPUTS': str(output),
           'S06_EXPECTED_SHA': sha,
           'S06_SOURCE_MANIFEST': os.environ.get('S06_SOURCE_MANIFEST',
               str(ROOT / 'handoffs/swarm-v2/S00/study-composition-manifest.json'))}
    with (output / 'api.log').open('w') as log:
        server = subprocess.Popen([sys.executable, '-m', 'uvicorn', 'server:app',
            '--app-dir', 'handoffs/swarm-v2/S06/composition', '--host', '127.0.0.1',
            '--port', '5361'], cwd=ROOT, env=env, stdout=log, stderr=subprocess.STDOUT)
        try:
            deadline = time.monotonic() + 20
            while time.monotonic() < deadline:
                if server.poll() is not None:
                    raise RuntimeError('owned fixture server exited before readiness')
                try:
                    urlopen('http://127.0.0.1:5361/study/me', timeout=1).close()
                except HTTPError as error:
                    if error.code == 401:
                        break
                except URLError:
                    pass
                time.sleep(.1)
            else:
                raise RuntimeError('owned fixture server did not become ready')
            result = subprocess.run(['node', 'handoffs/swarm-v2/S06/composition/browser.mjs'],
                cwd=ROOT, env=env)
        finally:
            server.terminate()
            try:
                server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server.kill()
                server.wait()
sys.exit(result.returncode)
