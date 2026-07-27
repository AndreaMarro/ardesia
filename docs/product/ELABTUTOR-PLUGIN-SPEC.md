# ELABTutor Plugin — Product and Technical Specification

Status: canonical product specification with measured Session 2 supplement; `PARTIAL_BLOCKED`
Date: 2026-07-02; measured supplement 2026-07-27
Scope: ARDESIA ELABTutor Pack/Plugin + Simulation Plugin requirements
Non-goal: this document does not implement runtime code, deploy, marketplace, auth, AgentMemory mutations, or Vercel changes.

## Measured Session 2 status

The local candidate advances one deliberately narrow vertical:

```text
Room composition root
  → SDK 1.4 simulation.loadScene
  → SDK 1.4 simulation.applyOperation(connect-wire)
  → ToolHost capability boundary
  → real simulation runtime/provider
  → scoped receipt + diagnostics
  → board.write own-embed
  → marker v2 / cold restore / .lesson import-export
```

Room, tool, and instance identities are derived by the host, not trusted from
the canvas payload. Expected-digest, capability, kill-list, provider,
concurrency, stale-response, malformed-result, marker-integrity, corrupted
import, and room/instance isolation controls fail closed in the measured slice.

This proves host mediation only for the live `connect-wire` gesture. Other
canvas operations still bypass the new broker path. The `v3-cap6-esp4` scene is
a candidate with `visualMatch: unknown`, and its manual/scene/instance evidence
has `resolution: missing`. The honest verdict is **partial simulation harness**:
not a complete plugin, beta, manual-fidelity proof, or Tinkercad parity.

## 0. Executive verdict

ELABTutor must not become a second application inside ARDESIA.

Correct product hierarchy:

```text
ARDESIA Core
  = board, shell, ToolHost, memory, LessonOS graph, marketplace, export/import,
    student-pack, user/tutor dashboard, auth future, integrations.

Simulation Plugin
  = reusable technical circuit simulator, targeting Tinkercad parity but
    ARDESIA-native, embeddable on the board as a post-it/tool object. The
    current primary board embed mounts the ELABTutor core canvas through a
    `SimulationScene` adapter, while the standalone/generic post-it workbenches
    remain harnesses. Mutating AI/runtime operations now pass through
    placement validation, wire endpoint/waypoint/path editing, occupancy validation,
    pin-vocabulary validation, active-provider solve, provider-derived
    voltmeter/probe/ammeter readings, and fail-closed advanced instrument
    capability checks. Runtime requests are board-scoped so Nano R4 cannot fall
    back to ATmega328p, but executable microcontroller providers are still
    partial. Persisted legacy free-assembly state is projected into the ELAB
    core canvas as sandbox/monta-tu and now carries structured
    `place-component` envelopes for the placement pipeline, while native canvas
    tools remain incomplete. ELAB canvas wire add/update/delete callbacks are
    bridged into structured simulator operations; this is still not full
    Tinkercad parity. ToolHost also exposes a host-mediated `lesson.event.emit`
    channel for evidence-backed LessonOS events, including lifecycle, material,
    error, exercise, and `simulation.step.completed`; plugins still never write
    the graph directly.

ELABTutor Plugin/Pack
  = discipline-specific pack built on top of the Simulation Plugin, containing
    manuals, experiments, lesson paths, validators, didactic steps, and
    manual-faithful circuit scenes.
```

The first product direction is not “build all ELAB again”. The first direction is:

```text
one manual-faithful ELAB experiment
-> canonical fixture
-> drift tests
-> adapter contract
-> board payload contract
-> post-it/lavagna mount
-> export/import
-> LessonOS evidence
```

## 1. Product intent

ELABTutor inside ARDESIA must let a teacher or tutor teach electronics/electrotechnics using a board/lavagna where the manual, circuit, diagnostics, guided steps, simulator, and explanation live as objects on the page.

The goal is a didactic environment where a student can see exactly:

- what the manual asks;
- what components are needed;
- where each component goes;
- how the physical circuit corresponds to the simulator;
- what the next step is;
- why an error is an error;
- how the same circuit becomes notes, student-pack, exam practice, or graph knowledge.

The plugin must feel like a teacher’s live workspace, not like a detached web app.

## 2. Non-negotiable principles

### 2.1 ELABTutor is a Pack/Plugin, not ARDESIA Core

ELABTutor owns:

