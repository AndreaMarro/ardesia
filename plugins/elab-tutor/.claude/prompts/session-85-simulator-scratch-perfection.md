# SESSION 85 — SIMULATORE E SCRATCH: PERFEZIONE ASSOLUTA
## Full Breadboard · All Pins · All Screens · Scratch Compilation · Passo Passo Code · FIX→TEST→VALIDATE

---

## ═══ MANIFESTO ═══════════════════════════════════════════════════════

> **Lezione dalla Session 84**: 40 minuti sprecati a debuggare un problema inesistente (HMR resettava lo state React). L'errore non era nel codice ma nel METODO: loop infinito sullo stesso micro-fix senza mai cambiare approccio. Questa sessione adotta regole ANTI-STALLO rigorose.

### Regola d'Oro: MAI PIU' DI 10 MINUTI SU UN SINGOLO PROBLEMA
```
if (tempo_su_problema > 10_minuti) {
  LOG("BLOCCATO su: " + problema);
  SKIP → passa al prossimo Sprint;
  BOOKMARK → torna dopo con prospettiva fresca;
}
```

### Regola di Ferro: FIX→TEST→VALIDATE, poi AVANTI
```
RALPH_LOOP = for (sprint of SPRINTS) {
  for (issue of sprint.issues) {
    1. FIX    → Applica correzione minimale (max 3 file)
    2. BUILD  → npm run build (DEVE passare, 0 errori)
    3. TEST   → Chrome DevTools / preview_screenshot / preview_snapshot
    4. LOG    → Documenta risultato (PASS/FAIL/SKIP)
    5. NEXT   → Passa alla prossima issue, NON tornare indietro
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

---

## ═══ TASK ═══════════════════════════════════════════════════════════

### Obiettivo Finale
Trasformare il simulatore ELAB in un **simulatore Arduino completo, funzionante e bello** dove:

1. **Tutti i pin della breadboard funzionano** su OGNI dimensione schermo (desktop, iPad, mobile)
2. **I fili si attivano SOLO quando richiesto** — wire mode ON/OFF chiaro e affidabile
3. **Ogni componente SVG e perfetto** — posizione, dimensione, interazione
4. **Scratch funziona PERFETTAMENTE** per programmare Arduino con compilazione REALE
5. **I blocchi Scratch sono visibili e comprensibili** su TUTTI i dispositivi senza collassare uno sull'altro
6. **Facile e intuitivo** — un bambino di 10 anni con un iPad deve poter completare un esperimento
7. **Passo Passo ha sezione Scratch** — guida hardware E codice step-by-step
8. **L'ecosistema funziona come un vero simulatore reale** — Tinkercad-level quality

### NON Obiettivi (NON toccare)
- AI/Galileo/nanobot (funziona 10/10 — S74)
- Auth/Security (funziona 9.8/10 — S55)
- Sito pubblico Netlify (funziona 9.6/10 — S56)
- CircuitSolver physics engine (funziona 7/10 — non peggiorare)

---

## ═══ CONTEXT FILES ════════════════════════════════════════════════

### Tier 1: LEGGERE IMMEDIATAMENTE (Core Simulator)
```
src/components/simulator/NewElabSimulator.jsx          # 3884 righe — orchestratore, state, tabs, modes
src/components/simulator/canvas/SimulatorCanvas.jsx    # 2958 righe — SVG canvas, drag & drop, wire mode
src/components/simulator/layout.module.css             # Layout responsive, iPad breakpoints, panel sizing
src/components/simulator/ElabSimulator.css             # Stili generali, toolbar, breakpoints responsive
```

### Tier 2: LEGGERE PER SPRINT SPECIFICO
```
# Scratch/Blockly (Sprint 3)
src/components/simulator/panels/ScratchEditor.jsx      # 407 righe — Blockly workspace, ELAB theme, Zelos
src/components/simulator/panels/CodeEditorCM6.jsx      # CodeMirror 6, title prop, read-only mode
src/components/simulator/panels/scratchBlocks.js       # 18 blocchi custom Arduino (setStyle + ELAB_THEME)
src/components/simulator/panels/scratchGenerator.js    # Blockly → C++ generator (setup+loop+vars)

# Esperimenti & Dati (Sprint 2)
src/data/experiments-vol1.js                           # 23 esperimenti (circuit-only, 38 con buildSteps)
src/data/experiments-vol2.js                           # 32 esperimenti (circuit-only, 18 con buildSteps)
src/data/experiments-vol3.js                           # 14 esperimenti (12 AVR + 2 circuit), 12 scratchXml, 5 scratchSteps

# Panels & UI (Sprint 1)
src/components/simulator/panels/ComponentDrawer.jsx    # Passo Passo card, auto-collapse fix S84
src/components/simulator/panels/ControlBar.jsx         # Play/Pause/Stop toolbar
src/components/simulator/panels/ComponentPalette.jsx   # Componenti palette (filtered by volume)
src/components/simulator/panels/ExperimentPicker.jsx   # Selettore esperimenti per volume/capitolo

