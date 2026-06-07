"""Test Path Memory aggregation (lessonos/graph/path_memory.py, M3).

Verifies that build_path_memory correctly aggregates Lesson Capsules into
a path-level PathMemory: lesson_index with ordered topics/concepts/exercises,
canonical concept aggregation across lessons, exercise bank, recurring
misconceptions, and deterministic output.
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
from lessonos.graph.path_memory import (
    LessonIndexEntry,
    PathMemory,
    build_path_memory,
)


def _make_topic(lesson_id: str, topic: str, *seg_ids: str) -> TopicSpan:
    """Build a minimal TopicSpan."""
    return TopicSpan(
        lesson_id=lesson_id,
        topic=topic,
        seg_ids=seg_ids,
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
        ConceptExtraction(
            name=c[0],
            status=c[1],
        )
        for c in concepts
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
def sample_capsules():
    """Three lessons: L1 derivatives, L2 power rule, L3 integrals."""
    l1 = _make_capsule(
        lesson_id="l1_derivative_definition",
        topic="definizione derivata",
        concepts=[
            ("derivata", "introduced"),
            ("limite", "introduced"),
        ],
        exercises=["Calcola f'(x) per f(x)=x^2"],
        questions=["Cosa succede se h=0?"],
    )
    l2 = _make_capsule(
        lesson_id="l2_derivative_rules",
        topic="regola della potenza",
        concepts=[
            ("derivata", "reinforced"),
            ("regola della potenza", "introduced"),
        ],
        exercises=["Applica la regola della potenza a f(x)=x^3"],
    )
    l3 = _make_capsule(
        lesson_id="l3_integral_intro",
        topic="introduzione integrale",
        concepts=[
            ("antiderivata", "introduced"),
            ("integrale", "introduced"),
        ],
        exercises=["Trova l'integrale di f(x)=2x"],
        questions=["Integrale e area sottesa?"],
    )
    return [l1, l2, l3]


# --- build_path_memory ---


def test_path_memory_raises_on_empty():
    """Empty capsules list raises ValueError."""
    with pytest.raises(ValueError, match="at least one capsule"):
        build_path_memory([])


def test_path_memory_lesson_index(sample_capsules):
    """Lesson index has correct order and entry structure."""
    pm = build_path_memory(sample_capsules)

    assert len(pm.lesson_index) == 3

    # Lesson order preserved
    assert pm.lesson_index[0].lesson_id == "l1_derivative_definition"
    assert pm.lesson_index[1].lesson_id == "l2_derivative_rules"
    assert pm.lesson_index[2].lesson_id == "l3_integral_intro"

    # L1: 2 concepts (derivata, limite), 1 exercise, 1 new concept, 0 reinforced
    entry_l1 = pm.lesson_index[0]
    assert entry_l1.concept_count == 2
    assert entry_l1.exercise_count == 1
    assert "derivata" in entry_l1.new_concepts
    assert "limite" in entry_l1.new_concepts
    assert len(entry_l1.new_concepts) == 2
    assert len(entry_l1.reinforced_concepts) == 0

    # L2: 2 concepts, 1 exercise, derivata reinforced
    entry_l2 = pm.lesson_index[1]
    assert entry_l2.concept_count == 2
    assert entry_l2.exercise_count == 1
    assert "regola della potenza" in entry_l2.new_concepts
    assert "derivata" in entry_l2.reinforced_concepts

    # L3: 2 concepts, 1 exercise, 2 new concepts
    entry_l3 = pm.lesson_index[2]
    assert entry_l3.concept_count == 2
    assert "antiderivata" in entry_l3.new_concepts
    assert "integrale" in entry_l3.new_concepts


def test_path_memory_concept_aggregation(sample_capsules):
    """Concepts aggregated canonically across lessons."""
    pm = build_path_memory(sample_capsules)

    # Concept graph entries (5 unique concepts across 3 lessons)
    assert len(pm.concept_graph) == 5

    # Find 'derivata' entry
    derivata = next(c for c in pm.concept_graph if c.name == "derivata")
    assert derivata.first_introduced_lesson == "l1_derivative_definition"
    assert "reinforced" in derivata.statuses
    assert "introduced" in derivata.statuses
    assert "l2_derivative_rules" in derivata.lessons

    # 'limite' only in L1
    limite = next(c for c in pm.concept_graph if c.name == "limite")
    assert limite.first_introduced_lesson == "l1_derivative_definition"
    assert limite.lessons == ("l1_derivative_definition",)

    # 'regola della potenza' only in L2
    regola = next(c for c in pm.concept_graph if c.name == "regola della potenza")
    assert regola.first_introduced_lesson == "l2_derivative_rules"

    # 'antiderivata' and 'integrale' in L3
    antiderivata = next(c for c in pm.concept_graph if c.name == "antiderivata")
    assert antiderivata.first_introduced_lesson == "l3_integral_intro"

    integrale = next(c for c in pm.concept_graph if c.name == "integrale")
    assert integrale.first_introduced_lesson == "l3_integral_intro"


def test_path_memory_exercise_bank(sample_capsules):
    """Exercise bank collects all exercises across lessons."""
    pm = build_path_memory(sample_capsules)

    assert len(pm.exercise_bank) == 3
    assert any("f(x)=x^2" in e for e in pm.exercise_bank)
    assert any("f(x)=x^3" in e for e in pm.exercise_bank)
    assert any("f(x)=2x" in e for e in pm.exercise_bank)

    # Exercise bank entries include lesson_id tags
    assert any("l1_derivative_definition" in e for e in pm.exercise_bank)
    assert any("l2_derivative_rules" in e for e in pm.exercise_bank)
    assert any("l3_integral_intro" in e for e in pm.exercise_bank)


def test_path_memory_recurring_misconceptions(sample_capsules):
    """Recurring misconceptions collected from student questions."""
    pm = build_path_memory(sample_capsules)

    # 2 lessons have questions (L1 + L3)
    assert len(pm.recurring_misconceptions) == 2
    assert any("h=0" in m for m in pm.recurring_misconceptions)
    assert any("area" in m for m in pm.recurring_misconceptions)


def test_path_memory_deterministic(sample_capsules):
    """Same capsules produce identical PathMemory."""
    pm1 = build_path_memory(sample_capsules, path_title="Test Path")
    pm2 = build_path_memory(sample_capsules, path_title="Test Path")

    assert pm1 == pm2

    # Check deep equality
    assert pm1.lesson_index == pm2.lesson_index
    assert pm1.concept_graph == pm2.concept_graph


def test_path_memory_path_title(sample_capsules):
    """Path title can be set explicitly or derived from first capsule."""
    # Explicit title
    pm = build_path_memory(sample_capsules, path_title="Derivatives")
    assert pm.path_title == "Derivatives"

    # Derived from first topic (fallback)
    pm2 = build_path_memory(sample_capsules)
    assert pm2.path_title == "definizione derivata"


def test_path_memory_current_state(sample_capsules):
    """Current state reflects lesson count."""
    # 1 lesson → initial
    pm1 = build_path_memory(sample_capsules[:1])
    assert pm1.current_state == "initial"

    # 2 lessons → growing
    pm2 = build_path_memory(sample_capsules[:2])
    assert pm2.current_state == "growing"

    # 3 lessons → growing (≤3)
    pm3 = build_path_memory(sample_capsules)
    assert pm3.current_state == "growing"

    # 4+ lessons → mature
    extra = _make_capsule("l4", "extra", [("concept_x", "introduced")])
    pm4 = build_path_memory(sample_capsules + [extra])
    assert pm4.current_state == "mature"


def test_path_memory_totals(sample_capsules):
    """Total counts are correct."""
    pm = build_path_memory(sample_capsules)

    assert pm.total_lessons == 3
    assert pm.total_concepts == 5  # 5 unique concepts
    assert pm.total_exercises == 3  # 3 exercises total


def test_path_memory_single_capsule():
    """Single capsule builds correctly."""
    capsule = _make_capsule(
        lesson_id="l_single",
        topic="single topic",
        concepts=[("concetto_a", "introduced")],
        exercises=["esercizio test"],
    )
    pm = build_path_memory([capsule], path_title="Single")

    assert pm.total_lessons == 1
    assert pm.total_concepts == 1
    assert pm.total_exercises == 1
    assert pm.current_state == "initial"


def test_concept_case_insensitive_aggregation():
    """Same concept with different casing merges into one entry."""
    l1 = _make_capsule(
        "l1", "t", [("derivata", "introduced")]
    )
    l2 = _make_capsule(
        "l2", "t", [("Derivata", "reinforced")]
    )
    pm = build_path_memory([l1, l2])

    assert len(pm.concept_graph) == 1, "Derivata/derivata should merge"
    assert pm.concept_graph[0].name == "derivata"  # preserves first occurrence case
    assert "introduced" in pm.concept_graph[0].statuses
    assert "reinforced" in pm.concept_graph[0].statuses


def test_concept_reinforced_never_introduced():
    """Concept reinforced without a prior 'introduced' status still appears."""
    # This simulates a case where the LLM marked a concept as 'reinforced'
    # without a prior 'introduced' lesson (e.g. imported path).
    capsule = _make_capsule(
        "l1", "t", [("derivata", "reinforced")]
    )
    pm = build_path_memory([capsule])

    derivata = next(c for c in pm.concept_graph if c.name == "derivata")
    assert derivata.first_introduced_lesson is None  # never introduced
    assert derivata.statuses == ("reinforced",)


def test_lesson_index_entry_from_capsule():
    """LessonIndexEntry.from_capsule extracts correct fields."""
    capsule = _make_capsule(
        lesson_id="test_lesson",
        topic="Concetti Base",
        concepts=[
            ("concetto_A", "introduced"),
            ("concetto_B", "reinforced"),
        ],
        exercises=["ex1", "ex2"],
        questions=["dubbio?"],
    )

    entry = LessonIndexEntry.from_capsule(capsule)

    assert entry.lesson_id == "test_lesson"
    assert entry.title == "Concetti Base"
    assert entry.topics == ("Concetti Base",)
    assert entry.concept_count == 2
    assert entry.exercise_count == 2
    assert entry.new_concepts == ("concetto_A",)
    assert entry.reinforced_concepts == ("concetto_B",)


def test_path_memory_prerequisites_propagation():
    """Concept prerequisites are preserved in PathMemory."""
    # Create a capsule where 'integrale' depends on 'derivata'
    l1 = _make_capsule(
        lesson_id="l1",
        topic="base",
        concepts=[("derivata", "introduced")],
    )
    # Build L2 capsule directly to pass ConceptExtraction with prerequisites
    l2_content = LessonContent(
        lesson_id="l2",
        concepts=(
            ConceptExtraction(
                name="integrale",
                status="introduced",
                prerequisites=("derivata",),
            ),
        ),
    )
    l2_timeline = (_make_topic("l2", "advanced"),)
    l2 = LessonCapsule(lesson_id="l2", timeline=l2_timeline, content=l2_content)

    pm = build_path_memory([l1, l2])

    integrale = next(c for c in pm.concept_graph if c.name == "integrale")
    assert "derivata" in integrale.prerequisites

    derivata = next(c for c in pm.concept_graph if c.name == "derivata")
    assert derivata.prerequisites == ()
