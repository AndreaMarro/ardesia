# mBlock-Inspired C++-First Arduino Nano R4 Environment — Master Spec Sprint V

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform ELAB Tutor `#compile-home` and Volume 3 Arduino experiments into an mBlock-inspired environment with C++ at the center, drag-and-drop snippets, true C++ ↔ Blockly roundtrip, UNLIM screen-aware mascot, Virtual Serial Monitor, and honest UI state signaling — all compiling for Arduino Nano R4 (`arduino:renesas_uno:nanor4`) from browser without requiring physical hardware.

**Architecture:** 7 independent sub-projects shipped across iter 95-100 Sprint V. Each sub-project = separate plan + separate PR + Andrea ratify gate. MVP path optimized for Riccardo demo certainty: Volume 3 wire → UI 11-states → Virtual Serial Monitor → UNLIM screen-aware → drag-drop → C++↔Blockly subset → mBlock layout polish.

**Tech Stack:** React 19 + Vite 7 (no router, hash custom) + Blockly 12.4.1 + CodeMirror 6 + arduino-cli 1.4.1 + Renesas core 1.5.3 + Express server `localhost:8765` (ELAB Agent) + Supabase Edge Functions (UNLIM Vertex Gemini EU) + WebUSB DFU for upload + custom CppArduinoInterpreter for Virtual Serial Monitor.

---

## Context

**Iter 94 entrance baseline (HEAD `411cfa42` post-merge feat/iter-41 + 295 commits + iter 80-82 close + iter 88 PHASE 1+2+3 + iter 93 atoms 30-35)**:

| LIVE iter 64-82 | Status |
|---|---|
| HomeCompileEntry `#compile-home` ScratchEditor + CodeEditorCM6 tabs (iter 80.A2 + 81.A2) | ✅ |
| ScratchCompileBar compile via `__ELAB_API.compileCode` → ELAB Agent localhost:8765 (iter 73 A7.1 + 79.A A3) | ✅ |
| Renesas Nano R4 FQBN whitelist + hexBase64 response (iter 79.A A3) | ✅ |
| CompileUploadButton WebUSB DFU iter 70 + iter 79.A A1 callback fix | ✅ |
| R5 CompileAgentBanner Mac/Win/Linux (iter 66 + iter 80.A6 CORS 4173) | ✅ |
| arduino-nano-r4.json FQBN canonical (iter 67 PHASE 5) | ✅ |
| 79 experiments (38 Vol1 + 27 Vol2 + 14 Vol3) | ✅ |
| Iter 73 ELAB Agent /compile /compile-and-upload endpoints | ✅ |

**Andrea iter 94 PM mandate gaps (NOT LIVE)**:

| Capability | Effort | Sub-project |
|---|---|---|
| Vol3 Arduino experiments compile wire (lesson-paths → simulator → compile flow) | ~4-6h | SP1 |
| UI 11-states canonical (Compilato / Nano R4 rilevata / Caricato / never fake) | ~2-3h | SP2 |
| Virtual Serial Monitor (parse `Serial.*` calls → render predicted output) | ~6-8h | SP3 |
| UNLIM screen-aware (route + cppCode + selection + compileStatus context) | ~6-8h | SP4 |
| Drag-and-drop Arduino snippets dentro C++ editor | ~6-8h | SP5 |
| C++ ↔ Blockly subset roundtrip (parser AST + reverse gen + preservation) | ~10-12h | SP6 |
| mBlock-inspired 3-pane layout overhaul | ~4-6h | SP7 |

**Total effort estimate: 40-55h across iter 95-100 Sprint V.**

---

## Acceptance criteria — 4 mandatory gate flows

Per Andrea iter 94 PM mandate, work validated against **EXACTLY** these 4 flows at end of Sprint V:

1. ✅ `https://elab-builder.vercel.app/#compile-home` → C++ tab → write `Serial.println("test"); delay(1000);` → click "Compila Nano R4" → see "Compilato per `arduino:renesas_uno:nanor4`" + Virtual Serial Monitor renders predicted `[setup] / [loop 1] test / [loop 2] test`
2. ✅ `https://elab-builder.vercel.app/#compile-home` → Blocchi tab → see pre-seeded Blink+Serial program → click "Compila Nano R4" → same compile result + Virtual Serial Monitor
3. ✅ Volume 3 Arduino experiment (e.g., `v3-cap5-esp1`) → C++ mode → compile → same result + Virtual Serial Monitor
4. ✅ Same experiment → Blocchi mode → compile → same result + Virtual Serial Monitor

