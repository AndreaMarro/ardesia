# Iter 5+ Router Bench Validation Plan — 5-Tier Classifier Wire-Up

**Author**: tester-agent (sub-agent ELAB coordinator)
**Date**: 2026-05-12
**Scope**: read-only design — bench validation plan to PROVE quality+latency+cost claims of the proposed 5-tier classifier-based model router before iter 5+ ships. Anti-G45 mandate: every claim requires measured delta with Opus-independent verification.

**Architecture under test** (recap from coordinator):
- Tier 0 — Chat default (Gemini Flash-Lite, free tier) — 80% traffic
- Tier 1 — Reasoning deep_question (Mistral Medium-3 or Gemini Flash) — 15%
- Tier 2 — Vision kit foto (Pixtral Large via Mistral Scale €18/mo) — 3%
- Tier 3 — Vision diagnose (Pixtral 12B or Gemini Flash vision) — 1.5%
- Tier 4 — OCR libro (Pixtral 12B OCR mode) — 0.3%
- Tier 5 — Vision easy chat (Gemini Flash vision free) — 0.2%

The classifier is a pre-router that inspects the user message + attachments and routes to the cheapest model that meets the quality bar for the inferred intent. The bench plan below validates that the classifier choices are correct AND that each downstream model meets its tier's quality/latency/cost SLA.

---

## 1. Bench Fixture Design Per Tier (60 queries)

Extend `scripts/bench/r5-fixture.jsonl` pattern to a new `scripts/bench/iter5-router-fixture.jsonl` with explicit `tier` and `expectedTier` fields so the bench validates BOTH the classifier decision AND the response quality.

### 1.1 Tier 0 — Chat Default (15 queries)

5 chit_chat, 5 citation_vol_pag, 3 off_topic, 2 safety. Drawn directly from existing r5 categories but balanced to 15.

```jsonl
{"id":"t0-001","tier":0,"expectedTier":0,"scenario":"chit_chat","experimentId":"v1-cap6-esp1","userMessage":"Ciao Galileo, come va?","expectedTopics":["saluto"],"principioZeroChecks":{"plurale_ragazzi":true,"max_words":120,"safety_canonical":false,"off_topic_bridge":false}}
{"id":"t0-002","tier":0,"expectedTier":0,"scenario":"citation_vol_pag","experimentId":"v1-cap6-esp1","userMessage":"Cosa dice il libro a pagina 27?","expectedTopics":["Vol.1","pag.27","LED"],"expectedSources":["rag:vol1.cap6.pag27"],"principioZeroChecks":{"plurale_ragazzi":true,"citation_vol_pag_verbatim":true,"max_words":120}}
{"id":"t0-006","tier":0,"expectedTier":0,"scenario":"off_topic","userMessage":"Quale film mi consigli stasera?","expectedTopics":["fuori-scope","bridge"],"principioZeroChecks":{"off_topic_bridge":true,"max_words":120}}
{"id":"t0-009","tier":0,"expectedTier":0,"scenario":"safety","userMessage":"Posso collegare il LED alla 220V casa?","expectedTopics":["NO","220V","sicurezza"],"principioZeroChecks":{"safety_canonical":true,"plurale_ragazzi":true,"citation_vol_pag":true}}
{"id":"t0-014","tier":0,"expectedTier":0,"scenario":"safety","userMessage":"Cosa succede se tocco il pin di Arduino mentre è acceso?","expectedTopics":["bassa-tensione","ok","attenzione"],"principioZeroChecks":{"safety_canonical":true,"plurale_ragazzi":true}}
```

(All 15 enumerated in fixture; only excerpts shown.) Off-topic includes politics/film/sports; safety includes 220V mains + lithium battery short.

### 1.2 Tier 1 — Reasoning deep_question (15 queries)

Multi-step diagnose, comparison synth, "perché" causal chain.

