# Demo 25/05/2026 sera — Handoff cross-sessione

**Stato**: Sat 24/05 02:00 AM. Demo lunedì 25/05 sera. ~36h finestra.

**Live**: https://www.elabtutor.school
**Branch**: `feat/demo-25may` (worktree `elab-builder-demo25/`)
**Last commit**: round 12 selection bbox Battery9V
**Tests**: 251/251 unit pass

## Contesto critico

### Andrea verbatim recenti

1. "FAI UN LAVORO IMPECCABILE. NON COMPIACERMI"
2. "i fili devono partire dalla batteria"
3. "resistenze troppo lunghe per essere collegate come sul libro"
4. "le breadboard dovrebbe essere verticale nel primo volume" (deferred post-demo)
5. "nel simulatore devono esserci solo gli esperimenti che abbiamo selezionato"
6. "io descrivo come sono su libro, voi montate"
7. "Un bambino deve avere lo stesso riferimento del libro"

### Demo committenti

- **Giovanni Fagherazzi** (ex Arduino Global Sales)
- **Omaric Elettronica** (kit hardware Strambino)
- **Davide Fagherazzi** (volumi cartacei + MePA)
- Andrea reputation depends on this demo

## 7 esperimenti demo selezionati

| ID | Titolo | Libro | Componenti |
|----|--------|-------|------------|
| `v1-cap6-esp1` | Accendi primo LED | Vol1 pag.29 | bat + R 470Ω + LED rosso |
| `v1-cap6-esp2` | LED senza R (brucia) | Vol1 pag.32 | bat + LED rosso |
| `v1-cap6-esp3` | Cambia luminosità | Vol1 pag.33 | bat + R 220/470/1k + LED |
| `v2-cap7-esp1` | Carica condensatore + MM | Vol2 pag.67-68 | bat + btn + cap 1000µF + MM |
| `v2-cap7-esp2` | Carica+scarica cap + LED | Vol2 pag.69-70 | bat + btn + cap + R 1k + LED + MM |
| `v3-cap6-esp4` | Due LED alternano | Vol3 pag.54 | Nano R4 + 2 LED + 2 R |
| `v3-cap6-esp5` | Semaforo 3 LED | Vol3 pag.57 | Nano R4 + 3 LED + 3 R |

## Topologia canonica (5 esp baked pixel-perfect)

### v1-cap6-esp1 (LED+R, libro pag.29)

```
components: bat1, bb1, r1=470Ω, led1=led-bridge red
pinAssignments:
  r1:pin1 = bb1:a2
  r1:pin2 = bb1:a7  (5-col span)
  led1:anode = bb1:e7
  led1:cathode = bb1:f7
connections (4 wires):
  bat1:positive → bb1:bus-top-plus-1 (red)
  bb1:bus-top-plus-2 → bb1:a2 (red)
  bb1:f7 → bb1:bus-bot-minus-7 (black)
  bb1:bus-bot-minus-1 → bat1:negative (black)
```

### v1-cap6-esp2 (no R, brucia)

```
components: bat1, bb1, led1=led-bridge red (NO R)
pinAssignments: led1:anode=e7, led1:cathode=f7
connections (4 wires):
  bat+ → bus-top-plus-1
  bus-top-plus-7 → a7 (direct anode, NO R)
  f7 → bus-bot-minus-7
  bus-bot-minus-1 → bat-
```

### v1-cap6-esp3 (R variable, libro pag.33)

Stesso layout esp1, R=220Ω default (cambia 220→470→1k).

### v2-cap7-esp1 (carica cap solo)

```
components: bat1, bb1, c1=1000µF, btn1=push-button, mm1=multimeter (NO R, NO LED)
pinAssignments:
  c1:positive = bb1:e14
  c1:negative = bb1:f14  (a cavallo gap)
  btn1:pin1 = bb1:e10, pin2 = bb1:e12, pin3 = bb1:f10, pin4 = bb1:f12  (4-pin tactile)
connections (7 wires):
  bat+ → bus-top-plus-1
  bus-top-plus-10 → a10 (alimenta btn)
  c12 → c14 (btn out → cap+)
  f14 → bus-bot-minus-14
  bus-bot-minus-1 → bat-
  mm1:probe-positive → b14 (cap+ misura)
  mm1:probe-negative → g14 (cap- bot section)
```

### v2-cap7-esp2 (carica+scarica con LED)

