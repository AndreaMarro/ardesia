"""Exam contract: original 31-item pack, MUR scoring, privacy and persistence."""
import json
from pathlib import Path

import pytest

from lessonos.study.exam import (
    DURATION_SECONDS,
    MAX_TENTHS,
    PACK_ID,
    get_attempt,
    grade_answers,
    list_attempts,
    load_exam_pack,
    pack_fingerprint,
    save_answers,
    start_attempt,
    submit_attempt,
)
from lessonos.study.models import StudyError
from lessonos.study.store import StudyStore
from legacy_exam_fixture import insert_historical_attempt


def setup_exam_store(tmp_path, now=None):
    clock = (lambda: now[0]) if now is not None else None
    store = StudyStore(tmp_path / 'study.sqlite', clock=clock) if clock else StudyStore(tmp_path / 'study.sqlite')
    tutor = store.create_principal('tutor-exam', 'teacher')
    student = store.create_principal('student-exam', 'student')
    peer = store.create_principal('student-peer', 'student')
    outsider = store.create_principal('student-outsider', 'student')
    store.create_edition(tutor, 'fluidi')
    store.add_test_member(tutor, 'fluidi', student.id)
    store.add_test_member(tutor, 'fluidi', peer.id)
    return store, tutor, student, peer, outsider


def perfect_answers(pack):
    return {question['id']: question['answer'] if question['type'] == 'mcq' else question['accepted'][0]
            for question in pack['questions']}


def wrong_answers(pack):
    return {question['id']: (question['answer'] + 1) % 4 if question['type'] == 'mcq' else 'risposta errata'
            for question in pack['questions']}


def detail(result, question_id):
    return next(item for item in result['questions'] if item['questionId'] == question_id)


def test_pack_is_original_complete_and_bound_to_mur_scoring():
    pack = load_exam_pack()
    assert pack['id'] == PACK_ID
    assert pack['durationSeconds'] == DURATION_SECONDS == 3000
    assert len(pack['questions']) == 31
    assert sum(question['type'] == 'mcq' for question in pack['questions']) == 21
    assert sum(question['type'] == 'completion' for question in pack['questions']) == 10
    assert len({question['id'] for question in pack['questions']}) == 31
    assert pack['rules']['maxTenths'] == MAX_TENTHS == 310
    assert pack_fingerprint(pack) == pack_fingerprint(load_exam_pack())
    assert all(question['explanation'].strip() for question in pack['questions'])
    assert all(0 <= question['answer'] < 4 for question in pack['questions'] if question['type'] == 'mcq')


def test_scoring_is_exactly_plus_one_minus_one_tenth_zero():
    pack = load_exam_pack()
    perfect = grade_answers(pack, perfect_answers(pack))
    assert (perfect['scoreTenths'], perfect['score'], perfect['correct'], perfect['wrong'], perfect['omitted']) == (310, 31.0, 31, 0, 0)
    wrong = grade_answers(pack, wrong_answers(pack))
    assert (wrong['scoreTenths'], wrong['score'], wrong['correct'], wrong['wrong'], wrong['omitted']) == (-31, -3.1, 0, 31, 0)
    mixed = perfect_answers(pack)
    mixed['fis-mecc-01'] = (pack['questions'][0]['answer'] + 1) % 4
    mixed['fis-mecc-02'] = None
    result = grade_answers(pack, mixed)
    assert (result['scoreTenths'], result['correct'], result['wrong'], result['omitted']) == (289, 29, 1, 1)


def test_completion_accepts_equivalent_notation_and_rejects_units_of_the_wrong_quantity():
    pack = load_exam_pack()
    assert detail(grade_answers(pack, {'fis-comp-22': '10'}), 'fis-comp-22')['status'] == 'correct'
    assert detail(grade_answers(pack, {'fis-comp-22': '10,0'}), 'fis-comp-22')['status'] == 'correct'
    assert detail(grade_answers(pack, {'fis-comp-22': '10 m/s'}), 'fis-comp-22')['status'] == 'correct'
    assert detail(grade_answers(pack, {'fis-comp-22': '10 s'}), 'fis-comp-22')['status'] == 'wrong'
    assert detail(grade_answers(pack, {'fis-comp-22': '9,8'}), 'fis-comp-22')['status'] == 'wrong'
    assert detail(grade_answers(pack, {'fis-comp-22': '   '}), 'fis-comp-22')['status'] == 'omitted'
    assert detail(grade_answers(pack, {'fis-comp-29': '2×10^4 Pa'}), 'fis-comp-29')['status'] == 'correct'
    assert detail(grade_answers(pack, {'fis-comp-29': '2 × 10^4 Pa'}), 'fis-comp-29')['status'] == 'correct'
    assert detail(grade_answers(pack, {'fis-comp-29': '20 kPa'}), 'fis-comp-29')['status'] == 'correct'
    assert detail(grade_answers(pack, {'fis-comp-29': '20.0 kPa'}), 'fis-comp-29')['status'] == 'correct'
    assert detail(grade_answers(pack, {'fis-comp-29': '20,0 kPa'}), 'fis-comp-29')['status'] == 'correct'
    assert detail(grade_answers(pack, {'fis-comp-29': '20000 kPa'}), 'fis-comp-29')['status'] == 'wrong'
    assert detail(grade_answers(pack, {'fis-comp-22': '10 m/s²'}), 'fis-comp-22')['status'] == 'wrong'
    assert detail(grade_answers(pack, {'fis-comp-22': '10 m/s banana'}), 'fis-comp-22')['status'] == 'wrong'
    assert detail(grade_answers(pack, {'fis-comp-24': '3000 kg/m³'}), 'fis-comp-24')['status'] == 'correct'
    assert detail(grade_answers(pack, {'fis-comp-24': '3 g/cm³'}), 'fis-comp-24')['status'] == 'correct'
    assert detail(grade_answers(pack, {'fis-comp-25': '4 dm³'}), 'fis-comp-25')['status'] == 'correct'
    assert detail(grade_answers(pack, {'fis-comp-26': '5000 mV'}), 'fis-comp-26')['status'] == 'correct'
    assert detail(grade_answers(pack, {'fis-comp-28': '1/8'}), 'fis-comp-28')['status'] == 'correct'
    assert detail(grade_answers(pack, {'fis-comp-28': '0,125'}), 'fis-comp-28')['status'] == 'correct'
    assert detail(grade_answers(pack, {'fis-comp-30': 'la stessa'}), 'fis-comp-30')['status'] == 'correct'
    with pytest.raises(StudyError, match='invalid_exam_answers'):
        grade_answers(pack, {'fis-mecc-01': 9})
    with pytest.raises(StudyError, match='invalid_exam_answers'):
        grade_answers(pack, {'fis-comp-22': 10})
    with pytest.raises(StudyError, match='invalid_exam_answers'):
        grade_answers(pack, {'unknown': 'x'})


