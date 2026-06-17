# ELAB Tutor Cross-Compile API — Design Rationale
## iter 76 D.3 — OpenAPI 3.1 Canonical Contract

**Author**: BG agent 76-D.3 (backend-architect)
**Date**: 2026-05-17
**Spec file**: `infra/cloud-compile/openapi.yaml`
**Status**: PROPOSED — Andrea ratify iter 77+ entrance

---

## 1. Problem Statement

### The dual-path parity gap

ELAB Tutor has two Arduino sketch compilation runtimes:

**LOCAL agent** (`src/services/elab-agent/http-server.js`, iter 69-73)
- Runs on the teacher's Mac at `localhost:8765`
- Backed by a native `arduino-cli` installation
- Verified live iter 76: arduino-cli 1.4.1 + Renesas core 1.5.3 installed
- Ships endpoints: `GET /health`, `GET /boards`, `POST /compile`, `POST /upload`, `POST /compile-and-upload`, `GET /jobs/:id/status`
- Response shape varies from CLOUD counterpart in several fields

**CLOUD scaffold** (`infra/cloud-compile/server.js`, iter 76 ENTRANCE)
- Intended for Render.com Docker deployment
- Eliminates local arduino-cli install requirement for teachers
- Ships endpoints: `GET /health`, `GET /boards`, `POST /compile` only
- Compile response returns `hexBase64` (for WebUSB browser flash) — LOCAL does not
- `/health` returns different field names (`service` vs `agent`, `arduino_cli_ready` vs `core_renesas_uno_installed`)

**The gap that motivated this spec**: no formal contract existed between the two runtimes. The frontend CompileUploadButton.jsx (iter 70-72) and ScratchCompileBar.jsx call the LOCAL agent. A future migration to the CLOUD endpoint, or canary split routing, would require the browser client to handle two subtly different response shapes. The Riccardo Omaric demo requires cross-compile certainty — which means the chain must be provably correct, not inferred from code inspection.

### Why a formal OpenAPI contract now

1. **Demo-grade trust**: Riccardo needs to see compilation evidence (HEX bytes, stdout), not just "it worked". A contract makes the evidence machine-verifiable.
2. **Iter 77+ Render deploy gate**: before deploying to Render, the CLOUD server must conform to the same schema the browser client already calls. Having the spec in `infra/cloud-compile/` puts the contract next to the code that must satisfy it.
3. **Multi-developer coordination**: Tea, Matteo, and future contributors need a single reference for what the agent responds rather than reading two different server.js files.
4. **Contract-first testing**: iter 77+ will add `openapi-validator` to CI so that both LOCAL and CLOUD runtimes are tested against this spec rather than ad-hoc curl checks.

---

## 2. Design Decisions

### 2.1 FQBN whitelist enum

The `fqbn` field in `SketchRequest` is an enum rather than a free string:

```
arduino:renesas_uno:nanor4
arduino:avr:nano:cpu=atmega328old
arduino:avr:uno
```

**Rationale**: arbitrary FQBN values allow sketch injection via board name crafting. The whitelist is enforced at the Express layer (`ALLOWED_BOARDS` Set in both runtimes) and the enum in the spec makes it statically visible in generated clients and documentation. New boards require an explicit code change, not just a free-text value.

**Trade-off**: restricts experimentation but eliminates a class of server-side input sanitization bugs. The whitelist can be widened per iter via a one-line Set addition in both server files.

### 2.2 Sketch size limit: 100 KB (CLOUD), 10 MB body cap (LOCAL)

CLOUD uses `SKETCH_SIZE_LIMIT_KB=100` (configurable via env). This is generous for ELAB experiment sketches (the Blink Nano R4 sketch is approximately 400 bytes) while preventing trivial abuse of the public Render endpoint.

LOCAL uses a 10 MB Express body limit (`BODY_LIMIT = '10mb'`) because the agent listens loopback-only; no public surface to abuse. Compiled HEX output can itself be large (Renesas HEX is Intel HEX format, ~3× binary size), so the generous limit accommodates full HEX round-trip payloads in future direct-hex upload scenarios.

### 2.3 Auth scheme per environment

| Environment | Scheme | Rationale |
|-------------|--------|-----------|
| LOCAL | No auth; CORS origin whitelist only | Agent listens 127.0.0.1 only; network-level isolation is sufficient. Adding a key would complicate teacher onboarding. |
| CLOUD | `X-Elab-Api-Key` header (`ELAB_CLOUD_COMPILE_API_KEY` env var) | Public internet endpoint; key prevents abuse of the Render compile budget. `/health` is explicitly exempted to allow CompileAgentBanner probing without key exposure. |

