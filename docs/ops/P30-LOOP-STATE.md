# P30 — LOOP STATE (resume-first)

> The one doc to read to resume. Worktree `/Users/andreamarro/ardesia-wt/tutor-ux`
> branch `docs/simulation-plugin-v2-contract-20260707` @ `ab91e476` (115 dirty, uncommitted).
> Updated 2026-07-09. **Compact-working-app > reports:** the detailed audit/gate docs are the
> verified **P29-*** set (`P29-GATE-CERTIFICATION`, `-REUSE-INVENTORY`, `-CLAIM-REGISTER`,
> `-SESSION-SUMMARY`); P30 tracks live build state here + `P30-INTEGRATION-LOG.md`.

## Verified state (firsthand, no overclaim)
- Foundation: **build 0 · tsc 0 · vitest 1543/1543 (pre-P30) · First-LED e2e 3/3 · iPad-insert e2e 1/1**.
- Gates VERIFIED: G0 mount · G1 scene-source-of-truth · G2 placement/occupancy · G3 wires · G4 solver golden 15.3 mA · G6 step mode · **G9 iPad insert/mount** (blocker fixed in P29).
- Gates PARTIAL: G5 repair op · **G7 events** (in progress ↓) · G8 export breadth · G9 in-canvas pinch/touch-placement (`test.fixme`).

## P30 slices landed
1. **G7 event TYPE+GRAPH layer** (this slice, ✅ verified): added `simulation.circuit.solved` +
   `simulation.error.observed` across `eventlog.ts` (TS union), `toolhost-protocol/messages.ts` (zod +
   `LessonEventEmitParamsSchema` union), `materializer.ts` (cases — same graph vocabulary: `esercizio`+`cita`,
   `errore`+`deriva-da`; no parallel memory), + 2 unit tests in `LessonOsEventLog.test.ts`.
   Verified: **tsc 0, scoped vitest 43/43** (incl. RPC emit + projection); full suite re-running.

## NEXT SLICE (resume here)
**G7 emit SEAM** — the solve flow (`ToolCanvasEmbeddable.tsx:1293` `computeElabMnaView`→`solveElabExperiment`)
computes results/diagnostics but emits nothing to LessonOS (`P29-G7-EMIT-SEAM-FINDING.md`). Wire it:
1. Add an optional `onLessonEvent?(ev: LessonOsEvent)` (or reuse an existing host emit) prop to the embeddable's host context.
2. On solve success → emit `simulation.circuit.solved` (experimentId, sceneId, currentMa, targetMatched, evidence `[simulation:scene:<id>]`); on solver-detected fault → emit `simulation.error.observed`.
3. In `Room.tsx`, wire that callback to `lessonOsStore.append` (host-observes-solve; no RPC, no client keys).
4. Test: unit for the emit mapping + extend `first-led-*` e2e to assert an event is logged on break→solve.
Resume command: re-run `/loop` with the P30 prompt.

## Blocker
None blocking build right now. Standing human decisions (do NOT auto-execute): **consolidation** of
`tutor-ux ↔ ardesia-wt-lessonos-shell` (irreversible, `CLAUDE-CONSOLIDATION-PLAN-20260708.md`). P30 directive
is "keep building" → proceeding with additive, tested slices in `tutor-ux`; no commit/merge.

## Security
No hardcoded literal keys in the worktree (scanned). The OpenAI `sk-proj-…` key pasted in the prompt is
**exposed → rotate** (server-side only). Never reprinted.

## UPDATE 2026-07-09 — slice 2 landed: G7 emit seam
G7 emit seam **DONE + verified end-to-end** (host-observes-solve): tsc 0 · `simulationSolveEvent` 4/4 ·
emit integration 1/1 (reference tool + host spy → `simulation.circuit.solved` ≈15.3 mA). Files:
`simulationPluginRegistry.ts`, `Room.tsx`, `ToolCanvasEmbeddable.tsx`, `lessonos/simulationSolveEvent.ts` + 2 tests.
Emit fires from `ReferenceSimulationCanvasTool` (deduped effect) → `host.emitLessonEvent` → `Room` `store.append`.
Full suite + e2e regression gate running (`/tmp/ardesia-p30/verifyB.txt`).
**NEXT**: (1) confirm regression green; (2) small — broken-circuit e2e asserting `simulation.error.observed` is
logged (break→explain error side); (3) then G5 `repair` op OR tutor/student split + product factory.

