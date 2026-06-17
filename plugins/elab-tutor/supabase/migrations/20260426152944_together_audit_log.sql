-- ============================================
-- Together AI audit log — Sprint S iter 3
-- gen-app-opus 2026-04-26
--
-- Every call to Together AI (US provider) is logged here.
-- Logs the GATE outcome too (blocked / ok / error) so we can prove
-- that student-runtime traffic NEVER reaches Together AI.
--
-- RLS: service_role full, anon NO access.
-- DO NOT apply via `supabase db push` without Andrea OK.
-- ============================================

-- Table
CREATE TABLE IF NOT EXISTS together_audit_log (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ts                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    request_kind          TEXT NOT NULL,         -- "fallback" | "wiki_ingest" | "lesson_prep" | "quiz_gen"
    anonymized_payload    JSONB,                 -- redacted messages snapshot (NEVER raw PII)
    user_role             TEXT NOT NULL,         -- "student" | "teacher" | "batch" | "emergency"
    consent_id            TEXT,                  -- nullable — required for teacher mode
    latency_ms            INT  NOT NULL DEFAULT 0,
    status                TEXT NOT NULL,         -- "ok" | "blocked_*" | "error_*" | "<http>"

    -- Self-document the GDPR posture
    CONSTRAINT together_audit_log_role_chk
      CHECK (user_role IN ('student','teacher','batch','emergency'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_together_audit_ts          ON together_audit_log (ts DESC);
CREATE INDEX IF NOT EXISTS idx_together_audit_role_ts     ON together_audit_log (user_role, ts DESC);
CREATE INDEX IF NOT EXISTS idx_together_audit_status_ts   ON together_audit_log (status, ts DESC);
CREATE INDEX IF NOT EXISTS idx_together_audit_payload_gin ON together_audit_log USING GIN (anonymized_payload);

-- Comments
COMMENT ON TABLE together_audit_log IS
  'GDPR audit log: every Together AI (US provider) call decision. '
  'Student rows must always have status starting with "blocked_" — never "ok".';
COMMENT ON COLUMN together_audit_log.anonymized_payload IS
  'Snapshot of payload AFTER PII redaction (anonymizePayload). NEVER store raw PII.';

-- RLS
ALTER TABLE together_audit_log ENABLE ROW LEVEL SECURITY;

-- Service-role full access (Edge Function uses service role key)
DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'together_audit_log' AND policyname = 'service_role_all'
    ) THEN
        CREATE POLICY service_role_all
            ON together_audit_log
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Authenticated + anon get NOTHING (no SELECT policy → default deny under RLS)

-- Monthly spend / posture view (dashboard widget)
CREATE OR REPLACE VIEW together_monthly_summary AS
SELECT
    date_trunc('month', ts) AS month,
    user_role,
    request_kind,
    count(*)                                  AS n_calls,
    count(*) FILTER (WHERE status = 'ok')     AS n_ok,
    count(*) FILTER (WHERE status LIKE 'blocked_%') AS n_blocked,
    count(*) FILTER (WHERE status LIKE 'error_%')   AS n_error,
    avg(latency_ms)                           AS avg_latency_ms
FROM together_audit_log
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 2, 3;

COMMENT ON VIEW together_monthly_summary IS
  'Monthly aggregates: n_calls, ok/blocked/error counts, avg latency. '
  'student rows where n_ok > 0 = GDPR INCIDENT.';
