# P29 — RUN REPORT — Session 1 (2026-07-09)

## What was completed
- Phase A Truth Snapshot: repo/worktree located, sim spine mapped, secret scan clean.
- Fixed a real build blocker: `LessonGraphCanvas.tsx` missing `plugin` node-kind in 2 style maps → **typecheck RED→GREEN**.
- Wrote P29 ops docs (RECON-MATRIX, REUSE-INVENTORY, CLAIM-REGISTER, INTEGRATION-LOG, NEXT-PLAN, this report).
- Dispatched deep-research on reference products (Tinkercad, Miro, Scratch-Arduino, PictoBlox, study-AI) → `docs/research/P29-REFERENCE-REQUIREMENTS-SYNTHESIS.md`.

## What was verified (evidence)
| Check | Command | Result |
|---|---|---|
| Literal secret scan | `rg 'sk-…{32,}\|sbp_…\|AKIA…'` | 0 hits |
| Typecheck (post-fix) | `npm --prefix apps/studio run typecheck` | exit 0, green |
| Mount/scene code | read `ToolCanvasEmbeddable.tsx`, `montaggio-canvas.spec.ts` | real mount + scene-as-truth confirmed in source |

## What was NOT verified (honest gaps)
- `vitest` full suite — NOT run (large; next slice). Memory claims 1318/0 prior — unverified here.
- `vite build` — NOT run.
- e2e (`montaggio-canvas`, `sim-passo-passo`, `studentpack-artifact`, etc.) — NOT run.
- Solver golden, LessonOS events, iPad/LIM smoke — NOT run.

## Files modified
- `apps/studio/src/design/LessonGraphCanvas.tsx` (+2 lines; typecheck fix).
- `docs/ops/P29-*.md` (new, additive).

## Tests passed/failed
- typecheck: PASS (after fix). Others: not run this session.

## Rollback
- Fix: `git checkout -- apps/studio/src/design/LessonGraphCanvas.tsx`. Pre-session diff: `/tmp/ardesia-p29/pre-claude-tutor-ux.patch`.

## Deploy recommendation
- **DO NOT deploy.** Worktree is 102-files dirty and part of an unresolved consolidation (Andrea's call). Verification incomplete. Deploy only after gates VERIFIED + consolidation decided.

## Risks
- Uncommitted divergent worktrees → work could be lost if not consolidated deliberately.
- BUILT-but-UNVERIFIED gates could hide regressions until e2e is run.

## Next slice
See P29-NEXT-PLAN.md → run `build` + scoped `vitest` (mount/scene/step) + First-LED e2e to turn BUILT→VERIFIED, still non-destructive.

## Session 1b — verification results (evidence-backed)
| Check | Command | Result |
|---|---|---|
| Build | `npm --prefix apps/studio run build` (`tsc -b && vite build`) | **exit 0**, 2643 modules, built 1.33s |
| Vitest (scoped) | `... test -- ToolCanvasEmbeddable.test.tsx ElabLab.test.tsx --pool=threads --maxWorkers=1` | **exit 0 — 19/19 pass, 2 files** |
| First-LED e2e | `... run e2e -- montaggio-canvas.spec.ts sim-passo-passo.spec.ts` | **exit 0 — 3/3 pass (18.6s)** |
→ **G0 mount, G1 scene-source-of-truth, G2 placement/occupancy, G6 step-mode → VERIFIED this session.**

## Session 1c — full vitest suite (regression certification)
| Check | Result |
|---|---|
| Full studio vitest | **1 failed / 1542 passed / 5 skipped** (170 files) — `VITEST_FULL_EXIT=1` |

**Single failure (pre-existing, in the 102-dirty state — NOT caused by this session's edit):**
`TeacherDashboardProjection.test.ts` → "plugin registry (Z6) additivo … plugin.mounted aggiorna lastUsedAt" (L476).
Root cause: `DashboardNodeKind` gained `plugin` and the view colors were completed (`LessonGraphCanvas`, fixed here for tsc), but `projectGraphView` (`teacherDashboardProjection.ts:256`) never injects `kind:"plugin"` nodes into `graphView.nodes` — the projection's other half of the same feature is incomplete. Expected node `plugin:com.ardesia.concept-map#concept-map-1` → received `[]`.
Verified independent of this session's change: the test does not import `LessonGraphCanvas`.
→ A read-only **ultracode certification workflow** (`wf_ced8cc60-666`) is diagnosing the minimal patch (adversarially verified) + certifying gates G3/G4/G5/G7/G8/G9. Patch applied by the single write lane after verification; then full suite re-run to confirm green.

**Decision-relevant for Andrea:** the foundation in `tutor-ux` is 1541/1542 green with one incomplete-feature failure — near-green but not fully green before consolidation.

## Session 1d — full suite AFTER the plugin-node fix
| Check | Result |
|---|---|
| Full studio vitest (post-fix) | **1543 passed / 5 skipped / 0 failed** (169 files) — `VITEST_FULL2_EXIT=0` |
→ Foundation is now **fully green**: build 0 · tsc 0 · vitest 1543/1543 · First-LED e2e 3/3. The plugin-node fix caused **zero regression**. **`tutor-ux` now has no red tests** — the consolidation decision can be made from a clean state (still Andrea's call).

## Session 1e — G9 iPad/LIM classroom blocker (found + fixed)
Wrote an emulated-touch probe → found a **real** blocker (not touch gestures): at 810px the toolbar
overflowed (~1356px) and the "Insert Simulation Plugin" button was off-screen (`btn.right=893 > 810`),
unreachable by touch **or** mouse; hamburger only appeared ≤768px. **Fix** (`apps/studio/src/index.css`):
extend the collapsible menu to 769–1024px + `.st-bar { position:relative; z-index:500 }` (above the
Excalidraw toolbar, which was intercepting taps). **Verified:** iPad touch probe PASS (2.4s) — open menu →
tap "sim" → core canvas mounts, 0 errors; typecheck 0; responsive+SDesign7 11/11; full suite re-running.
| Files | `src/index.css` (+media block, +z-index), `e2e/first-led-ipad-touch.spec.ts` (new) |
