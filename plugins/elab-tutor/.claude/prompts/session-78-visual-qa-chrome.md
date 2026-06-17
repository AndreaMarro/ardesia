# SESSION 78 — QA VISUALE + SCRATCH DEEP ANALYSIS: CHROME CONTROL + SCREENSHOT EVIDENCE

---

## 🔴 TASK

Voglio **verificare visivamente in Chrome, analizzare in profondita, fixare e perfezionare** l'intero stack Scratch/Blockly e le modifiche delle Sessioni 76-77 (design tokens, CSS migration, iPad layout, JSX styles, Scratch XML) in modo che:
- Ogni blocco Scratch si carichi correttamente nel Blockly editor
- Il codice Arduino generato sia corretto e compilabile
- Il Simon Game funzioni end-to-end con i 4 step progressivi di Scratch
- L'editor Scratch sia esteticamente perfetto (tema ELAB dark, categorie colorate, responsive)
- iPad sia utilizzabile con il pannello Blockly
- Zero errori console, zero regressioni

---

## 🔵 CONTEXT FILES

Prima di iniziare, leggi COMPLETAMENTE questi file — sono il tuo terreno di gioco:

1. **`src/styles/design-system.css`** — TUTTI i design tokens. Ogni colore DEVE provenire da qui
2. **`src/data/experiments-vol3.js`** — 12 scratchXml constants: 7 nuovi (BLINK, PIN5, SIRENA, SEMAFORO, PULSANTE, SERIAL, SERVO) + 5 Simon (STEP4, STEP16, STEP28, FULL × 2)
3. **`src/components/simulator/panels/ScratchEditor.jsx`** — 386 righe. ELAB_THEME (15 blockStyles), TOOLBOX_XML (10 categorie), ELAB_BLOCKLY_CSS (120+ righe override), Blockly.inject con Zelos renderer. Gestisce: inject, XML parse, workspace reload su initialCode change, onChange→arduinoGenerator
4. **`src/components/simulator/panels/scratchBlocks.js`** — 18 custom block definitions (arduino_base, pin_mode, digital_write/read, analog_write/read, delay, millis, tone, no_tone, servo_attach/write/read, serial_begin/print, variable_set/get, map, random)
5. **`src/components/simulator/panels/scratchGenerator.js`** — Blockly→Arduino C++ generator. INCLUDE: controls_if (riga 124, usa 'ELSE'), controls_for (riga 198, SOLO `<=`), controls_repeat_ext (riga 182), controls_whileUntil. LIMITAZIONE: nessun support per functions/procedures custom
6. **`src/components/simulator/NewElabSimulator.jsx`** — Orchestratore. Riga 199: `editorMode` state ('arduino'|'scratch'). Riga 1474: gate AVR. Riga 1551: carica scratchXml da experiment o localStorage. Riga 293-305: sync Scratch con buildStep. Riga 3636-3718: render condizionale ScratchEditor
7. **`MEMORY.md`** — stato progetto completo, palette, known issues

---

## 🟢 REFERENCE

Regole estratte dal codebase e dalle sessioni precedenti:

### Design Rules
- **Always** usare `var(--color-*)` per ogni colore — ZERO hex hardcoded
- **Always** palette: Navy `#1E4D8C`, Lime `#7CB342`, Vol2 `#E8941C`, Vol3 `#E54B3D`
- **Never** usare `#558B2F` (vecchio accent) o `#C77700` (vecchio vol2)
- **Always** `data-theme="light"` forzato su `<html>`
- **Always** touch targets >= 44x44px, font-size >= 12px per label

### Scratch Architecture Rules
- **Always** `arduino_base` come blocco root con `deletable="false"` e posizione `x="40" y="30"`
- **Always** blocchi chained via `<next><block>...</block></next>` annidati, chiusure in ordine inverso
- **Always** shadow blocks per valori default: `<shadow type="math_number"><field name="NUM">X</field></shadow>`
- **Never** usare `controls_for` per loop decrescenti (genera solo `varName <= to`)
- **Never** creare funzioni custom (scratchGenerator non supporta procedures)
- **Always** `controls_if` con `<mutation else="1"/>` per il ramo else, statement name `"ELSE"`
- **Always** verificare che ScratchEditor faccia `Blockly.Xml.domToWorkspace()` senza errori parser

