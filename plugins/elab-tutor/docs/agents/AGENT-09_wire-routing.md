# AGENT-09: Wire Routing & Rendering Audit Report

**Date**: 2026-02-13
**Auditor**: AGENT-09 (Wire Routing & Rendering Verifier)
**Scope**: Complete wire system in ELAB Simulator
**Files Audited**:
- `/src/components/simulator/canvas/WireRenderer.jsx` (801 LOC)
- `/src/components/simulator/components/Wire.jsx` (147 LOC)
- `/src/components/simulator/canvas/SimulatorCanvas.jsx` (1825 LOC)
- `/src/components/simulator/NewElabSimulator.jsx` (~1900 LOC, wire-related sections)
- `/src/components/simulator/engine/CircuitSolver.js` (lines 114-532, net building)
- `/src/components/simulator/utils/pinComponentMap.js` (372 LOC)
- `/src/components/simulator/utils/breadboardSnap.js` (215 LOC)
- `/src/components/simulator/components/BreadboardHalf.jsx` (bus/hole click handlers)
- `/src/data/experiments-vol1.js` (sample experiments)

---

## 1. Wire Creation UX: 7/10

### Flow Description

Wire creation uses a **click-click** paradigm (not drag):

1. User activates **Wire Mode** via button in bottom-right overlay ("Filo ON/OFF") or programmatically
2. Cursor becomes `crosshair`
3. Top-left indicator shows: "Clicca un pin per iniziare il filo"
4. Click pin 1 (via `hitTestPin()` or `onHoleClick` on breadboard)
5. Indicator changes to orange: "Clicca un secondo pin per collegare"
6. Dashed preview line follows mouse cursor
7. Click pin 2 -- wire is created via `onConnectionAdd(wireStart, pinRef)`
8. Wire mode remains active (can create more wires without re-enabling)

**Auto-wiring from experiments**: Experiments define `connections[]` with `from`/`to` pin references (e.g. `"bat1:positive"` to `"bb1:bus-top-plus-1"`). These are rendered immediately by `WireRenderer`.

**Auto-pin assignment**: When a component is dropped on a breadboard, `computeAutoPinAssignment()` generates `pinAssignments` mapping component pins to breadboard holes. These are Union-Find-merged by the solver.

### Findings

- **PASS**: Wire mode toggle is clearly visible and provides good visual feedback (green button when ON, status indicator top-left)
- **PASS**: Pin hit-testing uses proper tolerance scaling with zoom: `Math.max(6, 12 / zoom)`, making pins easier to click at low zoom levels
- **PASS**: Escape key exits wire mode and clears pending wire start
- **PASS**: Clicking same pin as start point is ignored (no self-loop wires)
- **PASS**: Breadboard holes are directly clickable in wire mode via `onHoleClick` prop passed to BreadboardHalf/BreadboardFull
- **WARNING**: No visual indication of which pins are valid endpoints when starting a wire -- all pins look the same. Tinkercad highlights connectable pins when hovering. -- `SimulatorCanvas.jsx:1601-1614`
- **WARNING**: Wire preview is a simple dashed straight line, not a preview of the actual routed path. The preview does not show what the final wire will look like. -- `SimulatorCanvas.jsx:1601-1614`
- **WARNING**: No validation that endpoints are electrically meaningful. User can create a wire from `bat1:positive` to `bat1:positive` (same component, same pin if click-click both resolve to same ref via different paths). This is mitigated by the `pinRef !== wireStart` check but not by any deeper validation. -- `SimulatorCanvas.jsx:668`

---

## 2. Routing Algorithm Quality: 8/10

### Algorithm Description

WireRenderer implements a **multi-case routing engine** with 6 distinct routing strategies based on endpoint types:

| Case | From | To | Strategy |
|------|------|----|----------|
| 0 | Breadboard | Breadboard (same BB) | `routeJumperWire()` -- straight or L-shaped |
| 1 | Arduino (nano-r4) | Any | `routeFromArduino()` -- drop down + L-shape to entry hole |
| 2 | Any | Arduino (reverse) | Reversed `routeFromArduino()` |
| 3 | On-BB component | On-BB component | `routeOnBreadboard()` -- through gap or edge row |
| 4 | Off-board | BB pin | `routeToBreadboardPin()` -- edge routing |
| 5 | Off-board | On-BB | `routeToBreadboard()` -- L-shape to entry row |
| fallback | Any | Any | Direct straight line |

All routes use **`buildRoutedPath()`** which generates SVG paths with **quadratic Bezier curves at corners** (`Q` commands) with `CORNER_RADIUS = 5`.

