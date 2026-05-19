// rag-backfill-matcher.test.js — Sprint S iter 12 P0
//
// Asserts that the RAG metadata backfill matcher correctly resolves
// three source schemes:
//   Path A — legacy 'vol1' or 'vol2' or 'vol3' → fuzzy match v1-, v2-, v3- lessons
//   Path C — topic-ID (wiki concept kebab-case) → frontmatter lookup
//   null   — unknown / empty / null source
//
// Background: pre-iter-12 the matcher assumed only Path A and silently
// returned null for the entire Supabase rag_chunks table (sources are
// topic-IDs like 'blink-led', not 'vol1'). Dry-run 2026-05-10T17:42 =
// 0/1000 match. After iter-12 patch dry-run 2026-05-10T20:04 = 830/1000
// match (full Vol1+Vol2+Vol3 + 100+ wiki concepts).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  loadTopicToVolume,
  fuzzyMatchChunkToLesson,
  _resetTopicToVolumeCache,
} from '../../../scripts/backfill/match-chunks-to-lessons.mjs';

// ─────────────────────────────────────────────────
// Minimal volume-references shaped to exercise Path A (legacy fuzzy match).
// Mirrors the real shape used by buildMatches: bookPage / chapter / bookText /
// bookInstructions array.
// ─────────────────────────────────────────────────
const FAKE_REFS = {
  'v1-cap6-esp1': {
    volume: 1,
    bookPage: 29,
    chapter: "Capitolo 6 - Cos'è il diodo LED?",
    chapterPage: 27,
    bookText:
      'Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di: Un LED, una breadboard, una batteria 9V, la clip per la batteria 9V, un resistore da 470 Ohm.',
    bookInstructions: [
      'Collega la clip della batteria alla batteria',
      'Collega il positivo della batteria alla striscia rossa superiore della breadboard',
    ],
  },
  'v1-cap6-esp2': {
    volume: 1,
    bookPage: 32,
    chapter: "Capitolo 6 - Cos'è il diodo LED?",
    chapterPage: 27,
    bookText:
      'Il nostro circuito include un resistore, ma perche? I resistori servono per limitare la corrente.',
    bookInstructions: ['Collega il LED direttamente alla batteria senza resistore'],
  },
  'v3-cap6-esp1': {
    volume: 3,
    bookPage: 47,
    chapter: 'Capitolo 6 - Blink',
    chapterPage: 45,
    bookText:
      'Il programma Blink è il primo programma Arduino: accende e spegne un LED con digitalWrite e delay.',
    bookInstructions: ['pinMode 13 OUTPUT', 'digitalWrite 13 HIGH', 'delay 1000'],
  },
};

// ─────────────────────────────────────────────────
// Sandbox wiki concepts dir for Path C — isolated from real
// docs/unlim-wiki/concepts/ so the test is self-contained.
// ─────────────────────────────────────────────────
let SANDBOX_DIR;
let SANDBOX_TOPIC_MAP;

beforeAll(() => {
  SANDBOX_DIR = mkdtempSync(join(tmpdir(), 'rag-matcher-test-'));
  const concepts = join(SANDBOX_DIR, 'concepts');
  mkdirSync(concepts, { recursive: true });

  // Real-shape frontmatter (mirrors docs/unlim-wiki/concepts/*.md format).
  const fixtures = {
    'blink-led.md': `---
id: blink-led
type: concept
title: "Blink LED — far lampeggiare un LED con Arduino"
locale: it
volume_ref: 3
pagina_ref: 47
---

## Definizione
Il primo programma Arduino.`,
    'digital-write.md': `---
id: digital-write
type: concept
title: "digitalWrite() — Comandare un Pin Digitale"
locale: it
volume_ref: 3
pagina_ref: 47
---

## Definizione
Funzione che mette HIGH o LOW.`,
    'voltmetro.md': `---
id: voltmetro
type: concept
title: "Voltmetro — misurare la tensione in parallelo"
locale: it
volume_ref: 1
pagina_ref: 22
---

## Definizione
Strumento di misura.`,
    'debounce.md': `---
id: debounce
type: concept
title: "Debounce (anti-rimbalzo)"
locale: it
volume_ref: 2
pagina_ref: 55
---

## Definizione
Filtro software.`,
    'corrente-continua.md': `---
id: corrente-continua
type: concept
title: "Corrente continua (DC)"
locale: it
volume_ref: 1
pagina_ref: 9
---

## Definizione
Flusso costante.`,
    // Null volume_ref → must be excluded from topic map (graceful skip).
    'oscilloscopio.md': `---
id: oscilloscopio
type: concept
title: "Oscilloscopio"
locale: it
volume_ref: ~
pagina_ref: ~
---

## Definizione
Strumento di laboratorio.`,
  };

  for (const [name, content] of Object.entries(fixtures)) {
    writeFileSync(join(concepts, name), content);
  }

  _resetTopicToVolumeCache();
  SANDBOX_TOPIC_MAP = loadTopicToVolume(concepts);
});

