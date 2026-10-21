"""Question practice reuses authenticated edition membership and pinned packs."""
import hashlib
import json

import pytest
from fastapi.testclient import TestClient

from lessonos.study import question_bank
from lessonos.study.catalog import LEGACY_PACK_SHA256
from lessonos.study.question_bank_approvals import ApprovalGate
from lessonos.study.store import StudyStore
from study_api.app import create_app


@pytest.fixture
def bank_app(tmp_path, monkeypatch):
    directory = tmp_path / 'bank'
    (directory / 'questions').mkdir(parents=True)
    questions = []
    for index, kind in enumerate(('multiple_choice', 'completion')):
        questions.append({
            'id': f'fixture-{index}', 'version': 1, 'bankId': question_bank.BANK_ID,
            'activityId': 'physics-question-bank-v1', 'prompt': 'Metà di tre, in m.', 'format': kind,
            'options': [{'id': letter, 'text': value} for letter, value in zip('ABCDE', ['1', '3/2', '2', '3', '6'])] if index == 0 else [],
            'answer': {'kind': 'rational', 'exact': '3/2', 'unit': 'm', 'text': '3/2 m', 'accepted': ['3/2'],
                       **({'correctOptionId': 'B'} if index == 0 else {})},
            'solution': 'Spiegazione riservata completa.', 'solutionSteps': [{'title': 'Passo', 'explanation': 'Tre diviso due.'}],
            'taxonomy': {'unitId': 'U1', 'macroarea': 'Misure', 'microarea': 'Rapporti', 'topic': 'Divisione'},
            'difficulty': {'level': 'base', 'rank': 1, 'reason': 'Un passaggio'},
            'descriptors': {'calculatorAllowed': False}, 'familyId': f'family-{index}',
            'semanticSignature': f'hidden-{index}', 'status': 'DRAFT', 'reviewer': None,
            'verification': {'result': '3/2'},
        })
    payload = json.dumps(questions).encode()
    (directory / 'questions' / 'U1.json').write_bytes(payload)
    manifest = {'id': question_bank.BANK_ID, 'version': 1, 'schemaVersion': '1.0.0', 'questionCount': 2,
                'shards': [{'path': 'questions/U1.json', 'count': 2, 'sha256': hashlib.sha256(payload).hexdigest()}],
                'examProfiles': [{'id': 'semestre-2026', 'questionCount': 2, 'multipleChoice': 1, 'completion': 1,
                                  'durationSeconds': 3000, 'scoring': {'correct': 1, 'incorrect': -.1, 'omitted': 0}}]}
    (directory / 'manifest.json').write_text(json.dumps(manifest))
    monkeypatch.setitem(question_bank.BANK_PATHS, question_bank.BANK_ID, directory)
    store = StudyStore(tmp_path / 'study.sqlite')
    actors = {name: store.create_principal(name, role) for name, role in
              [('owner', 'teacher'), ('outsider', 'teacher'), ('member', 'student'), ('nonmember', 'student')]}
    store.create_edition(actors['owner'], 'fluidi')
    store.add_test_member(actors['owner'], 'fluidi', actors['member'].id)
    store.create_edition(actors['owner'], 'analisi', course_id='analisi-1', pack_id='taylor-exp-v1')
    store.add_test_member(actors['owner'], 'analisi', actors['member'].id)
    # Publication is denied by default. These two synthetic records are the
    # explicitly approved fixture; nothing here touches the bundled 4.000.
    published = question_bank.load_bank()
    gate = ApprovalGate(store, published, 'fluidi')
    for item in questions:
        gate.approve(actors['owner'], question_id=item['id'], question_version=item['version'],
                     content_sha256=published.approval_content_sha256(item['id']),
                     decision='APPROVED', motivation='fixture sintetica revisionata')
    tokens = {name: store.issue_session(actor) for name, actor in actors.items()}
    app = create_app(store.path, demo=True)
    with TestClient(app) as client:
        yield store, tokens, client
    store.close()


BASE = '/study/editions/fluidi/question-banks/physics-semestre-2026'


def login(client, tokens, name):
    assert client.post('/study/session', json={'token': tokens[name]}).status_code == 200


def test_all_question_bank_routes_require_existing_membership(bank_app):
    store, tokens, client = bank_app
    get_paths = [BASE.rsplit('/', 1)[0], BASE, BASE + '/questions', BASE + '/questions/fixture-0']
    for path in get_paths:
        assert client.get(path).status_code == 401
    for path, body in [(BASE + '/exams', {'seed': 'a'}),
                       (BASE + '/attempts', {'questionId': 'fixture-1', 'response': '3/2'})]:
        assert client.post(path, json=body).status_code == 401
    for name in ('nonmember', 'outsider'):
        login(client, tokens, name)
        for path in get_paths:
            assert client.get(path).status_code == 403
        assert client.post(BASE + '/attempts', json={'questionId': 'fixture-1', 'response': '3/2'}).status_code == 403
    login(client, tokens, 'member')
    assert client.get(BASE.replace('/fluidi/', '/analisi/')).status_code == 404
    assert client.get('/study/editions/analisi/question-banks').json()['items'] == []
    assert client.get(BASE).status_code == 200
    store.revoke_session(client.cookies.get('study_session'))
    assert client.get(BASE + '/questions').status_code == 401


def test_practice_discloses_solution_only_in_feedback_and_keeps_pins(bank_app):
    store, tokens, client = bank_app
    before = store.get_edition('fluidi')
    assert before['packSha256'] == LEGACY_PACK_SHA256
    login(client, tokens, 'member')
    page = client.get(BASE + '/questions?limit=1')
    assert page.status_code == 200
    assert page.headers['cache-control'] == 'no-store'
    assert 'solution' not in page.text and 'answer' not in page.text and 'hidden-' not in page.text
    cursor = page.json()['nextCursor']
    second = client.get(BASE + '/questions', params={'after': cursor, 'limit': 1}).json()
    assert second['items'][0]['id'] != page.json()['items'][0]['id']
    exam = client.post(BASE + '/exams', json={'seed': 'fixed'}).json()
    assert len(exam['questions']) == 2 and 'solution' not in json.dumps(exam)
    result = client.post(BASE + '/attempts', json={'questionId': 'fixture-1', 'response': '6/4', 'bankSha256': page.json()['bankSha256']})
    assert result.status_code == 200 and result.json()['outcome'] == 'correct'
    assert result.json()['solution'] == 'Spiegazione riservata completa.'
    assert result.json()['scientificApproval'] == 'APPROVED' and result.json()['persisted'] is False
    assert store.get_edition('fluidi') == before
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0] == 0


def test_client_cannot_supply_authority_answer_key_or_large_work(bank_app):
    store, tokens, client = bank_app
    login(client, tokens, 'member')
    body = {'questionId': 'fixture-1', 'response': '3/2'}
    for extra in ({'actorId': 'owner'}, {'correct': True}, {'role': 'teacher'}, {'answer': '3/2'}):
        assert client.post(BASE + '/attempts', json=body | extra).status_code == 422
    assert client.post(BASE + '/attempts', json=body | {'response': 'x' * 129}).status_code == 422
    assert client.post(BASE + '/attempts', json=body | {'response': 1.5}).status_code == 422
    assert client.post(BASE + '/attempts', json=body | {'bankSha256': '0' * 64}).status_code == 409
    assert client.get(BASE + '/questions?limit=101').status_code == 422
    assert client.post(BASE + '/exams', json={'seed': 'a', 'count': 1000000}).status_code == 422
    assert client.post(BASE + '/attempts', json=body, headers={'Origin': 'https://untrusted.example'}).status_code == 403
