/**
 * Nanobot V2 — RAG (Retrieval Augmented Generation)
 * Searches the ELAB knowledge base to find relevant experiment context.
 * Dual-mode: pgvector semantic search (246 volume chunks) + keyword fallback (62 experiment chunks).
 * Enhanced scoring with synonym expansion and concept matching.
 * (c) Andrea Marro — 02/04/2026
 */

import knowledgeBase from '../knowledge-base.json' with { type: 'json' };
import { logSilentFailure } from './observability.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface KnowledgeChunk {
  id: string;
  volume: number;
  chapter: string;
  title: string;
  content: string;
  token_estimate: number;
}

const chunks: KnowledgeChunk[] = knowledgeBase as KnowledgeChunk[];

// Italian stop words to skip (common words that dilute scores)
const STOP_WORDS = new Set([
  'come', 'cosa', 'sono', 'essere', 'fare', 'avere', 'questo', 'quello',
  'dove', 'quando', 'perché', 'anche', 'ancora', 'solo', 'sempre', 'molto',
  'ogni', 'tutti', 'tutto', 'proprio', 'così', 'dopo', 'prima', 'senza',
  'con', 'per', 'che', 'non', 'una', 'uno', 'del', 'nel', 'sul', 'alla',
  'della', 'dalla', 'nella', 'sulla', 'dei', 'degli', 'alle', 'delle',
  'può', 'deve', 'voglio', 'vorrei', 'puoi', 'dimmi', 'aiuto',
]);

