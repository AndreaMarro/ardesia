"""Extract concepts/exercises/questions/homework from a lesson (PLAN §16.1, §26.1).

Second step of the Lesson Capsule pipeline: given the persisted segments, extract
the lesson content (concepts, exercises, student_questions, homework). The router
is abstract (mock in tests). All citations MUST point at existing segment IDs —
the LLM cites, but we validate against persisted segments (PLAN §13.4).
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from difflib import SequenceMatcher

from lessonos.capsule.parsing import extract_json
from lessonos.llm.router import Router
from lessonos.models import CONCEPT_STATUS
from lessonos.store.base import Store


# Negation guard shared by tier 2 & 3
def _negation_preserved(original: str, repaired: str) -> bool:
    """Return False if a negation token from *original* is absent in *repaired*."""
    orig_lower = original.lower()
    repaired_lower = repaired.lower()
    for token in _NEGATION_TOKENS:
        if token in orig_lower and token not in repaired_lower:
            return False
    return True

# Italian negation tokens — stripping any would flip the meaning of the claim
_NEGATION_TOKENS: frozenset[str] = frozenset({
    "non", "mai", "né", "nessun", "nessuna", "nessuno",
    "senza", "no", "neppure", "neanche", "nemmeno",
    "nulla", "niente",
})

def _repair_excerpt(excerpt: str, segment_text: str) -> str | None:
    """Try to locate the closest substring of ``segment_text`` matching ``excerpt``.

    Strategy (3-tier):
      1. If excerpt is already a verbatim substring → return excerpt as-is.
      2. Longest common substring via ``difflib.SequenceMatcher.find_longest_match``
         — requires match length >= max(8, 40% of excerpt length) to avoid
         accidental short matches like 3-char 'uan' from 'quantum'.
      3. Word-by-word greedy scan: try to find the longest prefix of excerpt words
         that still appears in segment_text; if at least 1 word matches, return the
         matched span.

    Negation guard (tier 2 & 3): if the original excerpt contains Italian negation
    tokens (non, mai, né, nessun, senza, no, neppure, neanche, nemmeno, nulla,
    niente) and the repaired match no longer carries them, the repair is rejected
    (returns ``None``). This prevents an LLM false positive like "non è lineare"
    being repaired to "è lineare" (semantic inversion).

    Returns the repaired substring or ``None`` if no meaningful match is found.
    """
    if not excerpt or not segment_text:
        return None

    # Tier 1 — verbatim substring
    if excerpt in segment_text:
        return excerpt

    # Negation guard shared by tier 2 & 3
    def _negation_preserved(original: str, repaired: str) -> bool:
        """Return False if a negation token from *original* is absent in *repaired*."""
        orig_lower = original.lower()
        repaired_lower = repaired.lower()
        for token in _NEGATION_TOKENS:
            if token in orig_lower and token not in repaired_lower:
                return False
        return True

    # Tier 2 — longest common substring
    matcher = SequenceMatcher(None, excerpt, segment_text)
    match = matcher.find_longest_match(
        0, len(excerpt), 0, len(segment_text)
    )
    # Require match to be at least 40% of excerpt length OR at least 8 chars
    # to avoid accidental 3-char matches like 'uan' from 'quantum'
    if match.size >= max(8, int(len(excerpt) * 0.4)):
        candidate = segment_text[match.b : match.b + match.size]
        if not _negation_preserved(excerpt, candidate):
            return None
        return candidate

    # Tier 3 — word-by-word greedy scan (case-insensitive)
    excerpt_lower = excerpt.lower()
    seg_lower = segment_text.lower()
    words = excerpt_lower.split()
    # Find the longest prefix of words that appears consecutively in segment_text
    best_end = 0
    for i in range(len(words), 0, -1):
        candidate = " ".join(words[:i])
        # Bug-hunt #3: match a CONFINE di parola — 'la' non deve matchare
        # dentro 'della' (re.escape: il testo excerpt e' input non fidato).
        if re.search(r"(?<!\w)" + re.escape(candidate) + r"(?!\w)", seg_lower):
            best_end = i
            break  # Found longest match
    if best_end > 0:
        matched_lower = " ".join(words[:best_end])
        # Bug-hunt #3, regola probatoria: la riparazione vale solo se
        # (a) copre >=60% delle parole dell'excerpt ORIGINALE (caso tipico:
        #     puro case-mismatch, 'rapporto incrementale' -> verbatim reale), o
        # (b) e' sostanziosa di suo (>=3 parole e >=15 char).
        # Minimo assoluto 6 char: un frammento piu corto non prova niente.
        # Senza questi floor un excerpt ALLUCINATO si riduceva a 1 parolina
        # e il gate anti-falso-verde la contava VERIFIED.
        coverage = best_end / len(words)
        substantial = best_end >= 3 and len(matched_lower) >= 15
        if len(matched_lower) < 6 or (coverage < 0.6 and not substantial):
            return None
        idx_m = re.search(
            r"(?<!\w)" + re.escape(matched_lower) + r"(?!\w)", seg_lower
        )
        idx = idx_m.start()
        tier3_result = segment_text[idx : idx + len(matched_lower)]
        # Negation guard: if the repaired span dropped a negation, reject
        if not _negation_preserved(excerpt, tier3_result):
            return None
        return tier3_result

    return None


@dataclass(frozen=True)
class Citation:
    """A grounded citation pointing at a transcript segment (PLAN §13.4).

    ``seg_id`` must resolve to a persisted Segment for the lesson. ``excerpt``
    is the snippet being cited (optional, for readability). ``confidence`` is
    the model's self-assessed certainty (0.0–1.0, optional).

    ``excerpt_repaired`` is ``True`` when the original excerpt from the LLM was
    paraphrased and has been auto-repaired or dropped by the excerpt guard.
    """

    seg_id: str
    excerpt: str | None = None
    confidence: float | None = None
    excerpt_repaired: bool = False


@dataclass(frozen=True)
class ConceptExtraction:
    """A concept extracted from a lesson (PLAN §26.1 concepts array).

    ``canonical`` (M1-1b) is a short normalised concept name for cross-lesson
    deduplication, assigned by the LLM at extraction time (e.g. ``'segnale'``
    for both ``'Definizione di segnale'`` and ``'Il segnale come grandezza
    fisica'``). When empty (``''``) — e.g. old persisted capsules — the
    aggregator falls back to the normalised ``name``.
    """

    name: str
    status: str  # ∈ CONCEPT_STATUS
    canonical: str = ''
    prerequisites: tuple[str, ...] = ()
    citations: tuple[Citation, ...] = ()

    def __post_init__(self) -> None:
        if self.status not in CONCEPT_STATUS:
            raise ValueError(
                f"invalid concept status: {self.status!r} "
                f"(expected one of {sorted(CONCEPT_STATUS)}"
            )


@dataclass(frozen=True)
class ExerciseExtraction:
    """An exercise extracted from a lesson (PLAN §26.1)."""

    prompt: str
    solution: str | None = None
    citations: tuple[Citation, ...] = ()


@dataclass(frozen=True)
class QuestionExtraction:
    """A student question extracted from a lesson (PLAN §26.1 student_questions)."""

    question: str
    citations: tuple[Citation, ...] = ()


@dataclass(frozen=True)
class HomeworkExtraction:
    """A homework assignment extracted from a lesson (PLAN §26.1)."""

    task: str
    citations: tuple[Citation, ...] = ()


@dataclass(frozen=True)
class LessonContent:
    """Extracted lesson content (PLAN §26.1 Lesson Capsule components).

    All citations MUST be grounded: each ``Citation.seg_id`` must resolve to a
    persisted Segment for the lesson. Non-existent seg_ids raise ValueError.
    """

    lesson_id: str
    concepts: tuple[ConceptExtraction, ...] = ()
    exercises: tuple[ExerciseExtraction, ...] = ()
    student_questions: tuple[QuestionExtraction, ...] = ()
    homework: tuple[HomeworkExtraction, ...] = ()


def _window(segments, size: int):
    """Split *segments* into consecutive windows of at most *size* items.

    A non-positive *size* — or a lesson at/under the window — yields a SINGLE
    window equal to the full list, so short lessons run exactly as the
    pre-batching one-shot path (backward-compatible and mock-keyable). Long
    lessons (the real lectures: 1351–3446 segments) are split so the prompt
    never overflows the model context window (T6R batching).
    """
    if size <= 0 or len(segments) <= size:
        return [list(segments)]
    return [segments[i : i + size] for i in range(0, len(segments), size)]


def build_extraction_prompt(segments) -> str:
    """Deterministic prompt for content extraction (stable -> mock-keyable)."""
    lines = [
        "Estrai il contenuto della lezione: concetti, esercizi, domande, compiti.",
        'Restituisci JSON con: {"concepts": [...], "exercises": [...], "student_questions": [...], "homework": [...]}.',
        "",
        "Concepts: [{name, canonical, status, prerequisites?, citations}].",
        f"status in {sorted(CONCEPT_STATUS)}.",
        "",
        "Exercises: [{prompt, solution?, citations}].",
        "student_questions: [{question, citations}].",
        "homework: [{task, citations}].",
        "",
        "citations: [{seg_id, excerpt, confidence?}].",
        "canonical: nome BREVE normalizzato per deduplicazione cross-lezione",
        "(es. 'segnale' invece di 'definizione di segnale' o",
        "'il segnale come grandezza fisica'). Stabile tra lezioni: stesso",
        "concetto con nomi diversi deve avere lo STESSO canonical.",
        "OGNI citazione DEVE avere excerpt = testo VERBATIM copiato-incollato dal",
        "segmento citato (NON parafrasato, NON riassunto): una sottostringa",
        "letterale del testo del segmento. Senza excerpt verbatim la citazione",
        "viene scartata.",
        "Usa SOLO i seg_id elencati; non inventarne.",
        "",
        "Segmenti:",
    ]
    for seg in segments:
        lines.append(f"[{seg.seg_id}] {seg.text}")
    return "\n".join(lines)


def extract_lesson_content(
    store: Store,
    lesson_id: str,
    router: Router,
    *,
    provider: str = "mock",
    model: str | None = None,
    defensive: bool = False,
    dropped: list[str] | None = None,
    window_size: int = 100,
) -> LessonContent:
    """Extract concepts/exercises/questions/homework from persisted segments.

    Reads the segments from the store (they must be ingested first), asks the
    router to extract content, then validates every ``Citation.seg_id`` against
    persisted segments (PLAN §13.4: no invented references) and every
    ``Citation.excerpt`` against the verbatim segment text (PLAN §13.4: no
    paraphrased excerpts — FM1 guard).

    Paraphrased excerpts are auto-repaired (snapped to the closest real substring)
    or dropped with ``excerpt_repaired=True``.

    When ``defensive`` is False (default) any malformed item raises (strict
    grounding — no fabricated references reach the capsule). When ``defensive``
    is True (FM4), a malformed *single* item — a citation whose ``seg_id`` does
    not resolve to a persisted segment, a missing/``None`` required field, a
    ``TypeError`` — is DROPPED and recorded in ``dropped`` instead of aborting
    the whole extraction. Zero-allucinazione is preserved: bad items are dropped,
    never invented. A bad citation drops only that citation, not the item.
    """
    segments = store.segments_for_lesson(lesson_id)
    if not segments:
        raise ValueError(
            f"no segments persisted for lesson {lesson_id!r}; ingest first"
        )
    valid_ids = frozenset(seg.seg_id for seg in segments)
    seg_text_map: dict[str, str] = {seg.seg_id: seg.text for seg in segments}

    drop = dropped if dropped is not None else []

    def _parse_citations(raw) -> tuple[Citation, ...]:
        if not raw:
            return ()
        cites = []
        for c in raw:
            try:
                seg_id = c.get("seg_id")
                if not seg_id:
                    raise ValueError(f"citation missing seg_id: {c!r}")
                if seg_id not in valid_ids:
                    raise ValueError(
                        f"citation cites unknown segment {seg_id!r} "
                        f"(not persisted for lesson {lesson_id!r})"
                    )
                raw_excerpt: str | None = c.get("excerpt")
                repaired: bool = False
                excerpt: str | None = raw_excerpt
                # FM1 guard: validate excerpt against verbatim segment text
                if raw_excerpt is not None and seg_id in seg_text_map:
                    segment_text = seg_text_map[seg_id]
                    if raw_excerpt not in segment_text:
                        # Paraphrased excerpt — attempt repair
                        repaired_excerpt = _repair_excerpt(raw_excerpt, segment_text)
                        if repaired_excerpt is not None:
                            excerpt = repaired_excerpt
                        else:
                            excerpt = None
                        repaired = True
                cites.append(
                    Citation(
                        seg_id=seg_id,
                        excerpt=excerpt,
                        confidence=c.get("confidence"),
                        excerpt_repaired=repaired,
                    )
                )
            except (ValueError, TypeError, KeyError, AttributeError) as exc:
                if not defensive:
                    raise
                drop.append(f"citation dropped ({type(exc).__name__}): {exc}")
        return tuple(cites)

    # T6R batching: one LLM call per window, then merge across windows.
    # concepts dedup by normalised name (union citations + prerequisites,
    # keep first-seen name/status/order); exercises/questions/homework dedup
    # by their text. A single-window lesson reduces to the original behaviour.
    concepts_by_name: dict[str, ConceptExtraction] = {}
    concept_order: list[str] = []
    exercises: list[ExerciseExtraction] = []
    seen_exercise: set[str] = set()
    questions: list[QuestionExtraction] = []
    seen_question: set[str] = set()
    homework: list[HomeworkExtraction] = []
    seen_homework: set[str] = set()

    for window in _window(segments, window_size):
        prompt = build_extraction_prompt(window)
        response = router.complete(prompt, provider=provider, model=model)
        data = extract_json(response.text)

        for c in data.get("concepts", []):
            try:
                if not c.get("name"):
                    raise ValueError(f"concept missing name: {c!r}")
                if not c.get("status"):
                    raise ValueError(f"concept missing status: {c!r}")
                ce = ConceptExtraction(
                    name=c["name"],
                    status=c["status"],
                    canonical=c.get("canonical", ""),
                    prerequisites=tuple(c.get("prerequisites") or []),
                    citations=_parse_citations(c.get("citations")),
                )
            except (ValueError, TypeError, KeyError, AttributeError) as exc:
                if not defensive:
                    raise
                drop.append(f"concept dropped ({type(exc).__name__}): {exc}")
                continue
            key = ce.canonical if ce.canonical else ce.name.strip().lower()
            if key in concepts_by_name:
                prev = concepts_by_name[key]
                concepts_by_name[key] = ConceptExtraction(
                    name=prev.name,
                    canonical=prev.canonical,
                    status=prev.status,
                    prerequisites=tuple(
                        dict.fromkeys(prev.prerequisites + ce.prerequisites)
                    ),
                    citations=prev.citations + ce.citations,
                )
            else:
                concepts_by_name[key] = ce
                concept_order.append(key)

        for e in data.get("exercises", []):
            try:
                if not e.get("prompt"):
                    raise ValueError(f"exercise missing prompt: {e!r}")
                ee = ExerciseExtraction(
                    prompt=e["prompt"],
                    solution=e.get("solution"),
                    citations=_parse_citations(e.get("citations")),
                )
            except (ValueError, TypeError, KeyError, AttributeError) as exc:
                if not defensive:
                    raise
                drop.append(f"exercise dropped ({type(exc).__name__}): {exc}")
                continue
            key = ee.prompt.strip()
            if key in seen_exercise:
                continue
            seen_exercise.add(key)
            exercises.append(ee)

        for q in data.get("student_questions", []):
            try:
                if not q.get("question"):
                    raise ValueError(f"student_question missing question: {q!r}")
                qe = QuestionExtraction(
                    question=q["question"],
                    citations=_parse_citations(q.get("citations")),
                )
            except (ValueError, TypeError, KeyError, AttributeError) as exc:
                if not defensive:
                    raise
                drop.append(
                    f"student_question dropped ({type(exc).__name__}): {exc}"
                )
                continue
            key = qe.question.strip()
            if key in seen_question:
                continue
            seen_question.add(key)
            questions.append(qe)

        for h in data.get("homework", []):
            try:
                if not h.get("task"):
                    raise ValueError(f"homework missing task: {h!r}")
                he = HomeworkExtraction(
                    task=h["task"],
                    citations=_parse_citations(h.get("citations")),
                )
            except (ValueError, TypeError, KeyError, AttributeError) as exc:
                if not defensive:
                    raise
                drop.append(f"homework dropped ({type(exc).__name__}): {exc}")
                continue
            key = he.task.strip()
            if key in seen_homework:
                continue
            seen_homework.add(key)
            homework.append(he)

    return LessonContent(
        lesson_id=lesson_id,
        concepts=tuple(concepts_by_name[k] for k in concept_order),
        exercises=tuple(exercises),
        student_questions=tuple(questions),
        homework=tuple(homework),
    )
