"""Obsidian Vault Export — read-only projection of derived/ (M1-7, OBSIDIAN-FIT.md §2).

Produces an Obsidian vault from the real lesson DB (nodes/edges/evidence/segments)
and the existing derived markdowns (wiki, dispense, teacher_book).

ZERO LLM, ZERO modifications to the core engine: only reads from ``derived/`` and
the SQLite store. The vault lives inside ``derived/`` and is fully regenerable.

Mapping (OBSIDIAN-FIT.md §2):
- concept -> concetti/<slug>.md  (YAML frontmatter + body)
- prerequisite (depends_on/explains edge) -> wikilink in ## Prerequisiti section
- evidence -> trascrizioni/<lesson>.md  (^seg-<id> block anchor)
- wiki/dispense/teacher_book -> copied with exact-match wikilink-ification
- README.md: anti-edit warning
- Optional --canvas: JSON Canvas 1.0 graph overview

M2-5 (badge nel vault):
- dispensa pages get per-claim verification badges (``\u2705``/``\u2717``) via
  ``_add_dispensa_badges()`` — post-processes citation lines using
  ``claim_badge()`` from graph/grounding.py.
- teacher_book markdown is generated ZERO-LLM inside the export via
  ``render_teacher_book()`` (already badge-ated by M2-3 code).
"""

from __future__ import annotations

import json
import os
import re
import shutil
import unicodedata
from pathlib import Path
from typing import Any

from lessonos.graph.aggregator import aggregate_teacher_graph
from lessonos.graph.grounding import claim_badge
from lessonos.models.entities import (
    AggregatedPathNode,
    GraphEdge,
    GraphEvidence,
)
from lessonos.store.base import Store


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _slug(label: str) -> str:
    """Produce a filesystem-safe slug from a concept label.

    Lowercased, non-alphanumeric replaced with hyphens, multiple hyphens collapsed.
    """
    s = label.lower().strip()
    s = re.sub(r"[^a-z0-9\xe0\xe8\xe9\xec\xf2\xf9\s]+", "-", s)
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"-{2,}", "-", s)
    s = s.strip("-")
    return s if s else "unnamed"


def _parse_seg_id(seg_id: str) -> tuple[str, str]:
    """Split ``seg_id`` (e.g. ``prima_lezione#s3``) into ``(lesson_id, seg_number)``."""
    if "#s" not in seg_id:
        return seg_id, ""
    lesson_id, s_part = seg_id.rsplit("#s", 1)
    return lesson_id, s_part


def _load_global_resolution(derived_root: Path, teacher_id: str) -> dict | None:
    """Load the global resolution JSON for *teacher_id*."""
    path = derived_root / "global_resolution" / f"{teacher_id}.json"
    if not path.exists():
        return None
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def _build_canonical_set(resolution: dict | None) -> set[str]:
    """Extract the set of canonical concept names from a global resolution dict."""
    if not resolution:
        return set()
    entries = resolution.get("entries", [])
    if not isinstance(entries, list):
        return set()
    return {e["canonical"].strip().lower() for e in entries if isinstance(e, dict) and e.get("canonical")}


def _wikilinkify(text: str, canonicals: set[str]) -> str:
    """Replace exact word-boundary matches of canonical names with Obsidian wikilinks.

    Only exact-case-insensitive word-boundary matches are replaced. No fuzzy matching.
    Skip matches that are already inside ``[[`` ... ``]]`` to prevent double-wrapping.
    Longest canonical first.
    """
    if not canonicals:
        return text
    sorted_cans = sorted(canonicals, key=len, reverse=True)
    for canonical in sorted_cans:
        escaped = re.escape(canonical)
        pattern = re.compile(
            rf"(?<!\[)\b{escaped}\b(?!\])",
            re.IGNORECASE,
        )
        text = pattern.sub(f"[[{canonical}]]", text)
    return text


