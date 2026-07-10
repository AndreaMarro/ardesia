# ARDESIA V1 — risk register

Ultimo aggiornamento: 2026-07-10T21:15:00+0200 CEST.

| ID | Rischio | Stato | Evidenza | Mitigazione |
|---|---|---|---|---|
| R-001 | Production deploy riuscito ma non equivale a scenario docente V1 completo | VERIFIED | Playwright smoke copre load/title/errori, non book flow o scenario LED certificato | Prossima slice: smoke scenario docente minimo con pointer/canvas/export/reopen |
| R-002 | Vulnerabilita' npm in Studio | VERIFIED | commit `742ed1e4278053fa25c297a2fba864284bbe31ad`: baseline 11 vulnerabilities; dopo override mirati e `npm ci`, `npm audit --json` riporta `total: 0`; PR #160 merged in `main@ce209b310c8c3f7432d2c8878df0d235386ac9f9`; post-merge `ci` run `29095910144` success e readiness run `29095910290` success; Vercel build `found 0 vulnerabilities`; production deploy `dpl_3LmGUXKofdHtUW2s8UawXrekEW89` smoke/scenario PASS | Mantenere monitoraggio advisory; lint baseline resta R-007 separato |
| R-003 | Vercel preview protette limitano review esterna | VERIFIED | preview URL finali richiedono accesso/403, production alias pubblico e' accessibile | Usare production solo dopo CI verde; investigare Vercel protection settings separatamente |
| R-004 | Chunk grandi possono peggiorare cold load | VERIFIED | Vite production warning: chunk sopra `500 kB`, inclusi `Room`, `ElabLab`, Excalidraw chunks | Code splitting/perf slice, non blocca deploy |
| R-005 | Source-of-truth runtime ancora non risolta | RED | `V1-REPOSITORY-TRUTH.md` mantiene architettura RED | Non dichiarare V1 green; ogni slice deve dichiarare owner e SHA |
| R-006 | Security history/rotation non chiusa | RED | `V1-SECURITY-MATRIX.md`: rotation/provider/history restano UNKNOWN anche con scanner S0 verde | Rotazione provider e history audit senza stampare valori |
| R-007 | Lint Studio non e' un gate verde utilizzabile oggi | RED | `npm --prefix apps/studio run lint` su branch dependency audit: 172 errori / 5 warning preesistenti | Slice dedicata per baseline lint; non mischiare con dependency remediation |
| R-008 | Principle Zero runtime non conforme | RED | `V1-PRINCIPIO-ZERO-RESEARCH.md`; `api.js:126-127,707,825-826,853,915-923`; `bookCitation.js:48-60` | Ratifica Andrea + patch prodotto + route matrix test |
| R-009 | Book fidelity viene sovravenduta oltre l'evidenza | RED | `V1-BOOK-CIRCUIT-CERTIFICATION-MATRIX.md`: 4/88 mounted candidates, 4 structural-only, 0 certified | Vietare claim "certified/book faithful" finche' ogni gate per-esperimento passa |
| R-010 | `BookCircuitSpec` diventa terzo modello runtime non governato | RED | Nessun simbolo runtime esiste oggi; `V1-BOOK-FIDELITY-ARCHITECTURE.md` raccomanda envelope su una scena canonica | ADR prima di modifiche modello; no duplicazione di fonte di verita' |
| R-011 | Current SHA deploy proof poteva restare indimostrato dopo l'integrazione P35 | VERIFIED | P36 ha trovato l'alias production ancora sul deployment precedente, poi ha creato `dpl_42Aa6QwHzVGqZQw3SaSNkrfkDwG3` da `main@b86ce8b6`; alias inspect e smoke/scenario production PASS | Mitigato per lo SHA corrente; ogni merge successivo richiede nuova prova deploy |
| R-012 | Production smoke non prova ancora l'audit P30 specifico | RED | P36 scenario smoke verifica flow ELAB/Simulation Plugin, ma non legge `maestro:tools/io.ardesia.simulation/audit.jsonl` sul live alias | Prossima slice: P37 production-safe P30 audit smoke |
