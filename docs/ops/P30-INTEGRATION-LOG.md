# P30 — INTEGRATION LOG (single write lane)

## 2026-07-09 — slice 1: G7 event type + graph layer
Added typed LessonOS events `simulation.circuit.solved` + `simulation.error.observed` (per Andrea's P30 event list):
- `src/lessonos/eventlog.ts` — `LessonOsEvent` union (+ telemetry fields `currentMa`, `targetMatched`).
- `src/toolhost-protocol/messages.ts` — zod schemas + added to `LessonEventEmitParamsSchema` discriminated union (RPC path).
- `src/lessonos/materializer.ts` — cases: `circuit.solved` → `esercizio` node + `cita` concept edge; `error.observed` → `errore` node + `deriva-da` concept edge. **Same graph vocabulary as existing events — one memory, more sources (no parallel memory).**
- `src/__tests__/LessonOsEventLog.test.ts` — 2 new materializer tests.

Verified: **tsc 0 · scoped vitest 43/43** (LessonOsEventLog + ToolLessonEventEmit + TeacherDashboardProjection) · full suite re-running.
Files (all additive): `eventlog.ts`, `messages.ts`, `materializer.ts`, `LessonOsEventLog.test.ts`.
Rollback: `git -C <wt> checkout -- <file>`.
Next: G7 **emit seam** — wire `ToolCanvasEmbeddable` solve → `append(...)` via a host callback + `Room.tsx` wiring + e2e.

## 2026-07-09 — slice 2: G7 emit SEAM (host-observes-solve) — VERIFIED end-to-end
- `simulationPluginRegistry.ts` — `SimulationToolHost.emitLessonEvent?` (optional/fail-soft).
- `Room.tsx` — wired `emitLessonEvent → lessonOsRef.current?.store?.append(event)` (no RPC, no client keys; tutor host only — student view stays read-only).
- `src/lessonos/simulationSolveEvent.ts` — PURE mapping `outcome → LessonOsEvent` (+ 4 unit tests).
- `ToolCanvasEmbeddable.tsx` — thin **deduped** `useEffect` in `ReferenceSimulationCanvasTool`; `deriveSimulationSolveOutcome` normalizes the solve across runtimes (elab-mna → `computeElabMnaView`; battery-led → `batteryLedCurrentMa`; `battery-led-senza-resistore` → error) → `simulationSolveEvent` → `host.emitLessonEvent`.
- **Verified**: tsc 0; `simulationSolveEvent` 4/4; **emit integration test** (renders reference tool with a host spy → `simulation.circuit.solved` ≈15.3 mA) 1/1. Full suite + e2e regression running.
- Files: `simulationPluginRegistry.ts`, `Room.tsx`, `ToolCanvasEmbeddable.tsx`, `lessonos/simulationSolveEvent.ts`, `__tests__/{simulationSolveEvent,ToolCanvasEmbeddable}.test.*`.
- Break→explain **"solved" side proven end-to-end**. Error side: pure-fn tested; a broken-circuit e2e is the small follow-up.
- Rollback: `git checkout -- <files>`; delete `simulationSolveEvent.{ts,test.ts}`.
