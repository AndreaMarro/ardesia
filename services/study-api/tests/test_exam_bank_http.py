"""HTTP contract for a bank-backed exam with CAS autosave."""
import hashlib
import json

from fastapi.testclient import TestClient

from lessonos.study.question_bank import BANK_ID, BANK_PATHS, QuestionBank, clear_bank_cache
from lessonos.study.question_bank_approvals import ApprovalGate
from lessonos.study.store import StudyStore
from study_api.app import create_app


def synthetic_bank(path):
    path.mkdir(parents=True)
    (path / 'questions').mkdir()
    questions = []
    for index in range(31):
        kind = 'multiple_choice' if index < 21 else 'completion'
        value = index + 1
        questions.append({
            'id': f'http-synth-{index:03}', 'version': 1, 'bankId': BANK_ID,
            'activityId': 'physics-question-bank-v1', 'title': f'Quesito {index}',
            'prompt': f'Quanto vale {value}?', 'format': kind,
            'options': ([{'id': letter, 'text': f'Opzione {letter}'} for letter in 'ABCDE']
                        if kind == 'multiple_choice' else []),
            'answer': {'kind': 'rational', 'exact': str(value), 'unit': '1',
                       'text': str(value), 'accepted': [str(value)],
                       **({'correctOptionId': 'B'} if kind == 'multiple_choice' else {})},
            'solution': f'Spiegazione {index}.',
            'solutionSteps': [{'title': 'Passo', 'explanation': 'Sintetico.'}],
            'taxonomy': {'unitId': f'U{index % 7 + 1}', 'macroarea': 'Fisica',
                         'microarea': 'Misure', 'topic': 'Misure'},
            'difficulty': {'level': 'base', 'rank': 1, 'reason': 'Sintetico'},
            'descriptors': {'calculatorAllowed': False, 'scope': 'syllabus_core'},
            'familyId': f'family-{index:03}', 'lawFamily': f'law-{index:03}',
            'status': 'DRAFT', 'reviewer': None,
        })
    payload = json.dumps(questions, ensure_ascii=False).encode()
    (path / 'questions' / 'U1.json').write_bytes(payload)
    manifest = {
        'id': BANK_ID, 'version': 1, 'schemaVersion': '1.0.0',
        'questionCount': 31, 'status': 'DRAFT',
        'shards': [{'path': 'questions/U1.json', 'count': 31,
                    'sha256': hashlib.sha256(payload).hexdigest()}],
        'examProfiles': [{'id': 'semestre-2026', 'questionCount': 31,
                          'multipleChoice': 21, 'completion': 10,
                          'durationSeconds': 3000,
                          'scoring': {'correct': 1, 'incorrect': -0.1, 'omitted': 0},
                          'includedScopes': ['syllabus_core']}],
        'taxonomy': [], 'quality': {'scientificApproval': 'NOT_RUN'}, 'sources': [],
    }
    (path / 'manifest.json').write_text(json.dumps(manifest))
    return questions


def test_bank_exam_http_cas_and_approved_snapshot(tmp_path, monkeypatch):
    path = tmp_path / 'bank'
    questions = synthetic_bank(path)
    monkeypatch.setitem(BANK_PATHS, BANK_ID, path)
    clear_bank_cache()
    store = StudyStore(tmp_path / 'db.sqlite')
    tutor = store.create_principal('tutor', 'teacher')
    student = store.create_principal('student', 'student')
    store.create_edition(tutor, 'fluidi')
    store.add_test_member(tutor, 'fluidi', student.id)
    bank = QuestionBank(path)
    gate = ApprovalGate(store, bank, 'fluidi')
    for question in questions:
        gate.approve(tutor, question_id=question['id'], question_version=1,
                     content_sha256=bank.approval_content_sha256(question['id']),
                     decision='APPROVED', motivation='revisione sintetica')
    client = TestClient(create_app(store.path, demo=True))
    assert client.post('/study/session', json={'token': store.issue_session(student)}).status_code == 200
    with client:
        listing = client.get('/study/exams?editionId=fluidi')
        assert listing.status_code == 200
        assert listing.json()['pack']['questionCount'] == 31
        assert listing.json()['pack']['ready'] is True
        assert listing.json()['pack']['approvedCount'] == 31
        attempt = client.post('/study/exams', json={'editionId': 'fluidi'}).json()
        assert attempt['packId'].startswith(BANK_ID)
        assert attempt['answerRevision'] == 0
        assert all('answer' not in question and 'explanation' not in question
                   for question in attempt['questions'])
        assert all(len(question['options']) == 5 for question in attempt['questions']
                   if question['type'] == 'mcq')
        first = attempt['questions'][0]['id']
        missing = client.put(f"/study/exams/{attempt['id']}/answers",
                             json={'answers': {first: 'A'}})
        assert missing.status_code == 409
        assert missing.json()['error'] == 'exam_revision_required'
        saved = client.put(f"/study/exams/{attempt['id']}/answers",
                           json={'answers': {first: 'A'}, 'expectedRevision': 0})
        assert saved.status_code == 200
        assert saved.json()['answerRevision'] == 1
        stale = client.put(f"/study/exams/{attempt['id']}/answers",
                           json={'answers': {first: 'B'}, 'expectedRevision': 0})
        assert stale.status_code == 409
        assert stale.json()['error'] == 'exam_revision_conflict'
        submitted = client.post(f"/study/exams/{attempt['id']}/submit",
                                json={'answers': {first: 'B'}, 'expectedRevision': 1})
        assert submitted.status_code == 200
        result = submitted.json()
        assert result['status'] == 'submitted'
        assert result['result']['validity']['valid'] is True
        assert result['result']['questions'][0]['solutionSteps']
        closed = client.put(f"/study/exams/{attempt['id']}/answers",
                            json={'answers': {first: 'A'}, 'expectedRevision': 2})
        assert closed.status_code == 409
        assert closed.json()['error'] == 'exam_closed'
    store.close()
    clear_bank_cache()


def test_http_partial_review_fails_closed_without_legacy_fallback(tmp_path, monkeypatch):
    path = tmp_path / 'bank'
    questions = synthetic_bank(path)
    monkeypatch.setitem(BANK_PATHS, BANK_ID, path)
    clear_bank_cache()
    store = StudyStore(tmp_path / 'partial.sqlite')
    tutor = store.create_principal('partial-tutor', 'teacher')
    student = store.create_principal('partial-student', 'student')
    store.create_edition(tutor, 'fluidi')
    store.add_test_member(tutor, 'fluidi', student.id)
    bank = QuestionBank(path)
    gate = ApprovalGate(store, bank, 'fluidi')
    question = questions[0]
    gate.approve(tutor, question_id=question['id'], question_version=1,
                 content_sha256=bank.approval_content_sha256(question['id']),
                 decision='APPROVED', motivation='revisione parziale')
    client = TestClient(create_app(store.path, demo=True))
    assert client.post('/study/session', json={'token': store.issue_session(student)}).status_code == 200
    with client:
        listing = client.get('/study/exams?editionId=fluidi')
        assert listing.status_code == 200
        assert listing.json()['pack']['id'].startswith(BANK_ID)
        assert listing.json()['pack']['ready'] is False
        assert listing.json()['pack']['approvedCount'] == 1
        started = client.post('/study/exams', json={'editionId': 'fluidi'})
        assert started.status_code == 409
        assert started.json()['error'] == 'exam_not_ready'
    store.close()
    clear_bank_cache()
