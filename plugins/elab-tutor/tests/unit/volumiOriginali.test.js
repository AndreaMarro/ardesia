/**
 * volumiOriginali — Tests for parity between volume text files and app data
 * Principio Zero: il software DEVE rispecchiare i volumi cartacei.
 * Claude code andrea marro — 12/04/2026
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ALL_EXPERIMENTS, EXPERIMENTS_VOL1, EXPERIMENTS_VOL2, EXPERIMENTS_VOL3 } from '../../src/data/experiments-index';

const VOL1_TEXT = fs.readFileSync(path.resolve('docs/volumi-originali/VOLUME-1-TESTO.txt'), 'utf8');
const VOL2_TEXT = fs.readFileSync(path.resolve('docs/volumi-originali/VOLUME-2-TESTO.txt'), 'utf8');
const VOL3_TEXT = fs.readFileSync(path.resolve('docs/volumi-originali/VOLUME-3-TESTO.txt'), 'utf8');

describe('Parita Volumi Originali <-> App', () => {
  describe('Volume 1 — structure', () => {
    it('Vol1 text file exists and is substantial', () => {
      expect(VOL1_TEXT.length).toBeGreaterThan(5000);
    });

    it('Vol1 text mentions all chapters from Cap 6 to Cap 14', () => {
      for (let i = 6; i <= 14; i++) {
        const pattern = new RegExp(`capitolo\\s+${i}`, 'i');
        expect(VOL1_TEXT).toMatch(pattern);
      }
    });

    it('Vol1 text mentions LED', () => {
      expect(VOL1_TEXT.toLowerCase()).toContain('led');
    });

    it('Vol1 text mentions resistore/resistenza', () => {
      expect(VOL1_TEXT.toLowerCase()).toMatch(/resistore|resistenza/);
    });

    it('Vol1 text mentions breadboard', () => {
      expect(VOL1_TEXT.toLowerCase()).toContain('breadboard');
    });

    it('Vol1 text mentions pulsante', () => {
      expect(VOL1_TEXT.toLowerCase()).toContain('pulsante');
    });

    it('Vol1 text mentions potenziometro', () => {
      expect(VOL1_TEXT.toLowerCase()).toContain('potenziometro');
    });

    it('Vol1 text mentions fotoresistore/fotoresistenza', () => {
      expect(VOL1_TEXT.toLowerCase()).toMatch(/fotoresistore|fotoresistenza/);
    });

    it('Vol1 text mentions cicalino/buzzer', () => {
      expect(VOL1_TEXT.toLowerCase()).toMatch(/cicalino|buzzer/);
    });

    it('Vol1 app has 38 experiments', () => {
      expect(EXPERIMENTS_VOL1.experiments.length).toBe(38);
    });
  });

  describe('Volume 2 — structure', () => {
    it('Vol2 text file exists and is substantial', () => {
      expect(VOL2_TEXT.length).toBeGreaterThan(5000);
    });

    it('Vol2 text mentions condensatore', () => {
      expect(VOL2_TEXT.toLowerCase()).toContain('condensatore');
    });

    it('Vol2 text mentions transistor/MOSFET', () => {
      expect(VOL2_TEXT.toLowerCase()).toMatch(/transistor|mosfet/);
    });

    it('Vol2 text mentions motore', () => {
      expect(VOL2_TEXT.toLowerCase()).toContain('motore');
    });

    it('Vol2 app has 27 experiments', () => {
      expect(EXPERIMENTS_VOL2.experiments.length).toBe(27);
    });
  });

  describe('Volume 3 — structure', () => {
    it('Vol3 text file exists and is substantial', () => {
      expect(VOL3_TEXT.length).toBeGreaterThan(5000);
    });

    it('Vol3 text mentions Arduino', () => {
      expect(VOL3_TEXT.toLowerCase()).toContain('arduino');
    });

    it('Vol3 text mentions digitalWrite', () => {
      expect(VOL3_TEXT).toMatch(/digitalWrite/i);
    });

    it('Vol3 text mentions analogRead', () => {
      expect(VOL3_TEXT).toMatch(/analogRead/i);
    });

    it('Vol3 text mentions PWM', () => {
      expect(VOL3_TEXT).toMatch(/PWM|pwm/);
    });

    it('Vol3 text mentions servo', () => {
      expect(VOL3_TEXT.toLowerCase()).toContain('servo');
    });

    it('Vol3 app has >= 23 experiments', () => {
      expect(EXPERIMENTS_VOL3.experiments.length).toBeGreaterThanOrEqual(23);
    });
  });

  describe('Cross-reference: app experiments mention components from volumes', () => {
    it('Vol1 experiments reference LED component', () => {
      const vol1Exps = EXPERIMENTS_VOL1.experiments;
      const withLed = vol1Exps.filter(e =>
        e.components?.some(c => c.type === 'led' || c.type === 'led-rgb')
      );
      expect(withLed.length).toBeGreaterThan(15);
    });

    it('Vol1 experiments reference resistor component', () => {
      const vol1Exps = EXPERIMENTS_VOL1.experiments;
      const withResistor = vol1Exps.filter(e =>
        e.components?.some(c => c.type === 'resistor')
      );
      expect(withResistor.length).toBeGreaterThan(15);
    });

    it('total experiments across all volumes >= 88', () => {
      expect(ALL_EXPERIMENTS.length).toBeGreaterThanOrEqual(88);
    });

    it('every experiment has a title', () => {
      for (const exp of ALL_EXPERIMENTS) {
        expect(exp.title, `Experiment ${exp.id} missing title`).toBeTruthy();
      }
    });

    it('every experiment has components array', () => {
      for (const exp of ALL_EXPERIMENTS) {
        expect(Array.isArray(exp.components), `Experiment ${exp.id} missing components`).toBe(true);
      }
    });
  });
});