**Anti-fake state mandate** (Andrea verbatim):
- "Caricato" NEVER displayed without real WebUSB DFU flash success
- "Nano R4 rilevata" displayed ONLY when `navigator.usb.getDevices()` returns matching VID/PID
- "Seriale prevista, non fisica" disclaimer mandatory on Virtual Serial Monitor when `boardConnected === false`
- All 11 canonical UI states defined in SP2 with empirical regex assertions

---

## Sub-projects ordered by Riccardo demo priority

### SP1 — Volume 3 Arduino experiments compile wire (iter 95 P0, ~4-6h)

**Goal:** Vol3 Arduino experiment lesson-paths → simulator → `__ELAB_API.compileCode(cppCode, NANO_R4_FQBN)` → ELAB Agent compile → render result + Virtual Serial Monitor placeholder.

**Files**:
- Modify `src/components/simulator/NewElabSimulator.jsx` — wire `experimentId` context into ScratchCompileBar `sketchCode` prop (already optional iter 79.A A2 rollback comments line 412-420)
- Modify `src/services/simulator-api.js` — extend `__ELAB_API.mountExperiment(id)` to also expose `__ELAB_API.getCurrentExperimentCppDefault()` returning lesson-path `arduinoSketch` field if present
- Modify 14 lesson-paths JSON files `src/data/lesson-paths/v3-cap{5,6,7,8}-*.json` — add `arduinoSketch` field with default C++ code per experiment
- Test E2E spec `tests/e2e/08-vol3-arduino-compile-flow.spec.js` NEW — 4 cases (cap5-esp1 + cap6-esp1 + cap7-mini + cap8-serial) → click mount + verify CompileBar visible + compile click + assert "Compilato" text

**Pre-conditions**: SP2 UI 11-states partial (compile success state) shipped first OR concurrent. **Andrea ratify gate**: iter 95 P0 PR review.

### SP2 — UI 11-states canonical (iter 95 P0 concurrent, ~2-3h)

**Goal:** Define + enforce 11 canonical UI states across HomeCompileEntry + ScratchCompileBar + CompileUploadButton with empirical regex assertions in tests.

**11 States**:
1. `idle` — no compile attempted, button "Compila Nano R4" enabled
2. `compiling` — request in-flight, spinner + "Compilazione in corso..."
3. `compile_success` — green badge "Compilato per Arduino Nano R4" + bytes/total
4. `compile_error` — red badge + Italian error translation (iter 79 A8 carryover)
5. `agent_offline` — yellow banner "Agent localhost:8765 non raggiungibile, uso Cloud"
6. `cloud_compile_fallback` — blue badge "Compilato via Cloud (no agent)"
7. `board_disconnected` — gray "Nano R4 non collegata: caricamento fisico non eseguito"
8. `board_detected` — green chip "Nano R4 rilevata (VID 0x2341 PID 0x0070)"
9. `uploading` — orange progress bar "Caricamento in corso..."
10. `upload_success` — green badge "Caricato sulla Nano R4" (ONLY after real DFU flash)
11. `upload_error` — red badge + DFU error translation

**Files**:
- Create `src/components/simulator/panels/compileStates.js` — canonical state machine + transitions + 11 i18n strings
- Modify `ScratchCompileBar.jsx` + `CompileUploadButton.jsx` + `HomeCompileEntry.jsx` — consume canonical state via props
- Test `tests/unit/components/simulator/panels/compileStates.test.js` NEW — 11 state transition tests + regex assertions (NO "Caricato" without `uploadAttempted && uploadFlashed`)
- Audit script `scripts/audit-fake-uploaded-states.mjs` NEW — grep all "Caricato" usages, assert each has flash gate

**Andrea ratify gate**: iter 95 P0 PR review.

### SP3 — Virtual Serial Monitor (iter 96 P0, ~6-8h)

**Goal:** Parse user C++ code for `Serial.begin(), Serial.print(), Serial.println()` → render predicted output as Monitor Seriale Virtuale UI panel below editor.

