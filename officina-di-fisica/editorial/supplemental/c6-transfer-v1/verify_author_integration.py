"""Run the existing importer and adaptive checks in a disposable database."""
import hashlib
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from tools.corpus_engineering.integration import COHORT_CODE, exercise_package

HERE = Path(__file__).resolve().parent
APP = HERE.parents[2]
PACKAGE = HERE / 'package.json'


def verify():
    original = PACKAGE.read_bytes()
    checksum = hashlib.sha256(original).hexdigest()
    sources = json.loads((APP / 'editorial/reviews/full-corpus-work-status-20261126.json').read_bytes())
    records = json.loads(original)['records']
    assert len(sources['questions']) == 4606
    assert {r['id'] for r in records}.isdisjoint({s['id'] for s in sources['questions']})
    assert len({r['family'] for r in records}) == 5 and all(not r.get('exam') for r in records)
    structural = exercise_package(PACKAGE)
    assert structural['firstImport']['saved'] == 5 and structural['repeatedImport']['unchanged'] == 5
    with tempfile.TemporaryDirectory(prefix='cric-c6-transfer-') as data:
        result = subprocess.run(
            [sys.executable, '-c', COHORT_CODE, json.dumps([str(PACKAGE)])], cwd=APP,
            env={**os.environ, 'ASTRA_DATA': data, 'ASTRA_HOSTED': '0', 'ASTRA_EXTENSIONS': str(APP / 'extensions')},
            capture_output=True, text=True, timeout=60, check=True,
        )
    cohort = json.loads(result.stdout)
    assert cohort['firstImportSaved'] == 5 and cohort['repeatedImportSaved'] == 0
    assert cohort['repeatedImportUnchanged'] == 5 and cohort['beforePublishedCount'] == cohort['afterPublishedCount'] == 991
    assert cohort['preservedLiveHeads'] == 0 and cohort['newPublications'] == 0
    assert all(r['delayedDistinctTransfer'] for r in cohort['records'])
    assert PACKAGE.read_bytes() == original
    return {'packageFileSha256': checksum, 'sourceCorpusCredit': 0, 'canonicalImport': structural,
            'syntheticAdaptiveFixtures': cohort, 'independentReview': 'PENDING', 'humanApproval': 'NOT_RUN'}


if __name__ == '__main__':
    result = verify()
    (HERE / 'actual-author-integration.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'importedDrafts': result['syntheticAdaptiveFixtures']['firstImportSaved'],
                      'thirdFamilyFixturePass': len(result['syntheticAdaptiveFixtures']['records']), 'sourceCorpusCredit': 0}))
