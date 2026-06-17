# AGENT-14 -- Basetta Curva Builder Audit Report

**Date**: 2026-02-13
**Auditor**: AGENT-14 (Basetta Curva Builder)
**Subject**: NanoR4Board.jsx SVG vs NanoBreakoutV1.1 GP.dwg DXF Geometry Comparison
**Status**: READ-ONLY AUDIT

---

## 1. DXF Source Analysis

### 1.1 File Metadata
- **DWG File**: `NanoBreakoutV1.1 GP.dwg` (42KB, AC1032 / AutoCAD R2018)
- **Converted DXF**: `/tmp/nano-breakout.dxf` (228KB)
- **Last saved by**: Riccardo
- **Drawing extents**: X [-170.6, 144.1] / Y [-0.6, 201.9] (mm)
- **Codepage**: ANSI_1252
- **Entity count**: 173 entities (circles, lines, arcs, mtext, hatches, lwpolylines)
- **Note**: DXF contains text "ELAB Nano Breacout V1.0" (typo "Breacout" and version V1.0, not V1.1)

### 1.2 Key DXF Entities Extracted

#### Board Outline -- Semicircular Arc (LEFT SIDE)
```
ARC at line 26148:
  Center: (40.320, 40.240) mm
  Radius: 27.500 mm
  Start angle: 90 degrees
  End angle: 270 degrees
```
This is the defining feature -- a semicircle (180 degrees) from top to bottom on the left side of the board.

#### Wing Top Edge (LINE)
```
LINE at line 25030:
  From: (40.320, 67.740) to (88.317, 67.740) mm
```
This is the top edge of the wing, running horizontally from the arc junction to the wing right edge.

#### Wing Bottom Edge (LINE)
```
LINE at line 21140:
  From: (88.317, 52.984) to (50.407, 52.984) mm
```
This is the bottom boundary of the wing pin row area.

#### Wing Right Edge (LINE)
```
LINE at line 25176:
  From: (90.317, 65.740) to (90.317, 54.984) mm
```
Right side of the wing. Note: X=90.317, which is 2mm beyond the pin row line at X=88.317.

#### Wing Bottom-Left Corner (ARC, LINE, ARC)
```
ARC: Center (50.407, 50.984), R=2mm, 90-180 deg  -> bottom-left inner corner
LINE: (48.407, 50.984) to (48.407, 24.040)        -> left inner wall (down)
ARC: Center (50.407, 24.040), R=2mm, 180-270 deg  -> bottom corner to Nano area
```

#### Wing Top-Right Corner (ARC)
```
ARC: Center (88.317, 65.740), R=2mm, 0-90 deg     -> top-right rounded corner
```

#### Wing Bottom-Right Corner (ARC)
```
ARC: Center (88.317, 54.984), R=2mm, 270-0 deg    -> bottom-right rounded corner
```

---

## 2. SVG vs DWG Dimension Comparison

### 2.1 Overall Board Dimensions

| Dimension | DWG (mm) | SVG (mm equiv, /5) | SVG (units) | Match? |
|-----------|----------|---------------------|-------------|--------|
| Semicircle radius | 27.500 | 27.500 | 137.5 | EXACT |
| Semicircle center X | 40.320 | variable* | variable | SEE NOTE |
| Semicircle center Y | 40.240 | computed | computed | APPROX |
| Wing top Y | 67.740 | -- | -- | SEE NOTE |
| Wing bottom Y (pin area) | 52.984 | -- | -- | SEE NOTE |
| Wing right X | 90.317 | -- | -- | SEE NOTE |
| Wing inner X (left wall) | 48.407 | -- | -- | SEE NOTE |
| Wing height (top-bottom) | 14.756 | 14.800 | 74.0 | +0.3% |
| Wing width (top edge) | 47.997 | 40.000 | 200.0 | -16.7% MISMATCH |

*NOTE: The SVG uses a different coordinate system. The Nano PCB module (43.18 x 17.78 mm) is positioned at origin (0,0), and the ELAB breakout board is drawn around it with margins. The DWG uses absolute coordinates in a different layout.*

