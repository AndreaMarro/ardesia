# SESSION 87 — SIMULATORE PERFETTO: LOGICA, FISICA, UX, ZERO COMPROMESSI
## Breadboard Reale · Drag & Drop Solido · Scratch ≡ C++ · Interfaccia Pulita · iPad Nativo · ZERO REGRESSIONI

---

## ═══ MANIFESTO ═══════════════════════════════════════════════════════

> **Lezione dalla Session 86**: iPad da 5.5→7.0, estetica da 5.5→6.0, touch targets ≥44px, toolbar overflow 0px, Scratch 11/12 compile. Ma il simulatore ha ancora debiti profondi: la breadboard non ha tutti i fori funzionanti, il drag-and-drop si rompe a certi zoom, i componenti cambiano comportamento su iPad, l'interfaccia ha troppi bottoni confusionari, e il Passo Passo Scratch mescola hardware e codice. Questa sessione attacca **le fondamenta**: far funzionare TUTTO come un vero laboratorio di elettronica.

### IL BAMBINO CHE USA ELAB
Immagina un bambino di 11 anni con un iPad. Apre il simulatore per la prima volta.
- Deve capire SUBITO cosa fare (interfaccia ovvia, niente bottoni inutili)
- Trascina un LED sulla breadboard e si AGGANCIA al foro giusto (snap preciso)
- Ogni foro della breadboard e collegabile (non solo quelli "predefiniti")
- Se zooma al 200% o al 50%, il LED resta nello stesso foro (non slitta)
- Su iPad, il dito funziona ESATTAMENTE come il mouse (drag, wire, zoom, pan)
- Scratch genera codice C++ IDENTICO a quello che scriverebbe a mano
- Il Passo Passo gli dice PRIMA "monta il circuito" POI "scrivi il codice" — MAI mescolati
- NIENTE CRASH, NIENTE SOVRAPPOSIZIONI, NIENTE MAGIA

### Regola d'Oro: MAI PIU' DI 10 MINUTI SU UN SINGOLO PROBLEMA
```
if (tempo_su_problema > 10_minuti) {
  LOG("BLOCCATO su: " + problema);
  SKIP → passa al prossimo Sprint;
  BOOKMARK → torna dopo con prospettiva fresca;
}
```

### Regola di Ferro: FIX→BUILD→TEST, poi AVANTI
```
RALPH_LOOP = for (sprint of SPRINTS) {
  for (issue of sprint.issues) {
    1. SCREENSHOT_BEFORE → Cattura stato attuale con Chrome Control
    2. FIX    → Applica correzione minimale (max 3 file per fix)
    3. BUILD  → npm run build (DEVE passare, 0 errori)
    4. TEST   → Chrome DevTools / preview_screenshot / preview_snapshot
    5. COMPARE → Screenshot DOPO vs PRIMA — qualcosa e peggiorato?
    6. LOG    → Documenta risultato (PASS/FAIL/SKIP)
    7. NEXT   → Passa alla prossima issue, NON tornare indietro
    Se PEGGIORATO → REVERT IMMEDIATO → LOG "REVERT: motivo"
  }
  MINI_AUDIT → Score card aggiornata per questo Sprint
}
```

### Regola di Diamante: NON EDITARE FILE DURANTE I TEST
HMR (Hot Module Replacement) resetta lo state React. Se stai testando nel browser:
- **PRIMA** finisci TUTTI gli edit
- **POI** fai build (`npm run build`)
- **POI** testa nel browser
- MAI editare e testare simultaneamente

### Regola di Platino: PRIMA SCREENSHOT, POI FIX
Prima di toccare QUALSIASI file:
1. Fai screenshot BASELINE a 3 viewport (1440x900, 1180x820, 768x1024)
2. Salva mentalmente cosa c'e ORA
3. Dopo ogni batch di fix, fai screenshot CONFRONTO
4. Se qualcosa e PEGGIORATO → REVERT IMMEDIATO

---

## ═══ TASK ═══════════════════════════════════════════════════════════

### Obiettivo Finale
Trasformare il simulatore da **"funzionale con workaround"** a **"laboratorio virtuale perfetto"** dove:

1. **BREADBOARD 100% REALE**: Ogni singolo foro della breadboard e cliccabile, collegabile con fili, e conduce elettricita. Le righe a-e (colonne 1-63) sono internamente collegate. Le bus rail (+/-) sono continue. NON esistono fori "decorativi" — ogni foro e un nodo elettrico reale.

