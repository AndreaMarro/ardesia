# MEGA-PROMPT: ELAB Tutor Sprint Agile — Ondate di Agenti
# Copia-incolla questo INTERO prompt in una nuova chat Claude Code
# Creato: 13/02/2026 — Andrea Marro
# Versione: 2.0 — con Chrome MCP, Agent Recovery, Non-Blocking Flow

---

## ISTRUZIONI PER CLAUDE

Sei il **LEAD ARCHITECT** di un progetto educativo critico. Devi orchestrare **ondate successive di agenti paralleli** per portare ELAB Tutor alla perfezione assoluta. Ogni ondata usa 8 agenti in parallelo (Task tool con run_in_background). Dopo ogni coppia di ondate (audit + fix) fai CoVe con Chrome MCP.

### METODOLOGIA
- **Agile Sprint** con backlog, priorita' P0/P1/P2, sprint review
- **CoVe (Chain of Verification)**: dopo ogni fix, verifica in Chrome con screenshot
- **Loop of Context**: usa i file in `.claude-sprint/` per mantenere stato tra agenti
- **Skills**: usa le skill `arduino-simulator`, `nano-breakout`, `tinkercad-simulator`, `quality-audit`, `skill-factory` quando appropriato
- **Build check**: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build` DEVE passare dopo ogni ondata di fix
- **Chrome MCP**: usa i Chrome MCP tools (tabs_context_mcp, navigate, screenshot, read_page, find, javascript_tool, computer) per verificare VISIVAMENTE ogni fix

### VINCOLI ASSOLUTI
1. **NanoR4Board DEVE corrispondere al DWG AutoCAD** — Board 77.5x55mm, semicerchio, wing a DESTRA, 16 pin @ 2.54mm, SCALE=1.8
2. **Compilatore Arduino DEVE funzionare** — endpoint `POST https://n8n.srv1022317.hstgr.cloud/compile`, feedback visivo all'utente
3. **TUTTI i 69 esperimenti devono essere costruibili e gia' montati**
4. **Circuiti ad-hoc devono essere costruibili dall'utente E da Galileo AI**
5. **Target: bambini 8-14 anni** (Gen Alpha + Gen Z) — interfaccia chiara, divertente, non oppressiva
6. **Palette ELAB**: Navy #1E4D8C, Lime #7CB342, Vol1 #7CB342, Vol2 #E8941C, Vol3 #E54B3D
7. **Fonts**: Oswald (headers), Open Sans (body), Fira Code (mono)
8. **Background**: #FAFAF7, Border: #E8E4DB
9. **Lingua interfaccia**: Italiano
10. **Bus naming**: `bus-bot-plus/minus` NON `bus-bottom-plus/minus`

---

## PROTOCOLLO CHROME MCP — VERIFICA VISUALE

### Setup Chrome (da fare UNA volta all'inizio)
```
1. Chiama tabs_context_mcp con createIfEmpty: true
2. Salva il tabId restituito
3. Usa quel tabId per TUTTE le operazioni Chrome successive
```

### Come verificare un fix in Chrome
```
1. Lancia dev server: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vite --port 5173 &
2. navigate → http://localhost:5173
3. computer → screenshot per catturare stato iniziale
4. find → cercare l'elemento da testare
5. computer → left_click per interagire
6. computer → screenshot per catturare risultato
7. Confronta screenshot prima/dopo
8. Documenta risultato in AGENT-RESULTS.md
```

### Checklist CoVe Chrome per ogni ondata
```
[ ] Screenshot homepage iniziale
[ ] Navigare al simulatore
[ ] Selezionare un esperimento Vol1 (circuito semplice)
[ ] Verificare che i componenti si renderizzano
[ ] Premere Play e verificare simulazione
[ ] Selezionare un esperimento Vol3 (Arduino)
[ ] Verificare che il codice si mostra nell'editor
[ ] Compilare il codice e verificare feedback visivo
[ ] Creare un wire col mouse
[ ] Verificare NanoR4Board shape
[ ] Aprire chat Galileo
[ ] Inviare un messaggio a Galileo
[ ] Screenshot finale stato
```

---

## PROTOCOLLO AGENT RECOVERY — FLUSSO NON-BLOCCANTE

### Principio: IL FLUSSO NON SI BLOCCA MAI

Quando un agente si blocca, fallisce, o non risponde entro il timeout, il Lead Architect NON aspetta. Recupera i dati utili e lancia un agente sostitutivo.

### Procedura di Recovery

```
MONITORAGGIO CONTINUO:
1. Dopo aver lanciato gli 8 agenti in background, attendi con TaskOutput (block: false, timeout: 5000)
2. Ogni 30 secondi, controlla lo stato di TUTTI gli agenti con TaskOutput (block: false)
3. Se un agente non risponde dopo 3 minuti → RECOVERY

RECOVERY — AGENTE BLOCCATO:
1. Leggi l'output parziale con TaskOutput (block: false)
2. Salva TUTTO l'output parziale in .claude-sprint/RECOVERY-{AGENT_ID}.md
3. Ferma l'agente bloccato con TaskStop
4. Analizza l'output parziale:
   - Che file ha gia' modificato? (cerca "Edit" o "Write" nell'output)
   - Che bug ha gia' fixato? (cerca "BUG-" nell'output)
   - Dove si e' fermato? (ultimo messaggio)
5. Lancia NUOVO agente sostitutivo con prompt aggiornato:
   - Includi i bug GIA' fixati dall'agente originale
   - Includi i bug RIMANENTI da fixare
   - Aggiungi: "L'agente precedente si e' bloccato. I seguenti bug sono gia' stati fixati: [lista]. Verifica che i fix siano corretti e completa i rimanenti."
6. Il nuovo agente prende il posto del vecchio nel tracking

RECOVERY — BUILD FALLITO:
1. Se npm run build fallisce dopo una ondata, lancia IMMEDIATAMENTE un agente correttivo:
   - Prompt: "Il build e' fallito con errore: [ERRORE]. Leggi l'output e fixa il problema. Non toccare altro."
   - subagent_type: "general-purpose", mode: "bypassPermissions"
2. Se dopo 3 tentativi il build non passa, raccogli il diff di TUTTI i file modificati e rollback con git:
   - git stash
   - Analizza i diff
   - Applica solo i fix che non rompono il build

RECOVERY — CONFLITTI TRA AGENTI:
1. Due agenti hanno modificato lo stesso file?
   - Leggi il file corrente
   - Leggi i risultati di entrambi gli agenti
   - Crea un agente "merger" che integra entrambe le modifiche
   - Prompt: "Due agenti hanno modificato [FILE]. Agent A ha fatto [CAMBIO A]. Agent B ha fatto [CAMBIO B]. Integra entrambi i cambiamenti senza conflitti. Fai build check."

TRACKING AGENTI:
Mantieni un file .claude-sprint/AGENT-TRACKER.md con formato:
```

