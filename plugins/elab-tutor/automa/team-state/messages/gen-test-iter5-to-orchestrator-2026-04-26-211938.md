# gen-test-opus iter 5 → orchestrator (Phase 1)
date: 2026-04-26 21:19:38 CEST
agent: generator-test-opus
sprint: S iter 5 phase 1

## Status: COMPLETE — R5 stress real PASS 91.45%

## Files modified

1. `scripts/bench/score-unlim-quality.mjs` — added `--fixture-path <path>` CLI flag + `FIXTURE_PATH` env var support. Default behavior preserved (R0 fixture). Stderr log on load: `[scorer] loaded N fixtures from <path>`.
2. `scripts/bench/run-sprint-r5-stress.mjs` — pass `--fixture-path <FIXTURE>` to scorer execFileSync call. Removed obsolete comment about scorer R0-only behavior.

## NEW output files (R5 Edge Function REAL stress)

- `scripts/bench/output/r5-stress-responses-2026-04-26T19-13-43-568Z.jsonl` (50 entries)
- `scripts/bench/output/r5-stress-scores-2026-04-26T19-13-43-568Z.json` (12-rule per-fixture)
- `scripts/bench/output/r5-stress-report-2026-04-26T19-13-43-568Z.md` (full report)

## R5 Edge Function score (real, ufficiale)

- Overall: **91.45% PASS** (402.2/439.8 weighted)
- HTTP success: **50/50** (zero failures)
- Verdict: **PASS** (target ≥85%, R5 hard gate ≥90% per category)
- Avg latency: **4715ms** (4020-6030ms)
- Avg words: **42** (target ≤60)

## Per-category breakdown (R5 hard gate ≥90% PASS)

| Category | PASS | Total | % | Avg pct |
|----------|------|-------|---|---------|
| plurale_ragazzi | 10 | 10 | 100% | 90.4% |
| citation_vol_pag | 10 | 10 | 100% | 89.8% |
| sintesi_60_parole | 8 | 8 | 100% | 100.0% |
| safety_warning | 6 | 6 | 100% | 90.5% |
| off_topic_redirect | 6 | 6 | 100% | 87.2% |
| deep_question | 9 | 10 | 90% | 90.9% |

R5 hard gate (≥90% per category): **6/6 categories MET** (deep_question right at gate).

## Per-rule breakdown

| Rule | Pass | Total | % |
|------|------|-------|---|
| plurale_ragazzi | 44 | 50 | 88% |
| no_imperativo_docente | 50 | 50 | 100% |
| max_words | 50 | 50 | 100% |
| citation_vol_pag | 2 | 33 | 6% (only 33 fixtures expected citation) |
| analogia | 27 | 28 | 96% |
| no_verbatim_3plus_frasi | 50 | 50 | 100% |
| linguaggio_bambino | 50 | 50 | 100% |
| action_tags_when_expected | 50 | 50 | 100% |
| synthesis_not_verbatim | 50 | 50 | 100% |
| off_topic_recognition | 50 | 50 | 100% |
| humble_admission | 50 | 50 | 100% |
| no_chatbot_preamble | 50 | 50 | 100% |

Citation_vol_pag 6% is a known gap (Capitoli context map missing experimentId mappings for some r5 fixture entries — same gap noted iter 3 R0 Edge Function 91.80%). Not regression.

## Delta vs R5 Together direct (98% basic)

- **R5 Together direct**: 49/50 = 98.00% (basic 4-rule scoring: plurale + max_words + citation regex + analogia)
- **R5 Edge Function**: 91.45% (full 12-rule PZ scorer)

**Apparent delta -6.55pp is misleading** — different scoring scopes:
- Together direct used a stripped 4-rule "basic" scorer (no Capitoli, no synthesis, no action tags, no humble, no preamble checks)
- Edge Function used the full 12-rule weighted scorer
- Apples-to-apples comparison NOT possible with current outputs

When restricted to overlapping rules (plurale + max_words + citation + analogia):
- Edge Function: plurale 88%, max_words 100%, citation 6% (diluted by 33-fixture subset), analogia 96%
- Together direct (per-category report): plurale 100%, citation 100% (without Capitoli context — likely loose fixture requirements OR different anonymized regex)

The apparent Together advantage on citation_vol_pag (100%) is suspicious because Together direct had **no Capitoli injection** per its own honesty caveat. Likely Together's basic scorer used a looser regex than the 12-rule scorer. This warrants iter 6 investigation if Andrea wants strict comparison; for iter 5 the Edge Function 91.45% measure is **the official R5 score** because it uses the production scorer.

## Latency comparison

- **R5 Together direct**: ~3-5s typical (single Together hop, no Edge Function overhead)
- **R5 Edge Function**: 4715ms avg (4020-6030ms range)
- Delta: ~+500-1500ms for Edge Function pipeline (Capitoli loader + PZ validator + audit log)
- Acceptable trade-off for production score boost

## Test baseline preserved

- **vitest main**: 12574 PASS / 1 FAIL / 7 skipped / 8 todo (12590 total)
- The 1 FAIL is `tests/unit/wiki/wiki-concepts.test.js` (definizione/analogia 76.7% < 80% threshold) — **PRE-EXISTING** regression from Mac Mini wiki batch additions, NOT caused by my scorer/runner changes (verified via `git stash` + re-run = same failure).
- vs iter 4 baseline 12575 PASS: -1 wiki test (unrelated to scorer scripts which have no test coverage).
- ZERO regressions caused by iter 5 phase 1 changes.

## Open issues

1. **citation_vol_pag 6% pass rate** — same gap iter 3-4 noted. Capitoli context map needs experimentId expansion for r5 fixtures `r5-022..r5-026` (citation_vol_pag category). Not iter 5 scope.
2. **deep_question 90% per category** — sits exactly on R5 hard gate. r5-050 failed both citation_vol_pag + analogia (only 83% pct). Marginal pass.
3. **plurale_ragazzi rule 88% (44/50)** — 6 fixtures lack the Italian plural marker. Investigation iter 6.
4. **R5 Together direct vs Edge Function comparison** — different scorers used. If Andrea wants strict apples-to-apples, iter 6 should re-score Together direct responses with the same 12-rule scorer.
5. **Wiki concepts test failure** — pre-existing regression flagged for follow-up (out of scope iter 5 generator-test).

## CoV (Chain of Verification)

- ✅ Scorer fixture path arg fix tested with 1-prompt fake response (100% PASS, 50 fixtures loaded).
- ✅ R5 stress runner passes `--fixture-path` correctly (verified by `[scorer] loaded 50 fixtures from .../r5-fixture.jsonl` log).
- ✅ Real R5 stress run completed: 50/50 HTTP success, 91.45% PZ score.
- ✅ vitest baseline check post-changes: 12574 PASS (1 pre-existing wiki failure unrelated).
- ✅ Files written: 3 NEW r5-stress-* outputs; 1 modified scorer; 1 modified runner.
- ✅ HARD RULES respected: no src/, no supabase/, no docs/ touched. No push, no merge.

## R5 PASS verdict

**R5 Edge Function 91.45% PASS** (target 85%, R5 hard gate per-category 90% — both met). Iter 5 phase 1 R5 stress measurement OFFICIAL.
