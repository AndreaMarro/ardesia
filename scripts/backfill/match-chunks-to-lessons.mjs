// ELAB Iter 14 P0 — Fuzzy match helpers for RAG metadata backfill
//
// Strategy (Path A):
//   1. For each chunk.content_raw, find best lesson in volume-references.js
//   2. Filter candidates by chunk.source ('vol1' → only v1-* lessons)
//   3. Score = max overlap of:
//        a) bookText substring containment (weight 0.5)
//        b) bookInstructions token overlap (weight 0.3)
//        c) chapter title token overlap (weight 0.2)
//   4. Best candidate wins; tie-break by lower bookPage (earlier in book)
//
// Iter 12 patch (Sprint S 2026-05-10): rewrite resolver to support
// topic-ID sources (kebab-case wiki concept IDs) which dominate the
// actual Supabase rag_chunks table (1881 chunks). Pre-patch dry-run:
// 0/1000 match (script assumed vol1/vol2/vol3 prefix but DB uses
// topic-IDs like 'blink-led', 'digital-write', etc). New flow:
//   - TOPIC_TO_VOLUME lookup table built from docs/unlim-wiki/concepts/*.md
//     frontmatter (volume_ref + pagina_ref + title) — 156 entries.
//   - matchChunkBySource() resolves in this priority:
//       Path A (legacy): source startsWith vol1_/vol2_/vol3_ → fuzzy match
//       Path C (NEW):    TOPIC_TO_VOLUME[source] → canonical metadata
//       fallback:        VOLUME_PREFIX[source] → fuzzy match (legacy)
//   - NULL when no path resolves (existing skip behaviour).
//
// NOTE: Path B (re-ingest with PDF page tracking) remains the proper
//       fix for true paragraph-level page numbers. Path C only solves
//       the topic-level mapping (concept ID → vol+page). Mixed-page
//       wiki concepts default to the frontmatter pagina_ref.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VOLUME_PREFIX = { vol1: 'v1-', vol2: 'v2-', vol3: 'v3-' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const WIKI_CONCEPTS_DIR = path.join(REPO_ROOT, 'docs', 'unlim-wiki', 'concepts');

// ─────────────────────────────────────────────────
// TOPIC_TO_VOLUME — built lazily from wiki frontmatter
// Each entry: { volume:int, page:int, sectionTitle:string }
// Lazy init (build first call) — keeps unit test fast when not needed.
// ─────────────────────────────────────────────────
let _topicToVolumeCache = null;

export function loadTopicToVolume(conceptsDir = WIKI_CONCEPTS_DIR) {
  if (_topicToVolumeCache && conceptsDir === WIKI_CONCEPTS_DIR) {
    return _topicToVolumeCache;
  }
  const map = new Map();
  if (!fs.existsSync(conceptsDir)) {
    if (conceptsDir === WIKI_CONCEPTS_DIR) _topicToVolumeCache = map;
    return map;
  }
  const files = fs.readdirSync(conceptsDir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const full = path.join(conceptsDir, file);
    let raw;
    try {
      raw = fs.readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    // Frontmatter is delimited by first two '---' lines.
    const fmMatch = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) continue;
    const fm = fmMatch[1];
    const idMatch = fm.match(/^id:\s*(.+?)\s*$/m);
    const volMatch = fm.match(/^volume_ref:\s*(\d+)\s*$/m);
    const pageMatch = fm.match(/^pagina_ref:\s*(\d+)\s*$/m);
    const titleMatch = fm.match(/^title:\s*"?(.+?)"?\s*$/m);
    if (!idMatch || !volMatch) continue;  // require at minimum id + volume
    const id = idMatch[1].trim();
    const volume = parseInt(volMatch[1], 10);
    const page = pageMatch ? parseInt(pageMatch[1], 10) : null;
    const sectionTitle = titleMatch
      ? titleMatch[1].replace(/^"|"$/g, '').trim()
      : id;
    if (!Number.isFinite(volume) || volume < 1 || volume > 3) continue;
    map.set(id, { volume, page, sectionTitle });
  }
  if (conceptsDir === WIKI_CONCEPTS_DIR) _topicToVolumeCache = map;
  return map;
}

// Test seam: allow callers to reset cache (vitest isolation).
export function _resetTopicToVolumeCache() {
  _topicToVolumeCache = null;
}

// ─────────────────────────────────────────────────
// Tokenizer — italian-friendly
// ─────────────────────────────────────────────────
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9àèéìòùç\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 4);  // skip stopword-ish short tokens
}