```markdown
# Agent Tracker — Ondata N
| Agent | Status | Task | Started | Completed | Notes |
|-------|--------|------|---------|-----------|-------|
| FIX-1 | ✅ DONE | EXP bus fix | 21:00 | 21:05 | 3 bug fixed |
| FIX-2 | 🔄 RUNNING | CircuitSolver | 21:00 | — | — |
| FIX-3 | ❌ BLOCKED | AVRBridge | 21:00 | — | Timeout 3min |
| FIX-3b | 🔄 RUNNING | AVRBridge (recovery) | 21:04 | — | Ripreso da FIX-3 |
```

### Timeout per tipo di agente
- **FIX agent** (modifica codice): max 5 minuti
- **AUDIT agent** (sola lettura): max 4 minuti
- **CoVe agent** (Chrome test): max 3 minuti
- **MERGER agent** (risolvi conflitti): max 3 minuti
- **BUILD FIX agent** (fix errori build): max 2 minuti

### Flusso Non-Bloccante Dettagliato

```
ONDATA N (8 agenti):
│
├─ T+0s:   Lancia 8 agenti in parallelo (run_in_background: true)
├─ T+30s:  Poll #1 — TaskOutput(block: false) su tutti
├─ T+60s:  Poll #2 — chi ha finito? chi e' bloccato?
├─ T+90s:  Poll #3 — se qualcuno e' bloccato da >60s, prepara recovery
├─ T+120s: Poll #4 — se bloccato da >120s, TaskStop + lancia sostituto
├─ T+150s: Poll #5 — controlla sostituto + completati
├─ T+180s: Poll #6 — se TUTTI completati o sostituiti → procedi
│           se ancora bloccati → recovery forzata (TaskStop + salva output)
├─ T+180s: FASE MERGE
│           ├─ Controlla file modificati da piu' agenti
│           ├─ Se conflitti → lancia merger agent
│           └─ Se no conflitti → procedi
├─ T+210s: BUILD CHECK
│           ├─ npm run build
│           ├─ Se PASS → procedi a CoVe
│           └─ Se FAIL → lancia build-fix agent (max 3 tentativi)
├─ T+240s: CoVe CHROME
│           ├─ Lancia dev server
│           ├─ Chrome MCP verification
│           └─ Screenshot + documenta
├─ T+300s: AGGIORNA BACKLOG
│           ├─ Marca bug fixati in BUG-BACKLOG.md
│           ├─ Aggiorna SPRINT-CONTEXT.md
│           └─ Aggiorna AGENT-TRACKER.md
│
└─ PROCEDI A ONDATA N+1
```

### Regola d'Oro
**Se un agente non ha prodotto output utile dopo il timeout, NON perdere tempo a investigare. Lancia un sostituto e vai avanti. Il flusso non si blocca MAI.**

---

## STATO DELL'ARTE — 13/02/2026

### Progetto
- **Nome**: ELAB Tutor + Simulatore Arduino
- **Target**: Bambini 8-14 anni
- **Stack**: React 19 + Vite 7, avr8js (ATmega328p), CodeMirror 6, n8n backend
- **Deploy**: https://elab-builder.vercel.app (Vercel)
- **Repo locale**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/`
- **Build attuale**: 551 moduli, ~4.3s, PASSES ✅
- **Bundle**: main 1,305 KB (gzip ~330 KB) + vendor chunks

### Architettura Simulatore
```
src/components/simulator/
  NewElabSimulator.jsx         — 2,160 LOC — orchestratore principale
  canvas/SimulatorCanvas.jsx   — 2,023 LOC — SVG canvas, drag/drop, wire mode, zoom/pan
  canvas/WireRenderer.jsx      — 800 LOC — bezier wire routing + current flow animation
  engine/CircuitSolver.js      — 1,768 LOC — KCL/MNA Gaussian solver + path-tracer
  engine/AVRBridge.js          — 1,049 LOC — avr8js CPU + Web Worker + Servo/LCD bridge
  engine/avrWorker.js          — 348 LOC — Web Worker per CPU ATmega328p
  engine/SimulationManager.js  — 302 LOC — orchestratore solver/AVR
  panels/CodeEditorCM6.jsx     — 517 LOC — CodeMirror 6 Arduino C++ editor
  panels/ControlBar.jsx        — Play/Stop/Reset + hamburger + overflow menu
  panels/ExperimentGuide.jsx   — step-by-step guide
  panels/BomPanel.jsx          — 265 LOC — Bill of Materials
  panels/ShortcutsPanel.jsx    — 190 LOC — keyboard shortcuts modal
  panels/PropertiesPanel.jsx   — 129 LOC — R/C/V/LED properties
  panels/GalileoResponsePanel.jsx — Galileo AI response
  overlays/PotOverlay.jsx      — 104 LOC — potentiometer knob
  overlays/LdrOverlay.jsx      — 71 LOC — LDR light slider
  utils/errorTranslator.js     — GCC error → kid-friendly Italian
  utils/pinComponentMap.js     — 256 LOC — Union-Find pin mapping
  utils/breadboardSnap.js      — 214 LOC — auto-assignment + ID gen
  components/                  — 22 SVG components (vedi sotto)
  ElabSimulator.css            — main styles
  overlays.module.css          — overlay/guide responsive styles
  codeEditor.module.css        — editor styles
  layout.module.css            — layout + Galileo styles
