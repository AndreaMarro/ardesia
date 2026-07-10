# ARDESIA V1 — claim register

## Current overlay — 2026-07-10 after PR #164 and P33 regate

| ID | Claim | Stato | Evidenza | Confidenza / limite |
|---|---|---|---|---|
| C-043 | `origin/main` corrente e' `177f5c731ffc68fd69a86573ddf08670d3d5226f` | VERIFIED | `git fetch --prune origin`; `git rev-parse origin/main`; log mostra merge PR #164; post-merge `ci` run `29103272760` success | alta; CI-green, non deploy-proof |
| C-044 | PR #150 non e' piu' draft/aperta | VERIFIED | `gh pr view 150`: state `MERGED`, merge commit `4f25f72c1975c5aaf66fc13272583fa28e3b4c70`; post-merge `ci` and readiness success | alta; non prova V1 globale |
| C-045 | PR #163 e' integrata in `main` | VERIFIED | `gh pr view 163`: state `MERGED`, merge commit `9b7342fcbe8363a8033bc17be86766a1a0bdfd7d`; post-merge `ci` run `29101655495` success | alta; docs/prompt/P0 runtime slice only |
| C-046 | Browser-side P0 prompt conflict "non copiare, non citare se non serve" e' stato rimosso | VERIFIED | PR #163 commit `b43d14ed`; changed `plugins/elab-tutor/src/services/api.js`; `tests/unit/api.test.js` 12/12 pass and `unlimCitesBook.test.js` 21/21 pass locally before merge; CI green after merge | non prova edge/backend prompt or full tutor journey |
| C-047 | `ensureBookCitation` now appends Vol./pag. anchors for known-experiment class replies while preserving `[AZIONE:]` payloads | VERIFIED | PR #163; `unlimCitesBook.test.js` 21 tests pass; post-merge CI green | does not prove every provider path calls it |
| C-048 | Current `main@177f5c73` is deployed to production | UNKNOWN | no production deploy/smoke tied to `177f5c731ffc68fd69a86573ddf08670d3d5226f` observed in this turn | do not advertise current deploy proof |
| C-049 | `.claude` regate skill, A1/A7 agents and Claude PreToolUse hook are present in repo | VERIFIED | `find .claude`; `.claude/skills/ardesia-regate/SKILL.md`; `.claude/agents/*.md`; `.claude/settings.json` | file presence only; runtime enforcement in Codex is UNKNOWN |
| C-050 | P33 Integration Spine regate/audit was selected and executed as one slice | VERIFIED | `docs/ops/V1-INTEGRATION-MAP.md` records `HONEST_RED` | superseded by next slice C-054 |
| C-051 | A7 review findings on the loop rewrite were repaired locally | VERIFIED | first read-only A7 review `019f4c92-1c2a-7bf3-bddb-85e9ed3f47fe` reported six findings; follow-up read-only A7 review `019f4c96-98d5-78f2-8b29-aa54647d8a42` returned PASS; local gates `git diff --check`, `test_secret_scan.py`, `secret_scan.py` pass | PR CI still required |
| C-052 | PR #164 is integrated in `main` | VERIFIED | merge commit `177f5c731ffc68fd69a86573ddf08670d3d5226f`; post-merge `ci` run `29103272760` success | docs-only loop rewrite; no deploy proof |
| C-053 | P33 first failing boundary is Simulation Plugin write -> ToolHost | HONEST_RED | `V1-INTEGRATION-MAP.md`; `p30-free-manipulation.spec.ts:110-116,201-205,223-225`; `ToolCanvasEmbeddable.tsx:1287-1354`; `Room.tsx:929-944`; `simulationPluginRegistry.ts:23-36` | static/read-only audit due low disk; no product patch yet |
| C-054 | Next loop slice is one P34 Simulation ToolHost wire remediation | VERIFIED | `docs/ops/V1-NEXT.md` names `P34-SIMULATION-TOOLHOST-WIRE-REMEDIATION-001` | not implemented yet |

Rows below predate this overlay; do not use stale rows without checking whether
C-043 through C-054 supersede them. Historical `RED` rows remain useful as
evidence trail, not as current work selection.

