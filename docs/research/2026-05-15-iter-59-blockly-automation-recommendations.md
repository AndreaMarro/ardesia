# Claude Code Automation Recommendations — Blockly Workstream

> iter 59 entrance. Generated via `claude-code-setup:claude-automation-recommender` skill.
> Scope: Andrea pivot decision iter 59 — REJECT mBlock (iter 58 recon Path C Hybrid REJECTED) + KEEP Blockly + add Nano R4 cross-compile via C++ + Blockly UX self-explanatory overhaul (kids 8-14, Andrea iter-21+ mandate "fruibile e semplice").

## Codebase Profile (already analyzed iter 58)

- **Type**: React 19 + Vite 7 SPA, mostly JavaScript (some TypeScript Edge Functions)
- **Framework**: Vite + Vitest + Playwright + Supabase + Vercel
- **Key Libraries**: `blockly@12.4`, `avr8js@0.20` (ATmega328p only), `@codemirror/lang-cpp`, `mobile-drag-drop`
- **Existing automation**: `.claude/agents/` (planner/generator-app/generator-test/evaluator), pre-commit + pre-push hooks (`scripts/quick-regression-check.sh`), `scripts/dev/codex-bg.sh`, CLAUDE.md
- **Blockly hot-spot**: 9 source files in `src/components/simulator/panels/Scratch*` (~7,476 LOC; 23 custom blocks + 48 codegen entries + 19 XML templates per iter 58 mBlock recon C1)
- **Compile infra**: n8n.srv1022317.hstgr.cloud/compile (CLAUDE.md infrastruttura section)
- **Simulator infra**: AVRBridge.js 1242 LOC emulates ATmega328p only — Nano R4 (Renesas RA4M1 Cortex-M4) NOT emulated (12-20 FTE-weeks unrelated work per iter 58 mBlock recon §C2)

---

## P0 — Critical for cross-compile shipping (do first)

### 🔌 MCP Servers — P0

#### context7 (already installed mcp__plugin_context7_context7__)
**Why**: query current Blockly v12 API + Arduino Renesas core (`arduino-cli core install arduino:renesas_uno`) + FQBN `arduino:renesas_uno:unor4wifi` / `arduino:renesas_uno:minima` docs without leaving Claude. Critical for cross-compile feasibility verification + Blockly toolbox refactor.
**Action**: confirm available via `mcp__plugin_context7_context7__query-docs`. Already loaded per iter 58 session inventory.

### 🎯 Skills — P0

#### product-management:write-spec
**Why**: write iter 59 PRD for "Blockly Nano R4 cross-compile + UX self-explanatory overhaul". Defines scope/non-scope/acceptance criteria/phased delivery. Andrea iter 21+ mandate requires written spec to avoid scope creep.
**Invocation**: User OR Claude (`/write-spec`).
**Output**: `docs/specs/2026-05-15-iter-59-blockly-cross-compile-ux.md`.

#### ultrathink:ultrathink
**Why**: spawn 4-agent specialist team (Architect + Research + Coder + Tester) for the Blockly workstream — designed exactly for "analyze, design, implement, validate coding task". Replaces ad-hoc planning.
**Invocation**: User OR Claude (`/ultrathink:ultrathink <task>`).
**Action**: feed PRD from write-spec → ultrathink decomposes into Architect+Research+Coder+Tester atomic deliverables.

#### elab-morfismo-validator (existing ELAB project skill)
**Why**: validate Blockly UX changes preserve Morfismo Sense 2 (palette Navy/Lime/Orange/Red + NanoR4Board SVG identity + font + ToolSpec count + lesson-paths coverage). Anti-regression gate iter 59 Phase 1 close.
**Action**: invoke after each Blockly UI batch edit.

### ⚡ Hooks — P0

#### PreToolUse Edit src/components/simulator/engine/CircuitSolver.js + AVRBridge.js + PlacementEngine.js
**Why**: CLAUDE.md flags these as "critical files — coordinamento OBBLIGATORIO prima di modificare". Hook blocks accidental edit if Andrea-ratify token missing. iter 59 cross-compile work might tempt edits to AVRBridge.js — block until ratify.
**Where**: `.claude/settings.json` PreToolUse hook checking edit file path + scratchpad ratify marker.
**Existing**: `scripts/guard-critical-files.sh` is referenced in CLAUDE.md anti-regression section ("blocca modifiche engine senza authorized-engine-change"). Verify hook is enabled.

