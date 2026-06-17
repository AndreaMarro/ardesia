---
from: planner-opus
to: gen-app-opus
sprint: S
iter: 12
timestamp: 2026-04-28T04:35:18+02:00
atoms_assigned: [ATOM-S12-A2, ATOM-S12-A4, ATOM-S12-B2]
phase: PHASE-1-PARALLEL
file_ownership:
  - supabase/functions/_shared/rag.ts (A2 + A4 sequential intra-agent)
  - supabase/functions/unlim-chat/index.ts (A4 surface)
  - scripts/bench/iter-12-bench-runner.mjs (B2 NEW)
read_only: tests/, docs/, scripts/openclaw/, tests/fixtures/
contract_ref: docs/pdr/sprint-S-iter-12-contract.md
---

# DISPATCH planner-opus → gen-app-opus — iter 12

## Scope

### ATOM-S12-A2 — rag.ts hybridRetrieve OR-fallback expand (~30min)
File: `supabase/functions/_shared/rag.ts`

**Current state iter 11 close**: hybridRetrieve OR-fallback already implemented post 4 root causes fix (Voyage key + wfts + OR-fallback + plfts strip). Threshold 3-token min. Recall@5=0.384 measured 30/30 queries.

**Mandate**:
- Expand OR-fallback threshold from `3-token min` to `2-token min` (covers more 1-2 word query edge cases).
- Verify italian FTS strip stopwords ('per', 'di', 'la', etc.) intact + single-letter strip ('V', 'R', 'I') maintained.
- Ensure unit-test path: query "Ohm formula" (2 tokens) post-strip MUST hit OR-fallback branch successfully.
- Surface `DebugChunk` type field `chapter` + `page` + `source` (extension for A4 surface).

**Anti-pattern check**:
- DO NOT widen threshold to 1-token (single letter query noise risk).
- DO NOT remove italian stopwords list (regression iter 11 P0 root cause #3).
- DO NOT change Voyage 1024-dim embedding model.

### ATOM-S12-A4 — unlim-chat surface debug_retrieval per-chunk metadata (~30min)
File: `supabase/functions/unlim-chat/index.ts` (+ `rag.ts` DebugChunk type touched A2 above)

**Mandate**:
- Surface `debug_retrieval` response field with per-chunk `{id, content_preview, score, chapter, page, source, retriever_branch}` array (current returns array but missing chapter/page/source).
- Conditional inclusion: only when request body `debug_retrieval=true` flag present (gate by env `UNLIM_DEBUG_RETRIEVAL_ALLOWED=true` for prod safety).
- gen-test ATOM-S12-A1 depends on this surface for UUID realign — ship A4 BEFORE A1 awaits filesystem barrier.

**CoV smoke test**:
```bash
curl -X POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "X-Elab-Key: $ELAB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"Ohm formula","debug_retrieval":true}' | jq '.debug_retrieval[0]'
```
Expected: `{id: <uuid>, content_preview: "...", score: <0..1>, chapter: <n>, page: <n>, source: "vol1|vol2|vol3|wiki", retriever_branch: "dense|sparse|hybrid"}`.

### ATOM-S12-B2 — iter-12-bench-runner.mjs upgrade (~30min)
File: `scripts/bench/iter-12-bench-runner.mjs` (NEW)

**Mandate**: master orchestrator runner full 10-suite live (B1-B7 + B8 simulator + B9 Arduino + B10 Scratch).

**Required structure**:
```javascript
// scripts/bench/iter-12-bench-runner.mjs
// Master orchestrator iter 12 — B1-B10 full suite
import { runR7 } from './run-sprint-r7-200.mjs'; // B1 wraps r7-fixture.jsonl gen-test B1
import { runHybridRecall } from './run-hybrid-rag-recall.mjs'; // B2 hybrid-gold-30 fixture
import { runVisionE2E } from './run-vision-e2e.mjs'; // B3 Playwright
import { runTTS } from './run-tts-isabella.mjs'; // B4
import { runClawBot } from './run-clawbot-composite.mjs'; // B5
import { runCost } from './run-cost-aggregate.mjs'; // B6
import { runFallbackGate } from './run-fallback-gate.mjs'; // B7
// NEW iter 12:
import { runSimulatorEngine } from './run-simulator-engine.mjs'; // B8
import { runArduinoCompile } from './run-arduino-compile-92.mjs'; // B9
import { runScratchBlockly } from './run-scratch-blockly.mjs'; // B10

const args = process.argv.slice(2);
const dryRun = args.includes('--dry');
const suites = ['B1','B2','B3','B4','B5','B6','B7','B8','B9','B10'];
// ... orchestrator loop, write JSON+MD output to scripts/bench/output/iter-12-master-<timestamp>.{md,json}
```

**B8 simulator**: vitest run `tests/unit/engine/**` (CircuitSolver + AVRBridge + PlacementEngine), parse output, count PASS ≥30 → GREEN.
**B9 Arduino compile**: iterate 92 esperimenti `src/data/lesson-paths/*.json`, exec compiler endpoint `https://n8n.srv1022317.hstgr.cloud/compile`, count compile success ≥95% → GREEN.
**B10 Scratch Blockly**: subset 20 Scratch programs from `src/data/lesson-paths/`, exec compile, ≥90% → GREEN.

**Dry-run flag mandatory** (`--dry`) to verify imports + structure without exec (CoV gate).

**Anti-pattern check**:
- DO NOT execute live deploy/migration from this runner.
- DO NOT skip B7 fallback gate (regression iter 5 P3 critical).
- DO NOT inflate scores (cite raw output stdout in JSON exact, NOT estimate).

## Effort

A2 ~30min + A4 ~30min + B2 ~30min = ~90min.

## CoV

- `npx vitest run` post each file ship: ≥12290 PASS preserve baseline (target 12597+ iter 8 baseline).
- `npx vitest run -c vitest.openclaw.config.ts`: ≥129 PASS preserve.
- Manual sanity rag.ts: deno check OR `node -e "import('./supabase/functions/_shared/rag.ts')"` syntax check.
- B2 dry-run: `node scripts/bench/iter-12-bench-runner.mjs --dry` exit 0.
- 3× verify rule: each claim ("test pass", "build green") verified 3 times.
- A2 + A4 share rag.ts: write A2 first, commit-style sanity check, then A4 (NO interleave).
- A4 surface verify: smoke test curl post-Edge-Function-deploy (NO deploy from agent — orchestrator PHASE 3 only).

## Output

Completion msg: `automa/team-state/messages/gen-app-opus-iter12-to-orchestrator-2026-04-28-<HHMMSS>.md` con YAML frontmatter:
```yaml
from: gen-app-opus
to: orchestrator
sprint: S
iter: 12
timestamp: 2026-04-28T<HH:MM:SS>+02:00
atoms_completed: [ATOM-S12-A2, ATOM-S12-A4, ATOM-S12-B2]
files_shipped:
  - supabase/functions/_shared/rag.ts (LOC delta: +<n>)
  - supabase/functions/unlim-chat/index.ts (LOC delta: +<n>)
  - scripts/bench/iter-12-bench-runner.mjs (NEW LOC: <wc -l>)
cov:
  vitest_pass: <n>
  vitest_openclaw_pass: <n>
  build_status: NOT_RUN (defer PHASE 3 orchestrator heavy ~14min)
  baseline_delta: <integer >=0>
  rag_ts_syntax_check: PASS
  bench_runner_dry_run: PASS
phase_complete: PHASE-1
```

GO.

— planner-opus, 2026-04-28 04:35:18 CEST.