// ─── Synonym map: kid/casual Italian → technical terms in chunks ───
// 80+ entries covering: components, actions, concepts, errors, slang
const SYNONYM_MAP: Record<string, string[]> = {
  // ── LED & Lights ──
  'lampadina': ['led', 'diodo', 'luminosità'],
  'lucina': ['led', 'diodo'],
  'lucetta': ['led', 'diodo'],
  'luce': ['led', 'luminosità', 'accende', 'diodo'],
  'luminoso': ['led', 'luminosità', 'brightness'],
  'lampeggia': ['blink', 'lampeggio', 'intermittente', 'led'],
  'lampeggiare': ['blink', 'lampeggio', 'delay'],
  'brillare': ['led', 'luminosità', 'accende'],
  'cosino rosso': ['led', 'diodo'],
  'cosino verde': ['led', 'rgb'],

  // ── Buttons & Interaction ──
  'bottone': ['pulsante', 'push-button', 'button', 'digitalread'],
  'premere': ['pulsante', 'press', 'digitalread'],
  'schiacciare': ['pulsante', 'press', 'button'],
  'cliccare': ['pulsante', 'press'],
  'tasto': ['pulsante', 'button', 'push-button'],

  // ── Controls & Knobs ──
  'manopola': ['potenziometro', 'pot', 'analogread'],
  'girare': ['potenziometro', 'rotazione', 'analogread'],
  'ruotare': ['potenziometro', 'servo', 'rotazione'],
  'regolare': ['potenziometro', 'pwm', 'analogwrite'],
  'cursore': ['potenziometro', 'slider'],

  // ── Wires & Connections ──
  'filo': ['wire', 'connessione', 'collega', 'cavo'],
  'cavo': ['wire', 'filo', 'connessione'],
  'collegare': ['collega', 'connessione', 'wire'],
  'attaccare': ['collega', 'connessione', 'inserire'],
  'staccare': ['scollega', 'disconnetti', 'rimuovi'],
  'inserire': ['collega', 'breadboard', 'foro'],
  'connettere': ['collega', 'connessione', 'wire'],
  'ponticello': ['wire', 'jumper', 'filo'],
  'jumper': ['wire', 'filo', 'ponticello'],

  // ── Electrical Concepts ──
  'corrente': ['ampere', 'ohm', 'tensione', 'voltaggio', 'flusso'],
  'voltaggio': ['tensione', 'volt', 'batteria', 'alimentazione'],
  'tensione': ['volt', 'voltaggio', 'alimentazione', 'ddp'],
  'energia': ['corrente', 'tensione', 'potenza', 'watt'],
  'elettricità': ['corrente', 'tensione', 'circuito', 'elettroni'],
  'potenza': ['watt', 'corrente', 'tensione'],
  'frequenza': ['hertz', 'pwm', 'oscillazione'],

  // ── Power Supply ──
  'pila': ['batteria', '9v', 'alimentazione', 'tensione'],
  'batteria': ['alimentazione', '9v', 'tensione', 'pila'],
  'alimentazione': ['batteria', '9v', 'usb', '5v'],
  'carica': ['batteria', 'condensatore', 'energia'],
  'scarica': ['condensatore', 'batteria', 'energia'],

  // ── Board / Arduino ──
  'scheda': ['arduino', 'nano', 'board', 'microcontrollore'],
  'programma': ['codice', 'sketch', 'blink', 'compile', 'upload'],
  'programmazione': ['codice', 'sketch', 'arduino', 'ide'],
  'arduino': ['nano', 'board', 'microcontrollore', 'atmega'],
  'computer': ['arduino', 'microcontrollore', 'processore'],
  'cervello': ['arduino', 'microcontrollore', 'processore'],
  'caricare': ['upload', 'compile', 'sketch', 'hex'],
  'compilare': ['compile', 'errore', 'codice', 'sketch'],
  'scrivere': ['codice', 'sketch', 'programma'],

  // ── Sound ──
  'suono': ['buzzer', 'piezo', 'tone', 'frequenza'],
  'bip': ['buzzer', 'piezo', 'tone'],
  'rumorino': ['buzzer', 'piezo'],
  'musica': ['buzzer', 'tone', 'frequenza', 'melodia'],
  'nota': ['tone', 'frequenza', 'buzzer'],
  'volume': ['pwm', 'analogwrite', 'loudness'],

  // ── Sensors ──
  'sensore': ['ldr', 'fotoresistenza', 'fotoresistore', 'analogread'],
  'misurare': ['analogread', 'sensore', 'multimetro', 'valore'],
  'leggere': ['digitalread', 'analogread', 'sensore', 'input'],
  'luminosità': ['ldr', 'fotoresistenza', 'analogread'],
  'buio': ['ldr', 'fotoresistenza', 'bassa luminosità'],
  'temperatura': ['sensore', 'ntc', 'termometro'],

  // ── Motors ──
  'motore': ['servo', 'motor', 'dc', 'pwm'],
  'motorino': ['motor', 'dc', 'servo'],
  'ventola': ['motor', 'dc', 'fan'],
  'muovere': ['servo', 'motor', 'angolo', 'rotazione'],
  'braccio': ['servo', 'angolo', 'gradi'],

  // ── Display ──
  'schermo': ['lcd', 'display', '16x2', 'liquidcrystal'],
  'scrivere': ['lcd', 'print', 'display', 'testo'],
  'messaggio': ['lcd', 'serial', 'print', 'testo'],
  'testo': ['lcd', 'print', 'display', 'serial'],

  // ── Colors ──
  'colore': ['rgb', 'rosso', 'verde', 'blu', 'led'],
  'giallo': ['colore', 'rgb', 'led'],
  'bianco': ['colore', 'rgb', 'led'],
  'arancione': ['colore', 'rgb', 'led'],
  'viola': ['colore', 'rgb', 'led'],
  'mescolare': ['rgb', 'colore', 'analogwrite', 'pwm'],

  // ── Components (general) ──
  'resistenza': ['resistore', 'ohm', 'banda', 'colore'],
  'condensatore': ['capacità', 'carica', 'scarica', 'farad'],
  'diodo': ['led', 'anodo', 'catodo', 'polarità'],
  'transistor': ['mosfet', 'amplificatore', 'interruttore', 'base'],
  'relè': ['interruttore', 'bobina', 'contatto'],
  'componente': ['resistore', 'led', 'condensatore', 'breadboard'],
  'pezzo': ['componente', 'resistore', 'led', 'filo'],
  'cosa': ['componente', 'pezzo'],

  // ── Breadboard ──
  'buco': ['breadboard', 'foro', 'riga', 'colonna'],
  'foro': ['breadboard', 'buco', 'pin', 'inserire'],
  'riga': ['breadboard', 'bus', 'connessione'],
  'tavoletta': ['breadboard', 'basetta'],
  'basetta': ['breadboard', 'pcb'],
  'piastra': ['breadboard', 'basetta'],

  // ── States & Problems ──
  'accendere': ['accende', 'acceso', 'accendi', 'on'],
  'accendo': ['accende', 'acceso', 'led', 'on'],
  'spegnere': ['spegne', 'spento', 'spegni', 'off'],
  'rompere': ['bruciato', 'danneggiato', 'rotto', 'guasto'],
  'bruciat': ['bruciato', 'danneggiato', 'rotto'],
  'bruciare': ['bruciato', 'sovraccarico', 'senza resistenza'],
  'funziona': ['errore', 'problema', 'sbagliato', 'circuito'],
  'sbagliato': ['errore', 'problema', 'invertito', 'polarità'],
  'errore': ['problema', 'sbagliato', 'debug', 'compilazione'],
  'problema': ['errore', 'guasto', 'non funziona', 'debug'],
  'aiuto': ['errore', 'problema', 'come', 'spiegare'],
  'capisco': ['spiegare', 'come', 'perché', 'funziona'],

  // ── Circuit Concepts ──
  'circuito': ['schema', 'breadboard', 'collegamento', 'percorso'],
  'serie': ['collegamento', 'sequenza', 'uno dopo altro'],
  'parallelo': ['collegamento', 'fianco', 'derivazione'],
  'aperto': ['interrotto', 'scollegato', 'non chiuso'],
  'chiuso': ['collegato', 'completo', 'funzionante'],

  // ── Polarity ──
  'polarità': ['anodo', 'catodo', 'verso', 'positivo', 'negativo'],
  'positivo': ['anodo', 'più', 'vcc', '5v', '9v'],
  'negativo': ['catodo', 'meno', 'gnd', 'massa'],
  'massa': ['gnd', 'ground', 'negativo', '0v'],
  'verso': ['polarità', 'anodo', 'catodo', 'direzione'],
  'piedino': ['pin', 'anodo', 'catodo', 'gamba'],
  'gamba': ['pin', 'piedino', 'terminale'],
  'lungo': ['anodo', 'positivo', 'piedino lungo'],
  'corto': ['catodo', 'negativo', 'piedino corto'],

  // ── Arduino I/O ──
  'pin': ['digitalread', 'digitalwrite', 'analogread', 'analogwrite'],
  'digitale': ['digitalread', 'digitalwrite', 'high', 'low'],
  'analogico': ['analogread', 'analogwrite', 'pwm', 'adc'],
  'pwm': ['analogwrite', 'duty cycle', 'modulazione', 'dimmer'],
  'output': ['digitalwrite', 'analogwrite', 'uscita'],
  'input': ['digitalread', 'analogread', 'ingresso', 'sensore'],
  'high': ['acceso', 'on', '5v', 'digitalwrite'],
  'low': ['spento', 'off', '0v', 'digitalwrite'],
  'delay': ['attesa', 'pausa', 'millisecondi', 'tempo'],
  'aspettare': ['delay', 'pausa', 'millisecondi'],
  'veloce': ['delay', 'frequenza', 'velocità'],
  'lento': ['delay', 'rallentare', 'pausa'],

  // ── Code Concepts ──
  'variabile': ['int', 'valore', 'memorizzare', 'dato'],
  'ciclo': ['loop', 'for', 'while', 'ripetere'],
  'ripetere': ['loop', 'ciclo', 'for', 'while'],
  'condizione': ['if', 'else', 'confronto', 'decisione'],
  'confrontare': ['if', 'maggiore', 'minore', 'uguale'],

  // ── Serial Monitor ──
  'monitor': ['serial', 'seriale', 'print', 'debug'],
  'seriale': ['serial', 'monitor', 'baud', 'print'],
  'stampare': ['serial', 'print', 'println', 'monitor'],
  'debug': ['serial', 'monitor', 'errore', 'valore'],
};

