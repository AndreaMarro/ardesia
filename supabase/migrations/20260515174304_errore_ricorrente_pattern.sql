-- ============================================================================
-- ADR-049 Sense 1.6 Atom 1 — errore_ricorrente_pattern
-- ============================================================================
-- Iter 64 entrance ratify gruppo 3 4/4 SI (Andrea 2026-05-15 PM).
--
-- Tracking: pattern errori docente ricorrenti (es. dimentica sempre R220+LED,
--   parte sempre dal codice prima del cablaggio, salta sezione X libro).
--
-- DEPLOY GATE: NO `supabase db push --linked` iter 64.
--
-- Schema source: ADR-049 §3.4 (verbatim).
-- RLS Pattern S1: open client-side anon UUID localStorage.
-- Retention 24 mesi (Q4 ratified).
-- ============================================================================

CREATE TABLE IF NOT EXISTS errore_ricorrente_pattern (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_anon_uuid UUID NOT NULL,
  pattern_signature TEXT NOT NULL, -- es. 'led_polarity_dimenticata', 'r220_inversione_alim', 'breadboard_riga_sbagliata'
  detected_count INT NOT NULL DEFAULT 1,
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  capitolo_context TEXT,
  remediation_suggested TEXT, -- UNLIM nudge text già provato
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices: teacher_anon_uuid + pattern_signature composite (top-N most frequent)
CREATE INDEX IF NOT EXISTS idx_erp_teacher_signature ON errore_ricorrente_pattern(teacher_anon_uuid, pattern_signature);
CREATE INDEX IF NOT EXISTS idx_erp_teacher_count ON errore_ricorrente_pattern(teacher_anon_uuid, detected_count DESC);

-- RLS Pattern S1 open client-side
ALTER TABLE errore_ricorrente_pattern ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_erp_anon_rw ON errore_ricorrente_pattern;
CREATE POLICY p_erp_anon_rw ON errore_ricorrente_pattern
  FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON errore_ricorrente_pattern TO anon, authenticated;

COMMENT ON TABLE errore_ricorrente_pattern IS
  'ADR-049 Sense 1.6 dim 6 — pattern errori docente ricorrenti per nudge predittivo proattivo. RLS Pattern S1 anon UUID localStorage. Retention 24 mesi (Q4 iter 64 ratify).';
