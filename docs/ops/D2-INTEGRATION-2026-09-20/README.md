# D2 integration evidence pack — 2026-09-20

## Purpose

Durable, GitHub-reviewable evidence that the D2 lesson-material vertical
(`.lesson` → Engine → SummaryPack → PDF) transplants onto current `main`
without hidden producer prerequisites, with producer/consumer parity
proven on production bytes, and with the remaining work itemized for
independent Codex review. No merge, no deploy, no MCP runtime.

Labels used in this pack: OBSERVED (measured), INFERRED (reasoned from
measurements), PROVEN (red+green+mutation or exact-SHA gate), NOT_PROVEN
(open), DEFERRED (explicitly out of scope).

## Observed SHAs

- OBSERVED current main: `b124eee04acc8062c27284f23c5d9108e3767c27`
- OBSERVED source PR255 head: `7af8f51ca958f395544af79f0a39cbc3d03c82c7`
- CODE_CANDIDATE_SHA: `29d66bd3...` (product+test commits; see ledger)
- EVIDENCE_HEAD_SHA: recorded in ledger after the docs-only commit
- Candidate branch: `integration/d2-lesson-material-20260920`
- Merge base: `751bcb305e78647ac3c7405254492c637ab753d4`
- D2 boundary parent: `fba5d035c73bc5ca41deb8b4877ac6bf33b5a057`
  (PROVEN ancestor of D2 head via `git merge-base --is-ancestor`)

## Scope

- 64-commit pre-D2 forensic audit (inventory + causal graph + exclusions)
- Producer falsification probes (digest scoping, room journal, write ack,
  LessonOutcome necessity) with verdicts
- Candidate A rehearsal (main + D2-only, 20/20 clean cherry-picks) + gates
- Clean Candidate B + main-only preservation proof + source-vs-candidate
  semantic differential (IDENTICAL)
- Studio-production synthetic vertical (real exportLesson bytes →
  real Engine compose → PDF, A/B isolation)
- Durable cross-boundary gate (text-only Studio fixtures, no binaries)
- Provider root-cause diagnosis (Kimi 404 → LOCAL_CONFIGURATION, no code fix)
- MCP readiness (research only), Kirchhoff reuse notes, stack disposition
- Codex handoff packets A/B/C

## Three verdicts + authority

- ENGINE_TRANSPLANT_COMPATIBILITY: PASS (20/20 picks, engine 2212/7/0,
  typecheck/build green, D2 specs 99 green; full vitest shows only the 22
  pre-existing env failures proven identical on pristine main)
- STUDIO_TO_MATERIAL_CONTINUITY: PASS on production bytes (isolation
  assertions green; didactic quality pending human review, NOT claimed)
- SOURCE_HEAD_SEMANTIC_EQUIVALENCE: PASS (semantic diff IDENTICAL across
  manifest/segments/digest/capsule/summary)
- SINGLE_AUTHORITY_MATERIAL_PIPELINE: PASS (table in collision/audit evidence)

## Evidence files

- `integration-ledger.json` — machine-readable record (this README's claims)
- `pre-d2-causal-matrix.md` — 64-commit inventory with categories
- `pre-d2-causal-graph.json` — causal nodes/edges (machine-readable)
- `exclusions.md` — per-commit non-inclusion proof or technical reason
- `semantic-diff.json` — source-vs-candidate differential (IDENTICAL)
- `provider-diagnostic.md` — Kimi 404 classification + contract test
- `mcp-readiness.md` — official sources, separation, schemas, threats
- `kirchhoff-reuse.md` — BORROW / DO_NOT_BORROW / FUTURE
- `codex-handoff.md` — packets A/B/C + adversarial question
- `stack-disposition.md` — PR #248–#255 roles and close conditions

## CI / artifact

Recorded in the ledger after the draft-PR exact-head run (run id, checkout,
artifact id/digest/expiry). Prior source-head CI: run 35500500310 SUCCESS.

## Known unknowns

- Transplant execution proof beyond rehearsal gates: pending draft-PR CI.
- Real-lesson didactic quality: pilot human review pending.
- Live provider path: endpoint unusable from here; separate debt lane.
- ChatGPT developer-mode eligibility for this workspace: not verified.
