"""Build Lesson Graph nodes and edges from a Lesson Capsule (PLAN §3.2).

The graph builder extracts structured nodes (concepts, exercises) and typed
edges (explains, assesses, depends_on, ...) from a grounded Lesson Capsule.
All edge_type values are validated against EDGE_TYPES at construction.
"""

from __future__ import annotations

import networkx as nx

from lessonos.capsule.assembly import LessonCapsule
from lessonos.models.entities import GraphEdge, GraphNode


def build_lesson_graph(
    capsule: LessonCapsule,
) -> tuple[list[GraphNode], list[GraphEdge]]:
    """Build graph nodes and edges from a Lesson Capsule.

    Creates:
    - One GraphNode per concept (node_type="concept", ref_id=<concept_id>)
    - One GraphNode per exercise (node_type="exercise", ref_id=<exercise_id>)
    - "explains" edges from lesson to each concept
    - "assesses" edges from exercises to their target concepts (if any)

    Returns (nodes, edges). Node IDs are deterministic (<lesson_id>:<type>:<index>).
    Edge IDs are deterministic (<source>-<edge_type>-><target>).
    """
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []

    lesson_id = capsule.lesson_id

    # Lesson node (the lesson itself is a node in the graph)
    lesson_node = GraphNode(
        node_id=lesson_id,
        node_type="lesson",
        ref_id=lesson_id,
        label=None,
    )
    nodes.append(lesson_node)

    # Concept nodes + "explains" edges from lesson to concept
    for i, concept in enumerate(capsule.content.concepts):
        concept_id = f"{lesson_id}:concept:{i}"
        concept_node = GraphNode(
            node_id=concept_id,
            node_type="concept",
            ref_id=concept_id,
            label=concept.name,
        )
        nodes.append(concept_node)

        # Lesson explains this concept
        edge = GraphEdge(
            edge_id=f"{lesson_id}-explains->{concept_id}",
            source=lesson_id,
            target=concept_id,
            edge_type="explains",
        )
        edges.append(edge)

    # Exercise nodes + "assesses" edges (exercise assesses concept)
    for i, exercise in enumerate(capsule.content.exercises):
        exercise_id = f"{lesson_id}:exercise:{i}"
        exercise_node = GraphNode(
            node_id=exercise_id,
            node_type="exercise",
            ref_id=exercise_id,
            label=None,
        )
        nodes.append(exercise_node)

        # If the exercise prompt mentions concepts, we could create "assesses" edges.
        # For now, we create a generic edge from lesson to exercise (lesson assigns exercise)
        edge = GraphEdge(
            edge_id=f"{lesson_id}-assigned_in->{exercise_id}",
            source=lesson_id,
            target=exercise_id,
            edge_type="assigned_in",
        )
        edges.append(edge)

    return nodes, edges


def build_path_graph(
    capsules: list[LessonCapsule],
) -> tuple[list[GraphNode], list[GraphEdge]]:
    """Build path-level Lesson Graph from multiple Lesson Capsules.

    Creates per-lesson nodes/edges via build_lesson_graph per ogni capsule,
    then adds cross-lesson edges:

    1. 'repeats' edges — same concept name appearing in >=2 lessons
       provenance: metadata={provenance: 'auto-suggested', confidence: '0.7'}
       Edge goes from earlier lesson's concept node to later lesson's concept node
       (determine by concept position in capsules list — first capsule = earliest)

    2. 'depends_on' edges — concept.prerequisites matching another concept name
       provenance: metadata={provenance: 'auto-suggested', confidence: '0.8'}
       Edge goes from concept TO its prerequisite concept node

    Edge IDs: deterministic. 'repeats' edge ID format: <source_node_id>-repeats-><target_node_id>
    'depends_on' edge ID format: <source_node_id>-depends_on-><target_node_id>

    Returns combined (nodes, edges) with ALL per-lesson nodes/edges plus cross-lesson additions.
    No duplicates: use a set of existing edge_ids to avoid adding the same edge twice.
    """
    all_nodes: list[GraphNode] = []
    all_edges: list[GraphEdge] = []
    edge_ids_seen: set[str] = set()

    # Build per-lesson graphs
    for capsule in capsules:
        nodes, edges = build_lesson_graph(capsule)
        all_nodes.extend(nodes)
        for edge in edges:
            if edge.edge_id not in edge_ids_seen:
                all_edges.append(edge)
                edge_ids_seen.add(edge.edge_id)

    # Build concept name → list[(lesson_index, concept_node)] mapping
    concept_map: dict[str, list[tuple[int, GraphNode]]] = {}
    for lesson_idx, capsule in enumerate(capsules):
        for concept_idx, concept in enumerate(capsule.content.concepts):
            concept_name = concept.name.lower()
            concept_node_id = f"{capsule.lesson_id}:concept:{concept_idx}"
            concept_node = next(
                (n for n in all_nodes if n.node_id == concept_node_id), None
            )
            if concept_node:
                if concept_name not in concept_map:
                    concept_map[concept_name] = []
                concept_map[concept_name].append((lesson_idx, concept_node))

    # Add 'repeats' edges for concepts appearing in >=2 lessons
    for concept_name, occurrences in concept_map.items():
        if len(occurrences) >= 2:
            # Sort by lesson index to ensure order
            occurrences.sort(key=lambda x: x[0])
            # Create edges from each occurrence to the next
            for i in range(len(occurrences) - 1):
                source_node = occurrences[i][1]
                target_node = occurrences[i + 1][1]
                edge_id = f"{source_node.node_id}-repeats->{target_node.node_id}"
                if edge_id not in edge_ids_seen:
                    edge = GraphEdge(
                        edge_id=edge_id,
                        source=source_node.node_id,
                        target=target_node.node_id,
                        edge_type="repeats",
                        metadata={"provenance": "auto-suggested", "confidence": "0.7"},
                    )
                    all_edges.append(edge)
                    edge_ids_seen.add(edge_id)

    # Build prerequisite → concept node mapping for 'depends_on' edges
    for lesson_idx, capsule in enumerate(capsules):
        for concept_idx, concept in enumerate(capsule.content.concepts):
            concept_node_id = f"{capsule.lesson_id}:concept:{concept_idx}"
            concept_node = next(
                (n for n in all_nodes if n.node_id == concept_node_id), None
            )
            if concept_node and concept.prerequisites:
                for prereq_name in concept.prerequisites:
                    prereq_name_lower = prereq_name.lower()
                    # Find prerequisite concept node
                    if prereq_name_lower in concept_map:
                        # Use the first occurrence of the prerequisite
                        prereq_node = concept_map[prereq_name_lower][0][1]
                        edge_id = (
                            f"{concept_node.node_id}-depends_on->{prereq_node.node_id}"
                        )
                        if edge_id not in edge_ids_seen:
                            edge = GraphEdge(
                                edge_id=edge_id,
                                source=concept_node.node_id,
                                target=prereq_node.node_id,
                                edge_type="depends_on",
                                metadata={
                                    "provenance": "auto-suggested",
                                    "confidence": "0.8",
                                },
                            )
                            all_edges.append(edge)
                            edge_ids_seen.add(edge_id)

    # Validate DAG property using networkx
    G = nx.DiGraph()
    for edge in all_edges:
        G.add_edge(edge.source, edge.target)
    if not nx.is_directed_acyclic_graph(G):
        raise ValueError("Path graph contains cycles — not a valid DAG")

    return all_nodes, all_edges
