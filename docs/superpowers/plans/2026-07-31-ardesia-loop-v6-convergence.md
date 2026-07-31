---
title: ARDESIA Loop v6 — implementation plan
status: READY_FOR_EXECUTION
design: ../specs/2026-07-31-ardesia-loop-v6-convergence-design.md
product_base_sha: 4218bc2e98774cbc7efa100223c913e7444e715b
---

# ARDESIA Loop v6 — implementation plan

> Eseguire per PR piccole e seriali. Ogni PR modifica al massimo cinque file.
> Nessuna nuova dipendenza. Nessun push, merge o deploy senza approvazione.

**Goal:** sostituire la logica implicita del prompt `/loop` con un controller
Python standard-library, fail-closed, che congela le fonti, assegna una sola
lease di scrittura e produce un handoff `READY_FOR_HUMAN`.

**Architecture:** `bin/loop_v6.py` è la macchina a stati. I file JSON sotto
`ops/loop-v6/` sono policy e stato append-only. `.claude/commands/loop.md` è un
adapter sottile. Il controller legge ARDESIA e `ardesia-knowledge` tramite path
espliciti, non interroga AgentMemory e tratta WikiLLM come proiezione read-only.

**Stack:** Python 3 standard library, Git CLI, GitHub CLI opzionale e
fail-closed, test `unittest`, script di gate già presenti.

## PR 0 — design e provenance

File:

- creare
  `docs/superpowers/specs/2026-07-31-ardesia-loop-v6-convergence-design.md`;
- creare
  `docs/superpowers/plans/2026-07-31-ardesia-loop-v6-convergence.md`;
- aggiornare
  `docs/ops/ARDESIA-LOOP-TWO-HINGE-2026-07-30.md`.

Verifica:

```bash
python3 bin/state/project_state.py
python3 bin/ci/doc_claims_gate.py
git diff --check
```

Commit suggerito:

```bash
git add docs/superpowers/specs/2026-07-31-ardesia-loop-v6-convergence-design.md
git add docs/superpowers/plans/2026-07-31-ardesia-loop-v6-convergence.md
git add docs/ops/ARDESIA-LOOP-TWO-HINGE-2026-07-30.md
git commit -m "docs(loop): design convergence-first v6"
```

## PR 1 — manifest e freshness gate in shadow mode

File, massimo quattro:

- creare `ops/loop-v6/policy.json`;
- creare `bin/loop_v6.py`;
- creare `bin/state/test_loop_v6.py`;
- aggiornare `bin/ci/local_checks.sh`.

### Task 1.1 — scrivere i test rossi del manifest

In `bin/state/test_loop_v6.py`, aggiungere fixture temporanee che provano:

- rifiuto se product HEAD e base attesa divergono;
- rifiuto se il vault è dirty senza allowlist;
- rifiuto se il remote age supera la soglia;
- `UNAVAILABLE` distinto da `MEASURED`;
- output deterministico a input identico;
- nessuna scrittura fuori dalla directory run.

Eseguire:

```bash
python3 -m unittest bin.state.test_loop_v6 -v
```

Atteso: rosso perché `bin/loop_v6.py` non esiste.

### Task 1.2 — implementare `snapshot`

In `bin/loop_v6.py`:

- usare `subprocess.run` con argv, mai shell;
- raccogliere HEAD, branch, porcelain `-uall`, remote timestamp e tool version;
- leggere il vault da `ARDESIA_KNOWLEDGE_REPO`;
- emettere JSON canonico con `sort_keys=True`;
- calcolare `manifest_sha256`;
- fallire se un campo richiesto non è misurabile.

Eseguire:

```bash
python3 -m unittest bin.state.test_loop_v6 -v
python3 bin/loop_v6.py snapshot --product . --knowledge "$ARDESIA_KNOWLEDGE_REPO"
```

### Task 1.3 — aggiungere shadow mode ai local checks

In `bin/ci/local_checks.sh`, chiamare soltanto i test del controller. Non
rendere ancora il freshness gate required per le normali PR.

Control run:

```bash
python3 -m unittest bin.state.test_loop_v6 -v
git diff --check
```

Commit suggerito:

```bash
git commit -m "feat(loop): add v6 freshness manifest"
```

## PR 2 — unit contract frozen e writer lease

File, massimo cinque:

- aggiornare `ops/loop-v6/policy.json`;
- aggiornare `bin/loop_v6.py`;
- aggiornare `bin/state/test_loop_v6.py`;
- creare `ops/loop-v6/README.md`;
- creare `ops/loop-v6/example-unit.json`.

### Task 2.1 — testare la selezione

Scrivere test rossi per:

- una sola unità open e non bloccata;
- ricalcolo dei `blocked_by` già terminali;
- ordine stabile `priority, created_at, id`;
- archivio delle unità terminali senza cancellazione;
- rifiuto di acceptance vuota o falsificatore vuoto.

### Task 2.2 — testare la lease

Scrivere test rossi per:

- una sola lease `ACTIVE`;
- owner, base SHA, allowlist e TTL obbligatori;
- rifiuto path traversal e symlink escape;
- scadenza che porta a `BLOCKED`, non a riassegnazione silenziosa;
- compare-and-swap sul digest del registro.

### Task 2.3 — implementare contract e lease

Implementare sottocomandi:

```text
select
freeze-contract
lease-acquire
lease-check
lease-release
```

Il contract congelato include goal, acceptance, falsificatore, allowed paths,
forbidden actions e budget. Ogni modifica successiva cambia hash e invalida il
run.

Verifica:

```bash
python3 -m unittest bin.state.test_loop_v6 -v
python3 bin/loop_v6.py --help
bash bin/ci/local_checks.sh
git diff --check
```

Commit suggerito:

```bash
git commit -m "feat(loop): freeze unit contract and writer lease"
```

## PR 3 — evidence packet e refuter adapters

File, massimo cinque:

- aggiornare `bin/loop_v6.py`;
- aggiornare `bin/state/test_loop_v6.py`;
- creare `ops/loop-v6/evidence-packet.schema.json`;
- creare `bin/loop_v6_hermes.sh`;
- creare `bin/loop_v6_codex.sh`.

### Task 3.1 — schema e test

Lo schema richiede:

- `agent_role`;
- `model_requested`;
- `model_observed` oppure `inherited/unknown`;
- product SHA, knowledge SHA e contract hash;
- claim classificati `MEASURED|INFERRED|PROPOSED|UNAVAILABLE`;
- provenance per ogni claim;
- `not_checked` non vuoto;
- token, wall time ed exit code quando disponibili.

Testare packet stale, contract mismatch, path senza hash e claim senza classe.

### Task 3.2 — adapter Hermes

`bin/loop_v6_hermes.sh`:

- riceve solo path di manifest, contract e diff;
- invoca `ardesia-review` sul Mini;
- verifica JSON ed exit code;
- registra modello richiesto separato da modello osservato;
- non monta directory write;
- timeout dal policy file.

Non introdurre ancora computer-use.

### Task 3.3 — adapter Codex read-only

`bin/loop_v6_codex.sh`:

- usa sandbox read-only;
- riceve lo stesso contract hash;
- scrive solo l'evidence packet nella run directory;
- non legge il prompt narrativo del writer;
- non tenta push, PR o modifica file.

Verifica:

```bash
python3 -m unittest bin.state.test_loop_v6 -v
shellcheck bin/loop_v6_hermes.sh bin/loop_v6_codex.sh
git diff --check
```

Se `shellcheck` non è installato, registrare `UNAVAILABLE`; non dichiararlo
verde.

Commit suggerito:

```bash
git commit -m "feat(loop): validate independent evidence packets"
```

## PR 4 — local gates, stagnation e riconciliazione

File, massimo tre:

- aggiornare `bin/loop_v6.py`;
- aggiornare `bin/state/test_loop_v6.py`;
- aggiornare `ops/loop-v6/policy.json`.

### Task 4.1 — testare exit code separati

Creare fixture in cui:

- test passa e typecheck fallisce;
- focused passa e adjacent fallisce;
- comando è assente;
- candidate SHA cambia durante il gate;
- stesso tripletto
  `diff_sha256 + failing_gate + evidence_digest` ricorre due volte.

Il controller deve fermarsi in tutti i casi salvo il primo tentativo causale
entro budget.

### Task 4.2 — implementare `gate`, `adjudicate`, `reconcile`

- conservare stdout/stderr e exit code per comando;
- vietare `&&` come rappresentazione di più oracle;
- richiedere outcome per ogni finding;
- CAS sul digest del registro;
- creare receipt append-only;
- stato terminale solo `READY_FOR_HUMAN`, `BLOCKED` o `STOP_EMPTY`.

Control run: sostituire temporaneamente nelle fixture il candidate con il parent
e pretendere il rosso; ripristinare e pretendere il verde.

Verifica:

```bash
python3 -m unittest bin.state.test_loop_v6 -v
bash bin/ci/local_checks.sh
git diff --check
```

Commit suggerito:

```bash
git commit -m "feat(loop): stop on stagnation and reconcile atomically"
```

## PR 5 — adapter `/loop`

File, massimo tre:

- creare `.claude/commands/loop.md`;
- aggiornare `.claude/settings.json`;
- aggiornare `ops/loop-v6/README.md`.

### Task 5.1 — comando sottile

Il comando deve:

- richiedere `--controller v6`;
- invocare preflight prima di caricare contesto;
- stampare unità, SHA, allowlist e budget;
- avviare al massimo una unità per default;
- non contenere logica di merge/deploy;
- restituire stato e receipt.

### Task 5.2 — hook di sicurezza

Estendere il guard esistente per rifiutare:

- mutazioni fuori allowlist durante lease;
- `git push`, `gh pr merge`, `vercel deploy` e comandi equivalenti dal run;
- modifica di policy/contract da parte del writer.

Testare il hook con comandi innocui su fixture; non usare un remoto reale.

Verifica:

```bash
python3 -m unittest bin.state.test_loop_v6 -v
bash bin/ci/local_checks.sh
python3 bin/ci/doc_claims_gate.py
git diff --check
```

Commit suggerito:

```bash
git commit -m "feat(loop): route slash loop through v6 controller"
```

## PR 6 — UI/UX lane

File, massimo cinque:

- creare `ops/loop-v6/ui-journey.json`;
- aggiornare `ops/loop-v6/policy.json`;
- aggiornare `bin/loop_v6.py`;
- aggiornare `bin/state/test_loop_v6.py`;
- aggiungere una sola baseline visuale o story nella slice scelta.

### Task 6.1 — frozen journey

Preregistrare i passi:

```text
Lezione -> crea/nomina -> lavora -> salva
Continuità -> identifica/riprende la sessione
Materiali -> esporta e verifica il bundle
```

Vietare API browser `__*_TEST__` nell'oracolo del journey.

### Task 6.2 — policy 7/20

Testare:

- quota su unità accettate, non iniziate;
- almeno una UI ogni tre salvo incident override;
- override con owner, ragione e scadenza;
- `teacher_validation_rate` separato dal pass automatico.

### Task 6.3 — prima slice visuale

Selezionare una sola superficie. Aggiungere baseline deterministica, test di
focus/tastiera/target size e screenshot. Non accettare l'intera UI in un'unica
PR.

Verifica proporzionata:

```bash
python3 -m unittest bin.state.test_loop_v6 -v
cd apps/studio
npx playwright test <spec-della-slice>
npm run typecheck
npm run build
```

Commit suggerito:

```bash
git commit -m "test(ui): add first convergence journey oracle"
```

## PR 7 — WikiLLM provenance e Obsidian CLI canary

Questa PR è cross-repository e va divisa in due PR, una per repository.

### ARDESIA, massimo tre file

- aggiornare `bin/loop_v6.py`;
- aggiornare `bin/state/test_loop_v6.py`;
- aggiornare `ops/loop-v6/README.md`.

Testare che una risposta WikiLLM senza `vault_commit`, path e content hash sia
rifiutata e che il fallback file-first sia esplicito.

### ardesia-knowledge, massimo cinque file

- estendere `bin/truthctl.py` con query read-only provenance-aware;
- aggiungere il test corrispondente;
- aggiornare la documentazione della catena WikiLLM;
- aggiungere receipt;
- aggiornare il capability registry senza promozione.

Obsidian CLI entra solo come challenger:

1. verificarne l'assenza/presenza;
2. installazione approval-gated;
3. corpus sintetico;
4. confronto exact-read con filesystem;
5. receipt e rollback.

## PR 8 — Pi e Hermes desktop canary

Non iniziare finché PR 1–7 non hanno almeno cinque unità v6 terminali.

### Pi

- container o sandbox OS esterna;
- repository e vault read-only;
- nessuna home reale, socket SSH o credential store;
- task: classificare una fixture o eseguire un test;
- control run con tentativo di write che deve fallire.

### Hermes desktop

Prerequisiti umani:

- ruotare la chiave Moonshot esposta;
- profilo browser/desktop effimero;
- allowlist applicazioni;
- kill switch provato;
- log redatti.

Canary: percorrere il frozen journey e produrre screenshot/DOM. Nessuna
scrittura al repo o al vault.

Promozione: vietata prima di due unità indipendenti, zero escape e finding
incrementali confermati.

## Valutazione dopo 20 unità

Eseguire:

```bash
python3 bin/loop_v6.py report --window 20 --format json
python3 bin/loop_v6.py report --window 20 --format markdown
```

Il report deve includere goodput, first-pass yield, review yield, divergence,
stale context, rework, costo per unità, UI share, journey pass rate e teacher
validation rate.

Decisione umana:

- `RATIFY`: obiettivi raggiunti e nessun invariant violation;
- `AMEND`: beneficio presente ma soglie o ruoli da correggere;
- `ROLLBACK`: costo o falsi blocchi superano il beneficio;
- `EXTEND_CANARY`: dati insufficienti, con nuova finestra preregistrata.

Nessun esito può essere deciso dallo stesso controller che produce il report.
