"""Only actual cookie or missing-session authentication rejections signal the client."""
import pytest
from fastapi.testclient import TestClient
from lessonos.study.models import StudyError
from study_api.app import create_app
from test_rejected_cookie_http import FakeSupabaseBoundary, seed


@pytest.mark.parametrize('backend', ['local', 'runtime_open', 'runtime_principal'])
def test_verified_cookie_rejection_and_missing_cookie_have_distinct_boundary_signals(tmp_path, backend):
    store, student, peer, _ = seed(tmp_path)
    runtime = FakeSupabaseBoundary(store.path, student, peer) if backend != 'local' else None
    token = {'runtime_open': 'rejected-open', 'runtime_principal': 'rejected-principal'}.get(backend)
    if backend == 'local':
        token = store.issue_session(student)
        store.revoke_session(token)
    with TestClient(create_app(store.path, demo=True, runtime=runtime)) as client:
        client.cookies.set('study_session', token, domain='testserver.local', path='/')
        denied = client.get('/study/me')
        assert denied.status_code == 401
        assert denied.headers.get('x-study-session-rejected') == 'cookie'
        assert client.cookies.get('study_session') is None
        anonymous = client.get('/study/me')
        assert anonymous.status_code == 401
        assert anonymous.headers.get('x-study-session-rejected') == 'missing'
        assert 'set-cookie' not in anonymous.headers
    store.close()


def test_login_body_and_handler_401_and_provider_503_do_not_signal_cookie_rejection(tmp_path):
    store, student, peer, _ = seed(tmp_path)
    runtime = FakeSupabaseBoundary(store.path, student, peer)
    app = create_app(store.path, demo=True, runtime=runtime)

    @app.get('/study/fixture-handler-denial')
    def handler_denial():
        raise StudyError('fixture_handler_denial', 401)

    with TestClient(app) as client:
        assert client.post('/study/session', json={'token': 'valid'}).status_code == 200
        for response in [
            client.post('/study/session', json={'token': 'invalid-body'}),
            client.get('/study/fixture-handler-denial'),
        ]:
            assert response.status_code == 401
            assert 'x-study-session-rejected' not in response.headers
            assert 'set-cookie' not in response.headers
        assert client.get('/study/me').json()['id'] == student.id
        client.cookies.set('study_session', 'provider-unavailable', domain='testserver.local', path='/')
        unavailable = client.get('/study/me')
        assert unavailable.status_code == 503
        assert 'x-study-session-rejected' not in unavailable.headers
        assert 'set-cookie' not in unavailable.headers
    store.close()
