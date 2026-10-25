-- Auth identity is separate from pseudonymous learning facts. Browser roles
-- receive read access only; mutations go through the shared transactional Core.
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ardesia_app') THEN
        CREATE ROLE ardesia_app NOLOGIN NOINHERIT NOBYPASSRLS;
    END IF;
END $$;
GRANT ardesia_app TO postgres;
CREATE TABLE ardesia_private.identities (
    auth_user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_id TEXT NOT NULL UNIQUE REFERENCES public.study_principals(id)
);
REVOKE ALL ON SCHEMA ardesia_private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA ardesia_private FROM PUBLIC, anon, authenticated, ardesia_app;

-- These bounded lookup functions avoid recursive RLS joins. They are not
-- exposed RPCs; fixed search_path and auth.uid/session checks are mandatory.
CREATE FUNCTION ardesia_private.actor_id() RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT i.actor_id FROM ardesia_private.identities i
    WHERE i.auth_user_id = (SELECT auth.uid())
      AND EXISTS (
          SELECT 1 FROM auth.sessions s
          WHERE s.user_id = i.auth_user_id
            AND s.id::text = (SELECT auth.jwt() ->> 'session_id')
      )
$$;
CREATE FUNCTION ardesia_private.teaches(edition TEXT) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.study_editions e
        JOIN public.study_principals p ON p.id=e.teacher_id AND p.role='teacher'
        WHERE e.id=edition AND e.teacher_id=(SELECT ardesia_private.actor_id())
    )
$$;
CREATE FUNCTION ardesia_private.enrolled(edition TEXT, learner TEXT) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT (SELECT ardesia_private.actor_id()) IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.study_members m
        WHERE m.edition_id=edition AND m.student_id=learner
    )
$$;
CREATE FUNCTION ardesia_private.can_enter(edition TEXT) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT ardesia_private.teaches(edition)
        OR ardesia_private.enrolled(edition, (SELECT ardesia_private.actor_id()))
$$;
CREATE FUNCTION ardesia_private.can_read_submission(submission TEXT) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.study_submissions s
        WHERE s.id=submission
          AND ardesia_private.enrolled(s.edition_id,s.student_id)
          AND (s.student_id=(SELECT ardesia_private.actor_id()) OR ardesia_private.teaches(s.edition_id))
    )
$$;
CREATE FUNCTION ardesia_private.can_read_resource(resource TEXT) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.study_resources r
        WHERE r.id=resource AND r.deleted=0 AND ardesia_private.can_enter(r.edition_id)
          AND (r.owner_id=(SELECT ardesia_private.actor_id()) OR r.visibility='group'
            OR (ardesia_private.teaches(r.edition_id)
              AND ardesia_private.enrolled(r.edition_id,r.owner_id)
              AND EXISTS (
                SELECT 1 FROM public.study_submissions s
                JOIN public.study_receipts receipt ON receipt.id=s.receipt_id
                  AND receipt.actor_id=s.student_id AND receipt.operation='submission.received'
                CROSS JOIN LATERAL jsonb_array_elements(s.source_refs::jsonb) ref
                WHERE s.edition_id=r.edition_id AND s.student_id=r.owner_id
                  AND ref->>'resourceId'=r.id
              )))
    )
$$;
CREATE FUNCTION ardesia_private.can_read_revision(resource TEXT, requested_revision TEXT) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.study_resources r
        WHERE r.id=resource AND r.deleted=0 AND ardesia_private.can_enter(r.edition_id)
          AND (r.owner_id=(SELECT ardesia_private.actor_id()) OR r.visibility='group'
            OR (ardesia_private.teaches(r.edition_id)
              AND ardesia_private.enrolled(r.edition_id,r.owner_id)
              AND EXISTS (
                SELECT 1 FROM public.study_submissions s
                JOIN public.study_receipts receipt ON receipt.id=s.receipt_id
                  AND receipt.actor_id=s.student_id AND receipt.operation='submission.received'
                CROSS JOIN LATERAL jsonb_array_elements(s.source_refs::jsonb) ref
                WHERE s.edition_id=r.edition_id AND s.student_id=r.owner_id
                  AND ref->>'resourceId'=r.id AND ref->>'revisionId'=requested_revision
              )))
    )
$$;
CREATE FUNCTION ardesia_private.can_read_asset(asset TEXT) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.study_assets a
        WHERE a.id=asset AND a.deleted=0 AND ardesia_private.can_enter(a.edition_id)
          AND (a.owner_id=(SELECT ardesia_private.actor_id())
            OR (ardesia_private.teaches(a.edition_id)
              AND ardesia_private.enrolled(a.edition_id,a.owner_id)
              AND EXISTS (
                SELECT 1 FROM public.study_submissions s
                JOIN public.study_receipts receipt ON receipt.id=s.receipt_id
                  AND receipt.actor_id=s.student_id AND receipt.operation='submission.received'
                WHERE s.edition_id=a.edition_id AND s.student_id=a.owner_id
                  AND s.asset_refs::jsonb ? a.id
              )))
    )
