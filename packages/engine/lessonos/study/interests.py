import json
import re
from .models import StudyError
from .store import identifier, digest, canonical


def record_interest(store, request, key):
    if not isinstance(request.get('contact'),str):raise StudyError('invalid_contact')
    contact=request.get('contact','').strip().lower()
    if not re.fullmatch(r'[a-z0-9._+-]+@[a-z0-9.-]+\.invalid',contact) or request.get('consent') is not True:
        raise StudyError('synthetic_contact_and_consent_required')
    topic=request.get('topic','')
    slots=request.get('slots',[])
    if not isinstance(topic,str) or not 1<=len(topic)<=200 or not isinstance(slots,list) or not 1<=len(slots)<=10 or any(not isinstance(x,str) or len(x)>100 for x in slots):
        raise StudyError('invalid_interest')
    if not isinstance(key,str) or not 1<=len(key)<=256:
        raise StudyError('idempotency_key_required')
    edition_id=request.get('editionId','fluidi')
    store.get_edition(edition_id)
    payload={'editionId':edition_id,'contact':contact,'topic':topic,'slots':slots,'consent':True}
    hashed=digest(canonical(payload))
    with store.transaction() as c:
        store.lock_command(c, 'anonymous', 'interest.record', key)
        previous=c.execute('SELECT * FROM study_interests WHERE request_key=?',(key,)).fetchone()
        if previous:
            if previous['payload_hash']!=hashed:raise StudyError('idempotency_conflict',409)
            return json.loads(previous['receipt'])
        receipt={'id':identifier(),'status':'received','receivedAt':store.clock(),'synthetic':True}
        c.execute('INSERT INTO study_interests VALUES(?,?,?,?,?,?,?,?,?)',(receipt['id'],edition_id,contact,topic,canonical(slots),key,hashed,canonical(receipt),store.clock()))
    return receipt


def list_interests(store, principal, edition_id):
    store._edition_access(principal,edition_id,teacher_only=True)
    return [dict(row) for row in store.connection.execute('SELECT id,contact,topic,slots,created_at FROM study_interests WHERE edition_id=? ORDER BY created_at',(edition_id,))]
