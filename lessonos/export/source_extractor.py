"""Source Material Extractor — reads source files from CourseFolder (P1 Docling-adapter).

Reads source files (markdown, text) from a CourseFolder's sources/ and per-lesson
sources/ directories via stdlib-only. Uses Docling-adapter (subprocess + stdlib)
for PDF, DOCX, HTML, VTT, SRT with graceful fallback.

Deterministic, zero-LLM, zero new Python deps.

COORDINATION.md §18 roadmap: CourseFolder->Atoms->Blueprint->MarkdownPack->LiaScript->
Quarto->MoodleXML->**Docling-adapter**->LLM-planner->Teacher-review
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Sequence

from lessonos.course.schema import CourseFolder, CourseSourceRef
from lessonos.export.docling_adapter import docling_extract


@dataclass(frozen=True)
class SourceMaterial:
    """Contenuto testuale di un materiale sorgente del corso.

    Rappresenta un file sorgente (dispensa, slide, esercizio, ecc.)
    caricato dal filesystem e convertito in testo.
    """

    source_id: str
    """Identificativo univoco del sorgente (es. 'derivatives_handout')."""

    filename: str
    """Nome del file originale (es. 'derivatives.md')."""

    source_type: str
    """Tipo di sorgente: text, markdown, pdf, docx, vtt, srt."""

    content: str
    """Contenuto testuale estratto."""

    lesson_id: str | None = None
    """Se il sorgente appartiene a una lezione specifica, il suo lesson_id."""

    error: str | None = None
    """Se l'estrazione è fallita, messaggio di errore. None = successo."""


@dataclass(frozen=True)
class SourceMaterialPack:
    """Risultato dell'estrazione — mappa source_id → SourceMaterial."""

    materials: Dict[str, SourceMaterial] = field(default_factory=dict)
    """Mappa source_id (univoco) → SourceMaterial estratto."""

    errors: Dict[str, str] = field(default_factory=dict)
    """Mappa source_id → messaggio di errore per sorgenti non caricabili."""


def extract_source_materials(
    course: CourseFolder,
    *,
    include_lesson_sources: bool = True,
) -> SourceMaterialPack:
    """Estrae tutti i materiali sorgente da un CourseFolder.

    Legge i file sorgente globali (course.sources) e, opzionalmente,
    i file nella cartella sources/ di ogni lezione.

    Args:
        course: CourseFolder con i riferimenti ai sorgenti.
        include_lesson_sources: Se True, cerca anche cartelle sources/
            dentro ogni lezione in lessons/<lesson_id>/sources/.

    Returns:
        SourceMaterialPack con i materiali estratti e gli errori.

    Raises:
        ValueError: Se il course.folder_path non esiste (dovrebbe essere
            sempre valido se il CourseFolder è stato creato da load_course_folder()).  # noqa: E501

    ZERO-LLM, deterministico, pura trasformazione dati.
    """
    root = Path(course.folder_path)
    if not root.is_dir():
        raise ValueError(
            f"CourseFolder folder_path does not exist: {course.folder_path}"
        )

    materials: Dict[str, SourceMaterial] = {}
    errors: Dict[str, str] = {}

    # 1. Estrai sorgenti globali (dal CourseFolder.sources)
    for src in course.sources:
        source_id = src.source_id
        if source_id in materials or source_id in errors:
            continue  # deduplica

        src_path = root / "sources" / src.filename
        material = _extract_single_source(src, src_path, lesson_id=None)
        if material.error:
            errors[source_id] = material.error
        else:
            materials[source_id] = material

    # 2. Estrai sorgenti per-lezione (da lessons/<lesson_id>/sources/)
    if include_lesson_sources:
        for lesson in course.lessons:
            lesson_sources_dir = (
                root / "lessons" / lesson.lesson_id / "sources"
            )
            if not lesson_sources_dir.is_dir():
                continue

            lesson_materials = _extract_lesson_sources(
                lesson_sources_dir, lesson.lesson_id
            )
            for source_id, material in lesson_materials.items():
                if source_id in materials:
                    # Se già estratto come globale, aggiungi note ma non duplicare
                    continue
                if source_id in errors:
                    continue
                if material.error:
                    errors[source_id] = material.error
                else:
                    materials[source_id] = material

    return SourceMaterialPack(materials=materials, errors=errors)


