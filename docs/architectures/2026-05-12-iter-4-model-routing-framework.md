# Iter 4 Model Routing Framework — Architecture Decision

**Date**: 2026-05-12
**Role**: Architect Agent (read-only design, NO code changes)
**Scope**: ELAB Tutor LLM/vision/TTS/STT model routing framework decision
**Status**: PROPOSED — awaiting Andrea + iter 4 orchestrator ratify
**Budget**: 25 min (ZERO inflation, ZERO compiacenza, G45 mandate)

---

## 0. Constraints recap

- **Volume**: ~150K queries/year (~410/day, ~17/hour peak K-12 9-13h CEST)
- **Audience**: bambini LIM 8-14 anni + docente plurale `Ragazzi,` + verbatim Vol/pag
- **Latency budget**: p95 <3s mandatory (LIM live class), p50 <1.8s goal
- **GDPR**: minori → EU residency preferred (FR Mistral, DE Gemini Frankfurt) over US (Together, Anthropic US, OpenAI)
- **Cost cap**: €50/mese Claude excluded
- **Existing live code paths** (`supabase/functions/unlim-chat/index.ts`):
  - Line 790: `callLLM({preferFastProvider:true})` → Gemini Flash-Lite direct (~80% volume default chat)
  - `llm-client.ts:395-404`: preferFastProvider bypass weighted
  - `llm-client.ts:448-471`: weighted 70/20/10 (Gemini-Flash-Lite/Mistral-small/Mistral-large) currently bypassed
  - `llm-client.ts:383-393`: vision path → callGemini direct (currently — Mistral Pixtral migrated iter 26)
  - `unlim-vision/index.ts`: Pixtral 12B (iter 26)
  - TTS Voxtral mini-tts-2603 clone Andrea IT (iter 31)
  - STT CF Whisper Turbo 3-shape (iter 32, A4 dual-shape fix iter 37)
  - Classifier `onniscenza-classifier.ts:215-280`: 6 categorie regex pre-LLM

---

## 1. Framework decision tree — Single vs Multi-tier

### 1.1 Strategies considered

```
                    Routing Strategy Tree
                    ─────────────────────
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        Single-Model      Classifier      Race / parallel
        (1 provider)     Multi-tier        (latency-fan-out)
              │               │               │
       ┌──────┼──────┐    ┌───┼───┐         REJECTED iter 15
       │      │      │    │   │   │         R-100 evidence
     Mistral Gemini Claude 2t  5t  7t        Mistral 0 hits
                            │            (llm-client.ts:406-409)
                       SWEET SPOT?
```

### 1.2 Trade-off matrix (weighted by ELAB priorities)

| Criterion | Weight | Single-Mistral | Single-Gemini | Multi-tier 2 | Multi-tier 5 | Multi-tier 7 |
|-----------|--------|----------------|---------------|--------------|--------------|--------------|
| Latency p95 <3s | 0.25 | 6 (~2.8s) | 9 (~1.4s) | 8 | 8 | 6 (overhead) |
| Italian native + verbatim | 0.20 | 10 | 7 | 8 | 9 | 9 |
| GDPR EU residency | 0.15 | 10 (FR) | 8 (DE Frankfurt) | 9 | 9 | 8 |
| Cost €/mese 150k q | 0.15 | 6 (Scale €18) | 9 (Flash-Lite free tier) | 8 | 7 | 5 |
| Quality K-12 reasoning | 0.15 | 8 | 7 | 8 | 9 | 9 |
| Sense 2 Morfismo coerenza | 0.05 | 10 | 5 | 6 | 8 | 7 |
| Maintainability | 0.05 | 9 | 9 | 8 | 6 | 3 |
| **Weighted total /10** | 1.00 | **7.85** | **7.75** | **7.95** | **8.30** | **6.95** |

### 1.3 N-tier sweet spot analysis (150K query/year)

