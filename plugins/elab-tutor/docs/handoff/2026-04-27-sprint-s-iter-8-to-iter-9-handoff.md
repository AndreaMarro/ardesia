---
date: 2026-04-27
sprint: S-iter-8 → S-iter-9
phase: handoff
score_iter_8_PHASE_1_close: 8.5/10 ONESTO
score_iter_9_target: 9.0+/10 ONESTO
caveman: ON
principio_zero: compliance verified
morfismo: compliance verified
---

# Sprint S iter 8 → iter 9 handoff (2026-04-27)

## §1 ACTIVATION STRING iter 9 (paste-ready)

```
Sei l'orchestratore Sprint S iter 9 ELAB. Continua da iter 8 PHASE 1 close 8.5/10 ONESTO.

Working dir: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"

Pattern: Pattern S 5-agent OPUS PHASE-PHASE r3 retry (iter 8 r2 lesson session-resume kill mitigation: checkpoint markers periodici).

Caveman ON. Drop articles/filler. Fragments OK. Terse. Output structured markdown.

P0 entrance iter 9:
1. Read iter 8 PHASE 1 audit: docs/audits/2026-04-27-sprint-s-iter8-PHASE1-FINAL-audit.md
2. Read iter 8 → iter 9 handoff: docs/handoff/2026-04-27-sprint-s-iter-8-to-iter-9-handoff.md
3. Read CLAUDE.md frontmatter Sprint S iter 8 close section
4. Pre-flight CoV: vitest 12599+ PASS GREEN baseline
5. Bootstrap script: keys + RAG count + Mac Mini + Edge Functions + migrations
6. Stress test smoke prod Playwright + Control Chrome MCP https://www.elabtutor.school

PHASE 1 (parallel 4 agents OPUS, iter 9 r3 retry-resilient):
- planner-opus → 12 ATOM-S9 atoms + sprint contract + 5 dispatch msgs (Vision E2E live, B2/B4/B5 bench live, Hybrid RAG retriever production rollout teacher A/B, TTS WS deploy)
- architect-opus → ADR-017 Vision E2E hardening + ADR-018 Hybrid RAG production rollout strategy
- generator-app-opus → Vision E2E execute live, hybrid RAG production wire-up unlim-chat optional path → default-on teacher (env flag)
- generator-test-opus → R6 fixture expand 100 → 200 stress + Vision E2E PNG real screenshots Playwright captureScreenshot

PHASE 2 (sequential post 4/4 completion barrier):
- scribe-opus → audit + handoff + CLAUDE.md update + iter-9-results report consume bench runner JSON

PHASE 3 (orchestrator):
- Run iter-8-bench-runner.mjs 7-suite live (Andrea env provisioned)
- Score 7/7 GREEN check vs SPRINT_S_COMPLETE 10 boxes
- Commit batch iter 9
- Push origin feat branch (Andrea decision split-by-iter vs single mega-commit)

File ownership rigid Pattern S (5 agents 5 ownership domains).
File refs: docs/pdr/PDR-SPRINT-S-ITER-7-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md, docs/audits/2026-04-27-sprint-s-iter8-PHASE1-FINAL-audit.md, docs/handoff/2026-04-27-sprint-s-iter-8-to-iter-9-handoff.md, automa/state/iter-8-progress.md.

PRINCIPIO ZERO + MORFISMO compliance MANDATORY ogni atom (plurale "Ragazzi," + Vol/pag canonical citation).

Score target iter 9 close: 9.0+/10 ONESTO (lift Box 6+7+8+10 via bench exec live).

GO.
```

## §2 Setup steps Andrea (5 min)

