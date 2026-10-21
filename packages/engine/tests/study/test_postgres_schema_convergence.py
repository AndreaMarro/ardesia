"""Real PostgreSQL convergence contracts.

These tests never touch Supabase production. They create disposable databases
on the URL supplied in ARDESIA_TEST_POSTGRES_URL. Without that explicit opt-in
the module skips, exactly like the existing live Supabase contracts.
"""
import json
import os
import uuid
from contextlib import contextmanager
from pathlib import Path

import pytest

psycopg = pytest.importorskip('psycopg')
from psycopg.conninfo import conninfo_to_dict, make_conninfo

from lessonos.study.postgres import migrate
from lessonos.study.schema_contract import CURRENT_SCHEMA

ROOT = Path(__file__).resolve().parents[4]
MIGRATIONS = ROOT / 'supabase' / 'migrations'
LEGACY_EXAM = Path(__file__).resolve().parents[1] / 'fixtures' / 'study' / 'legacy_269_exam.sql'

BOOTSTRAP = """
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='postgres') THEN CREATE ROLE postgres LOGIN SUPERUSER; END IF;
END $$;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users(id UUID PRIMARY KEY);
CREATE TABLE IF NOT EXISTS auth.sessions(id UUID PRIMARY KEY, user_id UUID REFERENCES auth.users(id));
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
 SELECT COALESCE(NULLIF(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
$$;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT NULLIF(auth.jwt() ->> 'sub', '')::uuid
$$;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE TABLE IF NOT EXISTS storage.buckets(
 id TEXT PRIMARY KEY, name TEXT NOT NULL, public BOOLEAN NOT NULL DEFAULT false,
 file_size_limit BIGINT, allowed_mime_types TEXT[]);
CREATE TABLE IF NOT EXISTS storage.objects(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id TEXT, name TEXT, owner_id TEXT);
"""


def _base_url():
    url = os.getenv('ARDESIA_TEST_POSTGRES_URL')
    if not url:
        pytest.skip('real PostgreSQL convergence: ARDESIA_TEST_POSTGRES_URL not supplied')
    return url


def _database_url(url, database):
    values = conninfo_to_dict(url)
    values['dbname'] = database
    return make_conninfo(**values)


def _admin_url(url):
    return _database_url(url, 'postgres')


@contextmanager
def _fresh_database():
    base = _base_url()
    name = 'ardesia_conv_' + uuid.uuid4().hex[:12]
    with psycopg.connect(_admin_url(base), autocommit=True) as admin:
        admin.execute('CREATE DATABASE ' + name)
    url = _database_url(base, name)
    try:
        with psycopg.connect(url, autocommit=True) as connection:
            connection.execute(BOOTSTRAP)
        yield url
    finally:
        with psycopg.connect(_admin_url(base), autocommit=True) as admin:
            admin.execute('DROP DATABASE IF EXISTS ' + name + ' WITH (FORCE)')


def _apply(connection, path, name=None):
    with connection.transaction():
        connection.execute(path.read_text())
        connection.execute('INSERT INTO ardesia_private.migrations VALUES(%s)', (name or path.name,))


def _prepare_runner(connection):
    connection.execute('CREATE SCHEMA IF NOT EXISTS ardesia_private')
    connection.execute('CREATE TABLE IF NOT EXISTS ardesia_private.migrations(name TEXT PRIMARY KEY)')


def _to_v6(url):
    with psycopg.connect(url, autocommit=True) as connection:
        _prepare_runner(connection)
        for migration in sorted(MIGRATIONS.glob('*.sql')):
            if migration.name >= '20261021120000':
                continue
            _apply(connection, migration)
    return url


def _to_canonical_v7(url):
    _to_v6(url)
    with psycopg.connect(url, autocommit=True) as connection:
        _apply(connection, MIGRATIONS / '20261021120000_study_question_bank_approvals.sql')
    return url


