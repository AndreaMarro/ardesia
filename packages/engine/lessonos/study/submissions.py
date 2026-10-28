import json
from .models import StudyError
from .store import identifier,canonical,digest
from .coursepack import base_activity_ids
from .transactions import transact


def _assigned_activity(store, principal, edition_id, activity_id, thread_id=None, parameters=None):
    from .catalog import edition_pack
    binding=edition_pack(store,edition_id)
    if activity_id in base_activity_ids(binding['packId'],binding['packVersion']):
        return None
    from .diary import get_diary
    assigned = [thread for thread in get_diary(store, principal, edition_id)['threads']
                if thread['editionId'] == edition_id
                and thread['status'] in ('OPEN', 'PRACTISING', 'RECURRED')
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


def submit(store,principal,edition_id,activity_id,asset_refs,text,key,parent_id=None,source_refs=None,diary_thread_id=None,activity_parameters=None,activity_evidence=None,course_lesson=None):
    store._edition_access(principal,edition_id)
    if principal.role!='student':raise StudyError('forbidden',403)
    if not isinstance(text,str) or len(text)>20_000 or not (text.strip() or asset_refs):raise StudyError('invalid_submission')
    if not isinstance(asset_refs,list) or len(asset_refs)>5 or any(not isinstance(ref,str) or len(ref)>128 for ref in asset_refs) or len(set(asset_refs))!=len(asset_refs):raise StudyError('invalid_attachments')
    if not isinstance(activity_id,str) or not 1<=len(activity_id)<=128:raise StudyError('invalid_activity')
    source_refs=source_refs or []
    if not isinstance(source_refs,list) or len(source_refs)>5 or any(not isinstance(ref,dict) or not isinstance(ref.get('resourceId'),str) or not isinstance(ref.get('revisionId'),str) for ref in source_refs):raise StudyError('invalid_source_refs')
    # Episode evidence always preserves its own original as one additional ref;
    # the portable notebook contract permits at most five refs in total.
    if activity_evidence is not None and len(source_refs)>4:raise StudyError('invalid_source_refs')
    payload={'editionId':edition_id,'activityId':activity_id,'assetRefs':asset_refs,'text':text,'parentId':parent_id,'sourceRefs':source_refs}
    if diary_thread_id is not None:payload['diaryThreadId']=diary_thread_id
    if activity_parameters is not None:payload['activityParameters']=activity_parameters
    if activity_evidence is not None:payload['activityEvidence']=activity_evidence
    if course_lesson is not None:payload['courseLesson']=course_lesson
    def apply(c):
        manual = activity_id == 'course-reasoning-v1'
        if manual and (course_lesson is None or activity_parameters not in (None, {})):
            raise StudyError('invalid_course_lesson')
        activity_context=None if manual else _assigned_activity(store,principal,edition_id,activity_id,diary_thread_id,activity_parameters)
        from .catalog import submission_course_context
        course_context=submission_course_context(store,edition_id,activity_id,{} if manual else activity_parameters,activity_context)
        from .course_lesson_context import freeze_course_lesson, require_same_parent_lesson
        lesson_context=freeze_course_lesson(store,principal,edition_id,activity_id,course_lesson,course_context['parameters'])
        if lesson_context is not None:course_context.update(lesson_context)
        if manual:course_context.update({'modelId':None,'modelVersion':None,'reviewMode':'MANUAL_REVIEW_REQUIRED'})
        evidence=None
        if activity_evidence is not None:
            from .learning_experiences import freeze_activity_evidence
            evidence=freeze_activity_evidence(store,principal,edition_id,activity_id,activity_parameters,activity_evidence,source_refs)
        total=0
        for asset_id in asset_refs:
            row=c.execute('SELECT * FROM study_assets WHERE id=? AND deleted=0',(asset_id,)).fetchone()
            if row is None or row['owner_id']!=principal.id or row['edition_id']!=edition_id:raise StudyError('forbidden',403)
            total+=row['bytes']
        if total>50*1024*1024:raise StudyError('attachments_too_large',413)
        for ref in source_refs:
            resource=store.get_resource(principal,ref['resourceId'])
            if resource['editionId']!=edition_id or resource['revisionId']!=ref['revisionId']:raise StudyError('stale_source',409)
            if manual and resource['kind']=='science-resource':
                from .science_library.resources import read as read_science
                saved=read_science(store,principal,ref['resourceId'],ref['revisionId'])['snapshot']
                saved_lesson=saved.get('courseLesson')
                if saved_lesson is not None and any(saved_lesson[k] != course_context[k] for k in ('lessonRef','phase')):
                    raise StudyError('source_course_lesson_mismatch',409)
                lab_lesson=saved.get('labSnapshot',{}).get('configuration',{}).get('lessonRef')
                if lab_lesson is not None and lab_lesson != course_context['lessonRef']:
                    raise StudyError('source_course_lesson_mismatch',409)
            if resource['kind']=='scientific-notebook':
                if resource['notebook']['source']['assetId'] not in asset_refs:
                    raise StudyError('notebook_original_required')
                if ref.get('contextId',resource['contextId'])!=resource['contextId']:
                    raise StudyError('invalid_source_refs')
        revision=1
        if parent_id:
            store.lock_aggregate(c, 'submission.parent', parent_id)
            parent=c.execute('SELECT * FROM study_submissions WHERE id=?',(parent_id,)).fetchone()
            if not parent or parent['student_id']!=principal.id or parent['edition_id']!=edition_id or parent['activity_id']!=activity_id:raise StudyError('forbidden',403)
            parent_receipt=c.execute('SELECT body FROM study_receipts WHERE id=?',(parent['receipt_id'],)).fetchone()
            parent_context=json.loads(parent_receipt['body']).get('courseContext',{}) if parent_receipt else {}
            require_same_parent_lesson(parent_context,course_context)
            if c.execute('SELECT 1 FROM study_submissions WHERE parent_id=?',(parent_id,)).fetchone():raise StudyError('newer_attempt_exists',409)
            revision=parent['revision']+1
        submission_id,receipt_id=identifier(),identifier()
        effective_refs=list(source_refs)
        if not effective_refs or evidence is not None:
            # A direct text/media submission is still an original source. Persist
            # it atomically, so review and a later meeting have a resolvable context.
            resource_id,revision_id=identifier(),identifier()
            context_id=f'edition-{edition_id}-{principal.id}'
            source_text=text if text.strip() else 'Originale multimediale privato: lettura manuale richiesta.'
            c.execute('INSERT INTO study_resources(id,edition_id,owner_id,kind,visibility,context_id,current_revision) VALUES(?,?,?,?,?,?,?)',(resource_id,edition_id,principal.id,'attempt-source','private',context_id,revision_id))
            c.execute('INSERT INTO study_revisions VALUES(?,?,?,?,?)',(revision_id,resource_id,source_text,digest(source_text),store.clock()))
            effective_refs.insert(0,{'resourceId':resource_id,'revisionId':revision_id,'contextId':context_id})
        c.execute('INSERT INTO study_submissions(id,edition_id,student_id,activity_id,revision,parent_id,text,asset_refs,source_refs,receipt_id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)', (submission_id,edition_id,principal.id,activity_id,revision,parent_id,text,canonical(asset_refs),canonical(effective_refs),receipt_id,store.clock()))
        body={'receiptId':receipt_id,'submissionId':submission_id,'studentId':principal.id,'activityId':activity_id,'revision':revision,'parentId':parent_id,'receivedAt':store.clock(),'state':'received','courseContext':course_context}
        if manual:body['review']={'state':'MANUAL_REVIEW_REQUIRED','originalText':text}
        if activity_context is not None:body['activityContext']=activity_context
        if evidence is not None:body['activityEvidence']=evidence
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
    query='SELECT s.*,r.body AS receipt_body FROM study_submissions s LEFT JOIN study_receipts r ON r.id=s.receipt_id WHERE s.edition_id=?'
    parameters=[edition_id]
    if edition['teacherId']!=principal.id:query+=' AND s.student_id=?';parameters.append(principal.id)
    rows=store.connection.execute(query+' ORDER BY s.created_at',parameters).fetchall()
    result=[]
    for row in rows:
        item=dict(row)
        receipt=json.loads(item.pop('receipt_body') or '{}')
        if 'activityEvidence' in receipt:item['activityEvidence']=receipt['activityEvidence']
        if 'courseContext' in receipt:item['courseContext']=receipt['courseContext']
        result.append({**item,'asset_refs':json.loads(row['asset_refs']),'source_refs':json.loads(row['source_refs'])})
    return result
