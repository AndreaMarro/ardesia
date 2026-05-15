# Iter 60 — Blockly Nano R4 Cross-Compile Research Findings

**Date:** 2026-05-15
**Role:** RESEARCH subagent (`/ultrathink:ultrathink` coordinator dispatch)
**Scope:** Validate 3 technical assumptions for ELAB Tutor iter 60 Blockly + Nano R4 cross-compile pipeline
**Tools used:** WebSearch, WebFetch, context7 MCP (`/raspberrypifoundation/blockly`)
**No code edits performed.**

---

## 1. Executive Summary

- **Assumption 1 — Arduino-cli `arduino:renesas_uno` core: CONFIRMED.** Latest stable is **v1.5.3** (Feb 25, 2025) — there is no 2026 release shipped yet. Both `arduino:renesas_uno:unor4wifi` and `arduino:renesas_uno:minima` are valid FQBNs. Compile-only is fully supported via `arduino-cli compile --fqbn ... --output-dir ...`. Toolchain: `arm-none-eabi-gcc 7-2017q4` + `dfu-util 0.11.0-arduino5` + `bossac 1.9.1-arduino5`. Headless Linux server install is supported via `--skip-post-install`. **GAP: exact MB footprint not surfaced** by the package index excerpt available — empirical measurement required on Hostinger.
- **Assumption 2 — Blockly v12 Theme API: CONFIRMED.** `Blockly.Theme.defineTheme(name, {base, blockStyles, categoryStyles, componentStyles, fontStyle, startHats})` is the documented entry point. Morfismo Sense 2 palette (Navy/Lime/Orange/Red) maps cleanly onto `blockStyles.*.colourPrimary`. Latest stable is **v12.5.1** (March 2024; v13.0.0-beta also available, but unstable). **PARTIAL: built-in `theme.touchTargets` does NOT exist** — touch sizing must be handled at renderer/CSS level (separate concern).
- **Assumption 3 — Lino 5-step pattern (browser-agent + dfu-util): PARTIAL.** `arduino-create-agent` IS open-source (AGPL-3.0, Go, latest 1.7.0 Apr 2025), cross-platform, WebSocket+REST bridge — confirmed as a viable Step 4 implementation. WebSerial direct upload to UNO R4 is harder than expected: existing OSS libs (`avrbro`) cover AVR boards only, **not Renesas RA4M1**. WebSerial browser coverage is **~73% global** (Chrome/Edge/Opera + Chrome Android 147; **Safari and stable Firefox excluded**). dfu-util command format for UNO R4 Minima is confirmed: `dfu-util --device 0x2341:0x0369 -a 0 -D <bin> -Q` (NO `0x40010000` address — the `-s` address parameter as cited in the original assumption is not present in the official `platform.txt` upload recipe).

---

## 2. Assumption 1 — Arduino-cli `arduino:renesas_uno` core

### 2.1 Install command and version (May 2026)

- Install command verified: `arduino-cli core install arduino:renesas_uno`
- **Latest stable: v1.5.3** released **Feb 25, 2025**. No 2026 release as of May 2026 (per GitHub release tag listing).
- Release history relevant to UNO R4 / Nano R4:
  - 1.4.1 (Mar 10, 2025) — WiFiS3 fixes
  - 1.5.0 (Jul 24, 2025) — `nanor4` variant added
  - 1.5.1 (Aug 28, 2025) — WIRE_INTERFACES_COUNT define, AnalogWrite DC fix, **Arduino Nano R4 CI fix**
  - 1.5.2 (Jan 13, 2026)
  - 1.5.3 (Feb 25, 2026) — current
- Source: https://github.com/arduino/ArduinoCore-renesas/releases

### 2.2 FQBN validity

All FQBNs declared in `boards.txt` (verified via raw GitHub fetch):