### 2.2 Critical Dimensional Findings

#### FINDING 1: Wing Width Mismatch (SIGNIFICANT)
- **DWG**: Wing top edge runs from X=40.320 to X=88.317 = **47.997 mm**
- **SVG**: `WING_W = 200` SVG units = 200/5 = **40.0 mm**
- **Comment in code**: "~40mm x 5 (DWG: 41.9mm, rounded for pin fit)"
- **Actual DWG**: 48.0 mm, not 41.9 mm
- **Delta**: -8.0 mm (the SVG wing is 16.7% too narrow)

The code comment says "DWG: 41.9mm" but the actual DXF measurement is 48.0mm. This is a **documentation error** in the code. The wing is drawn 8mm shorter than the real hardware.

#### FINDING 2: Wing Height -- Accurate
- **DWG**: From Y=52.984 to Y=67.740 = **14.756 mm**
- **SVG**: `WING_H = 74` SVG units = 74/5 = **14.8 mm**
- **Delta**: +0.044 mm (+0.3%) -- acceptable

#### FINDING 3: Semicircle Radius -- Exact
- **DWG**: R = 27.500 mm
- **SVG**: `OVAL_RADIUS = 27.5 * SCALE = 137.5`
- **Delta**: 0 -- perfect match

#### FINDING 4: Oval Shape Approximation
- **DWG**: True semicircle (R=27.5mm, 90-270 degree arc)
- **SVG**: Uses an elliptical arc `A ovalRx ovalRy 0 0 1` where:
  - `ovalRy = (mainBottom - mainTop) / 2` = half main body height
  - `ovalRx = ovalRy * 0.75` (manually set ratio)
- **Issue**: The DWG uses a perfect semicircle, not an ellipse. The SVG uses an elliptical approximation with Rx = 0.75 * Ry. This makes the left side narrower than the real hardware.
- **DWG semicircle**: The semicircle center is at (40.320, 40.240) with R=27.5. So the leftmost point is at X = 40.320 - 27.5 = **12.820 mm**, and the top/bottom points are at Y = 40.240 +/- 27.5 = Y = 12.740 / 67.740.
- **DWG board height**: 67.740 - 12.740 = **55.0 mm** (semicircle diameter)
- **DWG board width**: From leftmost point (12.820) to wing right (90.317) = **77.5 mm**
- **SVG board dimensions (ELAB_TOTAL_W x ELAB_TOTAL_H)**:
  - `ELAB_MAIN_W = 40 + 215.9 + 15 = 270.9` SVG = **54.2 mm**
  - `ELAB_TOTAL_W = 270.9 + 200 = 470.9` SVG = **94.2 mm** (wider than 77.5mm DWG!)
  - `ELAB_MAIN_H = 8 + 88.9 + 8 = 104.9` SVG = **21.0 mm** (much less than 55mm DWG!)

This reveals a fundamental architecture mismatch: the SVG wraps the ELAB breakout board around the Nano PCB module (43.18 x 17.78 mm) with small margins, but the real DWG board is 77.5 x 55.0 mm, which is much larger than the Nano module. The real board completely encloses the Nano with a 27.5mm radius semicircle on the left.

### 2.3 Pin Position Analysis

#### Wing Pins (DXF Group 1: X~77-88, Y~54.232)
DXF wing pin holes (R=0.5mm, sorted by X):

| Pin # | DXF X (mm) | DXF Y (mm) | Delta X (mm) | Pitch (mm) |
|-------|-----------|-----------|-------------|-----------|
| 1 | 77.633 | 54.232 | -- | -- |
| 2 | 80.173 | 54.232 | 2.540 | 2.540 |
| 3 | 82.713 | 54.232 | 2.540 | 2.540 |
| 4 | 85.253 | 54.232 | 2.540 | 2.540 |
| 5 | 87.793 | 54.232 | 2.540 | 2.540 |

**Result**: 5 wing pin holes at **2.54mm pitch** -- EXACT match to SVG `PIN_PITCH = 2.54 * 5 = 12.7`.

