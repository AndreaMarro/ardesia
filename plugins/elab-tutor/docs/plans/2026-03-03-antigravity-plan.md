# Antigravity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the ELAB simulator with parent-child component grouping, improved drag UX, dynamic circuit mapping, enhanced physics, scientific lab notebook reports, and Galileo AI omnipotence.

**Architecture:** Logical parent-child via `parentId` field in component layout. No DOM hierarchy changes. Delta propagation in existing drag handler. CircuitSolver gets public measurement APIs. New SessionRecorder React Context captures all events. Galileo receives real-time circuitState in every request.

**Tech Stack:** React 18, SVG, @react-pdf/renderer, CircuitSolver (Union-Find + MNA), nanobot (FastAPI)

---

## Phase 1: Antigravity Core (parentId + drag propagation)

### Task 1.1: Add `getChildComponents` helper

**Files:**
- Create: `src/components/simulator/utils/parentChild.js`

**Step 1: Create the helper module**

```javascript
// src/components/simulator/utils/parentChild.js

/**
 * Find all components whose parentId matches the given parent.
 * @param {string} parentId - The parent component ID (typically a breadboard)
 * @param {Object} layout - The experiment layout object { compId: { x, y, rotation, parentId? } }
 * @returns {string[]} Array of child component IDs
 */
export function getChildComponents(parentId, layout) {
  if (!layout || !parentId) return [];
  return Object.keys(layout).filter(
    compId => compId !== parentId && layout[compId]?.parentId === parentId
  );
}

/**
 * Given pinAssignments, infer parentId for each component.
 * Used when loading "Gia Montato" experiments that don't have parentId set.
 * @param {Object} pinAssignments - e.g. { "led1:anode": "bb1:a5" }
 * @returns {Object} Map of compId -> parentBbId
 */
export function inferParentFromPinAssignments(pinAssignments) {
  if (!pinAssignments) return {};
  const parentMap = {};
  for (const [compPin, bbHole] of Object.entries(pinAssignments)) {
    const compId = compPin.split(':')[0];
    const bbId = bbHole.split(':')[0];
    if (compId !== bbId) {
      parentMap[compId] = bbId;
    }
  }
  return parentMap;
}
```

**Step 2: Verify build**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -5`
Expected: Build succeeds (new file is not yet imported)

**Step 3: Commit**

```bash
git add src/components/simulator/utils/parentChild.js
git commit -m "feat(antigravity): add parentChild helper module"
```

---

### Task 1.2: Propagate drag delta to child components

**Files:**
- Modify: `src/components/simulator/canvas/SimulatorCanvas.jsx` (lines 899-956)
- Import: `src/components/simulator/utils/parentChild.js`

**Step 1: Add import at top of SimulatorCanvas.jsx**

After the existing imports (around line 15), add:

```javascript
import { getChildComponents } from '../utils/parentChild';
```

**Step 2: Modify handleMouseMove to propagate delta to children**

In `handleMouseMove` (line 933-956), after the existing layout update logic, add child propagation. The current code has:

```javascript
// Current code at lines 947-955:
if (selectedComponents.has(dragCompId) && selectedComponents.size > 1) {
  for (const compId of selectedComponents) {
    const cPos = experiment.layout?.[compId] || { x: 0, y: 0 };
    onLayoutChange(compId, { ...cPos, x: cPos.x + dx, y: cPos.y + dy }, false);
  }
} else {
  onLayoutChange(dragCompId, lastDragPosRef.current, false);
}
```

Replace with:

```javascript
if (selectedComponents.has(dragCompId) && selectedComponents.size > 1) {
  for (const compId of selectedComponents) {
    const cPos = experiment.layout?.[compId] || { x: 0, y: 0 };
    onLayoutChange(compId, { ...cPos, x: cPos.x + dx, y: cPos.y + dy }, false);
  }
} else {
  onLayoutChange(dragCompId, lastDragPosRef.current, false);
}

// Antigravity: propagate delta to child components
const draggedComp = experiment.components?.find(c => c.id === dragCompId);
const isBreadboard = draggedComp && (draggedComp.type === 'breadboard-half' || draggedComp.type === 'breadboard-full');
if (isBreadboard && experiment.layout) {
  const children = getChildComponents(dragCompId, experiment.layout);
  for (const childId of children) {
    // Skip if already moved by multi-selection
    if (selectedComponents.has(childId) && selectedComponents.size > 1) continue;
    const childPos = experiment.layout[childId] || { x: 0, y: 0 };
    onLayoutChange(childId, { ...childPos, x: childPos.x + dx, y: childPos.y + dy }, false);
  }
}
```

**Step 3: Verify build**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -5`
Expected: 0 errors

**Step 4: Chrome test**

1. Open experiment with breadboard + components
2. Drag the breadboard
3. All snapped components should follow

**Step 5: Commit**

