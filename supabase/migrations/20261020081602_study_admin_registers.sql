-- Schema5: additive manual registers; no historical attendance/payment backfill.
DO $$ BEGIN
 IF (SELECT count(*) FROM public.study_schema WHERE version=4)!=1 OR (SELECT count(*) FROM public.study_schema)!=1 THEN
  RAISE EXCEPTION 'schema4 required before register migration';
 END IF;
END $$;
CREATE TABLE public.study_attendance_records(
 id TEXT PRIMARY KEY, edition_id TEXT NOT NULL REFERENCES public.study_editions(id),
 session_id TEXT NOT NULL, student_id TEXT NOT NULL REFERENCES public.students(student_id),
 revision BIGINT NOT NULL CHECK(revision BETWEEN 1 AND 9007199254740991),
 supersedes_record_id TEXT, previous_revision BIGINT NOT NULL CHECK(previous_revision=revision-1),
 status TEXT NOT NULL CHECK(status IN ('PRESENT','ABSENT','UNRECORDED')),
 recorded_by TEXT NOT NULL REFERENCES public.teachers(teacher_id), recorded_at DOUBLE PRECISION NOT NULL,
 reason TEXT NOT NULL CHECK(length(reason)<=1000), management_revision BIGINT NOT NULL CHECK(management_revision>=0),
 session_snapshot TEXT NOT NULL,
 receipt_id TEXT NOT NULL UNIQUE REFERENCES public.study_receipts(id) DEFERRABLE INITIALLY DEFERRED,
 CHECK((revision=1 AND supersedes_record_id IS NULL) OR (revision>1 AND supersedes_record_id IS NOT NULL AND length(trim(reason))>0)),
 UNIQUE(edition_id,session_id,student_id,revision),
 UNIQUE(id,edition_id,session_id,student_id,revision),
 FOREIGN KEY(supersedes_record_id,edition_id,session_id,student_id,previous_revision)
  REFERENCES public.study_attendance_records(id,edition_id,session_id,student_id,revision)
);
CREATE INDEX study_attendance_cell ON public.study_attendance_records(edition_id,session_id,student_id,revision DESC);
CREATE INDEX study_attendance_student ON public.study_attendance_records(student_id);
CREATE TABLE public.study_manual_payment_records(
 id TEXT PRIMARY KEY, entry_id TEXT NOT NULL, edition_id TEXT NOT NULL REFERENCES public.study_editions(id),
 student_id TEXT NOT NULL REFERENCES public.students(student_id), revision BIGINT NOT NULL CHECK(revision BETWEEN 1 AND 9007199254740991),
 supersedes_record_id TEXT, previous_revision BIGINT NOT NULL CHECK(previous_revision=revision-1),
 status TEXT NOT NULL CHECK(status IN ('RECORDED_MANUALLY','VOIDED')),
 amount_minor INTEGER NOT NULL CHECK(amount_minor BETWEEN 1 AND 1000000), currency TEXT NOT NULL CHECK(currency='EUR'),
 external_reference TEXT NOT NULL CHECK(length(external_reference) BETWEEN 1 AND 128),
 external_reference_key TEXT NOT NULL CHECK(length(external_reference_key) BETWEEN 1 AND 128),
 recorded_by TEXT NOT NULL REFERENCES public.teachers(teacher_id), recorded_at DOUBLE PRECISION NOT NULL,
 reason TEXT NOT NULL CHECK(length(reason)<=1000), offer_snapshot TEXT NOT NULL,
 receipt_id TEXT NOT NULL UNIQUE REFERENCES public.study_receipts(id) DEFERRABLE INITIALLY DEFERRED,
 CHECK((revision=1 AND supersedes_record_id IS NULL AND entry_id=id) OR (revision>1 AND supersedes_record_id IS NOT NULL AND length(trim(reason))>0)),
 UNIQUE(entry_id,revision), UNIQUE(id,entry_id,edition_id,student_id,revision),
 FOREIGN KEY(supersedes_record_id,entry_id,edition_id,student_id,previous_revision)
  REFERENCES public.study_manual_payment_records(id,entry_id,edition_id,student_id,revision)
);
CREATE UNIQUE INDEX study_manual_reference ON public.study_manual_payment_records(recorded_by,external_reference_key) WHERE revision=1;
CREATE INDEX study_manual_edition_entry ON public.study_manual_payment_records(edition_id,entry_id,revision DESC);
CREATE INDEX study_manual_student ON public.study_manual_payment_records(student_id);

