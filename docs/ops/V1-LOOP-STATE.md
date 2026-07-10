# ARDESIA V1 — loop state

Ultimo aggiornamento: 2026-07-10T15:17:44+0200 CEST.

## Identità

- Repository: `AndreaMarro/ardesia`
- Worktree corrente: `/Users/andreamarro/VOLUME 3/ardesia-wt-v1-dependency-audit-20260710`
- Branch corrente: `codex/v1-studio-dependency-audit-20260710`
- `origin/main` verificato: `063b609c6f8a42e704a75f43e3f4256aaf28e662`
- Macro-fase: 1 — integrazione, production gate minimi e hardening supply-chain
- Writer: singolo, scope `apps/studio/package.json`,
  `apps/studio/package-lock.json`, `docs/ops` per questo aggiornamento
- Stato terminale corrente: `DEPENDENCY_AUDIT_GREEN_SLICE` sul candidato
  `742ed1e4`; `SECURITY_PARTIAL`, lint baseline RED e `ARCHITECTURE_RED`
  restano aperti per V1 globale.

## Update 2026-07-10 — Studio dependency audit

| Claim | Stato | Evidenza | Limite |
|---|---|---|---|
| Baseline npm audit Studio era vulnerabile | VERIFIED | `npm --prefix apps/studio audit --json` prima della patch: 11 vulnerabilita' totali, 9 moderate e 2 high (`undici`, `lodash-es`, `dompurify`, `nanoid`, Mermaid/Langium/Chevrotain chain) | Snapshot npm registry 2026-07-10 |
| Override npm mirati riducono l'audit a zero | VERIFIED / GREEN_SLICE locale | commit `742ed1e4278053fa25c297a2fba864284bbe31ad`; `npm --prefix apps/studio audit --json` dopo `npm ci`: `total: 0`; `npm ls` mostra `undici@7.28.0`, `dompurify@3.4.11`, `lodash-es@4.18.1`, `nanoid@3.3.12/5.0.9`, `@mermaid-js/parser@1.2.0` | Non sostituisce monitoraggio advisory futuro |
| Studio resta funzionale con gli override | VERIFIED | `npm --prefix apps/studio run typecheck` PASS; Vitest `172 passed | 1 skipped`, `1565 passed | 5 skipped`; `npm --prefix apps/studio run build` PASS; preview locale + `ARDESIA_STUDIO_SMOKE_URL=http://127.0.0.1:4188 npm run smoke:studio:production:scenario` PASS con 9 checkpoint e zero browser/request errors | Scenario locale sul bundle costruito, non deploy production aggiornato |
| Lint Studio e' release-clean | RED | `npm --prefix apps/studio run lint` fallisce con 172 errori e 5 warning in file preesistenti non toccati dalla slice | Serve slice lint baseline dedicata; non allargare questa patch |
| Security scan del diff e' pulito | VERIFIED | `python3 bin/ci/test_secret_scan.py` OK; `python3 bin/ci/secret_scan.py` OK; `git diff --check` OK | Non chiude history/rotation/provider risks |

## Update 2026-07-10 — production scenario gate

| Claim | Stato | Evidenza | Limite |
|---|---|---|---|
| PR #157 e' stata mergiata in `main` | VERIFIED | merge commit `bf511a4420fba6011de31eb5d2b3f886e54fc9d4`; post-merge `ci` e readiness green | Aggiunge smoke base riproducibile, non nuova app behavior |
| Production smoke base e' riproducibile da comando root | VERIFIED | `npm run smoke:studio:production`: HTTP `200`, title `Ardesia · studio`, zero console/page/request/bad same-origin errors | Prova caricamento e browser health iniziale |
| PR #158 e' stata mergiata in `main` | VERIFIED | merge commit `d19faae3b03f2d684f26a49430ef11e935cdad97`; post-merge `ci` run `29091615862` success e readiness run `29091615849` success | Gate integrato, non nuova app behavior |
| Production scenario smoke e' integrato | VERIFIED / GREEN_SLICE | `npm run smoke:studio:production:scenario` PASS su head `14f71b48`: 9 checkpoint, room hash preservato, ELAB Lab mounted, citazione `Vol. 1, p. 29`, solve ok, Simulation Plugin canvas e core SVG visibili, `catalogSummary=4/88` | Non prova backend sync, RLS o persistenza avanzata |
| npm dependency health e' pulita | RED / DEFERRED | baseline invariata: install/build Studio segnala vulnerabilita' moderate/high | Slice dependency audit dedicata resta necessaria |

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
| npm dependency health e' pulita | RED / DEFERRED | `npm --prefix apps/studio ci` durante build segnala `11 vulnerabilities (9 moderate, 2 high)` | Non affrontato nello slice deploy |

