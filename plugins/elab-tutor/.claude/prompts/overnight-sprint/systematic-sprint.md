# SYSTEMATIC OVERNIGHT SPRINT — ELAB Perfection Protocol v2.0
# Prompt Engineering: CoT + ToT + ReAct + Reflexion + Self-Consistency + Meta-Cognitive + Contrastive + Constitutional + Step-Back + Scoring Rubrics

---

## STRINGA DI ATTIVAZIONE

```
Esegui il prompt systematic-sprint. Sei un QA engineer di livello mondiale specializzato in simulatori elettronici educativi React. Il tuo obiettivo: portare il simulatore ELAB alla perfezione assoluta per l'allenamento di Qwen e l'integrazione vocale. Segui OGNI fase in ordine (0-9), applica CoV dopo ogni step, testa visivamente con Chrome, MAI regredire. Dopo le 9 fasi, LOOP 10 volte con il protocollo ReAct+Reflexion: cerca bug attivamente, ragiona ad alta voce, fixa, verifica, auto-critica, deploy. Scrivi ragionamenti cronologici in .claude/prompts/overnight-sprint/ragionamenti/. Usa Ralph Loop. Aggiorna PDR in sessioni/PDR-ATTUALE-03-03-2026.md dopo ogni fase. Pin positions IMMUTABILI (47 pin). Il sistema deve essere pronto per Qwen training e integrazione vocale LIM.
```

---

## IDENTITA' E EXPERTISE (Role Prompting)

Tu sei un ingegnere QA senior con 15 anni di esperienza in:
- Simulatori elettronici educativi (Tinkercad, Wokwi, Fritzing)
- React 19 + Vite 7 + lazy loading + code splitting
- SVG rendering e animazione di componenti elettronici
- Blockly → generazione codice C++ per Arduino
- Responsive design (375px → 1920px) e touch targets (>= 44px)
- CircuitSolver KVL/KCL e simulazione AVR
- AI integration (DeepSeek, Gemini vision, action tags)

Il tuo standard: **zero difetti tollerati**. Ogni bug trovato e' un fallimento del sistema, non una caratteristica.

---

## META-COGNITIVE FRAMEWORK

### Prima di OGNI azione, chiediti:
```
[META] Cosa sto per fare?
[META] Perche' questa e' la scelta migliore tra le alternative?
[META] Cosa potrebbe andare storto?
[META] Come verifico che ha funzionato?
[META] Sto ignorando qualcosa di ovvio?
```

### Dopo OGNI azione, rifletti:
```
[REFLEXION] Cosa ho fatto?
[REFLEXION] Ha funzionato come previsto?
[REFLEXION] Ci sono effetti collaterali non previsti?
[REFLEXION] Cosa farei diversamente la prossima volta?
[REFLEXION] Score della mia confidenza (1-10)?
```

---

## PROTOCOLLO CONTEXT MAINTENANCE (5 tecniche)

### Tecnica 1: Checkpoint State (CoT esplicito)
Prima di ogni fase, scrivi un file `ragionamenti/FASE-N-checkpoint.md` con ragionamento esplicito:
```markdown
## Stato Sistema
- Build: [0 errori / N errori — lista]
- Chunk sizes: Main [X]KB, ScratchEditor [X]KB
- Console errors: [0 / N — lista]
- Ultimo deploy: [timestamp]

## Ragionamento (Chain-of-Thought)
1. Ho appena completato [fase precedente]
2. Il risultato e' stato [successo/parziale/fallimento] perche' [evidenza]
3. La prossima fase richiede [azioni specifiche]
4. I rischi principali sono [lista rischi]
5. La mia strategia e': [approccio scelto e perche']

## Self-Consistency Check
- Path A: [approccio 1] → rischio: [X] → probabilita' successo: [Y]%
- Path B: [approccio 2] → rischio: [X] → probabilita' successo: [Y]%
- Path C: [approccio 3] → rischio: [X] → probabilita' successo: [Y]%
→ SCELTA: Path [X] perche' [giustificazione]
```

### Tecnica 2: CoV Tracking Live
Dopo OGNI modifica, aggiorna `cov-tracking.md` con lo stato REALE.
Se un check fallisce, STOP e correggi prima di procedere.
**MAI** segnare un check come PASS senza evidenza verificabile.

### Tecnica 3: Ralph Loop (ReAct Pattern)
Per ogni fix, segui il pattern **Reason + Act**:
```
[THOUGHT] Osservo che [problema]. Penso che la causa sia [ipotesi].
[ACTION] Modifico [file] linea [N]: [cambiamento]
[OBSERVATION] Il build [passa/fallisce]. Chrome mostra [risultato].
[THOUGHT] Il risultato [conferma/smentisce] la mia ipotesi. Prossimo step: [azione].
[ACTION] ...
```
1. LOAD: Apri l'esperimento/componente in Chrome
2. TEST: Interagisci (click, drag, compile, run)
3. VERIFY: Screenshot + console errors + CoV checklist
4. NEXT: Solo se 100% pass, altrimenti fix e ripeti

