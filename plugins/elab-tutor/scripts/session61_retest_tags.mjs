import { chromium } from 'playwright-core';

const CASES = [
  { id: 'E9', message: 'Costruisci il primo circuito da zero: batteria, resistore, LED, tutti collegati con fili' },
  { id: 'E10', message: 'Costruisci un circuito con 2 LED in parallelo, ciascuno col suo resistore, alimentati da batteria' },
  { id: 'E11', message: 'Costruisci un dimmer LED: potenziometro che controlla la luminosita\' del LED' },
  { id: 'E12', message: 'Costruisci un allarme: fotoresistore + buzzer + batteria' },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const actionRegex = /\[AZIONE:[^\]]+\]/gi;

async function maybeClick(page, locator) {
  if (await locator.count()) {
    await locator.first().click({ timeout: 5000 }).catch(() => {});
    await sleep(300);
  }
}

async function dismiss(page) {
  await maybeClick(page, page.getByRole('button', { name: /accetto/i }));
  await maybeClick(page, page.getByRole('button', { name: /ho capito/i }));
  await maybeClick(page, page.getByRole('button', { name: /chiudi suggerimento/i }));
}

async function waitChat(page, timeout=60000) {
  const sel='textarea[placeholder="Chiedi a Galileo..."]';
  const box=page.locator(sel).first();
  await box.waitFor({state:'visible',timeout});
  await page.waitForFunction((s)=>{const el=document.querySelector(s); return !!el && !el.disabled;}, sel, {timeout});
  return box;
}

const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const context = await browser.newContext({ viewport: { width: 1700, height: 1050 } });
const page = await context.newPage();

const net = [];
page.on('requestfinished', async (req) => {
  if (!/\/tutor-chat/i.test(req.url())) return;
  const resp = await req.response();
  let body='';
  try { body = await resp.text(); } catch {}
  net.push(body);
});

await page.goto('https://www.elabtutor.school/#tutor', { waitUntil: 'domcontentloaded', timeout: 90000 });
await sleep(1200);
await dismiss(page);
await page.fill('#login-email', 'teacher@elab.test');
await page.fill('#login-password', 'Tm7@xK4!pR2#nJ8');
await page.getByRole('button', { name: /^accedi$/i }).click();
await sleep(3000);
await page.getByRole('button', { name: /^tutor$/i }).first().click();
await sleep(3500);
await dismiss(page);
await maybeClick(page, page.getByRole('button', { name: /^simulatore$/i }));
await waitChat(page);

for (const c of CASES) {
  const before = net.length;
  const box = await waitChat(page);
  await box.fill(c.message);
  await page.locator('button[aria-label="Invia messaggio"]').last().click({ force: true });
  const start = Date.now();
  while (Date.now() - start < 35000 && net.length === before) await sleep(500);
  await sleep(8000);
  const raw = net.length > before ? net[net.length - 1] : '';
  const tags = raw.match(actionRegex) || [];
  console.log(`${c.id} tags=${tags.length} ${tags.join(' | ')}`);
}

await browser.close();
