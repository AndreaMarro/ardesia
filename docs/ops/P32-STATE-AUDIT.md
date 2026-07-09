# P32 — Ardesia Scientific State Audit (Phase 1)

**Date:** 2026-07-09 · **Branch:** `p30/free-manipulation-trace-v0-20260709-185100` @ `69f928c8` · **Method:** 5 parallel read-only Explore agents (toolhost/plugin-arch, simulator, LessonOS+storage, ElabTutor, engine+services+deploy), synthesized here. Every claim carries a file:line from an agent's direct read. No product code was modified.

**Honesty note:** file:line refs are agent-verified reads, spot-synthesized by the loop lead; runtime behavior was NOT executed in this audit (static only, except the e2e/CI gates already green from Phase 0).

---

## 0. The two load-bearing ambiguities (read first)

1. **Two things called "plugin".** (a) The formal ToolHost plugin system (signed `ToolManifest`, capabilities, iframe/wire) under `apps/studio/src/toolhost*`; (b) `plugins/elab-tutor/` = the legacy standalone ELAB app (~117 top-level entries) whose only sanctioned runtime piece is `src/plugin/renderEmbeddable.jsx` (mounted directly as React by the Simulation tool). They are unrelated mechanisms.
2. **Two things called "lessonos".** (a) `apps/studio/src/lessonos/` = client-side TS event-sourced memory (IndexedDB); (b) `packages/engine` = Python package literally named `lessonos` (method graph/retrieval/MCP), **not connected to studio at all** (no HTTP server in engine; zero calls from studio).

---

## 1. Plugin architecture (ToolHost)

**Built and real:**
- `ToolManifestSchema` zod `.strictObject` — `toolhost-protocol/manifest.ts:31-103`: reverse-DNS id, semver, `protocol` + `contract` ranges, `entry` (ZipSlip-guarded `:17-21`), **`integrity.bundleSha256`** (`:72-76`), surfaces, capabilities, `publisher.pubkey` `ed25519:…` (`:87-90`), `privacy.dataOut`, refine `net.fetch ⇒ declared-domains` (`:101-103`).
- Install path fail-closed: ed25519 WebCrypto verify (`toolhost/installer.ts:53-82`), signature over original manifest bytes (`:146-152`), bundle SHA-256 vs signed hash **before any write** (`:158-171`), post-install `verifyInstalledTool` (`:321-386`).
- Kill-switch local (`toolhost/killList.ts:32,103-107`; runtime revoke `host.ts:139-152`). Remote kill-switch **not implemented** (`killList.ts:3-4`).
- Wire = JSON-RPC 2.0 over MessageChannel, zod-validated, deny-by-default `TOOL_METHODS` (`toolhost-protocol/messages.ts:318-331`): `board.read/write`, `storage.*`, `graph.query`, `lesson.event.emit`. Capability enforcement + ownership (`toolhost/router.ts:65-84`, `caps/board.ts:83-109`). Namespaced quota'd storage, TOCTOU-safe (`caps/storage.ts:26-104`). Append-only audit jsonl (`toolhost/audit.ts:55-97`).
- Manifests in-tree: `io.ardesia.simulation` v2.0.0, `io.maestro.plugin-ref|outline-ref|ripasso-ref` (`apps/studio/plugins/*/manifest.ts`) + 5 essential plugins (`toolhost/essentialPlugins.ts:82-261`). Marketplace catalog **local-only** (`toolhost/marketplace/localCatalog.ts:49-77`).

**The gap (single most important architecture finding):**
- **The main board does NOT use the ToolHost path.** `Room.tsx:913-914` `renderEmbeddable` → registry (`simulationPluginRegistry.ts:62-64`) → `ToolCanvasEmbeddable.tsx:1211-1214` **dynamic direct-React import of `@elab-tutor-plugin/plugin/renderEmbeddable`** — no iframe, no signature check, no capability enforcement, no audit; host services are plain callbacks. The signed `simulation/manifest.ts` grants are **not applied** on this live path.
- `ToolFrame` iframe path (sandbox + per-tool loopback origin + MessageChannel hello) is wired **only** in the ToolLab demo route (`design/ToolLab.tsx:39-86`). The loopback origin server itself is a model — actual socket bind lives outside this repo (`originServer.ts:1-7`).
- Declared-but-unwired capabilities: `graph.proposeClaims`, `llm.generate`, `net.fetch`, `ui` (`messages.ts:306-311`).
- All in-tree pubkeys are placeholder `ed25519:AAAA` (`essentialPlugins.ts:18`); no external publisher trust store (`installer.ts:316-320`).

---

## 2. Simulator

