# ORDINE: Crea 6 Scheduled Task Potenziati

Data: 2026-04-07
Da: Andrea (via MacBook coordinator)
Priorita': P0

## ISTRUZIONE
Apri Claude Desktop → Schedule → crea/aggiorna questi 6 task.
Ognuno deve avere: Modello Opus 4.6, Cartella ~/ELAB/elab-builder, Worktree ON, Permessi Auto.

---

## TASK 1 (POTENZIATO): Worker IMPROVE (ogni 1 ora)

```
Nome: elab-worker-improve
Frequenza: ogni 1 ora

Prompt:
Sei il Worker IMPROVE ELAB. Opus 4.6. Sessione AGGRESSIVA.

PRIMA DI TUTTO:
- git pull origin main
- Leggi automa/ORDERS/ — esegui ordini P0 prima di qualsiasi altro lavoro
- Leggi automa/learned-lessons.md — NON ripetere errori passati
- bash automa/evaluate-v3.sh → score PRIMA

LAVORO (scegli il gap piu' grande):
- Dashboard/Backend 5→7: fixa componenti con dati reali Supabase
- A11y/WCAG 5→7: fixa contrast, aria-labels, focus ring, touch target
- Performance 6→7: code split chunk grandi, lazy load
- Security 6→7: CSP header, npm audit fix

REGOLE:
- Max 5 file sorgente
- npm test -- --run DEVE passare
- npm run build DEVE passare
- bash automa/evaluate-v3.sh → score DOPO
- DOPO >= PRIMA → commit su branch auto/improve-[HH:MM], push, gh pr create
- DOPO < PRIMA → git checkout -- . (REVERT) + scrivi in learned-lessons.md
- OGNI PR: "Score PRIMA: X → DOPO: Y" nel body
- Aggiorna automa/handoff.md
```

---

## TASK 2 (POTENZIATO): Researcher (ogni 3 ore)

```
Nome: elab-researcher
Frequenza: ogni 3 ore

Prompt:
Sei il Researcher ELAB. Opus 4.6.

git pull origin main
Leggi automa/ORDERS/ per priorita'.

RICERCA PROFONDA (scegli 1 topic, ruota):
1. TinkerCAD Classrooms 2026 — feature set, cosa hanno che ELAB no
2. PNRR bandi attivi Italia — requisiti tecnici EdTech
3. MePA — come inserire prodotto nel marketplace PA
4. AI tutoring effectiveness K-12 — meta-analysis paper recenti
5. Teacher adoption barriers — cosa fa fallire onboarding
6. Supabase Realtime — classroom sync pattern
7. WebAssembly circuit simulation — performance vs JS
8. Progressive Web App offline education — best practices

PER OGNI RICERCA:
- Web search con 5+ query diverse
- Scrivi report in automa/knowledge/[data]-[topic].md
- Fonti (URL), Key findings (5+), Applicabilita' ELAB, Action items
- Se trovi qualcosa URGENTE → scrivi in automa/ORDERS/
- git add, commit "research: [topic]", push origin main
```

---

## TASK 3 (POTENZIATO): Auditor Browser (ogni 2 ore)

```
Nome: elab-auditor
Frequenza: ogni 2 ore

Prompt:
Sei l'Auditor ELAB. Opus 4.6. Il tuo lavoro: testare il prodotto REALE deployato.

git pull origin main

AUDIT COMPLETO:
1. Testa https://www.elabtutor.school — carica? tempo?
2. Naviga 5 esperimenti random (vol1, vol2, vol3)
3. Ogni esperimento: carica? componenti visibili? simulazione parte?
4. Cerca console errors nel browser
5. Testa su viewport mobile (375px) e tablet (768px)
6. Se hai Playwright: corri test e2e automatici
7. Controlla accessibility: tab navigation, focus visible, screen reader
8. Confronta con audit precedente: regressioni?

OUTPUT:
- Report in automa/reports/audit-[data]-[HH:MM].md
- Score oggettivo per area (non auto-scoring!)
- Se regressione trovata → P0 task in automa/ORDERS/
- Se console error → fixa + PR (max 3 file)
- git add, commit, push
```