/**
 * Simple Italian suffix stemmer.
 * Reduces inflected forms to a common stem for better matching.
 * E.g., "collegato" → "colleg", "resistori" → "resistor", "acceso" → "acces"
 * Not linguistically perfect, but catches 80%+ of Italian inflections.
 */
function italianStem(word: string): string {
  if (word.length < 4) return word; // Don't stem short words

  // Remove common Italian suffixes (longest first)
  const suffixes = [
    'amento', 'imento', 'azione', 'zione',
    'mente', 'atore', 'atrice', 'abile', 'ibile',
    'ando', 'endo', 'endo', 'ante', 'ente', 'ione',
    'ato', 'ata', 'ati', 'ate', 'ito', 'ita', 'iti', 'ite',
    'oso', 'osa', 'osi', 'ose', 'ura', 'ore', 'ice',
    'are', 'ere', 'ire', 'ano', 'ono', 'ino',
    'to', 'ta', 'ti', 'te', // past participles
    'no', 'na', 'ni', 'ne', // adjective endings
    'so', 'sa', 'si', 'se',
    'lo', 'la', 'li', 'le',
    'io', 'ia', 'ii', 'ie',
    'al', 'il',
    'i', 'e', 'o', 'a', // singular/plural endings
  ];

  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

/**
 * Expand a query with synonyms for better matching.
 */
function expandQuery(queryWords: string[]): string[] {
  const expanded = new Set(queryWords);
  for (const word of queryWords) {
    const synonyms = SYNONYM_MAP[word];
    if (synonyms) {
      for (const syn of synonyms) expanded.add(syn);
    }
    // Also check if any key partially matches
    for (const [key, syns] of Object.entries(SYNONYM_MAP)) {
      if (word.includes(key) || key.includes(word)) {
        for (const syn of syns) expanded.add(syn);
      }
    }
  }
  return [...expanded];
}

/**
 * Find the most relevant knowledge chunks for a query.
 * Enhanced scoring: synonym expansion, bigram matching, concept weighting.
 */
export function retrieveContext(
  query: string,
  experimentId?: string | null,
  maxTokens: number = 800,
): string {
  if (!chunks || chunks.length === 0) return '';

  const queryLower = query.toLowerCase();
  const queryWords = queryLower
    .split(/\s+/)
    .map(w => w.replace(/[^a-zàèéìòùç0-9]/g, ''))
    .filter(w => w.length > 1 && !STOP_WORDS.has(w)); // Keep 2+ char words (led, 9v, ohm), skip stop words

  // Expand with synonyms
  const expandedWords = expandQuery(queryWords);

  // Build stems for fuzzy matching (e.g., "collegato" matches "collega")
  const queryStems = queryWords.map(italianStem).filter(s => s.length >= 3);

  // Build bigrams for phrase matching
  const bigrams: string[] = [];
  for (let i = 0; i < queryWords.length - 1; i++) {
    bigrams.push(`${queryWords[i]} ${queryWords[i + 1]}`);
  }

  const scored = chunks.map(chunk => {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();
    const titleLower = chunk.title.toLowerCase();
    const chapterLower = chunk.chapter.toLowerCase();

    // Exact experiment ID match = highest priority
    if (experimentId && chunk.id === experimentId) {
      score += 100;
    }

    // Expanded keyword matching (includes synonyms)
    // Use word boundary check for short terms (<4 chars) to avoid false positives
    for (const word of expandedWords) {
      const isShort = word.length < 4;
      const wordRegex = isShort ? new RegExp(`\\b${word}\\b`, 'i') : null;
      const matches = isShort
        ? wordRegex!.test(contentLower)
        : contentLower.includes(word);

      if (matches) {
        score += 2;
        const titleMatch = isShort ? wordRegex!.test(titleLower) : titleLower.includes(word);
        const chapterMatch = isShort ? wordRegex!.test(chapterLower) : chapterLower.includes(word);
        if (titleMatch) score += 3;
        if (chapterMatch) score += 2;
      }
    }

    // Stemmed matching — catches inflected forms (collegato↔collega, resistori↔resistore)
    for (const stem of queryStems) {
      if (contentLower.includes(stem)) {
        score += 1; // Lower weight than exact match to avoid noise
      }
    }

    // Bigram matching (phrase proximity)
    for (const bigram of bigrams) {
      if (contentLower.includes(bigram)) score += 5;
    }

    // Component type matching (boosted)
    const componentKeywords = [
      'led', 'resistore', 'pulsante', 'buzzer', 'potenziometro',
      'batteria', 'condensatore', 'motore', 'servo', 'lcd',
      'arduino', 'breadboard', 'rgb', 'ldr', 'fotoresistenza',
      'transistor', 'mosfet', 'relè', 'diodo',
    ];
    for (const comp of componentKeywords) {
      if (queryLower.includes(comp) && contentLower.includes(comp)) {
        score += 5;
      }
    }

    // Concept matching (electrical concepts)
    const conceptKeywords = [
      'legge di ohm', 'tensione', 'corrente', 'resistenza',
      'circuito aperto', 'circuito chiuso', 'parallelo', 'serie',
      'polarità', 'anodo', 'catodo', 'pwm', 'analogico', 'digitale',
    ];
    for (const concept of conceptKeywords) {
      if (queryLower.includes(concept) && contentLower.includes(concept)) {
        score += 8; // High weight for concept matches
      }
    }

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // ── Confidence threshold: avoid hallucination from irrelevant chunks ──
  // If best score < MIN_CONFIDENCE, RAG adds nothing (UNLIM answers from its own knowledge)
  const MIN_CONFIDENCE = 5;
  const topScore = scored.length > 0 ? scored[0].score : 0;

  if (topScore < MIN_CONFIDENCE) {
    return ''; // No confident match — better to say nothing than inject noise
  }

  const selected: KnowledgeChunk[] = [];
  let totalTokens = 0;

  for (const { chunk, score } of scored) {
    if (score < MIN_CONFIDENCE) break; // Stop at low-confidence chunks
    if (totalTokens + chunk.token_estimate > maxTokens) continue;
    selected.push(chunk);
    totalTokens += chunk.token_estimate;
    if (selected.length >= 4) break; // Up from 3 → 4 chunks for richer context
  }

  if (selected.length === 0) return '';

  const contextParts = selected.map(c =>
    `--- ${c.title} (${c.chapter}) ---\n${c.content}`
  );

  return `\n[CONOSCENZA DAI VOLUMI ELAB]\n${contextParts.join('\n\n')}`;
}

/**
 * Get the full content for a specific experiment by ID.
 */
export function getExperimentKnowledge(experimentId: string): string | null {
  const chunk = chunks.find(c => c.id === experimentId);
  return chunk?.content || null;
}

/**
 * Generate embedding using Gemini API.
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!GEMINI_API_KEY) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          model: 'models/gemini-embedding-001',
          content: { parts: [{ text: text.slice(0, 2048) }] },
        }),
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data?.embedding?.values || null;
  } catch (err) {
    // iter 105 ops: surface silent gemini embedding failures (was: catch{} return null)
    logSilentFailure('rag_gemini_embedding_failed', err, { provider: 'gemini' });
    return null;
  }
}

/**
 * Semantic search using Supabase pgvector.
 * Falls back to keyword search if pgvector is not configured.
 */
export async function retrieveVolumeContext(
  query: string,
  experimentId?: string | null,
  maxChunks: number = 3,
): Promise<string> {
  // Try semantic search first
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && GEMINI_API_KEY) {
    try {
      const embedding = await generateEmbedding(query);
      if (embedding && embedding.length > 0) {
        const searchController = new AbortController();
        const searchTimeout = setTimeout(() => searchController.abort(), 5000); // 5s timeout

        const searchResp = await fetch(
          `${SUPABASE_URL}/rest/v1/rpc/search_chunks`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
            },
            body: JSON.stringify({
              query_embedding: embedding,
              match_threshold: 0.55, // Raised from 0.45 → 0.55 to reduce irrelevant matches
              match_count: maxChunks + 1, // Fetch 1 extra, filter by quality
            }),
            signal: searchController.signal,
          },
        );

        clearTimeout(searchTimeout);

        if (searchResp.ok) {
          const results = await searchResp.json();
          if (results && results.length > 0) {
            // Deduplicate: skip chunks with >60% content overlap (avoids repetitive context)
            const unique: typeof results = [];
            for (const r of results) {
              const isDuplicate = unique.some(u => {
                const overlap = r.content.split(' ').filter((w: string) =>
                  u.content.includes(w)).length / r.content.split(' ').length;
                return overlap > 0.6;
              });
              if (!isDuplicate) unique.push(r);
            }
            if (unique.length > 0) {
              const parts = unique.slice(0, maxChunks).map((r: { chapter: string; section: string; content: string; similarity: number }) =>
                `--- ${r.chapter}${r.section ? ` / ${r.section}` : ''} ---\n${r.content}`
              );
              return `\n[CONOSCENZA DAI VOLUMI ELAB]\n${parts.join('\n\n')}`;
            }
          }
        }
      }
    } catch {
      // Fall through to keyword search
    }
  }

  // Fallback: enhanced keyword search on inline knowledge base (1200 tokens for richer context)
  return retrieveContext(query, experimentId, 1200);
}

