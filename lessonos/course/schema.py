"""Course schema — entità di dominio per il Course Compiler (P0a).

Definisce le strutture dati di un corso costruito da una cartella di lezioni
reali del docente. Tutte frozen + validate a costruzione.

COORDINATION.md: P0a — CourseFolder, CourseLessonRef, CourseSourceRef,
CourseBlueprint, ModuleBlueprint. ZERO deps nuove, NO LLM, NO UI.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Sequence


@dataclass(frozen=True)
class CourseLessonRef:
    """Riferimento a una lezione all'interno di un corso.

    Può essere una lezione interna al corso (lesson_id riferito a una fixture
    o a un file nella cartella lessons/) oppure un riferimento esterno.
    """

    lesson_id: str
    title: str
    order: int
    source_ids: tuple[str, ...] = ()
    """I sorgenti (file/cartella) da cui questa lezione attinge materiali."""

    def __post_init__(self) -> None:
        if not self.lesson_id:
            raise ValueError("lesson_id must be non-empty")
        if not self.title:
            raise ValueError("title must be non-empty")
        if self.order < 1:
            raise ValueError(f"order must be >= 1, got {self.order}")
        for sid in self.source_ids:
            if not sid:
                raise ValueError("source_ids entries must be non-empty")


@dataclass(frozen=True)
class CourseSourceRef:
    """Riferimento a un materiale sorgente (file condiviso o per-lezione)."""

    source_id: str
    filename: str
    """Nome del file (relativo alla cartella sources/ del corso)."""

    source_type: str = "text"
    """tipo di sorgente: text, vtt, srt, pdf, markdown, ecc."""

    def __post_init__(self) -> None:
        if not self.source_id:
            raise ValueError("source_id must be non-empty")
        if not self.filename:
            raise ValueError("filename must be non-empty")
        if not self.source_type:
            raise ValueError("source_type must be non-empty")


@dataclass(frozen=True)
class ModuleBlueprint:
    """Un modulo (capitolo) del corso — gruppo ordinato di lezioni.

    Un modulo raggruppa una sequenza di lezioni su un argomento specifico
    all'interno del corso.
    """

    title: str
    lesson_ids: tuple[str, ...] = ()
    """Lezioni che compongono il modulo, in ordine di erogazione."""

    objectives: tuple[str, ...] = ()
    """Obiettivi di apprendimento del modulo."""

    content_atom_ids: tuple[str, ...] = ()
    """ContentAtoms che appartengono a questo modulo (P0c)."""

    def __post_init__(self) -> None:
        if not self.title:
            raise ValueError("title must be non-empty")
        for lid in self.lesson_ids:
            if not lid:
                raise ValueError("lesson_ids entries must be non-empty")


@dataclass(frozen=True)
class CourseBlueprint:
    """Blueprint del corso — struttura modulare, non i materiali grezzi.

    Un CourseBlueprint è costruito DA un CourseFolder, ma può essere
    arricchito dal LLM-planner (P0c) e/o dalla revisione del docente
    (teacher-review, fuori v0).
    """

    title: str
    modules: tuple[ModuleBlueprint, ...] = ()
    audience: str = ""
    level: str = ""
    source_lessons: tuple[str, ...] = ()
    """Le lezioni del CourseFolder da cui questo blueprint è derivato."""

    def __post_init__(self) -> None:
        if not self.title:
            raise ValueError("title must be non-empty")


@dataclass(frozen=True)
class CourseFolder:
    """Rappresentazione di una cartella corso su disco (P0a).

    Una cartella corso contiene:
    - lessons/  — una sottocartella per lezione, ognuna con materiali propri
    - sources/  — materiali globali (dispense, slide, fonti condivise)
    - course.json — manifest del corso (titolo, lezioni ordinate, moduli opzionali)

    CourseFolder è il risultato del loading: contiene i riferimenti risolti
    alle lezioni e ai sorgenti presenti nella cartella.
    """

    title: str
    folder_path: str
    lessons: tuple[CourseLessonRef, ...] = ()
    sources: tuple[CourseSourceRef, ...] = ()
    modules: tuple[ModuleBlueprint, ...] = ()

    def __post_init__(self) -> None:
        if not self.title:
            raise ValueError("title must be non-empty")
        if not self.folder_path:
            raise ValueError("folder_path must be non-empty")
        seen_ids: set[str] = set()
        for lesson in self.lessons:
            if lesson.lesson_id in seen_ids:
                raise ValueError(
                    f"duplicate lesson_id: {lesson.lesson_id}"
                )
            seen_ids.add(lesson.lesson_id)
        seen_src: set[str] = set()
        for src in self.sources:
            if src.source_id in seen_src:
                raise ValueError(
                    f"duplicate source_id: {src.source_id}"
                )
            seen_src.add(src.source_id)
        # Verifica ordine lezioni monotono crescente
        prev_order = 0
        for lesson in self.lessons:
            if lesson.order <= prev_order:
                raise ValueError(
                    f"non-increasing lesson order: {lesson.order} "
                    f"after {prev_order}"
                )
            prev_order = lesson.order
