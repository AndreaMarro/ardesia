# FIX-2: Vol3 Layout Overlap Fix

## Status: COMPLETED
## Timestamp: 2026-02-13

## Problem
NanoR4 board and breadboard overlapped in ALL Vol3 experiments. Both were positioned at x:100 (nano y:-90, bb y:10) but the NanoR4 is 387.5x275 SVG units and the breadboard is 110x469 SVG units (vertical), causing massive overlap.

## Solution
Changed from vertical stacking to horizontal side-by-side layout:
- **nano1**: `{ x: 100, y: -90 }` -> `{ x: -320, y: 50 }` (LEFT side)
- **bb1**: `{ x: 100, y: 10 }` -> `{ x: 330, y: 0 }` (RIGHT side)
- Gap: nano right edge at ~280, breadboard left edge at 330 = 50 SVG units clearance

## Changes Made
- **File**: `src/data/experiments-vol3.js`
- **13 experiments** updated (all Vol3)
- All nano1 positions: x:-320, y:50
- All bb1 positions: x:330, y:0
- All component positions shifted: x += 230, y -= 10
- Header comments updated with new coordinate formulas
- holeX(col) = 347.75 + (col-1) * 7.5
- rowY values shifted by -10

## Components Shifted
| Experiment | Components |
|------------|-----------|
| v3-cap6-blink | r1, led1 |
| v3-cap6-pin5 | r1, led1 |
| v3-cap6-morse | r1, led1 |
| v3-cap6-sirena | r1, led1, r2, led2 |
| v3-cap6-semaforo | r1, led1, r2, led2, r3, led3 |
| v3-cap7-pullup | btn1 |
| v3-cap7-pulsante | btn1, r1, led1 |
| v3-cap7-mini | btn1, r1, led1, r2, led2 |
| v3-cap8-id | (no components, just nano+bb) |
| v3-cap8-pot | pot1 |
| v3-cap8-serial | pot1 |
| v3-extra-lcd-hello | lcd1 |
| v3-extra-servo-sweep | servo1 |

## Build
- PASSES: 565 modules, 4.61s
- No warnings or errors related to this change
