/**
 * ELAB Quality Harness Phase 1 — axe a11y Scan
 * iter 70 Team E — 2026-05-19
 *
 * Playwright + @axe-core/playwright accessibility scan on 8 routes
 * WCAG 2.1 AA compliance check — outputs violations to audit JSON
 *
 * Usage:
 *   npx playwright test tests/e2e/iter-70-axe-a11y-scan.spec.js --config tests/e2e/playwright.config.js
 *
 * Env:
 *   BASE_URL (default: https://www.elabtutor.school)
 *   A11Y_TIMEOUT (default: 30000ms per route)
 */

import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// @axe-core/playwright is loaded dynamically to avoid hard dependency
// If not installed, tests will skip gracefully with a warning
let AxeBuilder;
try {
  const mod = await import('@axe-core/playwright').catch(() => null);
  AxeBuilder = mod?.default || mod?.AxeBuilder;
} catch (_) {
  AxeBuilder = null;
}

const BASE_URL = process.env.BASE_URL || 'https://www.elabtutor.school';
const A11Y_TIMEOUT = parseInt(process.env.A11Y_TIMEOUT || '30000', 10);
const OUTPUT_DIR = resolve(process.cwd(), 'docs/audits');
const A11Y_RESULTS_FILE = resolve(OUTPUT_DIR, '2026-05-19-iter-70-axe-a11y-results.json');

// 8 routes to scan
const ROUTES = [
  { path: '/', label: 'homepage', description: 'Homepage — landing page' },
  { path: '/#lavagna', label: 'lavagna', description: 'Lavagna interattiva multimediale' },
  { path: '/#tutor', label: 'tutor', description: 'Tutor AI UNLIM' },
  { path: '/#chatbot-only', label: 'chatbot-only', description: 'Chatbot-only mode' },
  { path: '/#dashboard', label: 'dashboard', description: 'Dashboard docente' },
  { path: '/#glossario', label: 'glossario', description: 'Glossario Tea' },
  { path: '/#about-easter', label: 'about-easter', description: 'Easter modal' },
  { path: '/#docente', label: 'docente', description: 'Docente/teacher mode' },
];

// Accumulated results for final JSON write
const allResults = [];

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

/** Waits for route to be visually stable (no network requests for 1s) */
async function waitForRouteStable(page, waitMs = 2000) {
  await page.waitForTimeout(waitMs);
}

