# Iter 5+ Implementation Plan — 5-Tier Classifier-Based Model Router

**Date**: 2026-05-12 | **Sprint**: U Cycle Iter 5+ | **Author**: Coder Agent (read-only analysis)
**Scope**: Concrete edits + rollout + test impact. No file writes performed.
**Backward compat**: MANDATORY — env flag `TIER_ROUTING_ENABLED=false` preserves current behavior bit-for-bit.

---

## 1. 5-Tier Classifier Router Wire-Up (Phase 1)

**Target**: `supabase/functions/unlim-chat/index.ts` (callLLM invocation at line 780).
**New helper module**: `supabase/functions/_shared/tier-router.ts` (NEW ~110 LOC).

### 1.1 New file `_shared/tier-router.ts` (NEW)

```typescript
// supabase/functions/_shared/tier-router.ts
// Iter 5+ 5-tier classifier-based model router.
// Pure function: classification result + image flag + message → tier config.
// Backward compat: if TIER_ROUTING_ENABLED!=='true', selectModelTier returns null
// and caller falls through to legacy weighted/Gemini path.

import type { PromptCategory } from './onniscenza-classifier.ts';

export type TierName = 'chit_chat' | 'reasoning' | 'kit_foto' | 'diagnostic' | 'book_page' | 'vision_default';

export interface TierConfig {
  tier: TierName;
  provider: 'gemini' | 'mistral';
  model: string;
  preferFastProvider: boolean;
  latencyBudgetMs: number;
  fallbackChain: Array<{ provider: 'gemini' | 'mistral'; model: string }>;
}

const KIT_FOTO_RE = /\b(kit|breadboard|montat[oaie]|fot[oae])\b/i;
const DIAG_RE = /\b(diagnos[ti]|brucia[a-z]*|aiut[oae])\b/i;
const BOOK_RE = /\b(libro|pagina|leggi)\b/i;

export function selectModelTier(
  promptCategory: PromptCategory,
  hasImages: boolean,
  messageText: string,
): TierConfig | null {
  if ((Deno.env.get('TIER_ROUTING_ENABLED') || 'false').trim().toLowerCase() !== 'true') {
    return null; // opt-in feature flag; null → caller falls back to legacy path
  }

  // Tier 2-5: vision-bearing (hasImages) — disambiguated by message intent
  if (hasImages) {
    if (KIT_FOTO_RE.test(messageText)) {
      return {
        tier: 'kit_foto', provider: 'mistral', model: 'pixtral-large-latest',
        preferFastProvider: false, latencyBudgetMs: 12000,
        fallbackChain: [{ provider: 'mistral', model: 'mistral-small-2506' }, { provider: 'gemini', model: 'gemini-2.5-flash' }],
      };
    }
    if (DIAG_RE.test(messageText)) {
      return {
        tier: 'diagnostic', provider: 'mistral', model: 'mistral-medium-2505',
        preferFastProvider: false, latencyBudgetMs: 12000,
        fallbackChain: [{ provider: 'gemini', model: 'gemini-2.5-flash' }, { provider: 'mistral', model: 'mistral-small-2506' }],
      };
    }
    if (BOOK_RE.test(messageText)) {
      return {
        tier: 'book_page', provider: 'gemini', model: 'gemini-2.5-flash',
        preferFastProvider: true, latencyBudgetMs: 10000,
        fallbackChain: [{ provider: 'mistral', model: 'mistral-small-2506' }],
      };
    }
    // Tier 5 default — status quo Gemini Flash for vision
    return {
      tier: 'vision_default', provider: 'gemini', model: 'gemini-2.5-flash',
      preferFastProvider: true, latencyBudgetMs: 10000,
      fallbackChain: [{ provider: 'mistral', model: 'mistral-small-2506' }],
    };
  }

  // Tier 1: deep question reasoning (≥20w + ? handled by classifier)
  if (promptCategory === 'deep_question') {
    return {
      tier: 'reasoning', provider: 'mistral', model: 'mistral-medium-2505',
      preferFastProvider: false, latencyBudgetMs: 10000,
      fallbackChain: [{ provider: 'gemini', model: 'gemini-2.5-flash' }, { provider: 'gemini', model: 'gemini-2.5-flash-lite' }],
    };
  }

  // Tier 0: chit_chat / citation_vol_pag / off_topic / safety / plurale → Flash-Lite (cheap, fast EU)
  return {
    tier: 'chit_chat', provider: 'gemini', model: 'gemini-2.5-flash-lite',
    preferFastProvider: true, latencyBudgetMs: 8000,
    fallbackChain: [{ provider: 'gemini', model: 'gemini-2.5-flash' }, { provider: 'mistral', model: 'mistral-small-latest' }],
  };
}
```

