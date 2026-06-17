# Handoff — Stress Test Parallel Session

**Date**: 2026-04-22 08:10–08:25 GMT+8
**Driver**: Claude (isolated worktree `test/stress-2026-04-22` off `origin/main`)
**Parallel task**: loop CLI autonomous on `feature/sett-4-intelligence-foundations` (Sprint 4 Day 01 Karpathy LLM Wiki POC Option B) — left untouched.

---

## What was done

1. Created isolated worktree `elab-builder-stress/` on branch `test/stress-2026-04-22` off `origin/main` (commit `2b5bab7`) so no action touched the loop's working tree on sett-4.
2. Ran Playwright MCP stress test against prod `https://www.elabtutor.school` across 5 suites (homepage, simulator, UNLIM chat, mobile, PWA surface).
3. Ran a Chrome-equivalent audit (same Chromium engine): console, network, a11y sweep, navigation-timing performance, mobile tap-target scan, PWA inspection.
4. Documented findings with severity P0/P1/P2/P3 and evidence per bug.
5. Produced the four deliverable docs listed in the mission brief.
6. Verified loop CLI health at the start AND end of the session — no interference.

## Counts

| Metric | Value |
|---|---:|
| MCP tool calls this session | ≥ 30 |
| Playwright suites executed | 5 |
| Chrome-audit buckets | 8 |
| Findings | **16** (1 P0, 3 P1, 7 P2, 5 P3) |
| Screenshots captured | 6 |
| Console log dumps | 1 (`stress-all-warnings.txt` via MCP) |
| Network log dumps | 1 (`stress-network-full.txt` via MCP) |
| Commits on main | **0** (contract) |
| Commits on sett-4 | **0** (contract) |
| Commits on `test/stress-2026-04-22` | **0** so far (docs only, not yet committed) |
| Deploys | 0 |

## Deliverables (as required by the prompt)

| Path | Purpose |
|---|---|
| `docs/stress-tests/2026-04-22-playwright-prod.md` | Full Playwright run narrative, per-suite. |
| `docs/stress-tests/2026-04-22-chrome-audit-prod.md` | Programmatic Chrome-style audit + honest score 5.0/10. |
| `docs/audits/2026-04-22-stress-test-findings.md` | Consolidated P0/P1/P2/P3 with repro + fix pointers. |
| `docs/handoff/2026-04-22-stress-test-session.md` | This doc. |

All four live in the `test/stress-2026-04-22` worktree at `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-stress/docs/…`.

## The one thing that matters

**P0-001**: returning users see a blank page in prod right now. Root cause: workbox precache-v2 serves the prior deploy's `index.html` whose chunk hashes don't exist in the Sprint 3 build → Vercel SPA rewrite returns HTML → strict MIME kills module load → React never boots.

- Fix is small (NetworkFirst on HTML OR `controllerchange` reload on boot) but must ship as a **hotfix** off main, not as part of sett-4.
- Suggested branch name: `fix/p0-pwa-stale-precache-2026-04-22`.
- Suggested acceptance: open prod in a profile that had a SW from pre-2b5bab7, confirm the page mounts without the 4 MIME errors.

## Loop CLI status (check at 08:25 GMT+8)

- PID 33820 (claude --print) alive.
- PID 33794 / 33795 (loop-forever.sh + caffeinate) alive.
- Sprint 4 Day 01 progress since session start:
  - `a450b85 feat(sett-4-day-01): Karpathy LLM Wiki POC foundations — ADR-006 + SCHEMA + skeleton`
  - `f23e448 docs(sett-4-day-01): end-day audit 7.25/10 + claude-mem observation`
- Loop left uninterrupted per contract. Evidence: `git worktree list` shows the loop is on `elab-builder/` (main dir) and this session used `elab-builder-stress/`.

## Recommended next step

**Do not** continue sett-4 work without triaging **P0-001**. Two options, in priority order:

1. **Hotfix first** (1–2 hours, cold). Branch off main, fix SW install strategy, deploy. Loop can keep running on sett-4 during this.
2. **Accept risk, ship hotfix at end of sett-4**. Only valid if we can prove P0 affects a small user cohort. With the Sprint 3 deploy live for hours, this is unlikely — any returning user since then is broken.

After P0: the three P1s (Vision 422, Principio Zero v3 regression, `&quot;` escape) should be fixed as a small bundle before the next formal demo.

