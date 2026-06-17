---
id: ADR-015
title: Hybrid RAG retriever — BM25 italian + dense pgvector + RRF k=60 + optional rerank
status: PROPOSED
date: 2026-04-27
deciders:
  - architect-opus (Sprint S iter 8 Phase 1, Pattern S 5-agent OPUS PHASE-PHASE)
  - Andrea Marro (final approver per Voyage rerank cost gate + production rollout student/teacher A/B)
context-tags:
  - sprint-s-iter-8
  - hybrid-rag-retrieval
  - bm25-dense-fusion
  - rrf-k60
  - rerank-optional
  - box-6-lift
  - principio-zero-rag-aware
  - morfismo-volumi-citation
related:
  - ADR-008 (buildCapitoloPromptFragment design) — RAG context injection consumer
  - ADR-009 (Principio Zero validator middleware) — runtime PZ gate post-retrieval
  - ADR-010 (Together AI fallback gated) — LLM consumer of retrieved context
  - ADR-014 (R6 stress fixture 100 prompts RAG-aware) — eval consumer post-retriever live
  - migration 20260426160000_rag_chunks_hybrid.sql — pgvector ivfflat schema + RRF SQL function
  - migration 20260427090000_rag_chunks_dedup_unique.sql — content_fts column GIN idx LIVE
  - docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md §2 — stack v3 hybrid RAG plan
  - docs/bench/BENCHMARK-SUITE-ITER-8-2026-04-27.md §B2 — 30 query gold-set spec
input-files:
  - supabase/functions/_shared/rag.ts (~511 LOC, dense-only retrieveVolumeContext + keyword retrieveContext fallback)
  - supabase/migrations/20260426160000_rag_chunks_hybrid.sql (228 LOC, search_rag_hybrid RPC + search_rag_dense_only RPC)
  - supabase/migrations/20260427090000_rag_chunks_dedup_unique.sql (55 LOC, content_fts GIN idx LIVE)
  - supabase/functions/unlim-chat/index.ts (consumer endpoint)
  - supabase/functions/unlim-diagnose/index.ts (consumer endpoint)
  - supabase/functions/unlim-hints/index.ts (consumer endpoint)
output-files:
  - supabase/functions/_shared/rag.ts (extended +200 LOC, hybridRetrieve module export)
  - supabase/functions/_shared/rerank-client.ts (NEW ~120 LOC, Voyage rerank API wrapper + graceful degradation)
  - tests/unit/hybrid-rag.test.ts (NEW ~180 LOC, 12 unit cases mock pgvector + BM25)
  - scripts/bench/score-hybrid-rag.mjs (NEW ~250 LOC, recall@k + precision + MRR + nDCG scorer)
  - scripts/bench/run-hybrid-rag-eval.mjs (NEW ~150 LOC, 30-query gold-set runner)
---

# ADR-015 — Hybrid RAG retriever (BM25 italian + dense pgvector + RRF k=60 + optional rerank)

> Estendere `supabase/functions/_shared/rag.ts` con `hybridRetrieve()` che fonde BM25 italian (postgres FTS column `content_fts` GIN idx LIVE post migration 20260427090000) + dense pgvector Voyage 1024-dim search via Reciprocal Rank Fusion k=60 standard formula + optional bge-reranker-large via Voyage rerank API. Backwards-compatible: dense-only path preserved iter 7 baseline. Iter 8 P0 wire-up Box 6 lift 0.0 → 0.7. Iter 9 wire-up consumer `unlim-chat`/`unlim-diagnose`/`unlim-hints` default-on teacher runtime, default-off student runtime A/B.

---

## 1. Contesto

### 1.1 Box 6 Hybrid RAG state iter 7 close (0.0)

Sprint S iter 7 close: 1881 chunks ingested live (vol1 203 + vol2 292 + vol3 198 + 100 wiki + glossary + faq + errori + analogie + codice). pgvector ivfflat 100 lists embedding idx LIVE. Migration `20260427090000_rag_chunks_dedup_unique.sql` applied: content_fts tsvector column GENERATED ALWAYS + GIN idx LIVE (Step 4-5 maintenance_work_mem 128MB bump for 2174-row table).

`search_rag_hybrid()` SQL RPC LIVE (migration 20260426160000) ma NON consumato da Edge Functions. Dense-only `retrieveVolumeContext()` + keyword fallback `retrieveContext()` correnti in `rag.ts`.

Box 6 stato: schema LIVE, RPC LIVE, **consumer NON wire-up**. Iter 8 P0 wire-up = lift 0.0 → 0.7.

### 1.2 Limitazioni dense-only retrieval

Dense Voyage 1024-dim cattura semantic similarity. Limitazioni misurate iter 5-7:

- **Keyword exact-match miss**: query "Vol.1 pag.27 esercizio 3" — dense embedding matcha semantica generica (LED, resistore) ma NON specific page reference. BM25 tsrank cattura pag.27 token diretto.
- **Acronym + sigla miss**: "PWM", "ADC", "GND" — dense tende generalizzare a "modulazione", "ingresso analogico". BM25 token-level exact.
- **Italian morphology variance**: dense tollera, ma BM25 italian dictionary stem (`to_tsvector('italian', ...)`) cattura "resistore"/"resistori"/"resistenza" canonical form.
- **Long-tail rare terms**: nomi figura ("fig.6.2"), citazioni esatte volumi — dense embedding diluisce in 1024-dim, BM25 ts_rank_cd preserva.

