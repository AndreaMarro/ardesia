"""Record the observed wave-bench readout defect in the existing acceptance ledger."""

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import tempfile

from tools.corpus_engineering.acceptance_withdrawals import acceptance_audit, load_ledger
from tools.corpus_engineering.batches import load_activity_registry, load_registry
from tools.corpus_engineering.pipeline import sha


KEY = 'LAB3D-10'
WITHDRAWAL = 'lab3d10-oscillating-zero-display-20261127'
APP = Path(__file__).resolve().parents[3]
EVIDENCE = Path(__file__).resolve().parent.relative_to(APP)


def write(path, raw):
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.' + path.name + '-', delete=False) as handle:
        temporary = Path(handle.name)
        handle.write(raw)
        handle.flush()
        os.fsync(handle.fileno())
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def encode(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def record():
    ledger_path = APP / 'editorial/acceptance/withdrawals-v1.json'
    registry_path = APP / 'editorial/batches/registry.json'
    status_path = APP / 'editorial/reviews/full-corpus-work-status-20261126.json'
    paths = (ledger_path, registry_path, status_path)
    previous = [path.read_bytes() for path in paths]
    ledger, registry, status = map(json.loads, previous)
    assert registry['acceptanceWithdrawals']['sha256'] == sha(previous[0])
    assert status['registrySha256'] == sha(previous[1])
    questions = load_registry(registry_path)
    batch, = [row for row in load_activity_registry(registry_path) if KEY in row['activityIds']]
    existing = [row for row in ledger['withdrawals'] if row['recordId'] == KEY]
    if existing:
        if len(existing) != 1 or existing[0]['withdrawalId'] != WITHDRAWAL:
            raise ValueError('Another LAB3D-10 withdrawal is already recorded')
        return 0

    finding = EVIDENCE / 'independent-original-observations.json'
    raw = (APP / finding).read_bytes()
    observations = json.loads(raw)['actualRows']
    assert len(observations) == 14
    for row in observations:
        observed = row['observation']
        assert observed['actualInput'] == '0.25' and observed['expectedExactMm'] == 0
        assert observed['actualDisplayed'] == '-0,0000000000000007348 mm'
    timestamp = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    ledger['withdrawals'].append({'withdrawalId':WITHDRAWAL, 'recordId':KEY, 'batchId':batch['id'],
        'withdrawnAt':timestamp, 'reviewer':'Independent reviewer of the captured 2096 wave bench (Core)',
        'reason':('The installed readouts at the exact quarter-period crossing report a signed binary64 residual in '
                  '14 profiles. The amplitude is 4 mm and the exact instantaneous displacement is zero. The readout '
                  'requires fresh same-ID display evidence and a fresh whole-group report.'),
        'evidence':{'path':finding.as_posix(), 'sha256':sha(raw)}, 'humanApproval':'NOT_RUN', 'publicationAction':'NONE'})
    activity, = [row for row in status['activities'] if row['id'] == KEY]
    assert activity['state'] == 'REVIEWED_PENDING_CURRENT_FULL_INTEGRATION'
    activity.update(state='EXPLICITLY_REOPENED_REQUIRES_FRESH_CLOSURE', evidence=finding.as_posix())
    status['reviewedActivities'] -= 1
    status['remainingActivities'] += 1
    status['blockedActivityIds'].append(KEY)
    status['integrationOpenItems'].append({'id':WITHDRAWAL, 'state':'OPEN', 'affectedIds':[KEY],
        'evidence':ledger_path.relative_to(APP).as_posix(),
        'resolution':'Reprove the exact display, both neighboring signs, and whole 036 on the selected runtime.'})
    new_ledger = encode(ledger)
    registry['acceptanceWithdrawals']['sha256'] = sha(new_ledger)
    new_registry = encode(registry)
    status['registrySha256'] = sha(new_registry)
    try:
        for path, raw in zip(paths, (new_ledger, new_registry, encode(status)), strict=True):
            write(path, raw)
        assert load_registry(registry_path) == questions
        assert len(load_ledger(APP)['withdrawals']) == len(ledger['withdrawals'])
        try:
            acceptance_audit(batch, set(batch['activityIds']), APP)
        except ValueError as error:
            assert str(error) == f'Acceptance withdrawn: {KEY} ({WITHDRAWAL})'
        else:
            raise ValueError('The new withdrawal did not block the canonical scope')
    except Exception:
        for path, raw in zip(paths, previous, strict=True):
            write(path, raw)
        raise
    receipt = {'sourceRuntimeSha256':'2096493ae86311ec459e012032cd1f8fe41293326cc5769d86376aa5a0b59635',
               'sourceCommit':'3d060603540c981bf641f776ca65fd3ef76106c3',
               'independentEvidenceCommit':'e52c789d44ec9942a2fb583c8fcf93dbfa452fae',
               'originalFallbackPngSha256':sha((APP / EVIDENCE / 'original-320-fallback.png').read_bytes()),
               'technicalCaseProfiles':len(observations), 'blockedBatch':batch['id'], 'withdrawalId':WITHDRAWAL,
               'registrySha256':status['registrySha256'], 'registeredWithHistoricalEvidence':status['reviewedActivities'],
               'openActivities':status['remainingActivities'], 'nextExplicitlyReopenedId':'SIM-C1-L006-03',
               'humanApproval':'NOT_RUN', 'publicationAction':'NONE'}
    write(APP / EVIDENCE / 'receipt.json', encode(receipt))
    return 1


if __name__ == '__main__':
    print(record())
