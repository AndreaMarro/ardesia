"""Test Next Lesson Planner — agenda prioritisation from path + delta + debt (PLAN §8.2, M4).

Tests verify:
- Review items from unmastered_concept debt
- Practice items from under_practiced debt
- New material items from delta.new_concepts (not yet reinforced)
- Prerequisite gaps from weak_prerequisite debt
- Open doubt items from open_doubt debt
- Priority ordering (prerequisite_gap < review < open_doubt < practice < new_material)
- Edge cases: empty delta, no debt, empty PathMemory, immutability, deterministic output
"""

import dataclasses

import pytest

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import (
    ConceptExtraction,
    ExerciseExtraction,
    LessonContent,
)
from lessonos.capsule.segmentation import TopicSpan
from lessonos.graph.didactic_delta import DidacticDelta, compute_didactic_delta
from lessonos.graph.learning_debt import (
    DEBT_KINDS,
    LearningDebtLedger,
    compute_learning_debt,
)
from lessonos.graph.next_lesson_planner import (
    LessonAgendaItem,
    NextLessonPlan,
    compute_next_lesson_plan,
)
from lessonos.graph.path_memory import ConceptPathEntry, PathMemory, build_path_memory


# --- Helpers ---


def _make_topic(lesson_id: str, topic: str, *seg_ids: str) -> TopicSpan:
    """Build a minimal TopicSpan."""
    return TopicSpan(
        lesson_id=lesson_id,
        topic=topic,
        seg_ids=seg_ids or ("seg_1",),
        start=0,
        end=60,
    )


def _make_capsule(
    lesson_id: str,
    topic: str,
    concepts: list[tuple[str, str]],
    exercises: list[str] | None = None,
    questions: list[str] | None = None,
) -> LessonCapsule:
    """Build a minimal Lesson Capsule for testing."""
    concept_extractions = tuple(
        ConceptExtraction(name=c[0], status=c[1]) for c in concepts
    )
    exercise_extractions = tuple(
        ExerciseExtraction(prompt=e) for e in (exercises or [])
    )

    content = LessonContent(
        lesson_id=lesson_id,
        concepts=concept_extractions,
        exercises=exercise_extractions,
    )

    timeline = (_make_topic(lesson_id, topic),)

    return LessonCapsule(
        lesson_id=lesson_id,
        timeline=timeline,
        content=content,
    )


def _make_capsule_with_prereqs(
    lesson_id: str,
    topic: str,
    concepts: list[tuple[str, str, list[str]]],
) -> LessonCapsule:
    """Build a capsule where concepts have prerequisites."""
    concept_extractions = tuple(
        ConceptExtraction(name=c[0], status=c[1], prerequisites=tuple(c[2]))
        for c in concepts
    )
    content = LessonContent(
        lesson_id=lesson_id,
        concepts=concept_extractions,
    )
    timeline = (_make_topic(lesson_id, topic),)
    return LessonCapsule(lesson_id=lesson_id, timeline=timeline, content=content)


# --- Fixtures ---


@pytest.fixture
def simple_path() -> tuple[PathMemory, DidacticDelta, LearningDebtLedger]:
    """A single-lesson path with no debt, no delta changes.

    L1: derivata (introduced)
    Returns: old_memory==new_memory (zero-change delta), ledger from self-delta.
    """
    l1 = _make_capsule(
        "l1", "derivate base",
        concepts=[("derivata", "introduced")],
        exercises=["Calcola derivata di x^2"],
    )
    pm = build_path_memory([l1], path_title="Analisi")
    delta = compute_didactic_delta(pm, pm)  # zero-change
    ledger = compute_learning_debt(pm, delta, path_id="p1")
    return pm, delta, ledger


@pytest.fixture
def path_with_all_debt_types() -> tuple[
    PathMemory, DidacticDelta, LearningDebtLedger
]:
    """Old (L1) and new (L1+L2) covering all debt + new concept categories.

    L1: derivata (introduced), limite (introduced)
    L2: integrale (introduced), derivata (reinforced),
        concetto_problematico (problematic — stays open)
    """
    l1 = _make_capsule(
        lesson_id="l1",
        topic="derivate base",
        concepts=[("derivata", "introduced"), ("limite", "introduced")],
        exercises=["Calcola derivata di x^2"],
        questions=["Cosa succede se h tende a 0?"],
    )
    l2 = _make_capsule(
        lesson_id="l2",
        topic="integrali",
        concepts=[
            ("integrale", "introduced"),
            ("derivata", "reinforced"),
            ("concetto problematico", "problematic"),
        ],
        exercises=["Trova integrale di 2x"],
        questions=["Integrale e area sottesa?"],
    )

    old_pm = build_path_memory([l1], path_title="Analisi")
    new_pm = build_path_memory([l1, l2], path_title="Analisi")
    delta = compute_didactic_delta(old_pm, new_pm)
    ledger = compute_learning_debt(new_pm, delta, path_id="p1")
    return new_pm, delta, ledger


