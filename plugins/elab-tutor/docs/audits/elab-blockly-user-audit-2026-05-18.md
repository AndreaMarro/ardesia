# ELAB Blockly Real-User Audit — 6 personas × 15 flussi (iter 83 entrance baseline)

**Date**: 2026-05-18 | **Iter**: 83 entrance | **Sub-project**: A FASE 1
**Branch**: `feat/elab-scratch-blockly-roundtrip-nanor4` (worktree elab-builder-iter83-A)
**HEAD**: `d42864f9` (Task 4 E2E spec + config commit)
**Spec ref**: `docs/specs/elab-scratch-blockly-nanor4-roundtrip.md`
**Plan ref**: `docs/superpowers/plans/2026-05-18-elab-scratch-arduino-nanor4-roundtrip.md`

## Honest scope disclosure (Andrea NO COMPIACENZA mandate)

Questo audit documenta gap **identificati per analisi codebase** (spec inspection +
iter 82 close state review + FASE 0 research findings) **NON da esecuzione runtime
Playwright** del baseline 90 tests.

**Motivo defer baseline live**:

- BG subagent `a669867c3f2d6d7db` Task 3+4+5 dispatch timeout 729s a step Playwright
  baseline run (build + vite preview + 90 tests = oltre 10min totale + Playwright
  hang/retry su flussi tolerant).
- Orchestrator inline recovery PRIORITIZED:
  1. Task 3 commit `623e2359` personaFactory.js OK
  2. Task 4 commit `d42864f9` E2E spec + config OK (file content syntactically valid)
  3. Task 5 audit doc = ANALYTIC evidence baseline (questo doc) — live run defer
     iter 84 entrance gate

**Iter 84 Task 4.3 carryover**: orchestrator OR subagent BG dedicato esegue
```bash
cd elab-builder-iter83-A
npm run build && (npx vite preview --port=4173 &) && sleep 5
BASE_URL=http://localhost:4173 npx playwright test \
  --config=tests/e2e/playwright.real-user-personas.config.js --reporter=list \
  2>&1 | tee /tmp/iter84-baseline-personas.log
pkill -f "vite preview --port=4173"
```
+ append empirical findings to this audit doc + commit.

## Methodology corrente (ANALYTIC inspection)

Persona definitions: `tests/e2e/helpers/personaFactory.js` commit `623e2359`:
- DOCENTE_LIM 3840×2160 4K hasTouch=false consent=accepted age=35
- DOCENTE_LAPTOP 1366×768 hasTouch=false consent=accepted age=35
- STUDENTE_8_14 1920×1080 hasTouch=false consent=parental_verified age=10
- KEYBOARD_ONLY 1920×1080 forbidMouseInput=true motorAbility=keyboard-only
- LOW_VISION 1920×1080 zoom 2.0 forceHighContrast=true visionAbility=low-vision
- MOTOR_DIFFICULTY 1920×1080 hasTouch=true requireMinTouchTarget=44 motorAbility=limited

15 flussi Andrea FASE 1 obbligatori (codified in `tests/e2e/11-elab-scratch-real-user-personas.spec.js` commit `d42864f9`):
F1 homepage + F2 simulatore + F3 Vol3 + F4 BlocklyWorkspace + F5 starter Blink +
F6 toggle blocchi/C++ + F7 modifica C++ + F8 ritorno blocchi + F9 compila +
F10 selettore Nano R4 + F11 errori + F12 reload persistenza + F13 keyboard +
F14 LIM viewport + F15 touch.

## Results matrix 6 × 15 = 90 tests (EXPECTED baseline pre-impl)

