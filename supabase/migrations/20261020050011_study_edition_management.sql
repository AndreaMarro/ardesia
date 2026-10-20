-- Additive management revision. Existing collecting rows remain collecting;
-- no approval, payment or participant acceptance is manufactured by migration.
ALTER TABLE public.study_editions ADD COLUMN management_revision BIGINT NOT NULL DEFAULT 0 CHECK(management_revision>=0);
ALTER TABLE public.study_holds ADD COLUMN offer_revision BIGINT CHECK(offer_revision>=0);
ALTER TABLE public.study_editions ALTER COLUMN state SET DEFAULT 'draft';
CREATE INDEX study_editions_teacher_id ON public.study_editions(teacher_id,id);
CREATE INDEX study_members_student_id ON public.study_members(student_id,edition_id);
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
-- Draft privacy applies at the backend SQL boundary as well as the HTTP
-- route. SECURITY DEFINER membership helpers avoid recursive policy joins.
DROP POLICY backend_edition_catalog ON public.study_editions;
CREATE POLICY backend_edition_catalog ON public.study_editions FOR SELECT TO ardesia_app
 USING (state!='draft' OR ardesia_private.can_enter(id));
DROP POLICY backend_pack_catalog ON public.study_edition_packs;
CREATE POLICY backend_pack_catalog ON public.study_edition_packs FOR SELECT TO ardesia_app
 USING (EXISTS (SELECT 1 FROM public.study_editions e WHERE e.id=edition_id));
CREATE OR REPLACE FUNCTION ardesia_private.catalog(edition TEXT) RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT jsonb_build_object(
  'id',e.id,'capacity',e.capacity,'priceMinor',e.price_minor,'state',e.state,
  'sessions',e.sessions::jsonb,'timezone',e.timezone,
  'courseId',p.course_id,'packId',p.pack_id,'packVersion',p.pack_version,'packSha256',p.pack_sha256,
  'confirmedTest',(SELECT count(*) FROM public.study_members m WHERE m.edition_id=e.id),
  'available',e.capacity-(SELECT count(*) FROM public.study_members m WHERE m.edition_id=e.id)
 ) FROM public.study_editions e JOIN public.study_edition_packs p ON p.edition_id=e.id
 WHERE e.id=edition AND (e.state!='draft' OR ardesia_private.can_enter(e.id))
$$;
REVOKE ALL ON FUNCTION ardesia_private.catalog(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ardesia_private.catalog(TEXT) TO ardesia_app;
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
