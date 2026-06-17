import { chromium } from 'playwright-core';

const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const context = await browser.newContext({ viewport: { width: 1700, height: 1050 } });
const page = await context.newPage();
const maybeClick = async (locator) => {
  if (await locator.count()) {
    await locator.first().click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(300);
  }
};
await page.goto('https://www.elabtutor.school/#tutor', { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(1500);
await maybeClick(page.getByRole('button', { name: /accetto/i }));
await page.fill('#login-email', 'teacher@elab.test');
await page.fill('#login-password', 'Tm7@xK4!pR2#nJ8');
await page.getByRole('button', { name: /^accedi$/i }).click();
await page.waitForTimeout(3000);
await page.getByRole('button', { name: /^tutor$/i }).first().click();
await page.waitForTimeout(3500);
await maybeClick(page.getByRole('button', { name: /ho capito/i }));
await maybeClick(page.getByRole('button', { name: /chiudi suggerimento/i }));
await maybeClick(page.getByRole('button', { name: /^simulatore$/i }));

const info = await page.evaluate(() => {
  const api = window.__ELAB_API;
  const list = api?.getExperimentList?.();
  return {
    hasApi: !!api,
    vol1: list?.vol1?.length || 0,
    vol2: list?.vol2?.length || 0,
    vol3: list?.vol3?.length || 0,
    firstVol1: list?.vol1?.[0] || null,
    hasFirstCircuit: !!api?.getExperiment?.('v1-cap6-primo-circuito'),
    checkAlt: !!api?.getExperiment?.('v1-cap6-esp1'),
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
