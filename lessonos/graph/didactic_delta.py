"""Didactic Delta — path-level diff between old and new PathMemory (PLAN §3.3).

The Didactic Delta compares two versions of a learning path's PathMemory (an
older snapshot and a newer one, typically after adding a new lesson) and
detects what changed: new concepts introduced, concepts clarified from
problematic to solid, concepts still open/confusing, concepts repeated
across too many lessons, and shifts in student misconceptions.

This is the core differencing engine for LessonOS's "every lesson makes the
next one smarter" loop (PLAN §3). It answers: "What did this lesson change
about the path's knowledge state?"
"""

from __future__ import annotations

from dataclasses import dataclass

from lessonos.graph.path_memory import PathMemory

# Threshold for "over-repeated": a concept appearing in this many lessons
# is flagged as potentially over-covered (PLAN §3.3 "ripetuto-troppo").
_OVER_REPEATED_THRESHOLD = 3


@dataclass(frozen=True)
class DeltaConceptChange:
    """How a single concept changed between two PathMemory versions.

    Tracks the concept's statuses and lesson occurrences in both the old
    and the new PathMemory. Both fields use the canonical (case-preserving)
    name from the new PathMemory ConceptPathEntry.
    """

    name: str
    old_statuses: tuple[str, ...]
    new_statuses: tuple[str, ...]
    old_lessons: tuple[str, ...]
    new_lessons: tuple[str, ...]


@dataclass(frozen=True)
class DidacticDelta:
    """Changes detected between old and new PathMemory versions (PLAN §3.3).

    Each category captures a specific kind of didactic change:

    - **new_concepts**: concepts present in the new PathMemory that were not
      in the old one (newly introduced by the latest lesson).
    - **clarified_concepts**: concepts that were "problematic" in the old
      version but now have at least one non-problematic status (introduced,
      reinforced, reviewed) — the concept has been clarified.
    - **still_open_concepts**: concepts whose latest status in the new
      version is still "problematic" — unresolved confusion.
    - **over_repeated_concepts**: concepts appearing in ≥3 lessons in the
      new version — may indicate excessive repetition.
    - **under_practiced_concepts**: concepts introduced/reinforced in
      multiple lessons but with very few associated exercises (v0 heuristic:
      fewer exercises than lessons for that concept).
    - **new_misconceptions**: student questions present in the new version
      but not in the old one.
    - **resolved_misconceptions**: student questions present in the old
      version but no longer appearing in the new version.
    """

    new_concepts: tuple[DeltaConceptChange, ...]
    clarified_concepts: tuple[DeltaConceptChange, ...]
    still_open_concepts: tuple[DeltaConceptChange, ...]
    over_repeated_concepts: tuple[DeltaConceptChange, ...]
    under_practiced_concepts: tuple[DeltaConceptChange, ...]
    new_misconceptions: tuple[str, ...]
    resolved_misconceptions: tuple[str, ...]
    total_new_concepts: int
    total_clarified: int
    total_still_open: int
    total_over_repeated: int
    total_under_practiced: int
    total_new_misconceptions: int
    total_resolved_misconceptions: int


def _build_concept_map(
    memory: PathMemory,
) -> dict[str, tuple[str, ...]]:
    """Build {lowercase_name -> (statuses,)} lookup from PathMemory concepts.

    Returns a dict mapping each concept's lowercased name to the tuple of
    statuses it has across all lessons in this path version.
    """
    return {
        c.name.lower(): c.statuses
        for c in memory.concept_graph
    }


def _build_lesson_map(
    memory: PathMemory,
) -> dict[str, tuple[str, ...]]:
    """Build {lowercase_name -> (lesson_ids,)} lookup from PathMemory concepts."""
    return {
        c.name.lower(): c.lessons
        for c in memory.concept_graph
    }


def _canonical_name_map(
    memory: PathMemory,
) -> dict[str, str]:
    """Build {lowercase_name -> canonical_name} lookup."""
    return {c.name.lower(): c.name for c in memory.concept_graph}


def _extract_misconception_texts(memory: PathMemory) -> frozenset[str]:
    """Extract the raw text of each misconception entry."""
    return frozenset(memory.recurring_misconceptions)


def _count_exercises_for_concept(
    memory: PathMemory,
    concept_name_lower: str,
) -> int:
    """Count exercise prompts that mention this concept (case-insensitive).

    v0 heuristic: an exercise "practices" a concept if the concept name
    appears in the exercise prompt. This is a simple keyword match, not
    a semantic link — M4-task2 (Learning Debt) may refine this with
    explicit concept→exercise linking.

    Note: ``best_explanations`` mirrors ``exercise_bank`` in v0 (docstring
    in path_memory.py), so we only check ``exercise_bank`` to avoid
    double-counting.
    """
    count = 0
    for entry in memory.exercise_bank:
        if concept_name_lower in entry.lower():
            count += 1
    return count


