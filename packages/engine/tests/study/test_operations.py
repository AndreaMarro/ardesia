import io,json,threading,concurrent.futures
from pathlib import Path
from PIL import Image
import pytest
from test_identity_store import setup_store
from test_context_memory import reviewed_source
from lessonos.study.store import StudyStore,digest
from lessonos.study.assets import upload_asset,read_asset
from lessonos.study.submissions import submit,list_submissions
from lessonos.study.context import rebuild_projection
from legacy_exam_fixture import insert_historical_attempt


def operation():
    from lessonos.study import operations
    return operations


def setup_data(tmp_path):
    store,tutor,student,peer,*_=setup_store(tmp_path/'data')
    resource,review=reviewed_source(store,tutor,student)
    image=io.BytesIO();Image.new('RGB',(2,2)).save(image,format='PNG')
    asset=upload_asset(store,student,'fluidi',image.getvalue(),'image/png',store.path.parent/'blobs')
    submit(store,student,'fluidi','poiseuille-v1',[asset['id']],'private attachment','image')
    store.create_resource(peer,'fluidi','notes','peer remains')
    token=store.issue_session(student)
    return store,tutor,student,peer,asset,token


def test_backup_restore_verifies_bytes_and_revokes_access(tmp_path):
    ops=operation();store,tutor,student,peer,asset,token=setup_data(tmp_path)
    source=store.path.parent;backup=tmp_path/'backup'
    result=ops.backup_data(source,backup)
    assert result['databaseIntegrity']=='ok' and result['verifiedBlobs']==1
    restored=tmp_path/'restored'
    ops.restore_data(backup,restored,source/'erasure-ledger.json')
    reopened=StudyStore(restored/'study.sqlite')
    assert reopened.principal_for_session(token) is None
    assert len(list_submissions(reopened,student,'fluidi'))==2
    assert read_asset(reopened,student,asset['id'],restored/'blobs')[0]
    assert not (restored/'demo-access.json').exists()
    (backup/'blobs'/asset['id']).write_bytes(b'corruption')
    with pytest.raises(ValueError,match='integrity'):ops.restore_data(backup,tmp_path/'bad',source/'erasure-ledger.json')
    assert not (tmp_path/'bad').exists()


def test_erasure_removes_history_derivatives_assets_and_survives_old_restore(tmp_path):
    ops=operation();store,tutor,student,peer,asset,token=setup_data(tmp_path)
    insert_historical_attempt(store,student)
    source=store.path.parent;backup=tmp_path/'before-erasure'
    ops.backup_data(source,backup)
    preview=ops.erase_student(source,student.id,apply=False)
    assert preview['submissions']==2 and preview['resources']==2
    assert preview['examAttempts']==1
    assert store.principal_for_session(token)
    ops.erase_student(source,student.id,apply=True)
    assert store.principal_for_session(token) is None
    assert not (source/'blobs'/asset['id']).exists()
    rebuild_projection(store)
    dump='\n'.join(store.connection.iterdump())
    assert 'private attachment' not in dump and 'Verifica la quarta potenza' not in dump
    assert 'peer remains' in dump
    assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0]==0
    assert store.connection.execute('SELECT COUNT(*) FROM study_exam_attempts').fetchone()[0]==0
    ops.restore_data(backup,tmp_path/'after',source/'erasure-ledger.json')
    restored=StudyStore(tmp_path/'after/study.sqlite')
    assert restored.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0]==0
    assert restored.connection.execute('SELECT COUNT(*) FROM study_exam_attempts').fetchone()[0]==0
    assert 'private attachment' not in '\n'.join(restored.connection.iterdump())
    assert not (tmp_path/'after/blobs'/asset['id']).exists()
    with pytest.raises(ValueError,match='erased_identity'):restored.create_principal(student.id,'student')


def test_erasure_intent_recovers_after_interrupt_and_rejects_legacy_scope(tmp_path):
    ops=operation();store,_,student,*_=setup_data(tmp_path)
    source=store.path.parent
    # A crash after durable intent, before DB work: resume explicitly replays it.
    (source/'erasure-ledger.json').write_text(json.dumps({'version':1,'actors':[student.id]}))
    ops.resume_erasures(source)
    assert not store.connection.execute('SELECT 1 FROM study_principals WHERE id=?',(student.id,)).fetchone()
    store2,tutor2,student2,*_=setup_store(tmp_path/'other')
    store2.connection.execute("INSERT INTO enrollments VALUES('legacy','outside',?)",(student2.id,));store2.connection.commit()
    with pytest.raises(ValueError,match='legacy_scope'):ops.erase_student(store2.path.parent,student2.id,apply=True)
    assert store2.principal_for_session(store2.issue_session(student2))==student2


