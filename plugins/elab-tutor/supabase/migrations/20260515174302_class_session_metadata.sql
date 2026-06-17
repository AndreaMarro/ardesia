-- ============================================================================
-- ADR-049 Sense 1.6 Atom 1 — class_session_metadata
-- ============================================================================
-- Iter 64 entrance ratify gruppo 3 4/4 SI (Andrea 2026-05-15 PM).
--
-- Tracking: tempo disponibile + livello autonomia + materiale_presente JSON +
--   esperimento_scelto + narrative_position (narrative_map.json arc).
--
-- DEPLOY GATE: NO `supabase db push --linked` iter 64.
--
-- Schema source: ADR-049 §3.2 (verbatim).
-- RLS Pattern S1: open client-side anon class_key localStorage convention.
-- ============================================================================

CREATE TABLE IF NOT EXISTS class_session_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_key TEXT NOT NULL, -- existing class_key convention iter 14
  session_id UUID NOT NULL,
  tempo_disponibile_min INT NOT NULL DEFAULT 40, -- 30/40/50 lab
  livello_autonomia TEXT NOT NULL DEFAULT 'lead', -- 'lead' | 'shared' | 'auto'
  materiale_presente JSONB NOT NULL DEFAULT '{}', -- {"led": 10, "r220": 5, "breadboard": true, ...}
  esperimento_scelto TEXT, -- experiment_id pinned currently
  narrative_position TEXT, -- narrative_map.json arc position iter 47
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices: class_key + session_id lookups (composite primary access pattern)
CREATE INDEX IF NOT EXISTS idx_csm_class_session ON class_session_metadata(class_key, session_id);
CREATE INDEX IF NOT EXISTS idx_csm_session ON class_session_metadata(session_id);

-- RLS Pattern S1 open client-side
ALTER TABLE class_session_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_csm_anon_rw ON class_session_metadata;
CREATE POLICY p_csm_anon_rw ON class_session_metadata
  FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON class_session_metadata TO anon, authenticated;

COMMENT ON TABLE class_session_metadata IS
  'ADR-049 Sense 1.6 dim 7+8+9+10 — tempo disponibile + livello autonomia + esperimento scelto + materiale presente. RLS Pattern S1 anon class_key localStorage. Retention 24 mesi (Q4 iter 64 ratify).';
