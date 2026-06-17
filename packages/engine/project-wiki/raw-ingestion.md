# Raw Ingestion — Rule-based chunking from raw text/VTT/SRT to Segments (M7 P0)

## What

`lessonos/ingest/chunker.py` transforms arbitrary prose (lecture transcripts,
.txt, .vtt, .srt) into `ChunkResultItem` chunks with auto-generated `seg_id`,
preserving optional timestamps from VTT/SRT cues.

ZERO-LLM — purely rule-based, no model calls.

## API

- `chunk_raw_text(text, source_id='raw_lesson', max_chars=800)` — text by paragraph/sentence/window
- `chunk_vtt(vtt_text, source_id='vtt_lesson')` — WebVTT cues with `start`/`end` seconds
- `chunk_srt(srt_text, source_id='srt_lesson')` — SubRip cues with `start`/`end` seconds

## Chunking strategy

1. **VTT/SRT** — parse timed cues via regex, each cue = 1 segment
2. **Paragraph** — double-newline boundaries
3. **Sentence** — `. ! ?` + uppercase letter/quote
4. **Hard window** — `_hard_split()` at word boundary near `max_chars`; no-space force-split

## Files

- `lessonos/ingest/__init__.py` — exports (`file:line 1-2`)
- `lessonos/ingest/chunker.py` — ChunkResult, ChunkResultItem, chunk_raw_text, chunk_vtt, chunk_srt, helpers (`file:line 1-298`)
- `tests/test_ingest_chunker.py` — 52 test (`file:line 1-417`)
- `fixtures/raw_transcript/lesson_derivatives.txt` — PLACEHOLDER realistic lecture prose (4225 chars)
- `fixtures/raw_transcript/lesson_derivatives.vtt` — PLACEHOLDER VTT captions (5 cues)
- `fixtures/raw_transcript/README.md` — note about PLACEHOLDER status

## Edge cases covered

- Empty input → empty result
- Whitespace only → empty
- Single word → 1 chunk
- VTT with only header → empty
- SRT with no text content → empty
- Long text without sentence breaks → hard-split at word boundary
- HTML tags in VTT → stripped
- Multi-line VTT cue → single chunk

## Links

- M7 order: `COORDINATION.md:14` (Claude-SAYS 2026-06-08)
- Fixtures README: `fixtures/raw_transcript/README.md`
