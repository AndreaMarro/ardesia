/**
 * volumeReferencesQuality.test.js — Qualità contenuti VOLUME_REFERENCES
 *
 * Verifica che tutti gli 88 esperimenti abbiano campi di qualità completi:
 * - bookQuote: citazione/frase del libro
 * - bookContext: contesto narrativo dell'esperimento
 * - chapter: titolo del capitolo
 * - chapterPage: pagina di inizio capitolo
 *
 * Testa anche le funzioni helper getVolumeRef, getBookPage, getVolumeLabel
 * e la distribuzione per volume (Vol1: 38, Vol2: 27, Vol3: 23).
 *
 * (c) Andrea Marro — 17/04/2026 — ELAB Tutor
 */

import { describe, it, expect } from 'vitest';
import VOLUME_REFERENCES, {
  getVolumeRef,
  getBookPage,
  getVolumeLabel,
} from '../../../../packs/elab-tutor/data/volume-references.js';

const ALL_IDS = Object.keys(VOLUME_REFERENCES);
const ALL_REFS = Object.entries(VOLUME_REFERENCES);

// ─── Distribuzione per volume ─────────────────────────────────────────────
describe('Volume References — Distribuzione per volume', () => {
  it('Vol. 1 ha esattamente 38 esperimenti', () => {
    const v1 = ALL_REFS.filter(([, r]) => r.volume === 1);
    expect(v1.length).toBe(38);
  });

  it('Vol. 2 ha esattamente 27 esperimenti', () => {
    const v2 = ALL_REFS.filter(([, r]) => r.volume === 2);
    expect(v2.length).toBe(27);
  });

  it('Vol. 3 ha esattamente 23 esperimenti', () => {
    const v3 = ALL_REFS.filter(([, r]) => r.volume === 3);
    expect(v3.length).toBe(23);
  });

  it('totale esperimenti è 88', () => {
    expect(ALL_IDS.length).toBe(88);
  });

  it('tutti gli ID iniziano con v1-, v2- o v3-', () => {
    for (const id of ALL_IDS) {
      expect(id).toMatch(/^v[123]-/);
    }
  });

  it('nessun ID duplicato', () => {
    const unique = new Set(ALL_IDS);
    expect(unique.size).toBe(ALL_IDS.length);
  });
});

