import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3.js';
import LESSON_GROUPS from '../../src/data/lesson-groups.js';
import VOLUME_REFERENCES from '../../src/data/volume-references.js';
import narrativeMap from '../../src/data/narrative-map-94.json';
import cliffhangerTable from '../../src/data/cliffhanger-table.json';

const canonicalVol3 = [
  'v3-cap5-esp1',
  'v3-cap5-esp2',
  'v3-cap6-esp1',
  'v3-cap6-esp2',
  'v3-cap6-esp3',
  'v3-cap6-esp4',
  'v3-cap6-esp5',
  'v3-cap6-esp6',
  'v3-cap6-esp7',
  'v3-cap6-esp8',
  'v3-cap7-esp1',
  'v3-cap7-esp2',
  'v3-cap7-esp3',
  'v3-cap7-esp4',
  'v3-cap7-esp5',
  'v3-cap7-esp6',
  'v3-cap7-esp7',
  'v3-cap8-esp1',
  'v3-cap8-esp2',
  'v3-cap8-esp3',
  'v3-cap8-esp4',
  'v3-cap8-esp5',
  'v3-cap8-esp6',
];

function vol3LessonGroupIds() {
  return Object.values(LESSON_GROUPS)
    .filter((lesson) => lesson.volume === 3)
    .flatMap((lesson) => lesson.experiments || []);
}

function vol3NarrativeIds() {
  return Object.values(narrativeMap.volumes.vol3.chapters)
    .flatMap((chapter) => chapter.experiments.map((exp) => exp.id));
}

describe('Volume 3 canonical printed-manual alignment', () => {
  test('experiments-vol3 contains exactly the 23 canonical IDs in book order', () => {
    expect(EXPERIMENTS_VOL3.experiments.map((exp) => exp.id)).toEqual(canonicalVol3);
  });

  test('every canonical Volume 3 experiment has a complete lesson path', () => {
    for (const id of canonicalVol3) {
      const path = resolve(process.cwd(), `src/data/lesson-paths/${id}.json`);
      expect(existsSync(path), `${id} missing lesson-path JSON`).toBe(true);
      const payload = JSON.parse(readFileSync(path, 'utf8'));
      expect(payload.experiment_id).toBe(id);
      expect(payload.phases.map((phase) => phase.name)).toEqual([
        'PREPARA',
        'MOSTRA',
        'CHIEDI',
        'OSSERVA',
        'CONCLUDI',
      ]);
      expect(payload.vocabulary?.allowed?.length, `${id} missing vocabulary.allowed`).toBeGreaterThan(0);
      expect(payload.common_mistakes?.length, `${id} missing common_mistakes`).toBeGreaterThan(0);
      expect(payload.analogies?.length, `${id} missing top-level analogies`).toBeGreaterThan(0);
      expect(payload.session_save, `${id} missing session_save`).toBeTruthy();
      expect(payload.modes_supported, `${id} missing modes_supported`).toContain('percorso');
      const mostra = payload.phases.find((phase) => phase.name === 'MOSTRA');
      expect(mostra?.build_circuit?.intent?.components?.length, `${id} missing MOSTRA build components`).toBeGreaterThan(0);
    }
  });

  test('lesson groups, narrative map, cliffhangers, and references use the same canonical ID set', () => {
    expect(vol3LessonGroupIds()).toEqual(canonicalVol3);
    expect(vol3NarrativeIds()).toEqual(canonicalVol3);
    expect(cliffhangerTable.experiments.map((entry) => entry.id)).toEqual(canonicalVol3);
    expect(Object.keys(VOLUME_REFERENCES).filter((id) => id.startsWith('v3-'))).toEqual(canonicalVol3);
  });

  test('next_experiment chain walks all 23 experiments once and terminates', () => {
    const byId = new Map(canonicalVol3.map((id) => {
      const payload = JSON.parse(readFileSync(resolve(process.cwd(), `src/data/lesson-paths/${id}.json`), 'utf8'));
      return [id, payload.next_experiment?.id || null];
    }));

    const visited = [];
    let current = canonicalVol3[0];
    while (current) {
      expect(visited).not.toContain(current);
      visited.push(current);
      current = byId.get(current);
    }

    expect(visited).toEqual(canonicalVol3);
  });
});
