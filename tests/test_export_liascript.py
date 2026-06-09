"""Tests for LiaScript Course Exporter (P1)."""

from __future__ import annotations

import pytest

from lessonos.course.atoms import ContentAtom
from lessonos.course.schema import CourseBlueprint, ModuleBlueprint
from lessonos.export.liascript import (
    LiaScriptCoursePack,
    export_liascript,
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
    """Helper per creare atomi test-only senza source_refs reali."""
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
    """Atoms fittizi per test (tutti AI-inferred = niente grounding reali)."""
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


@pytest.fixture
def quiz_atoms() -> dict:
    """Solo quiz atoms per test di raggruppamento."""
    return {
        "l1_intro_derivatives": (
            _make_atom(
                "l1_intro_derivatives/quiz_question/0",
                "quiz_question",
                "l1_intro_derivatives",
                "Domanda derivata 1",
            ),
            _make_atom(
                "l1_intro_derivatives/quiz_question/1",
                "quiz_question",
                "l1_intro_derivatives",
                "Domanda derivata 2",
            ),
        ),
    }


# ── Tests ────────────────────────────────────────────────────────────────────


class TestExportLiaScript:
    """Tests per export_liascript()."""

    def test_export_produces_md_file(self, simple_blueprint):
        """L'export produce un file .md."""
        pack = export_liascript(simple_blueprint)
        assert isinstance(pack, LiaScriptCoursePack)
        assert "course.md" in pack.files
        assert pack.files["course.md"].strip()

    def test_frontmatter_contains_format_url(self, simple_blueprint):
        """Il frontmatter YAML contiene format: LiaScript URL."""
        content = export_liascript(simple_blueprint).files["course.md"]
        assert "format:" in content
        assert "LiaScript" in content

    def test_frontmatter_contains_author(self, simple_blueprint):
        """Il frontmatter contiene author dal blueprint."""
        content = export_liascript(simple_blueprint).files["course.md"]
        assert "author:" in content
        assert "Studenti universitari" in content

    def test_title_in_output(self, simple_blueprint):
        """Il titolo del corso e nel body."""
        content = export_liascript(simple_blueprint).files["course.md"]
        assert "# Analisi Matematica" in content

    def test_module_sections_present(self, simple_blueprint):
        """Ogni modulo ha una sezione ##."""
        content = export_liascript(simple_blueprint).files["course.md"]
        assert "## Derivate" in content
        assert "## Integrali" in content

    def test_module_lessons_listed(self, single_mod_blueprint):
        """Le lezioni sono elencate nel modulo."""
        content = export_liascript(single_mod_blueprint).files["course.md"]
        assert "`l1_kinematics`" in content

    def test_table_of_contents_generated(self, simple_blueprint):
        """Il TOC con anchor links e presente."""
        content = export_liascript(simple_blueprint).files["course.md"]
        assert "## Indice" in content
        assert "Derivate" in content
        assert "[Derivate]" in content
        assert "#" in content

    def test_modules_separated_by_horizontal_rule(self, simple_blueprint):
        """I moduli sono separati da ---."""
        content = export_liascript(simple_blueprint).files["course.md"]
        assert "---" in content

    def test_objectives_included(self, simple_blueprint):
        """Gli obiettivi del modulo sono renderizzati."""
        content = export_liascript(simple_blueprint).files["course.md"]
        assert "Comprendere il concetto di derivata" in content

    def test_empty_modules_raises_valueerror(self):
        """Blueprint senza moduli solleva ValueError."""
        bp = CourseBlueprint(
            title="Vuoto",
            modules=(),
        )
        with pytest.raises(ValueError, match="no modules"):
            export_liascript(bp)

    def test_audience_and_level_in_body(self, simple_blueprint):
        """Audience e level sono nel body come blockquote."""
        content = export_liascript(simple_blueprint).files["course.md"]
        assert "Studenti universitari" in content
        assert "base" in content

    def test_filename_customizable(self, single_mod_blueprint):
        """Il filename puo essere personalizzato."""
        pack = export_liascript(single_mod_blueprint, filename="mio_corso.md")
        assert "mio_corso.md" in pack.files
        assert "course.md" not in pack.files

    def test_output_dir_writes_to_disk(self, single_mod_blueprint, tmp_path):
        """output_dir scrive il file su disco."""
        pack = export_liascript(
            single_mod_blueprint,
            output_dir=str(tmp_path),
        )
        assert "course.md" in pack.files
        disk_file = tmp_path / "course.md"
        assert disk_file.exists()
        assert disk_file.read_text(encoding="utf-8").strip()

    def test_write_to_disk_content_matches_memory(self, single_mod_blueprint, tmp_path):
        """Il contenuto su disco coincide col pack in memoria."""
        pack = export_liascript(
            single_mod_blueprint,
            output_dir=str(tmp_path),
        )
        disk_content = (tmp_path / "course.md").read_text(encoding="utf-8")
        assert disk_content == pack.files["course.md"]

    def test_quiz_atoms_included_in_liascript_format(self, quiz_atoms):
        """Quiz atoms generano sintassi LiaScript ?[]. (include_ai_atoms=True perche tutti AI-inferred nei test)"""
        bp = CourseBlueprint(
            title="Quiz Course",
            modules=(
                ModuleBlueprint(
                    title="Modulo Quiz",
                    lesson_ids=("l1_intro_derivatives",),
                ),
            ),
            audience="studenti",
            source_lessons=("l1_intro_derivatives",),
        )
        content = export_liascript(bp, atoms=quiz_atoms, include_ai_atoms=True).files["course.md"]
        assert "?[" in content
        assert "Domanda derivata 1" in content
        assert "Domanda derivata 2" in content
        assert "### Quiz" in content

    def test_ai_inferred_atoms_excluded_by_default(self, sample_atoms):
        """AI-inferred atoms sono esclusi per default."""
        bp = CourseBlueprint(
            title="Test",
            modules=(
                ModuleBlueprint(
                    title="M1",
                    lesson_ids=("l1_intro_derivatives",),
                ),
            ),
            audience="test",
            source_lessons=("l1_intro_derivatives",),
        )
        content = export_liascript(bp, atoms=sample_atoms).files["course.md"]
        # Tutti gli atomi sample sono AI-inferred -> esclusi per default
        assert "La derivata e il limite del rapporto incrementale" not in content
        assert "Qual e la derivata di x^2?" not in content

    def test_include_ai_atoms_flag(self, sample_atoms):
        """include_ai_atoms=True include AI-inferred atoms."""
        bp = CourseBlueprint(
            title="Test",
            modules=(
                ModuleBlueprint(
                    title="M1",
                    lesson_ids=("l1_intro_derivatives",),
                ),
            ),
            audience="test",
            source_lessons=("l1_intro_derivatives",),
        )
        content = export_liascript(
            bp, atoms=sample_atoms, include_ai_atoms=True
        ).files["course.md"]
        assert "La derivata e il limite del rapporto incrementale" in content

    def test_unknown_lesson_atoms_skipped(self, simple_blueprint):
        """Atomi con lesson_id non nel blueprint vengono scartati (nessun errore)."""
        atoms_with_unknown = {
            "l1_intro_derivatives": (
                _make_atom(
                    "l1_intro_derivatives/exercise/0",
                    "exercise",
                    "l1_intro_derivatives",
                    "Esercizio ok",
                ),
            ),
            "unknown_lesson": (
                _make_atom(
                    "unknown_lesson/exercise/0",
                    "exercise",
                    "unknown_lesson",
                    "Esercizio sconosciuto",
                ),
            ),
        }
        content = export_liascript(
            simple_blueprint, atoms=atoms_with_unknown, include_ai_atoms=True
        ).files["course.md"]
        assert "Esercizio ok" in content

    def test_empty_atoms_dict(self, simple_blueprint):
        """Dict atomi vuoto non causa errore."""
        content = export_liascript(simple_blueprint, atoms={}).files["course.md"]
        assert "## Derivate" in content
        assert "### Esercizi" not in content
        assert "### Quiz" not in content

    def test_module_with_content_atom_ids_filter(self):
        """content_atom_ids filtrano gli atomi per modulo."""
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
                _make_atom(
                    "l1/exercise/0",
                    "exercise",
                    "l1",
                    "Esercizio incluso",
                ),
                _make_atom(
                    "l1/exercise/1",
                    "exercise",
                    "l1",
                    "Esercizio escluso",
                ),
            ),
        }
        content = export_liascript(bp, atoms=atoms, include_ai_atoms=True).files["course.md"]
        assert "Esercizio incluso" in content
        assert "Esercizio escluso" not in content