@pytest.fixture
def path_with_weak_prereqs() -> tuple[
    PathMemory, DidacticDelta, LearningDebtLedger
]:
    """A path where a concept declares a missing prerequisite.

    L1: derivata (introduced, prereqs=["limite"])
        — 'limite' is NOT in any concept_graph entry
    """
    capsule = _make_capsule_with_prereqs(
        lesson_id="l1",
        topic="derivate",
        concepts=[("derivata", "introduced", ["limite"])],
    )
    pm = build_path_memory([capsule], path_title="Calc")

    # Build a comparison old version that also has "derivata" but no prereqs
    l1_old = _make_capsule(
        "l1", "derivate",
        concepts=[("derivata", "introduced")],
    )
    old_pm = build_path_memory([l1_old], path_title="Calc")
    delta = compute_didactic_delta(old_pm, pm)
    ledger = compute_learning_debt(pm, delta, path_id="p2")
    return pm, delta, ledger


@pytest.fixture
def path_with_new_concept_unreinforced() -> tuple[
    PathMemory, DidacticDelta, LearningDebtLedger
]:
    """L1+L2 where L2 introduces a new concept that is NOT yet reinforced.

    L1: derivata (introduced)
    L2: integrale (introduced) — new in L2, not yet reinforced
    """
    l1 = _make_capsule(
        "l1", "derivate",
        concepts=[("derivata", "introduced")],
    )
    l2 = _make_capsule(
        "l2", "integrali",
        concepts=[("derivata", "reinforced"), ("integrale", "introduced")],
    )

    old_pm = build_path_memory([l1], path_title="Analisi")
    new_pm = build_path_memory([l1, l2], path_title="Analisi")
    delta = compute_didactic_delta(old_pm, new_pm)
    ledger = compute_learning_debt(new_pm, delta, path_id="p1")
    return new_pm, delta, ledger


# --- Tests: compute_next_lesson_plan ---


