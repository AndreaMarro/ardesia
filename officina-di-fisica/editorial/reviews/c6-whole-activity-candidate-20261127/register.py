"""Record the six verified original C6 activities in the existing registry."""
import json
import os
from pathlib import Path
import tempfile

from tools.corpus_engineering.batches import load_activity_registry, load_registry, validate_activity_batch
from tools.corpus_engineering import experiments_c6_whole_activity_verifier as verifier
from tools.corpus_engineering.pipeline import canonical, sha


def atomic_bytes(path, data):
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.' + path.name + '-', delete=False) as stream:
        candidate = Path(stream.name)
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())
    try:
        os.replace(candidate, path)
    finally:
        candidate.unlink(missing_ok=True)


def register():
    app = verifier.APP
    reviews = app / 'editorial/reviews'
    registry_file = app / 'editorial/batches/registry.json'
    status_file = reviews / 'full-corpus-work-status-20261126.json'
    report_file = reviews / (verifier.BATCH + '.json')
    sources = {row['id']: row for row in json.loads((app / 'content/esperienze-C6.json').read_bytes())}
    spec = {'id': verifier.BATCH, 'verifier': 'experiments_c6_whole_activity_verifier',
            'activityIds': sorted(sources)}

    registry_before = registry_file.read_bytes()
    status_before = status_file.read_bytes()
    registry = json.loads(registry_before)
    status = json.loads(status_before)
    if status['registrySha256'] != sha(registry_before):
        raise ValueError('The derived work status does not identify the current registry')
    existing = [row for row in load_activity_registry(registry_file) if verifier.IDS.intersection(row['activityIds'])]
    if existing and existing != [spec]:
        raise ValueError('C6 source IDs already belong to a different activity cohort')

    report = verifier.report(sources)
    report_bytes = (canonical(report) + '\n').encode()
    if report_file.exists() and report_file.read_bytes() != report_bytes:
        raise ValueError('Preserve the prior C6 report before recording a different epoch')
    if not report_file.exists():
        atomic_bytes(report_file, report_bytes)
    result = validate_activity_batch(spec, sources, app)
    if len(result['records']) != len(verifier.IDS):
        raise ValueError('The canonical validator did not accept each C6 activity')
    question_batches_before = load_registry(registry_file)
    if not existing:
        registry['activityBatches'].append(spec)
        changed = [row for row in status['activities'] if row['id'] in verifier.IDS]
        if len(changed) != len(verifier.IDS) or any(row['state'] != 'NOT_FULLY_REVIEWED' for row in changed):
            raise ValueError('The per-ID activity statuses do not match the new cohort')
        for row in changed:
            row.update(state='REVIEWED_ORIGINAL_ON_0FDCC_PENDING_CANONICAL', evidence=report_file.relative_to(app).as_posix())
        status['reviewedActivities'] += len(changed)
        status['remainingActivities'] -= len(changed)
        registry_bytes = (json.dumps(registry, ensure_ascii=False, indent=2) + '\n').encode()
        status['registrySha256'] = sha(registry_bytes)
        if (registry_file.read_bytes(), status_file.read_bytes()) != (registry_before, status_before):
            raise ValueError('Another writer changed the activity register')
        try:
            atomic_bytes(registry_file, registry_bytes)
            if load_registry(registry_file) != question_batches_before:
                raise ValueError('C6 registration changed the question registry')
            atomic_bytes(status_file, (json.dumps(status, ensure_ascii=False, indent=2) + '\n').encode())
        except Exception:
            atomic_bytes(registry_file, registry_before)
            atomic_bytes(status_file, status_before)
            raise
    print(json.dumps({'validatedActivities': len(result['records']), 'reviewedActivities': status['reviewedActivities'],
                      'openActivities': status['remainingActivities'], 'registrySha256':status['registrySha256'],
                      'reportSha256': sha(report_bytes), 'activityCreditAdded': 0 if existing else len(verifier.IDS),
                      'canonicalIntegration': 'PENDING', 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}))


if __name__ == '__main__':
    register()
