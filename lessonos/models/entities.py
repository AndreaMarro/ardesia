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
    {"introduced", "reinforced", "reviewed", "problematic", "mastered"}
)

# Progression order: from least to most advanced (M1-1 per-docente aggregate).
# A merged concept takes the most advanced status among its occurrences.
STATUS_ORDER: dict[str, int] = {
    "introduced": 0,
    "reinforced": 1,
    "reviewed": 2,
    "problematic": 3,
    "mastered": 4,
}


@dataclass(frozen=True)
class Path:
    """A learning path: ordered lessons over a subject (PLAN §7, fixtures path.json).

    ``teacher_id`` (M1-1) optionally links the path to a teacher. When set,
    the path's lessons contribute to the teacher's aggregated knowledge graph.
    One teacher may have multiple paths (courses).
    """

    path_id: str
    title: str
    subject: str
    lesson_ids: tuple[str, ...] = ()
    source_ids: tuple[str, ...] = ()
    synthetic: bool = False
    teacher_id: str | None = None


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


@dataclass(frozen=True)
class AggregatedPathNode:
    """A concept node aggregated across all lessons in a path (M1-1).

    Unlike ``GraphNode`` which is per-lesson, this carries provenance from
    every lesson where the concept appears. The ``status`` is the most
    advanced status among all occurrences (see STATUS_ORDER).

    ``dedup_key`` (M1-1c) is the key the aggregator merged this node under:
    the global canonical when a resolution mapping was consumed, else the
    per-lesson canonical (M1-1b), else the normalised label. It lets
    downstream consumers (TeacherBook) re-find the node's per-lesson
    occurrences even when their labels differ across lessons.
    """

    node_id: str
    label: str
    status: str
    lesson_ids: tuple[str, ...] = ()
    evidence_count: int = 0
    dedup_key: str = ""

    def __post_init__(self) -> None:
        if self.status not in CONCEPT_STATUS:
            raise ValueError(
                f"invalid aggregated concept status: {self.status!r} "
                f"(expected one of {sorted(CONCEPT_STATUS)})"
            )


@dataclass(frozen=True)
class AggregatedPathGraph:
    """The aggregated graph for an entire path/teacher (M1-1).

    ``merged_nodes`` — one AggregatedPathNode per unique concept across all
    path lessons, deduplicated by normalized name.
    ``existing_edges`` — all GraphEdges from all path lessons (union).
    ``path_evidence`` — all GraphEvidence from all path lessons (union).
    Each carries its original lesson_id for provenance.
    ``raw_to_merged`` — maps every raw node id (e.g. ``l1:concept:0``) to its
    merged ``path:...`` node id (M1-7b fix). Empty when no capsules exist.
    """

    path_id: str
    merged_nodes: tuple[AggregatedPathNode, ...] = ()
    existing_edges: tuple[GraphEdge, ...] = ()
    path_evidence: tuple[GraphEvidence, ...] = ()
    raw_to_merged: dict[str, str] = field(default_factory=dict)


@dataclass(frozen=True)
class TeacherConcept:
    """A concept in the teacher's book (M1-2).

    Unlike ``AggregatedPathNode`` which carries aggregated metadata, this is
    a renderable concept entry with edge connectivity stats and grounded
    citations from every lesson where the concept appears.
    """

    name: str
    canonical: str
    status: str
    lesson_ids: tuple[str, ...] = ()
    edge_count: int = 0
    evidence_count: int = 0
    citations: tuple[GraphEvidence, ...] = ()

    def __post_init__(self) -> None:
        if self.status not in CONCEPT_STATUS:
            raise ValueError(
                f"invalid teacher concept status: {self.status!r} "
                f"(expected one of {sorted(CONCEPT_STATUS)})"
            )


@dataclass(frozen=True)
class ConceptProgression:
    """A concept's status progression across lessons (M1-2).

    ``first_lesson`` is where the concept was introduced.
    ``status_sequence`` tracks evolution (e.g. ``("introduced", "reinforced")``).
    ``lesson_sequence`` parallels status_sequence — the lesson where each
    status was observed.
    """

    name: str
    canonical: str
    first_lesson: str
    status_sequence: tuple[str, ...] = ()
    lesson_sequence: tuple[str, ...] = ()


@dataclass(frozen=True)
class PrerequisiteChain:
    """A concept and its prerequisites (M1-2).

    ``prerequisites`` are concept names (canonical) that this concept
    ``depends_on``. Derived from ``depends_on`` edges in the aggregated graph.
    """

    concept: str
    canonical: str
    prerequisites: tuple[str, ...] = ()
    lesson_ids: tuple[str, ...] = ()


@dataclass(frozen=True)
class TeacherBook:
    """Structured teacher's map from the aggregated graph (M1-2, ZERO-LLM).

    Organizes concepts from ``AggregatedPathGraph`` into thematic sections:
    overview statistics, fundamental (most-connected) concepts, problematic
    concepts, status progression, and prerequisite chains. All grounded in
    the original transcript evidence.

    Produced entirely without LLM calls — deterministic, free, and testable.
    The markdown renderer in ``teacher_book.py`` converts this to human-
    readable output.
    """

    teacher_id: str
    total_concepts: int = 0
    total_lessons: int = 0
    total_edges: int = 0
    total_evidence: int = 0
    fundamental_concepts: tuple[TeacherConcept, ...] = ()
    problematic_concepts: tuple[TeacherConcept, ...] = ()
    progression: tuple[ConceptProgression, ...] = ()
    prerequisites: tuple[PrerequisiteChain, ...] = ()