## Evidenze osservate

- `VERIFIED`: `git fetch --all --prune` riuscito.
- `VERIFIED`: questa lane era pulita alla creazione da `origin/main`.
- `RED`: il worktree storico `VOLUME 3/ardesia` aveva 76 entry dirty; non è una
  base integrabile.
- `VERIFIED`: 31 worktree registrati dopo la creazione di questa lane; la
  single-writer property globale non è dimostrata.
- `VERIFIED`: PR #150 è open/draft, head `f6321975`; quattro check CI osservati
  `SUCCESS` sullo SHA della PR.
- `RED`: titolo/caveat della PR #150 dichiarano `e2e RED_BLOCKER`; CI core verde
  non prova il percorso docente.
- `VERIFIED`: Claude Code embedded `2.1.205`; Codex CLI npm locale non avviabile
  (`ENOENT`), mentre la sessione Desktop è operativa.
- `SECURITY_RED`: vedere `V1-SECURITY-MATRIX.md`.
- `RED`: `python3 bin/ci/secret_scan.py` passa ma non intercetta le superfici
  S-001/S-002; il gate corrente ha copertura insufficiente per questi casi.
- `VERIFIED`: Principio Zero autentico recuperato in
  `plugins/elab-tutor/CLAUDE.md:5-16`.
- `RED`: `plugins/elab-tutor/src/services/api.js:126-127` ordina di
  parafrasare/non citare salvo necessità, in conflitto col canon verbatim.
- `RED`: `apps/studio/sim/simulationSceneModes.ts:57-83` costruisce un solo
  passo sintetico già completo; il test steps/mounted è tautologico e non
  prova la sequenza editoriale.
- `RED`: `ToolCanvasEmbeddable.tsx:1125-1174` applica patch/callback dirette;
  `Room.tsx:913-927` non attraversa ToolHost grant/capability/RPC/audit.
- `RED`: nessun sync event-log locale→backend, nessun test RLS tenant-negative,
  reopen non reidrata gli eventi LessonOS e nessun deploy prova `204ffefc`.
- `ARCHITECTURE_RED`: `ARCHITECTURE-CANON.md:8-17` ordina di usare
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

## Candidate slice score

| Slice | Valore/unblock/verificabilità/leva | Rischio/dipendenze/scope | Esito |
|---|---|---|---|
| S0 validare/remediare segreti client-side | molto alto | medio; alcune rotazioni sono esterne | 1 |
| P33 ToolHost→LessonOS spine | molto alto | alto finché security e bypass sono aperti | 2 |
| Golden Book Circuit | alto | alto; runtime P0 e step sequence sono RED | 3 |

## Stop/next

Non iniziare feature. Prossima decisione dopo gli audit indipendenti:

1. chiudere i gate della `V1-SECURITY-MATRIX`; una singola chiave riclassificata
   non autorizza il passaggio a P33;
2. produrre la repository truth e risolvere la SoT comportamentale;
3. creare/testare la minima harness slice (regate skill + agent + hook/CI) e
   rieseguire la review della riscrittura;
4. solo dopo: P33 ToolHost seam, quindi sync/reopen/RLS/deploy;
5. le slice tutor restano bloccate finché il conflitto runtime del Principio
   Zero non ha un test falsificabile e una correzione dedicata.
