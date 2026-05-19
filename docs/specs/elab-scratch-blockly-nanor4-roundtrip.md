# ELAB Scratch Arduino + Roundtrip C++↔Blocks + Nano R4 — Technical Spec

**Date**: 2026-05-18 | **Branch target**: `feat/elab-scratch-blockly-roundtrip-nanor4`
**Status**: PROPOSED — Andrea ratify needed before iter 83 dispatch
**Scope**: 4 sub-project, 95-160h total, Sprint V multi-week iter 83-101

## §1 Stato attuale REALE (post iter 82 close)

### Iter 82 close baseline
- **Branch HEAD**: `f69a3a8a` (iter 82 close) + `3bcafaff` (close docs) pushed origin
- **Vitest baseline**: 14489 PASS + 15 skipped + 11 todo
- **E2E iter 82 specs**: `tests/e2e/06-blockly-first-block-60s.spec.js` + `tests/e2e/07-blockly-accessibility.spec.js` 5/5 PASS 14.7s
- **Build PASS** 18s + PWA precache 27 entries 1959 KiB

### Cross-compile Nano R4 chain LIVE (iter 70-82)
- `src/services/elab-agent/server.js` 11.8KB pure async handlers (arduino-cli spawn + 7 error categories)
- `src/services/elab-agent/http-server.js` 501 LOC Express POST /compile /upload /compile-and-upload + GET /health /jobs/:id
- `src/services/elab-agent/sketch-builder.js` 8.1KB SketchBuilder
- `src/boards/arduino-nano-r4.json` board profile
- `src/services/api.js:64` ALLOWED_COMPILE_BOARDS Set incluso `arduino:renesas_uno:nanor4` (iter 72 A7.1)
- `src/components/simulator/NewElabSimulator.jsx:1027` ScratchEditor + ScratchCompileBar wire (iter 72 A7.2)
- `src/components/home/HomeCompileEntry.jsx` Blockly+IDE entry route `#compile-home` (iter 73 CC-2)
- `src/services/compileAgentDetect.js` R4 detect (iter 65)
- `src/components/HomePage/CompileAgentBanner.jsx` R5 banner 4 platform states (iter 66)

### Blockly UX overhaul iter 82 shipped
- `src/components/simulator/panels/ScratchToolbar.jsx` Undo/Redo/Clear/Help + ElabIcons (4 NEW)
- `src/components/simulator/panels/ScratchOnboarding.jsx` 3-step coachmark plurale "Ragazzi" + Vol.1 pag.42
- `src/components/simulator/panels/ScratchErrorOverlay.jsx` 4-pattern IT translation + sanitizeRawError PII
- `src/components/simulator/panels/scratchToolboxProgressive.js` SKELETON dead code (block IDs fabricated, WARNING header)
- `src/styles/elab-blockly-theme.css` PRESERVED disk NOT imported (conflict dark ELAB_BLOCKLY_CSS)

### Blockly current usage prod
- `src/components/simulator/panels/ScratchEditor.jsx` 506 LOC + iter 82 integration ~570 LOC
- `src/components/simulator/panels/scratchBlocks.js` 26 `arduino_*` blocks defined (arduino_analog_read + arduino_analog_write + arduino_base + arduino_delay + arduino_digital_read + arduino_digital_write + arduino_lcd_clear + arduino_lcd_init + arduino_lcd_print + arduino_lcd_set_cursor + arduino_map + arduino_millis + arduino_no_tone + arduino_pin_mode + arduino_pulse_in + arduino_random + arduino_serial_available + arduino_serial_begin + arduino_serial_print + arduino_serial_read + arduino_servo_attach + arduino_servo_read + arduino_servo_write + arduino_tone + arduino_variable_get + arduino_variable_set)
- `src/components/simulator/panels/scratchGenerator.js` 497 LOC C++ codegen arduinoGenerator (Blocks→C++ deterministic)
- `TOOLBOX_XML` 12 cat ScratchEditor.jsx:62+ (Decisioni, Ripeti, Numeri, Variabili, Testo, Accendi e Spegni, Suoni, Motore Servo, Schermo LCD, Tempo, Comunicazione, Sensori)

