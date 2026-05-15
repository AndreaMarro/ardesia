#!/usr/bin/env node
/**
 * scripts/sprint-u/linguaggio-codemod.mjs
 *
 * Iter 61 B1 P0 PRIMARIO — Workstream B Andrea iter 21+ mandate carryover.
 * Andrea ratify Q-CODEMOD-1=a (PLURALE imperativo uniforme) + Q-CODEMOD-3=a (per-file Codex C-V).
 * Q-CODEMOD-2 teacher_messages DISMISSED iter 61 — OUT-OF-SCOPE.
 *
 * Transforms singolare/infinito imperativo verbs to PLURALE imperativo in
 * `phases[].teacher_tip` only. Preserves student speech inside `'...'` quotes.
 * Preserves Italian apostrophe elisions (L', dell', un', etc.).
 *
 * Modes (CLI):
 *   --scope-report                       Aggregate violation count
 *   --dry-run --file=<id>                Single file unified diff preview
 *   --dry-run --sample=<N>               N representative file diff
 *   --apply --file=<id>                  Apply single file, write back
 *   --apply --all                        Bulk apply 63 file (Phase 5 post-ratify)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const LESSON_PATHS_DIR = path.join(REPO_ROOT, 'src', 'data', 'lesson-paths');

// ============================================================================
// VERB_MAP — singolare/infinito imperativo → plurale imperativo (Q-CODEMOD-1=a)
// ============================================================================
export const VERB_MAP = Object.freeze({
  // Composite negation (must be sorted longest-first; placed for clarity)
  'Non dare': 'Non date',
  'Non correre': 'Non correte',
  // Enclitic pronouns (longer keys, sorted longest-first ensures priority)
  'Mostralo': 'Mostratelo',
  'Spiegalo': 'Spiegatelo',
  // Infinito → plurale (Q-CODEMOD-1=a uniforme mandate)
  'Mostrare': 'Mostrate',
  'Coprire': 'Coprite',
  'Usare': 'Usate',
  'Chiedere': 'Chiedete',
  'Spiegare': 'Spiegate',
  'Aiutare': 'Aiutate',
  'Lasciare': 'Lasciate',
  'Compilare': 'Compilate',
  'Fare': 'Fate',
  'Cercare': 'Cercate',
  // Imperativo singolare → plurale (single word)
  'Premi': 'Premete',
  'Fai': 'Fate',
  'Clicca': 'Cliccate',
  'Monta': 'Montate',
  'Collega': 'Collegate',
  'Prendi': 'Prendete',
  'Prova': 'Provate',
  'Inserisci': 'Inserite',
  'Apri': 'Aprite',
  'Chiudi': 'Chiudete',
  'Cerca': 'Cercate',
  'Vedi': 'Vedete',
  'Usa': 'Usate',
  'Chiedi': 'Chiedete',
  'Mostra': 'Mostrate',
  'Evidenzia': 'Evidenziate',
  'Lascia': 'Lasciate',
  'Spiega': 'Spiegate',
  'Dai': 'Date',
  'Anticipa': 'Anticipate',
  'Stimola': 'Stimolate',
  'Celebra': 'Celebrate',
  'Guida': 'Guidate',
  'Porta': 'Portate',
  'Inizia': 'Iniziate',
  'Aiuta': 'Aiutate',
  'Sottolinea': 'Sottolineate',
  'Rafforza': 'Rafforzate',
});

// ============================================================================
// FALSE_POSITIVE_PRECEDED_BY — guard regex (subordinating conjunctions / interrogatives)
// ============================================================================
const GUARD_WORDS = ['quando', 'se', 'dopo', 'prima', 'perché', 'mentre', 'finché', 'appena', 'come', 'dove', 'di', 'per', 'senza', 'chi', 'che', 'lui', 'lei'];
export const FALSE_POSITIVE_PRECEDED_BY = new RegExp(`\\b(${GUARD_WORDS.join('|')})\\s+$`, 'i');

// ============================================================================
// Internal helpers
// ============================================================================
const ELISION_MARKER = '';
const QUOTE_PLACEHOLDER_PREFIX = 'QUOTE';
const QUOTE_PLACEHOLDER_SUFFIX = '';

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Mask Italian apostrophe elisions (L'emozione → Lemozione)
 * so they don't confuse quote detection.
 */
