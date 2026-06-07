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
# Case: capsule persists and reloads (M5 — capsule persistence)
# ---------------------------------------------------------------------------


def case_capsule_persists_and_reloads() -> EvalCase:
    """Assemble a LessonCapsule with save=True, reload it via load_capsule."""

    def run():
        store = _make_store("l1", [
            ("l1s1", 0, 45, "Definizione formale di derivata."),
            ("l1s2", 45, 110, "Regola della potenza."),
        ])
        segments = store.segments_for_lesson("l1")
        seg_prompt = build_segmentation_prompt(segments)
        ext_prompt = build_extraction_prompt(segments)

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

        from lessonos.capsule.assembly import assemble_lesson_capsule, load_capsule

        # Assemble with save=True
        assemble_lesson_capsule(store, lesson_id="l1", router=router, save=True)

        # Reload from store
        reloaded = load_capsule(store, lesson_id="l1")
        return reloaded

    def expected(result):
        from lessonos.capsule.assembly import LessonCapsule

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
        name="capsule_persists_and_reloads",
        description="LessonCapsule saved to store and reloaded correctly via load_capsule.",
        run=run,
        expected=expected,
        categories=("capsule_persistence", "assembly"),
    )


# ---------------------------------------------------------------------------
# Case: graph cross-lesson connects prerequisites (M5 — graph/path-scope)
# ---------------------------------------------------------------------------


def case_graph_cross_lesson_connects_prerequisites() -> EvalCase:
    """build_path_graph creates cross-lesson 'repeats' and 'depends_on' edges."""

    def run():
        from lessonos.capsule.assembly import LessonCapsule
        from lessonos.capsule.extraction import (
            ConceptExtraction, ExerciseExtraction, LessonContent,
        )
        from lessonos.capsule.segmentation import TopicSpan
        from lessonos.graph.builder import build_path_graph

        l1 = LessonCapsule(
            lesson_id="l1",
            timeline=(TopicSpan("l1", "derivata", ("s1",), 0, 60),),
            content=LessonContent(
                lesson_id="l1",
                concepts=(ConceptExtraction(name="derivata", status="introduced"),),
                exercises=(ExerciseExtraction(prompt="Calcola derivata"),),
            ),
        )
        l2 = LessonCapsule(
            lesson_id="l2",
            timeline=(TopicSpan("l2", "potenza", ("s2",), 0, 50),),
            content=LessonContent(
                lesson_id="l2",
                concepts=(ConceptExtraction(name="derivata", status="reinforced"),),
                exercises=(ExerciseExtraction(prompt="Derivata di x^3"),),
            ),
        )

        nodes, edges = build_path_graph([l1, l2])
        return nodes, edges

    def expected(result):
        nodes, edges = result
        if not nodes or not edges:
            return False

        edge_types = {e.edge_type for e in edges}
        # Must have 'repeats' (cross-lesson same concept) and 'assigned_in' (lesson→exercise)
        has_repeats = "repeats" in edge_types
        has_explains = "explains" in edge_types
        has_assigned = "assigned_in" in edge_types

        # Concept 'derivata' appears in both lessons — there should be a repeats edge
        repeats_edges = [e for e in edges if e.edge_type == "repeats"]
        has_cross_lesson_edge = len(repeats_edges) >= 1

        return has_repeats and has_explains and has_assigned and has_cross_lesson_edge

    return EvalCase(
        name="graph_cross_lesson_connects_prerequisites",
        description="Path graph creates 'repeats' edges for concepts appearing across lessons.",
        run=run,
        expected=expected,
        categories=("graph", "path_scope"),
    )


# ---------------------------------------------------------------------------
# Case: graph queries by concept (M5 — graph/query path-scope)
# ---------------------------------------------------------------------------


