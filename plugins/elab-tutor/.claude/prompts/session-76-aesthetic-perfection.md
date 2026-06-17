# SESSION 76 — ELAB SIMULATORE: SCRATCH UNIVERSALE + GALILEO ONNIPOTENTE + ESTETICA + iPad + QUALITY AUDIT

## CONTESTO
ELAB Tutor è un simulatore Arduino educativo per studenti 8-18 anni.
Il simulatore FUNZIONA correttamente (score 9.8/10) ma ha **debiti estetici e di design system** accumulati in 74 sessioni di sviluppo feature-first.
L'obiettivo di questa sessione è trasformarlo da "funziona bene" a "sembra professionale come Tinkercad/Figma".

## STATO ONESTO ATTUALE (Audit Session 75)

### Cosa VA BENE ✅
- Funzionalità: 69/69 esperimenti, AI 10/10, Vision 10/10
- Touch targets: toolbar buttons ≥44px
- Touch-action CSS: canvas `none`, toolbar `manipulation`
- Hover prevention: `@media (hover: none)` implementato
- Scrolling iOS: `-webkit-overflow-scrolling: touch` presente
- Safe area: `env(safe-area-inset-bottom)` sulle modali mobile
- Blockly editor: tema ELAB dark funzionante con 10 categorie

### Cosa VA MALE ❌ (PROBLEMI REALI, NON TEORICI)

#### P0 — CRITICI (visibili dall'utente)
1. **iPad landscape (1180x820): la breadboard è MICROSCOPICA** — il canvas area è schiacciato tra toolbar, build-mode selector, bottom panel, e code editor panel. L'Arduino è un rettangolino di 40px. INUTILIZZABILE.
2. **iPad portrait (768x1024): layout completamente rotto** — build mode selector tagliato, Blockly panel fuori schermo, canvas vuoto bianco enorme.
3. **Palette colori DISALLINEATA nel design-system.css**:
   - `--color-accent: #558B2F` → SBAGLIATO, deve essere `#7CB342`
   - `--color-vol1: #558B2F` → SBAGLIATO, deve essere `#7CB342`
   - `--color-vol2: #C77700` → SBAGLIATO, deve essere `#E8941C`
4. **150+ colori hardcoded** nei CSS del simulatore che ignorano completamente il design system

#### P1 — IMPORTANTI (degradano l'esperienza)
5. **Font size `.toolbar-group-label`: 0.65rem (10.4px)** — illeggibile per bambini
6. **Range slider thumb: 28x28px** — sotto il minimo WCAG 44px (potentiometer/LDR overlay)
7. **Nessun uso di CSS variables** — border-radius, box-shadow, transition, spacing tutti hardcoded
8. **Z-index chaos**: `.backdrop` e `.galileoBackdrop` entrambi a 9999
9. **Blockly panel width `clamp(400px, 50vw, 720px)`** — su iPad diventa 590px, schiaccia il canvas

#### P2 — MEDI (polish professionale mancante)
10. **Nessun `@media (prefers-reduced-motion)`** — animazioni non rispettano preferenze utente
11. **Focus-visible inconsistente** — solo toolbar buttons hanno outline, il resto no
12. **Nessun `:disabled` state** per bottoni non-toolbar
13. **Active state inconsistente** — `scale(0.95)` vs `scale(0.98)` in diversi componenti
14. **Panel headers: gradient opacity diversa** tra layout.module.css e overlays.module.css
15. **Scrollbar colors hardcoded** — `#D4C9B0` non nel design system
16. **Duplicate `overflow-x: auto`** in ElabSimulator.css linea 338-339
17. **SVG accessibility**: 21 componenti SVG senza `aria-label`, `role`, `title` (P2-RES-9)
18. **No skip-to-content link** (P2-RES-10)

---

## RICHIESTE SPECIFICHE — IN ORDINE DI PRIORITÀ

### FASE 0: Scratch/Blockly Universale + Galileo Onnipotente (PRIORITÀ MASSIMA)
L'editor a blocchi (Scratch/Blockly) deve funzionare OVUNQUE e Galileo deve comandarlo.

