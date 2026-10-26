"""Owner-proposed factory wiring, with real auth/store and no installer mock.

Run only after applying the proposed patch in a disposable source snapshot.
"""
from fastapi.testclient import TestClient
from study_api.app import create_app
from lessonos.study.store import StudyStore


def seed(path):
    store = StudyStore(path)
    tutor = store.create_principal('tutor-s06-composition', 'teacher')
    student = store.create_principal('student-s06-composition-a', 'student')
    peer = store.create_principal('student-s06-composition-b', 'student')
    empty = store.create_principal('student-s06-composition-c', 'student')
    for edition, course, pack in [
        ('mechanics', 'strumenti-meccanica', 'sf-strumenti-meccanica-v1'),
        ('analysis', 'analisi-1', 'taylor-exp-v1'),
    ]:
        store.create_edition(tutor, edition, course_id=course, pack_id=pack, pack_version=1)
        store.add_test_member(tutor, edition, student.id)
        store.add_test_member(tutor, edition, peer.id)
    # Original empty-workspace PhysicsLab fetches this public legacy fixture.
    # No membership is granted to the empty actor.
    store.create_edition(tutor, 'fluidi')
    return store, tutor, student, peer, empty


def test_factory_registers_authenticated_routes_and_keeps_role_guards(tmp_path):
    store, tutor, student, peer, empty = seed(tmp_path / 'study.sqlite')
    try:
        with TestClient(create_app(store.path, demo=True)) as client:
            root = '/study/independent-study?editionId=mechanics'
            assert client.get(root).status_code == 401
            for actor in [tutor, empty]:
                assert client.post('/study/session', json={'token': store.issue_session(actor)}).status_code == 200
                assert client.get(root).status_code == 403
            client.post('/study/session', json={'token': store.issue_session(student)})
            assert client.get(root).status_code == 200
    finally:
        store.close()


def test_factory_receipts_rating_cold_reopen_and_cookie_revocation(tmp_path):
    store, tutor, student, peer, empty = seed(tmp_path / 'study.sqlite')
    root = '/study/independent-study'
    try:
        with TestClient(create_app(store.path, demo=True)) as client:
            client.post('/study/session', json={'token': store.issue_session(student)})
            ref = client.get(root + '?editionId=mechanics').json()['objectives'][0]['lessonRef']
            response = client.post(root, json={'editionId': 'mechanics', 'lessonRef': ref}, headers={'Idempotency-Key': 'begin'})
            assert response.status_code == 200
            state = response.json()
            target = root + '/' + state['id']

            def action(name, **fields):
                nonlocal state
                body = {'revisionId': state['revisionId'], 'action': name, 'fields': fields}
                headers = {'Idempotency-Key': name + state['revisionId']}
                response = client.post(target + '/actions', json=body, headers=headers)
                assert response.status_code == 200, response.text
                state = response.json()
                assert client.post(target + '/actions', json=body, headers=headers).json() == state

            def answer(key, value):
                nonlocal state
                response = client.post(target + '/attempts', json={'revisionId': state['revisionId'], 'answer': {'value': value, 'unit': 'm', 'reasoning': 'Confronto forza e costante elastica.'}}, headers={'Idempotency-Key': key})
                assert response.status_code == 200, response.text
                state = client.get(target).json()

            action('diagnostic', text='Controllo F/k'); action('next'); action('next')
            action('hint'); answer('first', 999); action('recover'); action('next')
            answer('transfer', .075); action('finish')
            source = state['sourceRef']; assistance = state['assistanceHistory']
            receipts = [a['receipt']['receiptId'] for a in state['attempts']]
            action('rate', rating='good'); action('schedule', days=7)
            due = state['reviewAt']
            # Projection in App is separate from canonical retrieval or deletion.
            workspace = client.get('/study/workspace?editionId=mechanics').json()
            assert len([r for r in workspace['resources'] if r['kind'].startswith('independent-study-')]) == 4
            client.post('/study/session', json={'token': store.issue_session(peer)})
            assert client.get(target).status_code == 403
        with TestClient(create_app(store.path, demo=True)) as cold:
            cold.post('/study/session', json={'token': store.issue_session(student)})
            reopened = cold.get(target).json()
            assert reopened['sourceRef'] == source and reopened['assistanceHistory'] == assistance
            assert reopened['reviewAt'] == due and reopened['reviewScheduler']['lastRating'] == 'good'
            assert [a['receipt']['receiptId'] for a in reopened['attempts']] == receipts
            store.revoke_all_sessions(student)
            rejected = cold.get(target)
            assert rejected.status_code == 401 and rejected.headers['X-Study-Session-Rejected'] == 'cookie'
    finally:
        store.close()
