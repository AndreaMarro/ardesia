/**
 * swarm-2026-05-29-unlim-chat-context.test.jsx
 *
 * SWARM 5 — UNLIM chat panel receives the correct compile + board context.
 *
 * Andrea mandate iter 2026-05-29:
 *   "unlim integrato con chat e interfacciamento totale" — UNLIM must be
 *   aware of editor state, compile status, selected board, block count, and
 *   the active sketch code, otherwise its suggestions are decoupled from
 *   what the docente sees on screen.
 *
 * The right-column UnlimCompileHelper component is the canonical UNLIM
 * surface on the compile-home route. It must:
 *   1. Receive `compileStatus` reflecting the live state machine
 *   2. Receive `boardLabel` reflecting the BoardPicker selection (NOT
 *      hardcoded "Nano R4" — Andrea regression #178-186)
 *   3. Receive `editorMode` so its quick-questions can suggest C++ or Blocchi
 *      specific actions
 *   4. Receive `sketchCode` so it can advise on the current code (not stale)
 *   5. Receive `blockCount` for Blockly empty-state nudges
 *   6. Forward `onAskQuestion` to a chat handler (Lavagna seed today,
 *      future inline UNLIM chat per Swarm 3 V2 plan)
 *
 * Each prop is asserted via a stub UnlimCompileHelper that pins its
 * received props to data attributes for inspection.
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



vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'it', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Capture container — collects every prop the helper receives across renders.
// Tests assert against the LAST snapshot.
// ─────────────────────────────────────────────────────────────────────────────
const capturedHelperProps = { last: null, history: [] };

vi.mock('../../../../src/components/home/UnlimCompileHelper', () => ({
  default: (props) => {
    capturedHelperProps.last = props;
    capturedHelperProps.history.push({ ...props });
    return React.createElement('section', {
      'data-testid': 'unlim-helper-spy',
      'data-compile-status': props.compileStatus || '',
      'data-board-label': props.boardLabel || '',
      'data-editor-mode': props.editorMode || '',
      'data-block-count': String(props.blockCount ?? ''),
      'data-sketch-code-length': String((props.sketchCode || '').length),
      'data-has-handler': String(typeof props.onAskQuestion === 'function'),
    }, React.createElement('button', {
      type: 'button',
      'data-testid': 'helper-ask-btn',
      onClick: () => props.onAskQuestion?.('Leggi il programma'),
    }, 'Chiedi a UNLIM'));
  },
}));

// ScratchEditor stub — drives editor state to test consumer awareness
vi.mock('../../../../src/components/simulator/panels/ScratchEditor', () => ({
  default: ({ onChange, onWorkspaceReady, onBlockCountChange }) => {
    React.useEffect(() => {
      onChange?.('<xml/>', '');
      onWorkspaceReady?.({});
      onBlockCountChange?.(0);
      // eslint-disable-next-line no-restricted-globals
      window.__test_emit_editor = (xml, cpp) => onChange?.(xml, cpp);
      // eslint-disable-next-line no-restricted-globals
      window.__test_emit_block_count = (n) => onBlockCountChange?.(n);
    }, [onChange, onWorkspaceReady, onBlockCountChange]);
    return React.createElement('div', { 'data-testid': 'scratch-editor-stub' });
  },
}));

// Stub the rest minimally
vi.mock('../../../../src/components/simulator/panels/ScratchCompileBar', () => ({
  default: ({ onCompile, compilationStatus }) => React.createElement('div', {
    'data-testid': 'compile-bar-stub',
    'data-compile-status': compilationStatus || 'idle',
  }, React.createElement('button', {
    type: 'button',
    'data-testid': 'compile-button-stub',
    onClick: () => onCompile?.(),
  }, 'Compila')),
  ScratchErrorBoundary: ({ children }) => React.createElement(React.Fragment, null, children),
}));
vi.mock('../../../../src/components/HomePage/CompileAgentBanner', () => ({
  default: () => React.createElement('div'),
}));
vi.mock('../../../../src/components/HomePage/WebUsbBanner', () => ({
  default: () => React.createElement('div'),
}));
vi.mock('../../../../src/components/simulator/panels/VirtualSerialMonitor', () => ({
  default: () => React.createElement('div'),
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
  default: () => React.createElement('button', { 'data-testid': 'upload-stub' }, 'Carica'),
}));
vi.mock('../../../../src/components/simulator/panels/CodeEditorCM6', () => ({
  default: ({ code, onChange }) => React.createElement('textarea', {
    'data-testid': 'cm6-stub',
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
      'data-testid': 'mode-blocks-btn',
      onClick: () => onModeChange?.('blocks'),
    }, 'Blocchi'),
    React.createElement('button', {
      key: 'code',
      'data-testid': 'mode-code-btn',
      onClick: () => onModeChange?.('code'),
    }, 'C++'),
  ]),
}));
vi.mock('../../../../src/features/elabBlocks/ui/ElabScratchModeShell.jsx', () => ({
  ElabScratchModeShell: ({ children }) => React.createElement('div', null, children),
}));
vi.mock('../../../../src/features/elabBlocks/starterTemplates.js', () => ({
  getStarterXml: () => '<xml/>',
}));
vi.mock('../../../../src/features/elabBlocks/codeSync.js', () => ({
  NANO_R4_BLINK_CPP: 'void setup(){}\nvoid loop(){}\n',
  cppToBlocklyXml: () => '<xml/>',
}));
vi.mock('blockly', () => ({
  utils: { xml: { textToDom: () => ({}) } },
  Xml: { domToWorkspace: vi.fn() },
}));
vi.mock('../../../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));
vi.mock('../../../../src/utils/compileSizeParse', () => ({
  resolveCompileFlash: () => ({ flash: { used: 5544, total: 32256 }, sram: null }),
}));

const compileCodeMock = vi.fn();
vi.mock('../../../../src/services/api', () => ({
  compileCode: (...args) => compileCodeMock(...args),
}));
vi.mock('../../../../src/services/arduinoBoards', () => ({
  getBoardById: (id) => {
    if (id === 'uno') return { id: 'uno', label: 'Arduino Uno R3', fqbn: 'arduino:avr:uno' };
    if (id === 'nano-r4') return { id: 'nano-r4', label: 'Arduino Nano R4', fqbn: 'arduino:renesas_uno:nanor4' };
    return null;
  },
}));

async function loadEntry() {
  const { default: HomeCompileEntry } = await import('../../../../src/components/home/HomeCompileEntry');
  return HomeCompileEntry;
}

function emitEditor(xml, cpp) {
  act(() => {
    // eslint-disable-next-line no-restricted-globals
    window.__test_emit_editor?.(xml, cpp);
  });
}

function emitBlockCount(n) {
  act(() => {
    // eslint-disable-next-line no-restricted-globals
    window.__test_emit_block_count?.(n);
  });
}

describe('SWARM 5 — UNLIM chat context (HomeCompileEntry → UnlimCompileHelper)', () => {
  beforeEach(() => {
    capturedHelperProps.last = null;
    capturedHelperProps.history = [];
    compileCodeMock.mockReset();
    // eslint-disable-next-line no-restricted-globals
    delete window.__test_emit_editor;
    // eslint-disable-next-line no-restricted-globals
    delete window.__test_emit_block_count;
  });

  it('initial mount passes idle status + Nano R4 default board label', async () => {
    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));

    await screen.findByTestId('unlim-helper-spy');
    expect(capturedHelperProps.last?.compileStatus).toBe('idle');
    expect(capturedHelperProps.last?.boardLabel).toBe('Arduino Nano R4');
    expect(capturedHelperProps.last?.editorMode).toBe('blocks');
    expect(typeof capturedHelperProps.last?.onAskQuestion).toBe('function');
  });

  it('compileStatus prop propagates through compile lifecycle', async () => {
    let resolveCompile;
    const pending = new Promise((res) => { resolveCompile = res; });
    compileCodeMock.mockReturnValue(pending);

    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('unlim-helper-spy');

    emitEditor('<xml/>', 'void setup(){}\nvoid loop(){}\n');
    const btn = await screen.findByTestId('compile-button-stub');
    act(() => { btn.click(); });

    await waitFor(() => {
      expect(capturedHelperProps.last?.compileStatus).toBe('compiling');
    });

    await act(async () => {
      resolveCompile({
        success: true,
        hex: ':020000020000FC',
        output: 'Lo sketch usa 5544 byte. Il massimo è 32256 byte.',
        provider: 'cloud-renesas',
      });
      await pending;
    });

    await waitFor(() => {
      expect(capturedHelperProps.last?.compileStatus).toBe('success');
    });
  });

  it('boardLabel prop reflects BoardPicker selection (regression #178-186)', async () => {
    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('unlim-helper-spy');

    // Switch to UNO R3
    const picker = screen.getByTestId('board-picker-stub');
    await act(async () => {
      picker.value = 'uno';
      picker.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await waitFor(() => {
      expect(capturedHelperProps.last?.boardLabel).toBe('Arduino Uno R3');
    });
  });

  it('sketchCode prop reflects the live editor content (not stale)', async () => {
    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('unlim-helper-spy');

    const REAL_CPP = 'void setup(){pinMode(13,OUTPUT);}\nvoid loop(){digitalWrite(13,HIGH);delay(500);digitalWrite(13,LOW);delay(500);}\n';
    emitEditor('<xml><block type="blink"/></xml>', REAL_CPP);

    await waitFor(() => {
      expect((capturedHelperProps.last?.sketchCode || '').length).toBe(REAL_CPP.length);
    });
    expect(capturedHelperProps.last?.sketchCode).toContain('pinMode(13,OUTPUT)');
  });

  it('blockCount prop propagates from ScratchEditor onBlockCountChange', async () => {
    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('unlim-helper-spy');

    emitBlockCount(7);

    await waitFor(() => {
      expect(capturedHelperProps.last?.blockCount).toBe(7);
    });
  });

  it('editorMode prop flips when ModeToggle switches blocks → code', async () => {
    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('unlim-helper-spy');

    // Initially 'blocks'
    expect(capturedHelperProps.last?.editorMode).toBe('blocks');

    const codeBtn = screen.getByTestId('mode-code-btn');
    await act(async () => { codeBtn.click(); });

    await waitFor(() => {
      expect(capturedHelperProps.last?.editorMode).toBe('code');
    });
  });

  it('onAskQuestion handler forwards the question to the chat seed', async () => {
    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('unlim-helper-spy');

    // The Helper stub renders a button that calls onAskQuestion('Leggi il programma')
    const askBtn = screen.getByTestId('helper-ask-btn');
    act(() => { askBtn.click(); });

    // The handler in HomeCompileEntry writes to localStorage 'elab-unlim-seed'
    // jsdom-mocked localStorage in setup.js uses a vi.fn setter — assert it
    // was called with the question.
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'elab-unlim-seed',
      'Leggi il programma',
    );
  });

  it('helper receives consistent props snapshot — no stale renders', async () => {
    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('unlim-helper-spy');

    // Drive several state changes in sequence
    emitEditor('<xml/>', 'void setup(){}\n');
    emitBlockCount(3);
    const picker = screen.getByTestId('board-picker-stub');
    await act(async () => {
      picker.value = 'uno';
      picker.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await waitFor(() => {
      const last = capturedHelperProps.last;
      // All these MUST be true simultaneously in the latest render
      expect(last?.boardLabel).toBe('Arduino Uno R3');
      expect(last?.blockCount).toBe(3);
      expect((last?.sketchCode || '').length).toBeGreaterThan(0);
    });

    // History MUST be monotonic — none of the renders should regress board
    // label back to 'Arduino Nano R4' after the switch (proves no race).
    const renderAfterSwitch = capturedHelperProps.history.findIndex(
      (s) => s.boardLabel === 'Arduino Uno R3',
    );
    expect(renderAfterSwitch).toBeGreaterThan(0);
    for (let i = renderAfterSwitch; i < capturedHelperProps.history.length; i++) {
      expect(capturedHelperProps.history[i].boardLabel).toBe('Arduino Uno R3');
    }
  });
});