- ELAB manual references;
- ELAB lesson-path data;
- ELAB experiment definitions;
- ELAB-specific validation rules;
- ELAB-specific didactic steps;
- ELAB-specific scene presets;
- ELAB-specific “manual aligned” copy and guidance;
- ELAB-specific student exercises.

ELABTutor must not own:

- ARDESIA shell;
- global navigation;
- auth;
- user memory;
- LessonOS graph core;
- report infrastructure;
- marketplace infrastructure;
- teacher dashboard shell;
- plugin permission system;
- global export/import;
- AI methodology layer;
- student database;
- billing/subscription.

### 2.2 Simulation Plugin is reusable and lower-level

The Simulation Plugin must be useful beyond ELABTutor.

It should support:

- circuit scenes;
- component registry;
- breadboard geometry;
- wire topology;
- pin assignments;
- validators;
- Arduino-like exercises;
- import/export;
- board embeddability;
- drift tests;
- reusable simulation state.

ELABTutor then uses this plugin as its technical base.

### 2.3 Plugin objects live on the board as post-it/carta objects

The plugin must not be hidden in a side panel as the primary experience.

Preferred interaction:

```text
board/lavagna
  -> user adds ELABTutor / Simulation Plugin
  -> simulator appears as an embedded post-it/tool card on paper
  -> manual snippet/post-it can be attached nearby
  -> diagnostics post-it can be attached nearby
  -> step-by-step post-it can be attached nearby
  -> circuit state is part of the lesson export/import
```

The board is the main place. Panels may support the experience, but must not replace the page.

### 2.4 Manual fidelity is a moat

The plugin must be faithful to the ELAB manual and physical kit.

Manual fidelity means:

- correct volume;
- correct chapter;
- correct experiment;
- correct pages;
- correct required components;
- correct breadboard/component relative layout;
- correct polarity rules;
- correct step sequence;
- correct physical meaning;
- no invented text;
- no untraceable circuit transformations;
- drift tests when data/code diverges.

Important nuance: where the manual says “any point” or equivalent open placement, the plugin may select one canonical coordinate for simulation, but it must document that this is a canonical simulator placement, not a fixed manual command.

## 3. Immediate known slice: Vol.1 cap.6 experiment 1

Current target slice:

```text
ELAB Volume 1
Chapter 6
Experiment 1
Manual evidence pages: 29-31
```

Known source alignment from current work:

- required components: LED, breadboard, 9V battery, 9V battery clip, 470 Ohm resistor;
- lesson path and experiment data agree on components/wires;
- `experiments-vol1.js` contains fixed pin assignments;
- `lesson-paths/v1-cap6-esp1.json` contains build intent but lacks pin assignments;
- current `book_reference` points to page 29, while manual evidence spans pages 29-31.

This must be treated as a documented data condition, not ignored.

## 4. Required user experience

### 4.1 Teacher/tutor flow

Teacher opens ARDESIA:

1. opens a lesson board;
2. adds ELABTutor plugin;
3. chooses Volume 1 / Chapter 6 / Experiment 1;
4. sees an experiment card/post-it with manual reference;
5. opens the circuit simulator as a post-it on the board;
6. optionally opens manual, step-by-step, diagnostics, and notes sub-post-its;
7. teaches live, writes around the plugin, moves/resizes it;
8. exports the lesson;
9. later imports the lesson and sees the plugin state restored;
10. LessonOS records what happened for future graph/student-pack use.

### 4.2 Student flow

Student sees:

- manual-aligned title;
- components list;
- visual circuit;
- breadboard placement;
- next step;
- diagnostics if something is wrong;
- explanation of why the circuit works;
- exportable student-pack or exercise summary later.

### 4.3 Tutor dashboard relation

ELABTutor activity must eventually feed the tutor dashboard:

- lessons taught;
- experiments used;
- students exposed to each concept;
- common mistakes;
- plugin usage;
- material created;
- student-pack generated;
- marketplace material candidates.

But ELABTutor must not implement the entire tutor dashboard itself.

## 5. Post-it / sub-post-it model

The main ELABTutor plugin embed may have child board objects:

```text
Main plugin post-it: ELABTutor / Simulation Plugin
  -> Manual post-it
  -> Circuit post-it
  -> Step-by-step post-it
  -> Diagnostics post-it
  -> Notes post-it
  -> Student exercise post-it
```

Each child object must be:

- movable;
- identifiable;
- restorable through export/import;
- linked to the parent plugin state;
- provenance-aware when it references manual content.

Initial implementation may be simpler, but the data model must not block this future.

## 6. Simulation requirements

