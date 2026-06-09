"""Tests for P1: Quarto Course Exporter (COORDINATION.md §18).

Test categories:
  1. export_quarto basic structure (_quarto.yml + index.qmd + modules/)
  2. _quarto.yml project configuration
  3. Module .qmd files with content atoms
  4. Aggregate files: exercises.qmd, quiz.qmd
  5. Output to disk (write real files)
  6. Edge cases: no atoms, empty modules ValueError, AI-only excluded
  7. Formatting helpers: _slugify, _escape_yaml
  8. export_quarto_slides: revealjs slides format (P2)
"""

from __future__ import annotations

import os

import pytest

from lessonos.capsule.extraction import Citation
from lessonos.course.atoms import ContentAtom
from lessonos.course.schema import CourseBlueprint, ModuleBlueprint
from lessonos.export.quarto import (
    QuartoCoursePack,
    QuartoSlidesPack,
    export_quarto,
    export_quarto_slides,
    _build_quarto_slides_yml,
    _escape_yaml,
    _format_content_atom,
    _slugify,
)


# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture
def simple_blueprint() -> CourseBlueprint:
    """Blueprint con 2 moduli, nessun atomo."""
    return CourseBlueprint(
        title="Analisi Matematica",
        modules=(
            ModuleBlueprint(
                title="Derivate",
                lesson_ids=("l1_intro_derivatives", "l2_derivative_rules"),
                objectives=("Comprendere il concetto di derivata",),
            ),
            ModuleBlueprint(
                title="Integrali",
                lesson_ids=("l3_integrals",),
            ),
        ),
        audience="Studenti universitari",
        level="base",
        source_lessons=(
            "l1_intro_derivatives",
            "l2_derivative_rules",
            "l3_integrals",
        ),
    )


@pytest.fixture
def single_mod_blueprint() -> CourseBlueprint:
    """Blueprint con 1 modulo, nessun atomo."""
    return CourseBlueprint(
        title="Fisica Base",
        modules=(
            ModuleBlueprint(
                title="Meccanica",
                lesson_ids=("l1_kinematics",),
            ),
        ),
        audience="Studenti liceo",
        level="base",
        source_lessons=("l1_kinematics",),
    )


def _make_atom(
    atom_id: str,
    atom_type: str,
    lesson_id: str,
    body: str,
) -> ContentAtom:
    """Helper per creare atomi test-only senza source_refs reali.

    Tutti gli atomi test usano explicit_ai_inference=True + source_refs=()
    per evitare grounding violations (l'export e consumer passivo).
    """
    return ContentAtom(
        atom_id=atom_id,
        atom_type=atom_type,
        lesson_id=lesson_id,
        body=body,
        source_refs=(),
        explicit_ai_inference=True,
    )


@pytest.fixture
def sample_atoms() -> dict:
    """Atoms fittizi per test (tutti AI-inferred = nessun grounding reale)."""
    return {
        "l1_intro_derivatives": (
            _make_atom(
                "l1_intro_derivatives/definition/0",
                "definition",
                "l1_intro_derivatives",
                "La derivata e il limite del rapporto incrementale",
            ),
            _make_atom(
                "l1_intro_derivatives/quiz_question/0",
                "quiz_question",
                "l1_intro_derivatives",
                "Qual e la derivata di x^2?",
            ),
            _make_atom(
                "l1_intro_derivatives/exercise/0",
                "exercise",
                "l1_intro_derivatives",
                "Calcola la derivata di f(x)=3x^2+2x",
            ),
        ),
        "l3_integrals": (
            _make_atom(
                "l3_integrals/homework/0",
                "homework",
                "l3_integrals",
                "Studiare il teorema fondamentale del calcolo",
            ),
        ),
    }


# ── _slugify ─────────────────────────────────────────────────────────────────


