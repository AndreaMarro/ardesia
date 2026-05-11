-- iter 24 Phase 1 P0 ROOT CAUSE FIX — user_intent_seed column
-- Doc-3+4 evidence H5: memory.ts stores LLM response only, NOT user msg1 intent.
-- msg2 LLM reads OWN response (potentially hallucinated) → user intent PERMANENTLY LOST.
-- Case B verbatim evidence iter 22 B-memoria s4:
--   msg1 user "Pulsante cap.7" → LLM redirect "capitolo 7 RGB" → stored "RGB"
--   msg2 user "Continuiamo" → LLM reads "RGB" → hallucinates "RGB" (pulsante intent perso)
-- Fix: persist user msg1 verbatim as immutable seed, COALESCE preserve across msg2/3+.

ALTER TABLE unlim_session_memory
  ADD COLUMN IF NOT EXISTS user_intent_seed TEXT,
  ADD COLUMN IF NOT EXISTS message_count_total INTEGER DEFAULT 0;

COMMENT ON COLUMN unlim_session_memory.user_intent_seed IS 'iter 24 Phase 1 — user verbatim msg1 intent text, IMMUTABLE (COALESCE preserve cross-msg).';
COMMENT ON COLUMN unlim_session_memory.message_count_total IS 'iter 24 Phase 1 — total messages count session, increment on each save.';

-- Iter 24 Phase 1 atomic RPC upsert preserving user_intent_seed via COALESCE (race-cond defense)
CREATE OR REPLACE FUNCTION upsert_session_memory(
  p_session_id TEXT,
  p_user_intent TEXT,
  p_last_experiment_id TEXT,
  p_last_chapter SMALLINT,
  p_last_volume SMALLINT,
  p_last_topic TEXT,
  p_last_response_preview TEXT,
  p_last_model TEXT,
  p_new_mistakes JSONB DEFAULT '[]'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO unlim_session_memory (
    session_id,
    user_intent_seed,
    last_experiment_id,
    last_chapter,
    last_volume,
    last_topic,
    last_response_preview,
    last_model,
    common_mistakes,
    message_count,
    message_count_total,
    updated_at
  ) VALUES (
    p_session_id,
    p_user_intent,
    p_last_experiment_id,
    p_last_chapter,
    p_last_volume,
    p_last_topic,
    p_last_response_preview,
    p_last_model,
    p_new_mistakes,
    1,
    1,
    NOW()
  )
  ON CONFLICT (session_id) DO UPDATE SET
    -- iter 24 P0 FIX: user_intent_seed COALESCE preserve msg1 (NON overwrite)
    user_intent_seed = COALESCE(unlim_session_memory.user_intent_seed, EXCLUDED.user_intent_seed),
    last_experiment_id = EXCLUDED.last_experiment_id,
    last_chapter = EXCLUDED.last_chapter,
    last_volume = EXCLUDED.last_volume,
    last_topic = EXCLUDED.last_topic,
    last_response_preview = EXCLUDED.last_response_preview,
    last_model = EXCLUDED.last_model,
    -- Merge new mistakes with existing (deduplicated)
    common_mistakes = (
      SELECT jsonb_agg(DISTINCT m)
      FROM jsonb_array_elements(unlim_session_memory.common_mistakes || EXCLUDED.common_mistakes) m
      LIMIT 10
    ),
    message_count = unlim_session_memory.message_count + 1,
    message_count_total = unlim_session_memory.message_count_total + 1,
    updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_session_memory TO anon, authenticated, service_role;

COMMENT ON FUNCTION upsert_session_memory IS 'iter 24 Phase 1 — atomic upsert preserve user_intent_seed COALESCE + merge mistakes server-side (fix SELECT-then-UPSERT race window memory.ts:236-258).';
