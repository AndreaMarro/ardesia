"""Assembly of a complete Lesson Capsule (M2-task4).

The assembler composes the outputs of segmentation and extraction into a single
LessonCapsule. Grounding is enforced by the sub-steps (segmentation + extraction);
the assembler itself does not introduce new citations. Tests use the deterministic
MockProvider keyed on the exact prompts, ingest the REAL fixture, and assert
composition + error propagation.
"""

from __future__ import annotations

import json

import pytest

from lessonos.capsule.assembly import LessonCapsule, assemble_lesson_capsule
from lessonos.capsule.extraction import build_extraction_prompt
from lessonos.capsule.segmentation import build_segmentation_prompt
from lessonos.llm.router import MockProvider, Router
from lessonos.store.fixture_loader import ingest_lesson_segments
from lessonos.store.sqlite import SQLiteStore

L1 = "l1_derivative_definition"


def _router_for_both(
    seg_prompt: str,
    seg_payload,
    ext_prompt: str,
    ext_payload,
) -> Router:
    """Mock router that returns segmentation payload for ``seg_prompt`` and
    extraction payload for ``ext_prompt``."""
    router = Router()
    router.register(
        MockProvider(
            {
                seg_prompt: json.dumps(seg_payload),
                ext_prompt: json.dumps(ext_payload),
            }
        )
    )
    return router


def test_assembles_full_capsule_with_timeline_and_content() -> None:
    store = SQLiteStore()
    segs = ingest_lesson_segments(store, L1)  # l1s1, l1s2, l1s3
    seg_prompt = build_segmentation_prompt(store.segments_for_lesson(L1))
    ext_prompt = build_extraction_prompt(store.segments_for_lesson(L1))

    seg_payload = [
        {"topic": "definizione", "seg_ids": ["l1s1", "l1s2"]},
        {"topic": "limite", "seg_ids": ["l1s3"]},
    ]
    ext_payload = {
        "concepts": [
            {
                "name": "derivata",
                "status": "introduced",
                "citations": [{"seg_id": "l1s1"}],
            }
        ],
        "exercises": [
            {
                "prompt": "Calcola f'(x) per f(x)=x^2",
                "citations": [{"seg_id": "l1s3"}],
            }
        ],
        "student_questions": [
            {"question": "Cosa succede se h=0?", "citations": [{"seg_id": "l1s2"}]}
        ],
        "homework": [
            {"task": "Esercizi 1-3", "citations": [{"seg_id": "l1s3"}]}
        ],
    }
    router = _router_for_both(seg_prompt, seg_payload, ext_prompt, ext_payload)

    capsule = assemble_lesson_capsule(store, L1, router)

    assert isinstance(capsule, LessonCapsule)
    assert capsule.lesson_id == L1
    assert len(capsule.timeline) == 2
    assert capsule.timeline[0].topic == "definizione"
    assert capsule.timeline[0].seg_ids == ("l1s1", "l1s2")
    assert len(capsule.content.concepts) == 1
    assert capsule.content.concepts[0].name == "derivata"
    assert len(capsule.content.exercises) == 1
    assert capsule.content.exercises[0].prompt == "Calcola f'(x) per f(x)=x^2"
    assert len(capsule.content.student_questions) == 1
    assert capsule.content.student_questions[0].question == "Cosa succede se h=0?"
    assert len(capsule.content.homework) == 1
    assert capsule.content.homework[0].task == "Esercizi 1-3"

    # Grounding: every cited seg_id in the assembled capsule resolves to a
    # persisted segment (no dangling references).
    by_id = {s.seg_id: s for s in segs}
    for span in capsule.timeline:
        for sid in span.seg_ids:
            assert sid in by_id, f"timeline cites unknown seg_id {sid!r}"
    for concept in capsule.content.concepts:
        for c in concept.citations:
            assert c.seg_id in by_id, f"concept cites unknown seg_id {c.seg_id!r}"
    for ex in capsule.content.exercises:
        for c in ex.citations:
            assert c.seg_id in by_id, f"exercise cites unknown seg_id {c.seg_id!r}"
    for q in capsule.content.student_questions:
        for c in q.citations:
            assert c.seg_id in by_id, f"question cites unknown seg_id {c.seg_id!r}"
    for h in capsule.content.homework:
        for c in h.citations:
            assert c.seg_id in by_id, f"homework cites unknown seg_id {c.seg_id!r}"

    store.close()


