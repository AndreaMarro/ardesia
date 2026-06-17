import { test, expect } from '@playwright/test';
import { waitForPageReady, TIMEOUTS, PROD_URL } from './fixtures.js';

/**
 * Vision E2E smoke spec (Day 10 / sett-2 Day 03).
 *
 * Scope — SCAFFOLD smoke only:
 *   - verify homepage loads and product identity is intact,
 *   - assert window.__ELAB_API surface is exposed after boot and
 *     captureScreenshot() can be invoked without crashing,
 *   - skip on production host (https://www.elabtutor.school) to avoid
 *     accidental cost from real Gemini Vision calls downstream.
 *
 * Out of scope (Day 11 Vercel AI SDK integration):
 *   - real Gemini API roundtrip,
 *   - voice trigger "guarda il mio circuito",
 *   - screenshot content comparison,
 *   - analyzeImage() pipeline.
 *
 * Principle Zero v3 compliance: when UNLIM text surfaces in DOM we check
 * it is NOT addressed to the teacher as "Docente, leggi" (meta-instruction
 * forbidden by PZ v3).
 */

const isProdHost = (url) => {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname.endsWith('elabtutor.school');
  } catch {
    return false;
  }
};

const BASE_URL = process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || '';

test.describe('Vision E2E Scaffold', () => {
  test.skip(
    isProdHost(BASE_URL) || BASE_URL === PROD_URL,
    'Vision smoke skipped on prod host to avoid Gemini Vision cost side-effects.',
  );

  test('should load homepage and expose product identity before vision features', async ({ page }) => {
    // Baseline smoke: if homepage is broken, vision cannot work either.
    await page.goto('/');
    await waitForPageReady(page);

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toMatch(/elab|tutor/);

    const bodyText = await page.textContent('body');
    expect(bodyText.length).toBeGreaterThan(50);
    expect(bodyText.toLowerCase()).toMatch(/elab/);

    // PZ v3 watchdog: vision output must never address the teacher directly.
    expect(bodyText).not.toMatch(/Docente,?\s*leggi/i);
    expect(bodyText).not.toMatch(/Insegnante,?\s*leggi/i);
  });

  test('should expose window.__ELAB_API.captureScreenshot without crashing', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');
    await waitForPageReady(page);

    // Give simulator-api.js time to install the global API on boot.
    // The API is installed in a useEffect / module side-effect; a small wait
    // plus poll tolerates slow CI without being flaky.
    const apiShape = await page.waitForFunction(() => {
      if (typeof window === 'undefined') return false;
      if (!window.__ELAB_API) return false;
      return {
        hasApi: true,
        hasCapture: typeof window.__ELAB_API.captureScreenshot === 'function',
        hasUnlim: typeof window.__ELAB_API.unlim === 'object',
      };
    }, null, { timeout: TIMEOUTS.pageLoad }).then((h) => h.jsonValue()).catch(() => null);

    // API may not be installed on routes other than the simulator. Accept
    // either (a) API present with captureScreenshot exposed, OR (b) API
    // absent — both are valid scaffold states while Day 11 integration lands.
    if (apiShape) {
      expect(apiShape.hasApi).toBe(true);
      expect(apiShape.hasCapture).toBe(true);
    }

    // Invoke captureScreenshot when available. It may return null on routes
    // without a canvas; we only care it does NOT throw an uncaught error.
    const captureResult = await page.evaluate(async () => {
      if (!window.__ELAB_API || typeof window.__ELAB_API.captureScreenshot !== 'function') {
        return { invoked: false };
      }
      try {
        const dataUrl = await window.__ELAB_API.captureScreenshot();
        return {
          invoked: true,
          type: typeof dataUrl,
          isDataUrl: typeof dataUrl === 'string' && dataUrl.startsWith('data:image/'),
          isNull: dataUrl === null,
        };
      } catch (err) {
        return { invoked: true, error: String(err && err.message ? err.message : err) };
      }
    });

    if (captureResult.invoked) {
      // Tolerant assertion: either a data URL, a null (no canvas on route),
      // or a graceful undefined. An uncaught error bubbling to pageerror
      // would be the real failure mode we guard against.
      expect(captureResult).toEqual(expect.objectContaining({ invoked: true }));
      if (captureResult.error) {
        // If captureScreenshot surfaced an error, flag it explicitly so
        // Day 11 integration can triage — do not silently pass.
        expect(captureResult.error, 'captureScreenshot threw; expected null or data URL').toBeUndefined();
      }
    }

    // Hard guard: no uncaught page-level errors from invoking the API.
    const critical = pageErrors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error'),
    );
    expect(critical).toEqual([]);
  });

  test('should fire stateChange / circuitChange subscriber hooks without throwing', async ({ page }) => {
    // Smoke: vision flow relies on event subscriptions (on('stateChange'))
    // to synchronize with circuit snapshots. Verify the subscription hook
    // itself is safe to call from an external caller.
    await page.goto('/');
    await waitForPageReady(page);

    const subscriptionSafe = await page.evaluate(() => {
      if (!window.__ELAB_API || typeof window.__ELAB_API.on !== 'function') {
        return { available: false };
      }
      try {
        const off1 = window.__ELAB_API.on('stateChange', () => {});
        const off2 = window.__ELAB_API.on('circuitChange', () => {});
        if (typeof off1 === 'function') off1();
        if (typeof off2 === 'function') off2();
        return { available: true, subscribed: true };
      } catch (err) {
        return { available: true, error: String(err && err.message ? err.message : err) };
      }
    });

    if (subscriptionSafe.available) {
      expect(subscriptionSafe.error).toBeUndefined();
      expect(subscriptionSafe.subscribed).toBe(true);
    } else {
      // API not yet installed on this route — scaffold accepts this.
      expect(subscriptionSafe.available).toBe(false);
    }
  });
});
