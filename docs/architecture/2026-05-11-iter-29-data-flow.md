# ELAB Tutor — UNLIM Chat Data Flow
## Iter 29 Agent D — 2026-05-11

This document traces the complete request-response cycle through the
`unlim-chat` Edge Function. Each step is numbered and cross-referenced
to the actual source file and line range.

File under analysis:
`/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/unlim-chat/index.ts`

---

## High-Level Flow

```
Browser (useGalileoChat.js)
  │
  │  POST /functions/v1/unlim-chat
  │  Headers: Authorization: Bearer <anon-key>
  │           X-Elab-Api-Key: <32-hex>
  │  Body: ChatRequest JSON
  │
  v
Supabase Edge Function (Deno, V8 isolate)
  │
  ├─► [Step 1]  CORS preflight / health check GET
  ├─► [Step 2]  verifyElabApiKey (X-Elab-Api-Key custom header)
  ├─► [Step 3]  checkBodySize (DoS protection)
  ├─► [Step 4]  Body parse + validateSessionId (UUID format)
  ├─► [Step 5]  validateChatInput (message + sessionId + images)
  ├─► [Step 6]  checkRateLimitPersistent (30 req/min/session)
  ├─► [Step 7]  sanitizeMessage (prompt injection detection)
  ├─► [Step 8]  sanitizeCircuitState / validateExperimentId / validateMimeType
  ├─► [Step 9]  selectUnlimAiProfile (depth, context-aware)
  │
  │   PRE-LLM FAST-EXIT PATHS (return without calling LLM):
  ├─► [Step 10] VOLTAGE_DANGER_QUERY_RE test → hardcoded 9V safety response
  ├─► [Step 11] OFFTOPIC_QUERY_RE test → buildOfftopicGentleBridge (100ms race)
  ├─► [Step 12] buildDirectOperationalResponse → Arduino/Scratch template
  ├─► [Step 13] Consent check (CONSENT_MODE env)
  ├─► [Step 14] classifyPrompt() → 6-category pre-LLM classifier
  ├─► [Step 15] classifier off_topic → buildOfftopicGentleBridge (iter 25)
  │
  │   CONTEXT GATHERING (parallel):
  ├─► [Step 16] Promise.all:
  │   ├── loadStudentContext(sessionId)  → Supabase unlim_session_memory
  │   └── hybridRetrieve(message, topK) → pgvector + BM25 + RRF
  ├─► [Step 17] aggregateOnniscenza() (opt-in ENABLE_ONNISCENZA, conditional)
  ├─► [Step 18] getCapitoloByExperimentId() → buildCapitoloPromptFragment()
  │             OR inferCapitoloFromMessage() fallback
  │             OR buildCitazioneFragment(vol, cap) fallback
  │
  │   L2 TEMPLATE SHORT-CIRCUIT:
  ├─► [Step 19] selectTemplate() + executeTemplate() → return if match
  │
  │   LLM CALL:
  ├─► [Step 20] buildSystemPrompt(context + capitolo + RAG + onniscenza)
  ├─► [Step 21] routeModel() → model selection
  ├─► [Step 22] callLLM() with Promise.race 8s/12s timeout
  │             weighted: Mistral 70% / Gemini 25% / Together 5%
  │             callWithRetry: 3 attempts, exponential backoff, 4s budget
  ├─► [Step 23] callBrainFallback() if callLLM fails
  ├─► [Step 24] getSafetyHardcodedResponse() if chain fully exhausted + safety relevant
  │
  │   POST-LLM PROCESSING:
  ├─► [Step 25] Mistral structured output JSON parse (if useIntentSchema)
  ├─► [Step 26] parseIntentTags() OR preparsedIntents surface
  ├─► [Step 27] capWordsPreservingControlTags (≤120 visible words)
  ├─► [Step 28] enforceItalianK12Opener ("Ragazzi," prefix enforcement)
  ├─► [Step 29] rewriteCitationToCanonical (Vol.X pag.Y format)
  ├─► [Step 30] forceCitationFromQuery (inject Vol/pag if message mentions it)
  ├─► [Step 31] forceCitationFromSession (inject from studentContext.lastExperimentId)
  ├─► [Step 32] validatePrincipioZero (12 runtime rules)
  │
  │   PERSISTENCE (non-blocking):
  ├─► [Step 33] saveInteraction() → unlim_session_memory (upsert last-N row)
  ├─► [Step 34] saveMessageHistory() → unlim_message_history (append-only)
  │
  │   RESPONSE ASSEMBLY:
  └─► [Step 35] Return ChatResponse JSON
                { success, response, source, audio?, intents_parsed?, prompt_class?, ... }

Browser (useGalileoChat.js)
  ├── Appends response to messages[]
  ├── Calls executeServerIntents(intents_parsed, __ELAB_API)
  └── intentsDispatcher dispatches whitelisted actions to __ELAB_API
```