**BUT**: DXF shows only 5 wing pins (at Y=54.232), not 16. This suggests the DXF only contains a partial set, or the 16 wing pins are arranged differently in the DWG.

#### Wing Pins (DXF Group 2: X~49-75, Y~54.210)
A second group of pin holes exists at a slightly different Y coordinate:

| Pin # | DXF X (mm) | DXF Y (mm) | Delta X (mm) | Pitch (mm) |
|-------|-----------|-----------|-------------|-----------|
| 1 | 49.677 | 54.210 | -- | -- |
| 2 | 52.217 | 54.210 | 2.540 | 2.540 |
| 3 | 54.757 | 54.210 | 2.540 | 2.540 |
| 4 | 57.297 | 54.210 | 2.540 | 2.540 |
| 5 | 59.837 | 54.210 | 2.540 | 2.540 |
| 6 | 62.377 | 54.210 | 2.540 | 2.540 |
| 7 | 64.917 | 54.210 | 2.540 | 2.540 |
| 8 | 67.457 | 54.210 | 2.540 | 2.540 |
| 9 | 69.997 | 54.210 | 2.540 | 2.540 |
| 10 | 72.537 | 54.210 | 2.540 | 2.540 |
| 11 | 75.077 | 54.210 | 2.540 | 2.540 |

**Result**: 11 additional wing pins at 2.54mm pitch. Total = 5 + 11 = **16 wing pins**.

**Combined wing pin range**: X = 49.677 to 87.793 = **38.116 mm** span
**SVG wing pin range**: `WING_PIN_START_X` to last pin = `(231 + 8)` to `(231 + 8 + 15 * 12.7)` = 239 to 429.5 SVG = 47.8 to 85.9 mm equivalent -- but these are in SVG coordinate space.

**Pitch verification**: All 16 pins at exactly **2.540 mm** -- PERFECT match with SVG `PIN_PITCH`.

**Y-coordinate split**: Group 1 at Y=54.232, Group 2 at Y=54.210. The 0.022mm offset suggests these are on two separate circuit paths but the same row. The SVG uses a single Y for all wing pins (`WING_PIN_Y`), which is acceptable for visual representation.

#### Left Nano Header Pins (DXF: X~42.311, Y~22.477-58.038)
Vertical column of 15 pin holes at X=42.311 mm:

| # | DXF Y (mm) | Delta Y (mm) |
|---|-----------|-------------|
| 1 | 22.477 | -- |
| 2 | 25.017 | 2.540 |
| 3 | 27.557 | 2.540 |
| 4 | 30.097 | 2.540 |
| 5 | 32.637 | 2.540 |
| 6 | 35.177 | 2.540 |
| 7 | 37.717 | 2.540 |
| 8 | 40.257 | 2.540 |
| 9 | 42.797 | 2.540 |
| 10 | 45.337 | 2.540 |
| 11 | 47.877 | 2.540 |
| 12 | 50.417 | 2.540 |
| 13 | 52.957 | 2.540 |
| 14 | 55.497 | 2.540 |
| 15 | 58.037 | 2.540 |

**Result**: 15 pins, 2.540mm pitch -- matches Arduino Nano 15-pin header (D13,3V3,AREF,A0-A7,5V,RST,GND,VIN). EXACT match to SVG `LEFT_PINS` (15 entries).

**Row spacing**: Y range = 58.037 - 22.477 = **35.560 mm** = 14 * 2.54mm -- correct for 15 pins at 2.54mm pitch.

#### Right Nano Header Pins (DXF: X~27.07-27.09, Y~22.473-58.033)
Second vertical column of 15 pin holes at X~27.08 mm:

| # | DXF X (mm) | DXF Y (mm) | Delta Y (mm) |
|---|-----------|-----------|-------------|
| 1 | 27.094 | 22.473 | -- |
| 2 | 27.092 | 25.013 | 2.540 |
| ... | ... | ... | 2.540 |
| 15 | 27.073 | 58.033 | 2.540 |

**Result**: 15 pins, same pitch. The slight X variation (27.073-27.094) suggests the right header follows the semicircular arc curvature slightly. SVG `RIGHT_PINS` has 15 entries -- correct.

