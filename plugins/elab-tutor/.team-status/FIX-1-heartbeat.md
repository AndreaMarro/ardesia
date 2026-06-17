# FIX-1 Heartbeat — COMP_SIZES + Selection Highlight Fix

## Status: COMPLETED
## Timestamp: 2026-02-13

## Changes Made

### 1. COMP_SIZES dimensions fixed (line 43-46)
- `breadboard-half`: `{ w: 260, h: 150 }` -> `{ w: 253, h: 145 }` (calculated from BreadboardHalf.jsx constants)
- `breadboard-full`: `{ w: 460, h: 150 }` -> `{ w: 110, h: 469 }` (VERTICAL breadboard! calculated from BreadboardFull.jsx constants)

### 2. Multi-selection highlight fixed (line 1507-1522)
- Was: Always used `pos.x - hw, pos.y - hh` (centered origin) for all components
- Now: TOP_LEFT_ORIGIN components (breadboard-half, breadboard-full, nano-r4) use `pos.x - pad, pos.y - pad`
- Centered components unchanged: `pos.x - size.w/2 - pad, pos.y - size.h/2 - pad`

### 3. Selected highlight fixed (line 1525-1598)
- Was: Always used `(-hw, -hh)` relative to `translate(pos.x, pos.y)` (centered origin)
- Now: TOP_LEFT_ORIGIN components use `(-pad, -pad)` with size `(size.w + pad*2, size.h + pad*2)`
- Delete and Rotate buttons repositioned to track the correct highlight rect corners

## Verification
- BreadboardFull.jsx: BOARD_WIDTH = 8*2 + 14 + 5*7*2 + 10 = 110, BOARD_HEIGHT = 8*2 + 6*2 + 63*7 = 469
- BreadboardHalf.jsx: BOARD_W = 30*7.5 + 14*2 = 253, BOARD_H = 145 (all sections summed)
- calcAutoFitViewbox (line 192): Already handled TOP_LEFT_ORIGIN correctly
- getBoundingBox (line 449): Already handled TOP_LEFT_ORIGIN correctly
- Build: PASSES (565 modules, 4.37s)

## File Modified
- `src/components/simulator/canvas/SimulatorCanvas.jsx`
