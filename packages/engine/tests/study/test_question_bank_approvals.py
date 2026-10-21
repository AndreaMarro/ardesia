"""P0 publication gate: default deny, exact revision binding, durable audit."""
import hashlib
import json
import sqlite3
import threading
from copy import deepcopy

import pytest

from lessonos.study import operations
from lessonos.study.models import StudyError
from lessonos.study.question_bank import (QuestionBank, approval_content_sha256)
from lessonos.study.question_bank_approvals import ApprovalGate
from lessonos.study.schema_contract import CURRENT_SCHEMA
from lessonos.study.store import StudyStore


def write_bank(path, *, count=6):
    path.mkdir(parents=True, exist_ok=True)
    (path / 'questions').mkdir(exist_ok=True)
    questions = []
    for index in range(count):
        kind = 'multiple_choice' if index % 2 == 0 else 'completion'
        questions.append({
            'id': f'fixture-{index:03}', 'version': 1, 'bankId': 'physics-semestre-2026',
            'activityId': 'physics-question-bank-v1', 'title': f'Quesito {index}',
            'prompt': f'Quanto vale {index} più uno?', 'format': kind,
            'options': [{'id': letter, 'text': str(number)} for letter, number in
                        zip('ABCDE', [index, index + 1, index + 2, index + 3, index + 4])]
                       if kind == 'multiple_choice' else [],
            'answer': {'kind': 'rational', 'exact': str(index + 1), 'unit': '1',
                       'text': str(index + 1), 'accepted': [str(index + 1)],
                       **({'correctOptionId': 'B'} if kind == 'multiple_choice' else {})},
            'solution': f'Spiegazione riservata {index}.',
            'solutionSteps': [{'title': 'Passo', 'explanation': 'Somma.'}],
            'taxonomy': {'unitId': f'U{index % 7 + 1}', 'macroarea': 'Fisica',
                         'microarea': 'Misure', 'topic': 'Somma'},
            'difficulty': {'level': ('base', 'facile', 'medio', 'difficile')[index % 4],
                           'rank': index % 4 + 1, 'reason': 'Un passaggio'},
            'descriptors': {'calculatorAllowed': False},
            'familyId': f'family-{index:03}', 'lawFamily': f'law-{index:03}',
            'semanticSignature': f'secret-{index}', 'status': 'DRAFT', 'reviewer': None,
            'provenance': {'authoringTaskId': 'fixture'}, 'verification': {'exact': str(index + 1)},
        })
    payload = json.dumps(questions, ensure_ascii=False).encode()
    (path / 'questions' / 'U1.json').write_bytes(payload)
    manifest = {
        'id': 'physics-semestre-2026', 'version': 1, 'schemaVersion': '1.0.0',
        'questionCount': len(questions), 'status': 'DRAFT',
        'shards': [{'path': 'questions/U1.json', 'count': len(questions),
                    'sha256': hashlib.sha256(payload).hexdigest()}],
        'examProfiles': [{'id': 'semestre-2026', 'questionCount': 2, 'multipleChoice': 1,
                          'completion': 1, 'durationSeconds': 3000,
                          'scoring': {'correct': 1, 'incorrect': -0.1, 'omitted': 0}}],
        'taxonomy': [], 'quality': {'scientificApproval': 'NOT_RUN'}, 'sources': [],
    }
    (path / 'manifest.json').write_text(json.dumps(manifest))
    return questions, manifest


def rewrite_bank(path, questions, manifest):
    payload = json.dumps(questions, ensure_ascii=False).encode()
    (path / 'questions' / 'U1.json').write_bytes(payload)
    manifest['shards'][0]['sha256'] = hashlib.sha256(payload).hexdigest()
    (path / 'manifest.json').write_text(json.dumps(manifest))


@pytest.fixture
def world(tmp_path):
    questions, manifest = write_bank(tmp_path / 'bank')
    bank = QuestionBank(tmp_path / 'bank')
    store = StudyStore(tmp_path / 'store' / 'study.sqlite')
    owner = store.create_principal('owner-teacher', 'teacher')
    other = store.create_principal('other-teacher', 'teacher')
    student = store.create_principal('member-student', 'student')
    peer = store.create_principal('peer-student', 'student')
    store.create_edition(owner, 'fluidi')
    store.add_test_member(owner, 'fluidi', student.id)
    store.create_edition(owner, 'analisi', course_id='analisi-1', pack_id='taylor-exp-v1')
    store.add_test_member(owner, 'analisi', peer.id)
    gate = ApprovalGate(store, bank, 'fluidi')
    yield {'tmp': tmp_path, 'bank': bank, 'store': store, 'owner': owner, 'other': other,
           'student': student, 'peer': peer, 'gate': gate,
           'questions': questions, 'manifest': manifest}
    store.close()


