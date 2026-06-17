# Sprint T iter 35 — Orchestrazione Coherence Audit

**Date**: 2026-04-30
**Author**: Backend architecture audit (post Gemini Vision wire-up)
**Scope**: verify cohesive integration of Onniscenza 7-layer + ClawBot L1/L2 + LLM call + system prompt + dispatcher
**Anti-inflation (G45)**: terms used are "wired" / "scaffolded" / "in valutazione" — NO "perfect" claims without measurement. Score not assigned in this doc — audit is binary per-gap.

## 1. Files audited

| File | LOC | Role in pipeline |
|---|---|---|
| `supabase/functions/unlim-chat/index.ts` | 577 | Main entry — request handler, orchestration spine |
| `supabase/functions/_shared/system-prompt.ts` | ~440 | BASE_PROMPT v3.2 + `buildSystemPrompt` assembler |
| `supabase/functions/_shared/onniscenza-bridge.ts` | 389 | 7-layer aggregator + RRF k=60 fusion |
| `supabase/functions/_shared/clawbot-template-router.ts` | 301 | L2 template selection + execution (pre-LLM short-circuit) |
| `scripts/openclaw/composite-handler.ts` | 24,627 bytes | L1 composite dispatch (sequential tools, browser-side) |
| `scripts/openclaw/dispatcher.ts` | 12,904 bytes | 62-tool ToolSpec dispatcher (browser-side only currently) |
| `supabase/functions/_shared/gemini-vision.ts` | NEW iter 35 | Vision primary (Gemini 2.5 Flash EU Frankfurt) |
| `supabase/functions/unlim-vision/index.ts` | MODIFIED iter 35 | Vision Edge Function — Gemini primary + Pixtral fallback |

## 2. Current request flow (text path) — `POST /unlim-chat`

```
client (LIM/iPad)
  │
  │ POST { message, sessionId, circuitState, experimentId, images? }
  │ headers: X-Elab-Api-Key
  ▼
[A] verifyElabApiKey + checkBodySize + validateChatInput
  │
  ▼
[B] checkRateLimitPersistent (30/min/session)
  │
  ▼
[C] sanitizeMessage (prompt-injection guard) → safeMessage
    sanitizeCircuitState → safeCircuitState
    validateExperimentId → safeExperimentId
  │
  ▼
[D] checkConsent (GDPR — strict|soft|off)
  │
  ▼
[E] loadStudentContext(sessionId)  ← Supabase student_memory
  │
  ▼
[F] RAG retrieval — TWO MODES (toggle env RAG_HYBRID_ENABLED + req param):
    F1. hybrid: hybridRetrieve(safeMessage, topK)  — BM25 + dense + RRF k=60
    F2. dense:  retrieveVolumeContext(safeMessage, safeExperimentId, 3)
    OUTPUT: ragContext (string formatted) + retrievedChunksDebug[]
  │
  ▼
[G] Onniscenza 7-layer (opt-in env ENABLE_ONNISCENZA=true):
    aggregateOnniscenza({ query, experiment_id, session_id, history, supabase })
    Returns OnniscenzaSnapshot { fused: LayerHit[], raw: per-layer, layers: status }
    Top-3 fused hits → onniscenzaContext string
  │
  ▼
[H] Capitolo fragment:
    getCapitoloByExperimentId(safeExperimentId) → buildCapitoloPromptFragment
  │
  ▼
[I] systemPrompt = buildSystemPrompt(studentContext, safeCircuitState, experimentContext, capitoloFragment)
                 + ragContext
                 + onniscenzaContext           ← Onniscenza inject (iter 31)
                 + imagePiiGuard
  │
  ▼
[J] CLAWBOT L2 SHORT-CIRCUIT (iter 26):
    selectTemplate(safeMessage, { experimentId })
      ├─ MATCH → executeTemplate({ ragRetrieve: hybridRetrieve })
      │         → return early with [AZIONE:tool:args] tags + speakTTS text
      │         → source: clawbot-l2-<id>
      └─ NO MATCH → continue to LLM
  │
  ▼
[K] routeModel(safeMessage, hasImages, safeCircuitState) → model name
  │
  ▼
[L] callLLM({ model, systemPrompt, message, images, maxOutputTokens=256, temperature=0.7 })
      provider chain: Together (default) → Gemini → Brain (last)
  │
  ▼
[M] capWords(result.text, 60) → cappedText
  │
  ▼
[N] validatePrincipioZero(cappedText)  ← post-LLM PZ validation (warn-only, never rejects)
  │
  ▼
[O] saveInteraction(sessionId, ...) — async non-blocking
  │
  ▼
[P] return { success, response: cappedText, source, dataProcessing }
    audio: undefined  ← TTS now decoupled (iter 34 latency fix)
    debug_retrieval: chunks[] (when debug_retrieval=true)
```

