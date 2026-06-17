/**
 * UNLIM Slice 1A — test del modulo awareness-flags.
 * Spec: docs/superpowers/specs/2026-05-21-unlim-context-engineering-overhaul-design.md §7.2
 */
import { describe, it, expect } from 'vitest';
import {
  computeAwarenessFlags,
  renderAwarenessFlags,
  AWARENESS_FLAGS_VERSION,
} from '../../supabase/functions/_shared/awareness-flags.ts';

describe('computeAwarenessFlags — scaffold e input degeneri', () => {
  it('torna un oggetto con tutti gli 8 flag spenti su input null', () => {
    const f = computeAwarenessFlags(null, null, null, false);
    expect(f).toEqual({
      circuit_changed: false,
      drawing_changed: false,
      vision_needed: false,
      circuit_error: false,
      experiment_changed: false,
      step_changed: false,
      compile_status: null,
      returning_class: false,
    });
  });

  it('non lancia su input garbage', () => {
    expect(() => computeAwarenessFlags(42, 'x', {}, undefined)).not.toThrow();
  });

  it('non lancia su undefined ovunque', () => {
    expect(() => computeAwarenessFlags(undefined, undefined, undefined, undefined)).not.toThrow();
  });
});

describe('computeAwarenessFlags — flag confronto-col-precedente', () => {
  const base = {
    circuit: { components: [{ id: 'led1', type: 'led' }], connections: [] },
    experimentId: 'v1-cap6-esp1',
    step: 1,
    drawingHash: 'h1',
  };

  it('circuit_changed=false al primo turno (previous null)', () => {
    expect(computeAwarenessFlags(base, null, '', false).circuit_changed).toBe(false);
  });

  it('circuit_changed=true se i componenti cambiano', () => {
    const next = {
      ...base,
      circuit: {
        components: [{ id: 'led1', type: 'led' }, { id: 'r1', type: 'resistor' }],
        connections: [],
      },
    };
    expect(computeAwarenessFlags(next, base, '', false).circuit_changed).toBe(true);
  });

  it('circuit_changed=false se gli stessi componenti sono in ordine diverso', () => {
    const a = {
      ...base,
      circuit: {
        components: [{ id: 'led1', type: 'led' }, { id: 'r1', type: 'resistor' }],
        connections: [],
      },
    };
    const b = {
      ...base,
      circuit: {
        components: [{ id: 'r1', type: 'resistor' }, { id: 'led1', type: 'led' }],
        connections: [],
      },
    };
    expect(computeAwarenessFlags(a, b, '', false).circuit_changed).toBe(false);
  });

  it('experiment_changed=true se cambia experimentId', () => {
    const next = { ...base, experimentId: 'v1-cap7-esp1' };
    expect(computeAwarenessFlags(next, base, '', false).experiment_changed).toBe(true);
  });

  it('step_changed=true se cambia lo step', () => {
    const next = { ...base, step: 2 };
    expect(computeAwarenessFlags(next, base, '', false).step_changed).toBe(true);
  });

  it('drawing_changed=true se cambia il drawingHash', () => {
    const next = { ...base, drawingHash: 'h2' };
    expect(computeAwarenessFlags(next, base, '', false).drawing_changed).toBe(true);
  });

  it('drawing_changed=false se il drawingHash è identico', () => {
    expect(computeAwarenessFlags(base, base, '', false).drawing_changed).toBe(false);
  });
});

describe('computeAwarenessFlags — flag stato-corrente', () => {
  it('circuit_error=true se circuit.errors non è vuoto', () => {
    const cur = { circuit: { components: [], connections: [], errors: ['LED spento'] } };
    expect(computeAwarenessFlags(cur, null, '', false).circuit_error).toBe(true);
  });

  it('circuit_error=false se errors è vuoto o assente', () => {
    expect(computeAwarenessFlags({ circuit: { errors: [] } }, null, '', false).circuit_error).toBe(false);
    expect(computeAwarenessFlags({ circuit: {} }, null, '', false).circuit_error).toBe(false);
  });

  it('compile_status riflette lo stato di compilazione', () => {
    expect(computeAwarenessFlags({ compileStatus: 'error' }, null, '', false).compile_status).toBe('error');
    expect(computeAwarenessFlags({ compileStatus: 'ok' }, null, '', false).compile_status).toBe('ok');
    expect(computeAwarenessFlags({}, null, '', false).compile_status).toBe(null);
  });

  it('returning_class=true se hasClassMemory è true', () => {
    expect(computeAwarenessFlags({}, null, '', true).returning_class).toBe(true);
    expect(computeAwarenessFlags({}, null, '', false).returning_class).toBe(false);
  });
});

describe('computeAwarenessFlags — vision_needed (routing)', () => {
  it("vision_needed=true se l'utente nomina la lavagna", () => {
    expect(computeAwarenessFlags({}, null, 'guarda la lavagna', false).vision_needed).toBe(true);
  });

  it('vision_needed=true per "rispondi alla domanda scritta"', () => {
    expect(computeAwarenessFlags({}, null, 'rispondi alla domanda scritta', false).vision_needed).toBe(true);
  });

  it('vision_needed=true se il disegno è cambiato', () => {
    const prev = { drawingHash: 'h1' };
    const cur = { drawingHash: 'h2' };
    expect(computeAwarenessFlags(cur, prev, 'ciao', false).vision_needed).toBe(true);
  });

  it('vision_needed=false per un messaggio normale senza disegno cambiato', () => {
    expect(computeAwarenessFlags({}, null, "cos'è un LED?", false).vision_needed).toBe(false);
  });
});

describe('renderAwarenessFlags', () => {
  function flagsWith(overrides) {
    return {
      circuit_changed: false,
      drawing_changed: false,
      vision_needed: false,
      circuit_error: false,
      experiment_changed: false,
      step_changed: false,
      compile_status: null,
      returning_class: false,
      ...overrides,
    };
  }

  it('torna stringa vuota se nessun flag narrabile è attivo', () => {
    expect(renderAwarenessFlags(flagsWith({}), {})).toBe('');
  });

  it('rende circuit_changed col prefisso "Segnali di attenzione:"', () => {
    const out = renderAwarenessFlags(flagsWith({ circuit_changed: true }), {});
    expect(out).toMatch(/^Segnali di attenzione:/);
    expect(out).toContain('il circuito è cambiato');
  });

  it('rende circuit_error col dettaglio degli errori', () => {
    const cur = { circuit: { errors: ['LED spento', 'GND mancante'] } };
    const out = renderAwarenessFlags(flagsWith({ circuit_error: true }), cur);
    expect(out).toContain('problema rilevato');
    expect(out).toContain('LED spento');
  });

  it('NON rende vision_needed (è solo routing)', () => {
    expect(renderAwarenessFlags(flagsWith({ vision_needed: true }), {})).toBe('');
  });

  it('non lancia su flags null e torna stringa vuota', () => {
    expect(() => renderAwarenessFlags(null, null)).not.toThrow();
    expect(renderAwarenessFlags(null, null)).toBe('');
  });

  it('AWARENESS_FLAGS_VERSION è una stringa definita', () => {
    expect(typeof AWARENESS_FLAGS_VERSION).toBe('string');
    expect(AWARENESS_FLAGS_VERSION.length).toBeGreaterThan(0);
  });
});
