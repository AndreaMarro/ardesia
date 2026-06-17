# PDR ITER 37 — Orchestrazione Perfetta + Massima Velocità UNLIM

**Data**: 2026-04-30 PM (PDR-B iter 37 — Sessione 2/3 della cascata)
**Branch**: `e2e-bypass-preview`
**Pattern**: 7-agent OPUS Pattern S r3 + Mac Mini continuous mapping H24
**Anti-inflation**: G45 — score Opus-indipendente review obbligatorio
**Anti-regressione**: vitest baseline 13245 (post iter 36) NEVER scendere

---

## §0 — PRINCIPIO ZERO + MORFISMO compliance gate (OBBLIGATORIO ogni atom)

**Reference autoritativo**: `CLAUDE.md` "DUE PAROLE D'ORDINE" §1+§2 + `docs/pdr/PDR-ITER-36-*.md §0`.

**PRINCIPIO ZERO** (pedagogico): plurale "Ragazzi," + Vol/pag VERBATIM «caporali» + ≤60 parole + 1 analogia + kit fisico ELAB mention OBBLIGATORIO ogni response chat/streaming SSE/voice TTS.

**MORFISMO Sense 1+1.5+2** preservato iter 37 lift orchestrazione perfetta:
- Sense 1 morphic runtime: Onniscenza 7-layer cross-pollination LIVE prod (lift Box 11)
- Sense 1.5 mascotte streaming animation lip-sync (Atom B6) + loading state morphic (Atom B7)
- Sense 2 triplet Voxtral voice clone Andrea narratore = stesso registro Volumi Davide cartacei

### Gate compliance iter 37 (oltre iter 36 §0):

1. ✅ **Streaming SSE preserva PZ V3**: ogni chunk DELTA preserva plurale + Vol/pag verbatim (NO drift mid-stream)
2. ✅ **TTS chunking preserva voce clone Andrea IT**: chunk audio Voxtral mantenuti identici registro Volumi (NON cross-lingual EN→IT fallback)
3. ✅ **Onniscenza 7-layer hit ≥5/7 prod cycle**: L1 RAG + L2 Wiki + L3 Glossario + L4 Memoria + L5 Vision + L6 LLM-history + L7 Circuit-state — measure Mac Mini Cron Livello 3 metric
4. ✅ **ClawBot 100% prod path**: L2 template short-circuit pre-LLM ALWAYS first + dispatcher post-LLM solo se INTENT tag (morphic dispatcher dynamic)
5. ✅ **Vision Gemini Flash EU**: response Italian K-12 + cita Vol/pag se riconosce esperimento ELAB (Pixtral fallback identical PZ V3 compliant)
6. ✅ **R6 100-prompt ≥93%**: PZ V3 score lift +1.5pp post-Onniscenza inject (vs R5 91.45%)
7. ✅ **Cross-pollination test 6° prompt**: ricorda L6 history 5-turn Ragazzi + plurale + Vol/pag preserved
8. ✅ **Multimodal stress**: Voxtral + Vision Gemini + STT CF + Onniscenza 4/4 capabilities <8s totale, voice clone Andrea preserved

**Anti-inflation G45 cap iter 37**: NO claim score >9.0 senza Mac Mini Livello 3 PASS rate ≥80% verified Opus-indipendente.

---

## §1 — Goal imperativo

A fine sessione TUTTI i seguenti DEVONO essere VERIFIED LIVE prod:

1. ✅ **Onniscenza 7-layer aggregator** TUTTI i layer LIVE wired (era 6/7, manca L6 chat history + L7 circuit_state injection)
2. ✅ **Cross-pollination output incrocio**: ogni risposta UNLIM cita simultaneamente RAG + Glossario + Wiki + Capitolo + (se vision) immagine + memoria sessione
3. ✅ **Latency p95 chat warm <2.5s** (vs iter 36 <4s, lift via streaming SSE Mistral + warm-up Cron 30s)
4. ✅ **Streaming SSE prima parola <300ms perceived** (Mistral chat completions streaming endpoint)
5. ✅ **TTS pre-fetch parallel chat** (mentre LLM genera testo, TTS pre-warmed)
6. ✅ **TTS audio chunking streaming playback** (Voxtral chunk by chunk, non aspetta full mp3)
7. ✅ **ClawBot dispatcher post-LLM 100% prod path** (era opt-in, ora default ON)
8. ✅ **Vision Gemini Flash + Pixtral fallback A/B test 50 cases** (qualità evaluation Italian K-12)
9. ✅ **Onniscenza A/B test ENABLE_ONNISCENZA=true** prod 50% traffic (B2 measure recall@5 ≥0.55)
10. ✅ **R6 stress 100 prompts post-Onniscenza inject** (≥93% PZ V3 score, lift +1.5pp vs R5 91.45%)

