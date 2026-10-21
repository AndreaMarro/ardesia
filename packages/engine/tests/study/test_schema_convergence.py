"""Canonical v6 -> v7 (approvals) -> v8 (exams) convergence and rollback."""
import hashlib
import sqlite3
from pathlib import Path

import pytest

from lessonos.study import operations
from lessonos.study.exam import get_attempt, start_attempt
from lessonos.study.models import StudyError
from lessonos.study.schema_contract import (
    ADMIN_COLUMNS, APPROVAL_COLUMNS, CURRENT_SCHEMA, EXAM_COLUMNS, TABLES_V3,
    validate_schema,
)
from lessonos.study.scientific_notebook import NOTEBOOK_COLUMNS
from lessonos.study.store import StudyStore

ROOT = Path(__file__).resolve().parents[4]
MIGRATIONS = ROOT / 'supabase' / 'migrations'
APPROVAL_MIGRATION = MIGRATIONS / '20261021120000_study_question_bank_approvals.sql'
EXAM_MIGRATION = MIGRATIONS / '20261021130000_study_exam_attempts.sql'


def seed(store):
    teacher = store.create_principal('convergence-teacher', 'teacher')
    student = store.create_principal('convergence-student', 'student')
    store.create_edition(teacher, 'fluidi')
    store.add_test_member(teacher, 'fluidi', student.id)
    return teacher, student


def insert_approval(store):
    digest = hashlib.sha256(b'convergence').hexdigest()
    store.connection.execute(
        'INSERT INTO study_question_bank_approvals VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        ('approval-1', 'fluidi', 'physics-semestre-2026', 'u1-area-conversion-01', 1,
         digest, digest, 'APPROVED', 'PUBLISHED', 'convergence-teacher', 100.0,
         'revisione di convergenza', None, None, None, None))
    store.connection.commit()


def table_columns(connection, table):
    return {row[1] for row in connection.execute(f'PRAGMA table_info({table})')}


def column_map(required):
    return {table: set(columns) for table, columns in required.items()}


def test_new_database_is_v8_with_both_features(tmp_path):
    store = StudyStore(tmp_path / 'study.sqlite')
    assert store.connection.execute('SELECT version FROM study_schema').fetchone()[0] == CURRENT_SCHEMA == 8
    assert table_columns(store.connection, 'study_question_bank_approvals') >= APPROVAL_COLUMNS[
        'study_question_bank_approvals']
    assert table_columns(store.connection, 'study_exam_attempts') == EXAM_COLUMNS['study_exam_attempts']
    store.close()


def test_v6_upgrades_to_v8_without_losing_pre_existing_rows(tmp_path):
    store = StudyStore(tmp_path / 'study.sqlite')
    teacher, student = seed(store)
    store.close()
    with sqlite3.connect(tmp_path / 'study.sqlite') as connection:
        connection.execute('DROP TABLE study_question_bank_approval_events')
        connection.execute('DROP TABLE study_question_bank_approvals')
        connection.execute('DROP TABLE study_exam_attempts')
        connection.execute('UPDATE study_schema SET version=6')
    operations._existing_database(tmp_path).close()
    upgraded = StudyStore(tmp_path / 'study.sqlite')
    assert upgraded.connection.execute('SELECT version FROM study_schema').fetchone()[0] == 8
    assert upgraded.get_edition('fluidi')['teacherId'] == teacher.id
    assert upgraded.connection.execute(
        'SELECT COUNT(*) FROM study_members WHERE student_id=?', (student.id,)).fetchone()[0] == 1
    assert upgraded.connection.execute(
        'SELECT COUNT(*) FROM study_question_bank_approvals').fetchone()[0] == 0
    assert upgraded.connection.execute('SELECT COUNT(*) FROM study_exam_attempts').fetchone()[0] == 0
    upgraded.close()


def test_canonical_v7_approval_database_upgrades_and_preserves_decisions(tmp_path):
    store = StudyStore(tmp_path / 'study.sqlite')
    seed(store)
    insert_approval(store)
    store.close()
    with sqlite3.connect(tmp_path / 'study.sqlite') as connection:
        connection.execute('DROP TABLE study_exam_attempts')
        connection.execute('UPDATE study_schema SET version=7')
    upgraded = StudyStore(tmp_path / 'study.sqlite')
    assert upgraded.connection.execute('SELECT version FROM study_schema').fetchone()[0] == 8
    row = upgraded.connection.execute(
        'SELECT question_id,editorial_status FROM study_question_bank_approvals').fetchone()
    assert row['question_id'] == 'u1-area-conversion-01' and row['editorial_status'] == 'PUBLISHED'
    assert table_columns(upgraded.connection, 'study_exam_attempts') == EXAM_COLUMNS['study_exam_attempts']
    upgraded.close()


def test_legacy_v7_exam_database_upgrades_and_preserves_attempts(tmp_path):
    store = StudyStore(tmp_path / 'study.sqlite')
    teacher, student = seed(store)
    attempt = start_attempt(store, student, 'fluidi')
    store.close()
    with sqlite3.connect(tmp_path / 'study.sqlite') as connection:
        connection.execute('DROP TABLE study_question_bank_approval_events')
        connection.execute('DROP TABLE study_question_bank_approvals')
        connection.execute('UPDATE study_schema SET version=7')
    operations._existing_database(tmp_path).close()
    upgraded = StudyStore(tmp_path / 'study.sqlite')
    assert upgraded.connection.execute('SELECT version FROM study_schema').fetchone()[0] == 8
    current = get_attempt(upgraded, student, attempt['id'])
    assert current['status'] == 'in_progress'
    assert current['packId'] == 'fisica-semestre-filtro-v1'
    assert upgraded.connection.execute(
        'SELECT COUNT(*) FROM study_question_bank_approvals').fetchone()[0] == 0
    assert upgraded.connection.execute(
        'SELECT COUNT(*) FROM study_question_bank_approval_events').fetchone()[0] == 0
    upgraded.close()


