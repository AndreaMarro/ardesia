import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const origin = process.env.S20_ORIGIN;
const access = JSON.parse(await fs.readFile(path.join(process.env.S20_PRIVATE_DIR, 'access.json'), 'utf8'));
const out = process.env.S20_EVIDENCE_DIR;
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage(), checks = [], errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  assert.equal((await context.request.post(origin + '/study/session', { data: { token: access.student } })).status(), 200);
  for (let attempt = 1; attempt <= 10; attempt++) {
    await page.goto(origin + '/?view=classroom&edition=fluidi');
    await page.getByTestId('learning-journey').waitFor();
    await page.getByRole('button', { name: 'Studia senza distrazioni', exact: true }).click();
    await page.getByRole('dialog', { name: 'Il tuo spazio di studio', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Un aiuto sul vincolo', exact: true }).click();
    await page.getByRole('dialog', { name: 'Riparti da ciò che resta costante', exact: true }).waitFor();
    // No artificial delay: the dialog accepts keyboard input as soon as visible.
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Il tuo spazio di studio', exact: true })).toBeVisible();
    assert.equal(await page.getByRole('dialog').count(), 1);
    await expect(page.getByRole('button', { name: 'Un aiuto sul vincolo', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Studia senza distrazioni', exact: true })).toBeFocused();
    assert.equal(await page.getByRole('dialog').count(), 0);
    checks.push({ name: `immediate nested Escape ${attempt}`, status: 'PASS' });
    console.log('PASS immediate nested Escape', attempt);
  }
  assert.deepEqual(errors, []);
} catch (error) {
  checks.push({ name: 'run', status: 'FAIL', message: error.message, stack: error.stack });
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true }).catch(() => {});
  throw error;
} finally {
  await fs.writeFile(path.join(out, 'dialog-result.json'), JSON.stringify({ checks, errors, browser: browser.version() }, null, 2));
  await context.close(); await browser.close();
}