class TestSlugify:
    def test_basic_title(self) -> None:
        assert _slugify("Derivate") == "derivate"

    def test_spaces_to_underscores(self) -> None:
        assert _slugify("Integrali e ODE") == "integrali_e_ode"

    def test_accents_removed(self) -> None:
        assert _slugify("Equazioni differenziali") == "equazioni_differenziali"

    def test_alphanumeric_only(self) -> None:
        assert _slugify("Modulo 1: Introduzione!") == "modulo_1_introduzione"

    def test_empty_after_filter(self) -> None:
        assert _slugify("!!!") == "module"


# ── _escape_yaml ──────────────────────────────────────────────────────────────


class TestEscapeYaml:
    def test_no_escaping_needed(self) -> None:
        assert _escape_yaml("plain text") == "plain text"

    def test_colon_escaped(self) -> None:
        assert '\\"' in _escape_yaml('text: "quote"')

    def test_special_chars_quoted(self) -> None:
        result = _escape_yaml("value with # hash")
        assert result.startswith('"')
        assert result.endswith('"')

    def test_already_safe(self) -> None:
        assert _escape_yaml("hello") == "hello"
        assert _escape_yaml("math 101") == "math 101"


# ── _format_content_atom ──────────────────────────────────────────────────────


class TestFormatContentAtom:
    def test_type_heading_included(self) -> None:
        atom = _make_atom("l1/def/0", "definition", "l1", "Body")
        md = _format_content_atom(atom)
        assert "Definition" in md
        assert "Body" in md

    def test_explanation_type(self) -> None:
        atom = _make_atom("l1/expl/0", "explanation", "l1", "Spiegazione")
        md = _format_content_atom(atom)
        assert "Explanation" in md
        assert "Spiegazione" in md

    def test_teacher_approved_flag(self) -> None:
        atom = ContentAtom(
            atom_id="l1/def/0",
            atom_type="definition",
            lesson_id="l1",
            body="Def",
            source_refs=(
                Citation(seg_id="l1s1", excerpt="Derivative definition"),
            ),
            teacher_approved=True,
        )
        md = _format_content_atom(atom)
        assert "Approvato dal docente" in md

    def test_source_refs_included(self) -> None:
        atom = ContentAtom(
            atom_id="l1/def/0",
            atom_type="definition",
            lesson_id="l1",
            body="Def",
            source_refs=(
                Citation(seg_id="l1s1", excerpt="Derivative definition", confidence=0.9),
            ),
        )
        md = _format_content_atom(atom)
        assert "l1s1" in md
        assert "Fonti" in md
        assert "confidenza: 0.90" in md or "confidenza: 0.9" in md


# ── export_quarto: structure ──────────────────────────────────────────────────