def case_graph_queries_by_concept() -> EvalCase:
    """Graph queries: find_concept, where_introduced, where_reinforced on path graph."""

    def run():
        from lessonos.capsule.assembly import LessonCapsule
        from lessonos.capsule.extraction import (
            ConceptExtraction, ExerciseExtraction, LessonContent,
        )
        from lessonos.capsule.segmentation import TopicSpan
        from lessonos.graph.builder import build_path_graph
        from lessonos.graph.queries import (
            build_networkx_graph, find_concept, where_introduced, where_reinforced,
        )

        l1 = LessonCapsule(
            lesson_id="l1",
            timeline=(TopicSpan("l1", "base", ("s1",), 0, 60),),
            content=LessonContent(
                lesson_id="l1",
                concepts=(
                    ConceptExtraction(name="limite", status="introduced"),
                    ConceptExtraction(name="derivata", status="introduced"),
                ),
                exercises=(),
            ),
        )
        l2 = LessonCapsule(
            lesson_id="l2",
            timeline=(TopicSpan("l2", "regole", ("s2",), 0, 50),),
            content=LessonContent(
                lesson_id="l2",
                concepts=(
                    ConceptExtraction(name="derivata", status="reinforced"),
                    ConceptExtraction(name="regola potenza", status="introduced"),
                ),
                exercises=(),
            ),
        )

        nodes, edges = build_path_graph([l1, l2])
        G = build_networkx_graph(nodes, edges)

        intro = where_introduced(G, "derivata")
        reinforced = where_reinforced(G, "derivata")
        concept_nodes = find_concept(G, "limite")
        potenza_nodes = find_concept(G, "regola potenza")

        return {
            "intro": intro,
            "reinforced": reinforced,
            "concept_nodes": concept_nodes,
            "potenza_nodes": potenza_nodes,
            "has_derivata": len(find_concept(G, "derivata")) == 2,
            "has_limite": len(concept_nodes) >= 1,
        }

    def expected(result):
        if not isinstance(result, dict):
            return False
        d = result
        return (
            d.get("intro") == "l1"
            and d.get("reinforced") == ["l2"]
            and len(d.get("concept_nodes", [])) >= 1
            and len(d.get("potenza_nodes", [])) >= 1
            and d.get("has_derivata") is True
            and d.get("has_limite") is True
        )

    return EvalCase(
        name="graph_queries_by_concept",
        description="Graph queries correctly identify where concepts are introduced/reinforced.",
        run=run,
        expected=expected,
        categories=("graph", "path_scope", "queries"),
    )


# ---------------------------------------------------------------------------
# Case: next lesson planner prioritizes gaps (M5 — full M4 path-scope pipeline)
# ---------------------------------------------------------------------------


def case_next_lesson_planner_prioritizes_gaps() -> EvalCase:
    """NextLessonPlan prioritises prerequisite gaps > review > open doubt > practice > new material."""

    def run():
        from lessonos.capsule.assembly import LessonCapsule
        from lessonos.capsule.extraction import (
            ConceptExtraction, ExerciseExtraction, LessonContent, QuestionExtraction,
        )
        from lessonos.capsule.segmentation import TopicSpan
        from lessonos.graph.didactic_delta import compute_didactic_delta
        from lessonos.graph.learning_debt import compute_learning_debt
        from lessonos.graph.next_lesson_planner import compute_next_lesson_plan
        from lessonos.graph.path_memory import build_path_memory

        l1 = LessonCapsule(
            lesson_id="l1",
            timeline=(TopicSpan("l1", "base", ("s1",), 0, 60),),
            content=LessonContent(
                lesson_id="l1",
                concepts=(ConceptExtraction(name="limite", status="introduced"),),
                exercises=(ExerciseExtraction(prompt="Calcola limite base"),),
            ),
        )
        l2 = LessonCapsule(
            lesson_id="l2",
            timeline=(TopicSpan("l2", "derivate", ("s2",), 0, 50),),
            content=LessonContent(
                lesson_id="l2",
                concepts=(
                    ConceptExtraction(name="derivata", status="introduced"),
                    ConceptExtraction(name="limite", status="reinforced"),
                ),
                exercises=(ExerciseExtraction(prompt="Derivata di x^2"),),
                student_questions=(QuestionExtraction(question="Cosa succede se h=0?"),),
            ),
        )
        l3 = LessonCapsule(
            lesson_id="l3",
            timeline=(TopicSpan("l3", "potenza", ("s3",), 0, 40),),
            content=LessonContent(
                lesson_id="l3",
                concepts=(
                    ConceptExtraction(name="derivata", status="reinforced"),
                    ConceptExtraction(name="regola potenza", status="introduced"),
                ),
                exercises=(ExerciseExtraction(prompt="Regola potenza su x^3"),),
            ),
        )

        old_pm = build_path_memory([l1, l2], path_title="Calcolo")
        new_pm = build_path_memory([l1, l2, l3], path_title="Calcolo")
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="path_001")
        plan = compute_next_lesson_plan(new_pm, delta, ledger, path_id="path_001")

        return plan

    def expected(result):
        from lessonos.graph.next_lesson_planner import NextLessonPlan

        if not isinstance(result, NextLessonPlan):
            return False
        plan: NextLessonPlan = result

        # Collect all items with their priorities
        all_items = (
            list(plan.prerequisite_gaps)
            + list(plan.review_items)
            + list(plan.open_doubt_items)
            + list(plan.practice_items)
            + list(plan.new_material_items)
        )

        if not all_items:
            return False

        # Verify items are sorted by priority (ascending)
        priorities = [item.priority for item in all_items]
        return priorities == sorted(priorities)

    return EvalCase(
        name="next_lesson_planner_prioritizes_gaps",
        description="NextLessonPlan orders prerequisite gaps (0) before review (1) before new material (4).",
        run=run,
        expected=expected,
        categories=("learning_debt", "path_scope", "planner"),
    )


