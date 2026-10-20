"""A course pack is pinned to an edition, never inferred from an activity ID."""
import json
import pytest
from lessonos.study.models import StudyError
from lessonos.study.store import StudyStore
from test_identity_store import setup_store


def test_legacy_database_backfills_binding_without_rewriting_facts(tmp_path):
    store, tutor, student, *_ = setup_store(tmp_path)
    source = store.create_resource(student, 'fluidi', 'notes', 'Originale precedente al binding.')
    # This is a database with the previous schema; no new binding rows exist.
    store.connection.execute('DROP TABLE IF EXISTS study_edition_packs')
    store.close()
    reopened = StudyStore(tmp_path / 'study.sqlite')
    assert reopened.get_edition('fluidi')['packId'] == 'relazioni-fluidi-v1'
    assert reopened.get_resource(student, source['id']) == source
    assert reopened.connection.execute('SELECT COUNT(*) FROM study_edition_packs').fetchone()[0] == 1
    reopened.close()
    again = StudyStore(tmp_path / 'study.sqlite')
    assert again.connection.execute('SELECT COUNT(*) FROM study_edition_packs').fetchone()[0] == 1
    again.close()


def test_analysis_binding_and_source_share_the_existing_database(tmp_path):
    store, tutor, student, *_ = setup_store(tmp_path)
    edition = store.create_edition(tutor, 'analisi', course_id='analisi-1', pack_id='taylor-exp-v1')
    store.add_test_member(tutor, 'analisi', student.id)
    source = store.create_resource(student, 'analisi', 'notes', 'Il fattoriale non è una potenza.')
    assert edition['courseId'] == 'analisi-1'
    assert edition['packId'] == 'taylor-exp-v1' and edition['packVersion'] == 1
    assert len(edition['packSha256']) == 64
    assert store.get_resource(student, source['id'])['editionId'] == 'analisi'
    assert list(tmp_path.glob('*.sqlite')) == [store.path]
    assert store.connection.execute('SELECT COUNT(*) FROM study_editions').fetchone()[0] == 2
    store.close()


@pytest.mark.parametrize('options', [
    {'pack_id': '../private'}, {'pack_id': 'missing'}, {'pack_version': 2},
    {'pack_version': True}, {'course_id': 'analisi-1'}, {'pack_id': []},
])
def test_invalid_course_binding_leaves_no_edition_or_class(tmp_path, options):
    store, tutor, *_ = setup_store(tmp_path)
    with pytest.raises(StudyError):
        store.create_edition(tutor, 'bad-binding', **options)
    assert store.connection.execute("SELECT 1 FROM study_editions WHERE id='bad-binding'").fetchone() is None
    assert store.connection.execute("SELECT 1 FROM classes WHERE class_id='bad-binding'").fetchone() is None
    store.close()


def test_corrupt_persisted_pin_fails_closed_without_repair(tmp_path):
    store, tutor, *_ = setup_store(tmp_path)
    with store.transaction() as connection:
        connection.execute("UPDATE study_edition_packs SET pack_sha256=? WHERE edition_id='fluidi'", ('0'*64,))
    with pytest.raises(StudyError, match='coursepack_unavailable'):
        store.get_edition('fluidi')
    store.close()
    reopened = StudyStore(tmp_path / 'study.sqlite')
    with pytest.raises(StudyError, match='coursepack_unavailable'):
        reopened.get_edition('fluidi')
    reopened.close()


def test_lost_binding_after_upgrade_is_not_silently_repaired_as_physics(tmp_path):
    store, tutor, student, *_ = setup_store(tmp_path)
    store.create_edition(tutor,'analisi',course_id='analisi-1',pack_id='taylor-exp-v1')
    with store.transaction() as connection:
        connection.execute("DELETE FROM study_edition_packs WHERE edition_id='analisi'")
    store.close()
    reopened=StudyStore(tmp_path/'study.sqlite')
    with pytest.raises(StudyError,match='coursepack_unavailable'):
        reopened.get_edition('analisi')
    reopened.close()


def test_restore_prebinding_backup_replays_current_erasure_ledger(tmp_path):
    """A new metadata table must not make an old, verified backup unrestorable."""
    import sqlite3
    from lessonos.study.operations import backup_data, restore_data
    from lessonos.study.store import digest
    store,tutor,student,peer,*_=setup_store(tmp_path/'source')
    store.create_resource(student,'fluidi','notes','Da cancellare al restore.')
    store.close()
    backup=tmp_path/'old-backup'
    backup_data(tmp_path/'source',backup)
    with sqlite3.connect(backup/'study.sqlite') as connection:
        connection.execute('DROP TABLE study_edition_packs')
    connection.close()
    manifest_path=backup/'backup-manifest.json'
    manifest=json.loads(manifest_path.read_text())
    manifest['files']['study.sqlite']=digest((backup/'study.sqlite').read_bytes())
    # A closed, checkpointed SQLite backup does not need transient WAL/SHM.
    manifest['files'].pop('study.sqlite-wal',None)
    manifest['files'].pop('study.sqlite-shm',None)
    manifest_path.write_text(json.dumps(manifest))
    ledger=tmp_path/'current-erasure.json'
    ledger.write_text(json.dumps({'version':1,'actors':[student.id]}))
    assert not [ref for ref,expected in manifest['files'].items() if not (backup/ref).exists() or digest((backup/ref).read_bytes())!=expected]
    result=restore_data(backup,tmp_path/'restored',ledger)
    assert result['restored'] and result['erasureReplay']==1
    restored=StudyStore(tmp_path/'restored'/'study.sqlite')
    assert restored.connection.execute('SELECT 1 FROM study_principals WHERE id=?',(student.id,)).fetchone() is None
    assert restored.connection.execute('SELECT 1 FROM study_principals WHERE id=?',(peer.id,)).fetchone() is not None
    assert restored.get_edition('fluidi')['packId']=='relazioni-fluidi-v1'
    restored.close()
