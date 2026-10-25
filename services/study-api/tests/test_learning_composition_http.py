"""Composable scalar turns retain canonical authorization, pins and retry receipts."""
from fastapi.testclient import TestClient
from study_api.app import create_app
from test_identity import setup_store
from test_learning_experience_http import descriptor
import json


def test_composable_http_explicit_format_and_evidence2_preserve_exact_source_and_retry(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    with TestClient(create_app(store.path, demo=True)) as client:
        assert client.get('/study/learning-experiences?editionId=fluidi&format=composable').status_code == 401
        client.post('/study/session', json={'token': store.issue_session(tutor)})
        source = client.post('/study/resources', json={'editionId': 'fluidi', 'kind': 'lesson-passage', 'visibility': 'group',
            'text': json.dumps({'schema': 'ardesia.lesson-passage-source.v1', 'descriptor': descriptor(),
                               'transcript': 'Distingui pressione rispetto alla superficie e pressione assoluta.'})}).json()
        ref = {'resourceId': source['id'], 'revisionId': source['revisionId']}
        client.post('/study/session', json={'token': store.issue_session(student)})
        legacy = client.get('/study/learning-experiences?editionId=fluidi').json()
        data = client.get('/study/learning-experiences?editionId=fluidi&format=composable').json()
        assert data['schemaVersion'] == 2
        experience = data['experiences'][0]
        step = experience['steps'][0]
        body = {'editionId': 'fluidi', 'activityId': step['activityId'], 'activityParameters': step['parameters'],
            'text': 'Uso come riferimento la superficie: la colonna fornisce l’incremento.', 'sourceRefs': [ref],
            'activityEvidence': {'schemaVersion': 2, 'experienceRef': experience['experienceRef'], 'stepId': step['id'],
                'prediction': {'kind': 'scalar', 'value': 19620, 'unit': 'Pa'}, 'supportUsed': ['lesson-passage'], 'lessonPassageRef': ref}}
        headers = {'Idempotency-Key': 'scalar-real-retry'}
        response = client.post('/study/submissions', json=body, headers=headers)
        assert response.status_code == 200, response.text
        receipt = response.json()
        assert receipt['activityEvidence']['result']['value'] == 19620
        assert receipt['activityEvidence']['lessonPassageRef'] == ref
        assert receipt['activityEvidence']['assistance'] == 'SUPPORT_REQUESTED'
        assert client.post('/study/submissions', json=body, headers=headers).json() == receipt
        assert client.post('/study/submissions', json={**body, 'text': 'Procedimento diverso'}, headers=headers).status_code == 409
        assert client.get('/study/learning-experiences?editionId=fluidi').json() == legacy
        assert client.get('/study/learning-experiences?editionId=fluidi&format=unknown').status_code == 422
        client.post('/study/session', json={'token': store.issue_session(peer)})
        assert client.get('/study/receipts/' + receipt['receiptId']).status_code == 403
        client.post('/study/session', json={'token': store.issue_session(tutor)})
        submission = client.get('/study/workspace?editionId=fluidi').json()['submissions'][0]
        assert submission['activityEvidence'] == receipt['activityEvidence']
        assert len(submission['source_refs']) == 2


def test_composable_http_rejects_other_editions_passage_even_with_correct_experience_pin(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    store.create_edition(tutor, 'other')
    store.add_test_member(tutor, 'other', student.id)
    source = store.create_resource(tutor, 'other', 'lesson-passage', json.dumps({
        'schema': 'ardesia.lesson-passage-source.v1', 'descriptor': descriptor(), 'transcript': 'Fonte di altra edizione.'}), visibility='group')
    ref = {'resourceId': source['id'], 'revisionId': source['revisionId']}
    with TestClient(create_app(store.path, demo=True)) as client:
        client.post('/study/session', json={'token': store.issue_session(student)})
        experience = client.get('/study/learning-experiences?editionId=fluidi&format=composable').json()['experiences'][0]
        step = experience['steps'][0]
        response = client.post('/study/submissions', json={'editionId': 'fluidi', 'activityId': step['activityId'],
            'activityParameters': step['parameters'], 'text': 'Procedimento originale', 'sourceRefs': [ref],
            'activityEvidence': {'schemaVersion': 2, 'experienceRef': experience['experienceRef'], 'stepId': step['id'],
                'prediction': {'kind': 'scalar', 'value': 19620, 'unit': 'Pa'}, 'supportUsed': ['lesson-passage'], 'lessonPassageRef': ref}},
            headers={'Idempotency-Key': 'cross-edition'})
        assert response.status_code == 422 and response.json()['error'] == 'invalid_lesson_passage'
        assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0] == 0


def test_huge_json_integer_prediction_is_422_and_atomic_for_scalar_and_legacy_ratio(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    with TestClient(create_app(store.path, demo=True)) as client:
        client.post('/study/session', json={'token': store.issue_session(student)})
        experience = client.get('/study/learning-experiences?editionId=fluidi&format=composable').json()['experiences'][0]
        step = experience['steps'][0]
        for name, activity_id, parameters, evidence in [
            ('scalar', step['activityId'], step['parameters'], {'schemaVersion': 2,
             'experienceRef': experience['experienceRef'], 'stepId': step['id'],
             'prediction': {'kind': 'scalar', 'value': 10**1000, 'unit': 'Pa'}, 'supportUsed': []}),
            ('legacy', 'poiseuille-v1', {'radiusRatio': 2, 'boundary': 'flow'}, {'schemaVersion': 1,
             'experienceId': 'poiseuille-boundary-v1', 'stepId': 'fixed-flow',
             'prediction': {'ratio': 10**1000, 'fixedQuantity': 'flow'}, 'supportUsed': []}),
        ]:
            response = client.post('/study/submissions', json={'editionId': 'fluidi', 'activityId': activity_id,
                'activityParameters': parameters, 'text': 'Procedimento originale sintetico.', 'activityEvidence': evidence},
                headers={'Idempotency-Key': 'huge-integer-' + name})
            assert response.status_code == 422
            assert response.json() == {'error': 'invalid_activity_evidence'}
        assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0] == 0
        assert store.connection.execute('SELECT COUNT(*) FROM study_receipts').fetchone()[0] == 0
        assert store.connection.execute('SELECT COUNT(*) FROM study_resources').fetchone()[0] == 0
