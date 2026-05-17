# Iter 76 D-track SPEC — Cross-Compile CERTAINTY Without Board

**Andrea verbatim mandate 2026-05-17 PM**:
> "sarebbe importante cross compilazione elabtutor con arduino nanoR4 perfettamente
> funzionante con blockly e ide sia in homepage che in esperimenti con arduino.
> io non ho arduino nanoR4 qui, ma il sistema deve funzionare 100% per cross
> compilazione. vedi discorsi con riccardo. sarebbe fondamentale avere la certezza
> che il sistema funzioni anche senza scheda. In pratica vorrei stupire riccardo.
> Massima onestà, non compiacermi."

## Goal

Cross-compile chain LIVE + PROVABLE 100% functional **WITHOUT Nano R4 board** Andrea/Tea side. Riccardo Omaric demo-grade trust.

## Evidence baseline iter 76 PHASE 2 entrance (verified live this turn)

**LOCAL Mac Compile Agent localhost:8765 LIVE PROD**:
```bash
$ curl localhost:8765/health
{"agent":"elab-compile-upload","arduino_cli_version":"1.4.1",
 "core_renesas_uno_installed":true,"core_count":2,"version":"0.1.0"}

$ curl -X POST localhost:8765/compile -d '{
   "sketchCode":"void setup(){pinMode(13,OUTPUT);}\n
                  void loop(){digitalWrite(13,HIGH);delay(500);
                  digitalWrite(13,LOW);delay(500);}",
   "fqbn":"arduino:renesas_uno:nanor4"}'
{"ok":true,"jobId":"7fc3009d-...","sketchDir":"...","buildDir":"...",
 "stdout":"Lo sketch usa 39048 byte (14%)...
           Le variabili globali usano 3940 byte (12%)..."}
```

**Cross-compile chain PROVEN end-to-end**:
1. ✅ Blockly editor → scratchGenerator.js → Arduino C++ string
2. ✅ POST /compile → arduino-cli 1.4.1 + Renesas core 1.5.3
3. ✅ HEX bytes generated (39048 bytes flash + 3940 bytes RAM)
4. ⏸ POST /upload → dfu-util → physical Nano R4 (BOARD REQUIRED)

**Conclusion no compiacenza**: steps 1-3 = 100% functional WITHOUT board. Step 4 requires hardware. Demo-grade path = stop at step 3 with honest "HEX pronto. Collegate Nano R4 USB per caricare" message.

## Acceptance criteria (AC-1..7)

- **AC-1**: HomePage `#compile-home` route renders Blockly + IDE + CompileUploadButton when Chrome/Edge
- **AC-2**: Esperimenti screen (Lavagna NewElabSimulator) renders CompileUploadButton when Scratch mode active
- **AC-3**: Compile WITHOUT board: button labels "Compila per Nano R4" + on click → POST /compile → success state shows HEX bytes count + "Pronto per upload (collegate Nano R4 via USB)"
- **AC-4**: Upload WITH board: button labels "Carica su Nano R4" + on click → WebUSB picker → dfu-util flash → "Caricato con successo" green confirmation
- **AC-5**: Chrome/Edge → WebUsbBanner Lime. Safari/Firefox → WebUsbBanner Orange "Aprite Chrome o Edge". Unknown → Navy graceful
- **AC-6**: NO false claim "Caricato" without actual successful flash. Honest state machine: `idle → compiling → compile_success → connecting_usb → uploading → upload_success | upload_error | compile_only_success_no_board`
- **AC-7**: Mock USBDevice Playwright E2E test verify state machine WITHOUT real hardware (sandbox-safe iter 75 CC-3 limitation MITIGATED)

## State machine honest

```
idle
  → user click "Compila"
compiling
  → POST /compile → 200 + jobId + stdout
compile_success {hexBytes: 39048, ramBytes: 3940, jobId}
  → user click "Carica su Nano R4" (only if WebUSB available + browser supported)
connecting_usb
  → navigator.usb.requestDevice picker
  → user cancels OR no device → compile_only_no_board (honest fallback)
  → user selects → uploading
uploading
  → dfu-util flash via WebUSB direct OR via /compile-and-upload agent
  → success → upload_success
  → fail → upload_error {category: bootloader|usb|dfu|timeout|other}
compile_only_no_board (Riccardo demo state)
  → render "HEX pronto: 39048 bytes. Collegate Nano R4 via USB per caricare."
  → CTA button "Riprova caricamento" → connecting_usb retry
  → ALL HONEST: no fake success animation, no fake "uploaded" claim
```

## Atomization GSD-2

### 76-D.1 Demo mode no-board honest fallback (frontend-developer BG)

**File ownership**: `src/components/lavagna/CompileUploadButton.jsx` exclusive

**Changes**:
- Add state `compile_only_no_board` post-compile_success when WebUSB device picker cancelled OR `navigator.usb.requestDevice` returns NotFoundError
- Render honest banner: "Compilazione completata: {hexBytes} byte di codice. Collegate il Nano R4 via USB per caricare sulla scheda."
- Add retry CTA "Riprova caricamento" → re-trigger device picker
- Preserve PRINCIPIO ZERO plurale ("Collegate", "Ragazzi" register)
- ARIA `aria-live="polite"` + role="status" for state transitions
- Touch target ≥44px retry button
- ZERO emoji (ElabIcons CheckIcon + WarningIcon)

**Acceptance test**:
- 5+ unit tests CompileUploadButton state machine (compile → success → no_board fallback → retry)
- ARIA assertion CompileUploadButton (Codex iter 74 MED gap close)

