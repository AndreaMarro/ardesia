"""Tests for Lesson Graph construction (build_lesson_graph, build_path_graph) and queries.

These test the cross-lesson graph builder (M3) that was previously orphaned —
untested and unwired. Tests cover:
  - build_lesson_graph: per-lesson nodes/edges (lesson, concept, exercise + explains, assigned_in)
  - build_path_graph: cross-lesson edges (repeats, depends_on) + DAG validation
  - queries: find_concept, where_introduced, where_reinforced, prerequisites_of,
    all_prerequisites_deep, topological_concepts
"""

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import (
    Citation,
    ConceptExtraction,
    ExerciseExtraction,
    HomeworkExtraction,
    LessonContent,
    QuestionExtraction,
)
from lessonos.capsule.segmentation import TopicSpan
from lessonos.graph.builder import build_lesson_graph, build_path_graph
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
from lessonos.models.entities import EDGE_TYPES, GraphEdge, GraphNode

# ---------------------------------------------------------------------------
# Helpers: build minimal LessonCapsules for testing
# ---------------------------------------------------------------------------


def _make_capsule(
    lesson_id: str,
    concepts: list[dict],
    exercises: list[str] | None = None,
    topics: list[str] | None = None,
) -> LessonCapsule:
    """Build a minimal LessonCapsule for graph testing."""
    content = LessonContent(
        lesson_id=lesson_id,
        concepts=tuple(
            ConceptExtraction(
                name=c["name"],
                status=c.get("status", "introduced"),
                prerequisites=tuple(c.get("prerequisites", [])),
                citations=(
                    Citation(seg_id=lesson_id + "s1"),
                ),
            )
            for c in concepts
        ),
        exercises=tuple(
            ExerciseExtraction(
                prompt=ex if isinstance(ex, str) else ex["prompt"],
                solution=ex.get("solution") if isinstance(ex, dict) else None,
                citations=(Citation(seg_id=lesson_id + "s1"),),
            )
            for ex in (exercises or [])
        ),
        student_questions=(),
        homework=(),
    )
    if topics is None:
        topics = ["Topic 1"]
    timeline = tuple(
        TopicSpan(
            lesson_id=lesson_id, topic=t, seg_ids=(lesson_id + "s1",), start=0, end=30
        )
        for t in topics
    )
    return LessonCapsule(
        lesson_id=lesson_id,
        timeline=timeline,
        content=content,
    )


# ===================================================================
# build_lesson_graph
# ===================================================================


class TestBuildLessonGraph:
    def test_single_concept_produces_lesson_and_concept_nodes(self):
        """A lesson with 1 concept gets a lesson node + 1 concept node + explains edge."""
        capsule = _make_capsule("l1", [{"name": "Derivative"}])
        nodes, edges = build_lesson_graph(capsule)
        node_ids = {n.node_id for n in nodes}
        assert "l1" in node_ids  # lesson node
        assert "l1:concept:0" in node_ids  # concept node
        assert len(nodes) == 2  # lesson + concept

    def test_exercise_adds_exercise_node_and_assigned_in_edge(self):
        """An exercise creates an exercise node + 'assigned_in' edge from lesson."""
        capsule = _make_capsule(
            "l1", [{"name": "Derivative"}], exercises=["Solve f'(x) = 2x"]
        )
        nodes, edges = build_lesson_graph(capsule)
        node_ids = {n.node_id for n in nodes}
        assert "l1:exercise:0" in node_ids
        edge_ids = {e.edge_id for e in edges}
        expected = "l1-assigned_in->l1:exercise:0"
        assert expected in edge_ids

    def test_explains_edge_from_lesson_to_each_concept(self):
        """Each concept gets an 'explains' edge from the lesson."""
        capsule = _make_capsule(
            "l1",
            [{"name": "Derivative"}, {"name": "Limit"}],
        )
        _, edges = build_lesson_graph(capsule)
        explains_edges = [
            e
            for e in edges
            if e.edge_type == "explains"
            and e.source == "l1"
        ]
        assert len(explains_edges) == 2
        targets = {e.target for e in explains_edges}
        assert "l1:concept:0" in targets
        assert "l1:concept:1" in targets

    def test_node_has_correct_label_from_concept_name(self):
        """The concept node carries the concept name as its label."""
        capsule = _make_capsule("l1", [{"name": "Derivative"}])
        nodes, _ = build_lesson_graph(capsule)
        concept_node = next(n for n in nodes if n.node_type == "concept")
        assert concept_node.label == "Derivative"

    def test_lesson_node_type_is_lesson(self):
        """The lesson node has node_type='lesson'."""
        capsule = _make_capsule("l1", [{"name": "Derivative"}])
        nodes, _ = build_lesson_graph(capsule)
        lesson_node = next(n for n in nodes if n.node_type == "lesson")
        assert lesson_node.node_id == "l1"
        assert lesson_node.ref_id == "l1"

    def test_edge_ids_are_deterministic(self):
        """Same input produces identical node/edge IDs."""
        caps1 = _make_capsule("l1", [{"name": "Derivative"}])
        caps2 = _make_capsule("l1", [{"name": "Derivative"}])
        n1, e1 = build_lesson_graph(caps1)
        n2, e2 = build_lesson_graph(caps2)
        assert n1 == n2
        assert e1 == e2

    def test_edge_types_are_valid_against_EDGE_TYPES(self):
        """All edge_type values must be in the EDGE_TYPES vocabulary."""
        capsule = _make_capsule(
            "l1",
            [{"name": "Derivative"}],
            exercises=["Problem 1"],
        )
        _, edges = build_lesson_graph(capsule)
        for e in edges:
            assert e.edge_type in EDGE_TYPES, f"Invalid edge_type: {e.edge_type}"


