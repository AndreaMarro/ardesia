"""Tests for T6R full-lesson batching (windowed extraction + segmentation).

The real lectures are 1351–3446 segments; a single-shot prompt overflows the
model context. ``extract_lesson_content`` / ``segment_lesson_topics`` now window
the segments (``window_size``), call the router once per window, and merge:

  * concepts dedup by normalised name (union citations + prerequisites),
  * exercises / questions / homework dedup by text,
  * topic spans concatenated.

Backward-compat is the load-bearing property: a lesson at/under ``window_size``
yields ONE window whose prompt equals the pre-batching one-shot prompt, so every
existing single-window test is unaffected.
"""

from __future__ import annotations

import json

import pytest

from lessonos.capsule.extraction import (
    _window,
    build_extraction_prompt,
    extract_lesson_content,
)
from lessonos.capsule.segmentation import (
    build_segmentation_prompt,
    segment_lesson_topics,
)
from lessonos.llm.router import MockProvider, Router
from lessonos.models.entities import Segment
from lessonos.store.sqlite import SQLiteStore

L = "lb"


def _store4() -> SQLiteStore:
    """In-memory store, 4 segments whose text contains the test excerpts."""
    s = SQLiteStore(":memory:")
    s.save_segment(Segment(seg_id="lb#s1", lesson_id=L, start=0, end=5, text="alpha concept uno"))
    s.save_segment(Segment(seg_id="lb#s2", lesson_id=L, start=5, end=10, text="esercizio primo due"))
    s.save_segment(Segment(seg_id="lb#s3", lesson_id=L, start=10, end=15, text="alpha ancora tre"))
    s.save_segment(Segment(seg_id="lb#s4", lesson_id=L, start=15, end=20, text="beta concetto quattro"))
    return s


class TestWindow:
    def test_under_size_single_window(self) -> None:
        assert _window([1, 2, 3], 10) == [[1, 2, 3]]

    def test_at_size_single_window(self) -> None:
        assert _window([1, 2, 3], 3) == [[1, 2, 3]]

    def test_over_size_splits(self) -> None:
        assert _window([1, 2, 3, 4, 5], 2) == [[1, 2], [3, 4], [5]]

    def test_nonpositive_size_single_window(self) -> None:
        assert _window([1, 2, 3], 0) == [[1, 2, 3]]

    def test_empty(self) -> None:
        assert _window([], 5) == [[]]


class TestWindowedExtractionMerge:
    def test_concepts_dedup_and_citations_union(self) -> None:
        store = _store4()
        segs = store.segments_for_lesson(L)
        w1, w2 = segs[0:2], segs[2:4]
        payload1 = {
            "concepts": [
                {
                    "name": "alpha",
                    "status": "introduced",
                    "citations": [{"seg_id": "lb#s1", "excerpt": "alpha"}],
                }
            ],
            "exercises": [
                {
                    "prompt": "Esercizio A",
                    "citations": [{"seg_id": "lb#s2", "excerpt": "esercizio primo"}],
                }
            ],
            "student_questions": [],
            "homework": [],
        }
        payload2 = {
            "concepts": [
                {
                    "name": "alpha",  # SAME name → merge
                    "status": "reinforced",
                    "prerequisites": ["base"],
                    "citations": [{"seg_id": "lb#s3", "excerpt": "alpha"}],
                },
                {
                    "name": "beta",
                    "status": "introduced",
                    "citations": [{"seg_id": "lb#s4", "excerpt": "beta"}],
                },
            ],
            "exercises": [
                {
                    "prompt": "Esercizio B",
                    "citations": [{"seg_id": "lb#s4", "excerpt": "concetto"}],
                }
            ],
            "student_questions": [],
            "homework": [],
        }
        router = Router()
        router.register(
            MockProvider(
                {
                    build_extraction_prompt(w1): json.dumps(payload1),
                    build_extraction_prompt(w2): json.dumps(payload2),
                }
            )
        )

        content = extract_lesson_content(store, L, router, window_size=2)

        # alpha merged (first-seen order), beta second
        assert [c.name for c in content.concepts] == ["alpha", "beta"]
        alpha = content.concepts[0]
        # citations from BOTH windows unioned
        assert {c.seg_id for c in alpha.citations} == {"lb#s1", "lb#s3"}
        # first-seen status kept; prerequisites unioned
        assert alpha.status == "introduced"
        assert alpha.prerequisites == ("base",)
        # exercises concatenated across windows
        assert [e.prompt for e in content.exercises] == ["Esercizio A", "Esercizio B"]
        store.close()

    def test_duplicate_exercise_text_deduped(self) -> None:
        store = _store4()
        segs = store.segments_for_lesson(L)
        w1, w2 = segs[0:2], segs[2:4]
        same_ex = {
            "concepts": [],
            "exercises": [
                {"prompt": "Stesso esercizio", "citations": [{"seg_id": "lb#s1", "excerpt": "alpha"}]}
            ],
            "student_questions": [],
            "homework": [],
        }
        router = Router()
        router.register(
            MockProvider(
                {
                    build_extraction_prompt(w1): json.dumps(same_ex),
                    build_extraction_prompt(w2): json.dumps(
                        {
                            "concepts": [],
                            "exercises": [
                                {"prompt": "Stesso esercizio", "citations": [{"seg_id": "lb#s3", "excerpt": "alpha"}]}
                            ],
                            "student_questions": [],
                            "homework": [],
                        }
                    ),
                }
            )
        )
        content = extract_lesson_content(store, L, router, window_size=2)
        assert len(content.exercises) == 1  # deduped by prompt text
        store.close()


class TestWindowedSegmentation:
    def test_spans_concatenated_across_windows(self) -> None:
        store = _store4()
        segs = store.segments_for_lesson(L)
        w1, w2 = segs[0:2], segs[2:4]
        router = Router()
        router.register(
            MockProvider(
                {
                    build_segmentation_prompt(w1): json.dumps(
                        [{"topic": "T1", "seg_ids": ["lb#s1", "lb#s2"]}]
                    ),
                    build_segmentation_prompt(w2): json.dumps(
                        [{"topic": "T2", "seg_ids": ["lb#s3", "lb#s4"]}]
                    ),
                }
            )
        )
        spans = segment_lesson_topics(store, L, router, window_size=2)
        assert [sp.topic for sp in spans] == ["T1", "T2"]
        assert spans[0].seg_ids == ("lb#s1", "lb#s2")
        assert spans[0].start == 0 and spans[0].end == 10
        assert spans[1].seg_ids == ("lb#s3", "lb#s4")
        assert spans[1].start == 10 and spans[1].end == 20
        store.close()
