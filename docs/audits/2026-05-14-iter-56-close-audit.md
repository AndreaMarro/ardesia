# EPIC 1 iter 56 — close audit (A4.1c)

> iter 56. Branch `feat/iter-41-sprint-u-cycle-2-real-user-fix`. 7 A4.1c-implementation commits `91e36709..ad2bc106` on top of `8b9b03aa` + this close-docs commit `f043f82c`, all pushed to origin.
> Honest audit — G45 anti-inflation mandate enforced. Verified by independent Claude re-runs + Codex GPT-5.5 cross-check (the recursive anti-inflation loop).

## Verdict

**A4.1c is COMPLETE for its exit criterion** — `node scripts/epic1/validate-lesson-paths.mjs` shows **0 `pending-consolidation`**. But it is **not perfectly clean**: it introduced **one narrative-flow data regression** (a `semaforo ↔ morse` cycle in `capitoli/v3-cap6.json`) that breaks no test/build/gate but degrades narrative coherence — deferred to A4.1d, documented below. **No score is claimed** — A4.1c is one staged step of EPIC 1; A4.1d + A4.1e remain.

## What was done (A4.1c)

| # | commit | what |
|---|--------|------|
| 1 | `91e36709` | A4.1c design spec |
| 2 | `d8422444` | A4.1c implementation plan |
| 3 | `8613aba6` | A4.1c recon — exact-edit artifact (Step 4 later corrected, see below) |
| 4 | `d3b88f72` | gate fix — `pending-consolidation` fires only while the source file exists (mirrors A4.1b `36121f8f`) + 2 tests |
| 5 | `e8166ef2` | archive — `scripts/epic1/consolidated-into-named-id/` (2 JSON copies + MANIFEST) |
| 6 | `bee5e627` | **apply** — consolidate `v3-cap6-esp3`→`v3-cap6-morse`, `v3-cap6-esp5`→`v3-cap6-semaforo`. 51 files. Includes the recon Step 4 correction. |
| 7 | `ad2bc106` | A3 verdict correction — Vol2 Cap.11 is pure theory (0 experiments) |

- **2 Vol3 duplicate ids consolidated.** `v3-cap6-esp3.json` + `v3-cap6-esp5.json` deleted (archived first, git-recoverable); all references re-pointed to the book-faithful named siblings `v3-cap6-morse` / `v3-cap6-semaforo`; contract `nextId` for `v3-cap6-esp2`/`v3-cap6-esp4` updated. `git grep v3-cap6-esp3\|v3-cap6-esp5 src/` → empty.
- **Ch7/Ch8 collapse = no-op.** Already complete via A4.1b removals (Codex CONFIRMED: Ch7 = exactly esp1/esp2/esp3/esp6, Ch8 = exactly esp1/esp2/esp3). The handoff listed "collapse Ch7/Ch8" as P0 work but A4.1b had already done it.
- **Vol2 Cap.11 "I diodi" — recon overturned the handoff's P0.** The handoff said "add v2-cap11-* lesson-paths." Direct read of `vol2.txt` 2624-2738 (Claude + Codex independently) proved Cap.11 is **pure theory, 0 experiments**. The A3 master verdict's "has printed experiments" claim was **factually wrong** — corrected. Per parità stretta, **0** `v2-cap11-*` lesson-paths authored (authoring them = inventing content absent from the volume). The "Cap.11 as a theory node in the narrative arc" question is handed to A4.1e, documented in the corrected verdict's Open decision 6 — NOT dropped.

## CoV — independently verified (not self-assessed)

| gate | result | verified by |
|------|--------|-------------|
| `npx vitest run` | **13106 passed / 0 failed** (15 skip + 12 todo) | Controller re-ran independently — exact match to the implementer's claim |
| `npm run build` | exit 0 | Controller re-ran independently |
| `node scripts/epic1/validate-lesson-paths.mjs` | **0 `pending-consolidation`** (94 checked · 64 pass · 30 fail) | Controller re-ran; 64 pass = +2 vs post-A4.1b's 62 (the 2 consolidate entries now clear) |
| Codex diff-review (`bee5e627`) | CONFIRM — no test-weakening, edits consistent with deleting exactly esp3+esp5 | Controller ran own Codex audit (`/tmp/codex-verify-task4-final.txt`) |

