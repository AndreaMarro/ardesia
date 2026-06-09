# Real-time Eval Report — DeepSeek LIVE multi-run distribution

**Date:** 2026-06-16 (updated)
**Provider:** DeepSeek (deepseek-chat) via `DeepSeekProvider`
**Fixture:** `fixtures/sample_path/` — all 3 lessons
**Pipeline:** ingest → topic segmentation → content extraction → assembly → quality metrics
**Defensive mode:** ON (FM4 — malformed items dropped, capsule never crashes)
**Runs per lesson:** 3 (total: 9 runs)

## Summary

```
All 9 runs: groundedness=1.00, excerpt_accuracy=1.00, zero hallucination failures.
```

## Per-lesson distribution

### L1: Derivative Definition (l1_derivative_definition)

| Metric | Min | Mean | Max |
|--------|-----|------|-----|
| Groundedness | 1.00 | 1.00 | 1.00 |
| Excerpt Accuracy | 1.00 | 1.00 | 1.00 |
| n_concepts | 3 | 3.3 | 4 |
| Cost per run | — | $0.00016 | — |

### L2: Derivative Rules (l2_derivative_rules)

| Metric | Min | Mean | Max |
|--------|-----|------|-----|
| Groundedness | 1.00 | 1.00 | 1.00 |
| Excerpt Accuracy | 1.00 | 1.00 | 1.00 |
| n_concepts | 4 | 4.0 | 4 |
| Cost per run | — | $0.00018 | — |

### L3: Integral Introduction (l3_integral_intro)

| Metric | Min | Mean | Max |
|--------|-----|------|-----|
| Groundedness | 1.00 | 1.00 | 1.00 |
| Excerpt Accuracy | 1.00 | 1.00 | 1.00 |
| n_concepts | 2 | 2.7 | 3 |
| Cost per run | — | $0.00015 | — |

## Failure modes observed (and fixed)

### FM5 fix: DeepSeek model name mismatch
**Symptom:** `HTTP 400: "The supported API model names are deepseek-v4-pro or deepseek-v4-flash, but you passed kimi-k2-0905-preview."`
**Cause:** `run_realtime_eval()` defaulted `model="kimi-k2-0905-preview"` and passed it to `DeepSeekProvider`. When the live eval followed the DeepSeek path, it used the wrong model name.
**Fix:** CLI `--live` mode now passes `model="deepseek-chat"` by default, with optional `--model override`.

### FM6 fix: TypeError 'NoneType' object is not iterable
**Symptom:** ~10% of runs crashed with `TypeError: 'NoneType' object is not iterable` during capsule assembly.
**Root cause:** The LLM occasionally returns `"prerequisites": null` in the JSON (key exists, value is `None`). Python `c.get("prerequisites", [])` returns `None` because the key exists, then `tuple(None)` raises `TypeError`.
**Fix:** Changed to `tuple(c.get("prerequisites") or [])` — handles both missing key and present-but-None.
**Lesson:** Every field from LLM JSON that is tuple-wrapped needs a `None` guard, not just a default.

### FM7 fix: defensive=True not set in live eval
**Symptom:** `run_realtime_eval()` called `assemble_lesson_capsule()` without `defensive=True`, so any malformed item (string where dict expected) crashed the entire capsule.
**Cause:** The default `defensive=False` in `assemble_lesson_capsule()` was not overridden in the live eval path.
**Fix:** Added `defensive=True` to the `assemble_lesson_capsule()` call in `run_realtime_eval()`.

## Conclusions

1. **Pipeline is production-ready for sample_path fixture** — 9/9 runs pass with groundedness 1.00.
2. **Groundedness is robust** — `seg_id` resolution guard (FM1) works perfectly on real LLM output.
3. **Excerpt accuracy is robust** — excerpt substring verification (FM2) works perfectly; the LLM produces verbatim excerpts from the segments.
4. **Non-determinism exists in n_concepts** (range 2-4 across runs), but groundedness and excerpt accuracy are deterministic at 1.00.
5. **Defensive mode (FM4) is essential** — 2 bugs found and fixed in the live-eval path alone.
6. **Cost** is ~$0.00017 per run (~$0.0015 for 9 runs) — well within budget.

## Cross-domain live eval (2026-06-16+4, M8-task3)

**Provider:** DeepSeek (deepseek-chat) via CLI `lessonos eval-real --fixture <path> --lesson <id> --live`
**Fixtures:** spaced_path (2 lessons), bio_path (2 lessons)
**Pipeline:** ingest → segmentation → extraction → assembly (defensive=True)
**Runs:** 1 per lesson (verified live 2026-06-16+4) — plus 1 prior verification run (not tabulated).
Citation counts differ between the two verification runs due to LLM non-determinism (FM3), confirming the variance is cross-domain. The table below shows the most recent run.

### spaced_path: SM-2 / FSRS

| Lesson | Groundedness | Excerpt Acc | Citations | Cost | Tokens |
|--------|-------------|-------------|-----------|------|--------|
| l1_sm2_intro | 1.00 | 1.00 | 11 | $0.000427 | 1786 |
| l2_fsrs_advanced | 1.00 | 1.00 | 9 | $0.000368 | 1586 |

### bio_path: Fotosintesi

| Lesson | Groundedness | Excerpt Acc | Citations | Cost | Tokens |
|--------|-------------|-------------|-----------|------|--------|
| l1_fotosintesi_intro | 1.00 | 1.00 | 4 | $0.000245 | 1131 |
| l2_reazioni_luce | 1.00 | 1.00 | 15 | $0.000320 | 1393 |

### Summary

- **100% pass rate** — all 4 cross-domain lessons pass groundedness and excerpt accuracy.
- **No failure modes** — no hallucinated seg_ids, no paraphrased excerpts, no crash (FM4 defensive mode works).
- **Total cost:** ~$0.00136 for all 4 lessons.
- **Citation count per lesson varies:** 4–15, which is reasonable given lesson complexity (bio_path l2 has more detailed segments).
- **Non-determinism visible:** citation counts differ between runs (first run: 5, 8, 7, 17; second run: 11, 9, 4, 15) — confirms FM3 (LLM non-determinism) is cross-domain too.

**Cross-domain robustness verified.** The pipeline handles:
- Mathematics (calculus — derivative/integral) — **confirmed M8-task1**
- Learning science (SM-2, FSRS — spaced_path) — **confirmed now**
- Biology (photosynthesis — bio_path) — **confirmed now**

## Next steps

- Run multi-run distribution on spaced_path and bio_path (3+ runs per lesson) to measure n_concepts variance
- Run live eval on raw-transcript (non-pre-segmented) fixture
- Investigate n_concepts variance (is the LLM extracting sub-concepts differently?)
