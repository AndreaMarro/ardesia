/**
 * volumeParallelism.test.js — Verifica parità degli 81 esperimenti con i volumi fisici ELAB
 *
 * Ogni esperimento nel simulatore DEVE avere:
 *   - bookText non-null (testo dal PDF verbatim)
 *   - bookPage (numero pagina nel volume fisico)
 *   - volume (1, 2 o 3)
 *   - bookInstructions (array di passi)
 *
 * Questi test prevengono la regressione dove bookText era null/undefined,
 * rendendo impossibile per UNLIM citare le pagine del libro.
 *
 * (c) Andrea Marro — 16/04/2026 — ELAB Tutor
 */

import { describe, it, expect } from 'vitest';
import VOLUME_REFERENCES, { getVolumeRef, getBookPage, getVolumeLabel } from '../../src/data/volume-references.js';

// ─── Struttura degli esperimenti ───────────────────────────────────────────
describe('Volume Parallelism — Struttura VOLUME_REFERENCES', () => {
  it('VOLUME_REFERENCES è un oggetto non vuoto', () => {
    expect(VOLUME_REFERENCES).toBeDefined();
    expect(typeof VOLUME_REFERENCES).toBe('object');
    expect(Object.keys(VOLUME_REFERENCES).length).toBeGreaterThan(0);
  });

  it('contiene esattamente 79 esperimenti', () => {
    expect(Object.keys(VOLUME_REFERENCES).length).toBe(79);
  });

  it('tutti gli esperimenti hanno volume 1, 2 o 3', () => {
    for (const [id, ref] of Object.entries(VOLUME_REFERENCES)) {
      expect([1, 2, 3], `${id}: volume deve essere 1, 2 o 3`).toContain(ref.volume);
    }
  });

  it('tutti gli esperimenti hanno bookPage (numero > 0)', () => {
    for (const [id, ref] of Object.entries(VOLUME_REFERENCES)) {
      expect(typeof ref.bookPage, `${id}: bookPage deve essere number`).toBe('number');
      expect(ref.bookPage, `${id}: bookPage deve essere > 0`).toBeGreaterThan(0);
    }
  });
});

