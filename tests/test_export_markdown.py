"""Tests for P1: Markdown Course Exporter (COORDINATION.md §18).

Test categories:
  1. export_course_markdown basic structure (course.md + module files)
  2. Atoms rendering: body, source_refs, type badges
  3. Aggregate files: exercises.md, quiz.md
  4. Output to disk (write real files)
  5. Edge cases: no atoms, empty course, AI-only atoms excluded
  6. Formatting helpers: _format_atom, _slugify
"""

from __future__ import annotations

import os
import tempfile

import pytest

from lessonos.capsule.extraction import Citation
from lessonos.course import (
    CourseBlueprint,
    CourseFolder,
    CourseLessonRef,
    CourseSourceRef,
    ModuleBlueprint,
    load_course_folder,
)
from lessonos.course.atoms import ContentAtom
from lessonos.export.markdown_course import (
    MarkdownCoursePack,
    export_course_markdown,
    _format_atom,
    _slugify,
)


# ── Helpers ────────────────────────────────────────────────────────────────


def _make_atom(
    atom_id: str = "l1/definition/0",
    atom_type: str = "definition",
    lesson_id: str = "l1",
    body: str = "Derivative definition",
    source_refs: tuple = (),
    teacher_approved: bool = False,
    explicit_ai_inference: bool = False,
    confidence: float | None = None,
) -> ContentAtom:
    if not source_refs and not explicit_ai_inference:
        # Seg_id test-only — non risolve a Segment reale (export è consumer passivo)
        source_refs = (Citation(seg_id="test-seg-1", excerpt="Derivative"),)
    return ContentAtom(
        atom_id=atom_id,
        atom_type=atom_type,
        lesson_id=lesson_id,
        body=body,
        source_refs=source_refs,
        teacher_approved=teacher_approved,
        explicit_ai_inference=explicit_ai_inference,
        confidence=confidence,
    )


def _make_minimal_blueprint(
    modules: tuple[ModuleBlueprint, ...] = (),
    audience: str = "",
    level: str = "",
) -> CourseBlueprint:
    if not modules:
        modules = (
            ModuleBlueprint(title="Modulo A", lesson_ids=("l1",)),
        )
    return CourseBlueprint(
        title="Test Course",
        modules=modules,
        audience=audience,
        level=level,
        source_lessons=("l1",),
    )


# ── _slugify ───────────────────────────────────────────────────────────────


class TestSlugify:
    def test_basic_title(self) -> None:
        assert _slugify("Integrali e ODE") == "integrali_e_ode"

    def test_accents_removed(self) -> None:
        assert _slugify("Equazioni differenziali") == "equazioni_differenziali"

    def test_alphanumeric_only(self) -> None:
        assert _slugify("Modulo 1: Introduzione!") == "modulo_1_introduzione"

    def test_empty_after_filter(self) -> None:
        assert _slugify("!!!") == "module"

    def test_already_ascii(self) -> None:
        assert _slugify("hello-world") == "hello-world"


# ── _format_atom ──────────────────────────────────────────────────────────


class TestFormatAtom:
    def test_type_badge_and_id(self) -> None:
        atom = _make_atom(atom_id="l1/definition/0", atom_type="definition")
        md = _format_atom(atom)
        assert "`definition`" in md
        assert "`l1/definition/0`" in md

    def test_body_included(self) -> None:
        atom = _make_atom(body="Il limite del rapporto incrementale")
        md = _format_atom(atom)
        assert "Il limite del rapporto incrementale" in md

    def test_source_refs_shown(self) -> None:
        atom = _make_atom(
            source_refs=(
                Citation(seg_id="test-seg-1", excerpt="Derivata", confidence=0.9),
            )
        )
        md = _format_atom(atom)
        assert "`test-seg-1`" in md
        assert "_Derivata_" in md  # excerpt in italic
        assert "confidenza: 0.90" in md or "confidenza: 0.9" in md

    def test_teacher_approved_flag(self) -> None:
        atom = _make_atom(teacher_approved=True)
        md = _format_atom(atom)
        assert "Approvato dal docente" in md

    def test_ai_inference_flag(self) -> None:
        atom = _make_atom(
            explicit_ai_inference=True,
            source_refs=(),
        )
        md = _format_atom(atom)
        assert "Inferito dal modello" in md

    def test_no_source_refs_no_flag(self) -> None:
        """Atom with source_refs but empty source_refs shows no source section."""
        atom = _make_atom(
            source_refs=(Citation(seg_id="test-seg-1", excerpt="Test"),),
        )
        md = _format_atom(atom)
        assert "Fonti" in md

    def test_confidence_without_sources(self) -> None:
        atom = _make_atom(
            explicit_ai_inference=True,
            source_refs=(),
            confidence=0.75,
        )
        md = _format_atom(atom)
        assert "Confidenza: 0.75" in md