**LOC delta**: +110 NEW.

### 1.2 Edit `unlim-chat/index.ts:780` callLLM invocation

**BEFORE** (lines 780-792):
```typescript
const llmCallPromise = callLLM({
  model,
  systemPrompt,
  message: safeMessage,
  images: safeImages,
  maxOutputTokens: activeAiProfile.depth === 'total' ? 520 : 240,
  temperature: 0.7,
  thinkingLevel,
  preferFastProvider: true,
  ...(useIntentSchema ? { responseFormat: INTENT_TOOLS_SCHEMA } : {}),
});
```

**AFTER**:
```typescript
// Iter 5+ tier router: opt-in via TIER_ROUTING_ENABLED env flag.
// Null result → fall through to legacy preferFastProvider:true behavior.
const tierConfig = selectModelTier(
  promptClass.category,
  hasImages,
  safeMessage,
);
const llmCallPromise = callLLM({
  model,
  systemPrompt,
  message: safeMessage,
  images: safeImages,
  maxOutputTokens: activeAiProfile.depth === 'total' ? 520 : 240,
  temperature: 0.7,
  thinkingLevel,
  preferFastProvider: tierConfig?.preferFastProvider ?? true,
  modelOverride: tierConfig?.model,
  providerOverride: tierConfig?.provider,
  fallbackChain: tierConfig?.fallbackChain,
  tierName: tierConfig?.tier,
  ...(useIntentSchema ? { responseFormat: INTENT_TOOLS_SCHEMA } : {}),
});
```

Plus import at top of file:
```typescript
import { selectModelTier } from '../_shared/tier-router.ts';
```

**LOC delta**: +14 / -1 = net +13. Total Phase 1: ~123 LOC.

---

## 2. callLLM Extension (Phase 2)

**Target**: `supabase/functions/_shared/llm-client.ts:211` (LLMOptions interface) and `:379` (callLLM body).

### 2.1 Extend `LLMOptions` interface (line 211-227)

**BEFORE**:
```typescript
export interface LLMOptions {
  model: GeminiModel;
  systemPrompt: string;
  message: string;
  images?: ImageData[];
  maxOutputTokens?: number;
  temperature?: number;
  thinkingLevel?: 'minimal' | 'low' | 'medium' | 'high';
  preferFastProvider?: boolean;
  responseFormat?: MistralResponseFormat;
}
```

**AFTER**:
```typescript
export interface LLMOptions {
  model: GeminiModel;
  systemPrompt: string;
  message: string;
  images?: ImageData[];
  maxOutputTokens?: number;
  temperature?: number;
  thinkingLevel?: 'minimal' | 'low' | 'medium' | 'high';
  preferFastProvider?: boolean;
  responseFormat?: MistralResponseFormat;
  /** Iter 5+: explicit model id (overrides legacy routing). */
  modelOverride?: string;
  /** Iter 5+: explicit provider (overrides legacy weighted/preferFast routing). */
  providerOverride?: 'gemini' | 'mistral';
  /** Iter 5+: ordered fallback chain on primary failure. */
  fallbackChain?: Array<{ provider: 'gemini' | 'mistral'; model: string }>;
  /** Iter 5+: telemetry label for prompt_class log + response surface. */
  tierName?: string;
}
```

