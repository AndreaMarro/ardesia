# Iter 12 Research Findings — 2026-04-28

Scout-opus mission. 6 areas. Cite sources verbatim. No inflation.

---

## 1. Anthropic harness20 + C-Compiler Experiment

### Key findings
- **Scope**: ~2,000 Claude Code sessions, ~$20K API spend, 16 parallel agents, 100K LOC Rust C-compiler, builds bootable Linux 6.9 on x86 + ARM + RISC-V (Anthropic doc, primary).
- **Result quality**: 99% pass on most compiler test suites, including GCC torture suite. Compiles QEMU, FFmpeg, SQLite, Postgres, Redis (Anthropic doc).
- **Architecture**:
  - Bare git repo per project. Each agent: Docker container, mounts repo at `/upstream`, clones to `/workspace`, pushes back when done.
  - **Lock-file synchronization**: agents claim a task by writing a text file under `current_tasks/`. Simple filesystem barrier, no message bus.
  - Append-only session log per agent (sessions resume after crash).
- **Failure modes mentioned**: rework loops when two agents picked overlapping work despite locks; needs lock-validation before commit. Deadlock rare (lock TTL not fully detailed in summaries).
- **Anthropic separately published "three-agent harness"** for full-stack work (planner + implementer + verifier) — InfoQ Apr 2026 confirms this is the productized variant.

### Sources
- https://www.anthropic.com/engineering/building-c-compiler (Anthropic primary — high credibility)
- https://www.anthropic.com/research/long-running-Claude (Anthropic primary)
- https://www.infoq.com/news/2026/04/anthropic-three-agent-harness-ai/ (InfoQ — high credibility)
- https://www.zenml.io/llmops-database/long-running-agent-harness-for-multi-context-software-development (ZenML — medium)
- https://venturebeat.com/ai/anthropic-says-it-solved-the-long-running-ai-agent-problem-with-a-new-multi (VentureBeat — medium)

### Apply-to-ELAB
- ELAB Pattern S already mirrors **filesystem barrier** (file-ownership-rigid). Validated against Anthropic primary doc.
- **Adopt lock-file pattern** for iter 13: each agent writes `automa/current_tasks/<agent>.lock` before edits; orchestrator verifies before merge.
- **Append-only session log** per agent in `automa/logs/<agent>-<iter>.jsonl` — enables crash-resume + audit (currently absent).

---

## 2. Multi-Agent Orchestration Production Patterns 2026

### Key findings
- **Sweet spot**: 2-5 teammates × 5-6 tasks (Anthropic Agent Teams docs, code.claude.com).
- **Filesystem barrier vs message-bus**: Anthropic Agent Teams ships **both** — shared task list (filesystem) + peer-to-peer messaging. Production guide recommends filesystem locks as primary, messaging only for status.
- **Race-condition fix protocols** (digitalapplied.com, shipyard.build):
  1. Atomic temp-file writes (write to `.tmp` → rename).
  2. Strict directory ownership (each agent only writes own folder).
  3. Pre-edit lock acquisition.
- **Cost-control tiering**: Opus orchestrator + Sonnet workers + Haiku verifiers — pattern endorsed by Shipyard Aug-2026 blog and AddyOsmani's "Code Agent Orchestra".
- **Production ops**: persist state every turn (Postgres/Redis), spend ledger per-task/user/tenant, **25-iteration default cap** + repetition detector.
- **Supervisor pattern (Leader-Worker)** = most reliable. Centralizes decisions, prevents drift.

### Sources
- https://code.claude.com/docs/en/agent-teams (Anthropic primary)
- https://platform.claude.com/docs/en/managed-agents/multi-agent (Anthropic primary)
- https://www.digitalapplied.com/blog/claude-agent-sdk-production-patterns-guide (community — medium)
- https://shipyard.build/blog/claude-code-multi-agent/ (community — medium)
- https://addyosmani.com/blog/code-agent-orchestra/ (Addy Osmani — high)

### Apply-to-ELAB
- **Iter 13 enforce 25-iter cap** + repetition detector in Pattern S harness.
- **Tier models**: Opus only for orchestrator; Sonnet for 4 workers; Haiku for CoV/quality-gate. Estimate -40% cost.
- **Atomic writes**: agents always write `<file>.tmp` then rename. Add to Pattern S protocol.

---

## 3. wshobson/agents + Similar Repos

### Key findings
- **wshobson/agents scale**: 184 specialized agents, 16 multi-agent orchestrators, 150 skills, 98 commands, 78 plugins (GitHub README).
- **Agent definition pattern**: markdown frontmatter (name, description, tools), single-file `<agent>.md` in `~/.claude/agents/`.
- **Auto-discovery**: Claude Code loads `~/.claude/agents/` on start.
- **Orchestration patterns**: sequential delegation, parallel execution, routing, review workflows — all built-in to Claude Code (no custom harness needed for basic cases).
- **Notable agents applicable to ELAB**: `error-detective`, `docs-architect`, `backend-architect`, `frontend-developer`, `ui-ux-designer`.
- **Forks/derivatives**: lst97/claude-code-sub-agents (full-stack), rahulvrane/awesome-claude-agents (curated list), chusri/claude-code-agents.