**Score iter 37 target ONESTO G45 cap**: **9.0/10** (iter 36 8.5 + 0.5 lift).

---

## §2 — Team 7 agenti orchestrato (continua iter 36)

Stessa struttura iter 36 §2. **Lift modifiche iter 37**:

| Agente | Lift iter 37 |
|--------|--------------|
| Maker-1 | Streaming SSE Mistral + TTS chunking + ClawBot dispatcher 100% |
| Maker-2 | ADR-029 Streaming SSE + ADR-030 ClawBot 100% rollout |
| WebDesigner-1 | Mascotte UNLIM "parla durante streaming" animation morphic |
| WebDesigner-2 | Loading state UX (era "spinner generic", ora "UNLIM sta pensando..." + sparkle iconography) |
| Tester-1 | E2E streaming Playwright (verify first byte <300ms) + R6 100 prompts exec |
| Tester-2 | Onniscenza layer-by-layer parallel debug (L1...L7 hit verification) |
| Documenter | Mem-search "iter 30+31+32 Onniscenza implementation" + WebSearch streaming SSE Mistral best practices 2026 |

**Mac Mini continuous mapping iter 37 lift**:
- Add Cron 1min "Onniscenza A/B counter" misuratore quanti prompt HIT layer L4-L7 vs solo L1+L2 (Onniscenza efficacia metric)
- Add Cron 5min "Streaming SSE first-byte timing" — measure ttfb_chat 50 calls/h
- Mac Mini → MacBook: branch `mac-mini/iter37-onniscenza-metrics-*` push 30min

---

## §3 — Atomi imperativi (12 ATOM-S37)

### Atom B1 — Maker-1 — Streaming SSE Mistral chat (P0 latency)

**File**: `supabase/functions/_shared/mistral-client.ts` + `supabase/functions/unlim-chat/index.ts` + frontend `src/components/lavagna/useGalileoChat.js`

**Spec server**:
```typescript
// supabase/functions/_shared/mistral-client.ts
export async function* streamMistralChat(req: ChatReq): AsyncGenerator<string> {
  const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { /* ... */ },
    body: JSON.stringify({ ...req, stream: true }),
  });
  const reader = resp.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // SSE parse "data: {...}\n\n"
    while (buffer.includes('\n\n')) {
      const [event, ...rest] = buffer.split('\n\n');
      buffer = rest.join('\n\n');
      if (event.startsWith('data: ')) {
        const data = event.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch {}
      }
    }
  }
}
```

**Spec endpoint**: `unlim-chat` accept query `?stream=true` → return `text/event-stream` con `data: {token, idx}` ogni delta.

**Spec frontend**: `useGalileoChat` consume SSE stream → setMessage incrementally → mascotte "parla in streaming".

**Test**: Tester-1 Playwright misura first-byte time + complete time + token count.

**Acceptance**: first-byte <300ms p50, complete time <2.5s warm, ZERO regressioni in non-streaming code path.

**Time**: 5h (Maker-1 4h + Tester-1 1h).

---

### Atom B2 — Maker-1 — TTS audio chunking streaming Voxtral

**File**: `supabase/functions/_shared/voxtral-client.ts` + `unlim-tts/index.ts` + frontend audio player

**Spec**:
- Voxtral API supports streaming chunks (verify via Mistral docs WebSearch)
- Frontend: MediaSource API streaming audio playback (no aspettare full mp3)
- Pre-fetch parallel chat: when chat starts, TTS warm-up con prima frase tentative

**Acceptance**: audio first-sample <500ms p50 post chat first-token (vs iter 35 ~2.2s end-to-end mp3 full).

**Risk**: Voxtral API potrebbe NON supportare streaming → fallback Edge TTS Isabella che SI supporta WS streaming (iter 8 ADR-016).

**Time**: 4h.

---

### Atom B3 — Maker-1 — ClawBot dispatcher 100% prod (default ON)

**File**: `supabase/functions/unlim-chat/index.ts` + env config

**Spec**:
```typescript
// remove env flag gate, dispatcher always ON
const intents = parseIntentTags(llmResult.text);
const dispatchResults = intents.length > 0 
  ? await Promise.all(intents.map(...)) 
  : [];
```

**Anti-regression check**: 50 R6 prompts execute → >80% INTENT executed correttamente, 0 crash, 0 timeout.

**Time**: 1h post iter 36 wire.

