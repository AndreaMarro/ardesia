# Unit R-02 — recorder to lesson recap, 2026-09-21

Preregistered before product edits, after the owner's “vai” on the next R-02
action. Local base: `92a3bf6e5d8f2831a7e7b8d6a70df8f168682cf7`; R-01 already
has an independent patch-only approval, which does not cover this new unit.

- Objective: recap and downloaded HTML consume the actual room's recorder bytes.
- Symptom: the global journal is read instead of the room journal; V2 envelope
  fields are ignored. A global legacy journal can contaminate a named lesson.
- Invariant: read only the selected room's journal. Validate physical V2 with
  the existing canonical decoder, including source identity and duplicate checks;
  use its projection. Never downgrade an invalid V2 row to legacy. Preserve the
  existing tolerant aggregation of genuine legacy rows in that room (including
  missing timestamps, which must not contribute to duration).
- Product scope: `apps/studio/src/store/lessonRecap.ts`. Tests: existing legacy
  suite migrated to the per-room path without weakening its assertions; new
  actual-recorder regressions. No recorder, decoder, gate or schema changes.
- RED before implementation: actual producer A/B with overlapping times, global
  contamination, V2 format, foreign identity and malformed V2 rejection.
- GREEN: formulas, element counts, observed PDF pages and duration match actual
  producer bytes; imported pages alone do not become observed pages. Mixed
  legacy/V2 is supported; malformed V2/foreign identity/duplicates fail closed.
- Negative controls: restore the global path, then remove V2 decoding, separately.
  The focused regression must reject each mutant; restore exact bytes afterward.
- Browser: actual recorder A/B → recap → downloaded HTML, without the legacy
  visibility seam used for R-01. Only synthetic data; verify both identities.
- Regression: focused suites, full deterministic Node 22 suite, typecheck/build,
  frozen gate with the explicitly documented Node 26 Web Storage process option.
- Non-goals: R-03 live export, R-04 release claims, new IR/store/pipeline, provider
  changes, real pilot, remote writes, publication or integration.

New patch status: `INDEPENDENT_REVIEW_PENDING`. Local receipts only;
`INDEX_SYNC_DEFERRED`; no vault or AgentMemory access.
