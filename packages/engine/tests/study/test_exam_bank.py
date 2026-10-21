"""Bank-backed exam integration: approved snapshot, CAS autosave and validity."""
import hashlib
import json
from pathlib import Path

import pytest

from lessonos.study import exam, question_bank
from lessonos.study.exam_bank import _question
from lessonos.study.exam import (
    DURATION_SECONDS,
    get_attempt,
    list_attempts,
    save_answers,
    start_attempt,
    submit_attempt,
)
from lessonos.study.models import StudyError
from lessonos.study.question_bank import BANK_ID, BANK_PATHS, QuestionBank, clear_bank_cache
from lessonos.study.question_bank_approvals import ApprovalGate
from lessonos.study.store import StudyStore
from legacy_exam_fixture import insert_historical_attempt


def synthetic_bank(path, *, count=31, mcq_count=21, law_family=None):
    path.mkdir(parents=True)
    (path / 'questions').mkdir()
    questions = []
    for index in range(count):
        kind = 'multiple_choice' if index < mcq_count else 'completion'
        value = index + 1
        question = {
            'id': f'synth-{index:03}',
            'version': 1,
            'bankId': BANK_ID,
            'activityId': 'physics-question-bank-v1',
            'title': f'Quesito sintetico {index}',
            'prompt': f'Quanto vale {value} nella unità dichiarata?',
            'format': kind,
            'options': ([{'id': letter, 'text': f'Opzione {letter} ({value})'}
                         for letter in 'ABCDE'] if kind == 'multiple_choice' else []),
            'answer': {
                'kind': 'rational', 'exact': str(value), 'unit': '1',
                'text': str(value), 'accepted': [str(value)],
                **({'correctOptionId': 'B'} if kind == 'multiple_choice' else {}),
            },
            'solution': f'Spiegazione sintetica per il quesito {index}.',
            'solutionSteps': [
                {'title': 'Passo uno', 'explanation': 'Leggi i dati.'},
                {'title': 'Passo due', 'explanation': f'Il valore è {value}.'},
            ],
            'taxonomy': {
                'unitId': f'U{index % 7 + 1}', 'macroarea': 'Fisica',
                'microarea': 'Misure', 'topic': 'Misure sintetiche',
            },
            'difficulty': {'level': 'base', 'rank': 1, 'reason': 'Sintetico'},
            'descriptors': {'calculatorAllowed': False, 'scope': 'syllabus_core'},
            'familyId': f'family-{index:03}',
            'lawFamily': law_family or f'law-{index:03}',
            'status': 'DRAFT',
            'reviewer': None,
        }
        questions.append(question)
    payload = json.dumps(questions, ensure_ascii=False).encode()
    (path / 'questions' / 'U1.json').write_bytes(payload)
    manifest = {
        'id': BANK_ID, 'version': 1, 'schemaVersion': '1.0.0',
        'title': 'Banca sintetica per esame', 'questionCount': len(questions),
        'status': 'DRAFT',
        'shards': [{'path': 'questions/U1.json', 'count': len(questions),
                    'sha256': hashlib.sha256(payload).hexdigest()}],
        'examProfiles': [{
            'id': 'semestre-2026', 'questionCount': 31, 'multipleChoice': 21,
            'completion': 10, 'durationSeconds': DURATION_SECONDS,
            'scoring': {'correct': 1, 'incorrect': -0.1, 'omitted': 0},
            'includedScopes': ['syllabus_core'],
        }],
        'taxonomy': [], 'quality': {'scientificApproval': 'NOT_RUN'}, 'sources': [],
    }
    (path / 'manifest.json').write_text(json.dumps(manifest))
    return questions


@pytest.fixture
def bank_world(tmp_path, monkeypatch):
    path = tmp_path / 'bank'
    questions = synthetic_bank(path)
    monkeypatch.setitem(BANK_PATHS, BANK_ID, path)
    clear_bank_cache()
    store = StudyStore(tmp_path / 'study.sqlite')
    owner = store.create_principal('bank-owner', 'teacher')
    student = store.create_principal('bank-student', 'student')
    peer = store.create_principal('bank-peer', 'student')
    store.create_edition(owner, 'fluidi')
    store.add_test_member(owner, 'fluidi', student.id)
    store.add_test_member(owner, 'fluidi', peer.id)
    bank = QuestionBank(path)
    gate = ApprovalGate(store, bank, 'fluidi')
    approvals = []
    for question in questions:
        approvals.append(gate.approve(
            owner, question_id=question['id'], question_version=question['version'],
            content_sha256=bank.approval_content_sha256(question['id']),
            decision='APPROVED', motivation='revisione sintetica'))
    yield {'store': store, 'owner': owner, 'student': student, 'peer': peer,
           'bank': bank, 'gate': gate, 'approvals': approvals, 'questions': questions,
           'path': path}
    store.close()
    clear_bank_cache()


