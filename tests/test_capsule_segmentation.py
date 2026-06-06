"""Topic segmentation via the LLM router (M2-task2).

The router groups transcript segments into topics; the engine then VALIDATES
every cited seg_id against the persisted segments (PLAN §13.4: no invented
citations) and DERIVES start/end from the real segments. Tests use the
deterministic MockProvider keyed on the exact segmentation prompt, ingest the
REAL fixture, and assert grounding — including refusal of a fabricated citation.
"""

from __future__ import annotations

import json

import pytest

from lessonos.capsule.segmentation import (
    build_segmentation_prompt,
    segment_lesson_topics,
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


def test_segments_grouped_into_topics_with_derived_extent() -> None:
    store = SQLiteStore()
    segs = ingest_lesson_segments(store, L1)  # l1s1[0,45] l1s2[45,110] l1s3[110,175]
    prompt = build_segmentation_prompt(store.segments_for_lesson(L1))
    payload = [
        {"topic": "definizione", "seg_ids": ["l1s1", "l1s2"]},
        {"topic": "limite", "seg_ids": ["l1s3"]},
    ]
    router = _router_returning(prompt, payload)

    spans = segment_lesson_topics(store, L1, router)

    assert [s.topic for s in spans] == ["definizione", "limite"]
    assert spans[0].seg_ids == ("l1s1", "l1s2")
    # start/end derived from the REAL persisted segments, not the model.
    by_id = {s.seg_id: s for s in segs}
    assert spans[0].start == by_id["l1s1"].start  # 0
    assert spans[0].end == by_id["l1s2"].end  # 110
    assert spans[1].start == by_id["l1s3"].start  # 110
    assert spans[1].end == by_id["l1s3"].end  # 175
    assert all(s.lesson_id == L1 for s in spans)
    store.close()


def test_fabricated_citation_is_refused() -> None:
    """A seg_id not among the persisted segments must raise (no invented cites)."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_segmentation_prompt(store.segments_for_lesson(L1))
    payload = [{"topic": "ghost", "seg_ids": ["l1s1", "l1s99"]}]
    router = _router_returning(prompt, payload)

    with pytest.raises(ValueError, match="l1s99"):
        segment_lesson_topics(store, L1, router)
    store.close()


def test_topic_without_citations_is_refused() -> None:
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_segmentation_prompt(store.segments_for_lesson(L1))
    router = _router_returning(prompt, [{"topic": "empty", "seg_ids": []}])

    with pytest.raises(ValueError, match="cites no segments"):
        segment_lesson_topics(store, L1, router)
    store.close()


def test_topic_missing_label_is_refused() -> None:
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_segmentation_prompt(store.segments_for_lesson(L1))
    router = _router_returning(prompt, [{"seg_ids": ["l1s1"]}])

    with pytest.raises(ValueError, match="missing label"):
        segment_lesson_topics(store, L1, router)
    store.close()


def test_no_segments_ingested_raises() -> None:
    store = SQLiteStore()
    router = Router()
    router.register(MockProvider({}))
    with pytest.raises(ValueError, match="no segments persisted"):
        segment_lesson_topics(store, L1, router)
    store.close()


def test_prompt_lists_only_persisted_seg_ids() -> None:
    """The prompt must surface exactly the ingested seg_ids (LLM can't cite
    anything it wasn't shown)."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    prompt = build_segmentation_prompt(store.segments_for_lesson(L1))
    for seg in store.segments_for_lesson(L1):
        assert f"[{seg.seg_id}]" in prompt
        assert seg.text in prompt
    store.close()