### Simon Game Rules
- **Always** 4 Scratch progressivi nei buildSteps: STEP4 (1 LED), STEP16 (2 LED+2 BTN), STEP28 (4 LED+4 BTN), FULL (gioco completo)
- **Always** pin mapping: LED D9(rosso)/D10(verde)/D11(blu)/D12(giallo), BTN D3/D5/D6/D13 con INPUT_PULLUP
- **Never** saltare test di tutti e 4 i pulsanti — ciascuno deve funzionare

### Fix Rules
- **Never** modificare CircuitSolver, AVR engine, o experiment data structures
- **Never** toccare nanobot/server.py
- **Never** aggiungere dipendenze npm
- **Always** fix minimale con design tokens

---

## 🟡 SUCCESS BRIEF

**Tipo di output**: Report QA visuale con screenshot evidence — 35 test cases
**Reazione attesa**: Guardando il report, devo vedere screenshot BEFORE/AFTER di ogni fix. Nessun dubbio. Solo prove.
**NON deve sembrare**: Un audit teorico. "Controllato" senza screenshot = non fatto.
**Il successo significa**:
- **35/35 test PASS** (o FAIL→fix→PASS con evidence)
- **Scratch Deep**: 8/8 XML caricano, 8/8 codici Arduino corretti, editor responsive, tema dark perfetto
- **Simon**: 5/5 test dedicati PASS (load, buildSteps progressivi, codice, gameplay, layout)
- **iPad**: 3/3 viewport (768x1024, 1024x768, 1180x820) con Blockly panel usabile
- **Console**: 0 errori JS runtime su TUTTI i test
- **Deploy** finale su Vercel con smoke test

---

## 🔵 RULES — Superpowers OBBLIGATORI

Ogni superpower va invocato con la Skill tool al momento giusto. NON sono opzionali.

### `/systematic-debugging` — PER OGNI BUG
1. Screenshot del problema (evidenza)
2. `read_page` / `preview_inspect` → CSS/JSX responsabile
3. File e riga esatta (Read tool)
4. Classifica: P0 / P1 / P2
5. Fix minimale
6. Screenshot AFTER → conferma PASS

### `/verification-before-completion` — PRIMA DI OGNI PASS
MAI dichiarare PASS senza:
1. Screenshot o accessibility snapshot che lo prova
2. Console check: 0 errori nuovi
3. Se fix applicato: `npm run build` 0 errors

### `/dispatching-parallel-agents` — 4 AGENT PARALLELI
- **Agent ALPHA**: FASE 2 (Design tokens + CSS) — viewport desktop
- **Agent BETA**: FASE 3 (iPad layout con Blockly) — 3 viewport
- **Agent GAMMA**: FASE 4 (Scratch XML 8 esperimenti + codice generato) — test sequenziali
- **Agent DELTA**: FASE 5 (Simon Game 5 test end-to-end)

### `/test-driven-development` — CRITERI PRIMA DEI TEST
Per ogni test, scrivi PASS/FAIL criteria PRIMA di eseguirlo.

### `/quality-audit` — FINE SESSIONE
Audit complessivo: font sizes, touch targets, a11y, console, bundle size.

---

## 🟣 CONVERSATION

