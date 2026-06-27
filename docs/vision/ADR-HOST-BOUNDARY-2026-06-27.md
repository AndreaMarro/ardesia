# ADR-0001: HOST-BOUNDARY — ELAB as hosted plugin, Lavagna as core surface

## Status

Accepted (enforcement L1+L2 built) · Phase 3 runtime migration **Proposed** (gate-Andrea)
Date: 2026-06-27 · Deciders: Andrea (gate owner), Claude A1 · Evidence: firsthand, file:line below.

## Context

ARDESIA is an OS/host that loads **infinite plugins**; ELAB (circuit simulator + 3 UNLIM volumes) is **plugin #1 of N**, not the product. The product is the host + shared core surfaces (Lavagna canvas, Board-Citation, Student-Pack) + marketplace. This ADR draws the boundary that keeps ELAB one plugin among many.

Firsthand state of `~/ardesia` (monorepo, branch `session/long-2026-06-25`, 1367 src files), verified 2026-06-27:

- **Layout** [V]: `apps/studio` = core app (React+Vite, ESLint flat-config v9) · `plugins/elab-tutor` = ELAB (separate app, legacy ESLint, 47 deps) · `packages/engine` = Python · example plugin at `apps/studio/plugins/reference`.
- **Host EXISTS and is mounted** [V] (corrects the prior "built-not-mounted" claim): `apps/studio/src/toolhost/` — `ToolHost.mount(port)` (host.ts:177), `CanvasToolMount.tsx`, `ToolFrame.tsx`; SES Compartment isolation (sesHost.ts:14,76), ed25519 manifest signing (pluginInstaller.ts:225), CSP deny-by-default `connect-src 'none'` (originServer.ts:57), kill-switch (killList.ts:50), bundle-hash TOCTOU (host.ts:137), per-tool origin isolation, nonce-monouso. Manifest contract = Zod `apps/studio/src/toolhost-protocol/manifest.ts`; SDK `apps/studio/src/sdk/index.ts` `CONTRACT_VERSION 1.0.0`, `defineManifest()`, `connectTool()`, surfaces `["board-embed","panel","fullscreen"]`, deny-by-default capabilities.
- **Package boundary already clean** [V]: core→plugin imports = **0**, plugin→core imports = **0**. ELAB and core share only the git root.
- **Gap #1 — ELAB bypasses the host** [V]: ELAB is a *direct-compile app* (its `public/manifest.json` is a PWA manifest, **not** a plugin manifest). It never goes through ToolHost / SES / capabilities. The `reference` plugin does (imports `../../src/sdk`). So at runtime there is **no enforced trust/capability boundary** around ELAB.
- **Gap #2 — Lavagna trapped in the plugin** [V]: the whiteboard (`plugins/elab-tutor/src/components/lavagna/`, ~40–67 files) is canon-core but lives inside the plugin, **bidirectionally coupled** to `simulator/` via **13 deep relative imports** (8 lavagna→simulator, 5 simulator→lavagna). The 5 simulator→lavagna are hardware-upload widgets (`WebSerialUploadButton`, `R4DfuUploadButton`, `UniversalUploadButton`, `BoardPicker`, `CompileUploadButton`) — ELAB concerns misfiled under `lavagna/`.

## Decision drivers

- ARDESIA value = host + shared surfaces + marketplace, **not** ELAB. Boundary must let ∞ plugins coexist.
- Don't regress the currently-clean package separation.
- Make the canon violations (Lavagna placement, ELAB bypass) **mechanical and visible**, not opinion.
- Respect gates: no prod, no main, no runtime host-wiring without Andrea, no secrets.
- Big-bang file moves of 40–67 entangled files at once = high regression risk → strangler-fig.

## Considered options

1. **Big-bang refactor** — move Lavagna to core + convert ELAB to hosted tool in one PR. Rejected: too risky, breaks a working app, unverifiable in one session.
2. **ESLint `eslint-plugin-import` / `no-restricted-paths`** — idiomatic, but adds deps + touches `package.json`/lockfile + needs install on the factory mini (collision risk), and ELAB uses legacy ESLint config. Deferred to a documented option, not the primary gate.
3. **Zero-dependency boundary-check gate + baseline ratchet + phased migration** (CHOSEN) — a standalone `scripts/boundary-check.mjs` that enforces the package boundary and freezes the intra-ELAB coupling at baseline, so the boundary is real and regression-proof now, and the extraction burns the baseline down incrementally.

