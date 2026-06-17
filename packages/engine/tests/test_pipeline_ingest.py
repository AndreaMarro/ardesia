"""Tests for the canonical single-lesson ingest pipeline (M1-5.4)."""

from __future__ import annotations

import json
from dataclasses import dataclass

from lessonos.llm.router import MockProvider, Router
from lessonos.models.entities import (
    Lesson,
    Path,
)
from lessonos.pipeline import run_ingest
from lessonos.store.base import Store


# ── In-memory store stub with real purge_lesson ──────────────────────────


@dataclass
class _Seg:
    seg_id: str
    lesson_id: str
    start: int = 0
    end: int = 10
    text: str = "test segment text for grounding"


class _IngestStore(Store):
    """Minimal store stub that supports purge + graph operations."""

    def __init__(self):
        self._segments: dict[str, _Seg] = {}
        self._capsules: dict[str, str] = {}
        self._nodes: dict[str, list] = {}
        self._edges: dict[str, list] = {}
        self._evidence: dict[str, list] = {}
        self._lessons: dict[str, Lesson] = {}
        self._paths: dict[str, Path] = {}
        self._moments: dict[str, list] = {}

    # --- Path ---
    def save_path(self, p: Path) -> None:
        self._paths[p.path_id] = p
    def get_path(self, path_id: str) -> Path | None:
        return self._paths.get(path_id)
    def paths_for_teacher(self, teacher_id: str) -> tuple[Path, ...]:
        return tuple(p for p in self._paths.values() if p.teacher_id == teacher_id)

    # --- Lesson ---
    def save_lesson(self, l: Lesson) -> None:
        self._lessons[l.lesson_id] = l
    def get_lesson(self, lesson_id: str) -> Lesson | None:
        return self._lessons.get(lesson_id)
    def lessons_for_path(self, path_id: str) -> tuple[Lesson, ...]:
        return tuple(l for l in self._lessons.values() if l.path_id == path_id)

    # --- Source ---
    def save_source(self, *a, **kw): ...
    def get_source(self, *a, **kw): ...

    # --- Segment ---
    def save_segment(self, seg) -> None:
        if hasattr(seg, 'seg_id'):
            self._segments[seg.seg_id] = seg
    def get_segment(self, seg_id: str) -> _Seg | None:
        return self._segments.get(seg_id)
    def segments_for_lesson(self, lesson_id: str) -> tuple:
        return tuple(s for s in self._segments.values()
                     if getattr(s, 'lesson_id', None) == lesson_id)

    # --- Moment ---
    def save_moment(self, *a, **kw): ...
    def get_moment(self, *a, **kw): ...
    def moments_for_lesson(self, *a, **kw): ...

    # --- Capsule ---
    def save_capsule(self, lesson_id: str, data: str) -> None:
        self._capsules[lesson_id] = data
    def get_capsule(self, lesson_id: str) -> str | None:
        return self._capsules.get(lesson_id)
    def delete_capsule(self, lesson_id: str) -> bool:
        return self._capsules.pop(lesson_id, None) is not None

    # --- Cost ledger ---
    def save_ledger_entry(self, *a, **kw): ...
    def get_ledger_entries(self): return ()
    def get_ledger_for_lesson(self, *a, **kw): return ()

    # --- Graph tables ---
    def save_graph_node(self, lesson_id: str, node) -> None:
        self._nodes.setdefault(lesson_id, []).append(node)
    def get_graph_nodes_for_lesson(self, lesson_id: str):
        return tuple(self._nodes.get(lesson_id, []))
    def save_graph_edge(self, lesson_id: str, edge) -> None:
        self._edges.setdefault(lesson_id, []).append(edge)
    def get_graph_edges_for_lesson(self, lesson_id: str):
        return tuple(self._edges.get(lesson_id, []))
    def save_evidence(self, ev) -> None:
        self._evidence.setdefault(ev.lesson_id, []).append(ev)
    def get_evidence_for_edge(self, edge_id: str):
        result = []
        for lst in self._evidence.values():
            for ev in lst:
                if ev.edge_id == edge_id:
                    result.append(ev)
        return tuple(result)
    def get_all_evidence_for_lesson(self, lesson_id: str):
        return tuple(self._evidence.get(lesson_id, []))
    def delete_graph_for_lesson(self, lesson_id: str) -> None:
        self._nodes.pop(lesson_id, None)
        self._edges.pop(lesson_id, None)
        self._evidence.pop(lesson_id, None)

    # --- Transaction (no-op for in-memory stub) ---
    def begin_transaction(self): ...
    def commit_transaction(self): ...
    def rollback_transaction(self): ...

    # --- Purge ---
    def purge_lesson(self, lesson_id: str) -> int:
        total = 0
        keys = [k for k, s in self._segments.items()
                if getattr(s, 'lesson_id', None) == lesson_id]
        for k in keys:
            del self._segments[k]
            total += 1
        if self._capsules.pop(lesson_id, None) is not None:
            total += 1
        if self._nodes.pop(lesson_id, None) is not None:
            total += 1
        if self._edges.pop(lesson_id, None) is not None:
            total += 1
        if self._evidence.pop(lesson_id, None) is not None:
            total += 1
        return total

    def close(self): ...


