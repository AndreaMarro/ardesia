---
atom_id: ATOM-S6-B3
sprint: S
iter: 6
priority: P1
assigned_to: generator-app-opus
depends_on: []
provides:
  - supabase/functions/_shared/hybrid-rag.ts (NEW)
  - src/services/hybridRagRetriever.js (NEW client-side)
acceptance_criteria:
  - `_shared/hybrid-rag.ts` NEW (~250 righe) export `hybridRetrieve(query, k=10)` returns top-k chunks
  - composition: BM25 (text search Postgres tsvector) + dense pgvector (BGE-M3 embedding) + RRF k=60
  - RRF: rank fusion `score = 1/(60 + bm25_rank) + 1/(60 + dense_rank)`
  - assumes `rag_chunks` table populated (RAG ingest BGE-M3 background PID 89015 should complete iter 6)
  - if rag_chunks empty: graceful fallback → keyword-only retrieval
  - client-side `hybridRagRetriever.js` (~100 righe) wraps Edge Function `unlim-rag-query` (NEW endpoint scaffold)
  - test gate: vitest 8 PASS (BM25 only / dense only / hybrid / RRF math / k override / empty corpus / error / cache)
  - feature flag `VITE_ENABLE_HYBRID_RAG=true` default
  - depends post-RAG-ingest (background PID 89015 — verify 246+ chunks exist before deploy)
estimate_hours: 4.5
ownership: generator-app-opus
---

## Task

Hybrid RAG retriever wire-up (BM25 + dense pgvector + RRF k=60).

## Deliverables

- `supabase/functions/_shared/hybrid-rag.ts` (NEW)
- `src/services/hybridRagRetriever.js` (NEW)

## Hard rules

- post RAG ingest verify (PID 89015 BGE-M3 chunks Supabase pgvector)
- 3x CoV
- NO main push

## Iter 6 link

Box 6 Hybrid RAG live: 0 → 0.5 post wire-up + 8 tests PASS.
