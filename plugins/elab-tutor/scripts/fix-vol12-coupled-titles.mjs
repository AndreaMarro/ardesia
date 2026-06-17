#!/usr/bin/env node
/**
 * fix-vol12-coupled-titles.mjs — iter 74 TRACK B-4 (iter 57 close audit
 * §Honest gaps #1 carryover): cleanup 33 Vol1/Vol2 next_experiment.title
 * coupled-label drift.
 *
 * Source authority: per-experiment lesson-path's own `title` field (Phase 3
 * shipped iter 57 = book-faithful clean titles).
 * Target sync: predecessor's `next_experiment.title` field (stale label).
 *
 * Idempotent: re-run safe (no-op if no drift).
 * Dry-run mode: --dry-run flag prints diffs without write.
 *
 * Usage:
 *   node scripts/fix-vol12-coupled-titles.mjs [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const LESSON_PATHS_DIR = path.join(REPO_ROOT, 'src/data/lesson-paths');
const DRY_RUN = process.argv.includes('--dry-run');

function main() {
  if (!fs.existsSync(LESSON_PATHS_DIR)) {
    console.error(`[fix-vol12-titles] ERROR: ${LESSON_PATHS_DIR} not found`);
    process.exit(1);
  }

  const files = fs.readdirSync(LESSON_PATHS_DIR).filter(f => /^(v1|v2)-.*\.json$/.test(f));
  let driftsFound = 0;
  let driftsFixed = 0;
  const driftReport = [];

  for (const f of files) {
    const fp = path.join(LESSON_PATHS_DIR, f);
    let json;
    try {
      json = JSON.parse(fs.readFileSync(fp, 'utf8'));
    } catch (e) {
      console.error(`[fix-vol12-titles] SKIP ${f}: ${e.message}`);
      continue;
    }

    if (!json.next_experiment || !json.next_experiment.id) continue;
    const nextFp = path.join(LESSON_PATHS_DIR, json.next_experiment.id + '.json');
    if (!fs.existsSync(nextFp)) continue;

    let nextJson;
    try {
      nextJson = JSON.parse(fs.readFileSync(nextFp, 'utf8'));
    } catch (e) {
      console.error(`[fix-vol12-titles] SKIP next ${json.next_experiment.id}: ${e.message}`);
      continue;
    }

    if (json.next_experiment.title === nextJson.title) continue;
    // Drift detected
    driftsFound++;
    const oldTitle = json.next_experiment.title;
    const newTitle = nextJson.title;
    driftReport.push({ from: json.experiment_id, to: json.next_experiment.id, old: oldTitle, new: newTitle });

    if (DRY_RUN) continue;

    json.next_experiment.title = newTitle;
    fs.writeFileSync(fp, JSON.stringify(json, null, 2) + '\n', 'utf8');
    driftsFixed++;
  }

  const mode = DRY_RUN ? 'DRY-RUN' : 'APPLY';
  console.log(`[fix-vol12-titles] ${mode}: ${driftsFound} drifts found, ${driftsFixed} fixed (${files.length} V1+V2 files scanned)`);
  if (driftReport.length > 0) {
    console.log('\nDrift details:');
    for (const d of driftReport) {
      console.log(`  ${d.from} → ${d.to}`);
      console.log(`    old: "${d.old}"`);
      console.log(`    new: "${d.new}"`);
    }
  }
  if (driftsFound === 0) {
    console.log('[fix-vol12-titles] No drift — all V1+V2 coupled titles in sync.');
  }
}

main();
