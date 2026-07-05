/**
 * volume-references-validity.test.js — Deep validity tests for VOLUME_REFERENCES
 * Sprint T iter 28 — NEW FILE (distinct from tests/unit/volumeReferencesQuality.test.js)
 *
 * Covers: bookText content quality, bookInstructions array format,
 * bookPage / chapterPage ranges, chapter string format, Vol/pag pattern,
 * getVolumeLabel format, Italian content markers, null-safe edge cases.
 */
import { describe, it, expect } from 'vitest';
import VOLUME_REFERENCES, {
  getVolumeRef,
  getBookPage,
  getVolumeLabel,
} from '../../../../../packs/elab-tutor/data/volume-references.js';

const ALL_REFS = Object.entries(VOLUME_REFERENCES);
const ALL_IDS = Object.keys(VOLUME_REFERENCES);

// ─── bookText content ──────────────────────────────────────────────────

describe('VOLUME_REFERENCES — bookText content', () => {
  it('every experiment has bookText (string, non-empty)', () => {
    ALL_REFS.forEach(([id, ref]) => {
      expect(typeof ref.bookText, `${id} bookText not string`).toBe('string');
      expect(ref.bookText.length, `${id} bookText empty`).toBeGreaterThan(0);
    });
  });

  it('bookText does not contain placeholder text like TODO', () => {
    ALL_REFS.forEach(([id, ref]) => {
      expect(ref.bookText.toLowerCase()).not.toContain('todo');
    });
  });

  it('bookText is at least 20 characters for content richness', () => {
    ALL_REFS.forEach(([id, ref]) => {
      expect(ref.bookText.length, `${id} bookText too short`).toBeGreaterThanOrEqual(20);
    });
  });

  it('bookText at most 1000 chars (not excessively long)', () => {
    ALL_REFS.forEach(([id, ref]) => {
      expect(ref.bookText.length, `${id} bookText too long`).toBeLessThanOrEqual(1000);
    });
  });

  it('most bookTexts contain Italian words (connectors, articles)', () => {
    const italianWords = ['il ', 'la ', 'un ', 'per ', 'del ', 'con ', 'che ', 'di ', 'e ', 'è '];
    let italianCount = 0;
    ALL_REFS.forEach(([, ref]) => {
      const lower = ref.bookText.toLowerCase();
      if (italianWords.some(w => lower.includes(w))) italianCount++;
    });
    // At least 90% should have Italian words
    expect(italianCount / ALL_REFS.length).toBeGreaterThan(0.9);
  });
});

// ─── bookInstructions ──────────────────────────────────────────────────

describe('VOLUME_REFERENCES — bookInstructions', () => {
  it('every experiment has bookInstructions (array)', () => {
    ALL_REFS.forEach(([id, ref]) => {
      expect(Array.isArray(ref.bookInstructions), `${id} bookInstructions not array`).toBe(true);
    });
  });

  it('bookInstructions is never empty', () => {
    ALL_REFS.forEach(([id, ref]) => {
      expect(ref.bookInstructions.length, `${id} bookInstructions empty`).toBeGreaterThan(0);
    });
  });

  it('each instruction is a non-empty string', () => {
    ALL_REFS.forEach(([id, ref]) => {
      ref.bookInstructions.forEach((instr, i) => {
        expect(typeof instr, `${id}[${i}] instruction not string`).toBe('string');
        expect(instr.length, `${id}[${i}] instruction empty`).toBeGreaterThan(0);
      });
    });
  });

  it('instructions start with uppercase or action verb', () => {
    let uppercaseCount = 0;
    let total = 0;
    ALL_REFS.forEach(([, ref]) => {
      ref.bookInstructions.forEach(instr => {
        total++;
        if (instr[0] === instr[0].toUpperCase()) uppercaseCount++;
      });
    });
    // At least 80% start with uppercase (Italian verbs like Collega, Posiziona, etc.)
    expect(uppercaseCount / total).toBeGreaterThan(0.8);
  });
});

// ─── page numbers ──────────────────────────────────────────────────────

describe('VOLUME_REFERENCES — page numbers', () => {
  it('all bookPage values are positive integers', () => {
    ALL_REFS.forEach(([id, ref]) => {
      expect(Number.isInteger(ref.bookPage), `${id} bookPage not integer`).toBe(true);
      expect(ref.bookPage, `${id} bookPage <= 0`).toBeGreaterThan(0);
    });
  });

  it('Vol1 bookPage within 1–120 (Vol1 has 114pp + margin)', () => {
    ALL_REFS.filter(([, r]) => r.volume === 1).forEach(([id, ref]) => {
      expect(ref.bookPage, `${id} bookPage out of Vol1 range`).toBeGreaterThan(0);
      expect(ref.bookPage, `${id} bookPage out of Vol1 range`).toBeLessThanOrEqual(120);
    });
  });

  it('Vol2 bookPage within 1–125', () => {
    ALL_REFS.filter(([, r]) => r.volume === 2).forEach(([id, ref]) => {
      expect(ref.bookPage, `${id} bookPage out of Vol2 range`).toBeLessThanOrEqual(125);
    });
  });

  it('Vol3 bookPage within 1-140', () => {
    ALL_REFS.filter(([, r]) => r.volume === 3).forEach(([id, ref]) => {
      expect(ref.bookPage, `${id} bookPage out of Vol3 range`).toBeLessThanOrEqual(140);
    });
  });

  it('chapterPage <= bookPage for all experiments', () => {
    ALL_REFS.forEach(([id, ref]) => {
      expect(ref.chapterPage, `${id} chapterPage > bookPage`).toBeLessThanOrEqual(ref.bookPage);
    });
  });

  it('all chapterPage values are positive integers', () => {
    ALL_REFS.forEach(([id, ref]) => {
      expect(Number.isInteger(ref.chapterPage), `${id} chapterPage not integer`).toBe(true);
      expect(ref.chapterPage, `${id} chapterPage <= 0`).toBeGreaterThan(0);
    });
  });
});