2. **DRAG & DROP SOLIDO COME ROCCIA**: Trascinare un componente dalla palette alla breadboard funziona SEMPRE — a zoom 0.5x, 1x, 2x, 4x. Su mouse e su touch. Il componente si aggancia (snap) al foro piu vicino con feedback visivo. MAI "slitta" via dopo il drop. MAI cambia posizione dopo zoom/resize.

3. **ZOOM/PAN SENZA EFFETTI COLLATERALI**: Zoommare non deve MAI spostare componenti. Pan non deve MAI disconnettere fili. I fili seguono i pin dei componenti a qualsiasi zoom. Hit-test dei pin funziona identico a 50% e 400%.

4. **SCRATCH = C++**: Il codice generato da Scratch deve essere **identico** a quello scritto a mano. Se un blocco Scratch dice "digitalWrite(13, HIGH)", il C++ dice esattamente quello. Compilazione DEVE passare per TUTTI i 12 esperimenti Vol3. Simon incluso.

5. **INTERFACCIA PULITA E OVVIA**: Eliminare bottoni ridondanti, raggruppare azioni logiche, rendere ogni icona auto-esplicativa. Un bambino di 11 anni deve capire cosa fa ogni bottone senza leggere un manuale. Toolbar con MASSIMO 8 gruppi logici.

6. **iPad NATIVO**: Drag and drop con dito, pinch-zoom fluido, wire con long-press poi drag, Passo Passo leggibile in portrait e landscape. NIENTE doppio-tap accidentale, NIENTE scroll di pagina durante pan del canvas.

7. **PASSO PASSO SEPARATO**: FASE 1 = monta circuito (step hardware), FASE 2 = scrivi codice (step Scratch). Transizione chiara tra le due fasi. Spiegazioni per bambini in FASE 2.

### NON Obiettivi (NON toccare)
- AI/Galileo/nanobot (funziona 10/10 — S74)
- Auth/Security (funziona 9.8/10 — S55)
- Sito pubblico Netlify (funziona 9.6/10 — S56)
- Dati esperimenti positions/pins (`experiments-vol1/2/3.js` layout — verificati col libro). UNICA eccezione: aggiungere `explanation` a `scratchSteps` e fix blocchi Simon

---

## ═══ CONTEXT FILES ════════════════════════════════════════════════

### Tier 1: LEGGERE IMMEDIATAMENTE (Core Simulator Engine)
```
src/components/simulator/canvas/SimulatorCanvas.jsx        # 2958 righe — SVG canvas, zoom/pan, drag/drop, hit detection, snap-to-hole
src/components/simulator/NewElabSimulator.jsx               # 3893 righe — Orchestratore, state, tabs, modes, compilation
src/components/simulator/engine/CircuitSolver.js            # 2324 righe — DC solver, Union-Find, path tracing, breadboard nets
src/components/simulator/components/BreadboardFull.jsx      # Breadboard layout, hole rendering, bus rails, hit areas
```

### Tier 2: LEGGERE PER SPRINT SPECIFICO
```
# Breadboard & Wires (Sprint 1)
src/components/simulator/canvas/WireRenderer.jsx            # Wire routing, bezier paths, pin resolution, current animation
src/components/simulator/engine/PlacementEngine.js          # Semantic placement AI, wiring templates, snap logic
src/components/simulator/engine/pinComponentMap.js           # Component pin definitions, registration

# Drag & Drop (Sprint 2)
src/components/simulator/panels/ComponentPalette.jsx         # Drag start, component grid
src/components/simulator/panels/ComponentDrawer.jsx          # Passo Passo, drag start, HW/code steps

# Scratch (Sprint 3)
src/components/simulator/panels/ScratchEditor.jsx            # Blockly workspace, ELAB theme, Zelos renderer
src/components/simulator/panels/CodeEditorCM6.jsx            # CodeMirror 6, compile button, font controls
src/components/simulator/panels/scratchBlocks.js             # 18 blocchi Arduino custom
src/components/simulator/panels/scratchGenerator.js          # Blockly to C++ generator

# UI/UX (Sprint 4)
src/components/simulator/panels/ControlBar.jsx               # Play/Pause/Stop, toolbar buttons
src/components/simulator/panels/ExperimentPicker.jsx         # Volume/chapter/experiment selector
src/styles/design-system.css                                 # CSS tokens, palette, z-index, spacing
src/components/simulator/ElabSimulator.css                   # Responsive breakpoints, toolbar styles
src/components/simulator/layout.module.css                   # Layout responsive, iPad breakpoints

# SVG Components (Sprint 1-2)
src/components/simulator/components/Led.jsx
src/components/simulator/components/Resistor.jsx
src/components/simulator/components/Wire.jsx
src/components/simulator/components/NanoR4Board.jsx
# ... + tutti gli altri in src/components/simulator/components/
```

