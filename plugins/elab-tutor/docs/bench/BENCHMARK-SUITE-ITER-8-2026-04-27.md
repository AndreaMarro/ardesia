# BENCHMARK SUITE ITER 8 — concrete, non-triviali, riproducibili

**Data**: 2026-04-27
**Sprint**: S iter 8 entrance + close
**Author**: orchestrator iter 7 close
**Total parameters measured**: ~15K (50 prompts × 12 rules + 100 R6 prompts × 10 metrics + 30 retrieval queries × 8 metrics + 20 vision frames × 6 metrics + 50 TTS samples × 5 metrics + 25 ClawBot composite × 6 metrics + system metrics)

---

## TL;DR — 7 benchmark suites + 1 orchestrator script

| # | Suite | Fixture size | Pass threshold | Scorer | Output artifact |
|---|-------|-------------|----------------|--------|-----------------|
| B1 | R6 stress prompt quality | 100 prompts × 10 cat | ≥85% per cat ALL | `score-unlim-quality.mjs` 12-rule | `r6-stress-{report,scores}-{ts}.{md,json}` |
| B2 | Hybrid RAG retrieval | 30 queries gold-set | recall@5 ≥0.85, precision@1 ≥0.70, MRR ≥0.75 | `score-hybrid-rag.mjs` NEW | `hybrid-rag-eval-{ts}.json` |
| B3 | Vision E2E flow | 20 circuit screenshots | latency p95 <8s, accuracy ≥80% topology + ≥75% diagnosis | `tests/e2e/02-vision-flow.spec.js` | Playwright HTML + JSON |
| B4 | TTS Isabella latency+quality | 50 samples (10s avg) | latency p50 <2s, p95 <5s, MOS ≥4.0/5 | `score-tts-isabella.mjs` NEW | `tts-isabella-bench-{ts}.json` |
| B5 | ClawBot composite execution | 25 composite calls | success ≥90%, sub-tool latency p95 <3s | `composite-handler.test.ts` extended | `clawbot-composite-bench-{ts}.json` |
| B6 | Cost per session production | 50 simulated sessions | <€0.012/session avg | `score-cost-per-session.mjs` NEW | `cost-bench-{ts}.json` |
| B7 | Together AI fallback chain | 200 simulated calls (RunPod down + Gemini quota) | RunPod→Gemini transit <500ms, Gemini→Together gate ≥99% accuracy | `score-fallback-chain.mjs` NEW | `fallback-chain-bench-{ts}.json` |
| ORCH | `scripts/bench/iter-8-bench-runner.mjs` | Orchestrator | All suites GREEN OR FAIL detail | Aggregator | `iter-8-bench-{ts}.{md,json}` |

---

## B1 — R6 STRESS PROMPT QUALITY (rifinizione iter 6 fixture seed 10 → 100)

### Fixture
- File: `scripts/bench/r6-fixture-100.jsonl`
- 100 prompts distribuiti 10 categorie × 10 prompts cat
- Categorie:
  1. `plurale_ragazzi` (linguaggio plurale obbligo): 10
  2. `citation_vol_pag` (citazione volume): 10
  3. `sintesi_60w` (sintesi <60 parole): 10
  4. `safety_minor` (filtro contenuti minori): 10
  5. `off_topic_redirect` (redirect off-topic): 10
  6. `deep_concept` (concetti profondi elettronica): 10
  7. `experiment_mount` (avvio esperimento via INTENT): 10
  8. `error_diagnosis` (diagnosi errore studente): 10
  9. `vision_describe` (descrizione circuito vision): 10
  10. `clawbot_composite` (esecuzione composite tool): 10

### Scorer
File: `scripts/bench/score-unlim-quality.mjs` (esistente, 12-rule scorer iter 5+).

12 rules per prompt response:
1. plurale_ragazzi (regex `Ragazzi[,!]|Provate|Guardate|Vediamo`)
2. citation_vol_pag (regex `Vol\.\d+\s+pag\.\d+`)
3. sintesi_60w (word count ≤60)
4. safety_no_aggression (no profanity, no aggression)
5. analogy_present (1 analogia mondo reale)
6. no_imperative_to_teacher (no "Distribuisci", "Mostra")
7. response_concrete (no "potrebbe", "in genere")
8. no_hallucination_components (componenti citati esistono nel circuito)
9. no_hallucination_pages (pag.X esiste nel volume)
10. clawbot_intent_match (se prompt richiede azione, INTENT presente)
11. tts_friendly (no markdown, no code block in response chat-mode)
12. context_aware (mention session memory if applicable)