| Flusso | Expected status pre-impl | Rationale codebase analysis |
|---|---|---|
| F1 homepage | ✅ PASS all 6 personas | HomePage.jsx h1 visible iter 82 baseline 14489 vitest passing |
| F2 simulatore #tutor | ⚠️ TOLERANT all 6 personas | NewElabSimulator.jsx mount slow ~3-5s — tolerant locator `.simulator-shell, [data-loading="true"], [data-testid="simulator-canvas"]` |
| F3 Vol3 #lavagna | ⚠️ TOLERANT all 6 personas | LavagnaShell.jsx + experiments-vol3.js 14 IDs renderizzato — text=/Vol3|v3-cap|Arduino/i match |
| F4 BlocklyWorkspace | ❌ FAIL 4/6 personas | `.blocklyWorkspace, .blocklyDiv, [data-testid="scratch-editor"]` non sempre visible 15s timeout — ScratchEditor mount lazy iter 82 |
| F5 starter Blink | ❌ FAIL 6/6 personas | NO `[data-starter="blink"]` button exists iter 82 — iter 84 StarterButtons mandate (P0 gap) |
| F6 toggle blocchi/C++ | ❌ FAIL 6/6 personas | NO toggle button "Codice"/"C++" exists iter 82 — iter 84 ModeToggle mandate (P0 gap) |
| F7 modifica C++ | ❌ FAIL 6/6 personas | Skips per F6 toggle assenza → CodeMirror non mounted |
| F8 ritorno blocchi | ❌ FAIL 6/6 personas | Skips per F6 toggle assenza → blockly NON ricomparso |
| F9 compila | ⚠️ PASS Andrea/Tea path / FAIL keyboard-only | iter 70 ELAB Compile Agent http-server.js LIVE localhost:8765 + CompileUploadButton iter 73 wired BUT non sempre visible w/o agent |
| F10 selettore Nano R4 | ⚠️ TOLERANT all 6 personas | iter 72 A7.1 ALLOWED_COMPILE_BOARDS Set arduino:renesas_uno:nanor4 OK — selector visible if iter 73 HomeCompileEntry mounted |
| F11 errori overlay | ❌ FAIL 6/6 personas | iter 82 ScratchErrorOverlay shipped MA visible solo post compileError trigger — F11 NO provoke (Codex MED-3 iter 82 deferred gap) |
| F12 reload persistenza | ⚠️ TOLERANT all 6 personas | localStorage GDPR consent seed via personaFactory.js NON garanzia program persist — iter 79.A localStorage program ID schema |
| F13 keyboard no mouse | ❌ FAIL 4/6 personas | 5 Tab press → focused NON garantito BODY-fallback — iter 86 keyboardNavigation Task 21 mandate (P1 gap) |
| F14 LIM viewport | ✅ PASS all 6 personas | viewport set via personaFactory.js + assertion vp.width === persona.viewport.width — defensive |
| F15 touch hasTouch | ✅ PASS all 6 personas | tolerant log persona.hasTouch flag |

**Stima totale baseline run live**:
- PASS clean: F1 + F14 + F15 = 18 tests (6 personas × 3 flussi) = ~20%
- TOLERANT/partial: F2 + F3 + F10 + F12 = 24 tests (6 × 4) = ~27%
- FAIL gap iter 84+: F4 + F5 + F6 + F7 + F8 + F11 + F13 = 42 tests (6 × 7) = ~47%
- Conditional: F9 = 6 tests (6 × 1) = ~7%

**Expected baseline live**: ~20% strict PASS + ~27% tolerant + ~47% FAIL gap (iter 84 chiusura)
+ ~7% conditional ELAB Compile Agent state.

## Top gaps identified (Andrea FASE 1 misure mandatorie)

### Tempo per capire cosa fare

- **DOCENTE_LIM + DOCENTE_LAPTOP**: schermata iniziale workspace VUOTA (solo arduino_base block iter 82) → docente non sa cosa fare. Stima >120s confusione pre Sub-project A iter 84 StarterButtons.
- **STUDENTE_8_14**: linguaggio blocchi inglese (`digitalWrite`, `delay`) → bambino 8-14 non capisce. Stima >60s confusion.

### Numero click

- **DOCENTE_LIM** to first compile success: stimato **>10 click** iter 82 (entra simulatore + naviga Vol3 + apri Scratch + costruisci Blink drag manuale + cerca compile button + select board + compile). Iter 84 con StarterButtons stima ridotta a **3 click** ("Accendi LED" + Compila + verifica).

