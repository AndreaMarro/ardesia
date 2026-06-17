/**
 * tests/unit/components/home/HomeCompileEntry-tabs.test.jsx
 *
 * iter 80.A2 — IDE-1 close (Codex Pattern V iter 79 HIGH).
 * iter 85 close integration Sub-project A — selector update: inline tab
 * buttons (data-testid="home-compile-tab-{blocks,code}") REPLACED by
 * iter 84 atom 8 ModeToggle (data-mode="{blocks,code}"). Same WAI-ARIA
 * Tab pattern + same compile flow + same default Blink seed — selector
 * surface updated, semantics preserved. Documents canonical migration
 * path inline tabs → ModeToggle.
 *
 * Verifica tab "Blocchi" / "Codice C++" (or "C++") su HomeCompileEntry:
 *   - default editorMode='blocks' → ScratchEditor mounted, CodeEditorCM6 NOT
 *   - click "C++" → CodeEditorCM6 mounted, ScratchEditor NOT
 *   - editorMode='code' + compile click → handleCompile receives cppCode
 *   - ARIA tab semantics (role/aria-selected/tablist)
 *   - default cppCode seeded Blink "pinMode(13, OUTPUT)"
 *
 * Mandate Andrea iter 79 PM verbatim: HomePage copy line 112 promises
 * "scrivete codice Arduino con i blocchi Blockly oppure direttamente in
 * C++" — fix-PRINCIPIO-ZERO con tab UI dedicato.
 *
 * Mock surface intenzionalmente minimo (3 stub: ScratchEditor +
 * CodeEditorCM6 + ScratchCompileBar + 2 banner + compileCode + logger).
 * Anti-regression iter 79.A: callback.test continua a PASS — qui
 * verifichiamo SOLO il nuovo comportamento tab.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import React from 'react';

// Stub ScratchEditor — visibile solo quando blocks attivo. NON emette
// onChange spontaneamente qui (T1 vuole assertare presenza, non callback).
vi.mock('../../../../src/components/simulator/panels/ScratchEditor', () => ({
  default: () => React.createElement('div', {
    'data-testid': 'scratch-editor-stub',
  }, 'Scratch Editor Stub'),
}));

// Stub CodeEditorCM6 — espone props ricevute via data-attrs per assertion.
// Espone anche un trigger di onChange per testare wiring (NON usato in T1
// ma utile per debugging futuro).
vi.mock('../../../../src/components/simulator/panels/CodeEditorCM6', () => ({
  default: ({ code, onChange, readOnly }) => React.createElement('div', {
    'data-testid': 'code-editor-cm6-stub',
    'data-code': code || '',
    'data-readonly': String(readOnly === true),
    'data-has-onchange': typeof onChange === 'function' ? 'true' : 'false',
  }, 'CodeEditorCM6 Stub'),
}));

// Stub ScratchCompileBar — espone sketchCode prop ricevuto + cattura
// onCompile callback per T3 trigger.
vi.mock('../../../../src/components/simulator/panels/ScratchCompileBar', () => ({
  default: ({ sketchCode, onCompile, compilationStatus, compilationSize }) => React.createElement('button', {
    'data-testid': 'compile-bar-stub',
    'data-sketch-code': sketchCode || '',
    'data-compilation-status': compilationStatus || '',
    'data-compilation-size': compilationSize ? JSON.stringify(compilationSize) : '',
    onClick: onCompile,
    type: 'button',
  }, 'Compila Stub'),
  ScratchErrorBoundary: ({ children }) => React.createElement(React.Fragment, null, children),
}));

// Stub banners (env-flagged, non interessano lo scope tab).
vi.mock('../../../../src/components/HomePage/CompileAgentBanner', () => ({
  default: () => React.createElement('div', { 'data-testid': 'cab' }),
}));
vi.mock('../../../../src/components/HomePage/WebUsbBanner', () => ({
  default: () => React.createElement('div', { 'data-testid': 'wub' }),
}));

// Spy compileCode per T3 — assertion: code passato = cppCode quando
// editorMode='code', NON scratchCode.
const compileCodeMock = vi.fn().mockResolvedValue({ success: true });
vi.mock('../../../../src/services/api', () => ({
  compileCode: (...args) => compileCodeMock(...args),
}));
vi.mock('../../../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

// iter 85 selector helper — real iter 84 ModeToggle exposes data-mode
// attribute on each tab button. Replaces previous getByTestId('home-compile-tab-*')
// which targeted inline tab buttons removed during iter 85 ModeToggle wire-up.
function getModeTabByName(mode) {
  return document.querySelector(`button[data-mode="${mode}"]`);
}

describe('iter 80.A2 — HomeCompileEntry tab Blocchi/Codice C++', () => {
  beforeEach(() => {
    compileCodeMock.mockClear();
  });

  // -----------------------------------------------------------------
  // T1 — default editorMode 'blocks' → ScratchEditor presente, CM6 no.
  // -----------------------------------------------------------------
  it('T1: default mode "blocks" mounts ScratchEditor and NOT CodeEditorCM6', async () => {
    cleanup();
    const { default: HomeCompileEntry } = await import('../../../../src/components/home/HomeCompileEntry');
    render(React.createElement(HomeCompileEntry, { onBackHome: () => {} }));

    expect(screen.queryByTestId('scratch-editor-stub')).not.toBeNull();
    expect(screen.queryByTestId('code-editor-cm6-stub')).toBeNull();
  });

  // -----------------------------------------------------------------
  // T2 — click "Codice C++" → CodeEditorCM6 mounted, ScratchEditor no.
  // -----------------------------------------------------------------
  it('T2: clicking "Codice C++" tab mounts CodeEditorCM6 and unmounts ScratchEditor', async () => {
    cleanup();
    const { default: HomeCompileEntry } = await import('../../../../src/components/home/HomeCompileEntry');
    render(React.createElement(HomeCompileEntry, { onBackHome: () => {} }));

    const codeTab = getModeTabByName('code');
    fireEvent.click(codeTab);

    expect(screen.queryByTestId('code-editor-cm6-stub')).not.toBeNull();
    expect(screen.queryByTestId('scratch-editor-stub')).toBeNull();
  });

  // -----------------------------------------------------------------
  // T3 — editorMode='code' + compile click → compileCode riceve cppCode.
  // -----------------------------------------------------------------
  it('T3: compile in "code" mode passes cppCode (NOT scratchCode) to compileCode', async () => {
    cleanup();
    const { default: HomeCompileEntry } = await import('../../../../src/components/home/HomeCompileEntry');
    render(React.createElement(HomeCompileEntry, { onBackHome: () => {} }));

    // Switch a code mode.
    fireEvent.click(getModeTabByName('code'));

    // iter 81 81.A6 fix (close BG agent A2 caveat #1): wrap async compile
    // click + microtask wait inside `act()` so React batches the state
    // updates from setCompileStatus/setCompileSize/etc within the assertion
    // window. Prevents the "An update to HomeCompileEntry inside a test was
    // not wrapped in act(...)" stderr warning the BG agent flagged cosmetic.
    await act(async () => {
      fireEvent.click(screen.getByTestId('compile-bar-stub'));
      // Microtask tick lets the awaited compileCodeMock resolve and the
      // subsequent state setters run before assertion.
      await new Promise((r) => setTimeout(r, 0));
    });

    // compileCode chiamato con cppCode default Blink (NON stringa vuota
    // di scratchCode iniziale). Verify firma + contenuto.
    expect(compileCodeMock).toHaveBeenCalledTimes(1);
    const [codeArg, fqbnArg] = compileCodeMock.mock.calls[0];
    expect(codeArg).toContain('pinMode(13, OUTPUT)');
    expect(codeArg).toContain('digitalWrite(13, HIGH)');
    expect(codeArg).not.toBe(''); // NOT empty scratchCode
    expect(fqbnArg).toBe('arduino:renesas_uno:nanor4');
  });

  // -----------------------------------------------------------------
  // T4 — ARIA tab semantics (role + aria-selected runtime).
  // -----------------------------------------------------------------
  it('T4: tab buttons have role="tab" and aria-selected reflects active tab', async () => {
    cleanup();
    const { default: HomeCompileEntry } = await import('../../../../src/components/home/HomeCompileEntry');
    render(React.createElement(HomeCompileEntry, { onBackHome: () => {} }));

    const blocksTab = getModeTabByName('blocks');
    const codeTab = getModeTabByName('code');

    expect(blocksTab.getAttribute('role')).toBe('tab');
    expect(codeTab.getAttribute('role')).toBe('tab');

    // Default 'blocks' attivo.
    expect(blocksTab.getAttribute('aria-selected')).toBe('true');
    expect(codeTab.getAttribute('aria-selected')).toBe('false');

    // Switch + verify aria flips.
    fireEvent.click(codeTab);
    expect(blocksTab.getAttribute('aria-selected')).toBe('false');
    expect(codeTab.getAttribute('aria-selected')).toBe('true');

    // tablist container presente.
    const tablist = blocksTab.closest('[role="tablist"]');
    expect(tablist).not.toBeNull();
  });

  // -----------------------------------------------------------------
  // T5 — default cppCode seeded con Blink Vol3 Cap.6 Esp.1 starter.
  // -----------------------------------------------------------------
  it('T5: default cppCode contains "pinMode(13, OUTPUT)" Blink starter', async () => {
    cleanup();
    const { default: HomeCompileEntry } = await import('../../../../src/components/home/HomeCompileEntry');
    render(React.createElement(HomeCompileEntry, { onBackHome: () => {} }));

    // Switch a code mode per esporre il seed a CM6.
    fireEvent.click(getModeTabByName('code'));

    const cm6 = screen.getByTestId('code-editor-cm6-stub');
    const code = cm6.getAttribute('data-code') || '';

    // iter 104 C1 (commit 117ee30a) extracted NANO_R4_BLINK_CPP seed to
    // src/features/elabBlocks/codeSync.js as bare C++ (no Vol reference
    // comment). Vol3 Cap.6 Esp.1 lineage documented in HomeCompileEntry.jsx
    // line 156 source comment ("Default seeded Blink Vol3 Cap.6 Esp.1 sketch")
    // but NOT embedded in the runtime sketch text — that is intentional, the
    // C++ seed must remain compilable as-is by arduino-cli. PRINCIPIO ZERO
    // Vol reference belongs in surrounding UI copy (banner/onboarding), not
    // in the user-editable sketch. Test sync 2026-05-25 PR #166 base merge:
    // assert Blink shape only.
    expect(code).toContain('pinMode(13, OUTPUT)');
    expect(code).toContain('digitalWrite(13, HIGH)');
    expect(code).toContain('delay(1000)');
    expect(cm6.getAttribute('data-readonly')).toBe('false');
    expect(cm6.getAttribute('data-has-onchange')).toBe('true');
  });

  // -----------------------------------------------------------------
  // T6 — fallback AVR/n8n success is syntax verification, NOT Nano R4 success.
  // -----------------------------------------------------------------
  it('T6: legacy n8n provider does not set success status or fake Nano R4 size', async () => {
    cleanup();
    compileCodeMock.mockResolvedValueOnce({
      success: true,
      provider: 'n8n-avr-legacy',
      hex: ':100000000C945C000C946E000C946E000C946E00',
      output: 'AVR compile ok',
    });
    const { default: HomeCompileEntry } = await import('../../../../src/components/home/HomeCompileEntry');
    render(React.createElement(HomeCompileEntry, { onBackHome: () => {} }));

    fireEvent.click(getModeTabByName('code'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('compile-bar-stub'));
      await new Promise((r) => setTimeout(r, 0));
    });

    const bar = screen.getByTestId('compile-bar-stub');
    expect(bar.getAttribute('data-compilation-status')).toBe('verified-legacy');
    expect(bar.getAttribute('data-compilation-size')).toBe('');
  });

  // -----------------------------------------------------------------
  // T7 — legacy verification must not leave static upload instructions visible.
  // -----------------------------------------------------------------
  it('T7: legacy n8n provider replaces static upload copy with honest no-kit copy', async () => {
    cleanup();
    compileCodeMock.mockResolvedValueOnce({
      success: true,
      provider: 'n8n-avr-legacy',
      hex: ':100000000C945C000C946E000C946E000C946E00',
      output: 'AVR compile ok',
    });
    const { default: HomeCompileEntry } = await import('../../../../src/components/home/HomeCompileEntry');
    const { container } = render(React.createElement(HomeCompileEntry, { onBackHome: () => {} }));

    fireEvent.click(getModeTabByName('code'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('compile-bar-stub'));
      await new Promise((r) => setTimeout(r, 0));
    });

    // iter-99 commit a7cd406e "rendi Compila onesta sul fallback legacy" +
    // iter 104 C3 commit 5fe1df5c UnlimCompileHelper rewrite shipped honest
    // verified-legacy copy in TWO places:
    //   - UnlimCompileHelper.jsx line 56 speech bubble: "Codice verificato,
    //     ma non ancora per Nano R4." (UNSTUBBED — rendered by helper child)
    //   - ScratchCompileBar.jsx line 140 status: "Codice verificato —
    //     compilatore Nano R4 non ancora attivo" (STUBBED in this test, so
    //     not asserted on container.textContent).
    // Test sync 2026-05-25 PR #166 base merge: assert UnlimCompileHelper honest
    // copy is present + retain anti-regression negatives (static upload copy
    // strings must NOT appear — these never existed in source but guard a
    // future regression where someone re-adds them).
    expect(container.textContent).toContain('Codice verificato, ma non ancora per Nano R4');
    expect(container.textContent).not.toContain('Carica sul kit Arduino');
    expect(container.textContent).not.toContain('Ora potete caricare il programma');
  });
});
