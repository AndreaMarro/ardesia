# ARDESIA Native Plugin Clone Identity

Status: APPROVED FOR IMPLEMENTATION
Date: 2026-07-12
Exact base: `d4c5ff52470310b694b3a40f56e08d98376c464f`
Binding visual canon: `/Users/andreamarro/Downloads/Allegato dell'utente.png`
Canon SHA-256: `869fd0edaf9fba2dfaf767a25c679d39f912bdae9127a4e98454f6137c711b35`

## Goal

Make native Excalidraw copy, paste, and Alt-drag create an independent plugin
post-it. The complete accepted journey is:

1. clone a plugin post-it with a native Excalidraw gesture;
2. mutate the clone and prove the source is unchanged;
3. undo and redo the clone transaction;
4. save and reopen the room;
5. prove that two independently addressable plugin identities remain.

This slice repairs identity only. It makes no visual or layout change. The four-view
reference image remains the literal product canon.

## Current Model and Failure

`PluginPostitObject` is the unified persisted model for every plugin post-it. Its
`instanceId`, `pluginId`, bounds, interaction state, and cloned `pluginState` travel
together inside the board marker. The containing Excalidraw embeddable also carries
three identity projections:

- element `id`;
- `maestro-tool://<pluginId>/<elementId>` link;
- marker owner `<pluginId>#<instanceId>`.

The canonical element ID is produced by `pluginPostitBoardElementId(instanceId)`.
Restore and rendering deliberately reject disagreement among these projections.

Excalidraw correctly gives a native clone a new element ID while copying its link
and `customData`. The generic `normalizeDuplicatedToolEmbeds` path currently rewrites
only the link to the new Excalidraw ID. The copied marker still contains the source
`state.instanceId`, source owner, and source plugin state identity. The resulting
element is neither a valid source nor a valid clone: the strict plugin renderer sees
the ID, link, owner, and marker mismatch and rejects it.

## Decision

Preserve Excalidraw as the owner of the copy gesture and its undo/redo transaction.
When the board observes a copied plugin marker, canonicalize the clone in one scene
update instead of introducing a second clone command.

For each clone, the canonicalizer will:

1. validate the copied marker and restore its `PluginPostitObject` fail-closed;
2. derive a new, unique, grammar-valid `instanceId` deterministically from the
   source instance ID and the IDs already reserved in the scene;
3. derive the canonical element ID with
   `pluginPostitBoardElementId(newInstanceId)`;
4. rewrite the `maestro-tool://` link using the same plugin ID and canonical element
   ID;
5. rewrite owner with `instanceOwner(pluginId, newInstanceId)`;
6. clone the full marker state, replace its `instanceId`, and take bounds from the
   current Excalidraw clone;
7. retain the copied plugin state as an independent deep value;
8. publish all rewritten projections together in one normalized element array.

The source element and its marker are never modified.

### Deterministic instance IDs

The first candidate is based on `<source-instanceId>--copy`; subsequent collisions
use monotonically increasing `--copy-<n>` suffixes. The source portion is truncated
when necessary so every candidate satisfies
`^[a-z0-9][a-z0-9-]{0,63}$`. Allocation walks elements in stable scene order and
reserves both existing valid instance IDs and IDs allocated earlier in the same
pass. It selects the first free candidate whose instance ID and canonical element ID
are both unused.

This rule gives identical input scenes identical output scenes, handles multiple
copies in one change, and becomes a no-op on the second pass. It does not use the
opaque Excalidraw-generated ID as a product instance ID.

## Architecture and Data Flow

The change remains at the existing board/persistence boundary:

```text
native Excalidraw copy / paste / Alt-drag
  -> onChange receives source plus copied embeddable
  -> Room calls plugin-post-it normalization first
  -> pure plugin-post-it canonicalizer validates and allocates clone identity
  -> Room passes that result through existing generic tool-embed normalization
  -> at most one updateScene publishes the final normalized element array
  -> existing room persistence saves the normalized scene
  -> existing restore path reconstructs two PluginPostitObject values
  -> renderer mounts two independently keyed plugin instances
```

