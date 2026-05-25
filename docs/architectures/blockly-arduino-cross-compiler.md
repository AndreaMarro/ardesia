# Architecture — Blockly Arduino Cross-Compiler

**Date**: 2026-05-25 (iter X.1.7)
**Spec**: [PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md](../prompts/PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md)
**Plan**: [2026-05-25-blockly-crosscompiler-definitivo.md](../plans/2026-05-25-blockly-crosscompiler-definitivo.md)
**Scope**: documenta architettura runtime del cross-compilatore Blockly↔C++↔HEX↔Arduino end-to-end. Living doc — per-iter updates.

---

## 1. C4 Context (livello 1 — sistema + utenti + dipendenze esterne)

```
                ┌─────────────────────────┐
                │   Docente (LIM/iPad)    │  ← primario, scuola pubblica IT 8-14 anni
                └────────────┬────────────┘
                             │ usa
                             ▼
              ┌──────────────────────────────┐
              │     ELAB Tutor (PWA)         │
              │  React 19 + Vite 7           │
              │  https://elabtutor.school    │
              └─┬───────────┬────────────┬───┘
                │           │            │
       compile  │   upload  │   chat AI  │
                │           │            │
                ▼           ▼            ▼
   ┌─────────────────┐  ┌──────────┐  ┌────────────────┐
   │ Cloud n8n       │  │ ELAB     │  │ Render (UNLIM) │
   │ Hostinger        │  │ Agent    │  │ Gemini RAG     │
   │ /compile         │  │ :8765    │  │ Vol1/2/3 549   │
   │ (arduino-cli)    │  │ FQBN     │  │ chunk          │
   │                  │  │ nano-r4  │  │                │
   └─────────┬────────┘  └────┬─────┘  └────────────────┘
             │                │
             │ HEX response   │ HEX + serial monitor
             ▼                ▼
   ┌──────────────────────────────────┐
   │      Kit fisico ELAB Omaric      │
   │  Arduino Nano R4 + breadboard +  │
   │  componenti + Volume cartaceo    │
   └──────────────────────────────────┘
```

### Attori esterni
- **Docente** primario — guida classe LIM con software ELAB Tutor
- **Studenti** secondari — costruiscono kit fisico, NO interagiscono direttamente
- **Cloud n8n Hostinger** — fallback compile remoto (arduino-cli wrap)
- **ELAB Agent localhost:8765** — compile + upload locale via arduino-cli FQBN `arduino:renesas_uno:nanor4`
- **Render UNLIM** — RAG Vol1/2/3 + chat AI con cold start 18s
- **Vercel** — static hosting frontend
- **Supabase** — sessioni cloud + dashboard docente
- **Kit fisico Omaric** — Arduino Nano R4 hardware (Morfismo Sense 2 mandatory)

---

## 2. C4 Container (livello 2 — moduli interni cross-compiler)

```
┌──────────────────────────────────────────────────────────────────────┐
│  ELAB Tutor PWA — cross-compiler containers                          │
│                                                                       │
│  ┌──────────────────────────┐    ┌──────────────────────────┐        │
│  │  Blockly Editor          │    │  UNLIM chat              │        │
│  │  ScratchEditor.jsx 626   │◄──►│  UnlimCompileHelper.jsx  │        │
│  │  + scratchBlocks 414     │    │  + unlimContextCollector │        │
│  │  + scratchGenerator 497  │    │  + RAG 549 chunk         │        │
│  │  + scratchToolbox        │    └──────────────────────────┘        │
│  └────────────┬─────────────┘                                         │
│               │ Arduino C++ string                                    │
│               ▼                                                       │
│  ┌──────────────────────────┐    ┌──────────────────────────┐        │
│  │  Compile UI              │    │  codeSync (iter 105)     │        │
│  │  ScratchCompileBar 293   │◄──►│  codeSync.js 141         │        │
│  │  CompileUploadButton 1239│    │  + AST translators 591   │        │
│  │  CompileAgentBanner 281  │    │  (bidirectional C++↔BL)  │        │
│  │  HomeCompileEntry 525    │    └──────────────────────────┘        │
│  └────────────┬─────────────┘                                         │
│               │                                                       │
│               ▼                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Compiler Service                                            │    │
│  │  src/services/compiler.js 359                                │    │
│  │                                                              │    │
│  │  Fallback chain:                                             │    │
│  │   1. FAST_PRECOMPILED_MATCHERS (regex code → HEX)            │    │
│  │   2. PRECOMPILED_HEX[experimentId] (direct exp lookup)       │    │
│  │   3. sessionCache (in-mem code-hash → HEX)                   │    │
│  │   4. persistent cache (localStorage code-hash → HEX)         │    │
│  │   5. remoteCompileCode → api.js → ELAB Agent / n8n           │    │
│  │   6. user-friendly error                                     │    │
│  │                                                              │    │
│  │  Defensive HEX validation:                                   │    │
│  │   - fetchHexFile → intelHexValidator (iter X.1.6)            │    │
│  │     checksum + EOF + size cap NANO_R4 256KB                  │    │
│  └────────────┬─────────────────────────────────────────────────┘    │
│               │ {success, hex, source, size, errors}                  │
│               ├──────────────────────────┬───────────────────────┐   │
│               ▼                          ▼                       ▼   │
│  ┌─────────────────────────┐  ┌──────────────────┐  ┌──────────────┐│
│  │  AVR8js emulator        │  │  USB Web Serial  │  │  ELAB Agent  ││
│  │  AVRBridge.js 1242 🔒   │  │  (Iter X.3 GAP)  │  │  upload      ││
│  │  in-browser sim         │  │  STK500 protocol │  │  /compile-   ││
│  │  pin states + serial    │  │  port detect VID │  │   and-upload ││
│  └─────────────────────────┘  └──────────────────┘  └──────────────┘│
│               │                                              │       │
│               └──────────────────┬───────────────────────────┘       │
│                                  ▼                                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Narrative arc transitions (iter 74+75)                      │   │
│  │  ScratchCompileBar cliffhanger CTA + onLoadNextExperiment    │   │
│  │  resolve via getLessonPath(currentExperiment.id).next_exp    │   │
│  │  consumer: NewElabSimulator (Lavagna)                        │   │
│  │  GAP: HomeCompileEntry no current exp context, CTA different │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘

🔒 = engine revert-protected (READ-only fuori da branch authorized-engine-change)
```

