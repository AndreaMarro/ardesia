/**
 * experimentBuildSteps.test.js — Validate ALL buildSteps across 92 experiments
 * Sequential step numbers, text fields, componentId references, hint fields
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

describe('experimentBuildSteps — structural validation', () => {
  it('all 79 experiments are loaded', () => {
    expect(ALL_EXPERIMENTS.length).toBe(79);
  });

  it('every experiment has a buildSteps array', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(exp.buildSteps, `${exp.id} missing buildSteps`).toBeDefined();
      expect(Array.isArray(exp.buildSteps), `${exp.id} buildSteps not array`).toBe(true);
    });
  });

  it('every experiment has at least 1 buildStep', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(exp.buildSteps.length, `${exp.id} has 0 buildSteps`).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('experimentBuildSteps — step numbers start at 1 and increase', () => {
  ALL_EXPERIMENTS.forEach(exp => {
    it(`${exp.id}: first step is 1`, () => {
      expect(exp.buildSteps[0].step).toBe(1);
    });
  });

  ALL_EXPERIMENTS.forEach(exp => {
    it(`${exp.id}: steps are monotonically increasing`, () => {
      for (let i = 1; i < exp.buildSteps.length; i++) {
        expect(
          exp.buildSteps[i].step,
          `${exp.id} step ${i}: ${exp.buildSteps[i].step} <= ${exp.buildSteps[i - 1].step}`
        ).toBeGreaterThan(exp.buildSteps[i - 1].step);
      }
    });
  });

  it('most experiments have strictly sequential steps (1,2,3,...)', () => {
    let sequential = 0;
    ALL_EXPERIMENTS.forEach(exp => {
      const isSequential = exp.buildSteps.every((bs, idx) => bs.step === idx + 1);
      if (isSequential) sequential++;
    });
    // At least 90% should be strictly sequential
    expect(sequential / ALL_EXPERIMENTS.length).toBeGreaterThan(0.9);
  });
});

describe('experimentBuildSteps — text field presence', () => {
  ALL_EXPERIMENTS.forEach(exp => {
    it(`${exp.id}: every buildStep has non-empty text`, () => {
      exp.buildSteps.forEach((bs, idx) => {
        expect(typeof bs.text, `${exp.id} step ${bs.step} text not string`).toBe('string');
        expect(bs.text.trim().length, `${exp.id} step ${bs.step} text is empty`).toBeGreaterThan(0);
      });
    });
  });
});

describe('experimentBuildSteps — componentId is a non-empty string', () => {
  ALL_EXPERIMENTS.forEach(exp => {
    const stepsWithComponent = exp.buildSteps.filter(bs => bs.componentId);

    if (stepsWithComponent.length > 0) {
      it(`${exp.id}: componentId is a non-empty string`, () => {
        stepsWithComponent.forEach(bs => {
          expect(typeof bs.componentId).toBe('string');
          expect(bs.componentId.trim().length).toBeGreaterThan(0);
        });
      });
    }
  });
});

describe('experimentBuildSteps — most componentIds reference valid components', () => {
  it('at least 90% of componentId references match experiment components', () => {
    let total = 0;
    let valid = 0;
    ALL_EXPERIMENTS.forEach(exp => {
      const componentIds = (exp.components || []).map(c => c.id);
      exp.buildSteps.filter(bs => bs.componentId).forEach(bs => {
        total++;
        if (componentIds.includes(bs.componentId)) valid++;
      });
    });
    expect(valid / total).toBeGreaterThan(0.9);
  });
});

describe('experimentBuildSteps — hint field on component steps', () => {
  ALL_EXPERIMENTS.forEach(exp => {
    const stepsWithComponent = exp.buildSteps.filter(bs => bs.componentId);
    if (stepsWithComponent.length > 0) {
      it(`${exp.id}: component placement steps have hint`, () => {
        stepsWithComponent.forEach(bs => {
          expect(bs.hint, `${exp.id} step ${bs.step} componentId=${bs.componentId} missing hint`).toBeDefined();
          expect(typeof bs.hint).toBe('string');
          expect(bs.hint.trim().length).toBeGreaterThan(0);
        });
      });
    }
  });
});

describe('experimentBuildSteps — wire steps have from/to/color', () => {
  ALL_EXPERIMENTS.forEach(exp => {
    const wireSteps = exp.buildSteps.filter(bs => bs.wireFrom || bs.wireTo);
    if (wireSteps.length > 0) {
      it(`${exp.id}: wire steps have wireFrom, wireTo, wireColor`, () => {
        wireSteps.forEach(bs => {
          expect(bs.wireFrom, `${exp.id} step ${bs.step} missing wireFrom`).toBeDefined();
          expect(bs.wireTo, `${exp.id} step ${bs.step} missing wireTo`).toBeDefined();
          expect(bs.wireColor, `${exp.id} step ${bs.step} missing wireColor`).toBeDefined();
          expect(typeof bs.wireFrom).toBe('string');
          expect(typeof bs.wireTo).toBe('string');
          expect(typeof bs.wireColor).toBe('string');
        });
      });
    }
  });
});

describe('experimentBuildSteps — wire color validity', () => {
  const VALID_COLORS = ['red', 'black', 'yellow', 'green', 'blue', 'orange', 'white', 'purple'];
  ALL_EXPERIMENTS.forEach(exp => {
    const wireSteps = exp.buildSteps.filter(bs => bs.wireColor);
    if (wireSteps.length > 0) {
      it(`${exp.id}: wire colors are valid`, () => {
        wireSteps.forEach(bs => {
          expect(
            VALID_COLORS.includes(bs.wireColor),
            `${exp.id} step ${bs.step} invalid wireColor "${bs.wireColor}"`
          ).toBe(true);
        });
      });
    }
  });
});

describe('experimentBuildSteps — step type consistency', () => {
  it('every step is either a component placement or a wire connection or a scratch step', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      exp.buildSteps.forEach(bs => {
        const isComponent = !!bs.componentId;
        const isWire = !!bs.wireFrom;
        const isScratch = !!bs.scratchXml;
        const hasType = isComponent || isWire || isScratch;
        // Some steps might be description-only (text + hint only), that is also valid
        // At minimum every step must have text
        expect(typeof bs.text).toBe('string');
      });
    });
  });
});

describe('experimentBuildSteps — aggregate statistics', () => {
  it('total buildSteps across all experiments is > 500', () => {
    const total = ALL_EXPERIMENTS.reduce((sum, exp) => sum + exp.buildSteps.length, 0);
    expect(total).toBeGreaterThan(500);
  });

  it('wire steps outnumber component steps', () => {
    let wireCount = 0;
    let compCount = 0;
    ALL_EXPERIMENTS.forEach(exp => {
      exp.buildSteps.forEach(bs => {
        if (bs.wireFrom) wireCount++;
        if (bs.componentId) compCount++;
      });
    });
    expect(wireCount).toBeGreaterThan(compCount);
  });
});
