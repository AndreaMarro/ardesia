# Sprint Contract Day 12 — sett-2 Day 05

**Cumulative Day**: 12
**Sprint-local Day**: sett-2 Day 05
**Sprint**: sett-2-stabilize-v2
**Branch**: `feature/sett-2-stabilize-v2`
**Format**: Harness 2.0
**Parent**: `sett-2-sprint-contract.md`
**Previous**: day-11 (score 7.1/10, 3 commits, CoV 5x 12166 PASS, zero reg)

## Context Recovery

Day 11 closed clean (debt pivot):
- 12166 tests PASS, CoV 5x consistent
- Dashboard `#dashboard-v2` route wired → DashboardShell (commit `297e969`)
- Pre-commit watermark filter landed (commit `8b97720`, 126 lines + 65 lines smoke test)
- Velocity sett-2 backfilled Day 08-10 (commit `54513b3`)
- Blocker open carry-over: **NPM_DEPS_APPROVAL_PENDING** (ai + zod for Vercel AI SDK)
- Day 11 honest floor miss: MCP calls direct = 0 (target ≥10)

## Day 12 Focus — CONTINUED DEBT-ONLY PIVOT + MCP discipline recovery

Per sett-2 Sprint Contract Day 05: "T1-005 Dashboard continue + E2E | spec extension".
Per state `day12_next_focus`: "E2E dashboard-v2 smoke + benchmark full-mode + claude-mem save wire + watermark filter CI integration + DashboardShell data ADR".

Andrea still silent on NPM approval → **continue debt pivot**. Priority: fix Day 11 floor miss (MCP save observations wire) + extend Dashboard E2E coverage + CI watermark integration verify.

## Tasks (4 atomic, all debt / discipline)

### P0-1 Claude-mem MCP save observations wire (fix Day 11 floor miss)
- **Files**: `scripts/cli-autonomous/claude-mem-save.sh` (new), `scripts/cli-autonomous/end-day-handoff.sh` (edit if exists)
- **Scope**: create helper script invokable by end-day-handoff + commit hooks that dispatches `mcp__plugin_claude-mem_mcp-search__*` save calls with structured observation (day, sha, test_count, bench, blockers). Document usage in `docs/workflows/claude-mem-save-usage.md`.
- **Rationale**: Day 11 MCP calls direct = 0 (floor miss vs target 10). Automate MCP save at key lifecycle points (pre-commit, end-day, sett-end) so discipline enforced automatically, not by agent memory.
- **Note**: script is wrapper — actual MCP call happens via Claude CLI in interactive sessions. Script prepares payload to file, documents instructions, emits env vars.
- **Acceptance**:
  1. Script exists + executable + bash smoke test passes
  2. Usage doc (< 80 lines) written with examples
  3. end-day-handoff.sh invokes it (or documents invocation)
  4. Day 12 handoff includes MCP observation payload file ready to dispatch
- **Owner**: inline DEV
- **Est**: 35min

### P0-2 E2E dashboard-v2 smoke spec (Playwright spec 14)
- **Files**: `tests/e2e/14-dashboard-v2.spec.js` (new)
- **Scope**: Playwright spec that navigates `localhost:5173/#dashboard-v2`, asserts DashboardShell renders placeholder (data-testid or text "Dashboard"), no console errors, no uncaught exceptions. Align pattern with `13-vision.spec.js` (production cost guard if needed).
- **Rationale**: sett-2 Sprint Contract Day 05 explicitly calls "E2E spec extension". Dashboard route landed Day 11 but zero E2E coverage. Spec 14 closes gap.
- **Acceptance**:
  1. Spec file exists with `@smoke` tag
  2. 3+ smoke assertions (render, no-error, URL persist)
  3. Playwright config already supports new spec (auto-glob)
  4. CoV 1x local run PASS (or documented skip rationale if dev server needs separate process)
- **Owner**: inline TESTER
- **Est**: 30min

