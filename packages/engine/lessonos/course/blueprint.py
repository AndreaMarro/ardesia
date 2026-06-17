"""Course Blueprint Builder — costruisce CourseBlueprint da CourseFolder + ContentAtoms (P0c).

P0c arricchisce il builder deterministico per includere content_atom_ids per modulo,
audience, level, e source_lessons. ZERO-LLM, puramente deterministico.

COORDINATION.md §16 P0c: CourseBlueprint+ModuleBlueprint builder deterministic/mock.
"""

from __future__ import annotations

from typing import Dict, Tuple

from lessonos.course.atoms import ContentAtom
from lessonos.course.schema import CourseBlueprint, CourseFolder, ModuleBlueprint


def build_course_blueprint(
    course: CourseFolder,
    atoms: Dict[str, Tuple[ContentAtom, ...]] | None = None,
    *,
    audience: str = "",
    level: str = "",
) -> CourseBlueprint:
    """Costruisce un CourseBlueprint determinista da un CourseFolder.

    Se il CourseFolder ha già dei moduli definiti, li usa direttamente.
    Altrimenti crea un modulo unico con tutte le lezioni (fallback).

    Se ``atoms`` è fornito (dict lesson_id → tuple[ContentAtom, ...]), assegna
    ogni ContentAtom al modulo che contiene la sua lesson_id. Gli atomi per
    lezioni non in nessun modulo vengono scartati (nessun errore).

    Args:
        course: CourseFolder caricato da load_course_folder().
        atoms: Opzionale. Mappa lesson_id → tuple di ContentAtom da assegnare
            ai moduli. Se None, i moduli non hanno content_atom_ids.
        audience: Pubblico target del corso (es. "studenti universitari").
        level: Livello del corso (es. "base", "intermedio", "avanzato").

    Returns:
        CourseBlueprint con moduli (e atom_ids se atoms fornito).

    ZERO-LLM, deterministico, puramente data-transformation.
    """
    lesson_id_set = {l.lesson_id for l in course.lessons}

    # Costruisci moduli di base
    if course.modules:
        base_modules = course.modules
    else:
        # Fallback: modulo unico con tutte le lezioni
        base_modules = (ModuleBlueprint(
            title=course.title,
            lesson_ids=tuple(l.lesson_id for l in course.lessons),
        ),)

    # Arricchisci moduli con content_atom_ids se atoms è fornito
    enriched_modules: list[ModuleBlueprint] = []
    for mod in base_modules:
        atom_ids_for_module: list[str] = []
        if atoms is not None:
            # Raccogli atom_ids da tutte le lezioni del modulo
            for lid in mod.lesson_ids:
                lesson_atoms = atoms.get(lid)
                if lesson_atoms:
                    atom_ids_for_module.extend(
                        a.atom_id for a in lesson_atoms
                    )
        enriched_modules.append(ModuleBlueprint(
            title=mod.title,
            lesson_ids=mod.lesson_ids,
            objectives=mod.objectives,
            content_atom_ids=tuple(atom_ids_for_module),
        ))

    # source_lessons = tutte le lezioni nel corso (in ordine)
    source_lessons = tuple(l.lesson_id for l in course.lessons)

    return CourseBlueprint(
        title=course.title,
        modules=tuple(enriched_modules),
        audience=audience,
        level=level,
        source_lessons=source_lessons,
    )
