/**
 * Sprint U — inject classKey bypass for E2E testing against prod.
 *
 * Two strategies:
 *   1. addInitScript (PRIMARY) — seed localStorage before app boots.
 *      Call seedSprintUBypass(page) BEFORE page.goto().
 *   2. injectClassKey (LEGACY helper) — navigate first, then inject.
 *      Retained for compatibility but prefer primary path.
 *
 * Sprint U Cycle 1 Iter 1 — LiveTest-1
 */

export const SPRINT_U_LICENSE_KEY = 'ELAB2026';

/**
 * Primary: seed localStorage via addInitScript (before app hydration).
 * Also seeds GDPR consent and BentornatiOverlay suppression.
 *
 * @param {import('@playwright/test').Page} page
 */
export async function seedSprintUBypass(page) {
  await page.addInitScript((licenseKey) => {
    try {
      // Gate 1: WelcomePage license
      window.localStorage.setItem('elab-license-key', licenseKey);
      window.localStorage.setItem('elab-class-key', licenseKey);
      window.sessionStorage.setItem('elab-license-key', licenseKey);

      // Gate 2: ConsentBanner — fully accepted state
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

      // Suppress BentornatiOverlay and picker auto-open
      window.localStorage.setItem('elab_skip_bentornati', 'true');
      window.localStorage.setItem('elab_lavagna_active_tab', 'lavagna');
    } catch (_e) {
      /* storage blocked / private mode — fallback via UI */
    }
  }, SPRINT_U_LICENSE_KEY);
}

/**
 * Legacy helper: navigate to root then inject via page.evaluate.
 * Use seedSprintUBypass instead for reliability.
 *
 * @param {import('@playwright/test').Page} page
 */
export async function injectClassKey(page) {
  await page.goto('https://www.elabtutor.school/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('elab-license-key', 'ELAB2026');
    localStorage.setItem('elab-class-key', 'ELAB2026');
    sessionStorage.setItem('elab-license-key', 'ELAB2026');
  });
  return true;
}
