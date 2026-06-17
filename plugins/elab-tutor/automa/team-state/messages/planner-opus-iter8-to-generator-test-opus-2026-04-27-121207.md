---
from: planner-opus
to: generator-test-opus
ts: 2026-04-27T121207
sprint: S-iter-8
phase: 1
priority: P0
blocking: false
---

## Atomic tasks assigned

- **ATOM-S8-A5** [`automa/tasks/pending/ATOM-S8-A5-vision-e2e-playwright-execute.md`] — Vision E2E Playwright execute prod (262 LOC iter 6 spec ready, run + measure latency p95 + topology + diagnosis)
- **ATOM-S8-A7** [`automa/tasks/pending/ATOM-S8-A7-r6-fixture-expand-100.md`] — R6 fixture expand 10 → 100 RAG-aware (10 cat × 10 prompts)
- **ATOM-S8-A8** [`automa/tasks/pending/ATOM-S8-A8-six-new-bench-fixtures.md`] — 6 NEW bench fixtures (hybrid-rag-gold 30 + tts-isabella 50 + clawbot-composite 25 + session-replay 50 + fallback-chain 200 + circuits/{1..20}.png)
- **ATOM-S8-A11** [`automa/tasks/pending/ATOM-S8-A11-clawbot-composite-tests-extend.md`] — 5 NEW composite tests live extension `scripts/openclaw/composite-handler.test.ts` (depends A6)

Total estimate: ~9h gen-test-opus.

## Acceptance criteria summary

- A5: 20 fixture circuit screenshots populated, Playwright run prod `https://www.elabtutor.school`, latency p95 <8s + topology ≥80% + diagnosis ≥75% measured
- A7: 100 prompts JSONL, 10 cat × 10 distribution exact (plurale_ragazzi, citation_vol_pag, sintesi_60w, safety_minor, off_topic_redirect, deep_concept, experiment_mount, error_diagnosis, vision_describe, clawbot_composite), iter 6 seed 10 preserved
- A8: 6 fixture files con line counts esatti (30+50+25+50+200=355 JSONL entries) + 20 PNG (placeholder OK with iter 9 reale flag), schemas per BENCHMARK-SUITE-ITER-8 §B2-§B7
- A11: 5 NEW composite test cases (postToVisionEndpoint real mock + 3-tool sequence + cache hit + PZ v3 warning + RAG hybrid retriever mock), 5 existing iter 6 tests still PASS (10 total)

## Phase

**1 parallel**

## File ownership

Write ONLY: `tests/**`, `tests/fixtures/circuits/*.png`, `scripts/openclaw/*.test.ts`, `scripts/bench/*.jsonl` (fixtures), `scripts/bench/output/`, `playwright-report/`, `test-results.json`, `automa/team-state/messages/gen-test-*.md`. NO writes `src/`, `supabase/`, `docs/`.

## CoV mandatory before claim "fatto"

3x verify: vitest 12599+ PASS preserved (no test regression), openclaw config 124 PASS preserved + 5 NEW composite = target 129 PASS, build PASS exit 0 (defer if heavy), baseline file unchanged. Caveman ON.

## Phase 1 completion expected

`automa/team-state/messages/gen-test-opus-iter8-to-orchestrator-2026-04-27-<HHMMSS>.md` (single completion msg batched 4 atoms) — triggers Phase 2 scribe-opus dispatch.

## Reference docs

- PDR: `docs/pdr/PDR-SPRINT-S-ITER-7-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md` §3-§6
- Bench: `docs/bench/BENCHMARK-SUITE-ITER-8-2026-04-27.md` §B1 §B3 §B5 + fixtures schemas
- Vision E2E spec iter 6: `tests/e2e/02-vision-flow.spec.js` (262 LOC ready)
- Composite tests iter 6: `scripts/openclaw/composite-handler.test.ts` (224 LOC, 5 PASS)
- R6 seed iter 6: `scripts/bench/r6-fixture.jsonl` (10 prompts, EXTEND to 100)
- Sprint contract: `automa/team-state/sprint-contracts/sprint-S-iter-8-contract.md`
