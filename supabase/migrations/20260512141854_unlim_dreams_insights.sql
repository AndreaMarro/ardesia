-- Sprint U iter 39 Phase 4 — UNLIM Dreams overnight consolidation table.
--
-- Anthropic Dreams pattern equivalent (4-phase: Orient/Gather/Consolidate/Prune).
-- Nightly batch reads past 24h sessions per docente_id + class_key →
-- LLM-summarizes into per-docente / per-classe / per-experiment insights →
-- stores in this table for next-morning Dashboard + UNLIM context inject.
--
-- Storage growth projection: 100 docenti × 365 days × 3 KB/insight = ~110 MB/anno
-- with 30-day TTL = ~9 MB rolling window steady-state.
--
-- Cost overnight Mistral Medium 3.5 batch (model-agnostic via callLLM):
-- ~€0.02-0.05/notte 100 docenti × 250 tokens × $0.40/1M.
--
-- Schedule pg_cron 03:00 UTC (zero class activity Italy 04:00-05:00).
--
-- Reference: docs/audits/2026-05-12-phase-4-unlim-dreams-design.md
-- (c) Andrea Marro 2026-05-12 — ELAB Tutor Sprint U iter 39 Phase 4

-- ════════════════════════════════════════════════════════════════════════════
-- Table: unlim_dreams_insights
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS unlim_dreams_insights (
  id BIGSERIAL PRIMARY KEY,

  -- WHO this insight applies to
  docente_id TEXT NOT NULL,           -- class_key OR stable doc identifier
  insight_type TEXT NOT NULL,          -- 'per_docente' | 'per_classe' | 'per_experiment'
  scope_key TEXT,                      -- e.g. 'class_4B' OR 'v2-cap5-esp2' OR NULL for per_docente

  -- WHAT the insight says
  insight_text TEXT NOT NULL,          -- LLM-generated 1-paragraph natural language
  embedding VECTOR(1024),              -- pgvector for semantic retrieval next-day

  -- PROVENANCE for audit + GDPR sub-processor compliance
  sources JSONB NOT NULL DEFAULT '{}'::jsonb,
                                       -- {session_ids: ["..."], turn_count: N,
                                       --  model: "mistral-medium-3.5",
                                       --  generated_at_utc: "2026-05-12T03:00:00Z"}

  -- LIFECYCLE
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),

  -- Constraints
  CONSTRAINT insight_type_check CHECK (
    insight_type IN ('per_docente', 'per_classe', 'per_experiment')
  ),
  CONSTRAINT insight_text_nonempty CHECK (length(trim(insight_text)) > 0)
);

-- ════════════════════════════════════════════════════════════════════════════
-- Indexes
-- ════════════════════════════════════════════════════════════════════════════

-- Per-docente recent fetch (Dashboard widget + chat pre-context inject)
CREATE INDEX IF NOT EXISTS idx_dreams_docente_recent
  ON unlim_dreams_insights (docente_id, created_at DESC)
  WHERE expires_at > now();

-- Semantic retrieval (similarity search next-day insight by chat query)
CREATE INDEX IF NOT EXISTS idx_dreams_embedding
  ON unlim_dreams_insights
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Scope-based fetch (per-experiment insight aggregate cross-classe)
CREATE INDEX IF NOT EXISTS idx_dreams_scope
  ON unlim_dreams_insights (insight_type, scope_key)
  WHERE expires_at > now();

-- Expiry cleanup support
CREATE INDEX IF NOT EXISTS idx_dreams_expires
  ON unlim_dreams_insights (expires_at)
  WHERE expires_at > now();

-- ════════════════════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════════════════════
-- Mirror existing rag_chunks + sessions pattern (open RLS for orchestration tier,
-- enforcement via Edge Function header check + class_key isolation server-side).

ALTER TABLE unlim_dreams_insights ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if migration re-run (idempotent)
DROP POLICY IF EXISTS "service_role_full" ON unlim_dreams_insights;

CREATE POLICY "service_role_full" ON unlim_dreams_insights
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant on roles (orchestration tier)
GRANT SELECT, INSERT, UPDATE, DELETE ON unlim_dreams_insights
  TO authenticated, anon, service_role;

-- Sequence grants (BIGSERIAL id)
GRANT USAGE, SELECT ON SEQUENCE unlim_dreams_insights_id_seq
  TO authenticated, anon, service_role;

-- ════════════════════════════════════════════════════════════════════════════
-- pg_cron scheduling (gated behind extension check)
-- ════════════════════════════════════════════════════════════════════════════
-- Activation step (Andrea ratify Phase 4 deploy):
--   1. Verify pg_cron + pg_net extensions enabled:
--        SELECT extname FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
--   2. Set cron_secret config:
--        ALTER SYSTEM SET app.dreams_cron_secret = 'YOUR_SECRET_HERE';
--        SELECT pg_reload_conf();
--   3. Schedule Dreams batch (03:00 UTC nightly):
--        SELECT cron.schedule(
--          'unlim-dreams-nightly',
--          '0 3 * * *',
--          $$ SELECT net.http_post(
--               url := 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-dreams-batch',
--               headers := jsonb_build_object(
--                 'Authorization', 'Bearer ' || current_setting('app.dreams_cron_secret'),
--                 'content-type', 'application/json'
--               ),
--               body := '{}'::jsonb,
--               timeout_milliseconds := 600000
--             );
--        $$
--      );
--   4. Schedule TTL prune (04:00 UTC nightly):
--        SELECT cron.schedule(
--          'unlim-dreams-prune',
--          '0 4 * * *',
--          $$ DELETE FROM unlim_dreams_insights WHERE expires_at < now(); $$
--        );
--
-- Both schedules left COMMENTED in migration to avoid auto-activation pre-ratify.
-- Andrea executes manually post Phase 4 Edge Function deploy + smoke test.

-- ════════════════════════════════════════════════════════════════════════════
-- Comments (table self-documentation)
-- ════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE unlim_dreams_insights IS
  'Sprint U iter 39 Phase 4 — UNLIM Dreams overnight consolidation insights.
   Anthropic Dreams pattern equivalent. 4-phase batch (Orient/Gather/
   Consolidate/Prune) runs 03:00 UTC nightly via pg_cron → unlim-dreams-batch
   Edge Function. Stores per-docente + per-classe + per-experiment insights
   for next-morning Dashboard surface + chat pre-context inject.
   Reference: docs/audits/2026-05-12-phase-4-unlim-dreams-design.md';

COMMENT ON COLUMN unlim_dreams_insights.docente_id IS
  'class_key or stable docente identifier; multi-purpose for per_docente |
   per_classe | per_experiment scope';

COMMENT ON COLUMN unlim_dreams_insights.insight_type IS
  'Insight scope: per_docente (broad), per_classe (specific class), or
   per_experiment (aggregate cross-classe for a specific lesson_path)';

COMMENT ON COLUMN unlim_dreams_insights.scope_key IS
  'Disambiguator for insight_type: class_key for per_classe, experiment_id
   for per_experiment, NULL for per_docente';

COMMENT ON COLUMN unlim_dreams_insights.sources IS
  'Audit JSONB: {session_ids: [...], turn_count: N, model: "...",
   generated_at_utc: "..."} — GDPR Art. 28 §3 sub-processor compliance';

COMMENT ON COLUMN unlim_dreams_insights.expires_at IS
  'TTL 30 days default; pruned nightly 04:00 UTC via pg_cron';
