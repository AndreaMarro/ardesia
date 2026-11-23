// Reproducible browser acceptance test. It only writes into a new temporary database.
import { chromium } from 'playwright';
import { revisedLearning } from './browser-metodo.mjs';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import net from 'node:net';

const root = fileURLToPath(new URL('../', import.meta.url));
const scratch = await mkdtemp(path.join(tmpdir(), 'officina-qa-'));
const env = { ...process.env, ASTRA_DATA: scratch };
const listener = net.createServer();
listener.listen(0, '127.0.0.1');
await once(listener, 'listening');
const port = listener.address().port;
listener.close();
await once(listener, 'close');
const url = 'http://127.0.0.1:' + port + '/';
const app = spawn('python3', ['app.py', 'serve', '--port', String(port)], {
  cwd: root,
  env,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let browser;
const logs = [],
  shots = process.env.ASTRA_SHOTS;
async function screen(page, name) {
  if (shots) {
    await mkdir(shots, { recursive: true });
    await page.mouse.move(0, 0);
    await page.locator('#toast').waitFor({ state: 'hidden', timeout: 8000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].filter((img) => {
        const box = img.getBoundingClientRect();
        return box.width > 0 && box.bottom > 0 && box.top < innerHeight;
      }).map((img) => img.decode()));
    });
    await page.screenshot({ path: path.join(shots, name + '.png'), animations: 'disabled' });
  }
}
async function visit(page, route, selector) {
  await page.goto(url + '#' + route);
  await page.locator(selector).first().waitFor();
  await page.waitForFunction(() => !document.querySelector('main')?.hasAttribute('aria-busy'));
}
async function advance(page, link, expect) {
  await link.click();
  await page.locator(expect).first().waitFor();
}
async function noOverflow(page) {
  const sizes = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  assert.ok(sizes[0] <= sizes[1] + 1, 'overflow ' + page.url() + ' ' + sizes);
}
async function guidedReading(page, id, course, expected, screenshot = '') {
  await visit(page, 'materiale/' + id + '/' + course, '.lettura-inizia');
  const content = page.locator('#testo-dei-passaggi');
  const tools = page.locator('.lettura-strumenti');
  const back = tools.getByRole('button', { name: 'Indietro', exact: true });
  const next = tools.getByRole('button', { name: 'Avanti', exact: true });
  const original = await content.innerHTML();
  const shown = () => content.evaluate((el) => [...el.children].flatMap((node, n) => node.hidden ? [] : [n]));
  const indices = expected.flat();
  assert.deepEqual(await shown(), indices);
  await tools.getByRole('button', { name: 'Un passaggio alla volta' }).click();
  assert.ok(await back.isDisabled());
  for (const [k, group] of expected.entries()) {
    assert.equal(await tools.getByRole('status').innerText(), 'Passaggio ' + (k + 1) + ' di ' + expected.length);
    assert.deepEqual(await shown(), group);
    if (screenshot && k === 0) await screen(page, screenshot);
    if (k + 1 < expected.length) await next.click();
  }
  assert.ok(await next.isDisabled());
  await back.focus();
  await page.keyboard.press('Enter');
  assert.deepEqual(await shown(), expected[expected.length - 2]);
  await tools.getByRole('button', { name: 'Mostra tutto' }).click();
  assert.deepEqual(await shown(), indices);
  assert.equal(await content.innerHTML(), original);
  await noOverflow(page);
  return original;
}
async function signedAreasFlow(page, device) {
  await visit(page, 'home', '.hero');
  await advance(page, page.getByRole('link', { name: 'Preparazione rapida all’esame', exact: true }), '.method-intro');
  await advance(page, page.getByRole('link', { name: 'Esercizi prioritari C1' }).first(), '.c1-index');
  await page.getByRole('link', { name: 'Diagnosi e simulazioni · C6' }).waitFor();
  await visit(page, 'corso/C1', '.c1-paths');
  await screen(page, 'c1-' + device);
  await noOverflow(page);
  await advance(page, page.getByRole('link', { name: 'Inizia dalle lezioni' }), '.topic-row');
  await advance(page, page.getByRole('link', { name: 'Formule inverse e interpretazione dei grafici' }), '.method-graphs');
  await visit(page, 'corso/C1', '.c1-paths');
  await advance(page, page.getByRole('link', { name: 'Vai agli esercizi prioritari' }), 'a[href="#materiale/C1-Q027/C1"]');
  await page.getByRole('link', { name: 'Formule inverse e interpretazione dei grafici' }).waitFor();
  await advance(page, page.getByRole('link', { name: 'Aree di segno opposto' }), '#single');
  await advance(page, page.locator('#single'), '#response');
  await page.getByLabel('Risposta numerica in m', { exact: true }).fill('2');
  await page.getByRole('button', { name: 'Verifica risposta' }).click();
  await page.getByRole('heading', { name: 'Risposta corretta' }).waitFor();
  await page.getByRole('button', { name: 'Un passaggio alla volta' }).click();
  const solution = page.locator('.feedback');
  for (const [step, drawing] of ['C1-aree', 'C1-Q027-andata', 'C1-Q027-ritorno', 'C1-Q027-somma'].entries()) {
    await solution.getByText('Passaggio ' + (step + 1) + ' di 4', { exact: true }).waitFor();
    const figure = solution.locator('figure:visible img');
    assert.equal(await figure.getAttribute('src'), '/figures/' + drawing + '.svg');
    await figure.evaluate(img => img.decode());
    assert.ok(await solution.locator('.math:visible').evaluate(box => box.scrollWidth <= box.clientWidth + 1), 'Formula interamente visibile');
    await noOverflow(page);
    if (shots) {
      await solution.screenshot({ path: path.join(shots, 'q027-' + device + '-' + (step + 1) + '.png') });
    }
    if (step < 3) await solution.getByRole('button', { name: 'Avanti' }).click();
  }
  await solution.getByRole('button', { name: 'Indietro' }).click();
  await solution.getByText('Passaggio 3 di 4', { exact: true }).waitFor();
  await solution.getByRole('button', { name: 'Mostra tutto' }).click();
  assert.equal(await solution.locator('figure:visible').count(), 4);
  await advance(page, solution.getByRole('link', { name: 'Continua con gli esercizi prioritari' }), '.c1-index');
}
function watch(page) {
  page.on('response', (r) => {
    if (r.status() >= 400) logs.push(r.status() + ' ' + new URL(r.url()).pathname);
  });
  page.on('pageerror', (e) => logs.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') logs.push(m.text() + ' · ' + new URL(m.location().url || url).pathname);
  });
  page.on('dialog', (d) => d.accept());
}
async function runAcceptance() {
  await once(app.stdout, 'data');
  browser = await chromium.launch(
    process.env.ASTRA_CHROME ? { executablePath: process.env.ASTRA_CHROME } : { channel: 'chrome' },
  );
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 960 } }),
    page = await desktop.newPage();
  watch(page);
  await visit(page, 'home', '.hero');
  const portrait = page.locator('[data-mascotte]'), coverImage = portrait.locator('img');
  await coverImage.evaluate((img) => img.decode());
  await screen(page, 'copertina-desktop');
  await noOverflow(page);
  assert.equal(await portrait.getAttribute('aria-pressed'), 'false');
  const firstImage = await coverImage.getAttribute('src');
  await portrait.focus();
  await page.keyboard.press('Enter');
  assert.equal(await portrait.getAttribute('aria-pressed'), 'true');
  await coverImage.evaluate((img) => img.decode());
  assert.notEqual(await coverImage.getAttribute('src'), firstImage);
  await page.keyboard.press('Space');
  assert.equal(await portrait.getAttribute('aria-pressed'), 'false');
  assert.equal(await coverImage.getAttribute('src'), firstImage);
  await page.getByRole('button', { name: 'Prova un esperimento' }).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'prova-titolo');
  const sample = page.locator('esperimento-portata');
  assert.equal(await sample.locator('.misura-portata').isVisible(), false);
  await sample.getByRole('button', { name: 'Un sedicesimo' }).click();
  assert.equal(await sample.locator('#valore-portata').innerText(), '6,25 %');
  const radius = sample.getByRole('slider');
  await radius.focus();
  await page.keyboard.press('End');
  assert.equal(await sample.locator('#valore-portata').innerText(), '100 %');
  assert.equal(await sample.locator('#raggio-campione').getAttribute('r'), '69');
  await page.keyboard.press('Home');
  assert.equal(await sample.locator('#valore-portata').innerText(), '6,25 %');
  await screen(page, 'esperimento-pubblico');
  await page.locator('.skip').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'main');
  await page.keyboard.press('Tab');
  assert.ok(
    await page
      .getByRole('link', { name: 'Studio completo', exact: true })
      .evaluate((el) => el === document.activeElement && parseFloat(getComputedStyle(el).outlineWidth) >= 2),
  );
  await page.keyboard.press('Enter');
  await page.locator('.catalog-row').first().waitFor();
  assert.equal(await page.locator('.catalog-row').count(), 6);
  await advance(page, page.locator('a[href="#corso/C1"]'), '.c1-paths');
  await page.getByText('Indice del microcorso e accesso', { exact: true }).click();
  await advance(page, page.getByRole('link', { name: 'Leggi un’anteprima' }), '.reader');
  assert.ok((await page.locator('.reader .katex').count()) > 0);
  await advance(page, page.getByRole('link', { name: 'Segui un esempio' }), '.exercise-prompt');
  await page.getByRole('button', { name: 'Un passaggio alla volta' }).click();
  await page.getByRole('button', { name: 'Mostra tutto' }).click();
  await visit(page, 'accedi/nuovo/studio', '#auth');
  await page.getByLabel('Email', { exact: true }).fill('studente@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill('Officina-verifica-2026!');
  await page.locator('#auth button[type=submit],#auth button.solid').click();
  await page.locator('#logout').waitFor();
  await visit(page, 'acquisto/C1', '#order');
  await screen(page, 'ordine-verifica');
  await page.locator('#order input[type=checkbox]').check();
  await advance(page, page.locator('#order button.solid'), '.order .stamp');
  assert.equal(await page.locator('.order .stamp').first().innerText(), 'in attesa');
  const author = await browser.newContext({ viewport: { width: 1280, height: 900 } }),
    admin = await author.newPage();
  watch(admin);
  const ticket = spawnSync(
    'python3',
    [
      '-c',
      'from server.store import *\nt=secrets.token_urlsafe(32)\nwith connect() as d:d.execute("insert into tickets values(?,?)",(digest(t),NOW()+90))\nprint(t)',
    ],
    { cwd: root, env, encoding: 'utf8' },
  ).stdout.trim();
  await visit(admin, 'autore-accesso/' + ticket, 'main h1');
  await admin.waitForURL('**/#autore');
  await visit(admin, 'amministrazione', '.check-order');
  await admin.locator('.check-order [name=amount]').fill('1,00');
  await admin.locator('.check-order input[type=checkbox]').check();
  await admin.locator('.check-order button').click();
  await admin.getByText('confermato', { exact: true }).first().waitFor();
  await page.locator('#update-studio').click();
  await page.locator('a[href="#corso/C1"]').first().waitFor();
  await visit(page, 'materiale/C1-L005/C1', '.reader');
  await screen(page, 'lezione');
  await page.locator('#read').click();
  await page.getByText('Lettura registrata', { exact: true }).waitFor();
  await visit(page, 'materiale/C1-Q001/C1', '#single');
  await advance(page, page.locator('#single'), '#response');
  await page.locator('#response [name=value]').fill('250');
  await page.locator('#response button.solid').click();
  await page.getByRole('heading', { name: 'Risposta corretta' }).waitFor();
  await page.locator('.feedback').scrollIntoViewIfNeeded();
  await screen(page, 'risposta-spiegata');
  await page.locator('#finish').click();
  await page.getByRole('heading', { name: 'Esito della consegna' }).waitFor();
  const phone = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    deviceScaleFactor: 1,
    hasTouch: true,
  });
  const p = await phone.newPage();
  watch(p);
  await visit(p, 'home', '.hero');
  const phonePortrait = p.locator('[data-mascotte]');
  await phonePortrait.locator('img').evaluate((img) => img.decode());
  await noOverflow(p);
  await screen(p, 'copertina-mobile');
  await phonePortrait.tap();
  assert.equal(await phonePortrait.getAttribute('aria-pressed'), 'true');
  await phonePortrait.tap();
  assert.equal(await phonePortrait.getAttribute('aria-pressed'), 'false');
  await p.getByRole('button', { name: 'Prova un esperimento' }).tap();
  assert.equal(await p.evaluate(() => document.activeElement.id), 'prova-titolo');
  await visit(p, 'accedi/entra/studio', '#auth');
  await p.getByLabel('Email', { exact: true }).fill('studente@example.invalid');
  await p.getByLabel('Password', { exact: true }).fill('Officina-verifica-2026!');
  await p.locator('#auth button.solid').click();
  await p.getByText('prima evidenza', { exact: false }).first().waitFor();
  assert.ok((await p.locator('main').innerText()).includes('Isolare un corpo'));
  await noOverflow(p);
  await signedAreasFlow(page, 'desktop');
  await signedAreasFlow(p, 'mobile');
  if (process.argv.includes('--c1')) {
    assert.deepEqual(logs.filter(s => !s.includes('favicon')), [], 'Console');
    console.log('PASS · Entrambi i percorsi C1, metodo condiviso, risposta +2 m e quattro figure su desktop (1440×960) e mobile (390×844).');
    return;
  }
  await revisedLearning(page, 'desktop', visit, noOverflow, shots);
  await revisedLearning(p, 'mobile', visit, noOverflow, shots);
  await visit(p, 'materiale/C1-L005/C1', '.reader');
  await noOverflow(p);
  await guidedReading(p, 'C1-E018', 'C1', [[0, 1, 2], [3, 4], [5, 6]]);
  await visit(p, 'lab/LAB-C1', '#meters');
  await noOverflow(p);
  await p.locator('[data-phase="2"]').click();
  const phoneForce = p.locator('#val-F');
  await phoneForce.fill('20');
  await phoneForce.press('Tab');
  assert.ok((await p.locator('#meters').innerText()).includes('m/s²'));
  const demo = await browser.newContext({ viewport: { width: 810, height: 1080 }, hasTouch: true }),
    tablet = await demo.newPage();
  watch(tablet);
  await visit(tablet, 'studio', '#demo');
  await tablet.locator('#demo').click();
  await tablet.locator('#logout').waitFor();
  const studyEvidence = async () => {
    const s = await (await tablet.request.get(url + 'api/studio')).json();
    return [s.reads, s.skills, s.lastRuns, s.labCount];
  };
  const priorEvidence = await studyEvidence();
  await guidedReading(tablet, 'C6-AE01', 'C6', [[0, 1, 2], [3, 4], [5, 6, 7]], 'esempio-per-passaggi');
  await guidedReading(tablet, 'C4-E018', 'C4', [[0], [1, 2]]);
  const originExample = await guidedReading(tablet, 'C1-E018', 'C1', [[0, 1, 2], [3, 4], [5, 6]]);
  const sharedExample = await guidedReading(tablet, 'C1-E018', 'C6', [[0, 1, 2], [3, 4], [5, 6]]);
  assert.equal(originExample, sharedExample);
  await guidedReading(tablet, 'C5-L10', 'C5', [[0, 1, 2, 3], [4, 5]]);
  assert.deepEqual(await studyEvidence(), priorEvidence);
  await visit(tablet, 'corso/C6', '.method-intro');
  await advance(tablet, tablet.getByRole('link', { name: 'Apri le lezioni' }), '.course-volume');
  assert.ok(tablet.url().endsWith('#corso/C6/lezioni'));
  const volumes = tablet.locator('.course-volume');
  assert.equal(await volumes.count(), 6);
  const thermo = volumes.filter({ has: tablet.locator('.volume-code', { hasText: /^C3$/ }) });
  await thermo.locator(':scope > summary').click();
  const firstLesson = thermo.locator('a').first();
  assert.equal(await firstLesson.getAttribute('href'), '#materiale/C3-L01/C6');
  const lessonName = await firstLesson.locator('strong').innerText();
  assert.equal(await thermo.getByText(lessonName, { exact: true }).count(), 1);
  await advance(tablet, firstLesson, '.reader');
  assert.equal(await tablet.locator('.reader h1').innerText(), lessonName);
  await advance(tablet, tablet.locator('.crumb a[href="#corso/C6/lezioni"]'), '.course-volume');
  assert.equal(await volumes.count(), 6);
  await visit(tablet, 'corso/C2', '.tabs');
  await advance(tablet, tablet.getByRole('link', { name: 'Errori e recupero' }), '#choose-recovery');
  await tablet.getByLabel('Competenza', { exact: true }).selectOption('C2-L007');
  await tablet.getByLabel('Situazione', { exact: true }).selectOption('C2-Q062');
  await tablet.getByRole('button', { name: 'Apri la scheda di recupero' }).click();
  await tablet.getByRole('link', { name: 'Osserva il laboratorio' }).waitFor();
  assert.equal(
    await tablet.getByRole('link', { name: 'Osserva il laboratorio' }).getAttribute('href'),
    '#lab/LAB-C2/C2',
  );
  await tablet.locator('#scheda-recupero summary').click();
  await tablet.locator('#scheda-recupero .katex').first().waitFor();
  await noOverflow(tablet);
  const scenarioText = await tablet.locator('#scheda-recupero .reader > p').first().innerText();
  await advance(tablet, tablet.locator('#recovery-retest'), '#response');
  assert.notEqual(await tablet.locator('.exercise-prompt').innerText(), scenarioText);
  for (const c of ['C1', 'C2', 'C3', 'C4', 'C5']) {
    await visit(tablet, 'lab/LAB-' + c, '#lab-view svg');
    await tablet.locator('[data-phase="2"]').click();
    const before = await tablet.locator('#meters').innerText();
    const field = tablet.locator('.labfields input[type=number]').first();
    await field.fill({ C1: '0.5', C2: '0.5', C3: '2', C4: '12', C5: '5' }[c]);
    await field.press('Tab');
    assert.notEqual(await tablet.locator('#meters').innerText(), before);
    await noOverflow(tablet);
    if (c === 'C2') {
      await screen(tablet, 'laboratorio-tablet');
      await tablet.locator('[data-phase="0"]').click();
      await tablet.locator('#prediction').fill('Prevedo un sedicesimo della portata.');
      await tablet.locator('[data-phase="4"]').click();
      await tablet.locator('#lab-note').fill('Il rapporto con raggio 1 mm vale 0,0625.');
      await tablet.locator('#save-observation').click();
      await tablet.getByText('Osservazione registrata nel tuo studio.').waitFor();
    }
    if (c === 'C5') {
      await tablet.locator('#val-f').fill('10');
      await tablet.locator('#val-f').press('Tab');
      await tablet.locator('#val-p').fill('10');
      await tablet.locator('#val-p').press('Tab');
      assert.ok((await tablet.locator('#meters').innerText()).includes('∞'));
    }
    await tablet.locator('[data-phase="2"]').click();
    await tablet.locator('#reset').click();
    assert.equal(await tablet.locator('#meters').innerText(), before);
  }
  await visit(tablet, 'allenamento/C6', '#exam-1');
  await advance(tablet, tablet.locator('#exam-1'), '#clock');
  assert.equal(await tablet.locator('.pager button').count(), 31);
  assert.equal(await tablet.locator('#response input[type=radio]').count(), 5);
  await tablet.locator('#response input[type=radio]').first().check();
  await tablet.locator('#response button.solid').click();
  await tablet.getByText('Risposta registrata.', { exact: false }).first().waitFor();
  assert.equal(await tablet.locator('.feedback').count(), 0);
  await tablet.locator('#finish').click();
  await tablet.getByRole('heading', { name: 'Esito della consegna' }).waitFor();
  await visit(tablet, 'studio', '#logout');
  assert.ok((await tablet.locator('main').innerText()).includes('laboratorio salvate · 1'));
  await visit(admin, 'edizioni', '.tablebox');
  assert.equal(await admin.getByText('Allineato', { exact: true }).count(), 13);
  const pdfLinks = await admin
    .locator('a[href^="/download/"]')
    .evaluateAll((links) => links.map((a) => a.pathname));
  assert.equal(pdfLinks.length, 13);
  for (const route of pdfLinks) {
    const response = await tablet.request.get(new URL(route, url).href);
    assert.equal(response.status(), 200);
    assert.equal(response.headers()['content-type'], 'application/pdf');
    const [, , course, book] = route.split('/');
    assert.ok(
      (await response.body()).equals(
        await readFile(path.join(root, 'materials', course + '-' + book + '.pdf')),
      ),
    );
  }
  await visit(admin, 'autore', 'main h1');
  const fatal = logs.filter((s) => !s.includes('favicon'));
  assert.deepEqual(fatal, [], 'Console');
  console.log(
    'PASS · copertina, catalogo, lezione, esempio, account, bonifico, conferma, ripresa su secondo client, 5 laboratori, simulazione, PDF, accesso autore. Viewport 1440×960, 810×1080, 390×844.',
  );
}
try {
  await runAcceptance();
} finally {
  await browser?.close();
  app.kill();
  await rm(scratch, { force: true, recursive: true });
}
