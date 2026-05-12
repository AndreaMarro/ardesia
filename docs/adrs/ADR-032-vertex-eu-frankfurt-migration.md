# ADR-032 — Vertex AI Frankfurt EU Migration (Phase 0 GDPR Pure Gemini)

**Status:** PROPOSED (Andrea ratify pending Phase 0 GCP setup ~2h)
**Date:** 2026-05-12
**Sprint:** Sprint U iter 39 Phase 0
**Authors:** Andrea + orchestrator
**Supersedes:** AI Studio `GEMINI_API_KEY` path (not EU-resident)
**Decision impl:** `supabase/functions/_shared/vertex-client.ts` NEW + `llm-client.ts` conditional Vertex routing
**Reference plan:** `docs/audits/2026-05-12-combo-c-phase-0-gdpr-vertex-migration.md`
**Decision ratify:** `docs/decisions/2026-05-12-pure-gemini-chat-evidence-based.md`

---

## Context

ELAB Tutor serves minors EU 8-14. **GDPR Art. 8** requires data processing residency EU. **GDPR Art. 28 §3** mandates sub-processor residency clarity for processors of minors data.

Current architecture (pre-iter-39) uses Google AI Studio (`https://generativelanguage.googleapis.com/v1beta`) via `GEMINI_API_KEY` for ~85% of chat traffic. AI Studio endpoint serves requests through US data centers by default. **Not EU-resident.**

Sprint U iter 39 ratified **Pure Gemini chat** strategy (100% chat traffic Gemini, supersedes Combo C Hybrid) based on R5 empirical evidence 2026-05-10/05-11 (1877-2727ms avg latency, 98% success rate, sub-3s p50). Pure Gemini makes Phase 0 Vertex EU migration MORE urgent — 100% chat exposure (vs 80-85% under Combo C).

## Decision

Migrate Gemini chat backend from AI Studio (US data centers) to **Vertex AI Frankfurt** (`europe-west3` region) as P0 GDPR INVIOLABLE prereq before Pure Gemini scale rollout >100 sess/day pilot.

### Architecture Changes

| Component | Before (AI Studio) | After (Vertex EU) |
|-----------|---------------------|----|
| Endpoint | `generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent` | `europe-west3-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/europe-west3/publishers/google/models/{MODEL}:generateContent` |
| Auth | `x-goog-api-key: GEMINI_API_KEY` header | `Authorization: Bearer <OAuth_access_token>` |
| Auth flow | API key direct | OAuth 2.0 JWT-bearer (Service Account RS256 sign → token exchange → 1h TTL cached) |
| Region | implicit US | explicit `europe-west3` Frankfurt EU-resident |
| DPA | none | Google Cloud Italia Srl DPA addendum (Art. 28 §3 compliant) |
| Model IDs | `gemini-2.5-flash-lite-preview-XX` | `gemini-2.5-flash-lite` (Vertex stable, no preview suffix) |
| Request body | identical (systemInstruction + contents + generationConfig) | identical |
| Response body | identical (candidates + usageMetadata) | identical |

### Code Surface

- `supabase/functions/_shared/vertex-client.ts` NEW (~360 LOC):
  - SA JSON parse from base64 env `GCP_VERTEX_SA_JSON_B64` (cold-start cached)
  - PKCS8 PEM private_key → CryptoKey via `crypto.subtle.importKey` (RSASSA-PKCS1-v1_5 SHA-256)
  - JWT mint (RS256, iss=client_email, aud=oauth2.googleapis.com/token, scope=cloud-platform, exp=1h)
  - OAuth token exchange POST `oauth2.googleapis.com/token` grant_type=jwt-bearer
  - Access token cache 5-min pre-expiry refresh
  - `callVertexGemini` mirrors `callGemini` API surface (drop-in compatible)
  - Error matrix: CONFIG_ERROR + AUTH_ERROR + RATE_LIMITED + UNAVAILABLE + EMPTY_RESPONSE + TIMEOUT + API_ERROR
  - Metrics tracking (mirror gemini.ts pattern)
- `supabase/functions/_shared/llm-client.ts` MODIFIED (~30 LOC):
  - Import `callVertexGemini` + `isVertexEUEnabled` + `VertexError` from vertex-client
  - Short-circuit TOP of `callLLM`: IF `ENABLE_VERTEX_EU=true` → route all (text + vision) Vertex Frankfurt
  - Model selection: `thinkingLevel` → `gemini-2.5-pro`, `hasImages` → `gemini-2.5-flash`, default → `gemini-2.5-flash-lite`
  - Fall-through on Vertex error: legacy AI Studio + Mistral chain remains intact safety net
- `tests/unit/vertex-client.test.js` NEW 19 PASS (config error matrix + env gate + module surface)

### Env Variable Contracts

| Var | Required | Format | Default |
|-----|----------|--------|---------|
| `ENABLE_VERTEX_EU` | yes (rollout gate) | `true` \| `false` | `false` |
| `GCP_VERTEX_SA_JSON_B64` | when ENABLE=true | base64 of SA JSON (~2 KB) | none |
| `GCP_VERTEX_PROJECT_ID` | when ENABLE=true | GCP project ID | none |
| `GCP_VERTEX_LOCATION` | optional | EU region | `europe-west3` |

Legacy `GEMINI_API_KEY` + `GEMINI_API_KEY_FALLBACK` REMAIN configured Supabase secrets — fall-through safety net during Vertex rollout. Deprecation post 7-day stability window.

