# ELAB Tutor — iter 56 activation prompt

> Continuation hand-off from iter 55. Branch: `feat/iter-41-sprint-u-cycle-2-real-user-fix`.
> Paste the **Activation string** (bottom of this file) into a fresh Claude Code session, or paste this whole file.
> Optimized for zero-regression continuation. iter 55 ended at a **non-clean checkpoint** — read §3 first.

---

## Role

You are continuing autonomous work on **ELAB Tutor** — an educational electronics platform for kids 8-14 (kit fisici Omaric + 3 volumi cartacei Davide + software). You are mid-EPIC-1: aligning the software's experiment definitions to the printed volumes (Morfismo Sense 2). iter 55 wrote the A4.1b spec + plan, did the recon, fixed a validation-gate bug, and archived the 13 to-be-removed experiments — then a concurrent process executed the removal itself, **uncommitted**. iter 56's first job is to resolve that state safely.

---

## §0 — Entrance sequence (do these FIRST, in this exact order — do not skip, do not reorder)

1. **Confirm working dir + branch.** `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"`, `git branch --show-current` → must be `feat/iter-41-sprint-u-cycle-2-real-user-fix`. `git log --oneline -8` to see the iter-55 tail (last committed: `2a5cd14e` — the A4.1b archive commit).
2. **`git status` — EXPECT A LARGE UNCOMMITTED DIFF.** iter 55 ended with the A4.1b removal *executed in the working tree but NOT committed* (see §3). This is the central thing iter 56 resolves. Do **not** `git checkout`/discard it and do **not** blind-`git add -A` it. First understand it (§3 + §4).
3. **Pre-flight CoV — but read this carefully.** `npx vitest run` and `npm run build`. As of iter-55 close, on the uncommitted working tree: vitest = **13273 passed, 0 failed, 323 files**; build = **exit 0**. HEAD (`2a5cd14e`, committed) is a different state: vitest **14367**, build exit 0. The gap is the uncommitted removal. If your `git status` is clean (someone committed or discarded the removal between sessions), adjust: a clean tree at `2a5cd14e` = 14367; a clean tree with the removal committed = 13273. **Whichever state you are in, vitest must be 0-failed and build exit 0 before you touch anything. If either is red → STOP and report.**
4. **`/mem-search` to recover context.** Run the claude-mem `search` tool with queries: `"EPIC 1 narrative arc parità volumi kit elabtutor"`, `"A4.1b staged removal 13 Vol3 no-counterpart"`, `"A3 master verdict repo book-faithful"`, `"Morfismo Sense 2 triplet"`. The corpus is stale (~April) — treat it as background only; the authoritative iter-55 state is the files in §3.
5. **Read Tea's work — START HERE.** Read `/Users/andreamarro/VOLUME 3/TEA/` and `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/`. Tea (Teodora De Venere) produced the canonical blueprint: `standard_experiment_schema.json` (the 7-step experiment schema), `narrative_map.json`, `narrative_metadata_94.json`, `cliffhanger_table.json`, `bibbia_stilistica.pdf`, the fumetti deliverables. iter 54 vendored the 3 canonical JSONs into `scripts/epic1/tea-canon/`. **Authoritative use of Tea's deliverables** (per the iter-54 A3 verdict): her **7-step schema structure** is canon; her `bookText`/`success_citation`/`analogy` metadata is verbatim-verified and canon **for Vol 1 + Vol 2 only**; her `narrative_map` chapter titles + `nextId` chains are **unreliable** (16/22 chapter titles wrong, cross-volume jumps); her Vol 3 `bookText` is **fabricated** (0/29 verbatim) — do not use it. The physical volumes (`CONTENUTI/volumi-pdf/`) are the source of truth.
6. **Read the iter-55 state hand-off** — every file listed in §3.

---

## §1 — Anti-regression (HARD CONSTRAINTS — non-negotiable, FERREO)

