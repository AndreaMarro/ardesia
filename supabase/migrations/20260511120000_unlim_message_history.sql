-- iter 25 P0-A architectural unblocker — `unlim_message_history` per-message timeline table.
-- Doc-4 Phase 0 ROOT CAUSE diagnose 75% confidence:
--   - single-row `unlim_session_memory` `last_*` columns OVERWRITE on each msg
--     → drift across turns, NO ability to answer "il secondo era quale?" or "riepilogo".
--   - architettura NON può fare timeline recall MULTI-msg senza una tabella history.
--
-- Fix: NEW per-message append-only table keyed (session_id, message_idx).
-- - INSERT atomically via SECURITY DEFINER RPC `insert_message_history` returning new idx (auto-increment SELECT MAX + 1).
-- - 7-day TTL via `expires_at` column + pg_cron daily sweep.
-- - GDPR compliant: only truncated previews (user 250, response 100), MAI raw full content.
-- - Backward compat: `unlim_session_memory` PRESERVED (no DROP) → fallback path iter 18.5 legacy sessions.
--
-- See: docs/audits/2026-05-11-iter-25-P0A-message-history-design.md (orchestrator wires iter 25 main thread).

CREATE TABLE IF NOT EXISTS unlim_message_history (
  session_id TEXT NOT NULL,
  message_idx INTEGER NOT NULL,
  experiment_id TEXT,
  chapter SMALLINT,
  volume SMALLINT,
  topic TEXT,
  user_msg_preview TEXT,
  response_preview TEXT,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  PRIMARY KEY (session_id, message_idx)
);

CREATE INDEX IF NOT EXISTS idx_unlim_message_history_session_msg
  ON unlim_message_history(session_id, message_idx DESC);

CREATE INDEX IF NOT EXISTS idx_unlim_message_history_expires
  ON unlim_message_history(expires_at);

ALTER TABLE unlim_message_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_rw_unlim_message_history" ON unlim_message_history;
CREATE POLICY "anon_rw_unlim_message_history" ON unlim_message_history
  FOR ALL TO anon USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON unlim_message_history
  TO anon, authenticated, service_role;

COMMENT ON TABLE unlim_message_history IS 'iter 25 P0-A — per-message timeline append-only (fixes single-row drift unlim_session_memory). 7-day TTL via expires_at + pg_cron sweep. GDPR truncated previews only.';

-- Atomic RPC: SECURITY DEFINER auto-increment message_idx server-side
-- (avoid race window client SELECT MAX → INSERT, similar pattern iter 24 upsert_session_memory).
CREATE OR REPLACE FUNCTION insert_message_history(
  p_session_id TEXT,
  p_experiment_id TEXT,
  p_chapter SMALLINT,
  p_volume SMALLINT,
  p_topic TEXT,
  p_user_msg_preview TEXT,
  p_response_preview TEXT,
  p_model TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next_idx INTEGER;
BEGIN
  -- Auto-increment per-session message_idx atomically.
  -- SECURITY DEFINER ensures lock semantics under concurrent inserts.
  SELECT COALESCE(MAX(message_idx), 0) + 1
    INTO v_next_idx
    FROM unlim_message_history
    WHERE session_id = p_session_id;

  INSERT INTO unlim_message_history (
    session_id,
    message_idx,
    experiment_id,
    chapter,
    volume,
    topic,
    user_msg_preview,
    response_preview,
    model
  ) VALUES (
    p_session_id,
    v_next_idx,
    p_experiment_id,
    p_chapter,
    p_volume,
    p_topic,
    p_user_msg_preview,
    p_response_preview,
    p_model
  );

  RETURN v_next_idx;
END;
$$;

GRANT EXECUTE ON FUNCTION insert_message_history TO anon, authenticated, service_role;

COMMENT ON FUNCTION insert_message_history IS 'iter 25 P0-A — atomic per-session message_idx auto-increment via SELECT MAX + 1 under SECURITY DEFINER lock (no race vs MERGE PG15 race-unsafe pattern Doc-3).';

-- Daily TTL sweep: delete records past expires_at.
-- pg_cron extension required (Supabase provides) — schedule defensive IF NOT EXISTS.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Unschedule prior job if present (idempotent re-run safe).
    PERFORM cron.unschedule('unlim_message_history_ttl_sweep')
      WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'unlim_message_history_ttl_sweep');

    PERFORM cron.schedule(
      'unlim_message_history_ttl_sweep',
      '17 3 * * *', -- daily 03:17 UTC (off-peak)
      $cmd$DELETE FROM unlim_message_history WHERE expires_at < now();$cmd$
    );
  END IF;
END
$$;

COMMENT ON INDEX idx_unlim_message_history_expires IS 'iter 25 P0-A — supports TTL sweep DELETE WHERE expires_at < now() daily pg_cron job.';
