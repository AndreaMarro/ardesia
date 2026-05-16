# Iter 71 Entrance — Codex Pattern V iter63 ELAB Agent Status Findings

**Date**: 2026-05-16 PM (Codex GPT-5.5 high single sequential dispatch ~2min 1.78MB output)
**Methodology**: Codex Pattern V (read-only sandbox + file:line citations) — `scripts/dev/codex-bg.sh verify-iter63-elab-agent-status-iter71 --profile verify`
**Status**: ✅ COMPLETE (alive=0 size=1782033 bytes)
**HEAD verified**: `3e94fcf7` (iter 70 FINAL close + iter 71-C TEAM C merged)

## 🚨 CRITICAL FINDING: Port mismatch bug

**Iter 71 P0 BUG**: 3-file port disagreement = browser NEVER detects agent + uploads fail.

| File | Port | Purpose |
|---|---|---|
| `src/services/compileAgentDetect.js:28` | `localhost:17852` | Browser detection probe |
| `src/services/elab-agent/http-server.js:55` | `8765` (default) | Express agent listen |
| `src/components/lavagna/CompileUploadButton.jsx:51` | `8765` | Upload POST |

**Impact**: R4 banner shows "Agent not detected" (wrong port probe) even when agent running. R5 banner shows offline state. Upload button posts to right port but user never sees compile/upload option because banner says "install agent first".

**Iter 71 P0 fix** (~30min orchestrator inline):
1. Pick canonical port (suggest `8765` matching agent default + button)
2. Update `compileAgentDetect.js:28` `17852` → `8765`
3. Verify R4 detect works + R5 banner shows online state
4. Add unit test enforcing canonical port constant

## ELAB Agent shipped status iter 70 + 71-C

### Handlers (server.js + http-server.js)

| Handler | File | Status |
|---|---|---|
| `handleCompile` | `server.js:?` | ✅ Shipped iter 63 (uses arduino-cli compile + --build-path) |
| `handleUpload` | `server.js:?` (line 288) | ⚠️ Caveat "real upload defer hardware UAT" line 283 |
| `handleCompileAndUpload` | `http-server.js:142` | ✅ Shipped iter 70 (NOT in server.js as iter 67 PHASE 5 had assumed) |
| `handleJobsStatus` | `http-server.js:209` | ✅ Shipped iter 70 |
| Express routes binding | `http-server.js:333+366+408+439` | ✅ All 6 endpoints wired |
| Board profile loader | `sketch-builder.js:40` | ✅ Resolves `src/boards/${boardId}.json` |
| Forbidden AVR patterns validator | `vol3-experiments-pipeline.js:135` | ✅ TEAM C iter 71-C |
| 7 error categories | `error-translator.js:7+44+238+324` | ✅ TEAM C iter 71-C (translateArduinoCliError + 7 categories + sub-hints) |

### Vol3 templates registry

- `VOL3_TEMPLATES` contains ONLY `v3-cap5-esp1` (1 / 14 esperimenti) — `vol3-experiments-pipeline.js:59`
- Scope says rest iter 72+ — `vol3-experiments-pipeline.js:17`
- Explicit caveat NO runtime arduino-cli test + NO hardware UAT — `vol3-experiments-pipeline.js:20`

### Error translator 7 categories ✅ shipped

`arduino_cli_absent`, `core_missing`, `board_missing`, `port_missing`, `compile_failed`, `upload_failed`, `permission_denied` + `unknown` fallback — `error-translator.js:7+44`.

## 4 Missing for true E2E UAT (Iter 72 P0)

### 1. Blockly NOT emit SketchBuilder intentions

- `scratchGenerator.js:5+37+489` returns raw Arduino C++ strings
- Should emit structured SketchBuilder intentions per iter 63 spec
- Architectural gap — Blockly→C++ direct path bypasses board profile validation
- Effort iter 72: ~3-4h refactor Blockly generator → SketchBuilder intent emit

### 2. Scratch compile UI doesn't pass physical upload props

- `ScratchCompileBar.jsx:106` renders `CompileUploadButton` only when `sketchCode` provided
- Current usage `NewElabSimulator.jsx:1020` passes ONLY compile status/error, NOT `sketchCode`
- Effort iter 72: ~1h wire `sketchCode={scratchGeneratedCode}` + `boardId="arduino-nano-r4"` + selected `port`

### 3. Port mismatch (see 🚨 CRITICAL FINDING above)

