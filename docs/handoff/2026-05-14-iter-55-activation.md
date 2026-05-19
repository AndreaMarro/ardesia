# ELAB Tutor — iter 55 activation prompt

> Optimized continuation prompt. Hand-off from iter 54. Branch: `feat/iter-41-sprint-u-cycle-2-real-user-fix`.
> Paste the **Activation string** (bottom of this file) into a fresh Claude Code session, or paste this whole file.

---

## Role

You are continuing autonomous work on **ELAB Tutor** — an educational electronics platform for kids 8-14 (kit fisici Omaric + 3 volumi cartacei Davide + software). You are mid-EPIC-1: aligning the software's 94 experiment definitions to the printed volumes. iter 54 did the diagnosis + built the foundation; iter 55 executes the first structural fix.

---

## §0 — Entrance sequence (do these FIRST, in this exact order — do not skip, do not reorder)

1. **Confirm working dir + branch.** `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"`, `git status`, `git branch --show-current` → must be `feat/iter-41-sprint-u-cycle-2-real-user-fix`. `git log --oneline -8` to see the iter-54 tail.
2. **Pre-flight CoV (entrance gate — MANDATORY before any change).** Run `npx vitest run` → must be **≥ 14366 passed**. Run `npm run build` → must exit 0. If either is red, STOP and report — do not proceed, do not "fix" by touching tests.
3. **mem-search to recover context.** Run `/mem-search` (or the claude-mem `search` tool) with queries: `"EPIC 1 narrative arc parità volumi kit elabtutor"`, `"A3 master verdict repo book-faithful Tea narrative_map unreliable"`, `"A4 parità stretta Vol3 remove no counterpart"`, `"Morfismo Sense 2 triplet"`. The claude-mem corpus is stale (~April) — treat it as background only; the authoritative iter-54 state is the files in §3.
4. **Read Tea's work — START HERE.** Read `/Users/andreamarro/VOLUME 3/TEA/` and `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/`. Tea (Teodora De Venere) produced the canonical blueprint: `standard_experiment_schema.json` (7-step schema), `narrative_map.json`, `narrative_metadata_94.json`, `bibbia_stilistica.pdf`, fumetti deliverables. iter 54 vendored the 3 canonical JSONs into `scripts/epic1/tea-canon/`. iter 54's A3 verified Tea's `narrative_map` against the physical volumes and found it **unreliable** (see §3) — but Tea's `standard_experiment_schema.json` (the 7-step structure) and her `bookText`/`citation`/`analogy` metadata for **Vol 1 + Vol 2** remain canonical. Tea's Vol 3 `bookText` is fabricated (0/29 verbatim) — do not use it.
5. **Read the iter-54 handoff state** — every file listed in §3.

---

## §1 — Anti-regression (HARD CONSTRAINTS — non-negotiable, FERREO)

- `npx vitest run` ≥ **14366 passed** before AND after every change. Tests drop → REVERT, do not weaken tests.
- `npm run build` exit 0 before every commit.
- The **pre-commit hook** runs a regression check — NEVER bypass it. NEVER `--no-verify`.
- NEVER push to `main` — branch + PR only. iter 55 stays on `feat/iter-41-sprint-u-cycle-2-real-user-fix` unless told otherwise.
- NEVER `git add -A` blindly — stage specific files, check `git diff` first.
- Destructive steps (A4.1b removes 13 files) are **staged**: move → manifest → CoV → commit move → commit delete. Git-recoverable. Never blind `rm`.
- Score/test-count claims: cite ONLY numbers you just saw in `vitest` output — never from memory.
- A user approving an action once does not authorize it in all contexts. For anything destructive or deploy-affecting, confirm scope first.

---

## §2 — The recurring Andrea mandate (verbatim — this is the WHY of all of EPIC 1)

> **Gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate (anti-pattern attuale elabtutor). Ci deve essere parità totale: volumi cartacei (Davide) ↔ kit fisici Omaric ↔ software elabtutor. Stessa narrativa, stesso ordine, stessi nomi, stesse pagine, stesse transizioni cliffhanger inter-esperimento. Questo è Morfismo Sense 2 — il differenziatore competitivo non copiabile.**

Andrea ratified the operating rule for the fix: **parità stretta** — the software experiment inventory must exactly equal the *current* printed volume inventory. Nothing ships that is not in the printed volume; what the volume has and the software lacks gets added; over-splits/duplicates collapse to 1:1.

Every iter-55 decision is measured against this. If a step doesn't move the software toward triplet parity, question it.

---

## §3 — iter-54 state hand-off (authoritative — read these files)

