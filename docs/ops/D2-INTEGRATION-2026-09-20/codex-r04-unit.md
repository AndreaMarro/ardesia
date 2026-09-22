# R-04 — riconciliazione documentale, 2026-09-22

Scheda precedente alla patch. Unità sola: allineare quattro claim D2 a ciò
che codice, prove e CI dimostrano. Base pulita
`af46e658e94bc32eaf80295984dc4938ea76972c`, branch
`codex/restart-review-postlesson-20260921`; modello/effort `inherited/unknown`.

Preflight 2026-09-22: remote `https://github.com/AndreaMarro/ardesia.git`,
working tree pulito, nessun upstream remoto per questo branch (solo locale).
PR #256 riletta in sola lettura: OPEN/DRAFT, head
`705284acc4322db4d241032de071437ab0473cc1`, base/main remoto
`b124eee04acc8062c27284f23c5d9108e3767c27`, zero review sottomesse,
`reviewDecision=REVIEW_REQUIRED`, merge `BLOCKED`. Check storici run
`35549971310` tutti pass (eseguivano il merge sintetico `29c3067e…`, non
l'head esatto). Branch protection di main riletta via API il 2026-09-22:
required = `studio (typecheck + test + build)`, `engine (pytest)`,
`hygiene (NUL + secrets + boundary + whitespace)`; `d2-integration-evidence`
e `e2e golden path` NON richiesti.

## Matrice claim → evidenza → formulazione corretta

| # | Claim attuale | Evidenza | Correzione prevista |
|---|---|---|---|
| A | `.github/workflows/ci.yml:106` «Lane required» sopra `d2-integration-evidence` | Protection API 2026-09-22: solo studio/engine/hygiene required; review congelata §R-04 concorda | Commento: lane NON richiesta dalla protection (eseguita/informativa). Solo commenti, YAML invariato |
| B | `README.md:51` e `codex-handoff.md:27` «USER_ACTION_TO_MATERIAL PASS» globale | `post-adversarial-repair.md:87-88`: `GLOBAL_USER_ACTION_TO_MATERIAL=PARTIAL` (ElabLab mark PASS; finestra append Simulation pendente). Ledger ha GIÀ `USER_ACTION_TO_MATERIAL=PARTIAL` | README/handoff: PASS solo per mark ElabLab; globale PARTIAL con rimando. Nessun flush globale, nessun claim Recap |
| C | `README.md:34,53-54`, `codex-handoff.md:29`, `integration-ledger.json:80-83` «IDENTICAL» incluso SummaryPack markdown | `post-adversarial-repair.md:89-90`: una diff ATTESA F-03 (riga vuota; titoli appendice strutturali); capsule/digest/manifest/segments identici. `docs/ops/D2-INTEGRATION-2026-09-20/semantic-diff.json` è confronto storico pre-repair `SOURCE_HEAD(7af8f51c)` vs candidate-B | Equivalenza per campi + diff markdown attesa + datazione storica; NON riscrivere `docs/ops/D2-INTEGRATION-2026-09-20/semantic-diff.json` né log congelati |
| D | `exclusions.md:19` «PERSISTENCE_ACK (3ee18131): EXCLUDED» senza qualifica, contro riga 9 «PORTED AS PROPERTY» | Ledger `producerPrerequisites`: proprietà minima portata (ack dopo append, UI non su emit); resto del commit donor (workflow/spec/e2e) escluso | Riga: EXCLUDED come codice/baggage non-proprietà; proprietà ack portata con rimando alla sezione Ported. Nessun cherry-pick integrale |

## Non-goal

Modifiche a workflow eseguibile/job/trigger/continue-on-error/protection,
a SHA prodotto D2, a `docs/ops/D2-INTEGRATION-2026-09-20/semantic-diff.json` o log congelati, a codice
Studio/Engine/gate/snapshot/test, a dipendenze, a Kirchhoff; flush globale;
riesecuzione di suite complete/browser/PDF/build per soli Markdown/JSON;
push/merge/deploy/review GitHub; vault, memorie esterne, provider a pagamento.

## Oracolo e chiusura

Oracolo: ogni documento modificato afferma solo ciò che la fonte citata
(SHA, data, perimetro) dimostra; le protezioni/API non sono inferite da
403/404 (lettura riuscita, sopra). Chiusura: patch coerente solo dove la
contraddizione è presente; `docs/ops/D2-INTEGRATION-2026-09-20/integration-ledger.json` valido; albero YAML di
`.github/workflows/ci.yml` identico prima/dopo; gate doc/workflow/boundary/NUL/secrets exit 0;
`git diff --check` pulito; commit locale `docs(ops): …` senza push;
checkpoint `docs/ops/D2-INTEGRATION-2026-09-20/codex-r04-checkpoint.md` con `R04_INDEPENDENT_REVIEW=PENDING`.

Skill: nessuna esterna; capability registrata localmente append-only,
`INDEX_SYNC_DEFERRED`; AgentMemory `RETIRED_NO_READ_NO_WRITE`.
