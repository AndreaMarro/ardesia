"""Assemble a complete Lesson Capsule from segmentation + extraction (PLAN §26.1).

Final step of the M2 pipeline: combines the topic timeline (from segmentation)
with the extracted content (concepts, exercises, questions, homework) into a
single grounded Lesson Capsule. All citations have already been validated by
the sub-steps; the assembler only composes.

Optional persistence: pass ``save=True`` to ``assemble_lesson_capsule`` and
the capsule will be saved in the store as a serialised JSON blob (M2-task5).
Use ``load_capsule()`` to retrieve it later without re-running the LLM.
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass

from lessonos.capsule.extraction import LessonContent, extract_lesson_content
from lessonos.capsule.segmentation import TopicSpan, segment_lesson_topics
from lessonos.llm.router import Router
from lessonos.store.base import Store


@dataclass(frozen=True)
class LessonCapsule:
    """Complete Lesson Capsule (PLAN §26.1).

    The output of the M2 pipeline: a grounded, citation-backed representation
    of a single lesson. Every ``seg_id`` inside has been validated against
    persisted segments by the segmentation and extraction steps.
    """

    lesson_id: str
    timeline: tuple[TopicSpan, ...]
    content: LessonContent


def assemble_lesson_capsule(
    store: Store,
    lesson_id: str,
    router: Router,
    *,
    provider: str = "mock",
    model: str | None = None,
    save: bool = False,
) -> LessonCapsule:
    """Assemble a full Lesson Capsule for ``lesson_id``.

    Runs topic segmentation and content extraction (both against the router)
    and returns the composed capsule. Raises ``ValueError`` if segments are not
    ingested or if any grounding check fails inside the sub-steps.

    When ``save=True``, the assembled capsule is automatically persisted in
    the store as a JSON blob (idempotent — subsequent calls overwrite).
    """
    timeline = segment_lesson_topics(
        store, lesson_id, router, provider=provider, model=model
    )
    content = extract_lesson_content(
        store, lesson_id, router, provider=provider, model=model
    )
    capsule = LessonCapsule(
        lesson_id=lesson_id,
        timeline=timeline,
        content=content,
    )

    if save:
        store.save_capsule(lesson_id, _serialise_capsule(capsule))

    return capsule


def load_capsule(
    store: Store,
    lesson_id: str,
) -> LessonCapsule | None:
    """Load a previously persisted Lesson Capsule from the store, or ``None``.

    The capsule is deserialised from the JSON blob stored by
    ``assemble_lesson_capsule(…, save=True)``. This avoids re-running the LLM
    pipeline for reading already-computed capsules.
    """
    raw = store.get_capsule(lesson_id)
    if raw is None:
        return None
    return _deserialise_capsule(raw, lesson_id)


def _serialise_capsule(capsule: LessonCapsule) -> str:
    """Serialise a Lesson Capsule to a JSON string for persistence."""
    return json.dumps(asdict(capsule), ensure_ascii=False, default=str)


def _deserialise_capsule(raw: str, lesson_id: str) -> LessonCapsule:
    """Rebuild a Lesson Capsule from its JSON-serialised form."""
    from lessonos.capsule.extraction import (
        Citation,
        ConceptExtraction,
        ExerciseExtraction,
        HomeworkExtraction,
        LessonContent,
        QuestionExtraction,
    )
    from lessonos.capsule.segmentation import TopicSpan

    data = json.loads(raw)

    def _cites(items: list) -> tuple[Citation, ...]:
        return tuple(
            Citation(
                seg_id=c["seg_id"],
                excerpt=c.get("excerpt"),
                confidence=c.get("confidence"),
            )
            for c in (items or [])
        )

    timeline = tuple(
        TopicSpan(
            lesson_id=lesson_id,
            topic=span["topic"],
            seg_ids=tuple(span["seg_ids"]),
            start=span["start"],
            end=span["end"],
        )
        for span in data.get("timeline", [])
    )

    raw_content = data.get("content", {})
    content = LessonContent(
        lesson_id=lesson_id,
        concepts=tuple(
            ConceptExtraction(
                name=c["name"],
                status=c["status"],
                prerequisites=tuple(c.get("prerequisites", [])),
                citations=_cites(c.get("citations")),
            )
            for c in raw_content.get("concepts", [])
        ),
        exercises=tuple(
            ExerciseExtraction(
                prompt=e["prompt"],
                solution=e.get("solution"),
                citations=_cites(e.get("citations")),
            )
            for e in raw_content.get("exercises", [])
        ),
        student_questions=tuple(
            QuestionExtraction(
                question=q["question"],
                citations=_cites(q.get("citations")),
            )
            for q in raw_content.get("student_questions", [])
        ),
        homework=tuple(
            HomeworkExtraction(
                task=h["task"],
                citations=_cites(h.get("citations")),
            )
            for h in raw_content.get("homework", [])
        ),
    )

    return LessonCapsule(
        lesson_id=lesson_id,
        timeline=timeline,
        content=content,
    )
