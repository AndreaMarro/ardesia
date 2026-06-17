# Known Issues & Architecture Rules for QA

## Breadboard Geometry (CRITICAL — must match exactly)
### BreadboardHalf
- Pitch: 7.5px between holes
- Padding X: 14px, Padding Y: 10px
- Top section rows: a,b,c,d,e — Bottom section rows: f,g,h,i,j
- 30 columns per section
- Gap between sections: 10px (the "ravine")
- Snap radius: 30px (4x pitch) — for iPad touch precision

### BreadboardFull (vertical layout)
- Pitch: 7px between holes
- 63 rows × 5+5 cols (left a-e, right f-j) + bus (plus/minus)
- Gap between left and right: 10px
- Board padding: 8px

## Parent-Child System ("Antigravity")
- Components snapped to breadboard get `parentId` in layout
- When parent (breadboard) is dragged, ALL children must move with it (same delta)
- Wires connected to children must also update endpoints
- `inferParentFromPinAssignments()` sets parentId from pinAssignments when loading experiments

## Drag & Drop Rules
1. Pointer events use `onPointerDown/Move/Up` (NOT mouse events — for iPad compatibility)
2. `touch-action: none` on canvas prevents browser zoom/scroll during drag
3. Components must maintain relative position to breadboard during group drag
4. Wire endpoints update live during drag (no visual detachment)
5. SVG viewBox transforms must be accounted for when converting pointer coords

## Circuit Solver Mapping Rules
1. Holes in same column on same breadboard section are electrically connected
2. Bus rails run full length of breadboard
3. Gap between top/bottom section is NOT connected
4. Pin assignments format: `"componentId:pinName" -> "breadboardId:holeId"`
5. Solver must work at ANY viewport size — coordinates are SVG-space, not screen-space

## AVR Specific Rules
1. AVR experiments have `simulationMode: 'avr'`
2. Compile button sends code to external compiler API
3. AVR Worker runs in Web Worker (off main thread)
4. Pin state changes propagate from AVR -> CircuitSolver -> component visual state
5. Serial Monitor reads from AVR UART output

## Scratch/Blockly Rules
1. Scratch tab appears for ALL Vol3 AVR experiments (gate: `simulationMode === 'avr'`)
2. Side-by-side layout: Blockly (60%) + CodeEditorCM6 read-only (40%)
3. Real-time C++ generation as blocks are modified
4. "Compila & Carica" button compiles generated C++
5. 22 custom blocks across 8+ categories
6. LCD blocks: lcd_init, lcd_print, lcd_set_cursor, lcd_clear

## Screen Adaptivity Requirements
- Desktop: full toolbar, side panels
- iPad landscape (1024-1366px): toolbar overflow hidden, Galileo/info hidden ≤1365px
- iPad portrait (768px): Scratch vertical stack (Blockly 60% + code 40%)
- Touch targets: ≥44px for all interactive elements
- viewBox must scale without breaking pin positions or wire routing
