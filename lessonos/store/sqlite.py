"""SQLite-backed :class:`Store` for v0 (stdlib ``sqlite3``, no new deps).

Relational tables for Path/Lesson/Source (PLAN §14). Vector search
(sqlite-vec / pgvector) and the remaining tables arrive with the capsule and
graph milestones; this is the foundational relational slice. Tuple fields
(``lesson_ids``/``source_ids``) are stored as JSON columns.
"""

from __future__ import annotations

import json
import sqlite3

from lessonos.models.entities import Lesson, Moment, Path, Segment, Source, GraphNode, GraphEdge, GraphEvidence
from lessonos.models.ledger import CostLedgerEntry
from lessonos.store.base import Store

SCHEMA_VERSION = 6

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
CREATE TABLE IF NOT EXISTS segments (
    seg_id    TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    start     INTEGER NOT NULL,
    "end"     INTEGER NOT NULL,
    text      TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS moments (
    moment_id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    t         INTEGER NOT NULL,
    kind      TEXT NOT NULL,
    seg_id    TEXT
);
CREATE TABLE IF NOT EXISTS capsules (
    lesson_id    TEXT PRIMARY KEY,
    capsule_data TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS cost_ledger (
    entry_id         TEXT PRIMARY KEY,
    lesson_id        TEXT,
    model            TEXT NOT NULL,
    provider         TEXT NOT NULL,
    prompt_tokens    INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    cost_usd         REAL NOT NULL,
    label            TEXT NOT NULL DEFAULT '',
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS nodes (
    node_id    TEXT PRIMARY KEY,
    lesson_id  TEXT NOT NULL,
    node_type  TEXT NOT NULL,
    ref_id     TEXT NOT NULL,
    label      TEXT
);
CREATE TABLE IF NOT EXISTS edges (
    edge_id    TEXT PRIMARY KEY,
    lesson_id  TEXT NOT NULL,
    source     TEXT NOT NULL,
    target     TEXT NOT NULL,
    edge_type  TEXT NOT NULL,
    metadata   TEXT NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS evidence (
    evidence_id TEXT PRIMARY KEY,
    edge_id     TEXT NOT NULL,
    seg_id      TEXT NOT NULL,
    excerpt     TEXT,
    confidence  REAL,
    lesson_id   TEXT NOT NULL
);
"""
class SQLiteStore(Store):
    def __init__(self, db_path: str = ":memory:") -> None:
        self._conn = sqlite3.connect(db_path)
        self._conn.row_factory = sqlite3.Row
        self._in_transaction: bool = False
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

    # --- Segment --------------------------------------------------------
    def save_segment(self, segment: Segment) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO segments "
            '(seg_id, lesson_id, start, "end", text) '
            "VALUES (?, ?, ?, ?, ?)",
            (
                segment.seg_id,
                segment.lesson_id,
                segment.start,
                segment.end,
                segment.text,
            ),
        )
        self._conn.commit()

    def get_segment(self, seg_id: str) -> Segment | None:
        row = self._conn.execute(
            "SELECT * FROM segments WHERE seg_id = ?", (seg_id,)
        ).fetchone()
        return self._row_to_segment(row) if row is not None else None

    def segments_for_lesson(self, lesson_id: str) -> tuple[Segment, ...]:
        rows = self._conn.execute(
            "SELECT * FROM segments WHERE lesson_id = ? ORDER BY start",
            (lesson_id,),
        ).fetchall()
        return tuple(self._row_to_segment(r) for r in rows)

    @staticmethod
    def _row_to_segment(row: sqlite3.Row) -> Segment:
        return Segment(
            seg_id=row["seg_id"],
            lesson_id=row["lesson_id"],
            start=row["start"],
            end=row["end"],
            text=row["text"],
        )

    # --- Moment ---------------------------------------------------------
    def save_moment(self, moment: Moment) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO moments "
            "(moment_id, lesson_id, t, kind, seg_id) "
            "VALUES (?, ?, ?, ?, ?)",
            (
                moment.moment_id,
                moment.lesson_id,
                moment.t,
                moment.kind,
                moment.seg_id,
            ),
        )
        self._conn.commit()

    def get_moment(self, moment_id: str) -> Moment | None:
        row = self._conn.execute(
            "SELECT * FROM moments WHERE moment_id = ?", (moment_id,)
        ).fetchone()
        return self._row_to_moment(row) if row is not None else None

    def moments_for_lesson(self, lesson_id: str) -> tuple[Moment, ...]:
        rows = self._conn.execute(
            "SELECT * FROM moments WHERE lesson_id = ? ORDER BY t",
            (lesson_id,),
        ).fetchall()
        return tuple(self._row_to_moment(r) for r in rows)

    @staticmethod
    def _row_to_moment(row: sqlite3.Row) -> Moment:
        return Moment(
            moment_id=row["moment_id"],
            lesson_id=row["lesson_id"],
            t=row["t"],
            kind=row["kind"],
            seg_id=row["seg_id"],
        )

    # --- Capsule ---------------------------------------------------------
    def save_capsule(self, lesson_id: str, capsule_data: str) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO capsules (lesson_id, capsule_data) "
            "VALUES (?, ?)",
            (lesson_id, capsule_data),
        )
        self._conn.commit()

    def get_capsule(self, lesson_id: str) -> str | None:
        row = self._conn.execute(
            "SELECT capsule_data FROM capsules WHERE lesson_id = ?",
            (lesson_id,),
        ).fetchone()
        return row["capsule_data"] if row is not None else None

    def close(self) -> None:
        self._conn.close()

    # --- Cost Ledger -----------------------------------------------------

    def save_ledger_entry(self, entry: CostLedgerEntry) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO cost_ledger "
            "(entry_id, lesson_id, model, provider, "
            "prompt_tokens, completion_tokens, cost_usd, label) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                entry.entry_id,
                entry.lesson_id,
                entry.model,
                entry.provider,
                entry.prompt_tokens,
                entry.completion_tokens,
                entry.cost_usd,
                entry.label,
            ),
        )
        self._conn.commit()

    def get_ledger_entries(self) -> tuple[CostLedgerEntry, ...]:
        rows = self._conn.execute(
            "SELECT * FROM cost_ledger ORDER BY entry_id"
        ).fetchall()
        return tuple(self._row_to_ledger_entry(r) for r in rows)

    def get_ledger_for_lesson(self, lesson_id: str) -> tuple[CostLedgerEntry, ...]:
        rows = self._conn.execute(
            "SELECT * FROM cost_ledger WHERE lesson_id = ? ORDER BY entry_id",
            (lesson_id,),
        ).fetchall()
        return tuple(self._row_to_ledger_entry(r) for r in rows)

    @staticmethod
    def _row_to_ledger_entry(row: sqlite3.Row) -> CostLedgerEntry:
        return CostLedgerEntry(
            entry_id=row["entry_id"],
            lesson_id=row["lesson_id"],
            model=row["model"],
            provider=row["provider"],
            prompt_tokens=row["prompt_tokens"],
            completion_tokens=row["completion_tokens"],
            cost_usd=row["cost_usd"],
            label=row["label"],
        )

    # --- Graph tables (T5 graph_writer) ------------------------------------

    def save_graph_node(self, lesson_id: str, node: GraphNode) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO nodes "
            "(node_id, lesson_id, node_type, ref_id, label) "
            "VALUES (?, ?, ?, ?, ?)",
            (node.node_id, lesson_id, node.node_type, node.ref_id, node.label),
        )
        if not self._in_transaction:
            self._conn.commit()

    def get_graph_nodes_for_lesson(self, lesson_id: str) -> tuple[GraphNode, ...]:
        rows = self._conn.execute(
            "SELECT * FROM nodes WHERE lesson_id = ? ORDER BY node_id",
            (lesson_id,),
        ).fetchall()
        return tuple(
            GraphNode(
                node_id=r["node_id"],
                node_type=r["node_type"],
                ref_id=r["ref_id"],
                label=r["label"],
            )
            for r in rows
        )

    def save_graph_edge(self, lesson_id: str, edge: GraphEdge) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO edges "
            "(edge_id, lesson_id, source, target, edge_type, metadata) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                edge.edge_id,
                lesson_id,
                edge.source,
                edge.target,
                edge.edge_type,
                json.dumps(edge.metadata),
            ),
        )
        if not self._in_transaction:
            self._conn.commit()

    def get_graph_edges_for_lesson(self, lesson_id: str) -> tuple[GraphEdge, ...]:
        rows = self._conn.execute(
            "SELECT * FROM edges WHERE lesson_id = ? ORDER BY edge_id",
            (lesson_id,),
        ).fetchall()
        return tuple(
            GraphEdge(
                edge_id=r["edge_id"],
                source=r["source"],
                target=r["target"],
                edge_type=r["edge_type"],
                metadata=json.loads(r["metadata"]),
            )
            for r in rows
        )

    def save_evidence(self, evidence: GraphEvidence) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO evidence "
            "(evidence_id, edge_id, seg_id, excerpt, confidence, lesson_id) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                evidence.evidence_id,
                evidence.edge_id,
                evidence.seg_id,
                evidence.excerpt,
                evidence.confidence,
                evidence.lesson_id,
            ),
        )
        if not self._in_transaction:
            self._conn.commit()

    def get_evidence_for_edge(self, edge_id: str) -> tuple[GraphEvidence, ...]:
        rows = self._conn.execute(
            "SELECT * FROM evidence WHERE edge_id = ? ORDER BY evidence_id",
            (edge_id,),
        ).fetchall()
        return tuple(self._row_to_evidence(r) for r in rows)

    def get_all_evidence_for_lesson(self, lesson_id: str) -> tuple[GraphEvidence, ...]:
        rows = self._conn.execute(
            "SELECT * FROM evidence WHERE lesson_id = ? ORDER BY evidence_id",
            (lesson_id,),
        ).fetchall()
        return tuple(self._row_to_evidence(r) for r in rows)

    def delete_graph_for_lesson(self, lesson_id: str) -> None:
        self._conn.execute("DELETE FROM nodes WHERE lesson_id = ?", (lesson_id,))
        self._conn.execute("DELETE FROM edges WHERE lesson_id = ?", (lesson_id,))
        self._conn.execute("DELETE FROM evidence WHERE lesson_id = ?", (lesson_id,))
        if not self._in_transaction:
            self._conn.commit()

    @staticmethod
    def _row_to_evidence(row: sqlite3.Row) -> GraphEvidence:
        return GraphEvidence(
            evidence_id=row["evidence_id"],
            edge_id=row["edge_id"],
            seg_id=row["seg_id"],
            excerpt=row["excerpt"],
            confidence=row["confidence"],
            lesson_id=row["lesson_id"],
        )

    # --- Transaction support ------------------------------------------------

    def begin_transaction(self) -> None:
        """Begin an explicit SQLite transaction."""
        assert not self._in_transaction, "Nested transactions are not supported"
        self._conn.execute("BEGIN")
        self._in_transaction = True

    def commit_transaction(self) -> None:
        """Commit the current transaction."""
        assert self._in_transaction, "No active transaction to commit"
        self._conn.commit()
        self._in_transaction = False

    def rollback_transaction(self) -> None:
        """Roll back the current transaction."""
        assert self._in_transaction, "No active transaction to roll back"
        self._conn.rollback()
        self._in_transaction = False
