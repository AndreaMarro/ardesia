# Unit R-01 — canonical study digest, 2026-09-21

Written after the frozen independent D2 verdict, before product edits.
Frozen review SHA-256: `baf2e41dedcf42238b89f1a4e194631b50190d37438ffd1a9bc4da532e2e41df`.

- Objective: a lesson's study material contains only that lesson's canonical
  pedagogical facts, including after navigation or read failure.
- Symptom: overlapping lessons leak B's concept into A's HTML with or without
  `lesson.started`; failed navigation can retain A's digest in B.
- Invariant: scope by canonical `lessonId` before projection; never infer identity
  from timestamps, adopt unassigned legacy facts, or reuse an obsolete read.
- Product files: `apps/studio/src/RecapView.tsx` and
  `apps/studio/src/lessonos/studyDigest.ts`; focused UI and digest regression tests.
- RED: three semantic failures in `PostLessonCanonical.test.tsx` (frozen copy
  `codex-restart-review-probe.tsx.txt`), plus Chromium rendering/download showing
  B inside A. The legacy recap fixture is explicitly a seam around R-02.
- GREEN: overlapping/no-start isolation; empty/unassigned logs stay empty;
  failure/late resolution cannot retain another lesson; read handles close on
  failure; canonical projector preserves evidence and ignores advisory events.
- Negative control: deliberately replace the scoped query with all envelopes;
  isolation tests must fail. Restore exact bytes before regression/build.
- Non-goals: R-02 journal path/v2 parsing, R-03 live export wrapper, Simulation
  global flush, new document model, provider changes, public release or pilot.

The donor `c0a8ec41` supplies the existing adapter pattern, not a wholesale
cherry-pick. Its missing lifecycle reset/cleanup is addressed in this unit.
The historical temporal helper has no other production consumers and is removed.
New patch review status remains `INDEPENDENT_REVIEW_PENDING`.