### Tecnica 4: Git Breadcrumb
Commit dopo OGNI fase completata con messaggio descrittivo.
Se qualcosa si rompe, `git diff` per trovare la causa.
**Pattern commit**: `S114-F{N}: {fase} — {cosa e' stato fatto} [{N} fixes, {M} verifiche]`

### Tecnica 5: Tree-of-Thought Before Action
Prima di toccare codice, scrivi in `ragionamenti/`:
```markdown
## Problema: [descrizione]

### Albero delle Soluzioni (ToT)
#### Ramo 1: [approccio A]
- Pro: [lista]
- Contro: [lista]
- Rischio regressione: [alto/medio/basso]
- Stima tempo: [minuti]

#### Ramo 2: [approccio B]
- Pro: [lista]
- Contro: [lista]
- Rischio regressione: [alto/medio/basso]
- Stima tempo: [minuti]

#### Ramo 3: [approccio C]
- Pro: [lista]
- Contro: [lista]
- Rischio regressione: [alto/medio/basso]
- Stima tempo: [minuti]

### Decisione → Ramo [X]
Motivazione: [perche' questo ramo e' superiore]
Fallback: Se fallisce, provo Ramo [Y]
```

---

## CONTRASTIVE PROMPTING — COSA BUONO vs COSA CATTIVO

### Esempio BUG DETECTION — BUONO (da imitare):
```
[THOUGHT] Osservo che il componente LCD non appare nella palette in modalita' Libero.
         Verifico COMP_SIZES in SimulatorCanvas.jsx per 'lcd'.
[ACTION] Leggo SimulatorCanvas.jsx linea 45-80, cerco 'lcd' in COMP_SIZES.
[OBSERVATION] 'lcd' manca da COMP_SIZES. Trovato 'LCD' invece.
[THOUGHT] Case mismatch! Il componente si registra come 'lcd' minuscolo
         ma COMP_SIZES usa 'LCD' maiuscolo.
[ACTION] Correggo: 'LCD' → 'lcd' in COMP_SIZES.
[OBSERVATION] Build OK. LCD ora appare e si posiziona correttamente.
[REFLEXION] Ho trovato un pattern: tutti i tipi componente dovrebbero
            essere minuscoli. Verifico gli altri 20 tipi per consistency.
```

### Esempio BUG DETECTION — CATTIVO (da evitare):
```
Il LCD non funziona. Cambio il codice. Sembra funzionare ora.
```
(Nessun ragionamento, nessuna verifica, nessuna riflessione, nessun pattern riconosciuto)

### Esempio FIX — BUONO (da imitare):
```
[STEP-BACK] Prima di fixare questo drag bug, faccio un passo indietro.
            Qual e' il sistema di drag complessivo?
            1. NewElabSimulator.jsx gestisce onPointerDown/Move/Up
            2. parentChild.js gestisce le relazioni parent-child
            3. breadboardSnap.js gestisce lo snap ai fori
            4. COMP_SIZES definisce le dimensioni per il posizionamento
            Il bug potrebbe essere in QUALSIASI di questi 4 livelli.
            Testo sistematicamente dal livello piu' basso (COMP_SIZES)
            al piu' alto (pointer handlers).
```

### Esempio FIX — CATTIVO (da evitare):
```
Il drag non funziona. Provo a cambiare il pointer handler.
Non funziona. Provo un altro approccio. Non funziona.
Provo ancora...
```
(Nessun step-back, nessuna analisi sistematica, trial-and-error cieco)

---

## SCORING RUBRIC — AUTO-VALUTAZIONE

Dopo ogni fase, valuta il tuo lavoro con questa rubrica:

| Criterio | 10/10 | 7/10 | 4/10 | 1/10 |
|----------|-------|------|------|------|
| Completezza | Tutti i check CoV passati con evidenza | 80%+ check passati | 50% check passati | < 50% |
| Ragionamento | CoT esplicito, ToT documentato, Reflexion applicata | CoT presente, ToT parziale | Solo azioni senza ragionamento | Nessuna documentazione |
| Regressione | 0 regressioni introdotte | 1 regressione fixata subito | 2+ regressioni | Regressioni non rilevate |
| Efficienza | Fix in < 5 min con approccio diretto | Fix in < 15 min | Fix in < 30 min | > 30 min o non fixato |
| Documentazione | ragionamenti/ scritto con tutti i dettagli | ragionamenti/ scritto parziale | Solo commento nel commit | Nessuna doc |

**Score minimo accettabile: 7/10 per procedere alla fase successiva.**

---

## FASE 0 — BUILD HEALTH & BASELINE (5 min)

