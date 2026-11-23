// Riproduce gli stessi sei momenti nel file HTML pubblicato. Le catture grezze e i DOM
// statici per Taste restano nella directory di lavoro indicata da chi esegue la prova.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dossier = fileURLToPath(new URL('../', import.meta.url));
const product = path.resolve(dossier, '../../../../officina-di-fisica');
const require = createRequire(
  path.join(process.env.OFFICINA_DEPS || product, 'package.json'),
);
const { chromium } = require('playwright');
const dest = process.argv[2];
if (!dest)
  throw Error('Indicare la directory di lavoro per catture, stati e misure.');
for (const dir of ['catture', 'stati'])
  await mkdir(path.join(dest, dir), { recursive: true });
const file = path.join(dossier, 'confronto.html');
const source = JSON.parse(
  await readFile(path.join(product, 'content/C1.json'), 'utf8'),
).find((q) => q.id === 'C1-Q027');
assert.equal(source.version, 2);
assert.equal(source.answer.value, 2);
const reports = [];
const states = [
  ['ingresso', 'Prima di rispondere'],
  ['base-errore', 'Previsione del verso errata'],
  ['trasferimento', 'Passaggio al ritorno di 7 s'],
  ['segno', 'Invio di +2 m'],
  ['ripresa', 'Riapertura dopo l’errore'],
  ['correzione', 'Riapertura dopo la correzione'],
];
const concepts = ['campo', 'passo', 'margine'];
const entryActions = {
  campo: '#predict',
  passo: '#prediction .primary',
  margine: '#notebook .primary',
};
const entryNotes = {
  campo: [
    [
      '#plot svg',
      'La tacca zero dà un riferimento alla posizione. Il tempo si può già spostare.',
    ],
    [
      '#duration',
      'Questo selettore cambia la durata del ritorno. Il cursore sotto la pista cambia invece l’istante osservato.',
    ],
  ],
  passo: [
    [
      '.plot svg',
      'La domanda si legge sul grafico velocità-tempo, con assi, unità e due aree tratteggiate.',
    ],
    [
      '#hint summary',
      'L’indizio è facoltativo. Aprirlo divide le aree in caselle da un metro.',
    ],
  ],
  margine: [
    [
      '.plot svg',
      'I dati del sensore e il grafico restano accanto alle operazioni sul desktop e le precedono sul telefono.',
    ],
    [
      '#formula2',
      'La terza riga riunisce andata e ritorno. Si aggiorna con i due valori scritti sopra.',
    ],
  ],
};
const baseNotes = {
  campo: [
    [
      '#below #phase',
      'La misura restituisce subito la posizione corretta anche dopo la previsione sbagliata.',
    ],
    [
      '#below .stack > p:first-of-type',
      'Il riscontro invita a confrontare due aree. La vista selezionata è ancora la pista.',
    ],
  ],
  passo: [
    [
      '.session .lead',
      'La risposta riprende «Più indietro» e distingue durata e metri percorsi in un secondo.',
    ],
    [
      '.plot svg',
      'Le dodici caselle sopra lo zero e le dieci sotto permettono di controllare la spiegazione.',
    ],
  ],
  margine: [
    [
      '#formula2',
      'I due addendi digitati, +12 e −10 m, restano visibili sulla riga della somma.',
    ],
    [
      '#note2',
      'Il riscontro riguarda lo spostamento. Il focus torna al risultato di questa riga.',
    ],
  ],
};
function notesFor(state, concept) {
  if (state === 'ingresso') return entryNotes[concept];
  if (state === 'base-errore') return baseNotes[concept];
  if (state === 'trasferimento') {
    const context = {
      campo: [
        'h1',
        'Il nome del banco rimane. In questa fase la pista e il selettore delle rappresentazioni scompaiono.',
      ],
      passo: [
        '.rail',
        'La tappa della sessione rimane visibile. Sul telefono si legge «Passo 3 di 3».',
      ],
      margine: [
        '.spread > section:first-child .lead',
        'La consegna del foglio continua a dire 5 s. La nuova domanda, qui sotto o di fianco, specifica 7 s.',
      ],
    };
    return [
      context[concept],
      [
        '#phase + p',
        'Il nuovo caso mantiene +3 m/s per 4 s e porta il ritorno a −2 m/s per 7 s.',
      ],
    ];
  }
  if (state === 'segno')
    return [
      [
        '#tx',
        'Il campo contiene +2. Dopo l’invio riceve il focus e lo stato di errore.',
      ],
      [
        '#tx-message',
        'Il messaggio riconosce la grandezza giusta e chiede da che parte dello zero si finisce.',
      ],
    ];
  if (state === 'ripresa')
    return [
      [
        '#tx',
        'Ricaricando la scheda il campo conserva +2, ma perde lo stato di errore.',
      ],
      [
        '#transfer button',
        'Il messaggio precedente è scomparso. Per rileggerlo occorre verificare di nuovo.',
      ],
    ];
  return [
    [
      '#tx',
      'Dopo la correzione e la ricarica il valore −2 è leggibile con la sua unità.',
    ],
    [
      '#tx-message',
      'La conferma riporta −14 m di ritorno e 12 m di andata. La spiegazione è fornita dall’interfaccia.',
    ],
  ];
}
function collect({ annotations, primary }) {
  const rect = (e) => {
    const r = e.getBoundingClientRect();
    return {
      x: Math.round(r.x),
      y: Math.round(r.y),
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  };
  const inFrame = (r) =>
    r.width > 0 &&
    r.height > 0 &&
    r.top >= -0.5 &&
    r.bottom <= innerHeight + 0.5 &&
    r.left >= -0.5 &&
    r.right <= innerWidth + 0.5;
  const controls = [
    ...document.querySelectorAll(
      'header a,main a[href],main button,main input,main select,main summary',
    ),
  ].filter((e) => !e.disabled && inFrame(e.getBoundingClientRect()));
  const main = document.querySelector('main');
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let words = 0,
    node;
  while ((node = walker.nextNode())) {
    if (node.parentElement.closest('svg,option,.sr,[hidden],.print-only'))
      continue;
    const disclosure = node.parentElement.closest('details:not([open])');
    if (disclosure && !disclosure.querySelector('summary')?.contains(node))
      continue;
    for (const hit of node.textContent.matchAll(
      /[\p{L}\p{N}]+(?:[’.,][\p{L}\p{N}]+)*/gu,
    )) {
      range.setStart(node, hit.index);
      range.setEnd(node, hit.index + hit[0].length);
      if (inFrame(range.getBoundingClientRect())) words++;
    }
  }
  const type = (e) =>
    e
      ? {
          family: getComputedStyle(e).fontFamily,
          px: parseFloat(getComputedStyle(e).fontSize),
        }
      : null;
  const chartLabel = document.querySelector(
    'svg text.svg-text, svg text.ruler-label',
  );
  const transform = chartLabel?.getScreenCTM();
  const field = document.querySelector('#tx');
  return {
    scrollY: Math.round(scrollY),
    documentWidth: document.documentElement.scrollWidth,
    enabledControlsInFrame: controls.length,
    bodyTokensInFrame: words,
    h1: type(main.querySelector('h1')),
    body: type(document.body),
    formula: type(document.querySelector('.eq,.book-sum')),
    axisTextPx: transform
      ? +(
          parseFloat(getComputedStyle(chartLabel).fontSize) *
          Math.hypot(transform.c, transform.d)
        ).toFixed(1)
      : null,
    primaryRect: primary ? rect(document.querySelector(primary)) : null,
    focus:
      document.activeElement.id || document.activeElement.tagName.toLowerCase(),
    transfer: field
      ? {
          value: field.value,
          invalid: field.getAttribute('aria-invalid'),
          feedback: document.querySelector('#tx-message').textContent,
        }
      : null,
    annotations: annotations.map(([selector, note]) => {
      const el = document.querySelector(selector);
      if (!el) throw Error('Elemento assente ' + selector);
      return { selector, note, rect: rect(el) };
    }),
  };
}
function freeze() {
  // Serializzare le proprietà vive del modulo evita di riaprire screenshot
  // apparentemente corretti con un campo vuoto o una vista diversa nell’inspector.
  const clone = document.documentElement.cloneNode(true);
  const controls = document.querySelectorAll('input,select,textarea');
  clone.querySelectorAll('input,select,textarea').forEach((target, i) => {
    const original = controls[i];
    if (target.tagName === 'SELECT') {
      [...target.options].forEach((opt, n) =>
        opt.toggleAttribute('selected', original.options[n].selected),
      );
    } else if (target.tagName === 'TEXTAREA')
      target.textContent = original.value;
    else {
      target.setAttribute('value', original.value);
      target.toggleAttribute('checked', original.checked);
    }
  });
  clone.querySelectorAll('script,noscript').forEach((node) => node.remove());
  return '<!doctype html>\n' + clone.outerHTML;
}
const browser = await chromium.launch();
try {
  for (const [device, width, height] of [
    ['desktop', 1440, 900],
    ['mobile', 390, 844],
  ]) {
    for (const concept of concepts) {
      const ctx = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1,
        isMobile: device === 'mobile',
        hasTouch: device === 'mobile',
        locale: 'it-IT',
        reducedMotion: 'reduce',
      });
      const page = await ctx.newPage(),
        errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('request', (r) => {
        if (/^https?:/.test(r.url())) errors.push(r.url());
      });
      await ctx.setOffline(true);
      await page.goto(pathToFileURL(file).href);
      await page.locator('a[href="#' + concept + '"]').click();
      async function capture(state, anchor) {
        await page.evaluate(() => document.fonts.ready);
        if (anchor)
          await page
            .locator(anchor)
            .evaluate((e) =>
              e.scrollIntoView({ block: 'center', behavior: 'instant' }),
            );
        else
          await page.evaluate(() =>
            window.scrollTo({ top: 0, behavior: 'instant' }),
          );
        await page.evaluate(() => new Promise(requestAnimationFrame));
        const id = [device, state, concept].join('-');
        const metrics = await page.evaluate(collect, {
          annotations: notesFor(state, concept),
          primary: state === 'ingresso' ? entryActions[concept] : null,
        });
        assert.equal(metrics.documentWidth, width, id + ' overflow');
        for (const a of metrics.annotations) {
          const { x, y, w, h } = a.rect;
          assert.ok(
            w > 0 &&
              h > 0 &&
              x >= 0 &&
              x + w <= width + 1 &&
              y >= -1 &&
              y + h <= height + 1,
            id +
              ' richiamo fuori inquadratura ' +
              JSON.stringify(a.rect) +
              ' ' +
              a.selector,
          );
        }
        reports.push({ id, concept, state, device, width, height, ...metrics });
        await page.screenshot({
          path: path.join(dest, 'catture', id + '.png'),
          animations: 'disabled',
        });
        const html = await page.evaluate(freeze);
        const snapshot = path.join(
          dest,
          'stati',
          state + '-' + concept + '.html',
        );
        if (device === 'desktop') await writeFile(snapshot, html);
        else {
          const desktop = await readFile(snapshot, 'utf8');
          assert.equal(
            html,
            desktop,
            id + ' struttura DOM o valori diversi tra formati',
          );
        }
      }
      await capture('ingresso');
      if (concept === 'margine') {
        for (const [n, v] of ['+12', '−10', '−2'].entries())
          await page.locator('#n' + n).fill(v);
        await page.locator('#notebook .primary').click();
        assert.equal(await page.locator(':focus').getAttribute('id'), 'n2');
        assert.match(await page.locator('#note2').innerText(), /addendi/);
      } else {
        if (concept === 'campo') await page.locator('#predict').click();
        await page.getByLabel('Più indietro').check();
        await page.locator('#prediction .primary').click();
        assert.match(
          await page.locator('#phase').innerText(),
          concept === 'campo' ? /\+2 m/ : /due metri/,
        );
      }
      await capture(
        'base-errore',
        concept === 'margine'
          ? '#note2'
          : concept === 'campo'
            ? '#below #phase'
            : '.session .lead',
      );
      if (concept === 'margine') {
        await page.locator('#n2').fill('+2');
        await page.locator('#notebook .primary').click();
      }
      await page.locator('#to-transfer').click();
      assert.equal(await page.locator('#tx').inputValue(), '');
      assert.match(await page.locator('#phase + p').innerText(), /7 s/);
      await capture('trasferimento', '#phase');
      await page.locator('#tx').fill('+2');
      await page.locator('#transfer button').click();
      assert.equal(
        await page.locator('#tx').getAttribute('aria-invalid'),
        'true',
      );
      assert.match(
        await page.locator('#tx-message').innerText(),
        /da che parte dello zero/,
      );
      await capture('segno', '#tx-message');
      await page.reload();
      assert.equal(await page.locator('#tx').inputValue(), '+2');
      assert.equal(await page.locator('#tx-message').innerText(), '');
      assert.equal(
        await page.locator('#tx').getAttribute('aria-invalid'),
        null,
      );
      await capture('ripresa', '#tx');
      await page.locator('#tx').fill('−2');
      await page.locator('#transfer button').click();
      const confirmation = await page.locator('#tx-message').innerText();
      assert.match(confirmation, /−14 m/);
      await page.reload();
      assert.equal(await page.locator('#tx').inputValue(), '−2');
      assert.equal(await page.locator('#tx-message').innerText(), confirmation);
      await capture('correzione', '#tx-message');
      assert.deepEqual(errors, []);
      await ctx.close();
    }
  }
  assert.equal(reports.length, 36);
  const result = {
    item: source.id,
    revision: source.version,
    htmlSHA256: createHash('sha256')
      .update(await readFile(file))
      .digest('hex'),
    engine: browser.version(),
    playwright: require('playwright/package.json').version,
    states,
    concepts,
    cases: reports,
  };
  await writeFile(
    path.join(dest, 'misure.json'),
    JSON.stringify(result, null, 2) + '\n',
  );
  console.log(
    reports.length +
      ' catture, 18 DOM corrispondenti nei due formati, zero richieste HTTP.',
  );
} finally {
  await browser.close();
}
