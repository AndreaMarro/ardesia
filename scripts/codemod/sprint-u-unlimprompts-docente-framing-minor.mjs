#!/usr/bin/env node
/**
 * Sprint U Cycle 2 Fix #4 MINOR — docente-framing residue (5 pattern)
 *
 * Scope: src/data/experiments-vol{1,2,3}.js (unlimPrompt string content only)
 *
 * Background: Sprint U Cycle 1 fixed the main "Lo studente sta" pattern
 * (0 occurrences post-Cycle 1). Fix #4 MINOR addresses 5 residue patterns
 * still present (file-system verified Cycle 2 Fix #4 pre-execution):
 *
 *   vol1.js:3586  "Incoraggia lo studente a pensare ..."
 *   vol1.js:3794  "Incoraggia lo studente a ragionare ..."
 *   vol1.js:4023  "Sfida lo studente a pensare ..."
 *   vol1.js:5912  "Incoraggia lo studente a pensare ..."
 *   vol1.js:6561  "Complimentati con lo studente per essere arrivato ..."
 *
 * vol2.js / vol3.js: 0 occurrences pre-fix (verified).
 *
 * Replacement table (5 exact + generic article+studente fallback,
 * applied INSIDE unlimPrompt string content ONLY):
 *
 *   Incoraggia lo studente a       → Aiuta il docente a far ragionare i ragazzi su come
 *   Sfida lo studente a pensare    → Aiuta il docente a stimolare i ragazzi a pensare
 *   Sfida lo studente a            → Aiuta il docente a stimolare i ragazzi a (fallback)
 *   Complimentati con lo studente  → Complimentati con i ragazzi
 *   Chiedi allo studente           → Chiedete ai ragazzi
 *   Spiega allo studente           → Spiegate ai ragazzi
 *   Verifica con lo studente       → Verificate insieme alla classe
 *   Aiuta lo studente a            → Aiuta il docente a far capire ai ragazzi che
 *
 *   Generic preposition-aware fallbacks (last, lowest priority):
 *     allo studente                → ai ragazzi
 *     dello studente               → dei ragazzi
 *     degli studenti               → dei ragazzi
 *     agli studenti                → ai ragazzi
 *     gli studenti                 → i ragazzi
 *     lo studente                  → i ragazzi
 *
 * Edge case preservation:
 *   - "studente di seconda media" (descriptive age tag): regex requires
 *     `\b(lo|gli|allo|dello|degli|agli)\s+student[ei]\b` — bare "studente"
 *     without article (e.g. "studente di seconda media") DOES NOT MATCH.
 *   - "ai ragazzi" already-plurale → no-op (no source pattern).
 *   - "Il docente sta mostrando alla classe" preserved (no studente token).
 *
 * Surgical guarantee: only touches the STRING value of `unlimPrompt:` field
 * via per-line transformer. Non-unlimPrompt lines pass through unchanged.
 *
 * Usage:
 *   node scripts/codemod/sprint-u-unlimprompts-docente-framing-minor.mjs           # dry-run
 *   node scripts/codemod/sprint-u-unlimprompts-docente-framing-minor.mjs --apply   # write
 *   node scripts/codemod/sprint-u-unlimprompts-docente-framing-minor.mjs --verbose
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..', '..');
const TARGET_FILES = [
  join(ROOT, 'src', 'data', 'experiments-vol1.js'),
  join(ROOT, 'src', 'data', 'experiments-vol2.js'),
  join(ROOT, 'src', 'data', 'experiments-vol3.js'),
];

const APPLY = process.argv.includes('--apply');
const VERBOSE = process.argv.includes('--verbose');

/**
 * Ordered substitutions — longest/most-specific patterns FIRST so they win
 * before generic fallbacks ("lo studente" → "i ragazzi") consume their input.
 *
 * Each entry: [RegExp, replacement string, label].
 */
