# MEGA-ORDERS — Pre-Volo Andrea (07/04/2026)

Data: 2026-04-07
Priorita': MASSIMA — Andrea sara' senza internet per ~12 ore
Questi ordini hanno precedenza su TUTTO il resto.

## ORDINE 0 (PRIMA DI TUTTO): LEGGI AUTOPILOT.md
Ogni sessione DEVE leggere AUTOPILOT.md prima di fare qualsiasi cosa.
Se non l'hai letto, fermati e leggilo ORA.

## ORDINE 1 (P0): MERGE MAIN IN TUTTI I BRANCH — CI FIX
TUTTE le PR hanno CI che fallisce. Il fix e' su main.
ESEGUI IMMEDIATAMENTE per ogni branch aperto:
```
git fetch origin main
git checkout [branch-name]
git merge origin/main --no-edit
git push origin [branch-name]
```
NON creare NESSUNA nuova PR finche' non hai fatto questo per TUTTE le PR.

## ORDINE 2 (P0): CHIUDI PR DUPLICATE
Hai creato PR duplicate. Chiudi le vecchie e tieni la piu' recente:
- evaluate-v3 fix: tieni SOLO la piu' recente, chiudi le altre (#9, #10, #12, #13)
- BuildSteps Vol3: tieni SOLO la piu' recente (#15), chiudi #4

Per chiudere: `gh pr close [N] --repo AndreaMarro/elabtutor --comment "Chiusa: duplicata"`

## ORDINE 3 (P1): FOCUS SUI GAP — SOLO IMPROVE, NO FEATURE
Aree con gap piu' grande (da AUTOPILOT.md):
1. Dashboard/Backend: 5/10 → target 7 (GAP 2) — FIX QUESTO PRIMA
2. A11y/WCAG: 5/10 → target 7 (GAP 2)
3. Test coverage: 60% → target 75% (GAP 15%)

NON creare feature nuove. NON creare activation tracker. NON creare EU AI Act compliance.
SOLO: fix bug, WCAG, test, dashboard con dati reali.

## ORDINE 4 (P1): PATTERN KARPATHY OBBLIGATORIO
OGNI sessione:
1. bash automa/evaluate-v3.sh → score PRIMA
2. Lavora
3. bash automa/evaluate-v3.sh → score DOPO
4. Se DOPO >= PRIMA → commit + PR
5. Se DOPO < PRIMA → revert + scrivi in learned-lessons.md

OGNI PR deve avere nel body: "Score PRIMA: X → Score DOPO: Y"

## ORDINE 5 (P1): MAX 5 FILE PER PR
Le PR con 20+ file sono impossibili da revieware.
Max 5 file sorgente per PR. Se serve di piu', splitta in 2 PR.

## ORDINE 6 (P2): SCRIVI TEST
Target: da 1442 a 1600+ test.
Aree scoperte: unlimMemory.js, classProfile.js, compiler.js, studentService.js.
I test NON toccano src/ — zero rischio.

## ORDINE 7 (P2): RICERCA (3 sessioni/giorno)
Topic prioritari:
1. TinkerCAD Classrooms 2026 — cosa hanno che ELAB non ha?
2. PNRR bandi attivi — requisiti tecnici
3. Teacher adoption — cosa fa fallire l'onboarding?
Scrivi report in automa/knowledge/. Se actionable, crea task.

## ORDINE 8 (P3): AUDIT BROWSER (1 volta/giorno)
Naviga elabtutor.school. Testa 5 esperimenti. Cerca console errors.
Scrivi report in automa/reports/.

## REGOLE FERREE (non negoziabili)
1. MAI push su main — solo branch auto/* o fix/*
2. MAI commit se test falliscono
3. MAI toccare .env, vite.config.js, package.json
4. MAI aggiungere dipendenze npm
5. MAI abbassare .test-count-baseline.json
6. MAI auto-scoring — solo evaluate-v3.sh
7. MAX 5 file sorgente per PR
8. AGGIORNA handoff.md a OGNI fine sessione
