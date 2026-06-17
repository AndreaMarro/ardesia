#!/usr/bin/env node
/**
 * Sprint S iter 8 — MASTER ORCHESTRATOR Bench Runner (ATOM-S8-A10)
 *
 * Runs the 7-suite iter 8 benchmark sequentially with one parallel pair:
 *   B1 R6 stress     (existing run-sprint-r5-stress.mjs adapted for r6-fixture-100)
 *   B2 Hybrid RAG    (run-hybrid-rag-eval.mjs)             [PARALLEL with B5]
 *   B3 Vision E2E    (Playwright spec — invoked or skipped)
 *   B4 TTS Isabella  (run-tts-isabella-bench.mjs)
 *   B5 ClawBot       (run-clawbot-composite-bench.mjs)     [PARALLEL with B2]
 *   B6 Cost          (run-cost-bench.mjs)
 *   B7 Fallback      (run-fallback-chain-bench.mjs)
 *
 * Pre-flight:
 *   - env vars present (SUPABASE_URL, SUPABASE_ANON_KEY, ELAB_API_KEY)
 *   - vitest baseline ≥12599 PASS (tail check)
 *   - services up (curl health endpoints if --check-services)
 *
 * Aggregator: each suite weight 1.0, total 7/7 = SPRINT_S iter 8 GREEN.
 * Score gate: 7/7=9.2, 6/7=8.7 target, 5/7=8.2, ≤4/7=7.5 stuck.
 *
 * Output:
 *   docs/bench/iter-8-results-{ts}.md (unified report)
 *   docs/bench/iter-8-results-{ts}.json (dashboard data)
 *
 * Exit: 0 = ALL pass, 1 = any suite fail with detail.
 *
 * Usage:
 *   node scripts/bench/iter-8-bench-runner.mjs [--dry-run] [--skip-baseline] [--skip B3,B4]
 *
 * (c) Andrea Marro — 2026-04-27 — gen-app-opus iter 8
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..', '..');

// ─── CLI ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { dryRun: false, skipBaseline: false, skip: [], help: false, checkServices: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--skip-baseline') out.skipBaseline = true;
    else if (a === '--check-services') out.checkServices = true;
    else if (a === '--skip') out.skip = (argv[++i] || '').split(',').filter(Boolean);
  }
  return out;
}

function printHelp() {
  console.log(`Sprint S iter 8 — Master Bench Orchestrator

Usage:
  node scripts/bench/iter-8-bench-runner.mjs [--dry-run] [--skip-baseline] [--skip B3,B4] [--check-services]

Options:
  --dry-run         All suites run in dry-run/synthetic mode (no live calls).
  --skip-baseline   Skip vitest baseline pre-flight check.
  --check-services  curl health endpoints before running.
  --skip B3,B4      Comma-list of suites to skip (still counted as N/A in aggregate).

Suites:
  B1 R6 Stress         (run-sprint-r5-stress.mjs --fixture r6-fixture-100.jsonl)
  B2 Hybrid RAG        (run-hybrid-rag-eval.mjs)             PARALLEL with B5
  B3 Vision E2E        (Playwright tests/e2e/02-vision-flow.spec.js)
  B4 TTS Isabella      (run-tts-isabella-bench.mjs)
  B5 ClawBot Composite (run-clawbot-composite-bench.mjs)     PARALLEL with B2
  B6 Cost              (run-cost-bench.mjs)
  B7 Fallback          (run-fallback-chain-bench.mjs)

Pass criteria iter 8:
  B1 R6: ≥87% global + 10/10 categories ≥85%
  B2 Hybrid RAG: recall@5 ≥0.85
  B3 Vision E2E: latency p95 <8s + topology ≥80%
  B4 TTS Isabella: latency p50 <2s + MOS ≥4.0
  B5 ClawBot: success ≥90%
  B6 Cost: <€0.012/session
  B7 Fallback: gate accuracy 100%

Score gate: 7/7=9.2, 6/7=8.7 target, 5/7=8.2, ≤4/7=7.5 stuck.
`);
}

// ─── Pre-flight ─────────────────────────────────────────────────────────────

function checkEnvVars() {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const optional = ['ELAB_API_KEY', 'TOGETHER_API_KEY', 'VOYAGE_API_KEY', 'GEMINI_API_KEY'];
  const missingRequired = required.filter(k => !(process.env[k] || '').trim());
  const missingOptional = optional.filter(k => !(process.env[k] || '').trim());
  return { missingRequired, missingOptional };
}

function checkBaseline() {
  console.log('[pre-flight] running vitest baseline check (this may take ~30s)...');
  try {
    const r = spawnSync('npx', ['vitest', 'run', '--reporter=basic'], {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
      timeout: 180000,
    });
    const out = (r.stdout || '') + (r.stderr || '');
    const tail = out.split('\n').slice(-20).join('\n');
    const passMatch = tail.match(/(\d+)\s+passed/i);
    const passed = passMatch ? parseInt(passMatch[1], 10) : 0;
    return { passed, tail, ok: passed >= 12599 };
  } catch (err) {
    return { passed: 0, tail: err.message, ok: false };
  }
}

async function checkService(url, name) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(url, { method: 'HEAD', signal: ctrl.signal });
    clearTimeout(t);
    return { name, url, ok: r.ok || r.status === 401 || r.status === 405, status: r.status };
  } catch (err) {
    return { name, url, ok: false, error: err.message };
  }
}

// ─── Suite runners ──────────────────────────────────────────────────────────

function runScript(scriptName, args, label, captureScores) {
  const scriptPath = resolve(__dirname, scriptName);
  if (!existsSync(scriptPath)) {
    return Promise.resolve({ label, ok: false, error: `script not found: ${scriptPath}`, exit_code: 127 });
  }
  return new Promise((res) => {
    console.log(`\n========== ${label} ==========`);
    console.log(`> node ${scriptName} ${args.join(' ')}`);
    const start = Date.now();
    const child = spawn(process.execPath, [scriptPath, ...args], { stdio: 'inherit' });
    child.on('close', (code) => {
      const duration = Date.now() - start;
      let scores = null;
      if (captureScores && existsSync(captureScores)) {
        try { scores = JSON.parse(readFileSync(captureScores, 'utf-8')); } catch (e) { /* skip */ }
      }
      res({ label, ok: code === 0, exit_code: code, duration_ms: duration, scores });
    });
    child.on('error', (err) => {
      res({ label, ok: false, exit_code: -1, error: err.message });
    });
  });
}

