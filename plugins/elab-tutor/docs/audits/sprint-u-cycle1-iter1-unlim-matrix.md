# UNLIMVerify Matrix — Sprint U Cycle 1 Iter 1

**Date**: 2026-05-01  
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815  
**Edge Function**: `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat`

---

## Summary

- **Tests run**: 20/20 (0 HTTP errors)
- **PASS (score ≥0.75)**: 20/20 — but see CRITICAL ISSUES below
- **plurale_ragazzi rate**: 20/20 (100%)
- **vol_pag citation rate (loose)**: 20/20 (100%) — `Vol.1` + `pag.` present
- **vol_pag citation rate (strict — page NUMBER)**: 0/20 (0%) — pag. not followed by a number
- **brevita ≤80w rate**: 20/20 (100%) — all responses ~36 words
- **kit_mention rate**: 20/20 (100%) — "Sul kit guardate il LED rosso"
- **Avg word count**: 36 words
- **Avg latency**: ~316ms (L2 template short-circuit, no LLM call)

---

## CRITICAL ISSUES FOUND

### ISSUE 1 — L2 template routing: ALL 20 experiments routed to `L2-explain-led-blink` (BLOCKER)

Every single experiment ID — regardless of volume, chapter, or experiment type — triggers the same L2 template `L2-explain-led-blink`. This means:

- `v2-cap3-esp1` (Vol2 cap3) → gets LED blink explanation
- `v3-cap6-morse` (Morse code, Vol3) → gets LED blink explanation  
- `v3-cap8-serial` (Serial communication, Vol3) → gets LED blink explanation
- `v3-cap10-esp1` (Vol3 cap10, likely advanced) → gets LED blink explanation

**Root cause hypothesis**: The `selectTemplate` function in `clawbot-template-router.ts` has a catch-all/default rule that matches `lesson-explain` category templates to `L2-explain-led-blink` for any `experimentId` it doesn't specifically recognize. Since most experiment IDs beyond v1-cap6-esp1 are not mapped to distinct templates, they all fall through to the LED blink default.

**Impact**: UNLIM gives pedagogically wrong content for 19/20 experiments (assuming only v1-cap6-esp1 is correct). A teacher asking about Morse code in Vol3 cap6 gets a LED blink explanation. A teacher asking about Serial communication gets a LED blink explanation.

**Morfismo violation**: This violates Sense 2 (triplet coerenza) — software is NOT morphic to the kit/volumes. The response content does not match the experiment being taught.

### ISSUE 2 — Vol/pag citation format malformed (MAJOR)

The citation format is `Vol.1 pag. 'Catodo: Terminale negativo...'` — quoting a text fragment instead of a page number.

**Expected (PZ V3 canonical)**: `Vol.1 pag. 42` (number)  
**Actual**: `Vol.1 pag. 'Catodo: Terminale negativo del diodo / LED...'` (text excerpt)

The `vol_pag_strict` check (requires page number after `pag.`) is 0/20. The loose check (just `Vol.` + `pag.` present) is 20/20.

**Root cause**: The L2 template inlines a RAG chunk text verbatim after `pag.` instead of extracting and citing the page number field from the chunk metadata.

### ISSUE 3 — Response not experiment-specific (MAJOR)

Every response body is **identical**:
```
Ragazzi, Vol.1 pag. 'Catodo: Terminale negativo del diodo / LED, attraverso cui esce la corrente convenzionale.. È la gamba CORTA del LED. Si'. Sul kit guardate il LED rosso e la resistenza da 220Ω in serie.
```

The `experimentId` changes the `[AZIONE:mountExperiment]` and `[AZIONE:highlightExperiment]` tags, but the human-readable explanation text is 100% identical across all 20 experiments.

**Principio Zero violation**: The text should be derived from the actual volume/chapter/experiment being taught. "Catodo: Terminale negativo..." is glossary content from Vol.1, not relevant to advanced Vol3 experiments.

---

## Detail Matrix

