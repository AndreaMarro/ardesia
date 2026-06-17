/**
 * tests/e2e/build-preview-smoke.spec.js
 *
 * Iter 79 Atom 79.0 — Built-bundle Playwright smoke spec (P0 BLOCKER).
 *
 * Catches obfuscation-induced regressions in production build BEFORE push
 * origin. Iter 78 PROD regression (commit 6e639e07 fix) silently passed all
 * unit tests + source tests + Codex Pattern V/C reviews because the bug only
 * manifested AFTER javascript-obfuscator hoisting transform — invisible to
 * source-level static analysis.
 *
 * Iter 78 root cause: `javascript-obfuscator` hoisted `nextExperiment.title`
 * access OUTSIDE the JSX short-circuit guard `{showCliffhanger && (<>...
 * {nextExperiment.title}...</>)}` → crash with undefined.title even when guard
 * evaluated false. Defense added 3-layer (optional chaining + SKIP_PATTERNS
 * + tests preserved) — but solo Andrea PROD test caught the regression.
 *
 * This spec automates that last line of defense:
 *   1. Build production bundle (vite + obfuscator + minification)  — npm script
 *   2. Serve built bundle via `vite preview --port 4173`  — webServer config
 *   3. Navigate each of 4 critical hash routes
 *   4. Assert per route:
 *        - hasErrorBoundary === false (no "Ops! Qualcosa è andato storto")
 *        - pageErrors.length === 0 (no uncaught exceptions)
 *        - bodyText.length > 200 (content rendered, not just shell)
 *
 * Routes covered:
 *   #compile-home  — HomePage cross-compile entry (iter 73 commit 027d5e3e)
 *   #lavagna       — LavagnaShell + Blockly + UNLIM (highest obfuscator surface)
 *   #tutor         — Tutor route experiment view (iter 78 cliffhanger regression site)
 *   #dashboard     — Dashboard docente (Supabase data view)
 *
 * HONESTY CAVEATS (mandatory G45 ≥5):
 *
 * Caveat 1 — Console error noise:
 *   Spec captures `page.on('pageerror')` (uncaught exceptions, the iter 78
 *   regression class). It also captures `page.on('console', msg => msg.type()
 *   === 'error')` for visibility, but DOES NOT FAIL on console.error alone
 *   (React DevTools warnings, service worker registration, optional asset
 *   404s can legitimately surface). Pageerror is the canonical strict signal.
 *
 * Caveat 2 — License + consent gating:
 *   Routes are behind WelcomePage license gate + ConsentBanner. Spec uses
 *   `seedSprintUBypass` helper (iter 70 Sprint U Cycle 1) to pre-populate
 *   localStorage BEFORE app boot via `addInitScript`. If gating logic changes
 *   without updating the helper, spec will fail at navigation phase (not at
 *   route mount) — a different failure mode than obfuscation regression.
 *
 * Caveat 3 — bodyLen per-route threshold:
 *   Default 200 chars (compile-home + lavagna + tutor) — arbitrary minimum
 *   proving "something rendered". A blank shell page is ~50 chars (header +
 *   footer). 200 chars indicates the route lazy-mount actually executed.
 *   #dashboard threshold drops to 100 because the route sits behind Supabase
 *   Auth login gate (separate from the license-key seedSprintUBypass helper)
 *   and renders the login form (~108 chars) without authenticated session —
 *   that is a valid render, NOT a regression. Does NOT prove correctness —
 *   only that rendering did not crash silently. Functional E2E (route-
 *   specific assertions) is separate scope (see tests/e2e/0[1-4]*.spec.js).
 *
 * Caveat 4 — Single browser (chromium):
 *   Chromium-only matches iter 77-A3 + Sprint U convention. Firefox/Webkit
 *   may surface different obfuscator interactions (CFG opcode polyfills),
 *   but those are out of scope for the iter 78 regression class which was
 *   pure JavaScript hoisting (browser-agnostic). Add Firefox/Webkit projects
 *   in iter 80+ if needed.
 *
 * Caveat 5 — Build cache:
 *   Vite build cache (`node_modules/.vite/`) may serve stale chunks if source
 *   changed but cache key did not invalidate. CI should run `rm -rf
 *   node_modules/.vite dist` before `npm run build` to guarantee fresh.
 *   Local dev: trust build to invalidate via mtime — fast path.
 *
 * Caveat 6 — webServer port 4173:
 *   Hardcoded port 4173 (Vite preview default). If another process holds it,
 *   webServer init will fail. Spec runner should ensure port is free
 *   (`lsof -ti:4173 | xargs kill -9 2>/dev/null || true` pre-run).
 *
 * Caveat 7 — Test isolation:
 *   Each test creates fresh page context (Playwright default). pageErrors
 *   collected per page, NOT shared across routes. Spec failure on one route
 *   does NOT block other routes from running (sequential execution exposes
 *   ALL regressions in single run, not first-failure-stop).
 */

