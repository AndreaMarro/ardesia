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
