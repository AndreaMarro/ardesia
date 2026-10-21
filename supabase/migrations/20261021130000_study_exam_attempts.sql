-- Schema8: immutable exam attempts keep the question snapshot used for grading.
-- Canonical order is v6 -> v7 (publication approvals) -> v8 (exam attempts).
-- This migration is idempotent for the historical v7 lineage that already
-- created study_exam_attempts at 20261021120000. It never recreates or alters
-- an existing table: it validates the canonical shape, then installs the
-- missing guards/policies and advances the marker.
DO $$ BEGIN
 IF (SELECT count(*) FROM public.study_schema)!=1 THEN
  RAISE EXCEPTION 'single schema marker required before exam migration';
 END IF;
 IF (SELECT version FROM public.study_schema) NOT IN (7,8) THEN
  RAISE EXCEPTION 'schema7 or schema8 required before exam migration';
 END IF;
 IF to_regclass('public.study_question_bank_approvals') IS NULL THEN
  RAISE EXCEPTION 'approval tables required before exam migration';
 END IF;
END $$;

-- A fresh database gets the table here. A legacy v7 already has it: the IF NOT
-- EXISTS keeps the historical rows and the validation below rejects drift.
CREATE TABLE IF NOT EXISTS public.study_exam_attempts(
 id TEXT PRIMARY KEY,
 edition_id TEXT NOT NULL REFERENCES public.study_editions(id) ON DELETE CASCADE,
 student_id TEXT NOT NULL REFERENCES public.study_principals(id) ON DELETE CASCADE,
 pack_id TEXT NOT NULL,
 pack_version INTEGER NOT NULL CHECK(pack_version>=1),
 pack_sha256 TEXT NOT NULL CHECK(length(pack_sha256)=64),
 question_order TEXT NOT NULL,
 answers TEXT NOT NULL DEFAULT '{}',
 status TEXT NOT NULL CHECK(status IN ('in_progress','submitted','expired')),
 started_at DOUBLE PRECISION NOT NULL,
 deadline_at DOUBLE PRECISION NOT NULL,
 submitted_at DOUBLE PRECISION,
 score_tenths INTEGER,
 receipt_id TEXT,
 result TEXT,
 pack_snapshot TEXT NOT NULL
);

DO $$ DECLARE actual TEXT[]; expected TEXT[] := ARRAY[
 'id','edition_id','student_id','pack_id','pack_version','pack_sha256',
 'question_order','answers','status','started_at','deadline_at',
 'submitted_at','score_tenths','receipt_id','result','pack_snapshot'];
BEGIN
 SELECT array_agg(column_name::text ORDER BY column_name) INTO actual
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='study_exam_attempts';
 IF actual IS DISTINCT FROM (SELECT array_agg(c ORDER BY c) FROM unnest(expected) c) THEN
  RAISE EXCEPTION 'study_exam_attempts shape mismatch: %', actual;
 END IF;
END $$;

CREATE INDEX IF NOT EXISTS study_exam_attempts_student
 ON public.study_exam_attempts(student_id,edition_id,started_at DESC);
CREATE INDEX IF NOT EXISTS study_exam_attempts_open
 ON public.study_exam_attempts(status,deadline_at);

ALTER TABLE public.study_exam_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.study_exam_attempts FROM PUBLIC,anon,authenticated,ardesia_app;
GRANT SELECT,INSERT,UPDATE ON public.study_exam_attempts TO ardesia_app;
DROP POLICY IF EXISTS exam_attempt_owner ON public.study_exam_attempts;
CREATE POLICY exam_attempt_owner ON public.study_exam_attempts FOR SELECT TO ardesia_app
 USING(student_id=(SELECT ardesia_private.actor_id()));
DROP POLICY IF EXISTS exam_attempt_insert ON public.study_exam_attempts;
CREATE POLICY exam_attempt_insert ON public.study_exam_attempts FOR INSERT TO ardesia_app
 WITH CHECK(student_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.enrolled(edition_id,student_id));
DROP POLICY IF EXISTS exam_attempt_update ON public.study_exam_attempts;
CREATE POLICY exam_attempt_update ON public.study_exam_attempts FOR UPDATE TO ardesia_app
 USING(student_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.enrolled(edition_id,student_id))
 WITH CHECK(student_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.enrolled(edition_id,student_id));

-- The application enforces the state machine; PostgreSQL enforces the part
-- that must survive a buggy request: identity is immutable, a closed attempt
-- is immutable, and answers cannot be written after submission.
CREATE OR REPLACE FUNCTION ardesia_private.study_exam_attempt_guard() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'exam_attempts_are_not_deletable'; END IF;
 IF OLD.id IS DISTINCT FROM NEW.id OR OLD.edition_id IS DISTINCT FROM NEW.edition_id
   OR OLD.student_id IS DISTINCT FROM NEW.student_id OR OLD.pack_id IS DISTINCT FROM NEW.pack_id
   OR OLD.pack_version IS DISTINCT FROM NEW.pack_version
   OR OLD.pack_sha256 IS DISTINCT FROM NEW.pack_sha256
   OR OLD.question_order IS DISTINCT FROM NEW.question_order
   OR OLD.pack_snapshot IS DISTINCT FROM NEW.pack_snapshot
   OR OLD.started_at IS DISTINCT FROM NEW.started_at
   OR OLD.deadline_at IS DISTINCT FROM NEW.deadline_at THEN
  RAISE EXCEPTION 'exam_attempt_identity_is_immutable';
 END IF;
 IF OLD.status <> 'in_progress' THEN
  RAISE EXCEPTION 'closed_exam_attempt_is_immutable';
 END IF;
 IF NEW.status NOT IN ('in_progress','submitted','expired') THEN
  RAISE EXCEPTION 'invalid_exam_attempt_status';
 END IF;
 IF NEW.status='in_progress' THEN
  IF NEW.submitted_at IS NOT NULL OR NEW.score_tenths IS NOT NULL
    OR NEW.receipt_id IS NOT NULL OR NEW.result IS NOT NULL THEN
   RAISE EXCEPTION 'open_exam_attempt_has_result';
  END IF;
 ELSE
  IF NEW.submitted_at IS NULL OR NEW.score_tenths IS NULL
    OR NEW.receipt_id IS NULL OR NEW.result IS NULL THEN
   RAISE EXCEPTION 'closed_exam_attempt_missing_result';
  END IF;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS study_exam_attempt_guard ON public.study_exam_attempts;
CREATE TRIGGER study_exam_attempt_guard BEFORE UPDATE OR DELETE
 ON public.study_exam_attempts FOR EACH ROW
 EXECUTE FUNCTION ardesia_private.study_exam_attempt_guard();
GRANT EXECUTE ON FUNCTION ardesia_private.study_exam_attempt_guard() TO ardesia_app;

UPDATE public.study_schema SET version=8 WHERE version=7;
NOTIFY pgrst,'reload schema';
