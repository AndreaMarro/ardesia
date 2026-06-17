import { chromium } from 'playwright-core';

const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const context = await browser.newContext({ viewport: { width: 1700, height: 1050 } });
const page = await context.newPage();

const net = [];
page.on('requestfinished', async (req) => {
  const url = req.url();
  if (/tutor-chat|\/chat|n8n|webhook|elab-galileo|compile/i.test(url)) {
    const resp = await req.response();
    let body = '';
    try {
      const text = await resp.text();
      body = text.slice(0, 500);
    } catch {}
    net.push({
      method: req.method(),
      url,
      status: resp?.status?.(),
      body,
    });
  }
});

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

const chatBox = page.locator('textarea[placeholder="Chiedi a Galileo..."]');
await chatBox.fill("Carica l'esperimento del primo circuito (v1-cap6-primo-circuito)");
await page.getByRole('button', { name: /invia messaggio/i }).last().click();
await page.waitForTimeout(12000);

const runtime = await page.evaluate(() => {
  const api = window.__ELAB_API || null;
  const exp = api?.getCurrentExperiment?.() || null;
  return {
    href: location.href,
    experiment: exp ? { id: exp.id, title: exp.title } : null,
  };
});

console.log(JSON.stringify({ runtime, net }, null, 2));
await page.screenshot({ path: '/tmp/session61_trace_chat_network.png', fullPage: true });
await browser.close();