### 6.1 Circuit data

A canonical ELAB circuit scene should include:

- `experimentId`;
- `volume`;
- `chapter`;
- `experimentNumber`;
- `manualEvidence.pages`;
- `bookReference`;
- components;
- wires;
- pin assignments;
- physical placement metadata;
- canonical simulator placement note;
- validation rules;
- didactic steps;
- export/import state;
- drift version.

### 6.2 Component requirements

For the first slice:

- 9V battery;
- battery clip;
- breadboard half or equivalent canonical board;
- 470 Ohm resistor;
- red LED;
- wires connecting power rail, resistor, LED, ground path.

Long-term:

- multiple LED colors;
- switches;
- potentiometers;
- capacitors;
- sensors;
- Arduino board;
- multimeter/probes;
- oscilloscope-like visualization;
- signals/graphs;
- validation by concept.

### 6.3 Breadboard geometry

The simulator must treat breadboard geometry as a first-class object.

Requirements:

- hole coordinate system;
- row/column semantics;
- rail semantics;
- center gap semantics;
- relative component placement;
- canonical hole references;
- visual mapping from component pins to holes;
- detection of drift when canonical holes change.

### 6.4 Wires

Wires must have:

- stable IDs;
- from/to endpoints;
- color if available;
- semantic meaning if known;
- optional waypoints;
- validation role;
- drift tests.

### 6.5 Polarity and orientation

The plugin must explicitly model:

- LED anode/cathode;
- battery positive/negative;
- resistor non-polarity;
- rail polarity;
- canonical orientation;
- common student mistakes.

### 6.6 Simulator state

State must include:

- placed components;
- wire connections;
- run/stop status;
- validation status;
- current step;
- diagnostics;
- manual reference;
- plugin version;
- lesson/board embed ID.

### 6.7 Tinkercad parity target

Current status: the ARDESIA board embed mounts the ELABTutor core canvas through
the Simulation Plugin adapter, with `SimulationScene` as the source of truth and
the SVG/canvas layer as rendering. ELAB canvas wire creation, update, and delete
callbacks now produce structured `connect-wire`, `edit-wire.replace-path`, and
`delete` operations. This is not Tinkercad parity and not the finished ELABTutor
simulator runtime. It may show solver-backed diagnostics for verified fixture
slices, but it must stay labeled as a partial simulation harness until component
registry/SVG tools, advanced probes/tools, scoped AVR/runtime bridges,
persistence, native free-assembly controls, and the remaining canvas interaction
model are all extracted into
`io.ardesia.simulation`. The AI/runtime mutation path already uses the
structured placement and `edit-wire` pipeline, can derive voltmeter/probe
voltages plus ammeter current only from provider results, and exposes
provider-bound `runInstrument` operations for serial monitor/plotter,
oscilloscope, SPICE transient, and custom-chip requests. Those tools still
block when their provider is missing, and logic-probe readings still require a
runtime trace. Runtime requests already carry board scope diagnostics; these
paths must not regress to direct scene patches, unscoped AVR fallback, fake
instrument readings, or legacy-only free-assembly state.

The Simulation Plugin must fully emulate the relevant Tinkercad circuit
experience inside ARDESIA, starting from the existing ELABTutor simulator and
removing its architectural, geometry, physics, and interaction limits.

This is a product target, not a nice-to-have. A partial slice can ship only when
it is honestly labeled as partial and does not block the path to parity.

Required parity capabilities:

- component palette with real drag/drop, tap placement, rotation, deletion,
  duplication, undo/redo, selection, zoom, pan, and persistent board state;
- editable breadboards, boards, discrete components, sensors, probes,
  instruments, wire endpoints, wire colors, and routed waypoints;
- live solve after every mutation of component placement, pin assignment, wire,
  code/runtime state, probe position, or provider setting;
- current, voltage, LED state, signal values, serial output, and graph/plotter
  readings derived from solver/runtime providers;
- explicit unsupported-state diagnostics instead of decorative approximations;
- import/export/restore of the complete simulator state as an ARDESIA board
  object;
- provider path for local solving, wasm/ngspice-class solving, and host-mediated
  remote solving without browser-side uncontrolled network access.

For every experiment marked supported, the simulator must behave as a real
interactive circuit simulator, not as a static illustration.

Required behavior:

- placing, moving, rotating, or removing a component updates the scene graph;
- connecting or moving a wire updates explicit endpoints and waypoints;
- every component pin maps to a known breadboard hole, board pin, or connector;
- every user mutation reruns placement validation, occupancy validation, pin
  vocabulary validation, and the active solver provider;
