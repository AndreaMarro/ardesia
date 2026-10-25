"""Two subjects, same facts, same authorization and tutor-reviewed lifecycle."""
import json
from concurrent.futures import ThreadPoolExecutor
import pytest
from lessonos.study import diary
from lessonos.study.context import retrieve_context, revise_resource
from lessonos.study.coursepack import load_coursepack, review_manifest
from lessonos.study.feedback import propose_feedback, review_feedback
from lessonos.study.models import StudyError
from lessonos.study.store import StudyStore
from lessonos.study.submissions import submit, get_receipt
from test_identity_store import setup_store


def setup_analysis(tmp_path):
    store, physics, student, peer, analysis = setup_store(tmp_path)
    store.create_edition(analysis, 'analisi', course_id='analisi-1', pack_id='taylor-exp-v1')
    store.add_test_member(analysis, 'analisi', student.id)
    store.add_test_member(analysis, 'analisi', peer.id)
    return store, physics, student, peer, analysis


def answer(store,student,key='answer',**extra):
    return submit(store,student,'analisi','taylor-exp-v1',[],
        'Ho sostituito 3! con 3 e contato tre termini.',key,
        activity_parameters={'x':.5,'degree':3},**extra)


def test_analysis_submission_pins_course_model_and_parameters_in_canonical_receipt(tmp_path):
    store, _, student, _, _ = setup_analysis(tmp_path)
    first = answer(store,student)
    assert answer(store,student) == first == get_receipt(store,student,first['receiptId'])
    assert 'activityContext' not in first  # Reserved for explicitly assigned diary transfer.
    context = first['courseContext']
    assert context['courseId']=='analisi-1' and context['packId']=='taylor-exp-v1'
    assert context['packVersion']==context['modelVersion']==1 and len(context['packSha256'])==64
    assert context['parameters']=={'x':.5,'degree':3} and context['modelId']=='taylor-exp-v1'
    with pytest.raises(StudyError,match='idempotency_conflict'):
        submit(store,student,'analisi','taylor-exp-v1',[],'Changed','answer',activity_parameters={'x':.25,'degree':3})
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0]==1
    store.close()


def test_second_subject_uses_existing_review_grounded_context_and_diary(tmp_path):
    store, physics, student, peer, analysis = setup_analysis(tmp_path)
    initial = answer(store,student)
    row = store.connection.execute('SELECT * FROM study_submissions WHERE id=?',(initial['submissionId'],)).fetchone()
    ref = json.loads(row['source_refs'])[0]
    candidate = propose_feedback(store,analysis,initial['submissionId'])
    assert 'fattoriale' in candidate['text'] and 'raggio' not in candidate['text']
    review = review_feedback(store,analysis,candidate['id'],1,
        'Il grado tre richiede quattro termini. Il denominatore è il fattoriale, non l’indice.','review')
    assert review['syntheticTutor'] is True
    context = retrieve_context(store,student,ref['contextId'],'fattoriale')
    assert context['observations'][0]['evidence']['submissionId']==initial['submissionId']
    assert store.legacy.get_segment(context['observations'][0]['evidence']['segmentId']) is not None
    projected = store.connection.execute("SELECT subject,title FROM paths WHERE path_id='study-path-analisi'").fetchone()
    assert projected['subject']=='analisi' and 'Analisi' in projected['title']
    node = store.connection.execute('SELECT label FROM nodes WHERE node_id=?',('study-node-'+review['reviewId'],)).fetchone()
    assert 'fattoriale' in node[0]
    source = store.get_resource(student,ref['resourceId'])
    anchor = {**ref,'start':0,'end':len(source['text']),'quote':source['text']}
    thread = diary.propose_error(store,analysis,initial['submissionId'],'taylor-factorial','procedure',anchor,'propose')
    plan={'exerciseId':'TT-01','originalParameters':{'x':.5,'degree':3},'parameters':{'x':1,'degree':6},'prompt':'Trova il grado dal vincolo sul resto, motivando il minimo.'}
    diary.confirm_error(store,analysis,thread['threadId'],{'criterion':'Grado e resto','procedureRequired':True},
        'Il fattoriale cambia il resto.','Parti dal vincolo di errore.','confirm',transfer_exercise=plan)
    procedure='Scelgo il grado sei perché 3/7! è minore di 0,001; il grado cinque non soddisfa il vincolo.'
    transfer=submit(store,student,'analisi','TT-01',[],procedure,'transfer',activity_parameters=plan['parameters'])
    attempted=diary.record_practice(store,student,thread['threadId'],transfer['submissionId'],'TT-01',plan['parameters'],'practice')
    assert attempted['status']=='PRACTISING'
    resolved=diary.verify_transfer(store,analysis,thread['threadId'],attempted['attempts'][-1]['attemptId'],
        {'criterion':'Grado e resto','procedureQuote':'Scelgo il grado sei perché 3/7!',
         'reasoning':'È dichiarato un maggiorante conservativo, non un confronto float.',
         'variationReason':'Il compito inverso richiede scegliere il grado dal budget di errore.'},'verify')
    assert resolved['status']=='VERIFIED_RESOLVED'
    assert review_manifest(load_coursepack('taylor-exp-v1'))['scientificApproval']=='NOT_RUN'
    for actor in (physics,peer):
        with pytest.raises(StudyError):diary.get_thread(store,actor,thread['threadId'])
    store.close()