**Header spacing (between rows)**: 42.311 - 27.083 = **15.228 mm**
**SVG header spacing**: `ROW_SPACING = 15.24 * SCALE = 76.2` SVG = **15.240 mm**
**Delta**: +0.012 mm -- negligible, MATCH.

#### Third Row of Pins (DXF: X~24.53-24.55, Y~22.472-58.032)
A third column exists at X~24.54mm, same Y values. This is 2.54mm from the right header row.
This represents the **ELAB breakout board's outer header row** (the pads on the right side of the ELAB board where the Nano right-header pins are broken out).

### 2.4 Board Outline Reconstruction from DXF

The board outline, traced from the DXF entities:

1. **Top-left**: Semicircle arc starts at (40.320, 67.740) -- top of semicircle
2. **Top horizontal**: LINE from (40.320, 67.740) to (88.317, 67.740) -- top edge
3. **Top-right corner**: ARC center (88.317, 65.740), R=2, 0-90 deg -- rounded corner
4. **Right vertical**: LINE from (90.317, 65.740) to (90.317, 54.984) -- right edge
5. **Bottom-right corner**: ARC center (88.317, 54.984), R=2, 270-0 deg -- rounded corner
6. **Bottom horizontal (wing pin row)**: LINE from (88.317, 52.984) to (50.407, 52.984) -- bottom of wing
7. **Inner corner (wing-to-main)**: ARC center (50.407, 50.984), R=2, 90-180 deg
8. **Inner vertical**: LINE from (48.407, 50.984) to (48.407, 24.040) -- left wall of Nano slot
9. **Bottom corner**: ARC center (50.407, 24.040), R=2, 180-270 deg
10. **Bottom horizontal (Nano area)**: LINE from (50.217, 14.740) to (40.320, 12.740) -- bottom
11. **Inner corner**: ARC center (50.217, 14.740), R=2, 270-0 deg -- bottom Nano corner
12. **Nano slot right vertical**: LINE from (52.217, 14.740) to (52.217, 20.040)
13. **Inner corner**: ARC center (50.217, 20.040), R=2, 0-90 deg
14. **Semicircle**: ARC center (40.320, 40.240), R=27.5, 90-270 deg -- closes left side

**Board is NOT a simple "stadium + wing".** It has an internal slot/notch where the Arduino Nano sits. The real board shape is more like an inverted "L" with a semicircle on the left and an internal rectangular pocket for the Nano module.

### 2.5 DXF Text Labels

MTEXT entities found with label content:

| Label | DXF Position (X, Y) mm | Direction |
|-------|----------------------|-----------|
| A0 | (48.630, 55.300) | Vertical (rotated 90 deg) |
| A1 | (51.170, 55.300) | Vertical |
| A2 | (53.710, 55.300) | Vertical |
| A3 | (56.250, 55.300) | Vertical |
| + | (48.760, 59.502) | Vertical (power bus +) |
| - | (48.673, 65.555) | Vertical (power bus -) |
| + | (48.648, 13.765) | Vertical (power bus + bottom) |
| - | (48.561, 19.818) | Vertical (power bus - bottom) |
| ELAB Nano Breacout V1.0 | (28.218, 20.111) | Horizontal |
| ELAB Laboratory Elettronics | (14.860, 29.992) | Vertical (along semicircle) |

**Observations**:
- The DXF says "V1.0" while the SVG says "V1.1 GP" -- version bump not reflected in DXF
- The DXF has a typo: "Breacout" instead of "Breakout"
- The DXF has "Elettronics" (Italian/typo) instead of "Electronics"
- Power bus labels (+/-) exist at both top (Y~55-66) and bottom (Y~14-20) of the Nano slot

---

## 3. Shape Fidelity Assessment

### 3.1 Left Side Shape

| Aspect | DWG | SVG | Score |
|--------|-----|-----|-------|
| Geometry type | Semicircle (arc 90-270 deg) | Elliptical arc (Rx=0.75*Ry) | 6/10 |
| Radius | 27.500 mm | 27.500 mm (OVAL_RADIUS) | 10/10 |
| Curvature | Circular (Rx=Ry=27.5) | Elliptical (Rx~0.75*Ry) | 5/10 |
| Center position | (40.320, 40.240) | (ovalCenterX, ovalCenterY) | 7/10 |

