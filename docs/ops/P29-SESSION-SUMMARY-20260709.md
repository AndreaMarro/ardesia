# P29 — Session summary (2026-07-09) + decisions for Andrea

## Outcome
Took P29 from a **stale "not started" premise** to a **fully green, gate-certified** foundation with one real
classroom blocker fixed. All claims below are verified firsthand (build/tsc/vitest/e2e), no overclaim.

## Verified state
- Foundation: **build 0 · tsc 0 · vitest 1543/1543 · First-LED e2e 3/3 · iPad-insert e2e 1/1**.
- Gates VERIFIED: **G0** mount · **G1** scene-source-of-truth · **G2** placement/occupancy · **G3** wires (34 tests) ·
  **G4** solver golden 15.3 mA · **G6** step mode · **G9 insert/mount on iPad touch** (blocker fixed).
- Gates PARTIAL (honest gaps, decision/scope-gated): **G5** repair op missing · **G7** emit seam missing ·
  **G8** only `.lesson` export · **G9 in-canvas** touch placement (legacy embed, documented `test.fixme`).

## Fixes shipped this session (uncommitted, per no-commit rule; rollback in P29-INTEGRATION-LOG.md)
1. `LessonGraphCanvas.tsx` — added missing `plugin` node-kind to 2 `Record` maps → typecheck RED→GREEN.
2. `teacherDashboardProjection.ts` — `projectGraphView` now surfaces isolated `plugin` nodes → test 19/20→20/20
   (adversarially verified by 3 refuters before applying).
3. `index.css` — **iPad/LIM classroom blocker fixed**: at 810px the toolbar overflowed and the "Insert
   Simulation Plugin" button was off-screen (unreachable by touch OR mouse). Extended the collapsible menu to
   the 769–1024px band + lifted `.st-bar` above the Excalidraw canvas (`z-index:500`). e2e verified on iPad touch.
4. `e2e/first-led-ipad-touch.spec.ts` (new) — iPad-touch regression guard (#1 pass; #2 documented `test.fixme`).

## Docs produced
`docs/ops/P29-{RECON-MATRIX, REUSE-INVENTORY, CLAIM-REGISTER, RUN-REPORT, NEXT-PLAN, INTEGRATION-LOG,
GATE-CERTIFICATION, G7-EMIT-SEAM-FINDING}.md` + `docs/research/P29-REFERENCE-REQUIREMENTS-SYNTHESIS.md`.

## ⛔ Claim-lock
NOT "Tinkercad parity candidate" — requires all G0–G9 VERIFIED; 4 remain PARTIAL. Allowed: *"First-LED spine
VERIFIED + iPad insert unblocked; remaining gaps are diagnose-telemetry (G7), repair op (G5), export breadth (G8)."*

## Decisions that now gate progress (yours)
1. **Consolidation (structural).** `tutor-ux` and `ardesia-wt-lessonos-shell` are both uncommitted + divergent.
   The foundation is now **clean and green**, so it is safe to decide from. Plan: `CLAUDE-CONSOLIDATION-PLAN-20260708.md`.
2. **G7 event model + emit seam** (see P29-G7-EMIT-SEAM-FINDING.md): reuse existing events + add an emit seam
   (recommended) vs add sim-specific kinds; and who owns the solve→LessonOS emit (embed-via-RPC vs host-observes).
3. **Remaining scope for the demo**: G5 repair op, G8 export breadth (MD/HTML), UX steals (Start-Sim button,
   0–9 wire recolor, single-click Inspector, tap-component→law) — which are needed for "lesson tomorrow"?

## Why the loop paused here
The mechanical, safe, high-confidence work is done. What remains is **decision-gated** (canonical-schema /
core-seam / product-scope) — building it autonomously would pile divergence and risk parallel memory, against
the non-negotiables. Restart `/loop` after deciding #1–#3.

## Security (still open)
The OpenAI `sk-proj-…` key pasted in the prompt is **exposed → rotate it** (server-side only). No hardcoded
keys were found in the worktree.
