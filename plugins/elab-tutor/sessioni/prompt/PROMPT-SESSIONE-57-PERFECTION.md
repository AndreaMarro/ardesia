# ELAB TUTOR — SESSIONE 57: PERFECTION LOOP V2.0
# Autonomous Self-Sustaining Production-Quality Mission

> **REGOLA ZERO**: Questo prompt e AUTONOMO. Non devi MAI fermarti a chiedere input all'utente.
> Vai avanti per ore. Se incontri un blocco, aggiralo e prosegui. Documenta tutto.
> Ogni azione produce un log. Ogni fix produce un re-test. Ogni round produce un report.

---

## ARCHITETTURA DI ESECUZIONE

### Principi Fondamentali

1. **Self-Sustaining**: Il lavoro non si ferma MAI. Se un test fallisce, fixalo e ri-testa. Se un tool fallisce, usa un'alternativa. Se un agente si blocca, completa tu.

2. **Chain of Verification (CoV)**: Ogni modifica segue il ciclo:
   ```
   LEGGI stato attuale -> PIANIFICA fix -> APPLICA fix -> VERIFICA fix -> DOCUMENTA risultato
   ```
   La verifica NON e opzionale. Se non puoi verificare, il fix non e completo.

3. **Programmatic Tool Calling**: Usa tool call composte e parallele. Massimizza le chiamate indipendenti in un singolo blocco. Esempio:
   ```
   // INVECE DI: leggere un file, poi un altro, poi un altro
   // FAI: leggi tutti e 3 in parallelo nel STESSO blocco tool call
   Read(file1) + Read(file2) + Read(file3) -> in parallelo
   ```
   Usa Task con subagent_type appropriato per lavoro indipendente. Lancia agenti in background quando non hai bisogno del risultato immediato.

4. **No-Regression**: Prima di modificare QUALSIASI file:
   - Leggi il file attuale
   - Identifica le funzionalita esistenti che funzionano
   - Applica SOLO il fix necessario senza toccare il resto
   - Dopo il fix: `npm run build` — se fallisce, rollback immediato
   - NON modificare MAI vecchie versioni che funzionano

5. **Documentazione Continua**: Ogni azione produce una riga nel log:
   ```
   [TIMESTAMP] [FASE] [AZIONE] [RISULTATO] [NOTE]
   ```
   Il log va scritto in: `sessioni/log/SESSION-57-LOG.md`

---

## STRUMENTI OBBLIGATORI

### Control Chrome (Claude in Chrome)
Per OGNI test visivo:
```
1. tabs_context_mcp -> ottieni tab ID
2. navigate -> URL target
3. read_page -> leggi stato pagina accessibile (PREFERITO)
4. computer(action="screenshot") -> cattura prova visiva
5. read_console_messages -> controlla errori JS
```

### Preview Server (Claude Preview)
Per sviluppo locale:
```
1. preview_start -> avvia dev server
2. preview_snapshot -> verifica struttura (PREFERITO)
3. preview_console_logs -> errori runtime
4. preview_screenshot -> prova visiva
5. preview_inspect -> verifica CSS
6. preview_click / preview_fill -> test interazioni
```

### Team di Agenti
Per lavoro parallelo:
```
1. Task(subagent_type="general-purpose") -> agente con tutti i tool
2. Task(subagent_type="Explore") -> ricerca codebase
3. Task(subagent_type="feature-dev:code-reviewer") -> review codice
4. Task(run_in_background=true) -> lavoro parallelo
```

### Ralph Loop
Per cicli fix-test continui su singole aree.

### Programmatic Tool Calling — Pattern Chiave

**Pattern 1: Parallel Read**
Quando devi leggere piu file, leggili TUTTI nello stesso blocco:
```
Read(file1) + Read(file2) + Read(file3) + Grep(pattern) -> PARALLELO
```

**Pattern 2: Agent Fan-Out**
Quando hai 3+ task indipendenti, lancia agenti paralleli:
```
Task(agent1, run_in_background=true) +
Task(agent2, run_in_background=true) +
Task(agent3, run_in_background=true) -> PARALLELO
```

