-- ════════════════════════════════════════════════════════════════════
-- Iter 28 H3 fix (code-review brutal) — insert_message_history RPC race condition
-- ════════════════════════════════════════════════════════════════════
--
-- Context: iter 25 P0-A migration 20260511120000_unlim_message_history.sql
-- shipped RPC `insert_message_history` with `SECURITY DEFINER` claim "lock semantics".
-- Code-review iter 28 H3 BRUTAL: SECURITY DEFINER controls privilege NOT locking.
-- Race window:
--   Two concurrent calls with same `session_id` both read `MAX(message_idx)` simultaneously,
--   compute same `v_next_idx`, second `INSERT` collides on PK (session_id, message_idx) → 23505.
-- Today masked by swallowed RPC error `memory.ts:206` → SECOND MESSAGE SILENTLY DROPPED from timeline.
-- Symptoms hidden: marathon msg4 recall test occasionally loses a turn.
--
-- Fix: lock parent `unlim_session_memory` row at start via `SELECT 1 FOR UPDATE` →
-- serializes concurrent inserts per-session. If row doesn't exist, INSERT a stub
-- (saveInteraction RPC `upsert_session_memory` typically creates it first MA defensive idempotente).
--
-- Apply via:
--   SUPABASE_ACCESS_TOKEN=... npx supabase db push --linked
--
-- (c) Andrea Marro 2026-05-11 — iter 28 code-review H3 P0 fix
-- ════════════════════════════════════════════════════════════════════

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
  -- iter 28 H3 FIX — explicit row lock on parent unlim_session_memory session_id.
  -- Serializes concurrent insert_message_history calls per-session.
  -- INSERT defensive idempotent se parent row missing (saveInteraction crea normalmente).
  INSERT INTO unlim_session_memory (session_id, last_topic, message_count, created_at, updated_at)
  VALUES (p_session_id, COALESCE(p_topic, 'init'), 0, now(), now())
  ON CONFLICT (session_id) DO NOTHING;

  -- FOR UPDATE row lock — blocks other concurrent insert_message_history(p_session_id) until commit.
  -- NOWAIT removed: defensive wait short (~ms) preferable vs throw under burst.
  PERFORM 1 FROM unlim_session_memory WHERE session_id = p_session_id FOR UPDATE;

  -- Now safe: only one transaction holds the lock at a time.
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

COMMENT ON FUNCTION insert_message_history IS 'iter 28 H3 fix (code-review brutal): race-safe per-session message_idx auto-increment via FOR UPDATE row lock on unlim_session_memory parent. Replaces iter 25 SECURITY DEFINER lock-semantics claim (incorrect: privilege NOT locking).';
