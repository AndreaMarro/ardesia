# SESSION 86 — ESTETICA, SCRATCH & iPAD: MASTERY ASSOLUTA
## Colori Perfetti · Scratch Fruibile · Passo Passo Scratch Dedicato · iPad Touch · FIX→TEST→VALIDATE

---

## ═══ MANIFESTO ═══════════════════════════════════════════════════════

> **Lezione dalla Session 85**: I fix layout (3 file, 0 regressioni) hanno portato iPad da 3.0→5.5 e Scratch da 9.0→9.5. Ma l'estetica è ancora 5.5/10 con 150+ hardcoded colors, e Scratch su iPad è usabile ma non eccellente. Questa sessione attacca i due debiti tecnici piu grandi: **visual design** e **Scratch iPad-first**.

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
    1. FIX    → Applica correzione minimale (max 3 file per fix)
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

### Regola di Platino: PRIMA SCREENSHOT, POI FIX
Prima di toccare QUALSIASI file:
1. Fai screenshot BASELINE a 3 viewport (1440x900, 1180x820, 768x1024)
2. Salva mentalmente cosa c'è ORA
3. Dopo ogni batch di fix, fai screenshot CONFRONTO
4. Se qualcosa è PEGGIORATO → REVERT IMMEDIATO

---

## ═══ TASK ═══════════════════════════════════════════════════════════

### Obiettivo Finale
Trasformare il simulatore ELAB da **"funzionale ma brutto"** a **"bello, fruibile, leggibile"** dove:

1. **ESTETICA PROFESSIONALE**: Tutti i 150+ colori hardcoded sostituiti con CSS variables dalla palette ELAB. Coerenza visiva totale: toolbar, panels, buttons, labels, badges
2. **SCRATCH FRUIBILE SU iPAD**: Blocchi Blockly toccabili (≥44px touch targets), trascinabili con il dito, cancellabili, modificabili. Il bambino su iPad usa Scratch SENZA frustrazione
3. **SCRATCH CHE COMPILA SEMPRE**: Pipeline Blockly → C++ → Compilazione → Simulazione testata end-to-end su 6+ esperimenti
4. **PASSO PASSO SCRATCH DEDICATO**: Scheda step-by-step SEPARATA per la parte codice, con spiegazioni semplici ma complete per ogni blocco aggiunto. NON mescolata con gli step hardware
5. **LEGGIBILITA'**: Font ≥14px ovunque, contrasti WCAG AA, labels chiare, icone significative
6. **iPAD TOUCH-FIRST**: Ogni interazione del simulatore funziona con il dito — drag, drop, connect, delete, zoom

### NON Obiettivi (NON toccare)
- AI/Galileo/nanobot (funziona 10/10 — S74)
- Auth/Security (funziona 9.8/10 — S55)
- Sito pubblico Netlify (funziona 9.6/10 — S56)
- CircuitSolver physics engine (funziona 7/10 — non peggiorare)
- Dati esperimenti (experiments-vol1/2/3.js — posizioni verificate col libro, NON TOCCARE)

---

## ═══ CONTEXT FILES ════════════════════════════════════════════════

### Tier 1: LEGGERE IMMEDIATAMENTE (Estetica + Layout)
```
src/styles/design-system.css                           # CSS tokens, palette, spacing, z-index — LA FONTE DI VERITA'
src/components/simulator/ElabSimulator.css             # Stili generali, toolbar, breakpoints responsive
src/components/simulator/layout.module.css             # Layout responsive, iPad breakpoints, panel sizing
src/components/simulator/NewElabSimulator.jsx          # 3884 righe — orchestratore, state, tabs, modes
```

### Tier 2: LEGGERE PER SPRINT SPECIFICO
```
# Scratch/Blockly (Sprint 2-3)
src/components/simulator/panels/ScratchEditor.jsx      # 407 righe — Blockly workspace, ELAB theme, Zelos
src/components/simulator/panels/CodeEditorCM6.jsx      # CodeMirror 6, title prop, read-only mode
src/components/simulator/panels/scratchBlocks.js       # 18 blocchi custom Arduino (setStyle + ELAB_THEME)
src/components/simulator/panels/scratchGenerator.js    # Blockly → C++ generator (setup+loop+vars)

# Passo Passo (Sprint 3)
src/components/simulator/panels/ComponentDrawer.jsx    # Passo Passo card, auto-collapse — DA REFACTORARE per split HW/Code
src/data/experiments-vol3.js                           # 14 esperimenti, scratchSteps campo

# Estetica (Sprint 1)
src/components/simulator/panels/ControlBar.jsx         # Play/Pause/Stop toolbar
src/components/simulator/panels/ComponentPalette.jsx   # Componenti palette (filtered by volume)
src/components/simulator/panels/ExperimentPicker.jsx   # Selettore esperimenti per volume/capitolo
src/components/tutor/ChatOverlay.jsx                   # Galileo AI chat overlay

# SVG Components (Sprint 4)
src/components/simulator/components/BreadboardFull.jsx
src/components/simulator/components/NanoR4Board.jsx
src/components/simulator/components/Led.jsx
src/components/simulator/components/Resistor.jsx
src/components/simulator/components/Wire.jsx
# ... + tutti gli altri in src/components/simulator/components/
```

### Tier 3: REFERENCE (sessioni precedenti)
```
.claude/prompts/session-85-simulator-scratch-perfection.md  # Struttura Sprint, metodi, regole
.claude/prompts/session-76-aesthetic-perfection.md           # Audit estetico (150+ colori, 13 file, 19 metrics)
.team-status/SESSION-85-REPORT.md                           # Report onesto, score card attuale
```

---

## ═══ ARCHITETTURA CORRENTE (da Session 85) ═════════════════════════

### Scores ATTUALI (partenza)
| Area | Score S85 | Target S86 | Delta Obiettivo |
|------|-----------|------------|-----------------|
| Simulatore (estetica) | 5.5/10 | **8.0** | +2.5 |
| Simulatore (iPad) | 5.5/10 | **7.5** | +2.0 |
| Scratch Universale | 9.5/10 | **10.0** | +0.5 |
| Responsive/A11y | 7.0/10 | **8.5** | +1.5 |
| Code Quality | 9.8/10 | **9.8** | 0 |
| **Regressioni tollerate** | — | **ZERO** | — |

