---
sprint: S
iter: 3
date: 2026-04-26
orchestrator: Claude main session (Opus 4.7 1M)
mode: ralph loop max-iterations 100, completion-promise SPRINT_S_COMPLETE, caveman ON
agents: planner-opus + architect-opus + generator-app-opus + generator-test-opus + scribe-opus
master_pdr: docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md
handoff: docs/handoff/2026-04-26-sprint-s-iter-3-handoff.md
---

# Sprint S iter 3 Contract — 5-Agent OPUS Pattern S

## State entry (verificato iter 2 close)

- Branch: `feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26` (6 commit ahead main)
- Test baseline (`automa/baseline-tests.txt`): **12290**
- Vitest iter 2: **12532 PASS + 8 todo** (+34 vs baseline, ZERO regressioni)
- Build iter 2: PASS exit 0 (13m54s)
- UNLIM v3 prompt DEPLOYED prod elab-unlim Edge Function (commit a22b24d)
- R0 baseline LIVE Render: **75.81% WARN** (target 85% PASS, 90% R5 gate)
  - `plurale_ragazzi` 0/10 FAIL
  - `citation_vol_pag` 0/10 FAIL
  - `max_words` 3/10 FAIL
- Wiki concepts: 59/100 (Mac Mini batch v2 H24 PID 23944)
- Pod RunPod 5ren6xbrprhkl5 RTX A6000 48GB EXITED (cost discipline)
- Score iter 2 close: 2.5/10

## Iter 3 priorities

### P0 (block iter 3 close)
- **A1 R0 re-run baseline post-deploy**: misura delta vs 75.81% WARN. Endpoint = elab-unlim Edge Function `unlim-chat` (NON Render legacy). Stesso fixture 10 prompts. Target ≥85% PASS.
- **A2 Mac Mini wiki continue**: Mac Mini PID 23944 H24 already running. Verifica heartbeat + count delta.

### P1 (substantial progress)
- **B1 Together AI fallback wire-up gated**: `supabase/functions/_shared/llm-client.ts` aggiungi `canUseTogether(context)` + log audit `together_audit_log`. Block student runtime SEMPRE.
- **B2 Apply Supabase migrations pending**: `openclaw_tool_memory` + `together_audit_log` table create.
- **B3 Wiki retriever offline integration test**: 1 test E2E `tests/integration/wiki-retriever.test.js` carica corpus locale + retrieve concept.

### P2 (foundation iter 4+)
- **C1 ADR-010 Together AI fallback design**: architect-opus produce ~400 righe.
- **C2 ADR-011 R5 stress fixture extension**: architect-opus design 50 prompts fixture (R0 → R5 stress).
- **C3 Audit + handoff iter 3→4**: scribe-opus.

## File ownership rigid (Pattern S)

| Agent | Owns (write) | Reads (only) |
|-------|--------------|--------------|
| **planner-opus** | `automa/tasks/pending/ATOM-S3-*.md`, `automa/tasks/done/`, `automa/team-state/sprint-contracts/`, `automa/team-state/messages/planner-*.md` | tutto il repo |
| **architect-opus** | `docs/architectures/`, `docs/adrs/ADR-010-*.md`, `docs/adrs/ADR-011-*.md`, `docs/strategy/`, `automa/team-state/messages/architect-*.md` | `src/`, `supabase/`, `scripts/openclaw/` (no write) |
| **generator-app-opus** | `src/**`, `supabase/functions/_shared/llm-client.ts`, `supabase/migrations/*.sql`, `scripts/openclaw/**`, `automa/team-state/messages/gen-app-*.md` | `tests/`, `docs/` |
| **generator-test-opus** | `tests/**`, `scripts/openclaw/*.test.ts`, `scripts/bench/**`, `automa/team-state/messages/gen-test-*.md` | `src/`, `supabase/` (no write) |
| **scribe-opus** | `docs/audits/2026-04-26-sprint-s-iter3-audit.md`, `docs/sunti/`, `docs/handoff/2026-04-26-sprint-s-iter-3-to-iter-4.md`, `docs/unlim-wiki/`, `CLAUDE.md` (append iter 3 close section), `automa/team-state/messages/scribe-*.md` | tutto |

## CoV per agente (3x verify before claim "fatto")

```bash
cd /Users/andreamarro/VOLUME\ 3/PRODOTTO/elab-builder
# 1. test baseline preserved
npx vitest run --reporter=basic 2>&1 | tail -5
# expect: ≥12290 PASS (pre-commit baseline) and ≥12532 PASS (iter 2 baseline)

# 2. build PASS
npm run build 2>&1 | tail -5
# expect: exit 0 (warnings non-fatal OK)

# 3. baseline file delta check (if added tests)
cat automa/baseline-tests.txt
# update only via pre-commit hook auto-update
```

## Communication protocol

```
automa/team-state/messages/<from>-to-<to>-<YYYYMMDD-HHMMSS>.md
```

YAML frontmatter per ogni messaggio:
```yaml
---
from: <agent>
to: <agent>
ts: 2026-04-26T<HHMMSS>
sprint: S-iter-3
priority: P0|P1|P2
blocking: false
---
## Task / Output
[content]
## Dependencies
- waits: []
- provides: []
## Acceptance criteria
- [ ] CoV 3x PASS
- [ ] file ownership respected
```

## Stress test gate iter 4 (post iter 3 close)

Playwright + Control Chrome MCP smoke su https://www.elabtutor.school:
- HTTP 200 home + Lavagna route load
- UNLIM chat 3 prompts → response received
- Console errors == 0
- Screenshot evidence to `docs/audits/iter4-stress-prod-2026-04-26.png`

## Promise SPRINT_S_COMPLETE 10 boxes — exit gate

Output `<promise>SPRINT_S_COMPLETE</promise>` SOLO quando ALL 10/10 TRUE:

1. VPS GPU deployed + 7-component stack
2. 6000 RAG chunks Anthropic Contextual ingest
3. 100+ Wiki LLM concepts
4. UNLIM v3 wired + ≥85% R0 PASS
5. Hybrid RAG live (BM25+BGE-M3+RRF k=60+rerank)
6. Vision flow live
7. TTS+STT IT working
8. R5 stress 50 prompts ≥90%
9. ClawBot 80-tool dispatcher live
10. Together AI fallback gated wire-up + audit log

Iter 2 close: 2.5/10. Iter 3 target close: 3.5+/10 (R0 R0_re-run + Together fallback + migrations).

## Hard rules

- NO push main (sempre PR)
- NO merge senza Andrea OK esplicito
- NO `--no-verify`
- NO `git add -A` senza diff prior
- Caveman mode ON ogni agente
- Each agent MUST invoke superpowers:using-superpowers FIRST
- TDD red-green per gen-app
- Baseline preserved → REVERT immediato se test scendono