# ===================================================================
# build_path_graph
# ===================================================================


class TestBuildPathGraph:
    def test_two_lessons_produce_combined_nodes(self):
        """Two lessons produce combined nodes from both."""
        capsule1 = _make_capsule("l1", [{"name": "Derivative"}])
        capsule2 = _make_capsule("l2", [{"name": "Integral"}])
        nodes, edges = build_path_graph([capsule1, capsule2])
        node_ids = {n.node_id for n in nodes}
        assert "l1" in node_ids
        assert "l2" in node_ids
        assert "l1:concept:0" in node_ids
        assert "l2:concept:0" in node_ids

    def test_repeats_edge_when_concept_in_both_lessons(self):
        """Same concept in both lessons creates a 'repeats' edge."""
        capsule1 = _make_capsule("l1", [{"name": "Derivative"}])
        capsule2 = _make_capsule("l2", [{"name": "Derivative"}])
        _, edges = build_path_graph([capsule1, capsule2])
        repeats = [e for e in edges if e.edge_type == "repeats"]
        assert len(repeats) == 1
        # Edge from l1:concept:0 to l2:concept:0
        expected = "l1:concept:0-repeats->l2:concept:0"
        edge_ids = {e.edge_id for e in edges}
        assert expected in edge_ids

    def test_repeats_edge_has_auto_suggested_provenance(self):
        """'repeats' edges carry provenance metadata."""
        capsule1 = _make_capsule("l1", [{"name": "Derivative"}])
        capsule2 = _make_capsule("l2", [{"name": "Derivative"}])
        _, edges = build_path_graph([capsule1, capsule2])
        repeats = [e for e in edges if e.edge_type == "repeats"]
        assert len(repeats) == 1
        assert repeats[0].metadata == {
            "provenance": "auto-suggested",
            "confidence": "0.7",
        }

    def test_depends_on_edge_from_concept_to_prerequisite(self):
        """A concept with prerequisites gets a 'depends_on' edge to its prereq node."""
        # l1 introduces "Derivative", l2 introduces "Integral" depending on "Derivative"
        capsule1 = _make_capsule("l1", [{"name": "Derivative"}])
        capsule2 = _make_capsule(
            "l2",
            [{"name": "Integral", "prerequisites": ["Derivative"]}],
        )
        _, edges = build_path_graph([capsule1, capsule2])
        depends_on = [e for e in edges if e.edge_type == "depends_on"]
        assert len(depends_on) == 1
        # Integral depends on Derivative: l2:concept:0-depends_on->l1:concept:0
        expected = "l2:concept:0-depends_on->l1:concept:0"
        edge_ids = {e.edge_id for e in edges}
        assert expected in edge_ids

    def test_depends_on_has_auto_suggested_provenance(self):
        """'depends_on' edges carry provenance metadata."""
        capsule1 = _make_capsule("l1", [{"name": "Derivative"}])
        capsule2 = _make_capsule(
            "l2",
            [{"name": "Integral", "prerequisites": ["Derivative"]}],
        )
        _, edges = build_path_graph([capsule1, capsule2])
        depends_on = [e for e in edges if e.edge_type == "depends_on"]
        assert len(depends_on) == 1
        assert depends_on[0].metadata == {
            "provenance": "auto-suggested",
            "confidence": "0.8",
        }

    def test_mutual_prerequisites_kept_acyclic_no_raise(self):
        """Mutual prereqs are kept acyclic by dropping the cycle-closing edge.

        Previously a cycle aborted build_path_graph with ValueError. With
        denser (canonical) prereq matching that crash would fire on realistic
        multi-lesson data, so the builder now drops the edge that would close
        a cycle and keeps the graph a DAG instead of raising.
        """
        import networkx as nx

        # l1: A depends_on B, l2: B depends_on A — would form a 2-cycle.
        capsule1 = _make_capsule(
            "l1",
            [{"name": "A", "prerequisites": ["B"]}],
        )
        capsule2 = _make_capsule(
            "l2",
            [{"name": "B", "prerequisites": ["A"]}],
        )
        _nodes, edges = build_path_graph([capsule1, capsule2])

        depends = [e for e in edges if e.edge_type == "depends_on"]
        # Exactly one of the two mutual edges survives (first seen wins).
        assert len(depends) == 1
        assert depends[0].source == "l1:concept:0"
        assert depends[0].target == "l2:concept:0"

        # The resulting graph is a valid DAG.
        G = nx.DiGraph()
        for e in edges:
            G.add_edge(e.source, e.target)
        assert nx.is_directed_acyclic_graph(G)

    def test_no_duplicate_edges(self):
        """Same edge is not added twice."""
        capsule1 = _make_capsule("l1", [{"name": "Derivative"}])
        capsule2 = _make_capsule("l2", [{"name": "Derivative"}])
        _, edges = build_path_graph([capsule1, capsule2])
        edge_ids = [e.edge_id for e in edges]
        assert len(edge_ids) == len(set(edge_ids)), "Duplicate edge IDs found"

    def test_full_path_three_lessons_cross_links(self):
        """Three-lesson path: cross-lesson repeats + depends_on edges."""
        capsule1 = _make_capsule(
            "l1",
            [{"name": "Derivative"}, {"name": "Limit"}],
        )
        capsule2 = _make_capsule(
            "l2",
            [{"name": "Derivative"}, {"name": "Chain Rule", "prerequisites": ["Derivative"]}],
        )
        capsule3 = _make_capsule(
            "l3",
            [{"name": "Chain Rule"}, {"name": "Integral"}],
        )
        nodes, edges = build_path_graph([capsule1, capsule2, capsule3])

        # Check cross-lesson repeats: Derivative in l1+l2, Chain Rule in l2+l3
        repeats = [e for e in edges if e.edge_type == "repeats"]
        assert len(repeats) == 2  # derivative(l1->l2), chain_rule(l2->l3)

        # Check depends_on: Chain Rule depends_on Derivative
        depends_on = [e for e in edges if e.edge_type == "depends_on"]
        assert len(depends_on) == 1
        assert "depends_on" in depends_on[0].edge_id

        # Verify total nodes: 3 lesson + 4 concept nodes (Derivative, Limit, Chain Rule, Integral)
        concept_nodes = [n for n in nodes if n.node_type == "concept"]
        # Note: Derivative appears twice (l1:concept:0, l2:concept:0) but is one canonical concept
        # Plus Chain Rule appears twice (l2:concept:1, l3:concept:0)
        assert len(concept_nodes) == 6  # 2(l1) + 2(l2) + 2(l3)

    def test_empty_capsules_list_returns_empty(self):
        """Empty capsules list returns empty nodes and edges."""
        nodes, edges = build_path_graph([])
        assert nodes == []
        assert edges == []

    def test_single_capsule_no_cross_edges(self):
        """Single capsule: no cross-lesson edges (no repeats, no depends_on cross)."""
        capsule = _make_capsule("l1", [{"name": "Derivative"}])
        nodes, edges = build_path_graph([capsule])
        # Only intra-lesson edges (explains, assigned_in if any)
        cross_types = {"repeats", "depends_on"}
        cross_edges = [e for e in edges if e.edge_type in cross_types]
        assert len(cross_edges) == 0
        # But has explain edges
        explains = [e for e in edges if e.edge_type == "explains"]
        assert len(explains) == 1


