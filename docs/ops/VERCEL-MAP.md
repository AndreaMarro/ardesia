# ARDESIA — Vercel map

## Update 2026-07-10 21:35-21:45 CEST - production P30 audit smoke

No deploy, no alias change.

Verified in this pass:

| Surface | Probe | Result | Interpretation |
|---|---|---:|---|
| `https://ardesia-lavagna.vercel.app` | `npm run smoke:studio:production:p30-audit` first run | RED | The live app loaded, but the P30 trace waited on dev-only `window.__MAESTRO_TEST__.ready`, intentionally absent from production. |
| P30 smoke harness | user-visible readiness fallback | OK | `p30-free-manipulation.spec.ts` now waits for production-safe DOM readiness (`data-view-nav` plus insert Simulation Plugin button), not a dev-only hook. |
| `https://ardesia-lavagna.vercel.app` | `npm run smoke:studio:production:p30-audit` rerun | PASS | P30 trace passes 1/1 against production: Simulation Plugin insert, free manipulation, break diagnostic, `board.write` audit increase, reload persistence and audit snapshot. |
| local dev server | `npm --prefix apps/studio run e2e -- e2e/p30-free-manipulation.spec.ts --workers=1 --reporter=line` | PASS | The production harness fallback did not regress the local P30 trace. |

Limitations:

- This proves browser-local ToolHost audit visibility on the live alias. It
  does not prove backend sync, RLS, LessonOS durable event log, graph projection
  or ElabTutor retrieval.
- The live alias still serves the P36 runtime deployment
  `dpl_42Aa6QwHzVGqZQw3SaSNkrfkDwG3`. The later #168 merge is docs/.gitignore
  only and was not redeployed.

## Update 2026-07-10 21:05-21:09 CEST - current SHA production deploy proof

Deployment action autorizzata da Andrea nella sessione corrente.

Verified in this pass:

| Surface | Probe | Result | Interpretation |
|---|---|---:|---|
| `main` | local deploy worktree | VERIFIED | Clean deploy source before docs branch: `main@b86ce8b67795d3239196fbd1a70d8e57a4444314`, the PR #167 merge commit. |
| `https://ardesia-lavagna.vercel.app` | `vercel inspect` before deploy | STALE | Alias still pointed at older deployment `dpl_3LmGUXKofdHtUW2s8UawXrekEW89`, created 2026-07-10 15:32 CEST for the dependency-audit slice. |
| `ardesia-lavagna` | `vercel link --yes --team team_23uD0RgdInaTaOPEL0EGltup --project prj_MAKpjVWHC6Lw9LAPC4AwJX1tkT98` | OK | Local worktree linked to canonical project `ardesia-lavagna`. The command created local `.vercel/`; `.vercel` is ignored and must not be committed. |
| `ardesia-lavagna` | `vercel build --prod --yes --scope team_23uD0RgdInaTaOPEL0EGltup` | OK | Production build completed from monorepo root; Vercel build output ended with `status: ok`, `target: production`. |
| `ardesia-lavagna` | `vercel deploy --prebuilt --prod --yes --scope team_23uD0RgdInaTaOPEL0EGltup` | READY | Production deployment `dpl_42Aa6QwHzVGqZQw3SaSNkrfkDwG3`, URL `https://ardesia-lavagna-gh9u94qzt-andreas-projects-6d4e9791.vercel.app`, aliased to `https://ardesia-lavagna.vercel.app`. |
| `https://ardesia-lavagna.vercel.app` | `vercel inspect` after deploy | READY | Alias resolves to `dpl_42Aa6QwHzVGqZQw3SaSNkrfkDwG3`; created 2026-07-10 21:05:51 CEST. |
| `https://ardesia-lavagna.vercel.app` | `npm run smoke:studio:production` | PASS | HTTP 200, final hash room URL, title `Ardesia · studio`, zero console/page/request/bad-response errors. |
| `https://ardesia-lavagna.vercel.app` | `npm run smoke:studio:production:scenario` | PASS | 9 checkpoints, ELAB Lab mounted, citation `Vol. 1, p. 29`, solve ok, same-room return, Simulation Plugin canvas/core SVG visible, `catalogSummary=4/88`, zero browser/request errors. |

Limitations:

- This proves deploy provenance by local source SHA plus Vercel deployment
  receipt and smoke evidence. The CLI inspect output did not print Git commit
  metadata for the prebuilt deployment.
- This is not `V1_GREEN`: backend sync, RLS tenant isolation, full ToolHost
  coverage, export/reopen beyond the smoke path and book certification remain
  separate risks.

