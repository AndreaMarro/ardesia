"""Tests for TeacherBook markdown renderer (M1-3, ZERO-LLM)."""

from __future__ import annotations

from lessonos.models.entities import (
    ConceptProgression,
    GraphEvidence,
    PrerequisiteChain,
    TeacherBook,
    TeacherConcept,
)
from lessonos.teacher_book_renderer import (
    render_comparative_report,
    render_qualitative_diff,
    render_teacher_book,
)


def _make_evidence(seg_id: str, idx: int = 0) -> GraphEvidence:
    return GraphEvidence(
        evidence_id=f"ev{idx}",
        edge_id=f"e{idx}",
        seg_id=seg_id,
        excerpt=f"Example excerpt {idx} from {seg_id}",
        confidence=1.0,
        lesson_id="test_lesson",
    )


def _make_concept(
    name: str,
    evidence_count: int = 1,
    status: str = "introduced",
) -> TeacherConcept:
    return TeacherConcept(
        name=name,
        canonical=name.lower(),
        status=status,
        lesson_ids=("test_lesson",),
        edge_count=1,
        evidence_count=evidence_count,
        citations=tuple(
            _make_evidence(f"test_lesson#s{i}", i) for i in range(evidence_count)
        ),
    )


class TestRenderTeacherBook:
    """Tests for ``render_teacher_book``."""

    def test_basic_structure(self) -> None:
        """Render produces all expected sections."""
        book = TeacherBook(
            teacher_id="test_teacher",
            total_concepts=5,
            total_lessons=1,
            total_edges=3,
            total_evidence=7,
            fundamental_concepts=(
                _make_concept("Acceleration", 3),
                _make_concept("Velocity", 2),
            ),
            problematic_concepts=(),
            progression=(
                ConceptProgression(
                    name="Velocity",
                    canonical="velocity",
                    first_lesson="l1",
                    status_sequence=("introduced", "reinforced"),
                    lesson_sequence=("l1", "l2"),
                ),
            ),
            prerequisites=(
                PrerequisiteChain(
                    concept="Acceleration",
                    canonical="acceleration",
                    prerequisites=("Velocity",),
                    lesson_ids=("l2",),
                ),
            ),
        )

        md = render_teacher_book(book)
        assert md.startswith("# Teacher Book: test_teacher")
        assert "## Overview" in md
        assert "## Fundamental Concepts" in md
        assert "## Problematic Concepts" in md
        assert "## Status Progression" in md
        assert "## Prerequisite Chains" in md
        assert "---" in md  # footer
        assert "ZERO-LLM, fully grounded" in md
        assert "5" in md  # total_concepts
        assert "3" in md  # total_edges
        assert "7" in md  # total_evidence

    def test_fundamental_ranking(self) -> None:
        """Fundamental concepts rendered with evidence count, in ranked order."""
        book = TeacherBook(
            teacher_id="test",
            total_concepts=2,
            total_lessons=1,
            total_edges=2,
            total_evidence=5,
            fundamental_concepts=(
                _make_concept("First", 3),
                _make_concept("Second", 2),
            ),
            problematic_concepts=(),
            progression=(),
            prerequisites=(),
        )
        md = render_teacher_book(book)
        # First ranked concept (most evidence) should appear first
        first_pos = md.index("First")
        second_pos = md.index("Second")
        assert first_pos < second_pos, "First (3 ev) should rank before Second (2 ev)"

    def test_problematic_concepts_shown(self) -> None:
        """Problematic concepts appear in their own section and are absent from 'none' message."""
        book = TeacherBook(
            teacher_id="test",
            total_concepts=3,
            total_lessons=1,
            total_edges=2,
            total_evidence=4,
            fundamental_concepts=(
                _make_concept("Normal", 2),
                _make_concept("Hard", 2, status="problematic"),
            ),
            problematic_concepts=(
                _make_concept("Hard", 2, status="problematic"),
            ),
            progression=(),
            prerequisites=(),
        )
        md = render_teacher_book(book)
        assert "**Hard**" in md
        assert "no problematic concepts" not in md.lower()

    def test_no_problematic(self) -> None:
        """No problematic concepts → message instead of empty list."""
        book = TeacherBook(
            teacher_id="test",
            total_concepts=1,
            total_lessons=1,
            total_edges=1,
            total_evidence=1,
            fundamental_concepts=(_make_concept("Easy", 1),),
            problematic_concepts=(),
            progression=(),
            prerequisites=(),
        )
        md = render_teacher_book(book)
        assert "no problematic concepts" in md.lower()

    def test_progression_rendered(self) -> None:
        """Progression shows status sequence with lesson IDs."""
        book = TeacherBook(
            teacher_id="test",
            total_concepts=1,
            total_lessons=2,
            total_edges=1,
            total_evidence=1,
            fundamental_concepts=(),
            problematic_concepts=(),
            progression=(
                ConceptProgression(
                    name="Force",
                    canonical="force",
                    first_lesson="l1",
                    status_sequence=("introduced", "reinforced"),
                    lesson_sequence=("l1", "l2"),
                ),
            ),
            prerequisites=(),
        )
        md = render_teacher_book(book)
        assert "**Force**" in md
        assert "_introduced_" in md
        assert "_reinforced_" in md
        assert "l1" in md
        assert "l2" in md

    def test_prerequisites_rendered(self) -> None:
        """Prerequisite chains show concept → dependency mapping."""
        book = TeacherBook(
            teacher_id="test",
            total_concepts=2,
            total_lessons=1,
            total_edges=2,
            total_evidence=2,
            fundamental_concepts=(),
            problematic_concepts=(),
            progression=(),
            prerequisites=(
                PrerequisiteChain(
                    concept="Acceleration",
                    canonical="acceleration",
                    prerequisites=("Velocity", "Time"),
                    lesson_ids=("l1",),
                ),
            ),
        )
        md = render_teacher_book(book)
        assert "**Acceleration**" in md
        assert "`Velocity`" in md
        assert "`Time`" in md

    def test_empty_book(self) -> None:
        """Empty TeacherBook renders without crash."""
        book = TeacherBook(teacher_id="empty")
        md = render_teacher_book(book)
        assert md.startswith("# Teacher Book: empty")
        assert "0" in md or "no" in md.lower()

    def test_citation_excerpt_truncation(self) -> None:
        """Long excerpts are truncated in output."""
        long_excerpt = "A" * 200
        evidence = GraphEvidence(
            evidence_id="ev1",
            edge_id="e1",
            seg_id="test#s1",
            excerpt=long_excerpt,
            confidence=1.0,
            lesson_id="test",
        )
        concept = TeacherConcept(
            name="Long",
            canonical="long",
            status="introduced",
            lesson_ids=("test",),
            edge_count=1,
            evidence_count=1,
            citations=(evidence,),
        )
        book = TeacherBook(
            teacher_id="test",
            total_concepts=1,
            total_lessons=1,
            total_edges=1,
            total_evidence=1,
            fundamental_concepts=(concept,),
            problematic_concepts=(),
            progression=(),
            prerequisites=(),
        )
        md = render_teacher_book(book)
        # Should have truncated with "..."
        assert "..._" in md

    def test_more_than_five_citations_shows_note(self) -> None:
        """Concepts with >5 citations show '+N more' note."""
        evs = tuple(
            _make_evidence(f"test#s{i}", i) for i in range(7)
        )
        concept = TeacherConcept(
            name="Popular",
            canonical="popular",
            status="introduced",
            lesson_ids=("test",),
            edge_count=1,
            evidence_count=7,
            citations=evs,
        )
        book = TeacherBook(
            teacher_id="test",
            total_concepts=1,
            total_lessons=1,
            total_edges=1,
            total_evidence=7,
            fundamental_concepts=(concept,),
            problematic_concepts=(),
            progression=(),
            prerequisites=(),
        )
        md = render_teacher_book(book)
        assert "+2 more" in md