CREATE INDEX study_interests_edition ON public.study_interests(edition_id);
ALTER TABLE public.study_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_manual_payment_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.study_attendance_records,public.study_manual_payment_records FROM PUBLIC,anon,authenticated,ardesia_app;
GRANT SELECT,INSERT ON public.study_attendance_records,public.study_manual_payment_records TO ardesia_app;
CREATE POLICY attendance_owner_read ON public.study_attendance_records FOR SELECT TO ardesia_app
 USING(ardesia_private.teaches(edition_id));
CREATE POLICY attendance_owner_insert ON public.study_attendance_records FOR INSERT TO ardesia_app
 WITH CHECK(recorded_by=(SELECT ardesia_private.actor_id()) AND ardesia_private.teaches(edition_id)
   AND (revision>1 OR ardesia_private.enrolled(edition_id,student_id)));
CREATE POLICY manual_owner_read ON public.study_manual_payment_records FOR SELECT TO ardesia_app
 USING(ardesia_private.teaches(edition_id));
CREATE POLICY manual_owner_insert ON public.study_manual_payment_records FOR INSERT TO ardesia_app
 WITH CHECK(recorded_by=(SELECT ardesia_private.actor_id()) AND ardesia_private.teaches(edition_id)
   AND (revision>1 OR ardesia_private.enrolled(edition_id,student_id)));

-- Permissive policies combine with OR: replace the broad old policy rather
-- than adding a narrower policy beside it. Old pedagogical operations retain
-- their contract. Admin receipts require relational owner/actor/domain scope.
DROP POLICY core_actor ON public.study_receipts;
CREATE POLICY core_actor ON public.study_receipts TO ardesia_app
 USING(operation NOT LIKE 'admin.%' AND (SELECT ardesia_private.actor_id()) IS NOT NULL)
 WITH CHECK(operation NOT LIKE 'admin.%' AND (SELECT ardesia_private.actor_id()) IS NOT NULL);
CREATE POLICY register_receipt_read ON public.study_receipts FOR SELECT TO ardesia_app
 USING(actor_id=(SELECT ardesia_private.actor_id()) AND (
  (operation='admin.attendance.recorded' AND EXISTS(SELECT 1 FROM public.study_attendance_records a
     WHERE a.receipt_id=study_receipts.id AND a.recorded_by=study_receipts.actor_id AND ardesia_private.teaches(a.edition_id)))
  OR (operation IN ('admin.manual-payment.recorded','admin.manual-payment.revised') AND EXISTS(
     SELECT 1 FROM public.study_manual_payment_records r WHERE r.receipt_id=study_receipts.id
     AND r.recorded_by=study_receipts.actor_id AND ardesia_private.teaches(r.edition_id)
     AND ((r.revision=1 AND operation='admin.manual-payment.recorded') OR (r.revision>1 AND operation='admin.manual-payment.revised'))))));
CREATE POLICY register_receipt_insert ON public.study_receipts FOR INSERT TO ardesia_app
 WITH CHECK(actor_id=(SELECT ardesia_private.actor_id()) AND (
  (operation='admin.attendance.recorded' AND EXISTS(SELECT 1 FROM public.study_attendance_records a
     WHERE a.receipt_id=study_receipts.id AND a.recorded_by=study_receipts.actor_id AND ardesia_private.teaches(a.edition_id)))
  OR (operation IN ('admin.manual-payment.recorded','admin.manual-payment.revised') AND EXISTS(
     SELECT 1 FROM public.study_manual_payment_records r WHERE r.receipt_id=study_receipts.id
     AND r.recorded_by=study_receipts.actor_id AND ardesia_private.teaches(r.edition_id)
     AND ((r.revision=1 AND operation='admin.manual-payment.recorded') OR (r.revision>1 AND operation='admin.manual-payment.revised'))))));
UPDATE public.study_schema SET version=5 WHERE version=4;
NOTIFY pgrst,'reload schema';
