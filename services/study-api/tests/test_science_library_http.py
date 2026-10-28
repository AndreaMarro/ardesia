"""Real HTTP/factory boundary with persisted Core sessions, synthetic identities."""
import importlib
from pathlib import Path
import sys

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient
import pytest

from lessonos.study.models import StudyError
from lessonos.study.store import StudyStore
from lessonos.study.science_library.resources import new_snapshot


@pytest.fixture
def boundary(tmp_path):
    store = StudyStore(tmp_path/'science.sqlite', check_same_thread=False)
    teacher = store.create_principal('science-tutor', 'teacher')
    student = store.create_principal('science-student', 'student')
    peer = store.create_principal('science-peer', 'student')
    store.create_edition(teacher, 'science-edition')
    store.add_test_member(teacher, 'science-edition', student.id)
    store.add_test_member(teacher, 'science-edition', peer.id)
    tokens = {p.id: store.issue_session(p) for p in (teacher, student, peer)}
    app = FastAPI()

    def current_store():
        return store

    def authenticate(request, current):
        principal = current.principal_for_session(request.headers.get('X-Test-Session', ''))
        if principal is None:
            raise StudyError('unauthenticated', 401)
        return principal

    @app.exception_handler(StudyError)
    async def error(request: Request, value: StudyError):
        return JSONResponse({'error': value.code}, status_code=value.status)

    importlib.import_module('lessonos.study.science_library.routes').install_science_library_routes(app, current_store, authenticate)
    with TestClient(app) as client:
        yield client, store, student, peer, tokens
    store.close()


def headers(tokens, actor, key=None):
    return {'X-Test-Session': tokens[actor.id], **({'Idempotency-Key': key} if key else {})}


def test_catalog_requires_real_core_session_and_contains_no_answer(boundary):
    client, store, student, peer, tokens = boundary
    path = '/study/editions/science-edition/science-library/catalog'
    assert client.get(path).status_code == 401
    r = client.get(path, headers=headers(tokens, student))
    assert r.status_code == 200
    assert len(r.json()['capabilities']) == 20
    assert len({item['id'] for item in r.json()['capabilities']}) == 20
    assert all('value' not in item and 'result' not in item for item in r.json()['capabilities'])


def test_create_compare_reopen_revocation_and_peer_isolation(boundary):
    client, store, student, peer, tokens = boundary
    base = '/study/editions/science-edition/science-library'
    snapshot = new_snapshot('collision-1d-v1', {}, note='Nota sintetica privata')
    first = client.post(base+'/resources', json={'snapshot': snapshot}, headers=headers(tokens, student, 'create'))
    assert first.status_code == 200
    resource = first.json()['resource']
    url = '/study/science-library/resources/'+resource['id']
    response = client.get(url, params={'revisionId': resource['revisionId']}, headers=headers(tokens, student))
    assert response.status_code == 200 and 'result' not in response.json()
    assert client.get(url, params={'revisionId': resource['revisionId']}, headers=headers(tokens, peer)).status_code == 403
    compare = client.post(url+'/compare', json={'revisionId': resource['revisionId'], 'prediction': '1'}, headers=headers(tokens, student))
    assert compare.status_code == 200
    assert compare.json()['result']['velocity1AfterMS'] == 1
    assert client.post(url+'/compare', json={'revisionId': resource['revisionId'], 'prediction': ''}, headers=headers(tokens, student)).status_code == 422
    store.revoke_session(tokens[student.id])
    assert client.get(url, params={'revisionId': resource['revisionId']}, headers=headers(tokens, student)).status_code == 401
    assert client.post(base+'/resources', json={'snapshot': snapshot}, headers=headers(tokens, student, 'create')).status_code == 401


def test_revise_is_idempotent_and_stale_conflicts_preserve_notes(boundary):
    client, store, student, peer, tokens = boundary
    base = '/study/editions/science-edition/science-library/resources'
    saved = client.post(base, json={'snapshot': new_snapshot('thin-lens-v1', {})}, headers=headers(tokens, student, 'create')).json()
    original = saved['resource']
    body = {'snapshot': new_snapshot('thin-lens-v1', {}, note='Seconda revisione'), 'expectedRevision': original['revisionId']}
    url = base+'/'+original['id']+'/revise'
    a = client.post(url, json=body, headers=headers(tokens, student, 'revise'))
    b = client.post(url, json=body, headers=headers(tokens, student, 'revise'))
    assert a.status_code == b.status_code == 200 and a.json() == b.json()
    assert client.post(url, json=body, headers=headers(tokens, student, 'stale')).status_code == 409
    assert client.post(url, json=body, headers=headers(tokens, peer, 'peer')).status_code == 403


