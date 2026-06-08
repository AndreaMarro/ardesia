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


def _repair_excerpt(excerpt: str, segment_text: str) -> str | None:
    """Try to locate the closest substring of ``segment_text`` matching ``excerpt``.

    Strategy (3-tier):
      1. If excerpt is already a verbatim substring → return excerpt as-is.
      2. Longest common substring via ``difflib.SequenceMatcher.find_longest_match``
         — if length >= 3 characters, return that substring.
      3. Word-by-word greedy scan: try to find the longest prefix of excerpt words
         that still appears in segment_text; if at least 1 word matches, return the
         matched span.

    Returns the repaired substring or ``None`` if no meaningful match is found.
    """
    if not excerpt or not segment_text:
        return None

    # Tier 1 — verbatim substring
    if excerpt in segment_text:
        return excerpt

    # Tier 2 — longest common substring
    matcher = SequenceMatcher(None, excerpt, segment_text)
    match = matcher.find_longest_match(
        0, len(excerpt), 0, len(segment_text)
    )
    # Require match to be at least 40% of excerpt length OR at least 8 chars
    # to avoid accidental 3-char matches like 'uan' from 'quantum'
    if match.size >= max(8, int(len(excerpt) * 0.4)):
        return segment_text[match.b : match.b + match.size]

    # Tier 3 — word-by-word greedy scan (case-insensitive)
    excerpt_lower = excerpt.lower()
    seg_lower = segment_text.lower()
    words = excerpt_lower.split()
    # Find the longest prefix of words that appears consecutively in segment_text
    best_end = 0
    for i in range(len(words), 0, -1):
        candidate = " ".join(words[:i])
        if candidate in seg_lower:
            best_end = i
            break  # Found longest match
    if best_end > 0:
        # Map back to the segment's actual text (preserves original casing)
        matched_lower = " ".join(words[:best_end])
        idx = seg_lower.index(matched_lower)
        return segment_text[idx : idx + len(matched_lower)]

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
    """A concept extracted from a lesson (PLAN §26.1 concepts array)."""

    name: str
    status: str  # ∈ CONCEPT_STATUS
    prerequisites: tuple[str, ...] = ()
    citations: tuple[Citation, ...] = ()

    def __post_init__(self) -> None:
        if self.status not in CONCEPT_STATUS:
            raise ValueError(
                f"invalid concept status: {self.status!r} "
                f"(expected one of {sorted(CONCEPT_STATUS)})"
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


def build_extraction_prompt(segments) -> str:
    """Deterministic prompt for content extraction (stable → mock-keyable)."""
    lines = [
        "Estrai il contenuto della lezione: concetti, esercizi, domande, compiti.",
        'Restituisci JSON con: {"concepts": [...], "exercises": [...], "student_questions": [...], "homework": [...]}.',
        "",
        "Concepts: [{name, status, prerequisites?, citations}].",
        f"status ∈ {sorted(CONCEPT_STATUS)}.",
        "",
        "Exercises: [{prompt, solution?, citations}].",
        "student_questions: [{question, citations}].",
        "homework: [{task, citations}].",
        "",
        "citations: [{seg_id, excerpt?, confidence?}].",
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
) -> LessonContent:
    """Extract concepts/exercises/questions/homework from persisted segments.

    Reads the segments from the store (they must be ingested first), asks the
    router to extract content, then validates every ``Citation.seg_id`` against
    persisted segments (PLAN §13.4: no invented references) and every
    ``Citation.excerpt`` against the verbatim segment text (PLAN §13.4: no
    paraphrased excerpts — FM1 guard).

    Paraphrased excerpts are auto-repaired (snapped to the closest real substring)
    or dropped with ``excerpt_repaired=True``.
    """
    segments = store.segments_for_lesson(lesson_id)
    if not segments:
        raise ValueError(
            f"no segments persisted for lesson {lesson_id!r}; ingest first"
        )
    valid_ids = frozenset(seg.seg_id for seg in segments)
    seg_text_map: dict[str, str] = {seg.seg_id: seg.text for seg in segments}

    prompt = build_extraction_prompt(segments)
    response = router.complete(prompt, provider=provider, model=model)
    data = extract_json(response.text)

    def _parse_citations(raw) -> tuple[Citation, ...]:
        if not raw:
            return ()
        cites = []
        for c in raw:
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
        return tuple(cites)

    concepts = []
    for c in data.get("concepts", []):
        if not c.get("name"):
            raise ValueError(f"concept missing name: {c!r}")
        if not c.get("status"):
            raise ValueError(f"concept missing status: {c!r}")
        concepts.append(
            ConceptExtraction(
                name=c["name"],
                status=c["status"],
                prerequisites=tuple(c.get("prerequisites", [])),
                citations=_parse_citations(c.get("citations")),
            )
        )

    exercises = []
    for e in data.get("exercises", []):
        if not e.get("prompt"):
            raise ValueError(f"exercise missing prompt: {e!r}")
        exercises.append(
            ExerciseExtraction(
                prompt=e["prompt"],
                solution=e.get("solution"),
                citations=_parse_citations(e.get("citations")),
            )
        )

    questions = []
    for q in data.get("student_questions", []):
        if not q.get("question"):
            raise ValueError(f"student_question missing question: {q!r}")
        questions.append(
            QuestionExtraction(
                question=q["question"],
                citations=_parse_citations(q.get("citations")),
            )
        )

    homework = []
    for h in data.get("homework", []):
        if not h.get("task"):
            raise ValueError(f"homework missing task: {h!r}")
        homework.append(
            HomeworkExtraction(
                task=h["task"],
                citations=_parse_citations(h.get("citations")),
            )
        )

    return LessonContent(
        lesson_id=lesson_id,
        concepts=tuple(concepts),
        exercises=tuple(exercises),
        student_questions=tuple(questions),
        homework=tuple(homework),
    )
