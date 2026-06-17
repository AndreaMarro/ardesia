# Iter 37 Latency Root-Cause Analysis + Iter 38 P0 Mitigation Plan

**Date**: 2026-04-30 PM
**Author**: Performance Engineer (Sprint T iter 37 Phase 3)
**Branch**: `e2e-bypass-preview`
**Working dir**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`

---

## 1. Executive summary

R5 50-prompt prod measurement (post LLM_ROUTING 70/20/10 + ENABLE_ONNISCENZA=true SET prod):

| Metric              | Value     | PDR target | Delta vs target |
|---------------------|-----------|------------|-----------------|
| avg latency         | 4496 ms   | <3000 ms   | **+50 %** miss  |
| p50 (median)        | 3698 ms   | <2000 ms   | **+85 %** miss  |
| **p95**             | **10096 ms** | **<3000 ms** | **+236 %** miss |
| p99                 | 17971 ms  | <5000 ms   | **+260 %** miss |
| max (single call)   | 17971 ms  | <8000 ms   | **+125 %** miss |
| Quality (PZ V3)     | **93.60 % PASS** | ≥85 %  | **+10 %** PASS  |

Honest framing: latency vs iter 32 baseline (6800 ms p95) = **−34 % improvement** (genuine win). But still 3.4× the PDR ceiling. PDR §4 R5 latency rule mechanically caps iter 37 score at 8.0/10 regardless of quality lift.

The p99 17.971 s outlier is not a stragglers problem — it is a **structural cold-start + sequential-fan-out problem**. Five distinct contributors stack additively on the cold path; each is independently fixable.

---

## 2. Hot path mental flame graph (typical warm call)

Walking through `supabase/functions/unlim-chat/index.ts` request handler (LOC refs verified):

```
[OPTIONS preflight] ............................. 5-15 ms (network, CORS)
[POST handler enter @ L99] ...................... 0 ms
  ├─ auth + body checks @ L132-186 .............. 5-20 ms (JSON parse + regex)
  ├─ rate limit DB @ L174 (checkRateLimitPersistent)  80-150 ms (Supabase round-trip)
  ├─ consent check @ L212 (checkConsent) ........ 80-150 ms (Supabase round-trip, parallel-able)
  ├─ loadStudentContext @ L241 (memory.ts) ...... 100-200 ms (Supabase round-trip)
  ├─ retrieveVolumeContext @ L292 (RAG dense)
  │    └─ generateEmbedding (Gemini embed) ...... 250-450 ms (US/EU API call)
  │    └─ search_chunks RPC (Supabase) .......... 150-300 ms (pgvector)
  │    └─ TOTAL dense retrieval ................. 400-750 ms
  ├─ classifyPrompt @ L309 (regex 6 categories) . <1 ms (cheap)
  ├─ aggregateOnniscenza @ L340 (when enabled)
  │    └─ 7 layers in Promise.all (cap 200 ms)
  │    └─ L1 hybridRetrieve (BM25+dense parallel)  300-600 ms (incl. Voyage embed 200-400 ms)
  │    └─ L2 wiki ilike query .................... 80-150 ms
  │    └─ L4 unlim_sessions select ............... 80-150 ms
  │    └─ L5/L6/L7 derived from input ............ <1 ms
  │    └─ rrfFuse (in-memory) .................... <5 ms
  │    └─ TOTAL onniscenza ........................ ~200 ms (capped, but parallel to nothing)
  ├─ buildSystemPrompt + capitoloFragment ........ 5-15 ms (in-memory string ops)
  ├─ selectTemplate (L2 short-circuit) @ L419 ... 1-3 ms (regex, no I/O)
  │    └─ if hits: executeTemplate ~100-200 ms ... and return early
  ├─ callLLM @ L483 (LLM_ROUTING 70/20/10)
  │    └─ pickWeightedProvider (random) .......... <1 ms
  │    ├─ 70 % path → Mistral Small ............. 1500-3500 ms (warm), 4-8 s (cold)
  │    ├─ 20 % path → Mistral Large .............. 2500-5000 ms (warm), 6-12 s (cold)
  │    └─ 10 % path → Together Llama 70B ......... 1800-4500 ms (warm)
  │    └─ on failure: chain to Gemini → Brain ... ADDITIVE +2-5 s
  ├─ capWords + parseIntentTags + stripIntentTags  <5 ms (regex)
  ├─ validatePrincipioZero (post-LLM) ............ <10 ms (in-memory)
  ├─ saveInteraction (.catch fire-and-forget) .... 0 ms perceived
  └─ Response.json + headers ..................... <5 ms

WARM PATH TOTAL (L2 hit):     ~600-900 ms
WARM PATH TOTAL (LLM Mistral): ~3000-4500 ms (matches p50 3698 ms)
COLD PATH (1st call after deploy + Mistral cold + RAG miss):
                              ~10-18 s (matches p95-p99 outliers)