# ---------------------------------------------------------------------------
# Case: extraction valid full content (M5 — lesson-scope, extraction)
# ---------------------------------------------------------------------------


def case_extraction_valid_full_content() -> EvalCase:
    """Extraction returns concepts + exercises + questions + homework (all valid)."""

    def run():
        store = _make_store("l1", [
            ("l1s1", 0, 45, "Derivata formale: limite del rapporto incrementale."),
            ("l1s2", 45, 110, "Regola della potenza: derivata di x^n = n*x^(n-1)."),
        ])
        segments = store.segments_for_lesson("l1")
        prompt = build_extraction_prompt(segments)
        payload = {
            "concepts": [
                {"name": "derivata", "status": "introduced",
                 "citations": [{"seg_id": "l1s1", "excerpt": "Derivata formale"}]},
                {"name": "regola potenza", "status": "introduced",
                 "citations": [{"seg_id": "l1s2", "excerpt": "Regola della potenza"}]},
            ],
            "exercises": [
                {"prompt": "Calcola derivata di x^2",
                 "citations": [{"seg_id": "l1s1", "excerpt": "Derivata formale"}]},
            ],
            "student_questions": [
                {"question": "Cosa succede se n=0?",
                 "citations": [{"seg_id": "l1s2", "excerpt": "potenza"}]},
            ],
            "homework": [
                {"task": "Derivate di polinomi fino a grado 3",
                 "citations": [{"seg_id": "l1s2", "excerpt": "potenza"}]},
            ],
        }
        router = _router_for(prompt, payload)
        from lessonos.capsule.extraction import extract_lesson_content
        content = extract_lesson_content(store, lesson_id="l1", router=router)
        return content

    def expected(result):
        from lessonos.capsule.extraction import LessonContent
        if not isinstance(result, LessonContent):
            return False
        lc: LessonContent = result
        return (
            len(lc.concepts) == 2
            and len(lc.exercises) == 1
            and len(lc.student_questions) == 1
            and len(lc.homework) == 1
            and lc.concepts[0].name == "derivata"
            and lc.homework[0].task == "Derivate di polinomi fino a grado 3"
            and lc.student_questions[0].question == "Cosa succede se n=0?"
        )

    return EvalCase(
        name="extraction_valid_full_content",
        description="Extraction returns concepts+exercises+questions+homework all valid.",
        run=run,
        expected=expected,
        categories=("extraction",),
    )


# ---------------------------------------------------------------------------
# Case: extraction rejects invalid concept status (M5 — extraction, vocab)
# ---------------------------------------------------------------------------