Snapshot: 2026-07-10 · base SHA
`82bf629d0d73e837b4c58bed370b7f1d24509316`; ultimo deploy prodotto verificato
`ce209b310c8c3f7432d2c8878df0d235386ac9f9` (#161 e' docs-only, nessun
redeploy richiesto).

| ID | Claim | Stato | Evidenza | Confidenza / limite |
|---|---|---|---|---|
| C-001 | `AndreaMarro/ardesia` è la struttura canonica candidata | VERIFIED | remote + `docs/CANON-INDEX.md` | alta; behavior repo indicati dal canon possono essere superati |
| C-002 | `origin/main` osservato è `82bf629d0d73e837b4c58bed370b7f1d24509316` | VERIFIED | `git rev-parse HEAD`; branch corrente tracking `origin/main`; `gh run list --commit 82bf629d...` | alta; ultima verifica 2026-07-10 |
| C-003 | P31/P32 anchor esiste a `f6321975` | VERIFIED | ref locale/remoto e log commit | alta; non re-esegue i test storici |
| C-004 | PR #150 ha CI core verde | VERIFIED | GitHub check rollup sullo SHA PR | alta; non prova e2e/V1/deploy |
| C-005 | PR #150 è pronta al merge | RED | draft + titolo `e2e RED_BLOCKER` | alta |
| C-006 | Suite Vitest ≈1597 passa oggi | REPORTED | mandato/P32 | bassa finché non eseguita sullo SHA selezionato |
| C-007 | ToolHost è applicato a tutto il percorso prodotto | RED | audit P33: `ToolCanvasEmbeddable`/`Room` usano callback dirette | nessun claim fino a RPC/capability/audit reale |
| C-008 | Esiste un percorso LessonOS end-to-end | RED | log/graph locale presenti, sync backend e reidratazione reopen assenti | unit/event wiring non prova backend/graph/tutor |
| C-009 | Tinkercad parity | RED | nessuna matrice completa | vietato pubblicizzarlo come claim globale |
| C-010 | Un Certified LED Lesson Scenario esiste | REPORTED | P29/P30 docs e CI | deve passare book, pointer, reopen, tutor, deploy sullo stesso SHA |
| C-011 | Principio Zero autentico è recuperato | VERIFIED | quote Andrea in `plugins/elab-tutor/automa/context/project-history.md:19-23`; operational extension in `plugins/elab-tutor/CLAUDE.md:5-16` | alta; `CLAUDE.md` non e' da solo la fonte completa |
| C-012 | Backend/RLS/deploy sono verificati sullo SHA | RED | nessun event-sync, policy/test RLS o deploy Studio legato a `204ffefc` | HTTP 200 o config non bastano |
| C-013 | Repository/prassi privi di segreti esposti | RED | `V1-SECURITY-MATRIX.md`; scanner S0 pulito sull'HEAD candidato, ma design client-side/history/rotazione restano aperti | non dichiarare repo sicuro finche' provider e browser boundary non sono verificati |
| C-014 | V1 è usabile in lezione | UNKNOWN | nessun test Andrea sul deploy osservato | claim vietato |
| C-015 | Gli `automa/ORDERS` del plugin sono tutti applicabili oggi | RED | ordini 2026-04-07 confliggono su priorità e operazioni Git | richiede riconciliazione umana; prevalgono guardrail correnti |
| C-016 | Il prompt runtime UNLIM rispetta il requisito verbatim/citazioni | RED | `src/services/api.js:126-127` contraddice `CLAUDE.md:11-15` | alta sul conflitto statico; comportamento end-to-end non rieseguito |
| C-017 | Il secret scan CI copre integralmente S-001/S-002 | RED | S0 aggiunge ratchet per Google API key, JWT generici, named hex secret e `CREDS` email/password inline; non risolve il design client-side `VITE_*` | alta; non dichiarare sicurezza pulita |
| C-018 | La chiave privata ToolHost è assente da HEAD | VERIFIED | `f2fb36b2` ancestor; `keys.json` ha solo `pubkey` | alta per HEAD, history/rotazione ancora UNKNOWN |
| C-019 | Steps e mounted sono book-equivalent | RED | `simulationSceneModes.ts:57-83` usa un solo step finale sintetico | test attuale è tautologico, non prova sequenza editoriale |
| C-020 | Il Simulation Plugin attraversa ToolHost reale | RED | `ToolCanvasEmbeddable.tsx:1125-1174`, `Room.tsx:913-927` usano callback dirette | alta, audit statico + test gap |
| C-021 | LessonOS locale sincronizza backend e si reidrata al reopen | RED | API senza event sync; `lessonBundle.ts:47-56,137-192` conserva raw file senza import log | alta sullo SHA 204ffefc |
| C-022 | RLS tenant isolation è provata | UNKNOWN | nessuna migration/policy/test tenant-negative tracked | alta sulla mancanza di prova |
| C-023 | Deploy Studio corrisponde a `204ffefc` | RED | CI ha `no-deploy-check`; Vercel map non lega live allo SHA | alta |
| C-024 | `BookCircuitSpec` è un tipo canonico esistente | RED | nessun simbolo/canon tracciato; modello corrente è `SimulationScene`/`ElabScene` | richiede ADR, non assunzione dal prompt |
| C-025 | S0 blocca nuovi `.env*`, Google API key, JWT generici, named hex secret e `CREDS` inline in CI | VERIFIED | branch `codex/v1-security-s0-20260710`: `git check-ignore -v`, `python3 bin/ci/test_secret_scan.py`, `python3 bin/ci/secret_scan.py`, synthetic repo leak test | slice locale verde; non chiude i segreti client-side `VITE_*`, né history/rotazione |
| C-026 | L'HEAD candidato S0 non richiede piu' allowlist per token-shaped legacy literals | VERIFIED | `bin/ci/secret_scan_allowlist.tsv` rimosso; token-shaped literals redatti o parametrizzati; `python3 bin/ci/secret_scan.py` OK; custom scan count 0 | slice locale verde; non prova revoca provider o assenza in history remota |
| C-027 | Gli script browser legacy Session 18 non contengono piu' credenziali inline nell'HEAD candidato | VERIFIED | i `plugins/elab-tutor/scripts/session18-*.mjs` col pattern `CREDS` inline usano `ELAB_E2E_EMAIL`/`ELAB_E2E_PASSWORD`; scanner ratchet `hardcoded-creds-object`; `python3 bin/ci/secret_scan.py` OK | slice locale verde; non prova che le credenziali storiche fossero invalide; rotazione resta esterna |
| C-028 | Il deploy production `ardesia-lavagna` ora e' collegato a una build Studio monorepo | VERIFIED | PR #155 merged; `main@8b9fbe1d`; `vercel build --prod` OK; deployment `dpl_Dfqd7wa1VisEmZMcdUeZkeSJGX8s` READY; alias `https://ardesia-lavagna.vercel.app` | prova solo deploy spine Studio, non V1 end-to-end |
| C-029 | `main@8b9fbe1d` ha CI post-merge verde | VERIFIED | GitHub Actions: `ci` run `29089070501` success; `studio-preview-readiness` run `29089070505` success | workflow evidence, non prova deploy/browser |
| C-030 | La production alias pubblica carica senza errori browser immediati | VERIFIED | `curl` HTTP 200; Playwright Chromium title `Ardesia · studio`; zero console errors/pageerrors/failed requests/bad same-origin responses | non prova scenario docente completo o persistenza avanzata |
| C-031 | Le dipendenze Studio sono audit-clean sul candidato dependency audit | VERIFIED | branch `codex/v1-studio-dependency-audit-20260710`, commit `742ed1e4278053fa25c297a2fba864284bbe31ad`: baseline `11 vulnerabilities (9 moderate, 2 high)`; dopo override mirati `npm --prefix apps/studio audit --json` riporta `total: 0`; `npm --prefix apps/studio ci --no-fund` audit `0`; `npm --prefix apps/studio ls ...` mostra `undici@7.28.0`, `dompurify@3.4.11`, `lodash-es@4.18.1`, `nanoid@3.3.12/5.0.9`, `@mermaid-js/parser@1.2.0` | non prova future advisory; Excalidraw resta `0.18.1`; lint baseline resta RED separato |
| C-032 | Il production smoke base e' riproducibile da comando root | VERIFIED | PR #157 merged; `main@bf511a44`; `npm run smoke:studio:production` contro `https://ardesia-lavagna.vercel.app` PASS: HTTP 200, title `Ardesia · studio`, zero console/page/request/bad same-origin errors | smoke base, non scenario docente |
| C-033 | Esiste un gate scenario produzione per lavagna -> ELABTutor -> stessa lavagna -> Simulation Plugin | VERIFIED | PR #158 merged; `main@d19faae3`; scenario PASS su head `14f71b48` con 9 checkpoint, room hash preservato, citazione `Vol. 1, p. 29`, `catalogSummary=4/88`, zero console/page/request/bad same-origin errors; post-merge `ci` e readiness green | gate esistente e integrato; non prova persistenza avanzata, backend sync, RLS o Pilot Ready |
| C-034 | `npm --prefix apps/studio run lint` e' verde | RED | branch dependency audit: lint fallisce con 172 errori / 5 warning in file preesistenti non toccati (`Room.tsx`, `ReplayView.tsx`, test, design views, toolhost, ecc.) | non blocca questa remediation se CI non usa lint; richiede slice baseline lint dedicata |
| C-035 | La remediation npm audit Studio e' integrata in `main` con CI verde | VERIFIED | PR #160 merged; merge commit `ce209b310c8c3f7432d2c8878df0d235386ac9f9`; post-merge `ci` run `29095910144` success e `studio-preview-readiness` run `29095910290` success | chiude il rischio audit per lo SHA integrato; non chiude lint baseline o advisory future |
| C-036 | Production `ardesia-lavagna` serve il deploy post dependency audit | VERIFIED | deployment `dpl_3LmGUXKofdHtUW2s8UawXrekEW89` READY, alias `https://ardesia-lavagna.vercel.app`; `curl -L` HTTP 200; `npm run smoke:studio:production` PASS; `npm run smoke:studio:production:scenario` PASS con 9 checkpoint, `catalogSummary=4/88`, citazione `Vol. 1, p. 29`, zero console/page/request/bad same-origin errors | prova deploy e scenario smoke minimo sullo SHA `ce209b31`; non prova backend sync, RLS, ToolHost globale o V1/Pilot Ready |
| C-037 | PR #161 e' integrata in `main` | VERIFIED | `gh pr view 161`: merge commit `82bf629d0d73e837b4c58bed370b7f1d24509316`, mergedAt `2026-07-10T13:41:07Z`; post-merge `ci` run `29096978340` success | docs-only ledger, nessun redeploy prodotto |
| C-038 | Le quattro matrici P0 richieste sono versionate nella branch corrente | VERIFIED | `V1-PRINCIPIO-ZERO-RESEARCH.md`, `V1-PRINCIPIO-ZERO-MATRIX.md`, `V1-BOOK-FIDELITY-ARCHITECTURE.md`, `V1-BOOK-CIRCUIT-CERTIFICATION-MATRIX.md`; local gates: `git diff --check`, secret scans, Studio `npm ci`, targeted 4-file Vitest 36 tests pass | docs-only; non corregge runtime |
| C-039 | Runtime Principle Zero e' conforme | RED | `api.js:126-127,707,825-826,853,915-923`; `bookCitation.js:48-60` | richiede ratifica Andrea e patch prodotto |
| C-040 | `BookCircuitSpec` e' un simbolo runtime esistente | RED | `rg -n 'BookCircuitSpec|BOOK_CIRCUIT_SPEC' apps/studio plugins/elab-tutor` non trova simboli runtime | il concetto resta target architetturale |
| C-041 | Esistono esperimenti reali book-certified | RED | 4/88 mounted candidate, 4 structural-only, 0 `visualMatch: pass`, 0 human review, 0 certified; vedi `V1-BOOK-CIRCUIT-CERTIFICATION-MATRIX.md` | le scene candidate restano ispezionabili ma non certificabili |
| C-042 | La matrice visibile 8/8 puo' essere citata come prova cronologica del 2026-07-10 | RED | `ELAB-VISIBLE-EXPERIMENTS-VISUAL-REFERENCE-MATRIX-2026-07-13.md` e' future-dated rispetto a questa run | usabile solo come tracked repo state, non come data reale |