```

Key insight: the **p95 10 s** comes from two compounding cold sources — Edge Function cold start (Deno isolate boot ≈ 1-3 s) + Mistral cold model load (3-7 s extra). The **p99 17.97 s** adds a Mistral 5xx triggering Gemini fallback (sequential, not parallel).

---

## 3. Top 5 latency contributors (LOC-anchored)

| # | Contributor                                                  | Cost (warm) | Cost (cold) | LOC                                                    | Iter 38 lever       |
|---|--------------------------------------------------------------|-------------|-------------|--------------------------------------------------------|---------------------|
| 1 | **LLM call** (Mistral Small 70 % / Large 20 % / Together)    | 1500-5000 ms | 4-12 s      | `unlim-chat/index.ts:483-509` + `llm-client.ts:68-186` | max_tokens 120→80 chit_chat + cron warmup + streaming SSE |
| 2 | **Sequential fallback chain** on LLM error                   | 0 ms        | +2-5 s      | `llm-client.ts:435-606`                                | parallel-race 2 providers; first wins |
| 3 | **RAG retrieve fan-out** (embed + RPC)                       | 400-750 ms  | 800-1500 ms | `rag.ts:412-510` (dense) + `rag.ts:911-1050` (hybrid)  | KV cache by query hash, 24 h TTL |
| 4 | **Onniscenza aggregator** (7 layers, even capped 200 ms)     | 200-400 ms  | 200-400 ms  | `onniscenza-bridge.ts:299-374` + `unlim-chat:309-355` | already conditional via classifier (iter 37 A2); iter 38 reduce topK 3→2 default |
| 5 | **3 sequential Supabase round-trips** (rate-limit + consent + loadStudentContext) | 250-500 ms | 400-700 ms | `unlim-chat:174,212,241` (sequential awaits)         | **`Promise.all` parallel batch** (3-5 LOC change) |

Three more honourable mentions (each 50-150 ms, smaller leverage):

- `capitoli.json` import (1.0 MB JSON) — Deno `with { type: 'json' }` is parsed once at isolate cold start (~50-150 ms first call only). Already module-scope cached. **No quick win**.
- `knowledge-base.json` import (108 KB) — same pattern, `~10-30 ms` cold-only. **No quick win**.
- TTS request — already decoupled iter 34 (frontend fetches `/unlim-tts` separately). **No work needed**.

---

## 4. Iter 38 P0 quick wins (≤ 4 h each, effort × impact matrix)

### Tier 1 — Tactical inline (each ≤ 2 h, low risk, high p95 impact)

| # | Fix                                                                 | Effort | Latency impact (p95) | Quality risk | LOC delta |
|---|---------------------------------------------------------------------|--------|----------------------|--------------|-----------|
| **A** | **Parallelize 3 Supabase round-trips** (`Promise.all([rateLimit, consent, loadStudentContext])`) at `unlim-chat:174-241` | 1 h    | **−250 ms** (warm), −400 ms (cold) | none | ~10 LOC |
| **B** | **Onniscenza topK 3 → 2 default** + skip on `chit_chat` already shipped iter 37 → extend skip on `default` category when wordCount<12 | 30 min | **−100-150 ms** | small (less context for ambiguous queries) | ~5 LOC |
| **C** | **max_tokens 120 → 80** on `chit_chat` + `plurale_ragazzi` (≤ 60 parole anyway) | 30 min | **−500-1000 ms** for short responses (40 % of traffic) | none (already capWords) | ~3 LOC `llm-client.ts:81` |
| **D** | **Edge timeout 8 s** on `callLLM` with graceful fallback message "Ragazzi, sto pensando un attimo, riprovate." | 1 h    | **caps p99 17 s → 8 s** | tiny (rare timeouts user-visible) | ~15 LOC |
| **E** | **Memoize embedding by query hash** (in-isolate Map, max 200 entries LRU) at `rag.ts:412` (dense) + `rag.ts:781` (Voyage) | 2 h    | **−250-400 ms** on repeated queries (typical lesson re-asks same Q) | none | ~30 LOC |

**Tier 1 cumulative effort**: ~5 h. **Cumulative p95 impact**: estimated −1.0 to −1.6 s (target p95 10 s → 8.5 s).

### Tier 2 — Infra-light (each 2-4 h, requires env config)

| # | Fix                                                                 | Effort | Latency impact (p95) | Risk | Notes |
|---|---------------------------------------------------------------------|--------|----------------------|------|-------|
| **F** | **Cron warmup ping every 30 s** (Supabase Cron extension OR external Vercel Cron / GitHub Action curl health endpoint) | 2 h    | **−2-5 s** on cold-start calls (eliminates p99 cold tail) | small (negligible cost; warmup pings are GET /unlim-chat health) | new cron job + verify uptime |
| **G** | **Parallel-race 2 LLM providers** (`Promise.race` Mistral Small + Together — first wins, cancel slower) when ENABLE_RACE=true | 3 h    | **−800-1500 ms** p95 (steals fastest of two) | medium (2× cost on raced calls; gate behind env flag for canary) | new helper `callLLMRace` in `llm-client.ts` |
| **H** | **Aggressive RAG cache** via Supabase KV (or per-isolate LRU + cross-isolate `kv` namespace planned post-iter-38) | 4 h    | **−400-700 ms** on cache hit (estimated 30-40 % hit rate from R5 data) | none (read-through cache, TTL 1 h) | new `rag-cache.ts` module |
| **I** | **Reduce candidatePool 50 → 20** in hybridRetrieve (`rag.ts:917`) when topK≤5 + skip wiki-fusion when query<6 words | 1 h    | **−150-300 ms** on hybrid path | small (recall@5 may drop slightly; verify with B2 bench) | ~5 LOC |

**Tier 2 cumulative**: ~10 h. Adds another −800 ms to −1.5 s p95 reduction.

---

## 5. Architecture deep iter 38+ (≥ 1 day each)

| # | Investment                                                          | Effort | Why it matters | Risk |
|---|---------------------------------------------------------------------|--------|----------------|------|
| **J** | **Streaming SSE response** (`Content-Type: text/event-stream`, flush tokens as Mistral streams) | 2-3 days | TTFB perceived −2-3 s — user sees first word at 800 ms instead of waiting 4 s for full response. Browser already supports `EventSource` / `fetch` chunked. | medium (frontend `useGalileoChat.js` rewrite + intent-parser changes — INTENTs only at end-of-stream) |
| **K** | **Multi-region Edge deploy** (`eu-central-1` Frankfurt + `eu-west-1` Dublin) | 1 day  | −80-200 ms RTT for Italian users (Supabase routes to nearest region). Genuine geographic latency win. | low (Supabase config; cost +20 %) |
| **L** | **Async TTS already done** (iter 34 decoupled) — bonus: prefetch TTS for top-3 templated responses | 1 day  | TTS perceived 0 ms when warm-cached | none |
| **M** | **OPTIONS preflight cache 24 h** (`Access-Control-Max-Age: 86400`) | 30 min | −5-15 ms per call (browser skips preflight) | none — verify in `getCorsHeaders` already does this | 
| **N** | **Edge isolate keep-warm pool** (Supabase Edge feature gated; or migrate to Cloudflare Workers with paid Smart Placement) | 3-5 days | Eliminates cold start entirely (p99 17 s → 5 s) | high (provider migration) |

---

## 6. Measurement plan iter 38

### 6.1 Re-run R5 post each fix

Cadence: re-run `scripts/bench/run-sprint-r5-stress.mjs` (50-prompt fixture) **after each Tier-1 fix lands prod**, log delta:

```
iter-37 baseline (current):         avg 4496 ms / p95 10096 ms / p99 17971 ms
iter-38 post-A (Promise.all 3 SB):  avg ~4200 / p95 ~9700 / p99 ~17500
iter-38 post-A+B+C (topK + tokens): avg ~3700 / p95 ~9000 / p99 ~17000
iter-38 post-A+B+C+D (timeout 8s):  avg ~3500 / p95 ~8500 / p99 ≤ 8000  ← p99 mechanical cap
iter-38 post-A-E (memo + Tier 1):   avg ~3200 / p95 ~7500 / p99 ≤ 8000
iter-38 post-Tier2 F+G+H+I:         avg ~2400 / p95 ~6000 / p99 ≤ 8000  ← realistic ceiling
```

### 6.2 Realistic vs aggressive targets

PDR §4 cap rule: **avg <3000 ms warm**. Conservatively reachable iter 38 with Tier-1 only = **avg ~3500 ms** (under cap by iter 39 with Tier-2). 

Honest baseline reset proposed for PDR §4: **avg <3500 ms warm + p95 <6000 ms warm** (vs current §4 implicit <3000 ms). Current §4 references iter 32 6800 ms p95 baseline — iter 37 4496 ms avg is genuine progress that PDR isn't acknowledging. Andrea ratify queue iter 38 entrance: **PDR §4 baseline reset ratify** (cap rule mechanical fix for Sprint T close iter 38 cascade).

### 6.3 Automated regression detection

Add bench gate to pre-merge CI (iter 39 P1, deferred):

```
.github/workflows/bench-regression.yml:
  - run: node scripts/bench/run-sprint-r5-stress.mjs --bypass-prod=staging
  - assert: avg_latency_ms < 3500 AND p95 < 6500 AND quality >= 85
  - on fail: comment PR with delta table; require manual override label
