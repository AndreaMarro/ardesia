# SIMULATION PLUGIN ELAB V1 CAP6 ESP1 BOARD PAYLOAD COV

Date: 2026-07-02
Branch: `test/sim-elab-v1-cap6-esp1-board-payload`
Base: `origin/main` after PR #15 merge.

## Scope

Micro-slice after the adapter contract. It adds a pure board payload /
embeddable contract for ELAB Vol.1 cap.6 esp.1.

No UI mount, runtime route, iframe, Vercel deploy, AgentMemory mutation, new
ELAB app, marketplace, FastAPI, or ChatGPT Apps work was performed.

## Files

- `apps/studio/sim/elab/boardPayload.ts`
- `apps/studio/src/__tests__/ElabBoardPayload.test.ts`
- `docs/ops/SIMULATION-PLUGIN-ELAB-V1-CAP6-ESP1-BOARD-PAYLOAD-COV.md`

## Contract

- emits `board.write` params with stable embed id
  `elab-v1-cap6-esp1-circuit`;
- carries the `elab.circuit-scene-adapter.v1` payload from the fixture adapter;
- preserves manual source label `Vol.1 pag.29-31`;
- creates a pure `embeddable` skeleton without ownership marker;
- verifies `ToolBoard.write` adds `maestroTool` ownership for
  `io.maestro.sim-elab-v1-cap6-esp1`;
- fails fast through the adapter if `pinAssignments` are missing.

## COV

- `git diff --check` passed.
- `npm run test -- src/__tests__/ElabBoardPayload.test.ts` passed, 1 file / 5 tests.
- `npm run test -- src/__tests__/ElabV1Cap6Esp1Fixture.test.ts src/__tests__/ElabFixtureAdapter.test.ts src/__tests__/ElabBoardPayload.test.ts` passed, 3 files / 15 tests.
- `npm run typecheck` passed.
- `npm run build` passed. Vite emitted existing chunk-size warnings only.

## Rollback

Close the PR or revert its single commit. This slice does not change production
deploys, runtime UI, AgentMemory, launchd, or standalone ELAB app behavior.
