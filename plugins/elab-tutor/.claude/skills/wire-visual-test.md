# Wire Visual Test Skill

Test wire rendering visual quality, focusing on battery wire separation and routing.

## Test Checklist

### Battery Wire Separation
1. Load any Vol1 experiment (all have battery9v) → verify red and black wires do NOT overlap
2. Red wire (positive) should jog RIGHT from battery pin
3. Black wire (negative) should jog LEFT from battery pin
4. Visual separation should be ≥15px at midpoint between battery and breadboard

### Wire Routing Quality
5. Move battery component → wires re-route correctly with maintained separation
6. Move breadboard → all wires follow, including battery wires
7. Zoom in (200%) → wires render cleanly, no pixel artifacts
8. Zoom out (50%) → wires still distinguishable

### Regression Tests
9. Arduino↔breadboard wires still route normally (not affected by polarity fix)
10. Jumper wires (BB↔BB) still route normally
11. Load Vol2 experiment with battery → same separation behavior
12. "Passo Passo" mode → wires appear correctly as steps progress

### Edge Cases
13. Wire with explicit color override → still routes with polarity-based separation
14. Multiple batteries (if any experiment has them) → each pair separates correctly
15. Free-air wires (no breadboard) → unaffected by polarity routing

## How to Run
```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
npm run build  # Verify 0 errors
npm run dev    # Start dev server
```
Open browser → Load Esperimento 1.1 (LED Semplice) → Check battery wires visually.
Repeat with 4 more Vol1 experiments to verify consistency.