def case_extraction_rejects_invalid_status() -> EvalCase:
    """Extraction raises ValueError when concept status is not in CONCEPT_STATUS vocab."""

    def run():
        store = _make_store("l1", [
            ("l1s1", 0, 45, "Testo qualsiasi."),
        ])
        segments = store.segments_for_lesson("l1")
        prompt = build_extraction_prompt(segments)
        # Mock returns a concept with an invalid status
        payload = {
            "concepts": [
                {"name": "finto", "status": "invalid_status",
                 "citations": [{"seg_id": "l1s1", "excerpt": "testo"}]},
            ],
            "exercises": [],
            "student_questions": [],
            "homework": [],
        }
        router = _router_for(prompt, payload)
        from lessonos.capsule.extraction import extract_lesson_content
        try:
            extract_lesson_content(store, lesson_id="l1", router=router)
            return False  # No error = system accepted invalid status = FAIL
        except ValueError:
            return True  # Correctly rejected = PASS
        except Exception:
            return False

    def expected(result):
        return result is True  # Should raise ValueError

    return EvalCase(
        name="extraction_rejects_invalid_status",
        description="Extraction rejects concept status not in CONCEPT_STATUS vocab.",
        run=run,
        expected=expected,
        categories=("extraction", "groundedness"),
    )


# ---------------------------------------------------------------------------
# Case: assembly rejects lesson with no segments (M5 — assembly, grounding)
# ---------------------------------------------------------------------------


def case_assembly_rejects_no_segments() -> EvalCase:
    """Assembly raises ValueError when the lesson has no persisted segments."""

    def run():
        store = _make_store("l1")  # No segments
        router = Router()
        router.register(MockProvider({}))  # Empty — shouldn't be called
        from lessonos.capsule.assembly import assemble_lesson_capsule
        try:
            assemble_lesson_capsule(store, lesson_id="l1", router=router)
            return False  # No error = FAIL
        except ValueError:
            return True  # Correctly rejected = PASS
        except Exception:
            return False

    def expected(result):
        return result is True

    return EvalCase(
        name="assembly_rejects_no_segments",
        description="Assembly raises ValueError when lesson has no persisted segments.",
        run=run,
        expected=expected,
        categories=("assembly", "groundedness"),
    )


# ---------------------------------------------------------------------------
# Case: PathMemory from a single capsule (M5 — path_memory, lesson-scope)
# ---------------------------------------------------------------------------


def case_path_memory_single_capsule() -> EvalCase:
    """PathMemory from a single capsule — minimal viable path."""

    def run():
        l1 = _make_capsule(
            "l1", "Introduzione",
            concepts=[("derivata", "introduced")],
        )
        from lessonos.graph.path_memory import build_path_memory
        pm = build_path_memory([l1], path_title="Minimal")
        return pm

    def expected(result):
        from lessonos.graph.path_memory import PathMemory
        if not isinstance(result, PathMemory):
            return False
        pm: PathMemory = result
        return (
            pm.path_title == "Minimal"
            and pm.total_lessons == 1
            and pm.total_concepts >= 1
            and pm.current_state == "initial"
            and len(pm.lesson_index) == 1
            and pm.lesson_index[0].lesson_id == "l1"
        )

    return EvalCase(
        name="path_memory_single_capsule",
        description="PathMemory from single capsule with one concept.",
        run=run,
        expected=expected,
        categories=("path_memory",),
    )


# ---------------------------------------------------------------------------
# Case: PathMemory rejects empty capsule list (M5 — path_memory, edge)
# ---------------------------------------------------------------------------


def case_path_memory_empty_list() -> EvalCase:
    """PathMemory raises ValueError when capsule list is empty."""

    def run():
        from lessonos.graph.path_memory import build_path_memory
        try:
            build_path_memory([])
            return False  # No error = FAIL
        except ValueError:
            return True  # Correctly rejected = PASS
        except Exception:
            return False

    def expected(result):
        return result is True

    return EvalCase(
        name="path_memory_empty_list",
        description="PathMemory raises ValueError on empty capsule list.",
        run=run,
        expected=expected,
        categories=("path_memory",),
    )


# ---------------------------------------------------------------------------
# Case: PathMemory merges concepts case-insensitively (M5 — path_memory, dedup)
# ---------------------------------------------------------------------------


