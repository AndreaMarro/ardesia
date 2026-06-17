# ELAB Simulator — Critical File Map for QA

## Core Simulator
- `src/components/simulator/NewElabSimulator.jsx` — Main orchestrator (~3500 lines). Drag/drop, layout state, pointer events, component lifecycle, experiment loading.

## SVG Components (all in `src/components/simulator/components/`)
| File | Pins | Type |
|------|------|------|
| `Led.jsx` | anode, cathode | output |
| `Resistor.jsx` | pin1, pin2 | passive |
| `PushButton.jsx` | pin1-pin4 | input |
| `BuzzerPiezo.jsx` | positive, negative | output |
| `Potentiometer.jsx` | vcc, signal, gnd | input |
| `PhotoResistor.jsx` | pin1, pin2 | input |
| `Phototransistor.jsx` | collector, emitter | input |
| `RgbLed.jsx` | red, green, blue, cathode | output |
| `Capacitor.jsx` | positive, negative | passive |
| `Diode.jsx` | anode, cathode | passive |
| `MosfetN.jsx` | gate, drain, source | active |
| `MotorDC.jsx` | positive, negative | output |
| `Servo.jsx` | signal, vcc, gnd | output |
| `ReedSwitch.jsx` | pin1, pin2 | input |
| `LCD16x2.jsx` | multiple | output |
| `Battery9V.jsx` | positive, negative | power |
| `NanoR4Board.jsx` | D2-D13, A0-A5, 5V, 3.3V, GND, VIN | board |
| `BreadboardHalf.jsx` | a1-j30 (300 holes) | board |
| `BreadboardFull.jsx` | a1-j63 + bus (660+ holes) | board |
| `Wire.jsx` | start, end | wire |
| `Multimeter.jsx` | probe+, probe- | tool |
| `registry.js` | Component registry (type -> config) | util |

## Breadboard Snap & Pin Assignment
- `src/components/simulator/utils/breadboardSnap.js` — `computeAutoPinAssignment()`, `findNearestHole()`, `findNearestHoleFull()`, geometry constants (BB_PITCH=7.5, BBF_HOLE_SPACING=7)

## Parent-Child Grouping (Antigravity)
- `src/components/simulator/utils/parentChild.js` — `getChildComponents()`, `inferParentFromPinAssignments()`. When breadboard moves, all children move together.

## Circuit Solver Engine
- `src/components/simulator/engine/CircuitSolver.js` — Net-based solver (Union-Find). Builds nets, assigns voltages, path-traces loads. Handles LED Vf, MOSFET threshold, diode.
- `src/components/simulator/engine/PlacementEngine.js` — Automated component placement for "Gia Montato" / "Passo Passo" modes. Uses breadboardSnap geometry.

## AVR Emulation
- `src/components/simulator/engine/AVRBridge.js` — Bridge between React state and AVR worker
- `src/components/simulator/engine/avrWorker.js` — Web Worker running avr8js ATmega328p emulation

## Canvas & Wiring
- `src/components/simulator/canvas/SimulatorCanvas.jsx` — SVG render layer, viewBox transform, zoom/pan
- `src/components/simulator/canvas/WireRenderer.jsx` — A* wire routing, Bezier paths
- `src/components/simulator/canvas/PinOverlay.jsx` — Pin highlight dots for wiring mode

## Scratch/Blockly Editor
- `src/components/simulator/panels/ScratchEditor.jsx` — Blockly workspace, ELAB theme, Zelos renderer
- `src/components/simulator/panels/scratchBlocks.js` — 22 custom Arduino blocks
- `src/components/simulator/panels/scratchGenerator.js` — Blockly -> Arduino C++ code generator

## Code Editor & Compiler
- `src/components/simulator/panels/CodeEditorCM6.jsx` — CodeMirror 6 Arduino editor
- `src/services/simulator-api.js` — Compile API client

## Experiment Data
- `src/data/experiments-vol1.js` — 38 experiments (passive circuits)
- `src/data/experiments-vol2.js` — 18 experiments (transistors, motors, diodes)
- `src/data/experiments-vol3.js` — 13+ experiments (Arduino AVR)
- `src/data/experiments-index.js` — Combined index

## Styling
- `src/components/simulator/ElabSimulator.css` — All simulator CSS
- `src/components/simulator/layout.module.css` — CSS Modules for layout