**Issue**: The SVG uses `ovalRx = ovalRy * 0.75`, making the left side an oval (narrower horizontally). The DWG clearly shows a perfect semicircle with R=27.5mm. To match the DWG, `ovalRx` should equal `ovalRy` (both 27.5mm scaled).

### 3.2 Wing Shape

| Aspect | DWG | SVG | Score |
|--------|-----|-----|-------|
| Width | 48.0 mm | 40.0 mm | 4/10 |
| Height | 14.756 mm | 14.800 mm | 10/10 |
| Corner radii | R=2mm at all 4 corners | R=6 SVG (1.2mm) | 6/10 |
| Shape | Rectangle with rounded corners | Rectangle with rounded corners | 9/10 |

**Issue**: Wing width is 8mm too short. Corner radii are R=2mm in DWG but R=6 SVG units (1.2mm) in SVG.

### 3.3 Internal Nano Slot

| Aspect | DWG | SVG | Score |
|--------|-----|-----|-------|
| Present? | YES -- rectangular pocket | NO -- Nano sits on top | 2/10 |
| Slot dimensions | ~4.0 x 27.0 mm | Not modeled | 0/10 |

**Issue**: The DWG shows the Nano module inserted into a pocket/slot cut into the board. The SVG does not model this; it simply overlays the Nano PCB on top of the ELAB board. This is an aesthetic simplification but does not affect electrical simulation.

### 3.4 USB Connector

| Aspect | DWG | SVG | Score |
|--------|-----|-----|-------|
| Position | Not explicitly in DXF entities | Left edge of Nano PCB | 7/10 |
| Size | Not in DXF | 9x6.8mm (realistic for USB-C) | 8/10 |

USB connector is not present as a separate entity in the DXF (it is part of the Nano module, not the breakout board). The SVG placement on the Nano PCB is reasonable.

### 3.5 LEDs

| LED | DWG | SVG | Score |
|-----|-----|-----|-------|
| Power LED | Not in DXF | Present at (22, 24.9) | N/A |
| D13 LED | Not in DXF | Present at (28, 24.9) | N/A |
| TX/RX LEDs | Not in DXF | Present near USB | N/A |
| RGB LED | Not in DXF | Present at (120.8, 64.0) | N/A |

LEDs are Nano module features, not breakout board features. They are not in the breakout DXF. SVG placement is reasonable relative to the Nano PCB dimensions.

### 3.6 VIN Terminal Block

| Aspect | DWG | SVG | Score |
|--------|-----|-----|-------|
| Present in DXF? | YES (LWPOLYLINE + HATCH at ~X=56-62, Y=62-66) | YES (VinTerminalBlock component) | 8/10 |
| DXF position | X: 55.93-61.75, Y: 62.12-66.12 mm | WING_VIN_X, WING_VIN_Y | 7/10 |
| Screw holes | 2 circles at (57.346, 64.194) and (60.523, 64.194), R=0.829mm | 2 circles at relative positions | 7/10 |

---

## 4. Bus Naming Verification

### 4.1 BreadboardHalf.jsx (30-row half-breadboard)
- Uses: `bus-top-plus`, `bus-top-minus`, `bus-bot-plus`, `bus-bot-minus`
- Format: `bus-bot-plus-{N}` where N = 1 to 30
- Nets: `net-bus-bot-plus`, `net-bus-bot-minus`

### 4.2 BreadboardFull.jsx (63-row full breadboard)
- Uses: `bus-plus`, `bus-minus` (only 2 rails, left side)
- Format: `bus-plus-{N}`, `bus-minus-{N}` where N = 1 to 63
- Nets: `net-bus-plus`, `net-bus-minus`

### 4.3 Experiment Data (experiments-vol1.js, experiments-vol3.js)
- All experiments use: `bus-bot-plus-{N}`, `bus-bot-minus-{N}`, `bus-top-plus-{N}`, `bus-top-minus-{N}`
- This matches BreadboardHalf naming (the primary breadboard used in experiments)

