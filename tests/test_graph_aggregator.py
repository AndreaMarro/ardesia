"""Tests for Path-level graph aggregation (M1-1, lessonos/graph/aggregator.py).

Tests cover:
- Concept deduplication by normalized name across lessons
- Status progression (most advanced wins)
- Cross-path isolation (no contamination)
- Edge union preservation
- Empty/error paths
"""

import pytest

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import (
    Citation,
    ConceptExtraction,
    ExerciseExtraction,
    LessonContent,
    QuestionExtraction,
)
from lessonos.capsule.segmentation import TopicSpan
from lessonos.graph.aggregator import (
    _collect_edges_and_evidence,
    aggregate_path_graph,
    aggregate_teacher_graph,
    load_path_capsules,
)
from lessonos.graph.resolution import GlobalResolution, ResolutionAlias, ResolutionEntry
from lessonos.models.entities import (
    Segment,
    EDGE_TYPES,
    GraphEdge,
    GraphEvidence,
    GraphNode,
    Lesson,
    Path,
)
from lessonos.store.base import Store


# ---------------------------------------------------------------------------
# Minimal Store stub — stores paths, lessons, capsules, and graph tables
# in-memory (same pattern as test_excerpt_repair._SimpleStore).
# ---------------------------------------------------------------------------


class _PathStore(Store):
    """Minimal in-memory store stub for path graph tests.

    Stores paths, lessons, capsules (JSON), and graph tables.
    """

    def __init__(self):
        self._paths: dict[str, Path] = {}
        self._lessons: dict[str, Lesson] = {}
        self._capsules: dict[str, str] = {}
        self._nodes: dict[str, list[GraphNode]] = {}
        self._edges: dict[str, list[GraphEdge]] = {}
        self._evidence: dict[str, list[GraphEvidence]] = {}
        self._segments: dict[str, object] = {}

    def save_path(self, p: Path) -> None:
        self._paths[p.path_id] = p

    def get_path(self, path_id: str) -> Path | None:
        return self._paths.get(path_id)

    def paths_for_teacher(self, teacher_id: str) -> tuple[Path, ...]:
        return tuple(
            p for p in self._paths.values() if p.teacher_id == teacher_id
        )

    def save_lesson(self, l: Lesson) -> None:
        self._lessons[l.lesson_id] = l

    def get_lesson(self, lesson_id: str) -> Lesson | None:
        return self._lessons.get(lesson_id)

    def lessons_for_path(self, path_id: str) -> tuple[Lesson, ...]:
        return tuple(
            l for l in self._lessons.values() if l.path_id == path_id
        )

    def save_capsule(self, lesson_id: str, data: str) -> None:
        self._capsules[lesson_id] = data

    def get_capsule(self, lesson_id: str) -> str | None:
        return self._capsules.get(lesson_id)

    def save_segment(self, seg) -> None:
        self._segments[seg.seg_id] = seg

    def get_segment(self, seg_id: str):
        return self._segments.get(seg_id)

    def segments_for_lesson(self, lid: str):
        return tuple(s for s in self._segments.values()
                     if getattr(s, 'lesson_id', None) == lid)

    # Graph tables (stores per-lesson)
    def save_graph_node(self, lesson_id: str, node: GraphNode) -> None:
        self._nodes.setdefault(lesson_id, []).append(node)

    def get_graph_nodes_for_lesson(self, lesson_id: str) -> tuple[GraphNode, ...]:
        return tuple(self._nodes.get(lesson_id, []))

    def save_graph_edge(self, lesson_id: str, edge: GraphEdge) -> None:
        self._edges.setdefault(lesson_id, []).append(edge)

    def get_graph_edges_for_lesson(self, lesson_id: str) -> tuple[GraphEdge, ...]:
        return tuple(self._edges.get(lesson_id, []))

    def save_evidence(self, ev: GraphEvidence) -> None:
        self._evidence.setdefault(ev.lesson_id, []).append(ev)

    def get_evidence_for_edge(self, edge_id: str) -> tuple[GraphEvidence, ...]:
        return tuple(
            ev for evs in self._evidence.values()
            for ev in evs if ev.edge_id == edge_id
        )

    def get_all_evidence_for_lesson(self, lesson_id: str) -> tuple[GraphEvidence, ...]:
        return tuple(self._evidence.get(lesson_id, []))

    def delete_graph_for_lesson(self, lesson_id: str) -> None:
        self._nodes.pop(lesson_id, None)
        self._edges.pop(lesson_id, None)
        self._evidence.pop(lesson_id, None)

    def save_source(self, *a, **kw): ...
    def get_source(self, *a, **kw): ...
    def save_moment(self, *a, **kw): ...
    def get_moment(self, *a, **kw): ...
    def moments_for_lesson(self, *a, **kw): ...
    def save_ledger_entry(self, *a, **kw): ...
    def get_ledger_entries(self, *a, **kw): ...
    def get_ledger_for_lesson(self, *a, **kw): ...
    def close(self): ...
    def begin_transaction(self): ...
    def commit_transaction(self): ...
    def rollback_transaction(self): ...

    def delete_capsule(self, lesson_id: str) -> bool:
        return self._capsules.pop(lesson_id, None) is not None
    def purge_lesson(self, lesson_id: str) -> int:
        total = sum(1 for s in self._segments.values()
                    if getattr(s, 'lesson_id', None) == lesson_id)
        self._segments = {k: v for k, v in self._segments.items()
                          if getattr(v, 'lesson_id', None) != lesson_id}
        self.delete_capsule(lesson_id)
        self._nodes.pop(lesson_id, None)
        self._edges.pop(lesson_id, None)
        self._evidence.pop(lesson_id, None)
        return total


