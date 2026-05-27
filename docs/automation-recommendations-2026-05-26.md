# Claude Code Automation Recommendations — ELAB Tutor (2026-05-26)

> Output of `/claude-automation-recommender` invoked as part of `/goal` for iter X.3b session.

## Codebase Profile

- **Type**: React 19 + Vite 7 web app (PWA + Vercel deploy)
- **Stack**: Vitest + Playwright + Blockly + AVR8js (custom Arduino emulation) + Supabase Edge Functions + UNLIM AI
- **Test surface**: 16,000+ unit tests (vitest) + 54 Playwright E2E specs + custom OpenClaw test config
- **Existing Claude Code automation maturity**: **HIGH** — 10 subagents, 10 GitHub Actions workflows, 5+ PreToolUse hooks, custom skills (elab-quality-gate, elab-onnipotenza-coverage, galileo-brain-training, ricerca-* family)
- **Goal**: incremental gaps, not greenfield

---

## Top 1-2 Recommendations Per Category

### 🔌 MCP Servers

#### 1. Playwright MCP (already invoked via plugin) — formalize for E2E authoring loop

**Why**: 54 Playwright specs exist + 11 FIXME markers from Wave 1b Impl-G-2 (08-esp4 + 09-esp5 + 10-homepage upstream wait). MCP enables iterative spec authoring with live browser feedback instead of edit-run-fail cycles. Already loaded as `mcp__plugin_playwright_playwright__*` tools.

**Action**: nothing new to install. Document the existing capability in CLAUDE.md so future agents know to reach for browser_snapshot + browser_evaluate when iterating on E2E specs. Add a slash-skill `/e2e-fix-flaky` that wraps the iterate loop.

#### 2. Supabase MCP — schema migration safety

**Why**: Supabase Edge Functions deployed regularly (`SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy`). 8 tables (`openclaw_tool_memory`, `together_audit_log` migrations not yet applied per CLAUDE.md). MCP server lets agents safely inspect schema, dry-run migrations, query RLS posture.

**Action**: install via `claude mcp add supabase-mcp` (community server). Validates RLS pre-deploy + queries chunk/embedding tables without exposing service role key in shell history.

---

### 🎯 Skills (custom, project-scoped)

#### 1. `wave-atom-dispatcher` (NEW) — codify the 4-atom parallel pattern

**Why**: Wave 1+1b+2+2b have all used the same pattern: file ownership matrix lock → TDD red → green → CoV 3× → atomic commit. Currently re-explained every iter in prompt docs. A skill captures the discipline as a single invocation.

**Create**: `.claude/skills/wave-atom-dispatcher/SKILL.md`
**Invocation**: User-only (since it triggers parallel Task calls)
**Frontmatter**:
```yaml
---
name: wave-atom-dispatcher
description: Dispatch a Wave atom team with file ownership lock + TDD red-green + CoV 3× discipline. Use when starting a new Blockly Wave iteration (Wave 2b, Wave 3, X.4, X.5, etc.) with 2-4 parallel implementer atoms.
disable-model-invocation: true
---
```
Body: condensed version of Wave 2 X.3b prompt skeleton + AskUserQuestion for scope + dispatch loop + close synth gates.

#### 2. `cov-3x-verifier` (NEW) — enforce lead-direct global CoV pattern

**Why**: Wave 2 X.3 lesson learned (per X.3b prompt anti-patterns): subagent self-reported test counts may miss global state failures. Lead must lead-direct global vitest CoV 3× before close synthesis. Encode as skill so it cannot be skipped.

**Create**: `.claude/skills/cov-3x-verifier/SKILL.md`
**Invocation**: Both (Claude auto-invokes pre-close, user `/cov-3x` manually)
**Action**: runs `npx vitest run` 3 times consecutive, compares output, flags any delta or flaky test, refuses success claim until 3× IDENTICAL.

---

### ⚡ Hooks

#### 1. Expand `PreToolUse` revert-protected list to include Wave 2 X.3 ships

**Why**: Current PreToolUse Edit|Write hook blocks `CircuitSolver.js`, `AVRBridge.js`, `avrWorker.js`, `SimulationManager.js`, `pinComponentMap.js`, `orchestrator.py`. Wave 2 X.3 added 2 newly-revert-protected files per X.3b ownership matrix:
- `src/services/uploadAgent.js` (Wave 2 X.3 ship)
- `src/data/experiments-vol3.js` (Wave 2 X.3 ship — Vol3 audit closed)

