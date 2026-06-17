# Session 112 Report — Breadboard Hole Grid Audit

**Data**: 10/03/2026
**Commit**: `828e7ed`
**Deploy**: https://www.elabtutor.school (Vercel production)

## Root Cause

Both snap systems (`snapToNearestHole()` in SimulatorCanvas.jsx and `findNearestHole()` in breadboardSnap.js) were hardcoded for **BreadboardHalf** geometry:
- Pitch: 7.5px (BreadboardFull uses 7px)
- Layout: horizontal, 5 rows × 30 cols (BreadboardFull is vertical, 63 rows × 5+5 cols)
- Bus: horizontal rails (BreadboardFull has vertical bus columns)

BreadboardFull components had **zero snap support** — every drop was matching against the wrong grid.

## Fix Applied

### Approach: Pin Registry as Source of Truth
Instead of hardcoding grids per breadboard type, `snapToNearestHole()` now reads the registered component's own pin definitions. Each breadboard registers its pins with exact (x, y) coordinates — the snap function iterates these directly.

### Files Modified (3) + Created (1)

1. **SimulatorCanvas.jsx** — Replaced hardcoded grid loop with `getSnapPins(bbType)` cache + generic nearest-pin search. Threshold from `boardDimensions.holeSpacing`.

2. **breadboardSnap.js** — Added BreadboardFull constants (`BBF_*`), `findNearestHoleFull()` for 63 rows × 5+5 cols + bus columns, `computeAutoPinAssignmentFull()` with inverted axis logic (letters = X, numbers = Y).

3. **NewElabSimulator.jsx** — Updated 2 call sites to pass `bb.type` as 7th argument to `computeAutoPinAssignment`.

4. **`.claude/skills/breadboard-hole-test.md`** — Created 20-point test checklist covering both breadboard types.

## Key Insight: Axis Inversion

BreadboardHalf: letters (a-j) on Y, numbers (1-30) on X → horizontal components span column numbers.
BreadboardFull: letters (a-j) on X, numbers (1-63) on Y → horizontal components span column letters.

The auto-pin assignment logic had to invert which axis represents "horizontal" and "vertical" for BreadboardFull.

## The 2.5x Multiplier (Non-Bug)

Session prompt flagged `SNAP_THRESHOLD * 2.5` in `snapComponentToHole()`. Analysis: this is an initial distance bound for the outer search — the inner `snapToNearestHole()` applies the real threshold (`holeSpacing * 0.9`). The 2.5x never widens the actual snap catch radius. Not modified.

## COV Results: 10/10 PASS

| # | Test | Result | Detail |
|---|------|--------|--------|
| 1 | Hole a1 (top-left) | PASS | {x:22, y:14} — correct |
| 2 | Hole e63 (last left) | PASS | {x:50, y:448} — correct |
| 3 | Hole f1 (right section) | PASS | {x:67, y:14} — right, not left |
| 4 | Hole j63 (bottom-right) | PASS | {x:95, y:448} — correct |
| 5 | Bus+ row 1 | PASS | {x:10, y:14} — bus snap works |
| 6 | Bus- row 63 | PASS | {x:17, y:448} — bus snap works |
| 7 | Center e32 | PASS | {x:50, y:231} — no ambiguity (threshold 6.3 < spacing 7) |
| 8 | Adjacent a1+a2 | PASS | 7px apart, threshold 6.3 — distinct snaps |
| 9 | Between holes | PASS | Deterministic snap to nearest (strict < comparison) |
| 10 | v1-cap6-esp1 load | PASS | BreadboardHalf path unchanged, zero regressions |

## Build
- 0 errors
- Main chunk: 302.80 KB gzip
- ScratchEditor: 905.57 KB gzip (lazy-loaded)

## Breadboard Usage Stats
- `breadboard-half`: 107 occurrences in experiment data
- `breadboard-full`: 4 occurrences (v1-cap6-esp1 not one of them — uses half)
- Both types now fully supported by snap system

## Next Session
**S113 — Battery Wire Routing v3** → `docs/sessions/session-113-battery-wire-routing/SESSION-113-PROMPT.md`
Focus: dynamic wire routing for battery connections (no hardcoded paths, ≥10px separation, no crossings).
