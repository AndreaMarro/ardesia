"""Test Lesson Graph queries (lessonos/graph/queries.py, M3).

Verifies that the query module can navigate the path-level Lesson Graph
built from the 3-lesson fixture.
"""

import json

import pytest

from lessonos.capsule.assembly import assemble_lesson_capsule
from lessonos.capsule.extraction import build_extraction_prompt
from lessonos.capsule.segmentation import build_segmentation_prompt
from lessonos.graph.builder import build_path_graph
from lessonos.graph.queries import (
    all_prerequisites_deep,
    build_networkx_graph,
    find_concept,
    lesson_of_concept,
    prerequisites_of,
    topological_concepts,
    where_introduced,
    where_reinforced,
)
from lessonos.llm.router import MockProvider, Router
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

    if lesson_id == "l1_derivative_definition":
        seg_payload = [
            {"topic": "definizione derivata", "seg_ids": ["l1s1", "l1s2"]},
            {"topic": "limite del rapporto incrementale", "seg_ids": ["l1s3"]},
        ]
        ext_payload = {
            "concepts": [
                {"name": "derivata", "status": "introduced", "citations": [{"seg_id": "l1s1"}]},
                {"name": "limite", "status": "introduced", "citations": [{"seg_id": "l1s3"}]},
            ],
            "exercises": [
                {"prompt": "Calcola f'(x) per f(x)=x^2", "citations": [{"seg_id": "l1s2"}]},
            ],
            "student_questions": [
                {"question": "Cosa succede se h=0?", "citations": [{"seg_id": "l1s2"}]},
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
                {"name": "derivata", "status": "reinforced", "citations": [{"seg_id": "l2s1"}]},
                {"name": "regola della potenza", "status": "introduced", "citations": [{"seg_id": "l2s1"}]},
            ],
            "exercises": [
                {"prompt": "Applica la regola della potenza a f(x)=x^3", "citations": [{"seg_id": "l2s2"}]},
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
                {"name": "antiderivata", "status": "introduced", "citations": [{"seg_id": "l3s3"}]},
                {
                    "name": "integrale",
                    "status": "introduced",
                    "prerequisites": ["derivata"],
                    "citations": [{"seg_id": "l3s1"}],
                },
            ],
            "exercises": [
                {"prompt": "Trova l'integrale di f(x)=2x", "citations": [{"seg_id": "l3s2"}]},
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


@pytest.fixture
def path_graph_and_store():
    """Build a complete path-level graph from the 3-lesson fixture.

    Returns (nx_graph, nodes, edges, store) for query testing.
    """
    store = SQLiteStore()
    l1, l2, l3 = "l1_derivative_definition", "l2_derivative_rules", "l3_integral_intro"

    ingest_lesson_segments(store, l1)
    ingest_lesson_moments(store, l1)
    ingest_lesson_segments(store, l2)
    ingest_lesson_moments(store, l2)
    ingest_lesson_segments(store, l3)
    ingest_lesson_moments(store, l3)

    capsules = [
        assemble_lesson_capsule(store, l1, _mock_router_for_lesson(store, l1)),
        assemble_lesson_capsule(store, l2, _mock_router_for_lesson(store, l2)),
        assemble_lesson_capsule(store, l3, _mock_router_for_lesson(store, l3)),
    ]

    nodes, edges = build_path_graph(capsules)
    G = build_networkx_graph(nodes, edges)
    yield G, nodes, edges, store
    store.close()


# --- find_concept ---


def test_find_concept_by_name(path_graph_and_store):
    """find_concept returns all node IDs for a matching concept name."""
    G, _, _, _ = path_graph_and_store

    # "derivata" appears in L1 (introduced) and L2 (reinforced)
    derivata_nodes = find_concept(G, "derivata")
    assert len(derivata_nodes) == 2, "derivata should appear in 2 lessons"
    lesson_ids = {node.split(":")[0] for node in derivata_nodes}
    assert "l1_derivative_definition" in lesson_ids
    assert "l2_derivative_rules" in lesson_ids

    # Case-insensitive
    assert find_concept(G, "DERIVATA") == derivata_nodes

    # Concept that appears once
    integrale_nodes = find_concept(G, "integrale")
    assert len(integrale_nodes) == 1

    # Non-existent concept
    assert find_concept(G, "non_existent_concept") == []


# --- lesson_of_concept ---


def test_lesson_of_concept(path_graph_and_store):
    """lesson_of_concept returns the lesson that explains a concept node."""
    G, _, _, _ = path_graph_and_store

    derivata_nodes = find_concept(G, "derivata")
    assert len(derivata_nodes) == 2

    # The first derivata node should be explained by L1
    first_lesson = lesson_of_concept(G, derivata_nodes[0])
    assert first_lesson == "l1_derivative_definition"

    if len(derivata_nodes) > 1:
        second_lesson = lesson_of_concept(G, derivata_nodes[1])
        assert second_lesson == "l2_derivative_rules"

    # Non-existent node
    assert lesson_of_concept(G, "nonexistent") is None


# --- where_introduced ---


def test_where_introduced(path_graph_and_store):
    """where_introduced returns the first lesson for a concept."""
    G, _, _, _ = path_graph_and_store

    # Derivata is introduced in L1
    assert where_introduced(G, "derivata") == "l1_derivative_definition"

    # Regola della potenza is introduced in L2
    assert where_introduced(G, "regola della potenza") == "l2_derivative_rules"

    # Non-existent concept
    assert where_introduced(G, "non_existent") is None


# --- where_reinforced ---


def test_where_reinforced(path_graph_and_store):
    """where_reinforced returns lessons AFTER introduction that reinforce a concept."""
    G, _, _, _ = path_graph_and_store

    # Derivata is introduced in L1, reinforced in L2
    reinforced = where_reinforced(G, "derivata")
    assert len(reinforced) == 1
    assert reinforced[0] == "l2_derivative_rules"

    # Limite is only in L1, never reinforced
    assert where_reinforced(G, "limite") == []

    # Integrale is only in L3
    assert where_reinforced(G, "integrale") == []


# --- prerequisites_of ---


def test_prerequisites_of(path_graph_and_store):
    """prerequisites_of returns direct prerequisites of a concept."""
    G, _, _, _ = path_graph_and_store

    # Integrale has prerequisite 'derivata'
    prereqs = prerequisites_of(G, "integrale")
    assert "derivata" in prereqs, "integrale should depend on derivata"
    assert len(prereqs) == 1, "integrale has exactly one prerequisite"

    # Derivata has no prerequisites in the mock data
    assert prerequisites_of(G, "derivata") == []

    # Non-existent concept
    assert prerequisites_of(G, "non_existent") == []


# --- all_prerequisites_deep ---


def test_all_prerequisites_deep(path_graph_and_store):
    """all_prerequisites_deep returns transitive prerequisites."""
    G, _, _, _ = path_graph_and_store

    # Integrale depends on derivata, which has no further prerequisites
    deep = all_prerequisites_deep(G, "integrale")
    assert "derivata" in deep, "integrale should transitively depend on derivata"

    # Non-existent concept
    assert all_prerequisites_deep(G, "non_existent") == []


# --- topological_concepts ---


def test_topological_concepts(path_graph_and_store):
    """topological_concepts returns concepts in prerequisite-first order."""
    G, _, _, _ = path_graph_and_store

    concepts = topological_concepts(G)
    assert len(concepts) == 5
    # The order should have foundational concepts first
    # 'derivata' and 'limite' should appear before 'integrale' (which depends on derivata)
    if "integrale" in concepts:
        # Check that at least one prerequisite appears before 'integrale'
        integrale_idx = concepts.index("integrale")
        derivata_idx = concepts.index("derivata")
        assert derivata_idx < integrale_idx, "derivata must appear before integrale in topological order"

    # No duplicates
    assert len(concepts) == len(set(concepts))


# --- build_networkx_graph ---


def test_build_networkx_graph_preserves_attributes(path_graph_and_store):
    """build_networkx_graph preserves node_type and label attributes."""
    G, _, _, _ = path_graph_and_store

    # Check a concept node
    for node_id, data in G.nodes(data=True):
        assert "node_type" in data, "every node should have node_type"
        if data["node_type"] == "concept":
            assert "label" in data, "concept nodes should have a label"
        break

    # Check an edge
    for u, v, data in G.edges(data=True):
        assert "edge_type" in data, "every edge should have edge_type"
        break


def test_build_networkx_graph_dag_property(path_graph_and_store):
    """The networkx graph should be acyclic (DAG property from builder)."""
    import networkx as nx

    G, _, _, _ = path_graph_and_store
    assert nx.is_directed_acyclic_graph(G), "Lesson Graph must be a DAG"