R6 stress fixture iter 7 seed (10 prompts) categoria `citation_vol_pag` recall@5 dense-only: ~0.65. Target hybrid iter 8: ≥0.85 (B2 spec).

### 1.3 BM25 keyword-friendly miss dense

Inverso vale: query semantica naturale "perché si brucia il LED senza resistenza" — BM25 italian token "brucia" + "led" + "resistenza" matcha frammenti errori comuni MA dense embedding cattura intent diagnostico ("LED protection", "current limiting"). Misure R6 categoria `error_diagnosis` dense-only: recall@5 ~0.78. BM25-only: ~0.55. Hybrid RRF-fused expected: ~0.88+.

### 1.4 Hybrid fusion benefit

Reciprocal Rank Fusion k=60 (Cormack et al. 2009) sums `1/(k + rank)` per metodo retrieval. NON richiede normalizzazione score (BM25 ts_rank_cd 0..N float vs dense cosine 0..1). Robust a heterogeneous score scales. k=60 standard literature (Anthropic Contextual Retrieval blog post 2024-09 + premai.io 2026 hybrid pattern).

Beneficio cumulativo:
- Recall@5 dense+BM25+RRF: ~0.85-0.90 (vs dense-only 0.70-0.75 e BM25-only 0.55-0.65)
- Precision@1: ~0.70 (vs dense-only 0.55)
- MRR: ~0.78 (vs 0.65)

Optional bge-reranker-large via Voyage rerank API (rerank-2.5 endpoint) ulteriore lift +5-10% precision@1 a costo latency 100-200ms + $0.05/1K calls.

### 1.5 Principio Zero + Morfismo rilevanza retrieval

**Principio Zero**: UNLIM cita verbatim Vol/pag retrieved. Hybrid RAG miglior recall pag specific = miglior citazione. Ragazzi sentono "Vol.1 pag.27 dice esattamente: '...'" — Principio Zero rispettato solo se chunk retrieved corretto. Dense-only fallisce su page-specific queries → docente legge da memoria → Principio Zero violato.

**Morfismo**: TTS Isabella legge VERBATIM dai volumi quando docente clicca "leggi questa pagina". Hybrid retriever filter `source='vol1' AND chapter=6 AND page=27` recupera chunk esatto. RRF fonde dense+BM25 ma filter SQL applicato pre-RRF (vedi WHERE clause search_rag_hybrid SQL).

---

## 2. Decisione

Implementare modulo `hybridRetrieve()` in `supabase/functions/_shared/rag.ts` che:

1. **Computa query embedding** Voyage `voyage-multilingual-2` 1024-dim (cached 5 min in-memory Map LRU)
2. **Invoca SQL RPC** `search_rag_hybrid(query_embedding, query_text, match_count=50, rrf_k=60, filter_source, filter_chapter)` (LIVE migration 20260426160000)
3. **Deserializza** rows con `id, content, content_raw, source, chapter, page, figure_id, rrf_score, dense_rank, sparse_rank`
4. **Optional rerank** top-K (default 50) → top-N (default 5) via `rerankWithVoyage()` se `useRerank=true`
5. **Returns** `Chunk[]` con scoring meta + citation fields

Backwards-compatible: chiamata default `useHybrid=false` → fallthrough `retrieveVolumeContext()` dense-only iter 7 baseline. Wire-up consumer iter 9 staged (teacher runtime first, student A/B).

### 2.1 BM25 italian (postgres FTS)

**Schema sorgente** (LIVE):

```sql
-- migration 20260426160000 (BEFORE iter 7 fix)
ALTER TABLE rag_chunks ADD COLUMN bm25_tokens tsvector;
CREATE TRIGGER rag_chunks_bm25_trigger
  BEFORE INSERT OR UPDATE OF content ON rag_chunks
  FOR EACH ROW EXECUTE FUNCTION rag_chunks_update_bm25();

-- migration 20260427090000 (LIVE post-iter-7 fix)
ALTER TABLE rag_chunks
  ADD COLUMN IF NOT EXISTS content_fts tsvector
  GENERATED ALWAYS AS (to_tsvector('italian', content)) STORED;
CREATE INDEX idx_rag_chunks_content_fts
  ON rag_chunks USING gin(content_fts);
```

**Italian dictionary** `to_tsvector('italian', content)` applica:
- Stemming italiano ufficiale postgres (`italian_stem` snowball)
- Stop-word italiano builtin (~280 parole)
- Lowercase + diacritics fold
- Token boundary su punctuation

**Query BM25** `plainto_tsquery('italian', 'Cos\'è la legge di Ohm?')` → tsquery `'legg' & 'ohm'` (stop-word "cos\'è" + "la" + "di" rimossi, "legge" stemmed "legg").

**Score** `ts_rank_cd(content_fts, query_tsquery)` cover density rank — preserve term proximity. Range 0..N float.