# Engine (Reference only — NON modificare senza causa)
src/components/simulator/engine/CircuitSolver.js       # KVL/KCL DC solver
src/components/simulator/engine/PlacementEngine.js     # Auto-wiring 14 component types, WIRING_TEMPLATES
src/components/simulator/engine/AVRBridge.js           # AVR emulation interface
src/components/simulator/utils/pinComponentMap.js      # Union-Find breadboard connectivity

# SVG Components (24 files — Sprint 1)
src/components/simulator/components/BreadboardFull.jsx # 13.2 KB
src/components/simulator/components/BreadboardHalf.jsx # 14.8 KB
src/components/simulator/components/NanoR4Board.jsx    # 18.5 KB — Arduino Nano board
src/components/simulator/components/Led.jsx
src/components/simulator/components/Resistor.jsx
src/components/simulator/components/Wire.jsx
# ... + 18 altri componenti in src/components/simulator/components/

# Stili
src/styles/design-system.css                           # CSS tokens, palette, spacing, z-index
```

### Tier 3: REFERENCE (stato precedente)
```
.claude/prompts/session-84-ralph-loop-perfection.md    # Prompt precedente (struttura Sprint)
.claude/prompts/session-80-scratch-perfection.md       # Prompt Scratch (Galileo + Passo Passo code steps)
.claude/prompts/session-76-aesthetic-perfection.md     # Prompt estetica (150+ hardcoded colors, iPad)
```

---

## ═══ ARCHITETTURA CORRENTE ═══════════════════════════════════════

### Esperimenti per Volume
| Volume | Esperimenti | SimMode | buildSteps | scratchXml | scratchSteps |
|--------|-------------|---------|------------|------------|--------------|
| Vol 1  | 23          | circuit | 38 (some)  | 0          | 0            |
| Vol 2  | 32          | circuit | 18 (some)  | 0          | 0            |
| Vol 3  | 14          | 12 avr + 2 circuit | 14 (all) | 12 | 5     |

### Modalita Esperimento (3)
1. **Gia Montato**: circuito pre-costruito, studente preme Play
2. **Passo Passo**: step-by-step guidato (hardware + opzionalmente code steps)
3. **Monta Tu / Libero**: sandbox, palette aperta, studente costruisce da zero

### Scratch Side-by-Side Layout (S81)
```
┌─────────────────────────────────────────────┐
│ [Blockly Workspace 60%] │ [C++ Preview 40%] │
│  ┌──────┐ ┌──────┐     │ void setup() {    │
│  │ LED  ├─┤delay │     │   pinMode(13,OUT);│
│  └──────┘ └──────┘     │ }                 │
│                         │ void loop() {     │
│                         │   digitalWrite... │
│                         │ }                 │
│  [Compile ▶] [Status]  │ [Errors/Warnings] │
└─────────────────────────────────────────────┘
```

### Wire Mode Architecture (V2)
```
wireModeExternal (parent state) || wireModeInternal (canvas state) = wireMode
OGNI punto di deattivazione resetta ENTRAMBI:
  onWireModeChange(false) + setWireModeInternal(false)
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
```
Navy: #1E4D8C    Lime: #7CB342     Background: #FAFAF7
Vol1: #7CB342    Vol2: #E8941C     Vol3: #E54B3D
Fonts: Oswald (display) + Open Sans (body) + Fira Code (mono)
```

---

## ═══ SCORES ATTUALI (da superare) ════════════════════════════════

| Area | Score S84 | Target S85 | Delta |
|------|-----------|------------|-------|
| Simulatore (funzionalita) | 9.8/10 | **10.0** | +0.2 |
| Simulatore (estetica) | 5.0/10 | **7.0** | +2.0 |
| Simulatore (iPad) | 3.0/10 | **7.0** | +4.0 |
| Scratch Universale | 9.0/10 | **9.5** | +0.5 |
| Responsive/A11y | 7.0/10 | **8.0** | +1.0 |
| Code Quality | 9.8/10 | **9.8** | 0 |

---

## ═══ SPRINT PLAN ═════════════════════════════════════════════════

### SPRINT 1: BREADBOARD & LAYOUT (iPad + Desktop)
**Obiettivo**: La breadboard e visibile e usabile su TUTTI i device

#### 1A: iPad Landscape Fix (1024-1365px)
- Canvas SVG deve occupare **≥65% dello spazio**
- Panels laterali (code editor, component drawer) max **35%**
- Breadboard NON microscopica — dimensione minima leggibile
- Arduino Nano board visibile e riconoscibile (non un rettangolino 40px)
- `touch-action: none` su canvas SVG (gia presente S74 — VERIFICARE)

#### 1B: iPad Portrait Fix (768-1023px)
- Layout verticale: toolbar → canvas (≥55vh) → panels sotto
- Code editor panel come slide-over da destra (`position: fixed`)
- Build mode selector NON overflow fuori schermo
- ComponentDrawer come overlay che NON schiaccia il canvas

#### 1C: Desktop Verification (1366px+)
- Confermare che tutto funziona ancora su desktop
- Nessuna regressione da fix iPad
- Wire mode: ON/OFF funziona, fili si collegano, ESC cancella

#### 1D: Touch & Drag
- Drag & drop componenti funzionante su touch (no ghost elements)
- Snap a griglia breadboard corretto
- Zoom/pan con gesti touch funzionante

