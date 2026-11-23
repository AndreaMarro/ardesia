import assert from 'node:assert/strict';

export async function readEdition(page, base, record) {
  await page.goto(base + '/#materiale/' + record.id + '/' + record.course);
  let copy;
  if (record.kind === 'question') {
    await page.locator('#single').press('Enter');
    await page.getByText(record.prompt, {exact: true}).first().waitFor();
    await page.locator('#reveal').press('Enter');
    copy = page.locator('.feedback > .copy');
  } else {
    await page.getByRole('heading', {name: record.title, level: 1, exact: true}).waitFor();
    copy = page.locator('.lettura-contenuto > .copy');
  }
  await copy.waitFor();
  await page.waitForFunction(() => !document.querySelector('.feedback [data-tex],.lettura-contenuto [data-tex]'));
  await page.evaluate(() => document.fonts.ready);
  const rendered = await copy.evaluate(el => [...el.children].map(block => {
    const body = block.querySelector('math annotation,figcaption,:scope > p,:scope > span > strong');
    return body?.textContent ?? block.textContent;
  }));
  const normalize = list => list.map(text => text.replace(/\s+/g, ' ').trim());
  assert.deepEqual(normalize(rendered), normalize(record.blocks.map(b => b.text)), record.id);
  const widths = await copy.locator('.math').evaluateAll(nodes => nodes.map(el => ({
    width: el.clientWidth, scroll: el.scrollWidth, typeset: el.querySelector('.katex-html').getBoundingClientRect().width,
  })));
  assert.ok(widths.every(w => w.scroll <= w.width+1 && w.typeset <= w.width+1), record.id + ' ' + JSON.stringify(widths));
  return {copy, widths};
}
