import json
from .store import digest,canonical,identifier
from .models import StudyError


def lookup_receipt(connection, actor_id, operation, key, hashed):
    previous=connection.execute('SELECT * FROM study_receipts WHERE actor_id=? AND operation=? AND request_key=?',(actor_id,operation,key)).fetchone()
    if previous:
        if previous['payload_hash']!=hashed:raise StudyError('idempotency_conflict',409)
        return json.loads(previous['body'])
    return None


def record_receipt(connection, actor_id, operation, key, hashed, body):
    receipt_id=body.get('receiptId',identifier())
    connection.execute('INSERT INTO study_receipts VALUES(?,?,?,?,?,?)',(receipt_id,actor_id,operation,key,hashed,canonical(body)))
    return receipt_id


def transact(store, principal, operation, key, payload, apply):
    store._principal(principal)
    if not isinstance(key,str) or not 1<=len(key)<=256:
        raise StudyError('idempotency_key_required')
    hashed=digest(canonical(payload))
    with store.transaction() as c:
        store.lock_command(c, principal.id, operation, key)
        previous=lookup_receipt(c,principal.id,operation,key,hashed)
        if previous is not None:return previous
        body=apply(c)
        receipt_id=record_receipt(c,principal.id,operation,key,hashed,body)
        store._event(c,principal,operation,body.get('resourceId'),{'receiptId':receipt_id})
    return body
