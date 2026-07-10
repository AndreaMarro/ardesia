# ARDESIA V1 — failure ledger

Ultimo aggiornamento: 2026-07-10T13:27:39+0200 CEST.

Regola: ogni failure resta aperta finche' non ha una chiusura con comando,
SHA, URL o provider receipt. Non cancellare righe storiche; aggiungere una
riga di chiusura.

| ID | Failure | Stato | Evidenza | Azione/chiusura |
|---|---|---|---|---|
| F-001 | Deploy preview da `apps/studio` caricava solo la subdirectory e perdeva alias a `plugins/elab-tutor` e `packs/elab-tutor` | CLOSED_VERIFIED | preview fallita `ardesia-lavagna-lcoowj7dp...`; Vercel log: `vite build` non risolveva gli import da `../../plugins` e `../../packs` | PR #155 ha aggiunto `vercel.json` root con build monorepo; `vercel build --prod` verde su `8b9fbe1d` |
| F-002 | Production `ardesia-lavagna` storica non era legata al monorepo corrente | CLOSED_VERIFIED for `ardesia-lavagna` | `VERCEL-MAP.md` storico: production precedente da repo `AndreaMarro/ardesia-lavagna@e11e2c8...`; nessun deploy monorepo provato | deployment production `dpl_Dfqd7wa1VisEmZMcdUeZkeSJGX8s` creato da worktree `8b9fbe1d`, aliasato a `https://ardesia-lavagna.vercel.app` |
| F-003 | Preview URL protetta/gated impediva browser smoke esterno | DEFERRED | preview final `https://ardesia-lavagna-eacco3tec-andreas-projects-6d4e9791.vercel.app` restituiva 403 tramite access helper/fetch | Production alias pubblico ha smoke verde; preview auth resta issue Vercel/account separata |
| F-004 | Playwright wrapper skill `@playwright/mcp playwright-cli` non avviabile | DEFERRED | comando wrapper: `sh: playwright-cli: command not found` | Smoke equivalente eseguito con Playwright `1.60.0` installato in `apps/studio`; valutare fix skill/tooling separato |
| F-005 | Dependency audit Studio non verde | OPEN_RED | `npm --prefix apps/studio ci` durante `vercel build --prod`: `11 vulnerabilities (9 moderate, 2 high)` | Aprire slice dependency audit; non usare `npm audit fix --force` dentro slice deploy |
| F-006 | V1 globale resta bloccata da architettura/source-of-truth | OPEN_RED | `V1-REPOSITORY-TRUTH.md`: Engine/Studio/ELAB ownership ancora parziale o UNKNOWN | Cutover/ADR dedicato con Mini, external heads, tests e deploy bindings |

