---
sprint: S
iter: 6
date: 2026-04-26
orchestrator: Claude main session (Opus 4.7 1M)
mode: ralph loop max-iterations 100, completion-promise SPRINT_S_COMPLETE, caveman ON
agents: planner-opus + architect-opus + generator-app-opus + generator-test-opus + scribe-opus
master_docs:
  - SETUP-NEXT-SESSION/ARCHITETTURA-FINALE-SESSIONE-2026-04-26.md
  - docs/specs/SPEC-SPRINT-S-ITER-4-SMART-ONOFF-MULTIMODAL-2026-04-26.md
  - docs/audits/2026-04-26-sprint-s-iter5-PHASE1-FINAL-audit.md
handoff: docs/handoff/2026-04-26-sprint-s-iter-6-to-iter-7-handoff.md (NEW iter 6 close)
---

# Sprint S iter 6 Contract — 5-Agent OPUS Pattern S (PHASE-PHASE race-cond fix)

## State entry (verificato iter 5 close)

- Branch: `feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26` (6 commit ahead main + 112 file uncommitted iter 3+4+5)
- Test baseline (`automa/baseline-tests.txt`): **12574 PASS** + 7 skip + 8 todo
- Build iter 5: PASS exit 0 (~14min)
- Edge Function `unlim-chat` DEPLOYED prod (14 file: index + together-fallback + capitoli-loader + PZ validator + system-prompt + llm-client + gemini + router + rag + memory + types + guards + capitoli.json + KB.json)
- R5 stress LIVE: **91.80% PASS** Edge Function 12-rule scorer ufficiale (HARD GATE ≥90% MET, 6/6 categories)
- Wiki: **100/100** ✅ (target MET, +41 concepts iter 3-5)
- Migrations: **4/4 applied** (001 + 20260420070003 reverted + 20260426152944 + 20260426152945)
- Pod RunPod 5ren6xbrprhkl5: **TERMINATED** (Andrea Path A confirmed, $13/mo recovery)
- Mac Mini SSH: ATTIVO `progettibelli@100.124.198.59` via id_ed25519_elab
- RAG ingest: BACKGROUND PID 89015 (BGE-M3 local + Together contextualization → Supabase pgvector)
- Score iter 5 close: **6.55-6.70/10 ONESTO**

## Iter 6 priorities

### P0 (block iter 6 close)

- **A1 architect-opus**: ADR-012 Vision E2E Playwright design (Gemini Vision EU, ~400 righe)
- **A2 architect-opus**: ADR-013 ClawBot composite handler L1 morphic design (~400 righe)
- **A3 gen-app-opus**: edge-tts Isabella Neural wire-up Edge Function `unlim-tts` (no GPU, Microsoft endpoint Deno HTTP)
- **A4 gen-app-opus**: multimodalRouter routeTTS real impl (replace stub)
- **A5 gen-test-opus**: Playwright Vision E2E spec `tests/e2e/02-vision-flow.spec.js` (5+ test cases)
- **A6 gen-test-opus**: ClawBot composite handler tests (8 cases unit)

### P1 (substantial)

- **B1 gen-app-opus**: ClawBot composite handler real exec L1 morphic (`scripts/openclaw/composite-handler.ts` NEW) — depends A2 + A6
- **B2 gen-test-opus**: TTS edge-tts Isabella unit tests (15 cases voice/rate/pitch) — depends A3
- **B3 gen-app-opus**: Hybrid RAG retriever wire-up (BM25 + dense pgvector + RRF k=60) — post-RAG-ingest verify

### P2 (foundation iter 7+)

- **C1 architect-opus**: ADR-014 R6 stress fixture extension (50 → 100 prompts post-RAG)
- **C2 scribe-opus PHASE 2**: audit + handoff + CLAUDE.md append iter 6 close
- **C3 orchestrator PHASE 3**: stress test prod Playwright + Control Chrome MCP iter 8 entrance gate

## File ownership rigid (Pattern S)

| Agent | Owns (write) | Reads (only) |
|-------|--------------|--------------|
| **planner-opus** | `automa/tasks/pending/ATOM-S6-*.md`, `automa/tasks/done/`, `automa/team-state/sprint-contracts/`, `automa/team-state/messages/planner-*.md` | tutto repo |
| **architect-opus** | `docs/architectures/`, `docs/adrs/ADR-012-*.md`, `docs/adrs/ADR-013-*.md`, `docs/adrs/ADR-014-*.md`, `docs/strategy/`, `automa/team-state/messages/architect-*.md` | `src/`, `supabase/`, `scripts/openclaw/` (no write) |
| **generator-app-opus** | `src/**`, `supabase/functions/_shared/*.ts`, `supabase/functions/unlim-tts/**`, `supabase/migrations/*.sql`, `scripts/openclaw/**` (TS impl), `automa/team-state/messages/gen-app-*.md` | `tests/`, `docs/` |
| **generator-test-opus** | `tests/**`, `scripts/openclaw/*.test.ts`, `scripts/bench/**`, `automa/team-state/messages/gen-test-*.md` | `src/`, `supabase/` (no write) |
| **scribe-opus** | `docs/audits/2026-04-26-sprint-s-iter6-*.md`, `docs/sunti/`, `docs/handoff/2026-04-26-sprint-s-iter-6-to-iter-7-handoff.md`, `docs/unlim-wiki/`, `CLAUDE.md` (append iter 6 close section), `automa/team-state/messages/scribe-*.md` | tutto |

