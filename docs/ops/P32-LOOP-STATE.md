# P32 — Loop State

> Long-run loop engineering, anchored on P31 / PR #150. One narrow verified slice
> per iteration. This file = live state + pointers. Detail in the per-file docs.

## Anchor (verified this run)
- Repo: `github.com/AndreaMarro/ardesia` (monorepo). Working copy = git worktree
  `~/ardesia-wt/tutor-ux`, common `.git` at `VOLUME 3/ardesia/.git`.
- Branch: `p30/free-manipulation-trace-v0-20260709-185100`.
- HEAD at loop start: `6082555b` (P31). Upstream `origin/p30/free-manipulation-…`, 2 ahead of `origin/main` (= PR #150's two commits `21c5a850` + `6082555b`).
- PR **#150**: OPEN, **DRAFT**, `mergeable=MERGEABLE`, `mergeStateStatus=CLEAN`, base `main`.
- CI on `6082555b`: **4/4 green** (engine pytest · hygiene [NUL+secrets+boundary+whitespace] · no-deploy-check · studio [typecheck+test+build]). CI does **not** run Playwright e2e.

## Single-writer status (verified)
- `git status` on tutor-ux: **clean** (0 dirty) at loop start. No `.git/index.lock`.
- HEAD matched the anchor SHA exactly. No concurrent-writer signature.
- Other worktrees exist (28 total, incl. `VOLUME 3/ardesia` on a codex branch, dirty) but this loop only writes `tutor-ux`. **Do not** touch other worktrees.

## Security status (verified)
- Secret scan on `origin/main...HEAD` diff (patterns: `sk-…`, `sk-proj-`, `AKIA…`, `eyJ…` JWT, `supabase.co`, `SUPABASE_SERVICE_ROLE`, PEM private keys): **0 hits**.
- CI hygiene job runs `bin/ci/secret_scan.py` — green on `6082555b`.

## Iterations
- **Iter 1 (Phase 0 — P31 lockdown, reachability caveat):** DONE, GREEN.
  Closed the documented reachability caveat (P31-NEXT follow-up #1) with a real
  raw-mouse activation + `elementFromPoint` topmost hit-test on `[data-sim-break]`,
  without reintroducing the flaky click path. Logic click stays `dispatchEvent`.
  Gates: see [P32-GATES.md](P32-GATES.md). Report: [P32-RUN-REPORT.md](P32-RUN-REPORT.md).
- **Iter 2 (Phase 0 close + Phase 1 audit):** DONE, GREEN. Re-gate PASS; **CI 4/4
  PASS on `69f928c8`** → Phase 0 CLOSED. Phase 1: 5 read-only agents → synthesis in
  [P32-STATE-AUDIT.md](P32-STATE-AUDIT.md) (9 unknowns U1-U9; new risks R8-R13).
  Headline: capability layer bypassed on live board path (R8); `.lesson` import
  doesn't restore event log (R10 = next candidate slice); host ZERO-LLM verified.
- **Iter 3 (R10 mechanism):** DONE, GREEN. `.lesson` import now restores the
  LessonOS event log (explicit status union, D5; empty-log-only, never blocking,
  never silent). TDD RED→GREEN; full vitest **1581/5skip/0** (+7); tsc0/build0.
  Honest limit: live Room defaults to `skipped-non-empty` (lesson.started at
  mount) — recovery-mode UX = follow-up slice.

## Verified facts
- The Excalidraw embed (ToolCanvasEmbeddable) is **inert until activated by a
  double-click** (canvas overlay on top). Confirmed in-repo: `montaggio-canvas.spec.ts:55-57`. Pre-activation `elementFromPoint` on `[data-sim-break]` returns `CANVAS` — expected, not a UX bug.
- DOM contract for the free-mode strip lives in `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx:1056-1097` (`data-simulation-free-mode`, `data-sim-solve-kind|current-ma|last-event-kind|error-id|scene-digest`, `[data-sim-break]`, `[data-sim-restore]`).

## Assumptions
- The 1 skipped regression test (`first-led-ipad-touch.spec.ts:56`) is a
  pre-existing `test.fixme` (touch tap-tap), consistent with memory — not a new skip.

## Unknowns / not yet audited (for later phases)
- LessonOS backend: no Supabase config present in repo (Phase 3 is greenfield).
- No `vercel.json`/`vercel.ts` in repo; deploy wiring unverified (Phase 8).
- Full Phase-1 state audit (packages/engine, plugins/*, storage) — [P32-NEXT.md](P32-NEXT.md).

## Blockers
- None for Iter 1. Un-Draft/merge of PR #150 is **Andrea's decision** (governance:
  never auto-merge to main — AGENTS.md).
