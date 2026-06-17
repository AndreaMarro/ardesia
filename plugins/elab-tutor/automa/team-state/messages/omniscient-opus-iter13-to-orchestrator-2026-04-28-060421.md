---
from: omniscient-opus
to: orchestrator-iter13
iter: 13
sprint: S
date: 2026-04-28
timestamp: 060421
phase: 1
atoms_completed: [U1, U2, U3, U4]
status: SHIPPED (deploy + live verify gated on Andrea env)
---

# omniscient-opus iter 13 PHASE 1 completion

## CoV summary

- **vitest main**: 12716 PASS / 8 todo / 8 skip / 1 file FAIL (orthogonal — SimulatorCanvas.jsx parse error from rotation-opus R1 atom, lines 2396-2398, NOT my territory)
- **vitest openclaw**: 129 PASS preserved (unchanged — no modifications to scripts/openclaw/composite-handler.ts or tests).
- **NEW tests**: rag-rrf-fusion.test.js 20 PASS + clawbot-L2-templates.test.js 45 PASS = **65 NEW PASS** (target ≥20 met).
- **Build**: NOT run iter 13 PHASE 1 (defer PHASE 3 orchestrator — heavy ~14min).
- **Edge Function deploy**: BLOCKED — `SUPABASE_ACCESS_TOKEN` env missing this session. Andrea ratify queue.
- **Live curl smoke**: BLOCKED — `ELAB_API_KEY` + `SUPABASE_ANON_KEY` env missing. Andrea provision required for post-deploy verify.
- **Live recall@5 measure**: BLOCKED — depends on deploy + env. PROJECTION-only.

## U1 — RAG metadata SELECT fix (P0)

**Hypothesis verdict: H1 (PARTIAL) + H2-extension (RPC schema gap).**

Root cause traced via SOURCE INSPECTION (no DB query — env absent):
- **rag.ts BM25Search SELECT clauses** (lines 602+644 pre-fix) **missed `section_title`** → CONFIRMED H1 partial.
- **PostgREST direct queries** in bm25Search now include `section_title` (P0 fix shipped).
- **denseSearch RPC path**: `search_rag_dense_only` + `search_rag_hybrid` migration `20260426160000_rag_chunks_hybrid.sql` RETURNS TABLE list **does NOT include `section_title`** → for dense path, even with row.section_title coercion, RPC will return undefined → null. **This is H2-extension (iter 14 migration scope)**.
- Schema HAS the column (line 32 of migration): `section_title text` (nullable).

**Iter 13 fix shipped**:
- `bm25Search` primary URL SELECT: `+ section_title` (rag.ts line ~602).
- `bm25Search` OR-fallback URL SELECT: `+ section_title` (rag.ts line ~644).
- `bm25Search` row mapping (×2) coerces `row.section_title ? String(row.section_title) : null`.
- `denseSearch` row mapping coerces too (defensive — relies on RPC schema extension iter 14).
- `HybridChunk` interface adds `section_title: string \| null` field.
- Cross-list reconciliation: dense path can amend null section_title from bm25 row when same id matches.

**Iter 14 follow-up (out of scope iter 13)**: extend `search_rag_dense_only` + `search_rag_hybrid` SQL functions RETURNS TABLE to include `section_title text`. ~10 LOC migration. Required for dense-only retrieval to surface section_title (BM25 path is unblocked iter 13).

## U2 — RRF k=60 multi-list fusion + BM25 parallel

**Already shipped pre-iter-13**: BM25 + dense parallel via `Promise.all` (rag.ts line ~898 pre-fix), RRF k=60 default (`opts.rrfK ?? 60`). Iter 13 enhancement:

- NEW exported `rrfFuseMulti(lists, k)` — generalizes to N ranked lists. Pure math, deterministic.
- `hybridRetrieve` now optionally invokes `rrfFuseMulti` 4-list fusion when wikiFusion active (U3).
- Legacy `rrfFuse` 2-list path preserved when `wikiFusionActive=false` (backward compat).
- BM25 query cleanup unchanged (Italian stopword strip + 2-token threshold from iter 12).

## U3 — Wiki LLM Hybrid fusion + corpus tag

**Implemented**:
- `HybridRetrieveOptions.wikiFusion?: boolean` opt flag.
- Default ON (iter 13 default behavior — env opt-out via `RAG_WIKI_FUSION_DISABLED=true`).
- When active + caller did not pass `filterSource`: parallel fetch of 2 wiki-only ranked lists (`source='wiki'` filter, 40% of candidatePool ~20 chunks each).
- 4-list RRF fusion: `[rag-bm25, rag-dense, wiki-bm25, wiki-dense]` → single ordering.
- `HybridChunk.corpus: 'rag' | 'wiki' | 'mixed'` tag attached at ingest time via `classifyCorpus(source)`.
- Edge Function `unlim-chat/index.ts` debug_retrieval response now includes `corpus` field per chunk.

**Recall@5 PROJECTION** (NOT measured live):
- Iter 12 baseline 0.390 measured live B2 (1881 RAG chunks, no wiki separation).
- Iter 13 PROJECTION lift +0.10-0.15 → 0.50-0.55 IF wiki fusion balances corpus skew (100 wiki vs 1881 rag).
- **REQUIRES**: Andrea env provision + Edge Function deploy + B2 bench rerun via `node scripts/bench/iter-12-bench-runner.mjs --suite=B2`. Currently DEFERRED PHASE 3.

## U4 — 5 ClawBot L2 templates