## 3. Current request flow (vision path) — `POST /unlim-vision`

```
client → POST { prompt, images[base64|url], sessionId }
  │
  ▼
[A] body validation (prompt + images[] required, max 4)
  │
  ▼
[B] callVisionChain (iter 35 NEW):
    B1. tryGeminiFirst = (provider != 'pixtral') && all-base64 && images.length === 1
        └─ synthesizeGeminiVision({ imageBase64, prompt, timeoutMs=5000 })
           ├─ ok=true  → return { provider: 'gemini-2.5-flash', dataProcessing: 'google-gemini-eu-frankfurt' }
           └─ ok=false → log warn → fall through to Pixtral
    B2. Pixtral fallback (or primary when Gemini skipped):
        callMistralChat({ model: 'pixtral-12b-2409', images, maxOutputTokens=200 })
        → return { provider: 'pixtral-12b', dataProcessing: 'mistral-eu-fr' }
  │
  ▼
[C] return { success, response, model, provider, latencyMs }
    headers: X-Vision-Provider: <provider>
```

## 4. Coupling check — Layer-by-layer cohesion

### 4.1 Onniscenza output → LLM prompt (PARTIAL — iter 31 wire-up shipped)

| Path | Status | Note |
|---|---|---|
| `aggregateOnniscenza` invoked when `ENABLE_ONNISCENZA=true` env set | wired (iter 31) | `unlim-chat/index.ts:291-333` |
| Snapshot.fused top-3 → `onniscenzaContext` string | wired | Lines 370-382 |
| `onniscenzaContext` injected into final `systemPrompt` | wired | Line 384-387 |
| **L4 sessione + L6 history actually populated** | gap | `history: []` hardcoded line 322 — caller never injects real chat history |
| **L7 onthefly circuit_state passed** | gap | `circuit_state` not passed to `aggregateOnniscenza` (caller has `safeCircuitState` available) |
| `safeSessionId` referenced line 321 | bug | Variable name mismatch: only `sessionId` is in scope. Will throw `ReferenceError` at runtime when `ENABLE_ONNISCENZA=true` |

### 4.2 ClawBot L2 template → RAG retrieval (WIRED — iter 26)

| Path | Status |
|---|---|
| `selectTemplate(safeMessage, { experimentId })` runs pre-LLM | wired |
| `executeTemplate` accepts `ragRetrieve` callback → calls `hybridRetrieve(q, k, {})` | wired |
| Citation extracted from RAG result top hit (vol/page/verbatim) | wired |
| Falls through to LLM on no match or template error | wired (defensive try/catch) |
| **L2 templates NOT informed by Onniscenza snapshot** | gap | template selector only sees query + experimentId; ignores L4 sessione, L6 history that the LLM path receives |

### 4.3 ClawBot L1 composite + 62-tool dispatcher (NOT WIRED post-LLM)

| Path | Status |
|---|---|
| `composite-handler.ts` exports `executeComposite(name, args, dispatcher)` | scaffolded |
| `dispatcher.ts` 62 ToolSpec registry | scaffolded (ToolSpec count verified file-system grep = 62, NOT 52 as docs say) |
| `composite-handler.test.ts` 5/5 PASS | tests green |
| **Edge Function calls dispatcher post-LLM** | gap | `unlim-chat/index.ts` extracts `[AZIONE:tool:args]` tags ONLY via L2 template emission — LLM-emitted tool calls (the actual 62-tool surface) are NOT parsed/dispatched server-side. Client-side `useGalileoChat.js` parses tags for browser tools, but server has no equivalent. |
| **L1 composite invoked post-LLM for `[INTENT:{...}]` JSON** | gap | LLM can emit INTENT JSON per system prompt but unlim-chat does not parse + execute composites; only client tag-relay |

### 4.4 LLM call → Onniscenza/RAG (ONE-WAY only)

| Path | Status |
|---|---|
| Onniscenza output flows INTO `systemPrompt` before LLM | wired |
| LLM tool-use response triggers second-stage Onniscenza re-query | gap | No "post-LLM tool-call → re-retrieve" loop; LLM output is a single shot, no iterative refinement |
| LLM output parsed for citations, validated against actually-injected RAG chunks | gap | `validatePrincipioZero` checks word patterns (e.g. "Vol.X pag.Y") but does NOT cross-reference whether the cited Vol/page is one of `retrievedChunksDebug` — hallucinated citations pass |

