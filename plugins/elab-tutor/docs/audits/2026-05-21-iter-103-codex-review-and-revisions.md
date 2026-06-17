# Revisione Codex del master plan iter 103 — verdetto + correzioni

**Data:** 2026-05-21 · **Reviewer:** Codex CLI GPT-5.5 high (sincrono) + verifica Claude
**Verdetto:** 🟡 **NEEDS-REVISION** — la strategia è giusta, il layer esecutivo no.

> Questo documento **corregge** `2026-05-21-MASTER-PLAN-iter-103-onwards.md` §2 + Sprint A
> e `2026-05-21-iter-103-codex-investigation.md` §1. In caso di conflitto, **vince questo
> documento**. NON eseguire la Sprint A della versione originale.

---

## 1. Verdetto

CI-unblock-first = spina corretta. Decomposizione 7-thread → 6-sprint = valida. MA:
4 fix gating prima di poter eseguire. **NEEDS-REVISION, non FLAWED.**

## 2. Findings (Codex + verifica live Claude)

| ID | Sev | Finding | Correzione applicata qui |
|----|-----|---------|--------------------------|
| **H1** | HIGH | Diagnosi CI stale: il piano cita `tests/e2e/22-vision-flow.spec.js` — **non esiste**. A2 cita `scripts/benchmark.cjs` — **sbagliato**. | §3 sotto: fatti CI corretti dai workflow reali. |
| **H2** | HIGH | Contraddizione: "main CI verde" vs "tutto bloccato da CI rossa su main". | §3: i 3 gate sono **PR-only** (Quality+Governance) o PR+push (E2E). NON "main rossa". |
| **H3** | HIGH | Matrice file-ownership ha un conflitto reale non previsto: #129 e #131 toccano entrambi `UnlimCompileHelper.jsx`. | §4: matrice PR reale `gh pr diff --name-only`. |
| **H4** | HIGH | Sprint A troppo grande per 1 iter. | §5: split in A-i / A-ii / A-iii. |
| M1 | MED | "No nuovo PR con CI rossa" contraddice A1-A3/A5 che creano PR. | §6: carve-out esplicito per PR di recovery. |
| M2 | MED | Tree dirty: piano dice 60 file, reale **66**. | I 6 file in più = i doc deliverable di questa sessione. Classificare tutti i 66 prima di A-ii. |
| M3 | MED | Ordine di merge è una congettura, senza matrice. | §4: ordine matrix-driven. |
| M4 | MED | Pulizia 658 branch = lavoro distruttivo, mal collocato dentro Sprint A. | §5: spostata in A-iii, iter separato, con delete-list esportata + ratifica. |
| M5 | MED | Lighthouse 26→90 in 3 iter irrealistico; bundle/palette/emoji/a11y anche FAIL. | Master plan Sprint E: target ridimensionato a "perf ≥70 + chiudere 1-2 FAIL", resto Sprint successivo. |
| L1 | LOW | Sprint F "parallelo" indebolisce la regola un-thread-alla-volta. | Sprint F confinata a worktree separato, mai sullo stesso branch del thread attivo. |
| L2 | LOW | Tempo Andrea sottostimato (10 min per ratificare 8 PR). | §5: ratifica in batch a fine A-ii, ~20-30 min realistici. |
| L3 | LOW | Risk register generico. | §7: rischi aggiunti. |

## 3. Fatti CI corretti (letti dai workflow reali 2026-05-21)

I 3 gate rossi e la loro logica REALE:

### `e2e.yml` — gate "E2E Tests" (job `test`), `on: [push, pull_request]`
Esegue: `npx vitest run` (unit) **poi** `npx playwright test` (smoke, esclude stress).
Spec vision reali: **`tests/e2e/02-vision-flow.spec.js`** e **`tests/e2e/13-vision.spec.js`**
(NON `22-vision-flow.spec.js` — quel file non esiste; memoria iter-83 stale). 47 spec e2e totali.

