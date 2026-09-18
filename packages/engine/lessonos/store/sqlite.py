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
from lessonos.models.crm import ConsentEvent, Enrollment, SchoolClass, Student, Teacher
from lessonos.models.ledger import CostLedgerEntry
from lessonos.store.base import Store

SCHEMA_VERSION = 10

_SCHEMA = """
CREATE TABLE IF NOT EXISTS paths (
    path_id    TEXT PRIMARY KEY,
    title      TEXT NOT NULL,
    subject    TEXT NOT NULL,
    lesson_ids TEXT NOT NULL DEFAULT '[]',
    source_ids TEXT NOT NULL DEFAULT '[]',
    synthetic  INTEGER NOT NULL DEFAULT 0,
    teacher_id TEXT
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
CREATE INDEX IF NOT EXISTS idx_paths_teacher ON paths(teacher_id);
-- CRM-primitives (v9): anonymised teacher/class/student roster. By design the
-- teachers/students tables hold ONLY an opaque pseudonym PK — there is no
-- personal column to leak (GDPR by construction; PII vault is external).
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id TEXT PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS classes (
    class_id   TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL,
    subject    TEXT
);
CREATE TABLE IF NOT EXISTS students (
    student_id TEXT PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id TEXT PRIMARY KEY,
    class_id      TEXT NOT NULL,
    student_id    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
-- consent-state (v10): append-only audit trail of GDPR consent grant/revoke
-- for a teacher↔class relationship. Like the rest of the CRM layer it holds
-- ONLY opaque pseudonyms + timestamps + the action — no personal column to
-- leak. Current state is DERIVED from these events (see lessonos.consent),
-- never stored, so the table is a tamper-evident history.
CREATE TABLE IF NOT EXISTS consent_events (
    event_id   TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL,
    class_id   TEXT NOT NULL,
    action     TEXT NOT NULL,
    at         TEXT NOT NULL,
    expires_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_consent_events_rel
    ON consent_events(teacher_id, class_id);
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
            # Migration →v7: add teacher_id column to a pre-existing paths
            # table. MUST run before executescript: _SCHEMA's
            # idx_paths_teacher index references the column. Attempted on
            # every upgrade — OperationalError means the column already
            # exists or the table does not exist yet (fresh DB), both fine.
            try:
                self._conn.execute(
                    "ALTER TABLE paths ADD COLUMN teacher_id TEXT"
                )
            except sqlite3.OperationalError:
                pass
            # Migration v7→v8 (M1-1c micro, debito H2 0613): _SCHEMA now
            # contains CREATE INDEX IF NOT EXISTS idx_paths_teacher — the
            # executescript creates it on fresh, v6 and v7 databases alike.
            # Migration v8→v9 (CRM-primitives): _SCHEMA adds the teachers/
            # classes/students/enrollments tables + indexes, all
            # CREATE … IF NOT EXISTS — additive, no data migration.
            # Migration v9→v10 (consent-state): _SCHEMA adds the append-only
            # consent_events table + index — additive, no data migration.
            self._conn.executescript(_SCHEMA)
            self._conn.execute(f"PRAGMA user_version = {SCHEMA_VERSION}")
            self._conn.commit()

    # --- Path -----------------------------------------------------------
    def save_path(self, path: Path) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO paths "
            "(path_id, title, subject, lesson_ids, source_ids, synthetic, teacher_id) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                path.path_id,
                path.title,
                path.subject,
                json.dumps(list(path.lesson_ids)),
                json.dumps(list(path.source_ids)),
                int(path.synthetic),
                path.teacher_id,
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
            teacher_id=row["teacher_id"],
        )

    def paths_for_teacher(self, teacher_id: str) -> tuple[Path, ...]:
        rows = self._conn.execute(
            "SELECT * FROM paths WHERE teacher_id = ? ORDER BY path_id",
            (teacher_id,),
        ).fetchall()
        return tuple(
            Path(
                path_id=r["path_id"],
                title=r["title"],
                subject=r["subject"],
                lesson_ids=tuple(json.loads(r["lesson_ids"])),
                source_ids=tuple(json.loads(r["source_ids"])),
                synthetic=bool(r["synthetic"]),
                teacher_id=r["teacher_id"],
            )
            for r in rows
        )

    def all_paths(self) -> tuple[Path, ...]:
        rows = self._conn.execute(
            "SELECT * FROM paths ORDER BY path_id"
        ).fetchall()
        return tuple(
            Path(
                path_id=r["path_id"],
                title=r["title"],
                subject=r["subject"],
                lesson_ids=tuple(json.loads(r["lesson_ids"])),
                source_ids=tuple(json.loads(r["source_ids"])),
                synthetic=bool(r["synthetic"]),
                teacher_id=r["teacher_id"],
            )
            for r in rows
        )

    def all_lessons(self) -> tuple[Lesson, ...]:
        rows = self._conn.execute(
            "SELECT * FROM lessons ORDER BY lesson_id"
        ).fetchall()
        return tuple(
            Lesson(
                lesson_id=r["lesson_id"],
                path_id=r["path_id"],
                title=r["title"],
                order=r["order"],
                source_id=r["source_id"],
            )
            for r in rows
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
        if not self._in_transaction:
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

    def delete_segments_for_lesson(self, lesson_id: str) -> int:
        """Delete ALL segments of a lesson; returns the number removed.

        Re-ingesting with different segmentation (e.g. coalescing 1351→258)
        via the upsert-only ``save_segment`` left STALE rows beyond the new
        count, silently mixed back by ``segments_for_lesson`` (deepreview B3).
        Runners must call this before a re-ingest.
        """
        cur = self._conn.execute(
            "DELETE FROM segments WHERE lesson_id = ?", (lesson_id,)
        )
        if not self._in_transaction:
            self._conn.commit()
        return cur.rowcount

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
        if not self._in_transaction:
            self._conn.commit()

    def get_capsule(self, lesson_id: str) -> str | None:
        row = self._conn.execute(
            "SELECT capsule_data FROM capsules WHERE lesson_id = ?",
            (lesson_id,),
        ).fetchone()
        return row["capsule_data"] if row is not None else None

    def delete_capsule(self, lesson_id: str) -> bool:
        """Delete a persisted capsule for *lesson_id*.

        Returns ``True`` if a capsule existed.
        """
        cur = self._conn.execute(
            "DELETE FROM capsules WHERE lesson_id = ?", (lesson_id,)
        )
        if not self._in_transaction:
            self._conn.commit()
        return cur.rowcount > 0

    def purge_lesson(self, lesson_id: str) -> int:
        """Erase every DB trace of *lesson_id* in a single transaction.

        Covers segments, moments, evidence, edges, nodes, cost_ledger rows,
        the ``lessons`` row, the capsule, and removes the lesson from every
        ``paths.lesson_ids``. Filesystem artifacts (``derived/wiki``) are
        outside the store contract — see ``pipeline.erase_lesson``.
        """
        self.begin_transaction()
        total = 0
        try:
            for table in (
                "segments",
                "moments",
                "evidence",
                "edges",
                "nodes",
                "cost_ledger",
                "lessons",
            ):
                cur = self._conn.execute(
                    f"DELETE FROM {table} WHERE lesson_id = ?", (lesson_id,)
                )
                total += cur.rowcount
            # Capsule is keyed on lesson_id, not lesson_id column
            if self.delete_capsule(lesson_id):
                total += 1
            rows = self._conn.execute(
                "SELECT path_id, lesson_ids FROM paths"
            ).fetchall()
            for row in rows:
                ids = json.loads(row["lesson_ids"])
                if lesson_id in ids:
                    remaining = [lid for lid in ids if lid != lesson_id]
                    self._conn.execute(
                        "UPDATE paths SET lesson_ids = ? WHERE path_id = ?",
                        (json.dumps(remaining), row["path_id"]),
                    )
                    total += 1
            self.commit_transaction()
        except BaseException:
            self.rollback_transaction()
            raise
        return total

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

    def all_concept_nodes(self) -> tuple[GraphNode, ...]:
        rows = self._conn.execute(
            "SELECT * FROM nodes WHERE node_type = 'concept' ORDER BY node_id"
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

    def all_depends_on_edges(self) -> tuple[GraphEdge, ...]:
        rows = self._conn.execute(
            "SELECT * FROM edges WHERE edge_type = 'depends_on' ORDER BY edge_id"
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

    def delete_graph_edge(self, edge_id: str) -> None:
        self._conn.execute("DELETE FROM edges WHERE edge_id = ?", (edge_id,))
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

    # --- CRM: anonymised teacher / class / student relation -----------------

    def save_teacher(self, teacher: Teacher) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO teachers (teacher_id) VALUES (?)",
            (teacher.teacher_id,),
        )
        if not self._in_transaction:
            self._conn.commit()

    def get_teacher(self, teacher_id: str) -> Teacher | None:
        row = self._conn.execute(
            "SELECT teacher_id FROM teachers WHERE teacher_id = ?",
            (teacher_id,),
        ).fetchone()
        return Teacher(teacher_id=row["teacher_id"]) if row is not None else None

    def all_teachers(self) -> tuple[Teacher, ...]:
        rows = self._conn.execute(
            "SELECT teacher_id FROM teachers ORDER BY teacher_id"
        ).fetchall()
        return tuple(Teacher(teacher_id=r["teacher_id"]) for r in rows)

    def delete_teacher(self, teacher_id: str) -> bool:
        cur = self._conn.execute(
            "DELETE FROM teachers WHERE teacher_id = ?", (teacher_id,)
        )
        if not self._in_transaction:
            self._conn.commit()
        return cur.rowcount > 0

    def save_class(self, school_class: SchoolClass) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO classes (class_id, teacher_id, subject) "
            "VALUES (?, ?, ?)",
            (school_class.class_id, school_class.teacher_id, school_class.subject),
        )
        if not self._in_transaction:
            self._conn.commit()

    def get_class(self, class_id: str) -> SchoolClass | None:
        row = self._conn.execute(
            "SELECT * FROM classes WHERE class_id = ?", (class_id,)
        ).fetchone()
        return self._row_to_class(row) if row is not None else None

    def classes_for_teacher(self, teacher_id: str) -> tuple[SchoolClass, ...]:
        rows = self._conn.execute(
            "SELECT * FROM classes WHERE teacher_id = ? ORDER BY class_id",
            (teacher_id,),
        ).fetchall()
        return tuple(self._row_to_class(r) for r in rows)

    def delete_class(self, class_id: str) -> bool:
        cur = self._conn.execute(
            "DELETE FROM classes WHERE class_id = ?", (class_id,)
        )
        if not self._in_transaction:
            self._conn.commit()
        return cur.rowcount > 0

    @staticmethod
    def _row_to_class(row: sqlite3.Row) -> SchoolClass:
        return SchoolClass(
            class_id=row["class_id"],
            teacher_id=row["teacher_id"],
            subject=row["subject"],
        )

    def save_student(self, student: Student) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO students (student_id) VALUES (?)",
            (student.student_id,),
        )
        if not self._in_transaction:
            self._conn.commit()

    def get_student(self, student_id: str) -> Student | None:
        row = self._conn.execute(
            "SELECT student_id FROM students WHERE student_id = ?",
            (student_id,),
        ).fetchone()
        return Student(student_id=row["student_id"]) if row is not None else None

    def delete_student(self, student_id: str) -> bool:
        cur = self._conn.execute(
            "DELETE FROM students WHERE student_id = ?", (student_id,)
        )
        if not self._in_transaction:
            self._conn.commit()
        return cur.rowcount > 0

    def save_enrollment(self, enrollment: Enrollment) -> None:
        self._conn.execute(
            "INSERT OR REPLACE INTO enrollments "
            "(enrollment_id, class_id, student_id) VALUES (?, ?, ?)",
            (enrollment.enrollment_id, enrollment.class_id, enrollment.student_id),
        )
        if not self._in_transaction:
            self._conn.commit()

    def get_enrollment(self, enrollment_id: str) -> Enrollment | None:
        row = self._conn.execute(
            "SELECT * FROM enrollments WHERE enrollment_id = ?",
            (enrollment_id,),
        ).fetchone()
        return self._row_to_enrollment(row) if row is not None else None

    def enrollments_for_class(self, class_id: str) -> tuple[Enrollment, ...]:
        rows = self._conn.execute(
            "SELECT * FROM enrollments WHERE class_id = ? ORDER BY enrollment_id",
            (class_id,),
        ).fetchall()
        return tuple(self._row_to_enrollment(r) for r in rows)

    def students_for_class(self, class_id: str) -> tuple[Student, ...]:
        # DISTINCT: a student with >1 enrollment row in the same class (no
        # UNIQUE(class_id, student_id) constraint) must not fan-out to
        # duplicate pseudonyms in the join.
        rows = self._conn.execute(
            "SELECT DISTINCT s.student_id FROM students s "
            "JOIN enrollments e ON e.student_id = s.student_id "
            "WHERE e.class_id = ? ORDER BY s.student_id",
            (class_id,),
        ).fetchall()
        return tuple(Student(student_id=r["student_id"]) for r in rows)

    def classes_for_student(self, student_id: str) -> tuple[SchoolClass, ...]:
        # DISTINCT: mirror of students_for_class — a student with >1 enrollment
        # row in the same class (no UNIQUE(class_id, student_id) constraint)
        # must not fan-out to duplicate classes in the join.
        rows = self._conn.execute(
            "SELECT DISTINCT c.* FROM classes c "
            "JOIN enrollments e ON e.class_id = c.class_id "
            "WHERE e.student_id = ? ORDER BY c.class_id",
            (student_id,),
        ).fetchall()
        return tuple(self._row_to_class(r) for r in rows)

    def delete_enrollment(self, enrollment_id: str) -> bool:
        cur = self._conn.execute(
            "DELETE FROM enrollments WHERE enrollment_id = ?", (enrollment_id,)
        )
        if not self._in_transaction:
            self._conn.commit()
        return cur.rowcount > 0

    def purge_student(self, student_id: str) -> int:
        """Erase a pseudonymous student + all their enrollments atomically.

        Opens its own transaction (like ``purge_lesson``): not composable
        inside an outer ``begin_transaction`` — call it standalone.
        """
        self.begin_transaction()
        total = 0
        try:
            cur = self._conn.execute(
                "DELETE FROM enrollments WHERE student_id = ?", (student_id,)
            )
            total += cur.rowcount
            cur = self._conn.execute(
                "DELETE FROM students WHERE student_id = ?", (student_id,)
            )
            total += cur.rowcount
            self.commit_transaction()
        except BaseException:
            self.rollback_transaction()
            raise
        return total

    @staticmethod
    def _row_to_enrollment(row: sqlite3.Row) -> Enrollment:
        return Enrollment(
            enrollment_id=row["enrollment_id"],
            class_id=row["class_id"],
            student_id=row["student_id"],
        )

    # --- Consent-state: append-only GDPR consent audit trail ----------------

    def save_consent_event(self, event: ConsentEvent) -> None:
        # Plain INSERT, never INSERT OR REPLACE: the consent trail is an
        # append-only, tamper-evident audit log. A REPLACE on an existing
        # event_id would DELETE+INSERT and reassign the rowid, silently
        # reordering the (rowid-ordered) trail and so changing the derived
        # "latest event wins" state. A duplicate event_id is an integrity
        # violation and MUST raise, not overwrite history.
        self._conn.execute(
            "INSERT INTO consent_events "
            "(event_id, teacher_id, class_id, action, at, expires_at) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                event.event_id,
                event.teacher_id,
                event.class_id,
                event.action,
                event.at,
                event.expires_at,
            ),
        )
        if not self._in_transaction:
            self._conn.commit()

    def consent_events_for_relation(
        self, teacher_id: str, class_id: str
    ) -> tuple[ConsentEvent, ...]:
        # ORDER BY rowid = insertion (recording) order: the audit trail reads
        # chronologically by when each action was recorded, and the LAST row is
        # the most recently recorded event — robust to out-of-order ``at``
        # timestamps (clock skew never reorders the causal history).
        rows = self._conn.execute(
            "SELECT * FROM consent_events "
            "WHERE teacher_id = ? AND class_id = ? ORDER BY rowid",
            (teacher_id, class_id),
        ).fetchall()
        return tuple(self._row_to_consent_event(r) for r in rows)

    @staticmethod
    def _row_to_consent_event(row: sqlite3.Row) -> ConsentEvent:
        return ConsentEvent(
            event_id=row["event_id"],
            teacher_id=row["teacher_id"],
            class_id=row["class_id"],
            action=row["action"],
            at=row["at"],
            expires_at=row["expires_at"],
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
