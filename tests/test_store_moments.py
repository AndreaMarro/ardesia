"""Timeline-event (Moment) persistence + ingest (M2-task1 part 2).

Moments are the lesson timeline anchored to transcript segments. These tests
load the REAL fixture, re-read from the store, and assert that each ingested
Moment carries the fixture's event_type/time and that its seg_id (when present)
resolves to a persisted Segment — the same grounding guarantee the capsule
pipeline relies on.
"""

from __future__ import annotations

import json

from lessonos.models.entities import Moment
from lessonos.store.fixture_loader import (
    DEFAULT_FIXTURE_ROOT,
    ingest_lesson_moments,
    ingest_lesson_segments,
)
from lessonos.store.sqlite import SQLiteStore

L1 = "l1_derivative_definition"


def _lesson_json(lesson_id: str) -> dict:
    return json.loads(
        (DEFAULT_FIXTURE_ROOT / "lessons" / f"{lesson_id}.json").read_text()
    )


def test_moment_round_trip() -> None:
    store = SQLiteStore()
    m = Moment(
        moment_id="m1", lesson_id="lx", t=50, kind="marker_important", seg_id="s2"
    )
    store.save_moment(m)
    got = store.get_moment("m1")
    assert got == m
    assert got.kind == "marker_important"
    assert got.seg_id == "s2"
    store.close()


def test_moment_round_trip_without_seg_id() -> None:
    store = SQLiteStore()
    m = Moment(moment_id="m2", lesson_id="lx", t=10, kind="lesson_start")
    store.save_moment(m)
    got = store.get_moment("m2")
    assert got == m
    assert got.seg_id is None
    store.close()


def test_get_moment_missing_returns_none() -> None:
    store = SQLiteStore()
    assert store.get_moment("nope") is None
    store.close()


def test_moments_for_lesson_ordered_by_t_despite_shuffled_insert() -> None:
    store = SQLiteStore()
    # Insert out of order: order must come from `t`, not insertion luck.
    store.save_moment(Moment("b", "lx", 100, "marker_important", None))
    store.save_moment(Moment("a", "lx", 0, "transcript_segment", None))
    store.save_moment(Moment("c", "lx", 150, "marker_doubt", None))
    times = [m.t for m in store.moments_for_lesson("lx")]
    assert times == [0, 100, 150]
    store.close()


def test_ingest_persists_fixture_timeline_events() -> None:
    store = SQLiteStore()
    returned = ingest_lesson_moments(store, L1)

    data = _lesson_json(L1)
    expected = data["timeline_events"]
    assert len(returned) == len(expected)

    # Re-read from the store (prove it persisted, not just returned).
    persisted = store.moments_for_lesson(data["lesson_id"])
    assert len(persisted) == len(expected)
    # Fixture timeline is already sorted by t; persisted order matches.
    for moment, raw in zip(persisted, expected):
        assert moment.lesson_id == data["lesson_id"]
        assert moment.t == raw["t"]
        assert moment.kind == raw["event_type"]
        assert moment.seg_id == raw.get("seg_id")
    store.close()


def test_ingest_moments_is_idempotent() -> None:
    store = SQLiteStore()
    ingest_lesson_moments(store, L1)
    ingest_lesson_moments(store, L1)
    data = _lesson_json(L1)
    persisted = store.moments_for_lesson(data["lesson_id"])
    # Positional moment_id → INSERT OR REPLACE, no duplicates on re-ingest.
    assert len(persisted) == len(data["timeline_events"])
    assert len({m.moment_id for m in persisted}) == len(persisted)
    store.close()


def test_ingested_moments_are_grounded_in_persisted_segments() -> None:
    """Every moment seg_id must resolve to an ingested segment.

    Grounding-by-construction: a timeline anchor never points at an invented
    segment. We ingest segments first, then moments, then verify resolution.
    """
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    moments = ingest_lesson_moments(store, L1)

    grounded = [m for m in moments if m.seg_id is not None]
    assert grounded  # the fixture's timeline actually anchors to segments
    for moment in grounded:
        assert store.get_segment(moment.seg_id) is not None, (
            f"dangling moment reference: {moment.seg_id}"
        )
    store.close()
