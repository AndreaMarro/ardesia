# PDR Settimana 3 — Edge Function Bridge + Multi-Agent Orchestrator Runtime

**Periodo**: lunedì 05/05/2026 → domenica 11/05/2026
**Owner**: Andrea + Tea + Team 6 agenti Opus
**Goal**: Edge Function bridge UNLIM ↔ Together AI + multi-agent orchestrator runtime + Vercel AI SDK adoption. **Score target**: 7.0/10.

---

## 0. Architettura sett 3

```
Browser (Lavagna LIM)
   │
   ▼
Supabase Edge Function (unlim-chat-v2)
   │
   ├──► Vercel AI SDK Runtime
   │       │
   │       ├──► Together AI (Llama 3.3 70B) [PRIMARY sett 3]
   │       ├──► Anthropic Claude Sonnet (FALLBACK)
   │       └──► Hetzner self-host (RESERVE sett 5+)
   │
   ├──► RAG retrieval (BGE-M3 → pgvector Supabase)
   │
   └──► Multi-Step Agentic Loop
           │
           ├──► Tool: get_circuit_state
           ├──► Tool: highlight_component
           ├──► Tool: serial_write
           ├──► Tool: search_book_text
           └──► Tool: diagnose_circuit
```

**Vercel AI SDK** = scheletro UNLIM (TypeScript, multi-step, tool use, streaming).

---

## 1. Obiettivi misurabili sett 3

| Obiettivo | Target |
|-----------|--------|
| Edge Function unlim-chat-v2 deployed | sì |
| Vercel AI SDK integrato + multi-step loop | sì |
| 5 tool definite + invokable | 5/5 |
| Together AI fallback chain (Anthropic) | sì |
| RAG retrieval BGE-M3 + pgvector | sì |
| Multi-agent orchestrator runtime base | sì |
| Test count growth | +300 (12556+) |
| Score benchmark | 7.0 |
| Tea PR auto-merge ≥4 (esperimenti vol3) | ≥4 |
| Live verify produzione | smoke test PASS |
| claude-mem decisions log ≥30 cumulative | ≥30 |

---

## 2. Stack tecnico sett 3

### Vercel AI SDK (scheletro UNLIM)

**Why**:
- TypeScript native (matching frontend)
- Multi-step agentic loop (`streamText` + tools)
- Tool use schema standard
- Streaming response built-in
- Provider switching seamless (Together → Anthropic → self-host)

**Esempio integration Edge Function**:
```typescript
// supabase/functions/unlim-chat-v2/index.ts
import { streamText, tool } from 'ai';
import { togetherai } from '@ai-sdk/togetherai';
import { z } from 'zod';

const tools = {
  get_circuit_state: tool({
    description: 'Get current circuit state (components, wires, mode)',
    parameters: z.object({}),
    execute: async () => {
      // Forward to browser via SSE
      return { components: [...], wires: [...], mode: 'simulator' };
    }
  }),
  highlight_component: tool({
    description: 'Highlight component on lavagna LIM',
    parameters: z.object({ ids: z.array(z.string()) }),
    execute: async ({ ids }) => {
      // Forward to browser via SSE
      return { highlighted: ids };
    }
  }),
  // ... 3 more tools
};

const result = streamText({
  model: togetherai('meta-llama/Llama-3.3-70B-Instruct-Turbo'),
  system: PRINCIPIO_ZERO_V3_SYSTEM_PROMPT,
  messages: [...],
  tools,
  maxSteps: 5  // Multi-step agentic loop
});
```

### RAG retrieval BGE-M3 + pgvector

```sql
-- Supabase pgvector setup
CREATE EXTENSION vector;
ALTER TABLE rag_chunks ADD COLUMN embedding vector(1024);
CREATE INDEX ON rag_chunks USING ivfflat (embedding vector_cosine_ops);

-- Query retrieval
SELECT chunk_text, source, 1 - (embedding <=> query_embedding) AS similarity
FROM rag_chunks
ORDER BY embedding <=> query_embedding
LIMIT 5;
```

### Multi-agent orchestrator runtime

**Differenza vs team agenti dev**:
- Team agenti dev = Andrea coordina dispatch sviluppo
- Orchestrator runtime = UNLIM serve studenti, multi-step decisioni AI runtime

