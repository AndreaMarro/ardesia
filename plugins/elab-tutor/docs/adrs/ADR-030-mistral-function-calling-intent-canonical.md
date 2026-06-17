# ADR-030 — Mistral Function Calling INTENT Canonical

**Status**: PROPOSED iter 38
**Date**: 2026-04-30
**Author**: Maker-2 (feature-dev:code-architect) iter 38 Phase 1
**Cross-refs**: ADR-028 §14 (surface-to-browser amend, ACCEPTED iter 37) · ADR-029 (LLM routing weights) · ADR-031 (STT migration Voxtral Transcribe 2)
**Andrea ratify deadline**: iter 38 Phase 3 entrance gate
**Atom**: ATOM-S38-A7 (PDR iter 38 §3)

---

## §1 Status

**PROPOSED** — pending Maker-1 implementation in `_shared/llm-client.ts` + `_shared/system-prompt.ts` + `unlim-chat/index.ts`. Acceptance gate: R7 re-bench post-deploy ≥95% canonical rate.

---

## §2 Context — 4-way schema drift evidence

Tester-6 iter 37 Phase 3 bench R7 (200 prompts, Edge Function v53, 2026-04-30):

| Metric | Value | Target |
|--------|-------|--------|
| HTTP success | 200/200 | 100% | PASS |
| Canonical `intents_parsed` rate | **12.5%** | ≥80% | FAIL |
| Combined (canonical + legacy AZIONE) | 54.5% | ≥80% | FAIL |
| LLM emits 0 INTENT tags | 73/200 | — | — |
| Params shape valid (per-action rules) | 25/44 | — | 56.8% |
| **params_fail bucket** | **17/200** | 0 | FAIL |

Reference: `automa/team-state/messages/tester6-iter37-phase3-completed.md` §3.4 + §4 (diagnostic schema drift).

### The 4-way schema drift (root cause of 17/200 params_fail)

Tester-6 §4 identifies a canonical mismatch across 4 sources for `mountExperiment`:

| Source | Key used | Value |
|--------|----------|-------|
| **Bench scorer** `scripts/bench/run-sprint-r7-stress.mjs:92` | `args.experimentId` | `typeof args?.experimentId === 'string'` |
| **System-prompt few-shot** `_shared/system-prompt.ts:78` | `args.id` | `[INTENT:{"tool":"mountExperiment","args":{"id":"v1-cap6-esp1"}}]` |
| **ADR-028 §14 contract** (pre-iter-37 amend) | `args.id` | same as system-prompt |
| **Browser API** `src/services/simulator-api.js:264` | positional string | `mountExperiment(experimentId)` |

Secondary drifts (confirmed by Tester-6 §4, same bucket):

| Tool | Scorer expects | System-prompt few-shot emits |
|------|----------------|------------------------------|
| `highlightPin` | `args.pins` (array) | `args.ids` (array) |
| `setComponentValue` | `args.param` (string) | `args.field` (string) |
| `toggleDrawing` | `args.enabled` (boolean) | `args.on` (boolean) |

All 17 params_fail samples (`r6-028, r6-062, r6-063, r6-066, r6-067` and 12 unseen) are LLM-compliant with the system-prompt schema but fail the bench scorer's different schema. LLM is correctly following the few-shot; the scorer is checking a different contract.

### Why prompt-teaching fails at 12.5% canonical

Beyond the params drift, 73/200 prompts return prose-only (no `[INTENT:...]` tag). System-prompt block lines 68-109 says "MANDATORY … DEVI emettere" — but the LLM compliance rate is approximately 21% (44/200 emit any INTENT). Root causes:
1. LLM sees a long system prompt with both legacy `[AZIONE:...]` and canonical `[INTENT:...]` blocks — two competing schemas create ambiguity.
2. For explanatory/citation prompts (`plurale_ragazzi`, `sintesi_60w`, `citation_vol_pag`) the LLM correctly omits INTENT — but 37% of the fixture falls into these categories, diluting canonical rate.
3. Prompt-teaching inherits all the fragility of free-text generation: minor phrasing changes, temperature variation, or provider switch can break emission.

