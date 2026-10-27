from fastapi.testclient import TestClient
from study_api.app import create_app
from test_identity import setup_store


def test_memory_http_is_personal_versioned_no_store_and_revoked_session_is_rejected(tmp_path):
    store, _, student, peer, _ = setup_store(tmp_path)
    with TestClient(create_app(store.path, demo=True)) as client:
        assert client.get('/study/memory').status_code == 401
        client.post('/study/session', json={'token':store.issue_session(student)})
        headers = {'Idempotency-Key':'new-note'}
        note = {'title':'Idea sintetica', 'text':'Non ho capito il vincolo',
            'classification':'not_understood', 'sourceRefs':[], 'links':[], 'concepts':['vincolo']}
        created = client.post('/study/memory/notes', json=note, headers=headers)
        assert created.status_code == 200, created.text
        note_id = created.json()['id']
        response = client.get('/study/memory?query=vincolo')
        assert response.headers['cache-control'] == 'no-store'
        assert response.json()['notes'][0]['classification'] == 'not_understood'
        assert client.post('/study/memory/notes/'+note_id, json={'note':note,'expectedVersion':0},
            headers={'Idempotency-Key':'stale'}).status_code == 409
        revised = client.post('/study/memory/notes/'+note_id,
            json={'note':{**note,'classification':'correction'},'expectedVersion':1},
            headers={'Idempotency-Key':'revise'})
        assert revised.status_code == 200 and revised.json()['version'] == 2
        assert len(client.get('/study/memory/notes/'+note_id+'/history').json()['revisions']) == 2
        exported = client.get('/study/memory/export').json()
        assert client.post('/study/memory/import', json={'archive':exported},
            headers={'Idempotency-Key':'import'}).json()['importedCount'] == 1
        client.post('/study/session', json={'token':store.issue_session(peer)})
        assert client.get('/study/memory').json()['notes'] == []
        denied = client.get('/study/memory/notes/'+note_id)
        assert denied.status_code == 404 and 'vincolo' not in denied.text
        store.revoke_all_sessions(peer)
        assert client.get('/study/memory/export').status_code == 401


def test_memory_http_rejects_malformed_inputs_without_internal_error(tmp_path):
    store, _, student, *_ = setup_store(tmp_path)
    with TestClient(create_app(store.path, demo=True)) as client:
        client.post('/study/session', json={'token':store.issue_session(student)})
        for body in ({}, {'ownerId':student.id}, {'title':[]}, {'note':None}):
            assert client.post('/study/memory/notes', json=body,
                headers={'Idempotency-Key':'malformed'}).status_code == 422
        assert client.get('/study/memory?query='+'x'*201).status_code == 422
