"""Register this independently reviewed practice package without source credit."""

import runpy
from pathlib import Path

from tools.corpus_engineering.batches import (
    assert_browser_identity,
    load_registry,
    reviewed_supplemental_practice,
)
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint


def register():
    app = Path.cwd()
    helpers = runpy.run_path('editorial/reviews/cric-c6-register-verified-root-20261127.py')
    load, dump, atomic, sha = (helpers[key] for key in ('load', 'dump', 'atomic', 'sha'))
    registry, work, operations = (helpers[key] for key in ('REGISTRY', 'WORK', 'OPERATIONS'))
    folder = Path(__file__).resolve().parent
    before = registry.read_bytes()
    spec = load(registry)
    package = folder / 'package.json'
    review = folder / 'independent-review.json'
    ids = [row['id'] for row in load(review)['records']]
    entry = {
        'id': 'c6-transfer-v1',
        'questionIds': ids,
        'packageSha256': sha(package.read_bytes()),
        'reviewSha256': sha(review.read_bytes()),
    }
    assert len(ids) == len(set(ids)) == 5
    assert entry['reviewSha256'] == 'e16e3f1e849b5d74d127d31b6889180129ff8bcce795fb5722586e17eb10609b'
    previous = spec.get('supplementalPractice', [])
    assert previous in ([], [entry])
    spec['supplementalPractice'] = [entry]
    raw = dump(spec)
    assert set(reviewed_supplemental_practice(spec, app)) == {entry['id']}
    preview = folder / 'actual-owner-preview-final-cb9'
    assert load(preview / 'terminal.json')['actualExit'] == 0
    report = preview / 'report.json'
    observed = load(report)
    instrument = sha((app / 'tests/corpus/browser-drafts.mjs').read_bytes())
    assert_browser_identity(observed, package, instrument, runtime_fingerprint(app))
    assert len(observed['records']) == 15
    assert {(row['id'], row['width']) for row in observed['records']} == {
        (key, width) for key in ids for width in (320, 768, 1440)
    }
    assert set(observed['protectedAssets']) == {asset['id'] for asset in load(package)['assets']}
    status = load(work)
    source_count = status['reviewedQuestions']
    assert status['registrySha256'] == sha(before)
    if previous:
        assert raw == before
        print('Supplemental registration already valid')
        return
    status['registrySha256'] = sha(raw)
    ops = load(operations)
    ops['supplementalPractice'] = {
        'id': entry['id'], 'independentlyReviewedDrafts': 5, 'sourceInventoryCredit': 0,
        'ownerBrowserCases': 15, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE',
    }
    atomic(registry, raw)
    try:
        assert len({key for row in load_registry() for key in row['questionIds']}) == source_count
    except BaseException:
        atomic(registry, before)
        raise
    atomic(work, dump(status))
    atomic(operations, dump(ops))
    receipt = {
        'scope': 'Five independent supplemental DRAFT exercises outside the source inventory',
        'package': entry, 'priorRegistrySha256': sha(before), 'registrySha256': sha(raw),
        'untouchedSourceRegistrationCount': source_count, 'actualOwnerCases': 15,
        'guestProtectedAssets': 5, 'ownerPreviewSha256': sha(report.read_bytes()),
        'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE',
    }
    atomic(folder / 'root-registration-receipt.json', dump(receipt))
    print('Five supplemental DRAFT records registered. Source registration remains', source_count)


if __name__ == '__main__':
    register()
