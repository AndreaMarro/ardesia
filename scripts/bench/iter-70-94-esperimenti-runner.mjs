#!/usr/bin/env node
/**
 * iter-70-94-esperimenti-runner.mjs
 *
 * Orchestrator for the iter-70 79-experiment Playwright audit.
 * Executes the spec against prod and aggregates JSONL output into
 * a structured report.
 *
 * Usage:
 *   node scripts/bench/iter-70-94-esperimenti-runner.mjs
 *   node scripts/bench/iter-70-94-esperimenti-runner.mjs --dry-run
 *   node scripts/bench/iter-70-94-esperimenti-runner.mjs --max=10
 *   node scripts/bench/iter-70-94-esperimenti-runner.mjs --url=https://staging.elabtutor.school
 *
 * Options:
 *   --dry-run     Print config and exit without running Playwright
 *   --max=N       Limit to first N experiments (for quick smoke)
 *   --url=URL     Override prod URL (default: https://www.elabtutor.school)
 *   --workers=N   Playwright workers (default: 1, must stay 1 for prod audit)
 *   --settle=MS   Wait ms after mountExperiment (default: 2500)
 *
 * Output:
 *   docs/audits/iter-70-94-esperimenti-results.jsonl    (appended by spec)
 *   docs/audits/iter-70-94-esperimenti-summary.json     (written by spec afterAll)
 *   docs/audits/iter-70-runner-report.json              (written by this runner)
 *
 * (c) Andrea Marro 2026-05-19 — ELAB Tutor — iter 70 Team B
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

// ── CLI args ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const maxArg = args.find((a) => a.startsWith('--max='));
const urlArg = args.find((a) => a.startsWith('--url='));
const workersArg = args.find((a) => a.startsWith('--workers='));
const settleArg = args.find((a) => a.startsWith('--settle='));

const MAX_EXPERIMENTS = maxArg ? parseInt(maxArg.split('=')[1], 10) : null;
const PROD_URL = urlArg ? urlArg.split('=').slice(1).join('=') : 'https://www.elabtutor.school';
const WORKERS = workersArg ? parseInt(workersArg.split('=')[1], 10) : 1;
const SETTLE_MS = settleArg ? parseInt(settleArg.split('=')[1], 10) : 2500;

const SPEC_PATH = path.join(REPO_ROOT, 'tests', 'e2e', 'iter-70-94-esperimenti-uno-per-uno.spec.js');
const CONFIG_PATH = path.join(REPO_ROOT, 'tests', 'e2e', 'sprint-u.config.js');
const RESULTS_JSONL = path.join(REPO_ROOT, 'docs', 'audits', 'iter-70-94-esperimenti-results.jsonl');
const SUMMARY_JSON = path.join(REPO_ROOT, 'docs', 'audits', 'iter-70-94-esperimenti-summary.json');
const RUNNER_REPORT = path.join(REPO_ROOT, 'docs', 'audits', 'iter-70-runner-report.json');

// ── Config display ─────────────────────────────────────────────────────────
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('ITER-70 TEAM B — 79 ESPERIMENTI RUNNER');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Prod URL    : ${PROD_URL}`);
console.log(`Workers     : ${WORKERS} (keep at 1 for sequential per-experiment audit)`);
console.log(`Settle ms   : ${SETTLE_MS}`);
console.log(`Max exps    : ${MAX_EXPERIMENTS ?? 'ALL (79)'}`);
console.log(`Spec        : ${path.relative(REPO_ROOT, SPEC_PATH)}`);
console.log(`Config      : ${path.relative(REPO_ROOT, CONFIG_PATH)}`);
console.log(`Output JSONL: ${path.relative(REPO_ROOT, RESULTS_JSONL)}`);
console.log(`Summary JSON: ${path.relative(REPO_ROOT, SUMMARY_JSON)}`);
console.log('');

if (dryRun) {
  console.log('[DRY RUN] Exiting without executing Playwright.');
  process.exit(0);
}

// ── Ensure output dirs ─────────────────────────────────────────────────────
fs.mkdirSync(path.join(REPO_ROOT, 'docs', 'audits'), { recursive: true });
fs.mkdirSync(path.join(REPO_ROOT, 'tests', 'e2e', 'iter-70-screenshots'), { recursive: true });

// ── Build Playwright command args ──────────────────────────────────────────
// Use spawnSync (not exec/execSync) to avoid shell injection.
const playwrightArgs = [
  'playwright',
  'test',
  SPEC_PATH,
  '--config', CONFIG_PATH,
  `--workers=${WORKERS}`,
  '--timeout=45000',
  '--reporter=line',
];

const spawnEnv = {
  ...process.env,
  ELAB_PROD_URL: PROD_URL,
  SETTLE_MS: String(SETTLE_MS),
};
if (MAX_EXPERIMENTS) spawnEnv.MAX_EXPERIMENTS = String(MAX_EXPERIMENTS);

console.log(`Running: npx ${playwrightArgs.join(' ')}`);
console.log('');

const startTime = Date.now();

const result = spawnSync('npx', playwrightArgs, {
  cwd: REPO_ROOT,
  env: spawnEnv,
  stdio: 'inherit',
  encoding: 'utf8',
});

const exitCode = result.status ?? 1;
const durationMs = Date.now() - startTime;

// Non-zero exit is expected when BROKEN experiments are found
if (exitCode !== 0) {
  console.log(`\nPlaywright exited with code ${exitCode} (expected when broken experiments found)`);
}

// ── Aggregate JSONL results ────────────────────────────────────────────────
console.log('\nAggregating results from JSONL...');

let results = [];
if (fs.existsSync(RESULTS_JSONL)) {
  const lines = fs.readFileSync(RESULTS_JSONL, 'utf8').trim().split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line);
      if (parsed.id && parsed.severity) {
        results.push(parsed);
      }
    } catch (_) {
      // skip meta line and malformed lines
    }
  }
}

const p0 = results.filter((r) => r.severity === 'P0_BROKEN');
const p1 = results.filter((r) => r.severity === 'P1_PARTIAL');
const p2 = results.filter((r) => r.severity === 'P2_OK');

const vol1 = results.filter((r) => r.vol === 1);
const vol2 = results.filter((r) => r.vol === 2);
const vol3 = results.filter((r) => r.vol === 3);

// ── Per-cap breakdown ──────────────────────────────────────────────────────
const byCap = {};
for (const r of results) {
  const key = `vol${r.vol}-cap${r.cap}`;
  if (!byCap[key]) byCap[key] = { vol: r.vol, cap: r.cap, total: 0, P0: 0, P1: 0, P2: 0 };
  byCap[key].total++;
  if (r.severity === 'P0_BROKEN') byCap[key].P0++;
  else if (r.severity === 'P1_PARTIAL') byCap[key].P1++;
  else byCap[key].P2++;
}

const pctOf = (n, total) => total > 0 ? `${((n / total) * 100).toFixed(1)}%` : '0%';

// ── Console summary ────────────────────────────────────────────────────────
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('RUNNER AGGREGATE REPORT');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Total tested : ${results.length} / 79 expected`);
console.log(`P2 OK        : ${p2.length} (${pctOf(p2.length, results.length)})`);
console.log(`P1 PARTIAL   : ${p1.length} (${pctOf(p1.length, results.length)})`);
console.log(`P0 BROKEN    : ${p0.length} (${pctOf(p0.length, results.length)})`);
console.log('');
console.log('Per-volume:');
console.log(`  Vol1 (38): OK=${vol1.filter(r=>r.severity==='P2_OK').length} PARTIAL=${vol1.filter(r=>r.severity==='P1_PARTIAL').length} BROKEN=${vol1.filter(r=>r.severity==='P0_BROKEN').length}`);
console.log(`  Vol2 (27): OK=${vol2.filter(r=>r.severity==='P2_OK').length} PARTIAL=${vol2.filter(r=>r.severity==='P1_PARTIAL').length} BROKEN=${vol2.filter(r=>r.severity==='P0_BROKEN').length}`);
console.log(`  Vol3 (14): OK=${vol3.filter(r=>r.severity==='P2_OK').length} PARTIAL=${vol3.filter(r=>r.severity==='P1_PARTIAL').length} BROKEN=${vol3.filter(r=>r.severity==='P0_BROKEN').length}`);
console.log('');

if (p0.length > 0) {
  console.log('WORST P0 BROKEN (top 10):');
  p0.slice(0, 10).forEach((r) => {
    const errSummary = (r.consoleErrors?.[0] || r.mountError || r.pageErrors?.[0] || 'no error captured').slice(0, 100);
    console.log(`  [P0] ${r.id}: api=${r.apiReady} mount=${r.mounted} err="${errSummary}"`);
  });
  console.log('');
}

if (p1.length > 0) {
  console.log('WORST P1 PARTIAL (top 10):');
  p1.slice(0, 10).forEach((r) => {
    console.log(`  [P1] ${r.id}: comp=${r.circuitComponentCount}/${r.expectedComponents} conns=${r.circuitConnectionCount}/${r.expectedConnections}`);
  });
  console.log('');
}

console.log(`Duration     : ${(durationMs / 1000).toFixed(1)}s`);
console.log(`Exit code    : ${exitCode}`);
console.log('');

// ── Write runner report ────────────────────────────────────────────────────
const runnerReport = {
  meta: {
    iter: 70,
    team: 'B',
    generatedAt: new Date().toISOString(),
    prodUrl: PROD_URL,
    durationMs,
    playwrightExitCode: exitCode,
  },
  totals: {
    tested: results.length,
    expected: 79,
    P0_BROKEN: p0.length,
    P1_PARTIAL: p1.length,
    P2_OK: p2.length,
    passRate: pctOf(p2.length, results.length),
  },
  byVolume: {
    vol1: {
      total: vol1.length,
      P0: vol1.filter(r=>r.severity==='P0_BROKEN').length,
      P1: vol1.filter(r=>r.severity==='P1_PARTIAL').length,
      P2: vol1.filter(r=>r.severity==='P2_OK').length,
    },
    vol2: {
      total: vol2.length,
      P0: vol2.filter(r=>r.severity==='P0_BROKEN').length,
      P1: vol2.filter(r=>r.severity==='P1_PARTIAL').length,
      P2: vol2.filter(r=>r.severity==='P2_OK').length,
    },
    vol3: {
      total: vol3.length,
      P0: vol3.filter(r=>r.severity==='P0_BROKEN').length,
      P1: vol3.filter(r=>r.severity==='P1_PARTIAL').length,
      P2: vol3.filter(r=>r.severity==='P2_OK').length,
    },
  },
  byChapter: Object.values(byCap).sort((a, b) => a.vol - b.vol || a.cap - b.cap),
  top10Broken: p0.slice(0, 10),
  top10Partial: p1.slice(0, 10),
};

fs.writeFileSync(RUNNER_REPORT, JSON.stringify(runnerReport, null, 2), 'utf8');
console.log(`Runner report: ${path.relative(REPO_ROOT, RUNNER_REPORT)}`);
console.log('═══════════════════════════════════════════════════════════');
console.log('');

process.exit(exitCode);
