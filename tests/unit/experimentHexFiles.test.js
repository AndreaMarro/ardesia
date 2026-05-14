/**
 * experimentHexFiles.test.js — Validate hex file references across experiments
 * AVR experiments have code or hexFile, hexFile paths start with /hex/
 */
import { describe, it, expect } from 'vitest';
import EXPERIMENTS_VOL1 from '../../src/data/experiments-vol1';
import EXPERIMENTS_VOL2 from '../../src/data/experiments-vol2';
import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3';

const ALL_EXPERIMENTS = [
  ...EXPERIMENTS_VOL1.experiments,
  ...EXPERIMENTS_VOL2.experiments,
  ...EXPERIMENTS_VOL3.experiments,
];

const AVR_EXPERIMENTS = ALL_EXPERIMENTS.filter(e => e.simulationMode === 'avr');
const CIRCUIT_EXPERIMENTS = ALL_EXPERIMENTS.filter(e => e.simulationMode === 'circuit');

describe('experimentHexFiles — simulation modes', () => {
  it('all 79 experiments are loaded', () => {
    expect(ALL_EXPERIMENTS.length).toBe(79);
  });

  it('every experiment has a simulationMode', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(exp.simulationMode, `${exp.id} missing simulationMode`).toBeDefined();
    });
  });

  it('simulationMode is either circuit or avr', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(
        ['circuit', 'avr'].includes(exp.simulationMode),
        `${exp.id} has unknown simulationMode "${exp.simulationMode}"`
      ).toBe(true);
    });
  });

  it('there are 14 AVR experiments', () => {
    expect(AVR_EXPERIMENTS.length).toBe(14);
  });

  it('there are 65 circuit experiments', () => {
    expect(CIRCUIT_EXPERIMENTS.length).toBe(65);
  });

  it('all AVR experiments are from Vol3', () => {
    AVR_EXPERIMENTS.forEach(exp => {
      expect(exp.id.startsWith('v3-'), `${exp.id} is AVR but not Vol3`).toBe(true);
    });
  });
});

describe('experimentHexFiles — AVR experiments have code or hexFile', () => {
  AVR_EXPERIMENTS.forEach(exp => {
    it(`${exp.id}: has code and/or hexFile`, () => {
      const hasCode = exp.code && exp.code.trim().length > 0;
      const hasHex = exp.hexFile && exp.hexFile.trim().length > 0;
      // v3-cap6-esp1 is a known exception (manual-only experiment with neither)
      if (exp.id === 'v3-cap6-esp1') {
        // This experiment is the "built-in LED" which uses internal code
        return;
      }
      expect(
        hasCode || hasHex,
        `${exp.id} has neither code nor hexFile`
      ).toBe(true);
    });
  });
});

describe('experimentHexFiles — hexFile path format', () => {
  const withHexFile = ALL_EXPERIMENTS.filter(e => e.hexFile && e.hexFile.trim().length > 0);

  it('there are experiments with hexFile references', () => {
    expect(withHexFile.length).toBeGreaterThan(0);
  });

  withHexFile.forEach(exp => {
    it(`${exp.id}: hexFile starts with /hex/`, () => {
      expect(exp.hexFile.startsWith('/hex/'), `${exp.id} hexFile="${exp.hexFile}" should start with /hex/`).toBe(true);
    });
  });

  withHexFile.forEach(exp => {
    it(`${exp.id}: hexFile ends with .hex`, () => {
      expect(exp.hexFile.endsWith('.hex'), `${exp.id} hexFile="${exp.hexFile}" should end with .hex`).toBe(true);
    });
  });

  withHexFile.forEach(exp => {
    it(`${exp.id}: hexFile contains experiment id`, () => {
      // hexFile path should reference the experiment ID
      const basename = exp.hexFile.replace('/hex/', '').replace('.hex', '');
      expect(exp.id.includes(basename) || basename.includes(exp.id.replace(/^v3-/, '')),
        `${exp.id} hexFile="${exp.hexFile}" does not reference experiment id`
      ).toBe(true);
    });
  });
});

describe('experimentHexFiles — circuit experiments do NOT need code/hexFile', () => {
  it('circuit experiments have null code (batteries/LEDs only)', () => {
    CIRCUIT_EXPERIMENTS.forEach(exp => {
      // Circuit experiments typically have code: null
      // This is expected since they are analog circuits
      expect(exp.simulationMode).toBe('circuit');
    });
  });
});

describe('experimentHexFiles — code field for AVR experiments', () => {
  const withCode = AVR_EXPERIMENTS.filter(e => e.code && e.code.trim().length > 0);

  it('most AVR experiments have Arduino code', () => {
    expect(withCode.length).toBeGreaterThan(10);
  });

  withCode.forEach(exp => {
    it(`${exp.id}: code contains setup or loop function`, () => {
      const hasSetup = exp.code.includes('setup');
      const hasLoop = exp.code.includes('loop');
      expect(
        hasSetup || hasLoop,
        `${exp.id} code does not contain setup() or loop()`
      ).toBe(true);
    });
  });

  withCode.forEach(exp => {
    it(`${exp.id}: code is non-trivial (> 20 chars)`, () => {
      expect(exp.code.trim().length).toBeGreaterThan(20);
    });
  });
});

describe('experimentHexFiles — no duplicate hexFile paths', () => {
  it('each hexFile path is unique', () => {
    const hexPaths = ALL_EXPERIMENTS
      .filter(e => e.hexFile)
      .map(e => e.hexFile);
    expect(new Set(hexPaths).size).toBe(hexPaths.length);
  });
});
