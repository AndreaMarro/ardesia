# PDR V4 — ELAB Tutor: Livello Successivo (Parità Reale + UX Perfetta + Progetto Adattivo)

> Versione: 4.0 | Data: 04/04/2026
> Prerequisito: PDR V3 iter1 completata (6 fix, score ~7.3)
> Durata: Ralph Loop max 100 iterazioni
> Obiettivo: Score composito >= 8.5/10 con 95% benchmark PASS con EVIDENZA SCREENSHOT

---

## CONTESTO CRITICO — FEEDBACK UTENTE DIRETTO (04/04/2026)

L'utente (Andrea, UNICO sviluppatore, stakeholder importanti aspettano) ha segnalato:

1. **ESPERIMENTI FRAMMENTATI**: L'app ha TROPPI esperimenti — ha creato esperimenti separati per fasi/varianti che nel libro sono DENTRO lo stesso esperimento. Un esperimento nel libro = UN esperimento nell'app. PARITÀ ESATTA con i 3 volumi TRES JOLIE.
2. **UNLIM NON RICHIAMABILE**: Quando chiudi UNLIM, la mascotte NON funziona per riaprirlo. Verificato dall'utente sulla produzione.
3. **MASCOTTE FLUTTUANTE ASSENTE**: La mascotte draggabile non c'è o non funziona.
4. **PENNA NON DAL PRIMO CLICK**: Il DrawingOverlay non si attiva se non hai caricato un esperimento.
5. **PANNELLI NON INTUITIVI**: I resize handle sono poco visibili, i pannelli non sono facilmente allargabili/spostabili.
6. **MODALITÀ PROGETTO**: Il cuore pedagogico — deve essere PERFETTA, adattiva, basata sui volumi + sessioni passate.
7. **VIDEO YOUTUBE**: La finestra Video deve embeddare YouTube DENTRO la finestra (no redirect).
8. **ONESTÀ BRUTALE**: Mai inflare i score. Verificare TUTTO con screenshot/console/curl.

---

## PRINCIPI IMMUTABILI (violazione = REVERT immediato)

1. **PRINCIPIO ZERO**: Solo il docente usa ELAB Tutor sulla LIM davanti alla classe. Gli studenti guardano. Ogni scelta UX serve il docente che spiega a 3 metri di distanza.
2. **ZERO REGRESSIONI**: `npx vitest run` (1430+) + `npm run build` (30+ precache) DOPO OGNI singolo fix. Se falliscono, REVERT IMMEDIATO con `git checkout -- file`.
3. **ENGINE INTOCCABILE**: MAI modificare CircuitSolver.js, AVRBridge.js, SimulationManager.js, avrWorker.js (funzionalmente).
4. **ZERO DEMO/MOCK**: Tutto deve funzionare con dati reali. Mai dati finti.
5. **ONESTÀ BRUTALE**: Mai auto-assegnare score >7 senza evidenza runtime (screenshot + console + curl).
6. **PARITÀ VOLUMI ESATTA**: Un esperimento nel libro = UN esperimento nell'app. NO frammenti, NO fasi separate. Titoli identici ai libri.
7. **COV OBBLIGATORIA**: Chain of Verification dopo OGNI ciclo.

---

## FASE 0 — BOOTSTRAP (1 sola volta, ~1 iterazione)

### 0.1 Leggi TUTTO il contesto (IN ORDINE — usa Read tool)
```
1. CLAUDE.md (regole progetto)
2. Memory MEMORY.md (tutte le entry)
3. docs/MAPPING-VOLUMI-APP.md (mappa attuale esperimenti)
4. docs/BUG-LIST-COMPLETA.md (bug aperti + fixati)
5. docs/BENCHMARK-100-PARAMETRI.md (score per area)
6. docs/STRESS-TEST-RISULTATI.md (test runtime)
7. docs/prompts/PDR-LIVELLO-SUCCESSIVO-V3.md (prompt precedente)
8. Memory G45-audit-brutale.md (score reale 5.8)
9. Memory pdr-session-04apr2026.md (sessione precedente)
10. Memory unlim-vision-core.md (visione UNLIM)
11. Memory feedback_no_overlay.md
12. Memory feedback_pannelli_manipolabili.md
13. Memory feedback_no_demo.md
```

