# sett-2-stabilize-v2 — Sprint 2 END (Day 08-14 cumulative)

## Summary

Sprint 2 closes **PARTIAL** with honest integrity flag. Zero new regressions vs sprint-1 baseline. 5 blockers closed (target 3). Benchmark 3.95 → 4.17 claimed (+0.22); integrity-adjusted ~3.2–3.5 (see finding below).

## Scope

- Sprint contract scaffolding (Harness 2.0) Day 08–14
- 5 blockers burned (BLOCKER-003, 004, 005, 008, 010)
- ADR-004 DashboardShell data source (Edge Function proxy decision)
- Idempotent watermark fix (BLOCKER-010 root-caused Day 13)
- E2E spec 13 (Vision scaffold) + spec 14 (Dashboard-v2 smoke) added
- Dashboard shell scaffold + hash route wiring
- claude-mem save wire helper + smoke test
- Sprint Review + Retrospective + sett-3 kickoff contract skeleton

## Metrics (Day 14 close)

| Metric | Sprint-1 baseline | Sprint-2 actual | Target |
|--------|-------------------|-----------------|--------|
| Tests PASS | 12164 | 12166 (+2) | ≥12164 ✅ |
| Build time | ~83s | 62–115s | <120 ✅ |
| CoV consistency | 3x PASS | **5x PASS** zero flaky | 3x ✅ |
| Engine semantic diff | 0 | 0 | 0 ✅ |
| PZ v3 violations | 0 | 0 | 0 ✅ |
| Blockers closed | — | 5 | ≥3 ✅ |
| E2E spec count | 12 | 22 | ≥14 ✅ |
| Benchmark (claimed) | 3.95 | 4.17 | ≥4.5 ❌ |
| Auditor avg | 7.35 | **7.11** | ≥7.5 ❌ |

## ⚠️ Integrity Finding (Day 14 discovery)

**TL;DR**: E2E specs 01-10 are stale relative to current `/` route. CI e2e.yml workflow has been masking failures via `|| echo "::warning::..."` pattern, causing job to return success while tests actually fail. Previous benchmark claims of `e2e_pass_rate 1.0 (283/283)` were **FALSE**.

**Root cause**: commit `222b630` (G44-PDR) introduced `<WelcomePage>` license gate on `/` root. Specs 01-10 predate this and expect direct vetrina access.

**Scope**:
- Issue is PRE-EXISTING, not introduced by sprint-2
- Impact: sprint-1 + sprint-2 benchmarks inflated by ~0.6-1.0 pts
- CI masking pattern must be removed (sprint-3 P0)
- Specs 01-10 need update to navigate past WelcomePage (sprint-3 P0)

**Full disclosure**: docs/audit/day-14-audit.md

## Test plan

- [x] CoV 5x vitest: 5/5 PASS 12166 zero flaky ✅
- [x] Build: PASS 1m 2s, zero dirty files post-build ✅ (watermark idempotent fix Day 13 holding)
- [x] Engine lock: 0 semantic diff ✅
- [x] PZ v3 invariants: 0 violations ✅
- [~] Playwright smoke: **KNOWN FAIL** on specs 01-10 (integrity finding, pre-existing)
- [x] Benchmark full-mode: run, result in `automa/state/benchmark.json` Day 14 commit
- [ ] Deploy prod: **BLOCKED pending Andrea approval + E2E fix plan**

## Commits sett-2 (16)

- `157555d` sett-2 Day 01 CI unblock
- `1b7f36d` sett-2 Day 02 (4 blockers closed, 12164 baseline)
- `4f00b00`, `63d6920`, `ed49e52`, `5bc367a`, `7ff1504` sett-2 Day 03
- `297e969`, `8b97720`, `54513b3`, `ded2e19`, `bdb1fa7` sett-2 Day 04
- `3754025`, `9bce063`, `41019fd` sett-2 Day 05
- `8adb7d3`, `c890311`, `81d3748` sett-2 Day 06 (watermark root-cause, ADR-004, benchmark full)
- Day 14 final commit: pending (this PR)

## Andrea required decisions

1. **BLOCKER-011 NPM approval** (5 days silent) — approve, deny, or defer
2. **PR merge strategy** — merge as-is with integrity disclosure OR block until sprint-3 Day 01 spec fix
3. **Deploy prod timing** — post-merge immediate OR after sprint-3 Day 02 fixes
4. **ADR-004 5 open questions** — to unblock Dashboard Phase 1

## Files changed

16 commits touching:
- `automa/team-state/sprint-contracts/day-{08..14}-contract.md`
- `automa/team-state/sprint-contracts/sett-2-sprint-contract.md` + `sett-3-sprint-contract.md` (draft)
- `docs/audit/day-{08..14}-audit.md`
- `docs/handoff/2026-04-21-*.md`
- `docs/architectures/ADR-004-dashboardshell-data-source.md`
- `docs/sprint-reviews/sett-2-review.md`
- `docs/retrospectives/sett-2-retro.md`
- `e2e/13-vision.spec.js`, `e2e/14-dashboard-v2-smoke.spec.js`
- `scripts/add-signatures.js` (idempotent watermark fix)
- `src/components/dashboard/DashboardShell.jsx` (scaffold)
- `src/App.jsx` (hash route wiring for `#dashboard-v2`)
- `automa/team-state/blockers.md` (5 closures + 1 new)
- `automa/state/velocity-tracking-sett-2.json`
- `automa/state/benchmark.json`
- `automa/state/claude-progress.txt`

## Not in scope (deferred to sprint-3)

- Dashboard Phase 1 functional (Edge Function + hook)
- E2E spec 01-10 update (integrity fix)
- CI e2e.yml unmasking
- Benchmark.cjs regex audit (git_hygiene + e2e_pass_rate)
- Accessibility WCAG tooling
- Worker uptime probe
- UNLIM latency log pipeline
- Bundle dynamic-import refactor
- Vercel AI SDK 5 integration (NPM-dependent)

## Next sprint

See `automa/team-state/sprint-contracts/sett-3-sprint-contract.md` (DRAFT).
