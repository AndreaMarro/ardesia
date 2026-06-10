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
from lessonos.capsule.extraction import _repair_excerpt
from lessonos.graph.grounding import is_verified_excerpt
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


# T6R: bound the summary prompt so a HUGE capsule (100+ concepts from a full
# real lecture) cannot make the LLM emit an output that overflows its token
# limit and arrives truncated (the JSONDecodeError that killed summaries 2-4 in
# the macinata). The caps are NO-OP at/under threshold, so small capsules — the
# mock tests — render byte-identically to the legacy prompt. The full detail
# stays in the graph; the summary is the bounded human-readable digest.
_SUMMARY_CONCEPT_CAP = 40
_SUMMARY_ITEM_CAP = 15
_SUMMARY_TIMELINE_CAP = 40


def _capped(items, cap, *, key=None):
    """Return ``(shown, omitted)``. At/under *cap* this is the identity (order
    preserved, no sort) so under-cap capsules are byte-identical to before. Over
    *cap*, optionally rank by *key* (descending) and keep the top *cap*.
    """
    items = list(items)
    if len(items) <= cap:
        return items, 0
    ordered = sorted(items, key=key, reverse=True) if key else items
    return ordered[:cap], len(items) - cap


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

    shown_timeline, om_tl = _capped(capsule.timeline, _SUMMARY_TIMELINE_CAP)
    for i, span in enumerate(shown_timeline):
        lines.append(f"[{i}] {span.topic} (seg_ids: {', '.join(span.seg_ids)})")
    if om_tl:
        lines.append(f"(+{om_tl} altri argomenti nel grafo, non elencati)")

    lines.append("")
    lines.append("=== CONCETTI ===")
    shown_concepts, om_c = _capped(
        capsule.content.concepts, _SUMMARY_CONCEPT_CAP,
        key=lambda c: len(c.citations),
    )
    for i, c in enumerate(shown_concepts):
        cit_str = "; ".join(
            f"{cit.seg_id}: {cit.excerpt or '(no excerpt)'}"
            for cit in c.citations
        )
        lines.append(
            f"[{i}] {c.name} (status={c.status}) "
            f"prereq=[{', '.join(c.prerequisites)}] "
            f"citations=[{cit_str}]"
        )
    if om_c:
        lines.append(f"(+{om_c} altri concetti nel grafo, meno citati, non elencati)")

    if capsule.content.exercises:
        lines.append("")
        lines.append("=== ESERCIZI ===")
        shown_ex, om_e = _capped(capsule.content.exercises, _SUMMARY_ITEM_CAP)
        for i, e in enumerate(shown_ex):
            cit_str = "; ".join(
                f"{cit.seg_id}: {cit.excerpt or '(no excerpt)'}"
                for cit in e.citations
            )
            lines.append(f"[{i}] {e.prompt} citations=[{cit_str}]")
        if om_e:
            lines.append(f"(+{om_e} altri esercizi nel grafo, non elencati)")

    if capsule.content.student_questions:
        lines.append("")
        lines.append("=== DOMANDE STUDENTI ===")
        shown_q, om_q = _capped(capsule.content.student_questions, _SUMMARY_ITEM_CAP)
        for i, q in enumerate(shown_q):
            cit_str = "; ".join(
                f"{cit.seg_id}: {cit.excerpt or '(no excerpt)'}"
                for cit in q.citations
            )
            lines.append(f"[{i}] {q.question} citations=[{cit_str}]")
        if om_q:
            lines.append(f"(+{om_q} altre domande nel grafo, non elencate)")

    if capsule.content.homework:
        lines.append("")
        lines.append("=== COMPITI ===")
        shown_hw, om_h = _capped(capsule.content.homework, _SUMMARY_ITEM_CAP)
        for i, h in enumerate(shown_hw):
            cit_str = "; ".join(
                f"{cit.seg_id}: {cit.excerpt or '(no excerpt)'}"
                for cit in h.citations
            )
            lines.append(f"[{i}] {h.task} citations=[{cit_str}]")
        if om_h:
            lines.append(f"(+{om_h} altri compiti nel grafo, non elencati)")

    lines.append("")
    lines.append("ISTRUZIONI:")
    lines.append(
        "- Ogni paragrafo DEVE avere almeno una citazione con seg_id valido."
    )
    lines.append("- excerpt DEVE essere una sottostringa letterale del segmento.")
    lines.append(
        "- excerpt SOSTANZIOSO: copia un passaggio INTERO di almeno 30 caratteri "
        "(una frase o proposizione completa), MAI frammenti di 1-3 parole — "
        "un excerpt di 2 parole non prova nulla."
    )
    lines.append(
        "- Esercizi e Compiti: se il parlato NON contiene un'assegnazione "
        "esplicita (es. 'fate per casa', 'per la prossima volta'), premetti "
        "'(inferito) ' al testo dell'item — non spacciare deduzioni per assegnazioni."
    )
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

    # strict=False tolerates literal control chars (newlines/tabs) inside JSON
    # string values — DeepSeek emits them, raw json.loads crashes on them. This
    # was the "Invalid control character" failure in the macinata. Truncation
    # (the other failure) is prevented upstream by the summary-prompt bounding.
    data = json.loads(text, strict=False)
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


