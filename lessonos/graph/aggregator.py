"""Aggregate Lesson Graph nodes/edges across all lessons in a path (M1-1).

Given a path (course of one teacher), load all lesson capsules, deduplicate
concept nodes by normalized name, merge evidence, and compute the most
advanced status. The result is an ``AggregatedPathGraph`` that represents
the teacher's full knowledge graph.

Invariants:
- Every concept appears exactly once (by normalized name) in merged_nodes.
- Status = max STATUS_ORDER across all lessons where it appears.
- Edge union: all per-lesson edges are preserved.
- No cross-path contamination: only lessons for *path_id* are loaded.
- Edges/evidence are aggregated from the store keyed on lesson_id, independently
  of whether a LessonCapsule exists for that lesson (no data loss).
"""

from __future__ import annotations

from lessonos.capsule.assembly import LessonCapsule, load_capsule
from lessonos.models.entities import (
    STATUS_ORDER,
    AggregatedPathGraph,
    AggregatedPathNode,
    GraphEdge,
    GraphEvidence,
)
from lessonos.store.base import Store


def _normalize_name(name: str) -> str:
    """Normalise a concept name for deduplication: lowercase, strip whitespace."""
    return name.strip().lower()


def _most_advanced_status(statuses: list[str]) -> str:
    """Return the most advanced status from *statuses* per STATUS_ORDER.

    Args:
        statuses: Status strings for the same concept across multiple lessons.

    Returns:
        The status with the highest STATUS_ORDER value.
    """
    return max(statuses, key=lambda s: STATUS_ORDER.get(s, -1))


def _merge_concept_nodes(
    capsules: list[LessonCapsule],
) -> tuple[list[AggregatedPathNode], dict[str, str]]:
    """Deduplicate concept nodes by canonical name across capsules.

    Dedup key: ``concept.canonical`` (M1-1b) if present, else the normalized
    ``concept.name`` (backward compat with old capsules that lack canonical).

    Returns:
        merged_nodes: List of AggregatedPathNode (one per unique concept).
        name_to_id: Mapping from dedup key to assigned node_id.
    """
    # Accumulate per-key: label, statuses, lesson_ids, evidence_count
    accum: dict[str, dict] = {}
    # Track first concept_id seen for each key (for deterministic node_id)
    key_to_first_concept: dict[str, str] = {}

    for capsule in capsules:
        lid = capsule.lesson_id
        for idx, concept in enumerate(capsule.content.concepts):
            key = concept.canonical if concept.canonical else _normalize_name(concept.name)
            if not key:
                continue
            if key not in accum:
                accum[key] = {
                    "label": concept.name,
                    "statuses": [],
                    "lesson_ids": [],
                    "ev_count": 0,
                }
            d = accum[key]
            d["statuses"].append(concept.status)
            if lid not in d["lesson_ids"]:
                d["lesson_ids"].append(lid)
            d["ev_count"] += len(concept.citations)

            # Remember the first concept_id for this key (deterministic)
            if key not in key_to_first_concept:
                key_to_first_concept[key] = f"{lid}:concept:{idx}"

    # Build AggregatedPathNode list and key_to_id mapping
    merged_nodes: list[AggregatedPathNode] = []
    key_to_id: dict[str, str] = {}
    node_ids_seen: set[str] = set()

    for key, d in accum.items():
        first_conc = key_to_first_concept[key]
        node_id = f"path:{first_conc}"
        base_id = node_id
        counter = 1
        while node_id in node_ids_seen:
            node_id = f"{base_id}__{counter}"
            counter += 1
        node_ids_seen.add(node_id)
        key_to_id[key] = node_id

        status = _most_advanced_status(d["statuses"])
        merged_nodes.append(
            AggregatedPathNode(
                node_id=node_id,
                label=d["label"],
                status=status,
                lesson_ids=tuple(d["lesson_ids"]),
                evidence_count=d["ev_count"],
            )
        )

    return merged_nodes, key_to_id


def _collect_edges_and_evidence(
    store: Store,
    lesson_ids: list[str],
) -> tuple[list[GraphEdge], list[GraphEvidence]]:
    """Union all persisted edges and evidence across *lesson_ids*.

    Edges are deduplicated by ``edge_id`` and evidence by ``evidence_id``,
    preserving first-seen order. This runs directly off the store's graph
    tables (T5 graph_writer), so it captures data that exists even when no
    LessonCapsule was assembled for the lesson — which is exactly the case the
    old early-return silently dropped.
    """
    all_edges: list[GraphEdge] = []
    edge_ids_seen: set[str] = set()
    all_evidence: list[GraphEvidence] = []
    ev_ids_seen: set[str] = set()

    for lid in lesson_ids:
        for edge in store.get_graph_edges_for_lesson(lid):
            if edge.edge_id not in edge_ids_seen:
                all_edges.append(edge)
                edge_ids_seen.add(edge.edge_id)
        for ev in store.get_all_evidence_for_lesson(lid):
            if ev.evidence_id not in ev_ids_seen:
                all_evidence.append(ev)
                ev_ids_seen.add(ev.evidence_id)

    return all_edges, all_evidence


def orphan_edges(
    edges: tuple[GraphEdge, ...] | list[GraphEdge],
    merged_nodes: tuple[AggregatedPathNode, ...] | list[AggregatedPathNode],
) -> list[GraphEdge]:
    """Return edges whose source or target is not present among *merged_nodes*.

    An edge is "orphan" when it references a concept node id that does not
    appear in the aggregated node set. This is diagnostic only: orphan edges
    are NOT dropped from the aggregated graph (dropping persisted edges would
    itself be data loss), but exposing them lets callers surface graphs that
    are partially capsuled (edges persisted, concept node not yet merged).
    """
    node_ids = {n.node_id for n in merged_nodes}
    return [
        e for e in edges
        if e.source not in node_ids or e.target not in node_ids
    ]


