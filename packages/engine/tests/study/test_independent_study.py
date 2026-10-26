"""Breaks caught: answer leakage, duplicate receipts, lost context, peer access, false mastery."""
import json
import pytest
from lessonos.study.store import StudyStore
from lessonos.study.models import StudyError
from lessonos.study.independent_study import catalog, start, resume, act, attempt

@pytest.fixture
def course(tmp_path):
    s=StudyStore(tmp_path/'study.sqlite',clock=lambda:1000)
    t=s.create_principal('tutor-s06','teacher')
    a=s.create_principal('student-s06-a','student')
    b=s.create_principal('student-s06-b','student')
    s.create_edition(t,'mechanics',course_id='strumenti-meccanica',pack_id='sf-strumenti-meccanica-v1',pack_version=1)
    s.add_test_member(t,'mechanics',a.id); s.add_test_member(t,'mechanics',b.id)
    yield s,t,a,b
    s.close()

def move(s,a,state,action,**fields):
    return act(s,a,state['id'],state['revisionId'],action,fields,'action-'+state['revisionId']+action)

def begin_practice(s,a):
    item=catalog(s,a,'mechanics')['objectives'][0]
    state=start(s,a,'mechanics',item['lessonRef'],'begin')
    state=move(s,a,state,'diagnostic',text='Devo controllare unità e proporzionalità.')
    state=move(s,a,state,'next')
    state=move(s,a,state,'simulate',caseIndex=0)
    return move(s,a,state,'next')

def test_real_receipt_retry_and_cold_reopen_keep_exact_source_and_hide_solution(course):
    s,t,a,b=course
    state=begin_practice(s,a)
    assert state['phase']=='practice'
    assert 'answer' not in state['task'] and 'solution' not in state['task']
    response=attempt(s,a,state['id'],state['revisionId'],{'value':999,'unit':'m','reasoning':'F = kx'},'attempt-1')
    assert response['feedback']['numericCorrect'] is False
    assert response['receipt']['state']=='received'
    assert response['feedback']['mastery']=='NOT_INFERRED'
    assert attempt(s,a,state['id'],state['revisionId'],{'value':999,'unit':'m','reasoning':'F = kx'},'attempt-1')==response
    restored=resume(s,a,state['id'])
    assert restored['attempts'][0]['receipt']['receiptId']==response['receipt']['receiptId']
    source=response['sourceRef']
    frozen=s.get_resource_revision(a,source['resourceId'],source['revisionId'])
    body=json.loads(frozen['text'])
    assert body['lessonRef']==state['lessonRef'] and body['phase']=='practice'
    assert body['assistance']['observed']==['simulation']
    db=s.path;s.close();s=StudyStore(db,clock=lambda:1000,initialize=False)
    try:
        second=resume(s,a,state['id'])
        assert second['lessonRef']==state['lessonRef']
        assert second['sourceRef']==state['sourceRef']
        assert 'answer' not in second['task']
        assert len(second['attempts'])==1
    finally:s.close()

def test_hint_retry_and_transfer_do_not_become_mastery(course):
    s,t,a,b=course; state=begin_practice(s,a)
    state=move(s,a,state,'hint')
    result=attempt(s,a,state['id'],state['revisionId'],{'value':999,'unit':'m','reasoning':'Ipotesi'},'assisted')
    assert result['feedback']['assistance']['observed']==['simulation','hint-1']
    state=resume(s,a,state['id'])
    state=move(s,a,state,'recover')
    assert state['phase']=='recovery' and state['source']['explanation']
    state=move(s,a,state,'next')
    assert state['phase']=='transfer'
    assert state['task']['parameters']!=result['receipt']['courseContext']['parameters']
    assert resume(s,a,state['id'])['mastery']=='NOT_INFERRED'