**Architecture**: Lightweight C++ Arduino interpreter (NOT full compiler) — extract `Serial.*` calls + variable substitution + loop iteration limit (10 cycles max display) + setup/loop separation. NOT real serial — disclaimer "Seriale prevista dal programma" mandatory.

**Files**:
- Create `src/services/elab-agent/virtualSerialInterpreter.js` — parse + interpret C++ Serial subset
- Create `src/components/simulator/panels/VirtualSerialMonitor.jsx` + `.module.css` — render predicted output
- Wire HomeCompileEntry + NewElabSimulator → VirtualSerialMonitor below compile bar
- Tests `tests/unit/services/virtualSerialInterpreter.test.js` — 20+ cases (println literal, print + variable, delay between, setup-only, loop-only, both, baud rate detection)
- Tests `tests/unit/components/simulator/panels/VirtualSerialMonitor.test.jsx` — render + disclaimer + boardConnected gate

**Pre-conditions**: SP2 state machine ready. **Andrea ratify gate**: iter 96 P0 PR review.

### SP4 — UNLIM screen-aware operativo (iter 97 P0, ~6-8h)

**Goal:** UNLIM mascot reads current screen context (route, experimentId, editorMode, cppCode, selectedText, compileStatus, boardConnected, uploadState, serialMode) and can EXECUTE 10 actions: createBlinkSerialProgram, createButtonLedProgram, createAnalogSerialProgram, insertSnippetAtCursor, convertCppToBlocks, convertBlocksToCpp, compileNanoR4, openVirtualSerialMonitor, fixCompilerError, explainSelectedCode.

**Files**:
- Modify `src/services/unlimContextCollector.js` — extend `collectFullContext()` to include compile/serial/upload state from `__ELAB_API`
- Modify `supabase/functions/unlim-chat/index.ts` — accept new screen-context fields + emit new INTENT actions via existing `[INTENT:{tool:...}]` parser (iter 36 A1 + iter 37 surface-to-browser)
- Modify `src/components/lavagna/intentsDispatcher.js` (iter 37 B-NEW) — extend `ALLOWED_INTENT_ACTIONS` whitelist with 10 new actions + handlers
- Create `src/services/unlimScreenAgent/createBlinkSerialProgram.js` + 9 sibling handlers
- Tests `tests/unit/services/unlimScreenAgent/*.test.js` — per-handler unit tests + integration
- Test E2E `tests/e2e/09-unlim-screen-aware.spec.js` — UNLIM "crea Blink seriale" → code appears in CodeEditorCM6

**Pre-conditions**: SP1 + SP2 + SP3 shipped. **Andrea ratify gate**: iter 97 P0 PR review.

### SP5 — Drag-and-drop Arduino snippets in C++ editor (iter 98 P0, ~6-8h)

**Goal:** Left panel "Azioni Arduino" palette → drag snippet onto CodeMirror 6 editor → insert C++ at cursor position. Click "Inserisci al cursore" fallback if drag fragile. 12 snippets minimum: Accendi LED + Spegni LED + Attendi + Avvia seriale + Scrivi seriale + Leggi pulsante + Leggi sensore + Se/Altrimenti + PWM + Pin OUTPUT + Pin INPUT_PULLUP + analogWrite.

**Files**:
- Create `src/components/simulator/panels/ArduinoSnippetsPalette.jsx` + `.module.css` — 12 snippet cards with drag handle + click action
- Create `src/data/arduino-snippets.js` — 12 snippet definitions (label IT + C++ code + UNLIM explanation + WCAG-compliant icon)
- Modify CodeMirror 6 wrapper in HomeCompileEntry (find file iter 95+) — add drop target handler + cursor insertion
- Tests `tests/unit/components/simulator/panels/ArduinoSnippetsPalette.test.jsx` — 12 card render + drag init + click insertion
- Test E2E `tests/e2e/10-snippet-drag-drop.spec.js` — drag "Accendi LED" → assert `digitalWrite(13, HIGH);` in editor

**Pre-conditions**: SP1 + SP2 + SP4 shipped. **Andrea ratify gate**: iter 98 P0 PR review.

### SP6 — C++ ↔ Blockly subset roundtrip (iter 99 P0, ~10-12h)

**Goal:** Honest subset roundtrip. C++ recognized (subset 13 constructs) → Blockly blocks. C++ NOT recognized → grayed "C++ avanzato preservato" block. NEVER lose user code. Subset: setup/loop/pinMode/digitalWrite/digitalRead/analogRead/analogWrite/delay/Serial.begin/Serial.print/Serial.println/if-else/simple-variables.