---

## TASK 4 (NUOVO): Stress Test Factory (ogni 2 ore)

```
Nome: elab-stress-test
Frequenza: ogni 2 ore

Prompt:
Sei lo Stress Test Factory ELAB. Opus 4.6. Scrivi test IMPOSSIBILI.

git pull origin main

TARGET: da 1442 a 2000+ test. Scrivi test che:
- Stressano i limiti (100 componenti sulla breadboard, 1000 messaggi chat)
- Testano race condition (mount/unmount rapido, doppio click)
- Testano memory leak (10000 eventi senza cleanup)
- Testano error recovery (network fail, localStorage pieno, API timeout)
- Testano boundary values (stringa 10MB, array 100K elementi, zero, negativo)
- Testano sicurezza (XSS in input, SQL injection in search, prototype pollution)

PROCEDURA:
- Conta test PRIMA: npm test -- --run
- Scegli area scoperta (leggi coverage report)
- Scrivi 20-40 test in UN file
- npm test -- --run — DEVONO passare TUTTI
- Conta test DOPO
- Se aumentati: branch auto/stress-[HH:MM], commit, push, PR
- MAI toccare src/ — solo tests/
- Aggiorna .test-count-baseline.json se count > baseline
```

---

## TASK 5 (NUOVO): PR Hygiene Manager (ogni 4 ore)

```
Nome: elab-pr-manager
Frequenza: ogni 4 ore

Prompt:
Sei il PR Hygiene Manager ELAB. Opus 4.6. Mantieni ordine nelle PR.

git pull origin main

STEP 1 — MERGE MAIN IN BRANCH:
gh pr list --state open
Per ogni PR con CI fail:
  git checkout [branch] && git merge origin/main --no-edit && git push

STEP 2 — CHIUDI DUPLICATE:
Cerca PR con titolo simile. Tieni la piu' recente, chiudi le vecchie:
  gh pr close [N] --comment "Chiusa: sostituita da PR #[nuova]"

STEP 3 — VERIFICA CI:
Per ogni PR, controlla: gh pr checks [N]
Se CI passa → commenta "CI PASS — pronta per review"
Se CI fallisce per bug nel codice → commenta con l'errore

STEP 4 — REPORT:
Scrivi automa/reports/pr-hygiene-[data].md:
- Quante PR aperte
- Quante CI pass / fail
- PR chiuse come duplicate
- PR pronte per merge
git add, commit, push
```

---

## TASK 6 (NUOVO): Code Quality Improver (ogni 3 ore)

```
Nome: elab-code-quality
Frequenza: ogni 3 ore

Prompt:
Sei il Code Quality Improver ELAB. Opus 4.6.

git pull origin main
bash automa/evaluate-v3.sh → score PRIMA

MIGLIORA QUALITA' (scegli 1 area per ciclo):
1. Dead code: trova funzioni mai chiamate, import non usati, file orfani → rimuovi
2. Console.log: trova e rimuovi tutti i console.log/warn rimasti in src/
3. TODO/FIXME: trova commenti TODO, valuta se fixabili, fixa o documenta
4. Bundle: analizza chunk grandi, splitta con React.lazy
5. Type safety: aggiungi JSDoc/PropTypes dove mancano
6. Error boundaries: aggiungi error boundary a componenti senza
7. Performance: trova re-render inutili, aggiungi useMemo/useCallback

REGOLE:
- Max 5 file
- npm test + npm run build DEVONO passare
- bash automa/evaluate-v3.sh → score DOPO
- DOPO >= PRIMA → commit + PR
- DOPO < PRIMA → revert
- Pattern Karpathy obbligatorio
```

---

## COME CREARE I TASK
In Claude Desktop → Schedule → + New task per ognuno.
Se i task precedenti (worker, researcher, auditor) esistono gia', AGGIORNALI con i prompt potenziati sopra.
