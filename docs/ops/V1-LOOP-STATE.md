# ARDESIA V1 — loop state

## Current overlay — 2026-07-10 after PR #164 and P33 regate

| Field | Status | Evidence | Limit |
|---|---|---|---|
| Canonical repo candidate | VERIFIED | `AndreaMarro/ardesia`; `git fetch --prune origin` in `/Users/andreamarro/VOLUME 3/ardesia` | Behavioral SoT across satellite/legacy repos still not fully reconciled |
| Current `origin/main` | VERIFIED | `177f5c731ffc68fd69a86573ddf08670d3d5226f`; PR #164 merge commit | CI-green, not production-deploy-proven |
| PR #150 | VERIFIED | merged at `4f25f72c1975c5aaf66fc13272583fa28e3b4c70`; post-merge `ci` and `studio-preview-readiness` success | P30/P32 trace is not global Tinkercad parity |
| PR #163 | VERIFIED | merged at `9b7342fcbe8363a8033bc17be86766a1a0bdfd7d`; post-merge `ci` run `29101655495` success | P0 browser prompt/book anchor improvement only; tutor e2e remains UNKNOWN |
| PR #164 | VERIFIED | merged at `177f5c731ffc68fd69a86573ddf08670d3d5226f`; post-merge `ci` run `29103272760` success | docs-only loop rewrite; no product-code claim |
| Dirty main checkout | VERIFIED | `/Users/andreamarro/VOLUME 3/ardesia` has modified/untracked files | Do not use as write lane |
| Current write lane | VERIFIED | `/Users/andreamarro/ardesia-wt/tutor-ux`, branch `codex/p33-integration-spine-regate-20260710`, based on `origin/main@177f5c73` | Reused worktree because disk is low |
| Disk headroom | VERIFIED | `df -h`: about 690 MiB available | Avoid creating large new worktrees, installs or builds |
| Prompt rewrite artifacts | VERIFIED | PR #164 merged; first A7 review found six issues; follow-up A7 returned PASS | Docs-only |
| P33 result | HONEST_RED | `V1-INTEGRATION-MAP.md`: Simulation Plugin write path uses direct callbacks before ToolHost JSON-RPC/capability/audit | Next remediation is P34 ToolHost wire |
| Next slice | VERIFIED | `V1-NEXT.md` names one P34 Simulation ToolHost wire remediation slice | Not backend/RLS/export work |
| Security | RED/UNKNOWN | `V1-SECURITY-MATRIX.md`: S-002 client-side API key boundary, ToolHost sandbox/origin, RLS/history/rotation | Secret scans passing do not close these |
| Deploy proof for current SHA | UNKNOWN | latest current `main@177f5c73` has CI success only | Earlier production smoke evidence applies to older deployed SHA |
| Local docs gates | VERIFIED | `git diff --check`; `python3 bin/ci/test_secret_scan.py`; `python3 bin/ci/secret_scan.py` | Docs-only gates; no product runtime claim |

Historical entries below are retained as evidence trail and may contain stale
state superseded by this overlay. They are not active next-slice instructions.

Ultimo aggiornamento: 2026-07-10T16:01:09+0200 CEST.

## Historical Superseded Identity

- Repository: `AndreaMarro/ardesia`
- Worktree allora corrente: `/Users/andreamarro/VOLUME 3/ardesia-wt-v1-principle-zero-20260710`
- Branch allora corrente: `codex/v1-principle-zero-book-fidelity-20260710`
- `origin/main` allora verificato: `82bf629d0d73e837b4c58bed370b7f1d24509316`
- Macro-fase storica: 1 — integrazione, P0 canon, book-fidelity gate
- Writer storico: singolo, scope `docs/ops` per questa slice P0
- Stato terminale allora corrente: `P0_CANON_MATRIX_DOCS_VERIFIED_LOCAL` su
  `main@82bf629d0d73e837b4c58bed370b7f1d24509316`; security history/rotation,
  lint baseline, Principle Zero runtime e book-fidelity certification restano
  RED per V1 globale.

## Historical Update 2026-07-10 — P0 canon and book-fidelity matrices

