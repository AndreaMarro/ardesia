"""Capture the thermal preview's actual terminal state on one runtime."""

import argparse
import fcntl
import json
import os
from pathlib import Path
import shutil
import subprocess
import time

from tools.corpus_engineering.pipeline import sha
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint


def main():
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('--runtime', required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    app = Path.cwd()
    output = args.output.resolve()
    output.mkdir()
    protocol = Path(__file__).with_name('browser-thermal-detail.mjs').resolve()
    with open('/private/tmp/cric-bounded-local-work.lock', 'a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        assert shutil.disk_usage(app).free >= 2 * 1024**3
        before = runtime_fingerprint(app)
        assert before['sha256'] == args.runtime
        start = time.monotonic()
        with (output/'actual-process.txt').open('wb') as log:
            run = subprocess.run(['node', str(protocol), str(output)], cwd=app, env=os.environ,
                                 stdout=log, stderr=subprocess.STDOUT, timeout=600)
        after = runtime_fingerprint(app)
    report = output/'report.json'
    terminal = {'observedExit': run.returncode, 'runtimeBefore': before['sha256'],
                'runtimeAfter': after['sha256'], 'protocolSha256': sha(protocol.read_bytes()),
                'reportSha256': sha(report.read_bytes()) if report.exists() else None,
                'durationSeconds': time.monotonic() - start}
    (output/'terminal.json').write_text(json.dumps(terminal, indent=2) + '\n')
    assert before == after
    if report.exists():
        data = json.loads(report.read_bytes())
        print(data['status'], len(data['actual']), data.get('failure'), flush=True)
    raise SystemExit(run.returncode)


if __name__ == '__main__':
    main()
