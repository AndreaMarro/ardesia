# Iter 37 Phase 3 Comprehensive Status — Honest re-read everything

**Date**: 2026-04-30 19:30 UTC | **Branch**: `e2e-bypass-preview` | **Status**: Phase 3 close pending Tester-6 BG R7 verify v53 + commit + push + Vercel deploy

---

## §1 Executive summary onesto

**Score G45 cap mechanical**: 8.0/10 (Documenter Phase 2 verdict mechanical PDR §4 R5 latency >2424ms baseline rule — NO override anti-inflation).

**Score raw post Phase 3 fixes** (orchestrator estimate, NON-binding): 9.05 → cap 8.0.

**Pattern S r3 race-cond fix VALIDATED 9th iter consecutive** (iter 5 P1+P2, iter 6 P1, iter 8 r2, iter 11, iter 12 r2, iter 19, iter 36, **iter 37**).

**Filesystem barriers totale 12 completion msgs** confirmed:
- 4 Phase 1 (Maker-1, Maker-2, Tester-1, WebDesigner-1) = 672 LOC
- 1 Phase 2 (Documenter) = 167 LOC
- 5 Phase 3 fix (Tester-2 R6+R7, Tester-3 Playwright, Tester-4 STT, Maker-3 esperimenti, Tester-5 R7-pre-fix)
- 1 Phase 3 inline (Perf Engineer 156 LOC) = pending Tester-6 (BG)
- 1 orchestrator START + 1 ratify confirm Andrea

**Iter 37 deploys**:
- unlim-chat v48 (iter 36 baseline) → v50 (Maker-1 iter 37 Phase 1) → v51 (system-prompt INTENT v1) → v52 (timeout + max_tokens) → v53 (parser tool|action + system-prompt MANDATORY + few-shot)
- unlim-stt v? (STT v2 fix Array.from + format-specific Content-Type)

**Vitest authoritative final**: 13474 PASS + 15 skip + 8 todo (+136 vs Phase 1 close 13338, +214 vs PDR baseline 13260, ZERO regression).

**Build PASS** 15m 25s, dist/sw.js + workbox + 32 precache 4803KB.

---

## §2 PDR §1 obiettivi 10 punti — status onesto post Phase 3

| # | Obiettivo | Status | Evidence |
|---|-----------|--------|----------|
| 1 | ADR-028 ratify YES + Edge Function unlim-chat redeploy A1 INTENT parser | ✅ | ACCEPTED PATH 1 (orchestrator inline ratify file `andrea-ratify-adr028-CONFIRMED.md`); Edge Function v53 LIVE prod |
| 2 | ADR-028 §14 amend (Maker-2) surface-to-browser pivot doc | ✅ | Lines 216-258 replaced (+17 LOC net), status PROPOSED→ACCEPTED |
| 3 | Vision deploy verify Gemini Flash fallback chain | ✅ | Smoke HTTP 200 Italian "Ragazzi" Pixtral 12B 2748ms (Gemini auto-fallback to Pixtral verified) |
| 4 | Latency p95 chat <4s warm (target <3000ms) | ⚠️ | R5 p95 10096ms (mitigation timeout 8s + max_tokens 120 v52 deployed, NON re-misurato post-deploy) — gap iter 38 P0 |
| 5 | STT CF Whisper format fix Voxtral Ogg Opus → CF Whisper input | ✅ | 9/9 PASS post v2 fix (Array.from + format-specific Content-Type) — Bug iter 31-32 carryover RESOLVED |
| 6 | HomePage Atom A13b Chatbot-only + Cronologia + Easter modal full | ✅ | ChatbotOnly 496 LOC + EasterModal 261 LOC + HomePage hooks +93 + 26 unit tests PASS |
| 7 | Wake word "Ehi UNLIM" mic permission auto-warm-up | ✅ | "Ragazzi, microfono non autorizzato..." plurale prepend iter 36 line 141 verified (PRINCIPIO ZERO V3 compliant) |
| 8 | 5+2=7 missing esperimenti REAL Vol3 | ✅ | 87+5+2=94 esperimenti shipped (Maker-1 5/7 Phase 1 + Maker-3 2/7 Phase 3 deferred chiusi inside iter 37) |
| 9 | ToolSpec count definitivo 57 vs 62 verify + sync docs | ✅ | **57 DEFINITIVE** (grep multi-pattern verify + sync CLAUDE.md "52"→57 + ADR-028 §3 "62-tool"→57 multiple references) |
| 10 | R5+R6+R7 bench scale post-tune | ⚠️ | R5 50/50 PASS 93.60% ✓; R6 recall@5 0.067 (fixture mismatch + page null prod); R7 0% pre-fix → **Tester-6 BG verifying v53 post all fix** |