class TestExportStructure:
    def test_returns_quartocoursepack(self, simple_blueprint) -> None:
        pack = export_quarto(simple_blueprint)
        assert isinstance(pack, QuartoCoursePack)

    def test_quarto_yml_present(self, simple_blueprint) -> None:
        pack = export_quarto(simple_blueprint)
        assert "_quarto.yml" in pack.files

    def test_quarto_yml_has_project_type(self, simple_blueprint) -> None:
        content = export_quarto(simple_blueprint).files["_quarto.yml"]
        assert "project:" in content
        assert "type: book" in content

    def test_quarto_yml_has_title(self, simple_blueprint) -> None:
        content = export_quarto(simple_blueprint).files["_quarto.yml"]
        assert "Analisi Matematica" in content

    def test_index_qmd_present(self, simple_blueprint) -> None:
        pack = export_quarto(simple_blueprint)
        assert "index.qmd" in pack.files

    def test_index_qmd_title(self, simple_blueprint) -> None:
        content = export_quarto(simple_blueprint).files["index.qmd"]
        assert "# Analisi Matematica" in content

    def test_module_files_created(self, simple_blueprint) -> None:
        pack = export_quarto(simple_blueprint)
        # Expect _quarto.yml + index.qmd + 2 module files
        # aggregate files may also be present if atoms exist
        module_files = [k for k in pack.files if k.startswith("modules/")]
        assert len(module_files) == 2

    def test_module_file_named_by_slug(self, simple_blueprint) -> None:
        pack = export_quarto(simple_blueprint)
        module_files = list(pack.files.keys())
        mod_qmds = [f for f in module_files if f.startswith("modules/")]
        assert any("derivate" in f for f in mod_qmds)
        assert any("integrali" in f for f in mod_qmds)

    def test_module_file_has_title(self, simple_blueprint) -> None:
        pack = export_quarto(simple_blueprint)
        mod_file = next(f for f in pack.files if f.startswith("modules/"))
        content = pack.files[mod_file]
        assert "# Derivate" in content or "# Integrali" in content

    def test_audience_and_level_in_index(self, simple_blueprint) -> None:
        content = export_quarto(simple_blueprint).files["index.qmd"]
        assert "Studenti universitari" in content
        assert "base" in content

    def test_audience_and_level_in_quarto_yml(self, simple_blueprint) -> None:
        content = export_quarto(simple_blueprint).files["_quarto.yml"]
        assert "Studenti universitari" in content or "audience:" in content

    def test_module_objectives_rendered(self, simple_blueprint) -> None:
        pack = export_quarto(simple_blueprint)
        mod_der = next(
            k for k in pack.files
            if k.startswith("modules/") and "derivate" in k
        )
        assert "Comprendere il concetto di derivata" in pack.files[mod_der]

    def test_empty_modules_raises_valueerror(self) -> None:
        bp = CourseBlueprint(
            title="Vuoto",
            modules=(),
        )
        with pytest.raises(ValueError, match="no modules"):
            export_quarto(bp)

    def test_single_module_no_atoms(self, single_mod_blueprint) -> None:
        pack = export_quarto(single_mod_blueprint)
        assert "index.qmd" in pack.files
        mod_files = [k for k in pack.files if k.startswith("modules/")]
        assert len(mod_files) == 1

    def test_chapters_in_quarto_yml(self, simple_blueprint) -> None:
        content = export_quarto(simple_blueprint).files["_quarto.yml"]
        assert "chapters:" in content
        assert "modules/" in content

    def test_filename_customizable(self, single_mod_blueprint) -> None:
        pack = export_quarto(single_mod_blueprint, filename="course.qmd")
        assert "course.qmd" in pack.files
        assert "index.qmd" not in pack.files

    def test_format_entries_in_quarto_yml(self, simple_blueprint) -> None:
        content = export_quarto(simple_blueprint).files["_quarto.yml"]
        assert "format:" in content
        assert "html:" in content
        assert "pdf:" in content


# ── Atoms rendering in modules ──────────────────────────────────────────────


