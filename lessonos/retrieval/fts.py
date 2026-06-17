"""FTS5 full-text search over lesson segments and capsules (PLAN §13).

This is the first pass of the retrieval layer — no embeddings, no hybrid,
no graph traversal. Just typed keyword search over the two core text sources:

- **Segments**: the raw transcript text of each lesson segment
- **Capsules**: the JSON-serialised Lesson Capsule (topic summaries, concepts,
  exercises, etc.) — parsed as plain text for FTS indexing

FTS5 is built into SQLite (standard library) so there are zero new
dependencies. The index is materialised as a virtual table in the same
database file — it stays in sync with the store automatically.

Future iterations will add:
- Hybrid search (FTS5 + embeddings via sqlite-vec)
- Graph-aware retrieval (traverse prerequisite edges)
- Hierarchical scope filtering (lesson / path / workspace)
"""

from __future__ import annotations

import json
import sqlite3
from collections.abc import Collection
from dataclasses import dataclass, field
from typing import Any

from lessonos.store.base import Store
from lessonos.store.sqlite import SQLiteStore


@dataclass(frozen=True)
class SearchResult:
    """A single grounded search result from the FTS index.

    Every result carries its origin (source table + id) and enough context
    for the caller to verify the match against the persisted text.
    """

    source: str  # 'segment' | 'capsule'
    source_id: str  # seg_id for segments, lesson_id for capsules
    lesson_id: str
    rank: float  # FTS5 bm25 rank (lower = better)
    excerpt: str  # snippet from the matched text
    match_type: str = "fts5"
    metadata: dict = field(default_factory=dict)


_FTS_SCHEMA = """
-- FTS5 virtual table over segments (raw transcript text).
-- Uses content sync so triggers keep the index in sync with segments table.
CREATE VIRTUAL TABLE IF NOT EXISTS segments_fts USING fts5(
    lesson_id UNINDEXED,
    text,
    content='segments',
    content_rowid='rowid',
    tokenize='unicode61'
);

-- FTS5 virtual table over capsules (lesson title + JSON text).
-- Standalone (no content sync) because 'capsules' has 'capsule_data' column,
-- not 'text'. We populate manually with extracted plain text.
CREATE VIRTUAL TABLE IF NOT EXISTS capsules_fts USING fts5(
    lesson_id UNINDEXED,
    text,
    tokenize='unicode61'
);
"""

_FTS_TRIGGERS = """
CREATE TRIGGER IF NOT EXISTS segments_ai AFTER INSERT ON segments BEGIN
    INSERT INTO segments_fts(rowid, lesson_id, text)
    VALUES (new.rowid, new.lesson_id, new.text);
END;

CREATE TRIGGER IF NOT EXISTS segments_ad AFTER DELETE ON segments BEGIN
    INSERT INTO segments_fts(segments_fts, rowid, lesson_id, text)
    VALUES ('delete', old.rowid, old.lesson_id, old.text);
END;

CREATE TRIGGER IF NOT EXISTS segments_au AFTER UPDATE ON segments BEGIN
    INSERT INTO segments_fts(segments_fts, rowid, lesson_id, text)
    VALUES ('delete', old.rowid, old.lesson_id, old.text);
    INSERT INTO segments_fts(rowid, lesson_id, text)
    VALUES (new.rowid, new.lesson_id, new.text);
END;
"""


def _get_connection(store: Store) -> sqlite3.Connection:
    """Extract the raw SQLite connection from a Store instance.

    This is a private helper — it only works with ``SQLiteStore``.
    In production the store and retrieval layers share the same database.
    """
    if not isinstance(store, SQLiteStore):
        raise TypeError(
            f"FTSRetriever requires an SQLiteStore, got {type(store).__name__}"
        )
    # Access the private connection — this is a v0 convenience.
    return store._conn  # type: ignore[reportPrivateUsage]