def test_failed_upgrade_leaves_bytes_and_decisions_untouched(tmp_path):
    store = StudyStore(tmp_path / 'study.sqlite')
    seed(store)
    insert_approval(store)
    store.close()
    with sqlite3.connect(tmp_path / 'study.sqlite') as connection:
        connection.execute('DROP TABLE study_exam_attempts')
        connection.execute('UPDATE study_schema SET version=7')
        connection.execute('CREATE TABLE study_exam_attempts(id TEXT PRIMARY KEY)')
    path = tmp_path / 'study.sqlite'
    before = path.read_bytes()
    with pytest.raises(StudyError, match='database_integrity_failure'):
        StudyStore(path)
    assert path.read_bytes() == before
    with sqlite3.connect(path) as connection:
        assert connection.execute('SELECT version FROM study_schema').fetchone()[0] == 7
        assert connection.execute('SELECT COUNT(*) FROM study_question_bank_approvals').fetchone()[0] == 1


def test_backup_restore_preserves_gate_and_exam_attempt_together(tmp_path):
    store = StudyStore(tmp_path / 'source' / 'study.sqlite')
    teacher, student = seed(store)
    insert_approval(store)
    attempt = start_attempt(store, student, 'fluidi')
    store.close()
    operations.backup_data(tmp_path / 'source', tmp_path / 'backup')
    restored = tmp_path / 'restored'
    operations.restore_data(tmp_path / 'backup', restored, tmp_path / 'source' / 'erasure-ledger.json')
    returned = StudyStore(restored / 'study.sqlite')
    assert returned.connection.execute('SELECT version FROM study_schema').fetchone()[0] == 8
    assert returned.connection.execute(
        'SELECT COUNT(*) FROM study_question_bank_approvals').fetchone()[0] == 1
    assert returned.connection.execute(
        'SELECT COUNT(*) FROM study_exam_attempts WHERE id=?', (attempt['id'],)).fetchone()[0] == 1
    returned.close()


def test_student_erasure_removes_attempt_but_keeps_editorial_decision(tmp_path):
    store = StudyStore(tmp_path / 'source' / 'study.sqlite')
    teacher, student = seed(store)
    insert_approval(store)
    attempt = start_attempt(store, student, 'fluidi')
    store.close()
    operations.erase_student(tmp_path / 'source', student.id, apply=True)
    erased = StudyStore(tmp_path / 'source' / 'study.sqlite')
    assert erased.connection.execute(
        'SELECT COUNT(*) FROM study_exam_attempts WHERE id=?', (attempt['id'],)).fetchone()[0] == 0
    assert erased.connection.execute(
        'SELECT COUNT(*) FROM study_question_bank_approvals').fetchone()[0] == 1
    erased.close()


def test_contract_distinguishes_canonical_v7_from_legacy_exam_v7():
    tables = TABLES_V3 | set(ADMIN_COLUMNS) | set(NOTEBOOK_COLUMNS)
    common = {
        'admin_columns': column_map(ADMIN_COLUMNS),
        'notebook_columns': column_map(NOTEBOOK_COLUMNS),
    }
    editions, holds = {'management_revision'}, {'offer_revision'}
    validate_schema(7, tables | set(APPROVAL_COLUMNS), editions, holds,
                    allow_upgrade=True, approval_columns=column_map(APPROVAL_COLUMNS), **common)
    with pytest.raises(StudyError, match='database_schema_not_ready'):
        validate_schema(7, tables | set(APPROVAL_COLUMNS), editions, holds,
                        approval_columns=column_map(APPROVAL_COLUMNS), **common)
    with pytest.raises(StudyError, match='database_integrity_failure'):
        validate_schema(7, tables | set(EXAM_COLUMNS), editions, holds,
                        exam_columns=column_map(EXAM_COLUMNS), **common)
    validate_schema(7, tables | set(EXAM_COLUMNS), editions, holds, allow_upgrade=True,
                    exam_columns=column_map(EXAM_COLUMNS), **common)
    with pytest.raises(StudyError, match='database_integrity_failure'):
        validate_schema(8, tables | set(APPROVAL_COLUMNS), editions, holds, allow_upgrade=True,
                        approval_columns=column_map(APPROVAL_COLUMNS), **common)


def test_postgres_migrations_have_unique_prefix_and_canonical_order():
    names = sorted(path.name for path in MIGRATIONS.glob('*.sql'))
    prefixes = [name.split('_', 1)[0] for name in names]
    assert len(prefixes) == len(set(prefixes))
    assert APPROVAL_MIGRATION.name in names and EXAM_MIGRATION.name in names
    assert names.index(APPROVAL_MIGRATION.name) < names.index(EXAM_MIGRATION.name)
    approval = APPROVAL_MIGRATION.read_text()
    exam = EXAM_MIGRATION.read_text()
    assert 'UPDATE public.study_schema SET version=7 WHERE version=6;' in approval
    assert 'UPDATE public.study_schema SET version=8 WHERE version=7;' in exam
    assert "to_regclass('public.study_exam_attempts')" in approval
    assert '!=7 THEN' in exam
