# Wave 2 X.3b Parallel Dispatch Briefs — Ready to Fire

> Output of `/dispatching-parallel-agents` invoked under `/goal` for iter X.3b session prep. These 4 briefs are designed to be passed to 4 parallel `Agent` tool calls in a single message AFTER PR #169 merges and branch `feature/blockly-wave2-x3b` is created from main.

## Pre-Dispatch Gates (MUST PASS in order)

1. **PR #169 admin-merged** by Andrea (CI red iter 102+ pre-existing, per R4 ratify admin-merge continues)
2. **Branch sync**: `git fetch origin && git checkout main && git pull && git checkout -b feature/blockly-wave2-x3b`
3. **Clean tree**: `git status --short` shows nothing
4. **Baseline confirmed**: `npx vitest run 2>&1 | tail -3` shows `3 failed | 428 passed | 2 skipped (433)` Wave 2 X.3 baseline preserved
5. **Build clean**: `npm run build` exit 0
6. **Impl-F phantom file resolution**: Andrea ratifies Option A/B/C/D (see `.claude/agents/impl-f-unlim-vol3.md` File Ownership section — `PassoPassoUnifiedPanel.jsx` does NOT exist; X.3b prompt assumed phantom)
7. **Codex stop-time review on Wave 2 X.3 commits 26280ff0 + 0e533b41**: optional but recommended pre-X.3b given Wave 1b lesson learned

---

## Brief 1 — Impl-E-UNLIM-HomePage

**Subagent type**: `general-purpose` (or the custom `impl-e-unlim-homepage` registered in `.claude/agents/`)

**Description**: Wave 2b Impl-E atom

**Prompt** (self-contained for cold-start agent):

```
You are implementing Wave 2 X.3b Impl-E atom for ELAB Tutor on branch feature/blockly-wave2-x3b (worktree PRODOTTO/elab-builder-blockly-definitivo/).

GOAL: Split src/components/home/UnlimCompileHelper.jsx (152 LOC) into:
- src/components/home/UnlimChatPanel.jsx (NEW) — floating full chat with RAG Blockly-aware + Vision wire
- src/components/home/UnlimCompileHelper.jsx (refactor to mini banner ONLY)
- tests/unit/components/home/UnlimChatPanel.test.jsx (NEW)

FILE OWNERSHIP HARD LOCK — touch ANY other file = HALT and report:
- NO touch src/components/lavagna/* (Impl-F + Impl-Wire)
- NO touch src/components/simulator/* (Impl-H + engine revert-protected)
- NO touch src/services/uploadAgent.js (Wave 2 X.3 ship READ-ONLY)
- NO touch src/data/experiments-vol3.js (Wave 2 X.3 ship READ-ONLY)
- NO touch package.json

UNLIM LANGUAGE RULES (Andrea Principio Zero non-negotiable):
- IT plurale ("Ragazzi,")
- Cita Vol/pag verbatim ("Volume 3 pag 47 — ...")
- MAX 120 parole per UNLIM response (feedback_unlim_language_rules_10may2026)
- Mai "Galileo" → solo "UNLIM"

WORKFLOW:
1. Read current UnlimCompileHelper.jsx — understand props, hooks, render shape
2. Grep "UnlimCompileHelper" across src/ — confirm safe-rename consumer pattern
3. TDD red: write tests/unit/components/home/UnlimChatPanel.test.jsx with FAILING assertions (mount + RAG keyword retrieval + Vision tag emission)
4. Run npx vitest run tests/unit/components/home/UnlimChatPanel.test.jsx — confirm RED
5. Implement UnlimChatPanel.jsx (green test 1)
6. Refactor UnlimCompileHelper.jsx to mini banner only — preserve export contract
7. Wire RAG: dynamic import('rag-chunks.json') + match Blockly block keywords from src/data/scratchBlocks.js registry
8. Wire Vision: trigger phrase "guarda il mio circuito" → window.__ELAB_API.unlim.captureScreenshot() + POST to existing Gemini Vision endpoint
9. CoV 3× on owned tests: npx vitest run tests/unit/components/home/UnlimChatPanel.test.jsx — assert 3× IDENTICAL
10. Global vitest CoV 1×: npx vitest run 2>&1 | tail -3 — assert baseline ≥ 428 passed preserved
11. Build: npm run build — assert exit 0
12. git add <3 specific files> (NEVER -A)
13. git commit -m "feat(home): split UnlimCompileHelper into UnlimChatPanel + mini banner — Wave 2b Impl-E ..."

OUTPUT FORMAT (mandatory — return this verbatim shape):

ATOM: Impl-E-UNLIM-HomePage
FILES CHANGED: <list with LOC>
OWNERSHIP CHECK: ONLY 3 owned files in cached diff ✅/❌
SCOPED TEST CoV 3×: NN/NN PASS IDENTICAL ✅/❌
GLOBAL VITEST DELTA: 428→<after> passed, regression count ✅/❌
BUILD: npm run build exit code ✅/❌
COMMIT SHA: <full sha>
UNLIM RULES: <per-rule pass/fail>
ANY ISSUES: <list or "none">

If you cannot proceed (e.g. phantom file, missing dep, ownership conflict), HALT immediately and return the issue without making partial commits.
```

