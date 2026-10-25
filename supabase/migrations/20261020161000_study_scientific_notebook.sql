-- Additive extension of the canonical resources/revisions, not another store.
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.study_resources WHERE kind='scientific-notebook') THEN
  RAISE EXCEPTION 'notebook_kind_migration_conflict';
 END IF;
END $$;
CREATE TABLE public.study_notebook_bindings(
 resource_id TEXT PRIMARY KEY REFERENCES public.study_resources(id) ON DELETE CASCADE,
 asset_id TEXT NOT NULL REFERENCES public.study_assets(id),
 asset_sha256 TEXT NOT NULL CHECK(length(asset_sha256)=64),
 page_count INTEGER NOT NULL CHECK(page_count BETWEEN 1 AND 20)
);
CREATE TABLE public.study_notebook_snapshots(
 revision_id TEXT PRIMARY KEY REFERENCES public.study_revisions(id) ON DELETE CASCADE,
 state TEXT NOT NULL, sha256 TEXT NOT NULL CHECK(length(sha256)=64)
);
ALTER TABLE public.study_notebook_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_notebook_snapshots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.study_notebook_bindings,public.study_notebook_snapshots FROM PUBLIC,anon,authenticated,ardesia_app;
GRANT SELECT,INSERT ON public.study_notebook_bindings,public.study_notebook_snapshots TO ardesia_app;
CREATE POLICY notebook_binding_read ON public.study_notebook_bindings FOR SELECT TO ardesia_app
 USING(ardesia_private.can_read_resource(resource_id) AND ardesia_private.can_read_asset(asset_id));
CREATE POLICY notebook_binding_insert ON public.study_notebook_bindings FOR INSERT TO ardesia_app
 WITH CHECK(EXISTS(SELECT 1 FROM public.study_resources r JOIN public.study_assets a ON a.id=asset_id
  WHERE r.id=resource_id AND r.kind='scientific-notebook' AND r.visibility='private'
  AND r.deleted=0 AND a.deleted=0 AND a.mime='application/pdf'
  AND r.owner_id=(SELECT ardesia_private.actor_id()) AND a.owner_id=r.owner_id
  AND a.edition_id=r.edition_id AND a.sha256=asset_sha256 AND ardesia_private.can_enter(r.edition_id)));
CREATE POLICY notebook_snapshot_read ON public.study_notebook_snapshots FOR SELECT TO ardesia_app
 USING(EXISTS(SELECT 1 FROM public.study_revisions v WHERE v.id=study_notebook_snapshots.revision_id
  AND ardesia_private.can_read_revision(v.resource_id,v.id)));
CREATE POLICY notebook_snapshot_insert ON public.study_notebook_snapshots FOR INSERT TO ardesia_app
 WITH CHECK(EXISTS(SELECT 1 FROM public.study_resources r JOIN public.study_revisions v ON v.resource_id=r.id
  WHERE v.id=study_notebook_snapshots.revision_id AND r.kind='scientific-notebook'
  AND r.owner_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.can_enter(r.edition_id)));
UPDATE public.study_schema SET version=6 WHERE version=5;
NOTIFY pgrst,'reload schema';
