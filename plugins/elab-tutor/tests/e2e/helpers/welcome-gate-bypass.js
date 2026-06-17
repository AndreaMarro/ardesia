/**
 * welcome-gate-bypass — Tester-3 iter 37 Phase 3 Atom A8-FIX
 *
 * Helper utility: bypass the prod entrance gates so Playwright specs can
 * land on the Lavagna directly.
 *
 * Two prod gates were observed iter 37 Phase 1 (Tester-1 evidence
 * `docs/audits/iter-37-evidence/*\/error-context.md`):
 *
 *   1. WelcomePage license gate
 *      - heading "BENVENUTO IN ELAB TUTOR"
 *      - input#license-key (textbox "Chiave univoca")
 *      - button "ENTRA"
 *      - Source: `src/components/WelcomePage.jsx:138-160`
 *      - Valid key: `ELAB2026` (validated against
 *        `src/components/WelcomePage.jsx:119`).
 *      - On submit → `localStorage.setItem('elab-license-key', trimmed)` +
 *        `setClassKey(trimmed)` + `window.location.hash = '#lavagna'`.
 *
 *   2. ConsentBanner privacy dialog (auto-opens on routes NOT in
 *      CONSENT_SKIP_HASHES per `src/App.jsx:394-413`)
 *      - dialog [aria-label="Consenso privacy"]
 *      - phase 'age': select#elab-age-select + button "Avanti" (disabled until
 *        an age is picked)
 *      - phase 'consent': button "Accetto"/"Ok, va bene!"
 *      - Source: `src/components/common/ConsentBanner.jsx:204-282`
 *      - Skip hashes include `lavagna` so once we're on `#lavagna` the
 *        banner is suppressed by `isConsentRouteAllowed()`.
 *
 * Strategy
 * --------
 * Primary path (preferred): seed both gates via `localStorage` /
 * `sessionStorage` BEFORE the app boots, using
 * `Page.addInitScript`. This avoids racing with WelcomePage's
 * `useEffect` redirect and ConsentBanner's `useEffect` mount.
 *
 *   - `localStorage['elab-license-key'] = 'ELAB2026'` — survives the gate
 *     by satisfying any subsequent reads.
 *   - `localStorage['elab_gdpr_consent']` = `{ status: 'accepted', ... }`
 *     so `getConsent()` returns truthy and ConsentBanner stays hidden.
 *   - `localStorage['elab_consent_v2'] = 'accepted'`.
 *   - `sessionStorage['elab_user_age'] = '18'` so even if the banner mounts
 *     it skips the age phase.
 *   - `localStorage['elab_skip_bentornati'] = 'true'` — paralleled to the
 *     existing `tests/e2e/29-simulator-arduino-scratch-sweep.spec.js`
 *     `seedBypass` pattern. Suppresses BentornatiOverlay if present.
 *
 * Defensive fallback: after `page.goto`, the helper checks for residual
 * gates and dismisses them via UI interaction. This is best-effort: if the
 * primary seed worked the fallback is a no-op. If the prod build ignores
 * pre-seeded `elab-license-key` (because WelcomePage only validates via
 * form submit), the fallback will type the key and click ENTRA.
 *
 * Idempotency: the helper is safe to call multiple times. It awaits
 * networkidle once, dismisses gates if visible, then awaits networkidle
 * again only if it actually clicked something.
 *
 * Usage
 * -----
 *
 *   import { test, expect } from '@playwright/test';
 *   import { bypassWelcomeGate, gotoLavagna } from './helpers/welcome-gate-bypass.js';
 *
 *   test('something', async ({ page }) => {
 *     await gotoLavagna(page); // seed + goto + bypass
 *     // ... test body, page is on #lavagna
 *   });
 *
 * Tester-3 — 2026-04-30 PM
 */

/** License key accepted by `src/components/WelcomePage.jsx:119`. */
export const ELAB_LICENSE_KEY = 'ELAB2026';

/**
 * Seed localStorage / sessionStorage so that gates do not appear.
 *
 * MUST be called BEFORE `page.goto` so the script runs before the
 * application bundle executes. Uses `addInitScript` which fires for
 * every navigation in the same context.
 *
 * @param {import('@playwright/test').Page} page
 */
export async function seedGateBypass(page) {
    await page.addInitScript((licenseKey) => {
        try {
            // Gate 1: WelcomePage license
            window.localStorage.setItem('elab-license-key', licenseKey);

            // Gate 2: ConsentBanner — fully accepted state, skips all phases
            const acceptedConsent = JSON.stringify({
                status: 'accepted',
                age: 18,
                analyticsAnonymized: true,
                timestamp: new Date().toISOString(),
                version: '1.0',
            });
            window.localStorage.setItem('elab_gdpr_consent', acceptedConsent);
            window.localStorage.setItem('elab_consent_v2', 'accepted');
            window.sessionStorage.setItem('elab_user_age', '18');

            // Existing iter 29 sweep pattern: dismiss Bentornati overlay
            window.localStorage.setItem('elab_skip_bentornati', 'true');
            window.localStorage.setItem('elab_lavagna_active_tab', 'lavagna');
        } catch (_e) {
            /* storage blocked / private mode → fallback handles it */
        }
    }, ELAB_LICENSE_KEY);
}

/**
 * After navigation, dismiss any residual WelcomePage / ConsentBanner UI
 * if seeding did not suppress it.
 *
 * Best-effort. Catches per-step so a missing locator never throws.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<{licenseDismissed: boolean, consentDismissed: boolean}>}
 */