# ---------------------------------------------------------------------------
# Helpers: build minimal LessonCapsules for testing
# ---------------------------------------------------------------------------


def _make_seg_id(lesson_id: str, idx: int = 1) -> str:
    return f"{lesson_id}#s{idx}"


def _make_capsule(
    lesson_id: str,
    concepts: list[dict],
    lesson_id_for_seg: str | None = None,
) -> LessonCapsule:
    """Build a minimal LessonCapsule with the given concepts.

    Each concept dict supports keys: name, status (default 'introduced'),
    prerequisites (default []), citations (default 1 auto-citation).
    """
    seg_id = _make_seg_id(lesson_id_for_seg or lesson_id)
    content = LessonContent(
        lesson_id=lesson_id,
        concepts=tuple(
            ConceptExtraction(
                name=c["name"],
                status=c.get("status", "introduced"),
                canonical=c.get("canonical", ""),
                prerequisites=tuple(c.get("prerequisites", [])),
                citations=(
                    Citation(seg_id=seg_id, excerpt="test excerpt"),
                ),
            )
            for c in concepts
        ),
        exercises=(),
        student_questions=(),
        homework=(),
    )
    timeline = (
        TopicSpan(
            lesson_id=lesson_id,
            topic="Test Topic",
            seg_ids=(seg_id,),
            start=0,
            end=30,
        ),
    )
    return LessonCapsule(
        lesson_id=lesson_id,
        timeline=timeline,
        content=content,
    )


def _register_path(
    store: _PathStore,
    path_id: str,
    lesson_ids: list[str],
    teacher_id: str | None = None,
) -> None:
    """Register a path + its lessons in the store so load_path_capsules works."""
    store.save_path(Path(path_id=path_id, title="Test", subject="test",
                          lesson_ids=tuple(lesson_ids),
                          teacher_id=teacher_id))
    for i, lid in enumerate(lesson_ids):
        store.save_lesson(Lesson(lesson_id=lid, path_id=path_id,
                                 title=f"Lesson {i}", order=i))


