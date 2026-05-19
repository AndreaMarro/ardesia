# SPEC — EPIC 1 A4.1b: Staged removal of the 13 Vol 3 no-counterpart experiments

**Date:** 2026-05-14 · **Iter:** 55 · **Status:** DESIGN — approved direction (Andrea: "fai la cosa che porti maggiore qualità senza debito tecnico")
**Branch:** `feat/iter-41-sprint-u-cycle-2-real-user-fix`
**Governing rule:** *parità stretta* — the software experiment inventory must exactly equal the current printed Volume 3 V0.8.1 inventory. No experiment ships, anywhere in `src/`, that has no printed counterpart.
**Inputs:** `scripts/epic1/a3-corrections.json` (the contract, `action: "remove"` × 13) · `scripts/epic1/validate-lesson-paths.mjs` (the gate) · A4 spec R5 · ADR-047 · `docs/handoff/2026-05-14-iter-55-activation.md` §4

---

## Problem statement

A3 verified all 94 software experiments against the printed volumes. 13 Vol 3 experiments have **no printed counterpart** in Volume 3 V0.8.1 (high-confidence, A3 per-id evidence). They currently ship as live experiment definitions: the simulator can mount them, the AI prompt references them, tests assert on them. This breaks **parità stretta** (Morfismo Sense 2 — the volume↔kit↔software triplet moat) and **Principio Zero** (a teacher holding the book finds experiments on screen that are not in their hands).

**The 13 ids** (`a3-corrections.json`, `action: "remove"`):
`v3-cap6-esp6`, `v3-cap6-esp7`, `v3-cap7-esp4`, `v3-cap7-esp5`, `v3-cap7-esp7`, `v3-cap7-esp8`, `v3-cap7-mini`, `v3-cap8-esp4`, `v3-cap8-esp5`, `v3-cap8-serial`, `v3-extra-lcd-hello`, `v3-extra-servo-sweep`, `v3-extra-simon`.

## Scope decision — full removal across all `src/` data sources

The activation §4 roadmap named a narrow A4.1b (lesson-paths + `index.js` + `lesson-groups.js` + `chapter-map.js` + the 8 consumers). **Recon found the roadmap underscoped it** — the 13 ids are also live experiment *definitions* in `experiments-vol3.js` and the `capitoli/*.json` layer. A lesson-paths-only removal would leave 13 phantom experiment definitions the simulator can still mount — exactly the tech debt forbidden, and a violation of R5's "zero dangling references" AC.

**Decision: full removal, every `src/` data source.** Bigger blast radius, honestly named; managed (not eliminated) by exhaustive recon + staged move + per-step CoV.

This does not conflict with A4.1c ("collapse Vol3 Ch7/Ch8 over-splits, consolidate 2 duplicate ids"): A4.1c restructures the *survivors* — different ids. The `capitoli/v3-cap7.json` / `v3-cap8.json` files are touched twice across A4.1b→A4.1c, but sequentially and git-clean — not debt.

## Reference surface (recon-confirmed, iter 55)

| Layer | Files | Removal action |
|---|---|---|
| Lesson-paths | 13× `src/data/lesson-paths/v3-*.json` + `index.js` (13 imports + 13 registry entries) | move JSONs to `scripts/epic1/removed-no-volume-counterpart/` + manifest; delete imports + registry entries |
| Experiment defs | `src/data/experiments-vol3.js` (13 full experiment objects + `hexFile` refs) | splice out the 13 objects |
| Capitoli (whole files) | `src/data/capitoli/v3-bonus-lcd-hello.json`, `v3-bonus-servo-sweep.json` (each = 1 removed experiment) | whole-file move to `removed-no-volume-counterpart/` |
| Capitoli (partial) | `src/data/capitoli/v3-cap6.json`, `v3-cap7.json`, `v3-cap8.json`, `v3-cap9.json` (nested `esperimenti[]`) | remove the removed-id entries from `esperimenti[]` arrays |
| Grouping | `src/data/lesson-groups.js` (`v3-led-digitale`, `v3-input-analogico`, `v3-output-avanzato`, `v3-progetti-extra` arrays), `src/data/chapter-map.js` (`CAP6_INPUT_IDS` array + `getDisplayInfo` `-mini`/`-serial`/`-extra` regex branches) | remove ids from arrays; prune now-dead regex/array entries |
| Aux data | `src/data/concept-graph.js` (4 entries), `src/data/volume-references.js` (13), `src/data/welcome-messages.js` (4), `src/data/scratch-xml-templates.js` (2 comment mentions) | remove id-keyed entries; update comments |
| Consumers | `src/components/simulator/hooks/useExperimentLoader.js:99` (`v3-extra-simon` special-case branch), `src/services/compiler.js` (HEX_FILES map — 4 ids), `src/components/tutor/ElabTutorV4.jsx:1493` (AI prompt string lists `v3-extra-*`) | remove the special-case / map entries / prompt-string mentions |
| Tests | ~10–15 of 18 referencing test files (`chapterMap*`, `compiler.extended`, `conceptGraphAndPaths`, `volume-references-validity`, `dataIntegrity.cross`, `experimentConnections`, `experimentDataIntegrity`, `lessonGroup*`, `scratchXmlBlockly`, `breaknano.physical`, `drawingStorage`, `offtopicCategoryExpand`, 2× e2e vol3 specs) | update to the new reality — assertions on now-deleted data are corrected, **never weakened or skipped** |
| Build artifacts | `public/hex/*.hex` for ~6 of the 13 ids | flagged for Andrea — remove for cleanliness or leave; default = remove (a hex with no experiment is dead weight) |

