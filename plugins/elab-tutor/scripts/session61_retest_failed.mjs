import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_DIR = '/Users/andreamarro/VOLUME 3/sessioni/report/session61-screens';
const RESULTS_PATH = '/Users/andreamarro/VOLUME 3/sessioni/report/session61-retest-failed.json';

const RETESTS = [
  { id: 'E27', message: 'Carica il dimmer LED, poi aggiungi un secondo LED controllato dallo stesso potenziometro' },
  { id: 'E30', message: 'Carica il robot segui-luce, poi cambia i pin dei motori a D5 e D6' },
  { id: 'E36', setup: 'Carica il blink e imposta un codice con errore di sintassi', message: "Perche' il codice non compila?" },
  { id: 'E37', setup: 'Carica un circuito con potenziometro e porta il potenziometro al 50%', message: 'Che valore legge il sensore adesso?' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function maybeClick(page, locator) {
  if (await locator.count()) {
    await locator.first().click({ timeout: 5000 }).catch(() => {});
    await sleep(300);
  }
}

async function dismissOverlays(page) {
  await maybeClick(page, page.getByRole('button', { name: /accetto/i }));
  await maybeClick(page, page.getByRole('button', { name: /ho capito/i }));
  await maybeClick(page, page.getByRole('button', { name: /chiudi suggerimento/i }));
}

async function waitForChatReady(page, timeout = 60000) {
  const selector = 'textarea[placeholder="Chiedi a Galileo..."]';
  const chatBox = page.locator(selector).first();
  await chatBox.waitFor({ state: 'visible', timeout });
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return !!el && !el.disabled;
  }, selector, { timeout });
  return chatBox;
}

async function captureState(page) {
  return await page.evaluate(() => {
    const api = window.__ELAB_API || null;
    const exp = api?.getCurrentExperiment?.() || null;
    const layout = api?.getLayout?.() || {};
    const bubbles = Array.from(document.querySelectorAll('.galileo-bubble-content'))
      .map(el => (el.textContent || '').trim())
      .filter(Boolean);
    return {
      href: location.href,
      experiment: exp ? { id: exp.id, title: exp.title, mode: exp.simulationMode } : null,
      components: (layout.components || []).length,
      connections: (layout.connections || []).length,
      lastAssistant: bubbles[bubbles.length - 1] || null,
    };
  });
}

function extractActionTags(text) {
  if (!text) return [];
  return text.match(/\[AZIONE:[^\]]+\]/gi) || [];
}

async function sendMessage(page, message, tutorResponses) {
  const chatBox = await waitForChatReady(page);
  const sendButton = page.locator('button[aria-label="Invia messaggio"]').last();
  await chatBox.fill(message, { timeout: 10000 });
  const countBefore = await page.locator('.galileo-bubble-content').count();
  const netBefore = tutorResponses.length;
  await sendButton.click({ force: true });

  const start = Date.now();
  while (Date.now() - start < 30000) {
    const countNow = await page.locator('.galileo-bubble-content').count();
    if (countNow > countBefore) break;
    await sleep(500);
  }

  await sleep(10000);
  await waitForChatReady(page, 60000).catch(() => {});

  const netAfter = tutorResponses.length;
  return netAfter > netBefore ? tutorResponses[netAfter - 1] : null;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const context = await browser.newContext({ viewport: { width: 1700, height: 1050 } });
  const page = await context.newPage();

  const tutorResponses = [];
  page.on('requestfinished', async (req) => {
    if (!/\/tutor-chat/i.test(req.url())) return;
    const resp = await req.response();
    let body = '';
    try { body = await resp.text(); } catch {}
    tutorResponses.push({ url: req.url(), status: resp?.status?.() || null, body, ts: Date.now() });
  });

  const results = [];

  try {
    await page.goto('https://www.elabtutor.school/#tutor', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(1500);
    await dismissOverlays(page);

    await page.fill('#login-email', 'teacher@elab.test');
    await page.fill('#login-password', 'Tm7@xK4!pR2#nJ8');
    await page.getByRole('button', { name: /^accedi$/i }).click();
    await sleep(3000);
    await page.getByRole('button', { name: /^tutor$/i }).first().click();
    await sleep(3500);
    await dismissOverlays(page);
    await maybeClick(page, page.getByRole('button', { name: /^simulatore$/i }));

    await sendMessage(page, "Carica l'esperimento del primo circuito (v1-cap6-primo-circuito)", tutorResponses);

    for (const exp of RETESTS) {
      const row = { id: exp.id, setup: exp.setup || null, message: exp.message, startedAt: new Date().toISOString() };
      try {
        await dismissOverlays(page);
        if (exp.setup) {
          row.setupRaw = (await sendMessage(page, exp.setup, tutorResponses))?.body || null;
        }
        const net = await sendMessage(page, exp.message, tutorResponses);
        row.rawResponse = net?.body || null;
        row.actionTags = extractActionTags(row.rawResponse);
        row.state = await captureState(page);
        row.status = 'done';
      } catch (err) {
        row.status = 'error';
        row.error = err?.message || String(err);
      }
      row.endedAt = new Date().toISOString();
      const screenPath = path.join(OUTPUT_DIR, `${exp.id}-RETEST.png`);
      await page.screenshot({ path: screenPath, fullPage: true });
      row.screenshot = screenPath;
      results.push(row);
      console.log(`${exp.id} RETEST -> ${row.status}`);
    }
  } finally {
    await fs.writeFile(RESULTS_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2), 'utf8');
    await browser.close();
  }
}

await main();
