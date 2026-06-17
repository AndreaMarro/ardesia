# PDR V2 — ELAB Tutor: Livello Successivo (Parity + Perfection)

> Versione: 2.0 | Data: 04/04/2026
> Prerequisito: Sessione PDR 04/04 completata (11 iter, score ~7.5)
> Durata: Ralph Loop max 100 iterazioni
> Obiettivo: Score composito >= 8.5/10 con 95% benchmark PASS con EVIDENZA

---

## PRINCIPI IMMUTABILI (violazione = REVERT immediato)

1. **PRINCIPIO ZERO**: Solo il docente usa ELAB Tutor davanti alla classe sulla LIM. Gli studenti guardano. Ogni scelta UX serve il docente che spiega.
2. **ZERO REGRESSIONI**: `npx vitest run` + `npm run build` DOPO OGNI singolo fix. Se falliscono, REVERT immediato.
3. **ENGINE INTOCCABILE**: MAI modificare CircuitSolver.js, AVRBridge.js, SimulationManager.js, avrWorker.js.
4. **ZERO DEMO/MOCK**: Tutto deve funzionare con dati reali. Mai dati finti.
5. **ONESTA BRUTALE**: Mai auto-assegnare score >7 senza evidenza runtime. Ogni score deve avere PROVA (screenshot/console/curl).
6. **PARITA VOLUMI**: Gli esperimenti nell'app devono essere IDENTICI ai libri fisici. No frammenti, no duplicati, no inventati.
7. **COV OBBLIGATORIA**: Chain of Verification dopo OGNI ciclo. Quality audit ogni 5 cicli.

---

## FASE 0 — BOOTSTRAP (1 sola volta)

### 0.1 Leggi TUTTO il contesto (IN ORDINE)
```
1. CLAUDE.md
2. Memory MEMORY.md
3. docs/MAPPING-VOLUMI-APP.md
4. docs/BUG-LIST-COMPLETA.md
5. docs/BENCHMARK-100-PARAMETRI.md
6. docs/STRESS-TEST-RISULTATI.md
7. Memory G45-audit-brutale.md
8. Memory pdr-livello-successivo-04apr2026.md
9. Memory unlim-vision-core.md
10. Memory simulator-notes.md
```

### 0.2 Leggi i 3 volumi SORGENTE dalla cartella TRES JOLIE (FONTE DI VERITA DEFINITIVA)
```
PDF Vol1: "/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/1 ELAB VOLUME UNO/2 MANUALE VOLUME 1/MANUALE VOLUME 1 ITALIANO.pdf"
PDF Vol2: "/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/2 ELAB VOLUME DUE/2 MANUALE VOLUME  2/MANUALE VOLUME 2 ITALIANO.pdf"
ODT Vol3: "/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/3 ELAB VOLUME TRE/2 MANUALE VOLUME 3/MANUALE VOLUME 3 WORD.odt"
PDF Vol3 (copia app): "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/public/volumes/volume3.pdf"
```
NOTA: Vol3 in Tres Jolie e un .odt (Word). Usa il PDF in public/volumes/ come riferimento secondario.
La cartella Tres Jolie e la FONTE DEFINITIVA per titoli, esperimenti, componenti, schemi.
Per OGNI volume: conta gli esperimenti REALI (non le fasi). Un esperimento = una cosa da costruire/fare.

### 0.3 Anti-regressione baseline
```bash
npx vitest run                    # DEVE essere 1430+
npm run build                     # DEVE passare, 30+ precache
find src -type f | wc -l          # DEVE essere >= 347
git diff --name-only | grep -E "CircuitSolver|AVRBridge|SimulationManager|avrWorker"  # DEVE essere vuoto
```

### 0.4 Verifica live
Usa Control Chrome su https://www.elabtutor.school:
```
1. Login con ELAB2026
2. Carica un esperimento Vol1
3. Carica un esperimento Vol3 con codice
4. Clicca Play
5. Clicca Penna (deve apparire overlay disegno)
6. Chiudi UNLIM → clicca mascotte → UNLIM si riapre
7. Apri Manuale → cambia volume (tab Vol1/Vol2/Vol3)
8. Apri Percorso Lezione
9. Trascina pannello UNLIM (deve muoversi)
10. Resize pannello UNLIM da angolo basso-destra (deve allargarsi)
```
OGNI test fallito = BUG P0 da fixare PRIMA di continuare.

---

## FASE 1 — PARITA VOLUMI (Critica, ~20 iterazioni)

### Problema
L'app ha 91 esperimenti ma molti sono FRAMMENTI dello stesso esperimento del libro.
Il libro e la FONTE DI VERITA. L'app deve avere SOLO gli esperimenti del libro.