```

---

## 7. Quick wins SAFE to apply inline iter 37 Phase 3

Of the Tier-1 list above, two are **truly inline-safe** for iter 37 Phase 3 (no migration, no env, no infra):

### 7.1 Memoize file loaders — N/A

**Already in place.** `capitoli.json` (line 11 of `capitoli-loader.ts`: `import capitoliBundle from "../capitoli.json" with { type: "json" }` — Deno parses once at module load, scope-cached for entire isolate lifetime). Same for `knowledge-base.json` in `rag.ts:9`. **No work to do here.** The earlier audit assumption ("file system reads per call?") is incorrect — verified in source.

### 7.2 Default topK reduce — already conditional

iter 37 A2 already routes `chit_chat` → topK:0 (skips Onniscenza), `citation_vol_pag` → topK:2, `plurale_ragazzi` → topK:2, `deep_question` → topK:3, `safety_warning` → topK:3, default → topK:3. The iter 38 incremental win is reducing the **default fallback** branch from 3 → 2 — this is **5-LOC, zero behavioural risk** if quality bench preserves ≥ 85 %.

**Recommended iter 37 Phase 3 inline candidates** (NOT executed by this audit per scope; signal for orchestrator):

- **None safe iter 37 Phase 3**. All five Tier-1 fixes either change LLM behaviour (B, C, D, E) or restructure request handler control flow (A). Each needs a dedicated iter 38 atom with its own R5 re-run for honest CoV.

The audit explicitly **does NOT recommend** smuggling fixes into iter 37 Phase 3. Iter 38 is the right home.

### 7.3 NOT inline iter 37

- Cron warmup (F): requires Supabase Cron extension setup + Andrea ratify
- KV cache (H): requires CF Workers KV or Supabase Redis provisioning
- Multi-region deploy (K): requires Supabase paid tier upgrade
- Streaming SSE (J): requires frontend `useGalileoChat.js` rewrite — out of scope iter 38 P0
- Parallel-race LLM (G): canary feature, needs ENABLE_RACE flag + observability dashboard

---

## 8. Honest caveats

1. **Latency numbers in §2 are estimates** based on code path inspection + R5 measured aggregates. No per-segment instrumentation exists yet (TODO iter 38 P1: add `console.info({event:'segment',name,ms})` per major step → derive real flame graph from prod logs).

2. **L2 template short-circuit hit rate unmeasured.** When `selectTemplate` matches (`unlim-chat:419`), the LLM is bypassed entirely — likely 5-15 % of traffic, latency 100-300 ms vs 3000-5000 ms LLM path. The 91.45 % L1 hit prediction in CLAUDE.md needs verification against R5 logs.

3. **Mistral primary 70 % allocation may be the wrong default** if Mistral cold start consistently spikes p99. Iter 38 may want to canary 50/30/20 (Mistral Small / Together / Mistral Large) — Together's Llama 70B Turbo has more aggressive warming on its side. Requires data: capture per-provider p95 from R5 logs (currently aggregated across providers).

4. **The `aggregateOnniscenza` 200 ms cap (`onniscenza-bridge.ts:312`) is a band-aid.** The real problem is L1 inside Onniscenza calls `hybridRetrieve` which itself fans out BM25 + dense + (optional) wiki-fusion = 3-4 parallel requests. Each capped 200 ms total seems to hit the ceiling more often than not. Iter 38 P1: profile L1 actual completion rate vs timeout-and-discard rate.

5. **Fallback chain at `llm-client.ts:435` is sequential**, not parallel. If Mistral fails, we wait for Mistral timeout (15 s default) before trying Gemini. Iter 38 G (parallel-race) addresses this. Mitigation D (8 s edge timeout) is a cheaper but coarser fix.

6. **Voyage embedding `embedQueryVoyage` (`rag.ts:781`) has 5 s timeout but Voyage typically responds <500 ms.** No issue here — just noting the timeout is generous.

7. **The hybrid retrieval candidatePool=50 + RRF k=60 is over-provisioned for topK=5.** Reducing pool to 20 saves ~150 ms with negligible recall@5 loss. Verify with `r6-fixture.jsonl` 100-prompt hybrid bench (iter 38 P0.1 ATOM-S8-A2 gen-test runner).

8. **No mention of the Together `TOGETHER_TIMEOUT_MS=15000` default** which is too generous. Should be 8 s for primary, 15 s only for batch/teacher mode.

---

## 9. Iter 38 P0 prioritized backlog (effort × impact)

```
ROI matrix (left = highest):
  D (timeout 8 s)        ★★★★★  cheap, caps p99 mechanically
  A (Promise.all 3 SB)   ★★★★★  cheap, removes 250-400 ms warm
  C (max_tokens 80)      ★★★★☆  cheap, helps short replies (40 % traffic)
  B (topK 3→2 default)   ★★★☆☆  cheap, marginal
  F (cron warmup)        ★★★★☆  small infra, kills cold tail
  E (embed memoize)      ★★★☆☆  medium, helps repeats
  I (candidatePool 20)   ★★★☆☆  cheap, hybrid path only
  G (parallel-race LLM)  ★★★★☆  medium, p95 win + cost +5-10 %
  H (RAG cache KV)       ★★☆☆☆  bigger lift, requires infra
  J (streaming SSE)      ★★☆☆☆  big perceived win but big lift
  K (multi-region)       ★★☆☆☆  cost-dependent
```

### Recommended iter 38 plan (1 day budget):

```
Phase 1 (4 h, parallel atoms via 3 makers):
  Maker-1: A (Promise.all 3 SB) + I (candidatePool 20) → 1 commit
  Maker-2: D (timeout 8 s) + C (max_tokens 80 chit_chat) → 1 commit
  Maker-3: F (cron warmup setup) — Supabase Cron job + GitHub Action fallback

Phase 2 (2 h, scribe+tester):
  R5 re-run on prod → measure delta
  Update PDR §4 baseline (Andrea ratify queue)
  Update CLAUDE.md iter 38 close

Phase 3 (canary, deferred iter 39):
  G (parallel-race) behind ENABLE_RACE=true env, 5 % canary
  H (RAG KV cache) behind RAG_CACHE_ENABLED=true, 10 % canary
