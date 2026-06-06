"""Structural + referential-integrity checks for the M0 synthetic path fixture.

These are FAKE math lessons (PLAN scope: synthetic data only). The point of the
test is groundedness-by-construction: every timeline event that cites a
transcript segment must point to a segment that actually exists, the declared
source file must be present, and event types must come from the PLAN §14
vocabulary. A dangling reference here would mean the fixture itself fabricates
citations, which we never allow.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

# PLAN §14: timeline_events.event_type vocabulary.
ALLOWED_EVENT_TYPES = {
    "page_created",
    "source_opened",
    "marker_important",
    "marker_doubt",
    "marker_homework",
    "marker_error",
    "exercise_started",
    "question_asked",
    "concept_introduced",
    "transcript_segment",
}

FIXTURE_ROOT = Path(__file__).resolve().parents[1] / "fixtures" / "sample_path"


def _load_path() -> dict:
    return json.loads((FIXTURE_ROOT / "path.json").read_text())


def _load_lessons() -> list[dict]:
    path = _load_path()
    lessons = []
    for lesson_id in path["lessons"]:
        data = json.loads(
            (FIXTURE_ROOT / "lessons" / f"{lesson_id}.json").read_text()
        )
        lessons.append(data)
    return lessons


def test_path_manifest_lists_three_lessons() -> None:
    path = _load_path()
    assert path["subject"] == "matematica"
    assert path["synthetic"] is True
    assert len(path["lessons"]) == 3
    assert len(set(path["lessons"])) == 3  # no duplicate ids


def test_each_lesson_file_loads_and_matches_id() -> None:
    path = _load_path()
    for order, lesson_id in enumerate(path["lessons"], start=1):
        data = json.loads(
            (FIXTURE_ROOT / "lessons" / f"{lesson_id}.json").read_text()
        )
        assert data["lesson_id"] == lesson_id
        assert data["path_id"] == path["path_id"]
        assert data["order"] == order


def test_transcript_segments_unique_and_monotonic() -> None:
    seen: set[str] = set()
    for lesson in _load_lessons():
        segments = lesson["transcript"]
        assert segments, f"empty transcript in {lesson['lesson_id']}"
        prev_end = -1
        for seg in segments:
            assert seg["seg_id"] not in seen, f"duplicate seg_id {seg['seg_id']}"
            seen.add(seg["seg_id"])
            assert seg["start"] < seg["end"]
            assert seg["start"] >= prev_end  # non-overlapping, ordered
            assert seg["text"].strip()
            prev_end = seg["end"]


def test_timeline_event_types_are_known() -> None:
    for lesson in _load_lessons():
        for ev in lesson["timeline_events"]:
            assert ev["event_type"] in ALLOWED_EVENT_TYPES


def test_timeline_seg_refs_are_grounded() -> None:
    for lesson in _load_lessons():
        valid_segs = {seg["seg_id"] for seg in lesson["transcript"]}
        for ev in lesson["timeline_events"]:
            if "seg_id" in ev:
                assert ev["seg_id"] in valid_segs, (
                    f"dangling seg ref {ev['seg_id']} in {lesson['lesson_id']}"
                )


def test_source_referenced_by_lessons_exists() -> None:
    path = _load_path()
    declared = set(path["sources"])
    for lesson in _load_lessons():
        src = lesson["source_id"]
        assert src in declared
        src_file = FIXTURE_ROOT / "sources" / f"{src}.txt"
        assert src_file.is_file()
        assert src_file.read_text().strip()


def test_markers_present_across_path() -> None:
    marker_types = {
        "marker_important",
        "marker_doubt",
        "marker_homework",
        "marker_error",
    }
    found: set[str] = set()
    for lesson in _load_lessons():
        for ev in lesson["timeline_events"]:
            if ev["event_type"] in marker_types:
                found.add(ev["event_type"])
    # The fixture must exercise all four marker kinds somewhere in the path.
    assert found == marker_types


@pytest.mark.parametrize("missing", ["lessons", "sources", "path_id"])
def test_path_manifest_has_required_keys(missing: str) -> None:
    path = _load_path()
    assert missing in path
