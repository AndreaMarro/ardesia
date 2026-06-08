"""Path Memory — path-level aggregation from Lesson Capsules (PLAN §26.2).

Path Memory is the cumulative, progressive aggregation of all Lesson Capsules
and the Lesson Graph for a learning path. It answers:
  - What concepts have been covered, where, and in what status?
  - What are the recurring misconceptions?
  - What exercises are available?
  - What is the lesson index (summary of each lesson)?

This is the "path lens" (PLAN §8) — every lesson makes the next one smarter.
M3 milestone: aggregation only. Persistence and M4 (Didactic Delta / Learning
Debt) build on top of this foundation.
"""

from __future__ import annotations

from dataclasses import dataclass

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import ConceptExtraction


@dataclass(frozen=True)
class LessonIndexEntry:
    """A single entry in the lesson index (PLAN §26.2 lesson_index).

    Summarises one lesson: its topics, how many concepts/exercises it covered,
    and whether it introduced new concepts or reinforced existing ones.
    """

    lesson_id: str
    title: str
    topics: tuple[str, ...]
    concept_count: int
    exercise_count: int
    new_concepts: tuple[str, ...]
    reinforced_concepts: tuple[str, ...]

    @classmethod
    def from_capsule(cls, capsule: LessonCapsule) -> LessonIndexEntry:
        """Build a lesson index entry from a Lesson Capsule."""
        topics = tuple(span.topic for span in capsule.timeline)
        concepts = capsule.content.concepts
        exercises = capsule.content.exercises

        new_concepts = tuple(
            c.name for c in concepts if c.status == "introduced"
        )
        reinforced_concepts = tuple(
            c.name for c in concepts if c.status == "reinforced"
        )

        # Use the first topic title as lesson title fallback
        title = topics[0] if topics else capsule.lesson_id

        return cls(
            lesson_id=capsule.lesson_id,
            title=title,
            topics=topics,
            concept_count=len(concepts),
            exercise_count=len(exercises),
            new_concepts=new_concepts,
            reinforced_concepts=reinforced_concepts,
        )


@dataclass(frozen=True)
class ConceptPathEntry:
    """A concept tracked across the entire path (PLAN §26.2 concept_graph).

    Aggregates all occurrences of a concept across lessons: where it was first
    introduced, all lessons where it appears, all statuses it has held, and
    its declared prerequisites.

    Repetition tracking (SM-2 / FSRS inspired):
    - ``repetition_count``: how many lessons have covered this concept
      (1 = just introduced, 2+ = reviewed/reinforced)
    - ``last_reviewed_lesson``: the most recent lesson that included this
      concept (used to identify overdue concepts for retrieval-based
      scheduling in NextLessonPlan)
    - ``estimated_retention``: Ebbinghaus-decay estimate of the probability
      the student still remembers this concept (0.0 to 1.0). Based on
      ``R = e^(-lessons_since_review / stability)`` where stability
      increases with each repetition (FSRS-inspired). Higher = better
      retained; lower = more urgent to review.
    """

    name: str
    first_introduced_lesson: str | None
    statuses: tuple[str, ...]
    lessons: tuple[str, ...]
    prerequisites: tuple[str, ...]
    repetition_count: int = 1
    last_reviewed_lesson: str | None = None
    estimated_retention: float | None = None


