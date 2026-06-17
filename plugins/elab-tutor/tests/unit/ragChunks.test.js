/**
 * ragChunks.test.js — Test per rag-chunks.json
 * Verifica integrita 549 chunk RAG: campi obbligatori, no duplicati, word counts
 */
import { describe, it, expect } from 'vitest';
import ragChunks from '../../src/data/rag-chunks.json';

describe('rag-chunks.json — struttura base', () => {
  it('e un array', () => {
    expect(Array.isArray(ragChunks)).toBe(true);
  });

  it('contiene esattamente 549 chunk', () => {
    expect(ragChunks.length).toBe(549);
  });

  it('non e vuoto', () => {
    expect(ragChunks.length).toBeGreaterThan(0);
  });
});

describe('rag-chunks.json — campi obbligatori', () => {
  it('ogni chunk ha campo id (stringa)', () => {
    ragChunks.forEach((chunk, i) => {
      expect(typeof chunk.id, `chunk[${i}] id non string`).toBe('string');
      expect(chunk.id.length, `chunk[${i}] id vuoto`).toBeGreaterThan(0);
    });
  });

  it('ogni chunk ha campo text (stringa non vuota)', () => {
    ragChunks.forEach((chunk, i) => {
      expect(typeof chunk.text, `chunk[${i}] text non string`).toBe('string');
      expect(chunk.text.length, `chunk[${i}] text vuoto`).toBeGreaterThan(0);
    });
  });

  it('ogni chunk ha campo volume (numero)', () => {
    ragChunks.forEach((chunk, i) => {
      expect(typeof chunk.volume, `chunk[${i}] volume non number`).toBe('number');
    });
  });

  it('ogni chunk ha campo chapter (numero o null)', () => {
    ragChunks.forEach((chunk, i) => {
      const valid = typeof chunk.chapter === 'number' || chunk.chapter === null;
      expect(valid, `chunk[${i}] chapter tipo inatteso: ${typeof chunk.chapter}`).toBe(true);
    });
  });

  it('ogni chunk ha campo wordCount (numero positivo)', () => {
    ragChunks.forEach((chunk, i) => {
      expect(typeof chunk.wordCount, `chunk[${i}] wordCount non number`).toBe('number');
      expect(chunk.wordCount, `chunk[${i}] wordCount <= 0`).toBeGreaterThan(0);
    });
  });

  it('ogni chunk ha campo source (stringa non vuota)', () => {
    ragChunks.forEach((chunk, i) => {
      expect(typeof chunk.source, `chunk[${i}] source non string`).toBe('string');
      expect(chunk.source.length, `chunk[${i}] source vuoto`).toBeGreaterThan(0);
    });
  });

  it('ogni chunk ha almeno 6 campi obbligatori', () => {
    const requiredKeys = ['id', 'text', 'volume', 'chapter', 'wordCount', 'source'];
    ragChunks.forEach((chunk, i) => {
      const keys = Object.keys(chunk);
      expect(keys.length, `chunk[${i}] ha meno di 6 campi`).toBeGreaterThanOrEqual(6);
      requiredKeys.forEach(key => {
        expect(keys, `chunk[${i}] manca ${key}`).toContain(key);
      });
    });
  });

  it('campi extra sono solo component (per error-guide)', () => {
    const allowedExtra = ['component', 'concept', 'term'];
    ragChunks.forEach((chunk, i) => {
      const requiredKeys = ['id', 'text', 'volume', 'chapter', 'wordCount', 'source'];
      const extraKeys = Object.keys(chunk).filter(k => !requiredKeys.includes(k));
      extraKeys.forEach(key => {
        expect(allowedExtra, `chunk[${i}] campo extra inatteso: ${key}`).toContain(key);
      });
    });
  });
});

