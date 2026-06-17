/**
 * OpenClaw Hybrid RAG Retriever
 *
 * Design goals (Andrea feedback 2026-04-23):
 *   RAG non deve essere usato letteralmente. Deve essere mescolato con contesto,
 *   screenshot, conoscenza del modello. Pertanto il retriever deve:
 *     - fare ranking ibrido (semantico + metadata-aware)
 *     - diversificare con MMR per evitare cluster redundant
 *     - marcare ogni hit con il "perché è rilevante" (debug + XAI)
 *     - restituire POCHE anchor di alta qualità (3-5), non dump
 *
 * Sources: src/data/rag-chunks.json (legacy 549) or rag-chunks-v2.json (1849).
 *
 * Scoring formula:
 *   total = semantic_similarity
 *         + type_bonus       (query type match → +0.20)
 *         + volume_bonus     (current experiment volume match → +0.15)
 *         + granularity_bonus (precision vs context mode → +0.10)
 *         + citation_bonus   (has vol+page metadata → +0.05)
 *         - recency_penalty  (optional, for stale wiki pages)
 *
 * MMR (Maximal Marginal Relevance):
 *   result[i+1] = argmax_c [ λ * sim(c, query) - (1-λ) * max_j sim(c, result[j]) ]
 *   λ = 0.7 (favor relevance over diversity)
 *
 * Semantic similarity today = Jaccard token overlap (no embedding infra yet).
 * Sprint 7+: swap to BGE-M3 cosine via Supabase pgvector.
 *
 * (c) ELAB Tutor — 2026-04-23
 */

export interface ChunkRecord {
  id: string;
  text: string;
  volume?: number | string;
  chapter?: number | string;
  page?: number;
  type?: string;
  source?: string;
  granularity?: 'fine' | 'coarse' | string;
  wordCount?: number;
}

export interface RetrievalQuery {
  text: string;
  type?: string;               // 'theory'|'procedure'|'example'|'warning'|'glossary' — match chunk.type
  volume?: number | string;     // current experiment volume
  needsPrecision?: boolean;     // favor 'fine' granularity
  needsContext?: boolean;        // favor 'coarse' granularity
  topK?: number;                 // default 5
  mmrLambda?: number;            // default 0.7
}

export interface RetrievalHit {
  chunk: ChunkRecord;
  score: number;
  breakdown: {
    semantic: number;
    type_bonus: number;
    volume_bonus: number;
    granularity_bonus: number;
    citation_bonus: number;
    mmr_penalty?: number;
  };
  explanation: string;
}

// ════════════════════════════════════════════════════════════════════
// Token utilities (pure, deterministic, testable)
// ════════════════════════════════════════════════════════════════════

const STOPWORDS = new Set([
  'il', 'la', 'le', 'i', 'gli', 'un', 'una', 'uno', 'di', 'da', 'in', 'su', 'per', 'con', 'che', 'e', 'o',
  'ma', 'se', 'non', 'è', 'sono', 'ha', 'ho', 'ho', 'ha', 'al', 'dal', 'nel', 'sul', 'questa', 'questo',
  'the', 'a', 'an', 'of', 'to', 'and', 'or', 'but', 'if', 'is', 'are', 'has', 'have', 'in', 'on', 'for',
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9àèéìòù\s]/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !STOPWORDS.has(t));
}

/**
 * Jaccard token-set similarity — 0 no overlap, 1 identical sets.
 * Surrogate for embedding cosine until BGE-M3 infra.
 */
export function jaccardSim(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersect = 0;
  setA.forEach(t => { if (setB.has(t)) intersect++; });
  const union = setA.size + setB.size - intersect;
  return union > 0 ? intersect / union : 0;
}

/**
 * BM25-lite scoring — better than Jaccard for long docs vs short query.
 * Uses term-frequency + inverse document frequency lookup.
 */
export function tfIdfLite(queryTokens: string[], docTokens: string[], corpusSize: number, docFreq: Map<string, number>): number {
  const docFreqMap = new Map<string, number>();
  for (const t of docTokens) docFreqMap.set(t, (docFreqMap.get(t) || 0) + 1);
  const docLen = docTokens.length || 1;
  let score = 0;
  for (const q of queryTokens) {
    const tf = (docFreqMap.get(q) || 0) / docLen;
    const df = docFreq.get(q) || 1;
    const idf = Math.log((corpusSize + 1) / df);
    score += tf * idf;
  }
  // Normalize to 0-1 (empirical — 2.5 is typical upper bound for 5-10 token queries)
  return Math.min(1, score / 2.5);
}

// ════════════════════════════════════════════════════════════════════
// Corpus precompute (optional, improves large-corpus perf)
// ════════════════════════════════════════════════════════════════════

export interface PrecomputedCorpus {
  chunks: ChunkRecord[];
  tokenized: string[][];
  docFreq: Map<string, number>;
  size: number;
}

export function precomputeCorpus(chunks: ChunkRecord[]): PrecomputedCorpus {
  const tokenized = chunks.map(c => tokenize(c.text));
  const docFreq = new Map<string, number>();
  for (const tokens of tokenized) {
    const unique = new Set(tokens);
    unique.forEach(t => docFreq.set(t, (docFreq.get(t) || 0) + 1));
  }
  return { chunks, tokenized, docFreq, size: chunks.length };
}