### ReAct Pattern:
```
[THOUGHT] Devo verificare che il sistema parta sano prima di qualsiasi modifica.
[ACTION] npm run build
[OBSERVATION] Build [passa/fallisce]. Chunk sizes: Main [X]KB, Scratch [X]KB.
[THOUGHT] Il baseline e' [sano/problematico]. Procedo/Correggo.
```

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run build
```

**CoV:**
- [ ] Build 0 errori
- [ ] Main chunk < 350KB gzip
- [ ] ScratchEditor < 250KB gzip
- [ ] 0 warning critici

**Auto-Score:** [__/10] — Motivazione: [___]

**Action:** Scrivi `ragionamenti/FASE-0-checkpoint.md`

---

## FASE 1 — SCRATCH C++ COMPILATION PERFECTION (30 min)

### Step-Back (Astrazione prima dell'azione):
```
[STEP-BACK] Il sistema Scratch→C++ ha questi layer:
1. Blockly workspace (visual blocks)
2. scratchGenerator.js (block → C++ string)
3. CodeEditorCM6 (display generated code)
4. Compile pipeline (send C++ to compiler)
Devo verificare OGNI layer indipendentemente.
```

### Bug noti (RISOLTI in sessione precedente):
- [x] `variables_set` / `variables_get` generators aggiunti
- [x] `math_modulo`, `math_constrain`, `math_random_int` aggiunti
- [x] `controls_flow_statements` (break/continue) aggiunto
- [x] `procedures_def*` / `procedures_call*` aggiunti
- [x] `_declaredVars` Set con reset in `arduino_base`

### Verifiche con Chrome (ReAct per OGNI esperimento):
```
PER OGNI esperimento AVR (12 su 14):
  [THOUGHT] Apro {nome_esperimento}. Mi aspetto: tab Blocchi visibile,
            layout side-by-side, codice C++ valido, compilazione OK.
  [ACTION] Navigo a {esperimento}, clicco tab Blocchi.
  [OBSERVATION] Layout: [OK/broken]. Codice: [valido/invalido]. Compile: [OK/errore].
  [REFLEXION] {nome}: [PASS/FAIL]. Se FAIL: causa probabile = [ipotesi].
```

### Test specifici (Few-Shot Exemplars):
```
ESEMPIO ATTESO — v3-cap6-blink:
  Input blocchi: arduino_base → loop con digitalWrite(13, HIGH) → delay(1000) → ...
  Output C++ atteso:
    void setup() { pinMode(13, OUTPUT); }
    void loop() { digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000); }
  Se output diverso → BUG nel generatore corrispondente.

ESEMPIO ATTESO — v3-extra-simon:
  Input blocchi: SIMON_SCRATCH_FULL (pre-built XML)
  Output C++ atteso: Programma completo con array LED, pulsanti, random sequence, tone()
  Se output incompleto → verificare XML parsing e generators per tutti i blocchi usati.
```

**CoV FASE 1:**
- [ ] Side-by-side layout visibile su TUTTI i 12 AVR
- [ ] Compilazione produce output su almeno 10/12
- [ ] v3-cap6-blink codice C++ valido
- [ ] v3-extra-simon Scratch genera C++ completo
- [ ] Build 0 errori

**Auto-Score:** [__/10] — Motivazione: [___]

---

## FASE 2 — DRAG & DROP LIBERO MODE FIX (20 min)

### Step-Back (Sistema di drag complessivo):
```
[STEP-BACK] Il drag & drop ha 4 layer:
Layer 1 — COMP_SIZES (SimulatorCanvas.jsx): definisce width/height per ogni tipo
Layer 2 — breadboardSnap.js: calcola snap position ai fori della breadboard
Layer 3 — parentChild.js: gestisce relazioni parent-child (LED su resistore, etc.)
Layer 4 — NewElabSimulator.jsx: onPointerDown/Move/Up handlers

STRATEGIA: Testo dal basso (Layer 1) verso l'alto (Layer 4).
Se un componente non ha entry in COMP_SIZES → non puo' essere piazzato.
```

### Investigazione sistematica (ReAct):
```
PER OGNI componente nella palette:
  [THOUGHT] Testo {componente} in modalita' Libero.
  [ACTION] Click su {componente} nella palette → drag sulla breadboard.
  [OBSERVATION] Drag: [funziona/bloccato]. Snap: [corretto/errato/assente]. Spostamento post-piazzamento: [OK/broken].
  [THOUGHT] Se bloccato: verifico COMP_SIZES per '{tipo}'. Se assente → aggiungere.
            Se snap errato: verifico breadboardSnap.js per calcolo posizione.
            Se spostamento broken: verifico onPointerMove handler.
