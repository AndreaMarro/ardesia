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
        lines.append(f"  - `({ev.lesson_id}) {ev.seg_id}`: _{excerpt}_")
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
        if len(prog.status_sequence) == len(prog.lesson_sequence):
            seq = " → ".join(
                f"_{s}_ ({l})"
                for s, l in zip(prog.status_sequence, prog.lesson_sequence)
            )
        else:
            # Fallback: lengths differ — group all lessons per status
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


_STYLE_LABELS: dict[str, str] = {
    "pratico": "**Practical / Example-Driven** — prioritises real-world examples, "
    "high evidence density per concept, extensive prerequisite chains.",
    "socratico": "**Socratic / Question-Driven** — builds deep dependency "
    "structures, high prerequisite count, moderate evidence per concept.",
    "rigoroso": "**Rigorous / Formal** — balanced structure, moderate evidence "
    "density, clear prerequisite chains, formal concept organisation.",
}


def _compute_evidence_density(book: TeacherBook) -> float:
    """Compute evidence per concept ratio (pedagogical density)."""
    if book.total_concepts == 0:
        return 0.0
    return round(book.total_evidence / book.total_concepts, 2)


def _compute_prerequisite_breadth(book: TeacherBook) -> float:
    """Compute average prerequisites per chain (dependency depth)."""
    if not book.prerequisites:
        return 0.0
    depths = [len(c.prerequisites) for c in book.prerequisites]
    return round(sum(depths) / len(depths), 2)


