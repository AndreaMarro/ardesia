# Foundations Brutal Audit — 2026-04-21

## Auditor: team-auditor (Opus) + Andrea verification

## VERIFIED METRICS

| Metric | Claim | Actual | Verdict |
|--------|-------|--------|---------|
| Vitest | 12149 | 12149 (CoV 3/3) | ACCURATE ✅ |
| Build | PASS | PASS (77s) | ACCURATE ✅ |
| CLI scripts | 8 | 9 (under-claim) | ACCURATE ✅ |
| E2E specs | 12 files | 12 files, 31 tests, RUNNABLE via --config | ACCURATE ✅ |
| E2E real run | 3/3 | 3/3 PASS (11.1s) against prod | VERIFIED ✅ |
| Together 20/20 | 20/20 PZ v3 | verify-llm-switch.sh output | PLAUSIBLE |
| PZ v3 | 0 violations | 0 (1 false positive = prohibition text) | ACCURATE ✅ |
| Prod curl | 200 | 200 (1.05s) | VERIFIED ✅ |
| Benchmark | no claim | 4.06/10 (--fast, up from 2.77) | NOT PERSISTED |

## RED FLAGS

1. **9 unpushed commits** — work at risk if machine fails
2. **152 dirty files** — carry-over from prior sessions, not new regression
3. **benchmark.json not written** — --fast mode didn't persist, need --write
4. **no-regression-guard.sh** doesn't support --dry-run (prints error, exits 0)
5. **Dual Supabase project refs** — euqpdueopmlllqjmqnyb vs vxvqalmxqtezvgiboxyv unresolved
6. **Edge Function JWT 401** — cannot verify PZ v3 live via CLI curl

## AUDITOR CORRECTION

Auditor initially claimed "E2E specs BROKEN — testDir mismatch". This was WRONG.
- Root `playwright.config.js` points to `./e2e/` (old legacy specs)
- New `tests/e2e/playwright.config.js` points to `.` (= tests/e2e/) — CORRECT
- `package.json` `test:e2e` uses `--config tests/e2e/playwright.config.js` — CORRECT
- Verified: `npx playwright test --config tests/e2e/playwright.config.js --list` → 31 tests
- Verified: spec 01 runs 3/3 PASS (11.1s) against prod

## INFLATION DETECTION

- Vitest: ZERO inflation
- Build: ZERO inflation
- Scripts: NEGATIVE inflation (under-counted)
- E2E: ZERO inflation (auditor error corrected)
- PZ v3: ZERO inflation

**Overall inflation: NONE detected.**

## CORRECTED SCORE: 6.5/10

| Area | Score | Notes |
|------|-------|-------|
| Vitest infra | 8/10 | 12149, consistent, CoV 3x |
| Build pipeline | 8/10 | Works, reasonable time |
| CLI scripts | 7/10 | 9 scripts, --dry-run, safe |
| E2E testing | 6/10 | 12 specs work, assertions could be tighter |
| llm-client.ts | 6/10 | Clean MVP, needs circuit breaker for prod |
| Git hygiene | 3/10 | 152 dirty, 9 unpushed |
| Benchmark | 4/10 | 4.06 measured but not persisted |
| Documentation | 7/10 | 2 blueprints, 2 ADRs, tester report, reviewer verdict |

## GO/NO-GO FOR TUESDAY 22/04

**GO** with pre-sprint actions:
1. MUST: `git push` 9 unpushed commits (5 min)
2. MUST: `node scripts/benchmark.cjs --write` to persist baseline (5 min)
3. SHOULD: tighten E2E homepage assertions (15 min)
4. SHOULD: clarify canonical Supabase project ref
