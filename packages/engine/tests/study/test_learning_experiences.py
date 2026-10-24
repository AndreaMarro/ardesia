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
    variants = {item['id']: item for item in result['experiences']}
    assert set(variants) == {'poiseuille-boundary-v1', 'poiseuille-nearby-v1',
                             'poiseuille-boundary-v2', 'poiseuille-nearby-v2'}
    assert variants['poiseuille-boundary-v1']['steps'][2]['parameters'] == {'radiusRatio': .5, 'boundary': 'flow'}
    assert variants['poiseuille-nearby-v1']['steps'][0]['exerciseRef'] == 'RF-02'
    assert result['experiences'][0]['id'] == 'poiseuille-boundary-v2'
    assert result['experiences'][0]['steps'][2]['parameters'] == {'radiusRatio': 1, 'viscosity': 2, 'length': 2, 'boundary': 'flow'}
    assert result['experiences'][1]['steps'][2]['parameters'] == {'radiusRatio': 1, 'viscosity': 2, 'length': .5, 'boundary': 'pressure'}
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


# Composable episodes use the same command/receipt boundary as legacy episodes.
def composable_step(store, actor, step_id='relative', edition_id='fluidi'):
    from lessonos.study.learning_experiences import list_experiences
    data = list_experiences(store, actor, edition_id, format='composable')
    experience = next(item for item in data['experiences'] if item['id'] == 'hydrostatic-reference-v1')
    step = next(item for item in experience['steps'] if item['id'] == step_id)
    return experience, step


def scalar_evidence(experience, step, value=19620, unit='Pa', **changes):
    return {'schemaVersion': 2, 'experienceRef': experience['experienceRef'], 'stepId': step['id'],
            'prediction': {'kind': 'scalar', 'value': value, 'unit': unit}, 'supportUsed': [], **changes}


def scalar_submit(store, actor, experience, step, key, value=19620, unit='Pa', edition_id='fluidi', **changes):
    return submit(store, actor, edition_id, step['activityId'], [], 'Dichiaro il riferimento e documento il procedimento.', key,
                  activity_parameters=step['parameters'],
                  activity_evidence=scalar_evidence(experience, step, value, unit, **changes))


def test_composable_projection_pins_pack_model_and_editorial_content_without_solutions(tmp_path):
    from lessonos.study.learning_experiences import list_experiences
    store, tutor, student, peer, other = setup_store(tmp_path)
    before = list_experiences(store, student, 'fluidi')
    experience, step = composable_step(store, student)
    assert experience['compositionVersion'] == 1
    assert experience['experienceRef']['id'] == experience['id']
    assert experience['experienceRef']['version'] == 1
    assert len(experience['experienceRef']['sha256']) == 64
    assert experience['coursePackRef']['packSha256'] == before['coursePackRef']['packSha256']
    assert [item['id'] for item in experience['steps']] == ['relative', 'absolute', 'transfer']
    assert step['prediction'] == {'kind': 'scalar', 'unit': 'Pa'}
    assert step['activityVersion'] == 1
    assert step['phases'].index('prediction') < step['phases'].index('model')
    assert step['advanceWhen'] == 'receipt-confirmed'
    assert len(step['hints']) == 2
    assert all(key not in json.dumps(experience) for key in ('"answer"', '"result"', '"check"'))
    assert list_experiences(store, student, 'fluidi') == before
    assert store.connection.execute('SELECT COUNT(*) FROM study_receipts').fetchone()[0] == 0
    with pytest.raises(StudyError):
        list_experiences(store, other, 'fluidi', format='composable')