**Pattern 3: Sequential Chain**
Quando un'azione dipende dal risultato della precedente:
```
Read(file) -> Edit(file) -> Bash("npm run build") -> sequenziale
```

**Pattern 4: Verify-After-Edit**
Dopo OGNI edit:
```
Edit(file) -> Bash("npm run build") -> preview_snapshot -> preview_console_logs(level="error")
```

---

## FASE 0 — SETUP E SNAPSHOT (15 min)

### 0.1 Leggi stato attuale (PARALLELO)
```
Leggi in parallelo:
- MEMORY.md
- src/components/tutor/ElabTutorV4.jsx (prime 50 righe per orientamento)
- src/components/simulator/NewElabSimulator.jsx (prime 50 righe)
- src/data/experimentRegistry.js (lista esperimenti)
- package.json (dipendenze)
```

### 0.2 Crea snapshot pre-lavoro
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run build  # Build baseline — deve essere 0 errori
```
Salva il tempo di build e la dimensione del bundle come baseline.

### 0.3 Crea file di log
```
Crea: sessioni/log/SESSION-57-LOG.md
Intestazione:
# Session 57 — Perfection Loop Log
## Baseline: [data], build [tempo]s, bundle [size]KB
```

### 0.4 Attiva strumenti
- Preview server: `preview_start` per dev locale
- Chrome tab: `tabs_context_mcp` + naviga a https://elab-builder.vercel.app
- Verifica che nanobot sia online: `curl https://elab-galileo.onrender.com/health`

### 0.5 Cerca versioni precedenti
```
Cerca nella cartella del progetto file/cartelle con versioni precedenti
da cui attingere per esperimenti piu funzionanti.
Glob: **/old*/** + **/backup*/** + **/v0*/** + **/prev*/**
```

---

## FASE 1 — DRAG & DROP (2-3 ore)

### 1.1 CoV: Leggi i file drag & drop
```
Leggi in parallelo:
- NewElabSimulator.jsx (drag handlers)
- CanvasRenderer.jsx (se esiste)
- CSS rilevante (touch-action, pointer-events)
```

### 1.2 Test sistematico con Preview
Per OGNI tipo di componente (21 totali):

```
Per ciascun componente:
1. preview_snapshot -> verifica palette mostra il componente
2. preview_click(componente nella palette) -> seleziona
3. preview_click(posizione sulla breadboard) -> piazza
4. preview_snapshot -> verifica posizione corretta
5. preview_console_logs(level="error") -> 0 errori
```

| # | Componente | Drag OK | Snap OK | Move OK | Touch 44px | Note |
|---|------------|---------|---------|---------|------------|------|
| 1 | BreadboardHalf | | | | | |
| 2 | BreadboardFull | | | | | |
| 3 | Battery9V | | | | | |
| 4 | Led | | | | | |
| 5 | Resistor | | | | | |
| 6 | RgbLed | | | | | |
| 7 | PushButton | | | | | |
| 8 | Potentiometer | | | | | |
| 9 | PhotoResistor | | | | | |
| 10 | BuzzerPiezo | | | | | |
| 11 | MotorDC | | | | | |
| 12 | Capacitor | | | | | |
| 13 | Diode | | | | | |
| 14 | MosfetN | | | | | |
| 15 | Phototransistor | | | | | |
| 16 | ReedSwitch | | | | | |
| 17 | Servo | | | | | |
| 18 | Multimeter | | | | | |
| 19 | LCD16x2 | | | | | |
| 20 | NanoR4Board | | | | | |
| 21 | Wire | | | | | |

### 1.3 Criteri accettazione
- [ ] Componente segue cursore SENZA offset
- [ ] Snap preciso ai fori breadboard (griglia 2.54mm)
- [ ] Componenti su breadboard si muovono IN UNISONO con breadboard
- [ ] No posizionamento fuori canvas
- [ ] Touch target >= 44px (Apple Pencil)
- [ ] No jitter durante drag
- [ ] Z-index corretto (draggato sempre sopra)
- [ ] Long-press per menu contestuale