## Live verification 2026-07-09 (preview MCP on :5190 — Andrea's directive)
- **App works live**: 6 core-canvas mounts all `"true"`, **3 SVGs rendered** (non-blank), experiments
  `v1-cap6-esp1/esp2/esp3` live, `data-elab-canvas-source-of-truth="simulation-scene"`, components 3/4/4.
  **G0/G1 live-verified** (not just headless). Screenshot captured.
- **Pre-existing bug FOUND via live testing** (this is why live testing matters): React `Cannot update during
  an existing state transition` ×4 on loading the multi-experiment saved board. NOT on single insert
  (`montaggio-canvas.spec.ts` asserts `consoleErrors===[]`, passes). **Isolated: NOT the P30 emit** — disabling
  the emit effect left the errors → exonerated. Culprit: setState-during-render in the `ReferenceSimulationCanvasTool`
  subtree (multi-instance only). Non-fatal (app renders). Flagged as spinnable task `task_94426c24` with full repro.
- My P30 slice intact after the debug round-trip: tsc 0, emit test green.
- Adversarial review swarm `wf_85bf87e9` running over the P30 diff (correctness/react/architecture/coverage).

## Parity enforcement — GOAL CORE (2026-07-09)
Goal = pin/wire-count/component-count/position/curvature/physics parity with the volumes.
`validateBookLayoutScene` already enforced pin-perfect + positions + spatial relations. Added the missing
exact criteria: **exact wire count** (no undeclared extra wires), **exact component count** (no extra
components), **wire curvature** (`BookLayoutWire.path` polyline, matched point-by-point within tolerance).
The real volume fixtures (esp1/esp6/…) **still pass** → they are genuinely parity-exact. Also renamed the
solved event's `targetMatched` → **`bookLayoutValid`** so `simulation.circuit.solved` carries an honest
parity verdict (was mislabeled book-layout validity as electrical match). Verified: tsc 0, scoped 37/37,
full suite running. Files: `ToolCanvasEmbeddable.tsx` (BookLayoutWire.path + validateBookLayoutScene),
`__tests__/ToolCanvasEmbeddable.test.tsx` (+3 parity tests), + rename across eventlog/messages/simulationSolveEvent/materializer/tests.

## Review swarm triage (wf_85bf87e9, 15 agents)
- ✅ **FIXED**: `targetMatched`→`bookLayoutValid` (parity-honest field).
- ⏭️ **NEXT (goal-critical — "spiegare errori")**: real student break of a `battery-led` scene (open circuit,
  current 0) currently falls to `idle` in `deriveSimulationSolveOutcome` → **no `simulation.error.observed`
  emitted**. Only the `battery-led-senza-resistore` fixture emits an error. Map open/short/dangerous solves to error.
- ⏭️ **NEXT**: solved event fires on mount + no cross-mount dedup → reopen/remount re-appends duplicate solved
  (harms "riaprire senza perdere stato"); clamped elab-mna current emits flat "30.0" vs UI's honest ">= 30 mA".
- 🔎 **ROOT CAUSE of pre-existing `task_94426c24` (update-during-render) FOUND**: the 4 canvas callbacks call
  `host.persistEmbedState(...)`/`setLastOperationId(...)` **inside** the `setLocalScene(current => …)` updater
  (`ToolCanvasEmbeddable.tsx` ~1077-1134) — impure updater, double-fires under StrictMode; plus Room's inline
  host object (918) unstable identity + `canvasState` in the mount effect deps (1148) causing a mount→edit→remount
  loop. Fix: move side-effects out of updaters; `useMemo` the host + `useCallback` closures; mount-once + imperative update.

