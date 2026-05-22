import { describe, it, expect } from 'vitest';
import { shouldAutoOpenCodeEditor } from '../../../../src/components/simulator/NewElabSimulator.jsx';

describe('NewElabSimulator AVR compile UI policy', () => {
  it('auto-opens the code/compile shell for every AVR experiment', () => {
    expect(shouldAutoOpenCodeEditor({ id: 'v3-cap5-esp1', simulationMode: 'avr' })).toBe(true);
    expect(shouldAutoOpenCodeEditor({ id: 'custom-arduino', simulationMode: 'avr' })).toBe(true);
  });

  it('does not auto-open the code/compile shell for circuit-only experiments', () => {
    expect(shouldAutoOpenCodeEditor({ id: 'v1-cap6-esp1', simulationMode: 'circuit' })).toBe(false);
    expect(shouldAutoOpenCodeEditor(null)).toBe(false);
  });
});
