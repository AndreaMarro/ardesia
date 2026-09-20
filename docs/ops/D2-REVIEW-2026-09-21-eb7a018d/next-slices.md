# Next slices (at most three, ordered, conditional on proofs)

## 1. H-01 repair + privacy-scope precision (only after review decision)

- Problem: first appendix heading glues to narrative tail (literal `##`);
  privacy gate skips lesson-b entries and derived outputs.
- Evidence: E3 + privacy inventory in this dossier.
- Files: `packages/engine/lessonos/summarizer.py` (blank-line join),
  `packages/engine/bin/d2_evidence_consume.py` (extend gate),
  tests for both (structural H2 assertion, NOT marker search).
- Acceptance: artifact-style markdown renders 3 semantic H2s; gate fails
  closed on a PII-seeded synthetic fixture (reserved test contacts only).
- Non-goals: renderer redesign, wording changes beyond the join, new features.
- Permissions: builder session authorized by owner AFTER Codex packet B.
- Stop: if the diff touches anything beyond these two units + tests.

## 2. First authorized real use (owner-gated)

- Problem: synthetic feasibility ≠ didactic utility.
- Evidence needed: pilot sheet (release-decision.md) filled by Andrea on
  authorized material; measured correction minutes.
- Stop: at observation. No product change inside this slice.

## 3. Read-only application contract for MCP (owner-gated)

- Problem: no callable contract exists yet.
- Evidence: mcp-readiness + lesson-recall seed + threat matrix.
- Acceptance: explicit principal derivation design (no `teacher_id` from
  model), headless `lesson_recall` behavior on fixtures, no runtime.
- Non-goals: server, OAuth, tunnel, submission, UI.
- Stop: before any transport code.
