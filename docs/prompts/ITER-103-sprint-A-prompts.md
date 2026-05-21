# Prompt ottimizzati — iter 103 Sprint A-i (CI RECOVERY)

**Data:** 2026-05-21 · **Rev:** post-revisione Codex (vedi `docs/audits/2026-05-21-iter-103-codex-review-and-revisions.md`)
**Per:** esecuzione domani · **Metodo:** prompt-engineering-patterns + prompt-optimize

> ⚠️ **Versione corretta.** La v1 di questo file conteneva 2 errori (file E2E inesistente
> `22-vision-flow.spec.js`; A2 puntava a `scripts/benchmark.cjs` sbagliato). Corretti qui
> con i fatti letti dai workflow reali. Sprint A è ora splittata: questi prompt sono Sprint **A-i**.

Pattern applicati: ruolo esplicito · contesto self-contained · success criteria misurabili ·
file-ownership da matrice reale · guard anti-allucinazione · Chain-of-Thought · anti-pattern
vietati espliciti · formato output strutturato.

---

## PROMPT A-i.1 — Diagnosi live dei 3 gate CI (PRIMO ATTO, prima di ogni branch)

```
RUOLO: DevOps engineer. READ-ONLY — non modificare nulla, solo diagnosticare.

CONTESTO: Repo /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder, GitHub AndreaMarro/elab-tutor.
3 gate CI rossi su ogni PR. Workflow reali: .github/workflows/{e2e.yml, quality-gate.yml,
governance-gate.yml}. NON fidarti di diagnosi pregresse — leggi i log reali.

COMPITO (Chain of Thought):
1. gh run list --repo AndreaMarro/elab-tutor --branch <branch-di-un-PR-aperto> --limit 10
2. Per ciascuno dei 3 workflow: gh run view <id> --log-failed | tail -150
3. Per ognuno stabilisci: il GATE è rotto (bug nel workflow) OPPURE il PR è non-conforme
   (es. Governance Regola 5 = manca update CHANGELOG.md — comportamento corretto del gate)?
4. Quality Gate: identifica QUALE dei 3 check fallisce (test-count ratchet / zero-fail /
   bundle size vs .test-count-baseline.json bundle_max_kb).
5. E2E: identifica QUALE spec fallisce (sospetti: 02-vision-flow.spec.js, 13-vision.spec.js).

OUTPUT: per ogni gate — causa esatta + verdetto "gate-rotto" vs "PR-non-conforme" + log
citato. Questo decide se A-i.3/A-i.4 fixano il workflow o i PR. NON inventare: se un log
non è chiaro, riportalo testuale.
```

---

## PROMPT A-i.2 — Fix gate `E2E Tests`

```
RUOLO: Senior QA engineer, esperto Playwright.

CONTESTO: Repo elab-builder. Gate CI `E2E Tests` (workflow .github/workflows/e2e.yml, job
`test`) rosso. Il job fa: npx vitest run (unit) POI npx playwright test smoke (esclude
stress). Spec vision reali: tests/e2e/02-vision-flow.spec.js e tests/e2e/13-vision.spec.js.
Ipotesi (audit iter-100 P1): un overlay onboarding/consenso copre il bottone vision.
PRIMA leggi l'output di A-i.1 per sapere QUALE spec fallisce davvero.

OWNERSHIP ESCLUSIVA: tests/e2e/*.spec.js (lo spec che fallisce) + tests/e2e/helpers/*.
NON toccare .github/workflows/ (proprietà A-i.4). NON toccare src/.

COMPITO (CoT): 1.riproduci con Playwright headed → 2.conferma la causa con file:line →
3.fix minimo (se overlay: bypass esplicito nell'helper, seed localStorage consenso +
dismiss onboarding — cerca il pattern in altri spec; se selettore: aggiornalo) →
4.CoV: lo spec passa 3× di fila.

SUCCESS CRITERIA: lo spec verde 3×; check `E2E Tests` verde su PR di prova da origin/main.

ANTI-PATTERN VIETATI: disabilitare il job; .skip/.fixme senza data+causa+condizione di
rimozione; modificare src/ per far passare il test; --no-verify.

GUARD: se la causa NON è uno spec vision, dillo e riporta quale. Se non riproduci,
riporta cosa hai osservato — non inventare.

OUTPUT: diagnosi / root cause file:line / fix / esito CoV 3×.
```

---

## PROMPT A-i.3 — Fix gate `Quality Gate`