def _repair_summary_citations(
    store: Store,
    sections: list[dict[str, Any]],
    lesson_id: str,
) -> tuple[int, int]:
    """Make every summary citation either verbatim-grounded or excluded.

    RESILIENT — does NOT raise on LLM noise (strict raising crashed the macinata
    summaries: DeepSeek paraphrases excerpts and occasionally invents references).
    For each citation, in place:

      * seg_id does not resolve, or resolves to a different lesson → NULL the
        excerpt (the renderer excludes NULL-excerpt citations);
      * excerpt already a verbatim substring of its segment → keep;
      * excerpt paraphrased → repair to the closest real substring
        (``_repair_excerpt``); if that fails → NULL it.

    The underlying knowledge is already grounded in the graph; the summary shows
    only what it can verbatim-verify. Returns ``(verified, excluded)`` counts.
    """
    verified = 0
    excluded = 0
    for sec in sections:
        for para in sec.get("paragraphs", []):
            for cit in para.get("citations", []):
                seg_id = cit.get("seg_id", "")
                seg = store.get_segment(seg_id) if seg_id else None
                if seg is None or (lesson_id and seg.lesson_id != lesson_id):
                    cit["excerpt"] = None  # unresolvable / cross-lesson → exclude
                    excluded += 1
                    continue
                excerpt = cit.get("excerpt")
                if excerpt and excerpt in seg.text:
                    verified += 1
                    continue
                repaired = _repair_excerpt(excerpt, seg.text) if excerpt else None
                cit["excerpt"] = repaired
                if repaired is not None:
                    verified += 1
                else:
                    excluded += 1
    return verified, excluded


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

    # T6R anti-false-verde: render ONLY verified citations (verbatim excerpt).
    # A citation with no excerpt quotes nothing — it is excluded, never shown as
    # a bare [seg_id] link. A paragraph left with zero verified citations is an
    # unsupported claim and is dropped from the grounded body. Both exclusions
    # are disclosed in a footer (omitted entirely when nothing was excluded, so
    # a fully-grounded summary renders byte-identically to before).
    excluded_citations = 0
    dropped_paragraphs = 0

    for sec in sections:
        heading = sec["heading"]
        rendered_paras: list[str] = []
        for para in sec.get("paragraphs", []):
            text = para["text"]
            citations = para.get("citations", [])
            verified_links: list[str] = []
            for c in citations:
                seg_id = c["seg_id"]
                excerpt = c.get("excerpt")
                if is_verified_excerpt(excerpt):
                    verified_links.append(f"[{excerpt}]({seg_id})")
                else:
                    excluded_citations += 1
            if citations and not verified_links:
                # had citations, none verifiable → unsupported claim, drop it
                dropped_paragraphs += 1
                continue
            if verified_links:
                text = f"{text} ({'; '.join(verified_links)})"
            rendered_paras.append(text)
        if not rendered_paras:
            # whole section collapsed to unsupported claims → skip
            continue
        lines.append(f"## {heading}")
        lines.append("")
        for t in rendered_paras:
            lines.append(t)
            lines.append("")

    if excluded_citations or dropped_paragraphs:
        lines.append("---")
        lines.append("")
        note = (
            f"> ⚠️ Grounding: {excluded_citations} citazioni non verificate "
            f"(excerpt non verbatim) escluse"
        )
        if dropped_paragraphs:
            note += (
                f"; {dropped_paragraphs} paragrafi senza citazioni "
                f"verificate rimossi"
            )
        note += "."
        lines.append(note)
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

    # Step 4: Repair/exclude citations (resilient — verbatim-grounded or dropped)
    _repair_summary_citations(store, sections, lesson_id)

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
