# SESSIONE GIORNO 6 — SESSIONE LUNGA: VOL 1 COMPLETO + E2E BROWSER TEST

```
cd "VOLUME 3/PRODOTTO/elab-builder"

SEI ELAB-TUTOR-LOOP-MASTER. Giorno 6 del piano 2 settimane.

## ⚠️ SESSIONE LUNGA — REGOLE ANTI-DEGRADO CONTESTO

Questa sessione è progettata per massima produttività con minima perdita di contesto.
Pattern da Anthropic Engineering ("Harness Design", "Long-Running Claude", "Building a C Compiler"):

### REGOLE SESSIONE LUNGA (AGGIORNATE POST-G5 DEBUG)
1. **PROGRESS FILE** — aggiorna `automa/PROGRESS-G6.md` dopo OGNI blocco.
   Scrivi: cosa fatto, cosa manca, problemi trovati, evidenze numeriche.
   Questo sopravvive alla compressione del contesto.
2. **CoV INTERMEDIA** — dopo ogni blocco (non ogni capitolo). Build + vocab + count.
3. **RALPH LOOP** — "Ho DAVVERO finito? Il count è giusto? Il build passa?"
4. **TEST ORACLE PRIMA** — esegui vocab + circuit + build PRIMA di commit. Mai dopo.
5. **SE BUILD FALLISCE** — fix SUBITO. Non andare avanti.
6. **COMMIT OGNI 4-5 FILE** — checkpoint system.
7. **ONESTÀ SCIENTIFICA** — se qualcosa non quadra, segnalo nel PROGRESS.
   Non inventare. Non arrotondare. Non compiacere.
8. **BROWSER TEST = EVIDENZA** — Usa preview_start + preview_screenshot.
   Un test che non produce screenshot non è un test.
9. **NO CONTEXT BLOAT** — leggi i file UNA volta. Non rileggere.
   Se serve un dato, cerca con grep, non rileggere il file intero.
10. **HANDOFF < 30 RIGHE** — il prossimo Claude deve partire veloce.

## STATO VERIFICATO (27/03/2026 fine G5 — CoV 11/11 PASS)
- Build: ✅ PASSA (exit 0)
- Deploy: ✅ HTTP 200 su elabtutor.school
- Lesson paths: 29/67 totali, 29/38 Volume 1
  - Cap 6: ✅ 3/3  Cap 7: ✅ 6/6  Cap 8: ✅ 5/5
  - Cap 9: ✅ 9/9  Cap 10: ✅ 6/6
  - Cap 11: 0/2  Cap 12: 0/3  Cap 13: 0/2  Cap 14: 0/2
- Bug noti: 1 vocab violation (cap6-esp2 "volt" in provocative_question)
- Vocab check G5: 0 violazioni nei 16 file nuovi
- Circuit data match: 100%
- JSON schema: 29 file, 16 chiavi consistenti
- Git: 5 commit feat, 0 docs

## SCOPERTA CRITICA DAL DEBUG G5

### L'UI ESISTE GIÀ
- `src/components/simulator/panels/LessonPathPanel.jsx` — renderizza le 5 fasi
  - Usa `getLessonPath(experimentId)` da lesson-paths/index.js
  - Mostra: teacher_message, teacher_tip, common_mistakes, analogies
  - Ha il bottone "Monta il circuito per me" che chiama window.__ELAB_API
- `src/components/unlim/UnlimWrapper.jsx` — auto-rileva esperimenti, passa contesto a Galileo
- `src/components/tutor/ElabTutorV4.jsx` — orchestratore principale, integra LessonPathPanel
- I dati NON sono codice morto — sono serviti dal simulatore

### IL GAP REALE
Nessuno ha MAI verificato nel browser che i 29 lesson paths funzionino:
- Il circuito si monta cliccando "Monta il circuito per me"?
- Gli highlight ([AZIONE:highlight:led1]) funzionano?
- Le 5 fasi sono navigabili?
- La progressione PREPARA→MOSTRA→CHIEDI→OSSERVA→CONCLUDI è fluida?

## CONTESTO IMMUTABILE
- Giovanni Fagherazzi = ex Global Sales Director ARDUINO
- PNRR deadline 30/06/2026 — 93 giorni
- Andrea Marro = UNICO sviluppatore. La reputazione dipende da questo.
- Palette: Navy #1E4D8C, Lime #558B2F
- NON toccare: CircuitSolver, AVRBridge, evaluate.py, checks.py

## SPRINT CONTRACT G6

### Goal
1. Vol 1 COMPLETO: 38/38 lesson paths (9 nuovi per cap 11-14)
2. BROWSER E2E: test 5 esperimenti campione nel browser reale (1 per cap)
3. FIX vocab violation cap6-esp2
4. Deploy + CoV finale

### Definizione di DONE (hard threshold)
- `grep "import" src/data/lesson-paths/index.js | wc -l` = 38
- `npm run build` = Exit 0
- Vocab check Python = 0 violazioni (inclusa fix cap6-esp2)
- Circuit data match = 0 mismatch
- Browser test: 5 screenshot + 0 errori console critici
- Deploy Vercel = HTTP 200
- Se anche UNA condizione fallisce → NON dichiarare successo. Fix prima.

## PIANO — 6 BLOCCHI

### BLOCCO 0: FIX (5 min)
- Fix vocab violation cap6-esp2 ("volt" in provocative_question)
- Verifica: vocab check = 0

### BLOCCO 1: CAP 11-12 (5 lesson paths, ~30 min)

| # | ID | Titolo |
|---|---|--------|
| 1 | v1-cap11-esp1 | Buzzer suona continuo |
| 2 | v1-cap11-esp2 | Buzzer con pulsante |
| 3 | v1-cap12-esp1 | Motore DC base |
| 4 | v1-cap12-esp2 | Motore con pot |
| 5 | v1-cap12-esp3 | Invertire rotazione motore |

**Dopo**: vocab + circuit + build + commit + PROGRESS

### BLOCCO 2: CAP 13-14 (4 lesson paths, ~25 min)

| # | ID | Titolo |
|---|---|--------|
| 6 | v1-cap13-esp1 | Servo base |
| 7 | v1-cap13-esp2 | Servo con pot |
| 8 | v1-cap14-esp1 | Arduino blink |
| 9 | v1-cap14-esp2 | Arduino fade |

**Dopo**: vocab + circuit + build + commit + PROGRESS
**RALPH CHECK**: import count = 38?

### BLOCCO 3: BROWSER E2E TEST (30 min) ← PRIORITÀ MASSIMA

Testa 5 esperimenti campione nel browser reale:
1. `v1-cap6-esp1` (LED base — cap più semplice)
2. `v1-cap8-esp4` (3 pulsanti RGB — cap 8 complesso)
3. `v1-cap9-esp6` (3 pot RGB — cap 9 più grande)
4. `v1-cap10-esp4` (accoppiamento ottico — cap 10 avanzato)
5. `v1-cap12-esp1` (motore DC — cap nuovo)

Per OGNI esperimento:
1. preview_start → navigare all'esperimento
2. Verificare che LessonPathPanel mostra le 5 fasi
3. Cliccare "Monta il circuito per me"
4. Verificare che i componenti appaiono
5. preview_screenshot → salva evidenza
6. preview_console_logs level=error → cattura errori
7. Documentare: FUNZIONA / PARZIALE / ROTTO

**Output**: tabella con 5 righe, colonne: ID, Fasi OK, Monta OK, Errori, Screenshot

### BLOCCO 4: FIX EVENTUALI (se blocco 3 trova problemi)
- Se un esperimento non monta: analizzare l'intent vs experiments-vol1.js
- Se le fasi non si vedono: verificare che getLessonPath() trovi il file
- Se errori console: fix minimo, non refactoring

### BLOCCO 5: DEPLOY + CoV FINALE

#### CoV FINALE (13 verifiche)
| # | Verifica | Comando | Evidenza attesa |
|---|----------|---------|-----------------|
| V1 | Build | `npm run build` | Exit 0 |
| V2 | Import count | `grep "import" index.js \| wc -l` | 38 |
| V3 | Deploy | `curl -s -o /dev/null -w "%{http_code}" https://www.elabtutor.school` | 200 |
| V4-V9 | Cap 6-14 count | grep per capitolo | 3,6,5,9,6,2,3,2,2 |
| V10 | Vocab check | Script Python | 0 violazioni |
| V11 | Circuit data match | Script Python | 0 mismatch |
| V12 | JSON schema | Script Python | 38 file, stesse chiavi |
| V13 | Browser test | 5 screenshot + console | 0 errori critici |
| V14 | Git log | `git log --oneline -8` | feat commits, 0 docs |

