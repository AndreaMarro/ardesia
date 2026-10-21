"""P0 HTTP gate: no DRAFT to students, private teacher preview, exact revision."""
import hashlib
import json

import pytest
from fastapi.testclient import TestClient

from lessonos.study import question_bank
from lessonos.study.store import StudyStore
from study_api.app import create_app


def build_bank(directory):
    (directory / 'questions').mkdir(parents=True)
    questions = []
    for index, kind in enumerate(('multiple_choice', 'completion')):
        questions.append({
            'id': f'fixture-{index}', 'version': 1, 'bankId': question_bank.BANK_ID,
            'activityId': 'physics-question-bank-v1', 'title': f'Quesito sintetico {index}',
            'prompt': 'Metà di tre, in m.', 'format': kind,
            'options': [{'id': letter, 'text': value} for letter, value in
                        zip('ABCDE', ['1', '3/2', '2', '3', '6'])] if index == 0 else [],
            'answer': {'kind': 'rational', 'exact': '3/2', 'unit': 'm', 'text': '3/2 m',
                       'accepted': ['3/2'],
                       **({'correctOptionId': 'B'} if index == 0 else {})},
            'solution': 'Spiegazione riservata completa.',
            'solutionSteps': [{'title': 'Passo', 'explanation': 'Tre diviso due.'}],
            'taxonomy': {'unitId': 'U1', 'macroarea': 'Misure', 'microarea': 'Rapporti',
                         'topic': 'Divisione'},
            'difficulty': {'level': 'base', 'rank': 1, 'reason': 'Un passaggio'},
            'descriptors': {'calculatorAllowed': False}, 'familyId': f'family-{index}',
            'semanticSignature': f'hidden-{index}', 'status': 'DRAFT', 'reviewer': None,
            'verification': {'result': '3/2'},
        })
    payload = json.dumps(questions).encode()
    (directory / 'questions' / 'U1.json').write_bytes(payload)
    manifest = {'id': question_bank.BANK_ID, 'version': 1, 'schemaVersion': '1.0.0',
                'questionCount': 2,
                'shards': [{'path': 'questions/U1.json', 'count': 2,
                            'sha256': hashlib.sha256(payload).hexdigest()}],
                'examProfiles': [{'id': 'semestre-2026', 'questionCount': 2, 'multipleChoice': 1,
                                  'completion': 1, 'durationSeconds': 3000,
                                  'scoring': {'correct': 1, 'incorrect': -.1, 'omitted': 0}}]}
    (directory / 'manifest.json').write_text(json.dumps(manifest))
    return questions


@pytest.fixture
def world(tmp_path, monkeypatch):
    directory = tmp_path / 'bank'
    directory.mkdir()
    questions = build_bank(directory)
    monkeypatch.setitem(question_bank.BANK_PATHS, question_bank.BANK_ID, directory)
    question_bank.clear_bank_cache()
    store = StudyStore(tmp_path / 'study.sqlite')
    actors = {name: store.create_principal(name, role) for name, role in
              [('owner', 'teacher'), ('outsider', 'teacher'), ('member', 'student'),
               ('peer', 'student')]}
    store.create_edition(actors['owner'], 'fluidi')
    store.add_test_member(actors['owner'], 'fluidi', actors['member'].id)
    store.create_edition(actors['owner'], 'fluidi-b')
    store.add_test_member(actors['owner'], 'fluidi-b', actors['member'].id)
    tokens = {name: store.issue_session(actor) for name, actor in actors.items()}
    bank = question_bank.load_bank()
    app = create_app(store.path, demo=True)
    with TestClient(app) as client:
        yield {'store': store, 'tokens': tokens, 'client': client, 'bank': bank,
               'questions': questions, 'actors': actors}
    store.close()
    question_bank.clear_bank_cache()


def login(world, name):
    assert world['client'].post('/study/session', json={'token': world['tokens'][name]}).status_code == 200


def base(edition='fluidi'):
    return f'/study/editions/{edition}/question-banks/{question_bank.BANK_ID}'