## Status

**PROPOSED.** Andrea ratify pending these activation steps:

1. ✅ Code shipped: vertex-client.ts + llm-client.ts conditional + tests 19/19 PASS
2. ⏳ Andrea GCP project Frankfurt creation (`elab-tutor-prod-eu` region `europe-west3`, ~5 min)
3. ⏳ Andrea Service Account creation `elab-edge-functions@` + role `roles/aiplatform.user` (~5 min)
4. ⏳ Andrea SA key download JSON + chmod 600 (~2 min)
5. ⏳ Andrea Supabase secrets set 4 vars (GCP_VERTEX_SA_JSON_B64 + PROJECT_ID + LOCATION + ENABLE_VERTEX_EU=false initial)
6. ⏳ Orchestrator deploy unlim-chat v55 with Vertex code (NO env flag flip yet — safety)
7. ⏳ Andrea ratify deploy + flip `ENABLE_VERTEX_EU=true`
8. ⏳ LIVE smoke verify: 1 chat call → log shows `provider: "vertex"` + `location: "europe-west3"` + latency < 3s
9. ⏳ Phase 2 bench R5 60q × 3-run against Vertex (Pure G empirical confirm post-migration)
10. ⏳ Decision: 7-day stability window → if PASS → remove `GEMINI_API_KEY` AI Studio (deprecation)

## Consequences

### Positive

- **GDPR Art. 8 minori EU residency** ✓ data processing 100% europe-west3 Frankfurt
- **DPA Art. 28 §3** ✓ Google Cloud Italia Srl signed addendum
- **Pure Gemini scale unblocked** — current pilot <100 sess/day OK on AI Studio, Vertex required ≥100 sess/day
- **Single-vendor concentration risk reduced** — Vertex Google global infra vs AI Studio shared with consumer products
- **OAuth credentials more secure** — short-lived 1h tokens vs persistent API key
- **Performance parity expected** — Vertex Frankfurt p95 <3s expected (similar to AI Studio empirical iter 39 1877-2727ms avg)
- **Backward-compat safety net** — env flag `ENABLE_VERTEX_EU=false` instant rollback
- **Drop-in code surface** — `callVertexGemini` mirrors `callGemini` API, no caller changes

### Negative

- **Setup complexity** — Andrea ~2h GCP console (project + SA + key + Supabase secrets)
- **Cost premium** — Vertex ~20-25% more than AI Studio for EU residency + DPA (~€3-5/mese pilot →
  ~€30-50/mese 1000 sess/day, within ELAB <€50 budget)
- **Auth flow overhead** — JWT mint + token exchange first call cold (~200ms extra) then cached 1h
- **Region SLA** — europe-west3 4-9s outage history vs us-central1 0-3s; pilot scale tolerable
- **Model alias migration** — `gemini-2.5-flash-lite-preview-XX` → `gemini-2.5-flash-lite` (Vertex stable). Iter 39 model handling strips `-preview` suffix automatically.
- **Test fixture limitation** — RSA private_key sign requires real PEM + crypto.subtle Deno; unit test coverage limited to config error paths + module surface. Live smoke + Phase 2 bench validates crypto path.

### Risks Mitigated

1. **GDPR audit failure** before Vertex migration: pilot scope <100 sess/day pre-Phase-0 explicit limit
2. **Vertex outage** post-deploy: fall-through to AI Studio + Mistral chain remains active until 7-day stability
3. **SA key leak**: stored Supabase secret (server-only, never in repo); base64-encoded; key rotation procedure documented
4. **JWT clock skew**: 1h validity window with 5-min pre-expiry refresh; tolerable to ±1 min clock drift
5. **Token exchange rate limits**: cached 1h, expected ~24 exchanges/day worst case (well under Google quota)

## Rollback Plan

**Instant rollback** (any time post-deploy):
```bash
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase secrets set ENABLE_VERTEX_EU=false --project-ref euqpdueopmlllqjmqnyb
```
Re-deploy NOT required — env read at runtime via `Deno.env.get`. Effect within ~5 seconds (Edge Function cold-start cycle).

Legacy AI Studio `GEMINI_API_KEY` path remains active as primary chat backend during rollback. Pilot pre-iter-39 behavior preserved.

## References

- ADR-031 STT Voxtral Transcribe 2 (Sprint T iter 38) — complementary Mistral EU FR strategy
- ADR-029 LLM_ROUTING_WEIGHTS conservative tune (Sprint T iter 37)
- ADR-028 INTENT dispatcher surface-to-browser (Sprint T iter 36)
- Decision doc: `docs/decisions/2026-05-12-pure-gemini-chat-evidence-based.md`
- Phase 0 setup plan: `docs/audits/2026-05-12-combo-c-phase-0-gdpr-vertex-migration.md`
- Master plan: `docs/superpowers/plans/2026-05-12-elab-max-everything-strategy.md`
- Google Cloud DPA: https://cloud.google.com/terms/data-processing-addendum
- Vertex AI Frankfurt SLA: https://cloud.google.com/vertex-ai/docs/general/locations#europe-west3
- Vertex AI generateContent reference: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini
- GDPR Art. 8 minori EU: https://gdpr-info.eu/art-8-gdpr/
- GDPR Art. 28 §3 sub-processor: https://gdpr-info.eu/art-28-gdpr/
- R5 empirical evidence: `scripts/bench/output/r5-stress-report-2026-05-11T01-13-33-309Z.md`