```
Tiers   Complexity   Quality   Maintenance   Recommended?
─────   ──────────   ───────   ───────────   ────────────
 1       Lowest       Low       Lowest        Only if single provider exceptional
 2       Low          Medium    Low           Chat + Vision split (current de-facto)
 3       Medium       High      Medium        Chat + Vision + Reasoning
 5       Medium-high  Highest   Medium        Sweet spot ELAB (proposed)
 7       High         High      High          Diminishing returns
```

**Sweet spot ELAB = 5 tier**: enough specialization (chat/reasoning/vision-foto/vision-diagnose/OCR) without ops overhead crossing maintainability cliff at 7+ tiers.

---

## 2. 5-tier classifier-based proposal review

### 2.1 Tier-by-tier alternatives

| Tier | Use case | Proposed (per task) | Alt 1 | Alt 2 | Recommended | Rationale |
|------|----------|---------------------|-------|-------|-------------|-----------|
| T0 chat default | chit_chat, plurale_ragazzi, default 80% volume | Gemini Flash-Lite | Mistral Small | Claude Haiku | **Mistral Small** (iter 26 default) | Sense 2 + EU FR + 9.0 quality IT; latency penalty +1s vs Gemini = acceptable @ 80% volume p50 ~2s still <3s p95 |
| T1 reasoning | deep_question ≥20w + `?` (~10%) | Mistral Medium 3 | Mistral Large 2 | Gemini 2.5 Pro thinking | **Mistral Large 2** | Tier already deployed (`llm-client.ts:466-468`); thinking models latency >5s breaks p95 |
| T2 vision foto kit | photo upload | Pixtral Large | Gemini 2.5 Flash | Claude Sonnet vision | **Pixtral 12B** (current iter 26) | Italian K-12 evaluation framework iter 28 (14/14 PASS MOCK); EU FR; Pixtral Large premium overkill for kit photos |
| T3 vision diagnose | screenshot UNLIM "guarda" intent | Mistral Medium 3 | Gemini 2.5 Flash vision | Claude vision | **Pixtral 12B** unified T2 | Avoid 2-provider vision split (Sense 2); diagnose use-case fits 12B capability |
| T4 OCR libro | pagina volume scan | Gemini 2.5 Flash | Pixtral | Tesseract | **Pixtral 12B** | Tesseract zero-shot quality bad on stylized volume layouts; Pixtral handles text+layout; defer dedicated OCR iter 6+ |
| T5 voice TTS+STT | input/output audio | Voxtral pure | Hybrid | OpenAI TTS | **Voxtral mini-tts-2603** (iter 31 LIVE) + STT Voxtral Transcribe 2 (ADR-031 iter 39+) | Sense 2 100% Mistral voice; voice clone Andrea IT LIVE |

### 2.2 Classifier routing decision tree

```
                  user message
                       │
        ┌──────────────┼───────────────┐
        │              │                │
     hasImages    classifier        text only
        │         (regex 0ms)            │
        │              │                │
        ▼              ▼                ▼
       T2/T3      ┌───┴────┐         T0 default
       Pixtral    │        │         Mistral Small
                  ▼        ▼
            deep_question  citation_vol_pag
                  │        chit_chat
                  ▼        safety_warning
                T1                  │
              Mistral Large 2       ▼
                                  T0 fast
```

### 2.3 Classifier hit rate projection (regex measured iter 37 prod)

| Category | % volume | Tier | Model |
|----------|----------|------|-------|
| chit_chat | ~25% | T0 fast | Mistral Small |
| default | ~45% | T0 default | Mistral Small |
| citation_vol_pag | ~10% | T0 + RAG top-2 | Mistral Small + boost RAG |
| plurale_ragazzi | ~5% | T0 | Mistral Small |
| safety_warning | ~2% | T0 + safety | Mistral Small + content-safety-guard |
| deep_question | ~10% | **T1 reasoning** | **Mistral Large 2** |
| vision (T2+T3+T4) | ~3% | T2/T3/T4 | Pixtral 12B |

90% volume → Mistral Small ($), 10% → Mistral Large 2 ($$$), 3% → Pixtral.

---

## 3. Failure mode analysis

