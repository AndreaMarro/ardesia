# Task 5 Report — Provider Boundary and Diagnostics

## Scope
- Created `apps/studio/sim/providers/simulationProviders.ts`
- Created `apps/studio/src/__tests__/SimulationProviders.test.ts`

## TDD Log

### RED
Command:

```bash
npm --prefix apps/studio test -- --run src/__tests__/SimulationProviders.test.ts
```

Observed failure:

```text
FAIL  src/__tests__/SimulationProviders.test.ts [ src/__tests__/SimulationProviders.test.ts ]
Error: Cannot find module '../../sim/providers/simulationProviders' imported from /Users/andreamarro/ardesia-wt/tutor-ux/apps/studio/src/__tests__/SimulationProviders.test.ts
```

### GREEN
Command:

```bash
npm --prefix apps/studio test -- --run src/__tests__/SimulationProviders.test.ts
```

Observed pass:

```text
Test Files  1 passed (1)
     Tests  2 passed (2)
```

## Implementation
- Added provider boundary with `simulationProviders`, `providerStatus`, `solveWithProvider`.
- `local` provider calls the real `solveElabExperiment` from `apps/studio/sim/solver/elabSolver.ts`.
- Local provider preserves real diagnostics/warnings and exposes real `componentStates`, `currents`, `nodeVoltages`.
- `fastapi` provider reports unavailable with:
  - `ok: false`
  - diagnostics `["FastAPI provider hub not configured"]`
  - empty `componentStates`, `currents`, `voltages`
- No fake solver values were introduced.

## Extra Gate Fix
- `tsc -b --noEmit` failed after the first GREEN because:
  - `componentStates.led1?.on` needed a typed state shape
  - `status.reason` needed union narrowing in the test
- Adjusted types/narrowing without changing runtime behavior.

## Verification

Focused provider contract:

```bash
npm --prefix apps/studio test -- --run \
  src/__tests__/SimulationPluginManifest.test.ts \
  src/__tests__/ElabTutorPackBoundary.test.ts \
  src/__tests__/SimulationSceneModes.test.ts \
  src/__tests__/ElabSceneCatalog.test.ts \
  src/__tests__/SimulationProviders.test.ts
```

Result:

```text
Test Files  5 passed (5)
     Tests  12 passed (12)
```

Typecheck:

```bash
npm run typecheck
```

Result: passed.

Full test gate:

```bash
npm test
```

Result:

```text
2044 passed, 7 skipped in 32.90s
Test Files  142 passed | 1 skipped (143)
     Tests  1320 passed | 5 skipped (1325)
```

Build gate:

```bash
npm run build
```

Result: passed. Existing Vite chunk-size warnings remained warnings only.

## Self-review
- Boundary is additive and isolated to the two task-owned code paths.
- Local provider uses the real solver and scene payload only.
- FastAPI path is fail-closed and does not invent values.
- No unrelated files were edited.