# ── export_course_markdown: structure ──────────────────────────────────────


class TestExportStructure:
    def test_course_md_in_pack(self) -> None:
        bp = _make_minimal_blueprint()
        pack = export_course_markdown(bp)
        assert "course.md" in pack.files

    def test_course_md_title(self) -> None:
        bp = _make_minimal_blueprint()
        pack = export_course_markdown(bp)
        assert "# Test Course" in pack.files["course.md"]

    def test_audience_and_level_in_overview(self) -> None:
        bp = _make_minimal_blueprint(audience="studenti", level="base")
        pack = export_course_markdown(bp)
        content = pack.files["course.md"]
        assert "studenti" in content
        assert "base" in content

    def test_module_files_created(self) -> None:
        modules = (
            ModuleBlueprint(title="Derivate", lesson_ids=("l1",)),
            ModuleBlueprint(title="Integrali", lesson_ids=("l2",)),
        )
        bp = _make_minimal_blueprint(modules=modules)
        pack = export_course_markdown(bp)
        # Should have 1 course.md + 2 module files
        assert len(pack.files) == 3
        module_files = [k for k in pack.files if k.startswith("modules/")]
        assert len(module_files) == 2

    def test_module_file_name_is_slugged(self) -> None:
        bp = _make_minimal_blueprint()
        pack = export_course_markdown(bp)
        module_files = [k for k in pack.files if k.startswith("modules/")]
        assert any("mod1" in f for f in module_files)
        assert any("modulo_a" in f for f in module_files)

    def test_module_title_in_content(self) -> None:
        bp = _make_minimal_blueprint()
        pack = export_course_markdown(bp)
        mod_file = [k for k in pack.files if k.startswith("modules/")][0]
        assert "# Modulo A" in pack.files[mod_file]

    def test_module_objectives_rendered(self) -> None:
        mod = ModuleBlueprint(
            title="ODE",
            lesson_ids=("l3",),
            objectives=("Risolvere ODE", "Applicare a fisica"),
        )
        bp = _make_minimal_blueprint(modules=(mod,))
        pack = export_course_markdown(bp)
        mod_file = [k for k in pack.files if k.startswith("modules/")][0]
        content = pack.files[mod_file]
        assert "Risolvere ODE" in content
        assert "Applicare a fisica" in content

    def test_empty_course(self) -> None:
        bp = CourseBlueprint(title="Empty")
        pack = export_course_markdown(bp)
        assert "course.md" in pack.files
        assert "**Moduli:** 0" in pack.files["course.md"]

    def test_no_atoms_still_creates_modules(self) -> None:
        bp = _make_minimal_blueprint()
        pack = export_course_markdown(bp)
        mod_file = [k for k in pack.files if k.startswith("modules/")][0]
        # Module file lists lessons
        assert "**l1**" in pack.files[mod_file]


# ── Atoms rendering in modules ─────────────────────────────────────────────


class TestAtomsInModules:
    def test_atom_rendered_in_correct_module(self) -> None:
        mod = ModuleBlueprint(title="Mod A", lesson_ids=("l1",))
        bp = _make_minimal_blueprint(modules=(mod,))
        atoms = {
            "l1": (_make_atom(atom_id="l1/definition/0", body="Derivata"),),
        }
        pack = export_course_markdown(bp, atoms=atoms)
        mod_file = [k for k in pack.files if k.startswith("modules/")][0]
        content = pack.files[mod_file]
        assert "Derivata" in content
        assert "`definition`" in content
        assert "`l1/definition/0`" in content

    def test_ai_inference_atoms_excluded_default(self) -> None:
        mod = ModuleBlueprint(title="Mod A", lesson_ids=("l1",))
        bp = _make_minimal_blueprint(modules=(mod,))
        atoms = {
            "l1": (
                _make_atom(
                    atom_id="l1/summary/0",
                    atom_type="summary",
                    body="Summary",
                    explicit_ai_inference=True,
                    source_refs=(),
                ),
            ),
        }
        pack = export_course_markdown(bp, atoms=atoms)
        mod_file = [k for k in pack.files if k.startswith("modules/")][0]
        # AI-inferred atoms excluded by default
        assert "Summary" not in pack.files[mod_file]

    def test_include_ai_atoms_flag(self) -> None:
        mod = ModuleBlueprint(title="Mod A", lesson_ids=("l1",))
        bp = _make_minimal_blueprint(modules=(mod,))
        atoms = {
            "l1": (
                _make_atom(
                    atom_id="l1/summary/0",
                    atom_type="summary",
                    body="Summary text",
                    explicit_ai_inference=True,
                    source_refs=(),
                ),
            ),
        }
        pack = export_course_markdown(bp, atoms=atoms, include_ai_atoms=True)
        mod_file = [k for k in pack.files if k.startswith("modules/")][0]
        assert "Summary text" in pack.files[mod_file]

    def test_atoms_in_multiple_modules_separated(self) -> None:
        modules = (
            ModuleBlueprint(title="Der", lesson_ids=("l1",)),
            ModuleBlueprint(title="Int", lesson_ids=("l2",)),
        )
        bp = _make_minimal_blueprint(modules=modules)
        atoms = {
            "l1": (_make_atom(atom_id="l1/def/0", lesson_id="l1"),),
            "l2": (_make_atom(atom_id="l2/def/0", lesson_id="l2"),),
        }
        pack = export_course_markdown(bp, atoms=atoms)
        # Each atom in its own module only
        for fname, content in pack.files.items():
            if "der" in fname:
                assert "l1/def/0" in content
                assert "l2/def/0" not in content
            elif "int" in fname:
                assert "l2/def/0" in content
                assert "l1/def/0" not in content


