---
sprint: S
iter: 12
phase: PHASE-1-PARALLEL-4-AGENTS
created_at: 2026-04-28T04:35:18+02:00
created_by: planner-opus
state_baseline: iter 11 close 9.30/10 ONESTO (HEAD e02eabb)
target_close: 9.65/10 ONESTO (acceptable) | 9.85/10 ONESTO (best case)
master_pdr: docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md
pattern: Pattern S r2 (PHASE-PHASE filesystem barrier validated 7x)
agents: planner-opus + architect-opus + gen-app-opus + gen-test-opus + scribe-opus
total_atoms: 12 (A1-A5 + B1-B3 + C1 + D1-D3)
---

# Sprint S iter 12 — CONTRACT (planner-opus PHASE 1)

Master ref: `docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md` §4.1.

State entry: iter 11 close **9.30/10** ONESTO (HEAD `e02eabb`, 13 commits push origin `ca771cd`→`683da5f`). Hybrid RAG retriever LIVE recall@5=0.384 measured 30/30 queries post Voyage key + wfts + OR fallback iter 11 P0. Vision spec ready captureScreenshot fail (canvas selector mismatch). 52/80 ToolSpec. Wiki 100/100. R5 91.80% + R6 96.54% reinforced. Pattern S validated 5+6+8+11.

---

## §1 — 12 ATOM-S12 atoms tabulated

| ATOM ID | Owner | Files-owned | Depends-on | Effort | Box impact |
|---------|-------|-------------|------------|--------|------------|
| ATOM-S12-A1 | gen-test | `tests/fixtures/hybrid-gold-30.jsonl` (rewrite UUIDs from real `rag_chunks.id`) + `tests/fixtures/hybrid-gold-30-realign.md` (provenance note) | A4 partial (debug_retrieval surface for chunk_id discovery) | ~30min | Box 6 +0.05 (0.85→0.90) |
| ATOM-S12-A2 | gen-app | `supabase/functions/_shared/rag.ts` (hybridRetrieve OR-fallback expand 3-token min → 2-token threshold) | none | ~30min | Box 6 +0.05 (0.90→0.95) |
| ATOM-S12-A3 | gen-test | `tests/e2e/02-vision-flow.spec.js` (canvas selector debug `page.$$('canvas, svg')` enumerate) + `tests/fixtures/vision-canvas-selector-evidence.md` | none | ~1h | Box 7 +0.10 (0.55→0.65) |
| ATOM-S12-A4 | gen-app | `supabase/functions/unlim-chat/index.ts` (surface `debug_retrieval` per-chunk metadata: chapter, page, source) + `supabase/functions/_shared/rag.ts` (DebugChunk type extension only — coordinated with A2 via single `rag.ts` write window planner-controlled sequence) | A2 first (rag.ts) | ~30min | Box 6 +0.05 (debug visibility) |
| ATOM-S12-A5 | architect | `docs/adrs/ADR-019-sense-1.5-morfismo-runtime-docente-classe.md` NEW (~600 LOC) | none | ~1h | Foundation Sense 1.5 |
| ATOM-S12-B1 | gen-test | `scripts/bench/r7-fixture.jsonl` NEW (200 prompts, 10 cat × 20) — supersedes `r6-fixture.jsonl` 100 | none | ~30min | B1 precision +0.10 |
| ATOM-S12-B2 | gen-app | `scripts/bench/iter-12-bench-runner.mjs` NEW (B1-B7 wrap + B8 simulator + B9 Arduino + B10 Scratch) | A4 partial (debug_retrieval surface) | ~30min | Bench coverage 7→10 |
| ATOM-S12-B3 | gen-test | `tests/fixtures/screenshots/circuit-{01..20}.png` (real Playwright captureScreenshot post `mountExperiment` iter sim, replace placeholder PNGs) + `tests/fixtures/screenshots/INDEX.md` | A3 (canvas selector fix) | ~30min | B3 + B5 image vision unblock |
| ATOM-S12-C1 | scribe | `docs/audits/2026-04-28-sprint-s-iter12-PHASE1-FINAL-audit.md` NEW + `docs/handoff/2026-04-28-sprint-s-iter-12-to-iter-13-handoff.md` NEW + CLAUDE.md append iter 12 close section | ALL Phase 1 (4/4 completion msgs filesystem barrier) | ~30min | Foundation |
| ATOM-S12-D1 | Mac Mini elab-builder | `automa/state/BUILD-RESULT.md` (1 PR per 5 ToolSpec, 28 expand 52→80) | NEXT-TASK.md fire iter 12 entrance | 3 giorni autonomous | Box 10 +0.05 (0.95→1.0) |
| ATOM-S12-D2 | Mac Mini elab-researcher-v2 | `automa/state/RESEARCH-FINDINGS.md` (Wiki Analogia 30 concepts) | cron daily 22:30 + manual fire | overnight | Wiki quality (Box 4 maintain 1.0) |
| ATOM-S12-D3 | Mac Mini elab-auditor-v2 | `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md` (Vol1+2+3 PDF diff + experiment alignment audit user insight 2026-04-28) | manual fire iter 12 | 1-2 giorni | Sprint T scope prep |

