# AGENT-10: Snap & Attach Verifier Report

**Date**: 2026-02-13
**Auditor**: AGENT-10 (Snap & Attach Verifier)
**Scope**: Drag-and-drop, snap-to-grid, component attachment, breadboard coordinate system, NanoR4 board, undo/redo

---

## 1. Drag & Drop UX: 7/10

### PASS: Palette drag data is clean and correct
- `ComponentPalette.jsx` line 175: `e.dataTransfer.setData('application/elab-component', JSON.stringify({ type }))` correctly serializes component type as JSON with a custom MIME type.
- Also sets `text/plain` fallback at line 177 for broader compatibility.
- `effectAllowed = 'copy'` correctly set at line 178.
- Each `ComponentRow` is `React.memo`-ized for performance (line 170).

### PASS: Duplicate drop handler bug is FIXED
- `NewElabSimulator.jsx` has NO `onDrop` handler -- only `onDragOver` at line 1739 (`handleCanvasDragOver`, just calls `e.preventDefault()`).
- The sole drop handler lives in `SimulatorCanvas.jsx` lines 1236-1258 (`handleDrop`).
- `e.stopPropagation()` at line 1238 prevents bubbling.

### PASS: Drop handler correctly calculates SVG coordinates
- `SimulatorCanvas.jsx` line 1253: Uses `clientToSVG(svgRef.current, e.clientX, e.clientY)` to transform mouse position to SVG user-space via CTM inverse matrix (lines 204-213).
- Position is rounded to integer (`Math.round(svgPt.x)`).

### PASS: Ghost preview during drag-over
- `SimulatorCanvas.jsx` lines 1219-1234: Shows a translucent green "+" placeholder at cursor position during drag-over.
- Preview cleared on `onDragLeave` (line 1551).

### WARNING: No drag feedback on the palette side
- When dragging from the palette, the component row opacity drops to 0.45 (line 195), but there is no visual preview image (no `setDragImage`). Users see a generic browser drag ghost.
- **File**: `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/panels/ComponentPalette.jsx`, line 174-179

### WARNING: Drag data type fallback never used
- `handleDrop` (SimulatorCanvas line 1248) checks for `application/elab-component-type` as a fallback, but no code ever sets this MIME type. Dead code path.
- **File**: `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/canvas/SimulatorCanvas.jsx`, line 1248

---

## 2. Snap-to-Grid Accuracy: 6/10

### PASS: Grid pitch is correct
- `BB_HOLE_PITCH = 7.5` (SimulatorCanvas line 68), matching `HOLE_PITCH = 7.5` in BreadboardHalf.jsx (line 16) and `BB_PITCH = 7.5` in breadboardSnap.js (line 15).
- This represents 2.54mm at approximately 3:1 scale (7.5 / 2.54 = 2.95x). The CLAUDE.md says "5:1 scale" but the actual pitch math checks out for the breadboard grid.

### PASS: Snap-to-hole works for main section holes (a-j)
- `snapToNearestHole` (SimulatorCanvas lines 85-131) correctly iterates top (a-e) and bottom (f-j) sections.
- Hole center computation matches BreadboardHalf.jsx exactly: `BB_PAD_X + col * BB_HOLE_PITCH + BB_HOLE_PITCH / 2`.
- `SNAP_THRESHOLD = BB_HOLE_PITCH * 0.6 = 4.5` (line 79) -- reasonable, within 60% of hole pitch.

### PASS: Snap-to-hole during drag-move
- `handleMouseMove` (SimulatorCanvas lines 696-740) snaps dragged components to breadboard holes.
- Excludes breadboards, batteries, nano-r4, and full breadboards from snapping (line 705: `noSnapTypes`).

### CRITICAL: Bus rail snap returns WRONG pinId
- `snapToNearestHole` (SimulatorCanvas line 125) returns `bus-${col + 1}` for ALL 4 bus rails.
- The breadboard defines bus pins as `bus-top-plus-N`, `bus-top-minus-N`, `bus-bot-plus-N`, `bus-bot-minus-N`.
- A component snapped to the bus-top-plus rail gets pinId `bus-5` instead of `bus-top-plus-5`.
- This means the pin ID won't match any actual hole in the breadboard's pin registry, breaking electrical connectivity.
- **File**: `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/canvas/SimulatorCanvas.jsx`, line 125