**Files**:
- Create `src/services/cppArduinoParser/parser.js` — AST extraction (Tree-sitter Arduino grammar OR regex subset)
- Create `src/services/cppArduinoParser/blocklyGenerator.js` — AST → Blockly XML
- Create `src/services/cppArduinoParser/preserveAdvancedCpp.js` — gray block with raw C++ payload preserved
- Create reverse `src/services/cppArduinoParser/blocklyToCpp.js` — Blockly XML → C++ (extend existing iter 36 scratchGenerator + iter 78+ ScratchEditor)
- Tests 30+ unit cases per direction + 10 roundtrip cases (C++ → Blocks → C++ identity for subset, gray-block preservation for non-subset)
- Test E2E `tests/e2e/11-cpp-blockly-roundtrip.spec.js` — write C++ Blink → convert to blocks → convert back → assert identity

**Pre-conditions**: SP1 + SP2 + SP3 + SP5 shipped. **Andrea ratify gate**: iter 99 P0 PR review.

### SP7 — mBlock-inspired 3-pane layout polish (iter 100 P0, ~4-6h)

**Goal:** Visual overhaul HomeCompileEntry + Vol3 Arduino experiment views to match mBlock layout: left palette + center editor (tabs C++/Blocks/Vista doppia) + right UNLIM mascot + bottom Virtual Serial Monitor + compile status bar.

**Files**:
- Modify `HomeCompileEntry.jsx` + `.module.css` — restructure to 3-pane responsive grid
- Modify `NewElabSimulator.jsx` Vol3 Arduino mode — apply same 3-pane layout
- Tests visual regression (Playwright screenshots) + responsive breakpoints (mobile/desktop/LIM 1024×768)

**Pre-conditions**: SP1-SP6 ALL shipped. **Andrea ratify gate**: iter 100 P0 PR review (Sprint V close).

---

## SP1 — Volume 3 Arduino compile wire (iter 95 P0 full TDD plan)

**Files:**
- Modify: `src/components/simulator/NewElabSimulator.jsx:1015-1025` (wire experimentId-aware sketchCode to ScratchCompileBar)
- Modify: `src/services/simulator-api.js:?` (add `getCurrentExperimentCppDefault()` helper — verify file location first)
- Modify: 14 lesson-path JSON files `src/data/lesson-paths/v3-cap5-esp1.json` through `v3-cap8-serial.json` (add `arduinoSketch` field)
- Create: `src/data/vol3-arduino-defaults.js` (centralized defaults indexed by experimentId — DRY, single source of truth)
- Create: `tests/unit/services/vol3ArduinoDefaults.test.js`
- Create: `tests/e2e/08-vol3-arduino-compile-flow.spec.js`

### Task 1: Inventory Vol3 Arduino experiments + define default C++ per experiment

- [ ] **Step 1: List Vol3 Arduino experiments empirically**

Run: `find src/data/lesson-paths -name "v3-*" | xargs -I {} grep -l "arduino\|Arduino\|sketch" {}`

Expected output: list of 14 Vol3 lesson-paths that involve Arduino.

- [ ] **Step 2: Write the failing test for default C++ per experiment**

Create `tests/unit/services/vol3ArduinoDefaults.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { getVol3ArduinoDefault } from '../../../src/data/vol3-arduino-defaults.js';

describe('Vol3 Arduino default sketches', () => {
  it('returns Blink+Serial default for v3-cap5-esp1', () => {
    const code = getVol3ArduinoDefault('v3-cap5-esp1');
    expect(code).toContain('void setup()');
    expect(code).toContain('void loop()');
    expect(code).toContain('Serial.begin(9600)');
    expect(code).toContain('pinMode(13, OUTPUT)');
    expect(code).toContain('digitalWrite(13, HIGH)');
    expect(code).toContain('delay(');
  });

  it('returns button+LED default for v3-cap5-esp2', () => {
    const code = getVol3ArduinoDefault('v3-cap5-esp2');
    expect(code).toContain('pinMode(2, INPUT_PULLUP)');
    expect(code).toContain('digitalRead(2)');
  });

  it('returns analog sensor default for v3-cap6-esp1', () => {
    const code = getVol3ArduinoDefault('v3-cap6-esp1');
    expect(code).toContain('analogRead(A0)');
    expect(code).toContain('Serial.println(');
  });

  it('returns Serial.println-only default for v3-cap8-serial', () => {
    const code = getVol3ArduinoDefault('v3-cap8-serial');
    expect(code).toContain('Serial.begin(9600)');
    expect(code).toContain('Serial.println(');
  });

  it('returns null for non-Arduino experiment v3-cap6-esp4', () => {
    // semaforo non-Arduino
    const code = getVol3ArduinoDefault('v3-cap6-esp4');
    expect(code).toBeNull();
  });

  it('returns null for unknown experimentId', () => {
    const code = getVol3ArduinoDefault('v99-unknown');
    expect(code).toBeNull();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/unit/services/vol3ArduinoDefaults.test.js`