- diagnostics distinguish physical impossibility, missing connection, wrong
  polarity, short circuit, overload, unsupported component, and provider
  unavailability;
- current, voltage, LED state, and runtime observations come from the solver or
  provider result, never from decorative UI state;
- unsupported physics are blocked with a visible reason instead of simulated by
  fake values.

This is not a requirement to finish all parity work in the first PR. It is the
acceptance bar for the final Simulation Plugin and the compatibility direction
for every intermediate slice.

### 6.7.1 ELABTutor simulator limits to remove

The existing ELABTutor simulator is the starting point, not the bar.

Migration must remove these limits:

- standalone shell coupling: no `App.jsx`, auth, dashboard, Supabase functions,
  memory, or report subsystem inside the Simulation Plugin;
- god-component coupling: extract the useful simulator runtime/canvas/tools from
  `NewElabSimulator` instead of making that component the plugin API;
- geometry drift: replace ad hoc scene layouts with authored, tested,
  manual-figure geometry and board orientation;
- runtime mismatch: `AVRBridge` ATmega328p behavior must not be sold as exact
  Nano R4/Renesas RA4M1 behavior; runtime scope diagnostics already block this,
  and executable Nano R4 support remains unavailable until a Renesas provider is
  wired;
- physics gaps: unsupported components, nonlinear behavior, sensors, and
  instruments must fail closed or route to a provider, never fake values;
- interaction gaps: canvas-native wiring, probes, undo/redo, code/runtime,
  diagnostics, persistence, and the free-assembly canvas must become
  plugin-general primitives; persisted legacy free-assembly state is already
  projected into the core canvas as sandbox/monta-tu and persisted as
  structured placement envelopes, but the placement tools themselves still need
  to become canvas-native.

### 6.8 Manual figure fidelity gates

ELAB experiments must be drawn exactly like the manual figure for the selected
volume/chapter/experiment whenever that figure is part of the instruction.

Required gates:

- each verified scene records the manual page/crop or evidence identifier used
  for geometry;
- breadboard orientation is explicit (`horizontal`, `vertical`, or rotation
  degrees) and tested against the manual figure;
- component poses, polarity, and relative placement have authored provenance;
- wire routes are authored or reviewed; generated routes cannot drive a verified
  lesson unless the provenance records the manual allows arbitrary placement;
- visual/structural drift tests fail if a verified scene silently changes
  breadboard orientation, hole mapping, polarity, or required component layout;
- when a volume figure shows a vertical breadboard, the simulator must render a
  vertical breadboard for that scene.

Scenes without this evidence may be technical harnesses, drafts, or blocked
states, but must not be presented as manual-faithful ELAB simulations.

## 7. Manual-aligned presentation

The plugin must present:

- volume/chapter/experiment title;
- manual pages;
- required components;
- build sequence;
- circuit diagram;
- breadboard view;
- diagnostic state;
- explanation.

It must not reproduce long manual text unless licensing/provenance allows it. Use short paraphrase, page references, and evidence IDs where needed.

Example wording style:

```text
Manual evidence: Vol.1 pages 29-31.
This simulator uses a canonical placement for the circuit so the lesson can be verified and restored. The manual allows flexible placement where it says an arbitrary point can be used.
```

## 8. LessonOS integration

Every meaningful plugin event should eventually become a LessonOS event:

- plugin opened;
- experiment selected;
- component placed;
- wire placed;
- validation passed/failed;
- diagnostic shown;
- manual referenced;
- teacher annotation near plugin;
- export created;
- import restored;
- student-pack generated.

Initial implementation may only record export/import state. Later work must feed:

```text
board event -> lesson object -> memory event -> graph -> student-pack
```

ELABTutor must not create a separate graph outside LessonOS.

## 9. UserAIOS relation

Each user’s Personal Learning Kernel/UserAIOS can later derive:

- plugin usage map;
- experiment history;
- preferred teaching sequence;
- recurring student mistakes;
- language/glossary preferences;
- student-pack patterns;
- marketplace material candidates.

But first slices must stay deterministic:

- zero autonomous agent writes;
- zero LLM dependence;
- no AgentMemory mutation while AgentMemory is degraded;
- state derived from explicit board/plugin events.

## 10. Multilingual requirements

ARDESIA and ELABTutor must be natively multilingual.

Data must support:

- stable concept IDs;
- source language;
- localized labels;
- localized component names;
- localized step descriptions;
- teacher preferred language;
- student preferred language;
- glossary entries;
- evidence references not tied to one language;
- translation status.

For circuits, stable concept IDs matter more than translated labels.

Example:

```text
concept.led.anode
labels.it = "anodo"
labels.en = "anode"
evidence = Vol.1 pages 29-31
```

## 11. UI/UX requirements

The user experience should be:

- iPad-first;
- LIM-ready;
- desktop-friendly;
- low cognitive load;
- beautiful and professional;
- more visually attractive than a generic school tool;
- closer to “paper with living tools” than a web dashboard.

Design principles:

- plugin as object on paper;
- manual and diagnostics as nearby post-its;
- zoom/detail mode for mobile;
- visual hierarchy between manual, circuit, step, diagnostic;
- readable typography;
- clear component affordances;
- microinteractions when validation changes;
- no cluttered side panels as primary interface.

## 12. Tutor dashboard integration requirements

ELABTutor must feed, not replace, the tutor dashboard.

Tutor dashboard should eventually show:

- knowledge graph;
- students;
- calendar;
- lessons;
- plugins used;
- materials created;
- materials for sale;
- marketplace activity;
- Google Drive/materials linkage;
- student-pack history;
- concepts taught;
- common errors;
- suggested next actions.

ELABTutor plugin events should become dashboard evidence.

## 13. Marketplace requirements

Long-term ELABTutor/Simulation work should support marketplace packaging:

- first-party ELAB pack;
- teacher-created experiment packs;
- paid student-pack templates;
- lesson workflow bundles;
- plugin versions;
- preview/demo mode;
- provenance and license metadata;
- author/publisher identity.

Not for the first slice.

## 14. Google Drive and materials

Future integration should support:

- importing teacher materials from Drive;
- linking PDFs/manuals to lessons;
- exporting student packs to Drive;
- storing generated material references;
- avoiding duplicating large files in Git.

This belongs to ARDESIA Core / FastAPI Gateway / integrations, not ELABTutor plugin internals.

## 15. FastAPI / ChatGPT Apps / MCP relation

ELABTutor should eventually expose actions through ARDESIA’s Integration Gateway, not directly as a separate backend.

Potential future tool actions:

- list ELAB experiments;
- open experiment on board;
- create student-pack from experiment;
- validate circuit state;
- explain current circuit;
- generate related exercise;
- export lesson summary.

These should route through ARDESIA Core/FastAPI/MCP, not a standalone ELAB backend.

## 16. Quality gates

Every ELABTutor implementation PR must declare which of these apply:

- fixture drift test;
- adapter contract test;
- board payload test;
- export/import test;
- visual screenshot desktop;
- visual screenshot mobile;
- typecheck;
- build;
- secret scan;
- no deploy;
- no AgentMemory mutation;
- no new ELAB app.

## 17. Current completed chain

The older PR #8/#13/#14/#15/#16 sequence below is a historical planning
snapshot, not the current acceptance chain:

```text
PR #8  -> live Vercel vertical-slice evidence
PR #13 -> ELAB Vol.1 cap.6 esp.1 context packet
PR #14 -> canonical fixture + drift guard
PR #15 -> adapter contract
PR #16 -> board payload contract
```

The measured Session 2 chain is local and stacked on product base
`36e6753cc55c114cb1c0815a7e2f8911a0b71dc7`:

```text
causal red tests
  → SDK 1.4 bounded operation contract
  → real runtime/provider binding
  → rollback and result-shape hardening
  → marker v2 + cold restore + .lesson import/export
  → one live connect-wire gesture through ToolHost
  → room/instance isolation and legacy migration hardening
  → classified CodeRabbit review cycles
```

The exact final product SHA is recorded in the external ARDESIA Knowledge
Session 2 receipt after documentation is committed.

## 18. Next implementation stages

### Stage 1 — board payload contract

Status: implemented historically and exercised by the Session 2 candidate.

Purpose:

- turn fixture/adaptor into stable board.write payload;
- maintain own-embeds scope;
- no UI mount yet.

### Stage 2 — ELAB core canvas mount

Status: mounted, with one live host-mediated mutation proved.

Measured boundary:

```text
existing ARDESIA board mounts the ELABTutor core canvas adapter;
connect-wire crosses ToolHost, while the remaining mutations do not yet.
```

Acceptance wording: the visible UI and docs may say the board embed mounts the
ELABTutor core canvas adapter, but must still call the slice a partial
simulation harness, not Tinkercad parity or the final Simulation Plugin runtime.