**Scene models — there are two, diverging:**
- **V1 (live embed):** `ToolCanvasEmbeddable.tsx:138-205`. Components union `battery9v | breadboard-half | nano-r4 | resistor | led | builtin-led | potentiometer | rgb-led` (`:60-67`); **wire is NOT a component** — connections array (`:153-161`). Palette placements = separate `MontaggioPlacement[]` merged into derived `boardScene` (`:934-937`).
- **V2 (`simulation-scene/2`):** `sim/core/simulationScene.ts:76-93` — breadboards + generic-string-typed components + first-class `wires` (`:61-67`). Used by the workbench/harness, not the live board.
- **Solver catalog** (real physics first-class list): `sim/solver/catalog.ts` — breadboard-half `:57`, battery9v `:65`, resistor `:75`, led `:85`, **wire `:95`**, potentiometer `:110`, rgb-led `:121`.

**Topology:** `buildNets` union-find over **pinAssignments ∪ connections** (`sim/breadboard/simulationBreadboard.ts:216-238`); breadboard = 30 columns, a–j rows split top/bottom ties + 4 rails (`:40-105`).

**Solvers (live vs dormant):**
- `solveSeriesLoop` — LIVE, primary for battery-led scenes; **single series loop, explicitly no parallel branches** (`simulationBreadboard.ts:248-309`).
- Vendored path-tracing + MNA-stage engine `sim/solver/engine/CircuitSolver.js` (2486 lines, byte-identical drift-guarded) — LIVE but **gated to `runtime.kind === "elab-mna"`** scenes only (`ToolCanvasEmbeddable.tsx:1457-1494`).
- Providers `fastapi` / `ngspice-wasm` — **DORMANT stubs** (`sim/providers/simulationProviders.ts:318-339`).

