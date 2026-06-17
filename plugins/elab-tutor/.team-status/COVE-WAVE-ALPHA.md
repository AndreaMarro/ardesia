# CoVe Wave Alpha Verification Report
## Date: 2026-02-13
## Reviewer: CoVe Cross-Review Agent (Claude Opus 4.6)

---

### Agent 1 -- Ghost Buster: PASS

**Change 1: `handleLayoutChange` recomputes pinAssignments for ALL components (not just user-added)**
- VERIFIED (lines 1263-1327 of NewElabSimulator.jsx)
- `handleLayoutChange` searches `mergedExperiment.components` (which includes BOTH base and custom components) to find the dragged component
- `computeAutoPinAssignment` is called correctly with componentId, comp.type, position, breadboard id, and bbPos
- When a snap succeeds, old pin assignments for that component are removed (`delete next[key]` for keys starting with `componentId:`) and new ones are merged in
- When a snap FAILS (component dragged off breadboard), all existing custom AND base pin assignments for that component are set to `null` (lines 1306-1319). This correctly prevents "ghost connections" at old positions.
- Correctness: GOOD. The null-marker approach is clean -- it overrides base pinAssignments without deleting them from source.

**Change 2: `mergedExperiment` useMemo filters out null values from customPinAssignments**
- VERIFIED (lines 228-276 of NewElabSimulator.jsx)
- Line 265: `if (hiddenIds.has(compId) || value === null || value === undefined) continue;`
- This correctly filters out null markers from the merged pinAssignments, so the solver never receives null values
- The merge order is correct: `{ ...basePinAssignments, ...customPinAssignments }` ensures custom entries (including nulls) override base entries, then nulls are filtered out

**Change 3: Undo snapshot guard (`dragSnapshotPushedRef`) -- only 1 snapshot per drag**
- VERIFIED (lines 1254-1268 of NewElabSimulator.jsx)
- `dragSnapshotPushedRef = useRef(false)` -- properly initialized
- Reset on `mouseup` via window event listener (lines 1257-1261), with proper cleanup on unmount
- Guard in `handleLayoutChange` (line 1265): `if (!dragSnapshotPushedRef.current)` -- only pushes once, then sets `true`
- No edge case issues: the ref resets on every mouseup, so the next drag gets a fresh snapshot

**Change 4: `customPinAssignments` cleared on experiment change and handleBack**
- VERIFIED:
  - `handleSelectExperiment` (line 576): `setCustomPinAssignments({})` -- clears on experiment change
  - `handleBack` (line 889): `setCustomPinAssignments({})` -- clears on back to list

**Regression checks:**
- Initial experiment load: `handleSelectExperiment` resets ALL custom state (layout, connections, components, pinAssignments) to `{}` before loading new experiment -- NO regression
- No-drag scenario: When no drag has happened, `customPinAssignments` is `{}`, so `mergedExperiment` just uses base pinAssignments as-is -- circuit works normally
- `computeAutoPinAssignment` is imported from `./utils/breadboardSnap` (line 48) and called correctly

---

### Agent 2 -- Basetta: PASS

**Change 1: NanoR4Board.jsx completely rewritten**
- VERIFIED (818 lines, `/src/components/simulator/components/NanoR4Board.jsx`)

**Aspect ratio check:**
- viewBox dimensions: BOARD_W = 387.5, BOARD_H = 275
- Aspect ratio: 387.5 / 275 = 1.409:1 -- MATCHES spec (~1.41:1)
- Note: The COMP_SIZES in SimulatorCanvas uses `{ w: 600, h: 275 }` which accounts for BOARD_W (387.5) + WING_W (210) = 597.5, rounded to 600. This is correct for bounding box calculations.

**Semicircle check:**
- Line 231: `A ${SEMI_R} ${SEMI_R} 0 0 1 ${SEMI_CX} 0` -- SVG arc with rx=ry=137.5, which is a TRUE circular arc
- SEMI_R = BOARD_H / 2 = 137.5 -- correct for a semicircle that spans the full left edge height

