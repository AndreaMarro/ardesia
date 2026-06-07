"""Test cross-lesson graph edges (M3-task1).

Verifies that build_path_graph creates cross-lesson 'repeats' and 'depends_on'
edges when building a path-level graph from multiple Lesson Capsules.
"""

import json

import pytest

from lessonos.capsule.assembly import assemble_lesson_capsule
from lessonos.capsule.segmentation import build_segmentation_prompt
from lessonos.capsule.extraction import build_extraction_prompt
from lessonos.graph.builder import build_path_graph
from lessonos.llm.router import MockProvider, Router
from lessonos.models.entities import EDGE_TYPES
from lessonos.store.fixture_loader import (
    ingest_lesson_moments,
    ingest_lesson_segments,
)
from lessonos.store.sqlite import SQLiteStore


def _mock_router_for_lesson(store: SQLiteStore, lesson_id: str) -> Router:
    """Create a mock router for a specific lesson with test payloads."""
    segs = ingest_lesson_segments(store, lesson_id)
    seg_prompt = build_segmentation_prompt(segs)
    ext_prompt = build_extraction_prompt(segs)

    # Define mock payloads per lesson
    if lesson_id == "l1_derivative_definition":
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
    elif lesson_id == "l2_derivative_rules":
        seg_payload = [
            {"topic": "regola della potenza", "seg_ids": ["l2s1"]},
            {"topic": "esempi derivata", "seg_ids": ["l2s2", "l2s3"]},
        ]
        ext_payload = {
            "concepts": [
                {
                    "name": "derivata",
                    "status": "reinforced",
                    "citations": [{"seg_id": "l2s1"}],
                },
                {
                    "name": "regola della potenza",
                    "status": "introduced",
                    "citations": [{"seg_id": "l2s1"}],
                },
            ],
            "exercises": [
                {
                    "prompt": "Applica la regola della potenza a f(x)=x^3",
                    "citations": [{"seg_id": "l2s2"}],
                }
            ],
            "student_questions": [],
            "homework": [],
        }
    elif lesson_id == "l3_integral_intro":
        seg_payload = [
            {"topic": "introduzione integrale", "seg_ids": ["l3s1", "l3s2"]},
            {"topic": "antiderivata", "seg_ids": ["l3s3"]},
        ]
        ext_payload = {
            "concepts": [
                {
                    "name": "antiderivata",
                    "status": "introduced",
                    "citations": [{"seg_id": "l3s3"}],
                },
                {
                    "name": "integrale",
                    "status": "introduced",
                    "prerequisites": ["derivata"],
                    "citations": [{"seg_id": "l3s1"}],
                },
            ],
            "exercises": [
                {
                    "prompt": "Trova l'integrale di f(x)=2x",
                    "citations": [{"seg_id": "l3s2"}],
                }
            ],
            "student_questions": [],
            "homework": [],
        }
    else:
        raise ValueError(f"Unknown lesson_id: {lesson_id}")

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


def test_path_graph_has_cross_lesson_repeats_edges():
    """Same concept name across lessons → 'repeats' edge."""
    store = SQLiteStore()

    # Ingest all three lessons
    l1_id = "l1_derivative_definition"
    l2_id = "l2_derivative_rules"
    l3_id = "l3_integral_intro"

    ingest_lesson_segments(store, l1_id)
    ingest_lesson_moments(store, l1_id)
    ingest_lesson_segments(store, l2_id)
    ingest_lesson_moments(store, l2_id)
    ingest_lesson_segments(store, l3_id)
    ingest_lesson_moments(store, l3_id)

    # Assemble capsules with mock routers
    router_l1 = _mock_router_for_lesson(store, l1_id)
    router_l2 = _mock_router_for_lesson(store, l2_id)
    router_l3 = _mock_router_for_lesson(store, l3_id)

    capsule_l1 = assemble_lesson_capsule(store, l1_id, router_l1)
    capsule_l2 = assemble_lesson_capsule(store, l2_id, router_l2)
    capsule_l3 = assemble_lesson_capsule(store, l3_id, router_l3)

    # Build path graph
    nodes, edges = build_path_graph([capsule_l1, capsule_l2, capsule_l3])

    # Find 'repeats' edges
    repeats_edges = [e for e in edges if e.edge_type == "repeats"]

    # Should have at least one 'repeats' edge for 'derivata' (L1 → L2)
    assert len(repeats_edges) > 0, "should have at least one 'repeats' edge"

    # Verify provenance metadata
    for edge in repeats_edges:
        assert "provenance" in edge.metadata, "repeats edge should have provenance"
        assert edge.metadata["provenance"] == "auto-suggested"
        assert "confidence" in edge.metadata
        assert edge.metadata["confidence"] == "0.7"

    # Verify that 'derivata' appears in L1 and L2
    derivata_l1 = f"{l1_id}:concept:0"  # First concept in L1
    derivata_l2 = f"{l2_id}:concept:0"  # First concept in L2

    # Should have edge from L1 derivata to L2 derivata
    derivata_repeat = next(
        (e for e in repeats_edges if e.source == derivata_l1 and e.target == derivata_l2),
        None
    )
    assert derivata_repeat is not None, "should have 'repeats' edge from L1 to L2 for derivata"

    store.close()