---

## Detailed Step-by-Step

### Step 1: CORS + Health Check
```
File: unlim-chat/index.ts:127-145

OPTIONS → 204 (CORS preflight, getCorsHeaders(req) dynamic per-request)
GET     → 200 { status:'ok', version:'2.1.0', uptimeSeconds, metrics }
Other   → 405

CORS policy: dynamic per-origin via getCorsHeaders() in _shared/guards.ts
Security headers: applied via getSecurityHeaders(req)
```

### Step 2: X-Elab-Api-Key Verification
```
File: unlim-chat/index.ts:154-165
Shared: _shared/guards.ts verifyElabApiKey()

Custom header X-Elab-Api-Key must match ELAB_API_KEY env var.
Fail-open: if ELAB_API_KEY not set, passes (backward-compat rollout).
Returns 401 if key present but wrong (apiKeyCheck.ok === false).

Key rotated iter 32 (previous key leaked in docs, new: 32-byte hex openssl rand).
```

### Step 3: Body Size Check
```
File: unlim-chat/index.ts:167-169
Shared: _shared/guards.ts checkBodySize()

Max body size enforced (DoS protection).
Multimodal requests: BODY_SIZE_MULTIMODAL (larger limit).
```

### Step 4: Body Parse + Session Validation
```
File: unlim-chat/index.ts:172-198

JSON parse ChatRequest body.
Destructure: message, sessionId, circuitState, experimentId,
             simulatorContext, images, aiProfile, aiDepth, unlimMode.
Debug extensions: debug_retrieval, retrieval_mode, top_k (1-20).

validateSessionId(sessionId): UUID format check.
Returns 400 if invalid format.
```

### Step 5: Input Validation
```
File: unlim-chat/index.ts:192-198
Shared: _shared/guards.ts validateChatInput()

Validates: message length (non-empty, max chars), sessionId, images array.
Returns 400 with descriptive error on validation failure.
```

### Step 6: Rate Limiting
```
File: unlim-chat/index.ts:200-210
Shared: _shared/guards.ts checkRateLimitPersistent()

Limit: 30 req/min per sessionId.
Storage: Supabase DB (persistent) with in-memory fallback.
Returns 429 "Stai andando troppo veloce! Aspetta qualche secondo."
```

### Step 7: Prompt Injection Sanitization
```
File: unlim-chat/index.ts:212-223
Shared: _shared/guards.ts sanitizeMessage()

Detects prompt injection patterns.
If not safe: returns sanitized response directly (bypass LLM, source: 'guard').
If safe: returns cleaned message (safeMessage) for downstream use.
```

### Step 8: Additional Sanitization
```
File: unlim-chat/index.ts:225-244

sanitizeCircuitState(): strips injected fields from circuit state.
validateExperimentId(): format check for experimentId.
validateMimeType(): allowlist check for image MIME types.
selectUnlimAiProfile(): determines depth ('total'/'compact') from context.
  - hasImages → vision profile
  - requestedProfile / requestedDepth → explicit override
  - experimentId → experiment-context profile
```

### Step 9: AI Profile Selection
```
File: unlim-chat/index.ts:237-244
Shared: _shared/unlim-ai-profiles.ts selectUnlimAiProfile()

Determines activeAiProfile.depth:
  'total'   → more context, Gemini Flash (not Flash-Lite), maxTokens 520
  'compact' → fast response, maxTokens 240 (default)

Also sets activeAiProfile.id for audit trail in response.
```

