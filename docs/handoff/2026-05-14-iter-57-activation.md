# ELAB Tutor — iter 57 activation prompt

> Continuation hand-off from iter 56. Branch: `feat/iter-41-sprint-u-cycle-2-real-user-fix`.
> Paste the **Activation string** (bottom of this file) into a fresh Claude Code session, or paste this whole file.
> iter 56 closed: **A4.1c is DONE** for its exit criterion (0 `pending-consolidation`), with **1 documented narrative-flow regression deferred to A4.1d**. iter 57 starts A4.1d.

---

## Role

You are continuing autonomous work on **ELAB Tutor** — an educational electronics platform for kids 8-14 (kit fisici Omaric + 3 volumi cartacei Davide + software). You are mid-EPIC-1: aligning the software's experiment definitions to the printed volumes. iter 56 completed **A4.1c** (consolidated the 2 Vol3 duplicate ids; corrected the A3 verdict's wrong Vol2 Cap.11 claim). iter 57 does **A4.1d** (re-thread + per-field fidelity), then **A4.1e** (regenerate the narrative structure).

---

## §0 — Entrance sequence (do these FIRST, in this exact order — do not skip, do not reorder)

1. **Confirm working dir + branch + Codex.** `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"`, `git branch --show-current` → must be `feat/iter-41-sprint-u-cycle-2-real-user-fix`. `git log --oneline -10` → HEAD = `f043f82c` (the iter-56 close-docs commit); the A4.1c *implementation* tail is `ad2bc106`. Then **verify Codex**: `ls ~/.npm-global/bin/codex && ~/.npm-global/bin/codex --version` → must be `codex-cli 0.128.0`. `which codex` may return "not found" — that is fine, it is a PATH issue only; `scripts/dev/codex-bg.sh` hardcodes the absolute path `$HOME/.npm-global/bin/codex` and works regardless. If the binary is genuinely missing, restoring it is iter-57's FIRST sub-task (`npm ls -g @openai/codex`; it was `@openai/codex@0.128.0` in iter 56).
2. **`git status`.** Expect a clean tree EXCEPT a handful of files left modified by the concurrent autonomous loop (`AGENTS.md`, `automa/state/heartbeat`, `automa/state/iter-19-harness-2.0-results.json`, `automa/state/parallel-research.json`) — those are NOT yours, leave them, never stage them. If you see a large unexpected diff in `src/` or `tests/`, the autonomous loop is mid-task — investigate provenance before touching anything (§5). Do NOT `git stash` in this repo — the concurrent loop modifies `automa/state/*` underneath a stash and the pop conflicts (iter 56 hit this).
3. **Pre-flight CoV (entrance gate — MANDATORY before any change).** `npx vitest run` → must be **13106 passed, 0 failed** (15 skip + 12 todo). `npm run build` → exit 0. `node scripts/epic1/validate-lesson-paths.mjs` → **0 `pending-consolidation`** (94 checked · 64 pass · 30 fail — the 30 fails ARE the A4.1d work-list). If any is red → STOP and report — do not "fix" by touching tests. (Note: 13106, not 13273 — A4.1c legitimately re-baselined; both `.test-count-baseline.json` `total` and `automa/baseline-tests.txt` read 13106.)
4. **`/mem-search` to re-anchor on the §2 mandate.** Run the claude-mem `search` tool with: `"EPIC 1 narrative arc parità volumi kit elabtutor"`, `"A4.1d re-thread dangling refs per-field correct"`, `"A3 master verdict repo book-faithful"`, `"Morfismo Sense 2 triplet"`. Background only — the authoritative iter-56 state is the files in §3.
5. **Read Tea's work — START HERE.** Read `/Users/andreamarro/VOLUME 3/TEA/` and `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/`. Tea (Teodora De Venere) produced the canonical blueprint, vendored into `scripts/epic1/tea-canon/`: `standard_experiment_schema.json` (the 7-step schema — structurally canon), `narrative_map.json`, `narrative_metadata_94.json`, `cliffhanger_table.json`. **Authoritative use** (per the iter-54 A3 verdict): Tea's 7-step schema STRUCTURE is canon; her `bookText`/`success_citation`/`analogy` metadata is verbatim-verified and canon **for Vol 1 + Vol 2 only**; her `narrative_map` chapter titles + `nextId` chains are **unreliable** (16/22 chapter titles wrong); her Vol 3 `bookText` is **fabricated** (0/29 verbatim) — do not use it. The physical volumes (`CONTENUTI/volumi-pdf/`) are the sole source of truth.
6. **Read the iter-56 state hand-off** — every file in §3, especially the iter-56 close audit.