def _register_capsule(
    store: _PathStore,
    capsule: LessonCapsule,
    edges: list[GraphEdge] | None = None,
    evidence: list[GraphEvidence] | None = None,
    nodes: list[GraphNode] | None = None,
) -> None:
    """Persist a capsule + optional graph data in the store."""
    from lessonos.capsule.assembly import _serialise_capsule
    store.save_capsule(capsule.lesson_id, _serialise_capsule(capsule))
    if nodes:
        for n in nodes:
            store.save_graph_node(capsule.lesson_id, n)
    if edges:
        for e in edges:
            store.save_graph_edge(capsule.lesson_id, e)
    if evidence:
        for ev in evidence:
            store.save_evidence(ev)
            # Fixture onesta (bug-hunt #1b): ogni evidence punta a un segmento
            # ESISTENTE il cui testo contiene l'excerpt (contratto del writer).
            if store.get_segment(ev.seg_id) is None:
                store.save_segment(Segment(
                    seg_id=ev.seg_id, lesson_id=capsule.lesson_id, start=0, end=1,
                    text=(ev.excerpt or "testo di supporto fixture") + " — contesto.",
                ))


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


class TestLoadPathCapsules:
    """Tests for load_path_capsules."""

    def test_load_existing_path(self):
        """Happy path: load 2 capsules from a path with 2 lessons."""
        store = _PathStore()
        _register_path(store, "p1", ["l1", "l2"])
        c1 = _make_capsule("l1", [{"name": "Alpha"}])
        c2 = _make_capsule("l2", [{"name": "Beta"}])
        _register_capsule(store, c1)
        _register_capsule(store, c2)

        capsules = load_path_capsules(store, "p1")
        assert len(capsules) == 2
        assert capsules[0].lesson_id == "l1"
        assert capsules[1].lesson_id == "l2"

    def test_path_not_found(self):
        """Non-existent path raises ValueError."""
        store = _PathStore()
        try:
            load_path_capsules(store, "no_such_path")
            assert False, "expected ValueError"
        except ValueError as e:
            assert "no_such_path" in str(e)

    def test_empty_path(self):
        """Path with no lessons returns empty list."""
        store = _PathStore()
        _register_path(store, "p1", [])
        assert load_path_capsules(store, "p1") == []

    def test_lesson_without_capsule_skipped(self):
        """Lesson without persisted capsule is silently skipped."""
        store = _PathStore()
        _register_path(store, "p1", ["l1", "l2"])
        c1 = _make_capsule("l1", [{"name": "Alpha"}])
        _register_capsule(store, c1)
        # l2 has no capsule
        capsules = load_path_capsules(store, "p1")
        assert len(capsules) == 1
        assert capsules[0].lesson_id == "l1"


