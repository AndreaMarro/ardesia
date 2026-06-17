# Sprint Contract Day 11 — sett-2 Day 04

**Cumulative Day**: 11
**Sprint-local Day**: sett-2 Day 04
**Sprint**: sett-2-stabilize-v2
**Branch**: `feature/sett-2-stabilize-v2`
**Format**: Harness 2.0
**Parent**: `sett-2-sprint-contract.md`
**Previous**: day-10 (score 7.25/10, 4 commits, CoV 12166, zero reg)

## Context Recovery

Day 10 closed clean:
- 12166 tests PASS, CoV 3/3 consistent
- Vision E2E scaffold landed (13-vision.spec.js)
- Dashboard scaffold landed (DashboardShell shell only, NON wired in App.jsx)
- Day 11 original scope: Vercel AI SDK 5 UNLIM tools + Dashboard route wiring
- **BLOCKER OPEN**: npm deps `ai + zod` pending Andrea approval (CLAUDE.md Rule 13)

## Day 11 Focus — DEBT-ONLY PIVOT

Per `day11_blocker_prompt` state: "Andrea approve npm install ai zod OR pivot Day 11 to debt-only (dashboard route + velocity schema + watermark filter)".

Andrea not responding in headless loop → **apply pivot**. Focus areas:
1. Dashboard route wiring (zero new deps, consume existing DashboardShell)
2. Velocity tracking Day 10 entry backfill + schema evolution sett-2
3. Pre-commit watermark filter (P3 debt — prevent copyright-only noise regressions)

Rationale: 3 tasks progressano debt senza violare Rule 13 + preparano Day 12 for Vercel AI SDK green-light (if Andrea approves).

## Tasks (4 atomic, all debt)

### P0-1 Dashboard route wiring `dashboard-v2` hash
- **Files**: `src/App.jsx` (edit)
- **Scope**: add `dashboard-v2` to VALID_HASHES + lazy import DashboardShell + render gated inside ErrorBoundary. NO regression on existing `dashboard` (→ StudentDashboard).
- **Acceptance**:
  1. `#dashboard-v2` renders DashboardShell placeholder
  2. Existing `#dashboard` still → StudentDashboard
  3. Build PASS
  4. No new vitest failures
- **Owner**: inline DEV
- **Est**: 20min

### P0-2 Velocity tracking Day 10 backfill + sett-2 schema
- **Files**: `automa/state/velocity-tracking.json` (edit) OR new `automa/state/velocity-tracking-sett-2.json` (new)
- **Scope**: current file sett-1 only (Day 01-07). Sett-2 metrics not tracked. Add sett-2 section (Day 08-10 = cumul Day 08/09/10 already closed) or split file.
- **Decision**: split file (sett-2 dedicated) to avoid schema bloat. Link via `current_sprint` pointer.
- **Acceptance**:
  1. New file `velocity-tracking-sett-2.json` written
  2. Day 08/09/10 backfilled from handoff/audit docs
  3. Day 11 entry stub created (filled end-day)
  4. Schema versioned (schema_version: 2)
- **Owner**: inline TPM
- **Est**: 30min

### P0-3 Pre-commit watermark filter script
- **Files**: `scripts/pre-commit-watermark-filter.sh` (new)
- **Scope**: script that detects staged files with ONLY copyright date-bump diff (regex `^[+-].*©.*Andrea Marro.*\d{2}/\d{2}/\d{4}$`) and auto-restores those files to HEAD before commit. Mitigates BLOCKER-003 pattern (152 dirty → 96% copyright noise).
- **Not in scope**: husky install (no husky dir present). Script standalone, invokable manually OR via `scripts/cli-autonomous/push-safe.sh` pipeline.
- **Acceptance**:
  1. Script detects copyright-only diff correctly
  2. Script restores file (git checkout HEAD --) for those with ONLY watermark changes
  3. Dry-run mode supported
  4. Unit test smoke (bash test with fixture)
- **Owner**: inline DEV
- **Est**: 45min

### P0-4 Audit matrix 20-dim day-11 + state + handoff
- **Files**: `docs/audit/day-11-audit.md` (new), `docs/handoff/2026-04-21-day-11-end.md` (new), `automa/state/claude-progress.txt` (update)
- **Scope**: CoV 5x vitest, 20-metric table, 4-grading, MCP log, blockers reconcile.
- **Acceptance**:
  1. CoV 5x consistent
  2. Test count ≥ 12166 baseline
  3. Build PASS
  4. 20 metric table filled
  5. 4-grading justified
- **Owner**: inline TPM + auditor
- **Est**: 30min

## Success Metrics (4-grading Harness 2.0)

| Criterion | Target Day 11 | Rationale |
|-----------|---------------|-----------|
| Design Quality | 7.0 | debt work, incremental hygiene |
| Originality | 4.5 | low novelty (velocity schema + watermark filter = tooling) |
| Craft | 8.0 | scripts + schema evolution, solid discipline |
| Functionality | 7.5 | 3 debt items land, zero regression |
| **Media Target** | **6.75/10** | equal Day 10 floor |

## Anti-Regression Gates (hard)

1. Test count ≥ 12166 (Day 10 baseline)
2. Build PASS
3. CoV 5x vitest consistent (upgraded from 3x per CLAUDE.md audit progression)
4. Engine semantic diff = 0 (src/components/simulator/engine/* locked)
5. PZ v3 violations = 0
6. Dashboard `dashboard-v2` route renders placeholder, zero JS error console
7. Velocity JSON valid (schema check)

## Fix Budget Minimum

Day 11 must close ≥3 gaps:
- G1 Dashboard placeholder wired (T1-005 incremental)
- G2 Velocity sett-2 schema evolution
- G3 Watermark pre-commit filter (BLOCKER-003 mitigation)

## Out of Scope Day 11

- Vercel AI SDK integration (blocked on npm deps approval)
- 5 UNLIM tools generateText (blocked)
- Dashboard feature data wiring / Supabase queries (Day 12+)
- Vision full Gemini API (cost, Day 12+)
- Husky install (out, manual script only)

## Open Risks

- R1 (P3): watermark filter false positive → script dry-run mode mandatory first
- R2 (P3): dashboard-v2 route collides with existing hash parser → test manually
- R3 (P3): velocity schema bump breaks downstream tools that read sett-1 file → keep sett-1 file untouched, only add sett-2 new file

## Stop Conditions

- Standard LOOP stop (sett end day 14, quota 429, context compact 3x, blocker hard 5 retry)
- Day 11 specific: if watermark filter breaks working tree → STOP + revert

## Claude-Mem Save

End-day save observation:
- title: "Day 11 debt-only complete"
- tags: ["day-11", "sett-2", "pdr-ambizioso", "debt", "pivot"]
- content: "Pivot debt: dashboard route wiring + velocity sett-2 schema + watermark filter. Blocker npm deps → Day 12 revisit."
