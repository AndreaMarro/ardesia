import json
from .models import StudyError
from .store import identifier,canonical,digest
from .activities import ACTIVITY_ID
from .transactions import transact


def _assigned_activity(store, principal, edition_id, activity_id, thread_id=None, parameters=None):
    if activity_id == ACTIVITY_ID:
        return None
    from .diary import get_diary
    assigned = [thread for thread in get_diary(store, principal, edition_id)['threads']
                if thread['status'] in ('OPEN', 'PRACTISING', 'RECURRED')
                and thread.get('sourceState') == 'CURRENT'
                and thread.get('transferExercise', {}).get('exerciseId') == activity_id
                and (thread_id is None or thread['threadId'] == thread_id)]
    if not assigned:
        raise StudyError('activity_not_assigned', 403)
    if len(assigned) != 1:
        raise StudyError('activity_assignment_ambiguous', 409)
    thread = assigned[0]
    plan = thread['transferExercise']
    if parameters is not None and canonical(parameters) != canonical(plan['parameters']):
        raise StudyError('transfer_plan_mismatch', 409)
    return {'threadId': thread['threadId'], 'exerciseId': activity_id,
            'parameters': plan['parameters'], 'prompt': plan['prompt'],
            'rubric': thread['feedback']['rubric'],
            'assignedAfterEventSeq': thread['history'][-1]['seq']}


def submit(store,principal,edition_id,activity_id,asset_refs,text,key,parent_id=None,source_refs=None,diary_thread_id=None,activity_parameters=None):
    store._edition_access(principal,edition_id)
    if principal.role!='student':raise StudyError('forbidden',403)
    if not isinstance(text,str) or len(text)>20_000 or not (text.strip() or asset_refs):raise StudyError('invalid_submission')
    if not isinstance(asset_refs,list) or len(asset_refs)>5 or any(not isinstance(ref,str) or len(ref)>128 for ref in asset_refs) or len(set(asset_refs))!=len(asset_refs):raise StudyError('invalid_attachments')
    source_refs=source_refs or []
    if not isinstance(source_refs,list) or len(source_refs)>5 or any(not isinstance(ref,dict) or not isinstance(ref.get('resourceId'),str) or not isinstance(ref.get('revisionId'),str) for ref in source_refs):raise StudyError('invalid_source_refs')
    payload={'editionId':edition_id,'activityId':activity_id,'assetRefs':asset_refs,'text':text,'parentId':parent_id,'sourceRefs':source_refs}
    if diary_thread_id is not None:payload['diaryThreadId']=diary_thread_id
    if activity_parameters is not None:payload['activityParameters']=activity_parameters
    def apply(c):
        activity_context=_assigned_activity(store,principal,edition_id,activity_id,diary_thread_id,activity_parameters)
        total=0
        for asset_id in asset_refs:
            row=c.execute('SELECT * FROM study_assets WHERE id=? AND deleted=0',(asset_id,)).fetchone()
            if row is None or row['owner_id']!=principal.id or row['edition_id']!=edition_id:raise StudyError('forbidden',403)
            total+=row['bytes']
        if total>50*1024*1024:raise StudyError('attachments_too_large',413)
        for ref in source_refs:
            resource=store.get_resource(principal,ref['resourceId'])
            if resource['editionId']!=edition_id or resource['revisionId']!=ref['revisionId']:raise StudyError('stale_source',409)
        revision=1
        if parent_id:
            parent=c.execute('SELECT * FROM study_submissions WHERE id=?',(parent_id,)).fetchone()
            if not parent or parent['student_id']!=principal.id or parent['edition_id']!=edition_id or parent['activity_id']!=activity_id:raise StudyError('forbidden',403)
            if c.execute('SELECT 1 FROM study_submissions WHERE parent_id=?',(parent_id,)).fetchone():raise StudyError('newer_attempt_exists',409)
            revision=parent['revision']+1
        submission_id,receipt_id=identifier(),identifier()
        effective_refs=list(source_refs)
        if not effective_refs:
            # A direct text/media submission is still an original source. Persist
            # it atomically, so review and a later meeting have a resolvable context.
            resource_id,revision_id=identifier(),identifier()
            context_id=f'edition-{edition_id}-{principal.id}'
            source_text=text if text.strip() else 'Originale multimediale privato: lettura manuale richiesta.'
            c.execute('INSERT INTO study_resources(id,edition_id,owner_id,kind,visibility,context_id,current_revision) VALUES(?,?,?,?,?,?,?)',(resource_id,edition_id,principal.id,'attempt-source','private',context_id,revision_id))
            c.execute('INSERT INTO study_revisions VALUES(?,?,?,?,?)',(revision_id,resource_id,source_text,digest(source_text),store.clock()))
            effective_refs=[{'resourceId':resource_id,'revisionId':revision_id,'contextId':context_id}]
        c.execute('INSERT INTO study_submissions(id,edition_id,student_id,activity_id,revision,parent_id,text,asset_refs,source_refs,receipt_id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)', (submission_id,edition_id,principal.id,activity_id,revision,parent_id,text,canonical(asset_refs),canonical(effective_refs),receipt_id,store.clock()))
        body={'receiptId':receipt_id,'submissionId':submission_id,'studentId':principal.id,'activityId':activity_id,'revision':revision,'parentId':parent_id,'receivedAt':store.clock(),'state':'received'}
        if activity_context is not None:body['activityContext']=activity_context
        return body
    return transact(store,principal,'submission.received',key,payload,apply)


def get_receipt(store,principal,receipt_id):
    row=store.connection.execute("SELECT * FROM study_submissions WHERE receipt_id=?",(receipt_id,)).fetchone()
    if row is None:raise StudyError('not_found',404)
    edition=store._edition_access(principal,row['edition_id'])
    if row['student_id']!=principal.id and edition['teacherId']!=principal.id:raise StudyError('forbidden',403)
    return json.loads(store.connection.execute('SELECT body FROM study_receipts WHERE id=?',(receipt_id,)).fetchone()[0])


def list_submissions(store,principal,edition_id):
    edition=store._edition_access(principal,edition_id)
    query='SELECT * FROM study_submissions WHERE edition_id=?'
    parameters=[edition_id]
    if edition['teacherId']!=principal.id:query+=' AND student_id=?';parameters.append(principal.id)
    rows=store.connection.execute(query+' ORDER BY created_at',parameters).fetchall()
    return [{**dict(row),'asset_refs':json.loads(row['asset_refs']),'source_refs':json.loads(row['source_refs'])} for row in rows]