### Sources
- https://github.com/wshobson/agents (primary)
- https://github.com/wshobson/agents/blob/main/error-detective.md (primary file)
- https://github.com/wshobson/agents/blob/main/docs-architect.md (primary file)
- https://github.com/rahulvrane/awesome-claude-agents (community curated)
- https://github.com/lst97/claude-code-sub-agents (community fork)

### Apply-to-ELAB
- **Skill composition**: ELAB skills (`elab-quality-gate`, `ricerca-tecnica`) follow same frontmatter pattern. Validated.
- **Iter 13 add**: `error-detective` (RAG/Voyage diagnostics), `docs-architect` (auto-update PDR/MEMORY), `frontend-developer` (Lavagna polish).
- **Place all ELAB agents** under `~/.claude/agents/elab-*.md` for auto-discovery instead of inline Pattern S spawn calls.

---

## 4. Claude Code + VS Code Multi-Agent Integration 2026

### Key findings
- **Claude Code state April 2026**: VS Code integration, desktop app, browser IDE at `claude.ai/code`. Agent-first UX (you describe, AI drives, you review).
- **Cursor 3 (Apr 2 2026)**: dedicated "Agents Window" for parallel agents across repos, Design Mode, multi-agent coordination.
- **Cursor pricing**: Pro+ $60/mo, Ultra $200/mo. Credit-based (expensive models drain faster).
- **Claude Code pricing**: rolling rate limits + weekly ceiling, included in Anthropic Max ($200/mo).
- **Cline**: open-source, free, model-flexible (multi-provider). Best for VS Code natives wanting full control.
- **Cody**: Sourcegraph-backed, codebase-scale understanding (multi-repo enterprise).
- **Philosophical split**: Claude Code = agent-first; Cursor = IDE-first; Cline = config-first; Cody = search-first.

### Sources
- https://www.builder.io/blog/cursor-vs-claude-code (Builder.io — high)
- https://www.sitepoint.com/ai-ides-compared-cursor-claude-code-cody-2026/ (Sitepoint — medium)
- https://northflank.com/blog/claude-code-vs-cursor-comparison (Northflank — medium)
- https://fordelstudios.com/research/cursor-vs-claude-code-april-2026-what-changed (community — medium)
- https://codepick.dev/en/compare/claude-code-vs-cline/ (community — medium)

### Apply-to-ELAB
- ELAB stays Claude Code (Andrea solo dev, Max plan). Cursor switch not justified.
- **Adopt VS Code Claude Code extension** for inline review during Pattern S — speed up CoV step.
- Consider **Cline as backup** when Anthropic API rate-limited (open-source, BYOK).

---

## 5. Educational Simulators + AI Copilots Didactici 2026

### Key findings
- **Tinkercad** (Autodesk): grades 6-10, beginner UX, breadboard+circuits, no AI tutor integrated.
- **Wokwi**: grades 11+, ESP32/STM32/Arduino, IoT + cloud connectivity. Most serious makers' default 2026. Has Wokwi-CLI, GitHub Actions integration. **No native AI tutor**.
- **Proteus**: pro-grade SPICE, paid, university+.
- **LabsLand**: remote real-hardware labs (not simulator). Sparse 2026 search results — not dominant.
- **AI tutor integration patterns**: NONE of Tinkercad/Wokwi/Proteus ship integrated LLM tutor. Gap = ELAB's defensible moat.
- **Italian K-12 STEM market**: PNRR deadline 2026-06-30, MePA gestito (vendor: Davide Fagherazzi). No competitor offers Italian-language tutor + RAG-grounded didactic content.

### Sources
- https://cybotz.tech/wokwi-vs-tinkercad-best-tool-for-school-stem-labs-let-the-circuit-showdown-begin/ (community)
- https://zbotic.in/best-arduino-simulator-tools-tinkercad-vs-wokwi-vs-proteus/ (community)
- https://www.researchgate.net/publication/386323909_Wokwi_Simulation_versus_Tinkercad_Simulation_in_Electronics (academic)
- https://hackaday.io/project/181223-wokwi-arduino-simulator-versus-tinkercad-arduino (Hackaday)
- https://iotdunia.com/best-iot-simulation-tools-online/rbsnp/ (community)

### Apply-to-ELAB
- **ELAB's wedge = AI tutor + Italian + RAG**: no competitor combines all three. Double down.
- **Wokwi import/export** would let ELAB act as ramp from beginner (ELAB) to pro (Wokwi). Iter 14+ feature.
- **Teacher dashboard MVP** is differentiator vs Tinkercad (no class management).
- **Watch-out**: Tinkercad+Autodesk could ship LLM tutor anytime. Speed matters.