def _build_frontmatter_yaml(data: dict[str, Any]) -> str:
    """Build a minimal YAML string from a dict (no PyYAML dependency)."""
    lines: list[str] = []
    for key, value in data.items():
        if isinstance(value, bool):
            lines.append(f"{key}: {'true' if value else 'false'}")
        elif isinstance(value, (int, float)):
            lines.append(f"{key}: {value}")
        elif isinstance(value, str):
            escaped = value.replace('"', '\\"')
            lines.append(f'{key}: "{escaped}"')
        elif isinstance(value, list):
            items = [f'  - "{item}"' if isinstance(item, str) else f"  - {item}" for item in value]
            lines.append(f"{key}:\n" + "\n".join(items))
        else:
            lines.append(f"{key}: {value}")
    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------------------
# Badge injection for dispensa pages (M2-5, ZERO LLM)
# ---------------------------------------------------------------------------

_CITATION_LINE_RE = re.compile(
    r"^(?P<prefix>\s*-\s*)(?:[\u2705\u2717\U0001f527])?`(?P<seg_id>[^`]+)`:?\s*(?:_(?P<excerpt>[^_]*)_)?\s*$"
)


def _add_dispensa_badges(vault_dispense_dir: Path) -> dict[str, int]:
    """Post-process dispensa markdown pages in the vault to add per-claim badges.

    Reads each ``.md`` file under *vault_dispense_dir*, finds lines within
    ``<div class="citations">`` blocks that match the citation format
    ``- `seg_id`: _excerpt_``, and prepends a ``claim_badge()`` badge
    (``\u2705`` verified / ``\u2717`` unverified). Runs ZERO LLM — badge is
    determined from excerpt presence alone (the dispensa source files were
    already verified at generation time; unverified claims were dropped).

    Returns:
        ``{"verified": int, "unverified": int}`` counts across all files.
    """
    verified = 0
    unverified = 0
    for md_file in sorted(vault_dispense_dir.rglob("*.md")):
        if not md_file.is_file():
            continue
        orig = md_file.read_text(encoding="utf-8")
        if '<div class="citations">' not in orig:
            continue
        lines = orig.splitlines(keepends=True)
        new_lines: list[str] = []
        in_citations = False
        for line in lines:
            stripped = line.strip()
            if stripped == '<div class="citations">':
                in_citations = True
                new_lines.append(line)
                continue
            if in_citations and stripped == "</div>":
                in_citations = False
                new_lines.append(line)
                continue
            if in_citations:
                m = _CITATION_LINE_RE.match(stripped)
                if m:
                    seg_id = m.group("seg_id")
                    excerpt = m.group("excerpt")
                    badge = claim_badge(excerpt)  # \u2705/\u2717  (no repaired flag in markdown)
                    # Simple approach: prepend badge after prefix
                    prefix = m.group("prefix")
                    rest = m.group(0)[len(prefix):]
                    # Remove any existing badge at start of rest
                    rest_clean = re.sub(r"^[\u2705\u2717\U0001f527]", "", rest).lstrip()
                    new_lines.append(f"{prefix}{badge}{rest_clean}\n")
                    if badge == "\u2705":
                        verified += 1
                    else:
                        unverified += 1
                    continue
                # Line inside citations but doesn't match — preserve as-is
                new_lines.append(line)
                continue
            new_lines.append(line)
        new_text = "".join(new_lines)
        if new_text != orig:
            md_file.write_text(new_text, encoding="utf-8")
    return {"verified": verified, "unverified": unverified}


# ---------------------------------------------------------------------------
# Teacher Book markdown generation (M2-5, ZERO LLM)
# ---------------------------------------------------------------------------

def _write_teacher_book_md(
    store: Store,
    teacher_id: str,
    vault_teacher_book_dir: Path,
) -> dict[str, int]:
    """Generate teacher_book markdown from store data and write to vault.

    Uses ``render_teacher_book()`` (ZERO LLM, already badge-ated by M2-3)
    to produce structured markdown with per-evidence ``\u2705`` badges.

    Returns:
        ``{"teacher_book_concepts": int, "teacher_book_badges": int}``.
    """
    from lessonos.teacher_book import build_teacher_book
    from lessonos.teacher_book_renderer import render_teacher_book

    book = build_teacher_book(store, teacher_id)
    md = render_teacher_book(book)
    vault_teacher_book_dir.mkdir(parents=True, exist_ok=True)
    out_path = vault_teacher_book_dir / f"{teacher_id}.md"
    out_path.write_text(md, encoding="utf-8")

    # Count badges in the generated markdown
    badge_count = len(re.findall(r"[\u2705\u2717\U0001f527]", md))
    return {
        "teacher_book_concepts": len(book.fundamental_concepts) + len(book.problematic_concepts),
        "teacher_book_badges": badge_count,
    }


