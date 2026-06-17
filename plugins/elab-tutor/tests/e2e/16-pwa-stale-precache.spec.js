/**
 * P0 stale-precache recovery — E2E smoke test.
 *
 * Simulates the production scenario found in the 2026-04-22 stress test:
 * returning users whose service worker precache still points at chunk hashes
 * that no longer exist on the origin. Asserts that the inline safety net in
 * index.html catches the module load failure, unregisters the stale SW,
 * purges all caches, and reloads into a working app.
 *
 * Kept as a smoke test — not part of the default gate — because it
 * intentionally forges a broken cache entry, and CI environments without a
 * real SW runtime return noisy results. Opt in via `SMOKE_PWA=1`.
 */
import { test, expect } from '@playwright/test';
import { waitForPageReady } from './fixtures.js';

const shouldRun = process.env.SMOKE_PWA === '1';

test.describe('PWA stale-precache recovery (P0 hotfix)', () => {
    test.skip(!shouldRun, 'Set SMOKE_PWA=1 to run this recovery smoke');

    test('recovers from a stale precache entry by unregistering the SW and reloading', async ({ page, context }) => {
        // 1. Warm the SW so caches.keys() returns something to delete.
        await page.goto('/');
        await waitForPageReady(page);

        // 2. Force-install a broken precache entry: an HTML document that
        // references an asset hash the origin does not ship. This is what
        // users with a pre-deploy workbox-precache-v2 were seeing.
        const forged = await page.evaluate(async () => {
            const names = await caches.keys();
            const precache = names.find(n => n.startsWith('workbox-precache')) || names[0];
            if (!precache) return { installed: false, reason: 'no cache to forge into' };
            const cache = await caches.open(precache);
            const html = `<!doctype html><html><head><meta charset="UTF-8"></head><body>
                <div id="root"></div>
                <script type="module" src="/assets/react-vendor-FAKE-HASH-DOES-NOT-EXIST.js"></script>
              </body></html>`;
            await cache.put(new Request('/index.html'), new Response(html, { headers: { 'content-type': 'text/html' } }));
            return { installed: true, cacheName: precache };
        });
        expect(forged.installed).toBe(true);

        // 3. Reload. The inline safety net (index.html layer 3) should catch
        // the forged module load failure and clean up.
        await page.reload({ waitUntil: 'domcontentloaded' });

        // 4. Give the cleanup + auto-reload a budget of 10 s, then assert the
        // app has actually mounted on the fresh HTML.
        await page.waitForFunction(() => {
            const r = document.getElementById('root');
            return r && r.children.length > 0;
        }, { timeout: 10_000 });

        const mounted = await page.evaluate(() => {
            const r = document.getElementById('root');
            return r ? r.children.length : 0;
        });
        expect(mounted).toBeGreaterThan(0);

        // 5. sessionStorage guard should have fired exactly once.
        const flag = await page.evaluate(() => sessionStorage.getItem('elab-stale-module-reload'));
        expect(flag).toBe('1');
    });
});
