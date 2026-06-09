"""Test cross-fixture Lesson Graph: calculus + spaced repetition domains.

Verifies that build_path_graph across independent domains:
1. Does not create false cross-edges (no repeats/depends_on between
   calculus concepts and spaced-repetition concepts — they don't overlap)
2. Includes nodes/edges from both domains
3. Passes DAG validation (no cycles even when combining domains)
4. Ensures domain isolation: concept overlap == 0

Hypothesis: build_path_graph on capsules from independent domains
produces zero cross-edges because concept names don't match.
"""
import json
from pathlib import Path

from lessonos.capsule.assembly import assemble_lesson_capsule
from lessonos.capsule.extraction import build_extraction_prompt
from lessonos.capsule.segmentation import build_segmentation_prompt
from lessonos.graph.builder import build_path_graph
from lessonos.graph.queries import build_networkx_graph
from lessonos.llm.router import MockProvider, Router
from lessonos.store.fixture_loader import (
    DEFAULT_FIXTURE_ROOT,
    ingest_lesson_moments,
    ingest_lesson_segments,
)
from lessonos.store.sqlite import SQLiteStore

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

SPACED_FIXTURE_ROOT = (
    Path(__file__).resolve().parents[1] / "fixtures" / "spaced_path"
)

SAMPLE_LESSONS = [
    "l1_derivative_definition",
    "l2_derivative_rules",
    "l3_integral_intro",
]


def _mock_router_for_sample_lesson(store, lesson_id):
    """Mock router for a sample_path (calculus) lesson.

    Matches the pattern from test_graph_cross_lesson.py.
    """
    segs = ingest_lesson_segments(store, lesson_id, DEFAULT_FIXTURE_ROOT)
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
                {"prompt": "Calcola f'(x) per f(x)=x^2", "citations": [{"seg_id": "l1s2"}]}
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
                {"name": "derivata", "status": "reinforced", "citations": [{"seg_id": "l2s1"}]},
                {"name": "regola della potenza", "status": "introduced", "citations": [{"seg_id": "l2s1"}]},
            ],
            "exercises": [
                {"prompt": "Applica la regola della potenza a f(x)=x^3", "citations": [{"seg_id": "l2s2"}]}
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
                    "name": "integrale", "status": "introduced",
                    "prerequisites": ["derivata"],
                    "citations": [{"seg_id": "l3s1"}],
                },
            ],
            "exercises": [
                {"prompt": "Trova l'integrale di f(x)=2x", "citations": [{"seg_id": "l3s2"}]}
            ],
            "student_questions": [],
            "homework": [],
        }
    else:
        raise ValueError(f"Unknown sample lesson_id: {lesson_id}")

    router = Router()
    router.register(MockProvider({seg_prompt: json.dumps(seg_payload), ext_prompt: json.dumps(ext_payload)}))
    return router


def _mock_router_for_spaced_lesson(store, lesson_id):
    """Mock router for spaced_path lesson (SM-2 / spaced repetition domain).

    Completely independent domain from sample_path calculus.
    """
    segs = ingest_lesson_segments(store, lesson_id, SPACED_FIXTURE_ROOT)
    seg_prompt = build_segmentation_prompt(segs)
    ext_prompt = build_extraction_prompt(segs)

    if lesson_id == "l1_sm2_intro":
        seg_payload = [
            {"topic": "ripetizione spaziata", "seg_ids": ["l1s1"]},
            {"topic": "SM-2 qualita e EF", "seg_ids": ["l1s2"]},
            {"topic": "calcolo intervallo SM-2", "seg_ids": ["l1s3"]},
        ]
        ext_payload = {
            "concepts": [
                {"name": "ripetizione spaziata", "status": "introduced", "citations": [{"seg_id": "l1s1"}]},
                {"name": "SM-2", "status": "introduced", "citations": [{"seg_id": "l1s2"}]},
                {"name": "fattore di facilita", "status": "introduced", "citations": [{"seg_id": "l1s2"}]},
            ],
            "exercises": [
                {"prompt": "Calcola EF' per q=4 e EF=2.5", "citations": [{"seg_id": "l1s3"}]}
            ],
            "student_questions": [],
            "homework": [],
        }
    else:
        raise ValueError(f"Unknown spaced lesson_id: {lesson_id}")

    router = Router()
    router.register(MockProvider({seg_prompt: json.dumps(seg_payload), ext_prompt: json.dumps(ext_payload)}))
    return router


