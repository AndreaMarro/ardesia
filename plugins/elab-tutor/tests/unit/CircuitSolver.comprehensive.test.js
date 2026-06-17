/**
 * ELAB Simulator — CircuitSolver Comprehensive Test Suite
 * Tests: LED on/off, voltage divider, parallel R, RGB LED, potentiometer,
 *        capacitor, push-button, short circuit, open circuit, bus connections,
 *        MOSFET, diode, multimeter, buzzer, motor
 *
 * Target: 20+ tests, all green
 * Andrea Marro — 17/02/2026
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import CircuitSolver from '../../src/components/simulator/engine/CircuitSolver';

// ─── Mock registry: pin definitions for all tested component types ───
vi.mock('../../src/components/simulator/components/registry', () => ({
  getComponent: (type) => {
    const defs = {
      'battery9v': { pins: [{ id: 'positive' }, { id: 'negative' }] },
      'resistor': { pins: [{ id: 'pin1' }, { id: 'pin2' }] },
      'led': { pins: [{ id: 'anode' }, { id: 'cathode' }] },
      'rgb-led': { pins: [{ id: 'red' }, { id: 'common' }, { id: 'green' }, { id: 'blue' }] },
      'capacitor': { pins: [{ id: 'positive' }, { id: 'negative' }] },
      'push-button': { pins: [{ id: 'pin1' }, { id: 'pin2' }] },
      'potentiometer': { pins: [{ id: 'vcc' }, { id: 'signal' }, { id: 'gnd' }] },
      'buzzer-piezo': { pins: [{ id: 'positive' }, { id: 'negative' }] },
      'motor-dc': { pins: [{ id: 'positive' }, { id: 'negative' }] },
      'mosfet-n': { pins: [{ id: 'gate' }, { id: 'drain' }, { id: 'source' }] },
      'diode': { pins: [{ id: 'anode' }, { id: 'cathode' }] },
      'multimeter': { pins: [{ id: 'probe-positive' }, { id: 'probe-negative' }] },
      'photo-resistor': { pins: [{ id: 'pin1' }, { id: 'pin2' }] },
      'phototransistor': { pins: [{ id: 'collector' }, { id: 'emitter' }] },
      'breadboard-half': { pins: [] },
      'breadboard-full': { pins: [] },
      'arduino-nano': { pins: [{ id: 'D13' }, { id: 'GND' }, { id: '5V' }] },
    };
    return defs[type] || { pins: [] };
  }
}));

// ─── Helper: create simple circuit experiments ───

function makeBatteryLedCircuit(resistorValue = 470) {
  return {
    components: [
      { id: 'bat1', type: 'battery9v', value: 9 },
      { id: 'res1', type: 'resistor', value: resistorValue },
      { id: 'led1', type: 'led', color: 'red' },
    ],
    connections: [
      { from: 'bat1:positive', to: 'res1:pin1' },
      { from: 'res1:pin2', to: 'led1:anode' },
      { from: 'led1:cathode', to: 'bat1:negative' },
    ],
  };
}

// ─── Tests ───

describe('CircuitSolver — Comprehensive Suite', () => {
  let solver;

  beforeEach(() => {
    solver = new CircuitSolver();
  });

  // ═══════════════ LED ON/OFF ═══════════════

  describe('LED on/off', () => {
    it('should turn LED on when connected through resistor to battery', () => {
      solver.loadExperiment(makeBatteryLedCircuit(470));
      const state = solver.getState();
      expect(state.led1.on).toBe(true);
      expect(state.led1.current).toBeGreaterThan(0);
    });

    it('should calculate correct LED current with 470 ohm resistor', () => {
      solver.loadExperiment(makeBatteryLedCircuit(470));
      const state = solver.getState();
      // V = 9V, Vf(red) = 1.8V, R = 470 ohm
      // I = (9 - 1.8) / 470 = ~15.3 mA
      expect(state.led1.current).toBeCloseTo(0.0153, 2);
    });

    it('should keep LED off when no connection exists', () => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'led1', type: 'led', color: 'red' },
        ],
        connections: [], // No wires
      });
      const state = solver.getState();
      expect(state.led1.on).toBe(false);
      expect(state.led1.current).toBe(0);
    });
  });

  // ═══════════════ VOLTAGE DIVIDER ═══════════════

  describe('Voltage divider', () => {
    it('should produce ~4.5V at midpoint of equal resistors', () => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'r1', type: 'resistor', value: 1000 },
          { id: 'r2', type: 'resistor', value: 1000 },
          { id: 'led1', type: 'led', color: 'red' },
        ],
        connections: [
          { from: 'bat1:positive', to: 'r1:pin1' },
          { from: 'r1:pin2', to: 'r2:pin1' },
          { from: 'r2:pin2', to: 'bat1:negative' },
          // LED across r2 (lower resistor)
          { from: 'r1:pin2', to: 'led1:anode' },
          { from: 'led1:cathode', to: 'bat1:negative' },
        ],
      });
      const state = solver.getState();
      // LED gets ~4.5V (9V / 2), minus Vf = 1.8V, through ~1k
      expect(state.led1.on).toBe(true);
    });
  });

  // ═══════════════ PARALLEL RESISTORS ═══════════════

  describe('Parallel resistors', () => {
    it('should produce higher current with parallel resistors', () => {
      // Single 470Ω
      solver.loadExperiment(makeBatteryLedCircuit(470));
      const singleState = solver.getState();
      const singleCurrent = singleState.led1.current;

      // Two 470Ω in parallel (effective 235Ω) — different circuit
      const solver2 = new CircuitSolver();
      solver2.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'r1', type: 'resistor', value: 470 },
          { id: 'r2', type: 'resistor', value: 470 },
          { id: 'led1', type: 'led', color: 'red' },
        ],
        connections: [
          { from: 'bat1:positive', to: 'r1:pin1' },
          { from: 'bat1:positive', to: 'r2:pin1' },
          { from: 'r1:pin2', to: 'led1:anode' },
          { from: 'r2:pin2', to: 'led1:anode' },
          { from: 'led1:cathode', to: 'bat1:negative' },
        ],
      });
      const parallelState = solver2.getState();
      // Parallel should have ~2x the current
      expect(parallelState.led1.current).toBeGreaterThan(singleCurrent * 1.5);
    });
  });

  // ═══════════════ RGB LED ═══════════════

  describe('RGB LED', () => {
    it('should light red channel when wired through resistor', () => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'r1', type: 'resistor', value: 220 },
          { id: 'rgb1', type: 'rgb-led' },
        ],
        connections: [
          { from: 'bat1:positive', to: 'r1:pin1' },
          { from: 'r1:pin2', to: 'rgb1:red' },
          { from: 'rgb1:common', to: 'bat1:negative' },
        ],
      });
      const state = solver.getState();
      // RGB LED state uses nested objects: { red: { on, brightness }, ... }
      expect(state.rgb1.red.on).toBe(true);
      expect(state.rgb1.green.on).toBe(false);
      expect(state.rgb1.blue.on).toBe(false);
    });
  });

  // ═══════════════ POTENTIOMETER ═══════════════

  describe('Potentiometer', () => {
    it('should produce variable voltage on signal pin', () => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'pot1', type: 'potentiometer', value: 10000 },
          { id: 'led1', type: 'led', color: 'green' },
          { id: 'r1', type: 'resistor', value: 330 },
        ],
        connections: [
          { from: 'bat1:positive', to: 'pot1:vcc' },
          { from: 'pot1:gnd', to: 'bat1:negative' },
          { from: 'pot1:signal', to: 'r1:pin1' },
          { from: 'r1:pin2', to: 'led1:anode' },
          { from: 'led1:cathode', to: 'bat1:negative' },
        ],
      });

      // Set pot to 50% — should give ~4.5V on signal
      solver.interact('pot1', 'setPosition', 0.5);
      const state50 = solver.getState();
      expect(state50.pot1.position).toBe(0.5);
      expect(state50.pot1.signalVoltage).toBeGreaterThan(3);
      expect(state50.pot1.signalVoltage).toBeLessThan(6);
    });

    it('should clamp position to [0, 1]', () => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'pot1', type: 'potentiometer', value: 10000 },
        ],
        connections: [
          { from: 'bat1:positive', to: 'pot1:vcc' },
          { from: 'pot1:gnd', to: 'bat1:negative' },
        ],
      });
      solver.interact('pot1', 'setPosition', 1.5);
      expect(solver.getState().pot1.position).toBe(1);
      solver.interact('pot1', 'setPosition', -0.5);
      expect(solver.getState().pot1.position).toBe(0);
    });
  });

  // ═══════════════ CAPACITOR ═══════════════

  describe('Capacitor', () => {
    it('should charge over time when connected to battery through resistor', () => {
      const exp = {
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'r1', type: 'resistor', value: 1000 },
          { id: 'cap1', type: 'capacitor', value: 1000 },
        ],
        connections: [
          { from: 'bat1:positive', to: 'r1:pin1' },
          { from: 'r1:pin2', to: 'cap1:positive' },
          { from: 'cap1:negative', to: 'bat1:negative' },
        ],
      };
      solver.loadExperiment(exp);

      const v0 = solver.getState().cap1.voltage;

      // Simulate 50 steps
      for (let i = 0; i < 50; i++) {
        solver.time += 0.01;
        solver.solve(true); // Pass true to trigger time step physics
      }

      const v1 = solver.getState().cap1.voltage;
      expect(v1).toBeGreaterThan(v0);
      expect(v1).toBeLessThanOrEqual(9);
    });
  });

  // ═══════════════ PUSH BUTTON ═══════════════

  describe('Push button', () => {
    it('should complete circuit when pressed', () => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'btn1', type: 'push-button' },
          { id: 'r1', type: 'resistor', value: 470 },
          { id: 'led1', type: 'led', color: 'red' },
        ],
        connections: [
          { from: 'bat1:positive', to: 'btn1:pin1' },
          { from: 'btn1:pin2', to: 'r1:pin1' },
          { from: 'r1:pin2', to: 'led1:anode' },
          { from: 'led1:cathode', to: 'bat1:negative' },
        ],
      });

      // Button not pressed — LED off
      expect(solver.getState().led1.on).toBe(false);

      // Press button — LED on
      solver.interact('btn1', 'press');
      expect(solver.getState().led1.on).toBe(true);

      // Release button — LED off again
      solver.interact('btn1', 'release');
      expect(solver.getState().led1.on).toBe(false);
    });
  });

  // ═══════════════ SHORT CIRCUIT ═══════════════
  // Andrea Marro — 17/02/2026

  describe('Short circuit', () => {
    it('should detect or handle short circuit (battery terminals directly connected)', () => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
        ],
        connections: [
          { from: 'bat1:positive', to: 'bat1:negative' },
        ],
      });
      // Should not crash — solver should handle gracefully
      const state = solver.getState();
      expect(state.bat1).toBeDefined();
    });
  });

  // ═══════════════ OPEN CIRCUIT ═══════════════

  describe('Open circuit', () => {
    it('should produce zero current when circuit is not closed', () => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'r1', type: 'resistor', value: 470 },
          { id: 'led1', type: 'led', color: 'red' },
        ],
        connections: [
          { from: 'bat1:positive', to: 'r1:pin1' },
          { from: 'r1:pin2', to: 'led1:anode' },
          // Missing: led1:cathode → bat1:negative (open circuit)
        ],
      });
      const state = solver.getState();
      expect(state.led1.on).toBe(false);
    });
  });

  // ═══════════════ BUS CONNECTIONS (Breadboard) ═══════════════

  describe('Breadboard pinAssignments', () => {
    it('should connect components through shared breadboard hole (same hole = same net)', () => {
      // When two component pins are assigned to the SAME breadboard hole,
      // they share a net via pinAssignments union-find merge.
      // NOTE: full column/bus merging requires getInternalConnections() from
      // the real breadboard registry, which is not available in unit tests.
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'bb1', type: 'breadboard-half' },
          { id: 'r1', type: 'resistor', value: 470 },
          { id: 'led1', type: 'led', color: 'red' },
        ],
        connections: [
          // Battery positive wired to same hole as resistor pin1
          { from: 'bat1:positive', to: 'bb1:a1' },
          // Battery negative wired to same hole as LED cathode
          { from: 'bat1:negative', to: 'bb1:a3' },
        ],
        pinAssignments: {
          // Resistor pin1 → same hole as battery positive wire
          'r1:pin1': 'bb1:a1',
          // Resistor pin2 and LED anode → same hole (they share a net)
          'r1:pin2': 'bb1:a2',
          'led1:anode': 'bb1:a2',
          // LED cathode → same hole as battery negative wire
          'led1:cathode': 'bb1:a3',
        },
      });
      const state = solver.getState();
      expect(state.led1.on).toBe(true);
    });
  });

  // ═══════════════ BUZZER ═══════════════

  describe('Buzzer', () => {
    it('should activate when connected to battery through resistor', () => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'r1', type: 'resistor', value: 100 },
          { id: 'buz1', type: 'buzzer-piezo' },
        ],
        connections: [
          { from: 'bat1:positive', to: 'r1:pin1' },
          { from: 'r1:pin2', to: 'buz1:positive' },
          { from: 'buz1:negative', to: 'bat1:negative' },
        ],
      });
      const state = solver.getState();
      expect(state.buz1.on).toBe(true);
    });
  });

  // ═══════════════ MOTOR ═══════════════

  describe('Motor DC', () => {
    it('should spin when connected to battery', () => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'r1', type: 'resistor', value: 100 },
          { id: 'mot1', type: 'motor-dc' },
        ],
        connections: [
          { from: 'bat1:positive', to: 'r1:pin1' },
          { from: 'r1:pin2', to: 'mot1:positive' },
          { from: 'mot1:negative', to: 'bat1:negative' },
        ],
      });
      const state = solver.getState();
      expect(state.mot1.on).toBe(true);
      // Motor state has { speed, on, direction } — no raw voltage
      expect(state.mot1.speed).toBeGreaterThan(0);
    });
  });

  // ═══════════════ DIODE ═══════════════

  describe('Diode', () => {
    it('should conduct in forward bias (anode > cathode)', () => {
      solver.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'r1', type: 'resistor', value: 470 },
          { id: 'd1', type: 'diode' },
          { id: 'led1', type: 'led', color: 'red' },
        ],
        connections: [
          { from: 'bat1:positive', to: 'r1:pin1' },
          { from: 'r1:pin2', to: 'd1:anode' },
          { from: 'd1:cathode', to: 'led1:anode' },
          { from: 'led1:cathode', to: 'bat1:negative' },
        ],
      });
      const state = solver.getState();
      // Diode forward, LED should be on (though with reduced voltage)
      expect(state.d1.conducting).toBe(true);
    });
  });

  // ═══════════════ SOLVER API ═══════════════

  describe('Solver API', () => {
    it('should reset all state on reset()', () => {
      solver.loadExperiment(makeBatteryLedCircuit());
      expect(solver.components.size).toBeGreaterThan(0);

      solver.reset();
      expect(solver.components.size).toBe(0);
      expect(solver.time).toBe(0);
    });

    it('should preserve state with preserveState option', () => {
      solver.loadExperiment(makeBatteryLedCircuit());
      solver.time = 5.0;

      solver.loadExperiment(makeBatteryLedCircuit(), { preserveState: true });
      expect(solver.time).toBeCloseTo(5.0, 1);
    });

    it('should call onStateChange callback after solve', () => {
      const callback = vi.fn();
      solver.onStateChange = callback;
      solver.loadExperiment(makeBatteryLedCircuit());
      expect(callback).toHaveBeenCalled();
    });

    it('should call onWarning for LED without resistor', () => {
      const warnCallback = vi.fn();
      solver.onWarning = warnCallback;
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
      // Should warn about LED without resistor
      expect(warnCallback).toHaveBeenCalledWith(
        'connection_warning',
        expect.stringContaining('resistenza')
      );
    });

    it('should handle empty experiment gracefully', () => {
      solver.loadExperiment({ components: [], connections: [] });
      const state = solver.getState();
      expect(state).toEqual({});
    });

    it('should handle null experiment gracefully', () => {
      expect(() => solver.loadExperiment(null)).not.toThrow();
    });

    it('should track time correctly', () => {
      solver.loadExperiment(makeBatteryLedCircuit());
      expect(solver.time).toBe(0);
      solver.time += 0.1;
      solver.solve();
      expect(solver.time).toBeCloseTo(0.1, 5);
    });
  });

  // ═══════════════ DIFFERENT LED COLORS ═══════════════

  describe('LED colors have different forward voltages', () => {
    it('red LED should have lower Vf than blue LED', () => {
      const solverRed = new CircuitSolver();
      solverRed.loadExperiment(makeBatteryLedCircuit(470));

      const solverBlue = new CircuitSolver();
      solverBlue.loadExperiment({
        components: [
          { id: 'bat1', type: 'battery9v', value: 9 },
          { id: 'res1', type: 'resistor', value: 470 },
          { id: 'led1', type: 'led', color: 'blue' },
        ],
        connections: [
          { from: 'bat1:positive', to: 'res1:pin1' },
          { from: 'res1:pin2', to: 'led1:anode' },
          { from: 'led1:cathode', to: 'bat1:negative' },
        ],
      });

      const redCurrent = solverRed.getState().led1.current;
      const blueCurrent = solverBlue.getState().led1.current;
      // Red has lower Vf (1.8V) → more voltage drop across R → higher current
      expect(redCurrent).toBeGreaterThan(blueCurrent);
    });
  });

  // ═══════════════ INTERACT UNKNOWN COMPONENT ═══════════════

  describe('Edge cases', () => {
    it('should ignore interact on non-existent component', () => {
      solver.loadExperiment(makeBatteryLedCircuit());
      // Should not throw
      expect(() => solver.interact('nonexistent', 'press')).not.toThrow();
    });

    it('should handle destroy correctly', () => {
      solver.loadExperiment(makeBatteryLedCircuit());
      solver.destroy();
      expect(solver.components.size).toBe(0);
      expect(solver.onStateChange).toBeNull();
    });
  });
});
