/**
 * P0 hotfix regression — PWA stale precache safety net.
 *
 * Stress test on 2026-04-22 found that returning users received a blank page
 * after the Sprint 3 deploy: the workbox precache served a stale index.html
 * whose chunk hashes no longer existed on the origin. Fix ships three
 * independent layers; this test asserts each layer is present in source so
 * future refactors can't silently drop a safety net.
 *
 * See: docs/audits/2026-04-22-stress-test-findings.md#p0-001
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = join(__dirname, '..', '..');

describe('P0 hotfix — PWA stale precache safety net', () => {
    describe('Layer 3: inline safety script in index.html', () => {
        const html = readFileSync(join(ROOT, 'index.html'), 'utf8');

        it('inline script appears BEFORE the module entry script', () => {
            const inlineStart = html.indexOf('elab-stale-module-reload');
            const moduleScript = html.indexOf('src="/src/main.jsx"');
            expect(inlineStart).toBeGreaterThan(0);
            expect(moduleScript).toBeGreaterThan(inlineStart);
        });

        it('listens on the window with capture=true to catch module load failures', () => {
            expect(html).toMatch(/window\.addEventListener\(\s*['"]error['"][\s\S]+?true\s*\)/);
        });

        it('filters by /assets/ path so non-asset errors never trigger reload', () => {
            expect(html).toMatch(/\/assets\//);
            expect(html).toMatch(/indexOf\(\s*['"]\/assets\/['"]\s*\)/);
        });

        it('guards with sessionStorage to prevent reload loops', () => {
            // The storage key must be declared (either inline or via a const) and
            // at least one getItem / setItem call must hit sessionStorage.
            expect(html).toContain('elab-stale-module-reload');
            expect(html).toMatch(/sessionStorage\.getItem\(/);
            expect(html).toMatch(/sessionStorage\.setItem\(/);
        });

        it('attempts serviceWorker unregister + caches.delete before reload', () => {
            expect(html).toMatch(/getRegistrations/);
            expect(html).toMatch(/unregister/);
            expect(html).toMatch(/caches\.keys/);
            expect(html).toMatch(/caches\.delete/);
        });
    });

    describe('Layer 2: controllerchange reload in src/main.jsx', () => {
        const main = readFileSync(join(ROOT, 'src', 'main.jsx'), 'utf8');

        it('registers a controllerchange listener on navigator.serviceWorker', () => {
            expect(main).toMatch(/navigator\.serviceWorker\.addEventListener\(\s*['"]controllerchange['"]/);
        });

        it('guards the reload with a sessionStorage flag to avoid SW handoff loops', () => {
            expect(main).toMatch(/sessionStorage\.(getItem|setItem)\(\s*['"]elab-sw-reload['"]/);
        });

        it('reloads with window.location.reload (not replace, not href hack)', () => {
            expect(main).toMatch(/window\.location\.reload\(\)/);
        });

        it('checks a prior controller so first-install users are not force-reloaded', () => {
            // Without this guard every brand-new user is force-reloaded once when
            // clientsClaim activates the SW. Caught in
            // tests/e2e/12-stress-insegnante-impreparato.spec.js as a pageerror.
            expect(main).toMatch(/hadController/);
            expect(main).toMatch(/navigator\.serviceWorker\.controller/);
        });
    });

    describe('Layer 1: workbox config in vite.config.js', () => {
        const cfg = readFileSync(join(ROOT, 'vite.config.js'), 'utf8');

        // iter 49: autoUpdate + skipWaiting:true. L'aula/iPad non deve restare
        // su UI stale dopo deploy (Capitoli/Video legacy).
        it('enables skipWaiting so the new SW can replace stale UI immediately', () => {
            expect(cfg).toMatch(/skipWaiting:\s*true/);
        });

        it('enables clientsClaim so the new SW takes over existing tabs once activated', () => {
            expect(cfg).toMatch(/clientsClaim:\s*true/);
        });

        it('enables cleanupOutdatedCaches so prior-deploy precache entries are purged', () => {
            expect(cfg).toMatch(/cleanupOutdatedCaches:\s*true/);
        });

        it("uses registerType 'autoUpdate' so stale PWA tabs do not keep old bundles", () => {
            expect(cfg).toMatch(/registerType:\s*['"]autoUpdate['"]/);
        });
    });

    describe('Independence — each layer survives on its own', () => {
        it('Layer 3 is inline (no import), so it runs even when the module graph fails', () => {
            const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
            // Must be an inline <script> (no src attribute) somewhere BEFORE the module script.
            const inlineSegment = html.split('src="/src/main.jsx"')[0];
            expect(inlineSegment).toMatch(/<script>[\s\S]*elab-stale-module-reload/);
        });

        it('Layer 2 runs only when main.jsx loads — complementary, not redundant', () => {
            // This is documented by comments; test just asserts both layers use
            // DIFFERENT sessionStorage keys so they cannot interfere.
            const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
            const main = readFileSync(join(ROOT, 'src', 'main.jsx'), 'utf8');
            expect(html).toContain('elab-stale-module-reload');
            expect(main).toContain('elab-sw-reload');
            expect(html).not.toContain('elab-sw-reload');
            expect(main).not.toContain('elab-stale-module-reload');
        });
    });
});
