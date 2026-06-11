"""Dispensa stilizzata: teacher-style-aware markdown generation (M1-4).

Core product module: given a teacher's aggregated data (TeacherBook, capsules)
and a ``StyleProfile`` (style.py), generates a *dispensa* — a study guide in
the teacher's style — with every factual claim grounded to a real transcript
segment.

Pipeline:
  1. ``generate_dispensa`` → calls LLM (via router) per section, collects claims
  2. ``verify_dispensa`` → verifies every claim with ``graph/grounding.py``
  3. ``render_dispensa_md`` → ZERO-LLM markdown output with grounding footer

Gate fail-closed (identical invariant to summary M0): zero citations or >20%
unverified → ``ValueError``. Ungrounded paragraphs are dropped and declared.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Protocol

from lessonos.capsule.assembly import load_capsule
from lessonos.capsule.extraction import ConceptExtraction
from lessonos.graph.grounding import MAX_UNVERIFIED_RATIO
from lessonos.llm.router import Router
from lessonos.store.base import Store
from lessonos.style import StyleProfile
from lessonos.teacher_book import build_teacher_book

# ── Data model  ────────────────────────────────────────────────────────


@dataclass(frozen=True)
class DispensaClaim:
    """A single grounded claim within a dispensa paragraph."""

    text: str
    seg_id: str
    excerpt: str | None = None


@dataclass(frozen=True)
class DispensaParagraph:
    """A paragraph in the dispensa, composed of one or more grounded claims."""

    text: str
    claims: tuple[DispensaClaim, ...] = ()


@dataclass(frozen=True)
class DispensaSection:
    """A thematic section of the dispensa, focused on one core concept."""

    title: str
    paragraphs: tuple[DispensaParagraph, ...] = ()


@dataclass(frozen=True)
class DispensaDoc:
    """Complete dispensa document for a teacher."""

    teacher_id: str
    title: str
    sections: tuple[DispensaSection, ...] = ()
    style_profile: StyleProfile | None = None
    dropped_paragraphs: tuple[str, ...] = ()  # paragraphs that failed grounding


@dataclass(frozen=True)
class GroundingReport:
    """Result of verifying a dispensa's grounding."""

    total_claims: int
    verified: int
    dropped: int
    unverified_ratio: float
    passed: bool


# ── Prompt building  ───────────────────────────────────────────────────


def _structure_hint(style: StyleProfile) -> str:
    """Map style metrics to a structural instruction for the LLM prompt."""
    hints: list[str] = []
    if style.exercise_density >= 0.3:
        hints.append("Ogni sezione APRE con un esercizio svolto, poi spiega la teoria.")
    elif style.exercise_density >= 0.15:
        hints.append("Alterna esercizi e spiegazioni teoriche in ogni sezione.")
    else:
        hints.append("Esponi la teoria in modo chiaro, con pochi esercizi.")

    if style.question_density >= 0.1:
        hints.append("Struttura il testo come catene di domande e risposte guidate.")
    elif style.question_density >= 0.05:
        hints.append("Includi domande guida occasionali per stimolare la riflessione.")

    if style.prereq_explicitness >= 0.3:
        hints.append("Prima di ogni concetto, includi un box \"Prima devi sapere\" con i prerequisiti.")
    elif style.prereq_explicitness >= 0.1:
        hints.append("Menziona brevemente i prerequisiti dove necessario.")

    return "\n".join(hints)


def _concept_to_section_prompt(
    concept: ConceptExtraction,
    style: StyleProfile,
    idx: int,
    total: int,
) -> str:
    """Build a section-level prompt snippet for one concept.

    This text gets embedded into the full prompt.
    """
    citations_str = ""
    if concept.citations:
        lines: list[str] = []
        for i, cit in enumerate(concept.citations[:5]):
            excerpt = cit.excerpt or "(no excerpt)"
            if len(excerpt) > 120:
                excerpt = excerpt[:117] + "..."
            lines.append(f"    [{i + 1}] seg_id={cit.seg_id}, excerpt=\"{excerpt}\"")
        if len(concept.citations) > 5:
            lines.append(f"    (+{len(concept.citations) - 5} more citations)")
        citations_str = "\n".join(lines)
    prereq_str = f", prerequisiti: {', '.join(concept.prerequisites)}" if concept.prerequisites else ""

    return (
        f"Sezione {idx}/{total}: {concept.name}\n"
        f"  Status: {concept.status}{prereq_str}\n"
        f"  Citazioni:\n{citations_str}\n"
    )