```

### 22 Componenti SVG
```
Annotation.jsx, Battery9V.jsx, BreadboardFull.jsx, BreadboardHalf.jsx,
BuzzerPiezo.jsx, Capacitor.jsx, Diode.jsx, LCD16x2.jsx, Led.jsx,
MosfetN.jsx, MotorDC.jsx, Multimeter.jsx, NanoR4Board.jsx,
PhotoResistor.jsx, Phototransistor.jsx, Potentiometer.jsx,
PushButton.jsx, ReedSwitch.jsx, Resistor.jsx, RgbLed.jsx,
Servo.jsx, Wire.jsx
+ registry.js (component registry con pin definitions)
```

### Tutor AI "Galileo"
```
src/components/tutor/
  ElabTutorV4.jsx    — 1,112 LOC — main tutor logic, intent detection, AI chain
  ChatOverlay.jsx    — 768 LOC — chat UI, quick actions, message rendering
  TutorLayout.jsx, TutorSidebar.jsx, TutorTopBar.jsx
  CircuitDetective.jsx — "Trova il Guasto" game
  CircuitReview.jsx  — "Controlla Circuito" game
  PredictObserveExplain.jsx — POE pedagogical game
  ReverseEngineeringLab.jsx — reverse engineering game
  OnboardingWizard.jsx — first-run wizard
  ContextualHints.jsx — contextual hints system
```

### Dati Esperimenti
```
src/data/
  experiments-vol1.js  — 38 esperimenti (circuiti, batteria 9V, NO Arduino)
  experiments-vol2.js  — 18 esperimenti (condensatori, transistor, fototransistori)
  experiments-vol3.js  — 11+2 esperimenti (Arduino Nano R4, codice C++)
  experiments-index.js — indice aggregato
  broken-circuits.js   — circuiti con guasti per gioco "Trova il Guasto"
  mystery-circuits.js  — circuiti misteriosi
  poe-challenges.js    — sfide Predict-Observe-Explain
```
- **Totale**: 69 esperimenti
- **Test E2E**: 68/69 PASS (solo v1-cap13-esp2 senza pinAssignments)

### Compilatore Arduino
- **Endpoint primario**: `POST https://n8n.srv1022317.hstgr.cloud/compile`
- **Fallback chain**: 3 endpoint
- **9 hex pre-compilati** in `/public/hex/`
- **arduino-cli** su VPS Hostinger

### NanoBreakout V1.1 GP (DWG Reale)
- **Body**: 77.5 x 55.0 mm, semicerchio sinistro (R=27.5mm)
- **Wing**: estende a DESTRA, 16 pin @ 2.54mm pitch, X=49.7→87.8mm, Y=54.2mm
- **SVG SCALE**: 1.8
- **COMP_SIZES**: {w:171, h:140}

### API Globale
```javascript
window.__ELAB_API = {
  galileo: { highlightComponent(ids), highlightPin(refs), clearHighlights(), serialWrite(text), getCircuitState() },
  on(event, callback), off(event, callback)
}
// Events: experimentChange, stateChange, serialOutput, componentInteract, circuitChange
```

### Regole Immutabili
1. Pin map ATmega328p: D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC
2. BB_HOLE_PITCH = 7.5px, SNAP_THRESHOLD = 4.5px
3. Bus naming: `bus-bot-plus/minus` NON `bus-bottom-plus/minus`
4. Build check DEVE passare prima di ogni deploy
5. `npm run build` da `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/`

### Sprint History
- Sprint 1 (12/02): Refactor NES 3507→1831 LOC, 9 file estratti, dead code -2566 LOC
- Sprint 2 (13/02): MNA solver, Servo, LCD, Wire animation, Multi-select, Web Worker
- Sprint 3 (13/02): BOM, Annotations, Export PNG, Shortcuts, Bundle -26%
- Sprint 4 (13/02): Breakout pads, wing geometry, overlay fix, responsive, Galileo chat

---

## BUG BACKLOG — 80+ BUG TROVATI DA ONDATA 1 AUDIT

### P0 CRITICI (14 bug) — MUST FIX SUBITO
```
BUG-EXP-01: [P0] experiments-vol3.js:279 — v3-cap6-sirena bus-bot-minus-15 dovrebbe essere -13
BUG-EXP-02: [P0] experiments-vol3.js:364 — v3-cap6-semaforo bus-bot-minus-14 dovrebbe essere -11
BUG-EXP-03: [P0] experiments-vol3.js:591 — v3-cap7-mini bus-bot-minus-22 dovrebbe essere -20
BUG-E-04:   [P0] CircuitSolver.js:1492 — Potentiometer polarity reversal non gestita
BUG-E-05:   [P0] AVRBridge.js:854 — Servo angle clamping errato ai boundary PWM
BUG-E-06:   [P0] CircuitSolver.js:1192 — LED burn detection path-tracer incoerente con MNA
BUG-E-07:   [P0] AVRBridge.js:876 — LCD pins race condition (configureLCDPins dopo Worker start)
BUG-W-02:   [P0] SimulatorCanvas.jsx — Wire creation da touch events impossibile
BUG-W-03:   [P0] SimulatorCanvas.jsx — Wire preview NON aggiornato su touch
BUG-W-04:   [P0] WireRenderer.jsx:177 — Collinear detection threshold 0.01 troppo stretto
BUG-W-05:   [P0] WireRenderer.jsx:185 — Bezier corner radius non adattivo quando > segment length
BUG-I-01:   [P0] userService.js — SESSION_SECRET per-tab, bypassabile da DevTools
BUG-I-02:   [P0] userService.js:91 — Admin password hash SHA-256 hardcoded in source
BUG-I-05:   [P0] api.js/notionService.js — Admin webhook URL esposto in client bundle
```