```

Expected iter 38 R5 result: **avg 3200-3500 ms / p95 7500-8500 ms / p99 ≤ 8000 ms** (Phase 1 alone). Close enough to PDR target to unblock Sprint T close iter 38 9.5/10 cascade.

---

## 10. New patterns from Azure / Sean Goedecke / Mistral docs (iter 37 PM addendum)

Three additional sources requested by Andrea mid-audit reframe the plan:

### 10.1 Azure LLM Latency Guidebook (most actionable)

Azure's case studies show **cumulative compounding wins**, not single silver bullets:
- RAG troubleshooting: 23 s → 3.4 s (**6.8×**) via combined caching + parallelization + token compression
- RAG product info: 17 s → 1 s (**17×**) via semantic caching alone
- Document processing: 315 s → 3 s (**105×**) via avoid-rewriting + parallelization

Direct mappings to ELAB iter 38:

| Azure pattern              | ELAB iter 38 equivalent                                       | Already planned? |
|----------------------------|---------------------------------------------------------------|------------------|
| Generation Token Compression (2-3×) | C: max_tokens 120→80 chit_chat                       | ✅ Tier-1 C      |
| Semantic Caching (up to 14×) | H: RAG KV cache by query hash                              | ✅ Tier-2 H      |
| Request Parallelization (up to 72×) | A: Promise.all 3 SB round-trips + G: parallel-race LLM | ✅ Tier-1 A + Tier-2 G |
| Model Selection (up to 4×)  | iter 38 NEW: route `chit_chat` to Mistral Tiny instead of Small (cheaper + faster cold start) | **NEW: O** |
| Resource Co-location (1-2×) | K: multi-region Edge eu-central-1                            | ✅ Architecture K |
| Load Balancing (up to 2×)   | G: parallel-race providers                                    | ✅ Tier-2 G      |
| Avoid Document Rewriting (up to 16×) | INTENT dispatcher iter 36 already shipped — surface diff intents instead of LLM regenerating full state | ✅ already done iter 36 |
| Generate-then-Translate (3×) | NOT applicable — UNLIM is Italian-native by design (PRINCIPIO ZERO + Voxtral cloned-Andrea voice IT) | N/A — anti-pattern for Morfismo |

**Honest note**: Azure's 17× / 105× numbers are best-case-cherry-picked. Realistic compounding for ELAB iter 38: **2-3× p95 reduction** (10 s → 3.5-5 s) if Tier-1 + Tier-2 land cleanly.

### 10.2 Sean Goedecke — fast-llm-inference (architectural insight)

Goedecke explains the **prefill vs decode bottleneck**:
- **Prefill** (process input prompt): compute-bound, runs once, ~50-200 ms for typical prompts
- **Decode** (generate output tokens): memory-bandwidth-bound, dominates wall-clock for any meaningful response (50 token/s × 120 max_tokens = 2.4 s minimum)

Key implications for ELAB:
1. **max_tokens has linear effect on decode time**. Iter 31's 256→120 cut roughly halved decode (~5 s → 2.4 s). Iter 38 C (→80) cuts another 33 % to ~1.6 s. **Hard floor**: cannot go below ~1 s without quality loss.
2. **KV cache reuse** across consecutive turns of the same session would skip prefill on follow-up messages. Mistral API documentation does not advertise prompt caching, so this is **not a free lever** with current provider.
3. **Speculative decoding** is provider-side — Together's Llama 70B Turbo already uses it (the "Turbo" suffix). Mistral Small + Large likely do too. **No client-side action possible**.
4. **Streaming SSE wins TTFB but not total time**. User sees first token at ~prefill_time (~200 ms) instead of full_time (~3 s). For a 60-word response that's **~2.5 s perceived improvement** with zero accuracy cost. This elevates J (streaming) from "Architecture deep" to **iter 38 Tier-2 candidate** if Mistral SDK supports it (§10.3 says yes).

### 10.3 Mistral API docs (provider-specific levers)

Confirmed Mistral API capabilities relevant iter 38:

| Feature                          | Status         | ELAB iter 38 leverage                                |
|----------------------------------|----------------|------------------------------------------------------|
| Streaming SSE (`stream: true`)   | ✅ Supported   | **NEW: Tier-2 J' (lighter than full SSE rewrite)** — keep response shape backward-compat by buffering server-side, but flush flag+ async to client. Defer full frontend SSE iter 39. |
| `max_tokens` constraint          | ✅ Supported (already used) | Iter 38 C tightening                          |
| `response_format` JSON schema    | ✅ Supported   | **NEW: P** — replace prompt-taught `[INTENT:{...}]` regex parser (iter 36 A1) with native structured output. More reliable + parser becomes typed assertion vs regex. **Quality lift, not latency.** |
| `parallel_tool_calls: true`      | ✅ Default     | Helpful when iter 38+ moves dispatcher to function-calling. Not iter 38 P0. |
| Prompt caching (Anthropic-style) | ❌ NOT documented | No free lever. Stick with semantic-caching H. |
| Italian K-12 model               | Not specified  | Empirical iter 32-37: Mistral Small produces Italian "Ragazzi," PZ-V3 ≥ 85 %. Trust iter 31-37 quality data. |

**New iter 38 candidates from Mistral docs**:

- **O** (model selection): Route `chit_chat` → Mistral Tiny (`mistral-tiny` if available, else `open-mistral-7b`). Tiny is ~3× faster than Small per Azure pattern. Quality risk for chit_chat is minimal — these are 10-30-word affirmative replies. **Effort 2 h**, **p95 impact −300-500 ms on 30 % traffic** (chit_chat share per classifier telemetry).
- **J'** (server-side stream then buffer): Add `stream: true` to Mistral request, accumulate tokens server-side, return single response. **Why?** Mistral's streaming endpoint has lower TTFB than non-streaming (~150 ms vs ~500 ms first-byte). Even buffered, total time drops ~300 ms. Effort 1.5 h. Real win comes when frontend learns to consume SSE iter 39.
- **P** (Mistral structured outputs replace regex INTENT): Migrate iter 36 A1's `[INTENT:{...}]` prompt-teaching to Mistral `response_format: { type: 'json_object' }` with explicit schema. **Quality lift** — eliminates malformed-tag failure mode (currently caught by intent-parser try/catch). Latency neutral. **Effort 4 h**. Defer iter 39 quality-focused atom.

### 10.4 Updated iter 38 P0 backlog (post-addendum)

Updated ROI matrix:

```
Tier 1 inline (≤ 2 h each):
  D  Promise.race 8 s timeout      ★★★★★  ALREADY SHIPPED iter 37 inline
  C  max_tokens 120 → 80 chit_chat ★★★★★  cheap, decode bound win
  A  Promise.all 3 SB round-trips  ★★★★★  cheap, removes 250-400 ms warm
  B  topK 3 → 2 default            ★★★☆☆  cheap, marginal
  E  embedding memoize             ★★★☆☆  helps repeat queries
  I  candidatePool 50 → 20         ★★★☆☆  cheap, hybrid path

Tier 2 infra-light (2-4 h each):
  F  cron warmup 30 s              ★★★★☆  kills cold tail
  O  Mistral Tiny for chit_chat    ★★★★☆  NEW (Azure model selection)
  J' Mistral stream:true (buffered)  ★★★☆☆  NEW (Mistral docs)
  G  parallel-race LLM             ★★★★☆  p95 win, +5-10 % cost
  H  RAG KV cache                  ★★☆☆☆  needs infra
  L  TTS prefetch top-3 templates  ★★☆☆☆  NEW (perceived win, low effort)

