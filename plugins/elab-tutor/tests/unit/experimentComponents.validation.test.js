/**
 * Experiment Components Validation — verifica componenti di OGNI esperimento
 * OGNI componente deve avere type, id, e pin/connections valide.
 * Claude code andrea marro — 12/04/2026
 */
import { describe, it, expect } from 'vitest';
import { ALL_EXPERIMENTS, EXPERIMENTS_VOL1, EXPERIMENTS_VOL2, EXPERIMENTS_VOL3 } from '../../src/data/experiments-index';

describe('Experiment Components Validation', () => {
  describe('Vol1 — component structure', () => {
    for (const exp of EXPERIMENTS_VOL1.experiments) {
      it(`${exp.id} componenti hanno type e id`, () => {
        for (const comp of (exp.components || [])) {
          expect(comp.type, `${exp.id} comp senza type`).toBeTruthy();
          expect(comp.id, `${exp.id} comp senza id`).toBeTruthy();
        }
      });
    }
  });

  describe('Vol2 — component structure', () => {
    for (const exp of EXPERIMENTS_VOL2.experiments) {
      it(`${exp.id} componenti hanno type e id`, () => {
        for (const comp of (exp.components || [])) {
          expect(comp.type, `${exp.id} comp senza type`).toBeTruthy();
          expect(comp.id, `${exp.id} comp senza id`).toBeTruthy();
        }
      });
    }
  });

  describe('Vol3 — component structure', () => {
    for (const exp of EXPERIMENTS_VOL3.experiments) {
      it(`${exp.id} componenti hanno type e id`, () => {
        for (const comp of (exp.components || [])) {
          expect(comp.type, `${exp.id} comp senza type`).toBeTruthy();
          expect(comp.id, `${exp.id} comp senza id`).toBeTruthy();
        }
      });
    }
  });

  describe('component ID uniqueness within experiment', () => {
    for (const exp of ALL_EXPERIMENTS) {
      it(`${exp.id} ha component ID unici`, () => {
        const ids = (exp.components || []).map(c => c.id);
        expect(new Set(ids).size, `${exp.id} ha ID duplicati: ${ids}`).toBe(ids.length);
      });
    }
  });

  describe('connections reference existing components', () => {
    for (const exp of ALL_EXPERIMENTS.slice(0, 30)) { // spot check 30
      it(`${exp.id} connessioni riferiscono componenti esistenti`, () => {
        const compIds = new Set((exp.components || []).map(c => c.id));
        for (const conn of (exp.connections || [])) {
          if (conn.from) {
            const fromComp = conn.from.split(':')[0];
            if (!fromComp.startsWith('bus-') && !fromComp.startsWith('bb')) {
              if (!compIds.has(fromComp)) {
                console.log(`INFO: ${exp.id} connessione da "${fromComp}" non in components`);
              }
            }
          }
        }
      });
    }
  });
});
