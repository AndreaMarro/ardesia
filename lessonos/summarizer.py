"""Generate markdown lesson summaries from Lesson Capsules (T6 — Riepilogo-lezione).

The summarizer takes a grounded ``LessonCapsule`` (from the M2 pipeline), asks
an LLM (via the abstract router) to produce a structured summary, validates
every citation mechanically (each ``seg_id`` resolves, every ``excerpt`` is a
verbatim substring), and returns a ``SummaryPack`` — an in-memory mapping of
file path → markdown content, ready to write to disk.

The LLM response is parsed as structured JSON so citations remain machine-
verifiable. Validation reuses ``lessonos.graph.grounding.verify_citation``,
the same invariant that the GraphWriter uses (T5-FIX cross-lesson guard).

Usage::

    from lessonos.summarizer import generate_lesson_summary, SummaryPack

    pack = generate_lesson_summary(store, capsule, router)
    for path, content in pack.files.items():
        ...  # write to output_dir / path

Testing: provide a ``MockProvider`` with a fixed JSON response and assert
the **exact markdown output** byte-for-byte (anti-tautology guarantee —
Claude review directive 10:35).
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from typing import Any

from lessonos.capsule.assembly import LessonCapsule
from lessonos.graph.grounding import verify_citation
from lessonos.llm.router import Router
from lessonos.store.base import Store


@dataclass(frozen=True)
class SummaryPack:
    """In-memory summary output — no I/O until the caller decides to write.

    ``files`` maps relative file paths (e.g. ``"Prima_lezione.md"``) to their
    markdown content. Tests inspect this directly without touching disk.
    """

    files: dict[str, str] = field(default_factory=dict)
    """Relative path → markdown content."""


# ── Prompt builder ────────────────────────────────────────────────────

# Stable prompt key — used by MockProvider in tests.
# The prompt MUST be deterministic so MockProvider can fixture-key on it.


def _build_summary_prompt(capsule: LessonCapsule) -> str:
    """Build a deterministic summary-generation prompt from *capsule*.

    Returns a string that is AST-stable for the same capsule (used as the
    ``MockProvider`` fixture key in tests).
    """
    lines = [
        "Genera un riepilogo strutturato di questa lezione in formato JSON.",
        "Ogni claim fattuale DEVE avere almeno una citazione con seg_id (esatto, dal capsule).",
        "Usa SOLO i seg_id presenti nel capsule — non inventarne di nuovi.",
        "",
        "Formato JSON richiesto:",
        "{",
        '  "sections": [',
        "    {",
        '      "heading": "Titolo sezione",',
        '      "paragraphs": [',
        "        {",
        '          "text": "Testo del paragrafo con claim fattuali.",',
        '          "citations": [{"seg_id": "...", "excerpt": "..."}]',
        "        }",
        "      ]",
        "    }",
        "  ]",
        "}",
        "",
        "Sezioni richieste:",
        "- Panoramica dei temi (riassunto della timeline della lezione)",
        "- Concetti chiave (elenco concetti con stato e spiegazione, ogni concetto cita)",
        "- Esercizi (se presenti, con citazioni)",
        "- Domande degli studenti (se presenti, con citazioni)",
        "- Compiti (se presenti, con citazioni)",
        "",
        "Dati del capsule:",
        f"lesson_id: {capsule.lesson_id}",
        "",
        "=== TOPIC TIMELINE ===",
    ]

    for i, span in enumerate(capsule.timeline):
        lines.append(f"[{i}] {span.topic} (seg_ids: {', '.join(span.seg_ids)})")

    lines.append("")
    lines.append("=== CONCETTI ===")
    for i, c in enumerate(capsule.content.concepts):
        cit_str = "; ".join(
            f"{cit.seg_id}: {cit.excerpt or '(no excerpt)'}"
            for cit in c.citations
        )
        lines.append(
            f"[{i}] {c.name} (status={c.status}) "
            f"prereq=[{', '.join(c.prerequisites)}] "
            f"citations=[{cit_str}]"
        )

    if capsule.content.exercises:
        lines.append("")
        lines.append("=== ESERCIZI ===")
        for i, e in enumerate(capsule.content.exercises):
            cit_str = "; ".join(
                f"{cit.seg_id}: {cit.excerpt or '(no excerpt)'}"
                for cit in e.citations
            )
            lines.append(f"[{i}] {e.prompt} citations=[{cit_str}]")

    if capsule.content.student_questions:
        lines.append("")
        lines.append("=== DOMANDE STUDENTI ===")
        for i, q in enumerate(capsule.content.student_questions):
            cit_str = "; ".join(
                f"{cit.seg_id}: {cit.excerpt or '(no excerpt)'}"
                for cit in q.citations
            )
            lines.append(f"[{i}] {q.question} citations=[{cit_str}]")

    if capsule.content.homework:
        lines.append("")
        lines.append("=== COMPITI ===")
        for i, h in enumerate(capsule.content.homework):
            cit_str = "; ".join(
                f"{cit.seg_id}: {cit.excerpt or '(no excerpt)'}"
                for cit in h.citations
            )
            lines.append(f"[{i}] {h.task} citations=[{cit_str}]")

    lines.append("")
    lines.append("ISTRUZIONI:")
    lines.append(
        "- Ogni paragrafo DEVE avere almeno una citazione con seg_id valido."
    )
    lines.append("- excerpt DEVE essere una sottostringa letterale del segmento.")
    lines.append("- Usa SOLO i seg_id sopra elencati.")
    lines.append("- headings in italiano, markdown-friendly.")
    lines.append("- Restituisci SOLO il JSON, nessun altro testo.")

    return "\n".join(lines)


# ── Response parser ───────────────────────────────────────────────────


def _parse_summary_response(raw: str) -> list[dict[str, Any]]:
    """Parse the LLM JSON response into a list of section dicts.

    Each section has ``heading`` (str) and ``paragraphs`` (list of dicts
    with ``text`` and ``citations``).

    Raises ``ValueError`` on malformed JSON or missing section structure.
    """
    # Strip markdown code fences if present
    text = raw.strip()
    if text.startswith("```"):
        # Remove opening fence (possibly with language hint)
        first_nl = text.find("\n")
        if first_nl != -1:
            text = text[first_nl + 1 :]
        # Remove closing fence
        if text.endswith("```"):
            text = text[:-3].rstrip()
        elif "```" in text:
            text = text[: text.rindex("```")].rstrip()

    data = json.loads(text)
    sections = data.get("sections")
    if not isinstance(sections, list):
        raise ValueError(
            f"summary response missing 'sections' array: {raw!r}"
        )
    for sec in sections:
        if not isinstance(sec, dict) or "heading" not in sec:
            raise ValueError(
                f"summary section missing 'heading': {sec!r}"
            )
        if "paragraphs" not in sec or not isinstance(sec["paragraphs"], list):
            raise ValueError(
                f"summary section {sec.get('heading', '?')!r} missing "
                f"'paragraphs' array"
            )
        for para in sec["paragraphs"]:
            if "text" not in para:
                raise ValueError(
                    f"paragraph in section {sec['heading']!r} "
                    f"missing 'text': {para!r}"
                )
            if "citations" not in para or not isinstance(para["citations"], list):
                raise ValueError(
                    f"paragraph in section {sec['heading']!r} "
                    f"missing 'citations' array"
                )
    return sections


# ── Citation validation ───────────────────────────────────────────────


def _validate_summary_citations(
    store: Store,
    sections: list[dict[str, Any]],
    lesson_id: str,
) -> None:
    """Validate every citation in the summary sections.

    Each citation's ``seg_id`` must resolve to a persisted segment,
    belong to the same lesson, and every ``excerpt`` must be a verbatim
    substring (reuses ``verify_citation`` from graph/grounding.py).

    Raises ``ValueError`` on first violation.
    """
    for sec in sections:
        for para in sec.get("paragraphs", []):
            for cit in para.get("citations", []):
                seg_id = cit.get("seg_id", "")
                if not seg_id:
                    raise ValueError(
                        f"citation missing seg_id in section "
                        f"{sec['heading']!r}: {cit!r}"
                    )
                verify_citation(
                    store=store,
                    seg_id=seg_id,
                    excerpt=cit.get("excerpt"),
                    lesson_id=lesson_id,
                )


# ── Markdown renderer ────────────────────────────────────────────────


def _render_summary_markdown(
    capsule: LessonCapsule,
    sections: list[dict[str, Any]],
) -> str:
    """Render validated sections → markdown string."""
    lines: list[str] = []
    lines.append(f"# Riepilogo: {capsule.lesson_id}")
    lines.append("")

    # Brief header metadata
    lines.append(f"- **Lezione**: `{capsule.lesson_id}`")
    lines.append(f"- **Concetti**: {len(capsule.content.concepts)}")
    lines.append(f"- **Esercizi**: {len(capsule.content.exercises)}")
    lines.append(f"- **Domande**: {len(capsule.content.student_questions)}")
    lines.append(f"- **Compiti**: {len(capsule.content.homework)}")
    lines.append("")

    for sec in sections:
        heading = sec["heading"]
        lines.append(f"## {heading}")
        lines.append("")
        for para in sec.get("paragraphs", []):
            text = para["text"]
            citations = para.get("citations", [])
            # Append inline citations
            if citations:
                cite_links = []
                for c in citations:
                    seg_id = c["seg_id"]
                    excerpt = c.get("excerpt", "")
                    if excerpt:
                        cite_links.append(f"[{excerpt}]({seg_id})")
                    else:
                        cite_links.append(f"[{seg_id}]")
                text = f"{text} ({'; '.join(cite_links)})"
            lines.append(text)
            lines.append("")

    return "\n".join(lines)


# ── Public API ────────────────────────────────────────────────────────


def generate_lesson_summary(
    store: Store,
    capsule: LessonCapsule,
    router: Router,
    *,
    output_dir: str = "",
    provider: str,
    model: str | None = None,
) -> SummaryPack:
    """Generate a structured markdown lesson summary from a Lesson Capsule.

    Steps:
    1. Build a deterministic summary prompt from the capsule.
    2. Call the LLM router (mockable in tests).
    3. Parse the JSON response into sections with paragraphs + citations.
    4. **Validate every citation** mechanically (seg_id resolves, excerpt is
       verbatim substring, same-lesson guard).
    5. Render as markdown and return a ``SummaryPack``.

    When ``output_dir`` is non-empty, the pack is automatically written to
    ``<output_dir>/<lesson_id>.md``. Use empty ``output_dir`` (default) for
    tests — inspect ``pack.files`` in memory.

    Args:
        store: Persistence layer with ``get_segment``.
        capsule: The grounded Lesson Capsule to summarise.
        router: LLM router (use ``MockProvider`` for tests).
        output_dir: If set, write ``<lesson_id>.md`` to this directory.
        provider: Router provider name. Default ``"mock"``.
        model: Optional model override.

    Returns:
        ``SummaryPack`` with ``files[rel_path] = markdown_content``.

    Raises:
        ValueError: If the LLM response is malformed or any citation fails
            grounding verification.
    """
    lesson_id = capsule.lesson_id

    # Step 1: Build deterministic prompt
    prompt = _build_summary_prompt(capsule)

    # Step 2: Call router
    response = router.complete(prompt, provider=provider, model=model)

    # Step 3: Parse JSON
    sections = _parse_summary_response(response.text)

    # Step 4: Validate every citation mechanically
    _validate_summary_citations(store, sections, lesson_id)

    # Step 5: Render markdown
    markdown = _render_summary_markdown(capsule, sections)

    file_name = f"{lesson_id}.md"
    pack = SummaryPack(files={file_name: markdown})

    # Write to disk if output_dir specified
    if output_dir:
        out_path = os.path.join(output_dir, file_name)
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "w") as f:
            f.write(markdown)

    return pack