### Step 10: Voltage Danger Pre-LLM Block
```
File: unlim-chat/index.ts:246-269

VOLTAGE_DANGER_QUERY_RE = /\b(220\s*[Vv]|110\s*[Vv]|tensione\s+di\s+rete|
  presa\s+(di\s+corrente|a\s+muro|elettrica)|...)\b/i

If matches:
  - Hardcoded Italian safety response: "Ragazzi, attenzione: 220V casa è
    pericoloso per ragazzi 8-14 anni. Sul kit ELAB usate sempre la batteria 9V..."
  - saveInteraction() + saveMessageHistory() (non-blocking)
  - Returns 200 { source: 'safety-pre-llm', safety_fires: ['voltage_danger'] }
  - Zero LLM call, zero RAG, zero DB read

GDPR justification: GDPR Art. 8 + D.Lgs. 101/2018 — never 503 vuoto for
safety-relevant queries to minors 8-14 years.
```

### Step 11: Off-Topic Regex Pre-LLM Block (Legacy)
```
File: unlim-chat/index.ts:271-324

OFFTOPIC_QUERY_RE: covers math, sport (Inter/Juventus/...), cinema, music,
geography, history, Marvel/Disney, TikTok, video games, politicians.
Expanded iteratively: iter 20 (sport), iter 22 (math operators + capitals
+ guerra mondiale + teorema + Marvel/Disney).

If matches:
  - loadStudentContext() with 100ms Promise.race timeout (hot-path -200ms)
  - Detect type: isSport / isMath / isHistory / isCulture
  - Build 3-part response: acknowledge + bridge + recall (lastExperimentId if known)
  - enforce citation chain on the result
  - Returns 200 { source: 'offtopic-pre-llm', safety_fires: ['off_topic'] }
```

### Step 12: Direct Operational Short-Circuit
```
File: unlim-chat/index.ts:327-359
Shared: _shared/operational-response.ts buildDirectOperationalResponse()

Matches Arduino/Scratch/compiler command patterns ("compile", "carica sketch",
"apri editor Scratch", etc.) → returns deterministic Italian template response
with [AZIONE:compile] or [AZIONE:openeditor] tags.

Post-processing: also runs enforcer + forceCitation chain so operational
responses are not citation-bare (iter 20 P0 BUG FIX).
```

### Step 13: Consent Check
```
File: unlim-chat/index.ts:361-393
Shared: _shared/memory.ts checkConsent()

CONSENT_MODE env (default: 'soft'):
  'off'    → skip entirely
  'soft'   → block if revoked, log if unknown (warn), pass if unknown
  'strict' → block if not explicitly 'granted'

Checks parental_consents table by sessionId.
Returns 403 on revoke or strict-mode unknown.
```

### Step 14: Pre-LLM Classifier
```
File: unlim-chat/index.ts:408
Shared: _shared/onniscenza-classifier.ts classifyPrompt()

6 categories (regex + word count, no LLM call):
  'chit_chat'        → word count <8 OR greeting → topK:0, skipOnniscenza:true
  'deep_question'    → ≥20 words + '?' → topK:3
  'safety_warning'   → pericolo|brucia|scossa|... → topK:3 (mandatory)
  'citation_vol_pag' → Vol.X / pag.Y mention → topK:2
  'plurale_ragazzi'  → \bragazz[ie]\b → topK:2
  'off_topic'        → offtopic patterns classifier expanded
  default            → topK:3 (safer fallback)

Used to: gate Onniscenza aggregator, set RAG topK.
Returns: { category, skipOnniscenza, topK, wordCount, offtopicType? }
```

### Step 15: Classifier Off-Topic Bridge
```
File: unlim-chat/index.ts:416-448
Shared: _shared/offtopic-template-response.ts buildOfftopicGentleBridge()

If promptClass.category === 'off_topic':
  Load student context with 100ms race (same as Step 11).
  Build gentle bridge based on offtopicType.
  Apply forceCitation chain (iter 28 H6 fix — was previously skipping).
  Returns 200 { source: 'offtopic-template-iter25' }

Note: Steps 11 and 15 can BOTH match off-topic queries. Step 11 fires first
(legacy inline regex). Step 15 catches cases the legacy regex misses
(cooking, translation, celebrity, extended patterns). Double-fire impossible
because Step 11 returns early.
```