def test_draft_evaluation_is_canonical_but_never_a_submission_or_grade(boundary):
    client, store, student, peer, tokens = boundary
    snapshot = new_snapshot('bernoulli-v1', {})
    body = {k: snapshot[k] for k in ('capabilityId', 'capabilityVersion', 'implementationSha256', 'parameters')}
    body['prediction'] = '114000'
    url = '/study/editions/science-edition/science-library/evaluate'
    r = client.post(url, json=body, headers=headers(tokens, student))
    assert r.status_code == 200 and r.json()['result']['pressure2Pa'] == 114000
    assert r.json()['assessment'] == 'MODEL_COMPARISON_NOT_A_GRADE'
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0] == 0
    assert store.connection.execute('SELECT COUNT(*) FROM study_resources').fetchone()[0] == 0
    body['implementationSha256'] = 'f'*64
    assert client.post(url, json=body, headers=headers(tokens, student)).status_code == 409
    body['actorId'] = peer.id
    assert client.post(url, json=body, headers=headers(tokens, student)).status_code == 422


def test_product_factory_uses_actual_cookie_and_rejection_signal(boundary):
    # Exercise the product factory, not an in-memory proposed composition.
    _, store, student, peer, tokens = boundary
    root = Path(__file__).resolve().parents[3]
    sys.path.insert(0, str(root/'services/study-api'))
    try:
        from study_api.app import create_app
        candidate = create_app(store.path, demo=True)
    finally:
        sys.path.pop(0)
    url = '/study/editions/science-edition/science-library/catalog'
    with TestClient(candidate) as client:
        assert client.post('/study/session', json={'token': tokens[student.id]}).status_code == 200
        assert client.get(url).status_code == 200
        # Login exchanges the body token for a fresh HttpOnly cookie session.
        store.revoke_session(client.cookies.get('study_session'))
        rejected = client.get(url)
        assert rejected.status_code == 401
        assert rejected.headers['X-Study-Session-Rejected'] == 'cookie'


def test_product_compare_requires_explicit_revision_even_after_a_new_revision(boundary):
    _, store, student, peer, tokens = boundary
    from study_api.app import create_app
    with TestClient(create_app(store.path, demo=True)) as client:
        assert client.post('/study/session', json={'token': tokens[student.id]}).status_code == 200
        base = '/study/editions/science-edition/science-library/resources'
        first = client.post(base, json={'snapshot': new_snapshot('collision-1d-v1', {})},
                            headers={'Idempotency-Key': 'original'}).json()['resource']
        second = client.post(base+'/'+first['id']+'/revise', json={
            'expectedRevision': first['revisionId'],
            'snapshot': new_snapshot('collision-1d-v1', {'mass1': 1})},
            headers={'Idempotency-Key': 'changed'}).json()['resource']
        path = '/study/science-library/resources/'+first['id']+'/compare'
        for resource, expected in [(first, 1), (second, 0)]:
            response = client.post(path, json={'revisionId': resource['revisionId'], 'prediction': '1'})
            assert response.status_code == 200
            assert response.json()['result']['velocity1AfterMS'] == expected
            assert response.json()['resourceRef']['revisionId'] == resource['revisionId']
        for invalid in (None, '', 42):
            response = client.post(path, json={'revisionId': invalid, 'prediction': '1'})
            assert response.status_code == 422
            assert response.json()['error'] == 'invalid_science_reference'
        assert client.post(path, json={'revisionId': 'unknown', 'prediction': '1'}).status_code == 404
        assert client.post(path, json={'prediction': '1'}).status_code == 422
        assert client.post('/study/session', json={'token': tokens[peer.id]}).status_code == 200
        assert client.post(path, json={'revisionId': first['revisionId'], 'prediction': '1'}).status_code == 403