@pytest.mark.parametrize('step_id,value', [('relative', 19620), ('absolute', 120945), ('transfer', 114335)])
def test_scalar_prediction_receipt_uses_independent_si_oracle_and_same_original_path(tmp_path, step_id, value):
    store, tutor, student, peer, other = setup_store(tmp_path)
    experience, step = composable_step(store, student, step_id)
    receipt = scalar_submit(store, student, experience, step, 'hydro-' + step_id, value)
    recorded = receipt['activityEvidence']
    assert recorded['result']['kind'] == 'scalar'
    assert recorded['result']['value'] == value
    assert recorded['result']['unit'] == 'Pa'
    assert recorded['check'] == {'kind': 'scalar', 'valueMatches': True, 'unitMatches': True}
    assert recorded['assistance'] == 'NO_SUPPORT_REQUESTED'
    assert receipt['courseContext']['parameters'] == step['parameters']
    assert recorded['experienceRef'] == experience['experienceRef']
    assert 'review' not in recorded and 'approved' not in recorded
    assert scalar_submit(store, student, experience, step, 'hydro-' + step_id, value) == receipt
    submission = list_submissions(store, tutor, 'fluidi')[0]
    assert store.get_resource_revision(tutor, **{'resource_id': submission['source_refs'][0]['resourceId'],
        'revision_id': submission['source_refs'][0]['revisionId']})['text'].startswith('Dichiaro')
    assert list_submissions(store, peer, 'fluidi') == []


def test_wrong_scalar_value_and_unit_are_preserved_as_prediction_errors(tmp_path):
    store, tutor, student, *_ = setup_store(tmp_path)
    experience, step = composable_step(store, student)
    recorded = scalar_submit(store, student, experience, step, 'wrong', value=0, unit='kPa')['activityEvidence']
    assert recorded['prediction'] == {'kind': 'scalar', 'value': 0, 'unit': 'kPa'}
    assert recorded['result']['value'] == 19620
    assert recorded['check'] == {'kind': 'scalar', 'valueMatches': False, 'unitMatches': False}


@pytest.mark.parametrize('change', [
    {'experienceRef': {'id': 'hydrostatic-reference-v1', 'version': 999, 'sha256': 'a' * 64}},
    {'experienceRef': {'id': 'hydrostatic-reference-v1', 'version': 1, 'sha256': 'b' * 64}},
    {'prediction': {'kind': 'ratio', 'ratio': 19620, 'fixedQuantity': 'pressure'}},
    {'prediction': {'kind': 'scalar', 'value': True, 'unit': 'Pa'}},
    {'result': {'kind': 'scalar', 'value': 19620}},
    {'assistance': 'NO_SUPPORT_REQUESTED'},
])
def test_composable_rejects_forged_pins_prediction_types_and_client_results_atomically(tmp_path, change):
    store, tutor, student, *_ = setup_store(tmp_path)
    experience, step = composable_step(store, student)
    with pytest.raises(StudyError, match='invalid_activity_evidence'):
        scalar_submit(store, student, experience, step, 'forged', **change)
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0] == 0
    assert store.connection.execute('SELECT COUNT(*) FROM study_resources').fetchone()[0] == 0


def test_composable_rejects_parameter_relabelling_and_stale_pack_without_writes(tmp_path):
    store, tutor, student, *_ = setup_store(tmp_path)
    experience, step = composable_step(store, student)
    with pytest.raises(StudyError, match='invalid_activity_evidence'):
        submit(store, student, 'fluidi', 'hydrostatic-v1', [], 'Procedimento originale', 'changed',
               activity_parameters={**step['parameters'], 'depth': 3}, activity_evidence=scalar_evidence(experience, step))
    store.connection.execute("UPDATE study_edition_packs SET pack_sha256=? WHERE edition_id='fluidi'", ('f' * 64,))
    store.connection.commit()
    with pytest.raises(StudyError, match='coursepack_unavailable'):
        scalar_submit(store, student, experience, step, 'stale-pack')
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0] == 0


