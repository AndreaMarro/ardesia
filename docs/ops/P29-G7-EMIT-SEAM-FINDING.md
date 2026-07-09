# P29 — G7 finding: the gap is a missing EMIT SEAM, not missing event types

> Investigated 2026-07-09 before touching the canonical LessonOS event model (measure, don't assume).
> Conclusion: **do not autonomously add `simulation.error.observed` / `simulation.circuit.solved`** — it
> risks the parallel/redundant memory the non-negotiables forbid, and the real gap is elsewhere.

## Evidence
- The solve flow (`ToolCanvasEmbeddable.tsx:1293`, `computeElabMnaView` → `solveElabExperiment`) produces a
  `SolveResult` + diagnostics **but emits no LessonOS event** — the outcome goes to the canvas diagnostic
  display only. `ToolCanvasEmbeddable` has **no** LessonOS emit seam (no `lessonOs`/`appendEvent`/emit prop).
- `simulation.step.completed` exists (`eventlog.ts:69`, zod `messages.ts:250`, materializer `:144`) but has
  **no host-side emit** — only plugin-emittable via the `lesson.event.emit` RPC (`host.ts:283`).
- The graph **already models break→explain→fix** with existing kinds:
  - `error.observed` (`eventlog.ts:51`) → `errore` node + `deriva-da` concept edge (`materializer.ts:114`).
  - `exercise.completed{correctsErrorId}` → `corregge` edge, marks `correctedAt` (`materializer.ts:121`).
  - `simulation.step.completed` → `esercizio` node + `cita` concept edge (`materializer.ts:144`).

## The real gap
When a student's First-LED circuit **solves (15.3 mA)** or **errors (open wire / LED reversed)**, nothing is
recorded to LessonOS. The break→explain loop is not *logged*, because the solve site cannot emit.

## Decision fork (needs Andrea — product-modeling + a core seam)
- **Option A — riuso chirurgico, ZERO new kinds (recommended first):** emit the existing
  `simulation.step.completed` on a successful solve and `error.observed` on a solver-detected circuit error,
  with scene/experiment `evidence`. No canonical-schema change; materializer already handles both.
  Requires: a LessonOS **emit seam** for the embeddable (either the embed uses the existing
  `lesson.event.emit` RPC, or the host observes solve results and appends). **This seam is the core decision.**
- **Option B — add ONE kind `simulation.circuit.solved`** carrying solve telemetry (current mA, `targetMatched`)
  *only if* that outcome must be a first-class fact `simulation.step.completed` cannot carry. Adds kind + zod +
  materializer case. **Do NOT add `simulation.error.observed`** — redundant with `error.observed`.

## Why this was not built autonomously
Touches the **canonical LessonOS event model** + a **core render seam** (who owns emit: embed-via-RPC vs
host-observes-solve), and reuse-vs-new is a product-modeling choice. Non-negotiables: no parallel memory,
no consequential change without a decision, single integration point. Framed here for a deliberate call.
