-- Only the trusted backend role can maintain request counters. Browser roles
-- have no table grants; a signed-in identity is not needed to limit login.
DROP POLICY core_actor ON public.study_rate_limits;
CREATE POLICY backend_rate_limits ON public.study_rate_limits TO ardesia_app
    USING (true) WITH CHECK (true);

CREATE FUNCTION ardesia_private.catalog(edition TEXT) RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT jsonb_build_object(
        'id',e.id,'capacity',e.capacity,'priceMinor',e.price_minor,'state',e.state,
        'sessions',e.sessions::jsonb,'timezone',e.timezone,
        'confirmedTest',(SELECT count(*) FROM public.study_members m WHERE m.edition_id=e.id),
        'available',e.capacity-(SELECT count(*) FROM public.study_members m WHERE m.edition_id=e.id)
    ) FROM public.study_editions e WHERE e.id=edition
$$;
REVOKE ALL ON FUNCTION ardesia_private.catalog(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ardesia_private.catalog(TEXT) TO ardesia_app;

UPDATE storage.buckets SET file_size_limit=20971520,
    allowed_mime_types=ARRAY['image/png','image/jpeg','image/webp','application/pdf','audio/mpeg','audio/mp4','audio/webm']
WHERE id='ardesia-originals';
DROP POLICY ardesia_original_insert ON storage.objects;
CREATE POLICY ardesia_original_insert ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id='ardesia-originals' AND owner_id=(SELECT auth.uid())::text
      AND name ~ '^[a-f0-9]{32}$' AND (SELECT ardesia_private.actor_id()) IS NOT NULL);
NOTIFY pgrst, 'reload schema';
