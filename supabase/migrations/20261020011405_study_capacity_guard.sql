-- The Core locks the edition before every seat decision. This last invariant
-- also protects future import/admin channels that insert membership directly.
CREATE FUNCTION ardesia_private.enforce_capacity() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE maximum INTEGER; occupied INTEGER;
BEGIN
    SELECT e.capacity INTO maximum FROM public.study_editions e
      WHERE e.id=NEW.edition_id FOR UPDATE;
    IF TG_OP='UPDATE' AND NEW.edition_id=OLD.edition_id AND NEW.student_id=OLD.student_id THEN
        RETURN NEW;
    END IF;
    IF EXISTS (SELECT 1 FROM public.study_members m
      WHERE m.edition_id=NEW.edition_id AND m.student_id=NEW.student_id) THEN
        RETURN NEW;
    END IF;
    SELECT count(*) INTO occupied FROM public.study_members m WHERE m.edition_id=NEW.edition_id;
    IF occupied >= maximum THEN
        RAISE EXCEPTION 'edition capacity exceeded' USING ERRCODE='23514',CONSTRAINT='study_member_capacity';
    END IF;
    RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION ardesia_private.enforce_capacity() FROM PUBLIC;
CREATE TRIGGER study_member_capacity BEFORE INSERT OR UPDATE ON public.study_members
    FOR EACH ROW EXECUTE FUNCTION ardesia_private.enforce_capacity();
CREATE INDEX study_members_student ON public.study_members(student_id,edition_id);
CREATE INDEX study_submission_owner ON public.study_submissions(edition_id,student_id);
CREATE INDEX study_resource_context ON public.study_resources(context_id);
CREATE INDEX study_rate_limit_expiry ON public.study_rate_limits(expires_at);
