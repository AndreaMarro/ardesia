# Task 3 — Canonical Scene Mode Projection

## RED phase
- Added `apps/studio/src/__tests__/SimulationSceneModes.test.ts`.
- Ran:
  - `npm --prefix apps/studio test -- --run src/__tests__/SimulationSceneModes.test.ts`
- Result: failed as expected (module missing):

```text
FAIL  src/__tests__/SimulationSceneModes.test.ts
Error: Cannot find module '../../sim/simulationSceneModes' imported from /Users/andreamarro/ardesia-wt/tutor-ux/apps/studio/src/__tests__/SimulationSceneModes.test.ts
```

## GREEN phase
- Added `apps/studio/sim/simulationSceneModes.ts` with:
  - `SimulationMode`, `SimulationStepProjection`, `SimulationModeProjection`, `DerivedSimulationModes`
  - `SimulationSceneLike`, `NormalizedSimulationScene`
  - `deriveSimulationModes(scene)`
  - `finalStepState(projection)`
  - `normalizeScene(scene)`
- Re-ran:
  - `npm --prefix apps/studio test -- --run src/__tests__/SimulationSceneModes.test.ts`
- Result: PASS.

```text
PASS  src/__tests__/SimulationSceneModes.test.ts
Test Files  1 passed (1)
Tests  3 passed (3)
```

## Modified files
- `apps/studio/src/__tests__/SimulationSceneModes.test.ts`
- `apps/studio/sim/simulationSceneModes.ts`
- `.superpowers/sdd/task-3-report.md`
