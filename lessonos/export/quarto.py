"""Quarto Course Exporter — render CourseBlueprint + ContentAtoms → _quarto.yml + .qmd files (P1).

Output structure:
  <output_dir>/
    _quarto.yml          — project config (title, author, chapters, format)
    index.qmd            — course index page with module listing
    modules/
      <module_slug>.qmd  — one .qmd per module with lesson references + atoms

Quarto (https://quarto.org/) is a scientific/technical publishing system.
The output can be rendered to HTML, PDF, slides, or DOCX via:
  quarto render <output_dir>  --to html   (or pdf, revealjs, docx)

ZERO-LLM, deterministic, pura trasformazione dati.
COORDINATION.md §18: P1 — Quarto course export.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Dict, Tuple

from lessonos.course.atoms import ContentAtom
from lessonos.course.schema import CourseBlueprint

# ContentAtom types that map to Quarto special blocks
_QUIZ_TYPES = frozenset({"quiz_question"})
_EXERCISE_TYPES = frozenset({"exercise"})


@dataclass(frozen=True)
class QuartoCoursePack:
    """Risultato dell'esportazione Quarto — mappa file_path → contenuto.

    Includes:
      - _quarto.yml     — Quarto project config
      - index.qmd       — course overview
      - modules/*.qmd   — module detail pages
    """

    files: Dict[str, str] = field(default_factory=dict)
    """Mappa file_path relativo → contenuto Quarto (.qmd or _quarto.yml)."""


def export_quarto(
    blueprint: CourseBlueprint,
    atoms: Dict[str, Tuple[ContentAtom, ...]] | None = None,
    *,
    output_dir: str = "",
    filename: str = "index.qmd",
    include_ai_atoms: bool = False,
) -> QuartoCoursePack:
    """Esporta un CourseBlueprint in formato Quarto (.qmd files + _quarto.yml).

    Prodotto una struttura di progetto Quarto:
      _quarto.yml  — configurazione (title, author, chapters, format)
      index.qmd    — pagina principale con elenco moduli
      modules/     — pagine dettaglio modulo con atomi, esercizi, quiz

    Args:
        blueprint: CourseBlueprint da esportare.
        atoms: Opzionale. Mappa lesson_id → tuple di ContentAtom.
            Se fornito, arricchisce moduli con body + esercizi/quiz.
        output_dir: Directory di output. Se vuota (default), restituisce
            solo il pack in memoria (utile per test).
        filename: Nome del file qmd principale (default: ``index.qmd``).
        include_ai_atoms: Se True, include atomi con explicit_ai_inference=True.
            Default False — gli AI-inferred atoms sono esclusi dalla export
            standard (vengono dopo revisione docente).

    Returns:
        QuartoCoursePack con tutti i file da scrivere.

    ZERO-LLM, deterministico, pura trasformazione dati.
    """
    files: Dict[str, str] = {}
    if not blueprint.modules:
        raise ValueError("course has no modules -- nothing to export")

    # ── _quarto.yml ────────────────────────────────────────────────────
    quarto_yml = _build_quarto_yml(blueprint)
    files["_quarto.yml"] = quarto_yml

    # ── index.qmd ──────────────────────────────────────────────────────
    index_lines: list[str] = []
    index_lines.append(f"# {blueprint.title}")
    index_lines.append("")

    if blueprint.audience:
        index_lines.append(f"> **Pubblico:** {blueprint.audience}")
    if blueprint.level:
        index_lines.append(f"> **Livello:** {blueprint.level}")
    index_lines.append(f"> **Moduli:** {len(blueprint.modules)}")
    if blueprint.source_lessons:
        index_lines.append(f"> **Lezioni:** {len(blueprint.source_lessons)}")
    index_lines.append("")

    index_lines.append("## Moduli")
    index_lines.append("")
    for mod_idx, mod in enumerate(blueprint.modules):
        slug = _slugify(mod.title)
        n_lessons = len(mod.lesson_ids)
        n_atoms = len(mod.content_atom_ids) if mod.content_atom_ids else 0
        atom_suffix = f" ({n_atoms} atomi)" if n_atoms > 0 else ""
        link = f"modules/mod{mod_idx + 1}_{slug}.qmd"
        index_lines.append(
            f"- [{mod.title}]({link}) — {n_lessons} lezioni{atom_suffix}"
        )
    index_lines.append("")

    files[filename] = "\n".join(index_lines).strip() + "\n"

    # ── modules/<slug>.qmd ─────────────────────────────────────────────
    all_exercise_atoms: list[ContentAtom] = []
    all_quiz_atoms: list[ContentAtom] = []
    chapters: list[str] = []

    for mod_idx, mod in enumerate(blueprint.modules):
        slug = _slugify(mod.title)
        mod_path = f"modules/mod{mod_idx + 1}_{slug}.qmd"
        chapters.append(mod_path)
        mod_lines: list[str] = []
        mod_lines.append(f"# {mod.title}")
        mod_lines.append("")

        mod_lines.append(f"Modulo {mod_idx + 1} di {len(blueprint.modules)}")
        mod_lines.append("")

        if mod.objectives:
            mod_lines.append("## Obiettivi")
            mod_lines.append("")
            for obj in mod.objectives:
                mod_lines.append(f"- {obj}")
            mod_lines.append("")

        mod_lines.append("## Lezioni")
        mod_lines.append("")
        for lid in mod.lesson_ids:
            mod_lines.append(f"- {lid}")
        mod_lines.append("")

        # Atoms for this module
        module_lesson_set = set(mod.lesson_ids)
        content_blocks: list[str] = []
        exercise_atoms: list[ContentAtom] = []
        quiz_atoms: list[ContentAtom] = []

        if atoms is not None:
            for lid in mod.lesson_ids:
                lesson_atoms = atoms.get(lid, ())
                for atom in lesson_atoms:
                    if not include_ai_atoms and (
                        atom.explicit_ai_inference
                    ):
                        continue
                    if mod.content_atom_ids:
                        if atom.atom_id not in set(mod.content_atom_ids):
                            continue
                    elif atom.lesson_id not in module_lesson_set:
                        continue

                    if atom.atom_type in _EXERCISE_TYPES:
                        exercise_atoms.append(atom)
                    elif atom.atom_type in _QUIZ_TYPES:
                        quiz_atoms.append(atom)
                    else:
                        content_blocks.append(_format_content_atom(atom))

        if content_blocks:
            mod_lines.append("## Contenuti")
            mod_lines.append("")
            mod_lines.extend(content_blocks)
            mod_lines.append("")

        if exercise_atoms:
            mod_lines.append("## Esercizi")
            mod_lines.append("")
            for a in exercise_atoms:
                mod_lines.append(_format_exercise_in_quarto(a))
                mod_lines.append("")
            all_exercise_atoms.extend(exercise_atoms)

        if quiz_atoms:
            mod_lines.append("## Quiz")
            mod_lines.append("")
            for a in quiz_atoms:
                mod_lines.append(_format_quiz_in_quarto(a))
                mod_lines.append("")
            all_quiz_atoms.extend(quiz_atoms)

        mod_lines.append("---")
        mod_lines.append("")
        files[mod_path] = "\n".join(mod_lines).strip() + "\n"

    # ── Update _quarto.yml with chapters ───────────────────────────────
    if chapters:
        # rebuild _quarto.yml with chapters filled in
        quarto_yml = _build_quarto_yml(blueprint, chapters=chapters)
        files["_quarto.yml"] = quarto_yml

    # ── Aggregate exercises/quiz index pages (optional) ────────────────
    if all_exercise_atoms:
        ex_lines: list[str] = [
            "# Esercizi",
            "",
            "Esercizi raccolti da tutti i moduli del corso.",
            "",
        ]
        for atom in all_exercise_atoms:
            ex_lines.append(_format_exercise_in_quarto(atom))
            ex_lines.append("---")
            ex_lines.append("")
        files["exercises.qmd"] = "\n".join(ex_lines).strip() + "\n"

    if all_quiz_atoms:
        qz_lines: list[str] = [
            "# Quiz",
            "",
            "Domande raccolte da tutti i moduli del corso.",
            "",
        ]
        for atom in all_quiz_atoms:
            qz_lines.append(_format_quiz_in_quarto(atom))
            qz_lines.append("---")
            qz_lines.append("")
        files["quiz.qmd"] = "\n".join(qz_lines).strip() + "\n"

    # ── Write to disk if output_dir provided ──────────────────────────
    if output_dir:
        for rel_path, content in files.items():
            abs_path = os.path.join(output_dir, rel_path)
            os.makedirs(os.path.dirname(abs_path), exist_ok=True)
            with open(abs_path, "w", encoding="utf-8") as f:
                f.write(content)

    return QuartoCoursePack(files=files)


# ── Helpers ──────────────────────────────────────────────────────────────────


def _build_quarto_yml(
    blueprint: CourseBlueprint,
    chapters: list[str] | None = None,
) -> str:
    """Build _quarto.yml project configuration string."""
    lines: list[str] = []
    lines.append("project:")
    lines.append("  type: book")
    lines.append("")
    lines.append(f'title: "{_escape_yaml(blueprint.title)}"')
    if blueprint.audience:
        lines.append(f'audience: "{_escape_yaml(blueprint.audience)}"')
    if blueprint.level:
        lines.append(f'description: "{_escape_yaml(blueprint.level)}"')
    lines.append("")
    lines.append("book:")
    lines.append("  title: " + (
        f'"{_escape_yaml(blueprint.title)}"'
        if " " in blueprint.title
        else blueprint.title
    ))
    if blueprint.audience:
        lines.append("  author: " + (
            f'"{_escape_yaml(blueprint.audience)}"'
            if " " in blueprint.audience
            else blueprint.audience
        ))
    lines.append("  chapters:")

    if chapters:
        for ch in chapters:
            lines.append(f"    - {ch}")
    else:
        lines.append("    - index.qmd")

    lines.append("")
    lines.append("format:")
    lines.append("  html:")
    lines.append("    theme: cosmo")
    lines.append("  pdf:")
    lines.append("    documentclass: scrreport")
    lines.append("  epub:")
    lines.append("    cover: \"\"")
    lines.append("")

    return "\n".join(lines)


def _escape_yaml(value: str) -> str:
    """Escape a string for YAML."""
    if any(c in value for c in '\":#{}[]&*!|>%@`'):
        escaped = value.replace("\\", "\\\\").replace('"', '\\"')
        return f'"{escaped}"'
    return value


def _slugify(title: str) -> str:
    """Create a simple safe filename slug."""
    result: list[str] = []
    for ch in title.lower():
        if ch.isalnum() or ch in "-_.":
            result.append(ch)
        elif ch in (" ",):
            result.append("_")
        else:
            pass
    return "".join(result).strip("_") or "module"


def _format_content_atom(atom: ContentAtom) -> str:
    """Format a non-interactive ContentAtom as Quarto markdown."""
    lines: list[str] = []
    lines.append(f"### {atom.atom_type.replace('_', ' ').title()}")
    lines.append("")
    lines.append(atom.body)
    lines.append("")

    if atom.source_refs:
        src_lines = []
        for cit in atom.source_refs:
            seg_info = f"`{cit.seg_id}`"
            excerpt = f" *{cit.excerpt}*" if cit.excerpt else ""
            confidence = (
                f" (confidenza: {cit.confidence:.2f})"
                if cit.confidence is not None
                else ""
            )
            src_lines.append(f"- Da {seg_info}{excerpt}{confidence}")
        lines.append("")
        lines.append("**Fonti:**")
        lines.extend(src_lines)
        lines.append("")

    if atom.teacher_approved:
        lines.append("*✅ Approvato dal docente*")
        lines.append("")
    if atom.explicit_ai_inference and atom.source_refs:
        lines.append("*🤖 Inferito dal modello*")
        lines.append("")

    return "\n".join(lines).rstrip()


def _format_exercise_in_quarto(atom: ContentAtom) -> str:
    """Format an exercise atom as a Quarto callout block.

    Uses the Quarto ::: callout format for exercises.
    """
    lines: list[str] = []
    lines.append("::: {.callout-exercise}")
    lines.append(f"## {atom.body}")
    lines.append("")
    lines.append("Soluzione da sviluppare.")
    lines.append(":::")
    if atom.source_refs:
        lines.append("")
        src_hint = "; ".join(
            f"`{c.seg_id}`" for c in atom.source_refs[:3]
        )
        lines.append(f"*Fonte: {src_hint}*")
    if atom.teacher_approved:
        lines.append("*✅ Approvato dal docente*")
    return "\n".join(lines)


def _format_quiz_in_quarto(atom: ContentAtom) -> str:
    """Format a quiz_question atom as a Quarto callout block.

    Uses the Quarto ::: callout-important format for quiz questions.
    """
    lines: list[str] = []
    lines.append("::: {.callout-question}")
    lines.append(f"## {atom.body}")
    lines.append("")
    lines.append("1. Opzione 1")
    lines.append("2. Opzione 2 (risposta corretta)")
    lines.append("3. Opzione 3")
    lines.append(":::")
    if atom.source_refs:
        lines.append("")
        src_hint = "; ".join(
            f"`{c.seg_id}`" for c in atom.source_refs[:3]
        )
        lines.append(f"*Fonte: {src_hint}*")
    if atom.teacher_approved:
        lines.append("*✅ Approvato dal docente*")
    return "\n".join(lines)