// ════════════════════════════════════════════════════════════════════
// Scoring
// ════════════════════════════════════════════════════════════════════

function computeBonuses(
  chunk: ChunkRecord,
  query: RetrievalQuery
): { type_bonus: number; volume_bonus: number; granularity_bonus: number; citation_bonus: number; explanation_parts: string[] } {
  const parts: string[] = [];
  let type_bonus = 0;
  let volume_bonus = 0;
  let granularity_bonus = 0;
  let citation_bonus = 0;

  if (query.type && chunk.type === query.type) {
    type_bonus = 0.2;
    parts.push(`type_match(${chunk.type})`);
  }
  if (query.volume !== undefined && String(chunk.volume) === String(query.volume)) {
    volume_bonus = 0.15;
    parts.push(`volume_match(${chunk.volume})`);
  }
  if (query.needsPrecision && chunk.granularity === 'fine') {
    granularity_bonus = 0.1;
    parts.push('precision');
  } else if (query.needsContext && chunk.granularity === 'coarse') {
    granularity_bonus = 0.1;
    parts.push('context');
  }
  if (chunk.page && chunk.volume) {
    citation_bonus = 0.05;
    parts.push('citable');
  }

  return { type_bonus, volume_bonus, granularity_bonus, citation_bonus, explanation_parts: parts };
}

// ════════════════════════════════════════════════════════════════════
// Main retrieval
// ════════════════════════════════════════════════════════════════════

export function retrieve(corpus: PrecomputedCorpus, query: RetrievalQuery): RetrievalHit[] {
  const topK = query.topK ?? 5;
  const mmrLambda = query.mmrLambda ?? 0.7;

  const qTokens = tokenize(query.text);
  if (qTokens.length === 0) return [];

  // Stage 1: compute all scores
  const scored: Array<{
    chunk: ChunkRecord;
    tokens: string[];
    semantic: number;
    bonuses: ReturnType<typeof computeBonuses>;
    raw: number;
  }> = [];

  for (let i = 0; i < corpus.chunks.length; i++) {
    const chunk = corpus.chunks[i];
    const tokens = corpus.tokenized[i];
    const semantic = Math.max(
      jaccardSim(qTokens, tokens),
      tfIdfLite(qTokens, tokens, corpus.size, corpus.docFreq)
    );
    if (semantic === 0) continue; // skip no-overlap

    const bonuses = computeBonuses(chunk, query);
    const raw = semantic + bonuses.type_bonus + bonuses.volume_bonus + bonuses.granularity_bonus + bonuses.citation_bonus;
    scored.push({ chunk, tokens, semantic, bonuses, raw });
  }

  // Stage 2: sort by raw score
  scored.sort((a, b) => b.raw - a.raw);

  // Stage 3: MMR diversification — λ * relevance - (1-λ) * max_sim_to_selected
  const selected: typeof scored = [];
  const candidates = scored.slice(0, Math.min(50, scored.length)); // consider top 50 for MMR

  while (selected.length < topK && candidates.length > 0) {
    let bestIdx = -1;
    let bestMmr = -Infinity;
    for (let i = 0; i < candidates.length; i++) {
      const cand = candidates[i];
      let maxSimToSelected = 0;
      for (const sel of selected) {
        const sim = jaccardSim(cand.tokens, sel.tokens);
        if (sim > maxSimToSelected) maxSimToSelected = sim;
      }
      const mmr = mmrLambda * cand.raw - (1 - mmrLambda) * maxSimToSelected;
      if (mmr > bestMmr) {
        bestMmr = mmr;
        bestIdx = i;
      }
    }
    if (bestIdx < 0) break;
    selected.push(candidates[bestIdx]);
    candidates.splice(bestIdx, 1);
  }

  // Stage 4: package as RetrievalHit
  return selected.map(s => {
    const maxSimPrevSelected = selected
      .filter(x => x !== s)
      .reduce((mx, x) => Math.max(mx, jaccardSim(s.tokens, x.tokens)), 0);
    const mmr_penalty = (1 - mmrLambda) * maxSimPrevSelected;
    const parts = s.bonuses.explanation_parts.slice();
    parts.unshift(`semantic=${s.semantic.toFixed(2)}`);
    const explanation = parts.join(' | ');
    return {
      chunk: s.chunk,
      score: Math.round((s.raw - mmr_penalty) * 1000) / 1000,
      breakdown: {
        semantic: Math.round(s.semantic * 1000) / 1000,
        type_bonus: s.bonuses.type_bonus,
        volume_bonus: s.bonuses.volume_bonus,
        granularity_bonus: s.bonuses.granularity_bonus,
        citation_bonus: s.bonuses.citation_bonus,
        mmr_penalty: Math.round(mmr_penalty * 1000) / 1000,
      },
      explanation,
    };
  });
}

// ════════════════════════════════════════════════════════════════════
// Helper: build retriever compatible with state-snapshot-aggregator
// ════════════════════════════════════════════════════════════════════

export interface AggregatorCompatibleRetriever {
  searchRAGChunks(query: string, topK: number): RetrievalHit[];
}

export function makeAggregatorRetriever(corpus: PrecomputedCorpus, defaults: Partial<RetrievalQuery> = {}): AggregatorCompatibleRetriever {
  return {
    searchRAGChunks(query: string, topK: number): RetrievalHit[] {
      return retrieve(corpus, { text: query, topK, ...defaults });
    },
  };
}
