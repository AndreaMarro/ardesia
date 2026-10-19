CREATE TABLE IF NOT EXISTS study_schema(version INTEGER NOT NULL);
INSERT INTO study_schema SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM study_schema);
CREATE TABLE IF NOT EXISTS study_principals(
 id TEXT PRIMARY KEY, role TEXT NOT NULL CHECK(role IN ('teacher','student'))
);
CREATE TABLE IF NOT EXISTS study_sessions(
 token_hash TEXT PRIMARY KEY, actor_id TEXT NOT NULL REFERENCES study_principals(id), expires_at REAL NOT NULL
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
