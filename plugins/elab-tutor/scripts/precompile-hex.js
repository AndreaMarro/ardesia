#!/usr/bin/env node
/**
 * ELAB Pre-compile HEX Script
 *
 * Scans all experiments across Vol1/Vol2/Vol3, extracts Arduino code,
 * and compiles to HEX files via the remote compiler service.
 * Saves results to public/hex/ with standardized naming.
 *
 * Usage:
 *   node scripts/precompile-hex.js [--server URL] [--dry-run] [--volume 1|2|3]
 *
 * Environment:
 *   COMPILE_URL — compiler server URL (default: from .env)
 *
 * Output:
 *   public/hex/<id>.hex — compiled HEX files
 *   Reports which experiments succeeded/failed
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const HEX_DIR = resolve(ROOT, 'public/hex');

// Parse args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const serverIdx = args.indexOf('--server');
const volIdx = args.indexOf('--volume');
const serverUrl = serverIdx >= 0 ? args[serverIdx + 1] : (process.env.COMPILE_URL || 'https://elab-compiler.onrender.com');
const targetVol = volIdx >= 0 ? parseInt(args[volIdx + 1]) : null;
const BOARD = 'arduino:avr:nano:cpu=atmega328old';
const TIMEOUT = 65000;

if (!existsSync(HEX_DIR)) mkdirSync(HEX_DIR, { recursive: true });

async function compileCode(code) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(`${serverUrl}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, board: BOARD }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return data;
  } catch (err) {
    clearTimeout(timer);
    return { success: false, error: err.message };
  }
}

async function main() {
  console.log(`ELAB HEX Pre-compiler`);
  console.log(`Server: ${serverUrl}`);
  console.log(`Board: ${BOARD}`);
  console.log(`Output: ${HEX_DIR}`);
  if (dryRun) console.log('DRY RUN — will not compile or write files');
  console.log('---');

  // Dynamic import of experiment data
  const volumes = [];
  if (!targetVol || targetVol === 1) {
    try {
      const mod = await import(resolve(ROOT, 'src/data/experiments-vol1.js'));
      volumes.push({ name: 'Vol1', experiments: mod.experiments || mod.default || [] });
    } catch (e) { console.error('Failed to load Vol1:', e.message); }
  }
  if (!targetVol || targetVol === 2) {
    try {
      const mod = await import(resolve(ROOT, 'src/data/experiments-vol2.js'));
      volumes.push({ name: 'Vol2', experiments: mod.experiments || mod.default || [] });
    } catch (e) { console.error('Failed to load Vol2:', e.message); }
  }
  if (!targetVol || targetVol === 3) {
    try {
      const mod = await import(resolve(ROOT, 'src/data/experiments-vol3.js'));
      volumes.push({ name: 'Vol3', experiments: mod.experiments || mod.default || [] });
    } catch (e) { console.error('Failed to load Vol3:', e.message); }
  }

  let total = 0, withCode = 0, alreadyHex = 0, compiled = 0, failed = 0, skipped = 0;
  const results = [];

  for (const vol of volumes) {
    console.log(`\n=== ${vol.name} (${vol.experiments.length} experiments) ===`);
    for (const exp of vol.experiments) {
      total++;
      if (!exp.code) {
        skipped++;
        continue;
      }
      withCode++;

      const hexPath = resolve(HEX_DIR, `${exp.id}.hex`);
      if (existsSync(hexPath)) {
        alreadyHex++;
        results.push({ id: exp.id, status: 'exists' });
        continue;
      }

      if (dryRun) {
        console.log(`  [DRY] Would compile: ${exp.id} (${exp.code.length} chars)`);
        results.push({ id: exp.id, status: 'dry-run' });
        continue;
      }

      process.stdout.write(`  Compiling ${exp.id}...`);
      const result = await compileCode(exp.code);

      if (result.success && result.hex) {
        writeFileSync(hexPath, result.hex, 'utf-8');
        compiled++;
        const size = Math.floor(result.hex.replace(/[^0-9a-fA-F]/g, '').length / 2);
        console.log(` OK (${size} bytes)`);
        results.push({ id: exp.id, status: 'compiled', size });
      } else {
        failed++;
        console.log(` FAIL: ${result.error || result.errors || 'unknown'}`);
        results.push({ id: exp.id, status: 'failed', error: result.error || result.errors });
      }

      // Rate limit: 500ms between requests
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Total experiments: ${total}`);
  console.log(`With code: ${withCode}`);
  console.log(`Already have HEX: ${alreadyHex}`);
  console.log(`Newly compiled: ${compiled}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped (no code): ${skipped}`);

  if (compiled > 0) {
    console.log('\nNext step: update PRECOMPILED_HEX in src/services/compiler.js');
    console.log('New entries:');
    for (const r of results) {
      if (r.status === 'compiled') {
        console.log(`  '${r.id}': '/hex/${r.id}.hex',`);
      }
    }
  }

  if (failed > 0) {
    console.log('\nFailed experiments:');
    for (const r of results) {
      if (r.status === 'failed') {
        console.log(`  ${r.id}: ${r.error}`);
      }
    }
  }
}

main().catch(console.error);
