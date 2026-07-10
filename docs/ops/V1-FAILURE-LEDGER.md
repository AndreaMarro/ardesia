# ARDESIA V1 — failure ledger

Ultimo aggiornamento: 2026-07-10T15:52:44+0200 CEST.

Regola: ogni failure resta aperta finche' non ha una chiusura con comando,
SHA, URL o provider receipt. Non cancellare righe storiche; aggiungere una
riga di chiusura.

| ID | Failure | Stato | Evidenza | Azione/chiusura |
|---|---|---|---|---|
| F-001 | Deploy preview da `apps/studio` caricava solo la subdirectory e perdeva alias a `plugins/elab-tutor` e `packs/elab-tutor` | VERIFIED | preview fallita `ardesia-lavagna-lcoowj7dp...`; Vercel log: `vite build` non risolveva gli import da `../../plugins` e `../../packs` | PR #155 ha aggiunto `vercel.json` root con build monorepo; `vercel build --prod` verde su `8b9fbe1d` |
| F-002 | Production `ardesia-lavagna` storica non era legata al monorepo corrente | VERIFIED | `VERCEL-MAP.md` storico: production precedente da repo `AndreaMarro/ardesia-lavagna@e11e2c8...`; nessun deploy monorepo provato | deployment production `dpl_Dfqd7wa1VisEmZMcdUeZkeSJGX8s` creato da worktree `8b9fbe1d`, aliasato a `https://ardesia-lavagna.vercel.app` |
| F-003 | Preview URL protetta/gated impediva browser smoke esterno | DEFERRED | preview final `https://ardesia-lavagna-eacco3tec-andreas-projects-6d4e9791.vercel.app` restituiva 403 tramite access helper/fetch | Production alias pubblico ha smoke verde; preview auth resta issue Vercel/account separata |
| F-004 | Playwright wrapper skill `@playwright/mcp playwright-cli` non avviabile | DEFERRED | comando wrapper: `sh: playwright-cli: command not found` | Smoke equivalente eseguito con Playwright `1.60.0` installato in `apps/studio`; valutare fix skill/tooling separato |
| F-005 | Dependency audit Studio non verde | VERIFIED | baseline: `11 vulnerabilities (9 moderate, 2 high)`; commit `742ed1e4278053fa25c297a2fba864284bbe31ad` usa override mirati senza `audit fix --force`; dopo `npm ci`, `npm audit --json` riporta `total: 0`; PR #160 merged in `main@ce209b310c8c3f7432d2c8878df0d235386ac9f9`; post-merge `ci` run `29095910144` success e readiness run `29095910290` success; production deploy `dpl_3LmGUXKofdHtUW2s8UawXrekEW89` smoke/scenario PASS | Monitorare advisory future; lint baseline resta F-007 |
| F-006 | V1 globale resta bloccata da architettura/source-of-truth | RED | `V1-REPOSITORY-TRUTH.md`: Engine/Studio/ELAB ownership ancora parziale o UNKNOWN | Cutover/ADR dedicato con Mini, external heads, tests e deploy bindings |
| F-007 | Lint Studio non passa sul codice corrente | RED | `npm --prefix apps/studio run lint`: 172 errori / 5 warning in file preesistenti non toccati dalla dependency slice | Aprire slice dedicata; non correggere incidentalmente dentro hardening supply-chain |
| F-008 | Artefatti P0 richiesti dal mandato mancavano su `main@82bf629d` | VERIFIED | Prima della patch non esistevano i quattro file matrix/research/architecture/certification richiesti; ora sono aggiunti nella branch P0 | Chiusura docs-only; non chiude runtime RED |
| F-009 | Runtime Principle Zero non applica il canon sempre-on | RED | `api.js:126-127,707,825-826,853,915-923`; `bookCitation.js:48-60` | Patch prodotto dedicata dopo ratifica |
| F-010 | Book fidelity reale non e' certificabile oggi | RED | `V1-BOOK-CIRCUIT-CERTIFICATION-MATRIX.md`: 0/88 real certified | Per-experiment certification gate prima di claim esterni |