### BLOCCO 6: HANDOFF + NEXT-G7

## VOCABOLARIO PER CAPITOLO (cap 11-14)

### Cap 11 — Cicalino
**PERMESSO**: come Cap 10 + cicalino, buzzer, piezo, suono, tono
**VIETATO**: ohm, volt, tensione, parallelo, serie, condensatore, Arduino, codice, programma, partitore, digitale, frequenza, hertz

### Cap 12 — Motore DC
**PERMESSO**: come Cap 11 + motore, rotazione, asse, velocità, direzione
**VIETATO**: ohm, volt, tensione, parallelo, serie, condensatore, Arduino, codice, programma, partitore, digitale, PWM, H-bridge

### Cap 13 — Servo
**PERMESSO**: come Cap 12 + servo, servo motore, angolo, posizione, braccetto
**VIETATO**: ohm, volt, tensione, parallelo, serie, condensatore, codice, programma, partitore, digitale, PWM, pulse width

### Cap 14 — Arduino Intro
**PERMESSO**: tutto precedente + Arduino, codice, programma, LED integrato, caricamento, sketch
**VIETATO**: ohm, volt, tensione, parallelo, serie, condensatore, partitore, interrupt, register, timer, assembly

## PROCESSO PER OGNI JSON (identico a G5)
1. Leggi dati esperimento da experiments-vol1.js
2. Usa template del capitolo come modello
3. Genera JSON 5 fasi: PREPARA→MOSTRA→CHIEDI→OSSERVA→CONCLUDI
4. build_circuit.intent: copia components + connections ESATTI
5. Analogie: genera dal concept + unlimPrompt
6. Verifica vocabolario MENTALMENTE prima di scrivere
7. Aggiungi a index.js

