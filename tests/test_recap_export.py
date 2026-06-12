"""Tests for ``lessonos/recap_export.py`` (M2-7).

ZERO-LLM, pure DB + filesystem projection.  Tests use mock in-memory stores
and a temp derived directory to verify all fields.
"""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path as FsPath

import pytest

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import (
    ConceptExtraction,
    Citation,
    ExerciseExtraction,
    HomeworkExtraction,
    LessonContent,
    QuestionExtraction,
)
from lessonos.capsule.segmentation import TopicSpan
from lessonos.models.entities import Lesson, Segment
from lessonos.recap_export import (
    LessonRecap,
    RecapConcept,
    RecapDebt,
    RecapDerivedMaterial,
    SCHEMA_VERSION_RECAP,
    build_lesson_recap,
    render_recap_json,
)
from lessonos.store.base import Store


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


class _SimpleStore(Store):
    """Minimal in-memory store for recap tests.

    Only implements the methods that ``build_lesson_recap`` actually calls:
    ``get_lesson``, ``get_capsule``, ``segments_for_lesson``.
    """

    def __init__(self) -> None:
        self._lessons: dict[str, Lesson] = {}
        self._segments: dict[str, list[Segment]] = {}
        self._capsules: dict[str, str] = {}

    def add_lesson(self, lesson: Lesson) -> None:
        self._lessons[lesson.lesson_id] = lesson

    def add_segments(self, lesson_id: str, segments: list[Segment]) -> None:
        self._segments.setdefault(lesson_id, []).extend(segments)

    def set_capsule(self, lesson_id: str, capsule_raw: str) -> None:
        self._capsules[lesson_id] = capsule_raw

    # --- Store ABC overrides ---

    def get_lesson(self, lesson_id: str) -> Lesson | None:
        return self._lessons.get(lesson_id)

    def segments_for_lesson(self, lesson_id: str) -> tuple[Segment, ...]:
        return tuple(self._segments.get(lesson_id, []))

    def get_capsule(self, lesson_id: str) -> str | None:
        return self._capsules.get(lesson_id)

    # Unused abstract stubs
    def save_path(self, path): ...
    def get_path(self, path_id): return None
    def paths_for_teacher(self, teacher_id): return ()
    def save_lesson(self, lesson): ...
    def lessons_for_path(self, path_id): return ()
    def save_source(self, source): ...
    def get_source(self, source_id): return None
    def save_segment(self, segment): ...
    def get_segment(self, seg_id): return None
    def save_moment(self, moment): ...
    def get_moment(self, moment_id): return None
    def moments_for_lesson(self, lesson_id): return ()
    def save_capsule(self, lesson_id, capsule_data): ...
    def delete_capsule(self, lesson_id): return False
    def purge_lesson(self, lesson_id): return 0
    def close(self): ...
    def save_ledger_entry(self, entry): ...
    def get_ledger_entries(self): return ()
    def get_ledger_for_lesson(self, lesson_id): return ()
    def save_graph_node(self, lesson_id, node): ...
    def get_graph_nodes_for_lesson(self, lesson_id): return ()
    def save_graph_edge(self, lesson_id, edge): ...
    def get_graph_edges_for_lesson(self, lesson_id): return ()
    def save_evidence(self, evidence): ...
    def get_evidence_for_edge(self, edge_id): return ()
    def get_all_evidence_for_lesson(self, lesson_id): return ()
    def delete_graph_for_lesson(self, lesson_id): ...
    def begin_transaction(self): ...
    def commit_transaction(self): ...
    def rollback_transaction(self): ...


@pytest.fixture
def simple_store() -> _SimpleStore:
    store = _SimpleStore()
    store.add_lesson(
        Lesson(lesson_id="prima_lezione", path_id="teoria-segnali", title="Prima lezione di Teoria dei Segnali", order=1)
    )
    store.add_segments(
        "prima_lezione",
        [
            Segment(seg_id="l1s1", lesson_id="prima_lezione", start=0, end=12, text="Introduzione al segnale"),
            Segment(seg_id="l1s2", lesson_id="prima_lezione", start=12, end=30, text="Cos'è un segnale?"),
            Segment(seg_id="l1s3", lesson_id="prima_lezione", start=30, end=50, text="Classificazione dei segnali"),
        ],
    )
    return store


@pytest.fixture
def capsule_with_concepts() -> str:
    """A serialised capsule with 2 concepts (1 problematic) and exercises."""
    capsule = LessonCapsule(
        lesson_id="prima_lezione",
        timeline=(
            TopicSpan(lesson_id="prima_lezione", topic="Definizione", seg_ids=("l1s1",), start=0, end=12),
            TopicSpan(lesson_id="prima_lezione", topic="Classificazione", seg_ids=("l1s3",), start=30, end=50),
        ),
        content=LessonContent(
            lesson_id="prima_lezione",
            concepts=(
                ConceptExtraction(
                    name="segnale",
                    status="introduced",
                    canonical="segnale",
                    citations=(Citation(seg_id="l1s1", excerpt="Introduzione al segnale"),),
                ),
                ConceptExtraction(
                    name="delta di Dirac",
                    status="problematic",
                    canonical="delta-dirac",
                    citations=(Citation(seg_id="l1s2", excerpt="Cos'è un segnale?"),),
                ),
            ),
            exercises=(),
            student_questions=(),
            homework=(),
        ),
        dropped=(),
    )
    from lessonos.capsule.assembly import _serialise_capsule
    return _serialise_capsule(capsule)


