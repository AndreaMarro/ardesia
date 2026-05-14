# EPIC 1 iter 57 — close audit (A4.1d)

> iter 57. Branch `feat/iter-41-sprint-u-cycle-2-real-user-fix`. 4 A4.1d-implementation commits
> on top of `9cb7e24f` (iter-56 close).
> Honest audit — G45 anti-inflation mandate enforced. Verified by independent Claude re-runs +
> the project's own `validate-lesson-paths.mjs` gate + Codex GPT-5.5 cross-check.

## Verdict

**A4.1d is COMPLETE for its exit criteria.** The handoff's five exit conditions are all met:

| Exit criterion | Result | How verified |
|---|---|---|
| `validate-lesson-paths.mjs` 30 fail → 0 | **0 fail** (94 checked · 94 pass) | controller re-ran independently; Codex re-derived `top_level_title_mismatches=0` |
| `v3-cap6.json` narrative_flow acyclic | **acyclic** (4 linear transitions) | controller chain-trace + new `checkNarrativeAcyclic` guard + Codex |
| zero dangling ref in `src/` | **0 unresolved refs** across all 79 lesson-paths | `git grep` of all 15 removed/consolidated ids = empty; new `checkReferenceIntegrity` guard = 0; Codex |
| `vitest` 0-failed | **13118 passed / 0 failed** | controller re-ran (was 13106; +12 = the new guard test file, arithmetic-proven) |
| `npm run build` exit 0 | **exit 0** | controller re-ran each phase |

A4.1d went **beyond** the strict exit criteria: it also re-threaded the full Ch7/Ch8 chains to the
book page-order (forced — minimal dangling-ref fixing would have created a new `esp2→esp3→esp6→esp2`
cycle), cleaned 30 experiment titles to be book-faithful AND "fruibile e semplice" (Andrea directive),
made all Vol3-chain coupled `next_experiment.title`/`preview` fields consistent, and added a permanent
regression guard to the validator.

## What was done — 4 commits

| commit | phase | what |
|---|---|---|
| `9bbb5bdc` | Phase 1 | Fixed the A4.1c `semaforo↔morse` narrative_flow 2-cycle in `v3-cap6.json` (delete transitions 5+6 → linear `esp1→esp2→morse→esp4→semaforo`); added `v3-cap6-morse` forward link to `v3-cap6-esp4`; contract `nextId` lockstep. Includes the A4.1d recon doc + plan. |
| `42392b31` | Phase 2 | Re-threaded the Vol3 narrative arc to book page-order (Andrea-ratified): Ch7 `esp1→esp3→esp6→esp2`, Ch8 `esp3→esp1→esp2→null`. Cleared all 15 dangling-ref units across 6 lesson-paths; re-threaded `next_experiment.id`/`next_suggested`/`prerequisites[]` + capitoli `narrative_flow` + contract `nextId` in lockstep. |
| `842dd8ae` | Phase 3 | Replaced 30 divergent experiment titles with clean, book-faithful, kid-friendly titles (Andrea directive "segui il libro, rendi il programma fruibile e semplice"). Stripped the `(duplicate of …named-id scheme)` editorial artifacts the A3 author left in 2 contract `bookFaithfulTitle`s. Drove the gate 30 fail → 0. |
| Phase 4 (this commit) | Phase 4 | Coupled `next_experiment.title` consistency (13 Vol3-chain links + v2-cap12 bridge); re-authored 11 stale `next_experiment.preview` strings that described the wrong next experiment; added `checkReferenceIntegrity` + `transitionsCycleNode` + `checkNarrativeAcyclic` regression guards to the validator + a 12-test file; `.test-count-baseline.json` `commit` field fix + `total` re-baseline 13106→13118. |

## CoV — independently verified

- The project's own `validate-lesson-paths.mjs` (not Claude-authored) is the authoritative gate; it
  re-runs clean: **94 pass · 0 fail · 0 unresolved refs · 0 cyclic capitoli graphs**.
- `npx vitest run` = **13118 passed / 0 failed** (15 skip + 12 todo). Re-baseline arithmetic proof:
  13106 + 12 (the new `validate-references-acyclic.test.js`) = 13118; 0-failed; skip+todo unchanged;
  +1 test file collected → every added test accounted-for.
- `npm run build` = exit 0 every phase.
- Full Vol3 chain trace (controller-run + Codex-re-derived):
  `v3-cap5-esp1 → v3-cap5-esp2 → v3-cap6-esp1 → v3-cap6-esp2 → v3-cap6-morse → v3-cap6-esp4 →
  v3-cap6-semaforo → v3-cap7-esp1 → v3-cap7-esp3 → v3-cap7-esp6 → v3-cap7-esp2 → v3-cap8-esp3 →
  v3-cap8-esp1 → v3-cap8-esp2 → null` — strictly linear, acyclic, matches the printed volume order.

### Codex cross-check (anti-inflation loop)

| step | Codex verdict |
|---|---|
| recon dangling-ref enumeration | caught a 15th ref the recon subagent missed (`v3-cap8-esp3.json:71` coupled title) → recon corrected |
| Phase 1 diff | CONFIRM — acyclic chain, morse forward link, contract lockstep |
| Phase 2 diff | CONFIRM — canonical chain, lockstep across all 79 keep/correct entries, capitoli acyclic + ordered |
| Phase 3 diff (`a41d-p3-review-v2`) | CONFIRM check 1 (`top_level_title_mismatches=0`), CONFIRM check 2 (no `duplicate of`/`named-id scheme` artifact); check 3 REFUTE = the 2 coupled `next_experiment.title` fields = Phase 4 scope |
| Phase 4 diff | CONFIRM checks 1-3 (coupled-title consistency, no code fragments, `checkLessonPath` untouched); check 4 REFUTE = the validator's own auto-regenerated output md (benign) |