## Decision

1. **Canon (target):** ARDESIA core owns the Lavagna canvas surface + the host SDK; ELAB owns only `components/simulator/` (incl. its hardware-upload UI). Plugins reach core **only** through `apps/studio/src/sdk`. ELAB becomes a real hosted tool (manifest + `connectTool` + ToolHost), one of ∞.
2. **Enforcement built now (L1+L2):** `scripts/boundary-check.mjs` (zero-dep) enforces:
   - **L1 package boundary** — core ↛ `plugins/*`; plugin → core only via `apps/studio/src/sdk`; no plugin→plugin. (Currently 0 violations — locked in.)
   - **L2 canon ratchet** — `lavagna/** ↔ simulator/**` couplings frozen at baseline (`scripts/boundary-baseline.json`, 13 tracked). New couplings fail (exit 1); the baseline only shrinks.
3. **Migration = strangler-fig** (below). Runtime host-wiring (Phase 3) is **gate-Andrea** (no-MCP-host-wiring gate).

## Migration plan

- **Phase 0 — DONE 2026-06-27 (this ADR):** boundary gate + baseline (13) + ADR on branch `boundary/host-gate-2026-06-27`. Package boundary locked; coupling frozen.
- **Phase 1 — burn down simulator↔lavagna (cheapest first):** relocate the 5 hardware-upload widgets from `lavagna/` into `simulator/` (they're ELAB concerns). Drops 5 couplings; re-baseline smaller. No core extraction yet.
- **Phase 2 — extract core whiteboard:** move the true-core surface (`DrawingOverlay`, `WhiteboardOverlay`, `FloatingToolbar`, drawing storage) to `apps/studio` (or a `packages/canvas`). Rewire the remaining 8 lavagna→simulator deps to flow through host board API / injected props, not deep imports. Re-baseline to 0.
- **Phase 3 — ELAB becomes a hosted tool (GATE-ANDREA):** add a real plugin manifest via `defineManifest()`, `connectTool(manifest, handlers)`, mount through `ToolHost.mount`; drop direct-compile. Capability-gate board access. This is runtime host-wiring → requires Andrea.
- **CI/gate:** wire `node scripts/boundary-check.mjs` into pre-commit + the factory ratchet so the baseline can never grow.

## Consequences

**Positive:** boundary is mechanical + regression-proof today (0 package violations locked); the 13 couplings are a precise burn-down worklist; ELAB demoted to "plugin #1" in code, not just slides; ∞-plugin host model unblocked; reversible, low-risk increments.

**Negative / cost:** Lavagna extraction is real work (~40–67 files, 13 couplings, Phase 1–2); ELAB→hosted-tool (Phase 3) is a large migration behind a gate; until Phase 3, ELAB still bypasses SES/capability isolation (accepted interim, tracked).

**Risks:** the scanner is regex-based (catches static relative imports; alias/dynamic-string imports not resolved — none currently used, noted). Mitigation: keep imports static-relative; revisit if aliases adopted.

## Enforcement evidence (2026-06-27, firsthand)

```
node scripts/boundary-check.mjs        # no baseline -> exit 1 (BITES): 13 new couplings (8 lavagna->simulator, 5 simulator->lavagna), package core<->plugin = 0
node scripts/boundary-check.mjs --update-baseline   # writes scripts/boundary-baseline.json (13 tracked)
node scripts/boundary-check.mjs        # exit 0 PASS (ratchet: existing frozen, new would fail)
```

## Related

- Canon: `ardesia-canon-architecture-23jun` (ARDESIA=OS plugin-native, ELAB=Pack).
- Host contract: `apps/studio/src/toolhost/` + `toolhost-protocol/manifest.ts` + `sdk/index.ts` (CONTRACT_VERSION 1.0.0).
- Session: `~/ardesia-vault/session-logs/SESSION-ARDESIA-PARALLEL-2026-06-27-0358.md`.
