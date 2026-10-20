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
