# Post-adversarial repair — ChatGPT REQUEST_CHANGES closure

- Review source: independent adversarial review (REQUEST_CHANGES, F-01..F-07).
- Old code SHA: `eb7a018da6f45d05a5aac697829230ac57e79e29`.
- New code SHA: `d2bc13df9b7bfde1dafffa50702d3088f26e4a92`
  (5 repair commits on `integration/d2-lesson-material-20260920`, no force).
- Evidence head: resolved from PR #256 head after push (see #249 FINAL).

## F-01 — live canonical export must fail visible (P1) — CLOSED

- RED: Case A (stored old + live throws → exported old), Case B (no stored
  + live throws → succeeded without LessonOS), Case C (stored old + live
  empty → resurrected old). Happy-path (live facts win) green throughout.
- FIX (`lessonBundle.ts`, `lessonBundleManifest.ts`): live log supplied ⇒
  authoritative. Read failure propagates (no catch); empty live result ships
  WITHOUT the file + `missing` status with explicit live-empty warning
  (new optional `lessonOsWarnings` param, default preserves legacy).
  Legacy/no-log path untouched.
- MUTATION: restored catch-fallback → Cases A/B RED (C unaffected by design:
  mutant only restored throw-fallback). Restored byte-identical.
- Case D (UI): characterization guard — export rejection already surfaces
  via existing `run()` catch (no download, visible error); added test locks it.
  Locally env-blocked with the 8 pre-existing localStorage failures of that
  file (identical on pristine main); CI judges.

## F-02 — simulation append rejection visible (P1) — CLOSED

- RED: focused test on the seam (reject → no diagnostic).
- FIX (`Room.tsx` + new pure `lessonos/reportAppend.ts`): rejection routes
  to existing `setStorageError` surface; success stays silent. No new bus,
  toast, or coordinator. Existing Room integration suite green.
- MUTATION: swallow restored → RED. Restored byte-identical.

## F-03 — appendix heading structure (P2) — CLOSED

- RED: Pandoc-AST tests (skip cleanly when pandoc absent). Key subtlety
  found during review: ONLY the first appendix section can glue; later
  sections follow blank lines. Initial tests were vacuous for 2/3 cases
  (passed unfixed) — rewritten to isolate each possible FIRST section
  (solutions/errors/concepts), each proven non-vacuous by mutation.
- FIX (`summarizer.py`): blank separator before non-empty appendix only;
  wording and legacy byte-identity untouched.
- MUTATION: separator removed → all 3 RED. Restored byte-identical.

## F-04 — stale recordError (P2) — CLOSED

- RED: fail-then-succeed sequence leaves the old alert visible (new test).
- FIX (`ElabLab.tsx`): clear `recordError` on successful `onRecorded`.
  No new state machine.
- Existing failure-display test still green.

## F-05 — artifact privacy scope (P3) — CLOSED as specified

- Widened consumer gate: lesson-b entries + derived text outputs
  (summary md/txt, html) scanned before upload, in addition to lesson-a
  entries. PDF bytes derive from scanned text (documented boundary, not a
  general DLP). Reserved test contacts (`test.person@example.invalid`,
  `+39 000 000 0000`) verified RED through the real gate function (5/5).
- E2E tamper (PII-seeded bundle) correctly fails EARLIER at freshness
  (integrity before content scan) — ordering documented, not a bypass.

## F-06 — duplicate manifest path parity (P3) — CLOSED

- RED: duplicate `files[].path` with undoubled payload accepted.
- FIX (`ingest/bundle.py`): reject duplicates, mirroring Studio's
  `path duplicato` rule (verified present in `lessonBundleManifest.ts`).
- No other manifest redesign.

## F-07 — private-helper coupling — DEFERRED_P3

- `d2_evidence_consume.py` imports `_build_summary_prompt` /
  `_cited_seg_texts` solely to key deterministic MockProvider fixtures,
  mirroring existing test precedent. No public seam exists that removes
  the coupling trivially; making them public would expand API surface.
  Left as-is per YAGNI.

## Claim matrix after repair

- CANONICAL_LIVE_EXPORT_FAILURE=FAIL_VISIBLE (A/B RED→GREEN; C guarded)
- ELAB_MARK_ACTION_TO_MATERIAL=PASS (race + marcatura suites)
- SIMULATION_ACTION_TO_LESSONOS=PASS (reject→diagnostic proven; success
  silent-correct; in-flight read-timing window documented WITHOUT fix:
  export can miss a still-pending append, the fact lands and later exports
  include it, no false confirmation exists on that path — reproducer run,
  probe deleted, no global flush per YAGNI)
- PERSISTED_STATE_TO_MATERIAL=PASS
- GLOBAL_USER_ACTION_TO_MATERIAL=PARTIAL (ElabLab mark PASS; simulation
  success-timing window documented — no silent loss, no false claim)
- SOURCE_D2_SEMANTIC_EQUIVALENCE=PASS (one EXPECTED diff: F-03 blank line;
  capsule/digest/manifest/segments identical)
- APPENDIX_STRUCTURE=PASS (AST-proven, non-vacuous)
- ARTIFACT_PRIVACY_SCOPE=PASS (A+B entries + derived texts scanned;
  heuristic scope documented, synthetic origin bounds risk)
- MANIFEST_CONTRACT_PARITY=PASS (duplicate rejected both sides)

## Full gates (this head)

- Engine: 2219 passed / 7 skipped / 0 failed (local deterministic).
- Studio typecheck: 0 errors.
- Studio targeted: 56 passed (live-snapshot, append-diagnostic, race,
  producer, bundle).
- Studio full: 2136 passed + 23 failed, all 23 in the 5 pre-existing
  env-blocked files (22 historical + Case D blocked by the same
  file-level localStorage setup crash; behavior-pending CI).
- Studio build: clean (no errors).
- Live producer→consumer gate: EVIDENCE-OK (re-run post-repair).
- A/B isolation: bilateral at bundle level; SUMMARY_ISOLATION_A_ONLY.

## Known unknowns

- Case D green status pending Linux CI (env-blocked locally with
  pre-existing file failures).
- Didactic quality: human review pending (unchanged).
- Live provider: separate debt lane (unchanged).
