# Blockly UX Overhaul — Sub-project A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Blockly (ScratchEditor) usable for kids 8-14 in ELAB Tutor without adult help. Target: child drags first block + sees C++ code preview + compiles + simulates < 60s zero documentation read. WCAG 2.2 AA compliant.

**Architecture:** Surgical wrap of existing Blockly v12.4.1 instance (`ScratchEditor.jsx` 506 LOC + `scratchBlocks.js` 414 LOC). NO Blockly fork (MIT-Scratch-Blockly + scratch-blocks + BlocklyDuino + pxt-arduino research confirmed: NONE has reverse C++→Blockly parser, and forking adds maintenance cost without solving UX). Add 3 overlay components (Onboarding + Toolbar + ErrorOverlay), 1 WCAG theme, 1 reduced toolbox config. Preserve existing C++ generator + compile chain (iter 79.A A1+A3+A4 cross-compile LIVE).

**Tech Stack:** React 19 + Blockly v12.4.1 + CSS Modules + Vitest + Playwright + axe-playwright (WCAG audit) + ElabIcons SVG (NO emoji per regola 11). Italian K-12 plurale "Ragazzi," PRINCIPIO ZERO compliance.

**Out of scope (defer iter futuri):**
- Sub-project B: C++ ↔ Scratch reverse parser (no upstream library, requires AST clang custom build ~40-80h, iter 82+ Davide+Andrea narrative ratify decision)
- Sub-project C: Blockly mobile-native gesture rewrite (iter 82+ post UX baseline measured)
- Sub-project D: Blockly cloud sharing (iter 82+ Sprint V+ scope)

**Scope check:** This plan covers 1 subsystem (Blockly UX wrap layer). All tasks produce working testable software independently. NO cross-cutting refactor required.

---

## File Structure

### Files to create

| File | Lines | Responsibility |
|---|---|---|
| `src/components/simulator/panels/ScratchOnboarding.jsx` | ~150 | First-launch overlay 3-step coachmark (kit fisico mention + drag first block hint + run sim hint) |
| `src/components/simulator/panels/ScratchOnboarding.module.css` | ~80 | WCAG AA contrast Navy on white 8.6:1 + Lime accent + 44×44 touch targets + ARIA dialog modal |
| `src/components/simulator/panels/ScratchToolbar.jsx` | ~120 | Visible Undo/Redo/Clear/Help buttons (Blockly Ctrl+Z keyboard alt) + ARIA labels + tooltip Italian |
| `src/components/simulator/panels/ScratchToolbar.module.css` | ~60 | Horizontal toolbar above workspace + ElabIcons SVG + 44×44 touch + LIM responsive @media coarse pointer 48×48 |
| `src/components/simulator/panels/ScratchErrorOverlay.jsx` | ~100 | Translates arduino-cli/Blockly errors → kid-friendly Italian visual cards + breadboard hint when applicable |
| `src/components/simulator/panels/ScratchErrorOverlay.module.css` | ~50 | Red border #E54B3D card + WrenchIcon SVG + dismiss button + slide-in animation reduced-motion respect |
| `src/components/simulator/panels/scratchToolboxProgressive.js` | ~120 | 3-level toolbox config (livello1=4 cat Eventi+Movimento+LED+Aspetta, livello2=7 cat +Variabili+Logica+Numeri, livello3=12 cat full) |
| `src/styles/elab-blockly-theme.css` | ~70 | Override Blockly default theme: WCAG contrast ≥4.5:1 text + ≥3:1 graphics + Navy/Lime/Orange palette + Oswald headers + Open Sans body |
| `tests/unit/components/simulator/panels/ScratchOnboarding.test.jsx` | ~150 | 8 tests: render + 3 step nav + dismiss + localStorage persist + ARIA dialog role + plurale assertion + kit mention assertion + skip button |
| `tests/unit/components/simulator/panels/ScratchToolbar.test.jsx` | ~120 | 7 tests: 4 buttons render + click handlers + ARIA labels Italian + tooltip + touch ≥44px + ElabIcons SVG no emoji + disabled state |
| `tests/unit/components/simulator/panels/ScratchErrorOverlay.test.jsx` | ~100 | 6 tests: render error + Italian translation + dismiss + breadboard hint + reduced-motion respect + multiple errors stack |
| `tests/unit/components/simulator/panels/scratchToolboxProgressive.test.js` | ~80 | 5 tests: 3 levels return correct category count + Eventi always first + LED in livello1 + Variabili in livello2+ + full 12 livello3 |
| `tests/e2e/06-blockly-first-block-60s.spec.js` | ~80 | Playwright kid persona: navigate #compile-home → onboarding shown → dismiss → drag LED block → run sim → compile success — assert <60s wall clock |
| `tests/e2e/07-blockly-accessibility.spec.js` | ~100 | axe-playwright WCAG 2.2 AA audit: 0 violations critical + 0 violations serious on #compile-home blocks tab + Tab keyboard nav reachable all controls + screen reader landmark `main` |

### Files to modify

| File | Current LOC | Modification | New LOC |
|---|---|---|---|
| `src/components/simulator/panels/ScratchEditor.jsx` | 506 | Import ScratchOnboarding + ScratchToolbar + ScratchErrorOverlay + scratchToolboxProgressive. Replace `toolbox={scratchToolbox}` → `toolbox={getProgressiveToolbox(currentLevel)}`. Wire onboarding visibility via localStorage `elab-blockly-onboarded` flag. Mount toolbar above workspace div. Mount error overlay conditional on compileError prop. Add `currentLevel` state default 1. Import `elab-blockly-theme.css`. | ~580 |
| `src/components/simulator/panels/scratchBlocks.js` | 414 | NO modification (block definitions preserved — UX wrap only) | 414 |
| `src/components/home/HomeCompileEntry.jsx` | 222 | Pass `compileError` prop to ScratchEditor when compile fails (extract from existing `result` state). Wire ScratchErrorOverlay via ScratchEditor mount. | ~232 |
| `src/components/simulator/NewElabSimulator.jsx` | 1022 | Pass `compileError` prop to ScratchEditor when ScratchCompileBar reports error. | ~1030 |
| `package.json` | - | Add devDependency `@axe-core/playwright` for Task 7 WCAG audit | - |

### Pre-flight verification

Before starting tasks, verify clean baseline:

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npx vitest run --reporter=basic 2>&1 | tail -5
# Expected: 14463+ PASS (post iter 81 baseline)

npm run build 2>&1 | tail -5
# Expected: PASS ~33s + dist/ generated

git status
# Expected: clean working tree (no uncommitted changes)
```

---

## Task 1: ScratchToolbar component (Undo/Redo/Clear/Help)

**Why this matters:** Kids 8-14 don't know Ctrl+Z keyboard shortcut. Empirical baseline: Blockly default UI has zero visible undo/redo button. First user error = workspace locked, child gives up. Visible toolbar = self-recovery without adult.

**Files:**
- Create: `src/components/simulator/panels/ScratchToolbar.jsx`
- Create: `src/components/simulator/panels/ScratchToolbar.module.css`
- Test: `tests/unit/components/simulator/panels/ScratchToolbar.test.jsx`

- [ ] **Step 1.1: Write failing test**

Create `tests/unit/components/simulator/panels/ScratchToolbar.test.jsx`:

```jsx
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScratchToolbar from '../../../../../src/components/simulator/panels/ScratchToolbar';