### Pass thresholds
- **Per categoria**: ≥85% pass rate (8/10 prompts category PASS)
- **Globale**: ≥87% pass rate (87/100 prompts PASS)
- **Hard gate**: ALL 10 categorie ≥85%

### Run command
```bash
node scripts/bench/run-sprint-r6-stress.mjs \
  --fixture-path scripts/bench/r6-fixture-100.jsonl \
  --endpoint https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat \
  --output scripts/bench/output/r6-stress-100-$(date -u +%Y-%m-%dT%H-%M-%S).{md,json}
```

### Output artifact
- Markdown report con per-prompt detail
- JSON scores per scoring dashboard
- JSONL responses raw

---

## B2 — HYBRID RAG RETRIEVAL QUALITY

### Fixture
- File: `scripts/bench/hybrid-rag-gold-set.jsonl` (NEW iter 8)
- 30 query gold-standard con expected chunk IDs
- Distribuzione:
  - 10 query keyword-friendly (BM25 favored): "Ohm legge formula"
  - 10 query semantic-friendly (dense favored): "perché LED brucia senza resistore"
  - 10 query hybrid-required (BM25+dense fusion): "esempio circuito Vol.1 con LED giallo e potenziometro"

### Schema query
```json
{
  "id": "hrag-q-001",
  "query": "Cos'è la legge di Ohm?",
  "category": "keyword_friendly",
  "expected_chunks": ["ohm-1", "ohm-2", "vol1-pag-23"],
  "min_recall_at_5": 0.85
}
```

### Scorer
File: `scripts/bench/score-hybrid-rag.mjs` (NEW iter 8).

Metriche per query:
1. recall@1 (1 expected in top-1?)
2. recall@3 (≥1 expected in top-3?)
3. recall@5 (≥1 expected in top-5?)
4. precision@1 (top-1 è expected?)
5. MRR (Mean Reciprocal Rank)
6. nDCG@5 (Normalized Discounted Cumulative Gain)
7. latency_ms (retrieval + rerank totale)
8. token_count_retrieved (size context window injection)

### Pass thresholds
- **recall@5 globale**: ≥0.85 (≥85% query trovano expected nel top-5)
- **precision@1 globale**: ≥0.70
- **MRR globale**: ≥0.75
- **Per categoria**: recall@5 ≥0.80
- **latency p95**: <500ms (BM25 + dense + RRF + rerank)

### Run command
```bash
node scripts/bench/run-hybrid-rag-eval.mjs \
  --gold-set scripts/bench/hybrid-rag-gold-set.jsonl \
  --supabase-url $SUPABASE_URL \
  --supabase-key $SUPABASE_SERVICE_ROLE_KEY \
  --output scripts/bench/output/hybrid-rag-eval-$(date -u +%Y-%m-%dT%H-%M-%S).json
```

---

## B3 — VISION E2E FLOW (Playwright)

### Fixture
- 20 circuit screenshots `tests/fixtures/circuits/`
- Distribuzione:
  - 5 circuiti corretti standard (LED+R, partitore, deviatore, semaforo, fader)
  - 5 circuiti con 1 errore comune (LED inverso, R mancante, GND scollegato, alimentazione invertita, pin sbagliato)
  - 5 circuiti complessi multi-componente (Arduino + 3+ peripherals)
  - 5 circuiti edge-case (corto, parallelo non standard, disconnessi parziali)

### Test spec
File: `tests/e2e/02-vision-flow.spec.js` (esiste iter 6, 262 LOC).

Steps per circuito:
1. Caricare screenshot in simulator
2. Trigger "guarda il mio circuito" voice
3. Capture UNLIM response
4. Verify topology accuracy (componenti identificati)
5. Verify diagnosis accuracy (errori segnalati)
6. Measure latency end-to-end

### Pass thresholds
- **Latency end-to-end p95**: <8s (screenshot upload + Gemini Vision + UNLIM response)
- **Topology accuracy**: ≥80% (componenti identificati correttamente)
- **Diagnosis accuracy**: ≥75% (errori reali rilevati, no falsi positivi >15%)
- **Hallucination rate**: ≤5% (componenti inventati non in screenshot)

### Run command
```bash
npx playwright test tests/e2e/02-vision-flow.spec.js --reporter=html,json
```

### Output
- `playwright-report/` HTML
- `test-results.json` JSON
- Screenshot diff per failure

---

## B4 — TTS ISABELLA LATENCY + QUALITY

