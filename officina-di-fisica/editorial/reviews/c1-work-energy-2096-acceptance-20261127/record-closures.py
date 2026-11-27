"""Close the four current C1 withdrawals after whole-cohort canonical validation."""

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import tempfile

from tools.corpus_engineering.acceptance_withdrawals import acceptance_audit, load_ledger
from tools.corpus_engineering.batches import load_activity_registry, load_registry, validate_activity_batch
from tools.corpus_engineering import experiments_force_work_2096_verifier as verifier
from tools.corpus_engineering.pipeline import canonical, sha, write_immutable


APP = verifier.APP
NEW_VERIFIER = 'experiments_force_work_2096_verifier'


def replace(path, raw):
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.' + path.name + '-', delete=False) as stream:
        temporary = Path(stream.name)
        stream.write(raw)
        stream.flush()
        os.fsync(stream.fileno())
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def encode(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def record():
    batch = verifier.physics.BATCH
    reviews = APP / 'editorial/reviews'
    evidence = (APP / verifier.SEAL).parent
    ledger_file = APP / 'editorial/acceptance/withdrawals-v1.json'
    registry_file = APP / 'editorial/batches/registry.json'
    status_file = reviews / 'full-corpus-work-status-20261126.json'
    report_file = reviews / (batch + '.json')
    paths = (ledger_file, registry_file, status_file, report_file)
    ledger_raw, registry_raw, status_raw, report_raw = previous = [path.read_bytes() for path in paths]
    ledger, registry, status = map(json.loads, previous[:3])
    assert registry['acceptanceWithdrawals']['sha256'] == sha(ledger_raw)
    assert status['registrySha256'] == sha(registry_raw)
    sources = {row['id']:row for row in json.loads((APP / 'content/esperienze-C1.json').read_bytes()) if row['id'] in verifier.IDS}
    spec, = [entry for entry in load_activity_registry(registry_file) if entry['id'] == batch]
    if spec != {'id':batch, 'activityIds':sorted(verifier.IDS), 'verifier':spec['verifier']}:
        raise ValueError('Unexpected force and work activity cohort')
    if spec['verifier'] == NEW_VERIFIER:
        assert len(validate_activity_batch(spec, sources, APP)['records']) == len(verifier.IDS)
        return 0
    if spec['verifier'] != 'experiments_force_work_corrected_048_verifier':
        raise ValueError('Unexpected previous C1 activity verifier')

    questions = load_registry(registry_file)
    scientific = verifier.report(sources)
    report_next = (canonical(scientific) + '\n').encode()
    entries = [entry for entry in ledger['withdrawals'] if entry['batchId'] == batch]
    unclosed_entries = [entry for entry in entries if entry.get('closure') is None]
    if {entry['recordId'] for entry in unclosed_entries} != verifier.REOPENED or len(entries) != 6:
        raise ValueError('Unexpected open or historical C1 withdrawals')
    write_immutable(evidence / 'prior-ledger.json', ledger_raw)
    write_immutable(evidence / 'prior-scientific-report.json', report_raw)
    stamp = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    current_report = {'path':report_file.relative_to(APP).as_posix(), 'sha256':sha(report_next)}
    for entry in entries:
        entry['closure'] = {'batchId':batch, 'recordId':entry['recordId'], 'closedAt':stamp,
            'reviewer':'Root integrator of independently reproduced models, manual procedures, and current actual browser review',
            'reason':('Renewed the entire six-ID cohort on the 2096 runtime. The current review covers 296 observed cases, '
                      '96 accepted submissions and all eight views and widths per ID. The two historically closed '
                      'decisions and four reopened cases have current evidence. Prior ledger and report bytes are retained.'),
            'runtimeSha256':scientific['runtimeSha256'], 'scientificReport':current_report}
    new_spec = {**spec, 'verifier':NEW_VERIFIER}
    position = registry['activityBatches'].index(spec)
    registry['activityBatches'][position] = new_spec
    ledger_next = encode(ledger)
    registry['acceptanceWithdrawals']['sha256'] = sha(ledger_next)
    registry_next = encode(registry)
    status['registrySha256'] = sha(registry_next)
    selections = [row for row in status['activities'] if row['id'] in verifier.REOPENED]
    assert len(selections) == len(verifier.REOPENED)
    assert all(row['state'] == 'EXPLICITLY_REOPENED_REQUIRES_FRESH_CLOSURE' for row in selections)
    for row in selections:
        row.update(state='REVIEWED_ORIGINAL_ON_2096_PENDING_CANONICAL', evidence=current_report['path'])
    status['reviewedActivities'] += len(selections)
    status['remainingActivities'] -= len(selections)
    status['blockedActivityIds'] = [key for key in status['blockedActivityIds'] if key not in verifier.REOPENED]
    closure_ids = {entry['withdrawalId'] for entry in entries}
    for item in status['integrationOpenItems']:
        if item['id'] in closure_ids:
            item.update(state='CLOSED_ON_2096_PENDING_CANONICAL_INTEGRATION', resolvedOnCurrentRuntime=scientific['runtimeSha256'])
    if [path.read_bytes() for path in paths] != previous:
        raise ValueError('Another writer changed the active C1 cohort')
    try:
        for path, raw in zip(paths, (ledger_next, registry_next, encode(status), report_next), strict=True):
            replace(path, raw)
        assert load_registry(registry_file) == questions
        assert len(load_ledger(APP)['withdrawals']) == len(ledger['withdrawals'])
        assert len(acceptance_audit(new_spec, verifier.IDS, APP)['withdrawals']) == len(entries)
        assert len(validate_activity_batch(new_spec, sources, APP)['records']) == len(verifier.IDS)
    except Exception:
        for path, raw in zip(paths, previous, strict=True):
            replace(path, raw)
        raise
    receipt = {'batch':batch, 'runtimeSha256':scientific['runtimeSha256'], 'renewedIds':sorted(verifier.IDS),
               'closedNowIds':sorted(verifier.REOPENED), 'historicalClosureRenewals':len(entries)-len(unclosed_entries),
               'scientificReportSha256':current_report['sha256'], 'priorLedgerSha256':sha(ledger_raw),
               'priorReportSha256':sha(report_raw), 'registrySha256':status['registrySha256'],
               'registeredWithEvidence':status['reviewedActivities'], 'openActivities':status['remainingActivities'],
               'canonicalIntegration':'PENDING', 'humanApproval':'NOT_RUN', 'publicationAction':'NONE'}
    write_immutable(evidence / 'registration-receipt.json', encode(receipt))
    return len(selections)


if __name__ == '__main__':
    print(record())
