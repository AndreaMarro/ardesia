# PDR Sprint S APPENDIX — Github Copilot/Actions + Session Start Guide + Activation String

> Extends `docs/pdr/PDR-SPRINT-S-ONNISCENZA-ONNIPOTENZA-2026-04-27.md` with:
> - GitHub Copilot + Actions integration strategy
> - Simple session-start guide (step-by-step)
> - Comprehensive skill catalog + new skill ideas
> - Final activation string

---

## A1. SIMPLE SESSION START GUIDE (paste in next session FIRST)

### A1.1 Step 1 — Open Claude Code on MacBook

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
```

### A1.2 Step 2 — Verify Mac Mini autonomous still running

```bash
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'launchctl list | grep elab'
# Expected: <PID> 0 com.elab.mac-mini-autonomous-loop
# If PID changed since 23944 → reboot occurred, loop auto-restarted (KeepAlive=true)
```

### A1.3 Step 3 — Provide credentials (if available)

```bash
# Option A: file (recommended)
mkdir -p ~/.elab-credentials
chmod 700 ~/.elab-credentials
cat > ~/.elab-credentials/sprint-s-tokens.env << 'EOF'
SCALEWAY_API_TOKEN=...
CLOUDFLARE_API_TOKEN=...
HUGGINGFACE_TOKEN=...
EOF
chmod 600 ~/.elab-credentials/sprint-s-tokens.env

# Option B: paste in chat (Claude reads + uses, never logs)
```

### A1.4 Step 4 — Paste activation string §A4 in Claude Code chat

### A1.5 Step 5 — Claude reads context + confirms strategy + waits "parti"

### A1.6 Step 6 — Andrea OK → Claude executes

---

## A2. GITHUB COPILOT + ACTIONS STRATEGY

### A2.1 Github Actions (CI/CD automation)

Already in place per CLAUDE.md:
- Pre-commit hook (baseline test check)
- Pre-push hook (baseline + build)
- Branch protection main
- Auto-deploy Vercel on PR merge

**Add Sprint S**:

```yaml
# .github/workflows/wiki-concept-validation.yml
name: Wiki Concept Validation
on:
  pull_request:
    paths:
      - 'docs/unlim-wiki/concepts/**.md'
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npx vitest run tests/unit/wiki/wiki-concepts.test.js
      - name: Q4 SCHEMA + Principio Zero check
        run: node scripts/bench/score-unlim-quality.mjs --baseline scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl
```

```yaml
# .github/workflows/sprint-s-iter-audit.yml
name: Sprint S Iter Audit
on:
  push:
    branches:
      - 'sprint-s-iter-*'
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - name: CoV 3x baseline
        run: |
          for i in 1 2 3; do
            npx vitest run > /tmp/cov-$i.log
            grep -E "Tests" /tmp/cov-$i.log
          done
      - name: Quality audit
        run: node scripts/benchmark.cjs --write
      - name: Upload audit
        uses: actions/upload-artifact@v4
        with:
          name: sprint-s-audit-${{ github.run_id }}
          path: automa/state/benchmark.json
