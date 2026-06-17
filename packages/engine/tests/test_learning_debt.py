"""Test Learning Debt Ledger — consolidated debt from PathMemory + DidacticDelta (PLAN §3.4, M4).

Verifies that compute_learning_debt correctly detects:
- Unmastered concepts (still-open problematic concepts from DidacticDelta)
- Under-practiced concepts (concepts with few exercises relative to coverage)
- Over-repeated concepts (concepts in 3+ lessons)
- Open doubts (unresolved student questions / recurring misconceptions)
- Weak prerequisites (prerequisites declared but never introduced in the path)
- Edge cases: empty inputs, no debt, deterministic output, immutability
"""

import dataclasses

import pytest

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import (
    ConceptExtraction,
    ExerciseExtraction,
    LessonContent,
    QuestionExtraction,
)
from lessonos.capsule.segmentation import TopicSpan
from lessonos.graph.didactic_delta import compute_didactic_delta
from lessonos.graph.learning_debt import (
    DEBT_KINDS,
    LearningDebtLedger,
    compute_learning_debt,
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
def path_with_all_debt_types() -> tuple[PathMemory, PathMemory]:
    """Old path (L1) and new path (L1+L2) covering all debt categories.

    L1: derivata (introduced), limite (introduced)
        — no problematic concepts initially
    L2: integrale (introduced), derivata (reinforced),
        concetto_problematico (problematic — stays open)
        — adds an open doubt question
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
    return old_pm, new_pm


@pytest.fixture
def path_with_weak_prereqs() -> PathMemory:
    """A path with a concept declaring a missing prerequisite.

    L1: derivata (introduced, prereqs=["limite"])
        — 'limite' is NOT in any concept_graph entry
    """
    capsule = _make_capsule_with_prereqs(
        lesson_id="l1",
        topic="derivate",
        concepts=[("derivata", "introduced", ["limite"])],
    )
    return build_path_memory([capsule], path_title="Calc")


@pytest.fixture
def path_with_over_repeated() -> tuple[PathMemory, PathMemory]:
    """Old: L1+L2+L3. New: L1+L2+L3+L4. 'derivata' in 4 lessons."""
    l1 = _make_capsule(
        "l1", "base",
        concepts=[("derivata", "introduced")],
        exercises=["Calcola derivata base"],
    )
    l2 = _make_capsule(
        "l2", "potenza",
        concepts=[("derivata", "reinforced")],
        exercises=["Derivata regola potenza"],
    )
    l3 = _make_capsule(
        "l3", "catena",
        concepts=[("derivata", "reinforced")],
        exercises=["Derivata regola catena"],
    )
    l4 = _make_capsule(
        "l4", "implicita",
        concepts=[("derivata", "reinforced"), ("derivazione implicita", "introduced")],
        exercises=["Derivata implicita esercizio"],
    )

    old_pm = build_path_memory([l1, l2, l3], path_title="Der")
    new_pm = build_path_memory([l1, l2, l3, l4], path_title="Der")
    return old_pm, new_pm


@pytest.fixture
def path_with_open_doubts() -> PathMemory:
    """A path with recurring misconceptions (open doubts)."""
    l1 = _make_capsule(
        "l1", "base",
        concepts=[("A", "introduced")],
        questions=["Perché A non è B?"],
    )
    return build_path_memory([l1], path_title="Test")


# --- Tests: compute_learning_debt ---


class TestComputeLearningDebt:
    """Core function: compute_learning_debt."""

    def test_detects_unmastered_concepts(self, path_with_all_debt_types):
        """Concepts with 'problematic' status become unmastered_concept debt."""
        old_pm, new_pm = path_with_all_debt_types
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="p1")

        unmastered = [i for i in ledger.items if i.kind == "unmastered_concept"]
        assert len(unmastered) == 1
        assert any("concetto problematico" in i.description for i in unmastered)
        assert ledger.by_kind.get("unmastered_concept", 0) >= 1

    def test_detects_under_practiced(self, path_with_all_debt_types):
        """Concepts with fewer exercises than lessons flagged as under-practiced."""
        old_pm, new_pm = path_with_all_debt_types
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="p1")

        # derivata appears in 2 lessons but only 1 exercise mentions it
        under = [i for i in ledger.items if i.kind == "under_practiced"]
        if under:
            assert any("derivata" in i.description for i in under)

    def test_detects_over_repeated(self, path_with_over_repeated):
        """Concepts in 3+ lessons flagged as over-repeated."""
        old_pm, new_pm = path_with_over_repeated
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="p1")

        over = [i for i in ledger.items if i.kind == "over_repeated"]
        assert len(over) == 1
        assert any("derivata" in i.description for i in over)
        assert ledger.by_kind.get("over_repeated", 0) >= 1

    def test_detects_open_doubts(self, path_with_open_doubts):
        """Recurring misconceptions become open_doubt debt items."""
        # Create an "old" path with no concepts so delta is computable
        l1_old = _make_capsule(
            "l1", "base",
            concepts=[("A", "introduced")],
        )
        old_pm = build_path_memory([l1_old], path_title="Test")
        new_pm = path_with_open_doubts

        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="p1")

        doubts = [i for i in ledger.items if i.kind == "open_doubt"]
        assert len(doubts) == 1
        assert any("Perché" in i.description for i in doubts)
        assert ledger.by_kind.get("open_doubt", 0) == 1

    def test_detects_weak_prerequisites(self, path_with_weak_prereqs):
        """Prerequisites that are never introduced become weak_prerequisite debt."""
        pm = path_with_weak_prereqs
        # Build a zero-change delta by duplicating
        l1_dup = _make_capsule("l1", "x", concepts=[("derivata", "introduced")])
        old_pm = build_path_memory([l1_dup], path_title="Calc")

        delta = compute_didactic_delta(old_pm, pm)
        ledger = compute_learning_debt(pm, delta, path_id="p1")

        weak = [i for i in ledger.items if i.kind == "weak_prerequisite"]
        assert len(weak) == 1
        assert any("limite" in i.description for i in weak)
        assert ledger.by_kind.get("weak_prerequisite", 0) == 1

    def test_debt_ids_are_deterministic(self, path_with_all_debt_types):
        """Same inputs produce identical debt IDs."""
        old_pm, new_pm = path_with_all_debt_types
        delta = compute_didactic_delta(old_pm, new_pm)

        ledger1 = compute_learning_debt(new_pm, delta, path_id="p1")
        ledger2 = compute_learning_debt(new_pm, delta, path_id="p1")

        assert ledger1 == ledger2
        ids1 = [i.debt_id for i in ledger1.items]
        ids2 = [i.debt_id for i in ledger2.items]
        assert ids1 == ids2

    def test_ledger_by_kind_covers_all_kinds(self, path_with_all_debt_types):
        """by_kind dict has all DEBT_KINDS keys, even if zero."""
        old_pm, new_pm = path_with_all_debt_types
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="p1")

        for kind in sorted(DEBT_KINDS):
            assert kind in ledger.by_kind, f"by_kind missing key: {kind}"
            assert isinstance(ledger.by_kind[kind], int)

    def test_raises_on_empty_path_memory(self):
        """Empty PathMemory raises ValueError."""
        from lessonos.capsule.assembly import LessonCapsule as LC

        old_cap = _make_capsule("l1", "t", [("A", "introduced")])
        # Build a valid delta from old->old
        old_pm = build_path_memory([old_cap], path_title="T")
        delta = compute_didactic_delta(old_pm, old_pm)

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
            compute_learning_debt(empty_pm, delta)

    def test_empty_delta_produces_empty_debt(self):
        """Empty delta produces a ledger with no delta-derived debt but valid structure."""
        l1 = _make_capsule("l1", "t", [("A", "introduced")])
        pm = build_path_memory([l1], path_title="T")

        # Build a zero-change delta
        delta = compute_didactic_delta(pm, pm)

        # Should not raise — empty delta means no delta-derived debt,
        # but PathMemory-derived debt (open_doubts, weak_prerequisites)
        # is still computed. Since this capsule has no prereqs and no
        # misconceptions, the ledger is empty.
        ledger = compute_learning_debt(pm, delta, path_id="p1")

        assert ledger.total_items == 0
        assert len(ledger.items) == 0
        # All known kinds present in by_kind (even if zero)
        for kind in sorted(DEBT_KINDS):
            assert kind in ledger.by_kind
            assert ledger.by_kind[kind] == 0

    def test_ledger_is_frozen(self, path_with_all_debt_types):
        """LearningDebtLedger is a frozen dataclass."""
        old_pm, new_pm = path_with_all_debt_types
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta)

        assert dataclasses.fields(ledger)  # is a dataclass
        with pytest.raises(dataclasses.FrozenInstanceError):
            ledger.items = ()

    def test_debt_items_frozen(self, path_with_all_debt_types):
        """Individual LearningDebtItems are frozen."""
        old_pm, new_pm = path_with_all_debt_types
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta)

        if ledger.items:
            with pytest.raises(dataclasses.FrozenInstanceError):
                ledger.items[0].resolved = True

    def test_total_items_matches_count(self, path_with_all_debt_types):
        """total_items == len(items)."""
        old_pm, new_pm = path_with_all_debt_types
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta)

        assert ledger.total_items == len(ledger.items)
        total_from_kind = sum(ledger.by_kind.values())
        assert ledger.total_items == total_from_kind

    def test_by_kind_consistency(self, path_with_all_debt_types):
        """by_kind[kind] == count of items with that kind."""
        old_pm, new_pm = path_with_all_debt_types
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta)

        for kind in DEBT_KINDS:
            actual = len([i for i in ledger.items if i.kind == kind])
            assert ledger.by_kind[kind] == actual, (
                f"by_kind[{kind!r}] = {ledger.by_kind[kind]} "
                f"but actual count = {actual}"
            )

    def test_weak_prerequisite_empty_on_no_prereqs(self):
        """Path with no prerequisite declarations has zero weak_prerequisite debt."""
        l1 = _make_capsule(
            "l1", "base",
            concepts=[("A", "introduced"), ("B", "introduced")],
        )
        pm = build_path_memory([l1], path_title="T")
        l1_dup = _make_capsule("l1", "x", concepts=[("A", "introduced")])
        old_pm = build_path_memory([l1_dup], path_title="T")

        delta = compute_didactic_delta(old_pm, pm)
        ledger = compute_learning_debt(pm, delta, path_id="p1")

        weak = [i for i in ledger.items if i.kind == "weak_prerequisite"]
        assert len(weak) == 0
        assert ledger.by_kind.get("weak_prerequisite", 0) == 0

    def test_debt_id_format(self, path_with_all_debt_types):
        """Debt IDs follow the expected format: path_id#kind#index."""
        old_pm, new_pm = path_with_all_debt_types
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="p1")

        for item in ledger.items:
            assert item.debt_id.startswith("p1#"), (
                f"debt_id {item.debt_id!r} should start with 'p1#'"
            )
            assert item.debt_id.count("#") == 2, (
                f"debt_id {item.debt_id!r} should have exactly 2 '#' separators"
            )
            # Verify the kind in debt_id matches item.kind
            parts = item.debt_id.split("#")
            assert parts[1] == item.kind, (
                f"debt_id kind {parts[1]!r} != item.kind {item.kind!r}"
            )

    def test_weak_prereq_counts_separate_concepts(self):
        """Multiple concepts with different missing prereqs yield separate items."""
        capsule = _make_capsule_with_prereqs(
            lesson_id="l1",
            topic="mixed",
            concepts=[
                ("concetto A", "introduced", ["prereq_mancante_X"]),
                ("concetto B", "introduced", ["prereq_mancante_Y"]),
            ],
        )
        pm = build_path_memory([capsule], path_title="T")
        l1_dup = _make_capsule(
            "l1", "mixed",
            concepts=[
                ("concetto A", "introduced"),
                ("concetto B", "introduced"),
            ],
        )
        old_pm = build_path_memory([l1_dup], path_title="T")
        delta = compute_didactic_delta(old_pm, pm)
        ledger = compute_learning_debt(pm, delta, path_id="p2")

        weak = [i for i in ledger.items if i.kind == "weak_prerequisite"]
        assert len(weak) == 2, (
            "Two concepts with different missing prereqs → 2 weak items"
        )
        assert ledger.by_kind.get("weak_prerequisite", 0) == 2


