"""Server-trusted synthetic practice and persisted thematic exam HTTP contracts."""
import pytest
from fastapi.testclient import TestClient

from lessonos.study.catalog import load_pack
from lessonos.study.question_bank import load_bank
from lessonos.study.store import StudyStore
from study_api.app import create_app

BASE = '/study/editions/course/question-banks/physics-semestre-2026'
MOCK1 = 'closure1-fluid-thermal-mock-1'
MOCK2 = 'closure1-fluid-thermal-mock-2'


@pytest.fixture
def app_world(tmp_path, monkeypatch):
    path = tmp_path/'db.sqlite'
    store = StudyStore(path)
    teacher = store.create_principal('synthetic-tutor','teacher')
    student = store.create_principal('synthetic-a','student')
    peer = store.create_principal('synthetic-b','student')
    store.create_edition(teacher,'course',course_id='fluidi-termodinamica',pack_id='sf-fluidi-termodinamica-v1')
    for actor in (student,peer):store.add_test_member(teacher,'course',actor.id)
    tokens = {p.id:store.issue_session(p) for p in (student,peer)}
    # Fixture server configuration, never data supplied by the HTTP client.
    trusted_mode = [False]
    original = StudyStore.__init__
    def configured(self,*args,**kwargs):
        original(self,*args,**kwargs); self.synthetic_acceptance = trusted_mode[0]
    monkeypatch.setattr(StudyStore,'__init__',configured)
    with TestClient(create_app(path,demo=True)) as client:
        assert client.post('/study/session',json={'token':tokens[student.id]}).status_code == 200
        yield store, client, trusted_mode, tokens, student, peer
    store.close()


def test_http_default_deny_client_cannot_enable_and_199_questions_stay_draft(app_world):
    store, client, mode, tokens, student, peer = app_world
    denied = client.post('/study/exams',json={'editionId':'course','simulationId':MOCK1,'synthetic_acceptance':True})
    assert denied.status_code == 409
    normal = client.get(BASE+'/questions?limit=100')
    assert normal.status_code == 404 or normal.status_code == 200 and normal.json()['total'] == 0
    mode[0] = True
    catalog = client.get('/study/editions/course/question-banks').json()['items'][0]
    assert catalog['questionCount'] == 199 and catalog['humanApproval'] is False
    assert catalog['scientificApproval'] == 'NOT_RUN' and catalog['editorialStatus'] == 'DRAFT'
    assert catalog['publication']['publishedQuestionCount'] == 0
    items = []; after = None
    while True:
        params = {'limit':100}
        if after:params['after']=after
        response = client.get(BASE+'/questions',params=params)
        assert response.status_code == 200
        page=response.json();items.extend(page['items']);after=page['nextCursor']
        if not after:break
    selected = {ref['id'] for ref in load_pack('sf-fluidi-termodinamica-v1')['curatedPractice']['questionRefs']}
    assert len(items) == 199 and {q['id'] for q in items} == selected
    assert all(q['status']=='DRAFT' and q['humanApproval'] is False and 'answer' not in q and 'solution' not in q for q in items)
    question_id=items[0]['id']
    detail=client.get(BASE+'/questions/'+question_id).json()
    assert detail['question']['status']=='DRAFT' and detail['humanApproval'] is False
    feedback=client.post(BASE+'/attempts',json={'questionId':question_id,'response':''}).json()
    assert feedback['editorialStatus']=='DRAFT' and feedback['humanApproval'] is False
    assert feedback['feedbackAuthority']=='DRAFT_REFERENCE_NOT_HUMAN_APPROVAL' and feedback['solution']
    outside=next(q['id'] for q in load_bank().questions(limit=100)['items'] if q['id'] not in selected)
    assert client.get(BASE+'/questions/'+outside).status_code==404
    assert client.post(BASE+'/attempts',json={'questionId':outside,'response':'A'}).status_code==404
    assert client.get(BASE+'/questions',params={'bankSha256':'0'*64}).status_code==409
    assert client.post(BASE+'/attempts',json={'questionId':question_id,'response':'A','synthetic_acceptance':True}).status_code==422
    for table in ('study_question_bank_approvals','study_question_bank_reviews'):
        assert store.connection.execute('SELECT COUNT(*) FROM '+table).fetchone()[0]==0


def test_http_exact_simulations_persist_reopen_cas_and_hide_reference_feedback_until_submit(app_world):
    store, client, mode, tokens, student, peer = app_world
    mode[0]=True
    listing=client.get('/study/exams',params={'editionId':'course'}).json()
    assert {m['id'] for m in listing['simulations']}=={MOCK1,MOCK2}
    assert all(m['ready'] and m['durationSeconds']==3000 and m['humanApproval'] is False for m in listing['simulations'])
    assert client.post('/study/exams',json={'editionId':'course'}).status_code==409
    started=client.post('/study/exams',json={'editionId':'course','simulationId':MOCK1})
    assert started.status_code==200
    attempt=started.json(); aid=attempt['id']
    assert attempt['simulationId']==MOCK1 and len(attempt['questions'])==31 and attempt['result'] is None
    assert all('sourceRecord' not in q and 'answer' not in q and 'explanation' not in q for q in attempt['questions'])
    assert client.post('/study/exams',json={'editionId':'course','simulationId':MOCK1}).json()['id']==aid
    assert client.post('/study/exams',json={'editionId':'course','simulationId':MOCK2}).json()['error']=='exam_active_simulation_conflict'
    qid=next(q['id'] for q in attempt['questions'] if q['type']=='mcq')
    saved=client.put(f'/study/exams/{aid}/answers',json={'answers':{qid:'A'},'expectedRevision':0})
    assert saved.status_code==200 and saved.json()['answerRevision']==1
    conflict=client.put(f'/study/exams/{aid}/answers',json={'answers':{qid:'B'},'expectedRevision':0})
    assert conflict.status_code==409 and conflict.json()['error']=='exam_revision_conflict'
    assert client.get(f'/study/exams/{aid}').json()['answers']=={qid:'A'}
    assert client.post('/study/session',json={'token':tokens[peer.id]}).status_code==200
    assert client.get(f'/study/exams/{aid}').status_code==403
    assert client.post('/study/session',json={'token':tokens[student.id]}).status_code==200
    final=client.post(f'/study/exams/{aid}/submit',json={'expectedRevision':1})
    assert final.status_code==200
    result=final.json()['result']; assert result['questions'][0]['explanation']
    assert result['humanApproval'] is False and result['releaseScope']=='PRIVATE_SYNTHETIC_ACCEPTANCE'
    assert client.post(f'/study/exams/{aid}/submit',json={'expectedRevision':1}).status_code==200
    assert store.connection.execute("SELECT COUNT(*) FROM study_receipts WHERE operation='exam.submitted'").fetchone()[0]==1
    rows=client.get('/study/exams',params={'editionId':'course'}).json()['attempts']
    assert rows[0]['simulationId']==MOCK1
    assert client.post('/study/exams',json={'editionId':'course','simulationId':MOCK2}).json()['simulationId']==MOCK2