def approve(gate, owner, bank, question, decision='APPROVED'):
    return gate.approve(owner, question_id=question['id'],
                        question_version=question['version'],
                        content_sha256=bank.approval_content_sha256(question['id']),
                        decision=decision, motivation='revisione sintetica')


def test_content_digest_ignores_only_editorial_projection(world):
    question = deepcopy(world['questions'][0])
    baseline = approval_content_sha256(question)
    question['status'] = 'PUBLISHED'
    question['reviewer'] = 'someone'
    assert approval_content_sha256(question) == baseline
    for field, value in (('prompt', 'Cambiata'), ('solution', 'Altra'),
                         ('version', 2), ('answer', {'kind': 'text', 'exact': 'x',
                                                      'unit': '', 'text': 'x', 'accepted': []})):
        changed = deepcopy(world['questions'][0])
        changed[field] = value
        assert approval_content_sha256(changed) != baseline


def test_default_deny_and_approval_bound_to_exact_revision(world):
    gate, owner, bank = world['gate'], world['owner'], world['bank']
    assert gate.servable_ids() == frozenset()
    question = world['questions'][0]
    record = approve(gate, owner, bank, question)
    assert gate.servable_ids() == frozenset({question['id']})
    assert record['scientificStatus'] == 'APPROVED'
    assert record['editorialStatus'] == 'PUBLISHED'
    # Same id, same version, different authored content: the old approval dies.
    changed = deepcopy(world['questions'])
    changed[0]['solution'] = 'Spiegazione modificata.'
    rewrite_bank(world['tmp'] / 'bank', changed, world['manifest'])
    updated = QuestionBank(world['tmp'] / 'bank')
    assert ApprovalGate(world['store'], updated, 'fluidi').servable_ids() == frozenset()
    # Restoring the text revives the digest, but the bank must be reloaded:
    # the persisted snapshot is immutable and never re-reads a moved file.
    changed[0]['solution'] = question['solution']
    rewrite_bank(world['tmp'] / 'bank', changed, world['manifest'])
    restored = QuestionBank(world['tmp'] / 'bank')
    assert ApprovalGate(world['store'], restored, 'fluidi').servable_ids() == frozenset({question['id']})


def test_content_change_denies_until_the_new_bytes_are_approved(world):
    gate, owner, question = world['gate'], world['owner'], world['questions'][0]
    original = question['solution']
    first = approve(gate, owner, world['bank'], question)
    changed = deepcopy(world['questions'])
    changed[0]['solution'] = 'Spiegazione riservata modificata.'
    rewrite_bank(world['tmp'] / 'bank', changed, world['manifest'])
    updated = QuestionBank(world['tmp'] / 'bank')
    second_gate = ApprovalGate(world['store'], updated, 'fluidi')
    assert second_gate.servable_ids() == frozenset()
    assert second_gate.review_state(question['id'])['servable'] is False
    second = approve(second_gate, owner, updated, changed[0])
    assert second['supersedesId'] == first['approvalId']
    assert second_gate.servable_ids() == frozenset({question['id']})
    changed[0]['solution'] = original
    rewrite_bank(world['tmp'] / 'bank', changed, world['manifest'])
    reverted = QuestionBank(world['tmp'] / 'bank')
    third_gate = ApprovalGate(world['store'], reverted, 'fluidi')
    assert third_gate.servable_ids() == frozenset({question['id']})
    state = third_gate.review_state(question['id'])
    assert state['servable'] is True and state['approval']['approvalId'] == first['approvalId']
    assert len(third_gate.history(owner, question['id'])['approvals']) == 2