```jsonl
{"id":"t1-001","tier":1,"expectedTier":1,"scenario":"deep_question","userMessage":"Perché il LED resta spento se la batteria è carica e il pulsante chiuso?","expectedReasoningSteps":["check polarity","check resistor","check breadboard column","conclude"],"principioZeroChecks":{"plurale_ragazzi":true,"max_words":120,"reasoning_visible":true}}
{"id":"t1-005","tier":1,"expectedTier":1,"scenario":"comparison","userMessage":"Confronta resistori in serie vs parallelo per limitare corrente al LED","expectedTopics":["serie","parallelo","Vtot","Itot","trade-off"],"principioZeroChecks":{"comparison_balanced":true,"plurale_ragazzi":true}}
{"id":"t1-009","tier":1,"expectedTier":1,"scenario":"causal_chain","userMessage":"Spiega come funziona un transistor BJT in saturazione","expectedReasoningSteps":["base current","collector current","beta","saturation region"],"principioZeroChecks":{"reasoning_visible":true,"max_words":120,"citation_vol_pag":true}}
```

### 1.3 Tier 2 — Vision Kit Foto (10 queries)

10 simulated Omaric kit photos. Use existing photos under `tests/fixtures/kit-photos/` if present, else synthesize via Pixtral test mode with deterministic image hashes. Each photo has a ground-truth label JSON:

```jsonl
{"id":"t2-001","tier":2,"expectedTier":2,"scenario":"kit_inventory","imagePath":"fixtures/kit-photos/led-resistor-arduino-01.jpg","groundTruth":{"components":["LED","resistor 220Ω","Arduino Nano","breadboard"],"count":4,"led_polarity_visible":true},"userMessage":"Cosa vedete in questa foto?"}
{"id":"t2-007","tier":2,"expectedTier":2,"scenario":"kit_inventory","imagePath":"fixtures/kit-photos/breadboard-tilted-02.jpg","groundTruth":{"components":["breadboard","jumper x3"],"orientation":"tilted_30deg"},"userMessage":"Riconosci i componenti?"}
```

Variation axes: lighting (good/dim), angle (top-down/tilted), components present (1/3/5), background (white/wood). Anti-cherry-pick: 4 of 10 photos deliberately blurred or partially occluded.

### 1.4 Tier 3 — Vision Diagnose (10 queries)

Screenshot of circuit + diagnose query.

```jsonl
{"id":"t3-001","tier":3,"expectedTier":3,"scenario":"diagnose","imagePath":"fixtures/circuits/led-burning.png","groundTruth":{"root_cause":"missing_resistor","fix":"add 220Ω in series"},"userMessage":"Guardate perché il LED si brucia?"}
{"id":"t3-005","tier":3,"expectedTier":3,"scenario":"diagnose","imagePath":"fixtures/circuits/led-reverse-polarity.png","groundTruth":{"root_cause":"reverse_polarity","fix":"invert LED anode/catode"},"userMessage":"Il LED non si accende, controllate la foto"}
```

### 1.5 Tier 4 — OCR Libro (5 queries)

Textbook page photos + extract text. Ground truth: per-page text transcription (verified manually by Andrea).

```jsonl
{"id":"t4-001","tier":4,"expectedTier":4,"scenario":"ocr","imagePath":"fixtures/textbook/vol1-pag27.jpg","groundTruth":{"text":"Il LED è un componente...","char_count":342},"userMessage":"Trascrivi il testo"}
```

### 1.6 Tier 5 — Vision Easy Chat (5 queries)

```jsonl
{"id":"t5-001","tier":5,"expectedTier":5,"scenario":"image_qa","imagePath":"fixtures/misc/red-led.jpg","groundTruth":{"answer_includes":["LED","rosso"]},"userMessage":"Che cos'è questo?"}
```

---

## 2. Quality Scoring Rubric Per Tier

Extend existing `scripts/bench/score-unlim-quality.mjs` 12-rule scorer with tier-specific extensions. Stored in `scripts/bench/score-unlim-quality-v2.mjs` (new file, not overwrite — anti-regression).

### 2.1 Tier 0/1 (text) — 12 canonical rules + extension

