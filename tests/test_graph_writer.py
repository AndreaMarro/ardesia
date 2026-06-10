"""Tests for GraphWriter — pure Capsule → SQLite graph tables (T5).

Tests cover:
- writes nodes, edges, evidence from a capsule
- every edge with citations gets evidence with real-excerpt
- edge with empty citations: saved without evidence (no crash)
- idempotent: write twice, same result
"""

import json

import pytest

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import (
    Citation,
    ConceptExtraction,
    ExerciseExtraction,
    HomeworkExtraction,
    LessonContent,
    QuestionExtraction,
)
from lessonos.capsule.segmentation import TopicSpan
from lessonos.graph.builder import build_lesson_graph
from lessonos.graph.writer import GraphWriter, write_capsule_graph
from lessonos.models.entities import GraphEvidence, Segment
from lessonos.store.sqlite import SQLiteStore

# Fixture segment texts — must be long enough for real-substring excerpts
_SEG0 = "Derivative is the rate of change of a function with respect to its variable."
_SEG1 = "The limit as h approaches 0 of the difference quotient is the derivative."
_SEG2 = "Power rule: the derivative of x^n is n times x to the n minus one."


@pytest.fixture
def store() -> SQLiteStore:
    """Fresh :memory: store with 3 segments ingested for lesson 'l1'."""
    s = SQLiteStore(":memory:")
    # Ingest segments
    seg0 = Segment(seg_id="l1#s0", lesson_id="l1", start=0, end=15, text=_SEG0)
    seg1 = Segment(seg_id="l1#s1", lesson_id="l1", start=15, end=30, text=_SEG1)
    seg2 = Segment(seg_id="l1#s2", lesson_id="l1", start=30, end=45, text=_SEG2)
    s.save_segment(seg0)
    s.save_segment(seg1)
    s.save_segment(seg2)
    return s


def _make_capsule(
    lesson_id: str = "l1",
    concept_names: list[str] | None = None,
    exercise_prompts: list[str] | None = None,
) -> LessonCapsule:
    """Build a minimal grounded capsule with real-segment citations.

    Each concept/exercise gets a citation pointing to a real segment in the
    fixture store, with an excerpt that is a verbatim substring.
    """
    concepts = []
    for i, name in enumerate(concept_names or ["Derivative"]):
        # Use seg0 for first concept, seg1 for second, etc.
        seg_idx = i % 3
        seg_id = f"l1#s{seg_idx}"
        seg_text = [_SEG0, _SEG1, _SEG2][seg_idx]
        # Excerpt = first 20 chars of segment text (guaranteed substring)
        excerpt = seg_text[:20]
        concepts.append(
            ConceptExtraction(
                name=name,
                status="introduced",
                prerequisites=(),
                citations=(Citation(seg_id=seg_id, excerpt=excerpt, confidence=0.9),),
            )
        )

    exercises = []
    for i, prompt in enumerate(exercise_prompts or []):
        seg_idx = (i + 1) % 3
        seg_id = f"l1#s{seg_idx}"
        seg_text = [_SEG0, _SEG1, _SEG2][seg_idx]
        excerpt = seg_text[5:25]  # Different offset, still verbatim
        exercises.append(
            ExerciseExtraction(
                prompt=prompt,
                solution=None,
                citations=(Citation(seg_id=seg_id, excerpt=excerpt, confidence=0.8),),
            )
        )

    content = LessonContent(
        lesson_id=lesson_id,
        concepts=tuple(concepts),
        exercises=tuple(exercises),
        student_questions=(),
        homework=(),
    )
    timeline = (
        TopicSpan(
            lesson_id=lesson_id,
            topic="Introduction",
            seg_ids=("l1#s0",),
            start=0,
            end=15,
        ),
    )
    return LessonCapsule(
        lesson_id=lesson_id,
        timeline=timeline,
        content=content,
    )


# ===================================================================
# write_capsule_graph — basic smoke
# ===================================================================


