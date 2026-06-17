---
sprint: S
iter: 8
date: 2026-04-27
orchestrator: Claude main session (Opus 4.7 1M)
mode: PHASE-PHASE multi-agent OPUS spawn, completion-promise SPRINT_S_COMPLETE 6/7 bench GREEN, caveman ON
agents: planner-opus + architect-opus + generator-app-opus + generator-test-opus + scribe-opus
master_docs:
  - docs/pdr/PDR-SPRINT-S-ITER-7-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md
  - docs/bench/BENCHMARK-SUITE-ITER-8-2026-04-27.md
  - docs/audits/2026-04-27-sprint-s-iter7-RAG-ingest-FINAL-audit.md
handoff_target: docs/handoff/2026-04-27-sprint-s-iter-8-to-iter-9-handoff.md (NEW iter 8 close, scribe-opus Phase 2)
---

# Sprint S iter 8 Contract — 5-Agent OPUS PHASE-PHASE (Pattern S validated iter 6+7)

## Iter goal (caveman)

Hybrid RAG live + TTS Isabella WS prod + Vision E2E executed + ClawBot composite live + 7-suite bench (~15K parametri) GREEN 6/7. Score 8.2 → 8.7+/10 ONESTO.

## State entry (verified iter 7 close)

- Branch: `feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26` (158 file uncommitted iter 3-7, Andrea decide commit strategy)
- Test baseline: **12599 PASS** (iter 6 P1 12597 +2 iter 7 wiki, baseline file `automa/baseline-tests.txt`)
- Build: PASS exit 0 (last verified iter 6 P1 ~14min, defer iter 8 entrance)
- Edge Function `unlim-chat`: DEPLOYED prod (callLLMWithFallback chain LIVE iter 5 P3)
- R5 stress: 91.80% PASS Edge Function (HARD GATE ≥90% MET)
- R0 baseline: 91.80% PASS (iter 5 P3)
- Wiki: 100/100 ✅
- RAG ingest iter 7: **1881 chunks** (Voyage 1024-dim + Llama 3.3 70B contextualization + Supabase pgvector) — Box 3 = 0.7
- Migrations 4/4 SYNC
- Score iter 7 close: **8.2/10 ONESTO**

## 12 ATOM list — owner + status

| ATOM | Priority | Owner | Phase | Deps | Status |
|------|----------|-------|-------|------|--------|
| ATOM-S8-A1 | P0 | architect-opus | 1 | — | PENDING |
| ATOM-S8-A2 | P0 | gen-app-opus | 1 | A1 | PENDING |
| ATOM-S8-A3 | P0 | architect-opus | 1 | — | PENDING |
| ATOM-S8-A4 | P0 | gen-app-opus | 1 | A3 | PENDING |
| ATOM-S8-A5 | P0 | gen-test-opus | 1 | — | PENDING |
| ATOM-S8-A6 | P0 | gen-app-opus | 1 | — | PENDING |
| ATOM-S8-A7 | P0 | gen-test-opus | 1 | — | PENDING |
| ATOM-S8-A8 | P0 | gen-test-opus | 1 | — | PENDING |
| ATOM-S8-A9 | P0 | gen-app-opus | 1 | — | PENDING |
| ATOM-S8-A10 | P0 | gen-app-opus | 1 | A9 | PENDING |
| ATOM-S8-A11 | P0 | gen-test-opus | 1 | A6 | PENDING |
| ATOM-S8-A12 | P0 | scribe-opus | 2 | A1-A11 | PENDING |

## Pattern S PHASE-PHASE protocol

```
PHASE 1 (parallel 4 agents):
  - architect-opus    → A1 (ADR-015) + A3 (ADR-016)
  - gen-app-opus      → A2 (rag.ts impl) + A4 (edge-tts WS) + A6 (composite live) + A9 (5 scorers) + A10 (orchestrator runner)
  - gen-test-opus     → A5 (Vision E2E execute) + A7 (R6 100 fixture) + A8 (6 fixtures + 20 PNG) + A11 (composite tests +5)
  - planner-opus      → THIS contract + 12 ATOM + 4 dispatch + 1 completion (DONE this turn)

PHASE 2 (sequential AFTER 4/4 Phase 1 completion msgs):
  - scribe-opus       → A12 (audit + handoff + CLAUDE.md + iter-8-results)

PHASE 3 (orchestrator):
  - CoV finale + /quality-audit + score 10 boxes + commit + push branch
  - 7-suite bench execute via `node scripts/bench/iter-8-bench-runner.mjs`
  - Stress test prod Playwright + Control Chrome MCP iter 8 entrance gate confirmation
```