Constraints:

- max 5 files;
- no new ELAB app;
- no deploy;
- no marketplace;
- no AgentMemory;
- test export/import;
- screenshot if UI touched.

### Stage 3 — post-it and sub-post-it UX

Status: product work remains.

Goal:

- main circuit post-it;
- manual evidence post-it;
- diagnostics post-it;
- step post-it;
- mobile zoom/detail.

### Stage 4 — LessonOS event bridge

Status: the bounded simulation event is emitted through the host and
materialized from the append-only log; evidence provenance is still unresolved.

Goal:

- plugin events become lesson events;
- board export/import preserves plugin state;
- graph ingestion remains outside plugin internals.

### Stage 5 — ELAB pack expansion

Only after the remaining Stage 2 callbacks, Stage 3 UX, and CoV-5 provenance
resolver are proven:

- add more experiments;
- add more components;
- add validators;
- add student-pack generation;
- add marketplace metadata.

## 19. Out of scope now

Do not implement now:

- full ELAB app migration;
- authentication;
- Supabase functions;
- student database;
- billing;
- marketplace;
- ChatGPT Apps runtime;
- FastAPI backend;
- Google Drive integration;
- AgentMemory mutation;
- automatic CV/manual-to-scene;
- arbitrary image recognition;

Tinkercad parity is not out of scope for the product. It is out of scope only as
a single-slice deliverable; every slice must either advance parity or preserve a
clear path to it. Even after the first ELABTutor core canvas mount, slices remain
partial simulation harnesses until advanced probes/tools, executable runtime
providers, persistence, robust component catalog, and free-assembly placement
tools inside the core canvas are complete.

## 20. Risks

1. Recreating ELAB as a second app.
2. Claiming manual fidelity without drift tests.
3. Copying too much manual text.
4. Adding UI before data contracts are stable.
5. Letting plugin own global ARDESIA concerns.
6. Losing iPad/LIM readability.
7. Expanding to marketplace before one experiment works.
8. Depending on AgentMemory while degraded.
9. Merging broad changes from Volume 3 without sanitization.
10. Over-designing UserAIOS before event/data pipeline works.

## 21. Definition of Done for first usable ELAB plugin slice

The first usable slice is done only when:

- user opens ARDESIA board;
- user mounts ELAB/Simulation plugin;
- plugin shows Vol.1 cap.6 esp.1 manual-aligned circuit;
- circuit can run/interact;
- every supported interaction updates scene state, validators, and solver
  diagnostics;
- the slice declares its Tinkercad parity gaps explicitly and does not hide them
  behind static drawings;
- manual reference is visible as Vol.1 pages 29-31;
- verified geometry has manual-figure provenance and drift tests;
- export produces lesson JSON with plugin state;
- import restores the plugin state;
- drift tests pass;
- typecheck passes;
- build passes;
- screenshot desktop/mobile exist if UI changed;
- COV says exactly what is and is not product-ready.

## 22. COV requirements for every future PR

Every PR must include:

- source files read;
- manual pages used;
- GitHub PRs referenced;
- files changed;
- tests run;
- build/typecheck status;
- Vercel status;
- AgentMemory status;
- claims verified;
- claims not verified;
- risks;
- rollback;
- next action.

## 23. Current COV for this specification

The 2026-07-27 supplement is grounded in the local product tree, causal
red-to-green tests, runtime receipts, provider diagnostics, cold restore and
real `.lesson` import/export tests, room/instance isolation tests, classified
CodeRabbit findings, and the external Obsidian/Markdown/Git receipt.

| CoV | Measured state |
|---|---|
| 0 — observed boundary | `GREEN_MEASURED` |
| 1 — causal red test | `GREEN_CAUSAL_RED_TO_GREEN` |
| 2 — SDK protocol | `GREEN_BOUNDED` |
| 3 — runtime/provider | `GREEN_BOUNDED` |
| 4 — persistence/isolation | `GREEN_BOUNDED` |
| 5 — resolvable provenance | `BLOCKED_EVIDENCE_RESOLUTION_MISSING` |
| 6 — review | `GREEN_CLASSIFIED`; six completed cycles are classified, while any post-freeze pass is bound only in the exact-SHA receipt |
| 7 — docs/canon | product leg committed; Knowledge leg binds the final product and vault SHAs |

No deploy, remote mutation, dependency addition, scheduler change, Basic Memory
write, or AgentMemory read/write was performed.