---

### Atom B4 — Maker-1 — Onniscenza L6 + L7 wire-up

**File**: `supabase/functions/_shared/onniscenza-bridge.ts` + `unlim-chat/index.ts`

**Spec L6 chat history**:
```typescript
// extend ChatRequest type
type ChatRequest = {
  ...
  history?: Array<{ role: 'user'|'assistant', content: string }>; // last N=4 turns
};

// frontend useGalileoChat passes history = messages.slice(-4)
// onniscenza-bridge L6 layer: tokenize history → BM25 retrieve concept matches
```

**Spec L7 circuit_state**:
```typescript
// frontend collectFullContext returns circuit_state JSON
// pass via ChatRequest.circuitState
// onniscenza-bridge L7: enrich query with "stato circuito attuale: {...componenti, fili...}"
```

**Acceptance**: aggregateOnniscenza top-3 RRF hits include L6+L7 entries quando rilevante.

**Time**: 2h.

---

### Atom B5 — Maker-2 — ADR-029 Streaming SSE + ADR-030 ClawBot 100% prod

**File**: 2 NEW ADR ~600 LOC totali.

**ADR-029 Streaming SSE**: protocol spec, fallback non-streaming, error handling, browser compat.

**ADR-030 ClawBot 100% rollout**: rollout plan A/B → 100%, kill switch, observability, intent dispatch metric dashboard Supabase.

**Time**: 3h.

---

### Atom B6 — WebDesigner-1 — Mascotte UNLIM "parla durante streaming"

**File**: `src/components/unlim/MascotPresence.jsx` + CSS module

**Spec**:
- State `streaming|idle|thinking|listening` morphic
- During streaming: mouth animation lip-sync (simulato via loop frames)
- Sparkle effect quando arrivano nuovi token
- Sound subtle "tick" ogni N token

**Skills used**: `/impeccable:animate` + `/impeccable:delight` + `/canvas-design`.

**Time**: 3h.

---

### Atom B7 — WebDesigner-2 — Loading state UX morphic

**File**: vari componenti chat + simulator + Vision

**Spec**:
- Replace "Loading..." spinner generic con messaggi morphic morphing:
  - Chat: "UNLIM sta consultando il Volume..." → "Citando pag. X..." → "Quasi pronto..."
  - Vision: "UNLIM sta osservando il vostro circuito..."
  - TTS: "Voce in arrivo..."
- Animation: dots fade + sparkle iconography ElabIcons

**Skills used**: `/impeccable:clarify` + `/impeccable:delight`.

**Time**: 2h.

---

### Atom B8 — Tester-1 — R6 100 prompts execute post-Onniscenza

**File**: `scripts/bench/r6-fixture.jsonl` already 100 prompts (iter 8) → execute + measure.

**Spec**:
- Run R6 stress 100 prompts (10 per categoria × 10 categorie K-12)
- Score per 12-rule PZ V3 + Onniscenza-aware metric (cita Vol/pag VERBATIM + Wiki concept + Glossario term)
- Compare vs R5 baseline 91.45%
- Output `scripts/bench/output/r6-iter37-{report,scores}.{md,json}`

**Acceptance**: R6 ≥93% (lift +1.5pp), citation_vol_pag ≥80% (vs iter 35 ~50% drift), kit_mention 100%, plurale_ragazzi 100%.

**Time**: 2h (1h exec + 1h analyze).

---

### Atom B9 — Tester-1 — Vision A/B Gemini vs Pixtral 50 cases

**File**: `scripts/bench/vision-ab-gemini-pixtral.mjs` NEW

**Spec**:
- 50 immagini circuit Italian K-12 (ELAB Vol1+2+3 esperimenti)
- Round 1: 50 chiamate `provider=gemini` → score Pixtral 12B Italian K-12 evaluation framework iter 28 (14 PASS)
- Round 2: 50 chiamate `provider=pixtral` (force fallback) → stesso score
- Compare quality + latency + cost

**Acceptance**: Gemini Flash quality ≥ Pixtral (atteso pari o superiore Italian K-12), latency Gemini 2× faster, cost Gemini 50% lower.

**Time**: 3h.

---

### Atom B10 — Tester-2 — Onniscenza layer-by-layer parallel debug

**File**: `tests/integration/onniscenza-7-layers.test.js` NEW

