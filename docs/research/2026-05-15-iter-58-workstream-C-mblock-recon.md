# Workstream C — mBlock pivot recon for ELAB Tutor

**Date**: 2026-05-15
**Iter**: 58
**Type**: Read-only feasibility recon (no code changes)
**Trigger**: Riccardo Franzoso (Omaric) rewriting Vol4 with mBlock 2026-05-14/15. Andrea decision verbatim WhatsApp 23:07: "elimino blockly e adatto" — migrate ELAB Tutor from Blockly to mBlock. SAME Arduino Nano R4 hardware kit. Schools ask for mBlock by name.

---

## TL;DR

- **C1 inventory**: 9 source files, ~7,476 LOC touch Blockly (Blockly 12.4.1 + Scratch-style block layer). `scratchXml` field present on **13/29 Vol3 experiments only**. Vol1+Vol2 have **zero** Scratch references. Lesson-paths JSON (80 files) reference experiments by id, never by Blockly/Scratch payload.
- **C2 feasibility verdict**: **MAYBE-with-major-caveats**. mBlock Extension Builder (`ext.mblock.cc`) supports custom Arduino devices + Arduino C transcoding templates, but **(a) no documented Nano R4 / Renesas RA4M1 core support**, **(b) extension runs inside mBlock 5 client (Electron desktop) — not embeddable in our React web app**, **(c) tooling targets `.mext` files for offline mBlock 5 PC client, not browser**. The Extension Builder solves "make mBlock support our hardware", NOT "embed mBlock inside elabtutor.school".
- **Recommended path**: **Path C — Hybrid** (Blockly for Vol1-3 web, mBlock for Vol4 desktop), with explicit gate to **Path B + custom mBlock-compatible web port** if school adoption demands convergence in 2026 H2.
- **Effort estimate**: Path A 1-2 FTE-weeks (drop code, add desktop instructions). Path B 6-10 FTE-weeks (paste/upload + Renesas core add). Path C 3-5 FTE-weeks (build .mext + write Vol4 lesson-paths + keep current stack).

---

## C1 — Inventory current Blockly usage in elab-builder

Run: `grep -r "blockly\|Blockly" src/ --include="*.js" --include="*.jsx" -l`

### File inventory

