-- ============================================================================
-- ADR-049 Sense 1.6 Atom 1 — teacher_history_log
-- ============================================================================
-- Iter 64 entrance ratify gruppo 3 4/4 SI (Andrea 2026-05-15 PM):
--   D4 Q1-Q5 defaults ACCEPTED (Q1 first_launch_modal + Q2 navy_default_off +
--   Q3 self_cert + Q4 24mesi_retention + Q5 sub_processor_commit_iter_65)
--
-- File ownership: Atom 1 dispatch ~2h work (4 migrations + RLS S1 +
--   sub-processor list +4 entries + integration tests).
--
-- DEPLOY GATE: NO `supabase db push --linked` iter 64 — Andrea explicit
--   ratify iter 65+ entrance gate (Atom 0 ADR-050 §2.6).
--
-- Schema source: ADR-049 §3.1 (verbatim).
-- RLS Pattern S1: open client-side anon UUID localStorage (existing iter 14).
-- Retention 24 mesi (Q4 ratified).
-- ============================================================================

CREATE TABLE IF NOT EXISTS teacher_history_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_anon_uuid UUID NOT NULL,
  session_id UUID NOT NULL,
  experiment_id TEXT,
  chapter TEXT,
  vol TEXT, -- "v1" / "v2" / "v3"
  pag INT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  concepts_explained TEXT[],
  errors_encountered TEXT[], -- error patterns categorized
  ragazzi_count_estimated INT,
  device_mode TEXT, -- 'lim' | 'lim+ipad' | 'solo-lim'
  consent_version TEXT NOT NULL, -- gdpr consent tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices: anon_uuid lookups (most frequent) + chapter scan per docente
CREATE INDEX IF NOT EXISTS idx_thl_teacher_uuid ON teacher_history_log(teacher_anon_uuid);
CREATE INDEX IF NOT EXISTS idx_thl_chapter_lookup ON teacher_history_log(teacher_anon_uuid, vol, chapter);
CREATE INDEX IF NOT EXISTS idx_thl_session ON teacher_history_log(session_id);

-- RLS Pattern S1 open client-side, anon UUID localStorage (existing iter 14 pattern)
ALTER TABLE teacher_history_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_thl_anon_rw ON teacher_history_log;
CREATE POLICY p_thl_anon_rw ON teacher_history_log
  FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON teacher_history_log TO anon, authenticated;

COMMENT ON TABLE teacher_history_log IS
  'ADR-049 Sense 1.6 dim 1 — Insegnante profilo cumulativo trans-sessione. RLS Pattern S1 anon UUID localStorage. Retention 24 mesi (Q4 iter 64 ratify). Sub-processor list +entry public/sub-processors.md [STATUS: pending UI deploy iter 66+].';
