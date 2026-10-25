"""Synthetic HTTP journey: declared local passage, predictions, human-command review and diary.

The descriptor is synthetic; this test does not prove capture or access to bytes.
"""
from fastapi.testclient import TestClient
from study_api.app import create_app
from test_identity import setup_store
import json
import pytest


def descriptor():
    return {'schema': 'ardesia.lesson-passage.v1', 'workspaceId': 'local-default',
            'lessonId': 'synthetic-room', 'sessionId': 'synthetic-session',
            'recordingId': '00000000-0000-4000-8000-000000000001',
            'startEpoch': 1000, 'endEpoch': 2000, 'sha256': 'a' * 64,
            'objectRefs': [{'elementId': 'synthetic-formula', 'version': 1, 'label': 'Il vincolo è Q'}],
            'replayUrl': 'http://127.0.0.1:5173/?vista=replay&at=2000&recording=00000000-0000-4000-8000-000000000001&object=synthetic-formula&session=synthetic-session&sha=' + 'a' * 64 + '&objectVersion=1#synthetic-room'}


@pytest.mark.parametrize("studio_path", ["/", "/studio/"])
def test_episode_http_preserves_exact_passage_and_uses_existing_review_and_diary(tmp_path, studio_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    with TestClient(create_app(store.path, demo=True)) as client:
        def login(actor):
            assert client.post('/study/session', json={'token': store.issue_session(actor)}).status_code == 200
        def post(path, body, key):
            response = client.post('/study/' + path, json=body, headers={'Idempotency-Key': key})
            assert response.status_code == 200, response.text
            return response.json()
        login(tutor)
        passage = post('resources', {'editionId': 'fluidi', 'kind': 'lesson-passage', 'visibility': 'group',
            'text': json.dumps({'schema': 'ardesia.lesson-passage-source.v1', 'descriptor': {**descriptor(), 'replayUrl': descriptor()['replayUrl'].replace(':5173/', ':5173' + studio_path)},
                               'transcript': 'Qui il vincolo è Q: isola Δp e confronta il reciproco della quarta potenza.'})}, 'share-passage')
        ref = {'resourceId': passage['id'], 'revisionId': passage['revisionId']}
        login(student)
        experiences = client.get('/study/learning-experiences?editionId=fluidi').json()
        assert {entry['id'] for entry in experiences['experiences']} == {
            'poiseuille-boundary-v2', 'poiseuille-nearby-v2',
            'poiseuille-boundary-v1', 'poiseuille-nearby-v1'}
        assert client.get('/study/resources/' + passage['id'] + '/revisions/' + passage['revisionId']).json()['text'] == passage['text']
        results = []
        for step_id, parameters, ratio, fixed, aids in [
            ('fixed-pressure', {'radiusRatio': 2, 'boundary': 'pressure'}, 4, 'pressure', []),
            ('fixed-flow', {'radiusRatio': 2, 'boundary': 'flow'}, 16, 'pressure', ['lesson-passage']),
            ('transfer', {'radiusRatio': .5, 'boundary': 'flow'}, 16, 'flow', []),
        ]:
            results.append(post('submissions', {'editionId': 'fluidi', 'activityId': 'poiseuille-v1',
                'activityParameters': parameters, 'text': 'Prevedo il rapporto ' + str(ratio) + ' e dichiaro il vincolo ' + fixed + '.',
                'sourceRefs': [ref], 'activityEvidence': {'schemaVersion': 1, 'experienceId': 'poiseuille-boundary-v1',
                    'stepId': step_id, 'prediction': {'ratio': ratio, 'fixedQuantity': fixed},
                    'supportUsed': aids, 'lessonPassageRef': ref}}, 'prediction-' + step_id))
        assert [item['activityEvidence']['result']['ratio'] for item in results] == [16, .0625, 16]
        assert results[1]['activityEvidence']['assistance'] == 'SUPPORT_REQUESTED'
        assert results[2]['activityEvidence']['assistance'] == 'NO_SUPPORT_REQUESTED'
        assert client.get('/study/diary?editionId=fluidi').json()['threads'] == []
        login(peer)
        assert client.get('/study/receipts/' + results[1]['receiptId']).status_code == 403
        login(tutor)
        workspace = client.get('/study/workspace?editionId=fluidi').json()
        submission = next(item for item in workspace['submissions'] if item['id'] == results[1]['submissionId'])
        assert submission['activityEvidence']['lessonPassageRef'] == ref
        assert submission['source_refs'][0]['resourceId'] != passage['id']
        candidate = post('feedback/drafts', {'submissionId': submission['id']}, 'candidate')
        assert candidate['state'] == 'proposed'
        published = post('feedback/' + candidate['id'] + '/publish', {'expectedRevision': 1,
            'text': 'Q è fissata. Il raggio doppio richiede Δp/Δp₀ = 1/16. Prova ora con raggio dimezzato.',
            'decision': 'returned'}, 'human-review-command')
        assert published['syntheticTutor'] is True  # command proof, not a real human scientific approval
        original_ref = submission['source_refs'][0]
        original = client.get('/study/resources/' + original_ref['resourceId'] + '/revisions/' + original_ref['revisionId']).json()
        quote = original['text']
        thread = post('diary/observations', {'submissionId': submission['id'], 'conceptId': 'model-selection',
            'category': 'model_selection', 'anchor': {**original_ref, 'start': 0, 'end': len(quote), 'quote': quote}}, 'observe')
        criterion = 'Isola la differenza di pressione con Q costante e giustifica la quarta potenza.'
        thread = post('diary/threads/' + thread['threadId'] + '/confirm', {
            'rubric': {'criterion': criterion, 'procedureRequired': True},
            'explanation': 'La previsione scambiava il vincolo pressione con il vincolo portata.',
            'nextStep': 'Risolvi il caso con raggio dimezzato mantenendo Q.',
            'transferExercise': {'exerciseId': 'poiseuille-diary-half-radius-v1',
                'prompt': 'Dimezza il raggio a Q costante e spiega la pressione necessaria.',
                'originalParameters': {'radiusRatio': 2, 'boundary': 'flow'},
                'parameters': {'radiusRatio': .5, 'boundary': 'flow'}}}, 'confirm-observation')
        login(student)
        assert client.get('/study/diary?editionId=fluidi').json()['threads'][0]['feedback']['nextStep'].startswith('Risolvi')
        procedure = 'A Q costante Δp è inversamente proporzionale a r⁴: dimezzando r ottengo Δp/Δp₀ = 16.'
        transfer = post('submissions', {'editionId': 'fluidi', 'activityId': 'poiseuille-diary-half-radius-v1',
            'text': procedure, 'diaryThreadId': thread['threadId'],
            'activityParameters': {'radiusRatio': .5, 'boundary': 'flow'}}, 'assigned-transfer')
        thread = post('diary/threads/' + thread['threadId'] + '/practice', {'submissionId': transfer['submissionId'],
            'exerciseId': 'poiseuille-diary-half-radius-v1', 'parameters': {'radiusRatio': .5, 'boundary': 'flow'}}, 'practice')
        assert thread['status'] == 'PRACTISING'
        login(tutor)
        verified = post('diary/threads/' + thread['threadId'] + '/verify', {'attemptId': thread['attempts'][-1]['attemptId'],
            'rubricEvidence': {'criterion': criterion, 'procedureQuote': procedure,
                'reasoning': 'Il procedimento isola Δp e giustifica il fattore 16.',
                'variationReason': 'Il raggio è dimezzato anziché raddoppiato.'}}, 'verify-transfer')
        assert verified['status'] == 'VERIFIED_RESOLVED'


def test_passage_reference_rejects_tampered_url_session_digest_and_object_version(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    with TestClient(create_app(store.path, demo=True)) as client:
        client.post('/study/session', json={'token': store.issue_session(tutor)})
        for change in ({'replayUrl': 'javascript:alert(1)'}, {'replayUrl': descriptor()['replayUrl'].replace(':5173/', ':5173/studio/private/')}, {'replayUrl': descriptor()['replayUrl'].replace(':5173/', ':5173/studio/../')}, {'replayUrl': descriptor()['replayUrl'].replace(':5173/', ':invalid/')}, {'sessionId': 'other-session'},
                       {'sha256': 'b' * 64}, {'objectRefs': [{'elementId': 'synthetic-formula', 'version': 2, 'label': 'wrong version'}]}):
            source = client.post('/study/resources', json={'editionId': 'fluidi', 'kind': 'lesson-passage', 'visibility': 'group',
                'text': json.dumps({'schema': 'ardesia.lesson-passage-source.v1', 'descriptor': {**descriptor(), **change}, 'transcript': 'Un passaggio sintetico.'})}).json()
            ref = {'resourceId': source['id'], 'revisionId': source['revisionId']}
            client.post('/study/session', json={'token': store.issue_session(student)})
            response = client.post('/study/submissions', json={'editionId': 'fluidi', 'activityId': 'poiseuille-v1',
                'text': 'Procedimento originale del tentativo', 'sourceRefs': [ref],
                'activityParameters': {'radiusRatio': 2, 'boundary': 'flow'},
                'activityEvidence': {'schemaVersion': 1, 'experienceId': 'poiseuille-boundary-v1', 'stepId': 'fixed-flow',
                    'prediction': {'ratio': .0625, 'fixedQuantity': 'flow'}, 'supportUsed': ['lesson-passage'], 'lessonPassageRef': ref}},
                headers={'Idempotency-Key': 'bad-' + source['id']})
            assert response.status_code == 422 and response.json()['error'] == 'invalid_lesson_passage'
            client.post('/study/session', json={'token': store.issue_session(tutor)})
        assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0] == 0