def test_backup_waits_for_asset_transaction_lock_and_health_checks_blob(tmp_path):
    ops=operation();store,_,student,_,asset,_=setup_data(tmp_path)
    source=store.path.parent
    from lessonos.study.lock import data_lock
    started=threading.Event()
    def backup():
        started.set();return ops.backup_data(source,tmp_path/'locked-backup')
    with concurrent.futures.ThreadPoolExecutor(1) as pool:
        with data_lock(store.path):
            future=pool.submit(backup);assert started.wait(1)
            assert not future.done()
        assert future.result()['verifiedBlobs']==1
    assert ops.check_data(source)['ok']
    (source/'blobs'/asset['id']).write_bytes(b'bad')
    assert ops.check_data(source)['ok'] is False


def test_restore_requires_current_ledger_and_rejects_traversal(tmp_path):
    ops=operation();store,*_=setup_data(tmp_path)
    source=store.path.parent;backup=tmp_path/'backup'
    ops.backup_data(source,backup)
    with pytest.raises(FileNotFoundError):ops.restore_data(backup,tmp_path/'without',tmp_path/'missing-ledger')
    manifest=json.loads((backup/'backup-manifest.json').read_text());manifest['files']['../escape']='x'
    (backup/'backup-manifest.json').write_text(json.dumps(manifest))
    with pytest.raises(ValueError,match='integrity'):ops.restore_data(backup,tmp_path/'escape',source/'erasure-ledger.json')
    assert not (tmp_path/'escape').exists()


def test_erasure_never_removes_a_legacy_only_student(tmp_path):
    ops=operation();store,*_=setup_store(tmp_path/'data')
    c=store.connection
    c.execute("INSERT INTO students VALUES('legacy-only')")
    c.execute("INSERT INTO classes VALUES('legacy-class','legacy-teacher','legacy')")
    c.execute("INSERT INTO enrollments VALUES('legacy-enrollment','legacy-class','legacy-only')");c.commit()
    for apply in (False,True):
        with pytest.raises(ValueError,match='legacy_scope'):ops.erase_student(store.path.parent,'legacy-only',apply=apply)
    assert c.execute("SELECT 1 FROM students WHERE student_id='legacy-only'").fetchone()
    assert c.execute("SELECT 1 FROM enrollments WHERE enrollment_id='legacy-enrollment'").fetchone()
    assert not (store.path.parent/'erasure-ledger.json').exists()


@pytest.mark.parametrize('action',['health','backup'])
def test_integrity_operations_refuse_truncated_database_without_initializing_it(tmp_path,action):
    ops=operation();store,*_=setup_store(tmp_path/'data');source=store.path.parent;store.close()
    (source/'study.sqlite').write_bytes(b'')
    if action=='health':assert ops.check_data(source)['ok'] is False
    else:
        with pytest.raises(ValueError,match='integrity'):ops.backup_data(source,tmp_path/'backup-empty')
        assert not (tmp_path/'backup-empty').exists()
    assert (source/'study.sqlite').read_bytes()==b''


def test_erasure_rejects_symlinked_blob_directory_before_any_mutation(tmp_path):
    ops=operation();store,_,student,*_=setup_store(tmp_path/'data');source=store.path.parent
    store.create_resource(student,'fluidi','notes','must remain')
    outside=tmp_path/'outside';outside.mkdir();external=outside/('a'*32);external.write_bytes(b'unrelated')
    (source/'blobs').symlink_to(outside,target_is_directory=True)
    before='\n'.join(store.connection.iterdump())
    with pytest.raises(ValueError,match='blob_integrity'):ops.erase_student(source,student.id,apply=True)
    assert external.read_bytes()==b'unrelated'
    assert '\n'.join(store.connection.iterdump())==before
    assert not (source/'erasure-ledger.json').exists()


def test_erasure_removes_tutor_source_hint_receipt_and_event_but_preserves_peer(tmp_path):
    ops=operation();store,tutor,student,peer,*_=setup_store(tmp_path/'data')
    from lessonos.study.ai_jobs import request_hint
    source=store.create_resource(student,'fluidi','notes','source to erase')
    peer_source=store.create_resource(peer,'fluidi','notes','peer source preserved')
    from lessonos.study.submissions import submit
    for actor, resource in ((student, source), (peer, peer_source)):
        submit(store,actor,'fluidi','poiseuille-v1',[],'Submitted for tutor review','share-source',
               source_refs=[{'resourceId':resource['id'],'revisionId':resource['revisionId']}])
    removed=request_hint(store,tutor,source['id'],1,'tutor-hint')
    preserved=request_hint(store,tutor,peer_source['id'],1,'peer-hint')
    ops.erase_student(store.path.parent,student.id,apply=True)
    receipts=[json.loads(row[0]) for row in store.connection.execute('SELECT body FROM study_receipts')]
    assert removed not in receipts and preserved in receipts
    dump='\n'.join(store.connection.iterdump())
    assert source['id'] not in dump and source['revisionId'] not in dump
    assert peer_source['id'] in dump
