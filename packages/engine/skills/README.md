# LessonOS — Skills (auto-caricate nella review)

Cartella delle **skill applicabili** del motore LessonOS. Ogni skill è un file
`skills/<nome>.md` con quattro sezioni fisse:

1. **Titolo** — nome della skill (`# <nome>`).
2. **When-to-apply** — quando la skill si applica.
3. **Checklist/Procedura** — gli item operativi (`- [ ] ...`) verificabili sul diff.
4. **Origine-RETRO** — quale attrito ricorrente (PROCESS-LOG.md) l'ha generata.

## CONVENZIONE (vincolante)

> Un attrito che ricorre in **>=2 RETRO** (PROCESS-LOG.md) **DEVE** diventare una
> skill qui (auto-caricata da `bin/review.sh`) oppure un guard (test/hook).
> **Nessun attrito ricorrente può restare solo loggato.**

Il loop di auto-miglioramento è chiuso solo se: attrito ricorre → diventa skill/guard
→ la skill viene **davvero applicata** ad ogni review.

## Auto-load

`bin/review.sh` esegue `cat skills/*.md` e **inietta** le checklist nel prompt del
reviewer PRIMA di ogni review. Creare una skill qui = applicarla automaticamente.

## Anti-ricorrenza

`bin/check-frictions.sh` scansiona i RETRO di PROCESS-LOG.md, conta gli attriti
ripetuti >=2 volte e verifica che per ognuno esista una skill/guard corrispondente.
Se manca, stampa un WARNING. Eseguilo ad ogni RETRO.