#### VERIFICA Sprint 1
```
PER OGNI viewport (1440x900, 1180x820, 768x1024):
  1. preview_resize → viewport
  2. Carica esperimento Vol1 cap1 esp1
  3. preview_screenshot → breadboard visibile? Canvas ≥60%?
  4. Prova drag componente (se possibile via preview_click/snapshot)
  5. preview_console_logs → 0 errori
  6. LOG risultato
```

---

### SPRINT 2: PIN VALIDATION & EXPERIMENT MODES
**Obiettivo**: Ogni pin si collega, ogni esperimento funziona nelle 3 modalita

#### 2A: Sample Testing (15 esperimenti: 5 per volume)
Per OGNI esperimento campione:

**Vol 1 (circuit-only)**: esp 1.1, 2.1, 3.1, 4.1, 5.1
**Vol 2 (circuit-only)**: esp 1.1, 2.1, 3.1, 4.1, 5.1
**Vol 3 (AVR)**: esp 6.1 (Blink), 6.2 (Pin5), 6.3 (SOS), 6.4 (Sirena), 6.5 (Semaforo)

Test checklist per esperimento:
```
□ "Gia Montato" → circuito pre-montato appare? Componenti nelle posizioni giuste?
□ "Gia Montato" → Play → simulazione parte? LED acceso/buzzer suona/motore gira?
□ "Passo Passo" → Step 1 → componente appare? Posizione corretta?
□ "Passo Passo" → Avanti fino alla fine → circuito completo? Play funziona?
□ "Passo Passo" → Finito! → panel si auto-collassa? (fix S84)
□ "Monta Tu" → palette visibile? Componente si trascina? Snap a breadboard?
□ Wire mode → ON → click su pin → filo si collega? ESC cancella?
```

#### 2B: Pin Connectivity Audit
Verificare che `pinComponentMap.js` Union-Find mappi correttamente:
- Pin Arduino (D0-D13, A0-A5) → componenti corretti
- Fori breadboard → colonne elettriche corrette
- `PlacementEngine.js` WIRING_TEMPLATES → 14 tipi coperti

#### VERIFICA Sprint 2
```
PER OGNI esperimento campione (15 totali):
  1. Carica esperimento via __ELAB_API.loadExperiment(id)
  2. Seleziona "Gia Montato"
  3. preview_snapshot → verifica componenti presenti
  4. Click Play → preview_snapshot → verifica simulazione attiva
  5. Seleziona "Passo Passo" → advance 3 steps → screenshot
  6. LOG: PASS/FAIL per ogni checklist item
```

---

### SPRINT 3: SCRATCH PERFECTION
**Obiettivo**: Scratch compila realmente, blocchi visibili su tutti i device, side-by-side funziona

#### 3A: Blockly Workspace Stability
- ScratchEditor carica SENZA crash su tutti gli esperimenti Vol3 AVR
- ErrorBoundary (gia presente in NewElabSimulator) funziona — fallback graceful
- ResizeObserver cleanup corretto (gia presente — VERIFICARE)
- Blocchi NON collassano uno sull'altro — spacing adeguato
- Font dei blocchi leggibile (≥12px nel workspace Blockly)

#### 3B: Side-by-Side Layout
- Blockly workspace 60% + CodeEditorCM6 40% ("Codice Generato")
- Responsive: su iPad landscape → clamped widths, ENTRAMBI visibili
- Su iPad portrait → editor come slide-over, Blockly a tutto schermo quando aperto
- Real-time C++ preview: ogni modifica ai blocchi aggiorna il codice istantaneamente

#### 3C: Compilazione Reale
- Bottone "Compila" visibile e funzionante in modalita Scratch
- Status compilazione (successo/errore) mostrato identicamente a C++ mode
- Errori di compilazione visibili ANCHE nella vista Scratch
- Play (▶) dopo compilazione esegue la simulazione
- Serial Monitor funziona con codice generato da Scratch

#### 3D: Scratch su Tutti i Device
```
PER OGNI viewport (1440x900, 1180x820, 768x1024):
  1. Apri esperimento Vol3 con scratchXml
  2. Click tab "Blocchi" → workspace Blockly appare
  3. Blocchi visibili? Nomi leggibili? Non sovrapposti?
  4. Trascina un blocco → codice C++ aggiornato?
  5. Bottone Compila visibile? Click → compilazione parte?
  6. Side-by-side: entrambi i panel visibili?
```

#### 3E: Esperimenti Vol3 Senza scratchXml
I 2 esperimenti Vol3 senza `scratchXml` (SOS Morse e alcuni altri) usano il template default `arduino_base` (Setup/Loop). Verificare:
- Tab "Blocchi" appare per TUTTI gli esperimenti con `simulationMode === 'avr'` (gate S81)
- Default template funziona: blocchi Setup + Loop visibili
- Studente puo aggiungere blocchi dal toolbox

#### VERIFICA Sprint 3
```
SCRATCH_EXPERIMENTS = [6.1 Blink, 6.4 Sirena, 6.5 Semaforo, 6.3 SOS (no scratchXml)]
PER OGNI esperimento:
  1. Carica esperimento → click tab "Blocchi"
  2. Blockly workspace caricato? Blocchi pre-costruiti visibili (o default)?
  3. Trascina un blocco "delay" → C++ preview aggiornato?
  4. Click "Compila" → status OK?
  5. Click Play → simulazione parte?
  6. preview_screenshot a 1440x900 + 1180x820
  7. LOG: PASS/FAIL
```

