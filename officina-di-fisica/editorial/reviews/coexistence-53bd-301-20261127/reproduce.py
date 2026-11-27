"""Replay the existing nonempty study-history fixture on the full source register."""
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from tools.corpus_engineering.batches import load_activity_registry, load_registry, reviewed_supplemental_practice
from tools.corpus_engineering.pipeline import canonical, sha
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint

HERE = Path(__file__).resolve().parent
APP = HERE.parents[2]
REVIEWS = APP / 'editorial/reviews'


def verify():
    registry_file = APP / 'editorial/batches/registry.json'
    registry_bytes = registry_file.read_bytes()
    registry = json.loads(registry_bytes)
    fingerprint = runtime_fingerprint(APP)
    question_batches = load_registry(registry_file)
    expected = {key for batch in question_batches for key in batch['questionIds']}
    work = json.loads((REVIEWS / 'full-corpus-work-status-20261126.json').read_bytes())
    assert len(expected) == 4606 and expected == {row['id'] for row in work['questions']}
    assert work['reviewedQuestions'] == 4606 and work['missingQuestionIds'] == []
    assert work['registrySha256'] == sha(registry_bytes)
    activity_batches = load_activity_registry(registry_file)
    names = [batch['id'] for batch in question_batches]
    names += list(dict.fromkeys(batch['revisionPackage'] for batch in activity_batches if batch.get('revisionPackage')))
    packages = [APP / 'editorial/batches' / (name + '.json') for name in names]
    supplemental = reviewed_supplemental_practice(registry, APP)
    assert supplemental, 'Distinct reviewed C6 transfer families must enter the same draft fixture'
    packages.extend(spec['file'] for spec in supplemental.values())
    supplemental_ids = set().union(*(spec['ids'] for spec in supplemental.values()))
    assert len(supplemental_ids) == 5 and expected.isdisjoint(supplemental_ids)
    pins = {str(file.relative_to(APP)): sha(file.read_bytes()) for file in packages}
    previous = REVIEWS / 'registry4200-history-fixture-20261126'
    fixture = (previous / 'actual-augmented-cohort-fixture.py.txt').read_bytes()
    assert sha(fixture) == json.loads((previous / 'receipt.json').read_bytes())['augmentedPrivateFixtureCodeSha256']
    with tempfile.TemporaryDirectory(prefix='cric-registry4606-history-') as data:
        run = subprocess.run(
            [sys.executable, '-B', '-c', fixture.decode(), json.dumps([str(file) for file in packages])], cwd=APP,
            env={**os.environ, 'ASTRA_DATA': data, 'ASTRA_HOSTED': '0', 'ASTRA_EXTENSIONS': str(APP / 'extensions')},
            capture_output=True, timeout=300,
        )
    (HERE / 'actual-stderr.txt').write_bytes(run.stderr)
    if run.returncode:
        raise RuntimeError(run.stderr.decode(errors='replace'))
    result = json.loads(run.stdout)
    assert result['nonemptyHistoricalFixture'] and result['learnerAttemptsBefore'] == result['learnerAttemptsAfter'] == 3
    assert result['pinnedRunItemsRetained'] == 3
    assert result['beforePublishedCount'] == result['afterPublishedCount'] == 991
    assert result['beforePublishedSha256'] == result['afterPublishedSha256']
    assert result['newPublications'] == 0 and result['humanApproval'] == 'NOT_RUN'
    assert result['firstImportSaved'] == result['repeatedImportUnchanged'] == result['candidateCount']
    assert result['repeatedImportSaved'] == 0
    records = result['records']
    assert len(records) == 4611 and {row['id'] for row in records} == expected | supplemental_ids
    assert registry_file.read_bytes() == registry_bytes and runtime_fingerprint(APP) == fingerprint
    assert all(sha((APP / file).read_bytes()) == pin for file, pin in pins.items())
    assert reviewed_supplemental_practice(registry, APP) == supplemental
    (HERE / 'actual-full-coexistence.json').write_bytes(run.stdout)
    receipt = {
        'scope': 'Actual technical coexistence with three pre-existing synthetic sessions. Full source question register and separately verified supplemental practice.',
        'registrySha256': sha(registry_bytes), 'runtimeSha256': fingerprint['sha256'],
        'fixtureSha256': sha(fixture), 'packageFileSha256ByPath': pins, 'questions': 4606,
        'supplementalPractice': 5, 'protectedExamQuestions': 93, 'actualExitCode': run.returncode,
        'recordEvidenceSha256': sha(run.stdout), 'preservedHistoricalFixtures': 3,
        'preservedPublishedRecords': 991, 'humanApproval': 'NOT_RUN', 'newPublications': 0,
    }
    (HERE / 'receipt.json').write_text(canonical(receipt) + '\n')
    print(f'4606 source and 5 supplemental question drafts verified with three preserved private attempts. {result["candidateCount"]} drafts imported.')


if __name__ == '__main__':
    verify()
