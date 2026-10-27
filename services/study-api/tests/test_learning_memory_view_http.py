from fastapi.testclient import TestClient
from study_api.app import create_app
from test_identity import setup_store


def test_view_http_reopens_only_for_the_session_owner_and_requires_current_version(tmp_path):
    store,_,actor,peer,_=setup_store(tmp_path)
    with TestClient(create_app(store.path,demo=True)) as client:
        assert client.get('/study/memory/view').status_code==401
        client.post('/study/session',json={'token':store.issue_session(actor)})
        note=client.post('/study/memory/notes',json={'title':'Idea','text':'Testo','classification':'idea',
            'concepts':[],'sourceRefs':[],'links':[]},headers={'Idempotency-Key':'note'}).json()
        payload={'expectedVersion':0,'layout':'circle','positions':[{'id':note['id'],'x':2,'y':3}],
            'zoom':1.2,'pan':{'x':4,'y':5}}
        response=client.post('/study/memory/view',json=payload,headers={'Idempotency-Key':'view'})
        assert response.status_code==200,response.text
        assert response.json()['version']==1 and response.json()['layout']=='circle'
        assert client.get('/study/memory/view').json()==response.json()
        assert client.post('/study/memory/view',json=payload,headers={'Idempotency-Key':'stale'}).status_code==409
        client.post('/study/session',json={'token':store.issue_session(peer)})
        assert client.get('/study/memory/view').json()['positions']==[]
        store.revoke_all_sessions(peer)
        assert client.get('/study/memory/view').status_code==401
