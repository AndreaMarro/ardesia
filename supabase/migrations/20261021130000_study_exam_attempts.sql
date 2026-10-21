-- Schema8: immutable exam attempts keep the question snapshot used for grading.
-- Canonical order is v6 -> v7 (publication approvals) -> v8 (exam attempts).
DO $$ BEGIN
 IF (SELECT count(*) FROM public.study_schema)!=1 THEN
  RAISE EXCEPTION 'single schema marker required before exam migration';
 END IF;
 IF (SELECT version FROM public.study_schema)!=7 THEN
  RAISE EXCEPTION 'schema7 required before exam migration';
 END IF;
END $$;
CREATE TABLE public.study_exam_attempts(
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
CREATE INDEX study_exam_attempts_student ON public.study_exam_attempts(student_id,edition_id,started_at DESC);
CREATE INDEX study_exam_attempts_open ON public.study_exam_attempts(status,deadline_at);
ALTER TABLE public.study_exam_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.study_exam_attempts FROM PUBLIC,anon,authenticated,ardesia_app;
GRANT SELECT,INSERT,UPDATE ON public.study_exam_attempts TO ardesia_app;
CREATE POLICY exam_attempt_owner ON public.study_exam_attempts FOR SELECT TO ardesia_app
 USING(student_id=(SELECT ardesia_private.actor_id()));
CREATE POLICY exam_attempt_insert ON public.study_exam_attempts FOR INSERT TO ardesia_app
 WITH CHECK(student_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.enrolled(edition_id,student_id));
CREATE POLICY exam_attempt_update ON public.study_exam_attempts FOR UPDATE TO ardesia_app
 USING(student_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.enrolled(edition_id,student_id))
 WITH CHECK(student_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.enrolled(edition_id,student_id));
UPDATE public.study_schema SET version=8 WHERE version=7;
NOTIFY pgrst,'reload schema';
