# ARDESIA Native Plugin Clone Implementation Plan

> Execution target: O1-A1. This plan implements the approved design in
> `docs/superpowers/specs/2026-07-12-native-plugin-clone-design.md`.

Status: READY, NOT STARTED
Date: 2026-07-12
Planning base (O1-A0): `1d318178df9ef1c61839588fb90437fece75f526`
Implementation base: the exact final O1-A0 head after this plan is committed
Binding canon SHA-256: `869fd0edaf9fba2dfaf767a25c679d39f912bdae9127a4e98454f6137c711b35`

## Observable outcome

On the exact candidate SHA, a native Excalidraw copy, paste, or Alt-drag of a
plugin post-it must complete this real journey:

`clone -> mutate clone -> source unchanged -> undo/redo -> save/reopen -> two independent identities`

The journey must pass 3/3 in the real Studio product with zero console errors.
This is an identity and persistence slice only; it must not change the visual
language or diverge from the four-state binding canon.

## Governance and topology

- O1-A0 is documentation-only: the design plus this plan.
- O1-A1 is a stacked implementation PR based on the immutable O1-A0 head SHA,
  never on a floating branch.
- One Sol writer owns the implementation worktree. All investigators, test
  analysts, and reviewers are read-only.
- Maximum two implementation attempts. After the second failed attempt, stop
  with `REPLAN_REQUIRED`, `ULTRA_REQUIRED`, or `BLOCKED`.
- No merge, deploy, direct push to `main`, force push, dependency addition,
  baseline weakening, fake data, or destructive cleanup.
- All computational verification runs on the Mac Mini. The local Mac is only
  the control plane and, when explicitly authorized, the chosen interactive
  browser surface.

## Locked file map

O1-A1 may touch exactly these four files:

1. `apps/studio/src/design/multiPostitBoardPersistence.ts`
2. `apps/studio/src/Room.tsx`
3. `apps/studio/e2e/plugin-postit-room-reload.spec.ts`
4. `bin/ci/studio-quality-baseline.json`

Forbidden paths include every other file, especially
`apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`, package manifests, lockfiles,
workflow files, persisted schemas, and visual styles.

## Invariants

- Excalidraw remains the owner of native copy gestures and undo/redo.
- `PluginPostitObject` remains the sole persisted plugin post-it model.
- Element ID, link, owner, `state.instanceId`, current bounds, and cloned state
  are rewritten atomically or not at all.
- The source element and its state are never mutated.
- Identity allocation is deterministic, grammar-valid, collision-safe, stable
  in scene order, and idempotent.
- Simulation rescopes only
  `pluginState.runtimeState.instanceId` and
  `pluginState.providerOutput.instanceId`.
- ELABTutor preserves `pluginState.simulationInstanceId`; catalog state remains
  unchanged. Recursive string replacement is forbidden.
- Malformed or inconsistent plugin markers fail closed and are never downgraded
  to generic tool embeds.
- `Room.tsx` publishes at most one `updateScene` for one change.
- `ToolCanvasEmbeddable.tsx` remains byte-identical and stays at the enforced
  4057-line ceiling.
- Studio lint totals and the `Room.tsx` count must strictly decrease, and the
  committed baseline must equal the observed exact totals and per-file counts.

## Step 0 — Observe and acquire the writer lock

On the Mac Mini:

```bash
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
cd /Users/progettibelli/ardesia-wt/o1a-native-plugin-clone
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short
git log -n 5 --oneline
```

Acceptance:

- HEAD equals the immutable O1-A0 head recorded in the EvidenceReceipt;
- the worktree is clean;
- the AgentMemory action is active and the lease covers the exact four paths;
- no second writer or unexplained mutation exists.

If any condition fails, stop before editing with `CONCURRENT_WRITE_DETECTED` or
`REPLAN_REQUIRED`.

## Step 1 — Establish RED from requirements