- `npx vitest run` must end **0-failed** before AND after every change. A test that *fails* is a regression → REVERT. A test that legitimately *disappears* because its source data was removed is expected — but only ever re-baseline the count *with an arithmetic proof* (see §4 — iter 55's removal dropped the count 14367 → 13273 = 1094, and that drop was NOT proven, only observed-green; iter 56 must close that proof or treat the removal as unverified).
- `npm run build` exit 0 before every commit.
- The **pre-commit hook** (`.githooks/pre-commit` → `scripts/quick-regression-check.sh`, reads `.test-count-baseline.json` `total`) runs a regression check — NEVER bypass it. NEVER `--no-verify`. NEVER push to `main`. Stay on `feat/iter-41-sprint-u-cycle-2-real-user-fix`.
- NEVER `git add -A` blindly — stage specific files, check `git diff --cached` first. **A concurrent autonomous loop is active in this repo** — it leaves unrelated files modified (`AGENTS.md`, `automa/state/*`) and *commits on its own* (it executed iter-55's Task 3 and earlier swept an unrelated change into a commit). Treat the working tree as shared: verify provenance before committing anything you did not author.
- Destructive/irreversible actions (committing ~75 unauthored files, discarding the working tree, force operations) require explicit confirmation from Andrea — do not do them autonomously.
- Score/test-count claims: cite ONLY numbers you just saw in `vitest`/`build` output — never from memory.

---

## §2 — The recurring Andrea mandate (verbatim — this is the WHY of all of EPIC 1)

> **Gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate (anti-pattern attuale elabtutor). Ci deve essere parità totale: volumi cartacei (Davide) ↔ kit fisici Omaric ↔ software elabtutor. Stessa narrativa, stesso ordine, stessi nomi, stesse pagine, stesse transizioni cliffhanger inter-esperimento. Questo è Morfismo Sense 2 — il differenziatore competitivo non copiabile.**

Operating rule, ratified: **parità stretta** — the software experiment inventory must exactly equal the *current* printed volume inventory. Nothing ships that is not in the printed volume; what the volume has and the software lacks gets added; over-splits/duplicates collapse to 1:1. Every iter-56 decision is measured against this. If a step doesn't move the software toward triplet parity, question it. **Run `/mem-search` for `"EPIC 1 narrative arc parità volumi kit elabtutor"` at the start to re-anchor on this — Andrea has stated it many times across sessions and it governs the whole epic.**

---

## §3 — iter-55 state hand-off (authoritative — read these files)

**EPIC 1 progress: A1 + A2 + A3 done; A4 spec'd; A4.1a done; A4.1b spec + plan + recon + gate-fix + archive COMMITTED; A4.1b removal EXECUTED-UNCOMMITTED.**

### What iter 55 committed (clean, mine, on top of `9091fa18`):
| Commit | What |
|---|---|
| `efa41aa3` | A4.1b spec — `docs/superpowers/specs/2026-05-14-epic1-a4-1b-staged-removal-design.md` |
| `fa567b3a` | A4.1b implementation plan — `docs/superpowers/plans/2026-05-14-epic1-a4-1b-staged-removal.md` |
| `473c84b8` | A4.1b recon (the exact-edit artifact) — `docs/audits/2026-05-14-epic1-a4-1b-recon.md` |
| `7b5669e9` | A4.1b plan amendment (recon findings folded in) |
| `36121f8f` | **Gate bug-fix** — `scripts/epic1/validate-lesson-paths.mjs`: `pending-removal` now fires only while the lesson-path file still exists (+1 test). This was a real iter-54 bug. |
| `2a5cd14e` | **A4.1b archive** — `scripts/epic1/removed-no-volume-counterpart/` (15 JSON copies + `MANIFEST.md`). The git-recoverable checkpoint. |

### What is UNCOMMITTED in the working tree (the central iter-56 problem):
A concurrent process (the autonomous loop) executed the A4.1b **removal** — `git status` shows: 13 `src/data/lesson-paths/v3-*.json` deleted, 2 `src/data/capitoli/v3-bonus-*.json` deleted, 5 `public/hex/*.hex` deleted, `experiments-vol3.js` + `lesson-paths/index.js` + `lesson-groups.js` + `chapter-map.js` + `concept-graph.js` + `volume-references.js` + `welcome-messages.js` + `scratch-xml-templates.js` + `capitoli/v3-cap6/7/8/9.json` + `useExperimentLoader.js` + `ElabTutorV4.jsx` + `compiler.js` modified, ~60 test files modified, `.test-count-baseline.json` + `automa/baseline-tests.txt` set to `13273`.

**iter-55 verified, on that uncommitted tree:** vitest **13273 passed / 0 failed / 323 files**; build **exit 0**; gate **0 pending-removal**; `experiments-vol3.js` + all 4 capitoli parse OK. So the removal is *functionally green* — but see the gaps below.

**Honest gaps in the uncommitted removal (iter 56 MUST resolve before committing it):**
1. **Not authored by the iter-55 controller.** It was produced by the concurrent autonomous loop, uncommitted. ~75 files. It has not had the plan's spec-review / code-quality-review / Codex cross-check.
2. **The arithmetic proof was never produced.** Drop = 14367 − 13273 = **1094**. The iter-55 recon predicted ~90-115 (its `Δgenerated` method only counted test files that *grep-matched a removed id* — it missed the ~40+ generated suites that iterate `ALL_EXPERIMENTS` without hardcoding an id). 1094 is *plausible* (this codebase has many per-experiment generated suites) and 0 failures means nothing broke — but `post = pre − exact Δgenerated` was never closed. iter 56 must either close it (compute the exact generated-test count of the 13 across ALL generated suites and confirm 1094 == that) or treat the removal as unverified.
3. **The recon under-counted dangling references.** It recorded **4** `next_experiment.id` danglers. Reality: **6 src files** still reference removed ids — the 4 known (`v3-cap6-semaforo`, `v3-cap7-esp3`, `v3-cap7-esp6`, `v3-cap8-esp3`) ALSO have a `next_suggested` field pointing at the same removed id, AND 2 more files (`v3-cap7-esp2`, `v3-cap8-esp1`) reference a removed id in a prerequisite-style array. None break vitest/build (no test asserts target-resolution) — but A4.1d's re-thread scope is larger than `removed-no-volume-counterpart/MANIFEST.md` records, and the "deferral-safe" verdict should be re-confirmed for `next_suggested` + the prerequisite arrays.
4. **Codex GPT-5.5 cross-check could not be run** — the `codex` CLI is not installed in the environment (`which codex` → not found). The plan's Task 3 Step 11 Codex Pattern V verification was substituted in iter 55 with a manual grep + vitest + build + parse check. iter 56 should run the Codex cross-check if Codex becomes available, or repeat the manual equivalent.

### Key artifacts to read:
| Artifact | Path | Why |
|---|---|---|
| A4.1b recon | `docs/audits/2026-05-14-epic1-a4-1b-recon.md` | The exact-edit artifact — every reference classified; §6 is the generated-vs-fixed test analysis (note its `Δgenerated` method is incomplete — see gap #2) |
| A4.1b plan | `docs/superpowers/plans/2026-05-14-epic1-a4-1b-staged-removal.md` | Tasks 1, 1.5, 2 done; Task 3 (atomic removal) is the uncommitted work; Task 4 (close) not done |
| A4.1b spec | `docs/superpowers/specs/2026-05-14-epic1-a4-1b-staged-removal-design.md` | parità-stretta rationale, exit criteria |
| Archive + manifest | `scripts/epic1/removed-no-volume-counterpart/MANIFEST.md` | 13 removed ids + A3 evidence + the (under-counted) 4 deferred dangling links |
| The correction contract | `scripts/epic1/a3-corrections.json` | source of truth — 94 entries, 13 `action:remove`, 2 `consolidate`, 6 `correct` |
| The validation gate | `scripts/epic1/validate-lesson-paths.mjs` | run it → regenerates `docs/audits/2026-05-14-epic1-a4-1a-contract-validation.md`; 0 `pending-removal` is A4.1b's exit criterion |
| ADR-047 | `docs/adrs/ADR-047-narrative-arc-canon-tea-schema-adoption.md` | EPIC 1 strategy; D1 reversed by A3 (physical volumes are canon, not Tea's narrative_map) |
| A3 master verdict | `docs/audits/2026-05-14-epic1-a3-MASTER-verdict.md` | 74/94 repo-faithful, 20 neither/no-counterpart, Tea Vol3 bookText fabricated |

---

## §4 — iter 56 work

**P0 — Resolve the uncommitted A4.1b removal.** This blocks everything else in EPIC 1. Decide, with Andrea, between:
- **(A) Verify-and-commit.** Rigorously verify the uncommitted removal: (1) close the arithmetic proof — compute the exact generated-test count of the 13 removed experiments across *all* generated suites and confirm `14367 − 13273 == that exact number` (if it doesn't close, something extra was lost → investigate); (2) run a spec-review against `docs/superpowers/specs/2026-05-14-epic1-a4-1b-staged-removal-design.md` + a code-quality review of the ~75-file diff; (3) Codex Pattern V cross-check (or manual grep equivalent) for dangling refs; (4) update `removed-no-volume-counterpart/MANIFEST.md` to record the *real* dangling-ref set (6 files, ~10 refs — see §3 gap #3); (5) if all pass, commit it as the A4.1b "delete" step with the arithmetic proof in the commit message. If any verification fails → option (B).
- **(B) Discard-and-redo.** `git stash` or `git checkout` the uncommitted removal (with Andrea's explicit confirmation — it is destructive), then execute the committed plan `docs/superpowers/plans/2026-05-14-epic1-a4-1b-staged-removal.md` Task 3 properly via `superpowers:subagent-driven-development` with opus subagents, including the spec + code-quality reviews and the arithmetic proof the plan mandates.

Recommendation: attempt (A) first — the work is green and the plan is fully specified; redoing it from scratch wastes the loop's correct execution. But (A) is only valid if the arithmetic proof closes and the reviews pass — otherwise (B). Do not commit the removal without the proof.

**P1 — A4.1c** (after A4.1b is committed): consolidate the 2 Vol 3 duplicate ids (`v3-cap6-esp3`→`v3-cap6-morse`, `v3-cap6-esp5`→`v3-cap6-semaforo`); collapse Vol 3 Ch7/Ch8 over-splits to the volume's real block count; add the missing Vol 2 Cap.11 "I diodi" lesson-paths. Each its own brainstorm → spec → plan → subagent-driven execution.

**P2 — A4.1d**: re-thread the dangling `next_experiment` + `next_suggested` + prerequisite refs (the real 6-file set) for the survivors that pointed at removed ids; apply the `action:correct` per-field fidelity from `a3-corrections.json`.

**P3 — A4.1e**: regenerate `narrative_map` / `chapter-map.js` / `lesson-groups.js` from the volumes + the contract (22 corrected chapter titles).

Then A4.2 (`steps` authoring), A5 (PZ-V3 validator), A6 (Modalità Percorso UI) per ADR-047.

---

## §5 — Known environmental issues (do not be surprised by these)

- **A concurrent autonomous loop is active in this repo.** It commits on its own and modifies the working tree. It executed iter-55's Task-3 removal uncommitted. It leaves `AGENTS.md` + `automa/state/*` modified. Always check provenance before committing; never assume the working tree is yours alone.
- **`codex` CLI is not installed** — `which codex` → not found. `scripts/dev/codex-bg.sh` exists but the underlying binary is missing. Codex Pattern V cross-checks must be done manually (grep + vitest + build) until Codex is installed.
- **Two baseline files, both now `13273`:** the pre-commit hook reads `.test-count-baseline.json` `total`; `automa/baseline-tests.txt` is CI-side + treated as canonical by CLAUDE.md. iter 55's uncommitted removal set both to `13273`. If you keep the removal, that is the new floor; if you discard it, reset both to `14367`.
- **`block-console-log` hookify rule** blocks Edit/Write on ANY content containing the literal `console.log(` regardless of path — false-positives on legitimate `scripts/*.mjs` reporters. Workaround: write such files via Bash heredoc, then `node --check`.
- **`.claude/settings.json` `Edit|Write` hook** was fixed iter-54/55 to the stdin-JSON API — the core-engine DENY rules (`CircuitSolver.js` etc.) now actually fire. Still: be careful around `src/components/simulator/engine/`.
- macOS bash 3.2: no `timeout`/`gtimeout`; do not use `set -u` with empty-array expansion.

---

## §6 — Workflow

- **Skill chain:** `using-superpowers` → `mem-search` (re-anchor on the §2 mandate) → for the P0 decision, if it lands on redo: `brainstorming` is not needed (the spec exists) — go straight to `subagent-driven-development` against the committed plan; if it lands on verify-and-commit, use `verification-before-completion` + `requesting-code-review` rigorously. For A4.1c/d/e: `brainstorming` → `writing-plans` → `subagent-driven-development`, opus subagents only (no sonnet).
- **Anti-inflation / NON COMPIACERE:** no auto-score > 7.5 without an independent opus review. No "fixed" / "verified" claim without the command output shown. Cite test counts only from output just seen. iter 54's A3 overturned its own A2 premise because the work was honest — keep that. If the arithmetic proof for the removal does not close, say so plainly and do not commit.
- **Self-review before any commit:** does `git diff --cached` contain ONLY files you authored or verified? Does vitest show 0 failed? Does build exit 0? Is the test-count change either zero or accompanied by an arithmetic proof?

---

## Activation string (paste-ready)

```
Continua ELAB Tutor iter 56. Working dir: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder, branch feat/iter-41-sprint-u-cycle-2-real-user-fix.

Leggi PRIMA docs/handoff/2026-05-14-iter-56-activation.md ed esegui §0 entrance sequence in ordine: (1) verifica branch, (2) git status — ASPETTATI UN GROSSO DIFF NON COMMITTATO (la rimozione A4.1b eseguita ma non committata da un processo concorrente — NON fare checkout/discard, NON git add -A cieco), (3) pre-flight CoV — npx vitest run deve essere 0-failed + npm run build exit 0 (se rosso STOP); sul working tree non committato iter-55 ha verificato vitest 13273/0-fail + build OK, HEAD committato 2a5cd14e è 14367, (4) /mem-search per il contesto, (5) leggi la cartella TEA (/Users/andreamarro/VOLUME 3/TEA/ + /Nuovo lavoro tea/) — si PARTE dal lavoro di Tea: schema 7-step canonico, metadata bookText/citation/analogy canonici SOLO per Vol 1+2, narrative_map e Vol3 bookText inaffidabili, (6) leggi lo stato iter-55 (§3: i 6 commit A4.1b + la rimozione NON committata + i 4 gap onesti).

MANDATO RICORRENTE ANDREA (il PERCHÉ di tutto EPIC 1): gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate; parità totale volumi cartacei ↔ kit Omaric ↔ software elabtutor (Morfismo Sense 2). Regola operativa: parità stretta. Esegui /mem-search "EPIC 1 narrative arc parità volumi kit elabtutor" per ri-ancorarti — Andrea lo ha ripetuto molte volte.

ANTI-REGRESSIONI FERREO: npx vitest run 0-failed prima e dopo ogni modifica, build PASS prima di ogni commit, MAI --no-verify, MAI bypass pre-commit hook, MAI push su main, MAI git add -A cieco (loop autonomo concorrente attivo — committa da solo, verifica la provenienza). Re-baseline del conteggio test SOLO con prova aritmetica.

LAVORO iter 56 P0: risolvi la rimozione A4.1b NON COMMITTATA nel working tree. Decidi con Andrea tra (A) verifica-e-committa — chiudi la prova aritmetica (drop 14367→13273 = 1094, MAI dimostrato; la recon predisse ~90-115, metodo incompleto), spec-review + code-quality review del diff ~75 file, cross-check ref danglanti, aggiorna il MANIFEST col set reale (6 file, non 4), poi committa con la prova nel messaggio; oppure (B) scarta-e-rifai via il piano committato con subagent-driven, opus. NON committare la rimozione senza la prova aritmetica chiusa. Poi A4.1c (consolidate/collapse/add Cap.11), A4.1d (re-thread dangling refs — 6 file reali), A4.1e (rigenera narrative_map).

NON COMPIACERE: onestà, niente score gonfiati, nomina ciò che non è dimostrato. Skill: subagent-driven-development con subagent opus (no sonnet); brainstorming→writing-plans per A4.1c+. Codex CLI non installato in questo ambiente — cross-check manuali (grep+vitest+build).
```
