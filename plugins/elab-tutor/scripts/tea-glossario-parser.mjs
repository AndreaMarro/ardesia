#!/usr/bin/env node
/**
 * Tea Glossario Parser — iter 22
 *
 * Parse 3 PDF-extracted text files (Vol1+2+3) into structured JSON.
 * Expected: Vol1=66, Vol2=59, Vol3=55, total=180 termini.
 *
 * Algorithm (caveman robust):
 *   1. Strip noise lines: "■", single-char unit symbols (V, A, Ω, mA), digit-only lines.
 *   2. Find anchors: every "SPIEGAZIONE TECNICA" line marks a term.
 *   3. Term name = nearest non-noise non-empty line above the anchor (skipping blanks).
 *      Special-case: orphan name lines without immediate SPIEGAZIONE TECNICA below
 *      are attached to the next anchor (collapsing PDF wrap noise).
 *   4. Technical text = lines after "SPIEGAZIONE TECNICA" until "PER BAMBINI".
 *   5. Kids text = lines after "PER BAMBINI" until next anchor or "Capitolo".
 *   6. Chapter assignment via running "Capitolo N · Title" tracker (handles wrapped titles).
 *
 * Usage:
 *   node scripts/tea-glossario-parser.mjs
 * Output: automa/state/tea-glossario-180.json
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const VOLUME3_ROOT = join(PROJECT_ROOT, '..', '..');
const STATE_DIR = join(VOLUME3_ROOT, 'automa', 'state');

const SOURCES = [
  { vol: 1, file: '/tmp/tea-vol1.txt', expected: 66, expectedCaps: 14 },
  { vol: 2, file: '/tmp/tea-vol2.txt', expected: 59, expectedCaps: 12 },
  { vol: 3, file: '/tmp/tea-vol3.txt', expected: 55, expectedCaps: 12 },
];

const NOISE_RE = /^(■|[VAΩ]|mA|[0-9]+|—.*—)$/;
const CAP_RE = /^Capitolo\s+(\d+)\s*·\s*(.*)$/;

function cleanLines(raw) {
  // Keep all lines (we need positional info), strip CR + leading PDF page-break (\f).
  return raw.split('\n').map((l) => l.replace(/\r$/, '').replace(/^\f+/, ''));
}

function isNoise(line) {
  const t = line.trim();
  if (!t) return true;
  if (NOISE_RE.test(t)) return true;
  return false;
}

function parseVolume({ vol, file, expected, expectedCaps }) {
  const raw = readFileSync(file, 'utf8');
  const lines = cleanLines(raw);

  // Locate anchors (SPIEGAZIONE TECNICA exact match).
  const anchors = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'SPIEGAZIONE TECNICA') anchors.push(i);
  }

  // Build chapter map: line idx -> {cap, capTitle}.
  const chapters = []; // {startLine, cap, title}
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(CAP_RE);
    if (m) {
      let title = m[2].trim();
      // Handle wrapped titles (next non-empty line continues if not blank+desc pattern).
      // Heuristic: PDF titles never wrap mid-sentence onto an empty line. The
      // "Capitolo N · I pin analogici: Arduino impara a sentire le" case has
      // wrap to next line "quantità". We append next line if it ends mid-word.
      if (/[^.?!:]\s*$/.test(title) && !title.endsWith('?')) {
        // Look at next non-empty line; if it doesn't start with capital "Capitolo" or
        // a long descriptive sentence, append it.
        let j = i + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        if (j < lines.length) {
          const next = lines[j].trim();
          // Append only if it's short (< 40 chars) and doesn't start with uppercase sentence.
          if (next.length < 40 && !/[.?!]/.test(next) && !/^Cap/.test(next)) {
            title = `${title} ${next}`.trim();
          }
        }
      }
      chapters.push({ startLine: i, cap: parseInt(m[1], 10), title });
    }
  }

  function chapterFor(lineIdx) {
    let last = chapters[0] || { cap: 0, title: '' };
    for (const c of chapters) {
      if (c.startLine <= lineIdx) last = c;
      else break;
    }
    return last;
  }

  const terms = [];
  for (let a = 0; a < anchors.length; a++) {
    const anchorLine = anchors[a];
    const nextAnchor = a + 1 < anchors.length ? anchors[a + 1] : lines.length;

    // Find term name: walk backward from anchorLine - 1 over non-noise lines,
    // stopping at a "Capitolo" header or another "PER BAMBINI" / blank-blank.
    let nameLines = [];
    for (let i = anchorLine - 1; i >= 0; i--) {
      const t = lines[i].trim();
      if (!t) {
        if (nameLines.length) break;
        continue;
      }
      if (isNoise(lines[i])) continue;
      if (CAP_RE.test(t)) break;
      if (t === 'PER BAMBINI' || t === 'SPIEGAZIONE TECNICA') break;
      // Found candidate name line.
      nameLines.unshift(t);
      // Most term names are 1 line. Stop after collecting first non-noise.
      // But keep collecting if previous line is also short non-noise (rare wrap).
      const prevIdx = i - 1;
      if (prevIdx < 0) break;
      const prev = lines[prevIdx].trim();
      if (!prev || isNoise(lines[prevIdx]) || prev === 'PER BAMBINI' || prev === 'SPIEGAZIONE TECNICA' || CAP_RE.test(prev)) break;
      // Continue only if previous line looks like a continuation (starts lowercase or is short).
      if (prev.length > 30 && /^[A-Z]/.test(prev) && !/^[A-Z][a-z]+ [a-z]/.test(prev)) break;
      // Otherwise let the loop pick it up next iteration.
    }
    let name = nameLines.join(' ').trim();
    if (!name) name = `[UNKNOWN-${vol}-${a}]`;

    // Extract technical (between anchor and PER BAMBINI).
    let perBambiniLine = -1;
    for (let i = anchorLine + 1; i < nextAnchor; i++) {
      if (lines[i].trim() === 'PER BAMBINI') {
        perBambiniLine = i;
        break;
      }
    }

    let technical = '';
    let kids = '';
    if (perBambiniLine === -1) {
      // No PER BAMBINI — collect all until nextAnchor as technical.
      technical = lines.slice(anchorLine + 1, nextAnchor).join(' ');
    } else {
      technical = lines.slice(anchorLine + 1, perBambiniLine).join(' ');
      // Kids text until next anchor OR until a Capitolo header in between.
      let kidsEnd = nextAnchor;
      // If next term name is between perBambiniLine and nextAnchor, stop earlier.
      // We approximate: find next Capitolo header OR a non-noise line that's
      // followed within 5 lines by SPIEGAZIONE TECNICA — that's the next term name.
      for (let i = perBambiniLine + 1; i < nextAnchor; i++) {
        if (CAP_RE.test(lines[i].trim())) {
          kidsEnd = i;
          break;
        }
      }
      // Cut term name of next anchor from kids tail: walk back from nextAnchor
      // collecting non-noise lines as that term's name.
      if (a + 1 < anchors.length) {
        for (let i = nextAnchor - 1; i > perBambiniLine; i--) {
          const t = lines[i].trim();
          if (!t) continue;
          if (isNoise(lines[i])) continue;
          if (CAP_RE.test(t)) break;
          // This line is the next term's name candidate. Trim kids to here.
          kidsEnd = Math.min(kidsEnd, i);
          // Walk back further while still non-noise non-empty (multi-line names).
          let j = i - 1;
          while (j > perBambiniLine) {
            const tj = lines[j].trim();
            if (!tj || isNoise(lines[j])) break;
            if (CAP_RE.test(tj)) break;
            kidsEnd = Math.min(kidsEnd, j);
            j--;
          }
          break;
        }
      }
      kids = lines.slice(perBambiniLine + 1, kidsEnd).join(' ');
    }

    // Strip embedded noise tokens (■, lone unit symbols, lone digits) within text.
    const stripNoise = (s) =>
      s
        .split(/\s+/)
        .filter((w) => !/^(■|[VAΩ]|mA|[0-9]+)$/.test(w))
        .join(' ')
        .trim();
    technical = stripNoise(technical.replace(/\s+/g, ' '));
    kids = stripNoise(kids.replace(/\s+/g, ' '));

    const ch = chapterFor(anchorLine);
    terms.push({
      vol,
      cap: ch.cap,
      cap_title: ch.title,
      term: name,
      technical,
      kids_explanation: kids,
      source_file: file.split('/').pop(),
    });
  }

  return { vol, terms, chapters, expected, expectedCaps };
}

/**
 * Post-fix: detect pathological "two-name above one anchor" pattern.
 * If term[i] has empty kids AND term[i+1].term is suspiciously long (> 80 chars),
 * it likely caught the kids text of term[i] as its name. Reassign:
 *   - term[i+1].name = term[i].name (since the actual name was at deeper position)
 *   - term[i].name = the orphan line we discarded (we stored it as term[i].term)
 * In practice for the verified Vol3 Cap1 case:
 *   parsed: [Programmazione][Linguaggio di programmazione (kids="")][LONG kids string as term]
 *   target: [Programmazione][Linguaggio macchina][Linguaggio di programmazione]
 * Since reconstructing the orphan name is complex, we apply a known-fix table.
 */
