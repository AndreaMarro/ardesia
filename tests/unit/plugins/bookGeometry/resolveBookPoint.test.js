/**
 * Tests: resolveBookPoint utility
 * Coverage: bb hole resolution, bb rail resolution, generic component pins, edge cases.
 */
import { describe, it, expect } from 'vitest';
import { resolveBookPoint, __resolveBookPointTest } from '../../../../src/plugins/bookGeometry/index.js';

const { resolveBreadboardHole, resolveBreadboardRail, BB_HOLE_PITCH } = __resolveBookPointTest;

const COMPONENTS_FIXTURE = {
  bb1: { type: 'breadboard', x: 100, y: 50 },
  bat1: { type: 'battery9v', x: 30, y: 70 },
  led1: { type: 'led', x: 250, y: 70 },
  r1: { type: 'resistor', x: 200, y: 55, pins: { pin1: { x: 0, y: 0 }, pin2: { x: 38, y: 0 } } },
};

describe('resolveBookPoint — breadboard hole resolution', () => {
  it('risolve foro bb1:a1 a coords origin', () => {
    const result = resolveBookPoint('bb1:a1', COMPONENTS_FIXTURE);
    expect(result).not.toBeNull();
    expect(result.x).toBe(100); // bb1.x + (col-1)*pitch = 100 + 0
    expect(result.y).toBe(50);   // bb1.y + a-row-index*pitch = 50 + 0
  });

  it('risolve foro bb1:e7 con offset corretto', () => {
    const result = resolveBookPoint('bb1:e7', COMPONENTS_FIXTURE);
    expect(result).not.toBeNull();
    expect(result.x).toBe(100 + 6 * BB_HOLE_PITCH); // col 7 = (7-1)*7.5 = 45
    expect(result.y).toBe(50 + 4 * BB_HOLE_PITCH);  // row e index 4
  });

  it('risolve foro bb1:f7 (bottom section dopo gap)', () => {
    const result = resolveBookPoint('bb1:f7', COMPONENTS_FIXTURE);
    expect(result).not.toBeNull();
    expect(result.x).toBe(100 + 6 * BB_HOLE_PITCH);
    // f-row = bottom section, riga 0 + gap
    expect(result.y).toBeGreaterThan(50 + 4 * BB_HOLE_PITCH); // sotto e-row
  });

  it('ritorna null per colonna fuori range', () => {
    expect(resolveBookPoint('bb1:a0', COMPONENTS_FIXTURE)).toBeNull();
    expect(resolveBookPoint('bb1:a31', COMPONENTS_FIXTURE)).toBeNull();
    expect(resolveBookPoint('bb1:a100', COMPONENTS_FIXTURE)).toBeNull();
  });

  it('ritorna null per riga invalida', () => {
    expect(resolveBookPoint('bb1:z7', COMPONENTS_FIXTURE)).toBeNull();
    expect(resolveBookPoint('bb1:1a', COMPONENTS_FIXTURE)).toBeNull();
  });
});

describe('resolveBookPoint — breadboard rail resolution', () => {
  it('risolve topPlusRail-col1', () => {
    const result = resolveBookPoint('bb1:topPlusRail-col1', COMPONENTS_FIXTURE);
    expect(result).not.toBeNull();
    expect(result.x).toBe(100); // col 1 = origin
    expect(result.y).toBeLessThan(50); // top rail sopra section top
  });

  it('risolve bottomMinusRail-col10', () => {
    const result = resolveBookPoint('bb1:bottomMinusRail-col10', COMPONENTS_FIXTURE);
    expect(result).not.toBeNull();
    expect(result.x).toBe(100 + 9 * BB_HOLE_PITCH);
    expect(result.y).toBeGreaterThan(100); // bot rail sotto section bot
  });

  it('ritorna null per rail name invalido', () => {
    expect(resolveBookPoint('bb1:fakeRail-col1', COMPONENTS_FIXTURE)).toBeNull();
  });
});