### WARNING: breadboardSnap.js does NOT snap to bus rails at all
- `findNearestHole()` in breadboardSnap.js (lines 40-72) only iterates top and bottom sections.
- Bus rail holes (lines 14-28) define `BB_BUS_H` and `BB_BUS_GAP` but are not iterated.
- Components auto-placed near bus rails will snap to the nearest a-e or f-j hole instead.
- **File**: `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/utils/breadboardSnap.js`, lines 40-72

### WARNING: No snapping to NanoR4 pins
- Snap-to-nearest-hole only checks breadboard components. NanoR4 wing pins are not snap targets.
- Dragging a component near the NanoR4 wing will not snap to its pin holes.
- **File**: `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/canvas/SimulatorCanvas.jsx`, lines 704-719

### WARNING: No overlap detection
- Two components can be placed on the exact same breadboard hole.
- No collision detection or warning is provided when holes are double-occupied.
- **File**: `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/canvas/SimulatorCanvas.jsx` (missing feature)

### WARNING: Snap is not disablable
- There is no modifier key (e.g., Alt) or setting to temporarily disable snap-to-grid.
- This can frustrate users who want to place components freely.

---

## 3. Pin Attachment Logic: 7/10

### PASS: Auto-pin assignment on drop
- `handleComponentAdd` (NES lines 1338-1389) calls `computeAutoPinAssignment()` on drop.
- If a breadboard is found and the drop point is within `BB_SNAP_RADIUS` (22.5 SVG units = 3 hole pitches), auto-assignment occurs.
- Result includes adjusted `componentX/Y` so the component visually aligns over its assigned holes.

### PASS: Pin orientation analysis
- `analyzePinLayout` (breadboardSnap.js lines 80-114) correctly determines horizontal vs vertical orientation by comparing pin X and Y spans.
- Pin offsets are normalized to breadboard column units.

### PASS: Cross-gap vertical placement
- breadboardSnap.js lines 167-179: Components whose pins span across the IC gap (e.g., row e to row f) correctly bridge the gap from top section to bottom section.

### PASS: Re-assignment on drag-move
- `handleLayoutChange` (NES lines 1243-1280) re-computes `computeAutoPinAssignment()` for user-added components when they are dragged to a new position.
- Old pin assignments for the component are deleted before new ones are set.

### WARNING: Only user-added components get re-assignment on drag
- `handleLayoutChange` line 1250: `isUserAdded` check means only custom components get re-assignment. Dragging experiment-base components (e.g., the LED from the experiment definition) does NOT update pin assignments.
- **File**: `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/NewElabSimulator.jsx`, line 1250

### WARNING: No rotation awareness in auto-pin assignment
- `computeAutoPinAssignment` (breadboardSnap.js) does not account for component rotation.
- If a user rotates a component 90 degrees, pin positions shift, but auto-assignment uses unrotated pin definitions.
- **File**: `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/utils/breadboardSnap.js`, lines 127-202

---

## 4. Breadboard Coordinate System: 8/10

### PASS: Hole naming convention is correct and consistent
- BreadboardHalf.jsx defines holes as `a1`-`e30` (top) and `f1`-`j30` (bottom), 1-indexed.
- Bus holes: `bus-top-plus-1` through `bus-top-plus-30`, and similarly for top-minus, bot-plus, bot-minus.
- This matches the naming in experiments-vol1.js (e.g., `bb1:e5`, `bb1:bus-top-plus-1`).

### PASS: Internal connectivity is correct
- `BreadboardHalf.getInternalConnections()` (lines 451-490) defines:
  - 30 nets for top section (each column a-e connected)
  - 30 nets for bottom section (each column f-j connected)
  - 4 bus nets (each bus rail is one continuous net)
- No connection across the IC gap -- verified correct.