# ── Tests ──────────────────────────────────────────────────────────────


def test_ingest_store_smoke():
    """Verify the store stub itself works for basic operations."""
    store = _IngestStore()
    store.save_segment(_Seg(seg_id="l1#s1", lesson_id="l1", text="alpha"))
    store.save_segment(_Seg(seg_id="l1#s2", lesson_id="l1", text="beta"))
    assert len(store.segments_for_lesson("l1")) == 2
    assert store.get_segment("l1#s1").text == "alpha"

    store.purge_lesson("l1")
    assert len(store.segments_for_lesson("l1")) == 0


def test_run_ingest_smoke():
    """run_ingest with mock provider produces a capsule + graph in store."""
    store = _IngestStore()
    seg = _Seg(seg_id="l1#s1", lesson_id="l1", text="alpha")
    seg2 = _Seg(seg_id="l1#s2", lesson_id="l1", text="beta")
    store.save_segment(seg)
    store.save_segment(seg2)

    from lessonos.capsule.segmentation import build_segmentation_prompt
    from lessonos.capsule.extraction import build_extraction_prompt
    segments = store.segments_for_lesson("l1")
    seg_prompt = build_segmentation_prompt(segments)
    ext_prompt = build_extraction_prompt(segments)

    router = Router()
    router.register(MockProvider(fixtures={
        seg_prompt: json.dumps([{
            "topic": "Test topic",
            "seg_ids": ["l1#s1", "l1#s2"],
        }]),
        ext_prompt: json.dumps({
            "concepts": [{
                "name": "Alpha",
                "status": "introduced",
                "citations": [{"seg_id": "l1#s1", "excerpt": "alpha"}],
            }],
            "exercises": [],
            "student_questions": [],
            "homework": [],
        }),
    }))
    capsule = run_ingest(store, "l1", router, provider="mock")

    assert capsule.lesson_id == "l1"
    assert len(capsule.timeline) == 1
    assert len(capsule.content.concepts) == 1

    # Capsule is persisted
    raw = store.get_capsule("l1")
    assert raw is not None
    assert "lesson_id" in raw

    # Graph tables are populated
    nodes = store.get_graph_nodes_for_lesson("l1")
    assert len(nodes) == 2
    edges = store.get_graph_edges_for_lesson("l1")
    assert len(edges) == 1
    evidence = store.get_all_evidence_for_lesson("l1")
    assert len(evidence) == 1


def test_run_ingest_purge_before_save():
    """run_ingest purges existing data before writing new capsule."""
    store = _IngestStore()
    seg = _Seg(seg_id="l1#s1", lesson_id="l1", text="alpha")
    seg2 = _Seg(seg_id="l1#s2", lesson_id="l1", text="beta")
    store.save_segment(seg)
    store.save_segment(seg2)

    from lessonos.capsule.segmentation import build_segmentation_prompt
    from lessonos.capsule.extraction import build_extraction_prompt
    segments = store.segments_for_lesson("l1")
    seg_prompt = build_segmentation_prompt(segments)
    ext_prompt = build_extraction_prompt(segments)

    router = Router()
    router.register(MockProvider(fixtures={
        seg_prompt: json.dumps([{
            "topic": "Test topic",
            "seg_ids": ["l1#s1", "l1#s2"],
        }]),
        ext_prompt: json.dumps({
            "concepts": [{
                "name": "Alpha",
                "status": "introduced",
                "citations": [{"seg_id": "l1#s1", "excerpt": "alpha"}],
            }],
            "exercises": [],
            "student_questions": [],
            "homework": [],
        }),
    }))
    capsule1 = run_ingest(store, "l1", router, provider="mock")
    nodes_after_first = len(store.get_graph_nodes_for_lesson("l1"))
    edges_after_first = len(store.get_graph_edges_for_lesson("l1"))
    evidence_after_first = len(store.get_all_evidence_for_lesson("l1"))
    assert nodes_after_first > 0 and edges_after_first > 0

    # Re-ingest (same segments, no changes)
    capsule2 = run_ingest(store, "l1", router, provider="mock")

    assert capsule2.lesson_id == "l1"
    assert len(capsule2.content.concepts) == len(capsule1.content.concepts)

    # The CLAIM of this test (retro-review: the old `>= 1` assert passed
    # even with the purge removed): re-ingest must not duplicate graph rows
    # in the stub's append-based tables — counts must be identical.
    # Mutation-verified: the invariant is enforced by TWO redundant layers
    # (run_ingest's step-1 deletes AND GraphWriter.write_capsule_graph's
    # internal DELETE+INSERT); removing either alone still passes, removing
    # BOTH makes these equality asserts fail (counts double).
    assert len(store.get_graph_nodes_for_lesson("l1")) == nodes_after_first
    assert len(store.get_graph_edges_for_lesson("l1")) == edges_after_first
    assert len(store.get_all_evidence_for_lesson("l1")) == evidence_after_first


def test_run_ingest_empty_lesson_raises():
    """run_ingest on a lesson with no segments raises (no purge crash)."""
    store = _IngestStore()
    router = Router()
    import pytest
    with pytest.raises(ValueError):
        run_ingest(store, "empty_lesson", router, provider="mock")
