# A1-iter43 — chat_thinking routing fix COMPLETED

**Date**: 2026-05-13
**Agent**: A1-iter43
**Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix`
**Mandate**: Fix iter 41 bench bug #2 — chat_thinking routing never triggers Pro+thinkingLevel.

## Summary

Added `THINKING_KEYWORDS` regex promotion to `routeModel()` in `supabase/functions/_shared/router.ts`. Deep-thinking prompts (approfondisci, spiegami nel dettaglio, in profondità, comprendere a fondo, metti a confronto, differenza tra X e Y) now return `'gemini-2.5-pro'`. Upstream `unlim-chat/index.ts:779` sets `thinkingLevel = 'medium'`, which the Vertex EU short-circuit at `llm-client.ts:392-398` already consumes to pick `gemini-2.5-pro` — full end-to-end wiring confirmed downstream (no changes needed at unlim-chat/index.ts or llm-client.ts per mandate).

## Files changed

- `supabase/functions/_shared/router.ts` — added `THINKING_KEYWORDS` regex (+19 LOC) + Pro promotion branch in `routeModel` (+5 LOC) + null-safety wrapper `safeMessage` + extended header comment iter 43. Total delta: +30 LOC, -5 LOC modified.
- `tests/unit/routeModel.test.js` — NEW 184 LOC, 30 unit tests covering:
  - Pro promotion (10 tests): approfondisci, spiegami nel dettaglio, analizza in profondità, analizza nel dettaglio, comprendere a fondo, metti a confronto, differenza tra X e Y, differenza fra X e Y (variant), case-insensitive, accent-loose "profondita".
  - Flash-Lite preserved (4 tests): "Cosa è un LED", greeting, "Aiuto", quiz answer.
  - Flash preserved (4 tests): "Spiega come funziona LED", "differenza tra LED" (generic), "Calcola la resistenza", PRO_KEYWORDS legacy diagnostics.
  - Vision path skips Pro (2 tests): deep-thinking + image → Flash, image + errors regardless of keywords.
  - Null-safety (5 tests): empty, undefined, null, non-string, missing circuitState.
  - Cost discipline (5 tests): bare "dettaglio", bare "confronto" (Flash), bare "profondità", "differenza X e Y" without tra/fra, bare "comprendere".

## Files NOT touched (per ownership constraint)

- `supabase/functions/unlim-chat/index.ts` — already wired correctly (line 779: `thinkingLevel = model === 'gemini-2.5-pro' ? 'medium' : undefined`).
- `supabase/functions/_shared/llm-client.ts` — Vertex short-circuit lines 392-398 already correct (`options.thinkingLevel ? 'gemini-2.5-pro' : ...`).

## CoV — 3x consecutive PASS

```
Run 1/3: 30/30 PASS (480ms)
Run 2/3: 30/30 PASS (561ms)
Run 3/3: 30/30 PASS (78ms)
```

Plus 3x router-subset CoV (routeModel + clawbot-template-router + nanobot-v2-router):

```
Run 1/3: 82/82 PASS (753ms tests, 19s wall)
Run 2/3: 82/82 PASS (350ms tests, 15s wall)
Run 3/3: 82/82 PASS (1.18s tests, 22s wall)
```

Zero flakiness. Legacy `nanobot-v2-router.test.js` still passes (re-implements router internals with preview model names, doesn't import actual `router.ts` — unaffected by changes).

## Vitest delta

- Baseline (`automa/baseline-tests.txt`): 13474 PASS
- iter 43 NEW tests: +30 (routeModel.test.js)
- Expected new baseline: **13504 PASS** (pending full vitest re-run by orchestrator)
- Zero regressions in router-related test files verified via 3x CoV.

## Edge-case bug found + fix

First test run had 1 FAIL: `"Analizza in profondità il circuito"` matched Flash instead of Pro. Root cause: JavaScript regex (non-`u` flag) treats `à` as a non-word char, so `\b` after `à` does not fire reliably — `\bin\s+profondit[àa]\b` missed inputs ending in the accented form before whitespace.

Fix: dropped the trailing `\b` on `in\s+profondit[àa]` and `analizza\s+...profondit[àa]` alternatives. Inline comment documents the rationale in `router.ts`. Re-run 30/30 PASS.

## Cost estimate — % queries promoted to Pro

Regex tight by design (each alternative is either a low-FP unigram like `approfondisci` or a verb+phrase pair like `spiegami nel dettaglio`). Estimated promotion rate **<5% of live traffic** based on:

- The 6 explicit deep-thinking unigrams/phrases are pedagogical/diagnostic markers rare in greeting/quiz traffic (70% Flash-Lite share by router design).
- Generic `differenza` traffic remains on Flash (FLASH_KEYWORDS) — only the explicit `differenza tra X e Y` deep-compare form promotes (sub-fraction).
- Vision requests never promote (Path A gate `!hasImages`).

Cost impact at <5% promotion rate, Pro ~5x Flash-Lite:
- Marginal cost lift per 100 chats: 95 × 1x + 5 × 5x = 120 cost-units vs baseline 100 → **+20% cost on chat budget**.
- Latency lift on promoted 5%: +8-12s thinking budget (deliberate, intent-matched).

If observed promotion rate exceeds 10% in iter 44 bench, tighten by removing `differenza tra/fra X e Y` from the regex (the broadest alternative).

## Cross-link

- Bug evidence: `docs/audits/2026-04-29/2026-05-13-iter-41-latency-bench-7-capabilities.md` (per mandate header).
- Vertex short-circuit consumer: `supabase/functions/_shared/llm-client.ts:392-398`.
- thinkingLevel setter: `supabase/functions/unlim-chat/index.ts:779`.

## Status

PASS-verified. Ready for orchestrator commit + full vitest re-run + iter 44 bench re-measurement on `chat_thinking` 10 probes to confirm Pro+thinkingLevel:medium now triggers as expected (+8-12s latency lift on promoted prompts vs iter 41 baseline 1991ms avg).