### 2.2 Dense pgvector Voyage 1024-dim

**Embedding model**: `voyage-multilingual-2` 1024-dim, italiano-friendly (multilingual + italian rank top-3 MTEB).

**Schema sorgente** (LIVE):

```sql
-- migration 20260426160000
embedding vector(1024)
CREATE INDEX rag_chunks_embedding_idx
  ON rag_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

**Cosine similarity** `embedding <=> query_embedding` (pgvector operator). Range 0..2 (0=identical, 2=opposite).

**Rank** `row_number() OVER (ORDER BY embedding <=> query_embedding)` ascending (closest first).

### 2.3 Reciprocal Rank Fusion k=60

**Formula** (Cormack et al. 2009, "Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods"):

```
RRF_score(d) = Σ_{r ∈ retrievers} 1 / (k + rank_r(d))
```

con k=60 (literature standard, robust a outlier rank). Per ELAB hybrid: 2 retrievers (dense + sparse). Documento d in entrambi top-50 → score = 1/(60+rank_d) + 1/(60+rank_s).

**SQL fusion** (LIVE in `search_rag_hybrid` migration 20260426160000):

```sql
WITH dense_search AS (
  SELECT id, ..., row_number() OVER (ORDER BY embedding <=> query_embedding) AS rank_d
  FROM rag_chunks WHERE embedding IS NOT NULL
  ORDER BY embedding <=> query_embedding LIMIT 50
),
sparse_search AS (
  SELECT id, ..., row_number() OVER (ORDER BY ts_rank_cd(bm25_tokens, plainto_tsquery('italian', query_text)) DESC) AS rank_s
  FROM rag_chunks WHERE bm25_tokens @@ plainto_tsquery('italian', query_text)
  ORDER BY ts_rank_cd(bm25_tokens, plainto_tsquery('italian', query_text)) DESC LIMIT 50
),
fused AS (
  SELECT
    COALESCE(d.id, s.id) AS id, ...,
    (CASE WHEN d.rank_d IS NOT NULL THEN 1.0 / (60::float + d.rank_d::float) ELSE 0 END) +
    (CASE WHEN s.rank_s IS NOT NULL THEN 1.0 / (60::float + s.rank_s::float) ELSE 0 END) AS rrf_score
  FROM dense_search d FULL OUTER JOIN sparse_search s ON d.id = s.id
)
SELECT id, ..., rrf_score FROM fused ORDER BY rrf_score DESC LIMIT 50;
```

**Note iter 8 fix**: migration 20260426160000 referenzia `bm25_tokens` (legacy column trigger-managed), MA migration 20260427090000 ha aggiunto `content_fts` GENERATED ALWAYS (più performante, no trigger overhead). Iter 8 generator-app DEVE update `search_rag_hybrid()` SQL function per usare `content_fts` invece `bm25_tokens` (vedi §10 migration plan).

### 2.4 Optional rerank bge-reranker-large via Voyage

Voyage AI rerank API endpoint `https://api.voyageai.com/v1/rerank` modello `rerank-2.5` (ex bge-reranker-large equivalent quality). Input: query + documents array (top-50 RRF). Output: rerank score + new ranking. Top-N (default 5) returned.

**Costo**: ~$0.05/1K reranks. Per ELAB stima 12 turn/session × 1 retrieval/turn × 200 sessioni/giorno = 2400 retrievals/giorno. Se ALL rerank → $0.12/giorno = $3.6/mese. Accettabile teacher runtime (alta qualità). Defer student runtime (cost sensitive) iter 9 A/B.

**Decision tree fallback**: se Voyage rerank API quota exceeded OR error → graceful degradation a top-N RRF-only (no rerank). UI no-op (chunks stessi, ordering RRF preserved). User experience invariata.

### 2.5 Cache layer in-memory

LRU cache `Map<queryHash, Chunk[]>` size 100 entries TTL 5 min Edge Function in-memory. Hit rate atteso teacher 30-40% (lessons ripetute), student 10-20%. Cache key `sha256(query + filter_source + filter_chapter + match_count + useRerank)`.

Cache miss → SQL RPC + optional rerank → store. Cache hit → return cached (avoid 150ms dense + 50ms BM25 + optional 150ms rerank latency).

---