class TestWriteCapsuleGraph:
    def test_writes_nodes_from_single_concept(self, store: SQLiteStore):
        """A single-concept capsule writes 2 nodes (lesson + concept)."""
        capsule = _make_capsule(concept_names=["Derivative"])
        writer = GraphWriter(store)
        n_edges = writer.write_capsule_graph(capsule)
        assert n_edges == 1  # 1 explains edge

        nodes = store.get_graph_nodes_for_lesson("l1")
        node_ids = {n.node_id for n in nodes}
        assert "l1" in node_ids  # lesson node
        assert "l1:concept:0" in node_ids  # concept node
        assert len(nodes) == 2

    def test_writes_edges_from_concept(self, store: SQLiteStore):
        """An explains edge is written for each concept."""
        capsule = _make_capsule(concept_names=["Derivative", "Limit"])
        writer = GraphWriter(store)
        n_edges = writer.write_capsule_graph(capsule)
        assert n_edges == 2  # 2 explains edges

        edges = store.get_graph_edges_for_lesson("l1")
        assert len(edges) == 2
        edge_types = {e.edge_type for e in edges}
        assert edge_types == {"explains"}

    def test_writes_exercise_edge(self, store: SQLiteStore):
        """An exercise adds an assigned_in edge."""
        capsule = _make_capsule(
            concept_names=["Derivative"],
            exercise_prompts=["Solve f'(x) = 2x"],
        )
        writer = GraphWriter(store)
        n_edges = writer.write_capsule_graph(capsule)
        # 1 explains + 1 assigned_in
        assert n_edges == 2

        edges = store.get_graph_edges_for_lesson("l1")
        edge_types = {e.edge_type for e in edges}
        assert "explains" in edge_types
        assert "assigned_in" in edge_types

    def test_writes_evidence_for_concept_edge(self, store: SQLiteStore):
        """Explains edge gets evidence from concept citation."""
        capsule = _make_capsule(concept_names=["Derivative"])
        writer = GraphWriter(store)
        writer.write_capsule_graph(capsule)

        # There should be 1 evidence for the explains edge
        all_evidence = store.get_all_evidence_for_lesson("l1")
        assert len(all_evidence) == 1
        ev = all_evidence[0]
        # Edge ID for the explains edge
        expected_edge = "l1-explains->l1:concept:0"
        assert ev.edge_id == expected_edge
        assert ev.seg_id == "l1#s0"  # First concept uses seg0
        # Excerpt should be the first 20 chars of _SEG0
        assert ev.excerpt == _SEG0[:20]
        assert ev.confidence == 0.9
        assert ev.lesson_id == "l1"

    def test_writes_evidence_for_exercise_edge(self, store: SQLiteStore):
        """Assigned_in edge gets evidence from exercise citation."""
        capsule = _make_capsule(
            concept_names=["Derivative"],
            exercise_prompts=["Compute the derivative"],
        )
        writer = GraphWriter(store)
        writer.write_capsule_graph(capsule)

        all_evidence = store.get_all_evidence_for_lesson("l1")
        # 1 from concept + 1 from exercise = 2
        assert len(all_evidence) == 2

        # Find the exercise evidence
        exercise_evidence = [ev for ev in all_evidence if "assigned_in" in ev.edge_id]
        assert len(exercise_evidence) == 1
        ev = exercise_evidence[0]
        assert ev.seg_id == "l1#s1"  # First exercise uses seg1
        assert ev.excerpt == _SEG1[5:25]  # Different offset
        assert ev.confidence == 0.8

    def test_evidence_excerpt_is_real_substring(self, store: SQLiteStore):
        """Every evidence excerpt is a verbatim substring of the segment text."""
        capsule = _make_capsule(
            concept_names=["Derivative", "Limit"],
            exercise_prompts=["Compute", "Solve"],
        )
        writer = GraphWriter(store)
        writer.write_capsule_graph(capsule)

        all_evidence = store.get_all_evidence_for_lesson("l1")
        for ev in all_evidence:
            segment = store.get_segment(ev.seg_id)
            assert segment is not None, f"Segment {ev.seg_id} not found"
            assert ev.excerpt is not None, f"Evidence {ev.evidence_id} has no excerpt"
            assert ev.excerpt in segment.text, (
                f"Excerpt {ev.excerpt!r} not in segment {ev.seg_id}: {segment.text!r}"
            )

    def test_edge_without_citations_skips_evidence(self, store: SQLiteStore):
        """An edge whose source has empty citations is saved without evidence."""
        # Build a concept with NO citations
        content = LessonContent(
            lesson_id="l1",
            concepts=(
                ConceptExtraction(
                    name="NoCitationConcept",
                    status="introduced",
                    citations=(),
                ),
            ),
            exercises=(),
            student_questions=(),
            homework=(),
        )
        capsule = LessonCapsule(
            lesson_id="l1",
            timeline=(),
            content=content,
        )
        writer = GraphWriter(store)
        n_edges = writer.write_capsule_graph(capsule)
        assert n_edges == 1  # 1 explains edge

        edges = store.get_graph_edges_for_lesson("l1")
        assert len(edges) == 1

        # No evidence for this edge
        all_evidence = store.get_all_evidence_for_lesson("l1")
        assert len(all_evidence) == 0

    def test_raises_on_nonexistent_seg_id(self, store: SQLiteStore):
        """Non-existent seg_id in citation raises ValueError."""
        content = LessonContent(
            lesson_id="l1",
            concepts=(
                ConceptExtraction(
                    name="BadSeg",
                    status="introduced",
                    citations=(
                        Citation(seg_id="l1#nonexistent", excerpt="test"),
                    ),
                ),
            ),
            exercises=(),
            student_questions=(),
            homework=(),
        )
        capsule = LessonCapsule(
            lesson_id="l1",
            timeline=(),
            content=content,
        )
        writer = GraphWriter(store)
        with pytest.raises(ValueError, match="does not resolve"):
            writer.write_capsule_graph(capsule)

    def test_raises_on_nonverbatim_excerpt(self, store: SQLiteStore):
        """Excerpt that is not a verbatim substring of segment raises ValueError."""
        content = LessonContent(
            lesson_id="l1",
            concepts=(
                ConceptExtraction(
                    name="BadExcerpt",
                    status="introduced",
                    citations=(
                        Citation(
                            seg_id="l1#s0",
                            excerpt="This text is NOT in the segment at all",
                        ),
                    ),
                ),
            ),
            exercises=(),
            student_questions=(),
            homework=(),
        )
        capsule = LessonCapsule(
            lesson_id="l1",
            timeline=(),
            content=content,
        )
        writer = GraphWriter(store)
        with pytest.raises(ValueError, match="not a verbatim substring"):
            writer.write_capsule_graph(capsule)


