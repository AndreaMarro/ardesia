"""Tests for P2: Materials section in course exports.

Tests that SourceMaterialPack is rendered correctly in:
  1. Markdown export
  2. LiaScript export
  3. Quarto export
"""

from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

import pytest

from lessonos.course.atoms import ContentAtom
from lessonos.course.schema import CourseBlueprint, ModuleBlueprint
from lessonos.export.markdown_course import export_course_markdown
from lessonos.export.liascript import export_liascript
from lessonos.export.quarto import export_quarto
from lessonos.export.source_extractor import SourceMaterial, SourceMaterialPack


# ── Helpers ────────────────────────────────────────────────────────────────


def _make_material(
    source_id: str = "derivatives_handout",
    filename: str = "derivatives.md",
    source_type: str = "markdown",
    content: str = "Definizione di derivata.",
    lesson_id: str | None = None,
    error: str | None = None,
) -> SourceMaterial:
    return SourceMaterial(
        source_id=source_id,
        filename=filename,
        source_type=source_type,
        content=content,
        lesson_id=lesson_id,
        error=error,
    )


def _make_materials_pack() -> SourceMaterialPack:
    return SourceMaterialPack(
        materials={
            "derivatives_handout": _make_material(
                source_id="derivatives_handout",
                filename="derivatives.md",
                source_type="markdown",
                content="Definizione di derivata e proprietà.",
                lesson_id=None,
            ),
            "integrals_slides": _make_material(
                source_id="integrals_slides",
                filename="integrals.pdf",
                source_type="pdf",
                content="Teorema fondamentale del calcolo.",
                lesson_id="l2_integrals",
            ),
            "exercises_pdf": _make_material(
                source_id="exercises_pdf",
                filename="exercises.pdf",
                source_type="pdf",
                content="Esercizi sulle derivate.",
                lesson_id=None,
            ),
            "broken_material": _make_material(
                source_id="broken_material",
                filename="broken.pdf",
                source_type="pdf",
                content="",
                lesson_id=None,
                error="Parse failed",
            ),
        },
        errors={
            "broken_source": "File not found: sources/broken.pdf",
        },
    )


def _make_blueprint() -> CourseBlueprint:
    return CourseBlueprint(
        title="Test Course",
        modules=(
            ModuleBlueprint(title="Modulo A", lesson_ids=("l1",)),
            ModuleBlueprint(title="Modulo B", lesson_ids=("l2",)),
        ),
        audience="studenti",
        level="base",
        source_lessons=("l1", "l2"),
    )


# ── Markdown: materials section ────────────────────────────────────────────


class TestMarkdownMaterialsSection:
    def test_materials_section_added_to_course_md(self) -> None:
        """Con materials, course.md ha una sezione Materiali del corso."""
        bp = _make_blueprint()
        pack = export_course_markdown(bp, materials=_make_materials_pack())
        course_md = pack.files["course.md"]
        assert "## Materiali del corso" in course_md

    def test_global_materials_listed(self) -> None:
        """Materiali globali (lesson_id=None) sono elencati."""
        bp = _make_blueprint()
        pack = export_course_markdown(bp, materials=_make_materials_pack())
        course_md = pack.files["course.md"]
        assert "derivatives.md" in course_md
        assert "`markdown`" in course_md

    def test_no_materials_no_section(self) -> None:
        """Senza materials, nessuna sezione Materiali."""
        bp = _make_blueprint()
        pack = export_course_markdown(bp)
        course_md = pack.files["course.md"]
        assert "Materiali del corso" not in course_md

    def test_materials_none_by_default(self) -> None:
        """materials=None per default non causa errore."""
        bp = _make_blueprint()
        pack = export_course_markdown(bp)
        assert "course.md" in pack.files

    def test_empty_materials_no_section(self) -> None:
        """SourceMaterialPack vuoto non produce sezione."""
        bp = _make_blueprint()
        pack = export_course_markdown(
            bp, materials=SourceMaterialPack(materials={}, errors={})
        )
        course_md = pack.files["course.md"]
        assert "Materiali del corso" not in course_md

    def test_errors_not_rendered_in_section(self) -> None:
        """Materiali con errore NON compaiono nella sezione materiali."""
        bp = _make_blueprint()
        pack = export_course_markdown(bp, materials=_make_materials_pack())
        course_md = pack.files["course.md"]
        # broken_material has error -> not in materials section
        assert "broken.pdf" not in course_md
        # valid materials still shown
        assert "derivatives.md" in course_md

    def test_per_lesson_materials_labeled(self) -> None:
        """Materiali per-lezione hanno label con lesson_id."""
        bp = _make_blueprint()
        pack = export_course_markdown(bp, materials=_make_materials_pack())
        course_md = pack.files["course.md"]
        assert "l2_integrals" in course_md  # lesson_id label for per-lesson material


