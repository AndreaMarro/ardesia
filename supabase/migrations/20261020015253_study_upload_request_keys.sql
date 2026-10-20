CREATE TABLE study_upload_requests(
 actor_id TEXT NOT NULL REFERENCES study_principals(id), request_key TEXT NOT NULL,
 payload_hash TEXT NOT NULL, asset_id TEXT NOT NULL UNIQUE REFERENCES study_upload_intents(id) ON DELETE CASCADE,
 PRIMARY KEY(actor_id,request_key)
);

ALTER TABLE public.study_upload_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.study_upload_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_upload_requests TO ardesia_app;
CREATE POLICY backend_upload_request ON public.study_upload_requests TO ardesia_app
    USING (actor_id=(SELECT ardesia_private.actor_id()))
    WITH CHECK (actor_id=(SELECT ardesia_private.actor_id()));
NOTIFY pgrst, 'reload schema';