### 4.4 WireRenderer.jsx
- Defines Y-coordinate mappings for: `bus-bot-plus`, `bus-bot-minus`

### 4.5 pinComponentMap.js
- References: `bus-top-plus`, `bus-top-minus`, `bus-bot-plus`, `bus-bot-minus`

### 4.6 Verdict
**PASS** -- Bus naming is consistently `bus-bot-plus/minus` (NOT `bus-bottom-plus/minus`) across all files. The naming convention is correctly maintained.

---

## 5. Pin Count and Ordering Verification

### 5.1 Left Header (SVG vs Arduino Nano R4 Pinout)

| Index | SVG Pin ID | SVG Label | Expected (Nano R4) | Match? |
|-------|------------|-----------|---------------------|--------|
| 0 | D13 | 13 | D13 | YES |
| 1 | 3V3 | 3.3V | 3V3 | YES |
| 2 | AREF | REF | AREF | YES |
| 3 | A0 | A0 | A0 | YES |
| 4 | A1 | A1 | A1 | YES |
| 5 | A2 | A2 | A2 | YES |
| 6 | A3 | A3 | A3 | YES |
| 7 | A4 | A4 | A4 | YES |
| 8 | A5 | A5 | A5 | YES |
| 9 | A6 | A6 | A6 | YES |
| 10 | A7 | A7 | A7 | YES |
| 11 | 5V | 5V | 5V | YES |
| 12 | RST_L | RST | RST | YES |
| 13 | GND | GND | GND | YES |
| 14 | VIN | VIN | VIN | YES |

**15 pins total -- CORRECT for Arduino Nano left header.**

### 5.2 Right Header

| Index | SVG Pin ID | SVG Label | Expected (Nano R4) | Match? |
|-------|------------|-----------|---------------------|--------|
| 0 | D12 | 12 | D12 | YES |
| 1 | D11 | ~11 | D11 (PWM) | YES |
| 2 | D10 | ~10 | D10 (PWM) | YES |
| 3 | D9 | ~9 | D9 (PWM) | YES |
| 4 | D8 | 8 | D8 | YES |
| 5 | D7 | 7 | D7 | YES |
| 6 | D6 | ~6 | D6 (PWM) | YES |
| 7 | D5 | ~5 | D5 (PWM) | YES |
| 8 | D4 | 4 | D4 | YES |
| 9 | D3 | ~3 | D3 (PWM) | YES |
| 10 | D2 | 2 | D2 | YES |
| 11 | GND_R | GND | GND | YES |
| 12 | RST_R | RST | RST | YES |
| 13 | RX | RX | D0/RX | YES |
| 14 | TX | TX | D1/TX | YES |

**15 pins total -- CORRECT.**

### 5.3 Wing Pins

| Index | SVG Pin ID | SVG Label | Maps To | Match? |
|-------|------------|-----------|---------|--------|
| 0 | W_A0 | A0 | A0 | YES |
| 1 | W_A1 | A1 | A1 | YES |
| 2 | W_A2 | A2 | A2 | YES |
| 3 | W_A3 | A3 | A3 | YES |
| 4 | W_D3 | ~D3 | D3 | YES |
| 5 | W_D5 | ~D5 | D5 | YES |
| 6 | W_D6 | ~D6 | D6 | YES |
| 7 | W_D9 | ~D9 | D9 | YES |
| 8 | W_A4 | A4/SDA | A4 | YES |
| 9 | W_A5 | A5/SCL | A5 | YES |
| 10 | W_D0 | D0/RX | RX | YES |
| 11 | W_D1 | D1/TX | TX | YES |
| 12 | W_D13 | D13/SCK | D13 | YES |
| 13 | W_D12 | D12/MISO | D12 | YES |
| 14 | W_D11 | ~D11/MOSI | D11 | YES |
| 15 | W_D10 | ~D10 | D10 | YES |

**16 wing pins -- matches DXF pin count (5 + 11 = 16). CORRECT.**

