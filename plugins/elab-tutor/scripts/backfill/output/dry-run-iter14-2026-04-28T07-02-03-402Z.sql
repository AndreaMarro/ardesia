-- Iter 14 P0 RAG Metadata Backfill DRY-RUN
-- Generated: 2026-04-28T07-02-03-402Z
-- Total matches: 1
-- Total skipped: 999
-- Min match score: 0.55
-- DO NOT execute as-is — Andrea reviews 10 random first

BEGIN;

UPDATE rag_chunks SET chapter=10, page=96, section_title='Capitolo 10 - Il Motore a Corrente Continua', updated_at=now() WHERE id IN ('a223dcd0-bac7-4378-81e8-cbce45b42246');  -- 1 rows

-- Verify post-execute:
-- SELECT COUNT(*) FROM rag_chunks WHERE chapter IS NULL;  -- expect ~999
COMMIT;