### Palette Ufficiale ELAB
```css
/* Questi sono i SOLI colori ammessi. Ogni colore fuori da questa lista è un BUG */
--color-navy:      #1E4D8C;    /* primary brand, headers, buttons */
--color-lime:      #7CB342;    /* success, accents, Vol1 */
--color-vol2:      #E8941C;    /* Vol2 orange */
--color-vol3:      #E54B3D;    /* Vol3 red */
--color-bg:        #FAFAF7;    /* page background */
--color-surface:   #FFFFFF;    /* cards, panels */
--color-text:      #333333;    /* body text */
--color-muted:     #666666;    /* secondary text */
--color-border:    #E0E0E0;    /* borders, dividers */

/* Fonts */
--font-display:    'Oswald', sans-serif;      /* headings, labels */
--font-sans:       'Open Sans', sans-serif;    /* body text */
--font-mono:       'Fira Code', monospace;     /* code editor */
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

### Passo Passo Architettura Attuale (DA MIGLIORARE)
```
ATTUALE (S85 — problematico):
ComponentDrawer mostra TUTTI gli step mischiati:
  🔧 Step 1 (hardware) → 🔧 Step 2 → ... → 🧩 Codice 1 → 🧩 Codice 2 → ...
  - Confusionario: l'utente non capisce quando finisce l'hardware e inizia il codice
  - Il panel completamento resta visibile e blocca l'interfaccia
  - Non c'è spiegazione di COSA fa ogni blocco Scratch

OBIETTIVO (S86):
Due fasi SEPARATE con transizione chiara:
  FASE 1 — 🔧 MONTA IL CIRCUITO (panel hardware)
    Step 1: "Piazza il LED rosso sul foro E5" → Avanti
    Step 2: "Piazza il resistore tra H5 e H10" → Avanti
    ...
    ✅ "Circuito pronto! Ora passiamo al codice →"

  FASE 2 — 🧩 PROGRAMMA CON I BLOCCHI (panel Scratch DEDICATO)
    Step 1: "Trascina il blocco 'Imposta Pin' nella sezione Setup"
            💡 "Questo dice ad Arduino: il pin 13 è un'USCITA (ci colleghiamo il LED)"
    Step 2: "Aggiungi 'Scrivi Pin ALTO' nel Loop"
            💡 "ALTO significa: manda corrente al LED → il LED si accende!"
    Step 3: "Aggiungi 'Aspetta 1 secondo'"
            💡 "Arduino aspetta 1 secondo prima del prossimo comando"
    ...
    ✅ "Codice completo! Premi Compila ▶ e poi Play per vedere il LED lampeggiare!"
```

---

## ═══ SPRINT PLAN (5 Sprint) ═══════════════════════════════════════

### SPRINT 1: ESTETICA — CSS VARIABLES & PALETTE UNIFICATA
**Obiettivo**: Eliminare TUTTI i colori hardcoded. Uniformare il design al brand ELAB.

#### 1A: Audit Colori Hardcoded
Usa agent paralleli per trovare TUTTI i colori fuori palette:
```
Agent(Explore: "find all hardcoded hex colors (#xxx, #xxxxxx) in src/components/simulator/")
Agent(Explore: "find all hardcoded rgb/rgba in src/components/simulator/")
Agent(Explore: "find all inline style={{color/background in simulator JSX files")
```
Produci lista completa: file → riga → colore attuale → CSS var corretta

#### 1B: Sostituzione Sistematica
Per OGNI file con colori hardcoded:
- Sostituisci `#1E4D8C` → `var(--color-navy)` (e simili)
- Sostituisci `#7CB342` → `var(--color-lime)`
- Sostituisci colori "simili ma diversi" (es. `#1a4a87`, `#2d5f9e`) con la var piu vicina
- Inline styles con colori fissi → CSS classes con variables
- ATTENZIONE: NON toccare colori dentro componenti SVG che rappresentano componenti fisici (LED rosso, fili colorati, ecc.)

#### 1C: Toolbar & Panels Visual Refresh
- Toolbar: sfondo uniforme, bottoni con hover states coerenti, bordi sottili
- Panels (ExperimentPicker, ComponentPalette, ComponentDrawer): header con `--color-navy`, body con `--color-surface`
- Badges volume (Vol1/Vol2/Vol3): colori dalla palette con bordi arrotondati
- Tab bar (Circuito / Codice / Blocchi): stile coerente con active indicator `--color-navy`

#### 1D: Typography & Readability
- Verificare che OGNI testo UI abbia `font-size ≥ 14px`
- Labels toolbar: `--font-display` (Oswald)
- Body text (descrizioni, step): `--font-sans` (Open Sans)
- Code (editor, terminal): `--font-mono` (Fira Code)
- Contrasto WCAG AA: testo su sfondo deve avere ratio ≥ 4.5:1

#### VERIFICA Sprint 1
```
PER OGNI viewport (1440x900, 1180x820, 768x1024):
  1. preview_resize → viewport
  2. preview_screenshot → confronto visivo PRIMA/DOPO
  3. preview_inspect(.toolbar, ["background", "color", "font-family"])
  4. preview_inspect(.panel-header, ["background", "color", "font-size"])
  5. Grep("hardcoded color count") → deve essere < 20 (era 150+)
  6. preview_console_logs(level: "error") → 0
  7. LOG risultato + screenshot
```

---

### SPRINT 2: SCRATCH iPad-FIRST — TOUCH PERFETTO
**Obiettivo**: Blocchi Blockly pienamente utilizzabili su iPad con touch

#### 2A: Touch Target Audit Scratch
```
preview_resize(1180, 820)  // iPad landscape
// Carica esperimento Vol3 con scratchXml
// Click tab Blocchi
preview_inspect(".blocklyToolboxCategory", ["min-height", "min-width", "padding"])
preview_inspect(".blocklyDraggable", ["min-height", "touch-action"])
preview_inspect(".blocklyText", ["font-size"])
```
WCAG dice: ogni elemento interattivo ≥ 44x44px su touch device