Regola: aggiornare una riga solo con comando/test/URL e SHA; non cancellare
un RED storico, chiuderlo con nuova evidenza e data.

## Comandi di riproduzione

- C-002: `git rev-parse HEAD` nella lane P0 dopo `git fetch --all --prune`;
  `gh run list --commit 82bf629d0d73e837b4c58bed370b7f1d24509316`.
- C-003/C-004: `git show f6321975`; `gh pr view 150 --json ...`.
- C-017: `python3 bin/ci/secret_scan.py`; `python3 bin/ci/test_secret_scan.py`;
  synthetic temp git repo leak test; `V1-SECURITY-MATRIX.md` S-001/S-002.
- C-018: `git merge-base --is-ancestor f2fb36b2 HEAD`; `jq keys apps/studio/sim/keys.json`.
- C-019–C-024: audit statico sul base SHA `204ffefc`; path/line nelle righe.
- C-025: `git check-ignore -v .env ...`, `python3 bin/ci/test_secret_scan.py`,
  `python3 bin/ci/secret_scan.py`, synthetic temp git repo with one unallowlisted
  Google-key-shaped value returning exit 1.
- C-026: `python3 bin/ci/secret_scan.py`; custom tracked-file scan for
  `google-api-key`, `generic-jwt`, `named-hex-secret` returning count 0.