## Update 2026-07-10 15:30-15:33 CEST - dependency audit production deploy

Deployment action autorizzata da Andrea nella sessione corrente.

Verified in this pass:

| Surface | Probe | Result | Interpretation |
|---|---|---:|---|
| `main` | PR #160 merge + post-merge checks | OK | `main@ce209b310c8c3f7432d2c8878df0d235386ac9f9`; `ci` run `29095910144` success; `studio-preview-readiness` run `29095910290` success. |
| `ardesia-lavagna` | `vercel link --yes --team team_23uD0RgdInaTaOPEL0EGltup --project prj_MAKpjVWHC6Lw9LAPC4AwJX1tkT98` | OK | Local deploy worktree linked to canonical project `ardesia-lavagna`, project id `prj_MAKpjVWHC6Lw9LAPC4AwJX1tkT98`. |
| `ardesia-lavagna` | `vercel build --prod --yes --scope team_23uD0RgdInaTaOPEL0EGltup` | OK | Production build completed from monorepo root; build-time `npm ci` reported `found 0 vulnerabilities`. |
| `ardesia-lavagna` | `vercel deploy --prebuilt --prod --yes --scope team_23uD0RgdInaTaOPEL0EGltup` | READY | Production deployment `dpl_3LmGUXKofdHtUW2s8UawXrekEW89`, URL `https://ardesia-lavagna-43raj4p0w-andreas-projects-6d4e9791.vercel.app`. |
| `https://ardesia-lavagna.vercel.app` | `vercel inspect` | READY | Alias points at the post-#160 production deployment. |
| `https://ardesia-lavagna.vercel.app` | `curl -L` | HTTP 200 | Public production alias reachable after dependency-audit deploy. |
| `https://ardesia-lavagna.vercel.app` | `npm run smoke:studio:production` | PASS | Title `Ardesia · studio`; no `console.error`, `pageerror`, failed request, or same-origin bad response. |
| `https://ardesia-lavagna.vercel.app` | `npm run smoke:studio:production:scenario` | PASS | 9 checkpoints, room hash preserved, ELAB Lab mounted, citation `Vol. 1, p. 29`, Simulation Plugin canvas/core SVG visible, `catalogSummary=4/88`, zero browser/request errors. |

Limitations:

- This closes the current npm audit deploy risk for `main@ce209b31`; it does
  not prove future advisory safety.
- This does not prove backend sync, RLS tenant isolation, full ToolHost
  capability coverage, source-of-truth cutover, or `V1_GREEN`.
- `npm --prefix apps/studio run lint` remains RED with the previously recorded
  pre-existing lint baseline.
- A first build attempt in this worktree used an unintended local Vercel link;
  the worktree was relinked to the canonical project id before the production
  build and deploy recorded above.

## Update 2026-07-10 13:25-13:27 CEST - monorepo production deploy

Deployment action autorizzata da Andrea nella sessione corrente.

Verified in this pass:

| Surface | Probe | Result | Interpretation |
|---|---|---:|---|
| `ardesia-lavagna` | `vercel build --prod --yes --scope team_23uD0RgdInaTaOPEL0EGltup` from monorepo root at `8b9fbe1d` | OK | Root `vercel.json` can build `apps/studio` while preserving monorepo-local `plugins/` and `packs/` imports. |
| `ardesia-lavagna` | `vercel deploy --prebuilt --prod --yes --scope team_23uD0RgdInaTaOPEL0EGltup` | READY | Production deployment `dpl_Dfqd7wa1VisEmZMcdUeZkeSJGX8s`. |
| `https://ardesia-lavagna.vercel.app` | `vercel inspect` | READY | Alias points at `ardesia-lavagna-bmxmgxqi2-andreas-projects-6d4e9791.vercel.app`. |
| `https://ardesia-lavagna.vercel.app` | `curl -L` | HTTP 200 | Public production alias reachable. |
| `https://ardesia-lavagna.vercel.app` | Playwright Chromium smoke | PASS | Title `Ardesia · studio`; no `console.error`, `pageerror`, failed request, or same-origin bad response. |

GitHub evidence:

- PR #155 `chore(deploy): add monorepo Vercel config` merged into `main`.
- Merge commit: `8b9fbe1dd1a471029dce18b5a72adc15004e0298`.
- Post-merge workflows on that commit: `ci` run `29089070501` success;
  `studio-preview-readiness` run `29089070505` success.

