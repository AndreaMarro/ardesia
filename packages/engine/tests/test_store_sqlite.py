"""Tests for the SQLite persistence layer (PLAN §14, M1-task2).

Real round-trips: an entity saved then re-read must equal the original; the
abstract base must stay abstract; ordering and persistence-to-disk are checked
against actual writes, not in-memory shortcuts.
"""

from __future__ import annotations

import json
from pathlib import Path as FsPath

import pytest

from lessonos.models.entities import Lesson, Path, Source
from lessonos.store import SQLiteStore, Store
from lessonos.store.sqlite import SCHEMA_VERSION

FIXTURE = FsPath(__file__).resolve().parents[1] / "fixtures" / "sample_path"


def test_store_abc_cannot_be_instantiated() -> None:
    with pytest.raises(TypeError):
        Store()  # type: ignore[abstract]


def test_path_round_trip_preserves_all_fields() -> None:
    store = SQLiteStore()
    p = Path(
        path_id="p1",
        title="Calc",
        subject="math",
        lesson_ids=("l1", "l2"),
        source_ids=("s1",),
        synthetic=True,
    )
    store.save_path(p)
    assert store.get_path("p1") == p
    store.close()


def test_get_missing_returns_none() -> None:
    store = SQLiteStore()
    assert store.get_path("nope") is None
    assert store.get_lesson("nope") is None
    assert store.get_source("nope") is None
    assert store.lessons_for_path("nope") == ()
    store.close()


def test_lessons_for_path_ordered_by_order_field() -> None:
    store = SQLiteStore()
    # Insert out of order to prove ORDER BY actually sorts (not insertion order).
    store.save_lesson(Lesson(lesson_id="b", path_id="p", title="B", order=2))
    store.save_lesson(Lesson(lesson_id="a", path_id="p", title="A", order=1))
    store.save_lesson(Lesson(lesson_id="c", path_id="p", title="C", order=3))
    store.save_lesson(Lesson(lesson_id="x", path_id="other", title="X", order=1))
    result = store.lessons_for_path("p")
    assert [le.lesson_id for le in result] == ["a", "b", "c"]
    store.close()


def test_save_replaces_existing_row() -> None:
    store = SQLiteStore()
    store.save_source(Source(source_id="s1", title="old"))
    store.save_source(Source(source_id="s1", title="new", kind="pdf"))
    got = store.get_source("s1")
    assert got == Source(source_id="s1", title="new", kind="pdf")
    store.close()


def test_persists_to_disk_across_reconnect(tmp_path: FsPath) -> None:
    db = str(tmp_path / "lessonos.db")
    s1 = SQLiteStore(db)
    s1.save_lesson(Lesson(lesson_id="l1", path_id="p", title="T", order=1, source_id="s1"))
    s1.close()
    s2 = SQLiteStore(db)  # fresh connection, must read what was committed
    assert s2.get_lesson("l1") == Lesson(
        lesson_id="l1", path_id="p", title="T", order=1, source_id="s1"
    )
    s2.close()


def _index_names(store: SQLiteStore) -> set[str]:
    rows = store._conn.execute(
        "SELECT name FROM sqlite_master WHERE type='index'"
    ).fetchall()
    return {r["name"] for r in rows}


def test_fresh_db_has_paths_teacher_index() -> None:
    store = SQLiteStore()
    assert "idx_paths_teacher" in _index_names(store)
    store.close()


def test_migration_v7_to_v8_adds_paths_teacher_index(tmp_path: FsPath) -> None:
    """A v7 DB (teacher_id column, no index) gains idx_paths_teacher on reopen."""
    db = str(tmp_path / "v7.db")
    s1 = SQLiteStore(db)
    s1.save_path(Path(path_id="p1", title="T", subject="s", teacher_id="andrea"))
    # Simulate a v7 database: drop the index, downgrade user_version.
    s1._conn.execute("DROP INDEX idx_paths_teacher")
    s1._conn.execute("PRAGMA user_version = 7")
    s1._conn.commit()
    s1.close()

    s2 = SQLiteStore(db)  # migration must recreate the index
    assert "idx_paths_teacher" in _index_names(s2)
    assert s2._conn.execute("PRAGMA user_version").fetchone()[0] == SCHEMA_VERSION
    # Data survives the migration untouched.
    reloaded = s2.get_path("p1")
    assert reloaded is not None and reloaded.teacher_id == "andrea"
    s2.close()


