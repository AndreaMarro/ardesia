#!/usr/bin/env node
/**
 * CLI runner — lesson-paths JSON -> Capitolo JSON
 * Andrea Marro 2026-04-24 (Sprint Q1.B)
 *
 * Reads src/data/lesson-paths/*.json + docs/data/volume-structure.json,
 * writes src/data/capitoli/*.json (37 files: 35 cap-mapped + 2 bonus).
 *
 * Usage:
 *   node scripts/migrate-lesson-paths-to-capitoli.mjs [--dry-run]
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrateAll } from './migrate-lesson-paths-to-capitoli.lib.js';
import { CapitoloSchema } from '../src/data/schemas/Capitolo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const CAPITOLI_DIR = join(PROJECT_ROOT, 'src/data/capitoli');

const dryRun = process.argv.includes('--dry-run');

console.log('[migrate] starting lesson-paths -> capitoli migration');
const capitoli = migrateAll();
console.log(`[migrate] produced ${capitoli.length} Capitoli`);

let validCount = 0;
let invalidCount = 0;
const invalids = [];
for (const cap of capitoli) {
  const result = CapitoloSchema.safeParse(cap);
  if (result.success) {
    validCount++;
  } else {
    invalidCount++;
    invalids.push({ id: cap.id, issues: result.error.issues.slice(0, 3) });
  }
}
console.log(`[migrate] schema validation: ${validCount} valid, ${invalidCount} invalid`);

if (invalidCount > 0) {
  console.error('[migrate] INVALID CAPITOLI:');
  for (const inv of invalids) {
    console.error(`  - ${inv.id}:`, JSON.stringify(inv.issues));
  }
  process.exit(1);
}

if (dryRun) {
  console.log('[migrate] DRY RUN — no files written');
  console.log('[migrate] would write:');
  for (const cap of capitoli) {
    console.log(`  - src/data/capitoli/${cap.id}.json`);
  }
  process.exit(0);
}

mkdirSync(CAPITOLI_DIR, { recursive: true });
let writtenCount = 0;
for (const cap of capitoli) {
  const path = join(CAPITOLI_DIR, `${cap.id}.json`);
  writeFileSync(path, JSON.stringify(cap, null, 2) + '\n', 'utf8');
  writtenCount++;
}
console.log(`[migrate] wrote ${writtenCount} files to src/data/capitoli/`);

// Summary by type
const byType = {};
for (const cap of capitoli) {
  byType[cap.type] = (byType[cap.type] ?? 0) + 1;
}
console.log('[migrate] summary by type:');
for (const [type, count] of Object.entries(byType)) {
  console.log(`  - ${type}: ${count}`);
}

console.log('[migrate] DONE');
