-- ============================================
-- OpenClaw Tool Memory — Sprint S iter 3
-- gen-app-opus 2026-04-26
--
-- Spec source of truth: scripts/openclaw/tool-memory.ts MIGRATION_SQL +
--   ADR-007 (module extraction pattern: 4 RPC stubs)
--
-- Sprint S iter 3 contract simplification:
--   - schema cut to the minimal columns the contract enumerates
--   - 4 RPC stubs: oc_tool_memory_get | _set | _gc | _stats
--   - real cosine-match RPC + GC RPC stay defined in the larger
--     openclaw scaffold and will be applied in the Sprint 6 day 39
--     migration when the full tool-memory.ts wires up.
--
-- RLS: service_role full, anon NO access.
-- DO NOT apply via `supabase db push` without Andrea OK.
-- ============================================

-- Optional pgvector extension (idempotent — may already be present)
CREATE EXTENSION IF NOT EXISTS vector;

-- Table (matches Sprint S iter 3 contract)
CREATE TABLE IF NOT EXISTS openclaw_tool_memory (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ts            TIMESTAMPTZ NOT NULL DEFAULT now(),
    tool_id       TEXT NOT NULL,                 -- e.g. "L1:retrieve_concept"
    input_hash    TEXT NOT NULL,                 -- sha256 of input args
    output        JSONB NOT NULL,                -- cached tool result
    embedding     VECTOR(384),                   -- nullable, MiniLM-L6 sized stub
    ttl_seconds   INT  NOT NULL DEFAULT 86400,   -- 24h default

    UNIQUE (tool_id, input_hash)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_oc_tm_tool_input
  ON openclaw_tool_memory (tool_id, input_hash);
CREATE INDEX IF NOT EXISTS idx_oc_tm_ts
  ON openclaw_tool_memory (ts DESC);
CREATE INDEX IF NOT EXISTS idx_oc_tm_output_gin
  ON openclaw_tool_memory USING GIN (output);

COMMENT ON TABLE openclaw_tool_memory IS
  'OpenClaw tool result cache. (tool_id,input_hash) is the cache key. '
  'TTL enforced via oc_tool_memory_get + oc_tool_memory_gc.';

-- RLS
ALTER TABLE openclaw_tool_memory ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'openclaw_tool_memory' AND policyname = 'service_role_all'
    ) THEN
        CREATE POLICY service_role_all
            ON openclaw_tool_memory
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════
-- 4 RPC stubs (ADR-007 pattern) — get / set / gc / stats
-- ════════════════════════════════════════════════════════════════════

-- 1. GET: returns cached output if fresh, else NULL
CREATE OR REPLACE FUNCTION oc_tool_memory_get(
    p_tool_id   TEXT,
    p_input_hash TEXT
) RETURNS JSONB AS $$
    SELECT output
    FROM openclaw_tool_memory
    WHERE tool_id = p_tool_id
      AND input_hash = p_input_hash
      AND ts > now() - (ttl_seconds || ' seconds')::interval
    LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- 2. SET: upsert (tool_id, input_hash) → output
CREATE OR REPLACE FUNCTION oc_tool_memory_set(
    p_tool_id     TEXT,
    p_input_hash  TEXT,
    p_output      JSONB,
    p_embedding   VECTOR(384) DEFAULT NULL,
    p_ttl_seconds INT DEFAULT 86400
) RETURNS UUID AS $$
DECLARE
    out_id UUID;
BEGIN
    INSERT INTO openclaw_tool_memory (tool_id, input_hash, output, embedding, ttl_seconds, ts)
    VALUES (p_tool_id, p_input_hash, p_output, p_embedding, p_ttl_seconds, now())
    ON CONFLICT (tool_id, input_hash) DO UPDATE
        SET output      = EXCLUDED.output,
            embedding   = COALESCE(EXCLUDED.embedding, openclaw_tool_memory.embedding),
            ttl_seconds = EXCLUDED.ttl_seconds,
            ts          = now()
    RETURNING id INTO out_id;
    RETURN out_id;
END;
$$ LANGUAGE plpgsql;

-- 3. GC: delete expired rows; returns count
CREATE OR REPLACE FUNCTION oc_tool_memory_gc()
RETURNS INT AS $$
DECLARE
    n INT;
BEGIN
    DELETE FROM openclaw_tool_memory
    WHERE ts <= now() - (ttl_seconds || ' seconds')::interval;
    GET DIAGNOSTICS n = ROW_COUNT;
    RETURN n;
END;
$$ LANGUAGE plpgsql;

-- 4. STATS: aggregate counters per tool_id
CREATE OR REPLACE FUNCTION oc_tool_memory_stats()
RETURNS TABLE (
    tool_id     TEXT,
    n_rows      BIGINT,
    n_fresh     BIGINT,
    n_expired   BIGINT,
    last_ts     TIMESTAMPTZ
) AS $$
    SELECT
        tool_id,
        count(*)                                                                    AS n_rows,
        count(*) FILTER (WHERE ts > now() - (ttl_seconds || ' seconds')::interval)  AS n_fresh,
        count(*) FILTER (WHERE ts <= now() - (ttl_seconds || ' seconds')::interval) AS n_expired,
        max(ts)                                                                     AS last_ts
    FROM openclaw_tool_memory
    GROUP BY tool_id
    ORDER BY tool_id;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION oc_tool_memory_get IS  'Sprint S iter 3 cache GET (TTL-aware). NULL if missing or expired.';
COMMENT ON FUNCTION oc_tool_memory_set IS  'Sprint S iter 3 cache SET (UPSERT on tool_id+input_hash). Returns row id.';
COMMENT ON FUNCTION oc_tool_memory_gc  IS  'Sprint S iter 3 GC (delete TTL-expired rows). Returns deleted count.';
COMMENT ON FUNCTION oc_tool_memory_stats IS 'Sprint S iter 3 stats per tool_id.';
