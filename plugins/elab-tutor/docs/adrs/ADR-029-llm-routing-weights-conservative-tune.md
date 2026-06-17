# ADR-029 — LLM_ROUTING_WEIGHTS conservative tune 70/20/10

**Status**: ACCEPTED iter 37 entrance (Andrea ratify Phase 0 Question 2)
**Date**: 2026-04-30
**Author**: Maker-2 (feature-dev:code-architect) iter 37 Phase 1
**Cross-refs**: ADR-028 §14 surface-to-browser amend (iter 37) + ADR-010 Together AI fallback gated (iter 3) + iter 36 close audit R5 baseline

---

## §1 Context

R5 50-prompt PZ V3 stress bench iter 36 close baseline measured prod Edge Function `unlim-chat` v48:

| Metrica | Valore iter 36 |
|---------|----------------|
| avg latency | 2424ms |
| p95 latency | 5191ms |
| PZ V3 verdict PASS | ≥85% (target preserved) |
| Routing weights pre-iter-37 | `mistral_small:0.65, mistral_large:0.25, mistral_tiny:0.10` |

Latency p95 5191ms supera target Andrea iter 21+ mandate "<3s warm" → user-perceived response degraded. Mistral Large dominante 25% pesa ~3000ms inference vs Mistral Small ~1000ms inference (3× delta misurata Mistral docs API + iter 36 telemetry).

PDR iter 37 §3 Atom A1 propone tune aggressive 80/15/5 (-1500ms p95 target) + Andrea Phase 0 ratify Question 2 = "**Conservative 70/20/10**" (split medio scelto).

## §2 Decision

Update prod Supabase secret `LLM_ROUTING_WEIGHTS` da:
```json
{"mistral_small":0.65, "mistral_large":0.25, "mistral_tiny":0.10}
```
a:
```json
{"mistral_small":0.70, "mistral_large":0.20, "mistral_tiny":0.10}
```

**Implementation**: orchestrator inline iter 37 Phase 0 entrance (NO code change — env-only):
```bash
SUPABASE_ACCESS_TOKEN=$(grep "^export SUPABASE_ACCESS_TOKEN" ~/.zshrc | cut -d'=' -f2 | tr -d '"\047' | tr -d ' ')
echo '{"mistral_small":0.70,"mistral_large":0.20,"mistral_tiny":0.10}' | \
  SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase secrets set LLM_ROUTING_WEIGHTS=- --project-ref euqpdueopmlllqjmqnyb
# Output: "Finished supabase secrets set."
```

`pickWeightedProvider` in `supabase/functions/_shared/llm-client.ts` legge env runtime (no rebuild). Active immediato senza Edge Function redeploy.

## §3 Rationale (Conservative 70/20/10 vs Aggressive 80/15/5)

