"""The second subject traverses existing HTTP commands and the same SQLite DB."""
import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from lessonos.study.store import StudyStore
from study_api.app import create_app


@pytest.fixture
def courses(tmp_path):
    store=StudyStore(tmp_path/'study.sqlite')
    physics=store.create_principal('physics-tutor','teacher')
    analysis=store.create_principal('analysis-tutor','teacher')
    student=store.create_principal('learner','student')
    peer=store.create_principal('peer','student')
    store.create_edition(physics,'fluidi')
    store.create_edition(analysis,'analisi',course_id='analisi-1',pack_id='taylor-exp-v1')
    for teacher,edition in ((physics,'fluidi'),(analysis,'analisi')):
        for actor in (student,peer):store.add_test_member(teacher,edition,actor.id)
    tokens={actor.id:store.issue_session(actor) for actor in (physics,analysis,student,peer)}
    yield store,tokens
    store.close()


def login(client,tokens,actor):
    assert client.post('/study/session',json={'token':tokens[actor]}).status_code==200


def test_explicit_edition_resolves_original_pack_and_keeps_legacy_default(courses):
    store,tokens=courses
    with TestClient(create_app(store.path,demo=True)) as client:
        physics=client.get('/study/course').json()
        analysis=client.get('/study/course?editionId=analisi').json()
        assert physics['id']=='fluidi' and physics['packId']=='relazioni-fluidi-v1'
        assert analysis['id']=='analisi' and analysis['courseId']=='analisi-1'
        assert analysis['packId']=='taylor-exp-v1' and 'Analisi' in analysis['title']
        pack=client.get('/study/coursepack?editionId=analisi').json()
        assert pack['id']=='taylor-exp-v1' and pack['status']=='DRAFT'
        assert client.get('/study/coursepack').json()['id']=='relazioni-fluidi-v1'
        assert client.get('/study/course?editionId=missing').status_code==404
        assert client.get('/study/coursepack?editionId=missing').status_code==404
        assert 'learner' not in json.dumps(analysis) and 'peer' not in json.dumps(pack)


def test_analysis_existing_http_receipt_review_context_and_principal_isolation(courses):
    store,tokens=courses
    with TestClient(create_app(store.path,demo=True)) as client:
        login(client,tokens,'learner')
        source=client.post('/study/resources',json={'editionId':'analisi','text':'Ho usato tre termini per il grado tre.'}).json()
        payload={'editionId':'analisi','activityId':'taylor-exp-v1','text':source['text'],
            'sourceRefs':[{'resourceId':source['id'],'revisionId':source['revisionId']}],
            'activityParameters':{'x':.5,'degree':3}}
        response=client.post('/study/submissions',json=payload,headers={'Idempotency-Key':'taylor-submit'})
        assert response.status_code==200
        receipt=response.json()
        assert receipt['courseContext']['modelId']=='taylor-exp-v1'
        assert client.post('/study/submissions',json=payload,headers={'Idempotency-Key':'taylor-submit'}).json()==receipt
        assert client.get('/study/receipts/'+receipt['receiptId']).json()==receipt
        changed={**payload,'activityParameters':{'x':.25,'degree':3}}
        assert client.post('/study/submissions',json=changed,headers={'Idempotency-Key':'taylor-submit'}).status_code==409
        login(client,tokens,'analysis-tutor')
        candidate=client.post('/study/feedback/drafts',json={'submissionId':receipt['submissionId']}).json()
        assert 'fattoriale' in candidate['text']
        login(client,tokens,'learner')
        before=client.get('/study/workspace?editionId=analisi').json()
        assert before['submissions'][0]['feedback']==[]
        login(client,tokens,'analysis-tutor')
        review=client.post('/study/feedback/'+candidate['id']+'/publish',
            json={'expectedRevision':1,'text':'Il grado tre richiede quattro termini e il fattoriale.','decision':'returned'},
            headers={'Idempotency-Key':'taylor-review'})
        assert review.status_code==200 and review.json()['syntheticTutor'] is True
        context=client.get('/study/context/'+source['contextId']).json()
        assert context['observations'][0]['evidence']['revisionId']==source['revisionId']
        for actor in ('physics-tutor','peer'):
            login(client,tokens,actor)
            denied=client.get('/study/resources/'+source['id'])
            assert denied.status_code==403 and source['text'] not in denied.text
            assert client.get('/study/receipts/'+receipt['receiptId']).status_code==403
        login(client,tokens,'learner')
        assert client.get('/study/workspace?editionId=analisi').json()['edition']['packId']=='taylor-exp-v1'
        store.revoke_session(client.cookies.get('study_session'))
        assert client.get('/study/workspace?editionId=analisi').status_code==401
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0]==1
    assert list(store.path.parent.glob('*.sqlite'))==[store.path]


@pytest.mark.parametrize('parameters',[None,{}, {'x':.5,'degree':True}, {'x':.5,'degree':13}])
def test_analysis_http_invalid_parameters_do_not_create_sources_or_receipts(courses,parameters):
    store,tokens=courses
    with TestClient(create_app(store.path,demo=True)) as client:
        login(client,tokens,'learner')
        response=client.post('/study/submissions',json={'editionId':'analisi','activityId':'taylor-exp-v1',
            'text':'Passaggi','activityParameters':parameters},headers={'Idempotency-Key':'invalid'})
        assert response.status_code==422 and response.json()=={'error':'invalid_parameters'}
    for table in ('study_resources','study_submissions','study_receipts'):
        assert store.connection.execute('SELECT COUNT(*) FROM '+table).fetchone()[0]==0


def test_preview_is_stateless_and_huge_integer_domain_errors_are_422(courses):
    store,tokens=courses
    with TestClient(create_app(store.path,demo=True)) as client:
        response=client.post('/study/activities/evaluate',json={'activityId':'taylor-exp-v1','parameters':{'x':.5,'degree':3}})
        assert response.status_code==200 and response.json()['value']==79/48
        assert response.json()['scientificApproval']=='NOT_RUN'
        for activity,params in [('taylor-exp-v1',{'x':10**1000,'degree':3}),('poiseuille-v1',{'radiusRatio':10**1000})]:
            rejected=client.post('/study/activities/evaluate',json={'activityId':activity,'parameters':params})
            assert rejected.status_code==422
    for table in ('study_submissions','study_receipts','study_events'):
        assert store.connection.execute('SELECT COUNT(*) FROM '+table).fetchone()[0]==0
