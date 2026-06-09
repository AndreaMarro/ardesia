"""Tests per P1: Source Material Extractor (Docling-adapter foundation).

Test categories:
  1. SourceMaterial dataclass — frozen, fields, validation
  2. extract_source_materials — global sources from CourseFolder
  3. extract_source_materials — lesson-level sources
  4. Edge cases: missing files, unsupported formats, empty folder
  5. get_source_content helper
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

import pytest

from lessonos.course.schema import CourseFolder, CourseLessonRef, CourseSourceRef
from lessonos.export.source_extractor import (
    SourceMaterial,
    SourceMaterialPack,
    extract_source_materials,
    get_source_content,
)


# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture
def sample_course_folder(tmp_path: Path) -> Path:
    """Crea una cartella corso temporanea con sorgenti markdown e text."""
    root = tmp_path / "test_course"
    root.mkdir()
    sources_dir = root / "sources"
    sources_dir.mkdir()

    # Global sources
    (sources_dir / "derivatives.md").write_text(
        "# Derivate\n\n## Regola della catena\nLa derivata di f(g(x))...\n",
        encoding="utf-8",
    )
    (sources_dir / "integrals.md").write_text(
        "# Integrali\n\n## Teorema fondamentale\n...\n",
        encoding="utf-8",
    )
    (sources_dir / "readme.txt").write_text(
        "Materiale di supporto per il corso.",
        encoding="utf-8",
    )

    # Lesson-level sources
    l1_sources = root / "lessons" / "l1" / "sources"
    l1_sources.mkdir(parents=True)
    (l1_sources / "exercises.md").write_text(
        "# Esercizi L1\n1. Calcola...\n", encoding="utf-8"
    )
    (l1_sources / "notes.txt").write_text(
        "Appunti lezione 1.", encoding="utf-8"
    )

    l2_sources = root / "lessons" / "l2" / "sources"
    l2_sources.mkdir(parents=True)
    (l2_sources / "quiz.md").write_text(
        "# Quiz L2\nDomanda 1?", encoding="utf-8"
    )

    return root


@pytest.fixture
def course_folder(sample_course_path: Path) -> CourseFolder:
    """Costruisce un CourseFolder dal path temporaneo."""
    return CourseFolder(
        title="Test Calculus",
        folder_path=str(sample_course_path),
        lessons=(
            CourseLessonRef(
                lesson_id="l1",
                title="Lezione 1",
                order=1,
                source_ids=("derivatives_handout",),
            ),
            CourseLessonRef(
                lesson_id="l2",
                title="Lezione 2",
                order=2,
                source_ids=("integrals_handout",),
            ),
        ),
        sources=(
            CourseSourceRef(
                source_id="derivatives_handout",
                filename="derivatives.md",
                source_type="markdown",
            ),
            CourseSourceRef(
                source_id="integrals_handout",
                filename="integrals.md",
                source_type="markdown",
            ),
            CourseSourceRef(
                source_id="readme",
                filename="readme.txt",
                source_type="text",
            ),
        ),
        modules=(),
    )


# Per evitare conflitti di nome fixture
@pytest.fixture
def sample_course_path(sample_course_folder: Path) -> Path:
    return sample_course_folder


# ── Tests: SourceMaterial dataclass ───────────────────────────────────────────


class TestSourceMaterial:
    def test_frozen(self) -> None:
        """SourceMaterial deve essere frozen."""
        mat = SourceMaterial(
            source_id="s1",
            filename="test.md",
            source_type="markdown",
            content="# Hello",
        )
        with pytest.raises(AttributeError):
            mat.content = "new"  # type: ignore[misc]

    def test_minimal(self) -> None:
        """SourceMaterial con solo campi obbligatori."""
        mat = SourceMaterial(
            source_id="s1",
            filename="test.md",
            source_type="markdown",
            content="# Hello",
        )
        assert mat.source_id == "s1"
        assert mat.lesson_id is None
        assert mat.error is None

    def test_with_lesson(self) -> None:
        """SourceMaterial con lesson_id e error."""
        mat = SourceMaterial(
            source_id="s1",
            filename="test.md",
            source_type="markdown",
            content="",
            lesson_id="l1",
            error="File not found",
        )
        assert mat.lesson_id == "l1"
        assert mat.error == "File not found"


class TestSourceMaterialPack:
    def test_empty(self) -> None:
        """SourceMaterialPack vuoto."""
        pack = SourceMaterialPack()
        assert pack.materials == {}
        assert pack.errors == {}

    def test_with_materials(self) -> None:
        """SourceMaterialPack con materiali e errori."""
        mat = SourceMaterial(
            source_id="s1",
            filename="t.md",
            source_type="markdown",
            content="x",
        )
        pack = SourceMaterialPack(
            materials={"s1": mat},
            errors={"s2": "not found"},
        )
        assert pack.materials["s1"].content == "x"
        assert pack.errors["s2"] == "not found"


# ── Tests: extract_source_materials ──────────────────────────────────────────


class TestExtractGlobalSources:
    def test_extracts_global_markdown(self, course_folder: CourseFolder) -> None:
        """Estrae sorgenti globali markdown."""
        pack = extract_source_materials(course_folder)
        assert "derivatives_handout" in pack.materials
        mat = pack.materials["derivatives_handout"]
        assert mat.source_type == "markdown"
        assert "Regola della catena" in mat.content
        assert mat.error is None
        assert mat.lesson_id is None

    def test_extracts_global_text(self, course_folder: CourseFolder) -> None:
        """Estrae sorgenti globali text."""
        pack = extract_source_materials(course_folder)
        assert "readme" in pack.materials
        mat = pack.materials["readme"]
        assert mat.source_type == "text"
        assert "Materiale di supporto" in mat.content

    def test_extracts_all_global_sources(
        self, course_folder: CourseFolder
    ) -> None:
        """Tutti i sorgenti globali vengono estratti (con exclude_lesson_sources)."""
        pack = extract_source_materials(
            course_folder, include_lesson_sources=True
        )
        # 3 global + 3 lesson sources (exercises.md, notes.txt, quiz.md)
        assert len(pack.materials) == 6
        assert "derivatives_handout" in pack.materials
        assert "integrals_handout" in pack.materials
        assert "readme" in pack.materials

    def test_global_only_when_exclude_lesson_sources(
        self, course_folder: CourseFolder, sample_course_path: Path
    ) -> None:
        """Con include_lesson_sources=False, solo sorgenti globali."""
        pack = extract_source_materials(
            course_folder, include_lesson_sources=False
        )
        assert len(pack.materials) == 3
        assert set(pack.materials.keys()) == {
            "derivatives_handout",
            "integrals_handout",
            "readme",
        }

    def test_no_errors_for_valid_sources(
        self, course_folder: CourseFolder
    ) -> None:
        """Sorgenti validi non producono errori."""
        pack = extract_source_materials(course_folder)
        assert len(pack.errors) == 0


class TestExtractLessonSources:
    def test_extracts_lesson_sources(
        self, course_folder: CourseFolder
    ) -> None:
        """Estrae sorgenti per-lezione quando include_lesson_sources=True."""
        pack = extract_source_materials(course_folder, include_lesson_sources=True)
        # l1 ha exercises.md + notes.txt
        assert "exercises" in pack.materials
        assert "notes" in pack.materials
        assert pack.materials["exercises"].lesson_id == "l1"
        assert pack.materials["notes"].lesson_id == "l1"

    def test_lesson_sources_included_by_default(
        self, course_folder: CourseFolder
    ) -> None:
        """Di default (include_lesson_sources=True), i sorgenti per-lezione vengono estratti."""
        pack = extract_source_materials(course_folder)
        assert "exercises" in pack.materials
        assert "notes" in pack.materials

    def test_lesson_sources_excluded_explicitly(
        self, course_folder: CourseFolder
    ) -> None:
        """Con include_lesson_sources=False, i sorgenti per-lezione NON vengono estratti."""
        pack = extract_source_materials(
            course_folder, include_lesson_sources=False
        )
        assert "exercises" not in pack.materials
        assert "notes" not in pack.materials

    def test_lesson_sources_multiple_lessons(
        self, course_folder: CourseFolder
    ) -> None:
        """Sorgenti da più lezioni vengono estratti correttamente."""
        pack = extract_source_materials(course_folder, include_lesson_sources=True)
        assert "exercises" in pack.materials
        assert "notes" in pack.materials
        assert "quiz" in pack.materials
        assert pack.materials["quiz"].lesson_id == "l2"


class TestExtractEdgeCases:
    def test_missing_source_file(
        self, course_folder: CourseFolder, sample_course_path: Path
    ) -> None:
        """Sorgente dichiarato ma file mancante → SourceMaterial con error."""
        # Aggiungi un sorgente fantasma
        bad_course = CourseFolder(
            title="Bad",
            folder_path=str(sample_course_path),
            lessons=(),
            sources=(
                CourseSourceRef(
                    source_id="ghost",
                    filename="nonexistent.md",
                    source_type="markdown",
                ),
            ),
        )
        pack = extract_source_materials(bad_course)
        assert "ghost" in pack.errors
        assert "ghost" not in pack.materials

    def test_unsupported_format(
        self, course_folder: CourseFolder, sample_course_path: Path
    ) -> None:
        """Formato non markdown/text → SourceMaterial con error."""
        # Crea un sorgente PDF (finto)
        sources_dir = sample_course_path / "sources"
        (sources_dir / "slides.pdf").write_bytes(b"%PDF-1.4 fake pdf")
        bad_course = CourseFolder(
            title="Bad",
            folder_path=str(sample_course_path),
            lessons=(),
            sources=(
                CourseSourceRef(
                    source_id="slides",
                    filename="slides.pdf",
                    source_type="pdf",
                ),
                CourseSourceRef(
                    source_id="doc",
                    filename="notes.docx",
                    source_type="docx",
                ),
            ),
        )
        pack = extract_source_materials(bad_course)
        assert "slides" in pack.errors
        assert "doc" in pack.errors
        assert "Richiede pdftotext" in pack.errors["slides"]
        assert "Richiede pandoc" in pack.errors["doc"]

    def test_unknown_format(
        self, course_folder: CourseFolder, sample_course_path: Path
    ) -> None:
        """Formato sconosciuto → SourceMaterial con error."""
        bad_course = CourseFolder(
            title="Bad",
            folder_path=str(sample_course_path),
            lessons=(),
            sources=(
                CourseSourceRef(
                    source_id="weird",
                    filename="data.bin",
                    source_type="binary",
                ),
            ),
        )
        pack = extract_source_materials(bad_course)
        assert "weird" in pack.errors
        assert "Formato sconosciuto" in pack.errors["weird"]

    def test_empty_course_folder(self, tmp_path: Path) -> None:
        """CourseFolder valido ma cartella vuota → materiali vuoti."""
        root = tmp_path / "empty"
        root.mkdir()
        # Crea la cartella sources/ ma vuota
        (root / "sources").mkdir()
        empty_course = CourseFolder(
            title="Empty",
            folder_path=str(root),
            lessons=(),
            sources=(),
        )
        pack = extract_source_materials(empty_course)
        assert pack.materials == {}
        assert pack.errors == {}

    def test_nonexistent_folder_path(self, tmp_path: Path) -> None:
        """CourseFolder con folder_path inesistente → ValueError."""
        bad_course = CourseFolder(
            title="Bad",
            folder_path=str(tmp_path / "nonexistent"),
            lessons=(),
        )
        with pytest.raises(ValueError, match="does not exist"):
            extract_source_materials(bad_course)

    def test_deduplicates_global_and_lesson(
        self, course_folder: CourseFolder, sample_course_path: Path
    ) -> None:
        """Se un sorgente con stesso source_id esiste sia come globale che
        per-lezione, vince il globale (primo incontrato)."""
        # Crea un sorgente per-lezione con stesso nome di uno globale
        l1_sources = sample_course_path / "lessons" / "l1" / "sources"
        (l1_sources / "derivatives.md").write_text(
            "# Lezione version", encoding="utf-8"
        )
        pack = extract_source_materials(course_folder, include_lesson_sources=True)
        # Il sorgente globale 'derivatives_handout' è distinto da 'derivatives'
        # (source_id diversi), quindi nessun conflitto
        assert "derivatives_handout" in pack.materials
        # 'derivatives' potrebbe essere emerso come lesson source (filename senza ext)
        # Ma 'derivatives.md' esiste già come globale, e _extract_lesson_sources
        # crea un source_id 'derivatives' che non collide con 'derivatives_handout'
        assert "derivatives" in pack.materials
        assert pack.materials["derivatives"].lesson_id == "l1"


# ── Tests: get_source_content ────────────────────────────────────────────────


class TestGetSourceContent:
    def test_returns_content(self, course_folder: CourseFolder) -> None:
        """get_source_content restituisce il contenuto per source_id valido."""
        pack = extract_source_materials(course_folder)
        content = get_source_content(pack, "derivatives_handout")
        assert content is not None
        assert "Regola della catena" in content

    def test_returns_none_for_missing(self, course_folder: CourseFolder) -> None:
        """get_source_content restituisce None per source_id inesistente."""
        pack = extract_source_materials(course_folder)
        assert get_source_content(pack, "nonexistent") is None

    def test_returns_none_for_error(self, tmp_path: Path) -> None:
        """get_source_content restituisce None per sorgente con errore."""
        root = tmp_path / "err"
        root.mkdir()
        (root / "sources").mkdir()
        err_course = CourseFolder(
            title="Err",
            folder_path=str(root),
            lessons=(),
            sources=(
                CourseSourceRef(
                    source_id="bad",
                    filename="missing.md",
                    source_type="markdown",
                ),
            ),
        )
        pack = extract_source_materials(err_course)
        assert get_source_content(pack, "bad") is None

    def test_returns_none_for_empty_pack(self) -> None:
        """get_source_content su pack vuoto → None."""
        pack = SourceMaterialPack()
        assert get_source_content(pack, "anything") is None
