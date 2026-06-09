"""Test per lessonos/course/lineage.py — GeneratedArtifact + lineage tracking.

COORDINATION.md REGOLA LINEAGE: ogni GeneratedArtifact sa da quali
ContentAtoms/lezioni/fonti viene. Test non-tautologici:
- frozen dataclass validate fail-fast (format, artifact_id, file_path)
- build_artifact_lineage deduces lesson_ids from atom_ids
- save/load roundtrip produce JSON fedele
- lineage.json e leggibile e parsabile
"""

import json
import os
import tempfile
from pathlib import Path

import pytest

from lessonos.course.lineage import (
    VALID_FORMATS,
    GeneratedArtifact,
    build_artifact_lineage,
    load_artifact_lineage,
    save_artifact_lineage,
)
from lessonos.course.schema import CourseBlueprint, ModuleBlueprint


# ── Fixtures ──────────────────────────────────────────────────────────


@pytest.fixture
def sample_blueprint() -> CourseBlueprint:
    return CourseBlueprint(
        title="Calcolo 2 — Integrali e ODE",
        modules=(
            ModuleBlueprint(
                title="Derivate",
                lesson_ids=("l1_derivatives",),
                objectives=("Comprendere le derivate",),
                content_atom_ids=(
                    "l1_derivatives/definition/0",
                    "l1_derivatives/example/1",
                ),
            ),
            ModuleBlueprint(
                title="Integrali",
                lesson_ids=("l2_integrals",),
                objectives=("Comprendere gli integrali",),
                content_atom_ids=(
                    "l2_integrals/definition/0",
                    "l2_integrals/exercise/1",
                ),
            ),
        ),
        audience="Studenti universitari",
        level="Intermedio",
        source_lessons=("l1_derivatives", "l2_integrals", "l3_ode"),
    )


# ── ARTIFACT_FORMATS vocab ────────────────────────────────────────────


class TestArtifactFormatsVocab:
    """Vincoli: vocab finito, ogni formato testato."""

    def test_known_format_markdown(self) -> None:
        assert "markdown" in VALID_FORMATS

    def test_known_format_liascript(self) -> None:
        assert "liascript" in VALID_FORMATS

    def test_known_format_quarto(self) -> None:
        assert "quarto" in VALID_FORMATS

    def test_known_format_quarto_slides(self) -> None:
        assert "quarto-slides" in VALID_FORMATS

    def test_known_format_moodle_xml(self) -> None:
        assert "moodle-xml" in VALID_FORMATS

    def test_known_format_pdf(self) -> None:
        assert "pdf" in VALID_FORMATS

    def test_known_format_html(self) -> None:
        assert "html" in VALID_FORMATS

    def test_known_format_docx(self) -> None:
        assert "docx" in VALID_FORMATS

    def test_known_format_scorm(self) -> None:
        assert "scorm" in VALID_FORMATS

    def test_known_format_h5p(self) -> None:
        assert "h5p" in VALID_FORMATS

    def test_known_format_epub(self) -> None:
        assert "epub" in VALID_FORMATS

    def test_known_format_latex(self) -> None:
        assert "latex" in VALID_FORMATS

    def test_total_format_count(self) -> None:
        assert len(VALID_FORMATS) == 12

    def test_unknown_format_not_in_vocab(self) -> None:
        assert "unknown" not in VALID_FORMATS


# ── GeneratedArtifact validation ──────────────────────────────────────


class TestGeneratedArtifactValidation:
    """Fail-fast su costruzione: field vuoti, format invalido."""

    def test_minimal_construction(self) -> None:
        a = GeneratedArtifact(
            artifact_id="course.md",
            format="markdown",
            file_path="/out/course.md",
        )
        # Verifica che i valori passati siano preservati
        assert a.artifact_id == "course.md"
        assert a.format == "markdown"
        assert a.file_path == "/out/course.md"
        # Verifica che i campi opzionali abbiano i default corretti
        assert a.atom_ids == ()
        assert a.lesson_ids == ()
        assert a.source_ids == ()
        assert a.generator == ""

    def test_full_construction(self) -> None:
        a = GeneratedArtifact(
            artifact_id="module1.md",
            format="quarto",
            file_path="/out/modules/module1.qmd",
            atom_ids=("l1/definition/0", "l1/example/1"),
            lesson_ids=("l1",),
            source_ids=("s1", "s2"),
            generator="export_course_markdown",
        )
        assert a.artifact_id == "module1.md"
        assert a.format == "quarto"
        assert a.file_path == "/out/modules/module1.qmd"
        assert a.atom_ids == ("l1/definition/0", "l1/example/1")
        assert a.lesson_ids == ("l1",)
        assert a.source_ids == ("s1", "s2")
        assert a.generator == "export_course_markdown"

    def test_artifact_id_empty_raises(self) -> None:
        with pytest.raises(ValueError, match="artifact_id must be non-empty"):
            GeneratedArtifact(
                artifact_id="",
                format="markdown",
                file_path="/out/course.md",
            )

    def test_format_invalid_raises(self) -> None:
        with pytest.raises(ValueError, match="format.*not in VALID_FORMATS"):
            GeneratedArtifact(
                artifact_id="course.md",
                format="not-valid",
                file_path="/out/course.md",
            )

    def test_file_path_empty_raises(self) -> None:
        with pytest.raises(ValueError, match="file_path must be non-empty"):
            GeneratedArtifact(
                artifact_id="course.md",
                format="markdown",
                file_path="",
            )

    def test_frozen_cannot_modify(self) -> None:
        a = GeneratedArtifact(
            artifact_id="course.md",
            format="markdown",
            file_path="/out/course.md",
        )
        with pytest.raises(AttributeError):
            a.artifact_id = "changed"  # type: ignore[misc]

    def test_generated_at_auto_set(self) -> None:
        a = GeneratedArtifact(
            artifact_id="quiz.xml",
            format="moodle-xml",
            file_path="/out/quiz.xml",
        )
        assert "T" in a.generated_at  # ISO 8601 contains 'T'
        assert a.generated_at.endswith("Z") or "+" in a.generated_at


