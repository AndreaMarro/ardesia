"""Docling-adapter: convert PDF, DOCX, HTML, VTT, SRT to text via subprocess/stdlib.

COORDINATION.md §18 roadmap: CourseFolder->Atoms->Blueprint->MarkdownPack->LiaScript->
Quarto->MoodleXML->**Docling-adapter**->LLM-planner->Teacher-review.

This module replaces the "richiede Docling adapter" placeholder errors in
source_extractor.py with real extraction. Zero new Python deps: uses subprocess
(pdftotext, pandoc), stdlib (html.parser), and plain-text readers.

Design:
  - Deterministic (same input -> same output)
  - No network calls (fully local)
  - Graceful fallback: if required CLI tool missing, returns error
  - stdlib-only for HTML (html.parser), VTT (simple parser), SRT (simple parser)

Usage:
    from lessonos.export.docling_adapter import docling_extract
    result = docling_extract("/path/to/file.pdf", "pdf")
"""

from __future__ import annotations

import html.parser
import os
import re
import subprocess
from pathlib import Path


# ── Public API ────────────────────────────────────────────────────────────────


def docling_extract(
    file_path: str | Path,
    source_type: str,
) -> str | None:
    """Estrai testo da un file in un formato non-native.

    Args:
        file_path: Percorso al file da estrarre.
        source_type: Tipo di sorgente (pdf, docx, html, vtt, srt).

    Returns:
        Testo estratto, o None se il formato non è supportato o l'estrazione
        fallisce.
    """
    file_path = Path(file_path)
    if not file_path.is_file():
        return None

    source_type = source_type.lower()

    if source_type == "pdf":
        return _extract_pdf(file_path)
    elif source_type == "docx":
        return _extract_docx(file_path)
    elif source_type == "html":
        return _extract_html(file_path)
    elif source_type == "vtt":
        return _extract_vtt(file_path)
    elif source_type == "srt":
        return _extract_srt(file_path)
    else:
        return None


# ── PDF extraction via pdftotext ──────────────────────────────────────────────


def _extract_pdf(file_path: Path) -> str | None:
    """Estrai testo da PDF via pdftotext (poppler).

    Returns None se pdftotext non è installato o fallisce.
    """
    if not _tool_available("pdftotext"):
        return None
    try:
        result = subprocess.run(
            ["pdftotext", "-nopgbrk", str(file_path), "-"],
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode == 0:
            text = result.stdout.strip()
            return text if text else None
        return None
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        return None


# ── DOCX extraction via pandoc ────────────────────────────────────────────────


def _extract_docx(file_path: Path) -> str | None:
    """Estrai testo da DOCX via pandoc.

    Returns None se pandoc non è installato o fallisce.
    """
    if not _tool_available("pandoc"):
        return None
    try:
        result = subprocess.run(
            ["pandoc", str(file_path), "-t", "plain", "--wrap=none"],
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode == 0:
            text = result.stdout.strip()
            return text if text else None
        return None
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        return None


# ── HTML extraction via stdlib html.parser ─────────────────────────────────────


class _HTMLTextExtractor(html.parser.HTMLParser):
    """HTMLParser che estrae solo il testo, saltando tag e script/style."""

    def __init__(self) -> None:
        super().__init__()
        self._text_parts: list[str] = []
        self._skip_tag: str | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in ("script", "style"):
            self._skip_tag = tag

    def handle_endtag(self, tag: str) -> None:
        if self._skip_tag == tag:
            self._skip_tag = None

    def handle_data(self, data: str) -> None:
        if self._skip_tag is None:
            data = data.strip()
            if data:
                self._text_parts.append(data)

    def get_text(self) -> str:
        return " ".join(self._text_parts)


def _extract_html(file_path: Path) -> str | None:
    """Estrai testo da HTML usando stdlib html.parser.

    Salta tag script e style. Restituisce testo pulito.
    Sempre disponibile (stdlib).
    """
    try:
        raw = file_path.read_text(encoding="utf-8", errors="replace")
        if not raw.strip():
            return None
        parser = _HTMLTextExtractor()
        parser.feed(raw)
        text = parser.get_text().strip()
        return text if text else None
    except (OSError, UnicodeDecodeError):
        return None


# ── VTT extraction ────────────────────────────────────────────────────────────


def _extract_vtt(file_path: Path) -> str | None:
    """Estrai solo il testo dai sottotitoli VTT (senza timestamp/header).

    Rimuove: header WEBVTT, timestamp (-->), numeri di sequenza,
    linee vuote. Restituisce solo il contenuto testuale.
    """
    try:
        raw = file_path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None

    lines: list[str] = []
    for line in raw.splitlines():
        stripped = line.strip()
        if (
            not stripped
            or stripped == "WEBVTT"
            or stripped.startswith("WEBVTT")
            or "-->" in stripped
            or stripped.isdigit()
            or stripped.startswith("NOTE ")
        ):
            continue
        lines.append(stripped)

    text = " ".join(lines).strip()
    return text if text else None


# ── SRT extraction ────────────────────────────────────────────────────────────


def _extract_srt(file_path: Path) -> str | None:
    """Estrai solo il testo dai sottotitoli SRT (senza timestamp/numero).

    Rimuove: numeri di sequenza, timestamps (-->), linee vuote.
    Restituisce solo il contenuto testuale.
    """
    try:
        raw = file_path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None

    lines: list[str] = []
    for line in raw.splitlines():
        stripped = line.strip()
        if (
            not stripped
            or "-->" in stripped
            or stripped.isdigit()
        ):
            continue
        lines.append(stripped)

    text = " ".join(lines).strip()
    return text if text else None


# ── Helpers ───────────────────────────────────────────────────────────────────


def _tool_available(name: str) -> bool:
    """Verifica se un tool CLI è disponibile nel PATH."""
    try:
        subprocess.run(
            ["which", name],
            capture_output=True,
            text=True,
            timeout=5,
        )
        return True
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        return False