def test_propagates_segmentation_grounding_error() -> None:
    """A fabricated seg_id in segmentation must bubble up through assemble."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    seg_prompt = build_segmentation_prompt(store.segments_for_lesson(L1))
    ext_prompt = build_extraction_prompt(store.segments_for_lesson(L1))

    seg_payload = [{"topic": "ghost", "seg_ids": ["l1s99"]}]
    ext_payload = {"concepts": [], "exercises": [], "student_questions": [], "homework": []}
    router = _router_for_both(seg_prompt, seg_payload, ext_prompt, ext_payload)

    with pytest.raises(ValueError, match="l1s99"):
        assemble_lesson_capsule(store, L1, router)
    store.close()


def test_propagates_extraction_grounding_error() -> None:
    """A fabricated seg_id in extraction must bubble up through assemble."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    seg_prompt = build_segmentation_prompt(store.segments_for_lesson(L1))
    ext_prompt = build_extraction_prompt(store.segments_for_lesson(L1))

    seg_payload = [{"topic": "ok", "seg_ids": ["l1s1"]}]
    ext_payload = {
        "concepts": [
            {"name": "ghost", "status": "introduced", "citations": [{"seg_id": "l1s99"}]}
        ],
        "exercises": [],
        "student_questions": [],
        "homework": [],
    }
    router = _router_for_both(seg_prompt, seg_payload, ext_prompt, ext_payload)

    with pytest.raises(ValueError, match="l1s99"):
        assemble_lesson_capsule(store, L1, router)
    store.close()


# Map payload keys (used in ext_payload dict) to LessonContent attribute names.
# Extraction uses plural keys; attributes are also plural.
_ITEM_SPECS = [
    ("concepts", lambda good, bad: {
        "name": "p1", "status": "introduced",
        "citations": [{"seg_id": bad}, {"seg_id": good}],
    }),
    ("exercises", lambda good, bad: {
        "prompt": "do this",
        "citations": [{"seg_id": bad}, {"seg_id": good}],
    }),
    ("student_questions", lambda good, bad: {
        "question": "why?",
        "citations": [{"seg_id": bad}, {"seg_id": good}],
    }),
    ("homework", lambda good, bad: {
        "task": "read p.3",
        "citations": [{"seg_id": bad}, {"seg_id": good}],
    }),
]


@pytest.mark.parametrize("item_key,item_maker", _ITEM_SPECS, ids=[s[0] for s in _ITEM_SPECS])
def test_defensive_drops_bad_citation_per_item_type(
    item_key: str, item_maker,
) -> None:
    """FM4: defensive=True drops a fabricated-seg_id citation from EVERY item
    type (concept, exercise, student_question, homework), keeping the item
    without the bad citation and recording the drop.

    Non-tautological: the extraction payload carries one valid seg_id (l1s1)
    and one fabricated seg_id (l1s99); only the real seg_id survives.
    """
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    seg_prompt = build_segmentation_prompt(store.segments_for_lesson(L1))
    ext_prompt = build_extraction_prompt(store.segments_for_lesson(L1))

    seg_payload = [{"topic": "ok", "seg_ids": ["l1s1"]}]
    item = item_maker("l1s1", "l1s99")
    ext_payload: dict = {"concepts": [], "exercises": [], "student_questions": [], "homework": []}
    ext_payload[item_key] = [item]

    router = _router_for_both(seg_prompt, seg_payload, ext_prompt, ext_payload)
    capsule = assemble_lesson_capsule(store, L1, router, defensive=True)

    items = getattr(capsule.content, item_key)
    assert len(items) == 1, f"expected 1 {item_key}, got {len(items)}"
    seg_ids = [c.seg_id for c in items[0].citations]
    assert seg_ids == ["l1s1"], f"{item_key}: bad seg_id survived: {seg_ids}"
    assert capsule.dropped, f"{item_key}: expected non-empty dropped list"
    assert any(
        isinstance(d, str) and "l1s99" in d for d in capsule.dropped
    ), f"{item_key}: dropped list should mention l1s99: {capsule.dropped}"
    store.close()