def test_real_fixture_path_round_trips() -> None:
    manifest = json.loads((FIXTURE / "path.json").read_text())
    p = Path(
        path_id=manifest["path_id"],
        title=manifest["title"],
        subject=manifest["subject"],
        lesson_ids=tuple(manifest["lessons"]),
        source_ids=tuple(manifest["sources"]),
        synthetic=manifest.get("synthetic", False),
    )
    store = SQLiteStore()
    store.save_path(p)
    reloaded = store.get_path(manifest["path_id"])
    assert reloaded == p
    assert reloaded is not None
    assert reloaded.lesson_ids == tuple(manifest["lessons"])
    store.close()


# ── M1-5.1b: purge_lesson / delete_capsule on the REAL SQLiteStore ──────────
# (retro-review 2026-06-11 CRITICO: the GDPR erasure primitive was never
#  executed against the real backend — only against hand-written stubs.)

from lessonos.models.entities import (  # noqa: E402
    GraphEdge,
    GraphEvidence,
    GraphNode,
    Moment,
    Segment,
)
from lessonos.models.ledger import CostLedgerEntry  # noqa: E402
from lessonos.pipeline import erase_lesson  # noqa: E402


def _populate_lesson(store: SQLiteStore, lesson_id: str, path_id: str) -> None:
    """Write one full set of rows for *lesson_id* across every table."""
    store.save_lesson(
        Lesson(lesson_id=lesson_id, path_id=path_id, title=f"T {lesson_id}", order=1)
    )
    store.save_segment(
        Segment(seg_id=f"{lesson_id}#s1", lesson_id=lesson_id, start=0, end=10,
                text=f"testo di {lesson_id}")
    )
    store.save_moment(
        Moment(moment_id=f"{lesson_id}#m1", lesson_id=lesson_id, t=5, kind="topic")
    )
    store.save_capsule(lesson_id, f'{{"lesson_id": "{lesson_id}"}}')
    store.save_graph_node(
        lesson_id,
        GraphNode(node_id=f"{lesson_id}#n1", node_type="concept", ref_id="c1"),
    )
    store.save_graph_edge(
        lesson_id,
        GraphEdge(edge_id=f"{lesson_id}#e1", source=f"{lesson_id}#n1",
                  target=f"{lesson_id}#n1", edge_type="explains"),
    )
    store.save_evidence(
        GraphEvidence(evidence_id=f"{lesson_id}#ev1", edge_id=f"{lesson_id}#e1",
                      seg_id=f"{lesson_id}#s1", excerpt=f"testo di {lesson_id}",
                      lesson_id=lesson_id)
    )
    store.save_ledger_entry(
        CostLedgerEntry(entry_id=f"cl:{lesson_id}", lesson_id=lesson_id,
                        model="mock-1", provider="mock", prompt_tokens=0,
                        completion_tokens=0, cost_usd=0.0, label="extraction")
    )


def _assert_no_trace(store: SQLiteStore, lesson_id: str) -> None:
    assert store.get_lesson(lesson_id) is None
    assert store.segments_for_lesson(lesson_id) == ()
    assert store.get_segment(f"{lesson_id}#s1") is None
    assert store.moments_for_lesson(lesson_id) == ()
    assert store.get_capsule(lesson_id) is None
    assert store.get_graph_nodes_for_lesson(lesson_id) == ()
    assert store.get_graph_edges_for_lesson(lesson_id) == ()
    assert store.get_all_evidence_for_lesson(lesson_id) == ()
    assert store.get_ledger_for_lesson(lesson_id) == ()


def test_purge_lesson_erases_every_db_trace_and_spares_others() -> None:
    """GDPR contract: after purge no read path serves l1; l2 fully intact."""
    store = SQLiteStore()
    store.save_path(Path(path_id="p1", title="P", subject="s",
                         lesson_ids=("l1", "l2")))
    _populate_lesson(store, "l1", "p1")
    _populate_lesson(store, "l2", "p1")

    deleted = store.purge_lesson("l1")
    # 1 segment + 1 moment + 1 evidence + 1 edge + 1 node + 1 ledger
    # + 1 lessons row + 1 capsule + 1 path update = 9
    assert deleted == 9

    _assert_no_trace(store, "l1")
    # The path no longer references l1 — but keeps l2.
    p = store.get_path("p1")
    assert p is not None and p.lesson_ids == ("l2",)

    # l2 is untouched, table by table.
    assert store.get_lesson("l2") is not None
    assert len(store.segments_for_lesson("l2")) == 1
    assert len(store.moments_for_lesson("l2")) == 1
    assert store.get_capsule("l2") is not None
    assert len(store.get_graph_nodes_for_lesson("l2")) == 1
    assert len(store.get_graph_edges_for_lesson("l2")) == 1
    assert len(store.get_all_evidence_for_lesson("l2")) == 1
    assert len(store.get_ledger_for_lesson("l2")) == 1
    store.close()