### Tier 3: REFERENCE
```
.claude/prompts/session-86-estetica-scratch-ipad-mastery.md  # Prompt S86 — struttura sprint, tools
.claude/prompts/session-85-simulator-scratch-perfection.md   # Prompt S85 — layout fix
```

---

## ═══ ARCHITETTURA CORRENTE (da Session 86) ═════════════════════════

### Scores ATTUALI (partenza)
| Area | Score S86 | Target S87 | Delta Obiettivo |
|------|-----------|------------|-----------------|
| Simulatore (funzionalita) | 9.8/10 | **10.0** | +0.2 (Simon Scratch fix) |
| Simulatore (estetica) | 6.0/10 | **8.0** | +2.0 (UI pulita, bottoni ridotti) |
| Simulatore (iPad) | 7.0/10 | **9.0** | +2.0 (drag nativi, no glitch) |
| Simulatore (physics) | 7.0/10 | **7.5** | +0.5 (breadboard fori reali) |
| Scratch Universale | 9.5/10 | **10.0** | +0.5 (12/12 compile, Simon fix) |
| Responsive/A11y | 7.5/10 | **8.5** | +1.0 (aria labels, skip-to-content) |
| Code Quality | 9.8/10 | **9.8** | 0 (non peggiorare) |
| **Regressioni tollerate** | — | **ZERO** | — |

### Breadboard Architettura Attuale
```
BreadboardFull.jsx (VERTICAL layout):
  BOARD_WIDTH = 110px, BOARD_HEIGHT = 469px
  HOLE_SPACING = 7px (pitch)
  HOLE_R = 1.4px (rim), HOLE_INNER_R = 0.8px (core)
  Hit area = HOLE_SPACING x 0.65 (transparent circle)

  Struttura:
  +----------------------------------+
  | + BUS TOP (63 holes)      RED   |
  | - BUS TOP (63 holes)      BLACK |
  |                                  |
  | a1  a2  a3  ... a63  (row a)    |  <- Righe a-e
  | b1  b2  b3  ... b63  (row b)    |    internamente
  | c1  c2  c3  ... c63  (row c)    |    collegate per
  | d1  d2  d3  ... d63  (row d)    |    COLONNA
  | e1  e2  e3  ... e63  (row e)    |    (a1=b1=c1=d1=e1)
  |         GAP (10px)               |
  | f1  f2  f3  ... f63  (row f)    |  <- Righe f-j
  | g1  g2  g3  ... g63  (row g)    |    internamente
  | h1  h2  h3  ... h63  (row h)    |    collegate per
  | i1  i2  i3  ... i63  (row i)    |    COLONNA
  | j1  j2  j3  ... j63  (row j)    |    (f1=g1=h1=i1=j1)
  |                                  |
  | + BUS BOT (63 holes)      RED   |
  | - BUS BOT (63 holes)      BLACK |
  +----------------------------------+

CircuitSolver.js Union-Find:
  - Holes same column-section ARE merged (a1+b1+c1+d1+e1 = same net)
  - Bus rails ARE merged (bus-top-plus-1 thru bus-top-plus-63 = same net)
  - Gap e-f BREAKS connection (different nets)
  - Wing pins aliased: W_D10 = D10 (same net)
```

### Zoom/Pan Architecture
```
SimulatorCanvas.jsx:
  viewBox = { x: 10, y: -15, width: 570, height: 290 }  // Default
  zoom = 1.0 (range: 0.2 — 4.0)
  SVG viewBox string = "${x} ${y} ${width/zoom} ${height/zoom}"

  Coordinate transform:
    Browser (clientX, clientY) -> SVG (svgX, svgY)
    via svgEl.getScreenCTM().inverse()

  Pin hit tolerance:
    base = 6px in SVG space
    scaled = Math.max(6, tolerance * 2 / zoom)

  Snap-to-hole:
    GRID_PITCH = 7.5px
    SNAP_THRESHOLD = 6.75px (90% of pitch)
    snapComponentToHole() -> aligns component CLOSEST PIN to nearest hole
```

### Drag and Drop Current Flow
```
FROM PALETTE:
  1. ComponentPalette dragStart -> sets window.__elabDragType
  2. SimulatorCanvas handleDragOver -> clientToSVG(), ghost preview, highlight holes
  3. SimulatorCanvas handleDrop -> snap to grid/hole, validate position, onComponentAdd()

ON CANVAS (move existing):
  1. pointerdown on component -> setDragCompId, record offset
  2. pointermove -> update position, snap-to-hole if near breadboard
  3. pointerup -> finalize position, update layout

BUILD VALIDATION (Passo Passo):
  If component matches expected step AND position within TOLERANCE:
    -> Green flash, advance step
  If wrong position:
    -> Red flash, auto-correct animation

WIRE MODE:
  1. Click pin 1 -> wireStart
  2. Move -> preview wire path
  3. Click pin 2 -> onConnectionAdd()
```

