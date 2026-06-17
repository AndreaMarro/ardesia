---
from: planner-opus
to: generator-app-opus
ts: 2026-04-27T121207
sprint: S-iter-8
phase: 1
priority: P0
blocking: false
---

## Atomic tasks assigned

- **ATOM-S8-A2** [`automa/tasks/pending/ATOM-S8-A2-hybrid-rag-retriever-impl.md`] — Hybrid RAG retriever impl `supabase/functions/_shared/rag.ts` (~400-600 LOC, depends A1)
- **ATOM-S8-A4** [`automa/tasks/pending/ATOM-S8-A4-tts-isabella-ws-impl.md`] — TTS WS impl `_shared/edge-tts-client.ts` rewrite (~200-400 LOC, depends A3)
- **ATOM-S8-A6** [`automa/tasks/pending/ATOM-S8-A6-clawbot-composite-live-wireup.md`] — ClawBot composite live wire-up (postToVisionEndpoint real impl, ~80-150 LOC NEW + ~50 LOC modifications)
- **ATOM-S8-A9** [`automa/tasks/pending/ATOM-S8-A9-five-new-scorers.md`] — 5 NEW scorers `score-{hybrid-rag,tts-isabella,cost-per-session,fallback-chain,clawbot-composite}.mjs` (~750-1250 LOC total)
- **ATOM-S8-A10** [`automa/tasks/pending/ATOM-S8-A10-master-orchestrator-bench-runner.md`] — Master orchestrator `scripts/bench/iter-8-bench-runner.mjs` (~300-500 LOC, depends A9)

Total estimate: ~14h gen-app-opus (heaviest workload Phase 1).

## Acceptance criteria summary

- A2: BM25 italian + dense pgvector + RRF k=60 + optional bge-reranker, function `hybridRetrieve(query, topK, opts)`, fallback dense-only on BM25 fail
- A4: WSS protocol rany2/edge-tts ref, `wss://speech.platform.bing.com/.../v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4`, voice `it-IT-IsabellaNeural`, signature `synthesizeIsabella(text, opts)` preserved
- A6: 5 existing composite-handler tests still PASS, postToVisionEndpoint real (POST `unlim-diagnose` Edge Function), composite 3-tool sequences end-to-end
- A9: 5 scorers ESM `.mjs` CLI `--input --output --threshold`, exit code 0 PASS / 1 FAIL with detail, pricing 2026-04-27 hardcoded reference (Together $0.18/M, Voyage $0.06/M, Gemini Flash-Lite $0.075/M)
- A10: Pre-flight env check + sequential B1→B3→B4→B6→B7 + parallel B2+B5, aggregator score 7/7=9.2 / 6/7=8.7 target / 5/7=8.2 / ≤4/7=7.5

## Phase

**1 parallel**

## File ownership

Write ONLY: `src/**`, `supabase/functions/_shared/*.ts`, `supabase/functions/unlim-tts/**`, `supabase/migrations/*.sql`, `scripts/openclaw/**` (TS impl), `scripts/bench/score-*.mjs`, `scripts/bench/iter-8-bench-runner.mjs`, `scripts/bench/run-*.mjs`, `automa/team-state/messages/gen-app-*.md`. NO writes `tests/`, `docs/`.

## CoV mandatory before claim "fatto"

3x verify: vitest 12599+ PASS preserved (existing 5 composite tests + 18 edge-tts tests + 6 routeTTS tests still GREEN), build PASS exit 0 (defer if heavy), baseline file unchanged. Caveman ON.

## Phase 1 completion expected

`automa/team-state/messages/gen-app-opus-iter8-to-orchestrator-2026-04-27-<HHMMSS>.md` (single completion message OK batched all 5 atoms) — triggers Phase 2 scribe-opus dispatch.

## Reference docs

- PDR: `docs/pdr/PDR-SPRINT-S-ITER-7-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md` §3-§6
- Bench: `docs/bench/BENCHMARK-SUITE-ITER-8-2026-04-27.md` §B2 §B4 §B5 §B6 §B7 §ORCH
- ADR-013 ClawBot composite: `docs/adrs/ADR-013-clawbot-composite-handler-l1-morphic-2026-04-26.md` (iter 6, ref postToVisionEndpoint D4)
- Edge Function `unlim-tts` iter 6: `supabase/functions/_shared/edge-tts-client.ts` (162 LOC HTTP stub TO REPLACE)
- Composite handler iter 6: `scripts/openclaw/composite-handler.ts` (492 LOC executeComposite)
- Sprint contract: `automa/team-state/sprint-contracts/sprint-S-iter-8-contract.md`