function maskElisions(input) {
  return input.replace(/(\b\w+)'(?=[a-zàèéìòùA-ZÀÈÉÌÒÙ])/g, `$1${ELISION_MARKER}`);
}

function unmaskElisions(input) {
  return input.split(ELISION_MARKER).join("'");
}

/**
 * Mask single-quoted speech regions (student speech) so verb transform skips them.
 * Returns { masked, quotes } where masked uses placeholders.
 */
function maskQuotes(input) {
  const quotes = [];
  const masked = input.replace(/'[^']*'/g, (match) => {
    const idx = quotes.length;
    quotes.push(match);
    return `${QUOTE_PLACEHOLDER_PREFIX}${idx}${QUOTE_PLACEHOLDER_SUFFIX}`;
  });
  return { masked, quotes };
}

function unmaskQuotes(input, quotes) {
  return input.replace(/QUOTE(\d+)/g, (m, idx) => quotes[Number(idx)] || m);
}

/**
 * Preserve case of original match when applying replacement.
 * - ALL CAPS first word → preserve all-caps first plurale word
 * - TitleCase first word → preserve TitleCase
 * - lowercase → lowercase
 */
function preserveCase(match, plurale) {
  const matchWords = match.split(/\s+/);
  const pluraleWords = plurale.split(/\s+/);
  const result = pluraleWords.map((pw, idx) => {
    const mw = matchWords[idx] || '';
    if (mw && mw === mw.toUpperCase() && /[A-ZÀÈÉÌÒÙ]/.test(mw)) {
      return pw.toUpperCase();
    }
    if (mw && mw[0] && mw[0] === mw[0].toUpperCase()) {
      return pw.charAt(0).toUpperCase() + pw.slice(1).toLowerCase();
    }
    return pw.toLowerCase();
  });
  return result.join(' ');
}

/**
 * Build a regex pattern for a singolare verb, case-insensitive,
 * with negative lookbehind for false-positive guard words.
 */
function buildVerbPattern(singolare) {
  const guardAlt = GUARD_WORDS.join('|');
  // Allow optional intervening "non " between guard word and verb
  // (e.g. "finché non chiudi", "se non premi")
  return new RegExp(`(?<!\\b(?:${guardAlt})\\s+(?:non\\s+)?)\\b${escapeRegex(singolare)}\\b`, 'gi');
}

// ============================================================================
// transformText — core string transformer
// ============================================================================
export function transformText(input) {
  if (!input || typeof input !== 'string') return input;

  // 1. mask elisions
  let working = maskElisions(input);

  // 2. mask quoted speech regions
  const { masked, quotes } = maskQuotes(working);
  working = masked;

  // 3. apply verb map, longest keys first (composite, enclitic, infinito, singolare)
  const sortedKeys = Object.keys(VERB_MAP).sort((a, b) => b.length - a.length);

  for (const singolare of sortedKeys) {
    const plurale = VERB_MAP[singolare];
    const pattern = buildVerbPattern(singolare);
    working = working.replace(pattern, (match) => preserveCase(match, plurale));
  }

  // 4. restore quotes
  working = unmaskQuotes(working, quotes);

  // 5. restore elisions
  working = unmaskElisions(working);

  return working;
}

// ============================================================================
// transformTeacherTip — input/output with changes log
// ============================================================================
export function transformTeacherTip(input) {
  if (!input || typeof input !== 'string') {
    return { output: input || '', changes: [] };
  }
  const output = transformText(input);
  const changes = [];
  if (output !== input) {
    for (const [singolare, plurale] of Object.entries(VERB_MAP)) {
      const escS = escapeRegex(singolare);
      const beforePattern = new RegExp(`\\b${escS}\\b`, 'gi');
      const beforeCount = (input.match(beforePattern) || []).length;
      const afterCount = (output.match(beforePattern) || []).length;
      const delta = beforeCount - afterCount;
      if (delta > 0) {
        changes.push({ from: singolare, to: plurale, count: delta });
      }
    }
  }
  return { output, changes };
}

// ============================================================================
// transformLessonPath — JSON scope strict (phases[].teacher_tip ONLY)
// ============================================================================
export function transformLessonPath(json) {
  if (!json || typeof json !== 'object') {
    return { json, changesCount: 0, diff: [] };
  }
  const cloned = JSON.parse(JSON.stringify(json));
  let changesCount = 0;
  const diff = [];

  if (Array.isArray(cloned.phases)) {
    for (let i = 0; i < cloned.phases.length; i++) {
      const phase = cloned.phases[i];
      if (typeof phase.teacher_tip === 'string') {
        const result = transformTeacherTip(phase.teacher_tip);
        if (result.changes.length > 0) {
          diff.push({
            phase: i,
            phaseName: phase.name || `phase-${i}`,
            before: phase.teacher_tip,
            after: result.output,
            changes: result.changes,
          });
          phase.teacher_tip = result.output;
          changesCount += result.changes.reduce((sum, c) => sum + c.count, 0);
        }
      }
    }
  }

  return { json: cloned, changesCount, diff };
}

