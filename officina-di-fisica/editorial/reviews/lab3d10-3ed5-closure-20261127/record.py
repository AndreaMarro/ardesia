"""Close the observed wave display withdrawal with the current five-bench report."""

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import tempfile

from tools.corpus_engineering import bench_fields_optics_renewal_3ed5_verifier as verifier
from tools.corpus_engineering.acceptance_withdrawals import acceptance_audit, load_ledger
from tools.corpus_engineering.batches import load_activity_registry, load_registry, validate_activity_batch
from tools.corpus_engineering.pipeline import sha, write_immutable


APP = verifier.APP
EVIDENCE = Path(__file__).resolve().parent
KEY = 'LAB3D-10'
WITHDRAWAL = 'lab3d10-oscillating-zero-display-20261127'
BATCH = 'bench-fields-optics-036'
NEW_VERIFIER = 'bench_fields_optics_renewal_3ed5_verifier'
PEER_REPORT_SHA = '1d6e192fb3fe7dfdd2684b03994f52fe8f2e5d02b85cc964bc10f9ebfe549ac2'


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
    editorial = APP / 'editorial'
    ledger_file = editorial / 'acceptance/withdrawals-v1.json'
    registry_file = editorial / 'batches/registry.json'
    status_file = editorial / 'reviews/full-corpus-work-status-20261126.json'
    report_file = editorial / 'reviews' / (BATCH + '.json')
    paths = (ledger_file, registry_file, status_file, report_file)
    previous = [path.read_bytes() for path in paths]
    ledger, registry, status = map(json.loads, previous[:3])
    assert registry['acceptanceWithdrawals']['sha256'] == sha(previous[0])
    assert status['registrySha256'] == sha(previous[1])
    spec, = [row for row in load_activity_registry(registry_file) if row['id'] == BATCH]
    sources = {row['id']:row for row in json.loads((APP / 'content/banchi.json').read_bytes()) if row['id'] in verifier.IDS}
    if spec['verifier'] == NEW_VERIFIER:
        assert len(validate_activity_batch(spec, sources, APP)['records']) == 5
        return 0
    assert set(spec['activityIds']) == verifier.IDS and spec['verifier'] == 'bench_fields_optics_activity_verifier'
    questions = load_registry(registry_file)
    withdrawal, = [row for row in ledger['withdrawals'] if row['withdrawalId'] == WITHDRAWAL]
    assert withdrawal['recordId'] == KEY and withdrawal['batchId'] == BATCH and withdrawal.get('closure') is None

    peer_report = (verifier.BASE / 'scientific-report.json').read_bytes()
    if sha(peer_report) != PEER_REPORT_SHA or json.loads(peer_report) != verifier.report(sources):
        raise ValueError('The independently delivered five-bench report did not replay on the current runtime')
    write_immutable(EVIDENCE / 'prior-ledger.json', previous[0])
    write_immutable(EVIDENCE / 'prior-scientific-report.json', previous[3])
    new_spec = {**spec, 'verifier':NEW_VERIFIER}
    report_reference = {'path':report_file.relative_to(APP).as_posix(), 'sha256':PEER_REPORT_SHA}
    closure_time = datetime.now(timezone.utc).isoformat().replace('+00:00','Z')
    withdrawal['closure'] = {'recordId':KEY, 'batchId':BATCH, 'closedAt':closure_time,
        'reviewer':'Root integrator of the distinct current browser and scientific report',
        'reason':('The renewed group has five positive original decisions. All 14 exact quarter-period crossings show '
                  'zero in the installed native and fallback views. The separate 98-case review observes signs, '
                  'antinodes, permanent nodes and accessible readings on the same runtime.'),
        'runtimeSha256':verifier.RUNTIME, 'scientificReport':report_reference}
    registry['activityBatches'][registry['activityBatches'].index(spec)] = new_spec
    ledger_next = encode(ledger)
    registry['acceptanceWithdrawals']['sha256'] = sha(ledger_next)
    registry_next = encode(registry)
    status['registrySha256'] = sha(registry_next)
    activity, = [row for row in status['activities'] if row['id'] == KEY]
    assert activity['state'] == 'EXPLICITLY_REOPENED_REQUIRES_FRESH_CLOSURE'
    activity.update(state='REVIEWED_ORIGINAL_ON_3ED5_PENDING_CANONICAL', evidence=report_reference['path'])
    status['reviewedActivities'] += 1
    status['remainingActivities'] -= 1
    status['blockedActivityIds'].remove(KEY)
    queue_item, = [row for row in status['integrationOpenItems'] if row['id'] == WITHDRAWAL]
    queue_item.update(state='CLOSED_ON_3ED5_PENDING_CANONICAL_INTEGRATION', resolvedOnCurrentRuntime=verifier.RUNTIME)

    if [path.read_bytes() for path in paths] != previous:
        raise ValueError('Another writer modified the wave registration inputs')
    try:
        for path, raw in zip(paths, (ledger_next, registry_next, encode(status), peer_report), strict=True):
            replace(path, raw)
        assert load_registry(registry_file) == questions
        assert len(load_ledger(APP)['withdrawals']) == len(ledger['withdrawals'])
        checked = validate_activity_batch(new_spec, sources, APP)
        assert len(checked['records']) == 5
        assert len(acceptance_audit(new_spec, verifier.IDS, APP)['withdrawals']) == 1
    except Exception:
        for path, raw in zip(paths, previous, strict=True):
            replace(path, raw)
        raise
    receipt = {'closedId':KEY, 'batch':BATCH, 'runtimeSha256':verifier.RUNTIME,
        'independentDeliveryCommit':'e12634445f0fc20a3ba26395531e5cca2f7b858c',
        'scientificReportSha256':PEER_REPORT_SHA, 'priorLedgerSha256':sha(previous[0]), 'priorReportSha256':sha(previous[3]),
        'verifiedOriginalIds':sorted(verifier.IDS), 'exactZeroProfiles':14, 'browserCases':148, 'clockObservations':56,
        'registeredAcrossEvidenceEpochs':status['reviewedActivities'], 'openActivities':status['remainingActivities'],
        'nextNewOriginalId':'SIM-C2-L001-01', 'registrySha256':status['registrySha256'],
        'canonicalIntegration':'PENDING', 'humanApproval':'NOT_RUN', 'publicationAction':'NONE'}
    write_immutable(EVIDENCE / 'receipt.json', encode(receipt))
    return 1


if __name__ == '__main__':
    print(record())
