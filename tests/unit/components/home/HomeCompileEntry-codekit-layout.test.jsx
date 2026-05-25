/**
 * Sprint B4 — #compile-home Code Kit layout contract.
 *
 * RED first: the compile home must prioritize the blocks/code canvas, keep
 * serial output collapsed behind a portrait tab by default, and expose a
 * fullscreen mode for the editor surface.
 */
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import HomeCompileEntry from '../../../../src/components/home/HomeCompileEntry';

vi.mock('../../../../src/components/simulator/panels/ScratchEditor', () => ({
  default: function MockScratchEditor() {
    return <div data-testid="scratch-editor-mock">Blockly canvas</div>;
  },
}));

vi.mock('../../../../src/components/simulator/panels/CodeEditorCM6', () => ({
  default: function MockCodeEditorCM6() {
    return <div data-testid="code-editor-cm6-mock">C++ canvas</div>;
  },
}));

vi.mock('../../../../src/components/simulator/panels/ScratchCompileBar', () => ({
  default: function MockScratchCompileBar() {
    return <aside data-testid="scratch-compile-bar-mock">Compila</aside>;
  },
  ScratchErrorBoundary: function MockBoundary({ children }) {
    return <>{children}</>;
  },
}));

vi.mock('../../../../src/components/simulator/panels/VirtualSerialMonitor', () => ({
  default: function MockVirtualSerialMonitor() {
    return <section data-testid="virtual-serial-monitor-mock">Serial monitor</section>;
  },
}));

vi.mock('../../../../src/components/HomePage/WebUsbBanner', () => ({
  default: function MockWebUsbBanner({ compact }) {
    return <section data-testid="webusb-banner-mock" data-compact={compact ? 'true' : 'false'}>WebUSB pronto</section>;
  },
}));

vi.mock('../../../../src/components/HomePage/CompileAgentBanner', () => ({
  default: function MockCompileAgentBanner() {
    return <section data-testid="compile-agent-banner-mock">Agent</section>;
  },
}));

vi.mock('../../../../src/features/elabBlocks/ui/ModeToggle.jsx', () => ({
  ModeToggle: function MockModeToggle({ activeMode, onModeChange }) {
    return (
      <div role="tablist" aria-label="Modalita editor" data-testid="mode-toggle-mock">
        <button
          type="button"
          data-mode="blocks"
          role="tab"
          aria-selected={activeMode === 'blocks'}
          onClick={() => onModeChange('blocks')}
        >
          Blocchi
        </button>
        <button
          type="button"
          data-mode="code"
          role="tab"
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
  Xml: { domToWorkspace: vi.fn() },
  utils: { xml: { textToDom: vi.fn(() => ({})) } },
}));

vi.mock('../../../../src/services/api', () => ({
  compileCode: vi.fn(async () => ({ success: true })),
}));

vi.mock('../../../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

describe('HomeCompileEntry — Sprint B4 Code Kit layout', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders a Code Kit workspace shell without the old footer chrome', () => {
    const onBackHome = vi.fn();
    render(<HomeCompileEntry onBackHome={onBackHome} />);

    const root = screen.getByTestId('home-compile-entry');
    expect(root).toHaveAttribute('data-elab-layout', 'codekit-workspace');
    expect(screen.getByTestId('codekit-workspace-main')).toBeInTheDocument();
    expect(screen.getByTestId('webusb-banner-mock')).toHaveAttribute('data-compact', 'true');
    expect(screen.getByRole('button', { name: /torna alla home/i })).toBeInTheDocument();
    expect(screen.queryByText(/Funziona con browser Chrome o Edge/i)).toBeNull();
  });

  it('keeps the virtual serial monitor collapsed behind a portrait tab by default', () => {
    render(<HomeCompileEntry onBackHome={() => {}} />);

    const serialToggle = screen.getByRole('button', {
      name: /apri monitor seriale virtuale/i,
    });
    expect(serialToggle).toHaveAttribute('aria-expanded', 'false');
    expect(serialToggle).toHaveAttribute('data-elab-orientation', 'portrait');
    expect(screen.queryByTestId('virtual-serial-monitor-mock')).toBeNull();

    fireEvent.click(serialToggle);

    expect(serialToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('virtual-serial-monitor-mock')).toBeInTheDocument();
  });

  it('toggles fullscreen mode for the code and blocks editor surface', () => {
    render(<HomeCompileEntry onBackHome={() => {}} />);

    const root = screen.getByTestId('home-compile-entry');
    const fullscreenButton = screen.getByRole('button', {
      name: /apri editor a tutto schermo/i,
    });

    expect(root).toHaveAttribute('data-elab-fullscreen', 'false');

    fireEvent.click(fullscreenButton);

    expect(root).toHaveAttribute('data-elab-fullscreen', 'true');
    expect(screen.getByRole('button', { name: /esci da tutto schermo/i })).toBeInTheDocument();
  });
});
