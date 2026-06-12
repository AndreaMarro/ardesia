"""Abstract persistence layer for LessonOS (PLAN §14, "astrai il layer DB").

The engine talks to ``Store``, never to a concrete backend. v0 ships a SQLite
implementation; prod target is Postgres+pgvector — swapping it must not touch
callers. This base file fixes the contract; concrete backends live alongside.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from lessonos.models.entities import Lesson, Moment, Path, Segment, Source, GraphNode, GraphEdge, GraphEvidence
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
