/**
 * UNLIM Slice 1A — copertura aggiuntiva del modulo awareness-flags.
 *
 * Complementa `tests/unit/awareness-flags.test.js`: copre rami della logica
 * NON esercitati dallo scaffold originale —
 *   - firma del circuito sul lato CONNESSIONI (non solo componenti)
 *   - confronto circuito quando un lato è null
 *   - guardia asimmetrica di `drawing_changed` (disegno cancellato)
 *   - equivalenza nullish di experimentId/step (undefined vs null, step 0)
 *   - copertura per-parola della regex VISION_MENTION_RE + case-insensitività
 *   - rendering dei dettagli in renderAwarenessFlags (esperimento, step, compile)
 *   - troncamento errori a 3 (.slice(0, 3)) + join multi-flag
 *   - ramo difensivo: circuit.errors non-array
 *
 * Spec: docs/superpowers/specs/2026-05-21-unlim-context-engineering-overhaul-design.md §7.2
 */
import { describe, it, expect } from 'vitest';
import {
  computeAwarenessFlags,
  renderAwarenessFlags,
} from '../../supabase/functions/_shared/awareness-flags.ts';

// Costruisce un set completo di flag con override puntuali.
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

describe('computeAwarenessFlags — firma circuito sul lato connessioni', () => {
  it('circuit_changed=true se cambiano SOLO le connessioni (componenti identici)', () => {
    const comps = [{ id: 'led1', type: 'led' }];
    const prev = { circuit: { components: comps, connections: [{ from: 'a', to: 'b' }] } };
    const cur = { circuit: { components: comps, connections: [{ from: 'a', to: 'c' }] } };
    expect(computeAwarenessFlags(cur, prev, '', false).circuit_changed).toBe(true);
  });

  it('circuit_changed=false se le STESSE connessioni sono in ordine diverso', () => {
    const comps = [{ id: 'led1', type: 'led' }];
    const a = {
      circuit: {
        components: comps,
        connections: [{ from: 'a', to: 'b' }, { from: 'c', to: 'd' }],
      },
    };
    const b = {
      circuit: {
        components: comps,
        connections: [{ from: 'c', to: 'd' }, { from: 'a', to: 'b' }],
      },
    };
    expect(computeAwarenessFlags(a, b, '', false).circuit_changed).toBe(false);
  });

  it('circuit_changed=true quando un turno ha circuit:null e l\'altro un circuito reale', () => {
    const prev = { circuit: null };
    const cur = { circuit: { components: [{ id: 'led1', type: 'led' }], connections: [] } };
    expect(computeAwarenessFlags(cur, prev, '', false).circuit_changed).toBe(true);
  });
});

describe('computeAwarenessFlags — guardia asimmetrica di drawing_changed', () => {
  it('drawing_changed=false se il disegno viene cancellato (hash corrente null, precedente valorizzato)', () => {
    // La guardia `curHash && curHash !== prevHash` ignora la transizione verso null.
    const prev = { drawingHash: 'h1' };
    const cur = { drawingHash: null };
    expect(computeAwarenessFlags(cur, prev, '', false).drawing_changed).toBe(false);
  });

  it('drawing_changed=true alla prima comparsa di un disegno (precedente senza hash)', () => {
    const prev = { drawingHash: null };
    const cur = { drawingHash: 'h1' };
    expect(computeAwarenessFlags(cur, prev, '', false).drawing_changed).toBe(true);
  });
});

describe('computeAwarenessFlags — equivalenza nullish di experimentId e step', () => {
  it('experiment_changed=false se experimentId è undefined da un lato e null dall\'altro', () => {
    const prev = { experimentId: null };
    const cur = {}; // experimentId undefined → `?? null` lo normalizza a null
    expect(computeAwarenessFlags(cur, prev, '', false).experiment_changed).toBe(false);
  });

  it('step_changed=true quando lo step passa da null a 0 (0 è falsy ma valido)', () => {
    const prev = { step: null };
    const cur = { step: 0 };
    expect(computeAwarenessFlags(cur, prev, '', false).step_changed).toBe(true);
  });

  it('step_changed=false quando lo step resta 0 su entrambi i turni', () => {
    expect(computeAwarenessFlags({ step: 0 }, { step: 0 }, '', false).step_changed).toBe(false);
  });
});