| Claim | Stato | Evidenza | Limite |
|---|---|---|---|
| `origin/main` allora corrente era `82bf629d0d73e837b4c58bed370b7f1d24509316` | SUPERSEDED_BY_OVERLAY | `git rev-parse HEAD` nella lane P0; `gh run list --commit 82bf629d...` mostra `ci` run `29096978340` success | Docs #161 only; superseded by `9b7342fc` |
| PR #161 e' stata mergiata in `main` | VERIFIED | `gh pr view 161`: merge commit `82bf629d0d73e837b4c58bed370b7f1d24509316`, mergedAt `2026-07-10T13:41:07Z` | Registra ledger docs; non cambia prodotto runtime |
| La lane scrivibile corrente e' isolata | VERIFIED | Worktree `/Users/andreamarro/VOLUME 3/ardesia-wt-v1-principle-zero-20260710`, branch `codex/v1-principle-zero-book-fidelity-20260710`, status clean prima della patch | Non prova ownership delle altre worktree |
| I documenti P0 richiesti dal mandato erano incompleti su HEAD | VERIFIED | Prima della patch mancavano `V1-PRINCIPIO-ZERO-RESEARCH.md`, `V1-PRINCIPIO-ZERO-MATRIX.md`, `V1-BOOK-FIDELITY-ARCHITECTURE.md`, `V1-BOOK-CIRCUIT-CERTIFICATION-MATRIX.md`; ora sono versionati nella branch corrente | La mancanza storica era RED; questa patch e' docs-only e non rende runtime compliant |
| Principio Zero autentico resta recuperato | VERIFIED | `project-history.md:19-23` + `CLAUDE.md:5-16`; vedi `V1-PRINCIPIO-ZERO-RESEARCH.md` | Precedenza "parole tue" vs verbatim resta UNKNOWN |
| Runtime Principio Zero restava non conforme nella lane P0 | SUPERSEDED_BY_C-046_C-047 | `api.js:126-127,707,825-826,853,915-923`; `bookCitation.js:48-60` | PR #163 ha chiuso parte del conflitto browser; tutor e2e resta UNKNOWN |
| Book fidelity certificata resta zero | VERIFIED | 4/88 mounted candidates, 4 structural-only receipts, 0 human/visual certified; vedi `V1-BOOK-CIRCUIT-CERTIFICATION-MATRIX.md` | Release book-fidelity resta RED; non vieta ispezione candidate, vieta claim di certificazione |
| Local docs and evidence gates pass | VERIFIED | `git diff --check` OK; `python3 bin/ci/test_secret_scan.py` OK; `python3 bin/ci/secret_scan.py` OK; `npm --prefix apps/studio ci --no-fund` found 0 vulnerabilities; `npm --prefix apps/studio test -- --run src/__tests__/SimulationStepByStep.test.tsx src/__tests__/VisualOverlayReport.test.ts src/__tests__/ElabSceneAdapter.test.ts src/__tests__/SimulationSceneModes.test.ts` PASS, 4 files / 36 tests | Docs-only local gate; full CI/PR still required |

## Update 2026-07-10 — dependency audit production deploy

| Claim | Stato | Evidenza | Limite |
|---|---|---|---|
| PR #160 e' stata mergiata in `main` | VERIFIED | merge commit `ce209b310c8c3f7432d2c8878df0d235386ac9f9`; mergedAt `2026-07-10T13:23:56Z` | Integra hardening supply-chain; non e' V1 globale |
| `main@ce209b31` ha CI post-merge verde | VERIFIED | `ci` run `29095910144` success; `studio-preview-readiness` run `29095910290` success | Workflow evidence; non prova browser production da solo |
| Production `ardesia-lavagna` e' stata redeployata dopo il merge #160 | VERIFIED | `vercel build --prod` sul project id `prj_MAKpjVWHC6Lw9LAPC4AwJX1tkT98`; `npm ci` durante build riporta `found 0 vulnerabilities`; deploy `dpl_3LmGUXKofdHtUW2s8UawXrekEW89` READY; alias `https://ardesia-lavagna.vercel.app` | Il primo build tentativo aveva link locale errato; e' stato relinkato al project id canonico prima del deploy production |
| Production HTTP e browser base sono verdi | VERIFIED | `curl -L https://ardesia-lavagna.vercel.app`: HTTP `200`; `npm run smoke:studio:production` PASS, title `Ardesia · studio`, hash `#wbstudio-tkin23m`, zero console/page/request/bad same-origin errors | Smoke base, non scenario completo |
| Production scenario smoke resta verde dopo dependency audit | VERIFIED | `npm run smoke:studio:production:scenario` PASS: 9 checkpoint, room hash `#wbstudio-vcz7o5n`, ELAB Lab mounted, citazione `Vol. 1, p. 29`, solve ok, Simulation Plugin canvas e core SVG visibili, `catalogSummary=4/88`, zero console/page/request/bad same-origin errors | Non prova backend sync, RLS, persistenza avanzata o ToolHost globale |
| npm dependency health della build deployed e' pulita | VERIFIED | override merge #160 + `npm ci` in Vercel build: `found 0 vulnerabilities`; local candidate audit gia' `total: 0` | Non sostituisce monitoraggio advisory futuro |