describe('resolveBookPoint — generic component pins', () => {
  it('risolve bat1:positive', () => {
    const result = resolveBookPoint('bat1:positive', COMPONENTS_FIXTURE);
    expect(result).not.toBeNull();
    expect(result.x).toBe(30 + 70); // bat1.x + 70 (clip right exit)
    expect(result.y).toBe(70 + 10);
  });

  it('risolve bat1:negative', () => {
    const result = resolveBookPoint('bat1:negative', COMPONENTS_FIXTURE);
    expect(result).not.toBeNull();
    expect(result.y).toBe(70 + 30); // sotto positive
  });

  it('risolve led1:anode + cathode con offset divaricate', () => {
    const anode = resolveBookPoint('led1:anode', COMPONENTS_FIXTURE);
    const cathode = resolveBookPoint('led1:cathode', COMPONENTS_FIXTURE);
    expect(anode).not.toBeNull();
    expect(cathode).not.toBeNull();
    expect(cathode.x).toBeGreaterThan(anode.x); // catodo destra di anodo
  });

  it('risolve pin esplicito da component.pins object', () => {
    const result = resolveBookPoint('r1:pin1', COMPONENTS_FIXTURE);
    expect(result).not.toBeNull();
    expect(result.x).toBe(200); // r1.x + pin1.x=0
    expect(result.y).toBe(55);

    const pin2 = resolveBookPoint('r1:pin2', COMPONENTS_FIXTURE);
    expect(pin2).not.toBeNull();
    expect(pin2.x).toBe(200 + 38); // r1.x + pin2.x=38 (5-col span)
  });
});

describe('resolveBookPoint — edge cases', () => {
  it('ritorna null per pinSpec non valido', () => {
    expect(resolveBookPoint(null, COMPONENTS_FIXTURE)).toBeNull();
    expect(resolveBookPoint(undefined, COMPONENTS_FIXTURE)).toBeNull();
    expect(resolveBookPoint('', COMPONENTS_FIXTURE)).toBeNull();
    expect(resolveBookPoint('no-colon', COMPONENTS_FIXTURE)).toBeNull();
  });

  it('ritorna null per components non valido', () => {
    expect(resolveBookPoint('bb1:e7', null)).toBeNull();
    expect(resolveBookPoint('bb1:e7', undefined)).toBeNull();
    expect(resolveBookPoint('bb1:e7', 'not-object')).toBeNull();
  });

  it('ritorna null per componente non trovato', () => {
    expect(resolveBookPoint('nonexistent:pin', COMPONENTS_FIXTURE)).toBeNull();
  });

  it('ritorna null per pin sconosciuto su tipo noto', () => {
    expect(resolveBookPoint('bat1:unknown-pin', COMPONENTS_FIXTURE)).toBeNull();
  });
});

describe('resolveBreadboardHole — unit helpers', () => {
  it('a1 = origin (0,0)', () => {
    expect(resolveBreadboardHole('a1')).toEqual({ x: 0, y: 0 });
  });

  it('a30 = (29*pitch, 0)', () => {
    expect(resolveBreadboardHole('a30')).toEqual({ x: 29 * BB_HOLE_PITCH, y: 0 });
  });

  it('case insensitive', () => {
    expect(resolveBreadboardHole('E7')).toEqual({ x: 6 * BB_HOLE_PITCH, y: 4 * BB_HOLE_PITCH });
  });
});

describe('resolveBreadboardRail — unit helpers', () => {
  it('topPlusRail-col1 sopra section top', () => {
    const r = resolveBreadboardRail('topPlusRail-col1');
    expect(r).not.toBeNull();
    expect(r.y).toBeLessThan(0); // sopra origin (negativo)
  });

  it('bottomMinusRail-col1 sotto section bot', () => {
    const r = resolveBreadboardRail('bottomMinusRail-col1');
    expect(r).not.toBeNull();
    expect(r.y).toBeGreaterThan(0);
  });
});
