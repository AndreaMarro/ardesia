"""Close the single hydrostatic withdrawal through the canonical batch validator."""

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import tempfile

from tools.corpus_engineering import bench_mechanics_fluids_renewal_1efc_verifier as verifier
from tools.corpus_engineering.batches import validate_activity_batch
from tools.corpus_engineering.pipeline import sha, write_immutable


def encode(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def replace(path, raw):
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.' + path.name, delete=False) as stream:
        temporary = Path(stream.name)
        stream.write(raw)
        stream.flush()
        os.fsync(stream.fileno())
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def register():
    app = verifier.APP
    proof = Path(__file__).resolve().parent
    batch = 'bench-mechanics-fluids-035'
    identifier = 'LAB3D-03'
    withdrawal = 'lab3d03-surface-probe-label-20261127'
    registry = app / 'editorial/batches/registry.json'
    ledger = app / 'editorial/acceptance/withdrawals-v1.json'
    status = app / 'editorial/reviews/full-corpus-work-status-20261126.json'
    scientific = app / 'editorial/reviews' / (batch + '.json')
    old = {path:path.read_bytes() for path in (registry, ledger, status, scientific)}
    listing, history, work = (json.loads(old[path]) for path in (registry, ledger, status))
    spec = next(row for row in listing['activityBatches'] if row['id'] == batch)
    gate = next(row for row in history['withdrawals'] if row['withdrawalId'] == withdrawal)
    sources = {row['id']:row for row in json.loads((app/'content/banchi.json').read_bytes()) if row['id'] in verifier.IDS}
    if work['registrySha256'] != sha(old[registry]) or set(spec['activityIds']) != set(sources):
        raise ValueError('Activity checkpoint does not identify the existing 035 batch')
    if 'closure' in gate:
        validate_activity_batch(spec, sources, app)
        return 0

    raw = (verifier.BASE/'scientific-report.json').read_bytes()
    fresh = verifier.report(sources)
    if fresh != json.loads(raw) or not all(row['ok'] for row in fresh['records']):
        raise ValueError('Fresh whole family report differs from the independent report')
    write_immutable(proof/'prior-ledger.json', old[ledger])
    write_immutable(proof/'prior-scientific-report.json', old[scientific])
    closed_at = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    gate['closure'] = {'recordId':identifier,'batchId':batch,'closedAt':closed_at,
                       'reviewer':'Root integrator of the independently verified whole 035 scope',
                       'reason':'Whole 035 passed on 1efc. New complete-boundary and focused observations show both surface and probe labels legible at zero depth. Original tasks were verified as 5 kPa and 2 m.',
                       'runtimeSha256':verifier.RUNTIME,
                       'scientificReport':{'path':scientific.relative_to(app).as_posix(),'sha256':sha(raw)}}
    raw_ledger = encode(history)
    listing['acceptanceWithdrawals']['sha256'] = sha(raw_ledger)
    spec['verifier'] = 'bench_mechanics_fluids_renewal_1efc_verifier'
    raw_registry = encode(listing)
    records = {row['id']:row for row in work['activities'] if row['id'] in sources}
    prior = records[identifier]
    if (set(records) != set(sources) or work['blockedActivityIds'] != [identifier]
            or prior['state'] != 'EXPLICITLY_REOPENED_REQUIRES_FRESH_CLOSURE'):
        raise ValueError('Exactly one reopened 035 ID expected in the current checkpoint')
    for row in records.values():
        row.update(state='REVIEWED_ORIGINAL_ON_1EFC_PENDING_CANONICAL', evidence=scientific.relative_to(app).as_posix())
    work['blockedActivityIds'].remove(identifier)
    work['reviewedActivities'] += 1
    work['remainingActivities'] -= 1
    work['registrySha256'] = sha(raw_registry)
    integration = next(row for row in work['integrationOpenItems'] if row['id'] == withdrawal)
    integration.update(state='CLOSED_ON_1EFC_PENDING_CANONICAL_INTEGRATION', resolvedOnCurrentRuntime=verifier.RUNTIME)
    if any(path.read_bytes() != content for path, content in old.items()):
        raise ValueError('The working scope changed during validation')
    try:
        replace(scientific, raw)
        replace(ledger, raw_ledger)
        replace(registry, raw_registry)
        result = validate_activity_batch(spec, sources, app)
        if {row['recordId'] for row in result['acceptanceWithdrawals']['withdrawals']} != {identifier}:
            raise ValueError('Closure changed an unrelated ledger scope')
        replace(status, encode(work))
    except Exception:
        for path, content in old.items():
            replace(path, content)
        raise
    write_immutable(proof/'receipt.json', encode({'closedId':identifier,'verifiedIds':sorted(sources),
        'activityCredit':1,'runtimeSha256':verifier.RUNTIME,'scientificReportSha256':sha(raw),
        'registrySha256':work['registrySha256'],'openActivities':work['remainingActivities'],
        'registeredActivities':work['reviewedActivities'],'humanApproval':'NOT_RUN','publicationAction':'NONE'}))
    return 1


if __name__ == '__main__':
    print(register())