def test_start_uses_only_approved_bank_and_never_leaks_solutions(bank_world):
    attempt = start_attempt(bank_world['store'], bank_world['student'], 'fluidi')
    assert attempt['status'] == 'in_progress'
    assert attempt['durationSeconds'] == DURATION_SECONDS
    assert len(attempt['questions']) == 31
    assert sum(question['type'] == 'mcq' for question in attempt['questions']) == 21
    assert sum(question['type'] == 'completion' for question in attempt['questions']) == 10
    assert all(len(question['options']) == 5 for question in attempt['questions'] if question['type'] == 'mcq')
    assert all(question.get('answerType') == 'option_id' for question in attempt['questions'] if question['type'] == 'mcq')
    assert all('explanation' not in question and 'answer' not in question
               for question in attempt['questions'])
    assert attempt['answerRevision'] == 0


def test_question_revision_above_one_is_unsupported_not_silently_served(bank_world):
    full = bank_world['bank'].review_record('synth-000')
    full['version'] = 2
    approval = {'approvalId': 'synthetic', 'questionVersion': 2,
                'contentSha256': 'a' * 64}
    with pytest.raises(StudyError, match='exam_question_version_unsupported'):
        _question(full, approval)


def test_cas_rejects_stale_writes_and_accepts_monotonic_revision(bank_world):
    store = bank_world['store']
    student = bank_world['student']
    attempt = start_attempt(store, student, 'fluidi')
    first_id = attempt['questions'][0]['id']
    second_id = attempt['questions'][1]['id']
    saved = save_answers(store, student, attempt['id'], {first_id: 'A'}, expected_revision=0)
    assert saved['answerRevision'] == 1 and saved['answers'][first_id] == 'A'
    with pytest.raises(StudyError, match='exam_revision_conflict'):
        save_answers(store, student, attempt['id'], {second_id: 'B'}, expected_revision=0)
    latest = save_answers(store, student, attempt['id'], {first_id: 'C'}, expected_revision=1)
    assert latest['answerRevision'] == 2 and latest['answers'][first_id] == 'C'
    with pytest.raises(StudyError, match='exam_revision_required'):
        save_answers(store, student, attempt['id'], {first_id: 'D'})


def test_submit_is_atomic_and_marks_revoked_snapshot_invalid(bank_world):
    store = bank_world['store']
    student = bank_world['student']
    attempt = start_attempt(store, student, 'fluidi')
    first = attempt['questions'][0]['id']
    save_answers(store, student, attempt['id'], {first: 'B'}, expected_revision=0)
    with pytest.raises(StudyError, match='exam_revision_conflict'):
        submit_attempt(store, student, attempt['id'], {first: 'A'}, expected_revision=0)
    result = submit_attempt(store, student, attempt['id'], {first: 'A'}, expected_revision=1)
    assert result['status'] == 'submitted'
    assert result['result']['scoreTenths'] == -1
    assert result['result']['validity']['valid'] is True
    assert result['result']['questions'][0]['solutionSteps'][0]['title'] == 'Passo uno'

    approval = next(approval for approval, question in
                    zip(bank_world['approvals'], bank_world['questions'])
                    if question['id'] == first)
    bank_world['gate'].revoke(bank_world['owner'], approval['approvalId'],
                              reason='revoca sintetica')
    invalid = get_attempt(store, student, attempt['id'])
    assert invalid['result']['validity']['valid'] is False
    assert first in invalid['result']['validity']['invalidQuestionIds']
    with pytest.raises(StudyError, match='exam_not_ready'):
        start_attempt(store, bank_world['peer'], 'fluidi')


