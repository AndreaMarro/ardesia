# Release decision (four distinct answers)

## TECHNICAL_REVIEW_OPINION = APPROVE (with one P2 + one P3 deferred)

The candidate meets its accepted contracts: single acquisition, fail-closed
metadata, ack-gated confirmation, AST allowlist, publish-only-validated,
live producer→consumer gate in CI, exact-SHA evidence. H-01 (P2 structure)
and privacy-scope precision (P3 docs) do not break persistence, identity,
grounding, or reviewability. Both have minimal remedies proposed and can be
scheduled without invalidating this review's other conclusions, provided the
resulting diff is itself reviewed (it changes product/test files).

## INDEPENDENT_CODEX_REVIEW = NOT_RUN

This dossier is `OPENCODE_PREPARATORY_AUDIT` (builder-family tool).
It does not satisfy the project Codex gate by renaming.

## GITHUB_APPROVAL_REQUIREMENT = UNSATISFIED

Branch protection (read live 2026-09-21): required checks are
`studio (typecheck + test + build)`, `engine (pytest)`,
`hygiene (NUL + secrets + boundary + whitespace)` — all SUCCESS on the
merge checkout. Additionally required: 1 approving review
(`require_last_push_approval: true`), `enforce_admins: true`, conversation
resolution. GitHub Reviews on #256: 0. The d2 lane is informative, not
required. CodeRabbit shows `pass / Review skipped: draft` — not a review.

## REAL_USE_VALIDATION = NOT_RUN

Five synthetic cases prove feasibility; didactic quality, correction burden
and learning outcomes require the authorized pilot with Andrea. The pilot
protocol sheet below is ready, not executed.

## Integration plan (NOT executed)

1. Prerequisites: Codex review outcome (no blockers or repaired+reverified);
   pilot human fields filled; base `main` re-verified unchanged
   (currently `b124eee0`); protections re-read (do not reuse this read).
2. Actor: owner-authorized merge only (enforce_admins is on; no agent merge).
3. Gates: the 3 required checks + d2 lane + fresh artifact on the merge
   commit, per this dossier's commands.
4. Post-merge verification: CI on main HEAD (not inferred from PR CI);
   smoke bundle→PDF on main checkout.
5. Rollback: revert the merge commit (no main rewrite); stacked PRs stay
   open until consolidation is separately decided.
6. Historical PRs: close only after merge + evidence links preserved;
   never merge #248 whole (66-commit scope vs 2-commit review scope).
7. Pilot trigger: authorized material → observation sheet → measured
   correction burden → MCP read-only contract only after.

## Pilot observation sheet (ready, not executed)

- case + authorized provenance
- input available (formats, sizes, snapshot presence)
- classes supported / unsupported (text, math, exercises, errors, tables, audio, images)
- provider + model actually used (mock until authorized real provider)
- first uncorrected output version (stored, not judged here)
- scientific errors found by teacher
- critical omissions / unsupported additions
- measured correction minutes + actual manual interventions
- provenance usefulness for disputing/correcting
- approved final version, if any
Separate always: readable / citations-resolve / physics-correct / student-learned.
No private transcripts in GitHub. No automatic corpus reads.