# ===================================================================
# Tests
# ===================================================================


class TestCrossFixtureGraph:
    """build_path_graph across independent domains (calculus + spaced repetition)."""

    def _build_cross_fixture_graph(self):
        """Build and return (nodes, edges) for calculus + spaced capsules."""
        store = SQLiteStore()

        # Assemble capsules — each mock router does its own ingest
        capsules = []
        for lid in SAMPLE_LESSONS:
            router = _mock_router_for_sample_lesson(store, lid)
            capsules.append(assemble_lesson_capsule(store, lid, router))

        spaced_router = _mock_router_for_spaced_lesson(store, "l1_sm2_intro")
        capsules.append(assemble_lesson_capsule(store, "l1_sm2_intro", spaced_router))

        nodes, edges = build_path_graph(capsules)
        store.close()
        return nodes, edges

    def test_nodes_include_both_domains(self):
        """Graph nodes include both calculus and spaced repetition lessons."""
        nodes, _ = self._build_cross_fixture_graph()
        node_ids = {n.node_id for n in nodes}

        # Calculus lessons
        assert "l1_derivative_definition" in node_ids
        assert "l2_derivative_rules" in node_ids
        assert "l3_integral_intro" in node_ids

        # Spaced repetition lesson
        assert "l1_sm2_intro" in node_ids

        # Calculus concepts
        assert "l1_derivative_definition:concept:0" in node_ids  # derivata
        assert "l1_derivative_definition:concept:1" in node_ids  # limite

        # Spaced concepts
        assert "l1_sm2_intro:concept:0" in node_ids  # ripetizione spaziata
        assert "l1_sm2_intro:concept:1" in node_ids  # SM-2
        assert "l1_sm2_intro:concept:2" in node_ids  # fattore di facilita

    def test_zero_cross_domain_repeats_edges(self):
        """No 'repeats' edges between calculus and spaced repetition concepts.

        Concept names are domain-independent: 'derivata', 'limite', 'integrale',
        'antiderivata', 'regola della potenza' (calculus) vs 'ripetizione spaziata',
        'SM-2', 'fattore di facilita' (spaced repetition).
        """
        _, edges = self._build_cross_fixture_graph()
        repeats = [e for e in edges if e.edge_type == "repeats"]

        # All repeats edges should be WITHIN the same domain:
        # - 'derivata' repeats l1->l2 (calculus only)
        # - No concept from spaced_path should repeat with calculus
        for edge in repeats:
            # Both source and target should be calculus lessons
            assert "sm2" not in edge.source and "sm2" not in edge.target, (
                f"Cross-domain repeats edge: {edge.edge_id}"
            )

    def test_zero_cross_domain_depends_on_edges(self):
        """No 'depends_on' edges between calculus and spaced repetition concepts.

        Calculus concepts have prerequisites only within calculus domain.
        Spaced repetition concepts have no prerequisites in this fixture.
        """
        _, edges = self._build_cross_fixture_graph()
        depends = [e for e in edges if e.edge_type == "depends_on"]

        # All depends_on edges should be within calculus domain
        for edge in depends:
            assert "sm2" not in edge.source and "sm2" not in edge.target, (
                f"Cross-domain depends_on edge: {edge.edge_id}"
            )

    def test_dag_validation_passes(self):
        """Combined graph from both domains is still acyclic."""
        nodes, edges = self._build_cross_fixture_graph()
        G = build_networkx_graph(nodes, edges)

        import networkx as nx
        assert nx.is_directed_acyclic_graph(G), "Combined graph has cycles"

    def test_concept_label_overlap_zero(self):
        """Calculus and spaced repetition concept labels do NOT overlap.

        This is a ground-truth invariant of the fixtures: calculus concepts
        are math terms, spaced concepts are learning-science terms.
        """
        calculus_labels = {
            "derivata", "limite", "regola della potenza",
            "antiderivata", "integrale",
        }
        spaced_labels = {
            "ripetizione spaziata", "SM-2", "fattore di facilita",
        }
        assert calculus_labels.isdisjoint(spaced_labels), (
            "Fixture concept overlap detected — domain isolation violated"
        )

    def test_repeats_only_within_calculus_derivata(self):
        """'derivata' repeats l1->l2 — the only cross-lesson repeats within calculus.

        No other concept repeats across calculus lessons.
        Only 'derivata' appears in both l1 and l2.
        """
        _, edges = self._build_cross_fixture_graph()
        repeats = [e for e in edges if e.edge_type == "repeats"]

        # 'derivata' repeat: l1:concept:0 -> l2:concept:0
        derivata_repeat = next(
            (e for e in repeats
             if e.source == "l1_derivative_definition:concept:0"
             and e.target == "l2_derivative_rules:concept:0"),
            None
        )
        assert derivata_repeat is not None, (
            "Missing 'derivata' repeats edge l1->l2"
        )

        # No other repeats — only 'derivata' appears in >1 lesson
        assert len(repeats) == 1, (
            f"Expected exactly 1 repeats edge (derivata), got {len(repeats)}"
        )

    def test_depends_on_only_integrale_derivata(self):
        """'integrale' depends on 'derivata' — the only depends_on edge.

        No other cross-lesson depends_on edges exist in these fixtures.
        """
        _, edges = self._build_cross_fixture_graph()
        depends = [e for e in edges if e.edge_type == "depends_on"]

        # integrale (l3:concept:1) depends on derivata (l1:concept:0)
        integrale_depends = next(
            (e for e in depends
             if e.source == "l3_integral_intro:concept:1"
             and e.target == "l1_derivative_definition:concept:0"),
            None
        )
        assert integrale_depends is not None, (
            "Missing 'integrale depends_on derivata' edge"
        )

        # No other depends_on edges
        assert len(depends) == 1, (
            f"Expected exactly 1 depends_on edge, got {len(depends)}"
        )

    def test_node_count_includes_all_domains(self):
        """Total node count = 4 lesson nodes + (2+2+2 calculus concepts) + (2+3 spaced concepts)."""
        nodes, _ = self._build_cross_fixture_graph()
        lesson_nodes = [n for n in nodes if n.node_type == "lesson"]
        concept_nodes = [n for n in nodes if n.node_type == "concept"]
        exercise_nodes = [n for n in nodes if n.node_type == "exercise"]

        # 4 lessons (3 calculus + 1 spaced)
        assert len(lesson_nodes) == 4

        # 5 calculus concepts (derivata, limite, regola della potenza,
        #   antiderivata, integrale)
        # 3 spaced concepts (ripetizione spaziata, SM-2, fattore di facilita)
        # Note: 'derivata' appears in both l1 and l2 = 2 concept nodes
        # Total: 6 calculus (2+2+2) + 3 spaced = 9
        assert len(concept_nodes) == 9, (
            f"Expected 9 concept nodes (6 calculus + 3 spaced), got {len(concept_nodes)}"
        )

        # 4 exercises (l1=1, l2=1, l3=1, spaced=1)
        assert len(exercise_nodes) == 4, (
            f"Expected 4 exercise nodes, got {len(exercise_nodes)}"
        )

    def test_combined_graph_properties(self):
        """Combined graph has expected edge types from both domains."""
        nodes, edges = self._build_cross_fixture_graph()
        G = build_networkx_graph(nodes, edges)

        # Edges per type
        edge_types = {}
        for _, _, data in G.edges(data=True):
            et = data["edge_type"]
            edge_types[et] = edge_types.get(et, 0) + 1

        # 9 explains edges (2 l1 + 2 l2 + 2 l3 + 3 spaced = 9)
        assert edge_types.get("explains", 0) == 9, (
            f"Expected 9 explains edges, got {edge_types.get('explains', 0)}"
        )

        # 4 assigned_in edges (1 per exercise: l1+l2+l3+spaced)
        assert edge_types.get("assigned_in", 0) == 4

        # 1 repeats edge (derivata l1->l2)
        assert edge_types.get("repeats", 0) == 1

        # 1 depends_on edge (integrale -> derivata)
        assert edge_types.get("depends_on", 0) == 1

        # Total edges
        total_edges = sum(edge_types.values())
        assert total_edges == 15, (
            f"Expected 15 edges (9 explains + 4 assigned_in + 1 repeats + 1 depends_on), "
            f"got {total_edges}"
        )