## Communication protocol — filesystem barrier

```
automa/team-state/messages/<from>-iter8-to-<to>-2026-04-27-<HHMMSS>.md
```

YAML frontmatter mandatory:
```yaml
---
from: <agent>
to: <agent>
ts: 2026-04-27T<HHMMSS>
sprint: S-iter-8
phase: 1|2|3
priority: P0
blocking: false
---
```

Phase 1 emits 4 completion messages: `architect-opus-iter8-to-orchestrator-*.md`, `gen-app-opus-iter8-to-orchestrator-*.md`, `gen-test-opus-iter8-to-orchestrator-*.md`, plus this `planner-opus-iter8-to-orchestrator-*.md`.

Orchestrator scans 4/4 completion msgs → dispatches scribe-opus Phase 2 (race-cond fix iter 3 lesson).

## File ownership rigid (Pattern S)

| Agent | Owns (write) | Reads (only) |
|-------|--------------|--------------|
| **planner-opus** | `automa/tasks/pending/ATOM-S8-*.md`, `automa/tasks/done/`, `automa/team-state/sprint-contracts/`, `automa/team-state/messages/planner-*.md` | tutto repo |
| **architect-opus** | `docs/architectures/`, `docs/adrs/ADR-015-*.md`, `docs/adrs/ADR-016-*.md`, `docs/strategy/`, `automa/team-state/messages/architect-*.md` | `src/`, `supabase/`, `scripts/openclaw/` (no write) |
| **generator-app-opus** | `src/**`, `supabase/functions/_shared/*.ts`, `supabase/functions/unlim-tts/**`, `supabase/migrations/*.sql`, `scripts/openclaw/**` (TS impl), `scripts/bench/score-*.mjs`, `scripts/bench/iter-8-bench-runner.mjs`, `scripts/bench/run-*.mjs`, `automa/team-state/messages/gen-app-*.md` | `tests/`, `docs/` |
| **generator-test-opus** | `tests/**`, `tests/fixtures/circuits/*.png`, `scripts/openclaw/*.test.ts`, `scripts/bench/*.jsonl` (fixtures), `scripts/bench/output/`, `automa/team-state/messages/gen-test-*.md` | `src/`, `supabase/` (no write) |
| **scribe-opus** | `docs/audits/2026-04-27-sprint-s-iter8-*.md`, `docs/sunti/`, `docs/handoff/2026-04-27-sprint-s-iter-8-to-iter-9-handoff.md`, `docs/bench/iter-8-results-*.md`, `docs/unlim-wiki/`, `CLAUDE.md` (append iter 8 close), `automa/team-state/messages/scribe-*.md` | tutto |

## CoV per agente (3x verify before claim "fatto") — MANDATORY

```bash
cd /Users/andreamarro/VOLUME\ 3/PRODOTTO/elab-builder
# 1. test baseline preserved (≥12599 PASS)
npx vitest run --reporter=basic 2>&1 | tail -5

# 2. build PASS (exit 0, defer if heavy)
npm run build 2>&1 | tail -5

# 3. baseline file delta check
cat automa/baseline-tests.txt
```

NO claim done if any of 3 CoV fail. Investigate before retry.

## Pass criteria iter 8 close — 7-suite benchmark thresholds

| Suite | Threshold | Box link |
|-------|-----------|----------|
| B1 R6 stress 100 prompts | ≥87% global + 10/10 cat ≥85% | Box 5 + Box 9 |
| B2 Hybrid RAG 30 query | recall@5 ≥0.85 + p95 <500ms | Box 3 + Box 6 |
| B3 Vision E2E 20 screenshots | latency p95 <8s + topology ≥80% + diagnosis ≥75% | Box 7 |
| B4 TTS Isabella 50 sample | latency p50 <2s + p95 <5s + MOS ≥4.0 | Box 8 |
| B5 ClawBot composite 25 calls | success ≥90% + sub-tool p95 <3s | Box 10 |
| B6 Cost 50 sessions | <€0.012/session avg | Box 2 |
| B7 Fallback chain 200 calls | gate accuracy 100% + transit p95 <500ms | Box 2 |

