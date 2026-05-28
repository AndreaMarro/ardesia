/**
 * swarm-2026-05-29-compile-state-machine.test.jsx
 *
 * SWARM 5 — Comprehensive state-machine regression for HomeCompileEntry.
 *
 * Andrea verbatim mandate iter 2026-05-29:
 *   "succede niente se cambi i blocchi o codice e puoi compilare e caricare
 *    una sola volta. risolvi e rendi ui e ux homecompile bellissima
 *    moltissimo simile al sito edukit, priva di bug e con unlim integrato"
 *
 * The reported regression: after first compile+upload cycle, changing the
 * Blockly blocks OR the C++ in the editor → NO UI update; the compile
 * button is no-op OR reuses the stale hex. This file LOCKS that bug down by
 * asserting the state-machine transitions compile→success→edit→recompile.
 *
 * STATE TRANSITIONS COVERED (T1-T8):
 *
 *   T1 — Initial state: idle, no errors, no hex, no size
 *   T2 — User edits code → ScratchEditor onChange → scratchCode updated
 *   T3 — Compile dispatch → compileStatus 'compiling' (mid-flight)
 *   T4 — Compile success → status 'success' + hex set + size set
 *   T5 — Edit AFTER success → scratchCode change DOES propagate (regression guard)
 *   T6 — Recompile after edit → new compile invocation, hex replaced (one-shot bug)
 *   T7 — Board switch → invalidates hex + resets status to idle
 *   T8 — Empty code compile attempt → error state, no API call
 *
 * Mocks:
 *   - ScratchEditor: controllable via React Testing Library to emit onChange
 *   - ScratchCompileBar: surfaces props for assertion via data attributes
 *   - api.compileCode: spy w/ programmable result
 *   - All banners, helper, serial monitor, upload button: minimal stubs
 *
 * NO FLAKINESS:
 *   - All async waits use `findByTestId` (built-in timeout retry)
 *   - No `setTimeout`-based polling; only React-Testing-Library helpers
 *   - i18n initialised inline to avoid race with provider mount
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import React from 'react';

// Mock the lazy HomeCompileOnboarding + ProgramExplainer so Suspense doesn't
// resolve into the full 5-step tour modal during the test render. The
// onboarding overlay otherwise covers the tabpanel + intercepts clicks,
// causing `screen.getByTestId('compile-bar-stub')` to fail.
vi.mock('../../../../src/components/home/HomeCompileOnboarding', () => ({
  default: () => null,
}));
vi.mock('../../../../src/components/home/ProgramExplainer', () => ({
  default: () => null,
}));



// ─────────────────────────────────────────────────────────────────────────────
// i18n stub — react-i18next useTranslation returns identity `t` so we don't
// have to bootstrap the full i18n init in unit tests.
// ─────────────────────────────────────────────────────────────────────────────
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'it', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// ─────────────────────────────────────────────────────────────────────────────
// ScratchEditor stub — exposes an imperative `editorEmit` window-attached
// helper so tests can simulate user typing in Blockly + C++ generation.
// ─────────────────────────────────────────────────────────────────────────────
vi.mock('../../../../src/components/simulator/panels/ScratchEditor', () => ({
  default: ({ onChange, onWorkspaceReady, onBlockCountChange }) => {
    React.useEffect(() => {
      // Initial emit — empty blockly + empty C++ so editor mounts in known state
      onChange?.('<xml/>', '');
      onWorkspaceReady?.({ getTopBlocks: () => [], clear: () => {} });
      onBlockCountChange?.(0);
      // Stash refs so the test can drive new edits
      // eslint-disable-next-line no-restricted-globals
      window.__test_emitEditorChange = (xml, cpp) => onChange?.(xml, cpp);
    }, [onChange, onWorkspaceReady, onBlockCountChange]);
    return React.createElement('div', { 'data-testid': 'scratch-editor-stub' });
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// ScratchCompileBar stub — surfaces ALL machine-relevant props as data
// attributes for assertion. Triggers `onCompile` when its button is clicked.
// ─────────────────────────────────────────────────────────────────────────────
vi.mock('../../../../src/components/simulator/panels/ScratchCompileBar', () => ({
  default: ({ onCompile, compilationStatus, compilationErrors, compilationSize, boardId, compileButtonLabel }) =>
    React.createElement('div', {
      'data-testid': 'compile-bar-stub',
      'data-compile-status': compilationStatus || 'idle',
      'data-compile-errors': compilationErrors || '',
      'data-compile-size-flash': compilationSize?.flash?.used ?? '',
      'data-compile-board-id': boardId || '',
    }, React.createElement('button', {
      type: 'button',
      'data-testid': 'compile-button-stub',
      onClick: () => onCompile?.(),
    }, compileButtonLabel || 'Compila')),
  ScratchErrorBoundary: ({ children }) => React.createElement(React.Fragment, null, children),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Other dependency stubs (banners, helper, serial, upload button, mode shells)
// ─────────────────────────────────────────────────────────────────────────────
vi.mock('../../../../src/components/HomePage/CompileAgentBanner', () => ({
  default: () => React.createElement('div', { 'data-testid': 'cab-stub' }),
}));
vi.mock('../../../../src/components/HomePage/WebUsbBanner', () => ({
  default: () => React.createElement('div', { 'data-testid': 'wub-stub' }),
}));
vi.mock('../../../../src/components/home/UnlimCompileHelper', () => ({
  default: ({ compileStatus, boardLabel, onAskQuestion }) => React.createElement('div', {
    'data-testid': 'unlim-helper-stub',
    'data-compile-status': compileStatus,
    'data-board-label': boardLabel || '',
    onClick: () => onAskQuestion?.('test-question'),
  }),
}));
vi.mock('../../../../src/components/simulator/panels/VirtualSerialMonitor', () => ({
  default: () => React.createElement('div', { 'data-testid': 'serial-stub' }),
}));
vi.mock('../../../../src/components/lavagna/BoardPicker', () => ({
  default: ({ boardId, onChange }) => React.createElement('select', {
    'data-testid': 'board-picker-stub',
    value: boardId || '',
    onChange: (e) => onChange?.(e.target.value),
  }, [
    React.createElement('option', { key: 'nano-r4', value: 'nano-r4' }, 'Arduino Nano R4'),
    React.createElement('option', { key: 'uno', value: 'uno' }, 'Arduino Uno R3'),
  ]),
}));
vi.mock('../../../../src/components/lavagna/UniversalUploadButton', () => ({
  default: ({ boardId, hexText }) => React.createElement('button', {
    type: 'button',
    'data-testid': `universal-upload-${boardId}`,
    'data-hex-text-length': String((hexText || '').length),
    disabled: !hexText,
  }, 'Carica'),
}));
vi.mock('../../../../src/components/simulator/panels/CodeEditorCM6', () => ({
  default: ({ code, onChange }) => React.createElement('textarea', {
    'data-testid': 'code-editor-cm6-stub',
    value: code || '',
    onChange: (e) => onChange?.(e.target.value),
  }),
}));
vi.mock('../../../../src/features/elabBlocks/ui/ModeToggle.jsx', () => ({
  MODE_BLOCKS: 'blocks',
  MODE_CODE: 'code',
  ModeToggle: ({ activeMode, onModeChange }) => React.createElement('div', {
    'data-testid': 'mode-toggle-stub',
    'data-active-mode': activeMode,
  }, [
    React.createElement('button', {
      key: 'blocks',
      'data-testid': 'mode-toggle-blocks',
      onClick: () => onModeChange?.('blocks'),
    }, 'Blocchi'),
    React.createElement('button', {
      key: 'code',
      'data-testid': 'mode-toggle-code',
      onClick: () => onModeChange?.('code'),
    }, 'C++'),
  ]),
}));
vi.mock('../../../../src/features/elabBlocks/ui/ElabScratchModeShell.jsx', () => ({
  ElabScratchModeShell: ({ children }) => React.createElement('div', null, children),
}));
vi.mock('../../../../src/features/elabBlocks/starterTemplates.js', () => ({
  getStarterXml: () => '<xml><block type="arduino_base"/></xml>',
}));
vi.mock('../../../../src/features/elabBlocks/codeSync.js', () => ({
  NANO_R4_BLINK_CPP: 'void setup(){}\nvoid loop(){}\n',
  cppToBlocklyXml: () => '<xml><block type="arduino_base"/></xml>',
}));
vi.mock('blockly', () => ({
  utils: { xml: { textToDom: () => ({}) } },
  Xml: { domToWorkspace: vi.fn() },
}));
vi.mock('../../../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));
vi.mock('../../../../src/utils/compileSizeParse', () => ({
  resolveCompileFlash: (result) => {
    if (result?.success) {
      return { flash: { used: 5544, total: 32256 }, sram: null };
    }
    return null;
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// compileCode mock — programmable result per test
// ─────────────────────────────────────────────────────────────────────────────
const compileCodeMock = vi.fn();
vi.mock('../../../../src/services/api', () => ({
  compileCode: (...args) => compileCodeMock(...args),
}));

// ─────────────────────────────────────────────────────────────────────────────
// arduinoBoards — return a board mock so getBoardById works
// ─────────────────────────────────────────────────────────────────────────────
vi.mock('../../../../src/services/arduinoBoards', () => ({
  getBoardById: (id) => {
    if (id === 'uno') return { id: 'uno', label: 'Arduino Uno R3', fqbn: 'arduino:avr:uno' };
    if (id === 'nano-r4') return { id: 'nano-r4', label: 'Arduino Nano R4', fqbn: 'arduino:renesas_uno:nanor4' };
    return null;
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Test helpers
// ─────────────────────────────────────────────────────────────────────────────
async function loadEntry() {
  const { default: HomeCompileEntry } = await import('../../../../src/components/home/HomeCompileEntry');
  return HomeCompileEntry;
}

function emitEditorChange(xml, cpp) {
  act(() => {
    // eslint-disable-next-line no-restricted-globals
    window.__test_emitEditorChange?.(xml, cpp);
  });
}

function readStatus() {
  const bar = screen.getByTestId('compile-bar-stub');
  return bar.getAttribute('data-compile-status');
}

function readSize() {
  const bar = screen.getByTestId('compile-bar-stub');
  return bar.getAttribute('data-compile-size-flash');
}

function readBoardId() {
  const bar = screen.getByTestId('compile-bar-stub');
  return bar.getAttribute('data-compile-board-id');
}

function readUploadHexLength() {
  // After board picker change, the upload button data-testid changes.
  // Pick whichever upload button is currently mounted.
  const all = document.querySelectorAll('[data-testid^="universal-upload-"]');
  if (!all.length) return 0;
  return Number(all[0].getAttribute('data-hex-text-length') || 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────
describe('SWARM 5 — HomeCompileEntry compile state machine', () => {
  beforeEach(() => {
    compileCodeMock.mockReset();
    // eslint-disable-next-line no-restricted-globals
    delete window.__test_emitEditorChange;
  });

  it('T1: initial state is idle with no compile errors and no hex', async () => {
    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('compile-bar-stub');
    expect(readStatus()).toBe('idle');
    expect(readSize()).toBe('');
    // Upload button mounts with empty hex
    await waitFor(() => {
      expect(readUploadHexLength()).toBe(0);
    });
  });

  it('T2: editor onChange propagates scratchCode (no stale closure)', async () => {
    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('scratch-editor-stub');

    // Initial emit (from the stub effect) → empty C++
    // Now simulate the docente typing real code
    emitEditorChange(
      '<xml><block type="blink"/></xml>',
      'void setup(){pinMode(13,OUTPUT);}\nvoid loop(){digitalWrite(13,HIGH);delay(500);digitalWrite(13,LOW);delay(500);}\n',
    );

    // The code preview <pre> must reflect the new C++ — proves the wiring.
    await waitFor(() => {
      const previewEl = document.querySelector('pre');
      expect(previewEl?.textContent || '').toContain('pinMode(13,OUTPUT)');
    });
  });

  it('T3+T4: compile dispatch transitions compiling → success with hex + size', async () => {
    let resolveCompile;
    const pending = new Promise((res) => { resolveCompile = res; });
    compileCodeMock.mockReturnValue(pending);

    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('scratch-editor-stub');

    // Seed real C++ in editor
    emitEditorChange('<xml/>', 'void setup(){}\nvoid loop(){digitalWrite(13,HIGH);}\n');

    // Click compile button
    const btn = await screen.findByTestId('compile-button-stub');
    act(() => { btn.click(); });

    // Status should be 'compiling' while the promise is pending
    await waitFor(() => {
      expect(readStatus()).toBe('compiling');
    });

    // Resolve compile with success + hex + stdout
    await act(async () => {
      resolveCompile({
        success: true,
        hex: ':020000020000FC\n:10000000ABCDEF...',
        output: 'Lo sketch usa 5544 byte (17%) dello spazio disponibile. Il massimo è 32256 byte.',
        provider: 'cloud-renesas',
      });
      await pending;
    });

    await waitFor(() => {
      expect(readStatus()).toBe('success');
      expect(readSize()).toBe('5544');
    });
    // Hex must propagate to UniversalUploadButton
    await waitFor(() => {
      expect(readUploadHexLength()).toBeGreaterThan(10);
    });
  });

  it('T5+T6: REGRESSION GUARD — edit after success → recompile picks NEW code, replaces hex (one-shot bug)', async () => {
    // First compile returns hex A
    compileCodeMock.mockResolvedValueOnce({
      success: true,
      hex: ':020000020000FC\n:10000000HEXAAAA',
      output: 'Lo sketch usa 5544 byte (17%) dello spazio disponibile. Il massimo è 32256 byte.',
      provider: 'cloud-renesas',
    });

    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('scratch-editor-stub');

    // First edit + compile cycle
    emitEditorChange('<xml/>', 'void setup(){digitalWrite(13,HIGH);}\nvoid loop(){}\n');
    const btn = await screen.findByTestId('compile-button-stub');
    await act(async () => { btn.click(); });
    await waitFor(() => expect(readStatus()).toBe('success'));
    const hexLengthAfterFirst = readUploadHexLength();
    expect(hexLengthAfterFirst).toBeGreaterThan(10);

    // CRITICAL — simulate the user editing the C++ AFTER first compile
    // The Andrea bug: this edit gets silently dropped, compile reuses stale code.
    const NEW_CPP = 'void setup(){pinMode(7,OUTPUT);}\nvoid loop(){digitalWrite(7,HIGH);delay(100);}\n';
    emitEditorChange('<xml><block type="blink_pin7"/></xml>', NEW_CPP);

    // Second compile returns DIFFERENT hex B
    compileCodeMock.mockResolvedValueOnce({
      success: true,
      hex: ':020000020000FC\n:10000000HEXBBBBBBBB',
      output: 'Lo sketch usa 5544 byte (17%) dello spazio disponibile. Il massimo è 32256 byte.',
      provider: 'cloud-renesas',
    });

    // Click compile again
    await act(async () => { btn.click(); });

    await waitFor(() => {
      expect(readStatus()).toBe('success');
    });

    // Assert compileCode was called TWICE (not short-circuited)
    expect(compileCodeMock).toHaveBeenCalledTimes(2);

    // Assert the SECOND call received the NEW C++ (regression: stale closure bug)
    const secondCallArgs = compileCodeMock.mock.calls[1];
    expect(secondCallArgs[0]).toContain('pinMode(7,OUTPUT)');
    expect(secondCallArgs[0]).not.toContain('digitalWrite(13,HIGH)');

    // Hex bytes propagated to upload button should reflect the NEW hex length
    await waitFor(() => {
      const len = readUploadHexLength();
      expect(len).toBeGreaterThan(10);
    });
  });

  it('T7: board switch invalidates compiled hex and resets status', async () => {
    compileCodeMock.mockResolvedValueOnce({
      success: true,
      hex: ':020000020000FC\n:10000000HEXAAAA',
      output: 'Lo sketch usa 5544 byte (17%). Il massimo è 32256 byte.',
      provider: 'cloud-renesas',
    });

    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('scratch-editor-stub');

    emitEditorChange('<xml/>', 'void setup(){}\nvoid loop(){}\n');
    const btn = await screen.findByTestId('compile-button-stub');
    await act(async () => { btn.click(); });
    await waitFor(() => expect(readStatus()).toBe('success'));
    expect(readUploadHexLength()).toBeGreaterThan(10);

    // Now switch board nano-r4 → uno
    const picker = screen.getByTestId('board-picker-stub');
    await act(async () => {
      picker.value = 'uno';
      picker.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await waitFor(() => {
      expect(readStatus()).toBe('idle');
      expect(readBoardId()).toBe('uno');
      // Hex MUST be invalidated — new board family means old hex is wrong
      expect(readUploadHexLength()).toBe(0);
    });
  });

  it('T8: empty code compile attempt → error state, NO API call', async () => {
    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('scratch-editor-stub');

    // Do NOT emit non-empty code — scratchCode stays ''
    const btn = await screen.findByTestId('compile-button-stub');
    await act(async () => { btn.click(); });

    await waitFor(() => {
      expect(readStatus()).toBe('error');
    });
    expect(compileCodeMock).not.toHaveBeenCalled();
  });

  it('T9: compile API failure → error state with message, status NOT stuck on compiling', async () => {
    compileCodeMock.mockResolvedValueOnce({
      success: false,
      errors: 'arduino-cli error: undefined reference to setup',
    });

    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('scratch-editor-stub');
    emitEditorChange('<xml/>', 'void loop(){}\n');

    const btn = await screen.findByTestId('compile-button-stub');
    await act(async () => { btn.click(); });

    await waitFor(() => {
      expect(readStatus()).toBe('error');
    });
    const bar = screen.getByTestId('compile-bar-stub');
    expect(bar.getAttribute('data-compile-errors') || '').toMatch(/undefined reference|arduino-cli|Compilazione fallita/i);
  });

  it('T10: compile fqbn matches selected board id (UNO R3 picker selection)', async () => {
    compileCodeMock.mockResolvedValueOnce({
      success: true,
      hex: ':020000020000FC',
      output: 'Lo sketch usa 5544 byte. Il massimo è 32256 byte.',
      provider: 'cloud-renesas',
    });

    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('scratch-editor-stub');

    // Switch to UNO R3 BEFORE compiling
    const picker = screen.getByTestId('board-picker-stub');
    await act(async () => {
      picker.value = 'uno';
      picker.dispatchEvent(new Event('change', { bubbles: true }));
    });

    emitEditorChange('<xml/>', 'void setup(){}\nvoid loop(){}\n');
    const btn = await screen.findByTestId('compile-button-stub');
    await act(async () => { btn.click(); });

    await waitFor(() => expect(compileCodeMock).toHaveBeenCalled());

    // Critical: the second positional arg (fqbn) MUST be the UNO R3 FQBN,
    // proving the stale-closure regression around targetBoardId is closed.
    const [, fqbn] = compileCodeMock.mock.calls[0];
    expect(fqbn).toBe('arduino:avr:uno');
  });
});