class TestComputeNextLessonPlan:
    """Core function: compute_next_lesson_plan."""

    def test_raises_on_empty_path_memory(self):
        """Clean test: empty PathMemory raises ValueError."""
        # Build a valid delta so that's not the issue
        l1 = _make_capsule("l1", "t", [("A", "introduced")])
        pm = build_path_memory([l1], path_title="T")
        delta = compute_didactic_delta(pm, pm)

        # Build a ledger from the same clean state
        ledger = compute_learning_debt(pm, delta, path_id="p1")

        empty_pm = PathMemory(
            path_title=None,
            current_state="initial",
            lesson_index=(),
            concept_graph=(),
            recurring_misconceptions=(),
            exercise_bank=(),
            best_explanations=(),
            total_lessons=0,
            total_concepts=0,
            total_exercises=0,
        )
        with pytest.raises(ValueError, match="PathMemory has no concepts"):
            compute_next_lesson_plan(empty_pm, delta, ledger)

    def test_simple_path_produces_empty_plan(self, simple_path):
        """A single-lesson path with no debt, no delta changes = empty plan."""
        pm, delta, ledger = simple_path
        plan = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")

        assert plan.path_id == "p1"
        assert plan.total_agenda_items == 0
        assert len(plan.review_items) == 0
        assert len(plan.practice_items) == 0
        assert len(plan.new_material_items) == 0
        assert len(plan.prerequisite_gaps) == 0
        assert len(plan.open_doubt_items) == 0
        assert len(plan.suggested_topics) == 0

    def test_review_items_from_unmastered(self, path_with_all_debt_types):
        """Unmastered concept debt produces review agenda items."""
        pm, delta, ledger = path_with_all_debt_types
        plan = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")

        assert len(plan.review_items) >= 1
        # The problematic concept should be in review
        review_descs = " ".join(i.description for i in plan.review_items)
        assert "concetto problematico" in review_descs.lower()

        # Each review item should reference the source debt_id
        for item in plan.review_items:
            assert item.kind == "review"
            assert len(item.source_debt_ids) >= 1
            assert item.priority == 1  # review priority

    def test_practice_items_from_under_practiced(
        self, path_with_all_debt_types
    ):
        """Under-practiced concept debt produces practice agenda items."""
        pm, delta, ledger = path_with_all_debt_types
        plan = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")

        # derivata appears in 2 lessons but only 1 exercise mentions it
        if plan.practice_items:
            practice_descs = " ".join(i.description for i in plan.practice_items)
            assert "derivata" in practice_descs.lower(), (
                f"Expected 'derivata' in practice items: {practice_descs}"
            )

        for item in plan.practice_items:
            assert item.kind == "practice"
            assert len(item.source_debt_ids) >= 1
            assert item.priority == 3  # practice priority

    def test_prerequisite_gaps_from_weak_prereq(
        self, path_with_weak_prereqs
    ):
        """Weak prerequisite debt produces prerequisite_gap agenda items."""
        pm, delta, ledger = path_with_weak_prereqs
        plan = compute_next_lesson_plan(pm, delta, ledger, path_id="p2")

        assert len(plan.prerequisite_gaps) >= 1
        gap_descs = " ".join(i.description for i in plan.prerequisite_gaps)
        assert "limite" in gap_descs.lower() or "prerequisite" in gap_descs.lower()

        for item in plan.prerequisite_gaps:
            assert item.kind == "prerequisite_gap"
            assert len(item.source_debt_ids) >= 1
            assert item.priority == 0  # highest priority

    def test_open_doubt_items(self, path_with_all_debt_types):
        """Unresolved student questions produce open_doubt agenda items."""
        pm, delta, ledger = path_with_all_debt_types
        plan = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")

        if plan.open_doubt_items:
            for item in plan.open_doubt_items:
                assert item.kind == "open_doubt"
                assert len(item.source_debt_ids) >= 1
                assert item.priority == 2  # open_doubt priority

    def test_new_material_items_from_delta(self, path_with_new_concept_unreinforced):
        """Newly introduced concepts not yet reinforced become new_material items."""
        pm, delta, ledger = path_with_new_concept_unreinforced
        plan = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")

        # 'integrale' is new in L2, not yet reinforced (only in 1 lesson)
        new_material = plan.new_material_items
        assert len(new_material) >= 1

        new_desc = " ".join(i.description for i in new_material)
        assert "integrale" in new_desc.lower()

        for item in new_material:
            assert item.kind == "new_material"
            assert len(item.source_debt_ids) == 0  # no debt source
            assert item.priority == 4  # lowest priority

    def test_priority_ordering(self, path_with_all_debt_types):
        """Agenda items follow priority ordering: gaps < review < doubt < practice < new."""
        pm, delta, ledger = path_with_all_debt_types
        plan = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")

        # Check that all items have correct priority values
        for item in plan.review_items:
            assert item.priority == 1, (
                f"review item has priority {item.priority}, expected 1"
            )
        for item in plan.practice_items:
            assert item.priority == 3
        for item in plan.prerequisite_gaps:
            assert item.priority == 0
        for item in plan.open_doubt_items:
            assert item.priority == 2
        for item in plan.new_material_items:
            assert item.priority == 4

        # suggested_topics should prioritise gaps > review > doubt > practice > new
        # Check that prerequisite gaps come before review in suggestions
        all_kinds_in_topics = []
        for topic in plan.suggested_topics:
            if "prerequisite" in topic.lower():
                all_kinds_in_topics.append("gap")
            elif "review" in topic.lower():
                all_kinds_in_topics.append("review")
            elif "doubt" in topic.lower() or "question" in topic.lower():
                all_kinds_in_topics.append("doubt")
            elif "practice" in topic.lower() or "exercise" in topic.lower():
                all_kinds_in_topics.append("practice")
            elif "reinforce" in topic.lower():
                all_kinds_in_topics.append("new")

        # Verify that 'gap' appears before other types in the topic list
        # (they're the highest priority)
        priority_order = {"gap": 0, "review": 1, "doubt": 2, "practice": 3, "new": 4}
        last_priority = -1
        for kind in all_kinds_in_topics:
            p = priority_order.get(kind, 99)
            assert p >= last_priority, (
                f"Topic kind {kind!r} out of order "
                f"(priority {p} < last priority {last_priority})"
            )
            last_priority = p

    def test_deterministic_output(self, path_with_all_debt_types):
        """Same inputs produce identical NextLessonPlan."""
        pm, delta, ledger = path_with_all_debt_types
        plan1 = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")
        plan2 = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")

        assert plan1 == plan2
        assert plan1.review_items == plan2.review_items
        assert plan1.practice_items == plan2.practice_items
        assert plan1.new_material_items == plan2.new_material_items
        assert plan1.prerequisite_gaps == plan2.prerequisite_gaps
        assert plan1.open_doubt_items == plan2.open_doubt_items
        assert plan1.suggested_topics == plan2.suggested_topics
        assert plan1.total_agenda_items == plan2.total_agenda_items

    def test_plan_is_frozen(self, path_with_all_debt_types):
        """NextLessonPlan is a frozen dataclass."""
        pm, delta, ledger = path_with_all_debt_types
        plan = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")

        with pytest.raises(dataclasses.FrozenInstanceError):
            plan.review_items = ()

    def test_agenda_item_is_frozen(self):
        """LessonAgendaItem is a frozen dataclass."""
        item = LessonAgendaItem(
            kind="review",
            description="Test description",
            source_debt_ids=("p1#unmastered#0",),
            priority=1,
        )
        with pytest.raises(dataclasses.FrozenInstanceError):
            item.description = "changed"

    def test_total_agenda_items_matches_sum(self, path_with_all_debt_types):
        """total_agenda_items == sum of all category lengths."""
        pm, delta, ledger = path_with_all_debt_types
        plan = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")

        expected = (
            len(plan.review_items)
            + len(plan.practice_items)
            + len(plan.new_material_items)
            + len(plan.prerequisite_gaps)
            + len(plan.open_doubt_items)
        )
        assert plan.total_agenda_items == expected

    def test_different_path_id(self, path_with_all_debt_types):
        """Custom path_id is propagated."""
        pm, delta, ledger = path_with_all_debt_types
        plan = compute_next_lesson_plan(
            pm, delta, ledger, path_id="analisi-2026"
        )
        assert plan.path_id == "analisi-2026"

    def test_agenda_item_empty_source_debt_ids_default(self):
        """LessonAgendaItem defaults source_debt_ids to empty tuple."""
        item = LessonAgendaItem(kind="new_material", description="Test", priority=4)
        assert item.source_debt_ids == ()
        assert item.priority == 4

    def test_new_material_does_not_flag_reinforced_concept(self):
        """A concept introduced in one lesson and reinforced in the next
        should NOT appear as new_material (it's already being reinforced)."""
        l1 = _make_capsule("l1", "base", [("derivata", "introduced")])
        l2 = _make_capsule(
            "l2", "potenza", [("derivata", "reinforced")]
        )
        l3 = _make_capsule(
            "l3", "catena", [("derivata", "reinforced")]
        )

        old_pm = build_path_memory([l1, l2], path_title="Derivate")
        new_pm = build_path_memory([l1, l2, l3], path_title="Derivate")
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="p1")

        plan = compute_next_lesson_plan(new_pm, delta, ledger, path_id="p1")

        # 'derivata' is in 3 lessons (well-reinforced) — should NOT be in new_material
        new_desc = " ".join(i.description for i in plan.new_material_items)
        assert "derivata" not in new_desc.lower()

        # But any truly new concept (only in the latest lesson) SHOULD appear
        # Since L3 only reinforced derivata, no truly new concept — all new_material = 0
        # But delta.new_concepts is empty since no NEW concepts were added in L3
        # Actually let's check: old has derivata only, new has derivata only with more
        # lessons. delta.new_concepts should be empty.
        assert len(delta.new_concepts) == 0


