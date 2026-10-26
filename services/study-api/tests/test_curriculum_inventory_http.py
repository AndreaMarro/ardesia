"""Opt-in curriculum metadata stays private and cannot create candidate courses."""
from fastapi.testclient import TestClient

from lessonos.study import question_bank
from lessonos.study.store import StudyStore
from study_api.app import create_app


def test_teacher_can_inspect_inventory_but_candidate_collections_cannot_be_editions(tmp_path):
    store = StudyStore(tmp_path / 'inventory.sqlite')
    teacher = store.create_principal('fixture-teacher', 'teacher')
    token = store.issue_session(teacher)
    try:
        with TestClient(create_app(store.path, demo=True)) as client:
            assert client.post('/study/session', json={'token': token}).status_code == 200
            default = client.get('/study/admin/coursepacks')
            assert default.status_code == 200 and 'inventory' not in default.json()
            response = client.get('/study/admin/coursepacks?includeInventory=true')
            assert response.status_code == 200
            assert response.headers['cache-control'] == 'no-store'
            payload = response.json()
            assert {k: v for k, v in payload.items() if k != 'inventory'} == default.json()
            assert payload['inventory']['collections']
            assert all(item['creatable'] is False for item in payload['inventory']['collections'])
            assert all(len(item['questionRefs']) <= 3 for item in payload['inventory']['collections'])
            for forbidden in ('"prompt":', '"solution":', '"answer":', 'correctOptionId', 'solutionSteps'):
                assert forbidden not in response.text
            candidate = payload['inventory']['collections'][0]
            for candidate_id in [candidate['id'], candidate['selection']['miniCourseId']]:
                created = client.post('/study/admin/editions', json={
                    'packId': candidate_id, 'packVersion': 1, 'capacity': 10, 'priceMinor': 4900,
                }, headers={'Idempotency-Key': candidate_id})
                assert created.status_code == 422 and created.json()['error'] == 'invalid_coursepack'
            assert client.get('/study/admin/coursepacks?includeInventory=invalid').status_code == 422
        assert store.connection.execute('SELECT COUNT(*) FROM study_editions').fetchone()[0] == 0
        assert store.connection.execute('SELECT COUNT(*) FROM study_question_bank_reviews').fetchone()[0] == 0
        assert store.connection.execute('SELECT COUNT(*) FROM study_question_bank_approvals').fetchone()[0] == 0
    finally:
        store.close()


def test_inventory_rechecks_teacher_session_before_loading_corpus(tmp_path, monkeypatch):
    def forbidden_load(*args, **kwargs):
        raise AssertionError('authorization must precede inventory loading')
    monkeypatch.setattr(question_bank, 'load_bank', forbidden_load)
    store = StudyStore(tmp_path / 'scope.sqlite')
    student = store.create_principal('fixture-student', 'student')
    teacher = store.create_principal('fixture-teacher', 'teacher')
    student_token, teacher_token = store.issue_session(student), store.issue_session(teacher)
    try:
        with TestClient(create_app(store.path, demo=True)) as client:
            url = '/study/admin/coursepacks?includeInventory=true'
            assert client.get(url).status_code == 401
            client.post('/study/session', json={'token': student_token})
            assert client.get(url).status_code == 403
            client.post('/study/session', json={'token': teacher_token})
            assert client.get('/study/admin/coursepacks').status_code == 200
            store.revoke_session(client.cookies.get('study_session'))
            assert client.get(url).status_code == 401
    finally:
        store.close()


def test_pathway_pins_and_unavailable_state_are_explicit_metadata(tmp_path, monkeypatch):
    from lessonos.study import curriculum_pathways
    store = StudyStore(tmp_path / 'pathways.sqlite')
    teacher = store.create_principal('fixture-teacher', 'teacher')
    try:
        with TestClient(create_app(store.path, demo=True)) as client:
            client.post('/study/session', json={'token':store.issue_session(teacher)})
            payload = client.get('/study/admin/coursepacks?includeInventory=true').json()['inventory']
            paths = payload['pathways']
            assert [item['questionCount'] for item in paths['items']] == [1088,1472,800,640]
            assert payload['pathwaysError'] is None
            config = curriculum_pathways.load_pathways_config()
            config['bankRef']['bankVersion'] = 999
            monkeypatch.setattr(curriculum_pathways, 'load_pathways_config', lambda: config)
            result = client.get('/study/admin/coursepacks?includeInventory=true')
            assert result.status_code == 200
            assert result.json()['inventory']['pathways'] is None
            assert result.json()['inventory']['pathwaysError'] == 'curriculum_pathways_unavailable'
            programmes = result.json()['inventory']['programmes']
            assert len(programmes) == 7
            assert programmes == payload['programmes']
            assert {item['packId'] for item in programmes} == {
                'relazioni-fluidi-v1', 'taylor-exp-v1', 's19-circuit-dc-v1',
                'sf-strumenti-meccanica-v1', 'sf-fluidi-termodinamica-v1',
                'sf-elettricita-magnetismo-v1', 'sf-onde-ottica-radiazioni-v1',
            }
        for table in ('study_editions','study_question_bank_reviews','study_question_bank_approvals'):
            assert store.connection.execute('SELECT COUNT(*) FROM '+table).fetchone()[0] == 0
    finally:
        store.close()
