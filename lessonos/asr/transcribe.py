"""faster-whisper transcriber — wraps the faster-whisper ASR model.

Provides:
- transcribe_audio: Single-file transcription with VAD support.
- Supported model sizes: tiny, base, small, medium, large-v3-turbo (default).

Model is downloaded lazily on first use via HuggingFace Hub (local cache).
All processing runs on-device (CPU/GPU), zero cloud.
"""

from __future__ import annotations

import logging
import math
from typing import Any, Optional

from lessonos.asr.models import SpeechSegment

logger = logging.getLogger(__name__)

# Model size -> file size estimate (GB, approximate)
MODEL_SIZES = {
    "tiny": 0.1,
    "base": 0.3,
    "small": 0.8,
    "medium": 1.5,
    "large-v3-turbo": 1.8,
}

# Recommended default based on 16GB RAM Mac Mini
DEFAULT_MODEL = "large-v3-turbo"
FALLBACK_MODEL = "medium"


def _get_model(model_size: str):
    """Load faster-whisper model (cached download via HF Hub).

    Args:
        model_size: One of 'tiny', 'base', 'small', 'medium', 'large-v3-turbo'.

    Returns:
        A faster_whisper.WhisperModel instance.

    Raises:
        ImportError: If faster-whisper not installed.
        ValueError: If model_size is unrecognized.
    """
    try:
        from faster_whisper import WhisperModel
    except ImportError as e:
        raise ImportError(
            "faster-whisper not installed. Run: uv add faster-whisper"
        ) from e

    if model_size not in MODEL_SIZES:
        raise ValueError(
            f"Unrecognized model size: {model_size!r}. "
            f"Choose from {list(MODEL_SIZES)}"
        )

    # Use CPU with int8 quantization (16GB RAM, no GPU required)
    return WhisperModel(
        model_size,
        device="cpu",
        compute_type="int8",
        download_root=None,  # HF cache dir
    )


def transcribe_audio(
    wav_path: str,
    model_size: str = DEFAULT_MODEL,
    *,
    vad: bool = True,
    language: Optional[str] = None,
    beam_size: int = 5,
) -> list[SpeechSegment]:
    """Transcribe a WAV file using faster-whisper.

    Args:
        wav_path: Path to 16kHz mono WAV file.
        model_size: Whisper model size (default large-v3-turbo).
        vad: Enable VAD (Silero) filtering (default True).
        language: Language code (e.g. 'it' for Italian). Auto-detect if None.
        beam_size: Beam size for decoding (default 5).

    Returns:
        List of SpeechSegment with timestamps and transcribed text.

    Raises:
        FileNotFoundError: If wav_path does not exist.
        RuntimeError: If transcription fails or model loading fails.
    """
    import os

    if not os.path.isfile(wav_path):
        raise FileNotFoundError(f"WAV file not found: {wav_path}")

    try:
        model = _get_model(model_size)
    except (ValueError, ImportError):
        raise

    segments: list[SpeechSegment] = []
    try:
        seg_iter, _info = model.transcribe(
            wav_path,
            language=language,
            beam_size=beam_size,
            vad_filter=vad,
            # VAD parameters tuned for lecture audio
            vad_parameters={
                "threshold": 0.5,
                "min_speech_duration_ms": 250,
                "min_silence_duration_ms": 500,
                "speech_pad_ms": 400,
            },
        )

        for seg in seg_iter:
            segments.append(
                SpeechSegment(
                    start=seg.start,
                    end=seg.end,
                    text=seg.text.strip(),
                    confidence=round(math.exp(seg.avg_logprob), 4),
                )
            )
    except Exception as e:
        raise RuntimeError(
            f"Transcription failed for {wav_path} (model={model_size}): {e}"
        ) from e

    return segments


def transcribe_with_fallback(
    wav_path: str,
    primary_model: str = DEFAULT_MODEL,
    fallback_model: str = FALLBACK_MODEL,
    **kwargs: Any,
) -> list[SpeechSegment]:
    """Transcribe with automatic fallback to a smaller model.

    Tries primary_model first. If transcription fails (model OOM, download
    failure, etc.), falls back to fallback_model.

    Args:
        wav_path: Path to 16kHz mono WAV file.
        primary_model: Model to try first (default large-v3-turbo).
        fallback_model: Fallback model (default medium).
        **kwargs: Additional arguments passed to transcribe_audio.

    Returns:
        List of SpeechSegment.
    """
    try:
        return transcribe_audio(wav_path, model_size=primary_model, **kwargs)
    except RuntimeError as e:
        logger.warning(
            "Primary model %s failed: %s — falling back to %s",
            primary_model,
            e,
            fallback_model,
        )
        return transcribe_audio(wav_path, model_size=fallback_model, **kwargs)
