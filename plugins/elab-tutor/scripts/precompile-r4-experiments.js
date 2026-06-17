#!/usr/bin/env node
/**
 * precompile-r4-experiments — Pre-compile all Vol3 Arduino experiments for
 * Nano R4 (Renesas RA4M1) using local arduino-cli and copy the resulting
 * Intel HEX into public/hex/<id>-r4.hex.
 *
 * Output is consumed by services/compiler.js PRECOMPILED_HEX_R4 manifest as
 * an offline-first browser flash path — no Render or backend needed.
 *
 * Usage:
 *   node scripts/precompile-r4-experiments.js
 *
 * Requires:
 *   - arduino-cli installed (`brew install arduino-cli`)
 *   - arduino:renesas_uno core installed (`arduino-cli core install arduino:renesas_uno`)
 *
 * © Andrea Marro — 2026-05-27 — ELAB Tutor
 */

import { mkdir, writeFile, copyFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const FQBN = 'arduino:renesas_uno:nanor4';
const PUBLIC_HEX_DIR = join(PROJECT_ROOT, 'public', 'hex');

function runCli(args, cwd, timeoutMs = 180000) {
  return new Promise((resolve) => {
    const proc = spawn('arduino-cli', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => { try { proc.kill('SIGKILL'); } catch { /* noop */ } }, timeoutMs);
    proc.stdout.on('data', (c) => { stdout += c.toString(); });
    proc.stderr.on('data', (c) => { stderr += c.toString(); });
    proc.on('close', (code) => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
    proc.on('error', (err) => { clearTimeout(timer); resolve({ code: -1, stdout, stderr: err.message }); });
  });
}

async function loadExperiments() {
  // experiments-vol3.js is an ES module exporting an object; dynamic import
  // works because elab-builder is type:"module".
  const mod = await import(join(PROJECT_ROOT, 'src/data/experiments-vol3.js'));
  const raw = mod.default || mod.experiments || mod;
  if (Array.isArray(raw)) return raw;
  return Object.values(raw).flat().filter((e) => e && e.id);
}

async function compileSingle(experiment) {
  if (!experiment.code) return { id: experiment.id, skipped: 'no_code' };
  const workdir = join(tmpdir(), `elab-r4-${randomUUID()}`);
  const sketchDir = join(workdir, 'sketch');
  const buildDir = join(workdir, 'build');
  await mkdir(sketchDir, { recursive: true });
  await mkdir(buildDir, { recursive: true });
  await writeFile(join(sketchDir, 'sketch.ino'), experiment.code, 'utf8');

  const result = await runCli([
    'compile', '--fqbn', FQBN, '--build-path', buildDir, sketchDir,
  ], workdir);

  if (result.code !== 0) {
    return {
      id: experiment.id,
      ok: false,
      stderr: result.stderr.slice(0, 300),
    };
  }

  const hexSource = join(buildDir, 'sketch.ino.hex');
  if (!existsSync(hexSource)) {
    return { id: experiment.id, ok: false, stderr: 'hex_not_found' };
  }
  const destFile = join(PUBLIC_HEX_DIR, `${experiment.id}-r4.hex`);
  await copyFile(hexSource, destFile);
  return { id: experiment.id, ok: true, dest: destFile };
}

async function main() {
  console.log('[precompile-r4] start');
  console.log(`[precompile-r4] PROJECT_ROOT=${PROJECT_ROOT}`);
  console.log(`[precompile-r4] FQBN=${FQBN}`);

  await mkdir(PUBLIC_HEX_DIR, { recursive: true });

  // Verify arduino-cli + Renesas core
  const cli = await runCli(['version'], PROJECT_ROOT, 5000);
  if (cli.code !== 0) {
    console.error('[precompile-r4] arduino-cli not available. brew install arduino-cli');
    process.exit(1);
  }
  const cores = await runCli(['core', 'list'], PROJECT_ROOT, 10000);
  if (!cores.stdout.includes('arduino:renesas_uno')) {
    console.error('[precompile-r4] Renesas core missing. Run:');
    console.error('  arduino-cli core install arduino:renesas_uno');
    process.exit(1);
  }

  const experiments = await loadExperiments();
  const avrExperiments = experiments.filter((e) => e.simulationMode === 'avr' && e.code);
  console.log(`[precompile-r4] ${avrExperiments.length} AVR experiments candidate for R4 cross-compile`);

  const summary = { ok: [], failed: [], skipped: [] };
  for (const exp of avrExperiments) {
    process.stdout.write(`[precompile-r4] ${exp.id} ... `);
    const t0 = Date.now();
    const r = await compileSingle(exp);
    const dt = Date.now() - t0;
    if (r.skipped) {
      console.log(`SKIP ${r.skipped} (${dt}ms)`);
      summary.skipped.push(exp.id);
    } else if (r.ok) {
      console.log(`OK ${dt}ms → ${r.dest}`);
      summary.ok.push(exp.id);
    } else {
      console.log(`FAIL (${dt}ms): ${r.stderr}`);
      summary.failed.push({ id: exp.id, stderr: r.stderr });
    }
  }

  console.log('\n[precompile-r4] summary:');
  console.log(`  ok      : ${summary.ok.length}`);
  console.log(`  failed  : ${summary.failed.length}`);
  console.log(`  skipped : ${summary.skipped.length}`);
  if (summary.failed.length > 0) {
    console.log('\n[precompile-r4] failures:');
    for (const f of summary.failed) console.log(`  - ${f.id}: ${f.stderr.slice(0, 200)}`);
  }

  console.log('\n[precompile-r4] next: list the generated files in services/compiler.js PRECOMPILED_HEX_R4 + add code-matchers if you want offline lookup without `experimentId`.');
  console.log('[precompile-r4] done.');
}

main().catch((err) => {
  console.error('[precompile-r4] fatal:', err);
  process.exit(1);
});
