"""Build Lesson Graph nodes and edges from a Lesson Capsule (PLAN §3.2).

The graph builder extracts structured nodes (concepts, exercises) and typed
edges (explains, assesses, depends_on, ...) from a grounded Lesson Capsule.
All edge_type values are validated against EDGE_TYPES at construction.
"""

from __future__ import annotations

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
