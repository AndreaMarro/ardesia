"""Learning Debt Ledger — consolidated debt items from PathMemory + DidacticDelta (PLAN §3.4).

The Learning Debt Ledger is the "health report" of a learning path. It aggregates
all unresolved didactic debt into actionable items, each with evidence and citations:

- **Unmastered concepts**: concepts still "problematic" after the latest lesson(s)
- **Under-practiced concepts**: concepts covered in lessons but with few exercises
- **Over-repeated concepts**: concepts appearing in 3+ lessons (may indicate over-coverage)
- **Open doubts**: unresolved student questions / recurring misconceptions
- **Weak prerequisites**: concepts declared as prerequisites but never introduced in the path

Every debt item carries a deterministic debt_id, a kind, a human-readable description,
the lesson where it was identified, and whether it has been resolved (all false in v0).
This feeds directly into the Next Lesson Planner (M4-task3, PLAN §8.2).

The computation is pure — zero LLM calls, zero DB persistence. It uses only:
- PathMemory (concept_graph, recurring_misconceptions)
- DidacticDelta (still_open_concepts, under_practiced_concepts, over_repeated_concepts)
"""

from __future__ import annotations

from dataclasses import dataclass
from types import MappingProxyType

from lessonos.graph.didactic_delta import DidacticDelta
from lessonos.graph.path_memory import PathMemory
from lessonos.models.entities import LearningDebtItem

# Valid debt kinds (PLAN §3.4)
DEBT_KINDS: frozenset[str] = frozenset(
    {
        "unmastered_concept",
        "under_practiced",
        "over_repeated",
        "open_doubt",
        "weak_prerequisite",
    }
)


@dataclass(frozen=True)
class LearningDebtLedger:
    """Consolidated learning debt for a path (PLAN §3.4 + §26.2 learning_debt).

    Aggregates all unresolved didactic debt items from the PathMemory and
    DidacticDelta into a single ledger. Each item is a LearningDebtItem with
    a deterministic debt_id, evidenced description, and source lesson.

    Fields
    ------
    items : tuple[LearningDebtItem, ...]
        All individual debt items, ordered by kind then by description.
    total_items : int
        Total number of debt items.
    by_kind : MappingProxyType[str, int]
        Immutable view of counts per debt kind
        (e.g. {"unmastered_concept": 3, ...}).
    """

    items: tuple[LearningDebtItem, ...]
    total_items: int
    by_kind: MappingProxyType[str, int]


def _build_debt_id(path_id: str, kind: str, index: int) -> str:
    """Build a deterministic debt_id."""
    return f"{path_id}#{kind}#{index}"


def _detect_unmastered(
    memory: PathMemory,
    delta: DidacticDelta,
    path_id: str,
) -> list[LearningDebtItem]:
    """Debt: concepts with 'problematic' status in the PathMemory.

    Sources:
    1. Delta.still_open_concepts — concepts problematic in old AND still problematic in new.
    2. PathMemory.concept_graph — ANY concept with 'problematic' status
       (including newly-introduced problematic concepts).

    Dedup by concept name to avoid duplicate debt items.

    ``severity`` is derived from per-concept difficulty (FSRS-style):
    ``severity = 1.0 + (difficulty - 5.0) / 5.0``, clamped to [0.2, 2.0].
    Higher difficulty = more urgent debt.
    """
    seen: set[str] = set()
    items: list[LearningDebtItem] = []
    idx: int = 0

    # Build a difficulty lookup from PathMemory concept_graph
    _diff_lookup: dict[str, float] = {}
    for cpe in memory.concept_graph:
        _diff_lookup[cpe.name.lower()] = cpe.difficulty or 5.0

    def _severity_from_difficulty(d: float) -> float:
        """Map difficulty D ∈ [1,10] to severity ∈ [0.2, 2.0].

        D=5.0 → 1.0 (neutral baseline)
        D=10.0 → 2.0 (2x more urgent)
        D=1.0 → 0.2 (5x less urgent)
        """
        return max(0.2, min(2.0, 1.0 + (d - 5.0) / 5.0))

    # From delta: still-open concepts (problematic then and now)
    for i, change in enumerate(delta.still_open_concepts):
        if change.name.lower() in seen:
            continue
        seen.add(change.name.lower())
        lesson_ids = change.new_lessons
        last_lesson = lesson_ids[-1] if lesson_ids else None
        diff = _diff_lookup.get(change.name.lower(), 5.0)
        items.append(
            LearningDebtItem(
                debt_id=_build_debt_id(path_id, "unmastered_concept", idx),
                path_id=path_id,
                kind="unmastered_concept",
                severity=_severity_from_difficulty(diff),
                description=(
                    f'Concept "{change.name}" is still problematic '
                    f"(statuses: {', '.join(change.new_statuses)}). "
                    f"Needs clarification in a future lesson."
                ),
                lesson_id=last_lesson,
                resolved=False,
                citations=(
                    f"Still problematic concept: {change.name}",
                    f"Statuses: {', '.join(change.new_statuses)}",
                    f"Lessons: {', '.join(change.new_lessons)}",
                ),
            )
        )
        idx += 1

    # From PathMemory directly: any concept with 'problematic' status
    for cpe in memory.concept_graph:
        if "problematic" in cpe.statuses and cpe.name.lower() not in seen:
            seen.add(cpe.name.lower())
            lesson_ids = cpe.lessons
            last_lesson = lesson_ids[-1] if lesson_ids else None
            diff = _diff_lookup.get(cpe.name.lower(), 5.0)
            items.append(
                LearningDebtItem(
                    debt_id=_build_debt_id(
                        path_id, "unmastered_concept", idx
                    ),
                    path_id=path_id,
                    kind="unmastered_concept",
                    severity=_severity_from_difficulty(diff),
                    description=(
                        f'Concept "{cpe.name}" is problematic '
                        f"(statuses: {', '.join(cpe.statuses)}). "
                        f"Needs clarification in a future lesson."
                    ),
                    lesson_id=last_lesson,
                    resolved=False,
                    citations=(
                        f"Problematic concept: {cpe.name}",
                        f"Statuses: {', '.join(cpe.statuses)}",
                        f"Lessons: {', '.join(cpe.lessons)}",
                    ),
                )
            )
            idx += 1

    return items


