"""Atomic source/capsule revisions on real SQLite files and processes."""
import json
import multiprocessing
import os
import sqlite3

import pytest

from lessonos.models.entities import Segment
from lessonos.store.base import LessonRevisionConflict
from lessonos.store.sqlite import SQLiteStore, SCHEMA_VERSION
from tests.test_bundle_publication import L, seed, pair, incoming, router_for
from lessonos.ingest.bundle import ingest_bundle


def candidate(text='winner'):
    return (Segment(f'{L}#s1', L, 0, 0, text),), json.dumps({'lesson_id': L, 'marker': text})


def test_two_stagers_only_one_publishes(tmp_path):
    db = str(tmp_path / 'lesson.db')
    first, second = SQLiteStore(db), SQLiteStore(db)
    try:
        seed(first)
        a, b = first.read_lesson_revision(L), second.read_lesson_revision(L)
        result = first.publish_lesson_revision(a, *candidate())
        assert result.revision > a.revision
        with pytest.raises(LessonRevisionConflict):
            second.publish_lesson_revision(b, *candidate('stale'))
        assert second.read_lesson_revision(L) == result
    finally:
        first.close(); second.close()


def test_legacy_aba_writes_still_invalidate_preparation(tmp_path):
    db = str(tmp_path / 'lesson.db')
    first, second = SQLiteStore(db), SQLiteStore(db)
    try:
        seed(first)
        a = first.read_lesson_revision(L)
        second.save_segment(candidate('temporary')[0][0])
        for segment in a.segments: second.save_segment(segment)
        second.save_capsule(L, a.capsule_data)
        assert pair(second) == ([s.text for s in a.segments], a.capsule_data)
        with pytest.raises(LessonRevisionConflict):
            first.publish_lesson_revision(a, *candidate('stale'))
    finally:
        first.close(); second.close()


@pytest.mark.parametrize('recreate', [False, True])
def test_erasure_invalidates_preparation_and_removes_identifying_token(tmp_path, recreate):
    db = str(tmp_path / 'lesson.db')
    first, second = SQLiteStore(db), SQLiteStore(db)
    try:
        seed(first)
        a = first.read_lesson_revision(L)
        second.purge_lesson(L)
        assert second._conn.execute('SELECT COUNT(*) FROM lesson_revisions WHERE lesson_id = ?', (L,)).fetchone()[0] == 0
        assert second.purge_lesson(L) == 0
        if recreate: seed(second)
        with pytest.raises(LessonRevisionConflict):
            first.publish_lesson_revision(a, *candidate('stale resurrection'))
    finally:
        first.close(); second.close()


def test_erasure_even_during_first_preparation_invalidates_absence(tmp_path):
    db = str(tmp_path / 'lesson.db')
    first, second = SQLiteStore(db), SQLiteStore(db)
    try:
        absent = first.read_lesson_revision(L)
        assert absent.segments == () and absent.capsule_data is None
        second.purge_lesson(L)
        with pytest.raises(LessonRevisionConflict):
            first.publish_lesson_revision(absent, *candidate())
    finally:
        first.close(); second.close()


def test_same_lesson_writer_during_router_work_wins_without_clobber(tmp_path):
    db = str(tmp_path / 'lesson.db')
    first, second = SQLiteStore(db), SQLiteStore(db)
    try:
        seed(first)
        path, segments = incoming(tmp_path)
        called = False
        def compete():
            nonlocal called
            if not called:
                second.publish_lesson_revision(second.read_lesson_revision(L), *candidate('concurrent winner'))
                called = True
        with pytest.raises(LessonRevisionConflict):
            ingest_bundle(path, first, L, router=router_for(segments, compete))
        assert pair(second)[0] == ['concurrent winner']
        assert json.loads(second.get_capsule(L))['marker'] == 'concurrent winner'
    finally:
        first.close(); second.close()


def test_transaction_failure_rolls_back_source_capsule_and_token(tmp_path):
    db = str(tmp_path / 'lesson.db')
    writer, observer = SQLiteStore(db), SQLiteStore(db)
    try:
        seed(writer)
        before = observer.read_lesson_revision(L)
        writer._conn.execute("CREATE TRIGGER synthetic_failure BEFORE INSERT ON capsules BEGIN SELECT RAISE(ABORT, 'synthetic capsule failure'); END;")
        with pytest.raises(sqlite3.IntegrityError, match='synthetic capsule failure'):
            writer.publish_lesson_revision(before, *candidate())
        assert not writer._in_transaction
        assert observer.read_lesson_revision(L) == before
    finally:
        writer.close(); observer.close()


