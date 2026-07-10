# ARDESIA V1 — risk register

Ultimo aggiornamento: 2026-07-10T13:27:39+0200 CEST.

| ID | Rischio | Stato | Evidenza | Mitigazione |
|---|---|---|---|---|
| R-001 | Production deploy riuscito ma non equivale a scenario docente V1 completo | VERIFIED | Playwright smoke copre load/title/errori, non book flow o scenario LED certificato | Prossima slice: smoke scenario docente minimo con pointer/canvas/export/reopen |
| R-002 | Vulnerabilita' npm in Studio | RED | `npm ci` riporta `11 vulnerabilities (9 moderate, 2 high)` | Dependency audit branch, lockfile diff controllato, test/build completi |
| R-003 | Vercel preview protette limitano review esterna | VERIFIED | preview URL finali richiedono accesso/403, production alias pubblico e' accessibile | Usare production solo dopo CI verde; investigare Vercel protection settings separatamente |
| R-004 | Chunk grandi possono peggiorare cold load | VERIFIED | Vite production warning: chunk sopra `500 kB`, inclusi `Room`, `ElabLab`, Excalidraw chunks | Code splitting/perf slice, non blocca deploy |
| R-005 | Source-of-truth runtime ancora non risolta | OPEN_RED | `V1-REPOSITORY-TRUTH.md` mantiene `ARCHITECTURE_RED` | Non dichiarare V1 green; ogni slice deve dichiarare owner e SHA |
| R-006 | Security history/rotation non chiusa | OPEN_RED | `V1-SECURITY-MATRIX.md`: rotation/provider/history restano UNKNOWN anche con scanner S0 verde | Rotazione provider e history audit senza stampare valori |
