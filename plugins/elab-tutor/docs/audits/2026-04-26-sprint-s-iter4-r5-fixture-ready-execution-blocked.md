---
sprint: S
iter: 4
type: blocker doc
date: 2026-04-26 (autonomous loop tick 7)
status: R5 fixture READY (50/50 valid JSON), execution BLOCKED on env
---

# Sprint S iter 4 — R5 Stress Fixture READY, Execution Blocked

## Context

Iter 4 P0 A3 per SPEC §7: execute R5 stress 50-prompt run on deployed Edge Function `unlim-chat`. Target ≥90% PASS overall, ≥80% per-category.

Iter 3 gen-test-opus shipped runner skeleton + 10 seed prompts. Tick 6 autonomous loop expanded fixture 10→50 per ADR-011 distribution. 50/50 valid JSON.

## Blocker

`scripts/bench/run-sprint-r5-stress.mjs` exits with:

```
ERROR: SUPABASE_ANON_KEY env var REQUIRED for Edge Function R5 stress.
       Re-run: SUPABASE_ANON_KEY=<key> node scripts/bench/run-sprint-r5-stress.mjs
```

Edge Function authentication requires 3 headers:
- `apikey` (Supabase anon key — public, embedded in `src/services/api.js` line 22 as fallback)
- `Authorization: Bearer <SUPABASE_ANON_KEY>` (same key)
- `X-Elab-Api-Key` (ELAB-specific gate, **NOT public**)

`.env` file access **blocked by safety hook** (`PreToolUse/Bash: blocca accesso a .env e .git internals` per CLAUDE.md). Autonomous orchestrator cannot read keys.

## Status

| Component | Status |
|-----------|--------|
| R5 fixture 50 prompts | ✅ Ready (`scripts/bench/r5-fixture.jsonl`) |
| R5 runner | ✅ Ready (`scripts/bench/run-sprint-r5-stress.mjs`) |
| Scoring weights ADR-011 | ⚠️ Architect designed, runner uses placeholder |
| Edge Function deployed | ✅ Live `elab-unlim` (commit a22b24d) |
| Auth keys env | ❌ Blocked (safety hook) |
| Execution | ⏳ Pending Andrea or env-aware session |

## Resolution path (Andrea action required)

Andrea has 2 options:

### Option 1 — manual run (5 min)
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
export SUPABASE_ANON_KEY="$(grep VITE_SUPABASE_EDGE_KEY .env | cut -d= -f2)"
export ELAB_API_KEY="$(grep VITE_ELAB_API_KEY .env | cut -d= -f2)"
node scripts/bench/run-sprint-r5-stress.mjs
# Output: scripts/bench/output/r5-stress-{report,responses,scores}-<TS>.{md,jsonl,json}
```

### Option 2 — schedule remote agent (autonomous)
Use `/schedule` skill: routine that exports keys via Andrea-approved secret store, runs R5 nightly, posts report to `docs/audits/`.

## R0 baseline for comparison (iter 3 result)

| Metric | R0 (10 prompts iter 3) | R5 target (50 prompts iter 4) |
|--------|------------------------|-------------------------------|
| Overall PASS | 91.80% | ≥90% |
| Per-category PASS min | varies | ≥80% |
| `plurale_ragazzi` | 9/10 (90%) | expect ≥9/10 |
| `citation_vol_pag` | 2/10 (20%) ⚠️ | expect ≤4/10 (architecture issue, not prompt) |
| `safety_warning` | 4/10 (?) | expect ≥5/6 with new prompts |

## Iter 5+ implications

- IF R5 ≥90% PASS overall → Box 9 lifts 0.7→1.0, Sprint 6 Day 39 ClawBot dispatcher gate UNBLOCKED
- IF 85-90% → re-iterate prompt v3→v4 + Capitoli map expansion
- IF <85% → emergency rollback BASE_PROMPT v3→v2, regression analysis

## Score impact iter 4

Box 9 status: R5 fixture FULL (50 prompts) ready. Execution pending. Lift 0.5→0.7 (preparation done, execution pending).

Score iter 4 current: ~5.4/10. R5 execution would lift to ~5.7-6.0/10 if PASS gate hit.

## Honesty caveat

This audit documents WORK READY but NOT EXECUTED. Score reflects preparation, NOT validated stress test result. Iter 5+ must verify actual ≥90% PASS — DO NOT assume.
