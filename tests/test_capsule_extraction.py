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
    _repair_excerpt,
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


def test_invalid_concept_status_message_is_well_formed() -> None:
    """The validation error must render with balanced parentheses.

    Regression guard: the '(expected one of ...)' hint had a missing closing
    paren, unlike the five sibling validators (entities.py, atoms.py). Assert
    structure, not wording, so the test survives copy changes.
    """
    with pytest.raises(ValueError) as exc:
        ConceptExtraction(name="Derivata", status="bogus")
    msg = str(exc.value)
    assert msg.count("(") == msg.count(")")
    assert "expected one of" in msg
    assert msg.rstrip().endswith(")")


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


# --- FM1 excerpt-guard tests ------------------------------------------------


def test_excerpt_verbatim_unchanged() -> None:
    """A verbatim substring excerpt must pass through unchanged (no repair)."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_extraction_prompt(store.segments_for_lesson(L1))
    payload = {
        "concepts": [{
            "name": "derivata",
            "status": "introduced",
            "citations": [{"seg_id": "l1s3", "excerpt": "la derivata f'(x)"}],
        }],
        "exercises": [],
        "student_questions": [],
        "homework": [],
    }
    router = _router_returning(prompt, payload)
    content = extract_lesson_content(store, L1, router)
    cite = content.concepts[0].citations[0]
    assert cite.excerpt == "la derivata f'(x)"
    assert cite.excerpt_repaired is False
    store.close()


def test_paraphrased_excerpt_is_repaired() -> None:
    """A paraphrased excerpt (words present, rephrased) must be auto-repaired.

    The original excerpt 'derivative f prime' is not a verbatim substring of
    segment l1s3 ('Quando il limite esiste, il suo valore e la derivata f'(x)
    nel punto x.'), but words match — the guard should snap to a real substring.
    """
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_extraction_prompt(store.segments_for_lesson(L1))
    payload = {
        "concepts": [{
            "name": "derivata",
            "status": "introduced",
            "citations": [{"seg_id": "l1s3", "excerpt": "derivative f prime"}],
        }],
        "exercises": [],
        "student_questions": [],
        "homework": [],
    }
    router = _router_returning(prompt, payload)

    content = extract_lesson_content(store, L1, router)
    cite = content.concepts[0].citations[0]

    # The excerpt should have been repaired — it's different from original
    assert cite.excerpt_repaired is True
    assert cite.excerpt != "derivative f prime"  # Must have been modified
    # The repaired excerpt must be a verbatim substring of the segment text
    seg = store.get_segment("l1s3")
    assert seg is not None
    assert cite.excerpt is None or cite.excerpt in seg.text
    store.close()


def test_completely_invented_excerpt_is_dropped() -> None:
    """An excerpt with no words matching the segment must be dropped (excerpt=None)."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_extraction_prompt(store.segments_for_lesson(L1))
    payload = {
        "concepts": [{
            "name": "derivata",
            "status": "introduced",
            "citations": [{
                "seg_id": "l1s3",
                "excerpt": "quantum mechanics wave function collapse",
            }],
        }],
        "exercises": [],
        "student_questions": [],
        "homework": [],
    }
    router = _router_returning(prompt, payload)

    content = extract_lesson_content(store, L1, router)
    cite = content.concepts[0].citations[0]

    assert cite.excerpt_repaired is True
    assert cite.excerpt is None
    store.close()


def test_paraphrased_excerpt_partial_match_keeps_valid_part() -> None:
    """A paraphrased excerpt that partially overlaps should snap to a real substring.

    'derivata funzione' — 'derivata' appears in l1s3 text but 'funzione' does not.
    The guard should repair to 'derivata' (at least 1 matching word).
    """
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_extraction_prompt(store.segments_for_lesson(L1))
    payload = {
        "concepts": [{
            "name": "derivata",
            "status": "introduced",
            "citations": [{"seg_id": "l1s3", "excerpt": "derivata funzione"}],
        }],
        "exercises": [],
        "student_questions": [],
        "homework": [],
    }
    router = _router_returning(prompt, payload)

    content = extract_lesson_content(store, L1, router)
    cite = content.concepts[0].citations[0]

    assert cite.excerpt_repaired is True
    assert cite.excerpt is not None
    seg = store.get_segment("l1s3")
    assert seg is not None
    assert cite.excerpt in seg.text
    store.close()


def test_excerpt_from_different_segment_is_repaired() -> None:
    """An excerpt matching a *different* segment's text must be repaired to match
    the *target* segment's text (not accepted as-is on the wrong segment)."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_extraction_prompt(store.segments_for_lesson(L1))
    # l1s1 = "Oggi introduciamo la derivata come velocita istantanea..."
    # l1s3 = "Quando il limite esiste, il suo valore e la derivata f'(x)..."
    # excerpt from l1s1 cited as belonging to l1s3
    payload = {
        "concepts": [{
            "name": "derivata",
            "status": "introduced",
            "citations": [{
                "seg_id": "l1s3",
                "excerpt": "introduciamo la derivata",
            }],
        }],
        "exercises": [],
        "student_questions": [],
        "homework": [],
    }
    router = _router_returning(prompt, payload)

    content = extract_lesson_content(store, L1, router)
    cite = content.concepts[0].citations[0]

    assert cite.excerpt_repaired is True
    assert cite.excerpt is not None
    seg = store.get_segment("l1s3")
    assert seg is not None
    assert cite.excerpt in seg.text
    store.close()


def test_excerpt_repair_applies_to_exercises_too() -> None:
    """The excerpt guard must apply to all citation-bearing entities, not just concepts.

    All excerpts here happen to be verbatim substrings — they should pass through
    unrepaired.
    """
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_extraction_prompt(store.segments_for_lesson(L1))
    payload = {
        "concepts": [],
        "exercises": [{
            "prompt": "Calcola la derivata",
            "citations": [{"seg_id": "l1s3", "excerpt": "la derivata f'(x) nel punto"}],
        }],
        "student_questions": [{
            "question": "Cosa significa?",
            "citations": [{"seg_id": "l1s1", "excerpt": "velocita istantanea di variazione"}],
        }],
        # l1s2 homework uses a verbatim excerpt
        "homework": [{
            "task": "Fai esercizi",
            "citations": [{"seg_id": "l1s2", "excerpt": "rapporto incrementale"}],
        }],
    }
    router = _router_returning(prompt, payload)

    content = extract_lesson_content(store, L1, router)

    # All excerpts are verbatim substrings — should not be repaired
    assert content.exercises[0].citations[0].excerpt_repaired is False
    assert content.student_questions[0].citations[0].excerpt_repaired is False
    assert content.homework[0].citations[0].excerpt_repaired is False
    store.close()


def test_excerpt_repair_functions_independently() -> None:
    """Verify _repair_excerpt directly (unit-level)."""
    text = "Quando il limite esiste, il suo valore e la derivata f'(x) nel punto x."

    # Tier 1: verbatim
    assert _repair_excerpt("la derivata f'(x)", text) == "la derivata f'(x)"  # type: ignore[arg-type]

    # Tier 2: longest common substring (e.g. rearranged word order)
    result = _repair_excerpt("derivata f'(x) la", text)
    assert result is not None  # 'la derivata f'(x)' or 'derivata f'(x)' is in text
    assert result in text

    # Tier 3 (bug-hunt #3): 'DERIVATA quantum' copre solo il 50% dell'excerpt
    # con 1 parola — sotto la regola probatoria (coverage>=60% o >=3 parole+15ch)
    # il frammento NON e' prova: prima tornava 'derivata' e il gate lo contava
    # VERIFIED (porta delle citazioni allucinate). Ora: None.
    result2 = _repair_excerpt("DERIVATA quantum", text)
    assert result2 is None

    # No match at all
    assert _repair_excerpt("quantum mechanics", text) is None

    # Edge: empty
    assert _repair_excerpt("", text) is None
    assert _repair_excerpt("test", "") is None