**Arithmetic proof of the −169 test drop (13275 → 13106).** Closed by the A4.1b-sanctioned direct method (the per-suite Δ-decomposition is infeasible — ~40+ suites do `ALL_EXPERIMENTS.forEach(it)`): exactly 2 lesson-paths + 2 `experiments-vol3.js` objects removed (verified: `experiments-vol3.js` = 14 v3 objects, lesson-paths dir = 79, both data sources consistent at 79) + 0 failed + all 325 test files collected (identical to pre-A4.1c) + skip(15)+todo(12) identical to pre-A4.1c (no test disabled). Ratio cross-check: A4.1b −1094/13 = 84.2 per experiment; A4.1c −169/2 = 84.5 — nearly identical generated-test density. Baseline files `.test-count-baseline.json` `total` + `automa/baseline-tests.txt` re-baselined 13273 → 13106 with this proof.

## REGRESSION introduced (honest — Codex-caught)

**`narrative_flow.transitions` cycle in `src/data/capitoli/v3-cap6.json`.** Codex's iter-56 close audit REFUTED a clean "no regression" claim. Confirmed by direct read:

- Pre-A4.1c: linear 7-node chain `esp1→esp2→esp3→esp4→esp5→morse→semaforo`.
- Post-A4.1c: `esp1→esp2→morse→esp4→semaforo→morse→semaforo` — a **`semaforo ↔ morse` 2-cycle** (transition 5 `[semaforo,morse]` + transition 6 `[morse,semaforo]`).
- Cause: the mechanical REPOINT-ID of `[esp5,morse]`→`[semaforo,morse]` is correct per the recon, but esp5 collapsed *into* semaforo, so the old tail `esp5→morse→semaforo` became `semaforo→morse→semaforo`. The recon's Note D flagged the `semaforo→morse` symptom and scoped chain re-ordering to A4.1d — but it did **not** trace the pre-existing transition 6 `[morse,semaforo]` and so under-stated it as a "chain-ordering question" rather than a cycle.
- Impact: breaks **no** test/build/gate (no test asserts the transitions form a DAG). It is a narrative-coherence degradation only — but a real one, against Andrea's core mandate (continuous narrative arc).
- **Resolution: explicit #1 A4.1d task** (see next-session prompt). NOT fixed in iter 56 because the correct Ch6 chain (likely `esp1→esp2→morse→esp4→semaforo→[Ch7]`, transitions 5+6 removed) is an A4.1d re-thread design decision, and the A4.1c/d boundary was ratified to keep chain re-ordering in A4.1d.

## Other honest gaps + process lessons

- **Recon Step 4 was materially incomplete** (8 test files enumerated vs 31 real). Task 4 BLOCKED correctly; the recon was corrected mid-iter using A4.1b (`b0f9efa3`) as the authoritative test-surface template. Lesson: the recon's Codex CONFIRM only covered the esp3/esp5 reference surface — Step 4's test-impact analysis was never independently verified. A4.1d recon must Codex-verify the test-impact analysis explicitly, and must trace full transition chains (not just grep id literals) to catch emergent cycles.
- **2 subagents mis-read git / over-dramatized** (Task 3 claimed HEAD was `e510e74e` — false, reflog showed clean linear history; Task 4 claimed "asserts 94" — a misread of an it-description string, and "3 inconsistent count systems" — actually one consistent set). Both caught by controller verification. Lesson: subagent git/count claims must be independently verified, never trusted.
- **Mid-task `git stash` incident.** Task 4 stashed to measure the clean-HEAD baseline; the concurrent autonomous loop modified `automa/state/iter-19-harness-2.0-results.json` underneath, `git stash pop` conflicted, recovered by `git checkout` of that one loop-owned file. No data loss, but `git stash` is unsafe in this repo while the autonomous loop runs — avoid it; measure baselines another way.
- **Minor hygiene:** `.test-count-baseline.json` `commit` field still reads a stale `a1d0a98` (should be `bee5e627`). Non-blocking — the pre-commit hook reads `total` (correctly 13106), not `commit`. Fix opportunistically in A4.1d.
- **11 pre-existing dangling refs** (to `v3-cap6-esp6`, `v3-cap7-esp4/7/8`, `v3-extra-lcd-hello`) — A4.1b-era, NOT introduced by A4.1c (Codex confirmed), already A4.1d scope.

## State for A4.1d (next)

The validation gate's 30 remaining fails ARE the A4.1d work-list: the 6 `action:correct` per-field fixes + survivor-title divergences. Plus, NEW from this iter: the `v3-cap6.json` narrative_flow cycle (#1 priority), the 6-file dangling-ref set (per the A4.1b MANIFEST), the stale `.test-count-baseline.json` `commit` field.

## Codex artifacts (auditable)

`/tmp/codex-recon-a41c.txt` · `/tmp/codex-verify-cap11.txt` · `/tmp/codex-verify-step4-correction.txt` · `/tmp/codex-verify-task4-final.txt` · `/tmp/codex-iter56-close-audit.txt`