---

### SPRINT 4: PASSO PASSO + SCRATCH INTEGRATION
**Obiettivo**: La guida step-by-step include sezione codice per Scratch

#### 4A: Hardware Steps → Code Steps Sequenza
Per i 5 esperimenti Vol3 con `scratchSteps`:
- ComponentDrawer mostra PRIMA hardware steps (icona 🔧)
- POI mostra code/scratch steps (icona 🧩)
- Transizione fluida: dopo ultimo hardware step, iniziano code steps
- Code step apre automaticamente editor + switch a tab Blocchi

#### 4B: Progressive Scratch Loading
- Ogni code step carica XML Blockly cumulativo
- Step 1: blocco base (setup + loop)
- Step 2: aggiunge digitalWrite
- Step 3: aggiunge delay
- Workspace Blockly aggiorna visivamente ad ogni "Avanti"

#### 4C: Completamento
- Dopo ultimo code step: messaggio "Complimenti! Circuito e codice pronti!"
- Panel auto-collapse (fix S84 confermato funzionante)
- Studente puo premere Play per eseguire

#### VERIFICA Sprint 4
```
PASSO_PASSO_EXPERIMENTS = [6.1 Blink, 6.4 Sirena, 6.5 Semaforo]
PER OGNI esperimento:
  1. Seleziona "Passo Passo"
  2. Advance tutti hardware steps → componenti piazzati?
  3. Primo code step → editor si apre? Tab Blocchi attivo?
  4. Advance code steps → workspace Blockly si aggiorna progressivamente?
  5. Ultimo step → messaggio completamento? Panel collassa?
  6. Play → simulazione funziona?
  7. LOG: PASS/FAIL
```

---

### SPRINT 5: RALPH LOOP FINALE + QUALITY AUDIT
**Obiettivo**: Validazione end-to-end e report onesto

#### 5A: Ralph Loop Cross-Mode (3 esperimenti x 3 modalita x 2 viewport)
```
EXPERIMENTS = [Vol1 esp1.1, Vol2 esp3.1, Vol3 esp6.1]
MODES = [Gia Montato, Passo Passo, Monta Tu]
VIEWPORTS = [1440x900, 1180x820]

for exp in EXPERIMENTS:
  for mode in MODES:
    for viewport in VIEWPORTS:
      1. preview_resize(viewport)
      2. Carica exp, seleziona mode
      3. Test checklist (dal Sprint 2)
      4. Se Scratch available: test Blockly + compile
      5. LOG: PASS/FAIL
```

#### 5B: Quality Audit Finale
Eseguire skill `quality-audit` con score card:

```
| Metrica                        | Target S85        | Risultato |
|--------------------------------|-------------------|-----------|
| iPad landscape (1180x820) usabile | Canvas ≥65%    |           |
| iPad portrait (768x1024) usabile  | Canvas ≥55vh   |           |
| Breadboard pin tutti funzionanti  | 15/15 campione |           |
| Wire mode ON/OFF/ESC             | 3/3 PASS        |           |
| 3 modalita funzionanti           | 9/9 (3exp x 3)  |           |
| Scratch carica senza crash       | 4/4 PASS         |           |
| Scratch compila realmente        | 4/4 PASS         |           |
| Scratch side-by-side responsive  | 2/2 viewports    |           |
| Passo Passo code steps           | 3/3 PASS         |           |
| Passo Passo auto-collapse        | 3/3 PASS         |           |
| Touch targets ≥ 44px            | 0 violazioni     |           |
| Font size ≥ 14px (UI text)      | 0 violazioni     |           |
| Build errors                    | 0                |           |
| Console errors                  | 0                |           |
| Regressioni introdotte          | 0                |           |
```

#### 5C: Build & Deploy
```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
npm run build         # DEVE essere 0 errori
npx vercel --prod --yes  # Deploy production
```

#### 5D: Report & Memory Update
- Salvare report in `.team-status/SESSION-85-REPORT.md`
- Aggiornare `MEMORY.md` con nuovi scores
- Score card ONESTA — se un target non e raggiunto, scrivere il numero REALE

---

## ═══ RULES ═════════════════════════════════════════════════════════

### Regole INVIOLABILI

1. **ANTI-STALLO (10 min max)**: Se sei bloccato su un problema per piu di 10 minuti, FERMATI. Logga il problema. Passa al prossimo Sprint. Tornaci dopo. MAI loop infiniti sullo stesso fix.

2. **NON EDITARE DURANTE I TEST**: HMR resetta useState. Workflow: Edit → Build → Test. MAI edit+test simultaneo.

3. **NESSUNA modifica ai dati esperimenti**: `experiments-vol1/2/3.js` contengono posizioni verificate col libro. NON toccare pin, fori, posizioni componenti. UNICA eccezione: aggiungere campi NUOVI (es. scratchSteps).

4. **CSS-first per layout**: Fix layout DEVONO usare CSS (modules o .css). VIETATI stili inline per layout/responsive. Inline solo per valori dinamici runtime.

