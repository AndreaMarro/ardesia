"""Deterministic exam attempts: original questions, MUR scoring, immutable review."""
import json
import math
import random
import re
import unicodedata
from pathlib import Path

from .models import StudyError
from .store import canonical, digest, identifier

PACK_ID = 'fisica-semestre-filtro-v1'
PACK_VERSION = 1
DURATION_SECONDS = 50 * 60
MCQ_COUNT = 21
COMPLETION_COUNT = 10
TOTAL_QUESTIONS = 31
CORRECT_TENTHS = 10
WRONG_TENTHS = -1
OMITTED_TENTHS = 0
MAX_TENTHS = TOTAL_QUESTIONS * CORRECT_TENTHS
SUBMIT_GRACE_SECONDS = 10
MAX_ANSWER_LENGTH = 200
CONTENT = Path(__file__).with_name('content') / f'{PACK_ID}.json'


def _fail(code='invalid_exam_pack', status=503):
    raise StudyError(code, status)


def _text(value, *, limit=4000):
    return isinstance(value, str) and 0 < len(value.strip()) <= limit


def validate_exam_pack(pack):
    if not isinstance(pack, dict):
        _fail()
    if pack.get('id') != PACK_ID or pack.get('version') != PACK_VERSION:
        _fail('exam_pack_mismatch', 409)
    if not _text(pack.get('title'), limit=200) or not _text(pack.get('subtitle'), limit=200):
        _fail()
    if pack.get('durationSeconds') != DURATION_SECONDS:
        _fail('exam_duration_mismatch', 409)
    rules = pack.get('rules')
    if not isinstance(rules, dict) or rules.get('maxTenths') != MAX_TENTHS:
        _fail('exam_scoring_mismatch', 409)
    if rules.get('correctTenths') != CORRECT_TENTHS or rules.get('wrongTenths') != WRONG_TENTHS or rules.get('omittedTenths') != OMITTED_TENTHS:
        _fail('exam_scoring_mismatch', 409)
    questions = pack.get('questions')
    if not isinstance(questions, list) or len(questions) != TOTAL_QUESTIONS:
        _fail('exam_question_count_mismatch', 409)
    types = [question.get('type') if isinstance(question, dict) else None for question in questions]
    if types.count('mcq') != MCQ_COUNT or types.count('completion') != COMPLETION_COUNT:
        _fail('exam_question_count_mismatch', 409)
    seen = set()
    for question in questions:
        if not isinstance(question, dict):
            _fail()
        question_id = question.get('id')
        if not isinstance(question_id, str) or not 1 <= len(question_id) <= 128 or question_id in seen:
            _fail('exam_question_identity_invalid', 409)
        seen.add(question_id)
        if not _text(question.get('topic'), limit=120) or not _text(question.get('prompt'), limit=4000):
            _fail('exam_question_text_invalid', 409)
        if not _text(question.get('explanation'), limit=4000):
            _fail('exam_explanation_invalid', 409)
        if question['type'] == 'mcq':
            options = question.get('options')
            answer = question.get('answer')
            if (not isinstance(options, list) or len(options) != 4
                    or any(not _text(option, limit=500) for option in options)
                    or type(answer) is not int or not 0 <= answer < 4):
                _fail('exam_mcq_invalid', 409)
        elif question['type'] == 'completion':
            accepted = question.get('accepted')
            if (not isinstance(accepted, list) or not 1 <= len(accepted) <= 20
                    or any(not _text(item, limit=MAX_ANSWER_LENGTH) for item in accepted)):
                _fail('exam_completion_invalid', 409)
            numeric = question.get('numeric')
            if numeric is not None:
                if not isinstance(numeric, dict):
                    _fail('exam_completion_invalid', 409)
                value = numeric.get('value')
                tolerance = numeric.get('tolerance')
                units = numeric.get('units', [])
                if (type(value) not in (int, float) or not math.isfinite(value)
                        or type(tolerance) not in (int, float) or not math.isfinite(tolerance) or tolerance < 0
                        or not isinstance(units, list) or any(not isinstance(unit, str) for unit in units)):
                    _fail('exam_completion_invalid', 409)
        else:
            _fail('exam_question_type_invalid', 409)
    return pack


def load_exam_pack(pack_id=PACK_ID, version=PACK_VERSION):
    if pack_id != PACK_ID or version != PACK_VERSION:
        raise StudyError('exam_pack_not_found', 404)
    try:
        pack = json.loads(CONTENT.read_text())
    except (OSError, ValueError):
        _fail('exam_pack_unavailable')
    return validate_exam_pack(pack)


def pack_fingerprint(pack):
    return digest(canonical(pack))


