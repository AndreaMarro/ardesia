"""Markdown Course Exporter — render CourseBlueprint + ContentAtoms → structured markdown (P1).

Deterministico, zero-LLM, pura trasformazione dati.

Output structure (single output_dir):
  <output_dir>/
    course.md          — course overview + module table of contents
    modules/
      <module_id>.md   — module detail with lesson references + atom listings
    exercises.md       — aggregated exercise-type atoms from all modules
    quiz.md            — aggregated quiz_question-type atoms from all modules

COORDINATION.md §18: P1 — markdown course export, deterministic, no-LLM.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Dict, Sequence, Tuple

from lessonos.course.atoms import ATOM_TYPES, ContentAtom
from lessonos.course.schema import CourseBlueprint, ModuleBlueprint

# ContentAtom types that map to separate aggregate files
_EXERCISE_TYPES = frozenset({"exercise"})
_QUIZ_TYPES = frozenset({"quiz_question"})


@dataclass(frozen=True)
class MarkdownCoursePack:
    """Risultato dell'esportazione markdown — mappa file_path → contenuto.

    Ogni entry è un file da scrivere nell'output directory.
    Per i test: si può ispezionare senza scrivere su disco.
    """

    files: Dict[str, str] = field(default_factory=dict)
    """Mappa file_path relativo → contenuto markdown."""


def export_course_markdown(
    blueprint: CourseBlueprint,
    atoms: Dict[str, Tuple[ContentAtom, ...]] | None = None,
    *,
    output_dir: str = "",
    include_ai_atoms: bool = False,
) -> MarkdownCoursePack:
    """Esporta un CourseBlueprint in una struttura di file markdown.

    Args:
        blueprint: CourseBlueprint da esportare.
        atoms: Opzionale. Mappa lesson_id → tuple di ContentAtom.
            Se fornito, arricchisce moduli con body + atom details.
            Se None, i moduli elencano solo lesson_ids e titoli.
        output_dir: Directory di output. Se vuota (default), restituisce
            solo il pack in memoria (utile per test).
        include_ai_atoms: Se True, include atomi con explicit_ai_inference=True.
            Default False — gli AI-inferred atoms (summary, objective) sono esclusi
            dalla export markdown standard (vengono dopo revisione docente).

    Returns:
        MarkdownCoursePack con tutti i file da scrivere.

    ZERO-LLM, deterministico, pura trasformazione dati.
    """
    files: Dict[str, str] = {}

    # ── course.md: overview + TOC ──────────────────────────────────────
    course_lines: list[str] = []
    course_lines.append(f"# {blueprint.title}\n")

    if blueprint.audience:
        course_lines.append(f"**Pubblico:** {blueprint.audience}")
    if blueprint.level:
        course_lines.append(f"**Livello:** {blueprint.level}")

    course_lines.append("")
    course_lines.append(f"**Moduli:** {len(blueprint.modules)}")
    course_lines.append(f"**Lezioni:** {len(blueprint.source_lessons)}")
    course_lines.append("")

    # Table of contents for modules
    course_lines.append("## Indice dei moduli\n")
    for i, mod in enumerate(blueprint.modules):
        n_lessons = len(mod.lesson_ids)
        n_atoms = len(mod.content_atom_ids) if mod.content_atom_ids else 0
        atom_suffix = f" ({n_atoms} atomi)" if n_atoms > 0 else ""
        course_lines.append(
            f"{i + 1}. **{mod.title}** — {n_lessons} lezioni{atom_suffix}"
        )

    files["course.md"] = "\n".join(course_lines)

    # ── modules/ ──────────────────────────────────────────────────────
    module_dir = "modules"
    all_exercise_atoms: list[ContentAtom] = []
    all_quiz_atoms: list[ContentAtom] = []

    for mod_idx, mod in enumerate(blueprint.modules):
        mod_lines: list[str] = []
        mod_lines.append(f"# {mod.title}")
        mod_lines.append("")
        mod_lines.append(f"Modulo {mod_idx + 1} di {len(blueprint.modules)}")
        mod_lines.append("")

        if mod.objectives:
            mod_lines.append("## Obiettivi\n")
            for obj in mod.objectives:
                mod_lines.append(f"- {obj}")
            mod_lines.append("")

        mod_lines.append("## Lezioni\n")
        for lid in mod.lesson_ids:
            mod_lines.append(f"- **{lid}**")

        # Atoms per questo modulo (se forniti)
        # Assegnazione: atomo finisce nel modulo che contiene la sua lesson_id
        if atoms is not None:
            module_lesson_set = set(mod.lesson_ids)
            atom_lines: list[str] = []
            for lid in mod.lesson_ids:
                lesson_atoms = atoms.get(lid, ())
                for atom in lesson_atoms:
                    if not include_ai_atoms and atom.explicit_ai_inference:
                        continue
                    # Se il blueprint ha già content_atom_ids, usali come filtro
                    if mod.content_atom_ids:
                        if atom.atom_id not in set(mod.content_atom_ids):
                            continue
                    # Altrimenti assegna per membership lesson_id
                    elif atom.lesson_id not in module_lesson_set:
                        continue
                    atom_lines.append(_format_atom(atom))
                    # Accumulate for aggregate files
                    if atom.atom_type in _EXERCISE_TYPES:
                        all_exercise_atoms.append(atom)
                    if atom.atom_type in _QUIZ_TYPES:
                        all_quiz_atoms.append(atom)

            if atom_lines:
                mod_lines.append("")
                mod_lines.append("## Contenuti\n")
                mod_lines.extend(atom_lines)

        files[f"{module_dir}/mod{mod_idx + 1}_{_slugify(mod.title)}.md"] = (
            "\n".join(mod_lines)
        )

    # ── exercises.md (aggregate) ──────────────────────────────────────
    if all_exercise_atoms:
        ex_lines: list[str] = [
            "# Esercizi",
            "",
            "Esercizi raccolti da tutti i moduli del corso.",
            "",
        ]
        for atom in all_exercise_atoms:
            ex_lines.append(_format_atom(atom))
            ex_lines.append("---")
            ex_lines.append("")
        files["exercises.md"] = "\n".join(ex_lines)

    # ── quiz.md (aggregate) ──────────────────────────────────────────
    if all_quiz_atoms:
        qz_lines: list[str] = [
            "# Quiz",
            "",
            "Domande raccolte da tutti i moduli del corso.",
            "",
        ]
        for atom in all_quiz_atoms:
            qz_lines.append(_format_atom(atom))
            qz_lines.append("---")
            qz_lines.append("")
        files["quiz.md"] = "\n".join(qz_lines)

    # ── Write to disk if output_dir provided ──────────────────────────
    if output_dir:
        for rel_path, content in files.items():
            abs_path = os.path.join(output_dir, rel_path)
            os.makedirs(os.path.dirname(abs_path), exist_ok=True)
            with open(abs_path, "w", encoding="utf-8") as f:
                f.write(content)

    return MarkdownCoursePack(files=files)


# ── Helpers ──────────────────────────────────────────────────────────────────


def _format_atom(atom: ContentAtom) -> str:
    """Formatta un ContentAtom in markdown."""
    lines: list[str] = []
    # Type badge
    lines.append(f"**Tipo:** `{atom.atom_type}` — ID: `{atom.atom_id}`")
    lines.append("")

    # Body
    lines.append(atom.body)
    lines.append("")

    # Source references
    if atom.source_refs:
        src_lines = []
        for cit in atom.source_refs:
            seg_info = f"`{cit.seg_id}`"
            excerpt = f"_{cit.excerpt}_" if cit.excerpt else ""
            confidence = (
                f" (confidenza: {cit.confidence:.2f})"
                if cit.confidence is not None
                else ""
            )
            src_lines.append(f"- Da {seg_info}{excerpt}{confidence}")
        lines.append("**Fonti:**")
        lines.extend(src_lines)
        lines.append("")

    # Flag
    if atom.teacher_approved:
        lines.append("*✅ Approvato dal docente*")
    if atom.explicit_ai_inference:
        lines.append("*🤖 Inferito dal modello (non revisionato)*")
    if atom.confidence is not None and not atom.source_refs:
        lines.append(f"*Confidenza: {atom.confidence:.2f}*")

    return "\n".join(lines)


def _slugify(title: str) -> str:
    """Crea un slug semplice per nomi file (solo ascii safe)."""
    result = []
    for ch in title.lower():
        if ch.isalnum() or ch in "-_.":
            result.append(ch)
        elif ch in (" ",):
            result.append("_")
        else:
            # skip other chars (accents, parens, etc.)
            pass
    return "".join(result).strip("_") or "module"
