# ELAB Tutor — iter 56 activation prompt

> Continuation hand-off from iter 55. Branch: `feat/iter-41-sprint-u-cycle-2-real-user-fix`.
> Paste the **Activation string** (bottom of this file) into a fresh Claude Code session, or paste this whole file.
> iter 55 closed clean: **A4.1b is DONE** (removal verified + committed `b0f9efa3`). iter 56 starts A4.1c.

---

## Role

You are continuing autonomous work on **ELAB Tutor** — an educational electronics platform for kids 8-14 (kit fisici Omaric + 3 volumi cartacei Davide + software). You are mid-EPIC-1: aligning the software's experiment definitions to the printed volumes (Morfismo Sense 2). iter 55 completed **A4.1b** — the staged removal of the 13 Vol 3 experiments with no printed counterpart. iter 56 continues with **A4.1c** (consolidate duplicates / collapse over-splits / add the missing Vol 2 Cap.11).

---

## §0 — Entrance sequence (do these FIRST, in this exact order — do not skip, do not reorder)

1. **Confirm working dir + branch + Codex.** `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"`, `git branch --show-current` → must be `feat/iter-41-sprint-u-cycle-2-real-user-fix`. `git log --oneline -10` → the iter-55 tail ends at `c9f6c5cf`. Then `which codex && codex --version` — Codex GPT-5.5 is **mandatory** for iter 56 (see §6). iter 55's env had `codex not found`; it ran fine in iter 41-43 (CLI 0.128.0), so it is a PATH/install issue. **If `codex` is missing, restoring it is iter-56's FIRST sub-task** (check `~/.codex/config.toml`, PATH, the install method) — do not proceed deep into A4.1c without Codex working, only the manual fallback if it genuinely cannot be restored.
2. **`git status`.** Expect a clean tree EXCEPT a handful of files left modified by the concurrent autonomous loop (`AGENTS.md`, `automa/state/*`) — those are NOT yours, leave them. If you see a large unexpected diff, the autonomous loop is mid-task — investigate provenance before touching anything (§5).
3. **Pre-flight CoV (entrance gate — MANDATORY before any change).** `npx vitest run` → must be **13273 passed, 0 failed** (the iter-55 post-A4.1b baseline). `npm run build` → exit 0. If either is red → STOP and report — do not "fix" by touching tests. (Note: 13273, not the old 14367 — A4.1b legitimately removed the 13 experiments' generated tests; both `.test-count-baseline.json` `total` and `automa/baseline-tests.txt` are re-baselined to 13273.)
4. **`/mem-search` to recover context.** Run the claude-mem `search` tool with queries: `"EPIC 1 narrative arc parità volumi kit elabtutor"`, `"A4.1c consolidate collapse Cap.11"`, `"A3 master verdict repo book-faithful"`, `"Morfismo Sense 2 triplet"`. The corpus is stale (~April) — background only; the authoritative iter-55 state is the files in §3.
5. **Read Tea's work — START HERE.** Read `/Users/andreamarro/VOLUME 3/TEA/` and `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/`. Tea (Teodora De Venere) produced the canonical blueprint: `standard_experiment_schema.json` (the 7-step experiment schema), `narrative_map.json`, `narrative_metadata_94.json`, `cliffhanger_table.json`, `bibbia_stilistica.pdf`, the fumetti deliverables. iter 54 vendored the 3 canonical JSONs into `scripts/epic1/tea-canon/`. **Authoritative use of Tea's deliverables** (per the iter-54 A3 verdict): her **7-step schema structure** is canon; her `bookText`/`success_citation`/`analogy` metadata is verbatim-verified and canon **for Vol 1 + Vol 2 only**; her `narrative_map` chapter titles + `nextId` chains are **unreliable** (16/22 chapter titles wrong); her Vol 3 `bookText` is **fabricated** (0/29 verbatim) — do not use it. The physical volumes (`CONTENUTI/volumi-pdf/`) are the source of truth.
6. **Read the iter-55 state hand-off** — every file in §3.

---

## §1 — Anti-regression (HARD CONSTRAINTS — non-negotiable, FERREO)

- `npx vitest run` must end **0-failed** before AND after every change. A test that *fails* is a regression → REVERT. A test that legitimately *disappears* because its source data was removed is expected — but only ever re-baseline the count *with an arithmetic proof* (A4.1b's proof method: confirm exactly-N-removed + 0-failed + all-files-collected + no-`.skip`-added → every absent test is accounted-for generated shrinkage).
- `npm run build` exit 0 before every commit.
- The **pre-commit hook** (`.githooks/pre-commit` → `scripts/quick-regression-check.sh`, reads `.test-count-baseline.json` `total`) — NEVER bypass it, NEVER `--no-verify`, NEVER push to `main`. Stay on `feat/iter-41-sprint-u-cycle-2-real-user-fix`.
- NEVER `git add -A` blindly — stage specific files, check `git diff --cached --stat` before every commit, confirm no `AGENTS.md` / `automa/state/*` (autonomous-loop files) sneak in.
- **A concurrent autonomous loop is active in this repo.** It commits on its own and modifies the working tree. In iter 55 it executed A4.1b's removal in the working tree uncommitted; iter 55 verified it rigorously and committed it (`b0f9efa3`). Treat the working tree as shared — verify provenance before committing anything you did not author; the verification infrastructure (recon + gate + CoV) exists precisely so work is provable independent of who typed it.
- Score/test-count claims: cite ONLY numbers you just saw in `vitest`/`build` output — never from memory.

---

## §2 — The recurring Andrea mandate (verbatim — this is the WHY of all of EPIC 1)

> **Gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate (anti-pattern attuale elabtutor). Ci deve essere parità totale: volumi cartacei (Davide) ↔ kit fisici Omaric ↔ software elabtutor. Stessa narrativa, stesso ordine, stessi nomi, stesse pagine, stesse transizioni cliffhanger inter-esperimento. Questo è Morfismo Sense 2 — il differenziatore competitivo non copiabile.**

Operating rule, ratified: **parità stretta** — the software experiment inventory must exactly equal the *current* printed volume inventory. Nothing ships that is not in the printed volume; what the volume has and the software lacks gets added; over-splits/duplicates collapse to 1:1. Every iter-56 decision is measured against this. **Run `/mem-search` for `"EPIC 1 narrative arc parità volumi kit elabtutor"` at the start to re-anchor — Andrea has stated this many times across sessions and it governs the whole epic.**

---

## §3 — iter-55 state hand-off (authoritative — read these files)

**EPIC 1 progress: A1 + A2 + A3 done; A4 spec'd; A4.1a done; A4.1b DONE + committed.**

### A4.1b — COMPLETE (8 iter-55 commits, on top of `9091fa18`):
| Commit | What |
|---|---|
| `efa41aa3` | A4.1b spec — `docs/superpowers/specs/2026-05-14-epic1-a4-1b-staged-removal-design.md` |
| `fa567b3a` | A4.1b implementation plan — `docs/superpowers/plans/2026-05-14-epic1-a4-1b-staged-removal.md` |
| `473c84b8` | A4.1b recon (exact-edit artifact) — `docs/audits/2026-05-14-epic1-a4-1b-recon.md` |
| `7b5669e9` | A4.1b plan amendment (recon findings) |
| `36121f8f` | Gate bug-fix — `validate-lesson-paths.mjs` `pending-removal` now fires only while the file exists (+1 test). Real iter-54 bug. |
| `2a5cd14e` | A4.1b archive — `scripts/epic1/removed-no-volume-counterpart/` (15 JSON copies + `MANIFEST.md`). Git-recoverable. |
| `bddfade2` | (superseded) earlier draft of this activation doc |
| `b0f9efa3` | **A4.1b removal** — 13 Vol3 experiments removed from every `src/` data source. 89 files, 690 ins / 9968 del. |

### A4.1b removal — CoV evidence (verified at iter-55 close before commit):
- **Exactly 13 removed**: `experiments-vol3.js` = 16 objects (29 − 13); `lesson-paths/index.js` = 81 imports + 81 registry (94 − 13); the 13 gone, all survivors present.
- **vitest** 13273 passed / **0 failed** / 323-of-325 files collected / 15 skip + 12 todo (skip+todo identical to the pre-removal 14367 state). `ALL_EXPERIMENTS === 81` asserted by a passing test.
- **build** exit 0. **gate** 0 `pending-removal`. **core `simulator/engine/` untouched.** **zero `.skip`/`.todo`/`xit` added** to tests (no test weakened — deleted test blocks were dedicated assertions for removed ids).
- The 1094-test drop (14367 → 13273) is fully accounted for as legitimate generated-test shrinkage. The recon's `Δgenerated` decomposition method was infeasible (under-counted ~40+ generated suites) — proof closed instead by the direct method above.
- **Codex Pattern V** could not be run (codex CLI not installed) — substituted with a direct `grep src/` (only the documented A4.1d danglers remain).

### Deferred to A4.1d (documented in `removed-no-volume-counterpart/MANIFEST.md`):
6 surviving lesson-paths still reference a removed id — the recon's "4" was a `next_experiment`-only count; the real surface is 6 files / ~10 refs:

| surviving lesson-path | removed id referenced | field(s) |
|---|---|---|
| `v3-cap6-semaforo` | `v3-cap6-esp6` | `next_experiment.id` + `next_suggested` |
| `v3-cap7-esp3` | `v3-cap7-esp4` | `next_experiment.id` + `next_suggested` |
| `v3-cap7-esp6` | `v3-cap7-esp7` | `next_experiment.id` + `next_suggested` |
| `v3-cap8-esp3` | `v3-extra-lcd-hello` | `next_experiment.id` + `next_suggested` |
| `v3-cap7-esp2` | `v3-cap6-esp6` | prerequisite-style array |
| `v3-cap8-esp1` | `v3-cap7-esp8` | prerequisite-style array |

These do NOT break vitest/build (no test asserts target-resolution). A4.1d must clear all 6 and re-confirm the "deferral-safe" verdict for `next_suggested` + the prerequisite arrays.

### Key artifacts to read:
| Artifact | Path | Why |
|---|---|---|
| The correction contract | `scripts/epic1/a3-corrections.json` | source of truth — 94 entries: 73 `keep`, 6 `correct`, 13 `remove` (done), **2 `consolidate`** (A4.1c) |
| A4.1a work-list | `docs/audits/2026-05-14-epic1-a4-1a-contract-validation.md` | run the gate to regenerate; post-A4.1b = 94 checked / 62 pass / 32 fail (0 pending-removal; remaining fails = `correct` titles + 2 `consolidate` + the survivor-title divergences) |
| The validation gate | `scripts/epic1/validate-lesson-paths.mjs` | `node scripts/epic1/validate-lesson-paths.mjs` — 0 `pending-consolidation` is A4.1c's exit criterion |
| A4 spec | `docs/superpowers/specs/2026-05-14-epic1-a4-volume-parity-spec.md` | R1 (1:1 inventory), R2 (per-field fidelity), R3 (narrative_map) |
| A4.1b plan + spec | `docs/superpowers/plans/2026-05-14-epic1-a4-1b-staged-removal.md` + spec | reference for the A4.1c/d/e roadmap section + the staging discipline pattern to reuse |
| ADR-047 | `docs/adrs/ADR-047-narrative-arc-canon-tea-schema-adoption.md` | EPIC 1 strategy; D1 reversed by A3 (physical volumes canon, not Tea's narrative_map) |
| A3 master verdict | `docs/audits/2026-05-14-epic1-a3-MASTER-verdict.md` | 74/94 repo-faithful; the 2 Vol3 duplicate ids; the Ch7/Ch8 over-splits; the Vol2 Cap.11 gap |

---

## §4 — iter 56 work: A4.1c (and onward)

**P0 — A4.1c: consolidate + collapse + add.** Per the A4.1b plan's A4.1b–e roadmap + the A4 spec R1:
- **Consolidate** the 2 Vol 3 duplicate ids: `v3-cap6-esp3` → `v3-cap6-morse`, `v3-cap6-esp5` → `v3-cap6-semaforo` (keep the named id, fold the numbered one in). `a3-corrections.json` marks these `action:consolidate` with `consolidateInto`.
- **Collapse** the Vol 3 Ch7/Ch8 over-splits to the volume's real experiment-block count (A3 master verdict has the real counts).
- **Add** the missing Vol 2 Cap.11 "I diodi" lesson-paths (the chapter exists in the printed volume with experiments but has zero software lesson-paths). Open question from the A4 spec: does Davide supply the canonical Cap.11 experiment list, or does A4 extract it from the volume text? — surface this to Andrea.
- **Exit criterion:** `node scripts/epic1/validate-lesson-paths.mjs` shows 0 `pending-consolidation`; Cap.11 lesson-paths exist; vitest 0-failed (re-baseline only with an arithmetic proof); build exit 0.
- **Method:** `brainstorming` → `writing-plans` → `subagent-driven-development` with **opus** subagents (no sonnet). Reuse the A4.1b staging discipline: recon-first, archive-before-destruct, CoV gates, honest commit messages. Consolidation is trickier than removal (it MERGES data, not just deletes) — the recon must map exactly what each numbered id carries that the named id lacks.

**P1 — A4.1d: re-thread + per-field fidelity.** Clear the 6-file dangling-ref set (§3). Apply the 6 `action:correct` per-field title/page/chapter/nextId fixes from `a3-corrections.json`. Apply the surviving-experiment title divergences flagged in the gate work-list.

**P2 — A4.1e: regenerate the narrative structure.** Rebuild `narrative_map` / `chapter-map.js` / `lesson-groups.js` from the volumes + the contract (22 corrected chapter titles).

Then A4.2 (`steps` authoring — the 7-step block per experiment), A5 (PZ-V3 validator), A6 (Modalità Percorso UI) per ADR-047.

---

## §5 — Known environmental issues (do not be surprised by these)

- **A concurrent autonomous loop is active in this repo.** It commits on its own, creates `auto/*` branches, and modifies the working tree (it executed A4.1b's removal uncommitted in iter 55). It leaves `AGENTS.md` + `automa/state/*` modified. Always check provenance before committing; never assume the working tree is yours alone; never blind-`git add -A`.
- **`codex` CLI was not on PATH in iter 55** — `which codex` → not found, though `scripts/dev/codex-bg.sh` exists and Codex CLI 0.128.0 ran in iter 41-43. This is a PATH/install issue, NOT a permanent gap. §6 makes restoring Codex iter-56's first sub-task — Codex use is mandated throughout iter 56, manual fallback only if restoration genuinely fails.
- **Two baseline files, both `13273`:** the pre-commit hook reads `.test-count-baseline.json` `total`; `automa/baseline-tests.txt` is CI-side + treated as canonical by CLAUDE.md. Keep both in sync; only move them with an arithmetic proof.
- **`block-console-log` hookify rule** blocks Edit/Write on ANY content containing the literal `console.log(` regardless of path — false-positives on legitimate `scripts/*.mjs` reporters. Workaround: write such files via Bash heredoc, then `node --check`.
- macOS bash 3.2: no `timeout`/`gtimeout`; do not use `set -u` with empty-array expansion.

---

## §6 — Workflow

### Codex GPT-5.5 — use it CONSTANTLY (mandate, not optional)

Codex GPT-5.5 — via `scripts/dev/codex-bg.sh <task-name> --profile verify "<4-element prompt>"`, output `/tmp/codex-<task-name>.txt` — is the independent second pair of eyes and the **anti-inflation + anti-regression backbone of iter 56**. Use it as heavily as possible — NOT a pre-commit afterthought. Run it in parallel with your own work, on every non-trivial step:
- after recon → Codex verifies the recon is exhaustive (no missed reference, no wrong line range)
- after a plan → Codex sanity-checks the plan against the spec
- after each implementation step / each subagent task → Codex cross-checks the diff
- before EVERY commit → Codex verifies the diff for regressions AND independently re-derives the claim
- after any "done" / score / count claim → Codex re-derives it from the actual code/output

A **4-element prompt is mandatory** (GOAL: one sentence / CONTEXT: @file mentions + conventions / CONSTRAINTS: read-only, cite file:line / DONE: concrete verifiable criterion) — single-line prompts return useless file dumps. Reference: `docs/dev/CODEX-WORKFLOW.md` + `.codex/AGENTS.md`. If `codex` is unavailable and cannot be restored (see §0.1), the fallback is an *independent* re-derivation (`grep` + `vitest` + `build` done from scratch, not trusting your own prior output) — and you state "Codex unavailable, manual equivalent" explicitly every single time.

### Recursive anti-inflation loop — every claim, every score

No claim — "done", "verified", "N tests pass", "score X", "Δ accounted for" — is ever Claude's self-assessment alone. The loop:
1. Claude states the claim + the evidence.
2. Codex independently re-derives the SAME claim from the actual code/output — NOT from Claude's report.
3. If Codex disagrees → Claude revises → **GOTO 2** (the recursion — repeats until convergence).
4. The accepted value is the Claude∩Codex intersection — when they differ, the **more skeptical** value wins.
5. Codex's verification output (`/tmp/codex-*.txt`) is copied into the iter close audit/handoff doc, so the verification is itself auditable.
No score > 7.5 without this loop closing. No "done" without it. iter 54's A3 overturned its own A2 premise because the work was honest — that honesty is now *enforced by the loop*, not merely intended.

### Recursive anti-regression loop — every change, every commit

Every change is gated by ALL FOUR of: (a) `npx vitest run` 0-failed, (b) `npm run build` exit 0, (c) the validation gate (`node scripts/epic1/validate-lesson-paths.mjs`), (d) a Codex diff-review for regressions. **Recursive** = if ANY gate fails, you fix → **re-run ALL FOUR gates**, not just the one that failed — a fix can introduce a regression elsewhere, and partial re-checking is exactly how regressions slip through. Re-baseline the test count ONLY with an arithmetic proof (A4.1b's method: exactly-N-removed + 0-failed + all-files-collected + no-`.skip`/`.todo`-added → every absent test is accounted-for generated shrinkage). NEVER `--no-verify`, NEVER bypass the pre-commit hook, NEVER push to `main`.

### Skill chain
`using-superpowers` → `mem-search` (re-anchor on the §2 mandate) → `brainstorming` → `writing-plans` → `subagent-driven-development` (opus subagents only, no sonnet) → at EVERY checkpoint, both recursive loops above. `systematic-debugging` if any bug. `verification-before-completion` before any "done" claim.

### Self-review before any commit
Does `git diff --cached --stat` contain ONLY files you authored or Codex-verified? vitest 0 failed? build exit 0? gate clean? Codex agrees with the claim? Any test-count change carries an arithmetic proof? If any answer is no → do not commit.

---

## Activation string (paste-ready)

```
Continua ELAB Tutor iter 56. Working dir: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder, branch feat/iter-41-sprint-u-cycle-2-real-user-fix.

Leggi PRIMA docs/handoff/2026-05-14-iter-56-activation.md ed esegui §0 entrance sequence in ordine: (1) verifica branch + Codex (which codex && codex --version — Codex GPT-5.5 è OBBLIGATORIO iter 56; se manca, RIPRISTINARLO è il PRIMO sub-task — girava in iter 41-43, è un problema di PATH/install), (2) git status — atteso pulito tranne i file del loop autonomo (AGENTS.md, automa/state/* — NON tuoi, lasciali; se vedi un diff grosso inatteso, il loop è mid-task, indaga la provenienza), (3) pre-flight CoV — npx vitest run deve essere 13273 passed / 0 failed + npm run build exit 0 (se rosso STOP; 13273 è la baseline post-A4.1b, non più 14367), (4) /mem-search per il contesto, (5) leggi la cartella TEA (/Users/andreamarro/VOLUME 3/TEA/ + /Nuovo lavoro tea/) — si PARTE dal lavoro di Tea: schema 7-step canonico, metadata bookText/citation/analogy canonici SOLO per Vol 1+2, narrative_map e Vol3 bookText inaffidabili, (6) leggi lo stato iter-55 (§3: A4.1b COMPLETO — 8 commit, rimozione verificata + committata b0f9efa3 + le CoV evidence + i 6 file dangling deferiti ad A4.1d).

MANDATO RICORRENTE ANDREA (il PERCHÉ di tutto EPIC 1): gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate; parità totale volumi cartacei ↔ kit Omaric ↔ software elabtutor (Morfismo Sense 2). Regola operativa: parità stretta. Esegui /mem-search "EPIC 1 narrative arc parità volumi kit elabtutor" per ri-ancorarti — Andrea lo ha ripetuto molte volte.

ANTI-REGRESSIONI FERREO: npx vitest run 0-failed prima e dopo ogni modifica, build PASS prima di ogni commit, MAI --no-verify, MAI bypass pre-commit hook, MAI push su main, MAI git add -A cieco (loop autonomo concorrente attivo — committa da solo, verifica la provenienza, controlla git diff --cached --stat prima di ogni commit). Re-baseline del conteggio test SOLO con prova aritmetica.

LAVORO iter 56 P0: A4.1c — consolidate i 2 id duplicati Vol3 (v3-cap6-esp3→v3-cap6-morse, v3-cap6-esp5→v3-cap6-semaforo, action:consolidate in a3-corrections.json), collapse gli over-split Ch7/Ch8 al conteggio reale del volume, aggiungi i lesson-path mancanti Vol2 Cap.11 "I diodi" (chiedi ad Andrea se Davide fornisce la lista o si estrae dal volume). Exit: node scripts/epic1/validate-lesson-paths.mjs mostra 0 pending-consolidation. Metodo: brainstorming → writing-plans → subagent-driven-development con subagent opus (no sonnet), riusa la disciplina staged A4.1b (recon-first, archive-before-destruct, CoV gate, commit onesti). Poi A4.1d (re-thread 6 file dangling + 6 correct per-field), A4.1e (rigenera narrative_map).

USA CODEX TANTISSIMO (§6 — mandate, non opzionale): Codex GPT-5.5 via scripts/dev/codex-bg.sh <task> --profile verify "<prompt 4-elementi: GOAL/CONTEXT/CONSTRAINTS/DONE>" è la spina dorsale anti-inflazione + anti-regressione. Girarlo in PARALLELO al tuo lavoro su OGNI step non banale: dopo recon, dopo piano, dopo ogni step/subagent, prima di OGNI commit, dopo OGNI claim/score. NON un afterthought pre-commit.

LOOP RICORSIVO ANTI-INFLAZIONE (ogni claim/score): 1) Claude dichiara claim+evidenza, 2) Codex ri-deriva lo STESSO claim dal codice/output reale (non dal report di Claude), 3) se Codex dissente → Claude rivede → GOTO 2 (ricorsione fino a convergenza), 4) valore accettato = intersezione Claude∩Codex, vince il più scettico, 5) output Codex salvato come artefatto auditabile. Nessuno score >7.5 senza chiudere il loop. Nessun "done" senza.

LOOP RICORSIVO ANTI-REGRESSIONE (ogni modifica/commit): gate su TUTTI E QUATTRO — (a) vitest 0-failed, (b) build exit 0, (c) validation gate, (d) Codex diff-review. RICORSIVO = se UN gate fallisce, fix → ri-esegui TUTTI E QUATTRO (non solo quello fallito — un fix può introdurre regressione altrove). Re-baseline conteggio test SOLO con prova aritmetica.

NON COMPIACERE: onestà, niente score gonfiati, nomina ciò che non è dimostrato e ciò che non è fatto.
```