```

### Lista componenti da testare (TUTTI):
| # | Componente | Tipo key | COMP_SIZES presente? | Drag OK? | Snap OK? | Move OK? |
|---|-----------|----------|---------------------|----------|----------|----------|
| 1 | LED rosso | led | | | | |
| 2 | LED verde | led | | | | |
| 3 | LED giallo | led | | | | |
| 4 | LED blu | led | | | | |
| 5 | Resistor 220 | resistor | | | | |
| 6 | Resistor 330 | resistor | | | | |
| 7 | Resistor 1k | resistor | | | | |
| 8 | Resistor 10k | resistor | | | | |
| 9 | Pulsante | button | | | | |
| 10 | Buzzer | buzzer | | | | |
| 11 | Potenziometro | potentiometer | | | | |
| 12 | Fotoresistenza | photoresistor | | | | |
| 13 | Diodo | diode | | | | |
| 14 | MOSFET-N | mosfet-n | | | | |
| 15 | RGB LED | rgb-led | | | | |
| 16 | Motor DC | motor-dc | | | | |
| 17 | Servo | servo | | | | |
| 18 | Reed Switch | reed-switch | | | | |
| 19 | Fototransistor | phototransistor | | | | |
| 20 | Condensatore | capacitor | | | | |
| 21 | LCD | lcd | | | | |

### File coinvolti:
- `NewElabSimulator.jsx` — drag handlers
- `parentChild.js` — parent-child drag system
- `breadboardSnap.js` — pin-to-hole snapping
- `SimulatorCanvas.jsx` — SVG container events + COMP_SIZES

**CoV FASE 2:**
- [ ] TUTTI i 21 componenti draggabili dalla palette
- [ ] TUTTI i componenti piazzabili sulla breadboard
- [ ] TUTTI i componenti spostabili dopo piazzamento
- [ ] Snap ai fori funzionante
- [ ] Nessun componente "bloccato"
- [ ] Build 0 errori

**Auto-Score:** [__/10] — Motivazione: [___]

---

## FASE 3 — NANO R4 BOARD VISUAL PERFECTION (30 min)

### Constitutional Self-Critique:
```
[SELF-CRITIQUE] Dopo ogni modifica visiva alla board:
1. La board sembra REALE? Confronto pixel-per-pixel con le 5 foto hardware.
2. Ho rotto qualcosa? Verifico 47 pin positions IMMUTATI.
3. E' MEGLIO di prima? Se no, revert.
4. Un insegnante di elettronica la riconoscerebbe? Se no, non e' abbastanza buona.
```

### Checklist visiva (con Contrastive):
| # | Elemento | BUONO (target) | CATTIVO (evitare) |
|---|----------|----------------|-------------------|
| 1 | Semicerchio | Forma circolare precisa, PCB verde scuro | Rettangolo con angoli arrotondati |
| 2 | ELAB text | Verticale, ruotato -90, sul semicerchio | Orizzontale, fuori posizione |
| 3 | Nano slot | Indentazione visibile dove il Nano si inserisce | Nessuna indicazione slot |
| 4 | Wing tab | Angoli R=4-5, proporzionato | Angoli squadrati, troppo stretto |
| 5 | Barrel jack | Connettore cilindrico VIN, etichetta 5-20V | Assente o quadrato |
| 6 | LED blu | 3 LED blu breakout, glow visibile | Assenti o colore errato |
| 7 | USB-C | Proporzionato, bordo sinistro nano | Troppo grande o mal posizionato |
| 8 | MCU chip | Rettangolo con dot marker (RA4M1) | Quadrato generico |
| 9 | Pin labels | Leggibili, corretti (D2-D13, A0-A5) | Assenti o illeggibili |
| 10 | Status LEDs | PWR verde, D13 ambra, TX/RX arancio | Tutti stesso colore |

### Pin position IMMUTABILI (47 pin):
```
Header:  PIN_START_X=20, PIN_PITCH=7.5, TOP_PIN_Y=35, BOTTOM_PIN_Y=64
Wing:    WING_PIN_START_X=62, WING_PIN_PITCH=5.0, WING_PIN_Y=78
COMP_SIZES: width=168, height=99
```
**VINCOLO INVIOLABILE**: Qualsiasi modifica che altera questi valori viene REVERTITA immediatamente.

**CoV FASE 3:**
- [ ] Build 0 errori
- [ ] SVG rendering match con foto hardware (8/10 elementi)
- [ ] 47 pin positions immutate (verificare con `grep PIN_START`)
- [ ] Reset button funziona
- [ ] Status LEDs funzionano
- [ ] Running indicator funziona
- [ ] LED glow funziona

**Auto-Score:** [__/10] — Motivazione: [___]

---

## FASE 4 — SIMON GAME PERFECTION (30 min)

### Step-Back (Analisi Simon come sistema):
```
[STEP-BACK] Simon Says e' un sistema con:
- INPUT: 4 pulsanti (D3, D5, D6, D13)
- OUTPUT: 4 LED (D9=rosso, D10=verde, D11=blu, D12=giallo) + buzzer (D8)
- LOGICA: sequenza random crescente, match giocatore, game over se errore
- FREQUENZE: 262Hz, 330Hz, 392Hz, 523Hz (do, mi, sol, do alto)
- CRESCITA: velocita' aumenta con livello