```

### A2.2 Github Copilot (developer productivity)

Limited use case for ELAB:
- Andrea solo dev, prefers Claude Code for AI coding
- Copilot useful for quick autocomplete on tests/scripts
- NOT replace Claude Code agents for substantive work

**Optional integration** (defer Sprint S+1):
- Enable GitHub Copilot on Andrea VS Code (paid)
- Use for boilerplate/test snippets only
- Claude Code remains primary AI dev assistant

### A2.3 Mac Mini self-hosted GitHub runner

Per `docs/pdr/PDR-MAC-MINI.md` Livello 4 (deferred):
```bash
# On Mac Mini:
mkdir -p ~/actions-runner && cd ~/actions-runner
curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/download/v2.319.1/actions-runner-osx-arm64-2.319.1.tar.gz
tar xzf actions-runner.tar.gz
./config.sh --url https://github.com/AndreaMarro/elab-tutor --token <REGISTRATION_TOKEN>
./svc.sh install
./svc.sh start
```

Speedup CI 3-5x for heavy jobs (vitest 12k tests, build 60s).

---

## A3. COMPREHENSIVE SKILLS + NEW SKILL IDEAS

### A3.1 Skills proven this session

| Skill | Use case |
|-------|----------|
| superpowers:using-superpowers | Entry, skill discovery |
| superpowers:writing-plans | PDR generation |
| superpowers:brainstorming | Architecture decisions |
| ralph-loop:ralph-loop | Iterative loop framework |
| ralph-loop:cancel-ralph | Stop loop |
| quality-audit | Comprehensive audit |
| documentation | Engineering docs |

### A3.2 Skills loaded but not used (potential Sprint S)

| Skill | Use case |
|-------|----------|
| agent-orchestration:multi-agent-optimize | 5-agent team Sprint S core |
| agent-teams:team-feature | Sprint S feature parallel |
| agent-teams:team-delegate | Task dispatch dashboard |
| agent-teams:team-status | Monitor team progress |
| agent-teams:team-review | Multi-reviewer parallel |
| agent-teams:team-shutdown | Graceful close |
| agent-teams:parallel-debugging | Multi-hypothesis debug |
| superpowers:test-driven-development | TDD strict per agent |
| superpowers:verification-before-completion | Pre-claim CoV |
| superpowers:executing-plans | PDR execution |
| superpowers:subagent-driven-development | Subagent dispatch pattern |
| claude-md-management:revise-claude-md | Update CLAUDE.md |
| claude-md-management:claude-md-improver | Audit CLAUDE.md |
| code-review:code-review | PR review |
| coderabbit:review | AI code review |
| firecrawl:firecrawl | Web research |
| context7:query-docs | Library docs |

### A3.3 MCP tools to load via ToolSearch (Sprint S stress tests)

- `mcp__plugin_playwright_playwright__browser_*` — Playwright on production URL
- `mcp__Control_Chrome__*` — Chrome control on production URL
- `mcp__supabase__*` — Supabase migrations + SQL
- `mcp__plugin_vercel_vercel__*` — Vercel deploy/check (already authenticated)

### A3.4 NEW SKILL IDEAS (Andrea may create)

#### Skill: elab-r0-bench
Orchestrate Sprint R0 baseline + scoring.

```yaml
name: elab-r0-bench
description: Runs Sprint R0 UNLIM quality baseline. Scores 10 fixtures via Principio Zero compliance scorer. Outputs PASS/WARN/FAIL verdict.
trigger: "audit unlim quality" OR "sprint r0" OR "baseline UNLIM"
steps:
  1. Verify production endpoint reachable
  2. Run 10 fixture prompts via API
  3. Score responses via score-unlim-quality.mjs
  4. Generate audit doc + scorecard
  5. Output PASS (>=85%) / WARN / FAIL
```

#### Skill: elab-rag-ingest
Orchestrate Anthropic Contextual Retrieval ingest 6000 chunks.

```yaml
name: elab-rag-ingest
description: Generates 6000+ RAG chunks from PDF volumi via Anthropic Contextual Retrieval. Uses VPS GPU for embed + Qwen3-VL-32B for context prepend. Upserts Supabase pgvector.
trigger: "rag ingest" OR "6000 chunks"
steps:
  1. Verify VPS GPU + Supabase migration applied
  2. Run scripts/rag-contextual-ingest.mjs
  3. Verify rag_chunks_stats counts
  4. Test search_rag_hybrid RPC
  5. Audit doc with metrics
```

#### Skill: elab-mac-mini-batch
Dispatch Wiki concept batch via SSH to Mac Mini.

```yaml
name: elab-mac-mini-batch
description: Dispatches 5-10 Wiki concepts to Mac Mini autonomous batch script via SSH. Validates kebab-case. Pulls + commits + pushes results to PR #43 branch.
trigger: "wiki batch" OR "mac mini concept" OR "dispatch concepts"
inputs: list of concept names (kebab-case lowercase)
steps:
  1. Validate kebab-case
  2. SSH dispatch
  3. Wait completion
  4. Pull + commit + push
  5. Update PR description
```

#### Skill: elab-stress-prod
Playwright + Control Chrome stress test live URL.

```yaml
name: elab-stress-prod
description: Run stress test on https://www.elabtutor.school production. Uses Playwright for E2E flow + Control Chrome for runtime validation.
trigger: "stress test" OR "smoke prod"
steps:
  1. Load Playwright + Control Chrome MCP via ToolSearch
  2. Run 5 scenarios (load, lavagna, UNLIM chat, citation click, modal flow)
  3. Generate report markdown
  4. Audit doc with screenshots
