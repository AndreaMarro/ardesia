CREATE TABLE study_upload_intents(
 id TEXT PRIMARY KEY, edition_id TEXT NOT NULL REFERENCES study_editions(id),
 owner_id TEXT NOT NULL REFERENCES study_principals(id),
 state TEXT NOT NULL CHECK(state IN ('pending','committed','cleanup_required')),
 expires_at DOUBLE PRECISION NOT NULL, created_at DOUBLE PRECISION NOT NULL
);
CREATE INDEX study_upload_recovery ON study_upload_intents(state,expires_at,created_at);

ALTER TABLE public.study_upload_intents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.study_upload_intents FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_upload_intents TO ardesia_app;
CREATE POLICY backend_upload_owner ON public.study_upload_intents TO ardesia_app
    USING (owner_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.can_enter(edition_id))
    WITH CHECK (owner_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.can_enter(edition_id));

CREATE FUNCTION ardesia_private.can_upload_original(blob TEXT) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.study_upload_intents i
        WHERE i.id=blob AND i.owner_id=(SELECT ardesia_private.actor_id())
          AND i.state='pending' AND i.expires_at > extract(epoch FROM clock_timestamp())
          AND ardesia_private.can_enter(i.edition_id)
    )
$$;
REVOKE ALL ON FUNCTION ardesia_private.can_upload_original(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ardesia_private.can_upload_original(TEXT) TO authenticated;
DROP POLICY ardesia_original_insert ON storage.objects;
CREATE POLICY ardesia_original_insert ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id='ardesia-originals' AND owner_id=(SELECT auth.uid())::text
      AND name ~ '^[a-f0-9]{32}$' AND ardesia_private.can_upload_original(name));
NOTIFY pgrst, 'reload schema';