## SCRIPT TEST ORACLE (identici a G5 — copiali da NEXT-SESSION-PROMPT-G5.md)
### → Vocab check: stesso script python con glob v1-*.json
### → Circuit data match: stesso script python
### → JSON schema: stesso script python

## FILE DA LEGGERE (in ordine — STRICT)

### OBBLIGATORI prima di scrivere codice (leggere UNA VOLTA, non rileggere)
1. `src/data/lesson-paths/v1-cap10-esp6.json` — template recente (come modello struttura)
2. `src/data/lesson-paths/v1-cap6-esp2.json` — per fixare la vocab violation
3. `src/data/experiments-vol1.js` — righe con cap11 (grep "v1-cap11"), cap12, cap13, cap14
4. `src/data/lesson-paths/index.js` — per aggiornare import

### PER BROWSER TEST (leggere SOLO nel blocco 3)
5. `src/components/simulator/panels/LessonPathPanel.jsx` — capire come renderizza
6. `src/components/tutor/ElabTutorV4.jsx` — per capire il routing esperimenti

### NON LEGGERE MAI
- CLAUDE.md (già nel contesto automatico)
- automa/context/*.md (visione nota)
- automa/knowledge/* (ricerca, non codice)
- File del simulatore engine (CircuitSolver, AVRBridge — non toccare)

## ANTI-PATTERN (provati e falliti G1-G5)
- ❌ 30min+ audit prima di scrivere codice
- ❌ Commit docs per commit feat
- ❌ Rileggere 43 file di contesto → compressione contesto
- ❌ Handoff 200+ righe
- ❌ Lanciare agenti di ricerca per lavoro meccanico batch
- ❌ Dichiarare successo senza count verificato
- ❌ Generare lesson paths senza mai testarli nel browser (CORRETTO IN G6!)

## REGOLE SESSIONE
1. ❌ ZERO commit `docs:` — solo `feat:` e `fix:`
2. ❌ ZERO agenti di ricerca PRIMA di scrivere codice
3. ❌ ZERO handoff > 30 righe
4. ✅ CODICE FIRST — genera JSON, poi testa, poi committa
5. ✅ Test oracle PRIMA di ogni commit
6. ✅ CoV intermedia dopo ogni blocco
7. ✅ BROWSER TEST nel blocco 3 — con screenshot come evidenza
8. ✅ Massima onestà — se qualcosa non quadra, segnalo
9. ✅ Se browser test fallisce → fix PRIMA di deploy

## OUTPUT ATTESO
- 9 lesson paths nuovi (da 29 a 38) → Vol 1 COMPLETO
- Fix vocab cap6-esp2
- 5 browser test con screenshot
- Deploy HTTP 200
- CoV finale 14/14 PASS
- PROGRESS-G6.md onesto
- NEXT-SESSION-PROMPT-G7.md per Vol 2
- Handoff ≤ 30 righe

## REFERENCE
- Build: `export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npm run build`
- Deploy: `export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" && npx vercel --prod --yes`
- Sito: https://www.elabtutor.school
- Preview: preview_start per test browser
- Palette: Navy #1E4D8C, Lime #558B2F
```
