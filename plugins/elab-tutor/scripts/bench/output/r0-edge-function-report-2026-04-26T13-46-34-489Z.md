# Sprint S iter 3 — R0 Edge Function Baseline 2026-04-26T13-46-34-489Z

> Post-deploy R0 re-run on elab-unlim Edge Function (UNLIM v3 BASE_PROMPT live).
> Comparison: iter 2 Render baseline 75.81% WARN.

## Setup

- **Endpoint**: `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat`
- **Provider**: Supabase Edge Function (Deno)
- **Auth**: apikey + Authorization Bearer SUPABASE_ANON_KEY + X-Elab-Api-Key
- **Fixture**: scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl (10 prompts)
- **Session ID**: s_r0_edge_2026-04-26T13-46-34-489Z_qpv0lvm1
- **Generator**: scripts/bench/run-sprint-r0-edge-function.mjs
- **Scorer**: scripts/bench/score-unlim-quality.mjs (positional arg, 12 PZ rules)

## Latency

- Avg: 4831ms
- Successful: 10/10
- Failures: 0

## Per-prompt

| ID | Scenario | Latency | Words | Status |
|----|----------|---------|-------|--------|
| r0-001 | introduce-concept | 6217ms | 52 | OK |
| r0-002 | debug-circuit | 4957ms | 39 | OK |
| r0-003 | verify-comprehension | 4973ms | 36 | OK |
| r0-004 | capitolo-intro | 4577ms | 49 | OK |
| r0-005 | off-topic | 4481ms | 7 | OK |
| r0-006 | deep-question | 5083ms | 32 | OK |
| r0-007 | safety-warning | 4647ms | 37 | OK |
| r0-008 | action-request | 4308ms | 17 | OK |
| r0-009 | narrative-transition | 4386ms | 33 | OK |
| r0-010 | book-citation-request | 4676ms | 49 | OK |

## Avg word count vs PZ target

- Avg words: 35 (PZ target ≤60)
- Compliance: PASS

## Per-rule pass/fail breakdown (parsed scorer output)

| Rule | PASS | FAIL |
|------|------|------|
| citation_vol_pag | 2 | 4 |
| plurale_ragazzi | 9 | 1 |
| analogia | 3 | 1 |
| off_topic_recognition | 9 | 1 |
| humble_admission | 9 | 1 |
| no_imperativo_docente | 10 | 0 |
| max_words | 10 | 0 |
| no_verbatim_3plus_frasi | 10 | 0 |
| linguaggio_bambino | 10 | 0 |
| action_tags_when_expected | 10 | 0 |
| synthesis_not_verbatim | 10 | 0 |
| no_chatbot_preamble | 10 | 0 |

## Delta vs iter 2 baseline (Render 75.81%)

- **iter 2 baseline (Render)**: 75.81%
- **iter 3 measure (Edge Function)**: 91.80%
- **Delta**: +15.99 pp
- **Sign**: IMPROVEMENT

## Principio Zero scorer raw output

