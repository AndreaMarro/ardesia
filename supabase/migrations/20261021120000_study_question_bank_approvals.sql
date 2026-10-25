-- Schema7: default-deny publication of bundled banks.
-- Canonical order is v6 -> v7 (this migration) -> v8 (exam attempts).
-- The corpus stays immutable; approval is an external decision bound to the
-- exact question revision and the SHA-256 of its authored content. Revocation
-- is a durable state transition; the event trail is append-only.
-- Idempotent for retries and for the historical v7 exam-only lineage.
DO $$ BEGIN
 IF (SELECT count(*) FROM public.study_schema)!=1 THEN
  RAISE EXCEPTION 'single schema marker required before question bank approval migration';
 END IF;
 IF (SELECT version FROM public.study_schema)=6 THEN
  NULL;
 ELSIF (SELECT version FROM public.study_schema)=7 THEN
  IF to_regclass('public.study_question_bank_approvals') IS NULL
     AND to_regclass('public.study_exam_attempts') IS NULL THEN
   RAISE EXCEPTION 'schema7 marker has neither canonical nor legacy tables';
  END IF;
 ELSIF (SELECT version FROM public.study_schema)=8 THEN
  IF to_regclass('public.study_question_bank_approvals') IS NULL THEN
   RAISE EXCEPTION 'schema8 marker is missing approval tables';
  END IF;
 ELSE
  RAISE EXCEPTION 'schema6, schema7 or schema8 required before question bank approval migration';
 END IF;
END $$;
CREATE TABLE IF NOT EXISTS public.study_question_bank_approvals(
 id TEXT PRIMARY KEY,
 edition_id TEXT NOT NULL,
 bank_id TEXT NOT NULL CHECK(length(bank_id) BETWEEN 1 AND 128),
 question_id TEXT NOT NULL CHECK(length(question_id) BETWEEN 1 AND 128),
 question_version INTEGER NOT NULL CHECK(question_version>=1),
 content_sha256 TEXT NOT NULL CHECK(length(content_sha256)=64),
 bank_sha256 TEXT NOT NULL CHECK(length(bank_sha256)=64),
 scientific_status TEXT NOT NULL CHECK(scientific_status IN ('APPROVED','REJECTED')),
 editorial_status TEXT NOT NULL CHECK(editorial_status IN ('PUBLISHED','WITHHELD','REVOKED')),
 actor_id TEXT NOT NULL CHECK(length(actor_id) BETWEEN 1 AND 128),
 created_at DOUBLE PRECISION NOT NULL,
 motivation TEXT NOT NULL CHECK(length(motivation) BETWEEN 1 AND 2000),
 revoked_at DOUBLE PRECISION,
 revoked_by TEXT CHECK(revoked_by IS NULL OR length(revoked_by) BETWEEN 1 AND 128),
 revocation_reason TEXT CHECK(revocation_reason IS NULL OR length(revocation_reason)<=2000),
 supersedes_id TEXT REFERENCES public.study_question_bank_approvals(id),
 CHECK((scientific_status='APPROVED' AND editorial_status IN ('PUBLISHED','REVOKED'))
    OR (scientific_status='REJECTED' AND editorial_status='WITHHELD')),
 CHECK((editorial_status='REVOKED')=(revoked_at IS NOT NULL AND revoked_by IS NOT NULL)),
 CHECK((editorial_status='REVOKED') OR (revocation_reason IS NULL))
);
CREATE TABLE IF NOT EXISTS public.study_question_bank_approval_events(
 id TEXT PRIMARY KEY,
 approval_id TEXT NOT NULL REFERENCES public.study_question_bank_approvals(id),
 edition_id TEXT NOT NULL,
 bank_id TEXT NOT NULL,
 question_id TEXT NOT NULL,
 question_version INTEGER NOT NULL,
 content_sha256 TEXT NOT NULL CHECK(length(content_sha256)=64),
 event TEXT NOT NULL CHECK(event IN ('APPROVED','REJECTED','REVOKED')),
 actor_id TEXT NOT NULL CHECK(length(actor_id) BETWEEN 1 AND 128),
 created_at DOUBLE PRECISION NOT NULL,
 motivation TEXT NOT NULL CHECK(length(motivation) BETWEEN 1 AND 2000),
 payload TEXT NOT NULL
);

