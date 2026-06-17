# PDR V3 — ELAB Tutor: Portare il Sistema al Livello Successivo

> Versione: 3.0 | Data: 04/04/2026
> Score attuale: ~7.0 | Target: >= 8.5/10 con 95% dei 100 benchmark PASS con evidenza
> Ralph Loop: max 100 iterazioni | Uscita: solo quando condizioni soddisfatte
> STATO CRITICO: 330 file modificati NON deployati. Produzione è VECCHIA.

---

## PRINCIPI IMMUTABILI (violazione = REVERT immediato)

1. **PRINCIPIO ZERO**: ELAB Tutor è usato SOLO dal docente davanti alla classe sulla LIM. Gli studenti guardano. Ogni scelta UX serve il docente che spiega.
2. **ZERO REGRESSIONI**: `npx vitest run` (1430+) + `npm run build` (30+ precache) DOPO OGNI singolo fix. Se falliscono → REVERT e ripensa.
3. **ENGINE INTOCCABILE**: MAI modificare CircuitSolver.js, AVRBridge.js, SimulationManager.js, avrWorker.js.
4. **ZERO DEMO/MOCK**: Tutto deve funzionare con dati reali. Mai dati finti.
5. **ONESTA BRUTALE**: Mai auto-assegnare score >7 senza PROVA (screenshot/console/curl). Se dici "funziona" devi dimostrarlo.
6. **PARITA VOLUMI ESATTA**: Un esperimento nel libro TRES JOLIE = UN esperimento nell'app. Le fasi/varianti di un esperimento NON sono esperimenti separati — vanno unite come step interni.
7. **COV + QUALITY AUDIT**: CoV dopo OGNI ciclo. Quality audit con /code-review /quality-audit /systematic-debugging ogni 2-3 task.

---

## FASE 0 — BOOTSTRAP E DEPLOY (Bloccante)

### 0.1 Leggi TUTTO il contesto delle 10 sessioni precedenti
```
Leggi IN ORDINE:
1. CLAUDE.md
2. Memory MEMORY.md (TUTTE le entry, naviga nei file linkati)
3. docs/MAPPING-VOLUMI-APP.md
4. docs/BUG-LIST-COMPLETA.md
5. docs/BENCHMARK-100-PARAMETRI.md
6. docs/STRESS-TEST-RISULTATI.md
7. docs/plans/ — tutti i piani esistenti
8. Memory: G45-audit-brutale.md, unlim-vision-core.md, simulator-notes.md
9. automa/STATE.md + automa/handoff.md — stato corrente del progetto
10. Tutti i prompt in docs/prompts/ — capire cosa è stato fatto e cosa no
```

### 0.2 Leggi i 3 volumi SORGENTE TRES JOLIE (FONTE DI VERITA)
```
PDF Vol1: "ELAB - TRES JOLIE/1 ELAB VOLUME UNO/2 MANUALE VOLUME 1/MANUALE VOLUME 1 ITALIANO.pdf"
PDF Vol2: "ELAB - TRES JOLIE/2 ELAB VOLUME DUE/2 MANUALE VOLUME  2/MANUALE VOLUME 2 ITALIANO.pdf"
ODT Vol3: "ELAB - TRES JOLIE/3 ELAB VOLUME TRE/2 MANUALE VOLUME 3/MANUALE VOLUME 3 WORD.odt"
PDF Vol3 copia: "PRODOTTO/elab-builder/public/volumes/volume3.pdf"
```
Usa `pdftotext` per estrarre il testo di OGNI volume. Conta gli esperimenti REALI:
- Un esperimento = UN circuito da costruire con header "ESPERIMENTO N" nel libro
- Le varianti/fasi descritte DENTRO lo stesso esperimento NON sono separati
- Cap14 Vol1 e Cap12 Vol2 sono robot (1 progetto ciascuno, no header ESPERIMENTO)

### 0.3 Anti-regressione baseline
```bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "VOLUME 3/PRODOTTO/elab-builder"
npx vitest run                    # DEVE essere 1430+
npm run build                     # DEVE passare, 30+ precache
find src -type f | wc -l          # DEVE essere >= 365
```

### 0.4 DEPLOY (critico — 330 file non deployati)
La produzione (www.elabtutor.school) è VECCHIA. I fix delle ultime 10 sessioni non sono deployati.
```bash
npm run build && npx vercel --prod --yes
```
Dopo il deploy, verifica con Control Chrome o curl che il sito LIVE sia aggiornato.