`multiPostitBoardPersistence.ts` exports the pure
`normalizeDuplicatedPluginPostits` function at the existing plugin identity and board
persistence boundary. `Room.tsx` calls it before the existing
`normalizeDuplicatedToolEmbeds`, composes both results, and publishes at most one
`updateScene` for a change. This preserves generic non-plugin
`maestro-tool://` behavior without adding a persistence module, schema, or source of
truth. `ToolCanvasEmbeddable.tsx` remains byte-unchanged.

The relevant `Room.handleChange` parameters move from `any` to safe explicit or
`unknown` types as part of the same orchestration edit. The implementation must
therefore reduce the mandatory Studio lint total rather than merely avoid a new lint
issue.

Nested identity rescoping is explicit and type-directed:

- a Simulation clone rewrites `pluginState.runtimeState.instanceId` and
  `pluginState.providerOutput.instanceId` to the new instance ID while preserving
  provider IDs, plugin IDs, diagnostics, solver output, and every other state field;
- an ELABTutor clone preserves `pluginState.simulationInstanceId` because it is an
  external Simulation target, not the ELABTutor owner's identity;
- catalog plugin state has no owner-instance field and is cloned unchanged.

The implementation must not recursively search and replace strings. Only the two
documented Simulation owner-instance fields are rescoped. No plugin state may be
silently discarded.

## Atomicity, Undo, and Redo

Identity is a tuple, not a sequence of repairs. Element ID, link, owner,
`state.instanceId`, cloned `pluginState`, and current bounds are returned together or
not at all. No intermediate mismatched element is persisted or rendered.

The canonicalization is coupled to Excalidraw's native duplication change rather than
recorded as an independent user command. Undo removes the canonical clone and leaves
the source untouched. Redo restores the same canonical identity for the same restored
scene state. Re-normalizing a canonical redo is idempotent and does not allocate a
third identity.

## Persistence and Reopen

The normalized scene is persisted by the existing room store. On reopen, each live
plugin marker must pass the current strict checks for:

- embeddable type and marker schema;
- grammar-valid, unique `instanceId`;
- plugin ID and plugin-state compatibility;
- canonical element ID;
- canonical link;
- canonical owner;
- finite current bounds.

Restore yields two `PluginPostitObject` values. Mutations address the clone by its new
instance ID and cannot write through to the source's ToolHost storage, board ownership,
annotation namespace, or runtime state.

## Error Handling

Canonicalization is deny-by-default.

- A malformed plugin marker, invalid source instance ID, invalid plugin ID, or
  marker/plugin mismatch fails the plugin clone operation; it is not downgraded to a
  generic embed.
- An owner, link, or marker schema that does not describe the same source plugin is
  rejected rather than guessed.
- Non-finite bounds are rejected before the scene update.
- Failure to allocate a unique grammar-valid identity aborts canonicalization without
  mutating the source or emitting a partially rewritten clone.
- Unrelated and valid non-plugin elements pass through unchanged.

The product may expose the existing board-level recovery surface, but it must never
fabricate state, reuse the source namespace, or persist a half-normalized clone.

## Testing and Evidence

Implementation follows RED -> GREEN and is accepted only on one exact commit SHA.
All O1-A pure, adversarial, persistence, undo/redo, and real-product cases live in the
existing `apps/studio/e2e/plugin-postit-room-reload.spec.ts`; no additional test file
is created. The RED run executes that Playwright spec against the exact base and must
fail because plugin-aware canonicalization is absent. The GREEN evidence from the
same spec includes:

- pure-function coverage for deterministic allocation, collisions, 64-character
  truncation, multiple clones in one pass, idempotence, source immutability, deep
  state independence, current bounds, and non-plugin pass-through;
- focused state coverage proving both Simulation owner-instance fields are rewritten,
  provider and plugin IDs remain stable, ELABTutor's external
  `simulationInstanceId` remains unchanged, catalog state remains unchanged, and
  unrelated strings equal to the source ID are not recursively replaced;
- adversarial tests for malformed marker, plugin mismatch, owner mismatch, invalid
  instance grammar, non-finite bounds, and duplicate canonical IDs;
- persistence test for clone -> mutate clone -> source unchanged -> serialize ->
  restore with two valid identities;
- undo/redo integration coverage proving the source and canonical clone return without
  identity drift;
