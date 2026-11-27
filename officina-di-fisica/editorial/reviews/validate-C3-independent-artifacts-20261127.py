"""Verify saved evidence identities without rerendering or granting acceptance."""
from pathlib import Path
import hashlib, json
BASE = Path(__file__).resolve().parent
def load(path):
    return json.loads(path.read_bytes())
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
original = BASE / 'C3-36-cb9-current-run45917299096-independent-20261127'
receipt = load(original / 'archive-reading-receipt.json')
for row in receipt['selectedCases']:
    assert sha(original / row['file']) == row['sha256']
for row in receipt['selectedPngFiles']:
    assert sha(original / row['file']) == row['sha256']
assert len(receipt['selectedCases']) == 225
assert len(receipt['selectedPngFiles']) == 200
assert len(receipt['priority56Cases']) == 56
assert len(receipt['independentMathematicalCrossChecks']) == 151
review = load(original / 'independent-per-id-review.json')
assert len(review['records']) == len({r['id'] for r in review['records']}) == 36
assert len(review['actualSetupQuestionsAccepted']) == 74
assert not review['overallAcceptanceGranted'] and review['activityCredit'] == 0
for name in ('C3-36-cb9-current-run45917299096-independent-20261127', 'C3-36-thermal-detail-independent-20261127', 'C3-36-thermal-detail-984-independent-20261127'):
    folder = BASE / name
    for row in load(folder / 'git-inputs.json')['inputs']:
        assert len(row['commit']) == 40 and Path(row['snapshot']).name == row['snapshot']
        assert sha(folder / row['snapshot']) == row['sha256']
    if name != original.name:
        math = load(folder / 'actual-fresh-math-review.json')
        assert math['mathematicsPassCount'] == 36
        assert all(r['sourceMathAndActualTasksOk'] for r in math['records'])
        images = load(folder / 'raster-reading.json')['imagesActuallyRead']
        assert len(images) == 9
        for row in images:
            assert sha(folder / row['file']) == row['sha256']
        browser = load(folder / 'author-actual-browser-report.json')
        terminal = load(folder / 'author-actual-browser-terminal.json')
        assert terminal['observedExit'] == 0 and len(browser['actual']) == 80
        assert terminal['reportSha256'] == sha(folder / 'author-actual-browser-report.json')
final = load(BASE / 'C3-36-thermal-detail-984-independent-20261127/independent-conclusion.json')
assert final['actualStates'] == 1369 and len(final['declaredDetails']) == 22
assert final['sevenPreviouslyOmittedNonzeroTransfersHaveSeparateDeclaredDetail']
assert final['physicalZeroStatesWithoutDetail'] == 61
assert not final['oldRedFilesRetagged'] and not final['overallActivityAcceptanceGranted']
print('Saved identities verified: 225 cases, 200 PNGs, 36 per-ID reviews, two separate 80-case thermal epochs; no acceptance or publication granted')