// ════════════════════════════════════════════════════════════════════════════
// Sprint S iter 8 ATOM-S8-A2 — Hybrid RAG retriever
// ════════════════════════════════════════════════════════════════════════════
//
// Combines BM25 italian (postgres FTS, content_fts column LIVE post migration
// 20260427090000) with dense pgvector cosine search via match_rag_chunks RPC,
// then fuses rankings via Reciprocal Rank Fusion (RRF k=60). Optional bge-style
// rerank via Voyage rerank-2.5 when ENABLE_RERANKER=true.
//
// Backwards compatible: existing dense-only `retrieveVolumeContext` call path
// is unchanged. New code uses `hybridRetrieve(query, topK, opts)`.
//
// PRINCIPIO ZERO + MORFISMO compliance: chunks returned with citations Vol/pag
// preserved verbatim from rag_chunks.content_raw column.
//
// Reference: ADR-015 + supabase/migrations/20260426160000_rag_chunks_hybrid.sql
// + supabase/migrations/20260427090000_rag_chunks_dedup_unique.sql

const VOYAGE_API_KEY = Deno.env.get('VOYAGE_API_KEY') || '';
const ENABLE_RERANKER = (Deno.env.get('RAG_RERANK_ENABLED') || 'false').toLowerCase() === 'true';

export interface HybridChunk {
  id: string;
  content: string;
  content_raw: string;
  source: string;
  chapter: number | null;
  page: number | null;
  figure_id: string | null;
  /** Iter 13 U1: section_title surfaced from rag_chunks schema (was NULL pre-fix). */
  section_title: string | null;
  /** Iter 13 U3: explicit corpus tag — 'rag' (volumi) | 'wiki' (concept) | 'mixed'. */
  corpus: 'rag' | 'wiki' | 'mixed';
  rrf_score: number;
  bm25_rank: number | null;
  dense_rank: number | null;
  similarity?: number;
}