def test_attempt_hides_answers_before_submission_and_survives_reopen(tmp_path):
    store, tutor, student, peer, outsider = setup_exam_store(tmp_path)
    attempt = insert_historical_attempt(store, student)
    assert attempt['status'] == 'in_progress'
    assert attempt['remainingSeconds'] == DURATION_SECONDS
    assert len(attempt['questions']) == 31
    assert all(set(question) == {'id', 'topic', 'type', 'prompt', 'options'} for question in attempt['questions'] if question['type'] == 'mcq')
    assert all(set(question) == {'id', 'topic', 'type', 'prompt', 'format'} for question in attempt['questions'] if question['type'] == 'completion')
    saved = save_answers(store, student, attempt['id'], {'fis-mecc-01': 0, 'fis-comp-22': '10'})
    assert saved['answers'] == {'fis-mecc-01': 0, 'fis-comp-22': '10'}
    reopened = StudyStore(store.path)
    persisted = get_attempt(reopened, student, attempt['id'])
    assert persisted['answers'] == {'fis-mecc-01': 0, 'fis-comp-22': '10'}
    assert persisted['result'] is None
    submitted = submit_attempt(reopened, student, attempt['id'], {'fis-mecc-01': 0})
    assert submitted['status'] == 'submitted'
    assert submitted['result']['scoreTenths'] == 10
    assert submitted['result']['correct'] == 1
    assert submitted['result']['omitted'] == 30
    assert submitted['result']['questions'][0]['explanation']
    assert submit_attempt(reopened, student, attempt['id'])['result']['scoreTenths'] == 10
    summary = list_attempts(reopened, student, 'fluidi')
    assert len(summary['attempts']) == 1 and summary['attempts'][0]['score'] == 1.0
    for actor in (peer, outsider, tutor):
        with pytest.raises(StudyError, match='forbidden'):
            get_attempt(reopened, actor, attempt['id'])
        with pytest.raises(StudyError, match='forbidden'):
            submit_attempt(reopened, actor, attempt['id'])


def test_deadline_grades_only_persisted_answers_and_marks_expired(tmp_path):
    now = [1000.0]
    store, tutor, student, *_ = setup_exam_store(tmp_path, now=now)
    attempt = insert_historical_attempt(store, student)
    assert attempt['deadlineAt'] == 1000 + DURATION_SECONDS
    save_answers(store, student, attempt['id'], {'fis-mecc-01': 0})
    now[0] = 1000 + DURATION_SECONDS + 11
    expired = submit_attempt(store, student, attempt['id'], {'fis-mecc-01': 1, 'fis-mecc-02': 1})
    assert expired['status'] == 'expired'
    assert expired['result']['scoreTenths'] == 10
    assert expired['result']['correct'] == 1
    assert expired['remainingSeconds'] == 0
    assert store.connection.execute("SELECT status FROM study_exam_attempts WHERE id=?", (attempt['id'],)).fetchone()[0] == 'expired'
    assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='exam.submitted'").fetchone()[0] == 1


def test_deadline_grace_still_accepts_the_final_client_submission(tmp_path):
    now = [2000.0]
    store, tutor, student, *_ = setup_exam_store(tmp_path, now=now)
    attempt = insert_historical_attempt(store, student)
    now[0] = 2000 + DURATION_SECONDS + 5
    submitted = submit_attempt(store, student, attempt['id'], {'fis-mecc-01': 0})
    assert submitted['status'] == 'submitted'
    assert submitted['result']['scoreTenths'] == 10


def test_one_open_attempt_per_student_and_edition_and_snapshot_tampering_fails_closed(tmp_path):
    store, tutor, student, *_ = setup_exam_store(tmp_path)
    first = insert_historical_attempt(store, student)
    second = start_attempt(store, student, 'fluidi')
    assert second['id'] == first['id']
    store.connection.execute("UPDATE study_exam_attempts SET pack_snapshot='{}' WHERE id=?", (first['id'],))
    store.connection.commit()
    with pytest.raises(StudyError, match='exam_pack_corrupt'):
        get_attempt(store, student, first['id'])
    with pytest.raises(StudyError, match='invalid_exam_edition'):
        start_attempt(store, student, None)
