# Phase 0 Plan — Cross-Compilatore Blockly Arduino DEFINITIVO

**Date**: 2026-05-25
**Source spec**: `docs/prompts/PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md` (382 righe, 23 sezioni, 8-agent matrix)
**Branch corrente**: `fix/unlim-compile-helper-mascot-tweak-2026-05-24` (97 commit ahead `main`, dirty tree REVERT POST-DEMO preserved)
**Baseline**: 14551 test
**Stato**: Phase 0 — audit + plan (NO implementazione)

---

## 1. Executive summary onesto

Lo spec è massivo ma scopre realtà sottovalutata: **>70% dell'infrastruttura cross-compiler esiste già**. Non è un build-from-scratch — è una **integration + polish + WCAG + UNLIM-wire pass** su asset già landed (Sprint B4 codekit + iter 70-82 + ScratchEditor 626 righe + AST translators 591 righe + compiler.js fallback chain 359 righe + 4 E2E spec).

Stima realistica: **8–10 iter** non un'unica sessione. Phase 0 (questo doc) consegna mappa + dispatch plan; le fasi 1-6 vanno schedulate iter successive con team-lead.

**Anti-inflation**: G45 audit memory ferreo. Non dichiarare un'iter "completa" finché ogni atom non ha `BEFORE/CHANGE/AFTER` evidence + CoV 3× + WCAG 0 violations + Codex 0 HIGH open.

---

## 2. Audit BUILT vs MISSING — 23 sezioni spec

Legend: ✅ = built + production. 🟡 = parziale/scheletro. ❌ = mancante. 🔒 = revert-protected (solo READ).

### Sezione 1 — Editor Blockly core
| Item | Stato | Note / File |
|---|---|---|
| Toolbox categories IT | 🟡 | `scratchToolboxProgressive.js` (91 righe) — progressive disclosure; cat completeness TBD audit |
| Search box toolbox | ❌ | NON presente |
| Drag-drop fluido | ✅ | Blockly 12.4.1 nativo, patch-blockly.js per dispose bug |
| Snap magnetic | ✅ | Blockly nativo |
| Zoom +/- center fit-all | 🟡 | Blockly nativo zoom; btn dedicati TBD audit ScratchEditor |
| Pan workspace | ✅ | Blockly nativo |
| Trashbin animation | ✅ | Blockly nativo |
| Undo/redo Cmd+Z/Shift+Z | ✅ | Blockly nativo |
| Copy/paste Cmd+C/V | ✅ | Blockly nativo |
| Cut Cmd+X | ✅ | Blockly nativo |
| Right-click contextmenu | ✅ | Blockly nativo |
| Block disable visual | ✅ | Blockly nativo |
| Comment inline editable | ✅ | Blockly nativo |
| Collapse block | ✅ | Blockly nativo |
| Workspace auto-save 5s/expId | 🟡 | TBD audit ScratchEditor persistence |
| Workspace JSON export/import | 🟡 | SessionExportModal Goal B esiste; wire Scratch TBD |
| Reset workspace template | 🟡 | `scratch-xml-templates.js` 390 righe — wire btn TBD |
| Toolbox collapse/expand | ❌ | NON presente |
| Multiple workspace slots/esp (3 max) | ❌ | NON presente |
| Welcome empty state | 🟡 | `ScratchOnboarding.jsx` 182 righe — audit copy IT |

### Sezione 2 — C++ generation (Blockly.Arduino)
| Item | Stato | Note / File |
|---|---|---|
| Indent 2 spazi | ✅ | `scratchGenerator.js` 497 righe |
| `void setup()` + `loop()` always | ✅ | scratchGenerator |
| `#include` auto Servo.h etc | 🟡 | TBD audit scratchGenerator coverage |
| Variable declarations top | 🟡 | TBD audit |
| Comments dai block-comment | 🟡 | TBD audit |
| pinMode auto-inserted | 🟡 | TBD audit |
| Pretty-print no extra blank | ✅ | scratchGenerator |
| Syntax valid GCC AVR | ✅ | Compilato live via n8n + ELAB Agent |
| No orphan } | ✅ | scratchGenerator |
| Live preview side-panel | 🟡 | ScratchEditor presente; layout 4-zone TBD |
| Toggle Blockly ↔ C++ readonly | 🟡 | TBD audit |
| Toggle Blockly ↔ C++ editable | ❌ | NON presente (modalità docente avanzata) |
| Sync Blockly → C++ instant 200ms | ✅ | scratchGenerator + debounce |
| Sync C++ → Blockly via codeSync | ✅ | `src/features/elabBlocks/codeSync.js` iter 105 (141 righe) |