# ===================================================================
# Idempotency
# ===================================================================


class TestGraphWriterIdempotent:
    def test_write_twice_produces_same_nodes(self, store: SQLiteStore):
        """Writing the same capsule twice yields identical node set."""
        capsule = _make_capsule(concept_names=["Derivative", "Limit"])
        writer = GraphWriter(store)

        writer.write_capsule_graph(capsule)
        nodes1 = store.get_graph_nodes_for_lesson("l1")

        writer.write_capsule_graph(capsule)
        nodes2 = store.get_graph_nodes_for_lesson("l1")

        assert nodes1 == nodes2

    def test_write_twice_produces_same_edges(self, store: SQLiteStore):
        """Writing the same capsule twice yields identical edge set."""
        capsule = _make_capsule(
            concept_names=["Derivative"],
            exercise_prompts=["Exercise A"],
        )
        writer = GraphWriter(store)

        writer.write_capsule_graph(capsule)
        edges1 = store.get_graph_edges_for_lesson("l1")

        writer.write_capsule_graph(capsule)
        edges2 = store.get_graph_edges_for_lesson("l1")

        assert edges1 == edges2

    def test_write_twice_produces_same_evidence(self, store: SQLiteStore):
        """Writing the same capsule twice yields identical evidence set."""
        capsule = _make_capsule(
            concept_names=["Derivative"],
            exercise_prompts=["Compute the limit"],
        )
        writer = GraphWriter(store)

        writer.write_capsule_graph(capsule)
        ev1 = store.get_all_evidence_for_lesson("l1")

        writer.write_capsule_graph(capsule)
        ev2 = store.get_all_evidence_for_lesson("l1")

        assert ev1 == ev2

    def test_write_twice_nonzero_counts(self, store: SQLiteStore):
        """Idempotent write preserves correct counts."""
        capsule = _make_capsule(
            concept_names=["A", "B"],
            exercise_prompts=["Ex1"],
        )
        writer = GraphWriter(store)

        writer.write_capsule_graph(capsule)
        # 1st write
        n_nodes1 = len(store.get_graph_nodes_for_lesson("l1"))
        n_edges1 = len(store.get_graph_edges_for_lesson("l1"))
        n_ev1 = len(store.get_all_evidence_for_lesson("l1"))

        writer.write_capsule_graph(capsule)
        # 2nd write
        n_nodes2 = len(store.get_graph_nodes_for_lesson("l1"))
        n_edges2 = len(store.get_graph_edges_for_lesson("l1"))
        n_ev2 = len(store.get_all_evidence_for_lesson("l1"))

        assert n_nodes1 == n_nodes2 == 4  # 1 lesson + 2 concepts + 1 exercise
        assert n_edges1 == n_edges2 == 3  # 2 explains + 1 assigned_in
        assert n_ev1 == n_ev2 == 3  # 2 concept citations + 1 exercise citation


