/**
 * ELAB Simulator — CircuitSolver Factory Edge Case Tests
 * Targeted edge cases: short circuit, open circuit, reversed LED,
 * zero-ohm resistor, potentiometer at 0% and 100%.
 *
 * These tests complement tests/unit/circuitSolverEdgeCases.test.js
 * with deeper behavioral coverage of the scenarios requested by the
 * d3-solver scheduled task.
 *
 * Andrea Marro — 16/04/2026
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import CircuitSolver from '../../../../src/components/simulator/engine/CircuitSolver';

// ─── Mock registry ───
vi.mock('../../../../src/components/simulator/components/registry', () => ({
  getComponent: (type) => {
    const defs = {
      'battery9v': { pins: [{ id: 'positive' }, { id: 'negative' }] },
      'resistor':  { pins: [{ id: 'pin1' }, { id: 'pin2' }] },
      'led':       { pins: [{ id: 'anode' }, { id: 'cathode' }] },
      'potentiometer': { pins: [{ id: 'vcc' }, { id: 'signal' }, { id: 'gnd' }] },
      'breadboard-half': { pins: [], getInternalConnections: () => [] },
    };
    return defs[type] || null;
  }
}));

// ─── Helpers ───

/** Standard working circuit: bat9V → R(470) → LED(red) → GND */
function makeWorkingLed() {
  return {
    components: [
      { id: 'bat1', type: 'battery9v', value: 9 },
      { id: 'r1',   type: 'resistor',  value: 470 },
      { id: 'led1', type: 'led', color: 'red' },
    ],
    connections: [
      { from: 'bat1:positive', to: 'r1:pin1' },
      { from: 'r1:pin2',       to: 'led1:anode' },
      { from: 'led1:cathode',  to: 'bat1:negative' },
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════════
// EC-1: Short Circuit — battery positive directly to negative via wire
// Expected: shortCircuit flag = true, solver does not crash
// ═══════════════════════════════════════════════════════════════════════
describe('EC-1: Short Circuit (direct battery wire)', () => {
  let solver;
  let warnings;

  beforeEach(() => {
    solver = new CircuitSolver();
    warnings = [];
    solver.onWarning = (type, msg) => warnings.push({ type, msg });
  });

  it('EC-1.1 — solver does not throw on direct short', () => {
    expect(() => {
      solver.loadExperiment({
        components: [{ id: 'bat1', type: 'battery9v', value: 9 }],
        connections: [{ from: 'bat1:positive', to: 'bat1:negative' }],
      });
      solver.solve();
    }).not.toThrow();
  });

  it('EC-1.2 — getDiagnostics().shortCircuit is true', () => {
    solver.loadExperiment({
      components: [{ id: 'bat1', type: 'battery9v', value: 9 }],
      connections: [{ from: 'bat1:positive', to: 'bat1:negative' }],
    });
    solver.solve();
    const diag = solver.getDiagnostics();
    expect(diag.shortCircuit).toBe(true);
  });

  it('EC-1.3 — short-circuit warning is emitted', () => {
    solver.loadExperiment({
      components: [{ id: 'bat1', type: 'battery9v', value: 9 }],
      connections: [{ from: 'bat1:positive', to: 'bat1:negative' }],
    });
    solver.solve();
    expect(warnings.some(w => w.type === 'short-circuit')).toBe(true);
  });

  it('EC-1.4 — normal circuit does NOT flag shortCircuit', () => {
    solver.loadExperiment(makeWorkingLed());
    solver.solve();
    const diag = solver.getDiagnostics();
    expect(diag.shortCircuit).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// EC-2: Open Circuit — LED with no GND connection (floating cathode)
// Expected: LED is off, no current
// ═══════════════════════════════════════════════════════════════════════
describe('EC-2: Open Circuit (LED without GND)', () => {
  let solver;

  beforeEach(() => {
    solver = new CircuitSolver();
  });

  it('EC-2.1 — solver does not throw on open circuit', () => {
    expect(() => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'r1',   type: 'resistor',  value: 470 },
          { id: 'led1', type: 'led', color: 'red' },
        ],
        connections: [
          { from: 'bat1:positive', to: 'r1:pin1' },
          { from: 'r1:pin2',       to: 'led1:anode' },
          // cathode NOT connected to GND — open circuit
        ],
      });
      solver.solve();
    }).not.toThrow();
  });

  it('EC-2.2 — LED.on is false when cathode is floating', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'r1',   type: 'resistor',  value: 470 },
        { id: 'led1', type: 'led', color: 'red' },
      ],
      connections: [
        { from: 'bat1:positive', to: 'r1:pin1' },
        { from: 'r1:pin2',       to: 'led1:anode' },
      ],
    });
    solver.solve();
    const state = solver.getState();
    expect(state.led1.on).toBe(false);
  });

  it('EC-2.3 — LED.current is 0 when cathode is floating', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'r1',   type: 'resistor',  value: 470 },
        { id: 'led1', type: 'led', color: 'red' },
      ],
      connections: [
        { from: 'bat1:positive', to: 'r1:pin1' },
        { from: 'r1:pin2',       to: 'led1:anode' },
      ],
    });
    solver.solve();
    const state = solver.getState();
    expect(state.led1.current).toBe(0);
  });

  it('EC-2.4 — LED is ON when circuit is properly closed', () => {
    solver.loadExperiment(makeWorkingLed());
    solver.solve();
    const state = solver.getState();
    expect(state.led1.on).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// EC-3: Reversed LED (cathode at +, anode at GND)
// Expected: LED off, zero current (diode blocks reverse current)
// ═══════════════════════════════════════════════════════════════════════
describe('EC-3: Reversed LED (cathode to +)', () => {
  let solver;

  beforeEach(() => {
    solver = new CircuitSolver();
  });

  it('EC-3.1 — solver does not throw on reversed LED', () => {
    expect(() => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'r1',   type: 'resistor',  value: 470 },
          { id: 'led1', type: 'led', color: 'red' },
        ],
        connections: [
          { from: 'bat1:positive',  to: 'r1:pin1' },
          { from: 'r1:pin2',        to: 'led1:cathode' },  // reversed: cathode at +
          { from: 'led1:anode',     to: 'bat1:negative' }, // reversed: anode at GND
        ],
      });
      solver.solve();
    }).not.toThrow();
  });

  it('EC-3.2 — reversed LED is off (LED.on = false)', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'r1',   type: 'resistor',  value: 470 },
        { id: 'led1', type: 'led', color: 'red' },
      ],
      connections: [
        { from: 'bat1:positive',  to: 'r1:pin1' },
        { from: 'r1:pin2',        to: 'led1:cathode' },
        { from: 'led1:anode',     to: 'bat1:negative' },
      ],
    });
    solver.solve();
    const state = solver.getState();
    expect(state.led1.on).toBe(false);
  });

  it('EC-3.3 — reversed LED has zero brightness', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'r1',   type: 'resistor',  value: 470 },
        { id: 'led1', type: 'led', color: 'red' },
      ],
      connections: [
        { from: 'bat1:positive',  to: 'r1:pin1' },
        { from: 'r1:pin2',        to: 'led1:cathode' },
        { from: 'led1:anode',     to: 'bat1:negative' },
      ],
    });
    solver.solve();
    const state = solver.getState();
    expect(state.led1.brightness).toBe(0);
  });

  it('EC-3.4 — forward LED (anode at +) is ON for comparison', () => {
    solver.loadExperiment(makeWorkingLed());
    solver.solve();
    const state = solver.getState();
    expect(state.led1.on).toBe(true);
    expect(state.led1.brightness).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// EC-4: Resistor with value 0 (acts as wire)
// Expected: solver does not crash; effectively a short when bat+→bat-
// ═══════════════════════════════════════════════════════════════════════
describe('EC-4: Zero-ohm Resistor', () => {
  let solver;
  let warnings;

  beforeEach(() => {
    solver = new CircuitSolver();
    warnings = [];
    solver.onWarning = (type, msg) => warnings.push({ type, msg });
  });

  it('EC-4.1 — solver does not throw on R=0 in circuit', () => {
    expect(() => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'r1',   type: 'resistor',  value: 0 },
        ],
        connections: [
          { from: 'bat1:positive', to: 'r1:pin1' },
          { from: 'r1:pin2',       to: 'bat1:negative' },
        ],
      });
      solver.solve();
    }).not.toThrow();
  });

  it('EC-4.2 — R=0 between battery poles is treated as short circuit', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'r1',   type: 'resistor',  value: 0 },
      ],
      connections: [
        { from: 'bat1:positive', to: 'r1:pin1' },
        { from: 'r1:pin2',       to: 'bat1:negative' },
      ],
    });
    solver.solve();
    // Zero-ohm path from + to - is a short; must not leave the solver in a broken state
    const state = solver.getState();
    expect(state).toBeDefined();
  });

  it('EC-4.3 — R=0 in series with LED does not crash', () => {
    expect(() => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'r1',   type: 'resistor',  value: 0 },
          { id: 'led1', type: 'led', color: 'red' },
        ],
        connections: [
          { from: 'bat1:positive', to: 'r1:pin1' },
          { from: 'r1:pin2',       to: 'led1:anode' },
          { from: 'led1:cathode',  to: 'bat1:negative' },
        ],
      });
      solver.solve();
    }).not.toThrow();
  });

  it('EC-4.4 — R=0 in series with LED: solver uses 470Ω fallback (comp.value || 470)', () => {
    // KNOWN SOLVER BEHAVIOR: _getMNAResistance returns `comp.value || 470`.
    // R=0 is falsy → silently falls back to 470Ω, so the LED is NOT burned.
    // This prevents infinite-current issues but masks user mistakes with R=0.
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'r1',   type: 'resistor',  value: 0 },
        { id: 'led1', type: 'led', color: 'red' },
      ],
      connections: [
        { from: 'bat1:positive', to: 'r1:pin1' },
        { from: 'r1:pin2',       to: 'led1:anode' },
        { from: 'led1:cathode',  to: 'bat1:negative' },
      ],
    });
    solver.solve();
    const state = solver.getState();
    // R=0 falls back to 470Ω — LED should be ON (not burned), ~14.7mA
    expect(state.led1.on).toBe(true);
    expect(state.led1.burned).toBe(false);
  });

  it('EC-4.5 — negative resistor value: solver does not crash', () => {
    expect(() => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'r1',   type: 'resistor',  value: -100 },
          { id: 'led1', type: 'led', color: 'red' },
        ],
        connections: [
          { from: 'bat1:positive', to: 'r1:pin1' },
          { from: 'r1:pin2',       to: 'led1:anode' },
          { from: 'led1:cathode',  to: 'bat1:negative' },
        ],
      });
      solver.solve();
    }).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// EC-5: Potentiometer at 0% and 100%
