import fs from 'fs';
import path from 'path';
import { describe, expect, test } from 'vitest';
import experimentsVol2 from '../../../src/data/experiments-vol2.js';
import volumeReferences from '../../../src/data/volume-references.js';
import narrativeMap from '../../../src/data/narrative-map-94.json';

const volume2Order = [
  'v2-cap3-esp1',
  'v2-cap3-esp2',
  'v2-cap3-esp3',
  'v2-cap3-esp4',
  'v2-cap4-esp1',
  'v2-cap4-esp2',
  'v2-cap4-esp3',
  'v2-cap5-esp1',
  'v2-cap5-esp2',
  'v2-cap6-esp1',
  'v2-cap6-esp2',
  'v2-cap6-esp3',
  'v2-cap6-esp4',
  'v2-cap7-esp1',
  'v2-cap7-esp2',
  'v2-cap7-esp3',
  'v2-cap7-esp4',
  'v2-cap8-esp1',
  'v2-cap8-esp2',
  'v2-cap8-esp3',
  'v2-cap9-esp1',
  'v2-cap9-esp2',
  'v2-cap10-esp1',
  'v2-cap10-esp2',
  'v2-cap10-esp3',
  'v2-cap10-esp4',
  'v2-cap12-esp1',
];

const lessonPathDir = path.resolve('src/data/lesson-paths');
const readLessonPath = (id) => JSON.parse(fs.readFileSync(path.join(lessonPathDir, `${id}.json`), 'utf8'));

describe('Volume 2 experiment overhaul invariants', () => {
  test('narrative-map Vol.2 mirrors the printed 27-experiment order with no phantom Cap.11 nodes', () => {
    const mappedIds = Object.values(narrativeMap.volumes.vol2.chapters)
      .flatMap((chapter) => chapter.experiments.map((experiment) => experiment.id));

    expect(mappedIds).toEqual(volume2Order);

    for (const [index, id] of volume2Order.entries()) {
      const node = Object.values(narrativeMap.volumes.vol2.chapters)
        .flatMap((chapter) => chapter.experiments)
        .find((experiment) => experiment.id === id);
      expect(node.next_id).toBe(volume2Order[index + 1] ?? null);
    }
  });

  test('lesson-paths form one Volume 2 chain, then bridge to official Volume 3', () => {
    const visited = [];
    let cursor = 'v2-cap3-esp1';

    while (cursor?.startsWith('v2-')) {
      expect(visited).not.toContain(cursor);
      visited.push(cursor);
      cursor = readLessonPath(cursor).next_experiment?.id ?? null;
    }

    expect(visited).toEqual(volume2Order);
    expect(cursor).toBe('v3-cap5-esp1');
    expect(readLessonPath('v2-cap12-esp1').next_experiment).toEqual(expect.objectContaining({
      id: 'v3-cap5-esp1',
      title: 'Blink: il primo programma',
    }));
  });

  test('all Volume 2 lesson-paths expose morphic-ready analogies at top level', () => {
    for (const id of volume2Order) {
      const lessonPath = readLessonPath(id);
      expect(Array.isArray(lessonPath.analogies), id).toBe(true);
      expect(lessonPath.analogies.length, id).toBeGreaterThan(0);
    }
  });

  test('all Volume 2 Passo Passo steps use Principio Zero plural address', () => {
    for (const experiment of experimentsVol2.experiments) {
      for (const buildStep of experiment.buildSteps ?? []) {
        expect(buildStep.text, `${experiment.id} step ${buildStep.step}`).toContain('Ragazzi,');
      }
    }
  });

  test('Cap.9 Esp.2 matches the printed one-resistor fototransistor night-light circuit', () => {
    const experiment = experimentsVol2.experiments.find((item) => item.id === 'v2-cap9-esp2');
    const lessonPath = readLessonPath('v2-cap9-esp2');
    const tenKComponents = experiment.components.filter(
      (component) => component.type === 'resistor' && component.value === 10000,
    );

    expect(tenKComponents).toHaveLength(1);
    expect(experiment.components.filter((component) => component.type === 'resistor' && component.value === 470)).toHaveLength(1);
    expect(lessonPath.components_needed.find((component) => component.name === 'Resistore 10kΩ')?.quantity).toBe(1);
    expect(lessonPath.phases.find((phase) => phase.name === 'MOSTRA').build_circuit.intent.components
      .filter((component) => component.type === 'resistor' && component.value === 10000)).toHaveLength(1);
    expect(volumeReferences['v2-cap9-esp2'].bookInstructions.join(' ')).not.toMatch(/4 resistori|40kOhm/i);
  });
});