5. **Chain of Verification**: Dopo OGNI batch di fix:
   - `npm run build` → 0 errori
   - Screenshot browser per verificare
   - Confronto PRIMA e DOPO

6. **Zero Regressions**: Prima di modificare, verifica che funziona. Se funziona → solo MIGLIORA.

7. **Scratch lazy-loaded**: `React.lazy()` + Suspense. ScratchEditor ~2MB chunk. NON importare Blockly nel bundle principale.

8. **Dual-state wire mode**: SEMPRE resettare ENTRAMBI `onWireModeChange(false)` E `setWireModeInternal(false)`.

9. **Touch WCAG**: Ogni elemento interattivo ≥ 44x44px. Font UI ≥ 14px.

10. **Commit solo su richiesta**: NON fare commit automatici.

11. **Onesta brutale**: Se qualcosa non funziona, scrivilo. Se un target non e raggiunto, scrivi il numero REALE. MAI gonfiare i risultati.

---

## ═══ TOOLS & METHODOLOGY ════════════════════════════════════════

### Dev Server
```json
// .claude/launch.json — gia configurato
{
  "name": "elab-builder-dev",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "port": 5173
}
```
Usa `preview_start` per avviare. `preview_screenshot` / `preview_snapshot` / `preview_inspect` per verificare.

---

### CHROME CONTROL — USO INTENSIVO E SISTEMATICO

Chrome Control e il TUO OCCHIO. Devi usarlo COSTANTEMENTE, non come afterthought.

#### Protocollo Screenshot OBBLIGATORIO
Dopo OGNI singolo fix (non ogni Sprint — OGNI FIX):
```
SCREENSHOT_PROTOCOL = {
  1. preview_start("elab-builder-dev")     // se non gia avviato
  2. preview_click sul tab Simulatore      // assicurarsi tab giusto
  3. preview_resize({width: 1440, height: 900})
  4. preview_screenshot()                  // DESKTOP
  5. preview_resize({width: 1180, height: 820})
  6. preview_screenshot()                  // iPAD LANDSCAPE
  7. preview_resize({width: 768, height: 1024})
  8. preview_screenshot()                  // iPAD PORTRAIT
  9. preview_console_logs({level: "error"}) // 0 errori tollerati
}
```

#### Ispezione Elementi Specifica
Per verificare dimensioni REALI (non stimate):
```
// Breadboard size reale
preview_inspect({selector: ".breadboard-full-svg", styles: ["width", "height", "transform"]})

// Touch target verification
preview_inspect({selector: ".toolbar-btn", styles: ["min-width", "min-height", "padding"]})

// Scratch editor dimensions
preview_inspect({selector: ".scratch-editor-container", styles: ["width", "height", "flex"]})

// Font size check
preview_inspect({selector: ".toolbar-group-label", styles: ["font-size", "line-height"]})
```

#### Accessibility Snapshot (preferire a screenshot per struttura)
```
// Verifica che tutti gli elementi esistano e siano accessibili
preview_snapshot()  // restituisce accessibility tree completo

// Usare per:
// - Verificare che tab "Blocchi" esista e sia cliccabile
// - Verificare che bottone "Compila" sia presente
// - Verificare che ComponentDrawer steps siano nell'ordine giusto
// - Verificare che tutti i bottoni toolbar abbiano labels
```

#### Interazione Diretta (testare come un utente)
```
// Caricare un esperimento specifico
preview_click sul selettore esperimento, scegliere Vol3 Cap6 Esp1

// Cliccare modalita
preview_click({selector: ".build-mode-button[data-mode='guided']"})

// Click tab Blocchi
preview_click({selector: "[data-tab='scratch']"})

// Click Play
preview_click({selector: ".toolbar-btn--play"})

// Verificare stato simulazione via accessibility snapshot
preview_snapshot()
```

#### Viewport Testing Matrix
```
OGNI Sprint deve testare a TUTTI questi viewport:
+------------------+--------+--------+--------------+
| Device           | Width  | Height | Priorita     |
+------------------+--------+--------+--------------+
| Desktop Wide     | 1440   |  900   | BASELINE     |
| iPad Landscape   | 1180   |  820   | P0 CRITICO   |
| iPad Portrait    |  768   | 1024   | P0 CRITICO   |
| Tablet Landscape | 1024   |  768   | P1           |
| Mobile (sanity)  |  375   |  812   | P2           |
+------------------+--------+--------+--------------+
```

---

### PROGRAMMATIC TOOL CALLING — ORCHESTRAZIONE AVANZATA

Non chiamare i tool uno alla volta come un principiante. Usa **programmatic tool calling** per orchestrare operazioni complesse in batch, ridurre latenza e token.

#### Principio: Tool Sequencing
Quando devi eseguire una sequenza di operazioni correlate, raggruppa le chiamate:
```
INVECE DI (lento, dispendioso):
  1. Read file A → aspetta → 2. Read file B → aspetta → 3. Grep pattern → aspetta

FAI (veloce, parallelo):
  1. [Read A, Read B, Grep pattern] → TUTTE IN PARALLELO nella stessa risposta
```