### Scratch Compilation Pipeline
```
ScratchEditor.jsx -> scratchBlocks.js -> scratchGenerator.js -> C++ string
                                                                |
CodeEditorCM6.jsx (read-only preview) <- generatedCode state    v
                                                                |
NewElabSimulator.jsx handleCompile() -> fetch('/compile') -> hex
                                                                |
AVRBridge.js -> CPU emulation -> GPIO state -> UI update        v
```

### Breakpoints ELAB
```
Mobile Portrait:   < 600px
Mobile Landscape:  600-767px
iPad Portrait:     768-1023px
iPad Landscape:    1024-1365px
Desktop:           1366-1439px
Wide:              1440px+
```

### Palette Ufficiale
```css
--color-navy:      #1E4D8C;
--color-lime:      #7CB342;
--color-vol2:      #E8941C;
--color-vol3:      #E54B3D;
--color-bg:        #FAFAF7;
--color-surface:   #FFFFFF;
--color-text:      #333333;
--color-muted:     #666666;
--color-border:    #E0E0E0;

--font-display:    'Oswald', sans-serif;
--font-sans:       'Open Sans', sans-serif;
--font-mono:       'Fira Code', monospace;
```

---

## ═══ SPRINT PLAN (5 Sprint) ═══════════════════════════════════════

### SPRINT 1: BREADBOARD 100% — OGNI FORO FUNZIONA
**Obiettivo**: La breadboard e un oggetto fisico reale. Ogni foro e un nodo elettrico. Nessun foro decorativo.

#### 1A: Audit Fori Breadboard
```
preview_snapshot() -> conta i fori interattivi
preview_eval: conta tutti gli elementi hole nel DOM
  -> Quanti fori totali? (atteso: 63x10 righe + 63x4 bus = 882 fori)
  -> Ogni foro ha un hit-area cliccabile?
  -> Ogni foro e referenziabile come target di un wire? (es. "bb1:a15")

VERIFICA: nel browser, zoom al 200%, clicca su foro a1 -> highlight?
         Clicca su foro j63 -> stesso comportamento?
         Clicca su bus-top-plus-30 -> stesso?
```

#### 1B: Wire da/verso Qualsiasi Foro
Verificare che:
- Un wire PUO partire da qualsiasi foro (a1 fino a j63, bus inclusi)
- Un wire PUO arrivare a qualsiasi foro
- Se collego a1 e f1, il CircuitSolver li vede come DUE net separate (gap e-f)
- Se collego a1 e b1, il CircuitSolver li vede come STESSO net (stessa colonna)
- Se collego bus-top-plus e bus-bot-plus con un wire, sono unificati

```
TEST SEQUENCE (in Chrome):
  1. Carica modo Libero
  2. Piazza un Arduino Nano
  3. Piazza un LED
  4. Wire: pin 13 -> foro a5
  5. Wire: foro f5 -> GND bus
  6. CircuitSolver deve creare il circuito completo
  7. Play -> LED acceso?
```

#### 1C: Fix Fori Non Collegabili (se trovati)
Se l'audit trova fori non cliccabili:
- Ogni `<Hole>` deve avere hit-area con handler
- pinId deve seguire convenzione `bb1:{row}{col}` (es. `bb1:a15`)
- CircuitSolver deve unire fori nella stessa colonna-sezione

#### 1D: Connessioni Interne Breadboard
Il CircuitSolver Union-Find deve rispettare:
```
REGOLA 1: Stessa colonna sezione TOP (a-e): a{N}=b{N}=c{N}=d{N}=e{N} = same net
REGOLA 2: Stessa colonna sezione BOT (f-j): f{N}=g{N}=h{N}=i{N}=j{N} = same net
REGOLA 3: TOP e BOT NON collegati (gap tra e e f)
REGOLA 4: Bus rail intera = same net (bus-top-plus-1 = ... = bus-top-plus-63)
REGOLA 5: Bus top e bus bot NON collegate tra loro (senza wire esplicito)
```

#### VERIFICA Sprint 1
```
PER OGNI tipo di foro (row a, row j, bus-top-plus, bus-bot-minus):
  1. Clicca foro -> verifica highlight
  2. Crea wire DA quel foro -> endpoint corretto?
  3. Crea wire VERSO quel foro -> endpoint corretto?
  4. CircuitSolver: regole 1-5 rispettate?
  5. Console logs -> 0 errori
  6. LOG: PASS/FAIL per ogni tipo

BONUS: circuito che attraversa il gap (wire da e5 a f5) -> deve funzionare come PONTE
```

