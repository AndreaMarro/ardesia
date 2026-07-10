# ARDESIA V1 — risk register

Ultimo aggiornamento: 2026-07-10T15:35:17+0200 CEST.

| ID | Rischio | Stato | Evidenza | Mitigazione |
|---|---|---|---|---|
| R-001 | Production deploy riuscito ma non equivale a scenario docente V1 completo | VERIFIED | Playwright smoke copre load/title/errori, non book flow o scenario LED certificato | Prossima slice: smoke scenario docente minimo con pointer/canvas/export/reopen |
| R-002 | Vulnerabilita' npm in Studio | CLOSED_VERIFIED on `main` + production deploy | commit `742ed1e4278053fa25c297a2fba864284bbe31ad`: baseline 11 vulnerabilities; dopo override mirati e `npm ci`, `npm audit --json` riporta `total: 0`; PR #160 merged in `main@ce209b310c8c3f7432d2c8878df0d235386ac9f9`; post-merge `ci` run `29095910144` success e readiness run `29095910290` success; Vercel build `found 0 vulnerabilities`; production deploy `dpl_3LmGUXKofdHtUW2s8UawXrekEW89` smoke/scenario PASS | Mantenere monitoraggio advisory; lint baseline resta R-007 separato |
| R-003 | Vercel preview protette limitano review esterna | VERIFIED | preview URL finali richiedono accesso/403, production alias pubblico e' accessibile | Usare production solo dopo CI verde; investigare Vercel protection settings separatamente |
| R-004 | Chunk grandi possono peggiorare cold load | VERIFIED | Vite production warning: chunk sopra `500 kB`, inclusi `Room`, `ElabLab`, Excalidraw chunks | Code splitting/perf slice, non blocca deploy |
| R-005 | Source-of-truth runtime ancora non risolta | OPEN_RED | `V1-REPOSITORY-TRUTH.md` mantiene `ARCHITECTURE_RED` | Non dichiarare V1 green; ogni slice deve dichiarare owner e SHA |
| R-006 | Security history/rotation non chiusa | OPEN_RED | `V1-SECURITY-MATRIX.md`: rotation/provider/history restano UNKNOWN anche con scanner S0 verde | Rotazione provider e history audit senza stampare valori |
| R-007 | Lint Studio non e' un gate verde utilizzabile oggi | RED | `npm --prefix apps/studio run lint` su branch dependency audit: 172 errori / 5 warning preesistenti | Slice dedicata per baseline lint; non mischiare con dependency remediation |