def test_purge_lesson_idempotent_second_purge_returns_zero() -> None:
    store = SQLiteStore()
    store.save_path(Path(path_id="p1", title="P", subject="s", lesson_ids=("l1",)))
    _populate_lesson(store, "l1", "p1")
    assert store.purge_lesson("l1") > 0
    assert store.purge_lesson("l1") == 0
    assert store.purge_lesson("never_existed") == 0
    store.close()


def test_purge_lesson_rolls_back_atomically_on_midway_failure() -> None:
    """If any step fails, NO partial deletion may survive (all-or-nothing)."""
    store = SQLiteStore()
    store.save_path(Path(path_id="p1", title="P", subject="s", lesson_ids=("l1",)))
    _populate_lesson(store, "l1", "p1")

    boom = RuntimeError("disk exploded")

    def _failing_delete_capsule(lesson_id: str) -> bool:
        raise boom

    store.delete_capsule = _failing_delete_capsule  # type: ignore[method-assign]
    with pytest.raises(RuntimeError):
        store.purge_lesson("l1")

    # Rollback: every row deleted before the failure must be back.
    assert store.get_lesson("l1") is not None
    assert len(store.segments_for_lesson("l1")) == 1
    assert len(store.moments_for_lesson("l1")) == 1
    assert store.get_capsule("l1") is not None
    assert len(store.get_graph_nodes_for_lesson("l1")) == 1
    assert len(store.get_all_evidence_for_lesson("l1")) == 1
    assert len(store.get_ledger_for_lesson("l1")) == 1
    p = store.get_path("p1")
    assert p is not None and p.lesson_ids == ("l1",)

    # The store is usable afterwards: restore and purge for real.
    del store.delete_capsule  # type: ignore[misc]
    assert store.purge_lesson("l1") == 9
    _assert_no_trace(store, "l1")
    store.close()


def test_purge_lesson_keeps_path_level_ledger_entries() -> None:
    """Ledger rows with lesson_id=None (path-level calls) must survive."""
    store = SQLiteStore()
    _populate_lesson(store, "l1", "p1")
    store.save_ledger_entry(
        CostLedgerEntry(entry_id="cl:path", lesson_id=None, model="mock-1",
                        provider="mock", prompt_tokens=0, completion_tokens=0,
                        cost_usd=0.0, label="path-level")
    )
    store.purge_lesson("l1")
    remaining = store.get_ledger_entries()
    assert [e.entry_id for e in remaining] == ["cl:path"]
    store.close()


def test_delete_capsule_real_store_idempotent() -> None:
    store = SQLiteStore()
    store.save_capsule("l1", '{"lesson_id": "l1"}')
    assert store.delete_capsule("l1") is True
    assert store.get_capsule("l1") is None
    assert store.delete_capsule("l1") is False
    store.close()


def test_purge_lesson_persists_across_reopen(tmp_path: FsPath) -> None:
    """The purge is durable: a fresh connection sees no trace."""
    db = str(tmp_path / "purge.db")
    s1 = SQLiteStore(db)
    s1.save_path(Path(path_id="p1", title="P", subject="s", lesson_ids=("l1",)))
    _populate_lesson(s1, "l1", "p1")
    s1.purge_lesson("l1")
    s1.close()

    s2 = SQLiteStore(db)
    _assert_no_trace(s2, "l1")
    p = s2.get_path("p1")
    assert p is not None and p.lesson_ids == ()
    s2.close()