### Step 16: Parallel Context Gathering
```
File: unlim-chat/index.ts:478-506

ragTopK = Math.max(2, Math.min(3, promptClass.topK || 3))

Promise.all([
  loadStudentContext(sessionId),   // Supabase unlim_session_memory REST ~250ms
  buildRagPromise(),               // hybridRetrieve + 2s timeout race
])

buildRagPromise():
  If promptClass.skipOnniscenza → resolve(null) immediately
  Else: hybridRetrieve(message, topK, { source: vol_from_experimentId })
        with 2s Promise.race timeout
        On timeout: logs 'rag_hybrid_error', returns null (never fails hard)

hybridRetrieve() in _shared/rag.ts:
  1. BM25 via pg FTS: to_tsvector('italian', ...) ts_rank_cd
  2. Dense cosine: pgvector <=> operator on embedding(1024)
  3. RRF fusion k=60: score = sum(1 / (k + rank_i))
  4. Italian synonym expansion (80+ entries in SYNONYM_MAP)
  5. Returns top-N chunks with {id, source, chapter, page, score, mode}
```

### Step 17: Onniscenza 7-Layer Aggregator (Conditional)
```
File: unlim-chat/index.ts:508-574
Shared: _shared/onniscenza-bridge.ts aggregateOnniscenza()

Gated: ENABLE_ONNISCENZA=true env AND !promptClass.skipOnniscenza

7 layers fused via RRF k=60:
  L1: RAG pgvector (disabled here — already done in Step 16)
  L2: Wiki concepts (100 markdown files, Voyage embeddings)
  L3: Tea Glossario (180 termini, 3 volumi)
  L4: Class memory (Supabase unlim_session_memory recent patterns)
  L5: Vision snapshot (last captureScreenshot if available)
  L6: Chat history (last 5 messages from unlim_message_history)
  L7: Analogia match (pre-indexed analogy corpus)

loadRecentHistory(sessionId, 5): loads last 5 messages for L6.
Returns onniscenzaSnapshot: { fused: [{layer, text, source, score}] }

onniTopK from classifier: 2 for citation/plurale, 3 for deep/safety/default.
```

### Step 18: Capitolo Fragment Assembly
```
File: unlim-chat/index.ts:577-627

If safeExperimentId present:
  getCapitoloByExperimentId(experimentId) → lookup in capitoli.json (37 chapters)
  buildCapitoloPromptFragment(capitolo, experimentId)
  → injects: testo_classe (class-level text), citazioni_volume (VERBATIM),
             analogies_classe, esperimenti list

If no capitolo fragment (experimentId absent or lookup miss):
  inferCapitoloFromMessage(message) → regex Vol.X cap.Y extraction
  buildCitazioneFragment(vol, cap) → 30 hardcoded core chapters with bookText
    OR buildCapitoloSummaryFragment(inferred) as further fallback

Rationale: 37-chapter JSON static knowledge pack reliably injects Vol/pag
verbatim citations. Dynamic RAG was previously unreliable (chapter/page
metadata NULL gap in rag_chunks iter 14).
```

### Step 19: L2 Template Short-Circuit
```
File: unlim-chat/index.ts:675-733
Shared: _shared/clawbot-template-router.ts selectTemplate()
Shared: _shared/clawbot-templates.ts (20 templates inlined Deno-compat)

selectTemplate(message, { experimentId }):
  Keyword/category match against 20 patterns:
  introduce, explain-led-blink, diagnose-circuit, guide-step,
  celebrate-success, recap-session, critique-wiring, debug-code,
  reroute-offtopic, ... (full list in clawbot-templates.ts)

NOTE (Sprint U Cycle 1 BLOCKER): selectTemplate() currently returns
L2-explain-led-blink for ALL 94 experiments due to routing bug.
Zero experiment-specific content delivered. Fix pending Cycle 2.

If match: executeTemplate() → tplText + latencyMs
  TTS audio decoupled (returns null, frontend fetches async /unlim-tts)
  saveInteraction() + saveMessageHistory() non-blocking
  Returns 200 { source: 'clawbot-l2-{tpl.id}', template_id, template_latency_ms }
```