```bash
git add src/components/simulator/canvas/SimulatorCanvas.jsx
git commit -m "feat(antigravity): propagate drag delta to child components on breadboard move"
```

---

### Task 1.3: Auto-parenting on snap

**Files:**
- Modify: `src/components/simulator/canvas/SimulatorCanvas.jsx` (lines 913-931)

**Step 1: Set parentId when component snaps to breadboard**

In `handleMouseMove` (lines 913-931), the snap-to-hole logic already iterates breadboards. After the snap succeeds (`if (snap)`), set `parentId`:

Find the existing snap block:
```javascript
if (snap) {
  newX = snap.x;
  newY = snap.y;
  break;
}
```

Replace with:
```javascript
if (snap) {
  newX = snap.x;
  newY = snap.y;
  // Auto-parenting: mark this component as child of the breadboard
  if (experiment.layout?.[dragCompId] && experiment.layout[dragCompId].parentId !== bb.id) {
    onLayoutChange(dragCompId, { ...experiment.layout[dragCompId], parentId: bb.id }, false);
  }
  break;
}
```

**Step 2: De-parent when component moves away from all breadboards**

After the breadboard loop (after line 931), if NO snap was found, remove `parentId`:

```javascript
// After the for-loop over breadboards:
// De-parenting: if no breadboard snapped, remove parentId
if (!snapFound && experiment.layout?.[dragCompId]?.parentId) {
  const { parentId, ...rest } = experiment.layout[dragCompId];
  onLayoutChange(dragCompId, rest, false);
}
```

Note: Need to track `snapFound` — add `let snapFound = false;` before the breadboard loop and set it to `true` inside the `if (snap)` block.

**Step 3: Verify build**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -5`
Expected: 0 errors

**Step 4: Chrome test**

1. Drag a LED onto the breadboard → should snap + set parentId
2. Drag the LED away from breadboard → parentId removed
3. Drag breadboard → LED follows only when parented

**Step 5: Commit**

```bash
git add src/components/simulator/canvas/SimulatorCanvas.jsx
git commit -m "feat(antigravity): auto-parent on snap, de-parent on drag away"
```

---

### Task 1.4: Infer parentId for "Gia Montato" experiments

**Files:**
- Modify: `src/components/simulator/NewElabSimulator.jsx`
- Import: `src/components/simulator/utils/parentChild.js`

**Step 1: Add import**

```javascript
import { inferParentFromPinAssignments } from './utils/parentChild';
```

**Step 2: After experiment loads, infer and set parentIds**

Find where `loadExperiment` is called with the merged experiment (around line 816 or 1404). After the experiment layout is set, add:

```javascript
// Antigravity: infer parentId from pinAssignments for pre-built experiments
if (mergedExperiment.pinAssignments && mergedExperiment.layout) {
  const parentMap = inferParentFromPinAssignments(mergedExperiment.pinAssignments);
  let layoutChanged = false;
  for (const [compId, bbId] of Object.entries(parentMap)) {
    if (mergedExperiment.layout[compId] && !mergedExperiment.layout[compId].parentId) {
      mergedExperiment.layout[compId] = { ...mergedExperiment.layout[compId], parentId: bbId };
      layoutChanged = true;
    }
  }
}
```

**Step 3: Verify build + test with existing experiment**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -5`
Then open "LED Rosso" (Vol1, exp 1) in "Gia Montato" mode → drag breadboard → all components follow.

**Step 4: Commit**

```bash
git add src/components/simulator/NewElabSimulator.jsx
git commit -m "feat(antigravity): infer parentId from pinAssignments on experiment load"
```

---

### Task 1.5: Handle mouse-up commit for children

**Files:**
- Modify: `src/components/simulator/canvas/SimulatorCanvas.jsx` (lines 1053-1086)

**Step 1: In handleMouseUp, commit child positions too**

In `handleMouseUp` (around line 1075), after the main component is committed:
```javascript
onLayoutChange(pending.componentId, finalPos, true);
```

Add child commit:
```javascript
// Antigravity: commit child positions when breadboard drag ends
const dragComp = experiment.components?.find(c => c.id === pending.componentId);
const isBB = dragComp && (dragComp.type === 'breadboard-half' || dragComp.type === 'breadboard-full');
if (isBB && experiment.layout) {
  const children = getChildComponents(pending.componentId, experiment.layout);
  for (const childId of children) {
    const childPos = experiment.layout[childId];
    if (childPos) onLayoutChange(childId, childPos, true);
  }
}
```

**Step 2: Verify build + Chrome test**

Drag breadboard, release → undo should revert breadboard AND children.

**Step 3: Commit**

```bash
git add src/components/simulator/canvas/SimulatorCanvas.jsx
git commit -m "feat(antigravity): commit child positions on breadboard drag end"
```

---

## Phase 2: Drag & Drop UX

### Task 2.1: Increase SNAP_THRESHOLD