### 4.5 Vision (iter 35 NEW) → text chat (DECOUPLED)

| Path | Status |
|---|---|
| Vision Edge Function returns text response | wired |
| Vision response surface-able via `images` field on `unlim-chat` POST | wired (Pixtral path; Gemini path on text/chat is via `gemini.ts`, not gemini-vision.ts) |
| **Vision result passed back as L5_vision layer input to Onniscenza on the next turn** | gap | No persistence of vision findings to session memory → next turn starts cold |

## 5. Five gaps where output NOT cross-pollinating + recommended P0 fixes (specs only, NO code)

### Gap 1 — `safeSessionId` ReferenceError when ENABLE_ONNISCENZA=true (P0 BUG)

**Location**: `unlim-chat/index.ts:321`
**Symptom**: `session_id: safeSessionId` references an undefined variable. The local scope has `sessionId` (raw from body) but no `safeSessionId`. Currently masked because `ENABLE_ONNISCENZA` is opt-in and likely off in prod, but the moment Andrea flips the flag this throws and skips the entire Onniscenza branch (try/catch swallows it, snapshot stays null → no inject).

**P0 fix spec**:
- Either rename to `sessionId` (raw form is OK — already validated by `validateSessionId` upstream),
- OR add a `safeSessionId = validateSessionId(sessionId) ? sessionId : ''` line above to make the intent explicit.
- Add a unit test: `tests/unit/unlim-chat-onniscenza-flag.test.js` that toggles `ENABLE_ONNISCENZA=true` env and asserts no ReferenceError + snapshot is non-null.

### Gap 2 — L6 chat history hardcoded empty (P0 SEMANTIC)

**Location**: `unlim-chat/index.ts:322` — `history: []`
**Symptom**: The Onniscenza spec at `onniscenza-bridge.ts:227-246` has L6 LIVE expecting `input.history`. The caller passes empty array, so L6 always returns no hits. This breaks the "incrocio 7-layer" promise — the LLM never sees what was just discussed.

**P0 fix spec**:
- Extend `ChatRequest` type with optional `history?: Array<{role: 'user'|'assistant', content: string}>` (last 10 turns).
- Client (`useGalileoChat.js`) injects `messages.slice(-10)` on each POST.
- Server passes through to `aggregateOnniscenza({ history, ... })` after PII redaction (no names/emails in history strings).
- Document in ADR a 10-turn rolling cap to bound prompt size (~500 tokens worst case).

### Gap 3 — L7 circuit_state not piped to aggregator (P1)

**Location**: `unlim-chat/index.ts:318-325`
**Symptom**: `safeCircuitState` is computed at line 189 (sanitized for the LLM prompt) but never passed to `aggregateOnniscenza`. L7 onthefly fetcher checks `input.circuit_state` and returns empty without it. Result: live wire/component diagnostics never surface as a separate retrievable layer.

**P0 fix spec**:
- Add `circuit_state: safeCircuitState` to the `aggregateOnniscenza` argument object.
- Update `fetchL7Onthefly` to project a meaningful summary (component count + experiment ID + active wires) instead of the current STUB string.
- Bench: pre/post comparison on 5 prompts about "il LED non si accende" — measure if Onniscenza top-3 includes circuit context post-fix.

### Gap 4 — L2 template selection ignores Onniscenza signals (P1 ORCHESTRATION)

**Location**: `clawbot-template-router.ts:121` (`selectTemplate(query, context)`)
**Symptom**: Template router scores against query tokens + category hint + verb stem. It never considers: which Capitolo is active, what was discussed last turn, what state the circuit is in. So `"il LED è fioco"` always selects `lesson-diagnose` regardless of whether the previous turn was Vol.1 Cap.6 (LED) vs Vol.2 Cap.4 (resistori in parallelo) — same template, different correct citation.

**P0 fix spec**:
- Extend `SelectContext` with optional `capitolo_id?`, `recent_topics?: string[]` (last 3 turns subjects).
- Wire `unlim-chat/index.ts` to derive these from `getCapitoloByExperimentId` + `studentContext.recentTopics` and pass into `selectTemplate`.
- Update `scoreTemplate` to add +2 bonus when `template.principio_zero.vol_pag` matches the active capitolo's vol/page.
- Test: 5 ambiguous queries that should select different templates depending on capitolo context.

### Gap 5 — LLM tool-use output not dispatched server-side (P0 ONNIPOTENZA)

