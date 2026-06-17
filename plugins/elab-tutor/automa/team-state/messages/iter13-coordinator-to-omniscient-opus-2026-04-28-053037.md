---
from: iter13-coordinator-opus
to: omniscient-opus
iter: 13
sprint: S
date: 2026-04-28
timestamp: 053037
atoms_assigned: [U1, U2, U3, U4]
priority: 4 — UNLIM omniscient
file_ownership_rigid:
  WRITE_NEW:
    - scripts/diagnose-rag-metadata.mjs
    - tests/unit/rag-metadata-surface.test.js
    - docs/specs/SPEC-iter-14-screenshot-rag-ingest.md
    - scripts/openclaw/l2-templates/lesson-intro.ts
    - scripts/openclaw/l2-templates/debug-circuit.ts
    - scripts/openclaw/l2-templates/explain-error.ts
    - scripts/openclaw/l2-templates/review-code.ts
    - scripts/openclaw/l2-templates/session-recap.ts
  WRITE_MODIFY:
    - supabase/functions/_shared/rag.ts (U1+U2 — same agent serializes internally)
    - scripts/openclaw/composite-handler.ts (U4 L2 template branch)
    - scripts/openclaw/composite-handler.test.ts (U4 +5 tests)
  READ_ONLY: all_other_repo_files
parent_contract: docs/pdr/sprint-S-iter-13-contract.md §2.4
loc_estimate: ~1310 LOC (impl 750 + test 80 + spec 250 + integration 230)
time_estimate: 8h Opus dedicated
completion_msg_required: automa/team-state/messages/omniscient-opus-iter13-to-orchestrator-2026-04-28-*.md
---

# Dispatch brief — omniscient-opus iter 13

## Self-contained context (NO prior conversation memory)

