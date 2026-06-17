#!/usr/bin/env node
/**
 * ELAB Objective Benchmark — v1
 *
 * Produces a weighted 0-10 score from 10 measurable metrics.
 * NO self-evaluation, NO claims, only numbers read from artifacts.
 *
 * Usage:
 *   node scripts/benchmark.cjs           # full run (slow, ~25 min if vitest + build + playwright)
 *   node scripts/benchmark.cjs --fast    # read cached artifacts only
 *   node scripts/benchmark.cjs --write   # persist to automa/state/benchmark.json
 *
 * Output: JSON with metrics, score, delta from previous run.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const STATE_DIR = path.join(ROOT, 'automa', 'state');
const OUT_FILE = path.join(STATE_DIR, 'benchmark.json');

const FAST_MODE = process.argv.includes('--fast');
const WRITE_MODE = process.argv.includes('--write');

function safeExec(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...opts });
  } catch (e) {
    return e.stdout || e.stderr || '';
  }
}

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

// ───────────────────────────────────────────────────────────────
// METRIC FUNCTIONS (each returns { value, observed, notes })
// ───────────────────────────────────────────────────────────────

function metricTestCount() {
  if (FAST_MODE) {
    const baseline = fs.existsSync(path.join(ROOT, 'automa/baseline-tests.txt'))
      ? parseInt(fs.readFileSync(path.join(ROOT, 'automa/baseline-tests.txt'), 'utf8').trim(), 10)
      : 0;
    return { value: baseline, observed: baseline, notes: 'fast mode (read baseline file)' };
  }
  const out = safeExec('npx vitest run --reporter=dot 2>&1 | tail -5');
  const match = out.match(/(\d+) passed/);
  const failMatch = out.match(/(\d+) failed/);
  const passed = match ? parseInt(match[1], 10) : 0;
  const failed = failMatch ? parseInt(failMatch[1], 10) : 0;
  return { value: passed, observed: passed + failed, notes: `${failed} failed` };
}

function metricBuildSize() {
  const distDir = path.join(ROOT, 'dist');
  if (!fs.existsSync(distDir)) {
    if (FAST_MODE) return { value: 0, observed: 0, notes: 'no dist/, fast mode skipped build' };
    safeExec('npm run build 2>&1 | tail -5');
  }
  let totalKb = 0;
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fp);
      else if (entry.name.endsWith('.js') || entry.name.endsWith('.css')) {
        totalKb += fs.statSync(fp).size / 1024;
      }
    }
  }
  walk(distDir);
  return { value: Math.round(totalKb), observed: Math.round(totalKb), notes: 'sum js+css in dist/' };
}

function metricE2EPassRate() {
  const e2eDir = path.join(ROOT, 'tests', 'e2e');
  if (!fs.existsSync(e2eDir) || fs.readdirSync(e2eDir).filter(f => f.endsWith('.spec.js')).length === 0) {
    return { value: 0, observed: 0, notes: 'no e2e specs' };
  }
  if (FAST_MODE) {
    const reportFile = path.join(ROOT, 'playwright-report', 'results.json');
    const report = readJson(reportFile);
    if (!report) return { value: 0, observed: 0, notes: 'no cached report' };
    const passed = report.stats?.expected || 0;
    const total = (report.stats?.expected || 0) + (report.stats?.unexpected || 0);
    return { value: total > 0 ? passed / total : 0, observed: passed, notes: `${passed}/${total}` };
  }
  const out = safeExec('npx playwright test --reporter=list 2>&1 | tail -20');
  const passMatch = out.match(/(\d+) passed/);
  const failMatch = out.match(/(\d+) failed/);
  const passed = passMatch ? parseInt(passMatch[1], 10) : 0;
  const failed = failMatch ? parseInt(failMatch[1], 10) : 0;
  const total = passed + failed;
  return { value: total > 0 ? passed / total : 0, observed: passed, notes: `${passed}/${total}` };
}

function metricVolumeRefCoverage() {
  const p = path.join(ROOT, 'src', 'data', 'volume-references.js');
  if (!fs.existsSync(p)) return { value: 0, observed: 0, notes: 'file missing' };
  const content = fs.readFileSync(p, 'utf8');
  const bookTextCount = (content.match(/bookText:\s*["`]/g) || []).length;
  return { value: bookTextCount, observed: bookTextCount, notes: `${bookTextCount}/92 entries` };
}

function metricDashboardLiveData() {
  const dashDir = path.join(ROOT, 'src', 'components', 'dashboard');
  if (!fs.existsSync(dashDir)) return { value: 0, observed: false, notes: 'component dir missing' };
  const files = fs.readdirSync(dashDir).filter(f => f.endsWith('.jsx') || f.endsWith('.js'));
  if (files.length === 0) return { value: 0, observed: false, notes: 'no files in dashboard/' };
  // Check at least one file imports supabase
  const hasSupabase = files.some(f => {
    const c = fs.readFileSync(path.join(dashDir, f), 'utf8');
    return c.includes('supabase') || c.includes('from(\'sessions\'') || c.includes('from("sessions"');
  });
  return { value: hasSupabase ? 1 : 0.3, observed: hasSupabase, notes: `${files.length} files, supabase=${hasSupabase}` };
}

function metricUnlimLatencyP95() {
  // Placeholder: real impl would ping Render + measure. For now, read log if present.
  const logFile = path.join(ROOT, 'automa', 'state', 'unlim-latency.log');
  if (!fs.existsSync(logFile)) return { value: 0, observed: 0, notes: 'no latency log' };
  try {
    const samples = fs.readFileSync(logFile, 'utf8').trim().split('\n').map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
    if (samples.length === 0) return { value: 0, observed: 0, notes: 'empty log' };
    const p95 = samples[Math.floor(samples.length * 0.95)];
    return { value: p95, observed: p95, notes: `${samples.length} samples, p95=${p95}ms` };
  } catch {
    return { value: 0, observed: 0, notes: 'parse error' };
  }
}

function metricGitHygiene() {
  // Day 16 fix: split by \x1e record separator (was \n\n paragraphs → inflated denominator);
  // regex broadened beyond "Test: N/N PASS" to include conventional-commit prefix / CoV / blocker ref.
  const out = safeExec("git log --pretty=format:%H%x1f%B%x1e -n 30 2>&1");
  const commits = out.split('\x1e').map(s => s.trim()).filter(Boolean);
  const total = commits.length;
  if (total === 0) return { value: 0, observed: 0, notes: 'no git history' };
  const hygieneSignals = /(Test:?\s*\d+\/\d+\s*PASS|\b\d+\s*tests?\s*(PASS|passing|pass)\b|baseline\s+tests?\s+\d+|CoV\s*\d+x|BLOCKER-\d+|\b\d{4,}\b\s*PASS|^(feat|fix|chore|docs|style|refactor|test|perf|build|ci)(\([^)]+\))?:)/im;
  const withHygiene = commits.filter(c => hygieneSignals.test(c)).length;
  const rate = withHygiene / total;
  return { value: rate, observed: withHygiene, notes: `${withHygiene}/${total} commits with hygiene signals (test count / CoV / blocker ref / conventional prefix)` };
}

function metricDocumentation() {
  const readme = path.join(ROOT, 'README.md');
  const contrib = path.join(ROOT, 'CONTRIBUTING.md');
  const claude = path.join(ROOT, 'CLAUDE.md');
  const history = path.join(ROOT, 'docs', 'HISTORY.md');
  const files = [readme, contrib, claude, history];
  const present = files.filter(f => fs.existsSync(f)).length;
  return { value: present / files.length, observed: present, notes: `${present}/${files.length} key docs present` };
}

function metricAccessibility() {
  // Placeholder — would require axe-cli run. For now: check if @axe-core is in devDeps.
  const pkg = readJson(path.join(ROOT, 'package.json'));
  if (!pkg) return { value: 0, observed: 0, notes: 'no package.json' };
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const hasAxe = Object.keys(allDeps).some(k => k.includes('axe'));
  return { value: hasAxe ? 0.5 : 0, observed: hasAxe, notes: hasAxe ? 'axe installed (run required)' : 'no a11y tooling' };
}

function metricWorkerUptime() {
  // Reads automa/state/worker-probe-latest.json (written by scripts/worker-probe.sh).
  // ok_rate = count(ok=true) / count(total). Returns 0 if file missing or malformed.
  const probePath = path.join(STATE_DIR, 'worker-probe-latest.json');
  if (!fs.existsSync(probePath)) {
    return { value: 0, observed: 0, notes: 'worker-probe-latest.json not found — run scripts/worker-probe.sh' };
  }
  try {
    const raw = fs.readFileSync(probePath, 'utf8').trim();
    const entries = JSON.parse(raw);
    if (!Array.isArray(entries) || entries.length === 0) {
      return { value: 0, observed: 0, notes: 'probe file empty or non-array' };
    }
    const okCount = entries.filter((e) => e && e.ok === true).length;
    const rate = okCount / entries.length;
    return {
      value: rate,
      observed: okCount,
      total: entries.length,
      notes: `ok_rate from last probe: ${okCount}/${entries.length}`
    };
  } catch (e) {
    return { value: 0, observed: 0, notes: `probe parse error: ${e.message}` };
  }
}

// ───────────────────────────────────────────────────────────────
// SCORING
// ───────────────────────────────────────────────────────────────

const METRICS = {
  test_count:          { weight: 0.15, target: 14000, fn: metricTestCount,        normalize: v => Math.min(10, (v / 14000) * 10) },
  build_size_kb:       { weight: 0.05, target: 3500,  fn: metricBuildSize,        normalize: v => v === 0 ? 0 : Math.max(0, Math.min(10, 10 - ((v - 3500) / 500))) },
  e2e_pass_rate:       { weight: 0.15, target: 0.95,  fn: metricE2EPassRate,      normalize: v => v * 10 },
  volume_ref_coverage: { weight: 0.15, target: 92,    fn: metricVolumeRefCoverage, normalize: v => (v / 92) * 10 },
  dashboard_live:      { weight: 0.05, target: 1,     fn: metricDashboardLiveData, normalize: v => v * 10 },
  unlim_latency_p95:   { weight: 0.10, target: 3000,  fn: metricUnlimLatencyP95,   normalize: v => v === 0 ? 0 : Math.max(0, Math.min(10, 10 - ((v - 3000) / 500))) },
  git_hygiene:         { weight: 0.05, target: 0.9,   fn: metricGitHygiene,        normalize: v => v * 10 },
  documentation:       { weight: 0.10, target: 1.0,   fn: metricDocumentation,     normalize: v => v * 10 },
  accessibility_wcag:  { weight: 0.10, target: 1.0,   fn: metricAccessibility,     normalize: v => v * 10 },
  worker_uptime:       { weight: 0.10, target: 0.99,  fn: metricWorkerUptime,      normalize: v => v * 10 },
};

function runBenchmark() {
  const results = {};
  let totalScore = 0;

  for (const [key, { weight, target, fn, normalize }] of Object.entries(METRICS)) {
    process.stderr.write(`[bench] ${key}... `);
    const start = Date.now();
    let measurement;
    try {
      measurement = fn();
    } catch (e) {
      measurement = { value: 0, observed: 'error', notes: e.message };
    }
    const normalized = Math.max(0, Math.min(10, normalize(measurement.value)));
    const contribution = normalized * weight;
    totalScore += contribution;
    results[key] = {
      ...measurement,
      weight,
      target,
      normalized: Math.round(normalized * 100) / 100,
      contribution: Math.round(contribution * 100) / 100,
    };
    process.stderr.write(`${measurement.value} → ${normalized.toFixed(2)}/10 (+${contribution.toFixed(2)}) in ${Date.now() - start}ms\n`);
  }

  const output = {
    timestamp: new Date().toISOString(),
    mode: FAST_MODE ? 'fast' : 'full',
    score: Math.round(totalScore * 100) / 100,
    score_out_of: 10,
    metrics: results,
    commit_sha: safeExec('git rev-parse HEAD').trim(),
    branch: safeExec('git branch --show-current').trim(),
  };

  // Compare with previous
  const previous = readJson(OUT_FILE);
  if (previous) {
    output.previous_score = previous.score;
    output.delta = Math.round((output.score - previous.score) * 100) / 100;
  }

  return output;
}

// ───────────────────────────────────────────────────────────────
// MAIN
// ───────────────────────────────────────────────────────────────

const result = runBenchmark();
console.log(JSON.stringify(result, null, 2));

if (WRITE_MODE) {
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(result, null, 2));
  process.stderr.write(`\n[bench] written to ${OUT_FILE}\n`);
}

process.stderr.write(`\n[bench] FINAL SCORE: ${result.score}/10${result.delta !== undefined ? ` (delta: ${result.delta >= 0 ? '+' : ''}${result.delta})` : ''}\n`);