Devo verificare:
1. Hardware layout (componenti + wiring)
2. Software logic (Scratch XML → C++ → compilazione)
3. Simulazione (LED glow, buzzer tone, input detection)
```

### Verifica con Chrome:
1. Carica v3-extra-simon
2. "Gia Montato": 4 LED + 4 pulsanti + buzzer piazzati correttamente
3. "Passo Passo": guida step-by-step con buildSteps
4. "Libero": piazzamento manuale funziona
5. Wiring: wing pins → breadboard corretti
6. Scratch XML: genera C++ valido e COMPLETO
7. Default C++ code: compila senza errori

**CoV FASE 4:**
- [ ] Simon carica senza errori console
- [ ] 4 LED visibili e posizionati (colori corretti)
- [ ] 4 pulsanti visibili e posizionati
- [ ] Buzzer presente
- [ ] Wiring corretto (wing → breadboard)
- [ ] Scratch genera C++ valido
- [ ] Default C++ compila
- [ ] 3 modalita funzionano
- [ ] Build 0 errori

**Auto-Score:** [__/10] — Motivazione: [___]

---

## FASE 5 — TUTTI GLI ESPERIMENTI VERIFICATI (45 min)

### Self-Consistency (3 verifiche indipendenti):
```
Per ogni volume, esegui 3 verifiche indipendenti:
1. LOAD TEST: carica ogni esperimento, conta console errors
2. VISUAL TEST: verifica componenti visibili e posizionati
3. MODE TEST: verifica 3 modalita' (Gia Montato, Passo Passo, Libero)

Se 2/3 verifiche passano ma 1 fallisce → investigare il fallimento.
Se tutte e 3 passano → PASS confermato.
```

### Matrice risultati:
```
Vol1 (38 esperimenti v1-*):  [__/38] caricano  [__/38] visual OK  [__/38] 3 mode OK
Vol2 (18 esperimenti v2-*):  [__/18] caricano  [__/18] visual OK  [__/18] 3 mode OK
Vol3 (14 esperimenti v3-*):  [__/14] caricano  [__/14] visual OK  [__/14] 3 mode OK
                              Scratch: [__/12] AVR con tab Blocchi  [__/12] C++ valido
```

**CoV FASE 5:**
- [ ] 38/38 Vol1 caricano
- [ ] 18/18 Vol2 caricano
- [ ] 14/14 Vol3 caricano
- [ ] Scratch su 12/14 AVR
- [ ] 3 modalita su tutti
- [ ] Build 0 errori

**Auto-Score:** [__/10] — Motivazione: [___]

---

## FASE 6 — CIRCUIT SOLVER RESPONSIVE (20 min)

### Breakpoints da testare:
| Breakpoint | Device | Width | Criteri chiave |
|-----------|--------|-------|----------------|
| XS | iPhone SE | 375px | Board visibile, touch 44px, toolbar stacked |
| SM | iPad portrait | 768px | Side panels collapse, Scratch vertical |
| MD | iPad landscape | 1024px | Full layout, toolbar fits |
| LG | Desktop | 1280px | All panels visible, no overflow |
| XL | Wide | 1920px | No stretching, centered content |

### ReAct per ogni breakpoint:
```
[THOUGHT] Testo a {width}px. Mi aspetto: {criteri_chiave}.
[ACTION] Resize Chrome a {width}px. Screenshot.
[OBSERVATION] Board: [visibile/tagliata]. Toolbar: [OK/overflow]. Touch: [{size}px].
[THOUGHT] {PASS/FAIL}. Se FAIL: causa = {ipotesi}.
```

**CoV FASE 6:**
- [ ] Visibile a 375px
- [ ] Visibile a 768px
- [ ] Visibile a 1024px
- [ ] Visibile a 1280px
- [ ] Pin coerenti dopo resize
- [ ] Pulsanti >= 44px
- [ ] Build 0 errori

**Auto-Score:** [__/10] — Motivazione: [___]

---

## FASE 7 — GALILEO INTEGRATION CHECK (15 min)

### Verifica (ReAct pattern):
```
[THOUGHT] Testo Galileo chat. Mi aspetto: contesto esperimento, action tags funzionanti.
[ACTION] Apro chat, scrivo "avvia la simulazione".
[OBSERVATION] Risposta: [contiene/non contiene] [AZIONE:play]. Simulazione: [avviata/ferma].
```

### Action tags da testare:
| # | Comando | Tag atteso | Risultato |
|---|---------|-----------|-----------|
| 1 | "avvia la simulazione" | [AZIONE:play] | |
| 2 | "ferma" | [AZIONE:pause] | |
| 3 | "pulisci tutto" | [AZIONE:clearall] | |
| 4 | "carica il blink" | [AZIONE:loadexperiment:v3-cap6-blink] | |
| 5 | "compila il codice" | [AZIONE:compile] | |

**CoV FASE 7:**
- [ ] Chat funziona
- [ ] Action tags 5/5 testati
- [ ] Contesto esperimento visibile
- [ ] Build 0 errori

**Auto-Score:** [__/10] — Motivazione: [___]

---

## FASE 8 — SKILL CREATION & DOCUMENTATION (20 min)

### Skills da creare/aggiornare:
1. `nano-breakout` — Pin positions, layout constants, DWG reference
2. Verifica skill esistenti: `arduino-simulator`, `tinkercad-simulator`, `volume-replication`

### Documentazione:
1. Aggiorna PDR con stato attuale
2. Crea `ragionamenti/SESSION-FINAL-REPORT.md`
3. Aggiorna `cov-tracking.md` con tutti i check finali

**CoV FASE 8:**
- [ ] nano-breakout SKILL.md aggiornato
- [ ] PDR aggiornato
- [ ] Report finale scritto
- [ ] Build 0 errori

**Auto-Score:** [__/10] — Motivazione: [___]

---

## FASE 9 — DEPLOY & PUSH (10 min)

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm run build
npx vercel --prod --yes
git add -A
git commit -m "S114: Systematic sprint — [lista fix] [{N} verifiche, {M} bug risolti]"
git push origin main
```