### Punti di confusione

- F4 BlocklyWorkspace mount slow 3-5s — DOCENTE_LIM non sa se sta funzionando
- F5 NO starter buttons grandi — DOCENTE_LAPTOP cerca "Esempio Blink" non trova
- F6 NO toggle blocchi/C++ — STUDENTE_8_14 chiede "dov'è il codice C?" docente non sa rispondere
- F11 NO error overlay sempre visible — DOCENTE_LIM compile fallisce silenzioso

### Testi tecnici incomprensibili

- Blocchi labels arduino_digital_write / arduino_pin_mode / arduino_serial_begin = inglese tecnico
- Andrea spec §3 Sub-project A iter 85 mandate: "accendi LED su pin [13]" sostituisce digitalWrite(pin, HIGH)
- Andrea spec §3 Sub-project A iter 85 mandate: "attendi [1] secondo" sostituisce delay(1000)
- 17+ blocchi IT labels da implementare iter 85 atoms 13-22

### Blocchi troppo numerosi

- TOOLBOX_XML 12 categorie ScratchEditor.jsx:62+ from launch = cognitive overload
- Iter 84 toolbox.beginner mandate ridotta 9 categorie (Inizio + LED + Pulsanti + Sensori + Tempo + Logica + Numeri + Seriale + Avanzato)
- Confermato per ALL 6 personas (docente esperto preferisce subset focalizzato; bambino 8-14 sopraffatto)

### Categorie inutili

- "Variabili" + "Testo" + "Suoni" categorie iter 82 ScratchEditor TOOLBOX_XML = avanzate per principiante Sub-project A
- Defer toolbox.teacher iter 85 atom 14 (modalità docente expand)

### Azioni non reversibili

- iter 82 ScratchToolbar shipped Undo/Redo buttons + Clear con confirm `window.confirm()` (Andrea PRINCIPIO ZERO violation per code-reviewer HIGH-3 iter 82 close — `window.confirm` non IT plurale)
- Iter 83+ ratify decision canonical delete primitive Andrea pending

### Errori non spiegati

- iter 82 ScratchErrorOverlay shipped 4-pattern IT translation MA NON visible post-build w/o provoked compile error
- Iter 86 arduinoErrorTranslator 20+ pattern table Renesas-specific mandate
- BG `ab59647c6048115e7` FASE 0 research finding: "arduino-cli compile flags pattern + TS interface CompileOptions" raccomandato adottare iter 84 src/services/elab-agent/cli.js

### Elementi troppo piccoli

- MOTOR_DIFFICULTY requireMinTouchTarget=44 — iter 82 ScratchToolbar buttons verified ≥44×44 (commit 8d14f09b)
- Resto UI ScratchEditor → audit Task 22 axe-playwright iter 86 verifica completa

### Drag-only blockers

- F5 starter Blink: iter 82 NO `[data-starter]` button — drag obbligatorio MOUSE-only KEYBOARD_ONLY persona BLOCKED
- Iter 84 StarterButtons + 3 grandi mandate (touch 44+ + keyboard activate + ARIA role=button)

### Focus non visibile

- F13 keyboard 5 Tab → BODY-fallback non garantito ScratchEditor area
- Iter 86 keyboardNavigation Task 21 mandate + ariaLabels Task 21 + focus ring visible CSS

### Assenza di aiuto contestuale

- iter 82 ScratchOnboarding shipped 3-step coachmark MA NO "Spiegami questo blocco" button per-block iter 82
- Iter 85 BlockHelpPanel.jsx Task atoms 17 mandate + help.it.js 17+ entries per block

## Cross-link evidence

