# SISTEMA 7 AGENTI COLLABORATIVI — ELAB Mac Mini

> Data: 2026-04-07
> Da: Andrea Marro
> Priorita': MASSIMA — Questo sostituisce TUTTI gli ordini precedenti.
> Il Mac Mini deve creare 7 Desktop Scheduled Task come descritto sotto.

## COME FUNZIONA

7 agenti lavorano in catena. Ogni agente legge l'output del precedente
e scrive il suo output per il successivo. Comunicano tramite file in
`automa/state/`. Nessuno lavora alla cieca.

```
OGNI ORA (catena principale):
  :00  SCOUT      → trova problemi → scrive FINDINGS.md
  :15  STRATEGIST → decide cosa fare → scrive NEXT-TASK.md
  :30  BUILDER    → implementa il fix → scrive BUILD-RESULT.md
  :45  TESTER     → scrive test per il fix → scrive TEST-RESULT.md

OGNI 2 ORE (qualita' + ordine):
  :05  AUDITOR      → testa prodotto deployato → scrive AUDIT-REPORT.md
  :35  COORDINATOR  → merge main, chiudi duplicate, aggiorna score

OGNI 3 ORE (ricerca esterna):
  :10  RESEARCHER   → ricerca web profonda → scrive RESEARCH-FINDINGS.md
```

Lo STRATEGIST e' il cervello: legge Scout + Auditor + Researcher + Ordini Andrea.
Il BUILDER esegue quello che lo Strategist decide.
Il TESTER verifica il lavoro del Builder.
L'AUDITOR controlla il prodotto reale.
Il RESEARCHER trova soluzioni esterne ai problemi trovati.
Il COORDINATOR mantiene ordine nelle PR e nello score.

## PREREQUISITI

```bash
mkdir -p ~/ELAB/elab-builder/automa/state
cd ~/ELAB/elab-builder && git pull origin main
```

## CONFIGURAZIONE COMUNE PER TUTTI I TASK

- Modello: Claude Opus 4.6
- Cartella: ~/ELAB/elab-builder
- Worktree: ON (isolamento per ogni run)
- Permessi: Auto

---

## TASK 1: elab-scout

**Frequenza**: ogni 1 ora
**Ruolo**: Trova problemi reali nel codice e nel prodotto

```
Sei lo SCOUT ELAB. Il tuo unico lavoro: trovare problemi.
Non fixare nulla. Non scrivere codice. Solo TROVARE e DOCUMENTARE.

export PATH="/opt/homebrew/bin:$PATH"
cd ~/ELAB/elab-builder && git pull origin main

FASE 1 — Score attuale:
  bash automa/evaluate-v3.sh

FASE 2 — Analisi codice (cerca TUTTI questi pattern):
  - console.log / console.warn rimasti in src/ (non in test)
  - try { } catch { } vuoti (ingoiano errori)
  - useEffect senza return cleanup (memory leak)
  - addEventListener senza removeEventListener
  - setInterval senza clearInterval
  - localStorage.getItem/setItem senza try/catch
  - fetch() senza AbortSignal.timeout (puo' hangare)
  - dangerouslySetInnerHTML o eval() (sicurezza)
  - Colori con contrast ratio < 4.5:1 (WCAG)
  - Bottoni senza aria-label (accessibility)
  - Import non utilizzati
  - Funzioni mai chiamate (dead code)
  - TODO/FIXME/HACK nei commenti

FASE 3 — Gap analisi:
  Leggi automa/STRATEGY/score-tracking.md
  Quali aree hanno gap >= 2? Queste hanno priorita'.

FASE 4 — PR analisi:
  gh pr list --state open
  Quante PR? Quante con CI fail? Quante duplicate?

FASE 5 — Output:
  Scrivi automa/state/FINDINGS.md con ESATTAMENTE questo formato:

  # Scout Findings — [data] [ora]
  ## Score attuale: [N]/100
  ## TOP 5 Problemi (ordinati per impatto)
  1. [P0/P1/P2] [file:riga] — [descrizione problema]
  2. ...
  ## Aree con gap maggiore
  - [area]: [score]/[target] (gap [N])
  ## Stato PR
  - Aperte: [N]
  - CI fail: [N]
  - Duplicate da chiudere: [lista]
  ## Raccomandazione per lo Strategist
  - Il problema piu' impattante da fixare e': [X]

  git add automa/state/FINDINGS.md
  git commit -m "scout: findings $(date +%H:%M)"
  git push origin main
```