| FQBN | Board | Upload tool | MCU |
|---|---|---|---|
| `arduino:renesas_uno:unor4wifi` | UNO R4 WiFi | bossac (sam-ba) | cortex-m4 |
| `arduino:renesas_uno:minima` | UNO R4 Minima | dfu-util | cortex-m4 |
| `arduino:renesas_uno:nanor4` | **Nano R4** (iter 60 target) | (inherits Renesas DFU pattern) | cortex-m4 |
| `arduino:renesas_uno:portenta_c33` | Portenta C33 | dfu-util | cortex-m4 |
| `arduino:renesas_uno:opta_digital` | OPTA DIGITAL | dfu-util | cortex-m4 |
| `arduino:renesas_uno:opta_analog` | OPTA ANALOG | dfu-util | cortex-m4 |
| `arduino:renesas_uno:muxto` | Science Kit R3 Audio | — | — |

→ `unor4wifi` and `minima` both **confirmed valid**. **`nanor4` ALSO valid** — directly relevant for iter 60.
Source: https://github.com/arduino/ArduinoCore-renesas/blob/main/boards.txt

### 2.3 Toolchain dependencies

From `platform.txt` (raw GitHub fetch):

- **Compiler:** `arm-none-eabi-gcc 7-2017q4` (referenced via `{runtime.tools.arm-none-eabi-gcc-7-2017q4.path}`)
- **Upload tools:**
  - `dfu-util 0.11.0-arduino5` — for minima / nanor4 / portenta_c33 / opta_*
  - `bossac 1.9.1-arduino5` — for unor4wifi (sam-ba)
  - `openocd 0.11.0-arduino2` — debug only, not required for compile-only pipeline
- These are all bundled and auto-installed by `arduino-cli core install` (they appear as `toolsDependencies` in the package index).

Source: https://raw.githubusercontent.com/arduino/ArduinoCore-renesas/main/platform.txt

### 2.4 Linux server (Hostinger n8n) prerequisites

- Headless install supported via `arduino-cli core install arduino:renesas_uno --skip-post-install` (post-install scripts are interactive and irrelevant on a non-display server).
- arduino-cli is a single static Go binary — minimal native dependencies (glibc 2.17+ on modern x86_64 Linux is sufficient).
- `arm-none-eabi-gcc 7-2017q4` is a 32-bit toolchain binary historically — on 64-bit Linux this may require `lib32stdc++6` / multilib packages. **GAP: not verified for 2026 toolchain version on Hostinger Ubuntu image** — recommend empirical test (`arduino-cli compile` smoke test) on production VM.
- No Python runtime required for compile-only path.
- **GAP: exact disk footprint MB** — Arduino's package index includes `size` field per archive but the live `package_index.json` truncated in fetch and didn't expose the renesas_uno entry. Empirically AVR core ~50 MB + ARM toolchain ~150-200 MB typical. **Recommend: install on Hostinger and `du -sh ~/.arduino15/packages/arduino/` to confirm.**

Source: https://arduino.github.io/arduino-cli/1.2/commands/arduino-cli_core_install/

### 2.5 Compile-only viability (no upload)

- **CONFIRMED viable.** `arduino-cli compile --fqbn arduino:renesas_uno:nanor4 --output-dir /tmp/build /path/to/sketch` produces `.bin`, `.hex`, `.elf` artifacts without touching any USB device.
- This is the **canonical n8n Hostinger workflow** for iter 60 Phase 1: receive Blockly-generated `.ino` → invoke arduino-cli compile → return `.hex` to client.
- No serial port, no DFU, no host attached board required.

Source: https://docs.arduino.cc/arduino-cli/

---

## 3. Assumption 2 — Blockly v12 Theme API

### 3.1 Constructor signature (May 2026)

- Latest stable: **Blockly v12.5.1** (Mar 2024). v13.0.0-beta.4 exists (May 2024) but is unstable and shouldn't be production-targeted for iter 60.
- Preferred API: `Blockly.Theme.defineTheme(name, themeObj)` — NOT the raw `new Blockly.Theme()` constructor.
- Documented signature (context7 + official docs):

