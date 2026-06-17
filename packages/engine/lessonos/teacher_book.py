"""Structured teacher's map from the aggregated graph (M1-2, ZERO-LLM).

Builds a ``TeacherBook`` data structure from ``AggregatedPathGraph`` —
organising concepts into thematic sections entirely without LLM calls.

Sections produced:
  * Overview — statistics (total concepts, lessons, edges, evidence).
  * Fundamental concepts — concepts with the most evidence/connections,
    ranked descending, reflecting the teacher's pedagogical emphasis.
  * Problematic concepts — concepts where students struggled
    (``status=problematic``).
  * Status progression — how each concept evolved across lessons
    (introduced → reinforced → reviewed → mastered).
  * Prerequisite chains — ``depends_on`` edges unioned with the
    ``prerequisites`` declared on capsule concepts.

Every entry carries its lesson provenance and grounded evidence references.

M1-1c: when a ``GlobalResolution`` mapping is passed, concepts whose labels
differ across lessons are bridged through their global ``dedup_key`` —
progression and prerequisites then connect cross-lesson occurrences that the
per-lesson canonical (M1-1b) could not link. Consumption is ZERO-LLM: the
mapping is plain persisted data.
"""

from __future__ import annotations

from lessonos.capsule.assembly import LessonCapsule, load_capsule
from lessonos.graph.aggregator import (
    _lesson_ids_from_path,
    _normalize_name,
    aggregate_teacher_graph,
    dedup_key_for,
)
from lessonos.graph.resolution import GlobalResolution
from lessonos.models.entities import (
    AggregatedPathGraph,
    AggregatedPathNode,
    ConceptProgression,
    GraphEdge,
    GraphEvidence,
    PrerequisiteChain,
    TeacherBook,
    TeacherConcept,
)
from lessonos.store.base import Store


def _load_capsules(
    store: Store,
    lesson_ids: set[str],
) -> dict[str, LessonCapsule]:
    """Load each lesson's capsule once (real capsules are large JSON blobs)."""
    capsules: dict[str, LessonCapsule] = {}
    for lid in lesson_ids:
        cap = load_capsule(store, lid)
        if cap is not None:
            capsules[lid] = cap
    return capsules


def _build_key_maps(
    capsules: dict[str, LessonCapsule],
    lookup: dict[tuple[str, str], str] | None,
) -> tuple[dict[tuple[str, str], set[str]], dict[str, str]]:
    """Bridge per-lesson graph node IDs with aggregated dedup keys.

    Returns:
        key_map: ``{(lesson_id, dedup_key) -> {per_lesson_node_id, ...}}``
            (a set — the same concept can be mentioned more than once in a
            lesson and merged under one key).
        plid_to_key: ``{per_lesson_node_id -> dedup_key}`` (reverse lookup
            for edge endpoints).
    """
    key_map: dict[tuple[str, str], set[str]] = {}
    plid_to_key: dict[str, str] = {}
    for lid, cap in capsules.items():
        for idx, conc in enumerate(cap.content.concepts):
            key = dedup_key_for(conc, lid, lookup)
            plid = f"{lid}:concept:{idx}"
            key_map.setdefault((lid, key), set()).add(plid)
            plid_to_key[plid] = key
    return key_map, plid_to_key


def _per_lesson_ids_for_node(
    node: AggregatedPathNode,
    key_map: dict[tuple[str, str], set[str]],
) -> set[str]:
    """All per-lesson graph node IDs that were merged into *node*."""
    ids: set[str] = set()
    for lid in node.lesson_ids:
        ids |= key_map.get((lid, node.dedup_key), set())
    return ids


def _count_edges_for_concept(
    per_lesson_ids: set[str],
    edges: tuple[GraphEdge, ...],
) -> int:
    """Count how many edges reference any of the per-lesson node IDs."""
    return sum(
        1 for e in edges
        if e.source in per_lesson_ids or e.target in per_lesson_ids
    )


def _build_citations(
    per_lesson_ids: set[str],
    edges: tuple[GraphEdge, ...],
    evidence: tuple[GraphEvidence, ...],
) -> tuple[GraphEvidence, ...]:
    """Collect all evidence connected to edges referencing this concept."""
    concept_edge_ids: set[str] = set()
    for e in edges:
        if e.source in per_lesson_ids or e.target in per_lesson_ids:
            concept_edge_ids.add(e.edge_id)

    all_cits: list[GraphEvidence] = []
    seen: set[str] = set()
    for ev in evidence:
        if ev.edge_id in concept_edge_ids and ev.evidence_id not in seen:
            all_cits.append(ev)
            seen.add(ev.evidence_id)

    return tuple(all_cits)