The header name `X-Elab-Api-Key` was chosen to match the existing auth convention used in the UNLIM Edge Functions (`ELAB_API_KEY` header in `supabase/functions/`). This allows a single key management mental model for Andrea.

If `ELAB_CLOUD_COMPILE_API_KEY` is absent, the CLOUD server logs a `DEV MODE allow all` warning and proceeds. This intentional dev fallback avoids a hard failure during local testing of the Docker image before the Render secret is provisioned.

### 2.4 Rate limit: 10 req/min per IP (CLOUD only)

In-memory sliding 60-second window keyed by `X-Forwarded-For` (first hop, comma-split) falling back to `socket.remoteAddress`. The `Retry-After: 60` header is always returned on 429.

Chosen limit of 10 req/min is deliberately low for a first deployment:
- A teacher rarely compiles more than 3-4 sketches per minute
- Protects against runaway browser loops (CompileUploadButton polling misuse)
- Easily raised via `RATE_LIMIT_PER_MIN` env var without code change

Not applied on LOCAL because teachers are the only users and the loopback surface limits blast radius.

### 2.5 Sandbox tmpdir with 5-minute idle cleanup

Each CLOUD compile job creates an isolated directory under `/tmp/elab-cloud-compile/{jobId}/`. The directory is deleted immediately after the compile response is sent (`rm` in `finally` block). An `setInterval` cleanup job also sweeps directories older than `SANDBOX_IDLE_MIN` (default 5 min) to catch orphans from panicked processes.

LOCAL uses the same tmpdir pattern (server.js `handleCompile`) but retains the directory for the session lifetime so POST /upload can read the HEX file by `buildDir` path. Cleanup is implicit on agent restart.

### 2.6 HEX delivery: base64 on CLOUD, filesystem path on LOCAL

CLOUD returns `hexBase64` in the compile response for direct WebUSB browser flash (no local dfu-util needed). This enables the iter 76 "no install" vision.

LOCAL returns `sketchDir` / `buildDir` paths. The subsequent `POST /upload` call reads the HEX from that build directory by `jobId`. Direct hex upload (passing `hexBase64` to POST /upload) is marked as a future extension in the LOCAL http-server.js comment.

This is a real divergence in response shape. The `CompileResponse` schema in openapi.yaml includes both field sets, with accurate descriptions of which runtime populates which field.

---

## 3. Trade-offs

### REST polling vs WebSocket streaming (compile progress)

**Chosen**: REST + `GET /jobs/{jobId}/status` polling for iter 76+.

**Deferred**: Server-Sent Events (SSE) streaming of arduino-cli stdout lines, deferred to iter 77+.

**Reasoning**:
- Typical Nano R4 compile completes in 3-8 seconds locally and 5-15 seconds on CLOUD (cold Render start). At these latencies a 1-second poll interval gives adequate UX without requiring a persistent connection or SSE client setup.
- SSE requires `text/event-stream` content type, EventSource browser API, and server-side flush management — roughly 4-6 hours of additional engineering. The iter 76 D-track budget does not accommodate this.
- The in-memory job ledger on LOCAL already supports the polling model with minimal code. CLOUD compile is currently synchronous so polling is a no-op there until CLOUD gets a job queue.
- Iter 77+ will add `GET /sse/jobs/{jobId}/stream` as an additive path without breaking the existing REST polling contract.

### Synchronous CLOUD compile vs async job queue

CLOUD server.js (iter 76 scaffold) is fully synchronous: the POST /compile handler awaits `runArduinoCli(...)` before responding. This means HTTP timeout is a real risk on slow Render cold starts (Renesas core compile observed at 15-25 seconds in iter 43 Vertex timeout investigations for a different service).

Async job queue (accept immediately → return jobId → poll status) would prevent browser timeout but requires a background worker, a job store (Redis or in-memory with stickiness), and more complex error propagation. This is iter 77+ scope.

For iter 76 the synchronous approach is acceptable because:
1. The Riccardo demo runs LOCAL (localhost:8765), not CLOUD.
2. If CLOUD is deployed iter 77+, a 60-second Express / Render timeout is sufficient for most sketches.
3. The jobId is still returned in the synchronous response, so the polling contract is forward-compatible.

### Error message language: Italian (LOCAL) vs English (CLOUD)

LOCAL agent returns docente-friendly Italian messages from `buildDocenteError()` (e.g. "Il codice contiene un errore di compilazione. Controllate parentesi, punto e virgola..."). This is intentional: the teacher reads these messages live in class.

CLOUD returns short English error keys (e.g. `compile_failed`, `sketch_too_large`). The browser client is expected to map CLOUD error keys to Italian UI strings client-side.

