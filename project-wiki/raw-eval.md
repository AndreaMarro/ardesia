# Raw-Transcript Eval — Pipeline end-to-end on raw text (M7 P1)

## What

`lessonos/eval/realtime_raw.py` provides `run_raw_transcript_eval(raw_text)`
— the full LessonOS pipeline over raw, non-segmented prose:

1. Chunks raw text with `chunk_raw_text()` (rule-based, ZERO-LLM)
2. Persists chunks as Segments via `_ingest_chunk_result()`
3. Assembles Lesson Capsule via LLM (or mock)
4. Measures groundedness + citation-excerpt-accuracy (same metrics as M5)
5. Reports quality metrics + failure modes

## Quality metrics

| Metric | Descrizione |
|---|---|
| `groundedness_score` | Frazione di citazioni con seg_id validi |
| `excerpt_accuracy_score` | Frazione di excerpt substring del segmento target |
| `num_chunks` | Quanti chunk prodotti dal chunker rule-based |
| `num_topics` | Quanti topic identificati dal LLM |
| `num_concepts` | Quanti concetti estratti |
| `chunks_with_topics` | Ratio chunks/topics (~1.0 = LLM non astrae) |
| `failure_modes` | Tuple di stringhe che descrivono anomalie automatiche |

## Failure modes automatici

| Condizione | Failure mode | Causa probabile |
|---|---|---|
| topic > chunk | Over-splitting | LLM produce topic senza corrispondenza chunk |
| topic == chunk (entrambi >1) | One-topic-per-chunk | LLM re-labels chunks invece di astrarre |
| concept >= chunk*2 | Over-extraction | Troppi concetti per pochi chunk |

## Files

- `lessonos/eval/realtime_raw.py` — `run_raw_transcript_eval()`, `RawTranscriptEvalReport`, `_ingest_chunk_result()` (`file:line`)
- `tests/test_realtime_eval_raw.py` — 18 test (`file:line`)
- `docs/eval/real-transcript-report.md` — report failure modes onesto (`file:line`)

## Links

- M7 P1 order: `COORDINATION.md:18` (Andrea via Claude — eval onesto su raw)
- Chunker: `project-wiki/raw-ingestion.md`
- Eval metrics: `project-wiki/eval-metrics.md`
