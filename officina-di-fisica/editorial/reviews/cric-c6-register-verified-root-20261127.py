"""Register one verified C6 batch and reconcile the existing progress views."""
import argparse
import hashlib
import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from tools.corpus_engineering.batches import load_registry

APP = Path.cwd()
REVIEWS = APP / 'editorial/reviews'
REGISTRY = APP / 'editorial/batches/registry.json'
WORK = REVIEWS / 'full-corpus-work-status-20261126.json'
OPERATIONS = REVIEWS / 'operational-status-20261125.json'
REVIEWED = 'ROOT_ACCEPTED_DRAFT_PENDING_FULL_INTEGRATION'


def load(path):
    return json.loads(path.read_bytes())


def dump(data):
    return (json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode()


def atomic(path, raw):
    with tempfile.NamedTemporaryFile(prefix=path.name + '.', dir=path.parent, delete=False) as stream:
        stream.write(raw)
        stream.flush()
        os.fsync(stream.fileno())
        temp = Path(stream.name)
    try:
        os.replace(temp, path)
    finally:
        temp.unlink(missing_ok=True)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def register(batch):
    folder = REVIEWS / f'{batch}-root-integration-20261127'
    receipt_path = folder / 'receipt.json'
    receipt = load(receipt_path)
    ids = receipt['questionIds']
    assert batch.startswith('cric-c6-') and receipt['batch'] == batch and receipt['tests']['actualExit'] == 0
    assert len(ids) == len(set(ids)) == receipt['newDrafts'] == receipt['unchangedDrafts']
    assert (receipt['repeatSaved'], receipt['preservedPublishedCount'], receipt['humanApproval'],
            receipt['publicationAction']) == (0, 991, 'NOT_RUN', 'NONE')
    assert sha((REVIEWS / f'{batch}.json').read_bytes()) == receipt['individualScientificEvidenceSha256']
    assert sha((REVIEWS / f'{batch}-integration.json').read_bytes()) == receipt['integrationEvidenceSha256']
    original_registry = REGISTRY.read_bytes()
    registry = json.loads(original_registry)
    spec = {'id': batch, 'questionIds': ids, 'verifier': batch.replace('-', '_') + '_verifier'}
    found = [existing for existing in registry['batches'] if existing['id'] == batch]
    if found:
        assert found == [spec], 'Candidate changed after registration'
    else:
        registry['batches'].append(spec)
    raw = dump(registry)
    with tempfile.NamedTemporaryFile(prefix='cric-registry-validation-', suffix='.json') as sibling:
        Path(sibling.name).write_bytes(raw)
        specs = load_registry(Path(sibling.name))
    accepted = {key for item in specs for key in item['questionIds']}
    work = load(WORK)
    assert len(work['questions']) == len({q['id'] for q in work['questions']}) == 4606
    assert accepted.issubset({q['id'] for q in work['questions']})
    missing = []
    for q in work['questions']:
        if q['id'] in accepted:
            q['state'] = REVIEWED
        else:
            q['state'] = 'NOT_REVIEWED'
            missing.append(q['id'])
    next_id = missing[0] if missing else None
    now = datetime.now(timezone.utc).isoformat()
    work.update(observedAt=now, reviewedQuestions=len(accepted), remainingQuestions=len(missing),
                registrySha256=sha(raw), missingQuestionIds=missing, nextRootQuestionId=next_id)
    ops = load(OPERATIONS)
    rel = str(receipt_path.relative_to(APP))
    ops.update(observedAt=now, nextScientificAcceptanceId=next_id, nextRegistrationId=next_id)
    q = ops['questions']
    q.update(scientificallyReviewed=len(accepted), registeredDrafts=len(accepted), fullyAccepted=len(accepted),
             scientificallyUnreviewed=len(missing), unreviewedBySource={'Ardesia': 0, 'Cric': len(missing)},
             registrationPendingQuestions=0, newRootAcceptanceReceipt=rel)
    if rel not in q['newRootAcceptanceReceipts']:
        q['newRootAcceptanceReceipts'].append(rel)
    ops['currentLocalPreparation']['questionRegistry'] = len(accepted)
    ops['assignments'] = f'{len(accepted)} accepted as DRAFT. Next registered review ID: {next_id}.'
    if not found:
        atomic(folder / 'prior-registry.json', original_registry)
    atomic(REGISTRY, raw)
    atomic(WORK, dump(work))
    atomic(OPERATIONS, dump(ops))
    atomic(folder / 'registration-receipt.json', dump({
        'batch': batch, 'registrySha256': sha(raw), 'acceptedQuestions': len(accepted),
        'remainingQuestions': len(missing), 'nextQuestionId': next_id,
        'acceptedActivities': work['reviewedActivities'], 'remainingActivities': work['remainingActivities'],
        'scientificReceiptSha256': sha(receipt_path.read_bytes()), 'humanApproval': 'NOT_RUN',
        'publicationAction': 'NONE', 'compiledCheckpointAdvanced': False,
    }))
    print(f'{len(accepted)}/4606 registered. {len(missing)} questions remain.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('batch')
    register(parser.parse_args().batch)
