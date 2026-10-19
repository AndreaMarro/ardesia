CREATE TABLE IF NOT EXISTS study_schema(version INTEGER NOT NULL);
INSERT INTO study_schema SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM study_schema);
CREATE TABLE IF NOT EXISTS study_principals(
 id TEXT PRIMARY KEY, role TEXT NOT NULL CHECK(role IN ('teacher','student'))
);
CREATE TABLE IF NOT EXISTS study_sessions(
 token_hash TEXT PRIMARY KEY, actor_id TEXT NOT NULL REFERENCES study_principals(id), expires_at REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS study_invitations(
 id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, actor_id TEXT NOT NULL REFERENCES study_principals(id),
 edition_id TEXT NOT NULL REFERENCES study_editions(id), expires_at REAL NOT NULL,
 state TEXT NOT NULL CHECK(state IN ('pending','used','revoked'))
);
CREATE TABLE IF NOT EXISTS study_rate_limits(
 bucket TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires_at REAL NOT NULL
);
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
 text TEXT NOT NULL, sha256 TEXT NOT NULL, created_at REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS study_events(
 seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, actor_id TEXT NOT NULL REFERENCES study_principals(id),
 kind TEXT NOT NULL, resource_id TEXT, payload TEXT NOT NULL, created_at REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS study_receipts(
 id TEXT PRIMARY KEY, actor_id TEXT NOT NULL REFERENCES study_principals(id), operation TEXT NOT NULL,
 request_key TEXT NOT NULL, payload_hash TEXT NOT NULL, body TEXT NOT NULL,
 UNIQUE(actor_id,operation,request_key)
);
CREATE TABLE IF NOT EXISTS study_interests(
 id TEXT PRIMARY KEY, edition_id TEXT NOT NULL REFERENCES study_editions(id), contact TEXT NOT NULL, topic TEXT NOT NULL, slots TEXT NOT NULL,
 request_key TEXT NOT NULL UNIQUE, payload_hash TEXT NOT NULL, receipt TEXT NOT NULL, created_at REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS study_holds(
 id TEXT PRIMARY KEY, edition_id TEXT NOT NULL REFERENCES study_editions(id), student_id TEXT NOT NULL REFERENCES students(student_id),
 expires_at REAL NOT NULL, state TEXT NOT NULL CHECK(state IN ('hold','confirmed','payment_requires_review','cancelled'))
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
 created_at REAL NOT NULL, state TEXT NOT NULL DEFAULT 'received'
);
CREATE TABLE IF NOT EXISTS study_feedback(
 id TEXT PRIMARY KEY, submission_id TEXT NOT NULL UNIQUE REFERENCES study_submissions(id),
 submission_revision INTEGER NOT NULL, author_type TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'proposed',
 text TEXT NOT NULL, source_refs TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS study_reviews(
 id TEXT PRIMARY KEY, candidate_id TEXT NOT NULL UNIQUE REFERENCES study_feedback(id),
 teacher_id TEXT NOT NULL REFERENCES teachers(teacher_id), decision TEXT NOT NULL, text TEXT NOT NULL, created_at REAL NOT NULL
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