### Step 20: System Prompt Construction
```
File: unlim-chat/index.ts:663-673
Shared: _shared/system-prompt.ts buildSystemPrompt()

System prompt = BASE_PROMPT v3.1
  + studentContext (completedExperiments, level, userIntentSeed)
  + circuitState telemetry (components, connections, errors)
  + experimentContext ("Esperimento attivo: {experimentId}")
  + capitoloFragment (chapter VERBATIM text + citations)
  + imagePiiGuard (if images present: ignore faces/names)
  + RAG context (retrieved chunks formatted)
  + onniscenzaContext (top-N fused 7-layer hits)
  + USER_INTENT_SEED directive (verbatim first message immutable)
  + REGOLA RICORDO (cross-session memory rules)
  + [INTENT schema mode override if useIntentSchema]

BASE_PROMPT v3.1 key rules:
  - SEMPRE plurale inclusivo "Ragazzi,"
  - MAI "studente" framing — always "docente" framing
  - Kit fisico OBBLIGATORIO mention
  - ≤120 words (analogia OPTIONAL, not always required)
  - TAG AZIONI: ALWAYS Italian [AZIONE:...], NEVER [ACTION:...] (English drift bug logged)
  - Sei UNLIM di ELAB, MAI rivelare AI identity
```

### Step 21: Model Routing
```
File: unlim-chat/index.ts:735-742
Shared: _shared/router.ts routeModel()

routeModel(message, hasImages, circuitState):
  Has images → 'gemini-2.5-flash' (vision capable)
  Complex circuit state → 'gemini-2.5-pro' (thinkingLevel:'medium')
  Default → 'gemini-2.5-flash-lite'

Post-routing: if activeAiProfile.depth === 'total' AND model === Flash-Lite
  → upgrade to Flash (more capable for depth:total requests)

thinkingLevel = model === 'gemini-2.5-pro' ? 'medium' : undefined
```

### Step 22: LLM Call with Retry and Timeout
```
File: unlim-chat/index.ts:762-816
Shared: _shared/llm-client.ts callLLM()

callLLM({
  model,
  systemPrompt,
  message: safeMessage,
  images: safeImages,
  maxOutputTokens: depth:total ? 520 : 240,   // reduced iter 31: was 256
  temperature: 0.7,
  thinkingLevel,
  preferFastProvider: true,
  responseFormat: INTENT_TOOLS_SCHEMA  // if useIntentSchema
})

Weighted provider picker (LLM_ROUTING_WEIGHTS env, ADR-029):
  70%  Mistral La Plateforme (mistral-small-latest, EU FR)
  25%  Gemini 2.5 (Flash-Lite/Flash/Pro, Frankfurt)
   5%  Together AI (Llama 3.3 70B, US, gated)

callWithRetry per-provider:
  maxAttempts: 3
  baseDelayMs: 300ms
  factor: 2 (exponential)
  totalBudgetMs: 4000ms
  Retriable: 5xx, 429, TypeError (network), AbortError (timeout)
  Fail-fast: 4xx auth/validation

LLM cap timeout: Promise.race
  default: 8000ms
  schema/vision/thinking: 12000ms (iter iter 29 2026-05-10 fix)

Structured output parse (iter 38 A7, if useIntentSchema):
  If result.text starts with '{':
    JSON.parse → { text, intents? }
    Filter intents to CANONICAL_INTENT_TOOLS whitelist
    preparsedIntents = filtered intents
```

### Step 23: Brain Fallback Chain
```
File: unlim-chat/index.ts:817-893
Shared: _shared/gemini.ts callBrainFallback()

If callLLM throws (all providers failed OR 8/12s timeout):
  result = await callBrainFallback(message, systemPrompt)
  → tries Gemini 2.5 Flash direct
  → then Brain VPS (Qwen3.5 1.9B, 72.60.129.50:11434)

If result still null after fallback:
  ITER27_SAFETY_BROAD_RE test (scossa/brucia/pericolo/ferito/...)
  If safety-relevant:
    safetyFallback = getSafetyHardcodedResponse('voltage_danger')
    saveInteraction + saveMessageHistory (non-blocking)
    Returns 200 { source: 'safety-hardcoded-fallback-iter27' }
  Else:
    Returns 200 { source: 'llm-fallback-empty', response: generic Italian error }
```

### Step 24-25: Mistral Structured Output Handling
```
File: unlim-chat/index.ts:795-816

If useIntentSchema AND result.text starts with '{':
  JSON.parse the structured output
  Extract prose text + filter intents to CANONICAL_INTENT_TOOLS
  preparsedIntents stored for Step 26

If parse fails: log 'intent_schema_parse_fallback', continue to legacy regex.
```

