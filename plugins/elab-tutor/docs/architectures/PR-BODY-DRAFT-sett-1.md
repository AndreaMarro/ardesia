# PR Body Draft — Sprint 1 sett-1-stabilize → main

**Branch**: feature/t1-003-render-warmup → main
**Type**: feature + docs + a11y + infra
**Size**: 29 commits, 7 days sprint

Use this body when running `gh pr create --base main --head feature/t1-003-render-warmup`.

---

## PR Title

```
feat(sett-1): stabilize foundations — Render warmup + Dashboard a11y + Vision E2E + JWT edge auth
```

## PR Body

```markdown
## Summary

Sprint 1 sett-1-stabilize closure. 7 days, 29 commits, foundations stabilized. Zero regression across 4 Vitest CoV runs (3x Day 06 + baseline Day 04). Auditor trend 6.5 → 7.75 (+1.25). Benchmark 2.77 → 3.95 (+1.18, target 6.0 missed but foundations prioritized).

## Key Changes

### T1-003 Render warmup cron
- `.github/workflows/render-warmup.yml` cron `*/10 * * * *` → ping Nanobot. Eliminates 18s cold start for docenti.
- Commit `4a48138` Day 02.

### Dashboard a11y WCAG AAA
- 19 loci color upgrade `#64748B → #475569` (slate-500 4.94:1 → slate-600 7.56:1).
- Structural audit pre-existing compliant: role=img 3, scope=col 24, aria-live 2, caption present.
- Commits `83f90d2`, `f25da24`.

### ADR-003 JWT 401 Edge Function auth
- Canonical dual-header pattern: `apikey` + `Authorization: Bearer $ANON_KEY`.
- `scripts/cli-autonomous/verify-edge-function.sh` smoke test script executable.
- Unblocks CLI testing (BLOCKER-001 CLOSED).
- Commit `cf6f71a`. Status Proposed (pending live verify with env).

### Vision E2E coverage +2 live 5/5 PASS
- Extended `e2e/22-vision-flow.spec.js` with captureScreenshot contract + mocked UNLIM render.
- Live run Day 05: 5/5 PASS 20.6s on localhost:5173 chromium.
- PZ v3 invariant asserted (plural Italian button label).
- Commit `e197d37`.

### T1-005 Dashboard scaffold (unblock CLAUDE.md bug #9)
- `src/components/dashboard/index.jsx` placeholder component, role=region aria-live.
- NOT routed (intentional: scaffold only). Feature logic sett-2+.
- Commit `7acf0a0`.

### Infrastructure
- BLOCKER-001 CLOSED (JWT 401, Day 05)
- BLOCKER-002 CLOSED (velocity tracking backfill Day 04-06)
- BLOCKER-006 CLOSED (Day 01 standup retroactive)
- 6 days daily standups + 7 Sprint Contracts (Harness 2.0)
- 7 days self-audits (trend stabilizing upward)

## Anti-Regression Verification

- Vitest: **12164 tests PASS** (CoV 3/3 Day 06 consistent, zero flaky)
- Anti-regression gate: PASS (baseline ratcheted 11958 → 12164)
- Build: PASS 108s (Day 04) / 198s (Day 05 new component cold cache)
- PZ v3 violations: 0 source-side
- Engine semantic diff: 0
- Principio Zero v3: IMMUTABLE preserved

## Test Plan

- [x] Vitest 3x CoV stable 12164 (Day 06 report)
- [x] Vision E2E 5/5 live PASS 20.6s (Day 05 report)
- [x] Anti-regression gate PASS (Day 07)
- [x] Homepage E2E 3/3 PASS 6.8s (Day 03 report)
- [ ] Post-merge: BLOCKER-007 render-warmup.yml first scheduled run verify
- [ ] Post-merge: BLOCKER-008 grep canonical invariant `euqpdueopmlllqjmqnyb`
- [ ] Post-deploy: Stress test 50-prompt prod unlim-chat (PZ v3 enforcement)

## Docs

Full sprint artifacts:
- `docs/reviews/sprint-1-review-prep.md` — demo script
- `docs/reviews/sprint-1-retrospective.md` — retro + sett-2 action items
- `docs/handoff/2026-04-26-sprint-end.md` — end-of-sprint handoff
- `docs/audit/day-0{1..7}-audit-2026-04-{20..26}.md` — daily audits
- `docs/standup/2026-04-{20..26}-day-0{1..7}-standup.md` — daily standups
- `automa/team-state/sprint-contracts/day-0{4..7}-contract.md` — contracts
- `docs/architectures/ADR-003-jwt-401-edge-function-auth.md` — JWT auth ADR

## Known Gaps (transparent)

- Benchmark 3.95 vs target 6.0 (MISS -2.05). Sett-2 target re-evaluate.
- T1-005 Dashboard scaffold only (no feature logic, sett-2+).
- 152 dirty files untriaged (BLOCKER-003 sett-2).
- MCP calls 6/56 vs target 56/sprint (massive miss, sett-2 rebalance).
- ADR-003 Status Proposed (needs env for Accepted promotion).

## Risk Assessment

**Merge risk**: LOW. Zero regression verified 4x. Engine invariant held. PZ v3 preserved. No production-side changes (backend/DB unchanged).

**Deploy risk**: LOW. Render warmup cron benign (ping only). Dashboard a11y contrast-only changes. Vision E2E test-only. T1-005 scaffold unrouted.

**Rollback**: revert single PR if issues.

## Next Sprint (sett-2) Target

- Resolve 152 dirty files (BLOCKER-003)
- Product backlog gerarchico (BLOCKER-004)
- T1-005 Dashboard feature logic + routing
- Benchmark +2.05 toward 6.0 (need git_hygiene "Test N" adoption 100%)
- MCP calls discipline rebalance

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## Command to create PR (Andrea to execute)

```bash
gh pr create --base main --head feature/t1-003-render-warmup \
  --title "feat(sett-1): stabilize foundations — Render warmup + Dashboard a11y + Vision E2E + JWT edge auth" \
  --body-file docs/architectures/PR-BODY-DRAFT-sett-1.md
```

**NOTE**: This file contains the draft + metadata wrapper. Andrea may want to:
1. Copy just the markdown body (between the triple backticks) to a clean file
2. Run `gh pr create --body-file <clean-file>`
3. Or use `gh pr create` interactively pasting body

Reason not auto-created: CLAUDE.md "Mai pushare su main direttamente" + production_safety memory = merge requires human authorization.