**Subtotal box impact iter 12 close target**: Box 6 0.85 → 0.95 (+0.10) + Box 7 0.55 → 0.70 (+0.15) + ADR-019 foundation + bench coverage 7→10 + Mac Mini autonomous 3 background tasks parallel.

**Total target lift**: 9.30 → 9.65 ONESTO (+0.35).

---

## §2 — File ownership matrix RIGID (NO write conflict)

### Owner: architect-opus
- **WRITE EXCLUSIVE**:
  - `docs/adrs/ADR-019-sense-1.5-morfismo-runtime-docente-classe.md` (NEW)
  - `docs/adrs/ADR-020-box-1-vps-gpu-strategic-decommission-prep.md` (NEW, prep iter 13 ratify)
  - `docs/adrs/ADR-021-box-3-rag-1881-full-coverage-redefine-prep.md` (NEW, prep iter 13 ratify)
- **READ ONLY**: src/, tests/, supabase/, scripts/

### Owner: gen-app-opus
- **WRITE EXCLUSIVE**:
  - `supabase/functions/_shared/rag.ts` (A2 OR-fallback 2-token + A4 DebugChunk type extension)
  - `supabase/functions/unlim-chat/index.ts` (A4 debug_retrieval surface)
  - `scripts/bench/iter-12-bench-runner.mjs` (B2 NEW, B1-B7 wrap + B8/B9/B10)
- **READ ONLY**: tests/, docs/, scripts/openclaw/, tests/fixtures/

### Owner: gen-test-opus
- **WRITE EXCLUSIVE**:
  - `tests/fixtures/hybrid-gold-30.jsonl` (A1 rewrite UUIDs)
  - `tests/fixtures/hybrid-gold-30-realign.md` (A1 provenance)
  - `tests/e2e/02-vision-flow.spec.js` (A3 canvas selector debug)
  - `tests/fixtures/vision-canvas-selector-evidence.md` (A3)
  - `scripts/bench/r7-fixture.jsonl` (B1 NEW 200 prompts)
  - `tests/fixtures/screenshots/circuit-{01..20}.png` (B3 real PNGs)
  - `tests/fixtures/screenshots/INDEX.md` (B3)
  - Any `tests/unit/**`, `tests/integration/**` NEW test referencing A1-A4-B1-B2-B3 deliverables
- **READ ONLY**: src/, supabase/, scripts/openclaw/ (composite-handler), scripts/bench/iter-12-bench-runner.mjs

### Owner: scribe-opus (PHASE 2 sequential)
- **WRITE EXCLUSIVE**:
  - `docs/audits/2026-04-28-sprint-s-iter12-PHASE1-FINAL-audit.md` (NEW)
  - `docs/handoff/2026-04-28-sprint-s-iter-12-to-iter-13-handoff.md` (NEW)
  - CLAUDE.md (append iter 12 close section ONLY, no rewrite existing)
  - `docs/unlim-wiki/{index,log}.md` (count update if Mac Mini delivered)
  - 2-3 wiki concept by-hand under `docs/unlim-wiki/concepts/*.md` (optional)
