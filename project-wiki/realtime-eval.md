# Realtime Eval — P1 eval LLM REALE

`lessonos/eval/realtime.py` — esegue la pipeline LessonOS end-to-end con LLM REALE (o mock), poi misura groundedness e citation-excerpt-accuracy.

## Perché esiste

COORDINATION.md §23 P1: "eval LLM REALE: groundedness + citation-accuracy a campione con DeepSeek/Kimi reale su qualche fixture, logga costo."

Il modulo colma il gap tra:
- **Eval mock** (`test_cases.py`, `run_eval` con `MockProvider`): deterministico, gratis, veloce — ma non misura come si comporta il sistema con un LLM reale.
- **Eval reale** (`run_realtime_eval`): chiama Kimi (via `KimiProvider`) o un provider mock, costruisce la `LessonCapsule`, poi misura qualità con metriche esistenti.

## Funzionamento

`run_realtime_eval(lesson_id, fixture_root, router, model) -> RealtimeEvalReport`:

1. **Load fixture + ingest** — carica la fixture sample_path, ingesta segmenti per la lezione richiesta
2. **Router** — se non fornito, crea un `KimiProvider` (gated da `KIMI_API_KEY`); altrimenti usa il router passato
3. **CostLedger** — ogni chiamata LLM è wrappata (`_tracked_complete`) per tracciare token + costo
4. **Assembly** — chiama `assemble_lesson_capsule` con provider name risolto dinamicamente (kimi vs mock)
5. **Metriche** — `build_groundedness_metric` + `build_citation_excerpt_accuracy_metric` sulla capsule
6. **Report** — `RealtimeEvalReport` frozen con punteggi, costo, token, LLM calls

## Files

- `lessonos/eval/realtime.py` — modulo (`file:line 1-251`)
- `tests/test_realtime_eval.py` — 8 test: 7 mock (pass) + 1 live (skip se no key) (`file:line 1-280`)
- `lessonos/eval/__init__.py` — export `run_realtime_eval`, `RealtimeEvalReport`

## Costi

Ogni chiamata LLM è tracciata dal `CostLedger` (wrapper su `router.complete`). Mock calls: 0 token, $0 cost. Kimi calls: usage reali dalla API, stimati via `estimate_kimi_cost`. Il report finale include `total_cost_usd`, `total_tokens`, `llm_calls`.

## Test live (gated)

`test_live_kimi_produces_capsule_with_grounded_citations` in `test_realtime_eval.py` — esegue eval reale con Kimi se `KIMI_API_KEY` è impostata. Skippata altrimenti. Verifica: capsule prodotta, costo > 0, token > 0, ≥2 LLM calls.
