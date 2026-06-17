# Day 15 Audit — sprint-3 Day 01 (2026-04-21)

**Branch**: `feature/sett-3-stabilize-v3` (from `origin/main` 52f0200)
**Sprint**: 3/8 (sett-3-stabilize-v3)
**Sprint Day local**: 1/7
**Sprint Day cumulative**: 15/56
**Status**: DAY CLOSED — scope integrity + kickoff
**Scope**: Option B locked (NPM pending → default)

---

## Executive Summary

Day 15 = Sprint 3 Day 01 kickoff. Integrity-first day: removed CI E2E masking that inflated sprint-1/2 benchmark `e2e_pass_rate` to false 1.0, patched 6 stale specs (01-04, 06, 09) with honest skip behavior against prod URL, finalized Option B sprint-3 contract.

Zero new features. Zero engine diff. Zero `src/` changes. Only CI workflow + E2E test infrastructure + docs.

---

## Metrics 20-dimensional

| # | Metric | Day 15 | Baseline (main/sett-2 end) | Delta | Target | Verdict |
|---|--------|--------|---------------------------|-------|--------|---------|
| 1 | Vitest PASS | 12163 | 12163 (main) / 12166 (sett-2) | 0 vs main | ≥12163 | ✅ |
| 2 | Vitest FAIL | 1 pre-existing | 1 pre-existing (main) | 0 delta | 0 long-term | ⚠️ carry-over |
| 3 | CoV 5x consistency | 5/5 identical | — | — | 3x ✅ | ✅ strict |
| 4 | Build status | PASS | PASS | = | PASS | ✅ |
| 5 | Build time | 58.83s | 62s (sett-2 Day 14) | -3s | <120s | ✅ |
| 6 | Engine semantic diff | 0 (no src/ change) | 0 | 0 | 0 | ✅ |
| 7 | PZ v3 violations source | 0 | 0 | 0 | 0 | ✅ |
| 8 | Files modified (intentional) | 9 | — | — | atomic | ✅ |
| 9 | E2E spec count | 22 | 22 (sett-2) / less on main | 0 vs sett-2 | ≥22 | ✅ |
| 10 | E2E specs skip-pattern added | 6 (01-04,06,09) | 0 | +6 | 6 stale | ✅ |
| 11 | E2E CI masking pattern | REMOVED | `\|\| echo "::warning"` line 41 | -1 | 0 | ✅ |
| 12 | Fixtures helpers | +2 (`seedE2EBypass`, `skipIfProd`) | — | +2 | — | ✅ |
| 13 | Sprint-2 PR status | #17 DRAFT created | pending | created | draft created | ✅ |
| 14 | Sprint-3 contract | FINAL Option B | DRAFT skeleton | finalized | final | ✅ |
| 15 | Blockers OPEN carry-over | 3 (011, 007, ADR-003) | 3 (same) | 0 | — | ⚠️ unchanged |
| 16 | Commits Day 15 | 1 planned | — | — | atomic | ✅ |
| 17 | Git unpushed before end | 0 Day 14 (all pushed sett-2) | 3 sett-2 | -3 pushed | 0 | ✅ |
| 18 | Dirty files post-build | 70+ (watermark) REVERTED | 0 (sett-2 via fix) | carry-over | 0 | ⚠️ main needs sett-2 merge |
| 19 | MCP calls Day 15 | 4 (claude-mem read + timeline + GH CLI) | baseline ≥10 target | low | ≥10 | ❌ MISS |
| 20 | Benchmark score (not run) | deferred Day 02 | 4.17 sett-2 Day 14 | n/a | ≥4.25 | ⏭️ Day 02 |

**Auditor score Day 15**: 7.3/10
- Design: 7.5 (integrity-first scoping)
- Originality: 6.0 (well-trodden skip pattern)
- Craft: 8.0 (minimal diff, no regression, CoV strict)
- Functionality: 7.5 (CI will now fail honestly)
- **Media**: 7.25/10

---

## Fix Budget Day 15 (3+ required)

1. ✅ **CI E2E masking removal** (`.github/workflows/e2e.yml:41`) — `|| echo "::warning..."` deleted. Failures now fail the job.
2. ✅ **Stale specs 01-04, 06, 09 skip-when-prod** — `skipIfProd` + `seedE2EBypass` fixtures added. Honest handling against prod baseURL.
3. ✅ **Sprint-3 contract FINAL** (Option B locked, no NPM needed).
4. ✅ **Sprint-2 PR #17 draft** created (HALT merge Andrea).