@pytest.fixture
def temp_derived_dir() -> str:
    """Create a temporary derived/ directory with wiki and teacher_book files."""
    with tempfile.TemporaryDirectory() as tmpdir:
        root = FsPath(tmpdir)

        # wiki
        wiki_dir = root / "wiki"
        wiki_dir.mkdir()
        (wiki_dir / "prima_lezione.md").write_text("# Prima lezione\nContent", encoding="utf-8")
        (wiki_dir / "seconda_lezione.md").write_text("# Seconda lezione\nContent", encoding="utf-8")

        # dispense
        disp_dir = root / "dispense"
        disp_dir.mkdir()
        (disp_dir / "andrea.md").write_text("# Andrea dispensa\nContent", encoding="utf-8")

        # teacher_book
        tb_dir = root / "teacher_book"
        tb_dir.mkdir()
        (tb_dir / "andrea.md").write_text("# Andrea teacher book\nContent", encoding="utf-8")

        yield str(root)
        # temp dir auto-cleaned


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


class TestBuildLessonRecap:
    """Unit tests for ``build_lesson_recap``."""

    def test_basic_recap(self, simple_store: _SimpleStore, capsule_with_concepts: str) -> None:
        """Smoke: full recap with concepts, duration, no derived."""
        simple_store.set_capsule("prima_lezione", capsule_with_concepts)
        recap = build_lesson_recap(simple_store, "prima_lezione")

        assert recap.lesson_id == "prima_lezione"
        assert recap.title == "Prima lezione di Teoria dei Segnali"
        assert recap.duration_seconds == 50  # max(50) - min(0)
        assert recap.recap_schema_version == SCHEMA_VERSION_RECAP

        # Concepts
        assert len(recap.concepts) == 2
        names = {c.name for c in recap.concepts}
        assert names == {"segnale", "delta di Dirac"}
        statuses = {c.name: c.status for c in recap.concepts}
        assert statuses["segnale"] == "introduced"
        assert statuses["delta di Dirac"] == "problematic"
        # evidence_count from citations list length
        ev_counts = {c.name: c.evidence_count for c in recap.concepts}
        assert ev_counts["segnale"] == 1
        assert ev_counts["delta di Dirac"] == 1

        # Open debts from problematic concept
        assert len(recap.open_debts) == 1
        debt = recap.open_debts[0]
        assert debt.kind == "unmastered_concept"
        assert "delta di Dirac" in debt.description

        # No derived materials without derived_dir
        assert len(recap.derived_materials) == 0

    def test_duration_no_segments(self, simple_store: _SimpleStore) -> None:
        """No segments → duration 0."""
        simple_store._segments.clear()
        recap = build_lesson_recap(simple_store, "prima_lezione")
        assert recap.duration_seconds == 0

    def test_duration_single_segment(self, simple_store: _SimpleStore) -> None:
        """Single segment → duration = end - start."""
        simple_store._segments["prima_lezione"] = [
            Segment(seg_id="l1s1", lesson_id="prima_lezione", start=10, end=25, text="test")
        ]
        recap = build_lesson_recap(simple_store, "prima_lezione")
        assert recap.duration_seconds == 15

    def test_no_capsule(self, simple_store: _SimpleStore) -> None:
        """No capsule stored → empty concepts, no debts."""
        recap = build_lesson_recap(simple_store, "prima_lezione")
        assert len(recap.concepts) == 0
        assert len(recap.open_debts) == 0

    def test_empty_capsule(self, simple_store: _SimpleStore) -> None:
        """Capsule with no concepts → empty concepts."""
        from lessonos.capsule.assembly import _serialise_capsule
        empty = LessonCapsule(
            lesson_id="prima_lezione",
            timeline=(),
            content=LessonContent(lesson_id="prima_lezione"),
        )
        simple_store.set_capsule("prima_lezione", _serialise_capsule(empty))
        recap = build_lesson_recap(simple_store, "prima_lezione")
        assert len(recap.concepts) == 0
        assert len(recap.open_debts) == 0

    def test_no_problematic_concepts(self, simple_store: _SimpleStore) -> None:
        """Capsule without problematic concepts → empty debts."""
        from lessonos.capsule.assembly import _serialise_capsule
        cap = LessonCapsule(
            lesson_id="prima_lezione",
            timeline=(),
            content=LessonContent(
                lesson_id="prima_lezione",
                concepts=(
                    ConceptExtraction(
                        name="segnale", status="introduced", citations=(Citation(seg_id="l1s1", excerpt="test"),)
                    ),
                ),
            ),
        )
        simple_store.set_capsule("prima_lezione", _serialise_capsule(cap))
        recap = build_lesson_recap(simple_store, "prima_lezione")
        assert len(recap.concepts) == 1
        assert len(recap.open_debts) == 0

    def test_unknown_lesson(self, simple_store: _SimpleStore) -> None:
        """Non-existent lesson → ValueError."""
        with pytest.raises(ValueError, match="Lesson not found"):
            build_lesson_recap(simple_store, "inesistente")

    def test_title_fallback_to_id(self, simple_store: _SimpleStore) -> None:
        """Lesson without explicit title → falls back to lesson_id."""
        simple_store._lessons["prima_lezione"] = Lesson(
            lesson_id="prima_lezione", path_id="p1", title="", order=1
        )
        recap = build_lesson_recap(simple_store, "prima_lezione")
        assert recap.title == "prima_lezione"

    def test_derived_materials(self, simple_store: _SimpleStore, temp_derived_dir: str) -> None:
        """Derived materials scanned from derived/ directory."""
        recap = build_lesson_recap(simple_store, "prima_lezione", derived_dir=temp_derived_dir)
        materials = recap.derived_materials
        assert len(materials) == 1  # only wiki/prima_lezione.md matches

        # Find the wiki match
        wiki_matches = [m for m in materials if m.kind == "wiki" and "prima_lezione" in m.path]
        assert len(wiki_matches) == 1
        assert wiki_matches[0].kind == "wiki"
        assert "prima_lezione.md" in wiki_matches[0].path

    def test_derived_materials_none_dir(self, simple_store: _SimpleStore) -> None:
        """derived_dir=None → no materials."""
        recap = build_lesson_recap(simple_store, "prima_lezione", derived_dir=None)
        assert len(recap.derived_materials) == 0

    def test_derived_materials_bad_dir(self, simple_store: _SimpleStore) -> None:
        """Non-existent derived_dir → no materials, no crash."""
        recap = build_lesson_recap(simple_store, "prima_lezione", derived_dir="/tmp/no_such_dir_abc123")
        assert len(recap.derived_materials) == 0

    def test_json_schema_version(self, simple_store: _SimpleStore, capsule_with_concepts: str) -> None:
        """Schema version + full recap structure verified."""
        simple_store.set_capsule("prima_lezione", capsule_with_concepts)
        recap = build_lesson_recap(simple_store, "prima_lezione")
        assert recap.recap_schema_version == SCHEMA_VERSION_RECAP
        # Also verify that other fields are populated — prevents tautology
        assert recap.lesson_id == "prima_lezione"
        assert recap.title == "Prima lezione di Teoria dei Segnali"
        assert recap.duration_seconds == 50
        assert len(recap.concepts) == 2
        assert len(recap.open_debts) == 1


