---
id: ADR-023
title: Onniscenza completa UNLIM — 7-layer unified knowledge access via state-snapshot-aggregator parallel orchestration (Sprint T iter 22-25 maturazione)
status: PROPOSED
date: 2026-04-28
deciders:
  - architect-opus (Sprint S iter 18 PM, ralph loop /caveman dynamic mode)
  - Andrea Marro (final approver iter 22 entrance — env provision + Postgres migration apply + Vision flow self-hosted vs Gemini EU decision)
context-tags:
  - sprint-t-iter-22
  - sprint-t-iter-23
  - sprint-t-iter-24
  - sprint-t-iter-25
  - onniscenza-unified-access
  - 7-layer-knowledge-stack
  - state-snapshot-aggregator
  - rag-hybrid-bm25-dense
  - wiki-llm-kebab-case
  - glossario-tea-ingest
  - session-class-memory
  - vision-flow-multimodal
  - llm-knowledge-italian
  - latency-p50-2s-p95-5s
  - principio-zero-v3
  - morfismo-sense-1.5
  - gdpr-eu-data-residency
related:
  - CLAUDE.md §0 DUE PAROLE D'ORDINE Principio Zero V3 + Sense 1.5 Morfismo runtime
  - ADR-008 (buildCapitoloPromptFragment Vol/pag verbatim citazioni)
  - ADR-009 (Principio Zero validator middleware V3 plurale Ragazzi + ≤60 parole)
  - ADR-013 (ClawBot composite handler L1 morphic — runtime tool composition)
  - ADR-015 (Hybrid RAG retriever BM25+dense+RRF k=60+rerank — Layer 1 RAG impl)
  - ADR-019 (Sense 1.5 Morfismo runtime docente + classe — Layer 4 contesto sessione)
  - ADR-022 (VPS GPU GDPR-compliant production stack Sprint T iter 17+ — Layer 5 Vision + Layer 6 LLM-knowledge self-hosted EU)
  - docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md §6 Sprint T iter 22-25 maturazione Onniscenza+Onnipotenza
  - docs/architectures/ADR-024-onnipotenza-clawbot-iter-22-25.md (sibling ADR — Onnipotenza ClawBot 80-tool pilot via Onniscenza)
