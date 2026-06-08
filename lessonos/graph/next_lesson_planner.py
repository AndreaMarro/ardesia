"""Next Lesson Planner — agenda for the next lesson from debt + delta + path memory (PLAN §8.2).

The Next Lesson Planner is the final stage of M4. Given the current PathMemory,
the DidacticDelta (what changed since the last version), and the Learning Debt
Ledger (unresolved issues), it produces a structured, prioritised agenda for
the next lesson of the path.

Priority ordering (highest → lowest):
1. **Prerequisite gaps** — concepts needed before continuing (debt: weak_prerequisite)
2. **Review items** — concepts still unmastered/problematic (debt: unmastered_concept)
3. **Open doubts** — unresolved student questions (debt: open_doubt)
4. **Practice items** — under-practiced concepts needing exercises (debt: under_practiced)
5. **New material** — newly introduced concepts needing reinforcement (from delta.new_concepts,
   not yet covered in debt)

This is a pure computation — zero LLM calls, zero DB persistence. It transforms
already-structured data into an actionable teaching plan.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from lessonos.graph.didactic_delta import DidacticDelta
from lessonos.graph.learning_debt import LearningDebtLedger
from lessonos.graph.path_memory import PathMemory


@dataclass(frozen=True)
class LessonAgendaItem:
    """A single actionable item for the next lesson agenda.

    Each item carries a kind, a description of what to do, references back to
    any source debt IDs (from the Learning Debt Ledger), and a priority value
    (lower = more urgent).

    Fields
    ------
    kind : str
        One of: 'prerequisite_gap', 'review', 'open_doubt', 'practice',
        'new_material'.
    description : str
        Human-readable description of what to address.
    source_debt_ids : tuple[str, ...]
        The LearningDebtItem.debt_id(s) from the ledger that gave rise to this
        agenda item (empty for items derived from delta.new_concepts, which
        have no debt entry yet).
    priority : int
        Lower means higher urgency. 0=prerequisite_gap, 1=review, 2=open_doubt,
        3=practice, 4=new_material.
    """

    kind: str
    description: str
    source_debt_ids: tuple[str, ...] = ()
    priority: int = 4


# Priority values by kind (lower = more urgent)
_PRIORITY_MAP: dict[str, int] = {
    "prerequisite_gap": 0,
    "review": 1,
    "open_doubt": 2,
    "practice": 3,
    "new_material": 4,
}


@dataclass(frozen=True)
class NextLessonPlan:
    """A structured, prioritised plan for the next lesson (PLAN §8.2).

    Aggregates and orders all outstanding didactic issues into actionable
    categories. Each category is a tuple of LessonAgendaItems, ordered by
    their source's original position within the category for reproducibility.

    Fields
    ------
    path_id : str
        The path this plan is for.
    review_items : tuple[LessonAgendaItem, ...]
        Concepts to review — unmastered/problematic concepts that need
        re-clarification. (Debt: unmastered_concept)
    practice_items : tuple[LessonAgendaItem, ...]
        Exercises to assign — under-practiced concepts that need exercise
        reinforcement. (Debt: under_practiced)
    new_material_items : tuple[LessonAgendaItem, ...]
        New material to cover — concepts in the path that have only been
        introduced but not yet reinforced. (From delta.new_concepts)
    prerequisite_gaps : tuple[LessonAgendaItem, ...]
        Prerequisites to teach first — concepts declared as prerequisites
        but never introduced in the path. (Debt: weak_prerequisite)
    open_doubt_items : tuple[LessonAgendaItem, ...]
        Unresolved student questions to address. (Debt: open_doubt)
    suggested_topics : tuple[str, ...]
        Ordered list of topic suggestions for the next lesson, derived from
        all agenda items in priority order. These are recommendations, not
        a fixed curriculum.
    total_agenda_items : int
        Total number of individual actionable items across all categories.
    downstream_prerequisite_concepts : tuple[str, ...]
        Concept names (canonical) that are prerequisites for at least one other
        concept in the path. These are higher urgency because unresolved issues
        here block downstream learning. Derived from PathMemory's concept_graph
        where concepts declare prerequisites on other concepts that exist in
        the path.
    """

    path_id: str
    review_items: tuple[LessonAgendaItem, ...]
    practice_items: tuple[LessonAgendaItem, ...]
    new_material_items: tuple[LessonAgendaItem, ...]
    prerequisite_gaps: tuple[LessonAgendaItem, ...]
    open_doubt_items: tuple[LessonAgendaItem, ...]
    suggested_topics: tuple[str, ...]
    total_agenda_items: int
    downstream_prerequisite_concepts: tuple[str, ...] = ()


def _compute_downstream_prerequisites(
    memory: PathMemory,
) -> frozenset[str]:
    """Compute the set of concept names (lowercase) that are prerequisites
    for at least one other concept in the path.

    Walks PathMemory.concept_graph: for each concept that has prerequisites
    declared, those prerequisites are downstream-blocking if they exist in
    the path (i.e., another concept depends on them).

    Returns a frozenset of lowercase concept names.
    """
    downstream: set[str] = set()
    for cpe in memory.concept_graph:
        if cpe.prerequisites:
            for prereq in cpe.prerequisites:
                # Check that this prerequisite actually exists in the path
                # (only add it if it's a known concept — not a missing one)
                prereq_lower = prereq.lower()
                exists = any(
                    other.name.lower() == prereq_lower
                    for other in memory.concept_graph
                )
                if exists:
                    downstream.add(prereq_lower)
    return frozenset(downstream)


def _build_review_items(
    ledger: LearningDebtLedger,
    memory: PathMemory | None = None,
    downstream_prereqs: frozenset[str] | None = None,
) -> list[LessonAgendaItem]:
    """Build review agenda items from unmastered concept debt.

    Uses PathMemory's ``estimated_retention`` (FSRS-inspired Ebbinghaus decay)
    to sort review items so that concepts with the lowest estimated retention
    (highest forgetting risk) appear first.

    Falls back to ``repetition_count`` + ``last_reviewed_lesson`` ordering
    (SM-2 style) if estimated_retention is unavailable.

    Within the same retention tier, concepts that are downstream prerequisites
    (blocking other concepts) are sorted first.
    """
    items: list[LessonAgendaItem] = []
    for debt in ledger.items:
        if debt.kind == "unmastered_concept":
            items.append(
                LessonAgendaItem(
                    kind="review",
                    description=(
                        f'Review and clarify concept: {debt.description}'
                    ),
                    source_debt_ids=(debt.debt_id,),
                    priority=_PRIORITY_MAP["review"],
                )
            )

    downstream = downstream_prereqs or frozenset()

    # Build severity lookup from debt items (by concept name)
    _debt_severity: dict[str, float] = {}
    for debt in ledger.items:
        if debt.kind == "unmastered_concept":
            # Extract concept name from description
            m = re.search(r'Concept "([^"]+)"', debt.description)
            if m:
                _debt_severity[m.group(1).lower()] = debt.severity

    # Sort by retrievability urgency:
    # 1. (retention path) estimated_retention ascending (lowest = most urgent)
    # 2. (both paths) is_downstream_prerequisite (True = blocks other learning)
    # 3. (both paths) severity descending (higher severity = more urgent)
    # 4. (both paths) difficulty descending (hardest concepts first, default 5.0)
    # 5. (retention path) description (stable tiebreaker)
    # 6. (fallback path, when retention is None) repetition_count ascending,
    #    then last_reviewed_lesson, then description
    if memory and items:
        _concept_rep_map: dict[str, dict] = {}
        for cpe in memory.concept_graph:
            _concept_rep_map[cpe.name.lower()] = {
                "retention": cpe.estimated_retention,
                "rep_count": cpe.repetition_count,
                "last_idx": _lesson_idx(cpe.last_reviewed_lesson, memory),
                "difficulty": cpe.difficulty or 5.0,
            }

        def _review_sort_key(item: LessonAgendaItem) -> tuple:
            # Extract concept name from description like
            # 'Review and clarify concept: Concept "name" is ...'
            m = re.search(r'Concept "([^"]+)"', item.description)
            concept_name = m.group(1).lower() if m else item.description.lower()
            info = _concept_rep_map.get(concept_name, {})
            retention = info.get("retention")
            difficulty_val: float = info.get("difficulty", 5.0)
            severity_val: float = _debt_severity.get(concept_name, 1.0)

            # Check if this concept is a downstream prerequisite
            is_downstream = concept_name in downstream

            if retention is not None:
                # Primary: retention ascending (0.0 = forgotten -> urgent).
                # Secondary: prerequisites first (0 = blocking, 1 = not blocking).
                # Tertiary: severity descending (higher severity = more urgent).
                # Quaternary: difficulty descending (harder concepts first).
                # Tiebreaker: description for stable sorting.
                return (
                    0,
                    retention,
                    0 if is_downstream else 1,
                    -severity_val,
                    -difficulty_val,
                    item.description,
                )
            # Fallback: SM-2 style (rep_count asc, last_idx asc)
            rep_count = info.get("rep_count", 0)
            last_idx = info.get("last_idx", 0)
            return (
                1,
                rep_count,
                last_idx,
                0 if is_downstream else 1,
                -severity_val,
                -difficulty_val,
                item.description,
            )

        items.sort(key=_review_sort_key)

    return items


def _lesson_idx(
    lesson_id: str | None, memory: PathMemory
) -> int:
    """Return the index of a lesson in the path, or 0 if None/unknown."""
    if lesson_id is None:
        return 0
    for i, entry in enumerate(memory.lesson_index):
        if entry.lesson_id == lesson_id:
            return i
    return 0


def _build_practice_items(
    ledger: LearningDebtLedger,
) -> list[LessonAgendaItem]:
    """Build practice/exercise agenda items from under-practiced debt."""
    items: list[LessonAgendaItem] = []
    for debt in ledger.items:
        if debt.kind == "under_practiced":
            items.append(
                LessonAgendaItem(
                    kind="practice",
                    description=(
                        f'Assign exercises for: {debt.description}'
                    ),
                    source_debt_ids=(debt.debt_id,),
                    priority=_PRIORITY_MAP["practice"],
                )
            )
    return items


def _build_prerequisite_gap_items(
    ledger: LearningDebtLedger,
    downstream_prereqs: frozenset[str] | None = None,
) -> list[LessonAgendaItem]:
    """Build prerequisite gap agenda items from weak_prerequisite debt.

    Within prerequisite gaps, items whose concept is a downstream prerequisite
    (i.e., blocking other concepts in the path) are sorted first.
    """
    downstream = downstream_prereqs or frozenset()
    items: list[LessonAgendaItem] = []
    for debt in ledger.items:
        if debt.kind == "weak_prerequisite":
            items.append(
                LessonAgendaItem(
                    kind="prerequisite_gap",
                    description=(
                        f'Cover missing prerequisite: {debt.description}'
                    ),
                    source_debt_ids=(debt.debt_id,),
                    priority=_PRIORITY_MAP["prerequisite_gap"],
                )
            )

    # Sort: missing prerequisites that are ALSO downstream blockers come first.
    items.sort(
        key=lambda i: (
            0 if any(
                p.lower() in downstream
                for p in re.findall(r'"([^"]+)"', i.description)
            ) else 1,
            i.description,
        )
    )
    return items


def _build_open_doubt_items(
    ledger: LearningDebtLedger,
) -> list[LessonAgendaItem]:
    """Build open-doubt agenda items from open_doubt debt."""
    items: list[LessonAgendaItem] = []
    for debt in ledger.items:
        if debt.kind == "open_doubt":
            items.append(
                LessonAgendaItem(
                    kind="open_doubt",
                    description=(
                        f'Address student question: {debt.description}'
                    ),
                    source_debt_ids=(debt.debt_id,),
                    priority=_PRIORITY_MAP["open_doubt"],
                )
            )
    return items


def _build_new_material_items(
    delta: DidacticDelta,
    memory: PathMemory,
) -> list[LessonAgendaItem]:
    """Build new-material agenda items from delta.new_concepts.

    Concepts that are newly introduced in the latest lesson version but NOT
    yet reinforced (appear in only 1 lesson) are flagged for follow-up in the
    next lesson. Concepts that were introduced AND already reinforced (2+
    lessons) are considered sufficiently covered.
    """
    items: list[LessonAgendaItem] = []
    # Build a set of concept names (lowercase) that appear in 2+ lessons
    # (already being reinforced, so they need less urgent follow-up)
    well_covered: set[str] = set()
    for cpe in memory.concept_graph:
        if cpe.repetition_count >= 2:
            well_covered.add(cpe.name.lower())

    for change in delta.new_concepts:
        # A new concept needs attention only if it's not yet being reinforced
        # (appears in only 1 lesson — the one that introduced it)
        name_lower = change.name.lower()
        if name_lower in well_covered:
            continue
        lesson_ids = change.new_lessons
        last_lesson = lesson_ids[-1] if lesson_ids else None
        items.append(
            LessonAgendaItem(
                kind="new_material",
                description=(
                    f'Reinforce newly introduced concept '
                    f'"{change.name}" (introduced in {last_lesson}). '
                    f'Add examples, practice problems, or deeper '
                    f'exploration to solidify understanding.'
                ),
                priority=_PRIORITY_MAP["new_material"],
            )
        )
    return items


def _build_suggested_topics(
    review_items: list[LessonAgendaItem],
    practice_items: list[LessonAgendaItem],
    new_material_items: list[LessonAgendaItem],
    prerequisite_gaps: list[LessonAgendaItem],
    open_doubt_items: list[LessonAgendaItem],
) -> list[str]:
    """Derive a flat, priority-ordered list of topic suggestions.

    All items are concatenated in priority order (prerequisite gaps first,
    then review, open doubts, practice, new material), and their descriptions
    are summarised into compact topic strings.
    """
    all_items: list[LessonAgendaItem] = sorted(
        prerequisite_gaps
        + review_items
        + open_doubt_items
        + practice_items
        + new_material_items,
        key=lambda i: (i.priority, i.description),
    )

    topics: list[str] = []
    seen: set[str] = set()
    for item in all_items:
        # Deduplicate by first ~60 chars of description
        key = item.description[:60].lower()
        if key not in seen:
            seen.add(key)
            # Generate a compact topic label from the description
            if item.kind == "prerequisite_gap":
                topics.append(
                    f"Cover missing prerequisite: address weak "
                    f"prerequisite foundation"
                )
            elif item.kind == "review":
                # Extract the concept name from the description
                desc = item.description.replace(
                    "Review and clarify concept: ", ""
                )
                # Truncate to extract just the first concept name
                concept = desc.split(". ")[0] if ". " in desc else desc
                topics.append(f"Review and clarify: {concept}")
            elif item.kind == "open_doubt":
                topics.append("Address unresolved student questions and doubts")
            elif item.kind == "practice":
                topics.append("Practice: assign exercises for weak areas")
            elif item.kind == "new_material":
                topics.append("Reinforce newly introduced concepts")
    return topics


def compute_next_lesson_plan(
    memory: PathMemory,
    delta: DidacticDelta,
    ledger: LearningDebtLedger,
    *,
    path_id: str = "p1",
) -> NextLessonPlan:
    """Compute a prioritised next lesson plan from path + delta + debt.

    Combines the current path state, what changed, and what's still owed into
    a structured agenda for the teacher/instructor.

    The planner automatically cross-references PathMemory to detect
    downstream prerequisite chains: if concept A is a prerequisite for
    concept B (both exist in the path), then issues with concept A are
    more urgent because they block concept B. This is inspired by graph-based
    knowledge tracing (GRKT, arXiv 2406.12896) which shows that concept
    prerequisite chains are critical for prioritising remedial instruction.

    Parameters
    ----------
    memory : PathMemory
        The current (newest) PathMemory for the path.
    delta : DidacticDelta
        The DidacticDelta between the previous and current path versions.
    ledger : LearningDebtLedger
        The current Learning Debt Ledger for the path.
    path_id : str, optional
        Identifier for this path. Defaults to "p1".

    Returns
    -------
    NextLessonPlan
        A structured, prioritised plan for the next lesson.

    Raises
    ------
    ValueError
        If ``memory`` has no concepts (concept_graph empty).
    """
    if not memory.concept_graph:
        raise ValueError(
            "PathMemory has no concepts — cannot plan next lesson"
        )

    # Build downstream prerequisite set from PathMemory concept_graph
    downstream_prereqs = _compute_downstream_prerequisites(memory)

    # Build each category with prerequisite awareness
    review_items = _build_review_items(
        ledger, memory=memory, downstream_prereqs=downstream_prereqs
    )
    practice_items = _build_practice_items(ledger)
    prerequisite_gaps = _build_prerequisite_gap_items(
        ledger, downstream_prereqs=downstream_prereqs
    )
    open_doubt_items = _build_open_doubt_items(ledger)
    new_material_items = _build_new_material_items(delta, memory)

    # Derive suggested topics in priority order
    suggested_topics = _build_suggested_topics(
        review_items,
        practice_items,
        new_material_items,
        prerequisite_gaps,
        open_doubt_items,
    )

    # Count total
    total = (
        len(review_items)
        + len(practice_items)
        + len(new_material_items)
        + len(prerequisite_gaps)
        + len(open_doubt_items)
    )

    # Build the sorted list of downstream prerequisite concept names
    if downstream_prereqs:
        # Resolve to canonical names from the concept graph
        downstream_canonical: list[str] = []
        for cpe in memory.concept_graph:
            if cpe.name.lower() in downstream_prereqs:
                downstream_canonical.append(cpe.name)
        is_downstream = tuple(sorted(downstream_canonical))
    else:
        is_downstream = ()

    return NextLessonPlan(
        path_id=path_id,
        review_items=tuple(review_items),
        practice_items=tuple(practice_items),
        new_material_items=tuple(new_material_items),
        prerequisite_gaps=tuple(prerequisite_gaps),
        open_doubt_items=tuple(open_doubt_items),
        suggested_topics=tuple(suggested_topics),
        total_agenda_items=total,
        downstream_prerequisite_concepts=is_downstream,
    )