## Test-count floor — re-baseline with arithmetic proof

Removing 13 experiment definitions legitimately removes their per-experiment **generated** tests (suites that iterate `ALL_EXPERIMENTS` / data maps: `experimentConnections` ~250 tests, `experimentDataIntegrity`, `chapterMapFull`, `conceptGraphAndPaths`, …). The vitest count **will drop** below the iter-54 floor of 14366. This is not a regression — it is the correct consequence of deleting the data.

**Decision: re-baseline with arithmetic proof.** Holding a frozen count is impossible during parità-stretta removal; padding with compensating tests games the metric. The honest path:

1. A4.1b updates `automa/baseline-tests.txt` (+ `.test-count-baseline.json` if present) to the new post-removal count as a **tracked, justified** step.
2. CoV proof in the commit message: `post-count = pre-count − Δgenerated`, where `Δgenerated` is the *computed* sum of generated tests for the 13 removed experiments. The equation must hold **exactly**. If even one extra test is missing → a real regression occurred → REVERT.
3. The pre-commit regression hook passes legitimately on the updated baseline — **no `--no-verify`, never**.

The anti-regression mandate's intent — "no test unexpectedly breaks" — is fully honored: the only tests that disappear are the ones generated from the deleted data, proven by arithmetic.

## Staged removal mechanism (git-recoverable, never blind `rm`)

1. **Move** — 13 lesson-path JSONs + 2 whole bonus-capitoli JSONs → `scripts/epic1/removed-no-volume-counterpart/`. Write `removed-no-volume-counterpart/MANIFEST.md` listing each id, its old path, and the A3 evidence quote from `a3-corrections.json` `note`.
2. **Update references** — every row of the reference-surface table; every consuming test updated to the new reality.
3. **CoV** — `node scripts/epic1/validate-lesson-paths.mjs` → 0 `pending-removal`; `npx vitest run` → equals the proven new floor; `npm run build` → exit 0; Codex Pattern V cross-check (`scripts/dev/codex-bg.sh … --profile verify`) confirms zero dangling refs.
4. **Commit the move** (move + manifest + baseline update).
5. **Commit the delete + reference updates** (all `src/` edits + test updates).

Git history keeps the 13 recoverable if a future complete Vol 3 edition restores the content (per A4 spec P2 — they'd be re-authored fresh, not resurrected, but the evidence trail stays).

## Deferred — A4.1d (documented, not fixed in A4.1b)

Per activation §4(c): the surviving lesson-paths whose `next_experiment.id` points at a removed id are **documented as a known A4.1d follow-up, not re-threaded here**. Recon-confirmed dangling set (4): `v3-cap6-semaforo→v3-cap6-esp6`, `v3-cap7-esp3→v3-cap7-esp4`, `v3-cap7-esp6→v3-cap7-esp7`, `v3-cap8-esp3→v3-extra-lcd-hello`. (Activation §4 says 5 and lists `v3-cap6-esp5`; its `next_experiment` is `v3-cap6-semaforo`, *not* a removed id — recon flags the discrepancy; the recon task confirms the final set.) Safe to defer: confirmed no test asserts `next_experiment` target-resolves (`experimentConnections.test.js` tests wire/pin validity per experiment, not chain integrity). The A4.1b manifest records the dangling set for A4.1d.

## Exit criteria

- `node scripts/epic1/validate-lesson-paths.mjs` → **0 `pending-removal`**; the 13 are gone from `src/data/lesson-paths/`.
- Zero dangling references to the 13 ids anywhere in `src/` (Codex Pattern V verified) — except the documented 4 deferred `next_experiment` links.
- `npx vitest run` = the proven new floor (re-baselined, arithmetic shown); `npm run build` → exit 0.
- `automa/baseline-tests.txt` updated to the new floor in the same commit, with the proof.

## Execution

Subagent-driven (`superpowers:subagent-driven-development`), **opus** subagents (no sonnet). Task shape: (1) exhaustive recon → recon doc classifying every reference; (2) staged move + manifest; (3) reference updates across all `src/` layers; (4) test updates to new reality; (5) CoV + Codex Pattern V + re-baseline + 2 commits. Spec + code-quality review between tasks.

## Honest caveats (NON COMPIACERE)

1. **A4.1b is larger than the activation roadmap implied** — it includes `experiments-vol3.js` + the `capitoli/` layer, which the roadmap omitted. Naming this explicitly; the smaller scope would have shipped phantom experiments.
2. **The test-count floor moves down.** This is a deliberate, owner-delegated re-baseline, not a silent weakening — but it does mean the iter-54 "14366" number is retired. The new number is only trustworthy because of the arithmetic proof; the proof must actually be produced, not asserted.
3. **`public/hex/` artifacts** are outside `src/` — default decision is to remove them, but they are build artifacts and their removal has no test/build coverage; flagged for Andrea.
4. **Activation §4's "5 dangling nextId" vs recon's 4** — minor discrepancy, resolved by the recon task before removal, not assumed away.
5. The `capitoli/` files will be touched again in A4.1c — sequential, git-clean, not debt, but worth stating so it is not a surprise.

---
_EPIC 1 A4.1b spec · iter 55 · governed by parità stretta · full removal, all `src/` data sources, staged + re-baselined with proof._
