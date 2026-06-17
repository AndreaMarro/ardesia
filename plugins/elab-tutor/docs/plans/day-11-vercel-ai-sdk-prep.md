# Day 11 Vercel AI SDK Integration — Plan Seed

**Cumulative Day**: 11 (target gio 01/05 per Sprint 2 addendum → anticipato gio 23/04 actual)
**Story**: S2-4 Vercel AI SDK tool calling integration
**Scope owner**: DEV
**Prep done**: Day 09 context7 query

## Stack context

- Current LLM dispatcher: `src/services/llm-client.ts` (Together AI Llama 3.3 70B Turbo default, Gemini fallback per ADR-002)
- Supabase Edge Function orchestrator: `unlim-chat`
- Vercel platform: AI Gateway available (GA Aug 2025) — prefer `"provider/model"` strings through gateway

## Vercel AI SDK multi-step pattern (from context7 /vercel/ai)

### Core API

```typescript
import { generateText, streamText, tool, isStepCount, stepCountIs } from 'ai';
import { z } from 'zod';

const { text, steps } = await generateText({
  model: 'openai/gpt-4.1', // OR via Vercel Gateway: 'together/meta-llama/Llama-3.3-70B-Instruct-Turbo'
  stopWhen: isStepCount(5), // OR stepCountIs(5) — iterative tool calls capped
  tools: {
    toolName: tool({
      description: 'What this tool does',
      inputSchema: z.object({
        param: z.string().describe('Param description'),
      }),
      execute: async ({ param }) => {
        return { result };
      },
    }),
  },
  prompt: 'User query',
});
```

### Multi-step behavior

- LLM generates tool call → executes → result fed back → LLM continues until `stopWhen` triggers
- `isStepCount(N)` ≡ `stepCountIs(N)` (both syntax in docs — prefer `stepCountIs` per latest)
- `result.steps` array for auditability

### streamText equivalent

- Same signature, streams tokens instead of returning full string
- Used for UI streaming (SSE/WebSocket) in assistant UI
- `sendFinish`/`sendStart` for multi-step UI message merging

## ELAB integration strategy Day 11

### 5 candidate tools for UNLIM

1. **`getCircuitState`** — return current simulator circuit JSON via `window.__ELAB_API.unlim.getCircuitState()`
2. **`highlightComponent`** — `inputSchema: { ids: z.array(z.string()) }` → `unlim.highlightComponent(ids)`
3. **`captureScreenshot`** — Vision-ready PNG base64 → feeds next step to Gemini Vision
4. **`queryRAG`** — 549-chunk search: `inputSchema: { query: z.string(), topK: z.number().default(3) }`
5. **`readVolumePage`** — `inputSchema: { volume: z.enum(['vol1','vol2','vol3']), page: z.number() }` → returns `bookText` + `imageRef`

### Integration points

- Edge Function: Supabase `unlim-chat` wraps Vercel AI SDK dispatcher (OR direct LLM call)
- Frontend hook: `src/components/lavagna/useGalileoChat.js` consumes streaming response
- Stop condition: `stepCountIs(5)` — matches Sprint 2 roadmap limit

### PZ v3 preservation

- Multi-step agent output MUST maintain Principio Zero v3 system prompt immutability
- Tool execution results feed back → final text must plural "Ragazzi"+ cite volume page (BASE_PROMPT Ragazzi + volume page invariant)
- Test plan: add 3 CoV prompts with tool calls, verify final text still PZ v3 compliant

## DoR check Day 11

- [x] Context7 Vercel AI SDK docs captured Day 09
- [ ] Vercel AI SDK dependency approval from Andrea (CLAUDE.md Regola 13)
- [ ] Edge Function architecture decision: SDK in Deno (Supabase) OR proxy to Vercel Function
- [ ] 5 tool signatures finalized + Zod schemas validated
- [ ] Test harness: 3 multi-step prompts + PZ v3 compliance assertions

## DoD Day 11

- [ ] `src/services/vercelAiAgent.ts` or similar with `generateText({model, tools, stopWhen})`
- [ ] 5 tools defined with Zod schemas (minimum 2 implemented + 3 stubbed if scope tight)
- [ ] `stopWhen: stepCountIs(5)` enforced
- [ ] Unit tests ≥ 10 new (mock tool executes + step count limit)
- [ ] Integration test with real LLM (Together AI or Gateway)
- [ ] PZ v3 compliance verified on multi-step output
- [ ] CoV 3x PASS
- [ ] CHANGELOG Day 11 entry
- [ ] ADR-004 "Vercel AI SDK integration strategy" documented

## Open questions Day 11

- Gateway routing for Together AI: `'together/meta-llama/Llama-3.3-70B-Instruct-Turbo'` OR direct via `@ai-sdk/togetherai`?
- Edge Function Deno runtime compatibility with `ai` package (Node built-ins)?
- Fallback chain: Together → Gemini preserved how when using Vercel AI SDK dispatcher?

## Risk flags

- **Blocker risk P1**: Vercel AI SDK may require Node 24 LTS (Vercel default) vs Supabase Edge Function Deno = incompatible. Mitigation: run SDK on Vercel Function, NOT in Edge Function.
- **Regression risk**: refactoring `llm-client.ts` to SDK could break 20+ PZ v3 test assertions. Mitigation: SDK additive, keep `llm-client.ts` as fallback path.
- **Cost risk**: multi-step tool calls = N× LLM invocations per user prompt. `stopWhen: stepCountIs(5)` caps but still 5× base cost. Budget review needed.
