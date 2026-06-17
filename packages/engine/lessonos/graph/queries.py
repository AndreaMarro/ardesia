"""Lesson Graph queries: navigation and search over the Lesson Graph (PLAN §3.2, M3).

Provides functions to convert GraphNode/GraphEdge lists into a networkx DiGraph
and query it: find concepts, trace introductions/reinforcements, resolve prerequisites,
and topological ordering.

All queries operate on the path-level graph returned by build_path_graph().
"""

from __future__ import annotations

import networkx as nx

from lessonos.models.entities import GraphEdge, GraphNode


def build_networkx_graph(
    nodes: list[GraphNode],
    edges: list[GraphEdge],
) -> nx.DiGraph:
    """Convert LessonOS GraphNode/GraphEdge lists into a networkx DiGraph.

    Node attributes stored: node_type, ref_id, label (if any).
    Edge attributes stored: edge_type, metadata (if any).

    Parameters
    ----------
    nodes : list[GraphNode]
        Nodes from build_lesson_graph or build_path_graph.
    edges : list[GraphEdge]
        Edges from build_lesson_graph or build_path_graph.

    Returns
    -------
    nx.DiGraph
        Directed graph with all nodes and edges from the Lesson Graph.
    """
    G = nx.DiGraph()
    for node in nodes:
        attrs: dict = {"node_type": node.node_type, "ref_id": node.ref_id}
        if node.label is not None:
            attrs["label"] = node.label
        G.add_node(node.node_id, **attrs)
    for edge in edges:
        attrs: dict = {"edge_type": edge.edge_type}
        if edge.metadata:
            attrs["metadata"] = edge.metadata
        G.add_edge(edge.source, edge.target, **attrs)
    return G


def find_concept(G: nx.DiGraph, name: str) -> list[str]:
    """Find all concept node IDs with a label matching *name* (case-insensitive).

    Returns a list of node_ids (e.g. ['l1:concept:0', 'l2:concept:0']).
    Empty list if no concept matches.
    """
    name_lower = name.lower()
    result: list[str] = []
    for node_id, data in G.nodes(data=True):
        if data.get("node_type") != "concept":
            continue
        label = data.get("label", "")
        if label.lower() == name_lower:
            result.append(node_id)
    return result


def lesson_of_concept(G: nx.DiGraph, concept_node_id: str) -> str | None:
    """Return the lesson node ID that *explains* this concept node.

    Walks inbound 'explains' edges to find the lesson that introduced/reinforced
    the concept. Returns None if no explaining lesson is found.
    """
    if concept_node_id not in G:
        return None
    for pred in G.predecessors(concept_node_id):
        edge_data = G.get_edge_data(pred, concept_node_id)
        if edge_data and edge_data.get("edge_type") == "explains":
            return pred
    return None


def where_introduced(G: nx.DiGraph, concept_name: str) -> str | None:
    """Find the *first* lesson that introduces *concept_name*.

    Among all concept nodes matching *concept_name*, returns the lesson ID
    of the earliest one (by topological position in the graph — the one whose
    lesson has the fewest prerequisite lessons).

    Returns None if the concept is not found in the graph.
    """
    concept_nodes = find_concept(G, concept_name)
    if not concept_nodes:
        return None

    # Find the lesson for each concept node
    lessons: set[str] = set()
    for cn in concept_nodes:
        lesson = lesson_of_concept(G, cn)
        if lesson:
            lessons.add(lesson)

    if not lessons:
        return None

    # Use topological sort to determine the earliest lesson
    try:
        topo = list(nx.topological_sort(G))
        # Only consider lesson nodes
        lesson_order = [n for n in topo if "lesson" in (G.nodes[n].get("node_type", ""))]
        for lesson in lesson_order:
            if lesson in lessons:
                return lesson
    except nx.NetworkXUnfeasible:
        raise ValueError(
            "Lesson Graph contains cycles — cannot determine introduction order. "
            "The graph builder should have enforced DAG property."
        )

    # Fallback: return the first one (sorted) — only reached if no lesson is in topological order
    return sorted(lessons)[0]


def where_reinforced(G: nx.DiGraph, concept_name: str) -> list[str]:
    """Find all lessons that *reinforce* *concept_name*.

    Excludes the lesson where the concept was *introduced*.
    Returns a list of lesson IDs in topological order.
    """
    introduced = where_introduced(G, concept_name)
    concept_nodes = find_concept(G, concept_name)

    # Collect all lessons that explain this concept
    explaining_lessons: set[str] = set()
    for cn in concept_nodes:
        lesson = lesson_of_concept(G, cn)
        if lesson:
            explaining_lessons.add(lesson)

    # Remove the introduction lesson
    if introduced and introduced in explaining_lessons:
        explaining_lessons.remove(introduced)

    # Sort by topological order
    try:
        topo = list(nx.topological_sort(G))
        lesson_order = [n for n in topo if "lesson" in (G.nodes[n].get("node_type", ""))]
        return [l for l in lesson_order if l in explaining_lessons]
    except nx.NetworkXUnfeasible:
        return sorted(explaining_lessons)


