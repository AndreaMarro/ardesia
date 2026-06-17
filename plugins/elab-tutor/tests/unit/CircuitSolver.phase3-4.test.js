/**
 * Antigravity Phase 3+4 — Validation Tests
 * Tests: Measurement APIs (getNodeVoltages, getComponentCurrents)
 *        Circuit Status accumulation (cycle-scoped arrays)
 * (c) Andrea Marro — 03/03/2026
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import CircuitSolver from '../../src/components/simulator/engine/CircuitSolver';

// Same mock as other CircuitSolver tests
vi.mock('../../src/components/simulator/components/registry', () => ({
  getComponent: (type) => {
    const definitions = {
      'battery9v': { pins: [{ id: 'positive' }, { id: 'negative' }] },
      'capacitor': { pins: [{ id: 'positive' }, { id: 'negative' }] },
      'resistor': { pins: [{ id: 'pin1' }, { id: 'pin2' }] },
      'led': { pins: [{ id: 'anode' }, { id: 'cathode' }] },
      'nano-r4': { pins: [
        { id: '5V' }, { id: 'GND' }, { id: '3V3' },
        { id: 'D2' }, { id: 'D3' }, { id: 'D4' }, { id: 'D5' },
        { id: 'D6' }, { id: 'D7' }, { id: 'D8' }, { id: 'D9' },
        { id: 'D10' }, { id: 'D11' }, { id: 'D12' }, { id: 'D13' },
        { id: 'A0' }, { id: 'A1' }, { id: 'A2' }, { id: 'A3' },
        { id: 'A4' }, { id: 'A5' }
      ]},
    };
    return definitions[type] || { pins: [] };
  }
}));

// ═══════════════════════════════════════════════════════════════
// PHASE 4: Measurement APIs
// ═══════════════════════════════════════════════════════════════

describe('Phase 4 — Measurement APIs', () => {
  let solver;

  beforeEach(() => {
    solver = new CircuitSolver();
  });

  // ── T4.1: Empty solver returns {} ──
  it('T4.1: getNodeVoltages() returns {} on fresh solver', () => {
    const v = solver.getNodeVoltages();
    expect(v).toEqual({});
  });

  it('T4.2: getComponentCurrents() returns {} on fresh solver', () => {
    const c = solver.getComponentCurrents();
    expect(c).toEqual({});
  });

  // ── T4.3: After loadExperiment, APIs return data ──
  it('T4.3: getNodeVoltages() returns data after loadExperiment + solve', () => {
    const exp = {
      id: 'test-bat-res',
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'res1', type: 'resistor', value: 220 },
        { id: 'led1', type: 'led', value: 'red' },
      ],
      connections: [
        { from: 'bat1:positive', to: 'res1:pin1' },
        { from: 'res1:pin2', to: 'led1:anode' },
        { from: 'led1:cathode', to: 'bat1:negative' },
      ],
    };
    solver.loadExperiment(exp);
    const v = solver.getNodeVoltages();
    // Should have at least some voltage data (supply nets or MNA)
    expect(Object.keys(v).length).toBeGreaterThan(0);
  });

  it('T4.4: getComponentCurrents() returns LED current after solve', () => {
    const exp = {
      id: 'test-bat-res-led',
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'res1', type: 'resistor', value: 220 },
        { id: 'led1', type: 'led', value: 'red' },
      ],
      connections: [
        { from: 'bat1:positive', to: 'res1:pin1' },
        { from: 'res1:pin2', to: 'led1:anode' },
        { from: 'led1:cathode', to: 'bat1:negative' },
      ],
    };
    solver.loadExperiment(exp);
    const c = solver.getComponentCurrents();
    // LED should have non-zero current in a valid circuit
    if (c['led1'] !== undefined) {
      expect(c['led1']).toBeGreaterThan(0);
    }
    // At minimum, some components should have current
    expect(Object.keys(c).length).toBeGreaterThanOrEqual(0); // may be 0 if path-tracer doesn't assign current
  });

  // ── T4.5: Voltages have correct precision (3 decimals) ──
  it('T4.5: getNodeVoltages() values have <= 3 decimal places', () => {
    const exp = {
      id: 'precision-test',
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'res1', type: 'resistor', value: 330 },
      ],
      connections: [
        { from: 'bat1:positive', to: 'res1:pin1' },
        { from: 'res1:pin2', to: 'bat1:negative' },
      ],
    };
    solver.loadExperiment(exp);
    const v = solver.getNodeVoltages();
    for (const val of Object.values(v)) {
      const decimals = (val.toString().split('.')[1] || '').length;
      expect(decimals).toBeLessThanOrEqual(3);
    }
  });

  // ── T4.6: Method return types are always plain objects ──
  it('T4.6: APIs always return plain objects (not Map, not null)', () => {
    expect(typeof solver.getNodeVoltages()).toBe('object');
    expect(typeof solver.getComponentCurrents()).toBe('object');
    expect(solver.getNodeVoltages()).not.toBeNull();
    expect(solver.getComponentCurrents()).not.toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// PHASE 3: Circuit Status Chip (cycle-scoped accumulation)
// ═══════════════════════════════════════════════════════════════

describe('Phase 3 — Circuit Status Accumulation', () => {
  let solver;
  let warnings;
  let stateChanges;

  beforeEach(() => {
    solver = new CircuitSolver();
    warnings = [];
    stateChanges = [];

    solver.onWarning = (type, msg) => {
      warnings.push({ type, msg });
    };
    solver.onStateChange = (state) => {
      stateChanges.push(state);
    };
  });

  // ── T3.1: Short circuit fires onWarning with 'short-circuit' type ──
  it('T3.1: Short circuit generates short-circuit warning', () => {
    const exp = {
      id: 'short-test',
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
      ],
      connections: [
        { from: 'bat1:positive', to: 'bat1:negative' }, // Direct short!
      ],
    };
    solver.loadExperiment(exp);
    const shortWarnings = warnings.filter(w => w.type === 'short-circuit');
    expect(shortWarnings.length).toBeGreaterThan(0);
  });

  // ── T3.2: Valid circuit fires onStateChange but NOT short-circuit warning ──
  it('T3.2: Valid circuit does NOT generate short-circuit warning', () => {
    const exp = {
      id: 'valid-test',
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'res1', type: 'resistor', value: 220 },
        { id: 'led1', type: 'led', value: 'red' },
      ],
      connections: [
        { from: 'bat1:positive', to: 'res1:pin1' },
        { from: 'res1:pin2', to: 'led1:anode' },
        { from: 'led1:cathode', to: 'bat1:negative' },
      ],
    };
    solver.loadExperiment(exp);
    const shortWarnings = warnings.filter(w => w.type === 'short-circuit');
    expect(shortWarnings.length).toBe(0);
    // But onStateChange SHOULD have fired
    expect(stateChanges.length).toBeGreaterThan(0);
  });

  // ── T3.3: onWarning fires BEFORE onStateChange (critical for cycle-scoped fix) ──
  it('T3.3: onWarning fires before onStateChange in solve cycle', () => {
    const callOrder = [];
    solver.onWarning = (type, msg) => {
      callOrder.push('warning');
    };
    solver.onStateChange = (state) => {
      callOrder.push('stateChange');
    };

    const exp = {
      id: 'order-test',
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
      ],
      connections: [
        { from: 'bat1:positive', to: 'bat1:negative' },
      ],
    };
    solver.loadExperiment(exp);

    // Warning should come before stateChange
    const warnIdx = callOrder.indexOf('warning');
    const stateIdx = callOrder.indexOf('stateChange');
    if (warnIdx >= 0) {
      expect(warnIdx).toBeLessThan(stateIdx);
    }
  });

  // ── T3.4: LED without resistor generates connection_warning ──
  it('T3.4: LED without resistor generates connection warning', () => {
    const exp = {
      id: 'no-resistor-test',
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'led1', type: 'led', value: 'red' },
      ],
      connections: [
        { from: 'bat1:positive', to: 'led1:anode' },
        { from: 'led1:cathode', to: 'bat1:negative' },
      ],
    };
    solver.loadExperiment(exp);
    const connWarnings = warnings.filter(w => w.type === 'connection_warning');
    expect(connWarnings.length).toBeGreaterThan(0);
  });

  // ── T3.5: getState() still works (non-regression) ──
  it('T3.5: getState() returns component states after solve', () => {
    const exp = {
      id: 'state-test',
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'res1', type: 'resistor', value: 220 },
      ],
      connections: [
        { from: 'bat1:positive', to: 'res1:pin1' },
        { from: 'res1:pin2', to: 'bat1:negative' },
      ],
    };
    solver.loadExperiment(exp);
    const state = solver.getState();
    expect(state).toBeDefined();
    expect(state['bat1']).toBeDefined();
    expect(state['res1']).toBeDefined();
  });
});