## 3. Architecture diagram (ascii art)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                       hybridRetrieve(query, options)                       │
│                                                                            │
│   ┌──────────────────────┐                                                 │
│   │ 1. Cache lookup       │ ─── HIT ──► return cached Chunk[]              │
│   │   (LRU 100, TTL 5min) │                                                │
│   └──────────────────────┘                                                 │
│              │ MISS                                                        │
│              ▼                                                             │
│   ┌──────────────────────┐                                                 │
│   │ 2. Voyage embed query│ ─── ERROR ──► fallthrough dense-only fallback   │
│   │   (1024-dim, 100ms)  │                                                 │
│   └──────────────────────┘                                                 │
│              │                                                             │
│              ▼                                                             │
│   ┌──────────────────────────────────────────────────────────┐             │
│   │ 3. SQL RPC search_rag_hybrid(embed, text, 50, 60, src, ch)│            │
│   │                                                          │             │
│   │    ┌──────────────────┐   ┌────────────────────────┐     │             │
│   │    │ BM25 italian     │   │ Dense pgvector         │     │             │
│   │    │ ts_rank_cd       │   │ embedding <=> query    │     │             │
│   │    │ content_fts GIN  │ ║ │ ivfflat 100 lists      │     │             │
│   │    │ ~50ms            │   │ ~150ms                 │     │             │
│   │    └────────┬─────────┘   └──────────┬─────────────┘     │             │
│   │             │ rank_s                 │ rank_d            │             │
│   │             └─────────┬──────────────┘                   │             │
│   │                       ▼                                   │             │
│   │           ┌──────────────────────────┐                   │             │
│   │           │ RRF fusion k=60           │                   │             │
│   │           │ Σ 1/(60+rank) per method  │                   │             │
│   │           │ FULL OUTER JOIN ON id     │                   │             │
│   │           │ ~5ms in-DB                │                   │             │
│   │           └──────────┬───────────────┘                   │             │
│   │                      │ top-50 by rrf_score                │             │
│   └──────────────────────┼───────────────────────────────────┘             │
│                          ▼                                                 │
│   ┌──────────────────────────────────────────────────────────┐             │
│   │ 4. Optional rerank (useRerank=true)                       │            │
│   │    Voyage rerank-2.5 API                                  │            │
│   │    ~150ms p95                                             │            │
│   │                                                           │            │
│   │    ── ERROR/QUOTA ──► graceful degradation top-N RRF-only │            │
│   └──────────────────────┬───────────────────────────────────┘             │
│                          │ top-N (default 5)                                │
│                          ▼                                                 │
│   ┌──────────────────────────────────────────────────────────┐             │
│   │ 5. Cache store + return Chunk[] {                         │            │
│   │    id, content, content_raw, source, chapter, page,       │            │
│   │    figure_id, rrf_score, rerank_score?,                   │            │
│   │    dense_rank, sparse_rank, citation_label                │            │
│   │ }                                                         │            │
│   └──────────────────────────────────────────────────────────┘             │
└────────────────────────────────────────────────────────────────────────────┘

Latency p95 budget (no cache):
  - Embed: 100ms
  - SQL RPC (BM25 50ms + dense 150ms parallel = max 150ms + RRF 5ms): 155ms
  - Rerank optional: 150ms (skip if useRerank=false)
  - Total: ~255ms (no rerank) | ~405ms (rerank) | <500ms target B2

Latency p50 cached: <5ms (Map lookup)
```

---

## 4. Schema queries postgres (BM25 + dense + RRF)

### 4.1 Update SQL RPC iter 8 (use content_fts column)

Migration 20260427090000 ha aggiunto `content_fts` GENERATED ALWAYS più performante di `bm25_tokens` trigger-managed. Iter 8 generator-app aggiorna `search_rag_hybrid` SQL function:

```sql
-- Iter 8 patch: switch bm25_tokens → content_fts (GENERATED ALWAYS, no trigger)
CREATE OR REPLACE FUNCTION search_rag_hybrid(
    query_embedding vector(1024),
    query_text      text,
    match_count     int DEFAULT 50,
    rrf_k           int DEFAULT 60,
    filter_source   text DEFAULT NULL,
    filter_chapter  int DEFAULT NULL,
    filter_runtime  text DEFAULT NULL  -- NEW iter 8: 'student'|'teacher'|'batch' for telemetry
)
RETURNS TABLE (
    id uuid,
    content text,
    content_raw text,
    source text,
    chapter int,
    page int,
    figure_id text,
    section_title text,
    contextual_summary text,
    rrf_score float,
    dense_rank int,
    sparse_rank int
)
LANGUAGE sql STABLE AS $$
    WITH dense_search AS (
        SELECT
            id, content, content_raw, source, chapter, page, figure_id,
            section_title, contextual_summary,
            row_number() OVER (ORDER BY embedding <=> query_embedding) AS rank_d
        FROM rag_chunks
        WHERE
            (filter_source IS NULL OR source = filter_source)
            AND (filter_chapter IS NULL OR chapter = filter_chapter)
            AND embedding IS NOT NULL
        ORDER BY embedding <=> query_embedding
        LIMIT match_count
    ),
    sparse_search AS (
        SELECT
            id, content, content_raw, source, chapter, page, figure_id,
            section_title, contextual_summary,
            row_number() OVER (
              ORDER BY ts_rank_cd(content_fts, plainto_tsquery('italian', query_text)) DESC
            ) AS rank_s
        FROM rag_chunks
        WHERE
            (filter_source IS NULL OR source = filter_source)
            AND (filter_chapter IS NULL OR chapter = filter_chapter)
            AND content_fts @@ plainto_tsquery('italian', query_text)
        ORDER BY ts_rank_cd(content_fts, plainto_tsquery('italian', query_text)) DESC
        LIMIT match_count
    ),
    fused AS (
        SELECT
            COALESCE(d.id, s.id) AS id,
            COALESCE(d.content, s.content) AS content,
            COALESCE(d.content_raw, s.content_raw) AS content_raw,
            COALESCE(d.source, s.source) AS source,
            COALESCE(d.chapter, s.chapter) AS chapter,
            COALESCE(d.page, s.page) AS page,
            COALESCE(d.figure_id, s.figure_id) AS figure_id,
            COALESCE(d.section_title, s.section_title) AS section_title,
            COALESCE(d.contextual_summary, s.contextual_summary) AS contextual_summary,
            (CASE WHEN d.rank_d IS NOT NULL THEN 1.0 / (rrf_k::float + d.rank_d::float) ELSE 0 END) +
            (CASE WHEN s.rank_s IS NOT NULL THEN 1.0 / (rrf_k::float + s.rank_s::float) ELSE 0 END) AS rrf_score,
            d.rank_d::int AS dense_rank,
            s.rank_s::int AS sparse_rank
        FROM dense_search d FULL OUTER JOIN sparse_search s ON d.id = s.id
    )
    SELECT id, content, content_raw, source, chapter, page, figure_id,
           section_title, contextual_summary, rrf_score, dense_rank, sparse_rank
    FROM fused
    ORDER BY rrf_score DESC
    LIMIT match_count;