### Sezione 3 — Bidirectional translator (codeSync.js iter 105)
| Item | Stato | Note / File |
|---|---|---|
| AST parse C++ error recovery | 🟡 | `src/features/elabArduinoAst/generators/*.ts` 591 righe; tolerant TBD audit |
| AST → Blockly XML mapping | ✅ | `astToBlockly.ts` 146 + `arduinoAstToBlockly.ts` 86 |
| Roundtrip identity snapshot | 🟡 | Test esistono in iter 105? TBD audit |
| Unknown C++ → TODO block placeholder | ❌ | NON presente |
| Preserve comments roundtrip | ❌ | NON presente |
| `#define` macros support | ❌ | NON presente |
| `#ifdef` preprocessor | ❌ | NON presente |
| Multi-function support | ❌ | NON presente (solo setup/loop) |
| Error messages IT su parse fail | ❌ | NON presente |

### Sezione 4 — Compile pipeline (n8n + ELAB Agent)
| Item | Stato | Note / File |
|---|---|---|
| POST C++ → endpoint Content-Type text/x-c | ✅ | `compiler.js` 359 righe |
| Timeout 30s + retry 1× backoff | 🟡 | TBD audit retry logic |
| Loading spinner Oswald Navy | ✅ | ScratchCompileBar 293 righe |
| Compile btn states idle/compiling/success/error | ✅ | ScratchCompileBar |
| Error response parser file/line/col | 🟡 | `ScratchErrorOverlay.jsx` 93 — coverage TBD |
| HEX bytes validation Intel HEX | 🟡 | TBD audit compiler.js |
| Size warning > 28KB | 🟡 | `compileSizeParse.js` esiste — wire warning UI TBD |
| RAM usage report | ❌ | NON presente |
| Compile cache hash(C++)→HEX | ✅ | `compileCache.js` |
| Compile counter telemetry | 🟡 | TBD audit |

### Sezione 5 — AVR8js emulator
| Item | Stato | Note / File |
|---|---|---|
| HEX upload via AVRBridge.uploadHex | ✅ 🔒 | `AVRBridge.js` 1242 righe revert-protected |
| Pin states real-time | ✅ 🔒 | AVRBridge |
| Serial Monitor 1000 lines | 🟡 | TBD audit Serial Monitor UI |
| Serial input field + send | 🟡 | TBD audit |
| Speed control slider | ❌ | NON presente |
| Reset btn preserva HEX | ✅ 🔒 | AVRBridge.reset() |
| Pause/Resume Goal C MinimalControlBar | ✅ | Goal C landed |
| Stop = halt + t=0 + clear pin | ✅ | Goal C landed |

### Sezione 6 — USB upload Web Serial **← GAP MAGGIORE**
| Item | Stato | Note / File |
|---|---|---|
| Port detection btn | 🟡 | `webUsbDetect.js` 150 righe — detect only NO upload |
| Filter VID/PID Arduino Nano | 🟡 | `webUsbDetect.js` partial |
| Permission prompt UX | ❌ | NON presente |
| HEX upload progress 0..100% | 🟡 | `mockUsbDfuDevice.js` 297 — solo MOCK |
| avrdude STK500 Web Serial | ❌ | NON presente (mock only) |
| Toast success "Caricato Arduino fisico" | 🟡 | CompileUploadButton 1239 — usa ELAB Agent localhost, NON Web Serial diretto |
| Error toast fail | 🟡 | CompileUploadButton partial |
| Disconnect btn | ❌ | NON presente |
| Browser support check | 🟡 | `compileAgentDetect.js` per agent online; Web Serial check NO |

**Nota strategica**: spec chiede Web Serial diretto browser. Realtà attuale = **ELAB Agent localhost:8765 (arduino-cli)** + **CompileUploadButton wire iter 70+72**. Decisione architettturale Phase 1: mantenere ELAB Agent come primary + Web Serial come secondario fallback OR migrare interamente Web Serial. Richiede ratify Andrea.

