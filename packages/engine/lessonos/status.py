"""DB status report: query the store and produce a structured Markdown report.

ZERO-LLM, deterministic, read-only.  Used by ``lessonos status`` CLI.
"""

from __future__ import annotations

from lessonos.store.base import Store


def build_status_report(store: Store) -> str:
    """Query *store* and return a Markdown status report.

    The report covers paths, lessons, segments, graph nodes/edges/evidence,
    teachers, and cost-ledger entries.  Every figure is computed live from
    the store — no caching, no LLM calls.
    """
    lines: list[str] = []
    _section(lines, "LessonOS — DB Status Report")
    lines.append("")

    # --- Paths ---
    all_paths = store.all_paths()
    lines.append(f"- **Paths**: {len(all_paths)}")
    for p in all_paths:
        t = p.teacher_id or "(none)"
        lines.append(f"  - `{p.path_id}` ({p.title}) — teacher={t}, "
                      f"{len(p.lesson_ids)} lesson(s), {len(p.source_ids)} source(s)")
    lines.append("")

    # --- Lessons ---
    all_lessons = store.all_lessons()
    lines.append(f"- **Lessons**: {len(all_lessons)}")
    for lsn in all_lessons:
        segs = store.segments_for_lesson(lsn.lesson_id)
        nodes = store.get_graph_nodes_for_lesson(lsn.lesson_id)
        edges = store.get_graph_edges_for_lesson(lsn.lesson_id)
        evs = store.get_all_evidence_for_lesson(lsn.lesson_id)
        cap = store.get_capsule(lsn.lesson_id)
        cap_str = "yes" if cap is not None else "no"
        lines.append(
            f"  - `{lsn.lesson_id}` ({lsn.title}) — "
            f"{len(segs)} segs, {len(nodes)} nodes, {len(edges)} edges, "
            f"{len(evs)} evidence, capsule={cap_str}"
        )
    lines.append("")

    # --- Segments (total) ---
    total_segs = 0
    for lsn in all_lessons:
        total_segs += len(store.segments_for_lesson(lsn.lesson_id))
    lines.append(f"- **Total segments**: {total_segs}")
    lines.append("")

    # --- Graph (total) ---
    total_nodes = 0
    total_edges = 0
    total_evidence = 0
    for lsn in all_lessons:
        total_nodes += len(store.get_graph_nodes_for_lesson(lsn.lesson_id))
        total_edges += len(store.get_graph_edges_for_lesson(lsn.lesson_id))
        total_evidence += len(store.get_all_evidence_for_lesson(lsn.lesson_id))
    lines.append(f"- **Graph nodes**: {total_nodes}")
    lines.append(f"- **Graph edges**: {total_edges}")
    lines.append(f"- **Evidence**: {total_evidence}")
    lines.append("")

    # --- Teachers ---
    teachers: dict[str, int] = {}
    for p in all_paths:
        tid = p.teacher_id or "__no_teacher__"
        teachers[tid] = teachers.get(tid, 0) + 1
    lines.append(f"- **Teachers**: {len(teachers)}")
    for tid, cnt in sorted(teachers.items(), key=lambda x: x[0]):
        label = "(no teacher)" if tid == "__no_teacher__" else tid
        lines.append(f"  - `{label}` — {cnt} path(s)")
    lines.append("")

    # --- Cost ledger ---
    entries = store.get_ledger_entries()
    lines.append(f"- **Cost ledger entries**: {len(entries)}")
    total_usd = 0.0
    total_prompt = 0
    total_completion = 0
    if entries:
        total_usd = sum(e.cost_usd for e in entries)
        total_prompt = sum(e.prompt_tokens for e in entries)
        total_completion = sum(e.completion_tokens for e in entries)
        lines.append(f"  - Total cost: ${total_usd:.6f}")
        lines.append(f"  - Total prompt tokens: {total_prompt}")
        lines.append(f"  - Total completion tokens: {total_completion}")
    lines.append("")

    # --- Summary ---
    cap_count = sum(
        1 for lsn in all_lessons if store.get_capsule(lsn.lesson_id) is not None
    )
    lines.append("### Summary")
    lines.append(f"- **{len(all_paths)} path(s)**, **{len(all_lessons)} lesson(s)**, "
                 f"**{total_segs} segment(s)**")
    lines.append(f"- **{total_nodes} node(s)**, **{total_edges} edge(s)**, "
                 f"**{total_evidence} evidence**")
    lines.append(f"- **{len(teachers)} teacher(s)**, **{cap_count} capsule(s)**")
    lines.append(f"- **{len(entries)} ledger entry(ies)** (${_fmt(total_usd)})")
    if cap_count < len(all_lessons):
        lines.append(
            f"- ⚠️  {len(all_lessons) - cap_count} lesson(s) missing capsule"
        )
    lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _section(lines: list[str], title: str, char: str = "=") -> None:
    lines.append(title)
    lines.append(char * len(title))


def _fmt(usd: float) -> str:
    """Format a dollar amount compactly."""
    if usd < 0.001:
        return f"{usd:.6f}"
    if usd < 0.01:
        return f"{usd:.5f}"
    if usd < 1.0:
        return f"{usd:.4f}"
    return f"{usd:.2f}"
