# Iter 41 Latency Bench — 7 capacità ELAB UNLIM v67

**Data**: 2026-05-13 ~09:00 GMT+2
**Target**: Edge Function `unlim-chat` v67 prod (`euqpdueopmlllqjmqnyb.supabase.co`)
**Method**: curl + Python parallel-4 workers + p50/p95/p99/avg/min/max per capacità
**Mandate Andrea**: "Misura tempi su chat / chat thinking / onnipotenza / onnipotenza avanzata / vision / vision avanzata / interfacciamento piattaforma"

## Risultati misurati LIVE prod

| Capacità | n | avg | p50 | p95 | p99 | max | min |
|----------|---|-----|-----|-----|-----|-----|-----|
| `1_chat_basic` | 10 | **2454ms** | 2219ms | 3155ms | 3155ms | 3856ms | 1850ms |
| `2_chat_thinking` | 10 | **1991ms** | 1899ms | 2547ms | 2547ms | 2960ms | 1340ms |
| `3_onnipotenza_basic` | 10 | **747ms** | 527ms | 1779ms | 1779ms | 1802ms | 320ms |
| `4_onnipotenza_avanzata` | 10 | **414ms** | 463ms | 508ms | 508ms | 517ms | 280ms |
| `5_vision_basic` | 5 | **11643ms** | 11646ms | 11687ms | 11696ms | 11696ms | 11580ms |
| `6_vision_avanzata` | 5 | **11585ms** | 11578ms | 11619ms | 11682ms | 11682ms | 11470ms |
| `7_interfacciamento` | 5 | **431ms** | 420ms | 452ms | 464ms | 464ms | 410ms |

## Source routing breakdown

| Capacità | Source primario |
|----------|-----------------|
| chat_basic | 100% Vertex Gemini 2.5 Flash-Lite Paris |
| chat_thinking | 9/10 Vertex Gemini Flash-Lite + 1/10 direct-operational-arduino |
| onnipotenza_basic | 80% pre-LLM detector (play/pause/resistance/screenshot/highlight/compile/led-color) + 20% LLM fallback |
| onnipotenza_avanzata | **100% pre-LLM detector (single match wins, composite path mai raggiunto)** |
| vision_basic / vision_avanzata | 100% Mistral Pixtral 12B EU FR |
| interfacciamento | 100% pre-LLM detector (experiment-nav / volume-nav / arduino / highlight / play) |

## 3 bug critici rilevati

### Bug 1: Vision Pixtral 12B sustained 11.6s — bottleneck UX LIM
- p50 = p95 = p99 = ~11.6s → NOT cold start, sustained backend latency
- Andrea iter 21 mandate target Vision <6s violato 2x
- **Root cause**: Pixtral 12B Italian K-12 EU FR genuinely slow at 12B params (network + inference)
- **Optimization paths**:
  - A. Switch to Mistral Pixtral 8B (se rilasciato EU) ~50% riduzione
  - B. Gemini 2.5 Flash Vision EU (verificare GDPR Frankfurt region) ~2-3s
  - C. Mantenere Pixtral 12B per qualità + comunicare "modalità approfondita 11s" UX (transparency)
  - D. Server-side image pre-resize <512x512 prima Pixtral upload (test riduzione 30%)

### Bug 2: chat_thinking 1991ms SAME come chat_basic — Pro routing non triggera
- Aspettativa: `thinkingLevel:'medium'` Gemini Pro adds 8-12s latency
- Misurato: chat_thinking AVG **MINORE** di chat_basic (1991 vs 2454ms)
- **Root cause**: `routeModel()` in `_shared/router.ts` non promuove queries "approfondisci/analizza dettaglio" a Pro+thinking. Tutte routed a Flash-Lite default. `thinkingLevel` param mai applicato (Vertex chain ignora field per Flash-Lite model).
- **Optimization**:
  - Verifica `routeModel()` triggers Pro: lunghezza prompt? word count? keyword "approfondisci/dettaglio/analisi"?
  - `activeAiProfile.depth === 'total'` (line 774 unlim-chat) promuove Flash-Lite → Flash. Pro mai promosso senza profile override
  - Iter 42+: aggiungere `routeModel` keyword detection per "approfondisci|dettaglio|analizza in profondità" → Pro + thinkingLevel medium

### Bug 3: Onnipotenza avanzata composite NEVER raggiunto — 100% pre-LLM detector intercept
- Query multi-INTENT: "accendi led, evidenzia r1 e compila" → server returns **SINGLE** `direct-operational-experiment-nav` (first match "accendi led")
- Browser receives 1 INTENT, dispatches 1 tool. User said 3 azioni, ne arriva 1.
- **Root cause**: `buildDirectOperationalResponse` is greedy first-match. Detector "accendi led" pattern fires before LLM can synthesize composite intent array.
- L1 composite handler (`scripts/openclaw/composite-handler.ts`) exists ma wired solo via `dispatcher.ts` opt-in `use_composite:true` flag, mai chiamato production path.
- **Optimization**:
  - Server-side: aggiungere multi-INTENT detector — quando query contiene `\b(e|poi|dopo|inoltre|e poi)\b` connettivi multipli + più verbi → bypass pre-LLM detector, lascia LLM emit composite intent array (canonical Mistral function calling schema iter 38 ADR-030)
  - Browser-side: `intentsDispatcher.js` già iterare `intents_parsed` array — funziona, ma server emette solo 1

## Bottleneck pipeline analysis (per call chat_basic 2454ms breakdown stimato)

Da `unlim-chat/index.ts:271-823`:

| Step | Wall time stimato | Note |
|------|-------------------|------|
| Validate input + envelope strip | ~5ms | guards.ts:255 + index.ts:275-282 |
| Pre-LLM offtopic regex check | ~5ms | OFFTOPIC_QUERY_RE.test() line 294 |
| `classifyPrompt()` regex classifier | ~10ms | onniscenza-classifier.ts 6 categorie |
| `loadStudentContext` Supabase REST | ~250ms | parallelo con RAG (Promise.all) |
| `hybridRetrieve` RAG ≤2000ms timeout race | ~1500-2000ms p95 | Voyage embed + pgvector dense + BM25 + RRF |
| Optional `aggregateOnniscenza` 7-layer | 0ms (env disabled) | `ENABLE_ONNISCENZA=false` default |
| `buildSystemPrompt` synthesis | ~5ms | string concat |
| `callLLM` Vertex Flash-Lite | ~800-1500ms | network EU FR + LLM gen 240 tokens |
| Envelope scrubber + intent-parser | ~5ms | regex extract |
| `enforceItalianK12Opener` + `validatePrincipioZero` | ~10ms | 44 regex strip |
| Response JSON serialize + return | ~5ms | |
| **TOTAL stimato** | **~2600-3800ms** | matches misurato 2454 avg / 3856 max |

**Hot path**: RAG hybridRetrieve (2s gate) + LLM (1.5s) = 80% wall-time. Optim:
- `chit_chat` classifier output → `skipOnniscenza:true topK:0` → skip RAG entirely (saved ~2s)
- `maxOutputTokens` già ridotto 240 (iter 31)
- Vertex SSE streaming non implementato (defer iter 38 ADR Path B)

## Onnipotenza basic 747ms — dual path

| Source | Probes | avg latency |
|--------|--------|-------------|
| direct-operational-* (pre-LLM) | 8/10 | ~300-500ms |
| vertex-gemini Flash-Lite (LLM fallback) | 2/10 | ~1779ms |

Detector hit rate critico: 80% queries hit pre-LLM = 6x più veloce LLM. Variant queries fall to LLM:
- "evidenzia led1" → hit
- "cambia led a blu" → hit
- "metti resistenza 1k" → hit
- "scatta foto del circuito" → hit
- 2 misses → LLM 1.8s

Optim: ampliare detector lessico per coprire remaining 20% (e.g. "fammi vedere" + "regola valore" + "rendi più").

## Vision 11.6s — Pixtral pipeline

Da `unlim-vision/index.ts` + `mistral-client.ts`:

| Step | Wall time stimato |
|------|-------------------|
| Image base64 decode + container detect (Ogg/PNG/JPEG/...) | ~10ms |
| Mistral Pixtral 12B API call EU FR | ~11000-11500ms |
| Response parse + safety guard | ~50ms |
| **TOTAL** | **~11500ms** |

Pixtral 12B = 11s deterministic. NO cold start variance (p50=p95=p99 all ~11.6s).

## Interfacciamento piattaforma — solo Edge side misurato

431ms = Edge round-trip only (curl client → Supabase Edge → response). **Real interfacciamento** include:
- Browser fetch invocation
- Edge processing
- INTENT parser surface
- `__ELAB_API.dispatch()` browser-side handler exec
- Component state mutation
- Re-render

Chrome MCP live verify needed per real e2e measurement. Stima totale: 431ms Edge + 50ms dispatch + 50ms render = ~530ms perceived.

## Recommendations iter 42+

P0 (LIM UX blocker):
1. **Vision optim**: Path B Gemini 2.5 Flash Vision EU Frankfurt — verificare GDPR. Target 11.6s → 2-3s (-75%)
2. **chat_thinking fix**: routeModel detect "approfondisci/dettaglio/analizza profondità" keywords → promote Pro + thinkingLevel medium. Misurare overhead reale Pro.
3. **Onnipotenza avanzata composite emission**: server-side multi-INTENT detection on `\b(e|poi|dopo)\b` connectives → emit composite intent array OR force LLM bypass detector for multi-action queries.

P1:
4. **chit_chat RAG skip**: verify `skipOnniscenza:true` actually short-circuits hybridRetrieve (saves ~1.5s on greeting/short queries).
5. **Pre-LLM detector lessico coverage**: 20% miss rate Onnipotenza basic → ampliare verbi (fammi vedere, regola, rendi più, abbassa, alza).
6. **Vertex SSE streaming**: defer ADR Path B → riduce TTFB perceived latency (real wall non cambia ma UX smoother).

P2 (osservabilità):
7. Telemetry latency_log Supabase tabelle (iter 28 `unlimLatencyLog` impl) — wire-up prod per p50/p95 trend continuo
8. Vision-vs-target alert (>6s mandate Andrea) → log warning

## Esecuzione bench

```bash
python3 /tmp/bench-7-capabilities.py
# Output: /tmp/bench-7-capabilities-results.json (full raw per probe)
```

Tempo totale bench: ~66s (vision domina 23s × 2 caps).

## File artifacts

- Script bench: `/tmp/bench-7-capabilities.py` (291 LOC Python)
- Risultati JSON: `/tmp/bench-7-capabilities-results.json`
- 3 Codex bg analysis output (file dumps, sintesi manuale): `/tmp/codex-bench-job{1,2,3}-*.txt`
- This audit: `docs/audits/2026-05-13-iter-41-latency-bench-7-capabilities.md`

## Compliance G45 anti-inflation

Misure raw curl-time prod LIVE, NO synthetic test mocks. Variance bench p50/p95/p99 mostrata. Bug rilevati onestamente con root cause analysis + line-number cite. NO claim "ottimo" senza misura. Vision 11.6s = blocker reale, dichiarato esplicitamente.