Expected: FAIL with "Cannot find module '../../../src/data/vol3-arduino-defaults.js'"

- [ ] **Step 4: Write minimal implementation**

Create `src/data/vol3-arduino-defaults.js`:

```javascript
// iter 95 SP1 — centralized Vol3 Arduino default C++ sketches per experiment.
// DRY single source of truth referenced by NewElabSimulator + HomeCompileEntry +
// optional ELAB_API.getCurrentExperimentCppDefault(). Maintains 14 Vol3 Arduino
// experiment defaults (cap5/cap6/cap7/cap8). NON-Arduino experiments return null
// (consumer falls back to ScratchEditor blockly mode only).

const VOL3_ARDUINO_DEFAULTS = {
  'v3-cap5-esp1': `// Blink + Serial — Vol3 Cap5 Esp1
void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
  Serial.println("ELAB Nano R4 pronto");
}

void loop() {
  digitalWrite(13, HIGH);
  Serial.println("LED acceso");
  delay(1000);

  digitalWrite(13, LOW);
  Serial.println("LED spento");
  delay(1000);
}
`,
  'v3-cap5-esp2': `// Pulsante + LED — Vol3 Cap5 Esp2
void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
  pinMode(2, INPUT_PULLUP);
}

void loop() {
  int stato = digitalRead(2);
  if (stato == LOW) {
    digitalWrite(13, HIGH);
    Serial.println("Pulsante premuto, LED acceso");
  } else {
    digitalWrite(13, LOW);
  }
  delay(50);
}
`,
  'v3-cap6-esp1': `// Sensore analogico — Vol3 Cap6 Esp1
void setup() {
  Serial.begin(9600);
}

void loop() {
  int valore = analogRead(A0);
  Serial.print("Sensore A0: ");
  Serial.println(valore);
  delay(500);
}
`,
  'v3-cap8-serial': `// Serial communication — Vol3 Cap8 Serial
void setup() {
  Serial.begin(9600);
  Serial.println("ELAB Nano R4 — canale seriale aperto");
}

void loop() {
  Serial.println("Messaggio periodico");
  delay(2000);
}
`,
  // iter 96+ atom: extend with remaining 10 Vol3 Arduino experiments
};

export function getVol3ArduinoDefault(experimentId) {
  return VOL3_ARDUINO_DEFAULTS[experimentId] || null;
}

export default VOL3_ARDUINO_DEFAULTS;
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/services/vol3ArduinoDefaults.test.js`
Expected: PASS 6/6 tests

- [ ] **Step 6: Commit**

