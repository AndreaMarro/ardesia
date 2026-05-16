#!/usr/bin/env node
/**
 * ELAB Quality Harness Phase 1 — Promptfoo Runner Orchestrator
 * iter 70 Team E — 2026-05-19
 *
 * Sources ELAB_API_KEY from ~/.elab-credentials/elab-keys.env
 * Runs 30 Promptfoo cases against prod Edge Function unlim-chat
 * Aggregates results to docs/audits/2026-05-19-iter-70-promptfoo-results.json
 *
 * Usage:
 *   node scripts/quality-harness/run-promptfoo.mjs
 *   node scripts/quality-harness/run-promptfoo.mjs --dry-run
 *   node scripts/quality-harness/run-promptfoo.mjs --output /tmp/custom-results.json
 */

import { execSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const CONFIG_PATH = resolve(__dirname, 'promptfoo-config.yaml');
const OUTPUT_DIR = resolve(REPO_ROOT, 'docs/audits');
const OUTPUT_FILE = resolve(OUTPUT_DIR, '2026-05-19-iter-70-promptfoo-results.json');
const EXECUTION_NOTES_FILE = resolve(OUTPUT_DIR, '2026-05-19-iter-70-quality-harness-EXECUTION-NOTES.md');

// Parse CLI args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const outputIndex = args.indexOf('--output');
const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : OUTPUT_FILE;
const timeoutMs = 300_000; // 5 minutes max for all 30 cases

// ----------------------------------------------------------------
// 1. Load env from ~/.elab-credentials/elab-keys.env
// ----------------------------------------------------------------

function loadElabCredentials() {
  const envFile = resolve(os.homedir(), '.elab-credentials/elab-keys.env');
  const env = { ...process.env };

  if (existsSync(envFile)) {
    const lines = readFileSync(envFile, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || !trimmed) continue;
      const exportMatch = trimmed.match(/^export\s+(\w+)=(.*)$/);
      if (exportMatch) {
        const [, key, value] = exportMatch;
        // Strip surrounding quotes if present
        const clean = value.replace(/^["']|["']$/g, '').trim();
        env[key] = clean;
      }
    }
    console.log('[promptfoo-runner] Loaded ELAB_API_KEY from ~/.elab-credentials/elab-keys.env');
  } else {
    console.warn('[promptfoo-runner] WARNING: ~/.elab-credentials/elab-keys.env not found');
    console.warn('[promptfoo-runner] Set ELAB_API_KEY manually or provide the file');
  }

  // Also try /tmp/vercel.env as fallback
  const vercelEnv = '/tmp/vercel.env';
  if (!env.SUPABASE_ANON_KEY && existsSync(vercelEnv)) {
    const lines = readFileSync(vercelEnv, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || !trimmed) continue;
      const exportMatch = trimmed.match(/^export\s+(\w+)=(.*)$/);
      if (exportMatch) {
        const [, key, value] = exportMatch;
        const clean = value.replace(/^["']|["']$/g, '').trim();
        if (!env[key]) env[key] = clean;
      }
    }
  }

  return env;
}

// ----------------------------------------------------------------
// 2. Validate prerequisites
// ----------------------------------------------------------------

function validatePrereqs(env) {
  const issues = [];

  if (!env.ELAB_API_KEY) {
    issues.push('ELAB_API_KEY not set — Edge Function calls will fail with 401');
  }

  if (!existsSync(CONFIG_PATH)) {
    issues.push(`Promptfoo config not found: ${CONFIG_PATH}`);
  }

  return issues;
}

// ----------------------------------------------------------------
// 3. Run promptfoo via npx (no global install required)
// ----------------------------------------------------------------

function buildPromptfooArgs(outputJsonPath) {
  const args = [
    'promptfoo@latest',
    'eval',
    '--config', CONFIG_PATH,
    '--output', outputJsonPath,
    '--no-cache',
    '--max-concurrency', '2',
  ];
  return args;
}

async function runPromptfoo(env, outputJsonPath) {
  return new Promise((resolve, reject) => {
    const args = buildPromptfooArgs(outputJsonPath);

    console.log(`[promptfoo-runner] Running: npx ${args.join(' ')}`);

    const child = spawn('npx', args, {
      cwd: REPO_ROOT,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => {
      stdout += d.toString();
      process.stdout.write(d);
    });

    child.stderr.on('data', (d) => {
      stderr += d.toString();
      process.stderr.write(d);
    });

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Promptfoo timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve({ stdout, stderr, exitCode: code });
      } else {
        resolve({ stdout, stderr, exitCode: code, error: `Non-zero exit: ${code}` });
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

// ----------------------------------------------------------------
// 4. Parse and aggregate raw Promptfoo output JSON
// ----------------------------------------------------------------

function parsePromptfooResults(rawPath) {
  if (!existsSync(rawPath)) {
    return null;
  }

  const raw = JSON.parse(readFileSync(rawPath, 'utf-8'));

  const results = {
    generatedAt: new Date().toISOString(),
    evalId: raw.evalId || 'unknown',
    totalTests: 0,
    passed: 0,
    failed: 0,
    passRate: 0,
    categories: {
      plurale_ragazzi: { total: 0, passed: 0 },
      vol_pag_citation: { total: 0, passed: 0 },
      offtopic_redirect: { total: 0, passed: 0 },
    },
    metrics: {},
    failedTests: [],
    config: {
      provider: 'elab-unlim-edge',
      configPath: CONFIG_PATH,
    },
  };

  const testResults = raw.results || raw.table?.body || [];
  for (const result of testResults) {
    const desc = result.description || result.vars?.prompt || '';
    const passed = result.success !== false && result.passed !== false;
    const metrics = result.metrics || result.assertions || [];

    results.totalTests++;
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
      results.failedTests.push({
        description: desc,
        prompt: result.vars?.prompt || '',
        output: (result.response?.output || '').substring(0, 300),
        failedAssertions: Array.isArray(metrics)
          ? metrics.filter((m) => !m.pass).map((m) => m.type || m.metric)
          : [],
      });
    }

    // Category bucketing by description prefix
    if (desc.startsWith('A') || desc.includes('plurale')) {
      results.categories.plurale_ragazzi.total++;
      if (passed) results.categories.plurale_ragazzi.passed++;
    } else if (desc.startsWith('B') || desc.includes('volpag')) {
      results.categories.vol_pag_citation.total++;
      if (passed) results.categories.vol_pag_citation.passed++;
    } else if (desc.startsWith('C') || desc.includes('offtopic')) {
      results.categories.offtopic_redirect.total++;
      if (passed) results.categories.offtopic_redirect.passed++;
    }
  }

  results.passRate = results.totalTests > 0
    ? Math.round((results.passed / results.totalTests) * 1000) / 10
    : 0;

  // Category pass rates
  for (const [cat, data] of Object.entries(results.categories)) {
    data.passRate = data.total > 0
      ? Math.round((data.passed / data.total) * 1000) / 10
      : null;
  }

  return results;
}

// ----------------------------------------------------------------
// 5. Write execution notes if env blocks or partial results
// ----------------------------------------------------------------

function writeExecutionNotes(notes) {
  mkdirSync(dirname(EXECUTION_NOTES_FILE), { recursive: true });

  const content = [
    '# ELAB Quality Harness Phase 1 — Execution Notes',
    `Generated: ${new Date().toISOString()}`,
    `Branch: feat/iter-70-team-E-quality-harness`,
    '',
    '## Promptfoo Run Notes',
    '',
    ...notes.map((n) => `- ${n}`),
    '',
    '## Environment Status',
    `- ELAB_API_KEY: ${process.env.ELAB_API_KEY ? 'SET (length=' + process.env.ELAB_API_KEY.length + ')' : 'MISSING'}`,
    `- SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING (may cause 401)'}`,
    `- Config: ${CONFIG_PATH}`,
    '',
    '## How to Run',
    '```bash',
    'source ~/.elab-credentials/elab-keys.env',
    'node scripts/quality-harness/run-promptfoo.mjs',
    '```',
    '',
    '## Deferred Env Requirements',
    '- ELAB_API_KEY: Vercel → Project → Env Variables → VITE_ELAB_API_KEY Production',
    '- SUPABASE_ANON_KEY: Supabase Dashboard → Project Settings → API → anon key',
  ].join('\n');

  writeFileSync(EXECUTION_NOTES_FILE, content, 'utf-8');
  console.log(`[promptfoo-runner] Execution notes written: ${EXECUTION_NOTES_FILE}`);
}

// ----------------------------------------------------------------
// 6. Build aggregated output JSON
// ----------------------------------------------------------------

function buildFinalOutput(runResult, parsedResults, issues) {
  return {
    tool: 'promptfoo',
    version: 'latest',
    generatedAt: new Date().toISOString(),
    branch: 'feat/iter-70-team-E-quality-harness',
    configPath: CONFIG_PATH,
    targetUrl: 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat',
    categories: ['plurale_ragazzi (10)', 'vol_pag_citation (10)', 'offtopic_redirect (10)'],
    executionStatus: runResult?.exitCode === 0 ? 'success' : (runResult?.error ? 'error' : 'partial'),
    prereqIssues: issues,
    results: parsedResults || {
      note: 'Results not parsed — see executionStatus for details',
      rawStdout: (runResult?.stdout || '').substring(0, 2000),
    },
    honestyCaveats: [
      'Promptfoo requires npx (Node 18+) — first run may download package',
      'ELAB_API_KEY must be valid prod key or all calls return 401',
      'SUPABASE_ANON_KEY needed for Bearer header on Edge Function',
      'Network timeouts may occur if Render cold-start is slow (>15s)',
      'Results are per-session — sessionId includes eval run ID to avoid cross-contamination',
    ],
  };
}

// ----------------------------------------------------------------
// MAIN
// ----------------------------------------------------------------

async function main() {
  console.log('[promptfoo-runner] ELAB Quality Harness Phase 1 — Promptfoo 30 cases');
  console.log(`[promptfoo-runner] Config: ${CONFIG_PATH}`);
  console.log(`[promptfoo-runner] Output: ${outputFile}`);

  // Load env
  const env = loadElabCredentials();
  // Apply to process.env for child process inheritance
  Object.assign(process.env, env);

  // Validate
  const issues = validatePrereqs(env);
  if (issues.length > 0) {
    console.warn('[promptfoo-runner] Prerequisite issues:');
    issues.forEach((i) => console.warn(`  - ${i}`));
  }

  if (isDryRun) {
    console.log('[promptfoo-runner] DRY RUN — skipping actual execution');
    const dryOutput = buildFinalOutput(
      { exitCode: 0, stdout: 'DRY RUN', stderr: '' },
      null,
      issues
    );
    dryOutput.executionStatus = 'dry_run';
    mkdirSync(OUTPUT_DIR, { recursive: true });
    writeFileSync(outputFile, JSON.stringify(dryOutput, null, 2), 'utf-8');
    writeExecutionNotes(['DRY RUN — no actual promptfoo execution', ...issues]);
    console.log('[promptfoo-runner] Dry run complete');
    return;
  }

  // Temp file for raw Promptfoo output
  const tmpOutput = `/tmp/pf-iter70-${Date.now()}.json`;
  let runResult = null;
  let parsedResults = null;

  try {
    runResult = await runPromptfoo(env, tmpOutput);
    console.log(`[promptfoo-runner] Promptfoo exit code: ${runResult.exitCode}`);
  } catch (err) {
    console.error('[promptfoo-runner] Promptfoo execution error:', err.message);
    runResult = { exitCode: -1, stdout: '', stderr: err.message, error: err.message };
    issues.push(`Execution error: ${err.message}`);
  }

  // Parse results if available
  if (existsSync(tmpOutput)) {
    try {
      parsedResults = parsePromptfooResults(tmpOutput);
      if (parsedResults) {
        console.log(`[promptfoo-runner] Results: ${parsedResults.passed}/${parsedResults.totalTests} PASS (${parsedResults.passRate}%)`);
        console.log('[promptfoo-runner] Categories:');
        for (const [cat, data] of Object.entries(parsedResults.categories)) {
          if (data.total > 0) {
            console.log(`  - ${cat}: ${data.passed}/${data.total} (${data.passRate}%)`);
          }
        }
      }
    } catch (parseErr) {
      console.warn('[promptfoo-runner] Could not parse results JSON:', parseErr.message);
      issues.push(`Parse error: ${parseErr.message}`);
    }
  } else {
    issues.push('Promptfoo did not produce output JSON — check stderr for details');
  }

  // Write final aggregated output
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const finalOutput = buildFinalOutput(runResult, parsedResults, issues);
  writeFileSync(outputFile, JSON.stringify(finalOutput, null, 2), 'utf-8');
  console.log(`[promptfoo-runner] Aggregated results written: ${outputFile}`);

  // Write execution notes if there were issues
  if (issues.length > 0 || runResult?.exitCode !== 0) {
    writeExecutionNotes([
      `Exit code: ${runResult?.exitCode}`,
      ...issues,
      parsedResults
        ? `Pass rate: ${parsedResults.passRate}% (${parsedResults.passed}/${parsedResults.totalTests})`
        : 'No results parsed',
    ]);
  }

  // Summary
  if (parsedResults) {
    console.log(`\n[promptfoo-runner] SUMMARY:`);
    console.log(`  Total: ${parsedResults.totalTests} tests`);
    console.log(`  Pass:  ${parsedResults.passed} (${parsedResults.passRate}%)`);
    console.log(`  Fail:  ${parsedResults.failed}`);
    if (parsedResults.passRate < 70) {
      console.warn(`\n[promptfoo-runner] WARNING: Pass rate ${parsedResults.passRate}% below 70% threshold`);
    }
  }
}

main().catch((err) => {
  console.error('[promptfoo-runner] Fatal error:', err);
  process.exit(1);
});
