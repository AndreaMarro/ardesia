# Tester-5 — Sprint T iter 37 Phase 3 fix verify completed

**Date**: 2026-04-30 PM
**Agent**: Tester-5 (R7 re-run post-fix verify)
**Atom**: R7 re-run post-fix verify (~30 min)
**Verdict**: **FAIL — fix did NOT lift canonical INTENT rate (still 0.0%)**

## R7 post-fix metrics

| Metric | Pre-fix (Tester-2 18:57) | Post-fix (Tester-5 19:14) | Target | Verdict |
|--------|--------------------------|---------------------------|--------|---------|
| Successful HTTP | 200/200 | 200/200 | — | OK |
| Failures | 0 | 0 | — | OK |
| **Canonical INTENT rate** | **0.0%** | **0.0%** | ≥80% | **FAIL** |
| Combined (canonical + legacy AZIONE) | 42.0% | 42.0% | ≥80% | FAIL |
| Legacy `[AZIONE:...]` only | 84/200 | 84/200 | — | (template router unchanged) |
| No actionable signal | 116/200 | 116/200 | — | (LLM emits prose-only) |
| Latency avg | 2225ms | 2749ms | — | (slight regression non-blocking) |
| Latency p95 | 5138ms | 7984ms | <6000ms | WARN |
| Latency p99 | 6519ms | 11718ms | — | WARN |

**Canonical `[INTENT:` tag count in 200 LLM-served responses**: **0** (grep verified in jsonl).
**Legacy `[AZIONE:` tag count**: 69 (all from `clawbot-l2-*` template router source, NOT from Together LLM).

## Output paths

- Report: `scripts/bench/output/r7-stress-report-2026-04-30T19-14-29-571Z.md`
- Responses (jsonl): `scripts/bench/output/r7-stress-responses-2026-04-30T19-14-29-571Z.jsonl`
- Scores (json): `scripts/bench/output/r7-stress-scores-2026-04-30T19-14-29-571Z.json`

## Diagnose — why fix failed (HIGH confidence, DUAL ROOT CAUSE)

**Root cause #1 — LLM does NOT emit `[INTENT:...]` tags at all** (file:line evidence):
- Smoke 3/3 prompts to v51 unlim-chat (`Mostrami il LED`, `Evidenzia il LED e il resistore`, `Carica esperimento v1-cap6-esp1`) returned text with ZERO INTENT or AZIONE tags. Pure prose with `Ragazzi,` + Vol/cap citation + kit ELAB mention. Source: `together-gemini-2.5-flash-lite`.
- Bench full 200 prompts: 0 `[INTENT:` strings in any of the 200 response excerpts (`grep -c '\[INTENT:'` = 0).
- The 84 PASS_LEGACY rows are ALL from `clawbot-l2-*` template router source (template strings hardcoded in `supabase/functions/_shared/clawbot-templates.ts`), NOT from any Together LLM completion.
- 116 LLM-served prompts that did NOT match L2 template returned PURE PROSE with no action surface.

The system prompt amend (lines 68-93 `system-prompt.ts`) added an INTENT JSON example block + natural-language interpretation rules, BUT:
1. The block is presented as a tag dictionary alongside the existing `[AZIONE:...]` legacy section (lines 31-66), with no MANDATORY/OBBLIGATORIO marker. The LLM treats it as optional.
2. The first 60 lines of the prompt heavily emphasize Principio Zero pedagogy (`Ragazzi`, plurale, Vol/pag verbatim, kit fisico mention, max 60 parole) which the LLM is now strongly biased toward — to the point that it skips action tags entirely.
3. There is NO few-shot example showing a complete Q→A pair with Italian user prompt + Italian response containing an `[INTENT:...]` tag at the end. The lone canonical example on line 84 is presented as an isolated "Esempio canonico" string, not as a pattern reinforcement.

**Root cause #2 — KEY-NAME MISMATCH between prompt teaching and parser expectation** (file:line evidence):
- `supabase/functions/_shared/system-prompt.ts:70-93` teaches the LLM: `[INTENT:{"action":"...","params":{...}}]` — keys = `action` and `params`.
- `supabase/functions/_shared/intent-parser.ts:215-224` extracts ONLY: `parsed.tool` and `parsed.args` — keys = `tool` and `args`. Line 215-219 explicitly drops the entry when `tool` is missing (which it would always be if LLM follows the prompt verbatim).
- Therefore even if the LLM started emitting `[INTENT:{action:"...",params:{...}}]` tags exactly as taught, the server-side parser would silently discard 100% of them, and `intents_parsed` would remain `[]`.