**8/10 ✅ definitive | 1/10 ⚠️ p95 mitigation deployed-not-remeasured | 1/10 ⚠️ Tester-6 BG verify pending**

---

## §3 Phase timeline complete

### Phase 0 (orchestrator inline, ~30min)
- Pre-flight CoV: vitest 13260 PASS + Edge unlim-chat v48 ACTIVE + Mac Mini 4 cron + LLM_ROUTING token loaded
- Andrea ratify queue acquired (AskUserQuestion 3 questions)
- Andrea PATH 1 confirmed via "scelta oggettivamente migliore senza debito tecnico"
- LLM_ROUTING_WEIGHTS 70/20/10 conservative SET prod (env-only, no deploy)
- Vol3 ODT extracted `/tmp/manuale-vol3-iter37.txt` 4389 righe (Davide co-author sostituto)

### Phase 1 (4 agents BG OPUS parallel, ~6-8h)
- **Maker-1** (backend-architect): A2 Onniscenza conditional 30/30 tests + A4 STT v1 fix + A5 deploy v50 + A9 5/7 esperimenti + B-NEW intentsDispatcher 22/22 tests
- **Maker-2** (code-architect): blueprint ADR-028 §14 amend + ADR-029 (orchestrator inline applied to disk + completion msg)
- **WebDesigner-1** (frontend-developer): ChatbotOnly 496 LOC + EasterModal 261 LOC + HomePage hooks +93 + 26 unit tests
- **Tester-1** (team-debugger): R5 50/50 PASS 93.60% + Playwright 0/4 FAIL gate timeout + pre-flight CoV table

Vitest 13338 PASS Phase 1 close (+78 vs PDR 13260).

### Phase 2 (Documenter sequential, ~2h25min)
- audit `docs/audits/2026-04-30-iter-37-PHASE3-CLOSE-audit.md` 419 LOC, 13 sezioni
- handoff `docs/handoff/2026-04-30-iter-37-to-iter-38-handoff.md` 253 LOC, 9 sezioni
- CLAUDE.md APPEND iter 37 close section ~152 LOC line 1432
- ToolSpec count definitive 57 (grep `^\s+name:\s+["\047]`)
- Score G45 cap mechanical 8.0/10 (PDR §4 R5 latency rule trigger)

### Phase 3 (orchestrator inline + 5 fix BG agents, ~6h cumulative)
- **STT v2 fix orchestrator inline**: cloudflare-client.ts cfWhisperSTT changed `bytesToBase64()` → `Array.from(audioBytes)` (CF canonical REST format) + format-specific Content-Type fallback (audio/wav, audio/mpeg, audio/ogg, audio/webm, audio/flac, audio/mp4) → DEPLOY unlim-stt → Tester-4 9/9 PASS verified
- **Tester-2 R6+R7 runners build + execute** (NEW iter 37 — runners non esistevano disk pre-iter-37):
  - R6 100/100 success, recall@5 0.067 vs target 0.55 = FAIL (fixture format mismatch + L2 router bypass 48% + page null prod storage)
  - R7 200/200 success, **canonical INTENT 0%** vs target 80% = FAIL (combined 42% with legacy `[AZIONE:...]` syntax via L2 templates)
