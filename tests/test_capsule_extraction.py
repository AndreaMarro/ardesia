"""Content extraction via the LLM router (M2-task3).

The router extracts concepts/exercises/questions/homework from transcript segments;
the engine VALIDATES every Citation.seg_id against persisted segments (PLAN §13.4:
no invented citations). Tests use the deterministic MockProvider keyed on the
exact extraction prompt, ingest the REAL fixture, and assert grounding — including
refusal of fabricated citations and validation of concept status.
"""

from __future__ import annotations

import json

import pytest

from lessonos.capsule.extraction import (
    Citation,
    ConceptExtraction,
    ExerciseExtraction,
    HomeworkExtraction,
    QuestionExtraction,
    build_extraction_prompt,
    extract_lesson_content,
)
from lessonos.llm.router import MockProvider, Router
from lessonos.store.fixture_loader import ingest_lesson_segments
from lessonos.store.sqlite import SQLiteStore

L1 = "l1_derivative_definition"


def _router_returning(prompt: str, payload) -> Router:
    """Mock router that returns ``payload`` (JSON) for exactly ``prompt``."""
    router = Router()
    router.register(MockProvider({prompt: json.dumps(payload)}))
    return router


def test_extracts_concepts_with_valid_status_and_grounded_citations() -> None:
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)  # l1s1, l1s2, l1s3
    prompt = build_extraction_prompt(store.segments_for_lesson(L1))
    payload = {
        "concepts": [
            {
                "name": "derivata",
                "status": "introduced",
                "prerequisites": ["limite"],
                "citations": [{"seg_id": "l1s1"}, {"seg_id": "l1s3"}],
            },
            {
                "name": "rapporto incrementale",
                "status": "reinforced",
                "citations": [{"seg_id": "l1s2", "confidence": 0.95}],
            },
        ],
        "exercises": [],
        "student_questions": [],
        "homework": [],
    }
    router = _router_returning(prompt, payload)

    content = extract_lesson_content(store, L1, router)

    assert len(content.concepts) == 2
    assert content.concepts[0].name == "derivata"
    assert content.concepts[0].status == "introduced"
    assert content.concepts[0].prerequisites == ("limite",)
    assert len(content.concepts[0].citations) == 2
    assert content.concepts[0].citations[0].seg_id == "l1s1"
    assert content.concepts[1].name == "rapporto incrementale"
    assert content.concepts[1].status == "reinforced"
    assert content.concepts[1].citations[0].confidence == 0.95
    assert content.lesson_id == L1
    store.close()


def test_extracts_exercises_and_homework_with_citations() -> None:
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_extraction_prompt(store.segments_for_lesson(L1))
    payload = {
        "concepts": [],
        "exercises": [
            {
                "prompt": "Calcola la derivata di x^2",
                "solution": "2x",
                "citations": [{"seg_id": "l1s3", "excerpt": "derivata f'(x)"}],
            }
        ],
        "student_questions": [
            {
                "question": "Cosa succede se h=0?",
                "citations": [{"seg_id": "l1s2"}],
            }
        ],
        "homework": [
            {
                "task": "Esercizi 1-5 pag. 42",
                "citations": [{"seg_id": "l1s3"}],
            }
        ],
    }
    router = _router_returning(prompt, payload)

    content = extract_lesson_content(store, L1, router)

    assert len(content.exercises) == 1
    assert content.exercises[0].prompt == "Calcola la derivata di x^2"
    assert content.exercises[0].solution == "2x"
    assert content.exercises[0].citations[0].seg_id == "l1s3"
    assert content.exercises[0].citations[0].excerpt == "derivata f'(x)"
    assert len(content.student_questions) == 1
    assert content.student_questions[0].question == "Cosa succede se h=0?"
    assert content.student_questions[0].citations[0].seg_id == "l1s2"
    assert len(content.homework) == 1
    assert content.homework[0].task == "Esercizi 1-5 pag. 42"
    assert content.homework[0].citations[0].seg_id == "l1s3"
    store.close()