**Free manipulation today:**
- Live board callbacks wired: `onLayoutChange/onConnectionAdd/onWireUpdate/onWireDelete` → `applyElabCanvas*` → persist (`ToolCanvasEmbeddable.tsx:1217-1282`, adapters `elabCanvasAdapter.ts:135-184`). **The actual drag gesture code lives out-of-repo** in `@elab-tutor-plugin` (UNKNOWN #1).
- In-repo palette tap-tap: Resistenza + LED only (`:1602-1615`); Pulsante/Cavo/Altro are **inert glyphs** (`:1616-1618`). Break/restore = coarse battery strip (`:963-991`).
- In-repo wire retarget exists **only in the V2 workbench** with precomputed demo buttons, not free drag (`SimulationPluginWorkbench.tsx:458-556`, `sim/core/simulationWireEditor.ts:83`).
- **Undo/redo: ABSENT** (grep empty across sim + toolhost).

**Persistence:** Excalidraw element `customData["maestroTool"]` via `persistEmbedState` (`caps/board.ts:9,90-124`); rehydrate on reopen (`ToolCanvasEmbeddable.tsx:806,833-835,958-960`); topological digest FNV-1a (`sim/core/simulationSceneDigest.ts:29-56`) → `data-sim-scene-digest`.

**Events:** `deriveSimulationSolveOutcome` → dedup → `host.emitLessonEvent` (`ToolCanvasEmbeddable.tsx:856-869`) → `simulation.circuit.solved` / `simulation.error.observed` (`lessonos/simulationSolveEvent.ts:19-48`); error codes missing-resistor/solve-failed/open-circuit/no-resistor (`:1504-1545`).

**Tinkercad-parity gaps (explicit, evidence-backed):** free wire drag/connect/retarget by pointer (in-repo) · wire as first-class component in the live scene model · undo/redo · netlist **export** (import-only: Wokwi `wokwiDiagramAdapter.ts`) · instruments UI (`instrumentContract.ts` has zero consumers) · general multi-loop DC solve on the default runtime · battery/wire palette items · V1/V2 model unification.

---

## 3. LessonOS + storage

- **Event log:** `IndexedDbEventLog` (`lessonos/indexedDbEventLog.ts`): DB `lessonos-eventlog`, store `lessonos_events` keyed by explicit `seq` via `add()` (`:36-48,141-159`), **writeQueue serialization** (`:73,121-132`, the P31 fix), corruption-flagging recovery (`:103-118`), JSONL export/import (import = empty-log-only `:189-243`), graceful fallback to `InMemoryEventLog` (`:301-313`).
- **Event kinds** (`lessonos/eventlog.ts:45-132`): lesson.started/ended, concept.introduced, material.cited, error.observed, exercise.completed, simulation.step.completed/circuit.solved/error.observed, plugin.mounted, quiz.attempted, studentpack.generated/exported. All require non-empty evidence (`:25`). `pdf.page.view` is a *journal* event promoted to `material.cited` by `journalBridge.ts:85-104`.
- **Board persistence is a DIFFERENT store:** `Room.tsx` autosave debounce 700ms (`:286-324`) → `WorkspaceStore` → **localStorage** by default (`store/WorkspaceStore.ts:42-46`, prefix `maestro:`, ~5MB) or File System Access on user gesture (`:52-70`). Room scoping = **URL hash `#room`** (`Room.tsx:34-41`).
- **`.lesson` = ZIP** (`store/lessonBundle.ts:28-35`): `raw/board.excalidraw`, `raw/events.jsonl`, `raw/session.yaml`, `raw/audio/`, `raw/lessonos-events.jsonl`. ZipSlip guard (`:162-169`), GDPR audio consent gate (`:182-186`).
  - **Round-trip gap:** LessonOS snapshot is **exported but NOT restored on import** (`lessonBundle.ts:52-56` "fase successiva") — reimporting a `.lesson` restores the board but not the didactic memory/graph.
- **Lesson graph = derived view, never stored:** `materialize(events)` → `projectGraphView` (`lessonos/materializer.ts:61`, `teacherDashboardProjection.ts:483-506`); rendered by prop-driven `LessonGraphCanvas.tsx:32-40` (deterministic radial BFS `:91-151`).
- **Exactly one backend client:** `LessonOsApiClient` (`lessonos/apiClient.ts:147-179` — health, lessons, saved-lessons, quiz grade) targeting external FastAPI "ardesia-api-vercel" **not in this repo**; **fail-closed** — no `baseUrl` (localStorage `ardesia.lessonos.baseUrl` or `VITE_LESSONOS_BASE_URL`) ⇒ zero fetch (`store/savedLessonsView.ts:33-52`). Constructed only in `design/SavedLessonsView.tsx:28`. `?room=` query is this view's room notion — distinct from board `#room`, unreconciled.
- **Entitlements/marketplace:** local-first `entitlements/entitlementCore.ts` (license key → hashed one-time tokens, anti-enumeration, no PII `:101-274`); `toolhost/marketplace/marketplaceItem.ts` zod union plugin|content-product with EU-AI-Act/GDPR refines (`:144-164`); **no payment rail; no UI wiring found** into the main render tree.

---

## 4. ElabTutor

- **Product host is ZERO-LLM — verified:** `llm.generate` declarative-only (`capabilities.ts:14`), no handler in `host.ts:269-283`; conformance test asserts declared-but-unwired → METHOD_NOT_FOUND (`__tests__/Toolhost.conformance.test.ts:396`); no fetch/axios in product src; canon (`docs/PRODUCT-CANON.md:45`).
- **Studio tutor surface = `ElabLab.tsx`** (`design/ElabLab.tsx:95`): pack experiment + **verbatim book citation** (`:110-111` from `packs/elab-tutor/data/volume-references.js`, 88/88 lesson paths) + monta-tu free assembly (`:401-403`) + mistake-marking → `error.observed` (`:178-189`). **No chat.** Chat/LLM tutor (`ElabTutorV4.jsx` 145KB, `ChatOverlay.jsx`) exists only in legacy `plugins/elab-tutor/src/components/tutor/`.
- **Legacy LLM plumbing** goes through Supabase Edge functions (`unlim-*`), anon JWT only client-side — no provider keys in repo (`plugins/elab-tutor/src/services/multimodalRouter.js:211-334`, `api/voxtral.js:29-60`).
- **Citations grounding chain:** `document:sha256` (`loadFile.ts:43`) → `manualRegistry.ts:47-53` (fail-closed on unknown docId) → `journalBridge.ts:99` → `material.cited` with dual evidence.
- **Graph:** tutor tools read-only via `graph.query` (`caps/graph.ts:53-80`); `graph.proposeClaims` unwired ("T3 fuori registro", `caps/graph.ts:9`). ElabLab writes facts (events), graph derives.
- **Tutor-answer contract** (Phase 6 target: answer + cited nodes + confidence + suggested action + misconception tags + exercise): **does not exist anywhere yet.**

---

## 5. Engine, services, packs

- **`packages/engine`** — Python `lessonos` pkg (uv, py≥3.12, deps faster-whisper+networkx): method graph (`graph/grounding.py`, `suggest.py`), retrieval (`retrieval/teacher.py`, `hybrid.py`; recall harness `eval/retrieval.py`), MCP grounded-memory **in-process only, no transport** (`mcp/grounded_memory.py:42,170`), SQLite store, recap export. ~2011 test functions / 95 files. **No HTTP server; studio never calls it.**
- **`services/entitlement`** — FastAPI sandbox port of the TS entitlement core (license/token/GDPR endpoints), explicitly SANDBOX ONLY, **zero references from studio**.
- **`packs/elab-tutor`** — data+method-only pack `io.elab.tutor` (88 lesson paths, volume refs/citations), CI-gated zero-shell (`bin/ci/elab_boundary_gate.py` ratchet), declares dep `io.ardesia.simulation >=2.0.0`.
- **`ops/` + `bin/`** — factory tooling (never shipped) + CI gates: `secret_scan.py` (high-confidence patterns incl. supabase service_role), `nul_scan.py`, `elab_boundary_gate.py`, `pr-merge-verify.sh` (merge-commit, never force-push), `studio-probe.sh` (manual Playwright probe).

---

## 6. Deploy

- **apps/studio: ZERO deploy config** — no vercel.json/ts, netlify, supabase, wrangler, Dockerfile (verified find). Env surface: `import.meta.env.DEV` (`Room.tsx:209`) + `VITE_LESSONOS_BASE_URL` (`store/savedLessonsView.ts:37`). Nothing else.
- Preview deploy points **nowhere** from this monorepo: `bin/monorepo.sh:190-198` reports missing `.vercel/project.json` and warns not to `vercel link` without Andrea's approval. `studio-preview-readiness.yml` = build check only (`no-deploy-check`).
- All cloud config lives under `plugins/elab-tutor/` (moat): its own `vercel.json` (fra1, CSP → supabase/onrender/netlify), `supabaseSync.js`, render.yaml ×3, Dockerfiles. Deployed Vercel projects (`ardesia-lavagna`, `ardesia-workspace`) live in a **separate repo** per `ops/knowledge/GITHUB-VERCEL-STATE.md`.
- **CI:** `ci.yml` = studio (node22: tsc, vitest deterministic, build) + engine (uv pytest) + hygiene (nul/secret/boundary/whitespace). **No Playwright in CI** (grep-verified).

---

## 7. Consolidated unknowns

| # | Unknown | Why it matters |
|---|---|---|
| U1 | Drag/retarget gesture semantics live out-of-repo in `@elab-tutor-plugin/plugin/renderEmbeddable` (dyn-imported `ToolCanvasEmbeddable.tsx:1211`) | Phase 5 wire-manipulation work must read that package first |
| U2 | Whether `CircuitSolver.js` MNA stage does a true linear solve for parallel branches (2486-line vendored, not line-traced) | Determines effort for general-topology DC solve |
| U3 | `ardesia-api-vercel` FastAPI (LessonOsApiClient target) is outside this repo — reachability/routes unverified | Phase 3 backend nucleus: extend it vs replace |
| U4 | Loopback origin server (iframe isolation) real bind is outside repo (`originServer.ts:1-7`) | ToolFrame path is a model until a shell provides it |
| U5 | Legacy `plugins/elab-tutor` standalone: still built/shipped or quarantined salvage? | License/security surface; boundary gate only ratchets |
| U6 | `#room` (board) vs `?room=` (saved-lessons) unreconciled room notions | Backend lesson identity design (Phase 3) |
| U7 | Whether any production route mounts `buildLocalCatalog`/essential plugins at runtime | Plugin-window UI (consolidation S6) prerequisites |
| U8 | Supabase Edge functions (`unlim-*`) server-side key handling — outside repo | Phase 6/8 model-provider boundary |
| U9 | `builtin-led`/`nano-r4` V1 kinds not in solver catalog — physics treatment untraced | Palette expansion correctness |

## 8. What this audit changes about the plan

1. **Phase 2 (plugin grammar) has a concrete target:** not "design a manifest" (exists, good) but **close the enforcement gap** — run the live simulation embed path through the manifest/capability layer (or explicitly ADR why board-embeds are first-party-trusted).
2. **Phase 3 (backend):** an external FastAPI (`ardesia-api-vercel`) already has a typed client with fail-closed config; nucleus work should start by inspecting/extending THAT (U3) rather than greenfield Supabase — needs Andrea's repo access decision. `.lesson` import→event-log restore (`importSnapshot` exists, unwired) is a cheap high-value slice.
3. **Phase 5 slice 1 refined:** "battery9v/wire first-class" must reconcile V1 vs V2 scene models (or pick V1 + catalog) and read U1 first; undo/redo is a standalone later slice.
4. **Phase 6 (ElabTutor):** contract does not exist; ZERO-LLM rule means the tutor-answer contract must be provider-injectable with **no** runtime LLM in the product host (fake provider in tests; real provider server-side, out of host).
