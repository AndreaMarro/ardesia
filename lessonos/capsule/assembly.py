"""Assemble a complete Lesson Capsule from segmentation + extraction (PLAN §26.1).

Final step of the M2 pipeline: combines the topic timeline (from segmentation)
with the extracted content (concepts, exercises, questions, homework) into a
single grounded Lesson Capsule. All citations have already been validated by
the sub-steps; the assembler only composes.
"""

from __future__ import annotations

from dataclasses import dataclass

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
) -> LessonCapsule:
    """Assemble a full Lesson Capsule for ``lesson_id``.

    Runs topic segmentation and content extraction (both against the router)
    and returns the composed capsule. Raises ``ValueError`` if segments are not
    ingested or if any grounding check fails inside the sub-steps.
    """
    timeline = segment_lesson_topics(
        store, lesson_id, router, provider=provider, model=model
    )
    content = extract_lesson_content(
        store, lesson_id, router, provider=provider, model=model
    )
    return LessonCapsule(
        lesson_id=lesson_id,
        timeline=timeline,
        content=content,
    )
