-- ============================================
-- ELAB Tutor — Supabase Schema
-- Database: PostgreSQL 15+ (Supabase free tier)
-- RLS: ogni docente vede solo le sue classi,
--       ogni studente vede solo i suoi progressi.
-- (c) Andrea Marro — 01/04/2026
-- ============================================

-- Enable UUID extension (Supabase has it by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for RAG semantic search (246 volume chunks)
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── CLASSES ─────────────────────────────────────────────
-- Classi create dal docente. Ogni docente puo avere N classi.
CREATE TABLE IF NOT EXISTS classes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    school      TEXT,
    city        TEXT,
    class_code  TEXT UNIQUE, -- codice 6 char per join studente
    volumes     TEXT[] DEFAULT ARRAY['Volume 1', 'Volume 2', 'Volume 3'],
    active_games TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);

-- ─── CLASS_STUDENTS ──────────────────────────────────────
-- Associazione studente-classe (many-to-many).
CREATE TABLE IF NOT EXISTS class_students (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id    UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name TEXT, -- cached name for teacher dashboard display
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_class_students_class ON class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON class_students(student_id);

-- ─── STUDENT_SESSIONS ────────────────────────────────────
-- Sessioni di lezione: ogni volta che uno studente interagisce
-- con un esperimento o il tutor, viene registrata una sessione.
CREATE TABLE IF NOT EXISTS student_sessions (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    experiment_id     TEXT, -- e.g. 'v1-cap6-esp1'
    session_type      TEXT NOT NULL DEFAULT 'experiment', -- 'experiment' | 'game' | 'tutor' | 'lobby'
    started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at          TIMESTAMPTZ,
    duration_seconds  INTEGER DEFAULT 0,
    completed         BOOLEAN DEFAULT false,
    score             JSONB, -- freeform: {correct, total, note}
    messages_count    INTEGER DEFAULT 0,
    errors_count      INTEGER DEFAULT 0,
    actions_count     INTEGER DEFAULT 0,
    summary           TEXT CHECK (length(summary) <= 500), -- auto-generated, capped
    activity          JSONB DEFAULT '[]'::JSONB, -- array of {type, detail, timestamp}
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_student ON student_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_experiment ON student_sessions(experiment_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON student_sessions(started_at DESC);

-- ─── STUDENT_PROGRESS ────────────────────────────────────
-- Progressi aggregati per studente+esperimento.
-- Upsert: aggiorna ad ogni completamento.
CREATE TABLE IF NOT EXISTS student_progress (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    experiment_id   TEXT NOT NULL,
    completed       BOOLEAN DEFAULT false,
    attempts        INTEGER DEFAULT 0,
    best_score      INTEGER, -- percentuale 0-100
    total_time_sec  INTEGER DEFAULT 0,
    last_result     TEXT DEFAULT 'pending', -- 'success' | 'partial' | 'skipped' | 'pending'
    concepts        TEXT[] DEFAULT ARRAY[]::TEXT[], -- concetti acquisiti
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, experiment_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_student ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_experiment ON student_progress(experiment_id);
CREATE INDEX IF NOT EXISTS idx_progress_updated ON student_progress(updated_at DESC);

-- ─── MOOD_REPORTS ────────────────────────────────────────
-- Stato emotivo dello studente (meteo didattico).
CREATE TABLE IF NOT EXISTS mood_reports (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood        TEXT NOT NULL, -- 'energico' | 'concentrato' | 'confuso' | 'bloccato' | 'felice' | 'frustrato' | 'curioso' | 'creativo'
    context     TEXT CHECK (length(context) <= 200), -- capped for GDPR
    experiment_id TEXT, -- esperimento corrente quando il mood e stato registrato
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_moods_student ON mood_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_moods_created ON mood_reports(created_at DESC);

-- ─── NUDGES ──────────────────────────────────────────────
-- Messaggi docente -> studente (o intera classe).
CREATE TABLE IF NOT EXISTS nudges (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = intera classe
    class_id    UUID REFERENCES classes(id) ON DELETE CASCADE,
    message     TEXT NOT NULL CHECK (length(message) <= 500), -- capped nudge text
    read        BOOLEAN DEFAULT false,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nudges_student ON nudges(student_id);
CREATE INDEX IF NOT EXISTS idx_nudges_class ON nudges(class_id);
CREATE INDEX IF NOT EXISTS idx_nudges_unread ON nudges(student_id, read) WHERE read = false;

-- ─── LESSON_CONTEXTS ─────────────────────────────────────
-- Contesto lezione per UNLIM cross-sessione.
-- Permette: "L'ultima volta avete fatto il LED. Oggi il resistore."
CREATE TABLE IF NOT EXISTS lesson_contexts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id        UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    experiment_id   TEXT NOT NULL,
    context_data    JSONB NOT NULL DEFAULT '{}'::JSONB, -- {summary, concepts_covered, mistakes, quiz_results}
    session_summary TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_ctx_class ON lesson_contexts(class_id);
CREATE INDEX IF NOT EXISTS idx_lesson_ctx_student ON lesson_contexts(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_ctx_created ON lesson_contexts(created_at DESC);

-- ─── CONFUSION_REPORTS ───────────────────────────────────
-- Log di confusione specifico per esperimento (per heatmap).
CREATE TABLE IF NOT EXISTS confusion_reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    experiment_id   TEXT NOT NULL,
    concept_id      TEXT, -- concetto specifico
    level           INTEGER NOT NULL CHECK (level >= 0 AND level <= 10),
    context         TEXT CHECK (length(context) <= 200), -- capped for GDPR
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_confusion_student ON confusion_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_confusion_experiment ON confusion_reports(experiment_id);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE confusion_reports ENABLE ROW LEVEL SECURITY;

-- ─── CLASSES POLICIES ────────────────────────────────────
-- Docente: CRUD sulle proprie classi
CREATE POLICY classes_teacher_select ON classes
    FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY classes_teacher_insert ON classes
    FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY classes_teacher_update ON classes
    FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY classes_teacher_delete ON classes
    FOR DELETE USING (teacher_id = auth.uid());
-- Studente: vede le classi a cui appartiene (per nome/info classe)
CREATE POLICY classes_student_select ON classes
    FOR SELECT USING (
        id IN (SELECT class_id FROM class_students WHERE student_id = auth.uid())
    );

-- ─── CLASS_STUDENTS POLICIES ─────────────────────────────
-- Docente: vede studenti delle proprie classi
CREATE POLICY cs_teacher_select ON class_students
    FOR SELECT USING (
        class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
    );
-- Docente: aggiunge/rimuove studenti
CREATE POLICY cs_teacher_insert ON class_students
    FOR INSERT WITH CHECK (
        class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
    );
CREATE POLICY cs_teacher_delete ON class_students
    FOR DELETE USING (
        class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
    );
-- Studente: vede le proprie associazioni (per sapere in che classe e)
CREATE POLICY cs_student_select ON class_students
    FOR SELECT USING (student_id = auth.uid());

-- ─── STUDENT_SESSIONS POLICIES ───────────────────────────
-- Studente: inserisce e vede le proprie sessioni
CREATE POLICY sessions_student_select ON student_sessions
    FOR SELECT USING (student_id = auth.uid());
CREATE POLICY sessions_student_insert ON student_sessions
    FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY sessions_student_update ON student_sessions
    FOR UPDATE USING (student_id = auth.uid());
-- Docente: vede sessioni degli studenti nelle proprie classi
CREATE POLICY sessions_teacher_select ON student_sessions
    FOR SELECT USING (
        student_id IN (
            SELECT cs.student_id FROM class_students cs
            JOIN classes c ON cs.class_id = c.id
            WHERE c.teacher_id = auth.uid()
        )
    );

-- ─── STUDENT_PROGRESS POLICIES ───────────────────────────
-- Studente: CRUD sui propri progressi
CREATE POLICY progress_student_select ON student_progress
    FOR SELECT USING (student_id = auth.uid());
CREATE POLICY progress_student_insert ON student_progress
    FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY progress_student_update ON student_progress
    FOR UPDATE USING (student_id = auth.uid());
-- Docente: vede progressi degli studenti nelle proprie classi
CREATE POLICY progress_teacher_select ON student_progress
    FOR SELECT USING (
        student_id IN (
            SELECT cs.student_id FROM class_students cs
            JOIN classes c ON cs.class_id = c.id
            WHERE c.teacher_id = auth.uid()
        )
    );

-- ─── MOOD_REPORTS POLICIES ───────────────────────────────
-- Studente: inserisce e vede i propri mood
CREATE POLICY moods_student_select ON mood_reports
    FOR SELECT USING (student_id = auth.uid());
CREATE POLICY moods_student_insert ON mood_reports
    FOR INSERT WITH CHECK (student_id = auth.uid());
-- Docente: vede mood degli studenti nelle proprie classi
CREATE POLICY moods_teacher_select ON mood_reports
    FOR SELECT USING (
        student_id IN (
            SELECT cs.student_id FROM class_students cs
            JOIN classes c ON cs.class_id = c.id
            WHERE c.teacher_id = auth.uid()
        )
    );

-- ─── NUDGES POLICIES ────────────────────────────────────
-- Docente: invia nudge alle proprie classi
CREATE POLICY nudges_teacher_insert ON nudges
    FOR INSERT WITH CHECK (
        teacher_id = auth.uid() AND
        (class_id IS NULL OR class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()))
    );
CREATE POLICY nudges_teacher_select ON nudges
    FOR SELECT USING (
        teacher_id = auth.uid() OR
        student_id = auth.uid()
    );
-- Studente: legge e marca come letti i propri nudge
CREATE POLICY nudges_student_select ON nudges
    FOR SELECT USING (student_id = auth.uid() OR student_id IS NULL);
CREATE POLICY nudges_student_update ON nudges
    FOR UPDATE USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- ─── LESSON_CONTEXTS POLICIES ────────────────────────────
-- Studente: CRUD sui propri contesti
CREATE POLICY lctx_student_select ON lesson_contexts
    FOR SELECT USING (student_id = auth.uid());
CREATE POLICY lctx_student_insert ON lesson_contexts
    FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY lctx_student_update ON lesson_contexts
    FOR UPDATE USING (student_id = auth.uid());
-- Docente: vede contesti delle proprie classi
CREATE POLICY lctx_teacher_select ON lesson_contexts
    FOR SELECT USING (
        class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
    );

-- ─── CONFUSION_REPORTS POLICIES ──────────────────────────
-- Studente: inserisce e vede i propri report
CREATE POLICY confusion_student_select ON confusion_reports
    FOR SELECT USING (student_id = auth.uid());
CREATE POLICY confusion_student_insert ON confusion_reports
    FOR INSERT WITH CHECK (student_id = auth.uid());
-- Docente: vede report degli studenti nelle proprie classi
CREATE POLICY confusion_teacher_select ON confusion_reports
    FOR SELECT USING (
        student_id IN (
            SELECT cs.student_id FROM class_students cs
            JOIN classes c ON cs.class_id = c.id
            WHERE c.teacher_id = auth.uid()
        )
    );

-- ═══════════════════════════════════════════════════════════
-- TRIGGERS: auto-update updated_at
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_classes_updated
    BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_sessions_updated
    BEFORE UPDATE ON student_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_progress_updated
    BEFORE UPDATE ON student_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_lesson_ctx_updated
    BEFORE UPDATE ON lesson_contexts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════
-- REALTIME: abilita per nudges (notifiche push)
-- ═══════════════════════════════════════════════════════════

-- Supabase Realtime: solo nudges (minimizza overhead)
ALTER PUBLICATION supabase_realtime ADD TABLE nudges;

-- ─── RATE_LIMITS ────────────────────────────────────────
-- Persistent rate limiting (survives Edge Function redeploys).
-- Used by guards.ts with in-memory fallback.
CREATE TABLE IF NOT EXISTS rate_limits (
    session_id   TEXT PRIMARY KEY,
    request_count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RPC for atomic rate limit check+increment (called by guards.ts)
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_session_id TEXT,
    p_max_requests INTEGER DEFAULT 30,
    p_window_ms INTEGER DEFAULT 60000
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
    v_window_start TIMESTAMPTZ;
    v_window_interval INTERVAL;
BEGIN
    v_window_interval := (p_window_ms || ' milliseconds')::INTERVAL;

    -- Try to get existing entry
    SELECT request_count, window_start INTO v_count, v_window_start
    FROM rate_limits WHERE session_id = p_session_id FOR UPDATE;

    IF NOT FOUND OR v_window_start < now() - v_window_interval THEN
        -- New window: upsert with count=1
        INSERT INTO rate_limits (session_id, request_count, window_start)
        VALUES (p_session_id, 1, now())
        ON CONFLICT (session_id)
        DO UPDATE SET request_count = 1, window_start = now();
        RETURN TRUE;
    END IF;

    IF v_count >= p_max_requests THEN
        RETURN FALSE; -- Rate limited
    END IF;

    -- Increment
    UPDATE rate_limits SET request_count = v_count + 1
    WHERE session_id = p_session_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Auto-cleanup: delete expired windows older than 5 minutes
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limits WHERE window_start < now() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Combined cleanup: rate limits + old lesson contexts + old audit logs
CREATE OR REPLACE FUNCTION run_gdpr_cleanup()
RETURNS JSONB AS $$
DECLARE
    deleted_rates INTEGER;
    deleted_contexts INTEGER;
    deleted_audit INTEGER;
BEGIN
    -- Cleanup expired rate limits
    DELETE FROM rate_limits WHERE window_start < now() - INTERVAL '5 minutes';
    GET DIAGNOSTICS deleted_rates = ROW_COUNT;

    -- Cleanup lesson contexts older than 90 days (GDPR data minimization)
    DELETE FROM lesson_contexts WHERE updated_at < now() - INTERVAL '90 days';
    GET DIAGNOSTICS deleted_contexts = ROW_COUNT;

    -- Cleanup audit logs older than 1 year (keep for compliance, then purge)
    DELETE FROM gdpr_audit_log WHERE created_at < now() - INTERVAL '365 days';
    GET DIAGNOSTICS deleted_audit = ROW_COUNT;

    RETURN jsonb_build_object(
        'rate_limits_cleaned', deleted_rates,
        'lesson_contexts_cleaned', deleted_contexts,
        'audit_logs_cleaned', deleted_audit,
        'ran_at', now()
    );
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup via pg_cron (enable in Supabase Dashboard → Database → Extensions → pg_cron):
-- SELECT cron.schedule('gdpr-cleanup', '0 3 * * *', $$ SELECT run_gdpr_cleanup(); $$);
-- Runs daily at 3 AM UTC

-- ─── GDPR_AUDIT_LOG ─────────────────────────────────────
-- Audit trail for GDPR actions (delete, export, consent).
CREATE TABLE IF NOT EXISTS gdpr_audit_log (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action     TEXT NOT NULL,
    target_id  TEXT NOT NULL,
    details    JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gdpr_audit_target ON gdpr_audit_log(target_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_audit_created ON gdpr_audit_log(created_at DESC);

-- RLS on audit log: service role can INSERT, nobody can UPDATE or DELETE
ALTER TABLE gdpr_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_insert_only ON gdpr_audit_log
    FOR INSERT WITH CHECK (true); -- Service role can insert
-- No SELECT/UPDATE/DELETE policies = immutable audit trail for non-service-role users

-- ─── PARENTAL_CONSENTS ──────────────────────────────────
-- Parental consent records for GDPR Art. 8.
CREATE TABLE IF NOT EXISTS parental_consents (
    student_id     TEXT PRIMARY KEY,
    class_id       TEXT,
    consent_given  BOOLEAN NOT NULL DEFAULT false,
    consent_date   TIMESTAMPTZ,
    consent_method TEXT NOT NULL DEFAULT 'in_app',
    parent_email   TEXT,
    revoked_at     TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── LESSON_CONTEXTS TTL ────────────────────────────────
-- Auto-delete lesson contexts older than 90 days (data minimization).
CREATE OR REPLACE FUNCTION cleanup_old_lesson_contexts()
RETURNS void AS $$
BEGIN
    DELETE FROM lesson_contexts WHERE updated_at < now() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ─── DELETE_STUDENT_DATA (GDPR Art. 17) ─────────────────
-- Accepts EITHER a session_id (TEXT, from anonymous sessions)
-- OR a student_id (UUID, from authenticated sessions).
-- Deletes from ALL 8 data tables + rate_limits.
CREATE OR REPLACE FUNCTION delete_student_data(target_session_id TEXT)
RETURNS JSONB AS $$
DECLARE
    target_student_uuid UUID;
    deleted_sessions INTEGER := 0;
    deleted_progress INTEGER := 0;
    deleted_contexts INTEGER := 0;
    deleted_moods    INTEGER := 0;
    deleted_confusion INTEGER := 0;
    deleted_nudges   INTEGER := 0;
    deleted_class_students INTEGER := 0;
    deleted_consents INTEGER := 0;
    deleted_rates    INTEGER := 0;
BEGIN
    -- Try to resolve session_id to student_id UUID
    SELECT student_id INTO target_student_uuid
    FROM student_sessions WHERE id::TEXT = target_session_id
    LIMIT 1;

    -- If we have a student UUID, delete from all user-specific tables
    IF target_student_uuid IS NOT NULL THEN
        DELETE FROM student_sessions WHERE student_id = target_student_uuid;
        GET DIAGNOSTICS deleted_sessions = ROW_COUNT;

        DELETE FROM student_progress WHERE student_id = target_student_uuid;
        GET DIAGNOSTICS deleted_progress = ROW_COUNT;

        DELETE FROM lesson_contexts WHERE student_id = target_student_uuid;
        GET DIAGNOSTICS deleted_contexts = ROW_COUNT;

        DELETE FROM mood_reports WHERE student_id = target_student_uuid;
        GET DIAGNOSTICS deleted_moods = ROW_COUNT;

        DELETE FROM confusion_reports WHERE student_id = target_student_uuid;
        GET DIAGNOSTICS deleted_confusion = ROW_COUNT;

        DELETE FROM nudges WHERE student_id = target_student_uuid;
        GET DIAGNOSTICS deleted_nudges = ROW_COUNT;

        DELETE FROM class_students WHERE student_id = target_student_uuid;
        GET DIAGNOSTICS deleted_class_students = ROW_COUNT;

        DELETE FROM parental_consents WHERE student_id = target_student_uuid::TEXT;
        GET DIAGNOSTICS deleted_consents = ROW_COUNT;
    END IF;

    -- Always clean rate limits by session key
    DELETE FROM rate_limits WHERE session_id = target_session_id;
    GET DIAGNOSTICS deleted_rates = ROW_COUNT;

    RETURN jsonb_build_object(
        'sessions', deleted_sessions,
        'progress', deleted_progress,
        'contexts', deleted_contexts,
        'mood_reports', deleted_moods,
        'confusion_reports', deleted_confusion,
        'nudges', deleted_nudges,
        'class_students', deleted_class_students,
        'consents', deleted_consents,
        'rate_limits', deleted_rates
    );
END;
$$ LANGUAGE plpgsql;

-- ─── KNOWLEDGE_CHUNKS (RAG pgvector) ──────────────────────
-- 246 chunks from 3 ELAB volumes with vector embeddings.
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id         SERIAL PRIMARY KEY,
    volume     INTEGER NOT NULL CHECK (volume BETWEEN 1 AND 3),
    chapter    TEXT,
    title      TEXT,
    content    TEXT NOT NULL,
    embedding  vector(3072),  -- Gemini embedding-001 output dimension
    metadata   JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chunks_volume ON knowledge_chunks(volume);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON knowledge_chunks
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);

-- RPC for semantic search (called by rag.ts)
CREATE OR REPLACE FUNCTION search_chunks(
    query_embedding vector(3072),
    match_threshold FLOAT DEFAULT 0.45,
    match_count INTEGER DEFAULT 3
)
RETURNS TABLE (
    id INTEGER,
    volume INTEGER,
    chapter TEXT,
    title TEXT,
    content TEXT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        kc.id,
        kc.volume,
        kc.chapter,
        kc.title,
        kc.content,
        1 - (kc.embedding <=> query_embedding) AS similarity
    FROM knowledge_chunks kc
    WHERE 1 - (kc.embedding <=> query_embedding) > match_threshold
    ORDER BY kc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════
-- DONE
-- Per applicare: copia questo SQL nella Supabase SQL Editor
-- e premi "Run". Tutte le tabelle vengono create con RLS.
-- ═══════════════════════════════════════════════════════════