### Metodo
1. Apri OGNI PDF volume con il tool PDF/Acrobat
2. Elenca TUTTI gli esperimenti REALI per capitolo (un esperimento = un circuito da costruire)
3. Confronta con `experiments-vol1.js`, `experiments-vol2.js`, `experiments-vol3.js`
4. Per ogni esperimento nell'app:
   - Se e un FRAMMENTO di un esperimento del libro → UNISCI nell'esperimento padre (come step interno)
   - Se e un esperimento SEPARATO nel libro → MANTIENI
   - Se NON ESISTE nel libro → marca come "bonus" (non rimuovere, ma separa)
5. Per ogni esperimento nel libro NON presente nell'app → AGGIUNGILO
6. Verifica TITOLO identico al libro, COMPONENTI identici, SCHEMA identico, CODICE identico (Vol3)

### Risultato atteso
- Vol1: numero esperimenti = numero nel libro
- Vol2: numero esperimenti = numero nel libro
- Vol3: numero esperimenti = numero nel libro + eventuali extra marcati
- Ogni esperimento ha: title, components, connections, layout, steps, quiz, concept, code (Vol3)

### CoV Fase 1
```bash
npx vitest run  # Aggiorna test se numero esperimenti cambia
npm run build
```

---

## FASE 2 — SIMULATORE PERFETTO (Debug sistematico, ~20 iterazioni)

### 2.1 Test OGNI esperimento con Control Chrome
Per OGNI esperimento (tutti e 3 i volumi):
```
1. Naviga a https://www.elabtutor.school
2. Carica l'esperimento
3. VERIFICA: componenti montati correttamente (screenshot)
4. VERIFICA: fili collegati ai pin giusti
5. Se Vol3: clicca Play → LED/Buzzer/Servo/LCD DEVONO rispondere
6. Se Vol3: Serial Monitor → output corretto
7. VERIFICA: trascina componente → fili seguono
8. VERIFICA: undo/redo funziona
9. VERIFICA: zoom in/out → layout coerente
10. Se FAIL: root cause + fix + ri-test
```

### 2.2 Compilatore C++ (Vol3)
Per OGNI esperimento Vol3 con code !== null:
```
1. Apri tab Arduino C++ → codice presente
2. Clicca Compila → DEVE compilare senza errori
3. Codice SBAGLIATO → DEVE mostrare errore bambino-friendly in italiano
4. Retry dopo errore → funziona senza reload
```

### 2.3 Scratch/Blockly (Vol3)
```
1. Passa a tab Blocchi
2. 12 categorie visibili in italiano kid-friendly
3. Crea programma Blink con blocchi
4. Compila da Blocchi → codice C++ generato CORRETTO
5. Compilazione DEVE avere successo
6. LED DEVE lampeggiare
7. Blocchi sbagliati → errore chiaro, NO crash
```

### 2.4 Fisica oggetti — Stress test severo
```
Per 5 esperimenti rappresentativi (1 semplice, 1 medio, 1 complesso per volume):
1. Trascina componente dalla palette → snap ai buchi breadboard
2. Sposta componente → TUTTI i fili collegati seguono
3. Collega filo tra due pin → contatto funzionante
4. Filo nel punto SBAGLIATO → NON funziona
5. Rimuovi filo → circuito aggiornato
6. Undo/Redo 10 operazioni → stato perfetto
7. Zoom in/out → layout coerente
8. 15 componenti contemporanei → nessun rallentamento
9. Play/Stop → transizione pulita
10. Snap tolerance: buco piu vicino, non millimetrico
11. Pin cliccabili facilmente (min 44px)
12. Su touch: drag funziona con il dito
```

---

## FASE 3 — UX LAVAGNA PERFETTA (~15 iterazioni)