const SUBSTITUTIONS = [
  // ─── 5 task-mandated exact patterns + companion variants ───────────────
  [/\bIncoraggia lo studente a\b/g, 'Aiuta il docente a far ragionare i ragazzi su come', 'incoraggia-a'],
  [/\bincoraggia lo studente a\b/g, 'aiuta il docente a far ragionare i ragazzi su come', 'incoraggia-a-lower'],
  [/\bSfida lo studente a pensare\b/g, 'Aiuta il docente a stimolare i ragazzi a pensare', 'sfida-pensare'],
  [/\bsfida lo studente a pensare\b/g, 'aiuta il docente a stimolare i ragazzi a pensare', 'sfida-pensare-lower'],
  [/\bSfida lo studente a\b/g, 'Aiuta il docente a stimolare i ragazzi a', 'sfida-a-fallback'],
  [/\bsfida lo studente a\b/g, 'aiuta il docente a stimolare i ragazzi a', 'sfida-a-lower'],
  [/\bComplimentati con lo studente per essere arrivato\b/g, 'Complimentati con i ragazzi per essere arrivati', 'complimentati-arrivato'],
  [/\bcomplimentati con lo studente per essere arrivato\b/g, 'complimentati con i ragazzi per essere arrivati', 'complimentati-arrivato-lower'],
  [/\bComplimentati con lo studente\b/g, 'Complimentati con i ragazzi', 'complimentati'],
  [/\bcomplimentati con lo studente\b/g, 'complimentati con i ragazzi', 'complimentati-lower'],
  [/\bChiedi allo studente\b/g, 'Chiedete ai ragazzi', 'chiedi'],
  [/\bchiedi allo studente\b/g, 'chiedete ai ragazzi', 'chiedi-lower'],
  [/\bSpiega allo studente\b/g, 'Spiegate ai ragazzi', 'spiega'],
  [/\bspiega allo studente\b/g, 'spiegate ai ragazzi', 'spiega-lower'],
  [/\bVerifica con lo studente\b/g, 'Verificate insieme alla classe', 'verifica'],
  [/\bverifica con lo studente\b/g, 'verificate insieme alla classe', 'verifica-lower'],
  [/\bAiuta lo studente a\b/g, 'Aiuta il docente a far capire ai ragazzi che', 'aiuta-a'],
  [/\baiuta lo studente a\b/g, 'aiuta il docente a far capire ai ragazzi che', 'aiuta-a-lower'],
  // ─── Generic preposition-aware fallbacks (lowest priority) ─────────────
  [/\ballo studente\b/g, 'ai ragazzi', 'allo-studente-generic'],
  [/\bdello studente\b/g, 'dei ragazzi', 'dello-studente-generic'],
  [/\bdegli studenti\b/g, 'dei ragazzi', 'degli-studenti-generic'],
  [/\bagli studenti\b/g, 'ai ragazzi', 'agli-studenti-generic'],
  [/\bgli studenti\b/g, 'i ragazzi', 'gli-studenti-generic'],
  [/\blo studente\b/g, 'i ragazzi', 'lo-studente-generic'],
];

/**
 * Transform a single line. Only mutates if line contains `unlimPrompt:`
 * AND at least one substitution applies inside its string content.
 */
function transformLine(line) {
  if (!/unlimPrompt:\s*"/.test(line)) {
    return { line, hits: 0, applied: [] };
  }
  let out = line;
  let hits = 0;
  const applied = [];
  for (const [pattern, replacement, label] of SUBSTITUTIONS) {
    const matches = out.match(pattern);
    if (matches && matches.length > 0) {
      hits += matches.length;
      applied.push({ label, pattern: pattern.toString(), replacement, count: matches.length });
      out = out.replace(pattern, replacement);
    }
  }
  return { line: out, hits, applied };
}

async function processFile(filepath) {
  const text = await readFile(filepath, 'utf8');
  const lines = text.split('\n');
  let totalHits = 0;
  let touchedLines = 0;
  const changeLog = [];
  const newLines = lines.map((line, idx) => {
    const { line: newLine, hits, applied } = transformLine(line);
    if (hits > 0) {
      touchedLines += 1;
      totalHits += hits;
      changeLog.push({ lineNumber: idx + 1, hits, applied });
      if (VERBOSE) {
        console.log(`  L${idx + 1}: ${hits} substitution(s)`);
        for (const a of applied) {
          console.log(`    [${a.label}] ${a.pattern} → ${JSON.stringify(a.replacement)} ×${a.count}`);
        }
      }
    }
    return newLine;
  });
  const newText = newLines.join('\n');
  if (totalHits > 0 && APPLY) {
    await writeFile(filepath, newText, 'utf8');
  }
  return { filepath, totalHits, touchedLines, changeLog, written: APPLY && totalHits > 0 };
}

async function main() {
  console.log(`# Sprint U Cycle 2 Fix #4 MINOR — unlimPrompts docente-framing residue codemod`);
  console.log(`Mode: ${APPLY ? 'APPLY (write to disk)' : 'DRY-RUN (preview)'}`);
  console.log(`Target files: ${TARGET_FILES.length}`);
  console.log('');
  let grandTotal = 0;
  let grandTouched = 0;
  for (const filepath of TARGET_FILES) {
    const rel = filepath.replace(ROOT + '/', '');
    console.log(`## ${rel}`);
    const result = await processFile(filepath);
    console.log(`  lines touched: ${result.touchedLines}`);
    console.log(`  total substitutions: ${result.totalHits}`);
    console.log(`  written: ${result.written}`);
    grandTotal += result.totalHits;
    grandTouched += result.touchedLines;
  }
  console.log('');
  console.log(`# Summary`);
  console.log(`  files processed: ${TARGET_FILES.length}`);
  console.log(`  lines touched: ${grandTouched}`);
  console.log(`  total substitutions: ${grandTotal}`);
  if (!APPLY) {
    console.log('');
    console.log('Re-run with --apply to write changes.');
  }
}

main().catch((err) => {
  console.error('Codemod failed:', err);
  process.exit(1);
});