### 4. Existing compile flow targets AVR by default

- `api.js:60` allows only AVR Nano old bootloader + Uno (NOT Renesas RA4M1 Nano R4)
- `api.js:1293` sanitizes unsupported boards back to default (silently drops Nano R4 selection!)
- Effort iter 72: ~1h add Nano R4 board ID to approved list + remove sanitization for Renesas

## Iter 72-73 atomization scope (Codex recommendation)

### Iter 72 — Close software chain (~4-5h)

- A1 P0 Port unify canonical (30min orchestrator inline)
- A2 P0 Wire NewElabSimulator → ScratchCompileBar `sketchCode/boardId/port` (1h)
- A3 P1 Add `/boards` consumption UI Nano R4 port selection (1h)
- A4 P1 api.js add Nano R4 to approved board list (1h)
- A5 P2 Blockly → SketchBuilder intent emit refactor (3-4h subagent BG OR defer iter 73+)

### Iter 73 — Hardware UAT + hardening (~3-4h Andrea + Tea Strambino)

- Real Nano R4 USB hardware test Blockly Blink → /compile-and-upload → arduino-cli + dfu-util
- Capture pass/fail evidence: /health, /boards, /compile, /upload, /compile-and-upload, /jobs/:id/status (6 endpoints)
- Verify 7 translator categories real stderr OR fixture
- Expand VOL3_TEMPLATES beyond v3-cap5-esp1 ONLY after single hardware path PASS

## Honesty caveats

1. **🚨 PORT MISMATCH P0 BUG iter 71** — current iter 71-C TEAM C deliverables LIVE mainwt but **integration broken**: browser never detects agent due to wrong port probe. Fix iter 71 P0 30min orchestrator inline.
2. **Blockly bypasses SketchBuilder architectural gap** — 3-4h refactor iter 72-73 OR Sprint V+ if scope too large
3. **api.js Nano R4 NOT in approved board list** — silently dropped selection. iter 72 P0 fix add to whitelist.
4. **Hardware UAT impossible from orchestrator** — Andrea + Tea Strambino kit Omaric required iter 73.
5. **VOL3_TEMPLATES = 1/14 esperimenti** — full 14 expansion gated on iter 73 hardware UAT pass per Codex recommendation (correct discipline).

## Files refs

- ELAB Agent core: `src/services/elab-agent/{server.js,http-server.js,sketch-builder.js,vol3-experiments-pipeline.js,error-translator.js}`
- R4 detect: `src/services/compileAgentDetect.js`
- R5 banner: `src/components/HomePage/CompileAgentBanner.jsx` (iter 66 2f7d7611)
- Upload button: `src/components/lavagna/CompileUploadButton.jsx` (iter 70 5be2bfd6)
- Scratch UI: `src/components/simulator/panels/{ScratchCompileBar.jsx,scratchGenerator.js}`
- Simulator shell: `src/components/simulator/NewElabSimulator.jsx`
- API service: `src/services/api.js`
- Codex Pattern V raw output: `/tmp/codex-verify-iter63-elab-agent-status-iter71.txt` (1.78MB final 2026-05-16T20:41)
- Iter 71 detailed plan Task 12 + 72 cross-link: `docs/plans/2026-05-16-iter-71-DETAILED-PLAN.md:Task 12` (UAT preparation defer iter 72-73)

## Iter 71 P0 NEW atom from Codex iter63 finding

**Atom B-NEW PORT-UNIFY (P0 orchestrator inline 30min)**:

```bash
# 1. Read current ports
grep -n "17852\|8765" src/services/compileAgentDetect.js src/services/elab-agent/http-server.js src/components/lavagna/CompileUploadButton.jsx

# 2. Fix compileAgentDetect.js
# OLD: const AGENT_PORT = 17852;
# NEW: const AGENT_PORT = 8765;

# 3. Add canonical constant + import all 3 files
# scripts/agents/agent-port-canonical.js exports AGENT_PORT = 8765;

# 4. Vitest delta scope verify
npx vitest run tests/unit/compileAgentDetect tests/unit/CompileUploadButton --reporter=basic

# 5. Build + commit
npm run build && git add -A && git commit -m "fix(iter-71-PORT): unify agent port 8765 canonical across 3 files (browser detect + Express + upload button)"
```

**Iter 71 entrance gate**: this audit READY for Atom B-NEW PORT-UNIFY dispatch immediate iter 71 entrance (highest priority bug, blocking E2E UAT).