### Findings

- **PASS**: `buildRoutedPath()` is well-implemented. Uses cross product (`Math.abs(cross) < 0.01`) to detect collinear points and skip unnecessary curves. Adaptive radius: `Math.min(CORNER_RADIUS, len1 / 2, len2 / 2)` prevents overshooting on short segments. -- `WireRenderer.jsx:149-202`
- **PASS**: `deduplicatePoints()` removes consecutive points closer than 1.5px, preventing degenerate zero-length segments. -- `WireRenderer.jsx:464-477`
- **PASS**: `routeFromArduino()` correctly enters the breadboard at the proper entry hole (row 'a' for top half, row 'f' for bottom half) and only shows wire to target if target is not on the entry row. -- `WireRenderer.jsx:335-381`
- **PASS**: `routeJumperWire()` handles same-column (straight vertical) and different-column (L-shaped) jumper wires correctly. -- `WireRenderer.jsx:279-300`
- **PASS**: `routeOnBreadboard()` correctly routes through the central gap when wires cross from top half (a-e) to bottom half (f-j). -- `WireRenderer.jsx:386-428`
- **WARNING**: No obstacle avoidance. Wires route through components and other wires without any clearance or collision detection. This is acceptable for an educational tool but differs from professional EDA tools and Tinkercad. -- `WireRenderer.jsx:208-273`
- **WARNING**: `routeJumperWire()` L-shape routing at lines 295-298 has inconsistent logic. The `if` branch creates midPoint at `(lowerPos.x, higherPos.y)` but the `else` branch creates a different geometry `(fromPos.x, toPos.y)`. Both are valid L-shapes but the routing direction is inconsistent -- sometimes horizontal-first, sometimes vertical-first, depending on which end is higher. -- `WireRenderer.jsx:295-298`

---

## 3. Rendering Quality: 9/10

### Visual Layers (per wire, bottom to top)

1. **Invisible hit area**: 10px transparent stroke for easy click targeting
2. **Selection glow** (if selected): 6px `#7CB342` dashed stroke with `stroke-dashoffset` animation
3. **Net highlight glow** (if in same net): 5px `#7CB342` at 30% opacity
4. **Shadow**: 3.5px `#00000015` offset by (1,1)
5. **Main wire**: 2.5px (3.5px if selected, 3px if net-highlighted) with actual wire color
6. **Highlight reflection**: 0.7px white at 20% opacity, offset (-0.4, -0.4)
7. **Endpoint dots**: Metallic pin tips (gold circle + colored center) at breadboard holes, or colored dots at non-BB endpoints
8. **Current flow animation**: 3 animated dots moving along the wire path

### Color System

Auto-color based on pin function (`getAutoWireColor()`):
- **Red** (`#EF4444`): VCC, positive, plus, 5V, 3V3, VIN pins / bus-plus rails
- **Black** (`#1F2937`): GND, negative, minus pins / bus-minus rails
- **Orange** (`#F97316`): Digital pins (D0-D13)
- **Blue** (`#3B82F6`): Analog pins (A0-A5)
- **Green** (`#22C55E`): Default signal color

8 named colors available: red, black, orange, yellow, green, blue, purple, white.

### Current Flow Animation