## Update 2026-07-10 — Studio dependency audit

| Claim | Stato | Evidenza | Limite |
|---|---|---|---|
| Baseline npm audit Studio era vulnerabile | VERIFIED | `npm --prefix apps/studio audit --json` prima della patch: 11 vulnerabilita' totali, 9 moderate e 2 high (`undici`, `lodash-es`, `dompurify`, `nanoid`, Mermaid/Langium/Chevrotain chain) | Snapshot npm registry 2026-07-10 |
| Override npm mirati riducono l'audit a zero | VERIFIED | commit `742ed1e4278053fa25c297a2fba864284bbe31ad`; `npm --prefix apps/studio audit --json` dopo `npm ci`: `total: 0`; `npm ls` mostra `undici@7.28.0`, `dompurify@3.4.11`, `lodash-es@4.18.1`, `nanoid@3.3.12/5.0.9`, `@mermaid-js/parser@1.2.0` | Non sostituisce monitoraggio advisory futuro |
| Studio resta funzionale con gli override | VERIFIED | `npm --prefix apps/studio run typecheck` PASS; Vitest `172 passed | 1 skipped`, `1565 passed | 5 skipped`; `npm --prefix apps/studio run build` PASS; preview locale + `ARDESIA_STUDIO_SMOKE_URL=http://127.0.0.1:4188 npm run smoke:studio:production:scenario` PASS con 9 checkpoint e zero browser/request errors | Scenario locale sul bundle costruito, non deploy production aggiornato |
| Lint Studio e' release-clean | RED | `npm --prefix apps/studio run lint` fallisce con 172 errori e 5 warning in file preesistenti non toccati dalla slice | Serve slice lint baseline dedicata; non allargare questa patch |
| Security scan del diff e' pulito | VERIFIED | `python3 bin/ci/test_secret_scan.py` OK; `python3 bin/ci/secret_scan.py` OK; `git diff --check` OK | Non chiude history/rotation/provider risks |

## Update 2026-07-10 — production scenario gate

| Claim | Stato | Evidenza | Limite |
|---|---|---|---|
| PR #157 e' stata mergiata in `main` | VERIFIED | merge commit `bf511a4420fba6011de31eb5d2b3f886e54fc9d4`; post-merge `ci` e readiness green | Aggiunge smoke base riproducibile, non nuova app behavior |
| Production smoke base e' riproducibile da comando root | VERIFIED | `npm run smoke:studio:production`: HTTP `200`, title `Ardesia · studio`, zero console/page/request/bad same-origin errors | Prova caricamento e browser health iniziale |
| PR #158 e' stata mergiata in `main` | VERIFIED | merge commit `d19faae3b03f2d684f26a49430ef11e935cdad97`; post-merge `ci` run `29091615862` success e readiness run `29091615849` success | Gate integrato, non nuova app behavior |
| Production scenario smoke e' integrato | VERIFIED | `npm run smoke:studio:production:scenario` PASS su head `14f71b48`: 9 checkpoint, room hash preservato, ELAB Lab mounted, citazione `Vol. 1, p. 29`, solve ok, Simulation Plugin canvas e core SVG visibili, `catalogSummary=4/88` | Non prova backend sync, RLS o persistenza avanzata |
| npm dependency health e' pulita | VERIFIED | Vedere update "dependency audit production deploy": #160 merged, CI verde, Vercel build `found 0 vulnerabilities`, production smoke e scenario PASS | Storico della scenario-gate slice; la chiusura e' successiva |

## Update 2026-07-10 — deploy spine

