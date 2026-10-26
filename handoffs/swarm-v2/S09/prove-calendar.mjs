/** One Chromium, actual HTTP/Core and native calendar; synthetic actors only. */
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.ARDESIA_WEB_URL, output = process.env.ARDESIA_QA_OUTPUT;
if (!baseURL || !/^http:\/\/127\.0\.0\.1:\d+$/.test(baseURL) || !output || !process.env.ARDESIA_DEMO_ACCESS) throw Error('Explicit loopback URL, synthetic access and output required');
const access = JSON.parse(await readFile(process.env.ARDESIA_DEMO_ACCESS, 'utf8'));
assert.equal(access.synthetic, true);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.ARDESIA_REA_PAUSE ? { args: ['--remote-debugging-port=54929'] } : {}) });
const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 1100 }, timezoneId: 'Pacific/Honolulu', locale: 'it-IT', reducedMotion: 'reduce' });
let page, revoking = false;
const errors = [], consoleErrors = [], expectedRejections = [];
const evidence = { synthetic: true, browserTimezone: 'Pacific/Honolulu', calendarTimezone: 'Europe/Rome', checks: [] };
try {
  assert.equal((await context.request.post('/study/session', { data: { token: access.tokens['tutor-synthetic'] } })).status(), 200);
  const created = await context.request.post('/study/admin/editions', { data: { packId: 'taylor-exp-v1', packVersion: 1, capacity: 10, priceMinor: 4900 }, headers: { 'Idempotency-Key': 's09-calendar-create' } });
  assert.equal(created.status(), 200);
  const eid = (await created.json()).edition.id;
  for (const [id, occurrence] of [['fluidi', 'earlier'], [eid, 'later']]) {
    const terms = await (await context.request.get(`/study/admin/editions/${id}`)).json();
    const result = await context.request.patch(`/study/admin/editions/${id}`, { headers: { 'Idempotency-Key': `s09-calendar-dates-v2-${id}-${terms.managementRevision}` }, data: {
      expectedRevision: terms.managementRevision, capacity: 10, priceMinor: terms.priceMinor,
      starts: [{ localStart: `2026-10-25T${occurrence === 'earlier' ? '02:00' : '02:30'}`, occurrence }, ...[3, 5, 10].map((day) => ({ localStart: `2026-11-${String(day).padStart(2, '0')}T${occurrence === 'earlier' ? '18:00' : '19:30'}` }))],
    } });
    assert.equal(result.status(), 200, await result.text());
  }
  evidence.editionId = eid;
  page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') (revoking && /status of 401/.test(message.text()) ? expectedRejections : consoleErrors).push(message.text()); });
  await page.goto('/?view=courses&edition=fluidi');
  const disclosure = page.getByText('Calendario delle edizioni', { exact: true });
  await disclosure.focus(); await page.keyboard.press('Enter');
  const calendar = page.getByRole('region', { name: 'Calendario delle tue edizioni', exact: true });
  await expect(calendar).toBeVisible();
  await calendar.getByLabel('Vai alla data', { exact: true }).fill('2026-10-25');
  await calendar.getByRole('button', { name: 'Lista', exact: true }).click();
  const events = calendar.locator('.tutor-calendar-event');
  await expect(events).toHaveCount(2);
  const select = calendar.getByLabel('Edizioni nel calendario', { exact: true });
  await select.selectOption('fluidi');
  await expect(events).toHaveCount(1);
  // Focus the donor's real interactive event and activate using the keyboard.
  await events.first().focus(); await page.keyboard.press('Enter');
  await expect(calendar.getByText(/GMT\+2.*GMT\+1/)).toBeVisible();
  await expect(calendar.getByRole('link', { name: 'Apri questa edizione' })).toHaveAttribute('href', '?view=courses&edition=fluidi');
  await select.selectOption(eid);
  await expect(events).toHaveCount(1);
  await events.first().click();
  await expect(calendar.getByText(/GMT\+1.*GMT\+1/)).toBeVisible();
  evidence.checks.push('Real HTTP dates with both DST occurrences; historical events; browser Honolulu renders Rome; keyboard selection; filter and edition link');
  for (const view of ['Mese', 'Settimana', 'Giorno', 'Lista']) {
    await calendar.getByRole('button', { name: view, exact: true }).click();
    await expect(calendar.getByRole('button', { name: view, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  const heading = calendar.locator('.tutor-calendar-toolbar h4');
  const before = await heading.innerText();
  await calendar.getByRole('button', { name: 'Periodo successivo' }).click();
  await expect(heading).not.toHaveText(before);
  await calendar.getByRole('button', { name: 'Periodo precedente' }).click();
  await expect(heading).toHaveText(before);
  for (const width of [1440, 820, 390]) {
    await page.setViewportSize({ width, height: 1100 });
    await calendar.scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: path.join(output, `calendario-${width}.png`) });
  }
  evidence.checks.push('All four donor views, previous/next roundtrip; 1440/820/390 no page overflow');
  await page.reload(); await disclosure.click();
  await expect(calendar).toBeVisible();
  await calendar.getByLabel('Vai alla data', { exact: true }).fill('2026-10-25');
  await calendar.getByRole('button', { name: 'Lista', exact: true }).click();
  await expect(calendar.locator('.tutor-calendar-event')).toHaveCount(2);
  evidence.checks.push('Reload rereads same Core dates; no browser calendar persistence or duplicate store');
  if (process.env.ARDESIA_REA_PAUSE) {
    await writeFile(path.join(output, 'rea-page.json'), JSON.stringify({ url: page.url(), cdp: 'http://127.0.0.1:54929' }) + '\n');
    process.stdout.write('REA_READY\n');
    await new Promise((resolve) => process.stdin.once('data', resolve));
  }
  // REA connect can navigate the same page; reopen the existing private summary.
  revoking = true;
  await page.getByText('Posti, persone e riepilogo economico', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Aggiorna riepilogo', exact: true })).toBeVisible();
  assert.equal((await context.request.post('/study/session/revoke-all', { data: {} })).status(), 200);
  await page.getByRole('button', { name: 'Aggiorna riepilogo', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Gestione operativa tutor', exact: true })).toHaveCount(0);
  evidence.checks.push('Actual401 revocation removes calendar and all tutor data');
  assert.deepEqual(errors, []); assert.deepEqual(consoleErrors, []);
  evidence.result = 'PASS'; evidence.errors = errors; evidence.consoleErrors = consoleErrors; evidence.expectedRejections = expectedRejections;
  await writeFile(path.join(output, 'calendar-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
  process.stdout.write(JSON.stringify(evidence) + '\n');
} catch (error) {
  evidence.result = 'FAIL'; evidence.error = error.message; evidence.errors = errors; evidence.consoleErrors = consoleErrors;
  await writeFile(path.join(output, 'calendar-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
  if (page) { await writeFile(path.join(output, 'failure-dom.txt'), await page.locator('body').innerText()).catch(() => {}); await page.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {}); }
  throw error;
} finally { await context.close(); await browser.close(); }
