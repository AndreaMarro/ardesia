"""Domain entities for the LessonOS data model (PLAN §7 + §14 + §3.2 + §26.1).

Plain frozen dataclasses — the headless core of the lesson graph. Constrained
vocabularies (graph edge types §3.2, concept status §26.1) are validated at
construction so an invalid value fails fast instead of corrupting the graph.
Persistence (SQLite) and ingest live in later milestones; this module is pure
domain, no I/O.
"""

from __future__ import annotations

from dataclasses import dataclass, field

# PLAN §3.2 / §14.2 — the only legal Lesson Graph edge types.
EDGE_TYPES: frozenset[str] = frozenset(
    {
        "explains",
        "depends_on",
        "revises",
        "contradicts",
        "repeats",
        "exemplifies",
        "assesses",
        "derived_from",
        "assigned_in",
        "resolved_by",
        "prepares",
    }
)

# PLAN §26.1 — concept status within a Lesson Capsule.
CONCEPT_STATUS: frozenset[str] = frozenset(
    {"introduced", "reinforced", "reviewed", "problematic"}
)


@dataclass(frozen=True)
class Path:
    """A learning path: ordered lessons over a subject (PLAN §7, fixtures path.json)."""

    path_id: str
    title: str
    subject: str
    lesson_ids: tuple[str, ...] = ()
    source_ids: tuple[str, ...] = ()
    synthetic: bool = False


@dataclass(frozen=True)
class Lesson:
    lesson_id: str
    path_id: str
    title: str
    order: int
    source_id: str | None = None


@dataclass(frozen=True)
class Source:
    source_id: str
    title: str
    kind: str = "text"


@dataclass(frozen=True)
class Segment:
    """A transcript segment of a lesson (PLAN §26.1 transcript).

    The grounding anchor: every citation in a Lesson Capsule must point at an
    existing ``seg_id`` (PLAN §13.4) — no invented references. ``start``/``end``
    are seconds into the lesson.
    """

    seg_id: str
    lesson_id: str
    start: int
    end: int
    text: str


@dataclass(frozen=True)
class Moment:
    """A point in a lesson timeline (PLAN §7 Moment / §14 timeline_events)."""

    moment_id: str
    lesson_id: str
    t: int
    kind: str
    seg_id: str | None = None


@dataclass(frozen=True)
class Concept:
    """A concept tracked across the path (PLAN §26.1)."""

    concept_id: str
    name: str
    status: str
    lesson_id: str | None = None
    prerequisites: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        if self.status not in CONCEPT_STATUS:
            raise ValueError(
                f"invalid concept status: {self.status!r} "
                f"(expected one of {sorted(CONCEPT_STATUS)})"
            )


@dataclass(frozen=True)
class Exercise:
    exercise_id: str
    lesson_id: str
    prompt: str
    solution: str | None = None


@dataclass(frozen=True)
class LearningDebtItem:
    """A debt entry: unmastered concept, open doubt, uncorrected exercise (PLAN §3.4)."""

    debt_id: str
    path_id: str
    kind: str
    description: str
    lesson_id: str | None = None
    resolved: bool = False
    severity: float = 1.0
    citations: tuple[str, ...] = ()


@dataclass(frozen=True)
class GraphNode:
    """A node in the Lesson Graph (PLAN §3.2) pointing at a domain entity."""

    node_id: str
    node_type: str
    ref_id: str
    label: str | None = None


@dataclass(frozen=True)
class GraphEdge:
    """A typed edge in the Lesson Graph (PLAN §3.2). edge_type ∈ EDGE_TYPES."""

    edge_id: str
    source: str
    target: str
    edge_type: str
    metadata: dict[str, str] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.edge_type not in EDGE_TYPES:
            raise ValueError(
                f"invalid edge_type: {self.edge_type!r} "
                f"(expected one of {sorted(EDGE_TYPES)})"
            )


@dataclass(frozen=True)
class GraphEvidence:
    """A piece of evidence grounding a graph edge to a real transcript segment (T5).

    Every edge in the Lesson Graph must have at least one piece of evidence
    that proves the edge is grounded in the actual transcript. The ``excerpt``
    is a verbatim substring of the segment text — never a paraphrase.
    """

    evidence_id: str
    edge_id: str
    seg_id: str
    excerpt: str | None = None
    confidence: float | None = None
    lesson_id: str = ""
