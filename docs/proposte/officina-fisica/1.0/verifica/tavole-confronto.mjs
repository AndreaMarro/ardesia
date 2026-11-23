// Annotazioni esterne al prototipo. L'immagine di partenza è una cattura Playwright
// alla risoluzione originale. I riquadri usano i DOMRect letti prima dello scatto.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dossier = fileURLToPath(new URL('../', import.meta.url));
const product = path.resolve(dossier, '../../../../officina-di-fisica');
const require = createRequire(
  path.join(process.env.OFFICINA_DEPS || product, 'package.json'),
);
const { chromium } = require('playwright');
const [work, publish] = process.argv.slice(2);
if (!work || !publish)
  throw Error('Indicare la directory delle catture e quella di pubblicazione.');
await mkdir(path.join(publish, 'schermate'), { recursive: true });
const metrics = await readFile(path.join(work, 'misure.json'), 'utf8');
const result = JSON.parse(metrics);
const stateTitles = Object.fromEntries(result.states);
const title = (s) => s[0].toUpperCase() + s.slice(1);
const output = async (name, url) =>
  writeFile(path.join(publish, name), Buffer.from(url.split(',')[1], 'base64'));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const font = await readFile(
    path.join(product, 'static/type/worksans2.woff2'),
  );
  await page.setContent(
    `<style>@font-face{font-family:Annotazioni;src:url(data:font/woff2;base64,${font.toString('base64')});font-weight:100 900}</style>`,
  );
  await page.evaluate(() =>
    Promise.all([
      document.fonts.load('500 15px Annotazioni'),
      document.fonts.load('650 23px Annotazioni'),
    ]),
  );
  for (const c of result.cases) {
    const raw = await readFile(path.join(work, 'catture', c.id + '.png'));
    const uri = await page.evaluate(
      async ({ c, raw, heading, concept }) => {
        const pic = new Image();
        pic.src = 'data:image/png;base64,' + raw;
        await pic.decode();
        if (pic.naturalWidth !== c.width || pic.naturalHeight !== c.height)
          throw Error('Dimensioni sorgente diverse dal viewport');
        const side = 18,
          top = 74,
          canvas = document.createElement('canvas');
        canvas.width = c.width + side * 2;
        canvas.height = top + c.height + (c.device === 'mobile' ? 205 : 111);
        const g = canvas.getContext('2d');
        g.fillStyle = '#f5f4ed';
        g.fillRect(0, 0, canvas.width, canvas.height);
        g.fillStyle = '#182521';
        g.textBaseline = 'top';
        g.font = '650 24px Annotazioni';
        g.fillText(concept, side, 10);
        g.font = '500 15px Annotazioni';
        g.textAlign = 'right';
        g.fillText(c.width + ' × ' + c.height, canvas.width - side, 15);
        g.textAlign = 'left';
        g.fillText(heading, side, 44);
        g.drawImage(pic, side, top);
        g.strokeStyle = '#a4ada5';
        g.lineWidth = 1;
        g.strokeRect(side - 0.5, top - 0.5, c.width + 1, c.height + 1);
        const colors = ['#1341a2', '#8c3610'];
        function marker(i, x, y) {
          g.fillStyle = colors[i];
          g.fillRect(x, y, 20, 20);
          g.fillStyle = '#fff';
          g.font = '650 14px Annotazioni';
          g.textAlign = 'center';
          g.fillText(i ? 'B' : 'A', x + 10, y + 2.5);
          g.textAlign = 'left';
        }
        function textLines(text, width) {
          const lines = [];
          let ln = '';
          for (const word of text.split(/\s+/)) {
            const next = ln ? ln + ' ' + word : word;
            if (ln && g.measureText(next).width > width) {
              lines.push(ln);
              ln = word;
            } else ln = next;
          }
          lines.push(ln);
          return lines;
        }
        let foot = top + c.height + 14;
        c.annotations.forEach(({ rect, note }, i) => {
          const x = side + rect.x - 2,
            y = top + rect.y - 2,
            w = rect.w + 4,
            h = rect.h + 4;
          g.strokeStyle = 'white';
          g.lineWidth = 3;
          g.strokeRect(x, y, w, h);
          g.strokeStyle = colors[i];
          g.lineWidth = 1.5;
          g.setLineDash(i ? [6, 3] : []);
          g.strokeRect(x, y, w, h);
          g.setLineDash([]);
          // La lettera sta fuori dal contenuto evidenziato, vicino all'angolo sinistro.
          marker(
            i,
            Math.max(0, x - 21),
            Math.min(top + c.height - 20, Math.max(top, y)),
          );
          marker(i, side, foot);
          g.fillStyle = '#182521';
          g.font = '500 16px Annotazioni';
          for (const line of textLines(note, canvas.width - 2 * side - 34)) {
            g.fillText(line, side + 31, foot);
            foot += 21;
          }
          foot += 12;
        });
        if (foot > canvas.height) throw Error('Didascalia tagliata ' + c.id);
        return canvas.toDataURL('image/webp', 0.95);
      },
      {
        c,
        raw: raw.toString('base64'),
        heading: stateTitles[c.state],
        concept: title(c.concept),
      },
    );
    await output('schermate/' + c.id + '.webp', uri);
  }
  for (const [size, state] of [
    ['mobile', 'trasferimento'],
    ['desktop', 'base-errore'],
  ]) {
    const images = await Promise.all(
      result.concepts.map(async (c) =>
        (
          await readFile(
            path.join(
              publish,
              'schermate',
              [size, state, c].join('-') + '.webp',
            ),
          )
        ).toString('base64'),
      ),
    );
    const uri = await page.evaluate(
      async ({ images, size }) => {
        const pics = await Promise.all(
          images.map(async (src) => {
            const im = new Image();
            im.src = 'data:image/webp;base64,' + src;
            await im.decode();
            return im;
          }),
        );
        const w = size === 'mobile' ? pics[0].width : 800,
          h = Math.round((w * pics[0].height) / pics[0].width),
          gutter = 10;
        const canvas = document.createElement('canvas');
        canvas.width = 3 * w + 4 * gutter;
        canvas.height = h + 2 * gutter;
        const g = canvas.getContext('2d');
        g.fillStyle = '#d7dbd5';
        g.fillRect(0, 0, canvas.width, canvas.height);
        g.imageSmoothingQuality = 'high';
        pics.forEach((im, i) =>
          g.drawImage(im, gutter + i * (w + gutter), gutter, w, h),
        );
        return canvas.toDataURL('image/webp', 0.94);
      },
      { images, size },
    );
    await output(size + '-' + state + '.webp', uri);
  }
} finally {
  await browser.close();
}
assert.equal(result.cases.length, 36);
await writeFile(path.join(publish, 'misure.json'), metrics);
const notes = {};
for (const c of result.cases.filter((c) => c.device === 'desktop')) {
  notes[c.state] ??= {};
  notes[c.state][c.concept] = c.annotations.map((a) => a.note);
}
const template = await readFile(
  path.join(dossier, 'revisione/galleria.html'),
  'utf8',
);
const block =
  /<script type="application\/json" id="catalogo">[\s\S]*?<\/script>/;
assert.ok(block.test(template));
const data = JSON.stringify(notes, null, 2).replaceAll('<', '\\u003c');
await writeFile(
  path.join(publish, 'galleria.html'),
  template.replace(
    block,
    () => '<script type="application/json" id="catalogo">' + data + '</script>',
  ),
);
console.log('36 schermate annotate e due tavole di confronto.');
