"""Suggest pedagogical bridge concepts from a path-level Lesson Graph.

A *bridge concept* sits on many prerequisite paths between other concepts:
mastering it unlocks the largest downstream chain, so it is where teaching
effort pays off most. We surface bridges with betweenness centrality over the
concept dependency graph.

The graph is built IN-MEMORY via :func:`build_path_graph` — NOT read from the
persisted ``nodes``/``edges`` tables, which only hold per-lesson edges
(``explains``/``assigned_in``) and lack the cross-lesson ``depends_on`` edges
that define the prerequisite structure.
"""

from __future__ import annotations

from dataclasses import dataclass

import networkx as nx

from lessonos.capsule.assembly import LessonCapsule
from lessonos.graph.builder import build_path_graph
from lessonos.graph.utils import canonical_match_key

# Edges that express a pedagogical relation between concepts. ``depends_on``
# carries the prerequisite structure; ``repeats`` links occurrences of the
# same concept across lessons (collapses to a self-loop at concept level and
# is therefore dropped). Other edge types (explains/assigned_in) involve
# lesson/exercise nodes and are not concept↔concept bridges.
_CONCEPT_EDGE_TYPES = frozenset({"depends_on", "repeats"})


@dataclass(frozen=True)
class BridgeConcept:
    """A concept ranked by its bridging role in the prerequisite graph."""

    name: str
    key: str
    centrality: float
    node_ids: tuple[str, ...]


def rank_bridge_concepts(capsules: list[LessonCapsule]) -> list[BridgeConcept]:
    """Rank concepts by betweenness centrality over the prerequisite graph.

    Builds the path graph in-memory, collapses per-lesson concept occurrences
    that share a canonical name into a single node (so a concept taught across
    several lessons counts once), keeps only concept↔concept edges, and ranks
    by ``nx.betweenness_centrality``.

    Returns every concept (centrality 0.0 included) sorted by centrality
    descending, ties broken by canonical key ascending for determinism.
    """
    nodes, edges = build_path_graph(capsules)

    # Map concept node_id → canonical key; remember a display label and the
    # node ids per canonical concept (first-occurrence label wins).
    node_key: dict[str, str] = {}
    label_for_key: dict[str, str] = {}
    nodes_for_key: dict[str, list[str]] = {}
    for n in nodes:
        if n.node_type != "concept":
            continue
        key = canonical_match_key(n.label or n.node_id)
        node_key[n.node_id] = key
        if key not in label_for_key:
            label_for_key[key] = n.label or n.node_id
            nodes_for_key[key] = []
        nodes_for_key[key].append(n.node_id)

    # Collapsed concept graph: one node per canonical key, edges between
    # distinct canonical concepts. Self-loops (e.g. 'repeats' between
    # occurrences of the same concept) are dropped.
    graph = nx.DiGraph()
    graph.add_nodes_from(label_for_key)
    for e in edges:
        if e.edge_type not in _CONCEPT_EDGE_TYPES:
            continue
        src = node_key.get(e.source)
        tgt = node_key.get(e.target)
        if src is None or tgt is None or src == tgt:
            continue
        graph.add_edge(src, tgt)

    centrality = nx.betweenness_centrality(graph)

    ranked_keys = sorted(label_for_key, key=lambda k: (-centrality[k], k))
    return [
        BridgeConcept(
            name=label_for_key[k],
            key=k,
            centrality=centrality[k],
            node_ids=tuple(nodes_for_key[k]),
        )
        for k in ranked_keys
    ]
