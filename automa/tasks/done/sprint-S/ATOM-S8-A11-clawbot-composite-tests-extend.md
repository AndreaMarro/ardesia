---
id: ATOM-S8-A11
sprint: S-iter-8
priority: P0
owner: gen-test-opus
phase: 1
deps: [ATOM-S8-A6]
created: 2026-04-27
---

## Task
Extend ClawBot composite tests `scripts/openclaw/composite-handler.test.ts` with 5 NEW live test cases (was 5 PASS iter 6 → target 10 PASS iter 8).

## Acceptance criteria
- [ ] CoV vitest 12599+ PASS preserved + 5 NEW composite tests GREEN (target 10 total composite tests PASS)
- [ ] build PASS exit 0 (defer if heavy)
- [ ] file ownership respected — write ONLY `scripts/openclaw/composite-handler.test.ts` + `automa/team-state/messages/gen-test-*.md`
- [ ] 5 NEW test cases:
  1. live wire-up postToVisionEndpoint real (mock fetch) — assert structured topology response
  2. composite 3-tool sequence highlight→speak→camera success path
  3. composite mountExperiment→analyze→suggest with cache hit (TTL 24h)
  4. composite vision describe→diagnose→speak with PZ v3 warning emitted (warn-only)
  5. composite RAG retrieve→synthesize→tts with hybrid retriever (mock hybridRetrieve)
- [ ] Test runner `vitest.openclaw.config.ts` (existing iter 6)
- [ ] Existing 5 tests iter 6 still PASS (no regression)
- [ ] PRINCIPIO ZERO + MORFISMO compliance: test assertions verify plurale "Ragazzi,", citazioni Vol/pag in mock responses

## Output files
- `scripts/openclaw/composite-handler.test.ts` (MODIFIED, +5 test cases, ~150-250 LOC additions)
- `automa/team-state/messages/gen-test-opus-iter8-to-orchestrator-2026-04-27-<HHMMSS>.md` (completion or batched A5/A7/A8)

## Done when
`npx vitest run -c vitest.openclaw.config.ts scripts/openclaw/composite-handler.test.ts` exits 0 with 10 PASS minimum.