def public_pack(pack):
    return {
        'id': pack['id'],
        'version': pack['version'],
        'title': pack['title'],
        'subtitle': pack['subtitle'],
        'durationSeconds': pack['durationSeconds'],
        'rules': pack['rules'],
        'provenance': pack['provenance'],
        'questionCount': len(pack['questions']),
        'questions': [public_question(question) for question in pack['questions']],
    }


def public_question(question):
    result = {
        'id': question['id'],
        'topic': question['topic'],
        'type': question['type'],
        'prompt': question['prompt'],
    }
    if question['type'] == 'mcq':
        result['options'] = list(question['options'])
    else:
        result['format'] = 'Testo o numero'
    return result


def _scientific(value):
    text = unicodedata.normalize('NFKC', value).strip().lower()
    text = text.replace(',', '.')
    text = re.sub(r'[×x·⋅]\s*10\s*\^?\s*([+-]?\d+)', r'e\1', text)
    return text


def normalize_answer(value):
    text = unicodedata.normalize('NFKC', value).strip().lower()
    text = re.sub(r'\s+', ' ', text)
    text = text.replace('’', "'")
    return text.rstrip(' .')


def _numeric_answer(value, numeric):
    text = _scientific(value)
    match = re.match(r'^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?', text)
    if match is None:
        return None
    number = float(match.group(0))
    remainder = re.sub(r'[\s·⋅^]', '', text[match.end():])
    units = [re.sub(r'[\s·⋅^]', '', unit.lower()) for unit in numeric.get('units', [])]
    if remainder and not any(remainder == unit or remainder.startswith(unit) for unit in units):
        return None
    tolerance = numeric.get('tolerance', 0)
    return math.isclose(number, numeric['value'], rel_tol=0, abs_tol=tolerance)


def _completion_matches(question, value):
    normalized = normalize_answer(value)
    if any(normalized == normalize_answer(accepted) for accepted in question['accepted']):
        return True
    numeric = question.get('numeric')
    return _numeric_answer(value, numeric) is True if numeric is not None else False


def _validate_answers(pack, answers):
    if not isinstance(answers, dict) or len(answers) > TOTAL_QUESTIONS:
        raise StudyError('invalid_exam_answers')
    by_id = {question['id']: question for question in pack['questions']}
    for question_id, value in answers.items():
        question = by_id.get(question_id)
        if question is None:
            raise StudyError('invalid_exam_answers')
        if value is None:
            continue
        if question['type'] == 'mcq':
            if type(value) is not int or not 0 <= value < len(question['options']):
                raise StudyError('invalid_exam_answers')
        elif not isinstance(value, str) or len(value) > MAX_ANSWER_LENGTH:
            raise StudyError('invalid_exam_answers')
    return dict(answers)


def _answer_status(question, value):
    if value is None or isinstance(value, str) and not value.strip():
        return 'omitted'
    if question['type'] == 'mcq':
        return 'correct' if value == question['answer'] else 'wrong'
    return 'correct' if _completion_matches(question, value) else 'wrong'


def grade_answers(pack, answers):
    answers = _validate_answers(pack, answers)
    details = []
    score = 0
    counts = {'correct': 0, 'wrong': 0, 'omitted': 0}
    for question in pack['questions']:
        value = answers.get(question['id'])
        status = _answer_status(question, value)
        points = CORRECT_TENTHS if status == 'correct' else WRONG_TENTHS if status == 'wrong' else OMITTED_TENTHS
        score += points
        counts[status] += 1
        if question['type'] == 'mcq':
            given_text = question['options'][value] if type(value) is int and 0 <= value < len(question['options']) else None
            expected_text = question['options'][question['answer']]
            expected = question['answer']
            accepted = None
        else:
            given_text = value if isinstance(value, str) and value.strip() else None
            expected_text = question['accepted'][0]
            expected = question['accepted'][0]
            accepted = list(question['accepted'])
        details.append({
            'questionId': question['id'],
            'topic': question['topic'],
            'type': question['type'],
            'prompt': question['prompt'],
            'options': list(question['options']) if question['type'] == 'mcq' else None,
            'given': value,
            'givenText': given_text,
            'expected': expected,
            'expectedText': expected_text,
            'accepted': accepted,
            'status': status,
            'pointsTenths': points,
            'explanation': question['explanation'],
        })
    return {
        'scoreTenths': score,
        'maxTenths': MAX_TENTHS,
        'score': score / 10,
        'correct': counts['correct'],
        'wrong': counts['wrong'],
        'omitted': counts['omitted'],
        'questions': details,
    }