def get_source_content(
    pack: SourceMaterialPack,
    source_id: str,
) -> str | None:
    """Ottieni il contenuto testuale di un sorgente per source_id.

    Args:
        pack: SourceMaterialPack da cui cercare.
        source_id: Identificativo del sorgente.

    Returns:
        Il contenuto testuale se trovato senza errori, None altrimenti.
    """
    material = pack.materials.get(source_id)
    if material is not None and material.error is None:
        return material.content
    return None


# ── Internal helpers ──────────────────────────────────────────────────────────


def _extract_single_source(
    src: CourseSourceRef,
    file_path: Path,
    lesson_id: str | None = None,
) -> SourceMaterial:
    """Estrae il contenuto da un singolo file sorgente.

    Supporta: text, markdown, txt, md (read as plain text).
    Altri formati (pdf, docx, vtt, srt): restituiscono SourceMaterial con error.

    Args:
        src: Riferimento al sorgente (definisce source_id, filename, source_type).
        file_path: Percorso assoluto al file sul filesystem.
        lesson_id: Opzionale, lesson_id a cui appartiene il sorgente.

    Returns:
        SourceMaterial con contenuto estratto o errore.
    """
    source_type = src.source_type.lower()

    # Formati supportati nativamente (stdlib-only)
    if source_type in ("text", "txt", "markdown", "md"):
        try:
            content = file_path.read_text(encoding="utf-8")
            return SourceMaterial(
                source_id=src.source_id,
                filename=src.filename,
                source_type=src.source_type,
                content=content,
                lesson_id=lesson_id,
            )
        except Exception as e:
            return SourceMaterial(
                source_id=src.source_id,
                filename=src.filename,
                source_type=src.source_type,
                content="",
                lesson_id=lesson_id,
                error=str(e),
            )

    # Formati via Docling-adapter (subprocess + stdlib, graceful fallback)
    docling_supported = ("pdf", "docx", "html", "vtt", "srt")
    if source_type in docling_supported:
        content = docling_extract(file_path, source_type)
        if content is not None:
            return SourceMaterial(
                source_id=src.source_id,
                filename=src.filename,
                source_type=src.source_type,
                content=content,
                lesson_id=lesson_id,
            )
        # Fallback: tool non disponibile o estrazione fallita
        _help = {
            "pdf": "Richiede pdftotext (poppler) — esegui 'brew install poppler'",
            "docx": "Richiede pandoc — esegui 'brew install pandoc'",
            "html": "Parsing HTML fallito (file vuoto o malformato)",
            "vtt": "Parsing VTT fallito (file vuoto o malformato)",
            "srt": "Parsing SRT fallito (file vuoto o malformato)",
        }
        return SourceMaterial(
            source_id=src.source_id,
            filename=src.filename,
            source_type=src.source_type,
            content="",
            lesson_id=lesson_id,
            error=_help.get(
                source_type,
                f"Estrazione fallita per formato '{source_type}'",
            ),
        )

    # Formato sconosciuto
    return SourceMaterial(
        source_id=src.source_id,
        filename=src.filename,
        source_type=src.source_type,
        content="",
        lesson_id=lesson_id,
        error=f"Formato sconosciuto: '{source_type}'",
    )


def _extract_lesson_sources(
    sources_dir: Path,
    lesson_id: str,
) -> Dict[str, SourceMaterial]:
    """Estrae tutti i sorgenti da una cartella sources/ di una lezione.

    Cerca file .txt, .md, .markdown, .pdf, .docx, .html, .vtt, .srt nella cartella.
    Ogni file viene trattato come un CourseSourceRef con source_id = filename
    (senza estensione) e source_type dedotto dall'estensione.
    """
    materials: Dict[str, SourceMaterial] = {}
    if not sources_dir.is_dir():
        return materials

    ext_to_type = {
        ".md": "markdown",
        ".markdown": "markdown",
        ".txt": "text",
        ".pdf": "pdf",
        ".docx": "docx",
        ".html": "html",
        ".htm": "html",
        ".vtt": "vtt",
        ".srt": "srt",
    }

    for file_path in sorted(sources_dir.iterdir()):
        if not file_path.is_file():
            continue

        ext = file_path.suffix.lower()
        source_type = ext_to_type.get(ext)
        if source_type is None:
            # Salta formati non supportati
            continue

        source_id = file_path.stem  # filename senza estensione
        # Crea un CourseSourceRef ad-hoc per questo file
        fake_src = CourseSourceRef(
            source_id=source_id,
            filename=file_path.name,
            source_type=source_type,
        )
        material = _extract_single_source(fake_src, file_path, lesson_id)
        materials[source_id] = material

    return materials