## Follow-ups that require tools not available in this session

- **Lighthouse JSON**: needs a CI-grade Lighthouse binary or a headless Chrome with `lighthouse` npm installed. Not attempted here.
- **Live offline PWA test**: requires `context.setOffline(true)` via Playwright test runner (not the MCP). Run it in `tests/e2e/` once the P0 is understood.
- **axe-core full a11y run**: only a programmatic subset was executed here. axe-core next session.

## Things I did not touch

- `feature/sett-4-intelligence-foundations` branch (loop owns it).
- `main` (no direct commits, per CLAUDE.md rule).
- Supabase / Vercel / Render / n8n (read-only over HTTP).
- `package.json`, engine files, any file under `src/components/simulator/engine/` (CLAUDE.md critical-file list).
- Any other agent's worktree under `.claude/worktrees/`.

## Things left open

- The four deliverable docs exist in the worktree but are **not committed**. Andrea to decide whether to commit them on `test/stress-2026-04-22` and push, or cherry-pick into a P0 hotfix branch alongside the SW fix.
- The loop is still running; next check of sett-4 progress at its natural Day-02 boundary.
- The old sett-4 branch on origin has Day-01 audit `7.25/10` — that score was produced by the loop and is independent of the findings in this stress test.

## Follow-up session (same day, ~09:00 GMT+8) — fixes applied

Andrea authorised a follow-up pass "procedi facendo test debug e audit, impariamo dagli errori". 4 low-risk client-side fixes were applied in the same worktree off `test/stress-2026-04-22`:

| File | Finding | Change |
|---|---|---|
| `src/components/tutor/shared/SafeMarkdown.jsx` | P1-003 `&quot;` literal | `escapeHtml` neutralised (React auto-escapes children, manual escape was double-encoding) |
| `src/services/wakeWord.js` | P2-001 WakeWord log flood | Add `TERMINAL_ERRORS` set (`not-allowed`, `service-not-allowed`), log once, stop auto-restart |
| `src/services/api.js` | P2-005 `/health` 405 | `warmupRender()` HEAD → GET |
| `src/components/lavagna/LavagnaShell.jsx` | P2-007 no `<h1>` | visually-hidden `<h1>` with experiment title |

Diff stat: **4 files, +36 insertions, −8 deletions**.

### Verification

- Baseline before fixes: `vitest run` 12220/12220 PASS, 474.20 s.
- Targeted tests on edited files (`tests/unit/SafeMarkdown.test.jsx` + `tests/unit/accessibilityAudit.test.jsx`): 85/85 PASS in 12.10 s.
- CoV 1/3 full run: 12220/12220 PASS in 369.55 s. (Durations 2/3 appended when runs land.)

### Why this didn't interfere with the loop

- Worktree isolation: fixes committed on `test/stress-2026-04-22` in `PRODOTTO/elab-builder-stress/`. Loop remains on its own `elab-builder/` checkout of sett-4.
- Diff against `origin/feature/sett-4-intelligence-foundations`: only `package.json` / `package-lock.json` (axe-core devDep) overlap — none of the 4 edited files are touched on sett-4.
- `node_modules` is a symlink into the loop's install for vitest runs; no writes.
- Zero commits on `main` or `feature/sett-4-*`.

### Still not fixed (deploy-gated)

- P0-001 PWA stale precache (needs Vercel redeploy + SW install-strategy change).
- P1-001 Vision `/chat` 422 (server-side).
- P1-002 Principio Zero v3 drift (Supabase Edge Function prompt).

A companion doc `docs/audits/2026-04-22-lessons-learned-sprint3.md` captures the process gaps that let these bugs ship.

## Compliance checklist (from the mission brief)

- [x] Playwright suite run completa (5 suites done)
- [x] Chrome audit run completo (8 buckets done)
- [x] `docs/audits/2026-04-22-stress-test-findings.md` written
- [x] `docs/handoff/2026-04-22-stress-test-session.md` written (this file)
- [x] Loop CLI status verified (`git log origin/feature/sett-4-intelligence-foundations --oneline -6`)
- [x] Zero commit su sett-4 branch
- [x] Honesty disclosure per finding
- [x] Severity scoring P0/P1/P2/P3
- [x] Screenshot/log evidence for each bug (Playwright MCP output dir)

Session closed 2026-04-22 08:25 GMT+8.