### File ownership per container (refined per iter X.2 Wave 1 dispatch)

| Container | File principali | Owner agent | Stato infra |
|-----------|-----------------|-------------|-------------|
| Blockly Editor | `scratch*.{js,jsx}` (5 file 2722 righe) | Impl-A Toolbox-IT | ✅ ricco |
| Compile UI | `*Compile*.{jsx}` (5 file 2891 righe) | Impl-C Compile + Impl-E UNLIM-HomePage | ✅ ricco |
| codeSync + AST | `elabBlocks/codeSync.js` + `elabArduinoAst/*` (732 righe) | Impl-B Codegen-CodeSync | 🟡 partial (scope creep risk) |
| Compiler Service | `services/compiler.js` (359 righe) + `intelHexValidator.js` (160 righe iter X.1.6) | Impl-C Compile | ✅ + ✅ NEW |
| AVR8js engine | `simulator/engine/AVRBridge.js` (1242 righe 🔒) | READ-only | ✅ revert-protected |
| USB Web Serial | NEW `usbUploadService.js` | Impl-D Upload-WebSerial | ❌ MAJOR GAP |
| UNLIM chat | `home/UnlimCompileHelper.jsx` (152 righe) + `services/unlimContextCollector.js` (250) | Impl-E UNLIM-HomePage | 🟡 mini-chat exists, full chat TBD |
| Narrative transitions | `ScratchCompileBar.jsx` cliffhanger (iter 74) + `NewElabSimulator.jsx` wire (iter 75) | Impl-F UNLIM-Vol3 | ✅ wired in Lavagna |

---

## 3. C4 Component (livello 3 — flusso runtime end-to-end)

### Happy path — Blockly drag → upload USB Nano R4

```
1. User drag block in ScratchEditor (Blockly workspace)
   └─► ScratchEditor onChange callback
       └─► scratchGenerator.generateArduinoCode(workspace)
           └─► returns C++ string (Arduino IDE compatible)
               └─► setScratchGeneratedCode(code) in parent

2. User click Compile button (ScratchCompileBar)
   └─► onCompile() → handleCompile(scratchGeneratedCodeRef.current)
       └─► compileArduinoCode(code, {experimentId, board}) [compiler.js]
           ├─► FAST_PRECOMPILED_MATCHERS check (regex code patterns)
           │   └─► if match: fetchHexFile(precompiled.hexFile)
           │       └─► validateIntelHex(text, {maxBytes:256KB}) [iter X.1.6]
           │           ├─► valid → return {success, hex, source:'precompiled', experimentId}
           │           └─► invalid → log WARN + return null + fallthrough
           ├─► PRECOMPILED_HEX[experimentId] direct lookup
           ├─► sessionCache lookup (code-hash)
           ├─► persistent cache (localStorage)
           └─► remoteCompileCode (api.js)
               └─► fetch ELAB Agent localhost:8765 /compile (FQBN nanor4)
                   └─► arduino-cli + Renesas toolchain
                       └─► return {success, hex, output: stdout, size}

3. Compile result handled by ScratchCompileBar
   ├─► setCompileStatus('success')
   ├─► setCompileSize(resolveCompileFlash(result))  [compileSizeParse.js]
   └─► if currentExperiment.id present:
       └─► render cliffhanger CTA [iter 74+75]
           └─► nextExperiment = getLessonPath(currentExperiment.id).next_experiment
               └─► CTA "Prossimo: {title}" → onLoadNextExperiment(nextId)
                   └─► setCurrentExperiment(findExperimentById(nextId))

4. User click Upload (CompileUploadButton, optional)
   └─► POST /compile-and-upload localhost:8765 (ELAB Agent)
       └─► avrdude STK500 → Arduino Nano R4 physical
           └─► Toast "Caricato sul tuo Arduino fisico"
               └─► cliffhanger CTA also rendered post-upload

5. ALTERNATIVE — AVR8js in-browser simulation
   └─► AVRBridge.uploadHex(hex)  [engine revert-protected]
       └─► CPU emulation running ATmega328p (NOT Nano R4 yet)
           └─► pin states updated → SimulatorCanvas SVG renders LED/etc
               └─► Serial Monitor receives USART output
```

