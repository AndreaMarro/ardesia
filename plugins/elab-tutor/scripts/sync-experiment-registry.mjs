#!/usr/bin/env node
/**
 * Iter 69 A-AUTOMATION-1 — Experiment registry sync check.
 *
 * Verifies supabase/functions/_shared/experiment-registry.ts VALID_EXPERIMENT_IDS
 * matches src/data/experiments-vol{1,2,3}.js source files. Prevents drift
 * iter 68 section 6 caveat 6 (manual sync risk when adding experiments).
 *
 * Modes:
 *   node scripts/sync-experiment-registry.mjs          -> check, exit 1 if mismatch
 *   node scripts/sync-experiment-registry.mjs --list   -> emit IDs list
 *
 * Wire-up:
 *   1. npm script: "sync-experiment-registry"
 *   2. pre-commit hook: invoke when source or registry change
 *   3. Andrea regenerates registry.ts manually when mismatch detected
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const SOURCE_FILES = [
  resolve(ROOT, 'src/data/experiments-vol1.js'),
  resolve(ROOT, 'src/data/experiments-vol2.js'),
  resolve(ROOT, 'src/data/experiments-vol3.js'),
];
const REGISTRY_FILE = resolve(ROOT, 'supabase/functions/_shared/experiment-registry.ts');

const ID_PATTERN = /id:\s*"(v[1-3]-cap[0-9]+-[a-z0-9_-]+)"/g;

function extractIdsFromSource() {
  const ids = new Set();
  for (const file of SOURCE_FILES) {
    if (!existsSync(file)) {
      console.error('[sync-registry] ERROR source file missing: ' + file);
      process.exit(2);
    }
    const content = readFileSync(file, 'utf8');
    let m;
    while ((m = ID_PATTERN.exec(content)) !== null) ids.add(m[1]);
  }
  return ids;
}

function extractIdsFromRegistry() {
  if (!existsSync(REGISTRY_FILE)) {
    console.error('[sync-registry] ERROR registry file missing: ' + REGISTRY_FILE);
    process.exit(2);
  }
  const content = readFileSync(REGISTRY_FILE, 'utf8');
  const ids = new Set();
  const REG_ID_PATTERN = /'(v[1-3]-cap[0-9]+-[a-z0-9_-]+)'/g;
  let m;
  while ((m = REG_ID_PATTERN.exec(content)) !== null) ids.add(m[1]);
  return ids;
}

function setDiff(a, b) {
  return [...a].filter((x) => !b.has(x));
}

const sourceIds = extractIdsFromSource();
const registryIds = extractIdsFromRegistry();

const missingInRegistry = setDiff(sourceIds, registryIds).sort();
const extraInRegistry = setDiff(registryIds, sourceIds).sort();

const isList = process.argv.includes('--list');

if (isList) {
  console.log('[sync-registry] Canonical IDs list from src/data/experiments-vol*.js:');
  console.log('Total: ' + sourceIds.size);
  console.log('---');
  console.log([...sourceIds].sort().join('\n'));
  process.exit(0);
}

if (missingInRegistry.length === 0 && extraInRegistry.length === 0) {
  console.log('[sync-registry] OK -- registry matches source files (' + sourceIds.size + ' IDs)');
  process.exit(0);
}

console.error('[sync-registry] DRIFT DETECTED -- experiment-registry.ts out of sync');
console.error('Source files: ' + sourceIds.size + ' IDs | Registry: ' + registryIds.size + ' IDs');
if (missingInRegistry.length > 0) {
  console.error('\nMissing in registry (' + missingInRegistry.length + '):');
  for (const id of missingInRegistry) console.error('  + ' + id);
}
if (extraInRegistry.length > 0) {
  console.error('\nExtra in registry (' + extraInRegistry.length + '):');
  for (const id of extraInRegistry) console.error('  - ' + id);
}
console.error('\nRegenerate: edit supabase/functions/_shared/experiment-registry.ts manually');
console.error('Get canonical list: node scripts/sync-experiment-registry.mjs --list');
process.exit(1);