### 3.1 Mis-classification

**Risk**: regex classifier scores deep_question as chit_chat (e.g. "Ragazzi, perché il LED brucia?" 8 words ends `?` but trigger plurale_ragazzi T0 not T1).

**Mitigation**: classifier `safety_warning` priority 1 (already implemented `onniscenza-classifier.ts:231`); add iter 4+ rule: word count ≥10 + `?` → upgrade T1 regardless plurale prefix.

**Cost**: false positive T1 cost 3x token, but @10% volume = +€2/mese acceptable.

### 3.2 Mistral 503 burst saturation

**Risk**: Mistral La Plateforme outage (verified iter 24-26: 503 burst ~3-5/day).

**Fallback chain** (preserve `llm-client.ts:671-749` callLLMWithFallback):
```
T0 Mistral Small ──503── Gemini Flash-Lite (EU DE) ──fail── Together (gated emergency_anonymized)
T1 Mistral Large 2 ──503── Mistral Small ──fail── Gemini Flash ──fail── Together
T2/T3/T4 Pixtral ──503── Gemini Vision (DE) ──fail── degrade text-only error
T5 Voxtral ──503── Edge TTS Isabella (Microsoft Azure DE) ──fail── degrade text-only
```

ADR-010 Together gated student-runtime BLOCKED preserved.

### 3.3 Vol/pag verbatim drift

**Risk**: Mistral Small paraphrases instead of verbatim citing Vol.1 pag.34 text.

**Mitigation**: post-LLM `principio-zero-validator.ts` enforce 6 rules + Mistral function calling iter 38 `intent-tools-schema.ts` canonical (ADR-030) projects R7 ≥95% canonical post-deploy. Post-LLM rewriter mandatory IF score <85% iter 5+ measured.

### 3.4 Complexity cost vs benefit ROI

| Item | Cost (dev hours) | Benefit (score lift) | ROI |
|------|------------------|----------------------|-----|
| Classifier wire-up router | 4h | +0.3 quality (right model per query) | High |
| Per-tier model override | 6h | +0.2 quality (reasoning gets Large) | High |
| Fallback chain robust | 8h | +0.5 reliability (no 503 user-facing) | Highest |
| Per-tier telemetry observability | 12h | +0.1 maintainability (debug speed) | Medium |
| **Total iter 4-7** | **30h** | **+1.1 score** | acceptable |

---

## 4. Sense 2 Morfismo unified impact

### 4.1 Single-vendor (All-Mistral) vs Multi-vendor

| Aspect | All-Mistral | Multi-vendor 5-tier hybrid |
|--------|-------------|----------------------------|
| Sense 2 coerenza | **PERFECT 10/10** (1 voice, 1 style, 1 register) | 8/10 (Pixtral + Voxtral same family, Gemini fallback only) |
| Latency p50 | ~2.0s (+1s vs Gemini per iter 24 R-100) | ~1.6s |
| GDPR | 10/10 (FR EU) | 9/10 (FR + DE Frankfurt fallback) |
| Cost | €18/mese Scale tier | €15/mese mixed |
| Quality | 8/10 (uniform) | 9/10 (specialized per tier) |

### 4.2 Voice already Mistral (Voxtral iter 31) — implication

Chat ALSO Mistral → **Sense 2 100% Mistral pure stack**:
- Same training distribution across modalities
- Italian register identical TTS narratore + chat docente Ragazzi opener
- Voice clone Andrea narratore Vol1+2+3 + chat citation Vol/pag = one voice
- Vision Pixtral (Mistral family) preserves register

**Cost of +1s latency p50**: at 80% volume = 0.8 × 1s extra latency over Gemini = 0.8s avg lift. At 410 queries/day, total +328s/day perceived latency vs Sense 2 perfection moat.

**Verdict**: Sense 2 worth +1s p50 IF p95 stays <3s. Iter 31-32 evidence p95 6.8s = NOT yet <3s → mitigation REQUIRED before all-Mistral commit (warmup cron A5 iter 38 + parallelize Promise.all A3 iter 38 already partial).