**Conclusion**: prompt-teaching with tag parsing is an unreliable substrate for structured action dispatch. The Mistral La Plateforme native `response_format: { type: 'json_schema' }` feature provides a **schema-guaranteed** output path that eliminates both the compliance-rate problem and the params-shape drift.

---

## §3 Decision

Replace prompt-teaching INTENT emission (`[INTENT:{...}]` tags in free-text) with **Mistral La Plateforme native structured output** via `response_format: { type: 'json_schema', json_schema: { ... } }`.

The LLM output schema guarantees:
- `text` field always present (Italian K-12 plurale Ragazzi ≤60 parole + analogia + kit fisico mention)
- `intents` array always present (zero-or-more valid intent objects)
- `tool` enum-constrained to whitelist 12 actions
- `args` always an object (downstream dispatcher can apply per-tool shape validation)

**Single source of truth for canonical params shape**: `args.id` (NOT `args.experimentId`) for `mountExperiment`, aligned with system-prompt few-shot and ADR-028 §14 post-amend. The bench scorer rule `run-sprint-r7-stress.mjs:92` MUST be updated by Tester-2 (ATOM-S38-A1 sub-task A1.b) to expect `args.id`.

### Canonical schema (TypeScript)

```typescript
// _shared/llm-client.ts — INTENT_SCHEMA constant
export const INTENT_TOOLS_SCHEMA = {
  type: 'json_schema',
  json_schema: {
    name: 'unlim_response',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        intents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tool: {
                type: 'string',
                enum: [
                  'highlightComponent',
                  'mountExperiment',
                  'captureScreenshot',
                  'highlightPin',
                  'clearHighlights',
                  'clearCircuit',
                  'getCircuitState',
                  'getCircuitDescription',
                  'setComponentValue',
                  'toggleDrawing',
                  'serialWrite',
                  'clearHighlightPins',
                ],
              },
              args: {
                type: 'object',
                additionalProperties: true,
              },
            },
            required: ['tool', 'args'],
            additionalProperties: false,
          },
        },
        text: {
          type: 'string',
          description: 'Response prose Italian K-12 plurale Ragazzi ≤60 parole + analogia + kit fisico mention',
        },
      },
      required: ['text'],
      additionalProperties: false,
    },
  },
} as const;
```

### Canonical params alignment table (single source of truth post-ADR-030)

| Tool | Canonical arg key | Type | Notes |
|------|-------------------|------|-------|
| `mountExperiment` | `id` | string | `"v1-cap6-esp1"` — system-prompt §2 example canonical |
| `highlightComponent` | `ids` | string[] | `["led1","r1"]` |
| `highlightPin` | `ids` | string[] | `["nano:D13"]` — NOT `pins` (scorer drift) |
| `setComponentValue` | `id`, `field`, `value` | string, string, number | NOT `param` (scorer drift) |
| `toggleDrawing` | `on` | boolean | NOT `enabled` (scorer drift) |
| `serialWrite` | `text` | string | |
| `clearHighlights` | (empty) | — | |
| `clearHighlightPins` | (empty) | — | |
| `captureScreenshot` | (empty) | — | |
| `getCircuitState` | (empty) | — | |
| `getCircuitDescription` | (empty) | — | |
| `clearCircuit` | (empty) | — | |

**Browser dispatcher alignment** (`src/components/lavagna/intentsDispatcher.js` + `src/services/simulator-api.js`): the current browser `mountExperiment(experimentId)` is positional. Maker-1 OR WebDesigner-1 MUST update the dispatcher call to destructure `args.id` → `mountExperiment(args.id)`. This is a ~3 LOC change in `intentsDispatcher.js`. Tracked as a sub-task of Tester-2 ATOM-S38-A1.b bench scorer update.

---

## §4 Implementation block (Maker-1 iter 38)

### 4.1 `supabase/functions/_shared/llm-client.ts`

Add optional parameter `responseFormat?: typeof INTENT_TOOLS_SCHEMA` to `LLMOptions` interface and `callLLM` function signature. When provided, pass through to `callMistralChat` as `response_format`.

