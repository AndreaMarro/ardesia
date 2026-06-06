"""Topic segmentation of a lesson via the LLM router (PLAN §16.1, §26.1).

First step of the Lesson Capsule pipeline: group a lesson's transcript segments
into topic-coherent spans. The router is abstract (mock in tests). The LLM only
decides *grouping* — every ``seg_id`` it returns must resolve to a segment
already persisted for the lesson, or we refuse it (PLAN §13.4: "mai citazioni
inventate"). ``start``/``end`` are derived from the real segments, never from
the model, so the timeline stays grounded in the transcript.
"""

from __future__ import annotations

import json
from dataclasses import dataclass

from lessonos.llm.router import Router
from lessonos.store.base import Store


@dataclass(frozen=True)
class TopicSpan:
    """A topic-coherent span of a lesson (PLAN §26.1 ``timeline`` entry).

    ``seg_ids`` are the cited transcript segments (grounding). ``start``/``end``
    (seconds) are derived from those segments — the temporal extent of the topic.
    """

    lesson_id: str
    topic: str
    seg_ids: tuple[str, ...]
    start: int
    end: int


def build_segmentation_prompt(segments) -> str:
    """Deterministic prompt for topic segmentation (stable → mock-keyable)."""
    lines = [
        "Segmenta la lezione per argomenti.",
        'Restituisci JSON: lista di {"topic": str, "seg_ids": [str, ...]}.',
        "Usa SOLO i seg_id elencati; non inventarne.",
        "",
        "Segmenti:",
    ]
    for seg in segments:
        lines.append(f"[{seg.seg_id}] {seg.text}")
    return "\n".join(lines)


def segment_lesson_topics(
    store: Store,
    lesson_id: str,
    router: Router,
    *,
    provider: str = "mock",
    model: str | None = None,
) -> tuple[TopicSpan, ...]:
    """Group a lesson's persisted segments into grounded :class:`TopicSpan`s.

    Reads the segments from the store (they must be ingested first), asks the
    router to group them, then validates every cited ``seg_id`` against the
    persisted segments. A dangling citation, an empty topic, or a missing
    ``topic`` label raises ``ValueError`` — no fabricated timeline.
    """
    segments = store.segments_for_lesson(lesson_id)
    if not segments:
        raise ValueError(
            f"no segments persisted for lesson {lesson_id!r}; ingest first"
        )
    by_id = {seg.seg_id: seg for seg in segments}

    prompt = build_segmentation_prompt(segments)
    response = router.complete(prompt, provider=provider, model=model)
    topics = json.loads(response.text)

    spans: list[TopicSpan] = []
    for entry in topics:
        topic = entry.get("topic")
        seg_ids = tuple(entry.get("seg_ids", ()))
        if not topic:
            raise ValueError(f"topic entry missing label: {entry!r}")
        if not seg_ids:
            raise ValueError(f"topic {topic!r} cites no segments")
        cited = []
        for sid in seg_ids:
            seg = by_id.get(sid)
            if seg is None:
                raise ValueError(
                    f"topic {topic!r} cites unknown segment {sid!r} "
                    f"(not persisted for lesson {lesson_id!r})"
                )
            cited.append(seg)
        spans.append(
            TopicSpan(
                lesson_id=lesson_id,
                topic=topic,
                seg_ids=seg_ids,
                start=min(s.start for s in cited),
                end=max(s.end for s in cited),
            )
        )
    return tuple(spans)