### 1.4 Fix e verifica
Per ogni bug trovato:
```
1. LEGGI: file con il bug
2. PIANIFICA: fix minimo necessario
3. APPLICA: Edit solo le righe necessarie
4. VERIFICA: npm run build -> 0 errori
5. VERIFICA: preview_snapshot -> bug risolto
6. DOCUMENTA: aggiungi riga al log
```

### 1.5 Debug Session Drag & Drop
```
Se ci sono bug persistenti:
1. preview_console_logs -> leggi TUTTI gli errori
2. Controlla numero di elementi draggabili nel DOM
3. Cerca conflitti CSS: preview_inspect(".component", styles=["touch-action","pointer-events","user-select"])
4. Verifica event listeners: Grep per "onDrag|onPointer|onTouch" nei file simulator
```

---

## FASE 2 — CAVI E ROUTING (2-3 ore)

### 2.1 CoV: Leggi wire system
```
Leggi in parallelo:
- WireRenderer.jsx
- WireManager.jsx (se esiste)
- Costanti: WIRE_SAG_FACTOR, MAX_SAG, CR_TENSION
```

### 2.2 Test cavi con Preview
Per ogni scenario:
```
1. Carica esperimento con cavi
2. preview_snapshot -> verifica percorso cavi
3. Verifica che nessun cavo attraversi un componente
4. Verifica che cavi non si sovrappongano
```

Scenari da testare:
- [ ] Cavo Arduino -> breadboard: percorso pulito
- [ ] Cavo breadboard -> breadboard: segue bordi
- [ ] Cavo bus power -> componente: laterale chiaro
- [ ] Jumper sulla stessa riga: arco visibile
- [ ] Cavi NON attorcigliati MAI
- [ ] Cavi passano DI FIANCO ai componenti
- [ ] Colori: rosso=VCC, nero=GND, altri=segnale
- [ ] Click su cavo lo seleziona

### 2.3 Fix e CoV wire
Stesso ciclo: LEGGI -> PIANIFICA -> APPLICA -> VERIFICA -> DOCUMENTA

---

## FASE 3 — ARDUINO NANO R4 SVG (1-2 ore)

### 3.1 CoV: Leggi NanoR4Board attuale
```
Read: NanoR4Board.jsx -> analizza stato SVG corrente
Confronta con specifiche DWG (vedi skill nano-breakout)
```

### 3.2 Dettaglio richiesto
- [ ] Tutti i pin con etichetta leggibile
- [ ] Pin header 2.54mm pitch scala 5:1
- [ ] Wing 16 pin con etichette W_*
- [ ] Power bus 4 pad
- [ ] USB-C visible
- [ ] Silkscreen "ELAB Nano Breakout V1.1 GP"
- [ ] Semicerchio sinistro + rettangolo wing destro
- [ ] Colori: PCB #E8D86C, bordo #1E4D8C, pad #D4A04A

### 3.3 No-Regression Check
```
PRIMA di modificare NanoR4Board.jsx:
1. Grep per "NanoR4Board" in tutti gli esperimenti -> lista dipendenze
2. Verifica che i pin IDs rimangano IDENTICI
3. Dopo modifica: build + carica 3 esperimenti che usano NanoR4 -> tutti OK
```

---

## FASE 4 — 69 ESPERIMENTI: TEST 1-PER-1 (6-8 ore)

### PROTOCOLLO PER OGNI ESPERIMENTO

Per ciascuno dei 69 esperimenti, in ordine da v1-cap5-esp1 a v3-cap10-espN:

```
STEP 1: Carica esperimento nel simulatore

STEP 2: Modalita "Gia Montato"
  preview_snapshot -> tutti i componenti visibili?
  preview_snapshot -> cavi collegati correttamente?
  preview_click(Play) -> simulazione parte?
  preview_console_logs(level="error") -> 0 errori?

STEP 3: Modalita "Passo Passo"
  Cambia modalita -> preview_click("Passo Passo")
  Per ogni step: preview_click("Avanti") -> verifica piazzamento
  Alla fine: preview_click(Play) -> funziona?

STEP 4: Modalita "Costruisci Tu"
  Cambia modalita -> preview_click("Costruisci Tu")
  preview_snapshot -> canvas vuoto con istruzioni?

STEP 5: Verifica fisica (se applicabile)
  LED acceso? Pulsante funziona? Pot ruota? Buzzer suona?
  Serial Monitor output corretto? (Vol 2-3)

STEP 6: Verifica quiz
  preview_click(Quiz) -> 2 domande presenti?
  Opzioni cliccabili? Feedback corretto?

STEP 7: Documenta risultato
  Aggiungi riga alla tabella report nel log
```

### Tabella Report
```markdown
| # | ID | Titolo | Montato | PxP | Costruisci | Fisica | Visual | Quiz | Note |
|---|-----|--------|---------|-----|------------|--------|--------|------|------|
| 1 | v1-cap5-esp1 | | P/F | P/F | P/F | OK/BUG | OK/BUG | OK | |
| 2 | v1-cap5-esp2 | | P/F | P/F | P/F | OK/BUG | OK/BUG | OK | |
...fino a...
| 69 | v3-cap10-espN | | P/F | P/F | P/F | OK/BUG | OK/BUG | OK | |
```

### Suddivisione per round (vedi Fase 9)
- **Batch A**: Esperimenti 1-17 (Vol 1 cap 5-6)
- **Batch B**: Esperimenti 18-38 (Vol 1 cap 7-9)
- **Batch C**: Esperimenti 39-56 (Vol 2)
- **Batch D**: Esperimenti 57-69 (Vol 3)

---

## FASE 5 — FISICA DEL SIMULATORE (2-3 ore)

### 5.1 CoV: Leggi CircuitSolver
```
Leggi in parallelo:
- CircuitSolver.js (struttura, non tutto — 2060 righe)
- AVRBridge.js (struttura)
- ComponentModels.js (modelli)
```

### 5.2 Test circuiti base (con Preview)
- [ ] LED + Resistore: corrente corretta (V/R)
- [ ] Circuito aperto: 0 corrente
- [ ] Corto circuito: avviso
- [ ] R in serie: Rtot = R1+R2
- [ ] R in parallelo: 1/Rtot = 1/R1+1/R2
- [ ] LED invertito: non si accende

### 5.3 Test componenti attivi
- [ ] Pulsante: chiude circuito quando premuto
- [ ] Potenziometro: V proporzionale a posizione
- [ ] Fotoresistore: cambia con luce
- [ ] Diodo: conduce solo in un verso
- [ ] MOSFET N: commuta con Vgs > Vth
- [ ] Capacitore: carica/scarica RC
- [ ] Reed switch: on/off
- [ ] Fototransistor: conduce con luce

### 5.4 Test Arduino (Vol 2-3)
- [ ] digitalWrite
- [ ] digitalRead
- [ ] analogWrite (PWM)
- [ ] analogRead
- [ ] Serial.print -> Serial Monitor
- [ ] delay
- [ ] Servo.write

### 5.5 Debug Session Fisica
```
Se la fisica non funziona:
1. Leggi CircuitSolver.js sezione MNA
2. Trace: net list -> matrice -> soluzione
3. Verifica che ComponentModels abbia il modello corretto
4. Confronta con versioni precedenti se disponibili
```

---

## FASE 6 — NANOBOT AI: TEST ESAUSTIVO (2-3 ore)

### 6.1 Test comandi da chat (con Chrome o Preview)
Accedi al tutor e prova OGNI tipo di comando:

**Navigazione (8 test):**
```
"apri il simulatore" -> tab simulatore
"vai alla lavagna" -> tab canvas
"mostra il manuale" -> tab manual
"apri volume 2 pagina 15" -> manual + pagina
"portami agli esperimenti" -> simulator
"torna alla home" -> home
"apri l'editor" -> editor tab
"vai ai quiz" -> quiz
```