# ── Aggregate files: exercises.md, quiz.md ─────────────────────────────────


class TestAggregateFiles:
    def test_exercise_atoms_create_exercises_md(self) -> None:
        mod = ModuleBlueprint(title="Mod", lesson_ids=("l1",))
        bp = _make_minimal_blueprint(modules=(mod,))
        atoms = {
            "l1": (
                _make_atom(atom_id="l1/exercise/0", atom_type="exercise",
                           body="Calcola la derivata di x^2"),
                _make_atom(atom_id="l1/definition/0", body="Def"),
            ),
        }
        pack = export_course_markdown(bp, atoms=atoms)
        assert "exercises.md" in pack.files
        assert "Calcola la derivata di x^2" in pack.files["exercises.md"]

    def test_quiz_atoms_create_quiz_md(self) -> None:
        mod = ModuleBlueprint(title="Mod", lesson_ids=("l1",))
        bp = _make_minimal_blueprint(modules=(mod,))
        atoms = {
            "l1": (
                _make_atom(atom_id="l1/quiz_question/0", atom_type="quiz_question",
                           body="Quanto fa 2+2?"),
            ),
        }
        pack = export_course_markdown(bp, atoms=atoms)
        assert "quiz.md" in pack.files
        assert "Quanto fa 2+2?" in pack.files["quiz.md"]

    def test_no_aggregate_files_when_no_exercise_or_quiz(self) -> None:
        mod = ModuleBlueprint(title="Mod", lesson_ids=("l1",))
        bp = _make_minimal_blueprint(modules=(mod,))
        atoms = {
            "l1": (_make_atom(atom_id="l1/def/0"),),
        }
        pack = export_course_markdown(bp, atoms=atoms)
        assert "exercises.md" not in pack.files
        assert "quiz.md" not in pack.files

    def test_ai_excluded_from_aggregates_by_default(self) -> None:
        """AI-inferred exercises/quiz excluded unless include_ai_atoms=True."""
        mod = ModuleBlueprint(title="Mod", lesson_ids=("l1",))
        bp = _make_minimal_blueprint(modules=(mod,))
        atoms = {
            "l1": (
                _make_atom(atom_id="l1/exercise/0", atom_type="exercise",
                           body="AI exercise",
                           explicit_ai_inference=True, source_refs=()),
            ),
        }
        pack = export_course_markdown(bp, atoms=atoms)
        assert "exercises.md" not in pack.files

    def test_ai_included_in_aggregate_with_flag(self) -> None:
        mod = ModuleBlueprint(title="Mod", lesson_ids=("l1",))
        bp = _make_minimal_blueprint(modules=(mod,))
        atoms = {
            "l1": (
                _make_atom(atom_id="l1/exercise/0", atom_type="exercise",
                           body="AI exercise",
                           explicit_ai_inference=True, source_refs=()),
            ),
        }
        pack = export_course_markdown(bp, atoms=atoms, include_ai_atoms=True)
        assert "exercises.md" in pack.files
        assert "AI exercise" in pack.files["exercises.md"]


# ── Output to disk ─────────────────────────────────────────────────────────