---

## §1 — The recurring Andrea mandate (verbatim — this is the WHY of all of EPIC 1, repeated across many sessions)

> **Gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate (anti-pattern attuale elabtutor). Ci deve essere parità totale: volumi cartacei (Davide) ↔ kit fisici Omaric ↔ software elabtutor. Stessa narrativa, stesso ordine, stessi nomi, stesse pagine, stesse transizioni cliffhanger inter-esperimento. Questo è Morfismo Sense 2 — il differenziatore competitivo non copiabile.**

Operating rule, ratified: **parità stretta** — the software experiment inventory must exactly equal the *current* printed volume inventory. Nothing ships that is not in the printed volume; what the volume has and the software lacks gets added; over-splits/duplicates collapse to 1:1. A `narrative_flow` that contains a **cycle** (iter 56 introduced one — see §3) directly violates "arco narrativo continuo" — fixing it is iter 57's #1 task. **Run `/mem-search` for `"EPIC 1 narrative arc parità volumi kit elabtutor"` at the start to re-anchor — Andrea has stated this many times.**

---

## §2 — Anti-regression (HARD CONSTRAINTS — non-negotiable, FERREO)

- `npx vitest run` must end **0-failed** before AND after every change. Entrance baseline = **13106**. A test that *fails* is a regression → REVERT. A test that legitimately *disappears* because its source data changed is expected — but only re-baseline the count *with an arithmetic proof* (the A4.1b/A4.1c method: confirm exactly-N-changed + 0-failed + all-test-files-collected + no `.skip`/`.todo` added → every absent test is accounted-for generated shrinkage).
- `npm run build` exit 0 before every commit.
- The **pre-commit hook** (`.githooks/pre-commit` → `scripts/quick-regression-check.sh`, reads `.test-count-baseline.json` `total`) — NEVER bypass it, NEVER `--no-verify`, NEVER push to `main`. Stay on `feat/iter-41-sprint-u-cycle-2-real-user-fix`.
- NEVER `git add -A` — the concurrent autonomous loop modifies `AGENTS.md` + `automa/state/*`; stage specific files, check `git diff --cached --stat` before every commit, confirm no loop-owned file sneaks in.
- **A concurrent autonomous loop is active in this repo.** It commits on its own and modifies the working tree. Treat the working tree as shared — verify provenance before committing anything you did not author. Do NOT `git stash` (iter 56: the loop modified `automa/state/*` under a stash → pop conflict).
- Score/test-count/claim statements: cite ONLY numbers you just saw in `vitest`/`build`/`Codex` output — never from memory. No score > 7.5, no "done", no "verified" without the recursive loops in §4 closing.

---

## §3 — iter-56 state hand-off (authoritative — read these files)

**EPIC 1 progress: A1 + A2 + A3 done; A4 spec'd; A4.1a + A4.1b + A4.1c DONE. A4.1d + A4.1e remain.**

### A4.1c — DONE (8 iter-56 commits `91e36709..f043f82c`, all pushed):
| commit | what |
|---|---|
| `91e36709` | A4.1c design spec |
| `d8422444` | A4.1c implementation plan |
| `8613aba6` | A4.1c recon (Step 4 corrected mid-iter — see close audit) |
| `d3b88f72` | gate fix — `pending-consolidation` fires only while the source file exists |
| `e8166ef2` | archive — `scripts/epic1/consolidated-into-named-id/` (2 JSON + MANIFEST) |
| `bee5e627` | **apply** — consolidate esp3→morse, esp5→semaforo, 51 files |
| `ad2bc106` | A3 verdict correction — Vol2 Cap.11 is pure theory (A4.1c implementation tail) |
| `f043f82c` | iter-56 close docs — close audit + this iter-57 activation prompt (HEAD) |