### 0.5 Verifica LIVE post-deploy con Control Chrome
Vai su https://www.elabtutor.school e testa OGNI punto:
```
1. Login con ELAB2026 → accesso alla lavagna
2. Carica esperimento Vol1 (v1-cap6-esp1) → LED acceso, breadboard, batteria
3. Carica esperimento Vol3 con codice (v3-cap6-semaforo) → 3 LED, Arduino, codice editor
4. Clicca Play → LED si accendono in sequenza
5. Mascotte fluttuante VISIBILE in basso a destra, DRAGGABILE
6. Chiudi UNLIM (X) → clicca mascotte → UNLIM si RIAPRE
7. Clicca Penna nella toolbar → DrawingOverlay appare SUBITO (anche senza esperimento)
8. Apri Percorso → 5 fasi, FloatingWindow draggabile+ridimensionabile
9. Apri Manuale → PDF viewer con tab Vol1/Vol2/Vol3, FloatingWindow
10. Apri Video → YouTube search, video si guardano DENTRO la finestra (iframe embed, NO redirect)
11. Trascina pannello UNLIM → si muove
12. Ridimensiona pannello UNLIM da angolo basso-destra → si allarga/riduce INTUITIVAMENTE
13. Minimizza/Massimizza UNLIM → funziona
14. Resize 1024x768 (LIM) → tutto visibile, font >= 14px
15. Resize 768x1024 (iPad) → touch targets >= 44px
16. Resize 1920x1080 (PC) → canvas auto-fit, sidebar aperta
17. Console errors = ZERO
```
OGNI test fallito = BUG P0 da fixare PRIMA di continuare.

---

## FASE 1 — PARITA VOLUMI ESATTA CON TRES JOLIE (~10 iterazioni)