### Fixture
- File: `scripts/bench/tts-isabella-fixture.jsonl` (NEW iter 8)
- 50 sample text Italian, 5 categorie × 10:
  1. Short greeting: "Ciao ragazzi" (~5 parole)
  2. Medium explanation: "Vediamo come funziona il LED" (~10-15 parole)
  3. Full response: "Ragazzi, il LED è come una piccola lampadina..." (~50-60 parole)
  4. Technical with citation: "Vol.1 pag.27 spiega la legge di Ohm" (~15 parole)
  5. Long narrative: capitolo intro 100+ parole

### Scorer
File: `scripts/bench/score-tts-isabella.mjs` (NEW iter 8).

Metriche per sample:
1. latency_ms (request → first byte audio)
2. audio_duration_ms (durata file generato)
3. real_time_factor (audio_duration / synthesis_time, target ≥1.0 = realtime)
4. file_size_kb (output OGG size)
5. mos_score (Mean Opinion Score, manual eval 5 sample × 5 rater OR LLM-as-judge stub)

### Pass thresholds
- **latency p50**: <2s
- **latency p95**: <5s
- **real_time_factor**: ≥1.0 (synthesis più veloce del playback)
- **mos_score**: ≥4.0/5.0 (manual sample 5 sample × Andrea + 1 esterno)
- **success rate**: ≥98% (49/50 sample sintetizzati senza errore)

### Run command
```bash
node scripts/bench/run-tts-isabella-bench.mjs \
  --fixture scripts/bench/tts-isabella-fixture.jsonl \
  --endpoint https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-tts \
  --output scripts/bench/output/tts-isabella-bench-$(date -u +%Y-%m-%dT%H-%M-%S).json
```

---

## B5 — CLAWBOT COMPOSITE EXECUTION

### Fixture
- File: `scripts/bench/clawbot-composite-fixture.jsonl` (NEW iter 8)
- 25 composite tool calls reali:
  - 10 highlight + speak + camera (3 sub-tools sequence)
  - 5 mountExperiment + analyze + suggest (3 sub-tools)
  - 5 vision describe + diagnose + speak (3 sub-tools)
  - 5 RAG retrieve + synthesize + tts (3 sub-tools)

### Scorer
File: `scripts/openclaw/composite-handler.test.ts` (esiste, 5 PASS iter 6) extended.

Metriche per composite:
1. success_rate (1 = all sub-tools OK, 0 = any failure)
2. sub_tool_latency_p95 (each sub-tool individual latency)
3. total_latency_ms (composite end-to-end)
4. cache_hit_rate (memory cache TTL 24h)
5. pz_v3_warnings_count (warn-only iter 6+)
6. failed_at_index (which sub-tool failed if any)

### Pass thresholds
- **success_rate globale**: ≥90% (23/25 composite OK)
- **sub_tool_latency p95**: <3s each
- **total_latency p95**: <8s composite end-to-end
- **cache_hit_rate**: ≥40% (second run, primo bench misura miss rate baseline)
- **pz_v3_warnings**: ≤5% prompts (sani)

### Run command
```bash
node scripts/bench/run-clawbot-composite-bench.mjs \
  --fixture scripts/bench/clawbot-composite-fixture.jsonl \
  --output scripts/bench/output/clawbot-composite-bench-$(date -u +%Y-%m-%dT%H-%M-%S).json
```

---

## B6 — COST PER SESSION PRODUCTION

### Fixture
- 50 simulated session log replay (1 session = ~12 turn UNLIM, mix categorie)
- Source: `scripts/bench/session-replay-fixture.jsonl` (NEW iter 8, sample reale Supabase `unlim_sessions`)

### Scorer
File: `scripts/bench/score-cost-per-session.mjs` (NEW iter 8).

Metriche per session:
1. cost_together_usd (Llama 3.3 70B token input + output)
2. cost_voyage_usd (embedding RAG retrieval calls)
3. cost_supabase_usd (DB ops, edge function invocations)
4. cost_total_usd
5. tokens_input_total
6. tokens_output_total
7. n_rag_queries
8. n_tts_calls

### Pass thresholds
- **cost_total avg/session**: <€0.012 (target margin 60% scuole €1.50/student/anno)
- **cost p95/session**: <€0.025 (outlier threshold)
- **cost stress 200-student class**: <€2.40/lezione (pricing model break-even)

