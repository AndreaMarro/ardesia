"""Transcript-segment persistence + ingest (M2-task1).

Segments are the grounding anchor: a Lesson Capsule citation is only valid if
its seg_id resolves to a persisted Segment. These tests load the REAL fixture,
re-read from the store, and assert grounding-by-construction (no dangling
timeline references, text copied verbatim).
"""

from __future__ import annotations

import json

from lessonos.models.entities import Segment
from lessonos.store.fixture_loader import (
    DEFAULT_FIXTURE_ROOT,
    ingest_lesson_segments,
)
from lessonos.store.sqlite import SQLiteStore

L1 = "l1_derivative_definition"


def _lesson_json(lesson_id: str) -> dict:
    return json.loads(
        (DEFAULT_FIXTURE_ROOT / "lessons" / f"{lesson_id}.json").read_text()
    )


def test_segment_round_trip() -> None:
    store = SQLiteStore()
    seg = Segment(
        seg_id="s1", lesson_id="lx", start=0, end=45, text="hello world"
    )
    store.save_segment(seg)
    got = store.get_segment("s1")
    assert got == seg
    assert got.text == "hello world"
    store.close()


def test_get_segment_missing_returns_none() -> None:
    store = SQLiteStore()
    assert store.get_segment("nope") is None
    store.close()


def test_segments_for_lesson_ordered_by_start_despite_shuffled_insert() -> None:
    store = SQLiteStore()
    # Insert out of order: order must come from `start`, not insertion luck.
    store.save_segment(Segment("b", "lx", 100, 150, "second"))
    store.save_segment(Segment("a", "lx", 0, 50, "first"))
    store.save_segment(Segment("c", "lx", 150, 200, "third"))
    starts = [s.start for s in store.segments_for_lesson("lx")]
    assert starts == [0, 100, 150]
    store.close()


def test_ingest_persists_fixture_transcript_verbatim() -> None:
    store = SQLiteStore()
    returned = ingest_lesson_segments(store, L1)

    data = _lesson_json(L1)
    expected = data["transcript"]
    assert len(returned) == len(expected)

    # Re-read from the store (prove it persisted, not just returned).
    persisted = store.segments_for_lesson(data["lesson_id"])
    assert [s.seg_id for s in persisted] == [s["seg_id"] for s in expected]

    by_id = {s.seg_id: s for s in persisted}
    for raw in expected:
        seg = by_id[raw["seg_id"]]
        assert seg.lesson_id == data["lesson_id"]
        assert seg.start == raw["start"]
        assert seg.end == raw["end"]
        # Verbatim: text must equal the fixture exactly (no paraphrase).
        assert seg.text == raw["text"]
        assert seg.start < seg.end
    store.close()


def test_timeline_events_are_grounded_in_persisted_segments() -> None:
    """Every timeline_event seg_id must resolve to an ingested segment.

    This is the groundedness-by-construction guarantee the capsule pipeline
    relies on: citations point at real transcript anchors, never invented ones.
    """
    store = SQLiteStore()
    data = _lesson_json(L1)
    ingest_lesson_segments(store, L1)

    referenced = [
        ev["seg_id"] for ev in data["timeline_events"] if ev.get("seg_id")
    ]
    assert referenced  # the fixture actually references segments
    for seg_id in referenced:
        assert store.get_segment(seg_id) is not None, (
            f"dangling timeline reference: {seg_id}"
        )
    store.close()
