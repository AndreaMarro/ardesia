# P29 — INTEGRATION LOG (single write lane)

> Only the Integration Commander writes feature code. This session: 1 surgical typecheck fix, additive docs. No commits, no merges.

## 2026-07-09 — Session 1 (Phase A: Truth Snapshot)

- **Recon**: located real worktree `/Users/andreamarro/ardesia-wt/tutor-ux` @ `ab91e476`, 102 dirty files. Confirmed sim spine present (see RECON-MATRIX, REUSE-INVENTORY).
- **Security**: literal-secret scan → 0 hardcoded keys. Pasted OpenAI key in prompt = exposed → flagged for rotation (see CLAIM-REGISTER §Security).
- **Rollback**: `git diff` saved to `/tmp/ardesia-p29/pre-claude-tutor-ux.patch` (5320 lines).
- **Fix (write)**: `apps/studio/src/design/LessonGraphCanvas.tsx` — added `plugin` key to `KIND_COLOR` (`#f59e0b`) and `KIND_LABEL_IT` (`"plugin"`). Reason: `DashboardNodeKind` union gained `plugin` (graph model `board_object → plugin_state`) but two `Record<DashboardNodeKind,string>` maps were not updated → `tsc -b` TS2741 ×2. Effect: **typecheck RED → GREEN** (verified `TYPECHECK_EXIT=0`).
- **Docs added** (additive, untracked): `P29-{RECON-MATRIX,REUSE-INVENTORY,CLAIM-REGISTER,RUN-REPORT,NEXT-PLAN,INTEGRATION-LOG}.md`.
- **NOT done** (deferred, non-destructive next slice): full `vitest`, `vite build`, First-LED e2e; consolidation commit/merge (Andrea's decision).

Rollback: `git -C <wt> checkout -- apps/studio/src/design/LessonGraphCanvas.tsx` reverts the fix; docs are deletable untracked files.

## 2026-07-09 — Session 1e (G9: real iPad/LIM classroom blocker found + fixed)
- **Empirical probe** (`e2e/first-led-ipad-touch.spec.ts`, iPad 810×1080 + `hasTouch`) proved — not inferred — that at tablet width the toolbar (~1356px, `overflow:visible`, hamburger only ≤768px) pushed the "sim" insert button off-screen: `DIAG_GEOM btn.right=893 > innerWidth=810`; `.click()` AND `.tap()` both failed. **A teacher could not insert the simulator on a LIM.**
- **Fix (write, `apps/studio/src/index.css`):**
  1. New `@media (min-width:769px) and (max-width:1024px)` extends the existing/tested hamburger + wrapping dropdown to the tablet band → controls reachable.
  2. `.st-bar { position: relative; z-index: 500 }` — its `backdrop-filter` traps the `position:fixed` dropdown in the header stacking context; without a z-index the dropdown rendered under Excalidraw's toolbar (`ToolIcon__icon` intercepted taps). 500 beats the toolbar, stays below Excalidraw's 999999 modals.
- **Verified:** iPad touch probe **PASS** (2.4s: open menu → tap sim → core canvas mounts, 0 errors); typecheck 0; `responsive.test.ts`+`SDesign7` 11/11; full suite re-running.
- Rollback: `git checkout -- apps/studio/src/index.css`; delete `e2e/first-led-ipad-touch.spec.ts`.