class TestAggregateTeacherGraph:
    """Tests for aggregate_teacher_graph (M1-1 per-docente aggregation)."""

    def test_two_lessons_same_teacher_shared_concept(self):
        """2 lessons same teacher sharing 1 concept → 1 merged node with 2 evidence."""
        store = _PathStore()
        _register_path(store, "path_a", ["a1", "a2"], teacher_id="andrea")

        c1 = _make_capsule("a1", [{"name": "Segnale", "status": "introduced"}])
        c2 = _make_capsule("a2", [{"name": "Segnale", "status": "reinforced"}])
        _register_capsule(store, c1)
        _register_capsule(store, c2)

        result = aggregate_teacher_graph(store, "andrea")
        assert result.path_id == "teacher:andrea"
        assert len(result.merged_nodes) == 1
        node = result.merged_nodes[0]
        assert node.label == "Segnale"
        assert node.status == "reinforced"
        assert node.lesson_ids == ("a1", "a2")

    def test_cross_teacher_no_contamination(self):
        """Different teachers' concepts do not mix — cross-teacher guard active."""
        store = _PathStore()
        _register_path(store, "path_andrea", ["a1"], teacher_id="andrea")
        _register_path(store, "path_marco", ["b1"], teacher_id="marco")

        c_a = _make_capsule("a1", [{"name": "Segnale", "status": "introduced"}])
        c_b = _make_capsule("b1", [{"name": "Integrale", "status": "introduced"}])
        _register_capsule(store, c_a)
        _register_capsule(store, c_b)

        result = aggregate_teacher_graph(store, "andrea")
        assert len(result.merged_nodes) == 1
        assert result.merged_nodes[0].label == "Segnale"

    def test_multi_path_teacher(self):
        """Teacher with 2 paths → concepts from both paths are merged."""
        store = _PathStore()
        _register_path(store, "course_A", ["a1"], teacher_id="andrea")
        _register_path(store, "course_B", ["b1"], teacher_id="andrea")

        c_a = _make_capsule("a1", [{"name": "Segnale", "status": "introduced"}])
        c_b = _make_capsule("b1", [{"name": "Rumore", "status": "introduced"}])
        _register_capsule(store, c_a)
        _register_capsule(store, c_b)

        result = aggregate_teacher_graph(store, "andrea")
        assert len(result.merged_nodes) == 2
        labels = {n.label for n in result.merged_nodes}
        assert labels == {"Segnale", "Rumore"}

    def test_teacher_not_found(self):
        """Unknown teacher raises ValueError."""
        store = _PathStore()
        try:
            aggregate_teacher_graph(store, "unknown_teacher")
            assert False, "expected ValueError"
        except ValueError as e:
            assert "unknown_teacher" in str(e)

    def test_teacher_no_capsules(self):
        """Teacher with paths but no capsules returns empty graph."""
        store = _PathStore()
        _register_path(store, "path_a", ["a1"], teacher_id="andrea")
        # No capsules registered
        result = aggregate_teacher_graph(store, "andrea")
        assert result.path_id == "teacher:andrea"
        assert len(result.merged_nodes) == 0