# ── build_artifact_lineage ────────────────────────────────────────────


class TestBuildArtifactLineage:
    """Test deduzione lesson_ids da atom_ids, fallback a source_lessons."""

    def test_lineage_with_atoms(self, sample_blueprint: CourseBlueprint) -> None:
        lineage = build_artifact_lineage(
            blueprint=sample_blueprint,
            file_path="/out/course.md",
            fmt="markdown",
            atom_ids=(
                "l1_derivatives/definition/0",
                "l1_derivatives/example/1",
                "l2_integrals/definition/0",
            ),
            generator="export_course_markdown",
        )
        assert lineage.artifact_id == "course.md"
        assert lineage.format == "markdown"
        assert lineage.lesson_ids == ("l1_derivatives", "l2_integrals")
        assert lineage.source_ids == ("l1_derivatives", "l2_integrals", "l3_ode")
        assert len(lineage.atom_ids) == 3
        assert lineage.generator == "export_course_markdown"

    def test_lineage_fallback_no_atoms(self, sample_blueprint: CourseBlueprint) -> None:
        """Senza atom_ids, lesson_ids = blueprint.source_lessons."""
        lineage = build_artifact_lineage(
            blueprint=sample_blueprint,
            file_path="/out/exercises.md",
            fmt="liascript",
            generator="export_course_liascript",
        )
        assert lineage.atom_ids == ()
        assert lineage.lesson_ids == (
            "l1_derivatives",
            "l2_integrals",
            "l3_ode",
        )

    def test_lineage_dedup_lesson_ids(self, sample_blueprint: CourseBlueprint) -> None:
        """Atomi dalla stessa lezione non duplicano lesson_id."""
        lineage = build_artifact_lineage(
            blueprint=sample_blueprint,
            file_path="/out/quiz.xml",
            fmt="moodle-xml",
            atom_ids=(
                "l1_derivatives/quiz_question/0",
                "l1_derivatives/quiz_question/1",
                "l1_derivatives/quiz_question/2",
            ),
            generator="export_moodle_xml",
        )
        assert lineage.lesson_ids == ("l1_derivatives",)

    def test_lineage_unknown_atom_format(self, sample_blueprint: CourseBlueprint) -> None:
        """Atom_id senza prefisso lesson -> fallback a source_lessons."""
        lineage = build_artifact_lineage(
            blueprint=sample_blueprint,
            file_path="/out/config.yml",
            fmt="quarto",
            atom_ids=("config_item",),
            generator="export_quarto",
        )
        assert lineage.lesson_ids == (
            "l1_derivatives",
            "l2_integrals",
            "l3_ode",
        )

    def test_lineage_file_path_name_is_artifact_id(self, sample_blueprint: CourseBlueprint) -> None:
        lineage = build_artifact_lineage(
            blueprint=sample_blueprint,
            file_path="/deeply/nested/path/out/slides.qmd",
            fmt="quarto-slides",
            generator="export_quarto_slides",
        )
        assert lineage.artifact_id == "slides.qmd"

    def test_lineage_format_invalid_raises(self, sample_blueprint: CourseBlueprint) -> None:
        with pytest.raises(ValueError, match="format.*not in VALID_FORMATS"):
            build_artifact_lineage(
                blueprint=sample_blueprint,
                file_path="/out/bad.md",
                fmt="not-valid",
            )

    def test_lineage_file_path_empty_raises(self, sample_blueprint: CourseBlueprint) -> None:
        with pytest.raises(ValueError, match="file_path must be non-empty"):
            build_artifact_lineage(
                blueprint=sample_blueprint,
                file_path="",
                fmt="markdown",
            )


# ── save / load roundtrip ─────────────────────────────────────────────


