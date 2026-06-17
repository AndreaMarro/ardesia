/**
 * Sprint S iter 13 U1+U2+U3 — RAG metadata + RRF + Wiki Hybrid fusion tests
 *
 * Owner: omniscient-opus iter 13 PHASE 1.
 *
 * Scope: 10 tests covering
 *   - U1 SELECT clause includes section_title (regex source check)
 *   - U2 RRF k=60 multi-list math correctness
 *   - U3 Wiki Hybrid corpus tag classification + 4-list fusion
 *
 * Note: rag.ts is Deno runtime (uses `Deno.env.get`), cannot import directly
 * in Node vitest. We test via:
 *   1. Source-level regex assertions on the .ts file (SELECT clauses + types)
 *   2. Re-implementation of rrfFuseMulti (pure math, no Deno deps)
 *   3. Source-level tag verification for HybridChunk.corpus + section_title
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const RAG_TS_PATH = join(__dirname, '../../supabase/functions/_shared/rag.ts');
const RAG_TS_SOURCE = readFileSync(RAG_TS_PATH, 'utf-8');

// Re-implementation of rrfFuseMulti for isolated math testing.
// MUST stay aligned with the Deno fn in rag.ts (single source: rrfFuseMulti).
function rrfFuseMultiPort(lists, k) {
  const fused = new Map();
  for (const list of lists) {
    for (const r of list) {
      const prev = fused.get(r.id) ?? 0;
      fused.set(r.id, prev + 1 / (k + r.rank));
    }
  }
  return fused;
}

describe('Iter 13 U1 — RAG metadata SELECT surface', () => {
  it('bm25Search SELECT includes section_title (P0 fix)', () => {
    // Find primary BM25 SELECT clause
    const primarySelectRegex = /select=id,content,content_raw,source,chapter,page,figure_id,section_title/;
    expect(RAG_TS_SOURCE).toMatch(primarySelectRegex);
  });

  it('bm25Search OR-fallback SELECT also includes section_title', () => {
    // Both primary and fallback URL must surface section_title
    const matches = RAG_TS_SOURCE.match(/select=id,content,content_raw,source,chapter,page,figure_id,section_title/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('HybridChunk interface includes section_title field (non-undefined)', () => {
    // Type contract: section_title: string | null
    expect(RAG_TS_SOURCE).toMatch(/section_title:\s*string\s*\|\s*null/);
  });

  it('bm25Search row mapping reads row.section_title with String() coercion', () => {
    // Defensive: row.section_title ? String(row.section_title) : null
    expect(RAG_TS_SOURCE).toMatch(/section_title:\s*row\.section_title\s*\?\s*String\(row\.section_title\)\s*:\s*null/);
  });

  it('denseSearch row mapping also surfaces section_title', () => {
    // Iter 13 U1: even though current RPC RETURNS TABLE does not include
    // section_title (iter 14 migration scope), we surface it defensively
    // — fn returns null when RPC schema lacks the column.
    const matches = RAG_TS_SOURCE.match(/section_title:\s*row\.section_title\s*\?\s*String\(row\.section_title\)\s*:\s*null/g) || [];
    // bm25 primary + bm25 fallback + dense path = 3 mappings
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Iter 13 U2 — RRF k=60 fusion math', () => {
  it('rrfFuseMulti combines 2 lists with standard formula 1/(k+rank)', () => {
    const k = 60;
    const lists = [
      [{ id: 'a', rank: 1 }, { id: 'b', rank: 2 }],
      [{ id: 'a', rank: 3 }, { id: 'c', rank: 1 }],
    ];
    const fused = rrfFuseMultiPort(lists, k);
    // a appears in both lists: 1/61 + 1/63
    expect(fused.get('a')).toBeCloseTo(1 / 61 + 1 / 63, 6);
    // b appears once
    expect(fused.get('b')).toBeCloseTo(1 / 62, 6);
    // c appears once
    expect(fused.get('c')).toBeCloseTo(1 / 61, 6);
  });

  it('rrfFuseMulti supports 4-list fusion (U3 wiki+rag mode)', () => {
    const k = 60;
    const lists = [
      [{ id: 'shared', rank: 1 }],   // rag-bm25
      [{ id: 'shared', rank: 2 }],   // rag-dense
      [{ id: 'shared', rank: 3 }],   // wiki-bm25
      [{ id: 'shared', rank: 4 }],   // wiki-dense
    ];
    const fused = rrfFuseMultiPort(lists, k);
    const expected = 1 / 61 + 1 / 62 + 1 / 63 + 1 / 64;
    expect(fused.get('shared')).toBeCloseTo(expected, 6);
  });

  it('rag.ts exports rrfFuseMulti (multi-list helper)', () => {
    expect(RAG_TS_SOURCE).toMatch(/export function rrfFuseMulti/);
  });

  it('hybridRetrieve uses default RRF k=60', () => {
    expect(RAG_TS_SOURCE).toMatch(/opts\.rrfK\s*\?\?\s*60/);
  });

  it('BM25 + dense run in parallel via Promise.all', () => {
    expect(RAG_TS_SOURCE).toMatch(/Promise\.all\(\[\s*bm25Search\(/);
  });
});

describe('Iter 13 U3 — Wiki LLM Hybrid fusion + corpus tag', () => {
  it('HybridRetrieveOptions exposes wikiFusion flag', () => {
    expect(RAG_TS_SOURCE).toMatch(/wikiFusion\?:\s*boolean/);
  });

  it('Wiki fusion default ON via env opt-out RAG_WIKI_FUSION_DISABLED', () => {
    expect(RAG_TS_SOURCE).toMatch(/RAG_WIKI_FUSION_DISABLED/);
  });

  it('hybridRetrieve fetches wiki-only ranked lists in parallel when active', () => {
    expect(RAG_TS_SOURCE).toMatch(/bm25Search\(query,\s*wikiPool,\s*'wiki'/);
    expect(RAG_TS_SOURCE).toMatch(/denseSearch\(query,\s*wikiPool,\s*'wiki'/);
  });

  it('classifyCorpus tags chunks as "wiki" or "rag" based on source field', () => {
    expect(RAG_TS_SOURCE).toMatch(/classifyCorpus/);
    expect(RAG_TS_SOURCE).toMatch(/s === 'wiki' \? 'wiki' : 'rag'/);
  });

  it('HybridChunk.corpus type is union "rag" | "wiki" | "mixed"', () => {
    expect(RAG_TS_SOURCE).toMatch(/corpus:\s*'rag'\s*\|\s*'wiki'\s*\|\s*'mixed'/);
  });

  it('Multi-list RRF wired when wikiFusionActive (4-list fusion)', () => {
    // The wiki fusion branch must call rrfFuseMulti with 4 ranked lists.
    expect(RAG_TS_SOURCE).toMatch(/rrfFuseMulti\(/);
    expect(RAG_TS_SOURCE).toMatch(/wikiBm25Raw\.map/);
    expect(RAG_TS_SOURCE).toMatch(/wikiDenseRaw\.map/);
  });

  it('Wiki fusion bypassed when caller passes filterSource (avoids double-filter)', () => {
    expect(RAG_TS_SOURCE).toMatch(/wikiFusionActive\s*=\s*useWikiFusion\s*&&\s*!opts\.filterSource/);
  });
});

describe('Iter 13 U1 — Edge Function unlim-chat surfaces metadata + corpus', () => {
  const UNLIM_CHAT_PATH = join(__dirname, '../../supabase/functions/unlim-chat/index.ts');
  const UNLIM_CHAT_SOURCE = readFileSync(UNLIM_CHAT_PATH, 'utf-8');

  it('debug_retrieval response includes section_title', () => {
    expect(UNLIM_CHAT_SOURCE).toMatch(/section_title:\s*cr\.section_title/);
  });

  it('debug_retrieval response includes corpus tag (U3)', () => {
    expect(UNLIM_CHAT_SOURCE).toMatch(/corpus:\s*cr\.corpus/);
  });

  it('debug_retrieval response includes chapter + page (already existed pre-iter-13)', () => {
    expect(UNLIM_CHAT_SOURCE).toMatch(/chapter:\s*cr\.chapter/);
    expect(UNLIM_CHAT_SOURCE).toMatch(/page:\s*cr\.page/);
  });
});
