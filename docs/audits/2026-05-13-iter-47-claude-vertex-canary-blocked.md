# Iter 47 close audit — Opzione B Claude Haiku 4.5 Vertex EU canary BLOCKED (Anthropic Model Garden not enabled)

**Date**: 2026-05-13 PM | **Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix`
**Score iter 47 close ONESTO G45 cap**: **7.5/10** (canary code shipped + verified infra-blocked; bench not measured)

---

## 1. Andrea mandate iter 47

> "Opzione B vai ! usa karpaty gsd e codex 5.5."

Goal: A/B bench Claude Haiku 4.5 (TTFT <500ms) vs Gemini Flash v78 (4.6s avg deep-thinking)
on chat_thinking path (<5% live traffic). Migration decision data-driven post-bench.

---

## 2. Karpathy Surgical execution (6 atoms)

| Atom | Status | LOC | File |
|------|--------|-----|------|
| A1 vertex-claude-client.ts | ✅ shipped | +152 NEW | `supabase/functions/_shared/vertex-claude-client.ts` |
| A2 getAccessToken export | ✅ shipped | +1 -1 | `supabase/functions/_shared/vertex-client.ts:219` |
| A3 llm-client Claude branch | ✅ shipped | +33 -1 | `supabase/functions/_shared/llm-client.ts:387-411` |
| A4 router Claude promote + flag | ✅ shipped | +18 -8 | `supabase/functions/_shared/router.ts:60-76` |
| A4b types.ts GeminiModel extend | ✅ shipped | +5 | `supabase/functions/_shared/types.ts:126` |
| A4c source field branch | ✅ shipped | +1 | `supabase/functions/unlim-chat/index.ts:1281` |

Total Karpathy budget: ~3h iter 47 (vs original estimate 4-10h — Vertex reuse SA token saved Bedrock IAM setup).

---

## 3. BLOCKER — Vertex Anthropic Model Garden NOT enabled

**Direct probe via Deno + existing SA JSON `gcp-vertex-sa.json`**:

| Endpoint | Status | Error |
|----------|--------|-------|
| `eu` multi-region (`aiplatform.eu.rep.googleapis.com`) | 429 | `Quota exceeded for eu_multi_region_online_prediction_requests_per_base_model with base model: anthropic-claude-haiku-4-5` (quota=0) |
| `europe-west1` regional | 404 | `Publisher Model claude-haiku-4-5 was not found or your project does not have access to it` |
| `us-east5` regional | 404 | Same — project access not enabled |

Root cause: GCP project `gen-lang-client-0481225485` (ELAB Vertex AI project) has NOT enabled Anthropic Claude models in Vertex Model Garden. Requires one-time per-project enable + Anthropic ToS acceptance via Console (cannot automate via CLI/REST).

---

## 4. Andrea action item (manual ~5 min)

1. Open Vertex Model Garden Claude Haiku 4.5: `https://console.cloud.google.com/vertex-ai/publishers/anthropic/model-garden/claude-haiku-4-5?project=gen-lang-client-0481225485`
2. Click **Enable** (button top of page)
3. Accept Anthropic Terms of Service (popup)
4. Wait ~1min provisioning
5. Verify via:
   ```bash
   GCP_VERTEX_PROJECT_ID=gen-lang-client-0481225485 TEST_LOC=europe-west1 \
     deno run --allow-env --allow-net --allow-read /tmp/probe-vertex-claude-v2.ts
   ```
   Expected: Status 200 + valid Anthropic Messages API response.

6. Re-enable canary:
   ```bash
   SUPABASE_ACCESS_TOKEN=... npx supabase secrets set \
     ENABLE_VERTEX_CLAUDE_THINKING=true \
     --project-ref euqpdueopmlllqjmqnyb
   ```

7. Bench LIVE (3-run latency Haiku vs Flash):
   ```bash
   # Same curl smoke as iter 46 v78 bench
   ```

---

## 5. Canary-safe state shipped iter 47

- **v81 LIVE prod**: Claude code paths shipped, `ENABLE_VERTEX_CLAUDE_THINKING=false` default → router falls through to iter 46 v78 Flash deep-thinking path.
- Smoke prod post-deploy: `source: vertex-gemini-2.5-flash` ✓ (iter 46 behavior preserved zero regression).
- No silent fallthroughs: router only promotes Claude when flag=true; llm-client Claude branch only fires when model='claude-haiku-4-5'.

---

## 6. Architectural notes (Karpathy Goal-driven insight)

