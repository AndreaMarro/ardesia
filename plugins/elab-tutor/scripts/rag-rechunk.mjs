#!/usr/bin/env node
/**
 * RAG re-chunker — ELAB Tutor volumi
 *
 * Strategy:
 *   - Input: /tmp/vol1.txt, /tmp/vol2.txt, /tmp/vol3.txt (pdftotext -layout output)
 *   - Sliding window 320 chars with 80 char overlap (fine granularity)
 *   - Section-aware: detect "Capitolo N" headers, preserve chapter boundaries
 *   - Classify chunk type: theory | procedure | example | warning | glossary
 *   - Preserve non-volume chunks from v1 (glossary, faq, errori, analogie, codice)
 *   - Output: src/data/rag-chunks-v2.json (drop-in backward-compatible schema)
 *
 * Run: node scripts/rag-rechunk.mjs
 *
 * (c) ELAB Tutor — 2026-04-23
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// Dual-pass chunking for higher retrieval recall:
//   Fine pass:   200-char window, 50 overlap → precision (answer lookup)
//   Coarse pass: 640-char window, 120 overlap → context (section summary)
const FINE_WIN = 200;
const FINE_OVERLAP = 50;
const COARSE_WIN = 640;
const COARSE_OVERLAP = 120;
const MIN_CHUNK_LEN = 60;

const VOLUMES = [
  { num: 1, path: '/tmp/vol1.txt', prefix: 'v1' },
  { num: 2, path: '/tmp/vol2.txt', prefix: 'v2' },
  { num: 3, path: '/tmp/vol3.txt', prefix: 'v3' },
];

/**
 * Normalize per-line (no regex on huge strings).
 */
function normalizeByLine(raw) {
  const out = [];
  const lines = raw.split('\n');
  for (let line of lines) {
    // Remove form feed
    line = line.replace(/\f/g, '');
    // Collapse multiple spaces/tabs → single space
    let prev;
    do {
      prev = line;
      line = line.split('\t').join(' ').split('  ').join(' ');
    } while (line !== prev && line.length < 10000);
    line = line.trim();
    out.push(line);
  }
  // Collapse triple-blank
  const result = [];
  let blanks = 0;
  for (const l of out) {
    if (!l) {
      blanks++;
      if (blanks <= 2) result.push(l);
    } else {
      blanks = 0;
      result.push(l);
    }
  }
  return result.join('\n').trim();
}

/**
 * Classify chunk by content signals.
 */
function classifyChunk(text) {
  const lower = text.toLowerCase();
  if (text.includes('ATTENZIONE') || lower.includes('pericolo') || lower.includes('shock')) return 'warning';
  if (text.includes('void setup') || text.includes('digitalWrite') || text.includes('pinMode') || text.includes('```')) return 'example';
  if (/^\s*\d+[\.)]\s/.test(text) || lower.includes('step ') || lower.includes('passo ') || lower.includes('procedura')) return 'procedure';
  if (lower.includes('si chiama') || lower.includes('definito come') || lower.includes('glossario')) return 'glossary';
  return 'theory';
}

function detectChapter(text, lastChapter) {
  const m = text.match(/Capitolo\s+(\d{1,2})/i);
  if (m) return parseInt(m[1], 10);
  return lastChapter;
}

function detectPage(text) {
  const m = text.match(/pag\.?\s+(\d{1,3})/i) || text.match(/pagina\s+(\d{1,3})/i);
  return m ? parseInt(m[1], 10) : undefined;
}

function countWords(text) {
  // Safe counter without regex.split
  let count = 0;
  let inWord = false;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    const isSpace = c === 32 || c === 9 || c === 10 || c === 13;
    if (!isSpace && !inWord) count++;
    inWord = !isSpace;
  }
  return count;
}

function chunkTextSinglePass(text, prefix, volNum, win, overlap, granularity) {
  const chunks = [];
  let lastChapter;
  let pos = 0;

  while (pos < text.length) {
    const end = Math.min(pos + win, text.length);
    const raw = text.slice(pos, end).trim();

    if (raw.length >= MIN_CHUNK_LEN) {
      const chapter = detectChapter(raw, lastChapter);
      if (chapter) lastChapter = chapter;
      const page = detectPage(raw);
      const type = classifyChunk(raw);
      chunks.push({
        id: `${prefix}-${granularity}-${chunks.length + 1}`,
        text: raw,
        volume: volNum,
        chapter: chapter || lastChapter,
        page,
        type,
        granularity,
        wordCount: countWords(raw),
        source: 'volume-pdf-v2',
      });
    }

    const step = win - overlap;
    pos += step;
    if (step <= 0) break;
  }

  return chunks;
}

function chunkText(text, prefix, volNum) {
  const fine = chunkTextSinglePass(text, prefix, volNum, FINE_WIN, FINE_OVERLAP, 'fine');
  const coarse = chunkTextSinglePass(text, prefix, volNum, COARSE_WIN, COARSE_OVERLAP, 'coarse');
  return [...fine, ...coarse];
}

// ═══════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════

const volumeChunks = [];
for (const v of VOLUMES) {
  if (!existsSync(v.path)) {
    console.error(`[rechunk] missing ${v.path}, skip`);
    continue;
  }
  const raw = readFileSync(v.path, 'utf8');
  console.log(`[rechunk] vol${v.num}: ${raw.length} raw chars`);
  const normalized = normalizeByLine(raw);
  console.log(`[rechunk] vol${v.num}: ${normalized.length} normalized chars`);
  const vc = chunkText(normalized, v.prefix, v.num);
  console.log(`[rechunk] vol${v.num}: ${vc.length} chunks`);
  volumeChunks.push(...vc);
}

// Preserve non-volume chunks from v1
const v1 = JSON.parse(readFileSync('src/data/rag-chunks.json', 'utf8'));
const nonVolumeV1 = v1.filter(c => c.source !== 'volume-pdf' && c.source !== 'volume-pdf-v2');
console.log(`[rechunk] preserving ${nonVolumeV1.length} non-volume chunks`);

const combined = [...volumeChunks, ...nonVolumeV1];
console.log(`[rechunk] TOTAL: ${combined.length} chunks (v1 was ${v1.length})`);

// Stats
const byType = {};
const byVolume = {};
for (const c of combined) {
  byType[c.type || c.source || 'none'] = (byType[c.type || c.source || 'none'] || 0) + 1;
  byVolume[c.volume || 'none'] = (byVolume[c.volume || 'none'] || 0) + 1;
}
console.log('\n[rechunk] breakdown by type:');
Object.entries(byType).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log('\n[rechunk] breakdown by volume:');
Object.entries(byVolume).forEach(([k, v]) => console.log(`  vol${k}: ${v}`));

writeFileSync('src/data/rag-chunks-v2.json', JSON.stringify(combined, null, 2));
const size = readFileSync('src/data/rag-chunks-v2.json').length;
console.log(`\n[rechunk] wrote src/data/rag-chunks-v2.json (${(size / 1024).toFixed(1)} KB)`);