# ── LiaScript: materials section ───────────────────────────────────────────


class TestLiaScriptMaterialsSection:
    def test_materials_section_added(self) -> None:
        """Con materials, la sezione ## Materiali del corso e presente."""
        bp = _make_blueprint()
        content = export_liascript(bp, materials=_make_materials_pack()).files["course.md"]
        assert "## Materiali del corso" in content

    def test_no_materials_no_section(self) -> None:
        """Senza materials, nessuna sezione Materiali."""
        bp = _make_blueprint()
        content = export_liascript(bp).files["course.md"]
        assert "Materiali del corso" not in content

    def test_materials_none_by_default(self) -> None:
        """materials=None non causa errore."""
        bp = _make_blueprint()
        content = export_liascript(bp).files["course.md"]
        assert content.strip()

    def test_global_materials_listed(self) -> None:
        """Materiali globali appaiono nella sezione."""
        bp = _make_blueprint()
        content = export_liascript(bp, materials=_make_materials_pack()).files["course.md"]
        assert "derivatives.md" in content

    def test_source_type_labeled(self) -> None:
        """Source type e' mostrato per ogni material."""
        bp = _make_blueprint()
        content = export_liascript(bp, materials=_make_materials_pack()).files["course.md"]
        assert "`markdown`" in content or "markdown" in content

    def test_empty_materials_no_section(self) -> None:
        """SourceMaterialPack vuoto non produce sezione."""
        bp = _make_blueprint()
        content = export_liascript(
            bp, materials=SourceMaterialPack(materials={}, errors={})
        ).files["course.md"]
        assert "Materiali del corso" not in content


# ── Quarto: materials section ──────────────────────────────────────────────


class TestQuartoMaterialsSection:
    def test_materials_section_in_index_qmd(self) -> None:
        """Con materials, index.qmd ha una sezione Materiali."""
        bp = _make_blueprint()
        pack = export_quarto(bp, materials=_make_materials_pack())
        index_content = pack.files["index.qmd"]
        assert "## Materiali del corso" in index_content

    def test_no_materials_no_section(self) -> None:
        """Senza materials, nessuna sezione materiali in index.qmd."""
        bp = _make_blueprint()
        pack = export_quarto(bp)
        index_content = pack.files["index.qmd"]
        assert "Materiali del corso" not in index_content

    def test_materials_none_by_default(self) -> None:
        """materials=None non causa errore in quarto."""
        bp = _make_blueprint()
        pack = export_quarto(bp)
        assert "index.qmd" in pack.files

    def test_global_materials_listed_in_index(self) -> None:
        """Materiali globali appaiono in index.qmd."""
        bp = _make_blueprint()
        pack = export_quarto(bp, materials=_make_materials_pack())
        index_content = pack.files["index.qmd"]
        assert "derivatives.md" in index_content

    def test_empty_materials_no_section(self) -> None:
        """SourceMaterialPack vuoto non produce sezione materiali in quarto."""
        bp = _make_blueprint()
        pack = export_quarto(
            bp, materials=SourceMaterialPack(materials={}, errors={})
        )
        index_content = pack.files["index.qmd"]
        assert "Materiali del corso" not in index_content

    def test_per_lesson_materials_labeled(self) -> None:
        """Materiali per-lezione hanno label col lesson_id in quarto."""
        bp = _make_blueprint()
        pack = export_quarto(bp, materials=_make_materials_pack())
        index_content = pack.files["index.qmd"]
        assert "l2_integrals" in index_content

    def test_errors_not_rendered_in_quarto(self) -> None:
        """Materiali con errore non appaiono in index.qmd (quarto)."""
        bp = _make_blueprint()
        pack = export_quarto(bp, materials=_make_materials_pack())
        index_content = pack.files["index.qmd"]
        assert "broken.pdf" not in index_content
        assert "derivatives.md" in index_content

    def test_intro_text_in_quarto_section(self) -> None:
        """Quarto materials section ha testo descrittivo aggiuntivo."""
        bp = _make_blueprint()
        pack = export_quarto(bp, materials=_make_materials_pack())
        index_content = pack.files["index.qmd"]
        assert "Materiali didattici, dispense e risorse" in index_content
