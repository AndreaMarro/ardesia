-- ELAB Hybrid RAG schema (Sprint VPS-3 + Anthropic Contextual Retrieval)
-- Date: 2026-04-26
-- Per: docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md §2

-- ────────────────────────────────────────────────────────────
-- Extensions
-- ────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS vector;          -- pgvector for dense embeddings
CREATE EXTENSION IF NOT EXISTS pg_trgm;          -- trigram similarity (fallback)

-- ────────────────────────────────────────────────────────────
-- rag_chunks table (Anthropic Contextual Retrieval)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rag_chunks (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Content
    content         text NOT NULL,                              -- chunk text + LLM-generated context prepend
    content_raw     text NOT NULL,                              -- chunk text alone (for citations + display)

    -- Embeddings
    embedding       vector(1024),                                -- BGE-M3 dense (1024-dim)
    bm25_tokens     tsvector,                                    -- Italian-tokenized BM25-approx via pg FTS

    -- Source metadata
    source          text NOT NULL,                               -- 'vol1' | 'vol2' | 'vol3' | 'glossary' | 'wiki' | 'faq' | 'errori' | 'analogie' | 'codice'
    chapter         integer,                                     -- e.g. 6 (Cap 6 LED)
    page            integer,                                     -- volume page number
    figure_id       text,                                        -- e.g. 'fig.6.2'
    section_title   text,                                        -- chapter title

    -- Anthropic Contextual Retrieval
    contextual_summary text,                                     -- the LLM-generated 50-token context prepend

    -- Standard
    metadata        jsonb DEFAULT '{}'::jsonb,                   -- arbitrary extra (chunk_index, token_estimate, etc.)
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

-- Auto-update bm25_tokens via trigger on content INSERT/UPDATE
CREATE OR REPLACE FUNCTION rag_chunks_update_bm25()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.bm25_tokens := to_tsvector('italian', COALESCE(NEW.content, ''));
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rag_chunks_bm25_trigger ON rag_chunks;
CREATE TRIGGER rag_chunks_bm25_trigger
    BEFORE INSERT OR UPDATE OF content ON rag_chunks
    FOR EACH ROW EXECUTE FUNCTION rag_chunks_update_bm25();

-- ────────────────────────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────────────────────────

-- Dense embeddings: ivfflat for fast cosine search
CREATE INDEX IF NOT EXISTS rag_chunks_embedding_idx
    ON rag_chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- BM25 sparse: GIN over tsvector
CREATE INDEX IF NOT EXISTS rag_chunks_bm25_idx
    ON rag_chunks USING gin (bm25_tokens);

-- Source filtering (volume + chapter + page)
CREATE INDEX IF NOT EXISTS rag_chunks_source_idx
    ON rag_chunks (source, chapter, page);

-- ────────────────────────────────────────────────────────────
-- search_rag_hybrid() — Reciprocal Rank Fusion (RRF) k=60
-- Per Anthropic Contextual Retrieval + premai.io 2026 hybrid pattern
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION search_rag_hybrid(
    query_embedding vector(1024),
    query_text      text,
    match_count     int DEFAULT 50,
    rrf_k           int DEFAULT 60,
    filter_source   text DEFAULT NULL,           -- optional 'vol1' | 'wiki' | etc.
    filter_chapter  int DEFAULT NULL              -- optional 6 (Cap 6)
)
RETURNS TABLE (
    id              uuid,
    content         text,
    content_raw     text,
    source          text,
    chapter         int,
    page            int,
    figure_id       text,
    rrf_score       float,
    dense_rank      int,
    sparse_rank     int
)
LANGUAGE sql STABLE AS $$
    WITH dense_search AS (
        SELECT
            id, content, content_raw, source, chapter, page, figure_id,
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
            row_number() OVER (ORDER BY ts_rank_cd(bm25_tokens, plainto_tsquery('italian', query_text)) DESC) AS rank_s
        FROM rag_chunks
        WHERE
            (filter_source IS NULL OR source = filter_source)
            AND (filter_chapter IS NULL OR chapter = filter_chapter)
            AND bm25_tokens @@ plainto_tsquery('italian', query_text)
        ORDER BY ts_rank_cd(bm25_tokens, plainto_tsquery('italian', query_text)) DESC
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
            -- RRF score: sum of 1/(k + rank) for each retrieval method
            (CASE WHEN d.rank_d IS NOT NULL THEN 1.0 / (rrf_k::float + d.rank_d::float) ELSE 0 END) +
            (CASE WHEN s.rank_s IS NOT NULL THEN 1.0 / (rrf_k::float + s.rank_s::float) ELSE 0 END) AS rrf_score,
            d.rank_d::int AS dense_rank,
            s.rank_s::int AS sparse_rank
        FROM dense_search d FULL OUTER JOIN sparse_search s ON d.id = s.id
    )
    SELECT id, content, content_raw, source, chapter, page, figure_id, rrf_score, dense_rank, sparse_rank
    FROM fused
    ORDER BY rrf_score DESC
    LIMIT match_count;
$$;

-- ────────────────────────────────────────────────────────────
-- search_rag_dense_only() — fallback if BM25 fails (e.g., very short queries)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION search_rag_dense_only(
    query_embedding vector(1024),
    match_count     int DEFAULT 5,
    threshold       float DEFAULT 0.7
)
RETURNS TABLE (
    id              uuid,
    content         text,
    content_raw     text,
    source          text,
    chapter         int,
    page            int,
    figure_id       text,
    similarity      float
)
LANGUAGE sql STABLE AS $$
    SELECT
        id, content, content_raw, source, chapter, page, figure_id,
        1 - (embedding <=> query_embedding) AS similarity
    FROM rag_chunks
    WHERE
        embedding IS NOT NULL
        AND 1 - (embedding <=> query_embedding) > threshold
    ORDER BY embedding <=> query_embedding
    LIMIT match_count;
$$;

-- ────────────────────────────────────────────────────────────
-- Stats view
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW rag_chunks_stats AS
SELECT
    source,
    COUNT(*) AS chunk_count,
    AVG(LENGTH(content_raw)) AS avg_content_chars,
    SUM(CASE WHEN contextual_summary IS NOT NULL THEN 1 ELSE 0 END) AS contextual_count,
    SUM(CASE WHEN embedding IS NOT NULL THEN 1 ELSE 0 END) AS embedded_count,
    MIN(created_at) AS first_chunk,
    MAX(updated_at) AS last_update
FROM rag_chunks
GROUP BY source
ORDER BY source;

-- ────────────────────────────────────────────────────────────
-- RLS (Row Level Security) — read-only for anon, write only via service_role
-- ────────────────────────────────────────────────────────────

ALTER TABLE rag_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY rag_chunks_anon_read ON rag_chunks
    FOR SELECT TO anon
    USING (true);

CREATE POLICY rag_chunks_service_write ON rag_chunks
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- Migration verification
-- ────────────────────────────────────────────────────────────

-- After applying this migration, verify with:
--   SELECT * FROM rag_chunks_stats;  -- should be empty initially
--   SELECT count(*) FROM rag_chunks;  -- should be 0
--
-- Post-ingest verify (from rag-contextual-ingest.mjs):
--   SELECT * FROM rag_chunks_stats;  -- expected: 6000+ chunks across vol1/vol2/vol3/glossary/wiki/faq
--
-- Test hybrid search:
--   SELECT id, source, chapter, page, rrf_score
--   FROM search_rag_hybrid(
--       (SELECT embedding FROM rag_chunks LIMIT 1),  -- placeholder embedding
--       'cosa è un LED',
--       5
--   );