# ===================================================================
# Grounding invariants (T5-FIX CRITICI-1 and CRITICI-2)
# ===================================================================


class TestGroundingInvariants:
    """Cross-lesson contamination prevention + transaction atomicity."""

    @pytest.fixture
    def cross_lesson_store(self) -> SQLiteStore:
        """Store with segments from two different lessons, sharing verbatim text."""
        s = SQLiteStore(":memory:")
        s.save_segment(Segment(seg_id="l1#s0", lesson_id="l1", start=0, end=15, text=_SEG0))
        s.save_segment(Segment(seg_id="l1#s1", lesson_id="l1", start=15, end=30, text=_SEG1))
        # l2 segment with verbatim-identical text to l1#s0 — cross-lesson threat
        s.save_segment(Segment(seg_id="l2#s0", lesson_id="l2", start=0, end=15, text=_SEG0))
        return s

    def test_cross_lesson_segment_rejected(self, cross_lesson_store: SQLiteStore):
        """Capsule from l1 citing l2#s0 → ValueError (cross-lesson contamination)."""
        # Build a minimal l1 capsule that cites l2#s0 with a verbatim excerpt
        content = LessonContent(
            lesson_id="l1",
            concepts=(
                ConceptExtraction(
                    name="CrossLesson",
                    status="introduced",
                    citations=(
                        Citation(seg_id="l2#s0", excerpt=_SEG0[:20], confidence=0.9),
                    ),
                ),
            ),
            exercises=(),
            student_questions=(),
            homework=(),
        )
        capsule = LessonCapsule(lesson_id="l1", timeline=(), content=content)
        writer = GraphWriter(cross_lesson_store)
        with pytest.raises(ValueError, match="cross-lesson contamination"):
            writer.write_capsule_graph(capsule)

    def test_transaction_rollback_on_error(self, store: SQLiteStore):
        """On crash mid-write, the graph tables remain clean (rollback)."""
        # First write a valid capsule so there's data to corrupt
        valid_capsule = _make_capsule(concept_names=["Derivative"], lesson_id="l1")
        writer = GraphWriter(store)
        writer.write_capsule_graph(valid_capsule)
        assert len(store.get_graph_nodes_for_lesson("l1")) == 2

        # Now attempt a write that will fail mid-way (non-existent seg_id)
        bad_content = LessonContent(
            lesson_id="l1",
            concepts=(
                ConceptExtraction(
                    name="BadRef",
                    status="introduced",
                    citations=(
                        Citation(seg_id="l1#nonexistent", excerpt="fake"),
                    ),
                ),
            ),
            exercises=(),
            student_questions=(),
            homework=(),
        )
        bad_capsule = LessonCapsule(lesson_id="l1", timeline=(), content=bad_content)
        with pytest.raises(ValueError, match="does not resolve"):
            writer.write_capsule_graph(bad_capsule)

        # After rollback, graph tables must be back to the first write's state
        # (delete rolled back, pre-existing data preserved)
        assert len(store.get_graph_nodes_for_lesson("l1")) == 2
        assert len(store.get_graph_edges_for_lesson("l1")) == 1
        assert len(store.get_all_evidence_for_lesson("l1")) == 1


# ===================================================================
# convenience write_capsule_graph function
# ===================================================================


class TestConvenienceFunction:
    def test_write_capsule_graph_function(self, store: SQLiteStore):
        """The module-level write_capsule_graph works."""
        capsule = _make_capsule(concept_names=["Derivative"])
        n = write_capsule_graph(store, capsule)
        assert n == 1
        nodes = store.get_graph_nodes_for_lesson("l1")
        assert len(nodes) == 2