def test_stale_hash_or_revision_is_rejected_before_any_row_is_written(world):
    gate, owner, store = world['gate'], world['owner'], world['store']
    question = world['questions'][0]
    with pytest.raises(StudyError, match='question_revision_changed'):
        gate.approve(owner, question_id=question['id'], question_version=1,
                     content_sha256='0' * 64, decision='APPROVED',
                     motivation='revisione sintetica')
    with pytest.raises(StudyError, match='question_revision_changed'):
        gate.approve(owner, question_id=question['id'], question_version=2,
                     content_sha256=world['bank'].approval_content_sha256(question['id']),
                     decision='APPROVED', motivation='revisione sintetica')
    assert store.connection.execute(
        'SELECT COUNT(*) FROM study_question_bank_approvals').fetchone()[0] == 0
    assert store.connection.execute(
        'SELECT COUNT(*) FROM study_question_bank_approval_events').fetchone()[0] == 0


def test_only_the_owning_teacher_decides_and_editions_are_isolated(world):
    gate, other, student = world['gate'], world['other'], world['student']
    question = world['questions'][0]
    with pytest.raises(StudyError, match='forbidden'):
        approve(gate, other, world['bank'], question)
    with pytest.raises(StudyError, match='forbidden'):
        approve(gate, student, world['bank'], question)
    approve(gate, world['owner'], world['bank'], question)
    assert ApprovalGate(world['store'], world['bank'], 'analisi').servable_ids() == frozenset()
    assert gate.servable_ids() == frozenset({question['id']})


def test_revocation_keeps_history_and_the_trail_is_append_only(world):
    gate, owner, store = world['gate'], world['owner'], world['store']
    question = world['questions'][0]
    record = approve(gate, owner, world['bank'], question)
    revoked = gate.revoke(owner, record['approvalId'], reason='errore scientifico')
    assert revoked['editorialStatus'] == 'REVOKED'
    assert revoked['revokedBy'] == owner.id and revoked['revocationReason'] == 'errore scientifico'
    assert gate.servable_ids() == frozenset()
    with pytest.raises(StudyError, match='approval_already_revoked'):
        gate.revoke(owner, record['approvalId'], reason='di nuovo')
    trail = gate.history(owner, question['id'])
    assert len(trail['approvals']) == 1
    assert [event['event'] for event in trail['approvals'][0]['events']] == ['APPROVED', 'REVOKED']
    connection = store.connection
    with pytest.raises(sqlite3.IntegrityError):
        connection.execute("UPDATE study_question_bank_approvals SET question_id='other' WHERE id=?",
                           (record['approvalId'],))
    with pytest.raises(sqlite3.IntegrityError):
        connection.execute("UPDATE study_question_bank_approvals SET editorial_status='PUBLISHED' WHERE id=?",
                           (record['approvalId'],))
    with pytest.raises(sqlite3.IntegrityError):
        connection.execute('DELETE FROM study_question_bank_approvals WHERE id=?', (record['approvalId'],))
    with pytest.raises(sqlite3.IntegrityError):
        connection.execute("UPDATE study_question_bank_approval_events SET event='APPROVED'")
    with pytest.raises(sqlite3.IntegrityError):
        connection.execute('DELETE FROM study_question_bank_approval_events')
    with pytest.raises(sqlite3.IntegrityError):
        connection.execute(
            'INSERT INTO study_question_bank_approval_events('
            'id,approval_id,edition_id,bank_id,question_id,question_version,content_sha256,'
            'event,actor_id,created_at,motivation,payload) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
            ('mismatch', record['approvalId'], record['editionId'], record['bankId'],
             'other-question', record['questionVersion'], record['contentSha256'],
             'APPROVED', record['actorId'], record['createdAt'], 'x', '{}'))
    connection.rollback()


def test_rejection_withholds_and_active_approval_needs_explicit_revocation(world):
    gate, owner = world['gate'], world['owner']
    question = world['questions'][0]
    rejected = approve(gate, owner, world['bank'], question, decision='REJECTED')
    assert rejected['scientificStatus'] == 'REJECTED'
    assert rejected['editorialStatus'] == 'WITHHELD'
    assert gate.servable_ids() == frozenset()
    approved = approve(gate, owner, world['bank'], question)
    with pytest.raises(StudyError, match='approval_active_requires_revocation'):
        approve(gate, owner, world['bank'], question, decision='REJECTED')
    again = approve(gate, owner, world['bank'], question)
    assert again['approvalId'] == approved['approvalId']
    assert len(gate.history(owner, question['id'])['approvals']) == 2


