-- ============================================================================
-- Migration: wiki_concepts (Tea Glossario corpus)
-- Date: 2026-04-28 (iter 22)
-- Author: Claude (caveman pipeline)
-- Status: NOT applied — pending Andrea ratify gate post-bench.
-- ============================================================================
-- Purpose:
--   Store 180 Tea-curated termini (Vol1+Vol2+Vol3) as a first-class corpus
--   distinct from rag_chunks (which contains volume narrative chunks).
--   wiki_concepts powers UNLIM RAG retrieval boost for high-precision
--   glossary hits (term lookup + cross-reference).
--
-- Rationale (vs reusing rag_chunks):
--   - Strict term/technical/kids triplet schema (no free-form chunks)
--   - Independent embedding column allows targeted re-embed without
--     re-vectorizing volume narrative
--   - Separate table simplifies hybrid RRF scoring (boost wiki hits k=60)
-- ============================================================================

-- Required extensions (assumed already enabled, kept for idempotency).
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS wiki_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vol INT NOT NULL CHECK (vol BETWEEN 1 AND 3),
  cap INT NOT NULL CHECK (cap BETWEEN 1 AND 14),
  cap_title TEXT,
  term TEXT NOT NULL,
  technical TEXT NOT NULL,
  kids_explanation TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'tea-glossario-2026-04-27',
  embedding VECTOR(1024), -- BGE-M3 dimension; null until embedded.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Uniqueness: same term may exist across volumes (LED Vol1 + LED Vol2)
-- so the dedup key is (vol, cap, term).
CREATE UNIQUE INDEX IF NOT EXISTS wiki_concepts_unique_idx
  ON wiki_concepts (vol, cap, term);

-- Italian full-text search on term + technical + kids.
CREATE INDEX IF NOT EXISTS wiki_concepts_fts_idx
  ON wiki_concepts USING gin (
    to_tsvector(
      'italian',
      term || ' ' || technical || ' ' || kids_explanation
    )
  );

-- Trigram for fuzzy term lookup (typo tolerance).
CREATE INDEX IF NOT EXISTS wiki_concepts_term_trgm_idx
  ON wiki_concepts USING gin (term gin_trgm_ops);

-- ANN index for embedding cosine similarity. ivfflat lists tuned for ~180 rows
-- (small corpus → 4 lists is plenty; rebuild after bulk insert).
CREATE INDEX IF NOT EXISTS wiki_concepts_embed_idx
  ON wiki_concepts USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 4);

-- Helper: keep updated_at fresh.
CREATE OR REPLACE FUNCTION wiki_concepts_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wiki_concepts_set_updated_at ON wiki_concepts;
CREATE TRIGGER wiki_concepts_set_updated_at
BEFORE UPDATE ON wiki_concepts
FOR EACH ROW EXECUTE FUNCTION wiki_concepts_touch_updated_at();

-- RLS: open read for anon (classe virtuale pattern), service role full access.
ALTER TABLE wiki_concepts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wiki_concepts_anon_read ON wiki_concepts;
CREATE POLICY wiki_concepts_anon_read ON wiki_concepts
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS wiki_concepts_service_all ON wiki_concepts;
CREATE POLICY wiki_concepts_service_all ON wiki_concepts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT SELECT ON wiki_concepts TO anon;
GRANT ALL ON wiki_concepts TO service_role;

-- Hybrid retrieval RPC: combines FTS rank + embedding cosine + RRF k=60.
-- Embedding param nullable → falls back to FTS-only when embeddings missing.
CREATE OR REPLACE FUNCTION wiki_concepts_hybrid_search(
  query_text TEXT,
  query_embedding VECTOR(1024) DEFAULT NULL,
  match_count INT DEFAULT 5,
  rrf_k INT DEFAULT 60
)
RETURNS TABLE (
  id UUID,
  vol INT,
  cap INT,
  term TEXT,
  technical TEXT,
  kids_explanation TEXT,
  rrf_score REAL
)
LANGUAGE SQL STABLE AS $$
  WITH fts AS (
    SELECT
      w.id,
      ROW_NUMBER() OVER (
        ORDER BY ts_rank(
          to_tsvector('italian', w.term || ' ' || w.technical || ' ' || w.kids_explanation),
          plainto_tsquery('italian', query_text)
        ) DESC
      ) AS rank
    FROM wiki_concepts w
    WHERE to_tsvector('italian', w.term || ' ' || w.technical || ' ' || w.kids_explanation)
          @@ plainto_tsquery('italian', query_text)
  ),
  vec AS (
    SELECT
      w.id,
      ROW_NUMBER() OVER (ORDER BY w.embedding <=> query_embedding) AS rank
    FROM wiki_concepts w
    WHERE query_embedding IS NOT NULL AND w.embedding IS NOT NULL
  ),
  combined AS (
    SELECT id, 1.0 / (rrf_k + rank) AS score FROM fts
    UNION ALL
    SELECT id, 1.0 / (rrf_k + rank) AS score FROM vec
  ),
  agg AS (
    SELECT id, SUM(score)::REAL AS rrf_score
    FROM combined
    GROUP BY id
    ORDER BY rrf_score DESC
    LIMIT match_count
  )
  SELECT w.id, w.vol, w.cap, w.term, w.technical, w.kids_explanation, agg.rrf_score
  FROM agg
  JOIN wiki_concepts w ON w.id = agg.id
  ORDER BY agg.rrf_score DESC;
$$;

GRANT EXECUTE ON FUNCTION wiki_concepts_hybrid_search TO anon, service_role;

COMMENT ON TABLE wiki_concepts IS
  '180 termini Tea Glossario (Vol1=66, Vol2=59, Vol3=55). Iter 22 corpus. Embeddings: BGE-M3 1024d.';