def render_qualitative_diff(
    books: dict[str, TeacherBook],
    focus_ids: tuple[str, ...] = ("prof_pratico", "prof_socratico", "prof_rigoroso"),
) -> str:
    """Render a qualitative diff between 3 opposite teaching styles.

    Compares pedagogical structure, evidence density, prerequisite
    complexity, and fundamental concept emphasis across the selected
    teachers. ZERO-LLM, fully grounded.

    Args:
        books: Mapping of ``teacher_id → TeacherBook``.
        focus_ids: Three teacher IDs to compare (default: opposite styles).

    Returns:
        Markdown document with per-style characterisation, comparison
        tables, and qualitative takeaways.
    """
    lines: list[str] = []
    short_names: list[str] = [t.replace("prof_", "") for t in focus_ids]
    teacher_count = len(short_names)

    # --- Title ---
    lines.append("# Qualitative Style Diff")
    lines.append("")
    if teacher_count == 1:
        title_line = f"Pedagogical analysis of **{short_names[0]}**."
    elif teacher_count == 2:
        title_line = (
            f"Comparative analysis of pedagogical structure across "
            f"**{short_names[0]}** and **{short_names[1]}** "
            "— two teaching styles."
        )
    elif teacher_count >= 3:
        joined = "**, **".join(short_names[:3])
        extra = f" and {teacher_count - 3} more" if teacher_count > 3 else ""
        title_line = (
            f"Comparative analysis of pedagogical structure across "
            f"**{joined}**{extra} "
            f"— {'three' if teacher_count == 3 else 'multiple'} opposite teaching styles."
        )
    else:
        title_line = "_(no teachers to compare)_"
    lines.append(title_line)
    lines.append("")
    lines.append(
        "Metrics are computed from the aggregated graph structure "
        "(ZERO-LLM, fully grounded). All citations preserved with provenance."
    )
    lines.append("")

    # --- Per-style characterisation ---
    lines.append("## Per-Style Characterisation")
    lines.append("")
    for tid in focus_ids:
        book = books.get(tid)
        if book is None:
            continue
        label = tid.replace("prof_", "")
        char = _STYLE_LABELS.get(label, f"**{label}** — (no predefined characterisation).")
        lines.append(f"### {char}")
        lines.append("")
        lines.append(
            f"- **{book.total_concepts}** concepts, **{book.total_edges}** edges, "
            f"**{book.total_evidence}** evidence, "
            f"**{len(book.prerequisites)}** prerequisite chains."
        )
        density = _compute_evidence_density(book)
        depth = _compute_prerequisite_breadth(book)
        lines.append(f"- Evidence density: **{density}** evidence/concept.")
        lines.append(f"- Prerequisite depth: **{depth}** prerequisites/chain (avg).")
        # Top-3 fundamental concepts
        if book.fundamental_concepts:
            top3 = [tc.name for tc in book.fundamental_concepts[:3]]
            lines.append(
                f"- Emphasises: {', '.join(f'`{c}`' for c in top3)}"
            )
        if book.problematic_concepts:
            lines.append(
                f"- Features **{len(book.problematic_concepts)}** problematic "
                f"concept(s) — students systematically struggle here."
            )
        lines.append("")

    # --- Comparative metrics table (3-column) ---
    lines.append("## Comparative Metrics")
    lines.append("")
    lines.append("| Metric | " + " | ".join(f"**{s}**" for s in short_names) + " |")
    lines.append("| --- | " + " | ".join("---" for _ in short_names) + " |")

    metrics: list[tuple[str, list[str]]] = [
        ("Concepts", []),
        ("Edges", []),
        ("Evidence", []),
        ("Evidence/Concept", []),
        ("Prerequisite Chains", []),
        ("Prereqs/Chain (avg)", []),
        ("Problematic", []),
    ]
    for tid in focus_ids:
        book = books.get(tid)
        if book is None:
            for row in metrics:
                row[1].append("—")
            continue
        metrics[0][1].append(str(book.total_concepts))
        metrics[1][1].append(str(book.total_edges))
        metrics[2][1].append(str(book.total_evidence))
        metrics[3][1].append(str(_compute_evidence_density(book)))
        metrics[4][1].append(str(len(book.prerequisites)))
        metrics[5][1].append(str(_compute_prerequisite_breadth(book)))
        metrics[6][1].append(str(len(book.problematic_concepts)))

    for label, vals in metrics:
        lines.append("| " + label + " | " + " | ".join(vals) + " |")
    lines.append("")

    # --- Fundamental concepts comparison ---
    lines.append("## Fundamental Concepts Comparison")
    lines.append("")
    lines.append(
        "How each style ranks its most emphasised concepts "
        "(by evidence count / citations)."
    )
    lines.append("")
    for tid in focus_ids:
        book = books.get(tid)
        if book is None:
            continue
        label = tid.replace("prof_", "")
        lines.append(f"### {label}")
        lines.append("")
        if book.fundamental_concepts:
            for i, tc in enumerate(book.fundamental_concepts[:5], 1):
                lines.append(
                    f"{i}. **{tc.name}** — {tc.evidence_count} evidence, "
                    f"{tc.edge_count} edges (status: _{tc.status}_)"
                )
        else:
            lines.append("_(no fundamental concepts)_")
        lines.append("")

    # --- Prerequisite analysis ---
    lines.append("## Prerequisite Structure")
    lines.append("")
    lines.append(
        "How each style builds conceptual dependencies — breadth vs depth."
    )
    lines.append("")
    for tid in focus_ids:
        book = books.get(tid)
        if book is None:
            continue
        label = tid.replace("prof_", "")
        lines.append(f"### {label}")
        lines.append("")
        if book.prerequisites:
            lines.append(
                f"- **{len(book.prerequisites)}** prerequisite chains, "
                f"avg depth **{_compute_prerequisite_breadth(book)}**."
            )
            # Show the deepest chain
            deepest = sorted(
                book.prerequisites,
                key=lambda c: len(c.prerequisites),
                reverse=True,
            )[0]
            prereqs = ", ".join(f"`{p}`" for p in deepest.prerequisites)
            lines.append(f"- Deepest chain: `{deepest.concept}` requires {prereqs}")
        else:
            lines.append(
                "_(no prerequisite chains — concepts introduced "
                "independently)_"
            )
        lines.append("")

    # --- Qualitative takeaway ---
    lines.append("## Qualitative Takeaway")
    lines.append("")
    takeaways: dict[str, str] = {
        "pratico": (
            "The practical style emphasises evidence density "
            "(**{density}** evidence/concept). This teacher provides "
            "many examples and applications per concept, building "
            "understanding through concrete cases rather than formal "
            "definitions. High prerequisite count (**{prereqs_chain}** chains) "
            "suggests structured dependency scaffolding."
        ),
        "socratico": (
            "The Socratic style builds deep prerequisite structures "
            "(**{prereqs_chain}** chains, avg depth **{depth}**). "
            "Evidence density is moderate (**{density}** evidence/concept) — "
            "the emphasis is on connecting concepts through dependency "
            "chains and guided questioning rather than exhaustive examples."
        ),
        "rigoroso": (
            "The rigorous style balances formal structure with moderate "
            "evidence density (**{density}** evidence/concept, "
            "**{prereqs_chain}** prerequisite chains). "
            "Concepts are organised cleanly with clear dependency "
            "relationships. This style is suitable for courses where "
            "mathematical precision and formal definitions are paramount."
        ),
    }
    for tid in focus_ids:
        book = books.get(tid)
        if book is None:
            continue
        label = tid.replace("prof_", "")
        t = takeaways.get(label)
        if t is None:
            continue
        lines.append(
            t.format(
                density=_compute_evidence_density(book),
                prereqs_chain=len(book.prerequisites),
                depth=_compute_prerequisite_breadth(book),
            )
        )
        lines.append("")

    # --- Footer ---
    # Count teachers that actually have data
    present_count = sum(1 for tid in focus_ids if tid in books)
    lines.append("---")
    lines.append("")
    lines.append(
        "_Generated by LessonOS — ZERO-LLM, fully grounded. "
        f"Compared {present_count} teachers._"
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