- **Tester-3 Playwright gate refactor**: 0/4→2/4 PASS + 1/4 SKIP (selector Italian iter 38 5-line fix) + 1/4 prod regression Fumetto stub-fallback iter 38 P0 + helper `welcome-gate-bypass.js` 262 LOC reusable
- **Tester-4 STT smoke 9-cell matrix**: 9/9 FAIL pre-fix → 9/9 PASS post-fix v2 verified
- **Maker-3 A9 2/7 deferred experiments**: shipped v3-cap7-mini + v3-cap8-serial + 22 test files atomic propagation 92→94 + 27→29 → vitest **13474 PASS** (+136) ZERO regression
- **Tester-5 R7 verify v51**: 0% canonical post-system-prompt-v1 = FAIL → DUAL ROOT CAUSE found (parser tool/args vs prompt action/params + system-prompt insufficient MANDATORY/few-shot)
- **Orchestrator inline DUAL FIX**:
  - intent-parser.ts:215-235 accept both `tool|action` + `args|params` (LLM-forgiving, 24/24 unit tests preserved)
  - system-prompt.ts:68-110 MANDATORY marker + canonical schema STRETTO `{tool, args}` + 12 tools whitelist + 3 few-shot Italian K-12 esempi reali
  - unlim-chat/index.ts:483-491 max_tokens 256→120 + Promise.race 8s timeout
  - DEPLOY v52 + v53
- **Tester-6 BG R7 re-verify v53** ⏳ pending notification
- **Perf Engineer BG iter 38 P0 plan**: 634 LOC plan + 19 sources + 12 sections + prioritized backlog DONE
- **CLAUDE.md sync**: "92 esperimenti" → "94 esperimenti" 3 references; "52 ToolSpec" → "57 ToolSpec" 2 references; ADR-028 "62-tool" → "57-tool" multiple references
- **Vitest CoV final** 13474 PASS authoritative confirmed
- **Build PASS** 15m 25s

---

## §4 14+ URL sources analysis (Andrea-provided iter 37 Phase 3)

### URL list ricevute oggi

| # | URL | Status fetch | Insight rilevante ELAB |
|---|-----|--------------|------------------------|
| 1 | apitestlab why-is-my-api-slow | (deferred — Perf Engineer absorbed) | Generic API patterns N+1 query, sync DB, missing indexes |
| 2 | medium dev-notebook your-api-is-slow | (Perf Engineer) | "Where you don't think" — middleware overhead, serialization |
| 3 | medium kaushalsinh why-your-api-is-slow | (Perf Engineer) | EXPLAIN queries, batch fetch single query |
| 4 | github kilocode 6031 | NOT (gh CLI suggested) | Issue tracking — not relevant |
| 5 | linkedin alexxubyte SystemDesign | (Perf Engineer) | Generic system design |
| 6 | zuplo solving-poor-api-performance | (Perf Engineer) | API gateway, edge caching, CDN |
| 7 | reddit Claude debug API slow | BLOCKED | reddit.com fetch blocked |
| 8 | zuplo mastering-api-throughput | (Perf Engineer) | Throughput patterns |
| 9 | community openai 210832 | NOT verified | OpenAI specific, less relevant Mistral |
| 10 | bytebytego top-5-improve-api | (Perf Engineer) | Caching, async, pagination, batch, indexing |
| 11 | stackademic from-slow-to-supercharged | (Perf Engineer) | Eager loading, indexing |
| 12 | linkedin milan-jovanovic 17h | (Perf Engineer) | Endpoint optimization deep dive |
| 13 | **Azure LLM Latency Guidebook** | ✅ FETCHED | **Top 10 GenAI techniques + impact %**: token compression 2-3x ✓ shipped, semantic caching 14x P0, parallelize 72x P0, model selection 4x ✓, language-specific 3x, co-location 1-2x, load-balance 2x |
| 14 | **seangoedecke fast-llm-inference** | ✅ FETCHED | KV cache, speculative decoding, batching — N/A self-host (ELAB API hosted), pattern memory bandwidth |
| 15 | kdnuggets top-5 LLM API providers | (Perf Engineer) | Provider comparison |
| 16 | **Mistral docs API** | ✅ FETCHED 2x | streaming SSE ✓ + response_format json_schema ✓ + tools function calling ✓ |
| 17 | reddit Mistral 10x TTFT | BLOCKED | reddit.com fetch blocked |
| 18 | **Lightning vLLM Mistral 7B** | ✅ FETCHED partial | PagedAttention, continuous batching — N/A self-host context |
| 19 | **antirez voxtral.c** | ✅ FETCHED | Native C Voxtral inference Apple M3 Max 2.5x real-time + chunked encoder + rolling KV cache 8192 — iter 39+ local fallback option |
| 20 | **digitalapplied Voxtral TTS** | ✅ FETCHED | 70ms H200 latency + 9.7x real-time + voice cloning 3s + ElevenLabs 68.4% win rate — ELAB già usa Voxtral primary |
| 21 | **arxiv Voxtral Realtime paper** | ✅ FETCHED | Causal audio encoder + Ada RMS-Norm + temporal adapter 4x downsample + paged attention heterogeneous KV + streaming WS bidirectional + resumable requests + 13 lingue + 480ms latency on-par-Whisper |
| 22 | **simonwillison Voxtral 2** | ✅ FETCHED | Hands-on: $0.18/hour STT + speaker diarization + context bias + Datasette example |
| 23 | **mistral.ai Voxtral Transcribe 2** | ✅ FETCHED CRITICAL | $0.003/min Mini + $0.006/min Realtime + Italian K-12 ✓ + sub-200ms Realtime + 4% WER FLEURS + 13 lingue + mp3/wav/m4a/flac/ogg + 3 ore max + 1GB max |
| 24 | **mistral.ai Mixtral of Experts** | ✅ FETCHED | MoE 8x7B 12.9B active vs 47B totale + 6x faster Llama 70B + Italian native + 32k context + **deployed via mistral-small endpoint** |
| 25 | **superannotate Mixtral analysis** | ✅ FETCHED | "mistral-small API endpoints" = Mixtral backend — ELAB già usa MoE optimal |
| 26 | docs.mistral.ai/api 2x | ✅ FETCHED | response_format json_schema + tools + parallel_tool_calls default true |
| 27 | docs.mistral.ai hub | ✅ FETCHED | Le Chat + Studio + Vibe + agents + RAG + fine-tuning |
| 28 | **mistral.ai Mistral OCR** | ✅ FETCHED | $1/1000 pages + 2000 pages/min + 94.89% accuracy + Italian + tables/figures/equations + iter 38 P2 candidate Vol PDF re-ingest |
| 29 | docs.mistral.ai/developers | ✅ FETCHED | SDK Python/TS quickstarts + cookbooks + changelogs |