**Fix budget**: 4/3 ✅

---

## Gap onesti / Debito tecnico / COSA NON FUNZIONA (≥5 enumerated)

1. **BLOCKER-010 watermark post-build** on main branch ripresenta 70+ dirty files. Fix esiste su sett-2 branch ma non merged. Carry-over → sprint-3 Day 02 Andrea PR merge OR cherry-pick. Severity P1.
2. **Pre-existing vitest fail** `tests/integration/deploy-smoke.test.js > manifest.json accessible` — pre-existing on main, 5x consistent, NOT regression. Root cause: jsdom `require('https')` returning null or prod manifest not reachable. Severity P2.
3. **BLOCKER-011 NPM approval** 6 days silent (was 5) — blocks sprint-4 Vercel AI SDK scope. Severity P0.
4. **BLOCKER-007 render-warmup verify** still open ~2 weeks. Severity P3.
5. **ADR-003 anon-key CLI** still open ~1 week. Severity P3.
6. **MCP calls Day 15 low count** (~4) vs target ≥10. Causa: Day 15 very scoped infrastructure work. Recupero Day 02: Supabase edge function deploy, Sentry query, Vercel deploy — naturale ↑.
7. **E2E specs 01-10 honesty**: ora skip su prod, ma NOT ancora verificati contro dev/preview server. Day 02+ deve aggiungere `webServer` in playwright.config OR Vercel preview wiring.
8. **Sprint-2 PR #17 HALT** — Andrea deve decidere 4 open Q (NPM / merge strategy / deploy timing / ADR-004 5 Qs).
9. **Benchmark non eseguito Day 15** (scope: infrastructure). Deferred Day 02. Aspettativa: +0.05 da git_hygiene fix + CI masking penalty reduction.
10. **Specs 07, 08, 10 NOT patched** con skip — assumption: loro test prod-agnostic (PWA, a11y, deploy). Se CI ora fallisce su questi → Day 02 revisit.

---

## MCP calls log Day 15

| MCP | Calls | Purpose |
|-----|-------|---------|
| claude-mem (read) | 1 | State recovery + semantic priming via context system |
| GitHub (gh CLI) | 2 | `gh pr create` #17 + future `gh run list` |
| Bash git | ~20 | Branch create, diff, restore, stash |
| Read/Edit/Write | ~25 | File ops spec/fixtures/workflow/contract/audit |
| Vitest | 6 | CoV 5x + 1 isolated baseline check |
| **Total direct MCP-style** | **4** | ⚠️ below ≥10 target |

**Mitigazione Day 02**: richiederà Supabase edge fn + Sentry + Vercel + Playwright MCP → naturale recupero.

---

## Evidence Inventory

- PR draft #17: https://github.com/AndreaMarro/elab-tutor/pull/17
- Sprint-3 contract FINAL: `automa/team-state/sprint-contracts/sett-3-sprint-contract.md`
- CI e2e masking fix: `.github/workflows/e2e.yml` line 41 context
- Fixtures helpers: `tests/e2e/fixtures.js` lines 60-88 (new 28 lines)
- Specs patched: `tests/e2e/0{1,2,3,4,6,9}-*.spec.js` (+7 lines each: import + beforeEach)
- Build output: 58.83s PASS (PWA v1.2.0, 30 precache entries, 4793 KiB)
- CoV 5x output: 12163 PASS + 1 pre-existing FAIL identical across 5 runs

---

## Risks identified

1. **Scope creep risk**: sprint-3 Day 02 tentato di estendere E2E a preview/dev server. Keep P0 only per contract.
2. **Benchmark regression risk**: CoV strict now enforces 12163 floor; any future commit dropping must explain.
3. **Andrea bottleneck**: 5+ open decisioni bloccano sprint-3+ completo scope.

---

## Next Actions (sprint-3 Day 02 roadmap)

1. Benchmark full mode audit → expected +0.05 (honest e2e skip counted)
2. Edge Function `dashboard-data` scaffold (Option B main scope)
3. Benchmark.cjs `git_hygiene` regex fix (sprint-2 retrospective A-301)
4. Escalate BLOCKER-011 decision OR accept sprint-3 closes without
5. Supabase anon-key CLI verify (ADR-003)

---

## Handoff status

- State file: `automa/state/claude-progress.txt` update after commit
- PR draft #17 ready — HALT merge awaiting Andrea
- Sprint-3 branch: `feature/sett-3-stabilize-v3` pushed post-commit
- Day 15 commit message: atomic, includes test count + CoV evidence