$$;
```

### 4.2 Dense-only fallback (existing LIVE)

```sql
-- migration 20260426160000 (LIVE)
SELECT id, content, content_raw, source, chapter, page, figure_id,
       1 - (embedding <=> query_embedding) AS similarity
FROM rag_chunks
WHERE embedding IS NOT NULL
  AND 1 - (embedding <=> query_embedding) > 0.7
ORDER BY embedding <=> query_embedding
LIMIT 5;
```

Usato come fallback se `useHybrid=false` OR `query_text` empty/short (<3 chars).

### 4.3 Latency note pgvector ivfflat lists=100

Tuning consideration: 1881 chunks × ivfflat 100 lists = ~19 chunks/list. Probes default = 1 (read 1 list). Per recall ≥0.95 raccomandato `SET ivfflat.probes = 10`. Edge Function set `SET LOCAL ivfflat.probes = 10` pre-RPC call. Latency impact +20-30ms ma recall lift +5%.

---

## 5. Latency budget breakdown

| Stage | Operation | p50 (ms) | p95 (ms) | Notes |
|-------|-----------|----------|----------|-------|
| 1 | Cache lookup (Map LRU) | 1 | 3 | In-memory |
| 2 | Voyage embed query | 80 | 150 | Voyage API multilingual-2 |
| 3a | BM25 ts_rank_cd + GIN | 30 | 50 | content_fts column GENERATED, GIN idx |
| 3b | Dense embedding <=> | 100 | 150 | ivfflat 100 lists, probes=10 |
| 3c | RRF fusion in-DB | 3 | 5 | FULL OUTER JOIN + sort |
| 3 | SQL RPC total (parallel 3a+3b → 3c) | 105 | 155 | parallel max + fusion |
| 4 | Rerank optional Voyage | 100 | 200 | rerank-2.5 API, skip if useRerank=false |
| **TOTAL no rerank** | | **190** | **310** | <500ms target B2 ✅ |
| **TOTAL with rerank** | | **290** | **510** | borderline, p95 acceptable |
| **TOTAL cached** | | **2** | **5** | trivial |

**Honesty caveat**: p95 510ms con rerank borderline a target B2 <500ms. Iter 8 acceptable warn-only, iter 9 optimization rerank batch (multiple queries per call) per amortize.

---

## 6. Code interface

### 6.1 hybridRetrieve()

```typescript
/**
 * Hybrid RAG retriever — BM25 italian + dense pgvector + RRF k=60 + optional rerank.
 *
 * @param query — user natural-language query (Italian)
 * @param options.topK — number of chunks to retrieve pre-rerank (default 50)
 * @param options.topN — number of chunks to return post-rerank (default 5)
 * @param options.useRerank — enable Voyage rerank-2.5 API (default false student, true teacher)
 * @param options.runtime — 'student' | 'teacher' | 'batch' for telemetry + cost tracking
 * @param options.filterSource — optional 'vol1'|'vol2'|'vol3'|'wiki'|'glossary'|... narrowing
 * @param options.filterChapter — optional chapter number narrowing (e.g. 6 for "Cap 6 LED")
 * @returns Promise<HybridChunk[]> — top-N chunks with citation fields + scoring meta
 */
export async function hybridRetrieve(
  query: string,
  options: {
    topK?: number;
    topN?: number;
    useRerank?: boolean;
    runtime: 'student' | 'teacher' | 'batch';
    filterSource?: string | null;
    filterChapter?: number | null;
  } = { runtime: 'student' }
): Promise<HybridChunk[]>;

export interface HybridChunk {
  id: string;
  content: string;             // chunk + LLM-generated context prepend
  content_raw: string;         // chunk text alone (citation + display)
  source: string;              // 'vol1' | 'vol2' | 'vol3' | 'wiki' | ...
  chapter: number | null;
  page: number | null;
  figure_id: string | null;
  section_title: string | null;
  contextual_summary: string | null;
  rrf_score: number;
  rerank_score?: number;       // populated only if useRerank=true
  dense_rank: number | null;
  sparse_rank: number | null;
  citation_label: string;      // e.g. "Vol.1 pag.27 §6.2"
}
```

### 6.2 retrieveVolumeContext() backwards-compat

```typescript
/**
 * Backwards-compatible wrapper. Default dense-only iter 7 baseline.
 * Set useHybrid=true for new hybrid path.
 */