### iter-56 close state (CoV — independently verified by Claude re-runs + Codex):
- `npx vitest run` = **13106 passed / 0 failed**. `npm run build` = exit 0. `validate-lesson-paths.mjs` = **0 `pending-consolidation`** (94 checked · 64 pass · 30 fail).
- `git grep "v3-cap6-esp3\|v3-cap6-esp5" src/` → empty. The 2 numbered ids are fully consolidated; their files are archived under `scripts/epic1/consolidated-into-named-id/`.
- Vol2 Cap.11 confirmed pure theory (Claude + Codex) — A3 verdict corrected, **0** `v2-cap11-*` authored.

### ⚠️ REGRESSION introduced by A4.1c — iter-57 #1 task:
`src/data/capitoli/v3-cap6.json` `narrative_flow.transitions` now contains a **`semaforo ↔ morse` 2-cycle**: the post-consolidation chain is `esp1→esp2→morse→esp4→semaforo→morse→semaforo` (transitions 5 `[semaforo,morse]` + 6 `[morse,semaforo]`). Pre-A4.1c it was a linear 7-node chain. The mechanical REPOINT-ID was correct per the recon, but esp5 collapsed *into* semaforo so the old tail `esp5→morse→semaforo` became a cycle. Breaks no test/build/gate, but violates the §1 "arco narrativo continuo" mandate. The likely correct Ch6 chain is `esp1→esp2→morse→esp4→semaforo→[Ch7-first]` with transitions 5+6 removed/repaired — but that is an A4.1d re-thread *design* decision; do the recon first, do not improvise.

### A4.1d work-list (the validation gate's 30 fails + iter-56 carryover):
1. **`v3-cap6.json` narrative_flow cycle** (above) — #1 priority.
2. **Dangling-ref set — 6 files / ~11 concrete refs** (per the A4.1b MANIFEST `scripts/epic1/removed-no-volume-counterpart/MANIFEST.md`, but the MANIFEST under-enumerates — see below). Surviving lesson-paths referencing removed ids: `v3-cap6-semaforo`→`v3-cap6-esp6`, `v3-cap7-esp3`→`v3-cap7-esp4`, `v3-cap7-esp6`→`v3-cap7-esp7`, `v3-cap8-esp3`→`v3-extra-lcd-hello` AND `v3-cap8-esp3` ALSO has a 2nd dangling ref `prerequisites→v3-cap6-esp6` (`v3-cap8-esp3.json:66` — Codex-caught iter-56 close audit; the MANIFEST + the original 6-file table missed this 2nd ref), `v3-cap7-esp2`→`v3-cap6-esp6`, `v3-cap8-esp1`→`v3-cap7-esp8`. **The recon for this MUST `git grep` every removed id (`v3-cap6-esp6`, `v3-cap6-esp7`, `v3-cap7-esp4/5/7/8`, `v3-cap7-mini`, `v3-cap8-esp4/5`, `v3-cap8-serial`, `v3-extra-*`) across ALL `src/` files and enumerate EVERY concrete ref (`next_experiment.id` + `next_suggested` + every `prerequisites[]` entry) — do NOT assume one ref per file.**
3. **6 `action:correct` per-field fixes** in `scripts/epic1/a3-corrections.json` — entries with `"action": "correct"` (v2-cap12-esp1, v3-cap6-esp1, v3-cap7-esp2, v3-cap7-esp6, v3-cap8-esp1, v3-cap8-esp2) — apply the corrected title/page/chapter/nextId to the lesson-path files.
4. **Survivor-title divergences** — `keep`-entry lesson-paths whose title diverges from the contract.
5. **`morse` forward link** — `v3-cap6-morse` lacks a `next_experiment` (it should continue the Ch6 arc).
6. **Minor:** `.test-count-baseline.json` `commit` field is stale (`a1d0a98`, should track the latest baseline-changing commit).
7. The free-prose `LEAVE-A4.1d` items listed in `docs/audits/2026-05-14-epic1-a4-1c-recon.md` (the `next_preview` / `resume_message` / transition `text_classe` narrative prose for the consolidated experiments).