**Pattern**:
```
User query "Spiegami circuito"
   │
   ▼
Lead Orchestrator (Llama 70B)
   │
   ├──► Specialist 1: Circuit Analyzer (parallel)
   ├──► Specialist 2: Book Retriever (parallel)
   └──► Specialist 3: Pedagogical Adapter (parallel)
   │
   ▼
Lead synthesizes → Principio Zero v3 response
```

---

## 3. Task breakdown 7 giorni

### Lun 05/05 — Vercel AI SDK install + first tool

- DEV agente: install `ai` + `@ai-sdk/togetherai` su edge function
- DEV agente: implementa primo tool `get_circuit_state` + bridge SSE browser
- TESTER agente: integration test tool invocation
- File: `giorni/PDR_GIORNO_15_LUN_05MAG.md`

### Mar 06/05 — Edge Function unlim-chat-v2

- DEV: deploy Edge Function nuova `unlim-chat-v2` con Vercel AI SDK
- DEV: implementa multi-step loop (maxSteps: 5)
- DEV: streaming SSE response → browser
- TESTER: E2E test query → multi-step → response
- File: `giorni/PDR_GIORNO_16_MAR_06MAG.md`

### Mer 07/05 — RAG retrieval BGE-M3

- DEV: implementa pgvector schema Supabase
- DEV: PTC batch insert 549 chunk con embedding BGE-M3
- DEV: tool `search_book_text` retrieval BGE-M3
- TESTER: recall test query → relevant chunks
- File: `giorni/PDR_GIORNO_17_MER_07MAG.md`

### Gio 08/05 — Tool 3+4+5

- DEV: tool `highlight_component` (forward browser)
- DEV: tool `serial_write` (Arduino emulation)
- DEV: tool `diagnose_circuit` (rule-based + LLM)
- TESTER: 5/5 tools E2E test
- File: `giorni/PDR_GIORNO_18_GIO_08MAG.md`

### Ven 09/05 — Multi-agent orchestrator runtime

- ARCHITECT: blueprint orchestrator Lead + 3 Specialist
- DEV: implementa Lead orchestrator (Llama 70B)
- DEV: implementa 3 Specialist (Llama 70B parallel)
- TESTER: PTC parallel test 10 query orchestration
- Tea: PR esperimenti Vol 3 cap 4-5
- File: `giorni/PDR_GIORNO_19_VEN_09MAG.md`

### Sab 10/05 — Anthropic fallback + monitoring

- DEV: fallback chain Together → Anthropic Claude (rate limit, error 5xx)
- DEV: Sentry integration error tracking
- AUDITOR: live verify fallback scenario (kill Together, verify Anthropic kicks in)
- File: `giorni/PDR_GIORNO_20_SAB_10MAG.md`

### Dom 11/05 — Handoff sett 3 + retro

- Handoff: `docs/handoff/2026-05-11-end-sett3.md`
- Score benchmark.cjs --write (target 7.0)
- Retro Andrea + Tea
- File: `giorni/PDR_GIORNO_21_DOM_11MAG.md`

---

## 4. Costi sett 3

| Voce | Costo |
|------|-------|
| Together AI usage (5K query stimato) | ~€15 |
| Hetzner CX31 (full mese) | €8.21 |
| RunPod testing (~10h GPU) | ~€4 |
| Anthropic Sonnet fallback (low usage) | ~€2 |
| **TOTALE settimana 3** | **~€29** |

---

## 5. Definition of Done sett 3

- [x] Edge Function unlim-chat-v2 deployed + healthy
- [x] Vercel AI SDK integrato + multi-step loop OK
- [x] 5 tools definite + invokable
- [x] RAG BGE-M3 retrieval recall ≥0.85
- [x] Multi-agent orchestrator runtime operativo
- [x] Anthropic fallback chain testato
- [x] Score ≥7.0
- [x] Test ≥12556
- [x] Tea PR ≥4 auto-merged
- [x] Handoff doc completo

---

## 6. Self-critica

- Vercel AI SDK + 5 tools + orchestrator + RAG + fallback in 7 giorni = **molto ambizioso**. Realistic: 70% completion, 30% slip a sett 4.
- Tool definitions richiedono examples (vedi PROGRAMMATIC_TOOL_CALLING.md sezione 5) per accuracy 90% — non skip.
- Multi-step loop maxSteps=5 può loopare infinito su edge case → time-box 30s response.

---

**Forza ELAB. Sett 3 inizia lun 05/05.**