#### PROBLEMA ATTUALE
- L'editor codice (con tab Arduino C++ / 🧩 Blocchi) è visibile SOLO quando `simulationMode === 'avr'`
- Questo significa: SOLO esperimenti Volume 3 con codice Arduino
- **Volume 1/2** (circuiti senza codice): l'editor NON appare MAI → lo studente non può programmare
- **Galileo** ha ZERO conoscenza di Scratch/Blockly — non sa nemmeno che esiste
- **Nessun action tag** per controllare l'editor: non può aprirlo, chiuderlo, switchare tab

#### File chiave da capire prima di toccare
```
src/components/simulator/NewElabSimulator.jsx
  Linea 198: const [showCodeEditor, setShowCodeEditor] = useState(false);
  Linea 199: const [editorMode, setEditorMode] = useState('arduino');
  Linea 1473-1474: GATE — showCodeEditor si attiva SOLO con simulationMode === 'avr'
  Linea 3549-3637: Render del code editor panel con tab toggle

src/components/simulator/panels/ScratchEditor.jsx
  Editor Blockly con tema ELAB dark, Zelos renderer, 10 categorie toolbox

src/components/simulator/panels/scratchBlocks.js
  18 blocchi custom Arduino (digitalWrite, analogRead, delay, tone, servo, ecc.)
  Tutti usano setStyle() collegato al tema ELAB

src/components/simulator/panels/scratchGenerator.js
  Generatore codice Arduino C++ da workspace Blockly
  Genera setup() + loop() + variabili + funzioni Arduino valide

src/components/tutor/ElabTutorV4.jsx
  Linea 1550-1800: Action handler — processa [AZIONE:cmd:args] da risposte Galileo
  22 action tags supportati, NESSUNO per Scratch/editor

nanobot/server.py + nanobot/*.yml
  Backend AI — ZERO menzioni di "scratch", "blockly", "blocchi"
```

#### REQUISITI — SCRATCH DISPONIBILE IN TUTTE LE MODALITÀ

**A) Rimuovere il gate AVR-only (NewElabSimulator.jsx)**
- [ ] Il code editor panel deve essere disponibile per TUTTI gli esperimenti, non solo AVR
- [ ] Per esperimenti `simulationMode: 'circuit'` (Vol 1/2):
  - Aggiungere un bottone "🧩 Codice" nella toolbar O nel panel area per aprire l'editor
  - L'editor si apre con tab "Arduino C++" e "🧩 Blocchi" come per AVR
  - Lo studente può scrivere codice Arduino che controlla i componenti del circuito
- [ ] Il bottone code editor deve essere presente in TUTTE e 3 le build mode:
  - **Già Montato**: editor disponibile (circuito pre-costruito, lo studente programma)
  - **Passo Passo**: editor disponibile dopo che il circuito è completo
  - **Vuoto/Libero**: editor sempre disponibile (lo studente costruisce E programma)
- [ ] Il toggle (show/hide editor) deve funzionare su TUTTI i device (desktop, iPad, mobile)

**B) Compilazione ed esecuzione Scratch in modalità circuit (CRITICO)**
- [ ] Quando lo studente scrive codice a blocchi per un esperimento Vol 1/2:
  1. scratchGenerator.js genera il codice Arduino C++ (già funziona)
  2. Il codice viene sincronizzato nell'editor Arduino (`setEditorCode(generatedCode)` — già funziona)
  3. Il bottone "Compila" deve compilare il codice (richiede AVR backend)
  4. L'AVR eseguito deve INTERAGIRE con i componenti del circuito (LED acceso/spento, buzzer, ecc.)
- [ ] **Decisione architetturale**: per esperimenti circuit-only servono:
  - Un `code` default vuoto (`void setup() {}\nvoid loop() {}`) per inizializzare l'AVR
  - La mappatura pin → componenti del circuito (quale pin controlla quale LED/buzzer)
  - L'AVR bridge che comunica con il CircuitSolver esistente
- [ ] Il Serial Monitor deve funzionare anche per esperimenti convertiti a codice

