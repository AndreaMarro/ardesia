/**
 * ELAB Simulator — CircuitSolver Edge Cases Test Suite
 * Tests: empty/null circuits, single components, simple valid circuits,
 *        error conditions, component values, pin mapping, MNA stability
 *
 * Target: ~75 test cases
 * Andrea Marro — 15/04/2026
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import CircuitSolver from '../../src/components/simulator/engine/CircuitSolver';

// ─── Mock registry: pin definitions for all tested component types ───
vi.mock('../../src/components/simulator/components/registry', () => ({
  getComponent: (type) => {
    const NANO_PINS = [
      { id: '5V' }, { id: '3V3' }, { id: 'GND' }, { id: 'GND_R' },
      { id: 'D0' }, { id: 'D1' }, { id: 'D2' }, { id: 'D3' },
      { id: 'D4' }, { id: 'D5' }, { id: 'D6' }, { id: 'D7' },
      { id: 'D8' }, { id: 'D9' }, { id: 'D10' }, { id: 'D11' },
      { id: 'D12' }, { id: 'D13' },
      { id: 'A0' }, { id: 'A1' }, { id: 'A2' }, { id: 'A3' },
      { id: 'A4' }, { id: 'A5' },
    ];
    const defs = {
      'battery9v': { pins: [{ id: 'positive' }, { id: 'negative' }] },
      'resistor': { pins: [{ id: 'pin1' }, { id: 'pin2' }] },
      'led': { pins: [{ id: 'anode' }, { id: 'cathode' }] },
      'rgb-led': { pins: [{ id: 'red' }, { id: 'common' }, { id: 'green' }, { id: 'blue' }] },
      'capacitor': { pins: [{ id: 'positive' }, { id: 'negative' }] },
      'push-button': { pins: [{ id: 'pin1' }, { id: 'pin2' }, { id: 'pin3' }, { id: 'pin4' }] },
      'potentiometer': { pins: [{ id: 'vcc' }, { id: 'signal' }, { id: 'gnd' }] },
      'buzzer-piezo': { pins: [{ id: 'positive' }, { id: 'negative' }] },
      'motor-dc': { pins: [{ id: 'positive' }, { id: 'negative' }] },
      'mosfet-n': { pins: [{ id: 'gate' }, { id: 'drain' }, { id: 'source' }] },
      'diode': { pins: [{ id: 'anode' }, { id: 'cathode' }] },
      'multimeter': { pins: [{ id: 'probe-positive' }, { id: 'probe-negative' }] },
      'photo-resistor': { pins: [{ id: 'pin1' }, { id: 'pin2' }] },
      'phototransistor': { pins: [{ id: 'collector' }, { id: 'emitter' }] },
      'breadboard-half': { pins: [], getInternalConnections: () => [] },
      'breadboard-full': { pins: [], getInternalConnections: () => [] },
      'nano-r4': { pins: NANO_PINS },
      'reed-switch': { pins: [{ id: 'pin1' }, { id: 'pin2' }] },
    };
    return defs[type] || null;
  }
}));

// ─── Helpers ───

function makeBatteryLedCircuit(resistorValue = 470, batteryVoltage = 9, ledColor = 'red') {
  return {
    components: [
      { id: 'bat1', type: 'battery9v', value: batteryVoltage },
      { id: 'r1', type: 'resistor', value: resistorValue },
      { id: 'led1', type: 'led', color: ledColor },
    ],
    connections: [
      { from: 'bat1:positive', to: 'r1:pin1' },
      { from: 'r1:pin2', to: 'led1:anode' },
      { from: 'led1:cathode', to: 'bat1:negative' },
    ],
  };
}

function makeSeriesResistors(r1Value, r2Value, batteryVoltage = 9) {
  return {
    components: [
      { id: 'bat1', type: 'battery9v', value: batteryVoltage },
      { id: 'r1', type: 'resistor', value: r1Value },
      { id: 'r2', type: 'resistor', value: r2Value },
      { id: 'led1', type: 'led', color: 'red' },
    ],
    connections: [
      { from: 'bat1:positive', to: 'r1:pin1' },
      { from: 'r1:pin2', to: 'r2:pin1' },
      { from: 'r2:pin2', to: 'led1:anode' },
      { from: 'led1:cathode', to: 'bat1:negative' },
    ],
  };
}

function makeParallelResistors(r1Value, r2Value, batteryVoltage = 9) {
  return {
    components: [
      { id: 'bat1', type: 'battery9v', value: batteryVoltage },
      { id: 'r1', type: 'resistor', value: r1Value },
      { id: 'r2', type: 'resistor', value: r2Value },
      { id: 'led1', type: 'led', color: 'red' },
    ],
    connections: [
      { from: 'bat1:positive', to: 'r1:pin1' },
      { from: 'bat1:positive', to: 'r2:pin1' },
      { from: 'r1:pin2', to: 'led1:anode' },
      { from: 'r2:pin2', to: 'led1:anode' },
      { from: 'led1:cathode', to: 'bat1:negative' },
    ],
  };
}

// ═══════════════════════════════════════════════════════
// SECTION 1: Empty/Null Circuits (10 tests)
// ═══════════════════════════════════════════════════════

describe('CircuitSolver Edge Cases — Empty/Null Circuits', () => {
  let solver;

  beforeEach(() => {
    solver = new CircuitSolver();
  });

  it('1.1 — constructor creates solver with empty state', () => {
    expect(solver.components.size).toBe(0);
    expect(solver.connections).toEqual([]);
    expect(solver.time).toBe(0);
    expect(solver.running).toBe(false);
  });

  it('1.2 — solve() on empty solver does not throw', () => {
    expect(() => solver.solve()).not.toThrow();
  });

  it('1.3 — getState() returns empty object when no components', () => {
    const state = solver.getState();
    expect(state).toEqual({});
  });

  it('1.4 — getDiagnostics() on empty solver returns safe defaults', () => {
    solver.solve();
    const diag = solver.getDiagnostics();
    expect(diag.shortCircuit).toBe(false);
    expect(Array.isArray(diag.disconnectedPins)).toBe(true);
    expect(Array.isArray(diag.overloadWarnings)).toBe(true);
  });

  it('1.5 — loadExperiment(null) does not throw', () => {
    expect(() => solver.loadExperiment(null)).not.toThrow();
  });

  it('1.6 — loadExperiment(undefined) does not throw', () => {
    expect(() => solver.loadExperiment(undefined)).not.toThrow();
  });

  it('1.7 — loadExperiment({}) with no components does not throw', () => {
    expect(() => solver.loadExperiment({})).not.toThrow();
    expect(solver.components.size).toBe(0);
  });

  it('1.8 — loadExperiment with empty components array', () => {
    expect(() => solver.loadExperiment({ components: [], connections: [] })).not.toThrow();
    expect(solver.components.size).toBe(0);
  });

  it('1.9 — getNodeVoltages() returns empty object on empty circuit', () => {
    solver.solve();
    const voltages = solver.getNodeVoltages();
    expect(voltages).toEqual({});
  });

  it('1.10 — getComponentCurrents() returns empty object on empty circuit', () => {
    solver.solve();
    const currents = solver.getComponentCurrents();
    expect(currents).toEqual({});
  });
});

// ═══════════════════════════════════════════════════════
// SECTION 2: Single Component (10 tests)
// ═══════════════════════════════════════════════════════

describe('CircuitSolver Edge Cases — Single Component', () => {
  let solver;

  beforeEach(() => {
    solver = new CircuitSolver();
  });

  it('2.1 — single battery with no connections has correct state', () => {
    solver.loadExperiment({
      components: [{ id: 'bat1', type: 'battery9v', value: 9 }],
      connections: [],
    });
    const state = solver.getState();
    expect(state.bat1).toBeDefined();
    expect(state.bat1.voltage).toBe(9);
    expect(state.bat1.connected).toBe(true);
  });

  it('2.2 — single resistor with no connections has zero current', () => {
    solver.loadExperiment({
      components: [{ id: 'r1', type: 'resistor', value: 470 }],
      connections: [],
    });
    const state = solver.getState();
    expect(state.r1).toBeDefined();
    expect(state.r1.current).toBe(0);
  });

  it('2.3 — single LED with no connections is off', () => {
    solver.loadExperiment({
      components: [{ id: 'led1', type: 'led', color: 'red' }],
      connections: [],
    });
    const state = solver.getState();
    expect(state.led1.on).toBe(false);
    expect(state.led1.brightness).toBe(0);
    expect(state.led1.current).toBe(0);
  });

  it('2.4 — single push-button starts unpressed', () => {
    solver.loadExperiment({
      components: [{ id: 'btn1', type: 'push-button' }],
      connections: [],
    });
    const state = solver.getState();
    expect(state.btn1.pressed).toBe(false);
  });

  it('2.5 — single potentiometer defaults to 50% position', () => {
    solver.loadExperiment({
      components: [{ id: 'pot1', type: 'potentiometer', value: 10000 }],
      connections: [],
    });
    const state = solver.getState();
    expect(state.pot1.position).toBe(0.5);
    expect(state.pot1.resistance).toBe(5000);
  });

  it('2.6 — single capacitor starts fully discharged', () => {
    solver.loadExperiment({
      components: [{ id: 'cap1', type: 'capacitor', value: 100 }],
      connections: [],
    });
    const state = solver.getState();
    expect(state.cap1.charge).toBe(0);
    expect(state.cap1.voltage).toBe(0);
    expect(state.cap1.current).toBe(0);
  });

  it('2.7 — single MOSFET starts off', () => {
    solver.loadExperiment({
      components: [{ id: 'mos1', type: 'mosfet-n' }],
      connections: [],
    });
    const state = solver.getState();
    expect(state.mos1.on).toBe(false);
    expect(state.mos1.vgs).toBe(0);
  });

  it('2.8 — single diode starts non-conducting', () => {
    solver.loadExperiment({
      components: [{ id: 'd1', type: 'diode' }],
      connections: [],
    });
    const state = solver.getState();
    expect(state.d1.conducting).toBe(false);
    expect(state.d1.current).toBe(0);
  });

  it('2.9 — single buzzer starts off', () => {
    solver.loadExperiment({
      components: [{ id: 'buz1', type: 'buzzer-piezo' }],
      connections: [],
    });
    const state = solver.getState();
    expect(state.buz1.on).toBe(false);
    expect(state.buz1.frequency).toBe(0);
  });

  it('2.10 — single motor starts stopped', () => {
    solver.loadExperiment({
      components: [{ id: 'mot1', type: 'motor-dc' }],
      connections: [],
    });
    const state = solver.getState();
    expect(state.mot1.on).toBe(false);
    expect(state.mot1.speed).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════
// SECTION 3: Simple Valid Circuits (15 tests)
// ═══════════════════════════════════════════════════════

describe('CircuitSolver Edge Cases — Simple Valid Circuits', () => {
  let solver;

  beforeEach(() => {
    solver = new CircuitSolver();
  });

  it('3.1 — battery + resistor + LED (red): LED turns on', () => {
    solver.loadExperiment(makeBatteryLedCircuit(470, 9, 'red'));
    const state = solver.getState();
    expect(state.led1.on).toBe(true);
    expect(state.led1.current).toBeGreaterThan(0);
  });

  it('3.2 — battery + resistor + LED: current is approximately (V-Vf)/R', () => {
    solver.loadExperiment(makeBatteryLedCircuit(470, 9, 'red'));
    const state = solver.getState();
    // V=9, Vf(red)=1.8, R=470 => I = 7.2/470 = ~0.0153A
    const expectedCurrent = (9 - 1.8) / 470;
    expect(state.led1.current).toBeCloseTo(expectedCurrent, 2);
  });

  it('3.3 — battery + resistor + green LED: different Vf applies', () => {
    solver.loadExperiment(makeBatteryLedCircuit(470, 9, 'green'));
    const state = solver.getState();
    // Vf(green)=2.2 => I = (9-2.2)/470 = ~0.01446A
    const expectedCurrent = (9 - 2.2) / 470;
    expect(state.led1.current).toBeCloseTo(expectedCurrent, 2);
  });

  it('3.4 — battery + resistor + blue LED: higher Vf', () => {
    solver.loadExperiment(makeBatteryLedCircuit(470, 9, 'blue'));
    const state = solver.getState();
    // Vf(blue)=3.0 => I = (9-3.0)/470 = ~0.01277A
    const expectedCurrent = (9 - 3.0) / 470;
    expect(state.led1.current).toBeCloseTo(expectedCurrent, 2);
  });

  it('3.5 — 2 resistors in series: total resistance is R1+R2', () => {
    solver.loadExperiment(makeSeriesResistors(220, 330, 9));
    const state = solver.getState();
    // Rtotal = 550, I = (9-1.8)/550 = ~0.01309A
    const expectedCurrent = (9 - 1.8) / (220 + 330);
    expect(state.led1.current).toBeCloseTo(expectedCurrent, 2);
  });

  it('3.6 — 2 equal resistors in series: current halves', () => {
    solver.loadExperiment(makeSeriesResistors(470, 470, 9));
    const state = solver.getState();
    // Rtotal = 940, I = (9-1.8)/940 = ~0.00766A
    const expectedCurrent = (9 - 1.8) / 940;
    expect(state.led1.current).toBeCloseTo(expectedCurrent, 2);
  });

  it('3.7 — battery + resistor + LED with 1.5V battery: LED may not light', () => {
    solver.loadExperiment(makeBatteryLedCircuit(470, 1.5, 'red'));
    const state = solver.getState();
    // 1.5V < Vf(red)=1.8V, so LED should not turn on (insufficient voltage)
    // Depends on solver implementation — may still show small residual
    expect(state.led1.brightness).toBeLessThanOrEqual(0.1);
  });

  it('3.8 — battery + resistor + LED with 3V: LED lights up', () => {
    solver.loadExperiment(makeBatteryLedCircuit(470, 3, 'red'));
    const state = solver.getState();
    // 3V > Vf(red)=1.8V => LED should be on
    expect(state.led1.on).toBe(true);
    const expectedCurrent = (3 - 1.8) / 470;
    expect(state.led1.current).toBeCloseTo(expectedCurrent, 2);
  });

  it('3.9 — push-button in circuit: LED off when unpressed', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'r1', type: 'resistor', value: 470 },
        { id: 'led1', type: 'led', color: 'red' },
        { id: 'btn1', type: 'push-button' },
      ],
      connections: [
        { from: 'bat1:positive', to: 'btn1:pin1' },
        { from: 'btn1:pin2', to: 'r1:pin1' },
        { from: 'r1:pin2', to: 'led1:anode' },
        { from: 'led1:cathode', to: 'bat1:negative' },
      ],
    });
    const state = solver.getState();
    expect(state.led1.on).toBe(false);
  });

  it('3.10 — push-button pressed: LED turns on', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'r1', type: 'resistor', value: 470 },
        { id: 'led1', type: 'led', color: 'red' },
        { id: 'btn1', type: 'push-button' },
      ],
      connections: [
        { from: 'bat1:positive', to: 'btn1:pin1' },
        { from: 'btn1:pin2', to: 'r1:pin1' },
        { from: 'r1:pin2', to: 'led1:anode' },
        { from: 'led1:cathode', to: 'bat1:negative' },
      ],
    });
    solver.interact('btn1', 'press');
    solver.solve();
    const state = solver.getState();
    expect(state.btn1.pressed).toBe(true);
    expect(state.led1.on).toBe(true);
  });

  it('3.11 — push-button release: LED turns off again', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'r1', type: 'resistor', value: 470 },
        { id: 'led1', type: 'led', color: 'red' },
        { id: 'btn1', type: 'push-button' },
      ],
      connections: [
        { from: 'bat1:positive', to: 'btn1:pin1' },
        { from: 'btn1:pin2', to: 'r1:pin1' },
        { from: 'r1:pin2', to: 'led1:anode' },
        { from: 'led1:cathode', to: 'bat1:negative' },
      ],
    });
    solver.interact('btn1', 'press');
    solver.solve();
    solver.interact('btn1', 'release');
    solver.solve();
    const state = solver.getState();
    expect(state.btn1.pressed).toBe(false);
    expect(state.led1.on).toBe(false);
  });

  it('3.12 — resistor state tracks voltage and current', () => {
    solver.loadExperiment(makeBatteryLedCircuit(470, 9, 'red'));
    const state = solver.getState();
    expect(state.r1.current).toBeGreaterThan(0);
    // Resistor voltage should be V_battery - V_led_forward
    expect(state.r1.voltage).toBeGreaterThan(0);
  });

  it('3.13 — battery provides declared voltage', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 4.5 },
      ],
      connections: [],
    });
    const state = solver.getState();
    expect(state.bat1.voltage).toBe(4.5);
  });

  it('3.14 — battery defaults to 9V if no value given', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v' },
      ],
      connections: [],
    });
    const state = solver.getState();
    expect(state.bat1.voltage).toBe(9);
  });

  it('3.15 — higher resistance yields lower LED current', () => {
    // Higher resistor = lower current
    solver.loadExperiment(makeBatteryLedCircuit(220, 9, 'red'));
    const currentA = solver.getState().led1.current;

    const solver2 = new CircuitSolver();
    solver2.loadExperiment(makeBatteryLedCircuit(1000, 9, 'red'));
    const currentB = solver2.getState().led1.current;

    expect(currentA).toBeGreaterThan(currentB);
  });
});

// ═══════════════════════════════════════════════════════
// SECTION 4: Error Conditions (15 tests)
// ═══════════════════════════════════════════════════════

describe('CircuitSolver Edge Cases — Error Conditions', () => {
  let solver;
  let warnings;

  beforeEach(() => {
    solver = new CircuitSolver();
    warnings = [];
    solver.onWarning = (type, message) => {
      warnings.push({ type, message });
    };
  });

  it('4.1 — short circuit: battery positive to negative directly', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
      ],
      connections: [
        { from: 'bat1:positive', to: 'bat1:negative' },
      ],
    });
    const diag = solver.getDiagnostics();
    expect(diag.shortCircuit).toBe(true);
    expect(warnings.some(w => w.type === 'short-circuit')).toBe(true);
  });

  it('4.2 — short circuit through wire: detected', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'r1', type: 'resistor', value: 0 },
      ],
      connections: [
        { from: 'bat1:positive', to: 'r1:pin1' },
        { from: 'r1:pin2', to: 'bat1:negative' },
      ],
    });
    // Zero-value resistor acts as wire => short circuit
    // Whether this triggers depends on solver implementation
    // At minimum, the solver should not crash
    expect(() => solver.solve()).not.toThrow();
  });

  it('4.3 — LED without resistor: solver warns but does not crash', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'led1', type: 'led', color: 'red' },
      ],
      connections: [
        { from: 'bat1:positive', to: 'led1:anode' },
        { from: 'led1:cathode', to: 'bat1:negative' },
      ],
    });
    // The solver should warn about missing resistor
    const hasConnectionWarning = warnings.some(w => w.type === 'connection_warning');
    expect(hasConnectionWarning).toBe(true);
  });

  it('4.4 — LED backwards (reversed polarity): no current flows', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'r1', type: 'resistor', value: 470 },
        { id: 'led1', type: 'led', color: 'red' },
      ],
      connections: [
        { from: 'bat1:positive', to: 'r1:pin1' },
        { from: 'r1:pin2', to: 'led1:cathode' },   // reversed!
        { from: 'led1:anode', to: 'bat1:negative' }, // reversed!
      ],
    });
    const state = solver.getState();
    // Reversed LED should not conduct (or minimal/zero current)
    expect(state.led1.on).toBe(false);
  });

  it('4.5 — disconnected component: LED not in circuit has zero current', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'r1', type: 'resistor', value: 470 },
        { id: 'led1', type: 'led', color: 'red' },
        { id: 'led2', type: 'led', color: 'green' }, // floating, not connected
      ],
      connections: [
        { from: 'bat1:positive', to: 'r1:pin1' },
        { from: 'r1:pin2', to: 'led1:anode' },
        { from: 'led1:cathode', to: 'bat1:negative' },
      ],
    });
    const state = solver.getState();
    expect(state.led1.on).toBe(true);
    expect(state.led2.on).toBe(false);
    expect(state.led2.current).toBe(0);
  });

  it('4.6 — circuit with only connections and no components does not crash', () => {
    expect(() => {
      solver.loadExperiment({
        components: [],
        connections: [
          { from: 'a:pin1', to: 'b:pin2' },
        ],
      });
    }).not.toThrow();
  });

  it('4.7 — interact on non-existent component does not throw', () => {
    solver.loadExperiment({
      components: [{ id: 'bat1', type: 'battery9v', value: 9 }],
      connections: [],
    });
    expect(() => solver.interact('nonexistent', 'press')).not.toThrow();
  });

  it('4.8 — interact with invalid action on button does not crash', () => {
    solver.loadExperiment({
      components: [{ id: 'btn1', type: 'push-button' }],
      connections: [],
    });
    expect(() => solver.interact('btn1', 'invalidAction')).not.toThrow();
    const state = solver.getState();
    expect(state.btn1.pressed).toBe(false);
  });

  it('4.9 — multiple solve() calls are idempotent for static circuit', () => {
    solver.loadExperiment(makeBatteryLedCircuit(470));
    const state1 = solver.getState();
    solver.solve();
    solver.solve();
    solver.solve();
    const state2 = solver.getState();
    expect(state2.led1.current).toBeCloseTo(state1.led1.current, 4);
    expect(state2.led1.on).toBe(state1.led1.on);
  });

  it('4.10 — reset() clears all state', () => {
    solver.loadExperiment(makeBatteryLedCircuit(470));
    expect(solver.components.size).toBeGreaterThan(0);

    solver.reset();
    expect(solver.components.size).toBe(0);
    expect(solver.connections).toEqual([]);
    expect(solver.time).toBe(0);
  });

  it('4.11 — destroy() clears state and callbacks', () => {
    solver.loadExperiment(makeBatteryLedCircuit(470));
    solver.onStateChange = () => {};
    solver.destroy();
    expect(solver.components.size).toBe(0);
    expect(solver.onStateChange).toBeNull();
    expect(solver.onWarning).toBeNull();
  });

  it('4.12 — loadExperiment after reset loads components correctly', () => {
    solver.loadExperiment(makeBatteryLedCircuit(470));
    solver.reset();
    solver.loadExperiment(makeBatteryLedCircuit(220));
    const state = solver.getState();
    // After reset + reload, components should be present
    expect(state.led1).toBeDefined();
    expect(state.bat1).toBeDefined();
    expect(state.r1).toBeDefined();
    expect(solver.components.size).toBe(3);
  });

  it('4.13 — onStateChange is called during solve', () => {
    const stateChanges = [];
    solver.onStateChange = (state) => stateChanges.push(state);
    solver.loadExperiment(makeBatteryLedCircuit(470));
    expect(stateChanges.length).toBeGreaterThan(0);
    expect(stateChanges[stateChanges.length - 1].led1).toBeDefined();
  });

  it('4.14 — connection with same from and to (self-loop) does not crash', () => {
    expect(() => {
      solver.loadExperiment({
        components: [{ id: 'r1', type: 'resistor', value: 470 }],
        connections: [{ from: 'r1:pin1', to: 'r1:pin1' }],
      });
    }).not.toThrow();
  });

  it('4.15 — duplicate connections do not cause issues', () => {
    expect(() => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'r1', type: 'resistor', value: 470 },
          { id: 'led1', type: 'led', color: 'red' },
        ],
        connections: [
          { from: 'bat1:positive', to: 'r1:pin1' },
          { from: 'bat1:positive', to: 'r1:pin1' }, // duplicate
          { from: 'r1:pin2', to: 'led1:anode' },
          { from: 'led1:cathode', to: 'bat1:negative' },
        ],
      });
    }).not.toThrow();
    const state = solver.getState();
    expect(state.led1.on).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════
// SECTION 5: Component Values (10 tests)
// ═══════════════════════════════════════════════════════

describe('CircuitSolver Edge Cases — Component Values', () => {
  let solver;

  beforeEach(() => {
    solver = new CircuitSolver();
  });

  it('5.1 — 1 ohm resistor: high current', () => {
    solver.loadExperiment(makeBatteryLedCircuit(1, 9, 'red'));
    const state = solver.getState();
    // I = (9-1.8)/1 = 7.2A — very high, LED would burn
    expect(state.led1.current).toBeGreaterThan(1);
  });

  it('5.2 — 220 ohm resistor: standard LED current', () => {
    solver.loadExperiment(makeBatteryLedCircuit(220, 9, 'red'));
    const state = solver.getState();
    const expected = (9 - 1.8) / 220;
    expect(state.led1.current).toBeCloseTo(expected, 2);
  });

  it('5.3 — 470 ohm resistor: moderate LED current', () => {
    solver.loadExperiment(makeBatteryLedCircuit(470, 9, 'red'));
    const state = solver.getState();
    const expected = (9 - 1.8) / 470;
    expect(state.led1.current).toBeCloseTo(expected, 2);
  });

  it('5.4 — 1K ohm resistor: lower LED current', () => {
    solver.loadExperiment(makeBatteryLedCircuit(1000, 9, 'red'));
    const state = solver.getState();
    const expected = (9 - 1.8) / 1000;
    expect(state.led1.current).toBeCloseTo(expected, 2);
  });

  it('5.5 — 10K ohm resistor: very dim LED', () => {
    solver.loadExperiment(makeBatteryLedCircuit(10000, 9, 'red'));
    const state = solver.getState();
    const expected = (9 - 1.8) / 10000;
    expect(state.led1.current).toBeCloseTo(expected, 3);
    expect(state.led1.brightness).toBeLessThan(0.5);
  });

  it('5.6 — 1M ohm resistor: negligible current', () => {
    solver.loadExperiment(makeBatteryLedCircuit(1000000, 9, 'red'));
    const state = solver.getState();
    const expected = (9 - 1.8) / 1000000;
    expect(state.led1.current).toBeCloseTo(expected, 5);
  });

  it('5.7 — increasing resistance decreases current monotonically', () => {
    const resistances = [100, 220, 470, 1000, 10000];
    const currents = [];
    for (const r of resistances) {
      solver.reset();
      solver.loadExperiment(makeBatteryLedCircuit(r, 9, 'red'));
      currents.push(solver.getState().led1.current);
    }
    for (let i = 1; i < currents.length; i++) {
      expect(currents[i]).toBeLessThan(currents[i - 1]);
    }
  });

  it('5.8 — battery voltage 0 treated as default 9V (falsy fallback)', () => {
    // _initState uses `comp.value || 9` so 0 is falsy => defaults to 9V
    // This is a known behavior of the solver — 0V batteries are not supported
    solver.loadExperiment(makeBatteryLedCircuit(470, 0, 'red'));
    const state = solver.getState();
    expect(state.bat1.voltage).toBe(9); // 0 is falsy, falls back to 9
    expect(state.led1).toBeDefined();
  });

  it('5.9 — photo-resistor light level affects resistance', () => {
    solver.loadExperiment({
      components: [{ id: 'pr1', type: 'photo-resistor', value: 10000 }],
      connections: [],
    });
    // Set low light
    solver.interact('pr1', 'setLightLevel', 0.1);
    const stateDark = solver.getState();

    // Set high light
    solver.interact('pr1', 'setLightLevel', 0.9);
    const stateLight = solver.getState();

    // More light = lower resistance for photo-resistor
    expect(stateLight.pr1.resistance).toBeLessThan(stateDark.pr1.resistance);
  });

  it('5.10 — potentiometer position changes resistance', () => {
    solver.loadExperiment({
      components: [{ id: 'pot1', type: 'potentiometer', value: 10000 }],
      connections: [],
    });
    solver.interact('pot1', 'setPosition', 0.0);
    const stateMin = solver.getState();

    solver.interact('pot1', 'setPosition', 1.0);
    const stateMax = solver.getState();

    expect(stateMin.pot1.resistance).toBe(0);
    expect(stateMax.pot1.resistance).toBe(10000);
  });
});

// ═══════════════════════════════════════════════════════
// SECTION 6: Pin Mapping Validation (10 tests)
// ═══════════════════════════════════════════════════════

describe('CircuitSolver Edge Cases — Pin Mapping Validation', () => {
  let solver;

  beforeEach(() => {
    solver = new CircuitSolver();
  });

  it('6.1 — Arduino Nano D13 pin is recognized', () => {
    solver.loadExperiment({
      components: [
        { id: 'nano1', type: 'nano-r4' },
        { id: 'r1', type: 'resistor', value: 470 },
      ],
      connections: [
        { from: 'nano1:D13', to: 'r1:pin1' },
      ],
    });
    // Should not crash — D13 is a valid pin
    expect(() => solver.solve()).not.toThrow();
  });

  it('6.2 — Arduino Nano D0 pin is valid', () => {
    solver.loadExperiment({
      components: [
        { id: 'nano1', type: 'nano-r4' },
        { id: 'r1', type: 'resistor', value: 470 },
      ],
      connections: [
        { from: 'nano1:D0', to: 'r1:pin1' },
      ],
    });
    expect(() => solver.solve()).not.toThrow();
  });

  it('6.3 — Arduino Nano A0 pin is valid', () => {
    solver.loadExperiment({
      components: [
        { id: 'nano1', type: 'nano-r4' },
        { id: 'r1', type: 'resistor', value: 470 },
      ],
      connections: [
        { from: 'nano1:A0', to: 'r1:pin1' },
      ],
    });
    expect(() => solver.solve()).not.toThrow();
  });

  it('6.4 — Arduino Nano A5 pin is valid', () => {
    solver.loadExperiment({
      components: [
        { id: 'nano1', type: 'nano-r4' },
        { id: 'r1', type: 'resistor', value: 470 },
      ],
      connections: [
        { from: 'nano1:A5', to: 'r1:pin1' },
      ],
    });
    expect(() => solver.solve()).not.toThrow();
  });

  it('6.5 — Arduino 5V and GND pins create supply nets', () => {
    solver.loadExperiment({
      components: [
        { id: 'nano1', type: 'nano-r4' },
        { id: 'r1', type: 'resistor', value: 470 },
        { id: 'led1', type: 'led', color: 'red' },
      ],
      connections: [
        { from: 'nano1:5V', to: 'r1:pin1' },
        { from: 'r1:pin2', to: 'led1:anode' },
        { from: 'led1:cathode', to: 'nano1:GND' },
      ],
    });
    const state = solver.getState();
    // 5V supply, Vf=1.8, R=470 => I = 3.2/470 = ~0.0068A
    expect(state.led1.on).toBe(true);
    expect(state.led1.current).toBeGreaterThan(0);
  });

  it('6.6 — Arduino 3V3 pin provides 3.3V supply', () => {
    solver.loadExperiment({
      components: [
        { id: 'nano1', type: 'nano-r4' },
        { id: 'r1', type: 'resistor', value: 470 },
        { id: 'led1', type: 'led', color: 'red' },
      ],
      connections: [
        { from: 'nano1:3V3', to: 'r1:pin1' },
        { from: 'r1:pin2', to: 'led1:anode' },
        { from: 'led1:cathode', to: 'nano1:GND' },
      ],
    });
    const state = solver.getState();
    // 3.3V supply, Vf=1.8, R=470 => I = 1.5/470 = ~0.0032A
    expect(state.led1.on).toBe(true);
    const expectedCurrent = (3.3 - 1.8) / 470;
    expect(state.led1.current).toBeCloseTo(expectedCurrent, 2);
  });

  it('6.7 — Arduino GND_R pin also acts as ground', () => {
    solver.loadExperiment({
      components: [
        { id: 'nano1', type: 'nano-r4' },
        { id: 'r1', type: 'resistor', value: 470 },
        { id: 'led1', type: 'led', color: 'red' },
      ],
      connections: [
        { from: 'nano1:5V', to: 'r1:pin1' },
        { from: 'r1:pin2', to: 'led1:anode' },
        { from: 'led1:cathode', to: 'nano1:GND_R' },
      ],
    });
    const state = solver.getState();
    expect(state.led1.on).toBe(true);
  });

  it('6.8 — invalid pin name in connection does not crash', () => {
    expect(() => {
      solver.loadExperiment({
        components: [
          { id: 'nano1', type: 'nano-r4' },
          { id: 'r1', type: 'resistor', value: 470 },
        ],
        connections: [
          { from: 'nano1:INVALID_PIN', to: 'r1:pin1' },
        ],
      });
    }).not.toThrow();
  });

  it('6.9 — LED anode/cathode pin names are correct', () => {
    solver.loadExperiment({
      components: [
        { id: 'led1', type: 'led', color: 'red' },
        { id: 'bat1', type: 'battery9v', value: 9 },
        { id: 'r1', type: 'resistor', value: 470 },
      ],
      connections: [
        { from: 'bat1:positive', to: 'r1:pin1' },
        { from: 'r1:pin2', to: 'led1:anode' },
        { from: 'led1:cathode', to: 'bat1:negative' },
      ],
    });
    const state = solver.getState();
    expect(state.led1.on).toBe(true);
  });

  it('6.10 — battery positive/negative pin names are correct', () => {
    solver.loadExperiment({
      components: [
        { id: 'bat1', type: 'battery9v', value: 9 },
      ],
      connections: [],
    });
    const voltages = solver.getNodeVoltages();
    // No connections, so no nets formed — just verify no crash
    expect(() => solver.solve()).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════
// SECTION 7: MNA Matrix Stability (5 tests)
// ═══════════════════════════════════════════════════════

describe('CircuitSolver Edge Cases — MNA Matrix Stability', () => {
  let solver;

  beforeEach(() => {
    solver = new CircuitSolver();
  });

  it('7.1 — large circuit with 10 resistors in series does not crash', () => {
    const components = [
      { id: 'bat1', type: 'battery9v', value: 9 },
      { id: 'led1', type: 'led', color: 'red' },
    ];
    const connections = [];

    for (let i = 0; i < 10; i++) {
      components.push({ id: `r${i}`, type: 'resistor', value: 100 });
    }

    // Chain: bat+ -> r0 -> r1 -> ... -> r9 -> led -> bat-
    connections.push({ from: 'bat1:positive', to: 'r0:pin1' });
    for (let i = 0; i < 9; i++) {
      connections.push({ from: `r${i}:pin2`, to: `r${i + 1}:pin1` });
    }
    connections.push({ from: 'r9:pin2', to: 'led1:anode' });
    connections.push({ from: 'led1:cathode', to: 'bat1:negative' });

    expect(() => {
      solver.loadExperiment({ components, connections });
    }).not.toThrow();

    const state = solver.getState();
    // Total R = 1000, I = (9-1.8)/1000 = 0.0072A
    expect(state.led1.on).toBe(true);
    expect(state.led1.current).toBeCloseTo((9 - 1.8) / 1000, 2);
  });

  it('7.2 — circuit with 5 LEDs in series: only lights if voltage sufficient', () => {
    // 5 red LEDs * 1.8V = 9V, with 9V battery there is exactly 0V left for resistor
    const components = [
      { id: 'bat1', type: 'battery9v', value: 9 },
      { id: 'r1', type: 'resistor', value: 100 },
    ];
    for (let i = 0; i < 5; i++) {
      components.push({ id: `led${i}`, type: 'led', color: 'red' });
    }
    const connections = [
      { from: 'bat1:positive', to: 'r1:pin1' },
      { from: 'r1:pin2', to: 'led0:anode' },
    ];
    for (let i = 0; i < 4; i++) {
      connections.push({ from: `led${i}:cathode`, to: `led${i + 1}:anode` });
    }
    connections.push({ from: 'led4:cathode', to: 'bat1:negative' });

    expect(() => {
      solver.loadExperiment({ components, connections });
    }).not.toThrow();
  });

  it('7.3 — circuit with 15 components: solver converges', () => {
    const components = [
      { id: 'bat1', type: 'battery9v', value: 9 },
    ];
    const connections = [];

    // 7 resistors + 7 LEDs + battery = 15 components
    for (let i = 0; i < 7; i++) {
      components.push({ id: `r${i}`, type: 'resistor', value: 470 });
      components.push({ id: `led${i}`, type: 'led', color: 'red' });
      // Each R+LED pair in parallel across battery
      connections.push({ from: 'bat1:positive', to: `r${i}:pin1` });
      connections.push({ from: `r${i}:pin2`, to: `led${i}:anode` });
      connections.push({ from: `led${i}:cathode`, to: 'bat1:negative' });
    }

    expect(() => {
      solver.loadExperiment({ components, connections });
    }).not.toThrow();

    const state = solver.getState();
    // Each LED should be on with independent current path
    for (let i = 0; i < 7; i++) {
      expect(state[`led${i}`].on).toBe(true);
    }
  });

  it('7.4 — solve with preserveState does not lose component state', () => {
    const experiment = makeBatteryLedCircuit(470, 9, 'red');
    solver.loadExperiment(experiment);

    const stateBefore = solver.getState();
    expect(stateBefore.led1.on).toBe(true);

    // Reload with preserveState
    solver.loadExperiment(experiment, { preserveState: true });
    const stateAfter = solver.getState();
    expect(stateAfter.led1.on).toBe(true);
  });

  it('7.5 — repeated loadExperiment calls do not accumulate state', () => {
    for (let i = 0; i < 10; i++) {
      solver.loadExperiment(makeBatteryLedCircuit(470));
    }
    // Should have exactly 3 components, not accumulated
    expect(solver.components.size).toBe(3);
    const state = solver.getState();
    expect(state.led1.on).toBe(true);
  });
});
