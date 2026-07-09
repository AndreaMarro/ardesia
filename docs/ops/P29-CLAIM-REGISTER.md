# P29 — CLAIM REGISTER (claim-lock enforced)

> Every claim needs evidence file:line + a test, or it is marked UNVERIFIED. "Tinkercad parity" is LOCKED.

## Claim-lock status
- ❌ **"Tinkercad parity"** — NOT claimable. Requires drag/drop, component registry, semantic pins, breadboard occupancy, wire routing, solver, zoom, undo/redo, AI operations, persistence, import/export, iPad/LIM, e2e — not all verified.
- ⚠️ **"Tinkercad parity candidate"** — NOT yet. Requires G0–G9 all VERIFIED (currently several BUILT-but-UNVERIFIED).
- ✅ Allowed today: **"Tinkercad-like First-LED prototype, foundation BUILT & typecheck-green, verification in progress."**

## Verified this session (evidence-backed)
| Claim | Evidence | Verification |
|---|---|---|
| No hardcoded secrets in worktree | `rg` literal scan | 0 hits ✅ |
| Typecheck green | `tsc -b --noEmit` | `TYPECHECK_EXIT=0` ✅ (was RED: 2× TS2741 in `LessonGraphCanvas.tsx`, fixed) |
| G0 mount canvas is real (not text card) | `ToolCanvasEmbeddable.tsx:907,1140` + `ElabLab.test.tsx:56` | code read + tests present ✅ (e2e not re-run) |
| G1 scene = source of truth | `ToolCanvasEmbeddable.tsx:1132`, marker `simulation-scene-v1` | code + e2e assertion present ✅ (not re-run) |

## Stale-premise correction (recurring pattern — 3rd time)
The P29 handoff prompt treats G0 "mount the real canvas" as the first unbuilt slice. **False.**
G0/G1/G2/G3/G6/G8 are already BUILT with tests in this worktree (uncommitted). Same as P+21
("already implemented, untracked") and P28 foundation. **Rule: cross-check firsthand before
accepting any 'not started' handoff.** Rebuilding a working surface would violate non-negotiables
#1 (no second sim screen) and #9 (don't break the working prototype).

## Overclaims to avoid (NOT verified this session)
- "First-LED works end-to-end" — e2e NOT run this session.
- "Solver golden passes" — CircuitSolver golden NOT re-run (memory asserts 15.3mA; verify next).
- "Export/reopen identical" — `.lesson`/PDF/MD/HTML reopen NOT exercised.
- "LessonOS emits all typed events" (G7) — NOT enumerated.
- "iPad/LIM smoke pass" (G9) — NOT run.

## Security
- **Exposed OpenAI key** pasted in the P29 prompt (`sk-proj-…`, not reprinted). Treat as compromised → **rotate now**, store server-side only, never client bundle. This is the only real secret exposure found.

## Gate certification (adversarial workflow wf_ced8cc60-666, 09jul)
- **VERIFIED** (refuters upheld, evidence firsthand): G0 mount, G1 scene-source-of-truth, G2 placement/occupancy, G3 wires (34 tests), G4 solver golden **15.3 mA** (real engine), G6 step mode.
- **PARTIAL** (honest gaps — NOT verified, no overclaim): G5 (`repair` op missing; 5/6 ops), G7 (4/11 P29 events; 7 missing), G8 (only `.lesson` export is real+reopen-identical; MD/HTML/PDF/SVG absent, PDF import-only), G9 (touch/pinch **absent**, viewport math unwired).
- **Fixed + verified**: `TeacherDashboardProjection` plugin-node test 19/20 → **20/20**, tsc 0; patch adversarially upheld (3 refuters, severity none).
- ⛔ **Claim-lock: NOT "Tinkercad parity candidate"** — requires all G0–G9 VERIFIED; 4 are PARTIAL. Allowed claim: *"First-LED spine verified; remaining classroom gaps = touch (G9) + diagnose-events (G7)."*