**C) Nuovi action tag per Galileo (ElabTutorV4.jsx)**
Aggiungere 4 nuovi action tag nel handler (dopo linea 1778):
- [ ] `[AZIONE:openeditor]` → `setShowCodeEditor(true)` — apre il pannello editor
- [ ] `[AZIONE:closeeditor]` → `setShowCodeEditor(false)` — chiude il pannello editor
- [ ] `[AZIONE:switcheditor:scratch]` → `setEditorMode('scratch')` — switch a tab Blocchi
- [ ] `[AZIONE:switcheditor:arduino]` → `setEditorMode('arduino')` — switch a tab Arduino C++
- [ ] `[AZIONE:loadblocks:xml]` → Carica un workspace Blockly pre-costruito (per tutorial guidati)

**D) Galileo Knowledge Base — Scratch/Blockly (nanobot)**
Galileo deve sapere TUTTO su Scratch/Blockly. Aggiornare la knowledge base:
- [ ] `nanobot.yml` (o nuovo `scratch.yml`): aggiungere sezione dedicata con:
  - Cos'è la modalità Blocchi: "Un editor visuale dove i blocchi si agganciano come puzzle"
  - Le 10 categorie: Input/Output, Tempo, Suono, Variabili, Servo, Seriale, Logica, Cicli, Matematica, Testo
  - I 18 blocchi custom: digitalWrite, digitalRead, analogWrite, analogRead, delay, millis, tone, noTone, servoAttach, servoWrite, servoRead, serialPrint, serialPrintln, serialRead, declareVariable, setVariable
  - Come funziona: "I blocchi generano codice Arduino C++ automaticamente"
  - Quando usarlo: "Per chi inizia, è più facile dei comandi scritti"
  - Come passare da blocchi ad Arduino: "Puoi vedere il codice Arduino generato cliccando la tab 'Arduino C++'"
- [ ] `circuit.yml` o `nanobot.yml`: aggiungere regole per comandi vocali:
  - "apri i blocchi" / "voglio programmare a blocchi" → `[AZIONE:openeditor] [AZIONE:switcheditor:scratch]`
  - "mostrami il codice Arduino" / "vedi il codice" → `[AZIONE:openeditor] [AZIONE:switcheditor:arduino]`
  - "chiudi l'editor" / "nascondi il codice" → `[AZIONE:closeeditor]`
  - "compila il codice" / "prova i blocchi" → `[AZIONE:compile]`
- [ ] `server.py` `detectIntent()`: aggiungere keyword matching per "blocchi", "scratch", "blockly", "programma a blocchi", "editor visuale"
- [ ] Galileo deve poter GUIDARE lo studente passo-passo:
  - "Trascina il blocco 'accendi LED' nello spazio di lavoro"
  - "Collega il blocco 'attendi 1 secondo' sotto"
  - "Ora premi Compila per provare il tuo programma"
  - "Il tuo codice accenderà il LED sul pin 13 per 1 secondo, poi lo spegnerà"