## CoV per agente (3x verify before claim "fatto")

```bash
cd /Users/andreamarro/VOLUME\ 3/PRODOTTO/elab-builder
# 1. test baseline preserved
npx vitest run --reporter=basic 2>&1 | tail -5
# expect: ≥12574 PASS (iter 5 baseline)

# 2. build PASS
npm run build 2>&1 | tail -5
# expect: exit 0 (warnings non-fatal OK)

# 3. baseline file delta check
cat automa/baseline-tests.txt
# update only via pre-commit hook auto-update
```

## Communication protocol — PHASE-PHASE Pattern S race-cond fix

```
PHASE 1 (parallel): planner-opus + architect-opus + generator-app-opus + generator-test-opus
PHASE 2 (sequential AFTER Phase 1 completion messages): scribe-opus
PHASE 3 (orchestrator): CoV finale + /quality-audit + score 10 boxes
```

Filesystem barrier per scribe-opus dispatch:
- Phase 1 emits `automa/team-state/messages/<agent>-iter6-to-orchestrator-2026-04-26-*.md`
- Orchestrator scans for ALL 4 Phase 1 completion messages
- Scribe dispatched ONLY when 4/4 confirmed (avoid race-cond stale state iter 3 lesson)

YAML frontmatter per ogni messaggio:
```yaml
---
from: <agent>
to: <agent>
ts: 2026-04-26T<HHMMSS>
sprint: S-iter-6
priority: P0|P1|P2
phase: 1|2|3
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

## Promise SPRINT_S_COMPLETE 10 boxes — exit gate iter 5 status

Output `<promise>SPRINT_S_COMPLETE</promise>` SOLO quando ALL 10/10 TRUE:

| # | Box | Iter 5 close | Iter 6 target lift |
|---|-----|--------------|---------------------|
| 1 | VPS GPU deployed + 7-component stack | 0.4 (storage paid no use, TERMINATED) | 0.0 (drop pod, recovery) |
| 2 | 7-component stack (5/7) | 0.4 | 0.4 (no GPU runtime) |
| 3 | 6000 RAG chunks Anthropic Contextual ingest | 0.0 | 0.5+ (RAG ingest BG PID 89015) |
| 4 | 100+ Wiki LLM concepts | **1.0** ✅ | 1.0 |
| 5 | UNLIM v3 wired + ≥85% R0 PASS | **1.0** ✅ | 1.0 |
| 6 | Hybrid RAG live (BM25+BGE-M3+RRF) | 0.0 | 0.5 (B3 wire-up) |
| 7 | Vision flow live | 0.0 | 0.7 (A1 + A5 design+spec) |
| 8 | TTS+STT IT working | 0.5 | 0.8 (A3 + A4 + B2 wire-up) |
| 9 | R5 stress 50 prompts ≥90% | **1.0** ✅ | 1.0 |
| 10 | ClawBot 80-tool dispatcher live | 0.3 | 0.6 (A2 + A6 + B1 composite) |

Iter 5 close: **6.55-6.70/10 ONESTO**.
Iter 6 target close: **7.5+/10**.

## Stress test gate iter 8 (post iter 6 close — C3 orchestrator phase 3)

Playwright + Control Chrome MCP smoke su https://www.elabtutor.school:
- HTTP 200 home + /lavagna route
- UNLIM chat 3 prompts → response received
- Vision flow E2E (LED+resistor → diagnose) PASS
- TTS playback (Isabella → MP3 valid)
- Console errors == 0
- Screenshot evidence to `docs/audits/iter8-stress-prod-2026-04-26.png`

## Hard rules

- NO push main (sempre PR)
- NO merge senza Andrea OK esplicito
- NO `--no-verify`
- NO `git add -A` senza diff prior
- Caveman mode ON ogni agente
- Each agent MUST invoke superpowers:using-superpowers FIRST
- TDD red-green per gen-app (tests A6+B2 BEFORE B1 impl)
- Baseline preserved → REVERT immediato se test scendono
- NO writes outside ownership

## Open blockers iter 6

1. **RAG ingest verify** PID 89015 BGE-M3 → 6000 chunks Supabase pgvector. B3 hybrid retriever depends.
2. **PR cascade merge** branch 6 commits ahead main + 112 file uncommitted iter 3+4+5. Andrea decide commit + PR strategy.
3. **GPU dependent boxes** (2, 3, 6, 7) — RAG ingest no-GPU via Together stack OR Voyage embedding (decision iter 6).
4. **Mac Mini SSH** funziona ma autonomous orchestrator ssh-copy-id non ancora applicato (Andrea 1 min `ssh-copy-id -i ~/.ssh/id_ed25519_elab.pub progettibelli@100.124.198.59`).

## Iter 7 priorities preview (post iter 6 close)

- Voyage AI signup (Andrea action) → RAG ingest 6000 chunks → Box 3 = 1.0
- TTS Isabella full integration UNLIM voice playback UI
- Vision E2E full implementation (5 spec PASS)
- ClawBot composite handler real exec deployed
- Stress test iter 8 entrance gate Playwright PASS

**Iter 7 target score: 8.0+/10**.