def _capsule_to_text(raw: str) -> str:
    """Extract searchable plain text from a serialised Lesson Capsule JSON.

    Strips the JSON structure and concatenates all text fields (topic names,
    concept names, exercise prompts, question text, homework descriptions)
    into a single string for FTS indexing.
    """
    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return ""

    parts: list[str] = []

    if not isinstance(data, dict):
        return ""

    # Topic timeline
    for span in data.get("timeline", []):
        if isinstance(span, dict):
            topic = span.get("topic", "")
            if topic:
                parts.append(str(topic))

    # Lesson content
    content = data.get("content", {})
    if isinstance(content, dict):
        for concept in content.get("concepts", []):
            if isinstance(concept, dict):
                parts.append(str(concept.get("name", "")))
        for ex in content.get("exercises", []):
            if isinstance(ex, dict):
                parts.append(str(ex.get("prompt", "")))
        for q in content.get("student_questions", []):
            if isinstance(q, dict):
                parts.append(str(q.get("question", "")))
        for hw in content.get("homework", []):
            if isinstance(hw, dict):
                parts.append(str(hw.get("task", "")))

    return "  ".join(parts)


class FTSRetriever:
    """Full-text search across segments and capsules via SQLite FTS5.

    Usage::

        retriever = FTSRetriever(store)
        retriever.build_index()
        results = retriever.search("derivative chain rule")
    """

    def __init__(self, store: Store) -> None:
        self._store = store
        self._conn = _get_connection(store)
        self._index_built = False

    def build_index(self) -> None:
        """Create the FTS5 virtual tables and populate them.

        Idempotent — safe to call multiple times. Creates the virtual
        tables and triggers on first call, then populates from the
        current segments and capsules tables.
        """
        conn = self._conn

        # Create virtual tables (IF NOT EXISTS)
        conn.executescript(_FTS_SCHEMA)
        conn.executescript(_FTS_TRIGGERS)

        # Populate segments_fts from existing data
        conn.execute("""
            INSERT OR IGNORE INTO segments_fts(rowid, lesson_id, text)
            SELECT rowid, lesson_id, text FROM segments
        """)

        # Populate capsules_fts: extract searchable text from JSON blobs
        capsule_rows = conn.execute(
            "SELECT rowid, lesson_id, capsule_data FROM capsules"
        ).fetchall()
        for row in capsule_rows:
            text = _capsule_to_text(row["capsule_data"])
            if text.strip():
                conn.execute(
                    "INSERT OR IGNORE INTO capsules_fts(rowid, lesson_id, text) "
                    "VALUES (?, ?, ?)",
                    (row["rowid"], row["lesson_id"], text),
                )

        conn.commit()
        self._index_built = True

    def search(
        self,
        query: str,
        *,
        top_k: int = 5,
        source_filter: str | None = None,
        lesson_ids: Collection[str] | None = None,
    ) -> list[SearchResult]:
        """Search across segments and capsules.

        Args:
            query: FTS5 query string (supports standard FTS5 syntax:
                  ``term1 term2`` for AND, ``term1 OR term2`` for OR,
                  ``"exact phrase"`` for phrase search).
            top_k: Maximum results to return (across all sources).
            source_filter: If set to ``'segment'`` or ``'capsule'``, only
                          search that source. Default ``None`` searches both.
            lesson_ids: If set, restrict results to these lesson ids at the SQL
                          level (non-lossy scoping — the ``LIMIT``/``top_k``
                          cutoff applies *after* the filter, so an out-of-scope
                          lesson can never crowd out an in-scope one). ``None``
                          (default) searches every lesson; an *empty* collection
                          matches nothing. Used to ground a single teacher's
                          recap in that teacher's own corpus only.

        Returns:
            List of ``SearchResult`` sorted by relevance (best first).

        Raises:
            ValueError: If the index has not been built yet.
        """
        if not self._index_built:
            raise ValueError(
                "FTS index not built — call build_index() before search"
            )
        if not query or not query.strip():
            return []
        if lesson_ids is not None and len(lesson_ids) == 0:
            return []  # explicit empty scope → nothing in scope (no IN () SQL)

        results: list[SearchResult] = []
        cleaned = query.strip()

        # Search segments
        if source_filter is None or source_filter == "segment":
            results.extend(self._search_segments(cleaned, lesson_ids))

        # Search capsules
        if source_filter is None or source_filter == "capsule":
            results.extend(self._search_capsules(cleaned, lesson_ids))

        # Sort by rank (lower = better match), take top_k
        results.sort(key=lambda r: r.rank)
        return results[:top_k]

    @staticmethod
    def _scope_clause(
        column: str, lesson_ids: Collection[str] | None
    ) -> tuple[str, list[str]]:
        """Build an ``AND <column> IN (?, …)`` fragment + its bound params.

        Returns ``("", [])`` when *lesson_ids* is ``None`` (no scope). The
        placeholders are derived only from ``len`` and the values are bound as
        parameters, so there is no SQL injection surface.
        """
        if lesson_ids is None:
            return "", []
        ordered = sorted(lesson_ids)
        placeholders = ",".join("?" * len(ordered))
        return f" AND {column} IN ({placeholders})", ordered

    def _search_segments(
        self, query: str, lesson_ids: Collection[str] | None = None
    ) -> list[SearchResult]:
        """Run FTS5 query against the segments index."""
        scope_sql, scope_params = self._scope_clause("segments.lesson_id", lesson_ids)
        try:
            rows = self._conn.execute(
                f"""SELECT
                    segments.seg_id,
                    segments.lesson_id,
                    rank,
                    snippet(segments_fts, 1, '<mark>', '</mark>', '...', 40)
                    AS excerpt
                FROM segments_fts
                JOIN segments ON segments.rowid = segments_fts.rowid
                WHERE segments_fts MATCH ?{scope_sql}
                ORDER BY rank
                LIMIT 100""",
                (query, *scope_params),
            ).fetchall()
        except sqlite3.OperationalError:
            # Malformed FTS5 query (e.g. trailing OR operator)
            return []

        return [
            SearchResult(
                source="segment",
                source_id=row["seg_id"],
                lesson_id=row["lesson_id"],
                rank=row["rank"],
                excerpt=row["excerpt"],
            )
            for row in rows
        ]

    def _search_capsules(
        self, query: str, lesson_ids: Collection[str] | None = None
    ) -> list[SearchResult]:
        """Run FTS5 query against the capsules index."""
        scope_sql, scope_params = self._scope_clause("capsules.lesson_id", lesson_ids)
        try:
            rows = self._conn.execute(
                f"""SELECT
                    capsules.lesson_id,
                    rank,
                    snippet(capsules_fts, 1, '<mark>', '</mark>', '...', 40)
                    AS excerpt
                FROM capsules_fts
                JOIN capsules ON capsules.rowid = capsules_fts.rowid
                WHERE capsules_fts MATCH ?{scope_sql}
                ORDER BY rank
                LIMIT 100""",
                (query, *scope_params),
            ).fetchall()
        except sqlite3.OperationalError:
            return []

        return [
            SearchResult(
                source="capsule",
                source_id=row["lesson_id"],
                lesson_id=row["lesson_id"],
                rank=row["rank"],
                excerpt=row["excerpt"],
            )
            for row in rows
        ]

    def rebuild_index(self) -> None:
        """Drop and rebuild the FTS5 index from scratch.

        Use this when the underlying data has changed significantly
        (the triggers keep the index in sync on INSERT/UPDATE/DELETE,
        so this is rarely needed outside of initial setup).
        """
        conn = self._conn
        conn.execute("DROP TABLE IF EXISTS segments_fts")
        conn.execute("DROP TABLE IF EXISTS capsules_fts")
        conn.commit()
        self.build_index()