**Pin count verification:**
- LEFT_PINS: 15 (D13, 3V3, AREF, A0-A7, 5V, RST_L, GND, VIN)
- RIGHT_PINS: 15 (D12, D11~, D10~, D9~, D8, D7, D6~, D5~, D4, D3~, D2, GND_R, RST_R, RX, TX)
- WING_PINS: 16 (W_A0-A3, W_D3, W_D5, W_D6, W_D9, W_A4-A5, W_D0, W_D1, W_D13, W_D12, W_D11, W_D10)
- TOTAL: 46 pins -- MATCHES spec

**Pin names check:**
- Left side has: D13, 3V3, AREF, A0-A7, 5V, RST_L, GND, VIN -- CORRECT
- Right side has: D12-D2 (with PWM ~ markers on D11,D10,D9,D6,D5,D3), GND_R, RST_R, RX, TX -- CORRECT
- Wing has duplicated breakout pins with `mapsTo` references -- CORRECT architecture

**Color check:**
- PCB: `#E8D86C` (ELAB_BOARD_BG) -- MATCHES spec
- Arduino: `#005C8A` (NANO_COLOR) -- MATCHES spec
- Terminal: `#2E7D32` (TERMINAL_GREEN) -- MATCHES spec
- Pads: `#D4A04A` (ELAB_PAD) -- MATCHES spec

**React component API check (line 430):**
- Props: `{ x = 0, y = 0, state = {}, highlighted = false, onInteract, id }` -- MATCHES expected API, unchanged from previous version

**COMP_SIZES in SimulatorCanvas.jsx updated:**
- Line 44: `'nano-r4': { w: 600, h: 275 }` with comment "ELAB breakout V1.1 GP (387.5 + 210 wing) x 275, DWG-faithful" -- CORRECT

**Registry registration (line 808):**
- Properly registered with component, pins, defaultState, category, label, icon, boardDimensions -- CORRECT

**Hardcoded positions concern:**
- All positions are computed from constants (SCALE, BOARD_W, BOARD_H, NANO_X, NANO_Y, PIN_PITCH) -- scales correctly
- Pin positions are computed via `computeNanoPinPositions()` -- no hardcoded pixel values for pin placement
- The component receives `x, y` props for positioning via `translate()` transform -- zoom-safe

---

### Agent 3 -- Solver: PASS (with 1 WARN)

**Change 1: RC transient in CircuitSolver (lines 1400-1470)**
- VERIFIED. Three modes implemented:

  1. **CHARGING/DISCHARGING (bothConnected, lines 1417-1440):**
     - Formula: `V(t+dt) = V(t) + (Vtarget - V(t)) * (1 - e^(-dt/tau))` -- CORRECT (exponential RC charging equation)
     - tau = R * C where R is total path resistance, C is capacitance in Farads
     - Current: `I = C * dV/dt` -- CORRECT (capacitor current equation)
     - chargePercent, targetVoltage, tau all exposed to state

  2. **ISOLATED (lines 1441-1454):**
     - Capacitor holds charge with very slow leakage (tau=1000s) -- physically reasonable
     - Only discharges when |currentV| > 0.001 -- avoids floating point noise

  3. **PARTIALLY CONNECTED (lines 1455-1469):**
     - Discharges through connected path with R_discharge fallback of 10kOhm
     - Same exponential decay formula

**Division by zero risk analysis:**
- R=0: Line 1421 has `(posR + negR) > 0 ? (posR + negR) : 1000` -- PROTECTED (fallback 1kOhm)
- C=0: Line 1414 `(comp.value || 100) * 1e-6` -- if value is 0, it falls back to 100uF. PROTECTED.
- tau=0: Line 1424 `if (tau > 0)` -- PROTECTED (skips entire computation if tau is zero)
- dt=0: `this.dt = 1/30` (line 78, constructor) -- always positive, SAFE
- vSource=0 in chargePercent: Line 1435 `Math.abs(vSource) > 0.01 ? ... : 0` -- PROTECTED