def test_available_scalar_result_cannot_be_reset_and_reference_actor_edition_are_isolated(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    experience, step = composable_step(store, student)
    first = scalar_submit(store, student, experience, step, 'first')
    second = scalar_submit(store, student, experience, step, 'reopen')
    assert first['activityEvidence']['assistance'] == 'NO_SUPPORT_REQUESTED'
    assert second['activityEvidence']['supportUsed'] == ['model-result']
    assert scalar_submit(store, peer, experience, step, 'peer')['activityEvidence']['assistance'] == 'NO_SUPPORT_REQUESTED'
    absolute_experience, absolute = composable_step(store, student, 'absolute')
    assert scalar_submit(store, student, absolute_experience, absolute, 'reference', 120945)['activityEvidence']['assistance'] == 'NO_SUPPORT_REQUESTED'
    store.create_edition(tutor, 'fluidi-alt')
    store.add_test_member(tutor, 'fluidi-alt', student.id)
    assert scalar_submit(store, student, experience, step, 'edition', edition_id='fluidi-alt')['activityEvidence']['assistance'] == 'NO_SUPPORT_REQUESTED'
    assert json.loads(store.connection.execute('SELECT body FROM study_receipts WHERE id=?', (first['receiptId'],)).fetchone()[0]) == first


def test_concurrent_scalar_predictions_serialize_result_availability_under_canonical_lease(tmp_path):
    from concurrent.futures import ThreadPoolExecutor
    from threading import Barrier
    from lessonos.study.store import StudyStore
    store, tutor, student, *_ = setup_store(tmp_path)
    experience, step = composable_step(store, student)
    path = store.path
    store.close()
    barrier = Barrier(2)
    def send(index):
        independent = StudyStore(path)
        try:
            barrier.wait(timeout=5)
            return scalar_submit(independent, student, experience, step, 'race-' + str(index))
        finally:
            independent.close()
    with ThreadPoolExecutor(2) as pool:
        receipts = list(pool.map(send, range(2)))
    assert sorted(item['activityEvidence']['assistance'] for item in receipts) == ['NO_SUPPORT_REQUESTED', 'SUPPORT_REQUESTED']


def test_editorial_revision_changes_pin_but_cannot_reset_available_model(tmp_path, monkeypatch):
    from pathlib import Path
    store, tutor, student, *_ = setup_store(tmp_path)
    experience, step = composable_step(store, student)
    first = scalar_submit(store, student, experience, step, 'revision-1')
    original_read = Path.read_text
    def read_revision(path, *args, **kwargs):
        raw = original_read(path, *args, **kwargs)
        if path.name == 'learning-compositions-v1.json':
            source = json.loads(raw)
            source['experiences'][0]['version'] = 2
            source['experiences'][0]['id'] = 'hydrostatic-reference-v2'
            source['experiences'][0]['steps'][0]['title'] = 'Revisione editoriale sintetica'
            return json.dumps(source)
        return raw
    monkeypatch.setattr(Path, 'read_text', read_revision)
    from lessonos.study.learning_experiences import list_experiences
    current = list_experiences(store, student, 'fluidi', format='composable')['experiences'][0]
    current_step = current['steps'][0]
    assert current['experienceRef']['sha256'] != experience['experienceRef']['sha256']
    with pytest.raises(StudyError, match='invalid_activity_evidence'):
        scalar_submit(store, student, experience, step, 'obsolete-revision')
    current_receipt = scalar_submit(store, student, current, current_step, 'revision-2')
    assert current_receipt['activityEvidence']['supportUsed'] == ['model-result']
    assert json.loads(store.connection.execute('SELECT body FROM study_receipts WHERE id=?', (first['receiptId'],)).fetchone()[0]) == first


@pytest.mark.parametrize('change', [
    {'phases': ['situation', 'model', 'prediction', 'visual', 'explanation', 'source']},
    {'activityVersion': 2},
    {'parameters': {'density': 1000, 'depth': 2, 'reference': 'gauge', 'untracked': True}},
    {'answer': 19620},
    {'exerciseRef': 'DOES-NOT-EXIST'},
])
def test_composition_preview_rejects_reveal_before_prediction_or_unpinned_source(tmp_path, monkeypatch, change):
    from pathlib import Path
    from lessonos.study.learning_experiences import list_experiences
    store, tutor, student, *_ = setup_store(tmp_path)
    original_read = Path.read_text
    def malformed(path, *args, **kwargs):
        raw = original_read(path, *args, **kwargs)
        if path.name == 'learning-compositions-v1.json':
            data = json.loads(raw)
            data['experiences'][0]['steps'][0].update(change)
            return json.dumps(data)
        return raw
    monkeypatch.setattr(Path, 'read_text', malformed)
    with pytest.raises(StudyError, match='invalid_experience_composition'):
        list_experiences(store, student, 'fluidi', format='composable')
    assert store.connection.execute('SELECT COUNT(*) FROM study_receipts').fetchone()[0] == 0