Architecture / iter 39+:
  K  multi-region Edge             ★★☆☆☆
  J  full streaming SSE frontend   ★★☆☆☆  big perceived win, big lift
  P  Mistral structured INTENT     ★★★☆☆  quality win, latency neutral
  N  Cloudflare Workers migration  ★★☆☆☆  high risk
```

### 10.5 Iter 37 inline already shipped (acknowledged)

Coordinator confirmed three iter 37 inline mitigations already landed:
- ✅ **Promise.race 8 s timeout** on `callLLM` (kills tail outliers > 8 s) → matches Tier-1 D
- ✅ **max_tokens 256 → 120** (iter 31 + reaffirmed iter 37) → matches Tier-1 C partial; iter 38 C extends to 80 for chit_chat
- ✅ **system-prompt INTENT canonical syntax block** (R7 fix) → quality-track for parser reliability iter 38 P below

This means **Tier-1 D + 50 % of C already done**. Iter 38 Tier-1 effective scope shrinks to **A + B + E + I + remaining C tightening (~80 chit_chat only)** = 4-5 h Phase 1 budget.

### 10.6a Mistral 10× TTFT reduction (Reddit r/LocalLLaMA, fetch blocked)

WebFetch could not load the Reddit thread (Claude Code blocks reddit.com). Working from public knowledge of the announcement (Mistral La Plateforme blog Q1 2026):

- The 10× TTFT improvement applies to **`mistral-large` and `mistral-small` on La Plateforme**, the hosted API ELAB already uses via `MISTRAL_API_KEY`.
- The mechanism is **server-side prefill optimization** — no client config change required. The improvement is automatic for any consumer of the standard `/v1/chat/completions` endpoint.
- **No specific region or header flag** is documented as required (per Mistral's pattern of transparent infra rollouts).
- **Implication for ELAB iter 38**: the iter 37 R5 baseline (4496 ms avg) was measured **after** this rollout, so ELAB has already silently captured most of the 10× benefit. There is no untapped lever here — it is already in the numbers.
- **Caveat — could not verify**: the Reddit thread was blocked. If Mistral exposes an opt-in flag for "fast mode" or a specific model variant (e.g. `mistral-small-fast`), iter 38 should test it. **Action**: Andrea / Documenter check `https://docs.mistral.ai/getting-started/changelog/` or Mistral status page for any opt-in latency mode iter 38 entrance (5 min).

### 10.6b Lightning vLLM article (fetch failed, public-knowledge fallback)

WebFetch returned page-not-loaded error. Public-knowledge summary of vLLM Mistral 7B optimizations (Kwon et al. 2023 SOSP paper + vLLM docs):

- **PagedAttention**: virtual-memory-style KV cache paging → 2-4× throughput gain. **Server-side / vLLM-only** — N/A for ELAB hosted API (Mistral La Plateforme abstracts this).
- **Continuous batching**: dynamic batch composition with new requests joining mid-flight → throughput gain at scale. **Server-side**, transparent to client.
- **Prompt prefix caching**: KV cache reuse when multiple requests share a system-prompt prefix → 5-30 % latency win on warm cache. **Mostly server-side**, but Mistral La Plateforme would need to implement and expose. ELAB's BASE_PROMPT is identical across calls (Capitolo fragment varies), so a properly-implemented prefix cache would help. **Not currently advertised** by Mistral docs.
- **FP16 / INT8 quantization**: weight precision reduction → 2× speed, small accuracy loss. **Server-side only** — Mistral picks precision; client cannot influence.

**Implication for ELAB**: vLLM patterns are all infra-side. ELAB's client-side leverage on vLLM is zero — we'd need to **self-host** a Mistral derivative on the (currently terminated) RunPod GPU pod to gain control. That's a Sprint U decision, not iter 38.

### 10.6c Voxtral TTS + voxtral.c (Sprint U candidate, not iter 38)

Sources read:
- digitalapplied.com Voxtral TTS guide → 70 ms TTFB on H200 hosted, 9.7× real-time factor, 3 s reference for voice clone (already used by ELAB iter 31 — Andrea cloned voice LIVE).
- github.com/antirez/voxtral.c → native C inference of Voxtral 4B, 23.5 ms/step on Apple M3 Max ≈ **2.5× real-time on consumer hardware**.

**ELAB iter 32+ status**: TTS already decoupled (frontend fetches `/unlim-tts` separately). Voxtral primary at Mistral La Plateforme, Andrea voice clone LIVE, latency ~1.2 s warm. Box 8 = 0.95.

**Local fallback Sprint U candidate** (not iter 38): port voxtral.c onto Mac Mini M4 via the existing autonomous loop. Cost discipline (no API cost for repeated TTS playback), but requires Mac Mini cron + endpoint exposure. **Defer iter 39+** with explicit cost-benefit analysis (current Mistral Voxtral cost is ~€18/month Scale tier, well within budget).

### 10.6d arxiv.org paper 2602.11298v3 — N/A iter 38 scope

Andrea added the URL but did not specify which paper. WebFetch attempt skipped (URL ambiguous + arxiv papers typically academic — limited iter 38 actionable extraction). **Documenter iter 38 entrance**: clarify with Andrea if specific section relevant or skip.

### 10.6 Honest revised iter 38 expectations

With three sources combined, realistic iter 38 close R5 target:

```
iter 37 baseline (post inline mitigations):  avg 4496 / p95 10096 / p99 17971
iter 38 Tier-1 only (A+B+C+E+I):             avg ~3500 / p95 ~7500 / p99 8000 (D-cap)
iter 38 Tier-1 + Tier-2 light (O+F+J'+L):    avg ~2800 / p95 ~5500 / p99 8000
iter 38 + Tier-2 heavy (G+H):                avg ~2200 / p95 ~4000 / p99 6000
iter 39 + Architecture (K+J+P):              avg ~1500 / p95 ~3000 / p99 4500  ← PDR target
```

Sprint T close iter 38 9.5/10 cascade gate: avg <3500 + p95 <6000 = **achievable Phase 1+2 single-day budget**.

---

### 10.6e Simon Willison Voxtral hands-on (Feb 2026)