- **READ ONLY**: ALL Phase 1 deliverables filesystem (Phase 1 complete barrier)

### Owner: orchestrator (PHASE 3, post Phase 2)
- **EXECUTE ONLY**: bench runner live + git commit batch + git push origin
- NO write to ATOM deliverables (all already shipped Phase 1+2)

### Owner: planner-opus (THIS DOC, current turn)
- **WRITE EXCLUSIVE**:
  - `docs/pdr/sprint-S-iter-12-contract.md` (THIS file)
  - `automa/team-state/messages/planner-iter12-to-{architect,gen-app,gen-test,scribe,orchestrator}-2026-04-28-043518.md` (5 dispatch msgs)
- **READ ONLY**: PDR master, CLAUDE.md, .impeccable.md (if exists), prior iter contracts

**Conflict check**: gen-app `rag.ts` writes A2 + A4 — coordinated single file by SAME agent (gen-app-opus), atomic write window. NO cross-agent write to `rag.ts`. ZERO overlap detected.

---

## §3 — DAG dependency graph (markdown text)

```
                       [planner-opus iter 1: contract + 5 dispatch msgs]
                                        |
                                        v
       +------------+------------+------------+------------+
       |            |            |            |
       v            v            v            v
[architect-opus]  [gen-app-opus]  [gen-test-opus]  [Mac Mini]
   ADR-019           A2 rag.ts        A1 (after A4         D1 ToolSpec
   ADR-020           OR-fallback      surfaces chunk_id    D2 Wiki
   ADR-021           |                via debug_retrieval) D3 Volumi
   (parallel,        v                                     (cron+manual
    no deps)         A4 unlim-chat    A3 vision spec        autonomous,
                     debug_retrieval  canvas debug          background)
                     |                |
                     v                v
                     A2 + A4 ship --> A1 realign UUIDs
                                      (uses live debug
                                       _retrieval to
                                       discover real
                                       chunk_id)
                     |                |
                     v                v
                     B2 bench runner  B1 r7 200 prompts
                     B1-B7 + B8 + B9  (independent of A*)
                     + B10 (depends   |
                     on A4 debug_     v
                     retrieval        B3 20 real PNG
                     surface)         (depends A3 canvas
                                       selector fix)
                                |
                          +-----+-----+
                          |   FILESYSTEM
                          |   BARRIER 4/4
                          |   completion msgs
                          v
                  [scribe-opus PHASE 2]
                  C1 audit + handoff
                  + CLAUDE.md append
                          |
                          v
                  [orchestrator PHASE 3]
                  bench live + score
                  + commit + push
```

**Critical paths**:
- **Path 1 (Box 6)**: A2 (rag.ts OR-fallback) → A4 (debug surface) → A1 (gold-set UUID realign using debug_retrieval live data) → recall@5 measure live → Box 6 0.95 verified.
- **Path 2 (Box 7)**: A3 (vision canvas debug) → B3 (real PNG capture) → B3 image fixtures unblock B5 ClawBot composite full → Box 7 0.70 verified.
- **Path 3 (bench coverage)**: B1 (r7 200) + B2 (runner B1-B10) + A4 (debug surface) → 10-suite bench live PHASE 3 orchestrator.
- **Path 4 (foundation)**: A5 ADR-019 independent, foundation Sense 1.5 documented.
- **Path 5 (Mac Mini parallel)**: D1+D2+D3 background autonomous, NO Phase 1 dependency.

**Parallelism**: A5 + A2 + A3 + B1 fully parallel from iter start. A1 + A4 + B2 + B3 require serialization within same agent (gen-app A2→A4; gen-test A1 awaits A4, B3 awaits A3). architect ZERO dependency. Mac Mini ZERO dependency.

---

## §4 — CoV requirements per agent

