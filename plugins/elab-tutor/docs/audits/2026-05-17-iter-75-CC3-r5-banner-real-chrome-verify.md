# Iter 75 TRACK CC-3 — R5 banner real Chrome verify audit

**Date**: 2026-05-17 PM iter 75 cross-compile sprint
**Spec**: `docs/specs/2026-05-17-iter-75-cross-compile-nano-r4-CERTAINTY-master-spec.md` §G6 + AC-5

## Verifica empirica

### Setup pre-test

- ELAB Compile Agent localhost:8765 PID alive `/health` 200 OK (curl direct verified)
- Vite dev server localhost:5173 started via preview_start
- HomePage `#compile-home` route mounts HomeCompileEntry (data-testid present verified)

### Test Playwright preview sandbox (preview_eval)

```js
fetch('http://localhost:8765/health', {
  method: 'GET', mode: 'cors', credentials: 'omit',
  headers: { 'x-elab-probe': '1' }
})
```

**Result**: `TypeError: Failed to fetch`

Banner state: `"Carica codice direttamente su Nano R4. Installa l'Agent ELAB sul Mac per programmare la scheda dal browser. Installa Agent ELAB (Mac)"` = installation prompt state (NOT detected).

### Test direct curl (terminal)

```bash
curl -i -H "Origin: http://localhost:5173" http://localhost:8765/health
```

**Result**:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Allow-Methods: GET,POST,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,X-Elab-Probe
Access-Control-Max-Age: 600
Content-Type: application/json; charset=utf-8

{"agent":"elab-compile-upload","arduino_cli_version":"1.4.1","core_renesas_uno_installed":true,"core_count":2,...}
```

✅ CORS headers correctly returned MA Playwright sandbox blocks fetch nonetheless.

### Test Control_Chrome real browser

```
mcp__Control_Chrome__open_url → "Opened http://localhost:5173/#compile-home in Chrome"
mcp__Control_Chrome__execute_javascript → "Error: Google Chrome is not running. Please launch Chrome and try again."
```

**Result**: Chrome NOT launched. Control_Chrome MCP requires Chrome already running (open_url launched in default browser MA execute_javascript needs Chrome process alive). Cannot complete real browser verify automated.

## Root cause + decision

**Root cause**: Playwright headless sandbox isolates network — loopback connections blocked OR DNS resolver different. NOT production bug — real user Chrome on Mac WILL reach `localhost:8765` correctly.

**Confirmation method (manual Andrea)**:
1. Open Chrome.app manually
2. Navigate `http://localhost:5173/#compile-home`
3. Open DevTools Console
4. Run `fetch('http://localhost:8765/health').then(r => r.json()).then(console.log)`
5. Expected: `{agent: 'elab-compile-upload', arduino_cli_version: '1.4.1', core_renesas_uno_installed: true, ...}`
6. Expected R5 banner: "Agent rilevato" green state (NOT "Installa Agent")

## Decision iter 75 CC-3

**NON modificare ELAB Agent bind** (mantieni `127.0.0.1` per Codex iter 74 security #3).

**Andrea manual verification required**: real Chrome OR Safari test. Document AC-5 status:

- ⏸ AC-5 BLOCKED Andrea manual test real Chrome (~5min Andrea action post-iter-75-CC-1 merge for auth token wire)
- Workaround: skip Playwright preview iter 75+, rely su Andrea OR Codex iter 75+ Pattern V real browser stress test (control_chrome con Chrome already running)

## Iter 75-76+ recommendations

1. **Iter 75 close**: document CC-3 audit + flag Andrea manual real Chrome test
2. **Iter 76 P0**: Andrea ratify Chrome launch protocol per future Control_Chrome integration:
   - Open Chrome.app PRE-dispatch Control_Chrome commands
   - OR alternative: use Computer Use MCP (`mcp__computer-use__open_application`) to launch Chrome programmatically
3. **Iter 76+ E2E CI**: Playwright headed mode (NOT headless) for cross-compile network tests

## Honesty caveats

1. CC-3 acceptance criterion AC-5 NOT verified iter 75 (real Chrome manual test deferred Andrea)
2. Playwright sandbox issue confirmed empirical 2 iter consecutive (iter 73 CC-2 + iter 75 CC-3)
3. Production behavior assumed correct based on CORS curl + real Chrome fetch standard behavior — NOT empirical verified iter 75
4. Control_Chrome MCP integration requires Chrome already running — automation limitation noted
5. If R5 banner FAIL real Chrome too → iter 76 P0 diagnose deeper (potential URL/protocol/timing issue with fetch wrapper compileAgentDetect.js)

## Cross-link

- compileAgentDetect.js fetch logic: `src/services/compileAgentDetect.js`
- R5 banner: `src/components/HomePage/CompileAgentBanner.jsx` (iter 66)
- ELAB Agent http-server CORS: `src/services/elab-agent/http-server.js`
- iter 73 PHASE 6 first sandbox limitation finding: `docs/audits/2026-05-16-iter-67-PHASE6-1000q-matrix-regression-diagnosis.md`
- iter 75 SPEC §G6 SECURITY: `docs/specs/2026-05-17-iter-75-cross-compile-nano-r4-CERTAINTY-master-spec.md`
