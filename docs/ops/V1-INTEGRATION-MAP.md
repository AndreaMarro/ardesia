# ARDESIA V1 — integration map

Updated: 2026-07-10. Current overlay base:
`main@b86ce8b67795d3239196fbd1a70d8e57a4444314`.

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

## P35 Result

Status: `GREEN_SLICE_LOCAL`.

Browser path audited: P30 free manipulation trace in Room, after P34 governed
write-back.

`apps/studio/e2e/p30-free-manipulation.spec.ts` now reads the Simulation
Plugin ToolHost audit log from browser localStorage, baselines `board.write` /
`ok` entries before `break-connections`, asserts the count increases after the
break, and asserts the same post-break audit snapshot is still present after
reload. This keeps the existing P30 save/reopen proof and adds browser-level
audit visibility without introducing runtime code.

| Boundary | Status | Evidence | Limit |
|---|---|---|---|
| User/browser path | VERIFIED | `npm --prefix apps/studio run e2e -- e2e/p30-free-manipulation.spec.ts --workers=1 --reporter=line` PASS 1/1 | local browser proof; PR CI still required |
| ToolHost audit visibility | VERIFIED | P35 e2e parses `maestro:tools/io.ardesia.simulation/audit.jsonl`, proves `board.write`/`ok` count increases after break, and proves the same snapshot remains after reload | localStorage-backed audit only; remote/backend audit still not proven |
| Persistence/reopen | VERIFIED | existing P30 assertions still compare broken digest after reload and assert solve-kind `error` plus placement count `1` | does not prove backend sync |

P35 next boundary was current-SHA deploy proof. At that point
`main@6f9665b1` was CI-green, but production/preview provenance for that SHA
was still `UNKNOWN`; P36 below supersedes that status.

## P36 Result

Status: `GREEN_SLICE`.

Deploy boundary audited: current integrated Studio SHA -> Vercel production
alias -> production smoke/scenario smoke.

P36 first inspected the live alias and found it still served the older
dependency-audit deployment. The worktree was then linked to the canonical
Vercel project, built as production from monorepo root, deployed prebuilt to
production, and inspected again. The public alias now resolves to the new Ready
deployment.

| Boundary | Status | Evidence | Limit |
|---|---|---|---|
| Source SHA | VERIFIED | local deploy source `main@b86ce8b67795d3239196fbd1a70d8e57a4444314`, PR #167 merge commit | Vercel inspect text does not print Git metadata for the prebuilt deploy |
| Production deployment | VERIFIED | `dpl_42Aa6QwHzVGqZQw3SaSNkrfkDwG3`, URL `https://ardesia-lavagna-gh9u94qzt-andreas-projects-6d4e9791.vercel.app`, status Ready | deploy proof, not behavior proof by itself |
| Public alias | VERIFIED | `vercel inspect https://ardesia-lavagna.vercel.app --scope team_23uD0RgdInaTaOPEL0EGltup` resolves to the new deployment | Vercel account/project only |
| Base production smoke | VERIFIED | `npm run smoke:studio:production` PASS: HTTP 200, title `Ardesia · studio`, no browser/request errors | initial load only |
| Scenario smoke | VERIFIED | `npm run smoke:studio:production:scenario` PASS: 9 checkpoints, book citation, same-room return, Simulation Plugin canvas/core SVG, no browser/request errors | not the P30 audit assertion; that remains local+CI |

Next boundary: run or adapt a production-safe P30 audit smoke so the deployed
alias proves the browser-visible ToolHost `board.write` audit path, not just
the broader scenario smoke.

## P37 Result

Status: `GREEN_SLICE_LOCAL`.

Production boundary audited: deployed Studio alias -> P30 browser trace ->
ToolHost `board.write` audit log -> break diagnostic -> reload persistence.

P37 reused the existing P30 Playwright trace instead of writing a separate
scenario. The only harness changes are: Playwright can accept an external
`ARDESIA_STUDIO_E2E_BASE_URL`, local `webServer` is disabled for that mode, and
a root smoke command calls the same P30 spec against the production alias.

| Boundary | Status | Evidence | Limit |
|---|---|---|---|
| Production alias under test | VERIFIED | `ARDESIA_STUDIO_E2E_BASE_URL=https://ardesia-lavagna.vercel.app` via `npm run smoke:studio:production:p30-audit` | alias serves P36 runtime deployment `dpl_42...`; exact repo head `b3a85224` is docs-only and not redeployed |
| P30 user/browser path | VERIFIED | production P30 audit smoke PASS 1/1 | Playwright uses DOM click for embedded controls, as documented in the P30 trace |
| ToolHost audit visibility | VERIFIED | same P30 spec reads browser localStorage audit JSONL and asserts `board.write`/`ok` count increases after break and persists after reload | browser-local audit only; backend audit still not proven |
| Local regression safety | VERIFIED | local P30 e2e PASS 1/1 after the production-readiness fallback | PR CI still required |

Next boundary: prove the same P30 circuit action produces durable LessonOS
event evidence, rather than only DOM attributes and ToolHost audit localStorage.
