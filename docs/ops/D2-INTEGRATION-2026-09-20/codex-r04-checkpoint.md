# R-04 — checkpoint locale, 22 settembre 2026

Quattro claim D2 ora descrivono esattamente ciò che codice, prove e CI
dimostrano. Nessun cambio di prodotto, workflow eseguibile, protection,
SHA D2 o file congelati: solo commenti YAML, Markdown e ledger.

## Identità e perimetro

- Workspace: `/Users/andreamarro/VOLUME 3/ardesia-codex-restart-20260921`;
  branch `codex/restart-review-postlesson-20260921`, remote
  `https://github.com/AndreaMarro/ardesia.git` (branch solo locale, pulito).
- Base: `af46e658e94bc32eaf80295984dc4938ea76972c`.
  Commit patch: `b2eddaf3f02c3e20c45c74507b99a18de40f16a0` (6 file).
- GitHub riletto in sola lettura il 2026-09-22: PR #256 OPEN/DRAFT, head
  `705284acc4322db4d241032de071437ab0473cc1`, base/main remoto
  `b124eee04acc8062c27284f23c5d9108e3767c27`, zero review sottomesse,
  `reviewDecision=REVIEW_REQUIRED`, merge `BLOCKED`. Check storici run
  `35549971310` tutti pass ma sul merge sintetico `29c3067e…`, non head.
- Modello/effort `inherited/unknown`; unico writer, nessun agente o loop.

## Matrice delle quattro correzioni

| # | File | Prima → dopo | Fonte/SHA |
|---|---|---|---|
| A | `.github/workflows/ci.yml` (solo commenti) | «Lane required» → lane NON richiesta dalla protection | Protection API main 2026-09-22: required = studio, engine, hygiene |
| B | `docs/ops/D2-INTEGRATION-2026-09-20/README.md`, `docs/ops/D2-INTEGRATION-2026-09-20/codex-handoff.md` | USER_ACTION globale PASS → PARTIAL (ElabLab mark PASS) | `post-adversarial-repair.md:87-88`; ledger GIÀ PARTIAL, conservato |
| C | `docs/ops/D2-INTEGRATION-2026-09-20/README.md`, `docs/ops/D2-INTEGRATION-2026-09-20/codex-handoff.md`, `docs/ops/D2-INTEGRATION-2026-09-20/integration-ledger.json` | IDENTICAL generale → equivalenza per campi + F-03 attesa | `post-adversarial-repair.md:89-90`; `docs/ops/D2-INTEGRATION-2026-09-20/semantic-diff.json` storico pre-repair `SOURCE_HEAD(7af8f51c)` NON riscritto |
| D | `docs/ops/D2-INTEGRATION-2026-09-20/exclusions.md` riga ack | EXCLUDED piatto → EXCLUDED AS CODE (baggage), proprietà PORTED | Ledger `producerPrerequisites`; donor `3ee18131…` resto escluso |