**Files:**
- Modify: `src/components/simulator/utils/breadboardSnap.js` (line with SNAP_THRESHOLD constant)

**Step 1: Change SNAP_THRESHOLD from 4.5 to 7**

Find: `const SNAP_THRESHOLD = 4.5;`
Replace: `const SNAP_THRESHOLD = 7;`

**Step 2: Verify build + Chrome test**

Drag component near breadboard — should snap from farther away.

**Step 3: Commit**

```bash
git add src/components/simulator/utils/breadboardSnap.js
git commit -m "feat(drag-ux): increase SNAP_THRESHOLD from 4.5 to 7px"
```

---

### Task 2.2: Ghost preview during drag

**Files:**
- Modify: `src/components/simulator/canvas/SimulatorCanvas.jsx`

**Step 1: Add snapPreview state**

Near the other state declarations (around line 50-80), add:

```javascript
const [snapPreview, setSnapPreview] = useState(null); // { x, y, compType }
```

**Step 2: Set snapPreview during drag**

In `handleMouseMove`, when snap succeeds, set the preview:

```javascript
if (snap) {
  newX = snap.x;
  newY = snap.y;
  setSnapPreview({ x: snap.x, y: snap.y, compType: draggedComp.type });
  // ... existing code
  break;
}
```

After the breadboard loop, if no snap found:
```javascript
if (!snapFound) {
  setSnapPreview(null);
}
```

Clear on mouseUp:
```javascript
setSnapPreview(null); // in handleMouseUp, near setIsDragging(false)
```

**Step 3: Render ghost preview SVG**

In the JSX render (in the SVG canvas area), add before the closing `</svg>`:

```jsx
{snapPreview && isDragging && (
  <rect
    x={snapPreview.x - 5}
    y={snapPreview.y - 5}
    width={30}
    height={20}
    rx={3}
    fill="none"
    stroke="#7CB342"
    strokeWidth={2}
    strokeDasharray="4,2"
    opacity={0.5}
    pointerEvents="none"
  />
)}
```

Note: This is a simplified ghost — a dashed green rectangle at the snap position. The exact size should match the component's bounding box. Adjust width/height based on `snapPreview.compType` using component dimensions from the registry.

**Step 4: Verify build + Chrome test**

Drag LED near breadboard → green dashed rectangle appears at snap position.

**Step 5: Commit**

```bash
git add src/components/simulator/canvas/SimulatorCanvas.jsx
git commit -m "feat(drag-ux): add ghost preview rectangle during snap"
```

---

### Task 2.3: Drop zone highlight (available holes)

**Files:**
- Modify: `src/components/simulator/canvas/SimulatorCanvas.jsx`

**Step 1: Add isDraggingComponent state tracking**

The `isDragging` state already exists. Add a render of available holes when dragging a non-breadboard component near a breadboard.

**Step 2: Render available hole indicators**

In the SVG render, add after the breadboard components but before wires:

```jsx
{isDragging && dragCompId && experiment?.components && (() => {
  const dragComp = experiment.components.find(c => c.id === dragCompId);
  if (!dragComp || dragComp.type === 'breadboard-half' || dragComp.type === 'breadboard-full') return null;

  const breadboards = experiment.components.filter(
    c => c.type === 'breadboard-half' || c.type === 'breadboard-full'
  );

  return breadboards.map(bb => {
    const bbPos = experiment.layout?.[bb.id] || { x: 0, y: 0 };
    // Render a subtle highlight on the breadboard when component is being dragged
    return (
      <rect
        key={`dz-${bb.id}`}
        x={bbPos.x}
        y={bbPos.y}
        width={bb.type === 'breadboard-full' ? 330 : 165}
        height={55}
        rx={3}
        fill="#7CB342"
        opacity={0.08}
        pointerEvents="none"
      />
    );
  });
})()}
```

This is a simplified version — a subtle green overlay on the entire breadboard during drag. Individual hole highlighting would require knowing the hole grid layout, which can be added later as a refinement.

**Step 3: Verify build + Chrome test**

Drag a component → breadboard gets subtle green tint.

**Step 4: Commit**

```bash
git add src/components/simulator/canvas/SimulatorCanvas.jsx
git commit -m "feat(drag-ux): add drop zone highlight on breadboard during drag"
```

---

## Phase 3: Dynamic Pin Assignment + Validation

### Task 3.1: Re-compute pinAssignments on drag end

**Files:**
- Modify: `src/components/simulator/canvas/SimulatorCanvas.jsx` (handleMouseUp)
- Use: `breadboardSnap.js:computeAutoPinAssignment`

**Step 1: After snap commit in handleMouseUp, re-compute pin assignments**

In `handleMouseUp`, after the valid placement commit block, trigger pin assignment recompute:

```javascript
// After: onLayoutChange(pending.componentId, finalPos, true);
// Re-compute pin assignments if component snapped to breadboard
if (finalPos.parentId && onPinAssignmentChange) {
  const bbPos = experiment.layout?.[finalPos.parentId] || { x: 0, y: 0 };
  const newAssignments = computeAutoPinAssignment(
    pending.componentId, pending.compType, finalPos.x, finalPos.y,
    finalPos.parentId, bbPos
  );
  if (newAssignments) {
    onPinAssignmentChange(pending.componentId, newAssignments);
  }
}
```

Note: `onPinAssignmentChange` is a new callback prop that needs to be threaded from NewElabSimulator.jsx. It should update `experiment.pinAssignments` and re-run `solverRef.current.loadExperiment()`.

**Step 2: Add onPinAssignmentChange prop to SimulatorCanvas**

In `NewElabSimulator.jsx`, define the callback and pass it to SimulatorCanvas:

```javascript
const handlePinAssignmentChange = useCallback((compId, newAssignments) => {
  setExperiment(prev => {
    const updated = { ...prev };
    const pa = { ...(updated.pinAssignments || {}) };
    // Remove old assignments for this component
    for (const key of Object.keys(pa)) {
      if (key.startsWith(`${compId}:`)) delete pa[key];
    }
    // Add new assignments
    Object.assign(pa, newAssignments);
    updated.pinAssignments = pa;
    return updated;
  });
  // Re-solve circuit
  if (solverRef.current) {
    solverRef.current.loadExperiment(experiment, { preserveState: true });
    setComponentStates(solverRef.current.getState());
  }
}, [experiment]);
```

**Step 3: Verify build + Chrome test**

Drag LED to different breadboard hole → circuit re-solves → LED state updates.

**Step 4: Commit**

```bash
git add src/components/simulator/canvas/SimulatorCanvas.jsx src/components/simulator/NewElabSimulator.jsx
git commit -m "feat(mapping): dynamic pin assignment on drag end, auto re-solve"
```

---

### Task 3.2: Circuit status indicator in toolbar

**Files:**
- Modify: `src/components/simulator/panels/ControlBar.jsx`
- Modify: `src/components/simulator/ElabSimulator.css`

**Step 1: Add CircuitStatusChip component in ControlBar**

Before the overflow menu, add a status indicator:

```jsx
{/* Circuit Status Indicator */}
{circuitWarning && (
  <div className="toolbar-group">
    <button
      className={`toolbar-btn toolbar-btn--status toolbar-btn--status-${circuitWarning.type === 'short-circuit' ? 'error' : 'warning'}`}
      onClick={() => setShowCircuitDetails(prev => !prev)}
      title={circuitWarning.message}
    >
      <span className="toolbar-btn__icon">
        {circuitWarning.type === 'short-circuit' ? '\u26A0' : '\u26A0'}
      </span>
      <span className="toolbar-btn__label">
        {circuitWarning.type === 'short-circuit' ? 'Corto!' : 'Warning'}
      </span>
    </button>
  </div>
)}
```

**Step 2: Add CSS for status chip**

```css
.toolbar-btn--status-error {
  background: #FFEBEE !important;
  color: #C62828 !important;
  border: 1px solid #EF5350 !important;
}
.toolbar-btn--status-warning {
  background: #FFF3E0 !important;
  color: #E65100 !important;
  border: 1px solid #FF9800 !important;
}
```

**Step 3: Thread circuitWarning prop from NewElabSimulator**

`circuitWarning` state already exists in NewElabSimulator.jsx (set by `solverRef.current.onWarning`). Pass it to ControlBar.

**Step 4: Verify build + Chrome test**

Create a short circuit → red "Corto!" chip appears in toolbar.

**Step 5: Commit**

```bash
git add src/components/simulator/panels/ControlBar.jsx src/components/simulator/ElabSimulator.css src/components/simulator/NewElabSimulator.jsx
git commit -m "feat(mapping): circuit status indicator in toolbar (warning/error chips)"
```

---

## Phase 4: Physics Improvements

### Task 4.1: Public measurement APIs on CircuitSolver

**Files:**
- Modify: `src/components/simulator/engine/CircuitSolver.js`

**Step 1: Add getComponentCurrents() method**

After `getNodeVoltage()` (around line 1575), add:

```javascript
/**
 * Get currents for all components that have them.
 * @returns {Object} Map of componentId -> current in Amps
 */
getComponentCurrents() {
  const currents = {};
  if (this._mnaBranchCurrents) {
    for (const [id, current] of this._mnaBranchCurrents) {
      currents[id] = current;
    }
  }
  // Also check component state for path-traced currents
  for (const [id, comp] of this.components) {
    if (comp.state?.current !== undefined && !(id in currents)) {
      currents[id] = comp.state.current;
    }
  }
  return currents;
}

/**
 * Get voltages at all nodes with known values.
 * @returns {Object} Map of pinRef -> voltage in Volts
 */
getNodeVoltages() {
  const voltages = {};
  if (this._mnaNodeVoltages) {
    for (const [net, v] of this._mnaNodeVoltages) {
      voltages[net] = v;
    }
  }
  if (this._supplyNets) {
    for (const [net, v] of this._supplyNets) {
      if (!(net in voltages)) voltages[net] = v;
    }
  }
  return voltages;
}

/**
 * Get all measurements for a specific component.
 * @param {string} compId
 * @returns {Object|null} { voltage, current, resistance, power } or null
 */
getComponentMeasurements(compId) {
  const comp = this.components.get(compId);
  if (!comp) return null;
  const state = comp.state || {};
  const current = this._mnaBranchCurrents?.get(compId) ?? state.current ?? null;
  const voltage = state.voltage ?? null;
  return {
    voltage,
    current,
    resistance: state.resistance ?? comp.value ?? null,
    power: (voltage !== null && current !== null) ? Math.abs(voltage * current) : null,
  };
}
```

**Step 2: Verify build**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -5`

**Step 3: Commit**

```bash
git add src/components/simulator/engine/CircuitSolver.js
git commit -m "feat(physics): add public measurement APIs (getComponentCurrents, getNodeVoltages, getComponentMeasurements)"
```

---

### Task 4.2: Transient RC model

**Files:**
- Modify: `src/components/simulator/engine/CircuitSolver.js`

**Step 1: Add capacitor charging model in solve()**

In the `_solveAllLoads` method, find where capacitor state is handled. Add RC transient computation:

```javascript
// In capacitor handling section:
if (comp.type === 'capacitor') {
  const C = comp.value || 100e-6; // Farads (default 100uF)
  const seriesR = this._findSeriesResistance(id) || 1000; // Ohms
  const tau = seriesR * C; // RC time constant
  const supplyV = this._getSupplyVoltageForComponent(id) || 0;

  if (this.running && supplyV > 0) {
    // Charging: V(t) = Vs * (1 - e^(-t/RC))
    const prevV = comp.state.voltage || 0;
    const targetV = supplyV;
    const dt = this.dt || 1/30;
    const newV = targetV - (targetV - prevV) * Math.exp(-dt / tau);
    comp.state.voltage = newV;
    comp.state.charging = newV < targetV * 0.99;
    comp.state.charged = !comp.state.charging;
  } else if (this.running && supplyV === 0 && comp.state.voltage > 0) {
    // Discharging: V(t) = V0 * e^(-t/RC)
    const dt = this.dt || 1/30;
    const newV = comp.state.voltage * Math.exp(-dt / tau);
    comp.state.voltage = newV < 0.01 ? 0 : newV;
    comp.state.charging = false;
    comp.state.charged = false;
  }
}
```

**Step 2: Verify build + Chrome test**

Load an experiment with a capacitor → start simulation → observe gradual voltage change in component state.

**Step 3: Commit**

```bash
git add src/components/simulator/engine/CircuitSolver.js
git commit -m "feat(physics): RC transient model for capacitor charging/discharging"
```

---

## Phase 5: SessionRecorder

### Task 5.1: Create SessionRecorder context

**Files:**
- Create: `src/components/simulator/context/SessionRecorderContext.jsx`

**Step 1: Create the context provider**

```jsx
// src/components/simulator/context/SessionRecorderContext.jsx
import { createContext, useContext, useCallback, useRef } from 'react';

const SessionRecorderContext = createContext(null);

export function useSessionRecorder() {
  return useContext(SessionRecorderContext);
}