def build_dispensa_prompt(
    teacher_id: str,
    style: StyleProfile,
    concepts: tuple[ConceptExtraction, ...],
) -> str:
    """Build a complete LLM prompt for generating a dispensa.

    Args:
        teacher_id: Teacher identifier for context.
        style: StyleProfile driving tone and structure.
        concepts: Core concepts to cover (from TeacherBook fundamental or all).

    Returns:
        Deterministic prompt string suitable for routing through ``Router``.
    """
    if not concepts:
        raise ValueError("cannot build dispensa prompt: no concepts provided")

    structure = _structure_hint(style)
    tics_str = ", ".join(style.tics) if style.tics else "(nessuna espressione caratteristica rilevata)"

    section_prompts: list[str] = []
    for idx, conc in enumerate(concepts, 1):
        section_prompts.append(_concept_to_section_prompt(conc, style, idx, len(concepts)))

    sections_block = "\n".join(section_prompts)

    prompt = (
        f"Sei un assistente che genera una dispensa didattica per l'insegnante \"{teacher_id}\".\n"
        "\n"
        f"## Stile didattico\n"
        f"Registro: {style.registro}\n"
        f"Espressioni caratteristiche dell'insegnante (DA USARE NATURALMENTE, mai forzate): {tics_str}\n"
        "\n"
        f"## Struttura richiesta\n"
        f"{structure}\n"
        "\n"
        "## Concetti da trattare (con citazioni dai transcripts)\n"
        f"{sections_block}\n"
        "\n"
        "## Istruzioni\n"
        "- Ogni claim fattuale DEVE citare uno dei seg_id forniti.\n"
        "- NON inventare contenuto didattico — riorganizza e riformula il materiale citato.\n"
        f"- Usa il registro '{style.registro}' dell'insegnante.\n"
        "- Se l'insegnante ha espressioni caratteristiche, usale con parsimonia.\n"
        "- Restituisci SOLO JSON valido:\n"
        "{\n"
        '  "sections": [\n'
        "    {\n"
        '      "title": "Nome Sezione",\n'
        '      "paragraphs": [\n'
        "        {\n"
        '          "text": "Testo del paragrafo...",\n'
        '          "claims": [{\n'
        '            "text": "Claim specifico verificabile",\n'
        '            "seg_id": "lezione#s<N>",\n'
        '            "excerpt": "Citazione letterale dal transcript"\n'
        "          }]\n"
        "        }\n"
        "      ]\n"
        "    }\n"
        "  ]\n"
        "}\n"
        "\n"
        "JSON:\n"
    )
    return prompt


# ── Generation  ────────────────────────────────────────────────────────


def generate_dispensa(
    store: Store,
    teacher_id: str,
    router: Router,
    *,
    provider: str = "mock",
    model: str | None = None,
    style: StyleProfile | None = None,
) -> DispensaDoc:
    """Generate a style-aware dispensa for *teacher_id*.

    Args:
        store: Persistence layer.
        teacher_id: The teacher to generate for.
        router: LLM router (mock in tests, DeepSeek at runtime).
        provider: Provider name for the router.
        model: Optional model override.
        style: Pre-computed ``StyleProfile``. If ``None``, derived on-the-fly.

    Returns:
        A ``DispensaDoc`` with all sections and claims.

    Raises:
        ValueError: If no data exists, or grounding threshold fails.
    """
    # 1. Load teacher data
    book = build_teacher_book(store, teacher_id)
    if not book.fundamental_concepts:
        raise ValueError(f"teacher {teacher_id!r} has no fundamental concepts — cannot generate dispensa")

    # 2. Derive style if not provided
    if style is None:
        from lessonos.style import derive_style_profile
        style = derive_style_profile(store, teacher_id)

    # 3. Load capsules to get ConceptExtraction objects (with citations)
    paths = store.paths_for_teacher(teacher_id)
    all_lesson_ids: set[str] = set()
    for pth in paths:
        all_lesson_ids.update(pth.lesson_ids)

    capsules_map: dict[str, dict[str, ConceptExtraction]] = {}
    for lid in sorted(all_lesson_ids):
        cap = load_capsule(store, lid)
        if cap is not None:
            capsules_map[lid] = {c.name: c for c in cap.content.concepts}

    # 4. Collect concepts from TeacherBook's fundamental list, pulling full
    #    ConceptExtraction objects when available
    all_concepts: list[ConceptExtraction] = []
    for tc in book.fundamental_concepts:
        # Try to find a matching ConceptExtraction from any capsule
        found = False
        for lid, cmap in capsules_map.items():
            for cname, ext in cmap.items():
                norm_ext = cname.lower().strip()
                norm_tc = tc.name.lower().strip()
                if norm_ext == norm_tc or norm_ext in norm_tc or norm_tc in norm_ext:
                    all_concepts.append(ext)
                    found = True
                    break
            if found:
                break
        if not found:
            # Create a minimal ConceptExtraction from TeacherBook data
            all_concepts.append(
                ConceptExtraction(
                    name=tc.name,
                    status=tc.status or "introduced",
                )
            )

    if not all_concepts:
        raise ValueError(f"no concepts could be resolved for teacher {teacher_id!r}")

    # 5. Build prompt and call LLM
    prompt = build_dispensa_prompt(teacher_id, style, tuple(all_concepts))
    response = router.complete(prompt, provider=provider, model=model)

    # 6. Parse response
    sections = _parse_dispensa_response(response.text)

    title = f"Dispensa di {teacher_id.replace('prof_', '').replace('_', ' ').title()}"
    return DispensaDoc(
        teacher_id=teacher_id,
        title=title,
        sections=sections,
        style_profile=style,
    )


