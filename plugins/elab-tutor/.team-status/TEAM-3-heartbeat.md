# TEAM-3 Solver Agent — Heartbeat
## Status: COMPLETED
## Time: 2026-02-13

## Changes Made

### 1. RC Transient Simulation (CircuitSolver.js)
- **Rewrote `_solveCapacitor()`** with three distinct modes:
  - **Charging/Discharging**: When both terminals connected to supply, uses `V(t+dt) = V(t) + (Vtarget - V(t)) * (1 - e^(-dt/tau))` with actual dt
  - **Isolated**: When disconnected, capacitor holds charge with slow leakage (tau ~1000s)
  - **Partially connected**: When one terminal floating, discharge through available path
- Added new state fields: `chargePercent`, `tau`, `targetVoltage`, `charging`
- Updated `_initState()` to include new capacitor state fields
- Current calculated as `I = C * dV/dt` (proper derivative)

### 2. PWM Brightness Fix (SimulationManager.js)
- **Fixed `_applyPinToComponent()`**:
  - Removed pin-specific checks (anode/pin1/positive) — now applies to any pin connection
  - RGB LED now properly initializes state structure and sets per-channel brightness with `{ on, brightness }` objects
  - Motor DC gets PWM speed regardless of pin name
- **Fixed `_updateComponentStatesFromPins()`**:
  - Now checks both directions: nano→comp AND comp→nano connections
  - Previously only checked `fromComp` being nano

### 3. Build Status
- Build passes: 549 modules, 3.45s
- No regressions

## Files Modified
- `src/components/simulator/engine/CircuitSolver.js` — RC transient model rewrite
- `src/components/simulator/engine/SimulationManager.js` — PWM brightness + bidirectional pin mapping