F-03 citata al punto reale: `packages/engine/lessonos/summarizer.py:635-641`
(riga vuota prima dell'appendice non vuota). Numeri storici D2/R-03b
preservati come osservazioni, non rieseguiti.

## Comandi ed exit reali

Log diretti e record in `artifacts/restart/commands.jsonl`, prefisso
`r04-muse-`. Venv esistente `packages/engine/.venv`, nessuna dipendenza.

| Controllo | Risultato |
|---|---|
| ledger JSON parse + verdicti | exit 0 |
| albero YAML ci.yml HEAD vs patch | exit 0, identico (solo commenti) |
| `bin/ci/doc_claims_gate.py` default (CI) | exit 0, 1 documento, 4 controlli |
| `bin/ci/doc_claims_gate.py` sui 4 md modificati | exit 1, 26 flag [paths] TUTTI stessa classe: nomi nudi intra-pack; baseline HEAD già exit 1 con 16 — nessuna ridefinizione, gate/allowlist intoccati |
| `bin/ci/workflow_trigger_gate.py` | exit 0 |
| `bin/ci/elab_boundary_gate.py` | exit 0 (12 offender storici, zero aggiunti) |
| `bin/ci/nul_scan.py`, `bin/ci/secret_scan.py` | exit 0 |
| `git diff --check` | exit 0 |
| `project_state.py --verify` (repo reale) | exit 0, head `af46e658` letto |

## Non eseguiti e motivo

Suite Studio/Engine complete, typecheck/build, browser, PDF: non giustificati
per soli Markdown/JSON/commenti YAML (mandato §5.5). Nessun test nuovo che
rispecchi testo. Branch protection NON modificata; API regole accessibile,
quindi nessuna dichiarazione UNAVAILABLE.

## Limiti residui e prossima azione

## Addendum 2026-09-22 — correzione F-R04-01 (review indipendente)

Review indipendente Codex sul patch SHA `b2eddaf3` (receipt in
`docs/ops/D2-INTEGRATION-2026-09-20/codex-r04-review-20260922/review.md`):
verdetto REQUEST_CHANGES, un finding P2 documentale F-R04-01. Le quattro
correzioni di contenuto restano supportate; la patch aveva aggiunto nuovi
flag [paths] del gate documentale con riferimenti abbreviati intra-pack.
La riga storica exit 1 della tabella sopra è preservata e NON riscritta.

Correzione (solo riferimenti, nessun contenuto): ogni percorso citato nei
cinque Markdown usa ora il percorso completo dalla root, verificabile dal
gate — `docs/ops/D2-INTEGRATION-2026-09-20/<file>` per il pacchetto,
`.github/workflows/ci.yml`, `bin/ci/<gate>.py`,
`apps/studio/src/store/lessonBundle.ts`,
`apps/studio/src/store/recapHtml.ts`, `apps/studio/src/RecapView.tsx`,
`apps/studio/src/lessonos/continuitySurface.ts`. Caso speciale: il modulo
lessonOutcome esisteva a source head `7af8f51c` (verificato via
`git ls-tree` su `apps/studio/src/store/`) ma è assente da questo HEAD;
è nominato in prosa con SHA e non come percorso verificabile, e
l'assenza di edge è ri-verificata con rg sull'albero corrente (zero
riferimenti dal bundle path a recapHtml/lessonOutcome; solo
`apps/studio/src/RecapView.tsx` li nomina). Gate, allowlist e criteri
intoccati.

Nuovo esito mirato (record `r04b-muse-doc-claims` in
`artifacts/restart/commands.jsonl`):

```sh
packages/engine/.venv/bin/python bin/ci/doc_claims_gate.py \
  docs/ops/D2-INTEGRATION-2026-09-20/README.md \
  docs/ops/D2-INTEGRATION-2026-09-20/codex-handoff.md \
  docs/ops/D2-INTEGRATION-2026-09-20/exclusions.md \
  docs/ops/D2-INTEGRATION-2026-09-20/codex-r04-unit.md \
  docs/ops/D2-INTEGRATION-2026-09-20/codex-r04-checkpoint.md
```

exit 0 — `doc claims gate ok: 5 documento/i, 4 controlli`. Workflow,
boundary (12 offender storici), NUL, secrets, `git diff --check` e
`project_state.py --verify` (head `de4524cd` letto): tutti exit 0
(record `r04b-muse-*`).

`R04_INDEPENDENT_REVIEW=REQUEST_CHANGES` (finding del reviewer, non
self-review). Prossima azione: nuova review Codex circoscritta del commit
correttivo.

**Unica prossima azione:** review Codex circoscritta del nuovo SHA di patch
e dei quattro claim, non un altro audit generale. R-04 non autorizza rilascio
o pilot.

MERGE=NOT_PERFORMED; PUSH=NOT_PERFORMED; DEPLOY=NOT_PERFORMED;
REAL_PILOT=NOT_RUN; PAID_LLM_CALLS=0; STUDENT_UPLOADS=0.

## Receipt capability append-only

Unità `r04-documental-reconciliation-20260922`, modello `inherited/unknown`.
Oracolo nella [scheda pre-patch](codex-r04-unit.md). Nessuna promozione,
quota, riscrittura di gate o dipendenza. Receipt aggiunto localmente senza
riscrivere i precedenti. `INDEX_SYNC_DEFERRED`; nessun vault/memoria esterna.