afterAll(() => {
  if (SANDBOX_DIR) rmSync(SANDBOX_DIR, { recursive: true, force: true });
  _resetTopicToVolumeCache();
});

describe('loadTopicToVolume — wiki frontmatter parser', () => {
  it('parses volume_ref + pagina_ref + title from frontmatter', () => {
    expect(SANDBOX_TOPIC_MAP.size).toBe(5); // oscilloscopio excluded (null vol)
    expect(SANDBOX_TOPIC_MAP.get('blink-led')).toEqual({
      volume: 3,
      page: 47,
      sectionTitle: 'Blink LED — far lampeggiare un LED con Arduino',
    });
    expect(SANDBOX_TOPIC_MAP.get('voltmetro')).toEqual({
      volume: 1,
      page: 22,
      sectionTitle: 'Voltmetro — misurare la tensione in parallelo',
    });
  });

  it('excludes concepts with null/tilde volume_ref', () => {
    expect(SANDBOX_TOPIC_MAP.has('oscilloscopio')).toBe(false);
  });

  it('returns empty Map when concepts dir does not exist', () => {
    const missing = loadTopicToVolume(join(SANDBOX_DIR, 'does-not-exist'));
    expect(missing.size).toBe(0);
  });
});

describe('fuzzyMatchChunkToLesson — Path C (topic-ID lookup)', () => {
  it('resolves blink-led → Vol.3 pag.47', () => {
    const result = fuzzyMatchChunkToLesson(
      { id: 'c1', source: 'blink-led', content_raw: 'qualunque testo' },
      FAKE_REFS,
      { topicMap: SANDBOX_TOPIC_MAP },
    );
    expect(result).not.toBeNull();
    expect(result.path).toBe('C');
    expect(result.volume).toBe(3);
    expect(result.page).toBe(47);
    expect(result.sectionTitle).toMatch(/Blink LED/);
    expect(result.score).toBe(1.0);
  });

  it('resolves digital-write → Vol.3 pag.47', () => {
    const result = fuzzyMatchChunkToLesson(
      { id: 'c2', source: 'digital-write', content_raw: 'testo a caso' },
      FAKE_REFS,
      { topicMap: SANDBOX_TOPIC_MAP },
    );
    expect(result.path).toBe('C');
    expect(result.volume).toBe(3);
    expect(result.page).toBe(47);
  });

  it('resolves voltmetro → Vol.1 pag.22', () => {
    const result = fuzzyMatchChunkToLesson(
      { id: 'c3', source: 'voltmetro', content_raw: 'testo' },
      FAKE_REFS,
      { topicMap: SANDBOX_TOPIC_MAP },
    );
    expect(result.path).toBe('C');
    expect(result.volume).toBe(1);
    expect(result.page).toBe(22);
  });

  it('resolves debounce → Vol.2 pag.55', () => {
    const result = fuzzyMatchChunkToLesson(
      { id: 'c4', source: 'debounce', content_raw: 'testo' },
      FAKE_REFS,
      { topicMap: SANDBOX_TOPIC_MAP },
    );
    expect(result.path).toBe('C');
    expect(result.volume).toBe(2);
    expect(result.page).toBe(55);
  });

  it('builds chapter label "Vol.X — title" for Path C entries', () => {
    const result = fuzzyMatchChunkToLesson(
      { id: 'c5', source: 'corrente-continua', content_raw: 'testo' },
      FAKE_REFS,
      { topicMap: SANDBOX_TOPIC_MAP },
    );
    expect(result.chapter).toMatch(/^Vol\.1 — /);
    expect(result.chapterInt).toBeNull();
  });
});

