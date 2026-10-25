"""Public preview is a separate, stateless surface of the existing Core."""
import pytest
from fastapi.testclient import TestClient
from lessonos.study.activities import evaluate_activity
from study_api.public_app import create_public_app


def test_public_course_has_no_private_identity_or_unapproved_offer():
    with TestClient(create_public_app()) as client:
        response = client.get('/study/public/course')
        assert response.status_code == 200
        course = response.json()
        assert course['status'] == 'proposed'
        assert course['priceMinor'] is None and course['sessions'] == []
        assert course['interestCollection'] == 'closed'
        assert not {'teacherId', 'members', 'token', 'contact'} & course.keys()
        assert 'set-cookie' not in response.headers


@pytest.mark.parametrize('path', [
    '/study/session', '/study/workspace', '/study/interests',
    '/study/assets', '/study/editions/fluidi/register', '/study/course',
    '/study/public/unknown',
])
def test_private_and_unknown_api_paths_never_fall_back_to_html(tmp_path, path):
    (tmp_path / 'index.html').write_text('<h1>Public preview</h1>')
    with TestClient(create_public_app(frontend=tmp_path)) as client:
        assert client.get('/').status_code == 200
        for method in ['GET', 'POST', 'DELETE']:
            response = client.request(method, path, headers={'Cookie': 'study_session=untrusted'})
            assert response.status_code == 404
            assert response.json() == {'error': 'not_found'}


@pytest.mark.parametrize('radius', [.5, 1, 1.5, 2])
@pytest.mark.parametrize('boundary', ['pressure', 'flow'])
def test_public_calculation_uses_the_same_core_oracle(radius, boundary):
    parameters = {'radiusRatio': radius, 'boundary': boundary}
    with TestClient(create_public_app()) as client:
        response = client.post('/study/public/activities/evaluate',
                               json={'activityId': 'poiseuille-v1', 'parameters': parameters})
        assert response.status_code == 200
        assert response.json() == evaluate_activity('poiseuille-v1', parameters)


@pytest.mark.parametrize('body', [
    {'activityId': 'taylor-exp-v1', 'parameters': {}},
    {'activityId': 'poiseuille-v1', 'parameters': {'radiusRatio': True}},
    {'activityId': 'poiseuille-v1', 'parameters': {'radiusRatio': 0}},
    {'activityId': 'poiseuille-v1', 'parameters': {'radiusRatio': 100}},
    {'activityId': 'poiseuille-v1', 'parameters': {'boundary': 'unknown'}},
    {'activityId': 'poiseuille-v1', 'parameters': {'contact': 'private@example.invalid'}},
    {'activityId': 'poiseuille-v1', 'parameters': {}, 'prediction': 'private text'},
])
def test_public_input_is_bounded_and_errors_do_not_echo_input(body):
    with TestClient(create_public_app()) as client:
        response = client.post('/study/public/activities/evaluate', json=body)
        assert response.status_code in (404, 422)
        assert set(response.json()) == {'error'}
        assert 'private' not in response.text


def test_public_body_limit_applies_without_content_length():
    with TestClient(create_public_app()) as client:
        response = client.post('/study/public/activities/evaluate',
                               content=iter([b' ' * 3000, b' ' * 3000]),
                               headers={'Content-Type': 'application/json'})
        assert response.status_code == 413
        malformed = client.post('/study/public/activities/evaluate',
                                content='{"parameters": NaN}', headers={'Content-Type': 'application/json'})
        assert malformed.status_code == 422


def test_public_rate_limit_recovers_without_persistent_identity():
    now = [10.0]
    app = create_public_app(request_limit=2, clock=lambda: now[0])
    with TestClient(app) as client:
        for _ in range(2):
            assert client.get('/study/public/course').status_code == 200
        limited = client.get('/study/public/course')
        assert limited.status_code == 429 and limited.headers['retry-after'] == '60'
        now[0] += 60
        assert client.get('/study/public/course').status_code == 200


def test_public_preview_does_not_enable_the_synthetic_app_for_production(tmp_path):
    from study_api.app import create_app
    with pytest.raises(ValueError, match='synthetic_only'):
        create_app(tmp_path / 'not-created.sqlite', demo=False)
    assert not (tmp_path / 'not-created.sqlite').exists()