### Key artifacts to read:
| Artifact | Path | Why |
|---|---|---|
| iter-56 close audit | `docs/audits/2026-05-14-iter-56-close-audit.md` | the honest iter-56 state, the regression, the process lessons |
| A4.1c recon (corrected) | `docs/audits/2026-05-14-epic1-a4-1c-recon.md` | the LEAVE-A4.1d list + Note D (the cycle origin) + the corrected Step-4 method (study `b0f9efa3` as template) |
| The correction contract | `scripts/epic1/a3-corrections.json` | 94 entries: `keep` / `correct` (6, A4.1d) / `remove` (13, done) / `consolidate` (2, done) |
| A4.1c-a3-1a work-list | `docs/audits/2026-05-14-epic1-a4-1a-contract-validation.md` | run the gate to regenerate; the 30 fails = the A4.1d work-list |
| The validation gate | `scripts/epic1/validate-lesson-paths.mjs` | `node scripts/epic1/validate-lesson-paths.mjs` |
| A4 spec | `docs/superpowers/specs/2026-05-14-epic1-a4-volume-parity-spec.md` | R1 (1:1 inventory), R2 (per-field fidelity — A4.1d), R3 (narrative_map — A4.1e) |
| A4.1b MANIFEST | `scripts/epic1/removed-no-volume-counterpart/MANIFEST.md` | the canonical 6-file dangling-ref table |
| A3 master verdict (corrected) | `docs/audits/2026-05-14-epic1-a3-MASTER-verdict.md` | the per-volume verdicts; Cap.11 Open decision 6 (theory-node → A4.1e) |
| ADR-047 | `docs/adrs/ADR-047-narrative-arc-canon-tea-schema-adoption.md` | EPIC 1 strategy |

---

## §4 — iter 57 work + workflow

### P0 — A4.1d: re-thread + per-field fidelity
Fix the 7 items in the §3 A4.1d work-list, **#1 first** (the `v3-cap6.json` cycle). Exit criterion: the validation gate's 30 fails drop to 0 (or only documented-deferred items remain); `v3-cap6.json` narrative_flow is acyclic; no dangling ref to any removed id anywhere in `src/`; vitest 0-failed; build exit 0.

### P1 — A4.1e: regenerate the narrative structure
Rebuild `narrative_map` / `chapter-map.js` / `lesson-groups.js` from the volumes + the contract (22 corrected chapter titles). Decide the Vol2 Cap.11 theory-node question (A3 verdict Open decision 6). Per ADR-047 + the A4 spec R3.

