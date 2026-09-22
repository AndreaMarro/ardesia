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
- CODE_CANDIDATE_SHA: in `integration-ledger.json` (product+test commits;
  resolve evidence head from PR #256 head; runtime from Actions/#249 FINAL)
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
  semantic differential (file result IDENTICAL: frozen pre-repair comparison,
  see per-field verdict below for the expected F-03 markdown diff)
- Studio-production synthetic vertical (real exportLesson bytes →
  real Engine compose → PDF, A/B isolation)
- Durable cross-boundary gate (text-only Studio fixtures, no binaries)
- Live CI lane `d2-integration-evidence` (current producer → current
  consumer → synthetic artifact; first exact-head run pending at
  docs-commit time — resolve from PR #256 checks)
- Provider root-cause diagnosis (Kimi 404 → LOCAL_CONFIGURATION, no code fix)
- MCP readiness (research only), Kirchhoff reuse notes, stack disposition
- Codex handoff packets A/B/C

## Three verdicts + authority (refined: no collapsed continuity claim)

- ENGINE_TRANSPLANT_COMPATIBILITY: PASS on rehearsal gates; new exact-head
  CI pending at docs-commit time (resolve run from PR #256 checks tab).
- PERSISTED_STATE_TO_MATERIAL: PASS (production exportLesson bytes consumed
  by production compose; quality review pending human, NOT claimed).
- USER_ACTION_TO_MATERIAL: PARTIAL (scoped: ElabLab mark PASS post ack-port
  — RED pre-fix observed on this candidate: UI "1" with empty log/export;
  emit-increment mutation RED. Global claim NOT made: Simulation
  success-timing append window still pending, see `post-adversarial-repair.md`
  claim matrix; no global flush introduced).
- SOURCE_HEAD_SEMANTIC_EQUIVALENCE: PASS per-field (capsule/digest/manifest/
  segments identical; SummaryPack markdown carries the ONE expected F-03
  blank-line diff that makes appendix headings structural, see
  `post-adversarial-repair.md`. `semantic-diff.json` is the frozen
  pre-repair comparison at `SOURCE_HEAD(7af8f51c)` vs candidate-B, kept as
  historical observation, not rewritten post-repair).
- SINGLE_AUTHORITY_MATERIAL_PIPELINE: PASS (table in collision/audit evidence;
  producer = Studio exportLesson; persisted source = room journal + event
  log; canonical format = .lesson + manifest; consumer root = compose;
  projector = lessonos_snapshot; generator = summarizer;
  review boundary = inspectable material; exporter = browser_pdf).

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

## CI / artifact (runtime evidence lives outside versioned files)

- Exact-head CI run, merge checkout, and both artifacts
  (`project-state-*`, `d2-integration-evidence-*`): resolve from PR #256
  checks tab + issue #249 FINAL. The ledger carries pointers, not copies.
- Prior source-head CI: run 35539330655 SUCCESS (exact head 6cd63abe).

## Known unknowns

- Real-lesson didactic quality: pilot human review pending.
- Live provider path: endpoint unusable from here; separate debt lane.
- ChatGPT developer-mode eligibility for this workspace: not verified.