### 0.2 Leggi i 3 volumi SORGENTE dalla cartella TRES JOLIE
```bash
export PATH="/opt/homebrew/bin:$PATH"
# Vol1:
pdftotext "ELAB - TRES JOLIE/1 ELAB VOLUME UNO/2 MANUALE VOLUME 1/MANUALE VOLUME 1 ITALIANO.pdf" /tmp/vol1.txt
# Vol2:
pdftotext "ELAB - TRES JOLIE/2 ELAB VOLUME DUE/2 MANUALE VOLUME  2/MANUALE VOLUME 2 ITALIANO.pdf" /tmp/vol2.txt
# Vol3:
pdftotext "PRODOTTO/elab-builder/public/volumes/volume3.pdf" /tmp/vol3.txt
```
Per OGNI volume: conta SOLO gli esperimenti ESPLICITI (con header "ESPERIMENTO N").
Le varianti/fasi/esercizi DENTRO lo stesso esperimento NON sono esperimenti separati.
Crea una tabella: ID libro → ID app → STATUS (OK/FRAMMENTATO/MANCANTE/EXTRA)

### 0.3 Anti-regressione baseline
```bash
cd "VOLUME 3/PRODOTTO/elab-builder"
npx vitest run                    # DEVE essere 1430+
npm run build                     # DEVE passare, 30+ precache
find src -type f | wc -l          # DEVE essere >= 365
git diff --name-only | grep -E "CircuitSolver|AVRBridge|SimulationManager|avrWorker"  # solo copyright OK
```

### 0.4 Verifica LIVE su PRODUZIONE con Control Chrome
Apri https://www.elabtutor.school con Control Chrome e verifica OGNI punto:
```
1. Login con chiave ELAB2026 → redirect a lavagna
2. Carica v1-cap6-esp1 → LED, breadboard, batteria visibili
3. Carica v3-cap6-semaforo → 3 LED, Arduino, codice nell'editor
4. CHIUDI UNLIM → clicca mascotte → UNLIM si DEVE riaprire
   (Se NON funziona → BUG P0, fixare PRIMA di continuare)
5. La mascotte DEVE essere visibile come bottone position:fixed, DRAGGABILE
   (Se non c'è o non si trascina → BUG P0)
6. Clicca Penna nella toolbar → DrawingOverlay DEVE apparire IMMEDIATAMENTE
   (Anche SENZA esperimento caricato → test su pagina vuota)
7. Apri Percorso → FloatingWindow con 5 fasi (PREPARA/MOSTRA/CHIEDI/OSSERVA/CONCLUDI)
   - DEVE essere draggabile (trascina dalla title bar)
   - DEVE essere ridimensionabile (handle angolo basso-destro VISIBILE e INTUITIVO)
   - DEVE essere minimizzabile (bottone −)
   - DEVE essere chiudibile (bottone ×)
   - DEVE essere riapribile (dal bottone Percorso nell'header)
8. Apri Manuale → PDF viewer con tab Vol1/Vol2/Vol3
   - Stesse proprietà di 7 (drag/resize/min/close/reopen)
9. Apri Video → YouTube search + iframe embed
   - Video si guarda DENTRO la finestra (MAI redirect a YouTube.com)
   - Stesse proprietà di 7
10. Resize 1024x768 (LIM) → tutto visibile, font >= 14px
11. Resize 1920x1080 (PC) → canvas auto-fit, sidebar visibile
12. Console errors (browser DevTools) → ZERO errori (non contare HMR buffer)
```
OGNI test FAIL = BUG P0. Documentare e fixare PRIMA di FASE 1.

---

## FASE 1 — PARITÀ VOLUMI ESATTA (~10-15 iterazioni)

### Principio: UN esperimento nel libro = UN esperimento nell'app

### 1.1 Conta esperimenti REALI nei PDF
Per ogni volume, conta SOLO:
- Header espliciti "ESPERIMENTO N" (con numero)
- Header espliciti "ESERCIZIO N.M" (con numero)
- "Mini-progetto" o "Progetto" espliciti

NON contare:
- Varianti ("Prova a cambiare...", "Sfida: aggiungi...")
- Fasi interne ("Fase 1: collega...", "Fase 2: misura...")
- Suggerimenti ("Giocando con l'esperimento 4 prova a...")