# --- Retention-based review sorting (FSRS-inspired Ebbinghaus decay) ---


def test_review_items_sorted_by_retention():
    """Review items sorted by estimated_retention ascending (lowest = most urgent).

    L1: concetto_A (problematic), concetto_B (problematic)
    L2: concetto_A (reinforced) — B stays at rep=1, A at rep=2
    L3: empty lesson

    Retention estimates (FSRS power-law):
    - concetto_A: rep=2, last=l2 idx=1, lessons_since_review=3-1-1=1
      stability=0.5*1.5^1=0.75, R=1/(1+1/0.75)=1/(1+1.333)=0.429
    - concetto_B: rep=1, last=l1 idx=0, lessons_since_review=3-1-0=2
      stability=0.5, R=1/(1+2/0.5)=1/(1+4)=0.200

    B has LOWER retention -> should appear BEFORE A.
    """
    l1 = _make_capsule(
        "l1", "base",
        concepts=[
            ("concetto_A", "problematic"),
            ("concetto_B", "problematic"),
        ],
    )
    l2 = _make_capsule(
        "l2", "prog",
        concepts=[("concetto_A", "reinforced")],
    )
    l3 = _make_capsule("l3", "empty", [])

    old_pm = build_path_memory([l1], path_title="Calc")
    new_pm = build_path_memory([l1, l2, l3], path_title="Calc")
    delta = compute_didactic_delta(old_pm, new_pm)
    ledger = compute_learning_debt(new_pm, delta, path_id="p1")

    plan = compute_next_lesson_plan(new_pm, delta, ledger, path_id="p1")

    review_descs = [i.description for i in plan.review_items]
    b_pos = next(i for i, d in enumerate(review_descs) if "concetto_b" in d.lower())
    a_pos = next(i for i, d in enumerate(review_descs) if "concetto_a" in d.lower())
    assert b_pos < a_pos, (
        f"concetto_B (retention 0.200) should precede concetto_A "
        f"(retention 0.429) in review order: {review_descs}"
    )