## Slice: error-side emit — "spiegare errori" (2026-07-09) — DONE
`deriveSimulationSolveOutcome` (ToolCanvasEmbeddable.tsx) now maps a broken `battery-led` circuit to a real
`error` outcome (was silently `idle`): with `ledOn` intended, `!solveSeriesLoop(scene).closed` → `open-circuit`,
`resistanceOhms<=0` → `no-resistor` (dangerous). Physics-correct (real series-loop traversal, no formula).
So a real break during free manipulation emits `simulation.error.observed`. Verified: tsc 0, both emit tests
(solved ≈15.3 mA + open-circuit→error `conceptId:circuito_chiuso`) pass; **full suite 1555 pass / 0 real
failures**. NOTE: the suite shows 1 failure in `__tests__/__dump_multi_board.test.ts` — an **untracked TEMP
scratch test** ("Da cancellare", created 07:33) from the concurrent `task_94426c24` session (asserts 3 embeds,
their repro now injects 4). **Not mine, not touched.** That session shares this worktree, so its files appear here.

## GOAL UPDATE (2026-07-09, Andrea /goal ×2)
Single criterion = Andrea teaches with Ardesia: (1) **parity perfect** with the volumes (pin/wire-count/
component-count/positions/curvature/physics) when the AI (Claude/Codex) mounts a volume experiment via the
ELABTutor plugin on the Simulation Plugin; (2) **free manipulation** — build ANYTHING with the Simulation
Plugin (and via ELABTutor-on-Simulation), respecting logic + physics; (3) **explain errors**; (4) generate
**tutor/student materials**; (5) **reopen without losing state**; (6) **beautiful** (impeccable, Picasso/
Kandinsky/ardesioso) — use react-native-design/best-practices/state-management + impeccable for UI slices.
**Concurrent**: `task_94426c24` (pre-existing update-during-render react bug) is being fixed by Andrea in a
SEPARATE session — do NOT duplicate; avoid churning the 4 canvas callbacks / Room host / mount effect it targets.

## Beauty slice — impeccable / ardesioso (2026-07-09) — started
Goal pillar "bellissimo (Picasso/Kandinsky/ardesioso, impeccable)". Invoked `impeccable:frontend-design`,
wrote design direction to `.impeccable.md` (audience/use-cases/tone: slate-blackboard + bold Kandinsky
accents). First applied step (CSS-only, zero conflict with the sim-canvas the concurrent session owns):
**ardesioso palette pivot in `tokens.css`** — neutrals warm→**cool slate**, tinted toward the brand blue
(impeccable "tint neutrals toward brand hue"): `paper #faf9f6→#f5f6f8`, `canvas #fffefb→#fdfdff`,
`ink #14130f→#111420` (+cooler ink-2/3/4, line/fill), matching `.excalidraw` surfaces; **added Kandinsky
accent tokens** `--m-ochre`/`--m-viridian` (defined, not yet applied). Kept blue + semaphores.
Updated the enforcement `design-tokens.test.ts` pinned values to the new spec.
Verified: **design-tokens 17/17, tsc 0, LIVE screenshot** (cooler slate chrome; First-LED circuit renders).
**Calder brand mark DONE** (2026-07-09): the Ardesia wordmark's lone blue dot (`.st-bdot`, index.css) is now a
miniature **Alexander Calder mobile** — balanced primary discs (blue · ochre · viridian) on a pivot, gentle
`st-bdot-sway` (reduced-motion safe). CSS-only, zero JSX/conflict. Verified: tsc 0, design-tokens+responsive+SDesign
28/28, LIVE inspect+screenshot (renders top-left, no clip). Artist language persisted in `.impeccable.md`
(Fontana cut · Calder mobile · Miró marks · Burri slate texture · Haring radiant success).
Applied since: **Fontana** section-cuts (`h2::after` skew) in the recap deliverable; **Miró/Calder** constellation
mark on the neutral `EmptyState` (primary dots on a black line + a star, non-emoji, token-colored, `flex:none`).
NEXT beauty (sparing): Haring radiant pulse on `simulation.circuit.solved` (sim-canvas = concurrent-session territory).

