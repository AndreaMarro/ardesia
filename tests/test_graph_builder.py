"""Test Lesson Graph builder (lessonos/graph/builder.py, M3-task1).

Verifies that build_lesson_graph extracts nodes (lesson, concepts, exercises)
and edges (explains, assigned_in) from a grounded Lesson Capsule.
"""

import json

import pytest

from lessonos.capsule.assembly import assemble_lesson_capsule
from lessonos.capsule.extraction import build_extraction_prompt
from lessonos.capsule.segmentation import build_segmentation_prompt
from lessonos.graph.builder import build_lesson_graph
from lessonos.llm.router import MockProvider, Router
from lessonos.models.entities import EDGE_TYPES
from lessonos.store.fixture_loader import (
    ingest_lesson_moments,
    ingest_lesson_segments,
)
from lessonos.store.sqlite import SQLiteStore

L1 = "l1_derivative_definition"


def _mock_router() -> Router:
    """Create a mock router that returns realistic payloads for L1."""
    store = SQLiteStore()
    segs = ingest_lesson_segments(store, L1)
    seg_prompt = build_segmentation_prompt(segs)
    ext_prompt = build_extraction_prompt(segs)
    store.close()

    seg_payload = [
        {"topic": "definizione derivata", "seg_ids": ["l1s1", "l1s2"]},
        {"topic": "limite del rapporto incrementale", "seg_ids": ["l1s3"]},
    ]
    ext_payload = {
        "concepts": [
            {
                "name": "derivata",
                "status": "introduced",
                "citations": [{"seg_id": "l1s1"}],
            },
            {
                "name": "limite",
                "status": "introduced",
                "citations": [{"seg_id": "l1s3"}],
            },
        ],
        "exercises": [
            {
                "prompt": "Calcola f'(x) per f(x)=x^2",
                "citations": [{"seg_id": "l1s2"}],
            }
        ],
        "student_questions": [
            {"question": "Cosa succede se h=0?", "citations": [{"seg_id": "l1s2"}]}
        ],
        "homework": [{"task": "Esercizi 1-3", "citations": [{"seg_id": "l1s3"}]}],
    }

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


def test_build_lesson_graph_creates_nodes_and_edges():
    """Build graph from a real capsule: nodes + edges exist and are valid."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    ingest_lesson_moments(store, L1)

    router = _mock_router()
    capsule = assemble_lesson_capsule(store, L1, router)

    # Build graph
    nodes, edges = build_lesson_graph(capsule)

    # Should have: 1 lesson node + N concept nodes + M exercise nodes
    assert len(nodes) > 0, "should create at least the lesson node"

    lesson_nodes = [n for n in nodes if n.node_type == "lesson"]
    concept_nodes = [n for n in nodes if n.node_type == "concept"]
    exercise_nodes = [n for n in nodes if n.node_type == "exercise"]

    assert len(lesson_nodes) == 1, "should have exactly one lesson node"
    assert lesson_nodes[0].node_id == L1
    assert lesson_nodes[0].ref_id == L1

    # Concepts from the mock fixture (2 concepts: derivata, limite)
    assert len(concept_nodes) == 2, "should have 2 concept nodes from the capsule"
    for i, node in enumerate(concept_nodes):
        assert node.node_id == f"{L1}:concept:{i}"
        assert node.node_type == "concept"
        assert node.label is not None, "concept nodes should have a label (name)"

    # Exercises from the mock fixture (1 exercise)
    assert len(exercise_nodes) == 1, "should have 1 exercise node from the capsule"
    for i, node in enumerate(exercise_nodes):
        assert node.node_id == f"{L1}:exercise:{i}"
        assert node.node_type == "exercise"

    # Edges: "explains" from lesson to concepts, "assigned_in" from lesson to exercises
    assert len(edges) > 0, "should create edges"

    explains_edges = [e for e in edges if e.edge_type == "explains"]
    assigned_edges = [e for e in edges if e.edge_type == "assigned_in"]

    assert len(explains_edges) == len(
        concept_nodes
    ), "one 'explains' edge per concept"
    assert len(assigned_edges) == len(
        exercise_nodes
    ), "one 'assigned_in' edge per exercise"

    for edge in edges:
        # All edge_type should be valid (GraphEdge.__post_init__ validates)
        assert edge.edge_type in EDGE_TYPES, f"invalid edge_type: {edge.edge_type}"
        # Edge IDs are deterministic
        assert "-" in edge.edge_id, "edge_id should be <source>-<type>-><target>"

    store.close()


def test_build_lesson_graph_node_ids_deterministic():
    """Node and edge IDs are deterministic (same capsule → same IDs)."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    ingest_lesson_moments(store, L1)

    router = _mock_router()
    capsule = assemble_lesson_capsule(store, L1, router)

    # Build graph twice
    nodes1, edges1 = build_lesson_graph(capsule)
    nodes2, edges2 = build_lesson_graph(capsule)

    # Should be identical
    assert len(nodes1) == len(nodes2)
    assert len(edges1) == len(edges2)

    for n1, n2 in zip(nodes1, nodes2):
        assert n1.node_id == n2.node_id
        assert n1.node_type == n2.node_type
        assert n1.ref_id == n2.ref_id
        assert n1.label == n2.label

    for e1, e2 in zip(edges1, edges2):
        assert e1.edge_id == e2.edge_id
        assert e1.source == e2.source
        assert e1.target == e2.target
        assert e1.edge_type == e2.edge_type

    store.close()


def test_build_lesson_graph_edge_types_validated():
    """All created edges have valid edge_type ∈ EDGE_TYPES."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    ingest_lesson_moments(store, L1)

    router = _mock_router()
    capsule = assemble_lesson_capsule(store, L1, router)

    nodes, edges = build_lesson_graph(capsule)

    # Every edge should have a valid edge_type (GraphEdge validates in __post_init__)
    for edge in edges:
        assert edge.edge_type in EDGE_TYPES

    # The builder creates only "explains" and "assigned_in" for now
    edge_types_used = {e.edge_type for e in edges}
    assert edge_types_used <= {"explains", "assigned_in"}

    store.close()
