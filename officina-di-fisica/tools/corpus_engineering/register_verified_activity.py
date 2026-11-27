"""Register an existing, independently verified activity draft through the corpus validator."""

import argparse
from datetime import datetime
import fcntl
import json
import os
from pathlib import Path
import tempfile

from .batches import load_activity_registry, load_registry, validate_activity_batch
from .pipeline import canonical, sha, write_immutable
from .runtime_fingerprint import runtime_fingerprint


APP = Path(__file__).resolve().parents[2]


def encode(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def replace(path, raw):
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False, prefix='.' + path.name + '-') as file:
        temporary = Path(file.name)
        file.write(raw)
        file.flush()
        os.fsync(file.fileno())
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def register(spec, source_file, receipt_file, expected_runtime, expected_registry, *, registry_file=None, status_file=None):
    registry_file = registry_file or APP / 'editorial/batches/registry.json'
    status_file = status_file or APP / 'editorial/reviews/full-corpus-work-status-20261126.json'
    registry_raw, status_raw = registry_file.read_bytes(), status_file.read_bytes()
    registry, status = map(json.loads, (registry_raw, status_raw))
    registry_sha = sha(registry_raw)
    runtime = runtime_fingerprint(APP)['sha256']
    if runtime != expected_runtime or status['registrySha256'] != registry_sha:
        raise ValueError('The activity adoption does not match the exact runtime and work register')

    ids = set(spec['activityIds'])
    before = [row for row in load_activity_registry(registry_file) if ids.intersection(row['activityIds'])]
    if before and before != [spec]:
        raise ValueError('An existing cohort owns one or more selected activities')
    if not before and registry_sha != expected_registry:
        raise ValueError('The registration started from a different registry')
    rows = [row for row in status['activities'] if row['id'] in ids]
    if len(rows) != len(ids):
        raise ValueError('The current work register does not contain exactly the selected activities')
    source = {row['id']: row for row in json.loads(source_file.read_bytes()) if row['id'] in ids}
    proof = validate_activity_batch(spec, source, APP)
    if proof['revision'] is None:
        raise ValueError('This operation requires a verified draft package')
    state = 'REVIEWED_DRAFT_ON_' + runtime[:4].upper() + '_PENDING_CANONICAL'
    if before:
        if any(row.get('state') != state or row.get('evidence') != proof['path'] for row in rows):
            raise ValueError('Already registered activities do not match their catalog state')
        return 0
    if any(row.get('state') != 'NOT_FULLY_REVIEWED' for row in rows):
        raise ValueError('Only open activities can enter a new cohort')

    questions = load_registry(registry_file)
    registry['activityBatches'].append(spec)
    for row in rows:
        row.update(state=state, evidence=proof['path'])
    status['reviewedActivities'] += len(rows)
    status['remainingActivities'] -= len(rows)
    status['observedAt'] = datetime.now().astimezone().isoformat()
    status['fullSnapshotGate'] = 'PENDING_REMAINING_ACTIVITIES_UNIFIED_RUNTIME_AND_CANONICAL_CI'
    new_registry = encode(registry)
    status['registrySha256'] = sha(new_registry)
    new_status = encode(status)
    case_counts = []
    for record in proof['records']:
        count = record.get('actualBrowserCases')
        scope = record.get('visualScope')
        if count is None and isinstance(scope, dict):
            count = scope.get('actualCases')
        case_counts.append(count)
    actual_cases = sum(case_counts) if all(type(count) is int for count in case_counts) else None
    result = {
        'schemaVersion': '1.0.0', 'spec': spec, 'specSha256': sha(canonical(spec).encode()),
        'sourceFileSha256': sha(source_file.read_bytes()), 'runtimeSha256': runtime,
        'previousRegistrySha256': registry_sha, 'registrySha256': status['registrySha256'],
        'statusSha256': sha(new_status), 'registered': len(rows),
        'registeredAcrossRuntimeEpochs': status['reviewedActivities'], 'remainingActivities': status['remainingActivities'],
        'scientificReportSha256': proof['sha256'], 'verifiedDraftArtifacts': proof['revision'],
        'actualCases': actual_cases,
        'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE',
    }
    if receipt_file.exists():
        raise ValueError('Registration receipt already exists for an unregistered cohort')
    if (registry_file.read_bytes(), status_file.read_bytes()) != (registry_raw, status_raw):
        raise ValueError('The work register changed during independent validation')
    try:
        replace(registry_file, new_registry)
        if load_registry(registry_file) != questions or spec not in load_activity_registry(registry_file):
            raise ValueError('Proposed adoption changed questions or failed its activity schema')
        replace(status_file, new_status)
        write_immutable(receipt_file, encode(result))
    except Exception:
        replace(registry_file, registry_raw)
        replace(status_file, status_raw)
        raise
    return len(rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('spec', type=Path)
    parser.add_argument('source', type=Path)
    parser.add_argument('receipt', type=Path)
    parser.add_argument('lock', type=Path)
    parser.add_argument('--expect-runtime', required=True)
    parser.add_argument('--expect-registry', required=True)
    parser.add_argument('--registry-file', type=Path, help='Registry in the integration worktree')
    parser.add_argument('--status-file', type=Path, help='Per-ID status in the same integration worktree')
    args = parser.parse_args()
    if bool(args.registry_file) != bool(args.status_file):
        parser.error('--registry-file and --status-file must be supplied together')
    spec = json.loads(args.spec.read_bytes())
    with args.lock.open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        print(register(spec, args.source, args.receipt, args.expect_runtime, args.expect_registry,
                       registry_file=args.registry_file, status_file=args.status_file))


if __name__ == '__main__':
    main()