#### 2B: Blockly Toolbox iPad Fix
- Categorie toolbox: `min-height: 44px`, `padding: 8px 12px`
- Nomi categorie: `font-size: 14px` (attualmente potrebbe essere 12px)
- Icone categorie: `width/height: 24px` minimo
- Scrolling toolbox: fluido su touch (`-webkit-overflow-scrolling: touch`)

#### 2C: Blocchi Draggabili su Touch
- `touch-action: none` su `.blocklyDraggable` e `.blocklySvg`
- Blocchi snap-to-connect: raggio di aggancio ampio per dita (non puntatore mouse)
- Trash (cestino) visibile e grande (≥48px) per eliminare blocchi
- Right-click/long-press su blocco: context menu con "Elimina", "Duplica"

#### 2D: Side-by-Side su iPad
- iPad Landscape (1180x820): Blockly 55% + C++ preview 45%
- iPad Portrait (768x1024): Blockly 100% width, C++ preview come collapsible panel sotto
- Toggle visibile per nascondere/mostrare code preview su tablet
- Font code preview su iPad: `14px` minimo (non 11-12px)

#### 2E: Compilazione End-to-End
Testare su 6 esperimenti Vol3:
```
SCRATCH_EXPERIMENTS = [6.1 Blink, 6.2 Pin5, 6.3 SOS, 6.4 Sirena, 6.5 Semaforo, 6.6 Potenziometro]
PER OGNI esperimento:
  1. Carica esperimento → tab "Blocchi"
  2. Workspace Blockly caricato?
  3. C++ preview corretto?
  4. Click "Compila" → compilazione OK?
  5. Click Play → simulazione parte?
  6. Errori console? → 0
  7. LOG: PASS/FAIL
```

#### VERIFICA Sprint 2
```
SU iPAD (1180x820 e 768x1024):
  1. Apri Scratch tab
  2. preview_inspect(".blocklyToolboxCategory", ["min-height", "padding"]) → ≥44px
  3. preview_inspect(".blocklyText", ["font-size"]) → ≥14px
  4. preview_screenshot → blocchi leggibili? Non sovrapposti?
  5. Trascina blocco (se possibile via preview tool) → snap funziona?
  6. Compila → PASS?
  7. LOG risultato
```

---

### SPRINT 3: PASSO PASSO SCRATCH — SCHEDA DEDICATA
**Obiettivo**: Creare un panel Scratch Passo Passo SEPARATO con spiegazioni chiare

#### 3A: Architettura Split Hardware/Code
Il ComponentDrawer attuale mescola step HW e code in un unico flusso.
NUOVA architettura:

```jsx
// ComponentDrawer.jsx — DUE FASI DISTINTE
{fase === 'hardware' && (
  <HardwareStepCard
    step={currentHWStep}
    total={totalHWSteps}
    onAvanti={advanceHW}
    onIndietro={goBackHW}
  />
)}

{fase === 'hardware' && currentHWStep === totalHWSteps && (
  <TransitionCard>
    ✅ Circuito pronto!
    <button onClick={() => setFase('scratch')}>
      🧩 Passiamo al codice →
    </button>
  </TransitionCard>
)}

{fase === 'scratch' && (
  <ScratchStepCard
    step={currentScratchStep}
    total={totalScratchSteps}
    explanation={scratchSteps[currentScratchStep].explanation}
    onAvanti={advanceScratch}
    onIndietro={goBackScratch}
  />
)}
```

#### 3B: ScratchStepCard — Design & Contenuto
Ogni code step DEVE contenere:
1. **Titolo**: cosa fare (es. "Trascina il blocco 'Imposta Pin'")
2. **Spiegazione semplice**: cosa fa in parole da bambino (es. "Dice ad Arduino: il pin 13 manda corrente")
3. **Icona/colore** del blocco Blockly corrispondente
4. **Numero step**: "🧩 Codice 2 di 5"
5. **Bottoni**: ← Indietro | Avanti →

Design:
```
┌────────────────────────────────────────┐
│  🧩 Codice 2 di 5                     │
│  ──────────────────                    │
│  ▶ Trascina "Scrivi Pin ALTO"         │
│    dentro il blocco Loop               │
│                                        │
│  💡 ALTO = manda corrente al LED.      │
│     Il LED si accende!                 │
│                                        │
│  ← Indietro          Avanti →         │
└────────────────────────────────────────┘
```

#### 3C: Spiegazioni per Esperimenti
Arricchire il campo `scratchSteps` in `experiments-vol3.js` con `explanation` per ogni step.
ATTENZIONE: NON modificare posizioni/pin/componenti — SOLO aggiungere campo `explanation`.

Esempio per Blink (6.1):
```javascript
scratchSteps: [
  {
    xml: '...', // GIA' ESISTENTE — NON TOCCARE
    explanation: 'Trascina il blocco "Imposta Pin 13 come USCITA" nella sezione Setup. Questo dice ad Arduino: il pin 13 è collegato al LED e deve mandare corrente.'
  },
  {
    xml: '...',
    explanation: 'Aggiungi "Scrivi Pin 13 ALTO" nel Loop. ALTO significa: manda corrente → il LED si accende!'
  },
  // ...
]
```

#### 3D: Transizione HW → Codice
Quando l'ultimo hardware step è completato:
- Mostrare card di transizione: "✅ Circuito montato! Ora programmiamolo!"
- Bottone "🧩 Inizia a programmare →" che:
  1. Apre automaticamente il tab Blocchi
  2. Mostra il ScratchStepCard con Step 1
  3. Carica il XML Blockly del primo code step

#### 3E: Completamento
Dopo l'ultimo code step:
- Card finale: "🎉 Complimenti! Circuito e codice pronti!"
- Bottone "▶ Compila e Prova!" che lancia compilazione + play
- Il panel si chiude AUTOMATICAMENTE dopo 3 secondi (fix del bug S85)

#### VERIFICA Sprint 3
```
PER OGNI esperimento con scratchSteps (Blink, Sirena, Semaforo):
  1. Seleziona "Passo Passo"
  2. Avanza tutti gli step HW → card transizione appare?
  3. Click "Inizia a programmare" → tab Blocchi si apre? ScratchStepCard visibile?
  4. Leggi spiegazione Step 1 → chiara? Comprensibile per un bambino?
  5. Avanza code steps → workspace Blockly si aggiorna progressivamente?
  6. Ultimo step → card completamento? Panel si chiude?
  7. Compila → Play → funziona?
  8. LOG: PASS/FAIL

SU iPAD (1180x820):
  9. ScratchStepCard leggibile? Non sovrappone il workspace?
  10. Bottoni touch-friendly (≥44px)?
```