#### PostToolUse Edit src/components/simulator/panels/Scratch*.{js,jsx} → npx vitest run --silent tests/unit/components/simulator/panels/
**Why**: Blockly UX edits regress easily (block category numbering, codegen output order). Auto-test on each edit catches breakage instantly vs end-of-session surprise.
**Where**: `.claude/settings.json` PostToolUse Edit hook.

### 🤖 Subagents — P0

#### architect-review (already available `comprehensive-review:architect-review`)
**Why**: review Nano R4 codegen design — extend `scratchGenerator.js` with `board` parameter vs parallel `scratchGeneratorR4.js`. Architectural decision needed before Coder phase. Cite SOLID + Clean Architecture principles.
**Invocation**: spawn early iter 59 design phase.

#### frontend-developer (already available `frontend-mobile-development:frontend-developer`)
**Why**: Blockly UX overhaul is React 19 component refactor — Italian labels + tooltips + touch ≥44px + responsive. Frontend specialist agent has React + Tailwind + a11y patterns ready.
**Invocation**: post-architect-review, Coder phase.

---

## P1 — High-value parallel automations (do within 1-2 iters)

### 🎯 Skills — P1

#### documentation-generation:openapi-spec-generation
**Why**: document n8n.srv1022317.hstgr.cloud/compile endpoint contract (request shape: code + board + fqbn + libraries; response: hex + build log + errors). Iter 59 cross-compile adds `board` parameter — formal OpenAPI 3.1 contract prevents drift.
**Invocation**: `/openapi-spec-generation`.
**Output**: `docs/api/n8n-compile-openapi.yaml`.

#### generate-api-docs:generate-api-docs
**Why**: produce human-readable API docs from OpenAPI yaml — onboarding new collaborators (Matteo iter 58 brief) + Tea integration.
**Invocation**: `/generate-api-docs`.

#### tdd-workflows:tdd-cycle
**Why**: cross-compile codegen MUST be test-driven — output deterministic Arduino C++ per block. TDD prevents codegen regression (current 48 entries scratchGenerator.js could break silently).
**Action**: write test parametric AVR vs Renesas for each codegen entry before extending.

#### frontend-design (plugin frontend-design)
**Why**: Blockly UX overhaul includes visual design — icons for non-readers, color-coded categories per Morfismo palette, animations for block snap/drop. Distinct from generic frontend-developer agent.
**Invocation**: `/frontend-design`.

#### accessibility-compliance:wcag-audit-patterns
**Why**: kids 8-14 = primary user via LIM. WCAG 2.2 AA mandatory (CLAUDE.md rules 9+10): touch ≥44px + contrast 4.5:1. Blockly default not LIM-friendly out of box.
**Action**: invoke post UX changes for compliance verification.

### 🤖 Subagents — P1

#### accessibility-expert (already available `accessibility-expert:accessibility-expert`)
**Why**: Blockly UX changes need a11y review — screen reader compatibility for blocks (Italian aria-label), keyboard navigation, touch target sizing, contrast on LIM projection.
**Invocation**: parallel with frontend-developer Coder phase.

#### test-automator (already available `application-performance:test-automator` + others)
**Why**: cross-compile + UX overhaul = high test surface. Need parametric codegen tests + Playwright Blockly drag-drop E2E + visual regression screenshots for Blockly canvas.
**Invocation**: Tester phase post-Coder.

#### code-reviewer (multiple options: `code-review:code-review` standard, `coderabbit:code-review` AI-powered)
**Why**: Blockly area touches simulator engine boundary — review for accidental AVR coupling, codegen determinism, no leaked board-specific logic into UI components.
**Invocation**: post-Coder pre-merge.

### ⚡ Hooks — P1

#### PostToolUse Edit src/data/lesson-paths/*.json → node scripts/epic1/validate-lesson-paths.mjs
**Why**: Blockly UX overhaul will touch lesson-paths to add per-experiment block context filtering. Auto-validate on each edit catches reference integrity breakage iter 57 guard added.
**Where**: `.claude/settings.json` PostToolUse Edit hook.

#### Stop Hook (session end) → bash scripts/dev/codex-bg.sh "session-summary-verify" --profile verify "<diff summary + claims>"
**Why**: codify Pattern C-V at session end — Codex verifies session claims against actual diff before close audit. iter 58 Codex BG verify worked great manually; bake into hook.
**Where**: `.claude/settings.json` Stop hook.

---

## P2 — Nice-to-have (defer iter 60+)

### 🔌 MCP Servers — P2