**Expected return**: structured ATOM report. Lead verifies before close synth.

---

## Brief 2 — Impl-F-UNLIM-Vol3 (BLOCKED until phantom file resolved)

**Status**: ⚠️ **DO NOT DISPATCH** until Andrea ratifies Option A/B/C/D for the phantom `PassoPassoUnifiedPanel.jsx` reference. See `.claude/agents/impl-f-unlim-vol3.md` File Ownership section.

**Once unblocked**, brief shape (placeholder — adapt to chosen Option):

```
You are implementing Wave 2 X.3b Impl-F atom for ELAB Tutor on branch feature/blockly-wave2-x3b.

GOAL (revised post phantom file resolution): <chosen Option A/B/C/D>
- [Option B example] Extend src/components/lavagna/LessonReader.jsx with UNLIM chat wire when mode==passo-passo
- Ship src/services/blocklyHighlightBridge.js (NEW) — workspace block.id ↔ AZIONE tag
- Extend src/data/lesson-paths/v3-cap*.json with unlim_template per step (verify next_experiment schema HAS exists first)

FILE OWNERSHIP HARD LOCK (Option-dependent):
[fill in based on Andrea ratify]

[... same workflow + output format as Brief 1, adjusted for Impl-F scope]
```

---

## Brief 3 — Impl-H-A11y-Polish

**Subagent type**: `general-purpose` (or `impl-h-a11y-polish` registered)

**Description**: Wave 2b Impl-H atom

**Prompt** (self-contained):