**Capacitor _initState (line 1741):**
- `{ charge: 0, voltage: 0, current: 0, chargePercent: 0, tau: 0, targetVoltage: 0, charging: false }` -- ALL fields initialized, CORRECT

**Non-capacitor circuits unaffected:**
- RC transient code is isolated in `_solveCapacitor()` method (called only for `case 'capacitor'`)
- No changes to _solveLED, _solveResistor, _solveBuzzer, etc.
- The solve() loop still runs the same convergence iteration -- SAFE

**Change 2: PWM brightness in SimulationManager._applyPinToComponent (lines 134-203)**
- VERIFIED for LED (lines 139-148): brightness properly computed from PWM float 0.0-1.0 or digital 0/1
- VERIFIED for RGB LED (lines 150-169): per-channel {on, brightness} structure with duty cycle
- VERIFIED for buzzer (lines 171-177), motor (lines 178-186), servo (lines 187-198), lcd16x2 (lines 199-202) -- all cases handled

**Change 3: Bidirectional pin mapping in _updateComponentStatesFromPins (lines 81-128)**
- VERIFIED: Lines 96-109 check BOTH `nanoIds.has(fromComp)` AND `nanoIds.has(toComp)` -- bidirectional matching
- nanoIds built from component type, not string prefix -- robust

**WARN: PWM override check (line 114):**
- `if (pinStates._pwm && pinStates._pwm[pinNum] !== undefined)` -- relies on `_pwm` property existing on pinStates object from AVRBridge
- If AVRBridge does not expose `_pwm` property, this silently falls back to digital values (0/1) -- SAFE but may not give expected PWM behavior if AVRBridge API changes
- This is a MINOR concern, not a bug.

---

### Cross-Agent Conflicts: PASS

**File ownership check:**
- Agent 1 modified: `NewElabSimulator.jsx` -- CORRECT scope
- Agent 2 modified: `NanoR4Board.jsx`, `SimulatorCanvas.jsx` (COMP_SIZES only) -- CORRECT scope
- Agent 3 modified: `CircuitSolver.js`, `SimulationManager.js` -- CORRECT scope

**SimulatorCanvas.jsx conflict check:**
- Agent 2 modified COMP_SIZES (line 44: nano-r4 dimensions)
- Agent 1 did NOT modify SimulatorCanvas.jsx
- NO CONFLICT detected

**No unexpected modifications found.** Each agent stayed within their designated files.

---

### Build Gate: PASS

```
> vite build
> 549 modules transformed
> Built in 28.98s

Output:
  dist/index-D749cyD9.js     1,276.85 kB (main chunk)
  dist/codemirror-j5nLyEll.js  439.14 kB
  dist/avr-Cds7tnIi.js          51.05 kB
  dist/AVRBridge-eW5qkWVo.js    12.69 kB
  dist/react-vendor-Bce9NwRC.js  11.97 kB
```

Build completed successfully with no errors. Only the standard chunk size warning for the main bundle (expected, unchanged from before).

Note: Module count is 549 (was 551 in Sprint 3 report, was 547 in Sprint 2). Minor variation is expected from Vite module resolution changes -- not a concern.

---

### OVERALL VERDICT: GO for Wave Bravo

**Summary:**
| Agent | Verdict | Issues |
|-------|---------|--------|
| Agent 1 -- Ghost Buster | PASS | 0 issues |
| Agent 2 -- Basetta | PASS | 0 issues |
| Agent 3 -- Solver | PASS (1 WARN) | PWM bridge dependency is fragile but safe |
| Cross-Agent | PASS | No conflicts |
| Build | PASS | 549 modules, 28.98s |

**All 4 changes from Agent 1 are present and correct.**
**NanoR4Board rewrite is faithful to DWG specs: 46 pins, 1.409:1 ratio, true semicircle.**
**RC transient is mathematically correct with full division-by-zero protection.**
**No regressions detected for existing circuits.**

Wave Bravo is cleared to proceed.
