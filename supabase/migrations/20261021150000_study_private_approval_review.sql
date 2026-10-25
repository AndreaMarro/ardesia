DO $$ BEGIN
 IF (SELECT version FROM public.study_schema) <> 9 THEN
  RAISE EXCEPTION 'schema9 required before private approval review migration';
 END IF;
END $$;
DROP POLICY IF EXISTS approval_read ON public.study_question_bank_approvals;
CREATE POLICY approval_read ON public.study_question_bank_approvals FOR SELECT TO ardesia_app
 USING(EXISTS(SELECT 1 FROM public.study_editions e WHERE e.id=edition_id
  AND e.teacher_id=(SELECT ardesia_private.actor_id())));
DROP POLICY IF EXISTS approval_event_read ON public.study_question_bank_approval_events;
CREATE POLICY approval_event_read ON public.study_question_bank_approval_events FOR SELECT TO ardesia_app
 USING(EXISTS(SELECT 1 FROM public.study_editions e WHERE e.id=edition_id
  AND e.teacher_id=(SELECT ardesia_private.actor_id())));
CREATE OR REPLACE FUNCTION ardesia_private.study_servable_approvals(
 p_edition_id text, p_bank_id text)
RETURNS TABLE(approval_id text, question_id text, question_version integer, content_sha256 text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public,ardesia_private AS $$
 SELECT a.id,a.question_id,a.question_version,a.content_sha256
 FROM public.study_question_bank_approvals a
 WHERE a.edition_id=p_edition_id AND a.bank_id=p_bank_id
  AND a.scientific_status='APPROVED' AND a.editorial_status='PUBLISHED'
  AND ardesia_private.can_enter(a.edition_id)
 ORDER BY a.created_at DESC,a.id DESC
$$;
CREATE OR REPLACE FUNCTION ardesia_private.study_revoked_approvals(
 p_edition_id text, p_bank_id text, p_approval_ids text[])
RETURNS TABLE(approval_id text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public,ardesia_private AS $$
 SELECT DISTINCT e.approval_id
 FROM public.study_question_bank_approval_events e
 WHERE e.edition_id=p_edition_id AND e.bank_id=p_bank_id
  AND e.event='REVOKED' AND e.approval_id=ANY(p_approval_ids)
  AND ardesia_private.can_enter(e.edition_id)
$$;
REVOKE ALL ON FUNCTION ardesia_private.study_servable_approvals(text,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION ardesia_private.study_revoked_approvals(text,text,text[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION ardesia_private.study_servable_approvals(text,text) TO ardesia_app;
GRANT EXECUTE ON FUNCTION ardesia_private.study_revoked_approvals(text,text,text[]) TO ardesia_app;
NOTIFY pgrst,'reload schema';
