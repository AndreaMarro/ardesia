# ARDESIA V1 — Book Fidelity Canon

Evidence commit: `cedfa932dc91088e6bd30af49ed0f648157c6e1b`
Snapshot / last verified: `2026-07-10T03:49:35+02:00`
Canon recovery: **VERIFIED**
Corpus certification: **0 real experiments CERTIFIED**
Release terminal: **BOOK_FIDELITY_RED**

Confidence rule: HIGH for tracked schemas, fixtures, hashes, catalog entries and
static tests at the evidence commit; MEDIUM for historical reports not rerun;
UNKNOWN for crop-to-render identity, human book review and deployed behavior.
Every scoped fraction below uses the 88-entry lesson-path registry as denominator.

## Evidence classification

| Item | Evidence status |
|---|---|
| Required fidelity dimensions and `BookCircuitSpec` mandate | **VERIFIED** from the current direct mandate |
| Schemas, fixtures, catalog entries, predicates and tests listed below | **VERIFIED** by static inspection at the evidence commit |
| Historic standalone coverage claims | **REPORTED** lineage only; not reused as current counts |
| Visual identity of any real experiment with the physical book | **UNKNOWN / RED** because all real fixtures record `visualMatch: unknown` |
| Proposed role of a future `BookCircuitSpec` relative to current models | **INFERRED / ADR_REQUIRED** |
| Exact currently deployed Studio/Simulation behavior | **UNKNOWN**; no live runtime was exercised in this slice |

## Definition

Book fidelity is a conjunction of independently falsifiable properties. A
circuit is faithful only when all required dimensions pass for one named
experiment and revision:

1. **semantic** — component types, counts, values, polarity, supply, function,
   initial and expected outcome;
2. **topological** — board model, rails/segments, holes, pins, legs, endpoints,
   nets, jumpers, bridges and breaks;
3. **visual/geometric** — position, orientation, footprint, scale, colors,
   number and route of wires, bends/waypoints, labels and viewport legibility;
4. **electrical** — derived netlist and solver behavior;
5. **didactic/temporal** — prerequisites, ordered operations, every prefix
   state, active/highlighted element, backward navigation and resume;
6. **provenance** — exact manual, volume, chapter, page, revision, source asset
   hash/crop, author/reviewer and check receipts;
7. **round-trip** — save/reopen, undo/redo, import/export and tutor context keep
   the same structured truth.

Electrical equivalence is not editorial equivalence. Pixel-perfect similarity
alone is not proof either. Use structural constraints, geometric anchors and
tolerances, solver assertions, screenshot regression, and human review.

## Identity chain and ownership

```text
manual source + revision
  -> structured book target
  -> one canonical circuit scene selected by ADR
  -> mounted projection
  -> authored step operations and prefix states
  -> final step state
  -> netlist + solver result
  -> export/reopen + tutor context
```

The user circuit is a separate object. A solver-valid alternative may be
labelled `VALID_ALTERNATIVE`; it must not be silently promoted to
`BOOK_FAITHFUL`.

The mounted scene and step-by-step mode may be projections of the same
canonical scene, but the step sequence must carry real operations/deltas. It
must not maintain independent geometry and must not satisfy equality merely by
placing the complete final scene into one synthetic step.

Required invariants:

```text
reduce(book_step_operations) == mounted_scene
netlist(reduce(book_step_operations)) == netlist(mounted_scene)
netlist(mounted_scene) == netlist(structured_book_target)
```

Equality is computed on normalized domain state, never DOM/SVG identity.

The observed implementation is not yet that decision: `ElabScene`
(`circuit-scene/2`) is adapted through `elabSceneBridge.ts` into renderer model
`SimulationSceneV1`, while a separate core `SimulationScene`
(`simulation-scene/2`) also exists. This is **VERIFIED AS-IS**, not permission
to call two models canonical. The ADR must select ownership and make every
other shape a validated projection.

## Manual source conflict

