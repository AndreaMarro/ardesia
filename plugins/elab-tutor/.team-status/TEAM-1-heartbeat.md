# GHOST BUSTER AGENT - Heartbeat
## Status: COMPLETED
## Date: 13/02/2026

## Bug Fixed: Reactive pinAssignments on Component Drag

### Root Cause
In `handleLayoutChange` (NewElabSimulator.jsx), pinAssignment recomputation only
happened for user-added components (`isUserAdded` check). Base experiment components
(LED, resistor, etc.) never got their pinAssignments updated when dragged, causing
"ghost connections" where the circuit topology remained at the old position.

### Changes Made

#### 1. `NewElabSimulator.jsx` - handleLayoutChange (line ~1261)
- **BEFORE**: Only user-added components got pinAssignment recomputation on drag
- **AFTER**: ALL components (base + user-added) get pinAssignment recomputation
- When a component is dragged to a new breadboard position, `computeAutoPinAssignment`
  recalculates which holes it occupies
- When a component is dragged OFF the breadboard (to empty space), all its
  pinAssignments are nulled out, effectively disconnecting it from the circuit

#### 2. `NewElabSimulator.jsx` - mergedExperiment useMemo (line ~256)
- **BEFORE**: Merged pinAssignments simply spread base + custom, only filtering hidden
- **AFTER**: Also filters out `null` values from customPinAssignments, which serve as
  "disconnected" markers to override base experiment entries

#### 3. `NewElabSimulator.jsx` - Undo snapshot optimization (line ~1252)
- **BEFORE**: `pushSnapshot()` was called on every mouse-move during drag (dozens per drag)
- **AFTER**: `dragSnapshotPushedRef` guard ensures only ONE snapshot per drag operation.
  Reset on `mouseup` event via global listener.

#### 4. `NewElabSimulator.jsx` - Experiment change cleanup (lines 573, 889)
- **BEFORE**: `customPinAssignments` was not cleared when switching experiments or going back
- **AFTER**: `setCustomPinAssignments({})` added to both `handleSelectExperiment` and `handleBack`

### Files Modified
- `src/components/simulator/NewElabSimulator.jsx` (4 edits)

### Files NOT Modified (read-only)
- `src/components/simulator/canvas/SimulatorCanvas.jsx`
- `src/components/simulator/engine/CircuitSolver.js`
- `src/components/simulator/components/registry.js`
- `src/components/simulator/utils/breadboardSnap.js`
- `src/components/simulator/utils/pinComponentMap.js`
- `src/components/simulator/hooks/useUndoRedo.js`
- `src/components/simulator/hooks/useCircuitStorage.js`

### Build Status
- 549 modules, 2.98s, PASSES

### Test Scenarios
1. Drag base LED from bb1:d12 to bb1:d20 -> pinAssignments update to d20 -> solver re-solves
2. Drag base LED off breadboard -> pinAssignments nulled -> circuit disconnects (no ghost)
3. Drag user-added LED to new position -> same behavior as before (regression-safe)
4. Undo after drag -> both position AND pinAssignments revert correctly
5. Multi-component drag -> single undo snapshot, all pinAssignments update
6. Experiment change -> customPinAssignments cleared (no stale data)
7. Right-click rotate -> no interference with drag snapshot guard