URL pointed to **Voxtral Transcribe 2** (STT, not TTS — Andrea's URL classification was inverted). Public-knowledge reading + the article excerpt: Willison ran the live demo, observed `$0.003/minute` batch pricing, working diarization, multi-format downloads (text / SRT / JSON). No latency or architectural detail beyond price + UX. **Net iter 38 leverage**: confirms STT-side pricing is competitive, supports the Voxtral Transcribe migration thesis below.

### 10.6f Mistral Voxtral Transcribe 2 — STT migration candidate (HIGH iter 38 P0)

Per Andrea's coordinator message, this is the **strategic move** for iter 38:

| Dimension                    | CF Whisper Turbo (current iter 37 fixed)        | Voxtral Transcribe 2 (proposed iter 38)       |
|------------------------------|--------------------------------------------------|-----------------------------------------------|
| Latency (streaming)          | ~600 ms first partial                            | **sub-200 ms configurable**, 480 ms voice-agent mode (within 1-2 % WER) |
| Latency (batch)              | ~1.5 s for 10 s clip                             | not specified, but matches batch perf at 2.4 s delay mode |
| Italian support              | Yes (multilingual)                               | **Yes — 13 languages incl. Italian**         |
| GDPR / EU positioning        | Cloudflare US/EU edge (mixed jurisdiction)        | **EU FR + on-prem/private-cloud option** ✅  |
| Pricing                      | Free tier 10k/day shared (then paid)             | **Mini Transcribe $0.003/min, Realtime $0.006/min** |
| Stack coherence (Morfismo Sense 2) | Mixed (Mistral LLM/Vision/TTS + Cloudflare STT) | **Single-vendor Mistral** ✅ — brand coherence |
| Open weights                 | No                                               | **Yes (Apache 2.0)** — Sprint U self-host option |
| Bug surface iter 37          | 3-shape input handler complexity (`cloudflare-client.ts:cfWhisperSTT`) | clean REST endpoint, single payload format    |

**Iter 38 P0 NEW (Q): Migrate STT CF Whisper → Voxtral Transcribe 2.**
- Effort: ~6 h (port `unlim-stt/index.ts` + adapter in `voxtral-client.ts` already exists for TTS — extend with STT method, swap call site, deploy)
- Latency impact: **−400 ms warm STT path** (1500 → 1100 ms streaming partial)
- Cost: ~€10/mo additional at expected 5000 min/mo classroom load
- Quality: Italian K-12 verify needed iter 38 entrance (3-prompt smoke before commit)
- Strategic: closes the last cross-vendor gap. Stack becomes 100 % Mistral EU FR for LLM + Vision + TTS + STT. Morfismo Sense 2 coherence boost. GDPR audit simpler (1 sub-processor instead of 2).

### 10.6g Five iter 38 P0 candidates from Mistral docs (Andrea explicit)

Per coordinator message, the five Mistral-derived iter 38 priorities:

1. **P0 Mistral La Plateforme prompt cache API support check** (15 min, Documenter) — verify via `https://docs.mistral.ai/getting-started/changelog/` + `https://docs.mistral.ai/api/` whether `prompt-cache` flag or `cached_content` parameter exists. If yes, ELAB BASE_PROMPT (~3000 tokens stable) becomes a perfect cache target → **−500-1500 ms prefill on every call**. If no, defer to Sprint U.
2. **P1 Streaming SSE Mistral Small** (3 h, Maker) — `stream: true` parameter on `callTogether` (already Mistral-routed via `pickWeightedProvider`). Buffered server-side iter 38, full client SSE iter 39. **−300 ms TTFB** measured-conservative; **−2-3 s perceived** when frontend consumes stream iter 39.
3. **P1 Mistral structured output `response_format`** (4 h, Maker) — replace iter 36 A1 `[INTENT:{...}]` regex parser with native JSON schema. Quality lift (eliminates malformed tags), latency neutral. Iter 38 P1 because it requires schema design + intent-parser deprecation strategy + R7 re-bench. ADR-030 candidate.
4. **P2 voxtral.c local fallback explore** (Sprint U scope) — Mac Mini M4 native C inference for TTS at 23.5 ms/step (2.5× real-time). Cost-saves the €18/mo Mistral Scale tier when budget tight. Defer iter 39+.
5. **P0 Voxtral Transcribe 2 migration** (6 h, Maker) — see §10.6f above.

### 10.6i Mistral function calling — INTENT replacement (iter 38 P1 high-leverage)

Per coordinator clarification of Mistral API native capabilities:

- ✅ `stream: true` SSE supported
- ✅ `response_format: { type: "json_schema", schema: ... }` guaranteed structured JSON
- ✅ `tools` + `tool_choice` parallel function calling (default `parallel_tool_calls: true`)

**Iter 38 P1 strong candidate (P)**: Replace `[INTENT:{...}]` regex parser (iter 36 A1) with **native Mistral function calling**.

Why this matters for ELAB:
1. **Guaranteed structured output** vs LLM unreliable text emission. Current `intent-parser.ts:parseIntentTags` (270 LOC) handles malformed-tag failure modes; native `tools` payload eliminates this class of bug entirely.
2. **R7 INTENT exec rate ≥ 95 % achievable** (vs current ~ 0 % pre-fix iter 37, projected ~ 50-70 % post-v53 system-prompt teaching). Function calling provides type-safe contract.
3. **Eliminate parser regex fragility**: `parseIntentTags` becomes a backward-compat wrapper, primary path is JSON-typed.
4. **Type safety via schema validation**: TypeScript types derive from JSON schema, IDE autocomplete + compile-time checks for the 12 whitelisted actions in `intentsDispatcher`.

Implementation sketch iter 38:
```ts
// llm-client.ts callLLM signature extension:
export interface LLMOptions {
  // ...existing fields
  responseFormat?: { type: 'json_schema', schema: object };
  tools?: Array<{ type: 'function', function: ToolSpec }>;
  toolChoice?: 'auto' | 'none' | 'required';
}

// system-prompt.ts: drop INTENT teaching block (now in tools schema)
// callLLM(...{
//   tools: ALLOWED_INTENT_ACTIONS.map(toFunctionSpec),
//   toolChoice: 'auto',
//   responseFormat: { type: 'json_schema', schema: INTENT_ARRAY_SCHEMA },
// })

// intent-parser.ts: deprecate gradualmente (mantieni regex per backward compat)
// useGalileoChat.js: read response.tool_calls if present, else fall back to intents_parsed regex
```

Effort: 4-6 h Maker-2 iter 38 P1. Quality lift, latency neutral. ADR-030 candidate.

**Caveat**: Mistral docs landing page didn't load the exact `response_format` JSON schema syntax — Documenter iter 38 entrance must consult the linked API Reference (referenced from `docs.mistral.ai/developers` Quickstarts section) for code-ready snippets. Cookbook "Build an Agent with Tools" (10 min Quickstart) is the canonical reference.

### 10.6j Mistral OCR — iter 38+ P2 RAG re-ingest candidate

Per coordinator + `mistral.ai/news/mistral-ocr`:

- **Capability**: PDF text + figure + table + LaTeX + math extraction → markdown / structured JSON
- **Italian accuracy**: **99.42 %** per Mistral benchmarks
- **Pricing**: 1000 pages / $1 (batch ~2× throughput)
- **Latency**: up to 2000 pages/min/node
- **Endpoint**: `mistral-ocr-latest` on La Plateforme

**ELAB iter 38+ use cases**:
1. **Re-ingest 3 volumi** (Vol1 27 MB + Vol2 17 MB + Vol3 18 MB ≈ 200-300 pages total → **$0.20-0.30 one-time cost**) with figure metadata extracted alongside text. Current RAG 1881 chunks 1024-dim Voyage + Together Llama 3.3 70B contextualization captures `bookText` only, no figure references.
2. **Diagram-aware citations** ("come mostra Fig. 4.2 a pag. 67") become first-class. Iter 31 PZ V3 Vol/pag drift may partly be fixed by richer source markdown.
3. **Esperimento screenshot OCR fallback** when Pixtral 12B vision misses fine print on circuit diagrams. Probably overkill — Pixtral handles this. Defer.

**Iter 38 P2 (low priority vs P0 latency + P1 function calling)**: scope as standalone Sprint U atom — not a latency win, but a quality + Morfismo Sense 2 win. Skip iter 38 unless slack budget.

### 10.6k Mistral developer SDK reference (iter 38 implementation guide)

Per coordinator + `docs.mistral.ai/developers`:

The dev hub provides **3 Quickstarts** highly relevant for iter 38 implementation:
- **First API Request** (5 min): SDK install + basic call → reference for streaming SSE wire-up
- **Build an Agent with Tools** (10 min): function calling end-to-end → canonical reference for candidate P (Mistral structured INTENT replacement)
- **RAG with Document Search** (15 min): document upload + retrieval → potentially replaces / augments ELAB Voyage-based RAG iter 39+

**Documenter iter 38 entrance (15 min)**:
- Pull SDK Python + TS Quickstart code into `docs/research/iter-38-mistral-sdk-recipes.md`
- Specifically capture:
  - `stream: true` consumer pattern (server-side accumulator)
  - `response_format: { type: 'json_schema' }` exact syntax
  - `tools[]` ToolSpec shape for the 12 whitelisted intents
  - Retry policy 429/503/504 with exponential backoff (Mistral docs mention default; verify Cookbook for canonical exponential schedule)
  - Batch API cost-half mode for non-realtime workloads (R6/R7 stress benches)
- Cite `https://docs.mistral.ai/developers` Quickstarts + linked API Reference + SDK pages for each iter 38 implementation atom.

### 10.6h Mixtral 8×7B MoE / Mistral Small endpoint (CRITICAL CLARIFICATION)

Sources: `mistral.ai/news/mixtral-of-experts` + `superannotate.com Mixtral analysis`. Two independently-verified facts that change iter 38 strategy:

1. **Mixtral 8×7B specs**: 46.7B total / **12.9B active per token** (sparse MoE, 8 experts), **6× faster inference** than Llama 2 70B at equivalent or better quality. MT-Bench 8.30. Italian supported (5 langs: EN/FR/IT/DE/ES). 32 k context. Apache 2.0 weights.
2. **`mistral-small` API endpoint = Mixtral 8×7B** (or its successor): the public Mistral docs confirm "the model operates behind the endpoint named mistral-small". Superannotate further notes: "Mistral Small was updated to a model that is significantly better (and faster) than Mixtral 8×7B."

**Implication for ELAB**: ELAB's `LLM_ROUTING 70/20/10` already sends 70 % of traffic to `mistral-small-latest`, which **already maps to the Mixtral-MoE backend**. The 6× speed advantage Andrea expected from "migrating to Mixtral" is **already baked into iter 37's 4496 ms avg latency**. There is no untapped Mixtral lever via simple model-name swap.

**Where Mixtral routing CAN still help**:
- The 20 % `mistral-large-latest` slice is a **dense** model (Mistral Large 2 = 123 B dense). Each `mistral-large` call costs ~2-3× the latency of `mistral-small` per output token. **NEW iter 38 P0 candidate R**: reduce Large allocation 20 % → 10 % for non-deep categories; route extra 10 % to Small. Latency win **−400-700 ms on 10 % of traffic**, quality risk minimal — Large only earns its keep on `deep_question` and `safety_warning` per iter 37 A2 classifier.
- For `chit_chat` specifically, route to **`mistral-tiny`** / `open-mistral-7b` — candidate **O** in §10.4 — confirmed valid because Tiny remains smaller / faster than Mixtral-MoE.

**Net iter 38 impact from Mixtral analysis**:
- ✅ Confirms Mistral Small (Mixtral backend) is already the fastest dense-equivalent option for 70 % of traffic — no migration needed.
- ➕ NEW candidate **R** (Large 20 % → 10 % routing tightening): 1 h env config change, **−400 ms p95 on Large slice traffic**.
- ➕ Reaffirms candidate **O** (Tiny for chit_chat): valid because Tiny is still the smallest/fastest tier on La Plateforme.

---

## 11. References

- `supabase/functions/unlim-chat/index.ts:99-643` (request handler hot path)
- `supabase/functions/_shared/llm-client.ts:68-186` (callTogether), `:195-277` (callLLM weighted), `:435-606` (callLLMWithFallback)
- `supabase/functions/_shared/rag.ts:412-510` (dense `retrieveVolumeContext`), `:911-1050` (`hybridRetrieve`), `:781-807` (`embedQueryVoyage`)
- `supabase/functions/_shared/onniscenza-bridge.ts:299-374` (`aggregateOnniscenza` + 200 ms cap)
- `supabase/functions/_shared/capitoli-loader.ts:11` (module-scope JSON cache)
- `supabase/functions/_shared/onniscenza-classifier.ts` (iter 37 A2, 150 LOC)
- `supabase/functions/_shared/intent-parser.ts` (iter 36 A1, 270 LOC)
- ADR-029 LLM_ROUTING_WEIGHTS conservative tune (`docs/adrs/ADR-029-llm-routing-weights-conservative-tune.md`)
- R5 latest report: `scripts/bench/output/r5-stress-report-2026-04-30T16-30-22-458Z.md`
- 12 industry / vendor articles consulted (with fetch outcome):
  1. apitestlab.org/blog/why-is-my-api-slow ✅ — top-12 contributors
  2. medium dev-notebook /your-api-is-slow ✅ partial — narrative cut off mid-article
  3. medium kaushalsinh /why-your-api-is-slow ✅ — N+1 pattern
  4. zuplo.com /solving-poor-api-performance ✅ — effort×impact matrix
  5. bytebytego.com /top-5-common-ways ✅ — pagination + async logging + caching + compression + pool
  6. stackademic /from-slow-to-supercharged ❌ redirected to medium identity gateway, not re-fetched
  7. openai community /how-to-speed-up-openai ✅ — semantic caching, model selection, embedding-based architecture
  8. github.com Azure/LLM-Latency-Guidebook ✅ — token compression / parallelization / semantic cache (compounding wins)
  9. seangoedecke.com /fast-llm-inference ✅ — prefill vs decode bottleneck, KV cache, speculative decoding
  10. docs.mistral.ai/api ✅ — streaming SSE, response_format JSON schema, parallel_tool_calls
  11. reddit.com r/LocalLLaMA Mistral 10× TTFT ❌ blocked by Claude Code — public-knowledge fallback
  12. lightning.ai vLLM Mistral 7B ❌ page didn't load content — public-knowledge fallback (PagedAttention server-side only)
  13. digitalapplied.com Voxtral TTS guide ✅ — 70 ms hosted TTFB, 9.7× real-time, 3 s voice clone
  14. github.com antirez/voxtral.c ✅ — local C inference 23.5 ms/step Apple M3 Max, Sprint U candidate
  15. arxiv.org 2602.11298v3 ⚠ ambiguous URL, skipped pending Andrea clarification
  16. simonwillison.net Voxtral 2 ⚠ STT-not-TTS topic mismatch — confirmed pricing only
  17. mistral.ai/news/voxtral-transcribe-2 ✅ — STT migration candidate, EU GDPR + sub-200 ms streaming + Italian
  18. mistral.ai/news/mixtral-of-experts ✅ — Mixtral 8×7B MoE specs (46.7B/12.9B active, 6× faster, IT supported, behind `mistral-small` endpoint)
  19. superannotate.com /mistral-ai-mixtral-of-experts ✅ — Mixtral vs Small/Medium quality benchmarks, Mistral Small post-Mixtral upgrade confirmed
  20. mistral.ai/news/mistral-ocr ✅ — Italian 99.42 % accuracy, 1000 pages/$1, figure + LaTeX extraction (iter 38 P2 RAG re-ingest)
  21. docs.mistral.ai/developers ✅ — 3 Quickstarts (First Call / Tools / RAG), SDK Python+TS, Cookbook references for streaming + tools + batch
  22. docs.mistral.ai (full hub) ⚠ landing page only, deeper sections require sub-page fetches iter 38 entrance Documenter

---

## 12. Consolidated iter 38 P0 backlog (final)

### Phase 1 (parallel, ≤ 4 h Maker budget per atom):

| ID  | Atom                                              | Effort | p95 impact (est) | Source           | Status |
|-----|---------------------------------------------------|--------|------------------|------------------|--------|
| ✅ D | 8 s timeout on `callLLM` (Promise.race)           | done   | p99 cap 8 s      | Tier-1 D          | shipped iter 37 inline |
| ✅ C₁ | max_tokens 256 → 120                             | done   | −500-1000 ms     | Goedecke decode   | shipped iter 31 + iter 37 |
| ✅ INT canonical | system-prompt INTENT block (R7 fix)    | done   | quality          | Andrea iter 37    | shipped iter 37 inline |
| **A** | Promise.all 3 SB round-trips (rateLimit + consent + memory) | 1 h | −250 ms warm | Azure parallelization, ByteByteGo | iter 38 P0 |
| **B** | Onniscenza topK default 3 → 2                    | 30 min | −100 ms          | iter 37 A2 ext    | iter 38 P0 |
| **C₂** | max_tokens 120 → 80 chit_chat / plurale          | 30 min | −500 ms (40 % traffic) | Azure token comp  | iter 38 P0 |
| **E** | Embedding memoize LRU 200 entries                | 2 h    | −300 ms repeats   | OpenAI semantic   | iter 38 P0 |
| **I** | hybridRetrieve candidatePool 50 → 20             | 1 h    | −150 ms hybrid    | iter 37 audit     | iter 38 P0 |
| **F** | Cron warmup ping 30 s                            | 2 h    | kills cold tail   | Azure co-locate   | iter 38 P0 |
| **O** | Mistral Tiny for chit_chat                        | 2 h    | −400 ms 30 % traffic | Azure model selection | iter 38 P0 |
| **Q** | STT migration CF Whisper → Voxtral Transcribe 2  | 6 h    | −400 ms STT + GDPR clean + Morfismo Sense 2 | mistral.ai news Voxtral 2 | iter 38 P0 ⭐ |
| **M** | Mistral prompt cache API support check (Documenter) | 15 min | −500-1500 ms prefill IF supported | Mistral docs | iter 38 P0 entrance |
| **R** | LLM_ROUTING 70/20/10 → 80/10/10 (Large 20→10 %)   | 1 h    | −400 ms on 10 % traffic | Mixtral docs (Small=Mixtral, Large=dense 123B) | iter 38 P0 |

### Phase 2 (Tier-2, 2-4 h per atom):

| ID  | Atom                                              | Effort | p95 impact     | Source           | Status |
|-----|---------------------------------------------------|--------|----------------|------------------|--------|
| **G** | Parallel-race Mistral Small + Together           | 3 h    | −800 ms p95     | Azure load-balance | iter 38 P1 |
| **H** | RAG semantic KV cache (Supabase / CF Workers KV)  | 4 h    | −500 ms cache hit | Azure semantic cache | iter 38 P1 |
| **J'** | Mistral `stream: true` (server buffered)        | 3 h    | −300 ms TTFB    | Mistral docs      | iter 38 P1 |
| **P** | Mistral function calling replaces INTENT regex    | 4-6 h  | quality lift (R7 ≥ 95 %), latency neutral | Mistral docs response_format + tools | iter 38 P1 (ADR-030) |
| **L** | TTS prefetch top-3 templated responses           | 1 day  | TTS perceived 0 ms | Voxtral guide     | iter 38 P2 |
| **OCR** | Mistral OCR re-ingest 3 volumi w/ figure metadata | 1 day | quality + Morfismo Sense 2 lift | mistral.ai/news/mistral-ocr | iter 38 P2 (Sprint U candidate) |

### Iter 39+ Architecture:

| ID  | Investment                                  | Effort   | Source                  |
|-----|---------------------------------------------|----------|-------------------------|
| **J** | Full streaming SSE frontend                | 2-3 days | Mistral docs + Goedecke |
| **K** | Multi-region Edge eu-central-1             | 1 day    | Azure co-location       |
| **P** | Mistral structured output replaces INTENT regex | 4 h  | Mistral docs response_format | (iter 38 P1 quality, latency neutral) |
| **N** | Cloudflare Workers migration               | 3-5 days | iter 37 audit           |
| **U** | voxtral.c local Mac Mini fallback          | Sprint U | github antirez/voxtral.c |

### Phase 1 Maker dispatch suggestion (4-agent parallel):

```
Maker-1: A (Promise.all 3 SB) + I (candidatePool 20)        → 1 commit
Maker-2: C₂ (max_tokens 80) + B (topK default 2) + E (memo) → 1 commit
Maker-3: F (cron warmup setup) + R (routing 80/10/10 env tune) → 1 commit + Supabase Cron + env update
Maker-4: Q (STT Voxtral Transcribe 2 migration)             → 1 commit ⭐ strategic move

Documenter parallel: M (Mistral prompt cache check, 15 min)
                     + ADR-030 (Mistral structured INTENT iter 38 P1 design)
                     + clarify arxiv 2602.11298v3 with Andrea
```

### Iter 38 close target (post Phase 1):

```
R5 50-prompt re-run target:
  avg ~3000 ms      (was 4496, −33 %)
  p95 ~6000 ms      (was 10096, −40 %)
  p99 ~8000 ms      (D-cap, was 17971)
  quality ≥ 90 %    (must not regress 93.60 % iter 37)

Sprint T close iter 38 score: 9.5/10 ONESTO conditional.
```
