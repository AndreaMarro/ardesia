"""Reconcile the recorded controls and answers against the bounded C1 plan."""

from collections import Counter
import json
from pathlib import Path
import sys

from tools.corpus_engineering import experiment_visibility_request as protocol
from tools.corpus_engineering.pipeline import sha


def check(raw):
    prepared = json.loads((raw / 'prepared.json').read_bytes())
    request = json.loads((raw / 'request.json').read_bytes())
    report = protocol.verify_report(raw, prepared, request['collectorSha256'])
    planned = protocol.planned_interactions(prepared)
    assert report['guestIsolation'] == 'ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403'
    owner = report['fullOwnerRecordIdentity']['records']
    assert [(row['id'], row['version']) for row in owner] == [('SIM-C1-L001-06', 2)]

    total = Counter()
    per_id = {}
    for item in report['cases']:
        case = json.loads((raw / item['file']).read_bytes())
        definition, state = planned[item['caseKey']]
        protocol.verify_planned_interaction(case, definition, state)
        counts = per_id.setdefault(definition['id'], Counter())
        total['cases'] += 1
        if state is None:
            assert case['axe'] == []
            assert len(case['questions']) == 2
            assert all(q['status'].startswith('Corretto. ') and q['actualPrompt'] for q in case['questions'])
            counts.update({'setups':1, 'correctAssignedAnswers':2})
            total.update({'setups':1, 'correctAssignedAnswers':2})
        else:
            counts[state['kind']] += 1
            total[state['kind']] += 1
    assert (total['cases'], total['setups'], total['correctAssignedAnswers']) == (552, 96, 192)
    return {
        'sourceCommit':report['sourceCommit'], 'runtimeSha256':report['runtimeFingerprint']['sha256'],
        'rawReportSha256':sha((raw / 'report.json').read_bytes()),
        'preparedSha256':sha((raw / 'prepared.json').read_bytes()),
        'technicalCases':dict(total), 'perId':{k:dict(v) for k, v in sorted(per_id.items())},
        'strictObservedControlValidation':True, 'ownerDraftIsolation':report['guestIsolation'],
        'explicitReopenedIds':['SIM-C1-L006-03', 'SIM-C1-L007-01', 'SIM-C1-L007-02', 'SIM-C1-L007-03'],
        'reviewState':'TECHNICAL_EVIDENCE_FRESH_INDEPENDENT_RASTER_REVIEW_PENDING', 'activityCredit':0,
        'humanApproval':'NOT_RUN', 'publicationAction':'NONE',
    }


if __name__ == '__main__':
    print(json.dumps(check(Path(sys.argv[1])), indent=2))