**Universal CoV mandatory all agents** (per CLAUDE.md "Anti-regressione FERREA" + PDR §3.1):
1. **vitest**: ≥12290 PASS (iter 11 baseline 12597+ per Sprint S iter 8 PHASE 1, target preserve). Re-run 3× before declaring "tests pass".
2. **build**: `npm run build` PASS (heavy ~14min, mandatory pre-commit; defer to PHASE 3 orchestrator if agent ships pure-doc/test only).
3. **baseline preserve**: `automa/baseline-tests.txt` delta ≥0 (NEVER negative — pre-commit hook enforces).
4. **3× verify rule**: every claim ("test pass", "build green", "function works") verified 3 times before stating in completion msg.

### architect-opus CoV
- ZERO code execution. ADR docs only.
- Verify referenced files exist (`src/services/unlimContextCollector.js`, `supabase/functions/_shared/rag.ts`, etc.) before citing in ADR.
- ZERO regression possible (no code touched).
- Output: 3 ADR markdown files (≥600 LOC ADR-019 minimum).

### gen-app-opus CoV
- `npx vitest run` post each file ship: 12290+ PASS (NEVER negative delta).
- `npx vitest run -c vitest.openclaw.config.ts` for any composite-handler touch (target ≥129 PASS preserve).
- Manual sanity: `node -e "require('./supabase/functions/_shared/rag.ts')"` syntax check (or `deno check` if available).
- B2 iter-12-bench-runner.mjs: dry-run flag `--dry` exit 0 before declaring shipped.
- A2 OR-fallback: explicit unit test in `tests/unit/rag-or-fallback.test.js` (gen-test ATOM if not own scope, else file note request).

### gen-test-opus CoV
- `npx vitest run` post each fixture: 12290+ PASS.
- A1 hybrid-gold-30 UUID realign: cross-check against live `rag_chunks` Supabase via curl debug_retrieval — UUIDs must exist in DB (NO synthetic).
- A3 vision spec: `npx playwright test tests/e2e/02-vision-flow.spec.js --reporter=list` exit code 0 OR documented SKIP with reason.
- B1 r7-fixture.jsonl: JSON.parse each line valid + 200 lines exact + 10 categories × 20 prompts even distribution.
- B3 20 PNG: `file tests/fixtures/screenshots/circuit-*.png` returns "PNG image" (NOT "data" placeholder).

### scribe-opus CoV
- Read 4/4 Phase 1 completion messages BEFORE writing audit (filesystem barrier check).
- Verify each Phase 1 deliverable exists filesystem (`ls -la <file>`) before citing in audit.
- NO inflation: cite line counts via `wc -l` actual output, NOT estimate.
- Score box-by-box: ONESTO recalibration with explicit baseline + lift evidence (file system reference per box).
- Cross-link audit ↔ handoff ↔ CLAUDE.md append (no orphan claims).

### orchestrator CoV (PHASE 3)
- Post-Phase 2 verify: scribe completion msg present.
- Bench runner: `node scripts/bench/iter-12-bench-runner.mjs` actual exec + capture stdout.
- Score: 10/10 boxes — explicit pass/fail per box (NO ambiguous WARN).
- Commit: `git status` show all uncommitted files BEFORE `git add`. NO `git add -A` blanket.
- Push: only after CoV 3× verify all suites GREEN.

---

## §5 — Pass criteria iter 12 close (B1-B10 from master prompt §6)

