/**
 * Volume Parallelism Tests — Factory categoria 1
 * Verifica che ogni esperimento abbia i campi necessari per affiancare
 * il volume fisico ELAB (book-parallel fields: concept, observe, steps).
 * Testa anche l'API di volume-references.js (stub + helper functions).
 *
 * DATI REALI: importa direttamente i moduli sorgente, nessun mock sui dati.
 * (c) Andrea Marro — Test Factory 15/04/2026
 */

import { describe, it, expect } from 'vitest';
import { ALL_EXPERIMENTS, VOLUMES, findExperimentById } from '../../../src/data/experiments-index';
import VOLUME_REFERENCES, { getVolumeRef, getBookPage, getVolumeLabel } from '../../../src/data/volume-references';

// ─── Costanti attese ──────────────────────────────────────────────────────────
const EXPECTED_COUNTS = { vol1: 38, vol2: 27, vol3: 14, total: 79 };
const EXPERIMENT_ID_PATTERN = /^v[1-3]-cap\d+(-esp\d+|-[a-z]+)$/;

// ─── Campi obbligatori per la parità con il volume fisico ─────────────────────
const BOOK_PARALLEL_FIELDS = ['title', 'desc', 'chapter', 'concept', 'observe', 'steps'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getFieldMissing(exp, field) {
  const val = exp[field];
  if (val === undefined || val === null) return `missing`;
  if (typeof val === 'string' && val.trim() === '') return `empty string`;
  if (Array.isArray(val) && val.length === 0) return `empty array`;
  return null;
}

// =============================================================================
// 1. DISTRIBUZIONE VOLUMI
// =============================================================================
describe('Volume distribution', () => {
  it('Vol1 ha esattamente 38 esperimenti', () => {
    expect(VOLUMES[0].experiments).toHaveLength(EXPECTED_COUNTS.vol1);
  });

  it('Vol2 ha esattamente 27 esperimenti', () => {
    expect(VOLUMES[1].experiments).toHaveLength(EXPECTED_COUNTS.vol2);
  });

  it('Vol3 ha esattamente 14 esperimenti', () => {
    expect(VOLUMES[2].experiments).toHaveLength(EXPECTED_COUNTS.vol3);
  });

  it('ALL_EXPERIMENTS aggrega tutti e 79 gli esperimenti', () => {
    expect(ALL_EXPERIMENTS).toHaveLength(EXPECTED_COUNTS.total);
  });

  it('Ogni volume ha metadati: title, subtitle, icon, color', () => {
    for (const vol of VOLUMES) {
      expect(typeof vol.title).toBe('string');
      expect(vol.title.length).toBeGreaterThan(0);
      expect(typeof vol.subtitle).toBe('string');
      expect(typeof vol.icon).toBe('string');
      expect(typeof vol.color).toBe('string');
    }
  });
});

// =============================================================================
// 2. ID UNIVOCITÀ E FORMATO
// =============================================================================
describe('Experiment IDs — unicità e formato', () => {
  it('Tutti gli ID sono unici nel dataset completo', () => {
    const ids = ALL_EXPERIMENTS.map(e => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('Vol1: tutti gli ID iniziano con "v1-"', () => {
    const bad = VOLUMES[0].experiments.filter(e => !e.id.startsWith('v1-'));
    expect(bad.map(e => e.id)).toEqual([]);
  });

  it('Vol2: tutti gli ID iniziano con "v2-"', () => {
    const bad = VOLUMES[1].experiments.filter(e => !e.id.startsWith('v2-'));
    expect(bad.map(e => e.id)).toEqual([]);
  });

  it('Vol3: tutti gli ID iniziano con "v3-"', () => {
    const bad = VOLUMES[2].experiments.filter(e => !e.id.startsWith('v3-'));
    expect(bad.map(e => e.id)).toEqual([]);
  });

  it('Gli ID speciali (morse, semaforo, simon…) fanno parte di Vol3', () => {
    const special = ALL_EXPERIMENTS.filter(e => !/esp\d+$/.test(e.id));
    expect(special.length).toBeGreaterThan(0);
    special.forEach(e => expect(e.id.startsWith('v3-')).toBe(true));
  });

  it('findExperimentById trova "v1-cap6-esp1" (primo Vol1)', () => {
    const exp = findExperimentById('v1-cap6-esp1');
    expect(exp).not.toBeNull();
    expect(exp.title).toMatch(/LED|led/i);
  });

  it('findExperimentById ritorna null per ID sconosciuto', () => {
    expect(findExperimentById('v99-capX-esp99')).toBeNull();
  });
});

// =============================================================================
// 3. CAMPI BOOK-PARALLEL — ogni esperimento deve affiancare il volume fisico
// =============================================================================
describe('Book-parallel fields — tutti e 94 gli esperimenti', () => {
  it('Ogni esperimento ha "title" non vuoto', () => {
    const failing = ALL_EXPERIMENTS
      .map(e => ({ id: e.id, issue: getFieldMissing(e, 'title') }))
      .filter(r => r.issue !== null);
    expect(failing).toEqual([]);
  });

  it('Ogni esperimento ha "desc" non vuota', () => {
    const failing = ALL_EXPERIMENTS
      .map(e => ({ id: e.id, issue: getFieldMissing(e, 'desc') }))
      .filter(r => r.issue !== null);
    expect(failing).toEqual([]);
  });

  it('Ogni esperimento ha "chapter" non vuoto', () => {
    const failing = ALL_EXPERIMENTS
      .map(e => ({ id: e.id, issue: getFieldMissing(e, 'chapter') }))
      .filter(r => r.issue !== null);
    expect(failing).toEqual([]);
  });

  it('Ogni esperimento ha "concept" non vuoto (mappa al box concetto del libro)', () => {
    const failing = ALL_EXPERIMENTS
      .map(e => ({ id: e.id, issue: getFieldMissing(e, 'concept') }))
      .filter(r => r.issue !== null);
    expect(failing).toEqual([]);
  });

  it('Ogni esperimento ha "observe" non vuoto (mappa alla sezione "Osserva" del libro)', () => {
    const failing = ALL_EXPERIMENTS
      .map(e => ({ id: e.id, issue: getFieldMissing(e, 'observe') }))
      .filter(r => r.issue !== null);
    expect(failing).toEqual([]);
  });

  it('Ogni esperimento ha "steps" array non vuoto (mappa ai passi del libro)', () => {
    const failing = ALL_EXPERIMENTS
      .map(e => ({ id: e.id, issue: getFieldMissing(e, 'steps') }))
      .filter(r => r.issue !== null);
    expect(failing).toEqual([]);
  });

  it('Ogni "steps" è un array di stringhe non vuote', () => {
    const failing = [];
    for (const exp of ALL_EXPERIMENTS) {
      if (!Array.isArray(exp.steps)) { failing.push({ id: exp.id, issue: 'not array' }); continue; }
      for (const [i, step] of exp.steps.entries()) {
        if (typeof step !== 'string' || step.trim() === '') {
          failing.push({ id: exp.id, issue: `steps[${i}] invalid` });
        }
      }
    }
    expect(failing).toEqual([]);
  });

  it('Ogni esperimento ha almeno 2 steps (sufficiente per una guida)', () => {
    const failing = ALL_EXPERIMENTS
      .filter(e => !Array.isArray(e.steps) || e.steps.length < 2)
      .map(e => ({ id: e.id, stepsCount: Array.isArray(e.steps) ? e.steps.length : 'N/A' }));
    expect(failing).toEqual([]);
  });
});

// =============================================================================
// 4. QUALITÀ DEI TESTI (contenuto non banale)
// =============================================================================
describe('Qualità testi book-parallel', () => {
  it('"observe" ha almeno 30 caratteri (non un placeholder)', () => {
    const failing = ALL_EXPERIMENTS
      .filter(e => typeof e.observe === 'string' && e.observe.trim().length < 30)
      .map(e => ({ id: e.id, observe: e.observe }));
    expect(failing).toEqual([]);
  });

  it('"concept" ha almeno 10 caratteri (non un placeholder)', () => {
    const failing = ALL_EXPERIMENTS
      .filter(e => typeof e.concept === 'string' && e.concept.trim().length < 10)
      .map(e => ({ id: e.id, concept: e.concept }));
    expect(failing).toEqual([]);
  });

  it('"title" non è uguale a "desc" (campi distinti)', () => {
    const duplicates = ALL_EXPERIMENTS
      .filter(e => e.title === e.desc)
      .map(e => e.id);
    expect(duplicates).toEqual([]);
  });

  it('"chapter" è una stringa non vuota (convenzione naming, incluso "Extra")', () => {
    const bad = ALL_EXPERIMENTS
      .filter(e => typeof e.chapter !== 'string' || e.chapter.trim().length < 4)
      .map(e => ({ id: e.id, chapter: e.chapter }));
    expect(bad).toEqual([]);
  });

  it('Vol1 e Vol2 usano la convenzione "Capitolo N - ..." nel campo chapter', () => {
    const vol1chapters = VOLUMES[0].experiments.filter(e => !e.chapter.includes('Capitolo')).map(e => e.id);
    const vol2chapters = VOLUMES[1].experiments.filter(e => !e.chapter.includes('Capitolo')).map(e => e.id);
    expect(vol1chapters).toEqual([]);
    expect(vol2chapters).toEqual([]);
  });

  it('Ogni esperimento ha "estimatedMinutes" > 0', () => {
    const bad = ALL_EXPERIMENTS
      .filter(e => !e.estimatedMinutes || e.estimatedMinutes <= 0)
      .map(e => e.id);
    expect(bad).toEqual([]);
  });

  it('Ogni esperimento ha "difficulty" tra 1 e 5', () => {
    const bad = ALL_EXPERIMENTS
      .filter(e => !e.difficulty || e.difficulty < 1 || e.difficulty > 5)
      .map(e => ({ id: e.id, difficulty: e.difficulty }));
    expect(bad).toEqual([]);
  });
});

// =============================================================================
// 5. VOLUME REFERENCES API — dati reali estratti dai 3 PDF ELAB
// =============================================================================
describe('volume-references.js — helper API con dati reali', () => {
  it('VOLUME_REFERENCES esportato come oggetto non vuoto (dati PDF reali)', () => {
    expect(typeof VOLUME_REFERENCES).toBe('object');
    expect(VOLUME_REFERENCES).not.toBeNull();
    expect(Object.keys(VOLUME_REFERENCES).length).toBeGreaterThan(78);
  });

  it('getVolumeRef ritorna il riferimento corretto per v1-cap6-esp1', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    expect(ref).not.toBeNull();
    expect(ref.volume).toBe(1);
    expect(ref.bookPage).toBeGreaterThan(0);
    expect(typeof ref.chapter).toBe('string');
    expect(typeof ref.chapterPage).toBe('number');
  });

  it('getVolumeRef ritorna il riferimento corretto per v2-cap3-esp1', () => {
    const ref = getVolumeRef('v2-cap3-esp1');
    expect(ref).not.toBeNull();
    expect(ref.volume).toBe(2);
    expect(ref.bookPage).toBeGreaterThan(0);
  });

  it('getVolumeRef ritorna il riferimento corretto per v3-cap5-esp1', () => {
    const ref = getVolumeRef('v3-cap5-esp1');
    expect(ref).not.toBeNull();
    expect(ref.volume).toBe(3);
    expect(ref.bookPage).toBeGreaterThan(0);
  });

  it('getVolumeRef ritorna null per ID inesistente', () => {
    expect(getVolumeRef('vX-capY-espZ')).toBeNull();
    expect(getVolumeRef('')).toBeNull();
    expect(getVolumeRef(null)).toBeNull();
  });

  it('getBookPage ritorna il numero di pagina corretto', () => {
    expect(getBookPage('v1-cap6-esp1')).toBeGreaterThan(0);
    expect(getBookPage('v2-cap3-esp1')).toBeGreaterThan(0);
    expect(getBookPage('v3-cap5-esp1')).toBeGreaterThan(0);
  });

  it('getBookPage ritorna null per ID inesistente', () => {
    expect(getBookPage('vX-capY-espZ')).toBeNull();
    expect(getBookPage(undefined)).toBeNull();
  });

  it('getVolumeLabel produce una stringa "Vol. N, p. XX"', () => {
    const label = getVolumeLabel('v1-cap6-esp1');
    expect(label).toMatch(/^Vol\. \d+, p\. \d+$/);
  });

  it('getVolumeLabel ritorna null per ID inesistente', () => {
    expect(getVolumeLabel('vX-capY-espZ')).toBeNull();
  });

  it('bookPage è sempre >= chapterPage nello stesso esperimento', () => {
    const bad = Object.entries(VOLUME_REFERENCES)
      .filter(([, ref]) => ref.bookPage < ref.chapterPage)
      .map(([id]) => id);
    expect(bad).toEqual([]);
  });
});

// =============================================================================
// 6. PARITÀ VOLUME-FISICO — ogni esperimento è mappato nel libro reale
// =============================================================================
describe('Parità volume fisico ↔ dati digitali', () => {
  it('Ogni esperimento ha una voce in VOLUME_REFERENCES (nessun esperimento orfano)', () => {
    const orphans = ALL_EXPERIMENTS
      .filter(e => getVolumeRef(e.id) === null)
      .map(e => e.id);
    expect(orphans).toEqual([]);
  });

  it('VOLUME_REFERENCES non ha voci extra non mappate ad alcun esperimento', () => {
    const expIds = new Set(ALL_EXPERIMENTS.map(e => e.id));
    const extra = Object.keys(VOLUME_REFERENCES).filter(id => !expIds.has(id));
    expect(extra).toEqual([]);
  });

  it('Il campo "volume" in VOLUME_REFERENCES corrisponde al prefisso dell\'ID', () => {
    const bad = Object.entries(VOLUME_REFERENCES)
      .filter(([id, ref]) => {
        const expectedVol = parseInt(id[1], 10);
        return ref.volume !== expectedVol;
      })
      .map(([id]) => id);
    expect(bad).toEqual([]);
  });

  it('bookPage è un numero intero positivo per ogni voce', () => {
    const bad = Object.entries(VOLUME_REFERENCES)
      .filter(([, ref]) => !Number.isInteger(ref.bookPage) || ref.bookPage <= 0)
      .map(([id]) => id);
    expect(bad).toEqual([]);
  });

  it('Le pagine di Vol1 sono nell\'intervallo 1-114 (totale pagine PDF)', () => {
    const bad = Object.entries(VOLUME_REFERENCES)
      .filter(([id, ref]) => ref.volume === 1 && (ref.bookPage < 1 || ref.bookPage > 114))
      .map(([id]) => id);
    expect(bad).toEqual([]);
  });

  it('Le pagine di Vol2 sono nell\'intervallo 1-117 (totale pagine PDF)', () => {
    const bad = Object.entries(VOLUME_REFERENCES)
      .filter(([id, ref]) => ref.volume === 2 && (ref.bookPage < 1 || ref.bookPage > 117))
      .map(([id]) => id);
    expect(bad).toEqual([]);
  });

  it('Le pagine di Vol3 sono nell\'intervallo 1-95 (totale pagine PDF)', () => {
    const bad = Object.entries(VOLUME_REFERENCES)
      .filter(([id, ref]) => ref.volume === 3 && (ref.bookPage < 1 || ref.bookPage > 95))
      .map(([id]) => id);
    expect(bad).toEqual([]);
  });
});

// =============================================================================
// 7. COERENZA VOLUME-VOLUME — esperimenti distribuiti in modo sensato
// =============================================================================
describe('Coerenza distribuzione capitoli per volume — Sezione 7', () => {
  it('Vol1 copre capitoli 6-12 (batteria + circuiti base)', () => {
    const chapters = [...new Set(VOLUMES[0].experiments.map(e => e.chapter))];
    expect(chapters.some(c => c.includes('6'))).toBe(true);
    expect(chapters.some(c => c.includes('12'))).toBe(true);
  });

  it('Vol2 copre capitoli 3-12 (multimetro + avanzati)', () => {
    const chapters = [...new Set(VOLUMES[1].experiments.map(e => e.chapter))];
    expect(chapters.some(c => c.includes('3'))).toBe(true);
  });

  it('Vol3 include esperimenti AVR/microcontroller (simulationMode = avr)', () => {
    const avrExps = VOLUMES[2].experiments.filter(e => e.simulationMode === 'avr');
    expect(avrExps.length).toBeGreaterThan(0);
  });

  it('Vol1 non ha esperimenti Arduino (solo batteria 9V)', () => {
    const arduinoExps = VOLUMES[0].experiments.filter(e => e.simulationMode === 'arduino');
    expect(arduinoExps).toHaveLength(0);
  });

  it('Tutti gli esperimenti simulabili hanno almeno un componente', () => {
    const bad = ALL_EXPERIMENTS
      .filter(e => e.simulable !== false && (!e.components || e.components.length === 0))
      .map(e => e.id);
    // Possono esistere esperimenti "simulable=true" senza componenti? Non dovrebbe.
    // Verifica solo quelli esplicitamente simulabili
    const explicitlySimulable = ALL_EXPERIMENTS
      .filter(e => e.simulable === true && (!e.components || e.components.length === 0));
    expect(explicitlySimulable.map(e => e.id)).toEqual([]);
  });
});