- C-027: `python3 bin/ci/test_secret_scan.py`; `python3 bin/ci/secret_scan.py`;
  masked inspection of the two Session 18 scripts.
- C-028: `gh pr view 155 --json number,state,mergedAt,mergeCommit`;
  `vercel build --prod --yes --scope team_23uD0RgdInaTaOPEL0EGltup`;
  `vercel deploy --prebuilt --prod --yes --scope team_23uD0RgdInaTaOPEL0EGltup`;
  `vercel inspect ardesia-lavagna-bmxmgxqi2-andreas-projects-6d4e9791.vercel.app --scope team_23uD0RgdInaTaOPEL0EGltup`.
- C-029: `gh run list --commit 8b9fbe1dd1a471029dce18b5a72adc15004e0298 --limit 10 --json ...`.
- C-030: `curl -L https://ardesia-lavagna.vercel.app`; Playwright Chromium
  smoke from `apps/studio/node_modules/playwright`.
- C-031: baseline `npm --prefix apps/studio audit --json` prima della patch;
  dopo commit `742ed1e4`: `npm --prefix apps/studio ci --no-fund`;
  `npm --prefix apps/studio audit --json`; `npm --prefix apps/studio ls ...`;
  `npm --prefix apps/studio run typecheck`; `npm --prefix apps/studio test -- --run`;
  `npm --prefix apps/studio run build`;
  `ARDESIA_STUDIO_SMOKE_URL=http://127.0.0.1:4188 npm run smoke:studio:production:scenario`;
  `python3 bin/ci/test_secret_scan.py`; `python3 bin/ci/secret_scan.py`; `git diff --check`.