def compute_retention(
    rep_count: int,
    lessons_since_review: int,
    *,
    initial_stability: float = 0.5,
    stability_multiplier: float = 1.5,
) -> float:
    """Estimate concept retention using a power-law decay model.

    Formula: ``R = 1.0 / (1.0 + lessons_since_review / stability)``

    Where stability (S) grows with each repetition:
    ``S = initial_stability * stability_multiplier^(rep_count - 1)``

    Power-law decay (vs classic Ebbinghaus exponential e^{-t/S}) produces
    slower initial forgetting and a longer retention tail, a common
    simplification in SRS (Spaced Repetition Scheduling) research.
    The heat equation model of memory (Reddy et al., arXiv 1602.07032,
    \"Unbounded Human Learning\") shows that forgetting follows a
    power-law-like decay pattern, not a pure exponential.

    This is a simplified heuristic for LessonOS v0: in a production SRS
    (e.g. FSRS v4.5), stability is learned per-card from review
    performance. We approximate it from repetition count and lesson gaps.

    Parameters
    ----------
    rep_count : int
        Number of times the concept has appeared in lessons (1+).
    lessons_since_review : int
        Number of lessons elapsed since the concept was last seen.
        Must be >= 0.
    initial_stability : float
        Base stability after first exposure (default 0.5).
    stability_multiplier : float
        How much stability grows per repetition (default 1.5).

    Returns
    -------
    float
        Estimated retention probability, in (0.0, 1.0].

    Raises
    ------
    ValueError
        If rep_count < 1, lessons_since_review < 0, or stability params <= 0.
    """
    if rep_count < 1:
        raise ValueError(f"rep_count must be >= 1, got {rep_count}")
    if lessons_since_review < 0:
        raise ValueError(
            f"lessons_since_review must be >= 0, got {lessons_since_review}"
        )
    if initial_stability <= 0:
        raise ValueError(
            f"initial_stability must be > 0, got {initial_stability}"
        )
    if stability_multiplier <= 0:
        raise ValueError(
            f"stability_multiplier must be > 0, got {stability_multiplier}"
        )

    # No decay for concepts just seen
    if lessons_since_review == 0:
        return 1.0

    stability = initial_stability * (stability_multiplier ** (rep_count - 1))
    return 1.0 / (1.0 + lessons_since_review / stability)


def _aggregate_concepts(
    capsules: list[LessonCapsule],
) -> tuple[ConceptPathEntry, ...]:
    """Aggregate all concepts from capsules into canonical ConceptPathEntries.

    Matching is case-insensitive on concept name. The first occurrence at
    status 'introduced' is tracked as the introduction lesson.
    """
    # concept_name_lower -> {name, first_intro, statuses: set, lessons: set, prereqs: set}
    aggregated: dict[str, dict] = {}

    for capsule in capsules:
        for concept in capsule.content.concepts:
            key = concept.name.lower()
            if key not in aggregated:
                aggregated[key] = {
                    "name": concept.name,
                    "first_intro": None,
                    "statuses": set(),
                    "lessons": set(),
                    "prereqs": set(),
                }
            entry = aggregated[key]
            entry["statuses"].add(concept.status)
            entry["lessons"].add(capsule.lesson_id)
            if concept.prerequisites:
                entry["prereqs"].update(concept.prerequisites)
            # Track first introduction: earliest lesson where status='introduced'
            if concept.status == "introduced" and entry["first_intro"] is None:
                entry["first_intro"] = capsule.lesson_id

    # Build sorted entries (by first introduction lesson order)
    def _lesson_order_key(entry: dict) -> int:
        if entry["first_intro"]:
            try:
                return next(
                    i
                    for i, c in enumerate(capsules)
                    if c.lesson_id == entry["first_intro"]
                )
            except StopIteration:
                return len(capsules)
        return len(capsules)

    sorted_entries = sorted(aggregated.values(), key=_lesson_order_key)

    # Precompute lesson -> index mapping for retention calculation
    total_lessons = len(capsules)
    lesson_index_map = {c.lesson_id: i for i, c in enumerate(capsules)}

    # Build entries with explicit ordered lessons variable
    entries: list[ConceptPathEntry] = []
    for e in sorted_entries:
        ordered = _ordered_lessons(e["lessons"], capsules)
        if not ordered:
            # Every concept in aggregated must have at least one lesson
            # (invariant: we only add to aggregated when we see a concept
            # in a capsule's content)
            continue
        entries.append(
            ConceptPathEntry(
                name=e["name"],
                first_introduced_lesson=e["first_intro"],
                statuses=tuple(sorted(e["statuses"])),
                lessons=tuple(ordered),
                prerequisites=tuple(sorted(e["prereqs"])),
                repetition_count=len(ordered),
                last_reviewed_lesson=ordered[-1],
                estimated_retention=compute_retention(
                    rep_count=len(ordered),
                    lessons_since_review=(
                        total_lessons - 1 - lesson_index_map[ordered[-1]]
                    ),
                ),
            )
        )

    return tuple(entries)