Without hook protection, future agents can accidentally edit these and violate ownership. The hook is the structural guardrail; documentation alone isn't enough.

**Action**: edit `.claude/settings.json` to append to existing case statement:
```jsonc
// in existing PreToolUse Edit|Write hook
*/uploadAgent.js|*/experiments-vol3.js)
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"BLOCCATO: file Wave 2 X.3 SHIPPED revert-protected. Estendi via injection prop (vedi impl-wire-compileupload agent)."}}';;
```

#### 2. Add `PostToolUse` `npx vitest run --changed` quick gate

**Why**: Catch breakage immediately at the Edit/Write site instead of letting it propagate to commit time. Existing Stop hook runs full `npm run build` but no incremental vitest. With 16k+ tests, full vitest is too slow for PostToolUse; `--changed` is fast (sub-30s typical).

**Action**: append to `.claude/settings.json` hooks:
```jsonc
{
  "matcher": "Edit|Write",
  "hooks": [{
    "type": "command",
    "command": "cd \"$CLAUDE_PROJECT_DIR\" && timeout 45 npx vitest run --changed --reporter=dot 2>&1 | tail -3 || echo 'WARN: changed-vitest exited non-zero, continue'",
    "timeout": 60
  }]
}
```

---

### 🤖 Subagents

#### 1. `codex-stop-time-reviewer` (NEW) — codify Wave 1b/2/2b Codex review pattern

**Why**: Wave 1b Codex caught 2 bugs (arduino_rgb_led missing generator + BUTTON_LED_XML ELSE branch). Wave 2 X.3 also benefited from external review. Pattern is repeated but not codified as subagent. Codifying ensures every wave triggers it deterministically.

**Create**: `.claude/agents/codex-stop-time-reviewer.md`
**Invocation**: Lead invokes pre-close synth on each wave commit
**Tools**: `["Read", "Grep", "Glob", "Bash"]` (read-only)
**Model**: `opus`

#### 2. `lead-direct-cov-runner` (NEW) — owns the lead-direct global vitest 3× pattern

**Why**: Same anti-pattern lesson as the skill above, but more aggressive: a dedicated subagent that the lead delegates to for CoV 3× regardless of subagent self-reports. Lives separate so its output is independently verifiable.

**Create**: `.claude/agents/lead-direct-cov-runner.md`
**Tools**: `["Bash", "Read"]`

---

### 🔌 Plugin Recommendations

ELAB already uses heavily: `superpowers`, `agent-teams`, `claude-mem`, `caveman`, `coderabbit`, `codex`, multiple impeccable/vercel/sentry/posthog plugins.

**One gap worth installing**: `agent-sdk-dev:agent-sdk-verifier-py` IF you start using the Python orchestrator referenced in `orchestrator.py` (hook already protects it). The verifier ensures the Python Agent SDK app is correctly configured before deployment.

**Action**: low priority unless Python orchestrator becomes active.

---

## What I deliberately did NOT recommend

- **More general subagents** — already at 10 + 4 new from Wave 2b = 14. Diminishing returns; specialized atom agents (like the 4 created this session) are higher value.
- **More skills** — already has ~30+ skills. Adding more increases discovery cost.
- **More hooks** — already has 5+ active hooks. Adding too many slows tool calls (each hook has timeout overhead).
- **MCP servers for tools you don't use** (GitHub MCP, Linear MCP, Slack MCP, etc.) — irrelevant to current workflow.

---

## Next-step priority order (if Andrea wants to act on these)

1. **HIGH**: expand PreToolUse hook to protect `uploadAgent.js` + `experiments-vol3.js` (5min, prevents Wave 2b regressions)
2. **HIGH**: create `cov-3x-verifier` skill (15min, prevents inflation bug from Wave 2 X.3 lesson)
3. **MEDIUM**: create `codex-stop-time-reviewer` subagent (10min, codifies existing pattern)
4. **MEDIUM**: install Supabase MCP (10min, schema safety pre-deploy)
5. **LOW**: `wave-atom-dispatcher` skill (30min, optional convenience wrap)
6. **LOW**: PostToolUse `--changed` vitest (10min, depends if Andrea tolerates extra 30s per Edit)

---

**Generated**: 2026-05-26 by `/claude-automation-recommender` invoked under `/goal` for iter X.3b session prep. Read-only analysis — no files modified outside this report.
