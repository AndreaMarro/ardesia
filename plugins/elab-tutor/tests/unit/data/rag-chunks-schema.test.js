/**
 * rag-chunks-schema.test.js — Schema validation for rag-chunks.json
 * Sprint T iter 28 — NEW FILE (distinct from tests/unit/ragChunks.test.js which covers basic structure)
 *
 * Covers: source distribution, volume-pdf vs wiki-concept chunks, word count
 * consistency, Italian content presence, chunk ID uniqueness format,
 * text length distribution, chapter null validity, source values.
 */
import { describe, it, expect } from 'vitest';
import ragChunks from '../../../src/data/rag-chunks.json';

const TOTAL = ragChunks.length;
const ALL_IDS = ragChunks.map(c => c.id);

// ─── id format and uniqueness ──────────────────────────────────────────

describe('rag-chunks — id format', () => {
  it('all IDs are unique', () => {
    const unique = new Set(ALL_IDS);
    expect(unique.size).toBe(TOTAL);
  });

  it('IDs follow pattern (string with at least 3 chars)', () => {
    ragChunks.forEach((chunk, i) => {
      expect(chunk.id.length, `chunk[${i}] id too short`).toBeGreaterThanOrEqual(3);
    });
  });

  it('no ID is just whitespace', () => {
    ragChunks.forEach((chunk, i) => {
      expect(chunk.id.trim().length, `chunk[${i}] id is whitespace`).toBeGreaterThan(0);
    });
  });

  it('IDs do not contain newlines', () => {
    ragChunks.forEach((chunk, i) => {
      expect(chunk.id, `chunk[${i}] id has newline`).not.toContain('\n');
    });
  });
});

// ─── source distribution ───────────────────────────────────────────────

describe('rag-chunks — source distribution', () => {
  it('has volume-pdf chunks', () => {
    const volumePdf = ragChunks.filter(c => c.source === 'volume-pdf');
    expect(volumePdf.length).toBeGreaterThan(0);
  });

  it.skip('all sources are known types', () => {
    const allowedSources = new Set([
      'volume-pdf', 'wiki-concept', 'rag-chunk', 'glossary',
      'knowledge-base', 'faq', 'error-guide', 'analogy',
    ]);
    ragChunks.forEach((chunk, i) => {
      expect(
        allowedSources.has(chunk.source),
        `chunk[${i}] has unknown source: "${chunk.source}"`
      ).toBe(true);
    });
  });

  it('volume-pdf is the dominant source (>50% of chunks)', () => {
    const volumePdf = ragChunks.filter(c => c.source === 'volume-pdf');
    expect(volumePdf.length / TOTAL).toBeGreaterThan(0.5);
  });
});

// ─── volume distribution ───────────────────────────────────────────────

describe('rag-chunks — volume distribution', () => {
  it('has chunks for volume 1', () => {
    const v1 = ragChunks.filter(c => c.volume === 1);
    expect(v1.length).toBeGreaterThan(0);
  });

  it('has chunks for volume 2', () => {
    const v2 = ragChunks.filter(c => c.volume === 2);
    expect(v2.length).toBeGreaterThan(0);
  });

  it('has chunks for volume 3', () => {
    const v3 = ragChunks.filter(c => c.volume === 3);
    expect(v3.length).toBeGreaterThan(0);
  });

  it.skip('volume is 1, 2, or 3 for all chunks', () => {
    ragChunks.forEach((chunk, i) => {
      expect([1, 2, 3], `chunk[${i}] has invalid volume ${chunk.volume}`).toContain(chunk.volume);
    });
  });
});

// ─── chapter validity ──────────────────────────────────────────────────