### 76-D.2 Codex iter 74 MED gaps fix (code-reviewer BG audit)

**Scope read-only audit + recommendations**:
- Verify ScratchCompileBar emoji removal iter 75 CC-2 complete (5 sites)
- Recommend T4 test fix: cliffhanger-cta-transitions.test.jsx line 236 — click cliffhanger-cta + assert onLoad called
- Recommend CompileUploadButton ARIA test (currently 76-D.1 frontend dispatch adds it — coordinate file ownership)
- Verify iter 74 UAT doc 0.0.0.0 bind addressed iter 75 CC-3 audit
- Output: `docs/audits/2026-05-17-iter-76-D2-codex-iter74-MED-gaps-audit.md`

### 76-D.3 OpenAPI spec /compile contract (backend-architect BG)

**File ownership**: NEW `infra/cloud-compile/openapi.yaml` exclusive

**Spec scope**:
- Document `/health` GET (200 with agent + arduino-cli version + core status)
- Document `/compile` POST (request `{sketchCode, fqbn, sessionId?}`, response `{ok, jobId, sketchDir, buildDir, stdout, hexBytes?}`)
- Document `/compile-and-upload` POST (extends /compile + port? + WebUSB transfer)
- Document `/jobs/:id/status` GET (job state polling)
- Document `/boards` GET (supported FQBN list)
- Error responses: 400 validation + 401 auth (cloud only) + 429 rate limit + 500 compile error + 504 timeout
- Define schemas: SketchRequest + CompileResponse + JobStatus + BoardEntry + ErrorResponse
- Auth scheme: X-Elab-Api-Key header (cloud) + none (local Vercel preview localhost)
- Both LOCAL (src/services/elab-agent/) + CLOUD (infra/cloud-compile/) MUST conform same schema

### 76-D.4 Riccardo demo script (orchestrator inline)

**File ownership**: NEW `docs/hardware/2026-05-17-iter-76-riccardo-demo-script.md`

**Sections**:
1. Pre-demo setup (Chrome browser + ELAB Tutor open + agent localhost:8765 running)
2. Demo flow 5 minutes:
   - Open #compile-home → show Blockly + IDE side-by-side
   - Drag Blink blocks → C++ generated visible
   - Click "Compila" → green checkmark + "39048 bytes Nano R4" + "Pronto per upload"
   - Show WebUsbBanner Lime "Pronto"
   - Honest path A WITHOUT board: "HEX pronto. Demo upload requires kit Omaric — Riccardo, dovrebbe testarlo con board fisica."
   - Honest path B WITH board: WebUSB picker → flash → green
3. Talking points:
   - 100% browser, no download installer for utenti finali (Vercel + ELAB hosted)
   - arduino-cli ufficiale Arduino LLC (zero hack)
   - Renesas core 1.5.3 ufficiale (RA4M1 supportato)
   - WebUSB Chrome/Edge nativi (W3C spec)
   - Triplet kit Omaric + Vol Davide + software Andrea coerenza Sense 2

### 76-D.5 Mock USBDevice Playwright E2E (orchestrator OR future BG iter 77+)

**File ownership**: NEW `tests/e2e/05-cross-compile-mock-board.spec.js`

**Scope** (defer if iter 76 budget exceeded):
- Mock `navigator.usb` via `page.addInitScript` injecting fake `requestDevice + getDevices`
- Verify state machine transitions WITHOUT real hardware
- Verify "compile_only_no_board" fallback message visible
- Verify retry CTA functional

### 76-D.6 Andrea Render deploy decision

**Honest assessment**: LOCAL agent demo-sufficient for Riccardo. Render Cloud Compile useful for:
- Production student access (no agent install needed teacher Mac)
- Cross-platform (Win/Linux teachers without local arduino-cli)
- Iter 77+ scope

**Recommendation iter 76**: defer Render deploy iter 77+. Local agent proof sufficient Riccardo demo.

### 76-D.7 Codex Pattern V verify-iter76-D batch

**Post all D-atoms ship**: `scripts/dev/codex-bg.sh verify` GPT-5.5 high single sequential ~6min. Read-only cross-check.

## Honesty caveats (4 critical)

1. **NO real Nano R4 board Andrea-side iter 76** — only compile chain verified, NOT flash chain. Hardware UAT Andrea+Tea OR Riccardo+kit physical board iter 77+.
2. **Local agent localhost:8765 demo-sufficient** — Render Cloud deploy NOT iter 76 critical path. Andrea decision defer iter 77+.
3. **WebUSB API browser sandbox limitation** — Playwright headless Chrome may not expose `navigator.usb` (iter 75 CC-3 audit verified). Mock USBDevice E2E test iter 76 D.5 mitigates partially. Real verify = Andrea manual Chrome + real board.
4. **DFU mode entry Nano R4 not yet documented**: Arduino UNO R4 series uses `dfu-util` (USB DFU 1.1) but may need double-tap reset button to enter bootloader. Iter 77+ Riccardo+Omaric verify physical procedure.

## Anti-inflation G45 mandate iter 76 D-track

- NO claim "Riccardo demo complete" until Andrea runs demo Chrome live + screencast capture
- NO claim "100% cross-compile cloud LIVE" until Render deploy verified `/health` 200
- NO claim "flash works" until Tea+kit hardware UAT iter 77+ green
- Honest demo state machine: `compile_only_no_board` is a FIRST-CLASS UI STATE, not error fallback

© Andrea Marro — 2026-05-17 — ELAB Tutor iter 76 D-track CERTAINTY SPEC