export async function retrieveVolumeContext(
  query: string,
  experimentId?: string | null,
  maxChunks: number = 3,
  useHybrid: boolean = false,            // NEW iter 8: opt-in hybrid
  runtime: 'student' | 'teacher' | 'batch' = 'student',
): Promise<string>;
```

Se `useHybrid=true` → invoke `hybridRetrieve` + format string `[CONOSCENZA DAI VOLUMI ELAB]\n--- {citation_label} ---\n{content_raw}\n\n...`. Se `useHybrid=false` → existing path (dense-only RPC `search_chunks` legacy + keyword fallback).

### 6.3 rerankWithVoyage() helper

```typescript
/**
 * Voyage AI rerank-2.5 API wrapper. Graceful degradation on error/quota.
 *
 * @returns reranked chunks OR original on error (NO throw)
 */
export async function rerankWithVoyage(
  query: string,
  chunks: HybridChunk[],
  topN: number,
): Promise<HybridChunk[]>;
```

Endpoint `https://api.voyageai.com/v1/rerank` body:
```json
{
  "query": "Cos'è la legge di Ohm?",
  "documents": ["chunk1 content", "chunk2 content", ...],
  "model": "rerank-2.5",
  "top_k": 5,
  "return_documents": false
}
```

Response:
```json
{
  "data": [
    {"index": 3, "relevance_score": 0.92},
    {"index": 0, "relevance_score": 0.87},
    ...
  ],
  "usage": {"total_tokens": 1234}
}
```

Graceful degradation: HTTP non-2xx OR network err OR timeout 3s → `console.warn` + return `chunks.slice(0, topN)` (RRF-only ordering preserved).

---

## 7. Integration points

### 7.1 Edge Functions consumer

| Function | Iter 8 default | Iter 9 default | Notes |
|----------|---------------|----------------|-------|
| `unlim-chat` | useHybrid=false student, useHybrid=true teacher A/B | useHybrid=true (post-eval) | A/B B1 R6 stress + B2 hybrid eval gate |
| `unlim-diagnose` | useHybrid=true (vision context retrieval) | useHybrid=true | Vision diagnose benefit chunk-specific recall |
| `unlim-hints` | useHybrid=true (hint context retrieval) | useHybrid=true | Hint quality benefit |
| `unlim-tts` | N/A | N/A | TTS no retrieval |
| `unlim-gdpr` | N/A | N/A | Legacy no retrieval |

### 7.2 Wire-up snippet unlim-chat/index.ts

```typescript
// iter 8 wire-up
import { hybridRetrieve, retrieveVolumeContext } from '../_shared/rag.ts';

// in handler:
const runtime = req.headers.get('X-Runtime') === 'teacher' ? 'teacher' : 'student';
const useHybrid = runtime === 'teacher'; // iter 8 A/B
const chunks = useHybrid
  ? await hybridRetrieve(userQuery, { runtime, useRerank: true, topN: 5 })
  : null;

const ragContext = useHybrid && chunks
  ? formatHybridContext(chunks)
  : await retrieveVolumeContext(userQuery, experimentId, 3, false, runtime);
```

### 7.3 Telemetry

Per call insert row `rag_retrieval_log` (NEW iter 8 migration):
- query_text, query_hash, runtime, useHybrid, useRerank, latency_ms,
- n_chunks_returned, top_chunk_id, top_chunk_score,
- error_reason (if any), cache_hit (bool).

Used per B2 eval + cost tracking.

---

## 8. Testing strategy

### 8.1 Unit tests (`tests/unit/hybrid-rag.test.ts`)

12 unit cases:
1. cache hit returns immediately, no SQL call
2. cache miss invokes SQL RPC search_rag_hybrid
3. embed Voyage API mocked → returns 1024-dim
4. embed Voyage error → fallback dense-only
5. SQL RPC error → throws, caller handles
6. RRF score sort descending verified
7. filterSource='vol1' applied → only vol1 chunks
8. filterChapter=6 + filterSource='vol1' → vol1 cap 6 only
9. useRerank=true invokes Voyage rerank API
10. rerank API error → graceful degradation (RRF-only top-N)
11. rerank quota exceeded → graceful degradation
12. citation_label format "Vol.1 pag.27 §6.2" verified

### 8.2 Eval B2 hybrid RAG gold-set

Spec `docs/bench/BENCHMARK-SUITE-ITER-8-2026-04-27.md §B2`:

- **Fixture**: `scripts/bench/hybrid-rag-gold-set.jsonl` (NEW iter 8) — 30 query gold-standard
- **Distribuzione**: 10 keyword-friendly (BM25 favored) + 10 semantic-friendly (dense favored) + 10 hybrid-required (RRF benefit)
- **Metriche**: recall@1, recall@3, recall@5, precision@1, MRR, nDCG@5, latency_ms, token_count_retrieved
- **Pass thresholds**:
  - recall@5 globale ≥0.85
  - precision@1 globale ≥0.70
  - MRR globale ≥0.75
  - per categoria recall@5 ≥0.80
  - latency p95 <500ms

