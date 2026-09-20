# Codex handoff — independent adversarial review (NOT a self-review)

Reviewer and builder must be distinct. Muse self-review is recorded
separately and is never presented as independent.

## Packet A — PR255 vertical

- REPO=AndreaMarro/ardesia, BASE=dfb801cf, HEAD=7af8f51c
- OBJECTIVE: review the D2-J3C vertical proper.
- REVIEW: browser-PDF trust boundary (argv/staging/publish/CSP/metadata),
  composition root (identity-first, single acquisition), ingest shared seam,
  snapshot projector + digest retention, SummaryPack appendix grounding,
  tests + mutation controls, input trust policy, publish policy, known limits
  (macOS-bounded discovery, Chromium metadata variance, pdfinfo-open gate,
  script needs owner runtime, no audio/image traversal).
- DO NOT REVIEW: integration with main as if proven, MCP, audio/image
  roadmap, marketplace.

## Packet B — integration hypothesis

- Main base b124eee0, CODE_CANDIDATE_SHA + EVIDENCE_HEAD_SHA in ledger,
  causal graph + matrix, included prerequisites (NONE — exclusion proofs),
  excluded commit matrix, source→candidate lineage (20 cherry-picks with
  `-x`), source-head differential (IDENTICAL), three verdicts,
  single-authority verdict, full gates, artifact id/digest.
- ADVERSARIAL QUESTION: seek a counterexample to the thesis that this is
  the minimum sufficient set for Studio → LessonOS → `.lesson` → Engine →
  material → PDF. Hunt excluded semantic dependencies, vacuous tests,
  identity drift, data loss, duplicate authorities. Do not merely approve.

## Packet C — MCP readiness

- Official current MCP/OpenAI facts (see mcp-readiness.md), existing
  grounded-memory logic vs legacy shell, auth/authz gap, Product vs DevOS
  separation, lesson_recall draft + outputSchema, threat matrix,
  no-runtime decision (research only).

## Review receipt template (for Codex to fill, not pre-filled)

- BASE_SHA / CODE_CANDIDATE_SHA / EVIDENCE_HEAD_SHA
- REVIEWER_TOOL_MODEL / REVIEW_DATE
- P0 / P1 / P2 / P3 findings
- ADVERSARIAL_CASES / FALSIFIED_ASSUMPTIONS / RESIDUAL_RISKS
- VERDICT = APPROVE | REQUEST_CHANGES