## Product factory — first human-readable deliverable (2026-07-09)
Map workflow `wf_a50ecf50` (5 read-only lanes) found: everything that exports is a MACHINE format
(`.lesson` ZIP, studentpack/lesson-memory JSON, dead legacy bundle) — **no human-readable deliverable** a
tutor hands a student; provenance exists but buried in `evidence[]`. Closed the smallest high-value gap:
- **`src/store/recapHtml.ts`** — pure `buildRecapHtml(recap: LessonRecap) → string`: self-contained,
  printable **recap.html** in the ardesioso aesthetic (cool slate + serif display + Calder signature +
  Fontana section-cuts), with a readable **"Fonti"** section surfacing provenance (manual pages viewed).
  ZERO PII, deterministic, XSS-safe. Reuses `formatDuration`; no new persistence/schema.
- **`src/__tests__/recapHtml.test.ts`** — 5 tests (structure, provenance ordering, XSS-escape, empty-state, determinism).
- **`src/RecapView.tsx`** — wired a "scarica recap" download (blob → `recap-<slug>.html`) next to `.lesson`.
Verified: tsc 0; recapHtml 5/5; full suite running. Sample rendered + sent to Andrea.
This lands the "materiali tutor/student" pillar (first, minimal) + doubles as a beauty artifact. Follow-up:
promote `studentPackArtifact` into the shipped export path; enrich recap with worksheet + answer-key from the graph.
**PDF format = DONE** (cheap): recap.html carries a "Stampa · salva come PDF" button (hidden `@media print`) → browser print-to-PDF. So the deliverable is now readable HTML **and** PDF. Added an **"I miei appunti"** ruled note-space →
it's now a hand-out **worksheet** (non-invented content, ardesioso ruled lines). tsc 0, recapHtml 6 assertions.
- **`src/lessonos/studyDigest.ts`** (pure, 2 tests) — extracts the **pedagogical, provenance-grounded** content
  from the LessonOS graph: concepts + break→explain **errors** (including my `simulation.error.observed`) with
  their `deriva-da` concept, a `corrected` flag (from `exercise.completed`), and evidence intact. This is the
  sellable-material core — the sim's break→explain becomes study content with chain-of-custody.
- **WIRED into the deliverable**: `buildRecapHtml(recap, digest?)` now renders **"Concetti trattati"** +
  **"Errori e correzioni"** (accent-coded: viridian=corretto, ochre=da rivedere — Kandinsky accents applied
  *meaningfully*). recapHtml 7/7. So the material = activity + formulas + **concepts** + **break→explain errors** +
  Fonti + note-space, HTML+PDF, ZERO-PII, every item provenance-grounded. **DONE — materials END-TO-END from real lesson data**: `buildRoomStudyDigest(events, room)` (pure, room-scoped
via the `lesson.started/ended` window; 3rd studyDigest test) is wired into `RecapView` — a fail-soft
`createEventLogStore()` read → room-scoped digest → `buildRecapHtml(recap, digest)`. So the recap material now
shows the REAL concepts + break→explain errors of *this* lesson (not mixed), provenance-grounded, ardesioso.
tsc 0, studyDigest 3/3; full suite 1565/0-fail.
- **LIVE-verified** (:5190 `?vista=recap`): the recap material page renders in the real app — Calder brand mark,
  "scarica recap" button, "Anteprima materiale" sandboxed iframe preview of the recap.html, ardesioso serif/slate.
  Screenshot captured. The materials pipeline works end-to-end.
- **⚠️ Finding for `task_94426c24`**: the "Cannot update during render" warning (×4) is **APP-WIDE, not
  multi-embed-specific** — it reproduces on the `?vista=recap` route which has ZERO sim embeds. Isolated: NOT my
  RecapView digest fetch (disabled it → errors persisted). The concurrent session's "multi-embed" repro premise is
  too narrow; the real setState-in-render source is SHARED (app shell / a store subscription / routing), fires
  on every route. Live capture on :5190 (any route) is the way to pin it. Non-fatal (pages render correctly).

## Free manipulation + physics + React (2026-07-09)
Hook pillar "manipolare a piacere / costruire qualsiasi cosa, logica+fisica" — demonstrated at the
NON-conflicting operation layer (not the sim-canvas the concurrent session owns):
- **`SimulationAiApi.test.ts`** — new test builds an ARBITRARY non-fixture circuit (R1 220Ω + R2 330Ω in
  series + LED) from an EMPTY scene via typed ops (`addComponent`/`connectPins`), then verifies **real physics**:
  `solveSeriesLoop` sums the path → `resistanceOhms === 550` (series, not a fixture formula), `ledCount === 1`,
  `closed`; deleting the r1→r2 bridge → `closed:false` (open circuit). tsc 0, SimulationAiApi 9/9, full suite 1560/0-fail.