// ─── bookQuote ────────────────────────────────────────────────────────────
describe('Volume References — bookQuote', () => {
  it('dove presente, bookQuote è una stringa non vuota', () => {
    for (const [id, ref] of ALL_REFS) {
      if (ref.bookQuote !== undefined && ref.bookQuote !== null) {
        expect(typeof ref.bookQuote, `${id}: bookQuote deve essere stringa`).toBe('string');
        expect(ref.bookQuote.trim().length, `${id}: bookQuote vuoto`).toBeGreaterThan(0);
      }
    }
  });

  it('dove presente, bookQuote ha almeno 3 caratteri (può essere breve come "Magia!")', () => {
    for (const [id, ref] of ALL_REFS) {
      if (typeof ref.bookQuote === 'string' && ref.bookQuote.trim().length > 0) {
        expect(ref.bookQuote.length, `${id}: bookQuote troppo corto`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('dove presente, bookQuote non contiene placeholder "[TODO"', () => {
    for (const [id, ref] of ALL_REFS) {
      if (typeof ref.bookQuote === 'string') {
        expect(ref.bookQuote, `${id}: bookQuote contiene TODO`).not.toMatch(/\[TODO|TODO:/i);
      }
    }
  });

  it('almeno il 30% degli esperimenti ha bookQuote (coverage check)', () => {
    const withQuote = ALL_REFS.filter(([, r]) => typeof r.bookQuote === 'string' && r.bookQuote.trim().length > 0);
    expect(withQuote.length).toBeGreaterThanOrEqual(Math.floor(88 * 0.3));
  });

  it('primo esperimento v1-cap6-esp1 ha bookQuote del libro', () => {
    const ref = VOLUME_REFERENCES['v1-cap6-esp1'];
    expect(typeof ref.bookQuote).toBe('string');
    expect(ref.bookQuote).toContain('acceso');
  });
});

// ─── bookContext ──────────────────────────────────────────────────────────
describe('Volume References — bookContext', () => {
  it('tutti i 92 esperimenti hanno bookContext non-null', () => {
    const missing = ALL_REFS.filter(([, r]) => !r.bookContext || r.bookContext.trim() === '');
    expect(missing.map(([id]) => id), `Senza bookContext: ${missing.map(([id]) => id).join(', ')}`).toHaveLength(0);
  });

  it('tutti i bookContext hanno almeno 20 caratteri', () => {
    for (const [id, ref] of ALL_REFS) {
      expect(ref.bookContext.length, `${id}: bookContext troppo corto`).toBeGreaterThanOrEqual(20);
    }
  });

  it('nessun bookContext contiene placeholder "[TODO"', () => {
    for (const [id, ref] of ALL_REFS) {
      expect(ref.bookContext, `${id}: bookContext contiene TODO`).not.toMatch(/\[TODO|TODO:/i);
    }
  });
});

// ─── chapter e chapterPage ────────────────────────────────────────────────
describe('Volume References — chapter e chapterPage', () => {
  it('tutti i 92 esperimenti hanno chapter non-null', () => {
    const missing = ALL_REFS.filter(([, r]) => !r.chapter || r.chapter.trim() === '');
    expect(missing.map(([id]) => id)).toHaveLength(0);
  });

  it('tutti i 92 esperimenti hanno chapterPage > 0', () => {
    for (const [id, ref] of ALL_REFS) {
      expect(typeof ref.chapterPage, `${id}: chapterPage deve essere number`).toBe('number');
      expect(ref.chapterPage, `${id}: chapterPage deve essere > 0`).toBeGreaterThan(0);
    }
  });

  it('chapterPage <= bookPage per ogni esperimento (esperimento non prima del capitolo)', () => {
    for (const [id, ref] of ALL_REFS) {
      expect(ref.chapterPage, `${id}: chapterPage ${ref.chapterPage} > bookPage ${ref.bookPage}`).toBeLessThanOrEqual(ref.bookPage);
    }
  });

  it('tutti i chapter iniziano con "Capitolo" o "Extra"', () => {
    for (const [id, ref] of ALL_REFS) {
      expect(ref.chapter, `${id}: chapter non inizia con "Capitolo" o "Extra"`).toMatch(/^(capitolo|extra)/i);
    }
  });
});

// ─── bookInstructions qualità ─────────────────────────────────────────────
describe('Volume References — bookInstructions qualità', () => {
  it('tutti i bookInstructions sono array', () => {
    for (const [id, ref] of ALL_REFS) {
      expect(Array.isArray(ref.bookInstructions), `${id}: bookInstructions non è array`).toBe(true);
    }
  });

  it('tutti i bookInstructions hanno almeno 1 istruzione', () => {
    const empty = ALL_REFS.filter(([, r]) => !r.bookInstructions || r.bookInstructions.length === 0);
    expect(empty.map(([id]) => id)).toHaveLength(0);
  });

  it('ogni istruzione in bookInstructions è una stringa non vuota', () => {
    for (const [id, ref] of ALL_REFS) {
      for (let i = 0; i < ref.bookInstructions.length; i++) {
        const step = ref.bookInstructions[i];
        expect(typeof step, `${id}[${i}]: istruzione non è stringa`).toBe('string');
        expect(step.trim().length, `${id}[${i}]: istruzione vuota`).toBeGreaterThan(0);
      }
    }
  });
});

// ─── Helper functions ─────────────────────────────────────────────────────
describe('Volume References — getVolumeRef()', () => {
  it('getVolumeRef("v1-cap6-esp1") restituisce oggetto valido', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    expect(ref).not.toBeNull();
    expect(ref.volume).toBe(1);
    expect(ref.bookPage).toBeGreaterThan(0);
  });

  it('getVolumeRef con ID inesistente restituisce null', () => {
    expect(getVolumeRef('id-non-esiste')).toBeNull();
  });

  it('getVolumeRef("") restituisce null', () => {
    expect(getVolumeRef('')).toBeNull();
  });

  it('getVolumeRef(null) restituisce null (graceful)', () => {
    expect(getVolumeRef(null)).toBeNull();
  });

  it('getVolumeRef restituisce reference completa con tutti i campi', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    expect(ref).toHaveProperty('volume');
    expect(ref).toHaveProperty('bookPage');
    expect(ref).toHaveProperty('chapter');
    expect(ref).toHaveProperty('bookText');
    expect(ref).toHaveProperty('bookInstructions');
  });

  it('getVolumeRef su ID Vol2 restituisce volume 2', () => {
    const firstV2 = ALL_IDS.find(id => id.startsWith('v2-'));
    const ref = getVolumeRef(firstV2);
    expect(ref.volume).toBe(2);
  });

  it('getVolumeRef su ID Vol3 restituisce volume 3', () => {
    const firstV3 = ALL_IDS.find(id => id.startsWith('v3-'));
    const ref = getVolumeRef(firstV3);
    expect(ref.volume).toBe(3);
  });
});

describe('Volume References — getBookPage()', () => {
  it('getBookPage("v1-cap6-esp1") restituisce 29', () => {
    expect(getBookPage('v1-cap6-esp1')).toBe(29);
  });

  it('getBookPage con ID inesistente restituisce null', () => {
    expect(getBookPage('id-non-esiste')).toBeNull();
  });

  it('getBookPage restituisce sempre un numero positivo per ID validi', () => {
    for (const id of ALL_IDS.slice(0, 20)) {
      const page = getBookPage(id);
      expect(typeof page).toBe('number');
      expect(page).toBeGreaterThan(0);
    }
  });

  it('getBookPage(undefined) restituisce null (graceful)', () => {
    expect(getBookPage(undefined)).toBeNull();
  });
});

describe('Volume References — getVolumeLabel()', () => {
  it('getVolumeLabel("v1-cap6-esp1") restituisce "Vol. 1, p. 29"', () => {
    expect(getVolumeLabel('v1-cap6-esp1')).toBe('Vol. 1, p. 29');
  });

  it('getVolumeLabel con ID inesistente restituisce null', () => {
    expect(getVolumeLabel('id-non-esiste')).toBeNull();
  });

  it('getVolumeLabel ha formato "Vol. N, p. XX" per tutti gli ID validi (campione)', () => {
    for (const id of ALL_IDS.slice(0, 15)) {
      const label = getVolumeLabel(id);
      expect(label).toMatch(/^Vol\. [123], p\. \d+$/);
    }
  });

  it('getVolumeLabel per ID Vol2 inizia con "Vol. 2"', () => {
    const firstV2 = ALL_IDS.find(id => id.startsWith('v2-'));
    expect(getVolumeLabel(firstV2)).toMatch(/^Vol\. 2,/);
  });

  it('getVolumeLabel per ID Vol3 inizia con "Vol. 3"', () => {
    const firstV3 = ALL_IDS.find(id => id.startsWith('v3-'));
    expect(getVolumeLabel(firstV3)).toMatch(/^Vol\. 3,/);
  });
});

// ─── Coherence cross-checks ───────────────────────────────────────────────
describe('Volume References — Coerenza incrociata', () => {
  it('tutti gli ID v1- hanno volume === 1', () => {
    for (const id of ALL_IDS.filter(id => id.startsWith('v1-'))) {
      expect(VOLUME_REFERENCES[id].volume, `${id}: volume dovrebbe essere 1`).toBe(1);
    }
  });

  it('tutti gli ID v2- hanno volume === 2', () => {
    for (const id of ALL_IDS.filter(id => id.startsWith('v2-'))) {
      expect(VOLUME_REFERENCES[id].volume, `${id}: volume dovrebbe essere 2`).toBe(2);
    }
  });

  it('tutti gli ID v3- hanno volume === 3', () => {
    for (const id of ALL_IDS.filter(id => id.startsWith('v3-'))) {
      expect(VOLUME_REFERENCES[id].volume, `${id}: volume dovrebbe essere 3`).toBe(3);
    }
  });

  it('bookPage di Vol1 è nell\'intervallo 1–114 (PDF vol1 = 114 pp)', () => {
    for (const [id, ref] of ALL_REFS.filter(([, r]) => r.volume === 1)) {
      expect(ref.bookPage, `${id}: bookPage ${ref.bookPage} fuori range Vol1 (1-114)`).toBeLessThanOrEqual(114);
    }
  });

  it('bookPage di Vol2 è nell\'intervallo 1–117 (PDF vol2 = 117 pp)', () => {
    for (const [id, ref] of ALL_REFS.filter(([, r]) => r.volume === 2)) {
      expect(ref.bookPage, `${id}: bookPage ${ref.bookPage} fuori range Vol2 (1-117)`).toBeLessThanOrEqual(117);
    }
  });

  it('bookPage di Vol3 è nell\'intervallo 1-140', () => {
    for (const [id, ref] of ALL_REFS.filter(([, r]) => r.volume === 3)) {
      expect(ref.bookPage, `${id}: bookPage ${ref.bookPage} fuori range Vol3 (1-140)`).toBeLessThanOrEqual(140);
    }
  });
});