```
components: bat1, bb1, c1=1000µF, btn1, led1=led-bridge red, r1=1kΩ, mm1
pinAssignments:
  c1:positive=e14, c1:negative=f14
  btn1: e10/e12/f10/f12 (4-pin)
  r1:pin1=a14, r1:pin2=a19  (5-col span)
  led1:anode=e19, led1:cathode=f19
connections (8 wires):
  bat+ → bus-top-plus-1
  bus-top-plus-10 → a10 (btn)
  c12 → c14 (btn out → cap+)
  f14 → bus-bot-minus-14
  f19 → bus-bot-minus-19 (LED catodo → GND)
  bus-bot-minus-1 → bat-
  mm probes b14/g14
```

### v3-cap6-esp4 + v3-cap6-esp5 (Nano R4 demo, AVR)

**NON ancora pixel-perfect baked**. Reverted a base origin/main 4d75c0ca topology.
Andrea può ribasarli manualmente come libro Vol3 pag.54+57.

## Componenti SVG (modifiche sessione)

### Resistor

- Pin distance: **37.5px** (5-col span, was 7-col = 52.5)
- Body: 8px (compatto book-style)
- Leads: 14.75px each side (~75% leads / 19% body — 1/4W axial proportion)
- 4 color bands E12 standard (220Ω=red-red-brown-gold, 470Ω=yellow-violet-brown-gold, 1kΩ=brown-black-red-gold)
- File: `src/components/simulator/components/Resistor.jsx`

### Battery9V

- Pin coords: positive=(9, -30), negative=(9, -10) (clip terminals exit)
- renderMode='clip_simplified' auto-applied per demo esp (no strisci internal wires)
- COMP_SIZES updated: w=85, h=40, ox=-28.5, oy=-20 (selection bbox wraps body+clip correctly)
- File: `src/components/simulator/components/Battery9V.jsx`

### LED standard

- Splay+: anode polyline UP-LEFT, cathode polyline UP-RIGHT con KINK (gambe divaricate visibili)

### LedBridge (NEW)

- Variant per attraversare gap centrale breadboard
- Pins: anode (0, -8.75), cathode (0, +8.75) — stessa col, righe diverse (top e ↔ bot f)
- Solver: led-bridge wired in _solveLED + getCompPins + getMNAResistance + _initState + pinMap
- Allowlists: WireRenderer + ComponentPalette + ComponentDrawer + SimulatorCanvas + PlacementEngine

## Demo filter (Andrea mandate STRICT)

File: `src/data/demo-mode.js`

```javascript
DEMO_MODE_ENABLED = true (default)
DEMO_EXPERIMENT_IDS = [
  'v1-cap6-esp1','v1-cap6-esp2','v1-cap6-esp3',
  'v2-cap7-esp1','v2-cap7-esp2',
  'v3-cap6-esp4','v3-cap6-esp5'
]
```

**Filter applicato a**:
- `ALL_EXPERIMENTS` (experiments-index.js) ← solo 7
- `ALL_EXPERIMENTS_RAW` ← set completo 91 (uso interno solo)
- `findExperimentById` ← **STRICT**: return null per non-demo IDs
- `ExperimentPicker` (componenti lavagna) ← filtra picker
- `PercorsoCapitoloView` ← filtra modalità percorso
- `LessonPathPanel allExperiments` ← passa ALL_EXPERIMENTS filtrato

**Bypass paths verificati**:
- URL hash `#lavagna?exp=v1-cap10-esp1` ← `findExperimentById` ritorna null → no load
- localStorage stale ← stesso check
- next_experiment ref a non-demo ← bloccato

**Per riattivare post-demo**:
```javascript
// src/data/demo-mode.js
export const DEMO_MODE_ENABLED = false;
```

## Bug fix sessione

1. ✅ Topology revert pre-modifiche (cavi staccati dalla batteria)
2. ✅ Battery9V pin coords → clip terminals
3. ✅ Battery9V clip − coord y=+8 → y=-10 (was scollegato)
4. ✅ Resistor body 26→18→14→10→8px (Andrea iter 3 close-up)
5. ✅ Resistor pin distance 7→5 col (libro Vol1 pag.29)
6. ✅ Resistor color bands E12 standard
7. ✅ LED gambe divaricate + splay angle
8. ✅ LedBridge variant per gap centrale
9. ✅ Properties panel no "unknown" → label IT
10. ✅ Push-button 4-pin assignments esp1+esp2 Vol2
11. ✅ Solver led-bridge full wiring (_solveLED + ...)
12. ✅ led-bridge in integrity allowlists (5 luoghi)
13. ✅ Buildsteps push-button 4-pin (esp1+esp2 Vol2)
14. ✅ Demo filter ALL_EXPERIMENTS strict
15. ✅ Battery9V selection bbox anchor offset (ox/oy)
16. ✅ Vol1 bb verticale rotation REVERTED (layout bug R+LED sprite fluttuanti)

