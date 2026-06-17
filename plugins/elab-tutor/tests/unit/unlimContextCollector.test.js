/**
 * unlimContextCollector.test.js — Test UNLIM context collector functions
 * collectCircuitState, collectEditorCode, collectCompilationErrors,
 * collectBuildStep, collectElapsedTime, collectCompletedExperiments,
 * collectFullContext, logError
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  collectCircuitState,
  collectEditorCode,
  collectCompilationErrors,
  collectBuildStep,
  collectElapsedTime,
  collectCompletedExperiments,
  collectFullContext,
  logError,
} from '../../src/services/unlimContextCollector';

// Mock the logger to prevent console noise
vi.mock('../../src/utils/logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe('unlimContextCollector — collectCircuitState', () => {
  beforeEach(() => {
    delete window.__ELAB_API;
    vi.restoreAllMocks();
  });

  it('returns null when __ELAB_API is not set', () => {
    expect(collectCircuitState()).toBeNull();
  });

  it('returns simulator context when getSimulatorContext exists', () => {
    const mockCtx = { components: ['led1'], wires: [] };
    window.__ELAB_API = { getSimulatorContext: vi.fn(() => mockCtx) };
    expect(collectCircuitState()).toEqual(mockCtx);
  });

  it('falls back to unlim.getCircuitState', () => {
    const mockState = { running: true, components: [] };
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => null),
      unlim: { getCircuitState: vi.fn(() => mockState) },
    };
    expect(collectCircuitState()).toEqual(mockState);
  });

  it('returns null if both methods return null', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => null),
      unlim: { getCircuitState: vi.fn(() => null) },
    };
    expect(collectCircuitState()).toBeNull();
  });

  it('handles thrown errors gracefully', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => { throw new Error('test'); }),
      unlim: { getCircuitState: vi.fn(() => { throw new Error('test2'); }) },
    };
    expect(collectCircuitState()).toBeNull();
  });
});

describe('unlimContextCollector — collectEditorCode', () => {
  beforeEach(() => {
    delete window.__ELAB_API;
  });

  it('returns null when __ELAB_API is not set', () => {
    expect(collectEditorCode()).toBeNull();
  });

  it('returns editor code from getEditorCode', () => {
    window.__ELAB_API = { getEditorCode: vi.fn(() => 'void setup() {}') };
    expect(collectEditorCode()).toBe('void setup() {}');
  });

  it('returns null when getEditorCode returns empty', () => {
    window.__ELAB_API = { getEditorCode: vi.fn(() => '') };
    expect(collectEditorCode()).toBeNull();
  });

  it('returns null when getEditorCode is undefined', () => {
    window.__ELAB_API = {};
    expect(collectEditorCode()).toBeNull();
  });

  it('handles thrown errors gracefully', () => {
    window.__ELAB_API = { getEditorCode: vi.fn(() => { throw new Error('test'); }) };
    expect(collectEditorCode()).toBeNull();
  });
});

describe('unlimContextCollector — collectCompilationErrors', () => {
  beforeEach(() => {
    delete window.__ELAB_API;
  });

  it('returns null when __ELAB_API is not set', () => {
    expect(collectCompilationErrors()).toBeNull();
  });

  it('returns lastCompilation from context', () => {
    const mockCompilation = { success: false, errors: ['undeclared var'] };
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => ({ lastCompilation: mockCompilation })),
    };
    expect(collectCompilationErrors()).toEqual(mockCompilation);
  });

  it('returns null when no lastCompilation in context', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => ({})),
    };
    expect(collectCompilationErrors()).toBeNull();
  });

  it('handles thrown errors gracefully', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => { throw new Error('test'); }),
    };
    expect(collectCompilationErrors()).toBeNull();
  });
});

describe('unlimContextCollector — collectBuildStep', () => {
  beforeEach(() => {
    delete window.__ELAB_API;
  });

  it('returns null when __ELAB_API is not set', () => {
    expect(collectBuildStep()).toBeNull();
  });

  it('returns buildStep from context', () => {
    const mockStep = { current: 3, total: 8, phase: 'wiring' };
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => ({ buildStep: mockStep })),
    };
    expect(collectBuildStep()).toEqual(mockStep);
  });

  it('falls back to getBuildStepIndex', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => ({})),
      getBuildStepIndex: vi.fn(() => 4),
    };
    const result = collectBuildStep();
    expect(result).toEqual({ current: 5, total: null, phase: 'unknown' });
  });

  it('returns null when getBuildStepIndex returns negative', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => ({})),
      getBuildStepIndex: vi.fn(() => -1),
    };
    expect(collectBuildStep()).toBeNull();
  });

  it('handles thrown errors gracefully', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => { throw new Error('test'); }),
      getBuildStepIndex: vi.fn(() => { throw new Error('test2'); }),
    };
    expect(collectBuildStep()).toBeNull();
  });
});

describe('unlimContextCollector — collectElapsedTime', () => {
  beforeEach(() => {
    window.localStorage.getItem.mockReset();
  });

  it('returns null when sessions is empty array', () => {
    window.localStorage.getItem.mockReturnValue('[]');
    expect(collectElapsedTime()).toBeNull();
  });

  it('returns null when sessions is not in storage', () => {
    window.localStorage.getItem.mockReturnValue(null);
    expect(collectElapsedTime()).toBeNull();
  });

  it('returns elapsed seconds for active session', () => {
    const startTime = new Date(Date.now() - 120000).toISOString(); // 2 minutes ago
    window.localStorage.getItem.mockReturnValue(
      JSON.stringify([{ startTime, endTime: null }])
    );
    const result = collectElapsedTime();
    expect(result).toBeGreaterThanOrEqual(119);
    expect(result).toBeLessThanOrEqual(121);
  });

  it('returns null for completed session (has endTime)', () => {
    const startTime = new Date(Date.now() - 120000).toISOString();
    const endTime = new Date().toISOString();
    window.localStorage.getItem.mockReturnValue(
      JSON.stringify([{ startTime, endTime }])
    );
    expect(collectElapsedTime()).toBeNull();
  });

  it('handles invalid JSON gracefully', () => {
    window.localStorage.getItem.mockReturnValue('not-json');
    expect(collectElapsedTime()).toBeNull();
  });
});

describe('unlimContextCollector — collectCompletedExperiments', () => {
  beforeEach(() => {
    window.localStorage.getItem.mockReset();
  });

  it('returns { total: 0, list: [] } when no memory', () => {
    window.localStorage.getItem.mockReturnValue(null);
    expect(collectCompletedExperiments()).toEqual({ total: 0, list: [] });
  });

  it('returns completed experiments from memory', () => {
    const memory = {
      experiments: {
        'v1-cap6-esp1': { completed: true, attempts: 2, lastResult: 'pass' },
        'v1-cap6-esp2': { completed: false, attempts: 1 },
        'v1-cap7-esp1': { completed: true, attempts: 1, lastResult: 'pass' },
      },
    };
    window.localStorage.getItem.mockReturnValue(JSON.stringify(memory));
    const result = collectCompletedExperiments();
    expect(result.total).toBe(2);
    expect(result.list).toHaveLength(2);
    expect(result.list[0].id).toBe('v1-cap6-esp1');
    expect(result.list[0].attempts).toBe(2);
  });

  it('returns { total: 0, list: [] } when experiments is empty', () => {
    window.localStorage.getItem.mockReturnValue(JSON.stringify({ experiments: {} }));
    const result = collectCompletedExperiments();
    expect(result.total).toBe(0);
    expect(result.list).toHaveLength(0);
  });

  it('handles invalid JSON gracefully', () => {
    window.localStorage.getItem.mockReturnValue('not-json');
    expect(collectCompletedExperiments()).toEqual({ total: 0, list: [] });
  });

  it('defaults lastResult to unknown when missing', () => {
    const memory = {
      experiments: {
        'v1-cap6-esp1': { completed: true, attempts: 1 },
      },
    };
    window.localStorage.getItem.mockReturnValue(JSON.stringify(memory));
    const result = collectCompletedExperiments();
    expect(result.list[0].lastResult).toBe('unknown');
  });
});

describe('unlimContextCollector — logError', () => {
  beforeEach(() => {
    window.sessionStorage.getItem.mockReset();
    window.sessionStorage.setItem.mockReset();
  });

  it('stores error in sessionStorage', () => {
    window.sessionStorage.getItem.mockReturnValue('[]');
    logError('compilation', 'undefined variable x');
    expect(window.sessionStorage.setItem).toHaveBeenCalled();
    const callArgs = window.sessionStorage.setItem.mock.calls[0];
    expect(callArgs[0]).toBe('elab_error_history');
    const stored = JSON.parse(callArgs[1]);
    expect(stored).toHaveLength(1);
    expect(stored[0].type).toBe('compilation');
    expect(stored[0].message).toBe('undefined variable x');
    expect(stored[0].ts).toBeDefined();
  });

  it('appends to existing errors', () => {
    const existing = [{ type: 'circuit', message: 'short circuit', ts: 123 }];
    window.sessionStorage.getItem.mockReturnValue(JSON.stringify(existing));
    logError('runtime', 'stack overflow');
    const stored = JSON.parse(window.sessionStorage.setItem.mock.calls[0][1]);
    expect(stored).toHaveLength(2);
  });

  it('caps at 20 entries', () => {
    const existing = Array.from({ length: 20 }, (_, i) => ({ type: 'test', message: `err${i}`, ts: i }));
    window.sessionStorage.getItem.mockReturnValue(JSON.stringify(existing));
    logError('runtime', 'new error');
    const stored = JSON.parse(window.sessionStorage.setItem.mock.calls[0][1]);
    expect(stored.length).toBeLessThanOrEqual(20);
  });

  it('truncates long messages to 200 chars', () => {
    window.sessionStorage.getItem.mockReturnValue('[]');
    const longMsg = 'x'.repeat(500);
    logError('compilation', longMsg);
    const stored = JSON.parse(window.sessionStorage.setItem.mock.calls[0][1]);
    expect(stored[0].message.length).toBeLessThanOrEqual(200);
  });

  it('handles sessionStorage errors gracefully', () => {
    window.sessionStorage.getItem.mockImplementation(() => { throw new Error('quota'); });
    // Should not throw
    expect(() => logError('test', 'msg')).not.toThrow();
  });
});

describe('unlimContextCollector — collectFullContext', () => {
  beforeEach(() => {
    delete window.__ELAB_API;
    window.localStorage.getItem.mockReset();
    window.sessionStorage.getItem.mockReset();
  });

  it('returns an object', () => {
    const ctx = collectFullContext();
    expect(typeof ctx).toBe('object');
  });

  it('includes circuit when API provides context', () => {
    const mockCtx = { components: ['r1'], running: false };
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => mockCtx),
    };
    window.localStorage.getItem.mockReturnValue(null);
    window.sessionStorage.getItem.mockReturnValue('[]');
    const ctx = collectFullContext();
    expect(ctx.circuit).toEqual(mockCtx);
  });

  it('includes editorCode when API provides it', () => {
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => null),
      getEditorCode: vi.fn(() => 'void setup() { }'),
    };
    window.localStorage.getItem.mockReturnValue(null);
    window.sessionStorage.getItem.mockReturnValue('[]');
    const ctx = collectFullContext();
    expect(ctx.editorCode).toBe('void setup() { }');
  });

  it('truncates editorCode longer than 2000 chars', () => {
    const longCode = 'x'.repeat(3000);
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => null),
      getEditorCode: vi.fn(() => longCode),
    };
    window.localStorage.getItem.mockReturnValue(null);
    window.sessionStorage.getItem.mockReturnValue('[]');
    const ctx = collectFullContext();
    expect(ctx.editorCode.length).toBeLessThanOrEqual(2020); // 2000 + suffix
  });

  it('includes recentErrors from sessionStorage', () => {
    window.localStorage.getItem.mockReturnValue(null);
    const errors = [
      { type: 'compilation', message: 'err1', ts: 1 },
      { type: 'runtime', message: 'err2', ts: 2 },
    ];
    window.sessionStorage.getItem.mockReturnValue(JSON.stringify(errors));
    const ctx = collectFullContext();
    expect(ctx.recentErrors).toBeDefined();
    expect(ctx.errorCount).toBe(2);
  });

  it('does not include completedExperiments when total is 0', () => {
    window.localStorage.getItem.mockReturnValue(null);
    window.sessionStorage.getItem.mockReturnValue('[]');
    const ctx = collectFullContext();
    expect(ctx.completedExperiments).toBeUndefined();
  });

  it('includes completedExperiments when there are completed ones', () => {
    const memory = {
      experiments: {
        'v1-cap6-esp1': { completed: true, attempts: 1, lastResult: 'pass' },
      },
    };
    window.localStorage.getItem.mockImplementation(key => {
      if (key === 'elab_unlim_memory') return JSON.stringify(memory);
      return null;
    });
    window.sessionStorage.getItem.mockReturnValue('[]');
    const ctx = collectFullContext();
    expect(ctx.completedExperiments).toBeDefined();
    expect(ctx.completedExperiments.total).toBe(1);
  });
});
