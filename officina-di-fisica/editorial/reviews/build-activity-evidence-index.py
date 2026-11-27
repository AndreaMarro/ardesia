"""Reconcile the frozen per-ID science inventory and the authentic browser result."""

import argparse
from collections import Counter
from hashlib import sha256
import json
from pathlib import Path

from tools.corpus_engineering.pipeline import digest


def load(file):
    return json.loads(file.read_bytes())


def sha(file):
    return sha256(file.read_bytes()).hexdigest()


def build(app):
    reviews = app / 'editorial/reviews'
    evidence = reviews / 'visibility139-cb9-run45917299096-20261127'
    aggregate = load(evidence / 'terminal-all-courses.json')
    assert aggregate['scientificActivityAcceptanceGranted'] == 0
    found = []
    all_observed_keys = set()
    for course in ('C2', 'C3', 'C4', 'C5', 'C6'):
        current = evidence / course
        receipt = load(current / 'receipt.json')
        assert sha(current / 'receipt.json') == aggregate['courses'][course]['receiptSha256']
        assert sha(current / 'report.json') == receipt['reportSha256']
        prepared = load(current / 'prepared.json')
        report = load(current / 'report.json')
        source = {item['id']: item for item in load(app / 'content' / f'esperienze-{course}.json')}
        rows = prepared['records']
        assert len({(row['id'], row['variant']) for row in rows}) == len(rows)
        originals = {row['id']: row for row in rows if row['variant'] == 'published'}
        assert set(source) == set(originals) == set(receipt['recordIds'])
        observed = {row['caseKey'] for row in report['cases'] if row['technicalOk'] is True}
        assert len(observed) == len(report['cases']) == receipt['observedCases']
        assert observed == set(prepared['expectedCaseKeys']) and not observed.intersection(all_observed_keys)
        all_observed_keys.update(observed)
        cube = Counter(tuple(key.split('|', 2)[:2]) for key in observed)
        for key, source_row in sorted(source.items()):
            original = originals[key]
            judgment = original['originalJudgment']
            original_sha = digest(source_row)
            assert original['record'] == source_row and original['sourceSha256'] == original_sha
            assert judgment['sourceSha256'] == original_sha and judgment['id'] == key
            revisions = []
            for draft in [row for row in rows if row['id'] == key and row['variant'] == 'draft']:
                assert draft['candidateSha256'] == digest(draft['record'])
                assert draft['record']['baseVersion'] == source_row['version']
                revisions.append({'version': draft['record']['version'], 'recordSha256': draft['candidateSha256'],
                                  'authenticTechnicalCases': cube[(key, 'draft')], 'applicationStatus': 'DRAFT'})
            found.append({
                'id': key, 'course': course, 'sourceSha256': original_sha, 'sourceVersion': source_row['version'],
                'sourcePath': judgment['sourcePath'], 'sourceRef': judgment['sourceRef'],
                'independentSciencePath': judgment['reviewPath'],
                'independentScienceSha256': judgment['reviewFileSha256'],
                'originalRecordedScientificFinding': judgment['sourceScientificFailure'],
                'originalRecordedManualityFinding': judgment['sourceManualityFailure'],
                'originalRecordedManualSupportGap': judgment['manualSupportGap'],
                'actualAssignedTaskCount': len(judgment['actualAssignedTasks']),
                'authenticOriginalTechnicalCases': cube[(key, 'published')],
                'technicalArtifactReceipt': str((current / 'receipt.json').relative_to(app)),
                'runtimeSha256': aggregate['runtimeSha256'], 'separateObservedDrafts': revisions,
                'editorialAcceptance': 'PENDING_CURRENT_PER_ID_REVIEW',
            })
    assert len(found) == len({row['id'] for row in found}) == aggregate['sourceIds'] == 139
    assert len(all_observed_keys) == aggregate['actualCases'] == 45576
    assert sum(row['authenticOriginalTechnicalCases'] + sum(
        draft['authenticTechnicalCases'] for draft in row['separateObservedDrafts']
    ) for row in found) == len(all_observed_keys)
    return {'schemaVersion': '1.0.0', 'runId': aggregate['runId'], 'runtimeSha256': aggregate['runtimeSha256'],
            'sourceActivities': len(found), 'observedTechnicalCases': len(all_observed_keys),
            'scope': 'Archived technical cases with prior source science per edition. The live closure ledger retains independent acceptance decisions.',
            'records': found, 'activityCredit': 0, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    arguments = parser.parse_args()
    data = build(Path.cwd())
    arguments.output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print(data['sourceActivities'], data['observedTechnicalCases'])