def _to_legacy_v7(url):
    _to_v6(url)
    with psycopg.connect(url, autocommit=True) as connection:
        _apply(connection, LEGACY_EXAM, '20261021120000_study_exam_attempts.sql')
    return url


def _seed_actor(connection, tag, role='student'):
    principal = f'{role}-{tag}'
    connection.execute('INSERT INTO study_principals VALUES(%s,%s)', (principal, role))
    if role == 'teacher':
        connection.execute('INSERT INTO teachers VALUES(%s)', (principal,))
    else:
        connection.execute('INSERT INTO students VALUES(%s)', (principal,))
    return principal


def _seed_edition(connection):
    tag = uuid.uuid4().hex[:10]
    teacher = _seed_actor(connection, tag + '-t', 'teacher')
    student = _seed_actor(connection, tag + '-s', 'student')
    peer = _seed_actor(connection, tag + '-p', 'student')
    edition = f'edition-{tag}'
    connection.execute('INSERT INTO classes VALUES(%s,%s,%s)', (edition, teacher, 'fisica'))
    connection.execute(
        'INSERT INTO study_editions(id,teacher_id,capacity,price_minor,state,sessions,timezone) '
        "VALUES(%s,%s,10,0,'confirmed','[]','Europe/Rome')", (edition, teacher))
    connection.execute('INSERT INTO study_members VALUES(%s,%s)', (edition, student))
    identities = {}
    for actor in (teacher, student, peer):
        user_id = uuid.uuid4()
        session_id = uuid.uuid4()
        connection.execute('INSERT INTO auth.users VALUES(%s)', (user_id,))
        connection.execute('INSERT INTO auth.sessions VALUES(%s,%s)', (session_id, user_id))
        connection.execute('INSERT INTO ardesia_private.identities VALUES(%s,%s)', (user_id, actor))
        identities[actor] = (str(user_id), str(session_id))
    return teacher, student, peer, edition, identities


def _as(connection, identity):
    user_id, session_id = identity
    connection.execute("SELECT set_config('request.jwt.claims', %s, false)",
        (f'{{"sub":"{user_id}","session_id":"{session_id}","role":"authenticated"}}',))
    connection.execute('SET ROLE ardesia_app')


def _attempt(connection, edition, student, attempt='attempt-1', status='in_progress'):
    connection.execute(
        'INSERT INTO study_exam_attempts(id,edition_id,student_id,pack_id,pack_version,'
        'pack_sha256,question_order,answers,status,started_at,deadline_at,submitted_at,'
        'score_tenths,receipt_id,result,pack_snapshot) '
        "VALUES(%s,%s,%s,'fisica-semestre-filtro-v1',1,%s,'[]','{}',%s,1,2,"
        '%s,%s,%s,%s,%s)',
        (attempt, edition, student, 'a' * 64, status,
         3 if status != 'in_progress' else None,
         10 if status != 'in_progress' else None,
         'receipt' if status != 'in_progress' else None,
         '{}' if status != 'in_progress' else None,
         '{}'))


@pytest.fixture
def actor_edition():
    with _fresh_database() as url:
        migrate(url)
        with psycopg.connect(url, autocommit=True) as connection:
            teacher, student, peer, edition, identities = _seed_edition(connection)
        yield url, teacher, student, peer, edition, identities


def test_fresh_database_reaches_v10_with_both_families():
    with _fresh_database() as url:
        migrate(url)
        with psycopg.connect(url, autocommit=True) as connection:
            assert connection.execute('SELECT version FROM study_schema').fetchone()[0] == CURRENT_SCHEMA
            tables = {row[0] for row in connection.execute(
                "SELECT tablename FROM pg_tables WHERE schemaname='public'")}
            assert {'study_question_bank_approvals', 'study_question_bank_approval_events',
                    'study_exam_attempts'} <= tables
            triggers = {row[0] for row in connection.execute(
                "SELECT tgname FROM pg_trigger WHERE NOT tgisinternal")}
            assert {'study_bank_approval_immutable', 'study_bank_approval_event_append_only',
                    'study_exam_attempt_guard'} <= triggers