**5 NEW JSON templates** in `scripts/openclaw/templates/`:
1. `L2-explain-led-blink.json` — lesson-explain (Vol.1 cap.6 LED Blink intro).
2. `L2-diagnose-no-current.json` — diagnose vision flow (captureScreenshot + postToVisionEndpoint).
3. `L2-guide-mount-experiment.json` — guide-build (mountExperiment + highlightPin step-by-step).
4. `L2-critique-circuit-photo.json` — critique-vision (compare photo vs reference figure, green+orange highlights).
5. `L2-reroute-from-error.json` — error-recovery (compileError/runtimeError → ragRetrieve+wikiRetrieve+suggestCodeFix).

Each template has:
- `principio_zero`: plurale "Ragazzi," + citazione_verbatim true + max_parole 60.
- `morfismo_sense_1_5`: docente_esperienza + classe_eta + kit_tier + adapt_voice + adapt_complexity_lessico (per ADR-019).
- `sequence`: 5 steps each (3-5 L1 tools chained).
- `test_assertions`: ≥4 invariants per template.
- TTS terminal step uses `it-IT-IsabellaNeural` voice + `Vol.X pag.Y` citation pattern.

**ToolSpec count delta**: 52 → 57 (+5). Mac Mini D1 carry-forward 23 remaining (per contract §6).

**NOTE**: brief specified `scripts/openclaw/templates/*.json` (5 files) + `tests/unit/clawbot-L2-templates.test.ts`. Deviation from contract `scripts/openclaw/l2-templates/*.ts` (5 files) — followed brief verbatim. Tests written `.js` extension (not `.ts`) to fit main vitest config `tests/**/*.{test,spec}.{js,jsx}` pattern (contract `.ts` would not be picked up by main runner). Composite-handler.ts NOT modified iter 13 — runtime template registration deferred iter 14 along with composite-handler integration tests (out of brief scope, declarative templates standalone valid).

## Files modified / created

**MODIFIED** (2 files, +173 / -19):
- `supabase/functions/_shared/rag.ts` (+170 / -19) — U1+U2+U3 changes
- `supabase/functions/unlim-chat/index.ts` (+2 / 0) — U3 corpus tag in debug_retrieval

**WRITE NEW** (7 files, 719 LOC):
- `scripts/openclaw/templates/L2-explain-led-blink.json` (76 LOC)
- `scripts/openclaw/templates/L2-diagnose-no-current.json` (75 LOC)
- `scripts/openclaw/templates/L2-guide-mount-experiment.json` (76 LOC)
- `scripts/openclaw/templates/L2-critique-circuit-photo.json` (77 LOC)
- `scripts/openclaw/templates/L2-reroute-from-error.json` (78 LOC)
- `tests/unit/rag-rrf-fusion.test.js` (167 LOC, 20 PASS)
- `tests/unit/clawbot-L2-templates.test.js` (170 LOC, 45 PASS)

**Total LOC delta iter 13 U1-U4**: ~890 LOC (vs 1310 estimated — under-budget because RRF k=60 + BM25 parallel infra existed pre-iter-13, declarative JSON templates more compact than .ts impl).

## Andrea ratify queue (CRITICAL)

1. **Edge Function deploy `unlim-chat`** (1 min): `SUPABASE_ACCESS_TOKEN=sbp_… npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb`. Without this, U1+U3 changes NOT live → debug_retrieval still returns NULL section_title + missing corpus tag in prod.
2. **Live curl smoke verify** (~2 min) post-deploy: `ELAB_API_KEY` + `SUPABASE_ANON_KEY` env required, target asserts `chapter|page|section_title` NON-NULL on at least 1 chunk + `corpus ∈ {rag, wiki}` per chunk.
3. **B2 recall@5 live measure** (~5 min) via `node scripts/bench/iter-12-bench-runner.mjs --suite=B2` post-deploy. Target ≥0.50 (lift from 0.390 baseline).
4. **Iter 14 migration scope**: extend `search_rag_dense_only` + `search_rag_hybrid` RPC RETURNS TABLE with `section_title text` column (~10 LOC SQL). Required for dense-only retrieval path to surface section_title.

## Anti-regression honest note

- 1 vitest file FAIL (`SimulatorCanvas.test.jsx` or similar) caused by **rotation-opus** R1 atom JSX parse error in `src/components/simulator/canvas/SimulatorCanvas.jsx:2396-2398` — comment + JSX spread same line malformed. NOT my file ownership. Flagged for rotation-opus ratify.
- Net main vitest +117 PASS vs iter 12 baseline (12716 vs 12599) WITHOUT counting the 1 fail — well above target ≥12604.
- ZERO regression on openclaw 129 PASS.
- ZERO touch on src/, schemas, migrations, or other agents' files (per RIGID file ownership).

## Honesty caveats

1. **U1 partial fix**: BM25 path FULLY surfaces section_title. Dense path will return null until iter 14 RPC migration. Document live + iter 14 follow-up scope clearly.
2. **Recall@5 NOT measured live**: PROJECTION 0.50-0.55. Andrea env provision unblocks ~5 min.
3. **No deploy iter 13 PHASE 1**: per Andrea ratify queue policy iter 5 P3 active. Deploy gated.
4. **L2 templates declarative-only iter 13**: composite-handler.ts runtime registration NOT shipped (out of brief scope). Templates ship as JSON specs ready for iter 14 composite-handler L2 branch wire-up.
5. **No inflation**: 4 atoms shipped + Mac Mini D1 carry-forward 23 templates iter 14+. UNLIM is NOT "now omniscient" — incremental progress per contract.

— omniscient-opus, 2026-04-28 06:04:21 CEST. CAVEMAN MODE. ONESTÀ MASSIMA.
