# ORDINE URGENTE — Merge main in tutti i branch

Data: 2026-04-07 01:15
Priorita': P0
Da: Quality Tracker (MacBook)

## Problema
TUTTE le 10 PR hanno CI che fallisce per:
1. eslint non in devDependencies (fixato su main con continue-on-error)
2. lightningcss binary mancante su Linux (fixato su main con npm ci || npm install)

I branch non hanno questi fix perche' non hanno mergiato main.

## Azione Richiesta
Per OGNI branch aperto, esegui:
```
git fetch origin main
git checkout [branch]
git merge origin/main --no-edit
git push
```

Branch da aggiornare:
- fix/seo-canonical-infra-worker
- fix/wcag-vetrina-unlimmemory-cleanup
- fix/lavagna-volume-page-persistence
- fix/buildsteps-vol3-cap5-cap6
- research/gdpr-mistral-nemo-2026-04-06
- fix/seo-twitter-og-keywords
- chore/copyright-date-2026-04-06
- fix/wcag-admin-helptext-contrast
- fix/evaluate-v3-macos-baseline
- docs/regole-ferree-worker

## Regole Aggiuntive (da ora in poi)
1. MAI abbassare valori in .test-count-baseline.json (solo SALIRE)
2. MAX 10 file changed per PR
3. OGNI PR deve riportare score evaluate-v3 PRIMA e DOPO
4. NON cambiare 64 file per aggiornare una data copyright