class TestAggregatePathGraph:
    """Tests for aggregate_path_graph."""

    def test_smoke_two_lessons_shared_concept(self):
        """2 lessons sharing 1 concept → 1 merged node with 2 evidence + status advanced."""
        store = _PathStore()
        _register_path(store, "path_a", ["a1", "a2"])

        c1 = _make_capsule("a1", [{"name": "Derivative", "status": "introduced"}])
        c2 = _make_capsule("a2", [{"name": "Derivative", "status": "reinforced"}])
        _register_capsule(store, c1)
        _register_capsule(store, c2)

        # Add graph data to be counted in edge/evidence union
        ev1 = GraphEvidence(evidence_id="ev1", edge_id="e1", seg_id="a1#s1",
                            excerpt="test", lesson_id="a1")
        ev2 = GraphEvidence(evidence_id="ev2", edge_id="e2", seg_id="a2#s1",
                            excerpt="test", lesson_id="a2")
        edge1 = GraphEdge(edge_id="e1", source="a1", target="a1:concept:0",
                          edge_type="explains", metadata={})
        edge2 = GraphEdge(edge_id="e2", source="a2", target="a2:concept:0",
                          edge_type="explains", metadata={})
        _register_capsule(store, c1, edges=[edge1], evidence=[ev1])
        _register_capsule(store, c2, edges=[edge2], evidence=[ev2])

        result = aggregate_path_graph(store, "path_a")
        assert result.path_id == "path_a"
        assert len(result.merged_nodes) == 1

        node = result.merged_nodes[0]
        assert node.label == "Derivative"
        assert node.status == "reinforced"  # most advanced
        assert node.lesson_ids == ("a1", "a2")  # from both lessons
        assert node.evidence_count == 2  # 1 citation per capsule

        # Edge union
        assert len(result.existing_edges) == 2
        assert len(result.path_evidence) == 2

    def test_cross_path_isolation(self):
        """Lesson from a different path does NOT appear in the result."""
        store = _PathStore()
        _register_path(store, "path_a", ["a1"])
        _register_path(store, "path_b", ["b1"])

        c_a = _make_capsule("a1", [{"name": "Derivative", "status": "introduced"}])
        c_b = _make_capsule("b1", [{"name": "Integral", "status": "introduced"}])
        _register_capsule(store, c_a)
        _register_capsule(store, c_b)

        result = aggregate_path_graph(store, "path_a")
        assert len(result.merged_nodes) == 1
        assert result.merged_nodes[0].label == "Derivative"

    def test_status_progression(self):
        """introduced+reinforced+reviewed → reviewed (most advanced)."""
        store = _PathStore()
        _register_path(store, "p1", ["l1", "l2", "l3"])
        c1 = _make_capsule("l1", [{"name": "Limits", "status": "introduced"}])
        c2 = _make_capsule("l2", [{"name": "Limits", "status": "reinforced"}])
        c3 = _make_capsule("l3", [{"name": "Limits", "status": "reviewed"}])
        _register_capsule(store, c1)
        _register_capsule(store, c2)
        _register_capsule(store, c3)

        result = aggregate_path_graph(store, "p1")
        assert len(result.merged_nodes) == 1
        assert result.merged_nodes[0].status == "reviewed"

    def test_three_distinct_concepts(self):
        """3 concepts → 3 separate merged nodes."""
        store = _PathStore()
        _register_path(store, "p1", ["l1"])
        c1 = _make_capsule("l1", [
            {"name": "Alpha"},
            {"name": "Beta"},
            {"name": "Gamma"},
        ])
        _register_capsule(store, c1)

        result = aggregate_path_graph(store, "p1")
        assert len(result.merged_nodes) == 3
        labels = {n.label for n in result.merged_nodes}
        assert labels == {"Alpha", "Beta", "Gamma"}

    def test_edge_union_preserved(self):
        """All edge types from all lessons appear in existing_edges."""
        store = _PathStore()
        _register_path(store, "p1", ["l1", "l2"])
        c1 = _make_capsule("l1", [{"name": "A"}])
        c2 = _make_capsule("l2", [{"name": "B"}])
        _register_capsule(store, c1)
        _register_capsule(store, c2)

        edge1 = GraphEdge(edge_id="e1", source="l1", target="l1:concept:0",
                          edge_type="explains", metadata={})
        edge2 = GraphEdge(edge_id="e2", source="l2", target="l2:concept:0",
                          edge_type="assigned_in", metadata={})
        _register_capsule(store, c1, edges=[edge1])
        _register_capsule(store, c2, edges=[edge2])

        result = aggregate_path_graph(store, "p1")
        assert len(result.existing_edges) == 2
        types = {e.edge_type for e in result.existing_edges}
        assert types == {"explains", "assigned_in"}

    def test_empty_path_no_capsules(self):
        """Path with no capsules returns empty AggregatedPathGraph."""
        store = _PathStore()
        _register_path(store, "p1", ["l1", "l2"])
        # No capsules registered
        result = aggregate_path_graph(store, "p1")
        assert result.path_id == "p1"
        assert len(result.merged_nodes) == 0
        assert len(result.existing_edges) == 0

    def test_normalize_name_dedup(self):
        """Case/whitespace differences in names are deduplicated."""
        store = _PathStore()
        _register_path(store, "p1", ["l1", "l2"])
        c1 = _make_capsule("l1", [{"name": "  Derivative  ", "status": "introduced"}])
        c2 = _make_capsule("l2", [{"name": "derivative", "status": "reinforced"}])
        _register_capsule(store, c1)
        _register_capsule(store, c2)

        result = aggregate_path_graph(store, "p1")
        assert len(result.merged_nodes) == 1
        assert result.merged_nodes[0].status == "reinforced"

    def test_problematic_status_dominates_introduced(self):
        """problematic > introduced in STATUS_ORDER."""
        store = _PathStore()
        _register_path(store, "p1", ["l1", "l2"])
        c1 = _make_capsule("l1", [{"name": "X", "status": "introduced"}])
        c2 = _make_capsule("l2", [{"name": "X", "status": "problematic"}])
        _register_capsule(store, c1)
        _register_capsule(store, c2)

        result = aggregate_path_graph(store, "p1")
        assert result.merged_nodes[0].status == "problematic"

    def test_canonical_dedup_different_names(self):
        """2 lessons with different names but SAME canonical -> 1 merged node."""
        store = _PathStore()
        _register_path(store, "p1", ["l1", "l2"])
        c1 = _make_capsule("l1", [{"name": "Definizione di segnale", "status": "introduced", "canonical": "segnale"}])
        c2 = _make_capsule("l2", [{"name": "Il segnale come grandezza fisica", "status": "reinforced", "canonical": "segnale"}])
        _register_capsule(store, c1)
        _register_capsule(store, c2)

        result = aggregate_path_graph(store, "p1")
        assert len(result.merged_nodes) == 1, f"expected 1 merged node, got {len(result.merged_nodes)}"
        node = result.merged_nodes[0]
        assert node.label == "Definizione di segnale"  # first-seen name preserved
        assert node.status == "reinforced"  # most advanced
        assert node.lesson_ids == ("l1", "l2")

    def test_canonical_fallback_to_name(self):
        """Concepts with empty canonical fall back to normalized name (backward compat)."""
        store = _PathStore()
        _register_path(store, "p1", ["l1", "l2"])
        c1 = _make_capsule("l1", [{"name": "Segnale", "status": "introduced"}])  # no canonical
        c2 = _make_capsule("l2", [{"name": "Segnale", "status": "reinforced"}])  # no canonical
        _register_capsule(store, c1)
        _register_capsule(store, c2)

        result = aggregate_path_graph(store, "p1")
        assert len(result.merged_nodes) == 1
        assert result.merged_nodes[0].status == "reinforced"

    def test_canonical_no_merge_without_match(self):
        """Different canonical values produce separate nodes (no false merging)."""
        store = _PathStore()
        _register_path(store, "p1", ["l1", "l2"])
        c1 = _make_capsule("l1", [{"name": "Energia", "status": "introduced", "canonical": "energia"}])
        c2 = _make_capsule("l2", [{"name": "Potenza", "status": "introduced", "canonical": "potenza"}])
        _register_capsule(store, c1)
        _register_capsule(store, c2)

        result = aggregate_path_graph(store, "p1")
        assert len(result.merged_nodes) == 2

    def test_canonical_cross_teacher_no_contamination(self):
        """Canonical dedup does NOT cross teacher boundaries (guard preserved)."""
        store = _PathStore()
        _register_path(store, "pa", ["a1"], teacher_id="andrea")
        _register_path(store, "pb", ["b1"], teacher_id="marco")
        c1 = _make_capsule("a1", [{"name": "Def segnale", "status": "introduced", "canonical": "segnale"}])
        c2 = _make_capsule("b1", [{"name": "Il segnale", "status": "reinforced", "canonical": "segnale"}])
        _register_capsule(store, c1)
        _register_capsule(store, c2)

        result = aggregate_teacher_graph(store, "andrea")
        assert len(result.merged_nodes) == 1
        assert result.merged_nodes[0].label == "Def segnale"
        assert result.merged_nodes[0].lesson_ids == ("a1",)  # only andrea's lesson

    def test_mapping_cross_teacher_no_contamination(self):
        """M1-1c: a global resolution mapping never crosses teacher boundaries.

        Even if a (stale/forged) mapping for andrea names a lesson belonging
        to marco, aggregation only ever sees andrea's lessons — marco's
        occurrence cannot leak in via the mapping. And marco's own aggregate
        rejects andrea's mapping outright (guard).
        """
        store = _PathStore()
        _register_path(store, "pa", ["a1"], teacher_id="andrea")
        _register_path(store, "pb", ["b1"], teacher_id="marco")
        c1 = _make_capsule("a1", [{"name": "Def segnale", "status": "introduced", "canonical": "segnale"}])
        c2 = _make_capsule("b1", [{"name": "Il segnale", "status": "reinforced", "canonical": "segnale"}])
        _register_capsule(store, c1)
        _register_capsule(store, c2)

        # Mapping for andrea that (wrongly) also references marco's lesson b1.
        resolution = GlobalResolution(
            teacher_id="andrea",
            entries=(
                ResolutionEntry(
                    canonical="segnale globale",
                    aliases=(
                        ResolutionAlias(
                            lesson_id="a1",
                            original_name="Def segnale",
                            original_canonical="segnale",
                            evidence_count=1,
                        ),
                        ResolutionAlias(
                            lesson_id="b1",
                            original_name="Il segnale",
                            original_canonical="segnale",
                            evidence_count=1,
                        ),
                    ),
                ),
            ),
        )

        result = aggregate_teacher_graph(store, "andrea", resolution=resolution)
        assert len(result.merged_nodes) == 1
        node = result.merged_nodes[0]
        assert node.lesson_ids == ("a1",)  # b1 never aggregated for andrea
        assert node.dedup_key == "segnale globale"

        # marco's aggregate must refuse andrea's mapping (contamination guard).
        with pytest.raises(ValueError, match="contamination"):
            aggregate_teacher_graph(store, "marco", resolution=resolution)