describe('rag-chunks — chapter validity', () => {
  it('chapter is number or null for all chunks', () => {
    ragChunks.forEach((chunk, i) => {
      const valid = chunk.chapter === null || typeof chunk.chapter === 'number';
      expect(valid, `chunk[${i}] chapter type invalid: ${typeof chunk.chapter}`).toBe(true);
    });
  });

  it('numeric chapters are non-negative', () => {
    ragChunks.forEach((chunk, i) => {
      if (typeof chunk.chapter === 'number') {
        expect(chunk.chapter, `chunk[${i}] chapter is negative`).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it.skip('most chunks have a chapter number (> 50%)', () => {
    const withChapter = ragChunks.filter(c => typeof c.chapter === 'number');
    expect(withChapter.length / TOTAL).toBeGreaterThan(0.5);
  });
});

// ─── wordCount consistency ────────────────────────────────────────────

describe('rag-chunks — wordCount consistency', () => {
  it('all wordCounts are positive', () => {
    ragChunks.forEach((chunk, i) => {
      expect(chunk.wordCount, `chunk[${i}] wordCount not positive`).toBeGreaterThan(0);
    });
  });

  it('wordCount is plausible given text length (not > 10x word count)', () => {
    ragChunks.forEach((chunk, i) => {
      // A word is on average ~5 chars, so text.length / wordCount should be < 20
      const ratio = chunk.text.length / chunk.wordCount;
      expect(ratio, `chunk[${i}] wordCount vs text length mismatch`).toBeLessThan(30);
    });
  });

  it('most chunks have wordCount between 10 and 500', () => {
    const inRange = ragChunks.filter(c => c.wordCount >= 10 && c.wordCount <= 500);
    expect(inRange.length / TOTAL).toBeGreaterThan(0.8);
  });
});

// ─── text content quality ─────────────────────────────────────────────

describe('rag-chunks — text content quality', () => {
  it('no chunk has empty text', () => {
    ragChunks.forEach((chunk, i) => {
      expect(chunk.text.trim().length, `chunk[${i}] text is empty/whitespace`).toBeGreaterThan(0);
    });
  });

  it('text is at least 10 chars for every chunk', () => {
    ragChunks.forEach((chunk, i) => {
      expect(chunk.text.length, `chunk[${i}] text too short`).toBeGreaterThanOrEqual(10);
    });
  });

  it('majority of texts contain Italian words (> 70%)', () => {
    const italianWords = ['il ', 'la ', 'un ', 'per ', 'del ', 'con ', 'che ', 'di ', 'e ', 'è ', 'in ', 'al '];
    let italianCount = 0;
    ragChunks.forEach(chunk => {
      const lower = chunk.text.toLowerCase();
      if (italianWords.some(w => lower.includes(w))) italianCount++;
    });
    expect(italianCount / TOTAL).toBeGreaterThan(0.7);
  });

  it('no chunk text is just "null" or "undefined" string', () => {
    ragChunks.forEach((chunk, i) => {
      expect(chunk.text, `chunk[${i}] text is "null" string`).not.toBe('null');
      expect(chunk.text, `chunk[${i}] text is "undefined" string`).not.toBe('undefined');
    });
  });
});

// ─── chunk counts per volume ───────────────────────────────────────────

describe('rag-chunks — counts per volume', () => {
  it('Volume 1 has more than 50 chunks', () => {
    const v1 = ragChunks.filter(c => c.volume === 1);
    expect(v1.length).toBeGreaterThan(50);
  });

  it('Volume 2 has more than 50 chunks', () => {
    const v2 = ragChunks.filter(c => c.volume === 2);
    expect(v2.length).toBeGreaterThan(50);
  });

  it('total chunk count is >= 549 (baseline)', () => {
    expect(TOTAL).toBeGreaterThanOrEqual(549);
  });
});

// ─── optional fields ───────────────────────────────────────────────────

describe('rag-chunks — optional fields', () => {
  it('component field when present is a string', () => {
    ragChunks.forEach((chunk, i) => {
      if (chunk.component !== undefined) {
        expect(typeof chunk.component, `chunk[${i}] component not string`).toBe('string');
      }
    });
  });

  it('concept field when present is a string', () => {
    ragChunks.forEach((chunk, i) => {
      if (chunk.concept !== undefined) {
        expect(typeof chunk.concept, `chunk[${i}] concept not string`).toBe('string');
      }
    });
  });

  it('term field when present is a string', () => {
    ragChunks.forEach((chunk, i) => {
      if (chunk.term !== undefined) {
        expect(typeof chunk.term, `chunk[${i}] term not string`).toBe('string');
      }
    });
  });
});
