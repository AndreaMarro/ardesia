# Tester-2 iter 37 Phase 3 fix — COMPLETION

**From**: Tester-2 (R6 + R7 stress runners + execution)
**To**: Orchestrator + Documenter
**Date**: 2026-04-30 (PM, ~21:00 CEST)
**Branch**: `e2e-bypass-preview`
**Status**: COMPLETE — A7-R6 SHIPPED + EXECUTED 100/100, A7-R7 SHIPPED + EXECUTED 200/200

---

## §1 Pre-flight CoV (per Atom spec)

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| `SUPABASE_ANON_KEY` env | present, ref `euqpdueopmlllqjmqnyb` | sourced from `~/.zshrc` (208 char anon JWT, ref verified) | PASS |
| `ELAB_API_KEY` env | present | NOT in zshrc — sourced from `.env` `VITE_ELAB_API_KEY` (64 char) | PASS (workaround) |
| Edge Function `unlim-chat` ACTIVE | iter 37 v50 deployed | LIVE (smoke 4 prompts pre-bench all HTTP 200) | PASS |
| `r6-fixture-100.jsonl` exists | 100 prompts | 100 lines, 10 cat × 10 prompts | PASS |
| `r7-fixture.jsonl` exists | 200 prompts | 200 lines, 10 cat × 20 prompts | PASS |
| Smoke test 3 prompts pre-full-run | both runners | R6 3/3 OK + R7 3/3 OK | PASS |

Anti-regression mandate enforced: NO modification to `src/**` or `tests/**`. Only NEW files in `scripts/bench/run-sprint-r{6,7}-stress.mjs` (READ-ONLY contract respected).

---

## §2 Atom A7-R6 — DONE

**Runner**: `scripts/bench/run-sprint-r6-stress.mjs` (NEW, **447 LOC**)

**Execution log**: `/tmp/r6-run.log` (full 100/100 prompts run)

**Output filesystem (verified)**:
- `scripts/bench/output/r6-stress-report-2026-04-30T18-53-28-013Z.md`
- `scripts/bench/output/r6-stress-responses-2026-04-30T18-53-28-013Z.jsonl` (100 entries)
- `scripts/bench/output/r6-stress-scores-2026-04-30T18-53-28-013Z.json`

**Verdict**: **FAIL** (avg recall@5 = **0.067** vs ≥0.55 PASS threshold).

**Latency**:
- avg 2256ms / p50 1064ms / p95 5071ms / p99 13727ms
- 0/100 failures

**Aggregate breakdown**:

| Bucket | Count | Note |
|--------|-------|------|
| Successful HTTP | 100/100 | — |
| **L2 template-shortcut (RAG bypassed)** | **48/100** | excluded from recall avg |
| **Measured (with debug_retrieval)** | **52/100** | LLM+RAG full path |
| Failures | 0 | — |

**Per-category breakdown** (avg recall@5 over MEASURED only):

| Category | Total | Measured | Template-shortcut | avg recall@5 |
|----------|-------|----------|-------------------|--------------|
| plurale_ragazzi | 10 | 3 | 7 | 0.250 |
| citation_vol_pag | 10 | 0 | 10 | N/A |
| sintesi_60w | 10 | 7 | 3 | 0.250 |
| safety_minor | 10 | 8 | 2 | 0.031 |
| off_topic_redirect | 10 | 10 | 0 | 0.000 |
| deep_concept | 10 | 5 | 5 | 0.000 |
| experiment_mount | 10 | 6 | 4 | 0.042 |
| error_diagnosis | 10 | 7 | 3 | 0.071 |
| vision_describe | 10 | 3 | 7 | 0.000 |
| clawbot_composite | 10 | 3 | 7 | 0.000 |

**Honesty caveats CRITICAL** (5 bullets — material for Documenter audit):

1. **Fixture format on disk DOES NOT match Atom spec**. The PDR claimed each fixture has `expected_chunks: [chunk_ids]`. Actual on-disk schema is `metadata.{vol, pag, keywords}`. I adapted the recall metric to score chunks on **(a) vol+pag pair match (corpus=rag, page exact, keyword overlap)** OR **(b) per-keyword presence in chunk content_preview / chunk_id / section_title** (case-insensitive). This is documented in the runner header HONESTY CAVEAT block + the report MD.