### PASS: Pin position computation matches hole rendering
- Both the pin registry (`_generatedPins`, line 336) and the `HoleSection` rendering (line 169) use the same formula: `BOARD_PAD_X + col * HOLE_PITCH + HOLE_PITCH / 2` for X and `Y_SECTION_TOP + row * HOLE_PITCH + HOLE_PITCH / 2` for Y.
- No off-by-one errors found.

### PASS: `getHolePosition` static method is correct
- BreadboardHalf.getHolePosition (lines 411-441) correctly parses both row-letter holes and bus holes.
- Handles edge cases (invalid column, unknown row letter) by returning null.

### PASS: Legacy bus aliases maintained
- Lines 340-343: `bus-plus` and `bus-minus` legacy pin IDs are kept for backward compatibility.

### WARNING: Bus naming inconsistency between snap and registry
- As noted in the Snap-to-Grid section, `snapToNearestHole` uses `bus-N` while the registry uses `bus-top-plus-N` etc.
- This affects interactive wire placement but NOT pre-defined experiments (which use correct naming in their connection arrays).
- **File**: `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/canvas/SimulatorCanvas.jsx`, line 125

---

## 5. NanoR4 Board Attachment: 7/10

### PASS: NanoR4 does NOT sit on the breadboard
- The NanoR4 ELAB Breakout V1.1 GP is a standalone board with its own wing.
- It has 46 pins total: 15 LEFT header + 15 RIGHT header + 16 WING pins.
- Pin positions are computed from hardware DWG measurements at 5:1 scale.

### PASS: LEFT and RIGHT pin arrays are correctly ordered
- LEFT: D13, 3V3, AREF, A0-A7, 5V, RST, GND, VIN (15 pins, line 72-88)
- RIGHT: D12-D2, GND_R, RST_R, RX, TX (15 pins, lines 91-107)
- Both arrays use `HEADER_START_X + i * PIN_PITCH` for X position (line 156).
- LEFT uses `LEFT_ROW_Y` and RIGHT uses `RIGHT_ROW_Y = LEFT_ROW_Y + ROW_SPACING` (76.2 SVG units = 15.24mm at 5:1 scale).

### PASS: WING pins correctly positioned
- 16 wing pins (lines 112-129) map to Arduino pins via `mapsTo` field.
- Wing pin X: `WING_PIN_START_X + i * WING_PIN_PITCH` (2.54mm pitch, from DWG).
- Wing pin Y: `WING_PIN_Y = WING_Y + 16` (near top edge of wing).

### PASS: All pins exported to registry
- `NanoR4Board.pins` (lines 871-881) concatenates left, right, and wing pins.
- Each pin has `id`, `label`, `x`, `y`, `type`, `side`, and `arduino` number.
- Wing pins additionally have `mapsTo` for aliasing (e.g., `W_D13` maps to `D13`).

### WARNING: NanoR4 connections are wire-only, not pin-assignment based
- Experiments connect to NanoR4 via wire connections (`nano:D13` to `bb1:a5`), not via `pinAssignments`.
- This is architecturally correct (NanoR4 is not plugged into a breadboard), but it means the NanoR4 does not benefit from auto-pin-assignment.
- Students must manually wire from NanoR4 wing pins to the breadboard.

### WARNING: Board dimensions are large and may cause viewbox issues
- `ELAB_TOTAL_W` = `ELAB_MAIN_W + WING_W` = about 271 + 200 = 471 SVG units.
- `COMP_SIZES['nano-r4']` in SimulatorCanvas.jsx is `{ w: 440, h: 150 }` (line 44), which is a reasonable approximation but not exact.

---

## 6. Undo/Redo for Placement: 5/10

### PASS: Undo/Redo hook is correctly implemented
- `useUndoRedo.js` (115 lines) uses refs for past/future stacks with max 50 entries.
- `pushSnapshot` clears the redo stack (correct behavior).
- `undo` saves current state to future stack before restoring past (correct).
- `redo` saves current state to past stack before restoring future (correct).
- Deep clone via `cloneSnapshot` prevents reference mutations.