def test_v6_with_data_preserves_rows_and_reaches_v10():
    with _fresh_database() as url:
        _to_v6(url)
        with psycopg.connect(url, autocommit=True) as connection:
            teacher, student, peer, edition, _ = _seed_edition(connection)
        migrate(url)
        with psycopg.connect(url, autocommit=True) as connection:
            assert connection.execute('SELECT version FROM study_schema').fetchone()[0] == CURRENT_SCHEMA
            assert connection.execute('SELECT teacher_id FROM study_editions WHERE id=%s',
                (edition,)).fetchone()[0] == teacher
            assert connection.execute('SELECT count(*) FROM study_members WHERE edition_id=%s',
                (edition,)).fetchone()[0] == 1


def test_canonical_v7_approvals_preserves_decisions_and_adds_exam():
    with _fresh_database() as url:
        _to_canonical_v7(url)
        with psycopg.connect(url, autocommit=True) as connection:
            teacher, student, peer, edition, _ = _seed_edition(connection)
            connection.execute(
                "INSERT INTO study_question_bank_approvals VALUES(%s,%s,'bank',%s,1,%s,%s,"
                "'APPROVED','PUBLISHED',%s,1,'ok',NULL,NULL,NULL,NULL)",
                ('approval-1', edition, 'q1', 'b' * 64, 'c' * 64, teacher))
        migrate(url)
        with psycopg.connect(url, autocommit=True) as connection:
            assert connection.execute('SELECT version FROM study_schema').fetchone()[0] == CURRENT_SCHEMA
            assert connection.execute(
                'SELECT editorial_status FROM study_question_bank_approvals WHERE id=%s',
                ('approval-1',)).fetchone()[0] == 'PUBLISHED'


def test_legacy_v7_exam_only_upgrades_without_recreating_table():
    with _fresh_database() as url:
        _to_legacy_v7(url)
        with psycopg.connect(url, autocommit=True) as connection:
            teacher, student, peer, edition, _ = _seed_edition(connection)
            _attempt(connection, edition, student, 'legacy-attempt')
            old_oid = connection.execute(
                "SELECT 'public.study_exam_attempts'::regclass::oid").fetchone()[0]
        migrate(url)
        with psycopg.connect(url, autocommit=True) as connection:
            assert connection.execute('SELECT version FROM study_schema').fetchone()[0] == CURRENT_SCHEMA
            assert connection.execute(
                "SELECT 'public.study_exam_attempts'::regclass::oid").fetchone()[0] == old_oid
            assert connection.execute('SELECT status FROM study_exam_attempts WHERE id=%s',
                ('legacy-attempt',)).fetchone()[0] == 'in_progress'
            assert connection.execute(
                'SELECT answer_revision FROM study_exam_attempts WHERE id=%s',
                ('legacy-attempt',)).fetchone()[0] == 0
            assert connection.execute(
                "SELECT count(*) FROM ardesia_private.migrations WHERE name IN "
                "('20261021120000_study_question_bank_approvals.sql',"
                "'20261021130000_study_exam_attempts.sql')").fetchone()[0] == 2


def test_partial_v6_with_approval_tables_is_repaired_by_retry():
    with _fresh_database() as url:
        _to_v6(url)
        with psycopg.connect(url, autocommit=True) as connection:
            _apply(connection, MIGRATIONS / '20261021120000_study_question_bank_approvals.sql')
            connection.execute("DELETE FROM ardesia_private.migrations WHERE name='20261021120000_study_question_bank_approvals.sql'")
            connection.execute('UPDATE study_schema SET version=6')
        migrate(url)
        with psycopg.connect(url, autocommit=True) as connection:
            assert connection.execute('SELECT version FROM study_schema').fetchone()[0] == CURRENT_SCHEMA