- a real-product browser journey for native clone, mutation, undo/redo, save/reopen,
  and two independent identities, repeated 3/3 on the exact SHA with zero console
  errors;
- touched-file lint showing a strict issue reduction, targeted Playwright, full Studio
  tests, typecheck, production build, and repository quality ratchet on the Mac Mini;
- independent diff review and an EvidenceReceipt recording exact base, exact head,
  commands, results, reviewer disposition, and browser evidence.

The browser journey uses real room persistence and real plugin state. It does not use
mock, demo, invented, or test-only product records.

## Quality and Scope Gates

- O1-A is delivered as two stacked PRs so every PR remains below the five-file cap.
- O1-A0 is documentation-only, is based on exact SHA
  `d4c5ff52470310b694b3a40f56e08d98376c464f`, and touches exactly:
  `docs/superpowers/specs/2026-07-12-native-plugin-clone-design.md`,
  and `docs/superpowers/plans/2026-07-12-native-plugin-clone.md`.
- O1-A1 is based on the exact O1-A0 head SHA, never a floating branch, and touches
  exactly these four paths:
  `apps/studio/src/design/multiPostitBoardPersistence.ts`,
  `apps/studio/src/Room.tsx`,
  `apps/studio/e2e/plugin-postit-room-reload.spec.ts`, and
  `bin/ci/studio-quality-baseline.json`.
- O1-A0 does not satisfy product acceptance. O1-A becomes product-green only when
  O1-A1 passes the complete exact-SHA acceptance gate and independent review.
- `ToolCanvasEmbeddable.tsx` remains byte-unchanged at the enforced 4057-line ceiling.
- The lint issue total and `Room.tsx` per-file count must decrease. O1-A1 updates the
  committed quality baseline to those actual lower counts so it exactly matches the
  current tree; existing lint reduction remains enforced.
- No dependency is added.
- No merge or deploy is performed without the applicable HUMAN_GATE.
- One writer owns implementation; review is independent.

## Alternatives Rejected

### Repair only during reopen

Rejected because the invalid clone already reaches rendering and can address the
source namespace before persistence. Identity must be valid at creation time.

### Add a separate plugin clone command

Rejected because it would bypass native Excalidraw copy/undo behavior and create two
competing interaction paths.

### Use the opaque Excalidraw clone ID as `instanceId`

Rejected because it is not guaranteed to satisfy the product's strict instance ID
grammar or remain a stable product identity.

### Relax renderer or restore validation

Rejected because owner, link, and marker agreement is the security and isolation
boundary that prevents cross-instance writes.

### Share plugin state until first mutation

Rejected because aliasing lets a clone mutation affect the source and makes the
accepted independence journey unprovable.

## Non-Goals

- Visual redesign or movement toward a different visual target.
- A custom clipboard, custom Alt-drag gesture, or second undo stack.
- A new plugin-clone persistence module or schema.
- Any edit to `ToolCanvasEmbeddable.tsx` or its generic normalizer.
- Generic recursive replacement of instance-like strings inside plugin state.
- Move/resize persistence beyond the clone's required current bounds.
- Pointer-routing redesign inside plugin runtimes.
- Cross-room clone, collaborative conflict resolution, Marketplace behavior, or
  migration of unrelated legacy embeds.
- Full product convergence or `FULL_GOAL_GREEN` claims from this slice alone.

## Rollback

Rollback removes `normalizeDuplicatedPluginPostits` from
`multiPostitBoardPersistence.ts` and removes only its composition step and safe typing
changes from `Room.tsx`; the existing generic ToolCanvas normalizer remains untouched.
The persisted schema is unchanged. Scenes saved by the feature remain valid because
they use the existing canonical element, link, owner, and `PluginPostitObject` shape.
No data migration or destructive cleanup is required. After rollback, native cloning
returns to the known rejected behavior; existing independently saved instances remain
readable.

## Acceptance

O1-A is green only when the exact-SHA evidence proves:

`clone -> mutate clone -> source unchanged -> undo/redo -> save/reopen -> two independent identities`

The real product browser journey must pass 3/3, all quality gates must remain green,
both stacked PRs must respect their locked file maps, and no visual change may diverge
from the binding canon. The documentation-only O1-A0 head is never sufficient evidence
for this acceptance claim.
