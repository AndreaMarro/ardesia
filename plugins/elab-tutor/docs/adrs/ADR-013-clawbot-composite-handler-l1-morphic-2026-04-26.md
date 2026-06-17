---
id: ADR-013
title: ClawBot composite handler L1 morphic — analyzeImage real exec wire-up + executeComposite module
status: proposed
date: 2026-04-26
deciders:
  - architect-opus (Sprint S iter 6 Phase 1, Pattern S 5-agent OPUS)
  - Andrea Marro (final approver per PZ block mode timing + memory TTL)
context-tags:
  - sprint-s-iter-6
  - clawbot-80-tool-dispatcher
  - l1-morphic-composite
  - box-10-lift
  - tool-memory-cache
  - principio-zero-runtime
related:
  - ADR-007 (module extraction pattern Wiki retriever isomorfic)
  - ADR-009 (validatePrincipioZero middleware) — runtime PZ validator
  - ADR-010 (Together AI fallback gated) — chain provider for Vision sub-step
  - ADR-012 (Vision flow E2E Playwright) — sibling iter 6 (postToVisionEndpoint pattern)
  - docs/architectures/pdr-sett5-openclaw-onnipotenza-morfica-v4.md §3 (L1/L2/L3)
  - SETUP-NEXT-SESSION/ARCHITETTURA-FINALE-SESSIONE-2026-04-26.md §6 P2 8
input-files:
  - scripts/openclaw/dispatcher.ts (iter 4 scaffold, ~290 LOC, status='composite' returns todo_sett5)
  - scripts/openclaw/tools-registry.ts (~838 LOC, analyzeImage composite_of L457-469)
  - scripts/openclaw/morphic-generator.ts (~466 LOC, L1 generateL1Composition existing pattern)
  - scripts/openclaw/state-snapshot-aggregator.ts (parallel state fetch per dispatch context)
  - scripts/openclaw/tool-memory.ts (Supabase pgvector cache, openclaw_tool_memory migration applied iter 5)
  - scripts/openclaw/pz-v3-validator.ts (validatePZv3 IT primary)
output-files:
  - scripts/openclaw/composite-handler.ts (NEW ~250 LOC, executeComposite module)
  - scripts/openclaw/composite-handler.test.ts (NEW ~150 LOC, 5 unit cases)
  - scripts/openclaw/dispatcher.ts (modified — composite branch wire to executeComposite)
  - supabase/functions/unlim-chat/index.ts (modified — postToVisionEndpoint sub-handler exposed)
---

# ADR-013 — ClawBot composite handler L1 morphic (executeComposite + analyzeImage real exec)

> Definire modulo `composite-handler.ts` che esegue tool `status='composite'` come `analyzeImage = captureScreenshot + postToVisionEndpoint` via decomposizione sequenziale di sub-dispatches. Iter 4 scaffold dispatcher.ts:147-158 ritornava `todo_sett5` per tutti composite. Iter 6 wire-up: real exec con error propagation + memory cache (TTL 24h) + PZ v3 validation per sub-step (warn-only iter 6, block iter 7+). Box 10 lift 0.3 → 0.6. Sprint 6 Day 39 gate 80-tool dispatcher live unblocked (R5 ≥90% PASS gate met iter 5).

---

## 1. Contesto

### 1.1 Box 10 ClawBot 80-tool dispatcher stato attuale (iter 5 close 0.3)

Sprint S iter 4 ha shipped `scripts/openclaw/dispatcher.ts` ~290 LOC scaffold con 5 dispatch outcomes (`ok` / `blocked_pz` / `unresolved_handler` / `unknown_tool` / `todo_sett5` / `error`). Per `status='composite'` tools dispatcher ritorna:

```ts
if (resolved === 'composite') {
  return {
    status: 'todo_sett5',
    tool: toolId,
    handler: spec.handler,
    error: `composite tool '${toolId}' execution defer iter 5+ (composite_of=${(spec.composite_of || []).join(',')})`,
    latency_ms: Date.now() - start,
    resolved_status: resolved,
    meta: { composite_of: spec.composite_of },
  };
}
```

Tools `status='composite'` registry iter 5:
1. `analyzeImage` → `composite_of=['captureScreenshot', 'postToVisionEndpoint']` (vedi `tools-registry.ts:457-469`)

Singolo composite iter 6 = `analyzeImage`. Iter 7+ aggiungere altri composite (es. `diagnoseAndExplain` = analyzeImage + speakTTS).

### 1.2 L1 morphic pattern existing (morphic-generator.ts)

`scripts/openclaw/morphic-generator.ts` ha già `generateL1Composition` ~150 LOC che decompone user-message in `ToolCall[]` via LLM tool-use. Pattern reference per ADR-013:

- Input: `userMsg`, `state`, `llmClient`, `locale`
- Output: `GeneratedTool { level: 'L1', composition_steps: ToolCall[], speak_text }`
- Validation: `isValidToolName(step.action)` + `validatePZv3(plan.speak)`