#### Regola: Chiamate Parallele Indipendenti
Se due o piu tool call NON dipendono l'una dall'altra, lanciale TUTTE nello stesso messaggio:
```
// BUONO: 3 read paralleli
Read(NewElabSimulator.jsx) + Read(layout.module.css) + Read(ScratchEditor.jsx)

// BUONO: grep + glob paralleli
Grep("hardcoded.*color") + Glob("**/*.module.css") + Grep("font-size.*px")

// BUONO: agent di ricerca paralleli
Agent(Explore: "find iPad breakpoints") + Agent(Explore: "find Scratch imports")
```

#### Regola: Chiamate Sequenziali Dipendenti
Se il risultato di un tool serve per il prossimo, aspetta:
```
// CORRETTO: prima leggi, poi edita
1. Read(file.jsx)        → capisco il contenuto
2. Edit(file.jsx, fix)   → applico il fix basato su cio che ho letto
3. Bash("npm run build") → verifico che compila
```

#### Pattern: Multi-File Fix in Batch
Quando un fix tocca piu file indipendenti (es. CSS in 3 file diversi):
```
// Leggi tutti i file interessati IN PARALLELO
[Read(file1.css), Read(file2.css), Read(file3.css)]

// Applica tutti i fix IN PARALLELO (sono indipendenti)
[Edit(file1.css, fix1), Edit(file2.css, fix2), Edit(file3.css, fix3)]

// Build una volta sola alla fine
Bash("npm run build")
```

#### Pattern: Screenshot Matrix in Batch
```
// Resize + screenshot in sequenza veloce (dipendenze sequenziali)
preview_resize(1440, 900) → preview_screenshot()
preview_resize(1180, 820) → preview_screenshot()
preview_resize(768, 1024) → preview_screenshot()
// Ma console_logs puo andare in parallelo con l'ultimo screenshot
```

#### Pattern: Explore + Fix + Verify Pipeline
```
// FASE 1: Ricerca parallela (indipendente)
[Agent(Explore: "find all hardcoded colors in simulator CSS"),
 Agent(Explore: "find all touch-target violations"),
 Agent(Explore: "find all font-size < 14px")]

// FASE 2: Fix basati sui risultati (dipende da FASE 1)
[Edit(file1, fix1), Edit(file2, fix2), ...]

// FASE 3: Verifica (dipende da FASE 2)
Bash("npm run build") → preview_screenshot → preview_inspect
```

---

### TOOL DISCOVERY — USARE LO STRUMENTO GIUSTO

Non limitarti ai tool che conosci. Esplora ATTIVAMENTE le capability disponibili:

#### Skills Disponibili (usare quelle giuste al momento giusto)
```
arduino-simulator      → Quando tocchi il compilatore AVR o la CPU emulata
tinkercad-simulator    → Quando confronti il comportamento con Tinkercad
quality-audit          → OBBLIGATORIA a fine Sprint 5
volume-replication     → Quando verifichi posizioni componenti vs PDF
ralph-loop             → Per cicli FIX-TEST-VALIDATE strutturati
skill-creator          → Per creare NUOVE skill on-demand (vedi sotto)
```

#### MCP Tools Disponibili (usarli strategicamente)
```
Serena (mcp__plugin_serena_serena__*):
  - find_symbol      → Trovare funzioni/classi per nome nel codebase
  - search_for_pattern → Regex search avanzata con contesto
  - write_memory     → Salvare decisioni per persistenza cross-sessione
  - read_memory      → Recuperare contesto da sessioni precedenti

Preview (mcp__Claude_Preview__*):
  - preview_start/stop    → Dev server lifecycle
  - preview_screenshot    → Visual verification
  - preview_snapshot      → Accessibility tree (PREFERIRE per struttura)
  - preview_inspect       → CSS computed styles (PREFERIRE per misurazioni)
  - preview_click/fill    → Interazione diretta come utente
  - preview_resize        → Viewport testing
  - preview_console_logs  → Error detection
  - preview_network       → API call monitoring
```

---

### SKILL CREATOR — CREARE SKILL ON-DEMAND

NON creare skill predefinite all'inizio. Crea skill **quando servono**, nel contesto del problema che stai risolvendo. La skill deve nascere da un bisogno REALE, non da una lista prefabbricata.

#### Filosofia: Skill = Automazione di un Pattern Ripetuto
Quando ti accorgi di ripetere la stessa sequenza di operazioni 3+ volte, FERMATI e crea una skill:

```
PATTERN DETECTION:
  Se fai la stessa cosa 3 volte → crea una skill
  Se il test richiede 5+ tool call → crea una skill
  Se la verifica e complessa e multi-step → crea una skill
```

#### Esempi Contestuali (creare QUANDO serve, NON all'inizio)

**Scenario Sprint 1**: Stai testando il layout iPad per la terza volta, ogni volta fai:
resize → screenshot → inspect breadboard → inspect toolbar → console logs
→ **CREA SKILL** `ipad-layout-verify` che fa tutto in un colpo

**Scenario Sprint 2**: Stai verificando il terzo esperimento nelle 3 modalita:
load exp → select GM → snapshot → select PP → advance 3 steps → snapshot → select MT → drag component
→ **CREA SKILL** `experiment-3mode-test` che testa un esperimento in tutte le modalita

**Scenario Sprint 3**: Stai testando Scratch per la terza volta:
open exp → click Blocchi → check workspace loads → drag block → check C++ → compile → check status
→ **CREA SKILL** `scratch-pipeline-test` che verifica l'intera pipeline Scratch

