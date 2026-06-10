# LessonOS ASR Module — faster-whisper pipeline for real audio transcription

## Overview

The ASR (Automatic Speech Recognition) module provides on-device transcription of lecture audio using faster-whisper (CTranslate2 backend, no GPU required). Zero cloud — all processing on the Mac Mini.

## Architecture

```
audio.m4a → [ffmpeg] → 16kHz mono WAV → [faster-whisper + VAD Silero] → speech.segment JSONL
                ↓                              ↓
        lessonos/asr/convert.py       lessonos/asr/transcribe.py
                ↓                              ↓
                                     lessonos/asr/pipeline.py (orchestrator)
```

### Module structure (`lessonos/asr/`)

- **`convert.py`** — `convert_to_wav(input_path, output_dir)` calls ffmpeg subprocess to produce 16kHz mono WAV. Caches: skips if output already exists. Cleans up partial WAV on ffmpeg failure.
- **`transcribe.py`** — `transcribe_audio(wav_path, model_size, vad, language)` wraps faster-whisper. Default model: `large-v3-turbo` int8 CPU (1.8GB download, ~1.5x realtime on M1/M2). `transcribe_with_fallback()` catches RuntimeError and retries with `medium` (1.5GB).
- **`pipeline.py`** — `run_asr_pipeline(audio_path, output_dir)` is the one-call orchestrator: convert → transcribe → write JSONL.
- **`models.py`** — `SpeechSegment` frozen dataclass (start, end, text, confidence, speaker) with JSONL serialization.

### VAD (Voice Activity Detection)

Built-in Silero VAD via faster-whisper's `vad_filter=True`. Parameters tuned for lecture audio:
- threshold=0.5, min_speech_duration=250ms, min_silence_duration=500ms, speech_pad=400ms

### Model sizes

| Model | Size | Speed vs realtime (CPU int8) |
|-------|------|------------------------------|
| tiny  | 0.1GB | ~10x |
| base  | 0.3GB | ~7x |
| small | 0.8GB | ~4x |
| medium | 1.5GB | ~2x |
| large-v3-turbo | 1.8GB | ~1.5x |

## Usage

```python
from lessonos.asr.pipeline import run_asr_pipeline

jsonl_path = run_asr_pipeline(
    "~/maestro-data/.../audio/Prima lezione.m4a",
    "~/maestro-data/.../derived/asr",
    model="large-v3-turbo",
    language="it",  # auto-detect if None
    vad=True,
)
```

## Confidence

Confidence is `math.exp(avg_logprob)` from faster-whisper, clamped by construction to [0, 1]. Typical values: 0.3–0.8 for lecture audio (Italian).

## Tests (`tests/test_asr.py`)

28 tests, all mock (no model downloads, no ffmpeg, no real audio):
- Models: dict roundtrip, defaults, unicode, empty segments
- Converter: file not found, skip cache, ffmpeg args, ffmpeg failure, cleanup on failure, find_ffmpeg priority
- Transcriber: file not found, invalid model size, successful mocks, kwargs assertions (vad_filter, language), fallback on RuntimeError only (narrow catch)
- Pipeline: file not found, full pipeline mocks, output dir creation
- Edge cases: unicode text, negative start, empty segments
