# summarizer — Lesson Summary Generator (T6)

Genera riepiloghi markdown delle lezioni da una LessonCapsule, con citazioni verificate meccanicamente.

## API

`lessonos/summarizer.py`:

- `generate_lesson_summary(store, capsule, router, *, output_dir, provider, model) -> SummaryPack` — genera il riepilogo.
- `SummaryPack(files: dict[str, str])` — output in-memory (file_path → contenuto markdown).
- `_build_summary_prompt(capsule)` — prompt deterministico per MockProvider keying.
- `_parse_summary_response(raw)` — parser JSON robusto (code fence stripping, validazione struttura).
- `_validate_summary_citations(store, sections, lesson_id)` — reuses `graph/grounding.verify_citation`.
- `_render_summary_markdown(capsule, sections)` — markdown render con formato `[excerpt](seg_id)`.

## Testing

- 17 test in `tests/test_summarizer.py`
- `test_deterministic_mock_output`: assert **byte-per-byte** del markdown renderizzato (anti-tautologia)
- MockProvider chiave sul prompt esatto (deterministico)
- ValueError su: seg_id inesistente, cross-lesson, excerpt non-verbatim, malformed JSON

## LIVE run

DeepSeek `deepseek-chat` su 100 segmenti reali della Prima lezione → `~/maestro-data/teoria-segnali-2021/derived/wiki/prima_lezione.md` (6884 bytes).

## File

| File | Scopo |
|------|-------|
| `lessonos/summarizer.py` | summarizer module |
| `tests/test_summarizer.py` | 17 test |