DO $$ DECLARE actual TEXT[]; expected TEXT[];
BEGIN
 expected := ARRAY['id','edition_id','bank_id','question_id','question_version',
  'content_sha256','bank_sha256','scientific_status','editorial_status','actor_id',
  'created_at','motivation','revoked_at','revoked_by','revocation_reason','supersedes_id'];
 SELECT array_agg(column_name::text ORDER BY column_name) INTO actual
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='study_question_bank_approvals';
 IF actual IS DISTINCT FROM (SELECT array_agg(c ORDER BY c) FROM unnest(expected) c) THEN
  RAISE EXCEPTION 'study_question_bank_approvals shape mismatch: %', actual;
 END IF;
 expected := ARRAY['id','approval_id','edition_id','bank_id','question_id',
  'question_version','content_sha256','event','actor_id','created_at','motivation','payload'];
 SELECT array_agg(column_name::text ORDER BY column_name) INTO actual
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='study_question_bank_approval_events';
 IF actual IS DISTINCT FROM (SELECT array_agg(c ORDER BY c) FROM unnest(expected) c) THEN
  RAISE EXCEPTION 'study_question_bank_approval_events shape mismatch: %', actual;
 END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS study_bank_approval_active
 ON public.study_question_bank_approvals(edition_id,bank_id,question_id,question_version,content_sha256)
 WHERE scientific_status='APPROVED' AND editorial_status='PUBLISHED';
CREATE INDEX IF NOT EXISTS study_bank_approval_serving
 ON public.study_question_bank_approvals(edition_id,bank_id,scientific_status,editorial_status);
CREATE INDEX IF NOT EXISTS study_bank_approval_question
 ON public.study_question_bank_approvals(edition_id,bank_id,question_id,created_at DESC);
CREATE INDEX IF NOT EXISTS study_bank_approval_event_trail
 ON public.study_question_bank_approval_events(edition_id,bank_id,question_id,created_at);

CREATE OR REPLACE FUNCTION ardesia_private.study_bank_approval_guard() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'approval_rows_are_not_deletable'; END IF;
 IF OLD.id IS DISTINCT FROM NEW.id OR OLD.edition_id IS DISTINCT FROM NEW.edition_id
   OR OLD.bank_id IS DISTINCT FROM NEW.bank_id OR OLD.question_id IS DISTINCT FROM NEW.question_id
   OR OLD.question_version IS DISTINCT FROM NEW.question_version
   OR OLD.content_sha256 IS DISTINCT FROM NEW.content_sha256
   OR OLD.bank_sha256 IS DISTINCT FROM NEW.bank_sha256
   OR OLD.scientific_status IS DISTINCT FROM NEW.scientific_status
   OR OLD.actor_id IS DISTINCT FROM NEW.actor_id
   OR OLD.created_at IS DISTINCT FROM NEW.created_at
   OR OLD.motivation IS DISTINCT FROM NEW.motivation
   OR OLD.supersedes_id IS DISTINCT FROM NEW.supersedes_id THEN
  RAISE EXCEPTION 'approval_identity_is_immutable';
 END IF;
 IF NOT (OLD.editorial_status='PUBLISHED' AND NEW.editorial_status='REVOKED') THEN
  RAISE EXCEPTION 'approval_update_is_not_a_revocation';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS study_bank_approval_immutable ON public.study_question_bank_approvals;
CREATE TRIGGER study_bank_approval_immutable BEFORE UPDATE OR DELETE
 ON public.study_question_bank_approvals FOR EACH ROW
 EXECUTE FUNCTION ardesia_private.study_bank_approval_guard();

