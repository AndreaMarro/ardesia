# First Real-time Eval Report — DeepSeek-chat live on fixture

**Date:** 2026-06-08
**Provider:** DeepSeek (deepseek-chat) via `DeepSeekProvider`
**Fixture:** `fixtures/sample_path/lessons/l1_derivative_definition.json`
**Pipeline:** ingest → topic segmentation → content extraction → assembly → quality metrics

## Summary

```
[EVAL] l1_derivative_definition: groundedness=1.00 (PASS) | excerpt_accuracy=1.00 (PASS) | citations=4 | cost=$0.001713 | tokens=874 | llm_calls=2
```

## Scores

| Metric               | Score |
|----------------------|-------|
| Groundedness         | 1.00  |
| Excerpt Accuracy     | 1.00  |
| Total Citations      | 4     |
| LLM Calls           | 2     |
| Total Tokens        | 874   |
| Estimated Cost      | $0.001713 |

## Extracted Concepts

1. **Derivata come velocità istantanea di variazione** — introduced
2. **Rapporto incrementale** — introduced
3. **Limite del rapporto incrementale** — introduced
4. **Derivata f'(x) come limite** — introduced

All 4 concepts are grounded: every `Citation.seg_id` resolves to a real
transcript segment (`l1s1`, `l1s2`, `l1s3`).

## Extracted Topic Spans

3 topic spans covering the full transcript range [0, 175].

## Infrastructure

- `lessonos/llm/deepseek.py` — `DeepSeekProvider` (stdlib HTTP, OpenAI-compatible)
- `lessonos/capsule/parsing.py` — `extract_json()` handles markdown fences (`` ```json … ``` ``)
- `lessonos/eval/realtime.py` — `run_realtime_eval()` with tracked costs

## Notes

- DeepSeek returned JSON wrapped in prose + ` ```json ` fences; `extract_json`
  stripped them successfully (P1 fix from
  [COORDINATION.md](../COORDINATION.md)).
- The response was grounded and well-formed (no hallucinated seg_ids, no
  invalid concept statuses).
- Cost data tracked through `CostLedger` with `estimate_deepseek_api_cost`
  (cache-miss rates: $0.14/M input, $0.28/M output).