| Bench | Pass threshold | File ownership measure | Iter 11 baseline → iter 12 target |
|-------|----------------|------------------------|-----------------------------------|
| B1 R7 | ≥87% globale + 10/10 cat ≥85% | `scripts/bench/output/r7-{report,scores}-2026-04-28-*.{md,json}` | R6 96.54% iter 8 PHASE 3 LIVE → R7 200 maintain ≥87% |
| B2 Hybrid RAG recall@5 | ≥0.55 | `scripts/bench/output/b2-hybrid-recall-2026-04-28-*.json` | 0.384 iter 11 → 0.55 (lift +0.165) → Box 6 0.95 |
| B3 Vision E2E | latency p95 <8s + topology ≥80% | `tests/e2e/02-vision-flow.spec.js` Playwright report | iter 11 mount works captureScreenshot fail → topology ≥80% post canvas fix → Box 7 0.70 |
| B4 TTS Isabella WS | p50 <2s OR ceiling browser fallback documentato 0.85 | bench output `b4-tts-2026-04-28-*.json` | iter 9 functional fail Sec-MS-GEC → ceiling 0.85 acceptable iter 12 (Coqui defer iter 14) |
| B5 ClawBot | success ≥90% + sub-tool latency p95 <3s | `scripts/openclaw/dispatcher.test.ts` + composite-handler tests | iter 8 10/10 PASS → maintain |
| B6 Cost | <€0.012/session avg | `scripts/bench/output/b6-cost-2026-04-28-*.json` | maintain |
| B7 Fallback gate | 100% | `tests/unit/together-fallback.test.js` 23 PASS | maintain |
| B8 Simulator engine | 30+ tests PASS | `tests/unit/engine/**` (CircuitSolver + AVRBridge + PlacementEngine) | NEW measure iter 12 (B2 runner adds suite) |
| B9 Arduino compile flow | 92 esperimenti PASS rate ≥95% | `scripts/bench/output/b9-arduino-2026-04-28-*.json` | NEW measure iter 12 |
| B10 Scratch Blockly | compile rate ≥90% | `scripts/bench/output/b10-scratch-2026-04-28-*.json` | NEW measure iter 12 |

**Iter 12 score gate ONESTO**:
- 10/10 GREEN → 9.85/10 (best case)
- 8-9/10 GREEN → **9.65/10 (target ONESTO)** ← acceptable close
- 6-7/10 GREEN → 9.30/10 (acceptable, defer lift iter 13)
- ≤5/10 GREEN → 9.00/10 stuck (defer iter 13 deep debug + systematic-debugging spawn)

---

## §6 — Honesty caveats

1. **A4 + A2 share `rag.ts`**: gen-app-opus owns BOTH atoms. Sequential writes within agent (A2 OR-fallback first, A4 DebugChunk extension after). NO cross-agent conflict. Documented §2.
2. **A1 depends A4**: gen-test-opus must wait for gen-app-opus completion msg of A4 before realigning UUIDs (uses debug_retrieval to discover real `rag_chunks.id`). Filesystem barrier intra-Phase-1.
3. **B3 depends A3**: gen-test-opus internal sequential (A3 canvas debug → B3 real PNG capture). Same agent, no cross-agent block.
4. **Mac Mini D1+D2+D3 OUT of Phase 1 timing**: background autonomous, results land iter 13-14. NOT iter 12 close gating.
5. **B8/B9/B10 NEW measures iter 12**: no iter 11 baseline. First-run scores iter 12 = baseline iter 13+.
6. **Box 8 TTS WS ceiling**: Sec-MS-GEC blocker iter 9 known, iter 12 NO fix attempted (defer iter 14 Coqui RunPod alternative OR browser fallback ratify 0.95).
7. **Iter 12 close projection 9.65 NON guaranteed**: depends recall@5 lift to 0.55+ (Path 1) AND vision topology ≥80% (Path 2). Either fail → ratchet down to 9.45-9.50.

---

## §7 — Filesystem barrier protocol

PHASE 1 → PHASE 2 transition triggered by 4/4 completion messages present:
- `automa/team-state/messages/architect-opus-iter12-to-orchestrator-2026-04-28-*.md`
- `automa/team-state/messages/gen-app-opus-iter12-to-orchestrator-2026-04-28-*.md`
- `automa/team-state/messages/gen-test-opus-iter12-to-orchestrator-2026-04-28-*.md`
- `automa/team-state/messages/planner-opus-iter12-to-orchestrator-2026-04-28-*.md` (this current dispatch — counts as planner completion since planner ships in PHASE 0)

**scribe-opus MUST verify all 4 present BEFORE Phase 2 spawn** (race-cond fix iter 5+ validated 7×).

**orchestrator PHASE 3 MUST verify scribe completion msg BEFORE bench runner exec**:
- `automa/team-state/messages/scribe-opus-iter12-to-orchestrator-2026-04-28-*.md`

---

— planner-opus, 2026-04-28 04:35:18 CEST. CAVEMAN MODE. ONESTÀ MASSIMA. NO inflation.
