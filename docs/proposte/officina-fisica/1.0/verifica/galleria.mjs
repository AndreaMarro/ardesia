// Verifica l'indice distribuito insieme alle immagini, dalle normali azioni del browser.
import assert from 'node:assert/strict';
import { readFile, access, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const product = path.resolve(root, '../../../../officina-di-fisica');
const require = createRequire(
  path.join(process.env.OFFICINA_DEPS || product, 'package.json'),
);
const { chromium, webkit } = require('playwright');
const axePath = require.resolve('axe-core/axe.min.js');
const folder = path.join(root, 'revisione');
const dataset = JSON.parse(
  await readFile(path.join(folder, 'misure.json'), 'utf8'),
);
const entry = pathToFileURL(path.join(folder, 'galleria.html')).href;
const reports = [];
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  try {
    for (const [viewportName, width, height] of [
      ['desktop', 1440, 900],
      ['mobile', 390, 844],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height },
        isMobile: viewportName === 'mobile',
        hasTouch: viewportName === 'mobile',
        reducedMotion: 'reduce',
      });
      const issues = [];
      page.on('pageerror', (error) => issues.push(error.message));
      page.on('request', (req) => {
        if (/^https?:/.test(req.url())) issues.push(req.url());
      });
      await page.goto(entry);
      assert.equal(
        await page.locator('[name=device]:checked').inputValue(),
        viewportName,
      );
      let figures = 0;
      for (const device of ['desktop', 'mobile']) {
        await page
          .getByRole('radio', {
            name: device === 'desktop' ? /Desktop/ : /Mobile/,
          })
          .check();
        for (const [state, title] of dataset.states) {
          await page.getByLabel('Momento dell’esercizio').selectOption(state);
          await page.waitForFunction(
            (fragment) => location.hash === fragment,
            '#' + device + '/' + state,
          );
          const expected = dataset.cases.filter(
            (c) => c.device === device && c.state === state,
          );
          const imageNodes = page.locator('#plates figure');
          assert.equal(await imageNodes.count(), 3);
          for (const [index, source] of expected.entries()) {
            const fig = imageNodes.nth(index);
            const href = 'schermate/' + source.id + '.webp';
            await fig.locator('img').evaluate(async (img, src) => {
              if (img.getAttribute('src') !== src)
                throw Error('Immagine dello stato precedente');
              await img.decode();
            }, href);
            assert.equal(await fig.locator('a').getAttribute('href'), href);
            assert.ok(
              (await fig.locator('img').getAttribute('alt')).includes(title),
            );
            assert.deepEqual(
              await fig.locator('figcaption p').allTextContents(),
              source.annotations.map((a, i) => (i ? 'B' : 'A') + a.note),
            );
            const dims = await fig
              .locator('img')
              .evaluate((img) => [img.naturalWidth, img.naturalHeight]);
            assert.deepEqual(dims, [
              source.width + 36,
              source.height + 74 + (device === 'mobile' ? 205 : 111),
            ]);
            figures++;
          }
          const bounds = await page
            .locator('#plates figure')
            .evaluateAll((figs) =>
              figs.map((f) => {
                const b = f.getBoundingClientRect();
                return [b.left, b.top, b.right];
              }),
            );
          if (viewportName === 'desktop')
            assert.ok(
              bounds[0][1] === bounds[2][1] && bounds[0][2] <= bounds[1][0],
            );
          else
            assert.ok(
              bounds[0][0] === bounds[2][0] && bounds[0][1] < bounds[1][1],
            );
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
        }
      }
      await page.getByLabel('Momento dell’esercizio').focus();
      // La selezione nativa su macOS accetta la prima lettera dell'opzione.
      await page.keyboard.press('i');
      await page.waitForFunction(() => location.hash === '#mobile/segno');
      await page.getByRole('radio', { name: /Mobile/ }).focus();
      await page.keyboard.press('ArrowLeft');
      await page.waitForFunction(() => location.hash === '#desktop/segno');
      await page.reload();
      assert.equal(
        await page.getByLabel('Momento dell’esercizio').inputValue(),
        'segno',
      );
      await page.addScriptTag({ path: axePath });
      const issuesAxe = await page.evaluate(async () => {
        const r = await window.axe.run(document, {
          runOnly: {
            type: 'tag',
            values: [
              'wcag2a',
              'wcag2aa',
              'wcag21a',
              'wcag21aa',
              'wcag22a',
              'wcag22aa',
            ],
          },
        });
        return {
          violations: r.violations.map((v) => v.id),
          incomplete: r.incomplete.map((v) => v.id),
        };
      });
      assert.deepEqual(issuesAxe.violations, []);
      assert.deepEqual(issues, []);
      for (const link of await page
        .locator('main > p a')
        .evaluateAll((links) => links.map((el) => el.href)))
        await access(fileURLToPath(link));
      reports.push({
        engine: engine.name(),
        version: browser.version(),
        viewport: viewportName,
        combinations: 12,
        figures,
        keyboard: true,
        axe: issuesAxe,
      });
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
const output = JSON.stringify(reports, null, 2) + '\n';
if (process.argv[2]) await writeFile(process.argv[2], output);
console.log(output);