def test_delete_graph_for_lesson_standalone_commits_and_keeps_source(
    tmp_path: FsPath,
) -> None:
    """``delete_graph_for_lesson`` called OUTSIDE a transaction must commit on
    its own, and must wipe ONLY graph data — segments/moments/capsule (SOURCE
    data) and a second lesson's graph stay intact.

    Production wraps this in a transaction (graph/writer.py:56-58), so the
    standalone-commit branch (sqlite.py:578) ran in no test; the re-ingest path
    (pipeline.py:808) hits it on the real store but every test stubs the store.
    Durability is proved cross-connection: ``s1`` closes WITHOUT an explicit
    commit, so if the method's own commit were dropped the deferred DELETE would
    roll back on close and ``s2`` would still serve l1's graph rows.
    """
    db = str(tmp_path / "graph.db")
    s1 = SQLiteStore(db)
    s1.save_path(Path(path_id="p1", title="P", subject="s",
                      lesson_ids=("l1", "l2")))
    _populate_lesson(s1, "l1", "p1")
    _populate_lesson(s1, "l2", "p1")

    assert s1._in_transaction is False  # the standalone branch under test
    s1.delete_graph_for_lesson("l1")
    s1.close()  # no explicit commit: durability must come from the method

    s2 = SQLiteStore(db)  # fresh connection sees only committed state
    # Graph data for l1 is gone (and the commit made it durable)...
    assert s2.get_graph_nodes_for_lesson("l1") == ()
    assert s2.get_graph_edges_for_lesson("l1") == ()
    assert s2.get_all_evidence_for_lesson("l1") == ()
    # ...but l1's SOURCE data survives — graph-erase is not lesson-purge.
    assert s2.get_lesson("l1") is not None
    assert len(s2.segments_for_lesson("l1")) == 1
    assert len(s2.moments_for_lesson("l1")) == 1
    assert s2.get_capsule("l1") is not None
    # l2's graph is untouched.
    assert len(s2.get_graph_nodes_for_lesson("l2")) == 1
    assert len(s2.get_graph_edges_for_lesson("l2")) == 1
    assert len(s2.get_all_evidence_for_lesson("l2")) == 1
    s2.close()


def test_erase_lesson_removes_wiki_file_and_spares_others(tmp_path: FsPath) -> None:
    """pipeline.erase_lesson = store purge + derived/wiki/<lesson>.md unlink."""
    store = SQLiteStore()
    store.save_path(Path(path_id="p1", title="P", subject="s",
                         lesson_ids=("l1", "l2")))
    _populate_lesson(store, "l1", "p1")
    _populate_lesson(store, "l2", "p1")
    wiki = tmp_path / "wiki"
    wiki.mkdir()
    (wiki / "l1.md").write_text("# riepilogo l1")
    (wiki / "l2.md").write_text("# riepilogo l2")

    deleted = erase_lesson(store, "l1", wiki_dir=wiki)
    assert deleted == 10  # 9 DB items + 1 wiki file
    assert not (wiki / "l1.md").exists()
    assert (wiki / "l2.md").exists()
    _assert_no_trace(store, "l1")

    # Idempotent including the missing wiki file.
    assert erase_lesson(store, "l1", wiki_dir=wiki) == 0
    store.close()


def test_erase_lesson_db_only_without_wiki_dir(tmp_path: FsPath) -> None:
    """GDPR erasure with no *wiki_dir*: DB-only purge, filesystem untouched.

    The default ``wiki_dir=None`` call shape (the common erasure path) was
    exercised by no test: it must skip the unlink branch entirely. We place a
    same-named ``l1.md`` on disk and confirm it SURVIVES — proving the None
    path never reaches the filesystem (not merely that it doesn't crash).
    Pins ``if wiki_dir is not None`` — drop it and ``Path(None)`` would raise.
    """
    store = SQLiteStore()
    store.save_path(Path(path_id="p1", title="P", subject="s",
                         lesson_ids=("l1",)))
    _populate_lesson(store, "l1", "p1")
    # A wiki file that erase_lesson WOULD delete if it touched the filesystem.
    bystander = tmp_path / "l1.md"
    bystander.write_text("# riepilogo l1")

    deleted = erase_lesson(store, "l1")  # wiki_dir omitted -> None

    # Sibling test asserts 10 (== 9 DB + 1 wiki file). Here, with no wiki_dir,
    # the count is 9: the file is NOT counted and NOT deleted.
    assert deleted == 9
    assert bystander.exists()  # filesystem NOT touched on the None path
    _assert_no_trace(store, "l1")
    assert erase_lesson(store, "l1") == 0  # idempotent
    store.close()


