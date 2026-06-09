"""
LiaScript Course Exporter — render CourseBlueprint + ContentAtoms → LiaScript .md (P1).

LiaScript (https://liascript.github.io/) è un formato markdown interattivo che
permette di creare corsi con quiz, animazioni, e codice eseguibile dal browser.

Output: un singolo file .md compatibile LiaScript con:
  - YAML frontmatter (author, description, format URL)
  - Module sections con anchor link TOC
  - Quiz interattivi tramite macro ``?[`` e scelte multiple
  - Exercises interattivi
  - Link navigabili tra moduli

COORDINATION.md §18: P1 — LiaScript course export, deterministic, no-LLM.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Dict, Tuple

from lessonos.course.atoms import ContentAtom
from lessonos.course.schema import CourseBlueprint
from lessonos.export.source_extractor import SourceMaterialPack

# ContentAtom types that map to LiaScript interactive elements
_QUIZ_TYPES = frozenset({"quiz_question"})
_EXERCISE_TYPES = frozenset({"exercise"})
_SKIPPED_AI_TYPES = frozenset({"summary", "objective"})


@dataclass(frozen=True)
class LiaScriptCoursePack:
    """Risultato dell'esportazione LiaScript — mappa file_path → contenuto.

    Di default produce un singolo file .md con tutto il corso.
    Per i test: si può ispezionare senza scrivere su disco.
    """

    files: Dict[str, str] = field(default_factory=dict)
    """Mappa file_path relativo → contenuto markdown LiaScript."""


def export_liascript(
    blueprint: CourseBlueprint,
    atoms: Dict[str, Tuple[ContentAtom, ...]] | None = None,
    *,
    output_dir: str = "",
    filename: str = "course.md",
    include_ai_atoms: bool = False,
    materials: SourceMaterialPack | None = None,
) -> LiaScriptCoursePack:
    """Esporta un CourseBlueprint in formato LiaScript (.md interattivo).

    Args:
        blueprint: CourseBlueprint da esportare.
        atoms: Opzionale. Mappa lesson_id -> tuple di ContentAtom.
            Se fornito, arricchisce moduli con body + quiz/esercizi interattivi.
            Se None, i moduli elencano solo lesson_ids e titoli.
        output_dir: Directory di output. Se vuota (default), restituisce
            solo il pack in memoria (utile per test).
        filename: Nome del file output (default: ``course.md``).
        include_ai_atoms: Se True, include atomi con explicit_ai_inference=True.
            Default False — gli AI-inferred atoms sono esclusi dalla export
            standard (vengono dopo revisione docente).

    Returns:
        LiaScriptCoursePack con i file da scrivere.

    ZERO-LLM, deterministico, pura trasformazione dati.
    """
    lines: list[str] = []
    _check_blueprint(blueprint)

    # -- YAML frontmatter --------------------------------------------------
    lines.append("---")
    lines.append(f"author: {_escape_yaml(blueprint.audience or 'Docente')}")
    if blueprint.level:
        lines.append(f"description: {_escape_yaml(blueprint.level)}")
    lines.append(
        "format: https://LiaScript.github.io/"
        "https://raw.githubusercontent.com/LiaScript/"
        "LiaScript/master/README.md"
    )
    lines.append("---")
    lines.append("")

    # -- Title -------------------------------------------------------------
    lines.append(f"# {blueprint.title}")
    lines.append("")

    if blueprint.audience:
        lines.append(f"> **Pubblico:** {blueprint.audience}")
    if blueprint.level:
        lines.append(f"> **Livello:** {blueprint.level}")
    lines.append(f"> **Moduli:** {len(blueprint.modules)}")
    if blueprint.source_lessons:
        lines.append(
            f"> **Lezioni:** {len(blueprint.source_lessons)}"
        )
    lines.append("")

    # -- Table of Contents (anchor links) ----------------------------------
    if blueprint.modules:
        lines.append("## Indice")
        lines.append("")
        for i, mod in enumerate(blueprint.modules):
            anchor = _module_anchor(mod.title, i)
            lines.append(f"- [{mod.title}](#{anchor})")
        lines.append("")
        lines.append("")

    # -- Materials section ----------------------------------------------------
    if materials and materials.materials:
        valid_mats = [
            (src_id, mat)
            for src_id, mat in sorted(materials.materials.items())
            if mat.error is None
        ]
        if valid_mats:
            lines.append("## Materiali del corso")
            lines.append("")
            for src_id, mat in valid_mats:
                lesson_tag = (
                    f" (lezione: `{mat.lesson_id}`)" if mat.lesson_id else ""
                )
                lines.append(
                    f"- **{mat.filename}** — `{mat.source_type}`{lesson_tag}"
                )
            lines.append("")

    # -- Modules -----------------------------------------------------------
    for mod_idx, mod in enumerate(blueprint.modules):
        anchor = _module_anchor(mod.title, mod_idx)
        lines.append(f"<a name=\"{anchor}\"></a>")
        lines.append("")
        lines.append(f"## {mod.title}")
        lines.append("")

        if mod.objectives:
            lines.append("### Obiettivi")
            lines.append("")
            for obj in mod.objectives:
                lines.append(f"- {obj}")
            lines.append("")

        lines.append("### Lezioni")
        lines.append("")
        for lid in mod.lesson_ids:
            lines.append(f"- `{lid}`")
        lines.append("")

        # Atoms for this module
        if atoms is not None:
            module_lesson_set = set(mod.lesson_ids)
            quiz_lines: list[str] = []
            ex_lines: list[str] = []

            for lid in mod.lesson_ids:
                lesson_atoms = atoms.get(lid, ())
                for atom in lesson_atoms:
                    if not include_ai_atoms and (
                        atom.explicit_ai_inference
                        or atom.atom_type in _SKIPPED_AI_TYPES
                    ):
                        continue
                    if mod.content_atom_ids:
                        if atom.atom_id not in set(mod.content_atom_ids):
                            continue
                    elif atom.lesson_id not in module_lesson_set:
                        continue

                    if atom.atom_type in _QUIZ_TYPES:
                        quiz_lines.append(_format_quiz_atom(atom))
                    elif atom.atom_type in _EXERCISE_TYPES:
                        ex_lines.append(_format_exercise_atom(atom))
                    else:
                        lines.append(_format_content_atom(atom))
                        lines.append("")

            if ex_lines:
                lines.append("### Esercizi")
                lines.append("")
                lines.extend(ex_lines)
                lines.append("")
            if quiz_lines:
                lines.append("### Quiz")
                lines.append("")
                lines.extend(quiz_lines)
                lines.append("")

        lines.append("---")
        lines.append("")

    # -- Write to disk if output_dir provided ------------------------------
    files: Dict[str, str] = {}
    content = "\n".join(lines).strip() + "\n"
    files[filename] = content

    if output_dir:
        abs_path = os.path.join(output_dir, filename)
        os.makedirs(os.path.dirname(abs_path) or output_dir, exist_ok=True)
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(content)

    return LiaScriptCoursePack(files=files)


# -- Helpers ----------------------------------------------------------------


def _check_blueprint(blueprint: CourseBlueprint) -> None:
    """Validate blueprint before export (fast-fail on empty)."""
    if not blueprint.modules:
        raise ValueError("course has no modules -- nothing to export")


def _escape_yaml(value: str) -> str:
    """Escape a string for YAML frontmatter."""
    if any(c in value for c in '":#{}[]&*!|>%@`'):
        escaped = value.replace("\\", "\\\\").replace('"', '\\"')
        return f'"{escaped}"'
    return value


def _module_anchor(title: str, index: int) -> str:
    """Generate a stable anchor ID for a module."""
    safe = "".join(c for c in title.lower() if c.isalnum() or c in " _-")
    safe = safe.replace(" ", "_")
    return f"module_{index}_{safe}" if safe else f"module_{index}"


def _format_quiz_atom(atom: ContentAtom) -> str:
    """Format a quiz_question atom as a LiaScript quiz.

    LiaScript quiz syntax:
      ?[Question text]
      - [ ] Wrong answer
      - [x] Correct answer
    """
    lines: list[str] = []
    lines.append(f"?[{atom.body}]")
    lines.append("")
    lines.append("- [ ] _Opzione 1_")
    lines.append("- [x] _Opzione 2_ (risposta corretta)")
    lines.append("- [ ] _Opzione 3_")
    lines.append("")

    if atom.source_refs:
        src_hint = "; ".join(
            f"`{c.seg_id}`" for c in atom.source_refs[:3]
        )
        lines.append(f"> Fonte: {src_hint}")
        lines.append("")
    if atom.teacher_approved:
        lines.append("*Approved dal docente*")
    if atom.explicit_ai_inference:
        lines.append("*Inferito dal modello*")
    lines.append("")

    return "\n".join(lines).rstrip()


def _format_exercise_atom(atom: ContentAtom) -> str:
    """Format an exercise atom as a LiaScript interactive exercise."""
    lines: list[str] = []
    lines.append(f"**Esercizio:** {atom.body}")
    lines.append("")
    lines.append("```javascript")
    lines.append("// Scrivi la tua soluzione qui")
    lines.append("```")
    lines.append("")

    if atom.source_refs:
        src_hint = "; ".join(
            f"`{c.seg_id}`" for c in atom.source_refs[:3]
        )
        lines.append(f"> Fonte: {src_hint}")
        lines.append("")
    if atom.teacher_approved:
        lines.append("*Approved dal docente*")
    if atom.explicit_ai_inference:
        lines.append("*Inferito dal modello*")

    return "\n".join(lines).rstrip()


def _format_content_atom(atom: ContentAtom) -> str:
    """Format a non-interactive atom (definition, explanation, etc.) as plain markdown."""
    lines: list[str] = []
    lines.append(f"**{atom.atom_type.capitalize()}:** {atom.body}")
    if atom.source_refs:
        src_hint = "; ".join(
            f"`{c.seg_id}`" for c in atom.source_refs[:3]
        )
        lines.append(f"*Fonte: {src_hint}*")
    if atom.teacher_approved:
        lines.append("*Approved dal docente*")
    return "\n".join(lines).rstrip()
