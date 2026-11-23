import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const bank = JSON.parse(await readFile(new URL('../content/C1.json', import.meta.url)));
const methods = JSON.parse(await readFile(new URL('../content/metodo.json', import.meta.url)));
const alternatives = ['F*(1/a)', 'p/(g*rho)-p0/(g*rho)', 'V*p/R/n', '2U/(2I)', 'v*(1/f)'];

export async function revisedLearning(page, device, visit, noOverflow, shots) {
  const snap = async (el, name) => {
    if (shots)
      await el.screenshot({
        path: path.join(shots, name + '-' + device + '.png'),
        animations: 'disabled',
      });
  };
  for (const suffix of ['008', '013', '023', '034', '044', '056', '064', '077', '083', '095']) {
    const id = 'C1-Q' + suffix;
    const { blocks } = bank.find((r) => r.id === id);
    await visit(page, 'materiale/' + id + '/C1', '#single');
    await page.locator('#single').click();
    await page.getByRole('button', { name: 'Leggi lo svolgimento' }).click();
    const solution = page.locator('.feedback'),
      copy = solution.locator('.copy').first();
    await solution.getByRole('button', { name: 'Un passaggio alla volta' }).waitFor();
    const full = await copy.innerHTML();
    assert.equal(await copy.locator(':scope > :visible').count(), blocks.length);
    await solution.getByRole('button', { name: 'Un passaggio alla volta' }).click();
    const sections = blocks.flatMap((b, i) => (b.type === 'figure' ? [i] : []));
    for (const [i, start] of sections.entries()) {
      const expected = blocks.slice(start, sections[i + 1] ?? blocks.length);
      assert.deepEqual(
        await copy
          .locator(':scope > :visible')
          .evaluateAll((ns) =>
            ns.map((n) =>
              n.matches('figure')
                ? n.querySelector('figcaption').textContent
                : n.dataset.tex || n.querySelector('annotation')?.textContent || n.textContent,
            ),
          ),
        expected.map((b) => b.text),
        id,
      );
      await copy.locator('img:visible').evaluate((el) => el.decode());
      assert.equal(await copy.locator('img:visible').getAttribute('src'), expected[0].src);
      assert.ok(
        await copy
          .locator('.math:visible')
          .evaluateAll((ns) => ns.every((n) => n.scrollWidth <= n.clientWidth + 1)),
        id + ' formula',
      );
      await noOverflow(page);
      if (['013', '064', '095'].includes(suffix)) await snap(solution, id + '-' + (i + 1));
      if (i === 0) await solution.getByRole('button', { name: 'Avanti' }).click();
    }
    await solution.getByRole('button', { name: 'Indietro' }).click();
    await solution.getByRole('button', { name: 'Mostra tutto' }).click();
    assert.equal(await copy.innerHTML(), full);
  }
  for (const r of methods) {
    await visit(page, 'corso/' + r.course + '/metodo', '.workshop');
    const panel = page.locator('.workshop');
    await panel.locator('[data-sheet="' + r.id + '"]').click();
    await panel.getByRole('heading', { name: r.title }).waitFor();
    const diagrams = new Map();
    for (const [i, step] of r.steps.entries()) {
      const form = panel.locator('form');
      assert.equal(await form.locator('legend').textContent(), step.prompt);
      if (step.kind === 'choice') {
        await form
          .getByLabel(
            step.options.find((o) => o !== step.answer),
            { exact: true },
          )
          .check();
      } else await form.locator('input').fill(step.kind === 'expression' ? '1/0' : '-999');
      await form.getByRole('button', { name: 'Verifica' }).click();
      assert.ok((await form.getByRole('status').textContent()).includes(step.hint));
      if (step.kind === 'choice') await form.getByLabel(step.answer, { exact: true }).check();
      else
        await form
          .locator('input')
          .fill(
            step.kind === 'expression'
              ? alternatives[Number(r.course[1]) - 1]
              : String(step.answer).replace('.', ','),
          );
      await form.getByRole('button', { name: 'Verifica' }).click();
      assert.ok((await form.getByRole('status').textContent()).includes(step.why));
      await noOverflow(page);
      if (r.format === 'graph') {
        const svg = await panel
          .locator('.work-graph')
          .evaluate((el) => [...el.querySelectorAll('svg')].map((s) => s.innerHTML).join(''));
        diagrams.set(step.stage, svg);
        if (r.course === 'C5' && step.stage === 2)
          assert.equal(await panel.locator('.work-graph svg').count(), 2);
      }
      if (r.course === 'C2' && step.kind === 'expression') await snap(panel, 'formula-C2');
      if (r.course === 'C4' && r.format === 'graph' && step.stage === 2 && step.kind === 'number')
        await snap(panel, 'grafico-C4');
      if (r.course === 'C5' && r.format === 'graph' && i === r.steps.length - 1)
        await snap(panel, 'grafico-C5');
      await form
        .getByRole('button', { name: i + 1 === r.steps.length ? 'Concludi' : 'Continua' })
        .click();
    }
    if (r.format === 'graph') assert.equal(new Set(diagrams.values()).size, 3, r.id);
    await panel.getByText('Attività completata.', { exact: true }).waitFor();
    assert.equal(await panel.locator('.work-history li').count(), r.steps.length);
    await panel.getByRole('button', { name: 'Riprova da capo' }).click();
    assert.equal(await panel.locator('legend').textContent(), r.steps[0].prompt);
  }
}