### PASS: Component add is undoable
- `handleComponentAdd` (NES line 1339): `pushSnapshot(getCurrentSnapshot())` called before mutation.

### PASS: Component delete is undoable
- `handleComponentDelete` (NES line 1395): `pushSnapshot(getCurrentSnapshot())` called before mutation.

### PASS: Wire add is undoable
- `handleConnectionAdd` (NES line 1286): `pushSnapshot(getCurrentSnapshot())` called before mutation.

### PASS: Wire delete is undoable
- `handleWireDelete` (NES line 1312): `pushSnapshot(getCurrentSnapshot())` called before mutation.

### PASS: Experiment reset is undoable
- `handleResetExperiment` (NES line 1447): `pushSnapshot(getCurrentSnapshot())` called before mutation.

### CRITICAL: Component move (drag) is NOT undoable
- `handleLayoutChange` (NES lines 1243-1280) does NOT call `pushSnapshot()`.
- If a user drags a component to a wrong position, there is no way to undo the move.
- This is especially problematic because dragging also re-computes `pinAssignments`, which are also lost.
- **File**: `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/NewElabSimulator.jsx`, lines 1243-1280

### CRITICAL: Rotation strips rotation on subsequent drag
- `handleLayoutChange` line 1246: `{ x: newPos.x, y: newPos.y }` -- this drops the `rotation` field from `newPos`.
- SimulatorCanvas passes `{ ...pos, rotation: newRotation }` from `handleComponentContextMenu` (line 1202), but the NEXT drag-move will overwrite it with just `{ x, y }`, losing rotation.
- **File**: `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/NewElabSimulator.jsx`, line 1246

### WARNING: `canUndo`/`canRedo` use ref.current in render
- `useUndoRedo.js` lines 111-112: `canUndo: pastRef.current.length > 0`. This reads a ref during render, which may not trigger re-render when the ref changes. The `tick()` state counter is used to force updates, but this is fragile.
- **File**: `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/hooks/useUndoRedo.js`, lines 111-112

---

## 7. Experiment Tracing (v1-cap6-esp1): PASS

### Trace: "Accendi il tuo primo LED"
1. **Components**: bat1 (battery9v), bb1 (breadboard-half), r1 (resistor 470R), led1 (red LED)
2. **Pin Assignments**:
   - `r1:pin1 -> bb1:e5` (resistor pin 1 in hole e5)
   - `r1:pin2 -> bb1:e12` (resistor pin 2 in hole e12)
   - `led1:anode -> bb1:d12` (LED anode in hole d12)
   - `led1:cathode -> bb1:d13` (LED cathode in hole d13)
3. **Connections (wires)**:
   - `bat1:positive -> bb1:bus-top-plus-1` (red wire: battery + to bus +)
   - `bb1:bus-top-plus-5 -> bb1:a5` (red wire: bus + to column 5)
   - `bb1:a13 -> bb1:bus-top-minus-13` (black wire: column 13 to bus -)
   - `bb1:bus-top-minus-1 -> bat1:negative` (black wire: bus - to battery -)
4. **Connectivity trace**:
   - Battery + -> bus-top-plus (all connected) -> bus-top-plus-5 -> a5 (same column as e5) -> r1:pin1 -> (through resistor) -> r1:pin2 = e12 -> d12 (same column) -> led1:anode -> led1:cathode = d13 -> a13 (same column) -> bus-top-minus-13 -> bus-top-minus (all connected) -> bus-top-minus-1 -> battery -
   - Circuit is complete. Resistor limits current. LED should light.
5. **Layout positions are reasonable**: Battery at (30, 55), breadboard at (100, 10), resistor at (174, 73.75) -- aligns with e-row holes at correct Y.
6. **Bus naming is correct**: Uses `bus-top-plus-1`, `bus-top-plus-5`, `bus-top-minus-13`, `bus-top-minus-1` -- matches BreadboardHalf registry.

### PASS: Experiment definition is internally consistent and the circuit traces correctly through the Union-Find connectivity model.

---

## Summary Scores

