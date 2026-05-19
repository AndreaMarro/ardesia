/**
 * iter 88 88.UX-2 /clarify — HomeCompileEntry + WebUsbBanner jargon rewrite.
 *
 * Spec: docs/specs/2026-05-18-iter-88-ux-cleanup-cross-compile-spec.md §88.UX-2
 *
 * Negative-assertion suite: forbidden jargon strings MUST NOT appear in
 * user-visible text after rewrite. Critique Nielsen #2 Match real world
 * 2/4 fix — docente non-tech 8-14 anni studenti target.
 *
 * Forbidden strings (iter 87 PHASE 4c critique §6 P0 jargon):
 *   - "Renesas RA4M1"   → replace "Arduino Nano R4 del kit ELAB"
 *   - "ARM Cortex"      → rimuovi totalmente
 *   - "WebUSB"          → replace "Chrome o Edge (su computer, non tablet)"
 *   - "flasha"          → replace "carica"
 *   - "Carica sul kit fisico" (button label preserved iter 80 — NOT tested here,
 *     resides in ScratchCompileBar default; HomeCompileEntry footer rewritten)
 *
 * 5 NEW tests assert NO jargon in footer + WebUsbBanner all 3 states.
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import HomeCompileEntry from '../../../../src/components/home/HomeCompileEntry';
import WebUsbBanner from '../../../../src/components/HomePage/WebUsbBanner';

// Mock CodeMirror — JSDOM cannot mount real CM6.
vi.mock('../../../../src/components/simulator/panels/CodeEditorCM6', () => ({
  default: () => <div data-testid="code-editor-cm6-mock" />,
}));

vi.mock('../../../../src/components/simulator/panels/ScratchEditor', () => ({
  default: () => <div data-testid="scratch-editor-mock">Scratch Editor</div>,
}));

vi.mock('../../../../src/components/simulator/panels/ScratchCompileBar', () => ({
  default: () => <aside data-testid="scratch-compile-bar-mock">Compila</aside>,
  ScratchErrorBoundary: ({ children }) => <>{children}</>,
}));

vi.mock('../../../../src/features/elabBlocks/ui/ModeToggle.jsx', () => ({
  ModeToggle: ({ activeMode }) => (
    <div data-testid="mode-toggle-mock" data-mode={activeMode}>Blocchi / C++</div>
  ),
  MODE_BLOCKS: 'blocks',
  MODE_CODE: 'code',
}));

vi.mock('../../../../src/features/elabBlocks/ui/ElabScratchModeShell.jsx', () => ({
  ElabScratchModeShell: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../../../src/features/elabBlocks/starterTemplates.js', () => ({
  getStarterXml: () => null,
}));

vi.mock('blockly', () => ({
  default: {},
  Xml: { domToWorkspace: () => {} },
  utils: { xml: { textToDom: () => null } },
}));

vi.mock('../../../../src/services/api', () => ({
  compileCode: vi.fn(),
}));

// Stub detectWebUSBCapability so we can drive WebUsbBanner state.
// Provide a non-undefined default so initial render never throws if a test
// forgets to override (defensive — React 19 strict mode double-render).
vi.mock('../../../../src/services/webUsbDetect.js', () => ({
  detectWebUSBCapability: vi.fn(() => ({
    webUsbAvailable: false,
    browser: 'unknown',
    recommendation: '',
  })),
}));
import { detectWebUSBCapability } from '../../../../src/services/webUsbDetect.js';

const FORBIDDEN_JARGON = /Renesas|ARM\s*Cortex|WebUSB|flasha\b/i;

describe('HomeCompileEntry footer — 88.UX-2 /clarify jargon rewrite', () => {
  beforeEach(() => {
    cleanup();
  });

  it('T1 — footer no longer contains forbidden technical jargon', () => {
    const { container } = render(<HomeCompileEntry onBackHome={() => {}} />);
    const footerText = container.querySelector('footer')?.textContent || '';
    expect(footerText.length).toBeGreaterThan(0);
    expect(footerText).not.toMatch(FORBIDDEN_JARGON);
  });

  it('T2 — footer mentions Arduino Nano R4 in friendly language', () => {
    const { container } = render(<HomeCompileEntry onBackHome={() => {}} />);
    const footerText = container.querySelector('footer')?.textContent || '';
    expect(footerText).toMatch(/Arduino Nano R4 del kit ELAB/i);
    expect(footerText).toMatch(/Chrome o Edge/i);
    expect(footerText).toMatch(/computer, non tablet/i);
  });
});

describe('WebUsbBanner — 88.UX-2 /clarify jargon rewrite', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // WebUsbBanner returns null on first render (cap === null) and re-renders
  // after useEffect fires setCap. Use findByTestId (async wait) to handle
  // the React 19 effect timing.
  it('T3 — WebUSB supported state has no jargon in aria-label OR body', async () => {
    detectWebUSBCapability.mockReturnValue({
      webUsbAvailable: true,
      browser: 'chrome',
      recommendation: '',
    });
    render(<WebUsbBanner />);
    const banner = await screen.findByTestId('webusb-banner');
    const aria = banner.getAttribute('aria-label') || '';
    const text = banner.textContent || '';
    expect(aria).not.toMatch(FORBIDDEN_JARGON);
    expect(text).not.toMatch(FORBIDDEN_JARGON);
    expect(aria + text).toMatch(/Nano R4/);
  });

  it('T4 — Safari/Firefox unsupported state no jargon + computer hint', async () => {
    detectWebUSBCapability.mockReturnValue({
      webUsbAvailable: false,
      browser: 'safari',
      recommendation: '',
    });
    render(<WebUsbBanner />);
    const banner = await screen.findByTestId('webusb-banner');
    const aria = banner.getAttribute('aria-label') || '';
    const text = banner.textContent || '';
    expect(aria).not.toMatch(FORBIDDEN_JARGON);
    expect(text).not.toMatch(FORBIDDEN_JARGON);
    expect(text).toMatch(/computer, non tablet/i);
  });

  it('T5 — Unknown browser state no jargon + kit ELAB mention', async () => {
    detectWebUSBCapability.mockReturnValue({
      webUsbAvailable: false,
      browser: 'unknown',
      recommendation: '',
    });
    render(<WebUsbBanner />);
    const banner = await screen.findByTestId('webusb-banner');
    const aria = banner.getAttribute('aria-label') || '';
    const text = banner.textContent || '';
    expect(aria).not.toMatch(FORBIDDEN_JARGON);
    expect(text).not.toMatch(FORBIDDEN_JARGON);
    expect(text).toMatch(/kit ELAB/i);
  });
});
