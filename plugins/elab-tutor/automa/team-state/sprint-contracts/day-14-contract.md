# Day 14 Sprint Contract — sett-2 Day 07 (SPRINT END GATE)

**Date**: 2026-04-21 (evening → 2026-04-22 morning per real clock)
**Branch**: `feature/sett-2-stabilize-v2`
**Cumulative Day**: 14
**Sprint Local Day**: 07 (sett-2 END)
**Contract Format**: Harness 2.0
**Gate Type**: END-WEEK SPRINT GATE (mandatory)

---

## Context

Day 13 closed 3 P0 atomic commits (watermark root-cause, ADR-004 Dashboard, benchmark full 4.17). BLOCKER-010 CLOSED. BLOCKER-011 (NPM approval) still OPEN 4 days. Self-score 7.4/10, benchmark 4.17/10 (+0.22 vs Day 12).

Day 14 = sett-2 SPRINT END. Mandatory end-week gate.

---

## Tasks (priority order)

### P0-1: State Recovery + Standup (5 min)
- Read claude-progress.txt Day 13
- Verify git clean, branch tip = 81d3748
- Read Day 13 handoff docs
- Verify Day 13 CI status (all 3 pushes green)

### P0-2: CoV 5x vitest Gate (~8 min)
- Run 5 consecutive `npx vitest run`
- Target: 5/5 PASS 12166 tests zero flaky
- Evidence capture: duration each run + diff
- Gate: if any run fails → STOP gate, regression investigation

### P0-3: Playwright Full E2E (~10 min)
- Run `npx playwright test` full suite
- Target: 283/283 PASS (match Day 13 benchmark proxy)
- Gate: if regressions > 0 → STOP gate, investigate

### P0-4: Build + Benchmark Full (~15 min)
- `npm run build` verify PASS
- `node scripts/benchmark.cjs --write` full-mode
- Target: benchmark ≥ 4.17 (no regression) ideally delta positive
- Gate: benchmark regression > 0.3 → investigate

### P0-5: 20-Dim Audit Day 14 (~15 min)
- Fresh metrics table with deltas vs Day 13
- Auto-critica ≥5 honest gaps
- 4-grading Harness 2.0

### P0-6: PR Create (HALT before merge — Andrea approval required)
- `gh pr create` from feature branch → main
- Title: "sett-2 stabilize v2 — Sprint Day 01-07 (baseline 12166, benchmark 4.17, ADR-004)"
- Body: full sett-2 summary with commits + scores + blockers + debt residual
- Wait for CI green + Andrea explicit approval to merge

### P1-7: Sprint Review + Retrospective Doc
- `docs/sprint-reviews/sett-2-review.md`
- `docs/retrospectives/sett-2-retro.md`
- Velocity sett-2 summary

### P1-8: Handoff Day 14 + sett-3 kickoff prep
- `docs/handoff/2026-04-21-day-14-sprint-end.md`
- Next sprint contract skeleton `automa/team-state/sprint-contracts/sett-3-sprint-contract.md`

### P2-9: [IF NPM APPROVED] Vercel AI SDK 5 scaffold start
- `npm install ai zod` (ONLY if Andrea approves during Day 14)
- Initial UNLIM tool-call wrapper sketch
- Move to sett-3 scope

### P2-10: [IF NPM NOT APPROVED] Debt continuation
- E2E spec 15 Dashboard shape stub
- `/dashboard-data` Edge Function mock per ADR-004
- Benchmark git_hygiene regex fix

---

## Success Metrics (4-grading target)

| Dimension | Target | How measured |
|-----------|--------|--------------|
| Design Quality | ≥ 7.0 | Contract clarity, gate completeness, rollback documented |
| Originality | ≥ 5.0 | Sprint retrospective adds insight, Day 14 pivot decisions |
| Craft | ≥ 8.0 | CoV 5x + Playwright + benchmark all with evidence, audit honesty |
| Functionality | ≥ 7.0 | Gate decision crisp, PR quality, no regression committed |

**Day 14 target avg**: ≥ 7.0/10 self-score; benchmark ≥ 4.17/10 (no regression).

---

## Gates (hard stops)

- CoV 5x not 5/5 PASS → investigate, no PR
- Playwright regressions → investigate, no PR
- Build fails → investigate, no PR
- Benchmark regression > 0.3 → investigate root cause
- Engine semantic diff ≠ 0 → FAIL (lock invariant)
- PZ v3 violations > 0 → FAIL
- CI red on HEAD after push → FAIL gate

---

## Rollback Plan

- If Day 14 gate discovers critical regression: revert last commit(s) on feature branch
- If PR created but Andrea denies merge: keep branch alive, sett-3 inherits
- If post-deploy stress fails: rollback via `vercel rollback` (NOT auto — Andrea confirms)

---

## MCP Discipline Floor

- Target ≥ 10 direct MCP calls Day 14 (Day 13 had 3 — below floor, flagged)
- Day 14 recovery via: context search, get_observations Day 12-13 timeline, sprint retrospective prep, github MCP for PR, Vercel MCP for deploy verification

---

## Stop Conditions (autonomous loop)

- Sprint gate naturally concludes → stop at PR-create, await Andrea merge approval
- Context compact 3x consecutive
- Blocker hard 5 retry fail
- Quota 429 persistent
- Irreversible action requires Andrea confirmation (PR merge, prod deploy, DB schema changes)

---

## Out of Scope

- sett-3 work beyond kickoff contract skeleton
- Any `npm install` without Andrea explicit approval
- Deploy prod without Andrea explicit approval
- Merge PR without Andrea explicit approval + CI green
