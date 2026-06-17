"""Tests per Docling-adapter: PDF, DOCX, HTML, VTT, SRT extraction.

Test categories:
  1. docling_extract dispatch — dispatches by source_type, returns None for unknown
  2. PDF extraction — via pdftotext subprocess (mock external)
  3. DOCX extraction — via pandoc subprocess (mock external)
  4. HTML extraction — stdlib html.parser (no mock needed)
  5. VTT extraction — plain text cleanup
  6. SRT extraction — plain text cleanup
  7. Integration with source_extractor — PDF/DOCX via CourseFolder
"""

from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Any

import pytest

from lessonos.course.schema import CourseFolder, CourseLessonRef, CourseSourceRef
from lessonos.export.docling_adapter import (
    _extract_docx,
    _extract_html,
    _extract_pdf,
    _extract_srt,
    _extract_vtt,
    docling_extract,
)
from lessonos.export.source_extractor import extract_source_materials


# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture
def sample_pdf(tmp_path: Path) -> Path:
    """Crea un finto file PDF (non valido ma con nome .pdf)."""
    p = tmp_path / "test.pdf"
    p.write_bytes(b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n")
    return p


@pytest.fixture
def sample_docx(tmp_path: Path) -> Path:
    """Crea un finto file .docx."""
    p = tmp_path / "test.docx"
    p.write_bytes(b"PK\x03\x04")  # ZIP magic, finto DOCX
    return p


@pytest.fixture
def sample_html(tmp_path: Path) -> Path:
    """Crea un file HTML con testo da estrarre."""
    p = tmp_path / "test.html"
    p.write_text(
        "<html><head><title>Test</title></head><body>"
        "<h1>Ciao mondo</h1>"
        "<p>Questo è un <b>test</b> di estrazione.</p>"
        "<script>var x = 1;</script>"
        "<style>.hidden { display: none; }</style>"
        "</body></html>",
        encoding="utf-8",
    )
    return p


@pytest.fixture
def sample_vtt(tmp_path: Path) -> Path:
    """Crea un file VTT con sottotitoli finti."""
    p = tmp_path / "subtitles.vtt"
    p.write_text(
        "WEBVTT\n\n"
        "1\n"
        "00:00:01.000 --> 00:00:04.000\n"
        "Benvenuti alla lezione di oggi.\n\n"
        "2\n"
        "00:00:05.000 --> 00:00:10.000\n"
        "Oggi parleremo di derivate.\n\n"
        "NOTE Questa è una nota\n\n"
        "3\n"
        "00:00:11.000 --> 00:00:15.000\n"
        "La derivata misura il tasso di cambio.\n",
        encoding="utf-8",
    )
    return p


@pytest.fixture
def sample_srt(tmp_path: Path) -> Path:
    """Crea un file SRT con sottotitoli finti."""
    p = tmp_path / "subtitles.srt"
    p.write_text(
        "1\n"
        "00:00:01,000 --> 00:00:04,000\n"
        "Benvenuti alla lezione.\n\n"
        "2\n"
        "00:00:05,000 --> 00:00:10,000\n"
        "Parleremo di integrali.\n\n"
        "3\n"
        "00:00:11,000 --> 00:00:15,000\n"
        "L'integrale è l'area sotto la curva.\n",
        encoding="utf-8",
    )
    return p


@pytest.fixture
def empty_file(tmp_path: Path) -> Path:
    """File vuoto."""
    p = tmp_path / "empty.html"
    p.write_text("", encoding="utf-8")
    return p


# ── Tests: docling_extract dispatch ──────────────────────────────────────────


class TestDoclingExtractDispatch:
    def test_unknown_format(self, tmp_path: Path) -> None:
        """Formato sconosciuto → None."""
        p = tmp_path / "test.bin"
        p.write_bytes(b"\x00\x01")
        assert docling_extract(p, "binary") is None

    def test_nonexistent_file(self, tmp_path: Path) -> None:
        """File inesistente → None."""
        assert docling_extract(tmp_path / "nope.pdf", "pdf") is None


# ── Tests: PDF extraction (via pdftotext mock) ───────────────────────────────


class TestExtractPdf:
    def test_returns_none_when_pdftotext_unavailable(self, monkeypatch: Any) -> None:
        """Se pdftotext non è nel PATH, extract_pdf → None."""
        monkeypatch.setattr(
            "lessonos.export.docling_adapter._tool_available",
            lambda name: False,
        )
        assert _extract_pdf(Path("/tmp/fake.pdf")) is None

    def test_returns_none_on_subprocess_failure(
        self, monkeypatch: Any, sample_pdf: Path
    ) -> None:
        """Se pdftotext fallisce, extract_pdf → None."""

        def _fail(*args: Any, **kwargs: Any) -> subprocess.CompletedProcess:
            return subprocess.CompletedProcess(
                args=[], returncode=1, stdout="", stderr="error"
            )

        monkeypatch.setattr(
            "lessonos.export.docling_adapter._tool_available",
            lambda name: True,
        )
        monkeypatch.setattr(
            "lessonos.export.docling_adapter.subprocess.run", _fail
        )
        assert _extract_pdf(sample_pdf) is None

    def test_returns_text_on_success(
        self, monkeypatch: Any, sample_pdf: Path
    ) -> None:
        """Se pdftotext ha successo, extract_pdf → testo."""

        def _success(*args: Any, **kwargs: Any) -> subprocess.CompletedProcess:
            return subprocess.CompletedProcess(
                args=[], returncode=0, stdout="Testo estratto dal PDF\n", stderr=""
            )

        monkeypatch.setattr(
            "lessonos.export.docling_adapter._tool_available",
            lambda name: True,
        )
        monkeypatch.setattr(
            "lessonos.export.docling_adapter.subprocess.run", _success
        )
        result = _extract_pdf(sample_pdf)
        assert result == "Testo estratto dal PDF"

    def test_returns_none_on_timeout(
        self, monkeypatch: Any, sample_pdf: Path
    ) -> None:
        """Timeout pdftotext → None."""
        monkeypatch.setattr(
            "lessonos.export.docling_adapter._tool_available",
            lambda name: True,
        )

        def _timeout(*args: Any, **kwargs: Any) -> subprocess.CompletedProcess:
            raise subprocess.TimeoutExpired(cmd="pdftotext", timeout=30)

        monkeypatch.setattr(
            "lessonos.export.docling_adapter.subprocess.run", _timeout
        )
        assert _extract_pdf(sample_pdf) is None


# ── Tests: DOCX extraction (via pandoc mock) ─────────────────────────────────


class TestExtractDocx:
    def test_returns_none_when_pandoc_unavailable(
        self, monkeypatch: Any
    ) -> None:
        """Se pandoc non è nel PATH, extract_docx → None."""
        monkeypatch.setattr(
            "lessonos.export.docling_adapter._tool_available",
            lambda name: False,
        )
        assert _extract_docx(Path("/tmp/fake.docx")) is None

    def test_returns_text_on_success(
        self, monkeypatch: Any, sample_docx: Path
    ) -> None:
        """Se pandoc ha successo, extract_docx → testo."""

        def _success(*args: Any, **kwargs: Any) -> subprocess.CompletedProcess:
            return subprocess.CompletedProcess(
                args=[], returncode=0,
                stdout="Testo dal documento DOCX\n", stderr=""
            )

        monkeypatch.setattr(
            "lessonos.export.docling_adapter._tool_available",
            lambda name: True,
        )
        monkeypatch.setattr(
            "lessonos.export.docling_adapter.subprocess.run", _success
        )
        result = _extract_docx(sample_docx)
        assert result == "Testo dal documento DOCX"


# ── Tests: HTML extraction (stdlib, no mock needed) ──────────────────────────


class TestExtractHtml:
    def test_skips_script_and_style(self, sample_html: Path) -> None:
        """Il parser HTML salva tag script e style."""
        result = _extract_html(sample_html)
        assert result is not None
        assert "Ciao mondo" in result
        assert "test" in result
        assert "estrazione" in result
        # Script e style content devono essere assenti
        assert "var x = 1" not in result
        assert ".hidden" not in result

    def test_nonexistent_file(self, tmp_path: Path) -> None:
        """File HTML inesistente → None."""
        assert _extract_html(tmp_path / "nope.html") is None

    def test_empty_file(self, empty_file: Path) -> None:
        """File HTML vuoto → None."""
        assert _extract_html(empty_file) is None

    def test_no_text(self, tmp_path: Path) -> None:
        """HTML senza testo visibile → None."""
        p = tmp_path / "empty.html"
        p.write_text("<html><script>x</script></html>", encoding="utf-8")
        result = _extract_html(p)
        assert result is None or result == ""

    def test_plain_text(self, tmp_path: Path) -> None:
        """HTML semplice con solo testo."""
        p = tmp_path / "plain.html"
        p.write_text("<p>Uno</p><p>Due</p><p>Tre</p>", encoding="utf-8")
        result = _extract_html(p)
        assert result is not None
        assert "Uno" in result
        assert "Due" in result
        assert "Tre" in result


# ── Tests: VTT extraction ────────────────────────────────────────────────────


class TestExtractVtt:
    def test_removes_headers_and_timestamps(self, sample_vtt: Path) -> None:
        """VTT → solo testo, niente WEBVTT/timestamp/note."""
        result = _extract_vtt(sample_vtt)
        assert result is not None
        assert "Benvenuti alla lezione di oggi" in result
        assert "parleremo di derivate" in result
        assert "La derivata misura il tasso di cambio" in result
        # Deve rimuovere header e timestamp
        assert "WEBVTT" not in result
        assert "-->" not in result
        assert "NOTE" not in result

    def test_nonexistent_file(self, tmp_path: Path) -> None:
        """File VTT inesistente → None."""
        assert _extract_vtt(tmp_path / "nope.vtt") is None

    def test_empty_vtt(self, tmp_path: Path) -> None:
        """File VTT vuoto → None."""
        p = tmp_path / "empty.vtt"
        p.write_text("", encoding="utf-8")
        assert _extract_vtt(p) is None


# ── Tests: SRT extraction ────────────────────────────────────────────────────


class TestExtractSrt:
    def test_removes_numbers_and_timestamps(self, sample_srt: Path) -> None:
        """SRT → solo testo, niente numeri/timestamp."""
        result = _extract_srt(sample_srt)
        assert result is not None
        assert "Benvenuti alla lezione" in result
        assert "Parleremo di integrali" in result
        assert "L'integrale è l'area sotto la curva" in result
        # Deve rimuovere numeri e timestamp
        assert "-->" not in result

    def test_nonexistent_file(self, tmp_path: Path) -> None:
        """File SRT inesistente → None."""
        assert _extract_srt(tmp_path / "nope.srt") is None

    def test_empty_srt(self, tmp_path: Path) -> None:
        """File SRT vuoto → None."""
        p = tmp_path / "empty.srt"
        p.write_text("", encoding="utf-8")
        assert _extract_srt(p) is None


# ── Tests: Integration with source_extractor ─────────────────────────────────


class TestIntegrationWithSourceExtractor:
    def test_pdf_source_via_course_folder(
        self, tmp_path: Path, monkeypatch: Any
    ) -> None:
        """CourseFolder con sorgente PDF -> SourceMaterial estratto (docling_extract mockato)."""
        root = tmp_path / "course_pdf"
        root.mkdir()
        (root / "sources").mkdir()
        pdf_path = root / "sources" / "handout.pdf"
        pdf_path.write_bytes(b"%PDF-1.4\n%%EOF\n")

        # Mocka docling_extract per restituire testo simulato
        def _mock_docling_extract(
            file_path: Path, source_type: str
        ) -> str | None:
            if source_type == "pdf":
                return "Testo estratto dal PDF via Docling-adapter"
            return None

        monkeypatch.setattr(
            "lessonos.export.source_extractor.docling_extract",
            _mock_docling_extract,
        )

        course = CourseFolder(
            title="Test",
            folder_path=str(root),
            lessons=(),
            sources=(
                CourseSourceRef(
                    source_id="handout",
                    filename="handout.pdf",
                    source_type="pdf",
                ),
            ),
        )
        pack = extract_source_materials(course)

        assert "handout" in pack.materials
        mat = pack.materials["handout"]
        assert mat.error is None
        assert "Testo estratto dal PDF via Docling-adapter" in mat.content

    def test_html_source_via_course_folder(self, tmp_path: Path) -> None:
        """CourseFolder con sorgente HTML → SourceMaterial con testo."""
        root = tmp_path / "course_html"
        root.mkdir()
        (root / "sources").mkdir()
        html_path = root / "sources" / "notes.html"
        html_path.write_text(
            "<html><body><h1>Appunti</h1><p>Testo lezione.</p></body></html>",
            encoding="utf-8",
        )

        course = CourseFolder(
            title="Test",
            folder_path=str(root),
            lessons=(),
            sources=(
                CourseSourceRef(
                    source_id="notes",
                    filename="notes.html",
                    source_type="html",
                ),
            ),
        )
        pack = extract_source_materials(course)

        assert "notes" in pack.materials
        mat = pack.materials["notes"]
        assert mat.error is None
        assert "Appunti" in mat.content
        assert "Testo lezione" in mat.content

    def test_vtt_source_via_course_folder(self, tmp_path: Path) -> None:
        """CourseFolder con sorgente VTT → SourceMaterial con testo pulito."""
        root = tmp_path / "course_vtt"
        root.mkdir()
        (root / "sources").mkdir()
        vtt = root / "sources" / "transcript.vtt"
        vtt.write_text(
            "WEBVTT\n\n1\n00:00:01.000 --> 00:00:03.000\nTesto VTT.\n",
            encoding="utf-8",
        )

        course = CourseFolder(
            title="Test",
            folder_path=str(root),
            lessons=(),
            sources=(
                CourseSourceRef(
                    source_id="transcript",
                    filename="transcript.vtt",
                    source_type="vtt",
                ),
            ),
        )
        pack = extract_source_materials(course)
        assert "transcript" in pack.materials
        assert "Testo VTT" in pack.materials["transcript"].content
        assert pack.materials["transcript"].error is None

    def test_srt_source_via_course_folder(self, tmp_path: Path) -> None:
        """CourseFolder con sorgente SRT → SourceMaterial con testo pulito."""
        root = tmp_path / "course_srt"
        root.mkdir()
        (root / "sources").mkdir()
        srt = root / "sources" / "captions.srt"
        srt.write_text(
            "1\n00:00:01,000 --> 00:00:03,000\nTesto SRT.\n",
            encoding="utf-8",
        )

        course = CourseFolder(
            title="Test",
            folder_path=str(root),
            lessons=(),
            sources=(
                CourseSourceRef(
                    source_id="captions",
                    filename="captions.srt",
                    source_type="srt",
                ),
            ),
        )
        pack = extract_source_materials(course)
        assert "captions" in pack.materials
        assert "Testo SRT" in pack.materials["captions"].content
        assert pack.materials["captions"].error is None

    def test_docx_source_fallback(self, tmp_path: Path) -> None:
        """DOCX senza pandoc → errore graceful, non crash."""
        root = tmp_path / "course_docx"
        root.mkdir()
        (root / "sources").mkdir()
        docx = root / "sources" / "notes.docx"
        docx.write_bytes(b"PK\x03\x04fake docx")

        course = CourseFolder(
            title="Test",
            folder_path=str(root),
            lessons=(),
            sources=(
                CourseSourceRef(
                    source_id="notes",
                    filename="notes.docx",
                    source_type="docx",
                ),
            ),
        )
        pack = extract_source_materials(course)

        # DOCX richiede pandoc che non è installato su questa macchina
        assert "notes" in pack.errors
        assert "Richiede pandoc" in pack.errors["notes"]

    def test_lesson_sources_with_pdf_html_vtt(
        self, tmp_path: Path
    ) -> None:
        """Sorgenti per-lezione PDF/HTML/VTT vengono estratti via Docling-adapter."""
        root = tmp_path / "course_mixed"
        root.mkdir()
        (root / "sources").mkdir()
        lesson_dir = root / "lessons" / "l1" / "sources"
        lesson_dir.mkdir(parents=True)

        (lesson_dir / "notes.html").write_text(
            "<p>Appunti HTML</p>", encoding="utf-8"
        )
        (lesson_dir / "captions.vtt").write_text(
            "WEBVTT\n\n1\n00:00:01.000 --> 00:00:03.000\nTesto VTT.\n",
            encoding="utf-8",
        )
        (lesson_dir / "normal.txt").write_text(
            "Testo normale.", encoding="utf-8"
        )

        course = CourseFolder(
            title="Test",
            folder_path=str(root),
            lessons=(
                CourseLessonRef(
                    lesson_id="l1", title="Lezione 1", order=1, source_ids=()
                ),
            ),
            sources=(),
        )
        pack = extract_source_materials(course, include_lesson_sources=True)

        assert "notes" in pack.materials
        assert pack.materials["notes"].error is None
        assert "Appunti HTML" in pack.materials["notes"].content

        assert "captions" in pack.materials
        assert pack.materials["captions"].error is None
        assert "Testo VTT" in pack.materials["captions"].content

        assert "normal" in pack.materials
        assert "Testo normale" in pack.materials["normal"].content
