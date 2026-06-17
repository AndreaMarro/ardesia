"""Rule-based chunking of raw text → Segment-like chunks (M7 P0, ZERO-LLM).

Transforms arbitrary prose (lecture transcript, .txt, .vtt, .srt) into chunks
that are valid :class:`~lessonos.models.entities.Segment` analogues: each chunk
carries a generated ``seg_id``, an optional start/end (from VTT/SRT timestamps,
or ``None`` for raw text), and a bounded text span.

Chunking strategies (tried in order):
1. **VTT/SRT** — time-stamped captions parsed to segments (each caption = 1 segment)
2. **Paragraph** — double-newline boundaries (best when the text has natural breaks)
3. **Sentence** — sentence-terminal punctuation split for long paragraphs
4. **Character window** — hard cap for very long runs (avoid gigachunks)
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field


# Target chunk size: ~400-500 chars (comfortable reading span, ~80-100 words)
_TARGET_CHUNK_CHARS = 450
_MAX_CHUNK_CHARS = 800


@dataclass(frozen=True)
class ChunkResultItem:
    """A single chunk from raw text ingestion.

    Models the same fields as :class:`~lessonos.models.entities.Segment` but
    without requiring a persisted store lookup. ``start``/``end`` are optional
    (``None`` for raw text without timestamps).
    """

    seg_id: str
    text: str
    start: int | None = None
    end: int | None = None


@dataclass(frozen=True)
class ChunkResult:
    """Result of chunking raw input text.

    ``items`` are the produced chunks (in order). ``source_type`` records
    how the input was interpreted (``"raw"``, ``"vtt"``, ``"srt"``, ``"txt"``).
    """

    items: tuple[ChunkResultItem, ...]
    source_type: str = "raw"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def chunk_raw_text(
    text: str,
    *,
    source_id: str = "raw_lesson",
    max_chars: int = _MAX_CHUNK_CHARS,
) -> ChunkResult:
    """Chunk arbitrary raw text by paragraph/sentence/window.

    ``source_id`` is used as the prefix for generated ``seg_id`` values
    (``<source_id>_s0``, ``<source_id>_s1``, …). ZERO-LLM.

    Parameters
    ----------
    text : str
        Raw prose to chunk.  May contain double-newlines (paragraph breaks).
    source_id : str
        Prefix for generated segment ids (default ``"raw_lesson"``).
    max_chars : int
        Hard character cap per chunk.  Longer runs are split sentence-wise
        even within a paragraph.

    Returns
    -------
    ChunkResult
        Ordered chunks with auto-generated seg_id values.
    """
    text = text.strip()
    if not text:
        return ChunkResult(items=(), source_type="raw")

    paragraphs = _split_paragraphs(text)
    items: list[ChunkResultItem] = []
    chunk_index = 0

    for para in paragraphs:
        sub_chunks = _chunk_paragraph(para, max_chars=max_chars)
        for chunk_text in sub_chunks:
            items.append(
                ChunkResultItem(
                    seg_id=f"{source_id}_s{chunk_index}",
                    text=chunk_text.strip(),
                )
            )
            chunk_index += 1

    return ChunkResult(items=tuple(items), source_type="raw")


def chunk_vtt(vtt_text: str, *, source_id: str = "vtt_lesson") -> ChunkResult:
    """Parse VTT captions into timestamped segments.

    Each VTT cue (``00:01.500 --> 00:04.000``) becomes one
    :class:`ChunkResultItem` with ``start``/``end`` in seconds and the cue
    text as ``text``.  HTML tags inside cue text are stripped.

    Parameters
    ----------
    vtt_text : str
        WebVTT content (including the ``WEBVTT`` header).
    source_id : str
        Prefix for generated segment ids (default ``"vtt_lesson"``).

    Returns
    -------
    ChunkResult
        Ordered segments with start/end seconds.
    """
    return _parse_timed_text(
        vtt_text,
        pattern=_VTT_CUE_RE,
        source_id=source_id,
        source_type="vtt",
        time_converter=_vtt_time_to_secs,
    )


def chunk_srt(srt_text: str, *, source_id: str = "srt_lesson") -> ChunkResult:
    """Parse SRT subtitles into timestamped segments.

    Each SRT cue (``00:01,500 --> 00:04,000``) becomes one
    :class:`ChunkResultItem` with ``start``/``end`` in seconds.

    Parameters
    ----------
    srt_text : str
        SubRip content (numbered cues with ``-->`` timestamps).
    source_id : str
        Prefix for generated segment ids (default ``"srt_lesson"``).

    Returns
    -------
    ChunkResult
        Ordered segments with start/end seconds.
    """
    return _parse_timed_text(
        srt_text,
        pattern=_SRT_CUE_RE,
        source_id=source_id,
        source_type="srt",
        time_converter=_srt_time_to_secs,
    )


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

# VTT cue pattern: 00:01.500 --> 00:04.000 (optional leading `WEBVTT` header)
_VTT_CUE_RE = re.compile(
    r"(\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}\.\d{3})\s*\n((?:(?!\n\n|$).+?(?:\n|$))*)",
    re.MULTILINE | re.DOTALL,
)

# SRT cue pattern: 00:01,500 --> 00:04,000 (comma decimal separator)
_SRT_CUE_RE = re.compile(
    r"(\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2},\d{3})\s*\n((?:(?!\n\n|$).+?(?:\n|$))*)",
    re.MULTILINE | re.DOTALL,
)


def _vtt_time_to_secs(ts: str) -> int:
    """Convert ``00:01.500`` to floor seconds (1)."""
    parts = ts.split(":")
    if len(parts) == 2:
        m, s = parts
        return int(m) * 60 + int(float(s))
    h, m, s = parts
    return int(h) * 3600 + int(m) * 60 + int(float(s))


def _srt_time_to_secs(ts: str) -> int:
    """Convert ``00:01,500`` to floor seconds (1)."""
    # SRT uses comma as decimal separator
    ts_dot = ts.replace(",", ".")
    return _vtt_time_to_secs(ts_dot)


def _parse_timed_text(
    text: str,
    *,
    pattern: re.Pattern,
    source_id: str,
    source_type: str,
    time_converter,
) -> ChunkResult:
    """Generic timed-text parser (VTT/SRT)."""
    items: list[ChunkResultItem] = []
    for i, match in enumerate(pattern.finditer(text)):
        start_secs = time_converter(match.group(1))
        end_secs = time_converter(match.group(2))
        raw_text = match.group(3).strip()
        # Strip HTML tags from caption text
        clean = re.sub(r"<[^>]+>", "", raw_text).strip()
        if not clean:
            continue
        items.append(
            ChunkResultItem(
                seg_id=f"{source_id}_s{i}",
                text=clean,
                start=start_secs,
                end=end_secs,
            )
        )
    return ChunkResult(items=tuple(items), source_type=source_type)


def _split_paragraphs(text: str) -> list[str]:
    """Split text into paragraphs by double-newline."""
    raw = re.split(r"\n\s*\n", text)
    return [p.strip() for p in raw if p.strip()]


def _chunk_paragraph(para: str, *, max_chars: int) -> list[str]:
    """Split a single paragraph into sub-chunks.

    If the paragraph is shorter than ``max_chars``, return it whole.
    Otherwise split by sentence boundaries; if any resulting run still
    exceeds ``max_chars``, hard-split at the word boundary nearest to
    ``max_chars``.
    """
    if len(para) <= max_chars:
        return [para]

    sentences = _split_sentences(para)
    chunks: list[str] = []
    current: list[str] = []

    for sent in sentences:
        # If a single sentence exceeds max_chars, hard-split it
        if len(sent) > max_chars:
            # Flush current buffer first
            if current:
                chunks.append(" ".join(current))
                current = []
            # Hard-split the long sentence
            for part in _hard_split(sent, max_chars=max_chars):
                chunks.append(part)
            continue

        candidate_len = sum(len(s) + 1 for s in current) + len(sent)
        if candidate_len <= max_chars:
            current.append(sent)
        else:
            if current:
                chunks.append(" ".join(current))
            current = [sent]

    if current:
        chunks.append(" ".join(current))

    return chunks


_SENTENCE_SPLIT = re.compile(
    r"(?<=[.!?])\s+(?=[A-Z\"'«(])|(?<=[.!?])\s*$"
)


def _split_sentences(text: str) -> list[str]:
    """Split text at sentence boundaries.

    Rule-based: sentence-terminal punctuation (``. ! ?``) followed by
    space + uppercase letter or quote/opening bracket.  Falls back to the
    whole text if no split points are found.
    """
    parts = _SENTENCE_SPLIT.split(text)
    return [p.strip() for p in parts if p.strip()]


def _hard_split(text: str, *, max_chars: int) -> list[str]:
    """Hard-split a string at word boundaries near ``max_chars``."""
    if len(text) <= max_chars:
        return [text]
    # Find the last space within max_chars
    split_at = text.rfind(" ", 0, max_chars)
    if split_at == -1:
        # No space found — force-split at max_chars
        split_at = max_chars
    first = text[:split_at].strip()
    rest = text[split_at:].strip()
    return [first] + _hard_split(rest, max_chars=max_chars)