def _build_progression(
    node: AggregatedPathNode,
    capsules: dict[str, LessonCapsule],
    lesson_ids_ordered: list[str],
    lookup: dict[tuple[str, str], str] | None,
) -> ConceptProgression | None:
    """Build a concept's status progression across lessons.

    Occurrences are matched through the node's ``dedup_key`` — with a global
    resolution mapping (M1-1c) this links lessons where the concept appears
    under a different label (e.g. 'Definizione di segnale' →
    'Il segnale come grandezza fisica').

    Returns ``None`` if no capsule data is available.
    """
    status_seq: list[str] = []
    lesson_seq: list[str] = []

    for lid in lesson_ids_ordered:
        if lid not in node.lesson_ids:
            continue
        cap = capsules.get(lid)
        if cap is None:
            continue
        for conc in cap.content.concepts:
            if dedup_key_for(conc, lid, lookup) == node.dedup_key:
                status_seq.append(conc.status)
                lesson_seq.append(lid)
                break

    if not status_seq:
        return None

    return ConceptProgression(
        name=node.label,
        canonical=node.dedup_key,
        first_lesson=lesson_seq[0],
        status_sequence=tuple(status_seq),
        lesson_sequence=tuple(lesson_seq),
    )


def _capsule_prerequisites(
    node: AggregatedPathNode,
    capsules: dict[str, LessonCapsule],
    lookup: dict[tuple[str, str], str] | None,
    key_to_node: dict[str, AggregatedPathNode],
) -> list[str]:
    """Prerequisites declared on the concept itself in the lesson capsules.

    Each prerequisite name is resolved to its aggregated node (through the
    resolution mapping when available, else the normalised name) so the chain
    points at the merged concept's label; names that match no node (e.g.
    out-of-course prerequisites like 'limiti') are kept verbatim.
    """
    names: list[str] = []
    for lid in node.lesson_ids:
        cap = capsules.get(lid)
        if cap is None:
            continue
        for conc in cap.content.concepts:
            if dedup_key_for(conc, lid, lookup) != node.dedup_key:
                continue
            for prereq in conc.prerequisites:
                key = None
                if lookup:
                    key = lookup.get((lid, _normalize_name(prereq)))
                if key is None:
                    key = _normalize_name(prereq)
                target = key_to_node.get(key)
                if target is not None and target.dedup_key == node.dedup_key:
                    continue  # self-reference, skip
                names.append(target.label if target is not None else prereq)
    return names


def _build_prerequisites(
    node: AggregatedPathNode,
    per_lesson_ids: set[str],
    edges: tuple[GraphEdge, ...],
    plid_to_key: dict[str, str],
    key_to_node: dict[str, AggregatedPathNode],
    capsules: dict[str, LessonCapsule],
    lookup: dict[tuple[str, str], str] | None,
) -> PrerequisiteChain | None:
    """Find prerequisites for a concept.

    Two grounded sources, unioned:
      * ``depends_on`` edges targeting any of this concept's per-lesson node
        IDs (source concept resolved through its dedup key);
      * ``prerequisites`` declared on the concept in the lesson capsules
        (the only source present in corpora whose graphs carry no
        ``depends_on`` edges).
    """
    prereq_names: list[str] = []
    for edge in edges:
        if edge.edge_type != "depends_on":
            continue
        if edge.target in per_lesson_ids:
            source_key = plid_to_key.get(edge.source)
            source_node = (
                key_to_node.get(source_key) if source_key is not None else None
            )
            if source_node and source_node.dedup_key != node.dedup_key:
                prereq_names.append(source_node.label)

    prereq_names.extend(
        _capsule_prerequisites(node, capsules, lookup, key_to_node)
    )

    if not prereq_names:
        return None

    return PrerequisiteChain(
        concept=node.label,
        canonical=node.dedup_key,
        prerequisites=tuple(sorted(set(prereq_names))),
        lesson_ids=node.lesson_ids,
    )