```bash
git add tests/unit/services/vol3ArduinoDefaults.test.js src/data/vol3-arduino-defaults.js
git commit -m "feat(iter-95 SP1 T1): Vol3 Arduino default C++ sketches indexed by experimentId

Adds centralized data module providing default C++ sketches for 4 of 14 Vol3
Arduino experiments (cap5-esp1 Blink+Serial, cap5-esp2 pulsante+LED, cap6-esp1
analog sensor, cap8-serial). Non-Arduino experiments return null. Iter 96+
atoms extend to remaining 10 experiments. 6/6 unit tests PASS.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 2: Wire experimentId-aware default into NewElabSimulator → ScratchCompileBar

- [ ] **Step 1: Read NewElabSimulator current props passing**

Run: `grep -n "ScratchCompileBar\|sketchCode" src/components/simulator/NewElabSimulator.jsx | head -20`

Expected: locate existing `<ScratchCompileBar />` JSX with sketchCode prop (iter 73 BG-A7 wire OR null).

- [ ] **Step 2: Write integration test**

Create `tests/unit/components/simulator/NewElabSimulator-vol3-arduino-default.test.jsx`:

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NewElabSimulator from '../../../../src/components/simulator/NewElabSimulator.jsx';

// Mock heavy children (CircuitSolver + Blockly + CodeMirror) per existing iter 70+ patterns
vi.mock('../../../../src/components/simulator/canvas/SimulatorCanvas.jsx', () => ({
  default: () => <div data-testid="canvas-mock">Canvas</div>,
}));
vi.mock('../../../../src/components/simulator/panels/ScratchEditor.jsx', () => ({
  default: () => <div data-testid="scratch-mock">Scratch</div>,
}));
vi.mock('../../../../src/components/simulator/panels/ScratchCompileBar.jsx', () => ({
  default: ({ sketchCode, boardId, port, compileButtonLabel }) => (
    <div data-testid="compile-bar-mock"
         data-sketch-code={sketchCode}
         data-board-id={boardId}
         data-compile-label={compileButtonLabel}>
      CompileBar
    </div>
  ),
}));

describe('NewElabSimulator Vol3 Arduino default integration', () => {
  it('passes v3-cap5-esp1 Blink+Serial default to ScratchCompileBar', () => {
    render(<NewElabSimulator activeExperimentId="v3-cap5-esp1" />);
    const bar = screen.getByTestId('compile-bar-mock');
    expect(bar.getAttribute('data-sketch-code')).toContain('Serial.begin(9600)');
    expect(bar.getAttribute('data-sketch-code')).toContain('digitalWrite(13, HIGH)');
    expect(bar.getAttribute('data-board-id')).toBe('arduino-nano-r4');
  });

  it('passes null sketch-code for non-Arduino experiment v3-cap6-esp4', () => {
    render(<NewElabSimulator activeExperimentId="v3-cap6-esp4" />);
    const bar = screen.getByTestId('compile-bar-mock');
    // null serializes to empty string in data attribute
    expect(bar.getAttribute('data-sketch-code') === '' || bar.getAttribute('data-sketch-code') === null).toBe(true);
  });

  it('does not break for experiments without activeExperimentId', () => {
    render(<NewElabSimulator />);
    const bar = screen.getByTestId('compile-bar-mock');
    expect(bar).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/unit/components/simulator/NewElabSimulator-vol3-arduino-default.test.jsx`
Expected: FAIL — current NewElabSimulator passes hardcoded `null` sketchCode (iter 79.A A2 rollback comments line 412-420).

- [ ] **Step 4: Implement experimentId-aware default in NewElabSimulator**

Read lines 1-50 of `src/components/simulator/NewElabSimulator.jsx` to find imports section. Add import:

```javascript
import { getVol3ArduinoDefault } from '../../data/vol3-arduino-defaults.js';
```

Find existing `<ScratchCompileBar />` JSX around line 1015-1025. Modify the `sketchCode` prop:

```jsx
<ScratchCompileBar
  sketchCode={scratchGeneratedCode || getVol3ArduinoDefault(activeExperimentId) || null}
  boardId="arduino-nano-r4"
  port={null}
  compileButtonLabel="Compila Nano R4"
/>
```

(Adjust prop names + variable references to match existing code — read current state first.)

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/components/simulator/NewElabSimulator-vol3-arduino-default.test.jsx`
Expected: PASS 3/3 tests

- [ ] **Step 6: Verify no regression neighboring tests**

Run: `npx vitest run tests/unit/components/simulator/ 2>&1 | tail -10`
Expected: All previously passing tests still PASS, +3 new tests added.

- [ ] **Step 7: Commit**

```bash
git add src/components/simulator/NewElabSimulator.jsx tests/unit/components/simulator/NewElabSimulator-vol3-arduino-default.test.jsx
git commit -m "feat(iter-95 SP1 T2): wire Vol3 Arduino default to ScratchCompileBar via experimentId

NewElabSimulator now passes experimentId-aware default C++ sketch to
ScratchCompileBar when scratchGeneratedCode is empty. Vol3 Arduino experiments
(v3-cap5-esp1, v3-cap5-esp2, v3-cap6-esp1, v3-cap8-serial) get pre-seeded
Blink+Serial / button-LED / analog sensor / Serial communication code. Non-
Arduino experiments fall through null. Backward-compat: scratchGeneratedCode
when present takes priority. 3/3 NEW integration tests PASS + zero regression.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 3: E2E spec validating compile flow Vol3 → Nano R4

