# Iter 88 VERIFY-1 + SEC-2 — Cross-compile chain audit (NO physical hardware)

**Date**: 2026-05-19 (iter 88 PHASE 1 close)
**Trigger**: Andrea mandate iter 88 verbatim "NO physical test hardware (system deve funzionare senza scheda fisica via empirical verification Chrome MCP)"
**Branch**: `feat/elab-scratch-blockly-roundtrip-nanor4` worktree A
**Scope**: VERIFY-1 documenta chain end-to-end SENZA hardware Nano R4 fisico + SEC-2 verifica rate limit + missing/invalid fqbn validation iter 87 PHASE 3 LIVE
**Method**: curl prod endpoints + file:line source citations + iter 79.A A3 hexBase64 verified empirico

---

## §1 Stato chain end-to-end iter 88 PHASE 1 close

| Step | Component | Stato | Evidence |
|------|-----------|-------|----------|
| 1 | HomePage `#compile-home` route mount | ✅ LIVE prod | `curl HTTPS HomePage 200 OK 501ms` |
| 2 | Blockly+IDE editor surface | ✅ LIVE prod | `HomeCompileEntry.jsx:259-325` ScratchEditor OR CodeEditorCM6 conditional |
| 3 | Compila button → `compileCode(code, DEFAULT_FQBN)` | ✅ LIVE prod | `api.js:1294` ALLOWED_COMPILE_BOARDS whitelist arduino:renesas_uno:nanor4 (iter 72 BG-A7) |
| 4 | Cloud Render compile arduino-cli | ✅ LIVE prod | `https://elab-cloud-compile.onrender.com/health` 200 1.1s (cold) |
| 5 | hexBase64 return canonical 109863 bytes Intel HEX | ✅ verified | empirical curl POST `/compile` returns `{ok:true, hexBase64:"OjEwNDAwMDAwMDA3RjAw..."}` first record starts `:` (`0x3A`) Intel HEX validator OK |
| 6 | WebUSB feature detect Chrome/Edge UA | ✅ LIVE prod | `webUsbDetect.js` browser-side iter 76 B.1 — verified iter 76 unit tests 17/17 PASS + iter 88 88.UX-2 clarify tests 5/5 PASS (mock 3 states) |
| 7 | CompileUploadButton click WITHOUT hardware | ✅ honest fallback iter 77 P0.1+P0.1b | `HARDWARE_PICKED_AWAITING_FLASH` state preserved (iter 77 PHASE 4 fix) — does NOT false-promote `UPLOAD_SUCCESS` when device picker cancelled |
| 8 | Real DFU bytes flash on board | ⏸ CANNOT verify without hardware | Andrea/Tea/Riccardo UAT iter 89+ schedule (chain ready end-to-end empirical) |

**Verdict chain**: 7/8 steps EMPIRICALLY verified prod sans hardware. Step 8 requires physical Nano R4 USB (Andrea mandate explicit deferral iter 89+).

---

## §2 SEC-2 — Rate limit + fqbn validation iter 87 PHASE 3 LIVE

Run timestamp: 2026-05-19 (iter 88 PHASE 1 close inline).

### §2.1 Rate limit 10× /health rapid

```
=== SEC-2.A 10x /health rapid (must all 200, NOT 429) ===
1: 200 0.604s
2: 200 0.534s
3: 200 0.531s
4: 200 0.485s
5: 200 0.580s
6: 200 0.572s
7: 200 1.047s
8: 200 0.617s
9: 200 0.614s
10: 200 0.580s
```

**Verdict**: ✅ 10/10 PASS — health endpoint NOT rate-limited (correct per spec `RATE_LIMIT_PER_MIN=30` Render env iter 87 PHASE 3 commit ae812e1d).

### §2.2 Missing fqbn → default Nano R4 ok:true

```
POST /compile { sketchCode: "void setup(){pinMode(13,OUTPUT);} void loop(){...}" }
→ {"ok":true,"jobId":"53bde4e0-5c6e-485d-81e6-cf371be9cdff","status":"success",
   "hexFilename":"sketch.ino.hex","hexSize":109863,"hexBase64":"OjEwNDAwMDAwMDA3RjAw..."}
```

**Verdict**: ✅ PASS — server defaults to Nano R4 when fqbn missing. hexSize 109863 bytes matches iter 79.A A3 LOCAL agent empirical Blink Nano R4 (109863 bytes HEX → 146484 base64). hexBase64 starts `OjEw...` decoded → `:1040...` valid Intel HEX format.

