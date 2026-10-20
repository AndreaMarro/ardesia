-- Additive management revision. Existing collecting rows remain collecting;
-- no approval, payment or participant acceptance is manufactured by migration.
ALTER TABLE public.study_editions ADD COLUMN management_revision BIGINT NOT NULL DEFAULT 0 CHECK(management_revision>=0);
ALTER TABLE public.study_holds ADD COLUMN offer_revision BIGINT CHECK(offer_revision>=0);
ALTER TABLE public.study_editions ALTER COLUMN state SET DEFAULT 'draft';
CREATE INDEX study_editions_teacher_id ON public.study_editions(teacher_id,id);
CREATE INDEX study_holds_edition_state_expiry ON public.study_holds(edition_id,state,expires_at);

-- Keep backend SELECT/FOR UPDATE available to the existing student seat
-- command. A row lock is not authority to modify the edition. WITH CHECK
-- restricts actual writes, and the immutable-owner trigger prevents takeover.
DROP POLICY core_actor ON public.study_editions;
CREATE POLICY edition_teacher_insert ON public.study_editions FOR INSERT TO ardesia_app
 WITH CHECK (teacher_id=(SELECT ardesia_private.actor_id()) AND EXISTS (
   SELECT 1 FROM public.study_principals p WHERE p.id=teacher_id AND p.role='teacher'));
CREATE POLICY edition_teacher_update ON public.study_editions FOR UPDATE TO ardesia_app
 USING ((SELECT ardesia_private.actor_id()) IS NOT NULL)
 WITH CHECK (teacher_id=(SELECT ardesia_private.actor_id()) AND EXISTS (
   SELECT 1 FROM public.study_principals p WHERE p.id=teacher_id AND p.role='teacher'));
CREATE POLICY edition_teacher_delete ON public.study_editions FOR DELETE TO ardesia_app
 USING (teacher_id=(SELECT ardesia_private.actor_id()));
CREATE FUNCTION ardesia_private.immutable_edition_teacher() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF NEW.teacher_id IS DISTINCT FROM OLD.teacher_id THEN
   RAISE EXCEPTION 'edition teacher is immutable' USING ERRCODE='23514',CONSTRAINT='study_edition_teacher_immutable';
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION ardesia_private.immutable_edition_teacher() FROM PUBLIC;
CREATE TRIGGER study_edition_teacher_immutable BEFORE UPDATE OF teacher_id ON public.study_editions
 FOR EACH ROW EXECUTE FUNCTION ardesia_private.immutable_edition_teacher();
-- Existing browser roles retain no grants on canonical edition mutations.
REVOKE ALL ON public.study_editions FROM anon,authenticated;
CREATE POLICY backend_schema_read ON public.study_schema FOR SELECT TO ardesia_app USING (true);
UPDATE public.study_schema SET version=4 WHERE version=3;
NOTIFY pgrst,'reload schema';