**Spec**:
- 7 test cases each isolating 1 layer attivo
  - L1 RAG only: query "spiegami LED" → verify hit rag_chunks
  - L2 Wiki only: query "cos'è arduino-cli" → verify wiki concept hit
  - L3 Glossario: query "anodo catodo" → verify Tea glossario term
  - L4 Class memory: prerequisito 1 sessione passata salvata → verify hit
  - L5 Vision: query "guarda circuito" + image → verify Pixtral/Gemini called
  - L6 LLM history: 5 turn conversation → verify history tokenized retrieve
  - L7 Circuit state: simulator state present → verify state in context

**Acceptance**: 7/7 layers hit independently + integration test 1 query trigger 5+ layers (cross-pollination).

**Time**: 4h.

---

### Atom B11 — Documenter — Mac Mini USER-SIMULATION Livello 3 stress + metrics

**Reference**: `docs/pdr/MAC-MINI-USER-SIMULATION-CURRICULUM.md` §2 Livello 3 (Cron 2h, persona P3 curiosa primary). 10 scenari Onniscenza+Onnipotenza stress (Vision flow + cross-pollination history + 7-layer hit verify + L2 template short-circuit + INTENT dispatch + Fumetto + wake word + edge cases + TTS streaming + multimodal stress). Acceptance ≥80% PASS (8/10) + ≥5/7 layer hit + ≥85% INTENT exec rate. MacBook orchestrator parsa Livello 3 score → if <80% emergency dispatch + iter close audit dump anti-inflation G45 mandate.

**File**: Mac Mini `~/scripts/elab-iter37-onniscenza-metrics.sh` NEW

**Spec**:
```bash
#!/bin/bash
# 1min Cron: poll Supabase logs (Edge Function unlim-chat)
# count: layer L4-L7 hit rate, query Postgres `onniscenza_log` table
# 5min Cron: 50 chat calls measure first-byte time SSE
# output: ~/Library/Logs/elab/iter37-onniscenza-metrics.csv
```

**Time**: 1.5h Documenter setup.

---

### Atom B12 — Documenter — Audit + handoff iter 37 + skill chain "perfect-orchestration"

**File**: `docs/audits/2026-04-30-iter-37-PHASE3-CLOSE-audit.md` (~450 LOC) + `docs/handoff/2026-04-30-iter-37-to-iter-38-handoff.md` (~280 LOC) + NEW skill `perfect-orchestration` markdown spec

**NEW skill `perfect-orchestration`** (in `.claude/skills/perfect-orchestration.md`):
- Trigger: query contains "orchestrazione perfetta" / "tutti modelli sintonia" / "incrocio conoscenza"
- Action: spawn 7-agent Pattern S r3 + Onniscenza 7-layer verify + ClawBot 100% verify + streaming verify + Mac Mini Cron metrics
- Guards: G45 anti-inflation cap + Pattern S race-cond fix + filesystem barrier

**Time**: 3h.

---

## §4 — Anti-inflation benchmark obbligatorio iter 37

| Metrica | Pre iter 37 | Target iter 37 ONESTO | Misurazione |
|---------|-------------|------------------------|-------------|
| vitest PASS | ≥13245 | ≥13260 (+15 NEW Onniscenza tests) | `npx vitest run` |
| R5 50-prompt | 91.45% | (baseline) | inalterato |
| R6 100-prompt | mai eseguito | ≥93% | `bench/run-sprint-r6-stress.mjs` |
| Chat first-byte SSE | N/A | <300ms p50 | Mac Mini Cron measure |
| Chat complete warm | <4s | <2.5s | Mac Mini Cron measure |
| TTS first-sample | ~2.2s | <500ms p50 | manual smoke |
| Vision Gemini quality | unverified | ≥Pixtral parity (Italian K-12) | bench A/B 50 cases |
| Onniscenza L4-L7 hit rate | <10% | >40% | Mac Mini Cron metric |
| INTENT execute rate | iter 36 baseline | ≥85% | R6 100-prompt analyze |

**Score formula**: stesso iter 36, target 9.0 G45 cap.

**Cap conditions**:
- Streaming non funziona prod: cap 8.0
- R6 <93%: cap 8.5
- Onniscenza L4-L7 <30% hit: cap 8.5

---

## §5 — Anti-regressione FERREA iter 37

Stesse iter 36 §5 + ADD:

8. **Streaming SSE non rompe non-streaming path**: env flag `ENABLE_STREAMING=true` default, fallback non-streaming testato 10 prompts.
9. **TTS chunking non rompe full-mp3 path**: env flag `ENABLE_TTS_CHUNKING=true` default, fallback full mp3 testato 10 voci.
10. **ClawBot 100% non rompe template L2 path**: L2 short-circuit pre-LLM ALWAYS first, dispatcher post-LLM solo se LLM produced INTENT tag.

---

## §6 — Phase coordination iter 37

