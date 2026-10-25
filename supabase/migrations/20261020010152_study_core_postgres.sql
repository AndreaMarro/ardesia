-- PostgreSQL persistence for the existing canonical Study + LessonOS tables.
-- Generated once from canonical SQLite schema; reviewed and applied explicitly.

CREATE TABLE IF NOT EXISTS paths (
    path_id    TEXT PRIMARY KEY,
    title      TEXT NOT NULL,
    subject    TEXT NOT NULL,
    lesson_ids TEXT NOT NULL DEFAULT '[]',
    source_ids TEXT NOT NULL DEFAULT '[]',
    synthetic  INTEGER NOT NULL DEFAULT 0,
    teacher_id TEXT
);
CREATE TABLE IF NOT EXISTS lessons (
    lesson_id TEXT PRIMARY KEY,
    path_id   TEXT NOT NULL,
    title     TEXT NOT NULL,
    "order"   INTEGER NOT NULL,
    source_id TEXT
);
CREATE TABLE IF NOT EXISTS sources (
    source_id TEXT PRIMARY KEY,
    title     TEXT NOT NULL,
    kind      TEXT NOT NULL DEFAULT 'text'
);
CREATE TABLE IF NOT EXISTS segments (
    seg_id    TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    start     INTEGER NOT NULL,
    "end"     INTEGER NOT NULL,
    text      TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS moments (
    moment_id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    t         INTEGER NOT NULL,
    kind      TEXT NOT NULL,
    seg_id    TEXT
);
CREATE TABLE IF NOT EXISTS capsules (
    lesson_id    TEXT PRIMARY KEY,
    capsule_data TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text)
);
CREATE TABLE IF NOT EXISTS cost_ledger (
    entry_id         TEXT PRIMARY KEY,
    lesson_id        TEXT,
    model            TEXT NOT NULL,
    provider         TEXT NOT NULL,
    prompt_tokens    INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    cost_usd         DOUBLE PRECISION NOT NULL,
    label            TEXT NOT NULL DEFAULT '',
    created_at       TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text)
);
CREATE TABLE IF NOT EXISTS nodes (
    node_id    TEXT PRIMARY KEY,
    lesson_id  TEXT NOT NULL,
    node_type  TEXT NOT NULL,
    ref_id     TEXT NOT NULL,
    label      TEXT
);
CREATE TABLE IF NOT EXISTS edges (
    edge_id    TEXT PRIMARY KEY,
    lesson_id  TEXT NOT NULL,
    source     TEXT NOT NULL,
    target     TEXT NOT NULL,
    edge_type  TEXT NOT NULL,
    metadata   TEXT NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS evidence (
    evidence_id TEXT PRIMARY KEY,
    edge_id     TEXT NOT NULL,
    seg_id      TEXT NOT NULL,
    excerpt     TEXT,
    confidence  DOUBLE PRECISION,
    lesson_id   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_paths_teacher ON paths(teacher_id);
-- CRM-primitives (v9): anonymised teacher/class/student roster. By design the
-- teachers/students tables hold ONLY an opaque pseudonym PK — there is no
-- personal column to leak (GDPR by construction; PII vault is external).
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id TEXT PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS classes (
    class_id   TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL,
    subject    TEXT
);
CREATE TABLE IF NOT EXISTS students (
    student_id TEXT PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id TEXT PRIMARY KEY,
    class_id      TEXT NOT NULL,
    student_id    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
-- consent-state (v10): append-only audit trail of GDPR consent grant/revoke
-- for a teacher↔class relationship. Like the rest of the CRM layer it holds
-- ONLY opaque pseudonyms + timestamps + the action — no personal column to
-- leak. Current state is DERIVED from these events (see lessonos.consent),
-- never stored, so the table is a tamper-evident history.
CREATE TABLE IF NOT EXISTS consent_events (
    event_id   TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL,
    class_id   TEXT NOT NULL,
    action     TEXT NOT NULL,
    at         TEXT NOT NULL,
    expires_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_consent_events_rel
    ON consent_events(teacher_id, class_id);

CREATE TABLE IF NOT EXISTS study_schema(version INTEGER NOT NULL);
INSERT INTO study_schema SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM study_schema);
UPDATE study_schema SET version=2 WHERE version=1;
CREATE TABLE IF NOT EXISTS study_principals(
 id TEXT PRIMARY KEY, role TEXT NOT NULL CHECK(role IN ('teacher','student'))
);
CREATE TABLE IF NOT EXISTS study_sessions(
 token_hash TEXT PRIMARY KEY, actor_id TEXT NOT NULL REFERENCES study_principals(id), expires_at DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS study_rate_limits(
 bucket TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires_at DOUBLE PRECISION NOT NULL
);
CREATE TABLE IF NOT EXISTS study_erased_actors(id TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS study_editions(
 id TEXT PRIMARY KEY REFERENCES classes(class_id), teacher_id TEXT NOT NULL REFERENCES teachers(teacher_id),
 capacity INTEGER NOT NULL CHECK(capacity BETWEEN 1 AND 10), price_minor INTEGER NOT NULL CHECK(price_minor>=0),
 state TEXT NOT NULL DEFAULT 'collecting', sessions TEXT NOT NULL DEFAULT '[]', timezone TEXT NOT NULL DEFAULT 'Europe/Rome'
);
CREATE TABLE IF NOT EXISTS study_members(
 edition_id TEXT NOT NULL REFERENCES study_editions(id), student_id TEXT NOT NULL REFERENCES students(student_id),
 PRIMARY KEY(edition_id,student_id)
);
CREATE TABLE IF NOT EXISTS study_resources(
 id TEXT PRIMARY KEY, edition_id TEXT NOT NULL REFERENCES study_editions(id),
 owner_id TEXT NOT NULL REFERENCES study_principals(id), kind TEXT NOT NULL, visibility TEXT NOT NULL CHECK(visibility IN ('private','group')),
 context_id TEXT NOT NULL, current_revision TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS study_revisions(
 id TEXT PRIMARY KEY, resource_id TEXT NOT NULL REFERENCES study_resources(id),
 text TEXT NOT NULL, sha256 TEXT NOT NULL, created_at DOUBLE PRECISION NOT NULL
);
CREATE TABLE IF NOT EXISTS study_events(
 seq BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, id TEXT NOT NULL UNIQUE, actor_id TEXT NOT NULL REFERENCES study_principals(id),
 kind TEXT NOT NULL, resource_id TEXT, payload TEXT NOT NULL, created_at DOUBLE PRECISION NOT NULL
);
CREATE TABLE IF NOT EXISTS study_receipts(
 id TEXT PRIMARY KEY, actor_id TEXT NOT NULL REFERENCES study_principals(id), operation TEXT NOT NULL,
 request_key TEXT NOT NULL, payload_hash TEXT NOT NULL, body TEXT NOT NULL,
 UNIQUE(actor_id,operation,request_key)
);
CREATE TABLE IF NOT EXISTS study_interests(
 id TEXT PRIMARY KEY, edition_id TEXT NOT NULL REFERENCES study_editions(id), contact TEXT NOT NULL, topic TEXT NOT NULL, slots TEXT NOT NULL,
 request_key TEXT NOT NULL UNIQUE, payload_hash TEXT NOT NULL, receipt TEXT NOT NULL, created_at DOUBLE PRECISION NOT NULL
);
CREATE TABLE IF NOT EXISTS study_holds(
 id TEXT PRIMARY KEY, edition_id TEXT NOT NULL REFERENCES study_editions(id), student_id TEXT NOT NULL REFERENCES students(student_id),
 expires_at DOUBLE PRECISION NOT NULL, state TEXT NOT NULL CHECK(state IN ('hold','confirmed','payment_requires_review','cancelled'))
);
CREATE TABLE IF NOT EXISTS study_waitlist(
 edition_id TEXT NOT NULL REFERENCES study_editions(id), student_id TEXT NOT NULL REFERENCES students(student_id),
 PRIMARY KEY(edition_id,student_id)
);
CREATE TABLE IF NOT EXISTS study_assets(
 id TEXT PRIMARY KEY, edition_id TEXT NOT NULL REFERENCES study_editions(id), owner_id TEXT NOT NULL REFERENCES study_principals(id),
 mime TEXT NOT NULL, bytes INTEGER NOT NULL, sha256 TEXT NOT NULL, blob_ref TEXT NOT NULL,
 native_text TEXT NOT NULL DEFAULT '', extraction_status TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS study_submissions(
 id TEXT PRIMARY KEY, edition_id TEXT NOT NULL REFERENCES study_editions(id), student_id TEXT NOT NULL REFERENCES students(student_id),
 activity_id TEXT NOT NULL, revision INTEGER NOT NULL, parent_id TEXT REFERENCES study_submissions(id),
 text TEXT NOT NULL, asset_refs TEXT NOT NULL, source_refs TEXT NOT NULL DEFAULT '[]', receipt_id TEXT NOT NULL UNIQUE,
 created_at DOUBLE PRECISION NOT NULL, state TEXT NOT NULL DEFAULT 'received'
);
CREATE TABLE IF NOT EXISTS study_feedback(
 id TEXT PRIMARY KEY, submission_id TEXT NOT NULL UNIQUE REFERENCES study_submissions(id),
 submission_revision INTEGER NOT NULL, author_type TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'proposed',
 text TEXT NOT NULL, source_refs TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS study_reviews(
 id TEXT PRIMARY KEY, candidate_id TEXT NOT NULL UNIQUE REFERENCES study_feedback(id),
 teacher_id TEXT NOT NULL REFERENCES teachers(teacher_id), decision TEXT NOT NULL, text TEXT NOT NULL, created_at DOUBLE PRECISION NOT NULL
);
CREATE TABLE IF NOT EXISTS study_observations(
 id TEXT PRIMARY KEY, review_id TEXT NOT NULL UNIQUE REFERENCES study_reviews(id),
 student_id TEXT NOT NULL REFERENCES students(student_id), context_id TEXT NOT NULL,
 submission_id TEXT NOT NULL REFERENCES study_submissions(id), text TEXT NOT NULL, source_refs TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS study_layouts(
 actor_id TEXT NOT NULL REFERENCES study_principals(id), edition_id TEXT NOT NULL REFERENCES study_editions(id),
 data TEXT NOT NULL, PRIMARY KEY(actor_id,edition_id)
);

CREATE TABLE IF NOT EXISTS study_invitations(
 id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, actor_id TEXT NOT NULL REFERENCES study_principals(id),
 edition_id TEXT NOT NULL REFERENCES study_editions(id), expires_at DOUBLE PRECISION NOT NULL,
 state TEXT NOT NULL CHECK(state IN ('pending','used','revoked'))
);