def test_supersedes_chain_orders_decisions_when_the_clock_ties(world):
    gate, owner, question = world['gate'], world['owner'], world['questions'][0]
    world['store'].clock = lambda: 1000.0
    rejected = approve(gate, owner, world['bank'], question, decision='REJECTED')
    approved = approve(gate, owner, world['bank'], question)
    assert rejected['createdAt'] == approved['createdAt']
    assert approved['supersedesId'] == rejected['approvalId']
    assert gate.servable_ids() == frozenset({question['id']})
    state = gate.review_state(question['id'])
    assert state['approval']['approvalId'] == approved['approvalId']
    assert state['servable'] is True
    trail = gate.history(owner, question['id'])['approvals']
    assert [row['approvalId'] for row in trail] == [rejected['approvalId'], approved['approvalId']]


def test_parallel_approvals_serialize_to_one_active_decision(world):
    gate, owner, question = world['gate'], world['owner'], world['questions'][0]
    path = world['store'].path
    digest = world['bank'].approval_content_sha256(question['id'])
    barrier = threading.Barrier(2)
    results, errors = [], []

    def decide():
        store = StudyStore(path)
        try:
            local = ApprovalGate(store, world['bank'], 'fluidi')
            barrier.wait()
            results.append(approve(local, owner, world['bank'], question))
        except BaseException as error:  # noqa: BLE001 - surfaced in the assertion
            errors.append(repr(error))
        finally:
            store.close()

    threads = [threading.Thread(target=decide) for _ in range(2)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()
    assert errors == []
    assert len(results) == 2 and len({row['approvalId'] for row in results}) == 1
    store = world['store']
    assert store.connection.execute(
        'SELECT COUNT(*) FROM study_question_bank_approvals').fetchone()[0] == 1
    assert store.connection.execute(
        'SELECT COUNT(*) FROM study_question_bank_approval_events').fetchone()[0] == 1


def test_v6_database_upgrades_to_v7_and_keeps_existing_rows(tmp_path):
    store = StudyStore(tmp_path / 'study.sqlite')
    owner = store.create_principal('owner', 'teacher')
    store.create_edition(owner, 'fluidi')
    store.close()
    with sqlite3.connect(tmp_path / 'study.sqlite') as connection:
        connection.execute('DROP TABLE study_question_bank_approval_events')
        connection.execute('DROP TABLE study_question_bank_approvals')
        connection.execute('UPDATE study_schema SET version=6')
    operations._existing_database(tmp_path).close()
    upgraded = StudyStore(tmp_path / 'study.sqlite')
    assert upgraded.connection.execute('SELECT version FROM study_schema').fetchone()[0] == CURRENT_SCHEMA
    assert upgraded.get_edition('fluidi')['teacherId'] == 'owner'
    upgraded.close()


def test_backup_restore_preserves_approval_while_student_erasure_does_not(world):
    gate, owner, student = world['gate'], world['owner'], world['student']
    question = world['questions'][0]
    record = approve(gate, owner, world['bank'], question)
    source = world['store'].path.parent
    world['store'].close()
    backup = world['tmp'] / 'backup'
    operations.backup_data(source, backup)
    reopened = StudyStore(source / 'study.sqlite')
    try:
        assert ApprovalGate(reopened, world['bank'], 'fluidi').servable_ids() == frozenset({question['id']})
    finally:
        reopened.close()
    operations.erase_student(source, student.id, apply=True)
    erased = StudyStore(source / 'study.sqlite')
    try:
        assert ApprovalGate(erased, world['bank'], 'fluidi').servable_ids() == frozenset({question['id']})
        assert erased.connection.execute(
            'SELECT COUNT(*) FROM study_question_bank_approval_events').fetchone()[0] == 1
        assert erased.connection.execute(
            'SELECT COUNT(*) FROM study_question_bank_approvals').fetchone()[0] == 1
    finally:
        erased.close()
    restored = world['tmp'] / 'restored'
    operations.restore_data(backup, restored, source / 'erasure-ledger.json')
    returned = StudyStore(restored / 'study.sqlite')
    assert ApprovalGate(returned, world['bank'], 'fluidi').servable_ids() == frozenset({question['id']})
    assert returned.principal_for_session('anything') is None
    returned.close()
    # Keep the fixture teardown valid after the explicit close above.
    world['store'] = StudyStore(source / 'study.sqlite')