# ── M1-4c test #1: re-ingest stale evidence ──────────────────────────


class TestReingestStaleEvidence:
    """Bug-hunt §4 test #1: re-ingest with different segmentation invalidates
    stale evidence. Verifies the fail-closed read-path in _collect_edges_and_evidence."""

    def test_stale_evidence_rejected_on_segment_text_change(self):
        """Evidence whose excerpt is no longer verbatim in the segment's NEW
        text is detected as stale and raises ValueError."""
        store = _PathStore()
        _register_path(store, "p1", ["l1"])
        seg = Segment(seg_id="l1#s1", lesson_id="l1", start=0, end=10,
                      text="La derivata formale di una funzione e il limite.")
        store.save_segment(seg)
        ev = GraphEvidence(
            evidence_id="l1#e1", edge_id="l1#edge1", seg_id="l1#s1",
            excerpt="derivata formale", lesson_id="l1", confidence=1.0,
        )
        store.save_evidence(ev)
        # Re-segment: segment text changes (simulating re-ingest with diff params)
        new_seg = Segment(
            seg_id="l1#s1", lesson_id="l1", start=0, end=10,
            text="Il rapporto incrementale e il fondamento del calcolo.",
        )
        store.save_segment(new_seg)
        with pytest.raises(ValueError, match="STALE"):
            _collect_edges_and_evidence(store, ["l1"])

    def test_stale_evidence_segment_gone_raises(self):
        """Evidence whose seg_id no longer exists is stale -> ValueError."""
        store = _PathStore()
        _register_path(store, "p1", ["l1"])
        ev = GraphEvidence(
            evidence_id="l1#e1", edge_id="l1#edge1", seg_id="l1#s1",
            excerpt="derivata", lesson_id="l1", confidence=1.0,
        )
        store.save_evidence(ev)
        # No segment saved — seg_id is dangling
        with pytest.raises(ValueError, match="STALE"):
            _collect_edges_and_evidence(store, ["l1"])

    def test_fresh_evidence_passes_through(self):
        """Clean evidence (current segment, verbatim excerpt) passes through."""
        store = _PathStore()
        _register_path(store, "p1", ["l1"])
        seg = Segment(seg_id="l1#s1", lesson_id="l1", start=0, end=10,
                      text="La derivata formale di una funzione.")
        store.save_segment(seg)
        ev = GraphEvidence(
            evidence_id="l1#e1", edge_id="l1#edge1", seg_id="l1#s1",
            excerpt="derivata formale", lesson_id="l1", confidence=1.0,
        )
        store.save_evidence(ev)
        edges, evidence = _collect_edges_and_evidence(store, ["l1"])
        assert len(evidence) == 1
        assert evidence[0].evidence_id == "l1#e1"