Differenza chiave: `generateL1Composition` PIANIFICA composition LLM-driven, ADR-013 ESEGUE composition declarativa (`composite_of` array). NON necessita LLM per orchestration — sub-tools già definiti static.

### 1.3 Sub-handler postToVisionEndpoint NON existing

`captureScreenshot` è registry tool live (`tools-registry.ts:447-455`, handler flat `__ELAB_API.captureScreenshot()`). MA `postToVisionEndpoint` NON è registry tool — è sub-step interno composite analyzeImage che deve POST screenshot a Edge Function `unlim-chat` con images array (vedi ADR-012 D1 endpoint scelto).

Decisione: aggiungere `postToVisionEndpoint` come tool registry status='composite_internal' (NEW status) con handler dedicato che chiama Edge Function. NON exposed a LLM tool-use schema (uso interno solo). Riuso `unlim-chat` endpoint per consistenza ADR-012.

### 1.4 Memory cache openclaw_tool_memory migration applied iter 5

Migration `supabase/migrations/20260426152945_openclaw_tool_memory.sql` applicata iter 5 close (CLAUDE.md Sprint S iter 5 P3). Schema:

```sql
CREATE TABLE openclaw_tool_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  output JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  hit_count INT NOT NULL DEFAULT 0,
  embedding vector(384)  -- BGE-M3 multilingual (Sprint H2 hybrid RAG)
);

CREATE UNIQUE INDEX uniq_tool_input ON openclaw_tool_memory (tool_name, input_hash);
CREATE INDEX idx_tool_expires ON openclaw_tool_memory (expires_at);
```

`scripts/openclaw/tool-memory.ts` espone `getCached(toolName, input) -> output | null` + `setCached(toolName, input, output, ttl_hours)`. Iter 6 ADR-013 wire-up: composite results cached via input_hash (SHA-256 di JSON.stringify({args, screenshot_dimensions})) per re-use entro TTL 24h.

### 1.5 State-snapshot-aggregator integration

`scripts/openclaw/state-snapshot-aggregator.ts` espone `aggregateState({circuit, wiki, rag, memoria, vision})` parallel fetch in 5 fonti. ADR-013 composite execution può richiedere aggregateState pre-exec se sub-handler beneficia da context completo (es. `analyzeImage` può cross-check screenshot con `circuitState` per diagnostic robust).

Decisione: `executeComposite` accetta opzionale `context.aggregate_state: boolean` (default false per latency). Se true, chiama `aggregateState` pre sub-dispatch e passa `state` via `context.state`. Iter 6 default false (P1 enable iter 7+).

---

## 2. Decisione

### 2.1 Decisione D1 — Modulo composite-handler.ts NEW (separation of concerns)

**Scelta**: nuovo modulo `scripts/openclaw/composite-handler.ts` ~250 LOC dedicato. NOT inline in dispatcher.ts. Pattern ADR-007 module extraction (Wiki retriever isomorfic).

**Razionale**:
- dispatcher.ts già ~290 LOC, aggiungere composite logic +250 = bloated
- Composite logic richiede sub-dispatch ricorsivo + memory cache + state aggregation = self-contained module
- Test isolato `composite-handler.test.ts` separato da `dispatcher.test.ts`
- Pattern ADR-007: modulo Deno-Node isomorfic, no platform-specific imports

```ts
// File: scripts/openclaw/composite-handler.ts (NEW)
import type { ToolSpec } from './tools-registry.ts';
import type { DispatchContext, DispatchResult } from './dispatcher.ts';
import { dispatch } from './dispatcher.ts';
import { getCached, setCached } from './tool-memory.ts';
import { aggregateState } from './state-snapshot-aggregator.ts';
import { validatePZv3 } from './pz-v3-validator.ts';

export interface CompositeResult<T = unknown> extends DispatchResult<T> {
  composite_steps?: Array<{
    sub_tool: string;
    sub_status: string;
    sub_latency_ms: number;
    sub_data?: unknown;
    sub_error?: string;
  }>;
  cache_hit?: boolean;
}

export async function executeComposite<T = unknown>(
  spec: ToolSpec,
  args: Record<string, unknown>,
  context: DispatchContext,
): Promise<CompositeResult<T>>;
```

**Alternative scartate**:

| Approach | Pro | Contro | Decisione |
|----------|-----|--------|-----------|
| **Modulo separato (SCELTO)** | Single responsibility, test isolated | +1 file | Scelto |
| Inline dispatcher.ts | No new file | dispatcher.ts +250 LOC bloat | Scartato |
| Class CompositeExecutor OO | Encapsulation | Verbose Deno, no real benefit | Scartato |
| Inline morphic-generator.ts | Reuse L1 pattern | Different semantics (plan vs execute) | Scartato |

### 2.2 Decisione D2 — executeComposite signature + decomposition algorithm

**Scelta**: signature `executeComposite(spec, args, context) -> CompositeResult`. Algorithm:

```
1. Validate spec.status === 'composite' && spec.composite_of?.length > 0
   else throw InvalidCompositeSpec

2. Compute input_hash = sha256(JSON.stringify({tool: spec.name, args}))

3. If context.use_memory_cache:
     cached = await getCached(spec.name, input_hash)
     if cached: return { status: 'ok', data: cached.output, cache_hit: true, ... }

4. If context.aggregate_state:
     state = await aggregateState(context)
     context = { ...context, state }

5. composite_steps = []
   accumulator = { args, output_chain: [] }

6. For each sub_tool_name in spec.composite_of:
     sub_args = mapArgsForSubTool(sub_tool_name, accumulator)
     sub_result = await dispatch(sub_tool_name, sub_args, context)

     composite_steps.push({
       sub_tool: sub_tool_name,
       sub_status: sub_result.status,
       sub_latency_ms: sub_result.latency_ms,
       sub_data: sub_result.data,
       sub_error: sub_result.error,
     })

     if sub_result.status !== 'ok':
       return {
         status: 'error',
         tool: spec.name,
         error: `composite halted at sub-step '${sub_tool_name}': ${sub_result.error}`,
         composite_steps,
         latency_ms: total_latency,
         meta: { halted_at: sub_tool_name, sub_status: sub_result.status }
       }

     accumulator.output_chain.push(sub_result.data)

7. final_data = aggregateCompositeResult(spec, accumulator.output_chain)

8. PZ v3 validation (warn-only iter 6, block iter 7+):
     If spec.pz_v3_sensitive && final_data has speak text:
       pz_check = validatePZv3(final_data.speak, locale)
       if !pz_check.valid:
         pz_warnings.push(...pz_check.violations)
         if context.pz_mode === 'block':
           return { status: 'blocked_pz', composite_steps, pz_warnings, ... }

9. If context.use_memory_cache:
     await setCached(spec.name, input_hash, final_data, TTL_24H)  // fire-and-forget

10. Return { status: 'ok', tool: spec.name, data: final_data, composite_steps, latency_ms: total }
```

**Razionale**:
- Sequential sub-dispatch = simple, predictable error propagation
- `accumulator.output_chain` permette sub-tool n+1 vedere output sub-tool n (es. `postToVisionEndpoint` riceve screenshot da `captureScreenshot`)
- Memory cache con input_hash deterministic = re-use entro 24h evita Gemini Vision costs ripetuti
- PZ validation post-composite = single gate per output finale (no double-validation per sub-step)
- Halt-on-first-error = no zombie state mid-composite

**Alternative considerate**:

| Approach | Pro | Contro | Decisione |
|----------|-----|--------|-----------|
| **Sequential halt-on-error (SCELTO)** | Predictable, simple, deterministic | No partial recovery | Scelto |
| Parallel sub-dispatch | Fast | Race conditions sub-tools deps, complex error agg | Scartato |
| Continue-on-error con error_collection | Resilient | Zombie state, hard to test | Scartato |
| Retry sub-step 3x con backoff | Resilient | Latency 3x worst case + fragile | Defer iter 7+ |

### 2.3 Decisione D3 — mapArgsForSubTool (chain output → next input)

**Scelta**: funzione `mapArgsForSubTool(sub_tool_name, accumulator)` con knowledge esplicito per composite known. Iter 6 SCOPE: SOLO `analyzeImage` mapping.

```ts
function mapArgsForSubTool(
  subToolName: string,
  accumulator: { args: Record<string, unknown>; output_chain: unknown[] },
): Record<string, unknown> {
  // analyzeImage composite mappings:
  if (subToolName === 'captureScreenshot') {
    return {}; // captureScreenshot takes no args
  }
  if (subToolName === 'postToVisionEndpoint') {
    const screenshot = accumulator.output_chain[0] as string; // base64 PNG
    return {
      image: screenshot,
      message: accumulator.args.message || 'Guarda il circuito e dimmi cosa vedi',
      experimentId: accumulator.args.experimentId,
    };
  }

  // Future composite mappings here (iter 7+)

  // Default: pass-through args (sub_tool consumes parent args)
  return accumulator.args;
}
```

**Razionale**:
- Explicit mapping = readable + auditable per ogni composite
- Default pass-through fallback per future composite con shared schema
- Iter 6 single composite = piccolo overhead manutenzione
- Iter 7+ refactor a registry-driven mapping (es. `spec.compose_args_mapping: {[subTool]: argMapper}`)

**Alternative scartate**:

- "Generic argument inference" → fragile, fail con composite custom
- "LLM-driven mapping" → over-engineered, latency, cost
- "User passes manual mapping" → API verbose, no encapsulation

### 2.4 Decisione D4 — postToVisionEndpoint sub-handler real impl

**Scelta**: `postToVisionEndpoint` registry tool NEW status='composite_internal' (NEW status type) NOT exposed to LLM tool-use schema. Handler chiama Edge Function `unlim-chat` con images array (allineamento ADR-012).

**Registry entry NEW**:

```ts
{
  name: 'postToVisionEndpoint',
  category: 'vision',
  handler: '__internal_postToVisionEndpoint',  // resolved by composite-handler.ts
  status: 'composite_internal',
  params: {
    image: { type: 'string', required: true, description: 'base64 PNG' },
    message: { type: 'string', required: false, description: 'docente question' },
    experimentId: { type: 'string', required: false, description: 'experiment context' },
  },
  returns: 'object {response, metadata}',
  effect: 'POST screenshot+message to unlim-chat Edge Function (Gemini Vision)',
  pz_v3_sensitive: false,
  since: '2026-04',
}
```

**Handler implementation in composite-handler.ts**:

```ts
async function postToVisionEndpoint(args: {
  image: string;
  message?: string;
  experimentId?: string;
}, context: DispatchContext): Promise<unknown> {
  const EDGE_URL = (typeof import.meta !== 'undefined'
    ? (import.meta as any).env?.VITE_EDGE_URL
    : null) || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat';
  const ANON_KEY = (typeof import.meta !== 'undefined'
    ? (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
    : null) || '';
  const ELAB_KEY = (typeof import.meta !== 'undefined'
    ? (import.meta as any).env?.VITE_ELAB_API_KEY
    : null) || '';

  const response = await fetch(EDGE_URL, {
    method: 'POST',
    headers: {
      'X-Elab-Api-Key': ELAB_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'apikey': ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: args.message || 'Guarda il circuito e dimmi cosa vedi',
      sessionId: context.session_id || `composite-${Date.now()}`,
      experimentId: args.experimentId,
      images: [{ data: args.image, mime_type: 'image/png' }],
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`postToVisionEndpoint HTTP ${response.status}`);
  }

  return await response.json();
}
```

**Razionale**:
- Riusa `unlim-chat` endpoint (consistent con ADR-012 D1)
- Status 'composite_internal' NEW per filtering: NOT in LLM tool-use schema (`buildJsonSchemaForLLM` filtra status='composite_internal' fuori)
- Auth headers consistent con ADR-012 E2E test
- Timeout 15s allineato Edge Function p99 ~10s + buffer
- Error throw → composite halt step 6 algorithm D2

**Alternative scartate**:

- "Endpoint dedicato unlim-vision" → drift PZ validator + audit dual (ADR-012 §1.2)
- "Inline handler in __ELAB_API global" → coupling browser code, no Deno reuse
- "POST a Render legacy" → cold start 18s + no PZ v3 middleware

### 2.5 Decisione D5 — Memory cache TTL 24h (input_hash deterministic)

**Scelta**: TTL default 24h (24 * 3600 * 1000 ms). Input hash: SHA-256 di canonical JSON `{tool: spec.name, args, screenshot_dim?}`.

**Rationale TTL 24h**:
- Vision composite (analyzeImage) = output stable per stesso circuit state (Gemini Vision deterministic per identical input + low temperature)
- Costo Gemini Vision $0.0005 per call → cache hit risparmia 24h × call/giorno = 100% saving for stable circuit
- 24h = lezione singola docente max (mattina + pomeriggio scuole)
- Beyond 24h: state circuit cambia probabile (esperimenti diversi giorno seguente)

**Hash deterministic**:

```ts
import { createHash } from 'crypto';

function computeInputHash(toolName: string, args: Record<string, unknown>): string {
  // For analyzeImage: hash includes image dimensions (not full base64 → too large)
  const canonical: any = { tool: toolName, args: { ...args } };
  if (toolName === 'analyzeImage' && typeof args.image === 'string') {
    // Dimension fingerprint instead of full image hash (faster + smaller)
    canonical.args.image_size = args.image.length;
    canonical.args.image_prefix = (args.image as string).slice(0, 64);
    delete canonical.args.image;
  }
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}
```

**Razionale image_size + image_prefix**:
- Full base64 hash = computed cost ~10ms per 1MB image, accumula
- Size + prefix 64 char = collision improbabile per stesso circuit state (entropy sufficient)
- Iter 7+ può add perceptual hash (pHash) per cache hit fuzzy

**Alternative scartate**:

| Approach | Pro | Contro | Decisione |
|----------|-----|--------|-----------|
| **TTL 24h + size+prefix hash (SCELTO)** | Balanced cost-savings vs freshness | Edge case stesso prefix diverso content → cache poison | Scelto |
| TTL 1h | Super fresh | Cache hit rate <10% | Scartato |
| TTL 7gg | Max cost saving | Stale state docente diverso | Scartato |
| Full image hash | Zero collision | Slow ~10ms per call | Defer iter 7+ |
| No cache | Always fresh | Cost 100% Gemini | Scartato |

**Downside onesto**: cache poison rischio se identical prefix + identical size con diverso payload (extremely rare). Mitigazione iter 7+: aggiungere checksum `crc32(image)` campo cache key.

### 2.6 Decisione D6 — PZ v3 validation timing (warn-only iter 6, block iter 7+)

**Scelta**: PZ v3 validation post-composite (step 8 algorithm D2). Mode `warn` iter 6, mode `block` iter 7+ post-stability validation.