```

#### Skill: elab-vps-deploy
Orchestrate Sprint VPS-1 + VPS-2 + VPS-3.

```yaml
name: elab-vps-deploy
description: Provisions VPS GPU (Scaleway trial OR Hetzner production), deploys 9-component stack, ingest 6000 RAG chunks, configures Cloudflare Tunnel.
trigger: "vps deploy" OR "sprint vps"
inputs: trial|production
steps:
  1. Read credentials from ~/.elab-credentials/sprint-s-tokens.env
  2. Provision via API (Scaleway OR Hetzner)
  3. Apply scripts/vps-gpu-trial-scaleway.sh
  4. Configure Cloudflare Tunnel + DNS gpu.elabtutor.school
  5. Verify health endpoints
  6. Run benchmark
  7. Audit doc + decision
```

#### Skill: elab-clawbot-skeleton
Sprint 6 Day 39 dispatcher 80 tools wiring.

```yaml
name: elab-clawbot-skeleton
description: Wires ClawBot 80-tool dispatcher (OpenClaw Sett-5) into production unlim-chat. Gate post Sprint R5 PASS.
trigger: "clawbot" OR "openclaw day 39" OR "80 tool dispatcher"
steps:
  1. Verify Sprint R5 stress test PASS >=85%
  2. Apply OpenClaw migrations (tool_memory pgvector)
  3. Wire dispatcher in unlim-chat handler
  4. Test 10 tool invocations sequential
  5. Production canary 10%
  6. Monitor 7 days
```

#### Skill: elab-tea-wiki-review
Coordinate Tea async Wiki concept review.

```yaml
name: elab-tea-wiki-review
description: Generates Tea brief for Wiki concept pedagogical review. Pulls newly committed concepts from PR #43, formats review tasks per concept, drafts email.
trigger: "tea wiki" OR "tea review concepts"
steps:
  1. Diff PR #43 vs last Tea review
  2. Per new concept: extract content + format review checklist
  3. Generate email body (PT/MD)
  4. Output for Andrea send
```

---

## A4. ACTIVATION STRING FINAL (paste in next session)

```
================================================================
ELAB SPRINT S — ATTIVAZIONE
================================================================

cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"

LEGGI SUBITO IN ORDINE (autonomous, non chiedere conferma):
1. CLAUDE.md
2. docs/pdr/PDR-SPRINT-S-ONNISCENZA-ONNIPOTENZA-2026-04-27.md
3. docs/pdr/PDR-SPRINT-S-APPENDIX-2026-04-27.md
4. docs/handoff/2026-04-26-ralph-loop-handoff.md
5. docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md
6. docs/strategy/2026-04-26-master-plan-v2-comprehensive.md

SUBITO DOPO:
- ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'launchctl list | grep elab'
- Verify Mac Mini autonomous PID
- Read ~/.elab-credentials/sprint-s-tokens.env (if file exists)
- Confirm con Andrea: "Pronto Sprint S. Activate ralph loop?"

POI ATTIVA RALPH LOOP:
/ralph-loop Sprint S onniscenza onnipotenza definitiva. 5-agent team orchestrato (planner-opus + architect-opus + generator-app-sonnet + generator-test-sonnet + scribe-sonnet) communicanti via automa/team-state/messages/. CoV per ogni agente prima claim fatto. /quality-audit orchestratore fine ogni iter. Stress test Playwright + Control Chrome ogni 4 iter su https://www.elabtutor.school production. Mac Mini autonomous continua Wiki batch (current 50/100 toward 100+). VPS GPU Hetzner GEX130 deploy quando Andrea credentials. RAG 6000 chunks Anthropic Contextual ingest. Hybrid RAG BM25+BGE-M3+RRF+rerank. Together AI fallback gated (canUseTogether emergency_anonymized). ClawBot 80-tool dispatcher Sprint 6 Day 39 post Sprint R5 PASS. UNLIM synthesis prompt v3 wired production post PR #37 merge. SSH key id_ed25519_elab SOLO MacBook locale MAI GitHub MAI archive. NO main push. NO merge senza Andrea. Caveman mode ON. Massima onestà no compiacenza. --max-iterations 100 --completion-promise SPRINT_S_COMPLETE