- C-032: `npm run smoke:studio:production` on `main@bf511a44`.
- C-033: `gh pr view 158`; `gh run list --commit d19faae3...`;
  `npm run smoke:studio:production:scenario` on PR head `14f71b48`.
- C-034: `npm --prefix apps/studio run lint` on branch
  `codex/v1-studio-dependency-audit-20260710`.
- C-035: `gh pr view 160 --json state,mergedAt,mergeCommit`;
  `gh run list --commit ce209b310c8c3f7432d2c8878df0d235386ac9f9 --json ...`.
- C-036: `vercel inspect ardesia-lavagna-43raj4p0w-andreas-projects-6d4e9791.vercel.app --scope team_23uD0RgdInaTaOPEL0EGltup`;
  `curl -L -s -o /tmp/ardesia-prod-after-dependency.html -w '%{http_code} %{url_effective}\n' https://ardesia-lavagna.vercel.app`;
  `npm run smoke:studio:production`;
  `npm run smoke:studio:production:scenario`.
- C-037: `gh pr view 161 --json state,mergedAt,mergeCommit,statusCheckRollup`;
  `gh run list --commit 82bf629d0d73e837b4c58bed370b7f1d24509316 --limit 10 --json ...`.
- C-038-C-042: static inspection of the named docs and paths on
  `82bf629d0d73e837b4c58bed370b7f1d24509316`.

Ultima verifica di tutti i comandi sopra: 2026-07-10 Europe/Rome.