### Insight chiave consolidati

1. **ELAB Mistral Small endpoint = Mixtral 8x7B MoE già** — 70/20/10 routing 70% MoE traffic = già ottimale, NO swap iter 38 needed
2. **Mistral function calling `response_format: json_schema` + `tools`** = guaranteed structured output → R7 INTENT exec rate ≥95% expected (vs prompt teaching unreliable)
3. **Mistral Voxtral Transcribe 2** = strategic STT migration iter 38 P0: $0.003/min + Italian + EU GDPR clean Francia + stack 100% Mistral coherence (sostituisce CF Whisper US/EU edge)
4. **Mistral OCR** = iter 38 P2 Vol PDF re-ingest pipeline (vs current Voyage 1881 chunks Together Llama 3.3 70B contextualization)
5. **Mistral streaming SSE** = TTFB perceived improvement iter 38 P1
6. **Token generation compression** già shipped iter 31+37 (max_tokens 256→120) = -40% gen output
7. **Semantic caching** = iter 38 P0 highest-impact (14x potential, KV namespace o Supabase Redis)
8. **Parallelize requests** (Promise.all) iter 38 P0 (loadStudentContext + RAG retrieve concurrent)

---

## §5 Iter 38 P0 plan (Perf Engineer 634 LOC + 19 sources)

Reference master: `docs/audits/iter-37-latency-rca-iter-38-plan.md` (Perf Engineer Phase 3 deliverable)

### Tier 1 P0 (single-day budget Phase 1) — target R5 close avg ~3000ms / p95 ~6000ms

