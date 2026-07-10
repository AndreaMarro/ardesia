# ARDESIA V1 - Book Circuit Certification Matrix

Snapshot: `2026-07-10T15:52:44+0200 CEST`
Evidence base: `82bf629d0d73e837b4c58bed370b7f1d24509316`

Allowed claim labels: `VERIFIED`, `REPORTED`, `INFERRED`, `UNKNOWN`, `RED`,
`DEFERRED`.

Domain evidence terms such as `candidate`, `verified-structural`, and
`verified-human` are source states, not claim labels. The current certification
claim is: 0 real experiments are certified.

## Corpus Summary

| Scope | Count | Status | Evidence | Limit |
|---|---:|---|---|---|
| ELAB lesson-path corpus | 88 | VERIFIED | `ELAB_CORPUS_TOTAL=88` in `apps/studio/src/toolhost/elabExperimentCatalog.ts:28-116`; test checks lesson-path count | Count is not certification |
| Mounted real candidate scenes | 4/88 | VERIFIED | Catalog rows for `v1-cap6-esp1`, `v1-cap6-esp2`, `v1-cap6-esp3`, `v1-cap9-esp6` | All are `sceneStatus: "candidate"` |
| Real scenes with structural overlay receipts | 4/88 | VERIFIED | `docs/ops/overlays/*-report.json`; `VisualOverlayReport.test.ts:18-45` | Structural-only; no human visual verification |
| Real scenes with `visualMatch: pass` | 0/88 | VERIFIED | Four candidate fixtures retain `visualMatch: "unknown"` | Blocks certification |
| Dedicated didactic predicate sets | 2/88 | VERIFIED | `SimulationStepByStep.test.tsx:46-95` covers esp1; catalog says esp2 has dedicated passo-passo | Predicate semantics are cumulative |
| Real experiments certified | 0/88 | VERIFIED | No real fixture has full verified status plus visual/human/P0/round-trip receipts | Release gate remains RED |

## Visible-Experiment Matrix

This matrix is scoped to the eight visible experiments from the tracked
visibility matrix. The file itself is future-dated relative to this run, so it
is used only as tracked repository state, not as chronological proof.

| ID | Current source state | Status | Certification blocker |
|---|---|---|---|
| `v1-cap6-esp1` | Mounted candidate; structural overlay receipt; passo-passo available | RED | `visualMatch` unknown, no human review, text/figure conflict unresolved, steps are predicates not operations |
| `v1-cap6-esp2` | Mounted candidate; structural overlay receipt; passo-passo available | RED | `visualMatch` unknown, no human review, no full P0 tutor/round-trip certification |
| `v1-cap6-esp3` | Mounted candidate; structural overlay receipt; no passo-passo | RED | Step grammar cannot express resistor value changes; `visualMatch` unknown; no human review |
| `v1-cap9-esp6` | Mounted candidate; structural overlay receipt; multi-pin solve path | RED | Wiper interaction fixed/incomplete, `visualMatch` unknown, no human review, no passo-passo |
| `v2-cap7-esp1` | Static-only / PDF reference identified | RED | Full-size board, capacitor, multimeter and transient RC model are not certified |
| `v2-cap7-esp2` | Static-only / PDF reference identified | RED | Same RC/multimeter gaps plus LED discharge behavior |
| `v3-cap6-esp4` | Static-only with Arduino artifact lineage | RED | Breakout scene, upload proof and full scene fixture are missing for certification |
| `v3-cap6-esp5` | Static-only with HEX quarantine noted | RED | Declared HEX missing/quarantined; no certified scene or upload proof |

## Evidence Receipts Checked

| Receipt | Status | Evidence |
|---|---|---|
| Four catalog entries are present | VERIFIED | `apps/studio/src/toolhost/elabExperimentCatalog.ts:38-106` |
| Four candidate fixtures are not verified scenes | VERIFIED | each `apps/studio/sim/fixtures/elab-scene-v2-candidate-*.json` has `status: "candidate"` |
| Candidate fixtures have `visualMatch: "unknown"` | VERIFIED | same fixtures |
| `canDriveLesson()` rejects candidates | VERIFIED | `apps/studio/sim/elab/elabScene.ts:164-170`; `ElabSceneAdapter.test.ts:23-30` |
| Bridge can adapt candidates without enforcing lesson gate | RED | `apps/studio/src/toolhost/elabSceneBridge.ts:102-170` |
| Generic step equality is tautological | RED | `apps/studio/sim/simulationSceneModes.ts:57-83`; `SimulationSceneModes.test.ts:27-34` |
| Structural overlay reports are recomputable | VERIFIED | `apps/studio/src/__tests__/VisualOverlayReport.test.ts:18-45` |

## Certification Gate Per Experiment

A real experiment can move from RED to VERIFIED only when one named revision has
all of the following receipts:

1. Source PDF/page/crop identity with hash.
2. Component count/type/value/polarity.
3. Terminal and hole mapping.
4. Wire endpoints, color and authored route.
5. Expected nets and independent solver result.
6. Mounted projection from the canonical scene.
7. Step operations, every prefix state, wrong-order failure and final equality.
8. Structural visual anchors plus screenshot regression.
9. Human or robust CV comparison against the source page.
10. Save/reopen, undo/redo and export/import round-trip.
11. iPad and LIM viewport proof.
12. Tutor quote/context, erroneous-circuit diagnosis and Principle Zero review.

No aggregate count or green CI run substitutes for this per-experiment gate.
