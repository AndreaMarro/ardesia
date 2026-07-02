# SIMULATION PLUGIN ELAB V1 CAP6 ESP1 ADAPTER COV

Date: 2026-07-02
Branch: `test/sim-elab-v1-cap6-esp1-adapter-contract`
Base: stacked on PR #14 branch `feat/elab-v1-cap6-esp1-fixture-20260702-111500`

## Scope

Micro-slice for the future Simulation Plugin mount. It adds a pure adapter
contract over the canonical ELAB Vol.1 cap.6 esp.1 fixture.

No UI, runtime mount, Vercel deploy, AgentMemory mutation, new ELAB app,
marketplace, FastAPI, or ChatGPT Apps work was performed.

## Files

- `apps/studio/sim/elab/fixtureAdapter.ts`
- `apps/studio/src/__tests__/ElabFixtureAdapter.test.ts`
- `docs/ops/SIMULATION-PLUGIN-ELAB-V1-CAP6-ESP1-ADAPTER-COV.md`

## Contract

- validates fixture id `v1-cap6-esp1`;
- preserves manual evidence pages 29-31 as `Vol.1 pag.29-31`;
- preserves components;
- preserves wires;
- preserves fixed `pinAssignments`;
- emits `elab.circuit-scene-adapter.v1` payload for later board/plugin mounting;
- fails fast if `pinAssignments` are missing;
- fails if components, wires, or pin assignments drift.

## COV

- `git diff --check` passed.
- `npm run test -- src/__tests__/ElabFixtureAdapter.test.ts` passed, 1 file / 6 tests.
- `npm run typecheck` passed.
- `npm run test -- src/__tests__/ElabV1Cap6Esp1Fixture.test.ts src/__tests__/ElabFixtureAdapter.test.ts` passed, 2 files / 10 tests.
- `npm run build` passed. Vite emitted existing chunk-size warnings only.

## Rollback

Close the stacked PR or revert its single commit. This slice does not change
production deploys, runtime UI, AgentMemory, launchd, or standalone ELAB app
behavior.