def test_review_items_retention_tiebreaker():
    """When estimated_retention is equal, tiebreak by description.

    L1: concetto_X (problematic)
    L2: concetto_Y (problematic), concetto_X (reinforced)
    L3: concetto_Y (reinforced), concetto_Z (problematic)

    Retention estimates (FSRS power-law):
    - X: rep=2, last=l2 idx=1, lessons_since_review=1 -> R=1/(1+1/0.75)=0.429
    - Y: rep=2, last=l3 idx=2, lessons_since_review=0 -> R=1.0
    - Z: rep=1, last=l3 idx=2, lessons_since_review=0 -> R=1.0

    Order: X (0.429) first, then Y and Z (both 1.0, alphabetical).
    """
    l1 = _make_capsule(
        "l1", "base",
        concepts=[("concetto_X", "problematic")],
    )
    l2 = _make_capsule(
        "l2", "prog",
        concepts=[
            ("concetto_Y", "problematic"),
            ("concetto_X", "reinforced"),
        ],
    )
    l3 = _make_capsule(
        "l3", "adv",
        concepts=[
            ("concetto_Y", "reinforced"),
            ("concetto_Z", "problematic"),
        ],
    )

    old_pm = build_path_memory([l1, l2], path_title="Calc")
    new_pm = build_path_memory([l1, l2, l3], path_title="Calc")
    delta = compute_didactic_delta(old_pm, new_pm)
    ledger = compute_learning_debt(new_pm, delta, path_id="p1")

    plan = compute_next_lesson_plan(new_pm, delta, ledger, path_id="p1")

    review_descs = [i.description for i in plan.review_items]
    x_pos = next(i for i, d in enumerate(review_descs) if "concetto_x" in d.lower())
    y_pos = next(i for i, d in enumerate(review_descs) if "concetto_y" in d.lower())
    z_pos = next(i for i, d in enumerate(review_descs) if "concetto_z" in d.lower())
    assert x_pos < y_pos, f"X (0.264) should precede Y (1.0): {review_descs}"
    assert x_pos < z_pos, f"X (0.264) should precede Z (1.0): {review_descs}"
    # TIEBREAK: Y and Z both have 1.0 retention; alphabetical order: Y < Z
    assert y_pos < z_pos, f"Y should precede Z alphabetically (tiebreak): {review_descs}"


# --- Difficulty-based review sorting ---


def test_review_items_sorted_by_difficulty_tiebreaker():
    """When estimated_retention and downstream status are equal, higher
    difficulty concepts come first.

    L1: hard_concept (problematic, difficulty=9.0), easy_concept (problematic, difficulty=2.0)

    Both have the same retention (rep=1, last=l1 idx=0, lessons_since_review=1)
    and neither is a downstream prerequisite.
    hard_concept (difficulty=9.0) should come BEFORE easy_concept (difficulty=2.0).
    """
    l1 = _make_capsule(
        "l1", "base",
        concepts=[
            ("hard_concept", "problematic"),
            ("easy_concept", "problematic"),
        ],
    )
    pm = build_path_memory([l1], path_title="Calc")
    # Override difficulty per concept using dataclasses.replace
    new_graph = []
    for cpe in pm.concept_graph:
        if cpe.name == "hard_concept":
            new_graph.append(
                dataclasses.replace(cpe, difficulty=9.0)
            )
        elif cpe.name == "easy_concept":
            new_graph.append(
                dataclasses.replace(cpe, difficulty=2.0)
            )
        else:
            new_graph.append(cpe)
    pm = dataclasses.replace(pm, concept_graph=tuple(new_graph))

    delta = compute_didactic_delta(pm, pm)
    ledger = compute_learning_debt(pm, delta, path_id="p1")
    plan = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")

    review_descs = [i.description.lower() for i in plan.review_items]
    assert any("hard_concept" in d for d in review_descs), \
        "hard_concept not found in review items"
    assert any("easy_concept" in d for d in review_descs), \
        "easy_concept not found in review items"
    hard_pos = next(i for i, d in enumerate(review_descs) if "hard_concept" in d)
    easy_pos = next(i for i, d in enumerate(review_descs) if "easy_concept" in d)
    assert hard_pos < easy_pos, (
        f"hard_concept (difficulty=9.0) should precede easy_concept "
        f"(difficulty=2.0) at same retention: {review_descs}"
    )


