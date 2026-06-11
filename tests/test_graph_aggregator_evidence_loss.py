"""Reproduces the evidence/edge LOSS bug in aggregate_teacher_graph (M1-1).

A teacher can have lessons whose Lesson Graph (edges + evidence) was persisted
by the T5 graph_writer even though no LessonCapsule was assembled/persisted for
them. The buggy aggregator early-returns an EMPTY graph as soon as
``not all_capsules`` is true — discarding edges and evidence that already exist
in the store. These tests assert the graph is NOT empty when edges/evidence
exist.

Place this file at: ~/lessonos/tests/test_graph_aggregator_evidence_loss.py
Run: .venv/bin/python -m pytest tests/test_graph_aggregator_evidence_loss.py -q

Reuses the in-memory _PathStore and registration helpers from the project's
existing aggregator test suite (same conventions).
"""

from lessonos.graph.aggregator import aggregate_teacher_graph, aggregate_path_graph
from lessonos.models.entities import GraphEdge, GraphEvidence

from tests.test_graph_aggregator import _PathStore, _register_path


def test_teacher_no_capsules_but_edges_and_evidence_not_lost():
    """Teacher whose lessons have edges+evidence but ZERO capsules.

    BUG: aggregate_teacher_graph early-returns an empty graph because no
    capsule was assembled, even though the Lesson Graph (edges + evidence) is
    already persisted in the store. The aggregated graph MUST still carry those
    edges and evidence.

    FAILS before the fix (got 0 edges / 0 evidence), PASSES after.
    """
    store = _PathStore()
    _register_path(store, "path_a", ["a1"], teacher_id="andrea")

    # Graph data exists for lesson a1, but NO capsule was assembled.
    edge = GraphEdge(
        edge_id="e1",
        source="a1:concept:0",
        target="a1:concept:1",
        edge_type="depends_on",
        metadata={},
    )
    evidence = GraphEvidence(
        evidence_id="ev1",
        edge_id="e1",
        seg_id="a1#s1",
        excerpt="il segnale dipende dalla grandezza",
        lesson_id="a1",
    )
    store.save_graph_edge("a1", edge)
    store.save_evidence(evidence)

    result = aggregate_teacher_graph(store, "andrea")

    assert result.path_id == "teacher:andrea"
    # THE BUG: with the early-return, both of these are empty tuples.
    assert len(result.existing_edges) == 1, (
        "edges in the DB were LOST by the early-return "
        f"(got {len(result.existing_edges)} edges)"
    )
    assert result.existing_edges[0].edge_id == "e1"
    assert len(result.path_evidence) == 1, (
        "evidence in the DB was LOST by the early-return "
        f"(got {len(result.path_evidence)} evidence)"
    )
    assert result.path_evidence[0].evidence_id == "ev1"


def test_path_no_capsules_but_edges_and_evidence_not_lost():
    """Twin bug at path level: aggregate_path_graph must not drop persisted
    edges/evidence when the path's lessons have no capsules."""
    store = _PathStore()
    _register_path(store, "path_a", ["a1"])  # no teacher needed for path-level

    edge = GraphEdge(
        edge_id="e9",
        source="a1:concept:0",
        target="a1:concept:1",
        edge_type="explains",
        metadata={},
    )
    evidence = GraphEvidence(
        evidence_id="ev9",
        edge_id="e9",
        seg_id="a1#s1",
        excerpt="excerpt",
        lesson_id="a1",
    )
    store.save_graph_edge("a1", edge)
    store.save_evidence(evidence)

    result = aggregate_path_graph(store, "path_a")

    assert result.path_id == "path_a"
    assert len(result.existing_edges) == 1, "path-level edges lost"
    assert len(result.path_evidence) == 1, "path-level evidence lost"


def test_teacher_truly_empty_still_returns_empty_graph():
    """Regression guard: a teacher with paths but NO edges/evidence/capsules
    still returns a valid (empty) graph — the fix must not invent data."""
    store = _PathStore()
    _register_path(store, "path_a", ["a1"], teacher_id="andrea")

    result = aggregate_teacher_graph(store, "andrea")
    assert result.path_id == "teacher:andrea"
    assert len(result.merged_nodes) == 0
    assert len(result.existing_edges) == 0
    assert len(result.path_evidence) == 0