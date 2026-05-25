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

### Iter X.2 — Wave 1 parallel (4 impl disjoint, 1 sessione)
- Impl-A Toolbox-IT (completeness audit + search box + collapse + welcome state)
- Impl-B Codegen-CodeSync (tolerant parse + comment preserve + TODO placeholder unknown C++)
- Impl-C Compile (retry exponential + RAM report + Intel HEX validator + LRU 20)
- Impl-G Tests (snapshot + roundtrip ≥30 + 2 nuovi E2E)

### Iter X.3 — Wave 2 parallel (4 impl, 1 sessione)
- Impl-D Upload-WebSerial (decisione ELAB Agent primary + Web Serial fallback)
- Impl-E UNLIM-HomePage (chat floating + RAG Blockly-aware + Vision wire)
- Impl-F UNLIM-Vol3 (PassoPassoUnifiedPanel chat wire + esp template Blockly highlight coord)
- Impl-H A11y-Polish (ARIA sweep + focus ring + WCAG audit + ElabIcons.HammerIcon)

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
