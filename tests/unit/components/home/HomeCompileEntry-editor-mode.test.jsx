/**
 * tests/unit/components/home/HomeCompileEntry-editor-mode.test.jsx
 *
 * iter 85 close integration Sub-project A — verify HomeCompileEntry wires iter 84
 * standalone atoms 6 (StarterButtons + starterTemplates) + 7 (ElabScratchModeShell)
 * + 8 (ModeToggle) into production path via `editorMode` state + localStorage
 * persistence key `elab_editor_mode_preference` (Andrea ratify gruppo 17 voce 2).
 *
 * Anti-regression CRITICAL: editorMode === 'blocks' gate MANDATORY —
 * ElabScratchModeShell NOT mounted in 'code' mode (Blockly-only crash prevention).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import React from 'react';

// Stub child editor components — focus tests purely on tab/mode wiring.
vi.mock('../../../../src/components/simulator/panels/ScratchEditor', () => ({
  default: ({ onChange }) => {
    // Emit canonical onChange tuple post-mount (matching real contract).
    React.useEffect(() => {
      onChange?.('<xml><block type="arduino_base"/></xml>', 'void setup(){}\nvoid loop(){}\n');
    }, [onChange]);
    return React.createElement('div', { 'data-testid': 'scratch-editor-stub' });
  },
}));
vi.mock('../../../../src/components/simulator/panels/ScratchCompileBar', () => ({
  default: ({ sketchCode }) => React.createElement('div', {
    'data-testid': 'compile-bar-stub',
    'data-sketch-code': sketchCode || '',
  }),
  ScratchErrorBoundary: ({ children }) => React.createElement(React.Fragment, null, children),
}));
vi.mock('../../../../src/components/simulator/panels/CodeEditorCM6', () => ({
  default: ({ code }) => React.createElement('div', {
    'data-testid': 'cm6-editor-stub',
    'data-code': code || '',
  }),
}));

// Stub banners (env-flagged).
vi.mock('../../../../src/components/HomePage/CompileAgentBanner', () => ({
  default: () => React.createElement('div', { 'data-testid': 'cab' }),
}));
vi.mock('../../../../src/components/HomePage/WebUsbBanner', () => ({
  default: () => React.createElement('div', { 'data-testid': 'wub' }),
}));

// Stub ElabScratchModeShell — expose props received for assertion.
vi.mock('../../../../src/features/elabBlocks/ui/ElabScratchModeShell.jsx', () => ({
  ElabScratchModeShell: ({ children, workspaceReady, workspaceBlockCount, onStarterClick }) =>
    React.createElement('div', {
      'data-testid': 'elab-scratch-mode-shell',
      'data-workspace-ready': String(workspaceReady),
      'data-block-count': String(workspaceBlockCount),
      'data-has-starter-handler': String(typeof onStarterClick === 'function'),
    }, children),
}));

// Use REAL ModeToggle (iter 84 atom 8 frozen — file ownership rigid).
// Real component provides canonical WAI-ARIA Tab pattern + click handlers.
// Tests assert via data-testid='mode-toggle' wrapper + data-mode='blocks'/'code'
// attributes on the real buttons.

// NO mock for starterTemplates — use REAL atom 6 (file ownership rigid).
// Real getStarterXml resolves 'blink'/'button'/'sensor' to valid XML strings
// and returns null for unknown keys (defensive contract verified atom 6).

// Stub Blockly + compileCode + logger.
vi.mock('blockly', () => ({
  Xml: { domToWorkspace: vi.fn() },
  utils: { xml: { textToDom: vi.fn(() => ({})) } },
}));
vi.mock('../../../../src/services/api', () => ({
  compileCode: vi.fn().mockResolvedValue({ success: true }),
}));
vi.mock('../../../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

const STORAGE_KEY = 'elab_editor_mode_preference';

// Project-wide tests/setup.js mocks window.localStorage with vi.fn() stubs
// that DON'T actually persist (getItem always returns null, setItem is a
// no-op spy). We assert against the spy call history (setItem.mock.calls)
// rather than relying on real persistence.
beforeEach(() => {
  // tests/setup.js global beforeEach already calls vi.clearAllMocks() +
  // localStorageMock.getItem.mockReturnValue(null) — nothing extra needed.
});

// Helper to query the REAL ModeToggle tab buttons by their stable data-mode
// attribute (set inside src/features/elabBlocks/ui/ModeToggle.jsx).
function getRealTabButton(mode) {
  return document.querySelector(`button[data-mode="${mode}"]`);
}

describe('iter 85 close integration Sub-project A — HomeCompileEntry editor mode wiring', () => {
  it('T1: editorMode defaults to "blocks" on first mount (no localStorage saved)', async () => {
    const { default: HomeCompileEntry } = await import('../../../../src/components/home/HomeCompileEntry');

    render(React.createElement(HomeCompileEntry, { onBackHome: () => {} }));

    // Anti-regression CRITICAL: editorMode === 'blocks' → ElabScratchModeShell MUST mount.
    const shell = await screen.findByTestId('elab-scratch-mode-shell');
    expect(shell).toBeTruthy();
    // CM6 (code path) MUST NOT mount when default 'blocks'.
    expect(screen.queryByTestId('cm6-editor-stub')).toBeNull();

    // Real ModeToggle: 'blocks' button has aria-selected=true on default.
    const blocksBtn = getRealTabButton('blocks');
    expect(blocksBtn).toBeTruthy();
    expect(blocksBtn.getAttribute('aria-selected')).toBe('true');

    cleanup();
  });

  it('T2: ModeToggle renders top bar above editor surface', async () => {
    const { default: HomeCompileEntry } = await import('../../../../src/components/home/HomeCompileEntry');

    render(React.createElement(HomeCompileEntry, { onBackHome: () => {} }));

    // Real ModeToggle wraps both buttons in role=tablist with canonical label.
    const tablist = screen.getByRole('tablist', { name: /modalita editor/i });
    expect(tablist).toBeTruthy();
    // Both real tab buttons present.
    expect(getRealTabButton('blocks')).toBeTruthy();
    expect(getRealTabButton('code')).toBeTruthy();
    // Compile bar present (positioned BELOW editor surface — visual integration).
    expect(screen.getByTestId('compile-bar-stub')).toBeTruthy();

    cleanup();
  });

  it('T3: handleModeChange persists preference to localStorage under canonical key', async () => {
    const { default: HomeCompileEntry } = await import('../../../../src/components/home/HomeCompileEntry');

    render(React.createElement(HomeCompileEntry, { onBackHome: () => {} }));

    // Reset spy AFTER initial render (constructor reads getItem once at mount).
    window.localStorage.setItem.mockClear();

    // Click real C++ tab button → handleModeChange → setEditorMode + localStorage.setItem.
    const codeBtn = getRealTabButton('code');
    expect(codeBtn).toBeTruthy();
    expect(codeBtn.disabled).toBe(false);
    await act(async () => {
      fireEvent.click(codeBtn);
    });
    // State propagation verified via aria-selected flip on the real ModeToggle.
    expect(getRealTabButton('code').getAttribute('aria-selected')).toBe('true');
    // localStorage.setItem called with canonical key + 'code' value.
    expect(window.localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'code');

    // Anti-regression: editorMode === 'code' → ElabScratchModeShell NO MOUNT (mandate).
    expect(screen.queryByTestId('elab-scratch-mode-shell')).toBeNull();
    // CM6 mounts in code mode.
    expect(screen.getByTestId('cm6-editor-stub')).toBeTruthy();

    // Toggle back → persists 'blocks'.
    window.localStorage.setItem.mockClear();
    await act(async () => {
      fireEvent.click(getRealTabButton('blocks'));
    });
    expect(window.localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'blocks');
    // ElabScratchModeShell re-mounts.
    expect(screen.getByTestId('elab-scratch-mode-shell')).toBeTruthy();

    cleanup();
  });

  it('T4: ElabScratchModeShell receives starter handler + workspace lifecycle props (guards null workspace gracefully)', async () => {
    const { default: HomeCompileEntry } = await import('../../../../src/components/home/HomeCompileEntry');
    const { getStarterXml } = await import('../../../../src/features/elabBlocks/starterTemplates.js');

    render(React.createElement(HomeCompileEntry, { onBackHome: () => {} }));

    const shell = await screen.findByTestId('elab-scratch-mode-shell');

    // Workspace lifecycle props wired (initial values until ScratchEditor invokes
    // onWorkspaceReady — stubbed editor doesn't call it, so we assert defaults).
    expect(shell.getAttribute('data-workspace-ready')).toBe('false');
    expect(shell.getAttribute('data-block-count')).toBe('0');
    expect(shell.getAttribute('data-has-starter-handler')).toBe('true');

    // Defensive: getStarterXml resolves for known keys + returns null for
    // invalid keys (parent should validate before calling — verified iter 84 atom 6).
    expect(typeof getStarterXml('blink')).toBe('string');
    expect(getStarterXml('blink')).toContain('<xml');
    expect(getStarterXml('button')).toContain('<xml');
    expect(getStarterXml('sensor')).toContain('<xml');
    expect(getStarterXml('unknown-key')).toBeNull();

    cleanup();
  });
});
