"""Test Didactic Delta — path-level diff between old/new PathMemory (PLAN §3.3, M4).

Verifies that compute_didactic_delta correctly detects:
- New concepts added by the latest lesson
- Clarified concepts (problematic → non-problematic)
- Still-open concepts (persistently problematic)
- Over-repeated concepts (3+ lessons)
- Under-practiced concepts (few exercises relative to coverage)
- New and resolved misconceptions
- Edge cases: identical versions → empty delta, empty input → ValueError
"""

import pytest

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import (
    ConceptExtraction,
    ExerciseExtraction,
    LessonContent,
    QuestionExtraction,
)
from lessonos.capsule.segmentation import TopicSpan
from lessonos.graph.didactic_delta import (
    DeltaConceptChange,
    DidacticDelta,
    compute_didactic_delta,
)
from lessonos.graph.learning_debt import compute_learning_debt
from lessonos.graph.path_memory import build_path_memory


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
    homework: list[str] | None = None,
) -> LessonCapsule:
    """Build a minimal Lesson Capsule for testing."""
    concept_extractions = tuple(
        ConceptExtraction(name=c[0], status=c[1]) for c in concepts
    )
    exercise_extractions = tuple(
        ExerciseExtraction(prompt=e) for e in (exercises or [])
    )
    question_extractions = tuple(
        QuestionExtraction(question=q) for q in (questions or [])
    )

    content = LessonContent(
        lesson_id=lesson_id,
        concepts=concept_extractions,
        exercises=exercise_extractions,
        student_questions=question_extractions,
    )

    timeline = (_make_topic(lesson_id, topic),)

    return LessonCapsule(
        lesson_id=lesson_id,
        timeline=timeline,
        content=content,
    )


# --- Fixtures ---


@pytest.fixture
def path_with_problematic() -> tuple[list[LessonCapsule], list[LessonCapsule]]:
    """Old path (L1+L2) and new path (L1+L2+L3).

    L1: derivata (introduced), limite (introduced)
    L2: derivative_rules — regola potenza (introduced),
        derivata (reinforced), concetto_problematico (problematic)
    L3 (new): integral intro — integrale (introduced),
        antiderivata (introduced), concetto_problematico (reinforced — clarified!)
    """
    l1 = _make_capsule(
        lesson_id="l1_derivative",
        topic="definizione derivata",
        concepts=[("derivata", "introduced"), ("limite", "introduced")],
        exercises=["Calcola derivata di x^2"],
        questions=["Cosa succede se h=0?"],
    )
    l2 = _make_capsule(
        lesson_id="l2_rules",
        topic="regola della potenza",
        concepts=[
            ("derivata", "reinforced"),
            ("regola potenza", "introduced"),
            ("concetto problematico", "problematic"),
        ],
        exercises=["Applica regola potenza a x^3"],
    )
    l3 = _make_capsule(
        lesson_id="l3_integral",
        topic="introduzione integrale",
        concepts=[
            ("integrale", "introduced"),
            ("antiderivata", "introduced"),
            ("concetto problematico", "reinforced"),
        ],
        exercises=["Trova integrale di 2x"],
        questions=["Integrale e area sottesa?"],
    )

    old_capsules = [l1, l2]
    new_capsules = [l1, l2, l3]
    return old_capsules, new_capsules


@pytest.fixture
def path_with_persistent_problematic() -> tuple[list[LessonCapsule], list[LessonCapsule]]:
    """Old path (L1), new path (L1+L2) — problematic persists.

    L1: introduces concepts (one problematic)
    L2: introduces nothing new, but reinforces some —
        the problematic concept stays problematic (still open).
    """
    l1 = _make_capsule(
        lesson_id="l1",
        topic="base",
        concepts=[("concetto A", "introduced"), ("concetto dubbi", "problematic")],
        exercises=["Esercizio A"],
        questions=["Dubbio su A?"],
    )
    l2 = _make_capsule(
        lesson_id="l2",
        topic="avanzato",
        concepts=[
            ("concetto A", "reinforced"),
            ("concetto B", "introduced"),
            ("concetto dubbi", "problematic"),
        ],
        exercises=["Esercizio B"],
        questions=["Dubbio su B?"],
    )

    old_capsules = [l1]
    new_capsules = [l1, l2]
    return old_capsules, new_capsules