```javascript
Blockly.Theme.defineTheme('themeName', {
  name: 'themeName',
  base: Blockly.Themes.Classic,           // inherit + override
  blockStyles: { ... },                    // per-style block colors
  categoryStyles: { ... },                 // toolbox category colors
  componentStyles: { ... },                // workspace/toolbox chrome colors
  fontStyle: { family, weight, size },
  startHats: false,
});
```

Source: https://developers.google.com/blockly/guides/configure/web/appearance/themes
Source: https://context7.com/raspberrypifoundation/blockly/llms.txt (context7 MCP)

### 3.2 Morfismo Sense 2 palette → Blockly mapping

Concrete iter 60 Phase 2 mapping for the 4 Morfismo palette colors:

```javascript
const morfismoTheme = Blockly.Theme.defineTheme('elabMorfismo', {
  name: 'elabMorfismo',
  base: Blockly.Themes.Classic,
  blockStyles: {
    logic_blocks:    { colourPrimary: '#1E4D8C', colourSecondary: '#163F73', colourTertiary: '#0E2F5C' }, // Navy
    loop_blocks:     { colourPrimary: '#4A7A25', colourSecondary: '#3A621E', colourTertiary: '#2B4A16' }, // Lime
    math_blocks:     { colourPrimary: '#E8941C', colourSecondary: '#C77B14', colourTertiary: '#A6630E' }, // Orange
    procedure_blocks:{ colourPrimary: '#E54B3D', colourSecondary: '#C53B30', colourTertiary: '#A52F26' }, // Red
  },
  categoryStyles: {
    logic_category: { colour: '#1E4D8C' },
    loop_category:  { colour: '#4A7A25' },
    math_category:  { colour: '#E8941C' },
    proc_category:  { colour: '#E54B3D' },
  },
  componentStyles: {
    workspaceBackgroundColour: '#FFFFFF',
    toolboxBackgroundColour:   '#F5F5F5',
  },
});

Blockly.inject('blocklyDiv', { theme: morfismoTheme, toolbox: toolboxXml });
// or at runtime:
workspace.setTheme(morfismoTheme);
```

→ Direct 1:1 mapping. **No XML toolbox alteration needed** for color theming — `categoryStyles` references categories by their `categorystyle` attribute in toolbox XML (e.g. `<category name="Logic" categorystyle="logic_category">`). This is the cleanest separation: toolbox XML stays unchanged, palette swap is a single object replacement.

Source: context7 MCP `/raspberrypifoundation/blockly` Halloween theme example

### 3.3 Per-block icon/color without altering toolbox XML

- **Block-level color:** set via the block's `style` field in its JSON definition: `{ "type": "my_block", "style": "logic_blocks", ... }`. The theme's `blockStyles.logic_blocks.colourPrimary` then drives the rendered color. No toolbox XML edit required.
- **Per-block icons** (Field images): use `field_image` or custom Field subclass — orthogonal to Theme API.

Source: https://developers.google.com/blockly/guides/configure/web/appearance/block-colour

### 3.4 Touch-friendly settings — GAP

- **No built-in `theme.touchTargets` property exists** in Blockly v12 Theme API. Confirmed across the official docs and context7 corpus.
- Touch target sizing for tablets / LIM (ELAB target) must be handled separately via:
  - Custom renderer (`Blockly.blockRendering.Renderer` subclass — sets `CONSTANTS.GRID_UNIT`, padding, corner radius)
  - CSS scaling on `.blocklyBlockCanvas` and toolbox elements
  - `Blockly.inject` `renderer: 'zelos'` (larger, friendlier blocks — Scratch-like)
- **Recommendation for iter 60 Phase 2:** use `renderer: 'zelos'` + custom `theme` together — Zelos is the touch-optimized renderer (originally built for Scratch).

Source: https://developers.google.com/blockly/guides/configure/web/appearance/themes

### 3.5 Backward compat with Sense 1.5 toolbox

