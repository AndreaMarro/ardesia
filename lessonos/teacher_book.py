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
  * Prerequisite chains — ``depends_on`` relationships derived from edges.

Every entry carries its lesson provenance and grounded evidence references.
"""

from __future__ import annotations

from lessonos.capsule.assembly import load_capsule
from lessonos.graph.aggregator import _normalize_name, aggregate_teacher_graph
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


def _build_per_lesson_node_map(
    store: Store,
    lesson_ids: set[str],
) -> dict[tuple[str, str], str]:
    """Build map ``{(lesson_id, normalized_concept_name) -> per_lesson_node_id}``.

    Needed to bridge per-lesson graph node IDs (used in edges/evidence) with
    aggregated concept nodes. Loads capsules from the store — cheap for real
    courses (4-40 lessons).
    """
    mapping: dict[tuple[str, str], str] = {}
    for lid in lesson_ids:
        cap = load_capsule(store, lid)
        if cap is None:
            continue
        for idx, conc in enumerate(cap.content.concepts):
            key = (lid, _normalize_name(conc.name))
            mapping[key] = f"{lid}:concept:{idx}"
    return mapping


def _count_edges_for_concept(
    node: AggregatedPathNode,
    per_lesson_ids: set[str],
    edges: tuple[GraphEdge, ...],
) -> int:
    """Count how many edges reference any of the per-lesson node IDs."""
    return sum(
        1 for e in edges
        if e.source in per_lesson_ids or e.target in per_lesson_ids
    )


def _build_citations(
    node: AggregatedPathNode,
    per_lesson_ids: set[str],
    edges: tuple[GraphEdge, ...],
    evidence: tuple[GraphEvidence, ...],
) -> tuple[GraphEvidence, ...]:
    """Collect all evidence connected to edges referencing this concept.

    Finds edges whose source or target matches any per-lesson node ID for
    this concept, then collects all evidence for those edges.
    """
    # Find edge_ids where this concept is source or target
    concept_edge_ids: set[str] = set()
    for e in edges:
        if e.source in per_lesson_ids or e.target in per_lesson_ids:
            concept_edge_ids.add(e.edge_id)

    # Collect all evidence for those edges
    all_cits: list[GraphEvidence] = []
    seen: set[str] = set()
    for ev in evidence:
        if ev.edge_id in concept_edge_ids and ev.evidence_id not in seen:
            all_cits.append(ev)
            seen.add(ev.evidence_id)

    return tuple(all_cits)


def _build_progression(
    store: Store,
    node: AggregatedPathNode,
    lesson_ids_ordered: list[str],
) -> ConceptProgression | None:
    """Build a concept's status progression across lessons.

    Loads each lesson's capsule to find the concept's per-lesson status.
    Matches by canonical name (M1-1b) so that 'Definizione di segnale'
    and 'Il segnale come grandezza fisica' (same canonical='segnale')
    are recognised as the same concept across lessons.

    Returns ``None`` if no capsule data is available.
    """
    status_seq: list[str] = []
    lesson_seq: list[str] = []
    found_first: str | None = None

    # Build a canonical→status mapping from all capsules for the node's lessons
    # Use the first concept's canonical as the lookup key
    first_canonical: str | None = None
    first_name_norm: str = _normalize_name(node.label)

    for lid in lesson_ids_ordered:
        if lid not in node.lesson_ids:
            continue
        cap = load_capsule(store, lid)
        if cap is None:
            continue
        for conc in cap.content.concepts:
            conc_canonical = conc.canonical if conc.canonical else _normalize_name(conc.name)
            # Determine the canonical key from the first match
            if first_canonical is None:
                if _normalize_name(conc.name) == first_name_norm:
                    first_canonical = conc_canonical
                    status_seq.append(conc.status)
                    lesson_seq.append(lid)
                    found_first = lid
                    break
            else:
                if conc_canonical == first_canonical:
                    status_seq.append(conc.status)
                    lesson_seq.append(lid)
                    break

    if not status_seq:
        return None

    return ConceptProgression(
        name=node.label,
        canonical=first_canonical or "",
        first_lesson=found_first or "",
        status_sequence=tuple(status_seq),
        lesson_sequence=tuple(lesson_seq),
    )


def _build_prerequisites(
    node: AggregatedPathNode,
    per_lesson_ids: set[str],
    edges: tuple[GraphEdge, ...],
    all_nodes: tuple[AggregatedPathNode, ...],
    per_lesson_node_map: dict[tuple[str, str], str],
) -> PrerequisiteChain | None:
    """Find ``depends_on`` prerequisites for a concept.

    Scans all ``depends_on`` edges targeting any of this concept's per-lesson
    node IDs and resolves the source concept's name.
    """
    prereq_names: list[str] = []
    for edge in edges:
        if edge.edge_type != "depends_on":
            continue
        if edge.target in per_lesson_ids:
            # Find the source concept name
            source_node = _find_aggregated_node_for_per_lesson_id(
                edge.source, all_nodes, per_lesson_node_map
            )
            if source_node and source_node.label != node.label:
                prereq_names.append(source_node.label)

    if not prereq_names:
        return None

    return PrerequisiteChain(
        concept=node.label,
        canonical="",
        prerequisites=tuple(sorted(set(prereq_names))),
        lesson_ids=node.lesson_ids,
    )


def _find_aggregated_node_for_per_lesson_id(
    per_lesson_id: str,
    all_nodes: tuple[AggregatedPathNode, ...],
    per_lesson_node_map: dict[tuple[str, str], str],
) -> AggregatedPathNode | None:
    """Find the aggregated node that contains a per-lesson node ID.

    Reverses the mapping built by ``_build_per_lesson_node_map``.
    """
    # Try to match by stripping lesson prefix
    for node in all_nodes:
        for lid in node.lesson_ids:
            for conc_name_norm, node_id in per_lesson_node_map.items():
                if conc_name_norm[0] == lid and node_id == per_lesson_id:
                    if _normalize_name(node.label) == conc_name_norm[1]:
                        return node
    return None


def _resolve_canonical(
    store: Store,
    node: AggregatedPathNode,
) -> str:
    """Resolve the canonical name for an aggregated concept from its capsule data.

    Tries each lesson's capsule to find the concept's ``canonical`` field
    (M1-1b). Returns empty string if not found.
    """
    for lid in node.lesson_ids:
        cap = load_capsule(store, lid)
        if cap is None:
            continue
        for conc in cap.content.concepts:
            if _normalize_name(conc.name) == _normalize_name(node.label):
                return conc.canonical
    return ""


def _build_teacher_concepts(
    store: Store,
    graph: AggregatedPathGraph,
    per_lesson_node_map: dict[tuple[str, str], str],
    lesson_ids_ordered: list[str],
) -> tuple[list[TeacherConcept], list[TeacherConcept]]:
    """Build fundamental and problematic concept lists from merged nodes.

    * Fundamental: sorted by evidence_count descending (most emphasised).
    * Problematic: concepts with ``status='problematic'``.

    Returns ``(fundamental, problematic)``.
    """
    all_concepts: list[TeacherConcept] = []
    problematic_list: list[TeacherConcept] = []

    for node in graph.merged_nodes:
        # Get per-lesson node IDs for edge matching
        node_per_lesson: set[str] = set()
        for lid in node.lesson_ids:
            key = (lid, _normalize_name(node.label))
            if key in per_lesson_node_map:
                node_per_lesson.add(per_lesson_node_map[key])

        # Count edges referencing this concept
        edge_count = _count_edges_for_concept(
            node, node_per_lesson, graph.existing_edges
        )

        # Collect evidence for edges referencing this concept
        citations = _build_citations(node, node_per_lesson, graph.existing_edges, graph.path_evidence)

        # Resolve canonical name from capsule data
        canonical = _resolve_canonical(store, node)

        tc = TeacherConcept(
            name=node.label,
            canonical=canonical,
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


def _build_all_progressions(
    store: Store,
    graph: AggregatedPathGraph,
    lesson_ids_ordered: list[str],
) -> tuple[ConceptProgression, ...]:
    """Build status progression for every concept with capsule data."""
    progressions: list[ConceptProgression] = []
    for node in graph.merged_nodes:
        prog = _build_progression(store, node, lesson_ids_ordered)
        if prog is not None:
            progressions.append(prog)
    return tuple(progressions)


def _build_all_prerequisites(
    graph: AggregatedPathGraph,
    per_lesson_node_map: dict[tuple[str, str], str],
) -> tuple[PrerequisiteChain, ...]:
    """Build prerequisite chains for concepts that have ``depends_on`` edges."""
    chains: list[PrerequisiteChain] = []
    seen: set[str] = set()
    for node in graph.merged_nodes:
        node_per_lesson: set[str] = set()
        for lid in node.lesson_ids:
            key = (lid, _normalize_name(node.label))
            if key in per_lesson_node_map:
                node_per_lesson.add(per_lesson_node_map[key])

        chain = _build_prerequisites(
            node, node_per_lesson, graph.existing_edges,
            graph.merged_nodes, per_lesson_node_map,
        )
        if chain is not None and chain.concept not in seen:
            chains.append(chain)
            seen.add(chain.concept)

    # Sort by number of prerequisites descending
    chains.sort(key=lambda c: (-len(c.prerequisites), c.concept))
    return tuple(chains)


def _get_ordered_lesson_ids(
    graph: AggregatedPathGraph,
    store: Store,
    teacher_id: str,
) -> list[str]:
    """Get lesson IDs ordered by their position in the teacher's paths."""
    ordered: list[str] = []
    seen: set[str] = set()
    paths = store.paths_for_teacher(teacher_id)
    for path in paths:
        for lid in path.lesson_ids:
            if lid not in seen:
                ordered.append(lid)
                seen.add(lid)
    return ordered


