# Sprint Contract Day 01 sett-2 — mar 21/04/2026

**Sprint**: sett-2-stabilize-v2 (day 1/7)
**Branch**: feature/sett-2-stabilize-v2
**Format**: Harness 2.0 (Anthropic Apr 2026)
**Parent**: `automa/team-state/sprint-contracts/sett-2-sprint-contract.md`

## Focus Day 01

**Sprint Planning day + immediate P0 carry-over closure**. Per Scrum, Day 1 = planning. Per carry-over, 3 P0 tasks triviali-to-fix closable same-day.

## Tasks (4 atomic)

### P0-1 Sprint 2 contract + Day 01 contract + standup + backlog

**Acceptance**:
- `automa/team-state/sprint-contracts/sett-2-sprint-contract.md` written (this file's parent)
- `automa/team-state/sprint-contracts/sett-2-day-01-contract.md` written (this file)
- `docs/standup/2026-04-21-sett-2-day-01-standup.md` written
- `automa/team-state/product-backlog.md` written (BLOCKER-004 closure)

**Risk**: documentation-heavy, low code risk.

### P0-2 BLOCKER-005 no-regression-guard --dry-run

**Acceptance**:
- `scripts/cli-autonomous/no-regression-guard.sh` accepts `--dry-run` flag
- Dry-run exit 0 without running vitest
- Manual test: `bash no-regression-guard.sh --dry-run` → fast return
- BLOCKER-005 status CLOSED in blockers.md

**Risk**: trivial 10-min fix, low risk.

### P0-3 Baseline snapshot sett-2 + CoV 3x

**Acceptance**:
- `npx vitest run` executed 1x baseline capture
- Record `baseline_tests_sett2`: N in state
- Build PASS verify (`npm run build`)
- Benchmark fast-mode update `node scripts/benchmark.cjs --fast`
- Report `docs/audit/sett-2-day-01-baseline.md`

**Risk**: vitest ~90-180s. CoV 3x deferred Day 03 (not Day 01 per scope).

### P1-1 Self-audit Day 01 20-dim matrix

**Acceptance**:
- `docs/audit/day-01-sett-2-audit-2026-04-21.md`
- 20-dim table (tests, bench, E2E, PZ v3, deploy, git, CI, coverage, npm audit, Lighthouse, LLM latency, Sentry, MCP calls, etc.)
- 4-grading (design/originality/craft/functionality)
- Auto-critica ≥5 gap
- Verdict READY/PARTIAL

## Success Metrics (4 grading Day 01)

- Design quality target: 7.0 (planning doc quality)
- Originality target: 5 (process work, low originality)
- Craft target: 7.5 (contract format discipline)
- Functionality target: 8 (actual blocker closure)
- **Target media Day 01**: 7.0/10

## Out of Scope Day 01

- NO dashboard feature code
- NO 152 dirty files triage (Day 02-03)
- NO Vision E2E CoV (Day 03)
- NO T1-005 routing (later in sprint)
- NO BLOCKER-007/008 post-merge (Day 02 after main state clear)

## Definition of Done Day 01

- Tests preserved ≥12164
- Build PASS
- 5+ artifacts written (contract sprint, contract day, standup, backlog, audit)
- BLOCKER-005 CLOSED
- Zero PZ v3 violations
- Zero engine semantic diff
- Commit atomic + pushed

## Stop Conditions Day 01

- Quota 429
- Context compact 3x
- Blocker 5-retry-fail

## MCP target

- claude-mem save_obs: 3+ (sprint start, Day 01 end, each P0 close)
- context7 query-docs: 1+ (Harness 2.0 doc refresh)
- serena smart_explore: 2+ (codebase structure for backlog)
- supabase list_edge: 0 (no Supabase work Day 01)

Floor Day 01: **6 MCP calls minimum**.