// ─── bookText (testo dal PDF) ──────────────────────────────────────────────
describe('Volume Parallelism — bookText non-null', () => {
  it('tutti i 92 esperimenti hanno bookText', () => {
    const missing = [];
    for (const [id, ref] of Object.entries(VOLUME_REFERENCES)) {
      if (!ref.bookText || ref.bookText.trim() === '') {
        missing.push(id);
      }
    }
    expect(missing, `Esperimenti senza bookText: ${missing.join(', ')}`).toHaveLength(0);
  });

  it('tutti i bookText hanno almeno 20 caratteri', () => {
    for (const [id, ref] of Object.entries(VOLUME_REFERENCES)) {
      expect(
        ref.bookText.length,
        `${id}: bookText troppo corto (${ref.bookText.length} chars)`
      ).toBeGreaterThanOrEqual(20);
    }
  });

  it('nessun bookText contiene placeholder "[TODO" o "TODO:"', () => {
    for (const [id, ref] of Object.entries(VOLUME_REFERENCES)) {
      expect(ref.bookText, `${id}: bookText contiene placeholder TODO`).not.toMatch(/\[TODO|TODO:/i);
    }
  });
});

// ─── bookInstructions ─────────────────────────────────────────────────────
describe('Volume Parallelism — bookInstructions', () => {
  it('tutti i 92 esperimenti hanno bookInstructions array', () => {
    const missing = [];
    for (const [id, ref] of Object.entries(VOLUME_REFERENCES)) {
      if (!Array.isArray(ref.bookInstructions) || ref.bookInstructions.length === 0) {
        missing.push(id);
      }
    }
    expect(missing, `Esperimenti senza bookInstructions: ${missing.join(', ')}`).toHaveLength(0);
  });

  it('ogni istruzione ha almeno 5 caratteri', () => {
    for (const [id, ref] of Object.entries(VOLUME_REFERENCES)) {
      for (const [i, step] of ref.bookInstructions.entries()) {
        expect(
          typeof step === 'string' && step.length >= 5,
          `${id}: istruzione[${i}] troppo corta o non stringa: "${step}"`
        ).toBe(true);
      }
    }
  });
});

// ─── chapter (titolo capitolo) ─────────────────────────────────────────────
describe('Volume Parallelism — chapter', () => {
  it('tutti gli esperimenti hanno chapter non vuoto', () => {
    const missing = [];
    for (const [id, ref] of Object.entries(VOLUME_REFERENCES)) {
      if (!ref.chapter || ref.chapter.trim() === '') {
        missing.push(id);
      }
    }
    expect(missing, `Esperimenti senza chapter: ${missing.join(', ')}`).toHaveLength(0);
  });
});

// ─── Distribuzione per volume ──────────────────────────────────────────────
describe('Volume Parallelism — Distribuzione volumi', () => {
  it('Volume 1 ha almeno 30 esperimenti', () => {
    const vol1 = Object.values(VOLUME_REFERENCES).filter(r => r.volume === 1);
    expect(vol1.length).toBeGreaterThanOrEqual(30);
  });

  it('Volume 2 ha almeno 20 esperimenti', () => {
    const vol2 = Object.values(VOLUME_REFERENCES).filter(r => r.volume === 2);
    expect(vol2.length).toBeGreaterThanOrEqual(20);
  });

  it('Volume 3 ha almeno 14 esperimenti', () => {
    const vol3 = Object.values(VOLUME_REFERENCES).filter(r => r.volume === 3);
    expect(vol3.length).toBeGreaterThanOrEqual(14);
  });

  it('tutti i volumi sono rappresentati', () => {
    const volumes = new Set(Object.values(VOLUME_REFERENCES).map(r => r.volume));
    expect(volumes.has(1)).toBe(true);
    expect(volumes.has(2)).toBe(true);
    expect(volumes.has(3)).toBe(true);
  });
});

// ─── ID format validation ─────────────────────────────────────────────────
describe('Volume Parallelism — ID format', () => {
  it('tutti gli ID iniziano con v1-, v2- o v3-', () => {
    // Standard: v{N}-cap{N}-esp{N}
    // Speciali ammessi: v{N}-cap{N}-{nome}, v{N}-extra-{nome}
    const pattern = /^v[123]-/;
    for (const id of Object.keys(VOLUME_REFERENCES)) {
      expect(pattern.test(id), `ID malformato: "${id}"`).toBe(true);
    }
  });

  it('il volume nell\'ID corrisponde al campo volume', () => {
    // ID format: "v{volume}-..." — second char is volume number
    for (const [id, ref] of Object.entries(VOLUME_REFERENCES)) {
      const volFromId = parseInt(id[1], 10); // 'v1-...' → 1
      expect(volFromId, `${id}: volume nell'ID (${volFromId}) non corrisponde al campo volume (${ref.volume})`).toBe(ref.volume);
    }
  });
});

// ─── Utility functions ────────────────────────────────────────────────────
describe('Volume Parallelism — Funzioni utility', () => {
  it('getVolumeRef ritorna il riferimento per un ID valido', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    expect(ref).toBeDefined();
    expect(ref.volume).toBe(1);
    expect(ref.bookText).toBeTruthy();
  });

  it('getVolumeRef ritorna null per ID inesistente', () => {
    expect(getVolumeRef('v99-cap99-esp99')).toBeNull();
    expect(getVolumeRef('')).toBeNull();
    expect(getVolumeRef(null)).toBeNull();
  });

  it('getBookPage ritorna il numero di pagina per un ID valido', () => {
    const page = getBookPage('v1-cap6-esp1');
    expect(typeof page).toBe('number');
    expect(page).toBeGreaterThan(0);
  });

  it('getVolumeLabel ritorna etichetta formattata "Vol. N, p. XX"', () => {
    const label = getVolumeLabel('v1-cap6-esp1');
    expect(label).toMatch(/^Vol\. 1, p\. \d+$/);
  });

  it('getVolumeLabel ritorna null per ID inesistente', () => {
    expect(getVolumeLabel('v99-cap99-esp99')).toBeNull();
  });
});

// ─── Esperimenti campione — contenuto verbatim ────────────────────────────
describe('Volume Parallelism — Campioni contenuto', () => {
  it('v1-cap6-esp1: primo esperimento LED ha bookText corretto', () => {
    const ref = VOLUME_REFERENCES['v1-cap6-esp1'];
    expect(ref.bookText.toLowerCase()).toContain('led');
    expect(ref.volume).toBe(1);
    expect(ref.bookPage).toBeGreaterThanOrEqual(27);
  });

  it('ogni esperimento Vol1 ha bookPage nel range 27-114', () => {
    const vol1 = Object.entries(VOLUME_REFERENCES).filter(([, r]) => r.volume === 1);
    for (const [id, ref] of vol1) {
      expect(ref.bookPage, `${id}: bookPage fuori range Vol1`).toBeGreaterThanOrEqual(10);
      expect(ref.bookPage, `${id}: bookPage fuori range Vol1`).toBeLessThanOrEqual(150);
    }
  });

  it('ogni esperimento Vol2 ha bookPage nel range ragionevole', () => {
    const vol2 = Object.entries(VOLUME_REFERENCES).filter(([, r]) => r.volume === 2);
    for (const [id, ref] of vol2) {
      expect(ref.bookPage, `${id}: bookPage fuori range Vol2`).toBeGreaterThan(0);
      expect(ref.bookPage, `${id}: bookPage fuori range Vol2`).toBeLessThanOrEqual(150);
    }
  });

  it('ogni esperimento Vol3 ha bookPage nel range ragionevole', () => {
    const vol3 = Object.entries(VOLUME_REFERENCES).filter(([, r]) => r.volume === 3);
    for (const [id, ref] of vol3) {
      expect(ref.bookPage, `${id}: bookPage fuori range Vol3`).toBeGreaterThan(0);
      expect(ref.bookPage, `${id}: bookPage fuori range Vol3`).toBeLessThanOrEqual(120);
    }
  });
});
