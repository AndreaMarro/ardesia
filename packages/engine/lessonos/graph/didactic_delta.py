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

from dataclasses import dataclass, replace as _replace

from lessonos.graph.path_memory import PathMemory

# Threshold for "over-repeated": a concept appearing in this many lessons
# is flagged as potentially over-covered (PLAN §3.3 "ripetuto-troppo").
_OVER_REPEATED_THRESHOLD = 3

# M7 difficulty-aware severity: base severity per category.
# The formula severity = base × difficulty_factor is inspired by
# FSRS (Ye et al. 2023, open-spaced-repetition/fsrs4anki:
# https://github.com/open-spaced-repetition/fsrs4anki) — the difficulty
# factor modulates urgency based on D-factor, so high-difficulty still-open
# concepts get higher priority than low-difficulty ones.
_BASE_SEVERITY: dict[str, float] = {
    "new": 0.8,
    "clarified": 0.0,
    "still_open": 1.0,
    "over_repeated": 0.5,
    "under_practiced": 0.9,
}


def _difficulty_to_factor(difficulty: float | None) -> float:
    """Map FSRS difficulty D ∈ [1.0, 10.0] → severity factor ∈ [0.5, 1.5].

    Formula: factor = 0.5 + (D - 1.0) / 9.0

    D=1.0 → 0.5 (easiest → half urgency)
    D=5.5 → 1.0 (midpoint → neutral modifier)
    D=10.0 → 1.5 (hardest → 50% more urgency)
    Missing/None difficulty → treated as neutral (5.0 → ~0.9444).
    """
    d = difficulty if difficulty is not None else 5.0
    # Clamp to valid range
    d = max(1.0, min(10.0, d))
    return round(0.5 + (d - 1.0) / 9.0, 4)


def _compute_severity(base_category: str, difficulty: float | None) -> float:
    """Compute difficulty-weighted severity for a concept change.

    severity = base_severity[category] * difficulty_factor(D)

    If the base severity is 0.0 (e.g. clarified), severity is 0.0
    regardless of difficulty (resolved concepts have no urgency).
    """
    base = _BASE_SEVERITY.get(base_category, 0.5)
    if base == 0.0:
        return 0.0
    return round(base * _difficulty_to_factor(difficulty), 4)


@dataclass(frozen=True)
class DeltaConceptChange:
    """How a single concept changed between two PathMemory versions.

    Tracks the concept's statuses and lesson occurrences in both the old
    and the new PathMemory. Both fields use the canonical (case-preserving)
    name from the new PathMemory ConceptPathEntry.

    For M7 difficulty-aware maturation:
    - ``difficulty``: FSRS difficulty factor D ∈ [1.0, 10.0] from the new
      PathMemory's ConceptPathEntry (None if not available — treated as
      neutral 5.0 for severity computation).
    - ``severity``: Weighted urgency score that combines the concept's
      delta category with its difficulty. Higher = more urgent to address.
      Computed as ``base_severity * difficulty_factor`` where difficulty
      factor maps D ∈ [1,10] → [0.5, 1.5].
    """

    name: str
    old_statuses: tuple[str, ...]
    new_statuses: tuple[str, ...]
    old_lessons: tuple[str, ...]
    new_lessons: tuple[str, ...]
    difficulty: float | None = None
    severity: float = 0.0


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
    # M7 difficulty-aware severity summary
    severity_weighted_avg: float = 0.0
    severity_max: float = 0.0


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


def _build_difficulty_map(
    memory: PathMemory,
) -> dict[str, float]:
    """Build {lowercase_name -> difficulty} lookup from PathMemory concepts.

    Returns difficulty from ConceptPathEntry.difficulty, defaulting to
    5.0 if not set.
    """
    return {c.name.lower(): c.difficulty for c in memory.concept_graph}


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
    old_difficulty = _build_difficulty_map(old_memory)
    new_difficulty = _build_difficulty_map(new_memory)

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

        # Difficulty from new memory (fallback to old, then neutral 5.0)
        concept_difficulty = (
            new_difficulty.get(name_lower)
            if new_difficulty.get(name_lower) is not None
            else (old_difficulty.get(name_lower)
                  if old_difficulty.get(name_lower) is not None
                  else 5.0)
        )

        change = DeltaConceptChange(
            name=canonical,
            old_statuses=old_statuses,
            new_statuses=new_sts,
            old_lessons=old_les,
            new_lessons=new_les,
            difficulty=concept_difficulty,
        )

        # 1. New concepts: present in new but not in old
        if name_lower not in old_concepts and name_lower in new_concepts:
            new_concept_list.append(
                _replace(change, severity=_compute_severity("new", concept_difficulty))
            )
            continue  # new concepts can't be clarified/still-open yet

        # 2. Clarified concepts: was "problematic" in old, now has non-problematic status
        was_problematic = "problematic" in old_statuses
        now_non_problematic = any(
            s in new_sts for s in ("introduced", "reinforced", "reviewed")
        )
        if was_problematic and now_non_problematic:
            clarified_list.append(
                _replace(change, severity=_compute_severity("clarified", concept_difficulty))
            )

        # 3. Still-open concepts: still "problematic" in new version
        if "problematic" in new_sts:
            still_open_list.append(
                _replace(change, severity=_compute_severity("still_open", concept_difficulty))
            )

        # 4. Over-repeated concepts: appearing in 3+ lessons
        if len(new_les) >= _OVER_REPEATED_THRESHOLD:
            over_repeated_list.append(
                _replace(change, severity=_compute_severity("over_repeated", concept_difficulty))
            )

        # 5. Under-practiced concepts: appears in >=2 lessons but few exercises
        if len(new_les) >= 2:
            exercise_count = _count_exercises_for_concept(new_memory, name_lower)
            if exercise_count < len(new_les):
                under_practiced_list.append(
                    _replace(change, severity=_compute_severity("under_practiced", concept_difficulty))
                )

    # 6. New misconceptions (in new but not old)
    new_misc_list = sorted(
        m for m in new_misconceptions if m not in old_misconceptions
    )

    # 7. Resolved misconceptions (in old but not new)
    resolved_misc_list = sorted(
        m for m in old_misconceptions if m not in new_misconceptions
    )

    # Compute severity summary: collect all severities from non-zero categories
    all_severities = [
        c.severity for c in new_concept_list
    ] + [
        c.severity for c in still_open_list
    ] + [
        c.severity for c in over_repeated_list
    ] + [
        c.severity for c in under_practiced_list
    ]
    severity_weighted_avg = round(sum(all_severities) / max(len(all_severities), 1), 4)
    severity_max = max(all_severities) if all_severities else 0.0

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
        severity_weighted_avg=severity_weighted_avg,
        severity_max=severity_max,
    )
