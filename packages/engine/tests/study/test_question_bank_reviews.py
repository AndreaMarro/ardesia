"""Scientific reviews are private, revision-bound and independent of publishing."""
import sqlite3

import pytest

from lessonos.study import operations
from lessonos.study.models import StudyError
from lessonos.study.question_bank_approvals import ApprovalGate
from lessonos.study.store import StudyStore
from test_question_bank_approvals import world, approve, rewrite_bank


def save(world, *, status='APPROVED', previous=None, question=None):
    question = question or world['questions'][0]
    return world['gate'].save_review(world['owner'], question_id=question['id'],
        question_version=question['version'],
        content_sha256=world['bank'].approval_content_sha256(question['id']),
        status=status, notes='Controllo sintetico delle dimensioni.', expected_review_id=previous)


def test_notes_and_scientific_decisions_do_not_create_publication_rows(world):
    first = save(world, status='PENDING')
    decision = save(world, previous=first['reviewId'])
    gate = world['gate']
    assert gate.servable_ids() == frozenset()
    assert world['store'].connection.execute('SELECT COUNT(*) FROM study_question_bank_approvals').fetchone()[0] == 0
    assert gate.review_state('fixture-000')['review'] == decision
    result = gate.publish_review(world['owner'], decision['reviewId'])
    assert result['editorialStatus'] == 'PUBLISHED'
    assert gate.servable_ids() == frozenset({'fixture-000'})
    trail = gate.history(world['owner'], 'fixture-000')
    assert [row['status'] for row in trail['reviews']] == ['PENDING', 'APPROVED']
    assert trail['approvals'][0]['events'][0]['reviewId'] == decision['reviewId']


def test_stale_positive_review_and_changed_content_cannot_publish(world):
    first = save(world)
    with pytest.raises(StudyError, match='question_review_conflict'):
        save(world)
    second = save(world, status='REJECTED', previous=first['reviewId'])
    with pytest.raises(StudyError, match='question_review_conflict'):
        world['gate'].publish_review(world['owner'], first['reviewId'])
    with pytest.raises(StudyError, match='scientific_review_not_approved'):
        world['gate'].publish_review(world['owner'], second['reviewId'])
    latest = save(world, previous=second['reviewId'])
    world['questions'][0]['solution'] = 'Nuovi passaggi da rivedere.'
    rewrite_bank(world['tmp'] / 'bank', world['questions'], world['manifest'])
    from lessonos.study.question_bank import QuestionBank
    changed = ApprovalGate(world['store'], QuestionBank(world['tmp'] / 'bank'), 'fluidi')
    with pytest.raises(StudyError, match='question_revision_changed'):
        changed.publish_review(world['owner'], latest['reviewId'])
    assert changed.servable_ids() == frozenset()


def test_delayed_publication_retry_cannot_undo_revocation(world):
    gate = world['gate']
    review = save(world)
    publication = gate.publish_review(world['owner'], review['reviewId'])
    assert gate.publish_review(world['owner'], review['reviewId']) == publication
    gate.revoke(world['owner'], publication['approvalId'], reason='Nuova verifica necessaria.')
    with pytest.raises(StudyError, match='review_publication_revoked'):
        gate.publish_review(world['owner'], review['reviewId'])
    assert gate.servable_ids() == frozenset()
    assert gate.review_state('fixture-000')['reviewPublication']['editorialStatus'] == 'REVOKED'
    # Saving a fresh review is a new deliberate act, even with identical notes.
    fresh = save(world, previous=review['reviewId'])
    assert gate.review_state('fixture-000')['reviewPublication'] is None
    second = gate.publish_review(world['owner'], fresh['reviewId'])
    assert second['approvalId'] != publication['approvalId']
    assert [row['editorialStatus'] for row in gate.history(world['owner'], 'fixture-000')['approvals']] == ['REVOKED', 'PUBLISHED']


def test_new_review_cannot_claim_another_reviews_active_publication(world):
    gate = world['gate']
    first = save(world)
    publication = gate.publish_review(world['owner'], first['reviewId'])
    second = save(world, previous=first['reviewId'])
    # Returning P1 as successful publish(R2) would leave no R2 command link:
    # a retry after revoking P1 could silently create another publication.
    with pytest.raises(StudyError, match='question_already_published'):
        gate.publish_review(world['owner'], second['reviewId'])
    state = gate.review_state('fixture-000')
    assert state['approval']['approvalId'] == publication['approvalId']
    assert state['reviewPublication'] is None
    assert len(gate.history(world['owner'], 'fixture-000')['approvals']) == 1


def test_review_rows_are_append_only_and_predecessor_cannot_cross_questions(world):
    first = save(world)
    connection = world['store'].connection
    with pytest.raises(sqlite3.IntegrityError, match='append_only'):
        connection.execute('UPDATE study_question_bank_reviews SET notes=? WHERE id=?',
                           ('changed', first['reviewId']))
    with pytest.raises(sqlite3.IntegrityError, match='append_only'):
        connection.execute('DELETE FROM study_question_bank_reviews WHERE id=?', (first['reviewId'],))
    connection.rollback()
    with pytest.raises(sqlite3.IntegrityError, match='review_identity_mismatch'):
        connection.execute('INSERT INTO study_question_bank_reviews '
            'SELECT ?,edition_id,bank_id,?,question_version,content_sha256,bank_sha256,status,notes,actor_id,created_at,? '
            'FROM study_question_bank_reviews WHERE id=?',
            ('wrong-parent', 'fixture-001', first['reviewId'], first['reviewId']))
    connection.rollback()


def test_v9_upgrade_preserves_publication_and_new_reviews_survive_backup_restore(world):
    approval = approve(world['gate'], world['owner'], world['bank'], world['questions'][0])
    path = world['store'].path
    world['store'].connection.execute('DROP TABLE study_question_bank_reviews')
    world['store'].connection.execute('UPDATE study_schema SET version=9')
    world['store'].connection.commit()
    world['store'].close()
    with pytest.raises(StudyError, match='database_schema_not_ready'):
        StudyStore(path, initialize=False)
    upgraded = StudyStore(path)
    world['store'] = upgraded
    world['gate'] = ApprovalGate(upgraded, world['bank'], 'fluidi')
    assert upgraded.connection.execute('SELECT version FROM study_schema').fetchone()[0] == 10
    assert world['gate'].review_state('fixture-000')['approval']['approvalId'] == approval['approvalId']
    review = save(world)
    operations.backup_data(path.parent, world['tmp'] / 'backup')
    operations.restore_data(world['tmp'] / 'backup', world['tmp'] / 'restored',
                            current_ledger=path.parent / 'erasure-ledger.json')
    with_store = StudyStore(world['tmp'] / 'restored' / 'study.sqlite', initialize=False)
    try:
        assert ApprovalGate(with_store, world['bank'], 'fluidi').review_state('fixture-000')['review'] == review
    finally:
        with_store.close()
        upgraded.close()