### P0-3 Watermark filter CI integration verify
- **Files**: `docs/audit/watermark-filter-ci-day-12.md` (new), `.github/workflows/e2e.yml` (inspect only)
- **Scope**: verify pre-commit watermark filter behavior in CI context. Since CI doesn't invoke pre-commit hook directly (push-time only), document: (a) filter runs locally pre-push, (b) CI relies on filter having already filtered upstream, (c) CI gate = `git diff --name-only` matching watermark pattern → fail-fast if unfiltered noise reached remote.
- **Decision**: propose CI lint gate in doc (not implement — needs Andrea review). For Day 12: write analysis + propose enforcement path.
- **Acceptance**:
  1. Doc analyzes current state (pre-commit local only)
  2. Doc proposes CI gate (sample yml snippet, not applied)
  3. Doc lists risk + mitigation
  4. Script `scripts/pre-commit-watermark-filter.sh` re-tested dry-run against current `git status -s` output → report count of watermark-only dirty files that WOULD be filtered
- **Owner**: inline DEV
- **Est**: 30min

### P0-4 Audit matrix 20-dim day-12 + state + handoff
- **Files**: `docs/audit/day-12-audit.md` (new), `docs/handoff/2026-04-21-day-12-end.md` (new), `automa/state/claude-progress.txt` (update), `automa/state/velocity-tracking-sett-2.json` (update Day 12)
- **Scope**: CoV 5x vitest, 20-metric table, 4-grading, MCP log with actual counts, blockers reconcile, fix budget (≥3).
- **Acceptance**:
  1. CoV 5x consistent (12166 floor)
  2. Test count ≥ 12166 baseline
  3. Build PASS
  4. 20 metric table filled with fresh numbers
  5. 4-grading justified
  6. MCP calls log shows ≥10 (floor from sett-2 contract)
- **Owner**: inline TPM + auditor
- **Est**: 30min

## Success Metrics (4-grading Harness 2.0)

| Criterion | Target Day 12 | Rationale |
|-----------|---------------|-----------|
| Design Quality | 7.2 | +0.2 vs Day 11 — MCP discipline recovery + E2E coverage extension |
| Originality | 5.0 | +0.5 vs Day 11 — CI analysis novel, MCP automation pattern fresh |
| Craft | 8.0 | = Day 11 — scripts + specs + docs discipline solid |
| Functionality | 7.8 | +0.3 vs Day 11 — 3 debt items land, zero reg, actionable E2E coverage |
| **Media Target** | **7.0/10** | +0.1 vs Day 11 (7.1 was special — recovery to normal floor) |

## Anti-Regression Gates (hard)

1. Test count ≥ 12166 (Day 11 baseline)
2. Build PASS
3. CoV 5x vitest consistent
4. Engine semantic diff = 0
5. PZ v3 violations = 0
6. Dashboard `#dashboard-v2` still renders (Day 11 invariant)
7. New Playwright spec syntactically valid (config loads)
8. Watermark filter script still passes its own smoke test

## Fix Budget Minimum

- ≥3 gaps closed (carry-over or new-discovered during audit)
- Budget candidates:
  - MCP floor miss Day 11 (P0-1 addresses)
  - E2E Dashboard coverage gap (P0-2 addresses)
  - Watermark filter CI enforcement gap (P0-3 addresses)

## MCP Discipline Target (sett-2 floor recovery)

- **Target ≥10 MCP calls direct** (explicit tool invocations logged in audit)
- **Eligible tools**: `mcp__plugin_claude-mem_mcp-search__*`, `mcp__plugin_serena_serena__*`, `mcp__plugin_context7_context7__*`, `mcp__plugin_playwright_playwright__*`
- **Log format**: `docs/audit/day-12-audit.md` table MCP tool / count / purpose

## Dispatch plan

- Morning (now): TPM inline standup + P0-3 doc + P0-1 script
- Mid: P0-2 Playwright spec (inline tester pattern)
- Late: P0-4 audit + handoff + push + claude-mem save observation

Total: ~2h inline work, zero agent dispatch (keep context lean, tasks are discrete + simple).

## Out of Scope Day 12

- Vercel AI SDK 5 tools (blocked by NPM_DEPS_APPROVAL)
- Dashboard feature logic (slip to Day 13+)
- Benchmark full-mode run (deferred Day 14 per state)
- Simulator engine any edit (locked)

## Stop Conditions

- 4 P0 done → immediate Day 13 next loop iteration
- Blocker hard 5-retry-fail → stop + handoff partial
- Quota 429 persist → stop
- Context compact 3x → stop + handoff