export interface HybridRetrieveOptions {
  /** Override default RRF k=60. */
  rrfK?: number;
  /** Enable bge-style rerank (Voyage rerank-2.5). Defaults to env ENABLE_RERANKER. */
  rerank?: boolean;
  /** Filter by source (e.g. 'vol1', 'vol2', 'vol3', 'wiki'). */
  filterSource?: string;
  /** Filter by chapter (e.g. 6 for Cap 6 LED). */
  filterChapter?: number;
  /** Total candidate pool to fetch from each retriever before fusion (default 50). */
  candidatePool?: number;
  /** Return raw debug info (per-retriever rankings). */
  debug?: boolean;
  /**
   * Iter 13 U3: Wiki LLM Hybrid fusion mode.
   * When true: run RAG (volumi) retrieval AND Wiki retrieval in parallel as
   * separate corpora, then RRF-fuse the 4 ranked lists (rag-bm25, rag-dense,
   * wiki-bm25, wiki-dense) at k=60. Prevents the larger volumi corpus from
   * starving the 100-chunk wiki corpus during ranking.
   * Default false (preserves iter 12 single-corpus behavior).
   */
  wikiFusion?: boolean;
}

/**
 * BM25 search via postgres FTS on content_fts column (italian dict).
 * Returns ordered list of {id, rank, content_raw, ...}.
 *
 * Uses inline RPC-style query via PostgREST or falls back to /rest/v1/rag_chunks
 * with full-text search header.
 */