| Claim | Stato | Evidenza | Limite |
|---|---|---|---|
| PR #151 e' stata mergiata in `main` | VERIFIED | `origin/main@7c2ae9d6`, CI run `29087725189` green, readiness run `29087725221` green | Baseline/harness/evidence stack, non V1 prodotto |
| PR #155 e' stata mergiata in `main` | VERIFIED | `gh pr view 155`; merge commit `8b9fbe1dd1a471029dce18b5a72adc15004e0298`; mergedAt `2026-07-10T11:19:25Z` | Deploy config, non feature product |
| `main@8b9fbe1d` ha CI verde | VERIFIED | `gh run list --commit 8b9fbe1d`: `ci` run `29089070501` success; `studio-preview-readiness` run `29089070505` success | Prova workflow, non browser/deploy |
| Root monorepo Vercel build production funziona | VERIFIED | `vercel build --prod --yes --scope team_23uD0RgdInaTaOPEL0EGltup` su `8b9fbe1d`, status `ok`, target `production` | Avvisi chunk-size e peer dependency non risolti |
| Production deploy `ardesia-lavagna` serve il commit integrato | VERIFIED | deployment `dpl_Dfqd7wa1VisEmZMcdUeZkeSJGX8s`, target `production`, status `Ready`, alias `https://ardesia-lavagna.vercel.app` | Vercel CLI inspect non mostra nel testo il commit metadata, ma il deploy e' stato creato da worktree `8b9fbe1d` con `-m gitCommitSha` |
| Production HTTP smoke e' verde | VERIFIED | `curl -L https://ardesia-lavagna.vercel.app`: HTTP `200`, title HTML `Ardesia · studio` | HTTP non prova interazione canvas |
| Production browser smoke e' verde | VERIFIED | Playwright Chromium: HTTP `200`, title `Ardesia · studio`, nessun `console.error`, `pageerror`, failed request o bad response; screenshot `output/playwright/ardesia-lavagna-production.png` | Smoke iniziale, non scenario docente completo |
| npm dependency health e' pulita | RED | `npm --prefix apps/studio ci` durante build segnala `11 vulnerabilities (9 moderate, 2 high)` | Non affrontato nello slice deploy; chiuso in slice successiva |

## Evidenze osservate

- `VERIFIED`: `git fetch --all --prune` riuscito.
- `VERIFIED`: questa lane era pulita alla creazione da `origin/main`.
- `RED`: il worktree storico `VOLUME 3/ardesia` aveva 76 entry dirty; non è una
  base integrabile.
- `VERIFIED`: 31 worktree registrati dopo la creazione di questa lane; la
  single-writer property globale non è dimostrata.
- `SUPERSEDED_BY_C-044`: PR #150 era open/draft, head `f6321975`; quattro check
  CI erano stati osservati `SUCCESS` sullo SHA della PR.
- `SUPERSEDED_BY_C-044`: titolo/caveat della PR #150 dichiaravano
  `e2e RED_BLOCKER`; CI core verde non provava il percorso docente.
- `VERIFIED`: Claude Code embedded `2.1.205`; Codex CLI npm locale non avviabile
  (`ENOENT`), mentre la sessione Desktop è operativa.
- `RED`: vedere `V1-SECURITY-MATRIX.md` per security history/rotation.
- `RED`: `python3 bin/ci/secret_scan.py` passa ma non intercetta le superfici
  S-001/S-002; il gate corrente ha copertura insufficiente per questi casi.
- `VERIFIED`: Principio Zero autentico recuperato in
  `plugins/elab-tutor/automa/context/project-history.md:19-23`; operational
  extension in `plugins/elab-tutor/CLAUDE.md:5-16`.
- `RED`: `plugins/elab-tutor/src/services/api.js:126-127` ordina di
  parafrasare/non citare salvo necessità, in conflitto col canon verbatim.
- `RED`: `apps/studio/sim/simulationSceneModes.ts:57-83` costruisce un solo
  passo sintetico già completo; il test steps/mounted è tautologico e non
  prova la sequenza editoriale.
- `RED`: `ToolCanvasEmbeddable.tsx:1125-1174` applica patch/callback dirette;
  `Room.tsx:913-927` non attraversa ToolHost grant/capability/RPC/audit.
- `RED`: nessun sync event-log locale→backend, nessun test RLS tenant-negative,
  reopen non reidrata gli eventi LessonOS e nessun deploy prova `204ffefc`.
- `RED`: `ARCHITECTURE-CANON.md:8-17` ordina di usare
  `lessonos`/`maestro-studio` per il comportamento, ma il monorepo ha commit più
  recenti. La SoT comportamentale deve essere riverificata prima di scrivere.

## Iterazione 0

Obiettivo binario: trasformare il mandato in una versione applicabile e
stabilire la prima frontiera reale senza cambiare prodotto.

Acceptance:

- prompt operativo e rapporto di riscrittura versionati;
- claim e security matrix legati allo SHA;
- review indipendente senza finding P0/P1 aperti sulla riscrittura;
- una sola prossima slice selezionata.

Rollback: eliminare i soli file `ARDESIA-V1-*`/`V1-*` creati su questa branch.

## Superseded Candidate Score

The older S0/P33/Golden Book ordering is inactive, and P33 has now closed as
`HONEST_RED`. The only active next slice is
`P34-SIMULATION-TOOLHOST-WIRE-REMEDIATION-001` in `docs/ops/V1-NEXT.md`.