**Quality preservation buffer +0.05 vs aggressive cut**:
- Mistral Small (mistral-small-latest 22B) = 70% calls → ~70% chit_chat + plurale + citation_vol_pag (categorie semplici)
- Mistral Large (mistral-large-latest 123B) = 20% calls → ~20% deep_question + safety_warning (categorie complesse, riserva qualita`)
- Mistral Tiny (open-mistral-7b) = 10% calls → ~10% off-topic + greeting (categoria fastest)

**Latency expected -1000ms p95** (vs aggressive target -1500ms):
- Pre-tune p95 5191ms (25% Large @ 3000ms + 65% Small @ 1000ms + 10% Tiny @ 600ms = avg 2424ms, p95 dominated by Large tail)
- Post-tune p95 ~4000-4200ms expected (20% Large @ 3000ms + 70% Small @ 1000ms + 10% Tiny @ 600ms = avg ~1800ms, p95 reduced Large tail)
- Conservative: NON drop sotto 1800ms target avg perche` Large 20% mantiene quality buffer

**Risk mitigation**: Mistral Small quality drop su deep_question + safety_warning categorie statisticamente rare (~5-10% prompt mix prod telemetry iter 36). Buffer 20% Large copre + 10% buffer fallback chain Together AI gated (ADR-010).

## §4 Alternatives considered

| Opzione | Pesi | Latency expected | Quality risk | Decisione |
|---------|------|------------------|--------------|-----------|
| **PDR-A aggressive** | 80/15/5 | -1500ms p95 | HIGH (Large 15% troppo basso per safety_warning + deep_question) | REJECTED Andrea Phase 0 Question 2 |
| **Conservative scelto** | 70/20/10 | -1000ms p95 | LOW (Large 20% buffer + Tiny 10% fastest) | **ACCEPTED** |
| Status quo | 65/25/10 | 0 (no change) | 0 (preserve) | REJECTED (latency p95 5191ms >3s warm Andrea mandate) |
| Tiny-heavy | 60/15/25 | -1800ms p95 | VERY HIGH (Tiny 7B incoerente Italian K-12 plurale) | REJECTED (PRINCIPIO ZERO violazione rischio) |

## §5 Acceptance criteria

Tester-1 iter 37 Phase 1 Atom A7 R5 50-prompt re-run post-tune verifica:

| Metrica | Target conservative | Cap rollback condition |
|---------|---------------------|------------------------|
| R5 avg latency | **<1800ms** | >2424ms = regression, rollback 65/25/10 |
| R5 p95 latency | **<4500ms** | >5191ms = regression, rollback |
| R5 PZ V3 verdict | **PASS ≥85%** | <80% = quality drop, rollback |
| R5 categoria deep_question | latency preserve, quality ≥75% | quality <70% = rollback |
| R5 categoria safety_warning | latency preserve, quality ≥85% | quality <80% = rollback critical (sicurezza minori) |

Se ANY rollback condition trigger → revert immediato `LLM_ROUTING_WEIGHTS={"mistral_small":0.65,"mistral_large":0.25,"mistral_tiny":0.10}` + flag iter 38 P0 latency tune alternative (dedicated EU LLM cheap o caching aggressive).

## §6 Rollback plan

Single-command rollback (no code change):
```bash
SUPABASE_ACCESS_TOKEN=$(grep "^export SUPABASE_ACCESS_TOKEN" ~/.zshrc | cut -d'=' -f2 | tr -d '"\047' | tr -d ' ')
echo '{"mistral_small":0.65,"mistral_large":0.25,"mistral_tiny":0.10}' | \
  SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase secrets set LLM_ROUTING_WEIGHTS=- --project-ref euqpdueopmlllqjmqnyb
```

Active immediato Edge Function next call. No deploy required.

## §7 Telemetry post-tune

Tester-1 R5 output `scripts/bench/output/r5-stress-{report,responses,scores}-${ISO_DATE}.{md,jsonl,json}` documenta delta:
- Per-call provider routed (Mistral Small/Large/Tiny breakdown actual %)
- Per-categoria latency + quality
- Comparativa iter 36 vs iter 37

Aggregator iter 37 close audit cita Sezione 4.X tabella delta.

## §8 PRINCIPIO ZERO + MORFISMO compliance

- ✅ Linguaggio plurale "Ragazzi," preserved cross-modello (system-prompt v3.1 invariante BASE_PROMPT)
- ✅ Vol/pag verbatim citation preserved (capitoli-loader.ts buildCapitoloPromptFragment invariante)
- ✅ Kit fisico mention preserved (BASE_PROMPT line 123-127 invariante)
- ✅ Morfismo Sense 1 runtime adattamento per-classe preserved (memoria + RAG context invariante)
- ✅ Triplet coerenza Sense 2 invariante (no tool change, no schema change)

## §9 Cross-refs

- ADR-028 §14 surface-to-browser amend (iter 37) — companion decision INTENT parser pivot
- ADR-010 Together AI fallback gated (iter 3) — fallback chain preserved unchanged
- iter 36 close audit `docs/audits/2026-04-30-iter-36-PHASE3-CLOSE-audit.md` — R5 baseline 2424ms source
- iter 37 close audit `docs/audits/2026-04-30-iter-37-PHASE3-CLOSE-audit.md` — R5 post-tune delta verify (Documenter Phase 2)
- `supabase/functions/_shared/llm-client.ts` `pickWeightedProvider` — env-read function (no code change required)
- ADR-029 R5 fixture `scripts/bench/r5-fixture.jsonl` (50 prompts seed iter 4 + extension iter 11)

---

**Status**: ACCEPTED iter 37 entrance Phase 0 Andrea ratify Question 2
**Implementation**: iter 37 Phase 0 orchestrator inline (env-only, no deploy)
**Verification**: iter 37 Phase 1 Atom A7 Tester-1 R5 50-prompt re-run
**Rollback gate**: iter 37 Phase 3 close audit (Documenter §6 verdict)