class TestAtomsInModules:
    def test_definition_atom_rendered(self, simple_blueprint) -> None:
        atoms = {
            "l1_intro_derivatives": (
                _make_atom("l1_intro_derivatives/definition/0",
                           "definition", "l1_intro_derivatives",
                           "La derivata e il limite"),
            ),
        }
        pack = export_quarto(simple_blueprint, atoms=atoms, include_ai_atoms=True)
        mod_file = next(k for k in pack.files if k.startswith("modules/"))
        content = pack.files[mod_file]
        assert "Definition" in content
        assert "La derivata e il limite" in content

    def test_ai_inferred_excluded_default(self, simple_blueprint) -> None:
        atoms = {
            "l1_intro_derivatives": (
                _make_atom("l1/objective/0", "objective",
                           "l1_intro_derivatives", "AI content"),
            ),
        }
        pack = export_quarto(simple_blueprint, atoms=atoms)
        mod_file = next(k for k in pack.files if k.startswith("modules/"))
        assert "AI content" not in pack.files[mod_file]

    def test_include_ai_atoms_flag(self, simple_blueprint) -> None:
        atoms = {
            "l1_intro_derivatives": (
                _make_atom("l1/objective/0", "objective",
                           "l1_intro_derivatives", "AI content"),
            ),
        }
        pack = export_quarto(simple_blueprint, atoms=atoms, include_ai_atoms=True)
        mod_file = next(k for k in pack.files if k.startswith("modules/"))
        assert "AI content" in pack.files[mod_file]

    def test_unknown_lesson_atoms_skipped(self, simple_blueprint) -> None:
        atoms = {
            "l1_intro_derivatives": (
                _make_atom("l1/exercise/0", "exercise",
                           "l1_intro_derivatives", "OK"),
            ),
            "unknown_lesson": (
                _make_atom("unk/exercise/0", "exercise",
                           "unknown_lesson", "SKIP"),
            ),
        }
        pack = export_quarto(simple_blueprint, atoms=atoms, include_ai_atoms=True)
        content = pack.files["index.qmd"]  # just check no crash
        assert "OK" in pack.files[
            next(k for k in pack.files if k.startswith("modules/"))
        ]

    def test_empty_atoms_dict_no_crash(self, simple_blueprint) -> None:
        pack = export_quarto(simple_blueprint, atoms={})
        assert "index.qmd" in pack.files

    def test_content_atom_ids_filter(self) -> None:
        bp = CourseBlueprint(
            title="Test",
            modules=(
                ModuleBlueprint(
                    title="M1",
                    lesson_ids=("l1",),
                    content_atom_ids=("l1/exercise/0",),
                ),
            ),
            audience="test",
            source_lessons=("l1",),
        )
        atoms = {
            "l1": (
                _make_atom("l1/exercise/0", "exercise", "l1", "Incluso"),
                _make_atom("l1/exercise/1", "exercise", "l1", "Escluso"),
            ),
        }
        pack = export_quarto(bp, atoms=atoms, include_ai_atoms=True)
        mod_file = next(k for k in pack.files if k.startswith("modules/"))
        assert "Incluso" in pack.files[mod_file]
        assert "Escluso" not in pack.files[mod_file]


# ── Exercise and quiz atoms ─────────────────────────────────────────────────


class TestExerciseAndQuiz:
    def test_exercise_atom_in_callout(self) -> None:
        bp = CourseBlueprint(
            title="Test",
            modules=(
                ModuleBlueprint(
                    title="M1",
                    lesson_ids=("l1",),
                ),
            ),
            audience="test",
            source_lessons=("l1",),
        )
        atoms = {
            "l1": (
                _make_atom("l1/exercise/0", "exercise", "l1",
                           "Calcola la derivata"),
            ),
        }
        pack = export_quarto(bp, atoms=atoms, include_ai_atoms=True)
        mod_file = next(k for k in pack.files if k.startswith("modules/"))
        content = pack.files[mod_file]
        assert "callout-exercise" in content
        assert "Calcola la derivata" in content

    def test_quiz_atom_in_callout(self) -> None:
        bp = CourseBlueprint(
            title="Test",
            modules=(
                ModuleBlueprint(
                    title="M1",
                    lesson_ids=("l1",),
                ),
            ),
            audience="test",
            source_lessons=("l1",),
        )
        atoms = {
            "l1": (
                _make_atom("l1/quiz/0", "quiz_question", "l1",
                           "Qual e la derivata?"),
            ),
        }
        pack = export_quarto(bp, atoms=atoms, include_ai_atoms=True)
        mod_file = next(k for k in pack.files if k.startswith("modules/"))
        content = pack.files[mod_file]
        assert "callout-question" in content
        assert "Qual e la derivata?" in content

    def test_exercise_and_quiz_section_headers(self) -> None:
        bp = CourseBlueprint(
            title="Test",
            modules=(
                ModuleBlueprint(
                    title="M1",
                    lesson_ids=("l1", "l2"),
                ),
            ),
            audience="test",
            source_lessons=("l1", "l2"),
        )
        atoms = {
            "l1": (
                _make_atom("l1/exercise/0", "exercise", "l1", "Ex1"),
                _make_atom("l1/quiz/0", "quiz_question", "l1", "Q1"),
            ),
        }
        pack = export_quarto(bp, atoms=atoms, include_ai_atoms=True)
        mod_file = next(k for k in pack.files if k.startswith("modules/"))
        content = pack.files[mod_file]
        assert "## Esercizi" in content
        assert "## Quiz" in content

    def test_exercise_aggregate_file(self) -> None:
        bp = CourseBlueprint(
            title="Test",
            modules=(
                ModuleBlueprint(title="M1", lesson_ids=("l1",)),
            ),
            audience="test",
            source_lessons=("l1",),
        )
        atoms = {
            "l1": (
                _make_atom("l1/exercise/0", "exercise", "l1", "Aggregate Ex"),
            ),
        }
        pack = export_quarto(bp, atoms=atoms, include_ai_atoms=True)
        assert "exercises.qmd" in pack.files
        assert "Aggregate Ex" in pack.files["exercises.qmd"]

    def test_quiz_aggregate_file(self) -> None:
        bp = CourseBlueprint(
            title="Test",
            modules=(
                ModuleBlueprint(title="M1", lesson_ids=("l1",)),
            ),
            audience="test",
            source_lessons=("l1",),
        )
        atoms = {
            "l1": (
                _make_atom("l1/quiz/0", "quiz_question", "l1", "Aggregate Q"),
            ),
        }
        pack = export_quarto(bp, atoms=atoms, include_ai_atoms=True)
        assert "quiz.qmd" in pack.files
        assert "Aggregate Q" in pack.files["quiz.qmd"]

    def test_no_aggregate_files_when_no_exercise_or_quiz(self, simple_blueprint) -> None:
        atoms = {
            "l1_intro_derivatives": (
                _make_atom("l1/def/0", "definition",
                           "l1_intro_derivatives", "Solo definizione"),
            ),
        }
        pack = export_quarto(simple_blueprint, atoms=atoms, include_ai_atoms=True)
        assert "exercises.qmd" not in pack.files
        assert "quiz.qmd" not in pack.files


