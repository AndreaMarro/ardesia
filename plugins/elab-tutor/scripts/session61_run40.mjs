import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_DIR = '/Users/andreamarro/VOLUME 3/sessioni/report/session61-screens';
const RESULTS_PATH = '/Users/andreamarro/VOLUME 3/sessioni/report/session61-results.json';

const EXPERIMENTS = [
  { id: 'E1', message: 'Metti un LED rosso al centro della breadboard' },
  { id: 'E2', message: 'Metti un resistore a sinistra del LED' },
  { id: 'E3', message: 'Aggiungi una batteria 9V in alto a sinistra' },
  { id: 'E4', message: 'Metti un potenziometro esattamente in posizione 300,120' },
  { id: 'E5', message: 'Sposta il LED piu\' a destra di 100 pixel' },
  { id: 'E6', message: 'Metti 3 LED uno sotto l\'altro, distanziati di 50 pixel' },
  { id: 'E7', message: 'Metti un buzzer, un pulsante e un reed switch sulla stessa riga' },
  { id: 'E8', message: 'Cancella tutto e riposiziona: batteria a sinistra, resistore al centro, LED a destra' },
  { id: 'E9', message: 'Costruisci il primo circuito da zero: batteria, resistore, LED, tutti collegati con fili' },
  { id: 'E10', message: 'Costruisci un circuito con 2 LED in parallelo, ciascuno col suo resistore, alimentati da batteria' },
  { id: 'E11', message: 'Costruisci un dimmer LED: potenziometro che controlla la luminosita\' del LED' },
  { id: 'E12', message: 'Costruisci un allarme: fotoresistore + buzzer + batteria' },
  { id: 'E13', message: 'Costruisci un semaforo con 3 LED: rosso, giallo, verde. Arduino li controlla' },
  { id: 'E14', message: 'Costruisci un circuito con MOSFET che controlla un motore DC' },
  { id: 'E15', message: 'Aggiungi un pulsante al circuito del motore per accenderlo/spegnerlo' },
  { id: 'E16', message: 'Togli il motore e metti al suo posto un servo' },
  { id: 'E17', message: 'Evidenzia il LED nel circuito' },
  { id: 'E18', message: 'Evidenzia tutti i resistori' },
  { id: 'E19', message: 'Mostrami dove sta il potenziometro' },
  { id: 'E20', message: 'Rimuovi solo i fili ma lascia i componenti' },
  { id: 'E21', message: 'Rimuovi il buzzer ma lascia tutto il resto intatto' },
  { id: 'E22', message: 'Premi il pulsante' },
  { id: 'E23', message: 'Gira il potenziometro al 75%' },
  { id: 'E24', message: 'Sposta il LED in basso a destra' },
  { id: 'E25', message: "Carica l'esperimento del primo circuito (v1-cap6-primo-circuito), poi sostituisci il LED rosso con un LED RGB" },
  { id: 'E26', message: 'Carica il blink, cambia il delay da 1000 a 250 per farlo lampeggiare veloce' },
  { id: 'E27', message: 'Carica il dimmer LED, poi aggiungi un secondo LED controllato dallo stesso potenziometro' },
  { id: 'E28', message: 'Carica il circuito del buzzer, poi modifica il codice per suonare la scala musicale DO-RE-MI-FA-SOL' },
  { id: 'E29', message: 'Carica l\'esperimento del pulsante, poi aggiungi un contatore sul Serial Monitor' },
  { id: 'E30', message: 'Carica il robot segui-luce, poi cambia i pin dei motori a D5 e D6' },
  { id: 'E31', message: 'Carica l\'esperimento del condensatore, poi aggiungi un LED che si accende durante la scarica' },
  { id: 'E32', message: 'Carica il semaforo, poi aggiungi un buzzer che suona quando il rosso si accende' },
  { id: 'E33', setup: 'Carica l\'esperimento del primo circuito (v1-cap6-primo-circuito) e avvia la simulazione', message: 'Cosa vedi nel circuito?' },
  { id: 'E34', setup: 'Nel circuito attuale inverti il LED cosi\' e\' montato al contrario', message: 'Perche\' il LED non si accende?' },
  { id: 'E35', setup: 'Rimuovi un filo essenziale cosi\' il circuito resta aperto', message: 'Il circuito non funziona, cosa c\'e\' che non va?' },
  { id: 'E36', setup: 'Carica il blink e imposta un codice con errore di sintassi', message: 'Perche\' il codice non compila?' },
  { id: 'E37', setup: 'Carica un circuito con potenziometro e porta il potenziometro al 50%', message: 'Che valore legge il sensore adesso?' },
  { id: 'E38', setup: 'Apri la tab manuale', message: 'Portami al simulatore e carica l\'ultimo esperimento che abbiamo fatto' },
  { id: 'E39', message: 'Fammi un riassunto di cosa abbiamo fatto finora' },
  { id: 'E40', setup: 'Costruisci un circuito complesso con 3 LED, buzzer e pulsante gia\' montato', message: 'Spiega a un bambino di 8 anni cosa fa questo circuito' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function maybeClick(page, locator) {
  if (await locator.count()) {
    await locator.first().click({ timeout: 5000 }).catch(() => {});
    await sleep(350);
  }
}

async function dismissOverlays(page) {
  await maybeClick(page, page.getByRole('button', { name: /accetto/i }));
  await maybeClick(page, page.getByRole('button', { name: /ho capito/i }));
  await maybeClick(page, page.getByRole('button', { name: /chiudi suggerimento/i }));
}

async function getAssistantCount(page) {
  return await page.locator('.galileo-bubble-content').count();
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

function extractActionTags(text) {
  if (!text) return [];
  const tags = text.match(/\[AZIONE:[^\]]+\]/gi) || [];
  return tags;
}

async function captureState(page) {
  return await page.evaluate(() => {
    const api = window.__ELAB_API || null;
    const exp = api?.getCurrentExperiment?.() || null;
    const layout = api?.getLayout?.() || {};
    const positions = api?.getComponentPositions?.() || {};
    const bubbles = Array.from(document.querySelectorAll('.galileo-bubble-content'))
      .map(el => (el.textContent || '').trim())
      .filter(Boolean);
    return {
      href: location.href,
      experiment: exp ? { id: exp.id, title: exp.title, mode: exp.simulationMode } : null,
      components: (layout.components || []).length,
      connections: (layout.connections || []).length,
      positions: Object.fromEntries(Object.entries(positions).slice(0, 25)),
      lastAssistant: bubbles[bubbles.length - 1] || null,
    };
  });
}

async function sendMessage(page, message, tutorResponses) {
  const chatBox = await waitForChatReady(page);
  const sendButton = page.locator('button[aria-label="Invia messaggio"]').last();

  await chatBox.fill(message, { timeout: 10000 });
  const countBefore = await getAssistantCount(page);
  const netBefore = tutorResponses.length;
  await sendButton.click({ force: true });

  const start = Date.now();
  while (Date.now() - start < 30000) {
    const countNow = await getAssistantCount(page);
    if (countNow > countBefore) break;
    await sleep(500);
  }

  // Allow action execution + simulator render
  await sleep(10000);
  await waitForChatReady(page, 60000).catch(() => {});

  const netAfter = tutorResponses.length;
  const lastNet = netAfter > netBefore ? tutorResponses[netAfter - 1] : null;
  return { lastNet };
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
    const url = req.url();
    if (!/\/tutor-chat/i.test(url)) return;
    const resp = await req.response();
    let body = '';
    try {
      body = await resp.text();
    } catch {}
    tutorResponses.push({
      ts: Date.now(),
      url,
      status: resp?.status?.() || null,
      body,
    });
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
    await sleep(1500);

    // Baseline
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'BASELINE.png'), fullPage: true });

    // Warmup: force a known experiment load in chat context
    await sendMessage(page, "Carica l'esperimento del primo circuito (v1-cap6-primo-circuito)", tutorResponses);
    await sleep(2000);

    for (const exp of EXPERIMENTS) {
      const row = { id: exp.id, message: exp.message, setup: exp.setup || null, startedAt: new Date().toISOString() };
      try {
        await dismissOverlays(page);

        if (exp.setup) {
          const setupResult = await sendMessage(page, exp.setup, tutorResponses);
          row.setupResponse = setupResult.lastNet?.body || null;
        }

        const msgResult = await sendMessage(page, exp.message, tutorResponses);
        row.rawResponse = msgResult.lastNet?.body || null;
        row.actionTags = extractActionTags(msgResult.lastNet?.body || '');
        row.state = await captureState(page);

        const screenPath = path.join(OUTPUT_DIR, `${exp.id}.png`);
        await page.screenshot({ path: screenPath, fullPage: true });
        row.screenshot = screenPath;
        row.status = 'done';
      } catch (err) {
        row.status = 'error';
        row.error = err?.message || String(err);
      }
      row.endedAt = new Date().toISOString();
      results.push(row);
      console.log(`${exp.id} -> ${row.status}`);
    }
  } finally {
    await fs.writeFile(RESULTS_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2), 'utf8');
    await browser.close();
  }
}

await main();