class TestRenderRecapJson:
    """Tests for ``render_recap_json``."""

    def test_writes_json_file(self, simple_store: _SimpleStore, tmp_path: FsPath) -> None:
        """Writes valid JSON to the specified file path."""
        recap = build_lesson_recap(simple_store, "prima_lezione")
        out_path = str(tmp_path / "recap.json")
        text = render_recap_json(recap, out_path)

        # File exists and is valid JSON
        assert FsPath(out_path).exists()
        data = json.loads(text)
        assert data["recap_schema_version"] == SCHEMA_VERSION_RECAP
        assert data["lesson_id"] == "prima_lezione"
        assert isinstance(data["concepts"], list)
        assert isinstance(data["open_debts"], list)
        assert isinstance(data["derived_materials"], list)

    def test_json_readable(self, simple_store: _SimpleStore, tmp_path: FsPath) -> None:
        """Written file is readable and has correct structure."""
        recap = build_lesson_recap(simple_store, "prima_lezione")
        out_path = str(tmp_path / "recap.json")
        text = render_recap_json(recap, out_path)

        # Read back from file
        with open(out_path, encoding="utf-8") as fh:
            data = json.load(fh)

        assert data["lesson_id"] == "prima_lezione"
        assert "title" in data
        assert "duration_seconds" in data
        assert "concepts" in data
        assert "open_debts" in data
        assert "derived_materials" in data


class TestCLIIntegration:
    """Integration tests: CLI ``recap-export`` wiring via cli module."""

    def test_cli_no_db_error(self) -> None:
        """CLI with no auto-detectable DB shows error."""
        from lessonos.cli import main

        # Use a non-existent DB explicitly
        exit_code = main([
            "recap-export",
            "--lesson", "prima_lezione",
            "--out", "/tmp/recap_test.json",
            "--db", "/tmp/no_such_db.db",
        ])
        assert exit_code == 1

    def test_cli_unknown_lesson(self, monkeypatch: pytest.MonkeyPatch, tmp_path: FsPath) -> None:
        """CLI with non-existent lesson returns error."""
        from lessonos.cli import main

        db_path = str(tmp_path / "test.db")
        from lessonos.store.sqlite import SQLiteStore
        store = SQLiteStore(db_path)
        from lessonos.models.entities import Lesson
        store.save_lesson(Lesson(lesson_id="l1", path_id="p1", title="Test", order=1))
        store.close()

        exit_code = main([
            "recap-export",
            "--lesson", "unknown",
            "--out", str(tmp_path / "recap.json"),
            "--db", db_path,
        ])
        assert exit_code == 1