function findLatestScores(globPrefix) {
  const outDir = resolve(__dirname, 'output');
  if (!existsSync(outDir)) return null;
  const fs = require('node:fs');
  // Skip: spawn process owns its writes; we just look for most recent matching JSON
  return null; // Caller passes explicit path via --output flag
}

// ─── Main orchestration ────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printHelp(); process.exit(0); }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Sprint S iter 8 — Master Bench Orchestrator');
  console.log(`  Date: ${new Date().toISOString()}`);
  console.log(`  Dry-run: ${args.dryRun} | Skip: ${args.skip.join(',') || '(none)'}`);
  console.log('═══════════════════════════════════════════════════════════════');

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = resolve(REPO_ROOT, 'docs', 'bench');
  mkdirSync(reportDir, { recursive: true });
  const reportMdPath = join(reportDir, `iter-8-results-${ts}.md`);
  const reportJsonPath = join(reportDir, `iter-8-results-${ts}.json`);

  // ─── Pre-flight ───
  console.log('\n── PRE-FLIGHT ──');
  const env = checkEnvVars();
  console.log(`env vars: required missing=${env.missingRequired.join(',') || '(none)'} optional missing=${env.missingOptional.join(',') || '(none)'}`);

  let baseline = { ok: true, passed: 0, skipped: true };
  if (!args.skipBaseline) {
    baseline = checkBaseline();
    console.log(`vitest baseline: ${baseline.passed} PASS — ${baseline.ok ? 'OK' : 'BELOW 12599 (not blocking iter 8)'}`);
  } else {
    console.log('vitest baseline: SKIPPED');
  }

  let services = [];
  if (args.checkServices && process.env.SUPABASE_URL) {
    services = await Promise.all([
      checkService(`${process.env.SUPABASE_URL}/functions/v1/unlim-chat`, 'unlim-chat'),
      checkService(`${process.env.SUPABASE_URL}/functions/v1/unlim-tts`, 'unlim-tts'),
      checkService('https://www.elabtutor.school', 'frontend'),
    ]);
    for (const s of services) {
      console.log(`service ${s.name}: ${s.ok ? 'UP' : 'DOWN'} (${s.status || s.error})`);
    }
  }

  const dryRunFlag = args.dryRun ? ['--dry-run'] : [];
  const skipSet = new Set(args.skip);
  const outDir = resolve(__dirname, 'output');

  // ─── Suite execution plan ───
  console.log('\n── SUITE EXECUTION PLAN ──');
  console.log('B1 → [B2 ‖ B5] → B3 → B4 → B6 → B7');

  const results = {};

  // B1 — R6 Stress (sequential first)
  if (!skipSet.has('B1')) {
    const r6Fixture = resolve(__dirname, 'r6-fixture-100.jsonl');
    const fixtureFlag = existsSync(r6Fixture) ? ['--fixture', r6Fixture] : [];
    results.B1 = await runScript('run-sprint-r5-stress.mjs',
      args.dryRun ? [...fixtureFlag, '--dry-run'] : fixtureFlag,
      'B1: R6 Stress (50/100 prompts)',
      null,
    );
  } else {
    results.B1 = { label: 'B1 SKIPPED', ok: null, skipped: true };
  }

  // B2 + B5 — PARALLEL pair
  console.log('\n── PARALLEL B2 + B5 ──');
  const b2Promise = skipSet.has('B2') ? Promise.resolve({ label: 'B2 SKIPPED', ok: null, skipped: true })
    : runScript('run-hybrid-rag-eval.mjs', dryRunFlag, 'B2: Hybrid RAG', null);
  const b5Promise = skipSet.has('B5') ? Promise.resolve({ label: 'B5 SKIPPED', ok: null, skipped: true })
    : runScript('run-clawbot-composite-bench.mjs', [], 'B5: ClawBot Composite', null);
  const [b2, b5] = await Promise.all([b2Promise, b5Promise]);
  results.B2 = b2;
  results.B5 = b5;

  // B3 — Vision E2E (Playwright invocation if available)
  if (!skipSet.has('B3')) {
    const e2eSpec = resolve(REPO_ROOT, 'tests', 'e2e', '02-vision-flow.spec.js');
    if (existsSync(e2eSpec) && !args.dryRun) {
      console.log('\n========== B3: Vision E2E ==========');
      console.log('> npx playwright test tests/e2e/02-vision-flow.spec.js');
      const start = Date.now();
      const r = spawnSync('npx', ['playwright', 'test', 'tests/e2e/02-vision-flow.spec.js'], {
        cwd: REPO_ROOT,
        stdio: 'inherit',
        timeout: 300000,
      });
      results.B3 = { label: 'B3: Vision E2E', ok: r.status === 0, exit_code: r.status, duration_ms: Date.now() - start };
    } else {
      results.B3 = { label: 'B3: Vision E2E (SKIPPED — spec missing or dry-run)', ok: null, skipped: true };
    }
  } else {
    results.B3 = { label: 'B3 SKIPPED', ok: null, skipped: true };
  }

  // B4 — TTS Isabella
  results.B4 = skipSet.has('B4')
    ? { label: 'B4 SKIPPED', ok: null, skipped: true }
    : await runScript('run-tts-isabella-bench.mjs', dryRunFlag, 'B4: TTS Isabella', null);

  // B6 — Cost
  results.B6 = skipSet.has('B6')
    ? { label: 'B6 SKIPPED', ok: null, skipped: true }
    : await runScript('run-cost-bench.mjs', [], 'B6: Cost per Session', null);

  // B7 — Fallback Chain
  results.B7 = skipSet.has('B7')
    ? { label: 'B7 SKIPPED', ok: null, skipped: true }
    : await runScript('run-fallback-chain-bench.mjs', [], 'B7: Fallback Chain', null);

  // ─── Aggregator ───
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  AGGREGATOR');
  console.log('═══════════════════════════════════════════════════════════════');

  const suites = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'];
  let pass = 0, fail = 0, skipped = 0;
  for (const s of suites) {
    const r = results[s];
    if (!r) { skipped++; continue; }
    if (r.skipped || r.ok === null) { skipped++; console.log(`  ${s}: SKIPPED`); continue; }
    if (r.ok) { pass++; console.log(`  ${s}: PASS (${r.duration_ms}ms)`); }
    else { fail++; console.log(`  ${s}: FAIL (exit=${r.exit_code} err=${r.error || 'see logs'})`); }
  }

  const ratio = `${pass}/${suites.length - skipped}`;
  let scoreGate;
  if (pass === 7) scoreGate = 9.2;
  else if (pass === 6) scoreGate = 8.7;
  else if (pass === 5) scoreGate = 8.2;
  else scoreGate = 7.5;

  const overallVerdict = fail === 0 && pass >= 5 ? 'GREEN' : (pass >= 4 ? 'YELLOW' : 'RED');

  console.log(`\nResult: pass=${pass} fail=${fail} skipped=${skipped} ratio=${ratio}`);
  console.log(`Score gate: ${scoreGate}/10 (${overallVerdict})`);

  // ─── Reports ───
  const dashboard = {
    sprint: 'S-iter-8',
    generated_at: new Date().toISOString(),
    pre_flight: { env, baseline, services },
    suites: results,
    aggregate: { pass, fail, skipped, ratio, score_gate: scoreGate, verdict: overallVerdict },
    dry_run: args.dryRun,
  };

  writeFileSync(reportJsonPath, JSON.stringify(dashboard, null, 2));
  console.log(`\nDashboard: ${reportJsonPath}`);

  const md = [
    `# Sprint S iter 8 — Bench Results`,
    ``,
    `Generated: ${new Date().toISOString()}`,
    `Dry-run: ${args.dryRun}`,
    ``,
    `## Pre-flight`,
    `- Env vars required missing: ${env.missingRequired.join(', ') || '(none)'}`,
    `- Env vars optional missing: ${env.missingOptional.join(', ') || '(none)'}`,
    `- Vitest baseline: ${baseline.skipped ? 'SKIPPED' : `${baseline.passed} PASS (${baseline.ok ? 'OK' : 'BELOW 12599'})`}`,
    `- Services: ${services.map(s => `${s.name}=${s.ok ? 'UP' : 'DOWN'}`).join(', ') || '(not checked)'}`,
    ``,
    `## Suite Results`,
    ...suites.map(s => {
      const r = results[s];
      if (!r) return `- ${s}: NO RESULT`;
      if (r.skipped || r.ok === null) return `- ${s}: SKIPPED`;
      return `- ${s}: ${r.ok ? 'PASS' : 'FAIL'} (exit=${r.exit_code}, ${r.duration_ms || 0}ms)`;
    }),
    ``,
    `## Aggregate`,
    `- Pass: ${pass} / Fail: ${fail} / Skipped: ${skipped}`,
    `- Ratio: ${ratio}`,
    `- Score gate: **${scoreGate}/10**`,
    `- Verdict: **${overallVerdict}**`,
    ``,
    `## Pass Criteria iter 8`,
    `- B1 R6: ≥87% global + 10/10 categories ≥85%`,
    `- B2 Hybrid RAG: recall@5 ≥0.85`,
    `- B3 Vision E2E: latency p95 <8s + topology ≥80%`,
    `- B4 TTS Isabella: latency p50 <2s + MOS ≥4.0`,
    `- B5 ClawBot: success ≥90%`,
    `- B6 Cost: <€0.012/session`,
    `- B7 Fallback: gate accuracy 100%`,
  ].join('\n');
  writeFileSync(reportMdPath, md);
  console.log(`Report: ${reportMdPath}`);

  process.exit(fail > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('[iter-8-bench-runner] fatal:', err);
  process.exit(1);
});