def test_permissions_stale_revision_invalid_ref_and_idempotency(course):
    s,t,a,b=course
    item=catalog(s,a,'mechanics')['objectives'][0]
    state=start(s,a,'mechanics',item['lessonRef'],'start-idem')
    assert start(s,a,'mechanics',item['lessonRef'],'start-idem')==state
    with pytest.raises(StudyError,match='forbidden'):resume(s,b,state['id'])
    with pytest.raises(StudyError,match='forbidden'):resume(s,t,state['id'])
    changed=move(s,a,state,'diagnostic',text='Una previsione')
    with pytest.raises(StudyError,match='stale_revision'):
        act(s,a,state['id'],state['revisionId'],'next',{},'old')
    assert changed['phase']=='explanation'
    with pytest.raises(StudyError,match='lesson_unavailable'):
        start(s,a,'mechanics',{**item['lessonRef'],'sha256':'0'*64},'bad')
    with pytest.raises(StudyError,match='study_phase_conflict'):
        attempt(s,a,changed['id'],changed['revisionId'],{'value':0,'unit':'m','reasoning':'x'},'early')

@pytest.mark.parametrize('path',['strumenti-meccanica','fluidi-termodinamica','elettricita-magnetismo','onde-ottica-radiazioni','analisi-1'])
def test_five_existing_packs_use_same_flow_without_teacher_online(tmp_path,path):
    s=StudyStore(tmp_path/'study.sqlite');t=s.create_principal('tutor-s06','teacher');a=s.create_principal('student-s06','student')
    pack='taylor-exp-v1' if path=='analisi-1' else 'sf-'+path+'-v1'
    s.create_edition(t,'course',course_id=path,pack_id=pack,pack_version=1);s.add_test_member(t,'course',a.id)
    items=catalog(s,a,'course')['objectives']; assert items
    for index,item in enumerate(items):
        assert item['humanApproval'] is False
        state=start(s,a,'course',item['lessonRef'],'start-'+str(index))
        assert state['phase']=='diagnostic' and state['lessonRef']==item['lessonRef']
        assert state['mastery']=='NOT_INFERRED'
    s.close()

def test_generic_resource_edit_cannot_erase_observed_assistance(course):
    from lessonos.study.context import revise_resource
    s,t,a,b=course;state=begin_practice(s,a);state=move(s,a,state,'hint')
    raw=s.get_resource(a,state['id']); forged=json.loads(raw['text']);forged['phaseSupport']=[]
    revise_resource(s,a,state['id'],state['revisionId'],json.dumps(forged))
    with pytest.raises(StudyError,match='invalid_study_revision'):resume(s,a,state['id'])

def test_interrupted_canonical_submission_is_recovered_without_duplicate_or_lost_help(course,monkeypatch):
    import lessonos.study.independent_study as module
    s,t,a,b=course;state=begin_practice(s,a);state=move(s,a,state,'hint')
    real=module.submit
    def interrupted(*args,**kwargs):
        real(*args,**kwargs)
        raise OSError('response lost after commit')
    monkeypatch.setattr(module,'submit',interrupted)
    answer={'value':999,'unit':'m','reasoning':'Controllo la legge.'}
    with pytest.raises(OSError):attempt(s,a,state['id'],state['revisionId'],answer,'lost')
    pending=resume(s,a,state['id'])
    assert pending['pendingAttempt']['key']=='lost'
    with pytest.raises(StudyError,match='study_attempt_pending'):
        move(s,a,pending,'hint')
    monkeypatch.setattr(module,'submit',real)
    result=attempt(s,a,state['id'],state['revisionId'],answer,'lost')
    assert result['feedback']['assistance']['observed']==['simulation','hint-1']
    assert s.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0]==1
    assert resume(s,a,state['id'])['pendingAttempt'] is None

def test_simulation_changes_parameters_through_core_and_rejects_unlisted_inputs(course):
    s,t,a,b=course
    item=catalog(s,a,'mechanics')['objectives'][0]
    state=start(s,a,'mechanics',item['lessonRef'],'simulator')
    state=move(s,a,state,'diagnostic',text='Controllo F/k');state=move(s,a,state,'next')
    changed=move(s,a,state,'simulate',parameters={'force':4,'stiffness':20})
    assert changed['simulation']['result']['value']==0.2
    assert changed['simulation']['parameters']=={'force':4,'stiffness':20}
    with pytest.raises(StudyError,match='invalid_study_simulation'):
        move(s,a,changed,'simulate',parameters={'force':-4,'stiffness':20})

