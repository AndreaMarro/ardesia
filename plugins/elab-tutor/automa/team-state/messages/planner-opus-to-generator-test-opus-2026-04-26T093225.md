---
from: planner-opus
to: generator-test-opus
ts: 2026-04-26T093225
sprint: S
iter: 2
priority: P1
blocking: false
---

## Task

You own test scaffold + e2e atoms for Task A + Task B + Task C (R0 baseline). 4 atoms direct + Task C standalone. Read each atomic file in `automa/tasks/pending/` for full spec.

## Atoms assigned

### Task A test scaffolds (TDD red-green pattern)

1. **ATOM-S2-A-02** — `tests/unit/supabase/capitoli-loader.test.ts` for buildCapitoloPromptFragment (1.5h, RED before A-01)
2. **ATOM-S2-A-04** — `tests/unit/supabase/principio-zero-validator.test.ts` for 12 PZ rules (1.5h, RED before A-03)
3. **ATOM-S2-A-07** — `tests/integration/unlim-chat-prompt-v3.test.ts` integration test for wire-up (2h, depends ATOM-S2-A-06 from generator-app-opus)

### Task B e2e

4. **ATOM-S2-B-04** — `tests/e2e/11-modalita-citazioni-inline.spec.js` Playwright e2e (2h, depends B-01+B-02+B-03)

### Task C (Sprint R0 baseline) — standalone

5. **Task C from contract**: 
   - Adapt `scripts/runpod-r0-bench.mjs` → Render endpoint (or curl 10 prompts via shell script)
   - Run `node scripts/bench/score-unlim-quality.mjs --responses=<file> --fixture=scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl`
   - File ownership: `scripts/bench/run-sprint-r0.sh` (NEW), `automa/team-state/messages/test-r0-results-<TS>.md` (output)
   - Estimate 3-4h
   - CoV: 3x re-run, variance <5%
   - Output verdetto: PASS ≥85% / WARN 70-84% / FAIL <70%

## Total estimate

10-11h owned by you. Iter 2 target window 2 days. Realistic.

## File ownership reminder (RIGID)

You may modify ONLY:
- tests/unit/supabase/capitoli-loader.test.ts (NEW)
- tests/unit/supabase/principio-zero-validator.test.ts (NEW)
- tests/integration/unlim-chat-prompt-v3.test.ts (NEW)
- tests/e2e/11-modalita-citazioni-inline.spec.js (NEW)
- scripts/bench/run-sprint-r0.sh (NEW)

DO NOT TOUCH:
- src/ or supabase/functions/ (generator-app-opus owns)
- docs/ or CLAUDE.md (scribe-opus owns)
- automa/tasks/ (planner-opus owns; you write to messages/ only)

## Dependency timing

```
TIMELINE iter 2:
T+0  → A-02, A-04 (RED phase, write tests)         ← parallel with gen-app
T+0  → Task C (Sprint R0 baseline)                  ← parallel, independent
T+2h → A-01, A-03 land from gen-app → tests GREEN
T+4h → A-05, A-06 land → A-07 integration test
T+6h → B-01..B-05 land → B-04 e2e

Notes:
- A-07 BLOCKS until A-06 lands. Don't write before — use the time on Task C.
- B-04 BLOCKS until B-01+B-02+B-03 land. Same — fill time with Task C.
```

## Coordination with generator-app-opus

For RED-GREEN handshake:
- Write A-02 first → notify gen-app via message → gen-app implements A-01 → re-run A-02 → GREEN
- Same A-04 → A-03
- For A-07 + B-04 you wait for gen-app completion message

## CoV per atom

- 3x `npx vitest run <file>` PASS
- Full suite baseline ≥12498
- For B-04 e2e: 1x `npx playwright test tests/e2e/11-*.spec.js` PASS locally (or graceful skip if no dev server)
- For Task C: 3x re-run scoring, variance <5% across runs

## Honesty caveats

- Task C R0 baseline runs on Render endpoint (https://elab-galileo.onrender.com) — 18s cold start. Plan 30s timeout per call + warmup ping first.
- R0 baseline measured BEFORE A-06 wire-up lands → captures CURRENT state for delta comparison post-wire-up. If A-06 lands during your bench, document timestamp.
- e2e B-04 may fail without local dev server. Use `test.skip` graceful pattern, document in spec header.
- If Together AI fallback gating becomes priority, defer Task C R0 baseline to iter 3 — flag to planner-opus immediately.
- BUDGET WARNING: 10-11h is tight for iter 2 (target 2 days). Task C is 3-4h alone. If overload, drop B-04 to iter 3 (gen-app finishes wire-up without e2e gate, manual smoke OK).

## Output expected

Per atom done: write atom-result message to `automa/team-state/messages/generator-test-opus-to-<recipient>-<TS>.md`. For Task C, write final results message with verdetto + numerical scores.

Massima onesta zero compiacenza. NO inflated PASS count, NO false GREEN.