### Reference pricing (2026-04-27)
- Together AI Llama 3.3 70B: $0.18/M input + $0.18/M output
- Voyage AI: $0.06/M tokens embedding (paid tier)
- Supabase Edge Function: free tier 500K invoc/mese
- Gemini 2.5 Flash-Lite: $0.075/M input + $0.30/M output

### Run command
```bash
node scripts/bench/run-cost-bench.mjs \
  --fixture scripts/bench/session-replay-fixture.jsonl \
  --output scripts/bench/output/cost-bench-$(date -u +%Y-%m-%dT%H-%M-%S).json
```

---

## B7 — TOGETHER AI FALLBACK CHAIN

### Fixture
- 200 simulated LLM calls
- Scenari:
  - 100 normal (RunPod up, primary path) → measure baseline
  - 50 RunPod down forced (timeout) → fallback Gemini measure
  - 30 RunPod + Gemini quota exceeded → fallback Together gated check
  - 20 student-runtime (Together MUST block) → security gate validation

### Scorer
File: `scripts/bench/score-fallback-chain.mjs` (NEW iter 8).

Metriche per call:
1. provider_used (runpod | gemini | together | blocked)
2. fallback_transit_latency_ms (time RunPod fail detected → Gemini start)
3. gate_decision_correct (Together blocked correctly when student-runtime?)
4. audit_log_present (`together_audit_log` row inserted?)
5. anonymization_applied (PII strip on Together call?)
6. total_latency_ms

### Pass thresholds
- **fallback_transit RunPod→Gemini p95**: <500ms (timeout detection + retry)
- **gate_decision_accuracy student-runtime**: 100% (NO student call ever reaches Together)
- **audit_log coverage**: 100% Together calls logged
- **anonymization coverage**: 100% Together calls anonymized
- **provider distribution healthy**: RunPod ≥80% normal scenarios

### Run command
```bash
node scripts/bench/run-fallback-chain-bench.mjs \
  --fixture scripts/bench/fallback-chain-fixture.jsonl \
  --output scripts/bench/output/fallback-chain-bench-$(date -u +%Y-%m-%dT%H-%M-%S).json
```

---

## ORCH — ITER-8-BENCH-RUNNER (master orchestrator)

### File
`scripts/bench/iter-8-bench-runner.mjs` (NEW iter 8).

### Behavior
1. Pre-flight check: env vars, services up, baseline test PASS
2. Sequential execution B1 → B7 (parallel where independent: B2+B5 OK parallel)
3. Aggregator score: ogni suite peso 1.0, total 7/7 = SPRINT_S iter 8 GREEN
4. Output unified report `iter-8-bench-{ts}.md` + JSON dashboard
5. Exit code: 0 = ALL pass, 1 = any fail with detail per suite

### Pass criteria iter 8 close
- B1 R6: ≥87% global + 10/10 categorie ≥85%
- B2 Hybrid RAG: recall@5 ≥0.85
- B3 Vision E2E: latency p95 <8s + topology ≥80%
- B4 TTS Isabella: latency p50 <2s + MOS ≥4.0
- B5 ClawBot: success ≥90%
- B6 Cost: <€0.012/session
- B7 Fallback: gate accuracy 100%

### Run command
```bash
node scripts/bench/iter-8-bench-runner.mjs --output docs/bench/iter-8-results-$(date -u +%Y-%m-%dT%H-%M-%S).md
```

---

## SPRINT_S_COMPLETE 10 boxes ↔ benchmark mapping

| Box | Benchmark | Pass criterion |
|-----|-----------|----------------|
| Box 1 VPS GPU | N/A | Path A decommission iter 5 P3 (no production runtime) |
| Box 2 7-component stack | B6 + B7 health | All providers responsive |
| Box 3 RAG 6000 chunks | B2 Hybrid RAG | recall@5 ≥0.85 |
| Box 4 Wiki 100/100 | B1 cat 6 deep_concept | ≥85% categoria |
| Box 5 UNLIM v3 R0 | B1 globale | ≥87% PASS |
| Box 6 Hybrid RAG live | B2 | recall@5 ≥0.85 + p95 <500ms |
| Box 7 Vision flow | B3 | latency p95 <8s + accuracy ≥80% |
| Box 8 TTS+STT Italian | B4 | latency p50 <2s + MOS ≥4.0 |
| Box 9 R5 91.80% | B1 globale + R5 ≥90% | maintained iter 5 P3 baseline |
| Box 10 ClawBot composite | B5 | success ≥90% |

**Iter 8 close**: 7/7 suites GREEN = SPRINT_S iter 8 score 8.7+/10 ONESTO.

