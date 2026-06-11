"""ZERO-LLM markdown renderer for TeacherBook (M1-3).

Turns a ``TeacherBook`` data structure into a structured markdown document.
Every citation is preserved with its grounded provenance (lesson_id, seg_id,
excerpt). Fully deterministic — no LLM calls.

Output sections:
  * Title + metadata block
  * Overview statistics
  * Fundamental concepts (ranked by evidence)
  * Problematic concepts (if any)
  * Status progression (cross-concept evolution)
  * Prerequisite chains
  * Grounding footer with evidence count
"""

from __future__ import annotations

from lessonos.models.entities import (
    ConceptProgression,
    PrerequisiteChain,
    TeacherBook,
    TeacherConcept,
)


def _plural(n: int, singular: str, plural: str | None = None) -> str:
    """Return ``singular`` or ``plural`` depending on *n*."""
    if n == 1:
        return f"{n} {singular}"
    return f"{n} {plural or singular + 's'}"


def _render_citations(concept: TeacherConcept) -> str:
    """Render grounded citations for a concept as a compact indented list."""
    if not concept.citations:
        return ""
    lines: list[str] = []
    # Show at most 5 to keep the output readable; note total if truncated
    shown = concept.citations[:5]
    for ev in shown:
        excerpt = ev.excerpt or "(no excerpt)"
        if len(excerpt) > 100:
            excerpt = excerpt[:97] + "..."
        lines.append(f"  - `{ev.seg_id}`: _{excerpt}_")
    if len(concept.citations) > 5:
        lines.append(f"  - _+{len(concept.citations) - 5} more citations_")
    return "\n".join(lines)


def _render_fundamental(concepts: tuple[TeacherConcept, ...]) -> str:
    """Render the fundamental concepts section."""
    if not concepts:
        return "_(no concepts extracted)_"
    rows: list[str] = []
    for i, tc in enumerate(concepts, 1):
        rows.append(
            f"{i}. **{tc.name}** — {_plural(tc.evidence_count, 'evidence')}, "
            f"{_plural(tc.edge_count, 'edge')} "
            f"(status: _{tc.status}_, "
            f"{_plural(len(tc.lesson_ids), 'lesson')})"
        )
        if tc.citations:
            rows.append(_render_citations(tc))
    return "\n".join(rows)


def _render_problematic(concepts: tuple[TeacherConcept, ...]) -> str:
    """Render the problematic concepts section."""
    if not concepts:
        return "_(no problematic concepts — students show no systematic struggle)_"
    rows: list[str] = []
    for i, tc in enumerate(concepts, 1):
        rows.append(
            f"{i}. **{tc.name}** — {_plural(tc.evidence_count, 'evidence')}"
        )
        if tc.citations:
            rows.append(_render_citations(tc))
    return "\n".join(rows)


def _render_progression(
    progression: tuple[ConceptProgression, ...],
) -> str:
    """Render the status progression section."""
    if not progression:
        return "_(no cross-concept progression data — only 1 lesson)_"
    rows: list[str] = []
    for prog in progression:
        seq = " → ".join(
            f"_{s}_ ({', '.join(prog.lesson_sequence)})"
            for s in prog.status_sequence
        )
        rows.append(f"- **{prog.name}**: {seq}")
    return "\n".join(rows)


def _render_prerequisites(
    chains: tuple[PrerequisiteChain, ...],
) -> str:
    """Render the prerequisite chains section."""
    if not chains:
        return "_(no prerequisite chains extracted)_"
    rows: list[str] = []
    for chain in chains:
        prereqs = ", ".join(f"`{p}`" for p in chain.prerequisites)
        rows.append(
            f"- **{chain.concept}** requires: {prereqs}"
        )
    return "\n".join(rows)