# ===================================================================
# Graph queries
# ===================================================================


class TestGraphQueries:
    @classmethod
    def setup_class(cls):
        """Build a reusable 2-lesson graph for query tests."""
        cls.capsule1 = _make_capsule(
            "l1",
            [{"name": "Derivative"}, {"name": "Limit"}],
        )
        cls.capsule2 = _make_capsule(
            "l2",
            [{"name": "Integral", "prerequisites": ["Derivative"]}],
        )
        cls.nodes, cls.edges = build_path_graph(
            [cls.capsule1, cls.capsule2]
        )
        cls.G = build_networkx_graph(cls.nodes, cls.edges)

    def test_find_concept_matches_by_label(self):
        """find_concept returns node IDs matching a label (case-insensitive)."""
        matches = find_concept(self.G, "derivative")
        assert len(matches) == 1
        assert matches[0] == "l1:concept:0"

    def test_find_concept_case_insensitive(self):
        """find_concept is case-insensitive."""
        matches_upper = find_concept(self.G, "DERIVATIVE")
        matches_lower = find_concept(self.G, "derivative")
        assert matches_upper == matches_lower

    def test_find_concept_unknown_returns_empty(self):
        """Unknown concept name returns empty list."""
        assert find_concept(self.G, "Quantum") == []

    def test_lesson_of_concept_returns_explaining_lesson(self):
        """lesson_of_concept finds the lesson that explains a concept."""
        lesson = lesson_of_concept(self.G, "l1:concept:0")
        assert lesson == "l1"

    def test_lesson_of_concept_unknown_node_returns_none(self):
        """Unknown node ID returns None."""
        assert lesson_of_concept(self.G, "nonexistent") is None

    def test_where_introduced_returns_first_lesson(self):
        """where_introduced returns the first lesson with the concept."""
        # Derivative is introduced in l1
        intro = where_introduced(self.G, "Derivative")
        assert intro == "l1"
        # Integral is introduced in l2
        intro2 = where_introduced(self.G, "Integral")
        assert intro2 == "l2"

    def test_where_introduced_unknown_returns_none(self):
        """Unknown concept returns None."""
        assert where_introduced(self.G, "NonExistent") is None

    def test_where_reinforced_for_non_repeated_returns_empty(self):
        """A concept appearing only once has no reinforcement lessons."""
        # Limit only in l1
        reinforced = where_reinforced(self.G, "Limit")
        assert reinforced == []

    def test_prerequisites_of_returns_direct_prereqs(self):
        """prerequisites_of returns direct prerequisites of a concept."""
        prereqs = prerequisites_of(self.G, "Integral")
        assert "Derivative" in prereqs

    def test_prerequisites_of_unknown_concept_returns_empty(self):
        """Unknown concept returns empty list."""
        assert prerequisites_of(self.G, "NonExistent") == []

    def test_prerequisites_of_concept_without_prereqs_returns_empty(self):
        """A concept with no prerequisites returns empty list."""
        assert prerequisites_of(self.G, "Derivative") == []

    def test_all_prerequisites_deep_returns_transitive(self):
        """all_prerequisites_deep finds transitive prerequisites."""
        # For a 2-level graph, direct = transitive
        prereqs = all_prerequisites_deep(self.G, "Integral")
        assert "Derivative" in prereqs

    def test_all_prerequisites_deep_unknown_returns_empty(self):
        """Unknown concept returns empty list."""
        assert all_prerequisites_deep(self.G, "NonExistent") == []

    def test_topological_concepts_ordered_by_lesson(self):
        """topological_concepts returns concepts in lesson-first order."""
        ordered = topological_concepts(self.G)
        assert ordered == ["Derivative", "Limit", "Integral"]

    def test_topological_concepts_no_duplicates(self):
        """topological_concepts deduplicates concepts."""
        ordered = topological_concepts(self.G)
        assert len(ordered) == len(set(ordered))

    def test_build_networkx_graph_preserves_node_attributes(self):
        """networkx graph carries node_type, ref_id, label attributes."""
        G = build_networkx_graph(self.nodes, self.edges)
        for nid, data in G.nodes(data=True):
            assert "node_type" in data
            assert "ref_id" in data

    def test_build_networkx_graph_preserves_edge_attributes(self):
        """networkx graph carries edge_type and metadata on edges."""
        G = build_networkx_graph(self.nodes, self.edges)
        for u, v, data in G.edges(data=True):
            assert "edge_type" in data


# ===================================================================
# Integration: graph module exports
# ===================================================================


class TestGraphModuleExports:
    def test_build_lesson_graph_exported(self):
        """build_lesson_graph is importable from lessonos.graph."""
        from lessonos.graph import build_lesson_graph as blg
        assert callable(blg)

    def test_build_path_graph_exported(self):
        """build_path_graph is importable from lessonos.graph."""
        from lessonos.graph import build_path_graph as bpg
        assert callable(bpg)

    def test_graph_node_and_edge_types_usable(self):
        """GraphNode and GraphEdge can be constructed."""
        node = GraphNode(node_id="test", node_type="concept", ref_id="test")
        assert node.node_id == "test"
        edge = GraphEdge(
            edge_id="a->b", source="a", target="b", edge_type="explains"
        )
        assert edge.edge_type == "explains"

    def test_graph_edge_rejects_invalid_type(self):
        """GraphEdge raises ValueError on invalid edge_type."""
        import pytest
        with pytest.raises(ValueError, match="invalid edge_type"):
            GraphEdge(
                edge_id="a->b",
                source="a",
                target="b",
                edge_type="invalid_type",
            )