### Il problema (segnalato da Andrea)
L'app ha FRAMMENTATO gli esperimenti — ha creato esperimenti separati per fasi/varianti che nel libro sono parte dello STESSO esperimento. Esempio:
- Vol2 Cap8: libro ha 2 esperimenti MOSFET, app ne ha 3 (v2-cap8-esp3 è una variante dell'esp2)
- Vol3: molti esperimenti derivati da esercizi/varianti nel testo

### Conteggio REALE dai PDF TRES JOLIE (verificato)
```
Vol1: 38 esperimenti (Cap6:3, Cap7:6, Cap8:5, Cap9:9, Cap10:6, Cap11:2, Cap12:4, Cap13:2, Cap14:1)
Vol2: 26 esperimenti (Cap3:4, Cap4:3, Cap5:2, Cap6:4, Cap7:4, Cap8:2, Cap9:2, Cap10:4, Cap12:1)
Vol3: DA CONTARE dal PDF/ODT (bozza v0.8.1)
```

### Metodo ESATTO
Per OGNI volume:
1. Apri il PDF TRES JOLIE con pdftotext
2. Elenca OGNI "ESPERIMENTO N" per capitolo
3. Confronta con experiments-vol1/2/3.js
4. Per ogni esperimento nell'app che NON ha un corrispondente "ESPERIMENTO N" separato nel libro:
   → È una fase/variante? UNISCILO nell'esperimento padre come step interno
   → È un esercizio descritto nel testo? Marcalo come "derivato" ma NON come esperimento separato
5. Per ogni esperimento nel libro NON presente nell'app → AGGIUNGILO
6. Verifica che TITOLI, COMPONENTI, SCHEMA, CODICE (Vol3) siano IDENTICI ai libri
7. Aggiorna i test se il numero esperimenti cambia

### Risultato atteso
- App Vol1 = 38 esperimenti (esattamente come il libro)
- App Vol2 = 26 esperimenti (oggi sono 27, unire v2-cap8-esp3 in v2-cap8-esp2)
- App Vol3 = numero esatto del libro (contare dal PDF)
- ZERO frammenti — ogni esperimento è completo con tutte le sue fasi interne

---

## FASE 2 — SIMULATORE + COMPILATORE + SCRATCH PERFETTI (~30 iterazioni)

### 2.1 Fisica degli oggetti — 12 stress test SEVERI
Per 5 esperimenti (1 semplice Vol1, 1 medio Vol2, 1 complesso Vol3, 1 con solo LED, 1 con Arduino+codice):
```
TEST 1: Drag componente dalla palette → snap al buco breadboard PIU VICINO (non millimetrico)
TEST 2: Sposta componente già piazzato → TUTTI i fili collegati SEGUONO (non si staccano)
TEST 3: Collega filo tra pin corretti → circuito FUNZIONA nella simulazione
TEST 4: Collega filo in punto SBAGLIATO → circuito NON funziona (comportamento corretto)
TEST 5: Rimuovi filo → circuito si aggiorna IMMEDIATAMENTE
TEST 6: Undo 10 operazioni → Redo 10 operazioni → stato IDENTICO, zero crash
TEST 7: Zoom in/out → layout coerente, componenti non si sovrappongono
TEST 8: 15 componenti simultanei (Simon Says) → nessun rallentamento visibile
TEST 9: Play/Stop → transizione pulita, LED accesi/spenti correttamente
TEST 10: Touch drag simulato (iPad 768x1024) → funziona con il dito
TEST 11: Pin touch target >= 44px → cliccabili facilmente
TEST 12: Nessun componente "scappa" da dove lo piazzi dopo drag
```
Ogni test FALLITO = bug da fixare + ri-test + anti-regressione.

### 2.2 Test SISTEMATICO di OGNI esperimento
Per OGNI esperimento dell'app (tutti e 3 i volumi):
```
1. loadExperiment(id) via __ELAB_API
2. Screenshot → componenti montati? fili visibili? breadboard presente?
3. Se Vol3 con codice: editor mostra il codice CORRETTO dell'esperimento (non un Blink generico)
4. Se Vol3 con HEX: Play → componenti RISPONDONO (LED, buzzer, servo, LCD)
5. Se Vol3: Serial Monitor → output corretto
6. Console errors = ZERO per quell'esperimento
7. Se FAIL → /systematic-debugging → root cause → fix → anti-regressione → ri-test
```

### 2.3 Compilatore Arduino C++
Per 5 esperimenti Vol3 rappresentativi:
```
1. Tab "Arduino C++" → codice presente e CORRETTO (= experiment.code)
2. Compila codice corretto → "Compilazione OK" (richiede backend attivo)
3. Scrivi codice SBAGLIATO (manca ;) → errore in ITALIANO bambino-friendly
4. Scrivi codice con errore capitalizzazione (pinmode vs pinMode) → suggerimento corretto
5. Retry dopo errore → compila senza reload
```

### 2.4 Scratch/Blockly
```
1. Tab "Blocchi" → 12 categorie in italiano kid-friendly
   (Decisioni, Ripeti, Numeri, Variabili, Testo, Accendi e Spegni, Suoni, Motore Servo, Schermo LCD, Tempo, Comunicazione, Sensori)
2. Blocchi pre-caricati per esperimenti con scratchXml
3. Crea programma Blink con blocchi → C++ generato CORRETTO
4. Compila da Blocchi → successo
5. Blocchi sbagliati → errore chiaro, NO crash
6. Switch Arduino↔Blocchi → codice preservato separatamente
7. Fullscreen Scratch → funziona, bottone "Esci" visibile
```

---

## FASE 3 — UX LAVAGNA PERFETTA (~15 iterazioni)

### 3.1 TUTTI i pannelli DEVONO essere FloatingWindow con:
- **Drag** dalla title bar (con touch e mouse)
- **Resize** dall'angolo basso-destra — handle INTUITIVO, ben visibile, facile da afferrare
- **Minimizza** (bottone −)
- **Massimizza** (bottone □)
- **Chiudi** (bottone ×)
- **Riapri** (bottone nell'header o mascotte)

I 5 pannelli da verificare CON SCREENSHOT:
```
1. UNLIM (chat AI) → drag ✓, resize ✓, minimize ✓, close ✓, riapri da mascotte ✓
2. Percorso Lezione (5 fasi) → drag ✓, resize ✓, riapri da header "Percorso" ✓
3. Manuale PDF (3 volumi) → drag ✓, resize ✓, tab Vol1/Vol2/Vol3 ✓
4. Video (YouTube embed) → drag ✓, resize ✓, video si vedono DENTRO (iframe, NO redirect) ✓
5. Passo Passo (step-by-step) → DEVE essere FloatingWindow (verificare se lo è)
```

### 3.2 Mascotte fluttuante
```
- DEVE essere VISIBILE come bottone piccolo position:fixed
- DEVE essere DRAGGABILE (pointerdown → pointermove → pointerup)
- Click (senza drag) DEVE riaprire UNLIM
- NON deve sparire quando UNLIM è chiuso
- PNG mascotte (/assets/mascot/logo-senza-sfondo.png) o SVG inline fallback
```

### 3.3 Penna
```
- Click Penna nella toolbar → DrawingOverlay appare SUBITO
- Deve funzionare anche SENZA esperimento caricato (dall'inizio)
- 5 colori + 3 spessori + gomma + undo + clear
- Click Penna di nuovo → disattiva
```

### 3.4 Video YouTube
```
- Finestra Video usa iframe youtube-nocookie.com/embed (NO redirect)
- Catalogo video curati + ricerca YouTube
- Video si guardano DENTRO la FloatingWindow
```

### 3.5 Responsive — 3 risoluzioni con screenshot
```
LIM 1024x768: tutto visibile, font >= 14px, nessun overflow, toolbar non copre contenuto
iPad 768x1024: touch targets >= 44px, pannelli ridimensionabili, canvas auto-fit
PC 1920x1080: canvas auto-fit, sidebar aperta, editor visibile
```

---

## FASE 4 — MODALITA PROGETTO PERFETTA (~15 iterazioni)

### Cosa deve fare
La Modalità Progetto è il cuore pedagogico. L'insegnante la usa per guidare la lezione:
```
1. Generata dai dati dell'esperimento + lesson-paths/*.json + contenuto volumi TRES JOLIE
2. Si ADATTA in tempo reale:
   - Rallenta se l'insegnante ha difficoltà (nota errori, screenshot, ritardo)
   - Accelera se va tutto bene (step completati velocemente)
   → Principio Zero totale
3. Pannello FloatingWindow: drag, resize, minimize, close
   - NON sovrappone il canvas senza esplicito click
   - L'insegnante può metterlo dove vuole, allargarlo, nasconderlo
4. 5 fasi: PREPARA / MOSTRA / CHIEDI / OSSERVA / CONCLUDI
5. Font >= 16px (leggibile a 3 metri dalla LIM dalla classe)
6. Nessun overlay cognitivo — pulito, chiaro, essenziale
7. Conosce le sessioni precedenti (unlimMemory.js + Supabase)
8. Basata su cosa dicono i volumi TRES JOLIE per quell'esperimento
```

### Step-by-step "Monta Tu"
```
1. Pannello con istruzioni step-by-step
2. Ogni step: componente da piazzare, posizione suggerita, pin
3. Step completato → prossimo si illumina (verde #4A7A25)
4. Feedback: corretto = verde, sbagliato = arancione (#E8941C) — MAI rosso
5. Se esperimento senza lesson-path → messaggio gentile, no crash
```

### Verifica
```
- Apri Percorso per 5 esperimenti diversi (Vol1, Vol2, Vol3)
- 5 fasi visibili con contenuto specifico per l'esperimento
- Font >= 16px (verificare con preview_inspect)
- Pannello draggabile + ridimensionabile
- Non copre il circuito di default
```

---

## FASE 5 — BENCHMARK 100 DIMENSIONI CON EVIDENZA

### Metodo
Dopo OGNI fase, misura con EVIDENZA (screenshot/console/inspect/curl).
Target: media >= 8.5/10 con ZERO parametri < 5.

### 100 parametri in 11 categorie

**A. SIMULATORE (15)**: caricamento, compilazione, play/stop, drag, snap breadboard, fili seguono, undo/redo, zoom, 15 componenti, LED glow, potentiometro, LDR, Serial Monitor, Servo, LCD

**B. SCRATCH (10)**: 12 categorie IT, drag blocco, Blink compila, C++ generato corretto, errore blocchi, switch Arduino/Scratch, fullscreen, palette ELAB, codegen, pre-loaded XML

**C. COMPILATORE (5)**: codice corretto compila, errore tradotto IT kid-friendly, warning separati, riga errore evidenziata, retry funziona

**D. UNLIM AI (15)**: monta LED, aggiungi/rimuovi componente, pulisci circuito, monta semaforo, compila, mostra Scratch, Serial Monitor, capitolo, Legge Ohm, memoria sessioni, lezione, tempo risposta <30s, 3 comandi in sequenza, input vuoto gestito, fallback offline

**E. PERCORSO/PROGETTO (10)**: FloatingWindow, 5 fasi, font 16px+, no overlay cognitivo, nascondibile, allargabile, step-by-step, feedback colori, no crash senza path, carica prossimo

**F. DATI PARITA (10)**: numero = libri TRES JOLIE, titoli identici, componenti identici, schema identico, codice identico (Vol3), steps, quiz, difficolta, concept, lesson paths

**G. UX LAVAGNA (10)**: header, toolbar 6 strumenti, mascotte drag+click, penna immediata, 5 pannelli FloatingWindow tutti funzionanti, resize handle intuitivo, component bar, experiment picker

**H. RESPONSIVE (10)**: LIM no overflow, LIM font >=14px, LIM toolbar, iPad touch >=44px, iPad drag, iPad canvas auto-fit, PC sidebar, PC editor, PC canvas, nessun taglio testo

**I. PERFORMANCE (5)**: build <60s, precache <3000 KiB, precache >=30, FCP <3s localhost, no chunk >2MB gzip

**J. SICUREZZA (5)**: consent banner, localStorage bounded, API keys in .env, GDPR consent, no dati personali nel frontend

**K. INTEGRITA (5)**: vitest 1430+, build pass, HTTP 200, zero console errors, engine intoccato

---

## PROTOCOLLO ANTI-REGRESSIONE (DOPO OGNI fix — BLOCCANTE)

```bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "VOLUME 3/PRODOTTO/elab-builder"
npx vitest run                    # 1430+ PASS
npm run build                     # 30+ precache
find src -type f | wc -l          # >= 365
# Console errors via Preview tools = ZERO
```
Se FALLISCE → REVERT il fix e ripensa l'approccio.

## PROTOCOLLO CoV (dopo OGNI ciclo — OBBLIGATORIO)
```
1. Cosa ho modificato? (file, riga, cosa, perché)
2. Fix minimale? (< 50 righe? un file alla volta?)
3. Risolve il problema? (PROVA con screenshot/console)
4. Side effects? (testa un esperimento DIVERSO)
5. Test passano? (vitest + build)
6. Documenta in BUG-LIST-COMPLETA.md
```

## PROTOCOLLO QUALITY AUDIT (ogni 2-3 task)
Usa /code-review, /quality-audit, /systematic-debugging:
```
3 aspetti:
1. SECURITY: CSP, API keys, localStorage, consent
2. WCAG: font >=14px, contrast AA, touch >=44px, focus ring, ARIA
3. EXPERIMENTS: 3 esperimenti random → montaggio + Scratch + compilazione
```

---

## SKILLS DA USARE SISTEMATICAMENTE

```
/systematic-debugging   — Per OGNI bug trovato
/debug                  — Debug strutturato con root cause
/architecture           — Decisioni architetturali (quando serve)
/code-review            — Review codice dopo ogni blocco di fix
/quality-audit          — Audit qualità ogni 2-3 task
/elab-quality-gate      — Gate pre/post sessione
/analisi-simulatore     — Debug specifico simulatore
/ricerca-bug            — Ricerca sistematica bug
/lim-simulator          — Test specifico LIM
/impersonatore-utente   — Simula docente davanti alla classe
/frontend-design        — UX design quando serve
```

## TOOLS TASSATIVI

```
- Preview tools: preview_start, preview_screenshot, preview_eval, preview_click,
  preview_fill, preview_resize, preview_inspect, preview_console_logs, preview_snapshot
  → Per OGNI verifica locale
- Control Chrome: open_url, execute_javascript, get_page_content
  → Per test sul sito LIVE in produzione
- curl → verifiche API nanobot/backend
- pdftotext (poppler) → lettura volumi TRES JOLIE
- Playwright via Bash → test E2E automatizzati se necessario
```

---

## CONDIZIONI DI USCITA (TUTTE devono essere VERE con PROVA)

```
□ 95/100 benchmark PASS con evidenza (screenshot/console/inspect)
□ Score composito medio >= 8.5/10
□ ZERO crash in qualsiasi scenario testato
□ Parità ESATTA con TRES JOLIE (no frammenti, no esperimenti inventati)
□ Scratch compila e genera C++ corretto
□ Compilatore Arduino: codice giusto compila, codice sbagliato dà errore IT
□ Fisica oggetti: 12/12 stress test PASS
□ 5 pannelli FloatingWindow: drag+resize+min+max+close+reopen TUTTI funzionanti
□ Mascotte: visibile, draggabile, click riapre UNLIM
□ Penna: funziona dal primo click (anche senza esperimento)
□ Video: YouTube embed nella finestra (NO redirect)
□ Responsive: LIM 1024x768 + iPad 768x1024 + PC 1920x1080 TUTTI verificati
□ Console errors = ZERO
□ Deploy su produzione completato e verificato
□ vitest 1430+ e build PASS
□ Engine (CircuitSolver/AVRBridge/SimulationManager/avrWorker) INTOCCATO
```

---

## REGOLE RALPH LOOP

```
MAX ITERAZIONI: 100
USCITA: Solo quando TUTTE le condizioni sopra sono soddisfatte con PROVA

Ogni iterazione:
1. Identifica il problema PIU GRAVE (score più basso O bug utente)
2. /systematic-debugging → root cause
3. Fix MINIMALE
4. Anti-regressione (vitest + build)
5. Verifica con Preview tools O Control Chrome
6. CoV

Ogni 2-3 task: /code-review + /quality-audit
Ogni 5 iterazioni: benchmark 20 parametri con screenshot
Ogni 10 iterazioni: benchmark COMPLETO 100 parametri
```