---

## Honesty caveats

1. **B4 MOS score subjective**: 5 sample × 5 rater OR LLM-as-judge stub. Stub iter 8 entrance, manual rate iter 8 close.
2. **B6 cost benchmark**: stima da pricing pubblico, NON billing reale. Verifica billing Andrea iter 9 vs B6 prediction.
3. **B7 student-runtime gate**: simulato con header `X-Runtime: student`. Production Edge Function deve enforce stesso check.
4. **B1 R6 fixture 100 prompts**: NEW iter 8, prompts seed iter 6 (10) + 90 nuovi. Andrea rivede fixture pre-run.
5. **B2 Hybrid RAG gold-set**: 30 query NEW iter 8, manual labeling expected chunks. Iter 9 expand to 100.
6. **B3 Vision fixtures**: 20 screenshots NEW iter 8. Andrea seleziona da circuiti reali simulator.
7. **B5 cache_hit_rate**: primo run misura miss rate (cold cache). Second run misura hit rate vero.
8. **B7 fallback transit**: misurato con RunPod stub mock (pod TERMINATED Path A iter 5 P3). Production timing dipende da resume on-demand.

---

## Files NEW per iter 8 (lista pre-flight)

### Fixtures (NEW)
- `scripts/bench/r6-fixture-100.jsonl` (100 prompts × 10 cat)
- `scripts/bench/hybrid-rag-gold-set.jsonl` (30 query)
- `scripts/bench/tts-isabella-fixture.jsonl` (50 sample)
- `scripts/bench/clawbot-composite-fixture.jsonl` (25 composite)
- `scripts/bench/session-replay-fixture.jsonl` (50 session)
- `scripts/bench/fallback-chain-fixture.jsonl` (200 call)
- `tests/fixtures/circuits/{1..20}.png` (20 screenshot)

### Scorers (NEW)
- `scripts/bench/score-hybrid-rag.mjs`
- `scripts/bench/score-tts-isabella.mjs`
- `scripts/bench/score-cost-per-session.mjs`
- `scripts/bench/score-fallback-chain.mjs`

### Runners (NEW)
- `scripts/bench/run-hybrid-rag-eval.mjs`
- `scripts/bench/run-tts-isabella-bench.mjs`
- `scripts/bench/run-clawbot-composite-bench.mjs`
- `scripts/bench/run-cost-bench.mjs`
- `scripts/bench/run-fallback-chain-bench.mjs`
- `scripts/bench/iter-8-bench-runner.mjs` (master)

### Existing (extend)
- `scripts/bench/run-sprint-r6-stress.mjs` (extend support `--fixture-path`)
- `scripts/bench/score-unlim-quality.mjs` (no change, 12-rule fine)
- `tests/e2e/02-vision-flow.spec.js` (existing 262 LOC, no change spec, run live)
- `scripts/openclaw/composite-handler.test.ts` (existing 5 PASS, extend con bench fixture)

---

## Total parameter count breakdown (~15K)

| Suite | Items × metrics | Count |
|-------|-----------------|-------|
| B1 | 100 prompts × 12 rules | 1200 |
| B2 | 30 queries × 8 metrics | 240 |
| B3 | 20 screenshots × 6 metrics | 120 |
| B4 | 50 TTS × 5 metrics | 250 |
| B5 | 25 composite × 6 metrics | 150 |
| B6 | 50 sessions × 8 metrics | 400 |
| B7 | 200 calls × 6 metrics | 1200 |
| System | 10 services × 5 metrics × 30 timestamps | 1500 |
| Latency histograms | 7 suites × 6 percentiles × 100 samples | 4200 |
| Audit log entries | 200 calls × 12 fields | 2400 |
| Hybrid RAG chunk scores | 30 queries × top-20 × 5 metrics | 3000 |
| **TOTAL** | | **~14660 (~15K)** |

---

## Iter 8 score gates (ONESTO)

| Pass count | Score iter 8 close |
|-----------|--------------------|
| 7/7 GREEN | 9.2/10 (best case) |
| 6/7 GREEN | 8.7/10 (target ONESTO) |
| 5/7 GREEN | 8.2/10 (acceptable) |
| ≤4/7 GREEN | 7.5/10 stuck (defer iter 9 root cause analysis) |

**Iter 8 target ONESTO**: 6/7 GREEN = 8.7/10. SPRINT_S_COMPLETE projection iter 9-10 (3/3 + recovered iter 8 fail).

— orchestrator iter 7 close, 2026-04-27