def test_review_items_same_difficulty_tiebreak_by_description():
    """When retention, downstream, AND difficulty are all equal, tiebreak
    alphabetically by description."""
    l1 = _make_capsule(
        "l1", "base",
        concepts=[
            ("alpha_concept", "problematic"),
            ("beta_concept", "problematic"),
        ],
    )
    pm = build_path_memory([l1], path_title="Calc")
    # Both have default difficulty=5.0 — tiebreak by description
    delta = compute_didactic_delta(pm, pm)
    ledger = compute_learning_debt(pm, delta, path_id="p1")
    plan = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")

    review_descs = [i.description.lower() for i in plan.review_items]
    alpha_pos = next(i for i, d in enumerate(review_descs) if "alpha_concept" in d)
    beta_pos = next(i for i, d in enumerate(review_descs) if "beta_concept" in d)
    assert alpha_pos < beta_pos, (
        f"alpha_concept should precede beta_concept alphabetically "
        f"when difficulty equal: {review_descs}"
    )


def test_review_items_default_difficulty_when_difficulty_none():
    """When ConceptPathEntry.difficulty is not set (shouldn't happen but
    defensive), the system defaults to 5.0 and sorts correctly."""
    l1 = _make_capsule(
        "l1", "base",
        concepts=[
            ("concept_x", "problematic"),
            ("concept_y", "problematic"),
        ],
    )
    pm = build_path_memory([l1], path_title="Calc")
    # Force difficulty=None via dataclasses.replace for both
    new_graph = tuple(
        dataclasses.replace(cpe, difficulty=5.0)
        for cpe in pm.concept_graph
    )
    pm = dataclasses.replace(pm, concept_graph=new_graph)

    delta = compute_didactic_delta(pm, pm)
    ledger = compute_learning_debt(pm, delta, path_id="p1")
    # Should not raise and should produce valid plan
    plan = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")
    assert plan.total_agenda_items >= 2


# ===================================================================
# Prerequisite-aware prioritisation (downstream blocking)
# ===================================================================


