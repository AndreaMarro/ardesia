---
id: ATOM-S8-A9
sprint: S-iter-8
priority: P0
owner: gen-app-opus
phase: 1
deps: []
created: 2026-04-27
---

## Task
Implement 5 NEW bench scorers: score-hybrid-rag.mjs, score-tts-isabella.mjs, score-cost-per-session.mjs, score-fallback-chain.mjs, score-clawbot-composite.mjs.

## Acceptance criteria
- [ ] CoV vitest 12599+ PASS preserved (scorers are .mjs scripts, no test impact)
- [ ] build PASS exit 0 (defer if heavy)
- [ ] file ownership respected — write ONLY `scripts/bench/score-*.mjs` + `automa/team-state/messages/gen-app-*.md`
- [ ] `score-hybrid-rag.mjs` — input fixture + retrieved chunks → output `{recall@1, recall@3, recall@5, precision@1, MRR, nDCG@5, latency_ms, token_count_retrieved}` per query + globale aggregates
- [ ] `score-tts-isabella.mjs` — input audio file + text → output `{latency_ms, audio_duration_ms, real_time_factor, file_size_kb, mos_score (LLM-as-judge stub OR manual)}` per sample
- [ ] `score-cost-per-session.mjs` — input session log → output `{cost_together_usd, cost_voyage_usd, cost_supabase_usd, cost_total_usd, tokens_input, tokens_output, n_rag_queries, n_tts_calls}` per session, pricing 2026-04-27 hardcoded reference
- [ ] `score-fallback-chain.mjs` — input call log → output `{provider_used, fallback_transit_latency_ms, gate_decision_correct, audit_log_present, anonymization_applied, total_latency_ms}` per call + globale gate accuracy
- [ ] `score-clawbot-composite.mjs` — input composite log → output `{success_rate, sub_tool_latency_p95, total_latency_ms, cache_hit_rate, pz_v3_warnings_count, failed_at_index}` per composite
- [ ] All scorers Node.js >=18, ESM `.mjs`, CLI `--input <file> --output <file>` + `--threshold` optional
- [ ] All scorers exit code 0 = PASS thresholds, 1 = FAIL with detail
- [ ] PRINCIPIO ZERO + MORFISMO compliance N/A (scorers are tooling, no user-facing text)

## Output files
- `scripts/bench/score-hybrid-rag.mjs` (NEW, ~150-250 LOC)
- `scripts/bench/score-tts-isabella.mjs` (NEW, ~150-250 LOC)
- `scripts/bench/score-cost-per-session.mjs` (NEW, ~200-300 LOC)
- `scripts/bench/score-fallback-chain.mjs` (NEW, ~150-250 LOC)
- `scripts/bench/score-clawbot-composite.mjs` (NEW, ~150-250 LOC)
- `automa/team-state/messages/gen-app-opus-iter8-to-orchestrator-2026-04-27-<HHMMSS>.md` (completion or batched A2/A4/A6)

## Done when
5 scorer files exist, each >=100 LOC, CLI runnable `node scripts/bench/score-X.mjs --help` shows usage.
