"""Course Folder Loader — legge una cartella corso da disco (P0a).

Carica il manifest course.json, risolve le lezioni e i sorgenti,
e restituisce un CourseFolder valido (o ValueError se la struttura è invalida).

ZERO deps nuove — solo stdlib json/pathlib.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List

from lessonos.course.schema import (
    CourseBlueprint,
    CourseFolder,
    CourseLessonRef,
    CourseSourceRef,
    ModuleBlueprint,
)


def load_course_folder(folder_path: str) -> CourseFolder:
    """Carica una cartella corso dal filesystem.

    La struttura attesa:
        <folder_path>/
            course.json          — manifest del corso
            lessons/             — cartella con sottocartelle per lezione
                <lesson_id>/     — materiali specifici per lezione
                    ...
            sources/             — materiali globali condivisi

    Args:
        folder_path: Percorso assoluto o relativo alla cartella corso.

    Returns:
        CourseFolder con lezioni e sorgenti risolti.

    Raises:
        ValueError: Se la cartella non esiste, course.json manca,
                    o la struttura è invalida.
    """
    root = Path(folder_path)
    if not root.is_dir():
        raise ValueError(f"course folder not found: {folder_path}")

    manifest_path = root / "course.json"
    if not manifest_path.is_file():
        raise ValueError(f"course.json not found in {folder_path}")

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest: Dict[str, Any] = json.load(f)

    title = manifest.get("title", "") or ""
    if not title:
        raise ValueError("course.json must have a non-empty 'title'")

    # Carica sorgenti globali
    sources = _load_sources(manifest, root)

    # Carica lezioni
    lessons_raw = manifest.get("lessons", [])
    lessons = _load_lessons(lessons_raw, sources)

    # Carica moduli (validando lesson_ids contro lezioni caricate)
    modules = _load_modules(manifest.get("modules", []), lessons)

    return CourseFolder(
        title=title,
        folder_path=str(root.resolve()),
        lessons=tuple(lessons),
        sources=tuple(sources),
        modules=tuple(modules),
    )


def _load_sources(
    manifest: Dict[str, Any], root: Path
) -> List[CourseSourceRef]:
    """Carica i CourseSourceRef dal manifest, verificando che i file esistano."""
    sources_raw = manifest.get("sources", [])
    sources: List[CourseSourceRef] = []
    for s in sources_raw:
        src = CourseSourceRef(
            source_id=s.get("source_id", ""),
            filename=s.get("filename", ""),
            source_type=s.get("source_type", "text"),
        )
        _check_source_file(root, src)
        sources.append(src)
    return sources


def _check_source_file(root: Path, src: CourseSourceRef) -> None:
    """Verifica che il file sorgente esista nella cartella sources/."""
    src_path = root / "sources" / src.filename
    if not src_path.is_file():
        raise ValueError(
            f"source file not found for '{src.source_id}': "
            f"{src_path} (resolved: {src_path.resolve()})"
        )


def _load_lessons(
    lessons_raw: List[Dict[str, Any]],
    sources: List[CourseSourceRef],
) -> List[CourseLessonRef]:
    """Carica i CourseLessonRef dal manifest, verificando i riferimenti."""
    known_source_ids = {s.source_id for s in sources}
    lessons: List[CourseLessonRef] = []
    for l in lessons_raw:
        src_ids = tuple(l.get("source_ids", []))
        for sid in src_ids:
            if sid not in known_source_ids:
                raise ValueError(
                    f"unknown source_id '{sid}' referenced by lesson "
                    f"'{l.get('lesson_id', '?')}'"
                )
        lesson = CourseLessonRef(
            lesson_id=l.get("lesson_id", ""),
            title=l.get("title", ""),
            order=l.get("order", 0),
            source_ids=src_ids,
        )
        lessons.append(lesson)
    return lessons


def _load_modules(
    modules_raw: List[Dict[str, Any]],
    lessons: List[CourseLessonRef],
) -> List[ModuleBlueprint]:
    """Carica i ModuleBlueprint dal manifest, validando lesson_ids."""
    known_lesson_ids = {l.lesson_id for l in lessons}
    modules: List[ModuleBlueprint] = []
    for m in modules_raw:
        lesson_ids = tuple(m.get("lesson_ids", []))
        for lid in lesson_ids:
            if lid not in known_lesson_ids:
                raise ValueError(
                    f"unknown lesson_id '{lid}' referenced by module "
                    f"'{m.get('title', '?')}'"
                )
        blueprint = ModuleBlueprint(
            title=m.get("title", ""),
            lesson_ids=lesson_ids,
            objectives=tuple(m.get("objectives", [])),
        )
        modules.append(blueprint)
    return modules


def build_course_blueprint(course: CourseFolder) -> CourseBlueprint:
    """Costruisce un CourseBlueprint determinista da un CourseFolder.

    Se il CourseFolder ha già dei moduli definiti, li usa direttamente.
    Altrimenti crea un modulo unico con tutte le lezioni (fallback).
    ZERO-LLM (P0c preliminare, deterministico).
    """
    if course.modules:
        return CourseBlueprint(
            title=course.title,
            modules=course.modules,
            source_lessons=tuple(l.lesson_id for l in course.lessons),
        )
    # Fallback: un modulo unico
    single_module = ModuleBlueprint(
        title=course.title,
        lesson_ids=tuple(l.lesson_id for l in course.lessons),
    )
    return CourseBlueprint(
        title=course.title,
        modules=(single_module,),
        source_lessons=tuple(l.lesson_id for l in course.lessons),
    )
