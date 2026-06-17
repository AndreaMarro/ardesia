---
id: ATOM-S8-A2
sprint: S-iter-8
priority: P0
owner: gen-app-opus
phase: 1
deps: [ATOM-S8-A1]
created: 2026-04-27
---

## Task
Implement Hybrid RAG retriever in `supabase/functions/_shared/rag.ts` per ADR-015. BM25 italian + dense pgvector + RRF k=60 + bge-reranker-large optional sub-call.

## Acceptance criteria
- [ ] CoV vitest 12599+ PASS preserved (no regression)
- [ ] build PASS exit 0 (defer if heavy)
- [ ] file ownership respected — write ONLY `supabase/functions/_shared/rag.ts` + `automa/team-state/messages/gen-app-*.md`
- [ ] BM25 italian tokenizer (lowercase + accent-strip + stopword-it) integrated
- [ ] Dense pgvector cosine search via Supabase RPC `match_chunks_voyage` (existing post iter 7 RAG ingest)
- [ ] RRF (Reciprocal Rank Fusion) k=60 combine BM25 + dense rankings
- [ ] bge-reranker-large optional cross-encoder rerank top-20 → top-5 (env flag `ENABLE_RERANKER` default false)
- [ ] Total impl ~400-600 LOC TypeScript Deno-compatible (no Node.js-only deps)
- [ ] Function signature: `hybridRetrieve(query: string, topK: number, opts?: {rerank?: boolean}): Promise<Chunk[]>`
- [ ] Error handling: fallback dense-only if BM25 fails, return [] if all fail
- [ ] PRINCIPIO ZERO + MORFISMO compliance: chunks citations Vol.X pag.Y preserved verbatim
- [ ] Wire-up `unlim-chat/index.ts` MAY require minor edit to call `hybridRetrieve` instead of legacy `searchRAGChunks`

## Output files
- `supabase/functions/_shared/rag.ts` (NEW or extend existing if present, ~400-600 LOC)
- `supabase/functions/unlim-chat/index.ts` (MODIFIED, ~5-10 LOC swap retrieval call, optional)
- `automa/team-state/messages/gen-app-opus-iter8-to-orchestrator-2026-04-27-<HHMMSS>.md` (completion)

## Done when
`hybridRetrieve` function exported, BM25+dense+RRF logic verifiable in code, type signatures match ADR-015 contract, completion msg emitted.