Limitations:

- This proves the `ardesia-lavagna` Studio surface deploy spine only. It does
  not prove a full V1 lesson scenario, backend/RLS, ToolHost third-party safety,
  or global source-of-truth cutover.
- Vercel preview URLs observed in this slice were access-protected/403 from the
  current tooling, so browser smoke evidence is from the public production
  alias after CI green.
- `npm --prefix apps/studio ci` still reports `11 vulnerabilities (9 moderate,
  2 high)`; dependency remediation is a separate risk slice.

## Update 2026-07-02 01:27 CEST - read-only demo probe

No deploy, no alias change, no production action.

Verified in this pass:

| Surface | Probe | Result | Interpretation |
|---|---|---:|---|
| `ardesia-lavagna` | `curl -L https://ardesia-lavagna.vercel.app` | HTTP 200 | Public demo candidate still reachable. |
| `ardesia-api-vercel` | `curl -L https://ardesia-api-vercel.vercel.app/health` | HTTP 200 | API health endpoint still reachable. |
| `www.elabtutor.school` | `curl -L https://www.elabtutor.school` | HTTP 401 | ELAB production remains gated/protected; do not use as public ARDESIA demo. |

CLI state:

- `vercel whoami` returned `andreamarro`.
- `vercel project ls --scope team_23uD0RgdInaTaOPEL0EGltup` did not return a useful project table in this pass, so no project-list freshness claim is made here.

Current decision:

- Demo status remains `read-only reachable / partial`.
- Do not claim the live demo contains the latest monorepo Simulation Plugin slice unless a browser check proves it on the served deployment.
- Do not run `vercel deploy` without Andrea's explicit preview-deploy OK.

Update 2026-07-04:

- Clean monorepo worktree `/private/tmp/ardesia-preview-preflight-20260704` has no `.vercel/project.json` at the repo root or under `apps/studio`.
- Root command `npm run preview:studio:preflight` now detects that blocker after local Studio typecheck/build.
- Do not run `vercel link` automatically; the target Vercel project/root remains an Andrea gate before the first monorepo preview deploy.

Data: 2026-06-30
Aggiornamento live: 2026-07-01 03:08-03:20 CEST
Audit esteso Vercel: 2026-07-01 03:55-04:05 CEST
Stato: mappa additiva, live verificato in sola lettura dove indicato

## Verdetto

Il connector Vercel via MCP e' stato provato ma restituisce `403 Forbidden`
sui progetti del team `team_23uD0RgdInaTaOPEL0EGltup`. La CLI Vercel locale
e' autenticata come `andreamarro` e ha permesso verifica in sola lettura.

Nessun deploy e' stato eseguito.

Regola:

```text
Vercel serve demo e preview. La fonte canonica resta il monorepo ARDESIA.
```

## Inventario progetti live via CLI

Comando sorgente: `vercel project ls --scope team_23uD0RgdInaTaOPEL0EGltup`

| Project | Production URL | Aggiornato CLI | Categoria | Stato operativo |
|---|---|---:|---|---|
| `elab-tutor` | `https://www.elabtutor.school` | 1d | separate-product | Ready da Vercel; HTTP pubblico 401 su dominio e alias. Non ARDESIA. |
| `elab-main` | `https://elab-main.vercel.app` | 1d | ELAB/side-surface | Ready; HTTP 200. Non ARDESIA demo canonica. |
| `ardesia-lavagna` | `https://ardesia-lavagna.vercel.app` | 3d | candidate-demo | Ready; browser check live parziale passato. |
| `ardesia-canvas` | `https://ardesia-canvas.vercel.app` | 3d | prototype/stale-unknown | Ready da inspect; browser flow non verificato. |
| `ardesia-api-vercel` | `https://ardesia-api-vercel.vercel.app` | 5d | api-prototype | Ready; `/health`, `/docs`, `/openapi.json` 200; root 404 atteso/non-home. |
| `ardesia-workspace` | `https://ardesia-workspace.vercel.app` | 9d | prototype/workspace | Ready da inspect; browser flow non verificato. |
| `numeria-lab` | `https://numeria-lab.vercel.app` | 22d | separate-product | Ready; HTTP 200; fuori ARDESIA. |
| `crea-un-app-html-javascript-che` | `https://crea-un-app-html-javascript-che.vercel.app` | 26d | prototype/unknown | Ready; HTTP 200; non classificato prodotto. |
| `elab-builder-blockly-definitivo` | `https://elab-builder-blockly-definitivo.vercel.app` | 36d | ELAB historical/prototype | Ready; HTTP 200. |
| `elab-builder-slice1a` | `https://elab-builder-slice1a.vercel.app` | 36d | ELAB historical/prototype | Ready; HTTP 200. |
| `elab-builder-hotfix` | `https://elab-builder-hotfix.vercel.app` | 67d | ELAB historical/prototype | Ready; HTTP 200. |
| `studiaasino` | `https://studiaasino.vercel.app` | 67d | old/unknown | Ready; HTTP 200; slowest measured response in audit (~3.9s). |
| `stress-test` | `https://stress-test-taupe.vercel.app` | 67d | old/test | Ready; HTTP 200; GitHub-linked to `StressTest`. |