def test_path_graph_has_depends_on_edges():
    """Concept.prerequisites → 'depends_on' edge to prerequisite concept."""
    store = SQLiteStore()

    # Ingest all three lessons
    l1_id = "l1_derivative_definition"
    l2_id = "l2_derivative_rules"
    l3_id = "l3_integral_intro"

    ingest_lesson_segments(store, l1_id)
    ingest_lesson_moments(store, l1_id)
    ingest_lesson_segments(store, l2_id)
    ingest_lesson_moments(store, l2_id)
    ingest_lesson_segments(store, l3_id)
    ingest_lesson_moments(store, l3_id)

    # Assemble capsules
    router_l1 = _mock_router_for_lesson(store, l1_id)
    router_l2 = _mock_router_for_lesson(store, l2_id)
    router_l3 = _mock_router_for_lesson(store, l3_id)

    capsule_l1 = assemble_lesson_capsule(store, l1_id, router_l1)
    capsule_l2 = assemble_lesson_capsule(store, l2_id, router_l2)
    capsule_l3 = assemble_lesson_capsule(store, l3_id, router_l3)

    # Build path graph
    nodes, edges = build_path_graph([capsule_l1, capsule_l2, capsule_l3])

    # Find 'depends_on' edges
    depends_edges = [e for e in edges if e.edge_type == "depends_on"]

    # L3 has 'integrale' with prerequisite 'derivata'
    # Should have edge from integrale → derivata
    assert len(depends_edges) > 0, "should have at least one 'depends_on' edge"

    # Verify metadata
    for edge in depends_edges:
        assert "provenance" in edge.metadata
        assert edge.metadata["provenance"] == "auto-suggested"
        assert "confidence" in edge.metadata
        assert edge.metadata["confidence"] == "0.8"

    # integrale is second concept in L3, derivata is first concept in L1
    integrale_node = f"{l3_id}:concept:1"
    derivata_node = f"{l1_id}:concept:0"

    integrale_depends = next(
        (e for e in depends_edges if e.source == integrale_node and e.target == derivata_node),
        None
    )
    assert integrale_depends is not None, "should have 'depends_on' edge from integrale to derivata"

    store.close()


def test_path_graph_nodes_and_edges_deterministic():
    """Same capsules → same graph (deterministic IDs)."""
    store = SQLiteStore()

    l1_id = "l1_derivative_definition"
    l2_id = "l2_derivative_rules"

    ingest_lesson_segments(store, l1_id)
    ingest_lesson_moments(store, l1_id)
    ingest_lesson_segments(store, l2_id)
    ingest_lesson_moments(store, l2_id)

    router_l1 = _mock_router_for_lesson(store, l1_id)
    router_l2 = _mock_router_for_lesson(store, l2_id)

    capsule_l1 = assemble_lesson_capsule(store, l1_id, router_l1)
    capsule_l2 = assemble_lesson_capsule(store, l2_id, router_l2)

    # Build graph twice
    nodes1, edges1 = build_path_graph([capsule_l1, capsule_l2])
    nodes2, edges2 = build_path_graph([capsule_l1, capsule_l2])

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
        assert e1.metadata == e2.metadata

    store.close()


def test_path_graph_includes_per_lesson_edges():
    """Path graph includes all per-lesson 'explains' and 'assigned_in' edges."""
    store = SQLiteStore()

    l1_id = "l1_derivative_definition"
    l2_id = "l2_derivative_rules"

    ingest_lesson_segments(store, l1_id)
    ingest_lesson_moments(store, l1_id)
    ingest_lesson_segments(store, l2_id)
    ingest_lesson_moments(store, l2_id)

    router_l1 = _mock_router_for_lesson(store, l1_id)
    router_l2 = _mock_router_for_lesson(store, l2_id)

    capsule_l1 = assemble_lesson_capsule(store, l1_id, router_l1)
    capsule_l2 = assemble_lesson_capsule(store, l2_id, router_l2)

    # Build path graph
    nodes, edges = build_path_graph([capsule_l1, capsule_l2])

    # Should include 'explains' edges from each lesson
    explains_edges = [e for e in edges if e.edge_type == "explains"]

    # L1 has 2 concepts (derivata, limite)
    # L2 has 2 concepts (derivata, regola della potenza)
    # Each lesson should have 'explains' edges to its concepts
    l1_explains = [e for e in explains_edges if e.source == l1_id]
    l2_explains = [e for e in explains_edges if e.source == l2_id]

    assert len(l1_explains) == 2, "L1 should explain 2 concepts"
    assert len(l2_explains) == 2, "L2 should explain 2 concepts"

    # Should include 'assigned_in' edges from each lesson
    assigned_edges = [e for e in edges if e.edge_type == "assigned_in"]

    # L1 has 1 exercise, L2 has 1 exercise
    l1_assigned = [e for e in assigned_edges if e.source == l1_id]
    l2_assigned = [e for e in assigned_edges if e.source == l2_id]

    assert len(l1_assigned) == 1, "L1 should have 1 assigned_in edge"
    assert len(l2_assigned) == 1, "L2 should have 1 assigned_in edge"

    # All edge types should be valid
    for edge in edges:
        assert edge.edge_type in EDGE_TYPES

    store.close()
