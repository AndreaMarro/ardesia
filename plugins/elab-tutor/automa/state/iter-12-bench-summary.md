# Sprint S iter 12 — Bench Summary

Generated: 2026-04-28T04:21:04.963Z
Dry-run: false
Suites run: B2

## Pre-flight
- Env required missing: SUPABASE_ANON_KEY
- Env optional missing: TOGETHER_API_KEY, GEMINI_API_KEY
- Vitest baseline: 0 PASS (BELOW threshold)
- Services: (not checked)

## Suite Results
- **B2** (FAIL): B2 Hybrid RAG recall@5
  - target: recall@5 ≥0.55 (lift +0.165 vs iter 11 0.384)
  - measured: FAIL exit=1

## Aggregate
- Pass: 0 / Fail: 1 / Stub-or-dry: 0
- Score lift target: 9.30 → **9.65** ONESTO

## Pass criteria iter 12 (B1-B10)
- B1 R7 200-prompt: ≥87% global + 10/10 cat ≥85%
- B2 Hybrid RAG: recall@5 ≥0.55 (lift +0.165 vs 0.384 iter 11)
- B3 Vision E2E: p95 <8s + topology ≥80%
- B4 TTS Isabella WS: p50 <2s OR ceiling browser fallback 0.85
- B5 ClawBot composite: success ≥90% + sub-tool p95 <3s
- B6 Cost: <€0.012/session avg + p95 <€0.025
- B7 Fallback gate: 100% accuracy + audit log 100%
- B8 Simulator engine integration: vitest count (iter 12 stub, real impl iter 13+)
- B9 Arduino compile flow 92 esperimenti: ≥95% (iter 12 stub)
- B10 Scratch Blockly compile: ≥90% (iter 12 stub)

## Notes
- B8/B9/B10 are NEW iter 12 stubs — count vitest filter PASS in tests/{unit,integration}/{simulator,arduino-compile,scratch-compile}.
- Real implementations deferred iter 13+ (dedicated harnesses).
- B1 fallback: r7-fixture.jsonl missing → r6-fixture.jsonl 100 prompts (warn logged).
- B4 ceiling 0.85: applied if Edge TTS WS DOWN (per Box 8 documented browser fallback).