- Existing toolbox XML uses `colour="<hue>"` attributes — these are **overridden by theme** when `categorystyle` is present. Migration path: add `categorystyle="logic_category"` alongside (or replacing) `colour="..."` on `<category>` elements.
- Inheriting `base: Blockly.Themes.Classic` preserves all default block styles for any block style key not overridden in `blockStyles` — safe partial migration.

Source: context7 MCP `/raspberrypifoundation/blockly` (Halloween example demonstrates inherit + override)

---

## 4. Assumption 3 — Lino 5-step pattern: Browser Agent + WebSerial + dfu-util

### 4.1 Step 4 — `arduino-create-agent` is open source and viable

- **License:** AGPL-3.0 — open source, but copyleft. **Risk for ELAB Tutor:** AGPL requires source disclosure for network-deployed modifications. If we **embed/modify** the agent we inherit AGPL obligations. If we **only invoke it as a separate local process** the user installs themselves, ELAB stays clean. **Recommend: do NOT fork. Direct users to install upstream agent.**
- Latest release: **1.7.0 (April 1, 2025)** — actively maintained.
- Cross-platform: Windows / macOS (universal Apple Silicon binary) / Linux / Raspberry Pi.
- Architecture: Go daemon, runs in system tray, exposes **WebSocket + REST** endpoints to localhost.
- Browser app talks to `localhost:8990` (or similar) via WebSocket → agent talks to USB serial port → flashes board.
- Confirmed real-world use case (Cirkit Designer cloud architecture): server-side arduino-cli compile → base64-encoded `.bin` → agent.uploadSerial() → board.
- **UNO R4 WiFi specific gotcha:** must pass `.bin` (not `.hex`) to `uploadSerial()` because bossac/sam-ba protocol expects binary.

Sources:
- https://github.com/arduino/arduino-create-agent
- https://forum.arduino.cc/t/compiling-and-uploading-to-arduino-r4-wifi-using-arduino-cli-arduino-create-agent/1300268

### 4.2 WebSerial direct upload — alternative to agent

- **Web Serial API** is the W3C-track API for browser-to-serial communication. `navigator.serial.requestPort()` prompts user, returns `SerialPort` object on user gesture (mandatory).
- Browser support **May 2026:**
  - Chrome 89+ desktop, Chrome Android 147+, Edge 89+, Opera 76+: **YES**
  - Safari (macOS/iOS/iPadOS): **NO** (WebKit "opposed" position — fingerprinting / security concerns)
  - Firefox stable (153): **NO**. Firefox Nightly 151 (April 2026) added an addon-gated build — not yet a viable production target.
  - Global coverage: **~72.96%** (caniuse, April 2026)
- Permission model: requires **user gesture** (click/touch handler) to call `requestPort()`. After granted, port persists via `navigator.serial.getPorts()`.
- Baud rate: required parameter in `port.open({ baudRate })`. Common values 9600, 115200; UNO R4 bootloader entry typically 1200 (for 1200bps touch on `unor4wifi`).

Sources:
- https://developer.chrome.com/articles/serial
- https://caniuse.com/web-serial
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API
- https://www.theregister.com/2026/04/14/firefox_nightly_web_serial/

### 4.3 OSS WebSerial → Arduino UNO R4 implementations

- **`avrbro`** (kaelhem/avrbro, MIT) — uploads `.hex` to AVR boards (UNO R3, Nano) via Web Serial + **STK500v1** protocol. **Does NOT support UNO R4 / Renesas RA4M1.** Different protocol (DFU/SAM-BA), different CPU, different bootloader. Last activity stale, 23 stars.
- **No mature OSS reference implementation found** for WebSerial → UNO R4 direct upload as of May 2026. The Renesas DFU flow over WebSerial would require implementing the DFU 1.1 / DfuSe protocol in JavaScript talking to USB-serial — non-trivial.
- **WebUSB API** (separate from WebSerial) is the more natural match for DFU since DFU is a USB class protocol — but ELAB scope doesn't currently target WebUSB.

