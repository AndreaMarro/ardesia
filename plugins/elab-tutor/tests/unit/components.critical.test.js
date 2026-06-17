import { describe, it, expect, beforeEach, vi } from 'vitest';
import CircuitSolver from '../../src/components/simulator/engine/CircuitSolver';

// Mock registry
vi.mock('../../src/components/simulator/components/registry', () => ({
    getComponent: (type) => {
        const definitions = {
            'battery9v': { pins: [{ id: 'positive' }, { id: 'negative' }] },
            'capacitor': { pins: [{ id: 'positive' }, { id: 'negative' }] }, // Fixed pins in prev step
            'resistor': { pins: [{ id: 'pin1' }, { id: 'pin2' }] },
            'led': { pins: [{ id: 'anode' }, { id: 'cathode' }] },
            'mosfet-n': { pins: [{ id: 'gate' }, { id: 'drain' }, { id: 'source' }] },
            'potentiometer': { pins: [{ id: 'gnd' }, { id: 'vcc' }, { id: 'wiper' }] }, // Correct pin names?
            'ground': { pins: [] }
        };
        return definitions[type] || { pins: [] };
    }
}));

describe('Critical Components Logic', () => {
    let solver;

    beforeEach(() => {
        solver = new CircuitSolver();
    });

    // 1. CAPACITOR: Time Constant & Units
    it('Capacitor: should use uF units and enforce min educational tau', () => {
        // 1000uF capacitor + very small resistor (effectively wire)
        // Value 1000 in UI means 1000uF = 1000 * 1e-6 F = 0.001 F
        // R is small -> solver uses min R = 0.1 ohm
        // Raw Tau = R * C = 0.1 * 0.001 = 0.0001 seconds
        // BUT the solver enforces MIN_EDUCATIONAL_TAU = 0.3s so kids can see
        // the charge/discharge animation. So effective tau = max(0.0001, 0.3) = 0.3
        const exp = {
            components: [
                { id: 'bat', type: 'battery9v', value: 9 },
                { id: 'cap', type: 'capacitor', value: 1000 },
                { id: 'wireR', type: 'resistor', value: 0.01 } // < 0.1
            ],
            connections: [
                { from: 'bat:positive', to: 'wireR:pin1' },
                { from: 'wireR:pin2', to: 'cap:positive' },
                { from: 'cap:negative', to: 'bat:negative' }
            ]
        };

        solver.loadExperiment(exp);
        // Step the simulation explicitly to allow voltage to rise
        solver.time += 0.5;
        solver.solve(true);

        const capState = solver.getState()['cap'];
        // Effective tau is clamped to MIN_EDUCATIONAL_TAU = 0.3s
        expect(capState.tau).toBeCloseTo(0.3, 2);
        // Capacitor should still charge toward battery voltage
        expect(capState.voltage).toBeGreaterThan(0); // Charging has started
    });

    // 2. MOSFET: Floating Gate Discharge
    it('MOSFET: should discharge floating gate', () => {
        // Gate connected to nothing (floating)
        const exp = {
            components: [
                { id: 'bat', type: 'battery9v', value: 9 },
                { id: 'mosfet', type: 'mosfet-n' },
                { id: 'led', type: 'led', color: 'red' }
            ],
            connections: [
                { from: 'bat:positive', to: 'led:anode' },
                { from: 'led:cathode', to: 'mosfet:drain' },
                { from: 'mosfet:source', to: 'bat:negative' }
                // Gate floating
            ]
        };

        solver.loadExperiment(exp);

        // Manually charge gate (simulate touch interaction)
        solver.interact('mosfet', 'touchGate');
        let mosState = solver.getState()['mosfet'];
        expect(mosState.vgs).toBeGreaterThan(2.0); // Charged
        expect(mosState.on).toBe(true);

        // Release gate -> floating
        solver.interact('mosfet', 'releaseGate');

        // Step simulation - should decay
        const dt = 0.01;
        for (let i = 0; i < 10; i++) {
            solver.time += dt;
            solver.solve();
        }

        mosState = solver.getState()['mosfet'];
        // It should decay towards 0. Since we used 0.9 multiplier per frame? 
        // Wait, solve() might run multiple times?
        // Let's just check it decreased.
        expect(mosState.vgs).toBeLessThan(0.01);
        expect(mosState.on).toBe(false);
    });

    // 3. LED: Burnout Logic
    it('LED: should burn if connected directly to battery (no resistor)', () => {
        const exp = {
            components: [
                { id: 'bat', type: 'battery9v', value: 9 },
                { id: 'led', type: 'led', color: 'red' }
            ],
            connections: [
                { from: 'bat:positive', to: 'led:anode' },
                { from: 'led:cathode', to: 'bat:negative' }
            ]
        };

        solver.loadExperiment(exp);
        const ledState = solver.getState()['led'];

        expect(ledState.burned).toBe(true);
        expect(ledState.brightness).toBe(0);
        expect(ledState.current).toBeGreaterThan(0.02); // > 20mA
        expect(ledState.voltage).toBeCloseTo(1.8, 1); // Vf (red)
    });

    // 4. POTENTIOMETER: Polarity
    it('Potentiometer: should handle reversed polarity', () => {
        // Potentiometer connected to 9V but VCC/GND swapped
        // Gnd -> Positive, Vcc -> Negative
        const exp = {
            components: [
                { id: 'bat', type: 'battery9v', value: 9 },
                { id: 'pot', type: 'potentiometer', value: 10000 }
            ],
            connections: [
                { from: 'bat:positive', to: 'pot:gnd' }, // Swapped
                { from: 'bat:negative', to: 'pot:vcc' }  // Swapped
            ]
        };

        solver.loadExperiment(exp);

        // Wipe at 0.0 -> Should be at pot:gnd voltage (9V)
        solver.interact('pot', 0.0);
        expect(solver.getState()['pot'].signalVoltage).toBeCloseTo(9, 1);

        // Wipe at 1.0 -> Should be at pot:vcc voltage (0V)
        solver.interact('pot', 1.0);
        expect(solver.getState()['pot'].signalVoltage).toBeCloseTo(0, 1);

        // Wipe at 0.5 -> Should be 4.5V
        solver.interact('pot', 0.5);
        expect(solver.getState()['pot'].signalVoltage).toBeCloseTo(4.5, 1);
    });
});