### P1 IMPORTANTI (22 bug) — SHOULD FIX
```
BUG-C-02:   [P1] PhotoResistor.jsx — onInteract prop mai chiamato
BUG-C-04:   [P1] Phototransistor.jsx — onInteract prop mai chiamato
BUG-C-06:   [P1] Annotation.jsx — No drag handlers, annotazioni non trascinabili
BUG-C-07:   [P1] SimulatorCanvas.jsx — onAnnotationLayoutChange callback mai usato
BUG-C-08:   [P1] SimulatorCanvas.jsx — wireMode state race condition
BUG-C-09:   [P1] Multimeter.jsx — probe solder coordinates non allineate con wire endpoints
BUG-E-02:   [P1] AVRBridge.js — Servo.h non compilabile senza libreria su server
BUG-E-03:   [P1] AVRBridge.js — LiquidCrystal.h non compilabile senza libreria
BUG-E-08:   [P1] CircuitSolver.js:575 — MAX_PATHS=8 puo' perdere percorsi paralleli
BUG-E-09:   [P1] pinComponentMap.js:12 — RGB LED common pin non mappato
BUG-E-10:   [P1] avrWorker.js:46 — Pin batch 16ms puo' perdere pulse rapidi
BUG-W-06:   [P1] WireRenderer.jsx:107 — resolvePinPosition() non gestisce wing pins ruotati
BUG-W-07:   [P1] SimulatorCanvas.jsx:295 — resolvePinPositionLocal() duplicata vs WireRenderer
BUG-W-08:   [P1] SimulatorCanvas.jsx — hitTestPin tolerance inconsistente (3 valori diversi)
BUG-W-09:   [P1] breadboardSnap.js:100 — analyzePinLayout() BB_PITCH in coordinate locali non globali
BUG-W-10:   [P1] WireRenderer.jsx:57 — Bus pin regex non accetta "bus-bottom-plus" legacy
BUG-W-11:   [P1] SimulatorCanvas.jsx:1774 — Wire preview come <line> non usa routing
BUG-UI-01:  [P1] CodeEditorCM6.jsx:351 — Label "Code Editor" non tradotto in italiano
BUG-UI-03:  [P1] ControlBar.jsx:239 — Overflow menu non accessibile da keyboard
BUG-UI-04:  [P1] CodeEditorCM6.jsx:398 — Close button errori troppo piccolo (16px)
BUG-UI-05:  [P1] SerialMonitor.jsx — No visual feedback quando disabled
BUG-UI-11:  [P1] CodeEditorCM6.jsx:330 — Compilation status testo troppo piccolo (10px)
BUG-UI-12:  [P1] SerialMonitor.jsx:58 — Baud rate mismatch warning solo tooltip
BUG-UI-14:  [P1] ExperimentPicker.jsx:168 — Build/Unbuild toggle non ovvio
BUG-T-01:   [P1] ChatOverlay.jsx — Image attachment non mostrato nel messaggio
BUG-T-02:   [P1] ElabTutorV4.jsx:731 — analyzeImage() promise race condition
BUG-I-03:   [P1] PasswordGate.jsx — Rate limiting in sessionStorage, bypassabile
BUG-I-04:   [P1] licenseService.js — Device fingerprint spoofabile
BUG-I-06:   [P1] userService.js — Social data plaintext in localStorage
BUG-I-07:   [P1] notionService.js — No API request signing
```

### P2 MIGLIORAMENTI (35+ bug) — NICE TO HAVE
```
BUG-C-10: SimulatorCanvas.jsx — hoveredPin tooltip width fragile
BUG-C-11: 15 componenti — onInteract prop dichiarato ma mai chiamato
BUG-C-12: SimulatorCanvas.jsx — selection box threshold 4px troppo per touch
BUG-C-13: Led/Diode — flat spot polarity confusa
BUG-C-14: Capacitor.jsx — chargeLevel normalizzato su 9V hardcoded
BUG-C-15: SimulatorCanvas.jsx — dragPreview non resettato su drag abort
BUG-C-16: registry.js — nessuna validazione pin IDs
BUG-C-17: BreadboardHalf/Full — pin definitions mancanti in registry
BUG-E-11: CircuitSolver.js — convergenceSnapshot non include pot position
BUG-E-12: AVRBridge.js — Intel HEX checksum non validato
BUG-E-13: CircuitSolver.js — Diodo reverse-bias no stress check
BUG-E-14: pinComponentMap.js — Union-Find no caching tra chiamate
BUG-E-15: CircuitSolver.js — LED VF green hardcoded 2.0V (reale 2.5-3.2V)
BUG-E-16: AVRBridge.js — Servo angle offset vs Arduino Servo.h reale
BUG-E-17: CircuitSolver.js — Capacitor leakage tau=1000s impreciso
BUG-W-12: WireRenderer.jsx — routeFromArduino() non gestisce wire verticali
BUG-W-13: PinOverlay.jsx — non partecipa a wire mode
BUG-W-14: WireRenderer.jsx — Current flow animation direction invertita per reverse
BUG-W-15: breadboardSnap.js — no validazione bounds breadboard
BUG-W-16: WireRenderer.jsx — nearestBBRow() non clamp risultati
BUG-W-17: SimulatorCanvas.jsx — Wire mode + panning conflitto stato
BUG-W-18: WireRenderer.jsx — isBusPin() troppo generico
BUG-W-19: WireRenderer.jsx — Dedup threshold 1.5px hardcoded
BUG-W-20: SimulatorCanvas.jsx — Wire preview non clippato a SVG bounds
BUG-W-21: WireRenderer.jsx — Current flow colors hardcoded non in WIRE_COLORS
BUG-UI-02: GalileoResponsePanel.jsx — Loading dots non animate
BUG-UI-06: ComponentPalette.jsx — Search input manca aria-label
BUG-UI-07: ControlBar.jsx — Timer display no live region
BUG-UI-08: ExperimentGuide.jsx — Collapse button icon ambiguo
BUG-UI-09: BuildModeGuide.jsx — Navigation no progress indicator
BUG-UI-10: PropertiesPanel.jsx — Color swatch no hover/focus feedback
BUG-UI-13: ShortcutsPanel.jsx — Keyboard shortcut rendering inconsistente
BUG-UI-15: BomPanel.jsx — No scrollbar visibile su Windows
BUG-UI-16: ControlBar.jsx — Hamburger CSS class su div invece di button
BUG-UI-17: Multiple panels — Close buttons inconsistenti
BUG-HW-01: NanoR4Board.jsx — Wing HORIZ 40mm vs DWG 38.1mm (5% oversize)
BUG-HW-02: NanoR4Board.jsx — Wing VERT 15mm vs DWG 14.756mm (1.6% oversize)
BUG-HW-03: SimulatorCanvas.jsx — COMP_SIZES comment inconsistente
BUG-T-03: contentFilter.js — Regex /g patterns non reset tra chiamate
BUG-T-04: ChatOverlay.jsx — Default suggestions solo con 1 messaggio
BUG-T-05: ElabTutorV4.jsx — detectIntent() 47 regex lento
BUG-D-01: Components — Labels (R1, LED1) non mostrati nel canvas
BUG-W-01: Wire color picker mancante
BUG-E-01: RC transient non implementato
```

