#!/usr/bin/env node
/**
 * Sprint U Cycle 2 Fix #2 — codemod singolare → plurale
 *
 * Scope: src/data/lesson-paths/**\/*.json
 *
 * Targeted fields (teacher-facing strings only — NO vocabulary lists, NO ids):
 *   - teacher_message
 *   - teacher_tip
 *   - observation_prompt
 *   - summary_for_class
 *   - components_list
 *   - class_hook
 *   - provocative_question
 *   - resume_message
 *   - next_preview
 *   - phases[].common_mistakes[].teacher_response
 *   - phases[].common_mistakes[].mistake
 *   - phases[].build_circuit.description
 *   - phases[].build_circuit.button_label
 *   - next_experiment.preview
 *
 * Regex strategy: only transform singolare imperatives at SENTENCE BOUNDARY
 * (start-of-string, after `.`, `!`, `?`, `:`, `;` or newline + whitespace).
 * This avoids false positives like "il filo collega X a Y" (3rd-person verb).
 *
 * Mappings:
 *   Premi   → Premete
 *   Fai     → Fate
 *   Clicca  → Cliccate
 *   Monta   → Montate
 *   Collega → Collegate
 *   Inserisci → Inserite
 *   Guarda  → Guardate
 *   Osserva → Osservate
 *   Controlla → Controllate
 *   Verifica → Verificate
 *   Prova   → Provate
 *
 * + bare forms ("noti la differenza", "regola la manopola") handled if at boundary
 * + lowercase variants ("e premi", "e fai") handled separately
 *
 * Usage:
 *   node scripts/codemod/sprint-u-lessonpaths-plurale.mjs            # dry-run (default)
 *   node scripts/codemod/sprint-u-lessonpaths-plurale.mjs --apply    # write
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..', '..');
const LESSON_PATHS_DIR = join(ROOT, '..', '..', 'packs', 'elab-tutor', 'data', 'lesson-paths');

const APPLY = process.argv.includes('--apply');
const VERBOSE = process.argv.includes('--verbose');

// Fields to transform (teacher-facing strings only).
// Vocabulary / ids / analogies.text excluded — analogies use 3rd-person narrative
// where "e guarda/cambia/...". patterns are NOT imperatives.
const TARGET_FIELDS = new Set([
  'teacher_message',
  'teacher_tip',
  'observation_prompt',
  'summary_for_class',
  'components_list',
  'class_hook',
  'provocative_question',
  'resume_message',
  'next_preview',
  'description',
  'button_label',
  'teacher_response',
  'mistake',
  'preview',
]);

// Imperative mappings: singolare → plurale
// FULL set used for sentence-start boundary (^|.!?:; + space + Capitalized).
// All entries here are unambiguous teacher-imperatives in this corpus
// (verified case-by-case via dry-run preview).
const IMPERATIVE_MAP = {
  Premi: 'Premete',
  Fai: 'Fate',
  Clicca: 'Cliccate',
  Monta: 'Montate',
  Collega: 'Collegate',
  Inserisci: 'Inserite',
  Guarda: 'Guardate',
  Osserva: 'Osservate',
  Controlla: 'Controllate',
  Verifica: 'Verificate',
  Prova: 'Provate',
  Regola: 'Regolate',
  Mostra: 'Mostrate',
  Disegna: 'Disegnate',
  Aggiungi: 'Aggiungete',
  Avvicina: 'Avvicinate',
  Tocca: 'Toccate',
  Muovi: 'Muovete',
  Carica: 'Caricate',
  Compila: 'Compilate',
  Esegui: 'Eseguite',
  Misura: 'Misurate',
  Apri: 'Aprite',
  Chiudi: 'Chiudete',
  Accendi: 'Accendete',
  Spegni: 'Spegnete',
  Gira: 'Girate',
};

// SAFE-low list: only verbs unambiguously imperative when found after
// coordinating conjunction "e/poi/ma/...". These are domain-specific
// hardware/observation commands; 3rd-person usage of them is rare in this corpus.
// Excluded ambiguous: cambia/aumenta/diminuisci/tocca/muovi/aggiungi/rimuovi/
// apri/chiudi/accendi/spegni/gira/ascolta/leggi/scrivi/conta/misura/calcola/
// costruisci/carica/compila/esegui/mostra/disegna/regola — risk 3rd-person FP.
const SAFE_LOW_KEYS = ['premi', 'fai', 'clicca', 'monta', 'collega', 'inserisci', 'guarda', 'osserva', 'controlla', 'verifica', 'prova'];

// Build regex: match (sentence_boundary)(imperative_word)(\b)
// Boundary: ^ | [.!?:;\n] + \s*
// We use a callback to preserve original boundary chars.
const IMPERATIVE_KEYS = Object.keys(IMPERATIVE_MAP);

function buildRegex(keys, safeLowKeys) {
  // Capitalized form at sentence boundary (full imperative list)
  const capPattern = keys.map((k) => k).join('|');
  // Lowercase after coordinating conjunctions — SAFE subset only
  const lowPattern = safeLowKeys.join('|');

  return {
    // Boundary: ^ OR [.!?:;] optionally followed by closing quote/apostrophe, then \s+
    // OR em-dash + \s+
    // This catches "...detto.' Disegna" + "...?\" Premi" + "...!) Fai"
    capBoundary: new RegExp(
      `(^|[.!?:;][\"'\\)]?\\s+|—\\s+)(${capPattern})\\b`,
      'g',
    ),
    // lowercase after "e/poi/ma/..." — SAFE subset only
    lowConj: new RegExp(`(\\b(?:e|poi|ma|oppure|quindi|allora)\\s+)(${lowPattern})\\b`, 'g'),
    // "Se " + lowercase verb (conditional clause)
    seCond: new RegExp(`(\\bSe\\s+)(${lowPattern})\\b`, 'g'),
  };
}

const REGEXES = buildRegex(IMPERATIVE_KEYS, SAFE_LOW_KEYS);

// Helper: build "capital" form lookup for lowercase verb
const LOW_TO_CAP = {};
for (const k of IMPERATIVE_KEYS) {
  LOW_TO_CAP[k.toLowerCase()] = k;
}

function transformString(s) {
  if (typeof s !== 'string' || !s) return s;
  let out = s;
  let changed = false;

  out = out.replace(REGEXES.capBoundary, (m, boundary, word) => {
    const replacement = IMPERATIVE_MAP[word];
    if (!replacement) return m;
    changed = true;
    return `${boundary}${replacement}`;
  });

  out = out.replace(REGEXES.lowConj, (m, conj, word) => {
    const capForm = LOW_TO_CAP[word];
    if (!capForm) return m;
    const replacement = IMPERATIVE_MAP[capForm];
    if (!replacement) return m;
    changed = true;
    return `${conj}${replacement.toLowerCase()}`;
  });

  out = out.replace(REGEXES.seCond, (m, se, word) => {
    const capForm = LOW_TO_CAP[word];
    if (!capForm) return m;
    const replacement = IMPERATIVE_MAP[capForm];
    if (!replacement) return m;
    changed = true;
    return `${se}${replacement.toLowerCase()}`;
  });

  return { out, changed };
}

function walkAndTransform(node, fieldName = null) {
  let touched = 0;
  if (node === null || node === undefined) return { node, touched };

  if (typeof node === 'string') {
    if (fieldName && TARGET_FIELDS.has(fieldName)) {
      const { out, changed } = transformString(node);
      if (changed) touched += 1;
      return { node: out, touched };
    }
    return { node, touched };
  }

  if (Array.isArray(node)) {
    const newArr = node.map((item) => {
      const { node: nn, touched: tt } = walkAndTransform(item, fieldName);
      touched += tt;
      return nn;
    });
    return { node: newArr, touched };
  }

  if (typeof node === 'object') {
    const newObj = {};
    for (const [k, v] of Object.entries(node)) {
      const { node: nn, touched: tt } = walkAndTransform(v, k);
      touched += tt;
      newObj[k] = nn;
    }
    return { node: newObj, touched };
  }

  return { node, touched };
}

function diffLines(before, after) {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const diffs = [];
  for (let i = 0; i < Math.max(beforeLines.length, afterLines.length); i += 1) {
    if (beforeLines[i] !== afterLines[i]) {
      diffs.push({
        line: i + 1,
        before: beforeLines[i] || '',
        after: afterLines[i] || '',
      });
    }
  }
  return diffs;
}

async function main() {
  const entries = await readdir(LESSON_PATHS_DIR);
  const jsonFiles = entries.filter((f) => f.endsWith('.json')).sort();

  console.log(`Sprint U codemod — linguaggio singolare → plurale`);
  console.log(`Mode: ${APPLY ? 'APPLY (writing)' : 'DRY-RUN'}`);
  console.log(`Lesson-paths dir: ${LESSON_PATHS_DIR}`);
  console.log(`Files to scan: ${jsonFiles.length}`);
  console.log('');

  const summary = {
    scanned: 0,
    modified: 0,
    totalStringTouches: 0,
    fileDiffs: {},
  };

  for (const fname of jsonFiles) {
    const fpath = join(LESSON_PATHS_DIR, fname);
    const raw = await readFile(fpath, 'utf8');
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error(`SKIP (invalid JSON): ${fname} — ${e.message}`);
      continue;
    }

    summary.scanned += 1;

    const { node: transformed, touched } = walkAndTransform(parsed, null);

    if (touched > 0) {
      summary.modified += 1;
      summary.totalStringTouches += touched;

      const before = JSON.stringify(parsed, null, 2) + '\n';
      const after = JSON.stringify(transformed, null, 2) + '\n';
      const diffs = diffLines(before, after);
      summary.fileDiffs[fname] = { touched, diffLineCount: diffs.length };

      if (VERBOSE || !APPLY) {
        console.log(`${fname}: ${touched} string(s) modified, ${diffs.length} line(s) diff`);
        if (VERBOSE) {
          for (const d of diffs.slice(0, 5)) {
            console.log(`  L${d.line}-`);
            console.log(`    OLD: ${d.before.trim().slice(0, 140)}`);
            console.log(`    NEW: ${d.after.trim().slice(0, 140)}`);
          }
          if (diffs.length > 5) console.log(`  ... (+${diffs.length - 5} more)`);
        }
      }

      if (APPLY) {
        await writeFile(fpath, after, 'utf8');
      }
    }
  }

  console.log('');
  console.log('Summary');
  console.log('-------');
  console.log(`Scanned: ${summary.scanned}`);
  console.log(`Modified: ${summary.modified}`);
  console.log(`Total string touches: ${summary.totalStringTouches}`);
  if (!APPLY) {
    console.log('');
    console.log('Dry-run only. Re-run with --apply to write changes.');
  } else {
    console.log('');
    console.log('Files written.');
  }
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