def _detect_under_practiced(
    delta: DidacticDelta,
    path_id: str,
) -> list[LearningDebtItem]:
    """Debt: concepts covered in lessons but with very few exercises."""
    items: list[LearningDebtItem] = []
    for i, change in enumerate(delta.under_practiced_concepts):
        lesson_ids = change.new_lessons
        last_lesson = lesson_ids[-1] if lesson_ids else None
        n_lessons = len(change.new_lessons)
        items.append(
            LearningDebtItem(
                debt_id=_build_debt_id(path_id, "under_practiced", i),
                path_id=path_id,
                kind="under_practiced",
                description=(
                    f'Concept "{change.name}" appears in {n_lessons} lesson(s) '
                    f"but has few or no dedicated exercises. "
                    f"Add practice problems to reinforce understanding."
                ),
                lesson_id=last_lesson,
                resolved=False,
                citations=(
                    f"Under-practiced concept: {change.name}",
                    f"Appears in lessons: {', '.join(change.new_lessons)}",
                ),
            )
        )
    return items


def _detect_over_repeated(
    delta: DidacticDelta,
    path_id: str,
) -> list[LearningDebtItem]:
    """Debt: concepts appearing in 3+ lessons (may indicate over-coverage)."""
    items: list[LearningDebtItem] = []
    for i, change in enumerate(delta.over_repeated_concepts):
        lesson_ids = change.new_lessons
        last_lesson = lesson_ids[-1] if lesson_ids else None
        n_lessons = len(change.new_lessons)
        items.append(
            LearningDebtItem(
                debt_id=_build_debt_id(path_id, "over_repeated", i),
                path_id=path_id,
                kind="over_repeated",
                description=(
                    f'Concept "{change.name}" appears in {n_lessons} lessons '
                    f"(threshold: 3). Review whether this concept needs "
                    f"so much repetition or if it can be condensed."
                ),
                lesson_id=last_lesson,
                resolved=False,
                citations=(
                    f"Over-repeated concept: {change.name}",
                    f"Lessons: {', '.join(change.new_lessons)}",
                ),
            )
        )
    return items


