from fastapi.testclient import TestClient

from lessonos.study import exam
from lessonos.study.exam import DURATION_SECONDS
from lessonos.study.store import StudyStore, canonical, identifier
from study_api.app import create_app


def insert_historical_attempt(store, student):
    pack = exam.load_exam_pack()
    attempt_id = identifier()
    started_at = store.clock()
    question_ids = [question['id'] for question in pack['questions']]
    store.connection.execute(
        'INSERT INTO study_exam_attempts VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        (attempt_id, 'fluidi', student.id, pack['id'], pack['version'],
         exam.pack_fingerprint(pack), canonical(question_ids), '{}', 'in_progress',
         started_at, started_at + exam.DURATION_SECONDS, None, None, None, None,
         canonical(pack), 0))
    store.connection.commit()
    return attempt_id


def client_for(tmp_path, store=None):
    store = store or StudyStore(tmp_path / 'db.sqlite')
    tutor = store.create_principal('tutor', 'teacher')
    student = store.create_principal('student', 'student')
    store.create_edition(tutor, 'fluidi')
    store.add_test_member(tutor, 'fluidi', student.id)
    client = TestClient(create_app(store.path, demo=True))
    assert client.post('/study/session', json={'token': store.issue_session(student)}).status_code == 200
    return client, store, student


def test_exam_http_roundtrip_hides_answers_until_submission(tmp_path):
    client, store, student = client_for(tmp_path)
    with client:
        assert client.get('/study/exams?editionId=fluidi').json()['attempts'] == []
        insert_historical_attempt(store, student)
        started = client.post('/study/exams', json={'editionId': 'fluidi'})
        assert started.status_code == 200
        attempt = started.json()
        assert attempt['status'] == 'in_progress' and attempt['remainingSeconds'] == DURATION_SECONDS
        assert all('explanation' not in question for question in attempt['questions'])
        saved = client.put(f"/study/exams/{attempt['id']}/answers", json={'answers': {'fis-mecc-01': 0}})
        assert saved.status_code == 200 and saved.json()['answers'] == {'fis-mecc-01': 0}
        submitted = client.post(f"/study/exams/{attempt['id']}/submit", json={'answers': {'fis-mecc-01': 0}})
        assert submitted.status_code == 200
        result = submitted.json()
        assert result['status'] == 'submitted'
        assert result['result']['scoreTenths'] == 10
        assert result['result']['correct'] == 1 and result['result']['omitted'] == 30
        assert result['result']['questions'][0]['explanation']
        listed = client.get('/study/exams?editionId=fluidi').json()['attempts']
        assert len(listed) == 1 and listed[0]['score'] == 1.0
        assert client.get(f"/study/exams/{attempt['id']}").json()['result']['scoreTenths'] == 10
    assert store.connection.execute('SELECT COUNT(*) FROM study_exam_attempts').fetchone()[0] == 1


def test_exam_http_rejects_unknown_answers_and_unauthenticated_access(tmp_path):
    client, store, student = client_for(tmp_path)
    insert_historical_attempt(store, student)
    with client:
        attempt = client.post('/study/exams', json={'editionId': 'fluidi'}).json()
        assert client.put(f"/study/exams/{attempt['id']}/answers", json={'answers': {'unknown': 1}}).status_code == 422
        assert client.post(f"/study/exams/{attempt['id']}/submit", json={'answers': {'fis-mecc-01': 9}}).status_code == 422
        anonymous = TestClient(create_app(store.path, demo=True))
        assert anonymous.get('/study/exams?editionId=fluidi').status_code == 401


def test_exam_http_expires_after_deadline_and_grades_persisted_answers(tmp_path):
    client, store, student = client_for(tmp_path)
    insert_historical_attempt(store, student)
    with client:
        attempt = client.post('/study/exams', json={'editionId': 'fluidi'}).json()
        client.put(f"/study/exams/{attempt['id']}/answers", json={'answers': {'fis-mecc-01': 0}})
        store.connection.execute('UPDATE study_exam_attempts SET deadline_at=? WHERE id=?',
                                 (store.clock() - 11, attempt['id']))
        store.connection.commit()
        expired = client.post(f"/study/exams/{attempt['id']}/submit", json={'answers': {'fis-mecc-01': 1}})
        assert expired.status_code == 200
        body = expired.json()
        assert body['status'] == 'expired'
        assert body['result']['scoreTenths'] == 10
        assert body['remainingSeconds'] == 0