// ============================================================================
// applyCodemod — single file I/O
// ============================================================================
export function applyCodemod(filePath, { dryRun = true } = {}) {
  if (!fs.existsSync(filePath)) {
    return { ok: false, error: `File not found: ${filePath}` };
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    return { ok: false, error: `JSON parse failed: ${err.message}` };
  }
  const result = transformLessonPath(json);
  if (!dryRun && result.changesCount > 0) {
    const output = JSON.stringify(result.json, null, 2) + '\n';
    fs.writeFileSync(filePath, output, 'utf8');
  }
  return { ok: true, ...result, filePath };
}

// ============================================================================
// CLI dispatcher
// ============================================================================
function parseArgs(argv) {
  const args = { mode: null, file: null, sample: null, all: false };
  for (const a of argv) {
    if (a === '--scope-report') args.mode = 'scope-report';
    else if (a === '--dry-run') args.mode = args.mode || 'dry-run';
    else if (a === '--apply') args.mode = 'apply';
    else if (a === '--all') args.all = true;
    else if (a.startsWith('--file=')) args.file = a.slice('--file='.length);
    else if (a.startsWith('--sample=')) args.sample = Number(a.slice('--sample='.length));
  }
  return args;
}

function listLessonPaths() {
  return fs.readdirSync(LESSON_PATHS_DIR)
    .filter((f) => /^v[123]-.*\.json$/.test(f))
    .sort();
}

function unifiedDiff(before, after, label) {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const out = [`--- ${label} (before)`, `+++ ${label} (after)`];
  for (let i = 0; i < Math.max(beforeLines.length, afterLines.length); i++) {
    const b = beforeLines[i] || '';
    const a = afterLines[i] || '';
    if (b !== a) {
      out.push(`- ${b}`);
      out.push(`+ ${a}`);
    }
  }
  return out.join('\n');
}

async function cliMain() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.mode) {
    console.log('Usage:');
    console.log('  --scope-report                Aggregate violations report');
    console.log('  --dry-run --file=<id>         Single file diff preview');
    console.log('  --dry-run --sample=<N>        N representative file diffs');
    console.log('  --apply --file=<id>           Apply single file');
    console.log('  --apply --all                 Bulk apply (post-ratify ONLY)');
    process.exit(1);
  }

  if (args.mode === 'scope-report') {
    const files = listLessonPaths();
    const report = { totalFiles: files.length, affectedFiles: 0, totalViolations: 0, perFile: [] };
    for (const f of files) {
      const fp = path.join(LESSON_PATHS_DIR, f);
      const result = applyCodemod(fp, { dryRun: true });
      if (result.ok && result.changesCount > 0) {
        report.affectedFiles += 1;
        report.totalViolations += result.changesCount;
        report.perFile.push({ file: f, violations: result.changesCount });
      }
    }
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (args.mode === 'dry-run') {
    const targets = args.sample
      ? listLessonPaths().slice(0, args.sample)
      : args.file
      ? [`${args.file}.json`]
      : [];
    if (!targets.length) {
      console.error('--dry-run requires --file=<id> or --sample=<N>');
      process.exit(1);
    }
    for (const t of targets) {
      const fp = path.join(LESSON_PATHS_DIR, t);
      const result = applyCodemod(fp, { dryRun: true });
      if (!result.ok) {
        console.error(`SKIP ${t}: ${result.error}`);
        continue;
      }
      console.log(`\n=== ${t} (${result.changesCount} changes) ===`);
      for (const d of result.diff) {
        console.log(unifiedDiff(d.before, d.after, `phase ${d.phase} (${d.phaseName})`));
      }
    }
    return;
  }

  if (args.mode === 'apply') {
    const targets = args.all
      ? listLessonPaths()
      : args.file
      ? [`${args.file}.json`]
      : [];
    if (!targets.length) {
      console.error('--apply requires --file=<id> or --all');
      process.exit(1);
    }
    for (const t of targets) {
      const fp = path.join(LESSON_PATHS_DIR, t);
      const result = applyCodemod(fp, { dryRun: false });
      if (result.ok) {
        console.log(`APPLIED ${t}: ${result.changesCount} changes`);
      } else {
        console.error(`FAIL ${t}: ${result.error}`);
      }
    }
    return;
  }
}

// run CLI only when invoked directly (not when imported)
import { pathToFileURL } from 'node:url';
const isMain = (() => {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
})();
if (isMain) {
  cliMain().catch((err) => {
    console.error(err);
    process.exit(2);
  });
}
