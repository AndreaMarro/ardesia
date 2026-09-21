# Independent Codex review — frozen before implementation

VERDICT=APPROVE **for the bounded D2 `.lesson → Engine → inspectable pack → PDF` candidate**.
FULL_POST_LESSON_WORKFLOW_READY=NO. This does not approve the subsequent patch,
a merge, deployment, paid model use, or real lesson pilot. No GitHub review submitted.

## Identity and reconciliation

- Frozen at: 2026-09-21T16:46:20.158751+00:00; reviewer: Codex, GPT-6 family;
  exact model/effort `inherited/unknown`. Builder of candidate: other session/tool.
- Remote: `https://github.com/AndreaMarro/ardesia.git`.
- Source checkout `/Users/andreamarro/VOLUME 3/ardesia`: branch
  `fix/246-durabilita-eventi`, HEAD `fba5d035c73bc5ca41deb8b4877ac6bf33b5a057`,
  64 ahead/1 behind main, existing dirty/conflicted state; untouched.
- Own worktree `/Users/andreamarro/VOLUME 3/ardesia-codex-restart-20260921`,
  branch `codex/restart-review-postlesson-20260921`.
- BASE/main: `b124eee04acc8062c27284f23c5d9108e3767c27`.
- PRODUCT_CANDIDATE: `b7f75e9d40ab063d0851f1cc6882e68e993edf47`.
- REVIEW/EVIDENCE_HEAD: `705284acc4322db4d241032de071437ab0473cc1`.
  Difference from product SHA: only `integration-ledger.json`.
- PR #256 remains OPEN/DRAFT; 0 submitted reviews, 0 review threads.
- CI run `35549971310` succeeded; actual checkout in logs:
  `29c3067e59c2f96338e427a8f9a7bde9c54e623d` (synthetic merge).
  Run metadata head is 705284ac; this is NOT exact-head execution.
- Served production SHA measured separately through build markers in both JS
  assets: `b124eee04acc8062c27284f23c5d9108e3767c27`. Python state generator had
  a CA-chain error; verified TLS curl transport succeeded, no TLS bypass.
- Every prior worktree belongs to another task. No stash/reset/clean/fetch/push.

## Findings and disposition

All paths/lines below refer to REVIEW_HEAD, not the future patch.

| ID | Evidence | Expected → observed / proof | Impact / severity / origin | Disposition / destination |
|---|---|---|---|---|
| R-01 | `apps/studio/src/RecapView.tsx:54`, `lessonos/studyDigest.ts:72` | Only A's facts → B enters A's preview/download with overlapping times and without starts; prior digest survives failed B read | P1 confidentiality/correctness, **inherited**, these files are byte-identical to main | BLOCK real recap pilot; select one unit: identity-scoped digest + lifecycle |
| R-02 | `apps/studio/src/store/lessonRecap.ts:48`, `:65`, `:107`; producer `JournalRecorder.ts:467`, `:705` | Read recorder A → flat foreign formula or empty. Independent parser test feeds actual v2 bytes at both paths and still returns no formula | P2 core workflow unusable, **inherited**, not caused by #256 | DEFER to subsequent recorder-to-recap unit; no path-only donor cherry-pick |
| R-03 | `apps/studio/src/RecapView.tsx:86`; `design/SavedLessonsView.tsx:172`; `store/lessonBundle.ts:184` | Recap export uses live facts → `.lesson` omits current memory because caller supplies no live log | P2 silent material omission, **inherited caller debt**; D2 fixes supplied-live semantics | DEFER to subsequent export-authority unit; retain explicit historical export |
| R-04 | `.github/workflows/ci.yml:115`; `README.md:53`; `integration-ledger.json`; `exclusions.md:24` | Scoped/current claims → D2 called required but protection requires only studio/engine/hygiene; README overstates user-action PASS; ledger equivalence omits repaired F-03 change; ack both included/excluded | P2 evidence overclaim introduced in candidate documentation | DEFER documentation reconciliation before release decision; authoritative narrower claims in this receipt |

P0: none found. Introduced P1: none found in reviewed D2 boundary. R-01 remains
an inherited P1 pilot blocker; the D2 approval must not be used as whole-product
approval. R-02/R-03 are separate work units, not silently included in the patch.

## Executed evidence

Logs and command/exit records: `artifacts/restart/commands.jsonl` (local,
gitignored). The kept review probe is `codex-restart-review-probe.tsx.txt`:
copy to `apps/studio/src/__tests__/PostLessonCanonical.test.tsx` in a separate
review worktree at REVIEW_HEAD, run Vitest, then remove only that temporary copy.

