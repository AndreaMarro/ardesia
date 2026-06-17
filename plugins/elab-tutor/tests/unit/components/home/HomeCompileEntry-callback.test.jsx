/**
 * tests/unit/components/home/HomeCompileEntry-callback.test.jsx
 *
 * Iter 79.A A1 unit verify — HomeCompileEntry handleScratchCodeChange must
 * store the SECOND argument (generated C++ code) emitted by ScratchEditor
 * onChange(xmlText, generatedCode), NOT the first (Blockly XML).
 *
 * Bug iter 78→79.A: previous handler `(code) => setScratchCode(code || '')`
 * stored xmlText as scratchCode, causing compile API to receive raw
 * `<xml><block.../></xml>` instead of C++ → arduino-cli `Error during build:
 * exit status 1` (empirically reproduced 2026-05-17 via Playwright on
 * /#compile-home).
 *
 * Fix at src/components/home/HomeCompileEntry.jsx:61-63 changes signature
 * to `(_xml, code) => setScratchCode(code || '')`.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Stub ScratchEditor — emits known (xml, code) tuple on mount.
vi.mock('../../../../src/components/simulator/panels/ScratchEditor', () => ({
  default: ({ onChange }) => {
    React.useEffect(() => {
      // Emit canonical two-arg payload matching ScratchEditor real contract.
      onChange?.('<xml><block type="arduino_base"/></xml>', 'void setup(){}\nvoid loop(){}\n');
    }, [onChange]);
    return React.createElement('div', { 'data-testid': 'scratch-editor-stub' });
  },
}));

// Stub ScratchCompileBar — expose received sketchCode prop for assertion.
vi.mock('../../../../src/components/simulator/panels/ScratchCompileBar', () => ({
  default: ({ sketchCode }) => React.createElement('div', {
    'data-testid': 'compile-bar-stub',
    'data-sketch-code': sketchCode || '',
  }),
  ScratchErrorBoundary: ({ children }) => React.createElement(React.Fragment, null, children),
}));

// Stub banners (env-flagged, no behavior under test).
vi.mock('../../../../src/components/HomePage/CompileAgentBanner', () => ({
  default: () => React.createElement('div', { 'data-testid': 'cab' }),
}));
vi.mock('../../../../src/components/HomePage/WebUsbBanner', () => ({
  default: () => React.createElement('div', { 'data-testid': 'wub' }),
}));

// Stub compileCode — assert it never receives XML.
const compileCodeMock = vi.fn().mockResolvedValue({ success: true });
vi.mock('../../../../src/services/api', () => ({
  compileCode: (...args) => compileCodeMock(...args),
}));
vi.mock('../../../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

describe('iter 79.A A1 — HomeCompileEntry callback', () => {
  it('stores generated C++ code (second arg), NOT xmlText (first arg)', async () => {
    const { default: HomeCompileEntry } = await import('../../../../src/components/home/HomeCompileEntry');

    render(React.createElement(HomeCompileEntry, { onBackHome: () => {} }));

    const bar = await screen.findByTestId('compile-bar-stub');
    // Wait one microtask for useEffect onChange to fire + state to flush.
    await new Promise((r) => setTimeout(r, 0));
    const sketchCode = bar.getAttribute('data-sketch-code') || '';

    // POSITIVE: sketchCode is the generated C++.
    expect(sketchCode).toContain('void setup');
    expect(sketchCode).toContain('void loop');

    // NEGATIVE: sketchCode is NOT the Blockly XML (the iter 78 bug class).
    expect(sketchCode).not.toContain('<xml');
    expect(sketchCode).not.toContain('arduino_base');
  });
});