### Sezione 7 — UNLIM HomePage integration "totale interacciamento"
| Item | Stato | Note / File |
|---|---|---|
| Chat sempre disponibile floating | 🟡 | `UnlimCompileHelper.jsx` 152 righe — mini-chat presente, full floating TBD |
| Wake word "Ehi UNLIM" homepage | 🟡 | Lavagna ha wake word, homepage TBD |
| Voice STT/TTS | 🟡 | Wire HomePage TBD |
| Vision "Guarda" screenshot + Gemini | 🟡 | API esiste, wire HomePage TBD |
| RAG context Blockly XML + C++ generato | ❌ | NON presente |
| "Aiutami con questo blocco" contextmenu | ❌ | NON presente |
| "Spiega questo errore" on compile fail | 🟡 | TBD wire ScratchErrorOverlay → UNLIM |
| "Suggerisci prossimo blocco" idle 30s+ | ❌ | NON presente |
| "Genera codice da descrizione" → Blockly | ❌ | NON presente |
| UNLIM highlight block via __ELAB_API.unlim | 🟡 | API esiste, scope Blockly TBD |
| Brevità MAX 3 frasi (Principio Zero) | ✅ | iter 41 PM rules |
| Chat history persistente per esp | 🟡 | Wire HomePage TBD |
| UNLIM thinking indicator | ✅ | Mascotte parla animation esiste |
| Cold start 18s friendly | 🟡 | TBD audit copy |

### Sezione 8 — UNLIM Vol3 esp integration
| Item | Stato | Note / File |
|---|---|---|
| Stessa chat PassoPassoUnifiedPanel | 🟡 | Goal D/E/F landed, UNLIM wire TBD |
| Esp-context experimentId + currentStep + buildSteps | ✅ | unlimContextCollector.js 250 |
| "Dove sono?" step+page+cliffhanger | 🟡 | TBD wire |
| Highlight Blockly block + simulator coord | ❌ | NON presente |
| Pin map awareness "D9 primo LED" | 🟡 | TBD audit |
| Cliffhanger CTA Goal E pattern | ✅ | Goal E landed |

### Sezione 9 — UI/UX layout
| Item | Stato |
|---|---|
| HomePage Codekit 4-zone (Blockly+C+++Serial+UNLIM) | 🟡 HomeCompileEntry 525 righe — audit layout |
| Vol3 esp Blockly underlay/floating | ❌ NON presente |
| Full-screen Blockly Esc to exit | ❌ |
| Resize drag handle persist | ❌ |
| Tab keyboard cycle | 🟡 audit |
| Compile btn top-right + bottom mobile | 🟡 audit |
| Upload btn separato Compile | ✅ CompileUploadButton |
| Save Sessione AppHeader | ✅ Goal B |
| Stop/Play/Pause/Reset Arduino esp | ✅ Goal C |

### Sezione 10 — Accessibility WCAG AA
**Stato**: 1 test E2E presente `tests/e2e/07-blockly-accessibility.spec.js` — audit completo TBD. Spec ha 16 item — assumere ~50% built (focus ring, ARIA partial), 50% gap (Tab cycle blocks, screen reader, prefers-reduced-motion).

### Sezione 11 — Internationalization
**Stato**: 🟡 stringhe IT predominanti, Blockly.Msg.SETUP_FUNCTION TBD audit copertura, error compiler IT mostly OK.

### Sezione 12 — Performance
| Item | Stato |
|---|---|
| Editor lazy load React.lazy | 🟡 HomeCompileEntry usa lazy mount; audit |
| Blockly worker chunk separato | 🟡 vite.config.js TBD audit |
| avr8js worker chunk separato | 🟡 |
| Workspace > 50 block virtualization | ❌ |
| HEX compile cache LRU 20 | 🟡 compileCache TBD limit |
| Service worker precache pdf+blockly | ✅ PWA presente |
| FCP < 2s 4G | 🟡 audit benchmark |
| TTI < 4s | 🟡 audit |
| No layout shift compile loading | 🟡 audit |

### Sezione 13 — Mobile/tablet/LIM
**Stato**: LIM-first design già in `.impeccable.md`. Touch drag, pinch zoom, responsive collapse → mostly nativo Blockly + check audit.

### Sezione 14 — Error handling
**Stato**: ScratchErrorOverlay 93 righe partial. Wire UNLIM "Aiuta a capire", offline detect, browser unsupported fallback → gap maggiore.