### Method — skill chain (mandatory)
`/make-plan` (or `brainstorming` → `writing-plans`) → `subagent-driven-development` with **opus** subagents (no sonnet) → at EVERY checkpoint, both recursive loops below. Reuse the A4.1b/A4.1c staging discipline: recon-first (and the recon MUST trace full chains, not just grep id literals — iter 56's recon missed the cycle because it greped instead of tracing), archive-before-destruct, CoV gates, honest commits. Run the activation prompt itself through `/llm-application-dev:prompt-optimize` if refining it.

### USE CODEX CONSTANTLY — mandate, not optional. Claude and Codex must interact and confront each other.
Codex GPT-5.5 via `scripts/dev/codex-bg.sh <task> --profile verify "<4-element prompt: GOAL / CONTEXT (@file mentions) / CONSTRAINTS (read-only, cite file:line) / DONE (concrete verifiable criterion)>"` is the **anti-inflation + anti-regression backbone**. Single-line prompts return useless file dumps — the 4-element structure is mandatory. Run Codex in **PARALLEL** with your own work, on EVERY non-trivial step: after recon, after the plan, after each subagent task, before EVERY commit, after EVERY claim/score/count. Codex is NOT a pre-commit afterthought. Save every Codex output (`/tmp/codex-*.txt`) as an auditable artifact and reference it in the close audit. Note Codex's known weakness: it returns grep-dumps instead of synthesis for broad "verify X is exhaustive" prompts — when that happens, cross-check the dump manually; do not treat the dump as a verdict.

### Recursive anti-inflation loop — every claim, every score
No claim — "done", "verified", "N tests pass", "score X", "Δ accounted for", "no regression" — is ever Claude's self-assessment alone. The loop: (1) Claude states the claim + evidence; (2) Codex independently re-derives the SAME claim from the actual code/output — NOT from Claude's report; (3) if Codex disagrees → Claude investigates (does NOT dismiss) → revise → **GOTO 2** until convergence; (4) the accepted value = the Claude ∩ Codex intersection — when they differ, the **more skeptical** value wins; (5) Codex's output is copied into the close audit. iter 56 proved this works: Codex caught the `v3-cap6.json` cycle that the recon Note D had under-stated. No "done" without this loop closing.

### Recursive anti-regression loop — every change, every commit
Every change is gated by ALL FOUR: (a) `npx vitest run` 0-failed, (b) `npm run build` exit 0, (c) `node scripts/epic1/validate-lesson-paths.mjs`, (d) a Codex diff-review. **Recursive** = if ANY gate fails, fix → re-run ALL FOUR (a fix can introduce a regression elsewhere). Re-baseline the test count ONLY with an arithmetic proof. NEVER `--no-verify`, NEVER bypass the pre-commit hook, NEVER push to `main`.

### Self-review before any commit
`git diff --cached --stat` contains ONLY files you authored or Codex-verified (no `AGENTS.md`, no `automa/state/*`)? vitest 0-failed? build exit 0? gate clean? Codex agrees with the claim? Any test-count change carries an arithmetic proof? If any answer is no → do not commit. Commit per task (frequent commits); push to origin at each gate-green checkpoint.

### NON COMPIACERE
Honesty over comfort. No inflated scores. Name what is not proven and what is not done. iter 56's close audit names a regression it introduced — that honesty is the standard.

---

## Activation string (paste-ready, prompt-optimized)

```
Continua ELAB Tutor iter 57. Working dir: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder, branch feat/iter-41-sprint-u-cycle-2-real-user-fix.

━━ TL;DR ━━
COSA: A4.1d (re-thread + per-field fidelity), poi A4.1e (rigenera narrative structure). PERCHÉ: EPIC 1 — parità stretta volumi↔kit↔software, arco narrativo continuo (Morfismo Sense 2). PRIMA AZIONE: §0 entrance sequence sotto, in ordine, zero skip. REGOLA D'ORO: ogni claim passa il loop Codex; ogni modifica passa i 4 gate. MAI --no-verify, MAI push su main, MAI git stash, MAI git add -A.

━━ §0 ENTRANCE SEQUENCE (in ordine, no skip) ━━
1. Leggi docs/handoff/2026-05-14-iter-57-activation.md INTERO (questo file ne è l'estratto).
2. Branch + Codex: git branch --show-current = feat/iter-41-sprint-u-cycle-2-real-user-fix; ls ~/.npm-global/bin/codex && ~/.npm-global/bin/codex --version = codex-cli 0.128.0 (scripts/dev/codex-bg.sh usa path assoluto, funziona anche se `which codex` fallisce; se il binario manca davvero → ripristinarlo è il primo sub-task).
3. git status: atteso pulito tranne AGENTS.md + automa/state/* (loop autonomo concorrente — NON tuoi, MAI stagiarli). Diff grosso inatteso in src/ o tests/ → indaga provenienza prima di toccare. MAI git stash (il loop modifica automa/state/* sotto lo stash → pop in conflitto, iter 56 l'ha colpito).
4. Pre-flight CoV (gate d'ingresso, OBBLIGATORIO): npx vitest run = 13106 passed / 0 failed · npm run build exit 0 · node scripts/epic1/validate-lesson-paths.mjs = 0 pending-consolidation (94 checked · 64 pass · 30 fail = work-list A4.1d). Se uno è rosso → STOP e riporta, NON "aggiustare" toccando i test.
5. /mem-search per ri-ancorarti: "EPIC 1 narrative arc parità volumi kit elabtutor", "A4.1d re-thread dangling refs per-field correct", "Morfismo Sense 2 triplet".
6. Leggi la cartella TEA: /Users/andreamarro/VOLUME 3/TEA/ + /Nuovo lavoro tea/. Si PARTE dal lavoro di Tea: schema 7-step canonico (struttura); metadata bookText/citation/analogy canonici SOLO Vol 1+2; narrative_map + Vol3 bookText INAFFIDABILI. Volumi fisici (CONTENUTI/volumi-pdf/) = unica fonte di verità.
7. Leggi lo stato iter-56: §3 del file handoff + docs/audits/2026-05-14-iter-56-close-audit.md.

━━ MANDATO ANDREA (il PERCHÉ, ripetuto molte volte) ━━
Gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate (anti-pattern attuale elabtutor). Parità totale: volumi cartacei (Davide) ↔ kit fisici Omaric ↔ software elabtutor — stessa narrativa, stesso ordine, stessi nomi, stesse pagine, stesse transizioni cliffhanger. Morfismo Sense 2 = il moat non copiabile. Regola operativa: parità stretta. Un narrative_flow con un CICLO viola questo mandato — è il task #1 di iter 57.

━━ LAVORO iter 57 ━━
P0 — A4.1d (re-thread + per-field fidelity), in ordine:
  #1 Il ciclo narrative_flow in src/data/capitoli/v3-cap6.json (semaforo↔morse, introdotto da A4.1c — close audit §REGRESSION). Catena attuale: esp1→esp2→morse→esp4→semaforo→morse→semaforo. Va resa aciclica (probabile: esp1→esp2→morse→esp4→semaforo→[Ch7], transizioni 5+6 rimosse/riparate) — ma è decisione di RE-THREAD, fai recon prima, non improvvisare.
  #2 Dangling-ref a id rimossi: 6 file / ~11 ref concrete (MANIFEST scripts/epic1/removed-no-volume-counterpart/MANIFEST.md SOTTOSTIMA — es. v3-cap8-esp3.json ha 2 ref: next_experiment→v3-extra-lcd-hello E prerequisites→v3-cap6-esp6, Codex-caught). Il recon DEVE git grep OGNI id rimosso (v3-cap6-esp6/esp7, v3-cap7-esp4/5/7/8, v3-cap7-mini, v3-cap8-esp4/5, v3-cap8-serial, v3-extra-*) su TUTTO src/ ed enumerare OGNI ref concreta (next_experiment.id + next_suggested + ogni prerequisites[]) — NON assumere una ref per file.
  #3 I 6 action:correct per-field in scripts/epic1/a3-corrections.json (title/page/chapter/nextId → lesson-path files).
  #4 Survivor-title divergences (keep-entry con title divergente dal contract).
  #5 Forward link mancante di v3-cap6-morse.
  #6 .test-count-baseline.json campo "commit" stale.
  #7 Free-prose LEAVE-A4.1d (docs/audits/2026-05-14-epic1-a4-1c-recon.md).
  Exit A4.1d: gate 30 fail → 0, narrative_flow aciclico, zero dangling ref in src/, vitest 0-failed, build exit 0.
P1 — A4.1e: rigenera narrative_map / chapter-map.js / lesson-groups.js dai volumi + contract (22 chapter title corretti); decidi il nodo-teoria Cap.11 (A3 verdict Open decision 6).
METODO: /make-plan (o brainstorming → writing-plans) → subagent-driven-development con subagent OPUS (no sonnet). Recon-first — e il recon DEVE TRACCIARE LE CATENE COMPLETE, non solo grep-are gli id literal (iter 56 il recon ha mancato il ciclo proprio perché ha grep-ato invece di tracciare).

━━ USA CODEX TANTISSIMO — mandate, non opzionale. Claude e Codex DEVONO interagire e confrontarsi ━━
Strumento: scripts/dev/codex-bg.sh <task> --profile verify "<prompt 4-elementi: GOAL (1 frase) / CONTEXT (@file + convenzioni) / CONSTRAINTS (read-only, cita file:line) / DONE (criterio verificabile concreto)>". Prompt monoriga = file-dump inutile.
QUANDO: in PARALLELO al tuo lavoro, su OGNI step non banale — dopo recon, dopo il piano, dopo ogni subagent, prima di OGNI commit, dopo OGNI claim/score/count. NON un afterthought pre-commit.
DEBOLEZZA NOTA Codex: su prompt "verifica che X sia esaustivo" restituisce grep-dump invece di sintesi → cross-check manuale, NON trattare il dump come verdetto.

LOOP RICORSIVO ANTI-INFLAZIONE (ogni claim/score/count/"done"):
  1) Claude dichiara claim + evidenza. 2) Codex ri-deriva lo STESSO claim dal codice/output reale (NON dal report di Claude). 3) Se Codex dissente → Claude INDAGA (non liquida, non si difende) → rivede → GOTO 2 fino a convergenza. 4) Valore accettato = intersezione Claude∩Codex; quando divergono vince il PIÙ SCETTICO. 5) Output Codex salvato in /tmp/codex-*.txt come artefatto auditabile, citato nel close audit.
  Prova che funziona: iter 56 Codex ha catturato il ciclo v3-cap6.json che il recon aveva sottostimato. Nessuno score >7.5, nessun "done", nessun "0 regressioni" senza chiudere il loop.

LOOP RICORSIVO ANTI-REGRESSIONE (ogni modifica/commit):
  Gate su TUTTI E QUATTRO — (a) npx vitest run 0-failed (baseline 13106), (b) npm run build exit 0, (c) node scripts/epic1/validate-lesson-paths.mjs, (d) Codex diff-review. RICORSIVO = se UN gate fallisce → fix → ri-esegui TUTTI E QUATTRO (un fix può rompere altrove). Re-baseline conteggio test SOLO con prova aritmetica (metodo A4.1b/A4.1c: esattamente-N-cambiati + 0-failed + tutti-i-file-collected + nessun .skip/.todo aggiunto).

━━ FAILURE MODE viste in iter 56 — riconoscile e correggi così ━━
- Subagent che dichiara stato git ("HEAD è X", "asserts 94") → NON fidarti, verifica con git log/reflog/grep TUO prima di agire (iter 56: 2 subagent hanno mis-letto).
- Recon che grep-a id literal invece di tracciare catene → manca i cicli/emergent issues. Il recon DEVE tracciare.
- Codex CONFIRM su una claim ristretta NON copre claim adiacenti (iter 56: il CONFIRM sul reference-surface non copriva lo Step-4 test-impact). Verifica COSA Codex ha effettivamente confermato.
- Pre-commit hook che blocca su count sceso → il fix è re-baseline CON prova aritmetica, NON --no-verify.

━━ NON COMPIACERE ━━
Onestà sopra la comodità. Niente score gonfiati. Nomina esplicitamente ciò che non è dimostrato e ciò che non è fatto. Se Codex o un gate ti contraddice, è un regalo, non un ostacolo. Il close audit iter 56 nomina una regressione che iter 56 ha introdotto — quella onestà è lo standard, non l'eccezione.
```

---

## Prompt-optimization report (iter-57 activation string)

Optimized via `/llm-application-dev:prompt-optimize`. Changes applied vs the first draft:
- **TL;DR header** — front-loads cosa/perché/prima-azione/regola-d'oro so the session orients in 4 lines before the detail.
- **Numbered §0 with inline rationale** — each entrance step now carries its *why* + the failure it prevents (e.g. "MAI git stash → il loop modifica automa/state/* sotto lo stash").
- **Codex section restructured** — split into STRUMENTO / QUANDO / DEBOLEZZA NOTA + the two recursive loops as explicit numbered procedures (was prose). The anti-inflation loop now spells out all 5 steps including "vince il più scettico".
- **NEW: Failure-mode block** (constitutional-AI self-check pattern) — the 4 concrete failure modes iter 56 actually hit, each paired with the corrective action. This is the highest-value add: it converts iter-56's lessons into pre-loaded guardrails.
- **A4.1d work-list made concrete + ordered** — 7 numbered items with the exact cycle state quoted, so no re-discovery needed.
- Kept paste-ready, single fenced block, no content dropped from §0 / the Andrea mandate / the work-list. Token cost ~+25% for materially higher compliance density.