**NON iniziare subito.** Prima usa `AskUserQuestion` per:
1. Quale viewport iPad prioritizzare? (dispositivo reale dell'utente)
2. Testare solo simulatore o anche login flow?
3. Esperimenti specifici che hanno dato problemi di recente?

Dopo le risposte, procedi.

---

## 🔴 PLAN — 5 step + sotto-fasi

Elenca prima le **3 regole dal context file piu importanti**:
1. `_______________`
2. `_______________`
3. `_______________`

---

### Step 1: SETUP + BASELINE (5 min)
- Chrome → `https://www.elabtutor.school`
- Console errors baseline
- Network check: 0 errori 404
- Verifica lazy-loading ScratchEditor chunk (~2MB)

### Step 2: DESIGN SYSTEM + CSS (15 min) — Agent ALPHA
**TEST-01**: Palette `:root` → `--color-accent=#7CB342`, `--color-vol2=#E8941C` (inspect computed)
**TEST-02**: Font variables → `--font-sans`, `--font-display`, `--font-mono`
**TEST-03**: Shadow/radius → border-radius 6/10/14/20px, box-shadow dal design system
**TEST-04**: ElabSimulator.css → toolbar/panels usano `var(--color-*)` non hex
**TEST-05**: Contrasto testo → ratio >= 4.5:1, label >= 12px
**TEST-06**: Hover/focus/disabled states visivamente distinti

### Step 3: iPAD LAYOUT + BLOCKLY PANEL (20 min) — Agent BETA
**TEST-07**: iPad Portrait 768x1024 → screenshot. Canvas visibile, toolbar no overflow, Blockly panel accessibile
**TEST-08**: iPad Landscape 1024x768 → breadboard leggibile, Blockly non schiaccia canvas
**TEST-09**: iPad Pro 1180x820 → canvas >= 50%, Blockly width ragionevole
**TEST-10**: Touch targets iPad → bottoni >= 44px, slider >= 44px

### Step 4: SCRATCH DEEP ANALYSIS + FIX (40 min) — Agent GAMMA

#### 4A: Editor Blockly — Analisi Visuale (ogni screenshot)
**TEST-11**: ScratchEditor mount → workspace dark (#1E2530), toolbox dark (#161B22), grid visibile (#2a3040)
**TEST-12**: 10 categorie toolbox → Logica(blu), Cicli(lime), Matematica, Variabili(rosso), Testo(teal), I/O(teal Arduino), Suono(viola), Servo(verde), Tempo(arancio), Seriale(grigio scuro). Ognuna con icona emoji + colore corretto
**TEST-13**: Block rendering Zelos → angoli arrotondati, testo bianco leggibile, dropdown visibili
**TEST-14**: Zoom/pan/trashcan → zoom wheel funziona, drag workspace, trashcan visibile e funzionante

#### 4B: XML Loading — 8 esperimenti
Per ognuno: naviga → code editor auto-open → tab Scratch → **screenshot Blockly** → tab Arduino → **screenshot codice** → console 0 errori

**TEST-15**: LED Blink (pin 13) → `BLINK_SCRATCH`
- Blocchi: arduino_base → SETUP: pin_mode(13,OUTPUT) → LOOP: dW(13,H)→delay(1000)→dW(13,L)→delay(1000)
- Codice: `pinMode(13, OUTPUT)` in setup, `digitalWrite(13, HIGH/LOW)` + `delay(1000)` in loop

**TEST-16**: Pin D5 → `PIN5_SCRATCH`
- Come Blink ma pin 5

**TEST-17**: Sirena 2 LED (pin 10,9) → `SIRENA_SCRATCH`
- Blocchi: 2 pin_mode in SETUP, 6 blocchi alternati in LOOP
- Codice: pin 10 e 9 alternano con delay(200)

**TEST-18**: Semaforo 3 LED (pin 5,6,3) → `SEMAFORO_SCRATCH`
- Blocchi: 3 pin_mode in SETUP, 12 blocchi in LOOP (3 stati × 4 blocchi)
- Codice: verde(3s)→giallo(1s)→rosso(3s)

**TEST-19**: Pulsante+LED (pin 6,10) → `PULSANTE_SCRATCH`
- Blocchi: controls_if con mutation else="1", logic_compare EQ, digitalRead(6)==0
- Codice: `if (digitalRead(6) == 0) { dW(10,H) } else { dW(10,L) }`

**TEST-20**: analogRead Serial (A0) → `SERIAL_SCRATCH`
- Blocchi: serial_begin(9600), variable_set + analog_read, serial_print, delay(200)
- Codice: `Serial.begin(9600)`, `int valore = analogRead(A0)`, `Serial.println(valore)`

**TEST-21**: Servo Sweep (pin 9) → `SERVO_SCRATCH`
- Blocchi: servo_attach(9) in SETUP, servo_write(0)→delay→servo_write(180)→delay in LOOP
- Codice: `servo.attach(9)`, `servo.write(0/180)`

**TEST-22**: Scratch persistence localStorage
- Modifica un blocco (es: cambia delay da 1000 a 500)
- Cambia esperimento e torna → workspace deve ricaricare la modifica salvata
- `localStorage.getItem('elab_scratch_v3-cap6-blink')` non null

#### 4C: Code Generation — Correttezza
**TEST-23**: Per ogni esperimento, cattura il codice Arduino generato e verifica:
- `#include` corretti (Servo.h per servo)
- `setup()` e `loop()` presenti e corretti
- Variabili dichiarate con tipo `int`
- Nessun syntax error nel codice generato
- Indentazione coerente

#### 4D: Scratch su iPad
**TEST-24**: Blockly editor su iPad 1024x768
- Toolbox visibile e scrollabile
- Blocchi trascinabili (touch-action: none su workspace)
- Flyout non esce dal viewport
- Zoom pinch funziona

### Step 5: SIMON GAME — 5 TEST DEDICATI (25 min) — Agent DELTA

**TEST-25: Simon Caricamento**
- Naviga a `v3-extra-simon`
- Screenshot: 4 LED colori diversi + 4 pulsanti visibili
- Code editor auto-open (simulationMode: 'avr')
- Tab Scratch: `SIMON_SCRATCH_FULL` caricato
- Console: 0 errori

**TEST-26: Simon BuildSteps — Scratch Progressivo**
- Modalita "Passo Passo"
- Step 4 → screenshot Blockly → `SIMON_SCRATCH_STEP4` = solo 1 LED rosso con pin_mode + dW + delay
- Step 16 → screenshot → `SIMON_SCRATCH_STEP16` = 2 LED (rosso+verde) + 2 pulsanti + logica if
- Step 28 → screenshot → `SIMON_SCRATCH_STEP28` = 4 LED + 4 pulsanti + sequenza completa
- Completa → `SIMON_SCRATCH_FULL` = gioco completo con random + array sequenza
- **CRITICO**: Ogni step DEVE avere PIU blocchi del precedente. Se non crescono → FAIL

**TEST-27: Simon Codice Arduino**
- Con FULL caricato, tab Arduino
- Verifica:
  - 4× `pinMode(X, OUTPUT)` per LED (D9,D10,D11,D12)
  - 4× `pinMode(X, INPUT_PULLUP)` per BTN (D3,D5,D6,D13)
  - `digitalWrite` + `digitalRead` nella logica
  - `random()` per generare sequenza
  - `delay()` per timing LED
- Screenshot codice

**TEST-28: Simon Gameplay**
- Play ▶ → simulazione AVR parte
- Almeno 1 LED si accende (sequenza iniziale)
- Screenshot simulazione running
- Console: 0 errori durante esecuzione

**TEST-29: Simon Layout Breadboard**
- Screenshot breadboard con componenti
- Stagger pattern verificato:
  - R1+LED1(rosso) b/d 16-24
  - R2+LED2(verde) e/d 22-30
  - R3+LED3(blu) g/h 16-24
  - R4+LED4(giallo) i/h 22-30
- Fili: rosso→D9, verde→D10, blu→D11, giallo→D12
- Pulsanti: straddle e-f, colonne 17/20/25/28

### Step 6: CROSS-CUTTING + REPORT (15 min)

**TEST-30**: Responsive 1440→1024→768→375 senza layout jumps
**TEST-31**: Dark mode safety → `data-theme="light"`, colori OK
**TEST-32**: Galileo AI → "ciao" → risposta, 0 CORS errors
**TEST-33**: Build → `npm run build` 0 errors
**TEST-34**: Deploy → `npx vercel --prod --yes`
**TEST-35**: Smoke test post-deploy → screenshot produzione

---

## 🟠 ALIGNMENT

Solo dopo allineamento, comincia.

### Formato report per ogni test:
```
## TEST-XX: [Nome]
- Viewport: [dim]
- Screenshot BEFORE: [id]
- Criterio PASS: [cosa deve succedere]
- Risultato: PASS ✅ / FAIL ❌
- Se FAIL: `/systematic-debugging` → fix → `/verification-before-completion` → screenshot AFTER
```

### Fix Protocol:
1. `/systematic-debugging` → screenshot + inspect + file:riga + classifica P0/P1/P2
2. Fix minimale con design tokens
3. `/verification-before-completion` → build + screenshot AFTER + console 0
4. Commit batch: `git commit -m "fix(simulator): [AREA] visual QA — N issues"`

### Report finale:
```markdown
# Session 78 — Visual QA + Scratch Deep Analysis

## Summary
- Tests: XX/35
- PASS: XX | FAIL fixed: XX | FAIL remaining: XX

## Scorecard
| Area | Score | Tests |
|------|-------|-------|
| Design System | X/6 | TEST 01-06 |
| iPad Layout | X/4 | TEST 07-10 |
| Scratch Editor | X/4 | TEST 11-14 |
| Scratch XML Load | X/8 | TEST 15-22 |
| Scratch Code Gen | X/1 | TEST 23 |
| Scratch iPad | X/1 | TEST 24 |
| Simon Game | X/5 | TEST 25-29 |
| Cross-Cutting | X/6 | TEST 30-35 |

## Screenshots Evidence
[Lista completa]

## Fixes Applied
[file:riga — before → after]

## Deploy
- Build: PASS/FAIL
- URL: https://www.elabtutor.school
- Smoke: PASS/FAIL
```
