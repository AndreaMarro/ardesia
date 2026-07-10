# ARDESIA V1 — decision log

Ultimo aggiornamento: 2026-07-10T13:27:39+0200 CEST.

| ID | Decisione | Stato | Evidenza | Conseguenza |
|---|---|---|---|---|
| D-001 | Usare `ardesia-lavagna` come primo deploy spine pubblico del monorepo | VERIFIED | Vercel project id `prj_MAKpjVWHC6Lw9LAPC4AwJX1tkT98`; production alias `https://ardesia-lavagna.vercel.app`; user approved deploy/merge | `ardesia-lavagna` ora serve la build Studio monorepo da `8b9fbe1d` |
| D-002 | Configurare Vercel dalla root monorepo invece che da `apps/studio` | VERIFIED | apps-only preview non risolveva import fuori app; PR #155 aggiunge `vercel.json` root; build production verde | Vercel build usa `npm --prefix apps/studio ci`, `npm --prefix apps/studio run build`, output `apps/studio/dist` |
| D-003 | Non risolvere npm audit dentro lo slice deploy | VERIFIED | audit segnala 11 vulnerabilita'; nessun fix richiesto per sbloccare deploy monorepo | Aprire slice separata per dependency risk |
| D-004 | Mantenere `ARCHITECTURE_RED` anche dopo deploy verde | VERIFIED | deploy prova solo `ardesia-lavagna` Studio surface; `V1-REPOSITORY-TRUTH.md` conserva owners runtime parziali/UNKNOWN | Vietato dichiarare V1/PILOT green |
| D-005 | Usare production browser smoke come evidenza, non preview smoke | VERIFIED | preview protette/403; production alias pubblico HTTP 200 e browser smoke verde | Review esterna deve puntare a production deploy o a preview con access policy corretta |