**LOC delta**: +8.

### 2.2 Plumb `modelOverride` + `providerOverride` through callLLM (line 379-471)

**BEFORE** (line 384-393 vision short-circuit):
```typescript
if (hasImages) {
  const r = await callGemini(options);
  return { text: r.text, model: r.model, provider: ..., tokensUsed: ..., latencyMs: ... };
}
```

**AFTER**:
```typescript
// Iter 5+: tier router explicit override (highest priority — bypass legacy logic).
if (options.providerOverride && options.modelOverride) {
  return await callTierWithFallback(options);
}

if (hasImages) {
  // Legacy vision path preserved when no tier override.
  const r = await callGemini(options);
  return { text: r.text, model: r.model, provider: ..., tokensUsed: ..., latencyMs: ... };
}
```

Plus new helper `callTierWithFallback` immediately above `callLLM` (insert at line 378):

```typescript
async function callTierWithFallback(options: LLMOptions): Promise<LLMResult> {
  const chain: Array<{ provider: 'gemini' | 'mistral'; model: string }> = [
    { provider: options.providerOverride!, model: options.modelOverride! },
    ...(options.fallbackChain ?? []),
  ];
  let lastErr: unknown;
  for (const step of chain) {
    try {
      if (step.provider === 'gemini') {
        const r = await callGemini({ ...options, model: step.model as GeminiModel });
        return { text: r.text, model: r.model, provider: 'gemini',
          tokensUsed: { input: r.tokensUsed?.input ?? 0, output: r.tokensUsed?.output ?? 0 },
          latencyMs: r.latencyMs };
      }
      // Mistral
      return await callMistral(options, step.model as MistralChatModel);
    } catch (e) {
      lastErr = e;
      console.info(JSON.stringify({
        level: 'info', event: 'tier_fallback_step_failed',
        tier: options.tierName, step_provider: step.provider, step_model: step.model,
        error: e instanceof Error ? e.message : String(e),
      }));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('tier_chain_exhausted');
}
```

**LOC delta**: +28 helper + 4 short-circuit = +32. Total Phase 2: ~40 LOC.

### 2.3 Backward compat invariant

When `tierConfig === null` (env flag off), `unlim-chat` sets `modelOverride/providerOverride/fallbackChain` to `undefined`. The `if (options.providerOverride && options.modelOverride)` guard fails, and **the unchanged legacy path runs**. Bit-for-bit preservation verified by absence of these fields in current callers.

---

## 3. Fallback Chain Robustness (Phase 3)

Per-tier fallback already encoded in `tier-router.ts` (§1.1) and consumed by `callTierWithFallback` (§2.2). Per-tier strategy:

| Tier | Primary | Fallback 1 | Fallback 2 | Rationale |
|------|---------|-----------|-----------|-----------|
| 1 reasoning | mistral-medium-2505 | gemini-2.5-flash | gemini-2.5-flash-lite | Flash long-context > Flash-Lite (R5 evidence: complex prompts truncated at Flash-Lite) |
| 2 kit_foto | pixtral-large-latest | mistral-small-2506 | gemini-2.5-flash | Pixtral Large slow tail → Small-2506 same vision API |
| 3 diagnostic | mistral-medium-2505 | gemini-2.5-flash | mistral-small-2506 | Reasoning depth required for safety diagnosis |
| 4 book_page | gemini-2.5-flash | mistral-small-2506 | — | Flash multimodal sufficient for OCR-style |
| 5 vision_default | gemini-2.5-flash | mistral-small-2506 | — | Status quo |
| 0 chit_chat | gemini-2.5-flash-lite | gemini-2.5-flash | mistral-small-latest | Cheap → upgrade quality on failure |

