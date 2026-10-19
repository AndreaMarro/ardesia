import json
from .store import digest,canonical,identifier
from .models import StudyError


def transact(store, principal, operation, key, payload, apply):
    store._principal(principal)
    if not isinstance(key,str) or not 1<=len(key)<=256:
        raise StudyError('idempotency_key_required')
    hashed=digest(canonical(payload))
    with store.transaction() as c:
        previous=c.execute('SELECT * FROM study_receipts WHERE actor_id=? AND operation=? AND request_key=?',(principal.id,operation,key)).fetchone()
        if previous:
            if previous['payload_hash']!=hashed:raise StudyError('idempotency_conflict',409)
            return json.loads(previous['body'])
        body=apply(c)
        receipt_id=body.get('receiptId',identifier())
        c.execute('INSERT INTO study_receipts VALUES(?,?,?,?,?,?)',(receipt_id,principal.id,operation,key,hashed,canonical(body)))
        store._event(c,principal,operation,body.get('resourceId'),{'receiptId':receipt_id})
    return body
