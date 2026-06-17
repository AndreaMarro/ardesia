"""ASR pipeline orchestrator — convert → transcribe → write JSONL.

Ties together ffmpeg conversion and faster-whisper transcription into
a one-call pipeline for processing lecture audio files.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

from lessonos.asr.convert import convert_to_wav
from lessonos.asr.models import segments_to_jsonl
from lessonos.asr.transcribe import (
    transcribe_with_fallback,
)

logger = logging.getLogger(__name__)


def run_asr_pipeline(
    audio_path: str,
    output_dir: str,
    *,
    model: str = "large-v3-turbo",
    fallback_model: str = "medium",
    language: Optional[str] = None,
    vad: bool = True,
) -> str:
    """Run the full ASR pipeline on a single audio file.

    1. Convert audio to 16kHz mono WAV (via ffmpeg).
    2. Transcribe with faster-whisper (VAD on, fallback on failure).
    3. Write speech.segment JSONL to output_dir.

    Args:
        audio_path: Path to input audio (m4a, mp3, etc.).
        output_dir: Directory for WAV and JSONL output.
        model: Primary whisper model size.
        fallback_model: Fallback model if primary fails.
        language: Language code (auto-detect if None).
        vad: Enable VAD filtering (default True).

    Returns:
        Path to the output JSONL file.

    Raises:
        FileNotFoundError: If audio_path does not exist.
        RuntimeError: If any pipeline step fails.
    """
    audio = Path(audio_path)
    if not audio.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Step 1: convert to WAV (skip if already a WAV file)
    if audio.suffix.lower() in (".wav", ".wave"):
        logger.info("Input %s is already a WAV file — skipping ffmpeg conversion.", audio.name)
        wav_path = str(audio)
    else:
        logger.info("Converting %s to 16kHz mono WAV ...", audio.name)
        wav_path = convert_to_wav(str(audio), str(out_dir))

    # Step 2: transcribe
    logger.info(
        "Transcribing %s (model=%s, fallback=%s, VAD=%s) ...",
        Path(wav_path).name,
        model,
        fallback_model,
        vad,
    )
    segments = transcribe_with_fallback(
        wav_path,
        primary_model=model,
        fallback_model=fallback_model,
        language=language,
        vad=vad,
    )
    logger.info("Got %d speech segments.", len(segments))

    # Step 3: write JSONL
    # Clean stem: strip _16k_mono suffix if present (handles re-run on existing WAV)
    stem = audio.stem.replace(" ", "_").replace("(", "").replace(")", "")
    if stem.endswith("_16k_mono"):
        stem = stem[: -len("_16k_mono")]
    jsonl_path = str(out_dir / f"{stem}.speech.segment.jsonl")
    segments_to_jsonl(segments, jsonl_path)
    logger.info("Segments written to %s", jsonl_path)

    return jsonl_path