def test_v8_exam_upgrades_additively_to_v9_without_losing_rows():
    with _fresh_database() as url:
        _to_canonical_v7(url)
        with psycopg.connect(url, autocommit=True) as connection:
            _apply(connection, MIGRATIONS / '20261021130000_study_exam_attempts.sql')
            teacher, student, peer, edition, _ = _seed_edition(connection)
            _attempt(connection, edition, student, 'v8-attempt')
            connection.execute(
                "UPDATE study_exam_attempts SET answers='{\"q1\":1}' WHERE id='v8-attempt'")
            old_oid = connection.execute(
                "SELECT 'public.study_exam_attempts'::regclass::oid").fetchone()[0]
            assert connection.execute('SELECT version FROM study_schema').fetchone()[0] == 8
        with psycopg.connect(url, autocommit=True) as connection:
            _apply(connection, MIGRATIONS / '20261021140000_study_exam_answer_revision.sql')
            assert connection.execute('SELECT version FROM study_schema').fetchone()[0] == 9
            assert connection.execute(
                "SELECT 'public.study_exam_attempts'::regclass::oid").fetchone()[0] == old_oid
            row = connection.execute(
                'SELECT status,answers,answer_revision FROM study_exam_attempts WHERE id=%s',
                ('v8-attempt',)).fetchone()
            assert row[0] == 'in_progress'
            assert json.loads(row[1]) == {'q1': 1}
            assert row[2] == 0


def test_interrupted_exam_migration_rolls_back_without_losing_v7():
    with _fresh_database() as url:
        _to_canonical_v7(url)
        with psycopg.connect(url, autocommit=True) as connection:
            connection.execute('CREATE TABLE study_exam_attempts(id TEXT PRIMARY KEY)')
        with pytest.raises(psycopg.errors.RaiseException, match='shape mismatch'):
            migrate(url)
        with psycopg.connect(url, autocommit=True) as connection:
            assert connection.execute('SELECT version FROM study_schema').fetchone()[0] == 7
            assert connection.execute(
                "SELECT count(*) FROM ardesia_private.migrations WHERE name='20261021130000_study_exam_attempts.sql'").fetchone()[0] == 0
        with psycopg.connect(url, autocommit=True) as connection:
            connection.execute('DROP TABLE study_exam_attempts')
        migrate(url)
        with psycopg.connect(url, autocommit=True) as connection:
            assert connection.execute('SELECT version FROM study_schema').fetchone()[0] == CURRENT_SCHEMA