import { test, expect } from '@playwright/test';
import { seedSprintUBypass } from './helpers/sprint-u-auth.js';

const ROUTES = [
  { hash: 'compile-home', label: 'HomePage cross-compile entry', minBodyLen: 200 },
  { hash: 'lavagna', label: 'Lavagna shell (highest obfuscator surface)', minBodyLen: 200 },
  { hash: 'tutor', label: 'Tutor route (iter 78 regression site)', minBodyLen: 200 },
  // Dashboard sits behind Supabase Auth login gate (separate from the
  // license-key seedSprintUBypass helper). Without authenticated session
  // the route renders the login form (~108 chars). That is a valid render
  // (NOT a blank shell crash), so the threshold drops to 100 — enough to
  // detect "blank screen" while accepting "auth gate rendered".
  { hash: 'dashboard', label: 'Dashboard docente (auth gate)', minBodyLen: 100 },
];

const ERROR_BOUNDARY_TEXT = 'Ops! Qualcosa è andato storto';
const ROUTE_TIMEOUT_MS = 20000; // generous: obfuscated chunks parse slower than source

for (const { hash, label, minBodyLen } of ROUTES) {
  test(`built bundle serves #${hash} without error boundary or page errors — ${label}`, async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];

    // Capture uncaught exceptions — the iter 78 obfuscation regression class.
    page.on('pageerror', (err) => {
      pageErrors.push({
        name: err.name,
        message: err.message,
        stack: err.stack?.split('\n').slice(0, 5).join('\n'),
      });
    });

    // Capture console.error for visibility (NOT asserted — see Caveat 1).
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Seed license + consent BEFORE navigation.
    await seedSprintUBypass(page);

    // Navigate to the route. waitUntil:networkidle ensures lazy chunks loaded.
    const response = await page.goto(`/#${hash}`, {
      waitUntil: 'networkidle',
      timeout: ROUTE_TIMEOUT_MS,
    });

    // HTTP-level sanity: status must be 2xx (vite preview serves SPA index for all routes).
    expect(response, `navigation to /#${hash} returned no response`).not.toBeNull();
    expect(response.status(), `HTTP status for /#${hash}`).toBeLessThan(400);

    // Wait briefly for React mount + hash route effect to settle.
    await page.waitForTimeout(1500);

    // Assert 1: NO error boundary text on page.
    const errorBoundaryLocator = page.getByText(ERROR_BOUNDARY_TEXT, { exact: false });
    const errorBoundaryCount = await errorBoundaryLocator.count();
    expect(
      errorBoundaryCount,
      `Error boundary "${ERROR_BOUNDARY_TEXT}" rendered on /#${hash} — ` +
      `pageErrors=${JSON.stringify(pageErrors, null, 2)} ` +
      `consoleErrors=${JSON.stringify(consoleErrors.slice(0, 5), null, 2)}`
    ).toBe(0);

    // Assert 2: NO uncaught page errors (canonical strict signal).
    expect(
      pageErrors,
      `Uncaught page errors on /#${hash} — likely obfuscation regression`
    ).toEqual([]);

    // Assert 3: bodyText length > minBodyLen (content rendered, not blank shell).
    const bodyText = await page.evaluate(() => document.body.innerText || '');
    expect(
      bodyText.length,
      `Body text length on /#${hash} below ${minBodyLen} chars — ` +
      `route may have mounted blank shell. Body preview: "${bodyText.slice(0, 150)}"`
    ).toBeGreaterThan(minBodyLen);

    // Visibility log (NOT asserted): report console.error count for debugging.
    if (consoleErrors.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(
        `[build-preview-smoke] /#${hash} had ${consoleErrors.length} console.error ` +
        `(non-fatal): ${consoleErrors.slice(0, 3).join(' | ')}`
      );
    }
  });
}