export function SessionRecorderProvider({ children }) {
  const eventsRef = useRef([]);
  const snapshotsRef = useRef([]);
  const startTimeRef = useRef(Date.now());

  const log = useCallback((type, details = {}) => {
    eventsRef.current.push({
      timestamp: Date.now() - startTimeRef.current,
      type,
      ...details,
    });
  }, []);

  const snapshot = useCallback((circuitState) => {
    snapshotsRef.current.push({
      timestamp: Date.now() - startTimeRef.current,
      state: circuitState,
    });
  }, []);

  const getTimeline = useCallback(() => eventsRef.current, []);
  const getSnapshots = useCallback(() => snapshotsRef.current, []);
  const getDuration = useCallback(() => Math.round((Date.now() - startTimeRef.current) / 1000), []);

  const reset = useCallback(() => {
    eventsRef.current = [];
    snapshotsRef.current = [];
    startTimeRef.current = Date.now();
  }, []);

  const value = { log, snapshot, getTimeline, getSnapshots, getDuration, reset };

  return (
    <SessionRecorderContext.Provider value={value}>
      {children}
    </SessionRecorderContext.Provider>
  );
}
```

**Step 2: Verify build**

**Step 3: Commit**

```bash
git add src/components/simulator/context/SessionRecorderContext.jsx
git commit -m "feat(recorder): create SessionRecorderContext with timeline logging"
```

---

### Task 5.2: Wrap simulator with SessionRecorderProvider

**Files:**
- Modify: `src/components/simulator/NewElabSimulator.jsx`

**Step 1: Import and wrap**

```javascript
import { SessionRecorderProvider } from './context/SessionRecorderContext';
```

Wrap the main return JSX with `<SessionRecorderProvider>`.

**Step 2: Add recording calls at key points**

- Component placed: in `handleLayoutChange`, call `recorder.log('component_placed', { id, position })`
- Wire connected: in wire creation handler, call `recorder.log('wire_connected', { from, to })`
- Simulation start/stop: in play/pause handlers
- Code compiled: in compile handler
- Quiz answered: in quiz handler

**Step 3: Verify build + commit**

```bash
git commit -m "feat(recorder): integrate SessionRecorder into simulator lifecycle"
```

---

## Phase 6: Lab Notebook PDF

### Task 6.1: Rewrite SessionReportPDF with 8 sections

**Files:**
- Modify: `src/components/report/SessionReportPDF.jsx`

**Step 1: Update generateSessionReportPDF signature**

```javascript
export async function generateSessionReportPDF(sessionData, circuitScreenshot, aiSummary, recorderData) {
  // recorderData = { timeline, snapshots, measurements, duration }
```

**Step 2: Add new pages**

Add Page 5 (Procedura) with timeline from SessionRecorder:

```jsx
{/* Page 5: Procedura */}
{recorderData?.timeline?.length > 0 && (
  <R.Page size="A4" style={s.page}>
    {headerBar}{footerFn(pageNum++)}
    <R.Text style={s.sectionTitle}>Procedura</R.Text>
    {recorderData.timeline
      .filter(e => ['component_placed', 'wire_connected', 'simulation_started', 'simulation_stopped', 'code_compiled'].includes(e.type))
      .map((event, i) => (
        <R.View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <R.Text style={{ width: 60, color: '#999', fontSize: 8 }}>
            {formatTime(event.timestamp)}
          </R.Text>
          <R.Text style={{ fontSize: 9, flex: 1 }}>
            {eventToText(event)}
          </R.Text>
        </R.View>
      ))
    }
  </R.Page>
)}
```

Add Page 6 (Misure) with electrical measurements:

```jsx
{/* Page 6: Misure */}
{recorderData?.measurements && Object.keys(recorderData.measurements).length > 0 && (
  <R.Page size="A4" style={s.page}>
    {headerBar}{footerFn(pageNum++)}
    <R.Text style={s.sectionTitle}>Misure Elettriche</R.Text>
    <R.View style={{ borderWidth: 1, borderColor: '#ddd' }}>
      <R.View style={{ flexDirection: 'row', backgroundColor: '#1E4D8C', padding: 6 }}>
        <R.Text style={{ flex: 1, color: '#fff', fontSize: 9, fontFamily: 'Oswald' }}>Componente</R.Text>
        <R.Text style={{ width: 70, color: '#fff', fontSize: 9, fontFamily: 'Oswald' }}>Tensione</R.Text>
        <R.Text style={{ width: 70, color: '#fff', fontSize: 9, fontFamily: 'Oswald' }}>Corrente</R.Text>
        <R.Text style={{ width: 70, color: '#fff', fontSize: 9, fontFamily: 'Oswald' }}>Potenza</R.Text>
      </R.View>
      {Object.entries(recorderData.measurements).map(([id, m]) => (
        <R.View key={id} style={{ flexDirection: 'row', padding: 4, borderBottomWidth: 0.5, borderColor: '#eee' }}>
          <R.Text style={{ flex: 1, fontSize: 9 }}>{getComponentName(id)}</R.Text>
          <R.Text style={{ width: 70, fontSize: 9 }}>{m.voltage != null ? `${m.voltage.toFixed(2)} V` : '-'}</R.Text>
          <R.Text style={{ width: 70, fontSize: 9 }}>{m.current != null ? `${(m.current * 1000).toFixed(1)} mA` : '-'}</R.Text>
          <R.Text style={{ width: 70, fontSize: 9 }}>{m.power != null ? `${(m.power * 1000).toFixed(1)} mW` : '-'}</R.Text>
        </R.View>
      ))}
    </R.View>
  </R.Page>
)}
```

**Step 3: Update styles with ELAB palette**

Use Poppins for display titles (requires font registration), volume-colored header bars.

**Step 4: Verify build + Chrome test**

Generate report → should have 8 sections.

**Step 5: Commit**

```bash
git add src/components/report/SessionReportPDF.jsx
git commit -m "feat(report): 8-section lab notebook with timeline, measurements, ELAB styling"
```

---

## Phase 7: Circuit State API

### Task 7.1: Create CircuitStateAPI module

**Files:**
- Create: `src/components/simulator/engine/CircuitStateAPI.js`

**Step 1: Create the API**

```javascript
// src/components/simulator/engine/CircuitStateAPI.js

/**
 * Build a structured circuit state object for Galileo consumption.
 */
export function getCircuitState(experiment, solver, componentStates, codeContent) {
  if (!experiment) return null;

  const components = (experiment.components || []).map(comp => ({
    id: comp.id,
    type: comp.type,
    value: comp.value || null,
    color: comp.color || null,
    position: experiment.layout?.[comp.id] || null,
    breadboardHole: findBreadboardHole(comp.id, experiment.pinAssignments),
    parentId: experiment.layout?.[comp.id]?.parentId || null,
  }));

  const connections = (experiment.connections || []).map(conn => ({
    from: conn.from,
    to: conn.to,
    wireColor: conn.color || 'black',
  }));

  const measurements = {};
  if (solver) {
    for (const comp of experiment.components || []) {
      const m = solver.getComponentMeasurements?.(comp.id);
      if (m && (m.voltage !== null || m.current !== null)) {
        measurements[comp.id] = m;
      }
    }
  }

  const warnings = [];
  // Collect validation messages from solver
  if (solver?._shortCircuit) warnings.push('Corto circuito rilevato');

  return {
    components,
    connections,
    measurements,
    status: solver?._shortCircuit ? 'error' : warnings.length > 0 ? 'warning' : 'ok',
    errors: warnings,
    isSimulating: solver?.running || false,
    arduinoCode: codeContent || null,
  };
}

function findBreadboardHole(compId, pinAssignments) {
  if (!pinAssignments) return null;
  const holes = {};
  for (const [compPin, bbHole] of Object.entries(pinAssignments)) {
    if (compPin.startsWith(`${compId}:`)) {
      const pinName = compPin.split(':')[1];
      holes[pinName] = bbHole;
    }
  }
  return Object.keys(holes).length > 0 ? holes : null;
}
```

**Step 2: Verify build + commit**

```bash
git add src/components/simulator/engine/CircuitStateAPI.js
git commit -m "feat(galileo): create CircuitStateAPI for structured circuit state"
```

---

### Task 7.2: Send circuitState with every Galileo message

**Files:**
- Modify: `src/components/simulator/ElabTutorV4.jsx` (around line 1208)
- Modify: `src/services/api.js` (around line 116)

**Step 1: Build circuitState from CircuitStateAPI**

In ElabTutorV4.jsx, replace the current `circuitStateRef.current` raw format with the structured API:

```javascript
import { getCircuitState } from './engine/CircuitStateAPI';

// In the sendChat call:
circuitState: isNonSimulatorVisual ? null :
  getCircuitState(experiment, solverRef.current, componentStates, codeContent),
```

**Step 2: Verify the payload reaches nanobot**

Check browser DevTools Network tab — the POST to `/tutor-chat` should include structured `circuitState` with components, measurements, etc.

**Step 3: Commit**

```bash
git add src/components/simulator/ElabTutorV4.jsx
git commit -m "feat(galileo): send structured circuitState in every chat message"
```

---

## Phase 8: Galileo New Action Tags

### Task 8.1: Add new action tags to ElabTutorV4

**Files:**
- Modify: `src/components/simulator/ElabTutorV4.jsx` (lines 1529-1701)

**Step 1: Add placecomponent action (precise placement)**

After the existing `addcomponent` handler (line 1613), add:

```javascript
else if (cmd === 'placecomponent') {
  // [AZIONE:placecomponent:type:color:bbId:hole]
  if (!api?.addComponent) throw new Error('addComponent non disponibile');
  const type = TYPE_ALIASES[normalizeComponentToken(parts[1])] || parts[1];
  const color = parts[2] || null;
  const bbId = parts[3] || 'bb1';
  const hole = parts[4] || 'a1';

  // Find breadboard position and compute hole coordinates
  const bbPos = experiment?.layout?.[bbId] || { x: 100, y: 50 };
  const holePos = computeHolePosition(bbPos.x, bbPos.y, hole);

  const addedId = api.addComponent(type, { x: holePos.x, y: holePos.y });
  if (!addedId) throw new Error(`piazzamento fallito: ${type}`);
  if (color) api.setComponentProperty?.(addedId, 'color', color);
  executedActions.push(`placecomponent:${addedId}@${hole}`);
}
```

**Step 2: Add connectwire action (with color)**

```javascript
else if (cmd === 'connectwire') {
  // [AZIONE:connectwire:fromComp:fromPin:toComp:toPin:color]
  if (!api?.addWire) throw new Error('addWire non disponibile');
  const fromId = resolveSingleComponentId(parts[1]);
  const toId = resolveSingleComponentId(parts[3]);
  if (!fromId || !toId) throw new Error('componenti non trovati');

  const fromPin = `${fromId}:${parts[2]}`;
  const toPin = `${toId}:${parts[4]}`;
  const wireColor = parts[5] || 'black';

  api.addWire(fromPin, toPin, wireColor);
  executedActions.push(`connectwire:${fromPin}->${toPin}`);
}
```

**Step 3: Add setvalue action**

```javascript
else if (cmd === 'setvalue') {
  // [AZIONE:setvalue:compId:value]
  const targetId = resolveSingleComponentId(parts[1]);
  if (!targetId) throw new Error(`componente non trovato: ${parts[1]}`);
  const newValue = parseFloat(parts[2]);
  if (isNaN(newValue)) throw new Error(`valore non valido: ${parts[2]}`);

  api.setComponentProperty?.(targetId, 'value', newValue);
  executedActions.push(`setvalue:${targetId}=${newValue}`);
}
```

**Step 4: Add measure action**

```javascript
else if (cmd === 'measure') {
  // [AZIONE:measure:compId]
  const targetId = resolveSingleComponentId(parts[1]);
  if (!targetId) throw new Error(`componente non trovato: ${parts[1]}`);

  const measurements = solverRef?.current?.getComponentMeasurements?.(targetId);
  if (measurements) {
    const mText = `Misure ${targetId}: V=${measurements.voltage?.toFixed(2) ?? '?'}V, I=${measurements.current ? (measurements.current * 1000).toFixed(1) + 'mA' : '?'}`;
    // Append measurement result to response text
    executedActions.push(`measure:${mText}`);
  }
}
```

**Step 5: Add diagnose action**

```javascript
else if (cmd === 'diagnose') {
  // [AZIONE:diagnose]
  const state = getCircuitState(experiment, solverRef?.current, componentStates, codeContent);
  if (state) {
    const diagText = `Stato: ${state.status}, ${state.components.length} componenti, ${state.connections.length} connessioni`;
    executedActions.push(`diagnose:${diagText}`);
  }
}
```

**Step 6: Verify build + Chrome test**

Test in Galileo chat: ask "piazza un LED rosso sulla breadboard" → should trigger placecomponent action.

**Step 7: Commit**

```bash
git add src/components/simulator/ElabTutorV4.jsx
git commit -m "feat(galileo): add 5 new action tags (placecomponent, connectwire, setvalue, measure, diagnose)"
```

---

### Task 8.2: Update nanobot.yml with circuit state awareness

**Files:**
- Modify: `nanobot/nanobot.yml`

**Step 1: Add circuit state instructions to system prompt**

In the tutor system prompt section, add:

```yaml
# Circuit State Awareness
Hai accesso allo stato reale del circuito dello studente tramite il campo `circuitState`.
Quando ricevi una domanda sul circuito:
1. Guarda `circuitState.components` per sapere cosa c'e' sulla breadboard
2. Guarda `circuitState.measurements` per le misure V/I di ogni componente
3. Guarda `circuitState.connections` per i fili collegati
4. Guarda `circuitState.status` per sapere se c'e' un errore (corto circuito, warning)
5. NON dire "prova a controllare" — guarda TU i dati e digli esattamente cosa manca o cosa non va

# Nuovi Action Tags
Oltre ai tag esistenti, puoi usare:
- [AZIONE:placecomponent:tipo:colore:bb1:foro] — piazza componente su foro preciso
- [AZIONE:connectwire:comp1:pin1:comp2:pin2:colore] — collega filo con colore
- [AZIONE:setvalue:comp:valore] — imposta valore componente (es. resistenza)
- [AZIONE:measure:comp] — leggi misure V/I del componente
- [AZIONE:diagnose] — analisi completa dello stato del circuito
```

**Step 2: Deploy nanobot**

Push changes to Render:
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/nanobot"
git add nanobot.yml && git commit -m "feat: circuit state awareness + 5 new action tags" && git push
```

**Step 3: Verify health**

```bash
curl -s https://elab-galileo.onrender.com/health | head -5
```

**Step 4: Commit frontend**

```bash
git commit -m "feat(galileo): nanobot prompt updated with circuit state awareness"
```

---

## Final Verification

### Task F.1: Full regression test

**Step 1: Build**
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build 2>&1 | tail -5
```
Expected: 0 errors

**Step 2: Vitest**
```bash
npx vitest run 2>&1 | tail -10
```
Expected: All tests pass

**Step 3: Chrome manual test**
1. Open any Vol1 experiment in "Gia Montato"
2. Drag breadboard → all components follow (antigravity)
3. Drag LED near breadboard → ghost preview appears (drag UX)
4. Drop LED on breadboard → circuit re-solves (dynamic mapping)
5. Start simulation → LED lights up (physics)
6. Generate report → 8-section PDF (lab notebook)
7. Ask Galileo "cosa vedi nel mio circuito?" → gets structured state (omnipotence)

**Step 4: Deploy**
```bash
npx vercel --prod --yes
```

**Step 5: Production test at https://www.elabtutor.school**