```
You are implementing Wave 2 X.3b Impl-H atom for ELAB Tutor on branch feature/blockly-wave2-x3b.

GOAL: Accessibility polish on Blockly mode:
1. ARIA sweep src/components/simulator/panels/scratchToolboxProgressive.js — aria-label per category + aria-expanded for collapsible sections (ARIA additions ONLY, NO logic changes — regression risk Wave 1b Impl-A merge)
2. Focus ring override on all Blockly buttons (2px high-contrast, NOT default browser outline)
3. WCAG AA contrast audit on canonical 16-cat colors (palette in scratchToolboxProgressive.js color constants) — report ratio per color
4. Add HammerIcon export to src/components/common/ElabIcons.jsx (referenced PROMPT-CROSSCOMPILATORE Sez 21, not yet exported) — SVG path matching existing ElabIcons style
5. Ship tests/e2e/11-blockly-axe-core-accessibility.spec.js (NEW) — assert 0 axe-core violations on Blockly mode route

FILE OWNERSHIP HARD LOCK:
- src/components/simulator/panels/scratchToolboxProgressive.js (ARIA ADDITIONS ONLY)
- src/components/common/ElabIcons.jsx (HammerIcon append)
- tests/e2e/11-blockly-axe-core-accessibility.spec.js (NEW)
- tests/unit/components/common/ElabIcons.test.jsx (extend with HammerIcon test)
- NO touch other implementer files
- NO touch engine/canvas files
- NO new deps in package.json (@axe-core/playwright already devDep)

WORKFLOW:
1. Read scratchToolboxProgressive.js — map categories + collapsibles
2. Read ElabIcons.jsx — confirm HammerIcon NOT yet exported, find icon style pattern (viewBox, stroke-width, currentColor)
3. Grep "scratchToolboxProgressive" usages — confirm Wave 1b Impl-A behavior preserved
4. TDD red: write E2E spec FAILING (axe-core scan Blockly mode → expect 0 violations) — run with: npx playwright test --config tests/e2e/playwright.config.js tests/e2e/11-blockly-axe-core-accessibility.spec.js
5. Add ARIA labels (green E2E test 1)
6. Override focus ring in scoped CSS module or :focus-visible selector
7. Compute WCAG contrast for each 16-cat color vs white background — target ≥ 4.5:1 text, ≥ 3:1 large. Report per color.
8. Add HammerIcon SVG path (green unit test extension)
9. E2E CoV 3× IDENTICAL on new spec
10. Global vitest baseline ≥ 428 passed preserved
11. npm run build exit 0
12. git add <4 specific files>
13. git commit -m "feat(a11y): Blockly toolbox ARIA + focus rings + HammerIcon + E2E axe — Wave 2b Impl-H ..."

OUTPUT FORMAT:
ATOM: Impl-H-A11y-Polish
FILES CHANGED: <list>
OWNERSHIP CHECK: ✅/❌
SCOPED E2E CoV 3×: ✅/❌
GLOBAL VITEST DELTA: ✅/❌
BUILD: ✅/❌
COMMIT SHA: <sha>
A11Y EVIDENCE:
- axe-core violations: 0 ✅/❌
- WCAG AA contrast 16-cat: NN/16 PASS (list failing)
- Focus ring visible: ✅/❌
- ARIA coverage: 16/16 categories ✅/❌
- HammerIcon export: ✅/❌
DEFERRED: <list with rationale>

HALT if: contrast colors fail WCAG AA → flag in commit body + create follow-up issue, DO NOT silently swap (Morfismo Sense 2 — palette canonical).
```

---

## Brief 4 — Impl-Wire-CompileUploadButton

**Subagent type**: `general-purpose` (or `impl-wire-compileupload` registered)

**Description**: Wave 2b Impl-Wire atom

**Prompt** (self-contained):

