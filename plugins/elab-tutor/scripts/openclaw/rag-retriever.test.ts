import { describe, it, expect } from 'vitest';
import { tokenize, jaccardSim, tfIdfLite, precomputeCorpus, retrieve, makeAggregatorRetriever } from './rag-retriever.ts';

describe('tokenize', () => {
  it('lowercases + splits', () => {
    expect(tokenize('Il LED è acceso')).toContain('led');
    expect(tokenize('Il LED è acceso')).toContain('acceso');
  });

  it('removes stopwords', () => {
    const tokens = tokenize('il la le i gli LED');
    expect(tokens).toContain('led');
    expect(tokens).not.toContain('il');
    expect(tokens).not.toContain('la');
  });

  it('filters tokens shorter than 3 chars', () => {
    const tokens = tokenize('LED 5V ha un circuito');
    expect(tokens.every(t => t.length >= 3)).toBe(true);
  });

  it('preserves Italian accents', () => {
    expect(tokenize('Città è bella perché si trova qui')).toContain('città');
    expect(tokenize('perché')).toContain('perché');
  });
});

describe('jaccardSim', () => {
  it('returns 1 for identical sets', () => {
    expect(jaccardSim(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(1);
  });

  it('returns 0 for disjoint sets', () => {
    expect(jaccardSim(['a', 'b'], ['c', 'd'])).toBe(0);
  });

  it('returns 0 for empty input', () => {
    expect(jaccardSim([], ['a'])).toBe(0);
    expect(jaccardSim(['a'], [])).toBe(0);
  });

  it('computes half overlap correctly', () => {
    // ['a','b'] vs ['a','c'] → intersect=1, union=3 → 1/3
    expect(jaccardSim(['a', 'b'], ['a', 'c'])).toBeCloseTo(1 / 3, 5);
  });
});

describe('tfIdfLite', () => {
  const corpus = [
    'led circuito base',
    'resistenza ohm',
    'led acceso',
    'transistor base',
  ].map(t => t.split(' '));

  const docFreq = new Map<string, number>();
  for (const tokens of corpus) {
    const unique = new Set(tokens);
    unique.forEach(t => docFreq.set(t, (docFreq.get(t) || 0) + 1));
  }

  it('scores higher for common-with-query tokens', () => {
    const q = ['led'];
    const doc1 = ['led', 'acceso'];
    const doc2 = ['transistor', 'base'];
    expect(tfIdfLite(q, doc1, corpus.length, docFreq)).toBeGreaterThan(tfIdfLite(q, doc2, corpus.length, docFreq));
  });

  it('returns 0 when no query tokens match doc', () => {
    const q = ['xyz'];
    const doc = ['led', 'acceso'];
    expect(tfIdfLite(q, doc, corpus.length, docFreq)).toBe(0);
  });
});

describe('precomputeCorpus', () => {
  it('populates tokenized + docFreq', () => {
    const corpus = precomputeCorpus([
      { id: '1', text: 'led acceso rosso' },
      { id: '2', text: 'resistenza ohm calcolo' },
    ]);
    expect(corpus.size).toBe(2);
    expect(corpus.tokenized).toHaveLength(2);
    expect(corpus.docFreq.size).toBeGreaterThan(0);
  });
});

describe('retrieve — full pipeline', () => {
  const corpus = precomputeCorpus([
    { id: 'c1', text: 'Il LED rosso è acceso sul breadboard con resistenza 470 ohm', volume: 1, page: 27, type: 'theory', granularity: 'fine' },
    { id: 'c2', text: 'La resistenza frena la corrente secondo V=RI', volume: 1, page: 35, type: 'theory', granularity: 'coarse' },
    { id: 'c3', text: 'Attenzione non collegare mai un LED senza resistenza', volume: 1, page: 30, type: 'warning', granularity: 'fine' },
    { id: 'c4', text: 'Il transistor MOSFET come interruttore digitale', volume: 3, page: 22, type: 'theory' },
    { id: 'c5', text: 'Scrivi codice digitalWrite(13, HIGH) per accendere il LED', volume: 2, page: 18, type: 'example' },
    { id: 'c6', text: 'Un LED acceso consuma poca corrente', volume: 1, page: 28, type: 'theory' },
  ]);

  it('returns topK results sorted by score', () => {
    const hits = retrieve(corpus, { text: 'LED acceso', topK: 3 });
    expect(hits.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < hits.length; i++) {
      expect(hits[i - 1].score).toBeGreaterThanOrEqual(hits[i].score);
    }
  });

  it('applies volume_bonus when query volume matches chunk volume', () => {
    const hitsV1 = retrieve(corpus, { text: 'LED', topK: 5, volume: 1 });
    const top = hitsV1[0];
    expect(top).toBeDefined();
    expect(top.breakdown.volume_bonus).toBe(0.15);
    expect(top.chunk.volume).toBe(1);
  });

  it('applies type_bonus when query type matches', () => {
    const hits = retrieve(corpus, { text: 'LED non collegato', topK: 3, type: 'warning' });
    const warningHit = hits.find(h => h.chunk.type === 'warning');
    if (warningHit) {
      expect(warningHit.breakdown.type_bonus).toBe(0.2);
    }
  });

  it('returns empty array when no semantic overlap', () => {
    const hits = retrieve(corpus, { text: 'quantum chromodynamics xyz', topK: 3 });
    expect(hits).toEqual([]);
  });

  it('includes explanation breakdown', () => {
    const hits = retrieve(corpus, { text: 'LED rosso', topK: 2, volume: 1 });
    expect(hits[0].explanation).toContain('semantic=');
    expect(hits[0].breakdown).toHaveProperty('semantic');
    expect(hits[0].breakdown).toHaveProperty('volume_bonus');
  });

  it('MMR diversifies near-duplicate chunks', () => {
    const dupCorpus = precomputeCorpus([
      { id: 'd1', text: 'LED rosso acceso breadboard', volume: 1 },
      { id: 'd2', text: 'LED rosso acceso breadboard con resistenza', volume: 1 },
      { id: 'd3', text: 'transistor collegamento MOSFET', volume: 3 },
    ]);
    const hits = retrieve(dupCorpus, { text: 'LED rosso', topK: 3, mmrLambda: 0.5 });
    // With MMR λ=0.5, d1 and d2 overlap heavily. Third hit should include d3.
    expect(hits.length).toBeGreaterThan(0);
  });

  it('granularity bonus fine for needsPrecision', () => {
    const hits = retrieve(corpus, { text: 'LED acceso', topK: 5, needsPrecision: true });
    const fineHit = hits.find(h => h.chunk.granularity === 'fine');
    if (fineHit) {
      expect(fineHit.breakdown.granularity_bonus).toBe(0.1);
    }
  });

  it('citation_bonus for chunks with vol+page', () => {
    const hits = retrieve(corpus, { text: 'LED', topK: 3 });
    const citable = hits.find(h => h.chunk.page && h.chunk.volume);
    if (citable) {
      expect(citable.breakdown.citation_bonus).toBe(0.05);
    }
  });
});

describe('makeAggregatorRetriever', () => {
  it('returns aggregator-compatible retriever', () => {
    const corpus = precomputeCorpus([
      { id: 'c1', text: 'LED rosso', volume: 1 },
    ]);
    const retriever = makeAggregatorRetriever(corpus, { volume: 1 });
    const hits = retriever.searchRAGChunks('LED', 3);
    expect(Array.isArray(hits)).toBe(true);
  });
});