---

### SPRINT 2: DRAG & DROP INDISTRUTTIBILE — FUNZIONA A OGNI ZOOM E DEVICE
**Obiettivo**: Drag funziona IDENTICO a zoom 0.5x e 4x, su mouse e touch, senza sfarfallamento

#### 2A: Audit Drag a Zoom Diversi
```
TEST MATRIX:
  ZOOM = [0.5, 1.0, 2.0, 4.0]
  DEVICE = [mouse (desktop 1440x900), touch (iPad 1180x820)]
  ACTION = [
    "Drag LED da palette -> breadboard foro c5",
    "Drag resistore da palette -> breadboard foro a10-a14",
    "Sposta LED gia piazzato da c5 -> c10",
    "Wire da pin 13 -> foro a5"
  ]

  PER OGNI combinazione:
    1. preview_resize(viewport)
    2. Esegui azione
    3. Verifica: componente nel foro giusto? Pin allineato?
    4. Zoom in/out -> componente ANCORA nello stesso foro?
    5. LOG: PASS/FAIL
```

#### 2B: Fix Coordinate Transform at Extreme Zoom
Il cuore e `clientToSVG()` (SimulatorCanvas.jsx ~linea 341):
```javascript
function clientToSVG(svgEl, clientX, clientY) {
  const pt = svgEl.createSVGPoint();
  pt.x = clientX; pt.y = clientY;
  const ctm = svgEl.getScreenCTM();
  const svgPt = pt.matrixTransform(ctm.inverse());
  return { x: svgPt.x, y: svgPt.y };
}
```
POTENZIALI BUG:
- Se `getScreenCTM()` ritorna null (SVG non nel DOM): crash -> DIFENDERE con `if (!ctm) return null`
- Se il container ha padding/border: offset non compensato -> VERIFICARE
- Se `position: fixed` parent elements: CTM potrebbe non compensare -> VERIFICARE su iPad slide-over

#### 2C: Snap-to-Hole Robusto
```
REGOLE SNAP:
  1. Componente vicino a foro (< SNAP_THRESHOLD):
     -> SNAP: il PIN piu vicino si ALLINEA ESATTAMENTE al centro del foro
  2. SNAP_THRESHOLD scala con zoom:
     -> Zoom 4x (ingrandito): threshold STRETTO (3px SVG) — precisione chirurgica
     -> Zoom 0.5x (piccolo): threshold LARGO (12px SVG) — dita grandi
  3. Feedback visivo: foro target si ILLUMINA (bordo verde, glow) durante drag
  4. Dopo drop: componente NON si muove MAI piu finche l'utente non lo trascina
```

Verificare `snapComponentToHole()` (SimulatorCanvas.jsx ~linea 206):
- Il threshold scala con zoom?
- Dopo snap, coordinate esatte? (Math.round per evitare sub-pixel)
- Foro highlight attivo durante drag?

#### 2D: iPad Touch Drag Perfetto
```
CHECKLIST TOUCH:
  1. Canvas SVG: `touch-action: none` -> previene scroll pagina
  2. Toolbar: `touch-action: manipulation` -> previene 300ms delay
  3. Pinch-zoom: preventDefault su touchmove 2+ dita
  4. Drag: pointer events (NON HTML5 drag API su touch)
  5. Long-press: context menu ELAB (non browser), 150ms delay potentiometro
  6. NESSUN scroll pagina durante interazioni canvas

VERIFICA (iPad 1180x820):
  1. Drag LED con un dito -> fluido?
  2. Due dita -> pinch zoom senza muovere componenti?
  3. Long press -> context menu ELAB?
  4. Wire con un dito -> wire si disegna?
  5. Pan su area vuota -> fluido?
  6. ZERO scroll pagina durante uso canvas
```

#### VERIFICA Sprint 2
```
RALPH LOOP DRAG (5 test x 4 zoom x 2 device = 40 test):
  1. Drag da palette -> breadboard (4 zoom livelli)
  2. Sposta componente esistente (4 zoom)
  3. Wire creation (4 zoom)
  4. Zoom in/out -> posizioni invariate
  5. Resize viewport -> posizioni invariate

TARGET: 40/40 PASS (se < 36/40 -> investigare)
```

---

### SPRINT 3: SCRATCH PERFETTO — 12/12 COMPILE + CODICE EQUIVALENTE
**Obiettivo**: Scratch genera codice C++ che compila e funziona per OGNI esperimento Vol3