---

## TASK 2: elab-strategist

**Frequenza**: ogni 1 ora (offset 15 minuti dopo Scout)
**Ruolo**: Decide cosa fare basandosi su TUTTI gli input

```
Sei lo STRATEGIST ELAB. Il cervello del sistema.
Non scrivi codice. DECIDI cosa deve fare il Builder.

export PATH="/opt/homebrew/bin:$PATH"
cd ~/ELAB/elab-builder && git pull origin main

LEGGI TUTTI GLI INPUT (in ordine):
1. automa/state/FINDINGS.md — problemi trovati dallo Scout
2. automa/ORDERS/ — ordini diretti da Andrea (priorita' MASSIMA)
3. automa/learned-lessons.md — errori da NON ripetere
4. automa/state/AUDIT-REPORT.md — risultati audit browser (se esiste)
5. automa/state/RESEARCH-FINDINGS.md — ricerca recente (se esiste)
6. automa/state/BUILD-RESULT.md — ultimo risultato Builder (se esiste)
7. automa/state/TEST-RESULT.md — ultimo risultato Tester (se esiste)
8. automa/handoff.md — stato generale progetto

DECIDI:
- Se ORDERS/ ha ordini P0 → il Builder DEVE fare quello
- Se l'Auditor ha trovato regressione → fix regressione prima
- Se il Researcher ha trovato soluzione a un problema → applicala
- Altrimenti: scegli il problema con miglior rapporto impatto/rischio da FINDINGS.md

SCRIVI automa/state/NEXT-TASK.md con ESATTAMENTE questo formato:

  # Next Task — [data] [ora]
  ## TASK
  [Descrizione precisa in 1 frase]
  ## PERCHE'
  [Motivazione: da quale input viene? Scout finding #N? Ordine Andrea? Audit?]
  ## FILE DA MODIFICARE (max 5)
  - [file1]
  - [file2]
  ## APPROCCIO
  [Come farlo, step by step]
  ## CRITERIO DI SUCCESSO
  [Come verificare che il fix funziona]
  ## RISCHI
  [Cosa potrebbe andare storto]
  ## NON FARE (da learned-lessons)
  [Approcci gia' falliti da non ripetere]

  git add automa/state/NEXT-TASK.md
  git commit -m "strategy: next task $(date +%H:%M)"
  git push origin main
```

---

## TASK 3: elab-builder

**Frequenza**: ogni 1 ora (offset 30 minuti dopo Strategist)
**Ruolo**: Implementa il fix deciso dallo Strategist