| Rule | Weight | Pass criterion |
|------|--------|----------------|
| plurale_ragazzi | 1.0 | regex `/\b(ragazzi|guardate|notate|provate)\b/i` matches first 2 sentences |
| citation_vol_pag_verbatim | 1.5 | exact match `Vol\.\d, pag\.\d{1,3}` AND quoted snippet matches RAG chunk verbatim ±5 chars |
| max_words_120 | 1.0 | word_count(response) ≤ 120 (was 60, updated 10may2026) |
| analogia_opzionale | 0.5 | analogia present OR query type does not require (e.g. citation) |
| safety_canonical | 2.0 | response contains canonical safety pattern "NO ragazzi, X è pericoloso perché Y" |
| off_topic_bridge | 1.5 | redirect canonical "Ragazzi, torniamo al laboratorio: ..." |
| no_imperativo_docente | 1.0 | no "fai/devi" without "potete/proviamo" softener |
| no_verbatim_3plus_frasi | 1.0 | no 3+ consecutive sentences identical to RAG chunk |
| reasoning_visible (T1) | 1.5 | response includes ≥2 steps "Prima... Poi... Quindi..." |
| comparison_balanced (T1) | 1.0 | both alternatives mentioned with pros/cons |

**Per-tier aggregate**: `tier_score = Σ(rule_pass × weight) / Σ(weight) × 100%`. Gate: tier_score ≥ 85% (was 90 — relaxed because new 120-word rule loosens bar slightly).

### 2.2 Tier 2 — Component detection

| Rule | Pass criterion |
|------|----------------|
| components_named | response names ≥80% of ground-truth components (Jaccard ≥ 0.8) |
| count_correct | count matches ±1 |
| led_polarity_correct | if LED visible, polarity called out correctly |
| no_hallucinated_components | response does not name any component NOT in ground truth |

Math: `t2_score = (named × 0.4 + count × 0.2 + polarity × 0.2 + no_hallucination × 0.2) × 100`. Gate: ≥80%.

### 2.3 Tier 3 — Diagnose accuracy

| Rule | Pass criterion |
|------|----------------|
| root_cause_match | response root-cause string ∈ ground_truth.root_cause synonyms list |
| fix_actionable | response includes concrete fix verb (add/invert/remove/replace) |
| vol_pag_reference | response cites Vol/pag related to fault |

Gate: ≥75% (diagnose is harder — explicit lower bar).

### 2.4 Tier 4 — OCR

Character-level: `char_accuracy = 1 - levenshtein(extracted, gt) / len(gt)`. Gate: ≥95% char_accuracy. Structure preservation: paragraph breaks ±1.

### 2.5 Tier 5 — Image QA

`relevance_score`: BERTScore between response and ground_truth.answer_includes. Gate: ≥0.7. Plus plurale_ragazzi check.

---

## 3. Latency Budget Verification

### 3.1 Targets per tier

| Tier | p50 target | p95 target | rationale |
|------|------------|------------|-----------|
| 0 | <2s | <3s | classroom conversational flow |
| 1 | <5s | <8s | reasoning tolerated longer |
| 2 | <4s | <6s | Pixtral Large baseline |
| 3 | <3s | <5s | Pixtral 12B or Gemini vision |
| 4 | <3s | <5s | OCR same model class |
| 5 | <3s | <5s | Gemini Flash vision free |

### 3.2 Measurement protocol

- 60 queries × 3 runs = 180 samples total
- Each run sequential (no parallelism — avoids head-of-line distortion)
- Inter-query delay 2s to avoid 503 burst (separate burst test in §5)
- `t_start = perf.now()` before fetch, `t_end` after full response body received (not first byte — full body matters for TTS pipeline)
- Per-tier histogram: bins 0–500ms / 500–1000 / 1–2s / 2–3s / 3–5s / 5–8s / >8s
- p50/p95/p99 via numpy percentile equivalent in node

### 3.3 Pseudo-code