def build_teacher_book(
    store: Store,
    teacher_id: str,
) -> TeacherBook:
    """Build a structured TeacherBook from a teacher's aggregated graph.

    Fully deterministic (ZERO-LLM), grounded in the store's capsules and
    graph tables.

    Args:
        store: Persistence layer.
        teacher_id: The teacher to build the map for.

    Returns:
        A ``TeacherBook`` with structured sections, or an empty book for
        an unknown/empty teacher.

    Raises:
        ValueError: If the teacher has no paths in the store.
    """
    # Step 1: get aggregated graph
    graph = aggregate_teacher_graph(store, teacher_id)
    if not graph.merged_nodes:
        # Teacher exists but has no capsules — return empty book
        return TeacherBook(teacher_id=teacher_id)

    # Step 2: collect metadata
    lesson_ids = _get_ordered_lesson_ids(graph, store, teacher_id)
    all_lesson_ids: set[str] = set()
    for node in graph.merged_nodes:
        all_lesson_ids.update(node.lesson_ids)

    # Step 3: build per-lesson node ID mapping
    per_lesson_node_map = _build_per_lesson_node_map(store, all_lesson_ids)

    # Step 4: build concept sections
    fundamental, problematic = _build_teacher_concepts(
        store, graph, per_lesson_node_map, lesson_ids,
    )

    # Step 5: build progression
    progression = _build_all_progressions(store, graph, lesson_ids)

    # Step 6: build prerequisites
    prerequisites = _build_all_prerequisites(graph, per_lesson_node_map)

    return TeacherBook(
        teacher_id=teacher_id,
        total_concepts=len(graph.merged_nodes),
        total_lessons=len(all_lesson_ids),
        total_edges=len(graph.existing_edges),
        total_evidence=len(graph.path_evidence),
        fundamental_concepts=tuple(fundamental),
        problematic_concepts=tuple(problematic),
        progression=progression,
        prerequisites=prerequisites,
    )
