"""Tests for the ASR-to-Segment adapter (T4b).

Covers:
- Basic conversion: 3 SpeechSegments → 3 Segments with correct seg_id, start, end, text
- Empty text lines skipped
- Empty file → ValueError
- max_segments cap
- End-to-end store round-trip via ingest_asr_jsonl
"""

from __future__ import annotations

import json
import tempfile
from pathlib import Path

import pytest

from lessonos.asr.adapter import asr_jsonl_to_segments, ingest_asr_jsonl
from lessonos.models.entities import Segment
from lessonos.store.sqlite import SQLiteStore

_SAMPLE_LINES = [
    {
        "start": 0.0,
        "end": 12.54,
        "text": "Se io voglio giocare per 5 minuti e inizio a dire a tutti cos'e un segnale, nessuno sbaglia.",
        "confidence": 0.6464,
        "speaker": None,
    },
    {
        "start": 12.54,
        "end": 15.96,
        "text": "Cose un segnale? Per te cose un segnale?",
        "confidence": 0.6464,
        "speaker": None,
    },
    {
        "start": 15.96,
        "end": 20.69,
        "text": "Qualcosa oppure non avendo.",
        "confidence": 0.6464,
        "speaker": None,
    },
]


def _write_jasonl(lines: list[dict], tmp_path: Path) -> str:
    p = tmp_path / "transcript.jsonl"
    with open(p, "w", encoding="utf-8") as f:
        for line in lines:
            f.write(json.dumps(line, ensure_ascii=False) + "\n")
    return str(p)


class TestAsrJsonlToSegments:
    def test_three_segments_basic(self, tmp_path: Path) -> None:
        path = _write_jasonl(_SAMPLE_LINES, tmp_path)
        segments = asr_jsonl_to_segments(path, lesson_id="prima_lezione")
        assert len(segments) == 3
        # seg_id format
        assert segments[0].seg_id == "prima_lezione#s1"
        assert segments[1].seg_id == "prima_lezione#s2"
        assert segments[2].seg_id == "prima_lezione#s3"
        # start/end: float → int (truncated)
        assert segments[0].start == 0
        assert segments[0].end == 12  # int(12.54) = 12
        assert segments[1].start == 12  # int(12.54) = 12
        assert segments[1].end == 15  # int(15.96) = 15
        # text preserved verbatim
        assert segments[0].text == _SAMPLE_LINES[0]["text"]
        # lesson_id
        assert segments[0].lesson_id == "prima_lezione"

    def test_empty_text_skipped(self, tmp_path: Path) -> None:
        lines = [
            {"start": 0.0, "end": 1.0, "text": "hello", "confidence": 0.9},
            {"start": 1.0, "end": 2.0, "text": "", "confidence": 0.0},
            {"start": 2.0, "end": 3.0, "text": "   ", "confidence": 0.0},
            {"start": 3.0, "end": 4.0, "text": "world", "confidence": 0.9},
        ]
        path = _write_jasonl(lines, tmp_path)
        segments = asr_jsonl_to_segments(path, lesson_id="test")
        assert len(segments) == 2
        assert segments[0].text == "hello"
        assert segments[1].text == "world"
        # seg_ids skip empty slots
        assert segments[0].seg_id == "test#s1"
        assert segments[1].seg_id == "test#s2"

    def test_empty_file_raises(self, tmp_path: Path) -> None:
        path = _write_jasonl([], tmp_path)
        with pytest.raises(ValueError, match="zero valid segments"):
            asr_jsonl_to_segments(path, lesson_id="test")

    def test_all_empty_text_raises(self, tmp_path: Path) -> None:
        lines = [
            {"start": 0.0, "end": 1.0, "text": "", "confidence": 0.0},
            {"start": 1.0, "end": 2.0, "text": "", "confidence": 0.0},
        ]
        path = _write_jasonl(lines, tmp_path)
        with pytest.raises(ValueError, match="zero valid segments"):
            asr_jsonl_to_segments(path, lesson_id="test")

    def test_max_segments_cap(self, tmp_path: Path) -> None:
        path = _write_jasonl(_SAMPLE_LINES, tmp_path)
        segments = asr_jsonl_to_segments(path, lesson_id="test", max_segments=2)
        assert len(segments) == 2
        assert segments[0].seg_id == "test#s1"
        assert segments[1].seg_id == "test#s2"

    def test_file_not_found(self) -> None:
        with pytest.raises(FileNotFoundError, match="not found"):
            asr_jsonl_to_segments("/nonexistent/file.jsonl", lesson_id="test")

    def test_end_always_positive(self, tmp_path: Path) -> None:
        """If end == start after truncation, ensure end > start."""
        lines = [
            {"start": 10.0, "end": 10.1, "text": "brief", "confidence": 0.9},
        ]
        path = _write_jasonl(lines, tmp_path)
        segments = asr_jsonl_to_segments(path, lesson_id="test")
        assert segments[0].start == 10
        assert segments[0].end == 11  # max(int(10.1), 10+1) = 11


class TestIngestAsrJsonl:
    def test_ingest_round_trip(self, tmp_path: Path) -> None:
        path = _write_jasonl(_SAMPLE_LINES, tmp_path)
        store: SQLiteStore = SQLiteStore(":memory:")
        segments = ingest_asr_jsonl(store, path, lesson_id="test_lesson")

        assert len(segments) == 3
        # Verify through store
        stored = store.segments_for_lesson("test_lesson")
        assert len(stored) == 3
        assert stored[0].seg_id == "test_lesson#s1"
        assert stored[0].text == _SAMPLE_LINES[0]["text"]

    def test_ingest_empty_jsonl_raises(self, tmp_path: Path) -> None:
        path = _write_jasonl([], tmp_path)
        store: SQLiteStore = SQLiteStore(":memory:")
        with pytest.raises(ValueError, match="zero valid segments"):
            ingest_asr_jsonl(store, path, lesson_id="test")