`apps/studio/sim/elab/didacticSteps.ts:5-6` records a concrete conflict for
Vol.1 cap.6 esp.1: it states that, read literally, text and figures on pp.29-31
do not yield the same circuit and the figures leave it open. This conflict is
**VERIFIED as a tracked implementation premise**, not independently adjudicated
against the physical book in this slice. The current code chooses the text as
authoritative, but that precedence is an implemented choice rather than a
human-ratified book rule. Experiment 1 remains **RATIFY_REQUIRED** and cannot be
certified until a reviewer checks the physical volume/revision and records
whether text, figure, or an erratum wins.

## Contract naming: `BookCircuitSpec`

The current direct mandate requires `BookCircuitSpec`/`BOOK_CIRCUIT_SPEC` with
source assets, board definition, component/value/terminal/hole mappings, wire
endpoints/routes/colors, expected nets/solver result, visual constraints,
steps, pedagogy, Principle Zero constraints and provenance.

No tracked runtime symbol named `BookCircuitSpec` exists at this commit.
`rg -n 'BookCircuitSpec|BOOK_CIRCUIT_SPEC' apps/studio plugins/elab-tutor docs`
finds only V1 planning/claim prose. The implemented domain models are:

- `ElabScene` / `circuit-scene/2` at
  `apps/studio/sim/elab/elabScene.ts:100-170`;
- `SimulationScene` / `simulation-scene/2` at
  `apps/studio/sim/core/simulationScene.ts:69-103`;
- book-specific predicates in `apps/studio/sim/elab/bookConstraints.ts`;
- didactic predicates in `apps/studio/sim/elab/didacticSteps.ts`.

Therefore `BookCircuitSpec` is **REQUIRED TARGET, NOT IMPLEMENTED CANON**. An ADR
must decide whether it is a validated view/composition over the ADR-selected
canonical scene or an extension of that selected schema. It must not become a
third independent scene source or silently preselect `ElabScene` as owner.

## Current implementation — reproduced

| Area | Evidence | Honest status |
|---|---|---|
| Structured scene schema | `elabScene.ts:100-170`; strict Zod, provenance and four checks | BUILT |
| Lesson-driving gate | `canDriveLesson` requires `verified` and all four checks pass (`elabScene.ts:164-170`) | BUILT as predicate; **NOT ENFORCED** by candidate mount path |
| Real candidate scenes | Four candidate JSON fixtures: v1 c6 e1/e2/e3 and v1 c9 e6 | 4/88 MOUNTED, all CANDIDATE |
| Geometry | All four candidates have authored component poses/wire paths and committed structural overlay receipts | VERIFIED structural-only for 4/88 |
| Source evidence | All four carry source image hashes; no crop bounding boxes | PARTIAL |
| Book predicates | Four experiment-specific functions in `bookConstraints.ts` | 4/88 PARTIAL |
| Structural overlay receipts | Four `docs/ops/overlays/*-report.json` receipts bind crop SHA, 0.5 px grid tolerance and recomputable scene metrics; companion PNGs place crop and scene side by side | VERIFIED artifact, not CV/human comparison |
| Visual fidelity | All four real candidates retain `visualMatch: unknown`; overlay metrics grade scene-to-grid consistency, not image similarity to the book | **RED** |
| Human verification | Only `elab-scene-v2-verified-synthetic.json` is verified; it is schema coverage, not a book experiment | **0 real verified** |
| Catalog honesty | `elabExperimentCatalog.ts:28-116` exposes four mounted candidates of 88 | BUILT; not certification |
| Real didactic steps | `simulationStepMode.ts:40-123` and `didacticSteps.ts`; e1/e2 only | 2/88 PARTIAL |
| Step falsifiability | Removing battery wires makes real predicates fail (`SimulationStepByStep.test.tsx:46-95`) | VERIFIED for tested slice |
| Temporal operations | `didacticSteps.ts:12-16` explicitly uses cumulative final-state predicates; per-delta semantics is future work | **RED** against strict invariant |
| Generic mode derivation | `simulationSceneModes.ts:57-83` creates one final step containing the full scene | NON-DISCRIMINATING |
| Generic equality test | `SimulationSceneModes.test.ts:27-34` compares that synthetic final scene to itself | must not count as book-step proof |
| Candidate mount enforcement | `ElabSceneAdapter.test.ts:23-30` proves a real candidate has `canDriveLesson:false`; `elabSceneBridge.ts:102-170` does not enforce it and `ToolCanvasEmbeddable.tsx:595-633,966-1010` can insert/mount candidates | **RED** |
| Independent `bookLayout` evidence | `elabSceneBridge.ts:202-238` derives `bookLayout` from the same candidate scene and explicitly leaves independent verification elsewhere | circular internal-drift check only; **RED** as book proof |
| Save/reopen/export/tutor parity | Individual primitives exist; no one per-experiment certification bundle proves the full chain | UNKNOWN |