def test_fabricated_citation_is_refused() -> None:
    """A seg_id not among persisted segments must raise (no invented cites)."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_extraction_prompt(store.segments_for_lesson(L1))
    payload = {
        "concepts": [
            {
                "name": "ghost",
                "status": "introduced",
                "citations": [{"seg_id": "l1s99"}],
            }
        ],
        "exercises": [],
        "student_questions": [],
        "homework": [],
    }
    router = _router_returning(prompt, payload)

    with pytest.raises(ValueError, match="l1s99"):
        extract_lesson_content(store, L1, router)
    store.close()


def test_invalid_concept_status_is_refused() -> None:
    """Concept status must be in CONCEPT_STATUS vocabulary."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_extraction_prompt(store.segments_for_lesson(L1))
    payload = {
        "concepts": [
            {
                "name": "test",
                "status": "invalid_status",
                "citations": [{"seg_id": "l1s1"}],
            }
        ],
        "exercises": [],
        "student_questions": [],
        "homework": [],
    }
    router = _router_returning(prompt, payload)

    with pytest.raises(ValueError, match="invalid concept status"):
        extract_lesson_content(store, L1, router)
    store.close()


def test_concept_missing_name_is_refused() -> None:
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_extraction_prompt(store.segments_for_lesson(L1))
    payload = {
        "concepts": [{"status": "introduced", "citations": [{"seg_id": "l1s1"}]}],
        "exercises": [],
        "student_questions": [],
        "homework": [],
    }
    router = _router_returning(prompt, payload)

    with pytest.raises(ValueError, match="concept missing name"):
        extract_lesson_content(store, L1, router)
    store.close()


def test_concept_missing_status_is_refused() -> None:
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_extraction_prompt(store.segments_for_lesson(L1))
    payload = {
        "concepts": [{"name": "test", "citations": [{"seg_id": "l1s1"}]}],
        "exercises": [],
        "student_questions": [],
        "homework": [],
    }
    router = _router_returning(prompt, payload)

    with pytest.raises(ValueError, match="concept missing status"):
        extract_lesson_content(store, L1, router)
    store.close()


def test_exercise_missing_prompt_is_refused() -> None:
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_extraction_prompt(store.segments_for_lesson(L1))
    payload = {
        "concepts": [],
        "exercises": [{"solution": "test", "citations": [{"seg_id": "l1s1"}]}],
        "student_questions": [],
        "homework": [],
    }
    router = _router_returning(prompt, payload)

    with pytest.raises(ValueError, match="exercise missing prompt"):
        extract_lesson_content(store, L1, router)
    store.close()


def test_citation_missing_seg_id_is_refused() -> None:
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_extraction_prompt(store.segments_for_lesson(L1))
    payload = {
        "concepts": [
            {
                "name": "test",
                "status": "introduced",
                "citations": [{"excerpt": "no seg_id"}],
            }
        ],
        "exercises": [],
        "student_questions": [],
        "homework": [],
    }
    router = _router_returning(prompt, payload)

    with pytest.raises(ValueError, match="citation missing seg_id"):
        extract_lesson_content(store, L1, router)
    store.close()


def test_no_segments_ingested_raises() -> None:
    store = SQLiteStore()
    router = Router()
    router.register(MockProvider({}))
    with pytest.raises(ValueError, match="no segments persisted"):
        extract_lesson_content(store, L1, router)
    store.close()


def test_prompt_lists_only_persisted_seg_ids() -> None:
    """The prompt must surface exactly the ingested seg_ids and the status
    vocabulary (LLM can't cite what it wasn't shown)."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_extraction_prompt(store.segments_for_lesson(L1))
    for seg in store.segments_for_lesson(L1):
        assert f"[{seg.seg_id}]" in prompt
        assert seg.text in prompt
    # The prompt must list the valid status values.
    assert "introduced" in prompt
    assert "reinforced" in prompt
    assert "reviewed" in prompt
    assert "problematic" in prompt
    store.close()


def test_concept_extraction_dataclass_validates_status() -> None:
    """ConceptExtraction.__post_init__ validates status ∈ CONCEPT_STATUS."""
    with pytest.raises(ValueError, match="invalid concept status"):
        ConceptExtraction(name="test", status="bad_status")


def test_citation_dataclass_immutable() -> None:
    """Citation is frozen."""
    cite = Citation(seg_id="l1s1", excerpt="test")
    with pytest.raises(Exception):  # FrozenInstanceError
        cite.seg_id = "l1s2"  # type: ignore