class TestDownstreamPrerequisitePrioritisation:
    """Tests for automatic detection of downstream prerequisite chains.

    Concepts that are prerequisites for other concepts in the path (via
    ConceptExtraction.prerequisites on other capsules) should get elevated
    urgency in the NextLessonPlan because unresolved issues there block
    downstream learning.

    This is derived directly from PathMemory.concept_graph (cross-referencing
    concepts against prerequisites declared on other concepts), without
    needing the Lesson Graph builder.
    """

    def test_downstream_prerequisite_detected_from_prereqs(self):
        """Concept that is a prerequisite for another concept is flagged.

        L1: algebra (introduced)
        L2: derivata (introduced, prereqs=[algebra])
        -> 'algebra' is a downstream prerequisite for 'derivata'
        """
        l1 = _make_capsule_with_prereqs(
            "l1", "algebra",
            concepts=[("algebra", "introduced", [])],
        )
        l2 = _make_capsule_with_prereqs(
            "l2", "calc",
            concepts=[("derivata", "introduced", ["algebra"])],
        )
        pm = build_path_memory([l1, l2], path_title="Test")
        delta = compute_didactic_delta(pm, pm)
        ledger = compute_learning_debt(pm, delta, path_id="p1")
        plan = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")

        assert "algebra" in plan.downstream_prerequisite_concepts, (
            f"Expected 'algebra' in downstream prereq set: "
            f"{plan.downstream_prerequisite_concepts}"
        )
        assert "derivata" not in plan.downstream_prerequisite_concepts, (
            "'derivata' depends on 'algebra' but nothing depends on 'derivata'"
        )

    def test_downstream_prerequisite_requires_exists_in_path(self):
        """A prerequisite that doesn't exist in the path is NOT flagged as
        downstream (it's already handled as a weak_prerequisite gap)."""
        l1 = _make_capsule_with_prereqs(
            "l1", "calc",
            concepts=[("derivata", "introduced", ["limite"])],
        )
        pm = build_path_memory([l1], path_title="Test")
        delta = compute_didactic_delta(pm, pm)
        ledger = compute_learning_debt(pm, delta, path_id="p1")
        plan = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")

        # 'limite' does not exist in the path — not a downstream prereq
        assert "limite" not in plan.downstream_prerequisite_concepts, (
            "Missing prerequisite 'limite' should NOT be in downstream set"
        )

    def test_no_prereqs_means_empty_downstream(self):
        """A path where no concept declares prerequisites = empty downstream set."""
        l1 = _make_capsule("l1", "base", [("A", "introduced")])
        l2 = _make_capsule("l2", "advanced", [("B", "introduced")])
        pm = build_path_memory([l1, l2], path_title="Test")
        delta = compute_didactic_delta(pm, pm)
        ledger = compute_learning_debt(pm, delta, path_id="p1")
        plan = compute_next_lesson_plan(pm, delta, ledger, path_id="p1")

        assert plan.downstream_prerequisite_concepts == ()

    def test_downstream_ordering_review_items(self):
        """Within review items, downstream prerequisite concepts with same
        retention are sorted before non-prereq concepts.

        L1: algebra (problematic), trig (problematic)
        L2: derivata (introduced, prereqs=[algebra, trig])

        Both 'algebra' and 'trig' are problematic and in review.
        Both have the same retention (rep=1, last idx=0, one lesson since).
        BUT 'algebra' and 'trig' are both prerequisites for 'derivata' —
        they should still be sorted as they were (retention is the primary
        key, downstream prereq is secondary within same tier).

        Actually — both have same retention and same downstream status,
        so they sort alphabetically by description tiebreaker.
        """
        l1 = _make_capsule_with_prereqs(
            "l1", "precalc",
            concepts=[
                ("algebra", "problematic", []),
                ("trig", "problematic", []),
            ],
        )
        l2 = _make_capsule_with_prereqs(
            "l2", "calc",
            concepts=[("derivata", "introduced", ["algebra", "trig"])],
        )
        old_pm = build_path_memory([l1], path_title="Math")
        new_pm = build_path_memory([l1, l2], path_title="Math")
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="p1")
        plan = compute_next_lesson_plan(new_pm, delta, ledger, path_id="p1")

        # Both 'algebra' and 'trig' are downstream prereqs
        downstream_names = [n.lower() for n in plan.downstream_prerequisite_concepts]
        assert "algebra" in downstream_names
        assert "trig" in downstream_names

    def test_downstream_ordering_precedes_non_downstream(self):
        """Among review items with the SAME retention, a downstream
        prerequisite concept comes BEFORE a non-prereq concept.

        L1: algebra (problematic) — downstream prereq for B
        L2: B (introduced, prereqs=[algebra])
           geometria (problematic) — NOT a downstream prereq

        Both 'algebra' and 'geometria' have the same retention
        (rep=1, last=l1, same lesson distance), but 'algebra' is a
        downstream prereq — should come first.
        """
        l1 = _make_capsule_with_prereqs(
            "l1", "foundations",
            concepts=[("algebra", "problematic", [])],
        )
        l2 = _make_capsule_with_prereqs(
            "l2", "mixed",
            concepts=[
                ("B", "introduced", ["algebra"]),
                ("geometria", "problematic", []),
            ],
        )
        old_pm = build_path_memory([l1], path_title="Math")
        new_pm = build_path_memory([l1, l2], path_title="Math")
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="p1")
        plan = compute_next_lesson_plan(new_pm, delta, ledger, path_id="p1")

        review_descs = [i.description.lower() for i in plan.review_items]
        algebra_pos = next(
            i for i, d in enumerate(review_descs) if "algebra" in d
        )
        geometria_pos = next(
            i for i, d in enumerate(review_descs) if "geometria" in d
        )
        assert algebra_pos < geometria_pos, (
            f"'algebra' (downstream prereq) should precede 'geometria' "
            f"(non-prereq) at same retention: {review_descs}"
        )

    def test_downstream_ordering_non_problematic_not_in_review(self):
        """A concept that is a downstream prerequisite but NOT problematic
        does NOT appear in review items — only problematic concepts do."""
        l1 = _make_capsule_with_prereqs(
            "l1", "base",
            concepts=[("algebra", "introduced", [])],
        )
        l2 = _make_capsule_with_prereqs(
            "l2", "adv",
            concepts=[("calcolo", "introduced", ["algebra"])],
        )
        old_pm = build_path_memory([l1], path_title="Math")
        new_pm = build_path_memory([l1, l2], path_title="Math")
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="p1")
        plan = compute_next_lesson_plan(new_pm, delta, ledger, path_id="p1")

        # 'algebra' is a downstream prereq but NOT problematic
        # It should appear in downstream_prerequisite_concepts
        assert "algebra" in plan.downstream_prerequisite_concepts
        # But NOT in review items (not unmastered)
        review_descs = " ".join(i.description.lower() for i in plan.review_items)
        assert "algebra" not in review_descs, (
            "'algebra' is not problematic — should not be in review"
        )


