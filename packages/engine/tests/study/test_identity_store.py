"""Behavior contracts: persistent authority, peer isolation and atomic receipts."""
from pathlib import Path
import sqlite3
import pytest
from lessonos.study.store import StudyStore
from lessonos.study.models import StudyError


def setup_store(tmp_path):
    store = StudyStore(tmp_path / 'study.sqlite')
    teacher = store.create_principal('tutor-test', 'teacher')
    first = store.create_principal('student-01', 'student')
    peer = store.create_principal('student-02', 'student')
    other_teacher = store.create_principal('tutor-other', 'teacher')
    store.create_edition(teacher, 'fluidi', capacity=10)
    store.add_test_member(teacher, 'fluidi', first.id)
    store.add_test_member(teacher, 'fluidi', peer.id)
    return store, teacher, first, peer, other_teacher


def test_student_cannot_read_peer_source(tmp_path):
    store, teacher, first, peer, other = setup_store(tmp_path)
    source = store.create_resource(first, 'fluidi', 'notes', 'Private synthetic answer')
    assert store.get_resource(first, source['id'])['text'] == 'Private synthetic answer'
    assert store.get_resource(teacher, source['id'])['text'] == 'Private synthetic answer'
    for principal in (peer, other):
        with pytest.raises(StudyError) as error:
            store.get_resource(principal, source['id'])
        assert error.value.code == 'forbidden'
        assert 'Private' not in str(error.value)


def test_client_actor_id_does_not_override_session(tmp_path):
    store, teacher, first, peer, other = setup_store(tmp_path)
    token = store.issue_session(first)
    resolved = store.principal_for_session(token)
    source = store.create_resource(resolved, 'fluidi', 'notes', 'Owned by session')
    assert source['ownerId'] == first.id
    assert store.principal_for_session('invalid') is None
    # An identity from another process is re-resolved from the persisted session.
    reopened = StudyStore(store.path)
    assert reopened.principal_for_session(token).id == first.id
    store.revoke_session(token)
    assert reopened.principal_for_session(token) is None


def test_rollback_leaves_no_receipt(tmp_path):
    store, teacher, first, peer, other = setup_store(tmp_path)
    with pytest.raises(RuntimeError):
        with store.transaction() as connection:
            connection.execute("INSERT INTO study_receipts(id, actor_id, operation, request_key, payload_hash, body) VALUES('r', ?, 'submit', 'key', 'hash', '{}')", (first.id,))
            raise RuntimeError('synthetic failure before commit')
    assert store.connection.execute('SELECT COUNT(*) FROM study_receipts').fetchone()[0] == 0
    assert store.connection.execute('PRAGMA foreign_keys').fetchone()[0] == 1


def test_migration_preserves_legacy_and_backup_restores(tmp_path):
    from lessonos.store.sqlite import SQLiteStore
    from lessonos.models.crm import Teacher
    path = tmp_path / 'legacy.sqlite'
    legacy = SQLiteStore(str(path))
    legacy.save_teacher(Teacher('legacy-tutor'))
    legacy.close()
    store = StudyStore(path)
    assert store.connection.execute('SELECT teacher_id FROM teachers').fetchone()[0] == 'legacy-tutor'
    teacher = store.create_principal('tutor-test', 'teacher')
    store.create_edition(teacher, 'fluidi')
    backup = tmp_path / 'backup.sqlite'
    store.backup(backup)
    restored = StudyStore(backup)
    assert restored.get_edition('fluidi')['teacherId'] == teacher.id
    assert restored.connection.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
    assert restored.connection.execute('PRAGMA user_version').fetchone()[0] == 10


def test_foreign_keys_and_forward_schema_guard(tmp_path):
    store, *_ = setup_store(tmp_path)
    with pytest.raises(sqlite3.IntegrityError):
        with store.transaction() as connection:
            connection.execute("INSERT INTO study_members(edition_id, student_id) VALUES('missing','missing')")
    store.connection.execute('UPDATE study_schema SET version=999')
    store.connection.commit()
    with pytest.raises(StudyError, match='newer_schema'):
        StudyStore(store.path)
