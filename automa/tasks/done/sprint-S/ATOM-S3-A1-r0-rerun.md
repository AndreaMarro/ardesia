---
id: ATOM-S3-A1
parent_task: A1
sprint: S
iter: 3
priority: P0
assigned_to: generator-test-opus
depends_on: []
provides:
  - scripts/bench/run-sprint-r0-edge.mjs (NEW R0 runner Edge Function endpoint)
  - scripts/bench/output/r0-edge-{report,responses,scores}-2026-04-26T*.{md,jsonl,json}
  - delta_pct_vs_iter2_baseline (75.81% WARN)
est_hours: 2.5
files_owned:
  - scripts/bench/run-sprint-r0-edge.mjs
  - scripts/bench/output/r0-edge-*.md
  - scripts/bench/output/r0-edge-*.jsonl
  - scripts/bench/output/r0-edge-*.json
acceptance_criteria:
  - Script `scripts/bench/run-sprint-r0-edge.mjs` NEW targets Edge Function `unlim-chat` (NON Render legacy)
  - Endpoint URL `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat` con auth header `apikey: $SUPABASE_ANON_KEY`
  - Riusa fixture `scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl` (10 prompts identici iter 2)
  - Riusa scorer `scripts/bench/score-unlim-quality.mjs` (12 PZ rules)
  - Output 3 file timestamped: report.md + responses.jsonl + scores.json
  - Report.md include: overall_pass_pct, delta vs 75.81% iter 2, per-rule breakdown (plurale_ragazzi, citation_vol_pag, max_words), verdetto WARN/PASS/FAIL
  - Threshold: ≥85% PASS, 70-84% WARN, <70% FAIL
  - CoV 3x `npx vitest run` ≥12532 PASS preservato (no test changes — only scripts/bench/)
  - `npm run build` PASS exit 0
references:
  - scripts/bench/run-sprint-r0-render.mjs (template iter 2, adatta endpoint)
  - scripts/bench/score-unlim-quality.mjs (riuso identico)
  - docs/audits/2026-04-26-sprint-s-iter2-audit.md (75.81% baseline)
---

## Task

R0 re-run baseline post-deploy v3. Misura delta atteso lift dramatic plurale_ragazzi (0/10→7+/10 atteso).

## Implementation outline

1. Copy `scripts/bench/run-sprint-r0-render.mjs` → `run-sprint-r0-edge.mjs`
2. Update endpoint: `process.env.UNLIM_EDGE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat'`
3. Update auth: header `apikey: process.env.SUPABASE_ANON_KEY` + `Authorization: Bearer $SUPABASE_ANON_KEY`
4. Payload schema match Edge Function: `{ messages, studentContext, circuitState, experimentContext }`
5. Run with same 10 fixture prompts, parallel limit 3
6. Score via `score-unlim-quality.mjs`
7. Generate report.md con delta breakdown

## CoV before claim done

- 3x `npx vitest run` baseline ≥12532 PASS preserved
- `npm run build` PASS exit 0
- Script execution succeed E2E (fixture loaded, responses scored, report generated)
- Report.md committed to scripts/bench/output/