def _pack_for_row(row):
    try:
        pack = validate_exam_pack(json.loads(row['pack_snapshot']))
    except (TypeError, ValueError, StudyError):
        raise StudyError('exam_pack_corrupt', 409) from None
    if pack_fingerprint(pack) != row['pack_sha256'] or pack['id'] != row['pack_id'] or pack['version'] != row['pack_version']:
        raise StudyError('exam_pack_corrupt', 409)
    return pack


def _row(store, attempt_id):
    return store.connection.execute('SELECT * FROM study_exam_attempts WHERE id=?', (attempt_id,)).fetchone()


def _owned(store, principal, attempt_id):
    store._principal(principal)
    row = _row(store, attempt_id)
    if row is None:
        raise StudyError('not_found', 404)
    if row['student_id'] != principal.id:
        raise StudyError('forbidden', 403)
    store._edition_access(principal, row['edition_id'])
    return row


def _view(row, pack, now):
    by_id = {question['id']: question for question in pack['questions']}
    questions = [public_question(by_id[question_id]) for question_id in json.loads(row['question_order'])]
    if row['status'] == 'in_progress':
        return {
            'id': row['id'],
            'editionId': row['edition_id'],
            'packId': row['pack_id'],
            'packVersion': row['pack_version'],
            'status': row['status'],
            'startedAt': row['started_at'],
            'deadlineAt': row['deadline_at'],
            'submittedAt': None,
            'remainingSeconds': max(0, int(math.ceil(row['deadline_at'] - now))),
            'answers': json.loads(row['answers']),
            'title': pack['title'],
            'subtitle': pack['subtitle'],
            'durationSeconds': pack['durationSeconds'],
            'rules': pack['rules'],
            'questions': questions,
            'result': None,
        }
    return {
        'id': row['id'],
        'editionId': row['edition_id'],
        'packId': row['pack_id'],
        'packVersion': row['pack_version'],
        'status': row['status'],
        'startedAt': row['started_at'],
        'deadlineAt': row['deadline_at'],
        'submittedAt': row['submitted_at'],
        'remainingSeconds': 0,
        'answers': json.loads(row['answers']),
        'title': pack['title'],
        'subtitle': pack['subtitle'],
        'durationSeconds': pack['durationSeconds'],
        'rules': pack['rules'],
        'questions': questions,
        'result': json.loads(row['result']),
    }


def _finalize(store, c, principal, row, answers, *, expired):
    pack = _pack_for_row(row)
    now = store.clock()
    result = grade_answers(pack, answers)
    status = 'expired' if expired else 'submitted'
    receipt_id = identifier()
    body = {'attemptId': row['id'], 'status': status, 'submittedAt': now, 'scoreTenths': result['scoreTenths'], 'receiptId': receipt_id}
    c.execute("UPDATE study_exam_attempts SET answers=?,status=?,submitted_at=?,score_tenths=?,result=?,receipt_id=? WHERE id=? AND status='in_progress'",
              (canonical(answers), status, now, result['scoreTenths'], canonical(result), receipt_id, row['id']))
    closed = _row(store, row['id'])
    if closed is None or closed['status'] != status:
        raise StudyError('exam_already_closed', 409)
    c.execute('INSERT INTO study_receipts VALUES(?,?,?,?,?,?)',
              (receipt_id, principal.id, 'exam.submitted', row['id'], digest(canonical({'attemptId': row['id']})), canonical(body)))
    store._event(c, principal, 'exam.submitted', None, {
        'attemptId': row['id'], 'editionId': row['edition_id'], 'status': status,
        'scoreTenths': result['scoreTenths'], 'receiptId': receipt_id,
    })
    return _row(store, row['id'])


def _edition_id(value):
    if not isinstance(value, str) or not 1 <= len(value) <= 128:
        raise StudyError('invalid_exam_edition')
    return value


def start_attempt(store, principal, edition_id, *, order=None):
    edition_id = _edition_id(edition_id)
    store._edition_access(principal, edition_id)
    if principal.role != 'student':
        raise StudyError('forbidden', 403)
    pack = load_exam_pack()
    with store.transaction() as c:
        active = c.execute("SELECT * FROM study_exam_attempts WHERE student_id=? AND edition_id=? AND status='in_progress'",
                           (principal.id, edition_id)).fetchone()
        if active is not None:
            row = active
        else:
            question_ids = [question['id'] for question in pack['questions']]
            if order is not None:
                if not isinstance(order, list) or sorted(order) != sorted(question_ids) or len(set(order)) != len(order):
                    raise StudyError('invalid_exam_order')
                question_ids = list(order)
            else:
                random.SystemRandom().shuffle(question_ids)
            attempt_id = identifier()
            now = store.clock()
            c.execute('INSERT INTO study_exam_attempts VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                      (attempt_id, edition_id, principal.id, pack['id'], pack['version'], pack_fingerprint(pack),
                       canonical(question_ids), '{}', 'in_progress', now, now + DURATION_SECONDS,
                       None, None, None, None, canonical(pack)))
            store._event(c, principal, 'exam.started', None, {
                'attemptId': attempt_id, 'editionId': edition_id, 'packId': pack['id'],
                'packVersion': pack['version'], 'questionCount': len(question_ids),
            })
            row = _row(store, attempt_id)
    return _view(row, _pack_for_row(row), store.clock())