## Score gates ONESTO

| Bench pass count | Score iter 8 close |
|------------------|---------------------|
| 7/7 GREEN | 9.2/10 (best case) |
| **6/7 GREEN** | **8.7/10 (target ONESTO)** |
| 5/7 GREEN | 8.2/10 (acceptable) |
| ≤4/7 GREEN | 7.5/10 (stuck, defer iter 9 RCA) |

**Iter 8 target ONESTO**: 6/7 GREEN = **8.7/10**.

## Hard rules

- NO inflation, NO claim files exist if not written
- NO write outside file ownership boundaries
- NO push main, NO merge
- NO --no-verify, NO --no-gpg-sign
- PRINCIPIO ZERO: docente=tramite, UNLIM=strumento, plurale "Ragazzi,", citazioni Vol/pag, ≤60 parole, mai imperativo docente
- MORFISMO DUAL SENSE (chiarito Andrea 2026-04-27 12:50 mid-iter-8):
  - **Sense 1 — Tecnico-architetturale**: piattaforma MORFICA + MUTAFORMA. Software adatta runtime per-classe/per-docente/per-kit/per-momento. Codice morfico OpenClaw "Onnipotenza Morfica v4" — L1 composition (composite handler sequential dispatch) + L2 template (pre-defined morphic patterns) + L3 flag DEV (dynamic JS Web Worker sandbox). 52 ToolSpec declarative + composite handler. Differenziatore vs static-config Tinkercad/Wokwi/LabsLand
  - **Sense 2 — Strategico-competitivo**: coerenza software ↔ kit Omaric ↔ volumi cartacei. Moat 2026+ vs LLM coding democratizzato. Triplet artefatti fisici originali non replicabili via prompt LLM
  - **Combinato — DUAL MOAT**: software morfico INTERNO (adatta runtime, S1) + coerente ESTERNO (triplet immutabile, S2). Doppia barriera entry tecnica + materiale. LLM disruption-proof. Nessun competitor puro-software può replicare entrambi senza kit fisico + volumi originali Omaric
  - **Reject ogni feature che viola entrambi sensi**. Test pre-merge: feature contribuisce S1 (morfico runtime adattivo)? S2 (triplet coerenza)? Se NO → REJECT
- Caveman ON
- 3x CoV before claim done

## Open blockers iter 8

1. **Andrea action commit strategy** — 158 file uncommitted iter 3-7, Andrea decide squash/PR cascade
2. **Andrea deploy `unlim-tts`** — Edge Function Isabella WS post ATOM-S8-A4 ship (5 min `npx supabase functions deploy unlim-tts`)
3. **B6 cost benchmark** — pricing pubblico stima, Andrea verify billing iter 9 vs B6 prediction
4. **B4 MOS subjective** — LLM-as-judge stub iter 8 entrance, manual rate Andrea iter 8 close
5. **Vision fixture screenshots** — placeholder PNG OK iter 8, real screenshots iter 9 from simulator
6. **RAG ingest delta** — 25 transient Voyage 429 errors recoverable, Andrea decide re-run iter 8/9
7. **Pod RunPod** — TERMINATED Path A iter 5 P3, B7 fallback transit measured con stub mock

## Iter 9 priorities preview (post iter 8 close)

- 7/7 GREEN → SPRINT_S_COMPLETE 10/10 box projection iter 9-10
- B2 Hybrid RAG gold-set expand 30 → 100 query
- B3 Vision real screenshots (replace placeholder)
- B4 MOS manual rating (Andrea + 1 esterno × 5 sample)
- Vision real production trace + Andrea field test
- ClawBot 80-tool full dispatcher iter 9-10
- Mac Mini autonomous overnight wiki delta + RAG ingest re-run delta 25 errors

## Activation prompt next session

See `docs/handoff/2026-04-27-sprint-s-iter-8-to-iter-9-handoff.md` §1 ACTIVATION STRING (scribe-opus Phase 2 emits).
