# ARDESIA V1 — integration map

Updated: 2026-07-10. Base: `main@e61e7dcd5b842351f3ee8ae3a671ad7e158deec6`.

## P33 Result

Status: `HONEST_RED`.

Operation audited: P30 free manipulation trace,
`apps/studio/e2e/p30-free-manipulation.spec.ts`.

First failing boundary:

pointer/touch -> domain operation -> plugin capability -> ToolHost

The current P30 path proves useful local behavior, but it does not prove that
free-manipulation operations cross ToolHost JSON-RPC, capability checks or
audit logging. The first remediation should route one real Simulation Plugin
write operation through a governed ToolHost boundary, or ratify an explicit ADR
exception before any broader spine claim.

## Boundary Evidence

| Boundary | Status | Evidence | Limit |
|---|---|---|---|
| Current branch/SHA | VERIFIED | branch `codex/p33-integration-spine-regate-20260710`; base `origin/main@177f5c731ffc68fd69a86573ddf08670d3d5226f` | audit branch, not merged yet |
| PR/CI anchor | VERIFIED | PR #164 merged; post-merge `ci` run `29103272760` success | docs-only merge; no deploy proof |
| P30 test anchor | VERIFIED | `p30-free-manipulation.spec.ts:1-20` states P30 proves logic and reachability, not full parity | test is useful but scoped |
| Pointer/raw interaction | RED for full P33 | `p30-free-manipulation.spec.ts:110-116`, `201-205`, `223-225` use `dispatchEvent("click")` for palette, holes and break button | hit-test proves reachability only, not raw operation execution |
| Domain mutation | VERIFIED local | `ToolCanvasEmbeddable.tsx:1027-1050`, `1290-1354` mutate `SimulationScene`/placements and persist embed state | mutation is local React callback path |
| ToolHost capability/RPC/audit | RED | `simulationPluginRegistry.ts:23-36` defines optional direct host callbacks; `Room.tsx:929-944` passes closures; `ToolCanvasEmbeddable.tsx:1287-1354` calls plugin callbacks directly | does not use `routeRequest`, JSON-RPC, `board.write` ownership or ToolHost audit |
| LessonOS event emission | PARTIAL | `ToolCanvasEmbeddable.tsx:889-908` emits solve/error events via `host.emitLessonEvent`; `Room.tsx:938-942` appends to LessonOS | add/connect/update/delete operations are not emitted as LessonOS operation events |
| Local persistence/reopen | VERIFIED local | P30 asserts digest survives reload at `p30-free-manipulation.spec.ts:239-260` | persistence follows Excalidraw/embed state, not backend sync |
| Backend/RLS | UNKNOWN | no P33 command reached backend persistence or tenant-negative proof | do not claim backend spine |
| Graph/tutor/export/deploy | DEFERRED | first boundary failed before ToolHost; deploy proof for current head remains unknown | do not run deploy for this audit |

## Next Remediation

`P34-SIMULATION-TOOLHOST-WIRE-REMEDIATION-001`

Binary objective: pick one Simulation Plugin write operation, preferably
`wire-add` or `break-connections`, and make its governed path explicit:
operation schema -> ToolHost method/capability -> audit event -> host mutation
or ratified exception. Do not expand to backend/RLS/export until this boundary
is green.

## P34 Result

Status: `GREEN_SLICE_LOCAL`.

Operation audited: `break-connections` write-back from the Simulation Plugin.

The host-side write-back now routes through the ToolHost `board.write` gate:
`persistEmbedStateThroughToolHost` wraps the existing embed-state update in a
JSON-RPC-shaped `board.write` request, runs the own-embed capability check, and
records a ToolHost audit entry. `Room.tsx` uses that governed path for
Simulation Plugin persist callbacks. The caller identity is explicit
(`toolLink.toolId`); the helper no longer derives authority from the target
embed marker.

| Boundary | Status | Evidence | Limit |
|---|---|---|---|
| Operation schema | VERIFIED | ToolHost `board.write` schema: `{ embedId, state }` in `toolhost-protocol/messages.ts`; helper sends `method: "board.write"` | operation metadata is inside embed state, not a separate method yet |
| Capability and ownership | VERIFIED | `persistEmbedStateThroughToolHost` grants only `board.write` own-embeds, receives explicit `toolId`, uses `ToolBoard.isOwnEmbed`, and tests cross-owner denied audit | focused on host write-back, not every plugin capability |
| Audit | VERIFIED | `ToolCanvasMontaggioPersistenza.test.tsx` asserts audit `{ method: "board.write", outcome: "ok" }` for break button, denied audit for cross-owner writes, and two serialized audit rows for concurrent writes | local Vitest evidence; PR CI still required |
| Existing behavior | VERIFIED | `npm --prefix apps/studio test -- --run src/__tests__/ToolCanvasMontaggioPersistenza.test.tsx` PASS 11/11; adjacent ToolHost/caps tests pass 63/63; `npm --prefix apps/studio run typecheck` PASS | P30 browser e2e not rerun locally due disk headroom |

Next boundary: prove the browser Room/P30 path still passes with the governed
write-back and decide whether to add a dedicated browser assertion for audit
visibility.
