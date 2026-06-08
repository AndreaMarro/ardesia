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
    - ``difficulty``: per-concept difficulty factor D ∈ [1.0, 10.0]
      (FSRS v4/v5 style). Higher = harder to retain. Default 5.0 (neutral).
    - ``estimated_retention``: power-law decay estimate of the probability
      the student still remembers this concept (0.0 to 1.0). Based on
      ``R = 1 / (1 + t/S)`` where stability (S) grows with each repetition,
      modulated by difficulty (D). Higher = better retained; lower = more
      urgent to review.
    """

    name: str
    first_introduced_lesson: str | None
    statuses: tuple[str, ...]
    lessons: tuple[str, ...]
    prerequisites: tuple[str, ...]
    repetition_count: int = 1
    last_reviewed_lesson: str | None = None
    difficulty: float = 5.0
    estimated_retention: float | None = None

    def __post_init__(self) -> None:
        """Validate difficulty is in [1.0, 10.0]."""
        if not (1.0 <= self.difficulty <= 10.0):
            raise ValueError(
                f"difficulty must be in [1.0, 10.0], got {self.difficulty}"
            )

    def update_after_review(self, quality: int) -> ConceptPathEntry:
        """Return a new ConceptPathEntry with difficulty updated after a review.

        Uses ``compute_difficulty_update`` to adjust the concept's difficulty
        based on the student's response quality (SM-2 scale 0-5). Leaves all
        other fields unchanged.

        Parameters
        ----------
        quality : int
            Student response quality on SM-2 scale: 0 (worst) to 5 (best).

        Returns
        -------
        ConceptPathEntry
            A new entry with updated difficulty. All other fields (name,
            statuses, lessons, etc.) are identical to ``self``.

        Raises
        ------
        ValueError
            If ``quality`` is outside [0, 5].
        """
        new_difficulty = compute_difficulty_update(self.difficulty, quality)
        return ConceptPathEntry(
            name=self.name,
            first_introduced_lesson=self.first_introduced_lesson,
            statuses=self.statuses,
            lessons=self.lessons,
            prerequisites=self.prerequisites,
            repetition_count=self.repetition_count,
            last_reviewed_lesson=self.last_reviewed_lesson,
            difficulty=new_difficulty,
            estimated_retention=self.estimated_retention,
        )


def compute_difficulty_update(
    difficulty: float,
    response_quality: int,
) -> float:
    """Update concept difficulty D based on student response quality (SM-2 / FSRS style).

    Models how a concept's difficulty changes after a student attempts an exercise
    or answers a question. The update follows a simplified SM-2 / FSRS approach:

    - **Good response (q=4, q=5)**: difficulty decreases (concept becomes easier
      for this student). Higher quality = stronger decrease.
      ``D' = D - (q - 3) * 0.3``
      q=5: -0.6, q=4: -0.3

    - **Hard response (q=3)**: slight difficulty increase to reflect struggle.
      ``D' = D + 0.1``

    - **Poor response (q=0,1,2)**: difficulty increases significantly.
      ``D' = D + (4 - q) * 0.5``
      q=0: +2.0, q=1: +1.5, q=2: +1.0

    Result is clamped to [1.0, 10.0].

    This is a simplified heuristic for LessonOS v0 (calibration empirica). The
    ratio of penalty-to-reward (~3.3:1, i.e., a poor response hurts 3.3x more
    than a good response helps) creates a pessimistic bias — once difficulty
    rises, it takes more good responses to bring it back down. This is
    intentional for v0: underestimating a student is safer than
    overestimating (avoids recommending material beyond their level).

    The full FSRS model (Ye 2023) learns per-card stability and difficulty
    from review history via maximum likelihood estimation with ~12 parameters.
    LessonOS v0 uses a simpler heuristic that preserves the directional
    behaviour of spaced-repetition theory without the cold-start problem of
    MLE. Future versions may calibrate these coefficients from real student
    data (Plan §19).

    Parameters
    ----------
    difficulty : float
        Current difficulty D ∈ [1.0, 10.0].
    response_quality : int
        Student response quality on SM-2 scale: 0 (worst) to 5 (best).

    Returns
    -------
    float
        Updated difficulty, clamped to [1.0, 10.0].

    Raises
    ------
    ValueError
        If ``difficulty`` is outside [1.0, 10.0] or ``response_quality``
        outside [0, 5].

    Examples
    --------
    >>> compute_difficulty_update(5.0, 5)  # perfect response, easier now
    4.4
    >>> compute_difficulty_update(5.0, 0)  # terrible response, much harder
    7.0
    >>> compute_difficulty_update(5.0, 3)  # hard response, slightly harder
    5.1
    """
    if not (1.0 <= difficulty <= 10.0):
        raise ValueError(
            f"difficulty must be in [1.0, 10.0], got {difficulty}"
        )
    if not (0 <= response_quality <= 5):
        raise ValueError(
            f"response_quality must be in [0, 5], got {response_quality}"
        )

    if response_quality >= 4:
        # Good response: difficulty decreases
        delta = (response_quality - 3) * 0.3
        new_d = difficulty - delta
    elif response_quality == 3:
        # Hard response: slight increase
        new_d = difficulty + 0.1
    else:
        # Poor response: significant increase
        # response_quality in {0,1,2} -> (4-q) in {4,3,2}
        delta = (4 - response_quality) * 0.5
        new_d = difficulty + delta

    return max(1.0, min(10.0, new_d))


def compute_retention(
    rep_count: int,
    lessons_since_review: int,
    *,
    initial_stability: float = 0.5,
    stability_multiplier: float = 1.5,
    difficulty: float = 5.0,
) -> float:
    """Estimate concept retention using a power-law decay model with per-concept difficulty.

    Formula: ``R = 1.0 / (1.0 + lessons_since_review / stability)``

    Where stability (S) grows with each repetition, modulated by difficulty:
    ``S = initial_stability * (stability_multiplier * difficulty_scaling) ** (rep_count - 1)``

    The ``difficulty_scaling = (11 - D) / 6`` factor (FSRS v4/v5 inspired) normalises
    so that D=5.0 (neutral) gives same growth as the base multiplier.
    Higher D = harder concept = slower stability growth = faster decay.

    Power-law decay (vs classic Ebbinghaus exponential e^{-t/S}) produces
    slower initial forgetting and a longer retention tail, a common
    simplification in SRS (Spaced Repetition Scheduling) research.
    The heat equation model of memory (Reddy et al., arXiv 1602.07032)
    shows that forgetting follows a power-law-like decay pattern.

    This is a simplified heuristic for LessonOS v0: the full FSRS model
    learns stability per-card from review performance with ~12 optimisable
    parameters (Ye 2023, FSRS v4: A Modern Spaced Repetition Algorithm,
    https://github.com/open-spaced-repetition/fsrs4anki). We approximate
    it from repetition count and lesson gaps, now with per-concept
    difficulty awareness.

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
        How much stability grows per repetition at neutral difficulty
        (default 1.5).
    difficulty : float
        Per-concept difficulty D ∈ [1.0, 10.0] (default 5.0).
        Higher = harder concept = slower stability growth.
        5.0 = neutral (base multiplier applies as-is).

    Returns
    -------
    float
        Estimated retention probability, in (0.0, 1.0].

    Raises
    ------
    ValueError
        If rep_count < 1, lessons_since_review < 0,
        stability params <= 0, or difficulty outside [1.0, 10.0].
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
    if not (1.0 <= difficulty <= 10.0):
        raise ValueError(
            f"difficulty must be in [1.0, 10.0], got {difficulty}"
        )

    # No decay for concepts just seen
    if lessons_since_review == 0:
        return 1.0

    # FSRS-inspired difficulty scaling: (11 - D) / 6
    # D=5 (neutral) -> scaling = 1.0 (no change to base multiplier)
    # D=10 (hardest) -> scaling = 0.167 (much slower growth, but always >= 1.0)
    # D=1 (easiest) -> scaling = 1.667 (much faster growth)
    difficulty_scaling = (11.0 - difficulty) / 6.0
    # effective_mult = 1 + (multiplier - 1) * scaling
    # ensures stability never decreases with reps for any D in [1, 10]
    effective_mult = 1.0 + (stability_multiplier - 1.0) * difficulty_scaling

    stability = initial_stability * (effective_mult ** (rep_count - 1))
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
                difficulty=5.0,  # default neutral difficulty; overridable in future
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


def apply_review_feedback(
    memory: PathMemory,
    review_qualities: dict[str, int],
) -> PathMemory:
    """Apply student review feedback to update concept difficulties.

    Takes a PathMemory and a mapping of ``{concept_name: SM-2 quality}``,
    returns a new PathMemory with updated difficulty values for the
    specified concepts. Uses ``ConceptPathEntry.update_after_review``
    internally.

    Parameters
    ----------
    memory : PathMemory
        Current PathMemory to update.
    review_qualities : dict[str, int]
        Mapping of concept name (case-insensitive) to SM-2 quality score
        (0–5). Only concepts in this dict are updated; other concepts
        retain their original difficulty.

    Returns
    -------
    PathMemory
        A new PathMemory with updated concept difficulties. The original
        ``memory`` is not mutated.

    Raises
    ------
    ValueError
        If any concept name in ``review_qualities`` is not found in
        ``memory.concept_graph``.
    """
    # Build case-insensitive lookup: lower_name -> index
    name_to_idx: dict[str, int] = {}
    for i, entry in enumerate(memory.concept_graph):
        name_to_idx[entry.name.lower()] = i

    # Normalize input to lowercase for case-insensitive matching
    review_norm: dict[str, int] = {}
    for k, v in review_qualities.items():
        kl = k.lower()
        if kl in review_norm:
            raise ValueError(
                f"duplicate concept name (case-insensitive): '{k}' conflicts with "
                f"another key that normalises to '{kl}'"
            )
        review_norm[kl] = v

    # Validate all concept names exist
    unknown = set(review_norm) - set(name_to_idx.keys())
    if unknown:
        raise ValueError(
            f"concept(s) not found in PathMemory: {sorted(unknown)}"
        )

    if not review_norm:
        # Empty dict: no changes, but return a new object (immutability
        # contract — the caller expects a fresh copy)
        return PathMemory(
            path_title=memory.path_title,
            current_state=memory.current_state,
            lesson_index=memory.lesson_index,
            concept_graph=memory.concept_graph,
            recurring_misconceptions=memory.recurring_misconceptions,
            exercise_bank=memory.exercise_bank,
            best_explanations=memory.best_explanations,
            total_lessons=memory.total_lessons,
            total_concepts=memory.total_concepts,
            total_exercises=memory.total_exercises,
        )

    # Build updated concept graph
    new_concepts: list[ConceptPathEntry] = []
    for entry in memory.concept_graph:
        key = entry.name.lower()
        if key in review_norm:
            new_entry = entry.update_after_review(review_norm[key])
            new_concepts.append(new_entry)
        else:
            new_concepts.append(entry)

    return PathMemory(
        path_title=memory.path_title,
        current_state=memory.current_state,
        lesson_index=memory.lesson_index,
        concept_graph=tuple(new_concepts),
        recurring_misconceptions=memory.recurring_misconceptions,
        exercise_bank=memory.exercise_bank,
        best_explanations=memory.best_explanations,
        total_lessons=memory.total_lessons,
        total_concepts=memory.total_concepts,
        total_exercises=memory.total_exercises,
    )


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