### Lacune REALI iter 82 close

| Categoria | Lacuna | Impact | Iter ref |
|---|---|---|---|
| **UX** | TOOLBOX_XML 12 cat from-launch = cognitive overload kids 8-14 | HIGH | iter 82 plan §Why §1 |
| **UX** | Schermata iniziale workspace VUOTA (solo arduino_base block) | HIGH | Andrea FASE 3 mandate |
| **UX** | NO StarterButtons "Accendi LED" / "Leggi pulsante" / "Leggi sensore" | HIGH | Andrea FASE 3.2 |
| **UX** | NO Modalità docente vs studente toggle | MED | Andrea FASE 3.4 |
| **UX** | NO "Spiegami questo blocco" button per-block | MED | Andrea FASE 3.5 |
| **UX** | Blocchi labels = generici inglese (digitalWrite, delay) NON italiano scolastico (accendi LED su pin) | HIGH | Andrea FASE 3 Blocchi minimi |
| **A11Y** | Codex HIGH-2 iter 82 ScratchOnboarding NO focus trap WCAG 2.4.3 | HIGH | iter 82 deferred |
| **A11Y** | NO keyboard navigation workspace block insertion (drag-only) | HIGH | Andrea FASE 6.1 |
| **A11Y** | NO screen reader aria-label compilazione/errore/conversione live announce | HIGH | Andrea FASE 6.2 |
| **A11Y** | NO high contrast mode toggle | MED | Andrea FASE 6.3 |
| **A11Y** | code-reviewer MED-3 iter 82 ScratchErrorOverlay regex too broad | MED | iter 82 deferred |
| **A11Y** | axe-core full WCAG 2.2 AA audit NOT shipped (regola 13 Andrea ratify @axe-core/playwright pending) | HIGH | iter 82 deferred |
| **Compile** | arduino_pulse_in + arduino_random + arduino_lcd_* + arduino_servo_* + arduino_serial_available + arduino_serial_read = legacy AVR oriented (Nano R4 = Renesas RA4M1 Cortex-M4 NOT ATmega328p) | MED honest disclosure missing | Andrea FASE 5 |
| **Compile** | avr8js emulator preserved Vol1+Vol2 (correct iter 79.A A2 ROLLBACK) MA UI NON dichiara honest "Simulato logicamente NON emulato CPU Nano R4" | MED | Andrea FASE 5 |
| **Roundtrip** | NO C++→Blocks reverse parser exists (iter 67 PHASE 5 confirmed 4 GitHub repos research: ALL have NO reverse) | CRITICAL Andrea explicit | Andrea FASE 4 |
| **Roundtrip** | arduinoGenerator Blocks→C++ existing 497 LOC ma NO normalizeArduinoCpp NO roundtripGuards NO unsupportedCodeBlock | HIGH | Andrea FASE 4 |
| **Roundtrip** | NO AST intermediate model | HIGH | Andrea FASE 4 |
| **Errors** | arduino-cli stderr passed to ScratchErrorOverlay 4 pattern only (iter 82 T4). NO Italian translation table esaustiva per Renesas Nano R4 errori specifici | MED | Andrea FASE 7 |
| **Testing** | E2E "5/5 PASS" iter 82 MA 2/5 duplicate mount checks (code-reviewer MED-1). NO real drag block + compile + flash assertion | HIGH | code-reviewer iter 82 |
| **Testing** | NO real-user simulation Playwright + Chrome MCP iter 82 (6 personas × 15 flussi) | HIGH | Andrea FASE 1 |
| **Hardware UAT** | Nano R4 USB physical flash NEVER verified Andrea/Tea/Riccardo Omaric | CRITICAL | iter 79.A+82 carryover |

## §2 4 sub-project Architecture proposal

