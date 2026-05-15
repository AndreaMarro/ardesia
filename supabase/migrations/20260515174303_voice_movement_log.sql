-- ============================================================================
-- ADR-049 Sense 1.6 Atom 1 — voice_movement_log
-- ============================================================================
-- Iter 64 entrance ratify gruppo 3 4/4 SI (Andrea 2026-05-15 PM).
--
-- Tracking: pattern voce docente (cadenza + registro emotivo STT) +
--   movimenti lavagna SVG path coord delta sampling iter 66+ movement-tracker.
--
-- DEPLOY GATE: NO `supabase db push --linked` iter 64.
--
-- Schema source: ADR-049 §3.3 (verbatim).
-- RLS Pattern S1: open client-side.
-- Retention 90 giorni (GDPR principio proporzionalità — lower than 24m
--   teacher_history_log per L. 300/1970 Art. 4 mitigation).
-- ============================================================================

CREATE TABLE IF NOT EXISTS voice_movement_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  voice_event_type TEXT, -- 'wake_word_triggered' | 'stt_transcription' | 'tts_played'
  voice_payload JSONB, -- transcription text + confidence + duration
  movement_paths JSONB, -- SVG path array [{x, y, t_ms}, ...]
  movement_intensity FLOAT, -- coord delta sum per minute
  zone_preferred TEXT[], -- ['breadboard', 'arduino', 'led-area']
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices: session_id lookup (primary access pattern) + event_type scan
CREATE INDEX IF NOT EXISTS idx_vml_session ON voice_movement_log(session_id);
CREATE INDEX IF NOT EXISTS idx_vml_event_type ON voice_movement_log(voice_event_type);

-- RLS Pattern S1 open client-side
-- Retention 90 days (lower than teacher_history_log per GDPR principio proporzionalità)
ALTER TABLE voice_movement_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_vml_anon_rw ON voice_movement_log;
CREATE POLICY p_vml_anon_rw ON voice_movement_log
  FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON voice_movement_log TO anon, authenticated;

COMMENT ON TABLE voice_movement_log IS
  'ADR-049 Sense 1.6 dim 4+5 — voce docente STT events + movimenti lavagna SVG path coord delta. RLS Pattern S1. Retention 90 giorni (proporzionalità GDPR vs 24m teacher_history_log).';
