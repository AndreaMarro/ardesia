import { describe, it, expect, beforeEach, vi } from 'vitest';
import CircuitSolver from '../../src/components/simulator/engine/CircuitSolver';

// Mock registry to avoid UI dependencies and ensure deterministic pin definitions
vi.mock('../../src/components/simulator/components/registry', () => ({
    getComponent: (type) => {
        const definitions = {
            'battery9v': { pins: [{ id: 'positive' }, { id: 'negative' }] },
            'capacitor': { pins: [{ id: 'positive' }, { id: 'negative' }] },
            'resistor': { pins: [{ id: 'pin1' }, { id: 'pin2' }] },
            'led': { pins: [{ id: 'anode' }, { id: 'cathode' }] }
        };
        return definitions[type] || { pins: [] };
    }
}));

describe('CircuitSolver State Preservation', () => {
    let solver;

    beforeEach(() => {
        solver = new CircuitSolver();
    });

    const createRCExperiment = () => ({
        id: 'test-rc',
        components: [
            { id: 'bat1', type: 'battery9v', value: 9 }, // 9V
            { id: 'res1', type: 'resistor', value: 1000 }, // 1k
            { id: 'cap1', type: 'capacitor', value: 1000 }, // 1000uF (RC = 1s)
            { id: 'ground', type: 'ground' } // Not always needed but good practice if solver expects it
        ],
        connections: [
            { from: 'bat1:positive', to: 'res1:pin1' },
            { from: 'res1:pin2', to: 'cap1:positive' },
            { from: 'cap1:negative', to: 'bat1:negative' }
        ]
    });

    it('should preserve simulation time and component state when preserveState is true', () => {
        // 1. Load initial circuit
        solver.loadExperiment(createRCExperiment());

        // 2. Advance time (simulate charging)
        const dt = 0.01; // 10ms
        for (let i = 0; i < 10; i++) {
            solver.time += dt;
            solver.solve(true);
        }

        // Wait a bit more to ensure voltage rises enough to be safely > 0
        solver.time += 0.1;
        solver.solve(true);

        const timeAfterRun = solver.time;
        const capState = solver.getState()['cap1'];

        expect(timeAfterRun).toBeGreaterThan(0.19); // Approx 0.2s
        expect(capState.voltage).toBeGreaterThan(0); // Should have charged somewhat
        const voltageBefore = capState.voltage;

        // 3. Reload with preserveState: true (simulating a move/edit)
        // We'll add a dummy component to ensure it's "changed" but keeping old ones
        const experiment2 = createRCExperiment();
        experiment2.components.push({ id: 'res2', type: 'resistor', value: 100 });
        // Just floating, no connections

        solver.loadExperiment(experiment2, { preserveState: true });

        // 4. Verify State
        // Since loadExperiment calls solve(), it might advance the capacitor state slightly (one dt step).
        // So expect voltage to be >= voltageBefore, demonstrating continuity.
        expect(solver.time).toBeCloseTo(timeAfterRun, 5); // Time should be preserved
        const capStateAfter = solver.getState()['cap1'];
        expect(capStateAfter.voltage).toBeGreaterThanOrEqual(voltageBefore);

        // 5. Verify Resistor 2 exists
        const res2State = solver.getState()['res2'];
        expect(res2State).toBeDefined();

        // 6. Advance time further
        solver.time += dt;
        solver.solve(true);
        expect(solver.time).toBeGreaterThan(timeAfterRun);
        expect(solver.getState()['cap1'].voltage).toBeGreaterThan(capStateAfter.voltage);
    });

    it('should reset state when preserveState is false (default)', () => {
        // 1. Load & Run
        solver.loadExperiment(createRCExperiment());
        for (let i = 0; i < 5; i++) {
            solver.time += 0.01;
            solver.solve(true);
        }

        const timeBefore = solver.time;
        expect(timeBefore).toBeGreaterThan(0);

        // 2. Reload without option
        solver.loadExperiment(createRCExperiment());

        // 3. Verify Reset
        expect(solver.time).toBe(0);
        const capState = solver.getState()['cap1'];
        // It might be slightly > 0 due to initial solve() step in loadExperiment
        // but should be much less than the charged state (e.g. < 1V vs 2-3V)
        expect(capState.voltage).toBeLessThan(1.0);
    });
});
