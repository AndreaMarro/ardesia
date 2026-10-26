// Exact private client artifact, real browser, no seeded remote user or fake API.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium, request, expect } from '@playwright/test';

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, all) => {
  if (value.startsWith('--')) pairs.push([value.slice(2), all[index + 1]]);
  return pairs;
}, []));
if (!args.prepared || !args.origin || !args.output) throw new Error('--prepared --origin --output required');
const origin = new URL(args.origin).origin;
const local = new URL(origin).hostname === '127.0.0.1';
if (!local && (!origin.startsWith('https://') || !new URL(origin).hostname.endsWith('.vercel.app'))) {
  throw new Error('Use the exact protected Vercel origin or loopback');
}
const receipt = JSON.parse(await readFile(path.join(args.prepared, 'preview-manifest.json')));
if (receipt.kind !== 'private-integrated-preview-preparation') throw new Error('Private artifact required');
const report = { schemaVersion: 1, origin, scope: 'PRIVATE_INTEGRATED_PREVIEW',
  binding: receipt.binding, lineage: receipt.lineage, checks: [],
  limits: ['Client-only preview; backend missing is a tested failure state, not remote beta acceptance.',
    'No real student data, hardware microphone or scientific/editorial human approval.',
    'Local Studio storage does not prove remote persistence or multiuser authorization.'] };
const check = (name, passed, detail) => {
  report.checks.push({ name, passed, ...(detail === undefined ? {} : { detail }) });
  if (!passed) throw new Error(`Check failed: ${name}`);
};
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
let browser, context, anonymous;
await mkdir(args.output, { recursive: true });
try {
  anonymous = await request.newContext();
  if (!local) {
    for (const route of ['/ops/release/', '/', '/studio/', '/release-manifest.json']) {
      const response = await anonymous.get(origin + route, { maxRedirects: 0 });
      check('unauthenticated_gate:' + route, [301, 302, 303, 307, 308, 401, 403].includes(response.status()), response.status());
    }
  } else report.sso = 'NOT_APPLICABLE_LOOPBACK';
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } });
  if (!local) {
    if (!args['access-file']) throw new Error('A short-lived operator access file is required');
    const access = JSON.parse(await readFile(args['access-file']));
    if (new URL(access.url).origin !== origin) throw new Error('Access origin mismatch');
    const grant = await context.request.get(access.url);
    check('temporary_operator_access', grant.ok());
  }
  for (const [name, digest] of Object.entries(receipt.staticAssetsSha256)) {
    const response = await context.request.get(origin + '/' + name);
    check('exact_asset:' + name, response.ok() && hash(await response.body()) === digest);
  }
  for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
    const response = await context.request.fetch(origin + '/study/me', { method });
    const value = await response.json();
    check('backend_missing:' + method, response.status() === 503 && value.error === 'backend_not_configured');
  }
  for (const route of ['/courses-manifest.json', '/source-manifest.json', '/esperienza/', '/esempi/', '/studio/unknown', '/assets/']) {
    const response = await context.request.get(origin + route);
    check('closed_route:' + route, response.status() === 404, response.status());
  }
  const page = await context.newPage();
  const errors = [], external = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', req => { if (/^https?:/.test(req.url()) && new URL(req.url()).origin !== origin) external.push(new URL(req.url()).origin); });
  for (const width of [360, 390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(origin + '/?view=courses');
    await expect(page.getByRole('button', { name: /accedi/i }).first()).toBeVisible();
    check('no_horizontal_overflow:web:' + width, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.keyboard.press('Tab');
    check('keyboard_focus:web:' + width, await page.evaluate(() => document.activeElement !== document.body));
    await page.screenshot({ path: path.join(args.output, 'web-' + width + '.png'), fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const studioConsole = [];
  page.on('console', message => { if (message.type() === 'error') studioConsole.push(message.text()); });
  await page.goto(origin + '/studio');
  await page.getByRole('button', { name: 'formula', exact: true }).click();
  await page.locator('math-field').waitFor();
  const loaded = page.waitForResponse(response => response.url() === origin + '/studio/mathjax/tex-svg-full.js');
  await page.getByRole('button', { name: /inserisci sulla lavagna/i }).click();
  check('mathjax_local_browser_bundle', (await loaded).ok());
  await expect(page.locator('math-field')).toHaveCount(0);
  check('mathjax_actual_svg', await page.evaluate(() => Boolean(window.MathJax?.tex2svg('x^2').querySelector('svg path'))));
  await expect(page.getByText(/Inserimento formula non riuscito/)).toHaveCount(0);
  await page.screenshot({ path: path.join(args.output, 'studio-formula.png'), fullPage: true });
  await page.reload();
  await page.getByRole('button', { name: 'formula', exact: true }).waitFor();
  check('no_page_errors', errors.length === 0, errors);
  check('no_studio_console_errors', studioConsole.length === 0, studioConsole);
  check('no_external_runtime_requests', external.length === 0, [...new Set(external)]);
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL';
  report.failure = error.message;
  process.exitCode = 1;
} finally {
  await Promise.allSettled([browser?.close(), anonymous?.dispose()]);
  await writeFile(path.join(args.output, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, failure: report.failure }));
}