def save_answers(store, principal, attempt_id, answers):
    row = _owned(store, principal, attempt_id)
    if row['status'] != 'in_progress':
        raise StudyError('exam_closed', 409)
    pack = _pack_for_row(row)
    answers = _validate_answers(pack, answers)
    now = store.clock()
    if now > row['deadline_at'] + SUBMIT_GRACE_SECONDS:
        with store.transaction() as c:
            store.lock_command(c, principal.id, 'exam.save', attempt_id)
            current = _row(store, attempt_id)
            if current['status'] == 'in_progress':
                current = _finalize(store, c, principal, current, json.loads(current['answers']), expired=True)
            row = current
        return _view(row, _pack_for_row(row), now)
    with store.transaction() as c:
        store.lock_command(c, principal.id, 'exam.save', attempt_id)
        current = _row(store, attempt_id)
        if current['status'] != 'in_progress':
            raise StudyError('exam_closed', 409)
        c.execute('UPDATE study_exam_attempts SET answers=? WHERE id=?', (canonical(answers), attempt_id))
        row = _row(store, attempt_id)
    return _view(row, pack, now)


def submit_attempt(store, principal, attempt_id, answers=None):
    row = _owned(store, principal, attempt_id)
    if row['status'] != 'in_progress':
        return _view(row, _pack_for_row(row), store.clock())
    pack = _pack_for_row(row)
    provided = _validate_answers(pack, answers) if answers is not None else None
    now = store.clock()
    with store.transaction() as c:
        store.lock_command(c, principal.id, 'exam.submit', attempt_id)
        current = _row(store, attempt_id)
        if current['status'] != 'in_progress':
            return _view(current, pack, now)
        stored = json.loads(current['answers'])
        if now > current['deadline_at'] + SUBMIT_GRACE_SECONDS:
            current = _finalize(store, c, principal, current, stored, expired=True)
        else:
            effective = provided if provided is not None else stored
            current = _finalize(store, c, principal, current, effective, expired=False)
        row = current
    return _view(row, pack, now)


def get_attempt(store, principal, attempt_id):
    row = _owned(store, principal, attempt_id)
    now = store.clock()
    if row['status'] == 'in_progress' and now > row['deadline_at'] + SUBMIT_GRACE_SECONDS:
        with store.transaction() as c:
            store.lock_command(c, principal.id, 'exam.close', attempt_id)
            current = _row(store, attempt_id)
            if current['status'] == 'in_progress':
                current = _finalize(store, c, principal, current, json.loads(current['answers']), expired=True)
            row = current
    return _view(row, _pack_for_row(row), now)


def _summary(row):
    result = json.loads(row['result']) if row['result'] else None
    return {
        'id': row['id'],
        'editionId': row['edition_id'],
        'status': row['status'],
        'startedAt': row['started_at'],
        'deadlineAt': row['deadline_at'],
        'submittedAt': row['submitted_at'],
        'scoreTenths': row['score_tenths'],
        'score': result['score'] if result else None,
        'maxTenths': MAX_TENTHS,
        'correct': result['correct'] if result else None,
        'wrong': result['wrong'] if result else None,
        'omitted': result['omitted'] if result else None,
    }


def list_attempts(store, principal, edition_id):
    edition_id = _edition_id(edition_id)
    store._edition_access(principal, edition_id)
    rows = store.connection.execute('SELECT * FROM study_exam_attempts WHERE student_id=? AND edition_id=? ORDER BY started_at DESC',
                                    (principal.id, edition_id)).fetchall()
    now = store.clock()
    stale = [row for row in rows if row['status'] == 'in_progress' and now > row['deadline_at'] + SUBMIT_GRACE_SECONDS]
    for row in stale:
        with store.transaction() as c:
            store.lock_command(c, principal.id, 'exam.close', row['id'])
            current = _row(store, row['id'])
            if current['status'] == 'in_progress':
                _finalize(store, c, principal, current, json.loads(current['answers']), expired=True)
    rows = store.connection.execute('SELECT * FROM study_exam_attempts WHERE student_id=? AND edition_id=? ORDER BY started_at DESC',
                                    (principal.id, edition_id)).fetchall()
    return {'attempts': [_summary(row) for row in rows], 'pack': public_pack(load_exam_pack())}
