# MASTER PLAN — ELAB Tutor, da iter 103 in poi

**Data:** 2026-05-21 · **Autore:** Claude (sessione preparazione, read-only) · **Iter prep:** 103-prep
**Mandato Andrea:** NO COMPIACENZA · massima onestà · ferma-e-consolida · NO grind · NO auto-merge · ogni PR ratifica Andrea · NO regressioni · G45 anti-inflazione.

> ⚠️ **REVISIONE CODEX 2026-05-21 — piano rivisto.** Codex (GPT-5.5 high) ha dato verdetto
> **NEEDS-REVISION**. Le correzioni sono in **`docs/audits/2026-05-21-iter-103-codex-review-and-revisions.md`**
> — in caso di conflitto QUEL documento vince su §2 + §5 qui sotto. In sintesi: (1) la
> diagnosi CI in §2 era stale (spec E2E reale `02`/`13-vision`, non `22`; Quality Gate non
> usa `benchmark.cjs`); (2) Sprint A va splittata in A-i / A-ii / A-iii; (3) ordine merge PR
> matrix-driven (conflitto reale #129↔#131 su `UnlimCompileHelper.jsx`); (4) tree dirty 66
> file. **Non eseguire la Sprint A originale — usa quella rivista.**

> Questo documento è il piano-madre. Sequenzia tutto il lavoro residuo in **6 sprint**, uno
> alla volta, ogni thread con gate **CoV + /quality-audit + documentazione**. Scritto per
> essere ripreso da una sessione futura senza contesto pregresso (Codex Desktop, Claude
> Desktop, Mac Mini). L'handoff più recente è la verità.

---

## 0. Scopo + metodo di questa sessione (2026-05-21)

Sessione di **preparazione**, NON di esecuzione. Decisione Andrea:
- Scope = audit + mappa applicazione + master plan. **Zero edit al codice sorgente.**
- Motivo: repo dirty (60 file non committati) + Codex ha appena chiuso l'experiment
  overhaul vol 1/2/3. Editare ora ricreerebbe il tangle "ingarbugliato" di iter-99.
- Plugin/skill nuove: **specificate qui**, costruite in sprint dedicata.

Deliverable di questa sessione (tutti in `docs/`):
1. `docs/plans/2026-05-21-MASTER-PLAN-iter-103-onwards.md` — questo file
2. `docs/audits/2026-05-21-iter-103-app-graph-map.md` — mappa grafo applicazione
3. `docs/audits/2026-05-21-iter-103-quality-audit.md` — score card qualità
4. `docs/audits/2026-05-21-iter-103-codex-investigation.md` — investigazione CI-rossa + compile
5. `docs/handoff/2026-05-21-iter-103-multi-machine-orchestration.md` — piano multi-macchina domani
6. `docs/prompts/ITER-103-*.md` — prompt ottimizzati per Codex/agenti domani

---

## 1. Stato accertato (diagnostica 2026-05-21, verificato)

Fatti verificati questa sessione, non assunti:

| Dimensione | Valore | Fonte |
|------------|--------|-------|
| Branch corrente | `feature/volume-1-experiment-overhaul`, 7 commit ahead `main`, 0 behind | `git rev-list` |
| PR per il branch corrente | **Nessuno** — i 7 commit iter-99/101/102 non hanno PR | `gh pr list` |
| Working tree | **DIRTY** — 44 modified + 16 untracked (overhaul vol1 lesson-paths + docs) | `git status` |
| Build | **PASS** 14.9s · 27 precache · 1968 KiB | `npm run build` |
| Test unit | **14827 PASS** · 0 fail · 15 skip · 11 todo | `npx vitest run` |
| Regressione | **NESSUNA** — +324 vs baseline 14503 | confronto baseline |
| CI `main` (scheduled) | verde (Watchdog, Render Warmup) | `gh run list` |
| CI su ogni PR | **3 GATE ROSSI** dal 2026-05-12: E2E Tests · Quality Gate · Governance Gate | `gh run view` |
| PR aperti | **8** (#128–#135), tutti `MERGEABLE/UNSTABLE` | `gh pr list` |
| Branch totali | **1010 ref** (916 unici): 658 `mac-mini/*` bot + 39 già-merged + ~89 stale | `git branch -a` |
| Mega-PR #60 | **CHIUSO** — non più un problema (memoria stale) | `gh pr list` |
| Produzione | branch PR #131 live, `main`+2, 0 behind | iter-102 handoff |

**Lettura onesta:** il *codice* è sano (build verde, 14827 test verdi, zero regressioni).
Il problema NON è il codice — è **igiene di processo**: CI rossa che blocca 8 PR, 1010
branch ref, 60 file non committati. Esattamente il "loop ingarbugliato" di iter-99.

---

## 2. Il blocco critico — la CI rossa

**Tutto è bloccato dalla CI rossa su `main`.** Tre gate falliscono su ogni PR dal
2026-05-12 (9 giorni):

1. **E2E Tests** — `tests/e2e/22-vision-flow.spec.js`: VisionButton "Guarda il mio
   circuito" element-not-found, timeout 15s. Pre-esistente, NON causato da iter 83-102.
2. **Quality Gate** — `quality-ratchet`: una metrica sotto soglia salvata
   (`scripts/benchmark.cjs`).
3. **Governance Gate** — `Verify governance rules 0-5`: una regola di governance violata.

→ Root-cause dettagliato di ciascuno: vedi `docs/audits/2026-05-21-iter-103-codex-investigation.md`.

**Conseguenza:** "consolidare gli 8 PR" è impossibile finché la CI di `main` non è verde.
Mergeare con CI rossa = violazione del mandato "CI deve passare". Lo sblocco della CI è
**Sprint A, atom A1-A3** — prerequisito assoluto di tutto il resto.

---

## 3. I thread di lavoro (7)

| # | Thread | Stato 2026-05-21 | Sprint |
|---|--------|------------------|--------|
| T1 | **CI unblock** | 3 gate rossi dal 12/05 — blocca tutto | A |
| T2 | **GitHub org / consolidamento** | 8 PR aperti + 1010 branch ref + tree dirty | A |
| T3 | **Cross-compile NanoR4 / Blockly / C++** | funziona live; bug `flashPercent` (repo Render); latenza 36s; path `CompileUploadButton` da pulire; branch vol1-overhaul senza PR | B |
| T4 | **Percorso morfico / open design / experiment overhaul** | PR #132 + #133; vol 1/2/3 overhaul fatto da Codex; "non è morfico in tempo reale" — producer live-signal non cablati | C |
| T5 | **UNLIM** | sano (R5 93%+, matrix 99.6%); miglioramento incrementale | D |
| T6 | **Fumetto sessione** | `generateSessionFumetto`; ogni fumetto unico per sessione; da finire + cablare | D |
| T7 | **Debito qualità/UX** | font/touch/palette violations; Lighthouse perf 26/23; dead code | E |

---

## 4. Organizzazione a Sprint (6 sprint)

### Principio FOCUS + FINISH (lezione Code Kit, 2026-05-21)

L'analisi del concorrente Code Kit (`docs/research/2026-05-21-codekit-edukits-crosscompile-reference.md`)
ha dato un verdetto duro: **ELAB fa 12 cose a 4/10; Code Kit fa 1 cosa a 9/10 e vende a
10.000 utenti.** Il problema di ELAB non è mancanza di feature — è **mancanza di focus e
di rifinitura**. Questo piano applica 3 regole non negoziabili:

1. **Un obiettivo per sprint, in UNA frase.** Se non si dice in una frase, lo sprint non
   ha focus (regola /sprint-planning). Vedi colonna "Goal (1 frase)" sotto.
2. **FINISH prima di NEXT.** Uno sprint non chiude finché il suo thread non è *finito* —
   pulito, testato, documentato, in prod. Niente "quasi pronto", niente feature a metà
   trascinate avanti (lezioni: Fumetto stub, IdeShell senza type-check).
3. **TAGLIARE è lavoro.** Ogni sprint può rimuovere codice morto / feature non finite /
   sprawl. Sprint E è ESPLICITAMENTE un taglio, non solo polish. Meno superficie = più
   rifinitura possibile.

Regole ereditate: un thread alla volta · nessun PR di prodotto con CI `main` rossa
(iter-99) · ogni sprint chiude con gate CoV + /quality-audit + doc + DoD.

| Sprint | Iter | Goal (1 frase) | Exit criteria |
|--------|------|----------------|---------------|
| **A — UNBLOCK & CONSOLIDA** | 103-105 | "La CI è verde e il repo è pulito." | CI verde `main`; 0 PR aperti; tree pulito; branch 1010→~50 |
| **B — CROSS-COMPILE FINITA** | 106-108 | "Cross-compile pulita e finita come l'editor di Code Kit." | flashPercent corretto; cold-start <5s; 1 solo path compile; UI #compile-home che Andrea approva |
| **C — PERCORSO MORFICO LIVE** | 109-111 | "Il Percorso è morfico in tempo reale, non un guscio inerte." | producer `elab:percorso-live-signal` cablati; overhaul vol verificato; arco narrativo continuo |
| **D — UNLIM + FUMETTO FINITI** | 112-114 | "Fumetto ha un backend e funziona; UNLIM non regredisce." | Fumetto backend + E2E live; matrix UNLIM ≥99% |
| **E — TAGLIO + RIFINITURA** | 115-117 | "Meno superficie, più pulizia: sprawl e dead code via." | dead code rimosso; bundle ridotto; emoji/palette/a11y FAIL chiusi |
| **F — TOOLING** | worktree separato | "Plugin/skill di §8 costruite." | plugin/skill buildati + eval |

Proiezione onesta: Sprint A-E ≈ 15 iter. **Score di fine sprint: NON dichiarato qui** —
G45, lo score lo dà una review Opus indipendente, mai auto-assegnato (vedi §8 critica
"si auto-gonfia" nel research Code Kit).

---

## 5. SPRINT A — dettaglio (iter 103, domani)

**Goal:** chiudere la consolidazione iniziata a iter-99. CI verde, 8 PR mergeati,
repo pulito. Questo È il "ferma e consolida" portato a termine.

Il piano operativo dettagliato di Sprint A esiste già ed è valido:
`docs/plans/2026-05-20-iter-102-consolidation-plan.md` (7 fasi). Questo master plan lo
**conferma e lo estende** con gli atom seguenti.

### Atom A1-A3 — Sblocco CI (BLOCKER, prerequisito)
Una fix-PR per causa, branch da `origin/main`.
- **A1** — Diagnosi + fix `E2E Tests`. Vision E2E `22-vision-flow.spec.js`. Decidere:
  fix del selettore VisionButton, oppure marcare il singolo test `.fixme` CON data e
  causa scritta (NON disabilitare tutto il job). Verifica: check `test` verde su PR di prova.
- **A2** — Diagnosi + fix `Quality Gate` (`quality-ratchet`). Trovare la metrica sotto
  soglia (`node scripts/benchmark.cjs --fast`); correggere la regressione **oppure**
  ricalibrare la soglia con motivazione scritta. NON alzare la soglia "per far passare".
- **A3** — Diagnosi + fix `Governance Gate`. Identificare quale regola 0-5; correggere
  workflow o repo. Verifica: gate verde su PR di prova.
- **GATE A1-A3:** `gh pr checks <PR-prova>` → 3 check ex-rossi verdi. Finché non passa,
  A4+ è bloccato.

### Atom A4 — Consolidamento working tree
- Committare i 60 file dirty in modo chirurgico: i 41 lesson-path vol1 + `experiments-vol1.js`
  + `narrative-map-94.json` sono l'experiment overhaul → 1 commit coerente.
- I 7 doc untracked (audit/handoff/plan/prompt iter 99-102) + i deliverable di questa
  sessione → 1 commit docs.
- `automa/state/*` churn → NON committare (rumore bot).
- `output/` untracked → valutare `.gitignore`.

### Atom A5 — PR per `feature/volume-1-experiment-overhaul`
I 7 commit iter-99/101/102 + l'overhaul vol1 NON hanno PR. Aprire **1 PR pulito** basato
su `main`. Questo è l'8º+1 filone non tracciato.

### Atom A6-A12 — Merge 8 PR (solo dopo CI verde)
Ordine da `docs/plans/2026-05-20-iter-102-consolidation-plan.md`:
1. #131 cross-compile (già in prod, 0 behind) → poi redeploy da `main`
2. #132 morfismo (file `lavagna/` disgiunti)
3. #128 CLAUDE.md archive (presto — superficie conflitto piccola)
4. #130, #133, #134, #135 (doc puri + slice UNLIM)
5. #129 per ultimo (tocca file compile → rebase su `main` post-#131)
- **Ogni merge:** `gh pr merge --squash --delete-branch`, CoV `vitest run` post-merge.

### Atom A13 — Pulizia branch (656+ stale)
- 39 branch già-merged → safe-delete (`git branch -d` + `git push origin --delete`).
- 658 `mac-mini/iter36-user-sim-*` → cancellazione di massa (bot, 2026-05-01/08, valore 0).
- ~89 stale unmerged → triage: tenere solo quelli con lavoro vivo.
- **Ratifica Andrea prima della cancellazione di massa.** Operazione distruttiva.

### Atom A14 — Verifica finale Sprint A
`gh pr list --state open` → 0 · `gh run list --branch main` → verde · `npm run test:build-smoke`
→ 4 route OK · cross-compile live HTTP 200.

**Exit Sprint A:** CI verde · 0 PR aperti · tree pulito · branch ridotti da 1010 a ~50 ·
prod = `main` HEAD (no drift).

---

## 6. SPRINT B-F — sintesi

### Sprint B — Cross-compile FINITA (iter 106-108)

**Goal (1 frase):** "Cross-compile pulita e finita come l'editor di Code Kit."

**Spec (/write-spec):**
- *Obiettivo:* il flusso blocchi/C++ → compile → upload Nano R4 è veloce, onesto e
  visivamente pulito quanto Code Kit. Demo-ready per Riccardo Omaric.
- *Non-obiettivi:* nuove board oltre Nano R4; riscrivere il simulatore; feature nuove.
  Sprint B **finisce** il cross-compile, non lo espande.
- *Success criteria (misurabili):* (1) secondo compile post-warmup <5s — oggi cold-start
  36s; (2) `flashPercent` realistico ±5% vs arduino-cli; (3) un solo path compile in prod;
  (4) UI `#compile-home` approvata da Andrea al primo colpo (oggi: "brutta", "bar soup");
  (5) zero claim disonesti (no "Compilato" falso, no upload finto senza scheda).

**Atom (P0 → P2):**
- **B1 (P0)** Cold-start <5s — warmup cron (`vercel.ts` crons / pg_cron) ping
  `/api/compile/nanor4` ~10 min + stato UI "Preparo il compilatore…". *Code Kit compila
  in locale = istantaneo; il cold-start 36s è la nostra peggiore debolezza competitiva.*
- **B2 (P0)** Bug `flashPercent` — repo Render `elab-cloud-compile`: parsare lo stdout
  arduino-cli ("Sketch uses N bytes (P%)"), non `hex.length` (sovrastima ~2.8×).
- **B3 (P0)** UI `#compile-home` FINITA — chiudere "bar soup" + icone brutte. Riferimento
  estetico esplicito: pulizia/coerenza di Code Kit (research doc §7).
- **B4 (P1)** Un solo path compile — rimuovere il path browser-diretto
  `VITE_ELAB_CLOUD_COMPILE_URL` da `CompileUploadButton` (P0/P1 audit iter-100).
- **B5 (P1)** Hook `guard-deploy-stale-branch` — anti regressione iter-83.
- **B6 (P1)** DECISIONE desktop-agent — Code Kit monetizza il modello compile-locale.
  Decisione esplicita con Andrea: restare cloud-only OPPURE rivalutare un path locale
  (l'ELAB Compile Agent iter-63 esisteva già). È una decisione, non un re-build a caso.
- **B7 (P2, stretch — tagliabile)** Hardware UAT Nano R4 con Andrea/Tea/Riccardo + script
  demo Riccardo linguaggio semplice (no "Morfismo", memoria omaric-comms).
- Gate: CoV + /quality-audit + doc per atom + DoD §7.

### Sprint C — Percorso morfico live (iter 109-111)

**Goal (1 frase):** "Il Percorso è morfico in tempo reale, non un guscio inerte."
- **C1** Cablare i producer `elab:percorso-live-signal` — la feature Percorso morfica
  (#132) è solo lato consumer; in prod il pannello "regia live" resta inerte. Fix la
  lamentela Andrea "non è morfico in tempo reale". Tocca `GalileoAdapter`/`useGalileoChat`.
- **C2** Verifica experiment overhaul vol 1/2/3 (fatto da Codex) — CoV su tutti i volumi,
  arco narrativo continuo, coerenza Morfismo Sense 2.
- **C3** Open Design percorso (#133) — integrare il pilot dopo merge.
- **C4** Arco narrativo continuo — cliffhanger CTA cablati su tutte le transizioni
  (vedi sezione "NARRATIVE ARC CONTINUO" in CLAUDE.md).
- Gate: CoV + /quality-audit + doc.

### Sprint D — UNLIM + Fumetto finiti (iter 112-114)

**Goal (1 frase):** "Fumetto ha un backend e funziona; UNLIM non regredisce."
- **D1** Fumetto sessione — `generateSessionFumetto`, ogni fumetto unico/didattico basato
  sulla sessione. Finire + cablare + E2E.
- **D2** UNLIM incrementale — polish su onniscenza/onnipotenza; nessuna regressione sulla
  matrix 1000-query 99.6%.
- Gate: CoV + /quality-audit + doc.

### Sprint E — TAGLIO + RIFINITURA (iter 115-117)

**Goal (1 frase):** "Meno superficie, più pulizia: via sprawl e dead code."

Code Kit con 1/10 delle feature sembra un prodotto vero; ELAB con 10× sembra un cantiere.
Sprint E **taglia**, non solo lucida.

**Atom (P0 → P2):**
- **E1 (P0)** TAGLIARE dead code — `ElabTutorV4.jsx` 2552 righe (vivo solo in `#prova`),
  `experimentNarrativeService.js`, `elab-blockly-theme.css`, `App.jsx:251-313`. Decidere
  con Andrea cosa muore. Valutare anche feature mai finite da tagliare invece di trascinare.
- **E2 (P0)** Bundle — lazy-load `react-pdf`/`mammoth`/`recharts` (8.5 MB JS → obiettivo <5 MB).
- **E3 (P0)** Emoji-as-icons — 134 → 0 (regola 11 violata). Sostituire con `ElabIcons` SVG.
- **E4 (P1)** A11y — `role`+`tabIndex`+`onKeyDown` sui ~65 div clickable inaccessibili.
- **E5 (P1)** Palette — 2157 hex raw fuori palette → token `var(--elab-hex-*)`.
- **E6 (P2, stretch)** Lighthouse perf — obiettivo realistico ≥70 (NON ≥90 in 1 sprint —
  irrealistico, Codex M5). Il resto in uno sprint successivo.
- Gate: CoV + /quality-audit + doc.

### Sprint F — Tooling (parallelo)
Costruire i plugin/skill di §8. Sprint dedicata, repo pulito.

---

## 7. Disciplina di esecuzione — il loop per ogni thread

Per OGNI atom, in quest'ordine (non negoziabile):

1. **Branch** da `origin/main` aggiornato (`fix/`, `feat/`, `docs/` naming).
2. **Codex Pattern V** (verify read-only) PRIMA di scrivere codice — su atom non banali.
3. **Implementazione** chirurgica (Karpathy: tocca il minimo).
4. **CoV** — `npx vitest run` prima e dopo; 3× se si dichiara "test passano". Build PASS.
5. **/quality-audit** — score card sull'area toccata.
6. **Codex Pattern C** (cross-check) o **/codex:review** PRIMA del commit (lezione iter-82:
   ship-then-fix è un anti-pattern — review prima del commit, non dopo).
7. **Commit** atomico, mai `--no-verify`, mai push diretto su `main`.
8. **PR** via `gh pr create` — **ratifica Andrea**, mai auto-merge.
9. **/document-sync** + handoff — documentare nel bene e nel male.
10. **systematic-debugging** se emerge un bug — root cause prima del fix.

Regola d'oro iter-99: **non aprire un nuovo PR finché la CI di `main` è rossa.**

---

## 8. Nuovi plugin/skill — specifiche (build in Sprint F)

Specificati qui, costruiti dopo (decisione Andrea). Vedi `/skill-creator` + `/writing-skills`
per il metodo. Ogni skill: frontmatter `name` + `description` con trigger keyword.

### S1 — `elab-ci-doctor` (skill)
**Trigger:** "CI rossa", "gate fallisce", "PR bloccato", "consolidamento PR".
**Scopo:** diagnosi automatica dei 3 gate (E2E/Quality/Governance). Esegue `gh run view
--log-failed`, `node scripts/benchmark.cjs --fast`, mappa la failure alla causa, propone
la fix-PR. Codifica la lezione "una fix-PR per causa, branch da main".

### S2 — `elab-pr-consolidator` (skill)
**Trigger:** "merge PR", "consolida backlog", "ordine merge".
**Scopo:** dato un set di PR aperti, calcola l'ordine di merge per conflitto minimo
(file disgiunti prima, doc-puri liberi, file-compile per ultimi), genera i comandi
`gh pr merge`, gate CoV tra un merge e l'altro. Codifica il piano consolidamento iter-102.

### S3 — `elab-branch-janitor` (skill)
**Trigger:** "pulizia branch", "branch stale", "troppi branch".
**Scopo:** categorizza i branch (merged/stale-bot/stale-feature/vivi), lista i safe-delete,
chiede ratifica prima della cancellazione di massa. Risolve i 658 branch `mac-mini/*`.

### S4 — `elab-cross-compile-verify` (skill)
**Trigger:** "verifica compile", "cross-compile Nano R4", "compile onesto".
**Scopo:** smoke test end-to-end del compile (curl `/api/compile/nanor4`, controllo
`flashPercent` realistico, controllo onestà UI). Codifica gli exit criteria iter-100/101.

### S5 — `multi-machine-orchestrator` (skill o plugin)
**Trigger:** "orchestrazione multi-macchina", "Mac Mini", "Codex desktop parallelo".
**Scopo:** template per distribuire lavoro su Claude Desktop + Codex Desktop + Mac Mini
SSH con matrice file-ownership anti-conflitto. Codifica il Pattern S r3.

### Hook proposti (vedi §9)
- `guard-deploy-stale-branch` — già in Sprint B3.
- `guard-pr-on-red-ci` — PreToolUse Bash: blocca `gh pr create` se CI di `main` rossa.

---

## 9. Raccomandazioni automazione (/claude-automation-recommender)

| Tipo | Nome | Scopo |
|------|------|-------|
| Hook PreToolUse Bash | `guard-deploy-stale-branch` | blocca `vercel --prod` da branch ≠ main/behind |
| Hook PreToolUse Bash | `guard-pr-on-red-ci` | blocca `gh pr create` con CI main rossa |
| Hook PostToolUse Edit | `vitest-delta-check` | dopo Edit su `src/`, run delta-scope vitest |
| Subagent | `ci-gate-diagnoser` | diagnosi automatica dei gate CI |
| Subagent | `branch-janitor` | inventario + triage branch periodico |
| MCP | Sentry + PostHog | telemetria errori prod (OAuth pending Andrea) |

Dettaglio completo: vedi sezione automazione in `docs/handoff/2026-05-21-iter-103-multi-machine-orchestration.md`.

---

## 10. Risk register

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Fix CI introduce regressione | Media | Alto | CoV 3× + Codex Pattern V pre-commit |
| Cancellazione branch elimina lavoro vivo | Bassa | Alto | triage + ratifica Andrea prima |
| Merge 8 PR genera conflitti | Media | Medio | ordine per conflitto minimo (#129 ultimo) |
| flashPercent fix nel repo sbagliato | Bassa | Medio | è nel repo Render, NON elab-tutor — documentato |
| Grind autonomo si re-ingarbuglia | Media | Alto | 1 thread alla volta + checkpoint onesti + no auto-merge |
| Score inflation | Media | Medio | G45: review Opus indipendente, mai auto-score >7 |

---

## 11. Cross-link

- Piano consolidamento Sprint A operativo: `docs/plans/2026-05-20-iter-102-consolidation-plan.md`
- Handoff iter-102: `docs/handoff/2026-05-20-iter-102-codex-review-consolidation.md`
- Audit compile-honesty iter-100: `docs/audits/2026-05-20-iter-100-compile-honesty-debug-deep-audit.md`
- Mappa grafo app: `docs/audits/2026-05-21-iter-103-app-graph-map.md`
- Quality audit: `docs/audits/2026-05-21-iter-103-quality-audit.md`
- Codex investigation CI: `docs/audits/2026-05-21-iter-103-codex-investigation.md`
- Revisione Codex del piano: `docs/audits/2026-05-21-iter-103-codex-review-and-revisions.md`
- Analisi competitiva Code Kit (EduKits): `docs/research/2026-05-21-codekit-edukits-crosscompile-reference.md`
- Orchestrazione multi-macchina: `docs/handoff/2026-05-21-iter-103-multi-machine-orchestration.md`
- Feedback loop onesto: `feedback_autonomous_loop_honest_checkpoint.md`
- CLAUDE.md — storia sprint iter 1-102 + DUE PAROLE D'ORDINE (Principio Zero + Morfismo)

---
*Master plan iter 103+ — sessione preparazione 2026-05-21 · ELAB Tutor · revisione Andrea pendente*