| Category | Score | Key Issues |
|---|---|---|
| Drag & Drop UX | 7/10 | No drag image preview, dead fallback code |
| Snap-to-Grid Accuracy | 6/10 | CRITICAL: bus rail snap returns wrong pinId; no bus snap in breadboardSnap.js |
| Pin Attachment Logic | 7/10 | No rotation awareness; base components not re-assigned on drag |
| Breadboard Coordinate System | 8/10 | Solid implementation, bus naming mismatch only in snap (not in data) |
| NanoR4 Board Attachment | 7/10 | Correct standalone design, no snap support |
| Undo/Redo for Placement | 5/10 | CRITICAL: moves not undoable; rotation lost on drag |
| **Overall Snap & Attach** | **6.5/10** | 2 critical bugs, 7 warnings |

---

## Critical Bugs (2)

1. **CRITICAL: Bus rail snap returns generic `bus-N` instead of `bus-top-plus-N`**
   - File: `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/canvas/SimulatorCanvas.jsx`, line 125
   - Impact: Interactive wire placement on bus rails creates connections to non-existent pins, breaking circuit connectivity.
   - Fix: Replace `bus-${col + 1}` with proper rail-specific names based on which `busY` offset matched.

2. **CRITICAL: Component drag does not push undo snapshot and drops rotation**
   - File: `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/NewElabSimulator.jsx`, lines 1243-1246
   - Impact: (a) Moving a component cannot be undone. (b) Rotating then dragging a component loses the rotation, as `{ x: newPos.x, y: newPos.y }` strips the `rotation` field.
   - Fix: (a) Add `pushSnapshot(getCurrentSnapshot())` before `setCustomLayout`. (b) Spread the full `newPos` object or explicitly preserve rotation: `{ ...newPos }` or `{ x: newPos.x, y: newPos.y, rotation: newPos.rotation }`.

---

## Warnings (7)

1. **No drag image preview** -- palette drag uses browser default ghost (ComponentPalette.jsx, line 174)
2. **Dead fallback MIME type** -- `application/elab-component-type` never set (SimulatorCanvas.jsx, line 1248)
3. **breadboardSnap.js ignores bus rail holes** -- `findNearestHole` only checks a-e and f-j sections (breadboardSnap.js, lines 40-72)
4. **No snap to NanoR4 wing pins** -- snap function only checks breadboards (SimulatorCanvas.jsx, lines 704-719)
5. **No overlap/collision detection** -- two components can occupy same hole
6. **No rotation-aware auto-pin assignment** -- breadboardSnap.js uses unrotated pin definitions
7. **Base experiment components not re-assigned on drag** -- only user-added components get pin re-computation (NES, line 1250)

---

## Files Audited

| File | Path | LOC | Role |
|---|---|---|---|
| breadboardSnap.js | `src/components/simulator/utils/breadboardSnap.js` | 215 | Auto pin-to-hole mapping |
| SimulatorCanvas.jsx | `src/components/simulator/canvas/SimulatorCanvas.jsx` | 1825 | SVG canvas, drag/drop/snap |
| ComponentPalette.jsx | `src/components/simulator/panels/ComponentPalette.jsx` | 333 | Draggable parts sidebar |
| NewElabSimulator.jsx | `src/components/simulator/NewElabSimulator.jsx` | ~1900 | Main shell, state management |
| useUndoRedo.js | `src/components/simulator/hooks/useUndoRedo.js` | 115 | Undo/redo history stack |
| BreadboardHalf.jsx | `src/components/simulator/components/BreadboardHalf.jsx` | 505 | Breadboard rendering + pin registry |
| NanoR4Board.jsx | `src/components/simulator/components/NanoR4Board.jsx` | 930 | Arduino board rendering |
| PinOverlay.jsx | `src/components/simulator/canvas/PinOverlay.jsx` | 140 | AI tutor pin highlighting |
| pinComponentMap.js | `src/components/simulator/utils/pinComponentMap.js` | 256 | Union-Find pin tracing |
| experiments-vol1.js | `src/data/experiments-vol1.js` | ~1500 | Experiment definitions |
