"""Real file-backed publication: preparation must not expose mixed state."""
import json
import zipfile

import pytest

from lessonos.capsule.extraction import build_extraction_prompt
from lessonos.capsule.segmentation import build_segmentation_prompt
from lessonos.ingest.bundle import ingest_bundle, journal_to_segments
from lessonos.llm.router import MockProvider, Router
from lessonos.models.entities import Lesson, Moment, Path, Segment, Source
from lessonos.models.ledger import CostLedgerEntry
from lessonos.store.sqlite import SQLiteStore

L = 'atomic-synthetic'


def seed(store):
    store.save_segment(Segment(f'{L}#s1', L, 0, 0, 'old source'))
    store.save_capsule(L, json.dumps({'lesson_id': L, 'marker': 'old capsule'}))


def pair(store):
    return ([s.text for s in store.segments_for_lesson(L)], store.get_capsule(L))


def incoming(tmp_path):
    events = json.dumps({'t': 1000, 'type': 'element.add',
                         'element': {'id': 't1', 'type': 'text', 'text': 'new source'}})
    path = tmp_path / 'incoming.lesson'
    with zipfile.ZipFile(path, 'w') as zf:
        zf.writestr('raw/events.jsonl', events)
    return str(path), journal_to_segments(events, L)


def router_for(segments, hook=None):
    router = Router()
    first = segments[0]
    fixtures = {
        build_segmentation_prompt(segments): json.dumps([{'topic': 'new topic', 'seg_ids': [first.seg_id]}]),
        build_extraction_prompt(segments): json.dumps({
            'concepts': [{'name': 'new concept', 'status': 'introduced',
                          'citations': [{'seg_id': first.seg_id, 'excerpt': first.text}]}],
            'exercises': [], 'student_questions': [], 'homework': [],
        }),
    }
    class Observe(MockProvider):
        def complete(self, prompt, **kwargs):
            if hook is not None:
                hook()
            return super().complete(prompt, **kwargs)
    router.register(Observe(fixtures))
    return router


def test_preparation_exposes_only_previous_committed_pair_and_holds_no_lock(tmp_path):
    db = str(tmp_path / 'lesson.db')
    writer, observer = SQLiteStore(db), SQLiteStore(db)
    seed(writer)
    before = pair(observer)
    path, segments = incoming(tmp_path)
    observer._conn.execute('PRAGMA busy_timeout=100')
    def observe():
        assert pair(observer) == before
        # A different lesson can commit while preparation calls the router.
        observer.save_segment(Segment('other#s1', 'other', 0, 0, 'independent'))
    try:
        result, capsule = ingest_bundle(path, writer, L, router=router_for(segments, observe))
        assert result == segments
        assert pair(observer)[0] == ['new source']
        assert json.loads(observer.get_capsule(L))['content']['concepts'][0]['name'] == 'new concept'
    finally:
        writer.close(); observer.close()


def test_assembly_failure_keeps_previous_pair(tmp_path):
    db = str(tmp_path / 'lesson.db')
    writer, observer = SQLiteStore(db), SQLiteStore(db)
    seed(writer)
    before = pair(observer)
    path, segments = incoming(tmp_path)
    def fail():
        raise RuntimeError('synthetic preparation failure')
    try:
        with pytest.raises(RuntimeError, match='synthetic preparation failure'):
            ingest_bundle(path, writer, L, router=router_for(segments, fail))
        assert pair(observer) == before
    finally:
        writer.close(); observer.close()


def test_dry_run_changes_neither_segments_nor_capsule(tmp_path):
    db = str(tmp_path / 'lesson.db')
    writer, observer = SQLiteStore(db), SQLiteStore(db)
    seed(writer)
    before = pair(observer)
    path, segments = incoming(tmp_path)
    try:
        result, _ = ingest_bundle(path, writer, L, router=router_for(segments), save=False)
        assert result == segments
        assert pair(observer) == before
    finally:
        writer.close(); observer.close()


def test_dry_run_never_accesses_authoritative_store(tmp_path):
    path, segments = incoming(tmp_path)
    class NoStore:
        def __getattr__(self, name): pytest.fail(f'dry run accessed {name}')
    result, capsule = ingest_bundle(path, NoStore(), L, router=router_for(segments), save=False)
    assert result == segments and capsule.lesson_id == L


def test_grounding_rejection_does_not_publish_source(tmp_path):
    db = str(tmp_path / 'lesson.db')
    writer, observer = SQLiteStore(db), SQLiteStore(db)
    seed(writer); before = pair(observer)
    path, segments = incoming(tmp_path)
    router = Router()
    router.register(MockProvider({build_segmentation_prompt(segments): '[]',
                                 build_extraction_prompt(segments): '{}'}))
    try:
        with pytest.raises(ValueError, match='zero citations'):
            ingest_bundle(path, writer, L, router=router)
        assert pair(observer) == before
    finally: writer.close(); observer.close()


WRITES = [
    ('paths', lambda s: s.save_path(Path('p', 'path', 'subject'))),
    ('lessons', lambda s: s.save_lesson(Lesson('l', 'p', 'lesson', 0))),
    ('sources', lambda s: s.save_source(Source('src', 'source'))),
    ('segments', lambda s: s.save_segment(Segment('s', 'l', 0, 0, 'text'))),
    ('moments', lambda s: s.save_moment(Moment('m', 'l', 0, 'concept'))),
    ('capsules', lambda s: s.save_capsule('l', '{}')),
    ('cost_ledger', lambda s: s.save_ledger_entry(CostLedgerEntry('e', 'l', 'mock', 'mock', 0, 0, 0))),
]


@pytest.mark.parametrize('finish', ['commit', 'rollback'])
@pytest.mark.parametrize('table,write', WRITES, ids=[w[0] for w in WRITES])
def test_legacy_mutators_honor_explicit_transaction(tmp_path, finish, table, write):
    db = str(tmp_path / 'transaction.db')
    writer, observer = SQLiteStore(db), SQLiteStore(db)
    writer.begin_transaction()
    try:
        write(writer)
        assert observer._conn.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0] == 0
        getattr(writer, f'{finish}_transaction')()
        expected = 1 if finish == 'commit' else 0
        assert observer._conn.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0] == expected
    finally:
        if writer._in_transaction:
            writer.rollback_transaction()
        writer.close(); observer.close()


def test_legacy_segment_delete_honors_explicit_transaction(tmp_path):
    db = str(tmp_path / 'transaction.db')
    writer, observer = SQLiteStore(db), SQLiteStore(db)
    seed(writer)
    before = pair(observer)
    writer.begin_transaction()
    try:
        writer.delete_segments_for_lesson(L)
        assert pair(observer) == before
        writer.rollback_transaction()
        assert pair(observer) == before
    finally:
        if writer._in_transaction:
            writer.rollback_transaction()
        writer.close(); observer.close()