The historic `ELAB-SCENE-FORGE-CANON.md:11-30,55-65` reports a standalone
baseline with partial layout geometry, 83/88 pin assignments, 0/88 scene
provenance and 3/88 book photos. Those counts are lineage, not silently reused
as current monorepo counts. At this commit the current monorepo truth is four
mounted **candidate** scenes, two with didactic predicate sets, four committed
`verified-structural` overlay receipts, and zero real scenes with independent
visual/human verification. The receipts are guarded by
`VisualOverlayReport.test.ts`, but their zero-error metrics are computed from
the authored scene against its breadboard grid. The book crop is displayed
beside that projection; no CV/pixel comparator scores crop-to-render identity.

## Certification states

Per experiment and revision, use monotonic evidence states:

`UNMAPPED -> SOURCE_CAPTURED -> STRUCTURED -> TOPOLOGY_VERIFIED ->`
`VISUALLY_VERIFIED -> STEP_SEQUENCE_VERIFIED -> SOLVER_VERIFIED ->`
`TUTOR_VERIFIED -> PRINCIPLE_ZERO_VERIFIED -> CERTIFIED`

`REJECTED` is terminal for that revision. A later correction requires a new
revision and new evidence; it must not rewrite the failed receipt.

`canDriveLesson:false` must be a hard boundary, not metadata. At this commit,
all four real fixtures correctly fail the predicate yet remain mountable through
the bridge/UI path. Mounting a candidate for inspection may be legitimate only
when visibly labelled and technically barred from lesson-driving, certification
claims, and tutor grounding.

The only allowed external claim is scoped:

> Experiment X, revision Y, certified against Volume Z, pages P-Q.

Never advertise global book fidelity from a sample.

## Minimum per-experiment gate

1. Schema and provenance validation.
2. Component count/type/value/polarity.
3. Terminal and hole mappings; breadboard rail segmentation.
4. Wire endpoints, count, color and authored route.
5. Expected nets and independent solver result.
6. Mounted reconstruction from the canonical scene.
7. Real step operations, every prefix, wrong-order failure and final equality.
8. Structural visual anchors plus screenshot regression with tolerances.
9. Human comparison against the licensed source on critical samples.
10. Save/reopen, undo/redo and export/import round-trip.
11. iPad and LIM viewports.
12. Tutor quote/context, erroneous-circuit diagnosis and Principle Zero review.

Tests must include negative mutations: swap polarity, move one hole, remove or
add a wire, alter value/color/route, reorder a step, corrupt page/hash, and use
an electrically equivalent but editorially divergent circuit. A test that
cannot fail under such a mutation is not certification evidence.

## Positive and forbidden examples

Positive:

- a candidate scene becomes verified only after all four checks and a named
  human book review;
- step 3 is an operation applied to prefix state 2, and removing it makes final
  equality fail;
- a valid alternative is preserved and explained as an alternative, not book
  identity.

Forbidden:

- “identical to the book” based only on a green solver or screenshot;
- synthetic one-step equality presented as step-by-step fidelity;
- invented pins, holes, wire routes or intermediate steps;
- hidden auto-correction of student work;
- `verified` on generated/imported content without source and human receipts;
- treating the synthetic verified fixture as a certified experiment.

## Ruling

The fidelity principles and required evidence chain are recovered reliably.
Implementation is materially ahead of the historic standalone baseline, but
the strict V1 requirement is not met: real scenes remain candidates,
structural overlay receipts exist but `visualMatch` is still unknown, the
lesson-driving predicate is bypassed by the candidate mount path, `bookLayout`
is derived circularly from the candidate, temporal steps are cumulative
predicates rather than reducible operations, and most of the 88-experiment
corpus is unmapped. The scientific terminal is **BOOK_FIDELITY_RED**.