describe('fuzzyMatchChunkToLesson — Path A (legacy vol1/vol2/vol3 fuzzy)', () => {
  it('matches vol1 chunk with strong LED bookText', () => {
    // Use a chunk whose content_raw starts with the bookText of v1-cap6-esp1
    // so substring match gives subScore=1.0.
    const result = fuzzyMatchChunkToLesson(
      {
        id: 'a1',
        source: 'vol1',
        content_raw:
          'Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di: Un LED, una breadboard, una batteria 9V, la clip per la batteria 9V, un resistore da 470 Ohm. (extra text follows)',
      },
      FAKE_REFS,
      { topicMap: SANDBOX_TOPIC_MAP },
    );
    expect(result).not.toBeNull();
    expect(result.path).toBe('A');
    expect(result.lessonId).toBe('v1-cap6-esp1');
    expect(result.page).toBe(29);
    expect(result.chapterInt).toBe(6);
  });

  it('matches vol3 chunk with blink content', () => {
    const result = fuzzyMatchChunkToLesson(
      {
        id: 'a2',
        source: 'vol3',
        content_raw:
          'Il programma Blink è il primo programma Arduino: accende e spegne un LED con digitalWrite e delay. lampeggio infinito loop setup.',
      },
      FAKE_REFS,
      { topicMap: SANDBOX_TOPIC_MAP },
    );
    expect(result).not.toBeNull();
    expect(result.path).toBe('A');
    expect(result.lessonId).toBe('v3-cap6-esp1');
  });

  it('returns null when vol-prefix source has zero-score fuzzy match', () => {
    const result = fuzzyMatchChunkToLesson(
      { id: 'a3', source: 'vol2', content_raw: 'xyz abc nothing related' },
      FAKE_REFS,
      { topicMap: SANDBOX_TOPIC_MAP },
    );
    // No v2-* lessons in FAKE_REFS so loop never sets best → null
    expect(result).toBeNull();
  });
});

describe('fuzzyMatchChunkToLesson — edge cases / fallback null', () => {
  it('returns null for null chunk', () => {
    expect(fuzzyMatchChunkToLesson(null, FAKE_REFS)).toBeNull();
  });

  it('returns null for chunk with empty source', () => {
    expect(
      fuzzyMatchChunkToLesson(
        { id: 'e1', source: '', content_raw: 'whatever' },
        FAKE_REFS,
        { topicMap: SANDBOX_TOPIC_MAP },
      ),
    ).toBeNull();
  });

  it('returns null for chunk with unknown topic-ID', () => {
    expect(
      fuzzyMatchChunkToLesson(
        { id: 'e2', source: 'this-topic-does-not-exist', content_raw: 'x' },
        FAKE_REFS,
        { topicMap: SANDBOX_TOPIC_MAP },
      ),
    ).toBeNull();
  });

  it('returns null when source is a wiki concept with null volume_ref', () => {
    // oscilloscopio is intentionally excluded from the map (volume_ref: ~).
    // Without a fallback in the matcher, this stays NULL — desired behaviour.
    const result = fuzzyMatchChunkToLesson(
      { id: 'e3', source: 'oscilloscopio', content_raw: 'x' },
      FAKE_REFS,
      { topicMap: SANDBOX_TOPIC_MAP },
    );
    expect(result).toBeNull();
  });

  it('returns null for chunk with undefined source', () => {
    expect(
      fuzzyMatchChunkToLesson(
        { id: 'e4', content_raw: 'x' },
        FAKE_REFS,
        { topicMap: SANDBOX_TOPIC_MAP },
      ),
    ).toBeNull();
  });
});
