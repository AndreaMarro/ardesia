import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import EXPERIMENTS_VOL1 from '../../src/data/experiments-vol1.js';
import EXPERIMENTS_VOL2 from '../../src/data/experiments-vol2.js';
import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3.js';
import VOLUME_REFERENCES from '../../src/data/volume-references.js';

const repoRoot = path.resolve(process.cwd(), '..', '..');
const teaRoot = process.env.ELAB_TEA_PACKAGE_DIR
  || path.join(repoRoot, 'TEA', 'elab-fumetti-consegna-v2');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(teaRoot, relativePath), 'utf8'));
}

function narrativeIds(narrativeMap) {
  const ids = [];
  for (const volume of Object.values(narrativeMap)) {
    for (const chapter of Object.values(volume.chapters || {})) {
      for (const experiment of chapter.experiments || []) ids.push(experiment.id);
    }
  }
  return ids;
}

describe('Tea narrative and fumetti v2 package audit', () => {
  it('has readable Tea package files; repo experiment IDs are a subset with matching pages', () => {
    // EPIC 1 A4.1b removed 13 Vol3 no-counterpart experiments from the repo.
    // The Tea fumetti v2 package (TEA/elab-fumetti-consegna-v2/) still carries
    // the original 94-experiment inventory and needs regeneration in a
    // follow-up to re-sync. Until then, the repo inventory is a strict subset
    // of the Tea package; every surviving repo experiment must still resolve
    // in the Tea metadata with a matching bookPage.
    const narrativeMap = readJson('05-Punto-2-Mapping-Narrativo/narrative_map.json');
    const metadata = readJson('05-Punto-2-Mapping-Narrativo/narrative_metadata_94.json');
    const repoIds = [
      ...EXPERIMENTS_VOL1.experiments,
      ...EXPERIMENTS_VOL2.experiments,
      ...EXPERIMENTS_VOL3.experiments,
    ].map((experiment) => experiment.id).sort();
    const teaIds = [...new Set(narrativeIds(narrativeMap))].sort();
    const teaIdSet = new Set(teaIds);

    expect(teaIds).toHaveLength(94);
    expect(Object.keys(metadata)).toHaveLength(94);
    expect(repoIds).toHaveLength(81);
    // Every surviving repo experiment exists in the Tea package and VOLUME_REFERENCES.
    expect(repoIds.every((id) => teaIdSet.has(id))).toBe(true);
    const volRefIds = Object.keys(VOLUME_REFERENCES).sort();
    expect(volRefIds.every((id) => teaIdSet.has(id))).toBe(true);
    expect(volRefIds).toEqual(repoIds);

    const pageMismatches = repoIds.filter((id) => metadata[id]?.bookPage !== VOLUME_REFERENCES[id]?.bookPage);
    expect(pageMismatches).toEqual([]);
  });

  it('confirms 23 chapters, 21 story arcs, 9 capstone closures and all titles TEA inferred', () => {
    const narrativeMap = readJson('05-Punto-2-Mapping-Narrativo/narrative_map.json');
    const chapters = [];
    const arcs = [];
    const capstones = [];

    for (const volume of Object.values(narrativeMap)) {
      arcs.push(...(volume.story_arcs || []));
      for (const chapter of Object.values(volume.chapters || {})) {
        chapters.push(chapter);
        for (const experiment of chapter.experiments || []) {
          if (experiment.next_id === null) capstones.push(experiment.id);
        }
      }
    }

    expect(chapters).toHaveLength(23);
    expect(arcs).toHaveLength(21);
    expect(capstones).toHaveLength(9);
    expect(chapters.every((chapter) => chapter.chapter_title_origin === 'tea-inferred')).toBe(true);
  });

  it('catalogs fumetti v2 as pre-generated editorial assets and exposes current coverage gaps', () => {
    const pdfs = fs.readdirSync(path.join(teaRoot, '01-Volume-1')).filter((file) => file.endsWith('.pdf'))
      .concat(fs.readdirSync(path.join(teaRoot, '02-Volume-2')).filter((file) => file.endsWith('.pdf')))
      .concat(fs.readdirSync(path.join(teaRoot, '03-Volume-3')).filter((file) => file.endsWith('.pdf')));

    const payloads = fs.readdirSync(path.join(teaRoot, '01-Volume-1/payloads_vol1')).filter((file) => file.endsWith('.json'))
      .concat(fs.readdirSync(path.join(teaRoot, '02-Volume-2/payloads_vol2')).filter((file) => file.endsWith('.json')))
      .concat(fs.readdirSync(path.join(teaRoot, '03-Volume-3/payloads_vol3')).filter((file) => file.endsWith('.json')));

    expect(pdfs).toHaveLength(94);
    expect(payloads).toHaveLength(94);

    const canonicalPdfCount = pdfs.filter((file) => /^fumetto_v[1-3]-cap\d+-esp\d+\.pdf$/.test(file)).length;
    expect(canonicalPdfCount).toBeLessThan(94);
  });
});
