---
from: planner-opus
to: architect-opus
ts: 2026-04-27T121207
sprint: S-iter-8
phase: 1
priority: P0
blocking: false
---

## Atomic tasks assigned

- **ATOM-S8-A1** [`automa/tasks/pending/ATOM-S8-A1-adr-015-hybrid-rag-retriever-design.md`] — ADR-015 Hybrid RAG retriever design (BM25 italian + dense pgvector + RRF k=60 + bge-reranker-large optional, ~600 LOC)
- **ATOM-S8-A3** [`automa/tasks/pending/ATOM-S8-A3-adr-016-tts-isabella-ws-design.md`] — ADR-016 TTS Isabella WebSocket Deno migration design (rany2/edge-tts WSS protocol, ~400 LOC)

Total estimate: ~6h architect-opus.

## Acceptance criteria summary

- A1: ADR-015 ~600 LOC, BM25+dense+RRF+rerank decision documented, B2 thresholds (recall@5 ≥0.85, MRR ≥0.75, latency p95 <500ms), alternatives table, BLOCKS A2 gen-app
- A3: ADR-016 ~400 LOC, WSS endpoint protocol detail (Sec-MS-GEC handshake + SSML payload + audio frames), B4 thresholds (latency p50 <2s, MOS ≥4.0), voice it-IT-IsabellaNeural, alternatives Coqui/ElevenLabs/Voxtral, BLOCKS A4 gen-app

## Phase

**1 parallel**

## File ownership

Write ONLY: `docs/adrs/ADR-015-*.md`, `docs/adrs/ADR-016-*.md`, `automa/team-state/messages/architect-*.md`. Read-only su `src/`, `supabase/`, `scripts/openclaw/`.

## CoV mandatory before claim "fatto"

3x verify: vitest 12599+ PASS preserved, build PASS exit 0, baseline file unchanged. Caveman ON.

## Phase 1 completion expected

`automa/team-state/messages/architect-opus-iter8-to-orchestrator-2026-04-27-<HHMMSS>.md` — triggers Phase 2 scribe-opus dispatch (filesystem barrier 4/4 race-cond fix Pattern S).

## Reference docs

- PDR: `docs/pdr/PDR-SPRINT-S-ITER-7-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md` §0-§12
- Bench: `docs/bench/BENCHMARK-SUITE-ITER-8-2026-04-27.md` §B2 + §B4
- Sprint contract: `automa/team-state/sprint-contracts/sprint-S-iter-8-contract.md`