def prerequisites_of(
    G: nx.DiGraph,
    concept_name: str,
) -> list[str]:
    """Find all direct prerequisites of *concept_name*.

    Walks outbound 'depends_on' edges from any matching concept node.
    Returns a list of prerequisite concept labels (names), deduplicated.

    Parameters
    ----------
    G : nx.DiGraph
        The path-level lesson graph.
    concept_name : str
        The name of the concept to find prerequisites for.

    Returns
    -------
    list[str]
        Prerequisite concept labels (names). Empty list if none found.
    """
    concept_nodes = find_concept(G, concept_name)
    if not concept_nodes:
        return []

    prereq_labels: set[str] = set()
    for cn in concept_nodes:
        for succ in G.successors(cn):
            edge_data = G.get_edge_data(cn, succ)
            if edge_data and edge_data.get("edge_type") == "depends_on":
                # The successor of a 'depends_on' edge IS the prerequisite
                prereq_data = G.nodes[succ]
                label = prereq_data.get("label")
                if label:
                    prereq_labels.add(label)
                else:
                    raise ValueError(
                        f"Prerequisite node {succ!r} has no label — cannot resolve concept name"
                    )

    return sorted(prereq_labels)


def all_prerequisites_deep(
    G: nx.DiGraph,
    concept_name: str,
) -> list[str]:
    """Find ALL (transitive) prerequisites of *concept_name*.

    BFS traversal following 'depends_on' edges backward from any matching
    concept node. Returns deduplicated concept labels in topological order
    (prerequisites first).

    Parameters
    ----------
    G : nx.DiGraph
        The path-level lesson graph.
    concept_name : str
        The name of the concept to find prerequisites for.

    Returns
    -------
    list[str]
        All prerequisite concept labels, in topological order.
    """
    concept_nodes = find_concept(G, concept_name)
    if not concept_nodes:
        return []

    # BFS following 'depends_on' edges: source -> target means source depends on target
    # so we follow successors (targets = prerequisites) of depends_on edges.
    visited: set[str] = set()
    queue: list[str] = list(concept_nodes)
    prereq_node_ids: set[str] = set()

    while queue:
        current = queue.pop(0)
        if current in visited:
            continue
        visited.add(current)

        for succ in G.successors(current):
            edge_data = G.get_edge_data(current, succ)
            if edge_data and edge_data.get("edge_type") == "depends_on":
                # succ IS the prerequisite concept node
                prereq_node_ids.add(succ)
                if succ not in visited:
                    queue.append(succ)

    # Resolve node IDs to labels
    prereq_labels: set[str] = set()
    for nid in prereq_node_ids:
        label = G.nodes[nid].get("label")
        if label:
            prereq_labels.add(label)

    # Sort topologically
    try:
        topo = list(nx.topological_sort(G))
        return [l for l in (G.nodes[n].get("label") for n in topo) if l in prereq_labels]
    except nx.NetworkXUnfeasible:
        return sorted(prereq_labels)


def topological_concepts(G: nx.DiGraph) -> list[str]:
    """Return concept labels in prerequisite-first pedagogical order.

    Uses lesson position (via 'explains' edges) to order concepts:
    concepts from earlier lessons come first.
    Within a lesson, concepts preserve their original order.

    Since 'depends_on' edges go concept → prerequisite in the graph,
    the networkx topological sort would put dependents before prerequisites —
    we reverse this to get the correct pedagogical ordering.

    Returns
    -------
    list[str]
        Concept labels in pedagogical (prerequisite-first) order.
    """
    # Collect concepts by lesson
    lesson_concepts: dict[str, list[str]] = {}
    lesson_order: list[str] = []

    for nid, data in G.nodes(data=True):
        if data.get("node_type") != "concept":
            continue
        label = data.get("label")
        if not label:
            continue
        # Find the lesson that explains this concept
        lesson = lesson_of_concept(G, nid)
        if lesson:
            if lesson not in lesson_concepts:
                lesson_concepts[lesson] = []
                lesson_order.append(lesson)
            lesson_concepts[lesson].append(label)

    # Order lessons by topological sort (lesson nodes)
    try:
        topo = list(nx.topological_sort(G))
        ordered_lessons = [l for l in topo if "lesson" in (G.nodes[l].get("node_type", ""))]
        lesson_order = [l for l in ordered_lessons if l in lesson_concepts]
    except nx.NetworkXUnfeasible:
        pass

    # Collect concepts in lesson order, deduplicating
    seen: set[str] = set()
    result: list[str] = []
    for lesson in lesson_order:
        for label in lesson_concepts.get(lesson, []):
            if label not in seen:
                result.append(label)
                seen.add(label)
    return result