---

### SPRINT 4: iPAD RESPONSIVE POLISH
**Obiettivo**: Ogni elemento del simulatore è usabile su iPad senza frustrazione

#### 4A: iPad Landscape (1180x820) — Polish
- Canvas SVG: ≥60% dello schermo (misurato con preview_inspect)
- Sidebar: 170px (fix S85) — verificare che non si rompe con tutti i panels aperti
- Toolbar: tutti i bottoni visibili senza scroll orizzontale
- ExperimentPicker: dropdown non overflow dallo schermo
- ComponentPalette: griglia componenti 2 colonne minimo, icone ≥40px
- Galileo chat: non copre il canvas quando aperto

#### 4B: iPad Portrait (768x1024) — Usability
- Layout: toolbar top → canvas (≥55vh) → panels bottom
- Code editor: slide-over da destra (gia implementato S85)
- ComponentPalette: overlay che non schiaccia il canvas
- Scratch workspace: full-width con code preview collapsible
- Touch targets: TUTTO ≥44px (toolbar buttons, tabs, palette items)
- Font: TUTTO ≥14px (labels, step descriptions, badge text)

#### 4C: Touch Interactions Audit
Verificare con preview_inspect che:
```
OGNI bottone in toolbar:     min-width ≥ 44px, min-height ≥ 44px
OGNI tab (Circuito/Codice):  min-height ≥ 44px, padding ≥ 8px
OGNI item palette:           min-width ≥ 44px, min-height ≥ 44px
OGNI step button (Avanti):   min-width ≥ 44px, min-height ≥ 44px
OGNI categoria Blockly:      min-height ≥ 44px
```

#### 4D: z-index & Layering
Verificare che i panel non si sovrappongono male:
```
Canvas SVG:          z-index: 1
Toolbar:             z-index: 10
ComponentDrawer:     z-index: 20
Code Editor:         z-index: 30 (slide-over)
Scratch workspace:   z-index: 25
Galileo overlay:     z-index: 100
Modal/dialogs:       z-index: 200
```

#### VERIFICA Sprint 4
```
PER OGNI viewport (1180x820 e 768x1024):
  1. Carica 3 esperimenti (Vol1, Vol2, Vol3)
  2. Ogni modalità (GM, PP, Libero)
  3. preview_screenshot → tutto visibile?
  4. preview_inspect → touch targets ≥ 44px?
  5. preview_inspect → font ≥ 14px?
  6. Apri Galileo → non copre canvas?
  7. Apri Scratch → side-by-side o full-width?
  8. preview_console_logs → 0 errori
```

---

### SPRINT 5: RALPH LOOP FINALE + QUALITY AUDIT + DEPLOY
**Obiettivo**: Validazione end-to-end e report brutalmente onesto

#### 5A: Ralph Loop Cross-Mode-Device
```
EXPERIMENTS = [Vol1 esp1.1 (LED), Vol2 esp3.1 (3-LED), Vol3 esp6.1 (Blink)]
MODES = [Già Montato, Passo Passo, Libero]
VIEWPORTS = [1440x900, 1180x820, 768x1024]

for exp in EXPERIMENTS:
  for mode in MODES:
    for viewport in VIEWPORTS:
      1. preview_resize(viewport)
      2. Carica exp, seleziona mode
      3. Se Passo Passo + Vol3: testa flusso HW → transizione → Scratch steps
      4. Se Scratch available: testa Blockly + compile
      5. preview_screenshot
      6. LOG: PASS/FAIL
```

#### 5B: Scratch Compilation Marathon
```
TUTTI gli esperimenti Vol3 AVR con scratchXml (12 esperimenti):
PER OGNUNO:
  1. Carica → tab Blocchi
  2. Workspace caricato? Blocchi visibili?
  3. C++ preview presente?
  4. Compila → status OK?
  5. LOG: PASS/FAIL

TARGET: 12/12 PASS
```

#### 5C: Aesthetic Metrics Finale
```
Grep("hardcoded hex colors in simulator/") → conteggio
preview_inspect per 10 elementi chiave:
  - toolbar background
  - panel headers
  - button colors (normal/hover/active)
  - tab bar active indicator
  - step card border
  - badge colors (Vol1/2/3)
  - font families (display/body/mono)
  - font sizes (tutte ≥ 14px?)
  - touch targets (tutte ≥ 44px?)
  - contrasto testo (≥ 4.5:1?)
```

#### 5D: Build & Deploy
```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
npm run build         # DEVE essere 0 errori
npx vercel --prod --yes  # Deploy production
```

#### 5E: Report & Memory Update
- Salvare report in `.team-status/SESSION-86-REPORT.md`
- Aggiornare `MEMORY.md` con nuovi scores
- Score card ONESTA — se un target non è raggiunto, scrivere il numero REALE

---

## ═══ RULES ═════════════════════════════════════════════════════════

### Regole INVIOLABILI

1. **ZERO REGRESSIONI**: Se qualcosa funzionava in S85, DEVE funzionare in S86. Prima di ogni fix, testa che l'area funziona. Dopo il fix, ri-testa. Se è rotto → REVERT IMMEDIATO.

2. **ANTI-STALLO (10 min max)**: Se sei bloccato per piu di 10 minuti, FERMATI. SKIP → Sprint successivo.

3. **NON EDITARE DURANTE I TEST**: HMR resetta state React. Edit → Build → Test. MAI simultaneamente.

4. **NESSUNA modifica ai dati esperimenti**: `experiments-vol1/2/3.js` posizioni/pin/componenti NON SI TOCCANO. UNICA eccezione: aggiungere il campo `explanation` agli `scratchSteps` esistenti.

5. **CSS-first per layout/estetica**: Fix visivi DEVONO usare CSS (variables in design-system.css, classes in .css/.module.css). VIETATI nuovi stili inline per layout/colori. Inline solo per valori dinamici runtime.

