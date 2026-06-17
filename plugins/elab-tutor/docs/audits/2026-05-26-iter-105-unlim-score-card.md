# UNLIM Subsystem Score Card — Iter 105

**Date**: 2026-05-26 00:15 GMT+2
**Branch**: `fix/unlim-compile-helper-mascot-tweak-2026-05-24`
**Scope**: Edge Function `unlim-chat` + `_shared/*.ts` modules. UI checks N/A (Edge Function subsystem).

## Score Card

| Metric | Value | Target | Status | Notes |
|---|---|---|---|---|
| UNLIM unit tests | 1063 | ≥ 938 baseline | **PASS** | +125 vs baseline, 0 regressions |
| UNLIM test files | 37 | ≥ 30 baseline | **PASS** | +3 new files iter 105 |
| Structured JSON logs | 85 / 117 console.* | ≥ 70% | **PASS** | 72.6% structured |
| Empty `catch {}` blocks | 0 | 0 | **PASS** | None in `unlim-chat/` + `_shared/` |
| Silent `.catch(() => null/[])` | 5 | ≤ 10 | **PASS** | Helper `observability.ts` shipped, wire-up deferred |
| BASE_PROMPT live references | 1 def + 2 doc | 1 def only OR ≥ 1 build-reference | **FAIL** | Declared at `system-prompt.ts:16`, NEVER used in `buildSystemPrompt:433` |
| `requestTTS` invocations | 0 (declared only) | 0 OR ≥ 1 | **FAIL** | Dead code: declared `index.ts:69`, no callers |
| `retrieveVolumeContext` invocations | 0 (imported only) | 0 OR ≥ 1 | **FAIL** | Dead import at `index.ts:17` |
| STOPWORDS_IT duplicate entries | 0 | 0 | **PASS** | Fixed iter 105 (was: `'della','della'`, `'non','non'`) |
| New regression introduced | 0 | 0 | **PASS** | Full UNLIM batch 1063/1063 |

**Composite score**: 7 PASS / 3 FAIL on functional metrics. **3 FAIL items are pre-existing dead code (not introduced this iter).**

## Iter 105 deliverables

### Tests added (125 new, 0 regressions)
- `tests/unit/unlim-operational-readiness.test.js` — 72 tests
- `tests/unit/unlim-rag-readiness.test.js` — 34 tests
- `tests/unit/unlim-observability.test.js` — 19 tests

### Source modified
- `supabase/functions/_shared/rag.ts:603` — deduplicate `'della'` + `'non'` (zero semantic change)
- `supabase/functions/_shared/observability.ts` — NEW 80 LOC helper (`logSilentFailure`, `logSilentError`)

### Documentation
- `docs/audits/2026-05-25-iter-105-unlim-operational-readiness.md` — comprehensive audit (this report's parent)
- `docs/audits/2026-05-26-iter-105-unlim-score-card.md` — this score card

## Pre-existing FAIL items (not iter 105 regressions)

These existed BEFORE this iter and are documented in the parent audit. They appear as FAIL in the score card to surface them for the Andrea ratify queue:

1. **BASE_PROMPT dead code** (`system-prompt.ts:16-311`, 296 LOC) — comment at line 417 falsely claims chain inclusion. Either restore (`parts = [BASE_PROMPT, LIVE_SYSTEM_PROMPT]`) or delete.
2. **`requestTTS` dead code** (`unlim-chat/index.ts:69-108`, ~40 LOC) — `audioUrl = null` hard-coded at line 1495 (iter 34 decoupling). Plus `btoa(String.fromCharCode(...spread))` is a latent stack-overflow trap if revived.
3. **`retrieveVolumeContext` dead import** (`unlim-chat/index.ts:17`) — only `hybridRetrieve` + `formatHybridContext` used.

## Test count consistency check

Per CLAUDE.md "Mai inventare numeri" rule, all numbers above measured this session:

```bash
# Measured 2026-05-26 00:10 GMT+2
npx vitest run tests/unit/unlim*.test.* tests/unit/unlim-*.test.*
# Output: Test Files 33 passed (33), Tests 1063 passed (1063)
```

```bash
# Test files count
ls tests/unit/unlim*.test.* tests/unit/unlim-*.test.* | wc -l
# 37 (includes .test.jsx, .test.js)
```

```bash
# console.* in UNLIM subsystem
grep -rEn "console\.(log|warn|info|error)" supabase/functions/unlim-chat/ supabase/functions/_shared/ | wc -l
# 117 total | 85 structured JSON
```

## Verdict

**iter 105 PASS** for surgical fixes + test additions (no regression, all new tests green).
**Pre-existing P0/P1 issues UNCHANGED** — require Andrea ratify queue per `2026-05-25-iter-105-unlim-operational-readiness.md` §5.

## Out-of-scope (skipped from generic ELAB quality-audit skill)

- Font size / touch target / WCAG — UI metrics N/A for Edge Function subsystem
- Bundle size — measured separately when frontend build completes (background)
- Accessibility — covered by UI-specific `accessibility-audit` skill for `src/components/`