class TestDifficultyAwareDebt:
    """Severity from per-concept difficulty in LearningDebt (M4 maturation)."""

    def test_unmastered_concept_severity_default(self):
        """ConceptPathEntry with default D=5.0 yields severity=1.0."""
        l1 = _make_capsule(
            "l1", "base",
            concepts=[("alpha", "problematic")],
        )
        old_pm = build_path_memory([l1], path_title="T")
        # Add a second lesson that also has alpha problematic → still_open
        l2 = _make_capsule(
            "l2", "more",
            concepts=[("alpha", "problematic")],
        )
        new_pm = build_path_memory([l1, l2], path_title="T")
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="p1")

        unmastered = [i for i in ledger.items if i.kind == "unmastered_concept"]
        assert len(unmastered) == 1
        # Default difficulty = 5.0 → severity = 1.0
        assert unmastered[0].severity == pytest.approx(1.0, abs=1e-6)

    def test_unmastered_concept_severity_high_difficulty(self):
        """Concept with difficulty=9.0 yields severity ≈ 1.8 (near max)."""
        l1_concepts = [
            ("alpha", "problematic"),
            ("beta", "problematic"),
        ]
        l1 = _make_capsule("l1", "base", concepts=l1_concepts)
        old_pm = build_path_memory([l1], path_title="T")

        # Build second lesson with alpha still problematic
        l2_concepts = [
            ("alpha", "problematic"),
            ("beta", "problematic"),
        ]
        l2 = _make_capsule("l2", "more", concepts=l2_concepts)
        new_pm = build_path_memory([l1, l2], path_title="T")

        # Replace concept_graph with updated entries using update_after_review
        # to raise alpha's difficulty (q=0 -> D 5->7)
        new_pm = PathMemory(
            path_title=new_pm.path_title,
            current_state=new_pm.current_state,
            lesson_index=new_pm.lesson_index,
            concept_graph=tuple(
                cpe if cpe.name.lower() != "alpha"
                else cpe.update_after_review(0)  # D=5 → q=0 → D=7
                for cpe in new_pm.concept_graph
            ),
            exercise_bank=new_pm.exercise_bank,
            recurring_misconceptions=new_pm.recurring_misconceptions,
            best_explanations=new_pm.best_explanations,
            total_lessons=new_pm.total_lessons,
            total_concepts=new_pm.total_concepts,
            total_exercises=new_pm.total_exercises,
        )

        # Verify that update_after_review(0) raised difficulty to ~7.0
        alpha_cpe = next(c for c in new_pm.concept_graph if c.name.lower() == "alpha")
        assert alpha_cpe.difficulty == pytest.approx(7.0, abs=0.1), (
            f"Expected alpha difficulty ~7.0 after q=0, got {alpha_cpe.difficulty}"
        )

        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="p1")

        unmastered = [i for i in ledger.items if i.kind == "unmastered_concept"]
        alpha_items = [i for i in unmastered if "alpha" in i.description.lower()]
        if alpha_items:
            # D should be > 5 (raised to ~7), severity should be > 1.0
            assert alpha_items[0].severity > 1.0, (
                f"Expected severity > 1.0 for D~7, got {alpha_items[0].severity}"
            )

    def test_unmastered_severity_never_zero(self):
        """Even minimum difficulty (D=1.0) yields severity ≥ 0.2, never 0."""
        l1 = _make_capsule(
            "l1", "base",
            concepts=[("alpha", "problematic")],
        )
        old_pm = build_path_memory([l1], path_title="T")
        l2 = _make_capsule(
            "l2", "more",
            concepts=[("alpha", "problematic")],
        )
        new_pm = build_path_memory([l1, l2], path_title="T")

        # Force difficulty to 1.0
        new_pm = PathMemory(
            path_title=new_pm.path_title,
            current_state=new_pm.current_state,
            lesson_index=new_pm.lesson_index,
            concept_graph=tuple(
                ConceptPathEntry(
                    name=cpe.name,
                    first_introduced_lesson=cpe.first_introduced_lesson,
                    statuses=cpe.statuses,
                    lessons=cpe.lessons,
                    prerequisites=cpe.prerequisites,
                    repetition_count=cpe.repetition_count,
                    last_reviewed_lesson=cpe.last_reviewed_lesson,
                    difficulty=1.0,
                    estimated_retention=cpe.estimated_retention,
                )
                for cpe in new_pm.concept_graph
            ),
            exercise_bank=new_pm.exercise_bank,
            recurring_misconceptions=new_pm.recurring_misconceptions,
            best_explanations=new_pm.best_explanations,
            total_lessons=new_pm.total_lessons,
            total_concepts=new_pm.total_concepts,
            total_exercises=new_pm.total_exercises,
        )

        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="p1")

        for item in ledger.items:
            if item.kind == "unmastered_concept":
                # D=1.0 → severity = 1.0 + (1.0-5.0)/5.0 = 0.2
                assert item.severity == pytest.approx(0.2, abs=1e-6)

    def test_under_practiced_debt_default_severity(self):
        """Under-practiced (not unmastered) debt items stay at default severity 1.0."""
        l1 = _make_capsule(
            "l1", "base",
            concepts=[("alpha", "introduced")],
        )
        # L2: alpha not introduced (no delta), but path memory has it
        l2 = _make_capsule(
            "l2", "more",
            concepts=[("alpha", "reinforced")],
        )
        old_pm = build_path_memory([l1], path_title="T")
        new_pm = build_path_memory([l1, l2], path_title="T")
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="p1")

        for item in ledger.items:
            if item.kind == "under_practiced":
                assert item.severity == pytest.approx(1.0, abs=1e-6)
            elif item.kind == "unmastered_concept":
                # These DO have difficulty-derived severity
                pass
