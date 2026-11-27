"""Close the eight independently reverified method layouts in the existing registry."""

from collections import Counter
from datetime import datetime, timezone
import json
from pathlib import Path
import runpy

from tools.corpus_engineering import batches, methods_renewal_cb9_verifier
from tools.corpus_engineering.acceptance_withdrawals import acceptance_audit
from tools.corpus_engineering.pipeline import digest, git_bytes, load_checkpoint


BATCH = 'methods-activities-001'
REOPENED = {f'C{course}-M-{mode}' for course in (1, 3, 4, 5) for mode in ('formula', 'graph')}


def sources_from_originals(app):
    _, inventory, _ = load_checkpoint(app / 'editorial/corpus')
    files, sources = {}, {}
    for row in inventory:
        key = row['id']
        if key not in methods_renewal_cb9_verifier.IDS:
            continue
        provenance = row['provenance']
        identity = (provenance['commit'], provenance['path'])
        if identity not in files:
            raw = git_bytes(app.parent, *identity)
            assert batches.sha(raw) == provenance['fileSha256']
            files[identity] = {r['id']: r for r in json.loads(raw)}
        sources[key] = files[identity][key]
        assert digest(sources[key]) == row['sourceSha256']
    return sources


def register():
    app = Path.cwd()
    path = Path(__file__).resolve().parent
    helpers = runpy.run_path('editorial/reviews/cric-c6-register-verified-root-20261127.py')
    load, dump, atomic, sha = (helpers[key] for key in ('load', 'dump', 'atomic', 'sha'))
    registry, work, operations = (helpers[key] for key in ('REGISTRY', 'WORK', 'OPERATIONS'))
    ledger = app / 'editorial/acceptance/withdrawals-v1.json'
    report_file = app / 'editorial/reviews' / (BATCH + '.json')
    before = {file: file.read_bytes() for file in (registry, ledger, report_file, work, operations)}
    registry_data, ledger_data = load(registry), load(ledger)
    spec = next(item for item in registry_data['activityBatches'] if item['id'] == BATCH)
    assert set(spec['activityIds']) == methods_renewal_cb9_verifier.IDS
    assert spec['verifier'] == 'method_activity_verifier'
    prior_report = before[report_file]
    for key in REOPENED:
        try:
            acceptance_audit(spec, {key}, app)
        except ValueError as error:
            assert str(error).startswith('Acceptance withdrawn: ' + key), str(error)
        else:
            raise AssertionError('Previously withdrawn activity was already accepted: ' + key)
    sources = sources_from_originals(app)
    fresh = methods_renewal_cb9_verifier.report(sources, app=app)
    assert fresh == load(path / 'methods-sixteen-current.json')
    assert len(fresh['records']) == fresh['acceptedIndividualCount'] == 16
    assert all(row['ok'] for row in fresh['records'])
    fresh_raw = (batches.canonical(fresh) + '\n').encode()
    fresh_sha = sha(fresh_raw)
    rows = [row for row in ledger_data['withdrawals'] if row['recordId'] in REOPENED]
    assert len(rows) == len(REOPENED) and {row['recordId'] for row in rows} == REOPENED
    at = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    for row in rows:
        assert row['batchId'] == BATCH and 'closure' not in row
        row['closure'] = {
            'recordId': row['recordId'], 'batchId': BATCH,
            'closedAt': at, 'runtimeSha256': fresh['runtimeSha256'],
            'reason': 'Current exact/manual review and new browser sequences at 320 and 1280 px checked the reported overflow, formula layout, keyboard and response flow.',
            'scientificReport': {'path': report_file.relative_to(app).as_posix(), 'sha256': fresh_sha},
            'reviewer': 'Root integrator of the distinct method worksheet review',
        }
    spec['verifier'] = 'methods_renewal_cb9_verifier'
    ledger_raw = dump(ledger_data)
    registry_data['acceptanceWithdrawals']['sha256'] = sha(ledger_raw)
    registry_raw = dump(registry_data)
    status, ops = load(work), load(operations)
    assert status['registrySha256'] == sha(before[registry])
    for activity in status['activities']:
        if activity['id'] in REOPENED:
            assert activity['state'] == 'EXPLICITLY_REOPENED_REQUIRES_FRESH_CLOSURE'
            activity['state'] = 'REVIEWED_PENDING_CURRENT_FULL_INTEGRATION'
    reviewed = sum(row['state'] == 'REVIEWED_PENDING_CURRENT_FULL_INTEGRATION' for row in status['activities'])
    pending = [row['id'] for row in status['activities'] if row['state'] != 'REVIEWED_PENDING_CURRENT_FULL_INTEGRATION']
    assert reviewed == status['reviewedActivities'] + len(REOPENED) and len(pending) + reviewed == 385
    status.update(observedAt=at, registrySha256=sha(registry_raw), reviewedActivities=reviewed,
                  remainingActivities=len(pending),
                  blockedActivityIds=[key for key in status['blockedActivityIds'] if key not in REOPENED])
    activity_ops = ops['activities']
    activity_ops.update(scientificallyReviewedInFeature=reviewed, remaining=len(pending),
                        remainingByCourse=dict(Counter(key.split('-')[1] for key in pending if key.startswith('SIM-'))),
                        explicitlyReopenedIds=[key for key in activity_ops['explicitlyReopenedIds'] if key not in REOPENED])
    ops['observedAt'] = at
    out = path.parent / 'methods-eight-cb9-root-closure-20261127'
    out.mkdir(exist_ok=True)
    for name, raw in [('prior-registry.json', before[registry]), ('prior-ledger.json', before[ledger]),
                      ('prior-methods-science.json', prior_report)]:
        atomic(out / name, raw)
    try:
        atomic(report_file, fresh_raw)
        atomic(ledger, ledger_raw)
        atomic(registry, registry_raw)
        batches.load_registry(registry)
        result = batches.validate_activity_batch(spec, sources, app)
        assert result['sha256'] == fresh_sha and len(result['records']) == 16
        assert {row['recordId'] for row in result['acceptanceWithdrawals']['withdrawals']} == REOPENED
        atomic(work, dump(status))
        atomic(operations, dump(ops))
    except BaseException:
        for file, raw in before.items():
            atomic(file, raw)
        raise
    receipt = {
        'batch': BATCH, 'runtimeSha256': fresh['runtimeSha256'], 'reportSha256': fresh_sha,
        'priorMethodReportSha256': sha(prior_report), 'canonicallyCheckedActivityIds': spec['activityIds'],
        'explicitlyClosedWithdrawals': sorted(REOPENED), 'actualWorksheetSequences': 20,
        'actualWorksheetSteps': 98, 'verifiedCatalogCases': 12, 'registeredActivities': reviewed,
        'remainingActivities': len(pending), 'newRegisteredActivityCredit': len(REOPENED),
        'compiledCheckpointAdvanced': False, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE',
    }
    atomic(out / 'receipt.json', dump(receipt))
    print(f'{BATCH} passed its canonical verifier. {len(REOPENED)} closures, {reviewed}/385 registered.')


if __name__ == '__main__':
    register()
