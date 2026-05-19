/**
 * lesson-paths-plurale.test.js — Sprint U Cycle 2 Fix #2
 *
 * Asserts that all lesson-paths JSON files contain ZERO singolare imperatives
 * in teacher-facing fields. Pre-codemod baseline (Cycle 1 audit): 73/94 files
 * had violations (~50 "Premi Play" + ~23 other imperatives).
 *
 * Post-codemod target: 0 violations.
 *
 * Scope: only fields the docente reads aloud or that frame the docente's actions:
 *   teacher_message, teacher_tip, observation_prompt, summary_for_class,
 *   components_list, class_hook, provocative_question, resume_message,
 *   next_preview, description (build_circuit), button_label, teacher_response,
 *   mistake (common_mistakes), preview (next_experiment).
 *
 * Excluded: vocabulary lists, ids, _meta, analogies[].text (3rd-person narrative).
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LESSON_PATHS_DIR = resolve(__dirname, '..', '..', '..', 'src', 'data', 'lesson-paths');

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

// Singolare imperative patterns at SENTENCE BOUNDARY (start, or after .!?:; + space).
// Each pattern matches the OLD broken form that codemod should have eliminated.
const SINGOLARE_PATTERNS = [
  // Capitalized at sentence-boundary
  /(^|[.!?:;\n]\s+|—\s+)(Premi|Fai|Clicca|Monta|Collega|Inserisci|Guarda|Osserva|Controlla|Verifica|Prova|Regola|Mostra|Disegna|Aggiungi|Avvicina|Tocca|Muovi|Carica|Compila|Esegui|Misura|Apri|Chiudi|Accendi|Spegni|Gira)\b/,
  // After coordinating conjunctions "e/poi/ma/oppure/quindi/allora"
  /\b(?:e|poi|ma|oppure|quindi|allora)\s+(premi|fai|clicca|monta|collega|inserisci|guarda|osserva|controlla|verifica|prova)\b/,
  // After "Se " conditional
  /\bSe\s+(premi|fai|clicca|monta|collega|inserisci|guarda|osserva|controlla|verifica|prova)\b/,
];

const VIOLATION_TOKEN_LABELS = [
  'Capitalized imperative at sentence boundary',
  'Lowercase imperative after "e/poi/ma/..." conjunction',
  'Lowercase imperative after "Se" conditional',
];

function collectViolations(node, fieldName, fileId, viols) {
  if (node === null || node === undefined) return;
  if (typeof node === 'string') {
    if (!fieldName || !TARGET_FIELDS.has(fieldName)) return;
    SINGOLARE_PATTERNS.forEach((re, idx) => {
      const m = node.match(re);
      if (m) {
        viols.push({
          file: fileId,
          field: fieldName,
          kind: VIOLATION_TOKEN_LABELS[idx],
          match: m[0].trim().slice(0, 80),
          context: node.slice(0, 140),
        });
      }
    });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item) => collectViolations(item, fieldName, fileId, viols));
    return;
  }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      collectViolations(v, k, fileId, viols);
    }
  }
}

const jsonFiles = readdirSync(LESSON_PATHS_DIR)
  .filter((f) => f.endsWith('.json'))
  .sort();

describe('Sprint U Cycle 2 Fix #2 — lesson-paths plurale linguaggio', () => {
  it('lesson-paths directory contains 79 JSON files', () => {
    expect(jsonFiles.length).toBe(79);
  });

  it('every lesson-path JSON parses cleanly', () => {
    for (const fname of jsonFiles) {
      const raw = readFileSync(join(LESSON_PATHS_DIR, fname), 'utf8');
      expect(() => JSON.parse(raw), `${fname} not valid JSON`).not.toThrow();
    }
  });

  it('zero singolare imperatives across all teacher-facing fields', () => {
    const allViolations = [];
    for (const fname of jsonFiles) {
      const raw = readFileSync(join(LESSON_PATHS_DIR, fname), 'utf8');
      const parsed = JSON.parse(raw);
      collectViolations(parsed, null, fname, allViolations);
    }
    if (allViolations.length > 0) {
      const summary = allViolations
        .slice(0, 20)
        .map(
          (v) =>
            `  ${v.file} [${v.field}] ${v.kind} :: "${v.match}"  ctx="${v.context}..."`,
        )
        .join('\n');
      const totalMsg = `${allViolations.length} singolare imperative violation(s) found:\n${summary}${
        allViolations.length > 20 ? `\n  ... (+${allViolations.length - 20} more)` : ''
      }`;
      expect.fail(totalMsg);
    }
    expect(allViolations.length).toBe(0);
  });

  // Spot-checks for the most prominent legacy violations from Cycle 1 audit
  it('no occurrences of "Premi Play" anywhere in teacher-facing fields', () => {
    const occurrences = [];
    for (const fname of jsonFiles) {
      const raw = readFileSync(join(LESSON_PATHS_DIR, fname), 'utf8');
      // Need full-content scan but limited to teacher-facing field VALUES.
      // Cheap proxy: search the raw JSON text for "Premi Play".
      if (/"Premi Play\b/.test(raw)) {
        occurrences.push(fname);
      }
    }
    expect(occurrences, `Premi Play still present in: ${occurrences.join(', ')}`).toEqual([]);
  });
});