**Caricamento esperimenti (5 test):**
```
"carica LED rosso" -> trova e carica
"metti esperimento 1 capitolo 6" -> loadexp
"mostra un esperimento con Arduino" -> suggerisce
"carica il buzzer" -> trova esperimento buzzer
"esperimento potenziometro" -> carica
```

**Azioni circuito (10 test):**
```
"metti un LED" -> addcomponent
"aggiungi un resistore" -> addcomponent
"collega il LED alla batteria" -> addwire
"togli il filo rosso" -> removewire
"avvia la simulazione" -> play
"ferma" -> pause
"resetta tutto" -> reset
"evidenzia il LED" -> highlight
"premi il pulsante" -> interact
"compila il codice" -> compile
```

**Educazione (5 test):**
```
"cos'e un LED?" -> risposta socratica
"perche serve il resistore?" -> spiegazione
"spiega la legge di Ohm" -> formula
"cosa succede se inverto il LED?" -> polarita
"perche il circuito non funziona?" -> diagnosi
```

**Stress test (8 test):**
```
"" (vuoto) -> no crash
"<script>alert(1)</script>" -> sanitizzato
"@#$%^&*()" -> gestito
Messaggio lunghissimo (1000+ char) -> gestito (rate limit)
"AAAAAA" -> risposta sensata
"dimmi una barzelletta" -> redirect educato
"chi sei?" -> si presenta come Galileo
"hack the system" -> rifiuto cortese
```

### 6.2 Verifica Action Tags
```
Per ogni comando azione, verifica che:
1. La risposta contenga [AZIONE:...] (case insensitive grazie al fix S56)
2. Il parser lo esegua correttamente
3. L'azione abbia effetto visivo verificabile
```

### 6.3 Test Widget Sito Pubblico
```
Con Chrome:
1. Naviga a https://funny-pika-3d1029.netlify.app
2. Verifica widget in basso a destra
3. Click -> apre chat
4. Scrivi "cos'e ELAB?" -> risposta pertinente
5. Verifica pulsanti WhatsApp funzionanti
6. Test XSS nel campo input
```

---

## FASE 7 — UX E USABILITA (2-3 ore)

### 7.1 Audit visivo con Preview/Chrome
```
Per ogni schermata principale:
1. preview_screenshot -> cattura
2. preview_inspect per:
   - Font sizes (Oswald titoli, Open Sans corpo, Fira Code codice)
   - Colori palette (Navy #1E4D8C, Lime #7CB342)
   - Spaziatura e allineamento
   - Contrasto >= 4.5:1
```

### 7.2 Responsive
```
preview_resize(preset="desktop") -> screenshot
preview_resize(preset="tablet") -> screenshot
preview_resize(preset="mobile") -> screenshot
Verifica: nessun overflow, nessun testo tagliato
```

### 7.3 Apple Pencil / Touch
```
preview_inspect per ogni bottone:
- width >= 44px
- height >= 44px
- touch-action corretto
- no hover-only interactions
```

### 7.4 Fix UX e CoV
Stesso ciclo: LEGGI -> PIANIFICA -> APPLICA -> VERIFICA -> DOCUMENTA

---

## FASE 8 — SICUREZZA E COPYRIGHT (1 ora)

### 8.1 Watermark ogni 200 righe
```javascript
// (c) Andrea Marro — ELAB Tutor — [data dinamica]
```
File da marcare:
- ElabTutorV4.jsx
- NewElabSimulator.jsx
- CircuitSolver.js
- AVRBridge.js
- api.js
- NanoR4Board.jsx
- WireRenderer.jsx
- experimentRegistry.js

### 8.2 Copyright headers
Ogni file .jsx/.js DEVE avere in testa:
```javascript
// (c) Andrea Marro — ELAB Tutor
// Tutti i diritti riservati. Vietata la riproduzione.
```