def test_reapproval_cannot_resurrect_a_revoked_snapshot(bank_world):
    store = bank_world['store']
    student = bank_world['student']
    attempt = start_attempt(store, student, 'fluidi')
    target_id = attempt['questions'][0]['id']
    approvals = {question['id']: approval for approval, question in
                 zip(bank_world['approvals'], bank_world['questions'])}
    old_approval = approvals[target_id]
    submitted = submit_attempt(store, student, attempt['id'], expected_revision=0)
    assert submitted['result']['validity']['valid'] is True

    bank_world['gate'].revoke(bank_world['owner'], old_approval['approvalId'],
                              reason='revoca prima della riapprovazione')
    invalid = get_attempt(store, student, attempt['id'])
    assert invalid['result']['validity']['valid'] is False
    assert target_id in invalid['result']['validity']['invalidQuestionIds']

    replacement = bank_world['gate'].approve(
        bank_world['owner'], question_id=target_id,
        question_version=old_approval['questionVersion'],
        content_sha256=old_approval['contentSha256'],
        decision='APPROVED', motivation='riapprovazione dello stesso contenuto')
    assert replacement['approvalId'] != old_approval['approvalId']

    still_invalid = get_attempt(store, student, attempt['id'])
    assert still_invalid['result']['validity']['valid'] is False
    assert target_id in still_invalid['result']['validity']['invalidQuestionIds']

    fresh = start_attempt(store, student, 'fluidi')
    assert fresh['id'] != attempt['id']
    assert any(question['id'] == target_id for question in fresh['questions'])
    fresh_result = submit_attempt(store, student, fresh['id'], expected_revision=0)
    assert fresh_result['result']['validity']['valid'] is True


def test_synthetic_31_question_flow_saves_reopens_and_grades(bank_world):
    store = bank_world['store']
    student = bank_world['student']
    attempt = start_attempt(store, student, 'fluidi')
    assert len(attempt['questions']) == 31
    first = next(question for question in attempt['questions'] if question['type'] == 'mcq')
    second = next(question for question in attempt['questions']
                   if question['type'] == 'mcq' and question['id'] != first['id'])
    saved = save_answers(store, student, attempt['id'], {first['id']: 'B'}, expected_revision=0)
    assert saved['answerRevision'] == 1
    reopened = get_attempt(store, student, attempt['id'])
    assert reopened['answerRevision'] == 1
    assert reopened['answers'] == {first['id']: 'B'}
    assert len(reopened['questions']) == 31
    result = submit_attempt(store, student, attempt['id'],
                            {first['id']: 'B', second['id']: 'A'}, expected_revision=1)
    assert result['status'] == 'submitted'
    assert result['result']['correct'] == 1
    assert result['result']['wrong'] == 1
    assert result['result']['omitted'] == 29
    assert result['result']['scoreTenths'] == 9
    assert result['result']['validity']['valid'] is True
    assert len(result['result']['questions']) == 31
    graded = {question['questionId']: question for question in result['result']['questions']}
    assert graded[first['id']]['solutionSteps'][0]['title'] == 'Passo uno'
    assert graded[second['id']]['status'] == 'wrong'
    reviewed = get_attempt(store, student, attempt['id'])
    assert {question['questionId']: question for question in reviewed['result']['questions']}[second['id']]['status'] == 'wrong'


def _unready_bank_world(tmp_path, monkeypatch, *, approved=0, rejected=0, revoke=False,
                        mcq_count=21, law_family=None):
    path = tmp_path / 'bank'
    questions = synthetic_bank(path, mcq_count=mcq_count, law_family=law_family)
    monkeypatch.setitem(BANK_PATHS, BANK_ID, path)
    clear_bank_cache()
    store = StudyStore(tmp_path / 'study.sqlite')
    owner = store.create_principal('gate-owner', 'teacher')
    student = store.create_principal('gate-student', 'student')
    store.create_edition(owner, 'fluidi')
    store.add_test_member(owner, 'fluidi', student.id)
    bank = QuestionBank(path)
    gate = ApprovalGate(store, bank, 'fluidi')
    approvals = {}
    for index, question in enumerate(questions):
        if index < approved:
            decision = 'APPROVED'
        elif index < approved + rejected:
            decision = 'REJECTED'
        else:
            continue
        approvals[question['id']] = gate.approve(
            owner, question_id=question['id'], question_version=question['version'],
            content_sha256=bank.approval_content_sha256(question['id']),
            decision=decision, motivation='verifica sintetica del gate')
    if revoke:
        gate.revoke(owner, approvals[questions[0]['id']]['approvalId'],
                    reason='revoca sintetica del gate')
    return {'store': store, 'owner': owner, 'student': student, 'gate': gate,
            'questions': questions, 'approvals': approvals}