### Step 1 — Bootstrap script verify (1 min)

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
bash scripts/bootstrap-iter-N-context.sh 2>&1 | head -30
# Verifica: 11/11 keys ✅ + RAG 1881 chunks ✅ + Mac Mini SSH alive ✅ + 5/5 Edge Functions ✅ + 5/5 migrations sync ✅
```

### Step 2 — Andrea action: deploy Edge Function unlim-tts (2 min, post WS validation manual)

```bash
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-tts --project-ref euqpdueopmlllqjmqnyb
# Validation manual: curl POST con sample text → audio mp3 24kHz <2s p50
# Voice register Isabella Italian narratore volumi MORFISMO compliance ADR-016 §11
```

### Step 3 — Andrea action: provision PLAYWRIGHT_BASE_URL + class_key fixture Vision E2E unblock (1 min)

```bash
export PLAYWRIGHT_BASE_URL=https://www.elabtutor.school
export ELAB_API_KEY=<test_key>
export SUPABASE_ANON_KEY=<from_dashboard>
# Seed class_key Supabase: INSERT INTO classes (class_key, ...) VALUES ('TEST-CLASS-S8-ITER9', ...)
# Vision E2E spec re-run: npx playwright test tests/e2e/02-vision-flow.spec.js
```

### Step 4 — Andrea action: env vars live bench (1 min)

```bash
export SUPABASE_SERVICE_ROLE_KEY=<from_dashboard>
export VOYAGE_API_KEY=<from_voyageai.com>
# B2 Hybrid RAG live recall@5 ≥0.85 unblock
# B4 TTS WS live latency p50 <2s + MOS manual eval 5×5 sample unblock
# B5 ClawBot live composite end-to-end ≥90% success unblock
```

### Step 5 — Andrea decide: commit batch strategy

Options:
- **A) split-by-iter**: 5 commits (iter 3, iter 4, iter 5, iter 6, iter 7+8 combined) per traceability granular
- **B) single mega-commit**: 1 commit batch iter 3-8 con summary chronologic per simplicity

Andrea decisione PRE iter 9 Pattern S spawn. Recommended **B** per velocity (158+ file uncommitted, single semantic batch acceptable per ralph loop iter cadence).

## §3 Iter 9 P0 priorities

### P0 #1 — Run iter-8-bench-runner.mjs PHASE 3 if NOT executed iter 8 close

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
node scripts/bench/iter-8-bench-runner.mjs 2>&1 | tee docs/bench/iter-8-results-$(date -u +%Y-%m-%dT%H-%M-%S).log
# Target 6/7 GREEN = 8.7/10 PHASE 3 close
# Output: docs/bench/iter-8-results-{ts}.{md,json}
```

### P0 #2 — Vision E2E live measurement (env unblock Step 3)

```bash
npx playwright test tests/e2e/02-vision-flow.spec.js --reporter=html
# 5 test → 5 PASS atteso (no SKIP defensive)
# B3 thresholds: latency p95 <8s + topology ≥80% + diagnosis ≥75%
# Box 7 lift 0.3 → 0.7+ post live exec
```

### P0 #3 — Hybrid RAG B2 live recall@5 ≥0.85

```bash
node scripts/bench/run-hybrid-rag-eval.mjs --gold-set scripts/bench/hybrid-rag-gold-set.jsonl --top-k 5
# B2 thresholds: recall@5 ≥0.85, precision@1 ≥0.70, MRR ≥0.75, p95 <500ms
# Box 6 lift 0.5 → 0.85+ post live exec
# Production rollout teacher default-on, student default-off A/B (env flag RAG_HYBRID_ENABLED=true)
```

### P0 #4 — TTS WS B4 live latency p50 <2s + MOS manual eval

```bash
node scripts/bench/run-tts-isabella-bench.mjs --fixture scripts/bench/tts-isabella-fixture.jsonl
# B4 thresholds: latency p50 <2s, p95 <5s, RTF ≥1.0, MOS ≥4.0/5, success ≥98%
# Andrea manual MOS rate 5×5 sample post B4 PASS
# Box 8 lift 0.85 → 1.0 post live exec + Andrea ascolto OK
```

### P0 #5 — ClawBot B5 live composite end-to-end ≥90% success

```bash
node scripts/bench/run-clawbot-composite-bench.mjs --fixture scripts/bench/clawbot-composite-fixture.jsonl --live
# B5 thresholds: success ≥90% + sub-tool latency p95 <3s
# Real Deno integration deferred iter 8 (synthetic 95-97%), live exec iter 9
# Box 10 lift 0.8 → 1.0 post live exec
```

### P1 #1 — Mac Mini wiki Analogia enrichment (T1 iter 8 P1 deferred)

Mac Mini autonomous loop launchctl `com.elab.mac-mini-autonomous-loop` PID alive 20d. Trigger Tea brief refresh con T1 task: "Aggiungi analogie domestiche ai 100 wiki concepts esistenti (es. ohm = strozzatura tubo, condensatore = serbatoio, transistor = rubinetto)."

### P1 #2 — Andrea iter 9 Tea email send

`/Users/andreamarro/VOLUME 3/TEA/2026-04-27-onboarding-tea-iter-7-close/` 10 file + iter 8 deliverables refresh. Email batch send.

## §4 Iter 9 score target 9.0+/10 ONESTO

| Box | iter 8 PHASE 1 close | iter 9 target | Lift required |
|-----|----------------------|---------------|---------------|
| 1 VPS GPU | 0.4 | 0.4 | no change (Path A confirmed) |
| 2 7-component stack | 0.4 | 0.4 | no change |
| 3 RAG 6000 chunks | 0.7 | 0.85 | +0.15 (re-run delta 25 transient errors) |
| 4 Wiki 100/100 | 1.0 | 1.0 | no change |
| 5 UNLIM v3 R0 91.80% | 1.0 | 1.0 | no change |
| 6 Hybrid RAG live | 0.5 | **0.85** | +0.35 B2 bench live exec |
| 7 Vision flow | 0.3 | **0.7** | +0.4 Vision E2E live exec |
| 8 TTS+STT | 0.85 | **1.0** | +0.15 TTS deploy + B4 bench + MOS |
| 9 R5 91.80% | 1.0 | 1.0 | no change |
| 10 ClawBot composite | 0.8 | **1.0** | +0.2 B5 bench live exec |

