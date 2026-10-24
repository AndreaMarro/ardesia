"""Independent immutable scheduling oracle; synthetic local fixtures, no deploy."""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import tempfile

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd()
OUT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'bin/web'))
spec = importlib.util.spec_from_file_location('independent_vercel_prepare', ROOT / 'bin/web/prepare_vercel_preview.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
digest = lambda value: hashlib.sha256(value).hexdigest()


def fixture(parent):
    candidate = parent / 'candidate'
    (candidate / 'public/esperienza').mkdir(parents=True)
    files = {
        'public/index.html': '<!doctype html><title>Independent</title>',
        'public/esperienza/index.html': '<!doctype html><title>Lesson</title>',
        'public/404.html': '<!doctype html><title>Missing</title>',
        'public/robots.txt': 'User-agent: *\nDisallow: /\n',
        'public/_headers': module.check.__globals__['exported_headers'](),
        'public/source-manifest.json': json.dumps({'examples': []}),
    }
    for name, value in files.items():
        (candidate / name).write_text(value)
    empty = digest(b'')
    manifest = {
        'assetsSha256': {str(path.relative_to(candidate)): digest(path.read_bytes()) for path in candidate.rglob('*') if path.is_file()},
        'source': {'commit': '6f19b1956cedbebf36a5cf097af66e47ed8acecd', 'sourceTreeSha256': empty, 'trackedDiffSha256': empty, 'sourceFileCount': 0},
        'privateBeta': False, 'privateDataIncluded': False,
    }
    (candidate / 'candidate-manifest.json').write_text(json.dumps(manifest))
    (candidate / 'source-manifest.json').write_text(json.dumps({'files': {}, 'sha256': empty}))
    return candidate


original_check = module.check
with tempfile.TemporaryDirectory(dir=OUT, prefix='vercel-race-') as temporary:
    parent = Path(temporary)
    candidate = fixture(parent)
    control = module.prepare(candidate, parent / 'control-output')
    before_manifest = digest((candidate / 'candidate-manifest.json').read_bytes())
    inserted = 'public/study/private.sqlite'

    def mutate_after_verified(candidate_path):
        result = original_check(candidate_path)
        assert result['technicalStatus'] == 'PASS'
        path = candidate_path / inserted
        path.parent.mkdir()
        path.write_bytes(b'SQLite format 3\x00SYNTHETIC_LOCAL_SENTINEL')
        manifest_path = candidate_path / 'candidate-manifest.json'
        manifest = json.loads(manifest_path.read_text())
        manifest['assetsSha256'][inserted] = digest(path.read_bytes())
        manifest_path.write_text(json.dumps(manifest))
        return result

    module.check = mutate_after_verified
    rejected = False
    error_type = None
    receipt = None
    output = parent / 'attacked-output'
    try:
        receipt = module.prepare(candidate, output)
    except (ValueError, OSError, KeyError) as error:
        rejected, error_type = True, type(error).__name__
    result = {
        'scope': 'Synthetic local controlled scheduling between verification and copy; no external service, credentials or deployment.',
        'codeSha256': digest((ROOT / 'bin/web/prepare_vercel_preview.py').read_bytes()),
        'control': {'prepared': control['deploymentPerformed'] is False, 'releaseStatus': control['releaseStatus'], 'privateBetaIncluded': control['privateBetaIncluded']},
        'mutationRejected': rejected,
        'errorType': error_type,
        'outputExists': output.exists(),
        'unverifiedPrivateDatabaseCopied': (output / '.vercel/output/static/study/private.sqlite').exists(),
        'receiptBoundToOldManifest': receipt is not None and receipt['binding']['candidateManifestSha256'] == before_manifest,
        'currentManifestDiffersFromReceipt': receipt is not None and receipt['binding']['candidateManifestSha256'] != digest((candidate / 'candidate-manifest.json').read_bytes()),
        'postMutationCheckerStatus': original_check(candidate)['technicalStatus'],
        'postMutationCheckerErrors': original_check(candidate)['errors'],
    }
(OUT / 'vercel-prepare-race.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
assert result['mutationRejected'], 'Unverified candidate mutation must be rejected'
assert not result['unverifiedPrivateDatabaseCopied'], 'Rejected private data must not remain in prepared output'
