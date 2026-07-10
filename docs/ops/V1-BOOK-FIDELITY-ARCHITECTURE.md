# ARDESIA V1 - Book Fidelity Architecture

Snapshot: `2026-07-10T15:52:44+0200 CEST`
Evidence base: `82bf629d0d73e837b4c58bed370b7f1d24509316`

Allowed claim labels: `VERIFIED`, `REPORTED`, `INFERRED`, `UNKNOWN`, `RED`,
`DEFERRED`.

## Ruling

Book fidelity is a P0 gate. The current repo has useful primitives, but no real
experiment is certified. `BookCircuitSpec` is a required target concept, not an
implemented runtime symbol.

## Current Model Map

| Model / surface | Evidence | Status | Limit |
|---|---|---|---|
| `ElabScene` / `circuit-scene/2` | `apps/studio/sim/elab/elabScene.ts:100-170` | VERIFIED | Strict schema and `canDriveLesson()` predicate exist |
| `SimulationSceneV1` renderer model | `apps/studio/src/toolhost/elabSceneBridge.ts:102-245` | VERIFIED | Bridge adapts candidate scenes; it does not enforce `canDriveLesson()` |
| Core `SimulationScene` / `simulation-scene/2` | `apps/studio/sim/core/simulationScene.ts` | VERIFIED | Separate model exists; ownership not decided here |
| `BookCircuitSpec` runtime symbol | `rg -n 'BookCircuitSpec|BOOK_CIRCUIT_SPEC' apps/studio plugins/elab-tutor` | RED | No runtime symbol found; prose-only target |
| Dedicated book predicates | `apps/studio/sim/elab/bookConstraints.ts`; `didacticSteps.ts` | VERIFIED | Partial corpus coverage |
| Generic step derivation | `apps/studio/sim/simulationSceneModes.ts:57-83` | RED | One synthetic final step is not editorial step fidelity |

## Required Identity Chain

```text
manual source + revision
  -> structured book target
  -> one ADR-selected canonical scene
  -> mounted projection
  -> authored step operations and prefix states
  -> final step state
  -> netlist + solver result
  -> export/reopen + tutor context
```

The user circuit is a separate object. A solver-valid alternative can be
`VALID_ALTERNATIVE`, but it is not `BOOK_FAITHFUL`.

Required invariants:

```text
reduce(book_step_operations) == mounted_scene
netlist(reduce(book_step_operations)) == netlist(mounted_scene)
netlist(mounted_scene) == netlist(structured_book_target)
```

Current generic step derivation cannot satisfy the first invariant because it
places the final scene into a single synthetic step.

## Architecture Options

| Option | Description | Status | Consequence |
|---|---|---|---|
| A | `BookCircuitSpec` as certification envelope over one ADR-selected canonical scene | INFERRED | Recommended. Avoids a third mutable scene model; stores source hashes, reviewer receipts, operations and gates |
| B | Promote `ElabScene` / `circuit-scene/2` to canonical scene | INFERRED | Plausible for ELAB circuits, but risks coupling all simulator ownership to ELAB-specific schema |
| C | Promote core `SimulationScene` to canonical and make ELAB data projections | INFERRED | Plausible if simulator core owns all circuit truth; requires lossless ELAB provenance projection |
| D | Create `BookCircuitSpec` as a third independent scene model | RED | Increases drift risk; violates single source-of-truth requirement unless generated only |

## Recommended Decision

Status: INFERRED.

Adopt option A unless a formal ADR proves otherwise:

1. Select exactly one canonical scene owner.
2. Define `BookCircuitSpec` as an immutable certification envelope, not another
   editable runtime scene.
3. Generate mounted, step, solver, export and tutor projections from that owner.
4. Store the book source receipt, scene revision, operation list, negative
   mutation receipts, human review receipt and Principle Zero review together.
5. Fail closed: no certification if any projection is missing or divergent.

## Minimal Envelope Fields

| Field group | Required content | Status today |
|---|---|---|
| Source | volume, chapter, pages, PDF identity, page/crop hashes, source revision | VERIFIED partial in current fixtures/matrix |
| Scene | canonical scene revision, schema version, components, terminals, holes, wires, authored paths | VERIFIED partial for 4/88 |
| Electrical | expected nets, solver engine version, solver result, negative mutations | VERIFIED partial for 4/88 |
| Visual | constraints, overlay receipt, screenshot regression, human review | RED because human/CV `visualMatch` is absent |
| Steps | ordered operations, every prefix state, final equality | RED because current steps are cumulative predicates, not operations |
| Tutor | quote/context receipt, diagnosis receipt, P0 route channel | RED because P0 runtime is not compliant |
| Round-trip | save/reopen/export/import/tutor-context equality | UNKNOWN |

## ADR Acceptance Gate

An ADR is acceptable only if it answers these questions with evidence:

1. Which single scene representation owns circuit truth?
2. Which objects are projections only?
3. How are book steps represented as operations rather than final-state checks?
4. How does a candidate scene remain inspectable but barred from lesson-driving?
5. Where is human book review stored?
6. How does the tutor receive source and circuit provenance without inventing it?

Until then, architecture status remains RED for certification work.