```
You are implementing Wave 2 X.3b Impl-Wire atom for ELAB Tutor on branch feature/blockly-wave2-x3b.

GOAL: Wire src/components/lavagna/CompileUploadButton.jsx (1239 LOC) to Wave 2 X.3 uploadAgent.js orchestrator using FALLBACK HOOK INJECTION pattern (Andrea R3 ratify):

1. Add uploadHexImpl prop with default `uploadHex` import from ../../services/uploadAgent.js
2. When enableDemoMode === false AND ELAB Agent fetch fails: route through uploadHex orchestrator → Web Serial fallback if available
3. Preserve existing AGENT_COMPILE_UPLOAD_URL path as PRIMARY when agent online — NO regression
4. Add FALLBACK_WEB_SERIAL state distinct from UPLOADING (state machine transparency)
5. Ship NEW dedicated wire-up test: tests/unit/components/lavagna/CompileUploadButton-uploadAgent-wire.test.jsx (separate from existing CompileUploadButton.test.jsx — DO NOT modify existing test)

FILE OWNERSHIP HARD LOCK:
- src/components/lavagna/CompileUploadButton.jsx (additive prop + state ONLY)
- tests/unit/components/lavagna/CompileUploadButton-uploadAgent-wire.test.jsx (NEW)
- NO touch src/services/uploadAgent.js (Wave 2 X.3 ship READ-ONLY — extend via injection prop)
- NO touch tests/unit/components/lavagna/CompileUploadButton.test.jsx (existing test READ-ONLY)
- NO touch other implementer files

WORKFLOW:
1. Read src/services/uploadAgent.js — understand uploadHex orchestrator API + Web Serial fallback shape
2. Read CompileUploadButton.jsx (1239 LOC, use offset/limit) — locate state machine enum + AGENT_COMPILE_UPLOAD_URL path
3. Read existing CompileUploadButton.test.jsx — understand mock pattern, ensure NEW test doesn't duplicate
4. TDD red: write CompileUploadButton-uploadAgent-wire.test.jsx with FAILING assertions:
   - Mock ELAB Agent unreachable
   - Assert uploadHexImpl called when agent down
   - Assert state transitions IDLE→COMPILING→UPLOADING→FALLBACK_WEB_SERIAL→SUCCESS/ERROR
   - Assert IT toast on Web Serial unsupported (navigator.serial undefined)
5. Run new test — confirm RED
6. Implement: add uploadHexImpl prop with default uploadHex; add FALLBACK_WEB_SERIAL to state enum; branch logic agent-down → uploadHexImpl; state transition UPLOADING → FALLBACK_WEB_SERIAL when fallback engages
7. Confirm green: new test PASS, existing CompileUploadButton.test.jsx ALSO STILL PASS (no regression primary path)
8. CoV 3× on owned new test
9. Global vitest baseline ≥ 428 passed
10. npm run build exit 0
11. git add <2 specific files>
12. git commit -m "feat(lavagna): CompileUploadButton uploadHex injection + FALLBACK_WEB_SERIAL — Wave 2b Impl-Wire ..."

OUTPUT FORMAT:
ATOM: Impl-Wire-CompileUploadButton
FILES CHANGED: <list>
OWNERSHIP CHECK: ✅/❌ (ZERO modification to uploadAgent.js or existing CompileUploadButton.test.jsx)
SCOPED CoV 3×: ✅/❌
EXISTING TEST CoV: existing CompileUploadButton.test.jsx still PASS ✅/❌
GLOBAL VITEST DELTA: ✅/❌
BUILD: ✅/❌
COMMIT SHA: <sha>
WIRE EVIDENCE:
- uploadHexImpl prop default: ✅/❌
- FALLBACK_WEB_SERIAL state added: ✅/❌
- Existing AGENT_COMPILE_UPLOAD_URL path untouched: ✅/❌
- State transitions documented in JSDoc above component: ✅/❌
- IT toast on Web Serial unsupported: ✅/❌

HALT if: navigator.serial behavior unclear in jsdom → ask before exercising real Web Serial; circular dep on uploadAgent.js import → use dynamic import().
```

---

## Single-Message Parallel Dispatch (post-merge)

After pre-dispatch gates pass + Impl-F phantom resolved, dispatch ALL 4 atoms in a SINGLE assistant message with 4 parallel `Agent` tool calls (per `superpowers:dispatching-parallel-agents` skill). Example structure:

```
Agent(description="Wave 2b Impl-E", subagent_type="general-purpose", prompt="<Brief 1 above>")
Agent(description="Wave 2b Impl-F", subagent_type="general-purpose", prompt="<Brief 2 above adapted>")
Agent(description="Wave 2b Impl-H", subagent_type="general-purpose", prompt="<Brief 3 above>")
Agent(description="Wave 2b Impl-Wire", subagent_type="general-purpose", prompt="<Brief 4 above>")
```

All 4 run concurrently. Lead waits for all returns, then:

1. Read each ATOM report
2. Verify each: ownership check + CoV 3× + global delta + build + commit SHA
3. **Lead-direct global vitest CoV 3× IDENTICAL** (Wave 2 X.3 lesson learned — do NOT trust subagent self-reports)
4. **Lead-direct npm run build × 2 consecutive**
5. Codex stop-time review on all 4 commits (recommended)
6. Close synth commit + plan doc + memory file update
7. Create PR or stack on existing

---

## Stop-Conditions (Lead aborts dispatch)

- ANY atom returns OWNERSHIP CHECK ❌ → revert that atom commit, redispatch with stricter brief
- ANY atom returns BUILD ❌ → revert that atom, debug, redispatch
- Lead-direct global vitest shows regression vs Wave 2 X.3 baseline (428 passed) → investigate delta BEFORE close synth, do NOT inflate
- Two atoms accidentally edit overlapping files → revert both, scope-reclarify, redispatch sequentially instead of parallel
- Andrea pings with new ratify or scope change → halt remaining atoms, AskUserQuestion clarify

---

**Generated**: 2026-05-26 by `/dispatching-parallel-agents` invoked under `/goal`. Briefs are deliberately self-contained (cold-start ready) per skill best practice.