async function bm25Search(
  query: string,
  limit: number,
  filterSource?: string,
  filterChapter?: number,
): Promise<Array<{ id: string; content: string; content_raw: string; source: string; chapter: number | null; page: number | null; figure_id: string | null; section_title: string | null; rank: number }>> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return [];

  // Use search_rag_hybrid RPC if available (provides BM25+dense fused), but
  // for BM25-only we use a tailored RPC. Fall back to direct PostgREST FTS.
  // Strategy: call the existing search_rag_hybrid RPC with a zero-vector dense
  // (so dense_rank is dropped from fusion) — but cleaner is direct query.
  // Direct PostgREST: GET /rest/v1/rag_chunks?content_fts=plfts(italian).<query>
  //
  // Iter 11 P0 fix: Italian FTS strips single-letter tokens + stopwords ("V",
  // "R", "I", "per", "di", ecc.). Query "Ohm legge formula V uguale R per I"
  // → tsquery empty after Italian stemmer = 0 results. Solution: pre-clean
  // query removing single-letter tokens + Italian stopwords BEFORE plfts call.
  // iter 105 ops fix (2026-05-25): dedupe 'della' + 'non' (each listed twice in
  // legacy literal). Same set semantics, removes silent duplicates that hide
  // list-maintenance regressions during review.
  const STOPWORDS_IT = new Set(['di','il','la','un','una','per','con','del','della','su','tra','fra','dei','delle','degli','al','alla','ad','è','sono','sei','non','ma','si','no','che','cosa','come','quando','perché','più','meno','molto','poco','tutti','tutto','ogni','some','of','the','for','an','to','from','as','by','with','is','are','was','were','do']);
  const cleanedQuery = query
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOPWORDS_IT.has(w.toLowerCase()))
    .join(' ')
    .trim();
  const safeQuery = encodeURIComponent(cleanedQuery);
  if (!safeQuery) return [];

  // Iter 11 P0 fix: plfts uses AND logic between tokens → query "Ohm legge formula uguale"
  // requires ALL match = 0 results when "uguale" not in chunk. Switch to wfts (websearch_to_tsquery)
  // which handles partial matches better, OR build explicit OR tsquery via fts.
  // Strategy: try wfts first; if 0 results → fallback fts with OR-joined tokens.
  // Iter 13 U1 P0 fix: include section_title in SELECT (was missing → NULL in debug_retrieval).
  let url = `${SUPABASE_URL}/rest/v1/rag_chunks`
    + `?select=id,content,content_raw,source,chapter,page,figure_id,section_title`
    + `&content_fts=wfts(italian).${safeQuery}`
    + `&limit=${limit}`;
  if (filterSource) url += `&source=eq.${encodeURIComponent(filterSource)}`;
  if (typeof filterChapter === 'number') url += `&chapter=eq.${filterChapter}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Accept': 'application/json',
      },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const rows = await res.json() as Array<Record<string, unknown>>;
    let result = (rows || []).map((row, idx) => ({
      id: String(row.id ?? ''),
      content: String(row.content ?? ''),
      content_raw: String(row.content_raw ?? row.content ?? ''),
      source: String(row.source ?? ''),
      chapter: typeof row.chapter === 'number' ? row.chapter : null,
      page: typeof row.page === 'number' ? row.page : null,
      figure_id: row.figure_id ? String(row.figure_id) : null,
      // Iter 13 U1: section_title surfaced from row (was missing → NULL).
      section_title: row.section_title ? String(row.section_title) : null,
      rank: idx + 1,
    }));

    // Iter 11 P0 fix: if wfts returns 0, retry with explicit OR tsquery
    // (handles edge cases where Italian stemmer + websearch logic miss matches).
    // Iter 12 ATOM-S12-A2: lower token-length filter 3 → 2 (Italian queries
    // often short: "legge Ohm", "LED rosso" → 2 short tokens after stop-word
    // strip). Min token count gate stays >= 2 (no regression for >= 3 case).
    if (result.length === 0 && cleanedQuery.length > 0) {
      const tokens = cleanedQuery.split(/\s+/).filter(t => t.length >= 2);
      if (tokens.length >= 2) {
        const orQuery = encodeURIComponent(tokens.join(' | '));
        // Iter 13 U1 P0 fix: include section_title in fallback SELECT.
        const fallbackUrl = `${SUPABASE_URL}/rest/v1/rag_chunks`
          + `?select=id,content,content_raw,source,chapter,page,figure_id,section_title`
          + `&content_fts=fts(italian).${orQuery}`
          + `&limit=${limit}`
          + (filterSource ? `&source=eq.${encodeURIComponent(filterSource)}` : '')
          + (typeof filterChapter === 'number' ? `&chapter=eq.${filterChapter}` : '');
        try {
          const ctrlFb = new AbortController();
          const fbTimer = setTimeout(() => ctrlFb.abort(), 5000);
          const fbRes = await fetch(fallbackUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Accept': 'application/json',
            },
            signal: ctrlFb.signal,
          });
          clearTimeout(fbTimer);
          if (fbRes.ok) {
            const fbRows = await fbRes.json() as Array<Record<string, unknown>>;
            result = (fbRows || []).map((row, idx) => ({
              id: String(row.id ?? ''),
              content: String(row.content ?? ''),
              content_raw: String(row.content_raw ?? row.content ?? ''),
              source: String(row.source ?? ''),
              chapter: typeof row.chapter === 'number' ? row.chapter : null,
              page: typeof row.page === 'number' ? row.page : null,
              figure_id: row.figure_id ? String(row.figure_id) : null,
              // Iter 13 U1: section_title surfaced (fallback path).
              section_title: row.section_title ? String(row.section_title) : null,
              rank: idx + 1,
            }));
          }
        } catch (err) {
          // iter 105 ops: was silent (`_err`); surface for production observability
          logSilentFailure('rag_bm25_or_fallback_failed', err, { stage: 'fts_or_retry' });
        }
      }
    }

    return result;
  } catch (err) {
    clearTimeout(timer);
    // iter 105 ops: surface bm25Search outer silent failures
    logSilentFailure('rag_bm25_outer_failed', err, { stage: 'bm25_outer' });
    return [];
  }
}

/**
 * Dense pgvector search via match_rag_chunks RPC (when present) OR via the
 * existing search_chunks RPC iter 5+ (Voyage 1024-dim embeddings).
 *
 * NOTE: iter 7 ingest used Voyage voyage-3 (1024-dim). Embed query with
 * Voyage if VOYAGE_API_KEY present, else fall back to Gemini embedding (768-dim
 * — would not match column type 1024). Iter 8 default = Voyage.
 */
async function denseSearch(
  query: string,
  limit: number,
  filterSource?: string,
  filterChapter?: number,
): Promise<Array<{ id: string; content: string; content_raw: string; source: string; chapter: number | null; page: number | null; figure_id: string | null; section_title: string | null; rank: number; similarity: number }>> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return [];

  const embedding = await embedQueryVoyage(query);
  if (!embedding || embedding.length === 0) return [];

  // Try modern RPC first (search_rag_dense_only — created by hybrid migration)
  const rpcs = ['search_rag_dense_only', 'match_rag_chunks', 'match_chunks_voyage'];
  for (const rpc of rpcs) {
    const url = `${SUPABASE_URL}/rest/v1/rpc/${rpc}`;
    const body: Record<string, unknown> = {
      query_embedding: embedding,
      match_count: limit,
      threshold: 0.5,
    };
    if (filterSource) body.filter_source = filterSource;
    if (typeof filterChapter === 'number') body.filter_chapter = filterChapter;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const rows = await res.json() as Array<Record<string, unknown>>;
      if (!Array.isArray(rows) || rows.length === 0) continue;
      return rows.map((row, idx) => ({
        id: String(row.id ?? ''),
        content: String(row.content ?? ''),
        content_raw: String(row.content_raw ?? row.content ?? ''),
        source: String(row.source ?? ''),
        chapter: typeof row.chapter === 'number' ? row.chapter : null,
        page: typeof row.page === 'number' ? row.page : null,
        figure_id: row.figure_id ? String(row.figure_id) : null,
        // Iter 13 U1: section_title surfaced — relies on RPC RETURNS TABLE
        // including section_title column. Pre-iter-13 RPC schema does NOT include
        // it (migration 20260426160000 RETURNS TABLE list lacks section_title);
        // for now we fall through to null. Iter 14 migration scope: extend
        // search_rag_dense_only + search_rag_hybrid RPCs to RETURN section_title.
        section_title: row.section_title ? String(row.section_title) : null,
        rank: idx + 1,
        similarity: typeof row.similarity === 'number' ? row.similarity : 0,
      }));
    } catch (_err) {
      clearTimeout(timer);
      continue;
    }
  }
  return [];
}

/**
 * Embed query via Voyage AI voyage-3 (1024-dim). Matches iter 7 RAG ingest.
 */
async function embedQueryVoyage(query: string): Promise<number[] | null> {
  if (!VOYAGE_API_KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VOYAGE_API_KEY}`,
      },
      body: JSON.stringify({
        input: [query.slice(0, 4096)],
        model: 'voyage-3',
        input_type: 'query',
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.[0]?.embedding || null;
  } catch (err) {
    clearTimeout(timer);
    // iter 105 ops: surface Voyage embedding silent failures
    logSilentFailure('rag_voyage_embedding_failed', err, { provider: 'voyage', model: 'voyage-3' });
    return null;
  }
}

/**
 * Reciprocal Rank Fusion: standard formula score = Σ 1 / (k + rank_in_ranker).
 * Higher score = better. Returns map keyed by chunk id.
 */