def test_approval_rls_and_append_only_events(actor_edition):
    url, teacher, student, peer, edition, identities = actor_edition
    with psycopg.connect(url, autocommit=True) as connection:
        _as(connection, identities[teacher])
    with psycopg.connect(url, autocommit=True) as connection:
        _as(connection, identities[teacher])
        connection.execute(
            "INSERT INTO study_question_bank_approvals VALUES(%s,%s,'bank','q1',1,%s,%s,"
            "'APPROVED','PUBLISHED',%s,1,'reviewed',NULL,NULL,NULL,NULL)",
            ('approval-1', edition, 'b' * 64, 'c' * 64, teacher))
        connection.execute(
            "INSERT INTO study_question_bank_approval_events VALUES(%s,%s,%s,'bank','q1',1,%s,"
            "'APPROVED',%s,1,'reviewed','{}')",
            ('event-1', 'approval-1', edition, 'b' * 64, teacher))
    with psycopg.connect(url, autocommit=True) as connection:
        _as(connection, identities[student])
        assert connection.execute('SELECT count(*) FROM study_question_bank_approvals').fetchone()[0] == 0
        assert connection.execute('SELECT count(*) FROM study_question_bank_approval_events').fetchone()[0] == 0
        projection = connection.execute(
            "SELECT approval_id,question_id,question_version,content_sha256 "
            "FROM ardesia_private.study_servable_approvals(%s,'bank')", (edition,)).fetchall()
        assert projection == [('approval-1', 'q1', 1, 'b' * 64)]
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            connection.execute(
                "INSERT INTO study_question_bank_approvals VALUES(%s,%s,'bank','q2',1,%s,%s,"
                "'APPROVED','PUBLISHED',%s,1,'forged',NULL,NULL,NULL,NULL)",
                ('approval-forged', edition, 'b' * 64, 'c' * 64, student))
    with psycopg.connect(url, autocommit=True) as connection:
        _as(connection, identities[peer])
        assert connection.execute('SELECT count(*) FROM study_question_bank_approvals').fetchone()[0] == 0
    with psycopg.connect(url, autocommit=True) as connection:
        connection.execute('SET ROLE anon')
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            connection.execute(
                "SELECT * FROM ardesia_private.study_servable_approvals(%s,'bank')", (edition,))
    with psycopg.connect(url, autocommit=True) as connection:
        _as(connection, identities[teacher])
        connection.execute(
            "UPDATE study_question_bank_approvals SET editorial_status='REVOKED',"
            "revoked_at=2,revoked_by=%s,revocation_reason='error' WHERE id='approval-1'", (teacher,))
        connection.execute(
            "INSERT INTO study_question_bank_approval_events VALUES(%s,%s,%s,'bank','q1',1,%s,"
            "'REVOKED',%s,2,'error','{}')",
            ('event-2', 'approval-1', edition, 'b' * 64, teacher))
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            connection.execute("DELETE FROM study_question_bank_approvals WHERE id='approval-1'")
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            connection.execute("UPDATE study_question_bank_approval_events SET motivation='x'")
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            connection.execute("DELETE FROM study_question_bank_approval_events")
    with psycopg.connect(url, autocommit=True) as connection:
        _as(connection, identities[student])
        assert connection.execute(
            "SELECT count(*) FROM ardesia_private.study_servable_approvals(%s,'bank')",
            (edition,)).fetchone()[0] == 0
        revoked = connection.execute(
            "SELECT approval_id FROM ardesia_private.study_revoked_approvals(%s,'bank',ARRAY[%s]::text[])",
            (edition, 'approval-1')).fetchall()
        assert revoked == [('approval-1',)]


def test_exam_rls_isolation_and_closed_attempt_immutability(actor_edition):
    url, teacher, student, peer, edition, identities = actor_edition
    with psycopg.connect(url, autocommit=True) as connection:
        _attempt(connection, edition, student, 'attempt-1')
        _attempt(connection, edition, peer, 'attempt-peer')
    with psycopg.connect(url, autocommit=True) as connection:
        _as(connection, identities[student])
        assert connection.execute('SELECT count(*) FROM study_exam_attempts').fetchone()[0] == 1
        connection.execute(
            "UPDATE study_exam_attempts SET answers='{\"q1\":1}' WHERE id='attempt-1'")
        with pytest.raises(psycopg.errors.RaiseException, match='identity_is_immutable'):
            connection.execute("UPDATE study_exam_attempts SET pack_id='other' WHERE id='attempt-1'")
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            connection.execute("DELETE FROM study_exam_attempts WHERE id='attempt-1'")
        denied = connection.execute("UPDATE study_exam_attempts SET answers='{}' WHERE id='attempt-peer'")
        assert denied.rowcount == 0
    with psycopg.connect(url, autocommit=True) as connection:
        connection.execute(
            "UPDATE study_exam_attempts SET status='submitted',submitted_at=3,score_tenths=10,"
            "receipt_id='r',result='{}' WHERE id='attempt-1'")
    with psycopg.connect(url, autocommit=True) as connection:
        _as(connection, identities[student])
        with pytest.raises(psycopg.errors.RaiseException, match='closed_exam_attempt_is_immutable'):
            connection.execute("UPDATE study_exam_attempts SET answers='{}' WHERE id='attempt-1'")