6. **CSS Variables OBBLIGATORIE per colori**: Ogni colore DEVE passare da una CSS var definita in design-system.css. Nessun `#hex` hardcoded nel codice nuovo. Eccezione: colori fisici di componenti SVG (es. LED rosso fisico).

7. **Chain of Verification**: Dopo OGNI batch di fix: `npm run build` → 0 errori → screenshot browser → confronto PRIMA/DOPO.

8. **Scratch lazy-loaded**: React.lazy() + Suspense. NON importare Blockly nel bundle principale.

9. **Touch WCAG**: Ogni elemento interattivo ≥ 44x44px. Font UI ≥ 14px. Contrasto ≥ 4.5:1.

10. **Commit solo su richiesta**: NON fare commit automatici.

11. **Onesta BRUTALE — la regola piu importante dopo ZERO REGRESSIONI**:
    - Se qualcosa non funziona, SCRIVILO. Se un target non e raggiunto, scrivi il numero REALE.
    - MAI gonfiare i risultati. MAI scrivere "quasi funziona" — funziona o non funziona.
    - MAI scrivere PASS se non hai MISURATO con Chrome Control (screenshot/inspect/snapshot).
    - Se il colore toolbar e `#2a5090` invece di `#1E4D8C` → FAIL, non "close enough".
    - Se il font e 13.5px invece di 14px → FAIL, non "approximately correct".
    - Se il touch target e 42px invece di 44px → FAIL, non "nearly compliant".
    - La differenza tra un prodotto mediocre e uno eccellente sta nei dettagli.
    - Il report finale deve far MALE da leggere se ci sono problemi. Niente sugar-coating.

12. **Spiegazioni per bambini**: Le spiegazioni nei ScratchStepCard devono usare linguaggio da scuola elementare/media. Niente gergo tecnico. Analogie con il mondo reale (es. "il LED si accende come una lampadina").

---

## ═══ TOOLS & METHODOLOGY ════════════════════════════════════════

### Dev Server
```json
// .claude/launch.json — già configurato
{
  "name": "elab-builder-dev",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "port": 5173
}
```
Usa `preview_start` per avviare. `preview_screenshot` / `preview_snapshot` / `preview_inspect` per verificare.

---

### CHROME CONTROL — IL TUO UNICO OCCHIO SULLA REALTA

Chrome Control NON e un optional. E IL MODO in cui verifichi che il codice funziona.
Senza screenshot = senza verifica = non puoi dire PASS.

#### Filosofia: MISURA, NON STIMARE
```
SBAGLIATO: "Ho cambiato il CSS, dovrebbe funzionare su iPad"
CORRETTO:  "Ho cambiato il CSS, preview_resize(1180,820), preview_screenshot,
            il sidebar e 170px, preview_inspect('.toolbar-btn', ['min-height']),
            44px, PASS"
```
Se non l'hai misurato con Chrome Control, NON e verificato.

#### Protocollo Screenshot OBBLIGATORIO (dopo OGNI batch di fix)
```
SCREENSHOT_PROTOCOL = {
  1. preview_start("elab-builder-dev")
  2. preview_click sul tab Simulatore
  3. preview_resize({width: 1440, height: 900})
  4. preview_screenshot()                  // DESKTOP baseline
  5. preview_resize({width: 1180, height: 820})
  6. preview_screenshot()                  // iPad LANDSCAPE
  7. preview_resize({width: 768, height: 1024})
  8. preview_screenshot()                  // iPad PORTRAIT
  9. preview_console_logs({level: "error"}) // 0 errori TOLLERATI
}
```

#### Ispezione Brutale — Misure ESATTE, non stime
```
// ESTETICA: colori reali degli elementi
preview_inspect({selector: ".toolbar", styles: ["background-color", "border-color", "color"]})
preview_inspect({selector: ".panel-header", styles: ["background-color", "color", "font-family"]})

// TYPOGRAPHY: font sizes e families reali
preview_inspect({selector: ".toolbar-group-label", styles: ["font-size", "font-family"]})
preview_inspect({selector: ".step-description", styles: ["font-size", "line-height"]})
preview_inspect({selector: ".blocklyText", styles: ["font-size"]})

// TOUCH TARGETS: WCAG 44x44px minimo
preview_inspect({selector: ".toolbar-btn", styles: ["min-width", "min-height", "padding"]})
preview_inspect({selector: ".blocklyToolboxCategory", styles: ["min-height", "padding"]})
preview_inspect({selector: ".tab-button", styles: ["min-height", "padding"]})
preview_inspect({selector: ".step-nav-button", styles: ["min-width", "min-height"]})

// LAYOUT: dimensioni reali panel su iPad
preview_inspect({selector: ".elab-simulator__sidebar", styles: ["width", "min-width"]})
preview_inspect({selector: ".scratch-editor-container", styles: ["width", "height", "flex"]})
preview_inspect({selector: ".code-preview-panel", styles: ["width", "font-size"]})
```

#### Interazione Come un Utente REALE
NON limitarti a screenshot statici. INTERAGISCI come farebbe un bambino:
```
// Carica esperimento
preview_click per selezionare Vol3, Cap6, Esperimento Blink

// Seleziona modalita Passo Passo
preview_click({selector: "[data-mode='guided']"})

// Avanza step
preview_click({selector: ".step-next-button"})

// Click tab Blocchi
preview_click({selector: "[data-tab='scratch']"})

// Verifica workspace caricato via accessibility tree (NON screenshot)
preview_snapshot()

// Compila
preview_click({selector: ".compile-button"})

// Verifica stato compilazione
preview_snapshot()

// Play simulazione
preview_click({selector: ".toolbar-btn--play"})
```

#### Accessibility Snapshot > Screenshot per struttura
```
// preview_snapshot() restituisce l'accessibility tree:
// - Tutti gli elementi con ruolo, nome, stato
// - Verifica che tab "Blocchi" esista e sia cliccabile
// - Verifica che bottoni Avanti/Indietro siano presenti
// - Verifica che spiegazione step sia leggibile
// PREFERIRE snapshot per verifiche strutturali, screenshot per verifiche visive
```

