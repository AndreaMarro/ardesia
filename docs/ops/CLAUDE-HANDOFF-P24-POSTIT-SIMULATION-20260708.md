# Claude Handoff P24 - Post-it Simulation Commit Readiness

Date: 2026-07-08
Worktree: `/Users/andreamarro/ardesia-wt/tutor-ux`
Branch: `docs/simulation-plugin-v2-contract-20260707`
Owner before handoff: Codex

## Read This First

Andrea asked to pass the work to Claude as soon as practical. Codex cannot
directly hand this current thread to Claude with the available tools. This file
is the standalone handoff artifact.

Do not treat this as a CodeRabbit review. CodeRabbit is installed, but agent
auth is missing:

```bash
coderabbit auth status --agent
# {"type":"status","phase":"auth","status":"not_authenticated","authenticated":false}
```

The long attached prompt at:

```text
/Users/andreamarro/.codex/attachments/cd414cdd-f942-467a-9cff-bcc245c7aed1/pasted-text-1.txt
```

was read. Its final "Immediate Next Prompt" is stale and points back to P+2.
The authoritative current source is:

```text
docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
```

Read the checkpoints P+21, P+22a, P+22b, P+23, and P+24 manual handoff there.

## Hard Constraints

- No staging unless Andrea explicitly asks.
- No commit unless Andrea explicitly asks.
- No push, merge, or deploy.
- No `git add -A`.
- No reset or clean.
- No new npm dependencies.
- Do not touch `apps/studio/sim/solver/**`.
- Do not patch `node_modules`.
- Do not represent manual review as CodeRabbit output.
- Keep P+24 as commit-readiness/review only; do not implement a new feature.

## Current State

Last verified local snapshot:

- branch: `docs/simulation-plugin-v2-contract-20260707`
- disk: about 3.7 GiB available on `/System/Volumes/Data`, volume at 100%
  capacity
- tracked dirty state: 25 modified files, about 2538 insertions and 254
  deletions
- untracked state includes P+0-P+23 simulator/post-it contract files, docs,
  Playwright evidence, and `packs/elab-tutor/postitFunctions.json`
- vendored solver status: `git status --porcelain -- apps/studio/sim/solver`
  returned no output
- latest green checkpoint: P+23

P+23 gates recorded green:

- Playwright focused:
  `npm --prefix apps/studio run e2e -- e2e/plugin-postit-room-reload.spec.ts`
  -> 2 passed.
- Focused Vitest board/postit pack from `apps/studio`:
  `BoardPluginPostitPersistence`, `BrowserHostedMultiPostit`,
  `PluginPostitConcurrency`, `ResponsivePluginFunctions`,
  `ElabTutorPostitCapabilities`
  -> 5 files passed, 33 tests passed.
- `npm --prefix apps/studio run typecheck` -> pass.
- scoped eslint on the e2e spec -> pass.
- `git diff --check` -> pass.
- `git status --porcelain -- apps/studio/sim/solver` -> no output.
- `SolverVendoredDrift.test.ts` -> 1 file passed, 2 tests passed.
- `npm --prefix apps/studio run build` -> pass, existing Vite chunk-size
  warning only.

## P23 Decision To Preserve

The global duplicate DOM id with suffix `*-undefined` is not caused by the
plugin payload, `index: null`, or plugin post-it rendering.

Evidence:

- duplicate id exists before `.lesson` import
- `postImportNewDuplicateIds: []`
- `pluginDuplicateIds: []`
- duplicate nodes are Excalidraw toolbar radio inputs such as
  `toolbar-hand`, `toolbar-selection`, `toolbar-rectangle`, `toolbar-text`
- nearest plugin post-it instance is `null`
- Excalidraw local source sets radio input id as
  ``${excalId}-${props.id}``, while toolbar buttons omit `id`

Do not patch production or `node_modules` for this. Keep the feature gate:

```text
postImportNewDuplicateIds: []
pluginDuplicateIds: []
```

## Evidence To Read

Core files:

```text
apps/studio/e2e/plugin-postit-room-reload.spec.ts
apps/studio/src/design/multiPostitBoardPersistence.ts
apps/studio/src/design/multiPostitWorkbenchModel.ts
apps/studio/src/toolhost/pluginPostitBoardRender.tsx
apps/studio/src/toolhost/postitObject.ts
apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts
apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx
```

Runtime evidence:

```text
output/playwright/plugin-postit-room-desktop.json
output/playwright/plugin-postit-room-desktop.png
output/playwright/plugin-postit-room-tablet.json
output/playwright/plugin-postit-room-tablet.png
output/playwright/room-plugin-postit-p22-exportlesson-evidence.json
output/playwright/room-plugin-postit-p22-exportlesson-desktop.png
output/playwright/room-plugin-postit-p22-exportlesson-mobile.png
output/playwright/p22-workspace-exportlesson-board.json
output/playwright/p22-workspace-exportlesson-room-import.lesson
```

Keep `output/` local by default. It is untracked and not ignored. Version only
selected artifacts if Andrea explicitly wants that.