### Step 26: Intent Tag Parsing
```
File: unlim-chat/index.ts:904-945
Shared: _shared/intent-parser.ts parseIntentTags()

parsedIntents from either:
  a) preparsedIntents (Mistral structured output path, iter 38)
  b) parseIntentTags(cappedText): regex /\[INTENT:(\{[\s\S]*?\})\]/g
     non-greedy, defensive JSON.parse per match
     Returns IntentTag[]: { tool: string, args: Record<string, unknown> }

stripIntentTags(text): removes [INTENT:{...}] from display text.
cappedText used for display/TTS.
```

### Step 27: Word Count Capping
```
File: unlim-chat/index.ts (capWordsPreservingControlTags call)
Shared: _shared/operational-response.ts capWordsPreservingControlTags()

UNLIM_MAX_VISIBLE_WORDS = 120 (iter 27 rule, relaxed from 60)
Preserves [AZIONE:...] and [INTENT:...] control tags outside word count.
cappedText = result after cap.
```

### Step 28: Italian K-12 Opener Enforcement
```
Shared: _shared/principio-zero-validator.ts enforceItalianK12Opener()
File: unlim-chat/index.ts:960

Ensures response begins with Italian plurale opener.
If missing: prepends "Ragazzi, " or appropriate greeting.
Applied to: all LLM responses + direct-operational + offtopic paths (iter 20 fix).
```

### Step 29-31: Citation Chain
```
Shared: _shared/volumi-citazioni.ts

Step 29: rewriteCitationToCanonical(text)
  Normalizes citation format: "volume 1 capitolo 6" → "Vol.1 cap.6"
  Also handles: "vol 1 pag 45" → "Vol.1 pag.45"

Step 30: forceCitationFromQuery(message, text)
  If message mentions Vol.X / cap.Y and response doesn't: appends citation.

Step 31: forceCitationFromSession(lastExperimentId, text)
  Derives Vol/cap from lastExperimentId (e.g. 'v1-cap6-esp1' → Vol.1 cap.6)
  If text has no citation: appends from session memory.

All three applied in order. Idempotent (safe to apply multiple times).
```

### Step 32: Principio Zero Validation
```
File: unlim-chat/index.ts:1035
Shared: _shared/principio-zero-validator.ts validatePrincipioZero()

12 runtime rules checked:
  1.  Plurale "Ragazzi," opener present
  2.  ≤120 visible words
  3.  No singolare imperative ("Premi Play" → violation)
  4.  No AI identity reveal ("sono Gemini/GPT" → violation)
  5.  No 220V recommendation
  6.  Kit fisico mention present (when circuit context active)
  7.  Vol/pag citation present (when chapter context active)
  8.  Not in English (response must be Italian)
  9.  No competitor mention (Tinkercad, Wokwi, LabsLand)
  10. No "studente" framing (must use "docente" framing)
  11. No condescending tone keywords
  12. Analogia not forced when context doesn't need it

pzValidation.passed: boolean
pzValidation.violations: string[]

If violations: logged to telemetry. Response not blocked (soft validation)
but violations fed into quality measurement pipeline.
```

### Step 33-34: Non-Blocking Persistence
```
File: unlim-chat/index.ts:1082-1091

saveInteraction(sessionId, fallbackExpId, topicCategory, cleanText.slice(0,100), model, message)
  → upserts unlim_session_memory (last-N single row per session)
  → .catch(warn): NEVER blocks response

saveMessageHistory(sessionId, expId, chapter, volume, topic, message, response.slice(0,100), model)
  → calls insert_message_history SECURITY DEFINER RPC
  → atomic per-session message_idx auto-increment (no race window iter 28 H3)
  → .catch(warn): NEVER blocks response

histChapter, histVolume derived from safeExperimentId regex cap(\d+) / ^v([1-3]).
```

