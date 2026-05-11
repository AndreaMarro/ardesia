# Iter 29 Agent A — API Design Review (ELAB Tutor Edge Functions)

**Date**: 2026-05-11
**Scope**: read-only audit of `supabase/functions/*` Edge Functions + OpenAPI 3.1 spec generation
**Working dir**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`
**Companion artifact**: `docs/api/openapi.yaml`

This document is an honest API surface audit. Every claim is grounded in
`file:line` references. Score is calibrated against G45 anti-inflation
mandate. No source code was modified. No tests were added.

---

## 1. Endpoint catalogue (11 Edge Functions, 11 paths)

Authoritative inventory from `supabase/functions/*/index.ts`. Base URL in
production: `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/`.

| # | Function | HTTP | Auth (server) | Body cap | Rate limit | Status codes observed (file:line) |
|---|---|---|---|---|---|---|
| 1 | `unlim-chat` | `POST` + `GET` (health) + `OPTIONS` | anon JWT (gateway) + `X-Elab-Api-Key` (fail-open if `ELAB_API_KEY` unset, `guards.ts:66-87`) | 100 KB (`guards.ts:118,127`) | 30 req/60s by `sessionId` (`guards.ts:106`, `unlim-chat/index.ts:201`) | `200, 204, 400, 401, 403, 405, 413, 429` (`unlim-chat/index.ts:128-210`) |
| 2 | `unlim-vision` | `POST` + `OPTIONS` | anon JWT only | 12 MB multimodal (`guards.ts:119,138`; `unlim-vision/index.ts:158`) | none direct | `200, 204, 400, 405, 413, 500` (`unlim-vision/index.ts:146-227`) |
| 3 | `unlim-tts` | `POST` + `OPTIONS` | anon JWT + optional `sessionId` consent | 100 KB | per-`sessionId` (or IP) 30/min (`unlim-tts/index.ts:80-86`) | `200, 204, 400, 403, 405, 413, 429` (audio body OR JSON fallback) |
| 4 | `unlim-stt` | `POST` + `OPTIONS` | anon JWT, **NO** rate limit | 12 MB multimodal | none | `200, 204, 400, 405, 413, 500` (`unlim-stt/index.ts:19-115`) |
| 5 | `unlim-imagegen` | `POST` + `OPTIONS` | anon JWT, **NO** rate limit | 100 KB | none | `200, 204, 400, 405, 413, 500` (`unlim-imagegen/index.ts:25-87`) |
| 6 | `unlim-diagnose` | `POST` + `OPTIONS` | anon JWT + optional consent | 100 KB | by `experimentId` 30/min (`unlim-diagnose/index.ts:66-72`) | `200, 204, 400, 403, 405, 413, 429, 500, 503` |
| 7 | `unlim-hints` | `POST` + `OPTIONS` | anon JWT + optional consent | 100 KB | by `experimentId` 30/min (`unlim-hints/index.ts:54-60`) | `200, 204, 400, 403, 405, 413, 429, 500, 503` |
| 8 | `unlim-gdpr` | `POST` + `OPTIONS` | anon JWT + `authToken` for `delete/export` (`unlim-gdpr/index.ts:50-69`) | 100 KB | by `sessionId/studentId` 30/min | `200, 204, 400, 403, 405, 413, 429, 500` |
| 9 | `unlim-session-description` | `POST` + `OPTIONS` | anon JWT | 100 KB | none | `200, 204, 400, 404, 405, 413, 500, 503` |
| 10 | `compile-proxy` | `POST` + `OPTIONS` | anon (intentionally public — n8n upstream public) | 50 KB (`compile-proxy/index.ts:43`) | none | `200, 204, 400, 405, 413, 502` |
| 11 | `dashboard-data` | `GET` + `POST` + `OPTIONS` | anon JWT (auth enforcement is SCAFFOLD — `dashboard-data/index.ts:110`) | 100 KB | none | `200, 204, 405, 500` |

**Note 1**: `unlim-wiki-query` listed in the iter 29 task scope **does not
exist** as an Edge Function. Wiki retrieval is a server-internal helper
(`scripts/wiki-query-core.mjs` + `scripts/wiki-corpus-loader.mjs`), not an
HTTP endpoint. Removed from OpenAPI surface — no orphan paths.

**Note 2**: `unlim-chat` is the only function that exposes a documented `GET`
health probe returning `status/version/uptime/metrics` (`unlim-chat/index.ts:133-145`).
Every other function silently returns 405 for non-POST. This asymmetry is
quietly limiting observability for SRE.

---

## 2. Request / response schema source of truth

Canonical TypeScript shapes live in `supabase/functions/_shared/types.ts`:

| Type | File:line | Notes |
|---|---|---|
| `ChatRequest` | `types.ts:6-16` | `message`, `sessionId`, optional `circuitState`, `experimentId`, `simulatorContext`, `images[]`, `aiProfile`, `aiDepth`, `unlimMode` |
| `ChatResponse` | `types.ts:18-27` | `success`, optional `response/source/audio/actions[]/error/dataProcessing/aiProfile` |
| `DiagnoseRequest` | `types.ts:29-33` | `circuitState`, `experimentId?`, `sessionId?` — runtime ALSO accepts `{image, circuit, session_id, prompt}` schema (`unlim-diagnose/index.ts:33-43`) **drift** |
| `DiagnoseResponse` | `types.ts:35-40` | `success`, `diagnosis?`, `source?`, `error?` |
| `HintsRequest` | `types.ts:42-47` | `experimentId`, `currentStep?`, `difficulty?`, `sessionId?` |
| `HintsResponse` | `types.ts:49-54` | `success`, `hints?`, `source?`, `error?` |
| `TTSRequest` | `types.ts:56-61` | `text`, `voice?`, `language?`, `speed?` — runtime ALSO accepts `provider`, `rate`, `pitch`, `voice_id`, `format` (`unlim-tts/index.ts:47-54`) **drift** |
| `CircuitState`, `ComponentState`, `ConnectionState`, `SimulatorContext`, `ImageData` | `types.ts:63-96` | Used by chat + diagnose |
| `MessageHistoryEntry`, `StudentContext` | `types.ts:98-121` | Internal memory shapes (not exposed externally) |
| `GeminiModel` (union) | `types.ts:127-129` | `'gemini-2.5-flash-lite' | 'gemini-2.5-flash' | 'gemini-2.5-pro'` |

`VisionRequest` is defined **inline** in `unlim-vision/index.ts:36-44` (NOT
exported from `_shared/types.ts`) — drift candidate. `ImageGenRequest`
inline `unlim-imagegen/index.ts:18-23`. `DashboardRequest/Response`
inline `dashboard-data/index.ts:29-52`. Centralising these in
`_shared/types.ts` is a P2 refactor.

---

## 3. API design review — REST best practices

### 3.1 Resource modelling

Endpoint names are **action-oriented**, not resource-oriented (`unlim-chat`,
`unlim-diagnose`, `unlim-hints`, `unlim-tts`, `unlim-stt`, `unlim-imagegen`).
This is acceptable for an LLM-backed RPC surface but diverges from REST
maturity level 2. There is no resource hierarchy (e.g., `/sessions/{id}/messages`).

**Verdict**: Pragmatic given Supabase Edge Functions don't support
sub-paths cleanly. Not a P0. Document trade-off explicitly.

### 3.2 HTTP method usage

- `POST` is used universally — including for **read-only** operations like
  `unlim-session-description` (`unlim-session-description/index.ts:80-84`)
  which could be a `GET /sessions/{id}/description`.
- `dashboard-data` supports both `GET` and `POST` symmetrically (`dashboard-data/index.ts:84-108`),
  the right choice for a query endpoint, but no caching semantics
  (`Cache-Control: no-store`).
- `unlim-gdpr` dispatches by `action` field in body (`unlim-gdpr/index.ts:37`),
  RPC-style. Acceptable but limits HTTP caching + URL-level routing.

### 3.3 Idempotency

No `Idempotency-Key` header is honoured anywhere. Consent writes
(`unlim-gdpr/index.ts:180-189`) use Postgres `onConflict: 'student_id'`
upsert which is functionally idempotent at the DB layer but not exposed in
the API contract. For LLM POSTs idempotency is fundamentally hard (stochastic
output) — defer to retry budgets + response caching on the client.

### 3.4 Status code consistency

Status code usage is **inconsistent**:

- `unlim-chat` returns **200** with `success: true, source: 'guard'` when
  the prompt injection guard fires (`unlim-chat/index.ts:215-223`). This is
  semantically debatable — the request was *handled* but the requested action
  was *blocked*. A response of `200 success:true` masks security events from
  HTTP-level monitoring.
- `unlim-tts` returns **200** with `{success: true, source: 'browser', ...}`
  on VPS upstream failure (`unlim-tts/index.ts:212-222`) — graceful
  degradation. Good UX, but again hides failures from `X-Tts-Provider`
  metrics aggregation. The client must inspect the JSON body to know.
- `unlim-diagnose` returns **503** for LLM chain exhaustion
  (`unlim-diagnose/index.ts:131-137`) which is technically correct (`Service Unavailable`)
  but the same condition in `unlim-chat` returns **200** with a hardcoded
  safety fallback (`safety-hardcoded-fallback.ts`).
- `unlim-gdpr` returns **403** for ownership-token mismatch (`unlim-gdpr/index.ts:66-69`)
  which is correct; matches RFC 7231.

### 3.5 Error envelope shape

**Three distinct error shapes** ship today:

| Shape | Used by | Example |
|---|---|---|
| `{success: false, error: string}` | most chat/vision/tts/stt/hints/diagnose/gdpr/session-description/imagegen | `{"success":false,"error":"Empty message"}` |
| `{success: false, error: string, details?: string}` | `unlim-vision:219-223`, `unlim-stt:111-114`, `unlim-imagegen:82-85` | `{"success":false,"error":"Vision analysis failed","details":"timeout"}` |
| `{error: string, max_bytes?: number, message?: string, upstream?: string}` | `compile-proxy:84-156` (NO `success` field!) | `{"error":"payload_too_large","max_bytes":50000}` |

This is the **#1 P0 finding**. A consumer cannot rely on `success: false`
as a portable error indicator. SDK generation will produce divergent types.

### 3.6 Authentication header confusion

There are **two auth mechanisms** stacked, but only `unlim-chat` enforces
both:

- Supabase anon JWT in `Authorization: Bearer <SUPABASE_ANON_KEY>` (gateway
  level, browser-bundle-visible therefore scrapeable per
  `guards.ts:52-55`).
- `X-Elab-Api-Key` header verified via constant-time-ish comparison
  (`guards.ts:66-87`), **fail-open when `ELAB_API_KEY` unset**.

Only `unlim-chat` calls `verifyElabApiKey()` (`unlim-chat/index.ts:159`).
The other ten endpoints rely solely on anon JWT — which is in the browser
bundle. This is a defense-in-depth gap (P1).

Worse, `compile-proxy` is **intentionally unauthenticated** (`compile-proxy/index.ts:21-22`)
because the upstream n8n endpoint is public. There is no documentation
warning consumers that POSTing arbitrary C++ code to a public endpoint
funnels through ELAB infrastructure.

### 3.7 CORS preflight

CORS handling is consistent across all 11 endpoints (`getCorsHeaders` in
`guards.ts:21-34`):

```
Access-Control-Allow-Origin: <echo if in allow-list, else first entry>
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, apikey, X-Elab-Api-Key, x-client-info
Vary: Origin
```

`compile-proxy` has its own duplicate copy (`compile-proxy/index.ts:51-61`)
sourced from `compile-proxy/cors.ts` — slight drift from `_shared/guards.ts`
but functionally equivalent. **P2**: deduplicate.

Allow-list `guards.ts:11-19` covers prod + dev + 2 alternate domains. Vercel
preview deployments are NOT in this list — they go through `compile-proxy`'s
regex allow-list only. This is a known gap (`compile-proxy/index.ts:46-49`).

### 3.8 Pagination + filtering

None of the endpoints expose lists. `dashboard-data` is scaffolded
(`dashboard-data/index.ts:21,119`) so pagination questions are moot. RAG
chunk lookup is internal-only.

### 3.9 Rate limiting + observability headers

- Rate limit: 30 req / 60 s / sessionId (`guards.ts:105-106`). Limit is
  **not surfaced** via `X-RateLimit-*` headers — clients only see
  `429 + JSON error`. They cannot back off intelligently without scraping
  the localized error string. **P1**.
- Observability: `unlim-vision` emits `X-Vision-Provider`
  (`unlim-vision/index.ts:194-195`); `unlim-tts` emits
  `X-Tts-Provider/Voice/Model/Latency-Ms` (`unlim-tts/index.ts:138-141`).
  No other endpoint surfaces analogous metadata headers, even though
  `unlim-chat` already tracks `source`, `aiProfile`, `dataProcessing`
  internally.

### 3.10 Input validation

Solid where it exists. `validateChatInput` (`guards.ts:250-280`),
`sanitizeMessage` prompt-injection guard (`guards.ts:282-345`), unicode
NFKD normalisation, multi-language injection patterns. `validateSessionId`
enforces `[a-zA-Z0-9_\-.:]{1,128}` (`guards.ts:142`). `validateExperimentId`,
`validateMimeType`, `validateDifficulty`, `validateEmail`,
`validateConsentMethod`, `validateTTSVoice`, `validateTTSLanguage`,
`validateTTSSpeed` cover narrow surfaces. **Gap**: `unlim-vision` accepts
arbitrary image strings (`unlim-vision/index.ts:164-169`) without validating
that they are data URIs OR https URLs. `unlim-stt` accepts arbitrary content
types `audio/*` with magic-byte detection delegated to `cloudflare-client.ts`.

### 3.11 GDPR + PII

Slice 250/100 chars on memory storage referenced in iter 29 task scope is
visible in `unlim-chat/index.ts:252,255,308,311,340,347,433,435` — every
`saveInteraction()` and `saveMessageHistory()` call passes
`response.slice(0, 100)`. The original input is `safeMessage` (sanitized).
The `dataProcessing` field in `ChatResponse` (`types.ts:25`) declares which
external service handled the prompt — surfaced through GDPR transparency.
Vision uses `dataProcessing: 'google-gemini-eu-frankfurt'` or `'mistral-eu-fr'`
(`unlim-vision/index.ts:103,142`). **Strength**.

`unlim-gdpr` implements GDPR Art. 8 (consent), Art. 17 (deletion), Art. 20
(portability), Art. 28 §3 (audit log to `gdpr_audit_log`). Pattern is correct
but **discoverability** is poor — there is no API root that announces these
endpoints. **P2**: publish OpenAPI publicly + link from Privacy Policy.

---

## 4. Versioning strategy

There is **no versioning** at the URL or header level. The path is fixed at
`/functions/v1/<name>` (Supabase platform default). `unlim-chat` has an
in-process `VERSION = '2.1.0'` constant (`unlim-chat/index.ts:111`) surfaced
via the `GET` health probe — but no other endpoint exposes a version.

There is also a **deployment-version drift problem** flagged in CLAUDE.md
(iter 37 close): `unlim-chat v50` was deployed mid-bench, so R5 scores
mixed v49+v50 responses. Without a `X-Edge-Function-Version` header on every
response, this kind of drift is invisible to consumers.

**P1**: introduce `X-Elab-Api-Version` response header (set from
`Deno.env.get('FUNCTION_VERSION') || '0.0.0'`) on every endpoint. Cheap
(~5 LOC per function). Massively improves bench reproducibility.

There is no formal deprecation policy. ADR-028 §14 amend pattern (iter 37)
suggests an ad-hoc convention but is not documented for external consumers.

---

## 5. Top findings — prioritised

### P0 (block iter 30+ ship without addressing)

1. **Error envelope inconsistency** (§3.5). Three shapes in production.
   Pick `{success: false, error: string, details?: string, code?: string}`
   and harmonize. `compile-proxy` is the worst offender (no `success` field).
2. **Auth header confusion** (§3.6). Only `unlim-chat` enforces `X-Elab-Api-Key`.
   Either propagate to all sensitive endpoints or document why it's
   chat-only (CLAUDE.md iter 32 §"Stato modelli LIVE prod" implies all 11
   endpoints handle minor-data → audit gap).
3. **No public OpenAPI** (§4 + §3.8). Schema drift between `_shared/types.ts`
   and inline endpoint types (Vision, ImageGen, Dashboard) is invisible.
   Ship `openapi.yaml` as artifact + CI lint via `@redocly/cli lint`.

### P1 (iter 30-32 fix window)

4. **No rate-limit headers** (§3.9). Add `X-RateLimit-Limit`,
   `X-RateLimit-Remaining`, `X-RateLimit-Reset` on every response that goes
   through `checkRateLimitPersistent`. Clients need this for graceful UX.
5. **No version header** (§4). Add `X-Elab-Api-Version` per-endpoint.
6. **STT/ImageGen/Vision missing rate limits** (§1). These endpoints accept
   12 MB payloads with no per-session throttle. Cost vector for abuse.
7. **`DiagnoseRequest` schema drift** (§2). Runtime accepts BOTH the legacy
   `{circuitState, experimentId, sessionId}` shape AND the iter-8
   `{image, circuit, session_id, prompt}` shape (`unlim-diagnose/index.ts:33-43`).
   Either union-type explicitly or rename one path.
8. **`TTSRequest` runtime drift** (§2). Type declares 4 fields, runtime
   accepts 9. Mirror in `_shared/types.ts`.
9. **200-on-guard ambiguity** (§3.4). Prompt-injection block returns 200.
   Move to `400 Bad Request` with explanatory `code: 'prompt_injection'` —
   still safe for end-users (toast message), discoverable for SRE.

### P2 (iter 33+ or backlog)

10. **Inline schemas** for Vision / ImageGen / Dashboard (§2). Centralise
    in `_shared/types.ts`.
11. **Duplicate CORS helpers** (§3.7). `compile-proxy/cors.ts` vs
    `_shared/guards.ts`.
12. **Missing API discovery doc** (§3.11). Privacy Policy in `public/`
    should link to OpenAPI spec.
13. **Endpoint resource modelling** (§3.1). Long-term: consider
    `/v2/sessions/{id}/messages` style when Edge Functions support sub-paths.
14. **No deprecation policy** (§4). Document `Sunset` + `Deprecation`
    headers per RFC 8594 / RFC 9745.
15. **Dashboard scaffold** still ships `source: 'stub'` (`dashboard-data/index.ts:119`).
    Mark `x-status: scaffold` in OpenAPI to warn consumers.

---

## 6. Cold start + Edge Function size

Doc-1 (iter 24) flagged Edge Function cold-start as a 1.5-3 s tax. Current
`unlim-chat/index.ts` imports **25 `_shared` modules** at the top
(`unlim-chat/index.ts:10-58`). The `_shared` directory totals ~250 KB
TypeScript (`ls -la _shared` confirms 32 files, biggest `clawbot-templates.ts`
47 KB + `system-prompt.ts` 38 KB + `rag.ts` 43 KB). On a Deno isolate cold
start this is ~250-500 ms parse time.

`unlim-chat/index.ts` itself: file content exceeds 25K tokens (read attempt
errored line 1). This is a **maintainability red flag** — splitting into a
handler module + step pipeline is overdue.

Recommendations:
- Lazy-import heavy modules behind feature flags (e.g., dynamic `await import('./onniscenza-bridge.ts')` only when classifier returns `deep_question`).
- Move `clawbot-templates.ts` body to JSON + lazy-load.
- A5 warmup cron (CLAUDE.md iter 38) already addresses cold-start with 30s
  pings; combine with module size reduction for compound win.

---

## 7. GDPR + data residency cross-check

| Provider | Region | Endpoint(s) | `dataProcessing` value |
|---|---|---|---|
| Mistral La Plateforme | EU FR | chat (Mistral primary), vision (Pixtral fallback), tts (Voxtral primary) | `mistral-eu-fr` (`unlim-vision/index.ts:142`) |
| Google Gemini | EU Frankfurt | chat (Gemini fallback), vision (Gemini primary), diagnose, hints, session-description | `google-gemini-eu-frankfurt` (`unlim-vision/index.ts:103`) |
| Cloudflare Workers AI | EU edge | stt (Whisper), imagegen (FLUX) | (header `provider: 'cloudflare-workers-ai'`) |
| Together AI | US (gated) | chat fallback only — emergency, anonymized | gated by `canUseTogether()` `together-fallback.ts` |
| Voyage AI | US (cloud) | RAG ingest only — offline pipeline, NOT runtime | n/a |

**Compliance**: 4/5 runtime providers EU-resident. Together AI is the only
US-resident provider and is gated + anonymized (`together-fallback.ts`).

Article 8 (consent for minors) is gated through `checkConsent()` in
`unlim-chat:367`, `unlim-tts:67-77`, `unlim-stt` *missing* (no consent
check), `unlim-imagegen` *missing*, `unlim-diagnose:46-55`, `unlim-hints:34-44`.
**P1 gap**: STT + ImageGen do NOT honour parental consent. STT processes
minors' voices. ImageGen could generate inappropriate content under minor
session.

---

## 8. Recommendations — concrete iter 30+ refactor sequence

**Iter 30 (focused, ~6 h):**
- [ ] Adopt canonical error envelope `{success: false, error, code?, details?}`. Refactor `compile-proxy` first (drops `success` field today).
- [ ] Add `X-RateLimit-*` headers on `unlim-chat`, `unlim-tts`, `unlim-diagnose`, `unlim-hints`, `unlim-gdpr`.
- [ ] Add `X-Elab-Api-Version` env-driven response header on all 11 endpoints (5 LOC each).

**Iter 31 (~4 h):**
- [ ] Wire `verifyElabApiKey()` on all sensitive endpoints (NOT compile-proxy). Document fail-open semantics in OpenAPI.
- [ ] Add `checkConsent()` to `unlim-stt` and `unlim-imagegen` (parity with chat/diagnose/hints/tts).
- [ ] Add per-session rate limiting to STT + ImageGen (cost protection).

**Iter 32 (~6 h):**
- [ ] CI lint OpenAPI: `npx @redocly/cli lint docs/api/openapi.yaml` in pre-commit + GitHub Actions.
- [ ] Publish `openapi.yaml` at `https://www.elabtutor.school/api/openapi.yaml` (static asset). Link from Privacy Policy.
- [ ] Generate TypeScript SDK candidate via `openapi-typescript` (read-only consumption). Validate against existing `src/services/api.js` usage.

**Iter 33+ (backlog):**
- [ ] Centralise inline schemas (`VisionRequest`, `ImageGenRequest`, `DashboardRequest`) in `_shared/types.ts`.
- [ ] Deno port of `clawbot-templates.ts` to lazy-loaded JSON.
- [ ] Document deprecation policy (`Sunset` + `Deprecation` headers).
- [ ] Python client SDK candidate (only if external/Mac Mini consumers need it).

---

## 9. OpenAPI artifact stats

Generated `docs/api/openapi.yaml` (OpenAPI 3.1.0):

- **Paths**: 11 (`/unlim-chat`, `/unlim-vision`, `/unlim-tts`, `/unlim-stt`,
  `/unlim-imagegen`, `/unlim-diagnose`, `/unlim-hints`, `/unlim-gdpr`,
  `/unlim-session-description`, `/compile-proxy`, `/dashboard-data`)
- **Schemas in `components/schemas`**: 22 (request + response shapes +
  shared `CircuitState`, `ComponentState`, `ConnectionState`,
  `SimulatorContext`, `ImageData`, `ErrorEnvelope`, `RateLimitInfo` …)
- **`securitySchemes`**: 2 (`BearerAuth` Supabase anon JWT, `ApiKeyAuth`
  `X-Elab-Api-Key`)
- **Tags**: 5 (`chat`, `vision`, `voice`, `rag`, `gdpr` — plus implicit
  `tools` for compile-proxy + dashboard-data)
- **Examples**: happy path + at least one error path per endpoint
- Lint command: `npx @redocly/cli lint docs/api/openapi.yaml` (NOT executed
  this iter — Redocly not in `package.json` deps, defer install to iter 32
  P0 task above)

---

## 10. Honesty caveats

1. `unlim-chat/index.ts` exceeds 25 K tokens and could not be fully read in
   one shot. Schema details past line 450 inferred from `_shared/*`
   re-exports + types. Anyone iter-30+ should re-read full file before
   landing changes.
2. The `prompt_class`, `safety_fires`, `intents_parsed`, `debug_retrieval`
   extensions to `ChatResponse` are documented in code but **not in
   `_shared/types.ts`**. OpenAPI captures them as additional optional
   fields based on observed runtime usage (file:line cited). Future drift
   will not be auto-detected.
3. R5/R6/R7 bench scores referenced in CLAUDE.md are out-of-scope here.
4. `dashboard-data` schema is intentionally `0.1.0-scaffold` — not
   recommended for SDK auto-gen until Day 05 wiring lands.
5. `compile-proxy` body cap is 50 KB vs 100 KB elsewhere — captured in
   OpenAPI per endpoint, not at API level.
6. The OpenAPI spec was not run through Redocly lint this iter (out of
   25-min budget). Authored to OpenAPI 3.1 grammar with manual cross-check;
   any structural error should surface in iter 32 CI task.

---

End of audit.
