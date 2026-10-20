from copy import deepcopy
import pytest
from fastapi.testclient import TestClient
from lessonos.study.store import digest, canonical
from study_api.app import create_app
from test_identity import setup_store


def view(resource, instance='source-1'):
    return {'kind': 'plugin-postit-object', 'pluginId': 'ardesia.study', 'instanceId': instance,
            'bounds': {'x': 0, 'y': 0, 'width': 320, 'height': 240}, 'zIndex': 0,
            'selected': False, 'hovered': False, 'proximity': 'far',
            'pluginState': {'resourceId': resource['id'], 'revisionId': resource['revisionId'], 'contextId': resource['contextId']}}


@pytest.fixture
def session(tmp_path):
    store, teacher, student, peer, other = setup_store(tmp_path)
    resource = store.create_resource(student, 'fluidi', 'notes', 'Originale privato')
    with TestClient(create_app(store.path, demo=True), raise_server_exceptions=False) as client:
        client.post('/study/session', json={'token': store.issue_session(student)})
        yield client, store, student, resource
    store.close()


@pytest.mark.parametrize('malformed', [None, 1, [], {'pluginState': None}, {'bounds': None}])
def test_malformed_layout_members_fail_as_domain_errors(session, malformed):
    client, *_ = session
    response = client.post('/study/layout', json={'editionId': 'fluidi', 'views': [malformed]})
    assert response.status_code == 422
    assert response.json() == {'error': 'invalid_layout'}


@pytest.mark.parametrize('field,value', [('width', 0), ('height', -1)])
def test_nonpositive_view_dimensions_are_rejected(session, field, value):
    client, store, student, resource = session
    item = view(resource)
    item['bounds'][field] = value
    assert client.post('/study/layout', json={'editionId': 'fluidi', 'views': [item]}).status_code == 422


def test_layout_pin_is_an_exact_authorized_resource_revision_pair(session):
    client, store, student, resource = session
    second = store.create_resource(student, 'fluidi', 'notes', 'Altra fonte')
    item = view(resource)
    item['pluginState']['revisionId'] = second['revisionId']
    response = client.post('/study/layout', json={'editionId': 'fluidi', 'views': [item]})
    assert response.status_code in (403, 404, 422)
    assert store.connection.execute('SELECT COUNT(*) FROM study_layouts').fetchone()[0] == 0


def test_layout_cas_detects_another_tab_and_preserves_explicit_empty_layout(session):
    client, store, student, resource = session
    initial = client.get('/study/workspace?editionId=fluidi').json()
    assert initial['layoutSaved'] is False
    assert initial['layoutVersion'] == digest(canonical([]))
    body = {'editionId': 'fluidi', 'views': [view(resource)], 'expectedVersion': initial['layoutVersion']}
    first = client.post('/study/layout', json=body)
    assert first.status_code == 200
    assert first.json()['layoutVersion'] != initial['layoutVersion']
    stale = deepcopy(body)
    stale['views'][0]['bounds']['x'] = 100
    assert client.post('/study/layout', json=stale).status_code == 409
    loaded = client.get('/study/workspace?editionId=fluidi').json()
    assert loaded['layouts'] == body['views'] and loaded['layoutSaved'] is True
    empty = client.post('/study/layout', json={'editionId': 'fluidi', 'views': [], 'expectedVersion': loaded['layoutVersion']})
    assert empty.status_code == 200
    reopened = client.get('/study/workspace?editionId=fluidi').json()
    assert reopened['layoutSaved'] is True and reopened['layouts'] == []
    assert store.get_resource(student, resource['id'])['text'] == 'Originale privato'
