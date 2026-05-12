import { describe, it, expect } from 'vitest';
import { buildStateSnapshot, snapshotToPromptFragment, snapshotSummary } from './state-snapshot-aggregator.ts';

describe('buildStateSnapshot — graceful degradation', () => {
  it('returns defaults when all deps null', async () => {
    const snap = await buildStateSnapshot({
      elabApi: null,
      wikiRetriever: null,
      ragSearcher: null,
      unlimMemory: null,
    }, { query: 'led' });
    expect(snap.circuit).toBeNull();
    expect(snap.wiki).toEqual([]);
    expect(snap.rag).toEqual([]);
    expect(snap.pastSessions).toEqual([]);
    expect(snap.vision).toBeNull();
  });

  it('timestamps fetchedAt to valid ISO', async () => {
    const snap = await buildStateSnapshot({
      elabApi: null, wikiRetriever: null, ragSearcher: null, unlimMemory: null,
    }, {});
    expect(new Date(snap.fetchedAt).toString()).not.toBe('Invalid Date');
  });

  it('returns locale from options', async () => {
    const snap = await buildStateSnapshot({
      elabApi: null, wikiRetriever: null, ragSearcher: null, unlimMemory: null,
    }, { locale: 'en' });
    expect(snap.student.locale).toBe('en');
  });

  it('defaults to it when no locale given', async () => {
    const snap = await buildStateSnapshot({
      elabApi: null, wikiRetriever: null, ragSearcher: null, unlimMemory: null,
    }, {});
    expect(snap.student.locale).toBe('it');
  });

  it('reports per-layer ms for each layer', async () => {
    const snap = await buildStateSnapshot({
      elabApi: null, wikiRetriever: null, ragSearcher: null, unlimMemory: null,
    }, {});
    expect(snap.perLayerMs).toHaveProperty('circuit');
    expect(snap.perLayerMs).toHaveProperty('wiki');
    expect(snap.perLayerMs).toHaveProperty('rag');
    expect(snap.perLayerMs).toHaveProperty('memory');
    expect(snap.perLayerMs).toHaveProperty('vision');
  });

  it('respects timeout and marks layer as error', async () => {
    const slowApi = {
      unlim: {
        getCircuitState: () => new Promise<any>(resolve => setTimeout(() => resolve({}), 500)),
      },
    };
    const snap = await buildStateSnapshot(
      { elabApi: slowApi as any, wikiRetriever: null, ragSearcher: null, unlimMemory: null },
      { timeoutMs: 50 }
    );
    expect(snap.status.circuit).toBe('error');
    expect(snap.errors.some(e => e.message.includes('timeout'))).toBe(true);
  });
});

describe('snapshotToPromptFragment — PZ v3 compliance', () => {
  it('includes RAGAZZI instruction', async () => {
    const snap = await buildStateSnapshot({
      elabApi: null, wikiRetriever: null, ragSearcher: null, unlimMemory: null,
    }, {});
    const prompt = snapshotToPromptFragment(snap, 'cosa è un LED?');
    expect(prompt).toMatch(/RAGAZZI/);
  });

  it('includes 120 words constraint (feedback 2026-05-10)', async () => {
    const snap = await buildStateSnapshot({
      elabApi: null, wikiRetriever: null, ragSearcher: null, unlimMemory: null,
    }, {});
    const prompt = snapshotToPromptFragment(snap, 'led?');
    expect(prompt).toMatch(/120 parole/);
  });

  it('includes Vol.X pag.Y citation reminder', async () => {
    const snap = await buildStateSnapshot({
      elabApi: null, wikiRetriever: null, ragSearcher: null, unlimMemory: null,
    }, {});
    const prompt = snapshotToPromptFragment(snap, 'led?');
    expect(prompt).toMatch(/Vol\.X pag\.Y/);
  });

  it('includes user question at bottom', async () => {
    const snap = await buildStateSnapshot({
      elabApi: null, wikiRetriever: null, ragSearcher: null, unlimMemory: null,
    }, {});
    const prompt = snapshotToPromptFragment(snap, 'test question 12345');
    expect(prompt).toMatch(/test question 12345/);
  });
});

describe('snapshotSummary', () => {
  it('returns loggable row with standard fields', async () => {
    const snap = await buildStateSnapshot({
      elabApi: null, wikiRetriever: null, ragSearcher: null, unlimMemory: null,
    }, {});
    const row = snapshotSummary(snap);
    expect(row).toHaveProperty('at');
    expect(row).toHaveProperty('latency_ms');
    expect(row).toHaveProperty('per_layer_ms');
    expect(row).toHaveProperty('wiki_hits');
    expect(row).toHaveProperty('rag_hits');
    expect(row).toHaveProperty('past_sessions');
    expect(row).toHaveProperty('errors_count');
    expect(row).toHaveProperty('locale');
  });
});