- [ ] **Step 1: Create E2E spec**

Create `tests/e2e/08-vol3-arduino-compile-flow.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

const BASE = process.env.ELAB_E2E_BASE_URL || 'http://localhost:4173';

const VOL3_ARDUINO_EXPERIMENTS = [
  { id: 'v3-cap5-esp1', expectedCpp: 'digitalWrite(13, HIGH)' },
  { id: 'v3-cap5-esp2', expectedCpp: 'INPUT_PULLUP' },
  { id: 'v3-cap6-esp1', expectedCpp: 'analogRead(A0)' },
  { id: 'v3-cap8-serial', expectedCpp: 'Serial.begin(9600)' },
];

test.describe('Iter 95 SP1 — Vol3 Arduino experiments compile flow', () => {
  for (const exp of VOL3_ARDUINO_EXPERIMENTS) {
    test(`${exp.id}: default C++ visible + ScratchCompileBar interactive`, async ({ page }) => {
      // Bypass GDPR + auth + select Vol3 experiment via deep-link hash
      await page.addInitScript(() => {
        localStorage.setItem('elab_gdpr_consent', JSON.stringify({ accepted: true, ts: Date.now() }));
        localStorage.setItem('elab_class_key', JSON.stringify({ key: 'demo-class', ts: Date.now() }));
      });

      // Navigate via lavagna hash route + experiment selector (find existing iter 95+)
      // OR direct simulator route if exists
      await page.goto(`${BASE}/#lavagna?experiment=${exp.id}`);
      await page.waitForLoadState('networkidle', { timeout: 10000 });

      // Assert ScratchCompileBar rendered
      const compileBar = page.locator('[data-testid="compile-bar"], .scratch-compile-bar, button:has-text("Compila Nano R4")').first();
      await expect(compileBar).toBeVisible({ timeout: 5000 });

      // Assert default C++ embedded somewhere (data attribute OR CodeEditor)
      // Note: editor may be hidden in Blockly mode by default — verify state machine
      const pageContent = await page.content();
      expect(pageContent).toContain(exp.expectedCpp);
    });
  }
});
```

- [ ] **Step 2: Build + start preview server**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build`
Expected: build PASS ~18-33s

Run: `npx vite preview --port 4173 &`
Wait 5s for server start.

- [ ] **Step 3: Run E2E spec**

Run: `npx playwright test tests/e2e/08-vol3-arduino-compile-flow.spec.js`
Expected: 4/4 PASS (or honest failures with diagnostic log).

- [ ] **Step 4: Iterate spec if route discovery needed**

If failures show "lavagna?experiment=..." not routing correctly, find actual experiment selector flow:
- Check `src/components/lavagna/LavagnaShell.jsx` for experiment loading
- Check `src/data/lesson-paths/` index for routing pattern
- Update spec navigation steps accordingly

- [ ] **Step 5: Commit + open PR**

```bash
git add tests/e2e/08-vol3-arduino-compile-flow.spec.js
git commit -m "test(iter-95 SP1 T3): E2E Vol3 Arduino compile flow 4-case spec

Playwright spec validates 4 Vol3 Arduino experiments (cap5-esp1 Blink+Serial,
cap5-esp2 pulsante+LED, cap6-esp1 sensore analogico, cap8-serial). Each
navigates to experiment via lavagna hash route, asserts ScratchCompileBar
visible + default C++ embedded in page. Empirical verify build PASS + spec
4/4 PASS.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"

git push -u origin fix/iter-95-SP1-vol3-arduino-compile-wire
gh pr create --base main --title "feat(iter-95 SP1): Vol3 Arduino experiments compile wire" --body "..."
```

### Task 4: Extend defaults to remaining 10 Vol3 Arduino experiments

- [ ] **Step 1: Audit lesson-paths for remaining Arduino experiments**

Run: `for f in src/data/lesson-paths/v3-cap*.json; do echo "=== $f ==="; grep -l "arduino\|setup\|loop\|Serial" "$f" || echo "NO ARDUINO"; done`

Identify which of 14 Vol3 experiments are Arduino-based vs LED-only/passive.