**Box subtotal iter 9 target**: 8.05/10. **Bonus cumulative**: 2.5+. **TOTAL iter 9 target**: **9.0+/10 ONESTO**.

## §5 Files iter 8 close refs

### Audit + handoff iter 8 (this turn scribe)

```
docs/audits/2026-04-27-sprint-s-iter8-PHASE1-FINAL-audit.md (NEW ~400 LOC)
docs/handoff/2026-04-27-sprint-s-iter-8-to-iter-9-handoff.md (NEW ~250 LOC, this file)
CLAUDE.md (APPEND iter 8 close section ~80 LOC)
```

### Architect iter 8

```
docs/adrs/ADR-015-hybrid-rag-retriever-bm25-dense-rrf-rerank-2026-04-27.md (770 LOC pre-existing r1 verified intact)
docs/adrs/ADR-016-tts-isabella-websocket-deno-migration-2026-04-27.md (625 LOC NEW r2)
```

### Gen-app iter 8 (12 NEW + 5 MODIFIED)

```
NEW:
scripts/openclaw/postToVisionEndpoint.ts (169)
scripts/bench/iter-8-bench-runner.mjs (361)
scripts/bench/score-{hybrid-rag,tts-isabella,cost-per-session,fallback-chain,clawbot-composite}.mjs (1012 total)
scripts/bench/run-{hybrid-rag-eval,tts-isabella-bench,clawbot-composite-bench,cost-bench,fallback-chain-bench}.mjs (921 total)

MODIFIED:
supabase/functions/_shared/rag.ts (511 → 895)
supabase/functions/_shared/edge-tts-client.ts (162 → 361)
supabase/functions/unlim-chat/index.ts (+15)
scripts/openclaw/dispatcher.ts (+27)
scripts/openclaw/composite-handler.ts (+45)
```

### Gen-test iter 8 (8 NEW + 1 EXTENDED)

```
NEW:
scripts/bench/session-replay-fixture.jsonl (50 lines)
scripts/bench/fallback-chain-fixture.jsonl (200 lines)
tests/fixtures/circuits/{01..20}.png + {01..20}.metadata.json + README.md
tests/integration/hybrid-rag.test.js (114)
scripts/bench/output/vision-e2e-2026-04-27-143428.md (report)

EXTENDED:
scripts/openclaw/composite-handler.test.ts (224 → 481, +5 NEW tests)
```

### Planner iter 8

```
automa/tasks/pending/ATOM-S8-{A1..A12}-*.md
automa/team-state/sprint-contracts/sprint-S-iter-8-contract.md
automa/team-state/messages/planner-opus-iter8-to-{architect,generator-app,generator-test,scribe,orchestrator}-2026-04-27-121207.md
```

### Master state

```
automa/state/iter-8-progress.md (orchestrator master state)
automa/team-state/messages/scribe-opus-iter8-to-orchestrator-2026-04-27-144730.md (this turn)
```

### Iter 7 → 8 reference (preserved)

```
docs/audits/2026-04-27-sprint-s-iter7-RAG-ingest-FINAL-audit.md (precedent style)
docs/handoff/2026-04-26-sprint-s-iter-6-to-iter-7-handoff.md (precedent style)
docs/pdr/PDR-SPRINT-S-ITER-7-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md (master PDR)
```

## §6 PRINCIPIO ZERO + MORFISMO compliance handoff

**PRINCIPIO ZERO**: handoff doc cita Vol/pag canon (ADR-015 §4 Schema Postgres rag_chunks volume_id+page_number, ADR-016 §11 Voice register Isabella narratore volumi). Plurale "Ragazzi," verified composite tests case 10.

**MORFISMO**:
- Sense 1 tecnico: hybridRetrieve runtime fusion BM25+dense+RRF k=60 morphic per-classe
- Sense 2 strategico: triplet coerenza preservata software ↔ kit Omaric ↔ volumi PDF (1881 chunks Vol1+2+3 + 100 wiki concepts mapping diretto)

Anti-pattern Morfismo (vietati) NON violati iter 8: zero generic palette, zero parafrasi, zero card flat indipendenti, zero icone material-design.

## §7 Sign-off scribe-opus iter 8

**Status**: COMPLETED PHASE 2 sequential post 4/4 PHASE 1 completion msgs filesystem barrier.

**Score iter 8 PHASE 1 close ONESTO**: **8.5/10**.

**Score iter 9 target ONESTO**: **9.0+/10** (depend Andrea actions Step 2-4 + bench exec PHASE 3).

— scribe-opus iter 8 r2, 2026-04-27T14:47:30 UTC