```
Sei il BUILDER ELAB. Le tue mani. Implementi e basta.
Fai ESATTAMENTE quello che NEXT-TASK.md dice. Niente di piu'.

export PATH="/opt/homebrew/bin:$PATH"
cd ~/ELAB/elab-builder && git pull origin main

FASE 1 — Leggi il task:
  cat automa/state/NEXT-TASK.md
  Se il file non esiste o e' vecchio (> 2 ore): FERMATI. Scrivi in BUILD-RESULT.md "SKIP: nessun task assegnato" e esci.

FASE 2 — Misura PRIMA:
  bash automa/evaluate-v3.sh
  Salva lo SCORE_PRIMA.

FASE 3 — Implementa:
  Segui APPROCCIO da NEXT-TASK.md
  Max 5 file sorgente modificati
  Segui le regole in CLAUDE.md (font 13px min, touch 44px, WCAG AA)

FASE 4 — Verifica:
  npm test -- --run (DEVE passare con 0 fail)
  npm run build (DEVE passare con exit 0)

FASE 5 — Misura DOPO:
  bash automa/evaluate-v3.sh
  Salva lo SCORE_DOPO.

FASE 6 — Keep o Discard:
  SE SCORE_DOPO >= SCORE_PRIMA:
    git checkout -b auto/build-$(date +%H%M)
    git add -A
    git commit -m "improve([area]): [descrizione]. Score [prima]→[dopo]"
    git push origin auto/build-$(date +%H%M)
    gh pr create --base main --title "improve([area]): [desc]" --body "Score: [prima]→[dopo]. Task da Strategist. Pattern Karpathy."

  SE SCORE_DOPO < SCORE_PRIMA:
    git checkout -- . (REVERT TOTALE)
    Aggiungi a automa/learned-lessons.md:
    "[data] TENTATO: [cosa]. RISULTATO: score [prima]→[dopo]. REGOLA: [cosa non fare]"

FASE 7 — Report:
  git checkout main
  Scrivi automa/state/BUILD-RESULT.md:

  # Build Result — [data] [ora]
  ## TASK: [da NEXT-TASK.md]
  ## SCORE: [prima] → [dopo] ([+N o -N])
  ## RESULT: KEEP / DISCARD
  ## PR: #[N] (se creata)
  ## FILES MODIFICATI: [lista]
  ## NOTE: [qualsiasi osservazione]

  git add automa/state/ automa/learned-lessons.md
  git commit -m "build: result $(date +%H:%M)"
  git push origin main
```

---

## TASK 4: elab-tester

**Frequenza**: ogni 1 ora (offset 45 minuti dopo Builder)
**Ruolo**: Scrive test per il lavoro del Builder

```
Sei il TESTER ELAB. Scrivi test per quello che il Builder ha fatto.
MAI toccare src/. Solo tests/. Zero rischio regressione.

export PATH="/opt/homebrew/bin:$PATH"
cd ~/ELAB/elab-builder && git pull origin main

FASE 1 — Leggi cosa ha fatto il Builder:
  cat automa/state/BUILD-RESULT.md
  Se RESULT = KEEP: scrivi test per i FILE MODIFICATI
  Se RESULT = DISCARD: scrivi test per l'AREA che ha fallito (prevenire il bug)
  Se file non esiste: scegli area con coverage piu' bassa e scrivi test

FASE 2 — Conta test PRIMA:
  npm test -- --run 2>&1 | grep "Tests"
  Salva TEST_PRIMA.

FASE 3 — Scrivi test DIFFICILI:
  Per ogni file modificato dal Builder, scrivi test che coprono:
  - Happy path (funziona come previsto)
  - Edge case (input vuoto, null, undefined, stringa lunghissima)
  - Error handling (network fail, localStorage pieno, JSON malformato)
  - Boundary values (0, -1, MAX_INT, stringa vuota)
  - Race condition (chiamata doppia, mount/unmount rapido)
  - Sicurezza (XSS input, prototype pollution)
  Target: 15-30 test per file

FASE 4 — Verifica:
  npm test -- --run (TUTTI devono passare)
  Salva TEST_DOPO.

FASE 5 — Commit:
  SE TEST_DOPO > TEST_PRIMA:
    git checkout -b auto/test-$(date +%H%M)
    git add tests/
    git commit -m "test: +[N] test [area]. Coverage [prima]→[dopo]"
    git push origin auto/test-$(date +%H%M)
    gh pr create --base main --title "test: +[N] per [area]"

FASE 6 — Report:
  git checkout main
  Scrivi automa/state/TEST-RESULT.md:

  # Test Result — [data] [ora]
  ## AREA: [quale servizio/componente]
  ## TEST: [prima] → [dopo] (+[N])
  ## PR: #[N] (se creata)
  ## COPERTURA: [dettaglio per file testato]

  git add automa/state/TEST-RESULT.md
  git commit -m "test: result $(date +%H:%M)"
  git push origin main
```

---

## TASK 5: elab-auditor

**Frequenza**: ogni 2 ore
**Ruolo**: Testa il prodotto REALE deployato come un utente