**E) Tutorial guidati Scratch (contenuto educativo)**
- [ ] Per ogni esperimento AVR (Vol 3), creare un `scratchSolution` nella definizione esperimento:
  - XML Blockly del workspace pre-costruito (soluzione a blocchi dell'esperimento)
  - Galileo può caricare la soluzione: "Ecco come fare questo esperimento con i blocchi!" → `[AZIONE:loadblocks:...]`
- [ ] Per esperimenti Vol 1/2, creare esempi base:
  - "Accendi il LED" → blocco digitalWrite(LED_PIN, HIGH)
  - "Fai lampeggiare il LED" → loop con delay
  - "Suona il buzzer" → tone(BUZZER_PIN, frequenza)

#### VERIFICA FASE 0
- [ ] Su desktop 1440x900: aprire esperimento Vol 1 (LED base), cliccare "Codice", usare Blocchi, compilare
- [ ] Su iPad 1180x820: stessa verifica — editor si apre, Blocchi funzionano, compilazione OK
- [ ] Galileo test: "voglio programmare con i blocchi" → si apre l'editor Blocchi
- [ ] Galileo test: "come faccio ad accendere il LED con i blocchi?" → guida passo-passo
- [ ] Galileo test: "compila il mio programma" → [AZIONE:compile]
- [ ] Galileo test: "mostrami il codice Arduino che hanno generato i blocchi" → switch a tab Arduino

---

### FASE 1: iPad Layout Fix (LA PRIORITÀ ASSOLUTA)
Il simulatore DEVE essere usabile su iPad. Attualmente è rotto.

**Target devices:**
- iPad Air/Pro landscape: 1180×820
- iPad Air/Pro portrait: 820×1180
- iPad Mini landscape: 1024×768
- iPad Mini portrait: 768×1024

**Requisiti:**
- [ ] Canvas (breadboard+Arduino) deve occupare almeno il **60% dello spazio visibile** su iPad landscape
- [ ] Su iPad portrait, il layout deve stackare verticalmente: toolbar → canvas (50vh minimo) → panels sotto
- [ ] Code editor panel (Arduino C++ / Blocchi) deve essere **collassabile** con un toggle, non sempre visibile
- [ ] Build mode selector ("Già Montato" / "Passo Passo" / "Libero") non deve overflow fuori schermo
- [ ] Bottom panel (Serial Monitor) deve essere **collassato di default** su iPad, espandibile con tap
- [ ] Il Blockly editor su iPad landscape deve avere un **panel width di max 380px** (non 50vw)
- [ ] Tutti i pannelli laterali devono avere un **drag handle** o **swipe gesture** per ridimensionare su touch

**Verifica:** Screenshot a 1180x820 e 768x1024 — la breadboard deve essere chiaramente visibile e interagibile.

### FASE 2: Design System Alignment
Allineare TUTTO il simulatore al design-system.css esistente.

- [ ] Correggere `design-system.css`: `--color-accent: #7CB342`, `--color-vol1: #7CB342`, `--color-vol2: #E8941C`
- [ ] Aggiungere tokens mancanti:
  ```css
  /* Simulator-specific tokens */
  --color-sim-bg: #FAFAF7;
  --color-sim-bg-dark: #1E2530;
  --color-sim-border: #E8E4DB;
  --color-sim-text-muted: #999;
  --color-sim-scrollbar: #D4C9B0;
  --color-code-bg: #1E1E2E;
  --color-code-border: #313244;
  ```
- [ ] Sostituire TUTTI i 150+ colori hardcoded con `var(--color-*)` nei file:
  - `ElabSimulator.css` (~50 occorrenze)
  - `layout.module.css` (~20 occorrenze)
  - `overlays.module.css` (~30 occorrenze)
  - `codeEditor.module.css` (~15 occorrenze)
- [ ] Sostituire tutti `border-radius: Npx` con `var(--radius-*)`
- [ ] Sostituire tutti `box-shadow: ...` con `var(--shadow-*)`
- [ ] Sostituire tutti `transition: ...ms` con `var(--transition-*)`
- [ ] Sostituire tutti `padding/margin: Npx` con `var(--space-*)`
- [ ] Usare `var(--z-*)` per tutti gli z-index

### FASE 3: Touch & Accessibility
- [ ] Range slider thumb → **44x44px** (overlays.module.css linee 106-107, 116-117)
- [ ] `.toolbar-group-label` font-size → `0.875rem` (14px) (ElabSimulator.css linea 295)
- [ ] Aggiungere `@media (prefers-reduced-motion: reduce)` per tutte le animazioni
- [ ] Focus-visible su TUTTI gli elementi interattivi (non solo toolbar)
- [ ] `:disabled` state coerente per tutti i bottoni
- [ ] Active state uniforme: `scale(0.97)` ovunque
- [ ] Skip-to-content link accessibile

### FASE 4: Visual Polish
- [ ] Panel headers: gradient identico ovunque
- [ ] Scrollbar styling via design tokens
- [ ] Rimuovere `overflow-x: auto` duplicato (ElabSimulator.css linea 339)
- [ ] Z-index hierarchy pulita (usare i token `--z-*` del design system)
- [ ] Hover states consistenti su tutti i bottoni (non solo toolbar)
- [ ] Aggiungere `aria-label` e `role` ai 21 componenti SVG

---

## REGOLE TECNICHE

### File da modificare (in ordine)

**FASE 0 — Scratch Universale + Galileo:**
1. `src/components/simulator/NewElabSimulator.jsx` — Rimuovere gate AVR-only, aggiungere toggle editor per tutti gli esperimenti
2. `src/components/tutor/ElabTutorV4.jsx` — 5 nuovi action tag (openeditor, closeeditor, switcheditor, loadblocks)
3. `nanobot/nanobot.yml` (o nuovo `scratch.yml`) — Knowledge base Scratch/Blockly per Galileo
4. `nanobot/circuit.yml` — Regole comandi vocali per editor/blocchi
5. `nanobot/server.py` — detectIntent() keywords per blocchi/scratch
6. `src/data/experiments-vol1.js` + `experiments-vol2.js` — Aggiungere `code` default vuoto per abilitare AVR
7. `src/services/api.js` — System prompt context per azioni editor

**FASE 1-4 — Estetica + iPad:**
8. `src/styles/design-system.css` — Fix palette + nuovi tokens
9. `src/components/simulator/ElabSimulator.css` — Hardcoded colors + iPad layout
10. `src/components/simulator/layout.module.css` — Panel sizing + iPad responsive
11. `src/components/simulator/overlays.module.css` — Overlay styling
12. `src/components/simulator/panels/codeEditor.module.css` — Code editor
13. `src/components/simulator/panels/ScratchEditor.jsx` — Blockly panel width iPad

### NON TOCCARE
- CircuitSolver, AVR core engine (physics/simulation logic)
- Componenti SVG interni (Led.jsx, Resistor.jsx ecc.)
- scratchGenerator.js / scratchBlocks.js (appena testati S75, funzionano perfettamente)
- scratchBlocks.js: 18 blocchi custom con setStyle() + ELAB_THEME → NON MODIFICARE
- Auth/security (Netlify Functions, bcrypt, HMAC-SHA256)
- Dati esperimenti (experiments-vol*.js) — TRANNE aggiunta campo `code` default

### Breakpoint System (CONFERMARE, non inventare)
```
Mobile Portrait:  max-width: 599px
Mobile Landscape: 600px — 767px
Tablet Portrait:  768px — 1023px
Tablet Landscape: 1024px — 1179px   ← NUOVO, non esisteva!
iPad Landscape:   1180px — 1439px   ← NUOVO, non esisteva!
Desktop:          1440px+
```

### Verifica Obbligatoria
Dopo OGNI fase, fare screenshot a queste risoluzioni:
1. **1440×900** (desktop) — baseline
2. **1180×820** (iPad landscape) — CRITICO
3. **768×1024** (iPad portrait) — CRITICO
4. **375×812** (mobile) — sanity check

---

## QUALITY AUDIT (da eseguire ALLA FINE)

Eseguire `/quality-audit` completo con score card:

```
| Metrica                        | Target            |
|--------------------------------|-------------------|
| Scratch in Vol1 esperimento    | Funzionante       |
| Scratch in Vol2 esperimento    | Funzionante       |
| Scratch in tutte le build mode | 3/3 (GM/PP/Vuoto) |
| Scratch compila + esegue       | Sì                |
| Galileo comanda editor         | 5/5 action tags   |
| Galileo guida Scratch          | Sì (test 4/4)     |
| Colori hardcoded               | 0                 |
| border-radius hardcoded        | 0                 |
| box-shadow hardcoded           | 0                 |
| Font < 14px (non-watermark)    | 0                 |
| Touch target < 44px            | 0                 |
| z-index fuori scala            | 0                 |
| Build errors                   | 0                 |
| Console errors                 | 0                 |
| iPad landscape usabile         | Canvas ≥60% area  |
| iPad portrait usabile          | Canvas ≥50vh      |
| prefers-reduced-motion         | Presente          |
| focus-visible universale       | Sì                |
| WCAG AA contrast ratio         | ≥ 4.5:1          |
```

---

## STILE DI RIFERIMENTO
Il simulatore deve SEMBRARE:
- **Tinkercad Circuits** — pulizia, semplicità, colori piatti
- **Figma** — professionalità dei pannelli, resize handles, spacing
- **Claude.ai** — eleganza dei bottoni, tipografia, shadows

NON deve sembrare:
- Un progetto scolastico
- Un prototipo con colori a caso
- Un IDE desktop schiacciato su tablet

---

*Prompt scritto da Claude — Session 75, 06/03/2026*
*Aggiornato Session 75b: aggiunta FASE 0 Scratch Universale + Galileo Onnipotente*
*Basato su audit sistematico di 3 agent paralleli + screenshot iPad reali + indagine codice Scratch/Blockly*
