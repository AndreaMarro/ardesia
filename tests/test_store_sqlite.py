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