---

## 6. Onniscenza + Onnipotenza for ELAB

### Key findings
- **RAG production 2026 = hybrid mandatory**: BM25 + dense vectors + RRF fusion. RRF formula: `Score = Σ weight * (1 / (k + rank_i))`, **k=60 standard** (prevents division instability).
- **Recall jump**: vanilla dense ~65-78% → hybrid+RRF ~91% recall@10 (Medium production guide, kumaran srinivasan Mar 2026).
- **Contextual Retrieval (Anthropic)**: prepend ~50-100 token chunk-context summary at indexing — outperforms vanilla hybrid.
- **Hybrid + Cohere Rerank**: Recall@5 0.816 vs 0.695 hybrid alone (+17.4%).
- **Tuning**: rrf_k=60 default, per-retriever top-k=20, raise if pre-rerank recall low.
- **Tool-calling for full-platform control**: composition pattern = L1 atomic tools (~80) + L2 templates (compose L1). Mirror Anthropic's MCP architecture.
- **Memory persistence**: Supabase as primary store + claude-mem for cross-session episodic memory. Pattern endorsed by ELAB MEMORY.md (already in place).

### Sources
- https://medium.com/@kumaran.isk/building-a-production-rag-pipeline-start-with-hybrid-retrieval-dense-bm25-rrf-e901aba17cae (community — medium)
- https://glaforge.dev/posts/2026/02/10/advanced-rag-understanding-reciprocal-rank-fusion-in-hybrid-search/ (Guillaume Laforge / Google — high)
- https://aimultiple.com/hybrid-rag (industry — medium)
- https://blog.supermemory.ai/hybrid-search-guide/ (vendor — medium)
- https://aishwaryasrinivasan.substack.com/p/all-you-need-to-know-about-rag-in (community — medium)

### Apply-to-ELAB
- ELAB RAG (1881 chunks, Voyage AI) currently **dense-only**. Add BM25 + RRF k=60 = expected +20% recall.
- **Add Contextual Retrieval**: regenerate embeddings with chunk-context prefix (~$50 one-shot).
- **Tool composition L1+L2**: clawbot 80-tool atom layer + L2 template macros (es. "DiagnoseCircuit" = readState + checkConnections + suggestFix).
- **Memory tier**: Supabase (durable) + claude-mem (working) + localStorage (UX).

---

## TOP 5 ACTIONS — ITER 13 (Impact / Effort prioritized)

1. **Hybrid RAG + RRF k=60** [HIGH impact / MEDIUM effort, ~6h]
   - Add BM25 (PG `tsvector` + `ts_rank`) parallel to Voyage. Fuse RRF k=60. Expected +20% recall, more precise UNLIM grounding. Low-risk, additive.

2. **Model tiering for Pattern S** [HIGH impact / LOW effort, ~2h]
   - Opus orchestrator only. Sonnet 4 workers. Haiku CoV/quality-gate. Estimated -40% cost, same quality (per Shipyard + AddyOsmani).

3. **Lock-file + atomic writes for Pattern S** [MEDIUM impact / LOW effort, ~1h]
   - `automa/current_tasks/<agent>.lock` + `<file>.tmp`→rename. Eliminates remaining race-cond risk. Aligns with Anthropic harness20 primary doc.

4. **Append-only session log per agent** [MEDIUM impact / LOW effort, ~2h]
   - `automa/logs/<agent>-<iter>.jsonl`. Crash-resume + audit. Pattern from Anthropic primary.

5. **Contextual Retrieval embedding regeneration** [HIGH impact / MEDIUM effort, ~4h + $50]
   - Prefix each chunk with 50-token context summary before re-embedding. One-shot cost, persistent recall gain.

---

## RISKS + WATCH-OUTS

- **Tinkercad/Autodesk LLM tutor risk**: zero signal in 2026 search but they have resources. ELAB lead = Italian + RAG + dashboard. **Window 12-18 months max.**
- **Cursor 3 Agents Window** poaches dev mindshare — irrelevant for ELAB product, relevant if ELAB needs to recruit.
- **Anthropic Agent Teams still experimental** (disabled by default per code.claude.com). Don't bet ELAB's harness on its public stability — keep Pattern S filesystem-barrier as fallback.
- **RRF k=60 is rule-of-thumb, not optimal**: re-tune with ELAB's own eval set after 100 grounded queries. Don't blindly trust default.
- **wshobson/agents 184-agent sprawl**: cargo-culting risks. Import only 3-5 strictly relevant agents (`error-detective`, `docs-architect`, `frontend-developer`).
- **Multi-agent cost spiral**: 25-iter cap + repetition detector mandatory before scaling Pattern S past 5 agents. Without caps, runaway $100+/iter possible.
- **PNRR 2026-06-30 deadline**: 9 weeks left. Iter 13-14 must prioritize sellable features over architecture refactor. Hybrid RAG = sellable (better answers); full harness rewrite = not.

---
END
