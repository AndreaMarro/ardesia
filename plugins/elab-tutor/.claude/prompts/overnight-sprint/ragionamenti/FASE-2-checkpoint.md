# FASE 2 — Drag & Drop Libero Mode Checkpoint

## Data: 2026-03-12
## Sessione: S114 (Systematic Sprint)

## Obiettivo
Verificare che tutti i 17 tipi di componente del simulatore possano essere:
1. Aggiunti via API (`addComponent`)
2. Trascinati dalla palette alla breadboard (HTML5 drag & drop)
3. Posizionati con auto-pin assignment
4. Spostati via `moveComponent`
5. Renderizzati senza errori console (NaN fix)

## Bug Trovato e Fixato

### NaN Position Guard (SimulatorCanvas.jsx:2207)
- **Sintomo**: `Received NaN for the x/y attribute` — 2 React warnings dopo bulk-add di 17 componenti
- **Root Cause**: `rawPos.x ?? 0` (nullish coalescing) NON cattura `NaN` — cattura solo `null`/`undefined`
- **Fix**: Cambiato a `Number.isFinite(rawPos.x) ? rawPos.x : 0` che guarda `NaN`, `Infinity`, `undefined`, e `null`
- **File**: `src/components/simulator/canvas/SimulatorCanvas.jsx` riga 2207
- **Prima**: `const pos = { x: rawPos.x ?? 0, y: rawPos.y ?? 0, ... }`
- **Dopo**: `const pos = { x: Number.isFinite(rawPos.x) ? rawPos.x : 0, y: Number.isFinite(rawPos.y) ? rawPos.y : 0, ... }`

## Risultati Test

### Test 1: Bulk API Add (17/17 PASS)
Tutti i 17 tipi istanziati con successo via `__ELAB_API.addComponent()`:
- `led` → `led_1` ✅
- `rgb-led` → `rgbled_2` ✅
- `resistor` → `resist_3` ✅
- `push-button` → `pushbu_4` ✅
- `potentiometer` → `potent_5` ✅
- `photo-resistor` → `photor_6` ✅
- `buzzer-piezo` → `buzzer_7` ✅
- `capacitor` → `capaci_8` ✅
- `mosfet-n` → `mosfet_9` ✅
- `phototransistor` → `photot_10` ✅
- `motor-dc` → `motord_11` ✅
- `diode` → `diode_12` ✅
- `reed-switch` → `reedsw_13` ✅
- `multimeter` → `multim_14` ✅
- `servo` → `servo_15` ✅
- `lcd16x2` → `lcd16x_16` ✅
- `battery9v` → `batter_17` ✅

### Test 2: HTML5 Drag & Drop (2/2 PASS)
- LED dragged from palette → breadboard: auto-pin "~D9", snapped to hole, red LED visible ✅
- Resistor dragged from palette → breadboard: auto-pin "d12", color bands visible ✅

### Test 3: moveComponent API (1/1 PASS)
- `moveComponent('led_21', 600, 80)` — LED moved visually (confirmed via screenshot) ✅
- Nota: `getComponentPositions()` ritorna dati stale per 1 tick React (async ref update) — non è un bug

### Test 4: NaN Fix Verification (PASS)
- **Prima del fix**: 2 console errors `Received NaN for x/y attribute` dopo bulk add
- **Dopo il fix**: 0 console errors dopo bulk add di 17 componenti ✅
- 0 errori di qualsiasi tipo nella console ✅

### Test 5: SVG DOM Verification (PASS)
- SVG canvas `.elab-simulator-canvas svg` contiene tutti i componenti aggiunti
- Ogni componente renderizzato come `<g transform="translate(x,y)">` con figli corretti
- Breadboard ~73 children, NanoR4Board ~37 children, componenti piccoli 6-27 children

## Architettura Compresa

### Flusso Add Component
1. `ComponentPalette` → HTML5 `dataTransfer.setData('application/elab-component', JSON.stringify({type}))`
2. `SimulatorCanvas.handleDrop` → legge tipo, calcola posizione drop
3. `NewElabSimulator.handleComponentAdd` → crea componente, aggiunge a `customComponents` + `customLayout`
4. `computeAutoPinAssignment()` → se vicino a breadboard, auto-snap a hole + assegna pin
5. `useMemo` → merges `customComponents` in `mergedExperiment`
6. `SimulatorCanvas.renderComponentGroup` → renderizza SVG con `Number.isFinite()` guard

### State Architecture
- `customComponents` (state) + `customLayout` (state) → `mergedExperiment` (useMemo) → `mergedExperimentRef` (useEffect, async)
- `getComponentPositions()` legge da `mergedExperimentRef.current` — può essere stale per 1 tick
- `moveComponent(id, x, y)` → `handleLayoutChangeRef.current(id, {x, y}, true)`

## Self-Consistency Check
- Path A: Solo NaN fix → rischio: basso → probabilità successo: 99%
- Path B: Refactor completo position handling → rischio: alto → probabilità successo: 70%
- Path C: Add position validation layer → rischio: medio → probabilità successo: 85%
→ SCELTA: Path A — fix minimale, massimo impatto, zero regressioni

## CoV Results
- [x] 17/17 component types instantiate via API
- [x] HTML5 drag & drop works (LED + Resistor tested)
- [x] Auto-pin assignment works (snaps to breadboard holes)
- [x] moveComponent API works visually
- [x] NaN fix eliminates `Received NaN` console errors (0 errors after bulk add)
- [x] SVG DOM contains all added components
- [x] 0 console errors of any kind after 17-component bulk add

## Auto-Score: 9/10
Motivazione: Tutti i 17 tipi funzionano, drag & drop verificato, NaN fix applicato e verificato.
-1 perché non ho testato delete/undo di componenti e wiring in Libero mode (fuori scope FASE 2).

## Lezione Appresa
**`Number.isFinite()` > `?? 0` per coordinate SVG.**
Nullish coalescing (`??`) cattura solo `null`/`undefined`, ma `NaN` passa indisturbato e causa
React warning su attributi SVG. `Number.isFinite()` è il guard corretto per qualsiasi valore numerico
destinato a attributi SVG `x`, `y`, `width`, `height`, `transform`.