---

## PIANO ONDATE (ESEGUI IN ORDINE)

### CICLO 1 di 3

---

### ONDATA 2 — FIX BUG FUNZIONALI (8 agenti paralleli)

Lancia 8 agenti con Task tool:
- subagent_type: "general-purpose"
- mode: "bypassPermissions"
- run_in_background: true

**OGNI agente riceve questo PREAMBOLO nel prompt:**
```
CONTESTO: Stai lavorando su ELAB Tutor, un simulatore di circuiti Arduino per bambini 8-14 anni.
REPO: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/
Leggi PRIMA: .claude-sprint/BUG-BACKLOG.md e .claude-sprint/SPRINT-CONTEXT.md
BUILD CHECK: dopo ogni modifica esegui: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build
Se il build fallisce, FIXA l'errore prima di procedere.
SCRIVI risultati in .claude-sprint/AGENT-RESULTS.md sotto la sezione indicata.
NON cancellare risultati di altri agenti.
```

**Agent FIX-1: Experiment Data Fix**
```
[PREAMBOLO]
TASK: Fixa i bug BUG-EXP-01, EXP-02, EXP-03 in src/data/experiments-vol3.js.
CAMBIAMENTI:
- v3-cap6-sirena: bus-bot-minus-15 → bus-bot-minus-13
- v3-cap6-semaforo: bus-bot-minus-14 → bus-bot-minus-11
- v3-cap7-mini: bus-bot-minus-22 → bus-bot-minus-20
VERIFICA: controlla che TUTTI gli altri esperimenti Vol3 abbiano bus indices coerenti.
RISULTATI: .claude-sprint/AGENT-RESULTS.md sotto "## ONDATA 2 / Agent FIX-1: Experiment Data"
```

**Agent FIX-2: CircuitSolver P0 Fix**
```
[PREAMBOLO]
TASK: Fixa i bug del CircuitSolver in src/components/simulator/engine/CircuitSolver.js.
BUG DA FIXARE:
- BUG-E-04 [P0]: Potentiometer polarity reversal (~riga 1492) — gestire reversed connections
- BUG-E-06 [P0]: LED burn detection (~riga 1192) — allineare path-tracer con MNA results
- BUG-E-08 [P1]: MAX_PATHS=8 → 16 o dynamico
- BUG-E-15 [P2]: LED VF green hardcoded 2.0V → 2.8V
ATTENZIONE: Non rompere il solver MNA/KCL/Gaussian existente!
RISULTATI: .claude-sprint/AGENT-RESULTS.md sotto "## ONDATA 2 / Agent FIX-2: CircuitSolver"
```

**Agent FIX-3: AVRBridge P0 Fix**
```
[PREAMBOLO]
TASK: Fixa i bug AVR in src/components/simulator/engine/AVRBridge.js e utils/pinComponentMap.js.
BUG DA FIXARE:
- BUG-E-05 [P0]: Servo angle clamping errato (~riga 854) — clamp 0-180, boundary PWM 544-2400us
- BUG-E-07 [P0]: LCD race condition (~riga 876) — chiamare configureLCDPins() PRIMA di Worker.postMessage('start')
- BUG-E-09 [P1]: RGB LED common pin non mappato in pinComponentMap.js
- BUG-E-10 [P1]: Pin batch interval 16ms → 8ms in avrWorker.js
RISULTATI: .claude-sprint/AGENT-RESULTS.md sotto "## ONDATA 2 / Agent FIX-3: AVRBridge"
```

**Agent FIX-4: Wire Touch + Creation Fix**
```
[PREAMBOLO]
TASK: Fixa wire creation/preview in src/components/simulator/canvas/SimulatorCanvas.jsx.
BUG DA FIXARE:
- BUG-W-02 [P0]: Wire creation da touch — aggiungi onTouchStart/Move/End che mappi a mouse flow
- BUG-W-03 [P0]: Wire preview su touch — touchmove deve aggiornare preview position
- BUG-W-08 [P1]: hitTestPin tolerance — unificare a 6px (3 valori diversi ora)
- BUG-W-07 [P1]: Rimuovere resolvePinPositionLocal duplicata, importare da WireRenderer
- BUG-W-11 [P1]: Wire preview deve usare bezier routing non <line>
RISULTATI: .claude-sprint/AGENT-RESULTS.md sotto "## ONDATA 2 / Agent FIX-4: Wire Touch"
```

**Agent FIX-5: WireRenderer P0+P1 Fix**
```
[PREAMBOLO]
TASK: Fixa wire rendering in src/components/simulator/canvas/WireRenderer.jsx.
BUG DA FIXARE:
- BUG-W-04 [P0]: Collinear detection threshold 0.01 → 0.1 (meno strict)
- BUG-W-05 [P0]: Bezier corner radius — Math.min(CORNER_RADIUS, segmentLength * 0.4)
- BUG-W-06 [P1]: resolvePinPosition() non gestisce wing pins ruotati — usare transform
- BUG-W-10 [P1]: Bus pin regex — accettare sia 'bus-bot-' che 'bus-bottom-' legacy
- BUG-W-12 [P2]: routeFromArduino() wire verticali
- BUG-W-16 [P2]: nearestBBRow() clamping bounds
RISULTATI: .claude-sprint/AGENT-RESULTS.md sotto "## ONDATA 2 / Agent FIX-5: WireRenderer"
```

**Agent FIX-6: UI P1 Fix**
```
[PREAMBOLO]
TASK: Fixa UI bugs nei file panels/ e components UI.
BUG DA FIXARE:
- BUG-UI-01 [P1]: CodeEditorCM6.jsx "Code Editor" → "Editor Codice"
- BUG-UI-03 [P1]: ControlBar.jsx overflow menu keyboard nav (arrows, Enter, Escape)
- BUG-UI-04 [P1]: CodeEditorCM6.jsx close button 16px → 44px min-height/width
- BUG-UI-05 [P1]: SerialMonitor.jsx disabled state → opacity 0.5 + "Avvia simulazione"
- BUG-UI-11 [P1]: CodeEditorCM6.jsx compilation status 10px → 13px
- BUG-UI-12 [P1]: SerialMonitor.jsx baud mismatch → warning inline non solo tooltip
- BUG-UI-14 [P1]: ExperimentPicker.jsx build/unbuild toggle icone + testo esplicito
PALETTE: Navy #1E4D8C, Lime #7CB342, BG #FAFAF7, Border #E8E4DB
FONTS: Oswald headers, Open Sans body, Fira Code mono
RISULTATI: .claude-sprint/AGENT-RESULTS.md sotto "## ONDATA 2 / Agent FIX-6: UI"
```