## Account/team audit 2026-07-01

Read-only facts:

- `vercel whoami`: `andreamarro`.
- Team: `andreas-projects-6d4e9791` / `Andrea's projects`.
- Team id used by linked local projects: `team_23uD0RgdInaTaOPEL0EGltup`.
- CLI version observed: `Vercel CLI 53.4.0`.
- Projects listed by `vercel project ls`: 13.
- Custom domains listed by `vercel domains ls`: 1, `elabtutor.school`, registrar Vercel, expiration 2027-02-24.
- Vercel MCP `_get_project` still returns `403 Forbidden` for known project ids; CLI and `vercel api` are the usable read-only sources.

API project link state (`vercel api /v9/projects?...`):

| Project | Project id | Framework | Git link |
|---|---|---|---|
| `elab-tutor` | `prj_Sm9JGt80Ivec3sMFAQ8abfz4UdnV` | vite | `AndreaMarro/elab-tutor` |
| `elab-main` | `prj_HrjbaECJbAArjeEMLJN37nuLIClq` | vite | `AndreaMarro/elab-tutor` |
| `ardesia-lavagna` | `prj_MAKpjVWHC6Lw9LAPC4AwJX1tkT98` | vite | no project-level link exposed, but deployments have GitHub meta |
| `ardesia-canvas` | `prj_nUzKY2USplKNjBD7iEAQyCefSz0s` | unknown | no project-level link exposed |
| `ardesia-api-vercel` | `prj_9nkDJqNncHhbYoVVeNPwL6hMVcN6` | fastapi | no project-level link exposed |
| `ardesia-workspace` | `prj_UI4f8z2irQbLOzbNLuoqSlg6718d` | vite | no project-level link exposed |
| `numeria-lab` | `prj_FeNwTB89DhEmMTKQTRw0POza3ikS` | services | deployments have GitHub meta |
| `stress-test` | `prj_cZj84wGDm51UKhhnmx401HUa67V8` | vite 22.x | `AndreaMarro/StressTest` |

Linked local directories (`.vercel/project.json`) found:

- `PRODOTTO/elab-builder`, `PRODOTTO/elab-builder-demo25`, and repo root `VOLUME 3` point to project `elab-tutor`.
- `PRODOTTO/elab-builder-slice1a` points to `elab-builder-slice1a`.
- `PRODOTTO/elab-builder-blockly-definitivo` points to `elab-builder-blockly-definitivo`.
- `PRODOTTO/elab-builder-shared-infra` points to `elab-builder-shared-infra`, but this project was not listed by `vercel project ls`; treat as stale local link until verified separately.
- ARDESIA local prototypes point to `ardesia-lavagna`, `ardesia-canvas`, `ardesia-api-vercel`, `ardesia-workspace`.

## Deploy ARDESIA ispezionati

| Project | Deployment | Target | Status | Creato | Evidenza |
|---|---|---|---|---|---|
| `ardesia-lavagna` | `dpl_DKBRsSWSDj4TofXGswKxgMKiKWC3` / `ardesia-lavagna-qluwig03v...` | production | Ready | 2026-06-28 10:13 CEST | `vercel inspect`, build log, browser check. |
| `ardesia-canvas` | `dpl_B4G6QXgiEtfEh8uQz34TsDwm8m5H` / `ardesia-canvas-nbgs94jj7...` | production | Ready | 2026-06-27 18:29 CEST | `vercel inspect`; no browser check. |
| `ardesia-api-vercel` | `dpl_Ah4W9E7C1dqw9ot23tTFrMU4jnqn` / `ardesia-api-vercel-7ren954yv...` | production | Ready | 2026-06-25 16:45 CEST | `vercel inspect`; Python lambda build present. |
| `ardesia-workspace` | `dpl_8rF4hULfTZLPjMMXpNYG7sKyMiwS` / `ardesia-workspace-mb18unja4...` | production | Ready | 2026-06-21 16:25 CEST | `vercel inspect`; no browser check. |