**Scenario Sprint 4**: Stai verificando i code steps per il terzo esperimento:
load exp → select PP → advance to code step → check editor opens → check XML loads → next step → check cumulative
→ **CREA SKILL** `passo-passo-code-verify` che testa la progressione code steps

**Scenario Sprint 5**: Stai facendo l'audit finale:
5 viewport × screenshot × inspect × console = 15+ operazioni ripetitive
→ **CREA SKILL** `full-viewport-audit` che fa tutto il giro completo

#### Come Creare una Skill
```
1. Riconosci il pattern ripetuto (3+ ripetizioni)
2. Usa skill: "skill-creator:skill-creator"
3. Fornisci:
   - Nome descrittivo (kebab-case)
   - Trigger words in italiano e inglese
   - Descrizione del workflow
   - Lista dei tool che servono (preview_*, Read, Grep, etc.)
4. Testa la skill IMMEDIATAMENTE dopo la creazione
5. Usala per il RESTO del Sprint e oltre
```

#### Regola Critica: Skill Create = Skill Usate
Una skill creata e NON usata e peggio di nessuna skill.
Dopo aver creato una skill, DEVI usarla almeno 2 volte nello stesso Sprint.
Se non la useresti 2+ volte, NON crearla.

---

### Ralph Loop Skill
Usa `ralph-loop:ralph-loop` per cicli iterativi strutturati. Ogni ciclo:
1. Definisce obiettivo
2. Esegue fix
3. Testa (CON SCREENSHOT Chrome Control)
4. Valida
5. Passa al prossimo

### Quality Audit Skill
Usa `quality-audit` alla fine di Sprint 5 per:
- Font sizes verification
- Touch targets verification
- WCAG contrast check
- Build health
- Console errors audit
- Bundle size check

### Parallel Agents (per ricerche massive)
Usa `Agent` tool con `subagent_type: "Explore"` per ricerche PARALLELE:
```
// Lanciarli TUTTI INSIEME in un singolo messaggio:
Agent(Explore: "find all CSS files with hardcoded colors in simulator")
Agent(Explore: "find all touch targets < 44px in simulator components")
Agent(Explore: "find all font-size declarations < 14px")
// → 3 ricerche parallele, risultati in una volta
```

### Salvataggio Contesto (Serena Memory)
Se la sessione diventa lunga, usa `write_memory` per salvare:
- Decisioni architetturali prese
- Fix applicati e risultati
- Issues trovate e skip
- Score card intermedia
- Skill create e loro utilita

Usa `read_memory` all'inizio per recuperare contesto da sessioni precedenti.

---

## ═══ SUCCESS BRIEF ════════════════════════════════════════════════

### Definizione di "Done" per Session 85

1. **iPad Landscape (1180x820)**: breadboard occupa ≥65% schermo. Componenti riconoscibili. Touch funzionante.
2. **iPad Portrait (768x1024)**: layout verticale funzionante. Canvas ≥55vh. Panels non sovrapposti.
3. **Desktop (1440x900)**: nessuna regressione. Tutto funziona come prima o meglio.
4. **15 esperimenti testati** (5 per volume) nelle 3 modalita: GM + PP + MT.
5. **Scratch carica senza crash** su 4+ esperimenti Vol3.
6. **Scratch compila realmente** → C++ generato → compilato → simulazione parte.
7. **Side-by-side Scratch responsive** a 1440x900 e 1180x820.
8. **Passo Passo code steps** funzionanti su 3+ esperimenti.
9. **Wire mode** ON/OFF/ESC confermato funzionante.
10. **Build 0 errori**, deploy Vercel production confermato.
11. **Report onesto** con score card reale in `.team-status/SESSION-85-REPORT.md`.

### KPI Quantitativi
- iPad score: 3.0 → **≥ 7.0**
- Estetica score: 5.0 → **≥ 6.5**
- Scratch score: 9.0 → **≥ 9.5**
- Esperimenti verificati: **≥ 15**
- Regressioni introdotte: **0**

### Il Prodotto Risultante
Un bambino di 10 anni con un iPad in una scuola italiana puo:
1. Aprire elabtutor.school → Simulatore
2. Scegliere un esperimento (es. "LED Blink")
3. Seguire il Passo Passo: piazzare componenti → collegare fili → scrivere codice a blocchi
4. Premere Play → vedere il LED lampeggiare
5. Sentirsi orgoglioso di aver "programmato un Arduino"

QUESTO e il metro di successo. Non i numeri. Non il codice. L'esperienza del bambino.

---

## ═══ ANTI-PATTERN DA EVITARE ═════════════════════════════════════

### Dalla Session 84 (ERRORI DA NON RIPETERE)

1. **Loop infinito debug**: 40 minuti su auto-collapse che FUNZIONAVA GIA. Root cause era HMR, non il codice. → REGOLA: se dopo 10 min non trovi il bug, cambia approccio.

2. **Screenshot su tab sbagliato**: Prendere screenshot del tab Manuale invece che Simulatore. → REGOLA: SEMPRE verificare di essere sul tab giusto prima di screenshot.

