## 2026-07-07 — final review fixes, Simulation Plugin v2 contract slice

Files changed:
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- `apps/studio/sim/providers/simulationProviders.ts`
- `apps/studio/src/lessonos/mistakeObservation.ts`
- `apps/studio/src/__tests__/simulationPluginRegistry.test.ts`
- `apps/studio/src/__tests__/SimulationProviders.test.ts`
- `apps/studio/src/__tests__/MistakeObservation.test.ts`
- `docs/architecture/simulation-plugin-v2.md`

Tests run:
- `npm --prefix apps/studio test -- --run src/__tests__/simulationPluginRegistry.test.ts src/__tests__/SimulationProviders.test.ts src/__tests__/MistakeObservation.test.ts`
  - `Test Files  3 passed (3)`
  - `Tests  20 passed (20)`
- `npm run typecheck`
  - root `typecheck-core` completed
  - `apps/studio`: `tsc -b --noEmit` completed

Notes:
- New embeds now default to canonical tool id `io.ardesia.simulation`.
- Legacy saved links using `io.ardesia.simulation-plugin` remain renderable via registry aliasing.
- Local provider solver exceptions now fail closed with user-visible diagnostics instead of throwing.
- `error.observed` evidence refs now use `pack:io.elab.tutor:*`.
- Legacy ELABTutor integration path in `apps/studio/src/design/ElabLab.tsx` remains out-of-scope debt and is documented in `docs/architecture/simulation-plugin-v2.md`.

Concerns:
- Focused verification only: the required targeted tests and `npm run typecheck` passed; the full `apps/studio` suite was not rerun in this fix pass.