@pytest.mark.parametrize('edition,activity,params',[
    ('fluidi','taylor-exp-v1',{'x':.5,'degree':3}), ('analisi','poiseuille-v1',None),
    ('analisi','unknown',None),
])
def test_activity_from_another_pack_is_not_assigned_and_leaves_no_facts(tmp_path,edition,activity,params):
    store, _, student, *_ = setup_analysis(tmp_path)
    with pytest.raises(StudyError,match='activity_not_assigned'):
        submit(store,student,edition,activity,[],'Procedimento','wrong-pack',activity_parameters=params)
    for table in ('study_submissions','study_receipts','study_events','study_resources'):
        assert store.connection.execute('SELECT COUNT(*) FROM '+table).fetchone()[0]==0
    store.close()


@pytest.mark.parametrize('parameters',[None,{}, {'x':.5,'degree':True}])
def test_taylor_submission_requires_valid_declared_parameters_before_writes(tmp_path,parameters):
    store, _, student, *_ = setup_analysis(tmp_path)
    with pytest.raises(StudyError,match='invalid_parameters'):
        submit(store,student,'analisi','taylor-exp-v1',[],'Procedimento','invalid',activity_parameters=parameters)
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0]==0
    store.close()


def test_student_career_spans_courses_but_new_teacher_does_not_inherit_history(tmp_path):
    store, physics, student, peer, analysis = setup_analysis(tmp_path)
    old=submit(store,student,'fluidi','poiseuille-v1',[],'Prima osservazione privata fisica.','old')
    old_ref=json.loads(store.connection.execute('SELECT source_refs FROM study_submissions WHERE id=?',(old['submissionId'],)).fetchone()[0])[0]
    old_source=store.get_resource(student,old_ref['resourceId'])
    old_thread=diary.propose_error(store,physics,old['submissionId'],'radius','procedure',
        {**old_ref,'start':0,'end':len(old_source['text']),'quote':old_source['text']},'old-error')
    new=answer(store,student)
    new_ref=json.loads(store.connection.execute('SELECT source_refs FROM study_submissions WHERE id=?',(new['submissionId'],)).fetchone()[0])[0]
    new_source=store.get_resource(student,new_ref['resourceId'])
    new_thread=diary.propose_error(store,analysis,new['submissionId'],'factorial','procedure',
        {**new_ref,'start':0,'end':len(new_source['text']),'quote':new_source['text']},'new-error')
    assert {t['threadId'] for t in diary.get_diary(store,student)['threads']}=={old_thread['threadId'],new_thread['threadId']}
    assert [t['threadId'] for t in diary.get_diary(store,analysis,'analisi')['threads']]==[new_thread['threadId']]
    assert [t['threadId'] for t in diary.get_diary(store,physics,'fluidi')['threads']]==[old_thread['threadId']]
    assert diary.get_diary(store,peer)['threads']==[]
    with pytest.raises(StudyError):store.get_resource(analysis,old_source['id'])
    with pytest.raises(StudyError):store.get_resource(physics,new_source['id'])
    store.close()
    reopened=StudyStore(tmp_path/'study.sqlite')
    assert len(diary.get_diary(reopened,student)['threads'])==2
    assert get_receipt(reopened,student,new['receiptId'])==new
    assert reopened.get_edition('analisi')['packSha256']==new['courseContext']['packSha256']
    reopened.close()


def test_same_actor_key_concurrent_taylor_commands_keep_one_submission(tmp_path):
    store, _, student, *_=setup_analysis(tmp_path);path=store.path
    def send(_):
        other=StudyStore(path)
        try:return answer(other,student,'concurrent')
        finally:other.close()
    with ThreadPoolExecutor(max_workers=2) as pool:receipts=list(pool.map(send,range(2)))
    assert receipts[0]==receipts[1]
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0]==1
    store.close()


def test_analysis_hint_uses_pack_guidance_and_keeps_zero_spend(tmp_path):
    from lessonos.study.ai_jobs import request_hint
    store,_,student,*_=setup_analysis(tmp_path)
    receipt=answer(store,student)
    refs=json.loads(store.connection.execute('SELECT source_refs FROM study_submissions WHERE id=?',(receipt['submissionId'],)).fetchone()[0])
    hint=request_hint(store,student,refs[0]['resourceId'],2,'hint')
    assert 'fattoriale' in hint['text'] and 'raggio' not in hint['text']
    assert hint['liveCalls']==0 and hint['costUsd']==0
    store.close()