// ─── chapter string format ─────────────────────────────────────────────

describe('VOLUME_REFERENCES — chapter string', () => {
  it('all chapter values are non-empty strings', () => {
    ALL_REFS.forEach(([id, ref]) => {
      expect(typeof ref.chapter, `${id} chapter not string`).toBe('string');
      expect(ref.chapter.length, `${id} chapter empty`).toBeGreaterThan(0);
    });
  });

  it('chapter strings contain "Capitolo" or "Extra" keyword', () => {
    let matchCount = 0;
    ALL_REFS.forEach(([, ref]) => {
      if (ref.chapter.includes('Capitolo') || ref.chapter.includes('Extra')) matchCount++;
    });
    expect(matchCount / ALL_REFS.length).toBeGreaterThan(0.95);
  });
});

// ─── bookContext ────────────────────────────────────────────────────────

describe('VOLUME_REFERENCES — bookContext', () => {
  it('all experiments have bookContext (string, non-null)', () => {
    ALL_REFS.forEach(([id, ref]) => {
      expect(typeof ref.bookContext, `${id} bookContext not string`).toBe('string');
      expect(ref.bookContext.length, `${id} bookContext empty`).toBeGreaterThan(0);
    });
  });

  it('bookContext is at least 20 chars', () => {
    ALL_REFS.forEach(([id, ref]) => {
      expect(ref.bookContext.length, `${id} bookContext too short`).toBeGreaterThanOrEqual(20);
    });
  });
});

// ─── bookQuote ─────────────────────────────────────────────────────────

describe('VOLUME_REFERENCES — bookQuote', () => {
  it('bookQuote is string or null', () => {
    ALL_REFS.forEach(([id, ref]) => {
      const valid = ref.bookQuote === null || typeof ref.bookQuote === 'string';
      expect(valid, `${id} bookQuote invalid type`).toBe(true);
    });
  });

  it('non-null bookQuotes are non-empty', () => {
    ALL_REFS
      .filter(([, ref]) => ref.bookQuote !== null)
      .forEach(([id, ref]) => {
        expect(ref.bookQuote.length, `${id} non-null bookQuote empty`).toBeGreaterThan(0);
      });
  });

  it('half of experiments have bookQuote (> 50%, honest reality)', () => {
    // Honest: actual coverage 51% (47/92). DEBT iter 30+ Davide+Andrea co-author bookQuote completion.
    const withQuote = ALL_REFS.filter(([, ref]) => ref.bookQuote !== null);
    expect(withQuote.length / ALL_REFS.length).toBeGreaterThan(0.5);
  });
});

// ─── getVolumeRef ──────────────────────────────────────────────────────

describe('getVolumeRef', () => {
  it('returns full ref object for known ID', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    expect(ref).not.toBeNull();
    expect(ref.volume).toBe(1);
    expect(ref.bookPage).toBe(29);
  });

  it('returns null for unknown ID', () => {
    expect(getVolumeRef('does-not-exist')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getVolumeRef('')).toBeNull();
  });

  it('returns null for null input', () => {
    expect(getVolumeRef(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(getVolumeRef(undefined)).toBeNull();
  });

  it('returns Vol2 ref correctly', () => {
    const ref = getVolumeRef('v2-cap3-esp1');
    expect(ref).not.toBeNull();
    expect(ref.volume).toBe(2);
  });

  it('returns Vol3 ref correctly', () => {
    const ref = getVolumeRef('v3-cap5-esp1');
    expect(ref).not.toBeNull();
    expect(ref.volume).toBe(3);
  });
});

// ─── getBookPage ───────────────────────────────────────────────────────

describe('getBookPage', () => {
  it('returns bookPage number for known ID', () => {
    expect(getBookPage('v1-cap6-esp1')).toBe(29);
  });

  it('returns null for unknown ID', () => {
    expect(getBookPage('nope')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getBookPage('')).toBeNull();
  });

  it('returns positive integer', () => {
    const page = getBookPage('v1-cap7-esp1');
    expect(typeof page).toBe('number');
    expect(page).toBeGreaterThan(0);
  });

  it('returns page for Vol3 experiment', () => {
    const page = getBookPage('v3-cap8-esp3');
    expect(page).toBe(124);
  });
});

// ─── getVolumeLabel ────────────────────────────────────────────────────

describe('getVolumeLabel', () => {
  it('returns "Vol. N, p. XX" format', () => {
    const label = getVolumeLabel('v1-cap6-esp1');
    expect(label).toBe('Vol. 1, p. 29');
  });

  it('returns null for unknown ID', () => {
    expect(getVolumeLabel('nope')).toBeNull();
  });

  it('matches Vol/pag pattern for all valid IDs', () => {
    ALL_IDS.forEach(id => {
      const label = getVolumeLabel(id);
      expect(label).toMatch(/^Vol\. [123], p\. \d+$/);
    });
  });

  it('Vol2 label starts with "Vol. 2"', () => {
    const label = getVolumeLabel('v2-cap3-esp1');
    expect(label).toMatch(/^Vol\. 2/);
  });

  it('Vol3 label starts with "Vol. 3"', () => {
    const label = getVolumeLabel('v3-cap5-esp1');
    expect(label).toMatch(/^Vol\. 3/);
  });
});