CREATE OR REPLACE FUNCTION ardesia_private.study_bank_approval_event_guard() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN
 IF TG_OP='INSERT' THEN
  IF NOT EXISTS(SELECT 1 FROM public.study_question_bank_approvals a
   WHERE a.id=NEW.approval_id AND a.edition_id=NEW.edition_id
     AND a.bank_id=NEW.bank_id AND a.question_id=NEW.question_id
     AND a.question_version=NEW.question_version
     AND a.content_sha256=NEW.content_sha256) THEN
   RAISE EXCEPTION 'approval_event_identity_mismatch';
  END IF;
  RETURN NEW;
 END IF;
 RAISE EXCEPTION 'approval_events_are_append_only';
END $$;
DROP TRIGGER IF EXISTS study_bank_approval_event_append_only ON public.study_question_bank_approval_events;
CREATE TRIGGER study_bank_approval_event_append_only BEFORE INSERT OR UPDATE OR DELETE
 ON public.study_question_bank_approval_events FOR EACH ROW
 EXECUTE FUNCTION ardesia_private.study_bank_approval_event_guard();
GRANT EXECUTE ON FUNCTION ardesia_private.study_bank_approval_guard(),
 ardesia_private.study_bank_approval_event_guard() TO ardesia_app;

ALTER TABLE public.study_question_bank_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_question_bank_approval_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.study_question_bank_approvals,public.study_question_bank_approval_events
 FROM PUBLIC,anon,authenticated,ardesia_app;
GRANT SELECT,INSERT,UPDATE ON public.study_question_bank_approvals TO ardesia_app;
GRANT SELECT,INSERT ON public.study_question_bank_approval_events TO ardesia_app;
DROP POLICY IF EXISTS approval_read ON public.study_question_bank_approvals;
CREATE POLICY approval_read ON public.study_question_bank_approvals FOR SELECT TO ardesia_app
 USING(ardesia_private.can_enter(edition_id));
DROP POLICY IF EXISTS approval_insert ON public.study_question_bank_approvals;
CREATE POLICY approval_insert ON public.study_question_bank_approvals FOR INSERT TO ardesia_app
 WITH CHECK(actor_id=(SELECT ardesia_private.actor_id())
  AND EXISTS(SELECT 1 FROM public.study_editions e WHERE e.id=edition_id
   AND e.teacher_id=(SELECT ardesia_private.actor_id())));
DROP POLICY IF EXISTS approval_revoke ON public.study_question_bank_approvals;
CREATE POLICY approval_revoke ON public.study_question_bank_approvals FOR UPDATE TO ardesia_app
 USING(EXISTS(SELECT 1 FROM public.study_editions e WHERE e.id=edition_id
   AND e.teacher_id=(SELECT ardesia_private.actor_id())))
 WITH CHECK(editorial_status='REVOKED' AND revoked_by=(SELECT ardesia_private.actor_id())
  AND EXISTS(SELECT 1 FROM public.study_editions e WHERE e.id=edition_id
   AND e.teacher_id=(SELECT ardesia_private.actor_id())));
DROP POLICY IF EXISTS approval_event_read ON public.study_question_bank_approval_events;
CREATE POLICY approval_event_read ON public.study_question_bank_approval_events FOR SELECT TO ardesia_app
 USING(ardesia_private.can_enter(edition_id));
DROP POLICY IF EXISTS approval_event_insert ON public.study_question_bank_approval_events;
CREATE POLICY approval_event_insert ON public.study_question_bank_approval_events FOR INSERT TO ardesia_app
 WITH CHECK(EXISTS(SELECT 1 FROM public.study_editions e WHERE e.id=edition_id
   AND e.teacher_id=(SELECT ardesia_private.actor_id())));
UPDATE public.study_schema SET version=7 WHERE version=6;
NOTIFY pgrst,'reload schema';