@pytest.mark.parametrize('approved,rejected,allowed', [
    (0, 0, False),
    (1, 0, False),
    (30, 0, False),
    (30, 1, False),
    (31, 0, True),
])
def test_bank_exam_requires_all_31_servable_approvals(tmp_path, monkeypatch,
                                                       approved, rejected, allowed):
    world = _unready_bank_world(tmp_path, monkeypatch, approved=approved,
                                rejected=rejected)
    try:
        if allowed:
            listed = list_attempts(world['store'], world['student'], 'fluidi')
            assert listed['pack']['ready'] is True
            assert listed['pack']['approvedCount'] == 31
            attempt = start_attempt(world['store'], world['student'], 'fluidi')
            assert len(attempt['questions']) == 31
            assert all(len(question['options']) == 5 for question in attempt['questions']
                       if question['type'] == 'mcq')
        else:
            with pytest.raises(StudyError, match='exam_not_ready'):
                start_attempt(world['store'], world['student'], 'fluidi')
            listed = list_attempts(world['store'], world['student'], 'fluidi')
            assert listed['pack']['id'] != exam.LEGACY_PACK_ID
            assert listed['pack']['id'].startswith(BANK_ID)
            assert listed['pack']['ready'] is False
            assert listed['pack']['approvedCount'] == approved
    finally:
        world['store'].close()
        clear_bank_cache()


def test_revoked_approval_does_not_count_towards_the_31(tmp_path, monkeypatch):
    world = _unready_bank_world(tmp_path, monkeypatch, approved=31, revoke=True)
    try:
        assert len(world['gate'].servable_approvals()) == 30
        listed = list_attempts(world['store'], world['student'], 'fluidi')
        assert listed['pack']['ready'] is False
        assert listed['pack']['approvedCount'] == 30
        with pytest.raises(StudyError, match='exam_not_ready'):
            start_attempt(world['store'], world['student'], 'fluidi')
    finally:
        world['store'].close()
        clear_bank_cache()


@pytest.mark.parametrize('mcq_count,law_family', [
    (31, None),
    (21, 'law-shared'),
])
def test_pack_summary_rejects_a_31_question_paper_that_cannot_be_composed(
        tmp_path, monkeypatch, mcq_count, law_family):
    world = _unready_bank_world(tmp_path, monkeypatch, approved=31,
                                mcq_count=mcq_count, law_family=law_family)
    try:
        listed = list_attempts(world['store'], world['student'], 'fluidi')
        assert listed['pack']['ready'] is False
        assert listed['pack']['approvedCount'] == 31
        assert 'composizione non disponibile' in listed['pack']['subtitle']
        with pytest.raises(StudyError, match='exam_not_ready'):
            start_attempt(world['store'], world['student'], 'fluidi')
    finally:
        world['store'].close()
        clear_bank_cache()


def test_unbound_edition_has_no_new_physics_exam_and_no_legacy_fallback(tmp_path, monkeypatch):
    """Analisi is only a negative control here: it must not open a Physics legacy exam."""
    world = _unready_bank_world(tmp_path, monkeypatch, approved=0)
    try:
        store = world['store']
        owner = world['owner']
        student = world['student']
        store.create_edition(owner, 'analisi-no-exam', course_id='analisi-1',
                             pack_id='taylor-exp-v1')
        store.add_test_member(owner, 'analisi-no-exam', student.id)
        with pytest.raises(StudyError, match='exam_unavailable'):
            start_attempt(store, student, 'analisi-no-exam')
        listed = list_attempts(store, student, 'analisi-no-exam')
        assert listed['pack'] is None
    finally:
        world['store'].close()
        clear_bank_cache()


def test_historical_legacy_attempt_can_finish_but_cannot_be_restarted(tmp_path, monkeypatch):
    world = _unready_bank_world(tmp_path, monkeypatch, approved=0)
    try:
        store = world['store']
        student = world['student']
        historical = insert_historical_attempt(store, student)
        resumed = start_attempt(store, student, 'fluidi')
        assert resumed['id'] == historical['id']
        assert resumed['packId'] == exam.LEGACY_PACK_ID
        listed_while_open = list_attempts(store, student, 'fluidi')
        assert listed_while_open['pack']['id'] == exam.LEGACY_PACK_ID
        submitted = submit_attempt(store, student, historical['id'])
        assert submitted['status'] == 'submitted'
        listed_after = list_attempts(store, student, 'fluidi')
        assert listed_after['pack']['id'] != exam.LEGACY_PACK_ID
        assert listed_after['pack']['ready'] is False
        with pytest.raises(StudyError, match='exam_not_ready'):
            start_attempt(store, student, 'fluidi')
    finally:
        world['store'].close()
        clear_bank_cache()
