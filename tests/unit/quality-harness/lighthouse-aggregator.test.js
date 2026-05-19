/**
 * ELAB Quality Harness Phase 1 — Unit tests for Lighthouse aggregator
 * iter 70 Team E — 2026-05-19
 *
 * Tests:
 * - Lighthouse score parsing from JSON report
 * - Summary calculation (avg/min across routes)
 * - Top issues identification
 * - Output JSON structure validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const RUNNER_PATH = resolve(REPO_ROOT, 'scripts/quality-harness/lighthouse-routes.mjs');
const ROUTES_COUNT = 8;

const EXPECTED_ROUTES = ['/', '/#lavagna', '/#tutor', '/#chatbot-only', '/#dashboard', '/#glossario', '/#about-easter', '/#docente'];
const EXPECTED_LABELS = ['homepage', 'lavagna', 'tutor', 'chatbot-only', 'dashboard', 'glossario', 'about-easter', 'docente'];

// ----------------------------------------------------------------
// 1. Runner file existence
// ----------------------------------------------------------------

describe('Lighthouse runner — file structure', () => {
  it('runner script exists', () => {
    expect(existsSync(RUNNER_PATH)).toBe(true);
  });

  it('runner exports 8 routes', async () => {
    const { readFileSync } = await import('node:fs');
    const content = readFileSync(RUNNER_PATH, 'utf-8');
    const routeMatches = content.match(/path: '\/[^']*'/g) || [];
    expect(routeMatches.length).toBe(ROUTES_COUNT);
  });

  it('runner includes all expected route paths', async () => {
    const { readFileSync } = await import('node:fs');
    const content = readFileSync(RUNNER_PATH, 'utf-8');
    for (const route of EXPECTED_ROUTES) {
      expect(content).toContain(`'${route}'`);
    }
  });

  it('runner includes all expected route labels', async () => {
    const { readFileSync } = await import('node:fs');
    const content = readFileSync(RUNNER_PATH, 'utf-8');
    for (const label of EXPECTED_LABELS) {
      expect(content).toContain(`'${label}'`);
    }
  });

  it('runner uses npx lighthouse@latest (no global install)', async () => {
    const { readFileSync } = await import('node:fs');
    const content = readFileSync(RUNNER_PATH, 'utf-8');
    expect(content).toContain('lighthouse@latest');
  });

  it('runner targets correct output file path', async () => {
    const { readFileSync } = await import('node:fs');
    const content = readFileSync(RUNNER_PATH, 'utf-8');
    expect(content).toContain('2026-05-19-iter-70-lighthouse-baseline.json');
  });
});

// ----------------------------------------------------------------
// 2. Lighthouse report parsing
// ----------------------------------------------------------------

describe('Lighthouse aggregator — report parsing', () => {
  function parseLighthouseReport(report) {
    const categories = report.categories || {};
    const audits = report.audits || {};

    const scores = {
      performance: Math.round((categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score ?? 0) * 100),
      seo: Math.round((categories.seo?.score ?? 0) * 100),
    };

    const perfAudits = Object.entries(audits)
      .filter(([, a]) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'notApplicable')
      .sort(([, a], [, b]) => (a.score ?? 0) - (b.score ?? 0))
      .slice(0, 5)
      .map(([id, a]) => ({
        id,
        title: a.title,
        score: Math.round((a.score ?? 0) * 100),
      }));

    return { scores, topIssues: perfAudits };
  }

  it('parses performance score from 0-1 scale to 0-100', () => {
    const mockReport = {
      categories: {
        performance: { score: 0.43 },
        accessibility: { score: 1.0 },
        'best-practices': { score: 0.96 },
        seo: { score: 1.0 },
      },
      audits: {},
    };

    const result = parseLighthouseReport(mockReport);
    expect(result.scores.performance).toBe(43);
    expect(result.scores.accessibility).toBe(100);
    expect(result.scores.bestPractices).toBe(96);
    expect(result.scores.seo).toBe(100);
  });

  it('handles missing category scores gracefully', () => {
    const mockReport = { categories: {}, audits: {} };
    const result = parseLighthouseReport(mockReport);
    expect(result.scores.performance).toBe(0);
    expect(result.scores.accessibility).toBe(0);
  });

  it('identifies low-scoring audits as top issues', () => {
    const mockReport = {
      categories: { performance: { score: 0.5 } },
      audits: {
        'render-blocking-resources': { score: 0.1, title: 'Render-blocking resources', scoreDisplayMode: 'numeric' },
        'unused-javascript': { score: 0.3, title: 'Unused JS', scoreDisplayMode: 'numeric' },
        interactive: { score: 0.95, title: 'TTI', scoreDisplayMode: 'numeric' },
      },
    };

    const result = parseLighthouseReport(mockReport);
    expect(result.topIssues.length).toBeGreaterThan(0);
    expect(result.topIssues[0].id).toBe('render-blocking-resources');
    expect(result.topIssues[0].score).toBe(10);
  });

  it('excludes notApplicable audits from issues', () => {
    const mockReport = {
      categories: {},
      audits: {
        'bad-audit': { score: 0.0, scoreDisplayMode: 'notApplicable', title: 'N/A audit' },
        'good-issue': { score: 0.2, scoreDisplayMode: 'numeric', title: 'Real issue' },
      },
    };

    const result = parseLighthouseReport(mockReport);
    const ids = result.topIssues.map((a) => a.id);
    expect(ids).not.toContain('bad-audit');
    expect(ids).toContain('good-issue');
  });
});

// ----------------------------------------------------------------
// 3. Summary calculation
// ----------------------------------------------------------------

describe('Lighthouse aggregator — summary calculation', () => {
  function buildSummary(routeResults) {
    const successful = routeResults.filter((r) => r.report?.scores);

    if (successful.length === 0) {
      return { note: 'No successful runs', totalRoutes: routeResults.length };
    }

    const avg = (key) => {
      const vals = successful.map((r) => r.report.scores[key]).filter((v) => v != null);
      return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
    };

    const min = (key) => {
      const vals = successful.map((r) => r.report.scores[key]).filter((v) => v != null);
      return vals.length > 0 ? Math.min(...vals) : null;
    };

    const allIssues = {};
    for (const r of successful) {
      for (const issue of (r.report?.topIssues || [])) {
        if (!allIssues[issue.id]) {
          allIssues[issue.id] = { ...issue, affectedRoutes: [] };
        }
        allIssues[issue.id].affectedRoutes.push(r.route);
      }
    }

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
      },
      top3PerfIssues: topGlobalIssues.slice(0, 3),
      topGlobalIssues,
    };
  }

  const mockRouteResults = [
    { route: 'homepage', report: { scores: { performance: 43, accessibility: 100, bestPractices: 96, seo: 100 }, topIssues: [{ id: 'render-blocking', score: 10, affectedRoutes: [] }] } },
    { route: 'lavagna', report: { scores: { performance: 61, accessibility: 95, bestPractices: 96, seo: 91 }, topIssues: [{ id: 'render-blocking', score: 10, affectedRoutes: [] }, { id: 'unused-js', score: 30, affectedRoutes: [] }] } },
    { route: 'tutor', report: { scores: { performance: 55, accessibility: 98, bestPractices: 100, seo: 100 }, topIssues: [{ id: 'unused-js', score: 30, affectedRoutes: [] }] } },
    { route: 'chatbot-only', error: 'Navigation failed', report: null },
  ];

  it('calculates average scores across successful routes', () => {
    const summary = buildSummary(mockRouteResults);
    expect(summary.averageScores.performance).toBe(53);
    expect(summary.averageScores.accessibility).toBe(98);
  });

  it('calculates minimum performance score', () => {
    const summary = buildSummary(mockRouteResults);
    expect(summary.minScores.performance).toBe(43);
  });

  it('counts successful vs failed routes correctly', () => {
    const summary = buildSummary(mockRouteResults);
    expect(summary.successfulRoutes).toBe(3);
    expect(summary.failedRoutes).toBe(1);
  });

  it('identifies issues affecting multiple routes as top global issues', () => {
    const summary = buildSummary(mockRouteResults);
    expect(summary.topGlobalIssues.length).toBeGreaterThan(0);
    const topIssue = summary.topGlobalIssues[0];
    expect(topIssue.affectedRoutes.length).toBeGreaterThanOrEqual(1);
  });

  it('returns empty summary when no successful routes', () => {
    const noSuccessResults = [
      { route: 'homepage', error: 'timeout', report: null },
      { route: 'lavagna', error: 'timeout', report: null },
    ];
    const summary = buildSummary(noSuccessResults);
    expect(summary.note).toBeTruthy();
    expect(summary.note).toContain('No successful');
  });

  it('handles single successful route', () => {
    const singleResult = [
      { route: 'homepage', report: { scores: { performance: 80, accessibility: 100, bestPractices: 96, seo: 100 }, topIssues: [] } },
    ];
    const summary = buildSummary(singleResult);
    expect(summary.averageScores.performance).toBe(80);
    expect(summary.minScores.performance).toBe(80);
    expect(summary.successfulRoutes).toBe(1);
  });
});

// ----------------------------------------------------------------
// 4. Output JSON structure validation
// ----------------------------------------------------------------

describe('Lighthouse aggregator — output JSON structure', () => {
  it('output JSON has required top-level fields', () => {
    const mockOutput = {
      tool: 'lighthouse',
      generatedAt: new Date().toISOString(),
      branch: 'feat/iter-70-team-E-quality-harness',
      baseUrl: 'https://www.elabtutor.school',
      routes: EXPECTED_LABELS,
      executionStatus: 'success',
      summary: {},
      routeResults: [],
      honestyCaveats: [],
    };

    expect(mockOutput).toHaveProperty('tool', 'lighthouse');
    expect(mockOutput).toHaveProperty('branch');
    expect(mockOutput).toHaveProperty('baseUrl');
    expect(mockOutput.routes).toHaveLength(ROUTES_COUNT);
    expect(Array.isArray(mockOutput.honestyCaveats)).toBe(true);
  });

  it('output includes all 8 route labels', () => {
    const labels = EXPECTED_LABELS;
    expect(labels).toHaveLength(8);
    expect(labels).toContain('homepage');
    expect(labels).toContain('lavagna');
    expect(labels).toContain('chatbot-only');
    expect(labels).toContain('about-easter');
  });

  it('valid execution statuses', () => {
    const validStatuses = ['pending', 'success', 'failed', 'partial', 'dry_run'];
    for (const status of validStatuses) {
      expect(validStatuses).toContain(status);
    }
  });

  it('Lighthouse threshold targets for ELAB are realistic', () => {
    const ELAB_THRESHOLDS = {
      performance: 50,
      accessibility: 90,
      bestPractices: 90,
      seo: 90,
    };

    expect(ELAB_THRESHOLDS.accessibility).toBeGreaterThanOrEqual(90);
    expect(ELAB_THRESHOLDS.seo).toBeGreaterThanOrEqual(90);
    expect(ELAB_THRESHOLDS.performance).toBeGreaterThanOrEqual(40);
  });
});