```
RUOLO: Build/performance engineer.

CONTESTO: Repo elab-builder. Gate CI `Quality Gate` (.github/workflows/quality-gate.yml,
job `quality-ratchet`) rosso. Il job fa 3 check contro .test-count-baseline.json:
(1) test-count ratchet — numPassedTests ≥ total*(1-regression_threshold);
(2) zero failures — numFailedTests == 0;
(3) bundle size — `du -sk dist/` ≤ bundle_max_kb.
Localmente: 14827 test PASS, 0 fail → check 1-2 verdi. Sospetto: check 3 (bundle, misurato
8546 KiB di solo JS). PRIMA leggi A-i.1 per la causa esatta.

OWNERSHIP ESCLUSIVA: .test-count-baseline.json (le soglie). NON toccare src/, tests/,
.github/workflows/.

COMPITO (CoT): 1.dall'output A-i.1, identifica il check fallito + numeri esatti →
2.decisione: regressione reale (correggere a monte) o soglia troppo stretta (ricalibrare)?
→ 3.se check 3 bundle: il fix vero del bundle è Sprint E — qui ricalibra `bundle_max_kb`
al valore reale attuale + margine, CON motivo tecnico scritto nel commit + TODO datato
"stringere dopo Sprint E" → 4.verifica.

SUCCESS CRITERIA: check `Quality Gate` SUCCESS su PR di prova da origin/main.

ANTI-PATTERN VIETATI: alzare una soglia senza motivazione tecnica scritta; disabilitare
il job; toccare codice fuori ownership.

GUARD: cita i numeri esatti dall'output (baseline, attuale, soglia) — mai a memoria.

OUTPUT: check fallito + numeri / decisione + motivo / fix / esito.
```

---

## PROMPT A-i.4 — Fix gate `Governance Gate`

```
RUOLO: DevOps engineer, esperto GitHub Actions + governance.

CONTESTO: Repo elab-builder. Gate `Governance Gate` (.github/workflows/governance-gate.yml,
job `governance-check`) rosso. 6 regole. La Regola 5 fa fallire OGNI PR che cambia
src/ o supabase/ SENZA aggiornare CHANGELOG.md — i PR #129/#131/#132/#135 fanno esattamente
questo. Quindi il gate potrebbe NON essere rotto: sta rifiutando PR non conformi.
PRIMA leggi A-i.1: verdetto gate-rotto vs PR-non-conforme.

OWNERSHIP ESCLUSIVA: sei l'UNICO che tocca .github/workflows/*.yml. Se A-i.2/A-i.3
chiedono un cambio workflow, te lo segnalano. Puoi anche preparare i commit CHANGELOG.md
sui code-PR (coordinati con chi possiede quei branch).

COMPITO (CoT):
1. Dall'output A-i.1: quale regola (0-5) fallisce e perché.
2. Se Regola 5 (CHANGELOG mancante) → NON è il workflow ad essere rotto. Il fix è:
   aggiungere una voce CHANGELOG.md a ogni code-PR non conforme. Documenta l'elenco.
3. Se Regola 2 (TDD: feat() senza test() prima) → valuta se i PR vanno ristrutturati
   o se la regola va affinata per i fix-PR. Motiva.
4. Se è il workflow ad avere un bug → fix minimo del workflow.
5. Verifica.

SUCCESS CRITERIA: check `Governance Gate` SUCCESS su PR di prova da origin/main.

ANTI-PATTERN VIETATI: disabilitare il check di governance; bypassare una regola invece
di soddisfarla; --no-verify.

GUARD: nomina la regola esatta + cita il log. Non assumere — il log di A-i.1 è la verità.

OUTPUT: regola violata + causa / verdetto gate-rotto vs PR-non-conforme / fix (workflow o
lista CHANGELOG) / esito.
```

---

## PROMPT — Template verifica Codex (Pattern V, pre-commit)

```
RUOLO: Reviewer indipendente. READ-ONLY.

CONTESTO: Preparata una fix per <A-i.2|A-i.3|A-i.4> sul branch <branch>. Diff: <git diff>.

COMPITO: verifica PRIMA del commit (lezione iter-82: review prima, non dopo):
1. La fix risolve la causa root o il sintomo?
2. Regressioni? Tocca file fuori dall'ownership dichiarata?
3. Anti-pattern (disabilitare job, --no-verify, soglia gonfiata senza motivo)?
4. I success criteria sono davvero soddisfatti dall'evidenza?

OUTPUT: verdetto SHIP / FIX-BEFORE-SHIP / BLOCK + findings con severità + file:line.
Niente compiacenza.
```

---

## Note prompt-engineering

- **A-i.1 è il prerequisito** — nessun fix prima di aver letto i log reali (errore v1: si
  era diagnosticato a memoria → file E2E inesistente, script Quality sbagliato).
- **Ownership da matrice reale** (`gh pr diff --name-only`), non congetturata.
- **Guard anti-allucinazione** in ogni prompt — il progetto ha storia di claim inventati.
- **Reframe Governance** nel prompt A-i.4: "il gate potrebbe NON essere rotto" — evita che
  l'agente "fixi" un workflow che funziona correttamente.
