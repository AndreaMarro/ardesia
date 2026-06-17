# ELAB TUTOR TOTAL AUDIT — Debug, UX, Visual, Responsive, Scratch, Circuit Stress

---

## TASK

Voglio un **audit totale end-to-end** di ELAB Tutor (https://www.elabtutor.school) cosi' che **ogni singolo bug, regressione, problema grafico, di usabilita', di leggibilita' e di funzionalita' venga trovato, catalogato e classificato per gravita'** — SENZA toccare una riga di codice.

Il target e' ESCLUSIVAMENTE il simulatore ELAB Tutor su https://www.elabtutor.school — login, dashboard, simulatore, editor, Scratch, Galileo chat, tutto cio' che vive su Vercel.

Il risultato finale e' duplice:
1. Un **REPORT** esaustivo con ogni problema trovato
2. Un **PROMPT di remediation** strutturato per risolvere tutto senza regressioni

---

## CONTEXT FILES

Prima di rispondere, leggi completamente questi file:

- `MEMORY.md` — architettura, palette, scores attuali, known issues, deploy commands
- `src/components/simulator/NewElabSimulator.jsx` — simulatore principale (~3600 righe)
- `src/components/simulator/panels/ComponentDrawer.jsx` — pannello Passo Passo
- `src/components/simulator/panels/ScratchEditor.jsx` — editor Blockly/Scratch
- `src/components/simulator/panels/CodeEditorCM6.jsx` — editor Arduino C++
- `src/styles/ElabSimulator.css` — stili simulatore
- `src/styles/design-system.css` — CSS vars, palette, font stack
- `src/data/experiments-vol3.js` — esperimenti Vol3 con Scratch XML
- `src/data/experiments-vol2.js` — esperimenti Vol2
- `src/data/experiments.js` — esperimenti Vol1
- `src/components/simulator/panels/scratchGenerator.js` — generatore C++ da Blockly
- `src/components/simulator/panels/scratchBlocks.js` — definizioni blocchi custom
- `src/components/chat/ElabTutorV4.jsx` — chat Galileo
- `src/components/simulator/controls/ControlBar.jsx` — toolbar pulsanti
- `src/components/simulator/panels/SerialMonitor.jsx` — monitor seriale
- `src/App.jsx` — routing, layout globale

---

## REFERENCE — Cosa funzionava e cosa e' regredito

Scores di riferimento da MEMORY.md (Session 87):

| Area | Score | Soglia minima |
|------|-------|---------------|
| Simulatore funzionalita' | 9.8/10 | Non scendere |
| Simulatore estetica | 6.5/10 | Deve salire |
| iPad | 7.0/10 | Deve salire |
| Scratch | 10.0/10 | Non scendere |
| Responsive/A11y | 7.5/10 | Deve salire |
| AI Integration | 10.0/10 | Non scendere |
| Code Quality | 9.8/10 | Non scendere |

**Regole dal reference:**
- ALWAYS verifica che ogni funzionalita' che aveva score alto non sia regredita
- ALWAYS confronta il comportamento attuale con il comportamento atteso documentato in MEMORY.md
- NEVER segnare come "bug" qualcosa che e' un known issue gia' documentato (P2/P3 list in MEMORY.md)
- ALWAYS distinguere tra: BUG NUOVO, REGRESSIONE, KNOWN ISSUE, MIGLIORAMENTO ESTETICO
- NEVER modificare codice durante l'audit — solo osservare e annotare
- ALWAYS includere screenshot o snapshot accessibility per ogni bug trovato
- ALWAYS testare sia in modalita' sandbox che guided (Passo Passo)
- NEVER saltare un esperimento — testarli tutti e 12 AVR + tutti Vol1/Vol2

---

## SUCCESS BRIEF

**Tipo di output**: Report tecnico + Prompt di remediation
**Lunghezza**: Report senza limiti (completezza > brevita'). Prompt max 2000 parole.
**Reazione del destinatario**: "Finalmente so TUTTO quello che non va e ho un piano per fixare tutto"
**NON deve sembrare**: Generico, superficiale, "ho dato un'occhiata veloce"
**Successo significa**: ZERO bug nascosti rimasti. Ogni problema ha severity, screenshot, repro steps, e una voce nel prompt di remediation.

---

## RULES — Vincoli inviolabili

Leggi MEMORY.md completamente. Questi vincoli sono assoluti:

1. **ZERO REGRESSIONI**: Se qualcosa funzionava (score >=9), deve funzionare ancora. Se trovi una regressione, e' automaticamente P0.
2. **Palette ufficiale**: Navy `#1E4D8C`, Lime `#7CB342`, Vol1 verde `#7CB342`, Vol2 arancione `#E8941C`, Vol3 rosso `#E54B3D`. Qualsiasi colore fuori palette e' un bug estetico.
3. **Font stack**: Oswald (display) + Open Sans (body) + Fira Code (code). Qualsiasi font diverso e' un bug.
4. **Touch targets**: Ogni elemento cliccabile deve essere >=44px su mobile/iPad. Sotto = bug A11y.
5. **Force-light theme**: `data-theme="light"` deve essere sempre attivo. Dark mode = bug.
6. **Scratch = C++ pari dignita'**: Side-by-side layout (60%/40%), compilazione funzionante, tutti 12 AVR experiments con tab Blocchi.
7. **Passo Passo**: Pannello destro, trascinabile, non deve coprire componenti critici.
8. **iPad landscape (1180x820)**: Toolbar non deve overflow. Touch targets >=44px.
9. **iPad portrait (768x1024)**: Slide-over panel, Scratch vertical stack.
10. **NO secrets in output**: Non mostrare env vars, API keys, tokens.
11. **Build mode selettore UNICO**: Solo la barra grande in NewElabSimulator.jsx. Se appare un secondo selettore, e' un bug.
12. **Componenti filtrati per volume**: Selezionando un volume, la palette mostra SOLO i componenti di quel volume (cumulativi).

---

## CONVERSATION — Protocollo di lavoro

**NON iniziare a testare subito.** Segui questa sequenza:

### FASE 0 — Setup (prima di qualsiasi test)
1. Crea una skill con `skill-creator` chiamata **"elab-total-audit"** che definisca:
   - Checklist di 50+ punti di verifica per ogni area del simulatore
   - Template per report bug (severity/repro/expected/actual/screenshot)
   - Matrice dispositivi x esperimenti x funzionalita'
2. Crea una skill **"elab-visual-regression"** per:
   - Confronto visuale con scores MEMORY.md
   - Screenshot comparison workflow
   - Responsive breakpoint checklist (375px, 768px, 1024px, 1180px, 1366px, 1920px)
3. Leggi TUTTI i context files elencati sopra
4. Apri Chrome su https://www.elabtutor.school con `Claude in Chrome`

### FASE 1 — Brainstorming Angoli di Test (10 round)

**Round 1 — User Personas:**
- Bambino 10 anni (primo accesso, iPad, tocca tutto, non legge istruzioni)
- Insegnante (desktop 1920x1080, naviga veloce tra esperimenti, vuole mostrare alla classe)
- Studente (laptop 1366x768, usa Scratch + Arduino, prova tutti gli esperimenti)
- Utente iPad (1180x820 landscape, 768x1024 portrait, tocca e trascina)
- Utente ipovedente (zoom 200%, screen reader, alto contrasto)
- Utente impaziente (clicca 3 volte se non succede nulla entro 1 secondo)

**Round 2 — Stress Sequences:**
- Cambia volume rapidamente 5 volte (Vol1->Vol2->Vol3->Vol1->Vol2)
- Apri/chiudi pannelli in sequenza rapida (editor, chat, serial monitor, component drawer)
- Resize finestra durante simulazione attiva
- Cambia esperimento durante compilazione in corso
- Apri Scratch, switch Arduino, torna Scratch, compila, switch Arduino, compila
- Piazza 20 componenti, collega tutto con fili, rimuovi tutto, undo 20 volte, redo 20 volte
- Attiva wire mode, clicca 50 punti casuali sulla breadboard, disattiva
- Apri Passo Passo, avanza 10 step, trascina pannello, torna indietro 10 step
- Play simulazione -> cambia esperimento -> play nuovo esperimento -> pause -> reset

**Round 3 — Edge Cases:**
- Testo lunghissimo in Serial Monitor (stampa continua per 30 secondi)
- Esperimento senza scratchXml in modo Scratch (deve mostrare arduino_base default)
- Zoom browser 50%, 75%, 100%, 125%, 150%, 200%
- Orientamento landscape <-> portrait durante uso (iPad simulation)
- Doppio click rapido su ogni pulsante della toolbar
- Tab rapido tra pannelli (Circuito, Arduino C++, Blocchi)
- Scroll su pannello Passo Passo con molti step (es. Simon 33 step)
- Compila codice vuoto (solo setup/loop vuoti)
- Compila codice con errori intenzionali

**Round 4 — Visual Consistency:**
- Ogni pannello usa la stessa famiglia di border-radius?
- Ombre (box-shadow) consistenti o mischiate?
- Icone tutte dello stesso set (Lucide? FontAwesome? Mix?)?
- Hover states: tutti i bottoni hanno un feedback visivo coerente?
- Active/pressed states: colore consistente?
- Disabled states: grigio uniforme o variabile?
- Focus ring visibile su keyboard navigation?
- Separatori/divider: stile uniforme o random?
- Header di sezione: stesso font-weight, size, color?

**Round 5 — Typography & Leggibilita':**
- Font size minimo in ogni area (non sotto 12px per body text)
- Line-height adeguato (almeno 1.4 per testo, 1.2 per titoli)
- Contrasto testo/sfondo WCAG AA (4.5:1 per testo normale, 3:1 per grande)
- Testo troncato con ellipsis dove non serve (info persa)
- Testo che overflow il contenitore
- Label dei pulsanti toolbar leggibili a ogni viewport
- Codice nell'editor leggibile (font size, syntax highlighting coerente)
- Numeri di riga nell'editor visibili e allineati
- Testo nel pannello Passo Passo leggibile anche con step lunghi

**Round 6 — Interaction Patterns:**
- Drag & drop componenti: feedback visivo durante il drag?
- Wire drawing: linea visibile durante il tracciamento? Colore chiaro?
- Click su componente: selezione visibile? Bordo/highlight?
- Doppio click: comportamento diverso dal singolo click? Consistente?
- Right-click: menu contestuale? O nessuna azione?
- Long-press (touch): simulato come right-click? O nessuna azione?
- Pinch-to-zoom: disabilitato sul canvas? (dovrebbe essere — touch-action:none)
- Scroll: la rotella del mouse zoom il canvas o scrolla la pagina?
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo), Delete (rimuovi) funzionano?

**Round 7 — State Management & Transitions:**
- Cambio esperimento: lo stato precedente viene pulito completamente?
- Cambio volume: i componenti della palette si aggiornano immediatamente?
- Cambio sandbox<->guided: lo stato del circuito si resetta correttamente?
- Play->pause->play: la simulazione riprende dallo stato corretto?
- Compilazione fallita -> fix errore -> ricompila: funziona senza reload?
- Chiudi editor -> riapri: il codice e' preservato?
- Chiudi chat Galileo -> riapri: la history e' preservata?
- Undo dopo clearAll: TUTTO torna? Componenti + fili + posizioni?
- Cambio tab (Circuito/Arduino/Blocchi) durante simulazione attiva

**Round 8 — Error Handling & Feedback:**
- Errore di compilazione: messaggio chiaro, con riga e colonna?
- Warning di compilazione: visibili e distinguibili dagli errori?
- Circuito incompleto + play: warning user-friendly?
- Pin gia' occupato: feedback quando si tenta di connettere?
- Componente fuori dalla breadboard: snap-back o errore?
- Network error (API down): messaggio di fallback? O silenzio?
- Timeout compilazione: messaggio dopo N secondi?
- Galileo API error: messaggio amichevole nella chat?
- Serial Monitor senza Serial.begin(): feedback?

**Round 9 — Layout & Proporzioni:**
- Canvas area: abbastanza grande per lavorare comodamente? O schiacciata dai pannelli?
- Toolbar: pulsanti troppo piccoli? Troppo grandi? Spaziatura tra gruppi?
- Editor panel: altezza sufficiente per scrivere codice (almeno 20 righe visibili)?
- Scratch panel: Blockly workspace abbastanza grande per lavorare? Toolbox visibile?
- Side-by-side Scratch: 60/40 e' effettivamente rispettato? O uno dei due e' schiacciato?
- Serial Monitor: altezza sufficiente per leggere output? Resize handle funziona?
- Chat Galileo: larghezza sufficiente? Input area visibile? Non copre il canvas?
- Passo Passo panel: non troppo largo? Non copre breadboard? Scrollabile con molti step?
- Breadboard: visibile per intero senza scroll a 1366px?
- NanoBreakout board: pin label leggibili? Pin cliccabili?

**Round 10 — Cross-Feature Interference:**
- Chat Galileo aperta + editor aperto + serial monitor: si sovrappongono?
- Passo Passo attivo + Scratch tab: il pannello interferisce con Blockly workspace?
- Wire mode attivo + click su toolbar: wire mode si disattiva? O il wire va al pulsante?
- Simulazione attiva + resize finestra: simulazione continua correttamente?
- Compilazione in corso + cambio tab: compilazione si perde?
- Galileo action tags (es. [AZIONE:play]) durante Passo Passo: interferenza?
- Undo durante Passo Passo: undo undoes lo step o un'azione manuale?
- Serial Monitor aperto + cambio esperimento: monitor si pulisce?
- Scratch workspace con blocchi + cambio esperimento: workspace si pulisce?
- Multiple pannelli aperti contemporaneamente: z-index corretti? Nessun overlap?

### FASE 2 — Test Sistematico con Chrome Control
Usa `Claude in Chrome` (MCP) per tutti i test visuali.

**A. Login + Dashboard + Navigazione:**
1. Naviga a https://www.elabtutor.school
2. `read_page` + `screenshot` della home/landing
3. Verifica tutti i link, bottoni, navigazione
4. Se c'e' login page: verifica form, layout, responsivita'
5. Se c'e' dashboard: verifica cards, navigazione esperimenti, filtri volume
6. Resize: mobile (375x667), tablet (768x1024), desktop (1920x1080)
7. Per ogni resize: screenshot + accessibility tree

**B. Simulatore — Ogni Esperimento:**
Per OGNI esperimento (Vol1 + Vol2 + Vol3, sandbox + guided):
1. Carica esperimento in **sandbox mode**
2. `screenshot` + `read_page` (snapshot accessibility)
3. Test toolbar: play, pause, reset, undo, redo — tutti i pulsanti
4. Verifica che OGNI pulsante abbia label leggibile e touch target >=44px
5. Carica stesso esperimento in **Passo Passo mode**
6. Naviga TUTTI gli step (Avanti fino alla fine, Indietro fino all'inizio)
7. Verifica pannello Passo Passo: posizione destra, testo leggibile, bottoni funzionanti
8. Trascina pannello Passo Passo in varie posizioni — verifica che non esca dallo schermo
9. Per Vol3 AVR: apri tab **Blocchi**, verifica side-by-side (60/40), **compila**
10. Verifica codice C++ generato nel pannello destro
11. Switch Arduino C++ <-> Blocchi <-> Arduino C++ — nessun crash
12. Resize a iPad landscape (1180x820) e portrait (768x1024), screenshot entrambi

**C. Scratch Deep Test (OGNI esperimento Vol3 AVR):**
1. Apri tab Blocchi
2. Verifica layout side-by-side (Blockly 60% sinistra + CodeEditorCM6 40% destra)
3. Verifica titolo "Codice Generato" nel pannello destro
4. Verifica blocchi presenti nel toolbox (8 categorie: Logic, Loops, Math, Text, Arduino I/O, Arduino Serial, Variables, Audio)
5. Trascina blocchi dalla toolbox al workspace
6. Collega blocchi tra loro
7. Disconnetti blocchi
8. Compila -> verifica C++ generato nel pannello destro (deve essere valido Arduino C++)
9. Verifica errori/warning display
10. Switch Arduino <-> Scratch <-> Arduino — workspace preservato? codice preservato?
11. `screenshot` di ogni stato significativo
12. Esperimenti con `scratchXml` pre-costruito: verifica che si carichino i blocchi corretti
13. Esperimenti SENZA `scratchXml`: verifica che appaia il blocco default `arduino_base` (Setup/Loop)

**D. Circuit Stress Test:**
1. In sandbox mode, piazza OGNI tipo di componente disponibile nella palette:
   LED, resistor, buzzer, servo, button, potentiometer, photoresistor, motor-dc, diode, MOSFET-n, RGB LED, reed switch, phototransistor
2. Collega ogni componente alla breadboard
3. Collega fili tra pin (test wire mode)
4. Collega fili tra pin improbabili/sbagliati — verifica che non crashi
5. Avvia simulazione con circuito incompleto — verifica warning, no crash
6. Avvia simulazione con circuito corto — verifica protezione
7. Verifica Serial Monitor: apri, chiudi, apri, scrivi lungo testo, scroll
8. Test wire mode: attiva -> collega 2 punti -> annulla -> riattiva -> collega -> rimuovi filo
9. Undo/redo massiccio: 20 azioni, undo 20 volte, redo 20 volte
10. clearAll -> verifica breadboard vuota -> undo -> componenti tornano

**E. Chat Galileo Test:**
1. Apri chat Galileo
2. Verifica layout, leggibilita', bottoni
3. Invia messaggio di testo semplice
4. Verifica formattazione risposta (markdown, link)
5. Testa pulsante screenshot/camera (se su tab canvas vs simulatore)
6. Verifica che la chat non copra contenuto importante
7. Resize: la chat si adatta correttamente?

**F. Estetica Globale Check:**
Per ogni viewport (375, 768, 1024, 1180, 1366, 1920):
1. Proporzioni pannelli — sono armoniche o schiacciate/stirate?
2. Font size — testo leggibile ovunque? Troppo piccolo? Troppo grande?
3. Colori — tutti dentro palette ufficiale? Contrasto sufficiente?
4. Spaziatura — padding/margin consistenti? Elementi troppo vicini/lontani?
5. Overflow — testo che esce dai contenitori? Scroll orizzontale non voluto?
6. Icone — tutte visibili, proporzionate, allineate?
7. Pulsanti — hover state, active state, disabled state tutti corretti?
8. Transizioni — smooth? Scattose? Assenti dove servirebbero?

### FASE 3 — Chain of Verification (CoV)
Dopo OGNI sessione di test, esegui CoV:

```
CoV-1: Il bug e' riproducibile? -> Riprova 3 volte
CoV-2: Il bug esisteva prima? -> Confronta con MEMORY.md known issues (P2/P3 list)
CoV-3: E' una regressione? -> Confronta con scores Session 87
CoV-4: Severity corretta? -> P0 (crash/regressione), P1 (funzionalita' rotta), P2 (estetico importante), P3 (cosmetico)
CoV-5: Screenshot allegato? -> Se no, rifai
CoV-6: Repro steps chiari? -> Se no, riscrivi
```

### FASE 4 — Ralph Loops (5 loop end-to-end)
Ogni Ralph Loop e' una sequenza ininterrotta di azioni. Se un qualsiasi step fallisce, il loop e' FAIL.

```
Ralph-1 (Cross-Volume + Scratch):
  Carica Vol1 Blink LED -> play -> pause -> load Vol3 Simon -> Scratch tab -> verifica blocchi Simon
  -> compila -> verifica C++ nel pannello destro -> switch Arduino C++ -> verifica codice
  -> compila in Arduino -> PASS se 0 errori in entrambe le compilazioni

Ralph-2 (Passo Passo Stress):
  Carica Vol3 Semaforo in Passo Passo -> avanza TUTTI gli step (Avanti x N)
  -> trascina pannello Passo Passo in alto a sinistra -> continua avanti
  -> resize finestra a 768px width -> verifica pannello visibile e leggibile
  -> torna indietro TUTTI gli step (Indietro x N) -> verifica breadboard vuota
  -> PASS se tutti gli step funzionano e nessun componente rimane

Ralph-3 (Circuit Stress + Undo):
  Sandbox mode -> piazza LED + resistor + buzzer + button + servo + potentiometer
  -> collega tutti con fili -> play simulazione -> pause -> clearAll
  -> undo 6 volte (tutti i componenti tornano) -> redo 6 volte (tutti spariscono)
  -> PASS se stato consistente dopo undo/redo

Ralph-4 (Scratch All-Experiments):
  Per i primi 4 esperimenti Vol3 con scratchXml:
  Carica exp -> Blocchi tab -> verifica blocchi -> compila -> verifica C++
  -> carica prossimo exp -> ripeti
  -> PASS se tutte 4 le compilazioni producono C++ valido

Ralph-5 (Responsive Gauntlet):
  Carica Vol3 Blink a 1920px -> screenshot
  -> resize 1366px -> screenshot -> verifica no overflow toolbar
  -> resize 1180px (iPad landscape) -> screenshot -> verifica no overflow
  -> resize 768px (iPad portrait) -> screenshot -> verifica Scratch vertical stack
  -> resize 375px (mobile) -> screenshot -> verifica tutto leggibile
  -> PASS se nessun breakpoint causa layout rotto
```

### FASE 5 — Creazione Skill Ad Hoc per Ogni Categoria di Fix

Dopo aver raccolto TUTTI i bug nel report, usa `skill-creator` per creare skill specializzate per OGNI categoria di problemi trovata. Ogni skill deve contenere:
- Lista ESATTA dei bug da risolvere (con riferimento al report)
- File da modificare
- Vincoli specifici per quella categoria
- CoV checklist specifica
- Criteri di successo misurabili

Skill da creare (adatta i nomi in base ai bug effettivamente trovati):

```
1. "elab-fix-responsive" — Corregge TUTTI i problemi responsive/iPad/viewport
   - Input: lista bug responsive dal report
   - File target: ElabSimulator.css, layout.module.css, NewElabSimulator.jsx
   - CoV: screenshot a 6 viewport prima/dopo ogni fix
   - Plugin: Claude Preview (resize viewport), Claude in Chrome (screenshot reali)

2. "elab-fix-scratch" — Corregge TUTTI i problemi Scratch/Blockly
   - Input: lista bug Scratch dal report
   - File target: ScratchEditor.jsx, scratchBlocks.js, scratchGenerator.js, experiments-vol3.js
   - CoV: compila tutti 12 AVR experiments prima/dopo
   - Plugin: Claude Preview (test compilazione live)

3. "elab-fix-estetica" — Corregge TUTTI i problemi estetici/proporzioni/tipografia
   - Input: lista bug estetici dal report
   - File target: ElabSimulator.css, design-system.css, ControlBar.jsx, pannelli vari
   - CoV: screenshot confronto prima/dopo per ogni viewport
   - Plugin: Claude in Chrome (visual verification), Claude Preview (inspect CSS)

4. "elab-fix-interactions" — Corregge TUTTI i problemi di interazione/UX
   - Input: lista bug interazione dal report
   - File target: NewElabSimulator.jsx, ComponentDrawer.jsx, wire/drag handlers
   - CoV: replay sequenza azioni prima/dopo
   - Plugin: Claude in Chrome (click, drag, keyboard test)

5. "elab-fix-state" — Corregge TUTTI i problemi di state management/transitions
   - Input: lista bug state dal report
   - File target: NewElabSimulator.jsx, ScratchEditor.jsx, CodeEditorCM6.jsx
   - CoV: Ralph Loop specifico per state transitions
   - Plugin: Claude in Chrome (navigazione multi-step)

6. "elab-fix-errors" — Corregge TUTTI i problemi di error handling/feedback
   - Input: lista bug errors dal report
   - File target: NewElabSimulator.jsx, ElabTutorV4.jsx, SerialMonitor.jsx
   - CoV: trigger ogni errore prima/dopo fix
   - Plugin: Claude in Chrome (console errors), Claude Preview (network requests)

7. "elab-fix-passo-passo" — Corregge TUTTI i problemi del pannello Passo Passo
   - Input: lista bug Passo Passo dal report
   - File target: ComponentDrawer.jsx, experiments-vol*.js
   - CoV: naviga tutti gli step di 3 esperimenti diversi prima/dopo
   - Plugin: Claude in Chrome (drag, scroll, resize test)

8. "elab-fix-circuit" — Corregge TUTTI i problemi circuito/physics/components
   - Input: lista bug circuit dal report
   - File target: componenti SVG, CircuitSolver, PlacementEngine
   - CoV: piazza e collega ogni tipo di componente prima/dopo
   - Plugin: Claude in Chrome (drag-drop test)
```

NOTA: Crea SOLO le skill per categorie che hanno effettivamente bug. Se una categoria ha 0 bug, non creare la skill.

### FASE 6 — Persistenza Contesto in Cartella Organizzata

Crea la cartella `docs/audit/session-91/` e salva TUTTO il contesto in file organizzati:

```
docs/audit/session-91/
  |-- INDEX.md                    -- Indice di tutti i file, stato avanzamento
  |-- 00-SETUP.md                 -- Context files letti, skill create, configurazione
  |-- 01-BRAINSTORM.md            -- Risultati 10 round brainstorming, angoli trovati
  |-- 02-SCAN-NAVIGATION.md       -- Bug trovati in login/dashboard/navigazione
  |-- 03-SCAN-SIMULATOR.md        -- Bug trovati in ogni esperimento (tabella per exp)
  |-- 04-SCAN-SCRATCH.md          -- Bug trovati in Scratch/Blockly per ogni exp
  |-- 05-SCAN-CIRCUIT.md          -- Bug trovati in circuit stress test
  |-- 06-SCAN-GALILEO.md          -- Bug trovati in chat Galileo
  |-- 07-SCAN-ESTETICA.md         -- Bug estetici per viewport
  |-- 08-SCAN-RESPONSIVE.md       -- Bug responsive per breakpoint
  |-- 09-COV-RESULTS.md           -- Risultati CoV 6-point per ogni bug
  |-- 10-RALPH-LOOPS.md           -- Risultati 5 Ralph Loops (PASS/FAIL per step)
  |-- REPORT.md                   -- Report finale completo
  |-- SKILLS-CREATED.md           -- Lista skill create con ID e descrizione
  |-- REMEDIATION-PROMPT.md       -- Prompt strutturato per session-92
```

**Regole persistenza:**
- Salva DOPO ogni sotto-fase (non aspettare la fine)
- Ogni file ha un header con: data, stato (IN PROGRESS / COMPLETE), bug count
- INDEX.md viene aggiornato dopo ogni salvataggio
- Se il contesto sta per esaurirsi, salva TUTTO immediatamente e scrivi in INDEX.md "RIPRENDERE DA: [fase/step]"
- Il prossimo agente puo' riprendere leggendo INDEX.md e i file parziali

### FASE 7 — Report Finale + Prompt di Remediation

**REPORT** (`docs/audit/session-91/REPORT.md`):
```markdown
# ELAB Tutor Total Audit — Session 91
## Executive Summary
- Bugs trovati: N (P0: X, P1: Y, P2: Z, P3: W)
- Regressioni rispetto a Session 87: N
- Miglioramenti estetici suggeriti: N
- Skill create: N (elenco nomi)

## Bugs per Area
### Simulatore — Funzionalita'
| # | Severity | Esperimento | Descrizione | Repro Steps | Expected | Actual | S | Skill Fix |
### Simulatore — Estetica & Proporzioni
| # | Severity | Area | Descrizione | Viewport | S | Skill Fix |
### Scratch/Blockly
| # | Severity | Esperimento | Descrizione | Repro | S | Skill Fix |
### Responsive/iPad
| # | Severity | Viewport | Descrizione | S | Skill Fix |
### Circuit/Physics
| # | Severity | Componenti | Descrizione | Repro | S | Skill Fix |
### Chat Galileo
| # | Severity | Descrizione | Repro | S | Skill Fix |
### Passo Passo
| # | Severity | Esperimento | Descrizione | Repro | S | Skill Fix |

## Ralph Loop Results
| Loop | Result | Failed Step (if any) | Notes |

## Regressioni vs Session 87
| # | Area | Was | Now | Evidence |

## Updated Scores
| Area | Score S87 | Score S91 | Delta | Notes |

## Skill Create per Remediation
| Skill Name | Bug Count | Files Target | Plugin Necessari |
```

**PROMPT DI REMEDIATION** (`.claude/prompts/session-92-total-fix.md`):
Usa la stessa struttura anatomica (Task, Context Files, Reference, Success Brief, Rules, Conversation, Plan, Alignment) con:
- OGNI bug dal report numerato come task
- Ordine di fix: P0 -> P1 -> P2 -> P3
- Per OGNI categoria, indica la skill da usare: `/skill elab-fix-responsive`, `/skill elab-fix-scratch`, etc.
- Per OGNI fix, indica i plugin da usare:
  - `Claude in Chrome` per verifiche visuali browser reale
  - `Claude Preview` per test resize/inspect CSS/console
  - `skill-creator` per creare sotto-skill se un bug richiede approccio complesso
  - `quality-audit` skill esistente per verifica finale
  - `ralph-loop` plugin per stress test post-fix
- CoV dopo ogni singolo fix
- Ralph Loop 5/5 dopo tutte le fix
- Build + deploy Vercel alla fine
- Vincolo assoluto: ZERO regressioni — se un fix causa regressione, revert immediato
- Leggere `docs/audit/session-91/INDEX.md` per contesto completo

---

## PLAN — 7 fasi

1. **SETUP**: Leggi context files + crea 2 skill audit + crea cartella `docs/audit/session-91/` + apri Chrome
2. **SCAN FUNZIONALE**: Ogni esperimento × (sandbox + guided + Scratch) + circuit stress + Galileo
3. **SCAN VISUALE**: Ogni area × TUTTI i viewport (matrice completa sotto) + estetica + proporzioni
4. **VERIFY**: 5 Ralph Loops + CoV 6-point su ogni bug
5. **SKILL CREATION**: Crea skill ad hoc per ogni categoria di bug trovata (skill-creator)
6. **PERSIST**: Salva tutto in `docs/audit/session-91/` con INDEX.md
7. **OUTPUT**: Report finale + Prompt di remediation con skill e plugin specifici

---

## MATRICE SCHERMI — Ogni area deve essere testata su TUTTI questi viewport

| # | Device | Width | Height | Tipo | Priorita' |
|---|--------|-------|--------|------|-----------|
| **1** | **iPad 10th Gen portrait** | **810** | **1080** | **Tablet portrait** | **P0 — DEVICE UTENTE** |
| **2** | **iPad 10th Gen landscape** | **1080** | **810** | **Tablet landscape** | **P0 — DEVICE UTENTE** |
| **3** | **PC utente (stimato)** | **1920** | **1080** | **Desktop** | **P0 — DEVICE UTENTE** |
| 4 | iPhone SE | 375 | 667 | Mobile portrait | P1 |
| 5 | iPhone 14 | 390 | 844 | Mobile portrait | P1 |
| 6 | iPhone 14 Pro Max | 430 | 932 | Mobile portrait | P2 |
| 7 | iPhone landscape | 844 | 390 | Mobile landscape | P2 |
| 8 | iPad Mini | 768 | 1024 | Tablet portrait | P1 |
| 9 | iPad Air | 820 | 1180 | Tablet portrait | P1 |
| 10 | iPad Pro 11 landscape | 1180 | 820 | Tablet landscape | P1 |
| 11 | iPad Pro 12.9 portrait | 1024 | 1366 | Tablet portrait | P2 |
| 12 | iPad Pro 12.9 landscape | 1366 | 1024 | Tablet landscape | P2 |
| 13 | Laptop piccolo | 1280 | 720 | Desktop | P1 |
| 14 | Laptop standard | 1366 | 768 | Desktop | P1 |
| 15 | Desktop QHD | 2560 | 1440 | Desktop | P2 |
| 16 | Ultrawide | 3440 | 1440 | Desktop | P3 |

**PRIORITA' ASSOLUTA: I viewport #1, #2, #3 (iPad 10th Gen + PC utente) devono essere testati PRIMI e avere ZERO bug.**
Il 10th gen iPad ha schermo 10.9" Liquid Retina, risoluzione nativa 2360x1640 (CSS viewport 810x1080 portrait, 1080x810 landscape).
Il PC utente e' un desktop/laptop standard 1920x1080.
Testare SEMPRE entrambi gli orientamenti dell'iPad.

**Per OGNI viewport**:
1. Resize finestra con `Claude in Chrome` o `Claude Preview`
2. `screenshot` + `read_page` accessibility tree
3. Verifica: overflow? testo leggibile? pulsanti cliccabili? proporzioni? sovrapposizioni?
4. Se bug trovato: annota viewport, area, descrizione, screenshot

---

## ALIGNMENT

**NON iniziare il lavoro finche' non hai**:
1. Letto TUTTI i context files
2. Creato le 2 skill audit con skill-creator
3. Creato cartella `docs/audit/session-91/` con INDEX.md
4. Confermato di aver compreso i vincoli di MEMORY.md
5. Aperto Chrome su https://www.elabtutor.school

**Persistenza contesto**:
- Salva DOPO ogni sotto-fase in `docs/audit/session-91/`
- Aggiorna INDEX.md dopo ogni salvataggio
- Se contesto in esaurimento: salva TUTTO + scrivi "RIPRENDERE DA: [fase/step]" in INDEX.md
- Il prossimo agente riparte da INDEX.md

**Dopo ogni fase**, mostra un riepilogo intermedio dei bug trovati finora.
**Se trovi un bug che potrebbe essere un false positive**, verifica 3 volte prima di segnalarlo.
**Se trovi >50 bug**, raggruppa per tema e prioritizza.

**Tecniche di risparmio token**:
- Usa abbreviazioni nella tabella bug (S=screenshot, R=repro, Reg=regressione)
- Non ripetere context — riferisciti a MEMORY.md per line number
- Usa `read_page` accessibility snapshot invece di screenshot quando possibile (meno token)
- Salva risultati intermedi in file `docs/audit/session-91/` per liberare contesto
- Usa Agent tool per scan paralleli dove possibile

**Plugin e Tool da usare**:
- `Claude in Chrome` — test visuali reali, click, drag, keyboard, resize, screenshot, accessibility tree
- `Claude Preview` — dev server, resize viewport, inspect CSS computed styles, console logs, network
- `skill-creator` — creare skill ad hoc per audit (FASE 0) e per ogni categoria fix (FASE 5)
- `quality-audit` (skill esistente) — audit automatizzato font/touch/a11y/bundle/build
- `ralph-loop` (plugin esistente) — stress test sequenziali end-to-end
- `Serena` — navigazione simbolica del codice, find_symbol, search_for_pattern per tracciare bug nel sorgente
- Agent tool (multi-agent) — scan paralleli di aree diverse del simulatore

**SUPERPOWERS attivati**:
- Multi-agent paralleli per massimizzare copertura
- Chrome Control per test nel browser reale
- 14 viewport nella matrice schermi
- 10 round brainstorming
- 5 Ralph Loops
- CoV 6-point su ogni bug
- Skill ad hoc per ogni categoria di fix
- Persistenza contesto via file organizzati
- Tutti i plugin disponibili attivati