def _build_teacher_concepts(
    graph: AggregatedPathGraph,
    key_map: dict[tuple[str, str], set[str]],
) -> tuple[list[TeacherConcept], list[TeacherConcept]]:
    """Build fundamental and problematic concept lists from merged nodes.

    * Fundamental: sorted by evidence_count descending (most emphasised).
    * Problematic: concepts with ``status='problematic'``.

    Returns ``(fundamental, problematic)``.
    """
    all_concepts: list[TeacherConcept] = []
    problematic_list: list[TeacherConcept] = []

    for node in graph.merged_nodes:
        node_per_lesson = _per_lesson_ids_for_node(node, key_map)

        edge_count = _count_edges_for_concept(
            node_per_lesson, graph.existing_edges
        )
        citations = _build_citations(
            node_per_lesson, graph.existing_edges, graph.path_evidence
        )

        tc = TeacherConcept(
            name=node.label,
            canonical=node.dedup_key,
            status=node.status,
            lesson_ids=node.lesson_ids,
            edge_count=edge_count,
            evidence_count=node.evidence_count,
            citations=citations,
        )
        all_concepts.append(tc)

        if node.status == "problematic":
            problematic_list.append(tc)

    # Sort fundamental by evidence_count descending (teacher emphasis)
    all_concepts.sort(key=lambda c: (-c.evidence_count, -c.edge_count, c.name))
    # Sort problematic by evidence_count descending
    problematic_list.sort(key=lambda c: (-c.evidence_count, -c.edge_count, c.name))

    return all_concepts, problematic_list


def _get_ordered_lesson_ids(
    store: Store,
    teacher_id: str,
) -> list[str]:
    """Get lesson IDs ordered by their position in the teacher's paths."""
    ordered: list[str] = []
    seen: set[str] = set()
    paths = store.paths_for_teacher(teacher_id)
    for path in paths:
        for lid in _lesson_ids_from_path(store, path):
            if lid not in seen:
                ordered.append(lid)
                seen.add(lid)
    return ordered


def build_teacher_book(
    store: Store,
    teacher_id: str,
    *,
    resolution: GlobalResolution | None = None,
) -> TeacherBook:
    """Build a structured TeacherBook from a teacher's aggregated graph.

    Fully deterministic (ZERO-LLM), grounded in the store's capsules and
    graph tables. When *resolution* (M1-1c global concept mapping, plain
    persisted data) is provided, cross-lesson occurrences with different
    labels are linked through their global canonical — progression and
    prerequisites then span lessons.

    Args:
        store: Persistence layer.
        teacher_id: The teacher to build the map for.
        resolution: Optional global concept mapping for this teacher.

    Returns:
        A ``TeacherBook`` with structured sections, or an empty book for
        an unknown/empty teacher.

    Raises:
        ValueError: If the teacher has no paths in the store, or the
            resolution mapping belongs to a different teacher.
    """
    # Step 1: get aggregated graph (validates teacher + resolution match)
    graph = aggregate_teacher_graph(store, teacher_id, resolution=resolution)
    if not graph.merged_nodes:
        # Teacher exists but has no capsules — return empty book
        return TeacherBook(teacher_id=teacher_id)

    lookup = resolution.alias_lookup() if resolution is not None else None

    # Step 2: collect metadata
    lesson_ids = _get_ordered_lesson_ids(store, teacher_id)
    all_lesson_ids: set[str] = set()
    for node in graph.merged_nodes:
        all_lesson_ids.update(node.lesson_ids)

    # Step 3: load capsules once and bridge per-lesson node IDs ↔ dedup keys
    capsules = _load_capsules(store, all_lesson_ids)
    key_map, plid_to_key = _build_key_maps(capsules, lookup)
    key_to_node = {n.dedup_key: n for n in graph.merged_nodes}

    # Step 4: build concept sections
    fundamental, problematic = _build_teacher_concepts(graph, key_map)

    # Step 5: build progression
    progression = tuple(
        prog
        for node in graph.merged_nodes
        if (prog := _build_progression(node, capsules, lesson_ids, lookup))
        is not None
    )

    # Step 6: build prerequisites
    chains: list[PrerequisiteChain] = []
    seen_chain: set[str] = set()
    for node in graph.merged_nodes:
        node_per_lesson = _per_lesson_ids_for_node(node, key_map)
        chain = _build_prerequisites(
            node, node_per_lesson, graph.existing_edges,
            plid_to_key, key_to_node, capsules, lookup,
        )
        if chain is not None and chain.concept not in seen_chain:
            chains.append(chain)
            seen_chain.add(chain.concept)
    chains.sort(key=lambda c: (-len(c.prerequisites), c.concept))

    return TeacherBook(
        teacher_id=teacher_id,
        total_concepts=len(graph.merged_nodes),
        total_lessons=len(all_lesson_ids),
        total_edges=len(graph.existing_edges),
        total_evidence=len(graph.path_evidence),
        fundamental_concepts=tuple(fundamental),
        problematic_concepts=tuple(problematic),
        progression=progression,
        prerequisites=tuple(chains),
    )