#### Viewport Testing Matrix COMPLETA
```
OGNI Sprint deve testare a TUTTI questi viewport:
+------------------+--------+--------+----------------------------------+
| Device           | Width  | Height | Cosa Verificare                  |
+------------------+--------+--------+----------------------------------+
| Desktop Wide     | 1440   |  900   | BASELINE deve essere perfetto    |
| iPad Landscape   | 1180   |  820   | P0 bambini usano questo          |
| iPad Portrait    |  768   | 1024   | P0 caso peggiore, deve funz.     |
| Tablet Generic   | 1024   |  768   | P1 breakpoint intermedio         |
| Mobile (sanity)  |  375   |  812   | P2 non deve crashare             |
+------------------+--------+--------+----------------------------------+
```

---

### PROGRAMMATIC TOOL CALLING — ORCHESTRAZIONE AVANZATA

> Fonte: https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling
> "Reduces latency for multi-tool workflows and decreases token consumption by allowing
> Claude to filter or process data before it reaches the context window."

Il principio applicato a Claude Code: non fare 10 tool call sequenziali quando puoi farne 3 parallele.

#### Principio 1: Chiamate Parallele Indipendenti
Se due o piu tool call NON dipendono l'una dall'altra, lanciale TUTTE nello stesso messaggio:
```
// BUONO: 3 ricerche parallele in UN messaggio
Agent(Explore: "find all hardcoded hex colors in simulator/") +
Agent(Explore: "find all font-size < 14px in simulator/") +
Agent(Explore: "find all inline styles with color/background in simulator JSX")

// BUONO: multi-file read parallelo
Read(design-system.css) + Read(ElabSimulator.css) + Read(layout.module.css)

// BUONO: multi-file edit parallelo (file indipendenti)
Edit(file1.css, colorFix) + Edit(file2.css, fontFix) + Edit(file3.jsx, touchFix)

// SBAGLIATO: uno alla volta con attesa
Read(file1) aspetta Read(file2) aspetta Read(file3) aspetta
```

#### Principio 2: Pipeline Sequenziale per Dipendenze
Quando il risultato di un tool serve al prossimo, aspetta ma poi PARALLELIZZA il livello successivo:
```
PIPELINE:
  LIVELLO 1 (parallelo): [Read(5 file CSS), Grep("hardcoded color")]
  LIVELLO 2 (parallelo): [Edit(file1, fix1), Edit(file2, fix2), Edit(file3, fix3)]
  LIVELLO 3 (sequenziale): Bash("npm run build")
  LIVELLO 4 (parallelo): [preview_screenshot(), preview_console_logs()]
```

#### Principio 3: Explore Agents per Ricerche Massive
Usa Agent(subagent_type: "Explore") per ricerche che richiederebbero 5+ Grep/Glob.
Lanciane MULTIPLI in parallelo:
```
// Sprint 1: Audit estetico in 3 ricerche parallele
Agent(Explore: "count ALL hex color codes in src/components/simulator/ list each file:line:color")
Agent(Explore: "find ALL inline style with color background backgroundColor in simulator JSX")
Agent(Explore: "find ALL font-size declarations under 14px across simulator CSS files")
```

---

### TOOL SEARCH & DISCOVERY — USA LO STRUMENTO GIUSTO

> Fonte: https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool
> "Claude's ability to correctly pick the right tool degrades once you exceed 30-50 tools.
> Tool search surfaces a focused set of relevant tools on demand."

Hai DECINE di tool disponibili. Non usare sempre gli stessi.

#### Tool Selection Matrix
```
PROBLEMA                 → TOOL MIGLIORE
Trovare file/pattern     → Glob + Grep (paralleli)
Capire struttura codice  → Agent(Explore) piu veloce di Read multipli
Verificare visual        → preview_screenshot confronto PRIMA/DOPO
Misurare CSS reale       → preview_inspect(selector, styles[])
Verificare struttura     → preview_snapshot accessibility tree
Interagire come utente   → preview_click/fill + preview_snapshot
Errori runtime           → preview_console_logs(level: "error")
API calls debug          → preview_network(filter: "failed")
Simboli nel codice       → mcp__serena__find_symbol(name_path)
Refactoring sicuro       → mcp__serena__rename_symbol(name, new_name)
Regex replace in file    → mcp__serena__replace_content(regex mode)
Salvare contesto lungo   → mcp__serena__write_memory(topic)
Quality audit completo   → Skill: quality-audit
Cicli iterativi test     → Skill: ralph-loop
Creare skill on-demand   → Skill: skill-creator
```

---

### SKILL CREATOR DINAMICO — AUTOMATIZZA I PATTERN RIPETUTI

> Fonte: https://platform.claude.com/docs/en/agents-and-tools/tool-use/fine-grained-tool-streaming
> Le skill aggregano operazioni ripetute in singola invocazione, riducendo latenza.

NON creare skill all'inizio. Crea skill QUANDO ti accorgi di ripetere la stessa sequenza 3+ volte.

#### Filosofia: Skill = Automazione di Pattern Ripetuto
```
PATTERN DETECTION:
  Se fai la stessa sequenza 3 volte → FERMATI → crea skill
  Se un test richiede 5+ tool call ogni volta → crea skill
  Se la verifica e multi-step identica per N elementi → crea skill
```

#### Skill da Creare DURANTE la Sessione (NON prima)

**Scenario Sprint 1** — Verifichi colori per il terzo file:
→ CREA SKILL `color-palette-check`: trova TUTTI i colori fuori palette e suggerisce CSS var

**Scenario Sprint 2** — Testi Scratch su iPad per il terzo esperimento:
→ CREA SKILL `scratch-ipad-audit`: carica esperimento, testa workspace + touch + compile su 2 viewport

**Scenario Sprint 3** — Verifichi Passo Passo Scratch per il terzo esperimento:
→ CREA SKILL `passo-passo-scratch-verify`: testa flusso HW, transizione, Scratch per un esperimento

**Scenario Sprint 4** — Fai touch audit per il quinto selettore:
→ CREA SKILL `touch-target-audit`: data lista di selettori CSS, verifica >=44px e produce report

**Scenario Sprint 5** — Sei al secondo esperimento del Ralph Loop:
→ CREA SKILL `ralph-loop-viewport`: testa UN esperimento in TUTTE le modalita e viewport