```
# Sprint R0 UNLIM Quality Score Report

Overall: 91.8% (79.3/86.4)
Verdict: **PASS** (target >=85%)

## Per-fixture results

### r0-001 — introduce-concept — 100%
  - plurale_ragazzi: PASS (weight 1)
  - no_imperativo_docente: PASS (weight 1)
  - max_words: PASS (weight 0.7)
  - citation_vol_pag: PASS (weight 1)
  - analogia: PASS (weight 0.6)
  - no_verbatim_3plus_frasi: PASS (weight 0.7)
  - linguaggio_bambino: PASS (weight 0.5)
  - action_tags_when_expected: PASS (weight 0.8)
  - synthesis_not_verbatim: PASS (weight 1)
  - off_topic_recognition: PASS (weight 1)
  - humble_admission: PASS (weight 0.5)
  - no_chatbot_preamble: PASS (weight 0.6)

### r0-002 — debug-circuit — 100%
  - plurale_ragazzi: PASS (weight 1)
  - no_imperativo_docente: PASS (weight 1)
  - max_words: PASS (weight 0.7)
  - no_verbatim_3plus_frasi: PASS (weight 0.7)
  - linguaggio_bambino: PASS (weight 0.5)
  - action_tags_when_expected: PASS (weight 0.8)
  - synthesis_not_verbatim: PASS (weight 1)
  - off_topic_recognition: PASS (weight 1)
  - humble_admission: PASS (weight 0.5)
  - no_chatbot_preamble: PASS (weight 0.6)

### r0-003 — verify-comprehension — 89%
  - plurale_ragazzi: PASS (weight 1)
  - no_imperativo_docente: PASS (weight 1)
  - max_words: PASS (weight 0.7)
  - citation_vol_pag: **FAIL [MEDIUM]** (weight 1)
  - analogia: PASS (weight 0.6)
  - no_verbatim_3plus_frasi: PASS (weight 0.7)
  - linguaggio_bambino: PASS (weight 0.5)
  - action_tags_when_expected: PASS (weight 0.8)
  - synthesis_not_verbatim: PASS (weight 1)
  - off_topic_recognition: PASS (weight 1)
  - humble_admission: PASS (weight 0.5)
  - no_chatbot_preamble: PASS (weight 0.6)

### r0-004 — capitolo-intro — 89%
  - plurale_ragazzi: PASS (weight 1)
  - no_imperativo_docente: PASS (weight 1)
  - max_words: PASS (weight 0.7)
  - citation_vol_pag: **FAIL [MEDIUM]** (weight 1)
  - analogia: PASS (weight 0.6)
  - no_verbatim_3plus_frasi: PASS (weight 0.7)
  - linguaggio_bambino: PASS (weight 0.5)
  - action_tags_when_expected: PASS (weight 0.8)
  - synthesis_not_verbatim: PASS (weight 1)
  - off_topic_recognition: PASS (weight 1)
  - humble_admission: PASS (weight 0.5)
  - no_chatbot_preamble: PASS (weight 0.6)

### r0-005 — off-topic — 68%
  - plurale_ragazzi: **FAIL [HIGH]** (weight 1)
  - no_imperativo_docente: PASS (weight 1)
  - max_words: PASS (weight 0.7)
  - no_verbatim_3plus_frasi: PASS (weight 0.7)
  - linguaggio_bambino: PASS (weight 0.5)
  - action_tags_when_expected: PASS (weight 0.8)
  - synthesis_not_verbatim: PASS (weight 1)
  - off_topic_recognition: **FAIL [HIGH]** (weight 1)
  - humble_admission: **FAIL [MEDIUM]** (weight 0.5)
  - no_chatbot_preamble: PASS (weight 0.6)

### r0-006 — deep-question — 83%
  - plurale_ragazzi: PASS (weight 1)
  - no_imperativo_docente: PASS (weight 1)
  - max_words: PASS (weight 0.7)
  - citation_vol_pag: **FAIL [MEDIUM]** (weight 1)
  - analogia: **FAIL [MEDIUM]** (weight 0.6)
  - no_verbatim_3plus_frasi: PASS (weight 0.7)
  - linguaggio_bambino: PASS (weight 0.5)
  - action_tags_when_expected: PASS (weight 0.8)
  - synthesis_not_verbatim: PASS (weight 1)
  - off_topic_recognition: PASS (weight 1)
  - humble_admission: PASS (weight 0.5)
  - no_chatbot_preamble: PASS (weight 0.6)

### r0-007 — safety-warning — 89%
  - plurale_ragazzi: PASS (weight 1)
  - no_imperativo_docente: PASS (weight 1)
  - max_words: PASS (weight 0.7)
  - citation_vol_pag: **FAIL [MEDIUM]** (weight 1)
  - no_verbatim_3plus_frasi: PASS (weight 0.7)
  - linguaggio_bambino: PASS (weight 0.5)
  - action_tags_when_expected: PASS (weight 0.8)
  - synthesis_not_verbatim: PASS (weight 1)
  - off_topic_recognition: PASS (weight 1)
  - humble_admission: PASS (weight 0.5)
  - no_chatbot_preamble: PASS (weight 0.6)

### r0-008 — action-request — 100%
  - plurale_ragazzi: PASS (weight 1)
  - no_imperativo_docente: PASS (weight 1)
  - max_words: PASS (weight 0.7)
  - no_verbatim_3plus_frasi: PASS (weight 0.7)
  - linguaggio_bambino: PASS (weight 0.5)
  - action_tags_when_expected: PASS (weight 0.8)
  - synthesis_not_verbatim: PASS (weight 1)
  - off_topic_recognition: PASS (weight 1)
  - humble_admission: PASS (weight 0.5)
  - no_chatbot_preamble: PASS (weight 0.6)

### r0-009 — narrative-transition — 100%
  - plurale_ragazzi: PASS (weight 1)
  - no_imperativo_docente: PASS (weight 1)
  - max_words: PASS (weight 0.7)
  - no_verbatim_3plus_frasi: PASS (weight 0.7)
  - linguaggio_bambino: PASS (weight 0.5)
  - action_tags_when_expected: PASS (weight 0.8)
  - synthesis_not_verbatim: PASS (weight 1)
  - off_topic_recognition: PASS (weight 1)
  - humble_admission: PASS (weight 0.5)
  - no_chatbot_preamble: PASS (weight 0.6)

### r0-010 — book-citation-request — 100%
  - plurale_ragazzi: PASS (weight 1)
  - no_imperativo_docente: PASS (weight 1)
  - max_words: PASS (weight 0.7)
  - citation_vol_pag: PASS (weight 1)
  - no_verbatim_3plus_frasi: PASS (weight 0.7)
  - linguaggio_bambino: PASS (weight 0.5)
  - action_tags_when_expected: PASS (weight 0.8)
  - synthesis_not_verbatim: PASS (weight 1)
  - off_topic_recognition: PASS (weight 1)
  - humble_admission: PASS (weight 0.5)
  - no_chatbot_preamble: PASS (weight 0.6)
```

## Verdict

- **Score verdict**: PASS
- **Avg latency**: GOOD
- **Failures threshold**: 0/5

## Files

- Raw responses: scripts/bench/output/r0-edge-function-responses-2026-04-26T13-46-34-489Z.jsonl
- Scorer JSON: scripts/bench/output/r0-edge-function-scores-2026-04-26T13-46-34-489Z.json
- This report: scripts/bench/output/r0-edge-function-report-2026-04-26T13-46-34-489Z.md

## Honesty disclosure

- Numbers RAW from production Edge Function. NO inflation.
- Sprint S iter 1 caveat #2 (scorer args) addressed: positional arg per scorer line 214.
- Re-run for CoV: `SUPABASE_ANON_KEY=<key> node scripts/bench/run-sprint-r0-edge-function.mjs`
