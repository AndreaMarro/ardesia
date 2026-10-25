"""Real PostgreSQL tests: the same private boundary must hold below HTTP."""
from contextlib import contextmanager
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier

import pytest

psycopg = pytest.importorskip('psycopg')
from lessonos.study.catalog import describe_pack
from lessonos.study.models import Principal, StudyError
from lessonos.study.postgres import migrate, PostgresStudyStore
from lessonos.study.question_bank import QuestionBank
from lessonos.study.question_bank_approvals import ApprovalGate
from test_question_bank_approvals import write_bank
from test_postgres_schema_convergence import (
    MIGRATIONS, _fresh_database, _prepare_runner, _apply, _seed_edition, _as, actor_edition,
)


@contextmanager
def _as_actor(url, identity):
    with psycopg.connect(url, autocommit=True) as connection:
        _as(connection, identity)
        yield connection


def insert_review(connection, edition, teacher, review_id='review-1'):
    connection.execute(
        "INSERT INTO study_question_bank_reviews VALUES(%s,%s,'bank','q1',1,%s,%s,'APPROVED',%s,%s,1000,NULL)",
        (review_id, edition, 'a' * 64, 'b' * 64, 'Private synthetic review.', teacher))


def test_postgres_reviews_are_private_and_cannot_publish_by_themselves(actor_edition):
    url, teacher, student, peer, edition, identities = actor_edition
    with _as_actor(url, identities[teacher]) as connection:
        insert_review(connection, edition, teacher)
        assert connection.execute('SELECT notes FROM study_question_bank_reviews').fetchone()[0] == 'Private synthetic review.'
        assert connection.execute('SELECT count(*) FROM study_question_bank_approvals').fetchone()[0] == 0
    for actor in (student, peer):
        with _as_actor(url, identities[actor]) as connection:
            assert connection.execute('SELECT count(*) FROM study_question_bank_reviews').fetchone()[0] == 0
            with pytest.raises(psycopg.errors.InsufficientPrivilege):
                insert_review(connection, edition, teacher, review_id='forged-' + actor)
    with _as_actor(url, identities[teacher]) as connection:
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            connection.execute("UPDATE study_question_bank_reviews SET notes='edited'")
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            connection.execute('DELETE FROM study_question_bank_reviews')
    with psycopg.connect(url, autocommit=True) as connection:
        with pytest.raises(psycopg.errors.RaiseException, match='append_only'):
            connection.execute("UPDATE study_question_bank_reviews SET notes='admin edit'")


def test_postgres_v9_to_v10_is_additive_retryable_and_preserves_existing_oid():
    with _fresh_database() as url:
        with psycopg.connect(url, autocommit=True) as connection:
            _prepare_runner(connection)
            for path in sorted(MIGRATIONS.glob('*.sql')):
                if path.name < '20261022010000':
                    _apply(connection, path)
            assert connection.execute('SELECT version FROM study_schema').fetchone()[0] == 9
            old_oid = connection.execute("SELECT 'study_question_bank_approvals'::regclass::oid").fetchone()[0]
            teacher, _, _, edition, _ = _seed_edition(connection)
        migrate(url)
        with psycopg.connect(url, autocommit=True) as connection:
            insert_review(connection, edition, teacher)
            migration = MIGRATIONS / '20261022010000_study_scientific_reviews.sql'
            connection.execute(migration.read_text())
            assert connection.execute('SELECT version FROM study_schema').fetchone()[0] == 10
            assert connection.execute("SELECT 'study_question_bank_approvals'::regclass::oid").fetchone()[0] == old_oid
            assert connection.execute('SELECT notes FROM study_question_bank_reviews').fetchone()[0] == 'Private synthetic review.'


def test_postgres_concurrent_reviews_serialize_and_publication_retry_cannot_revive(actor_edition, tmp_path):
    url, teacher, _, _, edition, identities = actor_edition
    descriptor = describe_pack()
    with psycopg.connect(url, autocommit=True) as connection:
        connection.execute('INSERT INTO study_edition_packs VALUES(%s,%s,%s,%s,%s)',
            (edition, descriptor['courseId'], descriptor['packId'],
             descriptor['packVersion'], descriptor['packSha256']))
    write_bank(tmp_path / 'synthetic-bank')
    bank = QuestionBank(tmp_path / 'synthetic-bank')
    principal = Principal(teacher, 'teacher')
    user_id, session_id = identities[teacher]
    barrier = Barrier(2)

    def open_store():
        return PostgresStudyStore(url, tmp_path / 'data', auth_user_id=user_id, auth_session_id=session_id)

    def concurrent_save():
        store = open_store()
        try:
            barrier.wait(timeout=10)
            try:
                review = ApprovalGate(store, bank, edition).save_review(principal,
                    question_id='fixture-000', question_version=1,
                    content_sha256=bank.approval_content_sha256('fixture-000'),
                    status='APPROVED', notes='Concurrent synthetic review.', expected_review_id=None)
                return 'ok', review['reviewId']
            except StudyError as error:
                return error.code, None
        finally:
            store.close()

    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(concurrent_save) for _ in range(2)]
        results = [future.result(timeout=20) for future in futures]
    assert sorted(result[0] for result in results) == ['ok', 'question_review_conflict']
    review_id = next(result[1] for result in results if result[0] == 'ok')
    store = open_store()
    try:
        gate = ApprovalGate(store, bank, edition)
        publication = gate.publish_review(principal, review_id)
        assert gate.publish_review(principal, review_id) == publication
        gate.revoke(principal, publication['approvalId'], reason='Synthetic review suspended.')
        with pytest.raises(StudyError, match='review_publication_revoked'):
            gate.publish_review(principal, review_id)
        assert gate.servable_ids() == frozenset()
        assert len(gate.history(principal, 'fixture-000')['approvals']) == 1
    finally:
        store.close()