def test_paths_for_teacher_filters_by_owner_and_orders_by_id() -> None:
    """Teacher isolation primitive: only the owner's paths, ascending by path_id.

    Saved out of insertion order across two teachers. Pins both the WHERE
    teacher_id filter (drop it -> p_other leaks) and the ORDER BY path_id
    (rows inserted p2 before p1 -> without the sort the order is wrong).
    """
    store = SQLiteStore()
    # Titles run opposite to path_id so the expected order can only come from
    # ORDER BY path_id (a stray ORDER BY title would invert the result).
    store.save_path(Path(path_id="p2", title="A", subject="s", teacher_id="andrea"))
    store.save_path(Path(path_id="p1", title="B", subject="s", teacher_id="andrea"))
    store.save_path(Path(path_id="p9", title="X", subject="s", teacher_id="other"))

    got = store.paths_for_teacher("andrea")

    assert tuple(p.path_id for p in got) == ("p1", "p2")  # filtered + ordered
    assert all(p.teacher_id == "andrea" for p in got)  # no cross-teacher leak
    assert store.paths_for_teacher("nobody") == ()  # empty for unknown owner
    store.close()


def test_get_evidence_for_edge_filters_by_edge_and_orders_by_id() -> None:
    """Grounding-evidence retrieval: only the queried edge, ascending by id.

    Two pieces of evidence on e1 (saved high-id first), one on e2. Pins the
    WHERE edge_id filter (drop it -> e2's evidence leaks in) and the
    ORDER BY evidence_id (insertion order is reversed vs. expected).
    """
    store = SQLiteStore()
    # Excerpts run opposite to evidence_id so the expected order can only come
    # from ORDER BY evidence_id (a stray ORDER BY excerpt would invert it).
    store.save_evidence(
        GraphEvidence(evidence_id="l1#ev2", edge_id="l1#e1", seg_id="l1#s1",
                      excerpt="a", lesson_id="l1")
    )
    store.save_evidence(
        GraphEvidence(evidence_id="l1#ev1", edge_id="l1#e1", seg_id="l1#s1",
                      excerpt="z", lesson_id="l1")
    )
    store.save_evidence(
        GraphEvidence(evidence_id="l1#ev9", edge_id="l1#e2", seg_id="l1#s2",
                      excerpt="other", lesson_id="l1")
    )

    got = store.get_evidence_for_edge("l1#e1")

    assert tuple(e.evidence_id for e in got) == ("l1#ev1", "l1#ev2")  # filtered + ordered
    assert all(e.edge_id == "l1#e1" for e in got)  # e2 excluded
    assert got[0].excerpt == "z"  # full row hydrated (ev1's excerpt), not just ids
    assert store.get_evidence_for_edge("l1#missing") == ()  # empty for unknown edge
    store.close()


class TestTransactionContract:
    """Store ABC: inside begin_transaction(), auto-commits are suppressed —
    rollback must leave no persistent change. Observable store behavior,
    not _in_transaction flag assertions."""

    def _seg(self, sid: str = "l1#s1", text: str = "Testo") -> Segment:
        return Segment(seg_id=sid, lesson_id="l1", start=0, end=1, text=text)

    def test_save_segment_rollback_inside_transaction(self) -> None:
        store = SQLiteStore()
        store.begin_transaction()
        store.save_segment(self._seg())
        store.rollback_transaction()
        assert store.get_segment("l1#s1") is None
        store.close()

    def test_delete_segments_rollback_inside_transaction(self) -> None:
        store = SQLiteStore()
        store.save_segment(self._seg())
        store.begin_transaction()
        assert store.delete_segments_for_lesson("l1") == 1
        store.rollback_transaction()
        assert store.get_segment("l1#s1") is not None
        store.close()

    def test_save_capsule_rollback_inside_transaction(self) -> None:
        store = SQLiteStore()
        store.begin_transaction()
        store.save_capsule("l1", '{"lesson_id": "l1"}')
        store.rollback_transaction()
        assert store.get_capsule("l1") is None
        store.close()

    def test_commit_inside_transaction_persists(self) -> None:
        store = SQLiteStore()
        store.begin_transaction()
        store.save_segment(self._seg())
        store.save_capsule("l1", '{"lesson_id": "l1"}')
        store.commit_transaction()
        assert store.get_segment("l1#s1") is not None
        assert store.get_capsule("l1") == '{"lesson_id": "l1"}'
        store.close()