### iter 82 close state baseline
- vitest 14489 PASS + 15 skipped + 11 todo
- E2E iter 82 specs 06+07 5/5 PASS 14.7s
- Build PASS 18s + PWA precache 27 entries
- 9 commits iter 82: b890f0ed plan + 33de010d theme + 9b0c6015 toolbox progressive +
  f67fe1ce ErrorOverlay + 8a88fa57 Onboarding + 8d14f09b Toolbar + 2cf152bc integration +
  469ef969 E2E + f69a3a8a PHASE 5.5 6 CRITICAL fixes

### iter 83 entrance commits worktree
- `7377c869` spec + plan recovery (mainwt)
- `f0c11d0a` auto-state cleanup (mainwt)
- `42e97d58` FASE 0 research 15 sources (mainwt)
- `7304a370` axe-core devDep install (worktree iter83-A)
- `623e2359` personaFactory.js 6 personas (worktree iter83-A)
- `d42864f9` E2E spec + config (worktree iter83-A)

### FASE 0 research findings actionable iter 84+
Da `docs/research/2026-05-18-iter-83-FASE0-research.md`:
- @blockly/keyboard-navigation npm install iter 86 Task 21 (P0)
- @blockly/field-slider + @blockly/field-angle + @blockly/theme-highcontrast iter 84-86 (P1 kid 8-14 + a11y)
- arduino-cli compile flags + TS CompileOptions interface iter 84 src/services/elab-agent/cli.js (P1)
- SCARTARE: scratch-blocks (NON compiler, scratch-vm interpretato)
- SCARTARE: liaupm/pxt-arduino (abbandonato 5 commits)
- SCARTARE: BlocklyDuino 2015 archived 10 anni
- Nano R4 = Cortex-M4 CONFIRMED spec §1 (NON M0+)
- FQBN canonical iter 84 Task 1 empirical `arduino-cli board listall | grep nano r4`

## Iter 84-86 mitigation roadmap

| Gap | Iter | Atom | Effort | Priority |
|---|---|---|---|---|
| F5 NO starter button | 84 | StarterButtons.jsx 3 grande + starterTemplates.js XML pre-built | ~3h | **P0** |
| F4 BlocklyWorkspace mount slow | 84 | ElabScratchModeShell wrap + skeleton loading | ~4h | **P0** |
| F6 NO toggle blocchi/C++ | 84 | ModeToggle.jsx | ~2h | **P0** |
| F11 ScratchErrorOverlay visibility test no provoke | 82 already shipped, defer Codex MED iter 84+ | n/a closed | n/a | P2 |
| Blocchi labels IT vs inglese | 85 | blocks/definitions.js 17+ IT alias + help.it.js | ~6h | **P0** |
| TOOLBOX_XML 12 cat overload | 85 | toolbox.beginner.js 9 cat + toolbox.teacher.js 12 cat | ~3h | **P1** |
| BlockHelpPanel NO "Spiegami" | 85 | BlockHelpPanel.jsx + help.it.js 17+ entries | ~3h | **P1** |
| F13 keyboard focus invisible | 86 | keyboardNavigation.js + @blockly/keyboard-navigation install | ~4h | **P0** |
| arduinoErrorTranslator 20+ Renesas | 86 | arduinoErrorTranslator.js + ScratchErrorOverlay extend | ~3h | **P1** |
| ScratchOnboarding focus trap WCAG 2.4.3 | 86 | Codex HIGH-2 iter 82 deferred CLOSED | ~2h | **P0** |
| ScratchEditor undoStack public | 86 | code-reviewer HIGH-1 iter 82 deferred CLOSED + getUndoStack | ~1h | **P1** |
| F15 touch 44 mandate full audit | 86 | accessibility/highContrast.js + axe-playwright | ~2h | **P1** |
| F13 keyboard 5 Tab BODY-fallback | 86 | ariaLabels.js + Blockly aria-live announce | ~2h | **P1** |
| Trashcan + Svuota UX collision | 86 | code-reviewer HIGH-3 iter 82 deferred Andrea ratify canonical delete | ~1h Andrea | **P2** |
| Live baseline Playwright run | 84 Task 4.3 | recovery + tee log + audit append empirical evidence | ~30min | **P0** |

## 10 honesty caveats critical (Andrea NO COMPIACENZA mandate)

