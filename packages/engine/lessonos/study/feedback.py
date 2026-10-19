import json
from .models import StudyError
from .store import identifier,canonical
from .transactions import transact


def submission_for_actor(store,principal,submission_id,teacher_only=False):
    row=store.connection.execute('SELECT * FROM study_submissions WHERE id=?',(submission_id,)).fetchone()
    if not row:raise StudyError('not_found',404)
    edition=store._edition_access(principal,row['edition_id'],teacher_only=teacher_only)
    if not teacher_only and principal.id not in (row['student_id'],edition['teacherId']):raise StudyError('forbidden',403)
    return row


def validate_sources(store,source_refs):
    for ref in source_refs:
        current=store.connection.execute('SELECT current_revision,deleted FROM study_resources WHERE id=?',(ref['resourceId'],)).fetchone()
        if current is None or current['deleted'] or current['current_revision']!=ref['revisionId']:raise StudyError('stale_source',409)


def propose_feedback(store,principal,submission_id):
    submission=submission_for_actor(store,principal,submission_id,teacher_only=True)
    validate_sources(store,json.loads(submission['source_refs']))
    with store.transaction() as c:
        previous=c.execute('SELECT * FROM study_feedback WHERE submission_id=?',(submission_id,)).fetchone()
        if previous:return candidate_dict(previous)
        candidate_id=identifier()
        text='Proposta sintetica, da rivedere: identifica la grandezza fissata e confronta la potenza del raggio. Nessuna lettura automatica di immagini o audio è stata eseguita.'
        c.execute("INSERT INTO study_feedback VALUES(?,?,?,'deterministic_fake','proposed',?,?)",(candidate_id,submission_id,submission['revision'],text,submission['source_refs']))
        return candidate_dict(c.execute('SELECT * FROM study_feedback WHERE id=?',(candidate_id,)).fetchone())


def candidate_dict(row):
    return {'id':row['id'],'submissionId':row['submission_id'],'submissionRevision':row['submission_revision'],'authorType':row['author_type'],'state':row['state'],'text':row['text'],'sourceRefs':json.loads(row['source_refs'])}


def review_feedback(store,principal,candidate_id,expected_revision,edits,key,decision='returned'):
    candidate=store.connection.execute('SELECT * FROM study_feedback WHERE id=?',(candidate_id,)).fetchone()
    if not candidate:raise StudyError('not_found',404)
    submission=submission_for_actor(store,principal,candidate['submission_id'],teacher_only=True)
    if type(expected_revision) is not int or expected_revision!=candidate['submission_revision']:raise StudyError('stale_revision',409)
    if decision not in ('returned','needs_clarification') or not isinstance(edits,str) or not 1<=len(edits)<=20_000:raise StudyError('invalid_review')
    def apply(c):
        validate_sources(store,json.loads(candidate['source_refs']))
        if c.execute('SELECT 1 FROM study_reviews WHERE candidate_id=?',(candidate_id,)).fetchone():raise StudyError('already_reviewed',409)
        review_id=identifier()
        c.execute('INSERT INTO study_reviews VALUES(?,?,?,?,?,?)',(review_id,candidate_id,principal.id,decision,edits,store.clock()))
        c.execute("UPDATE study_feedback SET state='reviewed' WHERE id=?",(candidate_id,))
        c.execute('UPDATE study_submissions SET state=? WHERE id=?',(decision,submission['id']))
        if decision=='returned':
            from .context import project_review
            project_review(store,c,review_id)
        return {'reviewId':review_id,'candidateId':candidate_id,'submissionId':submission['id'],'submissionRevision':expected_revision,'decision':decision,'text':edits,'humanReviewed':True,'syntheticTutor':True}
    return transact(store,principal,'feedback.reviewed',key,{'candidateId':candidate_id,'revision':expected_revision,'text':edits,'decision':decision},apply)


def list_feedback(store,principal,submission_id):
    submission=submission_for_actor(store,principal,submission_id)
    tutor=store.get_edition(submission['edition_id'])['teacherId']==principal.id
    result=[]
    for candidate in store.connection.execute('SELECT * FROM study_feedback WHERE submission_id=?',(submission_id,)):
        review=store.connection.execute('SELECT * FROM study_reviews WHERE candidate_id=?',(candidate['id'],)).fetchone()
        if review or tutor:
            record=candidate_dict(candidate)
            try:validate_sources(store,record['sourceRefs']);record['stale']=False
            except StudyError:record['stale']=True
            if review:record['review']={'id':review['id'],'text':review['text'],'decision':review['decision'],'syntheticTutor':True}
            result.append(record)
    return result