**Razionale warn-only iter 6**:
- Iter 4 dispatcher PZ v3 stub warn-only (vedi `dispatcher.ts:104-109`). Coerenza pattern.
- Composite output può contener speak text generato Gemini Vision = LLM stocastico, false-positive rischio
- Iter 6 build trust: monitor PZ violations rate per fixture analyzeImage in produzione, tune threshold
- Iter 7+ flip block dopo 1 settimana monitoring + 0 false-positive

**Validation logic**:

```ts
// Step 8 algorithm D2:
const pzMode = context.pz_mode || 'warn';
let pzWarnings: string[] = [];

if (spec.pz_v3_sensitive) {
  // Extract speak text from composite output (heuristic per composite)
  const speakText = extractSpeakText(spec, final_data);
  if (speakText) {
    const pz_check = validatePZv3(speakText, context.locale || 'it');
    if (!pz_check.valid) {
      pzWarnings = pz_check.violations;
      if (pzMode === 'block') {
        return {
          status: 'blocked_pz',
          tool: spec.name,
          error: `PZ v3 block: ${pzWarnings.join('; ')}`,
          pz_warnings: pzWarnings,
          composite_steps,
          latency_ms: total,
        };
      }
      // warn mode: log + continue
      console.warn(JSON.stringify({
        level: 'warn',
        event: 'composite_pz_violation',
        tool: spec.name,
        violations: pzWarnings,
      }));
    }
  }
}
```

**extractSpeakText heuristic per composite**:

```ts
function extractSpeakText(spec: ToolSpec, output: any): string | null {
  if (spec.name === 'analyzeImage') {
    // postToVisionEndpoint returns { response: string, metadata: ... }
    return output?.response || null;
  }
  // Future composite-specific extractors here
  return null;
}
```

**Alternative scartate**:

- "Block iter 6 immediate" → false-positive rischio block legitimate output
- "No PZ validation composite" → loophole bypass dispatcher PZ gate
- "Validate per sub-step" → double-validation, costo 2x, LLM judge no-op for non-text sub-tools

### 2.7 Decisione D7 — Test strategy (5 unit cases + integration deferred)

**Scelta**: 5 unit test cases in `scripts/openclaw/composite-handler.test.ts`. Integration test (real Edge Function call) deferred iter 7+ (richiede env keys + cost).

**Layer 1 — Unit tests** (5 cases):

| ID | Scenario | Assert |
|----|----------|--------|
| C1 | analyzeImage success path | composite_steps.length=2, status='ok', data.response present |
| C2 | sub-tool fail (captureScreenshot returns null) | status='error', halted_at='captureScreenshot', composite_steps.length=1 |
| C3 | PZ block mode (output non-Ragazzi) | status='blocked_pz', pz_warnings populated |
| C4 | memory cache hit (input_hash match) | cache_hit=true, sub-dispatch NOT invoked, latency <50ms |
| C5 | timeout (sub-tool >15s) | status='error', error contains 'timeout', composite_steps shows partial |

**Mocks**:
- `dispatch` stubbed via `__mocks__/dispatcher.ts` per controllo sub-tool outcomes
- `getCached`/`setCached` stubbed via `__mocks__/tool-memory.ts`
- `aggregateState` stubbed via `__mocks__/state-snapshot-aggregator.ts`
- `validatePZv3` stubbed configurable per test

**Layer 2 — Integration tests** (deferred iter 7+):
- Real Edge Function call from `tests/integration/openclaw/composite-vision.test.ts`
- Require ELAB_API_KEY + SUPABASE_ANON_KEY env
- Cost ~$0.0005 per run

**Razionale 5 unit cases**:
- Coverage: success / sub-fail / PZ block / cache hit / timeout = 5 critical paths
- Mocks deterministic = reproducible CI
- Integration deferred = no env coupling iter 6 baseline

**Alternative scartate**:

- "Integration tests iter 6" → require env setup + cost
- "Solo unit success path" → vacuo, no error coverage
- "10 cases iter 6" → diminishing returns, manutenzione fixture

### 2.8 Decisione D8 — Sprint 6 Day 39 gate semantics

**Scelta**: Box 10 ClawBot 80-tool dispatcher live = composite working + R5 ≥90% PASS + ≥10 composite tools registered iter 7-8.

**Iter 6 SCOPE Box 10 lift**: 0.3 → 0.6 (+0.3).

**0.3 → 0.6 unlock criteria**:
- ✅ R5 91.80% PASS production (iter 5 close MET)
- ✅ Migration `openclaw_tool_memory` applied (iter 5 close MET)
- ✅ executeComposite module shipped (ADR-013 deliverable)
- ✅ 5 unit tests PASS (ADR-013 acceptance)
- ✅ 1 composite working: analyzeImage (ADR-013 deliverable)

**0.6 → 0.8 future iter 7-8 criteria**:
- ≥3 composite working: analyzeImage + diagnoseAndExplain + walkThroughExperiment
- PZ v3 block mode flipped (warn → block)
- Tool memory cache hit rate ≥30% measured production (cost saving real)

