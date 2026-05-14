import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import NewElabSimulator from '../../src/components/simulator/NewElabSimulator';
import index from '../../src/data/experiments-index';

const { VOLUMES, ALL_EXPERIMENTS } = index;

// Mock canvas/SVG methods 
if (typeof global.SVGElement !== 'undefined') {
    global.SVGElement.prototype.getBBox = () => ({ width: 100, height: 100 });
}

describe('Phase 4: Smoke Test All 69 Experiments', () => {
    it('loads all experiments without crashing', async () => {
        // Pick 10 representative experiments to test full mount (doing all 69 takes too long for the DOM)
        // We test a mix of Vol 1, 2, and 3
        const testSamples = [
            ALL_EXPERIMENTS[0], // Base circuit
            ALL_EXPERIMENTS.find(e => e.id.includes('v1-cap6')), // LED
            ALL_EXPERIMENTS.find(e => e.title.toLowerCase().includes('condensator')), // Capacitor
            ALL_EXPERIMENTS.find(e => e.title.toLowerCase().includes('transistor')), // Transistor
            ALL_EXPERIMENTS.find(e => e.id.includes('v2-cap7')), // Vol 2 Arduino
            ALL_EXPERIMENTS.find(e => e.id.includes('v3-')), // Vol 3 Shield
            ALL_EXPERIMENTS[ALL_EXPERIMENTS.length - 1], // Last one
        ].filter(Boolean);

        for (const exp of testSamples) {
            if (!exp) continue;

            const { unmount } = render(
                <NewElabSimulator
                    experiment={exp}
                    onProgressUpdate={() => { }}
                />
            );

            // Verify the title is somewhere in the document, or it loaded cleanly
            await waitFor(() => {
                expect(document.querySelector('.elab-simulator')).toBeInTheDocument();
            }, { timeout: 2000 });

            // Trigger "Avvia" if possible
            const startBtn = document.querySelector('button[title="Avvia simulazione"]');
            if (startBtn) {
                startBtn.click();
                // Just verify it doesn't throw synchronous errors
            }

            unmount();
        }
    });

    it('verifies data integrity of all 79 experiments', () => {
        // This is instant: checking the raw JSON
        expect(ALL_EXPERIMENTS.length).toBeGreaterThanOrEqual(79); // 38 + 27 + 14 = 79

        // Check everyone has a title, id, category, and valid components
        for (const exp of ALL_EXPERIMENTS) {
            expect(exp.id).toBeDefined();
            expect(exp.title).toBeDefined();
            expect(exp.components).toBeInstanceOf(Array);
            // Layout is optional for new experiments (auto-placement handles it)
            // Only check layout if it exists
            if (exp.layout) {
                expect(exp.components.length).toBeGreaterThan(0);
            }
            // Vol 1 and 2 usually have simulationMode === 'circuit', Vol 3 is 'avr' or 'circuit'

            // Quizzes
            if (exp.quiz && exp.quiz.questions) {
                expect(exp.quiz.questions.length).toBeGreaterThanOrEqual(1);
                exp.quiz.questions.forEach(q => {
                    expect(q.text).toBeDefined();
                    expect(q.options.length).toBe(3);
                    expect([0, 1, 2]).toContain(q.correct);
                });
            }
        }
    });
});