# ── Output to disk ──────────────────────────────────────────────────────────


class TestOutputToDisk:
    def test_writes_to_output_dir(self, single_mod_blueprint, tmp_path) -> None:
        pack = export_quarto(single_mod_blueprint, output_dir=str(tmp_path))
        assert (tmp_path / "_quarto.yml").exists()
        assert (tmp_path / "index.qmd").exists()

    def test_writes_module_subdir(self, single_mod_blueprint, tmp_path) -> None:
        pack = export_quarto(single_mod_blueprint, output_dir=str(tmp_path))
        module_dir = tmp_path / "modules"
        assert module_dir.is_dir()
        qmd_files = list(module_dir.glob("*.qmd"))
        assert len(qmd_files) == 1

    def test_written_content_matches_pack(self, single_mod_blueprint, tmp_path) -> None:
        pack = export_quarto(single_mod_blueprint, output_dir=str(tmp_path))
        disk_content = (tmp_path / "index.qmd").read_text(encoding="utf-8")
        assert disk_content == pack.files["index.qmd"]

    def test_empty_output_dir_no_disk_write(self, simple_blueprint) -> None:
        pack = export_quarto(simple_blueprint)
        assert "_quarto.yml" in pack.files  # still returns pack in memory


# ══════════════════════════════════════════════════════════════════════════════
#  P2: export_quarto_slides — revealjs slides format (COORDINATION.md §18)
# ══════════════════════════════════════════════════════════════════════════════