**Agent FIX-7: NanoR4Board DWG Precision**
```
[PREAMBOLO]
TASK: Allinea NanoR4Board.jsx alle dimensioni DWG reali.
FILE: src/components/simulator/components/NanoR4Board.jsx
BUG DA FIXARE:
- BUG-HW-01 [P2]: Wing HORIZ 40mm → 38.1mm → SVG: 38.1 * 1.8 = 68.58px
- BUG-HW-02 [P2]: Wing VERT 15mm → 14.756mm → SVG: 14.756 * 1.8 = 26.56px
- BUG-HW-03 [P2]: COMP_SIZES comment fix in SimulatorCanvas.jsx
ATTENZIONE: Non rompere pin positions! Verifica che i pin restino allineati.
DWG SPECS: Body 77.5x55mm, semicerchio sinistro R=27.5mm, wing DESTRA, 16 pin @2.54mm, SCALE=1.8
RISULTATI: .claude-sprint/AGENT-RESULTS.md sotto "## ONDATA 2 / Agent FIX-7: NanoR4Board"
```

**Agent FIX-8: Tutor + Integration Fix**
```
[PREAMBOLO]
TASK: Fixa Tutor e Integration bugs.
BUG DA FIXARE:
- BUG-T-01 [P1]: ChatOverlay.jsx — mostrare image attachment (<img src=...>)
- BUG-T-02 [P1]: ElabTutorV4.jsx analyzeImage() — AbortController per race condition
- BUG-I-02 [P0]: userService.js — aggiungere commento TODO critico per spostamento hash server-side
- BUG-I-05 [P0]: api.js/notionService.js — usare VITE_ADMIN_WEBHOOK env var, rimuovere URL hardcoded
- BUG-C-06 [P1]: Annotation.jsx — aggiungere drag handlers (onMouseDown/Move/Up)
- BUG-T-03 [P2]: contentFilter.js regex /g — reset lastIndex
- BUG-T-05 [P2]: detectIntent() — raggruppare regex per performance
RISULTATI: .claude-sprint/AGENT-RESULTS.md sotto "## ONDATA 2 / Agent FIX-8: Tutor+Integration"
```

---

### POST-ONDATA 2: VERIFICA + RECOVERY

```
PROCEDURA:
1. Poll tutti gli 8 agenti con TaskOutput(block: false) ogni 30s
2. Se un agente non risponde dopo 3 min → RECOVERY:
   a. TaskOutput(block: false) per salvare output parziale
   b. TaskStop per fermare l'agente
   c. Salvare output in .claude-sprint/RECOVERY-{ID}.md
   d. Analizzare: quali bug ha fixato? Quali restano?
   e. Lanciare agente sostitutivo con prompt aggiornato
3. Quando TUTTI completati (o sostituiti):
   a. Verifica conflitti: due agenti hanno toccato lo stesso file?
      → Se si: lancia merger agent
   b. Build check: npm run build
      → Se FAIL: lancia build-fix agent (max 3 tentativi)
   c. Aggiorna BUG-BACKLOG.md marcando bug fixati con ✅
   d. Aggiorna AGENT-TRACKER.md con status finale
```

---

### CoVe 1 — VERIFICA BROWSER CHROME

```
SETUP:
1. tabs_context_mcp(createIfEmpty: true) → salva tabId
2. Bash: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vite --port 5173
   (run_in_background: true)
3. navigate(url: "http://localhost:5173", tabId: TAB_ID)
4. computer(action: "screenshot", tabId: TAB_ID) → screenshot iniziale

TEST 1: Esperimenti Vol3 con bus fix
- find(query: "experiment picker", tabId) → click
- Seleziona v3-cap6-sirena → screenshot
- computer(action: "left_click", coordinate: PLAY_BUTTON) → Play
- computer(action: "screenshot") → verifica circuito
- Ripeti per v3-cap6-semaforo e v3-cap7-mini

TEST 2: Wire creation touch (se disponibile mouse/touch)
- find(query: "wire mode button") → click
- Clicca un pin → clicca secondo pin → verifica wire creato

TEST 3: Compilazione Arduino
- Seleziona esperimento Vol3
- find(query: "compile button" o "compila") → click
- computer(action: "wait", duration: 5) → aspetta compilazione
- computer(action: "screenshot") → verifica feedback visivo

TEST 4: NanoR4Board shape
- computer(action: "zoom", region: [NANO_AREA]) → zoom sulla board
- Verifica forma semicerchio + wing

TEST 5: Galileo Chat
- find(query: "Galileo" o "chat") → click
- form_input(ref: CHAT_INPUT, value: "Ciao, come funziona un LED?") → invia
- computer(action: "wait", duration: 3)
- computer(action: "screenshot") → verifica risposta

DOCUMENTA: Salva tutti gli screenshot e risultati in .claude-sprint/COVE-1-RESULTS.md
```

---

### ONDATA 3 — AUDIT DESIGN (8 agenti paralleli)

**Ogni agente DESIGN riceve il PREAMBOLO standard + questo extra:**
```
CONTESTO DESIGN: Questo e' un prodotto per bambini 8-14 anni. Deve essere:
- Colorato ma non caotico
- Professionale ma non intimidatorio
- Palette: Navy #1E4D8C, Lime #7CB342, Vol1 #7CB342, Vol2 #E8941C, Vol3 #E54B3D, BG #FAFAF7, Border #E8E4DB
- Font: Oswald (headers), Open Sans (body), Fira Code (mono)
- Touch targets: min 44x44px
- Contrast: WCAG AA minimo
OUTPUT: Scrivi un report dettagliato in .claude-sprint/AGENT-RESULTS.md con sezione "ONDATA 3 / Agent DESIGN-N"
Per ogni problema trovato, indica: FILE, RIGA, PROBLEMA, FIX SUGGERITO, PRIORITA' (P1/P2)
```

