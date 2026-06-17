# Session 30: Drag&Drop + Monta tu + Sandbox + Notes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add drag&drop interactive build experience with 3 modes (Completo, Monta tu, Sandbox guidata), redesign battery to match book PDF, add notes panel, and filter components per volume.

**Architecture:** Enhance existing BuildMode system (BuildModeGuide + buildStepIndex) with drag&drop validation, add ComponentDrawer bottom panel, add Sandbox mode, add NotesPanel. Battery9V SVG redesigned to match book. Registry extended with `volumeAvailableFrom` field.

**Tech Stack:** React 18, SVG, HTML5 Drag&Drop API (already in use), CSS-in-JS inline styles (project convention), localStorage for notes persistence.

**CRITICAL CONSTRAINT:** The simulator MUST continue to function perfectly. Zero regressions. Modalità "Completo" path is untouched. CircuitSolver, WireRenderer, AVR bridge — ZERO changes.

---

## Task 1: Add `volumeAvailableFrom` to Component Registry

**Files:**
- Modify: `src/components/simulator/components/registry.js` — add `getComponentsByVolume()` export
- Modify: Each component registration call across ~15 component files

**Step 1: Add `getComponentsByVolume` function to registry.js**

Add after `getComponentsByCategory`:

```javascript
/**
 * Get components available for a specific volume (cumulative).
 * Vol.1 = components with volumeAvailableFrom <= 1
 * Vol.2 = components with volumeAvailableFrom <= 2
 * Vol.3 = all components
 * @param {number} volumeNumber — 1, 2, or 3
 * @returns {Array}
 */
export function getComponentsByVolume(volumeNumber) {
  return Array.from(registry.values()).filter(
    c => (c.volumeAvailableFrom || 1) <= volumeNumber
  );
}
```

**Step 2: Add `volumeAvailableFrom` to each component registration**

In each component's `registerComponent()` call, add the field. Mapping:

| Component | volumeAvailableFrom | Reasoning (book chapters) |
|-----------|-------------------|--------------------------|
| battery9v | 1 | Cap 4 (breadboard intro) |
| breadboard-half | 1 | Cap 4 |
| breadboard-full | 1 | Cap 4 |
| resistor | 1 | Cap 6 (first LED circuit) |
| led | 1 | Cap 6 |
| rgb-led | 1 | Cap 7 |
| push-button | 1 | Cap 8 |
| wire | 1 | Cap 6 |
| capacitor | 2 | Cap 9 |
| potentiometer | 2 | Cap 9 |
| buzzer-piezo | 2 | Cap 10 |
| photo-resistor | 2 | Cap 11 |
| motor-dc | 2 | Cap 12 |
| servo | 2 | Cap 13 |
| diode | 2 | Cap 14 |
| nano-r4 | 3 | Cap 15 |
| mosfet-n | 3 | Cap 16 |
| lcd16x2 | 3 | Cap 17 |
| phototransistor | 3 | Cap 17 |
| reed-switch | 3 | Cap 18 |
| multimeter | 1 | Tool — always available |

Example for Battery9V.jsx:
```javascript
registerComponent('battery9v', {
  component: Battery9V,
  pins: Battery9V.pins,
  defaultState: Battery9V.defaultState,
  category: 'power',
  label: 'Batteria 9V',
  icon: '🔋',
  volumeAvailableFrom: 1,
});
```

**Step 3: Verify build passes**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build`
Expected: Build succeeds with 0 new warnings.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add volumeAvailableFrom to component registry for per-volume filtering"
```

---

## Task 2: Add "Sandbox guidata" Mode to ExperimentPicker

**Files:**
- Modify: `src/components/simulator/panels/ExperimentPicker.jsx`

**Step 1: Change segmented control from 2 to 3 buttons**

Currently: `buildMode` is a boolean (false = "Già montato", true = "Monta tu!").
Change to: `buildMode` is a string: `'complete'` | `'guided'` | `'sandbox'`.

In ExperimentPicker.jsx, replace the `useState(false)` with `useState('complete')` and update the segmented control:

```javascript
const [buildMode, setBuildMode] = useState('complete');
```

Replace the 2-button segmented control (lines ~176-211) with 3 buttons:

- "Completo" (icon: checkmark, color: navy #1E4D8C when active)
- "Monta tu!" (icon: wrench, color: lime #7CB342 when active)
- "Sandbox" (icon: puzzle, color: volume color when active)

**Step 2: Update `onSelectExperiment` callback**

Change line ~221 from:
```javascript
onSelectExperiment({ ...exp, buildMode: buildMode && hasBuildSteps })
```
To:
```javascript
onSelectExperiment({ ...exp, buildMode: buildMode !== 'complete' ? buildMode : false })
```

This passes `buildMode: 'guided'` or `'sandbox'` or `false`.

**Step 3: Update NewElabSimulator to handle new buildMode values**

In `handleSelectExperiment` (around line 947), change:
```javascript
setBuildStepIndex(experiment.buildMode ? -1 : Infinity);
```
To:
```javascript
setBuildStepIndex(experiment.buildMode === 'guided' ? -1 : experiment.buildMode === 'sandbox' ? -1 : Infinity);
```

**Step 4: Verify build + test manually that "Completo" mode still works exactly as before**

Run: `npm run build`
Expected: 0 errors, 0 new warnings. "Completo" mode unchanged.

**Step 5: Commit**

---

## Task 3: Redesign Battery9V SVG to Match Book PDF

**Files:**
- Modify: `src/components/simulator/components/Battery9V.jsx`

**CRITICAL:** Pin names MUST stay `positive` and `negative`. Only SVG graphics change.

**Step 1: Redesign the battery**

Study the PDF (volume1.pdf pages 30-48) reference carefully. The book shows:
- Battery 9V with dark rectangular body
- Snap-on clip connector visible at top
- "9V" text on body
- Red wire (+) and black wire (-) coming from clip
- Battery is shown as a standalone component next to the breadboard

Redesign the SVG to match the book illustration style. Key changes:
- Redraw body shape/proportions to match book
- Ensure "+" is on the correct side matching the book
- Pin coordinates updated to match new layout
- All gradient IDs remain unique via `uid`

**Pin definition update** (at bottom of file):
```javascript
Battery9V.pins = [
  { id: 'positive', label: '+ (9V)', x: NEW_X, y: NEW_Y, type: 'power' },
  { id: 'negative', label: '− (GND)', x: NEW_X2, y: NEW_Y2, type: 'power' }
];
```

The exact x/y values depend on the new SVG layout. The NAMES stay identical.

**Step 2: Verify no solver regression**

Run: `npm run build`
Then manually test: open simulator, pick a Vol.1 experiment in "Completo" mode. Battery should render with new graphic. Circuit should solve identically (solver uses pin names, not coords).

**Step 3: Commit**

---

## Task 4: Create ComponentDrawer (Bottom Drawer)

**Files:**
- Create: `src/components/simulator/panels/ComponentDrawer.jsx`

**Step 1: Create the drawer component**

The ComponentDrawer is a bottom-anchored panel with:
- **Header**: drag handle (gray bar 40px wide), title, collapse toggle
- **Collapsed state**: 48px tall, shows only "Componenti" title
- **Expanded state**: ~180px tall
- **Two modes**:
  - `mode='guided'`: Shows current build step (icon + text + hint + "Avanti"/"Indietro" buttons)
  - `mode='sandbox'`: Shows grid of draggable components for the current experiment's volume

Props:
```typescript
{
  mode: 'guided' | 'sandbox',
  experiment: object,          // current experiment with buildSteps
  currentStep: number,         // -1 = intro, 0..N = step index
  onStepChange: (index) => void,
  volumeNumber: number,        // 1, 2, or 3 — for component filtering
  onComponentDrag: (type) => void, // when user starts dragging a component
}
```

Design: white background, top border-radius 16px, box-shadow upward, ELAB palette. Font: Oswald headers, Open Sans body. Min fontSize 14px (WCAG).

**Drag support** for sandbox mode: each component card sets `application/elab-component` data on dragStart (same format as existing ComponentPalette — `JSON.stringify({ type })`).

**Step 2: Verify build**

**Step 3: Commit**

---

## Task 5: Create NotesPanel (Refined Notes)

**Files:**
- Create: `src/components/simulator/panels/NotesPanel.jsx`

**Step 1: Create the notes panel**

Inspired by the "NOTE" section of the book (page 42):
- Background: subtle green circuit pattern (like book)
- Lined paper effect (horizontal rules every ~28px)
- Text input area (contentEditable or textarea styled to look like paper)
- Pen tools: thin (1px), medium (2px), thick (4px)
- Colors: navy (#1E4D8C), lime (#7CB342), red (#E54B3D), black (#1A1A2E)
- Save to localStorage with key `elab_notes_${experimentId}`
- Overlay/sidebar toggle via 📝 button in toolbar

Props:
```typescript
{
  experimentId: string,
  visible: boolean,
  onClose: () => void,
}
```

Design: elegant floating panel (right side), 320px wide, max-height 60vh, scrollable. Header with "Appunti" title in Oswald + close button.

The notes are TEXT-BASED (not canvas drawing). The "pen tools" control text color and weight. This is a refined text notepad, not a drawing whiteboard (WhiteboardOverlay already exists for that).

**Step 2: Verify build**

**Step 3: Commit**

---

## Task 6: Integrate ComponentDrawer + NotesPanel into NewElabSimulator

**Files:**
- Modify: `src/components/simulator/NewElabSimulator.jsx`

**Step 1: Import new components**

```javascript
import ComponentDrawer from './panels/ComponentDrawer';
import NotesPanel from './panels/NotesPanel';
```

**Step 2: Add state for drawer and notes visibility**

```javascript
const [showDrawer, setShowDrawer] = useState(false);
const [showNotes, setShowNotes] = useState(false);
```

**Step 3: Show ComponentDrawer when buildMode is 'guided' or 'sandbox'**

After the canvas container, before the bottom panel section, render:

```jsx
{currentExperiment && (currentExperiment.buildMode === 'guided' || currentExperiment.buildMode === 'sandbox') && (
  <ComponentDrawer
    mode={currentExperiment.buildMode}
    experiment={currentExperiment}
    currentStep={buildStepIndex}
    onStepChange={handleBuildStepChange}
    volumeNumber={selectedVolume}
  />
)}
```

For `'guided'` mode, the ComponentDrawer replaces the floating BuildModeGuide (which was an overlay). Hide BuildModeGuide when drawer is shown:

In the JSX where BuildModeGuide is rendered (around line 2416), add condition:
```jsx
{showGuide && currentExperiment && currentExperiment.buildMode === 'guided' && !showDrawer
  ? <BuildModeGuide ... />
  : null
}
```

Actually, since ComponentDrawer handles guided mode in the drawer, we should default to showing the drawer and HIDE the floating BuildModeGuide when the drawer is handling it. The drawer IS the new guide for "Monta tu!" mode.

**Step 4: Add 📝 Notes button to ControlBar**

Add a notes toggle button. In ControlBar or the toolbar area, add:
```jsx
<button onClick={() => setShowNotes(prev => !prev)} title="Appunti">
  📝
</button>
```

**Step 5: Render NotesPanel**

```jsx
<NotesPanel
  experimentId={currentExperiment?.id}
  visible={showNotes}
  onClose={() => setShowNotes(false)}
/>
```

**Step 6: Track selectedVolume**

Add state to track which volume is selected (needed for component filtering):
```javascript
const [selectedVolume, setSelectedVolume] = useState(1);
```

Update in `handleSelectExperiment`:
```javascript
// Detect volume from experiment ID prefix
const volNum = experiment.id.startsWith('v3-') ? 3 : experiment.id.startsWith('v2-') ? 2 : 1;
setSelectedVolume(volNum);
```

**Step 7: Verify build + manual test all 3 modes**

Run: `npm run build`
Test:
1. "Completo" mode — should work exactly as before (zero changes)
2. "Monta tu!" mode — drawer appears at bottom with step-by-step
3. "Sandbox guidata" — drawer shows all volume components, draggable

**Step 8: Commit**

---

## Task 7: Add Drag&Drop Validation for "Monta tu!" Mode

**Files:**
- Modify: `src/components/simulator/canvas/SimulatorCanvas.jsx`
- Modify: `src/components/simulator/NewElabSimulator.jsx`

**Step 1: Pass validation context to SimulatorCanvas**

In NewElabSimulator, pass new props:
```jsx
<SimulatorCanvas
  // ... existing props ...
  buildValidation={currentExperiment?.buildMode === 'guided' ? {
    currentStep: buildStepIndex,
    buildSteps: currentExperiment?.buildSteps || [],
  } : null}
  onBuildValidationResult={(result) => {
    // result: { valid: boolean, stepIndex: number }
    if (result.valid) {
      // Auto-advance to next step
      handleBuildStepChange(result.stepIndex + 1);
    }
  }}
/>
```

**Step 2: In SimulatorCanvas handleDrop, add validation**

After getting the drop position and componentType, check against the current build step:

```javascript
// Inside handleDrop, after computing componentType and svgPt:
if (buildValidation && buildValidation.currentStep >= 0) {
  const step = buildValidation.buildSteps[buildValidation.currentStep];
  if (step && step.componentType === componentType) {
    // Check if position is within tolerance of target
    const targetPins = step.targetPins;
    // Position is validated by the parent — for now, accept any drop of the right component type
    if (onBuildValidationResult) {
      onBuildValidationResult({ valid: true, stepIndex: buildValidation.currentStep });
    }
    if (onComponentAdd) {
      onComponentAdd(componentType, { x: Math.round(svgPt.x), y: Math.round(svgPt.y) });
    }
  } else {
    // Wrong component — show red feedback
    // Flash red border on drop zone for 800ms
    setDropError(true);
    setTimeout(() => setDropError(false), 800);
    // Component does NOT get placed — returns to drawer
  }
  return; // Skip normal drop logic in build mode
}
```

**Step 3: Add visual feedback for valid/invalid drops**

Add state: `const [dropError, setDropError] = useState(false);`

In the SVG container, when `dropError` is true, show a brief red flash overlay:
```jsx
{dropError && (
  <rect x="0" y="0" width="100%" height="100%" fill="red" opacity="0.1" style={{ pointerEvents: 'none' }}>
    <animate attributeName="opacity" from="0.15" to="0" dur="0.8s" fill="freeze" />
  </rect>
)}
```

**Step 4: Verify build + test Monta tu mode**

**Step 5: Commit**

---

## Task 8: Add Wire Drawing for Sandbox Mode

**Files:**
- Modify: `src/components/simulator/NewElabSimulator.jsx`

**Step 1: Auto-enable wireMode in sandbox**

When `buildMode === 'sandbox'`, automatically enable wire mode so students can connect pins:

```javascript
useEffect(() => {
  if (currentExperiment?.buildMode === 'sandbox') {
    setWireMode(true);
  }
}, [currentExperiment?.buildMode]);
```

The existing `handlePinClick` → `handleConnectionAdd` flow already handles pin-to-pin wiring. No new code needed for the wire creation — just ensure wireMode is on.

**Step 2: Verify build + test sandbox wiring**

**Step 3: Commit**

---

## Task 9: Final Integration + Polish

**Files:**
- Multiple files — CSS polish, edge cases

**Step 1: Ensure ComponentPalette shows volume-filtered components in sandbox**

In NewElabSimulator, when sandbox mode is active and the user opens ComponentPalette, pass the volume filter:

```jsx
<ComponentPalette
  wireMode={wireMode}
  onWireModeToggle={() => setWireMode(prev => !prev)}
  volumeFilter={selectedVolume} // NEW PROP
  style={{ height: '100%', border: 'none', borderRadius: 0 }}
/>
```

Update ComponentPalette to accept `volumeFilter` prop and filter CATEGORIES accordingly.

**Step 2: Verify no fontSize < 14px in new components**

Grep all new files for fontSize values. All student-facing text must be >= 14px.

**Step 3: Full build + manual smoke test**

Run: `npm run build`
Test all 3 modes for a Vol.1, Vol.2, and Vol.3 experiment.
Verify: simulator runs, circuits solve, no console errors.

**Step 4: Final commit**

---

## Execution Order Summary

| Task | Description | Risk | Dependencies |
|------|-------------|------|--------------|
| 1 | volumeAvailableFrom in registry | Low | None |
| 2 | 3-mode ExperimentPicker | Low | None |
| 3 | Battery9V redesign | Medium | None (SVG only, pins unchanged) |
| 4 | ComponentDrawer (bottom) | Medium | Task 1 (for volume filtering) |
| 5 | NotesPanel | Low | None |
| 6 | Integration in NewElabSimulator | High | Tasks 2, 4, 5 |
| 7 | Drag&Drop validation | Medium | Task 6 |
| 8 | Sandbox wire mode | Low | Task 6 |
| 9 | Polish + final test | Low | All above |

Tasks 1, 2, 3, 5 can be parallelized (no dependencies).
Tasks 4 depends on 1.
Tasks 6-9 are sequential.