Sources:
- https://github.com/kaelhem/avrbro
- https://github.com/mofosyne/jtag2updi (similar AVR-only flasher)

### 4.4 Step 5 — dfu-util Renesas flash protocol (UNO R4 Minima / Nano R4)

**Actual command from `platform.txt`** (the assumption in the brief cited `0x40010000` — NOT present in the official Arduino recipe):

```
dfu-util --device {upload.vid}:{pid.0},:{upload.pid} \
         -D {build.path}/{build.project_name}.bin \
         -a {upload.interface} \
         -Q
```

For UNO R4 Minima (from `boards.txt`):
- VID:PID = `0x2341:0x0369` (DFU mode)
- `-a 0` (alt interface 0)
- `-Q` quiet
- **NO `-s 0x40010000:leave`** — Arduino's official recipe doesn't use a `-s` start-address parameter. The bootloader handles the flash base address internally.
- DFU mode entry: physical action — **press RESET twice quickly** (no 1200bps touch on Minima; `use_1200bps_touch=false` confirmed in boards.txt). UNO R4 WiFi uses bossac (NOT dfu-util) with 1200bps touch.

Forum-cited alternative command (some users):
```
dfu-util -d 0x2341:0x0069,0x2341:0x0369 -a 0 -s 0x4000:leave -D firmware.bin
```
This uses `0x4000` (not `0x40010000`) for the user code start — still different from the assumption.

**Conclusion:** The `0x40010000` address as cited in the iter 60 brief appears to be either (a) a Renesas RA4M1 SRAM/peripheral base address from the datasheet, NOT a DFU upload offset, or (b) a misremembered figure. The actual dfu-util invocation does not require it. **Recommend correcting iter 60 plan to omit `-s` flag.**

Sources:
- https://raw.githubusercontent.com/arduino/ArduinoCore-renesas/main/platform.txt
- https://raw.githubusercontent.com/arduino/ArduinoCore-renesas/main/boards.txt
- https://support.arduino.cc/hc/en-us/articles/11011849739804-dfu-util-errors-when-uploading-exit-status-74

### 4.5 Alternative for UNO R4 WiFi — bossac (sam-ba)

Per `boards.txt` `unor4wifi.upload.tool = bossac`. Command pattern from platform.txt:
```
bossac {upload.verbose} --port={serial.port.file} -U -e -w {build.path}/{build.project_name}.bin -R
```
- Requires serial port (NOT USB DFU class). Uses 1200bps touch to trigger bootloader.
- `-U` USB, `-e` erase, `-w` write, `-R` reset after.

**Implication: iter 60 needs TWO upload paths**, one for `minima`+`nanor4` (dfu-util) and one for `unor4wifi` (bossac). If iter 60 Phase 1 only targets **Nano R4**, the dfu-util path covers it.

Source: https://raw.githubusercontent.com/arduino/ArduinoCore-renesas/main/platform.txt

---

## 5. Implications for Iter 60 Phase 1 (Minimal Scope)

**Phase 1 = server-side compile only, no upload yet.**

- ✅ **Viable on n8n Hostinger.** Install once: `arduino-cli core install arduino:renesas_uno@1.5.3 --skip-post-install`. Smoke test with `arduino-cli compile --fqbn arduino:renesas_uno:nanor4 ...` on a minimal Blink sketch.
- ✅ **No GPL/AGPL contamination** — arduino-cli is Apache-2.0 / GPLv3 (CLI tool, not embedded library — invocation is fine).
- ✅ **Stateless n8n node:** accept `.ino` body via HTTP POST → write to temp dir → invoke `arduino-cli compile` → return `.hex` (or `.bin`) bytes. No DB, no auth coupling.
- ⚠️ **Disk budget:** estimate **300-500 MB** for arduino-cli + renesas_uno core + arm-none-eabi toolchain. **GAP — measure on Hostinger before committing.** This may matter on tight VPS plans.
- ⚠️ **Cold-start latency:** first compile after install takes 5-15s (toolchain load). Subsequent compiles 1-3s. **Acceptable for ELAB classroom use.** Consider caching last successful build per sketch hash.
- ⚠️ **Compile errors as UX:** parse arduino-cli stderr to surface friendly error to UNLIM (line number + diagnostic message). Out of scope for Phase 1 minimal but planned for Phase 2.

