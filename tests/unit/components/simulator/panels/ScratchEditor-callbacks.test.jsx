/**
 * tests/unit/components/simulator/panels/ScratchEditor-callbacks.test.jsx
 *
 * iter 85 close integration Sub-project A — verify ScratchEditor.jsx optional
 * callbacks `onWorkspaceReady` + `onBlockCountChange` (added iter 85 to
 * enable HomeCompileEntry wire-up of ElabScratchModeShell — iter 84 atom 7
 * + StarterButtons iter 84 atom 6).
 *
 * Anti-regression mandate: existing callers without new props MUST work
 * unchanged. Tests T1+T2 exercise NEW callback contract, T3 verifies
 * backward-compat (callbacks omitted = ZERO change in behavior).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import React from 'react';

// Capture all addChangeListener calls so we can synthesize Blockly events
// without booting the real Blockly canvas (Blockly inject requires a real DOM
// canvas, heavy + flaky in jsdom). The mock exposes a minimal workspace API
// matching what ScratchEditor.jsx interacts with.
let lastInjectedWorkspace = null;
const blocklyEventsHistory = [];

vi.mock('blockly', () => {
  const changeListeners = new Set();
  const fakeWorkspace = {
    addChangeListener: vi.fn((fn) => { changeListeners.add(fn); }),
    removeChangeListener: vi.fn((fn) => { changeListeners.delete(fn); }),
    dispose: vi.fn(),
    clear: vi.fn(),
    undoStack_: [],
    redoStack_: [],
    getTopBlocks: vi.fn(() => [{ type: 'arduino_base' }]),
    getAllBlocks: vi.fn(() => []),
    undo: vi.fn(),
    // Allow tests to fire synthesized events.
    __fireEvent: (event) => {
      blocklyEventsHistory.push(event);
      changeListeners.forEach((fn) => fn(event));
    },
    __resetListeners: () => { changeListeners.clear(); },
  };
  return {
    inject: vi.fn(() => {
      lastInjectedWorkspace = fakeWorkspace;
      return fakeWorkspace;
    }),
    Theme: { defineTheme: vi.fn(() => ({})) },
    Themes: { Classic: {} },
    Xml: {
      domToWorkspace: vi.fn(),
      workspaceToDom: vi.fn(() => ({ outerHTML: '<xml></xml>' })),
      domToText: vi.fn(() => '<xml></xml>'),
    },
    utils: {
      xml: { textToDom: vi.fn(() => ({})) },
    },
    Events: { UI: 'ui' },
    svgResize: vi.fn(),
  };
});

// Stub the C++ generator — not under test here.
vi.mock('../../../../../src/components/simulator/panels/scratchGenerator', () => ({
  arduinoGenerator: {},
  generateArduinoCode: vi.fn(() => 'void setup(){}\nvoid loop(){}\n'),
}));

// Stub scratchBlocks side-effect import.
vi.mock('../../../../../src/components/simulator/panels/scratchBlocks', () => ({}));

// Stub the visual overlay components (not relevant to callback contract).
vi.mock('../../../../../src/components/simulator/panels/ScratchOnboarding', () => ({
  default: () => React.createElement('div', { 'data-testid': 'onb-stub' }),
}));
vi.mock('../../../../../src/components/simulator/panels/ScratchToolbar', () => ({
  default: () => React.createElement('div', { 'data-testid': 'tb-stub' }),
}));
vi.mock('../../../../../src/components/simulator/panels/ScratchErrorOverlay', () => ({
  default: () => React.createElement('div', { 'data-testid': 'eo-stub' }),
}));
vi.mock('../../../../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

// Polyfill ResizeObserver for jsdom (Blockly normally uses it via real DOM).
beforeEach(() => {
  lastInjectedWorkspace = null;
  blocklyEventsHistory.length = 0;
  global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
});

describe('iter 85 close integration Sub-project A — ScratchEditor optional callbacks', () => {
  it('T1: invokes onWorkspaceReady once post Blockly mount with workspace ref', async () => {
    const onWorkspaceReady = vi.fn();
    const { default: ScratchEditor } = await import('../../../../../src/components/simulator/panels/ScratchEditor');

    render(React.createElement(ScratchEditor, {
      onChange: () => {},
      onWorkspaceReady,
    }));

    // Flush effects.
    await new Promise((r) => setTimeout(r, 0));

    expect(onWorkspaceReady).toHaveBeenCalledTimes(1);
    expect(onWorkspaceReady).toHaveBeenCalledWith(lastInjectedWorkspace);
    cleanup();
  });

  it('T2: invokes onBlockCountChange on initial mount + on Blockly create/delete/finished_loading events', async () => {
    const onBlockCountChange = vi.fn();
    let topBlocks = [{ type: 'arduino_base' }]; // initial: 1 top block

    const { default: ScratchEditor } = await import('../../../../../src/components/simulator/panels/ScratchEditor');

    render(React.createElement(ScratchEditor, {
      onChange: () => {},
      onBlockCountChange,
    }));

    await new Promise((r) => setTimeout(r, 0));

    // Initial emit (post arduino_base load).
    expect(onBlockCountChange).toHaveBeenCalled();
    // First call argument: getTopBlocks default 1 block.
    expect(onBlockCountChange.mock.calls[0][0]).toBe(1);

    // Drive workspace mock to return more blocks then fire 'create'.
    topBlocks = [{ type: 'arduino_base' }, { type: 'arduino_digital_write' }];
    lastInjectedWorkspace.getTopBlocks.mockReturnValue(topBlocks);
    lastInjectedWorkspace.__fireEvent({ type: 'create' });
    expect(onBlockCountChange).toHaveBeenLastCalledWith(2);

    // Fire 'delete' event.
    topBlocks = [{ type: 'arduino_base' }];
    lastInjectedWorkspace.getTopBlocks.mockReturnValue(topBlocks);
    lastInjectedWorkspace.__fireEvent({ type: 'delete' });
    expect(onBlockCountChange).toHaveBeenLastCalledWith(1);

    // Fire 'finished_loading' event (e.g., starter XML load).
    topBlocks = [{ type: 'arduino_base' }, { type: 'controls_if' }, { type: 'arduino_digital_read' }];
    lastInjectedWorkspace.getTopBlocks.mockReturnValue(topBlocks);
    lastInjectedWorkspace.__fireEvent({ type: 'finished_loading' });
    expect(onBlockCountChange).toHaveBeenLastCalledWith(3);

    // UI event types should NOT trigger emission (anti-noise contract).
    const callsBefore = onBlockCountChange.mock.calls.length;
    lastInjectedWorkspace.__fireEvent({ type: 'ui' });
    expect(onBlockCountChange).toHaveBeenCalledTimes(callsBefore);

    cleanup();
  });

  it('T3: backward-compat — omitting NEW callbacks does NOT throw and existing behavior preserved', async () => {
    const onChange = vi.fn();
    const { default: ScratchEditor } = await import('../../../../../src/components/simulator/panels/ScratchEditor');

    // No onWorkspaceReady, no onBlockCountChange — legacy caller signature.
    expect(() => {
      render(React.createElement(ScratchEditor, { onChange }));
    }).not.toThrow();

    await new Promise((r) => setTimeout(r, 0));

    // onChange (existing prop) STILL fires from Blockly inject (initial XML load).
    expect(onChange).toHaveBeenCalled();

    // Firing events without listeners attached MUST NOT throw.
    expect(() => {
      lastInjectedWorkspace.__fireEvent({ type: 'create' });
      lastInjectedWorkspace.__fireEvent({ type: 'delete' });
    }).not.toThrow();

    cleanup();
  });
});
