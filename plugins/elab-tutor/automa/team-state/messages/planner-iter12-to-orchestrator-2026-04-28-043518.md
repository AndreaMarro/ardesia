---
from: planner-opus
to: orchestrator
sprint: S
iter: 12
timestamp: 2026-04-28T04:35:18+02:00
atoms_assigned: [PHASE-3-bench-commit-push]
phase: PHASE-3-SEQUENTIAL
prerequisites: PHASE-2 scribe-opus completion msg present
contract_ref: docs/pdr/sprint-S-iter-12-contract.md
mac_mini_delegations: [D1, D2, D3]
---

# DISPATCH planner-opus → orchestrator (Claude main) — iter 12 PHASE 3

## Scope

### PHASE 3 — Bench live + score + commit + push origin

**Pre-requisite verify**:
- `ls automa/team-state/messages/scribe-opus-iter12-to-orchestrator-2026-04-28-*.md` MUST return ≥1 file.
- If absent: ABORT phase 3, debug Pattern S race-cond.

### Step 1: bench runner full 10-suite live

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
node scripts/bench/iter-12-bench-runner.mjs
```

Expected: 10 suites B1-B10 execute. Output written `scripts/bench/output/iter-12-master-2026-04-28-<timestamp>.{md,json}`.

**Andrea env required**:
- `SUPABASE_ANON_KEY` (B1+B2+B3+B4 unlim-chat live calls)
- `ELAB_API_KEY` (X-Elab-Key header)
- `VOYAGE_API_KEY` (B2 hybrid recall measure)
- `SUPABASE_SERVICE_ROLE_KEY` (B6 cost aggregate from `together_audit_log` query)

If env missing: graceful skip + document in audit (B7 fallback gate already 100% from unit tests, no live exec required).

### Step 2: /quality-audit orchestratore totale

Skill ELAB-specific: invoke via `/elab-quality-gate` slash command (per master PDR §3.2):
- vitest baseline preserve check
- build PASS check (heavy ~14min)
- benchmark suite live (B1-B10 from step 1)
- Principio Zero V3 compliance check (12 rules expand iter 9)
- Morfismo Test pre-merge (10 anti-pattern check `.impeccable.md` + Sense 1.5 docente/classe adapt)
- Score 10 box ONESTO recalibrate post live measure

### Step 3: score 10 boxes recalibrate ONESTO

Update `automa/state/iter-12-progress.md`:
- Each box pre-iter-12 → post-iter-12 score with explicit evidence file reference.
- Cite raw bench output values (NO inflation, NO estimate).
- Compare against pass criteria contract §5 (B1-B10).

**Iter 12 close score gate**:
- 10/10 GREEN → 9.85/10 (best case)
- 8-9/10 GREEN → **9.65/10 (target ONESTO)**
- 6-7/10 GREEN → 9.30/10 (acceptable, defer iter 13)
- ≤5/10 GREEN → 9.00/10 stuck (defer iter 13 deep debug + spawn `/superpowers:systematic-debugging`)

### Step 4: commit batch

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git status  # NEVER blanket add. Review.
# Stage explicit file list per Phase 1 + Phase 2 deliverables (exclude .env, secrets):
git add docs/pdr/sprint-S-iter-12-contract.md \
        docs/adrs/ADR-019-*.md docs/adrs/ADR-020-*.md docs/adrs/ADR-021-*.md \
        supabase/functions/_shared/rag.ts supabase/functions/unlim-chat/index.ts \
        scripts/bench/iter-12-bench-runner.mjs scripts/bench/r7-fixture.jsonl \
        scripts/bench/output/iter-12-master-2026-04-28-*.{md,json} \
        tests/fixtures/hybrid-gold-30.jsonl tests/fixtures/hybrid-gold-30-realign.md \
        tests/e2e/02-vision-flow.spec.js tests/fixtures/vision-canvas-selector-evidence.md \
        tests/fixtures/screenshots/circuit-*.png tests/fixtures/screenshots/INDEX.md \
        docs/audits/2026-04-28-sprint-s-iter12-PHASE1-FINAL-audit.md \
        docs/handoff/2026-04-28-sprint-s-iter-12-to-iter-13-handoff.md \
        CLAUDE.md \
        automa/team-state/messages/*iter12*.md \
        automa/state/iter-12-progress.md

git commit -m "$(cat <<'EOF'
chore(sprint-s): iter 12 PHASE 1+2+3 close — score X.XX/10 ONESTO

PHASE 1 (4-agent OPUS parallel):
- planner: 12 ATOM-S12 contract + 5 dispatch msgs
- architect: ADR-019 Sense 1.5 morfismo + ADR-020 Box 1 prep + ADR-021 Box 3 prep
- gen-app: rag.ts OR-fallback 2-token + unlim-chat debug_retrieval surface + iter-12-bench-runner
- gen-test: gold-set v3 UUIDs realign + Vision canvas debug + r7 200 prompts + 20 real PNGs

PHASE 2: scribe audit + handoff + CLAUDE.md append

PHASE 3: bench live B1-B10 + /quality-audit + score recalibrate

Box 6: 0.85 → <X.XX> (recall@5 <X.XXX>)
Box 7: 0.55 → <X.XX> (vision topology <XX>%)
Pattern S race-cond fix VALIDATED 8x consecutive.

Mac Mini D1+D2+D3 background autonomous (cron + manual fire).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"

git push origin <branch>  # NO main push direct (per CLAUDE.md FERREA rule).
```

