-- Iter 14 P0 RAG Metadata Backfill DRY-RUN
-- Generated: 2026-05-10T17-42-37-178Z
-- Total matches: 0
-- Total skipped: 1000
-- Min match score: 0.55
-- DO NOT execute as-is — Andrea reviews 10 random first

BEGIN;


-- Verify post-execute:
-- SELECT COUNT(*) FROM rag_chunks WHERE chapter IS NULL;  -- expect ~1000
COMMIT;
