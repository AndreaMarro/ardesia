"""Transfer answers are bound to a tutor-assigned exercise at receipt time."""
import json
import pytest
from lessonos.study.models import StudyError
from lessonos.study.submissions import submit
from test_error_diary import opened


def test_transfer_receipt_freezes_the_assigned_problem_and_parameters(tmp_path):
    store, tutor, student, peer, other, original, anchor, thread = opened(tmp_path)
    receipt = submit(store, student, 'fluidi', 'poiseuille-transfer-v1', [],
                     'A pressione fissata Q/Q0 = 2^4 = 16.', 'new-problem')
    context = receipt['activityContext']
    assert context['exerciseId'] == 'poiseuille-transfer-v1'
    assert context['threadId'] == thread['threadId']
    assert context['parameters'] == {'radiusRatio':2, 'boundary':'pressure'}
    assert 'raddoppia' in context['prompt']
    row = store.connection.execute('SELECT body FROM study_receipts WHERE id=?', (receipt['receiptId'],)).fetchone()
    assert json.loads(row[0])['activityContext'] == context
    assert submit(store, student, 'fluidi', 'poiseuille-transfer-v1', [],
                  'A pressione fissata Q/Q0 = 2^4 = 16.', 'new-problem') == receipt


def test_a_student_cannot_submit_someone_elses_transfer_or_an_unassigned_exercise(tmp_path):
    store, tutor, student, peer, other, *_ = opened(tmp_path)
    for actor, activity in ((peer, 'poiseuille-transfer-v1'), (student, 'invented-transfer')):
        with pytest.raises(StudyError, match='activity_not_assigned'):
            submit(store, actor, 'fluidi', activity, [], 'Answer', 'not-authorized')
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0] == 1


def test_transfer_assignment_cannot_cross_an_edition_boundary(tmp_path):
    store, tutor, student, *_ = opened(tmp_path)
    store.create_edition(tutor, 'analisi')
    store.add_test_member(tutor, 'analisi', student.id)
    with pytest.raises(StudyError, match='activity_not_assigned'):
        submit(store, student, 'analisi', 'poiseuille-transfer-v1', [], 'Answer', 'wrong-course')


def test_unregistered_submission_from_before_recurrence_is_not_new_evidence(tmp_path):
    from test_error_diary import diary, practice, attempt
    store, tutor, student, peer, other, original, anchor, thread = opened(tmp_path)
    thread_id = thread['threadId']
    old = submit(store, student, 'fluidi', 'poiseuille-transfer-v1', [],
                 'La portata segue la quarta potenza del raggio.', 'saved-for-later')
    current, transfer, _ = practice(store, student, thread_id)
    evidence = {'criterion': current['feedback']['rubric']['criterion'],
                'procedureQuote': current['attempts'][-1]['procedure'],
                'reasoning': 'La procedura esplicita la quarta potenza.',
                'variationReason': 'Il raggio è cambiato rispetto al problema iniziale.'}
    diary().verify_transfer(store, tutor, thread_id, current['attempts'][-1]['attemptId'], evidence, 'verify')
    recurred, recurred_anchor = attempt(store, student, 'Di nuovo r²', 'recur')
    diary().record_recurrence(store, tutor, thread_id, recurred['submissionId'], recurred_anchor, 'Ricompare la seconda potenza.', 'recur')
    with pytest.raises(StudyError, match='new_evidence_required'):
        diary().record_practice(store, student, thread_id, old['submissionId'],
            'poiseuille-transfer-v1', {'radiusRatio': 2, 'boundary': 'pressure'}, 'recycle-old')


@pytest.mark.parametrize('activity_id', ['poiseuille-v1', 'units-v1', 'hydrostatic-v1', 'buoyancy-v1'])
def test_every_base_activity_in_the_current_draft_pack_is_submittable(tmp_path, activity_id):
    from test_identity_store import setup_store
    store, tutor, student, peer, other = setup_store(tmp_path)
    receipt = submit(store, student, 'fluidi', activity_id, [],
                     'Procedura originale con modello e unità.', 'base-' + activity_id)
    assert receipt['activityId'] == activity_id
    assert receipt['studentId'] == student.id
    assert 'activityContext' not in receipt  # A regular exercise is not a diary transfer.
    assert store.connection.execute('SELECT activity_id FROM study_submissions').fetchone()[0] == activity_id