| # | File path | LOC | Type | Role |
|---|---|---:|---|---|
| 1 | `src/components/simulator/NewElabSimulator.jsx` | 1037 | Component | Simulator shell — mounts `<ScratchEditor>` lazily (`line 45`), manages `scratchXml` state (`line 163`), persists per-experiment to localStorage (`line 1016`), loads initial XML from current experiment step (`line 363`). Theme CSS var `--color-blockly-grid`. |
| 2 | `src/components/simulator/panels/ScratchEditor.jsx` | 506 | Component | Main Blockly host. Defines `ELAB_THEME` (lines 17-72, custom colors/fonts/categoryStyles), 12-category `TOOLBOX_XML` (line 75 onward), `ScratchEditor` React component (line 329, `Blockly.inject` + generator wiring). |
| 3 | `src/components/simulator/panels/ScratchCompileBar.jsx` | 147 | Component | Compile/run toolbar + `ScratchErrorBoundary` (line 11) — captures Blockly crashes to `window.__elabBlocklyError`. |
| 4 | `src/components/simulator/panels/scratchBlocks.js` | 414 | Data/Logic | **23 custom `Blockly.Blocks[...]` definitions** for Arduino primitives (`arduino_base`, `arduino_pin_mode`, `arduino_digital_write/read`, `arduino_analog_write/read`, `arduino_delay`, `arduino_millis`, `arduino_serial_*`, `arduino_pulse_in`, `arduino_tone`, `arduino_no_tone`, `arduino_servo_attach/write/read`, `arduino_lcd_init/print/set_cursor/clear`, `arduino_variable_set`, etc.). |
| 5 | `src/components/simulator/panels/scratchGenerator.js` | 497 | Logic | **48 `arduinoGenerator.forBlock[...]` C++ codegen entries**. Builds a custom `Blockly.Generator('Arduino')` with full C++ precedence table (lines 8-27) and emits Arduino C++ for compile pipeline (Hostinger n8n → HEX → avr8js). |
| 6 | `src/components/simulator/utils/friendlyError.js` | – | Logic | Refers to "Blockly crash" in human-readable error mapping. |
| 7 | `src/services/simulator-api.js` | 1020 | Service | `__ELAB_API.loadBlocklyXml(xml)` doc comment line 531-532: "Load a Blockly workspace XML and switch to Scratch mode". |
| 8 | `src/data/experiments-vol3.js` | 3002 | Data | **13 `scratchXml: *_SCRATCH` references on Vol3 experiments only** (line 1019 BLINK, 1086 BLINK_FAST, 1350 BLINK_EXTERNAL, 1503 SOS_MORSE, 1675, 1798 SEMAFORO, 2139 ANALOG_READ_BASE, 2307 ANALOG_VOLTAGE, 2571 ANALOG_3LED, 2696 PWM_FADE_UPDOWN, plus SERIAL_SETUP/LOOP/SERIAL). **9 inline `const *_SCRATCH = \`<xml xmlns=…blockly/xml\">\`** workspace blobs (line 45 onward). |
| 9 | `src/data/scratch-xml-templates.js` | 390 | Data | **19 exported `*_SCRATCH` Blockly workspace templates** (BLINK_BUILTIN, BLINK_FAST, LED_ESTERNO, CAMBIA_PIN, POLIZIA, PULSANTE_TOGGLE, MORSE_SIMPLE, ANALOG_READ_BASE, TRIMMER_3LED, PWM_FADE, PWM_MANUAL, TRIMMER_MAP, SERIAL_SETUP, SERIAL_LOOP, POT_3LED_SERIAL, PWM_FADE_UPDOWN, SERIAL_2POT, …). Each is a `<xml xmlns="https://developers.google.com/blockly/xml">` payload. |
| 10 | `src/data/unlim-knowledge-base.js` | 463 | Data | 3 KB FAQ entries about "Scratch/Blockly" (lines 64-77) — string content, no code dependency. |
| 11 | `src/components/simulator/hooks/useExperimentLoader.js` | – | Hook | `setScratchXml(savedScratch || experiment.scratchXml || '')` (line 177). |
| 12 | `src/components/simulator/hooks/useCircuitHandlers.js` | – | Hook | `setScratchXml(currentExperiment.scratchXml || '')` (line 184). |
| 13 | `scripts/patch-blockly.js` | 148 | Build script | `postinstall` patches Blockly 12.4.1 `InsertionMarkerPreviewer` disposal bugs (referenced in `ScratchEditor.jsx` lines 7-13). |

### Quantification

| Metric | Count |
|---|---:|
| Files touching Blockly (src/) | 9 (.js/.jsx) + 1 (build script) |
| Total LOC across the 9 hot files | **7,476** |
| Custom `Blockly.Blocks[…]` definitions | **23** Arduino primitives |
| Arduino C++ generator entries (`arduinoGenerator.forBlock[…]`) | **48** |
| Toolbox categories in `ScratchEditor.jsx` | **12** (Decisioni, Ripeti, Numeri, Variabili, Testo, Accendi e Spegni, Suoni, Motore Servo, Schermo LCD, Tempo, Comunicazione, Sensori) |
| `scratchXml`-bearing experiments — Vol3 only | **13/29 Vol3**, **0/38 Vol1**, **0/27 Vol2** |
| Lesson-path JSON files referencing Blockly/Scratch (`src/data/lesson-paths/*.json`) | **0/80** (lesson-paths reference experiments by id; Blockly payload lives on the experiment object) |
| npm dep | `"blockly": "^12.4.1"` (`package.json`) + `postinstall` patch script |

### Load surface

- Mount point: `NewElabSimulator.jsx:1016` — `<ScratchEditor initialCode={scratchXml} onChange={…}>` inside the simulator route (hash `#simulator` or via Lavagna shell).
- The simulator is the **only** consumer. Lavagna, UNLIM chat, Dashboard, HomePage do not mount Blockly.
- Generator output (`generatedCode`) is persisted to `localStorage` (`elab_scratch_code_<expId>`) and pushed through the compile pipeline (Hostinger n8n compiler → HEX → avr8js in browser).

### Migration scope summary

| Layer | What must change | Coupling |
|---|---|---|
| Block library | 23 custom blocks → mBlock extension blocks | Tight (block IDs referenced in 19+ saved XML templates) |
| Codegen | 48 forBlock C++ generators → mBlock transcoding templates | Tight (output feeds n8n compile pipeline) |
| Saved programs | 13 inline XML + 19 exported templates = **~32 saved Blockly workspaces** | Tight (each Vol3 experiment step ships an XML payload) |
| UI shell | `ScratchEditor.jsx` 506 LOC + theme + 12-category toolbox | Tight (depends on `blockly` npm package) |
| Persistence | `localStorage` keys `elab_scratch_*` | Loose (key rename trivial) |
| Compile bridge | Generator → string → Hostinger n8n → HEX → avr8js | Loose (compile pipeline accepts arbitrary Arduino C++ string) |
| Lesson-path content | 80 JSON files | **Zero coupling to Blockly** (good — no mass JSON migration needed) |
| UNLIM RAG | 3 string entries in `unlim-knowledge-base.js` | Loose (text update) |

**Bottom line C1**: the migration touches a tight cluster of 5 simulator files + 2 data files + 1 npm dep. The narrative content (94 experiments, 80 lesson-paths, 27 Lezioni grouping) is **decoupled** from the block engine — that's the silver lining.

---

## C2 — mBlock Extension Builder feasibility for Arduino Nano R4

### What the Extension Builder offers (per Makeblock docs)

The mBlock 5 Extension Builder (`ext.mblock.cc`, requires login) is a web tool that lets third parties:

1. **Create a custom Arduino Device** — pick a base template (Arduino C is one option), define vendor/product IDs for serial filter, ship as a `.mext` package.
2. **Create custom blocks** — visual block design, define inputs/dropdowns/fields, attach a **transcoding template** that maps `block + args → Arduino C/C++ code snippet`. Examples documented: LED extension, button events with `$INDEX` / `$BRANCH` / `$ALL_VARIABLES` pseudo-params.
3. **Bundle to `.mext`** — drag/drop into the mBlock 5 PC client (Windows/macOS desktop Electron app) to load the device + blocks. Output is **NOT a web-embeddable widget**.

Sources confirm Arduino Uno / Mega / Nano (classic AVR ATmega328p / ATmega2560) are first-class. Arduino UNO R4 Wi-Fi forum post (Makeblock Forum t/23353 marked SOLVED) shows community confirms UNO R4 *can* work via custom device extension, indicating Renesas RA4M1 is reachable.

### Gaps relative to ELAB's needs

| Need | mBlock Extension Builder support | Verdict |
|---|---|---|
| Custom Arduino device (Nano R4) | YES — "Add an Arduino Device" template documented | OK |
| Renesas RA4M1 / Cortex-M4 core compile target | **NOT documented** for the Builder itself — mBlock 5 uses Arduino CLI under the hood, so adding the official Arduino Renesas core board package URL via mBlock device "compiler arguments" is *theoretically* possible (UNO R4 Wi-Fi community thread suggests this path), but **no first-party support and no Nano R4 reference** | RISK — needs PoC |
| 12+ block categories matching current toolbox | YES — unlimited custom blocks per device | OK |
| Arduino C/C++ transcoding | YES — exactly the documented mechanism | OK |
| Embed inside a React web app | **NO** — `.mext` runs in mBlock 5 PC client (Electron desktop). mBlock has a "Web Editor" at mblock.cc/en/editor but it does NOT load arbitrary `.mext` devices (only first-party Makeblock devices) | BLOCKER for full web integration |
| Browser-side codegen (replacing our `arduinoGenerator`) | **NO** — transcoding runs inside mBlock 5 client; the Builder packages templates, doesn't expose a JS lib | BLOCKER for keeping `elab-builder` as single SPA |
| Cross-platform desktop (teachers' laptops) | YES — mBlock 5 PC ships Windows/macOS/Linux | OK |
| Online-only Chromebook-friendly | NO — mBlock 5 client install required | RISK — many schools use Chromebooks |
| Long-term maintainership | Makeblock-controlled tooling, free tier today | RISK — vendor lock-in |

### Verdict C2

**MAYBE-with-caveats**. The Extension Builder is sufficient to make **mBlock 5 the desktop** support Arduino Nano R4 with the 23-block ELAB library — that part is achievable in 1-2 weeks of work + a Renesas core PoC. BUT it is **not** a drop-in replacement for the Blockly editor currently embedded in `elabtutor.school`. mBlock and Blockly solve overlapping problems with **incompatible distribution models** (mBlock = desktop client + `.mext`, Blockly = npm lib in our SPA). Riccardo's Vol4 will work in mBlock 5 PC client. ELAB Tutor web stays Blockly unless we either (a) accept desktop-only Vol4 (Path C), or (b) build a custom web port of the Vol4 blocks ourselves (Path B with effort).

The **fact that mBlock 5 Web Editor cannot load `.mext` extensions is the single most important finding** — it changes the migration from "swap library" to "fork an experience". Confirm this before any code is written.

---

## C3 — Migration paths A / B / C

### Path A — mBlock as separate desktop tool

**Description**: Drop Blockly from `elab-builder`. Teachers install mBlock 5 PC client. ELAB software keeps simulator + UNLIM + compile bridge + lesson narratives, but **loses the embedded code editor**. Vol4 instructions tell teachers "open mBlock 5, load the ELAB-Nano-R4 device, follow the chapter".

| Pros | Cons |
|---|---|
| Smallest engineering scope (1-2 FTE-weeks: gut 9 files, drop `blockly` dep, write Vol4 .mext) | **Breaks Morfismo Sense 2** — software no longer hosts coding step. The triplet (kit + volumi + software) becomes (kit + volumi + simulator only). |
| Aligns with Riccardo's Vol4 native experience | Two-tool flow for teachers (browser tab + Electron app). LIM workflow degrades. |
| Riccardo + Omaric maintain Vol4 entirely in mBlock | Vol1-3 web Blockly still alive — fragmentation across volumes |
| Chromebook problem solved by punting (use the school PC for coding) | Many EU primary classes are Chromebook-only — mBlock 5 desktop is a non-starter there |
| | Loses 32 saved Blockly workspaces (Vol3 templates need re-authoring in mBlock or are abandoned) |
| | UNLIM cannot read the Vol4 code editor (separate process) — `__ELAB_API` surface loses code-aware intents for Vol4 |

### Path B — Embed mBlock-generated extension via paste/upload bridge

**Description**: Teachers/kids use mBlock 5 PC client to compose programs with the ELAB-Nano-R4 `.mext`. Either (i) export Arduino C from mBlock, paste into `elab-builder` text area → existing n8n compile pipeline runs unchanged, OR (ii) upload `.ino` file → server validates + runs compile + AVRBridge. **Optional later**: build a custom web port of the Vol4 block set inside `elab-builder` using mBlock visual semantics (same block shapes, ELAB palette) — keeps the SPA whole.

| Pros | Cons |
|---|---|
| Compile pipeline unchanged (Hostinger n8n consumes Arduino C/C++ string) | Two-tool workflow for kids — pedagogical regression for 8-14 age band |
| Vol4 instructions stay aligned with Riccardo's mBlock-native authoring | Paste/upload is friction; Principio Zero ("docente non specialista") gets harder |
| Renesas RA4M1 issue is solved inside mBlock 5 (community-known path) | Custom mBlock-compatible web port is a real engineering project: ~4-6 FTE-weeks for 20-block subset |
| Optional web port preserves Morfismo Sense 2 long-term | UNLIM still can't inspect the in-progress program until paste happens |
| | AVRBridge currently emulates **ATmega328p** (`src/components/simulator/engine/AVRBridge.js` 1242 LOC). Nano R4 = Renesas RA4M1 Cortex-M4. We do **not** have a Cortex-M4 simulator. Pasted code would compile but not run in the in-browser simulator without further work. |

### Path C — Hybrid (Blockly for Vol1-3 web, mBlock for Vol4 desktop)

**Description**: Keep `elab-builder` Blockly stack exactly as today for Vol1+Vol2+Vol3 (which is **all of `experiments-vol3.js` Scratch coverage anyway** — Vol1+Vol2 had no Scratch payload to begin with). Build the ELAB-Nano-R4 `.mext` for mBlock 5 desktop. Riccardo authors Vol4 entirely against the `.mext`. Software-side: a new `#vol4` route in `elab-builder` that hosts Vol4 lesson narratives + UNLIM coaching + simulator (kit visualization) but **delegates code editing to mBlock 5 desktop**. Cross-link the two via instructions ("Apri mBlock 5, segui i blocchi del capitolo X").

| Pros | Cons |
|---|---|
| Zero risk to live Vol1-3 production traffic | Vol4 is "second-class" in the SPA — Morfismo Sense 2 is partially broken for Vol4 only |
| Smallest blast radius (Vol1-3 stack untouched, Vol4 is greenfield) | Two-tool flow for Vol4 specifically. Acceptable if Vol4 = advanced/capstone audience (older kids, more autonomy) |
| Riccardo + Omaric build Vol4 .mext at their own pace, in parallel | UNLIM in `elab-builder` doesn't see Vol4 student code until Andrea decides to ingest via paste/upload (Path C → Path B convergence later) |
| Buys time: validate school adoption of mBlock before bigger pivot | Defers the "convergence" decision rather than solving it |
| Mass migration of 32 Blockly workspaces is **not needed** (Vol4 is new content) | If Vol1-3 schools ALSO ask for mBlock parity later, work doubles |

### Recommended path — **Path C (Hybrid)** with explicit Path B convergence gate at iter 70 (~12 weeks out)

**One-sentence rationale**: Vol1-3 already work in production with Blockly on `elabtutor.school`; risking that surface to satisfy a Vol4 request from one partner (however important) violates the "surgical change" Karpathy principle in `CLAUDE.md`. Path C ships Vol4 in mBlock-native form for Riccardo's audience without touching the live web stack, then we measure whether schools demand convergence before investing 6-10 FTE-weeks on Path B.

**What Andrea must decide before any code**:

1. **Vol4 audience**: is Vol4 for the same primary-school 8-12 LIM-based classes (Chromebook risk = mBlock 5 desktop is unusable), or for older 12-14 with school PCs / family laptops (mBlock 5 desktop is OK)?
2. **Maintenance ownership of the `.mext`**: Andrea, Omaric, or a third party? `.mext` files are not version-controlled in our repo today.
3. **Renesas RA4M1 PoC**: do we (or Omaric) confirm an Arduino Nano R4 can flash from mBlock 5 with a custom device extension within 1 working week, before committing to either path? If PoC fails, Path A/B/C all collapse — recover by either upgrading the Vol4 kit to a Nano R3 (AVR ATmega328p, mBlock native) or staying on Blockly.
4. **Chromebook decision**: if any Vol4 school is Chromebook-only, mBlock 5 desktop is dead-on-arrival there. Accept loss, or commit to Path B web port (6-10 FTE-weeks).
5. **Integration depth with UNLIM**: do we need UNLIM to coach kids on Vol4 code in real time (requires Path B paste/upload bridge minimum), or is "open mBlock, follow the book" acceptable for Vol4 (Path C as-is)?
6. **Migration timeline**: is iter 60 (~3 weeks) Vol4 launch realistic, or do we plan iter 65-68 (~8-10 weeks)?
7. **Riccardo's authoring tool deadline**: when does Riccardo need the `.mext` to start authoring Vol4? That sets the engineering deadline for whichever path we pick.

---

## C4 — Effort estimate

### Engineering hours / FTE-weeks per path

| Path | Tasks | FTE-weeks | Hours @ 40h/wk |
|---|---|---:|---:|
| **A — Drop Blockly, mBlock-only desktop** | (1) Remove `blockly` dep + 9 source files + `postinstall` patch. (2) Refactor `NewElabSimulator.jsx` to skip the editor pane. (3) Build ELAB-Nano-R4 `.mext` (23 blocks + 48 transcodings ported into Extension Builder + Renesas core PoC). (4) Update 13 Vol3 experiments to remove `scratchXml` field. (5) Update UNLIM RAG strings. (6) Vol4 author training for Riccardo. | **1-2** | 40-80 |
| **B — mBlock + web bridge (paste/upload)** | All of Path A + (7) text-area / file-upload UI in `elab-builder`. (8) Arduino C validator (sanitize against AVRBridge expectations OR replace AVRBridge with Renesas simulator — large unknown). (9) Optional: custom web port of mBlock-style blocks (Scratch-like UI from scratch, ~20-block subset of Vol4) ≈ 4-6 FTE-weeks alone. (10) UNLIM code-aware intents for Vol4. | **6-10** | 240-400 |
| **C — Hybrid (Blockly Vol1-3 + .mext Vol4 desktop)** | (1) Build ELAB-Nano-R4 `.mext` (Extension Builder, 1-2 weeks). (2) Renesas RA4M1 core PoC (parallel, 3-5 days). (3) Add `#vol4` route in `elab-builder` (narrative + simulator visualization, no editor). (4) Cross-link instructions to mBlock 5 desktop. (5) Authoring guide for Riccardo. (6) **Do not touch** Vol1-3 stack. | **3-5** | 120-200 |

### Risk hot spots

1. **AVRBridge incompatibility with Nano R4** — `src/components/simulator/engine/AVRBridge.js` (1242 LOC) wraps `avr8js`, which emulates **ATmega328p only**. Nano R4 = Renesas RA4M1 Cortex-M4 (32-bit, different pin map: D0-D13 + A0-A7 but different port registers, no PORTD/PORTB/PORTC abstraction). Today's simulator already does NOT match the Nano R4 hardware — it emulates an AVR. Any path that wants the in-browser simulator to actually execute Nano R4 binaries needs a Cortex-M4 emulator (no maintained JS option exists today comparable to avr8js). Mitigation: keep AVRBridge as "AVR teaching simulator" and explicitly disclose to teachers; or invest in a Cortex-M4 PoC (12-20 FTE-weeks, unrelated to mBlock).
2. **Renesas RA4M1 core in mBlock 5** — undocumented officially. Community workaround for UNO R4 Wi-Fi exists. PoC required first week of any path. Rollback: drop Nano R4 from Vol4 and use UNO R4 Minima (same MCU, better mBlock coverage) or fall back to Nano classic.
3. **23 Blockly custom blocks → 23 mBlock custom blocks** — direct mechanical port but each block needs UI re-design in Extension Builder (no batch import). Estimate 4-6 hours per block once Builder workflow is learned. Total 100-140 hours just for blocks. This is the dominant cost in Path A and a fixed cost in any path that ships a `.mext`.
4. **48 Arduino C++ generators** — each maps to one mBlock transcoding template. Same per-block hand-port (no automated conversion).
5. **Chromebook fleet** — if Vol4 schools are Chromebook, Path A and Path C are unusable in those schools. Unknown today.
6. **Two-tool UX friction for 8-12 year olds** — pedagogical regression Path A/B/C all exhibit, mitigated by Vol4 = older audience hypothesis.
7. **Vendor lock-in on Makeblock** — `.mext` format and Extension Builder are Makeblock-controlled. If Makeblock changes terms or deprecates the Builder, we own zero exit strategy.
8. **UNLIM Morfismo Sense 1.5 degrades for Vol4** — UNLIM's "see the kid's code in real time" capability requires the editor inside the SPA. mBlock 5 desktop is a separate process; UNLIM coverage drops to "read the book + see the kit (camera)" for Vol4.

### Rollback plan if pivot fails

- **At PoC stage (week 1)**: if Renesas RA4M1 cannot be made to flash from mBlock 5 with a custom device, **abandon mBlock entirely** for Vol4. Two recoveries: (i) keep Blockly + author Vol4 against Blockly (Riccardo declines but Andrea keeps the Vol4 narrative software-side); (ii) downgrade the kit to a `mBlock-supported Nano` (classic AVR) for Vol4 only.
- **At `.mext` build stage (weeks 2-3)**: if Extension Builder cannot host all 23 blocks (unlikely but possible due to undocumented limits), reduce Vol4 block set + advise Riccardo accordingly.
- **At Vol4 deploy stage (weeks 4-5)**: if schools reject the two-tool flow within first 2 weeks of Vol4 release, freeze Vol4 distribution + escalate to Path B web port build (additional 4-6 FTE-weeks).
- **At full migration consideration (iter 70+)**: only commit Vol1-3 migration to mBlock once Vol4 has 4+ weeks of green production data AND school feedback explicitly demands convergence.

---

## C5 — Andrea ratification request

Andrea must decide the following **before** any code is written:

- [ ] **D1**: Path A vs B vs **C (recommended)**. If C, set the iter-70 (or equivalent) gate to evaluate Path B convergence based on Vol4 school feedback.
- [ ] **D2**: Vol4 target audience age + Chromebook prevalence in target schools. If Chromebook-only schools must be served, Path C is dead — go Path B web port.
- [ ] **D3**: Renesas RA4M1 PoC owner (Andrea? Omaric? Riccardo?) and 5-day deadline. Without PoC pass, all paths block.
- [ ] **D4**: `.mext` maintenance ownership long-term — added to repo? versioned externally? Who owns the Makeblock account hosting the Extension Builder project?
- [ ] **D5**: UNLIM coverage requirement for Vol4 — "real-time code coaching" (requires Path B paste-bridge minimum) vs "book + kit + LIM-narrative" (Path C is enough).
- [ ] **D6**: Riccardo's authoring deadline (date he needs the `.mext` to start Vol4 authoring) — sets engineering critical path.
- [ ] **D7**: Vol1-3 stay on Blockly indefinitely? Confirm "elimino blockly e adatto" was Vol4-scoped, not a global pivot (current evidence: WhatsApp message context was Vol4 + mBlock for schools that ask by name — not a blanket replacement).
- [ ] **D8**: Budget cap for Path B web port if Path C convergence is triggered later (4-6 FTE-weeks ≈ 1-1.5 months of single-dev work — competes with other Sprint U+V backlog).
- [ ] **D9**: Acceptable scope reduction for Vol4 block set if Extension Builder limits surface (e.g., drop LCD blocks from Vol4 = how much narrative impact?).
- [ ] **D10**: Position with Riccardo if PoC fails — does ELAB pivot kit to UNO R4 / Nano classic, or do we tell Riccardo "Vol4 stays on Blockly"?

---

## Sources

- mBlock Help Center — About Extension Builder: `https://support.makeblock.com/hc/en-us/articles/15232549794199-About-mBlock-5-Extension-Builder`
- mBlock Help Center — Add an Arduino Device: `https://support.makeblock.com/hc/en-us/articles/15237477323543-Example-Arduino-Device-Add-an-Arduino-Device`
- mBlock Help Center — Transcoding Setting Upload Mode: `https://support.makeblock.com/hc/en-us/articles/15236617061783-Configuration-Transcoding-Setting-for-the-Upload-Mode`
- Makeblock Education — Add an Arduino Device: `https://education.makeblock.com/help/arduino-device-add-an-arduino-device/`
- Makeblock Forum — Create your own mBlock 5 extensions: `https://forum.makeblock.com/t/create-your-own-mblock-5-extensions-with-mblock-extension-builder/13909`
- Makeblock Forum — Arduino UNO R4 Wi-Fi work with mBlock (SOLVED): `https://forum.makeblock.com/t/solved-does-arduino-uno-r4-wi-fi-work-with-mblock/23353`
- Makeblock Forum — Arduino Nano and mBlock 5 extensions: `https://forum.makeblock.com/t/arduino-nano-and-mblock-5-extensions/14655`
- GitHub — ArshaFazlollahi/mBlock-Arduino-Extension example: `https://github.com/ArshaFazlollahi/mBlock-Arduino-Extension`
- GitHub — bitkeeper/mfshieldext custom shield example: `https://github.com/bitkeeper/mfshieldext`
- Arduino docs — Nano R4 user manual: `https://github.com/arduino/docs-content/blob/main/content/hardware/03.nano/boards/nano-r4/tutorials/01.user-manual/content.md`
- CNX Software — Arduino Nano R4 launch (Renesas RA4M1, Cortex-M4): `https://www.cnx-software.com/2025/07/25/arduino-nano-r4-board-launched-for-12-10-with-renesas-ra4m1-microcontroller/`

**Internal references**:
- `src/components/simulator/panels/scratchBlocks.js` (23 Blockly custom blocks)
- `src/components/simulator/panels/scratchGenerator.js` (48 Arduino C++ generators)
- `src/components/simulator/panels/ScratchEditor.jsx` (12 toolbox categories, ELAB_THEME)
- `src/data/scratch-xml-templates.js` (19 Blockly workspace templates)
- `src/data/experiments-vol3.js` (13 Vol3 experiments with `scratchXml`)
- `src/components/simulator/engine/AVRBridge.js` (ATmega328p emulator — incompatible with Nano R4 RA4M1)
- `scripts/patch-blockly.js` (Blockly 12.4.1 disposal patch)
- `package.json` — `"blockly": "^12.4.1"`
- `CLAUDE.md` — Morfismo Sense 2 triplet coerenza moat (kit + volumi + software)

---

**End of recon. No code changed. Awaiting Andrea ratification on D1-D10.**
