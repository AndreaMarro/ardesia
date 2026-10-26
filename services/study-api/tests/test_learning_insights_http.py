"""Installed router: actual create_app cookie, admission and session boundaries."""
from fastapi.testclient import TestClient
from lessonos.study.submissions import submit
from study_api.app import create_app
from test_identity import setup_store

NOTICE = {'version':'synthetic-v1','purpose':'Uso facoltativo sintetico','retentionDays':30}


def composed_app(path):
    return create_app(path, demo=True, learning_insights_notice=NOTICE)


def test_http_session_receipt_scope_export_optout_and_revocation(tmp_path):
    store,tutor,student,peer,other = setup_store(tmp_path)
    receipt = submit(store,student,'fluidi','poiseuille-v1',[],'SYNTHETIC PRIVATE ANSWER','attempt')
    app = composed_app(store.path)
    with TestClient(app) as client:
        url = '/study/learning-insights?editionId=fluidi'
        assert client.get(url).status_code == 401
        token=store.issue_session(student)
        client.post('/study/session',json={'token':token})
        view=client.get(url)
        assert view.status_code == 200,view.text
        assert view.headers['cache-control'] == 'no-store'
        assert view.json()['summary']['attempts'] == 1
        assert 'SYNTHETIC PRIVATE ANSWER' not in view.text
        pref={'editionId':'fluidi','enabled':True,'noticeVersion':NOTICE['version']}
        assert client.put('/study/learning-insights/preferences',json={**pref,'actorId':peer.id}).status_code == 422
        enabled=client.put('/study/learning-insights/preferences',json=pref)
        assert enabled.status_code == 200
        import time
        event={'schemaVersion':1,'eventId':'http-event','receiptId':receipt['receiptId'],'kind':'difficulty.reported','occurredAt':time.time(), 'consentId':enabled.json()['consentId']}
        body={'editionId':'fluidi','events':[event]}
        assert client.post('/study/learning-insights/events',json=body).json()['accepted'] == 1
        assert client.post('/study/learning-insights/events',json=body).json()['duplicates'] == 1
        exported=client.get('/study/learning-insights/export?editionId=fluidi')
        assert exported.status_code == 200 and 'attachment;' in exported.headers['content-disposition']
        assert len(exported.json()['optionalEvents']) == 1
        assert client.post('/study/learning-insights/events',json={'editionId':'fluidi','events':[{'text':'x'*5000}]}).status_code == 413
        assert client.put('/study/learning-insights/preferences',json={**pref,'enabled':False,'noticeVersion':None}).status_code == 200
        assert client.get(url).json()['summary']['attempts'] == 1
        assert client.get(url).json()['optionalEvents'] == []
        client.post('/study/session',json={'token':store.issue_session(peer)})
        assert client.get(url).json()['attempts'] == []
        client.post('/study/session',json={'token':store.issue_session(other)})
        assert client.get(url).status_code == 403
        client.post('/study/session',json={'token':token})
        store.revoke_all_sessions(student)
        assert client.get(url).status_code == 401
        assert client.get('/study/learning-insights/export?editionId=fluidi').status_code == 401


def test_http_origin_guard_precedes_optional_mutation(tmp_path):
    store,_,student,*_ = setup_store(tmp_path)
    with TestClient(composed_app(store.path)) as client:
        client.post('/study/session',json={'token':store.issue_session(student)})
        response=client.put('/study/learning-insights/preferences',json={'editionId':'fluidi','enabled':True,'noticeVersion':'synthetic-v1'},headers={'Origin':'https://other.invalid'})
        assert response.status_code == 403
        assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='learning.insights.preference.v1'").fetchone()[0] == 0


def test_installed_router_is_unique_and_default_collection_stays_disabled(tmp_path):
    store,_,student,*_=setup_store(tmp_path)
    app=create_app(store.path,demo=True)
    assert sum(route.path == '/study/learning-insights' for route in app.routes) == 1
    with TestClient(app) as client:
        client.post('/study/session',json={'token':store.issue_session(student)})
        result=client.get('/study/learning-insights?editionId=fluidi')
        assert result.status_code == 200
        assert result.json()['preferences']['notice'] is None
        assert result.json()['preferences']['enabled'] is False
        rejected=client.put('/study/learning-insights/preferences',json={'editionId':'fluidi','enabled':True,'noticeVersion':'invented'})
        assert rejected.status_code == 409
        assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind LIKE 'learning.insights.%'").fetchone()[0] == 0