#### 3A: Fix Simon (v3-extra-simon)
L'esperimento Simon mostra "// Errore generazione codice" in Scratch mode.
DIAGNOSI:
```
1. Carica v3-extra-simon -> tab Blocchi
2. Workspace esiste? Blocchi caricati?
3. Leggi codice nel code preview -> cosa dice?
4. scratchGenerator.js: quale blocco non genera codice?
5. experiments-vol3.js: il campo scratchXml di simon e corretto?
```

FIX probabile:
- Simon usa blocchi custom (tone/noTone, random, arrays) non gestiti da scratchGenerator
- Aggiungere generator per blocchi mancanti
- NON modificare la logica — solo aggiungere i generator mancanti

#### 3B: Verifica Equivalenza Scratch <-> C++
Per ogni esperimento Vol3:
```
EQUIVALENCE_TEST:
  1. Carica -> tab Blocchi -> leggi C++ generato
  2. Switch -> tab Arduino C++ -> leggi codice predefinito
  3. CONFRONTA: setup() identico? loop() identico?
  4. Non identici char per char, ma FUNZIONALMENTE equivalenti:
     - Stessi pin, stessa logica, stessi delay, stesso ordine
```

#### 3C: Scratch Passo Passo — FASE Separata
```
ATTUALE (S86):
  ComponentDrawer mostra TUTTI gli step mischiati: HW + Code

OBIETTIVO:
  FASE 1 — MONTA IL CIRCUITO
    Step 1: "Piazza il LED rosso sul foro E5"
    Step 2: "Piazza il resistore tra H5 e H10"
    ...
    "Circuito pronto! Ora passiamo al codice ->"

  FASE 2 — PROGRAMMA CON I BLOCCHI
    Step 1: "Trascina 'Imposta Pin' nella sezione Setup"
            Spiegazione: "Questo dice ad Arduino: il pin 13 e un'USCITA"
    Step 2: "Aggiungi 'Scrivi Pin ALTO' nel Loop"
            Spiegazione: "ALTO = manda corrente -> il LED si accende!"
    ...
    "Premi Compila e poi Play!"

IMPLEMENTAZIONE in ComponentDrawer.jsx:
  - Stato `fase: 'hardware' | 'scratch'`
  - Hardware steps: come ora (0 -> totalHWSteps)
  - Transizione: card speciale "Circuito pronto! ->"
  - Scratch steps: usa scratchSteps[N].explanation
  - Auto-open editor Blocchi quando inizia FASE 2
  - Auto-load XML Blockly per ogni code step
```

#### 3D: Spiegazioni Bambino (scratchSteps.explanation)
Aggiungere campo `explanation` a OGNI scratchStep in experiments-vol3.js
REGOLE:
- Linguaggio scuola media (11-14 anni)
- Niente gergo tecnico (no "GPIO", no "PWM", no "high impedance")
- Analogie mondo reale ("il LED si accende come una lampadina")
- Massimo 2 frasi per step
- ATTENZIONE: NON modificare positions/pins/xml — SOLO aggiungere `explanation`

#### VERIFICA Sprint 3
```
COMPILE MARATHON (12 esperimenti Vol3):
  PER OGNUNO: Carica -> tab Blocchi -> workspace? -> C++ preview? -> Compila?
  TARGET: 12/12 PASS

PASSO PASSO SEPARATO (3 esperimenti: Blink, Sirena, Semaforo):
  1. Seleziona "Passo Passo"
  2. Avanza step HW -> card transizione appare?
  3. Click "Programma" -> tab Blocchi aperto? ScratchStepCard visibile?
  4. Spiegazione comprensibile per bambino?
  5. Compila dopo ultimo step -> funziona?
  TARGET: 3/3 PASS
```

---

### SPRINT 4: INTERFACCIA PULITA — MENO BOTTONI, PIU' CHIAREZZA
**Obiettivo**: Eliminare complessita visiva. Ogni elemento ha scopo ovvio.

#### 4A: Audit Bottoni Toolbar
```
preview_snapshot() -> conta TUTTI i bottoni visibili nella toolbar
DOMANDA CHIAVE: Un bambino di 11 anni capisce cosa fanno TUTTI questi bottoni?
```

