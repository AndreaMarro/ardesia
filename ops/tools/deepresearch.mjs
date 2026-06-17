#!/usr/bin/env node
// MAESTRO — deep-research da BROWSER (mandato Andrea: Gemini DR / ChatGPT DR via Playwright).
// Profilo PERSISTENTE dedicato ~/.maestro-browser-profile (login una-tantum di Andrea — questo
// script NON inserisce mai credenziali). Chrome di sistema (channel:'chrome').
// Uso:
//   node deepresearch.mjs --verify                  → screenshot stato login (gemini + chatgpt)
//   node deepresearch.mjs --engine gemini --query "..." [--headless]
// Output: ~/maestro-logs/research/  (FUORI dai repo: sopravvive ai reset del driver).
// Onestà operativa: bot-detection possibile; quote DR limitate → ≤2 ricerche/giorno (guard sotto).
import { chromium } from 'playwright';
import { mkdirSync, existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const HOME = homedir();
const PROFILE = join(HOME, '.maestro-browser-profile');
const OUT = join(HOME, 'maestro-logs', 'research');
mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const has = f => args.includes(f);
const opt = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };

// Guard quota: max 2 submit/giorno (i --verify non contano).
const QUOTA_FILE = join(OUT, '.quota');
function checkQuota() {
  const today = new Date().toISOString().slice(0, 10);
  let [d, n] = existsSync(QUOTA_FILE) ? readFileSync(QUOTA_FILE, 'utf8').trim().split(' ') : [today, '0'];
  if (d !== today) n = '0';
  if (Number(n) >= 2) { console.error('QUOTA: 2 deep-research già usate oggi. Riprova domani.'); process.exit(3); }
  writeFileSync(QUOTA_FILE, `${today} ${Number(n) + 1}`);
}

const headless = has('--headless');
const ctx = await chromium.launchPersistentContext(PROFILE, {
  channel: 'chrome',
  headless,
  viewport: { width: 1440, height: 900 },
  args: ['--disable-blink-features=AutomationControlled'],
});
const page = ctx.pages()[0] ?? await ctx.newPage();

async function loginState(url, name, loggedOutMarkers) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const shot = join(OUT, `login-check-${name}.png`);
  await page.screenshot({ path: shot, fullPage: false });
  const body = (await page.textContent('body').catch(() => '')) ?? '';
  const loggedOut = loggedOutMarkers.some(m => body.includes(m));
  console.log(`${name}: ${loggedOut ? 'NON loggato' : 'loggato (probabile)'} — screenshot ${shot}`);
  return !loggedOut;
}

if (has('--verify')) {
  await loginState('https://gemini.google.com/app', 'gemini', ['Accedi', 'Sign in']);
  await loginState('https://chatgpt.com/', 'chatgpt', ['Log in', 'Accedi', 'Registrati']);
  await ctx.close();
  process.exit(0);
}

const engine = opt('--engine', 'gemini');
const query = opt('--query', '');
if (!query) { console.error('Manca --query'); await ctx.close(); process.exit(1); }

if (engine === 'gemini') {
  const ok = await loginState('https://gemini.google.com/app', 'gemini', ['Accedi', 'Sign in']);
  if (!ok) { console.error('Gemini NON loggato nel profilo dedicato: serve login una-tantum di Andrea (account musickant) in ~/.maestro-browser-profile. Lancia: bash deepresearch.sh --login'); await ctx.close(); process.exit(2); }
  checkQuota();
  // Attiva Deep Research dal selettore strumenti, poi sottometti la query.
  // NOTA ONESTA: selettori UI Gemini cambiano spesso; questo percorso va verificato alla prima run loggata
  // e adattato. Fallimento qui = exit 4 con screenshot diagnostico, NON un report finto.
  try {
    const tools = page.getByRole('button', { name: /strumenti|tools/i }).first();
    await tools.click({ timeout: 10000 });
  } catch { /* alcuni layout mostrano direttamente il chip Deep Research */ }
  try {
    await page.getByText(/deep research/i).first().click({ timeout: 10000 });
  } catch (e) {
    await page.screenshot({ path: join(OUT, 'gemini-dr-fail.png') });
    console.error('Deep Research non attivabile (UI cambiata?): vedi gemini-dr-fail.png'); await ctx.close(); process.exit(4);
  }
  const box = page.getByRole('textbox').first();
  await box.fill(query);
  await box.press('Enter');
  console.log('Query sottomessa. Polling asincrono (fino a 25 min)…');
  const t0 = Date.now();
  let report = '';
  while (Date.now() - t0 < 25 * 60 * 1000) {
    await page.waitForTimeout(60000);
    const body = (await page.textContent('body').catch(() => '')) ?? '';
    if (/inizia la ricerca|start research/i.test(body)) {
      try { await page.getByText(/inizia la ricerca|start research/i).first().click({ timeout: 5000 }); console.log('Piano confermato, ricerca avviata.'); } catch {}
    }
    if (/copia|esporta in|condividi/i.test(body) && body.length > 4000) { report = body; break; }
    console.log(`…in corso (${Math.round((Date.now() - t0) / 60000)} min)`);
  }
  const ts = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const out = join(OUT, `gemini-dr-${ts}.md`);
  if (report) {
    writeFileSync(out, `# Deep Research (Gemini) — ${query}\n\n${report}`);
    console.log(`REPORT: ${out} (${report.length} char) — grezzo: rifinire in supervisione`);
  } else {
    await page.screenshot({ path: join(OUT, `gemini-dr-timeout-${ts}.png`) });
    console.error('Timeout 25 min senza report: screenshot salvato, NON scrivo report finto.');
  }
  await ctx.close();
  process.exit(report ? 0 : 5);
}

console.error(`Engine '${engine}' non implementato (v1: gemini).`);
await ctx.close();
process.exit(1);