# ── M1-4c test #4: second lesson same path reaches aggregate ─────────


class TestSecondLessonReachesAggregate:
    """Bug-hunt §4 test #4: two lessons on the same path both reachable
    via aggregate_path_graph and teacher_book."""

    def test_two_lessons_on_one_path(self):
        """Both lessons appear in aggregate_path_graph."""
        store = _PathStore()
        _register_path(store, "p1", ["l1", "l2"], teacher_id="andrea")
        seg1 = Segment(seg_id="l1#s1", lesson_id="l1", start=0, end=10,
                       text="La derivata formale.")
        seg2 = Segment(seg_id="l2#s1", lesson_id="l2", start=0, end=10,
                       text="L'integrale definito.")
        store.save_segment(seg1)
        store.save_segment(seg2)
        c1 = _make_capsule("l1", [{"name": "Derivata"}])
        c2 = _make_capsule("l2", [{"name": "Integrale"}])
        _register_capsule(store, c1)
        _register_capsule(store, c2)
        graph = aggregate_path_graph(store, "p1")
        assert len(graph.merged_nodes) == 2
        # Both lesson_ids appear across the merged nodes
        lesson_ids_found: set[str] = set()
        for n in graph.merged_nodes:
            lesson_ids_found.update(n.lesson_ids)
        assert "l1" in lesson_ids_found
        assert "l2" in lesson_ids_found

    def test_teacher_graph_both_lessons(self):
        """Teacher aggregation includes both lessons across paths."""
        store = _PathStore()
        _register_path(store, "pA", ["l1"], teacher_id="andrea")
        _register_path(store, "pB", ["l2"], teacher_id="andrea")
        seg1 = Segment(seg_id="l1#s1", lesson_id="l1", start=0, end=10,
                       text="Derivata.")
        seg2 = Segment(seg_id="l2#s1", lesson_id="l2", start=0, end=10,
                       text="Integrale.")
        store.save_segment(seg1)
        store.save_segment(seg2)
        c1 = _make_capsule("l1", [{"name": "Derivata"}])
        c2 = _make_capsule("l2", [{"name": "Integrale"}])
        _register_capsule(store, c1)
        _register_capsule(store, c2)
        graph = aggregate_teacher_graph(store, "andrea")
        assert len(graph.merged_nodes) == 2
        lesson_ids_found = set()
        for n in graph.merged_nodes:
            lesson_ids_found.update(n.lesson_ids)
        assert "l1" in lesson_ids_found
        assert "l2" in lesson_ids_found

    def test_lesson_ids_consistency(self):
        """path.lesson_ids and lessons_for_path agree after adding a second lesson."""
        store = _PathStore()
        _register_path(store, "p1", ["l1"], teacher_id="andrea")
        seg1 = Segment(seg_id="l1#s1", lesson_id="l1", start=0, end=10,
                       text="Alpha.")
        store.save_segment(seg1)
        c1 = _make_capsule("l1", [{"name": "Alpha"}])
        _register_capsule(store, c1)
        # Add second lesson to the same path
        store.save_lesson(Lesson(lesson_id="l2", path_id="p1", title="Beta", order=1))
        seg2 = Segment(seg_id="l2#s1", lesson_id="l2", start=0, end=10,
                       text="Beta.")
        store.save_segment(seg2)
        c2 = _make_capsule("l2", [{"name": "Beta"}])
        _register_capsule(store, c2)
        # NOTE: path.lesson_ids may lag behind — the test exercises the invariant
        # that lessons_for_path has the correct count.
        via_for_path = {l.lesson_id for l in store.lessons_for_path("p1")}
        # lessons_for_path reflects reality (both lessons saved)
        assert via_for_path == {"l1", "l2"}
        # aggregate_path_graph now uses lessons_for_path as primary source
        # (M1-5 fix — _lesson_ids_from_path prefers DB-backed data).
        graph = aggregate_path_graph(store, "p1")
        assert len(graph.merged_nodes) == 2

