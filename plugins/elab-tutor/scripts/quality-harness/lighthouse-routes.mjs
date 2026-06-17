#!/usr/bin/env node
/**
 * ELAB Quality Harness Phase 1 — Lighthouse CI Runner
 * iter 70 Team E — 2026-05-19
 *
 * Runs Lighthouse on 8 ELAB routes via npx (no global install)
 * Aggregates scores to docs/audits/2026-05-19-iter-70-lighthouse-baseline.json
 *
 * Routes:
 *   / (homepage)
 *   /#lavagna
 *   /#tutor
 *   /#chatbot-only
 *   /#dashboard
 *   /#glossario
 *   /#about-easter
 *   /#docente
 *
 * Usage:
 *   node scripts/quality-harness/lighthouse-routes.mjs
 *   node scripts/quality-harness/lighthouse-routes.mjs --dry-run
 *   BASE_URL=http://localhost:5173 node scripts/quality-harness/lighthouse-routes.mjs
 */

import { execFile } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const OUTPUT_DIR = resolve(REPO_ROOT, 'docs/audits');
const OUTPUT_FILE = resolve(OUTPUT_DIR, '2026-05-19-iter-70-lighthouse-baseline.json');
const EXECUTION_NOTES_FILE = resolve(OUTPUT_DIR, '2026-05-19-iter-70-quality-harness-EXECUTION-NOTES.md');

const BASE_URL = process.env.BASE_URL || 'https://www.elabtutor.school';
const TIMEOUT_PER_ROUTE_MS = 120_000; // 2 minutes per route

// 8 routes to test
const ROUTES = [
  { path: '/', label: 'homepage', description: 'Homepage / landing page' },
  { path: '/#lavagna', label: 'lavagna', description: 'Lavagna interattiva multimediale' },
  { path: '/#tutor', label: 'tutor', description: 'Tutor AI UNLIM chat interface' },
  { path: '/#chatbot-only', label: 'chatbot-only', description: 'Chatbot-only mode (ChatGPT-style)' },
  { path: '/#dashboard', label: 'dashboard', description: 'Dashboard docente' },
  { path: '/#glossario', label: 'glossario', description: 'Glossario Tea embedded' },
  { path: '/#about-easter', label: 'about-easter', description: 'Easter modal scimpanzé mode' },
  { path: '/#docente', label: 'docente', description: 'Docente/teacher mode' },
];

const isDryRun = process.argv.includes('--dry-run');

// ----------------------------------------------------------------
// Parse Lighthouse JSON report
// ----------------------------------------------------------------

function parseLighthouseReport(reportPath) {
  if (!existsSync(reportPath)) return null;

  let raw;
  try {
    raw = JSON.parse(readFileSync(reportPath, 'utf-8'));
  } catch (e) {
    return { error: `JSON parse error: ${e.message}` };
  }

  const categories = raw.categories || {};
  const audits = raw.audits || {};

  const scores = {
    performance: Math.round((categories.performance?.score ?? 0) * 100),
    accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((categories['best-practices']?.score ?? 0) * 100),
    seo: Math.round((categories.seo?.score ?? 0) * 100),
    pwa: Math.round((categories.pwa?.score ?? 0) * 100),
  };

  // Extract top 3 performance issues (lowest-score audits)
  const perfAudits = Object.entries(audits)
    .filter(([, a]) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'notApplicable' && a.scoreDisplayMode !== 'informative')
    .sort(([, a], [, b]) => (a.score ?? 0) - (b.score ?? 0))
    .slice(0, 5)
    .map(([id, a]) => ({
      id,
      title: a.title,
      score: Math.round((a.score ?? 0) * 100),
      displayValue: a.displayValue || '',
      description: (a.description || '').substring(0, 150),
    }));

  // Core Web Vitals
  const webVitals = {
    lcp: audits['largest-contentful-paint']?.displayValue || null,
    fcp: audits['first-contentful-paint']?.displayValue || null,
    cls: audits['cumulative-layout-shift']?.displayValue || null,
    tbt: audits['total-blocking-time']?.displayValue || null,
    si: audits['speed-index']?.displayValue || null,
    tti: audits['interactive']?.displayValue || null,
  };

  return {
    scores,
    webVitals,
    topIssues: perfAudits,
    requestedUrl: raw.requestedUrl || '',
    finalUrl: raw.finalUrl || '',
    fetchTime: raw.fetchTime || '',
    lighthouseVersion: raw.lighthouseVersion || '',
    userAgent: raw.environment?.hostUserAgent || '',
  };
}

