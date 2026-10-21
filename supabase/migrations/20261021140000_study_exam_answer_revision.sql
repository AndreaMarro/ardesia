-- Schema9: monotonic answer revision for compare-and-swap autosave.
-- The v8 table shape stays valid for upgrades; the application only accepts
-- CAS writes when this additive column exists.
DO $$ BEGIN
 IF (SELECT count(*) FROM public.study_schema)!=1 THEN
  RAISE EXCEPTION 'single schema marker required before answer-revision migration';
 END IF;
 IF (SELECT version FROM public.study_schema) NOT IN (8,9) THEN
  RAISE EXCEPTION 'schema8 or schema9 required before answer-revision migration';
 END IF;
 IF to_regclass('public.study_exam_attempts') IS NULL THEN
  RAISE EXCEPTION 'exam table required before answer-revision migration';
 END IF;
END $$;

ALTER TABLE public.study_exam_attempts
 ADD COLUMN IF NOT EXISTS answer_revision INTEGER NOT NULL DEFAULT 0
 CHECK(answer_revision>=0);

DO $$ DECLARE actual TEXT[]; expected TEXT[] := ARRAY[
 'id','edition_id','student_id','pack_id','pack_version','pack_sha256',
 'question_order','answers','status','started_at','deadline_at',
 'submitted_at','score_tenths','receipt_id','result','pack_snapshot',
 'answer_revision'];
BEGIN
 SELECT array_agg(column_name::text ORDER BY column_name) INTO actual
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='study_exam_attempts';
 IF actual IS DISTINCT FROM (SELECT array_agg(c ORDER BY c) FROM unnest(expected) c) THEN
  RAISE EXCEPTION 'study_exam_attempts shape mismatch: %', actual;
 END IF;
END $$;

UPDATE public.study_schema SET version=9 WHERE version=8;
NOTIFY pgrst,'reload schema';