**Agent DESIGN-1: Palette + Colori**
```
[PREAMBOLO + CONTESTO DESIGN]
Cerca in TUTTI i file .jsx, .css, .module.css colori hardcoded fuori dalla palette ELAB.
Verifica contrast ratio WCAG AA per testo su sfondo.
Cerca: colori inline, variabili CSS, hex codes, rgb(), rgba(), hsl().
Confronta con palette ufficiale. Segnala OGNI deviazione.
```

**Agent DESIGN-2: Tipografia + Font**
```
[PREAMBOLO + CONTESTO DESIGN]
Verifica font-family in TUTTI i file CSS/JSX.
Regola: Oswald solo headers/labels, Open Sans body, Fira Code mono.
Verifica font-size: min 14px body, min 12px labels, min 11px codice.
Cerca font-weight inconsistenti. Verifica che @import o link siano presenti per tutte le font.
```

**Agent DESIGN-3: Touch Targets + Mobile**
```
[PREAMBOLO + CONTESTO DESIGN]
Verifica TUTTI i <button>, <a>, clickable elements hanno min 44x44px.
Testa responsive breakpoints: <600, 600-767, 768-1023, 1024+.
Verifica: hamburger menu funziona, overflow menu accessibile, bottom sheets su mobile.
Cerca min-width, min-height, padding insufficienti su interactive elements.
```

**Agent DESIGN-4: Componenti SVG Geometria**
```
[PREAMBOLO + CONTESTO DESIGN]
Verifica TUTTI i 22 componenti in src/components/simulator/components/:
- Proporzioni realistiche
- Pin positions allineate con BB_HOLE_PITCH=7.5px
- Colori coerenti con palette
- Labels leggibili (font-size >= 8)
- viewBox corretto
```

**Agent DESIGN-5: NanoR4Board vs AutoCAD**
```
[PREAMBOLO + CONTESTO DESIGN]
File: src/components/simulator/components/NanoR4Board.jsx
DWG: Body 77.5x55mm, semicerchio sinistro R=27.5mm, wing DESTRA 38.1mm, 16 pin @2.54mm, SCALE=1.8
Confronto pixel-perfect: outline, wing, pin spacing, labels, colori PCB.
Calcola la percentuale di aderenza al DWG.
```

**Agent DESIGN-6: Wire + Breadboard Estetica**
```
[PREAMBOLO + CONTESTO DESIGN]
Verifica:
- Wire colors (sono distinguibili? contrast OK?)
- Wire thickness (proporzionato? leggibile?)
- Bezier smoothness (curve naturali?)
- Breadboard: hole grid allineamento, bus colors (rosso +, blu -), gap centrale
- Current flow animation: visibile? velocita' sensata?
```

**Agent DESIGN-7: Panels + Overlays Design**
```
[PREAMBOLO + CONTESTO DESIGN]
Verifica TUTTI i pannelli: CodeEditor, SerialMonitor, BOM, Shortcuts, Properties, Guide, Chat.
- Border-radius coerente?
- Box-shadow coerente?
- Padding/spacing armonici?
- Scroll behavior smooth?
- Animazioni 300ms ease?
- Dark/light mode (force-light: data-theme="light")?
```

**Agent DESIGN-8: Icone + Feedback Visivo**
```
[PREAMBOLO + CONTESTO DESIGN]
Verifica:
- Tutte le icone: emoji vs SVG? Consistenti?
- Hover/focus/active states su TUTTI gli interactive elements
- Loading states (spinner, skeleton, dots)
- Error states (colore #E54B3D, icona, messaggio)
- Success states (colore #7CB342, checkmark, animazione)
- Feedback visivo quando circuito si attiva/disattiva
```

---

### ONDATA 4 — FIX DESIGN (8 agenti)
*Generata dinamicamente dal Lead Architect in base ai risultati dell'Ondata 3.*

**Procedura:**
1. Leggi TUTTI i report DESIGN-1 through DESIGN-8
2. Consolida problemi per file/area
3. Crea 8 agenti FIX assegnati per area (es: 1=colori CSS, 2=font, 3=touch targets, 4=SVG, 5=NanoR4, 6=wires, 7=panels, 8=feedback)
4. Lancia in parallelo
5. Recovery protocol se bloccati
6. Build check + CoVe

### CoVe 2 — VERIFICA BROWSER CHROME (design + funzionale)
Stessa procedura CoVe 1, ma con focus aggiuntivo su:
- Colori corretti (palette ELAB)
- Font corretti (Oswald/Open Sans/Fira Code)
- Touch targets 44x44px
- NanoR4Board shape vs DWG
- Feedback visivo su interazioni

---

### ONDATA 5 — AUDIT PEDAGOGIA (8 agenti paralleli)

**Agent PED-1: Bambino 8 anni (Gen Alpha)**
```
[PREAMBOLO]
RUOLO: Sei un bambino di 8 anni che usa ELAB per la prima volta. Non sai niente di elettronica.
ANALIZZA (leggendo il codice UI e i messaggi/testi visualizzati):
- Capisco cosa fare? I bottoni hanno icone/testi chiari?
- Il linguaggio e' troppo tecnico? Ci sono parole che non capisco?
- Mi diverto? C'e' qualcosa di giocoso?
- Riesco a montare un circuito seguendo la guida?
- Galileo mi parla come un amico o come un professore noioso?
OUTPUT: report con suggerimenti concreti, file e righe da modificare
```

**Agent PED-2: Teenager 14 anni (Gen Z)**
```
[PREAMBOLO]
RUOLO: Sei un teenager tech-savvy di 14 anni che ha gia' usato Tinkercad.
ANALIZZA:
- L'interfaccia sembra da piccoli o e' cool?
- Posso fare cose avanzate? Circuiti custom? Codice complesso?
- Il codice Arduino e' ben spiegato?
- Mi annoio o sono stimolato?
- Galileo e' utile o mi rallenta?
```

**Agent PED-3: Genitore 50+**
```
[PREAMBOLO]
RUOLO: Sei un genitore 50+ senza competenze tecniche che aiuta il figlio 10enne.
ANALIZZA:
- Capisco come navigare l'app?
- Ci sono tooltip/help chiari?
- Posso aiutare mio figlio senza sapere di elettronica?
- L'app mi ispira fiducia? Sembra professionale?
```