function applyKnownFixes(terms) {
  // Vol3 Cap1 PDF wrap: parser assigned wrong names to the
  // "Linguaggio macchina" / "Linguaggio di programmazione" pair.
  // Fix by relabeling the two consecutive entries.
  for (let i = 0; i < terms.length - 1; i++) {
    const a = terms[i];
    const b = terms[i + 1];
    if (
      a.vol === 3 &&
      a.cap === 1 &&
      a.term === 'Linguaggio di programmazione' &&
      b.term.startsWith("È il modo più 'primitivo'")
    ) {
      a.term = 'Linguaggio macchina';
      // The "È il modo..." text was the kids explanation for Linguaggio macchina
      // but parser misassigned it as the next term's name. Rescue it.
      a.kids_explanation = b.term;
      b.term = 'Linguaggio di programmazione';
    }
  }
  // Trim trailing term-name leakage in kids_explanation (when parser walkback
  // consumed too much of the next term's name area). Strip trailing standalone
  // noise tokens or all-caps style leakage.
  for (const t of terms) {
    // Drop trailing "Linguaggio macchina" tail in Vol3 Programmazione case.
    t.kids_explanation = t.kids_explanation
      .replace(/\s+Linguaggio macchina\s*$/u, '')
      .trim();
  }
}

function main() {
  const all = [];
  const summary = [];
  for (const src of SOURCES) {
    const { vol, terms, chapters, expected, expectedCaps } = parseVolume(src);
    applyKnownFixes(terms);
    summary.push({
      vol,
      parsed_terms: terms.length,
      expected_terms: expected,
      parsed_caps: chapters.length,
      expected_caps: expectedCaps,
      diff_terms: terms.length - expected,
      diff_caps: chapters.length - expectedCaps,
    });
    all.push(...terms);
  }

  mkdirSync(STATE_DIR, { recursive: true });
  const outPath = join(STATE_DIR, 'tea-glossario-180.json');
  writeFileSync(outPath, JSON.stringify(all, null, 2), 'utf8');

  console.log('=== TEA GLOSSARIO PARSE SUMMARY ===');
  console.table(summary);
  console.log(`Total terms parsed: ${all.length} / 180`);
  console.log(`Output: ${outPath}`);

  // Sample 3 terms cross-volume.
  const sample = [
    all.find((t) => t.vol === 1 && /^LED$/i.test(t.term)) || all.find((t) => t.vol === 1 && /LED/i.test(t.term)),
    all.find((t) => t.vol === 2 && /LED/i.test(t.term)),
    all.find((t) => t.vol === 3 && /(algoritmo|programmazione|loop|setup)/i.test(t.term)),
  ].filter(Boolean);
  console.log('\n=== SAMPLE 3 TERMINI ===');
  for (const s of sample) {
    console.log(`\nVol${s.vol} Cap${s.cap} — ${s.term}`);
    console.log(`  TECH: ${s.technical.slice(0, 120)}...`);
    console.log(`  KIDS: ${s.kids_explanation.slice(0, 120)}...`);
  }
}

main();
