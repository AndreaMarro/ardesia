-- Sprint S iter 7 close → iter 8 P0 entrance
-- Dedup rag_chunks duplicates from iter 7 delta re-run + add unique constraint
-- Apply: npx supabase db push --linked
-- Fix iter 7 close: split FTS column creation (Step 4) — Supabase free tier
-- maintenance_work_mem 32MB blocks GENERATED ALWAYS AS tsvector for 2174-row
-- table. SET LOCAL bumps to 128MB for that step only.

-- Step 1: Delete duplicates (keep first by created_at NULL last + lowest id)
BEGIN;
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY source, content_raw
           ORDER BY created_at NULLS LAST, id
         ) AS rn
  FROM rag_chunks
)
DELETE FROM rag_chunks
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);
COMMIT;

-- Step 2: Add unique constraint (prevents future duplicates source+content_raw)
BEGIN;
ALTER TABLE rag_chunks
  ADD CONSTRAINT rag_chunks_source_content_unique
  UNIQUE (source, content_raw);
COMMIT;

-- Step 3: Add index on metadata chunk_index (iter 8 Hybrid RAG)
CREATE INDEX IF NOT EXISTS idx_rag_chunks_metadata_chunk_index
  ON rag_chunks ((metadata->>'chunk_index'));

-- Step 4: BM25 italian FTS column (iter 8 P0 Hybrid RAG)
-- Bump maintenance_work_mem to 128MB for this transaction only
-- (Supabase free tier default 32MB blocks GENERATED ALWAYS AS for >1k rows)
BEGIN;
SET LOCAL maintenance_work_mem = '128MB';
ALTER TABLE rag_chunks
  ADD COLUMN IF NOT EXISTS content_fts tsvector
  GENERATED ALWAYS AS (to_tsvector('italian', content)) STORED;
COMMIT;

-- Step 5: GIN index on FTS column for BM25 retrieval
BEGIN;
SET LOCAL maintenance_work_mem = '128MB';
CREATE INDEX IF NOT EXISTS idx_rag_chunks_content_fts
  ON rag_chunks USING gin(content_fts);
COMMIT;

-- Verification queries (run after apply):
-- SELECT COUNT(*) FROM rag_chunks; -- atteso ~1881 (post-dedup)
-- SELECT source, COUNT(*) FROM rag_chunks GROUP BY source ORDER BY COUNT(*) DESC LIMIT 10;
-- SELECT pg_size_pretty(pg_total_relation_size('rag_chunks'));
-- SELECT to_tsvector('italian', 'test') @@ to_tsquery('italian', 'test'); -- verify italian config