### Sezione 15 — Persistence
**Stato**: localStorage 5s 🟡 audit, JSON export Goal B ✅, Supabase cloud save 🟡 audit, multi-device conflict ❌.

### Sezione 16 — Documentation/help
**Stato**: First-time tutorial overlay homepage ❌, block hover tooltip Vol3 page link ❌, "?" context-aware ❌. Tutto gap.

### Sezione 17 — Cross-compilatore Vol3 esp specific
| Item | Stato |
|---|---|
| Sample code template per esp | ✅ scratch-xml-templates.js 390 righe |
| Reset to template btn | 🟡 wire TBD |
| Step Passo Passo Goal D | ✅ Goal D landed |
| Cliffhanger Goal E | ✅ Goal E landed |
| Codice esp salva per-esp slot | 🟡 audit persistence |
| 8-esp whitelist v3-cap6-esp4 + esp5 | ✅ experiment-visibility.js |
| Defensive fallback whitelist | ✅ |

### Sezione 18 — Testing surface MANDATORY
**Esistente**:
- 4 E2E Playwright: `05-cross-compile-mock-board`, `06-blockly-first-block-60s`, `07-blockly-accessibility`, `cross-compile-upload-e2e`
- Baseline 14551 vitest test totali

**Gap**: codeSync roundtrip ≥30 test, block→C++ snapshot, C++→XML, E2E v3-cap6-esp4+esp5 full cycle, HomePage Codekit drag→compile→sim, compile latency regression <5s p95, CoV 3× protocol, coverage codeSync ≥80%.

### Sezione 19 — Anti-regressione FERREA
**Stato**: 11 invariants spec, tutte già policy enforced (CLAUDE.md REVERT POST-DEMO + experiment-visibility.js whitelist + Battery9V.jsx + engine files revert-protected + baseline-tests.txt + CoV mandate + npm run build pre-commit + curl elabtutor.school 200).
**Azione Phase 0**: nessuna — vigilanza continua per-atom.

### Sezione 20 — Sicurezza
| Item | Stato |
|---|---|
| C++ source size limit 100KB | ❌ |
| No eval client-side | ✅ |
| HEX validation + 32KB cap | 🟡 audit |
| Web Serial scope Arduino VID/PID | 🟡 webUsbDetect partial |
| XSS prevention C++ display escape | 🟡 audit |
| CORS n8n endpoint | ✅ |
| Rate limit compile 30/min | ❌ |
| localStorage workspace 500KB cap | ❌ |

### Sezione 21 — Estetica + micro-dettagli
**Stato**: 25 item — molti nativo (cursor, hover, focus-visible, tooltip delay 500ms), alcuni gap (confetti su first compile, network status icon, save indicator, ElabIcons.HammerIcon nuovo, sintassi highlight C++ palette ELAB).

### Sezione 22 — Documentation deliverables
**Gap**: questo doc è Phase 0 ✅. Resto:
- `docs/architectures/blockly-arduino-cross-compiler.md` C4 ❌
- CLAUDE.md sezione UNLIM AI + Cross-compilatore narrative ❌
- `.impeccable.md` update Codekit zone ❌
- PROMPT-NEXT-SESSION post-ship ❌
- Memory observation_add summary ❌

### Sezione 23 — Quality gate criteria PRE-DEPLOY
**Da eseguire ogni iter close**:
- `/elab-quality-gate` PASS
- `/elab-benchmark` delta ≥ +0.3
- `/elab-book-parity` v3-cap6-esp4 + esp5 ≥ 8/10
- `/impeccable:critique` Nielsen ≥ 32/40
- WCAG axe-core 0 violations
- Codex 0 HIGH open

---

## 3. File ownership matrix raffinata

