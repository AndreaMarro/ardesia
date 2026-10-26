import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const origin = process.env.S20_ORIGIN, out = process.env.S20_EVIDENCE_DIR;
const access = JSON.parse(await fs.readFile(path.join(process.env.S20_PRIVATE_DIR, 'access.json'), 'utf8'));
await fs.mkdir(out, { recursive: true });
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await c.newPage(); const checks = [];
try {
  assert.equal((await c.request.post(origin + '/study/session', { data: { token: access.student } })).status(), 200);
  await p.goto(origin + '/?view=classroom&edition=fluidi');
  await p.getByRole('button', { name: 'Apri episodio guidato', exact: true }).click();
  const step = p.locator('.episode-step');
  await step.getByRole('textbox', { name: 'Rapporto previsto', exact: true }).fill('16');
  await step.getByRole('combobox', { name: 'Grandezza che resta fissata', exact: true }).selectOption('pressure');
  await step.getByRole('textbox', { name: 'Spiega il vincolo e il procedimento', exact: true }).fill('Mantengo Δp costante e confronto il raggio alla quarta potenza.');
  await step.getByRole('button', { name: 'Registra previsione e confronta', exact: true }).click();
  await step.getByTestId('episode-ratio').waitFor();
  const workspace = await (await c.request.get(origin + '/study/workspace?editionId=fluidi')).json();
  const expectedReceipt = workspace.submissions.at(-1).receipt_id;
  await p.screenshot({ path: path.join(out, 'baseline-episode-1440.png'), fullPage: true });
  checks.push({ name: 'main already provides inline prediction/model/next problem', status: 'PASS' });
  await step.getByRole('button', { name: 'Cambia il vincolo', exact: true }).click();
  await step.getByRole('heading', { name: 'Raggio doppio, portata fissata' }).waitFor();
  await p.reload();
  await p.getByRole('button', { name: 'Apri episodio guidato', exact: true }).waitFor();
  assert.equal(await p.locator('.episode-step').count(), 0);
  checks.push({ name: 'baseline refresh does not restore guided episode or active second step', status: 'OBSERVED' });
  await p.getByRole('button', { name: 'Il mio lavoro', exact: true }).click();
  await p.getByRole('button', { name: 'Consegne e feedback', exact: true }).click();
  const delivery = p.locator('.delivery-row').first();
  await delivery.getByText('Originali, versione e ricevuta', { exact: true }).click();
  await delivery.locator('.id-text').filter({ hasText: expectedReceipt }).waitFor();
  await p.screenshot({ path: path.join(out, 'baseline-receipt-1440.png'), fullPage: true });
  checks.push({ name: 'receipt reopen from lesson after refresh: work nav + deliveries tab + originals disclosure', actions: 3, status: 'MEASURED' });
} catch (e) { checks.push({ name: 'baseline run', status: 'FAIL', error: e.message }); throw e; }
finally { await fs.writeFile(path.join(out, 'baseline-result.json'), JSON.stringify({ checks, source: 'a00f2f40091aecf69e58ebaba42cf70d748e4066; proof config has no S20 or S02 transforms', limitation: 'Task walkthrough, not user test or timing benchmark. Entry/input actions excluded from receipt comparison.' }, null, 2)); await b.close(); }
