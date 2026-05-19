---
id: ATOM-S8-A1
sprint: S-iter-8
priority: P0
owner: architect-opus
phase: 1
deps: []
created: 2026-04-27
---

## Task
Design ADR-015 Hybrid RAG retriever (BM25 italian + dense pgvector + RRF k=60 + bge-reranker-large optional). Read-only sul codice, write ADR only.

## Acceptance criteria
- [ ] CoV vitest 12599+ PASS preserved (read-only verify, no test changes)
- [ ] build PASS exit 0 (defer if heavy)
- [ ] file ownership respected — write ONLY `docs/adrs/ADR-015-*.md` + `automa/team-state/messages/architect-*.md`
- [ ] ADR ~600 LOC YAML frontmatter (status/date/deciders/context)
- [ ] Sections: Context (RAG ingest 1881 chunks iter 7 close baseline), Decision (BM25 italian tokenizer + Voyage 1024-dim dense + RRF k=60 fusion + bge-reranker-large optional Mac Mini local), Consequences, Implementation (`supabase/functions/_shared/rag.ts` skeleton API), Test Plan (B2 hybrid-rag-gold-set 30 query bench), Rollback
- [ ] B2 pass thresholds documentated: recall@5 ≥0.85, precision@1 ≥0.70, MRR ≥0.75, latency p95 <500ms
- [ ] Alternatives evaluated: pure BM25 baseline, pure dense baseline, ColBERT v2 late-interaction, Cohere reranker
- [ ] PRINCIPIO ZERO + MORFISMO compliance verified (citazioni Vol/pag chunks preserve, no chunk paraphrase)
- [ ] BLOCKS ATOM-S8-A2 (gen-app-opus impl)

## Output files
- `docs/adrs/ADR-015-hybrid-rag-retriever-bm25-dense-rrf-2026-04-27.md` (NEW, ~600 LOC)
- `automa/team-state/messages/architect-opus-iter8-to-orchestrator-2026-04-27-<HHMMSS>.md` (completion)

## Done when
ADR-015 file exists ≥500 LOC, frontmatter complete, all 6 sections present, B2 thresholds documented, alternatives table present, completion msg emitted.