def _detect_open_doubts(
    memory: PathMemory,
    path_id: str,
) -> list[LearningDebtItem]:
    """Debt: unresolved student questions / recurring misconceptions.

    Each unique misconception text becomes an open_doubt debt item.
    Misconceptions are stored as 'question text (in lesson_id)' strings
    (see path_memory._collect_misconceptions).
    """
    items: list[LearningDebtItem] = []
    for i, misc_text in enumerate(memory.recurring_misconceptions):
        # Parse the lesson_id from the stored format: '"Q" (in lesson_id)'
        lesson_id: str | None = None
        description = misc_text
        if " (in " in misc_text:
            try:
                desc_part, lesson_part = misc_text.rsplit(" (in ", 1)
                lesson_id = lesson_part.rstrip(")")
                description = desc_part.strip('"')
            except (ValueError, IndexError):
                pass

        items.append(
            LearningDebtItem(
                debt_id=_build_debt_id(path_id, "open_doubt", i),
                path_id=path_id,
                kind="open_doubt",
                description=(
                    f'Unresolved doubt or misconception: "{description}". '
                    f"This question needs to be addressed in a future lesson."
                ),
                lesson_id=lesson_id,
                resolved=False,
                citations=(f"Misconception: {misc_text}",),
            )
        )
    return items


def _detect_weak_prerequisites(
    memory: PathMemory,
    path_id: str,
) -> list[LearningDebtItem]:
    """Debt: concepts declared as prerequisites but never introduced in the path.

    Examines each ConceptPathEntry from the concept_graph. If a concept declares
    prerequisites that do NOT appear in the graph (as any concept), those
    prerequisites are flagged as weak — they were assumed but never covered.
    """
    # Build a set of all known concept names (lowercase)
    known_concepts: set[str] = set()
    for cpe in memory.concept_graph:
        known_concepts.add(cpe.name.lower())

    items: list[LearningDebtItem] = []
    for cpe in memory.concept_graph:
        if not cpe.prerequisites:
            continue
        for prereq in cpe.prerequisites:
            if prereq.lower() not in known_concepts:
                lesson_ids = cpe.lessons
                last_lesson = lesson_ids[-1] if lesson_ids else None
                items.append(
                    LearningDebtItem(
                        debt_id=_build_debt_id(
                            path_id,
                            "weak_prerequisite",
                            len(items),
                        ),
                        path_id=path_id,
                        kind="weak_prerequisite",
                        description=(
                            f'Concept "{cpe.name}" declares '
                            f'"{prereq}" as a prerequisite, but '
                            f'"{prereq}" has never been introduced '
                            f"in any lesson of this path. "
                            f"Consider covering this prerequisite "
                            f"or removing the dependency."
                        ),
                        lesson_id=last_lesson,
                        resolved=False,
                        citations=(
                            f"Concept with missing prereq: {cpe.name}",
                            f"Missing prerequisite: {prereq}",
                            f"Lessons: {', '.join(lesson_ids)}",
                        ),
                    )
                )
    return items


def compute_learning_debt(
    memory: PathMemory,
    delta: DidacticDelta,
    *,
    path_id: str = "p1",
) -> LearningDebtLedger:
    """Compute the Learning Debt Ledger from PathMemory and DidacticDelta.

    Parameters
    ----------
    memory : PathMemory
        The current (newest) PathMemory for the path. Provides concept_graph
        for prerequisite analysis and recurring_misconceptions for open doubts.
    delta : DidacticDelta
        The DidacticDelta between the previous and current path versions.
        Provides still_open/under_practiced/over_repeated categories.
    path_id : str, optional
        Identifier for this path. Defaults to "p1".

    Returns
    -------
    LearningDebtLedger
        All unresolved debt items, aggregated and deduplicated by category.

    Raises
    ------
    ValueError
        If ``memory`` has no concepts (concept_graph empty).
    """
    if not memory.concept_graph:
        raise ValueError(
            "PathMemory has no concepts — cannot compute learning debt"
        )

    all_items: list[LearningDebtItem] = []

    # 1. Still-open (problematic) concepts
    all_items.extend(_detect_unmastered(memory, delta, path_id))

    # 2. Under-practiced concepts
    all_items.extend(_detect_under_practiced(delta, path_id))

    # 3. Over-repeated concepts
    all_items.extend(_detect_over_repeated(delta, path_id))

    # 4. Open doubts from recurring_misconceptions
    all_items.extend(_detect_open_doubts(memory, path_id))

    # 5. Weak prerequisites
    all_items.extend(_detect_weak_prerequisites(memory, path_id))

    # Build by_kind summary
    by_kind: dict[str, int] = {}
    for item in all_items:
        by_kind[item.kind] = by_kind.get(item.kind, 0) + 1

    # Ensure every known kind is represented (even if zero)
    for kind in sorted(DEBT_KINDS):
        by_kind.setdefault(kind, 0)

    return LearningDebtLedger(
        items=tuple(all_items),
        total_items=len(all_items),
        by_kind=MappingProxyType(by_kind),
    )
