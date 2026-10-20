from .models import StudyError
from .store import identifier
from .calendar_time import normalize_sessions
from .editions import configure_sessions_in_transaction
from .transactions import transact


def reserve_seat(store, actor, edition_id, key, now, ttl=900):
    store._principal(actor)
    if actor.role!='student':raise StudyError('forbidden',403)
    if type(ttl) not in (int,float) or not 0<ttl<=3600:raise StudyError('invalid_expiry')
    def apply(c):
        store.lock_edition(c, edition_id)
        edition=store.get_edition(edition_id)
        effective_now=max(now,store.clock())
        if c.execute('SELECT 1 FROM study_members WHERE edition_id=? AND student_id=?',(edition_id,actor.id)).fetchone():
            return {'id':None,'editionId':edition_id,'state':'confirmed','paymentMode':'test'}
        if edition['state']!='offered':raise StudyError('edition_not_offered',409)
        normalize_sessions(edition_id,edition['sessions'],edition['timezone'])
        offer_revision=c.execute('SELECT management_revision FROM study_editions WHERE id=?',(edition_id,)).fetchone()[0]
        previous=c.execute("SELECT * FROM study_holds WHERE edition_id=? AND student_id=? AND state='hold' AND expires_at>?",(edition_id,actor.id,effective_now)).fetchone()
        if previous and previous['offer_revision']==offer_revision:
            return {'id':previous['id'],'editionId':edition_id,'state':'hold','expiresAt':previous['expires_at'],'paymentMode':'test','offerRevision':offer_revision}
        if previous:
            c.execute("UPDATE study_holds SET state='payment_requires_review' WHERE id=?",(previous['id'],))
        members=c.execute('SELECT COUNT(*) FROM study_members WHERE edition_id=?',(edition_id,)).fetchone()[0]
        holds=c.execute("SELECT COUNT(*) FROM study_holds WHERE edition_id=? AND state='hold' AND expires_at>?",(edition_id,effective_now)).fetchone()[0]
        if members+holds>=edition['capacity']:raise StudyError('group_full',409)
        hold_id=identifier()
        c.execute("INSERT INTO study_holds(id,edition_id,student_id,expires_at,state,offer_revision) VALUES(?,?,?,?,'hold',?)",(hold_id,edition_id,actor.id,effective_now+ttl,offer_revision))
        return {'id':hold_id,'editionId':edition_id,'state':'hold','expiresAt':effective_now+ttl,'paymentMode':'test','offerRevision':offer_revision}
    try:return transact(store,actor,'seat.reserve',key,{'editionId':edition_id,'ttl':ttl},apply)
    except StudyError as error:
        if error.code=='group_full':
            with store.transaction() as c:c.execute('INSERT OR IGNORE INTO study_waitlist VALUES(?,?)',(edition_id,actor.id))
        raise


def confirm_test_enrollment(store, actor, hold_id, key, now):
    store._principal(actor)
    if actor.role!='student':raise StudyError('forbidden',403)
    def apply(c):
        identity=c.execute('SELECT edition_id,student_id FROM study_holds WHERE id=?',(hold_id,)).fetchone()
        if not identity:raise StudyError('not_found',404)
        if identity['student_id']!=actor.id:raise StudyError('forbidden',403)
        store.lock_edition(c,identity['edition_id'])
        effective_now=max(now,store.clock())
        # Hold and edition may both have changed while waiting for the lock.
        hold=c.execute('SELECT * FROM study_holds WHERE id=? AND student_id=?',(hold_id,actor.id)).fetchone()
        if not hold:raise StudyError('not_found',404)
        if hold['state']=='confirmed':return {'id':hold_id,'state':'confirmed','editionId':hold['edition_id'],'paymentMode':'test'}
        edition=store.get_edition(hold['edition_id'])
        current_revision=c.execute('SELECT management_revision FROM study_editions WHERE id=?',(hold['edition_id'],)).fetchone()[0]
        if hold['offer_revision'] is None or hold['offer_revision']!=current_revision or hold['expires_at']<=effective_now or hold['state']!='hold' or edition['state']!='offered':
            c.execute("UPDATE study_holds SET state='payment_requires_review' WHERE id=?",(hold_id,))
            return {'id':hold_id,'state':'payment_requires_review','paymentMode':'test'}
        normalize_sessions(edition['id'],edition['sessions'],edition['timezone'])
        count=c.execute('SELECT COUNT(*) FROM study_members WHERE edition_id=?',(edition['id'],)).fetchone()[0]
        if count>=edition['capacity']:raise StudyError('group_full',409)
        c.execute('INSERT OR IGNORE INTO study_members VALUES(?,?)',(edition['id'],actor.id))
        if not c.execute('SELECT 1 FROM enrollments WHERE class_id=? AND student_id=?',(edition['id'],actor.id)).fetchone():
            c.execute('INSERT INTO enrollments VALUES(?,?,?)',(identifier(),edition['id'],actor.id))
        c.execute("UPDATE study_holds SET state='confirmed' WHERE id=?",(hold_id,))
        c.execute('DELETE FROM study_waitlist WHERE edition_id=? AND student_id=?',(edition['id'],actor.id))
        return {'id':hold_id,'state':'confirmed','editionId':edition['id'],'paymentMode':'test','priceMinor':edition['priceMinor']}
    return transact(store,actor,'enrollment.confirm',key,{'holdId':hold_id,'paymentMode':'test'},apply)


def propose_cohorts(requests,slots):
    proposals=[]
    for slot in slots:
        compatible=[];excluded=[]
        for request in requests:
            reason='topic_mismatch' if request['topic']!=slot['topic'] else 'missing_dates' if not set(slot['sessions']).issubset(request['available']) else None
            if reason:excluded.append({'id':request['id'],'reason':reason})
            else:compatible.append(request['id'])
        proposals.append({'id':slot['id'],'compatible':compatible,'excluded':excluded,'rulesVersion':1})
    return proposals


def configure_sessions(store,principal,edition_id,sessions):
    store._principal(principal)
    with store.transaction() as c:
        configure_sessions_in_transaction(store,c,principal,edition_id,sessions)