def publish_fixture(world, question, *, decision='APPROVED', version=None, digest=None, edition='fluidi'):
    return world['client'].post(base(edition) + '/review/approvals', json={
        'questionId': question['id'],
        'questionVersion': question['version'] if version is None else version,
        'contentSha256': world['bank'].approval_content_sha256(question['id']) if digest is None else digest,
        'decision': decision,
        'motivation': 'revisione sintetica',
        'confirmPublication': True,  # This fixture deliberately exercises publication.
    })


def test_default_deny_blocks_list_detail_attempt_and_exam(world):
    login(world, 'member')
    listing = world['client'].get(base() + '/questions')
    assert listing.status_code == 200
    assert listing.json()['total'] == 0 and listing.json()['items'] == []
    assert world['client'].get(base() + '/questions/fixture-0').status_code == 404
    assert world['client'].post(base() + '/attempts', json={
        'questionId': 'fixture-0', 'response': 'B'}).status_code == 404
    exam = world['client'].post(base() + '/exams', json={'seed': 'fixed'})
    assert exam.status_code == 409 and exam.json()['error'] == 'insufficient_distinct_families'
    catalog = world['client'].get(base()).json()
    assert catalog['questionCount'] == 0 and catalog['publication']['publishedQuestionCount'] == 0
    assert catalog['publication']['defaultDeny'] is True
    assert catalog['countsByFormat'] == {}


def test_teacher_preview_is_private_and_withholds_solutions_from_the_list(world):
    login(world, 'member')
    assert world['client'].get(base() + '/review/questions').status_code == 403
    assert world['client'].get(base() + '/review/questions/fixture-0').status_code == 403
    world['client'].post('/study/session', json={'token': world['tokens']['outsider']})
    assert world['client'].get(base() + '/review/questions').status_code == 403
    assert publish_fixture(world, world['questions'][0]).status_code == 403
    login(world, 'owner')
    preview = world['client'].get(base() + '/review/questions')
    assert preview.status_code == 200
    payload = preview.json()
    assert payload['total'] == 2
    assert {item['servable'] for item in payload['items']} == {False}
    assert all(item['contentSha256'] and item['approval'] is None for item in payload['items'])
    serialized = json.dumps(payload)
    for secret in ('Spiegazione riservata', 'correctOptionId', '"answer"', 'hidden-'):
        assert secret not in serialized
    full = world['client'].get(base() + '/review/questions/fixture-0').json()
    assert full['question']['answer']['correctOptionId'] == 'B'
    assert full['question']['solution'] == 'Spiegazione riservata completa.'
    assert full['contentSha256'] == world['bank'].approval_content_sha256('fixture-0')
    assert full['state']['servable'] is False


def test_approved_fixture_on_the_exact_revision_is_served_end_to_end(world):
    login(world, 'owner')
    for question in world['questions']:
        response = publish_fixture(world, question)
        assert response.status_code == 200, response.text
        assert response.json()['scientificStatus'] == 'APPROVED'
        assert response.json()['editorialStatus'] == 'PUBLISHED'
    login(world, 'member')
    listing = world['client'].get(base() + '/questions').json()
    assert listing['total'] == 2
    assert {item['id'] for item in listing['items']} == {'fixture-0', 'fixture-1'}
    assert {item['status'] for item in listing['items']} == {'PUBLISHED'}
    assert 'solution' not in json.dumps(listing) and 'answer' not in json.dumps(listing)
    detail = world['client'].get(base() + '/questions/fixture-0')
    assert detail.status_code == 200 and 'solution' not in detail.text
    assert detail.json()['question']['status'] == 'PUBLISHED'
    exam = world['client'].post(base() + '/exams', json={'seed': 'fixed'})
    assert exam.status_code == 200, exam.text
    assert exam.json()['questions']
    assert all(item['status'] == 'PUBLISHED' for item in exam.json()['questions'])
    graded = world['client'].post(base() + '/attempts', json={
        'questionId': 'fixture-1', 'response': '6/4'})
    assert graded.status_code == 200 and graded.json()['outcome'] == 'correct'
    assert graded.json()['scientificApproval'] == 'APPROVED'
    assert graded.json()['editorialStatus'] == 'PUBLISHED'
    catalog = world['client'].get(base()).json()
    assert catalog['questionCount'] == 2 and catalog['publication']['status'] == 'PUBLISHED'
    world['client'].post('/study/session', json={'token': world['tokens']['owner']})
    assert world['client'].get(base() + '/review/questions').json()['total'] == 0
    every = world['client'].get(base() + '/review/questions?pending=false').json()
    assert every['total'] == 2
    assert all(item['servable'] and item['approval']['scientificStatus'] == 'APPROVED'
               for item in every['items'])


