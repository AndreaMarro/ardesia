"""Versioned transfers and assistance across editorial versions, no live users."""
from fastapi.testclient import TestClient
from study_api.app import create_app
from test_identity import setup_store


def test_v2_transfers_compose_viscosity_and_length_without_mutating_v1(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    with TestClient(create_app(store.path, demo=True)) as client:
        client.post('/study/session', json={'token': store.issue_session(student)})
        data = client.get('/study/learning-experiences?editionId=fluidi').json()
        variants = {entry['id']: entry for entry in data['experiences']}
        assert [e['id'] for e in data['experiences'][:2]] == ['poiseuille-boundary-v2', 'poiseuille-nearby-v2']
        assert variants['poiseuille-boundary-v1']['steps'][-1]['parameters'] == {'radiusRatio': .5, 'boundary': 'flow'}
        for name, expected_parameters, expected_result in [
            ('poiseuille-boundary-v2', {'radiusRatio': 1, 'viscosity': 2, 'length': 2, 'boundary': 'flow'}, 4),
            ('poiseuille-nearby-v2', {'radiusRatio': 1, 'viscosity': 2, 'length': .5, 'boundary': 'pressure'}, 1),
        ]:
            transfer = variants[name]['steps'][-1]
            assert transfer['parameters'] == expected_parameters
            body = {'editionId': 'fluidi', 'activityId': 'poiseuille-v1', 'activityParameters': transfer['parameters'],
                    'text': 'Confronto separatamente viscosità e lunghezza, mantenendo il vincolo indicato.',
                    'activityEvidence': {'schemaVersion': 1, 'experienceId': name, 'stepId': transfer['id'],
                        'prediction': {'ratio': expected_result, 'fixedQuantity': transfer['parameters']['boundary']}, 'supportUsed': []}}
            response = client.post('/study/submissions', json=body, headers={'Idempotency-Key': name})
            assert response.status_code == 200, response.text
            evidence = response.json()['activityEvidence']
            assert evidence['check'] == {'ratioMatches': True, 'constraintMatches': True}
            assert evidence['result']['ratio'] == expected_result
            assert evidence['assistance'] == 'NO_SUPPORT_REQUESTED'
            assert evidence['result']['visual'] == {'flowRatio': 1, 'pressureRatio': expected_result if name.endswith('boundary-v2') else 1, 'meanSpeedRatio': 1}


def test_existing_result_cannot_become_autonomous_by_switching_editorial_version(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    with TestClient(create_app(store.path, demo=True)) as client:
        def submit(actor, experience, key):
            client.post('/study/session', json={'token': store.issue_session(actor)})
            return client.post('/study/submissions', json={'editionId': 'fluidi', 'activityId': 'poiseuille-v1',
                'activityParameters': {'radiusRatio': 2, 'boundary': 'pressure'}, 'text': 'Prevedo il rapporto e documento il procedimento originale.',
                'activityEvidence': {'schemaVersion': 1, 'experienceId': experience, 'stepId': 'fixed-pressure',
                    'prediction': {'ratio': 16, 'fixedQuantity': 'pressure'}, 'supportUsed': []}}, headers={'Idempotency-Key': key})
        legacy = submit(student, 'poiseuille-boundary-v1', 'original')
        assert legacy.status_code == 200
        original = legacy.json()
        assert original['activityEvidence']['assistance'] == 'NO_SUPPORT_REQUESTED'
        current = submit(student, 'poiseuille-boundary-v2', 'new-version')
        assert current.status_code == 200, current.text
        assert current.json()['activityEvidence']['assistance'] == 'SUPPORT_REQUESTED'
        assert 'model-result' in current.json()['activityEvidence']['supportUsed']
        # The canonical old receipt is immutable; a different learner does not
        # inherit this learner's previously available answer.
        assert client.get('/study/receipts/' + original['receiptId']).json() == original
        isolated = submit(peer, 'poiseuille-boundary-v2', 'peer-new-version')
        assert isolated.status_code == 200, isolated.text
        assert isolated.json()['activityEvidence']['assistance'] == 'NO_SUPPORT_REQUESTED'