#### 4B: Raggruppamento Logico (max 8 gruppi)
```
PROPOSTA:

GRUPPO 1: NAVIGAZIONE     -> Menu | Indietro
GRUPPO 2: SIMULAZIONE     -> Play/Pause (toggle) | Stop | Reset
GRUPPO 3: COSTRUZIONE     -> [Gia Montato | Passo Passo | Libero] (tab bar)
GRUPPO 4: STRUMENTI       -> Wire | Grid ON/OFF
GRUPPO 5: EDITOR          -> Codice (toggle panel)
GRUPPO 6: ZOOM            -> Zoom+ | Zoom- | Adatta

ELIMINARE / NASCONDERE in Menu:
  - "Nascondi" -> redundante con toggle panel
  - "Info" -> in menu
  - "Altro" -> azioni rare in menu
  - "Compila" -> gia nel panel editor
  - "Filo +-" -> in tooltip canvas hover

REGOLA: bottone usato < 5% delle sessioni -> va in Menu
```

#### 4C: Icone Auto-Esplicative
```
OGNI bottone DEVE avere:
  1. Icona universale (play, pause, ecc.)
  2. Tooltip chiaro (title="Avvia simulazione")
  3. aria-label per accessibility
  4. Stato attivo visibile (Wire mode = evidenziato)
```

#### 4D: Semplificazione Panel
```
REGOLA: UN SOLO panel attivo alla volta (sidebar)
Se apro ComponentPalette, si chiude ExperimentPicker.
Eccezione: CodeEditor/ScratchEditor coesistono col panel laterale.

SIDEBAR icone verticali:
  Esperimenti | Componenti | Passo Passo (se PP attivo) | Galileo
```

#### VERIFICA Sprint 4
```
PRIMA: conta bottoni visibili toolbar -> N
DOPO: conta bottoni toolbar -> M
Obiettivo: M <= N * 0.7 (riduzione >= 30%)

TEST USABILITA:
  "Un 11enne capisce ogni bottone senza aiuto?"
  Se NO per qualsiasi -> rimuovi o rinomina

iPad 1180x820 e 768x1024:
  - Toolbar una riga? Overflow 0px?
  - Ogni bottone >= 44px?
```

---

### SPRINT 5: VALIDAZIONE FINALE + RALPH LOOP COMPLETO
**Obiettivo**: Zero regressioni confermate, deploy production

#### 5A: Ralph Loop Cross-Mode-Device
```
EXPERIMENTS = [v1-cap3-led-base, v2-cap4-3led, v3-cap6-blink]
MODES = [Gia Montato, Passo Passo, Libero]
VIEWPORTS = [1440x900, 1180x820, 768x1024]

for exp in EXPERIMENTS:
  for mode in MODES:
    for viewport in VIEWPORTS:
      1. preview_resize(viewport)
      2. Carica exp, seleziona mode
      3. GM: componenti piazzati? Play?
      4. PP: step avanzano? Componenti?
      5. PP + Vol3: transizione HW->Scratch?
      6. Scratch: compile PASS?
      7. Libero: add componenti? Wire?
      8. preview_screenshot
      9. Console logs -> 0 errori
      10. LOG: PASS/FAIL

TARGET: 27/27 PASS
```

#### 5B: Breadboard Stress Test
```
1. Libero -> piazza LED su a5
2. Wire: LED pin+ -> a5 (snap)
3. Wire: LED pin- -> f5 (gap bridge)
4. Wire: f5 -> GND bus
5. Wire: 5V -> a5 (through resistor)
6. Play -> LED acceso?
7. ZOOM 0.5x -> wire collegati?
8. ZOOM 4.0x -> wire collegati?
9. Resize viewport -> niente slitta?
10. LOG: PASS/FAIL
```

#### 5C: Scratch Compilation Marathon (12/12)
```
v3-cap6-blink, v3-cap6-pin5, v3-cap6-morse, v3-cap6-sirena, v3-cap6-semaforo
v3-cap7-pullup, v3-cap7-pulsante, v3-cap7-mini
v3-cap8-serial
v3-extra-lcd-hello, v3-extra-servo-sweep, v3-extra-simon

PER OGNUNO: Carica -> tab Blocchi -> workspace? -> C++? -> Compila?
TARGET: 12/12 PASS
```

#### 5D: Build and Deploy
```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
npm run build         # 0 errori
npx vercel --prod --yes  # Deploy production
```

#### 5E: Report e Memory Update
- Aggiornare MEMORY.md con nuovi scores
- Score card ONESTA — numeri REALI misurati
- Lista issues rimanenti con priorita

---

## ═══ RULES ═════════════════════════════════════════════════════════

### Regole INVIOLABILI

1. **ZERO REGRESSIONI**: Se funzionava in S86, DEVE funzionare in S87. Test PRIMA e DOPO. Se rotto -> REVERT IMMEDIATO.

2. **ANTI-STALLO (10 min max)**: Bloccato? SKIP -> Sprint successivo.

3. **NON EDITARE DURANTE I TEST**: HMR resetta state. Edit -> Build -> Test. MAI simultaneamente.