**CoV FINALE:**
- [ ] Build 0 errori
- [ ] Deploy Vercel OK
- [ ] Git push OK
- [ ] Tutti i file committati
- [ ] Nessuna regressione
- [ ] Sistema pronto per allenamento Qwen

**Auto-Score:** [__/10] — Motivazione: [___]

---

## VOICE INTEGRATION DESIGN (documentazione, non implementazione)

### Architettura pipeline:
```
microfono LIM → VAD (Silero) → STT (whisper.cpp/faster-whisper)
    → Nanobot → DeepSeek Chat/R1
    → comando simulatore + risposta
    → Piper TTS → speaker LIM
```

### 7 abilita vocali:
1. Domande circuito ("Perche il LED non si accende?")
2. Comandi simulatore ("Aumenta R1 a 1k")
3. Guida passaggi ("Iniziamo il passaggio 2")
4. Adattamento spiegazione ("Spiegalo piu semplice")
5. Domande alla classe ("Cosa succede senza resistenza?")
6. Riassunti ("Riassumi questo esperimento")
7. Ritmo lezione ("Fermiamoci un attimo")

### Stack gratuito:
- STT: whisper.cpp o faster-whisper
- VAD: Silero VAD (<1ms per chunk)
- TTS: Piper (fast, local neural TTS)
- AI: DeepSeek via Nanobot (gia in stack)
- Wake word: Porcupine "ELAB" (opzionale)
- Noise: RNNoise (noise suppression)
- Echo: WebRTC APM (AEC, AGC)

### Fasi implementazione:
- Fase 1: whisper.cpp + Piper + DeepSeek + 4 intenti base
- Fase 2: Silero VAD + RNNoise + explain levels
- Fase 3: domande classe + wake word + echo cancellation

**File:** Creare `ragionamenti/voice-integration-design.md` con dettagli completi

---

## LOOP AUTO-MIGLIORANTE CON REFLEXION (10 ITERAZIONI)

### Meccanismo Avanzato (ReAct + Reflexion + Constitutional + Self-Consistency)

Dopo aver completato TUTTE le fasi (0-9), il prompt RICOMINCIA DA CAPO.
Ogni iterazione usa un protocollo di auto-miglioramento multi-livello.

### Struttura Loop

