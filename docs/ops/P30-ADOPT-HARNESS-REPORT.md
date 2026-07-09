# P30 ADOPT — Harness Report

**Mission:** P30-ADOPT-HARNESS — turn the dormant simulation-plugin-v2 WIP into a verifiable GitHub base. **No feature work.**
**Date:** 2026-07-09 (run 15:17→18:xx CEST)
**Decision:** 🟢 **GREEN ADOPT** — all gates pass, zero repair cycles.

## Provenance
- Source worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
- Source branch: `docs/simulation-plugin-v2-contract-20260707` @ `ab91e476` (+16 / -0 vs `origin/main 54332d28`)
- Writer status at adoption: **DORMANT** (no commits 12h, no `index.lock`, `ToolCanvasEmbeddable.tsx` untouched since 07:32; HEAD stable across 15:17 / 15:19 / 17:53 samples).
- Adoption branch: `p30/adopt-dormant-simulation-wip-20260709-175500`
- Rescue commit: `18a95aff` — preserves 173 files (50 modified + 123 untracked), +36524 / -338.

## Gate results

| Gate | Command | Result | Evidence | Fix applied | Remaining risk | Next |
|---|---|---|---|---|---|---|
| Snapshot | `git diff --binary` + `tar` | OK | `/tmp/ardesia-p30-adopt/dirty.patch` (252KB), `worktree-no-git-no-deps.tgz` (334MB) | — | rollback = `git reset --hard ab91e476` | — |
| Security | redacted `rg` on commit set | **CLEAN** | `security-redacted.txt`, `security-classification.txt` | — | 417 broad hits = 100% false-positive (names/comments/`env -u`/external-file reads); 0 real values in 173-file commit set | rotate the historically-pasted OpenAI key (out-of-repo, memory note) |
| Rescue commit | `git add -A` + `--check` + commit | OK, `--check` clean | `cached-check.log` (exit 0) | — | `output/playwright/*.png` binaries committed — gitignore before merge | — |
| Gate1 typecheck | `npm --prefix apps/studio run typecheck` (`tsc -b --noEmit`) | **0 errors** | `typecheck.log` (exit 0) | none | — | — |
| Gate1 build | `npm --prefix apps/studio run build` (`tsc -b && vite build`) | **✓ 5.38s** | `build.log` (exit 0) | none | chunk-size warnings only (>500KB, non-blocking) | code-split later (out of scope) |
| Gate2 targeted | `vitest run ToolCanvasEmbeddable + ElabSceneBridge + SimulationSolve + TeacherDashboardProjection` | **57/57 pass** | `gate2-targeted.log` (exit 0) | none | — | — |
| Gate3 full | `npm --prefix apps/studio test -- --pool=threads --maxWorkers=1 …` | **1565 pass / 5 skip / 0 fail** (172 files) | `full-vitest.log` (exit 0, 358s) | none | prior-flaky `Room.integration` passed this run | — |
| Gate4 e2e | `playwright test montaggio-canvas + first-led-ipad-touch` | **2 passed** (29.1s) | `gate4-e2e.log` (exit 0) | none | broader e2e set not run (scope-bounded) | `p30-free-manipulation.spec.ts` = next patch |

## Repair cycles
**0 / 2 used.** The dormant WIP was already green; no stabilization edits were made. No `fix:` commits.

## Honesty statement
- The lane is **ADOPTED and PRESERVED** in git (rescue commit `18a95aff`, reversible).
- **Green:** typecheck, build, 4 targeted suites, full 1565-test suite, 2 core e2e flows.
- **Red:** none.
- **Not verified this run:** the other ~17 e2e specs; live-browser free-manipulation trace (palette→add→wire→solve→break→diagnostic→save/reopen) — that is the NEXT patch, not this one.
- **This run did NOT declare Tinkercad parity.** Adoption ≠ parity. Free-manipulation is not yet proven visible/tested/reopenable end-to-end.

## PR #149 merge gate (2026-07-09 18:xx)
- **GitHub state:** OPEN, not draft, `mergeable=MERGEABLE`, `mergeStateStatus=CLEAN`, base `main`, no blocking review.
- **CI checks (pre-hygiene, head 704d3cf5):** all SUCCESS — `studio (typecheck+test+build)`, `engine (pytest)`, `no-deploy-check`, `hygiene (NUL+secrets+boundary+whitespace)`.
- **Diff hygiene:** 191 files; 42 generated `output/playwright/**` artifacts identified → removed. See `P30-149-DIFF-HYGIENE.md`.
- **Artifact cleanup:** commit `7fd97794` — `git rm output/playwright` (−2081) + `.gitignore` rules. Runtime dir regenerated via `mkdir(recursive)`; no fixture reads.
- **Re-run gates (post-hygiene):** typecheck=0 · build=0 · targeted 57/57 · e2e 4 passed (montaggio-canvas + first-led-ipad-touch + plugin-postit-room-reload).
- **Repair cycles:** 0/1 used.
- **Final merge decision:** GREEN → merge (merge commit, preserve lane history; no auto-bypass of branch protection).