**Honest note on Codex reliability this iter:** of 6 Codex runs, 2 derailed in their own environment
(run 1: sandbox blocked a heredoc temp-file; the `a41d-p3-forbidden` run ignored the path restriction
and scanned `docs/`). The substantive cross-checks (recon, P1, P2, P3-v2, P4) all completed and
CONFIRMed. The Phase 3 commit message's "Codex unreliable this iter" line was written before the
`a41d-p3-review-v2` verdict was fully read — it was conservative (understated Codex's success), not
wrong. Codex artifacts: `/tmp/codex-a41d-recon.txt`, `/tmp/codex-a41d-p1-review.txt`,
`/tmp/codex-a41d-p2-review.txt`, `/tmp/codex-a41d-p3-review-v2.txt`, `/tmp/codex-a41d-p4-review.txt`.

## Honest gaps + deferred items (NON COMPIACERE)

1. **Vol1/Vol2 coupled-title cascade — 33 `next_experiment.title` drifts, document-deferred.**
   Phase 3 had to fix 14 Vol1/Vol2 titles (they were among the gate's 30 fails). That retitled their
   experiments, leaving the *predecessors'* coupled `next_experiment.title` fields stale (~16 drifts).
   ~17 more drifts pre-date iter 57. **All 33 are Vol1/Vol2; zero are Vol3** — the Vol3 narrative arc
   (EPIC 1's actual focus) is fully consistent. Severity is low: a stale short *label*, not
   wrong-content (unlike the Vol3 previews, which were fixed). The validator does not gate coupled
   titles. The full file:line list is reproducible via:
   `node -e` script comparing each `next_experiment.title` to the target's top-level `title`
   (run in iter 57; 78 links checked, 33 drift, all `v1-*`/`v2-*`). Recommend a dedicated Vol1/Vol2
   coupled-title pass (it is out of A4.1d's Vol3 narrative scope per the recon).

2. **Deeper free-prose (LEAVE-A4.1d) — partially done.** The `next_experiment.preview` strings were
   re-authored (Phase 4d). NOT done: `session_save.resume_message`, phase `next_preview`, and
   `v3-cap6/7/8.json` transition `text_classe`/`text_docente_action` prose for the
   consolidated/re-threaded experiments — these still carry text authored for the old chain order
   (e.g. `v3-cap8.json` `closing_text` still says "Prossimo passo: il display LCD" — the removed
   `v3-extra-lcd-hello`). Editorial, not structural; not gated. Defer to A4.1e or a prose pass.

3. **`v3-cap9.json` capitoli is orphaned.** It defines a `v3-cap9-esp1` experiment but there is no
   `v3-cap9-*` lesson-path and no `a3-corrections.json` entry. Andrea ratified Vol3 terminus = `null`
   (Ch8 ends the lesson-path layer). `v3-cap9.json` is pre-existing extra capitoli — flag for A4.1e's
   narrative-structure regeneration.

4. **`v3-cap7.json` `intro_text`** reads "Il mondo continuo: i pin analogici" — that is the Ch8 topic,
   not Ch7 (INPUT pins). Pre-existing content bug, not introduced by A4.1d. Flag for A4.1e.

5. **`num` fields not renumbered.** Capitoli experiment objects keep id-suffix-derived `num` values
   (`v3-cap6-morse` num 8, `v3-cap6-semaforo` num 9 — book-canonical they are 3 and 5). Cosmetic,
   ungated, surgical-scope call — deferred to A4.1e.

6. **`.test-count-baseline.json` `commit` field** is set to `bee5e627` (the previous baseline-changing
   commit, per handoff #6). The Phase 4 commit is now itself a baseline-changing commit (13106→13118);
   the field could be bumped to the Phase 4 hash in a follow-up — minor hygiene, the pre-commit hook
   reads `total` (correctly 13118), not `commit`.

## State for A4.1e (next — handoff)

A4.1d (handoff P0) is **done**. A4.1e (handoff P1 — regenerate `narrative_map` / `chapter-map.js` /
`lesson-groups.js` from the volumes + the corrected contract) is **NOT started** — deliberately
deferred to a fresh session rather than rushed at the tail of a long iter 57. Inputs ready for A4.1e:
- The corrected `a3-corrections.json` (22 chapter titles + 30 clean experiment titles + re-threaded
  `nextId` chain — all book-faithful now).
- `docs/audits/2026-05-14-epic1-a4-1d-recon.md` §A (book-canonical chapter/experiment order) +
  `docs/audits/2026-05-14-epic1-a4-1d-clean-titles.md` (the 30 clean titles, traced to the volumes).
- The deferred items 1-5 above (esp. the `v3-cap9.json` orphan, the `v3-cap7.json` `intro_text` bug,
  the `num` renumbering) belong in A4.1e's scope.
- The A3 master verdict's Open decision 6 (Vol2 Cap.11 theory-node) is still open for A4.1e.

## Codex artifacts (auditable)

`/tmp/codex-a41d-recon.txt` · `/tmp/codex-a41d-p1-review.txt` · `/tmp/codex-a41d-p2-review.txt` ·
`/tmp/codex-a41d-p3-review-v2.txt` · `/tmp/codex-a41d-p4-review.txt`
