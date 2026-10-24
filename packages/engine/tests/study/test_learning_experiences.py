"""Synthetic predictions use immutable Study receipts, never a second ledger."""
import json
import pytest
from lessonos.study.models import StudyError
from lessonos.study.submissions import submit, list_submissions
from test_identity_store import setup_store


def evidence(**changes):
    return {'schemaVersion': 1, 'experienceId': 'poiseuille-boundary-v1',
            'stepId': 'fixed-flow', 'prediction': {'ratio': 16, 'fixedQuantity': 'pressure'},
            'supportUsed': [], **changes}


def test_prediction_receipt_freezes_constraint_error_and_server_model_before_result(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    receipt = submit(store, student, 'fluidi', 'poiseuille-v1', [],
        'La pressione aumenta perché il raggio raddoppia.', 'prediction',
        activity_parameters={'radiusRatio': 2, 'boundary': 'flow'}, activity_evidence=evidence())
    recorded = receipt['activityEvidence']
    assert recorded['prediction'] == {'ratio': 16, 'fixedQuantity': 'pressure'}
    assert recorded['result']['ratio'] == .0625
    assert recorded['result']['fixedQuantity'] == 'flow'
    assert recorded['check'] == {'ratioMatches': False, 'constraintMatches': False}
    assert recorded['assistance'] == 'NO_SUPPORT_REQUESTED'
    assert 'review' not in recorded
    assert list_submissions(store, tutor, 'fluidi')[0]['activityEvidence'] == recorded
    assert list_submissions(store, peer, 'fluidi') == []
    assert submit(store, student, 'fluidi', 'poiseuille-v1', [],
        'La pressione aumenta perché il raggio raddoppia.', 'prediction',
        activity_parameters={'radiusRatio': 2, 'boundary': 'flow'}, activity_evidence=evidence()) == receipt


def test_experience_parameters_cannot_be_relabelled_and_unknown_claims_are_rejected(tmp_path):
    store, tutor, student, *_ = setup_store(tmp_path)
    for parameters, value in [({'radiusRatio': .5, 'boundary': 'flow'}, evidence()),
                              ({'radiusRatio': 2, 'boundary': 'flow'}, evidence(humanReviewed=True))]:
        with pytest.raises(StudyError, match='invalid_activity_evidence'):
            submit(store, student, 'fluidi', 'poiseuille-v1', [], 'Procedimento originale', 'invalid',
                   activity_parameters=parameters, activity_evidence=value)
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0] == 0


def test_transfer_support_and_original_remain_visible_without_claiming_human_review(tmp_path):
    store, tutor, student, *_ = setup_store(tmp_path)
    receipt = submit(store, student, 'fluidi', 'poiseuille-v1', [],
        'A portata fissata dimezzare il raggio richiede sedici volte la pressione.', 'transfer',
        activity_parameters={'radiusRatio': .5, 'boundary': 'flow'},
        activity_evidence=evidence(stepId='transfer', prediction={'ratio': 16, 'fixedQuantity': 'flow'},
                                   supportUsed=['constraint-hint']))
    assert receipt['activityEvidence']['exerciseRef'] == 'RF-04'
    assert receipt['activityEvidence']['assistance'] == 'SUPPORT_REQUESTED'
    assert receipt['activityEvidence']['check'] == {'ratioMatches': True, 'constraintMatches': True}
    original = list_submissions(store, tutor, 'fluidi')[0]['source_refs'][0]
    assert 'dimezzare' in store.get_resource_revision(tutor, original['resourceId'], original['revisionId'])['text']


def test_two_editorial_variants_resolve_the_existing_pack_without_exposing_solutions(tmp_path):
    from lessonos.study.learning_experiences import list_experiences
    store, tutor, student, peer, other = setup_store(tmp_path)
    result = list_experiences(store, student, 'fluidi')
    assert len(result['experiences']) == 2
    assert result['experiences'][0]['steps'][2]['parameters'] == {'radiusRatio': .5, 'boundary': 'flow'}
    assert result['experiences'][1]['steps'][0]['exerciseRef'] == 'RF-02'
    assert 'answer' not in json.dumps(result)
    with pytest.raises(StudyError):
        list_experiences(store, other, 'fluidi')


def test_reopening_the_same_step_cannot_erase_the_previous_available_model_result(tmp_path):
    store, tutor, student, *_ = setup_store(tmp_path)
    arguments = dict(activity_parameters={'radiusRatio': 2, 'boundary': 'flow'}, activity_evidence=evidence())
    first = submit(store, student, 'fluidi', 'poiseuille-v1', [], 'Prima previsione con procedimento', 'first', **arguments)
    assert first['activityEvidence']['assistance'] == 'NO_SUPPORT_REQUESTED'
    second = submit(store, student, 'fluidi', 'poiseuille-v1', [], 'Seconda previsione dopo riapertura', 'second', **arguments)
    assert second['activityEvidence']['assistance'] == 'SUPPORT_REQUESTED'
    assert 'model-result' in second['activityEvidence']['supportUsed']


def test_episode_original_does_not_overflow_the_canonical_five_source_budget(tmp_path):
    store, tutor, student, *_ = setup_store(tmp_path)
    resources = [store.create_resource(student, 'fluidi', 'notes', 'Originale sintetico ' + str(i)) for i in range(5)]
    refs = [{'resourceId': item['id'], 'revisionId': item['revisionId']} for item in resources]
    with pytest.raises(StudyError, match='invalid_source_refs'):
        submit(store, student, 'fluidi', 'poiseuille-v1', [], 'Procedimento con cinque fonti originali', 'over-budget',
            source_refs=refs, activity_parameters={'radiusRatio': 2, 'boundary': 'flow'}, activity_evidence=evidence())
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0] == 0
    assert store.connection.execute('SELECT COUNT(*) FROM study_resources').fetchone()[0] == 5
    receipt = submit(store, student, 'fluidi', 'poiseuille-v1', [], 'Procedimento con quattro fonti originali', 'within-budget',
        source_refs=refs[:4], activity_parameters={'radiusRatio': 2, 'boundary': 'flow'}, activity_evidence=evidence())
    assert receipt['receiptId']
    assert len(list_submissions(store, tutor, 'fluidi')[0]['source_refs']) == 5