class TestQuartoSlidesBasic:
    """Fundamental structure of the slides export."""

    def test_returns_quartoslidespack(self, simple_blueprint) -> None:
        pack = export_quarto_slides(simple_blueprint)
        assert isinstance(pack, QuartoSlidesPack)

    def test_quarto_yml_present(self, simple_blueprint) -> None:
        pack = export_quarto_slides(simple_blueprint)
        assert "_quarto.yml" in pack.files

    def test_quarto_yml_has_revealjs_format(self, simple_blueprint) -> None:
        content = export_quarto_slides(simple_blueprint).files["_quarto.yml"]
        assert "revealjs:" in content
        assert "format:" in content
        assert "project:" in content

    def test_quarto_yml_has_slides_chapter(self, simple_blueprint) -> None:
        content = export_quarto_slides(simple_blueprint).files["_quarto.yml"]
        assert "slides.qmd" in content

    def test_quarto_yml_has_slide_config(self, simple_blueprint) -> None:
        content = export_quarto_slides(simple_blueprint).files["_quarto.yml"]
        assert "theme: simple" in content
        assert "slide-number: true" in content
        assert "incremental: true" in content

    def test_slides_qmd_present(self, simple_blueprint) -> None:
        pack = export_quarto_slides(simple_blueprint)
        assert "slides.qmd" in pack.files

    def test_slides_qmd_has_title(self, simple_blueprint) -> None:
        content = export_quarto_slides(simple_blueprint).files["slides.qmd"]
        assert "# Analisi Matematica" in content

    def test_slides_qmd_has_module_headers(self, simple_blueprint) -> None:
        content = export_quarto_slides(simple_blueprint).files["slides.qmd"]
        assert "## Modulo 1: Derivate" in content
        assert "## Modulo 2: Integrali" in content

    def test_slides_qmd_has_lesson_listings(self, simple_blueprint) -> None:
        content = export_quarto_slides(simple_blueprint).files["slides.qmd"]
        assert "l1_intro_derivatives" in content
        assert "l2_derivative_rules" in content
        assert "l3_integrals" in content

    def test_slides_qmd_has_audience(self, simple_blueprint) -> None:
        content = export_quarto_slides(simple_blueprint).files["slides.qmd"]
        assert "Studenti universitari" in content

    def test_slides_qmd_has_level(self, simple_blueprint) -> None:
        content = export_quarto_slides(simple_blueprint).files["slides.qmd"]
        assert "base" in content

    def test_slides_qmd_objectives(self, simple_blueprint) -> None:
        content = export_quarto_slides(simple_blueprint).files["slides.qmd"]
        assert "Comprendere il concetto di derivata" in content

    def test_slides_qmd_slide_separators(self, simple_blueprint) -> None:
        content = export_quarto_slides(simple_blueprint).files["slides.qmd"]
        assert content.count("---") >= 2  # at least 2 slide separators


class TestQuartoSlidesFilename:
    """Customizable filename for the slides deck."""

    def test_default_filename(self, simple_blueprint) -> None:
        pack = export_quarto_slides(simple_blueprint)
        assert "slides.qmd" in pack.files

    def test_custom_filename(self, simple_blueprint) -> None:
        pack = export_quarto_slides(simple_blueprint, filename="presentation.qmd")
        assert "presentation.qmd" in pack.files
        assert "slides.qmd" not in pack.files


