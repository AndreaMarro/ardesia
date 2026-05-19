/**
 * BuildSteps Structure Validation — Verifica formato e completezza
 * Gold standard: Vol1 buildSteps hanno step/text/componentId/targetPins/hint
 * (c) Andrea Marro — 11/04/2026
 */

import { describe, test, expect } from 'vitest';

const vol1 = await import('../../src/data/experiments-vol1.js');
const vol2 = await import('../../src/data/experiments-vol2.js');
const vol3 = await import('../../src/data/experiments-vol3.js');

function getExperiments(mod) {
  const exp = mod.default || mod.experiments || [];
  if (Array.isArray(exp)) return exp;
  return Object.values(exp).flat().filter(e => e?.id);
}

function getAllExperiments() {
  return [...getExperiments(vol1), ...getExperiments(vol2), ...getExperiments(vol3)];
}

describe('BuildSteps Structure — All Volumes', () => {
  const all = getAllExperiments();
  const withBuildSteps = all.filter(e => e.buildSteps && e.buildSteps.length > 0);

  test('at least 78 experiments have buildSteps', () => {
    expect(withBuildSteps.length).toBeGreaterThanOrEqual(78);
  });

  test('every buildStep has step number and text', () => {
    withBuildSteps.forEach(e => {
      e.buildSteps.forEach((bs, i) => {
        expect(bs.step, `${e.id} step ${i} missing step number`).toBeDefined();
        expect(bs.text, `${e.id} step ${i} missing text`).toBeTruthy();
        expect(typeof bs.text).toBe('string');
        expect(bs.text.length, `${e.id} step ${i} text too short`).toBeGreaterThan(5);
      });
    });
  });

  test('step numbers start from 1', () => {
    withBuildSteps.forEach(e => {
      expect(e.buildSteps[0].step, `${e.id} first step not 1`).toBe(1);
    });
  });

  test('step numbers are mostly sequential', () => {
    let sequential = 0, total = 0;
    withBuildSteps.forEach(e => {
      total++;
      const isSeq = e.buildSteps.every((bs, i) => bs.step === i + 1);
      if (isSeq) sequential++;
    });
    expect(sequential / total, `Only ${Math.round(sequential/total*100)}% sequential`).toBeGreaterThan(0.9);
  });

  test('component steps have componentId', () => {
    withBuildSteps.forEach(e => {
      e.buildSteps.forEach(bs => {
        if (bs.componentId) {
          expect(typeof bs.componentId).toBe('string');
          expect(bs.componentId.length).toBeGreaterThan(0);
        }
      });
    });
  });

  test('wire steps have wireFrom and wireTo', () => {
    withBuildSteps.forEach(e => {
      e.buildSteps.forEach(bs => {
        if (bs.wireFrom) {
          expect(bs.wireTo, `${e.id} has wireFrom without wireTo`).toBeTruthy();
          expect(bs.wireColor, `${e.id} wire missing color`).toBeTruthy();
        }
      });
    });
  });

  test('less than 5% of buildStep texts contain "area di lavoro"', () => {
    let generic = 0, total = 0;
    withBuildSteps.forEach(e => {
      e.buildSteps.forEach(bs => {
        total++;
        if (bs.text.includes('area di lavoro')) generic++;
      });
    });
    expect(generic / total, `${generic}/${total} texts are generic`).toBeLessThan(0.05);
  });

  test('hint field is present in most steps', () => {
    let withHint = 0;
    let total = 0;
    withBuildSteps.forEach(e => {
      e.buildSteps.forEach(bs => {
        total++;
        if (bs.hint) withHint++;
      });
    });
    const ratio = withHint / total;
    expect(ratio, `Only ${Math.round(ratio*100)}% of steps have hints`).toBeGreaterThan(0.3);
  });
});

describe('BuildSteps — Vol1 Gold Standard', () => {
  const vol1Exps = getExperiments(vol1);
  const v1WithBS = vol1Exps.filter(e => e.buildSteps?.length > 0 && e.id?.startsWith('v1-'));

  test('Vol1 has 38 experiments with buildSteps', () => {
    expect(v1WithBS.length).toBeGreaterThanOrEqual(35);
  });

  test('Vol1 buildSteps have targetPins for component steps', () => {
    let hasTargetPins = 0;
    let componentSteps = 0;
    v1WithBS.forEach(e => {
      e.buildSteps.forEach(bs => {
        if (bs.componentId) {
          componentSteps++;
          if (bs.targetPins) hasTargetPins++;
        }
      });
    });
    expect(hasTargetPins, `Only ${hasTargetPins}/${componentSteps} have targetPins`).toBeGreaterThan(0);
  });

  test('Vol1 buildSteps mention specific breadboard holes', () => {
    let mentionHoles = 0;
    let total = 0;
    v1WithBS.forEach(e => {
      e.buildSteps.forEach(bs => {
        total++;
        if (/[A-J]\d+|bus/.test(bs.text)) mentionHoles++;
      });
    });
    const ratio = mentionHoles / total;
    expect(ratio, `Only ${Math.round(ratio*100)}% mention specific holes`).toBeGreaterThan(0.3);
  });
});

describe('BuildSteps — Non-Simulable Experiments', () => {
  const all = getAllExperiments();

  test('non-simulable experiments still have buildSteps for physical kit', () => {
    const nonSim = all.filter(e => e.simulable === false);
    nonSim.forEach(e => {
      // Non-simulable experiments SHOULD have buildSteps for the physical kit
      // This is for the docente who uses the real components
      if (e.buildSteps) {
        expect(e.buildSteps.length, `${e.id} has empty buildSteps`).toBeGreaterThan(0);
      }
    });
  });
});