#### Macos MCP / computer-use MCP (already available)
**Why**: capture Blockly UI screenshots on real desktop + drive Arduino IDE for cross-compile verification. iter 58 Codex feasibility verdict said SKIP live-terminal — same logic applies here for now. Reserve for "test full kit upload" workflow iter 60+.

### 🎯 Skills — P2

#### plugin-dev:create-plugin (`plugin-dev` plugin)
**Why**: package ELAB-specific Blockly block library + Arduino Renesas codegen as reusable plugin. Long-term: open-source the block library for Italian schools. Not P0 — internal monolith works for iter 59-65.

#### superpowers:writing-plans + executing-plans
**Why**: structured plan + execute workflow with checkpoints. Useful for multi-iter workstreams (Blockly UX overhaul = 6-10h scope, multi-iter). Already de facto used iter 58 (handoff format).

#### anthropic-skills:slack-gif-creator + meigen-ai-design:gen
**Why**: produce GIF demos of Blockly UX before/after for Andrea + Tea + Matteo review. Lightweight visual artifact.

### 🤖 Subagents — P2

#### security-auditor (`backend-api-security:backend-security-coder` + `security-scanning:security-auditor`)
**Why**: n8n.srv1022317.hstgr.cloud/compile endpoint receives user code → compiles. Threat model: arbitrary code execution. Verify n8n sandbox + rate limiting + no credential leak in build logs.
**Invocation**: post-cross-compile API extension iter 60+.

#### performance-engineer (`application-performance:performance-engineer`)
**Why**: Blockly with 23+ custom blocks + 48 codegen entries could become slow on LIM hardware (older Chromebooks/Win laptops). Profile drag latency + block search + workspace save.
**Invocation**: post UX overhaul iter 60.

### 🔌 Plugins — P2

#### agent-teams:team-spawn
**Why**: replace ad-hoc subagent spawning with structured team presets (review/debug/feature). Useful for iter 59+ when multi-agent becomes routine.

---

## Codex workflow refinement (Andrea iter 59 mandate)

Per Andrea "Usa codex anche per questo, affina il workflow con codex":

### Standard prompt template (codify iter 59)

```
GOAL: <one-sentence verifiable outcome>
CONTEXT: @file paths + iter context (1-3 lines)
CONSTRAINTS:
  - Do NOT read any SKILL.md or skill files.
  - Cite file:line for every claim.
  - Run EXACTLY these commands: <numbered list>
  - Cap output <N> lines.
DONE: <N>-section verdict structure (numbered + line cap per section)
```

### Anti-failure-mode guards baked into every prompt

- `Do NOT read any SKILL.md or skill files` (iter 57 Codex burned runs)
- `node -e "..."` one-liners only, NO heredocs (sandbox blocks)
- `rg -n PATTERN PATH` explicit paths (Codex ignores restrictions otherwise)
- Wait-loop anchor: `tokens used` line, NOT `CONFIRM/REFUTE` (echo matches prompt)

### Pattern matrix iter 59+

| Pattern | When | Example iter 58 |
|---|---|---|
| **C-V** (Claude leads, Codex verifies) | DEFAULT — every commit, every claim | iter 58 Phase 1 diff verify (3/3 CONFIRM) |
| **V-C** (Codex leads recon, Claude executes) | Exhaustive enumeration (grep-dump useful) | iter 57 recon dangling-ref enumeration |
| **C-C-V** (Claude proposes + self-critiques + Codex arbitrates) | High-stakes design decision | iter 59 architect-review Nano R4 codegen architecture (planned) |

### Reusable Codex prompts library (proposed iter 59 P1)

Create `scripts/dev/codex-prompts/` with:
- `verify-lesson-path-edit.txt` (parametric)
- `verify-codegen-output.txt` (parametric AVR vs Renesas)
- `verify-anti-regression.txt` (post-commit pre-push gate)
- `verify-morfismo-compliance.txt` (palette + ToolSpec + lesson-paths)

Each parametric via env vars or sed substitution.

---

## Summary

**Total recommendations**: 27 (P0=8 + P1=11 + P2=8).

**Critical path iter 59 entrance**:
1. `/write-spec` PRD for Blockly cross-compile + UX overhaul
2. Codex BG re-verify current scratchGenerator output (running)
3. `/ultrathink:ultrathink` coordinator spawn 4-agent
4. `/openapi-spec-generation` n8n compile endpoint
5. `/generate-api-docs` human-readable API docs
6. Andrea triggers `/ultrareview` (user-billed, Claude cannot launch — must be Andrea)

**Want more?** Ask for additional recommendations for any specific category. 

**Want help implementing any of these?** Specify which P0/P1/P2 to bootstrap first.
