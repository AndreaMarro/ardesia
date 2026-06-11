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
    """Deduplicate concept nodes by normalized name across capsules.

    Returns:
        merged_nodes: List of AggregatedPathNode (one per unique concept).
        name_to_id: Mapping from normalized name to assigned node_id.
    """
    # Accumulate per-normalized-name: label, statuses, lesson_ids, evidence_count
    accum: dict[str, dict] = {}
    # Track first concept_id seen for each name (for deterministic node_id)
    name_to_first_concept: dict[str, str] = {}

    for capsule in capsules:
        lid = capsule.lesson_id
        for idx, concept in enumerate(capsule.content.concepts):
            name = _normalize_name(concept.name)
            if not name:
                continue
            if name not in accum:
                accum[name] = {
                    "label": concept.name,
                    "statuses": [],
                    "lesson_ids": [],
                    "ev_count": 0,
                }
            d = accum[name]
            d["statuses"].append(concept.status)
            if lid not in d["lesson_ids"]:
                d["lesson_ids"].append(lid)
            d["ev_count"] += len(concept.citations)

            # Remember the first concept_id for this name (deterministic)
            if name not in name_to_first_concept:
                name_to_first_concept[name] = f"{lid}:concept:{idx}"

    # Build AggregatedPathNode list and name_to_id mapping
    merged_nodes: list[AggregatedPathNode] = []
    name_to_id: dict[str, str] = {}
    node_ids_seen: set[str] = set()

    for name, d in accum.items():
        first_conc = name_to_first_concept[name]
        node_id = f"path:{first_conc}"
        base_id = node_id
        counter = 1
        while node_id in node_ids_seen:
            node_id = f"{base_id}__{counter}"
            counter += 1
        node_ids_seen.add(node_id)
        name_to_id[name] = node_id

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

    return merged_nodes, name_to_id


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


def aggregate_path_graph(
    store: Store,
    path_id: str,
) -> AggregatedPathGraph:
    """Build an aggregated path-level graph from all lesson capsules.

    Steps:
    1. Load all capsules for the path's lessons via ``load_path_capsules``.
    2. Deduplicate concept nodes by normalized name across lessons.
    3. Merge evidence counts and determine the most advanced status.
    4. Collect all edges and evidence from all lessons (union).

    Args:
        store: Persistence layer.
        path_id: The path (teacher's course) to aggregate.

    Returns:
        An AggregatedPathGraph with merged nodes, edge union, and evidence
        union. Returns an empty graph if no capsules exist.

    Raises:
        ValueError: If the path does not exist.
    """
    capsules = load_path_capsules(store, path_id)
    if not capsules:
        return AggregatedPathGraph(path_id=path_id)

    # Merge concept nodes
    merged_nodes, _name_to_id = _merge_concept_nodes(capsules)

    # Collect all edges across all capsules (union)
    all_edges: list[GraphEdge] = []
    edge_ids_seen: set[str] = set()
    for caps in capsules:
        edges = store.get_graph_edges_for_lesson(caps.lesson_id)
        for edge in edges:
            if edge.edge_id not in edge_ids_seen:
                all_edges.append(edge)
                edge_ids_seen.add(edge.edge_id)

    # Collect all evidence (union)
    all_evidence: list[GraphEvidence] = []
    ev_ids_seen: set[str] = set()
    for caps in capsules:
        evidence_list = store.get_all_evidence_for_lesson(caps.lesson_id)
        for ev in evidence_list:
            if ev.evidence_id not in ev_ids_seen:
                all_evidence.append(ev)
                ev_ids_seen.add(ev.evidence_id)

    return AggregatedPathGraph(
        path_id=path_id,
        merged_nodes=tuple(merged_nodes),
        existing_edges=tuple(all_edges),
        path_evidence=tuple(all_evidence),
    )