class TestSaveLoadRoundtrip:
    """Lineage JSON deve essere scrivibile e rileggibile fedelmente."""

    def test_save_and_load(self, sample_blueprint: CourseBlueprint) -> None:
        a1 = build_artifact_lineage(
            blueprint=sample_blueprint,
            file_path="/out/course.md",
            fmt="markdown",
            atom_ids=("l1_derivatives/definition/0",),
            generator="export_course_markdown",
        )
        a2 = build_artifact_lineage(
            blueprint=sample_blueprint,
            file_path="/out/quiz.xml",
            fmt="moodle-xml",
            atom_ids=("l2_integrals/quiz_question/0",),
            generator="export_moodle_xml",
        )

        with tempfile.TemporaryDirectory() as tmpdir:
            saved_path = save_artifact_lineage([a1, a2], tmpdir)
            assert os.path.exists(saved_path)
            assert saved_path.endswith("lineage.json")

            loaded = load_artifact_lineage(saved_path)
            assert len(loaded) == 2
            assert loaded[0].artifact_id == "course.md"
            assert loaded[0].format == "markdown"
            assert loaded[1].artifact_id == "quiz.xml"
            assert loaded[1].format == "moodle-xml"

    def test_save_empty_list(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            path = save_artifact_lineage([], tmpdir)
            assert os.path.exists(path)
            loaded = load_artifact_lineage(path)
            assert loaded == []

    def test_load_not_found_raises(self) -> None:
        with pytest.raises(FileNotFoundError, match="lineage file not found"):
            load_artifact_lineage("/nonexistent/path/lineage.json")

    def test_load_invalid_json_raises(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            p = Path(tmpdir) / "lineage.json"
            p.write_text("invalid json", encoding="utf-8")
            with pytest.raises(json.JSONDecodeError):
                load_artifact_lineage(str(p))

    def test_load_not_array_raises(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            p = Path(tmpdir) / "lineage.json"
            p.write_text('{"not": "array"}', encoding="utf-8")
            with pytest.raises(ValueError, match="must contain a JSON array"):
                load_artifact_lineage(str(p))

    def test_load_entry_not_dict_raises(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            p = Path(tmpdir) / "lineage.json"
            p.write_text('["string", 42]', encoding="utf-8")
            with pytest.raises(ValueError, match="expected a dict"):
                load_artifact_lineage(str(p))

    def test_save_creates_subdirectories(self, sample_blueprint: CourseBlueprint) -> None:
        """save_artifact_lineage crea directory intermedie."""
        a = build_artifact_lineage(
            blueprint=sample_blueprint,
            file_path="/out/course.md",
            fmt="markdown",
            generator="test",
        )
        with tempfile.TemporaryDirectory() as tmpdir:
            nested = os.path.join(tmpdir, "deep", "nested", "out")
            path = save_artifact_lineage([a], nested)
            assert os.path.exists(path)

    def test_json_structure(self, sample_blueprint: CourseBlueprint) -> None:
        """Il JSON salvato ha la struttura attesa."""
        a = build_artifact_lineage(
            blueprint=sample_blueprint,
            file_path="/out/course.md",
            fmt="markdown",
            atom_ids=("l1/def/0",),
            generator="export_course_markdown",
        )
        with tempfile.TemporaryDirectory() as tmpdir:
            path = save_artifact_lineage([a], tmpdir)
            raw = json.loads(Path(path).read_text(encoding="utf-8"))
            assert isinstance(raw, list)
            assert len(raw) == 1
            entry = raw[0]
            assert entry["artifact_id"] == "course.md"
            assert entry["format"] == "markdown"
            assert entry["file_path"] == "/out/course.md"
            assert entry["atom_ids"] == ["l1/def/0"]
            assert entry["lesson_ids"] == ["l1"]
            assert entry["source_ids"] == ["l1_derivatives", "l2_integrals", "l3_ode"]
            assert entry["generator"] == "export_course_markdown"
            assert "generated_at" in entry


# ── _lesson_id_from_atom_id helper ────────────────────────────────────


class TestLessonIdFromAtomId:
    """Helper privato _lesson_id_from_atom_id."""

    def test_extracts_prefix(self) -> None:
        from lessonos.course.lineage import _lesson_id_from_atom_id

        result = _lesson_id_from_atom_id("l1_derivatives/definition/0")
        assert result == "l1_derivatives"

    def test_no_slash_returns_none(self) -> None:
        from lessonos.course.lineage import _lesson_id_from_atom_id

        result = _lesson_id_from_atom_id("plain_id")
        assert result is None

    def test_deeply_nested(self) -> None:
        from lessonos.course.lineage import _lesson_id_from_atom_id

        result = _lesson_id_from_atom_id("a/b/c/d/e")
        assert result == "a"

    def test_empty_string_returns_none(self) -> None:
        from lessonos.course.lineage import _lesson_id_from_atom_id

        result = _lesson_id_from_atom_id("")
        assert result is None