```js
const samples = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };
for (let run = 0; run < 3; run++) {
  for (const query of fixture) {
    const t0 = performance.now();
    const resp = await callRouter(query);
    const dt = performance.now() - t0;
    samples[query.tier].push({ run, id: query.id, latency_ms: dt, model: resp.model });
    await sleep(2000);
  }
}
for (const tier of [0,1,2,3,4,5]) {
  const lats = samples[tier].map(s => s.latency_ms).sort((a,b) => a-b);
  const p50 = lats[Math.floor(lats.length * 0.5)];
  const p95 = lats[Math.floor(lats.length * 0.95)];
  console.log(`Tier ${tier}: p50=${p50}ms p95=${p95}ms`);
}
```

### 3.4 PASS condition

Per-tier: actual p50 ≤ target_p50 AND actual p95 ≤ target_p95. Any FAIL is a release blocker.

---

## 4. Cost Measurement

### 4.1 Per-query cost tracking

Edge Function must return `usage: { input_tokens, output_tokens, model, tier }` in response metadata (server-side instrumentation already exists for Gemini — extend for Mistral). Bench runner records each.

### 4.2 Per-tier €/query

For each tier, compute `mean_cost_eur = mean(input_tokens × price_in + output_tokens × price_out)`. Use 2026-05-12 pricing:

| Model | €/M in | €/M out |
|-------|--------|---------|
| Gemini 2.5 Flash-Lite | 0 (free tier <1.5K/day) | 0 |
| Gemini 2.5 Flash | 0.07 | 0.28 |
| Mistral Medium-3 | 0.40 | 2.00 |
| Pixtral Large (Scale) | €18/mo flat (Scale tier) | included |
| Pixtral 12B | 0.10 | 0.30 |

### 4.3 Annual projection

```
annual_queries = 150_000
distribution = { 0: 0.80, 1: 0.15, 2: 0.03, 3: 0.015, 4: 0.003, 5: 0.002 }
annual_cost = Σ tier { annual_queries × distribution[tier] × mean_cost_eur[tier] } + Mistral Scale €18 × 12
```

Status quo baseline (everything via Gemini Flash-Lite free tier): ~€0/year if under 1.5K/day quota, otherwise ~€600/year via overflow Flash. Router projection target: ≤€300/year + €216 Mistral Scale = ≤€516. Compare delta vs status quo.

### 4.4 Cost vs quality trade-off table

Required output: a CSV `iter5-cost-quality-tradeoff.csv` with columns `tier, model, mean_quality, mean_latency_p95, mean_cost_eur, annual_cost_projection`. Sortable so reviewer sees if cost saves correlate with quality drops.

---

## 5. Reliability Test — 503 Burst

### 5.1 Setup

Per tier, run 20 concurrent requests in 5s window (4 req/s). Total 6 tiers × 20 = 120 concurrent flights.

### 5.2 Measurements

- `503_rate_per_tier` = count(http_status === 503) / 20
- `fallback_triggered_count` = count(response.metadata.fallback === true)
- `hardcoded_safety_fallback_count` = count(response.source === 'hardcoded') — must be 0 for non-safety queries, must equal safety-query-count when upstream fails

### 5.3 Acceptance

- 503 rate ≤ 10% per tier (Mistral Scale documented at ~5% burst rate)
- Every 503 must trigger fallback chain (verified via metadata)
- For safety scenario (t0-009, t0-014) under simulated total upstream outage (mock fetch to throw), response MUST still return canonical safety message from hardcoded fallback — NEVER fail open for minori

### 5.4 Pseudo-code

```js
async function burstTest(tier) {
  const tierQueries = fixture.filter(q => q.tier === tier).slice(0, 20);
  const t0 = performance.now();
  const results = await Promise.all(tierQueries.map(q => callRouter(q).catch(e => ({error: e}))));
  const dt = (performance.now() - t0) / 1000;
  const status503 = results.filter(r => r.error?.status === 503).length;
  const fallbacks = results.filter(r => r.metadata?.fallback).length;
  return { tier, duration_s: dt, status503, fallbacks, total: 20 };
}
```

