#!/usr/bin/env node
/**
 * harness-2.0/runner.mjs — Sprint T iter 19 (Andrea mandate critical UNO PER UNO)
 *
 * Orchestrator for ELAB Tutor 92-experiment golden-state regression harness.
 *
 * SCOPE:
 *   - Enumerate src/data/lesson-paths/v*.json (target ~92 esperimenti).
 *   - Per esperimento, sequentially (UNO PER UNO loop):
 *       1. load lesson-path JSON
 *       2. simulate via avr8js mock (lightweight stub iter 19)
 *       3. tutor turn (mock UNLIM call iter 19, real iter 21+ with Edge Function)
 *       4. diagnose (PZ + safety guard placeholder)
 *       5. screenshot (mock filesystem write iter 19)
 *       6. compare against golden state (tests/fixtures/harness-2.0-golden/<id>.json)
 *   - Emit JSON results: automa/state/iter-19-harness-2.0-results.json
 *   - Emit Markdown report: docs/audits/iter-19-harness-2.0-report-DRAFT.md
 *
 * MANDATE iter 18 false-positive (Object.keys() loop):
 *   - This runner uses an EXPLICIT for-of over an array enumerate first via fs.readdirSync.
 *   - Each experiment validated INDIVIDUALLY (no bulk truthy-check on Object.keys).
 *
 * ITER 19 LIMITS:
 *   - Simulate/tutor/diagnose stubs (return mock results).
 *   - Golden directory paths referenced but NOT created here (tests/fixtures/harness-2.0-golden/).
 *   - NO Playwright launch yet (preflight infrastructure validation only).
 *
 * ITER 21+ ACTIVE:
 *   - Real avr8js simulation via @wokwi/avr8js or local emulator.
 *   - Real Edge Function unlim-chat call per turn.
 *   - Real Playwright captureScreenshot.
 *   - Real golden state comparison (deep object diff).
 *
 * (c) Andrea Marro 2026-04-28 — ELAB Tutor
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

// ────────────────────────────────────────────────────────────────────────────
// Paths (absolute, repo-rooted)
// ────────────────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..', '..');
const LESSON_PATHS_DIR = join(REPO_ROOT, 'src', 'data', 'lesson-paths');
const GOLDEN_DIR = join(REPO_ROOT, 'tests', 'fixtures', 'harness-2.0-golden');
const OUTPUT_JSON = join(REPO_ROOT, 'automa', 'state', 'iter-19-harness-2.0-results.json');
const OUTPUT_MD = join(REPO_ROOT, 'docs', 'audits', 'iter-19-harness-2.0-report-DRAFT.md');

// ────────────────────────────────────────────────────────────────────────────
// Logger
// ────────────────────────────────────────────────────────────────────────────

const TS = () => new Date().toISOString();
const log = (lvl, msg, extra) => {
  const line = `[${TS()}] [${lvl}] ${msg}` + (extra ? ` ${JSON.stringify(extra)}` : '');
  process.stdout.write(line + '\n');
};

// ────────────────────────────────────────────────────────────────────────────
// Step 1: enumerate experiments
// ────────────────────────────────────────────────────────────────────────────

function enumerateLessonPaths() {
  if (!existsSync(LESSON_PATHS_DIR)) {
    throw new Error(`lesson-paths dir missing: ${LESSON_PATHS_DIR}`);
  }
  const files = readdirSync(LESSON_PATHS_DIR);
  // Filter v<num>-cap<num>-esp<num>.json pattern (lesson-paths convention)
  const pattern = /^v\d+-cap\d+-esp\d+\.json$/;
  const matched = files.filter(f => pattern.test(f));
  matched.sort(); // deterministic ordering
  return matched.map(f => ({
    id: f.replace(/\.json$/, ''),
    path: join(LESSON_PATHS_DIR, f),
  }));
}

// ────────────────────────────────────────────────────────────────────────────
// Step 2: load + minimally validate
// ────────────────────────────────────────────────────────────────────────────

function loadExperiment(entry) {
  const raw = readFileSync(entry.path, 'utf-8');
  const data = JSON.parse(raw);
  // Basic shape validation: experiment_id present (or fallback to filename id)
  if (!data || typeof data !== 'object') {
    return { ok: false, reason: 'parse: not an object', data: null };
  }
  const id = data.experiment_id || entry.id;
  return { ok: true, id, data };
}

// ────────────────────────────────────────────────────────────────────────────
// Step 3: simulate (avr8js mock iter 19)
// ────────────────────────────────────────────────────────────────────────────

async function simulateExperiment(_loaded) {
  // STUB iter 19: real impl iter 21+ uses avr8js + CircuitSolver headless.
  // Returns deterministic mock simulation tick count + serialOutput placeholder.
  return { ticks: 1000, serialOutput: '', pinStates: {}, simStub: true };
}

// ────────────────────────────────────────────────────────────────────────────
// Step 4: tutor turn (mock UNLIM iter 19)
// ────────────────────────────────────────────────────────────────────────────

async function tutorTurn(loaded, simResult) {
  // STUB iter 19: real impl iter 21+ calls Edge Function unlim-chat with
  // experiment context + RAG retrieval + builds plurale "Ragazzi," response.
  const objective = loaded.data?.objective || 'obiettivo non specificato';
  const text = `Ragazzi, vediamo l'esperimento ${loaded.id}: ${objective.slice(0, 60)}.`;
  return { text, tutorStub: true, simTicks: simResult.ticks };
}

// ────────────────────────────────────────────────────────────────────────────
// Step 5: diagnose (PZ guard placeholder iter 19)
// ────────────────────────────────────────────────────────────────────────────

function diagnoseTurn(turnResult) {
  // STUB iter 19: real impl iter 21+ wires content-safety-guard.ts +
  // principio-zero-validator.ts checks runtime.
  const text = String(turnResult?.text || '');
  const hasRagazzi = /\bRagazzi\b/.test(text);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return {
    has_ragazzi: hasRagazzi,
    word_count: wordCount,
    pass_basic: hasRagazzi && wordCount > 3 && wordCount < 200,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Step 6: screenshot mock (Playwright iter 21+)
// ────────────────────────────────────────────────────────────────────────────

async function captureScreenshotMock(loaded) {
  // STUB iter 19: production wires Playwright with captureScreenshot helper.
  // Iter 19 returns synthetic placeholder path (no file written).
  return { path: `mock://screenshot/${loaded.id}.png`, captured: true, screenshotStub: true };
}

// ────────────────────────────────────────────────────────────────────────────
// Step 7: compare to golden
// ────────────────────────────────────────────────────────────────────────────

function compareGolden(loaded, results) {
  const goldenPath = join(GOLDEN_DIR, `${loaded.id}.json`);
  if (!existsSync(goldenPath)) {
    return { match: 'no_golden', goldenPath, reason: 'golden fixture not yet authored (iter 21+)' };
  }
  try {
    const golden = JSON.parse(readFileSync(goldenPath, 'utf-8'));
    // Iter 19: shallow checksum comparison on key fields (real impl deep-diff iter 21+)
    const actualKey = `${results.diagnose.has_ragazzi}|${results.diagnose.pass_basic}`;
    const goldenKey = `${golden?.expected?.has_ragazzi}|${golden?.expected?.pass_basic}`;
    return {
      match: actualKey === goldenKey ? 'pass' : 'mismatch',
      goldenPath,
      actualKey, goldenKey,
    };
  } catch (err) {
    return { match: 'error', goldenPath, reason: err?.message || String(err) };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Per-experiment runner (UNO PER UNO)
// ────────────────────────────────────────────────────────────────────────────

async function runOneExperiment(entry, idx, total) {
  const t0 = Date.now();
  log('INFO', `[${idx + 1}/${total}] start ${entry.id}`);
  const loaded = loadExperiment(entry);
  if (!loaded.ok) {
    log('WARN', `[${idx + 1}/${total}] load fail ${entry.id}: ${loaded.reason}`);
    return { id: entry.id, ok: false, stage: 'load', reason: loaded.reason, latency_ms: Date.now() - t0 };
  }
  try {
    const sim = await simulateExperiment(loaded);
    const turn = await tutorTurn(loaded, sim);
    const diag = diagnoseTurn(turn);
    const shot = await captureScreenshotMock(loaded);
    const cmp = compareGolden(loaded, { simulate: sim, turn, diagnose: diag, screenshot: shot });
    const ok = diag.pass_basic && (cmp.match === 'pass' || cmp.match === 'no_golden');
    log(ok ? 'INFO' : 'WARN', `[${idx + 1}/${total}] ${entry.id} → ${ok ? 'pass' : 'fail'} (golden=${cmp.match})`);
    return {
      id: entry.id, ok, stage: ok ? 'complete' : 'compare',
      reason: ok ? null : (cmp.match === 'mismatch' ? 'golden mismatch' : (diag.pass_basic ? null : 'diagnose pass_basic=false')),
      latency_ms: Date.now() - t0,
      simulate: sim, turn, diagnose: diag, screenshot: shot, compare: cmp,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log('ERROR', `[${idx + 1}/${total}] ${entry.id} threw: ${msg}`);
    return { id: entry.id, ok: false, stage: 'exception', reason: msg, latency_ms: Date.now() - t0 };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Output writers
// ────────────────────────────────────────────────────────────────────────────

function ensureDir(p) {
  const d = dirname(p);
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
}

function writeJsonResults(summary) {
  ensureDir(OUTPUT_JSON);
  writeFileSync(OUTPUT_JSON, JSON.stringify(summary, null, 2), 'utf-8');
  log('INFO', `wrote results JSON: ${OUTPUT_JSON}`);
}

function writeMarkdownReport(summary) {
  ensureDir(OUTPUT_MD);
  const lines = [
    '# harness-2.0 iter 19 DRAFT report',
    '',
    `Generated: ${summary.generated_at}`,
    `Total: ${summary.total} | Pass: ${summary.pass} | Fail: ${summary.fail} | Pass rate: ${summary.pass_rate.toFixed(1)}%`,
    '',
    '## Honesty caveats',
    '- Iter 19 = STUB simulate/tutor/diagnose/screenshot. NO real avr8js exec, NO Edge Function call, NO Playwright.',
    '- Golden directory `tests/fixtures/harness-2.0-golden/` referenced but NOT created here (deferred iter 21+).',
    '- "pass" iter 19 = basic shape validation + missing golden treated as no_golden (not failure).',
    '',
    '## Broken experiments',
    summary.broken.length === 0 ? '_none_' : summary.broken.map(b => `- \`${b.id}\` — stage=${b.stage} reason=${b.reason}`).join('\n'),
    '',
    '## All results',
    '| # | id | ok | stage | latency_ms |',
    '|---|----|----|-------|-----------|',
    ...summary.results.map((r, i) => `| ${i + 1} | \`${r.id}\` | ${r.ok ? 'PASS' : 'FAIL'} | ${r.stage} | ${r.latency_ms} |`),
    '',
  ];
  writeFileSync(OUTPUT_MD, lines.join('\n'), 'utf-8');
  log('INFO', `wrote markdown report: ${OUTPUT_MD}`);
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  const startedAt = Date.now();
  log('INFO', 'harness-2.0 iter 19 START');
  log('INFO', `lesson-paths dir: ${LESSON_PATHS_DIR}`);

  const entries = enumerateLessonPaths();
  log('INFO', `enumerated ${entries.length} lesson-path JSON files`);

  if (entries.length === 0) {
    log('WARN', 'no lesson-paths matched pattern v<n>-cap<n>-esp<n>.json — exiting');
    const summary = {
      generated_at: new Date().toISOString(),
      total: 0, pass: 0, fail: 0, pass_rate: 0,
      results: [], broken: [], note: 'no lesson-paths enumerated',
    };
    writeJsonResults(summary);
    writeMarkdownReport(summary);
    return;
  }

  // UNO PER UNO loop — explicit array iteration, NO Object.keys bulk truthy-check
  const results = [];
  for (let i = 0; i < entries.length; i += 1) {
    const r = await runOneExperiment(entries[i], i, entries.length);
    results.push(r);
  }

  const passCount = results.filter(r => r.ok).length;
  const failCount = results.length - passCount;
  const broken = results
    .filter(r => !r.ok)
    .map(r => ({ id: r.id, stage: r.stage, reason: r.reason }));

  const summary = {
    generated_at: new Date().toISOString(),
    runtime_ms: Date.now() - startedAt,
    total: results.length,
    pass: passCount,
    fail: failCount,
    pass_rate: results.length > 0 ? (passCount / results.length) * 100 : 0,
    iter: 19,
    is_stub: true,
    results,
    broken,
  };

  writeJsonResults(summary);
  writeMarkdownReport(summary);

  log('INFO', `harness-2.0 iter 19 DONE total=${summary.total} pass=${summary.pass} fail=${summary.fail} runtime=${summary.runtime_ms}ms`);
}

main().catch(err => {
  log('FATAL', `harness runner crashed: ${err?.message || String(err)}`);
  process.exitCode = 1;
});