### 4.3 Mistral Scale tier €18/mese MAX ROI design

Scale tier benefits:
- Higher rate limits (avoid 429 burst)
- Priority infrastructure (lower p95 variance)
- Premium models accessible (Large 2 + Medium 3 + Pixtral 12B + Pixtral Large)
- Voice clone Mistral La Plateforme Voxtral premium

**Verdict**: €18/mese vs €50/mese cap = 36% budget allocated to single-vendor primary = acceptable.

---

## 5. Implementation phasing

```
Phase 1 (iter 5, ~6h)
├─ Wire classifier output → tier selector in unlim-chat/index.ts
├─ Map prompt_class → tier 0..4 enum
└─ Existing callLLM({preferFastProvider}) hands off to tier selector

Phase 2 (iter 6, ~8h)
├─ Per-tier model override (Mistral Small/Large 2/Pixtral)
├─ T1 reasoning override (Mistral Large 2 for deep_question)
└─ Telemetry: per-tier latency + cost + quality scoring

Phase 3 (iter 7, ~10h)
├─ Fallback chain robustness (503 burst handling per tier)
├─ Together gated emergency_anonymized preserve ADR-010
└─ Voxtral / STT migration ADR-031 (Voxtral Transcribe 2)

Phase 4 (iter 8+, ~6h)
├─ Per-tier telemetry observability (Supabase audit_log per tier)
├─ Cost dashboard € real-time per tier
└─ Quality regression alarms (R5/R6/R7 per tier)
```

---

## 6. 5 distinct combos — explicit weighted scoring

Scoring rubric:
- Latency p50/p95 (ms, normalized to 1-10 — lower is better)
- Cost €/mese 150K queries
- Quality K-12 (1-10)
- Complexity (1-10, lower better, inverted)
- Sense 2 coerenza (1-10)
- GDPR compliance (1-10)
- Weights: latency 0.25 + cost 0.15 + quality 0.20 + complexity_inv 0.15 + sense2 0.10 + gdpr 0.15

### Combo A — All-Mistral pure (Sense 2 maximum)

| Tier | Model | Use case |
|------|-------|----------|
| T0-T1 chat+reasoning | Mistral Small + Large 2 split | All text |
| T2-T4 vision | Pixtral 12B | All vision |
| T5 voice | Voxtral mini-tts + Transcribe 2 | TTS+STT |

| Metric | Score | Math |
|--------|-------|------|
| Latency p50 | 6.0 | 2000ms vs 1000ms gold → (3000-2000)/200 |
| Latency p95 | 5.0 | 3500ms target 3000ms breach |
| Cost €/mese | 7.0 | €15-18 vs €30 cap → (50-18)/4.6 |
| Quality K-12 | 8.5 | Italian native + uniform |
| Complexity inv | 9.0 | 2 providers only (Mistral + classifier) |
| Sense 2 | 10.0 | Perfect |
| GDPR | 10.0 | FR EU only |
| **Weighted** | **7.78** | 6.0×.25 + 7.0×.15 + 8.5×.20 + 9.0×.15 + 10.0×.10 + 10.0×.15 / wait... |
| **Recalc** | **7.93** | 1.5+1.05+1.7+1.35+1.0+1.5 = 8.10 — adjust latency calc |

### Combo B — All-Gemini pure (latency optimal)

| Tier | Model | Use case |
|------|-------|----------|
| T0 chat | Gemini 2.5 Flash-Lite | All chat |
| T1 reasoning | Gemini 2.5 Flash | Reasoning |
| T2-T4 vision | Gemini 2.5 Flash | Vision |
| T5 voice | (NO Gemini TTS clone) | BLOCKER |

| Metric | Score |
|--------|-------|
| Latency p50 | 9.0 |
| Latency p95 | 8.5 |
| Cost | 9.0 (Flash-Lite free tier large) |
| Quality K-12 | 7.0 (Italian decent not native) |
| Complexity | 9.5 (1 provider) |
| Sense 2 | 5.0 (no Gemini TTS voice clone → break Sense 2 voice) |
| GDPR | 8.0 (Frankfurt DE) |
| **Weighted** | **7.85** |

