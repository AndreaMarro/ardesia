# Day 09 Dirty Files Triage — BLOCKER-003 Resolution

**Date**: 2026-04-21 mar
**Sprint**: sett-2-stabilize-v2 (cumulative Day 09)
**Input**: 152 dirty files carry-over Sprint 1 (reported `blockers.md` BLOCKER-003)

## Findings

### Total dirty files measured Day 09

- Modified src/: 71 files (post engine revert)
- Modified automa/ + docs/ + misc: 9 (heartbeat + blockers.md + contracts in progress)
- Untracked docs/ + scripts/ + public/: ~80 (PDR 48-56 + Tea + prompts + loop scripts + manifest.json)

### Root cause analysis

**96%+ of src/ modifications = automated copyright watermarker**.

- Total diff lines: 229 insertions + 227 deletions = 456 lines
- Non-copyright lines: **20** (heartbeat tick + Day 09 blockers.md edits I made)
- Copyright pattern: `© Andrea Marro — 17/04/2026 → 21/04/2026 — ELAB Tutor — Tutti i diritti riservati`
- Extensions touched: `.js`, `.jsx`, `.css`, `.module.css`
- Files across: components/admin, common, lavagna, simulator (hooks/panels/utils, NOT engine), tutor, services, styles, utils, data

### Engine files (HARD LOCK)

Originally 4 dirty engine files with copyright-only diffs:
- `src/components/simulator/engine/AVRBridge.js`
- `src/components/simulator/engine/CircuitSolver.js`
- `src/components/simulator/engine/PlacementEngine.js`
- `src/components/simulator/engine/avrWorker.js`

**Action Day 09**: `git checkout HEAD -- src/components/simulator/engine/` executed. All 4 engine files reverted to origin state. Engine lock invariant preserved per CLAUDE.md Section "File critici".

## Decision

### Option A — DISCARD copyright bumps (SELECTED)

**Rationale**:
- Copyright watermarker semantics = non-semantic (comment only)
- Mass-touch of 70+ files = diff noise in git history, obscures real changes
- Risk: hook may re-run and re-dirty later (cosmetic loop)
- Per CLAUDE.md "Surgical" principle: touch minimum. 70-file copyright bump = anti-pattern
- Engine lock already enforces no-touch in engine/; same principle applies repo-wide for cosmetic mass edits
- Watermarker appears to be automated (date bump consistent across unrelated files) — if needed for legal claim, re-run at release time, not mid-sprint

**Selected Day 09**: restore affected src/* files to HEAD to preserve clean diff surface. Preserve engine lock + minimize sprint-local drift.

### Option B — ACCEPT copyright bumps (NOT SELECTED)

- Would add 456 diff lines of zero semantic value to Day 09 commit
- Violates "atomic commit" principle
- Would need re-run every day copyright script fires

### Option C — DEFER (NOT SELECTED)

- BLOCKER-003 explicitly assigned to Day 09-10 per Day 08 handoff
- Further defer = process drift

## Execution plan Day 09

1. `git checkout HEAD -- src/` — restore all 71 src/ copyright-only modified files
2. Keep legitimate Day 09 edits: `automa/team-state/blockers.md` (BLOCKER-003/004/007/008 status updates), `automa/state/heartbeat` (auto), `docs/audit/day-09-*.md` (new), `docs/standup/2026-04-21-day-09-standup.md` (new)
3. Untracked docs/scripts/PDR files from Sprint 1 → stage selectively OR leave untracked until owner decision
4. Re-verify `git diff --stat` post-cleanup should show ONLY Day 09 legitimate edits

## Untracked files category (~80)

| Category | Count | Action |
|----------|-------|--------|
| `docs/pdr-ambizioso/PDR_GIORNO_*.md` | 21 | Stage (sprint planning artifacts Andrea-authored) |
| `docs/pdr-ambizioso/REFERENCES-MASTER.md` | 1 | Stage |
| `docs/pdr-ambizioso/giorni/SPRINT-2-ADDENDUM.md` | 1 | Stage |
| `docs/prompts/*.md` | 4 | Stage (DAILY-CONTINUE, SESSION-HELPER, SETUP-FONDAZIONI, SPRINT-2-INFRA) |
| `docs/standup/2026-04-21-day-02,2026-04-21-sett-2-day-01.md` | 2 | Stage (ancillary standups) |
| `docs/standup/2026-04-23,24.md` | 2 | Stage |
| `docs/sprints/` | dir | Stage |
| `docs/tea/ONBOARDING-TEA-COMPLETO.md` | 1 | Stage |
| `docs/workflows/` | dir | Stage (AGILE-METHODOLOGY referenced by contract) |
| `docs/superpowers/plans/...` | 1 | Stage |
| `public/manifest.json` | 1 | Stage (PWA root-cause fix for BLOCKER-009 — pending Andrea deploy) |
| `scripts/cli-autonomous/*.sh` | 2 | Stage (loop-forever + stress-test Sprint 2 scope) |
| `scripts/warmup-local.js` | 1 | Stage (Render warmup helper) |

## Outcomes

- Engine invariant preserved
- Copyright-only noise purged from Day 09 commit
- Untracked legitimate artifacts staged with clear rationale
- BLOCKER-003 downgraded P1 → CLOSED (mass-discard + selective-stage pattern documented)
- Future mitigation: pre-commit hook to block commits where only-diff is copyright-comment (out of scope Day 09)

## Honesty note

Triage revealed "152 dirty" narrative overstated severity — 70+ files were cosmetic watermark bumps, not real drift. BLOCKER-003 P1 severity oversized in blockers.md. Correcting: mass-discard is safe, reversible (copyright hook re-runs). Real drift = 0 src semantic changes outside engine files.
