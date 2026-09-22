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
| B | `README.md`, `codex-handoff.md` | USER_ACTION globale PASS → PARTIAL (ElabLab mark PASS) | `post-adversarial-repair.md:87-88`; ledger GIÀ PARTIAL, conservato |
| C | `README.md`, `codex-handoff.md`, `integration-ledger.json` | IDENTICAL generale → equivalenza per campi + F-03 attesa | `post-adversarial-repair.md:89-90`; `semantic-diff.json` storico pre-repair `SOURCE_HEAD(7af8f51c)` NON riscritto |
| D | `exclusions.md` riga ack | EXCLUDED piatto → EXCLUDED AS CODE (baggage), proprietà PORTED | Ledger `producerPrerequisites`; donor `3ee18131…` resto escluso |

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
| `doc_claims_gate.py` default (CI) | exit 0, 1 documento, 4 controlli |
| `doc_claims_gate.py` sui 4 md modificati | exit 1, 26 flag [paths] TUTTI stessa classe: nomi nudi intra-pack; baseline HEAD già exit 1 con 16 — nessuna ridefinizione, gate/allowlist intoccati |
| `workflow_trigger_gate.py` | exit 0 |
| `elab_boundary_gate.py` | exit 0 (12 offender storici, zero aggiunti) |
| `nul_scan.py`, `secret_scan.py` | exit 0 |
| `git diff --check` | exit 0 |
| `project_state.py --verify` (repo reale) | exit 0, head `af46e658` letto |

## Non eseguiti e motivo

Suite Studio/Engine complete, typecheck/build, browser, PDF: non giustificati
per soli Markdown/JSON/commenti YAML (mandato §5.5). Nessun test nuovo che
rispecchi testo. Branch protection NON modificata; API regole accessibile,
quindi nessuna dichiarazione UNAVAILABLE.

## Limiti residui e prossima azione

`R04_INDEPENDENT_REVIEW=PENDING`: la self-review non è indipendente.
Receipt R-01/R-02/R-03/R-03b preservati; approvazioni circoscritte invariate.

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
