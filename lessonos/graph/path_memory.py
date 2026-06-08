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

    Repetition tracking (SM-2 inspired):
    - ``repetition_count``: how many lessons have covered this concept
      (1 = just introduced, 2+ = reviewed/reinforced)
    - ``last_reviewed_lesson``: the most recent lesson that included this
      concept (used to identify overdue concepts for retrieval-based
      scheduling in NextLessonPlan)
    """

    name: str
    first_introduced_lesson: str | None
    statuses: tuple[str, ...]
    lessons: tuple[str, ...]
    prerequisites: tuple[str, ...]
    repetition_count: int = 1
    last_reviewed_lesson: str | None = None


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

    return tuple(
        ConceptPathEntry(
            name=e["name"],
            first_introduced_lesson=e["first_intro"],
            statuses=tuple(sorted(e["statuses"])),
            lessons=tuple(_ordered_lessons(e["lessons"], capsules)),
            prerequisites=tuple(sorted(e["prereqs"])),
            repetition_count=len(_ordered_lessons(e["lessons"], capsules)),
            last_reviewed_lesson=_ordered_lessons(e["lessons"], capsules)[-1]
            if e["lessons"]
            else None,
        )
        for e in sorted_entries
    )


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
