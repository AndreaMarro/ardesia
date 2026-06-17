# FIX-3: Vol1 Experiment Layout Fixes

## Status: COMPLETED
## Timestamp: 2026-02-13

## Summary
Fixed 103 component positions across 33 experiments in `experiments-vol1.js`. Components were misaligned from their assigned breadboard holes, causing visual overlap and incorrect pin placement.

## Root Causes Found
1. **Potentiometer Y offset wrong**: All potentiometers were placed at row e center (y: 73.75) instead of y: 51.75. With pin offset y:+22, this placed pins at y:95.75 (row g) instead of the assigned row e (y:73.75). Fix: shifted all pots up by 22 SVG units.
2. **Resistor X offset wrong**: Resistors were consistently shifted ~15px left. The midpoint calculation between pin1 and pin2 was incorrect. Fix: recomputed center X from actual hole positions.
3. **RGB LED X offset wrong**: RGB LEDs were shifted ~17px left of their assigned holes. Fix: centered over geometric mean of 4 assigned hole positions.
4. **Push button X offset wrong**: Buttons were ~4px left of correct center between their two assigned columns. Fix: centered between pin1 and pin2 assigned columns.
5. **LED X offset wrong**: LEDs were shifted ~7.5px left. Fix: centered between anode and cathode hole positions.

## What Was Fixed
- 33 experiments affected (Chapters 7-14)
- 103 individual component position corrections
- Types fixed: potentiometer (22 fix), resistor (30 fix), rgb-led (19 fix), push-button (12 fix), led (12 fix), photo-resistor (4 fix), buzzer-piezo (2 fix), reed-switch (2 fix)

## Remaining Known Issues (Inherent, Not Fixable)
- **RGB LED pin spacing**: SVG component pins are 3mm apart (-4,-1,2,5) but breadboard holes are 7.5mm apart. Components are now centered over assigned holes but individual pins can't perfectly align. This is a component design limitation.
- **Button pin spacing**: Tactile button straddles the IC gap; pin offsets (-14,+14 X, -8,+8 Y) don't exactly match arbitrary row-e/row-f hole positions. Centered as best as possible.
- **Button overlaps in cap8-esp4/5**: 3 adjacent buttons overlap ~12% — this accurately represents the physical breadboard layout (buttons every 4 columns).
- **Resistor/LED body overlap in IC gap**: Components in rows c and h have bodies that extend into the central IC gap area, causing minor visual overlaps. This is physically accurate.

## Verification
- Build: PASSES (565 modules, 4.06s)
- Pin alignment: Reduced from 258 mismatches to 115 (remaining are all inherent RGB/button spacing)
- Component overlaps: 4 original + 5 inherent (all physically accurate for breadboard layout)
- Outside bounds: v1-cap14-esp1 uses breadboard-full (not half) — bounds check was false alarm