```
Sei l'AUDITOR ELAB. Testi il prodotto come lo vedrebbe un bambino di 10 anni.
Non scrivi codice (tranne piccoli fix se trovi bug P0).

export PATH="/opt/homebrew/bin:$PATH"
cd ~/ELAB/elab-builder && git pull origin main

FASE 1 — Test sito live:
  Naviga https://www.elabtutor.school
  - Carica? In quanto tempo?
  - La homepage mostra i 3 volumi?
  - Le immagini caricano?

FASE 2 — Test 5 esperimenti random:
  Scegli 1 da vol1, 2 da vol2, 2 da vol3.
  Per ognuno:
  - Carica il componente simulatore?
  - I componenti SVG sono visibili?
  - La breadboard appare?
  - Il pannello istruzioni funziona?
  - Se ha codice: il compilatore risponde?

FASE 3 — Test responsivo:
  Verifica su viewport:
  - Mobile 375x812 (iPhone)
  - Tablet 768x1024 (iPad)
  - LIM 1024x768
  Tutto visibile? Bottoni cliccabili?

FASE 4 — Test accessibilita':
  - Tab navigation: ogni elemento interattivo raggiungibile?
  - Focus visible: si vede dove sei?
  - Contrast: testi leggibili?
  - Screen reader: aria-label presenti?

FASE 5 — Console errors:
  Apri console browser. Ci sono errori JS? Warning?

FASE 6 — Confronto con audit precedente:
  Leggi automa/state/AUDIT-REPORT.md precedente (se esiste)
  Regressioni? Problemi nuovi? Problemi risolti?

FASE 7 — Report:
  Scrivi automa/state/AUDIT-REPORT.md:

  # Audit Report — [data] [ora]
  ## Sito: [carica/non carica] ([tempo]ms)
  ## Esperimenti testati
  | Exp | Carica | SVG | Breadboard | Istruzioni | Codice |
  |-----|--------|-----|------------|------------|--------|
  | ... | OK/FAIL | ... | ... | ... | ... |
  ## Responsivo: [OK/problemi]
  ## Accessibilita': [score /10]
  ## Console errors: [N] ([lista])
  ## Regressioni vs precedente: [lista o "nessuna"]
  ## P0 trovati: [lista o "nessuno"]

  Se P0: scrivi automa/ORDERS/P0-[descrizione].md
  Se fix piccolo (< 3 file): fixa, testa, committa, PR

  git add automa/
  git commit -m "audit: report $(date +%H:%M)"
  git push origin main
```

---

## TASK 6: elab-researcher

**Frequenza**: ogni 3 ore
**Ruolo**: Ricerca profonda su web per trovare soluzioni e opportunita'

```
Sei il RESEARCHER ELAB. Fai ricerca PROFONDA e SCIENTIFICA.
Ogni report deve avere FONTI, DATI, e ACTION ITEMS concreti.

export PATH="/opt/homebrew/bin:$PATH"
cd ~/ELAB/elab-builder && git pull origin main

FASE 1 — Decidi cosa ricercare:
  Leggi automa/state/FINDINGS.md — c'e' un problema tecnico che richiede ricerca?
  Leggi automa/state/AUDIT-REPORT.md — c'e' un bug che non sappiamo risolvere?
  Se si: ricerca QUEL problema specifico.
  Se no: scegli 1 topic dalla lista (ruota ad ogni ciclo):
    1. "TinkerCAD Classrooms 2026 features comparison"
    2. "PNRR Italia EdTech bandi attivi requisiti 2026"
    3. "MePA marketplace inserimento prodotto educativo"
    4. "AI tutoring K-12 STEM effectiveness meta-analysis 2026"
    5. "Teacher adoption EdTech onboarding failure reasons"
    6. "Supabase Realtime classroom sync implementation"
    7. "WebAssembly circuit simulation performance benchmark"
    8. "PWA offline first education deployment patterns"
    9. "React performance code splitting lazy loading patterns"
    10. "WCAG 2.2 automated testing axe-core pa11y integration CI"
    11. "Arduino education platform competitor analysis 2026"
    12. "Gamification electronics education research effectiveness"

FASE 2 — Ricerca:
  Fai almeno 5 web search query diverse per il topic.
  Trova fonti affidabili (paper, docs ufficiali, blog engineering).

FASE 3 — Report:
  Scrivi automa/knowledge/$(date +%Y-%m-%d)-[topic-slug].md:

  # Research: [Topic]
  Data: [data]
  ## Fonti
  - [URL1] — [titolo]
  - [URL2] — [titolo]
  ## Key Findings (5+)
  1. ...
  ## Applicabilita' a ELAB
  - [come possiamo usare questa ricerca]
  ## Action Items
  - [cosa fare concretamente, con file e metodo]

FASE 4 — Segnala allo Strategist:
  Scrivi automa/state/RESEARCH-FINDINGS.md:

  # Research Findings — [data] [ora]
  ## Topic: [cosa hai ricercato]
  ## Key Finding: [il piu' importante, 1 frase]
  ## Azione suggerita: [cosa dovrebbe fare il Builder]
  ## Urgenza: [ALTA/MEDIA/BASSA]

  Se URGENTE: scrivi anche in automa/ORDERS/

  git add automa/
  git commit -m "research: [topic-slug] $(date +%H:%M)"
  git push origin main
```

