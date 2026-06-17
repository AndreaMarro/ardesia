# Phase 0 — Vertex EU Frankfurt Migration (Combo C prereq INVIOLABLE)

**Date:** 2026-05-12
**Sprint:** Sprint U iter 39
**Owner:** Andrea (GCP setup) + orchestrator (Edge Function code change)
**Status:** P0 GDPR prereq — MUST complete before Combo C scale rollout
**Effort:** 4-6h (Andrea ~2h GCP + orchestrator ~2-4h code)

---

## Why P0 GDPR mandate

ELAB Tutor serves minors EU 8-14 — **GDPR Art. 8** requires data processing residency EU. Gemini AI Studio (current path via `GOOGLE_API_KEY`) is **NOT EU-resident**: requests served from `generativelanguage.googleapis.com` route through US data centers by default. This violates Art. 28 §3 sub-processor residency for minori EU.

Combo C Hybrid chosen iter 39 makes Gemini Flash-Lite the **default chat path** (~80-85% of traffic). Scaling production traffic against AI Studio amplifies GDPR exposure proportionally. Vertex AI Frankfurt region (`europe-west3`) is GA EU-resident with DPA addendum signed by Google Cloud Italia Srl.

**Inviolable rule:** Combo C MUST run on Vertex Frankfurt before traffic scale beyond current ~50 sessions/day pilot. Until then, keep Andrea-explicit pilot mode `< 100 sessions/day`.

---

## Migration scope

### What changes

| Layer | From | To |
|-------|------|-----|
| Auth | `GOOGLE_API_KEY` API key | Service Account JSON + OAuth 2.0 token refresh |
| Endpoint | `generativelanguage.googleapis.com/v1beta/...` | `europe-west3-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/europe-west3/publishers/google/models/{MODEL}:generateContent` |
| Models | `gemini-2.5-flash-lite-preview` + `gemini-2.5-pro` | `gemini-2.5-flash-lite` + `gemini-2.5-pro` (Vertex GA) |
| SDK | direct fetch + bearer | direct fetch + OAuth access token (1h TTL) |
| Region | implicit US | explicit `europe-west3` Frankfurt |

### What stays the same

- Prompt schema (BASE_PROMPT v3.1 + Capitolo injection + PZ V3 rules)
- Response format (text + intents_parsed)
- Streaming (NOT used currently)
- Vision multimodal (`inline_data` base64) — Vertex supports identical schema

---

## Andrea action steps (~2h GCP console)

### 1. Create GCP project EU-anchored

```bash
# Project: elab-tutor-prod-eu
# Billing: link to existing Andrea card (cost ~€10-30/mese pilot scale)
# Location: europe-west3 (Frankfurt)
# DPA: accept Google Cloud Italia Srl DPA addendum (Art. 28 §3)
```

Console: https://console.cloud.google.com/projectcreate → set ID `elab-tutor-prod-eu` → region `europe-west3`.

### 2. Enable Vertex AI API

```bash
gcloud config set project elab-tutor-prod-eu
gcloud services enable aiplatform.googleapis.com
gcloud services enable iam.googleapis.com
```

### 3. Create Service Account `elab-edge-functions@elab-tutor-prod-eu.iam.gserviceaccount.com`

```bash
gcloud iam service-accounts create elab-edge-functions \
  --display-name="ELAB Edge Functions Vertex caller"

gcloud projects add-iam-policy-binding elab-tutor-prod-eu \
  --member="serviceAccount:elab-edge-functions@elab-tutor-prod-eu.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

gcloud iam service-accounts keys create ~/.elab-credentials/gcp-vertex-sa.json \
  --iam-account=elab-edge-functions@elab-tutor-prod-eu.iam.gserviceaccount.com
```

Save JSON `~/.elab-credentials/gcp-vertex-sa.json` (chmod 600).

### 4. Set Supabase secrets

```bash
# Replace AI Studio key with Vertex SA JSON (base64-encoded for env safety)
cat ~/.elab-credentials/gcp-vertex-sa.json | base64 | tr -d '\n' > /tmp/sa-b64.txt
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase secrets set \
  GCP_VERTEX_SA_JSON_B64="$(cat /tmp/sa-b64.txt)" \
  GCP_VERTEX_PROJECT_ID="elab-tutor-prod-eu" \
  GCP_VERTEX_LOCATION="europe-west3" \
  ENABLE_VERTEX_EU=true \
  --project-ref euqpdueopmlllqjmqnyb

rm /tmp/sa-b64.txt  # cleanup
```

### 5. Verify

```bash
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase secrets list --project-ref euqpdueopmlllqjmqnyb | grep -E "GCP_VERTEX|ENABLE_VERTEX"
# Expected: 4 lines GCP_VERTEX_SA_JSON_B64 / GCP_VERTEX_PROJECT_ID / GCP_VERTEX_LOCATION / ENABLE_VERTEX_EU
```

---

## Orchestrator code change steps (~2-4h)

### File 1: `supabase/functions/_shared/vertex-client.ts` (NEW ~250 LOC)

Responsibilities:
1. Parse `GCP_VERTEX_SA_JSON_B64` env on cold start, cache decoded SA in memory
2. Mint OAuth 2.0 access token via `https://oauth2.googleapis.com/token` JWT-bearer flow (RS256 sign with SA private key)
3. Cache token with 5-minute pre-expiry refresh (token TTL is 1h)
4. Expose `callVertexGemini({model, systemPrompt, messages, images, ...})` matching current `callGemini` signature
5. Map model alias: `gemini-2.5-flash-lite` (default), `gemini-2.5-pro` (reasoning escalation)
6. Endpoint: `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`
7. Body schema: identical to AI Studio `generateContent` (Vertex preserves Gemini API surface)

