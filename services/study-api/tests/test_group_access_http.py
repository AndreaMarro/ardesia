from fastapi.testclient import TestClient
from lessonos.study.store import StudyStore
from study_api.app import create_app
from lessonos.study.groups import configure_sessions
from lessonos.study.editions import offer_edition


def test_tutor_sees_persisted_waiting_list_and_students_cannot_read_roster(tmp_path):
    store = StudyStore(tmp_path / 'study.sqlite')
    tutor = store.create_principal('tutor-test', 'teacher')
    students = [store.create_principal(f'student-{index}', 'student') for index in range(3)]
    store.create_edition(tutor, 'fluidi', capacity=2)
    dates=[{'start':f'2026-11-{day:02}T18:00:00+01:00','end':f'2026-11-{day:02}T19:30:00+01:00'} for day in (3,5,10,12)]
    configure_sessions(store,tutor,'fluidi',dates)
    offer_edition(store,tutor,'fluidi','fixture-offer',confirmed=True)
    tokens = {actor.id: store.issue_session(actor) for actor in [tutor, *students]}
    app = create_app(store.path, demo=True)
    with TestClient(app) as client:
        for index, student in enumerate(students):
            client.post('/study/session', json={'token': tokens[student.id]})
            response = client.post('/study/editions/fluidi/holds', headers={'Idempotency-Key': f'hold-{index}'})
            if index < 2:
                assert response.status_code == 200
                assert client.post('/study/holds/' + response.json()['id'] + '/confirm',
                    headers={'Idempotency-Key': f'confirm-{index}'}).status_code == 200
            else:
                assert response.status_code == 409
            assert client.get('/study/editions/fluidi/access').status_code == 403
        client.post('/study/session', json={'token': tokens[tutor.id]})
        result = client.get('/study/editions/fluidi/access').json()
        assert result['members'] == sorted(student.id for student in students[:2])
        assert result['waitlist'] == [students[2].id]
    store.close()