| Agent | Exclusive files | Note |
|-------|-----------------|------|
| **Impl-A-Toolbox-IT** | `src/components/simulator/panels/scratchToolboxProgressive.js`, `src/components/simulator/panels/scratchBlocks.js` (extend), NEW `src/i18n/blockly-msg-it.js` | Toolbox completa categorie IT + Blockly.Msg.* override + search box |
| **Impl-B-Codegen-CodeSync** | `src/components/simulator/panels/scratchGenerator.js` (extend coverage), `src/features/elabBlocks/codeSync.js` (tolerant parse + comment preserve + #define/#ifdef), `src/features/elabArduinoAst/generators/*.ts` | Bidirectional translator hardening |
| **Impl-C-Compile** | `src/services/compiler.js` (extend retry/timeout/RAM report), `src/components/simulator/utils/compileCache.js` (LRU 20), NEW `src/utils/intelHexValidator.js` | Compile pipeline hardening + cap + telemetry |
| **Impl-D-Upload-WebSerial** | NEW `src/services/usbUploadService.js` (Web Serial STK500), `src/services/webUsbDetect.js` (extend filter VID/PID Nano R4 + Uno) | DECISIONE: complementare ELAB Agent (primary) NON replace |
| **Impl-E-UNLIM-HomePage** | `src/components/home/HomeCompileEntry.jsx` (extend chat zone), `src/components/home/UnlimCompileHelper.jsx` (full chat + voice + vision wire), `src/services/unlimContextCollector.js` (include Blockly XML + C++ generato in collectFullContext) | Chat sempre disponibile + RAG Blockly-aware |
| **Impl-F-UNLIM-Vol3** | `src/components/lavagna/PassoPassoUnifiedPanel.jsx` (UNLIM wire), `src/data/lesson-paths/v3-cap6-esp4.json` + `v3-cap6-esp5.json` (Blockly template metadata) | Vol3 chain + Blockly highlight coord |
| **Impl-G-Tests** | `tests/unit/features/elabBlocks/*` (≥30 roundtrip), `tests/unit/services/compiler.test.js`, `tests/e2e/blockly-*-spec.js` (extend v3-cap6-esp4+esp5 full cycle, HomePage Codekit drag→compile→sim) | TDD red-green per ogni atom altro impl |
| **Impl-H-A11y-Polish** | ARIA + focus + screen reader sweep cross-file (esclusivo sweep dimension, NO file overlap altro impl), CSS micro-polish (confetti, save indicator, network icon, ElabIcons.HammerIcon NEW) | WCAG axe-core 0 violations target |

**Revert-protected (READ-ONLY tutti agent)**: `CircuitSolver.js`, `AVRBridge.js`, `PlacementEngine.js`, `useCircuitHandlers.js`, `Battery9V.jsx`.

---

## 4. Iter breakdown realistico (8-10 iter)

### Iter X.1 — Foundation + ownership lock-in (1 sessione)
- Branch nuovo `feature/blockly-crosscompiler-definitivo` da `main` (worktree dedicato)
- Plan doc PR draft + Andrea ratify ownership matrix
- Baseline benchmark + WCAG axe-core baseline + screenshot regression baseline

### Iter X.2 — Wave 1 parallel first-slice (4 impl disjoint, SHIPPED 2026-05-25)
**Status: CLOSED. 5 commit landed worktree feature/blockly-crosscompiler-definitivo.**

Scope CAPPED per atom (~1h each) for ship-over-sprawl Karpathy discipline. elabArduinoAst refactor (1185 LOC actual vs 591 stale spec) DEFERRED to Wave 1b/X.2b. PR per-iter (R8 Andrea-default ratified).

| Atom | SHA | Files | LOC | Tests new |
|------|-----|-------|-----|-----------|
| Impl-B scratchGenerator pinMode auto-emit | `0c3e48e3` | scratchGenerator.js + .pinMode.test.js | +205/-1 | 5 |
| Impl-C compileCache LRU 20 + n8n retry [1s,2s] 5xx-only | `ef50e968` | compileCache.js + compiler.js + tests | +356/-33 | 10 |
| Impl-G CoV script + v3-cap6-esp4 E2E skeleton (skipped) | `b1e19e14` | scripts/cov-blockly.sh + 08-spec.js | +73 | 3 Playwright stub |
| Impl-A 15 IT Blockly.Msg + ScratchEditor wire | `12c49be6` | blockly-msg-it.js + ScratchEditor.jsx + test | +277 | 21 |
| Fix regression ScratchEditor-callbacks T1/T2/T3 | `62bd32ae` | ScratchEditor.jsx + blockly-msg-it.js | +19/-9 | (3 unblocked) |

**Verification close gate**:
- ✅ CoV 3× IDENTICAL Test Files 3 failed | 422 passed | 2 skipped (427) — 9 fails ALL pre-existing UnlimCompileHelper baseline, NO Wave 1 contribution
- ✅ npm run build exit 0 (50s, PWA 27 entries 2076.13 KiB)
- ✅ intelHexValidator wiring preserved (verified line 13 + 363 compiler.js)
- ✅ File ownership matrix respected post-fix (Impl-A initial swept G files, self-recovered via reset+recommit clean)

### Iter X.2b — Wave 1b expansion (CLOSED 2026-05-25/26)
**Status: CLOSED. 5 atomic commits + 1 regression fix landed worktree feature/blockly-crosscompiler-definitivo via agent-teams team-lead 4-parallel dispatch.**

Scope FOLLOWED Wave 1 file ownership matrix (immutable). elabArduinoAst Wave 2 still DEFERRED (1185 LOC cascade risk preserved). Codex stop-time review caught 1 real regression (arduino_rgb_led missing generator) fixed defensively.

| Atom | SHA | Files | LOC | Tests new |
|------|-----|-------|-----|-----------|
| Impl-A-2 (i18n) | `41582af5` | blockly-msg-it.js + blockly-msg-it.test.js | +415/-24 | +52 (21→73) |
| Impl-A-2 (toolbox) | `d149bbf1` | scratchToolboxProgressive.js + scratchBlocks.js + scratchToolboxProgressive.test.js | +492/-16 | +21 (5→26) |
| Impl-B-2 (codegen) | `75244099` | codeSync.js + starterTemplates.js + scratchGenerator.js + 2 test files | +967/-8 | +25 internal + 20 contract |
| Impl-C-2 (compile) | `58ecc5fc` | compiler.js + compileCache.js + NEW services/compiler.test.js + compileCache.lru.test.js + existing compiler.test.js fixtures | +651/-16 | +29 NEW + 8 ext + 4 fixture |
| Impl-G-2 (tests) | `95222e79` | 3 NEW spec + roundtrip contract + perf bench + README + UNSKIP 08 | +1037/-14 | +20 roundtrip + 13 E2E (11 fixme markers) |
| Fix #1 | `1cc0146b` | scratchGenerator.js + scratchGenerator.pinMode.test.js | +124/-0 | +5 regression |
| Fix #2 | `fe1f843b` | starterTemplates.js + starterTemplates.test.js | +15/-0 | +1 regression (T4) |

**Verification close gate**:
- ✅ Independent CoV 3× (lead-direct) POST all 6 commit: `3 failed | 425 passed | 2 skipped (430)` IDENTICAL — 9 pre-existing UnlimCompileHelper/HomeCompileEntry fails unchanged, ZERO Wave 1b contribution to failures
- ✅ npm run build exit 0 × all atoms (per-implementer report)
- ✅ File ownership matrix respected (no cross-owner cached diff)
- ✅ elabArduinoAst/* UNTOUCHED (Wave 2 deferred preserved)
- ✅ intelHexValidator.js + api.js + revert-protected engine files UNTOUCHED
- ⚠️ Impl-G E2E 11 FIXME markers (upstream wait — AVR8js stateChange + IT toolbox label deps + cliffhanger wire) documented honest deferral

**Codex catch + recovery**:
- Codex stop-time review #1: caught arduino_rgb_led block registered (Impl-A d149bbf1 scratchBlocks.js:422) without generator in scratchGenerator.js → "Unknown generator" runtime crash risk
- Impl-B fix #1 1cc0146b: added arduino_rgb_led generator (3× analogWrite R/G/B pattern matching arduino_servo_write) + defensive controls_whileUntil regression tests (already wired line 330, verified)
- Codex stop-time review #2: invalid JSON output (review system flake, NOT actual issue at first parse)
- Codex stop-time review #3: caught BUTTON_LED_XML starterTemplates.js controls_if missing `<mutation else="1"/>` → Blockly silently drops ELSE statement branch on hydrate, button-led template loads with only HIGH path
- Impl-B fix #2 fe1f843b: added `<mutation else="1"/>` first child of BUTTON_LED controls_if + T4 regression test verifying hydrated workspace generates BOTH digitalWrite(13, HIGH) AND digitalWrite(13, LOW). BUTTON_XML + SERIAL_ECHO_XML verified clean (no ELSE branches present).
- Lead-direct grep cross-reference: confirmed only arduino_rgb_led was real missing generator. Lead initial diagnosis included controls_whileUntil incorrectly (regex `[a-z_]+` missed capital U). Impl-B corrected during fix.

### Iter X.3 — Wave 2 parallel (CLOSED 2026-05-26 — Andrea ratify scope-narrow 2 atom)

Andrea pre-start ratify questions (4 decisioni dispatched via AskUserQuestion):
1. **Wave 2 scope** → `1 atom solo (Impl-D)` — conservative slice, defer Impl-E + F + H to iter X.3b
2. **Vol3 audit P1** → `Inside X.3 P0` — bulk fix 19 placeholder scratchXml (NOT 21 as directive estimated — empirical audit corrected count)
3. **Vol1/Vol2 audit P2** → `Separato iter X.4` — Sprint 8+ scope (38 + 27 esp deferred)
4. **CI red blocker** → `Admin-merge continua` — iter X.6 dedicato CI fix

**Atoms shipped** (2 atomic commits, branch `feature/blockly-wave2-x3` from main 11a67cf0):
- `26280ff0` — feat(upload): unified uploadAgent facade with ElabAgent primary + Web Serial fallback — Wave 2 Impl-D (420 LOC src + 364 LOC test, 21/21 PASS)
- `0e533b41` — fix(data): Vol3 19 esp scratchXml Blockly parity bulk fix + esp4/esp5 over-closure repair — Wave 2 Impl-Vol3 + Wave 1b carryover (19 scratchXml replaced + esp4/esp5 strict-XML repair + 373 LOC test 108/108 PASS)

**Verification close gate PASSED**:
- ✅ Independent CoV 3× IDENTICAL global lead-direct: `3 failed | 428 passed | 2 skipped (433)` / `9 failed | 16214 passed | 15 skipped | 10 todo (16248)` — Wave 1b baseline `3 failed | 425 passed | 2 skipped (430)` preserved + 3 new test files (uploadAgent + vol3-parity + 2 previously silently-failing tests now green)
- ✅ npm run build exit 0 (19.28s, PWA 27 entries 2081.64 KiB precache)
- ✅ Test Files baseline ≥ 425 PASS — no regression Wave 1b
- ✅ 3 remaining failed Test Files = pre-existing UI test failures (UnlimCompileHelper × 2 + HomeCompileEntry-tabs × 1) unrelated to Wave 2 scope
- ✅ File ownership respected — Atom-D src/services/uploadAgent.js + test exclusive; Atom-Vol3 src/data/experiments-vol3.js + test exclusive; engine files revert-protected untouched

**Pedagogical deviations documented** (5 esp where Blockly registry lacks 1:1 C++ block mapping):
- statoLED toggle (esp7) — approximation, no NOT operator on variable_set
- Volt threshold float math (esp7.2) — approximated as `valoreLetto > 512` (mathematical equivalent)
- analogWriteResolution + analogWrite(A0) (esp7.7) — skipped (no blocks)
- PWM for-loop ramp (esp7.4 + esp7.5) — controls_repeat_ext static counter (no controls_for with variable)
- while(!Serial) (esp8.2) — skipped in SETUP (no equivalent block)

All acceptable: kit-physical build still compiles correctly; only Blockly visual representation diverges from canonical C++.

**Deferred iter X.3b**:
- Impl-E UNLIM-HomePage (chat floating + RAG Blockly-aware + Vision wire)
- Impl-F UNLIM-Vol3 (PassoPassoUnifiedPanel chat wire + esp template Blockly highlight coord)
- Impl-H A11y-Polish (ARIA sweep + focus ring + WCAG audit + ElabIcons.HammerIcon)
- CompileUploadButton.jsx wire-up to uploadHex orchestrator (UI integration)
- Real DFU/STK500 protocol in uploadViaWebSerial (currently writes raw Intel HEX lines stub)

### Iter X.4 — Verify + integration (1 sessione)
- CoV 3× vitest run identical
- npm run build × 2 exit 0
- axe-core 0 violations
- E2E v3-cap6-esp4+esp5 full cycle PASS
- benchmark delta ≥ +0.3

### Iter X.5 — Codex adversarial Phase 3 (1 sessione)
- `codex:codex-rescue` branch review HIGH bug hunt
- Fix HIGH found + ratify MED
- Re-CoV 3× post-fix

### Iter X.6 — Quality gates (1 sessione)
- `/impeccable:critique` Nielsen ≥ 32/40
- `/elab-quality-gate` PASS
- `/elab-book-parity` ≥ 8/10
- `/elab-benchmark` delta capture

### Iter X.7 — Doc + memory + PROMPT-NEXT (1 sessione)
- `docs/architectures/blockly-arduino-cross-compiler.md` C4
- CLAUDE.md narrative update
- `.impeccable.md` Codekit zone
- PROMPT-NEXT-SESSION-post-ship
- memory observation_add

### Iter X.8 — Deploy + ratify (1 sessione)
- `gh pr create` da feature branch
- Andrea ratify screenshot + live walkthrough
- `vercel --prod`
- `curl elabtutor.school` 200
- Memory observation_add summary close

**Optional iter X.9-X.10**: Performance polish (worker chunk audit, virtualization > 50 block) + Sicurezza hardening (size cap C++ 100KB, rate limit 30/min, localStorage 500KB) — solo se quality gate fallisce target +0.3.

---

## 5. Risk register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R1**: Web Serial vs ELAB Agent decisione non ratificata | High | High | Iter X.1 chiede ratify Andrea esplicito prima Impl-D start |
| **R2**: Branch corrente 97 commit ahead main → merge conflict massivo worktree nuovo | High | Medium | Worktree separato da `main` pulito; merge corrente branch separato concern |
| **R3**: codeSync.js (141 righe) tolerant parser scope creep — full C parser >> 141 righe | High | Medium | Phase 1 limita a 5 costrutti specifici (define, ifdef, multi-fn, comment preserve, TODO placeholder); resto deferred iter X.9 |
| **R4**: UNLIM home chat full = bloat UnlimCompileHelper 152→500+ righe | Medium | Medium | Split component: `UnlimChatPanel.jsx` floating + `UnlimCompileHelper.jsx` mini |
| **R5**: WCAG axe-core 0 violations target unrealistic single iter | Medium | Low | Iter X.3 Impl-H sweep + iter X.4 verify + iter X.5 Codex review → 3 pass progressivi |
| **R6**: REVERT POST-DEMO dirty tree corrente branch interferisce | High | High | NON toccare dirty tree; lavorare worktree separato da main pulito |
| **R7**: Engine files revert-protected → tentazione modifica AVRBridge per features | Medium | High | Hook `scripts/guard-critical-files.sh` blocca; per-iter pre-flight check |
| **R8**: Spec 23 sezioni single PR = unreviewable | High | High | PR per-iter, max 1 wave = max 4 atom = max ~15 file modify per PR |
| **R9**: Andrea NO DOMANDE → autonomy → over-decide arch issue critico | Medium | High | Decisioni arch (R1, esp template format) flag esplicito in plan, ratify pre-impl |

---

## 6. Success criteria close-progetto (NON close-iter)

Da spec sezione "SUCCESS CRITERIA close-sessione":

- [ ] Tutti 23 punti checklist 100% verde (CoV per-item)
- [ ] HomePage Codekit live: Blockly drag → compile → sim pin states + UNLIM chat conversa
- [ ] v3-cap6-esp4 + v3-cap6-esp5 full ciclo (Blockly → compile → upload USB/AVR8js → pin states)
- [ ] Vol3 chain cliffhanger funziona (esp4 sirena finito → "Prossimo · v3-cap6-esp5 semaforo")
- [ ] Codex 0 HIGH open + tutti MED applicati o ratify Andrea
- [ ] CoV 3× IDENTICAL output
- [ ] WCAG axe-core 0 violations
- [ ] `/elab-quality-gate` PASS
- [ ] `/elab-book-parity` ≥ 8/10
- [ ] `curl elabtutor.school` 200
- [ ] Andrea ratify screenshot + commit final + push PR

---

## 7. Decisioni Andrea required PRIMA Iter X.2 start

1. **R1 ratify**: Web Serial diretto OR ELAB Agent primary + Web Serial fallback OR ELAB Agent only?
2. **R8 ratify**: PR per-iter (8-10 PR total) OK?
3. **Branch policy**: nuovo worktree `elab-builder-blockly-definitivo` da `main` pulito? OR estendere branch corrente `fix/unlim-compile-helper-mascot-tweak-2026-05-24`?
4. **Iter X.2 start green-light**: dispatch team-lead con questo plan come input?

---

## 8. Next action immediata

Andrea ratifica plan → spawn `agent-teams:team-lead` con scope Iter X.2 Wave 1 + ownership matrix lock-in.

Senza ratify, Phase 0 chiusa qui — solo doc committed.

---

**FINE PHASE 0 PLAN.** No impl atom in questa sessione (anti G45 inflation). 8-10 iter realistic dispatch successivo.