Identico iter 36 §6 ma time budget +2h (totale 12h):

| Phase | Time | Notes |
|-------|------|-------|
| Phase 0 | 30min | entrance CoV iter 36 baseline tag |
| Phase 1 | 8h | 6 atomi parallel più pesanti (streaming + Onniscenza + bench) |
| Phase 2 | 2h | Documenter sequential |
| Phase 3 | 1.5h | verify + commit + push + Mac Mini fresh mapping |

---

## §7 — Activation string iter 37

```
Esegui PDR-B iter 37 in `docs/pdr/PDR-ITER-37-ORCHESTRAZIONE-PERFETTA-LATENZA.md`. 
Continua 7-agent Pattern S r3 + Mac Mini Cron iter 37 metrics.
Iter 36 audit pre-flight check: docs/audits/2026-04-30-iter-36-PHASE3-CLOSE-audit.md ≥8.5/10. 
Anti-inflation G45 cap 9.0. Anti-regressione vitest 13245+. 
Phase 0 entrance + Phase 1 8h streaming SSE + Phase 2 Documenter 2h + Phase 3 verify 1.5h.
```

### Plugin + connettori suggeriti iter 37

| Categoria | Plugin/Connettore | Uso atomi |
|-----------|-------------------|-----------|
| Streaming SSE | `vercel:ai-sdk` (streaming patterns) `WebSearch` "Mistral chat completions stream 2026" + `mcp__plugin_context7_context7__query-docs` (Mistral API docs) | Atom B1 server SSE + Atom B2 TTS chunking |
| Performance | `application-performance:performance-engineer` `vercel:vercel-agent` `vercel:performance-optimizer` | Atom B1 ttfb + Atom B2 latency |
| Vision A/B | Playwright MCP screenshot capture + `WebSearch` Gemini 2.5 Flash benchmarks | Atom B9 Vision A/B 50 cases |
| Frontend animation | `/impeccable:animate` `/impeccable:delight` `/canvas-design` | Atom B6 mascotte streaming |
| UX clarity | `/impeccable:clarify` `/impeccable:onboard` `design:ux-copy` `design:design-critique` | Atom B7 loading state morphic |
| Onniscenza debug | `/superpowers:systematic-debugging` `/parallel-debugging` `mcp__plugin_supabase_supabase__*` (logs Edge Function) | Atom B10 7-layer parallel test |
| Bench R6 | `node scripts/bench/run-sprint-r6-stress.mjs` `node scripts/bench/score-unlim-quality.mjs` | Atom B8 R6 100-prompt |
| Architecture ADR | `/feature-dev:code-architect` `/superpowers:writing-plans` `/superpowers:writing-skills` | Atom B5 ADR-029 + ADR-030 |
| Memory | `/claude-mem:mem-search` "iter 30+31+32 Onniscenza" + `/claude-mem:timeline` | Atom B12 research |
| MAC Mini | SSH `progettibelli@100.124.198.59` + `elab-macmini-controller` skill | Atom B11 metrics Cron |
| Vercel deploy | `mcp__57ae1081-...__deploy_to_vercel` + `mcp__57ae1081-...__get_deployment` | Phase 3 deploy verify |
| Web research | `/firecrawl` `WebSearch` "Voxtral streaming chunks API" + `mcp__plugin_context7_context7__resolve-library-id` | Atom B2 chunking research |
| TTS | `voxtral-client.ts` + `edge-tts-client.ts` (fallback Isabella WS) | Atom B2 fallback chain |
| Telemetry | `mcp__plugin_posthog_*:llm-analytics` (LLM trace) + Sentry traces | Mac Mini metrics |
| Skill creation | `/anthropic-skills:skill-creator` per NEW skill `perfect-orchestration` Atom B12 | Atom B12 skill chain |

---

## §8 — Output finale iter 37

`docs/handoff/2026-04-30-iter-37-to-iter-38-handoff.md` DEVE contenere:

1. ✅ Score G45 ≤9.0 ricalibrato
2. ✅ 12 atoms B1-B12 delivery matrix file system verified
3. ✅ Streaming SSE LIVE prod evidence (curl ttfb measure)
4. ✅ Onniscenza 7-layer LIVE all hit rate measured
5. ✅ R6 100-prompt score ≥93%
6. ✅ Vision Gemini vs Pixtral A/B comparison
7. ✅ Mac Mini iter 37 metrics CSV link
8. ✅ Iter 38 priorities preview (PDR-C)
9. ✅ ACTIVATION STRING iter 38 paste-ready
10. ✅ Andrea ratify queue updated
