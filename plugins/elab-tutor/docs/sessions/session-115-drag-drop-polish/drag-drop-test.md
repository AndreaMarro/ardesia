# Drag & Drop Test Skill — Session 115

## Test Checklist

### Dead-Zone
- [ ] Mouse: Click on component without moving → no drag initiated (threshold 5px)
- [ ] Touch: Touch component without moving → no drag initiated (threshold 10px)
- [ ] Mouse: Move >5px → drag starts
- [ ] Touch: Move >10px → drag starts
- [ ] Accidental finger tremble on iPad → NO drag initiated

### Hit Area ≥44px (WCAG Touch Target)
- [ ] LED: hit area 44×50px (was 28×44)
- [ ] Resistor: hit area 60×44px (was 60×20)
- [ ] PushButton: hit area 44×44px (was 30×30)
- [ ] Diode: hit area 48×44px (was 48×24)
- [ ] ReedSwitch: hit area 56×44px (was 56×28)
- [ ] Capacitor: hit area 44×44px (was 28×44)
- [ ] Phototransistor: hit area 44×48px (was 32×48)
- [ ] RgbLed: hit area 44×54px (was 36×54)

### Snap Preview
- [ ] Drag LED near breadboard hole → lime circles appear on target holes
- [ ] Drag LED over occupied hole → red circles on those holes
- [ ] Drag component away from breadboard → circles disappear
- [ ] Drop → circles disappear

### Cursor States
- [ ] SVG idle: `default`
- [ ] Component hover: `grab` (was `pointer`)
- [ ] Component dragging: `grabbing`
- [ ] Wire mode: `crosshair`
- [ ] Panning: `grabbing`

### Regression Tests
- [ ] S112: Component snaps correctly to breadboard holes
- [ ] S113: Battery wire routing unchanged (L-shape, 14px separation)
- [ ] S114: Parent-child attachment preserved during drag
- [ ] Overlap prevention: component reverted on invalid drop