function rrfFuse(
  bm25Results: Array<{ id: string; rank: number }>,
  denseResults: Array<{ id: string; rank: number }>,
  k: number,
): Map<string, { rrf_score: number; bm25_rank: number | null; dense_rank: number | null }> {
  const fused = new Map<string, { rrf_score: number; bm25_rank: number | null; dense_rank: number | null }>();
  for (const r of bm25Results) {
    const cur = fused.get(r.id) || { rrf_score: 0, bm25_rank: null, dense_rank: null };
    cur.rrf_score += 1 / (k + r.rank);
    cur.bm25_rank = r.rank;
    fused.set(r.id, cur);
  }
  for (const r of denseResults) {
    const cur = fused.get(r.id) || { rrf_score: 0, bm25_rank: null, dense_rank: null };
    cur.rrf_score += 1 / (k + r.rank);
    cur.dense_rank = r.rank;
    fused.set(r.id, cur);
  }
  return fused;
}

/**
 * Iter 13 U2+U3: Multi-list RRF fusion. Generalizes rrfFuse to N ranked lists
 * (e.g. rag-bm25, rag-dense, wiki-bm25, wiki-dense). Each list contributes
 * 1/(k+rank) to a chunk's combined score. Required for Wiki LLM Hybrid fusion
 * (U3) where 4 independent rankings must merge into one ordering.
 *
 * @param lists ranked lists each with `id`+`rank` (rank is 1-indexed best-first)
 * @param k     RRF dampening constant (default upstream caller passes 60)
 */
export function rrfFuseMulti(
  lists: Array<Array<{ id: string; rank: number }>>,
  k: number,
): Map<string, number> {
  const fused = new Map<string, number>();
  for (const list of lists) {
    for (const r of list) {
      const prev = fused.get(r.id) ?? 0;
      fused.set(r.id, prev + 1 / (k + r.rank));
    }
  }
  return fused;
}

/**
 * Voyage rerank-2.5 cross-encoder rerank. Optional, gated by RAG_RERANK_ENABLED.
 * Slices candidates to top-N via reranker scores. Latency ~200-400ms.
 */
async function voyageRerank(
  query: string,
  candidates: HybridChunk[],
  topN: number,
): Promise<HybridChunk[]> {
  if (!VOYAGE_API_KEY || candidates.length === 0) return candidates.slice(0, topN);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch('https://api.voyageai.com/v1/rerank', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VOYAGE_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        documents: candidates.map(c => c.content_raw.slice(0, 1500)),
        model: 'rerank-2.5',
        top_k: Math.min(topN, candidates.length),
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return candidates.slice(0, topN);
    const data = await res.json();
    const ranked = (data?.data || []) as Array<{ index: number; relevance_score: number }>;
    if (!ranked.length) return candidates.slice(0, topN);
    return ranked.map(r => candidates[r.index]).filter(Boolean).slice(0, topN);
  } catch (err) {
    clearTimeout(timer);
    // iter 105 ops: surface Voyage rerank silent failures; preserve fallback ordering
    logSilentFailure('rag_voyage_rerank_failed', err, { provider: 'voyage', topN, candidateCount: candidates.length });
    return candidates.slice(0, topN);
  }
}

/**
 * Hybrid RAG retrieval: BM25 italian + dense pgvector + RRF k=60 + optional rerank.
 *
 * @example
 *   const chunks = await hybridRetrieve('come funziona il LED', 5);
 *   for (const c of chunks) console.log(c.source, c.page, c.content_raw);
 *
 * Backwards compatible — existing `retrieveVolumeContext` dense-only path still
 * available. Use this function for ADR-015 hybrid path.
 *
 * Fallback strategy:
 *   - BM25 fail (FTS column missing OR query empty after stop-word strip) → dense only
 *   - Dense fail (Voyage key missing) → BM25 only
 *   - Both fail → empty array (caller should fall back to inline knowledge base)
 */