The `ErrorResponse` schema accommodates both: the `error` field is a freeform string and the `code` field is the machine-readable key. The `category` enum allows the browser to pick the appropriate Italian UI copy without string-matching the raw `error` value.

---

## 4. Backward Compatibility

### iter 70 LOCAL agent (http-server.js)

The LOCAL agent in `src/services/elab-agent/http-server.js` was shipped in iter 69-70 and is LIVE at localhost:8765 as of iter 76. This spec does NOT propose any changes to that file — it documents the existing behavior.

Specifically:
- The `/compile` endpoint accepts both `sketchCode` and `code` field names (`const sketchCode = typeof body.sketchCode === 'string' ? body.sketchCode : body.code`) — a backward compat shim for the iter 63 handler signature. The spec documents `sketchCode` as canonical; `code` is not listed as a schema property to avoid confusing new callers.
- The `/boards` endpoint currently returns raw `arduino-cli core list` output rather than the `BoardsResponse` schema. This is documented as HC-3 in the spec's `x-elab-honesty-caveats` extension. Schema alignment is iter 77+ scope.
- The `/jobs/:id/status` endpoint returns the raw `_jobs.get(id)` entry which has more fields than `JobStatus` defines (it includes the full result object). The spec defines a minimum contract; extra fields are tolerated by JSON clients.

### iter 73 server.js (pure handlers)

`src/services/elab-agent/server.js` (iter 63 P0.5) defines `handleHealth`, `handleBoards`, `handleCompile`, `handleUpload`. These are imported by http-server.js and are not modified by this spec. The spec documents the HTTP surface, not the handler internals.

### iter 76 CLOUD server.js

`infra/cloud-compile/server.js` (iter 76 ENTRANCE) matches this spec for:
- `GET /health` — matches `HealthResponse` (uses `service` + `arduino_cli_ready` field names instead of `agent` + `arduino_cli_version`)
- `POST /compile` — matches `SketchRequest` + `CompileResponse` (uses `hexBase64` + `hexSize` + `hexFilename` — all defined in `CompileResponse`)
- `GET /boards` — returns `{supported: [...], default: "..."}` which is a subset of `BoardsResponse`

Does NOT implement:
- `POST /compile-and-upload` — not in iter 76 CLOUD scaffold
- `GET /jobs/:id/status` — not in iter 76 CLOUD scaffold (HC-2)

---

## 5. Future Evolution

### iter 77+ planned additions

**5.1 SSE streaming compile progress**

```
GET /sse/jobs/{jobId}/stream
Content-Type: text/event-stream
```

Each arduino-cli stdout/stderr line emitted as an SSE event. Client renders a live compile log in CompileUploadButton. Requires server-side `res.write` flush management and EventSource browser API. The existing polling contract (`GET /jobs/{jobId}/status`) is preserved as fallback for Safari which has SSE support but mixed behavior with CORS.

**5.2 Prometheus metrics endpoint**

```
GET /metrics
Content-Type: text/plain; version=0.0.4
```

Exposes: `elab_compile_total{status="success|error"}`, `elab_compile_duration_seconds`, `elab_active_jobs`, `elab_rate_limited_total`. Deferred to iter 78+ after first Render production traffic.

**5.3 Multi-tenant API keys (iter 80+)**

Replace single `ELAB_CLOUD_COMPILE_API_KEY` with a per-school or per-class key table (Supabase `compile_api_keys` table, keyed by `class_key`). Enables per-school rate limiting and usage analytics without sharing a global key. Requires Supabase integration on CLOUD, which is not in scope for the current Docker-only Render deployment.

**5.4 WebUSB DFU upload endpoint**

```
POST /upload-dfu
Body: {hexBase64, fqbn, deviceInfo?}
```

Server-side dfu-util invocation for boards that support USB DFU. Currently dfu-util upload is LOCAL only (physical USB required). The CLOUD path would require a USB passthrough mechanism (not feasible on Render) — this is only relevant for a self-hosted deployment or a teacher's local Docker run.

---

## 6. Test Strategy

### iter 76 (current)

No automated contract tests exist for the cross-compile API endpoints. The spec is validated by manual inspection and the live curl evidence documented in the spec itself:

```bash
# Verified live iter 76 (LOCAL agent):
curl localhost:8765/health
# → {"agent":"elab-compile-upload","arduino_cli_version":"1.4.1",...}

curl -X POST localhost:8765/compile \
  -H 'Content-Type: application/json' \
  -d '{"sketchCode":"void setup(){pinMode(13,OUTPUT);}","fqbn":"arduino:renesas_uno:nanor4"}'
# → {"ok":true,"jobId":"...","stdout":"Lo sketch usa 39048 byte (14%)..."}
```

