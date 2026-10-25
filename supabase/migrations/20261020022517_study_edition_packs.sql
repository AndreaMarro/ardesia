-- Pin bundled content to an edition without introducing a second course DB.
CREATE TABLE study_edition_packs(
 edition_id TEXT PRIMARY KEY REFERENCES study_editions(id) ON DELETE CASCADE,
 course_id TEXT NOT NULL, pack_id TEXT NOT NULL,
 pack_version INTEGER NOT NULL CHECK(pack_version>0),
 pack_sha256 TEXT NOT NULL CHECK(pack_sha256 ~ '^[0-9a-f]{64}$')
);
-- The preceding release only shipped the immutable relazioni-fluidi-v1 pack.
INSERT INTO study_edition_packs
 SELECT id,'fisica-fluidi','relazioni-fluidi-v1',1,
 '3e0589e3647cc8d45e006c58839f2b83b06a13451f5d2985ac01eee8efaa321f'
 FROM study_editions;

ALTER TABLE public.study_edition_packs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.study_edition_packs FROM PUBLIC,anon,authenticated,ardesia_app;
GRANT SELECT,INSERT ON public.study_edition_packs TO ardesia_app;
-- Binding metadata is public; it carries no membership or private work.
CREATE POLICY backend_pack_catalog ON public.study_edition_packs FOR SELECT TO ardesia_app USING(true);
CREATE POLICY backend_pack_owner ON public.study_edition_packs FOR INSERT TO ardesia_app
 WITH CHECK(ardesia_private.teaches(edition_id));
-- No UPDATE/DELETE grant or policy: the content pin is immutable to app actors.

CREATE OR REPLACE FUNCTION ardesia_private.catalog(edition TEXT) RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT jsonb_build_object(
  'id',e.id,'capacity',e.capacity,'priceMinor',e.price_minor,'state',e.state,
  'sessions',e.sessions::jsonb,'timezone',e.timezone,
  'courseId',p.course_id,'packId',p.pack_id,'packVersion',p.pack_version,'packSha256',p.pack_sha256,
  'confirmedTest',(SELECT count(*) FROM public.study_members m WHERE m.edition_id=e.id),
  'available',e.capacity-(SELECT count(*) FROM public.study_members m WHERE m.edition_id=e.id)
 ) FROM public.study_editions e JOIN public.study_edition_packs p ON p.edition_id=e.id WHERE e.id=edition
$$;
REVOKE ALL ON FUNCTION ardesia_private.catalog(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ardesia_private.catalog(TEXT) TO ardesia_app;
NOTIFY pgrst,'reload schema';