def test_stale_hash_or_revision_cannot_publish_anything(world):
    login(world, 'owner')
    question = world['questions'][0]
    stale = publish_fixture(world, question, digest='0' * 64)
    assert stale.status_code == 409 and stale.json()['error'] == 'question_revision_changed'
    old = publish_fixture(world, question, version=2)
    assert old.status_code == 409 and old.json()['error'] == 'question_revision_changed'
    unknown = world['client'].post(base() + '/review/approvals', json={
        'questionId': 'does-not-exist', 'questionVersion': 1,
        'contentSha256': '0' * 64, 'decision': 'APPROVED',
        'motivation': 'revisione sintetica', 'confirmPublication': True})
    assert unknown.status_code == 404
    assert world['client'].get(base() + '/review/questions').json()['items'][0]['approval'] is None
    login(world, 'member')
    assert world['client'].get(base() + '/questions').json()['total'] == 0


def test_revocation_withdraws_publication_and_keeps_the_audit_trail(world):
    login(world, 'owner')
    approval = publish_fixture(world, world['questions'][0]).json()
    login(world, 'member')
    assert world['client'].get(base() + '/questions').json()['total'] == 1
    login(world, 'owner')
    revoked = world['client'].post(
        base() + f"/review/approvals/{approval['approvalId']}/revoke",
        json={'reason': 'errore scientifico'})
    assert revoked.status_code == 200, revoked.text
    assert revoked.json()['editorialStatus'] == 'REVOKED'
    again = world['client'].post(
        base() + f"/review/approvals/{approval['approvalId']}/revoke",
        json={'reason': 'di nuovo'})
    assert again.status_code == 409
    trail = world['client'].get(
        base() + "/review/questions/fixture-0/history").json()
    assert len(trail['approvals']) == 1
    assert [event['event'] for event in trail['approvals'][0]['events']] == ['APPROVED', 'REVOKED']
    events = world['client'].get(
        base() + f"/review/approvals/{approval['approvalId']}/events").json()
    assert [event['event'] for event in events['events']] == ['APPROVED', 'REVOKED']
    login(world, 'member')
    assert world['client'].get(base() + '/questions').json()['total'] == 0
    assert world['client'].get(base() + '/questions/fixture-0').status_code == 404


def test_edition_isolation_and_partial_publication_counts(world):
    login(world, 'owner')
    assert publish_fixture(world, world['questions'][0], edition='fluidi-b').status_code == 200
    login(world, 'member')
    assert world['client'].get(base() + '/questions').json()['total'] == 0
    assert world['client'].get(base('fluidi-b') + '/questions').json()['total'] == 1
    catalog = world['client'].get(base('fluidi-b')).json()
    assert catalog['questionCount'] == 1
    assert sum(catalog['countsByFormat'].values()) == 1
    assert catalog['countsByFormat'] == {'multiple_choice': 1}
    assert world['client'].get(base('fluidi-b') + '/questions?after=fixture-0').status_code == 200
    assert world['client'].get(base('fluidi-b') + '/questions?limit=1').json()['nextCursor'] is None


def test_approval_body_is_strict_and_never_accepts_extra_authority(world):
    login(world, 'owner')
    question = world['questions'][0]
    body = {'questionId': question['id'], 'questionVersion': 1,
            'contentSha256': world['bank'].approval_content_sha256(question['id']),
            'decision': 'APPROVED', 'motivation': 'revisione sintetica'}
    for extra in ({'actorId': 'owner'}, {'scientificStatus': 'APPROVED'},
                  {'editionId': 'analisi'}, {'servable': True}):
        assert world['client'].post(base() + '/review/approvals',
                                    json=body | extra).status_code == 422
    assert world['client'].post(base() + '/review/approvals',
                                json=body | {'decision': 'PUBLISH'}).status_code == 422
    assert world['client'].post(
        base() + '/review/approvals/nope/revoke', json={'reason': 'x'}).status_code == 404
