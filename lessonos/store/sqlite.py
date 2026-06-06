"""SQLite-backed :class:`Store` for v0 (stdlib ``sqlite3``, no new deps).

Relational tables for Path/Lesson/Source (PLAN §14). Vector search
(sqlite-vec / pgvector) and the remaining tables arrive with the capsule and
graph milestones; this is the foundational relational slice. Tuple fields
(``lesson_ids``/``source_ids``) are stored as JSON columns.
"""

from __future__ import annotations

import json
import sqlite3

from lessonos.models.entities import Lesson, Path, Source
from lessonos.store.base import Store

SCHEMA_VERSION = 1

_SCHEMA = """
CREATE TABLE IF NOT EXISTS paths (
    path_id    TEXT PRIMARY KEY,
    title      TEXT NOT NULL,
    subject    TEXT NOT NULL,
    lesson_ids TEXT NOT NULL DEFAULT '[]',
    source_ids TEXT NOT NULL DEFAULT '[]',
    synthetic  INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS lessons (
    lesson_id TEXT PRIMARY KEY,
    path_id   TEXT NOT NULL,
    title     TEXT NOT NULL,
    "order"   INTEGER NOT NULL,
    source_id TEXT
);
CREATE TABLE IF NOT EXISTS sources (
    source_id TEXT PRIMARY KEY,
    title     TEXT NOT NULL,
    kind      TEXT NOT NULL DEFAULT 'text'
);
"""


class SQLiteStore(Store):
    def __init__(self, db_path: str = ":memory:") -> None:
        self._conn = sqlite3.connect(db_path)
        self._conn.row_factory = sqlite3.Row
        self._migrate()

    def _migrate(self) -> None:
        current = self._conn.execute("PRAGMA user_version").fetchone()[0]
        if current < SCHEMA_VERSION:
            self._conn.executescript(_SCHEMA)
            self._conn.execute(f"PRAGMA user_version = {SCHEMA_VERSION}")
            self._conn.commit()

    # --- Path -----------------------------------------------------------
    def save_path(self, path: Path) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO paths "
            "(path_id, title, subject, lesson_ids, source_ids, synthetic) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                path.path_id,
                path.title,
                path.subject,
                json.dumps(list(path.lesson_ids)),
                json.dumps(list(path.source_ids)),
                int(path.synthetic),
            ),
        )
        self._conn.commit()

    def get_path(self, path_id: str) -> Path | None:
        row = self._conn.execute(
            "SELECT * FROM paths WHERE path_id = ?", (path_id,)
        ).fetchone()
        if row is None:
            return None
        return Path(
            path_id=row["path_id"],
            title=row["title"],
            subject=row["subject"],
            lesson_ids=tuple(json.loads(row["lesson_ids"])),
            source_ids=tuple(json.loads(row["source_ids"])),
            synthetic=bool(row["synthetic"]),
        )

    # --- Lesson ---------------------------------------------------------
    def save_lesson(self, lesson: Lesson) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO lessons "
            '(lesson_id, path_id, title, "order", source_id) '
            "VALUES (?, ?, ?, ?, ?)",
            (
                lesson.lesson_id,
                lesson.path_id,
                lesson.title,
                lesson.order,
                lesson.source_id,
            ),
        )
        self._conn.commit()

    def get_lesson(self, lesson_id: str) -> Lesson | None:
        row = self._conn.execute(
            "SELECT * FROM lessons WHERE lesson_id = ?", (lesson_id,)
        ).fetchone()
        return self._row_to_lesson(row) if row is not None else None

    def lessons_for_path(self, path_id: str) -> tuple[Lesson, ...]:
        rows = self._conn.execute(
            'SELECT * FROM lessons WHERE path_id = ? ORDER BY "order"',
            (path_id,),
        ).fetchall()
        return tuple(self._row_to_lesson(r) for r in rows)

    @staticmethod
    def _row_to_lesson(row: sqlite3.Row) -> Lesson:
        return Lesson(
            lesson_id=row["lesson_id"],
            path_id=row["path_id"],
            title=row["title"],
            order=row["order"],
            source_id=row["source_id"],
        )

    # --- Source ---------------------------------------------------------
    def save_source(self, source: Source) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO sources (source_id, title, kind) "
            "VALUES (?, ?, ?)",
            (source.source_id, source.title, source.kind),
        )
        self._conn.commit()

    def get_source(self, source_id: str) -> Source | None:
        row = self._conn.execute(
            "SELECT * FROM sources WHERE source_id = ?", (source_id,)
        ).fetchone()
        if row is None:
            return None
        return Source(
            source_id=row["source_id"], title=row["title"], kind=row["kind"]
        )

    def close(self) -> None:
        self._conn.close()