def compute_didactic_delta(
    old_memory: PathMemory,
    new_memory: PathMemory,
) -> DidacticDelta:
    """Compute the Didactic Delta between old and new PathMemory versions.

    Parameters
    ----------
    old_memory : PathMemory
        The path state BEFORE the latest lesson(s) were added.
    new_memory : PathMemory
        The path state AFTER the latest lesson(s) were added.

    Returns
    -------
    DidacticDelta
        All detected changes between the two versions.

    Raises
    ------
    ValueError
        If either memory is empty (concept_graph empty).
    """
    if not old_memory.concept_graph:
        raise ValueError("old PathMemory has no concepts — cannot compute delta")
    if not new_memory.concept_graph:
        raise ValueError("new PathMemory has no concepts — cannot compute delta")

    old_concepts = _build_concept_map(old_memory)
    new_concepts = _build_concept_map(new_memory)
    old_lessons = _build_lesson_map(old_memory)
    new_lessons = _build_lesson_map(new_memory)
    old_canonical = _canonical_name_map(old_memory)
    new_canonical = _canonical_name_map(new_memory)

    old_misconceptions = _extract_misconception_texts(old_memory)
    new_misconceptions = _extract_misconception_texts(new_memory)

    new_concept_list: list[DeltaConceptChange] = []
    clarified_list: list[DeltaConceptChange] = []
    still_open_list: list[DeltaConceptChange] = []
    over_repeated_list: list[DeltaConceptChange] = []
    under_practiced_list: list[DeltaConceptChange] = []

    # Track all concept names (union of old and new) for analysis
    all_names_lower = set(old_concepts.keys()) | set(new_concepts.keys())

    for name_lower in sorted(all_names_lower):
        old_statuses = old_concepts.get(name_lower, ())
        new_sts = new_concepts.get(name_lower, ())
        old_les = old_lessons.get(name_lower, ())
        new_les = new_lessons.get(name_lower, ())
        # Use canonical name from new, falling back to old
        canonical = new_canonical.get(name_lower, old_canonical.get(name_lower, name_lower))

        change = DeltaConceptChange(
            name=canonical,
            old_statuses=old_statuses,
            new_statuses=new_sts,
            old_lessons=old_les,
            new_lessons=new_les,
        )

        # 1. New concepts: present in new but not in old
        if name_lower not in old_concepts and name_lower in new_concepts:
            new_concept_list.append(change)
            continue  # new concepts can't be clarified/still-open yet

        # 2. Clarified concepts: was "problematic" in old, now has non-problematic status
        was_problematic = "problematic" in old_statuses
        now_non_problematic = any(
            s in new_sts for s in ("introduced", "reinforced", "reviewed")
        )
        if was_problematic and now_non_problematic:
            clarified_list.append(change)

        # 3. Still-open concepts: still "problematic" in new version
        if "problematic" in new_sts:
            still_open_list.append(change)

        # 4. Over-repeated concepts: appearing in 3+ lessons
        if len(new_les) >= _OVER_REPEATED_THRESHOLD:
            over_repeated_list.append(change)

        # 5. Under-practiced concepts: appears in >=2 lessons but few exercises
        if len(new_les) >= 2:
            exercise_count = _count_exercises_for_concept(new_memory, name_lower)
            if exercise_count < len(new_les):
                under_practiced_list.append(change)

    # 6. New misconceptions (in new but not old)
    new_misc_list = sorted(
        m for m in new_misconceptions if m not in old_misconceptions
    )

    # 7. Resolved misconceptions (in old but not new)
    resolved_misc_list = sorted(
        m for m in old_misconceptions if m not in new_misconceptions
    )

    return DidacticDelta(
        new_concepts=tuple(new_concept_list),
        clarified_concepts=tuple(clarified_list),
        still_open_concepts=tuple(still_open_list),
        over_repeated_concepts=tuple(over_repeated_list),
        under_practiced_concepts=tuple(under_practiced_list),
        new_misconceptions=tuple(new_misc_list),
        resolved_misconceptions=tuple(resolved_misc_list),
        total_new_concepts=len(new_concept_list),
        total_clarified=len(clarified_list),
        total_still_open=len(still_open_list),
        total_over_repeated=len(over_repeated_list),
        total_under_practiced=len(under_practiced_list),
        total_new_misconceptions=len(new_misc_list),
        total_resolved_misconceptions=len(resolved_misc_list),
    )