def case_path_memory_case_insensitive_merge() -> EvalCase:
    """Canonical concept merging: \"Derivata\" and \"derivata\" are the same concept."""

    def run():
        l1 = _make_capsule(
            "l1", "Analisi",
            concepts=[("Derivata", "introduced")],
        )
        l2 = _make_capsule(
            "l2", "Regole",
            concepts=[("derivata", "reinforced")],
        )
        from lessonos.graph.path_memory import build_path_memory
        pm = build_path_memory([l1, l2], path_title="Test Case")
        return pm

    def expected(result):
        from lessonos.graph.path_memory import PathMemory
        if not isinstance(result, PathMemory):
            return False
        pm: PathMemory = result
        # Should merge into exactly one concept
        if pm.total_concepts != 1:
            return False
        c = pm.concept_graph[0]
        return (
            c.name in ("Derivata", "derivata")  # Preserves canonical form
            and "introduced" in c.statuses
            and "reinforced" in c.statuses
            and len(c.lessons) == 2
            and c.first_introduced_lesson == "l1"
        )

    return EvalCase(
        name="path_memory_case_insensitive_merge",
        description="Concepts 'Derivata' and 'derivata' merge into one canonical entry.",
        run=run,
        expected=expected,
        categories=("path_memory",),
    )


# ---------------------------------------------------------------------------
# Case: DidacticDelta detects no change (M5 — didactic_delta, edge)
# ---------------------------------------------------------------------------


def case_didactic_delta_no_change() -> EvalCase:
    """Identical old/new PathMemory → empty delta (no new concepts, no changes)."""

    def run():
        l1 = _make_capsule(
            "l1", "base",
            concepts=[("concetto A", "introduced")],
            exercises=["Esercizio su concetto A"],
        )
        l2 = _make_capsule(
            "l2", "avanzato",
            concepts=[("concetto A", "reinforced"), ("concetto B", "introduced")],
            exercises=["Esercizio su concetto A avanzato", "Esercizio B"],
        )
        from lessonos.graph.path_memory import build_path_memory
        from lessonos.graph.didactic_delta import compute_didactic_delta

        pm = build_path_memory([l1, l2], path_title="Test")
        # Same data, separate objects: no changes expected
        same_pm = build_path_memory([l1, l2], path_title="Test")
        delta = compute_didactic_delta(pm, same_pm)
        return delta

    def expected(result):
        from lessonos.graph.didactic_delta import DidacticDelta
        if not isinstance(result, DidacticDelta):
            return False
        delta: DidacticDelta = result
        return (
            delta.total_new_concepts == 0
            and delta.total_clarified == 0
            and delta.total_still_open == 0
            and delta.total_over_repeated == 0
            and delta.total_under_practiced == 0
            and delta.total_new_misconceptions == 0
            and delta.total_resolved_misconceptions == 0
        )

    return EvalCase(
        name="didactic_delta_no_change",
        description="Identical old/new PathMemory yields empty delta (no changes).",
        run=run,
        expected=expected,
        categories=("didactic_delta",),
    )


# ---------------------------------------------------------------------------
# Case: DidacticDelta detects clarified concept (M5 — didactic_delta)
# ---------------------------------------------------------------------------


def case_didactic_delta_concept_clarified() -> EvalCase:
    """Concept moving from \"problematic\" to non-problematic is detected as clarified."""

    def run():
        l1 = _make_capsule(
            "l1", "base",
            concepts=[("concetto A", "introduced"), ("dubbio", "problematic")],
            questions=["Non capisco concetto A"],
        )
        l2 = _make_capsule(
            "l2", "chiarimento",
            concepts=[("concetto A", "reinforced"), ("dubbio", "reviewed")],
        )
        from lessonos.graph.path_memory import build_path_memory
        from lessonos.graph.didactic_delta import compute_didactic_delta

        old_pm = build_path_memory([l1], path_title="Test")
        new_pm = build_path_memory([l1, l2], path_title="Test")
        delta = compute_didactic_delta(old_pm, new_pm)
        return delta

    def expected(result):
        from lessonos.graph.didactic_delta import DidacticDelta
        if not isinstance(result, DidacticDelta):
            return False
        delta: DidacticDelta = result
        clar_names = {c.name for c in delta.clarified_concepts}
        return (
            "dubbio" in clar_names
            and len(clar_names) == 1
            and delta.total_clarified == 1
        )

    return EvalCase(
        name="didactic_delta_concept_clarified",
        description="Concept 'dubbio' moving from problematic to reviewed is clarified.",
        run=run,
        expected=expected,
        categories=("didactic_delta",),
    )


