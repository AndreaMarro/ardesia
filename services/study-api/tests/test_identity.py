import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from study_api.app import create_app
from lessonos.study.store import StudyStore
def setup_store(tmp_path):
    store=StudyStore(tmp_path/'study.sqlite')
    teacher=store.create_principal('tutor-test','teacher')
    first=store.create_principal('student-01','student')
    peer=store.create_principal('student-02','student')
    other=store.create_principal('tutor-other','teacher')
    store.create_edition(teacher,'fluidi')
    store.add_test_member(teacher,'fluidi',first.id)
    store.add_test_member(teacher,'fluidi',peer.id)
    return store,teacher,first,peer,other


def test_http_identity_is_session_owned_and_peer_response_has_no_body(tmp_path):
    store, teacher, first, peer, other = setup_store(tmp_path)
    first_token, peer_token = store.issue_session(first), store.issue_session(peer)
    app = create_app(store.path, demo=True)
    with TestClient(app) as client:
        assert client.get('/study/me').status_code == 401
        assert client.post('/study/session', json={'token':first_token}).status_code == 200
        source = client.post('/study/resources', json={'actorId':peer.id, 'editionId':'fluidi', 'kind':'notes', 'text':'PRIVATE', 'visibility':'private'}).json()
        assert source['ownerId'] == first.id
        client.post('/study/session', json={'token':peer_token})
        response = client.get('/study/resources/'+source['id'])
        assert response.status_code == 403
        assert response.json() == {'error':'forbidden'}
        assert 'PRIVATE' not in response.text
        assert 'url' not in response.text
        assert client.post('/study/resources', json={'editionId':'fluidi','text':'x'}, headers={'Origin':'https://attacker.invalid'}).status_code == 403


def test_demo_session_boundary_refuses_production(tmp_path):
    with pytest.raises(ValueError, match='synthetic_only'):
        create_app(tmp_path/'demo.sqlite', demo=False)


def test_source_creation_retry_recovers_the_same_resource_and_rejects_changed_text(tmp_path):
    store, teacher, student, peer, other = setup_store(tmp_path)
    with TestClient(create_app(store.path, demo=True)) as client:
        client.post('/study/session', json={'token':store.issue_session(student)})
        body={'editionId':'fluidi','kind':'notes','text':'Un solo originale','visibility':'private'}
        headers={'Idempotency-Key':'lost-create-response'}
        first=client.post('/study/resources',json=body,headers=headers)
        replay=client.post('/study/resources',json=body,headers=headers)
        assert first.status_code == replay.status_code == 200
        assert replay.json() == first.json()
        assert store.connection.execute('SELECT COUNT(*) FROM study_resources').fetchone()[0] == 1
        assert client.post('/study/resources',json={**body,'text':'Changed'},headers=headers).status_code == 409
        assert store.connection.execute('SELECT COUNT(*) FROM study_revisions').fetchone()[0] == 1