**0.8 → 1.0 future iter 9+ criteria**:
- 80-tool dispatcher live full surface (current 52 tools registry, +28 to add)
- LLM tool-use orchestration (buildJsonSchemaForLLM → LLM → dispatch)
- E2E test composite chain prod (10 use cases)

### 2.9 Decisione D9 — Error propagation + observability

**Scelta**: structured logging Vercel/Deno + correlation ID per composite trace.

```ts
console.info(JSON.stringify({
  level: 'info',
  event: 'composite_dispatch_start',
  correlation_id: crypto.randomUUID(),
  tool: spec.name,
  composite_of: spec.composite_of,
  args_size: JSON.stringify(args).length,
  cache_check: context.use_memory_cache,
}));

// On halt:
console.warn(JSON.stringify({
  level: 'warn',
  event: 'composite_halt',
  correlation_id,
  tool: spec.name,
  halted_at: sub_tool_name,
  sub_status: sub_result.status,
  sub_error: sub_result.error,
  steps_completed: composite_steps.length,
}));

// On success:
console.info(JSON.stringify({
  level: 'info',
  event: 'composite_dispatch_success',
  correlation_id,
  tool: spec.name,
  total_latency_ms: total,
  cache_hit: cache_hit_flag,
  pz_warnings_count: pzWarnings.length,
}));
```

**Razionale**:
- Correlation ID cross-step trace (sub-dispatch error attribuibile composite parent)
- Structured JSON parsing facile in Vercel logs analytics
- Eventi separati start/halt/success per dashboard aggregation futura

**Alternative scartate**:

- "Print debug verbose" → noise produzione
- "Sentry SDK" → +dependency budget
- "OpenTelemetry tracing" → overkill iter 6

### 2.10 Decisione D10 — Versioning + roadmap composite catalog iter 7+

**Scelta**:

- ADR-013 v1.0 (iter 6) = analyzeImage composite real exec + executeComposite module + 5 unit tests
- v1.1 (iter 7) = `diagnoseAndExplain` composite (analyzeImage + speakTTS) + PZ block mode flip
- v1.2 (iter 8) = `walkThroughExperiment` composite (mountExperiment + nextStep×N + speakTTS×N)
- v2.0 (iter 9+) = LLM tool-use orchestration via buildJsonSchemaForLLM → composite from registry dynamic

iter 6 SCOPE: SOLO v1.0 con `analyzeImage` real exec + Box 10 lift 0.3 → 0.6. Resto è roadmap.

**Composite catalog projected**:

| Composite | composite_of | Use case | Iter |
|-----------|--------------|----------|------|
| analyzeImage | captureScreenshot + postToVisionEndpoint | Vision diagnostic | 6 |
| diagnoseAndExplain | analyzeImage + speakTTS | Vision + voice narration | 7 |
| walkThroughExperiment | mountExperiment + nextStep×N + speakTTS×N | Guided lesson | 8 |
| compileAndDeploy | compile + setEditorCode + play | Arduino full-cycle | 8 |
| visualReportFumetto | recallPastSession + analyzeImage + exportFumetto | Lesson recap | 9 |
| smartNudge | getCircuitState + recallPastSession + showNudge | Context-aware tutoring | 9 |

---

## 3. Implementation contract per generator-app-opus + generator-test-opus

```ts
// File: scripts/openclaw/composite-handler.ts (NEW, ~250 LOC)
import type { ToolSpec } from './tools-registry.ts';
import type { DispatchContext, DispatchResult } from './dispatcher.ts';
import { dispatch } from './dispatcher.ts';
import { getCached, setCached } from './tool-memory.ts';
import { aggregateState } from './state-snapshot-aggregator.ts';
import { validatePZv3 } from './pz-v3-validator.ts';

export interface CompositeResult<T = unknown> extends DispatchResult<T> {
  composite_steps?: Array<{
    sub_tool: string;
    sub_status: string;
    sub_latency_ms: number;
    sub_data?: unknown;
    sub_error?: string;
  }>;
  cache_hit?: boolean;
}

export const COMPOSITE_CACHE_TTL_HOURS = 24;

export async function executeComposite<T = unknown>(
  spec: ToolSpec,
  args: Record<string, unknown>,
  context: DispatchContext = {},
): Promise<CompositeResult<T>>;

// Internal exports per testing
export function computeInputHash(toolName: string, args: Record<string, unknown>): string;
export function mapArgsForSubTool(subToolName: string, accumulator: any): Record<string, unknown>;
export function aggregateCompositeResult(spec: ToolSpec, output_chain: unknown[]): unknown;
export function extractSpeakText(spec: ToolSpec, output: any): string | null;
```

```ts
// File: scripts/openclaw/dispatcher.ts (MODIFIED — composite branch)
// Replace lines 147-158 (composite todo_sett5 stub) with:
if (resolved === 'composite') {
  const { executeComposite } = await import('./composite-handler.ts');
  return await executeComposite<T>(spec, args, context);
}
```