3. **Editare file durante test**: HMR resettava state React, invalidando i test. → REGOLA: Edit → Build → Test. MAI simultaneamente.

4. **Non muoversi avanti**: Restare sullo stesso micro-fix invece di passare al prossimo Sprint. → REGOLA: SKIP e BOOKMARK. Tornare dopo.

5. **Produttivita 3/10**: Una sessione intera per un singolo fix gia funzionante. → REGOLA: misurare il tempo. Obiettivo ≥ 7/10.

### Pattern Generali da Evitare

6. **Riscritture massive**: Non riscrivere NewElabSimulator da zero (3884 righe, 69 esperimenti funzionanti). Fix chirurgici.

7. **Ottimizzazione prematura**: Non ottimizzare bundle/performance prima che il layout iPad funzioni.

8. **Commit automatici**: Mai commit senza richiesta esplicita.

9. **Score gonfiati**: Se iPad e ancora 4/10, scrivere 4/10. Non 7/10 "perche e migliorato".

10. **Perdere contesto**: Se la sessione diventa lunga, salvare stato intermedio in memory/notes.

---

## ═══ CONVERSATION STYLE ═══════════════════════════════════════════

### Output
- **Breve e diretto**. Non spiegare cosa e un CSS module. Mostra il codice.
- Ogni fix: 1 riga contesto → codice → 1 riga risultato
- Score card aggiornata a fine OGNI Sprint (non solo alla fine)
- Onesta BRUTALE: se qualcosa non funziona, DILLO

### Metodo di Lavoro
```
SPRINT N:
  1. Leggi i file necessari (Tier 2 per Sprint specifico)
  2. Identifica top-3 issues
  3. Fix 1 → Build → Test → Log
  4. Fix 2 → Build → Test → Log
  5. Fix 3 → Build → Test → Log
  6. Mini-audit Sprint: score aggiornata
  7. Se BLOCCATO → SKIP → Sprint N+1
```

### Reporting
Dopo ogni Sprint, report mini:
```
## Sprint N: [Nome]
- Fix applicati: N
- Test PASS: N/N
- Test FAIL: lista
- Issues SKIP: lista (con motivo)
- Score aggiornata: X.X/10 (era Y.Y)
- Tempo stimato: ~Z min
```

---

## ═══ ALIGNMENT ════════════════════════════════════════════════════

### Chi e l'utente?
Andrea Marro — autore di ELAB Tutor, simulatore educativo per bambini (scuola primaria/media). Il prodotto e IN PRODUZIONE su https://www.elabtutor.school. Ogni bug impatta studenti reali.

### Cosa conta davvero?
1. **Funziona su iPad** — la maggior parte delle scuole italiane usa iPad
2. **Ogni pin si collega** — i bambini si frustrano se un filo "non funziona"
3. **Scratch e intuitivo** — blocchi grandi, colorati, leggibili, che compilano DAVVERO
4. **Zero crash** — mai piu schermata bianca o spinner infinito
5. **Bello da usare** — colori coerenti, touch facile, feedback immediato

### Cosa NON fare?
- Non riscrivere da zero — 69 esperimenti funzionanti, AI 10/10, Vision 10/10
- Non cambiare la palette senza permesso — collegata al brand ELAB
- Non toccare nanobot/AI — Galileo funziona perfettamente (S74)
- Non ottimizzare prematuramente — la priorita e iPad + Scratch

### Metriche di successo
Il successo si misura in:
- **iPad usabile**: un bambino di 10 anni completa un esperimento senza aiuto
- **Pin 100%**: ogni collegamento del libro funziona nel simulatore
- **Scratch funziona**: blocchi → C++ → compila → simula, senza frizioni
- **Zero regressioni**: cio che funzionava prima funziona ancora
- **Report onesto**: numeri REALI, non gonfiati

---

## ═══ STARTUP SEQUENCE ═══════════════════════════════════════════

All'inizio della sessione, esegui ESATTAMENTE questa sequenza:

```
1. LEGGI: MEMORY.md (contesto progetto)
2. LEGGI: Tier 1 files (4 file core)
3. START: preview_start("elab-builder-dev")
4. NAVIGATE: preview_eval → http://localhost:5173/#tutor
5. BASELINE: preview_screenshot a 1440x900 (desktop)
6. BASELINE: preview_resize → 1180x820 → preview_screenshot (iPad landscape)
7. BASELINE: preview_resize → 768x1024 → preview_screenshot (iPad portrait)
8. IDENTIFY: Top-5 issues visivi dalle screenshot
9. BEGIN: Sprint 1
```

NON chiedere domande. NON chiedere conferme. ESEGUI.
L'utente vuole RISULTATI, non discussioni.

---

*Mega-prompt Session 85 — Andrea Marro / Claude — 08/03/2026*
*Keywords: SIMULATORE, SCRATCH, BREADBOARD, iPad, PASSO PASSO, PIN, COMPILAZIONE*
*Struttura: Manifesto · Task · Context · Architecture · Scores · Sprint Plan (5) · Rules · Tools · Success · Anti-patterns · Conversation · Alignment · Startup*
*Basato su: lezioni Session 84 (anti-stallo), Session 80-81 (Scratch), Session 76 (estetica/iPad), Session 74 (Ralph Loop)*
