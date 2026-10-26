"""Read-only review of the source checkout; mutates disposable package copies only.

Default reproduces the owner candidate. --source-init evaluates the actual
science_library/__init__.py from --root, useful after S00 writes the fix.
No domain handlers, results, auth or store implementation are mocked.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import py_compile
import subprocess
import sys
import tempfile

parser = argparse.ArgumentParser()
parser.add_argument('--root', type=Path, default=Path('/Users/andreamarro/Developer/ardesia-s00-20261026/science'))
parser.add_argument('--source-init', action='store_true')
args = parser.parse_args()
engine = args.root / 'packages/engine'
source = (engine / 'lessonos/study/science_library/models.py').read_bytes()
owner_init = '''from hashlib import sha256 as _sha256
from pathlib import Path as _Path
_MODEL_IMPLEMENTATION_SHA256 = _sha256(_Path(__file__).with_name("models.py").read_bytes()).hexdigest()
from .models import evaluate
'''
with tempfile.TemporaryDirectory(prefix='ardesia-review-identity-') as temporary:
    copy = Path(temporary)
    (copy / 'lessonos/study/science_library').mkdir(parents=True)
    for name in ('lessonos/__init__.py', 'lessonos/study/__init__.py', 'lessonos/study/models.py'):
        (copy / name).write_bytes((engine / name).read_bytes())
    init = (engine / 'lessonos/study/science_library/__init__.py').read_text() if args.source_init else owner_init
    (copy / 'lessonos/study/science_library/__init__.py').write_text(init)
    target = copy / 'lessonos/study/science_library/models.py'
    target.write_bytes(source)
    py_compile.compile(str(target), doraise=True, invalidation_mode=py_compile.PycInvalidationMode.TIMESTAMP)
    original = target.stat()
    changed = source.replace(b'k = 9e9', b'k = 8e9')
    assert len(changed) == len(source) and changed != source
    target.write_bytes(changed)
    os.utime(target, ns=(original.st_atime_ns, original.st_mtime_ns))
    script = '''import json,sys
sys.path.insert(0,sys.argv[1])
from lessonos.study import science_library as s
print(json.dumps({"value":s.evaluate("point-charge-v1",{})["value"],"declaredHash":s._MODEL_IMPLEMENTATION_SHA256}))
'''
    process = subprocess.run([sys.executable, '-I', '-c', script, str(copy)], capture_output=True, text=True, check=True, timeout=15)
    actual = json.loads(process.stdout)
    report = {
        'case': 'source changed, TIMESTAMP pyc remains valid by same size and mtime',
        'candidate': 'actual checkout init' if args.source_init else 'owner proposed init',
        'python': sys.version,
        'oldSourceSha256': hashlib.sha256(source).hexdigest(),
        'diskSourceSha256': hashlib.sha256(changed).hexdigest(),
        'expectedValueForDiskSource': 88.88888888888889,
        'actual': actual,
        'identityMatchesExecutedSource': actual['declaredHash'] == hashlib.sha256(changed).hexdigest() and abs(actual['value']-88.88888888888889) < 1e-12,
    }
    print(json.dumps(report, indent=2))