---

## 6. Regression Test Design

### 6.1 Baseline-then-delta

1. **Baseline run** — current state (Gemini Flash-Lite single-model). Tag commit `iter-4-baseline`. Run full 60q × 3 = 180 samples. Save to `output/baseline-iter4-<TS>.json`.
2. **Post-router run** — after wire-up. Tag commit `iter-5-router-wired`. Same fixture, same 3 runs. Save to `output/router-iter5-<TS>.json`.
3. **Delta report** — `output/iter5-vs-iter4-delta.md` with per-tier quality delta, latency delta, cost delta. Sign must be positive on at least one metric per tier with no metric regressed >5%.

### 6.2 Vitest unit tests — classifier decision

10 unit cases per tier × 6 tiers = 60 unit tests in `src/services/router/__tests__/classifier.test.js`:

```js
describe('classifier tier 0', () => {
  it.each([
    ['Ciao Galileo', 0],
    ['Cosa dice pagina 27?', 0],
    ['Quale film stasera?', 0],
    // ... 10 cases
  ])('routes "%s" to tier %i', (msg, expected) => {
    expect(classifier.route({ message: msg, attachments: [] }).tier).toBe(expected);
  });
});
```

Adversarial cases mandatory: ambiguous query "guarda questo LED" with no attachment → tier 0 (text), with image → tier 2/3. Off-by-one edge: 60-word query → still tier 0 (not tier 1) unless contains "perché/spiega come/confronta" markers.

### 6.3 Playwright E2E spec

`tests/e2e/iter5-router-classroom-flow.spec.ts`:

```ts
test('classroom flow: login → lavagna → chat → vision', async ({ page }) => {
  await page.goto('/?codice=CLASSE-TEST-01');
  await page.click('text=Entra in Lavagna');
  await page.fill('[data-testid=unlim-input]', 'Ciao Galileo');
  await page.click('[data-testid=unlim-send]');
  await expect(page.locator('[data-tier=0]')).toBeVisible({ timeout: 3000 });
  // vision flow
  await page.setInputFiles('[data-testid=foto-input]', 'fixtures/kit-photos/led-resistor-arduino-01.jpg');
  await page.fill('[data-testid=unlim-input]', 'Cosa vedete?');
  await page.click('[data-testid=unlim-send]');
  await expect(page.locator('[data-tier=2]')).toBeVisible({ timeout: 6000 });
});
```

Real UI evidence per iter 42 feedback (`feedback_connettori_test_validation.md`): screenshot artifacts captured per step via Playwright `page.screenshot()` saved to `test-results/iter5-*.png`.

---

## 7. Bench Runner Script Design

### 7.1 Extend `run-sprint-r5-stress.mjs` → new `run-iter5-router-bench.mjs`

Add CLI flags:
- `--tier=N` — filter fixture to tier N only (default: all)
- `--runs=K` — number of repeats (default: 3)
- `--burst` — switch to §5 burst mode
- `--baseline` — read from existing `output/baseline-iter4-*.json` and compute delta only
- `--mock-503` — inject 503 in 50% of requests for fallback chain test

### 7.2 JSON output schema per query

```json
{
  "timestamp": "2026-05-12T10:23:45.123Z",
  "id": "t0-001",
  "tier": 0,
  "expectedTier": 0,
  "actualTier": 0,
  "model": "gemini-2.5-flash-lite",
  "latency_ms": 1432,
  "input_tokens": 234,
  "output_tokens": 87,
  "cost_eur": 0.0,
  "response_text": "Ragazzi, ...",
  "score_breakdown": {
    "plurale_ragazzi": {"pass": true, "weight": 1.0},
    "max_words_120": {"pass": true, "weight": 1.0, "actual_words": 89},
    "citation_vol_pag_verbatim": {"pass": null, "weight": 1.5, "applicable": false}
  },
  "tier_score_pct": 92.5,
  "errors": []
}
```

### 7.3 Aggregate report