@pytest.mark.parametrize('bad', ['foreign_lesson', 'duplicate', 'foreign_segment', 'empty'])
def test_scope_errors_leave_both_lessons_untouched(tmp_path, bad):
    store = SQLiteStore(str(tmp_path / 'lesson.db'))
    try:
        seed(store)
        store.save_segment(Segment('foreign', 'other', 0, 0, 'other source'))
        before = store.read_lesson_revision(L)
        rows, capsule = candidate()
        if bad == 'foreign_lesson': rows = (Segment('x', 'other', 0, 0, 'bad'),)
        elif bad == 'duplicate': rows = rows + rows
        elif bad == 'foreign_segment': rows = (Segment('foreign', L, 0, 0, 'bad'),)
        elif bad == 'empty': rows = ()
        with pytest.raises(ValueError):
            store.publish_lesson_revision(before, rows, capsule)
        assert store.read_lesson_revision(L) == before
        assert store.get_segment('foreign').lesson_id == 'other'
    finally: store.close()


def test_v10_migration_preserves_data_and_assigns_existing_lesson_token(tmp_path):
    db = str(tmp_path / 'v10.db')
    conn = sqlite3.connect(db)
    conn.executescript('''
    CREATE TABLE segments(seg_id TEXT PRIMARY KEY,lesson_id TEXT,start INTEGER,"end" INTEGER,text TEXT);
    CREATE TABLE capsules(lesson_id TEXT PRIMARY KEY,capsule_data TEXT,created_at TEXT DEFAULT 'historical');
    INSERT INTO segments VALUES('old#s1','old',0,1,'old text');
    INSERT INTO capsules(lesson_id,capsule_data) VALUES('old','{"marker":"original"}');
    PRAGMA user_version=10;
    ''')
    conn.close()
    store = SQLiteStore(db)
    try:
        before = store.read_lesson_revision('old')
        assert before.revision > 0
        assert before.segments[0].text == 'old text'
        assert before.capsule_data == '{"marker":"original"}'
        store.save_segment(Segment('unrelated', 'other', 0, 0, 'other'))
        assert store.read_lesson_revision('old') == before
        assert store._conn.execute('PRAGMA user_version').fetchone()[0] == SCHEMA_VERSION
    finally: store.close()


def test_foreign_legacy_segment_move_invalidates_both_lessons(tmp_path):
    store = SQLiteStore(str(tmp_path / 'lesson.db'))
    try:
        seed(store)
        before = store.read_lesson_revision(L)
        store.save_segment(Segment(f'{L}#s1', 'other', 0, 0, 'moved'))
        with pytest.raises(LessonRevisionConflict):
            store.publish_lesson_revision(before, *candidate())
    finally: store.close()


def test_read_snapshot_stays_coherent_when_writer_commits_between_selects(tmp_path):
    db = str(tmp_path / 'wal.db')
    writer = SQLiteStore(db)
    writer._conn.execute('PRAGMA journal_mode=WAL')
    seed(writer)
    before = writer.read_lesson_revision(L)
    class InterleavedReader(SQLiteStore):
        def segments_for_lesson(self, lid):
            result = super().segments_for_lesson(lid)
            writer.publish_lesson_revision(writer.read_lesson_revision(lid), *candidate('new during read'))
            return result
    reader = InterleavedReader(db)
    try:
        assert reader.read_lesson_revision(L) == before
        assert writer.read_lesson_revision(L).segments[0].text == 'new during read'
    finally: reader.close(); writer.close()


def test_nested_publication_does_not_commit_callers_transaction(tmp_path):
    store = SQLiteStore(str(tmp_path / 'nested.db'))
    try:
        seed(store); before = store.read_lesson_revision(L)
        store.begin_transaction()
        with pytest.raises(RuntimeError, match='nested'):
            store.publish_lesson_revision(before, *candidate())
        assert store._in_transaction and store._conn.in_transaction
        store.rollback_transaction()
        assert store.read_lesson_revision(L) == before
    finally: store.close()


