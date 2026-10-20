"""Rebuildable LessonOS projection: review -> grounded segment -> observation.

The review is the authoritative event. Projections never grant permissions.
"""
import json
from .models import StudyError
from .store import identifier,canonical,digest
from .feedback import validate_sources


def project_review(store,c,review_id):
    row=c.execute('SELECT r.id,r.text,r.teacher_id,s.student_id,s.edition_id,s.id AS submission_id,f.source_refs FROM study_reviews r JOIN study_feedback f ON f.id=r.candidate_id JOIN study_submissions s ON s.id=f.submission_id WHERE r.id=? AND r.decision=\'returned\'',(review_id,)).fetchone()
    if not row:return
    refs=json.loads(row['source_refs'])
    context_id=f"edition-{row['edition_id']}-{row['student_id']}"
    if refs:
        context=c.execute('SELECT context_id FROM study_resources WHERE id=?',(refs[0]['resourceId'],)).fetchone()
        if context:context_id=context['context_id']
    c.execute('INSERT OR IGNORE INTO study_observations VALUES(?,?,?,?,?,?,?)',('study-'+review_id,review_id,row['student_id'],context_id,row['submission_id'],row['text'],row['source_refs']))
    try:
        validate_sources(store,refs)
    except StudyError:
        c.execute('DELETE FROM segments WHERE seg_id=?',('study-'+review_id,))
        return
    # These are the existing canonical LessonOS tables, in this same transaction.
    path_id='study-path-'+row['edition_id'];lesson_id='study-review-'+review_id;source_id='study-source-'+review_id;seg_id='study-'+review_id
    previous=c.execute('SELECT lesson_ids FROM paths WHERE path_id=?',(path_id,)).fetchone()
    lessons=json.loads(previous[0]) if previous else []
    if lesson_id not in lessons:lessons.append(lesson_id)
    c.execute('INSERT INTO paths(path_id,title,subject,lesson_ids,source_ids,synthetic,teacher_id) VALUES(?,?,?,?,?,1,?) ON CONFLICT(path_id) DO UPDATE SET lesson_ids=excluded.lesson_ids',(path_id,'Fisica: osservazioni revisionate','fisica',canonical(lessons),'[]',row['teacher_id']))
    c.execute('INSERT OR IGNORE INTO sources VALUES(?,?,?)',(source_id,'Review sintetica con fonte','text'))
    c.execute('INSERT OR IGNORE INTO lessons VALUES(?,?,?,?,?)',(lesson_id,path_id,'Review del tentativo',len(lessons),source_id))
    c.execute('INSERT OR IGNORE INTO segments VALUES(?,?,?,?,?)',(seg_id,lesson_id,0,1,row['text']))
    # A compact, meaningful relationship, grounded in the approved segment.
    c.execute('INSERT OR IGNORE INTO nodes VALUES(?,?,?,?,?)',('study-node-'+review_id,lesson_id,'concept','proporzioni','Grandezze fissate e potenze'))


def rebuild_projection(store):
    with store.transaction() as c:
        c.execute('DELETE FROM study_observations')
        for review in c.execute("SELECT id FROM study_reviews WHERE decision='returned' ORDER BY created_at,id").fetchall():project_review(store,c,review['id'])


def _invalidate_projection(c,resource_id):
    # Remove text from the legacy retrieval projection too, before commit.
    for row in c.execute('SELECT review_id,source_refs FROM study_observations').fetchall():
        if any(ref['resourceId']==resource_id for ref in json.loads(row['source_refs'])):
            c.execute('DELETE FROM segments WHERE seg_id=?',('study-'+row['review_id'],))


def revise_resource(store,principal,resource_id,expected_revision,text):
    resource=store.get_resource(principal,resource_id)
    if resource['ownerId']!=principal.id:raise StudyError('forbidden',403)
    if not isinstance(text,str) or not 1<=len(text)<=20_000:raise StudyError('invalid_text')
    revision=identifier()
    with store.transaction() as c:
        current=c.execute('SELECT current_revision FROM study_resources WHERE id=?',(resource_id,)).fetchone()
        if current is None:raise StudyError('forbidden',403)
        if current[0]!=expected_revision:raise StudyError('stale_revision',409)
        c.execute('INSERT INTO study_revisions VALUES(?,?,?,?,?)',(revision,resource_id,text,digest(text),store.clock()))
        updated=c.execute('UPDATE study_resources SET current_revision=? WHERE id=? AND current_revision=? AND deleted=0',
            (revision,resource_id,expected_revision))
        if updated.rowcount!=1:raise StudyError('stale_revision',409)
        _invalidate_projection(c,resource_id)
        store._event(c,principal,'resource.revised',resource_id,{'revisionId':revision})
    return store.get_resource(principal,resource_id)


def delete_resource(store,principal,resource_id):
    resource=store.get_resource(principal,resource_id)
    if resource['ownerId']!=principal.id:raise StudyError('forbidden',403)
    with store.transaction() as c:
        c.execute('UPDATE study_resources SET deleted=1 WHERE id=?',(resource_id,))
        _invalidate_projection(c,resource_id)
        store._event(c,principal,'resource.deleted',resource_id,{})


def retrieve_context(store,principal,context_id,query,limit=6):
    # Scope lookup is deliberately before the text-search loop.
    store._principal(principal)
    resources=store.connection.execute('SELECT id FROM study_resources WHERE context_id=? AND deleted=0',(context_id,)).fetchall()
    if not resources:raise StudyError('context_not_found',404)
    resource=store.get_resource(principal,resources[0]['id'])
    observations=[];omitted=0
    sql='SELECT o.*,s.text AS attempt FROM study_observations o JOIN study_submissions s ON s.id=o.submission_id WHERE o.context_id=?'
    parameters=[context_id]
    if store.get_edition(resource['editionId'])['teacherId']!=principal.id:
        sql+=' AND o.student_id=?';parameters.append(principal.id)
    for row in store.connection.execute(sql+' ORDER BY o.id',parameters):
        try:
            validate_sources(store,json.loads(row['source_refs']))
            segment=store.legacy.get_segment('study-'+row['review_id'])
            if segment is None or segment.text!=row['text']:raise StudyError('ungrounded')
        except StudyError:omitted+=1;continue
        if query and not any(word in (row['text']+' '+row['attempt']).casefold() for word in query.casefold().split()):continue
        refs=json.loads(row['source_refs'])
        observations.append({'id':row['id'],'reviewId':row['review_id'],'text':row['text'],'evidence':{'submissionId':row['submission_id'],'sourceId':refs[0]['resourceId'] if refs else None,'revisionId':refs[0]['revisionId'] if refs else None,'segmentId':segment.seg_id,'text':row['attempt']},'status':'reviewed_synthetic','relations':['attempt_of','feedback_on','supports']})
    return {'contextId':context_id,'resource':resource,'observations':observations[:max(0,min(limit,6))],'omittedStale':omitted,'limits':['La provenienza non certifica la correttezza disciplinare.','Review eseguita da tutor sintetico.']}