4. **NESSUNA modifica posizioni esperimenti**: experiments-vol1/2/3.js layout/pin/positions NON SI TOCCANO. Eccezione: aggiungere `explanation` a scratchSteps e fix blocchi Simon.

5. **Max 3 file per batch**: Fix su 4+ file -> SPEZZA in sub-batch. Build dopo OGNI batch.

6. **CSS Variables per colori nuovi**: Ogni colore da CSS var in design-system.css. Inline hex VIETATI. Eccezione: colori fisici SVG.

7. **Touch WCAG**: Interattivi >= 44x44px. Font UI >= 14px. Contrasto >= 4.5:1.

8. **Breadboard = realta fisica**: Foro visibile = collegabile. Stessa colonna-sezione = stesso net. Nessun foro decorativo.

9. **Scratch = C++**: Codice generato DEVE compilare E produrre stesso comportamento del C++ scritto a mano.

10. **Commit solo su richiesta**: NON commit automatici.

11. **Interfaccia per bambini**: Bottone incomprensibile a 11enne -> rinomina o elimina. Panel > 5 opzioni -> raggruppa.

12. **Onesta BRUTALE**:
    - Non funziona? SCRIVILO con numero REALE.
    - MAI PASS senza misurazione Chrome Control.
    - Foro a63 non cliccabile? FAIL, non "quasi tutti funzionano".
    - Drag slitta 1px dopo zoom? FAIL, non "praticamente stabile".
    - Simon non compila? FAIL, non "11/12 e ottimo".

---

## ═══ TOOLS & METHODOLOGY ════════════════════════════════════════

### Dev Server
```json
{
  "name": "elab-builder-dev",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "port": 5173
}
```
Usa `preview_start("elab-builder-dev")` per avviare.

### CHROME CONTROL — IL TUO UNICO OCCHIO SULLA REALTA

**Senza screenshot = senza verifica = non puoi dire PASS.**

#### Filosofia: MISURA, NON STIMARE
```
SBAGLIATO: "Ho fixato il snap, dovrebbe funzionare"
CORRETTO:  "Ho fixato il snap. preview_resize(1180,820), preview_screenshot,
            snap verified: component at (100, 48.75), hole center (100, 48.75),
            delta = 0px. PASS"
```

#### Protocollo Screenshot OBBLIGATORIO
```
SCREENSHOT_PROTOCOL = {
  1. preview_start("elab-builder-dev")
  2. Naviga al tab Simulatore
  3. preview_resize(1440, 900)    -> DESKTOP
  4. preview_screenshot()
  5. preview_resize(1180, 820)    -> iPad LANDSCAPE
  6. preview_screenshot()
  7. preview_resize(768, 1024)    -> iPad PORTRAIT
  8. preview_screenshot()
  9. preview_console_logs("error") -> 0 errori
}
```

#### Ispezione Precisa
```
// BREADBOARD: fori cliccabili
preview_snapshot() -> conta elementi hole interattivi

// DRAG: coordinate dopo drop
preview_inspect("[data-comp-id]", ["transform"])

// ZOOM: viewBox attuale
preview_inspect("svg.simulator-canvas", ["viewBox"])

// TOUCH TARGETS: bottoni < 44px
// (usa preview_snapshot per audit completo)

// SCRATCH: codice generato
// (leggi testo dal code preview panel)
```

#### Agent Paralleli per Audit
```
Agent(Explore: "find all holes in BreadboardFull.jsx without click handlers")
Agent(Explore: "find all buttons without aria-label in simulator/panels/")
Agent(Explore: "find all hardcoded hex colors in simulator/ files")
```

---

## ═══ SUCCESS CRITERIA ═════════════════════════════════════════════

| Criterio | Misurazione | Target |
|----------|-------------|--------|
| Fori breadboard funzionanti | Conta hole interattivi nel DOM | >= 882 |
| Wire da/verso qualsiasi foro | Test 5 fori casuali | 5/5 |
| Drag stabile zoom 0.5x-4x | Drop + zoom + verify | Delta 0px |
| Scratch 12/12 compile | Test automatizzato | 12/12 |
| Simon Scratch fix | Compile + preview C++ | PASS |
| Bottoni toolbar ridotti | Count pre/post | -30% |
| Touch targets iPad | Audit | 0 bottoni < 44px |
| Passo Passo separato HW/Code | 3 esperimenti | 3/3 |
| Build 0 errori | npm run build | 0 |
| Console 0 errori | preview_console_logs | 0 |
| Regressioni | Ralph Loop 27/27 | ZERO |
| Deploy production | Vercel --prod | OK |