#### Come Creare una Skill
```
1. Riconosci il pattern (3+ ripetizioni)
2. Usa: Skill("skill-creator:skill-creator")
3. Fornisci: Nome, Trigger words ITA+ENG, Workflow, Tool necessari
4. TESTA la skill IMMEDIATAMENTE
5. USALA per il RESTO dello Sprint
```

#### Regola Critica
Skill creata e MAI usata = SPRECO di contesto.
DEVI usarla almeno 2 volte. Se non la useresti 2+ volte, NON crearla.

---

### QUALITY AUDIT — BRUTALMENTE ONESTO

#### Audit Continuo (Mini-Audit a fine OGNI Sprint)
Non aspettare Sprint 5 per scoprire che qualcosa e rotto:
```
MINI_AUDIT = {
  1. npm run build → 0 errori?
  2. preview_screenshot a 3 viewport → confronto PRIMA/DOPO
  3. preview_console_logs(level: "error") → 0 errori?
  4. Conteggio regressioni: quante cose rotte?
  5. Score aggiornata per area toccata
}
Se QUALSIASI regressione → STOP → REVERT → non procedere
```

#### Quality Audit BRUTALE Finale (Sprint 5)
Esegui skill `quality-audit` con TUTTI questi controlli:

```
QUALITY_AUDIT = {
  // BUILD HEALTH
  npm_build_errors: 0,
  npm_build_warnings: "< 10",
  bundle_size_scratch: "~2MB (lazy)",

  // VISUAL CONSISTENCY
  hardcoded_colors_remaining: "< 20",     // era 150+ in S75
  css_variables_used: "100% nuovi stili",
  font_families_correct: "Oswald/OpenSans/FiraCode",
  font_size_minimum: "14px",
  contrast_ratio_minimum: "4.5:1",

  // TOUCH & ACCESSIBILITY
  touch_targets_44px: "0 violazioni",
  aria_labels_svgs: "21 da fixare (noto S75)",
  skip_to_content: "presente?",
  focus_visible: "presente?",

  // SCRATCH
  scratch_load_crash: "0/12 esperimenti",
  scratch_compile_pass: "12/12",
  scratch_side_by_side: "3/3 viewport",
  scratch_touch_ipad: "blocchi trascinabili?",

  // PASSO PASSO SCRATCH
  pp_hw_steps: "3/3 esperimenti",
  pp_transition_card: "appare?",
  pp_scratch_steps: "3/3 esperimenti",
  pp_explanations: "chiare per bambino?",
  pp_completion_dismiss: "auto-chiude?",

  // REGRESSIONI (ZERO TOLLERATE)
  experiments_loading: "15/15",
  three_modes: "GM/PP/Libero",
  wire_mode: "ON/OFF",
  circuit_sim: "Vol1/Vol2",
  avr_sim: "Vol3 compile+run",
  galileo: "non toccato, funziona?",

  // REGOLA ONESTA
  // Se FALLISCE → scrivi FAIL + motivo
  // Se PARZIALE → scrivi numero REALE
  // MAI scrivere PASS se non hai MISURATO con Chrome Control
}
```

#### Report Formato Obbligatorio
```markdown
## Sprint N: [Nome]
- Fix applicati: N
- File modificati: [lista]
- Test PASS: N/N (con dettagli)
- Test FAIL: [lista con motivo]
- Issues SKIP: [lista con motivo]
- Regressioni: 0 (o lista se > 0)
- Score prima: X.X → dopo: Y.Y
- Screenshot: [desktop] [iPad L] [iPad P]
```

---

### Skill Disponibili (usarle AL MOMENTO GIUSTO)
```
quality-audit    → OBBLIGATORIA a fine OGNI Sprint (mini) + Sprint 5 (completa)
ralph-loop       → Per cicli FIX-TEST-VALIDATE strutturati
skill-creator    → Per creare NUOVE skill on-demand (vedi sopra)
arduino-simulator → Se si tocca il compilatore AVR
volume-replication → Se si verificano posizioni componenti
```

### MCP Tools (usarli strategicamente)
```
Serena: find_symbol, search_for_pattern, replace_content, write/read_memory
Preview: screenshot, snapshot, inspect, click, fill, resize, console_logs, network
```

### Parallel Agents (per ricerche massive)
```
Lanciare TUTTI INSIEME in UN SINGOLO messaggio:
Agent(Explore: "find all CSS files with hardcoded colors in simulator")
Agent(Explore: "find all touch targets < 44px in simulator components")
Agent(Explore: "find all font-size declarations < 14px in simulator")
```

---

## ═══ SUCCESS BRIEF ════════════════════════════════════════════════

### Tipo di output
Simulatore educativo web (React/Vite) in produzione su https://www.elabtutor.school

### Reazione dell'utente (Andrea)
Deve guardare il simulatore e pensare: "Finalmente sembra un prodotto finito, non un prototipo."
Deve testare su iPad e pensare: "Un bambino può usarlo senza il mio aiuto."

### Does NOT sound like
- ❌ Prototipo con colori random
- ❌ "Funziona ma è brutto"
- ❌ "Su iPad si vede ma non si usa"
- ❌ Scratch con blocchi microscopici su tablet

### Success means
- Il simulatore ha un look&feel coerente e professionale
- I blocchi Scratch su iPad sono grandi, leggibili, toccabili
- Il Passo Passo Scratch spiega COSA fa ogni blocco come lo spiegherebbe una maestra
- ZERO regressioni: tutto ciò che funzionava prima funziona ancora

### KPI Quantitativi
- Colori hardcoded: 150+ → **< 20**
- Estetica score: 5.5 → **≥ 8.0**
- iPad score: 5.5 → **≥ 7.5**
- Scratch score: 9.5 → **10.0**
- Touch targets < 44px: **0 violazioni**
- Font < 14px: **0 violazioni**
- Regressioni: **0**
- Build errors: **0**