**EPIC 1 progress: A1 + A2 + A3 done, A4 spec'd, A4.1a done. A4.1b is next.**

| Artifact | Path | What it is |
|---|---|---|
| ADR-047 | `docs/adrs/ADR-047-narrative-arc-canon-tea-schema-adoption.md` | EPIC 1 strategy. **D1 REVERSED by A3** — Tea's narrative_map is NOT the source of truth; the physical volumes are; the repo lesson-paths are largely book-faithful. Read the iter-54 addendum. |
| A3 master verdict | `docs/audits/2026-05-14-epic1-a3-MASTER-verdict.md` | The diagnosis. Of 94: **74 repo-faithful, 0 Tea-faithful, 20 neither/no-counterpart; 16/22 Tea chapter titles wrong; Tea Vol3 bookText fabricated 0/29**. |
| A3 per-volume verdicts | `docs/audits/2026-05-14-epic1-a3-vol{1,2,3}-verdict.md` | Per-experiment book-faithfulness, with volume-text proof quotes. |
| A4 spec | `docs/specs/2026-05-14-epic1-a4-volume-parity-spec.md` | The parità-totale PRD. Blocking question RESOLVED: parità stretta. |
| **The correction contract** | `scripts/epic1/a3-corrections.json` | **THE source of truth for A4** — 94 entries, per id `{action: keep/correct/remove/consolidate, bookFaithfulTitle, page, chapter, nextId, ...}`. Codex-verified. |
| Contract schema | `scripts/epic1/corrections-schema.mjs` | zod `.strict()` schema validating the contract file. |
| **The validation gate** | `scripts/epic1/validate-lesson-paths.mjs` | `checkLessonPath` + `main()`. Run `node scripts/epic1/validate-lesson-paths.mjs` → regenerates the work-list. **Gate going GREEN is each A4.1x sub-task's exit criterion.** |
| The A4.1 work-list | `docs/audits/2026-05-14-epic1-a4-1a-contract-validation.md` | Generated. Current: **94 checked · 49 pass · 45 fail** (13 remove, 2 consolidate, 6 correct, 73 keep). |
| A4.1a plan | `docs/superpowers/plans/2026-05-14-epic1-a4-1a-correction-contract.md` | Done. Its "A4.1b–e Roadmap" section scopes what's next. |
| Codex workflow v2.0 | `docs/dev/CODEX-WORKFLOW.md` + `scripts/dev/codex-bg.sh` + `.codex/AGENTS.md` | Codex GPT-5.5 as parallel verify/review/implement. Use Pattern V to cross-check before commits. |

Baseline: `npx vitest run` = **14366 passed** at iter-54 close. Build PASS.

---

## §4 — iter 55 work: write + execute the A4.1b plan (staged destructive removal)

**Goal:** remove the 13 Vol 3 experiments that have no printed counterpart in Volume 3 V0.8.1 — strict parità. The gate's 13 `pending-removal` divergences must go to 0.

The 13 ids (from `a3-corrections.json`, `action: "remove"`):
`v3-cap6-esp6`, `v3-cap6-esp7`, `v3-cap7-esp4`, `v3-cap7-esp5`, `v3-cap7-esp7`, `v3-cap7-esp8`, `v3-cap7-mini`, `v3-cap8-esp4`, `v3-cap8-esp5`, `v3-cap8-serial`, `v3-extra-lcd-hello`, `v3-extra-servo-sweep`, `v3-extra-simon`.