def test_defensive_drops_bad_citation_and_none_field() -> None:
    """FM4: defensive=True drops a fabricated-seg_id citation and a None-field
    item (instead of crashing), keeping valid items and recording drops.

    Non-tautological: the SAME extraction payload carries (a) a concept whose
    only citation cites a fabricated seg_id, (b) a concept with ``name=None``,
    and (c) a fully valid concept. The capsule must keep (a) WITHOUT the bad
    citation, keep (c), DROP (b), and expose a non-empty ``dropped`` list.
    """
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    seg_prompt = build_segmentation_prompt(store.segments_for_lesson(L1))
    ext_prompt = build_extraction_prompt(store.segments_for_lesson(L1))

    seg_payload = [{"topic": "ok", "seg_ids": ["l1s1"]}]
    ext_payload = {
        "concepts": [
            # (a) fabricated citation seg_id -> citation dropped, concept kept
            {
                "name": "kept_with_bad_cite",
                "status": "introduced",
                "citations": [{"seg_id": "l1s99"}, {"seg_id": "l1s1"}],
            },
            # (b) None required field -> whole concept dropped
            {"name": None, "status": "introduced", "citations": []},
            # (c) fully valid concept -> kept
            {
                "name": "valid",
                "status": "introduced",
                "citations": [{"seg_id": "l1s2"}],
            },
        ],
        "exercises": [],
        "student_questions": [],
        "homework": [],
    }
    router = _router_for_both(seg_prompt, seg_payload, ext_prompt, ext_payload)

    capsule = assemble_lesson_capsule(store, L1, router, defensive=True)

    names = [c.name for c in capsule.content.concepts]
    assert names == ["kept_with_bad_cite", "valid"]

    # (a) kept concept lost its fabricated citation, kept the valid one.
    bad = capsule.content.concepts[0]
    assert [c.seg_id for c in bad.citations] == ["l1s1"]
    assert all(c.seg_id != "l1s99" for c in bad.citations)

    # dropped list is non-empty and records both the bad citation and concept.
    assert capsule.dropped, "expected non-empty dropped list"
    assert any(isinstance(d, str) and "l1s99" in d for d in capsule.dropped)
    assert any(isinstance(d, str) and "concept dropped" in d for d in capsule.dropped)

    # Zero-allucinazione: every surviving citation resolves to a real segment.
    by_id = {s.seg_id for s in store.segments_for_lesson(L1)}
    for concept in capsule.content.concepts:
        for c in concept.citations:
            assert c.seg_id in by_id
    store.close()


def test_defensive_false_still_raises_on_bad_seg_id() -> None:
    """Default (strict) assembly still propagates fabricated seg_ids."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    seg_prompt = build_segmentation_prompt(store.segments_for_lesson(L1))
    ext_prompt = build_extraction_prompt(store.segments_for_lesson(L1))

    seg_payload = [{"topic": "ok", "seg_ids": ["l1s1"]}]
    ext_payload = {
        "concepts": [
            {"name": "ghost", "status": "introduced", "citations": [{"seg_id": "l1s99"}]}
        ],
        "exercises": [],
        "student_questions": [],
        "homework": [],
    }
    router = _router_for_both(seg_prompt, seg_payload, ext_prompt, ext_payload)

    with pytest.raises(ValueError, match="l1s99"):
        assemble_lesson_capsule(store, L1, router)  # defensive defaults False
    store.close()


def test_no_segments_ingested_raises() -> None:
    store = SQLiteStore()
    router = Router()
    router.register(MockProvider({}))
    with pytest.raises(ValueError, match="no segments persisted"):
        assemble_lesson_capsule(store, L1, router)
    store.close()


def test_capsule_is_frozen() -> None:
    """LessonCapsule is immutable."""
    capsule = LessonCapsule(
        lesson_id="l1",
        timeline=(),
        content=__import__("lessonos.capsule.extraction", fromlist=["LessonContent"]).LessonContent(lesson_id="l1"),
    )
    with pytest.raises(Exception):  # FrozenInstanceError
        capsule.lesson_id = "l2"  # type: ignore