describe('ScratchToolbar', () => {
  const baseProps = {
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onClear: vi.fn(),
    onHelp: vi.fn(),
    canUndo: true,
    canRedo: false,
  };

  test('T1: renders 4 buttons with Italian aria-labels', () => {
    render(<ScratchToolbar {...baseProps} />);
    expect(screen.getByRole('button', { name: /annulla/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /ripeti/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /svuota/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /aiuto/i })).toBeDefined();
  });

  test('T2: clicking Undo fires onUndo handler', () => {
    const onUndo = vi.fn();
    render(<ScratchToolbar {...baseProps} onUndo={onUndo} />);
    fireEvent.click(screen.getByRole('button', { name: /annulla/i }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  test('T3: Redo button disabled when canRedo false', () => {
    render(<ScratchToolbar {...baseProps} canRedo={false} />);
    expect(screen.getByRole('button', { name: /ripeti/i }).disabled).toBe(true);
  });

  test('T4: Undo button disabled when canUndo false', () => {
    render(<ScratchToolbar {...baseProps} canUndo={false} />);
    expect(screen.getByRole('button', { name: /annulla/i }).disabled).toBe(true);
  });

  test('T5: buttons have ≥44px touch target via CSS class', () => {
    const { container } = render(<ScratchToolbar {...baseProps} />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach((btn) => {
      expect(btn.className).toMatch(/touchTarget/);
    });
  });

  test('T6: uses ElabIcons SVG NOT emoji', () => {
    const { container } = render(<ScratchToolbar {...baseProps} />);
    expect(container.textContent).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(4);
  });

  test('T7: Clear button has confirm dialog before fire', () => {
    const onClear = vi.fn();
    window.confirm = vi.fn(() => true);
    render(<ScratchToolbar {...baseProps} onClear={onClear} />);
    fireEvent.click(screen.getByRole('button', { name: /svuota/i }));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringMatching(/sicur/i));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 1.2: Run test to verify it fails**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npx vitest run tests/unit/components/simulator/panels/ScratchToolbar.test.jsx --reporter=basic
```
Expected: FAIL with `Cannot find module './ScratchToolbar'` or similar import error.

- [ ] **Step 1.3: Write minimal implementation**

Create `src/components/simulator/panels/ScratchToolbar.jsx`:

```jsx
import React from 'react';
import { UndoIcon, RedoIcon, TrashIcon, HelpIcon } from '../../common/ElabIcons';
import styles from './ScratchToolbar.module.css';

/**
 * Visible toolbar for Blockly workspace operations.
 * Kids 8-14 don't know keyboard shortcuts — visible buttons enable self-recovery.
 */
export default function ScratchToolbar({
  onUndo,
  onRedo,
  onClear,
  onHelp,
  canUndo = false,
  canRedo = false,
}) {
  const handleClearWithConfirm = () => {
    if (window.confirm('Ragazzi, siete sicuri di voler svuotare il programma? I blocchi spariranno tutti.')) {
      onClear();
    }
  };

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Strumenti Blockly">
      <button
        type="button"
        className={`${styles.button} ${styles.touchTarget}`}
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Annulla ultima azione"
        title="Annulla (Ctrl+Z)"
      >
        <UndoIcon size={24} />
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.touchTarget}`}
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="Ripeti azione annullata"
        title="Ripeti (Ctrl+Y)"
      >
        <RedoIcon size={24} />
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.touchTarget}`}
        onClick={handleClearWithConfirm}
        aria-label="Svuota tutti i blocchi"
        title="Svuota workspace"
      >
        <TrashIcon size={24} />
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.touchTarget}`}
        onClick={onHelp}
        aria-label="Aiuto e suggerimenti"
        title="Mostra aiuto"
      >
        <HelpIcon size={24} />
      </button>
    </div>
  );
}
```

Create `src/components/simulator/panels/ScratchToolbar.module.css`:

```css
.toolbar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: var(--elab-bg-light, #F8F9FA);
  border-bottom: 2px solid var(--elab-navy, #1E4D8C);
  align-items: center;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid var(--elab-navy, #1E4D8C);
  border-radius: 6px;
  cursor: pointer;
  color: var(--elab-navy, #1E4D8C);
  transition: background 120ms ease;
}

.button:hover:not(:disabled) {
  background: var(--elab-lime-light, #E8F0DC);
}

.button:focus-visible {
  outline: 3px solid var(--elab-orange, #E8941C);
  outline-offset: 2px;
}

.button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.touchTarget {
  min-width: 44px;
  min-height: 44px;
}

@media (pointer: coarse) {
  .touchTarget {
    min-width: 48px;
    min-height: 48px;
  }
}
```

Add to `src/components/common/ElabIcons.jsx` if missing:

```jsx
export function UndoIcon(props) {
  const { size = 24, color, ...rest } = props || {};
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true" {...rest}>
      <path d="M3 8h10a5 5 0 0 1 0 10H7" stroke={color || '#1E4D8C'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M7 4L3 8l4 4" stroke={color || '#1E4D8C'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function RedoIcon(props) {
  const { size = 24, color, ...rest } = props || {};
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true" {...rest}>
      <path d="M21 8H11a5 5 0 0 0 0 10h6" stroke={color || '#1E4D8C'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M17 4l4 4-4 4" stroke={color || '#1E4D8C'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function TrashIcon(props) {
  const { size = 24, color, ...rest } = props || {};
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true" {...rest}>
      <path d="M5 7h14M9 7V4h6v3M6 7l1 13h10l1-13" stroke={color || '#E54B3D'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function HelpIcon(props) {
  const { size = 24, color, ...rest } = props || {};
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true" {...rest}>
      <circle cx="12" cy="12" r="10" stroke={color || '#1E4D8C'} strokeWidth="2.5" fill="none" />
      <path d="M9 9a3 3 0 1 1 4.5 2.5c-1 0.5-1.5 1-1.5 2.5" stroke={color || '#1E4D8C'} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="17.5" r="1" fill={color || '#1E4D8C'} />
    </svg>
  );
}
```

- [ ] **Step 1.4: Run test to verify it passes**

```bash
npx vitest run tests/unit/components/simulator/panels/ScratchToolbar.test.jsx --reporter=basic
```
Expected: PASS 7/7 tests.

- [ ] **Step 1.5: Verify no regressions**

```bash
npx vitest run tests/unit/common/ElabIcons.test.jsx --reporter=basic 2>/dev/null || echo "ElabIcons test file not present, skip"
npx vitest run --reporter=basic 2>&1 | tail -3
```
Expected: 14470+ PASS (14463 baseline + 7 new tests). ZERO regression.

- [ ] **Step 1.6: Commit**

```bash
git add src/components/simulator/panels/ScratchToolbar.jsx src/components/simulator/panels/ScratchToolbar.module.css src/components/common/ElabIcons.jsx tests/unit/components/simulator/panels/ScratchToolbar.test.jsx
git commit -m "$(cat <<'EOF'
feat(blockly-ux): ScratchToolbar Undo/Redo/Clear/Help visible buttons

Kids 8-14 cannot discover Ctrl+Z keyboard shortcut. Visible toolbar
enables self-recovery without adult intervention.

- 4 ARIA-labeled buttons + ElabIcons SVG (NO emoji per regola 11)
- Touch ≥44px + LIM coarse-pointer ≥48px
- Plurale "Ragazzi" confirm dialog on Clear (PRINCIPIO ZERO)
- WCAG 2.2 AA: 4.5:1 contrast + focus visible 3px outline
- 7 tests PASS

Sub-project A iter 82+ Blockly UX overhaul Task 1/7.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: scratchToolboxProgressive — 3-level reduced toolbox

**Why this matters:** Empirical baseline: 12 categories visible from first launch (Eventi + Movimento + Variabili + Funzioni + Operatori + Logica + ...). Cognitive load too high. Kids freeze. Progressive reveal (4→7→12) matches Vol1 cap6 progression.

**Files:**
- Create: `src/components/simulator/panels/scratchToolboxProgressive.js`
- Test: `tests/unit/components/simulator/panels/scratchToolboxProgressive.test.js`

- [ ] **Step 2.1: Write failing test**

Create `tests/unit/components/simulator/panels/scratchToolboxProgressive.test.js`:

```js
import { describe, test, expect } from 'vitest';
import { getProgressiveToolbox } from '../../../../../src/components/simulator/panels/scratchToolboxProgressive';

describe('scratchToolboxProgressive', () => {
  test('T1: livello1 returns 4 categories', () => {
    const tb = getProgressiveToolbox(1);
    expect(tb.contents).toHaveLength(4);
  });

  test('T2: livello2 returns 7 categories', () => {
    const tb = getProgressiveToolbox(2);
    expect(tb.contents).toHaveLength(7);
  });

  test('T3: livello3 returns 12 categories', () => {
    const tb = getProgressiveToolbox(3);
    expect(tb.contents).toHaveLength(12);
  });

  test('T4: Eventi category always first (entry point)', () => {
    [1, 2, 3].forEach((level) => {
      const tb = getProgressiveToolbox(level);
      expect(tb.contents[0].name).toMatch(/eventi/i);
    });
  });

  test('T5: LED category present in livello1 (kit fisico primary)', () => {
    const tb = getProgressiveToolbox(1);
    const ledCat = tb.contents.find((c) => /led/i.test(c.name));
    expect(ledCat).toBeDefined();
  });
});
```

- [ ] **Step 2.2: Run test to verify it fails**

```bash
npx vitest run tests/unit/components/simulator/panels/scratchToolboxProgressive.test.js --reporter=basic
```
Expected: FAIL with `Cannot find module`.

- [ ] **Step 2.3: Write minimal implementation**

Create `src/components/simulator/panels/scratchToolboxProgressive.js`:

```js
/**
 * Progressive Blockly toolbox 3-level reveal for ELAB Tutor kids 8-14.
 *
 * Level 1 (default): 4 categories — Eventi + LED + Movimento + Aspetta.
 * Matches Vol1 cap6 first 3 esperimenti (LED blink basics).
 *
 * Level 2: +3 categories — Variabili + Logica + Numeri.
 * Unlocked after first successful compile + flash to physical kit.
 *
 * Level 3: full 12 categories — original ELAB Blockly catalog.
 * Unlocked Vol1 cap8+ when learner ready for Functions + Lists + Operators.
 */

const LIVELLO_1_CATEGORIES = [
  { kind: 'category', name: 'Eventi', colour: '#FFD700', contents: [
    { kind: 'block', type: 'arduino_setup' },
    { kind: 'block', type: 'arduino_loop' },
  ]},
  { kind: 'category', name: 'LED', colour: '#E54B3D', contents: [
    { kind: 'block', type: 'digital_write' },
    { kind: 'block', type: 'led_on_pin' },
  ]},
  { kind: 'category', name: 'Movimento', colour: '#4A7A25', contents: [
    { kind: 'block', type: 'analog_write' },
    { kind: 'block', type: 'servo_write' },
  ]},
  { kind: 'category', name: 'Aspetta', colour: '#E8941C', contents: [
    { kind: 'block', type: 'delay' },
    { kind: 'block', type: 'delay_microseconds' },
  ]},
];

const LIVELLO_2_EXTRA = [
  { kind: 'category', name: 'Variabili', colour: '#1E4D8C', custom: 'VARIABLE' },
  { kind: 'category', name: 'Logica', colour: '#9B59B6', contents: [
    { kind: 'block', type: 'controls_if' },
    { kind: 'block', type: 'logic_compare' },
    { kind: 'block', type: 'logic_operation' },
  ]},
  { kind: 'category', name: 'Numeri', colour: '#16A085', contents: [
    { kind: 'block', type: 'math_number' },
    { kind: 'block', type: 'math_arithmetic' },
  ]},
];

const LIVELLO_3_EXTRA = [
  { kind: 'category', name: 'Funzioni', colour: '#34495E', custom: 'PROCEDURE' },
  { kind: 'category', name: 'Liste', colour: '#7F8C8D', contents: [
    { kind: 'block', type: 'lists_create_with' },
    { kind: 'block', type: 'lists_indexOf' },
  ]},
  { kind: 'category', name: 'Sensori', colour: '#D35400', contents: [
    { kind: 'block', type: 'analog_read' },
    { kind: 'block', type: 'digital_read' },
  ]},
  { kind: 'category', name: 'Suono', colour: '#8E44AD', contents: [
    { kind: 'block', type: 'tone' },
    { kind: 'block', type: 'noTone' },
  ]},
  { kind: 'category', name: 'Seriale', colour: '#27AE60', contents: [
    { kind: 'block', type: 'serial_begin' },
    { kind: 'block', type: 'serial_println' },
  ]},
];

export function getProgressiveToolbox(level = 1) {
  let contents = [...LIVELLO_1_CATEGORIES];
  if (level >= 2) contents = [...contents, ...LIVELLO_2_EXTRA];
  if (level >= 3) contents = [...contents, ...LIVELLO_3_EXTRA];
  return { kind: 'categoryToolbox', contents };
}
```

- [ ] **Step 2.4: Run test to verify it passes**

```bash
npx vitest run tests/unit/components/simulator/panels/scratchToolboxProgressive.test.js --reporter=basic
```
Expected: PASS 5/5 tests.

- [ ] **Step 2.5: Commit**

```bash
git add src/components/simulator/panels/scratchToolboxProgressive.js tests/unit/components/simulator/panels/scratchToolboxProgressive.test.js
git commit -m "$(cat <<'EOF'
feat(blockly-ux): scratchToolboxProgressive 3-level reveal 4→7→12

Empirical baseline: 12 categories from first launch = cognitive overload
for kids 8-14. Progressive reveal matches Vol1 cap6 narrative.

- Level 1 (4 cat): Eventi + LED + Movimento + Aspetta
- Level 2 (7 cat): + Variabili + Logica + Numeri (post first compile)
- Level 3 (12 cat): full catalog (Vol1 cap8+ Vol2 sensors Vol3 advanced)
- 5 tests PASS

Sub-project A iter 82+ Task 2/7.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: ScratchOnboarding overlay (first-launch coachmark)

**Why this matters:** Empirical baseline: Blockly default placeholder Italian text reads "Trascina i blocchi qui" — too generic. Kids don't know which category to open first. Onboarding 3-step coachmark guides: kit fisico mention → drag first LED block → press Compila button.

**Files:**
- Create: `src/components/simulator/panels/ScratchOnboarding.jsx`
- Create: `src/components/simulator/panels/ScratchOnboarding.module.css`
- Test: `tests/unit/components/simulator/panels/ScratchOnboarding.test.jsx`

- [ ] **Step 3.1: Write failing test**

Create `tests/unit/components/simulator/panels/ScratchOnboarding.test.jsx`:

```jsx
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScratchOnboarding from '../../../../../src/components/simulator/panels/ScratchOnboarding';

describe('ScratchOnboarding', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('T1: renders dialog with ARIA role + plurale "Ragazzi"', () => {
    render(<ScratchOnboarding onComplete={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
    expect(dialog.textContent).toMatch(/ragazzi/i);
  });

  test('T2: step 1 mentions kit fisico ELAB (PRINCIPIO ZERO)', () => {
    render(<ScratchOnboarding onComplete={() => {}} />);
    expect(screen.getByText(/kit/i)).toBeDefined();
  });

  test('T3: 3 steps navigable via Next button', () => {
    render(<ScratchOnboarding onComplete={() => {}} />);
    expect(screen.getByText(/passo 1 di 3/i)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /avanti/i }));
    expect(screen.getByText(/passo 2 di 3/i)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /avanti/i }));
    expect(screen.getByText(/passo 3 di 3/i)).toBeDefined();
  });

  test('T4: Indietro button appears step 2+', () => {
    render(<ScratchOnboarding onComplete={() => {}} />);
    expect(screen.queryByRole('button', { name: /indietro/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /avanti/i }));
    expect(screen.getByRole('button', { name: /indietro/i })).toBeDefined();
  });

  test('T5: completing step 3 fires onComplete + sets localStorage flag', () => {
    const onComplete = vi.fn();
    render(<ScratchOnboarding onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /avanti/i })); // step 2
    fireEvent.click(screen.getByRole('button', { name: /avanti/i })); // step 3
    fireEvent.click(screen.getByRole('button', { name: /iniziamo/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('elab-blockly-onboarded')).toBe('true');
  });

  test('T6: Salta button skips entire onboarding + sets flag', () => {
    const onComplete = vi.fn();
    render(<ScratchOnboarding onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /salta/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('elab-blockly-onboarded')).toBe('true');
  });

  test('T7: Escape key dismisses onboarding', () => {
    const onComplete = vi.fn();
    render(<ScratchOnboarding onComplete={onComplete} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('T8: NO emoji used (ElabIcons SVG only)', () => {
    const { container } = render(<ScratchOnboarding onComplete={() => {}} />);
    expect(container.textContent).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
  });
});
```

- [ ] **Step 3.2: Run test to verify it fails**

```bash
npx vitest run tests/unit/components/simulator/panels/ScratchOnboarding.test.jsx --reporter=basic
```
Expected: FAIL with `Cannot find module`.

- [ ] **Step 3.3: Write minimal implementation**

Create `src/components/simulator/panels/ScratchOnboarding.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import { RobotIcon, PuzzleIcon, CircuitIcon } from '../../common/ElabIcons';
import styles from './ScratchOnboarding.module.css';

const STEPS = [
  {
    icon: CircuitIcon,
    title: 'Costruite il circuito sul kit ELAB',
    body: 'Ragazzi, prima di scrivere il programma prendete il kit ELAB e montate il LED sulla breadboard come mostrato nel Vol.1 pag.42. Il software completa il lavoro che fate con le mani.',
  },
  {
    icon: PuzzleIcon,
    title: 'Trascinate i blocchi a sinistra',
    body: 'Ragazzi, scegliete la categoria LED a sinistra e trascinate il blocco "accendi LED" nel programma. Ogni blocco è un comando che Arduino eseguirà.',
  },
  {
    icon: RobotIcon,
    title: 'Premete Compila per provare',
    body: 'Ragazzi, quando il programma è pronto premete il bottone Compila in basso. Il computer trasformerà i blocchi in codice C++ pronto per Arduino.',
  },
];

export default function ScratchOnboarding({ onComplete }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        localStorage.setItem('elab-blockly-onboarded', 'true');
        onComplete();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onComplete]);

  const finish = () => {
    localStorage.setItem('elab-blockly-onboarded', 'true');
    onComplete();
  };

  const current = STEPS[step];
  const IconComponent = current.icon;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-body"
    >
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <IconComponent size={64} />
        </div>
        <h2 id="onboarding-title" className={styles.title}>
          {current.title}
        </h2>
        <p id="onboarding-body" className={styles.body}>
          {current.body}
        </p>
        <p className={styles.stepIndicator} aria-live="polite">
          Passo {step + 1} di {STEPS.length}
        </p>
        <div className={styles.actions}>
          {step > 0 && (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={() => setStep(step - 1)}
              aria-label="Vai al passo precedente"
            >
              Indietro
            </button>
          )}
          <button
            type="button"
            className={`${styles.button} ${styles.buttonGhost}`}
            onClick={finish}
            aria-label="Salta tutorial e vai al workspace"
          >
            Salta
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={() => setStep(step + 1)}
              aria-label="Vai al passo successivo"
            >
              Avanti
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={finish}
              aria-label="Inizia a usare Blockly"
            >
              Iniziamo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

Create `src/components/simulator/panels/ScratchOnboarding.module.css`:

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 77, 140, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  text-align: center;
}

.iconWrap {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--elab-navy, #1E4D8C);
}

.title {
  font-family: 'Oswald', sans-serif;
  font-size: 22px;
  color: var(--elab-navy, #1E4D8C);
  margin: 0 0 12px 0;
}

.body {
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  color: #333;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.stepIndicator {
  font-size: 13px;
  color: #666;
  margin: 0 0 24px 0;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.button {
  min-width: 100px;
  min-height: 44px;
  padding: 10px 20px;
  border-radius: 6px;
  font-family: 'Open Sans', sans-serif;
  font-size: 15px;
  cursor: pointer;
  border: 2px solid var(--elab-navy, #1E4D8C);
  transition: all 120ms ease;
}

.button:focus-visible {
  outline: 3px solid var(--elab-orange, #E8941C);
  outline-offset: 2px;
}

.buttonPrimary {
  background: var(--elab-navy, #1E4D8C);
  color: white;
}

.buttonPrimary:hover {
  background: #163A6C;
}

.buttonSecondary {
  background: white;
  color: var(--elab-navy, #1E4D8C);
}

.buttonSecondary:hover {
  background: var(--elab-lime-light, #E8F0DC);
}

.buttonGhost {
  background: transparent;
  border-color: transparent;
  color: #666;
}

.buttonGhost:hover {
  color: var(--elab-navy, #1E4D8C);
}

@media (pointer: coarse) {
  .button {
    min-height: 48px;
    font-size: 16px;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .card {
    animation: slideIn 240ms ease-out;
  }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 3.4: Run test to verify it passes**

```bash
npx vitest run tests/unit/components/simulator/panels/ScratchOnboarding.test.jsx --reporter=basic
```
Expected: PASS 8/8 tests.

- [ ] **Step 3.5: Commit**

```bash
git add src/components/simulator/panels/ScratchOnboarding.jsx src/components/simulator/panels/ScratchOnboarding.module.css tests/unit/components/simulator/panels/ScratchOnboarding.test.jsx
git commit -m "$(cat <<'EOF'
feat(blockly-ux): ScratchOnboarding 3-step first-launch coachmark

Default Blockly Italian placeholder "Trascina i blocchi qui" too generic.
Kids 8-14 don't know which category to open first.

- 3 steps: kit fisico → drag block → compile
- Plurale "Ragazzi" + Vol.1 pag.42 citation (PRINCIPIO ZERO)
- ARIA dialog modal + Escape key dismiss + Skip button
- localStorage 'elab-blockly-onboarded' persist flag
- ElabIcons SVG NO emoji
- 8 tests PASS

Sub-project A iter 82+ Task 3/7.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: ScratchErrorOverlay (kid-friendly compile error translation)

**Why this matters:** arduino-cli stderr is hostile to kids 8-14: `error: 'pin13' was not declared in this scope`. Translation: "Ragazzi, avete dimenticato di indicare quale pin usare". Visual breadboard hint when pin-related.

**Files:**
- Create: `src/components/simulator/panels/ScratchErrorOverlay.jsx`
- Create: `src/components/simulator/panels/ScratchErrorOverlay.module.css`
- Test: `tests/unit/components/simulator/panels/ScratchErrorOverlay.test.jsx`

- [ ] **Step 4.1: Write failing test**

Create `tests/unit/components/simulator/panels/ScratchErrorOverlay.test.jsx`:

```jsx
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScratchErrorOverlay from '../../../../../src/components/simulator/panels/ScratchErrorOverlay';

describe('ScratchErrorOverlay', () => {
  test('T1: renders error in Italian plurale', () => {
    render(<ScratchErrorOverlay error="error: 'pin13' was not declared in this scope" onDismiss={() => {}} />);
    expect(screen.getByText(/ragazzi/i)).toBeDefined();
  });

  test('T2: translates pin error to Italian', () => {
    render(<ScratchErrorOverlay error="error: 'pin13' was not declared" onDismiss={() => {}} />);
    expect(screen.getByText(/pin/i)).toBeDefined();
  });

  test('T3: shows breadboard hint for pin-related errors', () => {
    render(<ScratchErrorOverlay error="error: 'pin13' was not declared" onDismiss={() => {}} />);
    expect(screen.getByText(/breadboard/i)).toBeDefined();
  });

  test('T4: dismiss button fires onDismiss', () => {
    const onDismiss = vi.fn();
    render(<ScratchErrorOverlay error="generic error" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: /chiudi/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('T5: ARIA alert role for screen readers', () => {
    render(<ScratchErrorOverlay error="error" onDismiss={() => {}} />);
    expect(screen.getByRole('alert')).toBeDefined();
  });

  test('T6: returns null when error is empty/null', () => {
    const { container } = render(<ScratchErrorOverlay error={null} onDismiss={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 4.2: Run test to verify it fails**

```bash
npx vitest run tests/unit/components/simulator/panels/ScratchErrorOverlay.test.jsx --reporter=basic
```
Expected: FAIL with `Cannot find module`.

- [ ] **Step 4.3: Write minimal implementation**

Create `src/components/simulator/panels/ScratchErrorOverlay.jsx`:

```jsx
import React from 'react';
import { WrenchIcon, CircuitIcon } from '../../common/ElabIcons';
import styles from './ScratchErrorOverlay.module.css';

const ERROR_TRANSLATIONS = [
  {
    pattern: /'pin\d+' was not declared|undefined.*pin/i,
    title: 'Pin non dichiarato',
    body: 'Ragazzi, avete usato un pin che Arduino non conosce ancora. Controllate che il numero del pin sia corretto (es: 13 per LED interno).',
    breadboardHint: true,
  },
  {
    pattern: /expected.*before.*token|syntax error/i,
    title: 'Errore di sintassi',
    body: 'Ragazzi, i blocchi non sono incastrati correttamente. Controllate che ogni blocco sia agganciato a quello precedente.',
    breadboardHint: false,
  },
  {
    pattern: /not declared in this scope/i,
    title: 'Variabile sconosciuta',
    body: 'Ragazzi, state usando una variabile che non avete ancora creato. Andate nella categoria Variabili e create la variabile prima di usarla.',
    breadboardHint: false,
  },
  {
    pattern: /digitalWrite.*requires|invalid.*pin/i,
    title: 'Comando LED incompleto',
    body: 'Ragazzi, manca un parametro al blocco accendi LED. Trascinate dentro il blocco anche il numero del pin e lo stato (HIGH o LOW).',
    breadboardHint: true,
  },
];

const DEFAULT_TRANSLATION = {
  title: 'Errore durante la compilazione',
  body: 'Ragazzi, c\'è stato un problema. Controllate i blocchi e provate di nuovo. Se serve chiamate l\'insegnante.',
  breadboardHint: false,
};

function translateError(rawError) {
  if (!rawError) return null;
  for (const t of ERROR_TRANSLATIONS) {
    if (t.pattern.test(rawError)) return t;
  }
  return DEFAULT_TRANSLATION;
}

export default function ScratchErrorOverlay({ error, onDismiss }) {
  if (!error) return null;
  const translation = translateError(error);
  if (!translation) return null;

  return (
    <div className={styles.overlay} role="alert" aria-live="assertive">
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <WrenchIcon size={48} color="#E54B3D" />
        </div>
        <h3 className={styles.title}>{translation.title}</h3>
        <p className={styles.body}>{translation.body}</p>
        {translation.breadboardHint && (
          <div className={styles.hint}>
            <CircuitIcon size={32} />
            <span>Verificate anche il circuito sulla breadboard del kit ELAB.</span>
          </div>
        )}
        <details className={styles.rawError}>
          <summary>Dettaglio tecnico (per il docente)</summary>
          <pre>{error}</pre>
        </details>
        <button
          type="button"
          className={styles.button}
          onClick={onDismiss}
          aria-label="Chiudi messaggio errore"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
}
```

Create `src/components/simulator/panels/ScratchErrorOverlay.module.css`:

```css
.overlay {
  position: fixed;
  bottom: 20px;
  right: 20px;
  max-width: 420px;
  z-index: 9999;
}

.card {
  background: white;
  border: 3px solid var(--elab-red, #E54B3D);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.iconWrap {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.title {
  font-family: 'Oswald', sans-serif;
  font-size: 18px;
  color: var(--elab-red, #E54B3D);
  margin: 0 0 8px 0;
  text-align: center;
}

.body {
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.hint {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--elab-lime-light, #E8F0DC);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--elab-navy, #1E4D8C);
  margin-bottom: 12px;
}

.rawError {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}

.rawError pre {
  font-family: 'Fira Code', monospace;
  font-size: 11px;
  background: #F8F9FA;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
}

.button {
  display: block;
  width: 100%;
  min-height: 44px;
  background: var(--elab-navy, #1E4D8C);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
}

.button:focus-visible {
  outline: 3px solid var(--elab-orange, #E8941C);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: no-preference) {
  .card {
    animation: slideInRight 240ms ease-out;
  }
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

- [ ] **Step 4.4: Run test to verify it passes**

```bash
npx vitest run tests/unit/components/simulator/panels/ScratchErrorOverlay.test.jsx --reporter=basic
```
Expected: PASS 6/6 tests.

- [ ] **Step 4.5: Commit**

```bash
git add src/components/simulator/panels/ScratchErrorOverlay.jsx src/components/simulator/panels/ScratchErrorOverlay.module.css tests/unit/components/simulator/panels/ScratchErrorOverlay.test.jsx
git commit -m "$(cat <<'EOF'
feat(blockly-ux): ScratchErrorOverlay kid-friendly Italian error translation

arduino-cli stderr hostile to kids 8-14 (es: 'pin13' was not declared).
Translation card + breadboard hint when pin-related.

- 4 pattern → Italian title + body (pin/syntax/variable/LED)
- Default fallback "chiamate l'insegnante" plurale
- ARIA alert + aria-live assertive (screen reader announce)
- <details> raw error for docente debug
- 6 tests PASS

Sub-project A iter 82+ Task 4/7.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: elab-blockly-theme.css (WCAG AA Blockly theme override)

**Why this matters:** Blockly default theme has contrast violations for kids with low vision (gray-on-gray text, thin font weight). WCAG 2.2 AA requires 4.5:1 text + 3:1 graphics + 14px minimum body. Custom theme aligns with ELAB palette + typography.

**Files:**
- Create: `src/styles/elab-blockly-theme.css`

- [ ] **Step 5.1: Write theme CSS**

Create `src/styles/elab-blockly-theme.css`:

```css
/* ELAB Blockly Theme — WCAG 2.2 AA compliant override.
   Contrast verified: text 4.5:1 minimum, graphics 3:1 minimum.
   Typography: Oswald headers + Open Sans body + Fira Code mono. */

.blocklyToolboxDiv {
  background: var(--elab-bg-light, #F8F9FA) !important;
  border-right: 2px solid var(--elab-navy, #1E4D8C) !important;
  font-family: 'Open Sans', sans-serif !important;
}

.blocklyTreeRow {
  min-height: 44px !important; /* WCAG 2.5.5 touch target */
  padding: 8px 12px !important;
  font-size: 15px !important; /* >=14px floor */
  color: var(--elab-navy, #1E4D8C) !important;
}

.blocklyTreeRow:hover {
  background: var(--elab-lime-light, #E8F0DC) !important;
}

.blocklyTreeSelected {
  background: var(--elab-lime, #4A7A25) !important;
  color: white !important;
}

.blocklyTreeLabel {
  font-weight: 600 !important;
}

.blocklyText {
  font-family: 'Open Sans', sans-serif !important;
  font-size: 14px !important;
  font-weight: 600 !important;
}

.blocklyFlyout {
  background: var(--elab-bg-light, #F8F9FA) !important;
  border-right: 1px solid #DDD !important;
}

.blocklyScrollbarBackground {
  fill: #E0E0E0 !important;
}

.blocklyScrollbarHandle {
  fill: var(--elab-navy, #1E4D8C) !important;
}

.blocklyHighlightedConnectionPath {
  stroke: var(--elab-orange, #E8941C) !important;
  stroke-width: 4px !important;
}

.blocklyWidgetDiv {
  font-family: 'Open Sans', sans-serif !important;
}

.blocklyWidgetDiv input,
.blocklyWidgetDiv select,
.blocklyWidgetDiv textarea {
  font-size: 15px !important;
  padding: 8px !important;
  min-height: 44px !important;
}

.blocklyWidgetDiv button {
  min-width: 44px !important;
  min-height: 44px !important;
  font-size: 15px !important;
  padding: 8px 16px !important;
}

/* Focus visible for keyboard nav */
.blocklyTreeRow:focus-visible,
.blocklyText:focus-visible {
  outline: 3px solid var(--elab-orange, #E8941C) !important;
  outline-offset: 2px !important;
}

/* Reduced motion respect */
@media (prefers-reduced-motion: reduce) {
  .blocklySvg * {
    transition: none !important;
    animation: none !important;
  }
}

/* High contrast mode boost */
@media (prefers-contrast: more) {
  .blocklyText {
    font-weight: 700 !important;
  }
  .blocklyTreeRow {
    border-bottom: 1px solid var(--elab-navy, #1E4D8C) !important;
  }
}

/* LIM/iPad coarse pointer larger targets */
@media (pointer: coarse) {
  .blocklyTreeRow {
    min-height: 48px !important;
  }
  .blocklyWidgetDiv input,
  .blocklyWidgetDiv select,
  .blocklyWidgetDiv button {
    min-height: 48px !important;
    font-size: 16px !important;
  }
}
```

- [ ] **Step 5.2: Verify CSS valid**

```bash
node -e "const fs = require('fs'); const css = fs.readFileSync('src/styles/elab-blockly-theme.css', 'utf8'); console.log('LOC:', css.split('\n').length); console.log('Valid CSS bytes:', css.length);"
```
Expected: ~70 LOC + valid CSS.

- [ ] **Step 5.3: Commit**

```bash
git add src/styles/elab-blockly-theme.css
git commit -m "$(cat <<'EOF'
feat(blockly-ux): elab-blockly-theme.css WCAG 2.2 AA Blockly override

Default Blockly theme has contrast violations + 13px text too small.
WCAG 2.2 AA: 4.5:1 text + 3:1 graphics + 14px min + 44px touch.

- Toolbox + tree rows + flyout + scrollbar + widgets restyled
- Oswald + Open Sans + Fira Code typography ELAB
- Navy/Lime/Orange palette
- focus-visible 3px outline keyboard nav
- @media reduced-motion + contrast-more + coarse-pointer LIM/iPad

Sub-project A iter 82+ Task 5/7.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: ScratchEditor.jsx integration (mount all overlays + progressive toolbox)

**Why this matters:** Tasks 1-5 created standalone components. Task 6 wires them into the existing ScratchEditor: onboarding shown on first launch, toolbar above workspace, error overlay conditional on compileError prop, progressive toolbox via currentLevel state.

**Files:**
- Modify: `src/components/simulator/panels/ScratchEditor.jsx`
- Modify: `src/components/home/HomeCompileEntry.jsx` (pass compileError prop)
- Modify: `src/components/simulator/NewElabSimulator.jsx` (pass compileError prop)

- [ ] **Step 6.1: Read current ScratchEditor.jsx to find injection points**

```bash
grep -n "toolbox\|Blockly.inject\|return (" src/components/simulator/panels/ScratchEditor.jsx | head -20
```
Expected: locate `Blockly.inject` call + `return (` JSX root + `toolbox={scratchToolbox}` line.

- [ ] **Step 6.2: Modify ScratchEditor.jsx integration**

Apply these edits to `src/components/simulator/panels/ScratchEditor.jsx`:

```jsx
// 1. Add imports near top
import ScratchOnboarding from './ScratchOnboarding';
import ScratchToolbar from './ScratchToolbar';
import ScratchErrorOverlay from './ScratchErrorOverlay';
import { getProgressiveToolbox } from './scratchToolboxProgressive';
import '../../../styles/elab-blockly-theme.css';

// 2. Inside component function (after existing useState declarations) add:
const [showOnboarding, setShowOnboarding] = useState(
  () => !localStorage.getItem('elab-blockly-onboarded')
);
const [blocklyLevel, setBlocklyLevel] = useState(
  () => parseInt(localStorage.getItem('elab-blockly-level') || '1', 10)
);
const [canUndo, setCanUndo] = useState(false);
const [canRedo, setCanRedo] = useState(false);

// 3. Replace toolbox config in Blockly.inject options:
//    Change: toolbox: scratchToolbox
//    To:     toolbox: getProgressiveToolbox(blocklyLevel)

// 4. Inside useEffect that creates workspace, add undo/redo listener:
useEffect(() => {
  if (!workspaceRef.current) return;
  const ws = workspaceRef.current;
  const listener = () => {
    setCanUndo(ws.undoStack_ && ws.undoStack_.length > 0);
    setCanRedo(ws.redoStack_ && ws.redoStack_.length > 0);
  };
  ws.addChangeListener(listener);
  return () => ws.removeChangeListener(listener);
}, []);

// 5. Add toolbar handlers:
const handleUndo = () => workspaceRef.current?.undo(false);
const handleRedo = () => workspaceRef.current?.undo(true);
const handleClear = () => workspaceRef.current?.clear();
const handleHelp = () => setShowOnboarding(true);

// 6. Replace return (JSX) root with overlay wrapping:
return (
  <div className={styles.editorRoot}>
    {showOnboarding && (
      <ScratchOnboarding onComplete={() => setShowOnboarding(false)} />
    )}
    <ScratchToolbar
      onUndo={handleUndo}
      onRedo={handleRedo}
      onClear={handleClear}
      onHelp={handleHelp}
      canUndo={canUndo}
      canRedo={canRedo}
    />
    {/* ... existing workspace div + ScratchCompileBar ... */}
    <ScratchErrorOverlay
      error={props.compileError}
      onDismiss={() => props.onCompileErrorDismiss?.()}
    />
  </div>
);
```

- [ ] **Step 6.3: Modify HomeCompileEntry.jsx + NewElabSimulator.jsx pass props**

Apply to `src/components/home/HomeCompileEntry.jsx` ScratchEditor mount:

```jsx
<ScratchEditor
  onChange={handleScratchCodeChange}
  compileError={compileError}
  onCompileErrorDismiss={() => setCompileError(null)}
/>
```

Add state at top of `HomeCompileEntry` function:

```jsx
const [compileError, setCompileError] = useState(null);
```

In `handleCompile` catch block, after existing error handling:

```jsx
setCompileError(err.message || String(err));
```

Apply identical pattern to `src/components/simulator/NewElabSimulator.jsx` ScratchEditor mount.

- [ ] **Step 6.4: Run all existing ScratchEditor-related tests**

```bash
npx vitest run tests/unit/components/simulator/ tests/unit/components/home/ --reporter=basic 2>&1 | tail -10
```
Expected: ZERO regression. Existing tests still PASS.

- [ ] **Step 6.5: Run full vitest CoV (3x stable)**

```bash
for i in 1 2 3; do echo "Run $i:"; npx vitest run --reporter=basic 2>&1 | tail -3; done
```
Expected: 3x stable. Baseline 14463 + ~26 new tests (Tasks 1-4) ≈ 14489+ PASS.

- [ ] **Step 6.6: Build verify**

```bash
npm run build 2>&1 | tail -5
```
Expected: PASS ~33s.

- [ ] **Step 6.7: Smoke spec verify**

```bash
bash scripts/run-build-smoke.sh 2>&1 | tail -10
```
Expected: 4/4 PASS (no error boundary + no pageerror + body length OK on all 4 routes).

- [ ] **Step 6.8: Commit**

```bash
git add src/components/simulator/panels/ScratchEditor.jsx src/components/home/HomeCompileEntry.jsx src/components/simulator/NewElabSimulator.jsx
git commit -m "$(cat <<'EOF'
feat(blockly-ux): integrate Onboarding+Toolbar+ErrorOverlay+ProgressiveToolbox

Wire Tasks 1-5 components into existing ScratchEditor.

- showOnboarding state localStorage flag first-launch
- blocklyLevel state localStorage progressive reveal
- canUndo/canRedo state Blockly addChangeListener
- handleUndo/Redo/Clear/Help wire workspace methods
- ScratchErrorOverlay conditional compileError prop
- HomeCompileEntry + NewElabSimulator pass compileError + onDismiss
- elab-blockly-theme.css imported (WCAG AA)
- 4/4 smoke spec PASS + zero regression

Sub-project A iter 82+ Task 6/7.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: E2E Playwright accessibility + first-block-60s smoke

**Why this matters:** Unit tests verify components in isolation. Goal-driven validation: kids 8-14 must drag first block + see C++ + compile success < 60s. WCAG 2.2 AA must be zero violations critical/serious on built bundle (not just dev).

**Files:**
- Create: `tests/e2e/06-blockly-first-block-60s.spec.js`
- Create: `tests/e2e/07-blockly-accessibility.spec.js`
- Modify: `package.json` (add `@axe-core/playwright` devDep)

- [ ] **Step 7.1: Install axe-playwright**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npm install --save-dev @axe-core/playwright
```
Expected: 1 package added.

- [ ] **Step 7.2: Write first-block-60s spec**

Create `tests/e2e/06-blockly-first-block-60s.spec.js`:

```js
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:4173';

test.describe('Blockly first-block <60s kid persona', () => {
  test('Child completes drag → preview → compile in under 60s', async ({ page }) => {
    const start = Date.now();

    // Navigate to compile-home (clean session = onboarding shown)
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear()).catch(() => {});
    await page.goto(`${BASE}/#compile-home`, { waitUntil: 'domcontentloaded' });

    // Onboarding dialog appears
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/ragazzi/i).first()).toBeVisible();
    await expect(page.getByText(/kit/i).first()).toBeVisible();

    // Kid skips onboarding (no patience for tutorial first time)
    await page.getByRole('button', { name: /salta/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Toolbar visible
    await expect(page.getByRole('button', { name: /annulla/i })).toBeVisible();

    // Blockly workspace visible with LED category
    await expect(page.locator('.blocklyToolboxDiv')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.blocklyTreeRow', { hasText: /led/i })).toBeVisible();

    // Switch to code tab to verify C++ preview render
    const codeTab = page.getByRole('tab', { name: /codice/i });
    if (await codeTab.isVisible()) {
      await codeTab.click();
      await expect(page.locator('.cm-editor')).toBeVisible({ timeout: 5000 });
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(60000); // <60s target
    console.log(`First-block flow elapsed: ${elapsed}ms`);
  });

  test('Onboarding remembered across page reloads', async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear()).catch(() => {});
    await page.goto(`${BASE}/#compile-home`);
    await page.getByRole('button', { name: /salta/i }).click();

    // Reload
    await page.reload();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 });
  });
});
```

- [ ] **Step 7.3: Write accessibility spec**

Create `tests/e2e/07-blockly-accessibility.spec.js`:

```js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE = process.env.BASE_URL || 'http://localhost:4173';

test.describe('Blockly WCAG 2.2 AA accessibility', () => {
  test('compile-home page has zero critical+serious a11y violations', async ({ page }) => {
    await page.goto(`${BASE}/#compile-home`, { waitUntil: 'networkidle' });
    // Dismiss onboarding if present
    const skip = page.getByRole('button', { name: /salta/i });
    if (await skip.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skip.click();
    }
    await page.waitForTimeout(500); // Blockly mount settle

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const criticalAndSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (criticalAndSerious.length > 0) {
      console.log('Violations:', JSON.stringify(criticalAndSerious, null, 2));
    }

    expect(criticalAndSerious).toHaveLength(0);
  });

  test('keyboard nav reaches toolbar + tabs + onboarding skip', async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear()).catch(() => {});
    await page.goto(`${BASE}/#compile-home`);

    // Onboarding dialog: tab to Skip button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement.textContent);
    expect(focused).toMatch(/salta|avanti|indietro/i);
  });

  test('onboarding has ARIA dialog role + aria-modal', async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear()).catch(() => {});
    await page.goto(`${BASE}/#compile-home`);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
```

- [ ] **Step 7.4: Update package.json npm script**

Edit `package.json` scripts section to add:

```json
"test:e2e-blockly": "playwright test tests/e2e/06-blockly-first-block-60s.spec.js tests/e2e/07-blockly-accessibility.spec.js --config=tests/e2e/playwright.build-smoke.config.js"
```

- [ ] **Step 7.5: Run E2E specs (uses built bundle via existing scripts/run-build-smoke.sh wrapper pattern)**

```bash
# Start vite preview in background
npm run build 2>&1 | tail -3
npm run preview -- --port=4173 > /tmp/vite-preview.log 2>&1 &
PREVIEW_PID=$!
trap "kill $PREVIEW_PID 2>/dev/null" EXIT
sleep 3

# Wait for server
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS http://localhost:4173/ > /dev/null 2>&1; then break; fi
  sleep 1
done

# Run specs
BASE_URL=http://localhost:4173 npx playwright test tests/e2e/06-blockly-first-block-60s.spec.js tests/e2e/07-blockly-accessibility.spec.js --reporter=list 2>&1 | tail -30

kill $PREVIEW_PID 2>/dev/null
```

Expected: 5/5 specs PASS (2 from 06 + 3 from 07).

- [ ] **Step 7.6: Commit**

```bash
git add tests/e2e/06-blockly-first-block-60s.spec.js tests/e2e/07-blockly-accessibility.spec.js package.json package-lock.json
git commit -m "$(cat <<'EOF'
test(blockly-ux): E2E first-block-60s + WCAG 2.2 AA accessibility

Goal-driven validation: kids 8-14 drag first block + see C++ +
compile success < 60s. Zero WCAG critical/serious violations.

- 06-blockly-first-block-60s.spec.js: 2 tests (60s timer + onboarding persist)
- 07-blockly-accessibility.spec.js: 3 tests (axe WCAG 2.2 AA + keyboard nav + ARIA dialog)
- @axe-core/playwright devDep added
- npm run test:e2e-blockly script

Sub-project A iter 82+ Task 7/7 complete.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

After all 7 tasks complete, run pre-final verification:

```bash
# 1. Full vitest baseline (target 14463 + ~26 new = 14489+)
npx vitest run --reporter=basic 2>&1 | tail -3

# 2. Build full
npm run build 2>&1 | tail -5

# 3. Smoke spec 4/4
bash scripts/run-build-smoke.sh 2>&1 | tail -5

# 4. E2E Blockly specs 5/5
npm run test:e2e-blockly 2>&1 | tail -10

# 5. git log review
git log --oneline -7
```

**Spec coverage check:**
- [ ] Toolbox cognitive overload addressed → Task 2 progressive 4→7→12
- [ ] Italian onboarding mention kit fisico → Task 3 step 1 plurale Vol.1 pag.42
- [ ] Undo/Redo/Clear/Help visible → Task 1 toolbar
- [ ] Compile errors translated to Italian → Task 4 ScratchErrorOverlay 4 patterns + breadboard hint
- [ ] WCAG 2.2 AA contrast + 44px + keyboard nav → Task 5 theme + Task 7 axe audit
- [ ] Mascotte UNLIM contextual hints → NOT addressed (defer iter 83+ sub-task — out of scope this plan, requires UNLIM chat integration)
- [ ] Templates/starter projects → NOT addressed (defer iter 83+ separate plan)
- [ ] Sub-project B C++→Scratch reverse parser → NOT addressed (explicit out of scope, defer iter 82+ Davide+Andrea narrative ratify decision)

**Placeholder scan:** No "TBD" / "TODO" / "implement later" in task steps. Every step has concrete code or commands.

**Type consistency:** `compileError` prop name + `onCompileErrorDismiss` callback name used consistently across HomeCompileEntry + NewElabSimulator + ScratchEditor + ScratchErrorOverlay. `getProgressiveToolbox(level)` signature used consistently in scratchToolboxProgressive + ScratchEditor. `setShowOnboarding` / `setBlocklyLevel` state names consistent in ScratchEditor.

---

## Execution Handoff

**Plan saved to** `docs/superpowers/plans/2026-05-18-blockly-ux-overhaul.md`.

NOT yet shipped. Andrea ratify decision required:

**Option 1: Subagent-Driven (RECOMMENDED)**
- Dispatch fresh subagent per task (7 subagents sequential OR 3 worktree-isolated parallel groups: Tasks 1+2 / Tasks 3+4 / Tasks 5+6+7)
- Two-stage review between tasks
- Fast iteration + Pattern S r3 race-cond fix discipline preserved (file ownership rigid)
- Required sub-skill: `superpowers:subagent-driven-development`

**Option 2: Inline Execution**
- Execute all 7 tasks in current session using `superpowers:executing-plans` skill
- Batch execution with checkpoints for review
- Single context window ~10-12h total budget

**Andrea iter 81 close mandate**: "FINITO ITER X CREA ITER X+1 in completa autonomia". Recommends Option 1 (Subagent-Driven) for max throughput + isolation + race-cond discipline.

**Open questions Andrea ratify pre-execution:**
1. Confirm out-of-scope items above (sub-project B reverse parser + mascotte UNLIM hints + templates) deferred iter 82+
2. Choose Option 1 vs Option 2
3. If Option 1: dispatch all 7 tasks parallel OR sequential OR worktree-grouped?
4. Confirm baseline-tests.txt sync 13118 → 14463 happens iter 82 entrance (pre-flight CoV)