### iter 77+ planned contract tests

**openapi-validator integration** (`@apidevtools/swagger-cli` or `@stoplight/spectral-cli`):

```bash
# CI step — validate spec syntax
npx @apidevtools/swagger-cli validate infra/cloud-compile/openapi.yaml

# Runtime contract validation (LOCAL agent must be running)
npx @stoplight/prism-cli mock infra/cloud-compile/openapi.yaml &
npx @stoplight/prism-cli proxy infra/cloud-compile/openapi.yaml http://localhost:8765 &
```

**Contract test file** (deferred iter 77+): `tests/integration/cross-compile-contract.test.js`

```javascript
// Pseudocode — iter 77+ implementation
import { validate } from '@apidevtools/swagger-parser';
import { createHttpServer } from '../../src/services/elab-agent/http-server.js';

describe('ELAB Compile Agent contract', () => {
  test('GET /health matches HealthResponse schema', async () => { ... });
  test('POST /compile with valid sketchCode matches CompileResponse', async () => { ... });
  test('POST /compile with invalid fqbn returns 400 ValidationError', async () => { ... });
  test('GET /jobs/:id/status for unknown id returns 404', async () => { ... });
  test('GET /boards returns BoardsResponse shape', async () => { ... });
});
```

The contract tests run against BOTH LOCAL (via `createHttpServer` factory) and CLOUD (via `fetch` against a running Docker container in CI) to enforce schema parity between the two runtimes.

---

## 7. Acceptance Criteria Mapping (iter 76 D.3)

| AC | Description | Addressed by |
|----|-------------|--------------|
| AC-1 | HomePage `#compile-home` route renders Blockly + IDE + CompileUploadButton | Downstream of this spec — documented that POST /compile is the correct endpoint |
| AC-2 | Esperimenti screen renders CompileUploadButton in Scratch mode | Downstream — spec documents the /compile contract that CompileUploadButton calls |
| AC-3 | Compile WITHOUT board shows HEX byte count + honest "Pronto per upload" message | `CompileResponse.hexBytes` + `CompileResponse.ramBytes` fields defined in spec |
| AC-4 | Upload WITH board shows "Caricato con successo" | `POST /compile-and-upload` endpoint documented, HC-4 honest caveat attached |
| AC-5 | Chrome/Edge → WebUsbBanner Lime; Safari/Firefox → Orange; Unknown → Navy | Not in spec scope (UI state machine) — spec documents /health for banner probe |
| AC-6 | NO false "Caricato" without successful flash | `CompileAndUploadResponse.ok` + `upload.ok` contract enforced; HC-4 warns hardware not verified |
| AC-7 | Mock USBDevice Playwright E2E verify state machine | Not in spec scope (E2E test) — deferred iter 76 D.5 budget exceeded |

---

## 8. Honesty Caveats (Anti-Inflation G45)

The following limitations are acknowledged explicitly per the iter 76 D.3 mandate
("NO COMPIACENZA. Real spec or honest gap.") and the G45 anti-inflation mandate:

1. **OpenAPI validator NOT run**: This spec was authored inline and has not been
   validated by `npx @apidevtools/swagger-cli validate` or any online tool as of
   2026-05-17. Minor YAML syntax errors or schema reference mismatches may be
   present. Validation gate is iter 77+ CI (HC-5 in openapi.yaml).

2. **CLOUD endpoint not deployed**: `https://elab-cloud-compile.onrender.com`
   does not exist. The server entry is aspirational pending Andrea's Render deploy
   decision. Per spec §76-D.6 recommendation, Render deploy is deferred to
   iter 77+. The LOCAL agent at localhost:8765 is sufficient for the Riccardo demo.

3. **Response shape divergences documented but not fixed**: LOCAL and CLOUD
   `/health` use different field names (`agent` vs `service`, `arduino_cli_version`
   vs `arduino_cli_version_raw`). LOCAL `/boards` does not yet return the
   `BoardsResponse` schema shape. These are real gaps — iter 77+ alignment task.

4. **Hardware upload unverified**: `POST /compile-and-upload` and `POST /upload`
   have not been tested with a real Nano R4 board. HW UAT deferred to
   iter 77+ Riccardo + Omaric kit.

5. **Job polling gap on CLOUD**: `GET /jobs/:id/status` always returns 404 on
   the CLOUD runtime. Synchronous compile means there is no background job to
   poll. Async job queue deferred to iter 77+.

---

*© Andrea Marro — 2026-05-17 — ELAB Tutor iter 76 D.3 — Tutti i diritti riservati*