### Il Prodotto Risultante
Un bambino di 10 anni con un iPad in una scuola italiana può:
1. Aprire elabtutor.school → Simulatore → scegliere "LED Blink"
2. Selezionare "Passo Passo" → montare il circuito pezzo per pezzo
3. Vedere la card "✅ Circuito pronto! Passiamo al codice →"
4. Toccare "🧩 Inizia a programmare"
5. Leggere: "Trascina il blocco 'Imposta Pin' — dice ad Arduino dove è collegato il LED"
6. Trascinare il blocco con il DITO — il blocco si aggancia perfettamente
7. Andare avanti: "Aggiungi 'Scrivi Pin ALTO' — accende il LED!"
8. Completare tutti gli step → "🎉 Complimenti! Compila e prova!"
9. Premere Play → vedere il LED lampeggiare
10. Sentirsi orgoglioso di aver programmato un Arduino

QUESTO è il metro di successo.

---

## ═══ ANTI-PATTERN DA EVITARE ═════════════════════════════════════

### Dalle Session 84-85 (ERRORI DA NON RIPETERE)

1. **Loop infinito debug** (S84): 40 min su auto-collapse. → Regola 10 min.
2. **Screenshot tab sbagliato** (S84): Tab Manuale invece di Simulatore. → SEMPRE verificare tab.
3. **Edit durante test** (S84): HMR resettava state. → Edit → Build → Test.
4. **Passo Passo completion panel persiste** (S85): Panel resta visibile e blocca UI. → Implementare auto-dismiss timeout o pulsante "Chiudi".
5. **React state batching** (S85): Click rapidi sincroni non avanzano step. → Async con `await wait(150)`.
6. **Page reload perde navigation** (S85): Reload porta su Dashboard. → Re-navigate dopo reload.

### Pattern Generali

7. **Riscritture massive**: Non riscrivere NewElabSimulator da zero (3884 righe). Fix chirurgici.
8. **Toccare engine senza causa**: CircuitSolver, PlacementEngine, pinComponentMap → solo se necessario.
9. **Score gonfiati**: Se iPad e ancora 6/10, scrivere 6/10. Non 8/10. MAI.
10. **Modificare posizioni componenti**: experiments-vol1/2/3.js posizioni sono verificate col libro fisico.

### Anti-Pattern di Onesta (I PEGGIORI)

11. **"Dovrebbe funzionare"**: Se non hai fatto screenshot/inspect, NON puoi dire PASS.
12. **"Ho migliorato l'estetica"**: Se non mostri PRIMA/DOPO con misure reali, non e verificato.
13. **"Touch targets adeguati"**: Se non hai fatto preview_inspect con min-width/min-height, non sai.
14. **"Funziona su iPad"**: Se non hai fatto preview_resize + screenshot + interact, non lo sai.
15. **"Nessuna regressione"**: Se non hai testato le 3 modalita sui 3 viewport, non puoi dirlo.
16. **Omettere i FAIL**: Se 2 test su 10 falliscono, il report DEVE dire 8/10 FAIL 2. Non "quasi tutto OK".

---

## ═══ CONVERSATION STYLE ═══════════════════════════════════════════

### Output
- **Breve e diretto**. Non spiegare cosa è una CSS variable. Mostra il codice.
- Ogni fix: 1 riga contesto → codice → 1 riga risultato
- Score card aggiornata a fine OGNI Sprint
- Onestà BRUTALE

### Metodo di Lavoro
```
SPRINT N:
  1. Leggi i file necessari (Tier 2 per Sprint specifico)
  2. Screenshot BASELINE (PRIMA di toccare)
  3. Identifica top-3 issues
  4. Fix 1 → Build → Test → Log
  5. Fix 2 → Build → Test → Log
  6. Fix 3 → Build → Test → Log
  7. Screenshot CONFRONTO (DOPO)
  8. Mini-audit Sprint: score aggiornata
  9. Se BLOCCATO → SKIP → Sprint N+1
```

---

## ═══ ALIGNMENT ════════════════════════════════════════════════════

### Chi è l'utente?
Andrea Marro — autore di ELAB Tutor, simulatore educativo per bambini italiani (primaria/media). Prodotto IN PRODUZIONE. Ogni bug impatta studenti reali. Andrea è esigente, vuole qualità e onestà.

### Le 3 regole che contano di più per questa sessione
1. **ZERO REGRESSIONI** — tutto ciò che funziona DEVE continuare a funzionare
2. **CSS Variables per TUTTO** — niente piu colori hardcoded
3. **Scratch iPad-first** — blocchi grandi, toccabili, comprensibili per un bambino

### Cosa NON fare
- Non riscrivere da zero — 69 esperimenti funzionanti, AI 10/10, Vision 10/10
- Non cambiare la palette — usare quella ESISTENTE, solo applicarla ovunque
- Non toccare nanobot/AI — Galileo funziona perfettamente
- Non toccare posizioni componenti negli esperimenti

---

## ═══ STARTUP SEQUENCE ═══════════════════════════════════════════

All'inizio della sessione, esegui ESATTAMENTE questa sequenza:

```
1. LEGGI: MEMORY.md (contesto progetto)
2. LEGGI: Tier 1 files (design-system.css, ElabSimulator.css, layout.module.css, NewElabSimulator.jsx)
3. START: preview_start("elab-builder-dev")
4. NAVIGATE: preview_eval → http://localhost:5173/#tutor
5. BASELINE DESKTOP: preview_resize(1440, 900) → preview_screenshot
6. BASELINE iPAD L: preview_resize(1180, 820) → preview_screenshot
7. BASELINE iPAD P: preview_resize(768, 1024) → preview_screenshot
8. AUDIT COLORI: Agent(Explore: "count hardcoded colors in simulator CSS and JSX")
9. IDENTIFY: Top-5 worst aesthetic issues dalle screenshot
10. BEGIN: Sprint 1
```

NON chiedere domande. NON chiedere conferme. ESEGUI.
L'utente vuole RISULTATI, non discussioni.

---

*Mega-prompt Session 86 — Andrea Marro / Claude — basato su Session 85*
*Keywords: ESTETICA, CSS VARIABLES, SCRATCH iPAD, PASSO PASSO DEDICATO, TOUCH TARGETS, LEGGIBILITA'*
*Struttura: Manifesto · Task · Context · Architecture · Sprint Plan (5) · Rules · Tools · Success · Anti-patterns · Conversation · Alignment · Startup*
*Basato su: lezioni Session 85 (layout +2.5, zero regressioni), Session 76 (audit 150+ colors), Session 81 (Scratch architecture)*