// ----------------------------------------------------------------
// Run Lighthouse on a single URL via npx
// ----------------------------------------------------------------

async function runLighthouseOnRoute(route) {
  const url = `${BASE_URL}${route.path}`;
  const tmpOutput = `/tmp/lh-iter70-${route.label}-${Date.now()}.json`;

  console.log(`[lighthouse] Running: ${url}`);

  const lighthouseArgs = [
    'lighthouse@latest',
    url,
    '--output=json',
    `--output-path=${tmpOutput}`,
    '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--quiet',
  ];

  return new Promise((resolve) => {
    const start = Date.now();
    const child = execFile('npx', lighthouseArgs, {
      cwd: REPO_ROOT,
      timeout: TIMEOUT_PER_ROUTE_MS,
      env: { ...process.env, PATH: process.env.PATH },
    }, (error, stdout, stderr) => {
      const elapsed = Date.now() - start;
      const result = {
        route: route.label,
        url,
        description: route.description,
        elapsedMs: elapsed,
        exitCode: error ? (error.code || -1) : 0,
        error: error ? error.message : null,
        report: null,
      };

      if (existsSync(tmpOutput)) {
        result.report = parseLighthouseReport(tmpOutput);
        try { unlinkSync(tmpOutput); } catch (_) {}
      } else if (error) {
        result.error = `Lighthouse failed: ${error.message}. stderr: ${stderr.substring(0, 500)}`;
      }

      if (result.report?.scores) {
        const s = result.report.scores;
        console.log(`[lighthouse] ${route.label}: perf=${s.performance} a11y=${s.accessibility} bp=${s.bestPractices} seo=${s.seo}`);
      } else {
        console.warn(`[lighthouse] ${route.label}: no scores — ${result.error || 'unknown error'}`);
      }

      resolve(result);
    });
  });
}

// ----------------------------------------------------------------
// Build summary statistics across all routes
// ----------------------------------------------------------------

function buildSummary(routeResults) {
  const successful = routeResults.filter((r) => r.report?.scores);

  if (successful.length === 0) {
    return { note: 'No successful Lighthouse runs', totalRoutes: routeResults.length };
  }

  const avg = (key) => {
    const vals = successful.map((r) => r.report.scores[key]).filter((v) => v != null);
    return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  };

  const min = (key) => {
    const vals = successful.map((r) => r.report.scores[key]).filter((v) => v != null);
    return vals.length > 0 ? Math.min(...vals) : null;
  };

  // Collect all top issues across routes
  const allIssues = {};
  for (const r of successful) {
    for (const issue of (r.report?.topIssues || [])) {
      if (!allIssues[issue.id]) {
        allIssues[issue.id] = { ...issue, affectedRoutes: [] };
      }
      allIssues[issue.id].affectedRoutes.push(r.route);
    }
  }

  // Sort by number of affected routes desc, then score asc
  const topGlobalIssues = Object.values(allIssues)
    .sort((a, b) => b.affectedRoutes.length - a.affectedRoutes.length || a.score - b.score)
    .slice(0, 10);

  return {
    totalRoutes: routeResults.length,
    successfulRoutes: successful.length,
    failedRoutes: routeResults.length - successful.length,
    averageScores: {
      performance: avg('performance'),
      accessibility: avg('accessibility'),
      bestPractices: avg('bestPractices'),
      seo: avg('seo'),
    },
    minScores: {
      performance: min('performance'),
      accessibility: min('accessibility'),
      bestPractices: min('bestPractices'),
      seo: min('seo'),
    },
    top3PerfIssues: topGlobalIssues.slice(0, 3),
    topGlobalIssues,
    worstPerformanceRoutes: successful
      .sort((a, b) => a.report.scores.performance - b.report.scores.performance)
      .slice(0, 3)
      .map((r) => ({ route: r.route, score: r.report.scores.performance, url: r.url })),
  };
}

// ----------------------------------------------------------------
// MAIN
// ----------------------------------------------------------------