def render_teacher_book(book: TeacherBook) -> str:
    """Render a ``TeacherBook`` as a structured markdown document.

    Args:
        book: The TeacherBook to render.

    Returns:
        Complete markdown string with title, metadata, all sections,
        and a grounding footer.
    """
    lines: list[str] = []

    # --- Title ---
    lines.append(f"# Teacher Book: {book.teacher_id}")
    lines.append("")

    # --- Metadata block ---
    lines.append("> **Metadata**")
    lines.append(f"> - Teacher: `{book.teacher_id}`")
    lines.append(f"> - Total concepts: {book.total_concepts}")
    lines.append(f"> - Total lessons: {book.total_lessons}")
    lines.append(f"> - Total edges: {book.total_edges}")
    lines.append(f"> - Total evidence (citations): {book.total_evidence}")
    lines.append("")

    # --- Overview ---
    lines.append("## Overview")
    lines.append("")
    lines.append(
        f"The teacher's aggregated graph contains "
        f"**{book.total_concepts}** concepts across "
        f"**{book.total_lessons}** lesson(s), connected by "
        f"**{book.total_edges}** edges and supported by "
        f"**{book.total_evidence}** evidence items (grounded citations)."
    )
    lines.append("")

    # --- Fundamental concepts ---
    lines.append("## Fundamental Concepts")
    lines.append("")
    lines.append(
        "Concepts ranked by evidence count (pedagogical emphasis), "
        "with grounded citations."
    )
    lines.append("")
    lines.append(_render_fundamental(book.fundamental_concepts))
    lines.append("")

    # --- Problematic concepts ---
    lines.append("## Problematic Concepts")
    lines.append("")
    lines.append("Concepts where students systematically struggle.")
    lines.append("")
    lines.append(_render_problematic(book.problematic_concepts))
    lines.append("")

    # --- Status progression ---
    lines.append("## Status Progression")
    lines.append("")
    lines.append(
        "How each concept's status evolves across lessons "
        "(introduced → reinforced → reviewed → mastered)."
    )
    lines.append("")
    lines.append(_render_progression(book.progression))
    lines.append("")

    # --- Prerequisite chains ---
    lines.append("## Prerequisite Chains")
    lines.append("")
    lines.append(
        "Dependencies between concepts extracted from the graph "
        "(`depends_on` edges and capsule-declared prerequisites)."
    )
    lines.append("")
    lines.append(_render_prerequisites(book.prerequisites))
    lines.append("")

    # --- Grounding footer ---
    lines.append("---")
    lines.append("")
    lines.append(
        f"_Generated by LessonOS — ZERO-LLM, fully grounded. "
        f"Total evidence: {book.total_evidence} citations from "
        f"{book.total_lessons} lesson(s)._"
    )

    return "\n".join(lines)


def render_comparative_report(
    books: dict[str, TeacherBook],
) -> str:
    """Render a comparative report across multiple teachers.

    Args:
        books: Mapping of ``teacher_id → TeacherBook``.

    Returns:
        Markdown comparative table with all teachers and their metrics.
    """
    lines: list[str] = []

    lines.append("# Comparative TeacherBook Report")
    lines.append("")
    lines.append(
        "Comparative analysis of all 10 simulated teachers. Metrics reflect "
        "the aggregated graph structure and pedagogical emphasis per teacher."
    )
    lines.append("")

    # --- Summary table ---
    headers = [
        "Teacher",
        "Concepts",
        "Edges",
        "Evidence",
        "Lessons",
        "Problematic",
        "Prereqs",
    ]
    separators = ["---"] * len(headers)

    rows: list[list[str]] = []
    for tid, book in sorted(books.items()):
        rows.append([
            tid.replace("prof_", ""),
            str(book.total_concepts),
            str(book.total_edges),
            str(book.total_evidence),
            str(book.total_lessons),
            str(len(book.problematic_concepts)),
            str(len(book.prerequisites)),
        ])

    # Build markdown table
    def _table_row(cells: list[str]) -> str:
        return "| " + " | ".join(cells) + " |"

    lines.append(_table_row(headers))
    lines.append(_table_row(separators))
    for row in rows:
        lines.append(_table_row(row))
    lines.append("")

    # --- Per-teacher quick stats ---
    lines.append("## Per-Teacher Highlights")
    lines.append("")
    for tid, book in sorted(books.items()):
        label = tid.replace("prof_", "")
        lines.append(f"### {label}")
        lines.append("")
        lines.append(
            f"- **{book.total_concepts}** concepts, **{book.total_edges}** edges, "
            f"**{book.total_evidence}** evidence items"
        )
        if book.fundamental_concepts:
            top3 = [tc.name for tc in book.fundamental_concepts[:3]]
            lines.append(f"- Top concepts: {', '.join(f'`{c}`' for c in top3)}")
        if book.problematic_concepts:
            probs = [tc.name for tc in book.problematic_concepts]
            lines.append(
                f"- Problematic ({len(book.problematic_concepts)}): "
                f"{', '.join(f'`{c}`' for c in probs)}"
            )
        lines.append(f"- Prerequisite chains: {len(book.prerequisites)}")
        if book.prerequisites:
            top_prereq = sorted(
                book.prerequisites,
                key=lambda c: len(c.prerequisites),
                reverse=True,
            )[:3]
            for chain in top_prereq:
                prereqs = ", ".join(f"`{p}`" for p in chain.prerequisites)
                lines.append(f"  - `{chain.concept}` → {prereqs}")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append(
        "_Generated by LessonOS — ZERO-LLM, fully grounded. "
        f"Total teachers: {len(books)}._"
    )

    return "\n".join(lines)
