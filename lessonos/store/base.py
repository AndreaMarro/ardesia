"""Abstract persistence layer for LessonOS (PLAN §14, "astrai il layer DB").

The engine talks to ``Store``, never to a concrete backend. v0 ships a SQLite
implementation; prod target is Postgres+pgvector — swapping it must not touch
callers. This base file fixes the contract; concrete backends live alongside.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from lessonos.models.entities import Lesson, Moment, Path, Segment, Source, GraphNode, GraphEdge, GraphEvidence
from lessonos.models.crm import Enrollment, SchoolClass, Student, Teacher
from lessonos.models.ledger import CostLedgerEntry


class Store(ABC):
    """Persistence contract for the domain entities (round-trip, no I/O leak)."""

    @abstractmethod
    def save_path(self, path: Path) -> None: ...

    @abstractmethod
    def get_path(self, path_id: str) -> Path | None: ...

    @abstractmethod
    def paths_for_teacher(self, teacher_id: str) -> tuple[Path, ...]:
        """Retrieve all paths owned by *teacher_id* (M1-1)."""

    def all_paths(self) -> tuple[Path, ...]:
        """Retrieve ALL paths in the store, ordered by path_id.

        Default: NotImplementedError (not all backends need this).
        """
        raise NotImplementedError("all_paths not implemented by this store")

    def all_lessons(self) -> tuple[Lesson, ...]:
        """Retrieve ALL lessons in the store, ordered by lesson_id.

        Default: NotImplementedError (not all backends need this).
        """
        raise NotImplementedError("all_lessons not implemented by this store")

    @abstractmethod
    def save_lesson(self, lesson: Lesson) -> None: ...

    @abstractmethod
    def get_lesson(self, lesson_id: str) -> Lesson | None: ...

    @abstractmethod
    def lessons_for_path(self, path_id: str) -> tuple[Lesson, ...]: ...

    @abstractmethod
    def save_source(self, source: Source) -> None: ...

    @abstractmethod
    def get_source(self, source_id: str) -> Source | None: ...

    @abstractmethod
    def save_segment(self, segment: Segment) -> None: ...

    @abstractmethod
    def get_segment(self, seg_id: str) -> Segment | None: ...

    @abstractmethod
    def segments_for_lesson(self, lesson_id: str) -> tuple[Segment, ...]: ...

    @abstractmethod
    def save_moment(self, moment: Moment) -> None: ...

    @abstractmethod
    def get_moment(self, moment_id: str) -> Moment | None: ...

    @abstractmethod
    def moments_for_lesson(self, lesson_id: str) -> tuple[Moment, ...]: ...

    @abstractmethod
    def save_capsule(self, lesson_id: str, capsule_data: str) -> None:
        """Persist a serialised Lesson Capsule (JSON blob) for a lesson.

        The capsule is the output of the M2 pipeline (PLAN §26.1). Storing it
        avoids re-running the LLM pipeline on every read. ``capsule_data`` is a
        JSON-serialised :class:`~lessonos.capsule.assembly.LessonCapsule` —
        the store does not parse it, so there is no circular dependency.
        """
        ...

    @abstractmethod
    def get_capsule(self, lesson_id: str) -> str | None:
        """Retrieve a previously persisted capsule blob, or ``None``."""
        ...

    @abstractmethod
    def delete_capsule(self, lesson_id: str) -> bool:
        """Delete a persisted capsule for *lesson_id*.

        Returns ``True`` if a capsule existed and was deleted, ``False`` if
        no capsule existed (idempotent).
        """
        ...

    @abstractmethod
    def purge_lesson(self, lesson_id: str) -> int:
        """Fully erase every DB trace of *lesson_id* from the store.

        Deletes segments, moments, capsule, graph nodes, graph edges,
        evidence, cost-ledger rows, the lesson row itself, and removes the
        lesson from every path's ``lesson_ids`` — in a single transaction
        (all-or-nothing). Returns the total number of rows/items deleted.

        This is the GDPR erasure primitive for the DB (Mode A): after it
        returns, no store read can serve data for *lesson_id*. Filesystem
        artifacts (``derived/wiki/<lesson>.md``) are NOT the store's job —
        callers wanting full erasure use ``pipeline.erase_lesson``.

        Idempotent: a second purge on the same lesson returns 0.
        """
        ...

    @abstractmethod
    def close(self) -> None:
        ...

    # --- Cost Ledger -----------------------------------------------------

    @abstractmethod
    def save_ledger_entry(self, entry: CostLedgerEntry) -> None:
        """Persist a single cost ledger entry."""

    @abstractmethod
    def get_ledger_entries(self) -> tuple[CostLedgerEntry, ...]:
        """Retrieve ALL cost ledger entries, ordered by entry_id."""

    @abstractmethod
    def get_ledger_for_lesson(self, lesson_id: str) -> tuple[CostLedgerEntry, ...]:
        """Retrieve cost ledger entries for a specific lesson."""

    # --- Graph tables (T5 graph_writer) ----------------------------------

    @abstractmethod
    def save_graph_node(self, lesson_id: str, node: GraphNode) -> None:
        """Persist a graph node for a lesson."""

    @abstractmethod
    def get_graph_nodes_for_lesson(self, lesson_id: str) -> tuple[GraphNode, ...]:
        """Retrieve all graph nodes for a lesson."""

    def all_concept_nodes(self) -> tuple[GraphNode, ...]:
        """All concept nodes across the corpus (node_type='concept'), ordered by node_id.

        Used at ingest to canonicalise a lesson's prerequisites against the
        concepts already persisted from prior lessons (GS-3 cross-lesson
        ``depends_on``). Default: empty — a backend that cannot enumerate the
        corpus simply persists no cross-lesson ``depends_on`` (additive
        degradation, never an error).
        """
        return ()

    def all_depends_on_edges(self) -> tuple[GraphEdge, ...]:
        """All persisted ``depends_on`` edges across the corpus, ordered by edge_id.

        Used as a cycle guard when persisting new ``depends_on`` edges at
        ingest. Default: empty (see :meth:`all_concept_nodes`).
        """
        return ()

    @abstractmethod
    def save_graph_edge(self, lesson_id: str, edge: GraphEdge) -> None:
        """Persist a graph edge for a lesson."""

    @abstractmethod
    def get_graph_edges_for_lesson(self, lesson_id: str) -> tuple[GraphEdge, ...]:
        """Retrieve all graph edges for a lesson."""

    @abstractmethod
    def save_evidence(self, evidence: GraphEvidence) -> None:
        """Persist a piece of graph evidence."""

    @abstractmethod
    def get_evidence_for_edge(self, edge_id: str) -> tuple[GraphEvidence, ...]:
        """Retrieve all evidence for a graph edge."""

    @abstractmethod
    def get_all_evidence_for_lesson(self, lesson_id: str) -> tuple[GraphEvidence, ...]:
        """Retrieve all evidence for a lesson's graph."""

    @abstractmethod
    def delete_graph_for_lesson(self, lesson_id: str) -> None:
        """Delete all graph data (nodes, edges, evidence) for a lesson."""

    def delete_graph_edge(self, edge_id: str) -> None:
        """Delete a single graph edge by id.

        Used to invalidate a stale inbound cross-lesson ``depends_on`` edge
        when its (positional) target concept is re-ingested with a different
        meaning (GS-3 reconciliation). Default: no-op — only reachable for
        backends that enumerate ``all_depends_on_edges`` (others return empty,
        so reconciliation never deletes anything)."""

    # --- CRM: anonymised teacher / class / student relation (CRM-primitives) -
    #
    # CRUD over the pseudonymous roster. Concrete defaults raise
    # NotImplementedError (like ``all_paths``): a backend that does not manage a
    # roster simply does not override them — never an abstract method, so
    # existing stub Stores stay instantiable (additive degradation).

    def save_teacher(self, teacher: Teacher) -> None:
        """Create or update a teacher (upsert by ``teacher_id``)."""
        raise NotImplementedError("save_teacher not implemented by this store")

    def get_teacher(self, teacher_id: str) -> Teacher | None:
        raise NotImplementedError("get_teacher not implemented by this store")

    def all_teachers(self) -> tuple[Teacher, ...]:
        raise NotImplementedError("all_teachers not implemented by this store")

    def delete_teacher(self, teacher_id: str) -> bool:
        """Delete a teacher; ``True`` if one existed (idempotent)."""
        raise NotImplementedError("delete_teacher not implemented by this store")

    def save_class(self, school_class: SchoolClass) -> None:
        """Create or update a class (upsert by ``class_id``)."""
        raise NotImplementedError("save_class not implemented by this store")

    def get_class(self, class_id: str) -> SchoolClass | None:
        raise NotImplementedError("get_class not implemented by this store")

    def classes_for_teacher(self, teacher_id: str) -> tuple[SchoolClass, ...]:
        raise NotImplementedError(
            "classes_for_teacher not implemented by this store"
        )

    def delete_class(self, class_id: str) -> bool:
        raise NotImplementedError("delete_class not implemented by this store")

    def save_student(self, student: Student) -> None:
        """Create or update a student (upsert by ``student_id``)."""
        raise NotImplementedError("save_student not implemented by this store")

    def get_student(self, student_id: str) -> Student | None:
        raise NotImplementedError("get_student not implemented by this store")

    def delete_student(self, student_id: str) -> bool:
        raise NotImplementedError("delete_student not implemented by this store")

    def save_enrollment(self, enrollment: Enrollment) -> None:
        """Create or update an enrollment (upsert by ``enrollment_id``)."""
        raise NotImplementedError("save_enrollment not implemented by this store")

    def get_enrollment(self, enrollment_id: str) -> Enrollment | None:
        raise NotImplementedError("get_enrollment not implemented by this store")

    def enrollments_for_class(self, class_id: str) -> tuple[Enrollment, ...]:
        raise NotImplementedError(
            "enrollments_for_class not implemented by this store"
        )

    def students_for_class(self, class_id: str) -> tuple[Student, ...]:
        """Pseudonymous students enrolled in *class_id* (via enrollments)."""
        raise NotImplementedError(
            "students_for_class not implemented by this store"
        )

    def classes_for_student(self, student_id: str) -> tuple[SchoolClass, ...]:
        """All classes *student_id* is enrolled in (reverse of enrollment)."""
        raise NotImplementedError(
            "classes_for_student not implemented by this store"
        )

    def delete_enrollment(self, enrollment_id: str) -> bool:
        raise NotImplementedError(
            "delete_enrollment not implemented by this store"
        )

    def purge_student(self, student_id: str) -> int:
        """GDPR erasure of a pseudonymous student: delete the student row and
        all their enrollments in one transaction (all-or-nothing). Returns the
        number of rows removed; idempotent (second call returns 0).
        """
        raise NotImplementedError("purge_student not implemented by this store")

    # --- Transaction support ------------------------------------------------

    @abstractmethod
    def begin_transaction(self) -> None:
        """Begin an explicit SQLite transaction.

        Inside a transaction, auto-commits on save/delete methods are
        suppressed. Callers MUST pair with commit_transaction or
        rollback_transaction.
        """

    @abstractmethod
    def commit_transaction(self) -> None:
        """Commit the current transaction."""

    @abstractmethod
    def rollback_transaction(self) -> None:
        """Roll back the current transaction, discarding all changes since begin."""
