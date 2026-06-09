# Realtime Eval — P1 eval LLM REALE

`lessonos/eval/realtime.py` — esegue la pipeline LessonOS end-to-end con LLM REALE (o mock), poi misura groundedness e citation-excerpt-accuracy.

## Perché esiste

COORDINATION.md §23 P1: "eval LLM REALE: groundedness + citation-accuracy a campione con DeepSeek/Kimi reale su qualche fixture, logga costo."

Il modulo colma il gap tra:
- **Eval mock** (`test_cases.py`, `run_eval` con `MockProvider`): deterministico, gratis, veloce — ma non misura come si comporta il sistema con un LLM reale.
- **Eval reale** (`run_realtime_eval`): chiama DeepSeek (primario, via `DeepSeekProvider`) o Kimi (fallback), costruisce la `LessonCapsule`, poi misura qualità con metriche esistenti.

## Funzionamento

`run_realtime_eval(lesson_id, fixture_root, router, model) -> RealtimeEvalReport`:

1. **Load fixture + ingest** — carica la fixture sample_path, ingesta segmenti per la lezione richiesta
2. **Router** — se non fornito, crea un `DeepSeekProvider` (gated da `DEEPSEEK_API_KEY`, fallback a `KimiProvider` via `KIMI_API_KEY`); altrimenti usa il router passato
3. **CostLedger** — ogni chiamata LLM è wrappata (`_tracked_complete`) per tracciare token + costo
4. **Assembly** — chiama `assemble_lesson_capsule` con `defensive=True` (FM4, FM7)
5. **Metriche** — `build_groundedness_metric` + `build_citation_excerpt_accuracy_metric` sulla capsule
6. **Report** — `RealtimeEvalReport` frozen con punteggi, costo, token, LLM calls

`run_realtime_eval_n_runs(lesson_id, n, ...) -> MultiRunEvalReport`:
- Esegue N run indipendenti (ognuno con fresh store e fresh ingest)
- Restituisce distribuzione (min/mean/max) per groundedness, excerpt-accuracy, n_concepts

## Files

- `lessonos/eval/realtime.py` — modulo (`file:line 1-447`)
- `tests/test_realtime_eval.py` — 13 test: 12 mock (pass) + 1 live (skip se no key)
- `lessonos/eval/__init__.py` — export `run_realtime_eval`, `RealtimeEvalReport`, `MultiRunEvalReport`

## Costi

Ogni chiamata LLM è tracciata dal `CostLedger` (wrapper su `router.complete`). Mock calls: 0 token, $0 cost. DeepSeek calls: usage reali dalla API, stimati via `estimate_deepseek_api_cost`. Il report finale include `total_cost_usd`, `total_tokens`, `llm_calls`.

## Risultati LIVE (2026-06-16, DeepSeek-chat, 9 runs su 3 lezioni)

| Lezione | groundedness | excerpt_accuracy | n_concepts (media) | costo/run |
|---------|-------------|-----------------|-------------------|-----------|
| l1 (derivative) | 1.00 | 1.00 | 3.3 | $0.00016 |
| l2 (rules) | 1.00 | 1.00 | 4.0 | $0.00018 |
| l3 (integral) | 1.00 | 1.00 | 2.7 | $0.00015 |

**100% pass rate, zero hallucination failures.** Report completo: `docs/eval/real-transcript-report.md`.

## Fix emersi da LIVE

- **FM6**: `tuple(c.get("prerequisites") or [])` — gestisce `"prerequisites": null` nel JSON LLM
- **FM7**: `defensive=True` in `run_realtime_eval()` — capsule non crasha su malformed item

## CLI

`lessonos eval-real [--fixture PATH] [--lesson ID] [--n-runs N] [--live] [--model NAME]`

- Default: mock (nessuna chiave necessaria)
- `--live`: usa DeepSeek/Kimi reale (richiede `DEEPSEEK_API_KEY` in `.env`)
- `--n-runs N`: multi-run con distribuzione (default: 1)
- `--model NAME`: override model (default: deepseek-chat)

## Test live (gated)

`test_live_kimi_produces_capsule_with_grounded_citations` in `test_realtime_eval.py` — esegue eval reale con Kimi se `KIMI_API_KEY` è impostata. Skippata altrimenti.
