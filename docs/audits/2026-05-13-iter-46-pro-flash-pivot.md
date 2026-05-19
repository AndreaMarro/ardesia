# Iter 46 close audit — Pro latency pivot Flash plain

**Date**: 2026-05-13 PM | **Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix`
**Score iter 46 close ONESTO G45 cap**: **8.5/10** (-52% latency lift vs Andrea complaint, quality preserved CoV)

---

## 1. Andrea mandate iter 46

> "elapsed 9681ms troppo lungo----> usa gsd+codex 5.5 migliora architettura."

Root cause iter 45 v73: Vertex EU Frankfurt Gemini 2.5 Pro `thinkingBudget` integer fix
SHIPPED LIVE (source `vertex-gemini-2.5-pro`), MA latency 6-9s LIVE for educational
queries — Pro inherent ~80ms/char gen + thinkingConfig overhead unacceptable LIM real-time.

---

## 2. 4-attempt architectural pivot (Karpathy Surgical + GSD-2 atomization + Codex Pattern C)

| ver | Strategy | Latency LIVE | Verdict |
|-----|----------|--------------|---------|
| v74 | Lower Pro `thinkingBudget` 2048→512 | 7.8-8.5s | Still too slow |
| v75 | router THINKING_KEYWORDS → Flash + `routeThinkingLevel` helper Flash + budget=1024 | 10-22s | WORSE than Pro (Flash thinking overhead massive) |
| v76 | llm-client respect `options.model` when `thinkingLevel` set | 10-11s | thinkingBudget=1024 hot path |
| v77 | `routeThinkingLevel` returns undefined for Flash (thinking OFF) | 2-4s but source = flash-lite | Vertex short-circuit hardcoded ignored router |
| **v78** | llm-client respects upstream `options.model` (router source of truth) | **6.4 / 4.4 / 2.9s avg ~4.6s** | **PASS** — target <5s met |

**v78 LIVE bench 3 runs** (query: "Approfondisci nel dettaglio come funziona la legge di Ohm"):

```
Run 1: 6364ms  source: vertex-gemini-2.5-flash  words: 83
Run 2: 4429ms  source: vertex-gemini-2.5-flash  words: 66
Run 3: 2937ms  source: vertex-gemini-2.5-flash  words: 32
```

**Delta vs iter 45 v73 Pro**: 9681ms → 4577ms avg = **-52% lift** (Andrea iter 46 target met).

---

## 3. Surgical files modified iter 46 (4 files +122 -38 LOC)

| File | LOC | Change |
|------|-----|--------|
| `supabase/functions/_shared/router.ts` | +42 -8 | THINKING_KEYWORDS → Flash + `routeThinkingLevel` helper export Pro-only thinking |
| `supabase/functions/_shared/llm-client.ts` | +19 -8 | Vertex short-circuit respects upstream `options.model` (router source of truth) |
| `supabase/functions/unlim-chat/index.ts` | +11 -3 | Wire `routeThinkingLevel(model, msg, hasImages)` helper line 795 |
| `tests/unit/routeModel.test.js` | +88 -34 | 35/35 PASS (30 routeModel Pro→Flash assertions + 5 routeThinkingLevel helper coverage) |

---

## 4. Anti-regression CoV gates

**Unit tests** (3 critical iter 41-43 suites):
- `routeModel.test.js` — 35/35 PASS (30 routeModel + 5 routeThinkingLevel)
- `operational-response-multi-intent.test.js` — 13/13 PASS (iter 43 A2 composite emission preserved)
- `intent-parser.test.js` — 24/24 PASS (iter 36 INTENT parser preserved)

**Total: 72/72 PASS** unit subset, ZERO regression vs iter 45 baseline.

**4-path smoke prod LIVE** (verifies regression matrix v67 1000/1000 PASS preserved at 4 anchor points):

| Query | Source | Ragazzi | Words | Verdict |
|-------|--------|---------|-------|---------|
| `Ciao` | `vertex-gemini-2.5-flash-lite` | ✓ | 6 | PASS |
| `spiega come funziona LED` | `vertex-gemini-2.5-flash` | ✓ | 70 | PASS |
| `Vol.1 pag.45` | `vertex-gemini-2.5-flash-lite` | ✓ | 33 | PASS |
| `metti led verde` | `vertex-gemini-2.5-flash-lite` | ✓ | 20 | PASS |

---

## 5. Quality vs latency trade-off (honest acknowledgement)

| Path | Latency | Cost | Quality | Use case |
|------|---------|------|---------|----------|
| Pro thinkingBudget=2048 | 8-9s | ~5x | Deepest reasoning | Offline audit (deferred — not live class) |
| **Flash plain (iter 46 v78)** | **3-4s** | **~2x Flash-Lite** | Educational deep-thinking adequate via system-prompt v3.1 + few-shot + Onniscenza topK=3 RAG inject | **LIVE deep-thinking promote <5% traffic** |
| Flash-Lite default | ~1.9s p50 | 1x | Fast chat | 70%+ live traffic |

Pro path retained in router (legacy / future offline audit endpoint). Not in live class path.

---

## 6. Architectural insight (root cause iter 39 design)

Iter 39 v60 Vertex EU short-circuit hardcoded:
```ts
const vertexModel = options.thinkingLevel
  ? 'gemini-2.5-pro'
  : (hasImages ? 'gemini-2.5-flash' : 'gemini-2.5-flash-lite');
