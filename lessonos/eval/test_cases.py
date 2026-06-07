"""Initial eval test cases (M5-task1). ~6 cases exercising pipeline stages.

All cases use mock data (deterministic, free, fast). No real LLM calls.
The payload format matches the prompt instructions exactly
(see build_segmentation_prompt / build_extraction_prompt).
"""

from __future__ import annotations

import json

from lessonos.capsule.assembly import LessonCapsule, assemble_lesson_capsule
from lessonos.capsule.extraction import (
    ConceptExtraction,
    ExerciseExtraction,
    LessonContent,
    QuestionExtraction,
    build_extraction_prompt,
)
from lessonos.capsule.segmentation import TopicSpan, build_segmentation_prompt
from lessonos.eval.models import EvalCase
from lessonos.graph.didactic_delta import compute_didactic_delta
from lessonos.graph.path_memory import build_path_memory
from lessonos.llm.router import MockProvider, Router
from lessonos.models.entities import Segment
from lessonos.store.sqlite import SQLiteStore

# ---------------------------------------------------------------------------
# Helper factories (same pattern as tests/test_capsule_segmentation.py)
# ---------------------------------------------------------------------------


def _make_topic(lesson_id: str, topic: str, *seg_ids: str) -> TopicSpan:
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
    return LessonCapsule(lesson_id=lesson_id, timeline=timeline, content=content)


def _make_store(
    lesson_id: str = "l1",
    segments: list[tuple[str, int, int, str]] | None = None,
) -> SQLiteStore:
    """Create in-memory store with optional segments."""
    store = SQLiteStore(":memory:")
    if segments:
        for sid, start, end, text in segments:
            store.save_segment(
                Segment(
                    seg_id=sid,
                    lesson_id=lesson_id,
                    start=start,
                    end=end,
                    text=text,
                )
            )
    return store


def _router_for(prompt: str, payload) -> Router:
    """Mock router: returns ``payload`` (JSON-dumped) for exactly ``prompt``.
    Follows the pattern from tests/test_capsule_segmentation.py.
    """
    router = Router()
    router.register(MockProvider({prompt: json.dumps(payload)}))
    return router


# ---------------------------------------------------------------------------
# Cases
# ---------------------------------------------------------------------------


def case_segmentation_returns_topics() -> EvalCase:
    """Segment a lesson's transcript into topics via mock router."""

    def run():
        store = _make_store("l1", [
            ("l1s1", 0, 45, "Definizione formale di derivata come limite del rapporto incrementale."),
            ("l1s2", 45, 110, "Interpretazione geometrica: derivata come pendenza della tangente."),
        ])
        segments = store.segments_for_lesson("l1")
        prompt = build_segmentation_prompt(segments)
        # Prompt asks for a LIST of {topic, seg_ids} (not wrapped in a key)
        payload = [
            {"topic": "Definizione derivata", "seg_ids": ["l1s1"]},
            {"topic": "Interpretazione geometrica", "seg_ids": ["l1s2"]},
        ]
        router = _router_for(prompt, payload)

        from lessonos.capsule.segmentation import segment_lesson_topics

        spans = segment_lesson_topics(store, lesson_id="l1", router=router)
        return spans

    def expected(result):
        topics = result
        if not topics:
            return False
        names = {t.topic for t in topics}
        return "Definizione derivata" in names and "Interpretazione geometrica" in names

    return EvalCase(
        name="segmentation_returns_topics",
        description="Mock-based segmentation produces correct topic labels from transcript segments.",
        run=run,
        expected=expected,
        categories=("segmentation",),
    )


def case_extraction_rejects_bad_grounding() -> EvalCase:
    """Extraction with fabricated seg_id raises ValueError (groundedness).

    Groundedness metric: system should reject non-existent seg_ids by raising
    ValueError. ValueError raised → PASS (system caught fabrication).
    No error → FAIL (fabrication went undetected).
    """

    def run():
        store = _make_store("l1", [
            ("l1s1", 0, 45, "Derivata formale."),
        ])
        segments = store.segments_for_lesson("l1")
        prompt = build_extraction_prompt(segments)

        # Mock returns concept with fabricated seg_id l1s99 (doesn't exist)
        payload = {
            "concepts": [
                {
                    "name": "derivata",
                    "status": "introduced",
                    "citations": [{"seg_id": "l1s99", "excerpt": "some text"}],
                }
            ],
            "exercises": [],
            "student_questions": [],
            "homework": [],
        }
        router = _router_for(prompt, payload)

        from lessonos.capsule.extraction import extract_lesson_content

        try:
            extract_lesson_content(store, lesson_id="l1", router=router)
            return False  # No error = system DID NOT catch the fabrication = FAIL
        except ValueError:
            return True  # Correctly rejected = PASS

    def expected(result):
        # The system SHOULD raise ValueError on bad grounding
        return result is True

    return EvalCase(
        name="extraction_rejects_bad_grounding",
        description="Groundedness check: extraction rejects fabricated seg_id with ValueError.",
        run=run,
        expected=expected,
        categories=("groundedness", "extraction"),
    )