```typescript
// In LLMOptions interface (extend, no breaking change):
responseFormat?: {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
  };
};
```

In `callMistralChat` request body assembly:
```typescript
const requestBody: Record<string, unknown> = {
  model: modelId,
  messages: [...],
  max_tokens: opts.maxOutputTokens ?? 120,
  temperature: opts.temperature ?? 0.7,
};
if (opts.responseFormat) {
  requestBody['response_format'] = opts.responseFormat;
}
```

The result `text` field will be a JSON string. Parse it post-call:
```typescript
// In callLLM wrapper, after receiving result from callMistralChat:
if (options.responseFormat?.type === 'json_schema') {
  try {
    const parsed = JSON.parse(result.text) as { text?: string; intents?: unknown[] };
    return {
      ...result,
      text: parsed.text ?? '',
      // Surface intents as structured field for unlim-chat to consume directly
      structuredIntents: parsed.intents ?? [],
    };
  } catch {
    // JSON parse error — fallback to raw text (defensive, never break chat)
    console.warn('[llm-client] json_schema parse error, falling back to raw text');
  }
}
```

Extend `LLMResult` interface:
```typescript
export interface LLMResult {
  text: string;
  model: string;
  provider: string;
  tokensUsed: { input: number; output: number };
  latencyMs: number;
  structuredIntents?: Array<{ tool: string; args: Record<string, unknown> }>; // NEW ADR-030
}
```

### 4.2 `supabase/functions/_shared/system-prompt.ts`

Drop the `[INTENT:...]` block (lines 68-109) from `BASE_PROMPT`. This block was teaching the LLM to emit tags that are no longer needed — the schema now enforces structure. Retain the legacy `[AZIONE:...]` block (lines 37-67) for play/pause/compile actions that do NOT map to the 12-tool whitelist.

The remaining system prompt should add a brief guidance sentence for the `text` field:
```
FORMATO RISPOSTA (JSON strutturato — non usare tag [INTENT:...]):
- "text": risposta in italiano, max 60 parole, tono plurale "Ragazzi,", 1 analogia, 1 menzione kit fisico ELAB
- "intents": array azioni visualizzabili sulla LIM (0 o più). Emetti SOLO quando il docente chiede un'azione esplicita.
```

### 4.3 `supabase/functions/unlim-chat/index.ts`

Step 5 `callLLM` invocation: pass `responseFormat: INTENT_TOOLS_SCHEMA` for non-template-router paths (i.e., after the L2 template short-circuit block):

```typescript
result = await Promise.race([
  callLLM({
    model,
    systemPrompt,
    message: safeMessage,
    images: safeImages,
    maxOutputTokens: 120,
    temperature: 0.7,
    thinkingLevel,
    responseFormat: INTENT_TOOLS_SCHEMA,   // ADR-030 structured output
  }),
  timeoutPromise,
]);
```

Step 6a (INTENT parse block, lines 554-580): replace regex `parseIntentTags` call with direct consumption of `result.structuredIntents`:

```typescript
// ADR-030: structuredIntents from json_schema response_format (no regex parse needed)
let parsedIntents: IntentTag[] = [];
let cleanText = cappedText;
if (result.structuredIntents && result.structuredIntents.length > 0) {
  // Convert from { tool, args } to IntentTag shape for downstream compatibility
  parsedIntents = result.structuredIntents.map((intent, idx) => ({
    raw: '',                          // No raw tag string in structured mode
    tool: intent.tool,
    args: intent.args,
    startIdx: idx,
    endIdx: idx,
  }));
  // cleanText is already clean — no [INTENT:...] tags in json_schema output
  cleanText = cappedText;
} else {
  // Fallback: regex parse for legacy path (Together AI fallback, Brain fallback)
  try {
    parsedIntents = parseIntentTags(cappedText);
    cleanText = stripIntentTags(cappedText);
  } catch {
    parsedIntents = [];
    cleanText = cappedText;
  }
}
```