### Sub-project A — ELAB Scratch Arduino UX deep (estende iter 82, ~30-40h, Sprint V iter 83-86)

Andrea FASE 0+1+3+6+7 mandates. Scope:
- FASE 0 truth: read .impeccable.md + CLAUDE.md + spec + grep codebase + produce spec doc (questo)
- FASE 1 real-user audit: 6 personas × 15 flussi Playwright + Chrome MCP, output `docs/audits/elab-blockly-user-audit-2026-05-18.md`
- FASE 3 ELAB Scratch Mode UX 21 requirements (3 StarterButtons + 9 cat toolbox ridotta + 4 docente/studente toggle + 5 "Spiegami" + 6 "Mostra/Torna C++" + 7 "Compila Nano R4" + 8-9 pannelli circuito/breadboard + 10 next-block suggestion + 11 search + 12 tooltip dinamici + 13 help URL + 14 errori IT + 15 NO emoji + 16 touch 44 + 17 font min + 18 WCAG AA + 19 focus visible + 20 keyboard usable)
- FASE 6 a11y (keyboard + screen reader + visual + motor + didattica)
- FASE 7 errori autoesplicativi (Italian translation table)
- FASE 8 a11y tests axe + keyboard + contrast (regola 13 axe-playwright Andrea ratify required)

### Sub-project B — Roundtrip C++↔Blocks (~40-80h, Sprint V iter 87-95)

Andrea FASE 2+4 mandates. Scope:
- FASE 2 NON usare scratch-blocks come compilatore (study UX only)
- FASE 4 AST + ELAB subset parser + cppPatternImporter + unsupportedCodeBlock + roundtripGuards
- Strategy: NO tree-sitter-cpp (browser bundle prohibitive ~5MB) → pattern importer robusto + test golden fixtures
- ELAB subset: setup() + loop() + pinMode + digitalWrite + digitalRead + analogRead + analogWrite + delay + Serial.begin + Serial.print/println + if/else + while semplice + for semplice opzionale + variabili int/bool/float
- Metadata invisibile: `// @elab:block:<type>:<id>` commento strutturato preserve roundtrip
- Unsupported preserved: `// @elab:cpp-advanced:start` ... `// @elab:cpp-advanced:end` → blocco grigio "C++ avanzato" container readonly preview

### Sub-project C — Nano R4 compile chain verify + honest disclosure (~10-20h, Sprint V iter 96-98)

Andrea FASE 5 mandate. Scope:
- Iter 79.A A3 hexBase64 + iter 70 ELAB Compile Agent HTTP server LIVE — verify reali
- Renesas Arm Cortex-M4 RA4M1 48MHz honest disclosure UI (NO avr8js confusion)
- avr8js emulator preserved Vol1+Vol2 simulator path (iter 79.A A2 ROLLBACK confermato), MA disclosure: "Simulato logicamente NON emulato CPU Nano R4"
- Hardware UAT mandatory: Tea/Riccardo Omaric Nano R4 physical USB flash verify
- dfu-util upload chain WebUSB DFU (CompileUploadButton iter 70 + iter 79.A A3 hexBase64) test reale

### Sub-project D — Real-user simulation (~15-20h, Sprint V iter 99-101)

Andrea FASE 1 deep + FASE 8 mandates. Scope:
- 6 personas Playwright headed + Chrome MCP: docente non-tecnico LIM 65-86" + docente laptop + studente 8-14 + keyboard-only + low-vision + motor
- 15 flussi obbligatori per ogni persona
- Misure: tempo capire cosa fare + numero click + confusione points + tech terms incomprensibili + drag-only blockers + focus invisible + help absent
- Output `docs/audits/elab-blockly-user-audit-2026-05-18.md`
- Iteration: ogni gap trovato → ATOM fix → re-test stesso persona+flusso

## §3 PRINCIPIO ZERO + MORFISMO invariants