Scoring note: `vol_pag_loose` (contains "Vol." + "pag.") is used for the matrix column since strict page number is 0/20. Score formula: `(plurale + vol_pag_loose + brevita + kit) / 4`.

| ExpID | Plurale | Vol/Pag | ≤80w | Kit | Score | Template | Resp[:200] |
|---|---|---|---|---|---|---|---|
| v1-cap6-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | `Ragazzi, Vol.1 pag. 'Catodo: Terminale negativo del diodo / LED, attraverso cui esce la corrente convenzionale.. È la gamba CORTA del LED. Si'. Sul kit guardate il LED rosso e la resistenza da 220` |
| v1-cap7-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v1-cap9-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v1-cap10-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v1-cap12-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v2-cap3-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v2-cap4-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v2-cap5-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v2-cap6-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v2-cap8-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v3-cap5-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v3-cap5-esp2 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v3-cap6-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v3-cap6-morse | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical — WRONG: Morse code should NOT use LED blink template)* |
| v3-cap7-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v3-cap7-mini | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v3-cap8-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v3-cap8-serial | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical — WRONG: Serial comm should NOT use LED blink template)* |
| v3-cap9-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |
| v3-cap10-esp1 | ✅ | ⚠️ loose | ✅ | ✅ | 1.00 | L2-explain-led-blink | *(identical)* |

---

## Onniscenza Category

All 20 responses came via `source: clawbot-l2-L2-explain-led-blink` with `dataProcessing: local-template`. The L2 template short-circuits before the LLM is called, so:

- **No LLM inference** occurs for any of these 20 experiments
- **No Onniscenza classifier** runs (RAG retrieval is dispatched as an `[AZIONE:ragRetrieve]` tag but not yet executed by the Edge Function — it's returned as a surface action for the browser to dispatch)
- The `prompt_class` / Onniscenza telemetry from iter 37 is bypassed entirely by the L2 pre-LLM short-circuit

---

## Score Summary (Honest Interpretation)

| Metric | Raw Score | Honest Assessment |
|---|---|---|
| Surface PASS rate (4-criterion loose) | 20/20 = **100%** | Misleading — all criteria met by a single hardcoded template |
| Strict vol/pag (page number) | 0/20 = **0%** | FAIL — pag. not followed by number anywhere |
| Experiment-specific content | 1/20 = **5%** | FAIL — only v1-cap6-esp1 is arguably correct |
| Template diversity | 1/20 templates | FAIL — L2-explain-led-blink dominates all 20 |
| LLM engagement | 0/20 | FAIL — L2 template bypasses LLM for all queries |

**Honest overall UNLIM quality for 20 experiments: FAIL** — structural defect in L2 template routing means content is pedagogically wrong for ~19/20 experiments tested.

---

## Issues Found

1. **[BLOCKER] L2 template catch-all**: `selectTemplate` in `clawbot-template-router.ts` routes ALL `lesson-explain` category messages to `L2-explain-led-blink` regardless of experimentId. Only a handful of specific template IDs exist (LED blink, possibly button, potentiometer). All other 80+ experiments fall through to this default. Fix: template router must check experimentId against a mapping table and fall through to LLM if no specific template matches.

2. **[MAJOR] Vol/pag citation malformed**: Template hardcodes `Vol.1 pag. '...'` with a text excerpt after `pag.` instead of a page number. Fix: citation must be `Vol.N pag. NNN` per PZ V3 canonical format.

3. **[MAJOR] Content not experiment-specific**: The text body is 100% identical for all 20 experiments. Morfismo Sense 2 violation — software content does not morph to the experiment being taught.

4. **[MODERATE] Onniscenza bypassed**: L2 template short-circuit means Onniscenza 7-layer aggregator (iter 31 wired, Box 11 = 0.85) never runs for template-matched queries. The classifier `onniscenza-classifier.ts` never fires. RAG retrieval is deferred to browser dispatch rather than enriching the response server-side.

5. **[INFO] Latency is fast (316ms avg)** precisely because no LLM or RAG retrieval happens server-side — it is a local template lookup only. This masks the routing problem as a "feature" (fast response) when it is actually wrong content.
