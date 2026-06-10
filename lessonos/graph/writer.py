"""Project a LessonCapsule into SQLite graph tables (nodes, edges, evidence).

T5 graph_writer — pure Capsule→rows projection, ZERO LLM. Takes a
LessonCapsule (already stored), builds nodes/edges via ``build_lesson_graph``,
and persists them to the Store's graph tables together with grounded evidence
from the capsule's citations. Every ``excerpt`` in evidence is a verbatim
substring of the actual segment text (PLAN §13.4 grounding invariant) —
validated at write time via ``store.get_segment`` (writer.py:83-90).
"""

from __future__ import annotations

import re

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import Citation
from lessonos.graph.builder import build_lesson_graph
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

            self.store.commit_transaction()
            return len(edges)
        except BaseException:
            self.store.rollback_transaction()
            raise

    def _collect_evidence(
        self, capsule: LessonCapsule, edge: GraphEdge
    ) -> list[GraphEvidence]:
        """Collect grounded evidence for *edge* from the capsule's citations.

        For ``explains`` edges: evidence comes from the concept's citations.
        For ``assigned_in`` edges: evidence comes from the exercise's citations.
        For other edge types: no evidence (they come from path-level processing).

        Grounding validation (writer.py:83-90): every ``seg_id`` is resolved
        via ``store.get_segment`` and every ``excerpt`` is verified as a
        verbatim substring of the segment text. Raises ``ValueError`` if
        either check fails.
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
            # Grounding check 1: seg_id MUST resolve to a persisted segment
            seg = self.store.get_segment(cit.seg_id)
            if seg is None:
                raise ValueError(
                    f"evidence seg_id {cit.seg_id!r} does not resolve to a "
                    f"persisted segment (edge={edge.edge_id})"
                )
            # Grounding check 1b: segment MUST belong to the capsule's lesson
            # (prevents cross-lesson contamination where a verbatim excerpt
            # from another lesson's segment could be cited)
            if seg.lesson_id != capsule.lesson_id:
                raise ValueError(
                    f"evidence seg_id {cit.seg_id!r} resolves to lesson "
                    f"{seg.lesson_id!r} but capsule is for lesson "
                    f"{capsule.lesson_id!r} (cross-lesson contamination)"
                )
            # Grounding check 2: excerpt MUST be a verbatim substring
            excerpt = self._resolve_excerpt(cit)
            if excerpt is not None and excerpt not in seg.text:
                raise ValueError(
                    f"evidence excerpt {excerpt!r} is not a verbatim substring "
                    f"of segment {cit.seg_id}: {seg.text!r}"
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
