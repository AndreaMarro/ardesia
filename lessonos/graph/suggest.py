"""Suggest pedagogical bridge concepts from a path-level Lesson Graph.

A *bridge concept* sits on many prerequisite paths between other concepts:
mastering it unlocks the largest downstream chain, so it is where teaching
effort pays off most. We surface bridges with betweenness centrality over the
concept dependency graph.

Two entry points share the same collapse + ranking core:

- :func:`rank_bridge_concepts` builds the graph IN-MEMORY via
  :func:`build_path_graph` from a list of capsules (a transient pipeline run).
- :func:`serve_method_graph` SERVES the graph that GS-3 already PERSISTED in the
  store: it reads ``all_concept_nodes`` + ``all_depends_on_edges`` (the
  cross-lesson prerequisite edges canonicalised at ingest) and returns the
  concept↔concept prerequisite graph together with the bridge ranking. No
  rebuild, no LLM — just the persisted corpus projected to a typed method graph.
"""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass

import networkx as nx

from lessonos.capsule.assembly import LessonCapsule
from lessonos.graph.builder import build_path_graph
from lessonos.graph.utils import canonical_match_key
from lessonos.models.entities import GraphNode
from lessonos.store.base import Store

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


@dataclass(frozen=True)
class MethodConcept:
    """A concept of the served method graph, collapsed to its canonical key.

    ``node_ids`` lists every per-lesson positional concept node that folds onto
    this canonical concept (a concept taught across lessons appears once).
    """

    key: str
    label: str
    node_ids: tuple[str, ...]


@dataclass(frozen=True)
class MethodDependency:
    """A concept→concept prerequisite edge, collapsed to canonical keys.

    ``source_key`` depends on ``target_key`` (same direction as the persisted
    ``depends_on`` edge: source is the dependent, target the prerequisite).
    ``provenance``/``confidence`` are carried from the persisted edge metadata
    (``None`` when absent or unparseable).
    """

    source_key: str
    target_key: str
    provenance: str | None
    confidence: float | None


@dataclass(frozen=True)
class MethodGraph:
    """The persisted prerequisite method graph served from the corpus store.

    - ``concepts``: every canonical concept, sorted by key.
    - ``dependencies``: concept→concept ``depends_on`` edges (deduplicated by
      canonical pair, first persisted edge by ``edge_id`` order wins its
      provenance/confidence), sorted deterministically.
    - ``bridges``: every concept ranked by betweenness centrality over the
      collapsed prerequisite graph (descending, key-ascending tiebreak).
    """

    concepts: tuple[MethodConcept, ...]
    dependencies: tuple[MethodDependency, ...]
    bridges: tuple[BridgeConcept, ...]


def _collapse_concepts(
    nodes: Iterable[GraphNode],
) -> tuple[dict[str, str], dict[str, str], dict[str, list[str]]]:
    """Fold positional concept nodes onto canonical keys.

    Returns ``(node_key, label_for_key, nodes_for_key)``:
    - ``node_key``: concept node_id → canonical key.
    - ``label_for_key``: canonical key → display label (first occurrence wins).
    - ``nodes_for_key``: canonical key → list of folded concept node_ids.

    Non-concept nodes are ignored. Determinism follows the input order, so pass
    nodes ordered by node_id (both ``build_path_graph`` and the store do).
    """
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
    return node_key, label_for_key, nodes_for_key


def _rank_bridges(
    label_for_key: dict[str, str],
    nodes_for_key: dict[str, list[str]],
    concept_edges: Iterable[tuple[str, str]],
) -> list[BridgeConcept]:
    """Rank canonical concepts by betweenness over the collapsed prereq graph.

    ``concept_edges`` are ``(source_key, target_key)`` pairs already collapsed
    to canonical keys (duplicates and self-loops are harmless: a ``DiGraph``
    keeps a single edge and self-loops do not affect betweenness). Returns every
    concept (centrality 0.0 included), centrality descending, key ascending for
    deterministic tiebreak.
    """
    graph = nx.DiGraph()
    graph.add_nodes_from(label_for_key)
    for src, tgt in concept_edges:
        if src == tgt:
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
    node_key, label_for_key, nodes_for_key = _collapse_concepts(nodes)

    concept_edges: list[tuple[str, str]] = []
    for e in edges:
        if e.edge_type not in _CONCEPT_EDGE_TYPES:
            continue
        src = node_key.get(e.source)
        tgt = node_key.get(e.target)
        if src is None or tgt is None or src == tgt:
            continue
        concept_edges.append((src, tgt))

    return _rank_bridges(label_for_key, nodes_for_key, concept_edges)


def _parse_confidence(raw: str | None) -> float | None:
    """Parse a persisted confidence string to float, ``None`` if absent/invalid."""
    if raw is None:
        return None
    try:
        value = float(raw)
    except ValueError:
        return None
    # Confidence is a finite score; reject nan/inf so the typed API never
    # surfaces a non-comparable value to a downstream ranker.
    if value != value or value in (float("inf"), float("-inf")):
        return None
    return value


def serve_method_graph(store: Store) -> MethodGraph:
    """Serve the PERSISTED prerequisite method graph from a corpus store (GS-3).

    Reads the persisted concept nodes and cross-lesson ``depends_on`` edges
    (canonicalised at ingest by GS-3), collapses positional concept nodes onto
    their canonical key, and returns the concept↔concept prerequisite graph
    plus the betweenness bridge ranking. Pure read + projection, ZERO LLM.

    Unlike :func:`rank_bridge_concepts`, which rebuilds the graph in-memory from
    capsules, this reflects exactly what is stored — so a backend that does not
    enumerate the corpus (``all_concept_nodes``/``all_depends_on_edges`` default
    to empty) serves an empty graph, never an error.
    """
    node_key, label_for_key, nodes_for_key = _collapse_concepts(
        store.all_concept_nodes()
    )

    dependencies: list[MethodDependency] = []
    seen_pairs: set[tuple[str, str]] = set()
    for e in store.all_depends_on_edges():
        src = node_key.get(e.source)
        tgt = node_key.get(e.target)
        if src is None or tgt is None or src == tgt:
            continue
        if (src, tgt) in seen_pairs:
            continue
        seen_pairs.add((src, tgt))
        dependencies.append(
            MethodDependency(
                source_key=src,
                target_key=tgt,
                provenance=e.metadata.get("provenance"),
                confidence=_parse_confidence(e.metadata.get("confidence")),
            )
        )

    bridges = _rank_bridges(
        label_for_key,
        nodes_for_key,
        ((d.source_key, d.target_key) for d in dependencies),
    )

    concepts = tuple(
        MethodConcept(
            key=k,
            label=label_for_key[k],
            node_ids=tuple(nodes_for_key[k]),
        )
        for k in sorted(label_for_key)
    )
    dependencies.sort(key=lambda d: (d.source_key, d.target_key))
    return MethodGraph(
        concepts=concepts,
        dependencies=tuple(dependencies),
        bridges=tuple(bridges),
    )