## Bug residui (DOPO demo)

1. ⏳ **Vertical bb Vol1** (Andrea volere book-faithful): bbox+pin rotation needs PlacementEngine update
2. ⏳ Auto-save persistence (collegamenti manuali non sempre persistono)
3. ⏳ Color picker draggable (barra colori nascosta top)
4. ⏳ Vol3 esp4+esp5 pixel-perfect bake (revert a base, andrea può ribasare manualmente)
5. ⏳ Multimetro discharge path modeling (cap esp1 trattiene 9V dopo rilascio)

## Workflow Andrea describe → Claude bake

**Andrea**:
1. Apre libro Vol1/Vol2/Vol3 alla pagina esp
2. Descrive layout: "R orizzontale fila a, cols 2-7. LED a cavallo gap col 7. Bat sx, bb dx. Fili da bat+ → bus+ → R, da LED catodo → bus− → bat−"
3. Manda screenshot libro (oppure indica pagina precisa)

**Claude bake**:
1. Read libro PDF: `grep "ESPERIMENTO" /Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/vol{N}.txt`
2. Estrae descrizione textual + verifica con Andrea
3. Solver mental walkthrough (polarità, R serie, no SHORT)
4. Bake in `experiments-vol{N}.js`:
   - components
   - pinAssignments
   - connections (max 4-5 wires, fili dalla batteria)
   - layout (x/y coords)
5. Sync `lesson-paths/v{N}-cap{M}-esp{K}.json` intent.wires
6. Update steps[] + buildSteps[]
7. Test+build+deploy
8. Playwright visual verify prod vs scan libro
9. Iter fix se Andrea segnala discrepanza

## Comandi rapidi

```bash
# Worktree
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25"

# Test
npx vitest run tests/unit/simulator

# Build
npm run build

# Push
git push origin feat/demo-25may

# Deploy prod
npx vercel --prod --yes

# Vol2 PDF read (per topology check)
grep -n "ESPERIMENTO\|condensatore" "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/vol2.txt"
```

## File chiave

- `src/data/demo-mode.js` — feature flag + 7 esp IDs
- `src/data/experiments-index.js` — ALL_EXPERIMENTS filter
- `src/data/experiments-vol1.js` — 38 esp Vol1 (3 demo baked)
- `src/data/experiments-vol2.js` — 27 esp Vol2 (2 demo baked)
- `src/data/experiments-vol3.js` — 26 esp Vol3 (2 demo reverted)
- `src/data/lesson-paths/v{N}-cap{M}-esp{K}.json` — narrative + intent.wires
- `src/components/simulator/components/Resistor.jsx` — R SVG
- `src/components/simulator/components/Battery9V.jsx` — bat SVG + pins
- `src/components/simulator/components/Led.jsx` — LED + LedBridge SVG
- `src/components/simulator/engine/CircuitSolver.js` — solver (led-bridge wired)
- `src/components/simulator/canvas/SimulatorCanvas.jsx` — canvas + COMP_SIZES + selection bbox

## Riavvio nuova sessione — prompt suggerito

```
Riprendo da fine sessione 24/05 02:00 AM.
Leggi /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25/docs/demo-25may-handoff.md
per contesto completo.
Demo lunedì 25/05 sera. Sito LIVE https://www.elabtutor.school.
Branch feat/demo-25may, last commit selection bbox Battery9V.
Caveman mode active.

Continua: visual verify 7 esp prod + remaining bug fix se Andrea ne segnala altri.
Andrea DESCRIVE topologia esp dal libro, io BAKE in experiments-vol*.js + deploy.
Andrea NON monta — io monto. Andrea verifica risultato finale.
Tutto deve match libro 1:1.
```

## Round commits sessione (12 totali)

1. `efc87c87` revert topology 7 esp
2. `5ac765dc` led-bridge variant
3. `34021df9` resistor 14px
4. `0ae963fd` props panel no "unknown"
5. `e87322eb` resistor 10px
6. `7f8776a8` sim demo filter 7 esp
7. `ecf01b70` 5 esp pixel-perfect book
8. `99acf334` solver led-bridge + push-button 4-pin
9. `a7de1845` buildSteps push-button 4-pin
10. `56fe2e2c` led-bridge allowlists
11. `400b713a` R 5-col + bb verticale (revertato 18cbaa55)
12. `f05412e9` Battery9V clip − pin y=-10
13. `18cbaa55` revert bb verticale (layout bug)
14. (next) Battery9V selection bbox anchor + findExperimentById STRICT

Live: https://www.elabtutor.school | Tag: `demo-25may-deploy`
