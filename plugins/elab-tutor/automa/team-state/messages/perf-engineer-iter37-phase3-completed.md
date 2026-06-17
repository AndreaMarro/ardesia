# Performance Engineer — iter 37 Phase 3 Completion Message

**From**: perf-engineer
**To**: orchestrator
**Date**: 2026-04-30 PM
**Branch**: `e2e-bypass-preview`
**Iter**: Sprint T iter 37 Phase 3 — Latency RCA + iter 38 P0 mitigation plan
**Time spent**: ~1.7 h (within 1.5-2 h budget)

---

## 1. Articles read summary — top patterns identified

19 sources received from Andrea (12 originally + 7 mid-audit additions). Fetch outcomes:

- **15 ✅ successful** (apitestlab, dev-notebook, kaushalsinh, zuplo, bytebytego, openai-community, Azure-LLM-Latency-Guidebook, sean-goedecke, mistral-docs-api, digitalapplied-Voxtral-TTS, antirez-voxtral.c, mistral.ai-Voxtral-Transcribe-2, mistral.ai-Mixtral-of-Experts, superannotate-Mixtral, simonwillison-Voxtral-2)
- **2 ❌ blocked / failed** (reddit Mistral 10× TTFT — Claude Code reddit block; lightning.ai vLLM — page didn't load)
- **1 ⚠ ambiguous** (arxiv 2602.11298v3 — needs Andrea clarification)
- **1 ❌ redirect** (stackademic — medium identity gateway, not re-fetched)

Top 10 patterns identified across sources:

1. **Token compression** (Azure 2-3×) — already partly shipped iter 31+37 (256→120). Iter 38 C₂ extends to 80 for chit_chat.
2. **Semantic caching** (Azure up to 14×, Zuplo 70-90 %) — iter 38 P1 H (RAG KV cache).
3. **Request parallelization** (Azure up to 72×) — iter 38 P0 A (Promise.all 3 SB round-trips).
4. **Streaming SSE** (Mistral docs + Goedecke) — iter 38 P1 J' (server buffered) + iter 39 J (full frontend).
5. **Model selection** (Azure up to 4×) — iter 38 P0 O (Tiny for chit_chat) + iter 38 P0 R (Large 20→10 %).
6. **Sequential vs parallel fallback** (Goedecke prefill/decode + audit hot path inspection) — iter 38 P1 G (parallel-race providers).
7. **Cold start mitigation** (Azure co-location + ApiTestLab top-12) — iter 38 P0 F (cron warmup 30 s).
8. **Embedding memoization** (OpenAI community semantic cache) — iter 38 P0 E (LRU 200 entries).
9. **EU GDPR + stack coherence** (Mistral docs + Voxtral Transcribe 2) — iter 38 P0 Q (CF Whisper → Voxtral STT migration).
10. **Native structured output** (Mistral docs response_format) — iter 38 P1 P (replace regex INTENT parser, ADR-030 candidate).

---

## 2. Hot path top 5 contributors (LOC ref + ms cost)

| # | Contributor                                  | Cost warm     | Cost cold    | LOC ref                                                      |
|---|----------------------------------------------|---------------|--------------|--------------------------------------------------------------|
| 1 | LLM call (Mistral Small/Large/Together)      | 1500-5000 ms  | 4-12 s       | `unlim-chat/index.ts:483-509` + `llm-client.ts:68-186`      |
| 2 | Sequential fallback chain on LLM error       | 0 ms          | +2-5 s       | `llm-client.ts:435-606` (`callLLMWithFallback`)             |
| 3 | RAG retrieve fan-out (embed + RPC)            | 400-750 ms    | 800-1500 ms  | `rag.ts:412-510` (dense) + `rag.ts:911-1050` (hybrid)       |
| 4 | Onniscenza aggregator (capped 200 ms)         | 200-400 ms    | 200-400 ms   | `onniscenza-bridge.ts:299-374` + `unlim-chat:309-355`       |
| 5 | 3 sequential Supabase round-trips             | 250-500 ms    | 400-700 ms   | `unlim-chat:174,212,241` (rateLimit / consent / memory)     |

Honourable mentions: `capitoli.json` 1 MB import already module-scope cached (`capitoli-loader.ts:11`), `knowledge-base.json` 108 KB same pattern (`rag.ts:9`) — **no quick win** there.

---

## 3. Iter 38 P0 quick wins prioritized (effort × impact matrix)

### Phase 1 (parallel, 4 makers, ≤ 4 h budget per atom):

| ID  | Atom                                              | Effort | p95 impact     | ROI       | Notes |
|-----|---------------------------------------------------|--------|----------------|-----------|-------|
| ✅ D | 8 s timeout `Promise.race`                        | done   | p99 cap 8 s    | shipped   | iter 37 inline |
| ✅ C₁ | max_tokens 256 → 120                             | done   | −500-1000 ms   | shipped   | iter 31 + iter 37 |
| **A** | Promise.all 3 SB round-trips                     | 1 h    | −250 ms warm   | ★★★★★    | rateLimit + consent + memory |
| **C₂** | max_tokens 120 → 80 chit_chat / plurale         | 30 min | −500 ms 40 % traffic | ★★★★★ | safe (capWords already enforces ≤ 60) |
| **B** | Onniscenza topK default 3 → 2                    | 30 min | −100 ms        | ★★★☆☆    | small risk on default fallback |
| **E** | Embedding memoize LRU 200 entries                | 2 h    | −300 ms repeats | ★★★☆☆   | OpenAI semantic cache |
| **I** | hybridRetrieve candidatePool 50 → 20             | 1 h    | −150 ms hybrid | ★★★☆☆    | recall@5 verify B2 bench |
| **F** | Cron warmup ping 30 s                            | 2 h    | kills cold tail | ★★★★☆   | Supabase Cron + GH Action fallback |
| **O** | Mistral Tiny for chit_chat                        | 2 h    | −400 ms 30 % traffic | ★★★★☆ | Azure model selection |
| **R** | LLM_ROUTING 70/20/10 → 80/10/10 (Large 20→10 %)  | 1 h    | −400 ms 10 % traffic | ★★★★☆ | Mixtral analysis: Large is dense 123 B |
| **Q** | STT migration CF Whisper → Voxtral Transcribe 2  | 6 h    | −400 ms STT + GDPR clean + Morfismo Sense 2 | ★★★★★ ⭐ | strategic move single-vendor |
| **M** | Mistral prompt cache API support check (Documenter) | 15 min | −500-1500 ms IF supported | TBD | gate iter 38 entrance |

### Phase 2 Tier-2 (iter 38 P1, 2-4 h per atom):

| ID  | Atom                                              | Effort | p95 impact     | Notes                 |
|-----|---------------------------------------------------|--------|----------------|-----------------------|
| **G** | Parallel-race Mistral Small + Together           | 3 h    | −800 ms p95    | gate ENABLE_RACE 5 % canary |
| **H** | RAG semantic KV cache                             | 4 h    | −500 ms cache hit | Supabase / CF KV |
| **J'** | Mistral `stream: true` (server buffered)        | 3 h    | −300 ms TTFB   | Mistral docs streaming |
| **L** | TTS prefetch top-3 templates                     | 1 day  | TTS perceived 0 ms | Voxtral guide |

### Architecture iter 39+:

- **J** full frontend SSE (2-3 days), **K** multi-region Edge eu-central-1 (1 day), **P** Mistral structured INTENT (4 h, ADR-030, quality-track), **N** Cloudflare Workers (3-5 days), **U** voxtral.c local Mac Mini fallback (Sprint U).

### Realistic iter 38 R5 close target:

```
iter 37 baseline (post inline mitigations):  avg 4496 / p95 10096 / p99 17971
iter 38 Phase 1 (A+B+C₂+E+I+F+O+R+Q):        avg ~3000 / p95 ~6000 / p99 ~8000
iter 38 Phase 2 (G+H+J'):                    avg ~2200 / p95 ~4500 / p99 ~6000
iter 39 + Architecture (K+J):                avg ~1500 / p95 ~3000 / p99 ~4500  ← PDR target
```

Sprint T close iter 38 9.5/10 cascade gate: avg < 3500 + p95 < 6000 = **achievable Phase 1 single-day budget**.

---

## 4. Quick wins iter 37 inline safe candidates (≤ 2)

Per scope: **NONE recommended for iter 37 Phase 3 inline application by perf-engineer**.

Rationale:
- All five Tier-1 fixes either change LLM behaviour (B / C₂ / D / E) or restructure request handler control flow (A). Each needs a dedicated iter 38 atom with its own R5 re-run for honest CoV.
- Memoize file loaders is **already in place** — `capitoli.json` and `knowledge-base.json` are imported with `with { type: 'json' }` and cached at module scope (verified `capitoli-loader.ts:11` and `rag.ts:9`).
- The earlier audit-task assumption ("file system reads per call?") is incorrect — there are no per-call disk reads.
- Default topK reduce to 2 is **5-LOC, zero behavioural risk** — but it changes `aggregateOnniscenza` call shape and should be measured isolated as iter 38 B atom for honesty.

The audit explicitly **does NOT smuggle fixes into iter 37 Phase 3**. Iter 38 is the right home with proper R5 re-bench gate per atom.

The three iter 37 inline mitigations already shipped (per coordinator confirmation):
- ✅ Promise.race 8 s timeout on `callLLM`
- ✅ max_tokens 256 → 120
- ✅ system-prompt INTENT canonical syntax block (R7 fix)

Are accounted for in the §12 backlog as "✅ shipped" rows.

---

## 5. Honesty caveats

1. **Latency cost numbers are estimates** based on code path inspection + R5 measured aggregates. No per-segment instrumentation exists yet. Iter 38 P1: add `console.info({event:'segment',name,ms})` per major step → derive real flame graph from prod logs.

2. **L2 template short-circuit hit rate unmeasured.** `selectTemplate` (`unlim-chat:419`) bypasses LLM entirely when matched — likely 5-15 % of traffic at 100-300 ms latency vs 3000-5000 ms. Verify against R5 logs iter 38 P1.

3. **Mistral primary 70 % allocation may be the wrong default** if Mistral cold start consistently spikes p99. Iter 38 may want canary 50/30/20 (Small / Together / Large). Per-provider p95 from R5 logs not currently aggregated.

4. **`aggregateOnniscenza` 200 ms cap is a band-aid.** L1 inside Onniscenza calls `hybridRetrieve` which itself fans out BM25 + dense + (optional) wiki-fusion = 3-4 parallel requests. Cap likely triggers more often than not. Iter 38 P1: profile L1 actual completion vs timeout-discard rate.

5. **Fallback chain at `llm-client.ts:435` is sequential**, not parallel. Mistral fail → wait 15 s timeout → try Gemini → wait → try Brain. Iter 38 G (parallel-race) addresses; iter 37 D (8 s edge timeout) is a coarser cheaper fix already shipped.

6. **Mistral 10× TTFT announcement (Reddit blocked)**: best public knowledge is that the improvement is server-side automatic — ELAB iter 37 4496 ms baseline likely already captures it. **No untapped lever.** Documenter to verify iter 38 entrance via Mistral changelog page.

7. **Mixtral 8×7B is `mistral-small` endpoint**: ELAB already running on Mixtral backend. The "Mixtral migration" Andrea expected is **already done implicitly**. Real lever is shifting allocation Large 20 % → 10 % (candidate R) since Large is dense 123 B and 2-3× slower.

8. **Voxtral Transcribe 2 migration (Q)** is the highest-strategic-value iter 38 atom: closes vendor-coherence gap (Morfismo Sense 2), simplifies GDPR audit (1 sub-processor instead of 2), and lands −400 ms STT path. Effort 6 h is concentrated, but `voxtral-client.ts` already exists for TTS — extend with STT method.

9. **Voxtral.c local fallback (Sprint U)**: native C inference 23.5 ms/step on Mac Mini M4 ≈ 2.5× real-time. Cost-saves €18/mo Mistral Scale tier when budget tight. Defer iter 39+ with explicit cost-benefit analysis. Current Voxtral hosted is well within budget.

10. **arxiv 2602.11298v3 (Andrea-supplied URL)**: ambiguous, skipped pending clarification. Documenter to ask Andrea iter 38 entrance which paper / which section relevant.

---

## 6. Files delivered

- `docs/audits/iter-37-latency-rca-iter-38-plan.md` — 552 LOC (target was ~400, expanded to absorb 19 sources Andrea-added mid-audit; sections 1-12 + 19 references)
- `automa/team-state/messages/perf-engineer-iter37-phase3-completed.md` — this file

No source code modified. No commits made. No deploys triggered. vitest baseline 13474 NOT verified (out of perf-engineer scope, orchestrator Phase 3 entrance gate). `--no-verify` not used. Pre-commit / pre-push hooks not bypassed. File ownership respected.

---

## 7. Anti-regression compliance

- ✅ No production code modified (audit-only role).
- ✅ vitest baseline 13474 untouched (no test changes).
- ✅ No `--no-verify`. No push to main.
- ✅ File ownership: only created `docs/audits/iter-37-latency-rca-iter-38-plan.md` (NEW) + this completion message (NEW).
- ✅ No env changes. No deploys. No DB migrations.

Ready for orchestrator Phase 3 close: commit (NO push main, NO --no-verify) + handoff iter 38 entrance.