Existing retry-with-backoff (`retryWithBackoff` in llm-client.ts lines 100-200) still runs **inside each step** — fallback is across-provider, retry is within-provider. Composition: ~3 retries × 6 steps max = 18 attempts cap, gated by `latencyBudgetMs` outer `Promise.race` timeout already in `unlim-chat/index.ts:797-801`.

**LOC delta**: 0 (already in tier-router.ts + callTierWithFallback). Telemetry log adds 6 LOC in `unlim-chat/index.ts` (§4).

---

## 4. Telemetry Per-Tier

### 4.1 Extend `prompt_class` log in `unlim-chat/index.ts`

Locate existing prompt_class log block (grep `prompt_class`). After classification, insert:

```typescript
console.info(JSON.stringify({
  level: 'info', event: 'tier_selected',
  timestamp: new Date().toISOString(),
  tier_chosen: tierConfig?.tier ?? 'legacy',
  tier_provider: tierConfig?.provider ?? null,
  tier_model: tierConfig?.model ?? null,
  prompt_category: promptClass.category,
  has_images: hasImages,
}));
```

### 4.2 Surface in response JSON

In the response builder (locate `JSON.stringify({ ..., text: cappedText, ...})` near end of handler), add:

```typescript
tier_chosen: tierConfig?.tier ?? 'legacy',
tier_latency_ms: Date.now() - llmStartTime,
tier_provider: tierConfig?.provider ?? result.provider,
```

Requires capturing `llmStartTime = Date.now()` immediately before `callLLM` invocation (1 LOC).

**LOC delta**: +12 in `unlim-chat/index.ts`. Enables R5/R6/R7 per-tier scoring.

---

## 5. Concrete Edit Sketches (Recap)

| File | Change Type | LOC Delta |
|------|------------|-----------|
| `_shared/tier-router.ts` | NEW | +110 |
| `_shared/llm-client.ts` (LLMOptions interface line 211) | EXTEND | +8 |
| `_shared/llm-client.ts` (callTierWithFallback helper + callLLM short-circuit line 378-393) | NEW + INSERT | +32 |
| `unlim-chat/index.ts` (line 780 callLLM invocation) | MODIFY | +13 |
| `unlim-chat/index.ts` (import + telemetry + response surface) | INSERT | +14 |
| `unlim-vision/index.ts` (line 122 visionModel — optional tier override pass-through) | OPTIONAL | +3 |
| **TOTAL** | | **~180 LOC** |

Net within original estimate (30-50 LOC) only for callLLM extension + invocation. Total including new helper module ~180 LOC.

---

## 6. Test Impact Analysis

### 6.1 Existing tests to update

| File:line | Reason |
|-----------|--------|
| `tests/unit/onniscenza-classifier.test.js` (all categories) | No change — classifier output unchanged. |
| `tests/unit/intent-parser.test.js:1-264` | No change — INTENT parser orthogonal to routing. |
| `tests/integration/unlim-chat-prompt-v3.test.js` | UPDATE: mock `selectModelTier` returning null (env unset) preserves current assertions; ADD env-on variant. |
| `tests/unit/llm-client.test.js` (if exists; else create) | NEW: 8-12 cases — providerOverride routing, fallback chain step failure, env flag gating. |

### 6.2 New unit tests (suggested 10 cases for tier-router)

```
tier-router.test.ts
- env unset → returns null (legacy fallthrough)
- env=true + category=chit_chat + no images → tier 0 flash-lite
- env=true + category=deep_question + no images → tier 1 medium-2505
- env=true + hasImages + "monta breadboard kit" → tier 2 pixtral-large
- env=true + hasImages + "brucia LED aiuto" → tier 3 medium-2505 vision
- env=true + hasImages + "leggi pagina libro" → tier 4 gemini-flash
- env=true + hasImages + "spiega" (no match) → tier 5 vision_default
- env=true + category=safety_warning → tier 0 flash-lite (safety routes cheap+fast)
- env=true + category=plurale_ragazzi → tier 0 flash-lite
- fallbackChain present and ordered per tier table §3
```

