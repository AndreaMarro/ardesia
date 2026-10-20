CREATE TABLE IF NOT EXISTS study_schema(version INTEGER NOT NULL);
INSERT INTO study_schema SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM study_schema);
UPDATE study_schema SET version=2 WHERE version=1;
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
CREATE TABLE IF NOT EXISTS study_erased_actors(id TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS study_editions(
 id TEXT PRIMARY KEY REFERENCES classes(class_id), teacher_id TEXT NOT NULL REFERENCES teachers(teacher_id),
 capacity INTEGER NOT NULL CHECK(capacity BETWEEN 1 AND 10), price_minor INTEGER NOT NULL CHECK(price_minor>=0),
 management_revision INTEGER NOT NULL DEFAULT 0 CHECK(management_revision>=0),
 state TEXT NOT NULL DEFAULT 'draft', sessions TEXT NOT NULL DEFAULT '[]', timezone TEXT NOT NULL DEFAULT 'Europe/Rome'
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
 expires_at REAL NOT NULL, state TEXT NOT NULL CHECK(state IN ('hold','confirmed','payment_requires_review','cancelled')),
 offer_revision INTEGER CHECK(offer_revision>=0)
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
CREATE INDEX IF NOT EXISTS study_event_student ON study_events(json_extract(payload,'$.studentId'),seq);
CREATE INDEX IF NOT EXISTS study_event_thread ON study_events(json_extract(payload,'$.threadId'),seq);
CREATE INDEX IF NOT EXISTS study_event_edition ON study_events(json_extract(payload,'$.thread.editionId'),seq);
CREATE TABLE IF NOT EXISTS study_upload_intents(
 id TEXT PRIMARY KEY, edition_id TEXT NOT NULL REFERENCES study_editions(id),
 owner_id TEXT NOT NULL REFERENCES study_principals(id),
 state TEXT NOT NULL CHECK(state IN ('pending','committed','cleanup_required')),
 expires_at REAL NOT NULL, created_at REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS study_upload_recovery ON study_upload_intents(state,expires_at,created_at);
CREATE TABLE IF NOT EXISTS study_upload_requests(
 actor_id TEXT NOT NULL REFERENCES study_principals(id), request_key TEXT NOT NULL,
 payload_hash TEXT NOT NULL, asset_id TEXT NOT NULL UNIQUE REFERENCES study_upload_intents(id) ON DELETE CASCADE,
 PRIMARY KEY(actor_id,request_key)
);

CREATE TABLE IF NOT EXISTS study_edition_packs(
 edition_id TEXT PRIMARY KEY REFERENCES study_editions(id) ON DELETE CASCADE,
 course_id TEXT NOT NULL, pack_id TEXT NOT NULL, pack_version INTEGER NOT NULL CHECK(pack_version>0),
 pack_sha256 TEXT NOT NULL CHECK(length(pack_sha256)=64 AND pack_sha256 NOT GLOB '*[^0-9a-f]*')
);
CREATE TABLE IF NOT EXISTS study_calendar_targets(
 id TEXT PRIMARY KEY, edition_id TEXT NOT NULL REFERENCES study_editions(id) ON DELETE CASCADE,
 actor_id TEXT NOT NULL REFERENCES study_principals(id), provider TEXT NOT NULL CHECK(provider IN ('mock','ics')),
 account_id TEXT NOT NULL, calendar_id TEXT NOT NULL CHECK(calendar_id='primary'),
 source_version TEXT, sequence INTEGER NOT NULL DEFAULT 0 CHECK(sequence>=0), sync_cursor TEXT,
 sync_version INTEGER NOT NULL DEFAULT 0 CHECK(sync_version>=0),
 channel_id TEXT, channel_token TEXT, channel_resource TEXT, channel_expires REAL,
 UNIQUE(edition_id,actor_id,provider,account_id,calendar_id), CHECK(account_id=actor_id)
);
CREATE TABLE IF NOT EXISTS study_calendar_intents(
 id TEXT PRIMARY KEY, target_id TEXT NOT NULL REFERENCES study_calendar_targets(id) ON DELETE CASCADE,
 actor_id TEXT NOT NULL REFERENCES study_principals(id), edition_id TEXT NOT NULL REFERENCES study_editions(id),
 source_version TEXT NOT NULL CHECK(length(source_version)=64), preview_hash TEXT NOT NULL CHECK(length(preview_hash)=64),
 body TEXT NOT NULL, created_at REAL NOT NULL, expires_at REAL NOT NULL CHECK(expires_at>created_at),
 state TEXT NOT NULL DEFAULT 'preview' CHECK(state IN ('preview','publishing','published')),
 confirm_key TEXT, consumed_at REAL, UNIQUE(actor_id,confirm_key)
);
CREATE INDEX IF NOT EXISTS study_calendar_intent_scope ON study_calendar_intents(actor_id,edition_id,target_id);
CREATE TABLE IF NOT EXISTS study_calendar_mappings(
 target_id TEXT NOT NULL REFERENCES study_calendar_targets(id) ON DELETE CASCADE,
 session_id TEXT NOT NULL, event_id TEXT NOT NULL, source_version TEXT, etag TEXT, applied_body TEXT,
 PRIMARY KEY(target_id,session_id), UNIQUE(target_id,event_id)
);
CREATE TABLE IF NOT EXISTS study_calendar_cache(
 target_id TEXT NOT NULL REFERENCES study_calendar_targets(id) ON DELETE CASCADE,
 event_id TEXT NOT NULL, start_utc TEXT, end_utc TEXT, etag TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('confirmed','tentative','cancelled')),
 PRIMARY KEY(target_id,event_id)
);
CREATE TABLE IF NOT EXISTS study_calendar_deliveries(
 target_id TEXT NOT NULL REFERENCES study_calendar_targets(id) ON DELETE CASCADE,
 channel_id TEXT NOT NULL, delivery_id TEXT NOT NULL, created_at REAL NOT NULL,
 PRIMARY KEY(target_id,channel_id,delivery_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS study_calendar_active_publish ON study_calendar_intents(target_id) WHERE state='publishing';

UPDATE study_schema SET version=3 WHERE version=2;

UPDATE study_schema SET version=4 WHERE version=3;

CREATE INDEX IF NOT EXISTS study_editions_teacher_id ON study_editions(teacher_id,id);
CREATE INDEX IF NOT EXISTS study_members_student_id ON study_members(student_id,edition_id);
CREATE INDEX IF NOT EXISTS study_holds_edition_state_expiry ON study_holds(edition_id,state,expires_at);

CREATE TABLE IF NOT EXISTS study_attendance_records(
 id TEXT PRIMARY KEY, edition_id TEXT NOT NULL REFERENCES study_editions(id),
 session_id TEXT NOT NULL, student_id TEXT NOT NULL REFERENCES students(student_id),
 revision INTEGER NOT NULL CHECK(revision BETWEEN 1 AND 9007199254740991),
 supersedes_record_id TEXT, previous_revision INTEGER NOT NULL CHECK(previous_revision=revision-1),
 status TEXT NOT NULL CHECK(status IN ('PRESENT','ABSENT','UNRECORDED')),
 recorded_by TEXT NOT NULL REFERENCES teachers(teacher_id), recorded_at REAL NOT NULL,
 reason TEXT NOT NULL CHECK(length(reason)<=1000), management_revision INTEGER NOT NULL CHECK(management_revision>=0),
 session_snapshot TEXT NOT NULL,
 receipt_id TEXT NOT NULL UNIQUE REFERENCES study_receipts(id) DEFERRABLE INITIALLY DEFERRED,
 CHECK((revision=1 AND supersedes_record_id IS NULL) OR (revision>1 AND supersedes_record_id IS NOT NULL AND length(trim(reason))>0)),
 UNIQUE(edition_id,session_id,student_id,revision),
 UNIQUE(id,edition_id,session_id,student_id,revision),
 FOREIGN KEY(supersedes_record_id,edition_id,session_id,student_id,previous_revision)
  REFERENCES study_attendance_records(id,edition_id,session_id,student_id,revision)
);
CREATE INDEX IF NOT EXISTS study_attendance_cell ON study_attendance_records(edition_id,session_id,student_id,revision DESC);
CREATE INDEX IF NOT EXISTS study_attendance_student ON study_attendance_records(student_id);
CREATE TABLE IF NOT EXISTS study_manual_payment_records(
 id TEXT PRIMARY KEY, entry_id TEXT NOT NULL, edition_id TEXT NOT NULL REFERENCES study_editions(id),
 student_id TEXT NOT NULL REFERENCES students(student_id), revision INTEGER NOT NULL CHECK(revision BETWEEN 1 AND 9007199254740991),
 supersedes_record_id TEXT, previous_revision INTEGER NOT NULL CHECK(previous_revision=revision-1),
 status TEXT NOT NULL CHECK(status IN ('RECORDED_MANUALLY','VOIDED')),
 amount_minor INTEGER NOT NULL CHECK(amount_minor BETWEEN 1 AND 1000000), currency TEXT NOT NULL CHECK(currency='EUR'),
 external_reference TEXT NOT NULL CHECK(length(external_reference) BETWEEN 1 AND 128),
 external_reference_key TEXT NOT NULL CHECK(length(external_reference_key) BETWEEN 1 AND 128),
 recorded_by TEXT NOT NULL REFERENCES teachers(teacher_id), recorded_at REAL NOT NULL,
 reason TEXT NOT NULL CHECK(length(reason)<=1000), offer_snapshot TEXT NOT NULL,
 receipt_id TEXT NOT NULL UNIQUE REFERENCES study_receipts(id) DEFERRABLE INITIALLY DEFERRED,
 CHECK((revision=1 AND supersedes_record_id IS NULL AND entry_id=id) OR (revision>1 AND supersedes_record_id IS NOT NULL AND length(trim(reason))>0)),
 UNIQUE(entry_id,revision), UNIQUE(id,entry_id,edition_id,student_id,revision),
 FOREIGN KEY(supersedes_record_id,entry_id,edition_id,student_id,previous_revision)
  REFERENCES study_manual_payment_records(id,entry_id,edition_id,student_id,revision)
);
CREATE UNIQUE INDEX IF NOT EXISTS study_manual_reference ON study_manual_payment_records(recorded_by,external_reference_key) WHERE revision=1;
CREATE INDEX IF NOT EXISTS study_manual_edition_entry ON study_manual_payment_records(edition_id,entry_id,revision DESC);
CREATE INDEX IF NOT EXISTS study_manual_student ON study_manual_payment_records(student_id);

UPDATE study_schema SET version=5 WHERE version=4;

CREATE INDEX IF NOT EXISTS study_interests_edition ON study_interests(edition_id);

CREATE TABLE IF NOT EXISTS study_notebook_bindings(
 resource_id TEXT PRIMARY KEY REFERENCES study_resources(id) ON DELETE CASCADE,
 asset_id TEXT NOT NULL REFERENCES study_assets(id),
 asset_sha256 TEXT NOT NULL CHECK(length(asset_sha256)=64),
 page_count INTEGER NOT NULL CHECK(page_count BETWEEN 1 AND 20)
);
CREATE TABLE IF NOT EXISTS study_notebook_snapshots(
 revision_id TEXT PRIMARY KEY REFERENCES study_revisions(id) ON DELETE CASCADE,
 state TEXT NOT NULL, sha256 TEXT NOT NULL CHECK(length(sha256)=64)
);
UPDATE study_schema SET version=6 WHERE version=5;