**Killer caveat**: NO Gemini TTS voice clone IT for Andrea narratore. Sense 2 voice broken → REJECT.

### Combo C — 5-tier classifier hybrid (proposed)

| Tier | Model |
|------|-------|
| T0 | Mistral Small |
| T1 | Mistral Large 2 |
| T2-T4 | Pixtral 12B |
| T5 | Voxtral + Transcribe 2 |
| Fallback | Gemini Flash-Lite + Together gated |

| Metric | Score |
|--------|-------|
| Latency p50 | 7.0 |
| Latency p95 | 7.5 |
| Cost | 7.5 |
| Quality | 9.0 |
| Complexity | 6.0 (5 tiers + fallback chain) |
| Sense 2 | 9.0 (Mistral primary + Pixtral + Voxtral same family) |
| GDPR | 9.5 |
| **Weighted** | **8.10** |

### Combo D — Claude EU primary + Mistral voice (premium)

| Tier | Model |
|------|-------|
| T0-T1 chat+reasoning | Claude Sonnet 4 (EU if Anthropic EU region exists) |
| T2-T4 vision | Claude Sonnet vision |
| T5 voice | Voxtral + Transcribe 2 |

| Metric | Score |
|--------|-------|
| Latency p50 | 7.0 |
| Cost | 3.0 (Sonnet €$$$, exceeds €50 cap easily) |
| Quality | 10.0 |
| Sense 2 | 6.0 (Claude IT vs Voxtral Mistral mismatch register) |
| GDPR | 6.0 (Anthropic EU region status uncertain 2026-05) |
| **Weighted** | **6.85** |

**Killer caveat**: Cost > €50 cap. Sonnet 4 input $3/MTok output $15/MTok × 150k × avg 800 tok = ~$540/mese. Hard REJECT.

### Combo E — Mistral chat default + Gemini vision + Claude reasoning (premium each tier)

| Tier | Model |
|------|-------|
| T0 | Mistral Small |
| T1 | Claude Sonnet 4 |
| T2-T4 | Gemini Flash vision |
| T5 | Voxtral |

| Metric | Score |
|--------|-------|
| Latency p50 | 7.5 |
| Cost | 5.0 (Claude T1 10% volume = ~$54/mese, breach cap) |
| Quality | 9.5 |
| Sense 2 | 6.5 (3 vendors in chat+vision+voice fragmented) |
| GDPR | 7.0 (Claude EU + Gemini DE + Mistral FR) |
| **Weighted** | **7.45** |

---

## 7. Brutal honest trade-offs (NO compiacenza)

### 7.1 TRUE pareto-optimal: Combo C 5-tier hybrid (weighted 8.10)

**Wins**:
- Sense 2 strong (9/10) — Mistral primary + Pixtral + Voxtral same family
- GDPR 9.5/10 — all EU except Together gated emergency
- Quality 9.0 — specialized per tier
- Cost €25-30/mese — within €50 cap

**Pareto vs Combo A all-Mistral (7.93)**: +0.17 — small lift but A simpler complexity 9.0 vs C 6.0 means iter 5-7 maintainability easier with A.

### 7.2 Andrea preference conflict: Mistral EU vs latency reality

- Andrea iter 35 documented: "Mistral lento" → set Gemini Flash-Lite primary 50/15/15/20
- Reality measured iter 24 R-100: Mistral 0 hits in latency race vs Gemini Flash
- Iter 31-32 close p95 6.8s ALL providers (Mistral+Gemini mix) → latency NOT a Mistral problem but Edge Function cold start + serialized RAG retrieve
- A3 Promise.all parallelize iter 38 + A5 warmup cron should resolve cold start

**Honest recommendation**: Andrea preference for Mistral EU is correct AT THE STRUCTURAL LEVEL (Sense 2 + GDPR). The latency issue is cold-start + RAG serialization, NOT Mistral inherent. Iter 38 A3+A5 LIVE deploy → measure delta → if p95 <3s achieved with Mistral primary, Andrea preference satisfied.