@pytest.fixture
def path_with_over_repeated() -> tuple[list[LessonCapsule], list[LessonCapsule]]:
    """A concept repeated in 3+ lessons (over-repeated)."""
    l1 = _make_capsule(
        lesson_id="l1",
        topic="base",
        concepts=[("derivata", "introduced")],
        exercises=["Calcola derivata base"],
    )
    l2 = _make_capsule(
        lesson_id="l2",
        topic="potenza",
        concepts=[("derivata", "reinforced")],
        exercises=["Derivata regola potenza"],
    )
    l3 = _make_capsule(
        lesson_id="l3",
        topic="catena",
        concepts=[("derivata", "reinforced")],
        exercises=["Derivata regola catena"],
    )
    l4 = _make_capsule(
        lesson_id="l4",
        topic="implicita",
        concepts=[("derivata", "reinforced"), ("derivazione implicita", "introduced")],
        exercises=["Derivata implicita esercizio"],
    )

    old_capsules = [l1, l2, l3]
    new_capsules = [l1, l2, l3, l4]
    return old_capsules, new_capsules


# --- Tests: compute_didactic_delta ---


class TestComputeDidacticDelta:
    """Core function: compute_didactic_delta."""

    def test_detects_new_concepts(self, path_with_problematic):
        """Delta detects concepts added by the new lesson."""
        old_cap, new_cap = path_with_problematic
        old_pm = build_path_memory(old_cap, path_title="Calc")
        new_pm = build_path_memory(new_cap, path_title="Calc")

        delta = compute_didactic_delta(old_pm, new_pm)

        # L3 added: integrale, antiderivata
        new_names = {c.name for c in delta.new_concepts}
        assert "integrale" in new_names, "integrale should be detected as new"
        assert "antiderivata" in new_names, "antiderivata should be detected as new"
        assert delta.total_new_concepts == 2

    def test_detects_clarified_concepts(self, path_with_problematic):
        """Delta detects concepts that went from problematic → non-problematic."""
        old_cap, new_cap = path_with_problematic
        old_pm = build_path_memory(old_cap, path_title="Calc")
        new_pm = build_path_memory(new_cap, path_title="Calc")

        delta = compute_didactic_delta(old_pm, new_pm)

        # concetto problematico was problematic in old, now reinforced in new
        clarified_names = {c.name for c in delta.clarified_concepts}
        assert "concetto problematico" in clarified_names
        assert delta.total_clarified >= 1

    def test_detects_still_open_concepts(self, path_with_persistent_problematic):
        """Delta detects concepts that remain problematic."""
        old_cap, new_cap = path_with_persistent_problematic
        old_pm = build_path_memory(old_cap, path_title="Test")
        new_pm = build_path_memory(new_cap, path_title="Test")

        delta = compute_didactic_delta(old_pm, new_pm)

        open_names = {c.name for c in delta.still_open_concepts}
        assert "concetto dubbi" in open_names
        assert delta.total_still_open >= 1

    def test_detects_over_repeated_concepts(self, path_with_over_repeated):
        """Delta detects concepts appearing in 3+ lessons."""
        old_pm = build_path_memory(path_with_over_repeated[0], path_title="Over")
        new_pm = build_path_memory(path_with_over_repeated[1], path_title="Over")

        delta = compute_didactic_delta(old_pm, new_pm)

        repeated_names = {c.name for c in delta.over_repeated_concepts}
        assert "derivata" in repeated_names
        assert delta.total_over_repeated >= 1

    def test_milestones_m4_new_concept_plus_debt_from_l2(self):
        """MILESTONES M4: adding L4, delta detects NEW concept + debt from L2.

        Unit test (mock-based capsules) verifying the integration scenario
        described in MILESTONES.md M4: given a path of 3 lessons where L2
        introduces a problematic concept, adding L4 with a new concept
        produces:
          - didactic_delta: new_concepts includes the L4 concept
          - didactic_delta: still_open_concepts includes the L2 problematic
          - learning_debt: unmastered_concept debt from the L2 problematic

        Uses _make_capsule() like all other delta tests; the concept names
        follow the domain pattern (introduced/reinforced/problematic flow).
        The L4 fixture file (fixtures/sample_path/lessons/l4_integral_substitution.json)
        exists for structural validation via test_fixtures_sample_path.py;
        the pipeline integration (ingest→segment→extract→assemble) uses
        mock capsules because segmentation+extraction require the LLM router.
        This unit test verifies the scenario logic — the fixture ensures
        the data is well-formed for future full-pipeline integration tests.
        """
        l1 = _make_capsule(
            "l1", "definizione derivata",
            concepts=[("derivata", "introduced"), ("limite", "introduced")],
            exercises=["Calcola f'(x) per f(x)=x^2"],
        )
        l2 = _make_capsule(
            "l2", "regole di derivazione",
            concepts=[
                ("derivata", "reinforced"),
                ("regola potenza", "introduced"),
                ("concetto dubbio", "problematic"),
            ],
            exercises=["Applica regola potenza a x^3"],
        )
        l3 = _make_capsule(
            "l3", "introduzione integrale",
            concepts=[
                ("antiderivata", "introduced"),
                ("integrale", "introduced"),
                ("derivata", "reinforced"),
                ("concetto dubbio", "problematic"),
            ],
            exercises=["Trova integrale di 2x"],
        )
        l4 = _make_capsule(
            "l4", "integrali per sostituzione",
            concepts=[
                ("sostituzione", "introduced"),
                ("integrale", "reinforced"),
                ("concetto dubbio", "problematic"),
            ],
            exercises=["Integra 2x*cos(x^2) per sostituzione"],
        )

        # Old path = L1+L2+L3, New path = L1+L2+L3+L4
        old_pm = build_path_memory([l1, l2, l3], path_title="Calcolo")
        new_pm = build_path_memory([l1, l2, l3, l4], path_title="Calcolo")

        # --- DidacticDelta: new concept from L4 ---
        delta = compute_didactic_delta(old_pm, new_pm)

        new_names = {c.name for c in delta.new_concepts}
        assert "sostituzione" in new_names, (
            "L4 introduces 'sostituzione' as a new concept not in L1-L3"
        )
        assert delta.total_new_concepts >= 1

        # --- DidacticDelta: still-open concept from L2 ---
        open_names = {c.name for c in delta.still_open_concepts}
        assert "concetto dubbio" in open_names, (
            "'concetto dubbio' from L2 remains problematic through L4"
        )
        assert delta.total_still_open >= 1

        # --- Learning Debt: unmastered concept from L2 ---
        ledger = compute_learning_debt(new_pm, delta, path_id="path_calc_101")

        unmastered = [i for i in ledger.items if i.kind == "unmastered_concept"]
        assert len(unmastered) >= 1
        assert any("concetto dubbio" in i.description for i in unmastered), (
            "Debt from L2: 'concetto dubbio' appears as unmastered_concept "
            "in the learning debt ledger"
        )
        assert ledger.by_kind.get("unmastered_concept", 0) >= 1

    def test_new_lesson_introduces_concept_and_leaves_debt(self):
        """MILESTONES scenario: adding L4 fixture, delta detects new concept + debt from L2.

        This tests the "concetto nuovo + debito aperto da L2" described in
        MILESTONES.md M4 test case.
        """
        l1 = _make_capsule(
            "l1", "base",
            concepts=[("limite", "introduced")],
            exercises=["Calcola limite base"],
        )
        l2 = _make_capsule(
            "l2", "derivate",
            concepts=[("derivata", "introduced"), ("limite", "reinforced")],
            exercises=["Derivata di x^2"],
        )
        l3 = _make_capsule(
            "l3", "potenza",
            concepts=[("derivata", "reinforced"), ("regola potenza", "introduced")],
            exercises=["Regola potenza su x^3"],
        )
        l4 = _make_capsule(
            "l4", "integrali",
            concepts=[
                ("integrale", "introduced"),
                ("derivata", "reinforced"),
                ("limite", "reinforced"),
            ],
            exercises=["Integrale di 2x"],
        )

        old_pm = build_path_memory([l1, l2, l3], path_title="Calcolo")
        new_pm = build_path_memory([l1, l2, l3, l4], path_title="Calcolo")

        delta = compute_didactic_delta(old_pm, new_pm)

        # New concept detected: integrale
        new_names = {c.name for c in delta.new_concepts}
        assert "integrale" in new_names, (
            "Milestone M4 test: L4 introduces 'integrale' as new concept"
        )
        assert delta.total_new_concepts >= 1

        # No persistent debt from L2 in this scenario (no problematic concepts)
        assert delta.total_still_open == 0

    def test_detects_new_misconceptions(self, path_with_problematic):
        """New misconceptions appear when new lesson adds questions."""
        old_cap, new_cap = path_with_problematic
        old_pm = build_path_memory(old_cap, path_title="Calc")
        new_pm = build_path_memory(new_cap, path_title="Calc")

        delta = compute_didactic_delta(old_pm, new_pm)

        # L3 adds "Integrale e area sottesa?" as a new question
        assert len(delta.new_misconceptions) >= 1
        assert delta.total_new_misconceptions >= 1

    def test_detects_resolved_misconceptions(self):
        """Resolved misconceptions detected when old lessons are revised.

        Creates an old path with L1 (has question X), then a NEW version of
        the path where L1 is replaced by L1_revised (same concepts, no
        question X — the question has been answered). The old question X
        should be in resolved_misconceptions.
        """
        l1_old = _make_capsule(
            "l1", "base",
            concepts=[("concetto A", "introduced")],
            questions=["Dubbio da risolvere?"],
        )
        l1_revised = _make_capsule(
            "l1", "base",
            concepts=[("concetto A", "introduced")],
            # No questions — the doubt has been resolved
        )

        old_pm = build_path_memory([l1_old], path_title="Test")
        new_pm = build_path_memory([l1_revised], path_title="Test")

        delta = compute_didactic_delta(old_pm, new_pm)

        # Old had "Dubbio da risolvere?" — new version has no questions
        resolved_texts = delta.resolved_misconceptions
        assert len(resolved_texts) >= 1
        assert any("Dubbio da risolvere" in m for m in resolved_texts)

    def test_identical_versions_produce_empty_delta(self):
        """Comparing identical PathMemories: no new/clarified/resolved categories.

        Note: 'still_open_concepts' may still be non-empty if the path
        contains 'problematic' concepts (they're still open regardless of
        comparison). Similarly, 'over_repeated' and 'under_practiced' are
        absolute metrics over the new version, not comparison-based.
        """
        # Use a path with NO problematic concepts for a clean baseline
        l1 = _make_capsule(
            "l1", "base",
            concepts=[("A", "introduced")],
        )
        pm = build_path_memory([l1], path_title="T")

        delta = compute_didactic_delta(pm, pm)

        assert delta.total_new_concepts == 0
        assert delta.total_clarified == 0
        assert delta.total_still_open == 0  # no problematic concepts
        assert delta.total_new_misconceptions == 0
        assert delta.total_resolved_misconceptions == 0

    def test_raises_on_empty_old(self):
        """Old PathMemory with no concepts raises ValueError."""
        from lessonos.graph.path_memory import PathMemory as EmptyPM

        # Construct a PathMemory with empty concept_graph
        caps = _make_capsule("l1", "t", [("c", "introduced")])
        valid = build_path_memory([caps], path_title="T")

        empty = EmptyPM(
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

        with pytest.raises(ValueError, match="old PathMemory has no concepts"):
            compute_didactic_delta(empty, valid)

        with pytest.raises(ValueError, match="new PathMemory has no concepts"):
            compute_didactic_delta(valid, empty)

    def test_delta_immutable(self, path_with_problematic):
        """DidacticDelta and DeltaConceptChange are frozen."""
        old_cap, new_cap = path_with_problematic
        old_pm = build_path_memory(old_cap, path_title="Calc")
        new_pm = build_path_memory(new_cap, path_title="Calc")

        delta = compute_didactic_delta(old_pm, new_pm)

        import dataclasses

        assert dataclasses.fields(delta)  # is a dataclass
        with pytest.raises(dataclasses.FrozenInstanceError):
            delta.new_concepts = ()

        if delta.new_concepts:
            with pytest.raises(dataclasses.FrozenInstanceError):
                delta.new_concepts[0].name = "changed"

    def test_concept_change_same_fields(self, path_with_problematic):
        """DeltaConceptChange correctly captures old vs new statuses."""
        old_cap, new_cap = path_with_problematic
        old_pm = build_path_memory(old_cap, path_title="Calc")
        new_pm = build_path_memory(new_cap, path_title="Calc")

        delta = compute_didactic_delta(old_pm, new_pm)

        # Verify clarified concept data
        for change in delta.clarified_concepts:
            assert "problematic" in change.old_statuses, (
                f"{change.name} should have 'problematic' in old_statuses"
            )
            assert any(
                s in change.new_statuses for s in ("introduced", "reinforced", "reviewed")
            ), f"{change.name} should have non-problematic status in new"

    def test_delta_deterministic(self):
        """Same inputs produce identical delta."""
        l1 = _make_capsule(
            "l1", "base",
            concepts=[("A", "introduced")],
        )
        l2 = _make_capsule(
            "l2", "avanzato",
            concepts=[("A", "reinforced"), ("B", "introduced")],
        )

        old_pm = build_path_memory([l1], path_title="T")
        new_pm = build_path_memory([l1, l2], path_title="T")

        delta1 = compute_didactic_delta(old_pm, new_pm)
        delta2 = compute_didactic_delta(old_pm, new_pm)

        assert delta1 == delta2

    def test_under_practiced_concept_detected(self):
        """Concepts with exercises < lessons are flagged as under-practiced."""
        l1 = _make_capsule(
            "l1", "base",
            concepts=[("derivata", "introduced")],
            exercises=["Derivata di x^2"],
        )
        l2 = _make_capsule(
            "l2", "potenza",
            concepts=[("derivata", "reinforced")],
            # NO exercise mentioning "derivata" in prompt
            exercises=["Integrale di 2x"],
        )

        old_pm = build_path_memory([l1], path_title="Calc")
        new_pm = build_path_memory([l1, l2], path_title="Calc")

        delta = compute_didactic_delta(old_pm, new_pm)

        # derivata appears in 2 lessons but only 1 exercise mentions it
        under_names = {c.name for c in delta.under_practiced_concepts}
        assert "derivata" in under_names
        assert delta.total_under_practiced >= 1


def test_delta_concept_change_immutable():
    """DeltaConceptChange is a frozen dataclass."""
    import dataclasses

    change = DeltaConceptChange(
        name="test",
        old_statuses=("introduced",),
        new_statuses=("reinforced",),
        old_lessons=("l1",),
        new_lessons=("l1", "l2"),
    )

    assert change.name == "test"
    assert change.old_statuses == ("introduced",)
    assert change.new_statuses == ("reinforced",)

    with pytest.raises(dataclasses.FrozenInstanceError):
        change.name = "changed"


def test_didactic_delta_summary_counts_match(path_with_problematic):
    """Summary counts match actual category lengths from compute_didactic_delta."""
    old_cap, new_cap = path_with_problematic
    old_pm = build_path_memory(old_cap, path_title="Calc")
    new_pm = build_path_memory(new_cap, path_title="Calc")

    delta = compute_didactic_delta(old_pm, new_pm)

    assert delta.total_new_concepts == len(delta.new_concepts)
    assert delta.total_clarified == len(delta.clarified_concepts)
    assert delta.total_still_open == len(delta.still_open_concepts)
    assert delta.total_over_repeated == len(delta.over_repeated_concepts)
    assert delta.total_under_practiced == len(delta.under_practiced_concepts)
    assert delta.total_new_misconceptions == len(delta.new_misconceptions)
    assert delta.total_resolved_misconceptions == len(delta.resolved_misconceptions)