### 8.3 Run command

```bash
node scripts/bench/run-hybrid-rag-eval.mjs \
  --gold-set scripts/bench/hybrid-rag-gold-set.jsonl \
  --supabase-url $SUPABASE_URL \
  --supabase-key $SUPABASE_SERVICE_ROLE_KEY \
  --output scripts/bench/output/hybrid-rag-eval-$(date -u +%Y-%m-%dT%H-%M-%S).json
```

Output JSON:
```json
{
  "fixture": "hybrid-rag-gold-set.jsonl",
  "n_queries": 30,
  "global": {
    "recall_at_5": 0.87,
    "precision_at_1": 0.73,
    "MRR": 0.78,
    "nDCG_at_5": 0.81,
    "latency_p50_ms": 195,
    "latency_p95_ms": 287
  },
  "by_category": {
    "keyword_friendly": { "recall_at_5": 0.90, ... },
    "semantic_friendly": { "recall_at_5": 0.85, ... },
    "hybrid_required": { "recall_at_5": 0.86, ... }
  },
  "passed": true
}
```

### 8.4 Regression baseline

Pre-iter-8 baseline dense-only `retrieveVolumeContext`: recall@5 ~0.72 (estimated R6 seed iter 7). Hybrid target lift: +0.13 (0.72 → 0.85+).

---

## 9. Honesty caveats

1. **bge-reranker-large via Voyage rerank API costo**: $0.05/1K calls. Per ELAB scala 2400/day teacher = $3.6/mese. Defer iter 9 free Anthropic-suggested se quota exceeded.

2. **B2 gold-set 30 query NEW iter 8**: manual labeling expected_chunks. Inter-annotator agreement non misurato. Iter 9 expand 100 + 2 annotator overlap check.

3. **ivfflat probes=1 default → recall ~0.85**: per ≥0.95 SET LOCAL ivfflat.probes=10 pre-RPC. Latency +20-30ms. Iter 8 default probes=10 teacher, probes=1 student (cost vs quality A/B).

4. **Italian dictionary postgres**: builtin `italian` config snowball stemmer. NOT perfect — termini tecnici ("MOSFET", "PWM") preserved as-is (alphanumeric token). Verifica iter 8 con plainto_tsquery dump per 30 query gold-set.

5. **Voyage embedding quota free tier**: 200M token/mese gratuiti voyage-multilingual-2. Stima ELAB ingest 1881 chunks × ~500 token = ~1M token. Query side 2400/day × ~50 token = 120K/day = 3.6M/mese. Total ~5M/mese. Within free tier.

6. **Rerank model choice**: ADR specifies "bge-reranker-large via Voyage rerank API OR Anthropic-suggested". Voyage rerank-2.5 ≠ exactly bge-reranker-large but qualitatively equivalent (Voyage benchmark MTEB top-3 italian). Anthropic-suggested = future option (Claude rerank API non disponibile 2026-04-27).

7. **Cache LRU 100 entries TTL 5min**: stima hit rate 30-40% teacher. Real measure iter 8 telemetry. Se <20% considera redis Upstash iter 9 (cost ~€2/mese 10K req).

8. **search_rag_hybrid SQL function update**: migration 20260426160000 referenzia `bm25_tokens` (legacy trigger column). Iter 8 generator-app DEVE write new migration `20260427120000_search_rag_hybrid_use_content_fts.sql` che CREATE OR REPLACE function con `content_fts` GENERATED ALWAYS column. Backwards-compat: drop trigger `rag_chunks_bm25_trigger` post-cutover.

9. **Cold start ivfflat**: post-deploy first query latency +500ms (lazy index load). Iter 8 deploy script include warmup query.

10. **No multi-vector retrieval iter 8**: ELAB chunks single-embedding (content + contextual_summary concatenated). Iter 10+ consider multi-vector ColBERT-style se recall plateau.

---

## 10. Decision tree if Voyage rerank quota exceeded

```
  hybridRetrieve(query, { useRerank: true })
            │
            ▼
  ┌──────────────────────────┐
  │ rerankWithVoyage(...)     │
  │   POST rerank-2.5 API     │
  └──────────┬───────────────┘
             │
        ┌────┴────────────────────┐
        │                         │
   HTTP 200                  HTTP 429 quota / err
        │                         │
        ▼                         ▼
   reranked top-N         console.warn + telemetry log
        │                  return chunks.slice(0, topN)  ← RRF-only ordering
        │                         │
        └────────┬────────────────┘
                 ▼
          return HybridChunk[]
```

User experience invariata. Quality lift +5-10% perso per quel turn ma chunks comunque relevant (RRF-fused). Iter 9 monitor quota errors → upgrade Voyage tier se >5%/giorno.

---

## 11. Migration backwards compatibility

### 11.1 Iter 8 deployment phases