```ts
// File: scripts/openclaw/tools-registry.ts (MODIFIED — add postToVisionEndpoint)
// Append to OPENCLAW_TOOLS_REGISTRY array:
{
  name: 'postToVisionEndpoint',
  category: 'vision',
  handler: '__internal_postToVisionEndpoint',
  status: 'composite_internal',  // NEW status type
  params: {
    image: { type: 'string', required: true, description: 'base64 PNG' },
    message: { type: 'string', required: false, description: 'docente question' },
    experimentId: { type: 'string', required: false, description: 'experiment context' },
  },
  returns: 'object {response, metadata}',
  effect: 'POST screenshot+message to unlim-chat Edge Function (Gemini Vision)',
  pz_v3_sensitive: false,
  since: '2026-04',
}

// Modify HandlerStatus type to include 'composite_internal':
export type HandlerStatus = 'live' | 'todo_sett5' | 'composite' | 'composite_internal';

// Modify buildJsonSchemaForLLM to filter status='composite_internal' (not exposed to LLM):
export function buildJsonSchemaForLLM(): Record<string, unknown> {
  return {
    tools: OPENCLAW_TOOLS_REGISTRY
      .filter(t => resolveStatus(t) !== 'composite_internal')
      .map(t => ({ ... }))
  };
}
```

```ts
// File: scripts/openclaw/composite-handler.test.ts (NEW, ~150 LOC)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeComposite, computeInputHash } from './composite-handler.ts';

vi.mock('./dispatcher.ts');
vi.mock('./tool-memory.ts');
vi.mock('./state-snapshot-aggregator.ts');

describe('executeComposite — analyzeImage L1 morphic', () => {
  it('C1 success path: captureScreenshot + postToVisionEndpoint OK', async () => { ... });
  it('C2 sub-tool fail: captureScreenshot returns null → halt', async () => { ... });
  it('C3 PZ block mode: non-Ragazzi response → blocked_pz', async () => { ... });
  it('C4 memory cache hit: input_hash match → cache_hit=true', async () => { ... });
  it('C5 timeout: sub-tool >15s → error with timeout indicator', async () => { ... });
});
```

---

## 4. Acceptance criteria per implementation

Per `generator-app-opus` (composite-handler module):

- [ ] File creato: `scripts/openclaw/composite-handler.ts` ~250 LOC
- [ ] Export `executeComposite(spec, args, context) -> CompositeResult`
- [ ] Algorithm 10-step (D2): validate spec → hash → cache check → aggregate state → loop sub-dispatch → aggregate result → PZ validate → cache write → return
- [ ] mapArgsForSubTool implemented per analyzeImage (D3)
- [ ] postToVisionEndpoint sub-handler real impl (D4) calling unlim-chat Edge Function
- [ ] Memory cache TTL 24h con input_hash deterministic SHA-256 (D5)
- [ ] PZ v3 validation post-composite warn mode default, block mode opt-in (D6)
- [ ] Structured JSON logging start/halt/success con correlation_id (D9)
- [ ] dispatcher.ts modified: composite branch wires to executeComposite (replace lines 147-158)
- [ ] tools-registry.ts modified: postToVisionEndpoint registry entry + HandlerStatus type union + buildJsonSchemaForLLM filter
- [ ] No modifica src/ o supabase/functions/ (scripts-only changes)
- [ ] No regressione test baseline (12574+ PASS preservato)
- [ ] No regressione vitest openclaw (119+ PASS preservato)

Per `generator-test-opus` (composite-handler tests):

- [ ] File creato: `scripts/openclaw/composite-handler.test.ts` ~150 LOC
- [ ] 5 unit cases C1-C5 (D7) PASS
- [ ] Mocks deterministic via `__mocks__/dispatcher.ts` + `__mocks__/tool-memory.ts`
- [ ] Coverage: success / sub-fail / PZ block / cache hit / timeout
- [ ] Vitest config `vitest.openclaw.config.ts` includes new test file
- [ ] No regressione baseline OpenClaw 119+ PASS

---

## 5. Trade-off summary onesto

**Pro**:
- Box 10 lift 0.3 → 0.6 measurable (composite working + 5 tests + R5 gate met)
- Module separation single responsibility, testable isolated
- Sequential halt-on-error = predictable, easy debug
- Memory cache TTL 24h = cost saving Gemini Vision real (lessons stable)
- PZ v3 warn-only iter 6 = build trust, flip block iter 7+ con monitoring data
- Pattern ADR-007 module extraction (Deno-Node isomorfic)
- Riuso unlim-chat endpoint = consistency con ADR-012
- Structured logging correlation_id = cross-step trace