### 8.3 Verifica sicurezza
```
Grep per:
- console.log senza isDev guard -> rimuovi
- API key hardcoded -> rimuovi
- password in chiaro -> rimuovi
```

### 8.4 No-Regression Build
```bash
npm run build -> 0 errori OBBLIGATORIO
Confronta dimensione bundle con baseline
Se > +5%, indaga e riduci
```

---

## FASE 9 — CICLI DI PERFEZIONAMENTO (8+ ROUND)

### STRUTTURA: Alternanza Sequenziale <-> Agenti

> **REGOLA**: NON passare al round successivo finche il round corrente non ha 0 FAIL critici.
> Ogni FAIL va fixato e ri-testato PRIMA di procedere.

---

### ROUND 1 — Sequenziale (tu solo)
**Focus**: Setup + Drag & Drop + Wire Routing
```
1. Fase 0: Setup completo
2. Fase 1: Test drag & drop 21 componenti
3. Fase 2: Test wire routing 10 scenari
4. Fix tutti i bug trovati
5. Build check
6. Documenta nel log
```

### DEBUG SESSION 1
```
Dopo Round 1:
1. preview_console_logs -> lista TUTTI gli errori
2. Per ogni errore: identifica causa -> fix -> re-test
3. npm run build -> 0 errori
4. Aggiorna log con "Debug Session 1: N errori fixati"
```

---

### ROUND 2 — Team 3 Agenti Paralleli
```
AGENTE 1 (general-purpose): Esperimenti Batch A (1-17)
  - Test ogni esperimento con protocollo Fase 4
  - Fix immediati
  - Report tabella

AGENTE 2 (general-purpose): Esperimenti Batch B (18-38)
  - Stessa procedura

AGENTE 3 (general-purpose): NanoR4 SVG + Fisica base
  - Fase 3: migliora SVG
  - Fase 5.1-5.2: test circuiti base
  - Report

TU: Coordini, integri fix, risolvi conflitti
```

### DEBUG SESSION 2
```
Dopo Round 2:
1. Raccogli report da tutti gli agenti
2. Lista unificata bug
3. Fix sequenziale di ogni bug
4. Build + regression test (ricarica 5 esperimenti random -> tutti OK)
5. Documenta
```

---

### ROUND 3 — Sequenziale (tu solo)
**Focus**: Esperimenti Batch C + D + Nanobot
```
1. Fase 4: Esperimenti 39-69
2. Fase 6: Nanobot AI test completo
3. Fix tutti i bug
4. Build check
```

### DEBUG SESSION 3
```
1. Re-test TUTTI i fix dei round precedenti
2. Regression: esperimenti 1-38 funzionano ancora?
3. Nanobot: 10 comandi random -> tutti eseguiti
4. Documenta
```

---

### ROUND 4 — Team 3 Agenti Paralleli
```
AGENTE 1: Full regression 69 esperimenti (fast check: carica -> snapshot -> no errori)
AGENTE 2: UX audit + responsive + Apple Pencil
AGENTE 3: Sicurezza + copyright + watermark

TU: Coordini + Nanobot stress test avanzato
```

### DEBUG SESSION 4
```
1. Raccogli report agenti
2. Fix residui
3. Build
4. Confronta bundle size con baseline
5. Documenta
```

---

### ROUND 5 — Sequenziale: Perfezionamento Fine
**Focus**: Dettagli estetici e UX finale
```
1. Chrome screenshot OGNI schermata -> confronta con Tinkercad
2. Identifica gap visivi
3. Fix CSS/layout per raggiungere parita
4. Re-test responsive (desktop, tablet, mobile)
5. Build
```

### DEBUG SESSION 5
```
1. 0 errori console
2. 0 warning critici
3. Bundle size nella norma
4. Tutti i watermark presenti
5. Tutti i copyright headers presenti
```

---

