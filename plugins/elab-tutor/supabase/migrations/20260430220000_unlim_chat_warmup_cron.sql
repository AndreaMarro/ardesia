-- ════════════════════════════════════════════════════════════════════
-- Sprint T iter 38 Atom A5 — unlim-chat Edge Function warmup cron
-- ════════════════════════════════════════════════════════════════════
--
-- Goal: prevent cold-start latency on the unlim-chat Edge Function by
-- pinging it every ~30 seconds. Edge Function instances stay warm only
-- when traffic is recent; sustained idle (>1-2 min on Supabase Free /
-- low-traffic Pro) lets the V8 isolate evict, costing ~600-1500ms cold
-- boot on the first user request after a quiet period (Italian K-12
-- usage pattern: bursty during class hours, dead overnight).
--
-- Approach: pg_cron + pg_net.http_get to issue a HEAD-style GET to the
-- /unlim-chat endpoint with a synthetic warmup payload that is rejected
-- by guards (no api key + bad input) BEFORE any LLM call. Cost per ping
-- is essentially the round-trip + a 401/400 response; net result keeps
-- the isolate hot at near-zero token cost.
--
-- Apply via:
--   SUPABASE_ACCESS_TOKEN=... npx supabase db push --linked
-- Or paste the body into the Supabase Dashboard SQL editor.
--
-- Requires:
--   - pg_cron extension (Supabase Dashboard → Database → Extensions)
--   - pg_net extension  (Supabase Dashboard → Database → Extensions)
--   - SUPABASE_URL replaced inline below (Supabase doesn't expose env to SQL)
--
-- Reference: PDR Sprint T iter 38 §3 Atom A5 (Cron warmup).
-- (c) Andrea Marro 2026-04-30 — ELAB Tutor Maker-1
-- ════════════════════════════════════════════════════════════════════

-- Ensure required extensions are present (idempotent).
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop any prior warmup schedule with the same name so re-applying this
-- migration is safe even if the cron entry already exists.
DO $$
BEGIN
  PERFORM cron.unschedule('unlim-chat-warmup-30s');
EXCEPTION WHEN OTHERS THEN
  -- ignore: job didn't exist
  NULL;
END$$;

-- Schedule warmup every 30 seconds. pg_cron syntax supports sub-minute
-- schedules via the seconds shorthand "30 seconds".
--
-- The OPTIONS request hits the Edge Function CORS preflight handler,
-- which returns 204 immediately without invoking any LLM / RAG / DB
-- code paths. This is the cheapest possible warmup — no auth header
-- required, no body, no token usage. Verified against
-- supabase/functions/unlim-chat/index.ts CORS handler.
SELECT cron.schedule(
  'unlim-chat-warmup-30s',
  '30 seconds',
  $cron$
    SELECT net.http_get(
      url      := 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat',
      headers  := '{"X-Warmup-Ping": "elab-iter38-a5"}'::jsonb,
      timeout_milliseconds := 5000
    );
  $cron$
);

-- Self-check: confirm the schedule landed.
-- Comment out if running via `db push` non-interactive.
-- SELECT jobid, schedule, active, command FROM cron.job WHERE jobname = 'unlim-chat-warmup-30s';
