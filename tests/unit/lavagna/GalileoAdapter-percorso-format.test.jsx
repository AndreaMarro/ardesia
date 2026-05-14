import { describe, it, expect } from 'vitest';
import { __test__ } from '../../../src/components/lavagna/GalileoAdapter.jsx';

describe('GalileoAdapter percorso text formatting', () => {
  it('formats object-based common mistakes and analogies instead of rendering [object Object]', () => {
    const text = __test__.formatPercorsoExtra([
      { error: 'LED invertito', fix: 'Controllare anodo e catodo' },
      { text: 'Arduino e come un vigile che regola il traffico.' },
      'Resistenza in serie',
    ]);

    expect(text).toContain('LED invertito');
    expect(text).toContain('Controllare anodo e catodo');
    expect(text).toContain('Arduino e come un vigile');
    expect(text).toContain('Resistenza in serie');
    expect(text).not.toContain('[object Object]');
  });
});
