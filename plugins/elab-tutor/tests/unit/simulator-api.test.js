/**
 * simulator-api.test.js — Test per la Public API del simulatore ELAB
 * Target: registerSimulatorInstance, unregisterSimulatorInstance, emitSimulatorEvent
 * + pub/sub event system + API object creation
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  registerSimulatorInstance,
  unregisterSimulatorInstance,
  emitSimulatorEvent
} from '../../src/services/simulator-api';

// Mock delle dipendenze
vi.mock('../../src/data/experiments-index', () => ({
  findExperimentById: vi.fn((id) => id === 'v1-cap1-esp1' ? { id: 'v1-cap1-esp1', title: 'Test' } : null),
  EXPERIMENTS_VOL1: { experiments: [{ id: 'v1-cap1-esp1', title: 'LED', chapter: 1, difficulty: 1, simulationMode: 'dc', code: null }] },
  EXPERIMENTS_VOL2: { experiments: [{ id: 'v2-cap1-esp1', title: 'Semaforo', chapter: 1, difficulty: 2, simulationMode: 'avr', code: 'void setup(){}' }] },
  EXPERIMENTS_VOL3: { experiments: [] },
}));

vi.mock('../../src/services/api', () => ({
  sendChat: vi.fn(() => Promise.resolve({ message: 'test' })),
  analyzeImage: vi.fn(() => Promise.resolve({ analysis: 'ok' })),
  compileCode: vi.fn(() => Promise.resolve({ hex: 'abc' })),
}));

vi.mock('../../src/utils/whiteboardScreenshot', () => ({
  captureWhiteboardScreenshot: vi.fn(() => Promise.resolve('data:image/png;base64,abc')),
}));

const mockSimulator = {
  loadExperiment: vi.fn(),
  getState: vi.fn(() => ({ running: false })),
  play: vi.fn(),
  pause: vi.fn(),
  reset: vi.fn(),
};

beforeEach(() => {
  delete window.__ELAB_API;
  delete window.__ELAB_EVENTS;
  vi.clearAllMocks();
});

afterEach(() => {
  unregisterSimulatorInstance();
});

// ═══════════════════════════════════════════
// REGISTRATION
// ═══════════════════════════════════════════

describe('registerSimulatorInstance', () => {
  it('creates window.__ELAB_API', () => {
    registerSimulatorInstance(mockSimulator);
    expect(window.__ELAB_API).toBeDefined();
  });

  it('API has version and name', () => {
    registerSimulatorInstance(mockSimulator);
    expect(window.__ELAB_API.version).toBe('1.0.0');
    expect(window.__ELAB_API.name).toBe('ELAB Simulator API');
  });

  it('does not recreate API on double registration (StrictMode)', () => {
    registerSimulatorInstance(mockSimulator);
    const firstAPI = window.__ELAB_API;
    registerSimulatorInstance(mockSimulator);
    expect(window.__ELAB_API).toBe(firstAPI); // same reference
  });

  it('API has getExperimentList', () => {
    registerSimulatorInstance(mockSimulator);
    expect(typeof window.__ELAB_API.getExperimentList).toBe('function');
  });

  it('API has on/off for events', () => {
    registerSimulatorInstance(mockSimulator);
    expect(typeof window.__ELAB_API.on).toBe('function');
    expect(typeof window.__ELAB_API.off).toBe('function');
  });
});

// ═══════════════════════════════════════════
// UNREGISTRATION
// ═══════════════════════════════════════════

describe('unregisterSimulatorInstance', () => {
  it('removes window.__ELAB_API', () => {
    registerSimulatorInstance(mockSimulator);
    expect(window.__ELAB_API).toBeDefined();
    unregisterSimulatorInstance();
    expect(window.__ELAB_API).toBeUndefined();
  });

  it('removes window.__ELAB_EVENTS', () => {
    registerSimulatorInstance(mockSimulator);
    unregisterSimulatorInstance();
    expect(window.__ELAB_EVENTS).toBeUndefined();
  });

  it('double unregister does not throw', () => {
    unregisterSimulatorInstance();
    expect(() => unregisterSimulatorInstance()).not.toThrow();
  });
});

// ═══════════════════════════════════════════
// EXPERIMENT LIST
// ═══════════════════════════════════════════

describe('getExperimentList', () => {
  it('returns experiments grouped by volume', () => {
    registerSimulatorInstance(mockSimulator);
    const list = window.__ELAB_API.getExperimentList();
    expect(list).toHaveProperty('vol1');
    expect(list).toHaveProperty('vol2');
    expect(list).toHaveProperty('vol3');
  });

  it('vol1 has correct experiment data', () => {
    registerSimulatorInstance(mockSimulator);
    const list = window.__ELAB_API.getExperimentList();
    expect(list.vol1.length).toBe(1);
    expect(list.vol1[0].id).toBe('v1-cap1-esp1');
    expect(list.vol1[0].title).toBe('LED');
  });

  it('vol2 experiment has code flag', () => {
    registerSimulatorInstance(mockSimulator);
    const list = window.__ELAB_API.getExperimentList();
    expect(list.vol2[0].hasCode).toBe(true);
  });

  it('vol3 is empty array', () => {
    registerSimulatorInstance(mockSimulator);
    const list = window.__ELAB_API.getExperimentList();
    expect(list.vol3).toEqual([]);
  });
});

// ═══════════════════════════════════════════
// EVENT SYSTEM (PUB/SUB)
// ═══════════════════════════════════════════

describe('emitSimulatorEvent', () => {
  it('emits event that listeners receive', () => {
    registerSimulatorInstance(mockSimulator);
    const callback = vi.fn();
    window.__ELAB_API.on('stateChange', callback);
    emitSimulatorEvent('stateChange', { running: true });
    expect(callback).toHaveBeenCalledWith({ running: true });
  });

  it('multiple listeners receive same event', () => {
    registerSimulatorInstance(mockSimulator);
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    window.__ELAB_API.on('stateChange', cb1);
    window.__ELAB_API.on('stateChange', cb2);
    emitSimulatorEvent('stateChange', { running: false });
    expect(cb1).toHaveBeenCalledOnce();
    expect(cb2).toHaveBeenCalledOnce();
  });

  it('off removes listener', () => {
    registerSimulatorInstance(mockSimulator);
    const callback = vi.fn();
    window.__ELAB_API.on('stateChange', callback);
    window.__ELAB_API.off('stateChange', callback);
    emitSimulatorEvent('stateChange', { running: true });
    expect(callback).not.toHaveBeenCalled();
  });

  it('emitting unknown event does not throw', () => {
    registerSimulatorInstance(mockSimulator);
    expect(() => emitSimulatorEvent('nonExistent', {})).not.toThrow();
  });

  it('emitting without API registered does not throw', () => {
    expect(() => emitSimulatorEvent('stateChange', {})).not.toThrow();
  });

  it('listener for one event does not fire for another', () => {
    registerSimulatorInstance(mockSimulator);
    const callback = vi.fn();
    window.__ELAB_API.on('experimentChange', callback);
    emitSimulatorEvent('stateChange', {});
    expect(callback).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════
// EDGE CASES
// ═══════════════════════════════════════════

describe('edge cases', () => {
  it('register with null instance does not crash', () => {
    expect(() => registerSimulatorInstance(null)).not.toThrow();
    expect(window.__ELAB_API).toBeDefined();
  });

  it('API methods work even if simulator ref is null', () => {
    registerSimulatorInstance(null);
    // getExperimentList uses static data, not simulator ref
    expect(() => window.__ELAB_API.getExperimentList()).not.toThrow();
  });

  it('on with non-function callback does not crash', () => {
    registerSimulatorInstance(mockSimulator);
    expect(() => window.__ELAB_API.on('test', 'not-a-function')).not.toThrow();
  });

  it('off with unregistered callback does not crash', () => {
    registerSimulatorInstance(mockSimulator);
    const neverRegistered = vi.fn();
    expect(() => window.__ELAB_API.off('test', neverRegistered)).not.toThrow();
  });
});