### 6.3 Integration tests (callTierWithFallback)

```
llm-tier-fallback.test.ts
- primary success → no fallback called
- primary 503 → fallback 1 invoked
- primary + fallback 1 both 503 → fallback 2 invoked
- entire chain 503 → throws last error
- mistral→gemini provider switch normalizes result shape
```

### 6.4 E2E Playwright impact

`tests/e2e/01-unlim-chat-smoke.spec.js` (if present): no change — response shape is additive (`tier_chosen` field appended). `tests/e2e/02-vision-flow.spec.js`: optionally assert `tier_chosen === 'kit_foto'` when image upload + "kit" prompt.

R5/R6/R7 bench runners (`scripts/bench/run-sprint-r{5,6,7}-stress.mjs`): UPDATE to capture `tier_chosen` per response and emit per-tier sub-scores (recall@5 per tier, latency p95 per tier).

---

## 7. Rollout Plan (Phased)

### Step 1 — iter 5: Land tier-router module + interface extension (DARK)

Commit 1: `_shared/tier-router.ts` NEW + `LLMOptions` extension + `callTierWithFallback` helper. **Env flag OFF**. Build PASS, vitest baseline preserved.

Verification curl:
```bash
# baseline check: no tier_chosen in response (env off)
curl -X POST "$EDGE_URL/unlim-chat" -H "x-elab-api-key: $K" -d '{"message":"Ciao"}' | jq '.tier_chosen // "absent"'
# expect: "absent"
```

### Step 2 — iter 5: Wire `selectModelTier` call in unlim-chat invocation

Commit 2: `unlim-chat/index.ts` modifications + telemetry. Still `TIER_ROUTING_ENABLED=false` prod. Smoke prod: bit-for-bit same response.

Verification:
```bash
curl ... | jq '.tier_chosen'  # still "legacy" until env flip
```

### Step 3 — iter 6: Canary 5% prod via env-flag flip + bench

Commit 3: deploy unchanged. Andrea: `supabase secrets set TIER_ROUTING_ENABLED=true`. Re-deploy NOT required (env read at request time).

Verification:
- R5 50-prompt re-bench → expect ≥85% PZ V3 quality maintained, per-tier latency p95 captured.
- Per-tier benches via `scripts/bench/run-tier-bench.mjs` (NEW iter 6) measuring tier 0 vs tier 1 distinct populations.

### Step 4 — iter 6: Rollout 25% → 100% if R5/R6/R7 PASS

Per-tier gate criteria:
- Tier 0 chit_chat: p95 ≤ 2500ms (Flash-Lite is fast).
- Tier 1 reasoning: ≥90% PZ V3 + p95 ≤ 6000ms.
- Tier 2 kit_foto: ≥80% topology accuracy on `circuit-01..20.png` fixture.
- Tier 3 diagnostic: ≥90% safety_keyword_present.
- Tier 4-5 book_page/vision_default: maintain iter 37 R7 91.80%.

### Step 5 — iter 7: Telemetry-driven tier tuning

If tier 1 p95 > 6000ms repeatedly, fallback Gemini Flash becomes primary; promote ADR.

### Rollback strategy

Single env flag flip: `supabase secrets set TIER_ROUTING_ENABLED=false`. No code revert needed. Legacy weighted/preferFast path unchanged.

For emergency code rollback: `git revert <commit-1..commit-3>` — all three commits are additive (NEW file + interface field addition + guarded invocation block), revert is mechanical.

---

## 8. Phased Plan Summary (iter 5/6/7)