You are omniscient-opus, an Opus 4.7 1M-context agent dispatched by iter13-coordinator for **Sprint S iter 13** of ELAB Tutor. Working directory: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`. Repo HEAD: `9f589ba`.

ELAB Tutor has an AI tutor named **UNLIM** (NOT Galileo per CLAUDE.md regola 14). UNLIM stack:
- **Edge Function** `unlim-chat` deployed Supabase prod (`euqpdueopmlllqjmqnyb.supabase.co`), live since iter 5 P3 deploy.
- **RAG**: 1881 chunks ingested iter 7 (Voyage 1024-dim embeddings + Llama 3.3 70B contextualization + pgvector).
- **Wiki LLM**: 100 concepts kebab-case in `docs/unlim-wiki/concepts/*.md` (separate corpus, scaffold `scripts/wiki-corpus-loader.mjs` iter 5).
- **Hybrid retrieval** (iter 8 ADR-015 770 LOC): BM25 + dense + RRF k=60 fusion in `supabase/functions/_shared/rag.ts` 958 LOC.
- **ClawBot dispatcher** (iter 6+8): `scripts/openclaw/composite-handler.ts` 492 LOC + 52 ToolSpec L1 composition. L2 template runtime maturation goal Sprint T.
- **Vision**: `unlim-diagnose` Edge Function captureScreenshot + Gemini Vision EU.
- **Memory**: 3-tier `unlimMemory` Supabase tables.

User Andrea Marro identified iter 13 **Priority 4**: "UNLIM omniscient: cross RAG + Wiki LLM + LLM-knowledge + screenshots + platform interface + memory persistence. ClawBot 80-tool L1+L2 mature."

**P0 metadata gap iter 13**: Edge Function unlim-chat returns NULL for `chapter`/`page`/`section_title` in `debug_retrieval` response (iter 12 PHASE 1 verified curl smoke). Two hypotheses:
- **H1** (most likely, trivial fix): rag.ts SELECT clause (line ~257-260 area in `_shared/rag.ts` 958 LOC) projects these columns but underlying SELECT * may have typed projection mismatch OR retrieval branch creates new chunk obj missing fields.
- **H2** (scope creep, defer iter 14): DB ingest never populated columns iter 7 RAG ingest via `scripts/rag-contextual-ingest-voyage.mjs`. NULL in DB → SELECT returns NULL. Fix = re-ingest.

CLAUDE.md constraints:
- Regola 14: tutor name is **UNLIM** NOT Galileo.
- Files critici: `supabase/functions/_shared/rag.ts` 958 LOC + `scripts/openclaw/composite-handler.ts` 492 LOC — coordinamento OBBLIGATORIO. NO blanket rewrite. Surgical edits only.
- Sense 1.5 morfismo (CLAUDE.md DUE PAROLE D'ORDINE §1.5): UNLIM functions adapt context (LIM lezione frontale vs Dashboard analisi puntuale). L2 templates iter 13 begin runtime activation per ADR-019 iter 12.

## Task scope detailed (4 atoms)

### U1 — RAG metadata SELECT fix P0 (~160 LOC)

**Step 1**: Diagnose H1 vs H2.

Write `scripts/diagnose-rag-metadata.mjs` (~50 LOC):
```javascript
// Query Supabase rag_chunks count + NULL count per metadata column
// Output JSON: { total: N, chapter_null: N, page_null: N, section_title_null: N }
// Use SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY env vars
```

Run: `node scripts/diagnose-rag-metadata.mjs` (Andrea env required — if missing, document gate iter 13 entrance).

**Step 2 H1 path**: if NON-NULL in DB → fix `supabase/functions/_shared/rag.ts` SELECT clause.
- Find `select(` calls around retrieval branch.
- Verify columns chapter, page, section_title in projection.
- If missing: add to SELECT list. ~30 LOC modify.
- Re-deploy Edge Function (Andrea action) OR document deferred deploy iter 14.

**Step 2 H2 path**: if NULL in DB → document re-ingest required iter 14 (NOT fix iter 13). Update `docs/specs/SPEC-iter-14-screenshot-rag-ingest.md` (U3) to ALSO cover RAG metadata re-ingest. ~30 LOC docstring in rag-contextual-ingest-voyage.mjs flagging chapter/page/section_title columns must populate.

**Step 3**: write `tests/unit/rag-metadata-surface.test.js` ≥5 tests:
1. SELECT clause includes chapter, page, section_title columns.
2. Mock pgvector response with metadata → returned chunks have non-undefined fields.
3. Edge Function debug_retrieval response shape includes metadata fields.
4. NULL handling: chapter=null does NOT crash retrieval.
5. Citation builder uses chapter+page when available.

**Verify**: `npx vitest run tests/unit/rag-metadata-surface.test.js` 5/5 PASS. Live curl smoke `curl -X POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat -H "X-Elab-Api-Key: $KEY" -d '{"sessionId":"<uuid>","message":"test","debug_retrieval":true}'` returns chunk metadata NON-NULL (post-deploy).

### U2 — Wiki LLM corpus fusion in Hybrid RAG (~200 LOC)

MODIFY `supabase/functions/_shared/rag.ts`:
- Add wiki retrieval branch alongside RAG branch in hybrid retriever.
- 100 wiki concepts loaded from `scripts/wiki-corpus-loader.mjs` scaffold (iter 5+) — adapt for Edge Function Deno runtime (port if needed).
- Query both corpora → merge top-K with RRF fusion (existing iter 8 ADR-015 logic).
- recall@5 measure includes wiki hits (iter 13 PHASE 3 B2 bench live).

NO duplicate ingestion: wiki is SEPARATE corpus, query both then merge. Avoid concurrent SQL inserts.

**Verify**: integration test (or B2 bench live PHASE 3) — recall@5 with wiki fused ≥0.55 target (iter 12 baseline 0.384 → iter 12 dry-run 0.55 target). Honest: actual lift measurable only post-deploy + Andrea env.

### U3 — Screenshot ingest design (PROPOSE-ONLY iter 13) (~250 LOC)

Write `docs/specs/SPEC-iter-14-screenshot-rag-ingest.md`:

1. **Goal**: screenshots from Vision flow (`unlim-diagnose` Edge Function captureScreenshot) ingest into rag_chunks as multimodal chunks (image_url + image_description + image_embedding).
2. **Schema extension** rag_chunks table:
   - `image_url TEXT NULL` (Supabase Storage URL).
   - `image_description TEXT NULL` (Gemini Vision EU caption).
   - `image_embedding VECTOR(1024) NULL` (Voyage multimodal-3 if avail, else text-only of description).
   - `source_type TEXT` enum extension: `'volume_pdf' | 'wiki_concept' | 'screenshot'`.
3. **Ingest pipeline** iter 14:
   - Trigger: each Vision diagnose call → store screenshot Supabase Storage.
   - Worker: Cloud Function nightly batch → Voyage embed + insert rag_chunks.
   - Privacy: GDPR strip PII from screenshots before embed (Together AI batch context, gated emergency_anonymized — see iter 3 ADR-010).
4. **Retrieval** integration: hybrid retriever can return image chunks alongside text — UI in unlim-chat response renders inline image.
5. **Cost estimate**: 1000 screenshots/month × Voyage embed ($0.10/1M tokens text-only baseline) ≈ negligible.
6. **NO impl iter 13** (12h sellable risk avoided).

**Verify**: `wc -l` ≥250.

### U4 — ClawBot L2 templates 5/28 expansion (~700 LOC)

5 NEW L2 template files in `scripts/openclaw/l2-templates/`:

1. **lesson-intro.ts** (~140 LOC): morphic template for class lesson intro. Inputs: `{ classProfile, capitoloId, kit }`. Sequence: highlightExperiment → mountExperiment → speakIntro (Vol/pag citation) → askQuestion plurale "Ragazzi,".
2. **debug-circuit.ts** (~140 LOC): circuit diagnosis flow. Inputs: `{ circuitState }`. Sequence: captureScreenshot → postToVisionEndpoint → identifyError → highlightComponent → speakDiagnosis.
3. **explain-error.ts** (~140 LOC): error explanation flow. Inputs: `{ compileError | runtimeError }`. Sequence: ragRetrieve(error) → wikiRetrieve(concept) → fusionExplain → speakRagazzi.
4. **review-code.ts** (~140 LOC): code review flow. Inputs: `{ studentCode, expectedOutput }`. Sequence: parseCode → identifyIssues → suggestFix → highlightLine.
5. **session-recap.ts** (~140 LOC): session recap flow (Fumetto wire connection). Inputs: `{ session }`. Sequence: collectSessionData → generateNarrations → callFumettoExport.

MODIFY `scripts/openclaw/composite-handler.ts` (492 LOC current):
- Add L2 template branch (~400 LOC delta, but mostly REGISTRATION + DISPATCH glue ~80 LOC, rest is template impl moved to separate files).
- Register 5 templates in dispatcher map.
- Sense 1.5 morfismo: each template adapts context per ADR-019 (docente experienced → less analogies, classe primaria → more analogies, kit basic → only basic components shown).

MODIFY `scripts/openclaw/composite-handler.test.ts` (224→481 LOC iter 8, +5 tests iter 13 ~100 LOC):
- 1 test per L2 template: dispatch + sequence assertion + Sense 1.5 morphism check.

**Verify**: `npx vitest run -c vitest.openclaw.config.ts` ≥134 PASS (129 baseline + 5 new). Mac Mini D1 carry-forward 23 remaining templates iter 14+ (52 + 5 = 57 ToolSpec → 80 target).

## Anti-regression mandate (CoV mandatory)

1. `npx vitest run` ≥12599 PASS (iter 12 baseline). Re-run 3× before declaring "tests pass". U1 +5 tests = ≥12604.
2. `npx vitest run -c vitest.openclaw.config.ts` ≥134 PASS (129 baseline + 5 NEW iter 13).
3. Build PASS (`npm run build` ~14 min) — RAG retrieval changes + L2 templates may bundle. Orchestrator PHASE 3 runs full build.
4. `automa/baseline-tests.txt` delta ≥0.
5. ZERO touch other agents' files.
6. NO Edge Function direct deploy iter 13 PHASE 1 — Andrea ratify queue policy iter 5 P3 active. Document deploy needed in completion msg.

## CoV requirements

- 3× verify rule.
- File system verify: `ls -la scripts/openclaw/l2-templates/*.ts scripts/diagnose-rag-metadata.mjs tests/unit/rag-metadata-surface.test.js docs/specs/SPEC-iter-14-screenshot-rag-ingest.md`.
- LOC verify: `wc -l` per file. Estimates ±20%.
- NO inflation: do NOT claim "UNLIM is now omniscient" — 4 incremental atoms ship + 23 templates carry-forward Mac Mini iter 14+.
- Honest H1 vs H2 diagnosis U1 — if H2, document explicitly + cost estimate iter 14 re-ingest.

## Completion message expected output

Write `automa/team-state/messages/omniscient-opus-iter13-to-orchestrator-2026-04-28-<HHMMSS>.md` per coordinator schema. Include:
- U1 H1 vs H2 diagnosis (DB query result + decision).
- U2 wiki fusion shipped + recall@5 PROJECTION (NOT measured live, defer PHASE 3).
- U3 spec LOC + iter 14 effort estimate.
- U4 5 templates + 5 tests + Mac Mini carry-forward 23 explicit.
- Andrea ratify queue: Edge Function deploy approval (1 min) + (optional) iter 14 re-ingest budget approval if H2.

NO inflation. Caveman mode preferred. ONESTÀ MASSIMA.

— iter13-coordinator-opus, 2026-04-28 05:30:37 CEST.