**Location**: `unlim-chat/index.ts:489+` — post-LLM section parses NOTHING from `result.text`; just caps to 60 words and returns.
**Symptom**: ToolSpec count = 62 (`scripts/openclaw/tools-registry.ts`), but server has no parser for `[AZIONE:...]` or `[INTENT:{...}]` tags emitted by the LLM. Only browser side (`useGalileoChat.js`) interprets tags. This means: (a) UNLIM cannot perform server-only actions like RAG re-query mid-response, (b) any composite from `composite-handler.ts` (e.g. `analyzeImage` = captureScreenshot + postToVisionEndpoint) cannot run server-side, (c) audit/observability of tool calls is split: L2 templates audit-trail server, LLM-emitted tool calls audit-trail browser only.

**P0 fix spec**:
- Add a post-LLM step in `unlim-chat/index.ts` that:
  1. Regex-extracts `[INTENT:{...}]` JSON blocks from `result.text`.
  2. For each, validates the tool name against the 62 ToolSpec registry.
  3. For composite tools (those with `composite_of`), dispatches via `executeComposite` with a Deno-compatible adapter (most tools are browser-side; only RAG/vision/memory-write composites run server-side).
  4. Returns the original text PLUS a `tool_calls: [{id, name, args, result}]` structured array on the response.
- Strip raw INTENT tags from `cappedText` returned to client (client interprets the structured `tool_calls` field instead).
- Log every server-dispatched tool call to `together_audit_log` (already exists per migration `20260426152944`) for GDPR + cost observability.

## 6. Summary table — gap → impact → ETA

| # | Gap | Severity | Wired? | Recommended fix LOC est. |
|---|---|---|---|---|
| 1 | `safeSessionId` undefined ref | P0 BUG | partial | ~5 LOC |
| 2 | L6 history hardcoded empty | P0 SEMANTIC | wired-broken | ~30 LOC server + ~15 client + 1 ADR |
| 3 | L7 circuit_state not piped | P1 | wired-incomplete | ~10 LOC + bench |
| 4 | L2 ignores Onniscenza signals | P1 ORCHESTRATION | scaffolded | ~80 LOC + 5 tests |
| 5 | LLM tool-use NOT dispatched server-side | P0 ONNIPOTENZA | scaffolded only | ~250 LOC + ADR + 8 tests |

## 7. What "perfect orchestration" would look like (target spec — iter 36+ scope)

A request enters `unlim-chat` → simultaneously triggers (in parallel, fail-fast 200ms each):
- L1 RAG hybrid (volumi + wiki concept fusion)
- L4 sessione (last N memories of THIS class)
- L6 history (last 10 turns)
- L7 onthefly (live circuit state)
- Capitolo lookup (sync, <1ms)

These fuse via RRF k=60 → top-3 inject BASE_PROMPT. L2 template router gets the SAME context (not just query) and either short-circuits with template OR passes the enriched prompt to LLM. LLM emits text + structured `[INTENT:{...}]`. Post-LLM, server-side dispatcher executes safe tools (RAG re-query, memory writes), unsafe-or-browser-only tools surface as `tool_calls[]` for the client. Vision results from previous turns are stored in `class_memory.vision_findings[]` and become L5 input next turn.

Currently we have layers 1-5 wired but with gaps 1+2+3 above; layer 6 is wired-broken; layer 7 wire is one line; LLM-emitted tools are NOT parsed server-side; vision is decoupled with no persistence loop.

## 8. Anti-inflation footnote (G45)

This audit lists 5 gaps and 8 specific P0 fixes. None of these are claimed "trivial" or "easy" — gap 5 alone is a multi-iter effort (dispatcher integration into Edge Function, ToolSpec server-side dispatch table, audit log, error handling). The text "wired" means file-system verified the code path exists and a test or live deploy confirms invocation; "scaffolded" means files exist but call sites are absent or env-gated off; "gap" means no code path connects the two layers. Score not assigned in this doc — measurement deferred to post-fix bench iter 36 when fixes 1+2+3 are deployed.

## 9. Files referenced

- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/unlim-chat/index.ts`
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/onniscenza-bridge.ts`
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/clawbot-template-router.ts`
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/system-prompt.ts`
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/gemini-vision.ts` (NEW iter 35)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/unlim-vision/index.ts` (MODIFIED iter 35)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/scripts/openclaw/composite-handler.ts`
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/scripts/openclaw/dispatcher.ts`
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/scripts/openclaw/tools-registry.ts` (62 ToolSpec — count file-system verified)