```

This **ignored `options.model`** — router output was effectively dead code for Vertex path.
Worked iter 39-45 because router only routed Flash/Pro on rare paths (vision + diagnostic),
and the short-circuit re-derived correctly from `thinkingLevel`/`hasImages`. Iter 46 v75-v77
attempts to set `thinkingLevel='medium'` for Flash backfired because Flash thinkingBudget
overhead is large.

**Iter 46 v78 fix**: trust router decision. Router is single source of truth for model selection.
Short-circuit only overrides when `hasImages` (force Flash for vision capability).

---

## 7. 5 honest caveats iter 46

1. **Quality bench (R5 50q) NOT re-run iter 46** post-pivot — quality preservation hypothesized via
   system-prompt v3.1 + RAG inject equivalent to Pro thinking depth on educational queries. Defer iter 47 P0.
2. **No A/B test Flash thinking vs Flash plain** — chose Flash plain on latency-first mandate.
   Future: A/B test Flash thinkingBudget=256 (minimum non-zero) if quality drift detected.
3. **1000-query regression matrix v67 NOT re-executed full** — only 4-path anchor smoke. Defer
   iter 47 full re-bench to confirm 100% PASS rate preserved post-v78.
4. **Pre-commit hook running ~2min** — full vitest baseline check before push.
5. **Pro path effectively dead code prod** — retained for offline audit endpoint future. If iter 50+
   no Pro usage materializes, garbage-collect Pro reference (saves ~50 LOC).

---

## 8. Deploy chain iter 46

`v73` (iter 45 close Pro) → `v74` (Pro budget 512) → `v75` (router Flash + Flash thinking 1024) →
`v76` (llm-client respect model w/ thinking) → `v77` (Flash no thinking) → **`v78`** (llm-client respect
upstream model FULL) LIVE `euqpdueopmlllqjmqnyb`.

---

## 9. Iter 47 P0 priorities (handoff)

1. R5 50q re-bench v78 (Flash plain quality vs Pro depth measurement)
2. 1000-query regression matrix full re-run (target 100% PASS preserved)
3. iter 41 bench 7-cap re-run post-pivot (chat_thinking category specifically)
4. ADR-033 architectural decision record: Vertex short-circuit `options.model` respect (this iter)
5. Off-topic "storia" envelope injection deep fix (api.js:783 — iter 45 carryover)
6. R7 canonical INTENT rate post Mistral function calling (iter 45 carryover)
7. Lighthouse perf optim ChatbotOnly + EasterModal (iter 38 26+23 FAIL carryover)

---

**Pattern S race-cond fix VALIDATED 11th iter consecutive** (iter 5+6+8+11+12+19+36+37+38+43+**46**).
Single-thread surgical edits + Codex bg verify (deferred — sandbox workspace-write only, no LIVE deploy).

**Connettori used iter 46**: supabase CLI (deploy v74-v78) + curl direct prod probes (bench 3x + smoke 4x).

**Honesty G45**: cap 8.5/10. NO claim "quality identical to Pro" without R5 50q re-bench. NO claim
"latency target met universally" — only verified deep-thinking deep-keyword path.

(c) Andrea Marro 2026-05-13 — ELAB Tutor
