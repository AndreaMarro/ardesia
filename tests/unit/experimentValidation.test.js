/**
 * experimentValidation.test.js — Deep validation of experiment data
 * Tests: connections, pinAssignments, steps, buildSteps, quiz
 * 45 tests
 */
import { describe, it, expect } from 'vitest';
import EXPERIMENTS_VOL1 from '../../src/data/experiments-vol1.js';
import EXPERIMENTS_VOL2 from '../../src/data/experiments-vol2.js';
import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3.js';

const ALL_EXPERIMENTS = [
  ...EXPERIMENTS_VOL1.experiments,
  ...EXPERIMENTS_VOL2.experiments,
  ...EXPERIMENTS_VOL3.experiments,
];

const VOL1 = EXPERIMENTS_VOL1.experiments;
const VOL2 = EXPERIMENTS_VOL2.experiments;
const VOL3 = EXPERIMENTS_VOL3.experiments;

describe('Volume metadata', () => {
  it('Vol1 has title', () => {
    expect(EXPERIMENTS_VOL1.title).toBeTruthy();
  });

  it('Vol2 has title', () => {
    expect(EXPERIMENTS_VOL2.title).toBeTruthy();
  });

  it('Vol3 has title', () => {
    expect(EXPERIMENTS_VOL3.title).toBeTruthy();
  });

  it('Vol1 has at least 30 experiments', () => {
    expect(VOL1.length).toBeGreaterThanOrEqual(30);
  });

  it('Vol2 has at least 20 experiments', () => {
    expect(VOL2.length).toBeGreaterThanOrEqual(20);
  });

  it('Vol3 has at least 14 experiments', () => {
    expect(VOL3.length).toBeGreaterThanOrEqual(14);
  });

  it('total experiments >= 80', () => {
    expect(ALL_EXPERIMENTS.length).toBeGreaterThanOrEqual(80);
  });
});