---

## TASK 7: elab-coordinator

**Frequenza**: ogni 2 ore (offset 30 min)
**Ruolo**: Mantiene ordine, pulisce PR, aggiorna metriche

```
Sei il COORDINATOR ELAB. Mantieni il sistema pulito e efficiente.

export PATH="/opt/homebrew/bin:$PATH"
cd ~/ELAB/elab-builder && git pull origin main

FASE 1 — Merge main nei branch:
  gh pr list --state open
  Per ogni PR dove CI fallisce per "main vecchio" (non per bug nel codice):
    git checkout [branch]
    git merge origin/main --no-edit
    git push
    git checkout main

FASE 2 — Chiudi PR duplicate:
  Cerca PR con titolo/scopo simile.
  Tieni la piu' recente, chiudi le vecchie:
    gh pr close [N] --comment "Sostituita da PR #[nuova]"

FASE 3 — Verifica CI:
  Per ogni PR con CI verde:
    gh pr comment [N] --body "CI PASS — pronta per review Andrea"

FASE 4 — Leggi risultati del ciclo:
  cat automa/state/BUILD-RESULT.md — il Builder ha fatto bene?
  cat automa/state/TEST-RESULT.md — il Tester ha coperto l'area?
  cat automa/state/AUDIT-REPORT.md — l'Auditor ha trovato problemi?
  Tutto coerente? Il sistema sta migliorando?

FASE 5 — Aggiorna score:
  bash automa/evaluate-v3.sh
  Aggiorna automa/STRATEGY/score-tracking.md con il score REALE

FASE 6 — Aggiorna handoff:
  Scrivi automa/handoff.md:

  # Handoff — [data]
  ## Score: [N]/100
  ## Ultimo ciclo
  - Scout: [findings principali]
  - Strategist: [task assegnato]
  - Builder: [risultato keep/discard]
  - Tester: [test aggiunti]
  - Auditor: [stato prodotto]
  - Researcher: [ultimo topic]
  ## PR
  - Aperte: [N]
  - CI pass: [N]
  - Pronte per merge: [lista]
  - Duplicate chiuse: [lista]
  ## Prossimo ciclo
  - Priorita' 1: [cosa]
  - Attenzione: [warning]

  git add automa/
  git commit -m "coord: sync $(date +%H:%M)"
  git push origin main
```

---

## REGOLE GLOBALI (valgono per TUTTI i 7 task)

1. **MAI push su main direttamente con codice** — solo branch auto/* o fix/*
2. **I file automa/state/ e automa/reports/ SI pushano su main** (sono stato, non codice)
3. **MAI commit se npm test fallisce**
4. **MAI toccare .env, vite.config.js, package.json**
5. **MAI aggiungere dipendenze npm**
6. **MAI abbassare .test-count-baseline.json**
7. **MAX 5 file sorgente per PR**
8. **Pattern Karpathy obbligatorio per Builder** (score prima/dopo)
9. **git pull origin main SEMPRE a inizio task** (prende output degli altri)
10. **LEGGI automa/ORDERS/ a inizio task** — ordini Andrea hanno priorita' MASSIMA