### 1.2 Dati REALI dal PDF Vol3 (verificati con pdftotext 04/04/2026)
```
LIBRO Vol3 (bozza v0.8.1): 8 attivita totali
  Cap5: 0 esperimenti espliciti (walkthrough Blink, no header ESPERIMENTO)
  Cap6: 5 ESPERIMENTO numerati:
    - ESP1: Colleghiamo la resistenza (LED su pin 13)
    - ESP2: Cambia il numero di pin
    - ESP3: Codice Morse (SOS)
    - ESP4: Due LED effetto polizia
    - ESP5: Il semaforo
  Cap7: 1 ESERCIZIO (7.3: pulsante INPUT_PULLUP) + 1 Mini-progetto (Due LED un pulsante)
  Cap8: 0 espliciti (walkthrough analogRead + Serial, no header ESPERIMENTO)
  Cap9-12: STUB VUOTI (solo titoli, pagine bianche)

APP Vol3: 26 esperimenti → 14 EXTRA non nel libro, 2 MANCANTI dal libro
  EXACT MATCH (4): v3-cap6-esp2, v3-cap6-esp3→WRONG (è Cambia pin, non Morse!), v3-cap6-esp4, v3-cap6-semaforo
  MANCANTI (2): Codice Morse (ESP3), Cambia velocita lampeggio
  EXTRA (14): debounce, PWM, DAC, trimmer+LED, serial plotter, LCD, servo, Simon Says, AND/OR
  DERIVED (6): Blink walkthrough, pulsante, serial/analog

AZIONE: Unire i derivati dove possibile, aggiungere i 2 mancanti, marcare i 14 extra come BONUS.
```

### 1.2b Confronta con l'app
Per ogni esperimento nell'app:
- Se corrisponde a un esperimento ESPLICITO del libro → MANTIENI con titolo IDENTICO al libro
- Se è derivato dal walkthrough del libro (Cap5 Blink, Cap8 Serial) → MANTIENI come esperimento derivato ma NON come numerato del libro
- Se è un extra non nel libro (PWM, DAC, LCD, Servo, Simon Says) → MARCA come "BONUS" separato
- Se MANCA dal libro → AGGIUNGI (ESP3 Codice Morse!)
- Se un ID non corrisponde al contenuto (es. v3-cap6-esp3 non è Morse) → FIX ID/contenuto

### 1.3 Risultato atteso
Dopo questa fase:
- Vol1: 38 esperimenti (confermato OK)
- Vol2: 27 esperimenti (confermato OK — 2 derivati dal libro)
- Vol3: 8 esperimenti ESATTI dal libro + N derivati + N bonus SEPARATI
- I titoli nell'app CORRISPONDONO ai titoli nel libro
- Codice Morse (ESP3) AGGIUNTO se mancante
- Aggiorna `docs/MAPPING-VOLUMI-APP.md` con la nuova mappa ESATTA

### 1.4 Test di conferma
Per OGNI esperimento rimasto:
```
1. loadExperiment(id) via __ELAB_API
2. screenshot → componenti montati correttamente
3. connections non vuote (per esperimenti non-passivi)
4. Se Vol3 con code: codice nell'editor corrisponde al libro
5. Se Vol3 con HEX: Play → LED/Buzzer/Servo/LCD rispondono
6. Console errors → ZERO
```

---

## FASE 2 — SIMULATORE + COMPILATORE + SCRATCH PERFETTI (~20 iterazioni)

### 2.1 Fisica degli oggetti — 12 stress test SEVERI
Per 5 esperimenti rappresentativi (1 semplice + 1 medio + 1 complesso per volume):
```
1. Trascina componente dalla palette → snap ai buchi breadboard
2. Sposta componente → tutti i fili collegati seguono
3. Collega filo tra due pin → contatto funzionante nella simulazione
4. Filo nel punto SBAGLIATO → circuito NON funziona (correttamente)
5. Rimuovi filo → circuito aggiornato immediatamente
6. Undo/Redo 10 operazioni → stato perfetto, nessun crash
7. Zoom in/out → layout coerente
8. 15 componenti contemporanei → nessun rallentamento
9. Play/Stop → transizione pulita
10. Touch: drag funziona con il dito (iPad simulato 768x1024)
11. Pin cliccabili min 44px touch target
12. Nessun componente scappa dalla posizione dopo drag
```