def load_path_capsules(
    store: Store,
    path_id: str,
) -> list[LessonCapsule]:
    """Load all persisted Lesson Capsules for a path's lessons.

    Args:
        store: Persistence layer.
        path_id: The path whose lessons to load.

    Returns:
        List of deserialised LessonCapsule objects. Lessons without a
        persisted capsule are silently skipped.

    Raises:
        ValueError: If the path does not exist in the store.
    """
    path = store.get_path(path_id)
    if path is None:
        raise ValueError(f"path {path_id!r} does not exist in the store")

    capsules: list[LessonCapsule] = []
    for lesson_id in path.lesson_ids:
        cap = load_capsule(store, lesson_id)
        if cap is not None:
            capsules.append(cap)
    return capsules


def aggregate_teacher_graph(
    store: Store,
    teacher_id: str,
) -> AggregatedPathGraph:
    """Build an aggregated knowledge graph for a teacher across all their paths.

    Finds all paths owned by *teacher_id*, loads all lesson capsules from
    those paths, and aggregates concept nodes (deduplicated by canonical/
    normalized name), edges (union) and evidence (union). The result is the
    teacher's full knowledge graph — the foundation for personalised book/map
    generation (M1-2).

    Bug fix (evidence/edge loss): edges and evidence are persisted by the T5
    graph_writer keyed on *lesson_id*, independently of whether a LessonCapsule
    was assembled for that lesson. The previous implementation early-returned an
    empty graph as soon as no capsule existed, silently discarding edges and
    evidence that were already in the store. Aggregation of edges/evidence now
    runs over the teacher's lessons regardless of capsule presence; only
    ``merged_nodes`` depends on capsules (a concept node cannot exist without a
    capsule that introduced it).

    Args:
        store: Persistence layer.
        teacher_id: The teacher whose paths to aggregate.

    Returns:
        An AggregatedPathGraph containing all merged concepts, edges, and
        evidence from all of the teacher's paths. May contain edges/evidence
        even when ``merged_nodes`` is empty (lessons graphed but not yet
        capsuled).

    Raises:
        ValueError: If the teacher has no paths in the store (typo or
            unregistered teacher).

    Cross-teacher contamination guard:
        Only paths with ``teacher_id`` matching the parameter are loaded.
        A lesson belonging to a different teacher cannot appear in the result
        because it belongs to a different path with a different ``teacher_id``.
    """
    paths = store.paths_for_teacher(teacher_id)
    if not paths:
        raise ValueError(
            f"teacher {teacher_id!r} has no paths in the store"
        )

    # Load capsules from all paths (drives concept-node merging only).
    all_capsules: list[LessonCapsule] = []
    for path in paths:
        capsules = load_path_capsules(store, path.path_id)
        all_capsules.extend(capsules)

    # Merge concept nodes. With zero capsules this yields an empty node list —
    # but we MUST NOT early-return, or persisted edges/evidence would be lost.
    merged_nodes, _key_to_id = (
        _merge_concept_nodes(all_capsules) if all_capsules else ([], {})
    )

    # Collect the teacher's lesson ids once (dedup across paths) so the
    # edge/evidence unions run independently of capsules.
    lesson_ids: list[str] = []
    seen_lessons: set[str] = set()
    for path in paths:
        for lid in path.lesson_ids:
            if lid not in seen_lessons:
                lesson_ids.append(lid)
                seen_lessons.add(lid)

    all_edges, all_evidence = _collect_edges_and_evidence(store, lesson_ids)

    return AggregatedPathGraph(
        path_id=f"teacher:{teacher_id}",
        merged_nodes=tuple(merged_nodes),
        existing_edges=tuple(all_edges),
        path_evidence=tuple(all_evidence),
    )


def aggregate_path_graph(
    store: Store,
    path_id: str,
) -> AggregatedPathGraph:
    """Build an aggregated path-level graph from all lesson capsules.

    Steps:
    1. Load all capsules for the path's lessons via ``load_path_capsules``.
    2. Deduplicate concept nodes by normalized name across lessons.
    3. Merge evidence counts and determine the most advanced status.
    4. Collect all edges and evidence from all lessons (union), keyed on the
       path's lesson_ids — independently of capsule presence so persisted
       graph data is never lost.

    Args:
        store: Persistence layer.
        path_id: The path (teacher's course) to aggregate.

    Returns:
        An AggregatedPathGraph with merged nodes, edge union, and evidence
        union. Nodes are empty if no capsules exist, but edges/evidence
        persisted for the path's lessons are still returned.

    Raises:
        ValueError: If the path does not exist.
    """
    path = store.get_path(path_id)
    if path is None:
        raise ValueError(f"path {path_id!r} does not exist in the store")

    capsules = load_path_capsules(store, path_id)

    # Merge concept nodes (empty if no capsules) — do NOT early-return.
    merged_nodes, _key_to_id = (
        _merge_concept_nodes(capsules) if capsules else ([], {})
    )

    all_edges, all_evidence = _collect_edges_and_evidence(
        store, list(path.lesson_ids)
    )

    return AggregatedPathGraph(
        path_id=path_id,
        merged_nodes=tuple(merged_nodes),
        existing_edges=tuple(all_edges),
        path_evidence=tuple(all_evidence),
    )