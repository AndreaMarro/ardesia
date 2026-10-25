"""Original-byte uploads have durable intent before external I/O.

Injected infrastructure failure tests the actual shared command/transaction;
no parallel upload implementation is supplied by the test.
"""
from contextlib import contextmanager
from io import BytesIO
from PIL import Image
import pytest
import sqlite3
from lessonos.study.assets import upload_asset
from lessonos.study.store import StudyStore
from test_identity_store import setup_store


class BlobFaults:
    is_local = False

    def __init__(self, store, fail_remove=False):
        self.store = store
        self.objects = {}
        self.fail_remove = fail_remove

    def put(self, blob_id, data, mime):
        other = sqlite3.connect(self.store.path)
        other.row_factory = sqlite3.Row
        try:
            intent = other.execute('SELECT state FROM study_upload_intents WHERE id=?', (blob_id,)).fetchone()
            assert intent is not None and intent['state'] == 'pending', 'intent must be committed before put'
        finally:
            other.close()
        self.objects[blob_id] = data

    def remove(self, blob_id):
        if self.fail_remove:
            raise OSError('synthetic provider outage')
        self.objects.pop(blob_id, None)


def png():
    data = BytesIO()
    Image.new('RGB', (4, 4), 'white').save(data, format='PNG')
    return data.getvalue()


def reject_metadata(store):
    original = store.transaction

    class ConnectionFault:
        def __init__(self, connection):
            self.connection = connection

        def execute(self, sql, parameters=()):
            if sql.startswith('INSERT INTO study_assets'):
                raise RuntimeError('synthetic metadata failure')
            return self.connection.execute(sql, parameters)

    @contextmanager
    def failing():
        with original() as c:
            yield ConnectionFault(c)

    store.transaction = failing
    return original


def test_failed_compensation_retains_intent_and_recovery_removes_only_the_orphan(tmp_path):
    store, tutor, student, *_ = setup_store(tmp_path)
    blobs = BlobFaults(store, fail_remove=True)
    store.blobs = blobs
    original = reject_metadata(store)
    with pytest.raises(RuntimeError, match='synthetic metadata failure'):
        upload_asset(store, student, 'fluidi', png(), 'image/png', tmp_path / 'blobs')
    store.transaction = original
    assert store.connection.execute('SELECT COUNT(*) FROM study_assets').fetchone()[0] == 0
    intent = store.connection.execute('SELECT * FROM study_upload_intents').fetchone()
    assert intent['state'] == 'cleanup_required' and intent['id'] in blobs.objects
    from lessonos.study.uploads import recover_uploads
    blobs.fail_remove = False
    result = recover_uploads(store, blobs)
    assert result == {'cleaned': 1, 'failed': 0, 'skipped': 0}
    assert not blobs.objects
    assert store.connection.execute('SELECT COUNT(*) FROM study_upload_intents').fetchone()[0] == 0
    assert recover_uploads(store, blobs)['cleaned'] == 0


def test_completed_original_is_never_a_recovery_candidate(tmp_path):
    store, tutor, student, *_ = setup_store(tmp_path)
    blobs = BlobFaults(store)
    store.blobs = blobs
    result = upload_asset(store, student, 'fluidi', png(), 'image/png', tmp_path / 'blobs')
    from lessonos.study.uploads import recover_uploads
    assert recover_uploads(store, blobs)['cleaned'] == 0
    assert result['id'] in blobs.objects
    assert store.connection.execute('SELECT state FROM study_upload_intents').fetchone()[0] == 'committed'


def test_interrupted_upload_is_recovered_after_lease_but_active_work_is_retained(tmp_path):
    from lessonos.study.uploads import begin_upload, recover_uploads
    from lessonos.study.store import identifier
    store, tutor, student, *_ = setup_store(tmp_path)
    store.clock = lambda: 100
    blobs = BlobFaults(store)
    asset_id = identifier()
    begin_upload(store, student, 'fluidi', asset_id)
    blobs.put(asset_id, png(), 'image/png')
    # Simulate the persisted state left by process death, without compensation.
    assert recover_uploads(store, blobs)['cleaned'] == 0
    store.close()
    reopened = StudyStore(tmp_path / 'study.sqlite', clock=lambda: 701)
    blobs.store = reopened
    blobs.fail_remove = True
    assert recover_uploads(reopened, blobs) == {'cleaned': 0, 'failed': 1, 'skipped': 0}
    assert reopened.connection.execute('SELECT COUNT(*) FROM study_upload_intents').fetchone()[0] == 1
    blobs.fail_remove = False
    assert recover_uploads(reopened, blobs)['cleaned'] == 1
    assert asset_id not in blobs.objects


def test_completed_upload_retry_returns_same_original_and_rejects_changed_bytes(tmp_path):
    from lessonos.study.models import StudyError
    store, tutor, student, *_ = setup_store(tmp_path)
    blobs = BlobFaults(store)
    store.blobs = blobs
    first = upload_asset(store, student, 'fluidi', png(), 'image/png', tmp_path / 'blobs', key='same-upload')
    retry = upload_asset(store, student, 'fluidi', png(), 'image/png', tmp_path / 'blobs', key='same-upload')
    assert retry == first
    assert len(blobs.objects) == 1
    assert store.connection.execute('SELECT COUNT(*) FROM study_assets').fetchone()[0] == 1
    different = BytesIO()
    Image.new('RGB', (4, 4), 'black').save(different, format='PNG')
    with pytest.raises(StudyError, match='idempotency_conflict'):
        upload_asset(store, student, 'fluidi', different.getvalue(), 'image/png', tmp_path / 'blobs', key='same-upload')
    assert len(blobs.objects) == 1