input-files:
  - src/data/rag-chunks.json (1881 chunks attuale, target 2241 post Glossario Tea ingest iter 19+)
  - src/services/unlimContextCollector.js (Layer 7 contesto on-the-fly + Layer 4 sessione collector existing)
  - src/services/unlimMemory.js (3-tier memory short/medium/long → Layer 4 estensione classe Supabase)
  - supabase/functions/_shared/rag.ts (Layer 1 RAG retriever Hybrid 958 LOC iter 12)
  - supabase/functions/_shared/system-prompt.ts (orchestratore prompt finale, host 7-layer aggregato)
  - docs/unlim-wiki/concepts/*.md (126 concepts kebab-case iter 18, target 200+ iter 19-25)
  - VOLUME 3/TEA/glossario-tea-vol1+2+3.* (180 termini + 58 analogie + capstone marking — ingest pipeline iter 19+)
  - scripts/openclaw/state-snapshot-aggregator.ts (orchestratore parallelo scaffold iter 6+, target prod live iter 22+)
output-files:
  - docs/architectures/ADR-023-onniscenza-completa-iter-22-25.md (THIS file, NEW)
  - Future iter 19+: scripts/ingest-glossario-tea.mjs (NEW pipeline ~200 LOC, 360 chunk target)
  - Future iter 22+: supabase/migrations/2026-05-XX_unlim_session_memory_v2.sql + 2026-05-XX_class_memory_v2.sql + 2026-05-XX_glossario_chunks.sql
  - Future iter 22+: supabase/functions/_shared/state-snapshot-aggregator.ts (port da scripts/openclaw → Edge runtime ~600 LOC)
  - Future iter 22+: supabase/functions/_shared/onniscenza-router.ts (intent → layer activation subset, NEW ~250 LOC)
  - Future iter 23+: scripts/cache-redis-upstash-wireup.mjs (cross-session repeat queries, ~150 LOC)
  - Future iter 24+: tests/integration/onniscenza-7-layer.test.js (E2E latency + correctness, NEW ~400 LOC)
---

# ADR-023 — Onniscenza completa UNLIM 7-layer Sprint T iter 22-25

> Codificare l'**Onniscenza** UNLIM come livello architetturale runtime di ELAB Tutor: accesso unificato a 7 layer di conoscenza (RAG, Wiki LLM, Glossario Tea, Contesto sessione + memoria classe, Vision, LLM-knowledge, Domanda/contesto on-the-fly) tramite **state-snapshot-aggregator** orchestrazione parallela + RRF k=60 fusion + dedup + routing intelligente intent-based + cache Redis cross-session. Latency target p50 <2s p95 <5s onniscenza full. Integrazione TUTTE funzionalità ELAB (Simulator CircuitSolver MNA/KCL + Scratch/Blockly + Arduino n8n + Dashboard + Lavagna LIM + Fumetto + Voice Isabella + 4 giochi) via ClawBot tool dispatcher che legge stato onniscenza pre-execute. Maturazione Sprint T iter 22-25 post-procurement VPS GPU GDPR-compliant (ADR-022 ACCEPTED).

---

## 1. Status

**PROPOSED** — architect-opus iter 18 PM 2026-04-28 propone Onniscenza canonical 7-layer architecture per Sprint T iter 22-25 maturazione. Andrea ratify iter 22 entrance.

Sign-off chain previsto:
- architect-opus iter 18 PM prep ADR-023 PROPOSED 7-layer canonical
- gen-app-opus iter 22 implement state-snapshot-aggregator port Edge runtime
- gen-test-opus iter 22 verify latency p50 <2s p95 <5s + correctness E2E 7-layer
- Andrea Marro iter 22 ratify post-procurement VPS GPU + env provision Postgres migration

---

## 2. Context

### 2.1 Andrea mandate Sprint T iter 22-25

Master PDR `docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md` §6 codifica scope Sprint T iter 17-25:
- iter 17-21: VPS GPU procurement + 7-component stack deployment (Llama 3.3 70B + Qwen 2.5-VL + BGE-M3 + Whisper Turbo + XTTS-v2 Isabella + FLUX.1 + ClawBot dispatcher)
- iter 22-25: **Onniscenza + Onnipotenza maturazione runtime production**

Andrea iter 18 PM mandate verbatim ralph loop /caveman dispatch: "implementare Onniscenza + Onnipotenza Sprint T iter 22-25 maturare". Onniscenza scope = unified knowledge access tutti layer + integrazione TUTTE funzionalità ELAB via ClawBot.

### 2.2 Stato attuale 7-layer iter 18 (HEAD `de9cdb9`)

Componenti già live o scaffold:
- **Layer 1 RAG** Hybrid retriever BM25+dense+RRF k=60+rerank ADR-015 → `supabase/functions/_shared/rag.ts` 958 LOC iter 12 LIVE prod, 1881 chunks (vol1 203 + vol2 292 + vol3 198 + 100 wiki + 1188 misc)
- **Layer 2 Wiki LLM** 126 concepts kebab-case iter 18, ingest pipeline `docs/unlim-wiki/concepts/*.md` Mac Mini autonomous overnight batch
- **Layer 3 Glossario Tea** NOT yet ingested (180 termini Vol1+2+3 + 58 analogie + capstone marking) — pipeline iter 19+ scope
- **Layer 4 Contesto sessione + memoria classe** parziale: `unlimContextCollector.js` 250 LOC (sessione) + `unlimMemory.js` 3-tier (short/medium/long) — class memory Supabase schema iter 13 ADR-019 prep, full impl iter 22+
- **Layer 5 Vision** Gemini Vision EU iter 16 R0 baseline + Qwen 2.5-VL self-hosted iter 17+ post-procurement (ADR-022 §6.2)
- **Layer 6 LLM-knowledge** Llama 3.3 70B Q4 self-hosted (ADR-022 §6.1) + Mistral Small 3.1 24B Italian-tuned alternative
- **Layer 7 Domanda/contesto on-the-fly** prompt + intent + recent history → `system-prompt.ts` BASE_PROMPT v3 + buildCapitoloPromptFragment iter 2

Componenti NON live (gap iter 22-25 close):
- **state-snapshot-aggregator** scaffold `scripts/openclaw/state-snapshot-aggregator.ts` iter 6, NOT prod Edge runtime
- **onniscenza-router** routing intelligente intent→layer subset NOT implemented
- **Cache Redis cross-session** NOT implemented (every query hits 7 layer fresh)
- **Glossario Tea ingest** pipeline NOT implemented
- **Latency target p50 <2s p95 <5s full** NOT measured (iter 7 RAG-only avg 4831ms ~5s, full 7-layer atteso peggiore)

### 2.3 Perché ADR adesso (iter 18 PM)

Tre motivi cogenti:
1. **Sprint T iter 22-25 maturazione richiede architettura codificata prima di implementare**: gen-app+gen-test+architect 5-agent OPUS iter 22+ devono partire da spec canonical, NO ad-hoc.
2. **Andrea mandate explicit "Onniscenza + Onnipotenza maturare"**: senza ADR esplicita, scope ambiguo + risk fragmentation.
3. **Onniscenza = abilita Onnipotenza ClawBot ADR-024 sibling**: ClawBot 80-tool dispatcher legge state onniscenza pre-execute. Senza Onniscenza canonical, ClawBot resta dumb dispatcher.

### 2.4 Rischio non-codifica

Se ADR-023 non shipped iter 18 PM:
- Implementazione iter 22-25 rischia divergenza 7-layer (chi sa quale layer attivare quando)
- Risk latency esplosa (every query touches all 7 layer parallel sempre, no routing)
- Risk redundancy retrieval (Layer 1 RAG + Layer 2 Wiki overlap concept "LED" senza dedup)
- Risk regression Sense 1.5 morfismo (Layer 4 contesto sessione/classe NOT consultato pre-prompt)

---

## 3. Decision

**Onniscenza UNLIM = 7-layer unified knowledge access via state-snapshot-aggregator parallel orchestration + RRF k=60 fusion + dedup + intent-based routing + Redis cache cross-session.**

Architettura runtime Edge Function `unlim-chat`:
1. Ricevi prompt + sessionId + classeKey + recentHistory
2. **onniscenza-router** detect intent (es. "spiega LED" → activate L1+L2+L3+L6, "diagnose foto circuito" → L5+L6+L4, "stato simulator corrente" → L4+L7+state-current)
3. **state-snapshot-aggregator** parallel fetch layer attivi (Promise.all)
4. **RRF k=60 fusion** + dedup chunk overlap (canonical citation Vol/pag)
5. Compose prompt finale: BASE_PROMPT v3 + Capitolo fragment + onniscenza context block + recent history
6. LLM call (Layer 6) → response
7. Validate Principio Zero V3 (plurale Ragazzi + ≤60 parole + Vol/pag)
8. Cache result Redis Upstash (key: hash(prompt + classeKey + intent))
9. Return + telemetry layer-by-layer latency

Non-goal:
- L3 dynamic JS generation (resta DEV-only flag, NON onniscenza scope)
- Vision streaming realtime (single-shot screenshot iter 22, streaming defer iter 30+)
- Multi-agent autonomous reasoning (resta single-shot LLM call iter 22-25)

---

## 4. Architecture 7-Layer

### 4.1 Layer 1 — RAG (1881 → 2241 target post Glossario Tea ingest)

**Source**: `src/data/rag-chunks.json` + Supabase `rag_chunks` pgvector table (Voyage 1024-dim embeddings).
**Coverage**: Vol1 (203) + Vol2 (292) + Vol3 (198) + Wiki concepts (100 iter 7, → 200+ iter 19+) + Glossario Tea (360 iter 19+) + FAQ + analogie + codice + errori.
**Retrieval**: Hybrid BM25 + dense vector + RRF k=60 + Cohere rerank top-5 (ADR-015).
**Output schema**: `{ chunk_id, source_type, volume_id, page_number, capitolo_id, content, score_rrf, score_rerank }`.
**Latency target**: p50 <800ms p95 <1500ms.
**Failure mode**: BM25-only fallback se dense embedding service down (degradazione graceful, recall@5 ~0.45 vs ~0.65 hybrid).

### 4.2 Layer 2 — Wiki LLM (126 → 200+ iter 19+)

**Source**: `docs/unlim-wiki/concepts/*.md` Mac Mini autonomous overnight batch generation.
**Format**: kebab-case filename + frontmatter `{ concept, vol_pag_canonical, analogie, prerequisiti, capstone_marking }` + body markdown ~150-300 parole.
**Retrieval**: keyword match concept name + filtro contesto classe (kit + età + capitolo corrente).
**Output schema**: `{ concept, source: 'wiki-llm', vol_pag, body_md, analogie, prerequisiti }`.
**Latency target**: p50 <200ms p95 <500ms (filesystem read + corpus index in-memory).
**Failure mode**: corpus reload lazy se index stale (Mac Mini batch update notifica via filesystem watch).
**Iter 19+ expand**: Glossario Tea ingest pipeline genera 360 wiki concept aggiuntivi (180 termini × 2 angoli — definizione + analogia).

### 4.3 Layer 3 — Glossario Tea Vol1+2+3 (180 termini + 58 analogie + capstone marking)

**Source**: `VOLUME 3/TEA/glossario-tea-vol1+2+3.docx` (Tea collaboratrice deliverable iter 19+).
**Ingest pipeline iter 19+**: `scripts/ingest-glossario-tea.mjs` parse docx → 180 termini + 58 analogie + 4 capstone marking (MOSFET + LED matrix + sensori avanzati + Bluetooth).
**Storage**: Supabase `glossario_chunks` table NEW (schema §7.3) + `rag_chunks` cross-link source_type='glossario'.
**Retrieval**: Layer 1 hybrid retriever onbefore Layer 3 dedicated keyword match termine esatto + analogia + capstone flag.
**Output schema**: `{ termine, definizione, analogia, vol_pag_canonical, capstone, cross_ref_capitolo }`.
**Latency target**: p50 <300ms p95 <800ms (pgvector indexed + lateral join Vol/pag).
**Failure mode**: Layer 1 RAG general fallback se Layer 3 specifico no-match (recall preserved).

### 4.4 Layer 4 — Contesto sessione + memoria classe (Supabase)

**Source**: 
- `unlim_session_memory` table (sessione corrente, eventi ultimi 30min)
- `class_memory` table (classe specifica, storia sessioni passate aggregata)
- `teacher_memory` table (docente specifico, stile + esperienza rilevata) — ADR-019 Sense 1.5

**Schema NEW iter 22+** (§7.1+§7.2 dettaglio):
- `unlim_session_memory(session_id, classe_key, capitolo_id, mounted_components, code_snapshot, errors_recent, last_action, ts)`
- `class_memory(classe_key, eta_studenti, livello_competenza, kit_dotazione, capitolo_corrente, sessioni_count, mascotte_state, ts_updated)`
- `teacher_memory(teacher_id, classe_key, esperienza_rilevata, stile_pattern, shortcut_frequenti, lingua_preferred='it')`

**Retrieval**: parallel SELECT con sessionId + classeKey + teacherId (filter RLS Supabase Auth).
**Output schema**: `{ session_state, class_state, teacher_state }` aggregato.
**Latency target**: p50 <400ms p95 <1000ms (Postgres connection pool Supabase Edge runtime).
**Failure mode**: layer down → onniscenza partial graceful (es. nuovo studente classe → class_memory empty → fallback default eta_studenti=10 livello_competenza=base kit=omaric_base).

### 4.5 Layer 5 — Vision (Qwen 2.5-VL self-hosted Sprint T iter 22 OR Gemini Vision EU fallback)

**Source primario**: Qwen 2.5-VL 7B self-hosted VPS GPU (ADR-022 §6.2) post-procurement iter 17+.
**Source fallback**: Gemini Vision EU (Frankfurt region) gated GDPR consenso esplicito teacher (ADR-022 §10.2).
**Trigger**: ClawBot tool `captureScreenshot` + `postToVisionEndpoint` (ADR-013 D4 sub-handler).
**Retrieval**: screenshot PNG → multipart POST endpoint vision → response `{ topology_detected, components_list, errors_visual, suggestion }`.
**Output schema**: `{ vision_topology, components_visual, errors_circuit, suggestion_morphic }`.
**Latency target**: p50 <2500ms p95 <5000ms (Qwen 2.5-VL inference 7B Q5_K_M ~3-4s su RTX 6000 Ada equivalent).
**Failure mode**: Vision endpoint down → Gemini Vision EU emergency (gated env flag `VITE_VISION_FALLBACK_GEMINI_EU=true`).

### 4.6 Layer 6 — LLM-knowledge (Llama 3.3 70B Q4 OR Mistral Small 3.1 24B Italian-tuned)

**Source primario**: Llama 3.3 70B Q4 self-hosted VPS GPU (ADR-022 §6.1) — knowledge base generale + sintesi.
**Source alternativo**: Mistral Small 3.1 24B Italian-tuned (training Tea + dataset volumi cartacei) — sintesi italiana scuola pubblica registro.
**Retrieval**: LLM call con prompt finale composito (Layer 1+2+3+4+5+7 aggregato) + system prompt v3 + buildCapitoloPromptFragment.
**Output schema**: `{ response_text, intent_detected, citations_used, validation_pz }`.
**Latency target**: p50 <2000ms p95 <4500ms (Llama 70B Q4 ~10-15 tok/s su RTX 6000 Ada equivalent, response ~60 parole = ~80 token = ~5-8s; con speculative decoding o vLLM ~2-4s).
**Failure mode**: LLM down → Mistral fallback chain (Together AI gated teacher-context only) → response template "Ehm, mi è caduto il segnale, riprova tra un momento" italiano.

### 4.7 Layer 7 — Domanda/contesto on-the-fly

**Source**: prompt corrente + intent detection + recent history (ultimi 5 turni) + state-current ELAB modules (simulator state, scratch workspace, lavagna canvas, fumetto active, voice mode, gioco active).
**Detection intent**: keyword + classifier light (regex + heuristic, NO LLM call onbefore — Layer 7 deve essere <50ms).
**Output schema**: `{ prompt_clean, intent, recent_history, state_current_modules }`.
**Latency target**: p50 <50ms p95 <150ms.
**Failure mode**: state_current_modules empty se ELAB module API down → degradazione graceful (Layer 4 sessione fallback).

---

## 5. State-Snapshot-Aggregator parallel orchestration

Componente core onniscenza. Port da `scripts/openclaw/state-snapshot-aggregator.ts` (iter 6 scaffold) → `supabase/functions/_shared/state-snapshot-aggregator.ts` (Edge runtime iter 22+).

### 5.1 Parallel fetch tutti layer attivi

```typescript
async function aggregateOnniscenza(input: OnniscenzaInput): Promise<OnniscenzaSnapshot> {
  const intent = detectIntent(input.prompt, input.recentHistory)
  const layers = routeIntent(intent)  // §6 routing intelligente

  const [l1, l2, l3, l4, l5, l6_skip, l7] = await Promise.all([
    layers.has('L1') ? fetchRAG(input) : null,
    layers.has('L2') ? fetchWikiLLM(input) : null,
    layers.has('L3') ? fetchGlossarioTea(input) : null,
    layers.has('L4') ? fetchSessionClassMemory(input) : null,
    layers.has('L5') ? fetchVision(input) : null,
    null,  // L6 LLM call dopo aggregation, NOT parallel
    fetchOnTheFly(input),  // sempre attivo
  ])

  const fused = rrfFuse([l1, l2, l3], k=60)
  const deduped = dedupChunks(fused, by='vol_pag_canonical')
  
  return { rag: deduped, wiki: l2, glossario: l3, session: l4, vision: l5, on_the_fly: l7, intent, layers_active: Array.from(layers) }
}
```

### 5.2 RRF k=60 fusion + dedup

ADR-015 §5 codifica RRF k=60 fusion BM25+dense Layer 1. Estensione iter 22+: cross-layer RRF fusion Layer 1 RAG + Layer 2 Wiki + Layer 3 Glossario Tea (3 source_type retrieval) + dedup canonical citation `Vol.X|pag.Y`.

Algoritmo:
```
for each chunk in flatten([l1, l2, l3]):
  rrf_score[chunk] = sum(1 / (k + rank_in_layer_i)) for i in [L1, L2, L3]
sort by rrf_score desc
dedup by chunk.vol_pag_canonical (keep highest rrf_score)
return top-5
```

### 5.3 Telemetry layer-by-layer

Ogni layer emit `{ layer_id, latency_ms, items_count, cache_hit, errors }` → Supabase `onniscenza_telemetry` table (iter 23+) per debugging + p50/p95 monitoring + intent→layer correlation.

---

## 6. Routing intelligente intent → layer subset

`onniscenza-router.ts` NEW iter 22+. Detection intent + activation subset layer per latency optimization.

### 6.1 Intent classes (10 canonical)

| Intent class | Keyword/heuristic | Layer attivi | Latency target full |
|---|---|---|---|
| `concept_explain` | "spiega", "cos'e", "come funziona" + nome concetto | L1+L2+L3+L6+L7 | p50 <2.5s |
| `diagnose_visual` | "guarda", "diagnose", "controlla circuito" + screenshot | L4+L5+L6+L7 | p50 <4s |
| `state_current` | "cosa ho montato", "stato simulator", "che codice" | L4+L7 | p50 <800ms |
| `code_help` | "aiuta codice", "errore Arduino", "come scrivere" | L1+L2+L4+L6+L7 | p50 <3s |
| `kit_question` | "ho il kit", "componente", "quale resistenza" | L3+L4+L7 | p50 <1.5s |
| `lesson_navigation` | "prossimo esperimento", "capitolo successivo" | L4+L7 | p50 <500ms |
| `glossary_term` | termine isolato + "?" | L3+L7 | p50 <800ms |
| `analogy_request` | "fammi un esempio", "analogia", "come..." | L2+L3+L6+L7 | p50 <2s |
| `error_recovery` | "non funziona", "non si accende", "perche" | L1+L4+L5+L6+L7 | p50 <4s |
| `meta_question` | "chi sei", "che fai", off-topic | L7 | p50 <300ms |

### 6.2 Heuristic detection iter 22-23

Iter 22 P0: regex + keyword exact match + recent_history last_intent fallback. NO LLM classifier (latency too high pre-aggregation).

Iter 23 P1: training light classifier (Mistral Small 3.1 24B fine-tuned 1k esempi italiano) → classifier endpoint dedicated <100ms, sostituisce regex per intent ambigui (es. "non capisco" → error_recovery vs concept_explain ambiguous).

### 6.3 Multi-intent compositi

Caso es. "spiega LED + carica codice" → intent compositi `concept_explain` + `code_help` → union layer attivi L1+L2+L3+L4+L6+L7 → ClawBot ADR-024 dispatch sequential L2 templates `explain-led` + `load-arduino-code`.

---

## 7. Postgres schema migration iter 22+

3 tabelle NEW + 2 estensione tabelle existing.

### 7.1 `unlim_session_memory` (iter 22+)

```sql
CREATE TABLE unlim_session_memory (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classe_key TEXT NOT NULL,
  teacher_id UUID,
  capitolo_id TEXT,
  mounted_components JSONB DEFAULT '[]'::jsonb,
  code_snapshot TEXT,
  errors_recent JSONB DEFAULT '[]'::jsonb,
  last_action TEXT,
  intent_history JSONB DEFAULT '[]'::jsonb,
  ts_created TIMESTAMPTZ DEFAULT NOW(),
  ts_updated TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_session_classe_key ON unlim_session_memory(classe_key);
CREATE INDEX idx_session_ts_updated ON unlim_session_memory(ts_updated DESC);
ALTER TABLE unlim_session_memory ENABLE ROW LEVEL SECURITY;
```

RLS policy: `classe_key = current_setting('app.classe_key')` o RLS aperta dev (ADR-021 prep).

### 7.2 `class_memory` + `teacher_memory` (iter 22+)

```sql
CREATE TABLE class_memory (
  classe_key TEXT PRIMARY KEY,
  eta_studenti INT,  -- 8-14
  livello_competenza TEXT,  -- 'base'|'medio'|'avanzato'
  kit_dotazione TEXT,  -- 'omaric_base'|'omaric_avanzato'|'custom'
  capitolo_corrente TEXT,
  sessioni_count INT DEFAULT 0,
  mascotte_state JSONB DEFAULT '{}'::jsonb,
  ts_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teacher_memory (
  teacher_id UUID PRIMARY KEY,
  classe_key TEXT REFERENCES class_memory(classe_key) ON DELETE SET NULL,
  esperienza_rilevata TEXT,  -- 'principiante'|'esperto'|'expert_arduino'
  stile_pattern JSONB DEFAULT '{}'::jsonb,
  shortcut_frequenti JSONB DEFAULT '[]'::jsonb,
  lingua_preferred TEXT DEFAULT 'it',
  ts_updated TIMESTAMPTZ DEFAULT NOW()
);
```

ADR-019 Sense 1.5 Morfismo runtime depend tabelle.

### 7.3 `glossario_chunks` (iter 19+ ingest pipeline)

```sql
CREATE TABLE glossario_chunks (
  chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  termine TEXT NOT NULL,
  definizione TEXT NOT NULL,
  analogia TEXT,
  vol_pag_canonical TEXT,  -- 'Vol.1|pag.45'
  capstone BOOLEAN DEFAULT FALSE,
  cross_ref_capitolo TEXT,
  embedding vector(1024),  -- Voyage 1024-dim
  ts_created TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_glossario_termine ON glossario_chunks(termine);
CREATE INDEX idx_glossario_embedding ON glossario_chunks USING ivfflat (embedding vector_cosine_ops);
```

### 7.4 Estensione `rag_chunks` (iter 19+)

Aggiunta `source_type = 'glossario'` + `cross_ref_glossario_chunk_id UUID REFERENCES glossario_chunks(chunk_id)` per cross-layer linking Layer 1 ↔ Layer 3.

---

## 8. Cache layer Redis (Upstash free tier) iter 23+

### 8.1 Razionale

Repeat queries cross-session (es. docente diversi classi chiede stesso "spiega LED" 3-4 volte/giorno scolastico) → cache hit elimina full 7-layer aggregation (~3s) → cache hit <50ms.

### 8.2 Cache key + TTL

Key: `hash(prompt_normalized + classe_key + capitolo_corrente + intent)` SHA-256 hex.

TTL:
- `concept_explain` + `glossary_term` + `analogy_request`: 7 giorni (knowledge stable)
- `state_current` + `code_help` + `error_recovery`: NO cache (state-sensitive)
- `lesson_navigation`: 1 ora (capitolo current può cambiare)
- `kit_question`: 30 giorni (kit stable per classe)

### 8.3 Upstash free tier ceiling

10000 commands/giorno + 256MB storage. ELAB target 100 scuole × 5 sessioni/giorno × 20 query/sessione = 10000 query/giorno → cache hit rate 60% target → 4000 cache miss/giorno = 4000 commands set + 6000 commands get = 10000 commands. Marginal: monitor + upgrade Upstash Pay-as-you-go ($0.20/100k commands) se cap superato.

### 8.4 Cache invalidation

- Volume update (script `npm run sync-volumi`) → invalidate ALL keys con `vol_pag_canonical` in chunks
- Capitolo aggiornamento lesson-paths → invalidate keys con `capitolo_corrente=<id>`
- Manual flush via admin endpoint `/admin/cache/flush?key=...`

---

## 9. Integration ELAB modules — ClawBot tool dispatcher reads onniscenza pre-execute

ClawBot ADR-024 sibling pilota TUTTE funzionalità ELAB via 80-tool L1+L2 dispatcher. Pre-execute ogni tool, ClawBot legge state-snapshot onniscenza per parametri morphic Sense 1.5.

### 9.1 Simulator (CircuitSolver MNA/KCL + AVRBridge + PlacementEngine)

Tool L1: `mountExperiment(id)`, `highlightComponent([ids])`, `clearCircuit()`, `getCircuitState()`, `setComponentValue()`, `connectWire()`, `captureScreenshot()`.
Onniscenza pre-read: Layer 4 class_memory.kit_dotazione → filtra componenti disponibili. Layer 7 state_current.simulator → componenti già montati per highlight differenziale. Layer 1 RAG `Vol.X|pag.Y` → mountExperiment id corretto.

### 9.2 Scratch/Blockly

Tool L1: `loadScratchWorkspace(blocksXml)`, `compileScratchToArduino()`, `getBlocksUsed()`.
Onniscenza pre-read: Layer 4 class_memory.eta_studenti → 8-10 anni → Scratch primary, 11-14 → Arduino C++ option. Layer 1 RAG codice esempi capitolo corrente.

### 9.3 Arduino n8n compile (post fix arduino-cli iter 17+)

Tool L1: `compileArduinoCode(srcCpp)`, `uploadToBoard()`, `serialMonitor()`, `serialWrite()`.
Onniscenza pre-read: Layer 4 unlim_session_memory.code_snapshot → compile current state. Layer 1 RAG errori comuni Arduino.

### 9.4 Dashboard docente

Tool L1: `exportCSV()`, `getProgressClasse()`, `getNudges()`, `getAnalyticsCapitolo()`.
Onniscenza pre-read: Layer 4 class_memory.sessioni_count + capitolo_corrente → analytics scope.

### 9.5 Lavagna LIM

Tool L1: `setDrawingMode()`, `clearCanvas()`, `addAnnotation(x,y,text)`, `setToolbarMode(pen|wire|select|delete)`.
Onniscenza pre-read: Layer 4 teacher_memory.shortcut_frequenti → toolbar mode default morphic. Layer 7 LIM resolution detection → font + componenti scaling.

### 9.6 Fumetto sessione

Tool L1: `exportFumettoPDF()`, `voiceCmdFumetto()`, `addFumettoFrame()`.
Onniscenza pre-read: Layer 4 unlim_session_memory.intent_history → fumetto frames composizione narrativa.

### 9.7 Voice Isabella TTS + STT Whisper

Tool L1: `ttsIsabella(text)`, `sttWhisperTurbo(audio)`, `wakeWordEhiUNLIM()`, `voiceCmdDispatch(cmd)`.
Onniscenza pre-read: Layer 4 teacher_memory.lingua_preferred='it' (stable) + Layer 7 voice_mode current.

### 9.8 4 giochi didattici

Tool L1: `gameStart(id)`, `gameGetScore()`, `gameSubmitAnswer()`, `gameNextQuestion()`.
Onniscenza pre-read: Layer 4 class_memory.livello_competenza → difficulty scaling. Layer 1 RAG capitolo corrente → quiz domande pertinenti.

---

## 10. Implementation iter 22-25 step-by-step

### Iter 22 (Sprint T): Foundation + Postgres migrations

P0 atoms:
1. Apply migrations `unlim_session_memory` + `class_memory` + `teacher_memory` Supabase prod (Andrea ratify ~5min).
2. Port `state-snapshot-aggregator.ts` da scripts/openclaw/ → supabase/functions/_shared/ Edge runtime (gen-app ~600 LOC).
3. Implementare `onniscenza-router.ts` 10 intent classes regex + keyword detection (gen-app ~250 LOC).
4. Wire `unlim-chat/index.ts` chiama `aggregateOnniscenza` pre-LLM call.
5. Test E2E `tests/integration/onniscenza-7-layer.test.js` 6 intent classes happy path (gen-test ~400 LOC).

Score lift: Onniscenza Box NEW = 0.4 (parziale, no Vision live + no Glossario Tea).

### Iter 23: Routing intelligente + Cache Redis + Vision live

P0 atoms:
1. Cache Redis Upstash wireup (`scripts/cache-redis-upstash-wireup.mjs` ~150 LOC + `cache-client.ts` Edge ~80 LOC).
2. Vision flow live Qwen 2.5-VL endpoint VPS GPU (post-procurement iter 17+) → `fetchVision()` Layer 5 prod.
3. Multi-intent compositi support (`concept_explain` + `code_help` union routing).
4. Test load latency p50 <2s p95 <5s onniscenza full (gen-test bench `scripts/bench/onniscenza-load-test.mjs`).

Score lift: Onniscenza Box = 0.7.

### Iter 24: Glossario Tea ingest + Layer 3 prod

P0 atoms:
1. `scripts/ingest-glossario-tea.mjs` parse docx Tea → 360 chunk + 58 analogie + capstone marking.
2. Migration `glossario_chunks` table apply prod.
3. `fetchGlossarioTea()` Layer 3 dedicated retriever pgvector + keyword.
4. Cross-layer RRF L1+L2+L3 fusion + dedup canonical Vol/pag.
5. Test correctness 30 termini gold-standard recall@5 ≥0.85.

Score lift: Onniscenza Box = 0.85. Box 3 RAG cumulative: 1881 → 2241 chunks.

### Iter 25: ClawBot integration ALL ELAB modules + telemetry + close

P0 atoms:
1. ClawBot ADR-024 80-tool dispatcher integrazione 8 ELAB modules (Simulator + Scratch + Arduino + Dashboard + Lavagna + Fumetto + Voice + 4 giochi).
2. Telemetry `onniscenza_telemetry` table + Grafana dashboard p50/p95/cache_hit_rate per layer.
3. Sense 1.5 morfismo runtime tuning per docente/classe via Layer 4 teacher_memory + class_memory.
4. End-to-end demo Fiera-style: docente "Ehi UNLIM, mostra LED + carica codice + spiega" → onniscenza+ClawBot esegue 6 tool L1 sequential senza intervento.
5. Score onesto 9.95+/10 ratify Andrea.

Score lift: Onniscenza Box = 1.0. SPRINT_T_COMPLETE.

---

## 11. Cost analysis layer-by-layer

| Layer | GPU/Storage | Bandwidth | Costo €/mese (100 scuole scale) |
|---|---|---|---|
| L1 RAG | pgvector Supabase Pro $25/mo + Voyage embeddings free 50M tok/mo | minimal | €25 |
| L2 Wiki LLM | filesystem Edge (no GPU) | minimal | €0 |
| L3 Glossario Tea | pgvector +5MB | minimal | €0 (incluso L1) |
| L4 Sessione+Classe | Postgres Supabase | minimal | €0 (incluso Supabase Pro) |
| L5 Vision Qwen 2.5-VL | RTX 6000 Ada VPS GDPR €430/mo + 7B Q5_K_M VRAM 15GB | ~200GB/mo | €430 (cumulato ADR-022) |
| L6 LLM Llama 3.3 70B Q4 | RTX 6000 Ada VPS (shared L5) + 70B Q4 VRAM 38GB | ~400GB/mo | €0 (incluso L5) |
| L7 On-the-fly | Edge runtime CPU | minimal | €0 |
| **Cache Redis Upstash** | 256MB + 10k cmd/day | minimal | €0 (free tier) → €5-10/mo Pay-as-you-go scale |

**Totale onniscenza Sprint T iter 25 close**: ~€460/mese (100 scuole scale, dominato VPS GPU shared L5+L6).

Break-even ADR-022 §11.2: 50+ scuole attive €1000+/mo revenue (UNLIM €20/classe/mese × 50 classi). Margine 54%.

---

## 12. Failure modes + graceful degradation

| Layer down | Comportamento | Recall preserved |
|---|---|---|
| L1 RAG dense down | BM25-only fallback | recall@5 ~0.45 (vs 0.65 hybrid) |
| L1 RAG total down | Layer 2 Wiki + Layer 3 Glossario coprono concetti core | parziale |
| L2 Wiki down | Layer 1 RAG copre chunks wiki ingested | full |
| L3 Glossario down | Layer 1 RAG copre chunk source_type='glossario' | full |
| L4 Postgres down | Layer 7 on-the-fly + recent_history → no class context, default morfism | parziale |
| L5 Vision down | Gemini Vision EU fallback (gated) | full |
| L5 + Gemini EU down | Skip Vision → testo-only response "non riesco a vedere il circuito ora" | parziale |
| L6 LLM down | Mistral Italian fallback → Together AI gated emergency | parziale (degraded sintesi) |
| L7 always-on | N/A (50ms layer, no failure mode practical) | full |
| Cache Redis down | bypass cache, full 7-layer aggregation | latency spike, no correctness loss |

**Test plan failure modes iter 24+**: chaos engineering script `scripts/chaos/onniscenza-layer-down.mjs` simula layer down systematic + verifica response non-empty + Principio Zero V3 valid.

---

## 13. Cross-reference

- **ADR-019 Sense 1.5 Morfismo**: Layer 4 teacher_memory + class_memory + funzioni morfiche + finestre morfiche dependencies.
- **ADR-022 VPS GPU GDPR**: Layer 5 Qwen 2.5-VL + Layer 6 Llama 3.3 70B Q4 self-hosted EU stack.
- **ADR-024 Onnipotenza ClawBot** (sibling): integrazione ELAB modules via 80-tool L1+L2 dispatcher reads onniscenza pre-execute.
- **CLAUDE.md DUE PAROLE D'ORDINE**: Principio Zero V3 plurale Ragazzi + Vol/pag canonical INVARIANT + Morfismo Sense 1+1.5+2 GDPR data residency.

---

## 14. Sense 1.5 Morfismo alignment

Onniscenza 7-layer rispetta morfismo runtime ADR-019:
- **Layer 4** teacher_memory + class_memory = SOURCE OF TRUTH morfismo (non hardcoded preference, runtime learning).
- **Routing intelligente** §6 = morfismo intent → layer subset (docente esperto Arduino → skip Layer 2 Wiki concept basic, accelera).
- **Cache TTL §8.2** differenziato per intent class = morfismo cache strategy (state-sensitive intent NO cache, knowledge-stable cache 7gg).
- **Failure graceful §12** preserva morfismo Sense 2 triplet coerenza esterna (Vol/pag canonical citation INVARIANT anche degraded).

---

## 15. Activation iter 22

Andrea iter 22 entrance ratify queue (~10 min):
1. Apply 3 migrations Postgres Supabase (`supabase db push --linked`).
2. Provision env vars: `VOYAGE_API_KEY` + `SUPABASE_SERVICE_ROLE_KEY` + `UPSTASH_REDIS_URL` + `UPSTASH_REDIS_TOKEN`.
3. Verify VPS GPU procurement complete (ADR-022 §10 timeline iter 17-21 close).
4. Approve gen-app 5-agent OPUS Pattern S Phase 1 spawn iter 22.

**Iter 22 score target**: Onniscenza Box NEW = 0.4 (parziale, full coverage iter 25 close).

**Sprint T iter 25 close target ONESTO**: 9.95/10 (Onniscenza Box 1.0 + Onnipotenza ClawBot Box 1.0 ADR-024 + Sense 1.5 morfismo runtime tuning live).
