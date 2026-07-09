# P30 ADOPT — Coverage Verdict (COV)

Adoption of dormant `simulation-plugin-v2` WIP. Branch `p30/adopt-dormant-simulation-wip-20260709-175500`, rescue `18a95aff` (from `ab91e476`, +16 vs `origin/main`).

## PRESERVED
- 173 files (50 modified + 123 untracked, +36524/-338) committed intact as rescue commit `18a95aff`.
- 16 pre-existing commits (`9d94e198`..`ab91e476`) carried on the branch unchanged.
- Rollback point: `git reset --hard ab91e476`. Snapshot tar + binary patch in `/tmp/ardesia-p30-adopt`.

## TYPECHECKED
- `tsc -b --noEmit` → **0 errors**. Evidence: `typecheck.log`.

## BUILT
- `tsc -b && vite build` → **✓ built 5.38s**, dist emitted. Evidence: `build.log`. (chunk-size warnings only.)

## UNIT-TESTED
- Targeted: `ToolCanvasEmbeddable` + `ElabSceneBridge` + `SimulationSolve` + `TeacherDashboardProjection` → **57/57**.
- Full: **1565 passed / 5 skipped / 0 failed** across 172 files. Evidence: `full-vitest.log`.

## E2E-TESTED
- `montaggio-canvas.spec.ts` (free-canvas / ToolCanvasEmbeddable) → pass.
- `first-led-ipad-touch.spec.ts` (First LED, touch) → pass.
- Total this run: **2 passed**. Evidence: `gate4-e2e.log`.

## NOT VERIFIED
- 17 other e2e specs (sim-passo-passo, sim-esp*, studentpack-artifact, ripasso-live, cruscotto, plugin-wizard, saved-lessons, toolhost-srcdoc-bypass, …) — not run (scope-bounded to adoption).
- Live-browser interactive free-manipulation trace (palette→add component→move→rotate→connect pins→route wire→delete→undo/redo→solve→badges→diagnostic→break→short→reversed→repair→save→reopen→export).
- No preview deploy, no `/health`, no lavagna/graph/HTML/plugin work (all explicitly out of scope for this run).

## NOT TINKERCAD PARITY
- **This run does NOT claim Tinkercad parity.** Adopting a compiling, test-green substrate is necessary but NOT sufficient. Free manipulation must be visible, tested, and reopenable end-to-end before any parity claim. That proof does not exist yet.
