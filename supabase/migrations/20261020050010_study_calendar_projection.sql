CREATE TABLE study_calendar_targets(
 id TEXT PRIMARY KEY, edition_id TEXT NOT NULL REFERENCES study_editions(id) ON DELETE CASCADE,
 actor_id TEXT NOT NULL REFERENCES study_principals(id), provider TEXT NOT NULL CHECK(provider IN ('mock','ics')),
 account_id TEXT NOT NULL, calendar_id TEXT NOT NULL CHECK(calendar_id='primary'),
 source_version TEXT, sequence INTEGER NOT NULL DEFAULT 0 CHECK(sequence>=0), sync_cursor TEXT,
 sync_version INTEGER NOT NULL DEFAULT 0 CHECK(sync_version>=0),
 channel_id TEXT, channel_token TEXT, channel_resource TEXT, channel_expires DOUBLE PRECISION,
 UNIQUE(edition_id,actor_id,provider,account_id,calendar_id), CHECK(account_id=actor_id)
);
CREATE TABLE study_calendar_intents(
 id TEXT PRIMARY KEY, target_id TEXT NOT NULL REFERENCES study_calendar_targets(id) ON DELETE CASCADE,
 actor_id TEXT NOT NULL REFERENCES study_principals(id), edition_id TEXT NOT NULL REFERENCES study_editions(id),
 source_version TEXT NOT NULL CHECK(length(source_version)=64), preview_hash TEXT NOT NULL CHECK(length(preview_hash)=64),
 body TEXT NOT NULL, created_at DOUBLE PRECISION NOT NULL, expires_at DOUBLE PRECISION NOT NULL CHECK(expires_at>created_at),
 state TEXT NOT NULL DEFAULT 'preview' CHECK(state IN ('preview','publishing','published')),
 confirm_key TEXT, consumed_at DOUBLE PRECISION, UNIQUE(actor_id,confirm_key)
);
CREATE INDEX study_calendar_intent_scope ON study_calendar_intents(actor_id,edition_id,target_id);
CREATE TABLE study_calendar_mappings(
 target_id TEXT NOT NULL REFERENCES study_calendar_targets(id) ON DELETE CASCADE,
 session_id TEXT NOT NULL, event_id TEXT NOT NULL, source_version TEXT, etag TEXT, applied_body TEXT,
 PRIMARY KEY(target_id,session_id), UNIQUE(target_id,event_id)
);
CREATE TABLE study_calendar_cache(
 target_id TEXT NOT NULL REFERENCES study_calendar_targets(id) ON DELETE CASCADE,
 event_id TEXT NOT NULL, start_utc TEXT, end_utc TEXT, etag TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('confirmed','tentative','cancelled')),
 PRIMARY KEY(target_id,event_id)
);
CREATE TABLE study_calendar_deliveries(
 target_id TEXT NOT NULL REFERENCES study_calendar_targets(id) ON DELETE CASCADE,
 channel_id TEXT NOT NULL, delivery_id TEXT NOT NULL, created_at DOUBLE PRECISION NOT NULL,
 PRIMARY KEY(target_id,channel_id,delivery_id)
);

-- Dedicated adapter state is private to the owning tutor. No browser grants.
DO $$ DECLARE table_name TEXT; BEGIN
 FOREACH table_name IN ARRAY ARRAY['study_calendar_targets','study_calendar_intents','study_calendar_mappings','study_calendar_cache','study_calendar_deliveries'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',table_name);
  EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated,ardesia_app',table_name);
  EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON public.%I TO ardesia_app',table_name);
 END LOOP;
END $$;
CREATE POLICY calendar_target_owner ON public.study_calendar_targets TO ardesia_app
 USING(actor_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.teaches(edition_id))
 WITH CHECK(actor_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.teaches(edition_id));
CREATE POLICY calendar_intent_owner ON public.study_calendar_intents TO ardesia_app
 USING(actor_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.teaches(edition_id))
 WITH CHECK(actor_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.teaches(edition_id)
  AND EXISTS(SELECT 1 FROM public.study_calendar_targets t WHERE t.id=target_id AND t.actor_id=study_calendar_intents.actor_id AND t.edition_id=study_calendar_intents.edition_id));
DO $$ DECLARE table_name TEXT; BEGIN
 FOREACH table_name IN ARRAY ARRAY['study_calendar_mappings','study_calendar_cache','study_calendar_deliveries'] LOOP
  EXECUTE format('CREATE POLICY calendar_projection_owner ON public.%I TO ardesia_app USING(EXISTS(SELECT 1 FROM public.study_calendar_targets t WHERE t.id=target_id AND t.actor_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.teaches(t.edition_id))) WITH CHECK(EXISTS(SELECT 1 FROM public.study_calendar_targets t WHERE t.id=target_id AND t.actor_id=(SELECT ardesia_private.actor_id()) AND ardesia_private.teaches(t.edition_id)))',table_name);
 END LOOP;
END $$;
UPDATE public.study_schema SET version=3 WHERE version=2;
NOTIFY pgrst,'reload schema';

-- Published ICS contains only authorized canonical course dates/metadata.
CREATE POLICY calendar_ics_member_target ON public.study_calendar_targets FOR SELECT TO ardesia_app
 USING(provider='ics' AND ardesia_private.enrolled(edition_id,(SELECT ardesia_private.actor_id())));
CREATE POLICY calendar_ics_member_intent ON public.study_calendar_intents FOR SELECT TO ardesia_app
 USING(state='published' AND ardesia_private.enrolled(edition_id,(SELECT ardesia_private.actor_id()))
 AND EXISTS(SELECT 1 FROM public.study_calendar_targets t WHERE t.id=target_id AND t.provider='ics'));

CREATE UNIQUE INDEX IF NOT EXISTS study_calendar_active_publish ON study_calendar_intents(target_id) WHERE state='publishing';