class TestOutputToDisk:
    def test_writes_files_to_output_dir(self) -> None:
        bp = _make_minimal_blueprint()
        with tempfile.TemporaryDirectory() as tmpdir:
            pack = export_course_markdown(bp, output_dir=tmpdir)
            assert os.path.isfile(os.path.join(tmpdir, "course.md"))

    def test_writes_module_subdir(self) -> None:
        bp = _make_minimal_blueprint()
        with tempfile.TemporaryDirectory() as tmpdir:
            pack = export_course_markdown(bp, output_dir=tmpdir)
            module_files = [k for k in pack.files if k.startswith("modules/")]
            assert len(module_files) > 0
            for rel_path in module_files:
                assert os.path.isfile(os.path.join(tmpdir, rel_path))

    def test_written_content_matches_pack(self) -> None:
        bp = _make_minimal_blueprint()
        with tempfile.TemporaryDirectory() as tmpdir:
            pack = export_course_markdown(bp, output_dir=tmpdir)
            written_path = os.path.join(tmpdir, "course.md")
            with open(written_path, "r") as f:
                written = f.read()
            assert written == pack.files["course.md"]

    def test_empty_output_dir_no_disk_write(self) -> None:
        bp = _make_minimal_blueprint()
        pack = export_course_markdown(bp)  # no output_dir
        assert "course.md" in pack.files  # still returns pack
        # No disk writes happened (can't verify directly, but no crash)


# ── Default exclusion of AI-inferred atoms ─────────────────────────────────


class TestAiInferenceExclusion:
    def test_explicit_ai_inference_excluded(self) -> None:
        """Default: exclude explicit_ai_inference flag atoms."""
        mod = ModuleBlueprint(title="Mod", lesson_ids=("l1",))
        bp = _make_minimal_blueprint(modules=(mod,))
        atoms = {
            "l1": (
                _make_atom(atom_id="l1/objective/0", atom_type="objective",
                           body="Obj 1", explicit_ai_inference=True,
                           source_refs=()),
            ),
        }
        pack = export_course_markdown(bp, atoms=atoms)
        mod_file = [k for k in pack.files if k.startswith("modules/")][0]
        assert "Obj 1" not in pack.files[mod_file]

    def test_non_ai_atoms_still_included(self) -> None:
        """Non-AI atoms are included even if some AI atoms are excluded."""
        mod = ModuleBlueprint(title="Mod", lesson_ids=("l1",))
        bp = _make_minimal_blueprint(modules=(mod,))
        atoms = {
            "l1": (
                _make_atom(atom_id="l1/def/0", body="Real def"),
                _make_atom(atom_id="l1/summary/0", atom_type="summary",
                           body="AI summary", explicit_ai_inference=True,
                           source_refs=()),
            ),
        }
        pack = export_course_markdown(bp, atoms=atoms)
        mod_file = [k for k in pack.files if k.startswith("modules/")][0]
        content = pack.files[mod_file]
        assert "Real def" in content
        assert "AI summary" not in content


# ── Integration: sample_course real fixture ────────────────────────────────


class TestIntegrationSampleCourse:
    """Integration test: export real sample_course blueprint."""

    def test_sample_course_exports_all_modules(self) -> None:
        course = load_course_folder("fixtures/sample_course")
        bp = load_course_folder("fixtures/sample_course")
        # build a CourseBlueprint from the folder using the exported builder
        from lessonos.course.blueprint import build_course_blueprint
        blueprint = build_course_blueprint(bp)
        pack = export_course_markdown(blueprint)
        assert "course.md" in pack.files
        assert "# Calcolo 2" in pack.files["course.md"]
        module_files = [k for k in pack.files if k.startswith("modules/")]
        assert len(module_files) == 3  # 3 modules in sample_course

    def test_sample_course_with_fake_atoms(self) -> None:
        """Atoms created per-lesson are placed in correct modules."""
        bp = load_course_folder("fixtures/sample_course")
        from lessonos.course.blueprint import build_course_blueprint

        lessons = (
            CourseLessonRef(lesson_id="l1_derivatives", title="Der", order=1),
            CourseLessonRef(lesson_id="l2_integrals", title="Int", order=2),
            CourseLessonRef(lesson_id="l3_differential_equations", title="ODE", order=3),
        )
        blueprint = build_course_blueprint(bp)
        atoms = {
            "l1_derivatives": (
                _make_atom(atom_id="l1_derivatives/exercise/0",
                           atom_type="exercise",
                           lesson_id="l1_derivatives",
                           body="Deriva x^3"),
            ),
            "l2_integrals": (
                _make_atom(atom_id="l2_integrals/quiz_question/0",
                           atom_type="quiz_question",
                           lesson_id="l2_integrals",
                           body="Integra x^2"),
            ),
        }
        pack = export_course_markdown(blueprint, atoms=atoms)
        # exercises.md should have the exercise from l1_derivatives
        assert "exercises.md" in pack.files
        assert "Deriva x^3" in pack.files["exercises.md"]
        # quiz.md should have the quiz from l2_integrals
        assert "quiz.md" in pack.files
        assert "Integra x^2" in pack.files["quiz.md"]