Deployment API corrected source data:

- `ardesia-lavagna` latest production deployment has GitHub meta:
  `AndreaMarro/ardesia-lavagna`, branch `feat/lavagna-p0-20260628`,
  commit `e11e2c8dc8352d94ba7b99375194e7ad59d50855`.
- There is a blocked `ardesia-lavagna` preview from branch `main`,
  commit `82b5d5df5c4a51237816a96d2ffc4bb1ac26792a`.
- `ardesia-canvas`, `ardesia-api-vercel`, and `ardesia-workspace` latest
  production deployments did not expose GitHub meta in the deployment API
  results inspected.

## All-project HTTP status 2026-07-01

Command source: `curl -L -s -o /dev/null -w '%{http_code} ...'`.

| URL | HTTP | Interpretation |
|---|---:|---|
| `https://www.elabtutor.school` | 401 | Protected/gated; production Ready but not public touchable. |
| `https://elabtutor.school` | 401 -> `www` | Same gate. |
| `https://elab-builder.vercel.app` | 401 | Alias to `elab-tutor`, gated. |
| `https://elab-main.vercel.app` | 200 | Public. |
| `https://ardesia-lavagna.vercel.app` | 200 | Public demo candidate. |
| `https://ardesia-canvas.vercel.app` | 200 | Public, untested flow. |
| `https://ardesia-api-vercel.vercel.app` | 404 root | API root has no homepage; `/health`, `/docs`, `/openapi.json` return 200. |
| `https://ardesia-workspace.vercel.app` | 200 | Public, untested flow. |
| `https://numeria-lab.vercel.app` | 200 | Public separate product. |
| `https://crea-un-app-html-javascript-che.vercel.app` | 200 | Public old/prototype. |
| `https://elab-builder-blockly-definitivo.vercel.app` | 200 | Public old/prototype. |
| `https://elab-builder-slice1a.vercel.app` | 200 | Public old/prototype. |
| `https://elab-builder-hotfix.vercel.app` | 200 | Public old/prototype. |
| `https://studiaasino.vercel.app` | 200 | Public old/prototype. |
| `https://stress-test-taupe.vercel.app` | 200 | Public old/test. |

## Recent deployment anomalies

Recent statuses from `vercel api /v6/deployments?...limit=100` and `vercel inspect --format=json`:

| Project | Deployment | State | Target | Git meta | Note |
|---|---|---|---|---|---|
| `elab-tutor` | `elab-tutor-djxq7o0e9...` | BLOCKED | production | `main` / `732ff077...` | Later production deploys are Ready; blocked deploy did not hold current aliases. |
| `elab-tutor` | `elab-tutor-b15plygl5...` | BLOCKED | production | `main` / `732ff077...` | Later production deploys are Ready. |
| `ardesia-lavagna` | `ardesia-lavagna-qbw5mem8b...` | BLOCKED | preview | `main` / `82b5d5df...` | Preview only; production candidate is Ready. |
| `ardesia-api-vercel` | `ardesia-api-vercel-ct10aohku...` | ERROR | production | none exposed | Later production deploy is Ready. |
| `elab-tutor` | `elab-tutor-m8ydcvzba...` and siblings | ERROR | preview | `feature/numerical-lab-journey-completion` | Old PR/feature deploys, not current production. |

Operational interpretation:

- Current public ARDESIA demo surface: only `ardesia-lavagna`.
- Current ARDESIA API surface: `ardesia-api-vercel` is alive at documented API paths, not root.
- ELAB production appears intentionally gated/protected at public domains.
- Several old ELAB/prototype Vercel projects remain publicly reachable; classify before using in any demo.

## Browser check live: `ardesia-lavagna`

Comando sorgente: Chrome headless via Playwright package cache, URL
`https://ardesia-lavagna.vercel.app`.

Risultato verificato:

```text
lavagna -> plugin picker -> Pulsante -> LED -> click LED -> export lezione -> import/riapertura
```

Fatti osservati:

- titolo pagina: `ARDESIA · la lavagna del docente`;
- plugin visibili: Pulsante → LED, Conta-tratti, Nota, Simulatore Arduino,
  Grafico funzione, Simulatore avr8js;
- interazione LED: `accensioni: 1`;
- export lezione: file logico `lezione.ardesia.json`, `format=ardesia-lesson`,
  `embeds=1`;