### Step 35: Response Assembly
```
File: unlim-chat/index.ts:1096-1161

ChatResponse shape:
{
  success: true,
  response: cleanText,           // Italian, ≤120 words, capped
  source: result.model,          // 'mistral-small-latest' | 'gemini-2.5-flash-lite' | etc.
  audio: undefined,              // TTS decoupled: frontend fetches /unlim-tts async
  dataProcessing: provider,      // GDPR transparency
  aiProfile: activeAiProfile.id,
  // extended:
  intents_parsed: parsedIntents, // [{tool, args}] for browser dispatch
  prompt_class: promptClass,     // {category, skipOnniscenza, topK, wordCount}
  safety_fires: [],              // empty on normal LLM path
  debug_chunks: [],              // only when debug_retrieval=true
}

Returns 200 with security headers (getSecurityHeaders(req)).
```

---

## Source Classification by Returned `source` Field

| source value | Meaning |
|-------------|---------|
| `safety-pre-llm` | voltage_danger regex hit before LLM |
| `offtopic-pre-llm` | legacy OFFTOPIC_QUERY_RE hit |
| `offtopic-template-iter25` | classifier off_topic category hit |
| `operational-arduino` / `operational-scratch` | buildDirectOperationalResponse match |
| `guard` | prompt injection detected |
| `clawbot-l2-{tpl.id}` | L2 template match (e.g. `clawbot-l2-explain-led-blink`) |
| `mistral-small-latest` | Mistral La Plateforme primary |
| `gemini-2.5-flash-lite` | Gemini Flash-Lite primary |
| `gemini-2.5-flash` | Gemini Flash (depth:total or vision) |
| `gemini-2.5-pro` | Gemini Pro (complex circuit) |
| `together-llama` | Together AI gated fallback |
| `brain-fallback` | Brain VPS Qwen3.5 |
| `safety-hardcoded-fallback-iter27` | Full chain exhausted + safety query |
| `llm-fallback-empty` | Full chain exhausted, non-safety |

---

## Timing Budget Analysis

```
Typical fast path (chit_chat, no RAG, Mistral 70%):
  Steps 1-9  :   ~5ms    (sync validation, no DB)
  Step 10-15 :   ~5ms    (regex + classifier, no DB)
  Step 16    :   250ms   (loadStudentContext, skipOnniscenza=true → ragPromise=null)
  Steps 18-20:   ~10ms   (capitolo JSON lookup, prompt build)
  Step 22    :   ~2500ms (Mistral call p50)
  Steps 26-32:   ~5ms    (post-processing sync)
  Steps 33-34:   0ms     (non-blocking .catch fire-and-forget)
  Total p50  :   ~2775ms

Typical deep path (deep question, RAG + Onniscenza, Gemini 25%):
  Steps 1-15 :   ~10ms
  Step 16    :   max(250ms, 2000ms) = 2000ms  (parallel loadContext + hybridRetrieve)
  Step 17    :   +500-1000ms  (aggregateOnniscenza 7-layer)
  Steps 18-20:   ~10ms
  Step 22    :   ~4000ms (Gemini Flash p50 under load)
  Total p50  :   ~6000ms

p95 observed (iter 37): ~10096ms
Timeout cap: 8000ms (standard) / 12000ms (vision/schema/thinking)
```

---

## Key Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `ELAB_API_KEY` | Custom auth header secret | unset (fail-open) |
| `LLM_ROUTING_WEIGHTS` | Provider weights JSON | `{"mistral":70,"gemini":25,"together":5}` |
| `ENABLE_ONNISCENZA` | 7-layer aggregator opt-in | `false` |
| `ENABLE_INTENT_TOOLS_SCHEMA` | Mistral structured output | `false` |
| `CONSENT_MODE` | GDPR consent enforcement | `soft` |
| `TOGETHER_API_KEY` | Together AI key | required if together in routing |
| `MISTRAL_API_KEY` | Mistral La Plateforme | required |
| `GEMINI_API_KEY` | Gemini primary | required |
| `SUPABASE_URL` | Supabase project URL | required |
| `SUPABASE_SERVICE_ROLE_KEY` | DB access (bypasses RLS) | required |
| `VPS_TTS_URL` | VPS TTS server | `http://72.60.129.50:8880/tts` |
| `DISABLE_VOXTRAL_TTS` | Skip Voxtral primary | `0` (enabled) |
| `DISABLE_EDGE_TTS` | Skip Edge TTS fallback | `0` (enabled) |

---

*Generated by Agent D iter 29, 2026-05-11. Source: READ-ONLY analysis of
`supabase/functions/unlim-chat/index.ts` and `supabase/functions/_shared/`.*