### `quality-gate.yml` — gate "Quality Gate" (job `quality-ratchet`), `on: pull_request`
NON usa `scripts/benchmark.cjs`. Fa 3 check contro `.test-count-baseline.json`:
1. **Test count ratchet** — `numPassedTests` ≥ `total*(1-regression_threshold)`.
2. **Zero failures** — `numFailedTests` deve essere 0.
3. **Bundle size** — `du -sk dist/` ≤ `bundle_max_kb`.
Localmente 14827 PASS / 0 fail → check 1-2 verdi. **Causa più probabile: check 3, bundle**
(`du -sk dist/` totale vs `bundle_max_kb`; quality-audit ha misurato 8546 KiB di solo JS).
Da confermare con `gh run view --log-failed`.

### `governance-gate.yml` — gate "Governance Gate" (job `governance-check`), `on: pull_request`
6 regole. **Regola 5 (Docs aggiornate)** vale per OGNI branch: se `src/` o `supabase/`
cambiano ma `CHANGELOG.md` no → FAIL. **PR #129, #131, #132, #135 cambiano src/supabase
SENZA toccare CHANGELOG.md** (vedi matrice §4) → Regola 5 li fa fallire tutti.
**Regola 2 (TDD)**: `feat()` senza `test()` prima → FAIL (vale per ogni branch).
**Baseline check**: `numPassedTests` ≥ `.test-count-baseline.json .total`.

> **Insight chiave (reframe):** la Governance Gate potrebbe NON essere "rotta" — sta
> **rifiutando correttamente** PR non conformi (manca CHANGELOG). In quel caso A3 non è
> "fixa il workflow" ma "rendi i PR conformi" (aggiungi voci CHANGELOG.md a ogni code-PR).
> La diagnosi `gh run view --log-failed` di A-i.1 decide: gate rotto vs PR non conformi.

---

## 4. Matrice PR reale (`gh pr diff --name-only`, 8 PR)

| PR | Branch | File chiave | Tipo |
|----|--------|-------------|------|
| #128 | `docs/iter-99-claude-md-archive` | `CLAUDE.md` + 2 doc | doc |
| #129 | `fix/iter-99-review-medium-followups` | **`UnlimCompileHelper.jsx`**, VirtualSerialMonitor.jsx+css, virtualSerialInterpreter.js, 2 test | code |
| #130 | `docs/fase4-mblock-handoff-plan` | 1 doc | doc |
| #131 | `fix/iter-99-compila-onesta` | HomeCompileEntry.jsx+css, ProgramExplainer.jsx, **`UnlimCompileHelper.jsx`**+css, CodePalette.css, IdeShell.css, CompileUploadButton.jsx, ScratchCompileBar.jsx, ElabScratchModeShell.jsx+css, api.js, compileSizeParse.js, 6 test | code (grande) |
| #132 | `feat/percorso-morfico-runtime` | lavagna/{LavagnaShell,ModalitaSwitch,PercorsoCapitoloView}.jsx+css, percorsoMorphicAdapter.js, 3 test, 1 e2e, 4 doc | code |
| #133 | `docs/open-design-percorso-pilot` | docs/design/open-design/* + 1 e2e | doc+test |
| #134 | `docs/repo-navigability` | `README.md` + 2 doc | doc |
| #135 | `feat/unlim-slice-1a-awareness-flags` | `awareness-flags.ts` + 2 doc + 1 test | code |

**Conflitto reale (UNICO):** #129 ↔ #131 su `src/components/home/UnlimCompileHelper.jsx`.
Tutto il resto è **disgiunto** (verificato): #131 (home/compile) vs #132 (lavagna) vs #135
(supabase) vs i 4 doc-PR — nessuna sovrapposizione di file.

**Ordine di merge corretto (matrix-driven):**
1. Doc-PR puri: **#128, #130, #134** (disgiunti, rischio minimo) — `#128` per primo (CLAUDE.md, superficie conflitto cresce nel tempo).
2. **#133** (docs/design + 1 e2e) e **#135** (supabase awareness-flags) — disgiunti, qualsiasi momento.
3. **#131** (compile, già in prod) → poi redeploy da `main`.
4. **#132** (lavagna, disgiunto da #131).
5. **#129 PER ULTIMO** — rebase su `main` dopo #131, risolvere il conflitto su
   `UnlimCompileHelper.jsx` **preservando le modifiche #131**.