2. **48/100 prompts hit the L2 template router (`clawbot-template-router`)** which short-circuits BEFORE the LLM/RAG path entirely. Those responses contain `template_id`/`template_category`/`template_latency_ms` BUT NO `debug_retrieval` array. Per Atom spec request body sets `debug_retrieval: true` but the template path doesn't honor it (server-side limitation, NOT a runner bug). I bucket those separately as `template_shortcut` and EXCLUDE from the recall avg.

3. **All retrieved chunks return `page: None`** in production. `debug_retrieval` records preserve `chunk_id`, `corpus`, `score`, `content_preview`, `section_title` but `page` is null on every record. This means the "vol+pag exact match" arm of my adapted metric is **never satisfiable** in current prod state. Real keyword matching IS working (e.g. r6-006 retrieved a chunk whose preview "Condensatore: Componente passivo..." matched fixture keyword "condensatore"). The 0.067 avg masks this — distribution shows 4 prompts at 0.5 recall, 6 at 0.2, 42 at 0.0.

4. **Fixture metadata keyword "ragazzi" is meta-token poison**. Every fixture lists 3 keywords with one being "ragazzi" (a plurale signal, not a content topic). It NEVER appears in chunk content_preview, so it pulls every prompt's denominator down by 1 expected signal. If we filtered it out the recall would lift roughly 25-33%.

5. **Retrieval mode = `hybrid`** for all measured prompts (RAG_HYBRID_ENABLED=true env active). The hybrid retriever surfaces both `rag` (volumi) and `wiki` (concept) corpora — content_preview matches DO occur but the metric design penalizes the page=None reality.

**Recommendation iter 38**: re-run with a SECOND adapted metric variant that: (a) ignores "ragazzi" keyword, (b) drops vol+pag from expected when page=None across all retrieved chunks, (c) adds bonus credit when chunk's `corpus` matches fixture's intended corpus (rag/wiki). Likely lifts measurable recall@5 to 0.30-0.45 range on the measured 52 prompts. Either way, this exposes a real RAG-storage gap (page metadata not surfaced) that the team should fix.

---

## §3 Atom A7-R7 — DONE

**Runner**: `scripts/bench/run-sprint-r7-stress.mjs` (NEW, **464 LOC**)

**Execution log**: `/tmp/r7-run.log` (full 200/200 prompts run)

**Output filesystem (verified)**:
- `scripts/bench/output/r7-stress-report-2026-04-30T18-57-41-337Z.md`
- `scripts/bench/output/r7-stress-responses-2026-04-30T18-57-41-337Z.jsonl` (200 entries)
- `scripts/bench/output/r7-stress-scores-2026-04-30T18-57-41-337Z.json`

**Verdict**: **FAIL** (canonical INTENT exec rate = **0.0%** vs ≥80% PASS threshold).

**Latency**:
- avg 2225ms / p50 1056ms / p95 5138ms / p99 13727ms
- 0/200 failures

**Aggregate breakdown**:

| Bucket | Count | % |
|--------|-------|---|
| Successful HTTP | 200/200 | 100% |
| **Canonical `intents_parsed` ≥1 valid** | **0/200** | **0.0%** |
| Legacy `[AZIONE:tool:{...}]` only | 84/200 | 42.0% |
| No actionable signal | 116/200 | 58.0% |
| Failures | 0 | 0% |
| **Combined rate (canonical + legacy)** | **84/200** | **42.0%** |

**Intent quality stats**: total_intents emitted (canonical) = **0** across 200 prompts. shape_valid_pct, whitelist_match_pct, params_valid_pct are all 0% / 0% / 0% — purely because zero canonical `[INTENT:{...}]` JSON tags were generated.

**Per-category breakdown**:

| Category | Total | Canonical | Legacy AZIONE | None | Canon % | Combined % |
|----------|-------|-----------|---------------|------|---------|------------|
| plurale_ragazzi | 20 | 0 | 14 | 6 | 0.0% | 70.0% |
| citation_vol_pag | 20 | 0 | 20 | 0 | 0.0% | 100.0% |
| sintesi_60w | 20 | 0 | 3 | 17 | 0.0% | 15.0% |
| safety_minor | 20 | 0 | 3 | 17 | 0.0% | 15.0% |
| off_topic_redirect | 20 | 0 | 0 | 20 | 0.0% | 0.0% |
| deep_concept | 20 | 0 | 9 | 11 | 0.0% | 45.0% |
| experiment_mount | 20 | 0 | 7 | 13 | 0.0% | 35.0% |
| error_diagnosis | 20 | 0 | 4 | 16 | 0.0% | 20.0% |
| vision_describe | 20 | 0 | 10 | 10 | 0.0% | 50.0% |
| clawbot_composite | 20 | 0 | 14 | 6 | 0.0% | 70.0% |

**Whitelist used (12 actions)**, mirrors `src/components/lavagna/intentsDispatcher.js` ALLOWED_INTENT_ACTIONS (file-system verified 2026-04-30):
`highlightComponent, highlightPin, clearHighlights, mountExperiment, getCircuitState, getCircuitDescription, captureScreenshot, serialWrite, setComponentValue, connectWire, clearCircuit, toggleDrawing`

**Honesty caveats CRITICAL** (4 bullets — these are MAJOR signals for Documenter audit):

1. **PER PDR HONESTY CAVEAT: server-side parser quality only, NOT browser dispatch**. R7 measures `intents_parsed` array surfaced by the Edge Function (iter 36 A1 INTENT parser, iter 37 A1 wired). It does NOT verify end-to-end browser dispatch via `__ELAB_API` (that requires Vercel frontend deploy of `useGalileoChat.js` iter 37 wire-up — out of scope).

2. **🚨 CRITICAL FINDING — Production LLM emits ZERO canonical `[INTENT:{tool,args}]` tags across 200 prompts**. The `intents_parsed` array is empty/null on EVERY single prompt. This is a real production state issue, not a runner bug. Hypotheses:
   - The system prompt may not yet instruct the LLM to emit `[INTENT:{...}]` JSON syntax (may still instruct legacy `[AZIONE:tool:{...}]`)
   - The LLM (`together-gemini-2.5-{flash-lite,pro}`) defaults to legacy syntax when prompted ambiguously
   - The iter 36 A1 INTENT parser (`supabase/functions/_shared/intent-parser.ts`) is wired and listening, but receiving no canonical tags to parse
   - Edge Function `parsedIntents` array stays empty → response.intents_parsed key is omitted (per index.ts:618 `if (parsedIntents.length > 0)`)

3. **84/200 prompts (42%) hit L2 template router** which emits hardcoded legacy `[AZIONE:tool:{...}]` strings (NOT canonical `[INTENT:{...}]` JSON). My runner counts those separately as "Legacy AZIONE" and reports a `combined_rate` (42%) as a SECONDARY signal. Primary acceptance is canonical INTENT only — and that is **0.0% FAIL**.

4. **Of the 116 prompts with NO actionable signal**, all 116 are LLM responses (mostly `together-gemini-2.5-flash-lite`) that returned plain text with no embedded action tags at all. The category breakdown shows `off_topic_redirect` 0/20 (expected — no action tags by design), but `experiment_mount` 7/20 legacy + 13/20 none is a quality issue (these prompts ASK for actions but the LLM returns prose only).

**Recommendation iter 38** (CRITICAL):
- (a) **Verify the system prompt instructs `[INTENT:{tool,args}]` format**, not legacy `[AZIONE:...]`. Inspect `supabase/functions/_shared/system-prompt.ts` for the action-emission examples. If it still teaches `[AZIONE:...]`, the LLM has learned that format and the iter 36 INTENT parser is permanently dark.
- (b) Once the prompt is updated, re-run R7 to measure canonical INTENT exec rate uplift. Target ≥80% gates Box 14 / dispatcher 62-tool deno port progression.
- (c) Consider a server-side `[AZIONE:...]` → `[INTENT:{...}]` adapter as a temporary bridge while the prompt change rolls out (low risk, mechanical regex translation in `intent-parser.ts`).

---

## §4 Pre-flight CoV outcome