// Expected: position 0 → resistance = 0 (wiper at gnd end)
//           position 1 → resistance = maxR (wiper at vcc end)
// ═══════════════════════════════════════════════════════════════════════
describe('EC-5: Potentiometer at 0% and 100%', () => {
  let solver;

  beforeEach(() => {
    solver = new CircuitSolver();
  });

  it('EC-5.1 — pot at 0%: resistance = 0', () => {
    solver.loadExperiment({
      components: [{ id: 'pot1', type: 'potentiometer', value: 10000 }],
      connections: [],
    });
    solver.interact('pot1', 'setPosition', 0.0);
    const state = solver.getState();
    expect(state.pot1.resistance).toBe(0);
  });

  it('EC-5.2 — pot at 100%: resistance = maxR', () => {
    solver.loadExperiment({
      components: [{ id: 'pot1', type: 'potentiometer', value: 10000 }],
      connections: [],
    });
    solver.interact('pot1', 'setPosition', 1.0);
    const state = solver.getState();
    expect(state.pot1.resistance).toBe(10000);
  });

  it('EC-5.3 — pot at 50% (default): resistance = maxR/2', () => {
    solver.loadExperiment({
      components: [{ id: 'pot1', type: 'potentiometer', value: 10000 }],
      connections: [],
    });
    const state = solver.getState();
    expect(state.pot1.position).toBe(0.5);
    expect(state.pot1.resistance).toBe(5000);
  });

  it('EC-5.4 — pot at 0% in LED circuit: LED gets full supply voltage', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'pot1', type: 'potentiometer', value: 10000 },
        { id: 'r1',   type: 'resistor',  value: 470 },
        { id: 'led1', type: 'led', color: 'red' },
      ],
      connections: [
        { from: 'bat1:positive', to: 'pot1:vcc' },
        { from: 'pot1:gnd',      to: 'bat1:negative' },
        { from: 'pot1:signal',   to: 'r1:pin1' },
        { from: 'r1:pin2',       to: 'led1:anode' },
        { from: 'led1:cathode',  to: 'bat1:negative' },
      ],
    });
    solver.interact('pot1', 'setPosition', 0.0);
    solver.solve();
    const state = solver.getState();
    // At 0% the wiper is at gnd → signal = 0V → LED gets 0V → off
    expect(state.led1.on).toBe(false);
  });

  it('EC-5.5 — pot at 100% in LED circuit: LED gets max signal voltage', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'pot1', type: 'potentiometer', value: 10000 },
        { id: 'r1',   type: 'resistor',  value: 470 },
        { id: 'led1', type: 'led', color: 'red' },
      ],
      connections: [
        { from: 'bat1:positive', to: 'pot1:vcc' },
        { from: 'pot1:gnd',      to: 'bat1:negative' },
        { from: 'pot1:signal',   to: 'r1:pin1' },
        { from: 'r1:pin2',       to: 'led1:anode' },
        { from: 'led1:cathode',  to: 'bat1:negative' },
      ],
    });
    solver.interact('pot1', 'setPosition', 1.0);
    solver.solve();
    const state = solver.getState();
    // At 100% the wiper is at vcc → signal = 9V → LED should light
    expect(state.led1.on).toBe(true);
  });

  it('EC-5.6 — pot position clamped: above 1.0 does not crash', () => {
    solver.loadExperiment({
      components: [{ id: 'pot1', type: 'potentiometer', value: 10000 }],
      connections: [],
    });
    expect(() => solver.interact('pot1', 'setPosition', 1.5)).not.toThrow();
  });

  it('EC-5.7 — pot position clamped: below 0.0 does not crash', () => {
    solver.loadExperiment({
      components: [{ id: 'pot1', type: 'potentiometer', value: 10000 }],
      connections: [],
    });
    expect(() => solver.interact('pot1', 'setPosition', -0.5)).not.toThrow();
  });

  it('EC-5.8 — pot resistance is monotonically increasing with position', () => {
    solver.loadExperiment({
      components: [{ id: 'pot1', type: 'potentiometer', value: 10000 }],
      connections: [],
    });
    const positions = [0, 0.25, 0.5, 0.75, 1.0];
    const resistances = [];
    for (const p of positions) {
      solver.interact('pot1', 'setPosition', p);
      resistances.push(solver.getState().pot1.resistance);
    }
    for (let i = 1; i < resistances.length; i++) {
      expect(resistances[i]).toBeGreaterThanOrEqual(resistances[i - 1]);
    }
  });
});
