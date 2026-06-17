# ClawBot Composite Bench Report
Generated: 2026-04-27T12:54:01.612Z
Fixtures: 25 (synthetic executor)
Threshold success_rate: 0.9

## Aggregates
- success_rate: 80.0%
- sub_tool_p50: 164ms
- sub_tool_p95: 2129ms
- avg_total_latency_ms: 1779
- cache_hit_rate: 0.0%
- pz_v3_warnings: 3

## Honesty caveat
Synthetic executor used (Deno+__ELAB_API live integration deferred).
Real composite execution requires composite-handler.ts loaded via Deno runtime
with __ELAB_API stubs (highlightComponent, speakTTS, captureScreenshot).

Verdict: **FAIL**