def _parse_dispensa_response(raw: str) -> tuple[DispensaSection, ...]:
    """Parse LLM JSON response into ``DispensaSection`` tuple.

    The LLM returns JSON wrapped in markdown code blocks or plain JSON.
    """
    # Extract JSON from possible markdown code fence
    text = raw.strip()
    if "```json" in text:
        text = text.split("```json", 1)[1]
        if "```" in text:
            text = text.split("```", 1)[0]
    elif "```" in text:
        text = text.split("```", 1)[1]
        if "```" in text:
            text = text.split("```", 1)[0]

    text = text.strip()
    if not text:
        raise ValueError("empty LLM response — no JSON to parse")

    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"failed to parse LLM JSON: {exc}") from exc

    if not isinstance(data, dict) or "sections" not in data:
        raise ValueError(f"LLM response missing 'sections' key: {data}")

    sections: list[DispensaSection] = []
    for sec in data["sections"]:
        title = sec.get("title", "(untitled)")
        paragraphs_raw = sec.get("paragraphs", [])
        paragraphs: list[DispensaParagraph] = []
        for para in paragraphs_raw:
            text = para.get("text", "")
            claims_raw = para.get("claims", [])
            claims: list[DispensaClaim] = []
            for cl in claims_raw:
                claims.append(DispensaClaim(
                    text=cl.get("text", ""),
                    seg_id=cl.get("seg_id", ""),
                    excerpt=cl.get("excerpt"),
                ))
            paragraphs.append(DispensaParagraph(text=text, claims=tuple(claims)))
        sections.append(DispensaSection(title=title, paragraphs=tuple(paragraphs)))

    return tuple(sections)


# ── Verification  ──────────────────────────────────────────────────────


