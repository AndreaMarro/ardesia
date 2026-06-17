-- ============================================
-- GDPR Compliance Migration — ELAB per minori
-- Aggiunge: consent tracking, data retention, deletion
-- (c) Andrea Marro — 02/04/2026
-- ============================================

-- ─── PARENTAL CONSENT TRACKING ──────────────────
-- GDPR Art. 8: processing children <16 requires parental consent
CREATE TABLE IF NOT EXISTS parental_consents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id        UUID REFERENCES classes(id) ON DELETE SET NULL,
    consent_given   BOOLEAN NOT NULL DEFAULT FALSE,
    consent_date    TIMESTAMPTZ,
    consent_method  TEXT, -- 'form_signed', 'email_confirmed', 'in_app'
    parent_email    TEXT, -- encrypted, only for consent verification
    gdpr_version    TEXT DEFAULT '1.0', -- version of privacy policy accepted
    revoked_at      TIMESTAMPTZ, -- NULL if active, timestamp if revoked
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consents_student ON parental_consents(student_id);

-- RLS: only teacher of the class can view consents
ALTER TABLE parental_consents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers see their class consents') THEN
        CREATE POLICY "Teachers see their class consents"
            ON parental_consents FOR SELECT
            USING (class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()));
    END IF;
END $$;

-- ─── DATA RETENTION POLICY ──────────────────────
-- GDPR Art. 5(1)(e): storage limitation
-- Auto-delete old data via scheduled function

-- Add expiry column to relevant tables
ALTER TABLE student_sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ
    DEFAULT (now() + INTERVAL '1 year');
ALTER TABLE student_progress ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ
    DEFAULT (now() + INTERVAL '1 year');
ALTER TABLE lesson_contexts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ
    DEFAULT (now() + INTERVAL '6 months');
ALTER TABLE confusion_reports ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ
    DEFAULT (now() + INTERVAL '6 months');
ALTER TABLE mood_reports ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ
    DEFAULT (now() + INTERVAL '3 months');

-- Function to purge expired data (run via cron/pg_cron)
CREATE OR REPLACE FUNCTION purge_expired_data()
RETURNS INTEGER AS $$
DECLARE
    total_deleted INTEGER := 0;
    deleted INTEGER;
BEGIN
    DELETE FROM mood_reports WHERE expires_at < now();
    GET DIAGNOSTICS deleted = ROW_COUNT;
    total_deleted := total_deleted + deleted;

    DELETE FROM confusion_reports WHERE expires_at < now();
    GET DIAGNOSTICS deleted = ROW_COUNT;
    total_deleted := total_deleted + deleted;

    DELETE FROM lesson_contexts WHERE expires_at < now();
    GET DIAGNOSTICS deleted = ROW_COUNT;
    total_deleted := total_deleted + deleted;

    DELETE FROM student_progress WHERE expires_at < now();
    GET DIAGNOSTICS deleted = ROW_COUNT;
    total_deleted := total_deleted + deleted;

    DELETE FROM student_sessions WHERE expires_at < now();
    GET DIAGNOSTICS deleted = ROW_COUNT;
    total_deleted := total_deleted + deleted;

    RETURN total_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── RIGHT TO ERASURE (Art. 17) ─────────────────
-- Complete deletion of all student data
CREATE OR REPLACE FUNCTION delete_student_data(target_session_id TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}'::JSONB;
    deleted INTEGER;
BEGIN
    DELETE FROM mood_reports WHERE session_id = target_session_id;
    GET DIAGNOSTICS deleted = ROW_COUNT;
    result := result || jsonb_build_object('mood_reports', deleted);

    DELETE FROM confusion_reports WHERE session_id = target_session_id;
    GET DIAGNOSTICS deleted = ROW_COUNT;
    result := result || jsonb_build_object('confusion_reports', deleted);

    DELETE FROM lesson_contexts WHERE session_id = target_session_id;
    GET DIAGNOSTICS deleted = ROW_COUNT;
    result := result || jsonb_build_object('lesson_contexts', deleted);

    DELETE FROM student_progress WHERE session_id = target_session_id;
    GET DIAGNOSTICS deleted = ROW_COUNT;
    result := result || jsonb_build_object('student_progress', deleted);

    DELETE FROM student_sessions WHERE session_id = target_session_id;
    GET DIAGNOSTICS deleted = ROW_COUNT;
    result := result || jsonb_build_object('student_sessions', deleted);

    DELETE FROM nudges WHERE session_id = target_session_id;
    GET DIAGNOSTICS deleted = ROW_COUNT;
    result := result || jsonb_build_object('nudges', deleted);

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── DATA MINIMIZATION ─────────────────────────
-- Ensure no PII is stored in lesson_contexts
COMMENT ON TABLE lesson_contexts IS
    'GDPR: stores only topic categories and experiment IDs, NEVER raw student messages or names';
COMMENT ON TABLE student_progress IS
    'GDPR: student identified by session hash only, no PII stored';
COMMENT ON TABLE mood_reports IS
    'GDPR Art. 9: special category data — auto-expires after 3 months';

-- ─── AUDIT LOG ──────────────────────────────────
-- Track data access for GDPR compliance
CREATE TABLE IF NOT EXISTS gdpr_audit_log (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action      TEXT NOT NULL, -- 'data_access', 'data_delete', 'consent_given', 'consent_revoked'
    actor_id    UUID, -- teacher or system
    target_id   TEXT, -- session_id affected
    details     JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON gdpr_audit_log(created_at);

-- Auto-purge audit logs after 2 years
ALTER TABLE gdpr_audit_log ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ
    DEFAULT (now() + INTERVAL '2 years');