- **A**: Mistral function calling INTENT structured output (ADR-030 candidate, 4-6h, R7 ≥95% expected)
- **B**: Streaming SSE Mistral Small/Large `stream: true` (TTFB perceived improvement)
- **C₂**: Promise.all parallelize loadStudentContext + RAG retrieve (Azure +72x potential)
- **E**: Onniscenza topK 3→2 default + skip already wired chit_chat
- **F**: Edge Function timeout 8s already shipped iter 37 ✓ — measure effectiveness
- **I**: Cron 30s warmup ping prevent cold start
- **O**: Mistral La Plateforme prompt caching headers (if shipped — verify docs)
- **R**: Reduce Mistral Large 20%→10% routing weights (-400ms p95 on 10% traffic)
- **Q**: STT migration CF Whisper → Voxtral Transcribe 2 (⭐ strategic, -400ms STT path, EU GDPR clean stack)

### Tier 2 P1 (~3-5d each) — architecture deeper

- **P**: Mistral structured output via `response_format: json_schema` (alternative to A function calling)
- Multi-region Edge Function deploy (eu-central-1 + eu-west-1)
- Semantic cache layer (Supabase KV o CF KV namespace) (Azure 14x potential)
- Async TTS (return text first, fetch TTS in parallel)
- Preflight OPTIONS cache 24h

### Tier 3 P2 (iter 39+) — strategic

- voxtral.c local fallback inference Apple M3 Max (cost discipline Mistral Scale tier €18/mese)
- Mistral OCR Vol PDF re-ingest pipeline (vs Voyage 1881 chunks)
- Streaming WS bidirectional Voxtral Realtime full-duplex audio
- Mistral embeddings consolidation (vs Voyage 1024-dim)

---

## §6 Honesty caveats critical

### Cosa è realmente shipped iter 37

1. **STT 9/9 PASS verified prod** ✅ (CF Whisper Array.from fix + format-specific Content-Type)
2. **94 esperimenti** ✅ (Maker-3 +136 vitest tests, ZERO regression)
3. **HomePage A13b** ✅ (ChatbotOnly + EasterModal + 26 tests)
4. **ToolSpec 57 definitive** ✅ (grep multi-pattern verified + 3 docs synced)
5. **ADR-028 ACCEPTED + §14 amend + ADR-029 NEW** ✅
6. **Latency mitigation** (timeout 8s + max_tokens 120) ⚠️ DEPLOYED v52 NON re-misurato post-deploy R5 bench
7. **INTENT canonical fix DUAL ROOT CAUSE** (parser tool|action + system-prompt MANDATORY+few-shot) ⚠️ DEPLOYED v53, Tester-6 BG verifying
8. **Vision smoke** ✅ (Pixtral 12B 2748ms HTTP 200)
9. **Wake word "Ragazzi" prepend** ✅ (iter 36 line 141 verified)
10. **Pattern S r3 race-cond fix 9× iter consecutive** ✅

### Cosa NON è verified iter 37 (gap iter 38 P0)

1. **R5 latency p95 post-mitigation NON re-misurato** (Tester-2 measured pre-v52: 5071-5138ms; pre-v52 R5 10096ms; post-v52 expected ~6000ms but NOT measured)
2. **R7 INTENT canonical post-v53 PENDING Tester-6** (pre-fix 0%, post-v51 0%, post-v53 ⏳)
3. **R6 recall@5 0.067** (fixture mismatch + page null prod storage — ITER 38 P0 fixture rebuild + storage fix)
4. **Playwright 1/4 FAIL prod regression Fumetto** stub-fallback iter 36 A7 — iter 38 P0 investigate
5. **Lighthouse score** ChatbotOnly + EasterModal — defer iter 38
6. **Vercel deploy frontend** post key rotation iter 32 — pending Phase 3 close
7. **End-to-end browser INTENT dispatch** prod — requires Vercel deploy + smoke test

### Anti-inflation G45 mandate enforced

- NO claim "Onnipotenza FULL LIVE end-to-end" (R7 0% pre-v53 evidence; post-v53 verify pending)
- NO claim "Box 14 INTENT exec 1.0 ceiling" (browser dispatch shipped + parser fix shipped + system-prompt v53, but LLM emission verify pending)
- NO claim "p95 latency target met" (10096ms vs 3000ms gap honest, mitigation shipped not re-measured)
- NO claim "Lighthouse ≥90/95/100" (deferred iter 38)
- NO claim "Vision FULL deploy with Gemini Flash primary" (Pixtral active fallback verified, Gemini Flash primary path NOT verified — likely missing GOOGLE_API_KEY env)
- NO claim "Mistral function calling shipped" (iter 38 P0 ADR-030 candidate, NOT shipped iter 37)