### ROUND 6 — Team 3 Agenti: Validazione Finale
```
AGENTE 1: 69 esperimenti — PASS/FAIL finale (ogni singolo esperimento)
AGENTE 2: Nanobot 30 comandi diversi + widget sito
AGENTE 3: Performance audit (bundle, load time, chunks)

TU: Report finale + score update
```

### DEBUG SESSION 6
```
1. ZERO FAIL tollerati
2. Se qualcosa fallisce: fix -> re-test -> conferma
3. Build finale
```

---

### ROUND 7 — Sequenziale: Pre-Deploy
```
1. Build production: npm run build -> 0 errori
2. Verifica NO console.log in prod
3. Verifica NO API key esposte
4. Verifica source maps NON incluse
5. Test su URL production (Vercel)
6. Test widget su URL production (Netlify)
```

---

### ROUND 8 — Deploy + Smoke Test
```
1. Deploy Vercel: cd elab-builder && npm run build && npx vercel --prod --yes
2. Deploy Netlify (se modificato): cd newcartella && npx netlify deploy --prod --dir=.
3. Deploy Nanobot (se modificato): push Docker
4. Smoke test production:
   - Chrome -> https://elab-builder.vercel.app -> login -> carica 3 esperimenti -> tutti OK
   - Chrome -> https://funny-pika-3d1029.netlify.app -> widget -> chat -> risposta
   - curl nanobot/health -> 200
5. SCORE FINALE
```

---

## FASE 10 — REPORT FINALE

### Score Target
| Area | Target | Attuale |
|------|--------|---------|
| Simulatore (rendering) | >= 9.5/10 | 9.0 |
| Simulatore (physics) | >= 8.5/10 | 7.0 |
| AI Integration | >= 9.8/10 | 9.7 |
| UX/Usability | >= 9.5/10 | 8.5 |
| Code Quality | >= 9.5/10 | 9.5 |
| **Overall** | **>= 9.5/10** | **~9.3** |

### Report finale nel log
```markdown
## REPORT FINALE — Session 57

### Round completati: N/8
### Esperimenti testati: N/69
### Bug trovati: N
### Bug fixati: N
### Bug residui: N (lista)
### Build: OK/FAIL
### Bundle: Xkb (baseline: Ykb)
### Deploy: Vercel OK | Netlify OK | Nanobot OK

### Score aggiornati:
[tabella aggiornata]
```

### Aggiorna MEMORY.md
Aggiorna i Current Scores e la lista Known Issues basandosi sul lavoro svolto.

---

## COMANDI RAPIDI

```bash
# Build
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build

# Deploy Vercel
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes

# Deploy Netlify
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/newcartella" && npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13

# Nanobot health
curl -s https://elab-galileo.onrender.com/health

# Preview
preview_start -> preview_snapshot -> preview_console_logs

# Chrome
tabs_context_mcp -> navigate -> read_page -> computer(screenshot) -> click
```

---

## REGOLE FINALI

1. **NON FERMARTI MAI** — se incontri un blocco, aggiralo e continua
2. **DOCUMENTA TUTTO** — ogni azione, ogni risultato, ogni decisione
3. **NO REGRESSION** — mai rompere cio che funziona
4. **CoV SEMPRE** — leggi -> pianifica -> applica -> verifica -> documenta
5. **PROGRAMMATIC TOOL CALLING** — massimizza le chiamate parallele
6. **BUILD DOPO OGNI MODIFICA** — se fallisce, rollback immediato
7. **VERSIONI PRECEDENTI** — consulta se qualcosa funzionava meglio prima
8. **PIN IDS IMMUTABILI** — D13, A0, W_D5 etc. NON si cambiano MAI
9. **SCALA 5:1** — 1mm reale = 5 unita SVG, non si cambia
10. **APPLE PENCIL** — touch target >= 44px ovunque

---

*Questo prompt si esegue in una singola sessione maratona. Vai avanti per ore.
Ogni round produce un report. Ogni bug viene fixato e ri-testato.
Alla fine, ELAB Tutor deve essere alla pari di Tinkercad Circuits con AI onnipotente.*