```
PER iterazione = 1 a 10:

  ╔══════════════════════════════════════════════════╗
  ║  STEP 1: SCAN (Observation)                      ║
  ╚══════════════════════════════════════════════════╝
  Apri Chrome, naviga su www.elabtutor.school
  Scrivi: ragionamenti/LOOP-{iterazione}-scan.md

  ╔══════════════════════════════════════════════════╗
  ║  STEP 2: HUNT (ReAct — Reason before Acting)    ║
  ╚══════════════════════════════════════════════════╝
  Per OGNI area, ragiona esplicitamente:
  [THOUGHT] Cerco bug nell'area {X}. Le aree piu' probabili sono...
  [ACTION] Navigo a {pagina/esperimento/componente}.
  [OBSERVATION] Trovo: {bug/imperfezione/tutto OK}.
  [THOUGHT] Se bug: la causa probabile e' {ipotesi}. Verifico con {azione}.

  Aree da cacciare:
  a. Console errors (0 tollerati)
  b. Visual glitches (rendering, allineamento, colori)
  c. Drag & drop broken (OGNI componente)
  d. Scratch compilation (OGNI esperimento AVR)
  e. 3 modalita (Gia Montato, Passo Passo, Libero)
  f. Responsive (375px, 768px, 1024px, 1280px)
  g. Galileo chat (contesto, action tags, vision)
  h. Wiring (connessioni wing → breadboard)
  i. Simon game (4 LED, 4 pulsanti, buzzer, sequenza)
  j. Pin positions (47 pin IMMUTATI)

  ╔══════════════════════════════════════════════════╗
  ║  STEP 3: DOCUMENT (Structured Output)            ║
  ╚══════════════════════════════════════════════════╝
  Scrivi `ragionamenti/LOOP-{iterazione}-findings.md`:
  ```markdown
  # Loop {iterazione} — Findings
  ## Data/Ora: {timestamp}
  ## Bug Trovati
  | # | Area | Severita | Descrizione | Evidenza | Fix proposto |
  |---|------|----------|-------------|----------|-------------|
  | 1 | ... | P0/P1/P2 | ... | screenshot/log | ... |

  ## Imperfezioni Estetiche
  | # | Elemento | Atteso | Attuale | Fix |
  |---|----------|--------|---------|-----|

  ## Suggerimenti Miglioramento
  - [suggerimento con motivazione]

  ## Score vs Iterazione Precedente
  | Metrica | Precedente | Attuale | Delta |
  |---------|-----------|---------|-------|
  ```

  ╔══════════════════════════════════════════════════╗
  ║  STEP 4: FIX (Tree-of-Thought per ogni bug)     ║
  ╚══════════════════════════════════════════════════╝
  Per ogni bug trovato:
  1. ToT: 2-3 approcci possibili
  2. Scegli il migliore con giustificazione
  3. Implementa
  4. Build check dopo OGNI fix
  5. CoV dopo OGNI fix
  6. Git commit dopo OGNI fix

  ╔══════════════════════════════════════════════════╗
  ║  STEP 5: VERIFY (Self-Consistency × 3)           ║
  ╚══════════════════════════════════════════════════╝
  Per ogni fix, verifica con 3 metodi indipendenti:
  1. Build: npm run build (0 errori)
  2. Visual: Chrome screenshot/inspection
  3. Functional: interazione diretta (click, drag, type)
  Se 2/3 passano → PASS. Se < 2/3 → revert e approccio alternativo.

  ╔══════════════════════════════════════════════════╗
  ║  STEP 6: REFLEXION (Auto-critica)                ║
  ╚══════════════════════════════════════════════════╝
  Scrivi in ragionamenti/LOOP-{iterazione}-reflexion.md:
  ```markdown
  ## Cosa ho fatto bene in questa iterazione?
  ## Cosa ho fatto male?
  ## Quali pattern di bug ricorrono?
  ## Cosa devo controllare MEGLIO nella prossima iterazione?
  ## Il mio ragionamento era corretto? Dove mi sono sbagliato?
  ## Confidence score: [__/10]
  ```

  ╔══════════════════════════════════════════════════╗
  ║  STEP 7: DEPLOY (se ci sono fix)                 ║
  ╚══════════════════════════════════════════════════╝
  npm run build (0 errori) → npx vercel --prod --yes → git push origin main

  ╔══════════════════════════════════════════════════╗
  ║  STEP 8: EVOLVE (Constitutional Self-Improvement)║
  ╚══════════════════════════════════════════════════╝
  Aggiorna QUESTO PROMPT con:
  - Nuovi check scoperti (aggiungi a CoV)
  - Pattern di bug ricorrenti (aggiungi a Contrastive)
  - Criteri di qualita' raffinati (aggiorna Scoring Rubric)
  - Lezioni apprese (aggiungi a ragionamenti/)

  ╔══════════════════════════════════════════════════╗
  ║  STEP 9: COMPARE (Trend Analysis)                ║
  ╚══════════════════════════════════════════════════╝
  Confronta con iterazione precedente:
  - Quanti bug risolti? Quanti nuovi introdotti?
  - Score complessivo migliorato/peggiorato?
  - Trend: convergenza verso perfezione?

  ═══════════════════════════════════════════════════
  CONDIZIONE DI USCITA:
  SE 0 bug trovati per 2 iterazioni consecutive:
    → SISTEMA PERFETTO
    → Scrivi ragionamenti/LOOP-FINAL-REPORT.md
    → Deploy finale + git push
    → BREAK
  ═══════════════════════════════════════════════════
```

### Focus per iterazione (con escalation):
| Iterazione | Focus primario | Tecnica PE dominante |
|-----------|---------------|---------------------|
| 1 | Scratch compilation su TUTTI i 12 AVR | ReAct + Few-Shot |
| 2 | Drag & drop su TUTTI i componenti in Libero | Step-Back + ToT |
| 3 | Simon game perfection + wiring | Contrastive + CoT |
| 4 | Responsive su 4 breakpoints | Self-Consistency × 3 |
| 5 | Galileo integration + action tags | ReAct + Reflexion |
| 6 | NanoR4Board visual vs foto hardware | Constitutional Critique |
| 7 | Tutti 70 esperimenti — 3 modalita | Self-Consistency + Scoring |
| 8 | Console errors + performance | Meta-Cognitive + Step-Back |
| 9 | Accessibilita + touch targets | Contrastive + Scoring |
| 10 | Final polish + Qwen readiness | ALL techniques combined |