describe('rag-chunks.json — no duplicati', () => {
  it('nessun ID duplicato', () => {
    const ids = ragChunks.map(c => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('nessun testo duplicato esatto', () => {
    const texts = ragChunks.map(c => c.text);
    const unique = new Set(texts);
    expect(unique.size).toBe(texts.length);
  });
});

describe('rag-chunks.json — volumi', () => {
  it('volume e 0, 1, 2 o 3', () => {
    const validVolumes = [0, 1, 2, 3];
    ragChunks.forEach((chunk, i) => {
      expect(validVolumes, `chunk[${i}] volume ${chunk.volume} non valido`).toContain(chunk.volume);
    });
  });

  it('ha chunk per Volume 1', () => {
    const v1 = ragChunks.filter(c => c.volume === 1);
    expect(v1.length).toBeGreaterThan(0);
  });

  it('ha chunk per Volume 2', () => {
    const v2 = ragChunks.filter(c => c.volume === 2);
    expect(v2.length).toBeGreaterThan(0);
  });

  it('ha chunk per Volume 3', () => {
    const v3 = ragChunks.filter(c => c.volume === 3);
    expect(v3.length).toBeGreaterThan(0);
  });

  it('ha chunk generici (volume 0)', () => {
    const v0 = ragChunks.filter(c => c.volume === 0);
    expect(v0.length).toBeGreaterThan(0);
  });

  it('la maggioranza dei chunk sono dei 3 volumi', () => {
    const volumeChunks = ragChunks.filter(c => c.volume >= 1);
    expect(volumeChunks.length).toBeGreaterThan(ragChunks.length / 2);
  });
});

describe('rag-chunks.json — word count', () => {
  it('wordCount minimo >= 1', () => {
    const min = Math.min(...ragChunks.map(c => c.wordCount));
    expect(min).toBeGreaterThanOrEqual(1);
  });

  it('wordCount massimo <= 500', () => {
    const max = Math.max(...ragChunks.map(c => c.wordCount));
    expect(max).toBeLessThanOrEqual(500);
  });

  it('wordCount medio ragionevole (20-200)', () => {
    const avg = ragChunks.reduce((sum, c) => sum + c.wordCount, 0) / ragChunks.length;
    expect(avg).toBeGreaterThan(20);
    expect(avg).toBeLessThan(200);
  });

  it('nessun chunk con wordCount NaN', () => {
    ragChunks.forEach((chunk, i) => {
      expect(Number.isNaN(chunk.wordCount), `chunk[${i}] wordCount is NaN`).toBe(false);
    });
  });

  it('nessun chunk con wordCount frazionario', () => {
    ragChunks.forEach((chunk, i) => {
      expect(Number.isInteger(chunk.wordCount), `chunk[${i}] wordCount non intero`).toBe(true);
    });
  });
});

describe('rag-chunks.json — source types', () => {
  const validSources = [
    'volume-pdf', 'code-example', 'experiment-tip', 'safety-guide',
    'error-guide', 'analogy', 'glossary', 'faq',
  ];

  it('source e uno dei tipi validi', () => {
    ragChunks.forEach((chunk, i) => {
      expect(validSources, `chunk[${i}] source "${chunk.source}" non valido`).toContain(chunk.source);
    });
  });

  it('ha chunk di tipo volume-pdf', () => {
    expect(ragChunks.some(c => c.source === 'volume-pdf')).toBe(true);
  });

  it('ha chunk di tipo code-example', () => {
    expect(ragChunks.some(c => c.source === 'code-example')).toBe(true);
  });

  it('ha chunk di tipo safety-guide', () => {
    expect(ragChunks.some(c => c.source === 'safety-guide')).toBe(true);
  });

  it('ha chunk di tipo analogy', () => {
    expect(ragChunks.some(c => c.source === 'analogy')).toBe(true);
  });

  it('ha chunk di tipo glossary', () => {
    expect(ragChunks.some(c => c.source === 'glossary')).toBe(true);
  });

  it('ha chunk di tipo faq', () => {
    expect(ragChunks.some(c => c.source === 'faq')).toBe(true);
  });

  it('ha chunk di tipo experiment-tip', () => {
    expect(ragChunks.some(c => c.source === 'experiment-tip')).toBe(true);
  });

  it('ha chunk di tipo error-guide', () => {
    expect(ragChunks.some(c => c.source === 'error-guide')).toBe(true);
  });
});

describe('rag-chunks.json — ID format', () => {
  it('ID dei chunk Volume 1 tipo volume-pdf iniziano con v1-chunk-', () => {
    ragChunks.filter(c => c.volume === 1 && c.source === 'volume-pdf').forEach(chunk => {
      expect(chunk.id).toMatch(/^v1-chunk-/);
    });
  });

  it('ID dei chunk Volume 2 tipo volume-pdf iniziano con v2-chunk-', () => {
    ragChunks.filter(c => c.volume === 2 && c.source === 'volume-pdf').forEach(chunk => {
      expect(chunk.id).toMatch(/^v2-chunk-/);
    });
  });

  it('ID dei chunk Volume 3 tipo volume-pdf iniziano con v3-chunk-', () => {
    ragChunks.filter(c => c.volume === 3 && c.source === 'volume-pdf').forEach(chunk => {
      expect(chunk.id).toMatch(/^v3-chunk-/);
    });
  });

  it('chapter numerico e sempre >= 0', () => {
    ragChunks.forEach((chunk, i) => {
      if (typeof chunk.chapter === 'number') {
        expect(chunk.chapter, `chunk[${i}] chapter negativo`).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it('text non contiene solo whitespace', () => {
    ragChunks.forEach((chunk, i) => {
      expect(chunk.text.trim().length, `chunk[${i}] text solo whitespace`).toBeGreaterThan(0);
    });
  });
});
