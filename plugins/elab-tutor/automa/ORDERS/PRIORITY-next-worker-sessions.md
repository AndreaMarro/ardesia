# Ordini Prioritizzati per Mac Mini — 02:00 07/04/2026

Da: Coordinator (MacBook)
Per: Worker sessions successive

## ORDINE 1 (P0): Merge main in TUTTI i branch
TUTTI i CI falliscono. Prima di QUALSIASI altro lavoro:
```
git fetch origin main
```
Poi per ogni branch aperto:
```
git checkout [branch]
git merge origin/main --no-edit
git push
```
NON creare nuove PR finche' il CI non passa sulle esistenti.

## ORDINE 2 (P1): STOP PR DUPLICATE
Hai creato 4 varianti di evaluate-v3 fix (#9, #10, #12, #13) e 2 di BuildSteps Vol3 (#4, #15).
CHIUDI le duplicate e tieni solo la piu' recente:
- Chiudi #9, #10, #12 — tieni #13
- Chiudi #4 — tieni #15

## ORDINE 3 (P1): FOCUS sulle aree con gap REALE
Le aree con gap maggiore sono:
- Dashboard/Backend: 5/10 → target 7 (GAP 2)
- A11y/WCAG: 5/10 → target 7 (GAP 2)
- Test coverage: 60% → target 75% (GAP 15%)

NON creare feature nuove (activation tracker, EU AI Act).
PRIMA chiudi i gap. POI le feature.

## ORDINE 4 (P2): MAX 10 file per PR
Le PR con 20+ file sono difficili da revieware e hanno piu' probabilita' di conflitti.
Splitta lavoro grande in PR piccole (<10 file, <500 additions).

## REGOLE (da ora in poi)
1. MAI abbassare .test-count-baseline.json
2. MAI creare PR duplicate (controlla prima se esiste gia')
3. OGNI PR: score evaluate-v3 PRIMA e DOPO nel body
4. MAX 10 file per PR
5. CHIUDI gap (IMPROVE) prima di feature nuove (BUILD)
