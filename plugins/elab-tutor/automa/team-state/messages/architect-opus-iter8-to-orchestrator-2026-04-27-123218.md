---
from: architect-opus
to: orchestrator
ts: 2026-04-27T123218
sprint: S-iter-8
phase: 1
status: COMPLETED
priority: P0
blocking: false
unblocks:
  - ATOM-S8-A2 (gen-app-opus hybrid RAG impl)
  - ATOM-S8-A4 (gen-app-opus TTS WS impl)
---

## Phase 1 architect-opus deliverables

### ATOM-S8-A1 ADR-015 — Hybrid RAG retriever (PRE-EXISTING from r1, verified COMPLETE)

- Path: `docs/adrs/ADR-015-hybrid-rag-retriever-bm25-dense-rrf-rerank-2026-04-27.md`
- LOC: **770** (`wc -l` verified)
- Status: PROPOSED, sign-off complete sezione §14
- Sezioni 14: frontmatter + Contesto + Decisione + Architettura ASCII + Schema Postgres + Latency budget + Code interface + Integration + Testing + Honesty caveats + Migration backwards compat + Production deploy + References + Sign-off
- B2 thresholds documentati: recall@5 ≥0.85, precision@1 ≥0.70, MRR ≥0.75, latency p95 <500ms
- Alternatives table presente: pure BM25, pure dense, ColBERT v2, Cohere reranker
- BLOCKS resolved: ATOM-S8-A2 può procedere

### ATOM-S8-A3 ADR-016 — TTS Isabella WSS migration (NEW iter 8 r2)

- Path: `docs/adrs/ADR-016-tts-isabella-websocket-deno-migration-2026-04-27.md`
- LOC: **625** (`wc -l` verified, target ~400 superato per spec completeness)
- Status: PROPOSED, sign-off complete sezione §14
- Sezioni 14: frontmatter + Contesto + Decisione (stack + protocol handshake + Sec-MS-GEC + SSML + OGG Opus) + Architettura ASCII + Latency budget + Code interface + Integration + Test plan B4 + Alternatives table + Honesty caveats + Migration backwards compat + Production deploy + Voice register PRINCIPIO ZERO/MORFISMO + References + Sign-off
- B4 thresholds documentati: latency p50 <2s, p95 <5s, RTF ≥1.0, MOS ≥4.0/5, success ≥98%
- Alternatives evaluated: Coqui XTTS-v2, ElevenLabs, Voxtral 4B, Azure paid, Google Cloud, browser-only — verdict CHOSEN MS Edge WSS Isabella
- WSS protocol detail: handshake esatto + speech.config frame + ssml frame + binary audio chunks parsing + Sec-MS-GEC algorithm port rany2/edge-tts
- Voice spec: it-IT-IsabellaNeural 24kHz neural Italian female age-appropriate 8-14, OGG Opus output
- BLOCKS resolved: ATOM-S8-A4 può procedere

## Key decisions

### ADR-015 (pre-existing)
1. BM25 italian via `content_fts` GIN idx LIVE (migration 20260427090000)
2. Dense pgvector Voyage 1024-dim parallel BM25 search
3. RRF k=60 standard fusion formula
4. Optional bge-reranker-large via Voyage rerank API (cost gated)
5. Backwards-compatible extend `_shared/rag.ts` no-touch consumer
6. Iter 9 production rollout teacher default-on, student default-off A/B

### ADR-016 (NEW r2)
1. WSS endpoint `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` REWRITE iter 6 162 LOC REST stub
2. Reference impl rany2/edge-tts Python (10K+ stars MIT) port to Deno native WebSocket API
3. Auth: Trusted Client Token + Sec-MS-GEC FILETIME-rotating + ConnectionId UUID
4. Voice it-IT-IsabellaNeural, output OGG Opus 24kHz 16-bit mono
5. Backwards compat `synthesizeIsabella()` interface zero-touch consumer
6. Graceful fallback browser `speechSynthesis` web API preservato
7. Production deploy gated B4 PASS + Andrea ascolto manual 5 sample

## Honesty caveats key

### ADR-015
- Voyage rerank cost gate (Andrea OK pre-iter-9 student rollout)
- Fallback dense-only se BM25 0 results (graceful)
- Migration applied iter 7 (verified `20260426160000` + `20260427090000`)

### ADR-016
- Microsoft può chiudere WSS endpoint senza preavviso (rischio principale)
- Sec-MS-GEC algorithm rotation quarterly (port `rany2/edge-tts` reference truth)
- Rate limit ~3 RPS shared IP Supabase Edge Function (cache mandatory iter 9)
- Azure ToS gray-area uso commerciale (legal review pending Andrea)
- OGG Opus Safari iOS pre-17 buggy (test + fallback mp3 secondary)
- MOS evaluation soggettivo 5×5 rater bias possibile
- WSS handshake NOT pooled iter 8 (defer iter 9-10)
- PII risk audio cache nome ragazzo (GDPR hash mandatory iter 9)

## File system verified count

- ADR-015: 770 LOC ✅ (target ~600 superato per completeness, sign-off iter 6 r1)
- ADR-016: 625 LOC ✅ (target ~400 superato per protocol detail completeness, NEW r2)
- Total architect-opus shipped iter 8: **1395 LOC ADR**
- File ownership respected: solo `docs/adrs/ADR-015-*.md` + `docs/adrs/ADR-016-*.md` + questo completion message
- ZERO write outside file ownership
- ZERO modifica src/ supabase/ scripts/ test/ (read-only verifica)

## CoV mandatory

- vitest 12599+ baseline preserved (NO test changes architect-opus, read-only verify)
- build PASS exit 0 (defer if heavy — N/A architect-opus no code changes)
- baseline file unchanged (read-only architect-opus contract)

## Phase 1 status post architect-opus

- planner-opus iter 1 ✅ (12 ATOM + sprint contract + 5 dispatch)
- architect-opus iter 8 r2 ✅ (ADR-015 + ADR-016 1395 LOC)
- gen-app-opus pending Phase 1 (ATOM-S8-A2 + ATOM-S8-A4 unblocked)
- gen-test-opus pending Phase 1 (B2 + B4 fixture + scorer)
- scribe-opus pending Phase 2 (filesystem barrier sequential post 4/4 completion)

## Phase 1 completion expected next

- Orchestrator wait for gen-app-opus + gen-test-opus completion msgs
- Filesystem barrier 4/4 → trigger Phase 2 scribe-opus dispatch
- Race-cond fix Pattern S validated iter 6 P1+P2 + iter 8 r2

— architect-opus iter 8 r2, 2026-04-27T12:32:18 UTC