- import: tile `Pulsante → LED` ricompare dopo reload;
- errori console/pageerror: nessuno nel run;
- screenshot locale di verifica: `/tmp/ardesia-lavagna-browser-check/ardesia-lavagna-live-imported.png`.

Limitazione verificata:

- il deploy live NON mostra `Studente` / student-pack export e NON mostra il
  passo-passo presenti nel checkout locale `ardesia-lavagna@87c4678`.
- Build log Vercel del live: 2026-06-28 08:13 UTC, 126 moduli trasformati,
  asset `index-BIjXGhlH.js`. Il checkout locale del 2026-06-30 costruisce 134
  moduli e asset differente. Quindi live e branch locale non sono equivalenti.

## Stato storico dal repo

| Nome storico | Stato storico | Categoria provvisoria | Azione |
|---|---|---|---|
| api-vercel | production Error/404 | broken | Non usare come demo. |
| preview moat | Ready ma gated | gated-preview | Non demo toccabile. |
| ardesia-lavagna | 200 storico | candidate-demo | Verificato live il 2026-07-01: demo parziale toccabile. |
| ardesia-workspace | 200 storico | unknown/stale | Ready da inspect; classificare con browser check dedicato. |
| elab-tutor | prodotto ELAB | separate-product | Non confondere con ARDESIA. |

## Inventario live richiesto

Per ogni progetto Vercel raccogliere:

- team id o slug;
- project id o nome;
- repo collegato;
- branch production;
- ultimo deployment;
- commit servito;
- URL production e preview;
- accesso pubblico, gated, SSO o rotto;
- categoria: canonical-demo, preview, stale, broken, unknown;
- prossima azione.

## Candidato demo primaria

Candidato iniziale: `AndreaMarro/ardesia-lavagna`.

Motivi:

- orientato alla lavagna;
- stack Vite;
- contiene configurazione Vercel;
- descrizione orientata a canvas, ToolHost, plugin e lezioni;
- piu' adatto a demo toccabile rispetto ad API o app ELAB standalone.

Criteri per promuoverlo:

1. build passa;
2. deploy Ready;
3. URL accessibile senza frizione;
4. browser check pulito;
5. interazione minima documentata;
6. README demo dichiara cosa e' reale e cosa manca;
7. commit servito registrato qui.

Stato al 2026-07-01:

- `npm run typecheck` su checkout locale `87c4678`: pass;
- `npm test -- --run`: 20 file, 166 test pass;
- `npm run build`: pass;
- live Vercel Ready e browser check parziale pass;
- gap per DoD completa: live non include student-pack; nessun nuovo preview deploy
  fatto perche' deploy esterno richiede conferma esplicita.

Source correction 2026-07-01:

- `vercel inspect --format=json` did not expose `gitSource/meta`, but
  `vercel api /v6/deployments` did. The production `ardesia-lavagna` deploy is
  now tied to branch `feat/lavagna-p0-20260628` at commit
  `e11e2c8dc8352d94ba7b99375194e7ad59d50855`.
  The local checkout previously tested was later commit `87c4678`, so the
  production deploy is still behind local PR #1.

## Vertical slice richiesta

Minima:

```text
aprire lavagna -> aggiungere tool/plugin -> interagire -> esportare lezione -> importare/riaprire
```

Preferibile:

```text
lavagna -> plugin simulatore -> circuito/blink -> stato salvato -> export/import
```

## Chain of verification

- Verificato nel turno 2026-07-01: connector Vercel MCP restituisce `403 Forbidden`.
- Verificato nel turno 2026-07-01: CLI Vercel autenticata come `andreamarro` elenca progetti.
- Verificato nel turno 2026-07-01 03:55-04:05: account/team, 13 progetti, 1 dominio custom, alias, deployments API e HTTP status principali.
- Verificato live: `ardesia-lavagna` Ready + browser flow lavagna/plugin/export/import.
- Verificato live: `ardesia-canvas`, `ardesia-api-vercel`, `ardesia-workspace` Ready da inspect.
- Verificato: `ardesia-lavagna` production deploy GitHub meta via deployments API (`feat/lavagna-p0-20260628`, `e11e2c8d...`).
- Non verificato: browser flow di `ardesia-canvas`, `ardesia-workspace`.
- Non verificato: commit Git servito da `ardesia-canvas`, `ardesia-api-vercel`, `ardesia-workspace`.
- Non fatto: nessun deploy, nessun dominio, nessuna modifica Vercel.