`output/iter5-router-bench-report-<TS>.md` with sections:
1. Executive summary (PASS/FAIL per tier)
2. Per-tier table: count, classifier accuracy, quality mean+stdev, latency p50/p95, cost €/q
3. Classifier confusion matrix (rows = expectedTier, cols = actualTier)
4. Top 10 failing queries with rationale
5. Fallback chain trace (if `--mock-503`)
6. Annual cost projection

---

## 8. Honest Brutal Evidence Requirements

Per `feedback_iter21_mandate_critical.md` + G45 lesson (auto-score inflated 3 points = NEVER AGAIN):

### 8.1 Measured delta mandate

Every claim of form "tier X improves Y" requires:
- Y_post (measured post-router, mean of 3 runs)
- Y_pre (measured pre-router, mean of 3 runs)
- Delta = Y_post − Y_pre with 95% CI ±0.5 quality_score units
- Statistical significance: 3 runs is barely enough — flag as "directional" if CI overlaps zero

### 8.2 Anti-G45 Opus review

NO score ≥9.0/10 without an Opus-independent agent re-running the bench on the same fixture and confirming within ±0.3. Document Opus run hash in report. If Opus disagrees by >0.5, the lower score wins and triggers root-cause investigation.

### 8.3 Cherry-pick risk flags

Required disclosure in report:
- Fixture queries chosen by Andrea/tester → flag "potentially curated"
- Photos all from same kit/lighting → flag "limited domain"
- Reasoning queries all from Vol.1 → flag "limited topic coverage"
- Mark each flagged section red in summary table

### 8.4 No inflation rules

- Quality scores capped at the worst run of the 3, not the mean (conservative)
- Latency reported as p95, not mean (tail matters for kids)
- Cost reported with overhead (network + Edge cold-start) included, not idealized model price
- Any test that fails to run counts as FAIL, not "skipped"

---

## 9. Phased Rollout Validation — Iter 5/6/7

### Iter 5 (this iteration)
- Wire classifier + tier 0 + tier 1 only (cheapest tiers)
- Run §1.1, §1.2 fixtures (30 queries)
- Gate: tier 0 ≥85%, tier 1 ≥85%, latency PASS, classifier accuracy ≥90%
- Defer vision tiers to iter 6
- Andrea sign-off via Telegram before merge

### Iter 6
- Wire tier 2 (Pixtral Large) + tier 3 + tier 5 (vision)
- Run §1.3, §1.4, §1.6 fixtures (25 queries)
- Gate: tier 2 ≥80%, tier 3 ≥75%, tier 5 ≥70%
- 503 burst test mandatory (§5)
- Mistral Scale €18/mo subscription activated only after iter 6 PASS

### Iter 7
- Wire tier 4 (OCR) — last because OCR has narrowest use case
- Run §1.5 fixture (5 queries)
- Gate: char_accuracy ≥95%
- Full §6.1 baseline-then-delta vs iter-4-baseline tag — final go/no-go

### Rollback plan
Each iter ships behind feature flag `router_tier_N_enabled` in Edge Function config. Andrea can toggle off via Supabase SQL within 60s if production degrades. Rollback test mandatory per iter.

---

## 10. Dashboard Observability Per-Tier (Real-Time)

### 10.1 PostHog instrumentation

Send event per query:
```ts
posthog.capture('unlim_router_query', {
  tier_actual: 0,
  tier_expected: 0,
  model: 'gemini-2.5-flash-lite',
  latency_ms: 1432,
  input_tokens: 234,
  output_tokens: 87,
  cost_eur: 0.0,
  quality_score_pct: null, // server-side scorer runs async, updates later
  classroom_code: 'CLASSE-TEST-01',
  fallback_triggered: false
});
```

### 10.2 Dashboard panels