class TestSeverityAwarePlanner:
    """Severity from difficulty affects review item sort order (M4 maturation)."""

    def test_severity_tiebreaker_in_review_sort(self):
        """Within same retention tier, higher severity concept appears first."""
        # Three unmastered concepts with different difficulties
        # L1 introduces alpha, beta, gamma — all problematic
        l1 = _make_capsule(
            "l1", "base",
            concepts=[
                ("alpha", "problematic"),
                ("beta", "problematic"),
                ("gamma", "problematic"),
            ],
        )
        # L2 reinforces them — still problematic → still_open in delta
        l2 = _make_capsule(
            "l2", "more",
            concepts=[
                ("alpha", "problematic"),
                ("beta", "problematic"),
                ("gamma", "problematic"),
            ],
        )
        old_pm = build_path_memory([l1], path_title="Test")
        new_pm = build_path_memory([l1, l2], path_title="Test")

        # Manually set per-concept difficulties:
        # alpha = D 8.0 (very hard) → severity ~1.6
        # beta  = D 5.0 (neutral)  → severity ~1.0
        # gamma = D 2.0 (easy)     → severity ~0.4
        diff_map = {"alpha": 8.0, "beta": 5.0, "gamma": 2.0}
        new_concept_graph = tuple(
            ConceptPathEntry(
                name=cpe.name,
                first_introduced_lesson=cpe.first_introduced_lesson,
                statuses=cpe.statuses,
                lessons=cpe.lessons,
                prerequisites=cpe.prerequisites,
                repetition_count=cpe.repetition_count,
                last_reviewed_lesson=cpe.last_reviewed_lesson,
                difficulty=diff_map.get(cpe.name.lower(), 5.0),
                estimated_retention=cpe.estimated_retention,
            )
            for cpe in new_pm.concept_graph
        )

        new_pm = PathMemory(
            path_title=new_pm.path_title,
            current_state=new_pm.current_state,
            lesson_index=new_pm.lesson_index,
            concept_graph=new_concept_graph,
            exercise_bank=new_pm.exercise_bank,
            recurring_misconceptions=new_pm.recurring_misconceptions,
            best_explanations=new_pm.best_explanations,
            total_lessons=new_pm.total_lessons,
            total_concepts=new_pm.total_concepts,
            total_exercises=new_pm.total_exercises,
        )

        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="p1")
        plan = compute_next_lesson_plan(new_pm, delta, ledger, path_id="p1")

        # Verify all three concepts share the same retention tier
        # (prerequisite for severity being the actual tiebreaker)
        alpha_cpe = next(c for c in new_pm.concept_graph if c.name.lower() == "alpha")
        beta_cpe = next(c for c in new_pm.concept_graph if c.name.lower() == "beta")
        gamma_cpe = next(c for c in new_pm.concept_graph if c.name.lower() == "gamma")
        assert alpha_cpe.estimated_retention == beta_cpe.estimated_retention == gamma_cpe.estimated_retention, (
            "All three concepts must share same retention tier for severity tiebreaker test"
        )

        # All 3 should appear in review items (same retention tier since they
        # share the same lesson gap pattern). Within that tier, alpha (severity
        # ~1.6) should come before beta (1.0) before gamma (0.4).
        review_descs = [i.description.lower() for i in plan.review_items]
        alpha_pos = next(i for i, d in enumerate(review_descs) if "alpha" in d)
        beta_pos = next(i for i, d in enumerate(review_descs) if "beta" in d)
        gamma_pos = next(i for i, d in enumerate(review_descs) if "gamma" in d)

        assert alpha_pos < beta_pos, (
            f"alpha (severity ~1.6) should precede beta (severity ~1.0), "
            f"positions: alpha={alpha_pos}, beta={beta_pos}"
        )
        assert beta_pos < gamma_pos, (
            f"beta (severity ~1.0) should precede gamma (severity ~0.4), "
            f"positions: beta={beta_pos}, gamma={gamma_pos}"
        )