def test_review_interval_is_explainable_overridable_and_never_mastery(course):
    s,t,a,b=course;state=begin_practice(s,a)
    attempt(s,a,state['id'],state['revisionId'],{'value':999,'unit':'m','reasoning':'prova'},'wrong')
    state=resume(s,a,state['id']);state=move(s,a,state,'recover');state=move(s,a,state,'next')
    attempt(s,a,state['id'],state['revisionId'],{'value':0.075,'unit':'m','reasoning':'F/k nel nuovo problema'},'new')
    state=resume(s,a,state['id']);state=move(s,a,state,'finish')
    assert state['reviewAt']==1000+3*86400 and state['mastery']=='NOT_INFERRED'
    state=move(s,a,state,'schedule',days=7)
    assert state['reviewAt']==1000+7*86400 and 'scelta da te' in state['reviewReason']
    state=move(s,a,state,'dispute',text='Il modello trascura un vincolo.')
    assert state['dispute']['status']=='RECORDED_NOT_SENT'
    state=move(s,a,state,'restart');assert state['phase']=='diagnostic' and state['cycle']==1

@pytest.mark.parametrize('value',[float('nan'),float('inf'),True,'4',None])
def test_invalid_numeric_answer_is_a_domain_error_without_preparing_attempt(course,value):
    s,t,a,b=course;state=begin_practice(s,a)
    with pytest.raises(StudyError,match='invalid_study_answer'):
        attempt(s,a,state['id'],state['revisionId'],{'value':value,'unit':'m','reasoning':'x'},'invalid')
    assert resume(s,a,state['id'])['pendingAttempt'] is None

def test_repeating_an_exposed_answer_is_assisted_even_without_requesting_a_hint(course):
    s,t,a,b=course
    item=catalog(s,a,'mechanics')['objectives'][0];state=start(s,a,'mechanics',item['lessonRef'],'exposure')
    state=move(s,a,state,'diagnostic',text='F/k');state=move(s,a,state,'next');state=move(s,a,state,'next')
    attempt(s,a,state['id'],state['revisionId'],{'value':999,'unit':'m','reasoning':'Prima ipotesi'},'exposure1')
    state=resume(s,a,state['id'])
    next_answer=attempt(s,a,state['id'],state['revisionId'],{'value':0.2,'unit':'m','reasoning':'Ho visto il confronto'},'exposure2')
    assert next_answer['feedback']['numericCorrect'] is True
    assert next_answer['feedback']['assistance']['observed']==['previous-feedback']
    assert next_answer['feedback']['mastery']=='NOT_INFERRED'

def test_pending_retry_keeps_exact_input_whitespace(course,monkeypatch):
    import lessonos.study.independent_study as module
    s,t,a,b=course;state=begin_practice(s,a);real=module.submit
    def interrupted(*args,**kwargs):
        real(*args,**kwargs);raise OSError('committed before response lost')
    monkeypatch.setattr(module,'submit',interrupted)
    answer={'value':0.2,'unit':'m','reasoning':'  My proof  '}
    with pytest.raises(OSError):attempt(s,a,state['id'],state['revisionId'],answer,'spaces')
    pending=resume(s,a,state['id'])['pendingAttempt']
    assert pending['answer']==answer
    monkeypatch.setattr(module,'submit',real)
    recovered=attempt(s,a,state['id'],pending['revisionId'],pending['answer'],pending['key'])
    assert recovered['receipt']['state']=='received'
    assert s.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0]==1

