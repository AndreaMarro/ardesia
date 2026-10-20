from datetime import datetime
import json
from zoneinfo import ZoneInfo
from .models import StudyError
from .store import identifier,canonical
from .transactions import transact


def reserve_seat(store, actor, edition_id, key, now, ttl=900):
    store._principal(actor)
    if actor.role!='student':raise StudyError('forbidden',403)
    if not 0<ttl<=3600:raise StudyError('invalid_expiry')
    def apply(c):
        store.lock_edition(c, edition_id)
        edition=store.get_edition(edition_id)
        if c.execute('SELECT 1 FROM study_members WHERE edition_id=? AND student_id=?',(edition_id,actor.id)).fetchone():
            return {'id':None,'editionId':edition_id,'state':'confirmed','paymentMode':'test'}
        previous=c.execute("SELECT * FROM study_holds WHERE edition_id=? AND student_id=? AND state='hold' AND expires_at>?",(edition_id,actor.id,now)).fetchone()
        if previous:return {'id':previous['id'],'editionId':edition_id,'state':'hold','expiresAt':previous['expires_at'],'paymentMode':'test'}
        members=c.execute('SELECT COUNT(*) FROM study_members WHERE edition_id=?',(edition_id,)).fetchone()[0]
        holds=c.execute("SELECT COUNT(*) FROM study_holds WHERE edition_id=? AND state='hold' AND expires_at>?",(edition_id,now)).fetchone()[0]
        if members+holds>=edition['capacity']:raise StudyError('group_full',409)
        hold_id=identifier()
        c.execute("INSERT INTO study_holds VALUES(?,?,?,?,'hold')",(hold_id,edition_id,actor.id,now+ttl))
        return {'id':hold_id,'editionId':edition_id,'state':'hold','expiresAt':now+ttl,'paymentMode':'test'}
    try:return transact(store,actor,'seat.reserve',key,{'editionId':edition_id,'ttl':ttl},apply)
    except StudyError as error:
        if error.code=='group_full':
            with store.transaction() as c:c.execute('INSERT OR IGNORE INTO study_waitlist VALUES(?,?)',(edition_id,actor.id))
        raise


def confirm_test_enrollment(store, actor, hold_id, key, now):
    store._principal(actor)
    def apply(c):
        hold=c.execute('SELECT * FROM study_holds WHERE id=?',(hold_id,)).fetchone()
        if not hold:raise StudyError('not_found',404)
        if hold['student_id']!=actor.id:raise StudyError('forbidden',403)
        if hold['state']=='confirmed':return {'id':hold_id,'state':'confirmed','editionId':hold['edition_id'],'paymentMode':'test'}
        if hold['expires_at']<=now or hold['state']!='hold':
            c.execute("UPDATE study_holds SET state='payment_requires_review' WHERE id=?",(hold_id,))
            return {'id':hold_id,'state':'payment_requires_review','paymentMode':'test'}
        edition=store.get_edition(hold['edition_id'])
        store.lock_edition(c, edition['id'])
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
    store._edition_access(principal,edition_id,teacher_only=True)
    if not isinstance(sessions,list) or len(sessions)!=4:raise StudyError('four_sessions_required')
    intervals=[]
    for session in sessions:
        try:
            start=datetime.fromisoformat(session['start']);end=datetime.fromisoformat(session['end'])
            if start.utcoffset() is None or end.utcoffset() is None or (end-start).total_seconds()!=5400:raise ValueError()
            if start.astimezone(ZoneInfo('Europe/Rome')).utcoffset()!=start.utcoffset():raise ValueError()
        except (ValueError,KeyError,TypeError):raise StudyError('invalid_calendar')
        if any(start<old_end and end>old_start for old_start,old_end in intervals):raise StudyError('calendar_conflict',409)
        intervals.append((start,end))
    with store.transaction() as c:
        store.lock_teacher(c, principal.id)
        if store.get_edition(edition_id)['sessions']==sessions:return
        if c.execute('SELECT 1 FROM study_members WHERE edition_id=?',(edition_id,)).fetchone():raise StudyError('reconfirmation_required',409)
        for row in c.execute('SELECT sessions FROM study_editions WHERE teacher_id=? AND id!=?',(principal.id,edition_id)):
            for old in json.loads(row['sessions']):
                old_start=datetime.fromisoformat(old['start']);old_end=datetime.fromisoformat(old['end'])
                if any(start<old_end and end>old_start for start,end in intervals):raise StudyError('calendar_conflict',409)
        c.execute('UPDATE study_editions SET sessions=? WHERE id=?',(canonical(sessions),edition_id))
        store._event(c,principal,'edition.calendar',None,{'editionId':edition_id,'sessions':sessions})
