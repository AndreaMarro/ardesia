/**
 * iter 88 88.UX-1 /distill — HomeCompileEntry compact CodeEditorCM6 surface.
 *
 * Spec: docs/specs/2026-05-18-iter-88-ux-cleanup-cross-compile-spec.md §88.UX-1
 *
 * Goal: 5 elementi visibili max first-render Home compile page. CodeEditorCM6
 * `compact` prop hides decorative title + A-/13/A+ font zoom toolbar. Status
 * row preserved (role="status" aria-live) for accessibility.
 *
 * 6 NEW tests:
 *   T1 — no "Editor Codice" decorative label when compact (default mount C++ tab)
 *   T2 — no "A-" font zoom button when compact
 *   T3 — no "A+" font zoom button when compact
 *   T4 — status "Pronto" still rendered + accessible (role="status")
 *   T5 — Blocchi tab default → CodeEditorCM6 NOT mounted → no compact-only chrome
 *   T6 — switching to C++ tab mounts compact editor (no Editor Codice header)
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import HomeCompileEntry from '../../../../src/components/home/HomeCompileEntry';

// Mock CodeMirror 6 — the real editor requires browser-only APIs (DOM
// measurements + RAF) that JSDOM cannot satisfy. We stub to render a
// recognisable marker so we can assert mount/unmount + props pass-through.
vi.mock('../../../../src/components/simulator/panels/CodeEditorCM6', () => ({
  default: function MockCodeEditorCM6(props) {
    // Render minimal stub mirroring distill-relevant chrome conditionally.
    return (
      <div data-testid="code-editor-cm6-mock" data-compact={String(!!props.compact)}>
        {!props.compact && (
          <>
            <span data-testid="ce-title">{props.title || 'Editor Codice'}</span>
            <button data-testid="ce-font-decrease">A-</button>
            <button data-testid="ce-font-increase">A+</button>
          </>
        )}
        <span role="status" aria-live="polite" data-testid="ce-status">
          Pronto
        </span>
      </div>
    );
  },
}));

// Mock ScratchEditor — Blockly mount fails in JSDOM. Stub renders only an
// identifier marker so we can assert Blockly path doesn't mount CodeEditorCM6.
vi.mock('../../../../src/components/simulator/panels/ScratchEditor', () => ({
  default: function MockScratchEditor() {
    return <div data-testid="scratch-editor-mock">Scratch Editor Mock</div>;
  },
}));

// Mock ScratchCompileBar — aside shows compile button + status + KB.
vi.mock('../../../../src/components/simulator/panels/ScratchCompileBar', () => ({
  default: function MockScratchCompileBar() {
    return <aside data-testid="scratch-compile-bar-mock">Compila</aside>;
  },
  ScratchErrorBoundary: function MockBoundary({ children }) {
    return <>{children}</>;
  },
}));

// Mock WebUsbBanner — top banner indicating WebUSB readiness.
vi.mock('../../../../src/components/HomePage/WebUsbBanner', () => ({
  default: function MockWebUsbBanner() {
    return <section data-testid="webusb-banner-mock">WebUSB Banner</section>;
  },
}));

// Mock CompileAgentBanner — fallback when VITE_USE_LOCAL_AGENT=true.
vi.mock('../../../../src/components/HomePage/CompileAgentBanner', () => ({
  default: function MockCompileAgentBanner() {
    return <section data-testid="compile-agent-banner-mock">Agent Banner</section>;
  },
}));

// Mock ModeToggle — Blocchi / C++ tab control.
vi.mock('../../../../src/features/elabBlocks/ui/ModeToggle.jsx', () => ({
  ModeToggle: function MockModeToggle({ activeMode, onModeChange }) {
    return (
      <div data-testid="mode-toggle-mock">
        <button
          data-testid="mode-blocks"
          aria-selected={activeMode === 'blocks'}
          onClick={() => onModeChange('blocks')}
        >
          Blocchi
        </button>
        <button
          data-testid="mode-code"
          aria-selected={activeMode === 'code'}
          onClick={() => onModeChange('code')}
        >
          C++
        </button>
      </div>
    );
  },
  MODE_BLOCKS: 'blocks',
  MODE_CODE: 'code',
}));

vi.mock('../../../../src/features/elabBlocks/ui/ElabScratchModeShell.jsx', () => ({
  ElabScratchModeShell: function MockShell({ children }) {
    return <div data-testid="elab-scratch-mode-shell-mock">{children}</div>;
  },
}));

vi.mock('../../../../src/features/elabBlocks/starterTemplates.js', () => ({
  getStarterXml: () => null,
}));

vi.mock('blockly', () => ({
  default: { Xml: { domToWorkspace: () => {} }, utils: { xml: { textToDom: () => null } } },
  Xml: { domToWorkspace: () => {} },
  utils: { xml: { textToDom: () => null } },
}));

vi.mock('../../../../src/services/api', () => ({
  compileCode: vi.fn(async () => ({ success: true, hex: ':1040000000', warnings: null })),
}));

/**
 * Helper — mount HomeCompileEntry then click "C++" tab so CodeEditorCM6 mounts.
 * localStorage init across tests is unreliable (vitest jsdom may reset between
 * tests), so we force the mode switch via fireEvent which is deterministic.
 */
function mountInCodeMode() {
  render(<HomeCompileEntry onBackHome={() => {}} />);
  fireEvent.click(screen.getByTestId('mode-code'));
}

describe('HomeCompileEntry — 88.UX-1 /distill compact CodeEditorCM6', () => {
  beforeEach(() => {
    cleanup();
    try {
      window.localStorage.clear();
    } catch (_) { /* defensive */ }
  });

  it('T1 — no "Editor Codice" decorative label when compact', () => {
    mountInCodeMode();
    expect(screen.getByTestId('code-editor-cm6-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('ce-title')).toBeNull();
  });

  it('T2 — no "A-" font zoom decrease button when compact', () => {
    mountInCodeMode();
    expect(screen.queryByTestId('ce-font-decrease')).toBeNull();
  });

  it('T3 — no "A+" font zoom increase button when compact', () => {
    mountInCodeMode();
    expect(screen.queryByTestId('ce-font-increase')).toBeNull();
  });

  it('T4 — status "Pronto" still rendered + accessible (role=status)', () => {
    mountInCodeMode();
    const statusEl = screen.getByTestId('ce-status');
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveAttribute('role', 'status');
    expect(statusEl).toHaveAttribute('aria-live', 'polite');
    expect(statusEl).toHaveTextContent('Pronto');
  });

  it('T5 — Blocchi tab default → CodeEditorCM6 NOT mounted', () => {
    render(<HomeCompileEntry onBackHome={() => {}} />);
    // Default mount (no mode switch) should NOT instantiate CodeEditorCM6.
    expect(screen.queryByTestId('code-editor-cm6-mock')).toBeNull();
    expect(screen.getByTestId('scratch-editor-mock')).toBeInTheDocument();
  });

  it('T6 — switching to C++ tab mounts CodeEditorCM6 with compact=true', () => {
    render(<HomeCompileEntry onBackHome={() => {}} />);
    expect(screen.queryByTestId('code-editor-cm6-mock')).toBeNull();
    fireEvent.click(screen.getByTestId('mode-code'));
    const editor = screen.getByTestId('code-editor-cm6-mock');
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute('data-compact', 'true');
    expect(screen.queryByTestId('ce-title')).toBeNull();
    expect(screen.queryByTestId('ce-font-decrease')).toBeNull();
    expect(screen.queryByTestId('ce-font-increase')).toBeNull();
  });
});