def case_assembly_produces_capsule() -> EvalCase:
    """Full assembly pipeline produces a valid LessonCapsule."""

    def run():
        store = _make_store("l1", [
            ("l1s1", 0, 45, "Derivata definizione."),
            ("l1s2", 45, 110, "Regola della potenza."),
        ])
        segments = store.segments_for_lesson("l1")
        seg_prompt = build_segmentation_prompt(segments)
        ext_prompt = build_extraction_prompt(segments)

        # Build router with both fixtures
        router = Router()
        router.register(MockProvider({
            seg_prompt: json.dumps([
                {"topic": "Definizione derivata", "seg_ids": ["l1s1"]},
                {"topic": "Regola potenza", "seg_ids": ["l1s2"]},
            ]),
            ext_prompt: json.dumps({
                "concepts": [
                    {"name": "derivata", "status": "introduced",
                     "citations": [{"seg_id": "l1s1", "excerpt": "derivata"}]}
                ],
                "exercises": [],
                "student_questions": [],
                "homework": [],
            }),
        }))

        capsule = assemble_lesson_capsule(store, lesson_id="l1", router=router)
        return capsule

    def expected(result):
        if not isinstance(result, LessonCapsule):
            return False
        caps: LessonCapsule = result
        return (
            caps.lesson_id == "l1"
            and len(caps.timeline) >= 1
            and caps.content is not None
            and len(caps.content.concepts) >= 1
        )

    return EvalCase(
        name="assembly_produces_capsule",
        description="Full assembly pipeline produces LessonCapsule with timeline + content.",
        run=run,
        expected=expected,
        categories=("assembly",),
    )


def case_path_memory_aggregates_concepts() -> EvalCase:
    """PathMemory correctly aggregates concepts across multiple capsules."""

    def run():
        l1 = _make_capsule(
            "l1", "Definizione derivata",
            concepts=[("derivata", "introduced"), ("limite", "introduced")],
        )
        l2 = _make_capsule(
            "l2", "Regola potenza",
            concepts=[("derivata", "reinforced"), ("regola potenza", "introduced")],
        )
        pm = build_path_memory([l1, l2], path_title="Calcolo")
        return pm

    def expected(result):
        from lessonos.graph.path_memory import PathMemory

        if not isinstance(result, PathMemory):
            return False
        pm: PathMemory = result
        concept_names = {c.name for c in pm.concept_graph}
        return (
            "derivata" in concept_names
            and "limite" in concept_names
            and "regola potenza" in concept_names
            and pm.total_concepts >= 3
            and len(pm.lesson_index) == 2
        )

    return EvalCase(
        name="path_memory_aggregates_concepts",
        description="PathMemory merges concepts from L1+L2 with correct deduplication.",
        run=run,
        expected=expected,
        categories=("path_memory",),
    )


def case_didactic_delta_detects_new() -> EvalCase:
    """DidacticDelta detects new concept added by L3."""

    def run():
        l1 = _make_capsule(
            "l1", "derivata",
            concepts=[("derivata", "introduced")],
        )
        l2 = _make_capsule(
            "l2", "potenza",
            concepts=[("derivata", "reinforced"), ("regola potenza", "introduced")],
        )
        l3 = _make_capsule(
            "l3", "integrale",
            concepts=[("integrale", "introduced"), ("derivata", "reinforced")],
        )

        old_pm = build_path_memory([l1, l2], path_title="Calc")
        new_pm = build_path_memory([l1, l2, l3], path_title="Calc")

        delta = compute_didactic_delta(old_pm, new_pm)
        return delta

    def expected(result):
        from lessonos.graph.didactic_delta import DidacticDelta

        if not isinstance(result, DidacticDelta):
            return False
        delta: DidacticDelta = result
        new_names = {c.name for c in delta.new_concepts}
        return "integrale" in new_names and delta.total_new_concepts >= 1

    return EvalCase(
        name="didactic_delta_detects_new",
        description="Delta identifies 'integrale' as new concept when adding L3 to L1+L2.",
        run=run,
        expected=expected,
        categories=("didactic_delta",),
    )


def case_learning_debt_identifies_open() -> EvalCase:
    """LearningDebt identifies unmastered concept from a problematic-status concept."""

    def run():
        l1 = _make_capsule(
            "l1", "base",
            concepts=[("concetto A", "introduced"), ("concetto dubbio", "problematic")],
            exercises=["Esercizio A"],
        )
        l2 = _make_capsule(
            "l2", "avanzato",
            concepts=[("concetto A", "reinforced"), ("concetto B", "introduced"),
                       ("concetto dubbio", "problematic")],
            exercises=["Esercizio B"],
        )

        pm = build_path_memory([l1, l2], path_title="Test")
        old_pm = build_path_memory([l1], path_title="Test")
        delta = compute_didactic_delta(old_pm, pm)

        from lessonos.graph.learning_debt import compute_learning_debt
        ledger = compute_learning_debt(pm, delta, path_id="test_001")
        return ledger

    def expected(result):
        from lessonos.graph.learning_debt import LearningDebtLedger

        if not isinstance(result, LearningDebtLedger):
            return False
        ledger: LearningDebtLedger = result
        unmastered = [i for i in ledger.items if i.kind == "unmastered_concept"]
        return (
            len(unmastered) >= 1
            and ledger.by_kind.get("unmastered_concept", 0) >= 1
            and len(ledger.items) >= 1
        )

    return EvalCase(
        name="learning_debt_identifies_open",
        description="Debt ledger flags problematic concept as unmastered debt item.",
        run=run,
        expected=expected,
        categories=("learning_debt",),
    )


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------

ALL_CASES: list[EvalCase] = [
    case_segmentation_returns_topics(),
    case_extraction_rejects_bad_grounding(),
    case_assembly_produces_capsule(),
    case_path_memory_aggregates_concepts(),
    case_didactic_delta_detects_new(),
    case_learning_debt_identifies_open(),
]