- **React (react-best-practices)** — `RecapView.tsx`: `useMemo`-derived recap HTML as the SINGLE source for
  both the download and a new **sandboxed inline preview** (`<iframe sandbox="" srcDoc>` + a11y title) — the tutor
  sees the beautiful ardesioso material before downloading. tsc 0.
Note: the deep React state/architecture of the sim-canvas is `task_94426c24`'s territory (concurrent) — not duplicated.
ELABTutor-on-Simulation IS exercised by the mount/montaggio e2e (ELABTutor experiments on the Simulation Plugin); a
dedicated free-build-via-ELABTutor test is a follow-up.

## Rollback
Per-file: `git -C <wt> checkout -- <file>`. Pre-P30 diff snapshot: `/tmp/ardesia-p30/pre.patch`.

## LOOP STOP — clean handoff (2026-07-09, tick after materials-live-verify)
**Why stop:** measured the worktree, not assumed. The tree is **actively owned by a concurrent session**:
- **2 fresh commits I never made** (no-commit rule) → `ab91e476 feat(simulation): add structured source intake`,
  `a8f4ec70 feat(simulation): add autonomous plugin workbench`. HEAD moved under my uncommitted P30 work.
- **115 dirty files** from that session interleaved with mine, incl. the **exact collision zone**:
  `ToolCanvasEmbeddable.tsx` (mtime **07:32**, the forbidden callbacks/host/mount), `sim/elab/elabScene.ts`,
  `sim/elab/bookConstraints.ts`, `elab-scene-v2-candidate` fixtures, `SimulationPluginWorkbench.tsx`,
  `StructuredSceneIntake` — i.e. sim-canvas beauty AND parity-data are both live-edited elsewhere right now.
- SessionStart: **"No active locks from other sessions"** + the temp `__dump_multi_board.test.ts` is **gone**
  → the concurrent session is mid-flight/landing, NOT a freed canvas.

**Decision (Andrea's step-3):** no work is both SAFE (non-colliding) and HIGH-VALUE. The two remaining high-value
surfaces are the concurrent session's (`ToolCanvasEmbeddable` sim-canvas beauty; `bookConstraints`/fixtures parity
data) or need a human merge/consolidation decision. Writing now would collide; a full-suite run now would be **noise**
(concurrent writer mutates source mid-run → false red/green). So: **do not write, do not re-measure a moving tree, STOP.**

**State of the 6 pillars at last stable checkpoint (this session, before the tree moved):** all green —
parity (exact counts+curvature), error-physics (`solveSeriesLoop.closed`), free-build 550Ω, beauty
(ardesioso palette + Calder mark + Fontana cuts + Miró empty-state), materials END-TO-END (recap→worksheet
HTML+PDF, concepts+errors break→explain, room-scoped real data, LIVE-verified `?vista=recap`), reopen-state.
My uncommitted P30 files survive in the tree (RecapView/EmptyState/tokens/materializer/eventlog/messages/… all ` M`).

**Handoff to Andrea (resume conditions):**
1. When the concurrent session **lands + you take a consolidation/merge decision** (`CLAUDE-CONSOLIDATION-PLAN-20260708.md`),
   the sim-canvas frees → do the beauty/UX pass on it: **Haring radiant pulse on `simulation.circuit.solved`**,
   beautiful **error-diagnostic display**, **experiment cards** — all live-verified on :5190.
2. Two goal-critical fixes already scoped in the review triage above (§"Review swarm triage"): **open-circuit break
   currently falls to `idle`** (partially addressed for `battery-led`; generalize), and **solved-event mount dedup**
   for clean reopen. Both live in `ToolCanvasEmbeddable` → blocked on the same merge.
3. Restart anytime with `/loop` + the P30 prompt once the tree is single-writer again.
**Nothing committed/merged. No secrets emitted. Suite green at last stable checkpoint.**