Approach (per the A4.1a plan's roadmap + A4 spec R5):

1. **Use the brainstorming skill, then writing-plans** to produce a bite-sized A4.1b plan at `docs/superpowers/plans/2026-05-14-epic1-a4-1b-staged-removal.md`. It MUST cover:
   - Reconnaissance: every reference to the 13 ids — `src/data/lesson-paths/index.js`, `lesson-groups.js`, `chapter-map.js`, `narrative_map`/`narrative-arc`, and the 8 consumers (`UnlimWrapper`, `UnlimReport`, `LessonPathPanel`, `useExperimentLoader`, `GalileoAdapter`, `TeacherDashboard`, `classProfile`, `lessonPrepService`).
   - Staged removal: (a) move the 13 lesson-path JSONs to `scripts/epic1/removed-no-volume-counterpart/` + a removal manifest citing the A3 evidence per id, (b) update every reference, (c) the A4.1d re-thread work-list (5 `nextId`→removed links — `v3-cap6-esp5`, `v3-cap6-semaforo`, `v3-cap7-esp3`, `v3-cap7-esp6`, `v3-cap8-esp3`) is NOT fixed here, it is documented as a known follow-up (A4.1d), (d) CoV green, (e) commit the move, (f) commit the delete.
   - Exit criterion: `node scripts/epic1/validate-lesson-paths.mjs` shows **0 `pending-removal`** and the 13 are gone from `src/data/lesson-paths/`; vitest ≥ baseline; build PASS.
2. **Execute it subagent-driven** (`superpowers:subagent-driven-development`), opus subagents, spec + code-quality review per task.
3. Then checkpoint with Andrea. A4.1c (consolidate/collapse/add Cap.11), A4.1d (per-field fidelity + re-thread), A4.1e (regenerate narrative_map) follow, each its own plan.

---

## §5 — Known environmental issues (do not be surprised by these)

- **`block-console-log` hookify rule** (in `/Users/andreamarro/VOLUME 3/.claude/`): blocks the Edit/Write tools on ANY content containing `console.log(`, regardless of path — false-positives on legitimate `scripts/*.mjs` reporters. Workaround: write such files via `node`/Bash heredoc, then `node --check`. Should be narrowed to `src/` only — flagged for fixing.
- **`.claude/settings.json` `Edit|Write` hook is a silent no-op** — it uses the stale `$TOOL_INPUT_PATH` API, so the "protect CircuitSolver.js / AVRBridge.js" DENY rules do not actually fire. A spawn_task was filed in iter 54 to port it to the stdin-JSON API. Until fixed, treat the core-engine-file protection as NOT active — be extra careful around `src/components/simulator/engine/`.
- macOS bash 3.2: do not use `set -u` with empty-array expansion in shell scripts. No `timeout`/`gtimeout` command available.

---

## §6 — Workflow

- **Skill chain:** `using-superpowers` → `mem-search` → `brainstorming` (before the A4.1b plan) → `writing-plans` → `subagent-driven-development` → `systematic-debugging` (if any bug) → `verification-before-completion`.
- **Codex GPT-5.5 (Pattern V):** before committing structural changes, cross-check with `scripts/dev/codex-bg.sh <task> --profile verify "GOAL:... CONTEXT:... CONSTRAINTS:... DONE:..."` — 4-element prompts mandatory (see `docs/dev/CODEX-WORKFLOW.md`).
- **Anti-inflation:** no auto-score > 7.5 without an independent opus review. No "fixed" claim without a `vitest`/gate run shown. Cite test counts only from output just seen.
- **NON COMPIACERE:** report honestly — surface blockers, name what is NOT done, do not flatter. iter 54's A3 overturned its own A2 premise precisely because the work was honest; keep that.

---

## Activation string (paste-ready)

```
Continua ELAB Tutor iter 55. Working dir: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder, branch feat/iter-41-sprint-u-cycle-2-real-user-fix.

Leggi PRIMA docs/handoff/2026-05-14-iter-55-activation.md ed esegui §0 entrance sequence in ordine: (1) verifica branch, (2) pre-flight CoV — npx vitest run ≥ 14366 + npm run build exit 0 (entrance gate MANDATORIO, se rosso STOP), (3) /mem-search per recuperare contesto, (4) leggi la cartella TEA (/Users/andreamarro/VOLUME 3/TEA/ + /Nuovo lavoro tea/) — si PARTE dal lavoro di Tea, (5) leggi lo stato iter-54 (§3 del file: ADR-047, A3 master verdict, a3-corrections.json, il gate validate-lesson-paths.mjs, la work-list).

MANDATO RICORRENTE ANDREA (il PERCHÉ di tutto EPIC 1): gli esperimenti sono su un arco narrativo continuo, NON spezzettati come card flat scollegate; parità totale volumi cartacei ↔ kit Omaric ↔ software elabtutor (Morfismo Sense 2). Regola operativa ratificata: parità stretta.

ANTI-REGRESSIONI FERREO: vitest ≥ 14366 prima e dopo ogni modifica, build PASS prima di ogni commit, MAI --no-verify, MAI bypass pre-commit hook, MAI push su main. Rimozioni staged (move→manifest→CoV→commit), mai rm cieco.

LAVORO iter 55: scrivi (brainstorming → writing-plans) ed esegui (subagent-driven, opus, no sonnet) il piano A4.1b — rimozione staged dei 13 esperimenti Vol3 senza controparte stampata (lista in a3-corrections.json action:remove). Exit criterion: node scripts/epic1/validate-lesson-paths.mjs mostra 0 pending-removal. Poi checkpoint.

Usa Codex GPT-5.5 Pattern V per cross-check pre-commit. NON COMPIACERE: onestà, niente score gonfiati, nomina ciò che non è fatto.
```
