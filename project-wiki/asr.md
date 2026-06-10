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

## Real transcription results (Prima lezione, 2026-06-10)

**Method:** `transcribe_with_fallback(language='it')` via direct call (not `run_asr_pipeline` — Claude PLAN-CHECK correction, as `run_asr_pipeline` double-converts and produces wrong filename from the already-16k WAV stem).

**Model:** `large-v3-turbo` int8 CPU, beam_size=5, VAD enabled. 71min audio → ~2.5h inference time on Mac Mini 16GB.

**Output:** `~/maestro-data/teoria-segnali-2021/derived/asr/Prima_lezione_teoria_dei_segnali.speech.segment.jsonl`
- **1351 segments**, 153KB, timestamps 0.0s–4254.48s (70.9min)
- **Monotonicity**: 100% — all segments have non-overlapping, non-inverted timestamps. Verified via `bin/verify-transcription.sh`.
- **VAD coverage**: 312s total gap (7.3%) — typical for lecture pauses.

### Content quality assessment

| Metric | Value | Interpretation |
|--------|-------|---------------|
| Mean confidence | 0.731 | Good for CPU int8 |
| Segments >= 0.7 conf | 1022 (75.6%) | Solid majority |
| Low conf (<0.3) | 23 (1.7%) | ~10 garbled (fr/en/zh mixed at ~9min) |
| "segnal" hits | 167 | Core topic coverage |
| "energia"/"potenza" | 6/7 | Lecture segment ~42min on energy/power |
| "rettangolo" | 4 | Rectangular signal discussion |
| "frequenza" | 11 | Frequency domain discussion |
| "sinc"/"triangolo" | 0 | Not detected — either not in recording or missed |

### Honest limitations

1. **sinc, triangolo** — 0 hits in 1351 segments. These are expected from Appunti #1 (segnali elementari). Either the recording doesn't cover them, or the lecturer used different words (e.g. "impulso triangolare" not caught as "triang").
2. **Noise burst at ~9min** — cluster of garbled segments (Oltre His seront, Aufeta tratta, Tutt民 community). Brief interference or lecturer code-switching.
3. **Segment 3** — "Qualcosa oppure non avendo" is incomplete; typical VAD fragmentation at speech onset.
4. **Last segments** — "questo" [4253s], "risultato" [4254s]; lecture trailing off.

**Verdict:** Usable for M0 capsule pipeline (T4b). Content is clearly Teoria dei Segnali (signal definition, parameters, energy/power, rectangular signals). Not word-perfect (~2% low-quality) but sufficient for grounded extraction. T4b will further validate via the grounding invariant (every citation seg_id must resolve to a real segment).

### Verification script

`bin/verify-transcription.sh` — Python-only (no bc/jq dep), checks: file exists, timestamps monotonic, duration, spot-check first/last segments, confidence distribution, multi-aspect PASS/FAIL verdict. 3 real bugs found and fixed by Claude Code review (opus-4-8): (1) `bc -l` false PASS on missing dep, (2) short-file crash, (3) overclaiming verdict on single metric.