Per PDR §3 Pre-flight CoV step 2: env keys WERE available (PARTIAL — ELAB_API_KEY had to be sourced from `.env` `VITE_ELAB_API_KEY` rather than `~/.zshrc`). NO env-blocked deferral was needed. Both runners executed FULL fixtures (100 + 200 prompts) live against prod Edge Function v50.

Smoke test 3 prompts pre-full-run: PASS for both R6 and R7 (logs in `/tmp/r6-smoke.log` + R7 inline output). Verifies HTTP 200 + JSON shape + scoring math + output file write.

---

## §5 Anti-regression compliance

- ✅ NO modification to `src/**` or `tests/**` — file ownership respected.
- ✅ NO `--no-verify` used (no commits made by Tester-2 — Phase 3 orchestrator handles commits).
- ✅ NO push to main.
- ✅ vitest baseline 13338 PASS preserved (zero src/tests touched).
- ✅ Build NOT re-run (no src/build deps changed, defer iter 38 entrance gate per Atom mandate).
- ✅ Mac Mini cron LIVE (Tester-1 verified iter 37 Phase 1, no changes from Tester-2).

---

## §6 Files delivered iter 37 Phase 3 fix

**NEW**:
- `scripts/bench/run-sprint-r6-stress.mjs` — 447 LOC
- `scripts/bench/run-sprint-r7-stress.mjs` — 464 LOC
- `scripts/bench/output/r6-stress-report-2026-04-30T18-53-28-013Z.md`
- `scripts/bench/output/r6-stress-responses-2026-04-30T18-53-28-013Z.jsonl`
- `scripts/bench/output/r6-stress-scores-2026-04-30T18-53-28-013Z.json`
- `scripts/bench/output/r7-stress-report-2026-04-30T18-57-41-337Z.md`
- `scripts/bench/output/r7-stress-responses-2026-04-30T18-57-41-337Z.jsonl`
- `scripts/bench/output/r7-stress-scores-2026-04-30T18-57-41-337Z.json`
- `automa/team-state/messages/tester2-iter37-phase3-completed.md` (this file)

**MODIFIED**: none (READ-ONLY contract).

---

## §7 Iter 38 priority hand-off

**P0 — Iter 38 entrance critical signals**:

1. **R7 canonical INTENT exec rate = 0%** is a SHOWSTOPPER for ADR-028 progression. The Edge Function INTENT parser is dark in production. Iter 38 first action: inspect + amend `supabase/functions/_shared/system-prompt.ts` to instruct `[INTENT:{tool,args}]` JSON format with concrete few-shot examples. Re-run R7 — target ≥80% canonical.

2. **R6 recall@5 = 0.067** is materially worse than the 0.55 PASS gate, but **two metric design issues compound the result**: (a) "ragazzi" pseudo-keyword poisons every denominator, (b) RAG storage layer doesn't surface `page` field through hybrid retrieval. Iter 38 should: (a) ship a v2 R6 metric variant excluding "ragazzi" + handling page=None gracefully; (b) verify in `supabase/functions/_shared/rag.ts` whether page metadata is preserved in `hybridRetrieve()` output (audit `chunks[i].page` source). Real recall is likely closer to 0.30-0.45.

3. **L2 template router consumes ~48% of R6 prompts and ~42% of R7 prompts**. This is by design (latency win) but means RAG + INTENT pipelines are shadow-tested at half stride. Consider routing fixture prompts through a debug header (`X-Skip-L2-Templates: true`) or a bench-only env flag to bypass the router for quality measurement.

---

## §8 Final stats summary (one-line each, for Documenter quick paste)

- **R6**: 100/100 prompts | recall@5 avg **0.067** (FAIL gate ≥0.55) | 48 template-shortcut | 52 measured | 0 failures | latency p95 5071ms | runner **447 LOC**
- **R7**: 200/200 prompts | canonical INTENT rate **0.0%** (FAIL gate ≥80%) | combined w/ legacy AZIONE 42.0% | 0 canonical intents emitted | 84 legacy `[AZIONE:...]` | 116 no-signal | 0 failures | latency p95 5138ms | runner **464 LOC**

---

End of Tester-2 iter 37 Phase 3 fix completion.