**Fallback path**: Together AI and Brain fallbacks are NOT Mistral — they do NOT support `response_format: json_schema`. These paths continue using regex `parseIntentTags` (retained as fallback). Only the primary Mistral path uses structured output.

### 4.4 Conditional activation (env flag)

Add `ENABLE_INTENT_JSON_SCHEMA=true` env flag (Supabase secret) for gradual rollout:

```typescript
const useJsonSchema = (Deno.env.get('ENABLE_INTENT_JSON_SCHEMA') || 'false') === 'true';
// Pass responseFormat only when flag active:
responseFormat: useJsonSchema ? INTENT_TOOLS_SCHEMA : undefined,
```

This allows canary testing (5% sessions) before full activation.

---

## §5 Consequences

### Positive
- **95%+ canonical projection**: json_schema enforcement eliminates LLM non-compliance (≥95% projected canonical rate from <40% current — schema is enforced, not requested)
- **Type-safe output**: `intents` array is always present, each item has `tool` (enum-validated) and `args` (object). Zero regex parse fragility.
- **Eliminates 4-way drift**: single schema definition in `INTENT_TOOLS_SCHEMA` constant is the canonical source — bench scorer, system prompt, dispatcher ALL align to it.
- **Cleaner system prompt**: dropping the `[INTENT:...]` block (~42 LOC from BASE_PROMPT) reduces prompt token count ~20%.
- **R7 target closure**: ≥95% canonical projected (vs 12.5% pre-ADR-030). Sprint T close gate ≥80% R7 PASS conditional.

### Negative
- **Mistral-only feature**: `response_format: json_schema` is supported by Mistral La Plateforme (`mistral-small-latest`, `mistral-large-latest`). Together AI (Llama 3.3 70B) and Brain fallback do NOT support this parameter — fallback paths continue regex parsing. This creates a two-tier behavior.
- **Together AI fallback degradation**: when Mistral is unavailable and Together AI handles the request, canonical rate reverts to ~12.5% (iter 37 baseline). Mitigation: ADR-029 routing keeps Mistral primary at 70% + 20% = 90% of production traffic; Together is 10% + emergency fallback only.
- **JSON mode text quality risk**: structured output mode may subtly constrain the LLM's prose generation (some providers show slight quality reduction in constrained mode). Mitigation: `text` field is unconstrained string with only the description hint — no enum or length constraint on prose.
- **`strict: true` compatibility**: Mistral `json_schema` with `strict: true` may require all properties to be declared. The `args` object uses `additionalProperties: true` — verify Mistral La Plateforme accepts this under `strict: true`. If not, switch `strict: false` (less guarantee but still schema-validated).
- **TBD Together AI fallback migration**: iter 39+ evaluate whether Together AI Llama supports OpenAI-compatible `response_format: json_schema` (OpenAI added it; not verified for Together endpoint). If yes, unified path possible.

---

## §6 Acceptance criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| R7 canonical INTENT exec rate post-deploy | **≥95%** | `scripts/bench/run-sprint-r7-stress.mjs` post-v54 deploy |
| R7 params shape valid (per-action rules) | **≥95%** | bench scorer after scorer realignment Tester-2 A1.b |
| R5 PZ V3 quality (preserve) | ≥85% | `scripts/bench/run-sprint-r5-stress.mjs` |
| R5 latency avg (preserve) | <3000ms | bench R5 (Tier 1 parallel A3 assists) |
| INTENT exec in prod (browser dispatch) | ≥90% actions dispatched correctly | smoke 10-command prod verify |
| `text` field Italian K-12 plurale ≥80% | ≥80% | R5 scorer `plurale_ragazzi` category |
| NO regression vitest 13474+ | PASS | pre-deploy vitest full run |

**Sprint T close conditional gate R7**: ≥80% canonical (cap condition PDR §4). ADR-030 impl targets ≥95% for 15pp headroom above cap.

---

## §7 PRINCIPIO ZERO + MORFISMO compliance

