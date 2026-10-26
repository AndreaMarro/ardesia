"""Real Core/Auth HTTP tests. Until S10's hook lands, compose at the existing
admin-routes install point, passing through its real dependencies unchanged."""
import pytest
from fastapi.testclient import TestClient
from study_api.app import create_app
from lessonos.study.independent_study.routes import install_routes
from test_identity import setup_store

@pytest.fixture
def compose(monkeypatch):
    from study_api import admin_routes
    original=admin_routes.install_admin_routes
    def install(app,store_dependency,authenticate):
        original(app,store_dependency,authenticate)
        install_routes(app,store_dependency,authenticate)
    monkeypatch.setattr(admin_routes,'install_admin_routes',install)


def test_http_real_session_revocation_and_cold_resume(compose,tmp_path):
    s,t,a,b,_=setup_store(tmp_path)
    s.create_edition(t,'mechanics',course_id='strumenti-meccanica',pack_id='sf-strumenti-meccanica-v1',pack_version=1)
    s.add_test_member(t,'mechanics',a.id);s.add_test_member(t,'mechanics',b.id)
    with TestClient(create_app(s.path,demo=True)) as client:
        url='/study/independent-study'
        assert client.get(url+'?editionId=mechanics').status_code==401
        client.post('/study/session',json={'token':s.issue_session(a)})
        items=client.get(url+'?editionId=mechanics').json()['objectives']
        item=next(x for x in items if x['lessonRef']['id']=='original-demo-u2-02')
        state=client.post(url,json={'editionId':'mechanics','lessonRef':item['lessonRef']},headers={'Idempotency-Key':'begin'}).json()
        def action(name,fields={}):
            nonlocal state
            response=client.post(url+'/'+state['id']+'/actions',json={'revisionId':state['revisionId'],'action':name,'fields':fields},headers={'Idempotency-Key':name+state['revisionId']})
            assert response.status_code==200,response.text
            state=response.json()
        action('diagnostic',{'text':'Distinguo forza ed allungamento.'});action('next');action('next')
        answer={'revisionId':state['revisionId'],'answer':{'value':0.2,'unit':'m','reasoning':'Divido la forza per la costante elastica.'}}
        target=url+'/'+state['id']+'/attempts'
        response=client.post(target,json=answer,headers={'Idempotency-Key':'attempt'})
        assert response.status_code==200,response.text
        receipt=response.json()['receipt']['receiptId']
        assert response.json()['feedback']['numericCorrect'] is True
        assert response.json()['feedback']['mastery']=='NOT_INFERRED'
        assert client.post(target,json=answer,headers={'Idempotency-Key':'attempt'}).json()==response.json()
        state=client.get(url+'/'+state['id']).json()
        assert state['attempts'][0]['receipt']['receiptId']==receipt
        assert 'answer' not in state['task']
        assert client.post(target,json={**answer,'actorId':b.id},headers={'Idempotency-Key':'forged'}).status_code==422
        client.post('/study/session',json={'token':s.issue_session(b)})
        denied=client.get(url+'/'+state['id']); assert denied.status_code==403
        assert 'Divido' not in denied.text
        client.post('/study/session',json={'token':s.issue_session(a)})
        s.revoke_all_sessions(a)
        assert client.get(url+'/'+state['id']).status_code==401
        assert client.post(target,json=answer,headers={'Idempotency-Key':'attempt'}).status_code==401
    # New HTTP app and cookie session use the same persisted database.
    with TestClient(create_app(s.path,demo=True)) as other:
        other.post('/study/session',json={'token':s.issue_session(a)})
        reopened=other.get(url+'/'+state['id']).json()
        assert reopened['attempts'][0]['receipt']['receiptId']==receipt
        assert reopened['sourceRef']==state['sourceRef']
    s.close()

@pytest.mark.parametrize('rating',['again','hard','good','easy'])
def test_http_scheduler_uses_core_cookie_revision_and_reopens(compose,tmp_path,rating):
    s,t,a,b,_=setup_store(tmp_path)
    s.create_edition(t,'mechanics',course_id='strumenti-meccanica',pack_id='sf-strumenti-meccanica-v1',pack_version=1)
    s.add_test_member(t,'mechanics',a.id)
    root='/study/independent-study'
    with TestClient(create_app(s.path,demo=True)) as client:
        assert client.post('/study/session',json={'token':s.issue_session(a)}).status_code==200
        ref=client.get(root+'?editionId=mechanics').json()['objectives'][0]['lessonRef']
        state=client.post(root,json={'editionId':'mechanics','lessonRef':ref},headers={'Idempotency-Key':'begin'}).json()
        target=root+'/'+state['id']
        def action(name,fields=None):
            nonlocal state
            response=client.post(target+'/actions',json={'revisionId':state['revisionId'],'action':name,'fields':fields or {}},headers={'Idempotency-Key':state['revisionId']+name})
            assert response.status_code==200,response.text
            state=response.json()
            return response
        def answer(key):
            nonlocal state
            response=client.post(target+'/attempts',json={'revisionId':state['revisionId'],'answer':{'value':999,'unit':'m','reasoning':'Prova con controllo delle unità'}},headers={'Idempotency-Key':key})
            assert response.status_code==200,response.text
            state=client.get(target).json()
        action('diagnostic',{'text':'F/k'});action('next');action('next');action('hint');answer('first')
        action('recover');action('next');answer('transfer');action('finish')
        before=state
        action('rate',{'rating':rating})
        assert state['reviewScheduler']['lastRating']==rating
        assert state['reviewScheduler']['canUndo'] and state['mastery']=='NOT_INFERRED'
        assert state['assistanceHistory']==before['assistanceHistory'] and len(state['attempts'])==2
        rated_revision=state['revisionId'];due=state['reviewAt']
    with TestClient(create_app(s.path,demo=True)) as other:
        other.post('/study/session',json={'token':s.issue_session(a)})
        cold=other.get(target).json()
        assert cold['reviewAt']==due and cold['revisionId']==rated_revision
        assert cold['sourceRef']==before['sourceRef'] and cold['reviewScheduler']['rated']
        undone=other.post(target+'/actions',json={'revisionId':rated_revision,'action':'undo-rating','fields':{}},headers={'Idempotency-Key':'undo'})
        assert undone.status_code==200 and not undone.json()['reviewScheduler']['rated']
        assert undone.json()['reviewAt']==before['reviewAt']
        s.revoke_all_sessions(a)
        assert other.get(target).status_code==401
    s.close()