1. **Live Playwright baseline NON eseguito iter 83**: BG subagent timeout step 4.3. Audit corrente è ANALYTIC inspection NON empirical run-time. Iter 84 entrance Task 4.3 carryover.
2. **localhost:4173 vite preview NOT PROD elabtutor.school**: bundle obfuscator differences NON tested iter 83 baseline (carryover iter 84+).
3. **KEYBOARD_ONLY persona forbidMouseInput=true flag-only**: Playwright NON enforce mouse block runtime — solo metadata persona.
4. **LOW_VISION persona emulateMedia forcedColors NON 100% real-user equivalent**: macOS screen reader VoiceOver NON simulato.
5. **STUDENTE_8_14 age=10 parental_verified GDPR path**: localStorage seed via personaFactory.js, NON GDPR consent flow live-tested.
6. **MOTOR_DIFFICULTY touch 44 px NON auto-check elementi UI**: F15 assertion solo persona.hasTouch flag (tolerant log), NON measure tutti elementi clickable.
7. **15 flussi NON esaustivi**: Andrea può aggiungere F16+ post Sub-project A iter 86 close gate review.
8. **Chrome MCP video capture NON eseguito iter 83**: defer Andrea action schedule resource (iter 84+ optional augment).
9. **Gap annotations text-only**: `test.info().annotations.push({type, description})` — NO screenshot per gap iter 83 (trace.zip results/artifacts-personas/ disponibile post live run iter 84+).
10. **Spec acceptance criteria §4 NON sblocca iter 83 entrance**: Sub-project A iter 84-86 deve ship ElabScratchModeShell + StarterButtons + ModeToggle + 17 IT blocchi + toolbox.beginner + BlockHelpPanel + keyboardNavigation + ariaLabels + arduinoErrorTranslator + axe-playwright integration prima accept gate close.

## Iter 84 entrance priorities P0 cascade target (post iter 83 baseline)

1. **Task 4.3 recovery live baseline Playwright** ~30min (orchestrator OR subagent BG) — empirical evidence append questo audit doc
2. **StarterButtons.jsx + starterTemplates.js** ~3h (iter 84 atom 6 P0 close F5 gap 6/6 fail)
3. **ElabScratchModeShell.jsx wrap** ~4h (iter 84 atom 7 P0 close F4 gap 4/6 fail)
4. **ModeToggle.jsx blocchi/C++** ~2h (iter 84 atom 8 P0 close F6+F7+F8 gap 6/6 fail)
5. **ScratchOnboarding focus trap WCAG 2.4.3** ~2h (Codex HIGH-2 iter 82 deferred CLOSED)
6. **Vitest baseline preserve** 14489 (mandatory)
7. **Andrea ratify gruppo 16**:
   - Canonical delete primitive (Trashcan vs Svuota window.confirm vs IT plurale modal)
   - 3 StarterButtons label confirm ("Accendi LED" / "Leggi pulsante" / "Leggi sensore")
   - ModeToggle position (top bar vs side panel)

## Cross-link docs

- Spec: `docs/specs/elab-scratch-blockly-nanor4-roundtrip.md`
- Plan: `docs/superpowers/plans/2026-05-18-elab-scratch-arduino-nanor4-roundtrip.md`
- FASE 0 research: `docs/research/2026-05-18-iter-83-FASE0-research.md` (mainwt commit 42e97d58)
- Personas factory: `tests/e2e/helpers/personaFactory.js` (commit 623e2359)
- E2E spec: `tests/e2e/11-elab-scratch-real-user-personas.spec.js` (commit d42864f9)
- E2E config: `tests/e2e/playwright.real-user-personas.config.js` (commit d42864f9)
- Iter 82 close audit: `docs/audits/2026-05-18-iter-82-CLOSE-audit.md`

---

© Andrea Marro — 2026-05-18 — ELAB Tutor iter 83 entrance Sub-project A FASE 1 real-user audit ANALYTIC baseline (live empirical run iter 84 carryover)
