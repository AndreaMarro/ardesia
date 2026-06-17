/**
 * percorsoService tests — Sprint Q1.C
 * Andrea Marro 2026-04-24
 *
 * Service reads capitoli JSON + exposes lookup API for UI consumption.
 * Factory pattern: createPercorsoService(capitoli) for testability;
 * default instance auto-loads from src/data/capitoli/*.json at runtime.
 */

import { describe, it, expect } from 'vitest';
import { createPercorsoService } from '../../../src/services/percorsoService.js';

const sampleCapitoli = [
  {
    id: 'v1-cap6',
    volume: 1,
    capitolo: 6,
    type: 'experiment',
    titolo: "Cos'è il diodo LED?",
    titolo_classe: "Cos'è il diodo LED?",
    pageStart: 27,
    pageEnd: 34,
    theory: { testo_classe: 'x', citazioni_volume: [], figure_refs: [], analogies_classe: [] },
    esperimenti: [
      { id: 'v1-cap6-esp1', num: 1 },
      { id: 'v1-cap6-esp2', num: 2 },
    ],
  },
  {
    id: 'v1-cap1',
    volume: 1,
    capitolo: 1,
    type: 'theory',
    titolo: 'Storia',
    titolo_classe: 'Storia',
    pageStart: 5,
    pageEnd: 8,
    theory: { testo_classe: 'x', citazioni_volume: [], figure_refs: [], analogies_classe: [] },
    esperimenti: [],
  },
  {
    id: 'v2-cap3',
    volume: 2,
    capitolo: 3,
    type: 'experiment',
    titolo: 'Multimetro',
    titolo_classe: 'Multimetro',
    pageStart: 13,
    pageEnd: 36,
    theory: { testo_classe: 'x', citazioni_volume: [], figure_refs: [], analogies_classe: [] },
    esperimenti: [{ id: 'v2-cap3-esp1', num: 1 }],
  },
  {
    id: 'v3-bonus-lcd-hello',
    volume: 3,
    capitolo: null,
    type: 'bonus',
    titolo: 'LCD Hello',
    titolo_classe: 'LCD Hello',
    pageStart: null,
    pageEnd: null,
    theory: { testo_classe: '', citazioni_volume: [], figure_refs: [], analogies_classe: [] },
    esperimenti: [{ id: 'v3-bonus-lcd-hello-esp1', num: 1 }],
  },
];

describe('percorsoService', () => {
  it('getCapitolo returns Capitolo by id', () => {
    const svc = createPercorsoService(sampleCapitoli);
    const cap = svc.getCapitolo('v1-cap6');
    expect(cap).toBeTruthy();
    expect(cap.capitolo).toBe(6);
    expect(cap.volume).toBe(1);
  });

  it('getCapitolo returns null for unknown id', () => {
    const svc = createPercorsoService(sampleCapitoli);
    expect(svc.getCapitolo('unknown-cap')).toBe(null);
  });

  it('listCapitoliByVolume returns only volume N Capitoli (excludes bonus)', () => {
    const svc = createPercorsoService(sampleCapitoli);
    const vol1 = svc.listCapitoliByVolume(1);
    expect(vol1.length).toBe(2);
    expect(vol1.every((c) => c.volume === 1)).toBe(true);
    expect(vol1.every((c) => c.type !== 'bonus')).toBe(true);
  });

  it('listCapitoliByVolume returns sorted by capitolo number', () => {
    const svc = createPercorsoService(sampleCapitoli);
    const vol1 = svc.listCapitoliByVolume(1);
    expect(vol1[0].capitolo).toBeLessThan(vol1[1].capitolo);
  });

  it('listAllCapitoli returns all including bonus', () => {
    const svc = createPercorsoService(sampleCapitoli);
    const all = svc.listAllCapitoli();
    expect(all.length).toBe(sampleCapitoli.length);
  });

  it('getBonusCapitoli returns only type=bonus', () => {
    const svc = createPercorsoService(sampleCapitoli);
    const bonus = svc.getBonusCapitoli();
    expect(bonus.length).toBe(1);
    expect(bonus[0].id).toBe('v3-bonus-lcd-hello');
  });

  it('findExperimentById locates experiment within Capitolo', () => {
    const svc = createPercorsoService(sampleCapitoli);
    const result = svc.findExperimentById('v1-cap6-esp2');
    expect(result).toBeTruthy();
    expect(result.capitolo.id).toBe('v1-cap6');
    expect(result.esperimento.num).toBe(2);
  });

  it('findExperimentById returns null for unknown experiment', () => {
    const svc = createPercorsoService(sampleCapitoli);
    expect(svc.findExperimentById('nope-esp1')).toBe(null);
  });

  it('count = 4 sample Capitoli', () => {
    const svc = createPercorsoService(sampleCapitoli);
    expect(svc.listAllCapitoli().length).toBe(4);
  });
});

describe('percorsoService — real data integration', () => {
  it('default instance loads 35 Capitoli from src/data/capitoli/', async () => {
    const mod = await import('../../../src/services/percorsoService.js');
    const all = mod.default?.listAllCapitoli?.() ?? mod.listAllCapitoli?.();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBe(35);
  });

  it('default instance finds v1-cap6 LED', async () => {
    const mod = await import('../../../src/services/percorsoService.js');
    const getCap = mod.default?.getCapitolo ?? mod.getCapitolo;
    const cap = getCap('v1-cap6');
    expect(cap).toBeTruthy();
    expect(cap.titolo).toContain('LED');
  });

  it('default instance finds v3-cap9 Simon capstone (promoted)', async () => {
    const mod = await import('../../../src/services/percorsoService.js');
    const getCap = mod.default?.getCapitolo ?? mod.getCapitolo;
    const cap = getCap('v3-cap9');
    expect(cap).toBeTruthy();
    expect(cap.type).toBe('project');
  });
});