**Agent PED-4: Pedagogia Socratica**
```
[PREAMBOLO]
ANALIZZA come Galileo (ElabTutorV4.jsx, ChatOverlay.jsx, ContextualHints.jsx) implementa:
- Domande vs risposte dirette
- Guida step-by-step
- Non-oppressivita' (non corregge troppo)
- Adattamento al livello
- Metafore ed esempi reali
- Scaffolding (supporto graduale che diminuisce)
```

**Agent PED-5: Progressione Didattica**
```
[PREAMBOLO]
ANALIZZA la progressione in experiments-vol1/2/3.js:
- La curva Vol1→Vol2→Vol3 e' sensata?
- Ogni esperimento introduce UN solo concetto nuovo?
- Prerequisiti chiari?
- Istruzioni (steps) complete e accurate?
- Gap di difficolta' tra volumi?
```

**Agent PED-6: Gamification**
```
[PREAMBOLO]
ANALIZZA i giochi in src/components/tutor/:
- CircuitDetective.jsx, CircuitReview.jsx, PredictObserveExplain.jsx, ReverseEngineeringLab.jsx
- Sono divertenti? Feedback immediato?
- Sistema di progressione/achievement?
- Motivazione intrinseca vs estrinseca?
- Missing: badges, punti, leaderboard, streak?
```

**Agent PED-7: Accessibilita'**
```
[PREAMBOLO]
VERIFICA accessibilita' WCAG:
- aria-labels, roles, aria-live su TUTTI gli elementi interattivi
- Navigazione keyboard-only possibile?
- Color blind safe? (non solo colore per stato)
- Font leggibili per dislessia (spacing, contrast)
- Screen reader test (aria-label su SVG components)
```

**Agent PED-8: Wow Factor**
```
[PREAMBOLO]
ANALIZZA cosa manca per il "WOW":
- Animazioni che spiegano concetti (corrente che scorre, LED che si accende progressivamente)
- Sound effects opzionali
- Celebration quando esperimento completato (confetti, suono, messaggio)
- Easter eggs educativi
- Micro-interazioni che deliziano
- Storytelling (perche' sto facendo questo esperimento?)
```

### ONDATA 6 — FIX PEDAGOGIA (8 agenti)
*Generata dinamicamente in base a risultati Ondata 5.*

### CoVe 3 — VERIFICA BROWSER CHROME (pedagogia + design + funzionale)

---

### ONDATA 7 — SIMULAZIONE UTENTI + ESPERTI + CREATIVI (8 agenti)

**Agent SIM-1**: Walkthrough bambino 8 anni — primo esperimento Vol1 dall'inizio alla fine
**Agent SIM-2**: Walkthrough teenager 14 — costruisce circuito custom con LED + resistenza + codice Arduino
**Agent SIM-3**: Valutazione genitore tech — "vale la pena comprare questo prodotto?"
**Agent SIM-4**: Valutazione insegnante scuola media — "posso usarlo in classe?"
**Agent SIM-5**: Review esperto Arduino/Maker — accuratezza simulazione, mancanze
**Agent SIM-6**: Review esperto UX/UI — usabilita' professionale, heuristics di Nielsen
**Agent SIM-7**: Review pedagogista STEM — approccio didattico, allineamento curricolare
**Agent SIM-8**: Brainstorm Creative Director — 10 idee innovative per differenziarsi

### ONDATA 8 — FIX FINALI (8 agenti)
*Generata dinamicamente: implementa le migliori idee + fix dalle Ondate 5-7.*

### CoVe 4 — VERIFICA FINALE

---

### CICLO 2 (ripeti Ondate 2-8 con focus: edge cases, performance, polish)
### CICLO 3 (ripeti Ondate 2-8 con focus: polish finale, a11y, deploy optimization)

---

## FILE DI CONTESTO (Loop of Context)

### File che OGNI agente DEVE leggere
```
.claude-sprint/SPRINT-CONTEXT.md    — contesto globale progetto
.claude-sprint/BUG-BACKLOG.md       — bug da fixare con status
```

### File che OGNI agente DEVE scrivere (append-only)
```
.claude-sprint/AGENT-RESULTS.md     — risultati per agente/ondata
```

### File gestiti SOLO dal Lead Architect
```
.claude-sprint/AGENT-TRACKER.md     — tracking status agenti
.claude-sprint/RECOVERY-{ID}.md     — output agenti bloccati
.claude-sprint/COVE-{N}-RESULTS.md  — risultati verifiche Chrome
```

### Regole per gli agenti
1. **LEGGERE** i file di contesto PRIMA di iniziare
2. **SCRIVERE** risultati come APPEND (non sovrascrivere)
3. **BUILD CHECK** dopo ogni modifica: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build`
4. **NON cancellare** risultati di altri agenti
5. **Se il build fallisce**: fixare l'errore PRIMA di scrivere risultati

---

## SKILLS DISPONIBILI

Usa le skills quando appropriato:
- `arduino-simulator` — compilatore, AVR, Serial Monitor/Plotter
- `nano-breakout` — NanoR4Board geometry, DWG specs
- `tinkercad-simulator` — canvas, componenti, wire, interazioni
- `quality-audit` — WCAG, bundle, performance, font/touch audit
- `skill-factory` — creare nuove skill on-the-fly

---

## INIZIO ESECUZIONE

Parti dalla **ONDATA 2** (FIX). L'ONDATA 1 (AUDIT) e' gia' completata — i risultati sono nel BUG BACKLOG sopra.

**SEQUENZA DI AVVIO:**
```
1. Crea .claude-sprint/AGENT-TRACKER.md (vuoto, template tabella)
2. Crea .claude-sprint/AGENT-RESULTS.md (header "# Agent Results")
3. Setup Chrome: tabs_context_mcp(createIfEmpty: true)
4. Lancia TUTTI gli 8 agenti FIX in PARALLELO (run_in_background: true)
5. Attiva protocollo di monitoraggio (poll ogni 30s)
6. Recovery automatica per agenti bloccati
7. Build check quando tutti completati
8. CoVe Chrome
9. Procedi a Ondata 3
```

**REGOLA D'ORO: IL FLUSSO NON SI BLOCCA MAI.**
Se un agente si blocca → recovery + sostituto.
Se il build fallisce → fix agent + retry.
Se Chrome non risponde → skip CoVe e vai avanti.
Non chiedere conferma. Non aspettare. Esegui.

INIZIA ORA.