Edit only `apps/studio/e2e/plugin-postit-room-reload.spec.ts` and add tests that
import the planned pure canonicalizer before it exists. Cover:

- deterministic `--copy` allocation and numbered collisions;
- 64-character truncation and instance grammar;
- multiple copies in stable order and second-pass idempotence;
- source immutability, deep state independence, and current clone bounds;
- Simulation's two owner-instance fields only;
- preserved provider/plugin IDs, ELABTutor external target, catalog state, and
  unrelated strings equal to the source ID;
- malformed marker, plugin mismatch, owner mismatch, invalid grammar,
  non-finite bounds, and duplicate canonical element IDs;
- non-plugin pass-through;
- native copy, mutate clone, source unchanged, undo/redo, save/reopen, and two
  independent identities in the real product.

Run the focused spec on the Mac Mini and retain the expected failure log:

```bash
cd /Users/progettibelli/ardesia-wt/o1a-native-plugin-clone/apps/studio
npx playwright test e2e/plugin-postit-room-reload.spec.ts --workers=1
```

RED is valid only if it fails for the missing plugin-aware clone behavior, not
for dependency, port, selector, fixture, or environment setup errors. Commit no
RED-only state.

## Step 2 — Implement the pure canonicalizer

Edit `apps/studio/src/design/multiPostitBoardPersistence.ts`:

- export `normalizeDuplicatedPluginPostits` from the existing identity and
  persistence boundary;
- validate marker, owner, link, plugin ID, source instance, bounds, and canonical
  agreement before allocation;
- reserve all valid live instance IDs and canonical element IDs;
- allocate deterministic grammar-valid copy IDs in stable scene order;
- deep-clone state and apply the two explicitly typed Simulation rescopings;
- return the final normalized element array and a changed/no-op signal without
  mutating the input or source;
- make a second normalization pass a no-op;
- fail closed without partially rewriting an element.

Run the pure/adversarial portion of the focused spec on the Mac Mini. If the
first design attempt cannot satisfy atomicity and idempotence, do not accumulate
patches: return to the plan and use the second attempt.

## Step 3 — Compose one Room scene update

Edit `apps/studio/src/Room.tsx`:

- call plugin normalization before the existing generic tool-embed normalizer;
- feed the first result into the second normalizer;
- issue at most one `updateScene` using the final array;
- preserve the existing generic non-plugin behavior;
- replace only relevant `handleChange` `any` parameters with safe explicit or
  `unknown` types so the touched file's lint count decreases;
- do not add a parallel clone command, persistence path, or undo stack.

Run focused lint and the full focused Playwright spec on the Mac Mini.

## Step 4 — Ratchet the exact quality improvement

First assert the immutable comparison base, then run the repository Studio
quality ratchet against that exact base on the Mac Mini. Record exact totals and
per-file counts, then edit only
`bin/ci/studio-quality-baseline.json` so it equals that observed lower state.

```bash
O1_A0_BASE_SHA="<exact final O1-A0 head from its EvidenceReceipt>"
test "$(git rev-parse HEAD^)" = "$O1_A0_BASE_SHA"
python3 bin/ci/studio_quality_ratchet.py --base "$O1_A0_BASE_SHA"
```

The gate must reject:

- unchanged or increased total lint issues for this Studio JS/TS change;
- a `Room.tsx` count that did not decrease;
- ToolCanvas growth or a ceiling different from 4057;
- any issue-bearing file absent from the baseline;
- a baseline that does not exactly match the current tree.

The writer must not edit the ratchet implementation or its tests.

## Step 5 — Exact-SHA GREEN verification

After the four-file diff is complete, inspect it before staging:

```bash
git status --short
git diff --check
git diff --stat
git diff -- apps/studio/src/design/multiPostitBoardPersistence.ts \
  apps/studio/src/Room.tsx \
  apps/studio/e2e/plugin-postit-room-reload.spec.ts \
  bin/ci/studio-quality-baseline.json
```

Commit with the repository's conventional format, record the candidate SHA, and
run all checks on that exact SHA on the Mac Mini:

```bash
cd /Users/progettibelli/ardesia-wt/o1a-native-plugin-clone
git rev-parse HEAD
git diff HEAD^ --check

cd apps/studio
npx eslint src/design/multiPostitBoardPersistence.ts src/Room.tsx
npx playwright test e2e/plugin-postit-room-reload.spec.ts --workers=1 --repeat-each=3

cd ../..
O1_A0_BASE_SHA="<exact final O1-A0 head from its EvidenceReceipt>"
test "$(git rev-parse HEAD^)" = "$O1_A0_BASE_SHA"
python3 bin/ci/studio_quality_ratchet.py --base "$O1_A0_BASE_SHA"
npm run verify
```

Required evidence:

- focused lint has no new issue and the exact ratchet reports a strict reduction;
- focused browser journey passes 3/3 with zero console errors;
- full engine, Studio tests, typecheck, and production build pass;
- the current HEAD still equals the candidate SHA after every check;
- `git status --short` is empty;
- the diff contains exactly the four locked paths.

## Step 6 — Independent review and fix loop

An independent Sol reviewer receives the exact base SHA, exact candidate SHA,
approved spec, this plan, locked file map, RED log, GREEN logs, and diff. The
review is read-only and must check:

- identity isolation and cross-instance write safety;
- deterministic allocation, idempotence, atomicity, and source immutability;
- typed nested rescoping without recursive string replacement;
- Excalidraw undo/redo and one-scene-update composition;
- restore/reopen correctness and realistic browser evidence;
- error handling, accessibility impact, canon non-regression, quality ratchet,
  scope, secrets, dependencies, and exact-SHA provenance.

Verdicts:

- `APPROVED`: proceed to release verification;
- `FIX_REQUIRED`: one writer applies only bounded findings, reruns every affected
  gate, and obtains a fresh review;
- `REPLAN_REQUIRED`: stop; do not force the current architecture;
- `ULTRA_REQUIRED`: stop and escalate the documented critical decision;
- `HUMAN_GATE`: stop before any action needing human authority.

Maximum two implementation attempts remains binding.

## Step 7 — Release verification, PR, and EvidenceReceipt

The release verifier independently proves that the reviewed SHA is the tested
SHA and that no post-review edit exists. Push only the O1-A1 branch and open one
stacked PR against the O1-A0 branch. Do not merge or deploy.

The PR body must include:

- immutable base and candidate SHAs;
- the four changed files;
- RED and GREEN evidence;
- Mac Mini commands and results;
- 3/3 real-product browser evidence;
- lint/ToolCanvas before and after;
- reviewer disposition;
- regression risks and rollback;
- explicit `No merge; no deploy`.

Wait for required GitHub checks. A green local run is not a substitute for CI.
Save an AgentMemory EvidenceReceipt with the exact same provenance and link it to
the current action. Release the writer lease only after the receipt is durable.

## Rollback

Rollback is additive and non-destructive:

- remove only `normalizeDuplicatedPluginPostits` and its Room composition/safe
  typing edits;
- restore the previous test expectations and exact quality baseline;
- leave persisted rooms and existing canonical instances untouched;
- do not edit ToolCanvas or add a migration.

The known post-rollback behavior is explicit: native plugin clones return to the
strictly rejected identity mismatch, while previously valid independent instances
remain readable.

## Terminal contract

O1-A1 ends with exactly one named state:

- `APPROVED`
- `BLOCKED`
- `FIX_REQUIRED`
- `REPLAN_REQUIRED`
- `ULTRA_REQUIRED`
- `HUMAN_GATE`
- `BUDGET_EXHAUSTED`
- `CONCURRENT_WRITE_DETECTED`

`APPROVED` is permitted only when the complete exact-SHA journey, all Mac Mini
gates, independent review, GitHub CI, EvidenceReceipt, and locked file map are
green. O1-A0 documentation alone never satisfies product acceptance.