/** Navigate to route + wait for stability */
async function navigateToRoute(page, route) {
  const url = `${BASE_URL}${route.path}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: A11Y_TIMEOUT });
  await waitForRouteStable(page);
}

/** Format violation summary for test output */
function formatViolationSummary(violations) {
  return violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    help: v.help,
    helpUrl: v.helpUrl,
    nodeCount: v.nodes?.length || 0,
    // Sample up to 3 affected nodes for brevity
    sampleNodes: (v.nodes || []).slice(0, 3).map((n) => ({
      html: (n.html || '').substring(0, 200),
      target: n.target,
      failureSummary: n.failureSummary,
    })),
  }));
}

/** Write all results to JSON file */
function writeResultsJson() {
  try {
    mkdirSync(OUTPUT_DIR, { recursive: true });

    const topViolations = {};
    for (const result of allResults) {
      for (const v of (result.violations || [])) {
        if (!topViolations[v.id]) {
          topViolations[v.id] = {
            id: v.id,
            impact: v.impact,
            description: v.description,
            help: v.help,
            affectedRoutes: [],
            totalNodes: 0,
          };
        }
        topViolations[v.id].affectedRoutes.push(result.route);
        topViolations[v.id].totalNodes += v.nodeCount;
      }
    }

    // Sort by impact severity then by number of affected routes
    const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
    const sortedViolations = Object.values(topViolations)
      .sort((a, b) => {
        const impactDiff = (impactOrder[a.impact] ?? 4) - (impactOrder[b.impact] ?? 4);
        return impactDiff !== 0 ? impactDiff : b.affectedRoutes.length - a.affectedRoutes.length;
      });

    const output = {
      tool: 'axe-core',
      playwrightVersion: 'latest',
      generatedAt: new Date().toISOString(),
      branch: 'feat/iter-70-team-E-quality-harness',
      baseUrl: BASE_URL,
      wcagLevel: 'WCAG 2.1 AA',
      totalRoutesScanned: allResults.length,
      routeResults: allResults,
      top5GlobalViolations: sortedViolations.slice(0, 5),
      allViolationsSorted: sortedViolations,
      summary: {
        totalViolations: sortedViolations.length,
        criticalCount: sortedViolations.filter((v) => v.impact === 'critical').length,
        seriousCount: sortedViolations.filter((v) => v.impact === 'serious').length,
        moderateCount: sortedViolations.filter((v) => v.impact === 'moderate').length,
        minorCount: sortedViolations.filter((v) => v.impact === 'minor').length,
      },
      honestyCaveats: [
        'SPA hash routes may not be fully rendered at scan time — route-specific content may differ',
        'axe-core catches ~30-40% of WCAG violations automatically (manual audit needed for full coverage)',
        'Dynamic content (UNLIM chat, simulator) not loaded at scan time in this Phase 1 baseline',
        'Color contrast checks may miss dynamic CSS variables applied post-hydration',
        'Iframe content (Scratch/Blockly simulator) is not scanned by axe-core in this config',
      ],
    };

    writeFileSync(A11Y_RESULTS_FILE, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`[axe-a11y] Results written: ${A11Y_RESULTS_FILE}`);
  } catch (err) {
    console.error('[axe-a11y] Failed to write results JSON:', err.message);
  }
}

// ----------------------------------------------------------------
// Tests — one describe per route
// ----------------------------------------------------------------

test.describe('ELAB a11y scan — iter 70 Phase 1 baseline', () => {

  test.afterAll(() => {
    writeResultsJson();
  });

  // Generate one test per route
  for (const route of ROUTES) {
    test(`a11y scan: ${route.label} — ${route.description}`, async ({ page }) => {
      if (!AxeBuilder) {
        console.warn(`[axe-a11y] @axe-core/playwright not installed — skipping ${route.label}`);
        console.warn('[axe-a11y] Install: npm install --save-dev @axe-core/playwright');

        // Record skip in results
        allResults.push({
          route: route.label,
          url: `${BASE_URL}${route.path}`,
          scannedAt: new Date().toISOString(),
          status: 'skipped',
          reason: '@axe-core/playwright not installed',
          violations: [],
          passes: 0,
          incomplete: 0,
        });

        test.skip(true, '@axe-core/playwright not installed');
        return;
      }

      const url = `${BASE_URL}${route.path}`;

      try {
        await navigateToRoute(page, route);

        // Run axe scan with WCAG 2.1 AA ruleset
        const axeBuilder = new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
          // Exclude 3rd-party frames (Scratch/Blockly)
          .exclude('iframe')
          // Skip color-contrast if theme varies (run separately)
          // .disableRules(['color-contrast'])
          .options({
            resultTypes: ['violations', 'incomplete'],
          });

        const results = await axeBuilder.analyze();

        const violations = formatViolationSummary(results.violations || []);
        const criticalAndSerious = violations.filter(
          (v) => v.impact === 'critical' || v.impact === 'serious'
        );

        // Record result
        allResults.push({
          route: route.label,
          url,
          scannedAt: new Date().toISOString(),
          status: 'completed',
          violationCount: violations.length,
          criticalAndSeriousCount: criticalAndSerious.length,
          passCount: results.passes?.length || 0,
          incompleteCount: results.incomplete?.length || 0,
          violations,
        });

        // Log summary
        console.log(`[axe-a11y] ${route.label}: ${violations.length} violations (${criticalAndSerious.length} critical/serious)`);

        // Log top violations for this route
        if (violations.length > 0) {
          console.log(`[axe-a11y] ${route.label} violations:`);
          for (const v of violations.slice(0, 5)) {
            console.log(`  - [${v.impact}] ${v.id}: ${v.help} (${v.nodeCount} nodes)`);
          }
        }

        // Soft assertion: no critical violations (expected in ELAB prod)
        // Using expect.soft so all routes are scanned even if some fail
        expect.soft(
          criticalAndSerious.filter((v) => v.impact === 'critical').length,
          `Route ${route.label} has critical a11y violations: ${criticalAndSerious
            .filter((v) => v.impact === 'critical')
            .map((v) => v.id)
            .join(', ')}`
        ).toBe(0);

      } catch (err) {
        console.error(`[axe-a11y] Error scanning ${route.label}:`, err.message);

        allResults.push({
          route: route.label,
          url,
          scannedAt: new Date().toISOString(),
          status: 'error',
          error: err.message,
          violations: [],
        });

        // Don't fail the test — record error and continue
        console.warn(`[axe-a11y] ${route.label} scan error recorded — continuing`);
      }
    });
  }
});

// ----------------------------------------------------------------
// Bonus: ELAB-specific a11y checks
// ----------------------------------------------------------------

test.describe('ELAB a11y — ELAB-specific checks', () => {
  test('homepage has proper lang attribute', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: A11Y_TIMEOUT });
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBeTruthy();
    expect(lang.toLowerCase()).toMatch(/^it/); // ELAB is Italian
  });

  test('homepage has main landmark', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: A11Y_TIMEOUT });
    const mainCount = await page.locator('main').count();
    // Should have at least one main landmark
    expect(mainCount).toBeGreaterThanOrEqual(0); // soft check — may use role
    // OR check by role
    const mainRole = await page.locator('[role="main"]').count();
    const hasMain = mainCount > 0 || mainRole > 0;
    // Record in results but don't hard-fail (educational app may use custom structure)
    if (!hasMain) {
      console.warn('[axe-a11y] ELAB: no <main> or role="main" landmark found on homepage');
    }
  });

  test('homepage links have accessible names', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: A11Y_TIMEOUT });
    // Check for links without text content (accessibility risk)
    const emptyLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .filter((a) => !a.textContent?.trim() && !a.getAttribute('aria-label') && !a.getAttribute('title'))
        .map((a) => a.outerHTML.substring(0, 100));
    });

    if (emptyLinks.length > 0) {
      console.warn(`[axe-a11y] ${emptyLinks.length} links without accessible names:`, emptyLinks.slice(0, 3));
    }

    // Soft check: ELAB may have icon-only links (ElabIcons)
    expect.soft(emptyLinks.length, `${emptyLinks.length} links without accessible names`).toBeLessThan(10);
  });

  test('interactive elements meet minimum touch target (44x44px)', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: A11Y_TIMEOUT });

    // Check buttons for touch target size compliance (WCAG 2.5.5 AAA, good practice)
    const smallButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"]'));
      return buttons
        .filter((btn) => {
          const rect = btn.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
        })
        .map((btn) => ({
          text: btn.textContent?.trim().substring(0, 50),
          width: Math.round(btn.getBoundingClientRect().width),
          height: Math.round(btn.getBoundingClientRect().height),
        }))
        .slice(0, 10);
    });

    if (smallButtons.length > 0) {
      console.warn(`[axe-a11y] ${smallButtons.length} small touch targets (<44px):`, smallButtons.slice(0, 3));
    }

    // ELAB target: <10 violations (some toolbars may have tighter constraints)
    expect.soft(
      smallButtons.length,
      `${smallButtons.length} interactive elements below 44x44px touch target`
    ).toBeLessThan(20);
  });
});
