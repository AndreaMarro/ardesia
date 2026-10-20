"""Real SQLite diary contracts: version binding, private replay and transfer evidence."""
import importlib
import json
import sqlite3
import pytest
from lessonos.study.models import Principal, StudyError
from lessonos.study.store import StudyStore
from lessonos.study.submissions import submit
from lessonos.study.context import revise_resource, delete_resource
from test_identity_store import setup_store


def diary():
    return importlib.import_module('lessonos.study.diary')


def attempt(store, student, text='Q cresce come r²', key='original', activity_id='poiseuille-v1'):
    receipt = submit(store, student, 'fluidi', activity_id, [], text, key)
    row = store.connection.execute('SELECT source_refs FROM study_submissions WHERE id=?', (receipt['submissionId'],)).fetchone()
    ref = json.loads(row[0])[0]
    return receipt, {**ref, 'start': 0, 'end': len(text), 'quote': text}


def proposed(tmp_path, author_type='manual', category='model_selection'):
    store, tutor, student, peer, other = setup_store(tmp_path)
    receipt, anchor = attempt(store, student)
    result = diary().propose_error(store, tutor, receipt['submissionId'], 'radius-power', category, anchor, 'propose', author_type=author_type)
    return store, tutor, student, peer, other, receipt, anchor, result


def confirm(store, tutor, thread_id, key='confirm', **kwargs):
    return diary().confirm_error(store, tutor, thread_id, {'criterion': 'Usa la quarta potenza a pressione fissata', 'procedureRequired': True}, 'La portata dipende dalla quarta potenza.', 'Prova un raggio doppio.', key,
        transfer_exercise={'exerciseId': 'poiseuille-transfer-v1', 'originalParameters': {'radiusRatio': 1.5, 'boundary': 'pressure'}, 'parameters': {'radiusRatio': 2, 'boundary': 'pressure'}, 'prompt': 'A pressione fissata, raddoppia il raggio e spiega il rapporto di portata.'}, **kwargs)


def opened(tmp_path):
    data = proposed(tmp_path)
    confirm(data[0], data[1], data[-1]['threadId'])
    return data


def test_replay_scopes_private_events_before_decoding_other_learners(tmp_path):
    store, tutor, student, peer, other, *_ = opened(tmp_path)
    with store.transaction() as connection:
        store._event(connection, peer, 'error.proposed.v1', None,
            {'diaryVersion': 1, 'threadId': 'unrelated-damaged-projection', 'studentId': peer.id, 'thread': None})
    view = diary().get_diary(store, student)
    assert len(view['threads']) == 1
    assert view['threads'][0]['studentId'] == student.id


def test_ai_proposal_is_not_confirmed_debt_and_replays_after_restart(tmp_path):
    store, tutor, student, peer, other, receipt, anchor, result = proposed(tmp_path, 'ai')
    assert result['status'] == 'CANDIDATE'
    assert result['verification'] == 'PROPOSED_AI'
    reopened = StudyStore(store.path)
    view = diary().get_diary(reopened, student)
    assert view['candidateCount'] == 1 and view['confirmedOpenCount'] == 0
    assert view['threads'][0]['source']['quote'] == 'Q cresce come r²'
    assert reopened.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='error.observed'").fetchone()[0] == 0


def test_confirm_is_tutor_only_source_bound_and_idempotent(tmp_path):
    store, tutor, student, peer, other, receipt, anchor, result = proposed(tmp_path)
    thread_id = result['threadId']
    for actor in (student, peer, other, Principal('fake-model', 'provider')):
        with pytest.raises(StudyError):
            confirm(store, actor, thread_id)
    first = confirm(store, tutor, thread_id)
    assert first['status'] == 'OPEN' and first['feedback']['verification'] == 'REVIEWED_BY_TUTOR'
    assert confirm(store, tutor, thread_id) == first
    assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='error.observed'").fetchone()[0] == 1
    with pytest.raises(StudyError, match='idempotency_conflict'):
        diary().confirm_error(store, tutor, thread_id, {'criterion': 'different', 'procedureRequired': True}, 'different', 'retry', 'confirm')
    assert diary().get_diary(store, student)['confirmedOpenCount'] == 1