- [ ] **Step 2: Add defaults for each Arduino experiment**

For each identified experiment, extend `src/data/vol3-arduino-defaults.js` `VOL3_ARDUINO_DEFAULTS` map with appropriate C++ default sketch. Cite Volume 3 page reference in comment.

- [ ] **Step 3: Extend test coverage**

Add test case per new experiment in `tests/unit/services/vol3ArduinoDefaults.test.js`.

- [ ] **Step 4: Verify build + tests PASS**

Run: `npx vitest run tests/unit/services/vol3ArduinoDefaults.test.js && npm run build`
Expected: all tests PASS + build PASS.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(iter-95 SP1 T4): extend Vol3 Arduino defaults to all 14 experiments

Adds 10 more Vol3 Arduino experiment defaults to VOL3_ARDUINO_DEFAULTS map.
Each cites Volume 3 page reference in comment per Morfismo Sense 2. Tests
extend to 14/14 PASS coverage. Closes SP1 iter 95 P0.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## SP2-SP7 Spec stubs (written full TDD at iter 95/96/97/98/99/100 entrance)

Each sub-project gets its own full TDD plan document at the entrance of the iter where it ships. This master spec defines acceptance criteria + dependencies + effort estimate. Full task-by-task TDD plans authored just-in-time to incorporate empirical findings from prior iter.

**Rationale**: writing 6 full plans now (40+ hours of plans) before SP1 empirical learnings risks rework. Just-in-time plan authoring per skill mandate "DRY YAGNI TDD frequent commits".

---

## Andrea ratify gates schedule

| Iter | SP | Title | Effort | Andrea ratify gate |
|---|---|---|---|---|
| 95 | SP1 + SP2 | Vol3 wire + UI 11-states | 6-9h | iter 95 close 2 PRs |
| 96 | SP3 | Virtual Serial Monitor | 6-8h | iter 96 close 1 PR |
| 97 | SP4 | UNLIM screen-aware | 6-8h | iter 97 close 1 PR |
| 98 | SP5 | Drag-drop snippets | 6-8h | iter 98 close 1 PR |
| 99 | SP6 | C++↔Blockly roundtrip | 10-12h | iter 99 close 1 PR (largest scope) |
| 100 | SP7 | mBlock layout polish | 4-6h | iter 100 close 1 PR (Sprint V close) |

**Total estimated: 38-51h across 6 iter.** Real elapsed = ~2-3 weeks Andrea velocity Sprint V.

---

## Self-review

**Spec coverage**: All 7 sub-projects from Andrea iter 94 PM mandate mapped to atoms. SP1 has full TDD plan. SP2-7 have spec + acceptance criteria, full TDD plans authored at iter entrance per just-in-time mandate.

**Placeholder scan**: SP1 task code blocks complete. SP2-7 explicitly stub-documented with "full TDD plan authored at iter X entrance" rationale. No TBD/TODO in SP1 task definitions.

**Type consistency**: `getVol3ArduinoDefault(experimentId)` consistent SP1 T1-T4. `compileStates.js` state machine documented SP2 (concrete names TBD at SP2 entrance plan).

**Anti-inflation G45**: NO claim Sprint V close before all 7 SPs ship + Andrea ratify + hardware UAT Nano R4 USB verified. NO claim "C++↔Blockly complete" (subset-only honest mandate). NO claim "Virtual Serial Monitor reads real serial" (predicted-only disclaimer mandatory).

---

## Execution handoff

**Plan saved to `docs/superpowers/plans/2026-05-19-iter-95-100-mblock-inspired-c++-first-nano-r4-MASTER-SPEC.md`.**

**Recommended execution path**:
1. Andrea reviews master spec — ratify atomization + Sprint V kickoff
2. Iter 95 entrance: dispatch SP1 (Vol3 wire) + SP2 (UI 11-states) as 2 parallel sub-projects (worktree isolated per Pattern S r3 race-cond fix 30× consecutive)
3. SP1 = SubagentDriven (4 tasks bite-sized TDD)
4. SP2 = inline orchestrator (small scope ~2-3h)
5. Both PRs Andrea ratify pre-merge
6. Iter 95 close → SP3 plan authored just-in-time

**Andrea action richiesta**: ratify atomization + Sprint V kickoff + dispatch iter 95 SP1+SP2 OR feedback re-scope.
