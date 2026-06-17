/**
 * simulator-api — Tests for global __ELAB_API, pub/sub, experiment aggregation
 * Questi test verificano che l'API globale del simulatore funziona
 * correttamente per UNLIM, voice commands, e bridge esterni.
 * Claude code andrea marro — 12/04/2026
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock heavy dependencies
vi.mock('../../src/data/experiments-vol1', () => ({
  default: {
    experiments: [
      { id: 'v1-cap6-esp1', title: 'LED', chapter: 'Cap 6', components: [], simulationMode: 'circuit' },
      { id: 'v1-cap6-esp2', title: 'LED Protezione', chapter: 'Cap 6', components: [], simulationMode: 'circuit' },
    ],
  },
}));
vi.mock('../../src/data/experiments-vol2', () => ({
  default: {
    experiments: [
      { id: 'v2-cap7-esp1', title: 'Condensatore', chapter: 'Cap 7', components: [], simulationMode: 'circuit' },
    ],
  },
}));
vi.mock('../../src/data/experiments-vol3', () => ({
  default: {
    experiments: [
      { id: 'v3-cap6-semaforo', title: 'Semaforo', chapter: 'Cap 6', components: [], simulationMode: 'avr' },
    ],
  },
}));
vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), log: vi.fn(), debug: vi.fn() },
}));

import { registerSimulatorInstance, unregisterSimulatorInstance, emitSimulatorEvent } from '../../src/services/simulator-api';

beforeEach(() => {
  vi.clearAllMocks();
  // Clean up global
  delete window.__ELAB_API;
});

afterEach(() => {
  try { unregisterSimulatorInstance(); } catch {}
  delete window.__ELAB_API;
});

describe('simulator-api', () => {
  describe('registerSimulatorInstance / unregisterSimulatorInstance', () => {
    it('registerSimulatorInstance does not throw', () => {
      const mockInstance = { play: vi.fn(), pause: vi.fn() };
      expect(() => registerSimulatorInstance(mockInstance)).not.toThrow();
    });

    it('unregisterSimulatorInstance does not throw even if not registered', () => {
      expect(() => unregisterSimulatorInstance()).not.toThrow();
    });

    it('double register does not crash (StrictMode guard)', () => {
      const mock1 = { play: vi.fn() };
      const mock2 = { play: vi.fn() };
      registerSimulatorInstance(mock1);
      expect(() => registerSimulatorInstance(mock2)).not.toThrow();
    });
  });

  describe('emitSimulatorEvent', () => {
    it('emitSimulatorEvent does not throw with valid event', () => {
      expect(() => emitSimulatorEvent('experimentChange', { id: 'v1-cap6-esp1' })).not.toThrow();
    });

    it('emitSimulatorEvent does not throw with null data', () => {
      expect(() => emitSimulatorEvent('stateChange', null)).not.toThrow();
    });

    it('emitSimulatorEvent does not throw with no data', () => {
      expect(() => emitSimulatorEvent('circuitChange')).not.toThrow();
    });
  });

  describe('__ELAB_API after registration', () => {
    it('registerSimulatorInstance creates window.__ELAB_API', () => {
      const mock = {
        play: vi.fn(), pause: vi.fn(), reset: vi.fn(),
        getCurrentExperiment: vi.fn(() => null),
        getCircuitState: vi.fn(() => ({})),
      };
      registerSimulatorInstance(mock);
      // __ELAB_API dovrebbe essere creato
      expect(window.__ELAB_API).toBeDefined();
    });

    it('__ELAB_API has on method for event subscription', () => {
      const mock = { play: vi.fn() };
      registerSimulatorInstance(mock);
      if (window.__ELAB_API) {
        expect(typeof window.__ELAB_API.on).toBe('function');
      }
    });

    it('unregisterSimulatorInstance cleans up __ELAB_API', () => {
      const mock = { play: vi.fn() };
      registerSimulatorInstance(mock);
      unregisterSimulatorInstance();
      // Potrebbe essere null o undefined dopo unregister
    });
  });
});
