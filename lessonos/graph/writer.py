"""Project a LessonCapsule into SQLite graph tables (nodes, edges, evidence).

T5 graph_writer — pure Capsule→rows projection, ZERO LLM. Takes a
LessonCapsule (already stored), builds nodes/edges via ``build_lesson_graph``,
and persists them to the Store's graph tables together with grounded evidence
from the capsule's citations. Every ``excerpt`` in evidence is a verbatim
substring of the actual segment text (PLAN §13.4 grounding invariant) —
validated at write time via ``lessonos.graph.grounding.verify_citation``.
"""

from __future__ import annotations

import re

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import Citation
from lessonos.graph.builder import build_lesson_graph, resolve_corpus_depends_on
from lessonos.graph.grounding import verify_citation
from lessonos.models.entities import GraphEdge, GraphEvidence
from lessonos.store.base import Store

# Pattern to extract concept index from a concept node_id like "l1:concept:0"
_CONCEPT_IDX_RE = re.compile(r":concept:(\d+)$")
_EXERCISE_IDX_RE = re.compile(r":exercise:(\d+)$")


class GraphWriter:
    """Project a LessonCapsule into SQLite graph tables (nodes, edges, evidence).

    The writer is idempotent: calling ``write_capsule_graph`` twice with the
    same capsule produces identical rows in the store (INSERT OR REPLACE).
    """

    def __init__(self, store: Store) -> None:
        self.store = store

    def write_capsule_graph(self, capsule: LessonCapsule) -> int:
        """Write graph tables for *capsule* in a single transaction.

        Returns count of edges written.

        The entire DELETE+INSERT sequence is wrapped in an explicit SQLite
        transaction, so a crash mid-way does not leave the graph tables in
        a corrupted state (T5-FIX CRITICO-2).

        Workflow:
        1. Begin SQLite transaction.
        2. Delete any existing graph data for this lesson (idempotent).
        3. Build nodes/edges via ``build_lesson_graph`` (ZERO LLM).
        4. Save each node.
        5. For each edge, collect evidence from capsule citations and save
           both edge + evidence.
        6. Commit transaction (or roll back on any exception).
        """
        lesson_id = capsule.lesson_id
        self.store.begin_transaction()
        try:
            self.store.delete_graph_for_lesson(lesson_id)

            nodes, edges = build_lesson_graph(capsule)
            for node in nodes:
                self.store.save_graph_node(lesson_id, node)

            for edge in edges:
                evidence_list = self._collect_evidence(capsule, edge)
                self.store.save_graph_edge(lesson_id, edge)
                for ev in evidence_list:
                    self.store.save_evidence(ev)

            depends_on = self._persist_corpus_depends_on(capsule)
            for edge in depends_on:
                self.store.save_graph_edge(lesson_id, edge)

            self.store.commit_transaction()
            return len(edges) + len(depends_on)
        except BaseException:
            self.store.rollback_transaction()
            raise

    def _persist_corpus_depends_on(
        self, capsule: LessonCapsule
    ) -> list[GraphEdge]:
        """Resolve this lesson's prerequisites to EXISTING corpus concepts (GS-3).

        Called inside the write transaction AFTER the lesson's own concept
        nodes are saved, so the corpus snapshot already includes them (same
        connection sees the uncommitted rows). Matches each concept's
        prerequisites against every persisted concept node (canonical exact +
        high-precision fuzzy fallback) and returns the ``depends_on`` edges to
        persist — with provenance/confidence and cycle-safe against the stored
        graph. Pure resolution is delegated to
        :func:`lessonos.graph.builder.resolve_corpus_depends_on`.

        Stores that cannot enumerate the corpus return empty from
        ``all_concept_nodes`` (base default) → no cross-lesson edges, no error.
        """
        lesson_id = capsule.lesson_id
        source_concepts: list[tuple[str, str, tuple[str, ...]]] = [
            (
                f"{lesson_id}:concept:{i}",
                concept.name,
                tuple(concept.prerequisites),
            )
            for i, concept in enumerate(capsule.content.concepts)
        ]
        if not any(prereqs for _id, _name, prereqs in source_concepts):
            return []

        corpus_concepts: list[tuple[str, str]] = [
            (node.node_id, node.label)
            for node in self.store.all_concept_nodes()
            if node.label
        ]
        existing_edges: list[tuple[str, str]] = [
            (edge.source, edge.target)
            for edge in self.store.all_depends_on_edges()
        ]
        return resolve_corpus_depends_on(
            source_concepts, corpus_concepts, existing_edges
        )

    def _collect_evidence(
        self, capsule: LessonCapsule, edge: GraphEdge
    ) -> list[GraphEvidence]:
        """Collect grounded evidence for *edge* from the capsule's citations.

        For ``explains`` edges: evidence comes from the concept's citations.
        For ``assigned_in`` edges: evidence comes from the exercise's citations.
        For other edge types: no evidence (they come from path-level processing).

        Grounding validation is delegated to
        ``lessonos.graph.grounding.verify_citation`` — every seg_id is resolved
        via ``store.get_segment`` and every excerpt is verified as a
        verbatim substring. Raises ``ValueError`` if either check fails.
        """
        lesson_id = capsule.lesson_id
        evidence: list[GraphEvidence] = []

        if edge.edge_type == "explains":
            citations = self._citations_for_concept(capsule, edge)
        elif edge.edge_type == "assigned_in":
            citations = self._citations_for_exercise(capsule, edge)
        else:
            return evidence  # No evidence for other edge types yet

        for i, cit in enumerate(citations):
            excerpt = self._resolve_excerpt(cit)
            verify_citation(
                store=self.store,
                seg_id=cit.seg_id,
                excerpt=excerpt,
                lesson_id=lesson_id,
            )
            evidence.append(
                GraphEvidence(
                    evidence_id=f"{edge.edge_id}#ev{i}",
                    edge_id=edge.edge_id,
                    seg_id=cit.seg_id,
                    excerpt=excerpt,
                    confidence=cit.confidence,
                    lesson_id=lesson_id,
                )
            )

        return evidence

    def _citations_for_concept(
        self, capsule: LessonCapsule, edge: GraphEdge
    ) -> tuple[Citation, ...]:
        """Return the citations for the concept targeted by *edge*."""
        m = _CONCEPT_IDX_RE.search(edge.target)
        if m is None:
            return ()
        idx = int(m.group(1))
        concepts = capsule.content.concepts
        if idx < len(concepts):
            return concepts[idx].citations
        return ()

    def _citations_for_exercise(
        self, capsule: LessonCapsule, edge: GraphEdge
    ) -> tuple[Citation, ...]:
        """Return the citations for the exercise targeted by *edge*."""
        m = _EXERCISE_IDX_RE.search(edge.target)
        if m is None:
            return ()
        idx = int(m.group(1))
        exercises = capsule.content.exercises
        if idx < len(exercises):
            return exercises[idx].citations
        return ()

    @staticmethod
    def _resolve_excerpt(citation: Citation) -> str | None:
        """Return the citation excerpt as-is, or ``None`` if absent.

        Grounding against the segment text is done in ``_collect_evidence``
        (writer.py:83-90), not here. This method only unwraps the optional.
        """
        if citation.excerpt is not None:
            return citation.excerpt
        return None


def write_capsule_graph(store: Store, capsule: LessonCapsule) -> int:
    """Convenience: create a GraphWriter and write one capsule."""
    return GraphWriter(store).write_capsule_graph(capsule)