INVARIANT (NON adattano):
- Linguaggio plurale "Ragazzi," PRINCIPIO ZERO Tea PLAN L9-L23
- Citazione Vol.X pag.Y VERBATIM (canonical map src/data/volume-references.js 94/94 enriched iter 37)
- Kit fisico ELAB protagonist (NON sostituto)
- Docente leads, studenti vedono LIM proiettata
- NO emoji icons (CLAUDE.md regola 11) — ElabIcons SVG only
- Palette Navy #1E4D8C / Lime #4A7A25 / Orange #E8941C / Red #E54B3D
- Font Oswald (titoli) + Open Sans (body) + Fira Code (codice)
- Touch target ≥44×44px (≥48×48 @media coarse pointer LIM/iPad)
- WCAG 2.2 AA: contrast 4.5:1 text + 3:1 graphics

ADATTANO (Sense 1.5 morfismo runtime):
- Modalità docente vs studente UI density
- LIM 1080p vs 4K CSS vars scale
- Età studente (4ª primaria vs 3ª media) → complessità lessicale + analogie target
- Livello competenza classe memoria Supabase → progressivo difficoltà
- Kit Omaric base vs avanzato → componenti visibili subset

## §4 Acceptance criteria (gate per Sprint V close)

### Sub-project A acceptance
- [ ] Audit user `docs/audits/elab-blockly-user-audit-2026-05-18.md` lists 6 personas × 15 flussi REAL execution evidence (screenshot + Playwright trace + Chrome MCP video)
- [ ] ElabScratchModeShell.jsx mount con StarterButtons 3 + toolbox 9 cat beginner + ModeToggle docente/studente
- [ ] 17+ nuovi blocchi ELAB Arduino IT labels (Andrea FASE 3 Blocchi minimi obbligatori) alias arduino_* legacy
- [ ] BlockHelpPanel "Spiegami questo blocco" + "Mostra il codice Arduino" + "Torna ai blocchi" + "Compila per Nano R4"
- [ ] Codex HIGH-2 iter 82 ScratchOnboarding focus trap WCAG 2.4.3 CLOSED
- [ ] axe-core full WCAG 2.2 AA audit ZERO critical + ZERO serious violations su `#compile-home` + lavagna simulator route
- [ ] Keyboard-only flow: docente apre Volume 3 + crea Blink LED + compila Nano R4 SENZA mouse
- [ ] Italian errors translation table ≥20 pattern (arduino-cli stderr → docente IT)
- [ ] Touch target 44×44 verified WCAG 2.5.5 (axe + manual)
- [ ] Contrast WCAG AA verified axe + Lighthouse contrast plugin

### Sub-project B acceptance
- [ ] AST ElabArduinoAst.js + nodes.js validators
- [ ] arduinoGenerator.js Blocks→C++ deterministic (3x CoV stable output identical input)
- [ ] arduinoSubsetParser.js + cppPatternImporter.js: C++ subset → AST 100% supported patterns (golden fixtures 6+ files)
- [ ] unsupportedCodeBlock.js: C++ avanzato preserved come blocco grigio container readonly + metadata `// @elab:cpp-advanced` markers
- [ ] roundtripGuards.js: invariant blocks→C++→blocks identity (no info loss subset) + C++→blocks→C++ stable
- [ ] normalizeArduinoCpp.js: false-diff prevention (whitespace + newline + include order + ELAB comments + semicolons)
- [ ] 11+ unit tests (blocks→AST + AST→C++ + C++→AST + AST→blocks + roundtrip blink/button-led/analog-serial + unsupported preserved + tooltip presence + toolbox beginner subset + Nano R4 cmd builder)
- [ ] 4+ integration tests (compile Blink + Button LED + Analog Serial + PWM Nano R4 reali)
- [ ] Honest disclosure docs/dev/cpp-subset-supported.md: SUPPORTED + UNSUPPORTED + ROUNDTRIP-PRESERVED list