export async function hybridRetrieve(
  query: string,
  topK: number = 5,
  opts: HybridRetrieveOptions = {},
): Promise<HybridChunk[]> {
  const k = opts.rrfK ?? 60;
  const candidatePool = opts.candidatePool ?? 50;
  const useRerank = opts.rerank ?? ENABLE_RERANKER;
  // Iter 13 U3 default ON: env opt-out via RAG_WIKI_FUSION_DISABLED=true.
  const envWikiOff = (Deno.env.get('RAG_WIKI_FUSION_DISABLED') || 'false').toLowerCase() === 'true';
  const useWikiFusion = opts.wikiFusion ?? !envWikiOff;

  // Iter 13 U3: Wiki LLM Hybrid fusion — run RAG + Wiki retrievals in parallel
  // as 4 independent ranked lists (rag-bm25, rag-dense, wiki-bm25, wiki-dense),
  // then RRF k=60 fuse all 4. Avoids 1881-vs-100 corpus imbalance starving wiki.
  // Skipped when caller already filters by source (filterSource override wins).
  const wikiFusionActive = useWikiFusion && !opts.filterSource;

  // Run BM25 + dense in parallel — single corpus path (default fallback).
  const [bm25Raw, denseRaw] = await Promise.all([
    bm25Search(query, candidatePool, opts.filterSource, opts.filterChapter),
    denseSearch(query, candidatePool, opts.filterSource, opts.filterChapter),
  ]);

  // U3 wiki fusion: also fetch wiki-only ranked lists in parallel for RRF
  // multi-list fusion. Reserve ~20% candidatePool for wiki to keep latency flat.
  let wikiBm25Raw: typeof bm25Raw = [];
  let wikiDenseRaw: typeof denseRaw = [];
  if (wikiFusionActive) {
    const wikiPool = Math.max(10, Math.floor(candidatePool * 0.4));
    try {
      const [wb, wd] = await Promise.all([
        bm25Search(query, wikiPool, 'wiki', opts.filterChapter),
        denseSearch(query, wikiPool, 'wiki', opts.filterChapter),
      ]);
      wikiBm25Raw = wb;
      wikiDenseRaw = wd;
    } catch (err) {
      // Wiki fetch failure non-fatal — proceed with rag-only fusion.
      // iter 105 ops: surface wiki fusion failure (was silent `_err`)
      logSilentFailure('rag_wiki_fusion_failed', err, { stage: 'wiki_parallel_fetch' });
      wikiBm25Raw = [];
      wikiDenseRaw = [];
    }
  }

  if (
    bm25Raw.length === 0 && denseRaw.length === 0
    && wikiBm25Raw.length === 0 && wikiDenseRaw.length === 0
  ) return [];

  // Index by id for content lookup
  // Iter 13 U3: classify corpus from `source` field — wiki vs rag (volumi).
  const classifyCorpus = (src: string): 'rag' | 'wiki' => {
    const s = (src || '').toLowerCase();
    return s === 'wiki' ? 'wiki' : 'rag';
  };
  const byId = new Map<string, HybridChunk>();
  // Iter 13 U3: ingest wiki-corpus rows into same byId map. Same shape as RAG;
  // RRF dedupes by id. Done BEFORE rag rows so rag rows can amend missing
  // section_title / similarity if same id appears in both lists (rare but safe).
  for (const r of wikiBm25Raw) {
    byId.set(r.id, {
      id: r.id,
      content: r.content,
      content_raw: r.content_raw,
      source: r.source,
      chapter: r.chapter,
      page: r.page,
      figure_id: r.figure_id,
      section_title: r.section_title,
      corpus: 'wiki',
      rrf_score: 0,
      bm25_rank: r.rank,
      dense_rank: null,
    });
  }
  for (const r of wikiDenseRaw) {
    if (byId.has(r.id)) {
      const cur = byId.get(r.id)!;
      cur.dense_rank = r.rank;
      cur.similarity = r.similarity;
      if (cur.section_title === null && r.section_title) cur.section_title = r.section_title;
    } else {
      byId.set(r.id, {
        id: r.id,
        content: r.content,
        content_raw: r.content_raw,
        source: r.source,
        chapter: r.chapter,
        page: r.page,
        figure_id: r.figure_id,
        section_title: r.section_title,
        corpus: 'wiki',
        rrf_score: 0,
        bm25_rank: null,
        dense_rank: r.rank,
        similarity: r.similarity,
      });
    }
  }
  for (const r of bm25Raw) {
    byId.set(r.id, {
      id: r.id,
      content: r.content,
      content_raw: r.content_raw,
      source: r.source,
      chapter: r.chapter,
      page: r.page,
      figure_id: r.figure_id,
      section_title: r.section_title,
      corpus: classifyCorpus(r.source),
      rrf_score: 0,
      bm25_rank: r.rank,
      dense_rank: null,
    });
  }
  for (const r of denseRaw) {
    if (byId.has(r.id)) {
      const cur = byId.get(r.id)!;
      cur.dense_rank = r.rank;
      cur.similarity = r.similarity;
      // Prefer non-null section_title from any source path
      if (cur.section_title === null && r.section_title) cur.section_title = r.section_title;
    } else {
      byId.set(r.id, {
        id: r.id,
        content: r.content,
        content_raw: r.content_raw,
        source: r.source,
        chapter: r.chapter,
        page: r.page,
        figure_id: r.figure_id,
        section_title: r.section_title,
        corpus: classifyCorpus(r.source),
        rrf_score: 0,
        bm25_rank: null,
        dense_rank: r.rank,
        similarity: r.similarity,
      });
    }
  }

  // Iter 13 U2+U3: RRF k=60 fusion. When wikiFusionActive use multi-list path
  // (4 lists: rag-bm25, rag-dense, wiki-bm25, wiki-dense). Else legacy 2-list.
  if (wikiFusionActive) {
    const multi = rrfFuseMulti(
      [
        bm25Raw.map(r => ({ id: r.id, rank: r.rank })),
        denseRaw.map(r => ({ id: r.id, rank: r.rank })),
        wikiBm25Raw.map(r => ({ id: r.id, rank: r.rank })),
        wikiDenseRaw.map(r => ({ id: r.id, rank: r.rank })),
      ],
      k,
    );
    for (const [id, score] of multi.entries()) {
      const chunk = byId.get(id);
      if (chunk) chunk.rrf_score = score;
    }
  } else {
    const fused = rrfFuse(
      bm25Raw.map(r => ({ id: r.id, rank: r.rank })),
      denseRaw.map(r => ({ id: r.id, rank: r.rank })),
      k,
    );
    for (const [id, scoring] of fused.entries()) {
      const chunk = byId.get(id);
      if (chunk) {
        chunk.rrf_score = scoring.rrf_score;
        chunk.bm25_rank = scoring.bm25_rank;
        chunk.dense_rank = scoring.dense_rank;
      }
    }
  }

  let ranked = [...byId.values()].sort((a, b) => b.rrf_score - a.rrf_score);

  // Optional rerank top-20 → top-K
  if (useRerank && ranked.length > topK) {
    ranked = await voyageRerank(query, ranked.slice(0, 20), topK);
  } else {
    ranked = ranked.slice(0, topK);
  }

  return ranked;
}

/**
 * Format hybrid chunks as a context block for LLM prompts (PRINCIPIO ZERO).
 * Citations Vol.X pag.Y prepended verbatim from chunk metadata.
 */
export function formatHybridContext(chunks: HybridChunk[]): string {
  if (!chunks.length) return '';
  const parts = chunks.map(c => {
    const cite = c.source && c.page ? `[${c.source.toUpperCase()} pag.${c.page}]` : `[${c.source}]`;
    const fig = c.figure_id ? ` ${c.figure_id}` : '';
    return `--- ${cite}${fig} ---\n${c.content_raw}`;
  });
  return `\n[CONOSCENZA DAI VOLUMI ELAB — Hybrid RAG]\n${parts.join('\n\n')}`;
}