**Why this combination produces the observed 0.0%**:
- LLM doesn't emit any INTENT tag → 0 canonical surface (root cause #1, dominant).
- Even if LLM did emit them following the prompt, the parser would reject all (root cause #2, latent).
- Net: 0.0% canonical INTENT rate, identical to Tester-2 pre-fix baseline.

**Eliminated alternatives**:
- Deploy version: NOT cache. v51 verified live (`supabase functions list` shows v51 ACTIVE updated 2026-04-30 19:09:08 UTC, well before bench 19:14). Smoke responses include the new "Ragazzi" + Vol citation + "kit ELAB" text consistent with the post-fix prompt.
- Server-side parser bug: parser regex + brace scan work correctly for well-formed `{tool:"...",args:{...}}` (24/24 unit tests PASS per iter 36 close). The bug is the prompt ↔ parser key-name contract violation, not a regex issue.

## Diagnose — recommended fixes (NOT implemented per scope discipline)

For the team lead to consider (do NOT implement here per Tester-5 scope):
1. **Fix #1 (server prompt)**: Make INTENT emission MANDATORY when user requests an action. Add explicit OBBLIGATORIO marker + 3-5 few-shot Italian Q→A pairs with `[INTENT:...]` tag at the end.
2. **Fix #2 (key-name reconciliation)**: Either (a) update prompt examples to use `tool/args` keys matching parser, OR (b) extend parser to accept both `action|tool` and `params|args` (graceful fallback). Recommendation: option (b) is more forgiving for LLMs that have memorized common JSON patterns.
3. **Fix #3 (provider tuning)**: Together gemini-2.5-flash-lite at 70/20/10 routing weight may have lower instruction-following on tag-emission than Mistral. Consider routing tag-mandate prompts to higher-capability provider OR adding explicit `tool_choice`-style structured-output gate.

## Honesty caveats

1. **Bench scope = server-side parser surface only**, NOT browser dispatch end-to-end (per script header). This was already the published interpretation; fix verify here remains within scope.
2. **Combined rate 42.0% identical to Tester-2 baseline** because the L2 template router handles a fixed subset of prompts deterministically and emits hardcoded `[AZIONE:...]` strings — completely independent of the system-prompt amend, which only affects LLM-served prompts.
3. **Latency p95 7984ms vs 6000ms target = WARN**, not in original acceptance gate but worth flagging. p99 11.7s suggests Together cold start or routing tail latency.
4. **No regression detected** in PRINCIPIO ZERO compliance based on response text excerpts: "Ragazzi" + Vol/cap citation + kit ELAB mention all present in the LLM-served excerpts I sampled. The fix improved pedagogy presentation but did not produce action-tag output.
5. **Fixture is identical to Tester-2 pre-fix run** (`scripts/bench/r7-fixture.jsonl`, 200 prompts unchanged). Apples-to-apples comparison is valid.
6. **vitest baseline 13338 NOT touched** (read-only investigation). No `src/`, `tests/`, or `supabase/` modifications by Tester-5.
7. **Scope discipline**: this report identifies root causes with file:line citations but does NOT amend `system-prompt.ts` or `intent-parser.ts`. That work belongs to Maker-1/Maker-2 in iter 38 P0 per Pattern S r3 ownership.

## Files relevant for follow-up (absolute paths)

- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/system-prompt.ts` — lines 68-93 INTENT block (teaches `action/params`, dominant first 60 lines emphasize PZ pedagogy non-tag)
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/_shared/intent-parser.ts` — lines 215-224 strict `tool/args` extraction
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/supabase/functions/unlim-chat/index.ts` — lines 510-540 wire-up of `parseIntentTags` + `intents_parsed` surface
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/scripts/bench/output/r7-stress-report-2026-04-30T19-14-29-571Z.md` — this run report
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/scripts/bench/output/r7-stress-responses-2026-04-30T19-14-29-571Z.jsonl` — full responses with text excerpts
- `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/scripts/bench/r7-fixture.jsonl` — 200-prompt fixture (unchanged from Tester-2)

## Verdict for orchestrator

**FAIL** — R7 obiettivo PDR §1 #10 NOT closed. Canonical INTENT rate stuck at 0.0% (target ≥80%, +0.0pp lift). Sprint T iter 37 Phase 3 fix attempted by orchestrator inline (system-prompt.ts amend + redeploy v51) is INSUFFICIENT. Iter 38 needs (a) MANDATORY tag emission rule + few-shot Italian examples in prompt AND (b) parser key-name reconciliation OR prompt example correction. Recommend Maker-1 or Maker-2 atom iter 38 P0.
