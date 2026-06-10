"""Adapter from ASR SpeechSegment JSONL to lessonos Segment store records.

T4b: the bridge between the real transcription output (ASR pipeline)
and the Lesson Capsule pipeline (segmentation → extraction → assembly).

Usage::

    from lessonos.asr.adapter import ingest_asr_jsonl, asr_jsonl_to_segments
    store = SQLiteStore(":memory:")
    segments = asr_jsonl_to_segments("transcript.jsonl", lesson_id="prima_lezione")
    for seg in segments:
        store.save_segment(seg)
"""

from __future__ import annotations

import logging
from pathlib import Path

from lessonos.asr.models import segments_from_jsonl
from lessonos.models.entities import Segment
from lessonos.store.base import Store

logger = logging.getLogger(__name__)


def asr_jsonl_to_segments(
    jsonl_path: str,
    lesson_id: str,
    *,
    max_segments: int | None = None,
) -> tuple[Segment, ...]:
    """Read an ASR JSONL file and yield lessonos Segment objects.

    Each ASR speech segment (start, end, text) becomes a ground-truth segment
    with a generated ``seg_id`` of ``<lesson_id>#s<index>`` (1-indexed).  ``start``/``end`` are cast to ``int``
    seconds (truncated, not rounded) to match the Segment model — sub-second
    precision is preserved in the SpeechSegment but the store tracks seconds.

    Args:
        jsonl_path: Path to an ASR ``speech.segment`` JSONL file (one
            SpeechSegment dict per line).
        lesson_id: LessonOS lesson_id this transcription belongs to.
        max_segments: If set, only the first N segments are kept.
            Used to cap LLM cost when building a capsule from a long lecture.

    Returns:
        A tuple of ``Segment`` objects, in the original ASR order.

    Raises:
        FileNotFoundError: If ``jsonl_path`` does not exist.
        ValueError: If the JSONL yields zero valid segments.
    """
    path = Path(jsonl_path)
    if not path.exists():
        raise FileNotFoundError(f"ASR JSONL not found: {jsonl_path}")

    segments: list[Segment] = []
    count = 0
    for speech_seg in segments_from_jsonl(str(path)):
        if max_segments is not None and len(segments) >= max_segments:
            break
        if not speech_seg.text.strip():
            logger.debug("Skipping empty segment at index %d", count)
            count += 1
            continue
        seg_id = f"{lesson_id}#s{len(segments) + 1}"
        segments.append(
            Segment(
                seg_id=seg_id,
                lesson_id=lesson_id,
                start=int(speech_seg.start),
                end=max(int(speech_seg.end), int(speech_seg.start) + 1),
                text=speech_seg.text,
            )
        )
        count += 1

    if not segments:
        raise ValueError(
            f"ASR JSONL {jsonl_path!r} yielded zero valid segments "
            f"(checked {count} lines, all empty)"
        )

    return tuple(segments)


def ingest_asr_jsonl(
    store: Store,
    jsonl_path: str,
    lesson_id: str,
    *,
    max_segments: int | None = None,
) -> tuple[Segment, ...]:
    """Read an ASR JSONL and persist its segments into the store.

    Convenience wrapper around ``asr_jsonl_to_segments`` that also persists.

    Args:
        store: An open Store (e.g. SQLiteStore).
        jsonl_path: Path to ASR speech.segment JSONL.
        lesson_id: LessonOS lesson_id.
        max_segments: If set, only the first N segments are ingested.

    Returns:
        The tuple of persisted Segment objects.
    """
    segments = asr_jsonl_to_segments(jsonl_path, lesson_id, max_segments=max_segments)
    for seg in segments:
        store.save_segment(seg)
    return segments
