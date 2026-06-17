---
id: ATOM-S8-A8
sprint: S-iter-8
priority: P0
owner: gen-test-opus
phase: 1
deps: []
created: 2026-04-27
---

## Task
Create 6 NEW bench fixtures per BENCHMARK-SUITE-ITER-8: hybrid-rag-gold-set 30, tts-isabella 50, clawbot-composite 25, session-replay 50, fallback-chain 200, circuits/{1..20}.png 20.

## Acceptance criteria
- [ ] CoV vitest 12599+ PASS preserved
- [ ] build PASS exit 0 (defer if heavy)
- [ ] file ownership respected — write ONLY `scripts/bench/*.jsonl` + `tests/fixtures/circuits/*.png` + `automa/team-state/messages/gen-test-*.md`
- [ ] `scripts/bench/hybrid-rag-gold-set.jsonl` — 30 query (10 keyword + 10 semantic + 10 hybrid) schema `{id, query, category, expected_chunks[], min_recall_at_5}`
- [ ] `scripts/bench/tts-isabella-fixture.jsonl` — 50 sample (5 cat × 10) schema `{id, category, text, expected_word_count, expected_voice}`
- [ ] `scripts/bench/clawbot-composite-fixture.jsonl` — 25 composite (10 highlight+speak+camera + 5 mount+analyze+suggest + 5 vision+diagnose+speak + 5 RAG+synth+tts) schema `{id, sub_tools[], expected_success}`
- [ ] `scripts/bench/session-replay-fixture.jsonl` — 50 session replay (1 session ~12 turn UNLIM) schema `{session_id, turns[]}`
- [ ] `scripts/bench/fallback-chain-fixture.jsonl` — 200 calls (100 normal + 50 RunPod-down + 30 quota + 20 student-gate) schema `{id, scenario, expected_provider, runtime}`
- [ ] `tests/fixtures/circuits/01.png` ... `20.png` — 20 circuit screenshots (5 corretti + 5 errore + 5 complessi + 5 edge) — IF assets non disponibili, generare placeholder PNG via canvas script + flag warning iter 9 reale screenshots required
- [ ] Total ~355 fixture entries + 20 PNG
- [ ] PRINCIPIO ZERO + MORFISMO compliance applicabile (session-replay turns rispettano plurale "Ragazzi,")

## Output files
- `scripts/bench/hybrid-rag-gold-set.jsonl` (NEW, 30 lines)
- `scripts/bench/tts-isabella-fixture.jsonl` (NEW, 50 lines)
- `scripts/bench/clawbot-composite-fixture.jsonl` (NEW, 25 lines)
- `scripts/bench/session-replay-fixture.jsonl` (NEW, 50 lines)
- `scripts/bench/fallback-chain-fixture.jsonl` (NEW, 200 lines)
- `tests/fixtures/circuits/01.png` ... `20.png` (NEW, 20 PNG, placeholder OK if real screenshots blocked)
- `automa/team-state/messages/gen-test-opus-iter8-to-orchestrator-2026-04-27-<HHMMSS>.md` (completion or batched)

## Done when
All 6 fixture files exist with correct line counts, 20 PNG present, completion msg emitted with honesty caveat if PNG placeholders used.
