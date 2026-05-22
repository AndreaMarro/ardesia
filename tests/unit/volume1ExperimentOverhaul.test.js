import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import EXPERIMENTS_VOL1 from '../../src/data/experiments-vol1.js';
import LESSON_GROUPS from '../../src/data/lesson-groups.js';

const LESSON_PATH_DIR = path.resolve('src/data/lesson-paths');

const BOOK_ORDER = [
  ...Array.from({ length: 3 }, (_, i) => `v1-cap6-esp${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `v1-cap7-esp${i + 1}`),
  ...Array.from({ length: 5 }, (_, i) => `v1-cap8-esp${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `v1-cap9-esp${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `v1-cap10-esp${i + 1}`),
  ...Array.from({ length: 2 }, (_, i) => `v1-cap11-esp${i + 1}`),
  ...Array.from({ length: 4 }, (_, i) => `v1-cap12-esp${i + 1}`),
  ...Array.from({ length: 2 }, (_, i) => `v1-cap13-esp${i + 1}`),
  'v1-cap14-esp1',
];

function readLessonPath(id) {
  return JSON.parse(fs.readFileSync(path.join(LESSON_PATH_DIR, `${id}.json`), 'utf8'));
}

function mostraIntent(pathData) {
  return pathData.phases.find((phase) => phase.name === 'MOSTRA')?.build_circuit?.intent;
}

function normalizeComponents(components = []) {
  return components
    .map((component) => JSON.stringify(component, Object.keys(component).sort()))
    .sort();
}

function normalizeWires(wires = []) {
  return wires
    .map((wire) => `${wire.from}->${wire.to}:${wire.color}`)
    .sort();
}

describe('Volume 1 experiment overhaul contract', () => {
  const experiments = EXPERIMENTS_VOL1.experiments;
  const byId = new Map(experiments.map((experiment) => [experiment.id, experiment]));

  test('all 38 Volume 1 experiments exist in printed-book order', () => {
    expect(experiments.map((experiment) => experiment.id)).toEqual(BOOK_ORDER);
  });

  test('lesson groups Volume 1 section covers the same 38 ids in printed-book order', () => {
    const grouped = Object.values(LESSON_GROUPS)
      .filter((group) => group.volume === 1)
      .flatMap((group) => group.experiments);

    expect(grouped).toEqual(BOOK_ORDER);
  });

  test('lesson path next_experiment follows the Volume 1 book chain and stops at the robot capstone', () => {
    for (let i = 0; i < BOOK_ORDER.length; i += 1) {
      const id = BOOK_ORDER[i];
      const pathData = readLessonPath(id);
      const expectedNext = BOOK_ORDER[i + 1] ?? null;
      expect(pathData.next_experiment?.id ?? null, `${id} next_experiment`).toBe(expectedNext);
    }
  });

  test('lesson path MOSTRA build_circuit intent mirrors experiment components and connections', () => {
    for (const experiment of experiments) {
      const intent = mostraIntent(readLessonPath(experiment.id));
      expect(intent, `${experiment.id} missing MOSTRA build_circuit.intent`).toBeTruthy();
      expect(normalizeComponents(intent.components), `${experiment.id} components mismatch`).toEqual(
        normalizeComponents(experiment.components)
      );
      expect(normalizeWires(intent.wires), `${experiment.id} wires mismatch`).toEqual(
        normalizeWires(experiment.connections)
      );
    }
  });

  test('buildSteps only reference declared Volume 1 components', () => {
    for (const experiment of experiments) {
      const componentIds = new Set(experiment.components.map((component) => component.id));
      for (const step of experiment.buildSteps) {
        if (step.componentId) {
          expect(componentIds.has(step.componentId), `${experiment.id} step ${step.step} componentId`).toBe(true);
        }
        for (const endpoint of [step.wireFrom, step.wireTo].filter(Boolean)) {
          const componentId = endpoint.split(':')[0];
          expect(componentIds.has(componentId), `${experiment.id} step ${step.step} wire endpoint`).toBe(true);
        }
      }
    }
  });

  test('book-specific repairs stay enforced', () => {
    expect(byId.get('v1-cap6-esp3').components.find((c) => c.id === 'r1')?.value).toBe(220);
    for (const id of ['v1-cap10-esp1', 'v1-cap10-esp2', 'v1-cap10-esp3']) {
      expect(byId.get(id).components.some((component) => component.type === 'resistor'), id).toBe(false);
    }
    expect(readLessonPath('v1-cap13-esp1').objective).toContain('elettropongo');
    expect(readLessonPath('v1-cap13-esp2').objective).toContain('elettropongo');
  });
});