@pytest.mark.parametrize('transaction', ['explicit', 'implicit'])
def test_revision_read_refuses_uncommitted_token_and_preserves_caller_transaction(tmp_path, transaction):
    db = str(tmp_path / 'uncommitted.db')
    first, second = SQLiteStore(db), SQLiteStore(db)
    try:
        seed(first)
        committed = first.read_lesson_revision(L)
        if transaction == 'explicit':
            first.begin_transaction()
            first.save_segment(candidate('rolled back')[0][0])
        else:
            first._conn.execute('UPDATE segments SET text = ? WHERE lesson_id = ?', ('rolled back', L))
        # Rolled-back AUTOINCREMENT values may be reused by the next writer.
        # Such a token must never escape as a committed publication precondition.
        with pytest.raises(RuntimeError, match='transaction'):
            first.read_lesson_revision(L)
        assert first._conn.in_transaction
        assert first.segments_for_lesson(L)[0].text == 'rolled back'
        if transaction == 'explicit':
            assert first._in_transaction
            first.rollback_transaction()
        else:
            first._conn.rollback()
        second.save_segment(candidate('concurrent committed')[0][0])
        with pytest.raises(LessonRevisionConflict):
            first.publish_lesson_revision(committed, *candidate('stale'))
        assert second.segments_for_lesson(L)[0].text == 'concurrent committed'
    finally:
        first.close(); second.close()


def test_failed_migration_preserves_original_rows_and_version(tmp_path):
    db = str(tmp_path / 'broken-v10.db')
    conn = sqlite3.connect(db)
    conn.executescript('''
    CREATE TABLE capsules(lesson_id TEXT PRIMARY KEY,capsule_data TEXT);
    INSERT INTO capsules VALUES('old','original');
    CREATE TABLE lesson_revisions(unexpected TEXT);
    PRAGMA user_version=10;
    '''); conn.close()
    with pytest.raises(sqlite3.OperationalError): SQLiteStore(db)
    reopened = sqlite3.connect(db)
    try:
        assert reopened.execute('PRAGMA user_version').fetchone()[0] == 10
        assert reopened.execute('SELECT capsule_data FROM capsules').fetchone()[0] == 'original'
        assert reopened.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='trigger'").fetchone()[0] == 0
    finally: reopened.close()


def _exit_at_publication(db, phase):
    class Crash(SQLiteStore):
        def delete_segments_for_lesson(self, lid):
            result = super().delete_segments_for_lesson(lid)
            if phase == 'delete': os._exit(73)
            return result
        def save_capsule(self, lid, data):
            super().save_capsule(lid, data)
            if phase == 'capsule': os._exit(73)
        def commit_transaction(self):
            super().commit_transaction()
            if phase == 'commit': os._exit(73)
    store = Crash(db)
    store.publish_lesson_revision(store.read_lesson_revision(L), *candidate('new committed'))


@pytest.mark.parametrize('phase', ['delete', 'capsule', 'commit'])
def test_process_exit_leaves_old_pair_or_committed_new_pair(tmp_path, phase):
    db = str(tmp_path / 'crash.db')
    store = SQLiteStore(db); seed(store); before = pair(store); store.close()
    child = multiprocessing.get_context('spawn').Process(target=_exit_at_publication, args=(db, phase))
    child.start(); child.join(10)
    if child.is_alive(): child.terminate(); child.join(); pytest.fail('publication child did not terminate')
    assert child.exitcode == 73
    reopened = SQLiteStore(db)
    try:
        observed = reopened.read_lesson_revision(L)
        if phase == 'commit':
            assert [s.text for s in observed.segments] == ['new committed']
            assert json.loads(observed.capsule_data)['marker'] == 'new committed'
        else:
            assert ([s.text for s in observed.segments], observed.capsule_data) == before
    finally: reopened.close()


def _pause_during_publication(db, ready, release):
    class Pause(SQLiteStore):
        def save_segment(self, segment):
            super().save_segment(segment)
            ready.set()
            if not release.wait(10): raise RuntimeError('observer did not release publication')
    store = Pause(db)
    store.publish_lesson_revision(store.read_lesson_revision(L), *candidate('published'))
    store.close()


def test_other_connection_reads_old_pair_while_writer_is_between_rows(tmp_path):
    db = str(tmp_path / 'paused.db')
    store = SQLiteStore(db); seed(store); before = store.read_lesson_revision(L); store.close()
    ctx = multiprocessing.get_context('spawn'); ready, release = ctx.Event(), ctx.Event()
    child = ctx.Process(target=_pause_during_publication, args=(db, ready, release))
    child.start()
    observer = SQLiteStore(db)
    try:
        assert ready.wait(10)
        assert observer.read_lesson_revision(L) == before
    finally:
        release.set(); child.join(10); observer.close()
        if child.is_alive(): child.terminate(); child.join(); pytest.fail('paused publication did not finish')
    assert child.exitcode == 0
    reopened = SQLiteStore(db)
    try:
        state = reopened.read_lesson_revision(L)
        assert [s.text for s in state.segments] == ['published']
        assert json.loads(state.capsule_data)['marker'] == 'published'
    finally: reopened.close()
