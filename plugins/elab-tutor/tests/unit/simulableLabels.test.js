/**
 * Simulable Labels — Verifica etichette per esperimenti non simulabili
 * Audit parità: 14 esperimenti richiedono componenti fisici non nel simulatore
 * (c) Andrea Marro — 11/04/2026
 */

import { describe, test, expect } from 'vitest';

// Import experiment data
const vol1 = await import('../../src/data/experiments-vol1.js');
const vol2 = await import('../../src/data/experiments-vol2.js');
const vol3 = await import('../../src/data/experiments-vol3.js');

function getAllExperiments() {
  const all = [];
  [vol1, vol2, vol3].forEach(mod => {
    const exp = mod.default || mod.experiments || [];
    if (Array.isArray(exp)) all.push(...exp);
    else if (exp && typeof exp === 'object') {
      Object.values(exp).forEach(v => {
        if (Array.isArray(v)) all.push(...v);
      });
    }
  });
  return all;
}

describe('Simulable Labels', () => {
  const experiments = getAllExperiments();

  test('at least 14 experiments marked as simulable: false', () => {
    const nonSimulable = experiments.filter(e => e.simulable === false);
    expect(nonSimulable.length).toBeGreaterThanOrEqual(14);
  });

  test('all non-simulable experiments have a simulableReason', () => {
    const nonSimulable = experiments.filter(e => e.simulable === false);
    nonSimulable.forEach(e => {
      expect(e.simulableReason, `${e.id} missing simulableReason`).toBeTruthy();
    });
  });

  test('Vol2 Cap3 experiments require multimetro', () => {
    const cap3 = experiments.filter(e => e.id?.startsWith('v2-cap3'));
    cap3.forEach(e => {
      expect(e.simulable, `${e.id} should be non-simulable`).toBe(false);
      expect(e.simulableReason).toContain('multimetro');
    });
  });

  test('Vol2 Cap10 experiments require motore DC', () => {
    const cap10 = experiments.filter(e => e.id?.startsWith('v2-cap10'));
    cap10.forEach(e => {
      expect(e.simulable, `${e.id} should be non-simulable`).toBe(false);
      expect(e.simulableReason).toContain('motore');
    });
  });

  test('Vol1 Cap13 experiments require elettropongo', () => {
    const cap13 = experiments.filter(e => e.id?.startsWith('v1-cap13'));
    cap13.forEach(e => {
      expect(e.simulable, `${e.id} should be non-simulable`).toBe(false);
      expect(e.simulableReason).toContain('elettropongo');
    });
  });

  test('Vol1 Cap14 experiment requires robot', () => {
    const cap14 = experiments.filter(e => e.id?.startsWith('v1-cap14'));
    cap14.forEach(e => {
      expect(e.simulable, `${e.id} should be non-simulable`).toBe(false);
      expect(e.simulableReason).toContain('robot');
    });
  });

  test('simulable experiments do NOT have simulable: false', () => {
    const vol1Simulable = experiments.filter(e =>
      e.id?.startsWith('v1-cap6') || e.id?.startsWith('v1-cap7') || e.id?.startsWith('v1-cap8')
    );
    vol1Simulable.forEach(e => {
      expect(e.simulable, `${e.id} should be simulable (or undefined)`).not.toBe(false);
    });
  });

  test('Vol3 Arduino experiments are all simulable (no physical-only)', () => {
    const vol3Exps = experiments.filter(e => e.id?.startsWith('v3-'));
    const nonSimVol3 = vol3Exps.filter(e => e.simulable === false);
    expect(nonSimVol3.length).toBe(0);
  });
});
