"""Exact editorial provenance through the real command and durable receipt."""
from copy import deepcopy

import pytest
from fastapi.testclient import TestClient

from lessonos.study import catalog, coursepack, four_courses
from study_api.app import create_app
from test_identity import setup_store


@pytest.fixture
def context_case(tmp_path, monkeypatch):
    # Two authorized synthetic lessons deliberately share one scientific model.
    original_load = catalog.load_pack
    pack_id = 'sf-strumenti-meccanica-v1'
    pack = deepcopy(original_load(pack_id, 1))
    first = next(item for item in pack['lessons'] if item['id'] == 'original-demo-u2-02')
    second = deepcopy(first)
    second['id'] = 'synthetic-second-hooke'
    second['title'] = 'Seconda lezione sintetica sullo stesso modello'
    pack['lessons'].append(second)

    def load(pack_id_arg=catalog.DEFAULT_PACK, version=1):
        return deepcopy(pack) if pack_id_arg == pack_id and version == 1 else original_load(pack_id_arg, version)

    for module in (catalog, coursepack, four_courses):
        monkeypatch.setattr(module, 'load_pack', load)
    monkeypatch.setattr(four_courses, 'DEMO_IDS', four_courses.DEMO_IDS | {second['id']})
    store, tutor, student, peer, _ = setup_store(tmp_path)
    store.create_edition(tutor, 'mechanics', course_id='strumenti-meccanica', pack_id=pack_id, pack_version=1)
    store.add_test_member(tutor, 'mechanics', student.id)
    store.add_test_member(tutor, 'mechanics', peer.id)
    with TestClient(create_app(store.path, demo=True)) as client:
        assert client.post('/study/session', json={'token': store.issue_session(student)}).status_code == 200
        course = client.get('/study/course-learning?editionId=mechanics').json()['course']
        lessons = [item for item in course['lessons'] if item['activityId'] == 'hooke-v1']
        assert len(lessons) == 2
        yield store, client, student, peer, tutor, lessons
    store.connection.close()


def body(lesson, phase='practice', **extra):
    return {'editionId': 'mechanics', 'activityId': lesson['activityId'],
            'activityParameters': lesson[phase]['parameters'], 'text': 'Procedimento sintetico: F = k x.',
            'courseLesson': {'lessonRef': lesson['lessonRef'], 'phase': phase}, **extra}


def send(client, payload, key):
    return client.post('/study/submissions', json=payload, headers={'Idempotency-Key': key})


def test_two_lessons_same_model_and_two_phases_have_distinct_durable_provenance(context_case):
    store, client, student, peer, tutor, lessons = context_case
    receipts = []
    for index, (lesson, phase) in enumerate(((lessons[0], 'practice'), (lessons[1], 'practice'), (lessons[0], 'transfer'))):
        payload = body(lesson, phase)
        response = send(client, payload, f'exact-{index}')
        assert response.status_code == 200, response.text
        receipt = response.json()
        assert receipt['courseContext']['lessonRef'] == lesson['lessonRef']
        assert receipt['courseContext']['phase'] == phase
        assert send(client, payload, f'exact-{index}').json() == receipt
        receipts.append(receipt)
    # A fresh factory/connection must recover the exact immutable receipt.
    with TestClient(create_app(store.path, demo=True)) as reopened:
        reopened.post('/study/session', json={'token': store.issue_session(student)})
        for receipt in receipts:
            assert reopened.get('/study/receipts/' + receipt['receiptId']).json() == receipt
        submissions = reopened.get('/study/workspace?editionId=mechanics').json()['submissions']
        assert {s['courseContext']['lessonRef']['id'] for s in submissions} == {l['id'] for l in lessons}
        reopened.post('/study/session', json={'token': store.issue_session(peer)})
        assert reopened.get('/study/receipts/' + receipts[0]['receiptId']).status_code == 403
        reopened.post('/study/session', json={'token': store.issue_session(tutor)})
        assert reopened.get('/study/receipts/' + receipts[0]['receiptId']).json() == receipts[0]


@pytest.mark.parametrize('change', [
    {'lessonRef': {'id': 'foreign-lesson', 'version': 1, 'sha256': '0' * 64}},
    {'phase': 'invented'},
    {'lessonRef': {'id': 'original-demo-u2-02', 'version': 2, 'sha256': '0' * 64}},
    {'lessonRef': {'id': 'original-demo-u2-02', 'version': 1, 'sha256': '0' * 64}},
])
def test_foreign_stale_and_malformed_lesson_references_never_create_receipts(context_case, change):
    store, client, _, _, _, lessons = context_case
    payload = body(lessons[0])
    payload['courseLesson'].update(change)
    response = send(client, payload, 'invalid-context')
    assert response.status_code == (422 if change.get('phase') == 'invented' else 409), response.text
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0] == 0


def test_retry_and_idempotency_never_relabel_an_attempt_from_another_lesson_or_phase(context_case):
    _, client, _, _, _, lessons = context_case
    original = body(lessons[0])
    receipt = send(client, original, 'first-attempt').json()
    assert send(client, body(lessons[1]), 'first-attempt').status_code == 409
    assert send(client, body(lessons[0], 'transfer'), 'first-attempt').status_code == 409
    for index, payload in enumerate((body(lessons[1]), body(lessons[0], 'transfer'))):
        payload['parentId'] = receipt['submissionId']
        response = send(client, payload, f'wrong-parent-{index}')
        assert response.status_code == 409, response.text
        assert response.json()['error'] == 'parent_course_lesson_mismatch'
    corrected = send(client, body(lessons[0], parentId=receipt['submissionId']), 'corrected')
    assert corrected.status_code == 200, corrected.text
    assert corrected.json()['revision'] == 2


def test_legacy_commands_remain_compatible_but_cannot_claim_exact_provenance_afterward(context_case):
    _, client, _, _, _, lessons = context_case
    legacy = body(lessons[0])
    legacy.pop('courseLesson')
    first = send(client, legacy, 'legacy')
    assert first.status_code == 200, first.text
    assert 'lessonRef' not in first.json()['courseContext']
    response = send(client, body(lessons[0], parentId=first.json()['submissionId']), 'claimed-afterward')
    assert response.status_code == 409, response.text


def test_transfer_cannot_label_parameters_from_a_different_scenario(context_case):
    store, client, _, _, _, lessons = context_case
    payload = body(lessons[0], 'transfer')
    payload['activityParameters'] = lessons[0]['practice']['parameters']
    response = send(client, payload, 'wrong-transfer-parameters')
    assert response.status_code == 409, response.text
    assert response.json()['error'] == 'course_lesson_parameters_mismatch'
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0] == 0