def _ordered_lessons(
    lesson_ids: set[str], capsules: list[LessonCapsule]
) -> list[str]:
    """Return lesson IDs in the order they appear in the capsules list."""
    order = {c.lesson_id: i for i, c in enumerate(capsules)}
    return sorted(lesson_ids, key=lambda lid: order.get(lid, len(capsules)))


def _collect_misconceptions(
    capsules: list[LessonCapsule],
) -> tuple[str, ...]:
    """Collect all student questions as 'recurring_misconceptions'.

    For v0, student questions are the primary signal for misconceptions.
    Full misconception extraction (PLAN §26.2 recurring_misconceptions)
    will be enriched in M4 (Didactic Delta).
    """
    questions: list[str] = []
    for capsule in capsules:
        for q in capsule.content.student_questions:
            questions.append(f'"{q.question}" (in {capsule.lesson_id})')
    return tuple(questions)


def _collect_exercise_bank(
    capsules: list[LessonCapsule],
) -> tuple[str, ...]:
    """Collect all exercise prompts from all lessons."""
    prompts: list[str] = []
    for capsule in capsules:
        for ex in capsule.content.exercises:
            prompts.append(f"[{capsule.lesson_id}] {ex.prompt}")
    return tuple(prompts)


@dataclass(frozen=True)
class PathMemory:
    """Path-level cumulative aggregation (PLAN §26.2).

    Built from all Lesson Capsules in a path plus the Lesson Graph.
    Each field is derived entirely from the capsules — no LLM calls,
    no fabricated data. Concept aggregation is deterministic and
    case-insensitive.
    """

    path_title: str | None
    current_state: str
    lesson_index: tuple[LessonIndexEntry, ...]
    concept_graph: tuple[ConceptPathEntry, ...]
    recurring_misconceptions: tuple[str, ...]
    exercise_bank: tuple[str, ...]
    best_explanations: tuple[str, ...]
    total_lessons: int
    total_concepts: int
    total_exercises: int


def build_path_memory(
    capsules: list[LessonCapsule],
    *,
    path_title: str | None = None,
) -> PathMemory:
    """Build Path Memory from Lesson Capsules.

    Aggregates lesson index, canonical concepts, exercise bank, and recurring
    misconceptions from all capsules in the path. The Lesson Graph (nodes/edges)
    is reserved for M4 Didactic Delta enrichment and is not consumed here.

    Parameters
    ----------
    capsules : list[LessonCapsule]
        All Lesson Capsules in the path, in order.
    path_title : str, optional
        Title for the path. Defaults to first capsule's first topic or None.

    Returns
    -------
    PathMemory
        Aggregated path-level memory.

    Raises
    ------
    ValueError
        If capsules list is empty.
    """
    if not capsules:
        raise ValueError("at least one capsule is required to build Path Memory")

    effective_title = path_title
    if effective_title is None:
        first_topics = capsules[0].timeline
        if first_topics:
            effective_title = first_topics[0].topic

    # Determine path state based on lesson count
    n = len(capsules)
    if n == 1:
        state = "initial"
    elif n <= 3:
        state = "growing"
    else:
        state = "mature"

    # Build lesson index
    lesson_index = tuple(LessonIndexEntry.from_capsule(c) for c in capsules)

    # Aggregate concepts
    concept_graph = _aggregate_concepts(capsules)

    # Collect recurring misconceptions
    misconceptions = _collect_misconceptions(capsules)

    # Collect exercise bank
    exercise_bank = _collect_exercise_bank(capsules)

    # Best explanations: placeholder for M4 Didactic Delta enrichment.
    # v0 mirrors exercise_bank; M4 will select the best explanation per concept
    # by comparing across lessons (best_explanations.py).
    best_explanations = tuple(
        f"[{c.lesson_id}] {ex.prompt}"
        for c in capsules
        for ex in c.content.exercises
    )

    # Count totals
    total_concepts = len(concept_graph)
    total_exercises = sum(len(c.content.exercises) for c in capsules)

    return PathMemory(
        path_title=effective_title,
        current_state=state,
        lesson_index=lesson_index,
        concept_graph=concept_graph,
        recurring_misconceptions=misconceptions,
        exercise_bank=exercise_bank,
        best_explanations=best_explanations,
        total_lessons=n,
        total_concepts=total_concepts,
        total_exercises=total_exercises,
    )