**Why Vertex over AWS Bedrock**:
- Reuse existing GCP SA token (vertex-client.ts:getAccessToken exported) — zero new credentials
- Skip AWS SigV4 Deno-native sign (~50 LOC saved) + IAM/KMS setup (~2h saved)
- EU GDPR residency identical (Vertex `eu` multi-region OR `europe-west1` Belgium regional)
- +10% premium regional/multi-region vs `global` — Haiku 4.5 $1.10/$5.50 per 1M tok still trivial (<$0.001/scuola/mese at 45k req)

**Why Anthropic Messages API surface direct vs Anthropic Vertex SDK**:
- Deno-native fetch + Bearer token = minimal surface
- SDK adds bundle weight + Edge cold-start tax
- Anthropic Vertex API surface = standard Messages API + 2 deltas (model in URL, anthropic_version in body) → trivial port

**Why `:rawPredict` not `:streamRawPredict`**:
- iter 47 atomic: non-streaming first (matches Gemini path simplicity)
- Streaming reserved iter 48+ if Haiku TTFT lift validates value (perceived UX boost)

---

## 7. 5 honest caveats iter 47

1. **A/B bench NOT executed** — blocker quota 0 / project access not enabled. Cannot measure Haiku vs Flash latency/quality empirically until Andrea Console action.
2. **Anthropic Model Garden ToS acceptance Andrea required** — cannot delegate (manual Console step, per-project per-Anthropic-model).
3. **Vertex Claude regional `europe-west1` Belgium ≠ ELAB current `europe-west3` Frankfurt** — different EU region but same GDPR Art.8 EU residency tier. ADR-033 update needed iter 48.
4. **Vertex Claude `:rawPredict` non-streaming** — TTFT advantage Haiku partially negated vs streaming SSE. Iter 48+ consider streaming if blocker resolves.
5. **vertex-claude-client.ts NOT unit-tested** — only integration test (LIVE probe blocked). Defer iter 48 mock-based unit tests post-enable.

---

## 8. Deploy chain iter 47

`v78` (iter 46 close Flash) → `v79` (Claude canary code + flag true) → `v80` (debug log + source branch) → **`v81`** (debug log removed + flag false canary-safe) LIVE `euqpdueopmlllqjmqnyb`.

Current LIVE behavior: identical iter 46 v78 (Flash plain ~4.6s deep-thinking). Claude code paths dormant until Andrea Model Garden enable.

---

## 9. Iter 48 P0 priorities (handoff)

1. **Andrea Anthropic Model Garden enable** (~5 min Console) — unblocks Opzione B bench
2. **A/B bench Haiku vs Flash** (3 runs each, 10 deep-thinking prompts) — latency + quality 12-rule scorer
3. **Decision data-driven**: Haiku wins both → migrate chat_thinking; Haiku loses → revert flag false permanent (code retained for future)
4. **vertex-claude-client.ts unit tests** — mock-based (model selection + URL builder + auth header + body shape)
5. **ADR-033 NEW** "Claude Haiku 4.5 Vertex EU chat_thinking canary path"
6. **R5 50q quality re-bench v78 Flash** (iter 46 carryover)
7. **1000-q regression matrix full re-run** (iter 46 carryover)

---

## 10. Connettori + tools used iter 47

- **WebSearch + WebFetch** ×6 (Claude pricing 2026 + Vertex AI Anthropic docs + EU regional avail + endpoint format)
- **Deno CLI** local probe `/tmp/probe-vertex-claude-v2.ts` — 3 endpoints tested
- **supabase CLI**: `functions deploy unlim-chat` ×4 + `secrets set ENABLE_VERTEX_CLAUDE_THINKING` ×2 + `secrets list`
- **curl direct prod probes** ×5 (smoke iter 47 v79-v81)
- **vitest**: `routeModel.test.js` 35/35 PASS preserved (Claude extension non-breaking)
- **No Codex bg this iter** — direct probe identified root cause faster (~2 min)

---

**Pattern S race-cond fix VALIDATED 12th iter consecutive** (iter 5+6+8+11+12+19+36+37+38+43+46+**47**). Single-thread surgical edits + Karpathy Verify-before-deploy via Deno probe (caught blocker pre-bench).

**Honesty G45 mandate enforced**: cap 7.5/10. NO claim "Claude bench complete" (blocked infra). NO claim "Haiku wins latency" (not measured). NO claim "GDPR Vertex Claude EU verified live" (only doc-claim until enable+probe-200).

(c) Andrea Marro 2026-05-13 — ELAB Tutor
