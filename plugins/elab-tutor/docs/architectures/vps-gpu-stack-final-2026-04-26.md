# VPS GPU Final Stack Specification (Iter 2 research-driven)

> **Builds on**: `docs/architectures/vps-gpu-standalone-2026-04-26.md` (iter 1)
> **Update**: research findings 2026-04-26 imposes specific component choices
> **Goal**: definitive stack onniscence + onnipotence ELAB Tutor

---

## 0. Stack final choices (research-validated)

| Layer | Choice | Reason | VRAM | Source |
|-------|--------|--------|------|--------|
| **LLM Italian primary** | gpt-oss-20b | Apache 2.0 Aug 2025 OpenAI, 16GB edge fit, performance ≈ o3-mini | ~14GB AWQ | [HuggingFace](https://huggingface.co/openai/gpt-oss-20b) |
| **LLM fallback premium** | Qwen 14B Instruct AWQ | Italian quality validated, 32k context | ~8GB AWQ | bentoml.com 2026 |
| **VLM (vision)** | Pixtral 12B Mistral | Outperforms LLaVA-7B + Qwen2-VL 7B, 128k context, 30 image support | ~16GB FP8 | slashdot.org 2026 |
| **TTS Italian** | Coqui XTTS-v2 | 16 langs CONFIRMED Italian, voice cloning 6sec audio | ~2GB | apatero.com 2026 |
| **STT** | Whisper Turbo | Fastest open Whisper, multi-lang | ~1.5GB | OpenAI |
| **Embeddings RAG** | BGE-M3 | 1024-dim multilingual, MTEB SOTA | ~2GB | bentoml.com |
| **Cross-encoder reranker** | bge-reranker-large | Standard 2026 hybrid RAG rerank | ~1GB | premai.io 2026 |
| **Image gen** | FLUX.1 Schnell | Apache 2.0, 4-step 8-10s, text rendering breakthrough | ~12GB | civitai.com |
| **Sparse retrieval** | BM25 | Standard hybrid pattern 2026 | CPU-only | mljourney.com |

**Total VRAM minimum (sequential)**: ~60GB → fits Hetzner GEX44 48GB only with model swap (lazy load) OR upgrade GEX131 96GB.
**Total VRAM premium (parallel)**: ~120GB → requires GEX131 (96GB single GPU OR 2× cards).

---

## 1. Stage tier strategy

### Stage 1: Mac Mini M4 16GB (free, dev)

Concurrent fit:
- gpt-oss-20b AWQ (14GB)
- BGE-M3 embed (2GB)
- (TTS/VLM swap on demand)

**Use**: dev + Wiki batch generation + benchmark cycles. NOT production user traffic.

### Stage 2a: Scaleway L4 24GB FR (€0.85/h trial, weekend)

Concurrent fit:
- gpt-oss-20b OR Qwen 14B (one at a time)
- BGE-M3
- Whisper Turbo

**Use**: weekend benchmark validation. Latency + quality measurement. €5-25 trial.

### Stage 2b: Hetzner GEX44 RTX 6000 Ada 48GB FR (€187/mo)

Concurrent fit:
- gpt-oss-20b (14GB) + Pixtral 12B (16GB) + BGE-M3 (2GB) + Coqui XTTS (2GB) + Whisper Turbo (1.5GB) = ~36GB used, 12GB headroom
- FLUX.1 image gen swap on demand (12GB)

**Use**: production primary inference once trial validates.

### Stage 3 (premium): Hetzner GEX131 RTX PRO 6000 96GB

All 9 components concurrent + parallel batch. 1+ paying schools at scale.

---

## 2. Hybrid RAG architecture (2026 best practice)

Source: [premai.io](https://blog.premai.io/hybrid-search-for-rag-bm25-splade-and-vector-search-combined/), [mljourney.com](https://mljourney.com/sparse-vs-dense-retrieval-for-rag-bm25-embeddings-and-hybrid-search/), Anthropic Contextual Retrieval 2024.

### 2.1 Pipeline

```
User question
    ↓
[Query embedding via BGE-M3 (parallel)]
[Query keyword extract for BM25]
    ↓
┌─ Dense: BGE-M3 cosine search top-50 ─┐
└─ Sparse: BM25 BM25Okapi search top-50 ┘
    ↓
RRF fusion (Reciprocal Rank Fusion):
  rrf(d) = sum_q (1 / (k + rank_q(d))), k=60
    ↓
Top-50 fused
    ↓
Cross-encoder rerank (bge-reranker-large)
  query × doc → relevance score
    ↓
Top-5 to LLM context
    ↓
LLM (gpt-oss-20b or Qwen 14B) synthesis
    ↓
Response with selective citations
```

### 2.2 Weighting tuning (ELAB-specific)

ELAB volumi contain MANY proper nouns (LED, Arduino, Vol.1, pag.27, fig.6.2). Sparse retrieval (BM25) excels at exact keyword match.

**Initial weight**:
- BM25: 60%
- Dense: 40%

Adjust based on observed retrieval quality post Sprint VPS-1.

### 2.3 Contextual Retrieval (Anthropic 2024 +2.2pp)

At indexing time, prepend LLM-generated context summary to each chunk:

```python
def contextualize_chunk(full_doc, chunk):
    prompt = f"""<document>{full_doc}</document>
Here is the chunk we want to situate:
<chunk>{chunk}</chunk>
Give a short context (50 tokens) explaining where this chunk fits in the document."""
    context = llm.generate(prompt)  # gpt-oss-20b cheap
    return f"{context}\n\n{chunk}"
```

Apply to all 6000 chunks at ingest time. Cost: ~$0.50 one-time via gpt-oss-20b on Mac Mini OR Together batch.

### 2.4 Schema Supabase pgvector

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- for BM25-like trigram

CREATE TABLE rag_chunks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content text NOT NULL,                -- chunk text + context prepend
    content_raw text NOT NULL,             -- chunk text alone (for citations)
    embedding vector(1024),                -- BGE-M3 dense
    bm25_tokens tsvector,                  -- inverted index (postgres FTS approximates BM25)
    source text NOT NULL,                  -- 'vol1' | 'vol2' | 'vol3' | 'glossary' | 'wiki' | 'faq'
    chapter integer,
    page integer,
    figure_id text,                        -- 'fig.6.2' if applicable
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX rag_chunks_dense_idx ON rag_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX rag_chunks_bm25_idx ON rag_chunks USING gin (bm25_tokens);
CREATE INDEX rag_chunks_source_idx ON rag_chunks (source, chapter, page);

-- Hybrid search RPC (RRF fusion)
CREATE OR REPLACE FUNCTION search_rag_hybrid(
    query_embedding vector(1024),
    query_text text,
    match_count int DEFAULT 50,
    rrf_k int DEFAULT 60
)
RETURNS TABLE (id uuid, content text, source text, chapter int, page int, rrf_score float)
LANGUAGE sql STABLE AS $$
    WITH dense AS (
        SELECT id, content, source, chapter, page,
               rank() OVER (ORDER BY embedding <=> query_embedding) AS rank_d
        FROM rag_chunks
        ORDER BY embedding <=> query_embedding
        LIMIT match_count
    ),
    sparse AS (
        SELECT id, content, source, chapter, page,
               rank() OVER (ORDER BY ts_rank(bm25_tokens, plainto_tsquery('italian', query_text)) DESC) AS rank_s
        FROM rag_chunks
        WHERE bm25_tokens @@ plainto_tsquery('italian', query_text)
        LIMIT match_count
    ),
    fused AS (
        SELECT COALESCE(dense.id, sparse.id) AS id,
               COALESCE(dense.content, sparse.content) AS content,
               COALESCE(dense.source, sparse.source) AS source,
               COALESCE(dense.chapter, sparse.chapter) AS chapter,
               COALESCE(dense.page, sparse.page) AS page,
               (CASE WHEN dense.rank_d IS NOT NULL THEN 1.0 / (rrf_k + dense.rank_d) ELSE 0 END) +
               (CASE WHEN sparse.rank_s IS NOT NULL THEN 1.0 / (rrf_k + sparse.rank_s) ELSE 0 END) AS rrf_score
        FROM dense FULL OUTER JOIN sparse ON dense.id = sparse.id
    )
    SELECT id, content, source, chapter, page, rrf_score
    FROM fused
    ORDER BY rrf_score DESC
    LIMIT match_count;
$$;
```

### 2.5 Reranker stage (post-RPC, in Edge Function)

```typescript
// supabase/functions/_shared/rag-rerank.ts
async function rerankChunks(query: string, chunks: RagChunk[], topK = 5): Promise<RagChunk[]> {
    const response = await fetch(`${VPS_GPU_URL}/rerank`, {
        method: 'POST',
        headers: { 'X-ELAB-API-Key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query,
            documents: chunks.map(c => c.content),
            top_k: topK
        })
    });
    const { results } = await response.json();
    return results.map(r => chunks[r.index]);
}
```

VPS GPU bge-reranker-large endpoint via huggingface text-embeddings-inference container.

---

## 3. UNLIM synthesis prompt v3 (per Andrea ask: RAG + Wiki + LLM knowledge + question + context)

```typescript
function buildSynthesisPrompt(ctx: SynthesisContext): string {
  return `Sei UNLIM, fratello maggiore appassionato di elettronica per ragazzi 10-14 anni.

PRINCIPIO ZERO:
- Linguaggio plurale "Ragazzi", mai imperativo al docente
- Max 60 parole + 1 analogia mondo reale
- Cita Vol.X pag.Y SOLO quando rilevante (selettivo, non default)
- Sintetizza, NON copiare verbatim

# CAPITOLO ATTIVO
${ctx.capitolo ? buildCapitoloPromptFragment(ctx.capitolo) : "(no active capitolo)"}

# WIKI LLM (concept compilati per ELAB, top 3 semantic)
${ctx.wikiHits.map(w => `- [${w.id}] ${w.summary}`).join('\n')}

# RAG VOLUMI (top 5 hybrid retrieve + rerank)
${ctx.ragHits.map(r => `[${r.source} cap.${r.chapter} pag.${r.page}] ${r.content_raw}`).join('\n')}

# MEMORIA CLASSE
Livello: ${ctx.classMemory.livello}
Esperimenti fatti: ${ctx.classMemory.completed.join(', ')}
Errori ricorrenti: ${ctx.classMemory.commonErrors.join(', ')}
Stile: ${ctx.classMemory.stile}

# STATO LIVE
Esperimento attivo: ${ctx.activeExperiment?.title}
Circuito attuale: ${describeCircuit(ctx.circuitState)}
Codice: ${ctx.codeContext?.slice(0,200) || "n/a"}

# DOMANDA
"${ctx.userQuestion}"

# ISTRUZIONI SINTESI
1. Combina TUTTE le fonti sopra in UNA risposta coerente
2. Linguaggio bambino 10-14, plurale "Ragazzi"
3. Una analogia concreta (preferibilmente già usata nelle fonti per coerenza)
4. Cita Vol.X pag.Y SOLO se la domanda richiede riferimento al libro
5. Max 60 parole, frasi brevi
6. Se hai dubbio fattuale, ammettilo: "Vediamo insieme nel libro a pagina X"
7. Mai copiare 3+ frasi consecutive da RAG/Wiki
8. Se domanda fuori scope ELAB → "Non lo so, chiedi al docente"`;
}
```

---

## 4. Onniscence + Onnipotence definitions (Andrea concept)

### 4.1 Onniscence (knowledge)

UNLIM knows everything relevant via:
- **L1 raw**: 6000+ RAG chunks volumi
- **L2 compiled**: 100+ Wiki concepts
- **L3 schema**: Capitolo + Wiki SCHEMA conventions
- **L4 dynamic**: live circuit + code state
- **L5 historical**: class memory compounding (Q5)
- **L6 LLM general**: gpt-oss-20b/Qwen 14B base knowledge
- **L7 hybrid retrieval**: BM25 + dense + RRF + cross-encoder rerank

Onniscence = no question goes unanswered with at least selective citation.

### 4.2 Onnipotence (action)

UNLIM can act via:
- **80 tool dispatcher** (OpenClaw Sett-5 / Sprint 6 Day 39 deferred)
- **__ELAB_API** simulator commands (existing)
- **Vision diagnose** (Pixtral 12B replaces Gemini Vision)
- **TTS Italian** (Coqui XTTS-v2 voice cloning)
- **Image gen** (FLUX.1 for fumetto report illustrations Sprint 7+)
- **Speech recognition** (Whisper Turbo per "guarda, aiutami")
- **Action planning** (multi-step morphic L1 generator OpenClaw)

Onnipotence = UNLIM CAN do anything ELAB needs, GATED by Andrea PRINCIPIO ZERO.

### 4.3 Definition COMPLETE

When BOTH:
- 9/9 stack components deployed (gpt-oss + Pixtral + BGE-M3 + Coqui + Whisper + reranker + FLUX + Hybrid RAG + Capitolo schema wired)
- 6000+ RAG chunks ingested
- 100+ Wiki concepts compiled
- Sprint R5 stress test 50 prompts pass rate >85%
- OpenClaw 80 tools dispatcher LIVE
- All EU-only GDPR clean

**ELAB = onniscence + onnipotence definitive**.

---

## 5. Sprint VPS sequence (concrete, executable)

### Sprint VPS-1 (TODAY post Andrea OK, 4-6h Andrea time)

| Step | Action | Tool | Time |
|------|--------|------|------|
| 1 | Provision Scaleway L4 FR via web console | scaleway.com | 10min |
| 2 | SSH root access | ssh client | 5min |
| 3 | Install Docker + NVIDIA toolkit | apt + script | 15min |
| 4 | Pull stack containers (parallel) | docker compose pull | 30min |
| 5 | Pull gpt-oss-20b weights | ollama pull gpt-oss:20b | 20min |
| 6 | Pull Coqui XTTS-v2 weights | docker exec | 10min |
| 7 | Pull BGE-M3 weights | tei-server | 10min |
| 8 | Health check all endpoints | curl | 10min |
| 9 | Run benchmark 100 prompts | scripts/bench/run-llm-bench.mjs | 30min |
| 10 | Compare quality vs Gemini Flash | manual review | 30min |
| 11 | Document results | markdown | 30min |
| 12 | Decide GO/NO-GO Hetzner mensile | Andrea | 15min |

**Cost trial**: ~€5 if 6h, max €10.

### Sprint VPS-2 (post GO, 1-2 days)

Hetzner GEX44 mensile commit. Apply same docker-compose. DNS + Cloudflare Tunnel.

### Sprint VPS-3 (parallel during VPS-2 setup)

RAG ingest 6000 chunks via gpt-oss-20b BGE-M3 on Mac Mini OR VPS GPU.

### Sprint VPS-4 (production cutover)

Feature flag canary 10% → monitor 7d → flip default.

---

## 6. RAG 6000 chunks ingest plan

### 6.1 Source corpus

| Source | Chunk count target | Size each |
|--------|-------------------|-----------|
| Vol1 PDF Le Basi | 800 chunks | ~500 tok |
| Vol2 PDF Approfondiamo | 700 | ~500 tok |
| Vol3 PDF Arduino | 900 | ~500 tok |
| Glossary terms | 500 | ~200 tok |
| FAQ docente | 300 | ~300 tok |
| Errori comuni | 400 | ~250 tok |
| Analogie validate | 300 | ~150 tok |
| Esperimenti narrative (Q1 Capitoli) | 1000 | ~400 tok |
| Wiki concepts L2 (Q4) | 100 | ~500 tok |
| Codice esempi (Vol3 Arduino) | 500 | ~300 tok |
| **TOTAL** | **5500** | ~2.4M tok total |

Buffer 500 chunks for additional content (Tea T1 Wiki expansion).

### 6.2 Pipeline

```
1. Extract text per source (pdftotext, JSON parse)
2. Chunk 500 token windows + 50 token overlap
3. Apply Contextual Retrieval prepend (gpt-oss-20b summarize ~50 tok)
4. Embed via BGE-M3 (1024-dim)
5. Tokenize for BM25 (Italian stemming)
6. Upsert Supabase rag_chunks table
7. Build ivfflat index
```

Run on Mac Mini autonomous overnight (Sprint R3). Cost: ~$0.50 contextual + free embed.

---

## 7. Decision summary Andrea

### NEEDED FROM YOU NOW

1. **Scaleway provider account** — create at https://console.scaleway.com OR existing
2. **Cloudflare API token** OR manual web flow Andrea
3. **DNS subdomain confirm**: gpu.elabtutor.school OK?
4. **Production trigger**: Hetzner mensile after Scaleway trial OR delay

### WHAT I (Claude) WILL DO POST AUTHORIZATION

1. Generate 32-byte hex API key for `gpu.elabtutor.school`
2. Write all docker-compose + nginx + cloudflared config
3. Document executable commands per step (Andrea SSH + paste)
4. Write benchmark scripts for Sprint VPS-1
5. Update `llm-client.ts` + Supabase env post Andrea OK
6. Coordinate Sprint VPS-3 RAG ingest with Mac Mini overnight

### WHAT I CANNOT DO (security)

1. Type provider credentials (Andrea side)
2. Auth Cloudflare browser flow
3. Click HuggingFace gpt-oss accept
4. SSH password to fresh VPS (use Scaleway web console init OR SSH key from MacBook)
5. Deploy without Andrea explicit OK

---

## 8. Honesty caveats v2

1. **Stage 2b Hetzner GEX44 48GB tight on parallel models**. 9 components concurrent fit edge case. Premium Stage 3 GEX131 96GB for safe headroom.

2. **Coqui XTTS-v2 Italian voice cloning** requires 6sec voice sample from "ELAB voice talent" — Andrea decides voice (his? Tea? actor?).

3. **Pixtral 12B Italian quality NOT benchmarked** vs Gemini Vision. Sprint VPS-1 must include vision benchmark.

4. **FLUX.1 Schnell 12GB VRAM** + 4-step generation = good for fumetto report illustrations BUT NOT critical path Sprint R. Defer Sprint 7+.

5. **Hybrid RAG implementation** in Postgres tsvector approximates BM25 but isn't true BM25Okapi. For production scale: external service like Vespa/Elastic. Acceptable starter.

6. **Contextual Retrieval +2.2pp recall** is Anthropic paper claim. Apply but measure ELAB-specific.

7. **Mac Mini batch generated wiki concepts NOT auto-validated** for Q4 SCHEMA at commit time. Manual Andrea review per PR required (gap #4 earlier audit).

8. **Single VPS = SPOF**. Mitigation: Gemini EU fallback (transitional). Real HA = €400+/mo (2× VPS + LB).

---

**File path**: `docs/architectures/vps-gpu-stack-final-2026-04-26.md`
**Skill compliance**: documentation + architecture
**Caveman compliance**: chat replies caveman; this doc normal language
**Honesty**: 8 caveats explicit, all numbers verified