# ---------------------------------------------------------------------------
# Case: LearningDebt detects over_repeated debt (M5 — learning_debt)
# ---------------------------------------------------------------------------


def case_learning_debt_over_repeated() -> EvalCase:
    """Over-repeated concept (3+ lessons) generates over_repeated debt item."""

    def run():
        l1 = _make_capsule(
            "l1", "L1",
            concepts=[("ripetuto", "introduced")],
        )
        l2 = _make_capsule(
            "l2", "L2",
            concepts=[("ripetuto", "reinforced")],
        )
        l3 = _make_capsule(
            "l3", "L3",
            concepts=[("ripetuto", "reinforced")],
        )
        from lessonos.graph.path_memory import build_path_memory
        from lessonos.graph.didactic_delta import compute_didactic_delta
        from lessonos.graph.learning_debt import compute_learning_debt

        old_pm = build_path_memory([l1, l2], path_title="Test")
        new_pm = build_path_memory([l1, l2, l3], path_title="Test")
        delta = compute_didactic_delta(old_pm, new_pm)
        ledger = compute_learning_debt(new_pm, delta, path_id="test_p")
        return ledger

    def expected(result):
        from lessonos.graph.learning_debt import LearningDebtLedger
        if not isinstance(result, LearningDebtLedger):
            return False
        ledger: LearningDebtLedger = result
        over_repeated = [i for i in ledger.items if i.kind == "over_repeated"]
        return (
            len(over_repeated) >= 1
            and ledger.by_kind.get("over_repeated", 0) >= 1
        )

    return EvalCase(
        name="learning_debt_over_repeated",
        description="Concept in 3+ lessons flagged as over_repeated debt.",
        run=run,
        expected=expected,
        categories=("learning_debt",),
    )


# ---------------------------------------------------------------------------
# Case: Cost Ledger report with mock entries (M5 — cost_ledger)
# ---------------------------------------------------------------------------


def case_cost_ledger_report_basic() -> EvalCase:
    """CostLedger produces a correct basic report from mock entries."""

    def run():
        from lessonos.llm.cost_ledger import CostLedger
        from lessonos.llm.router import LLMResponse
        from lessonos.models.ledger import CostLedgerEntry

        ledger = CostLedger()

        # Mock response (no usage) — free
        mock_resp = LLMResponse(text="segments", model="mock-model", provider="mock")
        ledger.add_from_response(mock_resp, lesson_id="l1", label="segmentation")

        # Add a pre-built entry directly
        ledger.add_entry(CostLedgerEntry(
            entry_id="cl:0001",
            lesson_id="l1",
            model="kimi-k2.5",
            provider="kimi",
            prompt_tokens=500,
            completion_tokens=100,
            cost_usd=0.0006,
            label="extraction",
        ))

        report = ledger.report()
        return report

    def expected(result):
        from lessonos.models.ledger import CostReport
        if not isinstance(result, CostReport):
            return False
        r: CostReport = result
        return (
            r.total_calls == 2
            and r.total_cost_usd == 0.0006  # Only the kimi entry costs
            and r.total_prompt_tokens == 500
            and r.total_completion_tokens == 100
            and r.per_lesson.get("l1", 0) == 0.0006
            and r.per_model.get("mock-model", 0) == 0.0
            and r.per_model.get("kimi-k2.5", 0) == 0.0006
            and len(r.entries) == 2
        )

    return EvalCase(
        name="cost_ledger_report_basic",
        description="CostLedger report aggregates mock entries correctly.",
        run=run,
        expected=expected,
        categories=("cost_ledger",),
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
    case_capsule_persists_and_reloads(),
    case_graph_cross_lesson_connects_prerequisites(),
    case_graph_queries_by_concept(),
    case_next_lesson_planner_prioritizes_gaps(),
    # M5 expansion: 10 new cases
    case_extraction_valid_full_content(),
    case_extraction_rejects_invalid_status(),
    case_assembly_rejects_no_segments(),
    case_path_memory_single_capsule(),
    case_path_memory_empty_list(),
    case_path_memory_case_insensitive_merge(),
    case_didactic_delta_no_change(),
    case_didactic_delta_concept_clarified(),
    case_learning_debt_over_repeated(),
    case_cost_ledger_report_basic(),
]