# ---------------------------------------------------------------------------
# Core export function
# ---------------------------------------------------------------------------

def export_vault(
    store: Store,
    teacher_id: str,
    output_dir: str,
    derived_root: str | None = None,
    canvas: bool = False,
) -> dict[str, Any]:
    """Export an Obsidian vault (read-only projection) for *teacher_id*.

    Parameters
    ----------
    store:
        An open ``Store`` (SQLiteStore) pointing to the real lesson DB.
    teacher_id:
        Teacher identifier (e.g. ``andrea``). Used to look up the global
        resolution file and to identify teacher-scoped paths.
    output_dir:
        Where to write the vault directory. Recreated from scratch each run.
    derived_root:
        Root of the ``derived/`` tree (default: inferred from ``output_dir``).
    canvas:
        If True, also generate a JSON Canvas 1.0 file (``grafo-prerequisiti.canvas``).

    Returns
    -------
    dict with keys:
        - concepts (int), lessons (int), edges (int),
          wiki_files (int), dispense_files (int), canvas (bool),
          dispensa_badges_verified (int), dispensa_badges_unverified (int),
          teacher_book_concepts (int), teacher_book_badges (int)
    """
    # ---- Resolve paths ----
    if not output_dir:
        raise ValueError("output_dir must be a non-empty path")
    output = Path(output_dir)

    if derived_root is None:
        candidate = output.parent.parent  # .../derived/vault/ -> .../derived/
        if candidate.name == "derived":
            derived = candidate
        else:
            derived = Path.cwd() / "derived"
    else:
        derived = Path(derived_root)

    if output.exists():
        # Safety guard (retro-review MAJOR): never rmtree paths that could
        # destroy raw/ user data — refuse to delete root, derived/, raw/,
        # or any path at or above these (resolves symlinks/relatives).
        out_str = str(Path(output).resolve(strict=False))
        derived_resolved = derived.resolve(strict=False)
        derived_str = str(derived_resolved)
        cwd_str = str(Path.cwd().resolve())
        home_str = str(Path.home().resolve(strict=False))

        # Case-insensitive filesystems exist on every platform (APFS
        # default, NTFS/SMB/FUSE mounts on Linux): compare casefolded
        # everywhere so RAW/Raw aliases cannot bypass the guard. APFS is
        # also Unicode-normalization-insensitive: NFD "università" opens
        # the same dir as NFC, so normalize to NFC before folding. False
        # positives only make the guard stricter (refuse to delete),
        # never destructive.
        def _fold(p: str) -> str:
            return unicodedata.normalize("NFC", p).casefold()

        # Block when deleting output would take derived/ down with it:
        # output == derived/ or output is an ANCESTOR of derived/.
        # Output INSIDE derived/ (documented layout, e.g. derived/vault/<t>)
        # is the normal case and must stay deletable for re-export.
        if os.path.commonpath([_fold(out_str), _fold(derived_str)]) == _fold(out_str):
            raise ValueError(
                f"refusing to rmtree {out_str}: would destroy "
                f"or overwrite derived/ tree"
            )
        # raw/ is a SIBLING of derived/ in the real data layout
        # (~/maestro-data/<corpus>/{raw,derived}). Block any overlap:
        # output equal to, inside, or an ancestor of raw/. Consider raw
        # next to BOTH the resolved and the as-given derived parent (a
        # symlinked derived/ must not hide the real raw/), and resolve
        # each candidate (raw/ itself may be a symlink to real data).
        raw_candidates = {
            str((derived_resolved.parent / "raw").resolve(strict=False)),
            str((derived.parent / "raw").resolve(strict=False)),
        }
        for raw_str in raw_candidates:
            if os.path.commonpath([_fold(out_str), _fold(raw_str)]) in (
                _fold(out_str), _fold(raw_str),
            ):
                raise ValueError(
                    f"refusing to rmtree {out_str}: would destroy "
                    f"or overwrite raw/ data"
                )
        # Block exact match for root, cwd, home
        if _fold(out_str) in {_fold("/"), _fold(cwd_str), _fold(home_str)}:
            raise ValueError(
                f"refusing to rmtree {out_str}: protected path"
            )
        shutil.rmtree(output)
    output.mkdir(parents=True, exist_ok=True)

    # ---- Load global resolution for wikilink-ification ----
    resolution = _load_global_resolution(derived, teacher_id)
    canonicals = _build_canonical_set(resolution)

    # ---- 1. Load teacher's aggregated graph ----
    paths = store.paths_for_teacher(teacher_id)
    teacher_lesson_ids: set[str] = set()
    for p in paths:
        teacher_lesson_ids.update(p.lesson_ids)

    agg = aggregate_teacher_graph(store, teacher_id)

    # Build indexed structures
    concept_map: dict[str, AggregatedPathNode] = {}
    for node in agg.merged_nodes:
        concept_map[node.node_id] = node

    # Use the aggregator's authoritative raw->merged mapping (M1-7b fix).
    # This maps EVERY raw node id (e.g. ``l2:concept:0``) to its merged
    # ``path:...`` node id, not just the first occurrence.
    raw_to_merged: dict[str, str] = agg.raw_to_merged

    # Edges by source — only concept-to-concept relationships
    prereq_types = {"depends_on", "explains"}
    edges_by_source: dict[str, list[GraphEdge]] = {}
    for edge in agg.existing_edges:
        if edge.edge_type not in prereq_types:
            continue
        src = raw_to_merged.get(edge.source)
        tgt = raw_to_merged.get(edge.target)
        if src and tgt:
            edges_by_source.setdefault(src, []).append(edge)

    # Build dependency semantics map (M1-7b fix: correct depends_on direction).
    # For each concept (merged_id), which other concepts are its prerequisites
    # and which depend on it?
    # - ``depends_on`` (A → B): A depends on B → B is prereq of A
    #   → A's prereqs include B; A appears in Utilizzato da of B
    # - ``explains`` (A → B): A explains B → A is prereq of B
    #   → B's prereqs include A; B appears in Utilizzato da of A
    prereq_of: dict[str, set[str]] = {}      # concept_id → set of prereq merged_ids
    used_by: dict[str, set[str]] = {}         # concept_id → set of dependent merged_ids

    for src_merged, edge_list in edges_by_source.items():
        for edge in edge_list:
            tgt_merged = raw_to_merged.get(edge.target, edge.target)
            if edge.edge_type == "depends_on":
                # A depends_on B: B is prereq of A, A is used_by of B
                prereq_of.setdefault(src_merged, set()).add(tgt_merged)
                used_by.setdefault(tgt_merged, set()).add(src_merged)
            elif edge.edge_type == "explains":
                # A explains B: A is prereq of B, B is used_by of A
                prereq_of.setdefault(tgt_merged, set()).add(src_merged)
                used_by.setdefault(src_merged, set()).add(tgt_merged)

    # Evidence indexed by edge_id
    evidence_by_edge: dict[str, list[GraphEvidence]] = {}
    for ev in agg.path_evidence:
        evidence_by_edge.setdefault(ev.edge_id, []).append(ev)

    # ---- 2. Write concetti/<slug>.md for each concept ----
    concepts_dir = output / "concetti"
    concepts_dir.mkdir(parents=True, exist_ok=True)

    for node_id, node in concept_map.items():
        label = node.label
        slug = _slug(label)

        # Prerequisites (merged IDs) from the dependency map
        prereq_ids: set[str] = prereq_of.get(node_id, set())

        # Dependent concepts (merged IDs)
        dependent_ids: set[str] = used_by.get(node_id, set())

        # Evidence for edges connected to this concept
        # Match edges by their resolved merged source/target
        concept_evidence: list[GraphEvidence] = []
        for edge in agg.existing_edges:
            if edge.edge_type not in prereq_types:
                continue
            edge_src = raw_to_merged.get(edge.source)
            edge_tgt = raw_to_merged.get(edge.target)
            if (edge_src == node_id or edge_tgt == node_id):
                concept_evidence.extend(evidence_by_edge.get(edge.edge_id, []))

        # Build frontmatter
        frontmatter = {
            "concept_id": node_id,
            "teacher": teacher_id,
            "lesson_ids": list(node.lesson_ids),
            "status": node.status,
            "evidence_count": node.evidence_count,
            "provenance": "lessonos",
            "generated_by": "lessonos",
            "regenerable": True,
        }

        # Build body
        body_parts: list[str] = []

        # Prerequisites section
        if prereq_ids:
            body_parts.append("## Prerequisiti\n")
            for pid in prereq_ids:
                if pid in concept_map:
                    body_parts.append(f"- [[{concept_map[pid].label}]]")
                else:
                    body_parts.append(f"- `{pid}` (concetto non trovato)")
            body_parts.append("")

        # Dependent concepts
        if dependent_ids:
            body_parts.append("## Utilizzato da\n")
            for did in dependent_ids:
                if did in concept_map:
                    body_parts.append(f"- [[{concept_map[did].label}]]")
            body_parts.append("")

        # Evidence section
        if concept_evidence:
            body_parts.append("## Evidenze\n")
            seen = set()
            for ev in concept_evidence:
                key = ev.seg_id
                if key in seen:
                    continue
                seen.add(key)
                seg_lesson, seg_num = _parse_seg_id(ev.seg_id)
                if seg_lesson not in teacher_lesson_ids:
                    seg_lesson = ev.lesson_id if ev.lesson_id in teacher_lesson_ids else seg_lesson
                block_ref = f"[[trascrizioni/{seg_lesson}#^{ev.seg_id.replace('#', '-')}]]"
                excerpt = ev.excerpt.strip() if ev.excerpt and ev.excerpt.strip() else "(nessun excerpt)"
                body_parts.append(f"- {excerpt} — {block_ref}")
            body_parts.append("")

        # Status
        body_parts.append("---\n*Stato: " + node.status + "*\n")

        # Assemble markdown
        fm_yaml = _build_frontmatter_yaml(frontmatter)
        content = f"---\n{fm_yaml}---\n\n# {label}\n\n" + "\n".join(body_parts) + "\n"
        concept_path = concepts_dir / f"{slug}.md"
        concept_path.write_text(content, encoding="utf-8")

    # ---- 3. Write trascrizioni/<lesson>.md for each lesson ----
    trascrizioni_dir = output / "trascrizioni"
    trascrizioni_dir.mkdir(parents=True, exist_ok=True)

    for lesson_id in sorted(teacher_lesson_ids):
        segs = store.segments_for_lesson(lesson_id)
        body_lines: list[str] = []
        for seg in segs:
            block_id = seg.seg_id.replace("#", "-")
            body_lines.append(f"{seg.text}\n^{block_id}\n")

        content = (
            f"---\nlesson_id: \"{lesson_id}\"\ngenerated_by: lessonos\nregenerable: true\n---\n\n"
            f"# {lesson_id}\n\n" + "\n".join(body_lines) + "\n"
        )
        lesson_path = trascrizioni_dir / f"{lesson_id}.md"
        lesson_path.write_text(content, encoding="utf-8")

    # ---- 4. Copy derived files with wikilink-ification ----
    _copy_derived_with_wikilinks(derived / "wiki", output / "wiki", canonicals)
    _copy_derived_with_wikilinks(derived / "dispense", output / "dispense", canonicals)
    _copy_derived_with_wikilinks(derived / "teacher_book", output / "teacher_book", canonicals)

    # ---- 4b. Write teacher_book markdown (ZERO LLM, badge-ated by M2-3) ----
    tb_stats = _write_teacher_book_md(store, teacher_id, output / "teacher_book")

    # ---- 4c. Add badges to dispensa pages (M2-5, ZERO LLM) ----
    badge_stats = {"verified": 0, "unverified": 0}
    if (output / "dispense").exists():
        badge_stats = _add_dispensa_badges(output / "dispense")

    # ---- 5. Write README.md ----
    readme = (
        "# MAESTRO — Vault generato dal motore\n\n"
        "Questo vault e una **proiezione read-only** del database del motore LessonOS.\n\n"
        "## Avviso: Non modificare i file qui\n\n"
        "- Le modifiche vengono **perse alla rigenerazione**.\n"
        "- Ogni file ha frontmatter con `regenerable: true`.\n"
        "- Per modificare contenuti, agisci sul **database del motore** (`derived/db/`)\n"
        "  e rigenera il vault.\n\n"
        "## Struttura\n\n"
        "- `concetti/` — schede concetto con link a prerequisiti ed evidenze\n"
        "- `trascrizioni/` — trascrizioni delle lezioni con blocchi `^seg-` citabili\n"
        "- `wiki/` — riepiloghi lezione\n"
        "- `dispense/` — dispense stilizzate\n"
        "- `teacher_book/` — libri del docente\n\n"
        "## Come esplorare\n\n"
        "1. Apri questo vault in **Obsidian** (`Apri vault` -> `Aggiungi cartella esistente`)\n"
        "2. Abilita `Graph View` per vedere le relazioni tra concetti\n"
        "3. Clicca sulle citazioni `[[trascrizioni/...]]` per saltare al blocco verbatim\n"
    )
    (output / "README.md").write_text(readme, encoding="utf-8")

    # ---- 6. Optional: JSON Canvas 1.0 ----
    canvas_generated = False
    if canvas:
        canvas_generated = True
        _write_canvas(output, concept_map, edges_by_source, raw_to_merged)

    # ---- Summary ----
    wiki_count = len(list((output / "wiki").rglob("*.md"))) if (output / "wiki").exists() else 0
    dispense_count = len(list((output / "dispense").rglob("*.md"))) if (output / "dispense").exists() else 0
    return {
        "concepts": len(concept_map),
        "lessons": len(teacher_lesson_ids),
        "edges": sum(len(v) for v in edges_by_source.values()),
        "wiki_files": wiki_count,
        "dispense_files": dispense_count,
        "canvas": canvas_generated,
        "dispensa_badges_verified": badge_stats["verified"],
        "dispensa_badges_unverified": badge_stats["unverified"],
        "teacher_book_concepts": tb_stats["teacher_book_concepts"],
        "teacher_book_badges": tb_stats["teacher_book_badges"],
    }