### 3.1 Pannelli FloatingWindow — TUTTI devono essere:
- Draggabili (trascinamento dalla title bar)
- Ridimensionabili (handle angolo basso-destra INTUITIVO, non nascosto)
- Minimizzabili (bottone -)
- Massimizzabili (bottone quadrato)
- Chiudibili (bottone X)
- Riapribili (da bottone nell'header o mascotte)

Pannelli da verificare:
1. **UNLIM** (GalileoAdapter in FloatingWindow) — gia OK?
2. **Percorso Lezione** (PercorsoPanel in FloatingWindow) — gia OK?
3. **Manuale PDF** (VolumeViewer in FloatingWindow) — con tab Vol1/2/3
4. **Video** (VideoFloat) — deve embeddare YouTube, non redirect
5. **Passo Passo** (LessonPathPanel) — ATTUALMENTE NON e FloatingWindow! Fix necessario.

### 3.2 Mascotte fluttuante
- DEVE essere visibile come bottone fisso (position: fixed)
- DEVE essere draggabile
- Click DEVE riaprire UNLIM (verificato con pointerup fix)
- Immagine DEVE caricarsi (PNG fallback a SVG inline)

### 3.3 Penna
- Click penna nella toolbar → DrawingOverlay fullscreen appare
- Toolbar colori visibile in alto
- Puoi disegnare sul canvas
- Click penna di nuovo → disattiva
- Altri tool (Select, Wire, Delete) disattivano la penna

### 3.4 Video YouTube
- Finestra Video DEVE embeddare un iframe YouTube (non redirect)
- Ricerca video per argomento
- Video si guarda DENTRO la finestra, non apre un'altra tab

### 3.5 Responsive
Per OGNI pannello, su OGNI risoluzione:
| Risoluzione | Cosa verificare |
|-------------|----------------|
| LIM 1024x768 | Tutto visibile, font >= 14px, nessun overflow |
| iPad 768x1024 | Touch targets >= 44px, sidebar retrattile |
| PC 1920x1080 | Canvas auto-fit, sidebar aperta |

---

## FASE 4 — MODALITA PROGETTO (~15 iterazioni)

### Architettura
La Modalita Progetto e il cuore pedagogico:
1. Generata dai dati dell'esperimento + lesson-paths/*.json + volumi
2. Si ADATTA in tempo reale: rallenta se l'insegnante ha difficolta, accelera se va bene
3. Pannello FloatingWindow: drag, resize, minimize, close
4. 5 fasi: PREPARA / MOSTRA / CHIEDI / OSSERVA / CONCLUDI
5. Font >= 16px (leggibile dalla classe a 3 metri)
6. Nessun overlay cognitivo (mai coprire il circuito senza permesso)
7. Conosce le sessioni precedenti (unlimMemory.js)

### Step-by-step Monta Tu
1. Pannello laterale con istruzioni per step
2. Ogni step: componente da piazzare, posizione suggerita
3. Step completato → prossimo si illumina
4. Feedback: corretto = verde, sbagliato = arancione (MAI rosso)
5. Se esperimento senza lesson-path → modalita non crasha

### Verifica
- Apri Percorso Lezione per 5 esperimenti diversi
- Verifica 5 fasi visibili
- Verifica font >= 16px
- Verifica pannello draggabile + ridimensionabile
- Verifica che non copre il circuito

---

## FASE 5 — BENCHMARK 100 DIMENSIONI

### Protocollo
DOPO OGNI ciclo di fix, misura con EVIDENZA RUNTIME (screenshot/console/curl).
Target: media >= 8.5/10 con ZERO dimensioni < 5.

### A. SIMULATORE (15)
1-15: Caricamento, compilazione, play/stop, drag, snap, fili, undo, zoom, 15 componenti, LED, pot, LDR, Serial Monitor

### B. SCRATCH (10)
16-25: Categorie, drag blocco, Blink compila, C++ generato, blocchi sbagliati, switch Arduino/Scratch, fullscreen, italiano, palette ELAB

### C. COMPILATORE (5)
26-30: Corretto compila, errore tradotto, warning separati, riga evidenziata, retry

### D. UNLIM (15)
31-45: Monta LED, aggiungi/rimuovi, pulisci, monta semaforo, compila, mostra Scratch, Serial, capitolo, Legge Ohm, memoria, lezione, < 30s, 3 comandi sequenza, input vuoto

### E. PERCORSO / MONTA TU (10)
46-55: FloatingWindow, 5 fasi, font 16px, non sovrappone, nascondibile, allargabile, step-by-step, feedback colori, no crash senza path

### F. DATI (10)
56-65: Numero uguale libri, titoli identici, componenti, schema, codice, steps, quiz, difficolta, concept, lesson path

### G. UX LAVAGNA (10)
66-75: Header, toolbar, select, filo, elimina, undo/redo, component bar, picker, 3 modalita, mascotte click

### H. RESPONSIVE (10)
76-85: LIM overflow, LIM font, LIM toolbar, iPad touch, iPad swipe, iPad drag, PC auto-fit, PC sidebar, nessun taglio, rotazione

### I. PERFORMANCE (5)
86-90: Build < 60s, bundle < 3000 KiB, precache >= 30, FCP < 3s, no chunk > 2MB

### J. SICUREZZA (5)
91-95: Consent, localStorage, API keys, RLS, GDPR

### K. INTEGRITA (5)
96-100: vitest 1430+, build pass, HTTP 200, nanobot health, solo file intenzionali

---

## PROTOCOLLO ANTI-REGRESSIONE (DOPO OGNI fix)

```bash
# STEP 1: Test (BLOCCANTE)
npx vitest run
# STEP 2: Build (BLOCCANTE)
npm run build
# STEP 3: File count >= 347
find src -type f | wc -l
# STEP 4: Engine check (BLOCCANTE)
git diff --name-only | grep -E "CircuitSolver|AVRBridge|SimulationManager|avrWorker"
# STEP 5: Console errors via Control Chrome (INFORMATIVO)
```

## PROTOCOLLO CoV (dopo OGNI ciclo)
```
1. Rileggi cosa hai modificato
2. Fix MINIMALE (un cambio alla volta)
3. Risolve il problema segnalato?
4. Side effects?
5. Test passano?
6. > 50 righe? Overengineering?
7. Documenta: file, riga, cosa, perche
```

## PROTOCOLLO QUALITY AUDIT (ogni 5 cicli)
```
3 agenti in parallelo:
1. SECURITY: CSP, API keys, RLS, consent
2. WCAG: font, contrast, touch, focus, ARIA
3. EXPERIMENTS: 5 esperimenti random, montaggio + compilazione
Score composito = media. Se < 7 → prioritizza fix.
```

---

## SKILLS OBBLIGATORIE
```
/systematic-debugging   — Per ogni bug
/debug                  — Debug strutturato
/architecture           — Decisioni architetturali
/frontend-design        — UX design
/elab-quality-gate      — Gate pre/post
/ricerca-bug            — Bug sistematici
/analisi-simulatore     — Debug simulatore
/lim-simulator          — Test LIM
/impersonatore-utente   — Simula docente
/code-review            — Review codice
/quality-audit          — Audit qualita
```

## TOOLS TASSATIVI
```
- Control Chrome — navigare il sito LIVE
- Playwright via Bash — test E2E automatizzati
- curl — verifiche API
- Preview tools — screenshot, click, fill
- PDF tool — leggere i volumi sorgente
- OGNI test deve avere PROVA (screenshot/log)
```

---

## STATO ATTUALE POST-SESSIONE PDR (04/04/2026)

### Score: ~7.5/10
| Area | Score |
|------|-------|
| Simulatore core | 7.5 |
| Lavagna UX | 7.2 |
| UNLIM AI | 7.0 |
| Pedagogico | 7.2 |
| Dashboard/GDPR | 5.7 |
| Performance | 6.7 |
| Responsive | 7.0 |
| Security | 6.5 |
| Visual | 7.0 |
| Build/Test | 8.5 |
| Dati/Esperimenti | 8.4 |

### Fix della sessione corrente (verificati)
- Galileo state machine: galileo:true in TUTTI gli stati
- Mascotte: onClickRef fix per riaprire UNLIM
- Penna: DrawingOverlay fullscreen nella Lavagna
- CSP con cdnjs + youtube frame-src
- Volume tabs nel PDF viewer
- WCAG: 20 contrasto + 5 font + 5 touch
- 18 lesson paths Vol3 (100% coverage)

### Bug ANCORA aperti (onesti)
1. LessonPathPanel NON e FloatingWindow (inline nel simulatore)
2. Video fa redirect invece di embeddare YouTube
3. Pannelli resize handle poco intuitivo (troppo piccolo?)
4. Esperimenti frammentati vs libri (parita non verificata)
5. Scratch: errori GCC non tradotti in tutti i casi
6. Dashboard senza Supabase = shell vuota
7. Nanobot 500 su circuitState complesso

### Build
- 1430/1430 test | Build PASS | 30 precache 2384 KiB
- Engine INTOCCATO
- Deploy live su Vercel

---

## REGOLE RALPH LOOP

```
MAX ITERAZIONI: 100
COMPLETAMENTO: Score >= 8.5 E 95% benchmark PASS

Ogni iterazione:
1. Identifica problema PIU GRAVE (score piu basso)
2. Root cause analysis
3. Fix MINIMALE
4. npx vitest run → DEVE passare
5. npm run build → DEVE passare
6. Verifica via Control Chrome sul sito LIVE
7. CoV: rileggi, verifica coerenza

Ogni 3 iterazioni:
- CoV completa
- Aggiorna docs/BUG-LIST-COMPLETA.md

Ogni 5 iterazioni:
- Quality audit 3 agenti
- Benchmark 20 dimensioni con screenshot

Ogni 10 iterazioni:
- Benchmark COMPLETO 100 dimensioni
- Screenshot di OGNI area
- Aggiorna docs/BENCHMARK-100-PARAMETRI.md

CONDIZIONE DI USCITA:
- 95% benchmark PASS
- Media >= 8.5/10
- UNLIM 28/30 azioni
- Zero crash
- Parita volumi verificata
- Scratch compila e funziona
- Fisica oggetti supera 15 test
- Tutti pannelli FloatingWindow funzionanti
- Video YouTube embedded
- Responsive LIM/iPad/PC verificato
```