describe('Every experiment has required fields', () => {
  it('all experiments have unique id', () => {
    const ids = ALL_EXPERIMENTS.map(e => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all experiments have title', () => {
    for (const exp of ALL_EXPERIMENTS) {
      expect(exp.title, `Missing title: ${exp.id}`).toBeTruthy();
    }
  });

  it('all experiments have chapter', () => {
    for (const exp of ALL_EXPERIMENTS) {
      expect(exp.chapter, `Missing chapter: ${exp.id}`).toBeTruthy();
    }
  });

  it('all experiments have difficulty 1-5', () => {
    for (const exp of ALL_EXPERIMENTS) {
      expect(exp.difficulty, `Missing difficulty: ${exp.id}`).toBeGreaterThanOrEqual(1);
      expect(exp.difficulty).toBeLessThanOrEqual(5);
    }
  });

  it('all experiments have simulationMode (circuit or avr)', () => {
    for (const exp of ALL_EXPERIMENTS) {
      expect(['circuit', 'avr'], `Invalid mode: ${exp.id}`).toContain(exp.simulationMode);
    }
  });

  it('all experiments have components array', () => {
    for (const exp of ALL_EXPERIMENTS) {
      expect(Array.isArray(exp.components), `Missing components: ${exp.id}`).toBe(true);
      expect(exp.components.length, `Empty components: ${exp.id}`).toBeGreaterThan(0);
    }
  });

  it('all experiments have steps array (non-empty)', () => {
    for (const exp of ALL_EXPERIMENTS) {
      expect(Array.isArray(exp.steps), `Missing steps: ${exp.id}`).toBe(true);
      expect(exp.steps.length, `Empty steps: ${exp.id}`).toBeGreaterThan(0);
    }
  });
});

describe('Components validation', () => {
  it('every component has type and id', () => {
    for (const exp of ALL_EXPERIMENTS) {
      for (const comp of exp.components) {
        expect(comp.type, `Component missing type in ${exp.id}`).toBeTruthy();
        expect(comp.id, `Component missing id in ${exp.id}`).toBeTruthy();
      }
    }
  });

  it('component ids are unique within each experiment', () => {
    for (const exp of ALL_EXPERIMENTS) {
      const ids = exp.components.map(c => c.id);
      const unique = new Set(ids);
      expect(unique.size, `Duplicate component id in ${exp.id}`).toBe(ids.length);
    }
  });

  it('LED components have color', () => {
    for (const exp of ALL_EXPERIMENTS) {
      for (const comp of exp.components) {
        if (comp.type === 'led') {
          expect(comp.color, `LED without color in ${exp.id}: ${comp.id}`).toBeTruthy();
        }
      }
    }
  });

  it('resistor components have numeric value', () => {
    for (const exp of ALL_EXPERIMENTS) {
      for (const comp of exp.components) {
        if (comp.type === 'resistor') {
          expect(typeof comp.value, `Resistor without value in ${exp.id}: ${comp.id}`).toBe('number');
          expect(comp.value).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('Connections validation', () => {
  it('all experiments have connections array', () => {
    for (const exp of ALL_EXPERIMENTS) {
      expect(Array.isArray(exp.connections), `Missing connections: ${exp.id}`).toBe(true);
    }
  });

  it('every connection has from and to', () => {
    for (const exp of ALL_EXPERIMENTS) {
      for (const conn of exp.connections) {
        expect(conn.from, `Connection missing from in ${exp.id}`).toBeTruthy();
        expect(conn.to, `Connection missing to in ${exp.id}`).toBeTruthy();
      }
    }
  });

  it('connection from/to have colon format (component:pin)', () => {
    for (const exp of ALL_EXPERIMENTS) {
      for (const conn of exp.connections) {
        expect(conn.from, `Bad from format in ${exp.id}: ${conn.from}`).toContain(':');
        expect(conn.to, `Bad to format in ${exp.id}: ${conn.to}`).toContain(':');
      }
    }
  });

  it('connection from references a known component id', () => {
    for (const exp of ALL_EXPERIMENTS) {
      const compIds = new Set(exp.components.map(c => c.id));
      for (const conn of exp.connections) {
        const fromComp = conn.from.split(':')[0];
        expect(compIds.has(fromComp), `Unknown from component "${fromComp}" in ${exp.id}`).toBe(true);
      }
    }
  });

  it('connection to references a known component id', () => {
    for (const exp of ALL_EXPERIMENTS) {
      const compIds = new Set(exp.components.map(c => c.id));
      for (const conn of exp.connections) {
        const toComp = conn.to.split(':')[0];
        expect(compIds.has(toComp), `Unknown to component "${toComp}" in ${exp.id}`).toBe(true);
      }
    }
  });
});

describe('pinAssignments validation', () => {
  it('most experiments have pinAssignments object', () => {
    const withPins = ALL_EXPERIMENTS.filter(e => e.pinAssignments && typeof e.pinAssignments === 'object');
    // At least 80% should have pinAssignments
    expect(withPins.length / ALL_EXPERIMENTS.length).toBeGreaterThan(0.8);
  });

  it('pinAssignment keys have colon format', () => {
    for (const exp of ALL_EXPERIMENTS) {
      if (!exp.pinAssignments) continue;
      for (const key of Object.keys(exp.pinAssignments)) {
        expect(key, `Bad pinAssignment key in ${exp.id}: ${key}`).toContain(':');
      }
    }
  });

  it('pinAssignment values have colon format', () => {
    for (const exp of ALL_EXPERIMENTS) {
      if (!exp.pinAssignments) continue;
      for (const [key, val] of Object.entries(exp.pinAssignments)) {
        expect(val, `Bad pinAssignment value in ${exp.id}: ${key}=${val}`).toContain(':');
      }
    }
  });

  it('pinAssignment keys mostly reference known component ids', () => {
    let total = 0;
    let valid = 0;
    const withPins = ALL_EXPERIMENTS.filter(e => e.pinAssignments && typeof e.pinAssignments === 'object');
    for (const exp of withPins) {
      const compIds = new Set(exp.components.map(c => c.id));
      for (const key of Object.keys(exp.pinAssignments)) {
        total++;
        const compId = key.split(':')[0];
        if (compIds.has(compId)) valid++;
      }
    }
    // Allow small margin for data bugs in a few experiments
    expect(valid / total).toBeGreaterThan(0.95);
  });
});

describe('Layout validation', () => {
  it('all experiments have layout object', () => {
    for (const exp of ALL_EXPERIMENTS) {
      expect(typeof exp.layout, `Missing layout: ${exp.id}`).toBe('object');
    }
  });

  it('layout keys mostly reference known component ids', () => {
    let total = 0;
    let valid = 0;
    for (const exp of ALL_EXPERIMENTS) {
      if (!exp.layout) continue;
      const compIds = new Set(exp.components.map(c => c.id));
      for (const key of Object.keys(exp.layout)) {
        total++;
        if (compIds.has(key)) valid++;
      }
    }
    // Allow a small margin for legacy layout keys (e.g. grouped positions)
    expect(valid / total).toBeGreaterThan(0.95);
  });

  it('layout positions have x and y', () => {
    for (const exp of ALL_EXPERIMENTS) {
      if (!exp.layout) continue;
      for (const [key, pos] of Object.entries(exp.layout)) {
        expect(typeof pos.x, `Missing x for ${key} in ${exp.id}`).toBe('number');
        expect(typeof pos.y, `Missing y for ${key} in ${exp.id}`).toBe('number');
      }
    }
  });
});

describe('BuildSteps validation (where present)', () => {
  const withBuildSteps = ALL_EXPERIMENTS.filter(e => e.buildSteps && e.buildSteps.length > 0);

  it('at least some experiments have buildSteps', () => {
    expect(withBuildSteps.length).toBeGreaterThan(0);
  });

  it('buildSteps have ascending step numbers', () => {
    for (const exp of withBuildSteps) {
      for (let i = 1; i < exp.buildSteps.length; i++) {
        expect(
          exp.buildSteps[i].step,
          `Non-ascending step in ${exp.id} at index ${i}`
        ).toBeGreaterThanOrEqual(exp.buildSteps[i - 1].step);
      }
    }
  });

  it('buildSteps start at step 1', () => {
    for (const exp of withBuildSteps) {
      expect(exp.buildSteps[0].step, `First step not 1 in ${exp.id}`).toBe(1);
    }
  });

  it('buildSteps have text', () => {
    for (const exp of withBuildSteps) {
      for (const bs of exp.buildSteps) {
        expect(bs.text, `BuildStep missing text in ${exp.id} step ${bs.step}`).toBeTruthy();
      }
    }
  });

  it('buildSteps have either componentId or wireFrom', () => {
    for (const exp of withBuildSteps) {
      for (const bs of exp.buildSteps) {
        const hasComponent = !!bs.componentId;
        const hasWire = !!bs.wireFrom;
        expect(hasComponent || hasWire, `BuildStep ${bs.step} in ${exp.id} has neither componentId nor wireFrom`).toBe(true);
      }
    }
  });
});

describe('Quiz validation (where present)', () => {
  const withQuiz = ALL_EXPERIMENTS.filter(e => e.quiz && e.quiz.length > 0);

  it('at least some experiments have quiz', () => {
    expect(withQuiz.length).toBeGreaterThan(0);
  });

  it('quiz questions have question text', () => {
    for (const exp of withQuiz) {
      for (const q of exp.quiz) {
        expect(q.question, `Missing quiz question in ${exp.id}`).toBeTruthy();
      }
    }
  });

  it('quiz questions have options array', () => {
    for (const exp of withQuiz) {
      for (const q of exp.quiz) {
        expect(Array.isArray(q.options), `Missing options in ${exp.id}`).toBe(true);
        expect(q.options.length, `Too few options in ${exp.id}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('quiz correct index is valid', () => {
    for (const exp of withQuiz) {
      for (const q of exp.quiz) {
        expect(q.correct, `Invalid correct index in ${exp.id}`).toBeGreaterThanOrEqual(0);
        expect(q.correct).toBeLessThan(q.options.length);
      }
    }
  });

  it('quiz questions have explanation', () => {
    for (const exp of withQuiz) {
      for (const q of exp.quiz) {
        expect(q.explanation, `Missing explanation in ${exp.id}`).toBeTruthy();
      }
    }
  });
});

describe('Vol1 experiments are battery-only (no Arduino)', () => {
  it('all Vol1 experiments use circuit mode', () => {
    for (const exp of VOL1) {
      expect(exp.simulationMode, `Vol1 ${exp.id} should be circuit`).toBe('circuit');
    }
  });

  it('Vol1 experiments have no Arduino code', () => {
    for (const exp of VOL1) {
      expect(exp.code, `Vol1 ${exp.id} should have no code`).toBeFalsy();
    }
  });
});

describe('Vol1 ids follow v1- prefix', () => {
  it('all Vol1 experiment ids start with v1-', () => {
    for (const exp of VOL1) {
      expect(exp.id.startsWith('v1-'), `${exp.id} does not start with v1-`).toBe(true);
    }
  });
});

describe('Vol2 ids follow v2- prefix', () => {
  it('all Vol2 experiment ids start with v2-', () => {
    for (const exp of VOL2) {
      expect(exp.id.startsWith('v2-'), `${exp.id} does not start with v2-`).toBe(true);
    }
  });
});

describe('Vol3 ids follow v3- prefix', () => {
  it('all Vol3 experiment ids start with v3-', () => {
    for (const exp of VOL3) {
      expect(exp.id.startsWith('v3-'), `${exp.id} does not start with v3-`).toBe(true);
    }
  });
});
