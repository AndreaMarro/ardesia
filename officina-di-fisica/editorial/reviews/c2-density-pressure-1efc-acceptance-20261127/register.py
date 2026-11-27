"""Register the five original density and pressure activities through the canonical validator."""

import json
import os
from pathlib import Path
import tempfile

from tools.corpus_engineering.batches import load_activity_registry, load_registry, validate_activity_batch
from tools.corpus_engineering import experiments_c2_density_pressure_1efc_verifier as verifier
from tools.corpus_engineering.pipeline import canonical, sha, write_immutable


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


def encode(payload):
    return (json.dumps(payload, ensure_ascii=False, indent=2) + '\n').encode()


def register():
    app = verifier.APP
    registry_file = app / 'editorial/batches/registry.json'
    reviews = app / 'editorial/reviews'
    status_file = reviews / 'full-corpus-work-status-20261126.json'
    report_file = reviews / (verifier.BATCH + '.json')
    old_registry, old_status = registry_file.read_bytes(), status_file.read_bytes()
    registry, status = map(json.loads, (old_registry, old_status))
    if status['registrySha256'] != sha(old_registry):
        raise ValueError('The work status does not identify the current registry')
    spec = {'id':verifier.BATCH, 'verifier':'experiments_c2_density_pressure_1efc_verifier',
            'activityIds':sorted(verifier.IDS)}
    matching = [row for row in load_activity_registry(registry_file) if verifier.IDS.intersection(row['activityIds'])]
    if matching and matching != [spec]:
        raise ValueError('A different activity cohort already owns one of these IDs')
    sources = {row['id']:row for row in json.loads((app/'content/esperienze-C2.json').read_bytes()) if row['id'] in verifier.IDS}
    report = verifier.report(sources)
    write_immutable(report_file, (canonical(report) + '\n').encode())
    result = validate_activity_batch(spec, sources, app)
    assert len(result['records']) == len(verifier.IDS)
    if matching:
        return 0
    questions = load_registry(registry_file)
    registry['activityBatches'].append(spec)
    activities = [row for row in status['activities'] if row['id'] in verifier.IDS]
    if len(activities) != len(verifier.IDS) or any(row['state'] != 'NOT_FULLY_REVIEWED' for row in activities):
        raise ValueError('The five activities do not match the open ID ledger')
    for activity in activities:
        activity.update(state='REVIEWED_ORIGINAL_ON_1EFC_PENDING_CANONICAL', evidence=report_file.relative_to(app).as_posix())
    status['reviewedActivities'] += len(activities)
    status['remainingActivities'] -= len(activities)
    payload = encode(registry)
    status['registrySha256'] = sha(payload)
    if (registry_file.read_bytes(), status_file.read_bytes()) != (old_registry, old_status):
        raise ValueError('Another writer modified the activity registry')
    try:
        replace(registry_file, payload)
        assert load_registry(registry_file) == questions
        replace(status_file, encode(status))
    except Exception:
        replace(registry_file, old_registry)
        replace(status_file, old_status)
        raise
    receipt = {'activityIds':sorted(verifier.IDS), 'added':len(activities), 'runtimeSha256':report['runtimeSha256'],
               'reportSha256':sha(report_file.read_bytes()), 'registrySha256':status['registrySha256'],
               'registeredAcrossEvidenceEpochs':status['reviewedActivities'], 'openActivities':status['remainingActivities'],
               'actualObservedCases':sum(row['actualObservedCases'] for row in result['records']),
               'canonicalIntegration':'PENDING', 'humanApproval':'NOT_RUN', 'publicationAction':'NONE'}
    write_immutable(verifier.PROOF / 'registration-receipt.json', encode(receipt))
    return len(activities)


if __name__ == '__main__':
    print(register())
