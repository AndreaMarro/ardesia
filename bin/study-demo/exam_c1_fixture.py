"""Synthetic bank fixture for the C1 browser journey.

The fixture is written under the disposable demo data directory. It is not the
authored 4.000-question bank and never changes its editorial state.
"""
import hashlib
import json
from pathlib import Path

from lessonos.study.question_bank import BANK_ID, QuestionBank
from lessonos.study.question_bank_approvals import ApprovalGate
from lessonos.study.store import StudyStore
from seed import seed


def _bank_questions():
    questions = []
    for index in range(31):
        kind = 'multiple_choice' if index < 21 else 'completion'
        number = index + 1
        question = {
            'id': f'c1-synth-{index:03}',
            'version': 1,
            'bankId': BANK_ID,
            'activityId': 'physics-question-bank-v1',
            'title': f'Quesito sintetico C1 {number}',
            'prompt': f'Quesito sintetico C1 {number}: indica il valore {number}.',
            'format': kind,
            'options': ([{'id': letter, 'text': f'Opzione {letter} ({number + offset})'}
                         for offset, letter in enumerate('ABCDE')]
                        if kind == 'multiple_choice' else []),
            'answer': {
                'kind': 'rational', 'exact': str(number), 'unit': '1',
                'text': str(number), 'accepted': [str(number)],
                **({'correctOptionId': 'B'} if kind == 'multiple_choice' else {}),
            },
            'solution': (
                f'Spiegazione completa del quesito sintetico C1 {number}. '
                'Il valore richiesto è quello centrale della serie proposta. '
                'Questa frase è volutamente lunga per verificare che la revisione '
                'browser non tagli il testo dopo la consegna.'
            ),
            'solutionSteps': [
                {'title': 'Passo uno', 'explanation': f'Individua il valore {number}.'},
                {'title': 'Passo due', 'explanation': 'Confronta le alternative e concludi.'},
            ],
            'taxonomy': {
                'unitId': f'U{index % 7 + 1}', 'macroarea': 'Fisica',
                'microarea': 'Misure', 'topic': 'Misure sintetiche C1',
            },
            'difficulty': {'level': 'base', 'rank': 1, 'reason': 'Fixture sintetica C1'},
            'descriptors': {'calculatorAllowed': False, 'scope': 'syllabus_core'},
            'familyId': f'c1-family-{index:03}',
            'lawFamily': f'c1-law-{index:03}',
            'status': 'DRAFT',
            'reviewer': None,
        }
        questions.append(question)
    return questions


def write_bank(directory):
    directory = Path(directory)
    manifest = directory / 'manifest.json'
    if manifest.is_file():
        return directory
    (directory / 'questions').mkdir(parents=True, exist_ok=True)
    questions = _bank_questions()
    payload = json.dumps(questions, ensure_ascii=False).encode()
    (directory / 'questions' / 'U1.json').write_bytes(payload)
    document = {
        'id': BANK_ID,
        'version': 1,
        'schemaVersion': '1.0.0',
        'title': 'Banca sintetica C1 per collaudo browser',
        'questionCount': len(questions),
        'status': 'DRAFT',
        'shards': [{
            'path': 'questions/U1.json',
            'count': len(questions),
            'sha256': hashlib.sha256(payload).hexdigest(),
        }],
        'examProfiles': [{
            'id': 'semestre-2026',
            'questionCount': 31,
            'multipleChoice': 21,
            'completion': 10,
            'durationSeconds': 3000,
            'scoring': {'correct': 1, 'incorrect': -0.1, 'omitted': 0},
            'includedScopes': ['syllabus_core'],
        }],
        'taxonomy': [],
        'quality': {'scientificApproval': 'NOT_RUN'},
        'sources': [],
    }
    manifest.write_text(json.dumps(document, ensure_ascii=False, indent=2))
    return directory


def prepare(data_dir):
    data_dir = Path(data_dir)
    data_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    credentials = seed(data_dir)
    store = StudyStore(data_dir / 'study.sqlite')
    try:
        tutor = store.create_principal('tutor-synthetic', 'teacher')
        student = store.create_principal('student-01', 'student')
        if not store.connection.execute(
                'SELECT 1 FROM study_members WHERE edition_id=? AND student_id=?',
                ('fluidi', student.id)).fetchone():
            store.add_test_member(tutor, 'fluidi', student.id)
        bank_dir = write_bank(data_dir / 'synthetic-bank')
        bank = QuestionBank(bank_dir)
        gate = ApprovalGate(store, bank, 'fluidi')
        for question in bank._questions:
            gate.approve(
                tutor, question_id=question['id'], question_version=question['version'],
                content_sha256=bank.approval_content_sha256(question['id']),
                decision='APPROVED', motivation='fixture sintetica C1 per browser')
        if credentials.is_file():
            access = json.loads(credentials.read_text())
        else:
            access = {'synthetic': True, 'tokens': {}}
        tokens = access.setdefault('tokens', {})
        if student.id not in tokens:
            tokens[student.id] = store.issue_session(student, ttl=7 * 86400)
        if tutor.id not in tokens:
            tokens[tutor.id] = store.issue_session(tutor, ttl=7 * 86400)
        credentials.write_text(json.dumps(access, indent=2))
        credentials.chmod(0o600)
        actors = {
            'synthetic': True,
            'studentId': student.id,
            'tutorId': tutor.id,
            'studentToken': tokens[student.id],
            'tutorToken': tokens[tutor.id],
            'bankId': BANK_ID,
            'bankSha256': bank.sha256,
            'questions': [
                {
                    'id': question['id'], 'type': 'mcq' if question['format'] == 'multiple_choice'
                    else 'completion', 'answer': 'B' if question['format'] == 'multiple_choice'
                    else question['answer']['exact'],
                }
                for question in bank._questions
            ],
        }
        (data_dir / 'c1-actors.json').write_text(json.dumps(actors, indent=2))
        (data_dir / 'c1-actors.json').chmod(0o600)
        return data_dir
    finally:
        store.close()