---

## §7 Phase 3 close pending actions

### Immediate (post Tester-6 BG completion)

1. Tester-6 R7 verify v53 result analysis
2. Aggiornare CLAUDE.md iter 37 close section con tutti Phase 3 fix shipped (Tester-3+4+5+6 + Maker-3 + Perf Engineer + orchestrator inline parser + system-prompt + STT v2)
3. Update audit `2026-04-30-iter-37-PHASE3-CLOSE-audit.md` con addendum Phase 3 fixes
4. Update handoff `2026-04-30-iter-37-to-iter-38-handoff.md` con iter 38 P0 plan reference + 19 sources

### Final commit + push

5. Stage selective iter 37 files (NO `git add -A`):
   - 6 modified file iter 37 (CLAUDE.md, ADR-028, src/components/HomePage.jsx + lavagna/useGalileoChat.js, src/services/api.js, supabase/functions/_shared/cloudflare-client.ts + intent-parser.ts + system-prompt.ts + unlim-chat/index.ts, Maker-3 src/data/* 7 file, 22 test files Maker-3)
   - 30+ NEW file iter 37 (ADR-029, audits, handoff, completion msgs, src/components/chatbot/, src/components/easter/, src/components/lavagna/intentsDispatcher.js, supabase/functions/_shared/onniscenza-classifier.ts, tests/, scripts/, docs/audits/iter-37-evidence/)
6. Commit con messaggio descrittivo iter 37 Phase 3 close (NO `--no-verify`)
7. Push origin `e2e-bypass-preview` (NO push main)
8. Tag `iter-37-phase-3-close-2026-04-30`

### Vercel deploy + smoke

9. `npm run build && npx vercel --prod --yes` (build già PASS, frontend deploy)
10. Smoke prod verify post-deploy: HomePage hash routes #chatbot-only + #about-easter + Lavagna persistence + intentsDispatcher browser dispatch end-to-end

---

## §8 Score progression onesto

- **Iter 35 baseline**: 8.0/10
- **Iter 36 close**: 8.5/10 G45 cap
- **Iter 37 Phase 1 close**: 8.5/10 (Documenter ricalibrato)
- **Iter 37 Phase 3 close**: **8.0/10 G45 cap mechanical** (raw 9.05 → cap PDR §4 R5 latency rule)
  - Anti-inflation enforced: G45 mandate NO override mechanical rule
  - Honest delta vs iter 36: NO net lift score (PDR §4 cap rule fires), MA significant deliverables progress (94 esperimenti + STT fix + INTENT dual fix + 14+ URL sources iter 38 plan)
- **Iter 38 cascade target**: 9.0/10 (Mistral function calling + STT migration Voxtral + streaming SSE + parallelize)
- **Sprint T close iter 38**: 9.5/10 ONESTO conditional Onnipotenza Deno port + canary 5%→100% rollout per ADR-028 §7 + 14+ URL sources iter 38 P0 implementation

---

## §9 Documentation TODO post Tester-6 + Phase 3 close

- CLAUDE.md iter 37 close section UPDATE con Phase 3 timeline addendum
- audit Phase 3 close UPDATE con dual-root-cause INTENT discovery + STT v2 fix + Maker-3 94 esperimenti + Perf Engineer iter 38 plan reference
- handoff iter 38 UPDATE con iter 38 P0 backlog Tier 1+2+3 + 19 sources references
- Comprehensive status questo doc archive
- Commit message iter 37 Phase 3 close summary

---

**Status**: Phase 3 close pending Tester-6 BG R7 verify v53 + commit + push origin + Vercel deploy + smoke prod verify.

**Anti-regressione FERREA preservata**: vitest 13474 NEVER scendere ✓, build PASS ✓, NO `--no-verify` mai, NO push main, NO debito tecnico (eccetto carryover iter 38 P0 documented).
