# ELAB Simulator System Architecture & Zero-Regression Rules
**Date**: February 27, 2026
**Context**: ELAB Tutor Simulator Engine Overhaul

This document serves as the absolute source of truth for the Elab Simulator's component interaction physics, routing, UI, and Arduino synchronization to prevent regressions during future AI iterations.

---

## 1. MNA Engine & Components Physics
- **DO NOT REVERT TO DISCRETE LOGIC**: Components like Capacitors and MOSFETs must be solved via physical differential matrices and `r` switching. 
- **Capacitors**: State updates evaluate charge `(C * V)` based on voltage differences `V(nodeA) - V(nodeB)` computed strictly by the MNA solver over `dt` (time steps). Do not force rapid toggles on position change; only allow `dt` advancements in active ticker states (the boolean `isTimeStep` flag in `solve()`).
- **MOSFETs**: Conductance logic is 100% computed off physical `V_gs` vs `vth`. The solver alters the `rds` value (Gate-to-Source voltage above Threshold). Do NOT use pseudo ON/OFF states for drain-source conductivity. 

## 2. AVR Arduino synchronization (Synchronous Bridge)
- **Do not manually set simulator states based on AVR instructions!**
- The Arduino runs `avr8js` worker ticks. Pin states (INPUT, OUTPUT, HIGH, LOW, PWM) are extracted to the main thread `AVRBridge` and *stamped* into the MNA `CircuitSolver` as MNA Voltage Sources or resistor pulls.
- Arduino analog/digital inputs are *read* directly from the MNA calculated node voltages. This creates a true closed-loop physics engine (Hardware-in-the-Loop).

## 3. UI Routing & Components Collision
- **A* Wiring System**: Orthogonal routing is achieved via `applyComponentAvoidance` (Grid-based A* pathfinding). Wires actively circumvent component bounding boxes. Modifying line path logic must respect the strict matrix bounding arrays.
- **Component Z-Overlaps**: `SimulatorCanvas.jsx` uses `isValidDropPosition` during `handleDrop` and `handleMouseUp` events to ensure strict collision tests against all active bounding boxes (`COMP_SIZES`). Attempting drops over foreign components reverts placement back to the drag coordinate origins.
- **Touch Responsiveness (iPad/Mobile)**: Breadboard hole hit zones are mathematically extended (`HOLE_PITCH * 0.65`) overlapping just enough so that pure "dead zones" don't exist, guaranteeing 100% stable routing events. 

*Rule: Future feature modifications (e.g. Nanobot/Galileo integration) must use existing robust solver inputs (`onComponentClick`, `onLayoutChange`, `onConnectionAdd`) and NEVER bypass the solver simulation loop or physical component states.*
