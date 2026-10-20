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


def execute_command(store, principal, operation, key, payload, apply, *, before_lookup=None, receipt_recorded=None):
    store._principal(principal)
    if not isinstance(key,str) or not 1<=len(key)<=256:
        raise StudyError('idempotency_key_required')
    hashed=digest(canonical(payload))
    with store.transaction() as c:
        store.lock_command(c, principal.id, operation, key)
        if before_lookup is not None:before_lookup(c)
        previous=lookup_receipt(c,principal.id,operation,key,hashed)
        if previous is not None:return previous
        body=apply(c)
        receipt_id=record_receipt(c,principal.id,operation,key,hashed,body)
        if receipt_recorded is not None:receipt_recorded(c,body,receipt_id)
    return body


def transact(store, principal, operation, key, payload, apply):
    """Pedagogical commands retain their original receipt/event atomicity."""
    def event(connection,body,receipt_id):
        store._event(connection,principal,operation,body.get('resourceId'),{'receiptId':receipt_id})
    return execute_command(store,principal,operation,key,payload,apply,receipt_recorded=event)
