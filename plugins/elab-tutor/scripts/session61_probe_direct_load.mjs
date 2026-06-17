import { chromium } from 'playwright-core';

const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const context = await browser.newContext({ viewport: { width: 1700, height: 1050 } });
const page = await context.newPage();

const maybeClick = async (locator) => {
  if (await locator.count()) {
    await locator.first().click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(350);
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

const result = await page.evaluate(() => {
  const api = window.__ELAB_API;
  const direct = api?.loadExperiment?.('v1-cap6-primo-circuito');
  return { direct };
});
await page.waitForTimeout(4000);
const check = await page.evaluate(() => {
  const api = window.__ELAB_API;
  const exp = api?.getCurrentExperiment?.();
  const layout = api?.getLayout?.();
  return {
    exp: exp ? { id: exp.id, title: exp.title } : null,
    compCount: layout?.components?.length || 0,
  };
});
console.log(JSON.stringify({ result, check }, null, 2));
await page.screenshot({ path: '/tmp/session61_probe_direct_load.png', fullPage: true });
await browser.close();
