"""Durable original-upload intent and bounded operator recovery.

The database cannot atomically commit a remote blob. Commit intent first;
serialize uploader/reconciler per blob; commit metadata and completion together.
Unfinished intent survives process death. Provider cleanup can be retried without
inventing an available asset or deleting a committed original.
"""
from .models import StudyError
from .store import identifier
from .transactions import lookup_receipt, record_receipt

LEASE_SECONDS = 600


def begin_upload(store, principal, edition_id, asset_id, *, key=None, payload_hash=None):
    if key is not None and (not isinstance(key,str) or not 1 <= len(key) <= 256):
        raise StudyError('idempotency_key_required')
    with store.transaction() as c:
        if key is not None:
            store.lock_command(c,principal.id,'asset.uploaded',key)
            previous=lookup_receipt(c,principal.id,'asset.uploaded',key,payload_hash)
            if previous is not None:return None,previous
            pending=c.execute('SELECT * FROM study_upload_requests WHERE actor_id=? AND request_key=?',(principal.id,key)).fetchone()
            if pending:
                if pending['payload_hash']!=payload_hash:raise StudyError('idempotency_conflict',409)
                return pending['asset_id'],None
        c.execute('INSERT INTO study_upload_intents(id,edition_id,owner_id,state,expires_at,created_at) VALUES(?,?,?,?,?,?)',
                  (asset_id, edition_id, principal.id, 'pending', store.clock() + LEASE_SECONDS, store.clock()))
        if key is not None:
            c.execute('INSERT INTO study_upload_requests VALUES(?,?,?,?)',(principal.id,key,payload_hash,asset_id))
    return asset_id,None


def uploaded_receipt(store, connection, principal, key, hashed, body):
    if key is None:return body
    body={**body,'receiptId':identifier()}
    record_receipt(connection,principal.id,'asset.uploaded',key,hashed,body)
    store._event(connection,principal,'asset.uploaded',None,{'receiptId':body['receiptId'],'assetId':body['id']})
    return body


def _clean(store, blobs, asset_id, *, force=False):
    with store.transaction() as c:
        store.lock_aggregate(c, 'asset.upload', asset_id)
        row = c.execute('SELECT * FROM study_upload_intents WHERE id=?', (asset_id,)).fetchone()
        if row is None or row['state'] == 'committed':
            return False
        if not force and row['state'] == 'pending' and row['expires_at'] > store.clock():
            return False
        # Defensive reconciliation: metadata wins even after an older recovery
        # candidate was selected, or if state was interrupted by older code.
        if c.execute('SELECT 1 FROM study_assets WHERE id=?', (asset_id,)).fetchone():
            c.execute("UPDATE study_upload_intents SET state='committed' WHERE id=?", (asset_id,))
            return False
        blobs.remove(asset_id)
        c.execute('DELETE FROM study_upload_intents WHERE id=?', (asset_id,))
        return True


def compensate_upload(store, blobs, asset_id):
    """Keep the original exception; a cleanup outage stays durably retryable."""
    try:
        with store.transaction() as c:
            store.lock_aggregate(c, 'asset.upload', asset_id)
            c.execute("UPDATE study_upload_intents SET state='cleanup_required' WHERE id=? AND state='pending'", (asset_id,))
        _clean(store, blobs, asset_id, force=True)
    except Exception:
        # The committed pending/cleanup_required row remains even if this update
        # or deletion fails. Recovery must not rely on an in-memory job/log.
        return False
    return True


def recover_uploads(store, blobs, *, limit=100):
    """Operator only; no HTTP/browser exposure or user-supplied object IDs.

    Expired pending work is presumed interrupted. The per-upload lock excludes
    an active uploader, even if its lease elapsed. Run after the provider's
    in-flight request timeout when recovering a killed service.
    """
    if getattr(store, '_administrative', True) is not True:
        raise StudyError('forbidden', 403)
    if type(limit) is not int or not 1 <= limit <= 1000:
        raise StudyError('invalid_recovery_limit')
    # A remote operator transport can enumerate candidates and execute the same
    # locked protocol inside the provider worker. Never split a DB lock and
    # privileged deletion across processes. Ordinary stores keep the local path.
    candidates = getattr(store, 'upload_recovery_candidates', None)
    rows = candidates(limit) if candidates is not None else store.connection.execute(
        "SELECT id FROM study_upload_intents WHERE state='cleanup_required' OR (state='pending' AND expires_at<=?) ORDER BY created_at,id LIMIT ?",
        (store.clock(), limit)).fetchall()
    atomic_recover = getattr(blobs, 'recover_upload_intent', None)
    result = {'cleaned': 0, 'failed': 0, 'skipped': 0}
    for row in rows:
        try:
            cleaned = atomic_recover(row['id']) if atomic_recover is not None else _clean(store, blobs, row['id'])
            result['cleaned' if cleaned else 'skipped'] += 1
        except Exception:
            result['failed'] += 1
    return result