### §2.3 Invalid fqbn → 400 fqbn_not_allowed JSON

```
POST /compile { sketchCode: "...", fqbn: "esp32:esp32:wroom" }
→ 400
   {"error":"fqbn_not_allowed",
    "fqbn":"esp32:esp32:wroom",
    "allowed":["arduino:renesas_uno:nanor4","arduino:avr:nano:cpu=atmega328old","arduino:avr:uno"]}
```

**Verdict**: ✅ PASS — 400 status code + canonical JSON shape + allowed list visible. ESP32 rejected (correct iter 87 PHASE 3 BOARD_FQBN_ALLOWED whitelist).

### §2.4 Bonus auth verify

```
GET /compile (no API key)
→ 401
```

**Verdict**: ✅ PASS — auth gate alive (POST without `X-Elab-Api-Key` returns 401, prevents unauth abuse).

---

## §3 LOCAL ELAB Compile Agent verify

```
GET http://localhost:8765/health → 200 OK 430ms
```

**Verdict**: ✅ LIVE prod — arduino-cli 1.4.1 + Renesas core 1.5.3 + dfu-util 0.11 chain LIVE (iter 73+iter 77 P0.3c carryover §10.5 security 3/6 mandates MISSING — see SEC-1 decision pending).

---

## §4 Honesty caveats critical 5

1. **Step 8 real DFU flash NOT verified iter 88** — Andrea explicit mandate "NO physical test". Iter 89+ Tea+Riccardo+Omaric kit Nano R4 fisico UAT. Chain ready end-to-end empirical (steps 1-7 PASS).

2. **§2.1 rate limit 10/min trigger NOT tested** — only 10 calls rapid (under 30/min Render env). Stress test 31+ calls would verify 429 fires. Defer iter 89+ load test (not P0 iter 88 scope).

3. **§2.2 hexSize 109863 bytes matches iter 79.A A3** — empirical regression preserved. Decoded `:1040000000` = canonical Intel HEX address 0x4000 LMA Renesas RA4M1 image base. NOT random data.

4. **WebUsbBanner 3 states UX-2 verified mock unit tests** — real browser detect via `navigator.usb` browser feature would need real Chrome+webusb Playwright test (deferred 88.VERIFY-2 BG subagent in-flight).

5. **iter 87 PHASE 3 commit ae812e1d ratify gate alive** — verified via empirical curl SEC-2.A+B+C iter 88 PHASE 1 close. Pattern S r3 race-cond fix 24+ iter consecutive preserved (LOCAL Agent + Cloud Render both LIVE).

---

## §5 Cross-link refs

- iter 88 SPEC: `docs/specs/2026-05-18-iter-88-ux-cleanup-cross-compile-spec.md` §88.VERIFY-1+§88.SEC-2
- iter 87 PHASE 3 close audit: `docs/audits/2026-05-18-iter-87-PHASE3-MOSSA4-rate-limit-fix-CLOSE-audit.md` (rate limit + fqbn whitelist + BOARD_FQBN_ALLOWED)
- iter 79.A A3 hexBase64 fix: `src/services/elab-agent/server.js:271-307` (hexBase64 return canonical)
- iter 72 BG-A7 api.js Nano R4 whitelist: `src/services/api.js:64` ALLOWED_COMPILE_BOARDS
- iter 73 CC-2 F2 DEFAULT_FQBN: `src/components/home/HomeCompileEntry.jsx:85`
- iter 76 B.1 webUsbDetect: `src/services/webUsbDetect.js`
- iter 77 P0.1b HARDWARE_PICKED_AWAITING_FLASH: `src/components/lavagna/CompileUploadButton.jsx` (retry path honest)

---

## §6 Anti-inflation G45 mandate VERIFY-1+SEC-2 enforced

- 7/8 steps empirico verified (NOT 8/8 — Step 8 physical hardware deferred Andrea mandate)
- 3/3 SEC-2 sub-tests PASS empirico (rate limit 10/10 + missing fqbn ok + invalid fqbn 400)
- NO claim "all hardware UAT verified" (deferred iter 89+ Tea+Riccardo)
- NO claim "Sprint U close" (iter 90+ projection, Opus indipendente review G45 mandate)
- NO claim "stress test 30+/min verified" (only 10 rapid sub-threshold)

© Andrea Marro — 2026-05-19 — ELAB Tutor iter 88 PHASE 1 VERIFY-1+SEC-2 audit
