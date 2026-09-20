# D2 review dossier — 2026-09-21, code `eb7a018d`

Review-only branch. Nothing here modifies the candidate (`TARGET_BRANCH_PUSH=NO`).
Mode: `OPENCODE_PREPARATORY_AUDIT` (builder-family tool; NOT independent Codex review).

## Object under review

- BASE_SHA `b124eee04acc8062c27284f23c5d9108e3767c27` (main, unchanged)
- REVIEWED_CODE_SHA `eb7a018da6f45d05a5aac697829230ac57e79e29`
- REVIEWED_EVIDENCE_HEAD_SHA `ed08ceccdda9f756c35f4013f58dc7e2736fca66`
- REVIEWED_CI_CHECKOUT_SHA `aedec47701d6501db809ebf3462e593449ba742f`
- CI run `35543116608` (5 jobs SUCCESS), artifacts `10614899146` (D2) + `10615068967` (project-state)
- Candidate branch + main verified UNCHANGED at review close (see release-decision.md).

## Files

- `review.json` — machine register: identity, reading manifest, claim matrix,
  findings, negative results, refs. Markdown files are views of it.
- `experiments.md` — probe cards (property, risk, hypothesis, both outcomes,
  command+env, observation, limited conclusion).
- `release-decision.md` — the four distinct answers + integration plan (not executed).
- `next-slices.md` — at most three ordered increments.
- `probes/` — reproducers actually executed (review-only, never imported by product).

## Findings (short)

- H-01 `DEFECT_CONFIRMED` P2: first appendix heading glues to narrative tail
  (no blank line) → literal `##` text instead of `<h2>`. Facts preserved.
  Remedy proposed, NOT applied. Not blocking integration or real use.
- Privacy scope `EVIDENCE_OVERCLAIM→P3`: consumer filters produced A entries;
  lesson-b entries and derived outputs unscanned. Synthetic origin bounds risk.
  Remedy proposed, NOT applied.
- Sandbox OR semantics: DECLARED_LIMITATION, documented, matrix-verified.
  No exploit demonstrated.
- Everything else probed: confirmed or declared-limited (see review.json).