export async function bypassWelcomeGate(page) {
    // 1. WelcomePage license gate
    let licenseDismissed = false;
    const welcomeHeading = page.getByRole('heading', { name: /BENVENUTO IN ELAB TUTOR/i });
    const welcomeVisible = await welcomeHeading
        .first()
        .isVisible({ timeout: 2_000 })
        .catch(() => false);
    if (welcomeVisible) {
        const input = page.locator('#license-key');
        const inputVisible = await input.isVisible({ timeout: 1_000 }).catch(() => false);
        if (inputVisible) {
            await input.fill(ELAB_LICENSE_KEY).catch(() => {});
            const submitBtn = page.getByRole('button', { name: /ENTRA/i }).first();
            await submitBtn.click({ timeout: 2_000 }).catch(() => {});
            licenseDismissed = true;
            await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
        }
    }

    // 2. ConsentBanner privacy dialog (may persist independently)
    let consentDismissed = false;
    const consentDialog = page.locator('[role="dialog"][aria-label="Consenso privacy"]');
    const consentVisible = await consentDialog
        .isVisible({ timeout: 2_000 })
        .catch(() => false);
    if (consentVisible) {
        // Phase 'age' — pick 18+ then click Avanti
        const ageSelect = page.locator('#elab-age-select');
        const ageSelectVisible = await ageSelect
            .isVisible({ timeout: 1_000 })
            .catch(() => false);
        if (ageSelectVisible) {
            await ageSelect.selectOption('18').catch(() => {});
            const avantiBtn = consentDialog.getByRole('button', { name: /Avanti/i }).first();
            await avantiBtn.click({ timeout: 2_000 }).catch(() => {});
        }
        // Phase 'consent' — click Accetto / Ok va bene
        const acceptBtn = consentDialog
            .getByRole('button', { name: /Accetto|Ok, va bene|Accetta|Ho capito/i })
            .first();
        const acceptVisible = await acceptBtn.isVisible({ timeout: 2_000 }).catch(() => false);
        if (acceptVisible) {
            await acceptBtn.click({ timeout: 2_000 }).catch(() => {});
            consentDismissed = true;
            await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
        }
    }

    return { licenseDismissed, consentDismissed };
}

/**
 * One-call helper: seed → goto → bypass.
 *
 * Navigates directly to the Lavagna route which (a) is in
 * CONSENT_SKIP_HASHES so the banner stays hidden and (b) is the route
 * `useGalileoChat` and the Fumetto button live on.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} [path='/#lavagna']
 */
export async function gotoLavagna(page, path = '/#lavagna') {
    await seedGateBypass(page);
    await page.goto(path);
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await bypassWelcomeGate(page);
    // Wait for LavagnaShell to hydrate + 400ms picker debounce + render.
    await page.waitForTimeout(1_500);
    // ExperimentPicker auto-opens on Lavagna load and intercepts pointer
    // events for any UI behind it (backdrop role=dialog). Dismiss via
    // "Lavagna libera" so the rest of the test can interact with the
    // FloatingToolbar (Fumetto button etc.) and canvas.
    await dismissExperimentPicker(page);
    await page.waitForTimeout(600);
    // Confirm picker actually closed (defensive — re-dismiss if it
    // bounced back due to React re-render or freeMode flag race).
    const stillThere = await page
        .locator('[role="dialog"][aria-label="Scegli un esperimento"]')
        .isVisible({ timeout: 1_000 })
        .catch(() => false);
    if (stillThere) {
        await dismissExperimentPicker(page);
        await page.waitForTimeout(400);
    }
}

/**
 * Dismiss the ExperimentPicker dialog if it auto-opened on Lavagna load.
 *
 * Per `src/components/lavagna/ExperimentPicker.jsx`:
 *   - role="dialog" aria-label="Scegli un esperimento"
 *   - backdrop intercepts pointer events to ALL UI behind it
 *   - dismiss options:
 *       a) "Lavagna libera" banner button (onFreeMode + onClose)
 *       b) Close button [aria-label="Chiudi"]
 *
 * Iter 29 sweep spec documents the same blocker; we centralize the pattern
 * here so both Fumetto and Lavagna persistence specs share one source of
 * truth.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<boolean>} true if a picker was dismissed
 */
export async function dismissExperimentPicker(page) {
    const picker = page.locator('[role="dialog"][aria-label="Scegli un esperimento"]');
    // Picker auto-opens via 400ms debounce inside LavagnaShell.jsx:652 once
    // BentornatiOverlay is dismissed and no experiment is loaded. Poll up to
    // 8s so we don't race the mount.
    let visible = false;
    const deadline = Date.now() + 8_000;
    while (Date.now() < deadline) {
        visible = await picker.isVisible({ timeout: 500 }).catch(() => false);
        if (visible) break;
        await page.waitForTimeout(300);
    }
    if (!visible) return false;

    // Prefer Lavagna libera (matches Fumetto/persistence test intent: empty board)
    const liberaBtn = picker.getByText(/Lavagna libera/i).first();
    const liberaVisible = await liberaBtn.isVisible({ timeout: 1_000 }).catch(() => false);
    if (liberaVisible) {
        await liberaBtn.click({ timeout: 2_000 }).catch(() => {});
        await page.waitForTimeout(500);
        // Confirm dismissal (best-effort)
        const stillVisible = await picker.isVisible({ timeout: 500 }).catch(() => false);
        if (!stillVisible) return true;
    }

    // Fallback: close button
    const closeBtn = picker.getByRole('button', { name: /Chiudi/i }).first();
    const closeVisible = await closeBtn.isVisible({ timeout: 1_000 }).catch(() => false);
    if (closeVisible) {
        await closeBtn.click({ timeout: 2_000 }).catch(() => {});
        await page.waitForTimeout(500);
        return true;
    }

    // Last resort: Escape key
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(500);
    return true;
}
