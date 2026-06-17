# UI-4: Breadboard Snap Fix — Heartbeat

## Status: COMPLETED
## Timestamp: 2026-02-13

## Changes Made

### 1. Pin-Aware Snap-to-Hole (CRITICAL FIX)
**File**: `src/components/simulator/canvas/SimulatorCanvas.jsx`

**Root Cause**: When dragging a component, the snap function was snapping the component's **origin (0,0)** — which is its visual CENTER — to the nearest breadboard hole. But component PINS are offset from center. This meant pins never actually landed on holes, causing the "detachment" visual.

**Fix**: New `snapComponentToHole()` function iterates over ALL pins of the dragged component, finds the pin closest to any breadboard hole, and adjusts the component origin so that pin lands exactly on the hole. Uses formula: `componentX = holeX - pin.offsetX`.

### 2. Infinite Grid Background
**File**: `src/components/simulator/canvas/SimulatorCanvas.jsx`

**Root Cause**: Grid rect was `x=-500 y=-500 w=1400 h=1100` — too small for large pans.

**Fix**: Changed to `x=-5000 y=-5000 w=10000 h=10000` — covers all reasonable pan positions.

### 3. Zoom Buttons Center-Aware
**File**: `src/components/simulator/canvas/SimulatorCanvas.jsx`

**Root Cause**: `+` and `-` zoom buttons just changed zoom factor without adjusting viewBox, causing view to jump.

**Fix**: Zoom buttons now adjust viewBox to zoom toward viewport center (same math as mouse wheel zoom).

### 4. Container-Aware Auto-Fit ViewBox
**File**: `src/components/simulator/canvas/SimulatorCanvas.jsx`

**Root Cause**: `calcAutoFitViewbox()` used hardcoded 4:3 aspect ratio, which could mismatch the actual container dimensions.

**Fix**: `calcAutoFitViewbox()` now accepts an optional container element and uses its real aspect ratio via `getBoundingClientRect()`.

### 5. ResizeObserver for Responsive Canvas
**File**: `src/components/simulator/canvas/SimulatorCanvas.jsx`

**Root Cause**: No handler for window/container resize — components could go off-screen.

**Fix**: Added `ResizeObserver` that watches the SVG container and adjusts viewBox dimensions when the container's aspect ratio changes by >5%.

### 6. Touch Pinch-Zoom Centering
**File**: `src/components/simulator/canvas/SimulatorCanvas.jsx`

**Root Cause**: Two-finger pinch zoom just scaled without adjusting viewBox center, making components appear to drift during pinch.

**Fix**: Pinch zoom now calculates the midpoint between fingers and zooms toward that point (same algorithm as mouse wheel zoom).

### 7. Responsive CSS
**File**: `src/components/simulator/ElabSimulator.css`

**Fix**: Added `.elab-simulator-canvas` CSS to ensure canvas fills container with `overflow: hidden`, and minimum height on mobile.

## Build Status
- Modules: 564
- Build time: 3.55s
- Status: PASSES

## Files Modified
- `src/components/simulator/canvas/SimulatorCanvas.jsx` (6 changes)
- `src/components/simulator/ElabSimulator.css` (1 change)

## Files NOT Modified (as required)
- NewElabSimulator.jsx
- CircuitSolver.js, AVRBridge.js
- Any component SVG files
- breadboardSnap.js (snap logic for initial drop is correct)
- WireRenderer.jsx (wire endpoints already use same pin resolution — no fix needed)

## Wire Alignment Note
WireRenderer.jsx uses `resolvePinPosition()` which calculates pin position as `layout[compId].x + pin.x`. Since both wire endpoints AND component rendering use the same `layout[compId]` position, wires inherently stay attached to components. The drift was only caused by the snap positioning the component incorrectly (pins not on holes), which is now fixed.