$$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA ardesia_private FROM PUBLIC;
GRANT USAGE ON SCHEMA ardesia_private TO authenticated, ardesia_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA ardesia_private TO authenticated, ardesia_app;

-- Default-deny every canonical table, including legacy projections and ledgers.
DO $$ DECLARE table_name TEXT;
BEGIN
    FOR table_name IN SELECT tablename FROM pg_tables WHERE schemaname='public'
      AND (tablename LIKE 'study_%' OR tablename IN (
        'paths','lessons','sources','segments','moments','capsules','cost_ledger',
        'nodes','edges','evidence','teachers','classes','students','enrollments','consent_events'))
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',table_name);
        EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated',table_name);
        EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON public.%I TO ardesia_app',table_name);
        EXECUTE format('CREATE POLICY core_actor ON public.%I TO ardesia_app USING ((SELECT ardesia_private.actor_id()) IS NOT NULL) WITH CHECK ((SELECT ardesia_private.actor_id()) IS NOT NULL)',table_name);
    END LOOP;
END $$;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ardesia_app;

-- Sensitive originals are independently restricted inside PostgreSQL even when
-- a backend command forgets its application-level filter.
DROP POLICY core_actor ON public.study_resources;
CREATE POLICY core_resource_read ON public.study_resources FOR SELECT TO ardesia_app, authenticated
    USING (ardesia_private.can_read_resource(id));
CREATE POLICY core_resource_insert ON public.study_resources FOR INSERT TO ardesia_app
    WITH CHECK (owner_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.can_enter(edition_id)
      AND (visibility='private' OR ardesia_private.teaches(edition_id)));
CREATE POLICY core_resource_update ON public.study_resources FOR UPDATE TO ardesia_app
    USING (owner_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.can_enter(edition_id))
    WITH CHECK (owner_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.can_enter(edition_id)
      AND (visibility='private' OR ardesia_private.teaches(edition_id)));
DROP POLICY core_actor ON public.study_revisions;
CREATE POLICY core_revision_read ON public.study_revisions FOR SELECT TO ardesia_app, authenticated
    USING (ardesia_private.can_read_revision(resource_id,id));
CREATE POLICY core_revision_insert ON public.study_revisions FOR INSERT TO ardesia_app
    WITH CHECK (EXISTS (SELECT 1 FROM public.study_resources r WHERE r.id=resource_id AND r.owner_id=(SELECT ardesia_private.actor_id())));
DROP POLICY core_actor ON public.study_assets;
CREATE POLICY core_asset_read ON public.study_assets FOR SELECT TO ardesia_app, authenticated
    USING (ardesia_private.can_read_asset(id));
CREATE POLICY core_asset_insert ON public.study_assets FOR INSERT TO ardesia_app
    WITH CHECK (owner_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.can_enter(edition_id));
DROP POLICY core_actor ON public.study_submissions;
CREATE POLICY core_submission_read ON public.study_submissions FOR SELECT TO ardesia_app, authenticated
    USING (ardesia_private.can_read_submission(id));
CREATE POLICY core_submission_insert ON public.study_submissions FOR INSERT TO ardesia_app
    WITH CHECK (student_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.enrolled(edition_id,student_id));
CREATE POLICY core_submission_update ON public.study_submissions FOR UPDATE TO ardesia_app
    USING (ardesia_private.teaches(edition_id)) WITH CHECK (ardesia_private.teaches(edition_id));
DROP POLICY core_actor ON public.study_layouts;
CREATE POLICY core_layout ON public.study_layouts TO ardesia_app
    USING (actor_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.can_enter(edition_id))
    WITH CHECK (actor_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.can_enter(edition_id));

GRANT SELECT ON public.study_resources, public.study_revisions, public.study_assets, public.study_submissions TO authenticated;

-- Immutable private originals. No browser overwrite, listing or public bucket.
INSERT INTO storage.buckets(id,name,public) VALUES('ardesia-originals','ardesia-originals',false)
ON CONFLICT (id) DO NOTHING;
CREATE POLICY ardesia_original_read ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id='ardesia-originals' AND ardesia_private.can_read_asset(name));
CREATE POLICY ardesia_original_insert ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id='ardesia-originals' AND owner_id=(SELECT auth.uid())::text
      AND (SELECT ardesia_private.actor_id()) IS NOT NULL);
