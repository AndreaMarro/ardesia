"""Actual cookie/route/command boundaries for authored course support."""
import pytest
from fastapi.testclient import TestClient
from lessonos.study.catalog import load_pack
from lessonos.study.four_courses import lesson_reference
from lessonos.study.store import StudyStore,canonical,digest
from study_api.app import create_app


@pytest.fixture
def support_case(tmp_path,monkeypatch):
    monkeypatch.setattr(StudyStore,'synthetic_acceptance',True,raising=False)
    store=StudyStore(tmp_path/'support.sqlite')
    teacher=store.create_principal('support-teacher','teacher')
    student=store.create_principal('support-student','student')
    peer=store.create_principal('support-peer','student')
    outsider=store.create_principal('support-outsider','student')
    store.create_edition(teacher,'course',course_id='fluidi-termodinamica',pack_id='sf-fluidi-termodinamica-v1')
    for actor in (student,peer):store.add_test_member(teacher,'course',actor.id)
    pack=load_pack('sf-fluidi-termodinamica-v1');item=pack['atomicFinalAssessment'][0]
    lesson=next(l for l in pack['lessons'] if l['id']=='ds-2026-u3-01')
    context={'lessonRef':lesson_reference(lesson),'assessmentRef':{'id':item['id'],'version':1,'sha256':digest(canonical(item))},'phase':'practice'}
    with TestClient(create_app(store.path,demo=True)) as client:
        yield store,client,teacher,student,peer,outsider,item,context
    store.close()


def login(client,store,actor):
    assert client.post('/study/session',json={'token':store.issue_session(actor)}).status_code==200


def path(item):return '/study/editions/course/course-assessments/'+item['id']+'/support'


def test_cookie_support_idempotence_safe_projection_and_durable_assistance(support_case):
    store,client,teacher,student,peer,outsider,item,context=support_case
    payload={'courseLesson':context,'level':1};headers={'Idempotency-Key':'help'}
    assert client.post(path(item),json=payload,headers=headers).status_code==401
    login(client,store,student)
    course=client.get('/study/course-learning?editionId=course').json()['course']
    assert len(course['diagnosticItems'])==3 and len(course['assessmentItems'])==57
    assert course['assessmentItems'][0]['hintCount']==3
    first=client.post(path(item),json=payload,headers=headers)
    assert first.status_code==200,first.text
    assert first.json()['text']==item['hints'][0] and item['answer'] not in first.text
    assert client.post(path(item),json=payload,headers=headers).json()==first.json()
    assert client.post(path(item),json={**payload,'level':2},headers=headers).status_code==409
    assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='course.assessment.support'").fetchone()[0]==1
    response=client.post('/study/submissions',json={'editionId':'course','activityId':'course-reasoning-v1',
        'activityParameters':{},'courseLesson':context,'text':'Ragionamento originale sintetico.'},headers={'Idempotency-Key':'manual-answer'})
    assert response.status_code==200,response.text
    receipt=response.json();assert receipt['courseContext']['assistance']['events'][0]['level']==1
    assert item['answer'] not in response.text and receipt['review']['originalText']=='Ragionamento originale sintetico.'
    login(client,store,peer)
    assert client.get('/study/receipts/'+receipt['receiptId']).status_code==403
    # Membership permits the peer's own hint event; it cannot alter the first actor's receipt.
    assert client.post(path(item),json={**payload,'level':2},headers=headers).status_code==200
    login(client,store,teacher)
    assert client.get('/study/receipts/'+receipt['receiptId']).json()==receipt
    assert client.post(path(item),json=payload,headers=headers).status_code==403
    login(client,store,outsider)
    assert client.post(path(item),json=payload,headers=headers).status_code==403
    login(client,store,student);store.revoke_session(client.cookies.get('study_session'))
    assert client.post(path(item),json=payload,headers=headers).status_code==401


@pytest.mark.parametrize('change', [{'level':True},{'level':0},{'level':4},{'answer':'injected'},{'supportUsed':False},{'courseLesson':None}])
def test_malformed_and_injected_support_cannot_record_a_command(support_case,change):
    store,client,teacher,student,peer,outsider,item,context=support_case
    login(client,store,student)
    response=client.post(path(item),json={'courseLesson':context,'level':1,**change},headers={'Idempotency-Key':'bad'})
    assert response.status_code==422,response.text
    assert store.connection.execute('SELECT COUNT(*) FROM study_receipts').fetchone()[0]==0
    assert store.connection.execute('SELECT COUNT(*) FROM study_events').fetchone()[0]==0


def test_event_failure_rolls_back_hint_receipt_and_never_claims_recorded_assistance(support_case):
    store,client,teacher,student,peer,outsider,item,context=support_case
    login(client,store,student)
    store.connection.execute("CREATE TRIGGER fail_support_event BEFORE INSERT ON study_events BEGIN SELECT RAISE(ABORT,'synthetic event failure'); END")
    store.connection.commit()
    response=client.post(path(item),json={'courseLesson':context,'level':1},headers={'Idempotency-Key':'atomic-failure'})
    assert response.status_code==503 and response.json()=={'error':'storage_unavailable'}
    assert store.connection.execute('SELECT COUNT(*) FROM study_receipts').fetchone()[0]==0


def test_diagnostic_http_practice_receipt_uses_canonical_prompt_and_rejects_transfer(support_case):
    store,client,teacher,student,peer,outsider,item,_=support_case
    login(client,store,student)
    diagnostic=client.get('/study/course-learning?editionId=course').json()['course']['diagnosticItems'][0]
    context={'lessonRef':diagnostic['lessonRef'],'assessmentRef':diagnostic['assessmentRef'],'phase':'practice'}
    payload={'editionId':'course','activityId':'course-reasoning-v1','activityParameters':{},'courseLesson':context,'text':'Calcolo sintetico personale.'}
    response=client.post('/study/submissions',json=payload,headers={'Idempotency-Key':'diagnostic'})
    assert response.status_code==200,response.text
    receipt=response.json();assert receipt['courseContext']['assessmentCollection']=='diagnostic'
    assert receipt['review']['prompt']==diagnostic['prompt']
    assert set(receipt['review'])=={'state','originalText','prompt'}
    assert not {'answer','feedback','rubric','grade'} & set(receipt)
    context['phase']='transfer'
    response=client.post('/study/submissions',json=payload,headers={'Idempotency-Key':'diagnostic-transfer'})
    assert response.status_code==409 and response.json()['error']=='course_assessment_phase_unavailable'
    context['phase']='practice'
    response=client.post(path(diagnostic),json={'courseLesson':context,'level':1},headers={'Idempotency-Key':'diag-no-hints'})
    assert response.status_code==409 and response.json()['error']=='course_assessment_support_unavailable'