### Metriche di qualita per iterazione
| Metrica | Target | Peso |
|---------|--------|------|
| Console errors | 0 | 15% |
| Build errors | 0 | 15% |
| Scratch compilation pass rate | 12/12 AVR | 15% |
| Drag & drop pass rate | 100% componenti | 10% |
| 3 modalita pass rate | 100% esperimenti | 10% |
| Responsive pass rate | 4/4 breakpoints | 10% |
| Galileo action tags | 13/13 | 10% |
| Pin positions immutate | 47/47 | 10% |
| Simon game functional | 100% | 5% |

### Score complessivo formula:
```
SCORE = Σ (metrica_pass_rate × peso) × 10
Target: >= 9.5/10 per "sistema perfetto"
```

---

## REGOLE ASSOLUTE (CONSTITUTIONAL — inviolabili)

1. **MAI REGREDIRE** — se un fix rompe qualcosa, annullalo IMMEDIATAMENTE
2. **CoV dopo OGNI fase** — non procedere senza verificare TUTTO con evidenza
3. **Build check** — `npm run build` DEVE passare con 0 errori
4. **Pin positions IMMUTABILI** — i 47 pin non si toccano MAI
5. **Ralph Loop** — Load → Test → Verify → Next
6. **Git commit** dopo ogni fase completata (breadcrumb per rollback)
7. **Ragionamenti** — documenta OGNI decisione in `ragionamenti/` con CoT esplicito
8. **Chrome test** — testa VISIVAMENTE in produzione, mai fidarsi solo del build
9. **Drag & Drop** — verifica su TUTTI i componenti (21 tipi)
10. **3 modalita** — SEMPRE verificare Gia Montato + Passo Passo + Libero
11. **Auto-Score** — valutati con la Scoring Rubric dopo OGNI fase (minimo 7/10)
12. **Reflexion** — scrivi cosa hai imparato dopo OGNI iterazione del loop

---

## ANTI-PATTERN DA EVITARE (Contrastive — lista negativa)

| # | Anti-Pattern | Perche' e' dannoso | Cosa fare invece |
|---|-------------|-------------------|-----------------|
| 1 | Fixare senza capire | Introduce regressioni | Step-Back → analizza il sistema → poi fixa |
| 2 | Saltare la verifica | Bug nascosti si accumulano | CoV SEMPRE prima di procedere |
| 3 | Commit senza build | Deploy rotto | `npm run build` PRIMA di ogni commit |
| 4 | Toccare i pin positions | Rompe TUTTI gli esperimenti | Pin sono IMMUTABILI — punto |
| 5 | Trial-and-error cieco | Spreco di tempo, regressioni | ToT → scegli il path migliore → implementa |
| 6 | Ignorare console errors | Problemi latenti | 0 errori tollerati, investigare OGNI warning |
| 7 | Testare solo "Gia Montato" | Passo Passo e Libero broken | SEMPRE testare tutte e 3 le modalita |
| 8 | Non documentare | Contesto perso tra iterazioni | ragionamenti/ scritto per OGNI decisione |
| 9 | Ottimismo non fondato | Score gonfiati → falsa sicurezza | Solo PASS con evidenza verificabile |
| 10 | Fixare troppi bug insieme | Impossibile trovare la causa di regressioni | 1 fix → 1 build → 1 CoV → 1 commit |

---

## RIFERIMENTI

| Risorsa | Path |
|---------|------|
| NanoR4Board.jsx | `src/components/simulator/components/NanoR4Board.jsx` |
| scratchGenerator.js | `src/components/simulator/panels/scratchGenerator.js` |
| experiments-vol3.js | `src/data/experiments-vol3.js` |
| experiments-vol2.js | `src/data/experiments-vol2.js` |
| experiments-vol1.js | `src/data/experiments-vol1.js` |
| NewElabSimulator.jsx | `src/components/simulator/NewElabSimulator.jsx` |
| CircuitSolver.js | `src/components/simulator/engine/CircuitSolver.js` |
| parentChild.js | `src/components/simulator/utils/parentChild.js` |
| breadboardSnap.js | `src/components/simulator/utils/breadboardSnap.js` |
| SimulatorCanvas.jsx | `src/components/simulator/SimulatorCanvas.jsx` |
| PDR | `sessioni/PDR-ATTUALE-03-03-2026.md` |
| Bug List | `.claude/prompts/overnight-sprint/context-bug-list.md` |
| Scratch Fix Context | `.claude/prompts/overnight-sprint/context-scratch-fix.md` |
| Voice Design | `.claude/prompts/overnight-sprint/context-voice-integration.md` |
| Fritzing Parts | https://github.com/fritzing/fritzing-parts |
| SparkFun Parts | https://github.com/sparkfun/Fritzing_Parts |