| Iter | Step | Deliverable | Risk |
|------|------|------------|------|
| 5 | 1 | tier-router.ts NEW + LLMOptions extension + helper (env OFF) | Low — code dark, no runtime change |
| 5 | 2 | unlim-chat invocation wire-up + telemetry (env OFF) | Low — log noise only |
| 6 | 3 | Andrea flip env=true canary 5% + R5/R6/R7 bench per-tier | Med — quality regression risk if Mistral medium-2505 PZ V3 drift |
| 6 | 4 | Rollout 25% → 100% conditional gates | Med — depends on canary metrics |
| 7 | 5 | Tier config tuning (promote fallback if primary p95 budget exceeded) | Low — env-only config |

---

## 9. LOC Delta + Complexity + Risk

**Total LOC delta**: ~180 (within "30-50 LOC change" if we discount new helper module which is logically separable; pure invocation diff is ~50 LOC).

**Complexity**: LOW-MEDIUM
- New module is pure function (no I/O, no async, no state).
- Interface extension is purely additive.
- callTierWithFallback iterates a small array; no recursion, no parallel race.
- Backward compat invariant trivially provable: when overrides undefined, code path is identical.

**Risk assessment**:
| Risk | Mitigation |
|------|-----------|
| Mistral-medium-2505 PZ V3 drift on tier 1/3 reasoning | Canary 5% + R5 bench gate ≥85% before 25% |
| Pixtral Large tail latency on tier 2 | Per-tier `latencyBudgetMs` outer race + Small-2506 fallback |
| Regex misclassification (e.g. "fotone" matches "fot") | Word-boundary `\b` already in patterns; add unit test cases for edge tokens |
| Env flag config error in prod | Rollout via `supabase secrets get` verify pre/post; flag default false fail-safe |
| Telemetry payload bloat | `tier_chosen` is short string; +50 bytes per response negligible |

**Mandatory gates iter 5 → iter 6 promotion**:
1. vitest GREEN (baseline preserved + 10 NEW tier-router tests + 5 fallback chain tests = +15 PASS).
2. Build PASS (no TypeScript error on LLMOptions extension; `modelOverride` etc all optional).
3. Smoke prod env-off: response identical to iter 4 v50 baseline (bit-for-bit on `text` field, only additive `tier_chosen: "legacy"` field).
4. ADR-NEW-iter5 PROPOSED: "5-tier classifier-based model router" + Andrea ratify queue.

**Mandatory gates iter 6 → 100% rollout**:
1. R5 ≥ 85% maintained (no quality regression).
2. R7 INTENT canonical ≥ 95% maintained per ADR-030.
3. Per-tier latency p95 within budget table §7 step 4.
4. Tier distribution histogram emitted to logs (e.g. 60% tier 0, 15% tier 1, 25% tier 4/5).

---

## 10. Files Cited (file:line, absolute paths)

- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/unlim-chat/index.ts:780-792` (callLLM invocation)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/llm-client.ts:211-227` (LLMOptions interface)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/llm-client.ts:379-475` (callLLM body)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/onniscenza-classifier.ts:38-46` (PromptCategory type)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/mistral-client.ts:61-66` (MistralChatModel type)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/mistral-client.ts:115-125` (pickDefaultModel)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/unlim-vision/index.ts:122-126` (visionModel env-aware)

---

## 11. Constraints Compliance Checklist

- [x] READ-ONLY analysis (no source files modified; only plan markdown written)
- [x] Concrete code blocks (not pseudo-code) — TypeScript with full type annotations
- [x] file:line citations throughout
- [x] BACKWARD COMPAT preserved — env flag default `false` + null tierConfig fallthrough
- [x] LOC delta estimated per file and total
- [x] Test impact analyzed: 4 update points + ~15 new unit tests + bench runner extension
- [x] Rollout phased iter 5/6/7 with verification curl bench
- [x] Rollback strategy: single env flag flip + additive commits revert-friendly
- [x] Budget 20 min: this document produced within read-only window

**End of plan.**