**Contro / debt**:
- Sub-tools sequential = no parallelism (analyzeImage 2-step OK, future composites with N>3 step latency lineare)
- Memory cache prefix-hash collision rischio teoricamente (mitigato iter 7+ con CRC)
- mapArgsForSubTool hardcoded per composite = manutenzione N composite × M sub-tool mappings
- PZ warn-only = output non-PZ-compliant può raggiungere docente iter 6 (tradeoff con false-positive block)
- Integration tests deferred iter 7+ = unit tests con mocks NON certifica real Edge Function call
- tool_memory cache write fire-and-forget = no error visibility se setCached fail
- composite_internal status NEW → buildJsonSchemaForLLM filter required NUDGE per future composite
- Cost cache miss primo composite per fixture = $0.0005 Gemini Vision (24h amortizzazione)

**Alternative rejected**:
- "Inline dispatcher.ts logic" → bloat, single-responsibility violated
- "Parallel sub-dispatch" → race conditions deps, complex error agg
- "Continue-on-error" → zombie state, hard test
- "TTL 1h" → cache hit rate <10%, no cost saving
- "Block PZ iter 6" → false-positive rischio block legitimate output Gemini
- "Endpoint unlim-vision separato" → drift PZ + audit dual
- "LLM-driven mapping arguments" → over-engineered iter 6
- "Integration tests iter 6 mandatory" → env coupling + cost iter 6 BLOCKED safety hook

---

## 6. Open questions per Andrea/orchestrator

1. **[ANDREA-DECIDE] PZ block mode timing**: ADR-013 propone warn-only iter 6, flip block iter 7+ post 1 settimana monitoring rate violation. Andrea conferma sequence o vuole block immediato iter 6 (rischio false-positive block legitimate)?

2. **[ANDREA-DECIDE] Memory TTL 24h**: ADR-013 propone TTL 24h per analyzeImage cache. Andrea preferisce TTL più aggressivo (1h freshness max) o più lasco (7gg cost saving max)?

3. **[ANDREA-DECIDE] Composite catalog priority iter 7-8**: ADR-013 §2.10 propone roadmap diagnoseAndExplain (iter 7) + walkThroughExperiment (iter 8). Andrea conferma priorità o vuole alternative (es. compileAndDeploy primo)?

4. **[ORCHESTRATOR] composite_internal status NEW**: HandlerStatus type union espande con 'composite_internal' per filtering buildJsonSchemaForLLM. Mio default: yes, NEW status type, vs alternativa "skipExposeToLLM: boolean" flag. Orchestrator conferma?

5. **[ORCHESTRATOR] Integration tests timing**: ADR-013 deferred integration test iter 7+ (real Edge Function call). Mio default OK iter 6 unit-only baseline, integration iter 7. Orchestrator conferma o vuole integration iter 6 con env keys?

6. **[ORCHESTRATOR] mapArgsForSubTool refactor timing**: ADR-013 hardcoded mapping iter 6, refactor a registry-driven `compose_args_mapping` iter 8+. Orchestrator conferma timing o vuole registry-driven subito iter 6?

7. **State-snapshot-aggregator integration**: ADR-013 §1.5 default `context.aggregate_state=false` iter 6 (latency). Andrea/orchestrator preferisce default true (richer context) o false (faster)?

---

## 7. Riferimenti

- **Master plan**: `docs/architectures/pdr-sett5-openclaw-onnipotenza-morfica-v4.md` §3 (L1/L2/L3 morphic)
- **PDR Sprint S iter 6**: `SETUP-NEXT-SESSION/ARCHITETTURA-FINALE-SESSIONE-2026-04-26.md` §6 P2 8
- **Existing dispatcher**: `scripts/openclaw/dispatcher.ts` iter 4 scaffold (~290 LOC)
- **Existing morphic L1**: `scripts/openclaw/morphic-generator.ts` generateL1Composition (~150 LOC pattern)
- **Existing registry**: `scripts/openclaw/tools-registry.ts` analyzeImage composite_of L457-469
- **Existing tool-memory**: `scripts/openclaw/tool-memory.ts` Supabase pgvector cache (migration applied iter 5)
- **Existing state-aggregator**: `scripts/openclaw/state-snapshot-aggregator.ts` parallel context fetch
- **Existing PZ validator**: `scripts/openclaw/pz-v3-validator.ts` validatePZv3 IT primary
- **Sibling iter 6**: ADR-012 Vision flow E2E Playwright (postToVisionEndpoint pattern shared)
- **Sibling iter 6**: ADR-014 R6 stress fixture extension (post-RAG ingest scoring)
- **Sibling iter 3**: ADR-007 module extraction pattern (isomorfic Deno-Node)
- **Sibling iter 3**: ADR-009 validatePrincipioZero middleware (post-LLM PZ runtime gate)
- **Sibling iter 3**: ADR-010 Together AI fallback gated (chain provider primary EU Gemini)
- **Sibling iter 3**: ADR-011 R5 stress fixture (50 prompts pattern reference)
- **PRINCIPIO ZERO**: `CLAUDE.md` apertura
- **Sprint 6 Day 39 gate**: `CLAUDE.md` Sprint S iter 5 close §10 boxes Box 10 unlock criteria
- **R5 91.80% PASS production**: `CLAUDE.md` Sprint S iter 5 close