# ---------------------------------------------------------------------------
# Canvas
# ---------------------------------------------------------------------------

def _write_canvas(
    output: Path,
    concept_map: dict[str, AggregatedPathNode],
    edges_by_source: dict[str, list[GraphEdge]],
    raw_to_merged: dict[str, str],
) -> None:
    """Write a JSON Canvas 1.0 file representing the concept graph."""
    canvas_nodes: list[dict] = []
    canvas_edges: list[dict] = []

    for node_id, node in concept_map.items():
        slug = _slug(node.label)
        canvas_nodes.append({
            "id": node_id,
            "type": "file",
            "file": f"concetti/{slug}.md",
            "label": node.label,
        })

    for source, edge_list in edges_by_source.items():
        for edge in edge_list:
            from_id = raw_to_merged.get(edge.source, edge.source)
            to_id = raw_to_merged.get(edge.target, edge.target)
            if from_id not in concept_map or to_id not in concept_map:
                continue
            label = "spiega" if edge.edge_type == "explains" else "prerequisito"
            canvas_edges.append({
                "id": edge.edge_id,
                "fromNode": from_id,
                "fromSide": "bottom",
                "toNode": to_id,
                "toSide": "top",
                "label": label,
            })

    canvas = {"nodes": canvas_nodes, "edges": canvas_edges}
    (output / "grafo-prerequisiti.canvas").write_text(
        json.dumps(canvas, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _copy_derived_with_wikilinks(src: Path, dst: Path, canonicals: set[str]) -> None:
    """Copy a derived directory tree and wikilink-ify markdown files."""
    if not src.exists():
        return
    shutil.copytree(src, dst, dirs_exist_ok=True)
    for md_file in dst.rglob("*.md"):
        if md_file.is_file():
            orig_text = md_file.read_text(encoding="utf-8")
            linked_text = _wikilinkify(orig_text, canonicals)
            if linked_text != orig_text:
                md_file.write_text(linked_text, encoding="utf-8")