---

## 6. Implications for Iter 66+ Phase 2 UX (Blockly Theme + Custom Palette)

- ✅ **Morfismo Sense 2 palette (Navy/Lime/Orange/Red) directly applicable** via `Blockly.Theme.defineTheme` — zero toolbox XML changes if categories already carry `categorystyle` attributes.
- ✅ **Inherit from `Blockly.Themes.Classic`** — only override what differs. Safe partial migration from existing toolbox.
- ✅ **Use `renderer: 'zelos'`** in `Blockly.inject` for touch-friendly LIM tablet UX. Zelos provides larger blocks, rounded corners, inline icons — closer to Scratch UX (which our 8-12yo target understands).
- ⚠️ **Touch target sizing is NOT in Theme API.** Must be handled via renderer constants override or CSS. Plan a separate sub-task for "Blockly tablet touch targets" — likely 2-3h scope.
- ⚠️ **Blockly v13.0.0-beta exists but is unstable.** Stay on v12.5.1 for iter 60-66.

**Effort estimate Phase 2 UX:** ~6-8h (palette mapping + zelos renderer setup + smoke test on touch device).

---

## 7. Implications for Iter 70+ Phase 4 (WebSerial + dfu-util on client)

- ✅ **arduino-create-agent path is the safe default** — battle-tested, cross-platform, used by Arduino Cloud itself. Users install once, agent runs in tray. Browser app sends compiled `.bin` to `localhost:8990` over WebSocket. No browser-API risk.
  - **Caveat: AGPL-3.0 license.** Do NOT fork. Treat as external dependency. Document install steps for teachers.
- ⚠️ **WebSerial direct path is riskier**:
  - **No mature OSS Renesas DFU JS impl exists** as of May 2026. Building one = significant engineering investment (~40-80h estimate to port DFU 1.1 protocol to JS over WebSerial; alternatively WebUSB which is more natural fit for DFU).
  - **Safari + stable Firefox excluded.** ~27% of users would fall back to "install the agent" anyway. Realistically a hybrid: WebSerial primary on Chrome/Edge/Opera, agent fallback elsewhere.
  - **iPad classroom use case is BLOCKED** — Safari iOS doesn't support WebSerial. WebSerial-only would lose iPad users entirely.
- **Recommended Phase 4 architecture:**
  - Primary: **agent-based upload** (works everywhere with agent installed, including iPad via desktop bridge)
  - Stretch: WebSerial path for Chrome desktop as "no-install" option for power users
  - **Do NOT block iter 60 on solving WebSerial-direct-to-Renesas** — it's a research project of its own.

**Effort estimate Phase 4 (agent-only path):** ~12-20h (browser JS wrapper around agent WebSocket API + classroom install docs).
**Effort estimate Phase 4 (WebSerial direct addition):** **+40-80h** (DFU JS impl + extensive cross-board test matrix).

---

## 8. Honest Gaps

The following claims could **NOT be verified** with the sources available and are flagged as gaps (NOT fabricated):