### UNLIM context flow (Sez 7 + 8 spec)

```
ScratchEditor blockchange + ScratchCompileBar status
  └─► unlimContextCollector.collectFullContext()
      ├─► circuit state (componenti + wire + pin)
      ├─► current code (C++ generato + originale)
      ├─► compilation status + errors + size
      ├─► current step (Passo Passo) + buildSteps[i].text
      ├─► error log recent
      └─► pin states real-time
          └─► payload to Render UNLIM Gemini
              ├─► RAG retrieval 549 chunk Vol1/2/3
              └─► reply (PZ V3 enforce, MAX 3 frasi, cita Vol/pag)
```

---

## 4. Decision log architettturale

| ID | Date | Decision | Rationale | Status |
|----|------|----------|-----------|--------|
| D1 | iter 70 | ELAB Agent localhost:8765 primary compile path | Real arduino-cli FQBN nano-r4 vs n8n cloud only | Active |
| D2 | iter 75 | Cliffhanger CTA wire via getLessonPath().next_experiment | Andrea NARRATIVE ARC mandate, lesson-paths schema HAS next_experiment {id,title,preview} (iter 57) | Active |
| D3 | iter X.1.6 | fetchHexFile validate full Intel HEX (checksum + cap) | Defensive vs deploy bug / SW cache corruption / CDN tampering | Active |
| D4 | TBD iter X.3 R1 | Web Serial direct vs ELAB Agent only vs hybrid? | Andrea ratify required (open question plan doc) | Pending |
| D5 | iter 82 | elab-blockly-theme.css scope future iter | Conflict ELAB_BLOCKLY_CSS inline `!important` selectors WCAG contrast | Deferred iter 83+ refactor atom |
| D6 | iter 12.4.1 | postinstall patch-blockly.js dispose bug | Blockly 12.4.1 InsertionMarkerPreviewer crash on workspace.dispose | Active |

---

## 5. Anti-pattern segnalati per future iter

- **NO toccare** AVRBridge / CircuitSolver / PlacementEngine / useCircuitHandlers / Battery9V senza branch `authorized-engine-change` (revert-protected per CLAUDE.md guard-critical-files.sh)
- **NO modificare** experiment-visibility.js `VISIBLE_EXP_IDS` senza esplicito Andrea OK (8-esp whitelist immutable)
- **NO re-introdurre** `bookGeometry/*` / `demo-mode.js` / `manual-index.json` (REVERT POST-DEMO immutable list)
- **NO usare** Galileo nome (UNLIM correct)
- **NO emoji** come icone — ElabIcons.jsx mandatory
- **NO `--no-verify`** su commit (iter X.1.5 violation acknowledged)
- **NO inflazione score** self-rated — `node scripts/benchmark.cjs --write` unico valido

---

## 6. Riferimenti

- Spec: `docs/prompts/PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md` (382 → 440 righe living tracking)
- Plan: `docs/plans/2026-05-25-blockly-crosscompiler-definitivo.md` (372 righe)
- Memory: `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/blockly-crosscompiler-definitivo-phase0.md`
- ADR-048: `docs/adrs/ADR-048-blockly-nano-r4-cross-compile-board-param.md` (board param decision precedent)
- Iter 71-88 history: `docs/architecture/iter-71-C-vol3-cross-compile-pipeline.md` + `docs/audits/2026-05-19-iter-88-VERIFY-1-cross-compile-chain-NO-hardware-audit.md`
- Codekit edukits research: `docs/research/2026-05-21-codekit-edukits-crosscompile-reference.md`

---

**Status**: Living doc. Update per-iter as containers/components evolve. Next refresh: post Iter X.3 Wave 2 (Web Serial decision + UNLIM home chat full).