| Execution | Result |
|---|---|
| `uv sync --locked`; `npm ci --no-audit --no-fund` in isolated packages | exit 0; lockfiles unchanged |
| `uv run --locked pytest -q -rs` (credentials removed from child env) | exit 0; 2219 passed, 7 skipped |
| `node node_modules/vitest/vitest.mjs run --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000 --reporter=json` | exit 0; 2159 passed, 5 skipped, 0 failed, 2164 total |
| `npm run typecheck`; `npm run build` after restoring mutations | exit 0; build size warnings only |
| Same deterministic Vitest command restricted to `PostLessonCanonical.test.tsx` | exit 1; **7 semantic REDs**: path, v2 format, unassigned legacy, overlap, absent start, stale state, omitted live export |
| D2EvidenceProducer with D2_EVIDENCE_OUT; `uv run --locked --project packages/engine python packages/engine/bin/d2_evidence_consume.py` | both exit 0; actual export bytes → compose → 1-page PDF parsed by pdfinfo/pdftotext; model-only MockProvider |
| Restore F-01 fallback mutation, existing live-snapshot tests | exit 1; 2 rejected-read assertions catch mutant; byte-identical restore |
| Remove F-03 blank separator, `pytest -q tests/test_summarizer.py` | exit 1; 3 structural Pandoc assertions catch mutant; byte-identical restore |
| Privacy contact injection into real privacy_gate | 5/5 rejected; heuristic, not general DLP |
| `node artifacts/restart/browser-proof.mjs red` | exit 0 confirming defect in actual Chromium 148; recorder-only recap empty; with explicit synthetic legacy seam, A preview and downloaded HTML contain B |

Initial probe setup had a missing fake-driver method and a parent-DOM assertion
against iframe text; corrected before semantic RED. An added probe also had an
incorrect test-only method signature caught by TypeScript; corrected, then build
rerun. A privacy probe initially used system Python without networkx; rerun using
the locked Engine venv. These are setup failures, not product findings. One build
overlapped a temporary mutation and is not counted; restored build rerun succeeded.

Engine skip breakdown: 4 live-provider tests (unauthorized), 2 external canonical
repo drift checks (checkout absent), 1 private corpus style check (absent).
Studio: 5 pre-existing skips. Current run has **no** historical localStorage reds;
no pre-existing-failure exemption or main reproduction was needed.
CI Linux: 2217 Engine passed/9 skipped (two filesystem-specific extra skips),
2159 Studio passed/5 skipped, golden path 1 passed. Golden path remains advisory.
D2 executes but is not branch-protection-required. CodeRabbit draft skip is not review.

## Semantic assessment and limits

F-01 live throws/empty/stale and F-04 late alert/ack cases run through existing
suites; F-02 seam plus Room suites execute. Simulation pending append is a known
capture-time window, not a global user-action PASS; no global flush introduced.
F-03 is AST structural, not string-only. F-06 duplicate paths are rejected in both
readers and tested. Fixture privacy checks cover A/B and derived text, not real PII.

Compose validates selected identity/digest before store/router effects and reads
one BundleContents. Ingest shares one seam and compensates segment/capsule failures;
summary/PDF are not inside that compensation, concurrent isolation/power-loss
atomicity are not established. Summary citations validate excerpts, not physics.
Unsupported audio/handwriting/images do not become text. PDF tests cover hostile
AST/resources/metadata/CSP and preserving previous PDF on renderer/validation
failure. Real local renderer ran sandboxed; CI explicitly opts out for synthetic
inputs. HTML/PDF publication is not a two-file transaction; pdfinfo-absent gate is
weaker by design. Mac-specific discovery and private test-helper coupling remain
bounded limitations, not new abstractions to fix in this unit.

Browser plugin/skill unavailable; regular installed Playwright used. No page errors
or Vite overlay. One inherited console message: sandbox blocks the recap iframe's
inline print handler; downloaded HTML is the separate printable artifact.
No real lesson, no paid provider call, no scientific-quality validation. Kimi
presence-only probe confirms key present and override suffix `/anthropic`, not
`/v1`; historical endpoint mismatch is still configured, live HTTP not retried.

MERGE=NOT_PERFORMED; DEPLOY=NOT_PERFORMED; REAL_PILOT=NOT_RUN.
Next authorized builder unit: R-01 only. Its result requires a new independent
review; this approval cannot cover self-authored code.