### 2.2 Test OGNI esperimento
Per OGNI esperimento (tutti i volumi, compresi BONUS):
```
loadExperiment(id) → screenshot → verifica componenti → console 0 errors
```

### 2.3 Compilatore C++ (Vol3)
Per OGNI esperimento Vol3 con code !== null:
```
1. Tab Arduino C++ → codice presente
2. Compila → DEVE compilare (o errore kid-friendly in italiano)
3. Retry dopo errore → funziona senza reload
```

### 2.4 Scratch/Blockly
```
1. Tab Blocchi → 12 categorie in italiano
2. Blocchi pre-caricati per esperimenti con scratchXml
3. Switch Arduino/Blocchi → codice preservato
```

---

## FASE 3 — UX LAVAGNA PERFETTA (~15 iterazioni)

### 3.1 I 5 pannelli FloatingWindow
TUTTI devono avere QUESTE proprietà (verificare con screenshot + inspect):
- **Draggabili** (trascinamento dalla title bar)
- **Ridimensionabili** (handle angolo basso-destra VISIBILE ≥ 20px, cursor: nwse-resize)
- **Minimizzabili** (bottone −)
- **Massimizzabili** (bottone □)
- **Chiudibili** (bottone ×)
- **Riapribili** (da bottone header o mascotte)

Pannelli:
```
1. UNLIM (GalileoAdapter) — drag, resize, min, close, riapri da MASCOTTE
2. Percorso Lezione (PercorsoPanel) — drag, resize, 5 fasi, riapri da header
3. Manuale PDF (VolumeViewer) — tab Vol1/2/3, drag, resize
4. Video (VideoFloat) — YouTube iframe embed, search, drag, resize
5. Passo Passo (ComponentDrawer/ExperimentGuide) — se separato, deve essere FloatingWindow
```

### 3.2 Mascotte fluttuante — CRITICA
```
- Visibile SEMPRE come bottone position:fixed
- DRAGGABILE (pointerdown → pointermove → pointerup con threshold 5px)
- Click (non drag) → riapre UNLIM
- NON deve sparire MAI
- Immagine SVG o PNG, mai emoji
- Test: chiudi UNLIM → la mascotte DEVE essere visibile → cliccala → UNLIM si riapre
```

### 3.3 Penna
```
- Click Penna toolbar → DrawingOverlay fullscreen IMMEDIATAMENTE
- Deve funzionare ANCHE senza esperimento caricato (pagina iniziale)
- Toolbar colori (5) + spessori (3) visibili
- Click penna di nuovo → disattiva
```

### 3.4 Video YouTube
```
- Finestra Video DEVE embeddare iframe YouTube (youtube-nocookie.com/embed)
- Search tra video curati + "Cerca su YouTube"
- Video si guarda DENTRO la finestra FloatingWindow
- MAI redirect a YouTube.com
```

### 3.5 Responsive
| Risoluzione | Cosa verificare |
|-------------|-----------------|
| LIM 1024x768 | Tutto visibile, font >= 14px, nessun overflow |
| iPad 768x1024 | Touch targets >= 44px, pannelli usabili |
| PC 1920x1080 | Canvas auto-fit, sidebar visibile |

---

## FASE 4 — MODALITÀ PROGETTO PERFETTA (~20 iterazioni)

### Architettura (il cuore pedagogico)
La Modalità Progetto è IL differenziatore competitivo di ELAB Tutor.

```
PRINCIPI:
1. Generata dai dati dell'esperimento + lesson-paths/*.json + volumi TRES JOLIE
2. Si ADATTA in tempo reale:
   - Rallenta se l'insegnante ha difficoltà (più suggerimenti, passi più piccoli)
   - Accelera se va tutto bene (salta dettagli ovvi, vai al prossimo)
   - Usa le sessioni precedenti (unlimMemory.js) per sapere cosa è già stato fatto
3. Pannello FloatingWindow: drag, resize, minimize, close
   - NON sovrappone il circuito senza esplicito click
   - Font >= 16px (leggibile dalla classe a 3 metri dalla LIM)
   - Nessun overlay cognitivo
4. 5 fasi: PREPARA / MOSTRA / CHIEDI / OSSERVA / CONCLUDI
5. Basata su cosa dicono i volumi TRES JOLIE per quell'esperimento
6. Conosce le sessioni precedenti (unlimMemory.js)
```