Workflow:
1. ITER N: dispatch 5 agents in parallel sub-tasks
2. Ogni agente: CoV 3x prima claim
3. Orchestrator: /quality-audit comprehensive
4. Commit + push (no main, branch sprint-s-iter-N)
5. Audit doc iter N
6. Ogni 4 iter: stress test Playwright + Control Chrome on prod
7. Promise check 10 boxes definition (PDR §2.3)

REGOLE IMMUTABILI:
- PRINCIPIO ZERO v3.1 (CLAUDE.md)
- SSH MacBook only enforcement
- TDD strict + CoV 3x per agent
- Mac Mini = batch worker SOLO (NON ospita modelli ELAB users)
- VPS GPU = ALL inference (Qwen3-VL-32B + SGLang + Coqui + Whisper Turbo + BGE-M3 + reranker)
- GDPR EU-only runtime, Together AI fallback gated

SPRINT_S_COMPLETE definition (10 boxes - PDR §2.3):
1. VPS GPU Hetzner GEX130 deployed
2. 9-component stack live
3. 6000+ RAG chunks ingested + Anthropic Contextual prepend
4. 100+ Wiki LLM concepts compiled
5. UNLIM synthesis prompt v3 wired production
6. Hybrid RAG live
7. Vision flow live (Qwen3-VL-32B sees simulator)
8. TTS+STT Italian working
9. Sprint R5 stress test ≥85% PASS
10. ClawBot 80-tool dispatcher live

Caveman mode ON. Massima onestà. ZERO compiacenza.
================================================================
```

---

## A5. CLAUDE.md updates summary (post Sprint S kickoff)

Updates needed (via `claude-md-management:revise-claude-md` next session):

```diff
@@ Stack tecnico @@
- Nanobot AI: Render (https://elab-galileo.onrender.com)
+ Nanobot AI: DEPRECATED (Mac Mini Brain self-host SKIPPED, replaced by VPS GPU Sprint S)
+ Inference: VPS GPU Hetzner GEX130 (Qwen3-VL-32B + SGLang + Coqui + Whisper Turbo + BGE-M3 + reranker) — Sprint S deploy
+ Fallback: Gemini EU + Together AI gated (canUseTogether)

@@ Bug/gap aperti @@
+ 9. Sprint S deploy in progress — VPS GPU + RAG 6000 + UNLIM synthesis prompt v3
+ 10. Mac Mini autonomous H24 LIVE (PID launchctl) — Wiki batch gen 100+

@@ Team agent @@
- Pattern A (single sprint): 1 agent + TDD + CoV
- Pattern B (sprint major): 5 agenti paralleli iter × 4 + 3 agenti refine iter × 2
+ Pattern S (Sprint S ralph loop): 5 agenti orchestrati (planner+architect+generator-app+generator-test+scribe) + CoV per agente + /quality-audit orchestratore + stress test Playwright/Control Chrome ogni 4 iter on prod

@@ NEW: Mac Mini autonomous @@
+ ## Mac Mini autonomous H24
+
+ - SSH: progettibelli@100.124.198.59 (Tailscale) via id_ed25519_elab MacBook only
+ - launchctl plist: com.elab.mac-mini-autonomous-loop (PID active)
+ - Scripts: ~/scripts/elab-{mac-mini-autonomous-loop,wiki-batch-gen}.sh
+ - Auth: ~/.claude-tokens/oauth-token (file 600 + .zshenv env var)
+ - Workflow: dispatch via SSH file ~/.elab-trigger OR direct script call
+ - SSH key policy: id_ed25519_elab MacBook only, NEVER on Mac Mini, NEVER on GitHub
```

---

**File path**: `docs/pdr/PDR-SPRINT-S-APPENDIX-2026-04-27.md`
**Pairs with**: `docs/pdr/PDR-SPRINT-S-ONNISCENZA-ONNIPOTENZA-2026-04-27.md`
**Activation string**: §A4 above (paste-ready)
**Honesty**: explicit + complete
