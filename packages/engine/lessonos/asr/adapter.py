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


# Coalescing (T6R anti-coriandoli): aggressive VAD fragments real lectures into
# tiny speech segments (measured: seconda avg 11 chars/segment, 3270/3446 under
# 30). A verbatim excerpt can never be longer than its segment, so citation
# quality has a hard ceiling set here. Coalescing merges consecutive speech
# segments into sentence-sized Segments. Time gap above _GAP_FLUSH_S flushes
# early (speaker pause = natural boundary); _HARD_CAP_FACTOR bounds runaway
# merges when the speaker never pauses nor closes a sentence.
_GAP_FLUSH_S = 5.0
_HARD_CAP_FACTOR = 3
_SENTENCE_END = (".", "?", "!")


def _coalesce_speech(speech_segs: list, min_chars: int) -> list:
    """Merge consecutive SpeechSegments into sentence-sized units.

    Flush rules: accumulated text >= *min_chars* AND ends with sentence-terminal
    punctuation; OR accumulated length >= ``_HARD_CAP_FACTOR * min_chars``; OR
    the gap to the next segment exceeds ``_GAP_FLUSH_S`` seconds. Returns a list
    of ``(start, end, text)`` tuples preserving order and time spans.
    """
    out: list[tuple[float, float, str]] = []
    acc_text: list[str] = []
    acc_start: float | None = None
    acc_end: float = 0.0

    def _flush() -> None:
        nonlocal acc_text, acc_start
        if acc_text and acc_start is not None:
            out.append((acc_start, acc_end, " ".join(acc_text)))
        acc_text, acc_start = [], None

    for seg in speech_segs:
        if acc_start is not None and seg.start - acc_end > _GAP_FLUSH_S:
            _flush()
        text = seg.text.strip()
        # Whisper loop-hallucination guard: on noise/silence whisper repeats the
        # same phrase across many consecutive micro-segments ("per un attimino"
        # x17 measured on seconda). Coalescing would concatenate the loop into
        # one garbage mega-segment — collapse consecutive identical texts.
        if acc_text and text == acc_text[-1]:
            acc_end = seg.end
            continue
        if acc_start is None:
            acc_start = seg.start
        acc_text.append(text)
        acc_end = seg.end
        joined_len = sum(len(t) for t in acc_text) + len(acc_text) - 1
        if joined_len >= min_chars and seg.text.rstrip().endswith(_SENTENCE_END):
            _flush()
        elif joined_len >= _HARD_CAP_FACTOR * min_chars:
            _flush()
    _flush()
    return out


def asr_jsonl_to_segments(
    jsonl_path: str,
    lesson_id: str,
    *,
    max_segments: int | None = None,
    min_chars: int = 0,
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

    if min_chars > 0:
        # Coalescing path: gather non-empty speech segments, merge into
        # sentence-sized units, then index 1..N on the OUTPUT segments.
        speech: list = []
        for speech_seg in segments_from_jsonl(str(path)):
            count += 1
            if speech_seg.text.strip():
                speech.append(speech_seg)
        for start, end, text in _coalesce_speech(speech, min_chars):
            if max_segments is not None and len(segments) >= max_segments:
                break
            segments.append(
                Segment(
                    seg_id=f"{lesson_id}#s{len(segments) + 1}",
                    lesson_id=lesson_id,
                    start=int(start),
                    end=max(int(end), int(start) + 1),
                    text=text,
                )
            )
    else:
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
    min_chars: int = 0,
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
    segments = asr_jsonl_to_segments(
        jsonl_path, lesson_id, max_segments=max_segments, min_chars=min_chars
    )
    for seg in segments:
        store.save_segment(seg)
    return segments
