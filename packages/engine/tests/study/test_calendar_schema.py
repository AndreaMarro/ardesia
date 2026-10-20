"""V2 upgrade is explicit; a V3 adapter-table loss must never look empty."""
import json,sqlite3
import pytest
from lessonos.study.store import StudyStore,digest
from lessonos.study.models import StudyError
from lessonos.study.operations import backup_data,restore_data,check_data,_existing_database
from test_identity_store import setup_store

TABLES=('study_calendar_deliveries','study_calendar_cache','study_calendar_mappings','study_calendar_intents','study_calendar_targets')


def legacy_backup(tmp_path,version):
    source=tmp_path/'source';store,*_=setup_store(source);store.close()
    backup=tmp_path/'backup';backup_data(source,backup)
    with sqlite3.connect(backup/'study.sqlite') as c:
        for table in TABLES:c.execute('DROP TABLE '+table)
        c.execute('UPDATE study_schema SET version=?',(version,))
    c.close()  # checkpoint the fixture before hashing/copying its main file
    path=backup/'backup-manifest.json';manifest=json.loads(path.read_text())
    manifest['files']['study.sqlite']=digest((backup/'study.sqlite').read_bytes())
    manifest['files'].pop('study.sqlite-wal',None);manifest['files'].pop('study.sqlite-shm',None)
    path.write_text(json.dumps(manifest))
    ledger=tmp_path/'current-erasure.json';ledger.write_text(json.dumps({'version':1,'actors':['student-01']}))
    return backup,ledger


def test_v2_verified_backup_upgrades_and_replays_current_erasure_ledger(tmp_path):
    backup,ledger=legacy_backup(tmp_path,2)
    before=(backup/'study.sqlite').read_bytes()
    checked=_existing_database(backup);assert checked.execute('SELECT version FROM study_schema').fetchone()[0]==2;checked.close()
    assert (backup/'study.sqlite').read_bytes()==before
    result=restore_data(backup,tmp_path/'restored',ledger)
    assert result['restored'] and result['erasureReplay']==1
    store=StudyStore(tmp_path/'restored'/'study.sqlite')
    assert store.connection.execute('SELECT version FROM study_schema').fetchone()[0]==3
    assert store.connection.execute('SELECT 1 FROM study_principals WHERE id=?',('student-01',)).fetchone() is None
    assert all(store.connection.execute('SELECT COUNT(*) FROM '+table).fetchone()[0]==0 for table in TABLES)
    store.close()


def test_v3_missing_calendar_tables_fail_health_restore_and_constructor_without_repair(tmp_path):
    backup,ledger=legacy_backup(tmp_path,3)
    assert not check_data(backup)['ok']
    with pytest.raises(ValueError,match='database_integrity_schema'):restore_data(backup,tmp_path/'restored',ledger)
    before=(backup/'study.sqlite').read_bytes()
    with pytest.raises(StudyError,match='database_integrity_failure'):StudyStore(backup/'study.sqlite')
    assert (backup/'study.sqlite').read_bytes()==before
    assert not (tmp_path/'restored').exists()
