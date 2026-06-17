# Breadboard Hole Test Skill

Verify that ALL breadboard holes snap correctly for both BreadboardHalf and BreadboardFull.

## Background

The snap system must match the rendering grid exactly. BreadboardHalf has a horizontal layout
(5 rows × 30 cols, pitch 7.5px). BreadboardFull has a vertical layout (63 rows × 5+5 cols,
pitch 7px, plus bus columns). Session 112 rewrote the snap to use registered component pins
as the source of truth instead of hardcoded constants.

## Test Checklist — BreadboardHalf (breadboard-half)

### Corner Holes
1. Hole a1 (top-left main section) → component snaps, correct position
2. Hole e30 (last of top section, right end) → component snaps
3. Hole f1 (first of bottom section) → snap to f-j section, NOT a-e
4. Hole j30 (bottom-right corner) → component snaps

### Bus Rails
5. Bus-top-plus-1 → snap to top positive rail, row 1
6. Bus-bot-minus-30 → snap to bottom negative rail, col 30
7. Bus rails don't cause cross-snap to main section holes

### Edge Cases
8. Two components on adjacent holes (a1 + a2) → distinct snaps, no overlap
9. Drop between two holes → snaps to nearest (not skipped)
10. Horizontal component (resistor) → pins on adjacent columns, same row

## Test Checklist — BreadboardFull (breadboard-full)

### Corner Holes (Vertical Layout)
11. Hole a1 (first column, first row) → component snaps at (SECTION_LEFT_X, yStart)
12. Hole e63 (last left column, last row) → component snaps
13. Hole f1 (first right column, first row) → snap to right section, NOT left
14. Hole j63 (last right column, last row) → component snaps

### Bus Columns (Vertical)
15. Bus-plus-1 (top of positive bus) → snap works
16. Bus-minus-63 (bottom of negative bus) → snap works
17. Bus columns don't cause cross-snap to main section

### Center and Adjacent
18. Hole e32 (center area) → snap precise, not ambiguous
19. Two components on a5 + b5 (adjacent cols, same row) → correct distinct snaps
20. Vertical component (LED) on BreadboardFull → pins span row numbers (e.g., a5, a6)

## How to Run

### Method 1: Visual (in browser)
1. Open simulator at https://www.elabtutor.school
2. Load an experiment with a breadboard-half (most Vol1 experiments)
3. Drag a LED from palette → verify it snaps to a visible hole
4. Try holes at corners, center, and near bus rails
5. For BreadboardFull: load v1-cap6-esp1 or v2-cap4-esp3

### Method 2: Code Verification
1. Read `SimulatorCanvas.jsx` → verify `snapToNearestHole()` uses `getSnapPins(bbType)` (S112 fix)
2. Read `breadboardSnap.js` → verify `findNearestHoleFull()` exists and covers 63 rows + bus
3. Read `BreadboardFull.jsx` → verify `_generatedPins` count:
   - 2 summary pins (bus-plus, bus-minus)
   - 315 left section (5 × 63)
   - 315 right section (5 × 63)
   - 126 per-row bus (63 × 2)
   - Total: 758 pins
4. Verify `boardDimensions.holeSpacing` matches the rendering (7 for Full, 7.5 for Half)

### Method 3: Console Verification
```javascript
// In browser console on simulator page:
// 1. Check snap pin cache for BreadboardFull
const registry = window.__ELAB_REGISTRY || {};
const bbFull = registry['breadboard-full'];
console.log('BreadboardFull pins:', bbFull?.pins?.length); // expect 758

// 2. Verify hole position for a1
const pos = bbFull?.getHolePosition?.('a1');
console.log('a1 position:', pos); // expect { x: 22, y: 14 }

// 3. Verify j63
const pos63 = bbFull?.getHolePosition?.('j63');
console.log('j63 position:', pos63); // expect { x: 95, y: 448 }
```

## PASS Criteria
- All 20 test points pass
- No holes are unreachable by snap
- Snap radius appropriate for iPad touch (not too small, not too large)
- Zero regressions on BreadboardHalf experiments
