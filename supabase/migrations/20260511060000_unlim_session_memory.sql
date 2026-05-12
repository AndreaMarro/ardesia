-- iter 18.5 BUG FIX critical — unlim_session_memory dedicated table per memoria UNLIM
-- ROOT CAUSE diagnosi prod live test:
--   - student_progress.session_id COLUMN does NOT exist (real PK student_id)
--   - student_sessions.last_experiment_id COLUMN does NOT exist (schema cache PGRST204)
--   - lesson_contexts RLS infinite recursion on classes policy
--
-- memory.ts assume schema diverso da prod = memoria mai funzionata davvero.
-- Andrea brutal "memoria mai esistita davvero" diagnosi confirmed structural.
--
-- Fix: NEW table dedicated UNLIM keyed session_id (no FK constraint, no recursion).
-- Lavora ortogonalmente schema legacy esistente, evita migrazione invasive su tabelle
-- shared con Dashboard docente (class_students/classes policy recursion).

CREATE TABLE IF NOT EXISTS unlim_session_memory (
  session_id TEXT PRIMARY KEY,
  last_experiment_id TEXT,
  last_chapter SMALLINT,
  last_volume SMALLINT,
  last_topic TEXT,
  last_response_preview TEXT,
  last_model TEXT,
  common_mistakes JSONB DEFAULT '[]'::jsonb,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_unlim_session_memory_updated ON unlim_session_memory(updated_at DESC);

-- RLS open (anon rw) — Edge Function usa service_role bypass MA anon fallback ok
ALTER TABLE unlim_session_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_rw_unlim_session_memory" ON unlim_session_memory;
CREATE POLICY "anon_rw_unlim_session_memory" ON unlim_session_memory
  FOR ALL TO anon USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON unlim_session_memory TO anon, authenticated, service_role;

COMMENT ON TABLE unlim_session_memory IS 'iter 18.5 — UNLIM session memory dedicated table (bypass student_progress class_students RLS recursion). Memoria Q10 cross-msg recall.';