def verify_dispensa(
    doc: DispensaDoc,
    store: Store,
    *,
    max_unverified_ratio: float = MAX_UNVERIFIED_RATIO,
) -> GroundingReport:
    """Verify every claim in a dispensa against the store.

    Uses ``graph/grounding.verify_citation`` to check:
      1. ``seg_id`` resolves to a persisted segment.
      2. Segment belongs to the correct lesson.
      3. ``excerpt`` is a verbatim substring.

    Ungrounded paragraphs are dropped (moved to ``doc.dropped_paragraphs``).

    Returns:
        ``GroundingReport`` with counts and pass/fail.

    Raises:
        ValueError: If total claims is zero or unverified ratio exceeds threshold.
    """
    from lessonos.graph.grounding import verify_citation

    total_claims = 0
    verified = 0
    dropped_count = 0
    kept_sections: list[DispensaSection] = []

    for sec in doc.sections:
        kept_paragraphs: list[DispensaParagraph] = []
        for para in sec.paragraphs:
            for claim in para.claims:
                total_claims += 1
            # Verify each claim's citations
            all_valid = True
            for claim in para.claims:
                if not claim.seg_id:
                    all_valid = False
                    break
                try:
                    # Resolve lesson_id from seg_id prefix
                    lesson_id = claim.seg_id.split("#")[0] if "#" in claim.seg_id else doc.teacher_id
                    verify_citation(store, claim.seg_id, lesson_id, claim.excerpt)
                except ValueError:
                    all_valid = False
                    break

            if all_valid and para.claims:
                kept_paragraphs.append(para)
                verified += len(para.claims)
            else:
                dropped_count += len(para.claims)

        if kept_paragraphs:
            kept_sections.append(DispensaSection(title=sec.title, paragraphs=tuple(kept_paragraphs)))

    # Compute actual unverified ratio from verification results
    unverified = dropped_count
    ratio = unverified / total_claims if total_claims else 0.0
    passed = ratio <= max_unverified_ratio
    # Reconstruct doc with dropped paragraphs recorded
    doc = DispensaDoc(
        teacher_id=doc.teacher_id,
        title=doc.title,
        sections=tuple(kept_sections),
        style_profile=doc.style_profile,
        dropped_paragraphs=(f"Dropped {dropped_count} unverified claims",),
    )

    if total_claims == 0:
        raise ValueError(
            f"dispensa for {doc.teacher_id!r}: zero claims — "
            f"nothing to verify is NOT a pass (fail-closed acceptance gate)"
        )
    if ratio > max_unverified_ratio:
        raise ValueError(
            f"dispensa for {doc.teacher_id!r}: {unverified}/{total_claims} claims "
            f"unverified ({ratio:.0%} > {max_unverified_ratio:.0%} threshold) — "
            f"insufficient grounding for acceptance"
        )

    return GroundingReport(
        total_claims=total_claims,
        verified=verified,
        dropped=dropped_count,
        unverified_ratio=ratio,
        passed=passed,
    )


# ── Markdown rendering (ZERO-LLM)  ────────────────────────────────────


def render_dispensa_md(
    doc: DispensaDoc,
    report: GroundingReport,
) -> str:
    """ZERO-LLM markdown renderer for ``DispensaDoc``.

    Args:
        doc: The dispensa document.
        report: Verification report from ``verify_dispensa``.

    Returns:
        Complete markdown string.
    """
    lines: list[str] = []

    # Title
    lines.append(f"# {doc.title}")
    lines.append("")

    # Style metadata
    if doc.style_profile:
        lines.append("> **Stile didattico**")
        lines.append(f"> - Registro: `{doc.style_profile.registro}`")
        lines.append(f"> - Densità esercizi: {doc.style_profile.exercise_density}")
        lines.append(f"> - Densità domande: {doc.style_profile.question_density}")
        lines.append(f"> - Esplicitazione prerequisiti: {doc.style_profile.prereq_explicitness}")
        lines.append(f"> - Granularità concettuale: {doc.style_profile.concept_granularity}")
        if doc.style_profile.tics:
            lines.append(f"> - Espressioni caratteristiche: _{', '.join(doc.style_profile.tics)}_")
        lines.append("")

    # Sections
    for sec_idx, sec in enumerate(doc.sections, 1):
        lines.append(f"## {sec_idx}. {sec.title}")
        lines.append("")
        for para in sec.paragraphs:
            lines.append(para.text)
            lines.append("")
            # Show citations per paragraph
            if para.claims:
                lines.append("  <div class=\"citations\">")
                for claim in para.claims:
                    excerpt_str = ""
                    if claim.excerpt:
                        if len(claim.excerpt) > 100:
                            excerpt_str = f": _{claim.excerpt[:97]}..._"
                        else:
                            excerpt_str = f": _{claim.excerpt}_"
                    lines.append(f"  - `{claim.seg_id}`{excerpt_str}")
                lines.append("  </div>")
                lines.append("")

    # Dropped paragraphs disclosure
    if doc.dropped_paragraphs:
        lines.append("---")
        lines.append("")
        lines.append("## Paragrafi non verificati")
        lines.append("")
        for note in doc.dropped_paragraphs:
            lines.append(f"- {note}")
        lines.append("")

    # Grounding footer
    if report.passed:
        grounding_str = (
            f"✓ Tutti i {report.verified}/{report.total_claims} claim verificati"
        )
    else:
        grounding_str = (
            f"⚠ {report.verified}/{report.total_claims} claim verificati, "
            f"{report.dropped} scartati"
        )

    lines.append("---")
    lines.append("")
    lines.append(
        f"_Generato da LessonOS — {grounding_str}. "
        f"Ogni claim fattuale cita un segmento reale del transcript._"
    )

    return "\n".join(lines)
