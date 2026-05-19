-- iter 73 STEP 5b temp fix: drop student_album_teacher_shared_select policy.
-- Root cause: policy JOIN class_students triggers PRE-EXISTING infinite recursion
-- in class_students RLS (Postgres error 42P17). Every student_album SELECT
-- cascades RLS evaluation → recursive class_students lookup → HTTP 500.
--
-- Impact: BG-A6 Album wire-up iter 72 STILL broken post 20260517100000 schema
-- apply. Defensive catch error continued masking real issue. Drop teacher-share
-- policy unblocks student own-fetch (own select + insert + update preserved).
--
-- Defer iter 74+ P0: audit class_students RLS upstream fix + restore
-- teacher-share policy with security-definer function bypassing recursion.

DROP POLICY IF EXISTS student_album_teacher_shared_select ON student_album;
