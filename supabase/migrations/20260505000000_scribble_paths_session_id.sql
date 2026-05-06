-- ============================================
-- Sprint V iter 1 — Atom A2.3 — scribble_paths session_id
--
-- Estende scribble_paths (migration 20260429120000) con session_id per
-- preservare cronologia annotazioni multi-sessione (mandate Andrea iter 21+
-- "contenuto sparisce SOLO con cancellazione esplicita").
--
-- Schema delta:
--   + ADD COLUMN session_id TEXT (nullable, backward-compat con righe legacy)
--   - DROP CONSTRAINT scribble_paths_exp_user_unique (vecchia 2-tuple)
--   + ADD CONSTRAINT scribble_paths_session_exp_user_unique (3-tuple)
--   + INDEX idx_scribble_paths_session_exp
--
-- Backward-compat: righe esistenti hanno session_id = NULL e continuano a
-- collidere come prima sulla coppia (experiment_id, user_id) WHERE session_id IS NULL.
--
-- DO NOT apply via `supabase db push` without Andrea OK.
-- ============================================

-- 1. ADD COLUMN session_id (idempotente)
ALTER TABLE scribble_paths
  ADD COLUMN IF NOT EXISTS session_id TEXT;

-- 2. DROP old 2-tuple unique constraint (idempotente)
ALTER TABLE scribble_paths
  DROP CONSTRAINT IF EXISTS scribble_paths_exp_user_unique;

-- 3. ADD new 3-tuple unique constraint via UNIQUE INDEX (NULLS NOT DISTINCT
--    per Postgres 15+; per compat usiamo expression con coalesce su NULL marker)
DROP INDEX IF EXISTS scribble_paths_session_exp_user_unique;
CREATE UNIQUE INDEX scribble_paths_session_exp_user_unique
  ON scribble_paths (
    experiment_id,
    COALESCE(user_id::text, ''),
    COALESCE(session_id, '')
  );

-- 4. Index on (session_id, experiment_id) for session-scoped lookups
CREATE INDEX IF NOT EXISTS idx_scribble_paths_session_exp
  ON scribble_paths (session_id, experiment_id);

-- Comment on new column
COMMENT ON COLUMN scribble_paths.session_id IS
  'Sprint V iter 1 — nullable session scope. Permette stessa coppia '
  '(experiment_id, user_id) di avere annotazioni distinte per sessione '
  'docente diversa. NULL = riga legacy pre-iter1 (backward-compat).';