def test_source_anchor_must_belong_to_submitted_revision(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    receipt, anchor = attempt(store, student)
    private = store.create_resource(student, 'fluidi', 'notes', 'not submitted')
    for invalid in ({**anchor, 'quote': 'invented'}, {**anchor, 'end': 500}, {**anchor, 'resourceId': private['id'], 'revisionId': private['revisionId']}):
        with pytest.raises(StudyError):
            diary().propose_error(store, tutor, receipt['submissionId'], 'radius', 'algebra', invalid, 'invalid')
    with pytest.raises(StudyError, match='forbidden'):
        diary().propose_error(store, peer, receipt['submissionId'], 'radius', 'algebra', anchor, 'peer')
    assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='error.proposed.v1'").fetchone()[0] == 0


def test_contest_and_dismiss_preserve_reason_and_exclude_false_positive(tmp_path):
    store, tutor, student, peer, other, receipt, anchor, result = proposed(tmp_path, category='reading_or_transcription')
    thread_id = result['threadId']
    contested = diary().contest_error(store, student, thread_id, 'Il due era una quarta potenza scritta male.', 'contest')
    assert contested['contested'] is True and contested['status'] == 'CANDIDATE'
    with pytest.raises(StudyError, match='forbidden'):
        diary().dismiss_error(store, student, thread_id, 'self-dismiss', 'dismiss-self')
    dismissed = diary().dismiss_error(store, tutor, thread_id, 'Fonte controllata: errore di trascrizione.', 'dismiss')
    assert dismissed['status'] == 'DISMISSED'
    assert dismissed['dismissalReason'] == 'Fonte controllata: errore di trascrizione.'
    assert diary().get_diary(store, student)['confirmedOpenCount'] == 0
    assert len(dismissed['history']) == 3


def test_ambiguous_question_requires_source_check_before_confirming(tmp_path):
    store, tutor, student, peer, other, receipt, anchor, result = proposed(tmp_path, category='ambiguous_question')
    with pytest.raises(StudyError, match='source_check_required'):
        confirm(store, tutor, result['threadId'])
    assert confirm(store, tutor, result['threadId'], source_checked=True)['status'] == 'OPEN'


def test_source_revision_change_stales_feedback_and_revocation_hides_original(tmp_path):
    store, tutor, student, peer, other, receipt, anchor, result = opened(tmp_path)
    resource_id = anchor['resourceId']
    revised = revise_resource(store, student, resource_id, anchor['revisionId'], 'Correzione privata r^4')
    stale = diary().get_thread(store, student, result['threadId'])
    assert stale['sourceState'] == 'STALE' and stale['feedback']['state'] == 'STALE'
    with pytest.raises(StudyError, match='stale_source'):
        diary().record_practice(store, student, result['threadId'], receipt['submissionId'], 'poiseuille-transfer-v1', {'radiusRatio': 2, 'boundary': 'pressure'}, 'stale')
    delete_resource(store, student, resource_id)
    revoked = diary().get_thread(store, student, result['threadId'])
    assert revoked['status'] == 'OPEN' and revoked['sourceState'] == 'UNAVAILABLE'
    assert revoked['source'] is None and revoked['feedback'] is None
    assert 'Q cresce come' not in json.dumps(revoked)
    assert 'Correzione privata' not in json.dumps(diary().get_diary(store, tutor, 'fluidi'))


def test_student_diary_persists_between_courses_without_granting_new_tutor_history(tmp_path):
    store, tutor, student, peer, other, receipt, anchor, result = opened(tmp_path)
    store.create_edition(other, 'analisi')
    store.add_test_member(other, 'analisi', student.id)
    assert diary().get_diary(store, student, 'analisi')['threads'][0]['threadId'] == result['threadId']
    assert diary().get_diary(store, other, 'analisi')['threads'] == []
    for actor in (peer, other):
        with pytest.raises(StudyError, match='not_found'):
            diary().get_thread(store, actor, result['threadId'])
    with pytest.raises(StudyError):
        diary().get_diary(store, tutor)


def test_diary_receipt_and_event_roll_back_together(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    receipt, anchor = attempt(store, student)
    store.connection.execute("CREATE TRIGGER reject_diary_receipt BEFORE INSERT ON study_receipts WHEN NEW.operation='diary.propose.v1' BEGIN SELECT RAISE(ABORT,'synthetic storage full'); END")
    store.connection.commit()
    with pytest.raises(sqlite3.IntegrityError):
        diary().propose_error(store, tutor, receipt['submissionId'], 'radius', 'algebra', anchor, 'fail')
    assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='error.proposed.v1'").fetchone()[0] == 0


def practice(store, student, thread_id, text='Il rapporto è 2^4 = 16 perché la portata dipende dalla quarta potenza.', key='transfer'):
    receipt, anchor = attempt(store, student, text, key, activity_id='poiseuille-transfer-v1')
    return diary().record_practice(store, student, thread_id, receipt['submissionId'], 'poiseuille-transfer-v1', {'radiusRatio': 2, 'boundary': 'pressure'}, 'practice-'+key), receipt, anchor


def verification(store, tutor, thread_id, attempt_id, key='verify', **updates):
    evidence = {'criterion': 'Usa la quarta potenza a pressione fissata', 'procedureQuote': '2^4 = 16 perché la portata dipende dalla quarta potenza', 'reasoning': 'La relazione e il vincolo sono espliciti nel nuovo procedimento.', 'variationReason': 'Il raggio raddoppia, rispetto al rapporto 1.5 del primo esercizio.'}
    evidence.update(updates)
    return diary().verify_transfer(store, tutor, thread_id, attempt_id, evidence, key)


def test_repeating_original_or_forging_plan_does_not_count_as_transfer(tmp_path):
    store, tutor, student, peer, other, original, anchor, result = opened(tmp_path)
    thread_id = result['threadId']
    with pytest.raises(StudyError, match='distinct_attempt_required'):
        diary().record_practice(store, student, thread_id, original['submissionId'], 'poiseuille-transfer-v1', {'radiusRatio': 2, 'boundary': 'pressure'}, 'same')
    new, _ = attempt(store, student, '16', 'numeric', activity_id='poiseuille-transfer-v1')
    for exercise, params in [('poiseuille-v1', {'radiusRatio': 2, 'boundary': 'pressure'}), ('poiseuille-transfer-v1', {'radiusRatio': 1.5, 'boundary': 'pressure'})]:
        with pytest.raises(StudyError, match='transfer_plan_mismatch'):
            diary().record_practice(store, student, thread_id, new['submissionId'], exercise, params, 'forged')
    lucky = diary().record_practice(store, student, thread_id, new['submissionId'], 'poiseuille-transfer-v1', {'radiusRatio': 2, 'boundary': 'pressure'}, 'numeric')
    assert lucky['status'] == 'PRACTISING'
    assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='exercise.completed'").fetchone()[0] == 0
    with pytest.raises(StudyError, match='procedure_evidence_required'):
        verification(store, tutor, thread_id, lucky['attempts'][-1]['attemptId'], procedureQuote='16')


def test_transfer_needs_distinct_submission_exact_reasoning_and_human_review(tmp_path):
    store, tutor, student, peer, other, original, anchor, result = opened(tmp_path)
    current, receipt, _ = practice(store, student, result['threadId'])
    attempt_id = current['attempts'][-1]['attemptId']
    for actor in (student, peer, other, Principal('model', 'provider')):
        with pytest.raises(StudyError):
            verification(store, actor, result['threadId'], attempt_id)
    with pytest.raises(StudyError, match='procedure_evidence_required'):
        verification(store, tutor, result['threadId'], attempt_id, procedureQuote='Invented procedure')
    with pytest.raises(StudyError, match='rubric_mismatch'):
        verification(store, tutor, result['threadId'], attempt_id, criterion='unrelated')
    resolved = verification(store, tutor, result['threadId'], attempt_id)
    assert resolved['status'] == 'VERIFIED_RESOLVED'
    assert resolved['latestVerification']['reviewerId'] == tutor.id
    assert resolved['latestVerification']['submissionId'] == receipt['submissionId']
    assert resolved['latestVerification']['verification'] == 'REVIEWED_BY_TUTOR'
    assert verification(store, tutor, result['threadId'], attempt_id) == resolved
    row = store.connection.execute("SELECT payload FROM study_events WHERE kind='exercise.completed'").fetchone()
    payload = json.loads(row[0])
    assert payload['correctsErrorId'] == result['threadId'] and payload['studentId'] == student.id
    assert diary().get_diary(store, student)['confirmedOpenCount'] == 0
    assert diary().get_thread(StudyStore(store.path), student, result['threadId'])['status'] == 'VERIFIED_RESOLVED'


def test_recurrence_requires_new_evidence_after_verification_and_preserves_history(tmp_path):
    store, tutor, student, peer, other, original, anchor, result = opened(tmp_path)
    thread_id = result['threadId']
    current, transfer, transfer_anchor = practice(store, student, thread_id)
    verification(store, tutor, thread_id, current['attempts'][-1]['attemptId'])
    with pytest.raises(StudyError, match='distinct_attempt_required'):
        diary().record_recurrence(store, tutor, thread_id, original['submissionId'], anchor, 'same original', 'old')
    new, new_anchor = attempt(store, student, 'Q dipende dal quadrato anche qui.', 'recurrence')
    recurred = diary().record_recurrence(store, tutor, thread_id, new['submissionId'], new_anchor, 'Ricompare la seconda potenza.', 'recurrence')
    assert recurred['status'] == 'RECURRED' and recurred['observedCount'] == 2
    assert len(recurred['observations']) == 2 and len(recurred['attempts']) == 1
    assert recurred['latestVerification']['submissionId'] == transfer['submissionId']
    assert diary().get_diary(store, student)['confirmedOpenCount'] == 1
    assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='error.observed'").fetchone()[0] == 2


def test_parameter_change_is_required_even_when_tutor_uses_new_exercise_label(tmp_path):
    store, tutor, student, peer, other, original, anchor, result = proposed(tmp_path)
    with pytest.raises(StudyError, match='distinct_exercise_required'):
        diary().confirm_error(store, tutor, result['threadId'], {'criterion': 'potenza', 'procedureRequired': True}, 'Spiegazione', 'Riprova', 'bad-plan', transfer_exercise={'exerciseId': 'another-label', 'originalParameters': {'radiusRatio': 2}, 'parameters': {'radiusRatio': 2}, 'prompt': 'same question'})
    assert diary().get_thread(store, student, result['threadId'])['status'] == 'CANDIDATE'


def test_old_verified_transfer_cannot_close_a_later_recurrence(tmp_path):
    store, tutor, student, peer, other, original, anchor, result = opened(tmp_path)
    thread_id = result['threadId']
    first, _, _ = practice(store, student, thread_id)
    old_attempt = first['attempts'][-1]['attemptId']
    verification(store, tutor, thread_id, old_attempt)
    recurred, recurred_anchor = attempt(store, student, 'Ancora r²', 'recur')
    diary().record_recurrence(store, tutor, thread_id, recurred['submissionId'], recurred_anchor, 'Nuova seconda potenza.', 'recur')
    practice(store, student, thread_id, key='transfer-after-recurrence')
    with pytest.raises(StudyError, match='new_evidence_required'):
        verification(store, tutor, thread_id, old_attempt, key='verify-old-again')
    assert diary().get_thread(store, student, thread_id)['status'] == 'PRACTISING'


def test_revoked_transfer_source_hides_procedure_and_verification_even_on_retry(tmp_path):
    store, tutor, student, peer, other, original, anchor, result = opened(tmp_path)
    thread_id = result['threadId']
    current, receipt, transfer_anchor = practice(store, student, thread_id)
    attempt_id = current['attempts'][-1]['attemptId']
    verification(store, tutor, thread_id, attempt_id)
    delete_resource(store, student, transfer_anchor['resourceId'])
    view = diary().get_thread(store, student, thread_id)
    assert view['attempts'][0]['procedure'] is None
    assert view['latestVerification'] is None
    assert view['verificationState'] == 'UNAVAILABLE'
    assert 'perché la portata' not in json.dumps(view)
    retried = verification(store, tutor, thread_id, attempt_id)
    assert retried['latestVerification'] is None


def test_identical_source_observation_with_new_key_reuses_one_thread(tmp_path):
    store, tutor, student, peer, other, original, anchor, result = proposed(tmp_path)
    duplicate = diary().propose_error(store, tutor, original['submissionId'], 'radius-power', 'model_selection', anchor, 'new-request-key')
    assert duplicate['threadId'] == result['threadId']
    assert len(diary().get_diary(store, student)['threads']) == 1
    assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='error.proposed.v1'").fetchone()[0] == 1


def test_practice_cannot_relabel_a_submission_from_original_activity(tmp_path):
    store, tutor, student, peer, other, original, anchor, result = opened(tmp_path)
    another_original, _ = attempt(store, student, 'Altra risposta al vecchio esercizio', 'another-original')
    with pytest.raises(StudyError, match='activity_mismatch'):
        diary().record_practice(store, student, result['threadId'], another_original['submissionId'], 'poiseuille-transfer-v1', {'radiusRatio': 2, 'boundary': 'pressure'}, 'relabel')


def test_transfer_submission_cannot_reuse_the_error_source(tmp_path):
    store, tutor, student, peer, other, original, anchor, result = opened(tmp_path)
    reused = submit(store, student, 'fluidi', 'poiseuille-transfer-v1', [], 'Risposta distinta ma fonte del vecchio errore', 'reuse-source', source_refs=[{'resourceId': anchor['resourceId'], 'revisionId': anchor['revisionId']}])
    with pytest.raises(StudyError, match='distinct_source_required'):
        diary().record_practice(store, student, result['threadId'], reused['submissionId'], 'poiseuille-transfer-v1', {'radiusRatio': 2, 'boundary': 'pressure'}, 'reuse-source')


def test_malformed_error_category_is_validation_error_without_writing(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    receipt, anchor = attempt(store, student)
    with pytest.raises(StudyError, match='invalid_error_observation'):
        diary().propose_error(store, tutor, receipt['submissionId'], 'radius', ['unhashable'], anchor, 'invalid-category')
    assert diary().get_diary(store, student)['threads'] == []


def test_transfer_receipt_for_another_thread_cannot_be_relabelled(tmp_path):
    store, tutor, student, peer, other, original, anchor, first = opened(tmp_path)
    second_original, second_anchor = attempt(store, student, 'Altro errore sulle unità.', 'second-original')
    second = diary().propose_error(store, tutor, second_original['submissionId'], 'units-square', 'units', second_anchor, 'second-proposal')
    confirm(store, tutor, second['threadId'], key='confirm-second')
    receipt = submit(store, student, 'fluidi', 'poiseuille-transfer-v1', [], 'Una prova vera ma per un altro nucleo.', 'other-thread-proof', diary_thread_id=second['threadId'])
    with pytest.raises(StudyError, match='transfer_receipt_mismatch'):
        diary().record_practice(store, student, first['threadId'], receipt['submissionId'], 'poiseuille-transfer-v1', {'radiusRatio': 2, 'boundary': 'pressure'}, 'relabel-other-thread')


def test_new_receipt_cannot_recycle_an_earlier_transfer_source(tmp_path):
    store, tutor, student, peer, other, original, anchor, result = opened(tmp_path)
    thread_id = result['threadId']
    current, _, transfer_anchor = practice(store, student, thread_id)
    verification(store, tutor, thread_id, current['attempts'][-1]['attemptId'])
    recurred, recurred_anchor = attempt(store, student, 'Di nuovo la seconda potenza.', 'repeat-error')
    diary().record_recurrence(store, tutor, thread_id, recurred['submissionId'], recurred_anchor, 'Errore distinto successivo.', 'repeat-error')
    reused = submit(store, student, 'fluidi', 'poiseuille-transfer-v1', [], 'Nuovo testo con la vecchia prova collegata.', 'recycle-transfer', source_refs=[{'resourceId': transfer_anchor['resourceId'], 'revisionId': transfer_anchor['revisionId']}], diary_thread_id=thread_id)
    with pytest.raises(StudyError, match='distinct_source_required'):
        diary().record_practice(store, student, thread_id, reused['submissionId'], 'poiseuille-transfer-v1', {'radiusRatio': 2, 'boundary': 'pressure'}, 'recycle-transfer')


@pytest.mark.parametrize('overrides', [
    {'category': {}}, {'category': []}, {'concept_id': {}}, {'concept_id': []},
    {'anchor': []}, {'anchor': 'not-an-anchor'},
])
def test_json_input_boundaries_raise_validation_errors(tmp_path, overrides):
    store, tutor, student, peer, other = setup_store(tmp_path)
    receipt, anchor = attempt(store, student)
    values = {'concept_id': 'radius', 'category': 'algebra', 'anchor': anchor, **overrides}
    with pytest.raises(StudyError) as caught:
        diary().propose_error(store, tutor, receipt['submissionId'], **values, key='invalid-boundary')
    assert caught.value.status == 422
    assert diary().get_diary(store, student)['threads'] == []


def test_source_checked_accepts_only_a_boolean(tmp_path):
    store, tutor, student, peer, other, original, anchor, result = proposed(tmp_path)
    with pytest.raises(StudyError, match='invalid_source_check'):
        confirm(store, tutor, result['threadId'], source_checked='yes')
    assert diary().get_thread(store, student, result['threadId'])['status'] == 'CANDIDATE'