class TestRenderComparativeReport:
    """Tests for ``render_comparative_report``."""

    def test_report_structure(self) -> None:
        """Report has a title, table header, and per-teacher highlights."""
        books: dict[str, TeacherBook] = {
            "teacher_a": TeacherBook(
                teacher_id="teacher_a",
                total_concepts=5,
                total_lessons=1,
                total_edges=3,
                total_evidence=10,
                fundamental_concepts=(_make_concept("A", 2),),
                problematic_concepts=(),
                progression=(),
                prerequisites=(),
            ),
            "teacher_b": TeacherBook(
                teacher_id="teacher_b",
                total_concepts=3,
                total_lessons=1,
                total_edges=2,
                total_evidence=5,
                fundamental_concepts=(_make_concept("B", 1),),
                problematic_concepts=(),
                progression=(),
                prerequisites=(),
            ),
        }
        md = render_comparative_report(books)
        assert md.startswith("# Comparative TeacherBook Report")
        assert "| Teacher |" in md
        assert "teacher_a" in md
        assert "teacher_b" in md
        assert "ZERO-LLM" in md
        assert "10" in md  # Total evidence from A
        assert "5" in md  # Total evidence from B

    def test_report_with_problematic(self) -> None:
        """Report includes problematic count in table."""
        books = {
            "test_t": TeacherBook(
                teacher_id="test_t",
                total_concepts=2,
                total_lessons=1,
                total_edges=1,
                total_evidence=2,
                fundamental_concepts=(),
                problematic_concepts=(_make_concept("Hard", 1, status="problematic"),),
                progression=(),
                prerequisites=(),
            ),
        }
        md = render_comparative_report(books)
        assert "Problematic" in md
        assert "Hard" in md

    def test_report_empty(self) -> None:
        """Empty books dict renders valid markdown with no teachers."""
        md = render_comparative_report({})
        assert md.startswith("# Comparative TeacherBook Report")
        # Empty report: table has header + separator, no data rows
        table_lines = [l for l in md.split("\n") if l.startswith("|")]
        assert len(table_lines) == 2, f"Expected 2 table lines, got {len(table_lines)}"
        assert "Total teachers: 0" in md

    def test_report_deterministic(self) -> None:
        """Same input → same output (byte-for-byte)."""
        books: dict[str, TeacherBook] = {
            "t1": TeacherBook(
                teacher_id="t1",
                total_concepts=1,
                total_lessons=1,
                total_edges=1,
                total_evidence=1,
                fundamental_concepts=(),
                problematic_concepts=(),
                progression=(),
                prerequisites=(),
            ),
            "t2": TeacherBook(
                teacher_id="t2",
                total_concepts=2,
                total_lessons=1,
                total_edges=1,
                total_evidence=1,
                fundamental_concepts=(),
                problematic_concepts=(),
                progression=(),
                prerequisites=(),
            ),
        }
        md1 = render_comparative_report(books)
        md2 = render_comparative_report(books)
        assert md1 == md2