async function main() {
  console.log('[lighthouse] ELAB Quality Harness Phase 1 — Lighthouse 8 routes');
  console.log(`[lighthouse] Base URL: ${BASE_URL}`);
  console.log(`[lighthouse] Output: ${OUTPUT_FILE}`);

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const output = {
    tool: 'lighthouse',
    generatedAt: new Date().toISOString(),
    branch: 'feat/iter-70-team-E-quality-harness',
    baseUrl: BASE_URL,
    routes: ROUTES.map((r) => r.label),
    executionStatus: 'pending',
    summary: null,
    routeResults: [],
    honestyCaveats: [
      'Hash routes (#lavagna, #tutor etc) are SPA client-side — Lighthouse sees initial HTML load, not post-hydration state',
      'Performance scores reflect prod Vercel CDN + Edge Function cold start latency',
      'PWA category omitted (slow and not critical for this baseline)',
      'Headless Chrome may have different rendering characteristics than real Chrome',
      'Scores vary ±5-10 points between runs due to network/CPU variance',
    ],
  };

  if (isDryRun) {
    console.log('[lighthouse] DRY RUN — skipping actual execution');
    output.executionStatus = 'dry_run';
    output.summary = { note: 'Dry run — no actual Lighthouse execution' };
    writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`[lighthouse] Dry run output written: ${OUTPUT_FILE}`);
    return;
  }

  // Run routes sequentially (Lighthouse spawns Chrome, parallel causes issues)
  const routeResults = [];
  for (const route of ROUTES) {
    try {
      const result = await runLighthouseOnRoute(route);
      routeResults.push(result);
    } catch (err) {
      console.error(`[lighthouse] Unexpected error on ${route.label}:`, err.message);
      routeResults.push({
        route: route.label,
        url: `${BASE_URL}${route.path}`,
        description: route.description,
        exitCode: -1,
        error: err.message,
        report: null,
      });
    }
  }

  output.routeResults = routeResults;
  output.summary = buildSummary(routeResults);
  output.executionStatus = routeResults.some((r) => r.report?.scores) ? 'success' : 'failed';

  // Print summary
  if (output.summary.averageScores) {
    const s = output.summary.averageScores;
    console.log('\n[lighthouse] SUMMARY (avg across successful routes):');
    console.log(`  Performance:   ${s.performance}`);
    console.log(`  Accessibility: ${s.accessibility}`);
    console.log(`  Best Practices:${s.bestPractices}`);
    console.log(`  SEO:           ${s.seo}`);

    if (output.summary.top3PerfIssues?.length > 0) {
      console.log('\n[lighthouse] Top 3 performance issues:');
      for (const issue of output.summary.top3PerfIssues) {
        console.log(`  - ${issue.id} (score: ${issue.score}, routes: ${issue.affectedRoutes.join(', ')})`);
      }
    }
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n[lighthouse] Aggregated baseline written: ${OUTPUT_FILE}`);

  // Write execution notes if runs failed
  const failedRoutes = routeResults.filter((r) => !r.report?.scores);
  if (failedRoutes.length > 0) {
    const notes = failedRoutes.map((r) => `Route ${r.route} FAILED: ${r.error || 'no report generated'}`);
    appendExecutionNotes(notes);
  }
}

function appendExecutionNotes(notes) {
  const timestamp = new Date().toISOString();
  const content = [
    '',
    '## Lighthouse Run Notes',
    `Timestamp: ${timestamp}`,
    '',
    ...notes.map((n) => `- ${n}`),
    '',
    '## How to Run Lighthouse',
    '```bash',
    'node scripts/quality-harness/lighthouse-routes.mjs',
    '# Or with local dev server:',
    'BASE_URL=http://localhost:5173 node scripts/quality-harness/lighthouse-routes.mjs',
    '```',
    '',
    '## Lighthouse Requirements',
    '- Chrome/Chromium must be installed (used by Lighthouse)',
    '- npx available (Node 18+)',
    '- Network access to www.elabtutor.school',
  ].join('\n');

  if (existsSync(EXECUTION_NOTES_FILE)) {
    const existing = readFileSync(EXECUTION_NOTES_FILE, 'utf-8');
    writeFileSync(EXECUTION_NOTES_FILE, existing + '\n' + content, 'utf-8');
  } else {
    mkdirSync(dirname(EXECUTION_NOTES_FILE), { recursive: true });
    writeFileSync(EXECUTION_NOTES_FILE, `# ELAB Quality Harness Phase 1 — Execution Notes\n\n${content}`, 'utf-8');
  }
}

main().catch((err) => {
  console.error('[lighthouse] Fatal error:', err);
  process.exit(1);
});