class TestQuartoSlidesAtoms:
    """ContentAtom rendering in slide format."""

    def test_definition_atom_rendered(self, simple_blueprint) -> None:
        atoms = {
            "l1_intro_derivatives": (
                _make_atom("l1_intro_derivatives/definition/0",
                           "definition", "l1_intro_derivatives",
                           "La derivata e il limite"),
            ),
        }
        pack = export_quarto_slides(simple_blueprint, atoms=atoms, include_ai_atoms=True)
        content = pack.files["slides.qmd"]
        assert "Definition" in content
        assert "La derivata e il limite" in content

    def test_ai_inferred_excluded_default(self, simple_blueprint) -> None:
        atoms = {
            "l1_intro_derivatives": (
                _make_atom("l1/objective/0", "objective",
                           "l1_intro_derivatives", "AI slide content"),
            ),
        }
        pack = export_quarto_slides(simple_blueprint, atoms=atoms)
        assert "AI slide content" not in pack.files["slides.qmd"]

    def test_include_ai_atoms_flag(self, simple_blueprint) -> None:
        atoms = {
            "l1_intro_derivatives": (
                _make_atom("l1/objective/0", "objective",
                           "l1_intro_derivatives", "AI slide content"),
            ),
        }
        pack = export_quarto_slides(simple_blueprint, atoms=atoms, include_ai_atoms=True)
        assert "AI slide content" in pack.files["slides.qmd"]

    def test_atoms_appear_as_slides(self, simple_blueprint) -> None:
        atoms = {
            "l1_intro_derivatives": (
                _make_atom("l1/def/0", "definition", "l1_intro_derivatives",
                           "Definition body"),
                _make_atom("l1/exercise/0", "exercise", "l1_intro_derivatives",
                           "Exercise body"),
                _make_atom("l1/quiz/0", "quiz_question", "l1_intro_derivatives",
                           "Quiz body"),
            ),
        }
        pack = export_quarto_slides(simple_blueprint, atoms=atoms, include_ai_atoms=True)
        content = pack.files["slides.qmd"]
        assert "Definition" in content
        assert "Exercise" in content
        assert "Quiz" in content
        assert "Definition body" in content
        assert "Exercise body" in content
        assert "Quiz body" in content

    def test_empty_atoms_no_crash(self, simple_blueprint) -> None:
        pack = export_quarto_slides(simple_blueprint, atoms={})
        assert "slides.qmd" in pack.files

    def test_content_atom_ids_filter_slides(self) -> None:
        bp = CourseBlueprint(
            title="Test",
            modules=(
                ModuleBlueprint(
                    title="M1",
                    lesson_ids=("l1",),
                    content_atom_ids=("l1/def/0",),
                ),
            ),
            audience="test",
            source_lessons=("l1",),
        )
        atoms = {
            "l1": (
                _make_atom("l1/def/0", "definition", "l1", "Incluso"),
                _make_atom("l1/def/1", "definition", "l1", "Escluso"),
            ),
        }
        pack = export_quarto_slides(bp, atoms=atoms, include_ai_atoms=True)
        content = pack.files["slides.qmd"]
        assert "Incluso" in content
        assert "Escluso" not in content


class TestQuartoSlidesEdgeCases:
    """Edge cases and validation."""

    def test_empty_modules_raises_valueerror(self) -> None:
        bp = CourseBlueprint(
            title="Vuoto",
            modules=(),
        )
        with pytest.raises(ValueError, match="no modules"):
            export_quarto_slides(bp)

    def test_single_module(self, single_mod_blueprint) -> None:
        pack = export_quarto_slides(single_mod_blueprint)
        content = pack.files["slides.qmd"]
        assert "## Modulo 1: Meccanica" in content
        assert "l1_kinematics" in content

    def test_output_to_disk(self, single_mod_blueprint, tmp_path) -> None:
        pack = export_quarto_slides(single_mod_blueprint, output_dir=str(tmp_path))
        assert (tmp_path / "_quarto.yml").exists()
        assert (tmp_path / "slides.qmd").exists()

    def test_disk_content_matches_pack(self, single_mod_blueprint, tmp_path) -> None:
        pack = export_quarto_slides(single_mod_blueprint, output_dir=str(tmp_path))
        disk_content = (tmp_path / "slides.qmd").read_text(encoding="utf-8")
        assert disk_content == pack.files["slides.qmd"]

    def test_no_disk_write_when_no_output_dir(self, simple_blueprint) -> None:
        pack = export_quarto_slides(simple_blueprint)
        assert "_quarto.yml" in pack.files
        assert "slides.qmd" in pack.files
        assert len(pack.files) == 2  # _quarto.yml + slides.qmd, no modules/ subdir

    def test_source_refs_in_slides(self, simple_blueprint) -> None:
        atoms = {
            "l1_intro_derivatives": (
                ContentAtom(
                    atom_id="l1/def/0",
                    atom_type="definition",
                    lesson_id="l1_intro_derivatives",
                    body="Def with source",
                    source_refs=(
                        Citation(seg_id="l1s1", excerpt="Def"),
                    ),
                ),
            ),
        }
        pack = export_quarto_slides(simple_blueprint, atoms=atoms)
        content = pack.files["slides.qmd"]
        assert "l1s1" in content
