-- The API may validate a public interest request before there is an account.
-- These policies apply only to the non-login backend role; browser/Data API
-- roles retain no grants on contacts, receipts, sessions or invitations.
CREATE POLICY backend_edition_catalog ON public.study_editions FOR SELECT TO ardesia_app
    USING (true);
DROP POLICY core_actor ON public.study_interests;
CREATE POLICY backend_interest_receipt ON public.study_interests FOR SELECT TO ardesia_app
    USING (true);
CREATE POLICY backend_interest_insert ON public.study_interests FOR INSERT TO ardesia_app
    WITH CHECK (contact LIKE '%.invalid' AND length(topic) BETWEEN 1 AND 200);
REVOKE SELECT ON public.study_resources FROM authenticated;