Direction-aware animated dots using `<animateMotion>` with `keyPoints`:
- Forward (from --> to): `keyPoints="0;1"`
- Reverse (to --> from): `keyPoints="1;0"`
- Speed proportional to current: `duration = 1.2 / clamp(mA/10, 0.5, 3)`
- Color coding: gold (#FFD700) normal, orange (#FF8C00) >20mA, red (#FF0000) >100mA
- Short circuit: additional blink animation (opacity 0.4-1-0.4 at 0.4s)

### Findings

- **PASS**: Rendering is visually polished with shadow, reflection, and metallic endpoint tips. Production quality. -- `WireRenderer.jsx:623-796`
- **PASS**: Current flow animation is direction-aware, speed-responsive, and color-coded by magnitude. Excellent pedagogical tool. -- `WireRenderer.jsx:741-791`
- **PASS**: 10px invisible hit area makes wires easy to click even at small zoom. -- `WireRenderer.jsx:633-645`
- **PASS**: `getAutoWireColor()` is unified (single source of truth in `WireRenderer.jsx`, exported and used by `NewElabSimulator.jsx`). Correct semantic coloring.
- **PASS**: Wire endpoints have different styling for breadboard holes (metallic pin + colored center) vs. off-board (simple colored dot). Realistic visual feedback.
- **WARNING**: The legacy `Wire.jsx` component (registered as type 'wire' in the component registry) uses a completely different rendering approach -- simple `calcWirePath()` with quadratic Bezier curves. It is NOT used by `WireRenderer` (which handles all actual wire rendering). `Wire.jsx` appears to be dead code or legacy only. If it's used anywhere, it would produce inconsistent visual output. -- `Wire.jsx:26-49`

---

## 4. Wire Interaction: 6/10

### Supported Interactions

| Action | Supported | How |
|--------|-----------|-----|
| Select wire | Yes | Click on wire (10px hit area) |
| Delete wire | Partial | Select + Delete/Backspace key |
| Net highlight | Yes | Selected wire's net glows green |
| Change color | No | Not supported at runtime |
| Move/reroute | No | Wires auto-route; no manual control |
| Delete base wires | No | Only custom (user-added) wires can be deleted |

### Findings

- **PASS**: Wire selection works with visual feedback: selected wire turns green (`#7CB342`) with animated dashed outline, and all wires in the same electrical net get a subtle green glow. -- `WireRenderer.jsx:648-674`
- **PASS**: `computeNetHighlight()` correctly uses Union-Find with breadboard internal connection normalization (same column top strip / bottom strip merged, bus rails merged). -- `WireRenderer.jsx:516-568`
- **PASS**: Wire click toggle: clicking same wire deselects, clicking different wire selects new one. -- `NewElabSimulator.jsx:1301-1303`
- **CRITICAL**: Base experiment wires cannot be deleted. Only `customConnections` (user-added wires) can be removed. If wireIndex < baseCount, the delete is silently ignored. No user feedback is given. The code has a comment: "In the future, we could add them to a hidden connections list". This is frustrating for users who want to modify pre-built experiments. -- `NewElabSimulator.jsx:1314-1328`
- **WARNING**: No wire color picker. The `WIRE_COLORS` object defines 8 colors, but there is no UI to change a wire's color after creation. Auto-color is determined at creation time only. -- Memory doc confirms: "wire color picker" is a known missing feature
- **WARNING**: No right-click context menu for wires. No undo for wire deletion (undo saves snapshots before delete, so `Ctrl+Z` should work, but this was not verified in this audit).
- **WARNING**: Wires do not update their routing when components are moved. `computeRoutedWire()` is called during render with current layout, so wires DO visually re-route. However, the logical connection (`from`/`to` pin refs) stays the same even if a component is dragged off the breadboard. This is correct behavior but could lead to confusing visual results (wire connecting to empty space).

---

## 5. Wire-to-Solver Integration: 8/10

### Architecture

```
User creates wire (click-click)
  --> handleConnectionAdd(fromRef, toRef)
    --> setCustomConnections([...prev, { from, to, color }])
    --> requestAnimationFrame(() => reSolve())

reSolve()
  --> mergedExperiment = { ...base, connections: [...base.connections, ...custom] }
  --> solverRef.current.loadExperiment(mergedExperiment)

CircuitSolver.loadExperiment()
  --> this.connections = mergedConnections
  --> this._pinRefs.add(each endpoint)
  --> this._pinAssignments = experiment.pinAssignments
  --> this.solve()
    --> _buildNets()  [Union-Find merges all connections + BB internal strips + pinAssignments]
    --> _markSupplyNets()  [identifies 9V, 5V, GND]
    --> _checkShortCircuit()
    --> _solveAllComponents()  [path-trace + MNA for parallel circuits]
```

### Union-Find Net Building

The solver's `_buildNets()` (CircuitSolver.js:413-468) correctly merges:

1. **Wire connections**: All `connection.from` and `connection.to` are unioned
2. **Switch states**: Push-button (pressed), reed-switch (closed), MOSFET (on), diode (conducting), phototransistor (conducting) merge internal pins
3. **Breadboard internal strips**: Uses `getInternalConnections()` from BreadboardHalf, which returns column nets (a-e per column, f-j per column) and bus rail nets (30 holes per rail). Only actually-referenced holes are unioned (performance optimization).
4. **Pin assignments**: Component pins inserted in breadboard holes (`pinAssignments`) are unioned with their corresponding hole

### Findings

- **PASS**: `_buildNets()` correctly merges wire connections, switch states, breadboard internal strips, and pin assignments in the right order. Union-Find with path compression and union-by-rank. -- `CircuitSolver.js:413-468`
- **PASS**: `pinComponentMap.js` has a parallel Union-Find that independently traces Arduino pins to output/input components through breadboard wiring. Both Union-Finds use the same strip grouping logic (top `a-e`, bottom `f-j`, bus rails). -- `pinComponentMap.js:15-151`
- **PASS**: Breadboard internal connections are generated correctly by `BreadboardHalf.getInternalConnections()`: 30 top column nets, 30 bottom column nets, 4 bus rail nets (top-plus, top-minus, bot-plus, bot-minus). Each bus rail is a single continuous net (no mid-board split). -- `BreadboardHalf.jsx:451-490`
- **PASS**: `WireRenderer.computeNetHighlight()` has its own lightweight Union-Find for net highlighting that correctly normalizes breadboard pin refs (e.g., `bb1:a5` --> `bb1:col5-top`, `bb1:bus-top-plus-5` --> `bb1:bus-top-plus`). -- `WireRenderer.jsx:516-568`
- **WARNING**: There are **3 separate Union-Find implementations** in the codebase (CircuitSolver._buildNets, pinComponentMap.buildPinComponentMap, WireRenderer.computeNetHighlight). Each reimplements the same breadboard strip grouping logic independently. A shared utility would reduce duplication and risk of divergence. -- Multiple files
- **WARNING**: `snapToNearestHole()` in SimulatorCanvas.jsx generates bus pin IDs as `bus-${col + 1}` (e.g. `bus-5`) instead of `bus-top-plus-5` or `bus-bot-minus-5`. This is a latent bug -- the pinId is not currently used (only x/y coords are used for snapping), but if it were ever used for wire creation or pin assignment, it would fail to match the correct bus rail. -- `SimulatorCanvas.jsx:125`

---

## 6. Experiment Tracing: v1-cap6-esp1 (LED + Resistor)

### Circuit

Battery 9V --> bus-top-plus --> column 5 (a5) --> [row a-e col 5, resistor pin1 at e5] --> [row a-e col 12, resistor pin2 at e12, LED anode at d12] --> [row a-e col 13, LED cathode at d13] --> column 13 (a13) --> bus-top-minus --> battery negative

### Connection Flow

1. `bat1:positive` --> `bb1:bus-top-plus-1` (red wire)
2. `bb1:bus-top-plus-5` --> `bb1:a5` (red wire, bus-to-main jumper)
3. `bb1:a13` --> `bb1:bus-top-minus-13` (black wire, main-to-bus jumper)
4. `bb1:bus-top-minus-1` --> `bat1:negative` (black wire)

### Pin Assignments

- `r1:pin1` --> `bb1:e5` (same column 5 as a5 via bus, Union-Find merges a5-e5)
- `r1:pin2` --> `bb1:e12` (column 12, top strip)
- `led1:anode` --> `bb1:d12` (same column 12 as e12, Union-Find merges d12-e12)
- `led1:cathode` --> `bb1:d13` (same column 13 as a13, Union-Find merges a13-d13)

### Solver Net Analysis

- **Net A (9V)**: bat1:positive --> bus-top-plus-1 (all bus-top-plus holes) --> bus-top-plus-5 --> a5 (column 5: a5,b5,c5,d5,e5) --> r1:pin1
- **Net B**: r1:pin2 --> e12 (column 12: a12,b12,c12,d12,e12) --> led1:anode
- **Net C (GND)**: led1:cathode --> d13 (column 13: a13,b13,c13,d13,e13) --> a13 --> bus-top-minus-13 (all bus-top-minus holes) --> bus-top-minus-1 --> bat1:negative

**Result**: Correct series circuit: 9V --> 470ohm --> LED red (Vf=1.8V) --> GND. Expected current: (9-1.8)/470 = 15.3mA. LED should light up at appropriate brightness.

- **PASS**: All connections trace correctly through the Union-Find to form 3 distinct nets (supply, mid, ground). The solver will correctly identify a series path from 9V through resistor through LED to ground.

---

## 7. Duplicate Code Analysis

### Wire.jsx vs WireRenderer.jsx

`Wire.jsx` is a registered component in the component registry. It defines its own `calcWirePath()` with quadratic Bezier curves and renders a standalone wire SVG. However, `WireRenderer.jsx` is the actual wire rendering engine used by `SimulatorCanvas`. These are two completely independent implementations:

| Feature | Wire.jsx | WireRenderer.jsx |
|---------|----------|------------------|
| Routing | Simple Bezier between 2 points | Multi-segment routed through breadboard |
| Corner radius | N/A (single curve) | CORNER_RADIUS = 5 with Q commands |
| Color | From props | Auto-inferred from pin function |
| Current animation | Single green dot | 3 direction-aware dots with color coding |
| Selection | Via `highlighted` prop | Click + net highlight with Union-Find |
| Used by | Component registry (not used in canvas) | SimulatorCanvas (all wire rendering) |

- **WARNING**: `Wire.jsx` is effectively dead code for the simulator's wire rendering. It is registered in the component registry and appears in the ComponentPalette category 'wire', but wires are not created as components -- they are connections between components. If a user drags a 'wire' from the palette, it creates a component, not a connection, which would be confusing. -- `Wire.jsx:136-143`

---

## Summary Scores

| Category | Score | Key Issues |
|----------|-------|------------|
| Wire Creation UX | 7/10 | No valid-endpoint highlighting, straight-line preview |
| Routing Algorithm Quality | 8/10 | No obstacle avoidance, minor L-shape inconsistency |
| Rendering Quality | 9/10 | Excellent visual polish, legacy Wire.jsx dead code |
| Wire Interaction | 6/10 | Cannot delete base wires, no color picker, no context menu |
| Wire-to-Solver Integration | 8/10 | 3 duplicate Union-Finds, latent bus naming bug |
| **Overall Wire System** | **7.5/10** | Solid foundation, needs interaction polish |

---

## Complete Findings List

### CRITICAL (1)

1. **Base experiment wires cannot be deleted**. Selecting a base wire and pressing Delete/Backspace is silently ignored. No user feedback. Users who want to modify a pre-built experiment's wiring are blocked. -- `NewElabSimulator.jsx:1314-1328`

### WARNING (9)

1. **No valid-endpoint highlighting** when starting a wire. All pins look the same. -- `SimulatorCanvas.jsx:1601-1614`
2. **Wire preview is straight line**, not a preview of the routed path. -- `SimulatorCanvas.jsx:1601-1614`
3. **No obstacle avoidance** in routing. Wires pass through components. -- `WireRenderer.jsx:208-273`
4. **Inconsistent L-shape direction** in `routeJumperWire()`. -- `WireRenderer.jsx:295-298`
5. **No wire color picker**. Auto-color only, no runtime change. -- Known missing feature
6. **No right-click context menu** for wires (delete, change color, etc.). -- Not implemented
7. **3 duplicate Union-Find implementations** with breadboard strip logic. Risk of divergence. -- `CircuitSolver.js`, `pinComponentMap.js`, `WireRenderer.jsx`
8. **Latent bus naming bug** in `snapToNearestHole()`: generates `bus-N` instead of `bus-rail-N`. Not currently harmful (pinId unused). -- `SimulatorCanvas.jsx:125`
9. **`Wire.jsx` is dead code** for rendering. Registered in component registry but not used by the wire system. Creates confusing palette entry. -- `Wire.jsx:136-143`

### PASS (17)

1. Wire mode toggle with clear visual feedback (green button + status indicator)
2. Pin hit-testing with zoom-scaled tolerance
3. Escape key exits wire mode
4. Self-loop prevention (same pin start/end)
5. Breadboard holes directly clickable in wire mode
6. `buildRoutedPath()` with collinear detection, adaptive corner radius, quadratic Bezier curves
7. `deduplicatePoints()` prevents zero-length segments
8. `routeFromArduino()` enters breadboard at correct entry hole
9. `routeJumperWire()` handles same-column and cross-column jumpers
10. `routeOnBreadboard()` routes through central gap correctly
11. Polished rendering with shadow, reflection, metallic endpoint tips
12. Direction-aware current flow animation with speed/color coding
13. 10px invisible hit area for easy clicking
14. `getAutoWireColor()` unified single source of truth
15. `_buildNets()` correctly merges all connection types
16. `computeNetHighlight()` with correct breadboard normalization
17. v1-cap6-esp1 experiment traces correctly through Union-Find

---

## Recommendations (Priority Order)

1. **P0**: Allow deletion (or hiding) of base experiment wires. Add a `hiddenConnections` set in custom state.
2. **P1**: Add wire color picker (right-click context menu or properties panel when wire selected).
3. **P1**: Show routed preview during wire drawing instead of straight dashed line.
4. **P2**: Highlight valid connectable pins when wire start is selected.
5. **P2**: Extract shared Union-Find + breadboard strip logic into a reusable utility module.
6. **P2**: Remove `Wire.jsx` from component palette (or repurpose as a manual jumper wire tool).
7. **P3**: Add obstacle avoidance for wire routing (component bounding box clearance).
8. **P3**: Add right-click context menu for wires (delete, change color, inspect net).

---

*Report generated by AGENT-09 on 2026-02-13*