### Step 5: Mac Mini fire delegations D1+D2+D3

```bash
# T3 elab-builder 28 ToolSpec expand (NEXT-TASK.md fire)
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  "echo 'D1 ToolSpec expand 52→80, 5 per cycle, 6 cycles' > ~/Projects/elab-tutor/automa/state/NEXT-TASK.md"

# T1 elab-researcher-v2 Wiki Analogia 30 concepts (manual fire iter 12 + cron daily 22:30)
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  "cd ~/Projects/elab-tutor && bash scripts/elab-wiki-batch-gen-v2.sh"

# T2 elab-auditor-v2 Volumi PDF diff + experiment alignment (manual fire iter 12 CRITICAL user insight)
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 \
  "cd ~/Projects/elab-tutor && bash scripts/volumi-experiment-alignment-audit.sh"
```

Output state files (poll iter 13+):
- `automa/state/BUILD-RESULT.md` (D1 28 ToolSpec, 1 PR per 5)
- `automa/state/RESEARCH-FINDINGS.md` (D2 Wiki 30 concepts)
- `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md` (D3 critical Sprint T scope)

### Step 6: stress test prod entrance iter 13

```bash
# Playwright + Control Chrome MCP smoke prod
npx playwright test tests/e2e/01-smoke-prod.spec.js
# OR via mcp__plugin_playwright_playwright__browser_navigate https://www.elabtutor.school
```

Verify HTTP 200 + 0 console errors + screenshot evidence saved `docs/audits/iter-12-stress-prod-2026-04-28.png`.

## CoV

- Bench runner: capture stdout/stderr to log file.
- Score: cite raw output values (NO inflation).
- `git status` BEFORE every `git add` (NEVER blanket).
- `npx vitest run` post-commit: ≥12290 PASS preserve.
- `git push` only after CoV 3× verify all suites GREEN.
- NO `--no-verify` on commit.
- NO direct push to main (only feature branch).
- NO Edge Function deploy (defer Andrea explicit).
- NO migration apply (defer Andrea explicit).

## Honesty caveats

1. **Bench live env-dependent**: Andrea env keys required. If absent, document graceful skip per suite.
2. **B8/B9/B10 NEW iter 12**: first measures, baseline iter 13+.
3. **Mac Mini D1+D2+D3 background**: results land iter 13-14 close, NOT iter 12 close gating.
4. **Score 9.65 NOT guaranteed**: depends bench live results (recall@5 + topology).
5. **/quality-audit ELAB-specific**: skill `/elab-quality-gate` per master PDR §3.2 cadence "ogni 4 iter".
6. **Iter 12 entrance per master PDR §6 line 461-464**: stress test prod MANDATORY (Playwright + Control Chrome smoke).

## Output

Final orchestrator action: write `automa/state/iter-12-progress.md` with:
- 10 boxes ONESTO post-Phase-3 final score.
- Bench results inline.
- Commit SHA + branch + push status.
- Mac Mini fire status (D1+D2+D3 dispatched).
- Iter 13 entrance ACTIVATION STRING reference (handoff Phase 2 doc).

NO `<promise>SPRINT_S_COMPLETE</promise>` (only iter 14 close 10/10 verified).

GO.

— planner-opus, 2026-04-28 04:35:18 CEST.
