"""Run 7+7 inventory tests with only two frozen raw MD files physically absent.

Each original is moved to a private temporary directory, hash-checked before
running, and restored byte-for-byte in a finally block. No ROOT file is touched.
The expected hashes come from the existing exact archive transport allowlist.
"""
from pathlib import Path
import fcntl
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile

APP = Path(__file__).resolve().parents[3]
BASE = Path(__file__).resolve().parent
sys.path.insert(0, str(APP))
sys.dont_write_bytecode = True


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main(label):
    from tools.corpus_engineering.frozen_text_evidence import ALLOWLIST
    assert label in ('red-before-fix', 'green-after-fix')
    assert shutil.disk_usage(APP).free >= 2 * 1024**3
    backup = Path(tempfile.mkdtemp(prefix='cric-exact-raw-preserve-', dir='/private/tmp'))
    moved = []
    receipt = {'label': label, 'app': str(APP), 'rawFiles': [],
               'rootTouched': False, 'activityCredit': 0, 'newUiCases': 0,
               'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
    try:
        for number, (name, pin) in enumerate(ALLOWLIST.items()):
            original = APP / name
            entry = {'path': name, 'sha256': pin, 'initiallyPresent': original.exists()}
            if original.exists():
                assert original.is_file() and not original.is_symlink()
                assert sha(original.read_bytes()) == pin
                saved = backup / str(number)
                os.replace(original, saved)
                moved.append((original, saved, pin))
                assert sha(saved.read_bytes()) == pin
            assert not original.exists()
            receipt['rawFiles'].append(entry)
        proc = subprocess.run([sys.executable, '-m', 'unittest',
                               'tests.corpus.test_partial_activity_inventory',
                               'tests.corpus.test_frozen_text_evidence', '-v'],
                              cwd=APP, env={**os.environ, 'PYTHONDONTWRITEBYTECODE': '1'},
                              stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        (BASE / (label + '.txt')).write_bytes(proc.stdout)
        receipt.update({'exitCode': proc.returncode,
                        'logSha256': sha(proc.stdout),
                        'ordinaryRawFilesAbsentThroughoutTest': True})
    finally:
        for original, saved, pin in reversed(moved):
            assert sha(saved.read_bytes()) == pin
            assert not original.exists(), 'Refuse to overwrite a concurrently created file'
            os.replace(saved, original)
            assert sha(original.read_bytes()) == pin
        # The backup directory is removed only if all exact originals restored.
        backup.rmdir()
        receipt['restoredOriginalsByteIdentical'] = True
        (BASE / (label + '-receipt.json')).write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt, sort_keys=True))
    if label == 'red-before-fix':
        assert proc.returncode != 0, 'Expected meaningful clean-checkout regression'
    else:
        assert proc.returncode == 0, proc.stdout.decode(errors='replace')[-1800:]


if __name__ == '__main__':
    with open('/private/tmp/cric-bounded-local-work.lock', 'a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        main(sys.argv[1])
