# FIX-4 Heartbeat — Vol2 Experiment Layouts
**Agent**: FIX-4 (Layout Fix)
**Status**: COMPLETED
**Timestamp**: 2026-02-13

## Task
Fix Vol2 experiment layouts in `experiments-vol2.js` to align component positions with breadboard grid coordinates.

## Root Cause
The file header had WRONG pin offsets used for layout calculations:
- LED: listed as `anode=(3,24) cathode=(-3,20)` but actual is `anode=(-3.75,22) cathode=(3.75,22)`
- Resistor: listed as `pin1=(-28,0) pin2=(28,0)` but actual is `pin1=(-26.25,0) pin2=(26.25,0)`
- MosfetN gate: listed as `(-18,0)` but actual is `(-20,0)`
- Diode: listed as `(-22,0)/(22,0)` but actual is `(-20,0)/(20,0)`
- Capacitor/Phototransistor: listed as `(0,-19)/(0,19)` but actual is `(0,-18)/(0,18)`

## Changes Made

### 1. Fixed Comment Header (lines 13-31)
Updated all pin offsets to match actual JSX source code values. Added layout formula reference section.

### 2. Fixed LED Positions (11 LEDs across 9 experiments)
Formula: `LED.x = holeCx(anode_col) + 3.75`, `LED.y = 44.25` (for row d)

| Experiment | Old Position | New Position | Shift |
|---|---|---|---|
| v2-cap6-esp1 led1 | (197.25, 42.25) | (204, 44.25) | +6.75, +2 |
| v2-cap6-esp1 led2 | (234.75, 42.25) | (249, 44.25) | +14.25, +2 |
| v2-cap6-esp2 led1 | (197.25, 42.25) | (204, 44.25) | +6.75, +2 |
| v2-cap6-esp2 led2 | (234.75, 42.25) | (249, 44.25) | +14.25, +2 |
| v2-cap6-esp3 led1 | (182.25, 42.25) | (189, 44.25) | +6.75, +2 |
| v2-cap6-esp3 led2 | (219.75, 42.25) | (226.5, 44.25) | +6.75, +2 |
| v2-cap6-esp3 led3 | (257.25, 42.25) | (264, 44.25) | +6.75, +2 |
| v2-cap7-esp2 led1 | (272.25, 42.25) | (279, 44.25) | +6.75, +2 |
| v2-cap7-esp4 led1 | (272.25, 42.25) | (279, 44.25) | +6.75, +2 |
| v2-cap8-esp1 led1 | (197.25, 42.25) | (204, 44.25) | +6.75, +2 |
| v2-cap8-esp2 led1 | (197.25, 42.25) | (204, 44.25) | +6.75, +2 |
| v2-cap8-esp3 led1 | (197.25, 42.25) | (204, 44.25) | +6.75, +2 |
| v2-cap9-esp2 led1 | (302.25, 42.25) | (316.5, 44.25) | +14.25, +2 |
| v2-cap10-esp4 led1 | (279.75, 42.25) | (286.5, 44.25) | +6.75, +2 |

### 3. Fixed Resistor Positions (5 resistors)
| Experiment | Old | New | Issue |
|---|---|---|---|
| v2-cap7-esp2 r1 | (241.5, 73.75) | (249, 73.75) | pin1 was 1 col off |
| v2-cap7-esp3 r1 | (256.5, 73.75) | (279, 73.75) | pin1 was 3 cols off |
| v2-cap7-esp4 r1 | (241.5, 73.75) | (249, 73.75) | pin1 was 1 col off |
| v2-cap9-esp2 r2 | (218.25, 98.75) | (219, 91.25) | wrong row (g vs f) |
| v2-cap9-esp2 r3 | (159, 98.75) | (159, 91.25) | wrong row (g vs f) |
| v2-cap9-esp2 r4 | (279, 98.75) | (279, 91.25) | wrong row (g vs f) |
| v2-cap9-esp2 r5 | (264, 73.75) | (286.5, 73.75) | pin1 was 3 cols off |

### 4. Fixed Button Position (1 button)
| Experiment | Old | New |
|---|---|---|
| v2-cap7-esp3 btn1 | (221.75, 81.75) | (229.25, 81.75) |

### 5. Fixed Potentiometer Position (1 pot)
| Experiment | Old | New |
|---|---|---|
| v2-cap8-esp3 pot1 | (283.25, 98.75) | (283.25, 69.25) |

### 6. Fixed Phototransistor Position (1 pt)
| Experiment | Old | New |
|---|---|---|
| v2-cap9-esp2 pt1 | (182.25, 66.25) | (185.25, 66.25) |

## Not Changed
- v2-cap6-esp4: No breadboard (free-floating components), positions OK
- v2-cap7-esp1: All positions verified correct
- v2-cap8-esp1/2/3 MOSFET: Approximate visual placement (3-pin vertical on horizontal row)
- v2-cap9-esp1: All positions verified correct
- v2-cap10-esp1/2: No breadboard (direct battery-motor), positions OK
- v2-cap10-esp3: Button position verified correct
- v2-cap12-esp1: Uses breadboard-full (different 7px pitch grid). Positions are inherently approximate due to component SVGs designed for 7.5px pitch. Left as-is.

## Build
565 modules, 4.39s, PASSES