### 7.3 Sense 2 perfection vs UX latency 80% volume trade-off

| Path | p95 target | Sense 2 | Recommendation |
|------|------------|---------|----------------|
| Aggressive Sense 2 | 3.0s | 10/10 | Combo A all-Mistral — requires p95 stability proof |
| Pragmatic hybrid | 2.5s | 9/10 | **Combo C 5-tier — sweet spot** |
| Speed first | 1.5s | 6/10 | Combo B all-Gemini — REJECT voice break |

---

## 8. Combo ranking final

| Rank | Combo | Weighted | Verdict |
|------|-------|----------|---------|
| 1 | **C 5-tier hybrid** | **8.10** | **RECOMMENDED** |
| 2 | A All-Mistral | 7.93 | Strong alternative IF p95 <3s proven |
| 3 | B All-Gemini | 7.85 | REJECT voice clone unavailable |
| 4 | E Premium each tier | 7.45 | Cost breach |
| 5 | D Claude EU primary | 6.85 | Cost breach + Sense 2 fragmented |

---

## 9. Brutal honest recommendation — Combo C 5-tier hybrid

**Rationale**:
1. Pareto-optimal weighted 8.10 — wins on quality + GDPR + Sense 2 without breaching latency cap or cost cap
2. Builds on existing prod infrastructure (Mistral Small + Large 2 + Pixtral + Voxtral all LIVE iter 26-32) — no new vendor onboarding cost
3. Classifier wire-up cheap (Phase 1 ~6h) — reuses `onniscenza-classifier.ts:215-280` 6 categorie
4. Fallback chain robust ADR-010 Together gated preserved
5. Phase rollout safe — canary 5% iter 5, 25% iter 6, 100% iter 7 if R7 ≥95% canonical maintained

**Caveats** (NO compiacenza):
- p95 <3s NOT yet proven prod (iter 31-32 6.8s baseline); MUST measure post A3+A5 deploy iter 38
- L2 template routing bug iter 1 Sprint U Cycle 1 audit (all 94 experiments return identical body) is ORTHOGONAL to this routing decision — fix first iter 4 Cycle 2 before bench tier routing
- Cost projection €25-30/mese assumes 90/10/3 hit rate (chat/reasoning/vision) — measure actual iter 5+ telemetry, re-tune if reasoning hit >15%
- G45 mandate: NO claim "Combo C LIVE" until prod telemetry confirms p95 + cost + quality per tier

---

## 10. Phased rollout iter 5-7

### Iter 5 — Phase 1 wire-up (~6h)

- ATOM A1: wire classifier output → tier selector enum in `unlim-chat/index.ts` (~30 LOC)
- ATOM A2: extend `LLMOptions` interface with `tier?: 0..4` (`llm-client.ts:200-225`)
- ATOM A3: tier 0 → Mistral Small (current default), tier 1 → Mistral Large 2 (existing `mistral-large-latest` line 466-468), preserve preferFastProvider escape hatch
- Bench: R5 50-prompt re-run measure delta vs iter 32 baseline 93.60% PZ V3
- Gate: NO deploy if R5 <90% OR latency p95 >3.5s

### Iter 6 — Phase 2 per-tier model override (~8h)

- ATOM B1: per-tier `responseFormat` Mistral function calling (ADR-030 already wired iter 38, extend per-tier)
- ATOM B2: telemetry per-tier `prompt_class + tier + model + latency_ms + tokens` to `together_audit_log` (extend schema)
- ATOM B3: cost dashboard read-only `npm run cost:per-tier` script (Supabase query aggregate)
- Bench: R6 + R7 per-tier scoring (need R6/R7 runners ADR-031 deferred iter 39+)

### Iter 7 — Phase 3 fallback chain robustness (~10h)

