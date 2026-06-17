"""Build Lesson Graph nodes and edges from a Lesson Capsule (PLAN §3.2).

The graph builder extracts structured nodes (concepts, exercises) and typed
edges (explains, assesses, depends_on, ...) from a grounded Lesson Capsule.
All edge_type values are validated against EDGE_TYPES at construction.
"""

from __future__ import annotations

import networkx as nx

from lessonos.capsule.assembly import LessonCapsule
from lessonos.graph.utils import (
    DEFAULT_DEPENDS_FUZZY_THRESHOLD,
    canonical_match_key,
    content_tokens,
    fuzzy_prereq_match,
)
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
    depends_fuzzy_threshold: float = DEFAULT_DEPENDS_FUZZY_THRESHOLD,
) -> tuple[list[GraphNode], list[GraphEdge]]:
    """Build path-level Lesson Graph from multiple Lesson Capsules.

    Creates per-lesson nodes/edges via build_lesson_graph per ogni capsule,
    then adds cross-lesson edges:

    1. 'repeats' edges — same concept name appearing in >=2 lessons
       provenance: metadata={provenance: 'auto-suggested', confidence: '0.7'}
       Edge goes from earlier lesson's concept node to later lesson's concept node
       (determine by concept position in capsules list — first capsule = earliest)

    2. 'depends_on' edges — concept.prerequisites matching another concept name.
       Exact canonical match (accent/case/whitespace fold) →
       metadata={provenance: 'auto-suggested', confidence: '0.8'}.
       When no exact key matches, a high-precision FUZZY fallback (Jaccard
       overlap of content tokens, ``depends_fuzzy_threshold``, unique winner
       only) recovers word-order and article/preposition variants of the same
       content words → metadata={provenance: 'auto-suggested-fuzzy',
       confidence: '<jaccard>'}. Subset/superset overlaps and ambiguous
       prereqs (tied best match) are dropped (ZERO-false-match precision).
       Edge goes from concept TO its prerequisite concept node.

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

    # Index nodes by their (unique, deterministic) id once, so the three
    # cross-lesson passes below resolve a concept node by id in O(1) instead
    # of scanning all_nodes each time (was O(concepts × nodes)).
    node_by_id: dict[str, GraphNode] = {n.node_id: n for n in all_nodes}

    # Build concept name → list[(lesson_index, concept_node)] mapping
    concept_map: dict[str, list[tuple[int, GraphNode]]] = {}
    for lesson_idx, capsule in enumerate(capsules):
        for concept_idx, concept in enumerate(capsule.content.concepts):
            concept_name = concept.name.lower()
            concept_node_id = f"{capsule.lesson_id}:concept:{concept_idx}"
            concept_node = node_by_id.get(concept_node_id)
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

    # Build a canonical index (canonical key → first-occurrence concept node)
    # used ONLY for prereq→concept matching. Canonical matching (accent/case/
    # whitespace folding) recovers depends_on edges that an exact .lower()
    # comparison drops. First occurrence wins (deterministic: capsules and
    # concepts are iterated in order).
    canonical_index: dict[str, GraphNode] = {}
    for lesson_idx, capsule in enumerate(capsules):
        for concept_idx, concept in enumerate(capsule.content.concepts):
            concept_node_id = f"{capsule.lesson_id}:concept:{concept_idx}"
            concept_node = node_by_id.get(concept_node_id)
            if concept_node is None:
                continue
            key = canonical_match_key(concept.name)
            if key not in canonical_index:
                canonical_index[key] = concept_node

    # Fuzzy fallback candidates: (canonical_key, content_tokens) per distinct
    # concept, used ONLY when a prereq fails the exact canonical match below.
    # Derived from canonical_index so first-occurrence determinism is shared.
    fuzzy_candidates: list[tuple[str, frozenset[str]]] = [
        (key, content_tokens(node.label or ""))
        for key, node in canonical_index.items()
    ]

    # Accumulate the graph built so far (per-lesson + repeats edges) so each
    # candidate 'depends_on' edge can be tested for cycle-closure BEFORE it is
    # added. Denser canonical matching can otherwise produce mutual
    # prerequisites (A↔B via accent/case variants) the old exact .lower() never
    # matched — closing a cycle and aborting the run at the DAG check below.
    G = nx.DiGraph()
    for edge in all_edges:
        G.add_edge(edge.source, edge.target)

    # Build prerequisite → concept node mapping for 'depends_on' edges
    for lesson_idx, capsule in enumerate(capsules):
        for concept_idx, concept in enumerate(capsule.content.concepts):
            concept_node_id = f"{capsule.lesson_id}:concept:{concept_idx}"
            concept_node = node_by_id.get(concept_node_id)
            if concept_node and concept.prerequisites:
                for prereq_name in concept.prerequisites:
                    prereq_key = canonical_match_key(prereq_name)
                    # Resolve the prereq to a concept node. Exact canonical
                    # match wins (high confidence). Only when that fails do we
                    # fall back to high-precision fuzzy token matching, which
                    # recovers word-order and article/preposition variants of
                    # the same content words the exact key drops. The fuzzy edge
                    # carries a distinct provenance and the Jaccard score as
                    # confidence so downstream consumers can tell them apart.
                    if prereq_key in canonical_index:
                        prereq_node = canonical_index[prereq_key]
                        provenance = "auto-suggested"
                        confidence = "0.8"
                    else:
                        match = fuzzy_prereq_match(
                            prereq_name, fuzzy_candidates, depends_fuzzy_threshold
                        )
                        if match is None:
                            continue
                        matched_key, score = match
                        prereq_node = canonical_index[matched_key]
                        provenance = "auto-suggested-fuzzy"
                        confidence = f"{score:.2f}"
                    # Skip self-dependencies: a concept whose prereq
                    # canonicalises to its own name is not a real edge
                    # (and would introduce a self-loop / spurious cycle).
                    if prereq_node.node_id == concept_node.node_id:
                        continue
                    # Skip any edge that would close a cycle: if the
                    # prerequisite can already reach this concept, adding
                    # "concept depends_on prereq" makes a cycle. Drop it
                    # (deterministic: first-seen prereq edge wins).
                    if G.has_node(prereq_node.node_id) and G.has_node(
                        concept_node.node_id
                    ) and nx.has_path(
                        G, prereq_node.node_id, concept_node.node_id
                    ):
                        continue
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
                                "provenance": provenance,
                                "confidence": confidence,
                            },
                        )
                        all_edges.append(edge)
                        edge_ids_seen.add(edge_id)
                        G.add_edge(edge.source, edge.target)

    # Validate DAG property using networkx (safety net: depends_on edges are
    # added cycle-safely above, so this guards only against per-lesson/repeats
    # anomalies).
    if not nx.is_directed_acyclic_graph(G):
        raise ValueError("Path graph contains cycles — not a valid DAG")

    return all_nodes, all_edges


def resolve_corpus_depends_on(
    source_concepts: list[tuple[str, str, tuple[str, ...]]],
    corpus_concepts: list[tuple[str, str]],
    existing_edges: list[tuple[str, str]],
    *,
    depends_fuzzy_threshold: float = DEFAULT_DEPENDS_FUZZY_THRESHOLD,
) -> list[GraphEdge]:
    """Resolve a lesson's prerequisites to EXISTING corpus concepts (GS-3).

    The in-memory :func:`build_path_graph` only sees the capsules of one
    pipeline run. This resolver is its persisted, *incremental* counterpart:
    given the concepts of the lesson being ingested and the concept nodes
    already stored from prior lessons, it produces the cross-lesson
    ``depends_on`` edges to persist — so canonicalisation happens at
    INGEST/persistence time, not only in a transient pipeline result.

    Args:
        source_concepts: ``(node_id, name, prerequisites)`` for each concept
            of the lesson being ingested (the edge SOURCES).
        corpus_concepts: ``(node_id, name)`` for every concept node already in
            the store, INCLUDING this lesson's own freshly-written concepts.
            The first occurrence of each canonical key wins (pass in a
            deterministic order, e.g. ordered by ``node_id``).
        existing_edges: ``(source_node_id, target_node_id)`` of every
            ``depends_on`` edge already persisted, used as a cycle guard so an
            incremental edge never closes a cycle with the stored graph.
        depends_fuzzy_threshold: Jaccard threshold for the fuzzy fallback
            (default :data:`DEFAULT_DEPENDS_FUZZY_THRESHOLD` = 1.0, set-equality;
            ZERO false matches).

    Matching mirrors :func:`build_path_graph`'s ``depends_on`` pass exactly:
    exact canonical key match (``confidence="0.8"``,
    ``provenance="auto-suggested"``) then a high-precision fuzzy fallback
    (``provenance="auto-suggested-fuzzy"``, ``confidence=<jaccard>``). The
    matched ``prereq`` string is recorded in metadata so an inbound edge can be
    re-validated against the corpus when its (positional) target is re-ingested.
    Self-dependencies and cycle-closing edges are dropped. Returns a list of
    :class:`GraphEdge` (no duplicates); the caller persists them.

    Pure function: no store, no I/O — testable on a labelled precision set.
    """
    # Canonical index over the corpus: canonical key → first-seen concept
    # node_id. ``key_label`` keeps the representative name for token derivation.
    canonical_index: dict[str, str] = {}
    key_label: dict[str, str] = {}
    for node_id, name in corpus_concepts:
        key = canonical_match_key(name)
        if key not in canonical_index:
            canonical_index[key] = node_id
            key_label[key] = name

    fuzzy_candidates: list[tuple[str, frozenset[str]]] = [
        (key, content_tokens(key_label[key])) for key in canonical_index
    ]

    # Cycle guard graph seeded with already-persisted depends_on edges.
    G = nx.DiGraph()
    for src, tgt in existing_edges:
        G.add_edge(src, tgt)

    resolved: list[GraphEdge] = []
    edge_ids_seen: set[str] = set()

    for source_node_id, _name, prerequisites in source_concepts:
        for prereq_name in prerequisites:
            prereq_key = canonical_match_key(prereq_name)
            if prereq_key in canonical_index:
                target_id = canonical_index[prereq_key]
                provenance = "auto-suggested"
                confidence = "0.8"
            else:
                match = fuzzy_prereq_match(
                    prereq_name, fuzzy_candidates, depends_fuzzy_threshold
                )
                if match is None:
                    continue
                matched_key, score = match
                target_id = canonical_index[matched_key]
                provenance = "auto-suggested-fuzzy"
                confidence = f"{score:.2f}"

            # Self-dependency: a concept whose prereq resolves to itself.
            if target_id == source_node_id:
                continue
            # Cycle guard: skip if the prereq can already reach this concept.
            if (
                G.has_node(target_id)
                and G.has_node(source_node_id)
                and nx.has_path(G, target_id, source_node_id)
            ):
                continue

            edge_id = f"{source_node_id}-depends_on->{target_id}"
            if edge_id in edge_ids_seen:
                continue
            resolved.append(
                GraphEdge(
                    edge_id=edge_id,
                    source=source_node_id,
                    target=target_id,
                    edge_type="depends_on",
                    metadata={
                        "provenance": provenance,
                        "confidence": confidence,
                        "prereq": prereq_name,
                    },
                )
            )
            edge_ids_seen.add(edge_id)
            G.add_edge(source_node_id, target_id)

    return resolved