⚠️ Prerequisito a OGNI merge: ogni code-PR (#129/#131/#132/#135) deve passare Governance
Rule 5 → potrebbe servire un commit `CHANGELOG.md` su ciascuno. Decidere in A-i.1.

---

## 5. Sprint A RIVISTO — split in 3 iter

### A-i (iter 103) — CI RECOVERY
- **A-i.1** Diagnosi live: `gh run view --log-failed` sui 3 run falliti reali. Stabilire
  per ciascun gate: gate rotto vs PR non conforme. Output: 1 doc diagnosi.
- **A-i.2** E2E: fix `02-vision-flow.spec.js` / `13-vision.spec.js` (bypass overlay onboarding
  o selettore). Branch `fix/iter-103-ci-e2e`.
- **A-i.3** Quality Gate: se è il bundle, ricalibrare `bundle_max_kb` in `.test-count-baseline.json`
  con motivo scritto (il fix bundle vero è Sprint E) — oppure correggere ciò che è regredito.
- **A-i.4** Governance Gate: se Regola 5 → preparare i commit `CHANGELOG.md` per i code-PR;
  se workflow rotto → fix workflow. Branch `fix/iter-103-ci-governance`.
- **Gate A-i:** i 3 check verdi su una PR di prova da `origin/main`. Ratifica Andrea.

### A-ii (iter 104) — CONSOLIDAMENTO + MERGE TRAIN
- **A-ii.1** Classificare TUTTI i 66 file dirty; committare in gruppi coerenti.
- **A-ii.2** PR per `feature/volume-1-experiment-overhaul` (7 commit, nessun PR oggi).
- **A-ii.3** Merge train nell'ordine §4. CoV `vitest run` tra un merge e l'altro
  (mettere in conto la coda CI + il tempo del full vitest ~14.8k test).
- **A-ii.4** Redeploy da `main` dopo #131. Ratifica Andrea in batch (~20-30 min).

### A-iii (iter 105) — PULIZIA BRANCH
- **A-iii.1** Esportare la delete-list: 39 merged + 658 `mac-mini/*` + triage ~89 stale.
- **A-iii.2** Ratifica Andrea sulla lista PRIMA della cancellazione di massa.
- **A-iii.3** Cancellazione `git branch -d` + `git push origin --delete`.

---

## 6. Correzione regola "no nuovo PR con CI rossa"

Carve-out esplicito: **i PR di CI-recovery** (`fix/iter-103-ci-*`, branch da `origin/main`,
che NON aggiungono feature) **sono permessi anche con CI rossa** — sono il modo per
sbloccarla. La regola "no nuovo PR" vale solo per i **PR di prodotto/feature**.

## 7. Risk register — rischi aggiunti (L3)

- Diagnosi CI stale → agente profila lo script sbagliato. *Mitig.: A-i.1 prima di tutto.*
- Confusione workflow PR-vs-push → hook mal tarato. *Mitig.: `guard-pr-on-red-ci` ridefinito "blocca PR di prodotto se check required rossi".*
- Coda CI + full vitest tra 8 merge → A-ii sfora il tempo. *Mitig.: A-ii è un iter dedicato.*
- PR stale che richiedono rebase. *Mitig.: ordine matrix-driven, #129 ultimo.*
- Governance fallita per struttura commit (squash, test-before-feat). *Mitig.: A-i.4 lo verifica.*
- Mac Mini env/secret mancanti. *Mitig.: azione Andrea §5 orchestration prima del dispatch.*

## 8. Le 4 fix gating (prima di eseguire)

1. ✅ Ri-diagnosi i 3 gate CI sui log reali — A-i.1 (fatto qui parzialmente: workflow letti).
2. ✅ Matrice `gh pr diff --name-only` — fatta, §4.
3. ✅ Split Sprint A in 3 iter — fatto, §5.
4. ✅ Sostituite le ownership-wildcard con file concreti — §4 + prompt rivisti.

**Stato:** il piano rivisto È eseguibile. Resta solo la diagnosi live `gh run view`
(A-i.1, primo atto di domani) per confermare gate-rotto vs PR-non-conforme.
