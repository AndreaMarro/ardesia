# ARDESIA V1 — decision log

Ultimo aggiornamento: 2026-07-10T15:35:17+0200 CEST.

| ID | Decisione | Stato | Evidenza | Conseguenza |
|---|---|---|---|---|
| D-001 | Usare `ardesia-lavagna` come primo deploy spine pubblico del monorepo | VERIFIED | Vercel project id `prj_MAKpjVWHC6Lw9LAPC4AwJX1tkT98`; production alias `https://ardesia-lavagna.vercel.app`; user approved deploy/merge | `ardesia-lavagna` ora serve la build Studio monorepo da `8b9fbe1d` |
| D-002 | Configurare Vercel dalla root monorepo invece che da `apps/studio` | VERIFIED | apps-only preview non risolveva import fuori app; PR #155 aggiunge `vercel.json` root; build production verde | Vercel build usa `npm --prefix apps/studio ci`, `npm --prefix apps/studio run build`, output `apps/studio/dist` |
| D-003 | Non risolvere npm audit dentro lo slice deploy | VERIFIED | audit segnala 11 vulnerabilita'; nessun fix richiesto per sbloccare deploy monorepo | Aprire slice separata per dependency risk |
| D-004 | Mantenere `ARCHITECTURE_RED` anche dopo deploy verde | VERIFIED | deploy prova solo `ardesia-lavagna` Studio surface; `V1-REPOSITORY-TRUTH.md` conserva owners runtime parziali/UNKNOWN | Vietato dichiarare V1/PILOT green |
| D-005 | Usare production browser smoke come evidenza, non preview smoke | VERIFIED | preview protette/403; production alias pubblico HTTP 200 e browser smoke verde | Review esterna deve puntare a production deploy o a preview con access policy corretta |
| D-006 | Per il dependency audit usare override transitive mirati invece di `npm audit fix --force` | VERIFIED | `@excalidraw/excalidraw` e' gia' a `0.18.1`; npm proponeva anche downgrade/major verso `0.17.6`; override testati portano audit a zero e mantengono build/scenario verdi | Riduce rischio supply-chain senza cambiare dipendenza diretta Excalidraw |
| D-007 | Redeployare `ardesia-lavagna` dopo #160 solo dopo CI post-merge verde | VERIFIED | `main@ce209b310c8c3f7432d2c8878df0d235386ac9f9`; post-merge `ci` run `29095910144` success e readiness run `29095910290` success; production deploy `dpl_3LmGUXKofdHtUW2s8UawXrekEW89` READY | La production alias ora prova dependency-audit build e scenario smoke, ma non V1 globale |