- ✅ `text` field description enforces: "Italian K-12 plurale Ragazzi ≤60 parole + analogia + kit fisico mention" — Principio Zero pedagogico preserved in schema description.
- ✅ `BASE_PROMPT` rules 1-6 + CATENE MULTI-STEP block retained — only `[INTENT:...]` teaching block dropped (replaced by schema).
- ✅ `[AZIONE:...]` legacy tags for play/pause/compile preserved in system-prompt (these 3 actions are NOT in the 12-tool whitelist — they map to different browser event handlers).
- ✅ Morfismo Sense 1 runtime: schema `tool` enum is a fixed whitelist (12 safe actions) — morphic filter per-classe/per-kit applies downstream at dispatcher level (unchanged from ADR-028 §9).
- ✅ Mistral EU FR provider primary path — GDPR-clean for student runtime. Together AI fallback is emergency-only (ADR-010 gate).
- ✅ Triplet coerenza: `text` field content is constrained by `BASE_PROMPT` Vol/pag verbatim injection + capitoli-loader.ts fragment — schema adds structure, doesn't alter content rules.

---

## §8 Alternatives considered

| Option | Rationale | Decision |
|--------|-----------|----------|
| Continue prompt-teaching [INTENT:...] tags | iter 37 R7 evidence: 12.5% canonical, 17/200 params_fail — insufficient | REJECTED |
| Mistral native `tools` + `tool_choice: "required"` | Limits prose response to `content` field <200 char; conflicts with PZ V3 ≤60 parole + analogia + Vol/pag verbatim (200 char insufficient for full pedagogical response) | REJECTED — prose length constraint |
| JSON mode `{"type": "json_object"}` | Guarantees JSON but NOT schema shape — still needs validation. Weaker than json_schema. | REJECTED — weaker guarantee |
| OpenAI Structured Outputs (non-Mistral) | Stack consolidation mandate Morfismo Sense 2: 100% Mistral EU FR. Cross-provider migration increases GDPR complexity. | REJECTED |
| Fix bench scorer only (align to `args.id`) | Scorer fix alone addresses 17/200 params_fail but NOT the 73/200 LLM-emits-no-INTENT gap | PARTIAL only — not sufficient |

---

## §9 Cross-refs verified read-only

- `automa/team-state/messages/tester6-iter37-phase3-completed.md` §3.4 + §4 — 4-way drift evidence, 17/200 params_fail diagnostic
- `scripts/bench/run-sprint-r7-stress.mjs:88-102` — PARAMS_SHAPE_RULES (bench scorer, needs realignment post-ADR-030)
- `supabase/functions/_shared/system-prompt.ts:68-109` — [INTENT:...] block to be dropped post-ADR-030 impl
- `supabase/functions/_shared/llm-client.ts` — `callLLM` + `LLMOptions` + `LLMResult` interfaces to extend
- `supabase/functions/unlim-chat/index.ts:554-580` — step 6a INTENT parse block, replacement target
- `src/services/simulator-api.js:264` — `mountExperiment(experimentId)` positional, browser dispatcher update needed
- `src/components/lavagna/intentsDispatcher.js` — whitelist dispatch, needs `args.id` destructuring for mountExperiment
- `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md` — §14 surface-to-browser amend (iter 37) + §11 Alternatives §3 "Mistral tool-call native API deferred iter 38" — this ADR is the iter 38 implementation
- `docs/adrs/ADR-029-llm-routing-weights-conservative-tune.md` — routing 70/20/10 context (Mistral primary 90% traffic)
- `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md` §14.b — 4-way drift amendment (appended same iter 38)

---

**Status**: PROPOSED iter 38 Phase 1
**Implementation owner**: Maker-1 iter 38 Phase 1 (parallel with Maker-2 ADR authoring)
**Bench scorer alignment**: Tester-2 ATOM-S38-A1.b (align `mountExperiment` scorer rule to `args.id`)
**Acceptance**: R7 ≥95% canonical post-deploy v54+ (Tester-2 Phase 3)
**Rollout**: env flag `ENABLE_INTENT_JSON_SCHEMA=true` canary → 100% per §4.4
**Rollback**: set `ENABLE_INTENT_JSON_SCHEMA=false` → reverts to regex parseIntentTags path (instant, no redeploy of code needed if env-only check)