### Contenuto per fase
```
PREPARA (5 min): Obiettivo, materiale, prerequisiti, suggerimento didattico
MOSTRA (10 min): Montaggio circuito passo-passo, "Monta per me" button
CHIEDI (5 min): Domanda provocatoria alla classe, errori comuni
OSSERVA (5 min): Cosa osservare, analogie dal quotidiano
CONCLUDI (5 min): Riepilogo, cosa abbiamo imparato, collegamento al prossimo
```

### Step-by-step Monta Tu
```
1. Pannello laterale/floating con istruzioni per step
2. Ogni step: componente da piazzare, posizione suggerita
3. Step completato → prossimo si illumina (verde #4A7A25)
4. Feedback: corretto = verde, sbagliato = arancione (#E8941C), MAI rosso
5. Se esperimento senza lesson-path → genera automaticamente da experiment.steps
```

### Verifica
- Apri Percorso per 5 esperimenti diversi (1 per volume + 2 misti)
- Verifica 5 fasi con contenuto SPECIFICO per quell'esperimento
- Font >= 16px (inspect computed style)
- Pannello draggabile + ridimensionabile (test drag + resize handle)
- NON copre il circuito di default (posizione e dimensione iniziali appropriate)

---

## FASE 5 — BENCHMARK 100 CON EVIDENZA (~5 iterazioni)

### Protocollo
DOPO le fasi 1-4, misura con EVIDENZA RUNTIME per ognuno dei 100 parametri.
Target: media >= 8.5/10 con ZERO dimensioni < 5.

### Le 100 dimensioni

**A. SIMULATORE (15)**
1-5: Caricamento, compilazione, play/stop, drag-snap, fili
6-10: Undo/redo, zoom, 15 componenti, LED brightness, potentiometer
11-15: LDR, Serial Monitor, Servo, LCD, multimeter

**B. SCRATCH (10)**
16-20: 12 categorie, drag blocco, Blink compila, C++ generato, errori
21-25: Switch Arduino/Scratch, fullscreen, italiano, palette ELAB, codegen

**C. COMPILATORE (5)**
26-28: Corretto compila, errore IT, warning separati
29-30: Riga evidenziata, retry

**D. UNLIM (15)**
31-35: Monta LED, aggiungi/rimuovi, pulisci, monta semaforo, compila
36-40: Scratch, Serial, capitolo, Legge Ohm, memoria
41-45: Lezione, <30s, 3 comandi, input vuoto, fallback offline

**E. PERCORSO / MONTA TU (10)**
46-50: FloatingWindow, 5 fasi, font 16px, non sovrappone, nascondibile
51-55: Allargabile, step-by-step, feedback colori, no crash senza path, prossimo

**F. DATI ESPERIMENTI (10)**
56-60: Numero uguale libri, titoli identici, componenti, schema, codice
61-65: Steps, quiz, difficoltà, concept, lesson path

**G. UX LAVAGNA (10)**
66-70: Header, toolbar, mascotte drag+click, penna immediata, 5 pannelli FW
71-75: Resize handle intuitivo, component bar, z-index, posizione salvata, riapertura

**H. RESPONSIVE (10)**
76-78: LIM overflow, LIM font, LIM toolbar
79-81: iPad touch, iPad drag, iPad canvas
82-85: PC auto-fit, PC sidebar, PC editor, nessun taglio

**I. PERFORMANCE (5)**
86-88: Build < 60s, bundle < 3000 KiB, precache >= 30
89-90: FCP < 3s, no chunk > 2MB

**J. SICUREZZA + INTEGRITÀ (10)**
91-93: Consent, localStorage bounded, API keys in env
94-95: GDPR consent, nessun dato personale in frontend
96-98: vitest 1430+, build pass, HTTP 200 sito
99-100: Zero console errors, engine intoccato

---

## PROTOCOLLO ANTI-REGRESSIONE (DOPO OGNI fix)

