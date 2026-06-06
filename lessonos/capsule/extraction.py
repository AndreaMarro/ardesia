"""Extract concepts/exercises/questions/homework from a lesson (PLAN §16.1, §26.1).

Second step of the Lesson Capsule pipeline: given the persisted segments, extract
the lesson content (concepts, exercises, student_questions, homework). The router
is abstract (mock in tests). All citations MUST point at existing segment IDs —
the LLM cites, but we validate against persisted segments (PLAN §13.4).
"""

from __future__ import annotations

import json
from dataclasses import dataclass

from lessonos.llm.router import Router
from lessonos.models import CONCEPT_STATUS
from lessonos.store.base import Store


@dataclass(frozen=True)
class Citation:
    """A grounded citation pointing at a transcript segment (PLAN §13.4).

    ``seg_id`` must resolve to a persisted Segment for the lesson. ``excerpt``
    is the snippet being cited (optional, for readability). ``confidence`` is
    the model's self-assessed certainty (0.0–1.0, optional).
    """

    seg_id: str
    excerpt: str | None = None
    confidence: float | None = None


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
    persisted segments. A dangling citation raises ``ValueError`` — no fabricated
    references (PLAN §13.4).
    """
    segments = store.segments_for_lesson(lesson_id)
    if not segments:
        raise ValueError(
            f"no segments persisted for lesson {lesson_id!r}; ingest first"
        )
    valid_ids = frozenset(seg.seg_id for seg in segments)

    prompt = build_extraction_prompt(segments)
    response = router.complete(prompt, provider=provider, model=model)
    data = json.loads(response.text)

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
            cites.append(
                Citation(
                    seg_id=seg_id,
                    excerpt=c.get("excerpt"),
                    confidence=c.get("confidence"),
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