### File 2: `supabase/functions/_shared/llm-client.ts` MODIFIED (~30 LOC)

In `callLLM`:
- IF `ENABLE_VERTEX_EU === 'true'` AND provider resolves to `gemini` → route to `callVertexGemini`
- ELSE keep legacy `callGemini` (AI Studio) for backward compat
- Add fallback chain: Vertex fail → AI Studio fail → Mistral (existing chain preserved)

### File 3: `supabase/functions/_shared/gemini.ts` UNCHANGED

Keep AI Studio path for emergency fallback. Mark deprecation comment.

### File 4: tests `tests/unit/vertex-client.test.js` NEW (~150 LOC)

- JWT sign roundtrip with mock SA key (use `crypto.subtle` Deno-compat)
- Token cache hit/miss/expiry refresh logic
- Endpoint URL builder edge cases
- Error handling: invalid SA / network fail / quota / 429

### File 5: `docs/adrs/ADR-032-vertex-eu-frankfurt-migration.md` NEW (~400 LOC)

ADR template: Context + Decision + Status + Consequences + Rollback plan.

---

## Verification post-deploy

```bash
# 1. Edge Function logs show provider=vertex
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions logs unlim-chat --project-ref euqpdueopmlllqjmqnyb | grep "provider="

# 2. Latency bench 30q via existing R5 runner
node scripts/bench/run-sprint-r5-stress.mjs

# 3. GDPR compliance check: response headers should include x-goog-region=europe-west3
curl -X POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "x-elab-api-key: ${ELAB_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"message":"Ragazzi","sessionId":"test-phase0"}' \
  -i | grep -i "x-goog-region\|server-region"
```

Expected:
- Latency p95 ≤ 3.5s (Vertex Frankfurt parity vs AI Studio)
- 0 errors in first 10 minutes post-deploy
- Header `x-goog-region: europe-west3` visible (EU-resident confirmed)

---

## Rollback plan

If Vertex deploy fails or latency regresses >20%:

```bash
# Single env flip — instant rollback to AI Studio:
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase secrets set ENABLE_VERTEX_EU=false --project-ref euqpdueopmlllqjmqnyb
# Re-deploy unlim-chat NOT required (env read at runtime).
```

Cost rollback: ~5 seconds. Risk: minimal — legacy AI Studio path preserved as deprecated fallback.

---

## Cost projection

| Scale | Vertex Flash-Lite | AI Studio Flash-Lite |
|-------|-------------------|----------------------|
| 100 sess/day | ~€3-5/mese | ~€2-4/mese |
| 1000 sess/day | ~€30-50/mese | ~€20-40/mese |
| 10000 sess/day | ~€300-500/mese | ~€200-400/mese |

Vertex ~20-25% premium for EU residency + DPA. Within Combo C target budget <€50/mese pilot through ~1000 sess/day.

---

## Dependencies graph

```
Phase 0 (this doc) GDPR Vertex EU migration
   ↓ prereq
Phase 1 ALREADY DONE iter 39 — classifier-aware routing wire-up (5 LOC)
   ↓
Phase 2 bench 60q 3-runs (1h) — validate Combo C empirical
   ↓
Phase 3 decision A vs C confirm (15 min)
   ↓
Phase 4 UNLIM Dreams overnight (6h)
   ↓
Phase 5-10 vision Pixtral Large + STT Voxtral Transcribe 2 + OpenAPI + PostHog + Anti-G45 audit (~22h)
```

**Combo C not production-scalable until Phase 0 complete.** Andrea pilot mode `<100 sess/day` acceptable interim.

---

## Sign-off checklist

- [ ] Andrea: GCP project `elab-tutor-prod-eu` created `europe-west3`
- [ ] Andrea: DPA accepted Google Cloud Italia Srl
- [ ] Andrea: Service Account `elab-edge-functions@` created + `roles/aiplatform.user`
- [ ] Andrea: SA JSON exported `~/.elab-credentials/gcp-vertex-sa.json` chmod 600
- [ ] Andrea: Supabase secrets set 4 vars (`GCP_VERTEX_SA_JSON_B64` + 3 metadata)
- [ ] Orchestrator: `vertex-client.ts` NEW shipped + 9+ unit tests PASS
- [ ] Orchestrator: `llm-client.ts` conditional Vertex routing wired
- [ ] Orchestrator: ADR-032 shipped + Andrea ratify
- [ ] Bench: R5 50q post-Vertex ≥85% quality + p95 ≤3.5s
- [ ] LIVE smoke: `x-goog-region: europe-west3` header verified
- [ ] Cleanup: AI Studio `GOOGLE_API_KEY` env REMOVED Supabase after 7-day stability window

---

## References

- ADR-029 LLM_ROUTING_WEIGHTS conservative tune (Sprint T iter 37)
- ADR-031 STT migration Voxtral Transcribe 2 (Sprint T iter 38)
- ADR-032 Vertex EU Frankfurt migration (TO BE WRITTEN this phase)
- Plan master: `docs/superpowers/plans/2026-05-12-elab-max-everything-strategy.md` Phase 0
- GDPR Art. 8 minori + Art. 28 §3 sub-processor residency
- Google Cloud DPA: https://cloud.google.com/terms/data-processing-addendum
- Vertex AI Frankfurt SLA: https://cloud.google.com/vertex-ai/docs/general/locations#europe-west3
