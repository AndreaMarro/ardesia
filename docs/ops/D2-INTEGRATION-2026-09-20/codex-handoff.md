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

## Packet B — integration hypothesis (current)

- Main base b124eee0, CODE_CANDIDATE_SHA + EVIDENCE_HEAD_SHA in ledger
  (resolve evidence head from PR #256 head; ledger carries code SHA +
  runtime pointers, never self-SHA).
- Causal graph + matrix (64 commits, 0 merges); ONE minimal producer
  prerequisite ported as property (ack #246: RED/GREEN/mutation on
  candidate); everything else excluded with proof.
- F246 verdict: USER_ACTION_TO_MATERIAL PARTIAL globally (ElabLab mark PASS
  post-fix, was FAIL pre-fix, observed RED; Simulation success-timing append
  window documented without fix, no global flush — see
  `docs/ops/D2-INTEGRATION-2026-09-20/post-adversarial-repair.md` claim matrix). Persisted-state verdict PASS
  throughout.
- Source semantic diff: file result IDENTICAL (frozen pre-repair comparison
  `SOURCE_HEAD(7af8f51c)` vs candidate-B; post-repair ONE expected F-03
  blank-line markdown diff, capsule/digest/manifest/segments identical).
- Live producer CI gate (`d2-integration-evidence` job): current Studio
  exportLesson → current Engine on exact bytes → synthetic artifact
  (`d2-integration-evidence-<sha>`); fixture freshness enforced
  (commitSha-normalized manifest + entry payload compare).
- Mutation evidence: R1/R2/UUID-path/%%EOF/fixture-tamper/emit-increment,
  all caught, all restored.
- Full gates: engine 2213/7/0; typecheck clean; build green; D2 specs +
  durability suite green; full vitest only pre-existing env reds.
- Artifact ids/digests: PR body + #249 FINAL (runtime records).
- Exact CI: PR #256 checks tab (do not reuse 35539330655 for the new head).

## Adversarial question for Codex

> Cerca un controesempio alla claim che PR #256 sia il minimo candidato
> sufficiente per preservare, senza false conferme e senza perdita
> silenziosa, la catena:
>
> teacher action → persisted LessonOS fact → Studio exportLesson →
> canonical `.lesson` → Engine → grounded material → PDF.
>
> Verifica in particolare:
> - temporal durability;
> - fixture freshness;
> - excluded hidden commits;
> - source-vs-candidate semantic drift;
> - vacuous green tests;
> - duplicated authorities;
> - evidence-pack overclaims.

Non chiedere semplicemente "is this good?" — falsifica, non approvare.

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
