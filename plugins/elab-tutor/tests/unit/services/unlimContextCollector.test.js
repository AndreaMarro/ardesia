/**
 * unlimContextCollector.test.js — New tests for unlimContextCollector (Sprint T iter 28)
 * NEW FILE — distinct from tests/unit/unlimContextCollector.test.js (already exhaustive)
 *
 * Focuses on: logError edge cases, collectFullContext integration paths,
 * pinStates, circuitDescription, currentExperimentAttempts, hintsUsed,
 * editorMode/editorVisible, buildMode, sessionStorage interaction patterns.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/utils/logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import {
  logError,
  collectCircuitState,
  collectEditorCode,
  collectCompilationErrors,
  collectBuildStep,
  collectCompletedExperiments,
  collectFullContext,
} from '../../../src/services/unlimContextCollector';

beforeEach(() => {
  delete window.__ELAB_API;
  vi.clearAllMocks();
  window.localStorage.getItem.mockReset();
  window.sessionStorage.getItem.mockReset();
  window.sessionStorage.setItem.mockReset();
});

// ─── logError — edge cases ─────────────────────────────────────────────

describe('logError — edge cases', () => {
  it('handles empty string message', () => {
    window.sessionStorage.getItem.mockReturnValue('[]');
    expect(() => logError('type', '')).not.toThrow();
    const stored = JSON.parse(window.sessionStorage.setItem.mock.calls[0][1]);
    expect(stored[0].message).toBe('');
  });

  it('handles numeric message by converting to string', () => {
    window.sessionStorage.getItem.mockReturnValue('[]');
    logError('type', 404);
    const stored = JSON.parse(window.sessionStorage.setItem.mock.calls[0][1]);
    expect(typeof stored[0].message).toBe('string');
  });

  it('handles object message via String()', () => {
    window.sessionStorage.getItem.mockReturnValue('[]');
    logError('type', { code: 42 });
    const stored = JSON.parse(window.sessionStorage.setItem.mock.calls[0][1]);
    expect(typeof stored[0].message).toBe('string');
  });

  it('handles exactly 20 existing entries — evicts oldest', () => {
    const existing = Array.from({ length: 20 }, (_, i) => ({
      type: 'test', message: `old ${i}`, ts: i,
    }));
    window.sessionStorage.getItem.mockReturnValue(JSON.stringify(existing));
    logError('new', 'fresh entry');
    const stored = JSON.parse(window.sessionStorage.setItem.mock.calls[0][1]);
    expect(stored.length).toBe(20);
    expect(stored[stored.length - 1].message).toBe('fresh entry');
  });

  it('handles sessionStorage.setItem throwing', () => {
    window.sessionStorage.getItem.mockReturnValue('[]');
    window.sessionStorage.setItem.mockImplementation(() => { throw new Error('quota'); });
    expect(() => logError('type', 'msg')).not.toThrow();
  });

  it('stores correct error type', () => {
    window.sessionStorage.getItem.mockReturnValue('[]');
    logError('compilation', 'undefined var x');
    const stored = JSON.parse(window.sessionStorage.setItem.mock.calls[0][1]);
    expect(stored[0].type).toBe('compilation');
  });
});

// ─── collectCircuitState — additional paths ────────────────────────────

describe('collectCircuitState — additional paths', () => {
  it('returns null if getSimulatorContext throws and getCircuitState is missing', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => { throw new Error('fail'); }),
    };
    expect(collectCircuitState()).toBeNull();
  });

  it('prefers getSimulatorContext over getCircuitState', () => {
    const primary = { source: 'primary' };
    const fallback = { source: 'fallback' };
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => primary),
      unlim: { getCircuitState: vi.fn(() => fallback) },
    };
    expect(collectCircuitState()).toEqual(primary);
  });
});

// ─── collectEditorCode — additional paths ─────────────────────────────

describe('collectEditorCode — additional paths', () => {
  it('returns code even if very short', () => {
    window.__ELAB_API = { getEditorCode: vi.fn(() => 'x') };
    expect(collectEditorCode()).toBe('x');
  });

  it('returns null if getEditorCode throws', () => {
    window.__ELAB_API = {
      getEditorCode: vi.fn(() => { throw new Error('fail'); }),
    };
    expect(collectEditorCode()).toBeNull();
  });
});

// ─── collectCompilationErrors — additional paths ───────────────────────

describe('collectCompilationErrors — additional paths', () => {
  it('returns null when context has no lastCompilation', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => ({ running: true })),
    };
    expect(collectCompilationErrors()).toBeNull();
  });

  it('returns lastCompilation with errors array', () => {
    const compilation = { success: false, errors: ['undeclared var'] };
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => ({ lastCompilation: compilation })),
    };
    expect(collectCompilationErrors()).toEqual(compilation);
    expect(collectCompilationErrors().errors).toContain('undeclared var');
  });
});

// ─── collectBuildStep — getBuildStepIndex fallback ────────────────────

describe('collectBuildStep — index fallback', () => {
  it('returns index 0 as step 1', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => ({})),
      getBuildStepIndex: vi.fn(() => 0),
    };
    const result = collectBuildStep();
    expect(result.current).toBe(1);
    expect(result.total).toBeNull();
  });

  it('returns index 9 as step 10', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => ({})),
      getBuildStepIndex: vi.fn(() => 9),
    };
    expect(collectBuildStep().current).toBe(10);
  });

  it('returns phase unknown from fallback', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => ({})),
      getBuildStepIndex: vi.fn(() => 2),
    };
    expect(collectBuildStep().phase).toBe('unknown');
  });
});

// ─── collectCompletedExperiments — additional ─────────────────────────

describe('collectCompletedExperiments — additional paths', () => {
  it('ignores experiments with completed=false', () => {
    const memory = {
      experiments: {
        'v1-cap6-esp1': { completed: false, attempts: 1 },
        'v1-cap6-esp2': { completed: true, attempts: 1, lastResult: 'pass' },
      },
    };
    window.localStorage.getItem.mockReturnValue(JSON.stringify(memory));
    const result = collectCompletedExperiments();
    expect(result.total).toBe(1);
    expect(result.list[0].id).toBe('v1-cap6-esp2');
  });

  it('defaults attempts to 1 when missing', () => {
    const memory = {
      experiments: { 'v1-cap6-esp1': { completed: true } },
    };
    window.localStorage.getItem.mockReturnValue(JSON.stringify(memory));
    const result = collectCompletedExperiments();
    expect(result.list[0].attempts).toBe(1);
  });
});

// ─── collectFullContext — extended fields ─────────────────────────────

describe('collectFullContext — extended fields', () => {
  it('includes circuitDescription when not default message', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => null),
      getCircuitDescription: vi.fn(() => 'LED + resistore + batteria 9V'),
    };
    window.localStorage.getItem.mockReturnValue(null);
    window.sessionStorage.getItem.mockReturnValue('[]');
    const ctx = collectFullContext();
    expect(ctx.circuitDescription).toBe('LED + resistore + batteria 9V');
  });

  it('does not include circuitDescription for default message', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => null),
      getCircuitDescription: vi.fn(() => 'Nessun circuito caricato.'),
    };
    window.localStorage.getItem.mockReturnValue(null);
    window.sessionStorage.getItem.mockReturnValue('[]');
    const ctx = collectFullContext();
    expect(ctx.circuitDescription).toBeUndefined();
  });

  it('includes editorMode when API provides it', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => null),
      getEditorMode: vi.fn(() => 'scratch'),
      isEditorVisible: vi.fn(() => true),
    };
    window.localStorage.getItem.mockReturnValue(null);
    window.sessionStorage.getItem.mockReturnValue('[]');
    const ctx = collectFullContext();
    expect(ctx.editorMode).toBe('scratch');
    expect(ctx.editorVisible).toBe(true);
  });

  it('includes editorVisible=false when editor is hidden', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => null),
      getEditorMode: vi.fn(() => 'arduino'),
      isEditorVisible: vi.fn(() => false),
    };
    window.localStorage.getItem.mockReturnValue(null);
    window.sessionStorage.getItem.mockReturnValue('[]');
    const ctx = collectFullContext();
    expect(ctx.editorVisible).toBe(false);
  });

  it('includes buildMode when API provides it', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => null),
      getBuildMode: vi.fn(() => 'passopasso'),
    };
    window.localStorage.getItem.mockReturnValue(null);
    window.sessionStorage.getItem.mockReturnValue('[]');
    const ctx = collectFullContext();
    expect(ctx.buildMode).toBe('passopasso');
  });

  it('includes pinStates when non-empty', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => null),
      getPinStates: vi.fn(() => ({ D13: 5.0, D12: 0.0 })),
    };
    window.localStorage.getItem.mockReturnValue(null);
    window.sessionStorage.getItem.mockReturnValue('[]');
    const ctx = collectFullContext();
    expect(ctx.pinStates).toBeDefined();
    expect(ctx.pinStates.D13).toBe(5.0);
  });

  it('does not include pinStates when empty', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => null),
      getPinStates: vi.fn(() => ({})),
    };
    window.localStorage.getItem.mockReturnValue(null);
    window.sessionStorage.getItem.mockReturnValue('[]');
    const ctx = collectFullContext();
    expect(ctx.pinStates).toBeUndefined();
  });

  it('includes currentExperimentAttempts when experiment is known', () => {
    const memory = {
      experiments: { 'v1-cap6-esp1': { completed: true, attempts: 3, hintsUsed: 2 } },
    };
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => null),
      getCurrentExperimentId: vi.fn(() => 'v1-cap6-esp1'),
    };
    window.localStorage.getItem.mockImplementation(k => {
      if (k === 'elab_unlim_memory') return JSON.stringify(memory);
      return null;
    });
    window.sessionStorage.getItem.mockReturnValue('[]');
    const ctx = collectFullContext();
    expect(ctx.currentExperimentAttempts).toBe(3);
    expect(ctx.currentExperimentHintsUsed).toBe(2);
  });

  it('does not crash when API throws on getCircuitDescription', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => null),
      getCircuitDescription: vi.fn(() => { throw new Error('fail'); }),
    };
    window.localStorage.getItem.mockReturnValue(null);
    window.sessionStorage.getItem.mockReturnValue('[]');
    expect(() => collectFullContext()).not.toThrow();
  });

  it('includes only last 5 recentErrors', () => {
    const errors = Array.from({ length: 8 }, (_, i) => ({
      type: 'runtime', message: `err ${i}`, ts: i,
    }));
    window.localStorage.getItem.mockReturnValue(null);
    window.sessionStorage.getItem.mockReturnValue(JSON.stringify(errors));
    const ctx = collectFullContext();
    expect(ctx.recentErrors).toHaveLength(5);
    expect(ctx.errorCount).toBe(8);
  });
});