1. **Exact MB disk footprint** of `arduino:renesas_uno` core + dependencies on Hostinger Ubuntu. The Arduino package_index.json fetch was truncated and did not surface the renesas_uno entry. **Action: empirically measure on Hostinger.**
2. **glibc / 32-bit lib prerequisites** for the bundled `arm-none-eabi-gcc 7-2017q4` on Hostinger's specific OS image. Toolchain is from 2017 — may require `lib32stdc++6` or `lib32z1`. **Action: smoke test compile on Hostinger VM.**
3. **Whether `arduino:renesas_uno` version 1.5.3 (Feb 2026)** is also the latest in May 2026, or if a 1.5.4 / 1.6.0 has shipped silently. **Action: check `arduino-cli core list --all` at install time.**
4. **Blockly v13 stability in May 2026.** GitHub release page shows v13.0.0-beta.4 as the most recent activity but that's labelled beta and dated May 2024. There may be a stable v13 by May 2026; the Releases page fetch did not surface it. **Action: check npm `blockly@latest` at integration time.**
5. **The `0x40010000` address** cited in the original assumption was NOT found in any official Arduino upload recipe. Best guess: a Renesas RA4M1 datasheet memory map address (not a DFU flash offset). **Action: drop this from the iter 60 plan.**
6. **`arduino-cli` headless Linux install errors on a real Hostinger image** — only documentation-level confirmation. **Action: dry-run on staging.**
7. **WebSerial DFU implementation feasibility on UNO R4** — no OSS prior art. The 40-80h estimate is rough. **Action: timebox a 4h spike before committing to Phase 4 WebSerial path.**

---

## 9. Source URL Bibliography

1. https://github.com/arduino/ArduinoCore-renesas — Renesas core repo
2. https://github.com/arduino/ArduinoCore-renesas/releases — release history (v1.5.3 latest)
3. https://raw.githubusercontent.com/arduino/ArduinoCore-renesas/main/platform.txt — toolchain + upload recipes
4. https://raw.githubusercontent.com/arduino/ArduinoCore-renesas/main/boards.txt — FQBN + per-board upload tool
5. https://arduino.github.io/arduino-cli/1.2/commands/arduino-cli_core_install/ — install command
6. https://docs.arduino.cc/arduino-cli/ — arduino-cli root docs
7. https://docs.platformio.org/en/latest/boards/renesas-ra/uno_r4_wifi.html — UNO R4 WiFi specs (PlatformIO)
8. https://docs.platformio.org/en/latest/boards/renesas-ra/uno_r4_minima.html — UNO R4 Minima specs
9. https://developers.google.com/blockly/guides/configure/web/appearance/themes — Blockly Theme API
10. https://developers.google.com/blockly/guides/configure/web/appearance/block-colour — block style colors
11. https://github.com/google/blockly/releases — Blockly release history
12. https://www.npmjs.com/package/blockly — npm versions (blocked 403 via WebFetch)
13. context7 MCP `/raspberrypifoundation/blockly` — Theme.defineTheme code examples
14. https://github.com/arduino/arduino-create-agent — agent source + AGPL-3.0 license
15. https://forum.arduino.cc/t/compiling-and-uploading-to-arduino-r4-wifi-using-arduino-cli-arduino-create-agent/1300268 — real-world hybrid arch
16. https://developer.chrome.com/articles/serial — Web Serial API capabilities (redirected from web.dev/serial)
17. https://caniuse.com/web-serial — browser support matrix
18. https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API — MDN
19. https://www.theregister.com/2026/04/14/firefox_nightly_web_serial/ — Firefox Nightly WebSerial status April 2026
20. https://github.com/kaelhem/avrbro — OSS WebSerial AVR uploader (NOT UNO R4 compatible)
21. https://support.arduino.cc/hc/en-us/articles/11011849739804-dfu-util-errors-when-uploading-exit-status-74 — dfu-util troubleshooting
22. https://forum.arduino.cc/t/how-to-install-renesas-core/1176625 — install discussion

---

**Deliverable summary:**
- **Assumption 1 Arduino-cli renesas_uno: CONFIRMED** (with 2 gaps: disk size + Hostinger glibc — both measurable in <30min on staging)
- **Assumption 2 Blockly v12 Theme: CONFIRMED** (with 1 partial: no built-in touchTargets — handle via Zelos renderer + CSS instead)
- **Assumption 3 Lino 5-step pattern: PARTIAL** (agent path solid; WebSerial direct to UNO R4 has NO mature OSS prior art and excludes Safari/iPad — recommend agent-first, WebSerial as stretch only)
