/** Private synthetic verification: one Chromium, real Core HTTP, no external sends. */
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.ARDESIA_WEB_URL;
const accessFile = process.env.ARDESIA_DEMO_ACCESS;
const output = process.env.ARDESIA_QA_OUTPUT;
if (!baseURL || !accessFile || !output || !/^http:\/\/127\.0\.0\.1:\d+$/.test(baseURL)) throw Error('Explicit loopback URL, synthetic access and output directory required');
const access = JSON.parse(await readFile(accessFile, 'utf8'));
assert.equal(access.synthetic, true);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const contexts = [];
const errors = [], consoleErrors = [];
const expectedRejections = [];
let revoking = false;
const evidence = { synthetic: true, baseURL, browser: 'Chromium', browserPlugin: 'Absent; repository Playwright used', checks: [], editionId: null };
async function login(alias) {
  const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  contexts.push(context);
  const response = await context.request.post('/study/session', { data: { token: access.tokens[alias] } });
  assert.equal(response.status(), 200);
  return context;
}
try {
  const teacher = await login('tutor-synthetic'), page = await teacher.newPage();
  page.setDefaultTimeout(20000);
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    if (revoking && /status of 401/.test(message.text())) expectedRejections.push(message.text());
    else consoleErrors.push(message.text());
  });
  await page.goto('/?view=courses&edition=fluidi');
  assert.match(await page.title(), /Ardesia/);
  await expect(page.getByRole('heading', { name: 'I tuoi mini-corsi.' })).toBeVisible();
  await page.getByRole('button', { name: 'Nuova edizione', exact: true }).click();
  await page.getByLabel('Programma', { exact: true }).selectOption('taylor-exp-v1');
  const created = page.waitForResponse((response) => new URL(response.url()).pathname === '/study/admin/editions' && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Crea bozza privata' }).click();
  const response = await created; assert.equal(response.status(), 200);
  const eid = (await response.json()).edition.id; evidence.editionId = eid;
  await expect(page).toHaveURL(new RegExp('edition=' + eid));
  const management = page.getByText('Gestisci date e offerta', { exact: true });
  if (!(await management.locator('..').getAttribute('open') !== null)) await management.click();
  for (const [index, day] of [6, 8, 13, 15].entries()) await page.getByLabel(`Incontro ${index + 1} · inizio`, { exact: true }).fill(`2026-01-${String(day).padStart(2, '0')}T18:00`);
  await page.getByRole('button', { name: 'Salva date e condizioni', exact: true }).click();
  await expect(page.getByText('Date e condizioni salvate.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Rileggi l’offerta completa' }).click();
  await page.getByLabel('Ho riletto le quattro date, i posti e il prezzo indicativo.', { exact: false }).check();
  await page.getByRole('button', { name: 'Conferma offerta di test', exact: true }).click();
  await expect(page.getByText('Offerta di test confermata. Nessun addebito o invito è stato inviato.')).toBeVisible();
  evidence.checks.push('CoursePack Taylor: create/date/capacity/preview/offer through actual UI');

  const learners = [];
  for (let i = 1; i <= 12; i++) learners.push(await login(`student-${String(i).padStart(2, '0')}`));
  const reserve = (context, key) => context.request.post(`/study/editions/${eid}/holds`, { data: {}, headers: { 'Idempotency-Key': key } });
  const confirm = (context, hold, key) => context.request.post(`/study/holds/${hold}/confirm`, { data: {}, headers: { 'Idempotency-Key': key } });
  for (const [index, learner] of learners.slice(0, 9).entries()) {
    const holdResponse = await reserve(learner, `s09-${eid}-${index}`); assert.equal(holdResponse.status(), 200);
    assert.equal((await confirm(learner, (await holdResponse.json()).id, `s09-confirm-${eid}`)).status(), 200);
  }
  const competing = await Promise.all(learners.slice(9, 11).map((context) => reserve(context, `s09-race-${eid}`)));
  assert.deepEqual(competing.map((item) => item.status()).sort(), [200, 409]);
  const winner = competing.findIndex((item) => item.status() === 200), hold = await competing[winner].json();
  assert.equal((await confirm(learners[9 + winner], hold.id, `s09-race-confirm-${eid}`)).status(), 200);
  assert.deepEqual(await (await reserve(learners[9 + winner], `s09-race-${eid}`)).json(), hold);
  assert.equal((await reserve(learners[11], `s09-wait-${eid}`)).status(), 409);
  assert.equal((await reserve(learners[11], `s09-wait-${eid}`)).status(), 409);
  const roster = await teacher.request.get(`/study/admin/editions/${eid}/attendance`);
  assert.equal(roster.status(), 200);
  const admission = (await roster.json()).admission;
  assert.equal(admission.confirmedCount, 10); assert.equal(admission.waitlistedCount, 2); assert.equal(admission.activeHoldCount, 0);
  evidence.admission = admission;
  evidence.checks.push('Real HTTP last-seat race, exact replay, 10 members and 2 waiting');

  await page.reload();
  const register = page.locator('details.edition-register');
  await register.locator('summary').first().click();
  await register.getByRole('button', { name: 'Registra per student-01', exact: true }).click();
  await register.getByLabel('Stato di presenza', { exact: true }).selectOption('PRESENT');
  await register.getByLabel('Nota sulla dichiarazione (facoltativa)', { exact: true }).fill('Presenza sintetica verificata da S09');
  await register.getByRole('button', { name: 'Registra dichiarazione', exact: true }).click();
  await expect(register.getByText('Dichiarazione manuale acquisita', { exact: false })).toBeVisible();
  await register.getByText('Nuova annotazione manuale', { exact: true }).first().click();
  const payment = register.getByRole('form', { name: 'Nuova annotazione manuale', exact: true });
  await payment.getByLabel('Partecipante', { exact: true }).selectOption('student-01');
  await payment.getByLabel('Importo (€)', { exact: true }).fill('12,00');
  await payment.getByLabel('Riferimento esterno', { exact: true }).fill(`S09-${eid}`);
  await payment.getByRole('button', { name: 'Registra annotazione manuale', exact: true }).click();
  await expect(register.getByText('Annotazione manuale acquisita', { exact: false })).toBeVisible();
  evidence.checks.push('Actual attendance and manual payment UI persist canonical records');

  const operations = page.getByRole('region', { name: 'Gestione operativa tutor', exact: true });
  const disclosure = operations.getByText('Posti, persone e riepilogo economico', { exact: true });
  await disclosure.focus(); await page.keyboard.press('Enter');
  await expect(operations.getByRole('heading', { name: 'Previsione e incassi, distinti' })).toBeVisible();
  await expect(operations.getByText('non determinati', { exact: true })).toBeVisible();
  assert.match(await operations.innerText(), /12,00/);
  for (const [label, filename] of [['Esporta presenze CSV', 'presenze.csv'], ['Esporta pagina incassi CSV', 'incassi-pagina.csv']]) {
    const pending = page.waitForEvent('download'); await operations.getByRole('button', { name: label, exact: true }).click();
    await (await pending).saveAs(path.join(output, filename));
  }
  assert.match(await readFile(path.join(output, 'presenze.csv'), 'utf8'), /PRESENT/);
  assert.match(await readFile(path.join(output, 'incassi-pagina.csv'), 'utf8'), /MANUAL_DECLARATION_ONLY/);
  await operations.getByRole('button', { name: 'Prepara calendario .ics' }).click();
  await expect(operations.getByRole('region', { name: 'Anteprima calendario' })).toBeVisible();
  const calendarDownload = page.waitForEvent('download');
  await operations.getByRole('button', { name: 'Conferma e scarica .ics' }).click();
  await (await calendarDownload).saveAs(path.join(output, 'incontri.ics'));
  const ics = await readFile(path.join(output, 'incontri.ics'), 'utf8');
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, 4); assert.doesNotMatch(ics, /ATTENDEE|VALARM/);
  evidence.checks.push('Keyboard disclosure; CSV and confirmed ICS downloads, no invite/alarm');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await operations.evaluate((element) => element.scrollIntoView({ block: 'start' }));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: path.join(output, `gestionale-${width}.png`) });
  }
  await page.reload(); await page.getByText('Posti, persone e riepilogo economico', { exact: true }).click();
  await expect(page.getByRole('region', { name: 'Gestione operativa tutor' }).getByText('12,00', { exact: false }).first()).toBeVisible();
  evidence.checks.push('Reload and responsive 1440/390, no horizontal overflow');
  const other = await login('tutor-other');
  for (const context of [other, learners[0]]) for (const endpoint of ['attendance', 'manual-payments']) assert.equal((await context.request.get(`/study/admin/editions/${eid}/${endpoint}`)).status(), 403);
  assert.equal((await learners[0].request.get(`/study/workspace?editionId=${eid}`)).status(), 200);
  const balances = await teacher.request.get(`/study/admin/editions/${eid}/manual-payments`);
  assert.equal((await balances.json()).summary.totalMinor, 1200);
  evidence.checks.push('Other tutor/student administrative403; enrolled student personal workspace200');
  revoking = true;
  assert.equal((await teacher.request.post('/study/session/revoke-all', { data: {} })).status(), 200);
  await page.getByRole('button', { name: 'Aggiorna riepilogo', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Gestione operativa tutor' })).toHaveCount(0);
  evidence.checks.push('Actual session revocation removes private data');
  assert.deepEqual(errors, []); assert.deepEqual(consoleErrors, []);
  evidence.pageErrors = errors; evidence.consoleErrors = consoleErrors; evidence.expectedRevocationConsole = expectedRejections;
  evidence.result = 'PASS';
  await writeFile(path.join(output, 'browser-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ result: 'PASS', checks: evidence.checks, output }) + '\n');
} catch (error) {
  evidence.result = 'FAIL'; evidence.error = error.message; evidence.pageErrors = errors; evidence.consoleErrors = consoleErrors;
  await writeFile(path.join(output, 'browser-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
  throw error;
} finally { await Promise.allSettled(contexts.map((context) => context.close())); await browser.close(); }