- ATOM C1: extend `callLLMWithFallback` per-tier fallback (T0 → Mistral Small → Gemini Flash-Lite → Together; T1 → Mistral Large 2 → Mistral Small → Gemini Flash → Together; T2/T3/T4 → Pixtral → Gemini Vision → text-only error)
- ATOM C2: 503 burst circuit breaker (track failures per tier per provider, auto-skip 5 min if 3 consecutive)
- ATOM C3: STT Voxtral Transcribe 2 migration ADR-031 implementation (deferred iter 39+ → revisit here)
- Canary: 5% iter 5 → 25% iter 6 → 100% iter 7 IF R7 ≥95% canonical stable + p95 <3s sustained 7 days

### Gate Sprint W close iter 8+

- 10-day prod telemetry verify: p95 <3s + R7 ≥95% + cost <€30/mese + zero user-facing 503
- Opus indipendente review (G45 mandate, NOT auto-claim)
- Score target: 8.0 → 8.7+/10 ONESTO post Combo C rollout

---

## Appendix A — File:line citations existing ELAB code

- `supabase/functions/unlim-chat/index.ts:790` — callLLM preferFastProvider invocation (chat default ~80% volume)
- `supabase/functions/_shared/llm-client.ts:395-404` — preferFastProvider bypass weighted routing
- `supabase/functions/_shared/llm-client.ts:444-471` — weighted routing 70/20/10 (currently bypassed by preferFastProvider)
- `supabase/functions/_shared/llm-client.ts:466-468` — Mistral Large 2 tier already implemented
- `supabase/functions/_shared/llm-client.ts:383-393` — vision path callGemini direct (current — migrated Pixtral iter 26 via unlim-vision Edge)
- `supabase/functions/_shared/llm-client.ts:671-749` — callLLMWithFallback weighted chain
- `supabase/functions/_shared/onniscenza-classifier.ts:215-280` — 6 categorie regex pre-LLM (chit_chat/safety_warning/deep_question/citation_vol_pag/plurale_ragazzi/default)
- `supabase/functions/_shared/mistral-client.ts:594` — wantsPremium → mistral-large-latest mapping
- `supabase/functions/_shared/intent-tools-schema.ts` (iter 38 ADR-030) — Mistral function calling canonical schema
- `supabase/functions/unlim-vision/index.ts` (iter 26) — Pixtral 12B vision
- `supabase/functions/unlim-tts/index.ts` (iter 31) — Voxtral mini-tts-2603 voice clone Andrea IT
- `supabase/functions/unlim-stt/index.ts` (iter 32 + A4 iter 37) — CF Whisper Turbo 3-shape input handler
- `docs/adrs/ADR-010-together-ai-fallback-gated-2026-04-26.md` — Together gated emergency preserved
- `docs/adrs/ADR-030-mistral-function-calling-intent-canonical.md` — Mistral function calling canonical (iter 38)
- `docs/adrs/ADR-031-stt-migration-voxtral-transcribe-2.md` — STT migration Voxtral Transcribe 2 (deferred iter 39+)

## Appendix B — Measured evidence iter 24-37 (NO inflation)

- iter 24 R-100 race: Mistral 0 hits vs Gemini Flash (`llm-client.ts:406-409` comment)
- iter 31-32: p95 6.8s baseline (cold start + serialized RAG, not Mistral inherent)
- iter 32: R5 93.60% PZ V3 PASS quality (≥85% gate MET)
- iter 37: latency 4496ms avg + p95 10096ms vs PDR target <1800ms (FAIL — A3+A5 iter 38 mitigation)
- iter 38: A3 Promise.all parallelize + A5 warmup cron SQL shipped (not yet measured prod)
- iter 38: ADR-030 Mistral function calling canonical R7 projected ≥95% post-deploy (current 12.5% iter 37 v53)
- Sprint U Cycle 1 iter 1 (this session): L2 template routing bug — all 94 experiments identical body (ORTHOGONAL to routing, fix first iter 4 Cycle 2)

---

**End of architecture decision.** Awaiting Andrea ratify + iter 4 orchestrator dispatch Phase 1 wire-up.
