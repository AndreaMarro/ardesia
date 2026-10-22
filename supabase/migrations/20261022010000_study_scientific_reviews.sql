-- Schema10: private review revisions, separate from editorial publication.
-- Existing approvals, events, RLS and student projections remain unchanged.
DO $$ BEGIN
 IF (SELECT count(*) FROM public.study_schema)<>1
    OR (SELECT version FROM public.study_schema) NOT IN (9,10) THEN
  RAISE EXCEPTION 'schema9 or schema10 required before scientific review migration';
 END IF;
END $$;
CREATE TABLE IF NOT EXISTS public.study_question_bank_reviews(
 id TEXT PRIMARY KEY,
 edition_id TEXT NOT NULL,
 bank_id TEXT NOT NULL CHECK(length(bank_id) BETWEEN 1 AND 128),
 question_id TEXT NOT NULL CHECK(length(question_id) BETWEEN 1 AND 128),
 question_version INTEGER NOT NULL CHECK(question_version>=1),
 content_sha256 TEXT NOT NULL CHECK(length(content_sha256)=64),
 bank_sha256 TEXT NOT NULL CHECK(length(bank_sha256)=64),
 status TEXT NOT NULL CHECK(status IN ('PENDING','APPROVED','REJECTED')),
 notes TEXT NOT NULL CHECK(length(notes) BETWEEN 1 AND 2000),
 actor_id TEXT NOT NULL CHECK(length(actor_id) BETWEEN 1 AND 128),
 created_at DOUBLE PRECISION NOT NULL,
 supersedes_id TEXT UNIQUE REFERENCES public.study_question_bank_reviews(id)
);
DO $$ DECLARE actual TEXT[]; expected TEXT[];
BEGIN
 expected := ARRAY['id','edition_id','bank_id','question_id','question_version',
  'content_sha256','bank_sha256','status','notes','actor_id','created_at','supersedes_id'];
 SELECT array_agg(column_name::text ORDER BY column_name) INTO actual
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='study_question_bank_reviews';
 IF actual IS DISTINCT FROM (SELECT array_agg(c ORDER BY c) FROM unnest(expected) c) THEN
  RAISE EXCEPTION 'study_question_bank_reviews shape mismatch: %', actual;
 END IF;
END $$;
CREATE INDEX IF NOT EXISTS study_bank_review_question
 ON public.study_question_bank_reviews(edition_id,bank_id,question_id,created_at);
CREATE OR REPLACE FUNCTION ardesia_private.study_bank_review_guard() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN
 IF TG_OP<>'INSERT' THEN RAISE EXCEPTION 'question_reviews_are_append_only'; END IF;
 IF NEW.supersedes_id IS NOT NULL AND NOT EXISTS(
  SELECT 1 FROM public.study_question_bank_reviews r
  WHERE r.id=NEW.supersedes_id AND r.edition_id=NEW.edition_id
   AND r.bank_id=NEW.bank_id AND r.question_id=NEW.question_id) THEN
  RAISE EXCEPTION 'review_identity_mismatch';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS study_bank_review_append_only ON public.study_question_bank_reviews;
CREATE TRIGGER study_bank_review_append_only BEFORE INSERT OR UPDATE OR DELETE
 ON public.study_question_bank_reviews FOR EACH ROW
 EXECUTE FUNCTION ardesia_private.study_bank_review_guard();
GRANT EXECUTE ON FUNCTION ardesia_private.study_bank_review_guard() TO ardesia_app;
ALTER TABLE public.study_question_bank_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.study_question_bank_reviews FROM PUBLIC,anon,authenticated,ardesia_app;
GRANT SELECT,INSERT ON public.study_question_bank_reviews TO ardesia_app;
DROP POLICY IF EXISTS scientific_review_read ON public.study_question_bank_reviews;
CREATE POLICY scientific_review_read ON public.study_question_bank_reviews FOR SELECT TO ardesia_app
 USING(EXISTS(SELECT 1 FROM public.study_editions e WHERE e.id=edition_id
  AND e.teacher_id=(SELECT ardesia_private.actor_id())));
DROP POLICY IF EXISTS scientific_review_insert ON public.study_question_bank_reviews;
CREATE POLICY scientific_review_insert ON public.study_question_bank_reviews FOR INSERT TO ardesia_app
 WITH CHECK(actor_id=(SELECT ardesia_private.actor_id())
  AND EXISTS(SELECT 1 FROM public.study_editions e WHERE e.id=edition_id
   AND e.teacher_id=(SELECT ardesia_private.actor_id())));
UPDATE public.study_schema SET version=10 WHERE version=9;
NOTIFY pgrst,'reload schema';