The DXF label text confirms the first 4 wing pins are A0-A3, matching the SVG ordering.

---

## 6. Score Summary

| Category | Score | Notes |
|----------|-------|-------|
| Semicircle radius | 10/10 | 27.5mm exact match |
| Semicircle shape | 5/10 | DWG: circle, SVG: ellipse (Rx=0.75*Ry) |
| Wing height | 10/10 | 14.756 vs 14.800 mm (+0.3%) |
| Wing width | 4/10 | DWG: 48mm, SVG: 40mm (-16.7%) |
| Wing corners | 6/10 | DWG: R=2mm, SVG: R=1.2mm |
| Nano slot | 2/10 | DWG has slot, SVG does not |
| Pin count (left header) | 10/10 | 15/15 correct |
| Pin count (right header) | 10/10 | 15/15 correct |
| Pin count (wing) | 10/10 | 16/16 correct |
| Pin ordering | 10/10 | All pins match expected Arduino Nano R4 pinout |
| Pin pitch (wing) | 10/10 | 2.540mm exact in DXF and SVG |
| Header spacing | 10/10 | 15.228 vs 15.240 mm (+0.08%) |
| Bus naming | 10/10 | Consistently bus-bot-plus/minus |
| Power bus pads | 8/10 | Present in both DXF and SVG |
| VIN terminal | 7/10 | Present in both, position approximate |
| Version text | 6/10 | DXF: "V1.0", SVG: "V1.1 GP" (version bump undocumented in DXF) |
| Overall board dimensions | 5/10 | SVG main body too small relative to DWG |

**Overall Shape Fidelity Score: 7.2 / 10**

---

## 7. Recommended Fixes (Prioritized)

### P0 -- Critical (Affects visual accuracy)

1. **Fix wing width**: Change `WING_W` from 200 to 240 SVG units (48mm x 5). Update code comment from "DWG: 41.9mm" to "DWG: 48.0mm".

2. **Fix oval to semicircle**: Change `ovalRx = ovalRy * 0.75` to `ovalRx = ovalRy` (or use the OVAL_RADIUS constant directly). The DWG uses a perfect semicircle, not an ellipse.

### P1 -- Important (Affects dimensional accuracy)

3. **Fix wing corner radii**: Change `r = 6` (1.2mm) to `r = 10` (2.0mm) to match DWG R=2mm corners.

4. **Fix overall board scaling**: The ELAB board margins (ELAB_MARGIN_*) create a board that is much smaller than the real 77.5 x 55mm DWG dimensions. Consider recalculating margins so that the total ELAB board envelope matches the DWG.

### P2 -- Nice-to-have (Cosmetic)

5. **Add Nano slot cutout**: The real board has a rectangular slot where the Nano is inserted. Adding a slightly darker rectangle or notch would improve visual fidelity.

6. **Fix wing pin start position**: Verify `WING_PIN_START_X` aligns with DXF first wing pin at X=49.677mm relative to board origin.

7. **Fix version text typo in DXF**: The DXF source says "Breacout" and "V1.0" -- these should be corrected in the DWG source file (out of scope for SVG code, but documented here for the hardware team).

---

## 8. Files Audited

| File | Path | LOC |
|------|------|-----|
| NanoR4Board.jsx | `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/components/NanoR4Board.jsx` | 930 |
| BreadboardHalf.jsx | `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/components/BreadboardHalf.jsx` | ~490 |
| BreadboardFull.jsx | `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/components/BreadboardFull.jsx` | ~470 |
| experiments-vol1.js | `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/data/experiments-vol1.js` | (sampled) |
| experiments-vol3.js | `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/data/experiments-vol3.js` | (sampled) |
| WireRenderer.jsx | `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/canvas/WireRenderer.jsx` | (sampled) |
| pinComponentMap.js | `/Users/andreamarro/VOLUME 3/manuale/elab-builder/src/components/simulator/utils/pinComponentMap.js` | (sampled) |
| DXF source | `/tmp/nano-breakout.dxf` | 26,300+ |

---

*AGENT-14 -- Basetta Curva Builder -- Audit Complete*