// ─────────────────────────────────────────────────
// Jaccard token overlap
// ─────────────────────────────────────────────────
function jaccard(a, b) {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

// ─────────────────────────────────────────────────
// Substring containment (chunk includes bookText excerpt)
// ─────────────────────────────────────────────────
function substringScore(chunkText, bookText) {
  if (!chunkText || !bookText) return 0;
  const chunkLower = chunkText.toLowerCase();
  const bookLower = bookText.toLowerCase();
  // try first 80 chars of bookText as needle (often the distinctive opening)
  const needle = bookLower.slice(0, 80).trim();
  if (needle.length < 20) return 0;
  if (chunkLower.includes(needle)) return 1.0;
  // fallback: shorter needle 40 chars
  const needle2 = bookLower.slice(0, 40).trim();
  if (needle2.length >= 20 && chunkLower.includes(needle2)) return 0.6;
  return 0;
}

// ─────────────────────────────────────────────────
// Extract chapter integer from "Capitolo 6 - Cos'è il diodo LED?"
// ─────────────────────────────────────────────────
function extractChapterInt(chapterText) {
  const m = (chapterText || '').match(/Capitolo\s+(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

// ─────────────────────────────────────────────────
// MAIN scorer
// ─────────────────────────────────────────────────
export function scoreMatch(chunk, lessonId, lesson) {
  const chunkTokens = tokenize(chunk.content_raw);
  const bookTextTokens = tokenize(lesson.bookText || '');
  const bookInstrTokens = tokenize((lesson.bookInstructions || []).join(' '));
  const chapterTokens = tokenize(lesson.chapter || '');

  const subScore = substringScore(chunk.content_raw, lesson.bookText);
  const instrScore = jaccard(chunkTokens, bookInstrTokens);
  const chapterScore = jaccard(chunkTokens, chapterTokens);
  const bookTextScore = jaccard(chunkTokens, bookTextTokens);

  // weighted sum
  const score = (
    subScore * 0.4 +
    bookTextScore * 0.25 +
    instrScore * 0.20 +
    chapterScore * 0.15
  );

  return {
    lessonId,
    score,
    breakdown: { subScore, bookTextScore, instrScore, chapterScore },
  };
}

// ─────────────────────────────────────────────────
// Find best lesson for a chunk
//
// Iter 12 resolution order (3 paths):
//   Path A — chunk.source is exactly 'vol1'/'vol2'/'vol3' → fuzzy match
//            v1-*/v2-*/v3-* lessons (legacy behaviour preserved).
//   Path C — chunk.source is a topic-ID (kebab-case wiki concept) →
//            TOPIC_TO_VOLUME lookup returns canonical {volume, page, title}.
//            Score = 1.0 (frontmatter is authoritative).
//   Fallback — return null (unknown source, leave NULL in DB).
// ─────────────────────────────────────────────────
export function fuzzyMatchChunkToLesson(chunk, refs, opts = {}) {
  if (!chunk || !chunk.source) return null;
  const source = String(chunk.source);

  // Path A — legacy vol1/vol2/vol3 fuzzy match
  const sourcePrefix = VOLUME_PREFIX[source];
  if (sourcePrefix) {
    let best = null;
    for (const lessonId of Object.keys(refs)) {
      if (!lessonId.startsWith(sourcePrefix)) continue;
      const lesson = refs[lessonId];
      const result = scoreMatch(chunk, lessonId, lesson);
      if (!best || result.score > best.score ||
          (result.score === best.score && lesson.bookPage < refs[best.lessonId].bookPage)) {
        best = { ...result, lesson };
      }
    }
    if (!best || best.score === 0) return null;
    return {
      lessonId: best.lessonId,
      chapter: best.lesson.chapter,
      chapterInt: extractChapterInt(best.lesson.chapter),
      page: best.lesson.bookPage,
      sectionTitle: best.lesson.chapter,
      score: best.score,
      breakdown: best.breakdown,
      path: 'A',
    };
  }

  // Path C — topic-ID lookup (wiki frontmatter authoritative)
  const topicMap = opts.topicMap || loadTopicToVolume();
  const topic = topicMap.get(source);
  if (topic) {
    return {
      lessonId: source,
      chapter: `Vol.${topic.volume} — ${topic.sectionTitle}`,
      chapterInt: null,     // wiki concepts don't have a strict chapter int
      page: topic.page,
      sectionTitle: topic.sectionTitle,
      score: 1.0,
      breakdown: { topicLookup: 1.0 },
      path: 'C',
      volume: topic.volume,
    };
  }

  return null;
}

// ─────────────────────────────────────────────────
// CLI test mode (manual verification)
// ─────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('match-chunks-to-lessons.mjs — helper module. Not directly executable.');
  console.log('Use via: node scripts/backfill/rag-metadata-backfill-iter14.mjs --dry-run');
  process.exit(0);
}