def begin_review(s,a):
    state=begin_practice(s,a)
    attempt(s,a,state['id'],state['revisionId'],{'value':999,'unit':'m','reasoning':'Ipotesi'},'review-first')
    state=move(s,a,resume(s,a,state['id']),'recover');state=move(s,a,state,'next')
    attempt(s,a,state['id'],state['revisionId'],{'value':0.075,'unit':'m','reasoning':'Confronto F/k'},'review-transfer')
    return move(s,a,resume(s,a,state['id']),'finish')

@pytest.mark.parametrize('rating,delay',[('again',60),('hard',330),('good',600),('easy',8*86400)])
def test_real_core_explicit_scheduler_rating_replay_override_undo(course,rating,delay):
    s,t,a,b=course;before=begin_review(s,a)
    assert before['reviewScheduler']['rated'] is False and 'scheduler' not in before
    payload=(s,a,before['id'],before['revisionId'],'rate',{'rating':rating},'self-report')
    rated=act(*payload)
    assert rated['reviewAt']==1000+delay and rated['mastery']=='NOT_INFERRED'
    assert rated['reviewScheduler']['rated'] is True and rated['reviewScheduler']['choices']==[]
    assert act(*payload)==rated
    assert len(rated['attempts'])==2 and rated['assistanceHistory']==before['assistanceHistory']
    with pytest.raises(StudyError,match='study_rating_already_recorded'):move(s,a,rated,'rate',rating='good')
    with pytest.raises(StudyError,match='forbidden'):act(s,b,rated['id'],rated['revisionId'],'undo-rating',{},'peer')
    manual=move(s,a,rated,'schedule',days=7)
    assert manual['reviewAt']==1000+7*86400 and manual['reviewScheduler']['manualOverride']['days']==7
    raw=json.loads(s.get_resource(a,manual['id'])['text'])
    assert raw['scheduler']['card']['due']==json.loads(s.get_resource_revision(a,rated['id'],rated['revisionId'])['text'])['scheduler']['card']['due']
    undone=move(s,a,manual,'undo-rating')
    assert undone['reviewAt']==before['reviewAt'] and undone['reviewReason']==before['reviewReason']
    assert undone['reviewScheduler']['rated'] is False and len(undone['attempts'])==2
    # The undone rating remains an immutable revision, not an erased event.
    historical=s.get_resource_revision(a,rated['id'],rated['revisionId'])
    assert json.loads(historical['text'])['scheduler']['lastRating']==rating

def test_scheduler_cold_reopen_keeps_card_sources_and_revocation(course):
    s,t,a,b=course;state=move(s,a,begin_review(s,a),'rate',rating='good')
    database=s.path
    reopened=StudyStore(database,clock=lambda:1001,initialize=False)
    try:
        restored=resume(reopened,a,state['id'])
        assert restored['reviewScheduler']==state['reviewScheduler']
        assert restored['reviewAt']==1600 and restored['sourceRef']==state['sourceRef']
        assert [x['receipt']['receiptId'] for x in restored['attempts']]==[x['receipt']['receiptId'] for x in state['attempts']]
    finally:reopened.close()
    s.connection.execute('DELETE FROM study_members WHERE edition_id=? AND student_id=?',('mechanics',a.id))
    s.connection.commit()
    with pytest.raises(StudyError):resume(s,a,state['id'])

def test_scheduler_rejects_client_card_and_leaves_the_revision_unchanged(course):
    s,t,a,b=course;state=begin_review(s,a)
    with pytest.raises(StudyError):move(s,a,state,'rate',rating='good',card={'due':'2099-01-01'})
    assert resume(s,a,state['id'])['revisionId']==state['revisionId']

def test_receipt_grants_tutor_only_exact_submitted_lesson_source_not_the_private_plan(course):
    s,t,a,b=course;state=begin_practice(s,a)
    attempt(s,a,state['id'],state['revisionId'],{'value':0.2,'unit':'m','reasoning':'F/k'},'source-tutor')
    original=s.get_resource_revision(t,state['sourceRef']['resourceId'],state['sourceRef']['revisionId'])
    assert json.loads(original['text'])['lessonRef']==state['lessonRef']
    with pytest.raises(StudyError,match='forbidden'):s.get_resource(t,state['id'])