| Phase | Action | Risk |
|-------|--------|------|
| P1 | Deploy migration `20260427120000_search_rag_hybrid_use_content_fts.sql` (CREATE OR REPLACE function) | LOW — atomic SQL, rollback drop function |
| P2 | Deploy `_shared/rag.ts` extended (hybridRetrieve module + retrieveVolumeContext useHybrid param default false) | LOW — existing dense path preserved |
| P3 | Deploy `_shared/rerank-client.ts` NEW | LOW — opt-in, no consumer wired iter 8 |
| P4 | Wire-up `unlim-diagnose` + `unlim-hints` useHybrid=true (low-traffic A/B) | MEDIUM — verify B2 eval pre-deploy |
| P5 | Wire-up `unlim-chat` runtime-conditional (teacher useHybrid=true, student false) | MEDIUM — student behavior unchanged baseline |

### 11.2 Iter 9 cutover plan

- Iter 8 close: B2 eval recall@5 ≥0.85 verified production teacher
- Iter 9 P0: student useHybrid=true rollout 10% → 50% → 100% staged 3 days
- Iter 9 P1: drop trigger `rag_chunks_bm25_trigger` + drop column `bm25_tokens` (replaced by content_fts GENERATED ALWAYS)

### 11.3 Rollback plan

- Phase P5 rollback: revert `unlim-chat` deploy, useHybrid=false everywhere
- Phase P1 rollback: `DROP FUNCTION search_rag_hybrid; CREATE FUNCTION search_rag_hybrid AS (legacy migration 20260426160000 body);` — 1 min
- Phase P2 rollback: revert `rag.ts` deploy (Edge Function previous version)

---

## 12. Production deployment plan

### 12.1 Iter 8 deploy sequence

1. **Pre-flight CoV** (orchestrator):
   - vitest 12597+ PASS, build PASS, baseline preserved
   - B2 hybrid-rag-gold-set fixture committed
   - migration 20260427120000 SQL syntax validated
   - rerank-client.ts unit tests 5/5 PASS

2. **Deploy migration** (Andrea explicit OK required):
   ```bash
   cd /Users/andreamarro/VOLUME\ 3/PRODOTTO/elab-builder
   SUPABASE_ACCESS_TOKEN=sbp_... npx supabase db push --linked
   # verify: SELECT count(*) FROM pg_proc WHERE proname='search_rag_hybrid';  -- 1
   ```

3. **Deploy Edge Functions**:
   ```bash
   SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb
   SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-diagnose --project-ref euqpdueopmlllqjmqnyb
   SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-hints --project-ref euqpdueopmlllqjmqnyb
   ```

4. **Run B2 eval** (post-deploy):
   ```bash
   node scripts/bench/run-hybrid-rag-eval.mjs \
     --gold-set scripts/bench/hybrid-rag-gold-set.jsonl \
     --supabase-url https://euqpdueopmlllqjmqnyb.supabase.co \
     --supabase-key $SUPABASE_SERVICE_ROLE_KEY \
     --output scripts/bench/output/hybrid-rag-eval-iter8-deploy.json
   ```

5. **Verify pass** B2 thresholds:
   - recall@5 ≥0.85 ✅
   - precision@1 ≥0.70 ✅
   - MRR ≥0.75 ✅
   - latency p95 <500ms ✅

6. **A/B production**:
   - teacher runtime: useHybrid=true, useRerank=true (high quality)
   - student runtime: useHybrid=false initially (defer iter 9 rollout post-eval iter 8 close)
   - batch runtime: useHybrid=true, useRerank=false (cost optimize)

### 12.2 Monitoring + rollback triggers

- Telemetry `rag_retrieval_log` table aggregate dashboard
- Trigger rollback if:
  - error rate >5% over 1h window
  - p95 latency >800ms over 1h
  - Voyage rerank quota error >10%/h
  - User feedback negative (Andrea sees citation hallucination spike)

### 12.3 Iter 9 student runtime rollout gate

Iter 9 student useHybrid=true OK solo se iter 8 close:
- B2 teacher recall@5 ≥0.85 sustained 7 days
- Cost per session B6 teacher hybrid <€0.015 (vs target <€0.012 — accept teacher 25% premium)
- Zero hallucination rate from B1 R6 stress category citation_vol_pag (≥85%)

---

## 13. References

- Cormack, G. V., Clarke, C. L., & Buettcher, S. (2009). "Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods." SIGIR.
- Anthropic (2024-09). "Introducing Contextual Retrieval." https://www.anthropic.com/news/contextual-retrieval
- premai.io (2026). "Hybrid Retrieval Patterns." Internal blog reference cited PDR §1.4.
- Voyage AI docs (2026). "Rerank-2.5 model card." https://docs.voyageai.com/docs/reranker
- Postgres docs (2026). "Full Text Search — italian dictionary."
- pgvector docs (2026). "ivfflat index tuning + probes."

---

## 14. Sign-off

- architect-opus iter 8: PROPOSED ⏳
- Andrea Marro final approver: pending
- Box 6 lift target: 0.0 → 0.7 (iter 8 close) → 0.95 (iter 9 student rollout)

— architect-opus iter 8, 2026-04-27
