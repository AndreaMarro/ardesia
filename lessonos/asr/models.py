"""ASR data models — SpeechSegment for timestamped transcription output."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterator


@dataclass(frozen=True)
class SpeechSegment:
    """A single speech segment from ASR output.

    Attributes:
        start: Start time in seconds (float).
        end: End time in seconds (float).
        text: Transcribed text (may be empty for silence-only segments).
        confidence: Model confidence (0.0–1.0), or 0.0 if unavailable.
        speaker: Optional speaker label (unused in v0 — no diarization yet).
    """

    start: float
    end: float
    text: str = ""
    confidence: float = 0.0
    speaker: str | None = None

    def to_dict(self) -> dict:
        return {
            "start": round(self.start, 3),
            "end": round(self.end, 3),
            "text": self.text,
            "confidence": round(self.confidence, 4),
            "speaker": self.speaker,
        }

    @classmethod
    def from_dict(cls, d: dict) -> SpeechSegment:
        return cls(
            start=float(d["start"]),
            end=float(d["end"]),
            text=str(d.get("text", "")),
            confidence=float(d.get("confidence", 0.0)),
            speaker=d.get("speaker"),
        )


def segments_to_jsonl(segments: list[SpeechSegment], output_path: str) -> None:
    """Write a list of SpeechSegment to a JSONL file (one dict per line).

    Args:
        segments: Ordered list of speech segments.
        output_path: Path to write the JSONL file.
    """
    import json

    with open(output_path, "w", encoding="utf-8") as f:
        for seg in segments:
            f.write(json.dumps(seg.to_dict(), ensure_ascii=False) + "\n")


def segments_from_jsonl(path: str) -> Iterator[SpeechSegment]:
    """Yield SpeechSegment from a JSONL file, one per line.

    Args:
        path: Path to JSONL file.
    """
    import json

    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield SpeechSegment.from_dict(json.loads(line))