class TestRenderQualitativeDiff:
    """Tests for ``render_qualitative_diff``."""

    def test_basic_structure(self) -> None:
        """Diff has all expected sections."""
        books = {
            "prof_pratico": TeacherBook(
                teacher_id="prof_pratico",
                total_concepts=14,
                total_lessons=1,
                total_edges=24,
                total_evidence=93,
                fundamental_concepts=(
                    _make_concept("Caduta dei gravi", 5),
                    _make_concept("Spostamento vs distanza", 4),
                    _make_concept("Tempo di reazione", 3),
                ),
                problematic_concepts=(),
                progression=(),
                prerequisites=(
                    PrerequisiteChain(
                        concept="Acceleration",
                        canonical="acceleration",
                        prerequisites=("Velocity",),
                        lesson_ids=("l1",),
                    ),
                ),
            ),
            "prof_socratico": TeacherBook(
                teacher_id="prof_socratico",
                total_concepts=12,
                total_lessons=1,
                total_edges=17,
                total_evidence=45,
                fundamental_concepts=(
                    _make_concept("Questions", 3),
                    _make_concept("Dialectic", 2),
                ),
                problematic_concepts=(),
                progression=(),
                prerequisites=(
                    PrerequisiteChain(
                        concept="Logic",
                        canonical="logic",
                        prerequisites=("Premise", "Conclusion"),
                        lesson_ids=("l1",),
                    ),
                    PrerequisiteChain(
                        concept="Induction",
                        canonical="induction",
                        prerequisites=("Observation",),
                        lesson_ids=("l1",),
                    ),
                ),
            ),
            "prof_rigoroso": TeacherBook(
                teacher_id="prof_rigoroso",
                total_concepts=14,
                total_lessons=1,
                total_edges=18,
                total_evidence=37,
                fundamental_concepts=(
                    _make_concept("Theorem", 4),
                    _make_concept("Proof", 3),
                ),
                problematic_concepts=(
                    _make_concept("Hard Proof", 1, status="problematic"),
                ),
                progression=(),
                prerequisites=(
                    PrerequisiteChain(
                        concept="Proof",
                        canonical="proof",
                        prerequisites=("Axiom", "Definition"),
                        lesson_ids=("l1",),
                    ),
                ),
            ),
        }
        md = render_qualitative_diff(books)
        assert md.startswith("# Qualitative Style Diff")
        assert "## Per-Style Characterisation" in md
        assert "## Comparative Metrics" in md
        assert "## Fundamental Concepts Comparison" in md
        assert "## Prerequisite Structure" in md
        assert "## Qualitative Takeaway" in md
        assert "ZERO-LLM, fully grounded" in md

    def test_empty_books_no_crash(self) -> None:
        """Empty or missing books don't crash."""
        md = render_qualitative_diff({})
        assert md.startswith("# Qualitative Style Diff")
        assert "0 teachers" in md or "Compared 3 teachers" in md

    def test_deterministic(self) -> None:
        """Same input produces same output."""
        books = {
            "prof_pratico": TeacherBook(
                teacher_id="prof_pratico",
                total_concepts=10,
                total_lessons=1,
                total_edges=10,
                total_evidence=10,
                fundamental_concepts=(_make_concept("A", 2),),
                problematic_concepts=(),
                progression=(),
                prerequisites=(),
            ),
            "prof_socratico": TeacherBook(
                teacher_id="prof_socratico",
                total_concepts=10,
                total_lessons=1,
                total_edges=10,
                total_evidence=10,
                fundamental_concepts=(_make_concept("B", 1),),
                problematic_concepts=(),
                progression=(),
                prerequisites=(),
            ),
            "prof_rigoroso": TeacherBook(
                teacher_id="prof_rigoroso",
                total_concepts=10,
                total_lessons=1,
                total_edges=10,
                total_evidence=10,
                fundamental_concepts=(_make_concept("C", 1),),
                problematic_concepts=(),
                progression=(),
                prerequisites=(),
            ),
        }
        md1 = render_qualitative_diff(books)
        md2 = render_qualitative_diff(books)
        assert md1 == md2
