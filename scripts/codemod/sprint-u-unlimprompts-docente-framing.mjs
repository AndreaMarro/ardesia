#!/usr/bin/env node
/**
 * Sprint U Cycle 2 Fix #4 — codemod unlimPrompts docente-framing
 *
 * Scope: src/data/experiments-vol1.js + experiments-vol2.js + experiments-vol3.js
 *
 * Target: only string content of `unlimPrompt:` fields. Replaces residual
 * "lo studente / allo studente / dello studente / gli studenti / agli studenti /
 *  degli studenti" framing inside the prompt body with docente+classe framing.
 *
 * Background: Sprint U Cycle 1 audit
 *   docs/audits/sprint-u-cycle1-iter1-CONSOLIDATED-audit.md §4 reports 94/94
 *   unlimPrompts use "studente" framing. File-system reality post iter 32+36+37
 *   work: 89/94 already migrated to "Il docente sta mostrando alla classe ...".
 *   Only 5 prompts retain in-body singular-studente residue:
 *     vol1.js:3586  "Incoraggia lo studente a pensare ..."
 *     vol1.js:3794  "Incoraggia lo studente a ragionare ..."
 *     vol1.js:4023  "Sfida lo studente a pensare ..."
 *     vol1.js:5912  "Incoraggia lo studente a pensare ..."
 *     vol1.js:6561  "Complimentati con lo studente per essere arrivato ..."
 *   This codemod fixes those 5 + provides a safety net for any future drift.
 *
 * Replacement table (case-sensitive, applied INSIDE unlimPrompt strings ONLY):
 *   Incoraggia lo studente a    → Aiuta il docente a far ragionare i ragazzi su come
 *   incoraggia lo studente a    → aiuta il docente a far ragionare i ragazzi su come
 *   Sfida lo studente a         → Aiuta il docente a stimolare i ragazzi a
 *   sfida lo studente a         → aiuta il docente a stimolare i ragazzi a
 *   Complimentati con lo studente per essere arrivato → Complimentati con i ragazzi per essere arrivati
 *   complimentati con lo studente per essere arrivato → complimentati con i ragazzi per essere arrivati
 *   spiega allo studente        → spiega ai ragazzi
 *   Spiega allo studente        → Spiega ai ragazzi
 *   chiedi allo studente        → chiedi ai ragazzi
 *   Chiedi allo studente        → Chiedi ai ragazzi
 *   verifica con lo studente    → verifica insieme alla classe
 *   Verifica con lo studente    → Verifica insieme alla classe
 *   aiuta lo studente a         → aiuta il docente a far capire ai ragazzi che
 *   Aiuta lo studente a         → Aiuta il docente a far capire ai ragazzi che
 *   dello studente              → dei ragazzi
 *   agli studenti               → ai ragazzi
 *   degli studenti              → dei ragazzi
 *   gli studenti                → i ragazzi
 *   lo studente                 → i ragazzi
 *   allo studente               → ai ragazzi
 *
 * Edge cases preserved (descriptive references, NOT pedagogical framing):
 *   - "ai ragazzi" (already plurale OK, no-op)
 *   - "Il docente sta mostrando alla classe" (already docente framing, no-op)
 *   - "studente di seconda media" (descriptive age tag, preserved — pattern
 *     uses word-boundary + article requirement, so no match)
 *
 * Surgical guarantee: only touches the STRING value of `unlimPrompt:` field
 * via a per-line transformer. Non-unlimPrompt lines are passed through unchanged.
 *
 * Usage:
 *   node scripts/codemod/sprint-u-unlimprompts-docente-framing.mjs          # dry-run
 *   node scripts/codemod/sprint-u-unlimprompts-docente-framing.mjs --apply  # write
 *   node scripts/codemod/sprint-u-unlimprompts-docente-framing.mjs --verbose
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
 * Ordered substitutions. Longest/most-specific patterns FIRST so they win
 * before generic fallbacks ("lo studente" → "i ragazzi") consume their input.
 */
const SUBSTITUTIONS = [
  // composite imperatives (most specific)
  [/\bIncoraggia lo studente a\b/g, 'Aiuta il docente a far ragionare i ragazzi su come'],
  [/\bincoraggia lo studente a\b/g, 'aiuta il docente a far ragionare i ragazzi su come'],
  [/\bSfida lo studente a\b/g, 'Aiuta il docente a stimolare i ragazzi a'],
  [/\bsfida lo studente a\b/g, 'aiuta il docente a stimolare i ragazzi a'],
  [/\bComplimentati con lo studente per essere arrivato\b/g, 'Complimentati con i ragazzi per essere arrivati'],
  [/\bcomplimentati con lo studente per essere arrivato\b/g, 'complimentati con i ragazzi per essere arrivati'],
  [/\bComplimentati con lo studente\b/g, 'Complimentati con i ragazzi'],
  [/\bcomplimentati con lo studente\b/g, 'complimentati con i ragazzi'],
  [/\bSpiega allo studente\b/g, 'Spiega ai ragazzi'],
  [/\bspiega allo studente\b/g, 'spiega ai ragazzi'],
  [/\bChiedi allo studente\b/g, 'Chiedi ai ragazzi'],
  [/\bchiedi allo studente\b/g, 'chiedi ai ragazzi'],
  [/\bVerifica con lo studente\b/g, 'Verifica insieme alla classe'],
  [/\bverifica con lo studente\b/g, 'verifica insieme alla classe'],
  [/\bAiuta lo studente a\b/g, 'Aiuta il docente a far capire ai ragazzi che'],
  [/\baiuta lo studente a\b/g, 'aiuta il docente a far capire ai ragazzi che'],
  // generic article+studente fallbacks (least specific, last)
  [/\bdello studente\b/g, 'dei ragazzi'],
  [/\bdegli studenti\b/g, 'dei ragazzi'],
  [/\bagli studenti\b/g, 'ai ragazzi'],
  [/\bgli studenti\b/g, 'i ragazzi'],
  [/\ballo studente\b/g, 'ai ragazzi'],
  [/\blo studente\b/g, 'i ragazzi'],
];

/**
 * Transform a single line. Only mutates the line if it contains `unlimPrompt:`
 * and at least one substitution applies inside its string content.
 * Returns { line, hits: number, applied: Array<{pattern, replacement}> }.
 */
function transformLine(line) {
  if (!/unlimPrompt:\s*"/.test(line)) {
    return { line, hits: 0, applied: [] };
  }
  let out = line;
  let hits = 0;
  const applied = [];
  for (const [pattern, replacement] of SUBSTITUTIONS) {
    const matches = out.match(pattern);
    if (matches && matches.length > 0) {
      hits += matches.length;
      applied.push({ pattern: pattern.toString(), replacement, count: matches.length });
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
          console.log(`    ${a.pattern} → ${JSON.stringify(a.replacement)} ×${a.count}`);
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
  console.log(`# Sprint U Cycle 2 Fix #4 — unlimPrompts docente-framing codemod`);
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