## Suggested P21-P23 Commit Candidate

Start with this narrow package:

```text
apps/studio/src/design/multiPostitBoardPersistence.ts
apps/studio/src/design/multiPostitWorkbenchModel.ts
apps/studio/src/toolhost/pluginPostitBoardRender.tsx
apps/studio/src/toolhost/postitObject.ts
apps/studio/src/__tests__/BoardPluginPostitPersistence.test.ts
apps/studio/src/__tests__/BrowserHostedMultiPostit.test.tsx
apps/studio/e2e/plugin-postit-room-reload.spec.ts
docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
docs/ops/CLAUDE-HANDOFF-P24-POSTIT-SIMULATION-20260708.md
```

Review before deciding whether these also belong in that same PR:

```text
apps/studio/src/App.tsx
apps/studio/src/Room.tsx
apps/studio/src/store/WorkspaceStore.ts
apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx
apps/studio/src/__tests__/Room.integration.test.tsx
```

Do not include by default:

```text
output/
docs/ops/CLAUDE-*.md
docs/product/TEACHER-DASHBOARD-SPEC.md
docs/product/UI-UX-DESIGN-DIRECTION.md
docs/product/ARDESIA-PLUGIN-ON-PAPER-UX-SPEC.md
apps/studio/sim/core/componentCatalog.ts
apps/studio/sim/core/instrumentContract.ts
apps/studio/sim/core/placementEngineAdapter.ts
apps/studio/sim/core/simulationViewport.ts
apps/studio/sim/core/simulationWireEditor.ts
```

Those belong to separate product-doc or larger simulator-parity packages unless
Andrea explicitly asks to consolidate them.

## Commands Before Any Approved Commit

Run these after any additional edits and before any human-approved staging:

```bash
npm --prefix apps/studio run e2e -- e2e/plugin-postit-room-reload.spec.ts
cd apps/studio && npx vitest run src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/__tests__/PluginPostitConcurrency.test.ts src/__tests__/ResponsivePluginFunctions.test.ts src/__tests__/ElabTutorPostitCapabilities.test.ts
npm --prefix apps/studio run typecheck
cd apps/studio && npx eslint e2e/plugin-postit-room-reload.spec.ts src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx src/design/multiPostitBoardPersistence.ts src/design/multiPostitWorkbenchModel.ts src/toolhost/pluginPostitBoardRender.tsx src/toolhost/postitObject.ts
git diff --check
git status --porcelain -- apps/studio/sim/solver
npm --prefix apps/studio run build
```

If CodeRabbit auth is completed, run:

```bash
coderabbit review --agent -t uncommitted -c AGENTS.md
```

Parse NDJSON findings by severity. Do not replace that with a manual review.

## Suggested Commit Message

```text
test(studio): harden plugin post-it lesson import evidence
```

## Suggested PR Body

```text
## Summary
- add/verify plugin post-it board persistence through full Excalidraw
  embeddable scene shape
- prove .lesson Room import/reload with Simulation + ELABTutor post-its using
  production helper scene generation
- preserve the single Simulation Runtime rule: ELABTutor remains a consumer of
  io.ardesia.simulation

## Evidence
- Playwright focused: 2 tests passed
- Focused board/postit pack: 5 files / 33 tests passed
- Typecheck: pass
- Build: pass, with existing Vite large chunk warning
- git diff --check: pass
- Vendored solver drift: no output

## Risk
- Worktree is large and dirty from the long run; stage surgically, never
  git add -A.
- CodeRabbit review is blocked until agent auth is completed.
- output/ contains local evidence artifacts; include only if requested.
- This hardens post-it persistence/import evidence; it does not complete full
  Tinkercad parity.
```

## Immediate Prompt For Claude

```text
CLAUDE HANDOFF - P24 COMMIT READINESS ONLY.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Read:
- AGENTS.md
- apps/studio/AGENTS.md
- docs/vault/ARDESIA-MAP.md
- docs/ops/CLAUDE-HANDOFF-P24-POSTIT-SIMULATION-20260708.md
- docs/ops/LONG-RUN-SIMULATION-POSTIT-TINKERCAD-PARITY-20260708.md
  checkpoints P+21, P+22a, P+22b, P+23, P+24
- apps/studio/e2e/plugin-postit-room-reload.spec.ts
- output/playwright/plugin-postit-room-desktop.json
- output/playwright/plugin-postit-room-tablet.json

Do:
1. Verify current git/disk state.
2. Check CodeRabbit auth. If authenticated, run:
   coderabbit review --agent -t uncommitted -c AGENTS.md
3. If not authenticated, say so and continue only with staging plan review.
4. Prepare a surgical staging plan for P+21-P+23 only.
5. Do not stage, commit, push, merge, deploy, reset, clean, or touch solver
   files unless Andrea explicitly orders it.

Preserve:
- The Excalidraw duplicate `*-undefined` is third-party toolbar markup already
  present before import.
- Keep gates `postImportNewDuplicateIds: []` and `pluginDuplicateIds: []`.
- No production workaround for Excalidraw toolbar ids.
```
