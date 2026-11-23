// Record the real browser surface, including the instrument, simulated time and graph.
import { chromium } from 'playwright';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
const [origin, output] = process.argv.slice(2);
if (!origin || !output) throw Error('Uso: node tools/registra-movimento.mjs URL-locale cartella');
const url = new URL(origin);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname))
  throw Error('Usa il server di collaudo locale.');
const tmp = await mkdtemp(path.join(tmpdir(), 'cric-registrazioni-'));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-swiftshader'] });
const cases = [
  ['C1', 'LAB3D-02', '0.25'],
  ['C2', 'LAB3D-04', '1'],
  ['C3', 'LAB3D-05', '1'],
  ['C4', 'SIM-C4-L10-02', '0.5'],
  ['C5', 'LAB3D-10', '0.5'],
];
try {
  for (const [course, id, rate] of cases) {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
      recordVideo: { dir: tmp, size: { width: 1280, height: 800 } },
    });
    await ctx.request.post(new URL('api/demo', url).href, {
      headers: { 'X-Astra-Request': '1' },
      data: {},
    });
    const page = await ctx.newPage();
    await page.goto(url.href + '#banco/' + id);
    await page.getByText('3D interattivo', { exact: true }).waitFor();
    await page.locator('[name=prediction]').first().check();
    await page.locator('[data-predict] button').click();
    await page.locator('[data-phase="2"]').click();
    if (course === 'C4') await page.locator('[name=circuit]').selectOption('closed');
    if (course === 'C5') await page.locator('[data-view="top"]').click();
    await page.locator('.time-options summary').click();
    await page.locator('[data-rate]').selectOption(rate);
    await page.locator('[data-loop]').check();
    await page.locator('.time-options summary').click();
    if (await page.locator('[data-controls]').evaluate((el) => el.open))
      await page.locator('[data-controls] summary').click();
    await page
      .locator('.lab-path')
      .evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.locator('[data-play]').click();
    await page.mouse.move(8, 8);
    await page.waitForTimeout(5700);
    await page.locator('[data-play]').click();
    await page.waitForTimeout(300);
    const video = page.video();
    await ctx.close();
    const original = await video.path();
    execFileSync('ffmpeg', [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-sseof',
      '-5.8',
      '-i',
      original,
      '-an',
      '-vf',
      'scale=1152:-2,crop=1152:640:0:0',
      '-c:v',
      'libx264',
      '-crf',
      '23',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      path.join(output, course + '.mp4'),
    ]);
    console.log(course, id);
  }
} finally {
  await browser.close();
  await rm(tmp, { recursive: true, force: true });
}