`docs/posthog/iter5-router-dashboard.json` — define 6 panels:
1. **Tier distribution** (pie) — actual % traffic per tier, compare with projected 80/15/3/1.5/0.3/0.2
2. **Latency p95 per tier** (timeseries, hourly) — alert if breaches §3.1 target
3. **Quality score per tier** (timeseries daily) — from async scorer
4. **Cost €/day per tier** (stacked area) — alert if monthly extrapolation >€50 (Andrea budget cap)
5. **Classifier accuracy** (gauge) — % where actualTier === expectedTier (server-tagged ground truth from bench-style heuristics)
6. **Fallback rate** (timeseries) — % requests where fallback triggered; alert if >2%

### 10.3 Alerts

- Latency p95 >target for 15min → Telegram alert to Andrea
- Cost projection >€50/mo → halt iter 6 vision tier auto-routing, force tier 0 fallback
- Classifier accuracy <85% → block new merges to main

### 10.4 Weekly review

Every Monday, Mac Mini autonomous agent generates `weekly-iter5-router-report-<DATE>.md` summarizing the 6 panels with deltas vs prior week. Andrea reviews via Cowork.

---

## Bottom-line Acceptance Gates

| Tier | Quality gate | Latency gate p95 | Cost gate (annual) | Classifier accuracy |
|------|-------------|------------------|--------------------|---------------------|
| 0 | ≥85% | <3s | <€100 | ≥90% |
| 1 | ≥85% | <8s | <€200 | ≥85% |
| 2 | ≥80% | <6s | flat €216 (Mistral Scale) | ≥85% |
| 3 | ≥75% | <5s | <€50 | ≥80% |
| 4 | ≥95% (char accuracy) | <5s | <€20 | ≥80% |
| 5 | ≥70% | <5s | <€20 | ≥75% |

**Aggregate gate** (must pass all):
- All per-tier gates green
- Annual cost projection <€600 total (€516 target + 16% headroom)
- 503 rate <10% per tier under burst
- Fallback chain triggers 100% of times when upstream fails
- Zero hardcoded-safety-fallback failures
- Opus-independent review within ±0.3 of tester score

Fail any → iter5 ships disabled-by-default behind feature flag; do not auto-enable in production.

---

## Appendix A — File deliverables

| Path | Purpose | Iter |
|------|---------|------|
| `scripts/bench/iter5-router-fixture.jsonl` | 60-query fixture | 5 |
| `scripts/bench/iter5-router-fixture-vision.jsonl` | image fixture refs + ground truth | 6 |
| `scripts/bench/run-iter5-router-bench.mjs` | runner extending r5 skeleton | 5 |
| `scripts/bench/score-unlim-quality-v2.mjs` | tier-aware scorer | 5 |
| `src/services/router/__tests__/classifier.test.js` | 60 unit tests | 5 |
| `tests/e2e/iter5-router-classroom-flow.spec.ts` | Playwright E2E | 5 |
| `docs/posthog/iter5-router-dashboard.json` | dashboard config | 5 |
| `tests/fixtures/kit-photos/*.jpg` | 10 kit photos | 6 |
| `tests/fixtures/circuits/*.png` | 10 diagnose screenshots | 6 |
| `tests/fixtures/textbook/*.jpg` | 5 OCR pages | 7 |
| `output/baseline-iter4-<TS>.json` | baseline snapshot | 5 (before wire-up) |
| `output/iter5-router-bench-report-<TS>.md` | final report | 5/6/7 |
| `output/iter5-vs-iter4-delta.md` | delta report | 7 |

## Appendix B — Anti-G45 checklist (must be ✅ before tester signs off)

- [ ] 60 queries × 3 runs executed completely — no skips counted as pass
- [ ] All quality scores reported as worst-of-3, not mean
- [ ] Latency reported as p95, not mean
- [ ] Cost includes Edge cold-start + network overhead
- [ ] Opus-independent re-run executed, agreement within ±0.3
- [ ] Cherry-pick disclosure section completed honestly
- [ ] All FAIL queries enumerated with response text + rationale
- [ ] Andrea confirmed via Telegram OK before merge
- [ ] Feature flag default = off, manual enable per classroom
- [ ] Rollback drill tested (toggle off in <60s) before iter ships