```bash
# STEP 1: Test (BLOCCANTE — se fallisce, REVERT con git checkout -- file)
npx vitest run
# STEP 2: Build (BLOCCANTE)
npm run build
# STEP 3: File count >= 365
find src -type f | wc -l
# STEP 4: Engine check
git diff --name-only | grep -E "CircuitSolver|AVRBridge|SimulationManager|avrWorker"
# STEP 5: Console errors via Preview tools o Control Chrome
# Zero errori (non contare HMR buffer)
```

## PROTOCOLLO CoV (dopo OGNI ciclo)
```
1. Rileggi cosa hai modificato — file, riga, cosa, perché
2. Fix MINIMALE (un cambio alla volta, max 50 righe)
3. Risolve il problema? PROVA con screenshot/console
4. Side effects? Testa un esperimento diverso
5. Test passano? vitest + build
6. > 50 righe? Probabile overengineering — riduci
7. Documenta in BUG-LIST-COMPLETA.md
```

## PROTOCOLLO QUALITY AUDIT (ogni 3 cicli)
```
Usa /code-review /quality-audit /systematic-debugging:
3 agenti in parallelo:
1. SECURITY: CSP, API keys, localStorage, consent
2. WCAG: font >= 14px, contrast AA, touch >= 44px, focus ring, ARIA
3. EXPERIMENTS: 5 esperimenti random, montaggio + compilazione + Scratch
Score composito = media. Se < 7 → prioritizza fix.
```

---

## SKILLS OBBLIGATORIE
```
/systematic-debugging   — Per ogni bug trovato
/debug                  — Debug strutturato
/architecture           — Decisioni architetturali
/frontend-design        — UX design pannelli
/elab-quality-gate      — Gate pre/post ciclo
/ricerca-bug            — Bug sistematici
/analisi-simulatore     — Debug simulatore
/lim-simulator          — Test LIM
/impersonatore-utente   — Simula docente su LIM
/code-review            — Review codice ogni 3 cicli
/quality-audit          — Audit qualità ogni 3 cicli
```

## TOOLS TASSATIVI
```
- Preview tools (preview_start, preview_screenshot, preview_eval, preview_click, preview_fill, preview_resize, preview_inspect, preview_console_logs, preview_snapshot) — per OGNI verifica locale
- Control Chrome (open_url, execute_javascript, get_page_content, get_current_tab) — test su PRODUZIONE www.elabtutor.school
- pdftotext — lettura volumi TRES JOLIE
- curl — verifiche API nanobot/backend
```

---

## REGOLE RALPH LOOP

```
MAX ITERAZIONI: 100
COMPLETION PROMISE: SCORE_COMPOSITO_GTE_8_5_AND_95_PERCENT_OF_100_BENCHMARKS_PASS_WITH_EVIDENCE

Ogni iterazione:
1. Identifica problema PIÙ GRAVE (bug utente > score basso > enhancement)
2. Root cause con /systematic-debugging
3. Fix MINIMALE
4. Anti-regressione: vitest + build + file count + engine check
5. Verifica via Preview tools (screenshot + console)
6. CoV: rileggi, verifica, documenta

Ogni 3 iterazioni:
- Quality audit 3 agenti (/code-review /quality-audit /systematic-debugging)
- Aggiorna docs/BUG-LIST-COMPLETA.md

Ogni 10 iterazioni:
- Benchmark COMPLETO 100 dimensioni con screenshot
- Deploy Vercel: npm run build && npx vercel --prod --yes
- Aggiorna docs/BENCHMARK-100-PARAMETRI.md

CONDIZIONE DI USCITA (TUTTE devono essere vere):
- 95/100 benchmark PASS con evidenza screenshot
- Media >= 8.5/10
- Zero crash
- Parità volumi ESATTA (libro = app, ZERO frammenti)
- Tutti 5 pannelli FloatingWindow funzionanti (drag+resize+min+max+close+reopen)
- Mascotte draggabile + click riapre UNLIM (VERIFICATO su produzione)
- Penna funziona dal primo click (ANCHE senza esperimento)
- Video YouTube embedded (DENTRO la finestra, NO redirect)
- Percorso 5 fasi funzionante per tutti gli esperimenti
- Responsive LIM/iPad/PC verificato con screenshot
- Console errors = 0
- 1430+ test PASS, build PASS
```
