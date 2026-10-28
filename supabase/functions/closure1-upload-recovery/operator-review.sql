-- REVIEW ARTIFACT ONLY. Apply only after explicit operator approval.
-- No password, login, auth mapping, role inheritance or normal-policy change.
BEGIN;
CREATE ROLE ardesia_upload_cleanup NOLOGIN NOINHERIT NOBYPASSRLS;
GRANT ardesia_upload_cleanup TO postgres WITH INHERIT FALSE, SET TRUE;
GRANT USAGE ON SCHEMA public TO ardesia_upload_cleanup;
GRANT SELECT(id,state,expires_at,created_at), UPDATE(state), DELETE
  ON public.study_upload_intents TO ardesia_upload_cleanup;
GRANT SELECT(id) ON public.study_assets TO ardesia_upload_cleanup;
CREATE POLICY upload_cleanup_intent_read ON public.study_upload_intents
  FOR SELECT TO ardesia_upload_cleanup USING (true);
CREATE POLICY upload_cleanup_metadata_read ON public.study_assets
  FOR SELECT TO ardesia_upload_cleanup USING (true);
CREATE POLICY upload_cleanup_reconcile ON public.study_upload_intents
  FOR UPDATE TO ardesia_upload_cleanup
  USING (state IN ('pending','cleanup_required'))
  WITH CHECK (state='committed' AND EXISTS (
    SELECT 1 FROM public.study_assets a WHERE a.id=study_upload_intents.id));
CREATE POLICY upload_cleanup_intent_delete ON public.study_upload_intents
  FOR DELETE TO ardesia_upload_cleanup
  USING (state IN ('pending','cleanup_required')
    AND expires_at <= extract(epoch FROM clock_timestamp())
    AND NOT EXISTS (SELECT 1 FROM public.study_assets a WHERE a.id=study_upload_intents.id));
COMMIT;