### Sub-project C acceptance
- [ ] scripts/compile-nanor4.sh canonical script FQBN `arduino:renesas_uno:nanor4`
- [ ] arduino-cli core update-index + install `arduino:renesas_uno` automated
- [ ] compileNanoR4 endpoint Express POST /api/compile/nanor4 (iter 70 http-server.js extend)
- [ ] UI dichiarazione honest: "Compilato per Arduino Nano R4 (Renesas RA4M1 ARM Cortex-M4)" vs "Simulato logicamente, NON emulato CPU"
- [ ] Hardware UAT Tea/Riccardo Omaric: 5 sketch Blink + Button LED + Analog Serial + PWM + Servo verified flash REAL Nano R4 USB
- [ ] WebUSB DFU upload chain test (CompileUploadButton iter 70)
- [ ] Honest disclosure docs/dev/nanor4-compile-chain.md: FQBN + toolchain arm-none-eabi + dfu-util + output .bin NON .hex AVR

### Sub-project D acceptance
- [ ] tests/e2e/11-elab-scratch-real-user-personas.spec.js: 6 personas × 15 flussi 90+ tests
- [ ] Playwright trace + Chrome MCP video per persona
- [ ] Lighthouse perf ≥85 + a11y ≥95 + SEO ≥95 + BP ≥95 su `#compile-home` route
- [ ] axe-playwright zero critical + zero serious WCAG 2.2 AA violations
- [ ] Manual keyboard-only sweep verified: 100% workflow keyboard-reachable
- [ ] Low-vision sweep verified: zoom 200% + browser high contrast + screen reader announce
- [ ] Motor sweep verified: touch 44×44 + click area not micro

## §5 Rischi

1. **C++→Blocks parser complexity**: NO browser library exists per parsing C++ subset reliable. tree-sitter-cpp = 5MB bundle prohibitive. Pattern importer + golden tests è MVP, ma può rompersi su C++ variants non-tested.
2. **Hardware UAT dependency**: senza Nano R4 fisico Andrea/Tea/Riccardo, sub-project C NON verificabile end-to-end. Iter 79.A+82 chain shipped MA non-physical-test.
3. **avr8js Vol1+Vol2 preserve mandate**: cannot replace simulator emulator (Vol3 simulationMode=avr per experiments-vol3.js:981+). Nano R4 separate path via CompileUploadButton (iter 79.A A2 ROLLBACK).
4. **axe-core install regola 13**: Andrea ratify @axe-core/playwright devDep MANDATORY pre sub-project A acceptance gate.
5. **Real-user simulation Playwright + Chrome MCP**: requires Chrome MCP browser extension setup (CLAUDE.md mentions installed). Verifica pre-dispatch.
6. **Tea/Davide co-author dependency**: Vol3 14 vs 29 narrative gap (iter 70 TEAM A) carryover 30+ days. Block decisions on cliffhanger-table format.
7. **Scope creep multi-week**: 95-160h totale = 12-20 iter (current 1-iter velocity ~6-12h). Sprint V multi-week strategic commitment Andrea.
8. **Codex GPL-3.0 arduino-cli legal review** (iter 67 PHASE 5 carryover): Codex Pattern V iter 67 §8 noted "arduino-cli GPL-3.0 legal review obbligatorio prima distribution installer".

## §6 Out-of-scope explicit (defer iter 102+)

- Cross-platform installer ELAB Compile Agent (Sprint V+ multi-week, 40-80h alone Apple cert + Windows EV + notarization + dfu-util bundle + auto-update + crash reporting)
- Mistral Vibe Red Team integration (iter 67 PHASE 4 carryover)
- ELAB Quality Harness Phase 2 (Sprint V+ 20+ tools stack)
- ProfPilot Tea PLAN 10 phases (separate Sprint W+ multi-week)
- Vol3 dataset 14 → 29 narrative gap (Davide co-author dependency)
- Sub-project E Vol3 narrative refactor schema (ADR-027 PROPOSED iter 19)

---

(See `docs/superpowers/plans/2026-05-18-elab-scratch-arduino-nanor4-roundtrip.md` for tasks bite-sized TDD implementation)