describe('computeAwarenessFlags — copertura per-parola di VISION_MENTION_RE', () => {
  it.each([
    ['disegno', 'puoi vedere il mio disegno?'],
    ['scarabocchio', 'ho fatto uno scarabocchio'],
    ['schizzo', 'guarda questo schizzo veloce'],
    ['scritto', 'leggi quello che ho scritto'],
    ['sullo schermo', "c'è qualcosa sullo schermo"],
    ['COSA VEDI maiuscolo', 'DIMMI COSA VEDI'],
  ])('vision_needed=true per messaggio contenente %s', (_label, msg) => {
    expect(computeAwarenessFlags({}, null, msg, false).vision_needed).toBe(true);
  });

  it('vision_needed=false per un messaggio che non nomina la lavagna', () => {
    expect(computeAwarenessFlags({}, null, 'come collego il pin D13?', false).vision_needed).toBe(false);
  });
});

describe('computeAwarenessFlags — circuit_error difensivo', () => {
  it('circuit_error=false se circuit.errors è presente ma non è un array (stringa)', () => {
    const cur = { circuit: { components: [], connections: [], errors: 'errore singolo' } };
    expect(computeAwarenessFlags(cur, null, '', false).circuit_error).toBe(false);
  });
});

describe('renderAwarenessFlags — rendering dei dettagli', () => {
  it('rende experiment_changed con l\'id dell\'esperimento corrente', () => {
    const out = renderAwarenessFlags(
      flagsWith({ experiment_changed: true }),
      { experimentId: 'v1-cap7-esp1' },
    );
    expect(out).toContain('esperimento cambiato');
    expect(out).toContain('v1-cap7-esp1');
  });

  it('rende step_changed con il numero di step corrente (incluso step 0)', () => {
    const out = renderAwarenessFlags(flagsWith({ step_changed: true }), { step: 0 });
    expect(out).toContain('passo cambiato');
    expect(out).toContain('step 0');
  });

  it('rende compile_status="error" e compile_status="ok" con frasi distinte', () => {
    const errOut = renderAwarenessFlags(flagsWith({ compile_status: 'error' }), {});
    const okOut = renderAwarenessFlags(flagsWith({ compile_status: 'ok' }), {});
    expect(errOut).toContain('compilazione ha dato errore');
    expect(okOut).toContain('compilazione è andata a buon fine');
  });

  it('rende drawing_changed e returning_class', () => {
    const out = renderAwarenessFlags(
      flagsWith({ drawing_changed: true, returning_class: true }),
      {},
    );
    expect(out).toContain('il disegno sulla lavagna è cambiato');
    expect(out).toContain('questa classe ha già fatto lezioni in precedenza');
  });

  it('tronca il dettaglio circuit_error ai primi 3 errori', () => {
    const cur = { circuit: { errors: ['E1', 'E2', 'E3', 'E4', 'E5'] } };
    const out = renderAwarenessFlags(flagsWith({ circuit_error: true }), cur);
    expect(out).toContain('E1');
    expect(out).toContain('E3');
    expect(out).not.toContain('E4');
    expect(out).not.toContain('E5');
  });

  it('unisce più flag attivi con "; " e chiude la frase con un punto', () => {
    const out = renderAwarenessFlags(
      flagsWith({ circuit_changed: true, returning_class: true }),
      {},
    );
    expect(out).toMatch(/^Segnali di attenzione: /);
    expect(out.endsWith('.')).toBe(true);
    expect(out.split('; ').length).toBe(2);
  });
});
