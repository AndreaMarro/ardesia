# ARDESIA V1 — claim register

Snapshot: 2026-07-10 · base SHA `204ffefc`; ultimo deploy verificato
`ce209b310c8c3f7432d2c8878df0d235386ac9f9`.

| ID | Claim | Stato | Evidenza | Confidenza / limite |
|---|---|---|---|---|
| C-001 | `AndreaMarro/ardesia` è la struttura canonica candidata | VERIFIED | remote + `docs/CANON-INDEX.md` | alta; behavior repo indicati dal canon possono essere superati |
| C-002 | `origin/main` osservato è `204ffefc` | VERIFIED | `git rev-parse origin/main` dopo fetch | alta; ultima verifica 2026-07-10 |
| C-003 | P31/P32 anchor esiste a `f6321975` | VERIFIED | ref locale/remoto e log commit | alta; non re-esegue i test storici |
| C-004 | PR #150 ha CI core verde | VERIFIED | GitHub check rollup sullo SHA PR | alta; non prova e2e/V1/deploy |
| C-005 | PR #150 è pronta al merge | RED | draft + titolo `e2e RED_BLOCKER` | alta |
| C-006 | Suite Vitest ≈1597 passa oggi | REPORTED | mandato/P32 | bassa finché non eseguita sullo SHA selezionato |
| C-007 | ToolHost è applicato a tutto il percorso prodotto | RED | audit P33: `ToolCanvasEmbeddable`/`Room` usano callback dirette | nessun claim fino a RPC/capability/audit reale |
| C-008 | Esiste un percorso LessonOS end-to-end | RED | log/graph locale presenti, sync backend e reidratazione reopen assenti | unit/event wiring non prova backend/graph/tutor |
| C-009 | Tinkercad parity | RED come claim globale | nessuna matrice completa | vietato pubblicizzarlo |
| C-010 | Un Certified LED Lesson Scenario esiste | REPORTED | P29/P30 docs e CI | deve passare book, pointer, reopen, tutor, deploy sullo stesso SHA |
| C-011 | Principio Zero autentico è recuperato | VERIFIED | `plugins/elab-tutor/CLAUDE.md:5-16` | alta; fonte canonica di progetto |
| C-012 | Backend/RLS/deploy sono verificati sullo SHA | RED come claim | nessun event-sync, policy/test RLS o deploy Studio legato a `204ffefc` | HTTP 200 o config non bastano |
| C-013 | Repository/prassi privi di segreti esposti | SECURITY_RED come claim globale | `V1-SECURITY-MATRIX.md`; scanner S0 pulito sull'HEAD candidato, ma design client-side/history/rotazione restano aperti | non dichiarare repo sicuro finche' provider e browser boundary non sono verificati |
| C-014 | V1 è usabile in lezione | UNKNOWN | nessun test Andrea sul deploy osservato | claim vietato |
| C-015 | Gli `automa/ORDERS` del plugin sono tutti applicabili oggi | RED | ordini 2026-04-07 confliggono su priorità e operazioni Git | richiede riconciliazione umana; prevalgono guardrail correnti |
| C-016 | Il prompt runtime UNLIM rispetta il requisito verbatim/citazioni | RED | `src/services/api.js:126-127` contraddice `CLAUDE.md:11-15` | alta sul conflitto statico; comportamento end-to-end non rieseguito |
| C-017 | Il secret scan CI copre integralmente S-001/S-002 | RED / PARTIAL | S0 aggiunge ratchet per Google API key, JWT generici, named hex secret e `CREDS` email/password inline; non risolve il design client-side `VITE_*` | alta; non dichiarare sicurezza pulita |
| C-018 | La chiave privata ToolHost è assente da HEAD | VERIFIED | `f2fb36b2` ancestor; `keys.json` ha solo `pubkey` | alta per HEAD, history/rotazione ancora UNKNOWN |
| C-019 | Steps e mounted sono book-equivalent | RED come prova corrente | `simulationSceneModes.ts:57-83` usa un solo step finale sintetico | test attuale è tautologico, non prova sequenza editoriale |
| C-020 | Il Simulation Plugin attraversa ToolHost reale | RED | `ToolCanvasEmbeddable.tsx:1125-1174`, `Room.tsx:913-927` usano callback dirette | alta, audit statico + test gap |
| C-021 | LessonOS locale sincronizza backend e si reidrata al reopen | RED | API senza event sync; `lessonBundle.ts:47-56,137-192` conserva raw file senza import log | alta sullo SHA 204ffefc |
| C-022 | RLS tenant isolation è provata | UNKNOWN | nessuna migration/policy/test tenant-negative tracked | alta sulla mancanza di prova |
| C-023 | Deploy Studio corrisponde a `204ffefc` | RED come claim | CI ha `no-deploy-check`; Vercel map non lega live allo SHA | alta |
| C-024 | `BookCircuitSpec` è un tipo canonico esistente | RED | nessun simbolo/canon tracciato; modello corrente è `SimulationScene`/`ElabScene` | richiede ADR, non assunzione dal prompt |
| C-025 | S0 blocca nuovi `.env*`, Google API key, JWT generici, named hex secret e `CREDS` inline in CI | GREEN_SLICE locale | branch `codex/v1-security-s0-20260710`: `git check-ignore -v`, `python3 bin/ci/test_secret_scan.py`, `python3 bin/ci/secret_scan.py`, synthetic repo leak test | non chiude i segreti client-side `VITE_*`, né history/rotazione |
| C-026 | L'HEAD candidato S0 non richiede piu' allowlist per token-shaped legacy literals | GREEN_SLICE locale | `bin/ci/secret_scan_allowlist.tsv` rimosso; token-shaped literals redatti o parametrizzati; `python3 bin/ci/secret_scan.py` OK; custom scan count 0 | non prova revoca provider o assenza in history remota |
| C-027 | Gli script browser legacy Session 18 non contengono piu' credenziali inline nell'HEAD candidato | GREEN_SLICE locale | i `plugins/elab-tutor/scripts/session18-*.mjs` col pattern `CREDS` inline usano `ELAB_E2E_EMAIL`/`ELAB_E2E_PASSWORD`; scanner ratchet `hardcoded-creds-object`; `python3 bin/ci/secret_scan.py` OK | non prova che le credenziali storiche fossero invalide; rotazione resta esterna |
| C-028 | Il deploy production `ardesia-lavagna` ora e' collegato a una build Studio monorepo | VERIFIED | PR #155 merged; `main@8b9fbe1d`; `vercel build --prod` OK; deployment `dpl_Dfqd7wa1VisEmZMcdUeZkeSJGX8s` READY; alias `https://ardesia-lavagna.vercel.app` | prova solo deploy spine Studio, non V1 end-to-end |
| C-029 | `main@8b9fbe1d` ha CI post-merge verde | VERIFIED | GitHub Actions: `ci` run `29089070501` success; `studio-preview-readiness` run `29089070505` success | workflow evidence, non prova deploy/browser |
| C-030 | La production alias pubblica carica senza errori browser immediati | VERIFIED | `curl` HTTP 200; Playwright Chromium title `Ardesia · studio`; zero console errors/pageerrors/failed requests/bad same-origin responses | non prova scenario docente completo o persistenza avanzata |
| C-031 | Le dipendenze Studio sono audit-clean sul candidato dependency audit | VERIFIED / GREEN_SLICE locale | branch `codex/v1-studio-dependency-audit-20260710`, commit `742ed1e4278053fa25c297a2fba864284bbe31ad`: baseline `11 vulnerabilities (9 moderate, 2 high)`; dopo override mirati `npm --prefix apps/studio audit --json` riporta `total: 0`; `npm --prefix apps/studio ci --no-fund` audit `0`; `npm --prefix apps/studio ls ...` mostra `undici@7.28.0`, `dompurify@3.4.11`, `lodash-es@4.18.1`, `nanoid@3.3.12/5.0.9`, `@mermaid-js/parser@1.2.0` | non prova future advisory; Excalidraw resta `0.18.1`; lint baseline resta RED separato |
| C-032 | Il production smoke base e' riproducibile da comando root | VERIFIED | PR #157 merged; `main@bf511a44`; `npm run smoke:studio:production` contro `https://ardesia-lavagna.vercel.app` PASS: HTTP 200, title `Ardesia · studio`, zero console/page/request/bad same-origin errors | smoke base, non scenario docente |
| C-033 | Esiste un gate scenario produzione per lavagna -> ELABTutor -> stessa lavagna -> Simulation Plugin | VERIFIED / GREEN_SLICE | PR #158 merged; `main@d19faae3`; scenario PASS su head `14f71b48` con 9 checkpoint, room hash preservato, citazione `Vol. 1, p. 29`, `catalogSummary=4/88`, zero console/page/request/bad same-origin errors; post-merge `ci` e readiness green | gate esistente e integrato; non prova persistenza avanzata, backend sync, RLS o Pilot Ready |
| C-034 | `npm --prefix apps/studio run lint` e' verde | RED | branch dependency audit: lint fallisce con 172 errori / 5 warning in file preesistenti non toccati (`Room.tsx`, `ReplayView.tsx`, test, design views, toolhost, ecc.) | non blocca questa remediation se CI non usa lint; richiede slice baseline lint dedicata |
| C-035 | La remediation npm audit Studio e' integrata in `main` con CI verde | VERIFIED | PR #160 merged; merge commit `ce209b310c8c3f7432d2c8878df0d235386ac9f9`; post-merge `ci` run `29095910144` success e `studio-preview-readiness` run `29095910290` success | chiude il rischio audit per lo SHA integrato; non chiude lint baseline o advisory future |
| C-036 | Production `ardesia-lavagna` serve il deploy post dependency audit | VERIFIED / GREEN_SLICE | deployment `dpl_3LmGUXKofdHtUW2s8UawXrekEW89` READY, alias `https://ardesia-lavagna.vercel.app`; `curl -L` HTTP 200; `npm run smoke:studio:production` PASS; `npm run smoke:studio:production:scenario` PASS con 9 checkpoint, `catalogSummary=4/88`, citazione `Vol. 1, p. 29`, zero console/page/request/bad same-origin errors | prova deploy e scenario smoke minimo sullo SHA `ce209b31`; non prova backend sync, RLS, ToolHost globale o V1/Pilot Ready |

Regola: aggiornare una riga solo con comando/test/URL e SHA; non cancellare
un RED storico, chiuderlo con nuova evidenza e data.

## Comandi di riproduzione

- C-002: `git rev-parse origin/main` dopo `git fetch --all --prune`.
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

Ultima verifica di tutti i comandi sopra: 2026-07-10 Europe/Rome.
