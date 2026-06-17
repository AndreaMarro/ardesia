# Sprint Contract Day 10 — mar 21/04/2026

**Cumulative Day**: 10
**Sprint-local Day**: sett-2 Day 03
**Sprint**: sett-2-stabilize-v2
**Branch**: `feature/sett-2-stabilize-v2`
**Format**: Harness 2.0 (Anthropic Apr 2026)
**Parent**: `automa/team-state/sprint-contracts/sett-2-sprint-contract.md`
**Previous**: day-09 closed 4 blockers (003/004/007/008) + CoV 3x 12164 baseline

## Focus Day 10

Per sett-2 roadmap Day 03: **Vision E2E CoV 3x + MCP discipline log + Dashboard scaffold prep**.

Hygiene + process sprint. No major feature. Ship:
- Vision E2E spec (13-vision.spec.js) baseline scaffold, CoV 3x PASS target
- MCP usage log documented (floor 10 calls)
- Dashboard component scaffold (directory + index, NO feature logic)
- Audit matrix 20-dim day-10
- Zero regression vs 12164 baseline

## Tasks (5 atomic)

### P0-1 Vision E2E spec scaffold
- **File**: `tests/e2e/13-vision.spec.js` (new)
- **Scope**: smoke test flow — navigate lavagna → trigger "guarda circuito" → stub screenshot capture → verify event emission. NOT full Gemini Vision API call (out of scope, cost).
- **Acceptance**: 3 test cases minimum, CoV 3x PASS with Playwright. Skip on prod (uses `test.skip` if `BASE_URL` includes prod domain).
- **Owner**: team-tester
- **Est**: 45min

### P0-2 MCP discipline log day-10
- **File**: `docs/audit/mcp-log-day-10.md`
- **Content**: tabella 10+ MCP calls durante Day 10 con purpose + result summary. Categories: claude-mem, serena, supabase, Vercel, Sentry, Playwright, context7.
- **Acceptance**: 10+ entries, each with timestamp + tool + input_summary + output_summary + decision_made.
- **Owner**: inline TPM (populate throughout day)
- **Est**: 15min fine-giorno

### P0-3 Dashboard scaffold (NON feature)
- **Files**: `src/components/dashboard/index.js`, `src/components/dashboard/DashboardShell.jsx`, `src/components/dashboard/DashboardShell.module.css`
- **Scope**: SHELL ONLY — export empty component that renders "Dashboard — coming soon" card. NO data wiring, NO Supabase, NO charts. Feature logic Day 11+.
- **Acceptance**: `import Dashboard from 'src/components/dashboard'` works, renders placeholder, 1 vitest import-smoke test, zero regression test count.
- **Owner**: team-dev
- **Est**: 30min

### P0-4 Audit matrix 20-dim day-10
- **File**: `docs/audit/day-10-audit.md`
- **Content**: 20-metric table (test count / bench / bundle / CoV / E2E / etc) + fix budget (3+ gap chiusi) + 4-grading
- **Owner**: team-auditor
- **Est**: 20min end-of-day

### P0-5 State + handoff + claude-mem save
- **Files**: `docs/handoff/2026-04-21-day-10-end.md`, `automa/state/claude-progress.txt`, `automa/state/velocity-tracking.json`
- **Content**: end-day handoff + state bump to day-10 + velocity entry Day 10
- **Owner**: inline TPM
- **Est**: 15min

## Success Metrics (4-grading)

- Design Quality: 7.5 (scaffold-first discipline, no YAGNI feature)
- Originality: 5.0 (vision spec novelty; scaffold low)
- Craft: 7.5 (CoV 3x discipline, docs consistency)
- Functionality: 7.0 (scaffold works, no feature regression)
- **Target media Day 10**: 6.75/10

## Anti-Regression Gates

1. Test count ≥ 12164 (baseline preserved)
2. Build PASS
3. CoV 3x vitest consistent
4. Engine semantic diff = 0 (src/components/simulator/engine/* locked)
5. PZ v3 violations = 0 (BASE_PROMPT unmodified)
6. Dashboard scaffold import-smoke PASS (no runtime error)

## Out of Scope Day 10

- Dashboard data wiring / Supabase / charts (Day 11+ se scope)
- Vision full Gemini API call E2E live (cost, Day 11 Vercel AI SDK integration)
- T1-005 feature logic (Day 11-12 if scope holds)
- Engine modifications (forever locked)
- Major UNLIM refactor (sett-3+)

## Stop Conditions

- IF test count < 12164 → REVERT + investigate
- IF build FAIL → STOP + diagnose
- IF CoV 3x flaky (diff counts) → document + fix root cause before commit
- IF quota 429 persistent → save state + stop gracefully

## Dispatch Plan

1. team-tester (sync) → Vision E2E spec + CoV 3x run
2. team-dev (sync, parallel ok con tester) → Dashboard scaffold
3. inline TPM → MCP log populate + standup + velocity
4. team-auditor (sync, end-of-day) → 20-dim audit

**Max dispatch target**: 3 Opus sync (tester, dev, auditor).
