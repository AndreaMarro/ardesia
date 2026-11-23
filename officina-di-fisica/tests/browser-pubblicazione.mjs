// Exercise the published HTTPS routes using an isolated demonstration notebook.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import { PNG } from 'pngjs';

const base = process.env.OFFICINA_BASE_URL;
assert.equal(new URL(base).protocol, 'https:');
const name = process.argv[2] || 'chromium';
const mobile = process.argv.includes('--telefono'), tablet = process.argv.includes('--tablet');
const flat = process.argv.includes('--senza-webgl');
const requireGL = process.argv.includes('--webgl');
const viewport = mobile ? {width: 320, height: 780} : tablet ? {width: 820, height: 1180} : {width: 1440, height: 960};
const engine = {chromium, firefox, webkit, edge: chromium}[name];
const output = process.env.ASTRA_EVIDENCE || 'prove-https';
const profile = [os.platform(), name, viewport.width, flat ? 'tavola' : 'banco'].join('-');
await mkdir(output, {recursive:true});
const options = name === 'edge' ? {channel:'msedge'} : {};
if (requireGL) options.args = ['--enable-unsafe-swiftshader'];
const browser = await engine.launch(options);
const context = await browser.newContext({viewport, hasTouch: mobile || tablet, isMobile: (mobile || tablet) && name !== 'firefox',
  reducedMotion:'reduce', locale:'it-IT'});
if (flat) await context.addInitScript(() => {
  const normal = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type, ...args) {
    return type.includes('webgl') ? null : normal.call(this, type, ...args);
  };
});
const page = await context.newPage();
page.setDefaultTimeout(25000);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
async function capture(state) {
  await page.screenshot({path:path.join(output, profile+'-'+state+'.png'), animations:'disabled'});
  const excess = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(excess <= 1, 'Scorrimento laterale di '+excess+' px');
}
try {
  const headers = {'X-Astra-Request':'1'};
  const demo = await context.request.post(base+'/api/demo',{headers,data:{}});
  assert.equal(demo.status(),200);
  const searchResponse = await context.request.get(base+'/api/v1/catalog/search?q=lente');
  assert.equal(searchResponse.status(),200);
  assert.ok((await searchResponse.json()).items.some(entry => entry.course === 'C5'));
  await page.goto(base+'/#corso/C1');
  const priorities = page.getByRole('link',{name:'Vai agli esercizi prioritari'});
  await priorities.waitFor();
  await capture('corso');
  await priorities.click();
  await page.getByRole('link',{name:'Aree di segno opposto'}).click();
  await page.locator('#single').click();
  await page.locator('#response [name=value]').fill('-2');
  await page.getByRole('button',{name:'Verifica risposta',exact:true}).click();
  await page.getByRole('button',{name:'Prova il ritorno di 7 s'}).press('Enter');
  const panel = page.locator('.campo-recupero');
  const field = panel.getByLabel('Spostamento finale (m)',{exact:true});
  await field.fill('+2'); await field.press('Enter');
  const feedback = panel.locator('#campo-riscontro');
  await feedback.getByText(/Modulo corretto, segno errato/).first().waitFor();
  await page.reload();
  await page.waitForFunction(() => document.activeElement?.id === 'campo-riscontro');
  assert.equal(await field.inputValue(),'+2');
  await capture('ripresa');
  await panel.getByRole('button',{name:'Rivedi questi 7 s sulla pista'}).click();
  const bank = panel.locator('[data-banco]');
  const clock = bank.getByLabel('Istante sulla pista (s)',{exact:true});
  const canvas = bank.locator('canvas');
  if (requireGL) await canvas.waitFor({state:'visible'});
  const states = [];
  let turningFrame;
  for (let t=1; t<=11; t++) {
    await clock.press('ArrowRight');
    if ([4,9,10,11].includes(t)) states.push(await bank.locator('[data-lettura]').innerText());
    if (t === 4 && requireGL) turningFrame = PNG.sync.read(await canvas.screenshot());
  }
  assert.deepEqual(states,['A 4 s · posizione +12 m · distanza percorsa 12 m','A 9 s · posizione +2 m · distanza percorsa 22 m',
    'A 10 s · posizione 0 m · distanza percorsa 24 m','A 11 s · posizione −2 m · distanza percorsa 26 m']);
  const render = await bank.locator('canvas:visible').count() ? 'WebGL2' : 'tavola 2D';
  let changedPixels;
  if (requireGL) {
    assert.equal(render,'WebGL2');
    const finishFrame = PNG.sync.read(await canvas.screenshot());
    assert.deepEqual([finishFrame.width,finishFrame.height],[turningFrame.width,turningFrame.height]);
    let count = 0;
    for (let i=0; i<finishFrame.data.length; i+=4)
      if (Math.abs(finishFrame.data[i]-turningFrame.data[i])+Math.abs(finishFrame.data[i+1]-turningFrame.data[i+1])+Math.abs(finishFrame.data[i+2]-turningFrame.data[i+2])>50) count++;
    changedPixels = count / (finishFrame.width*finishFrame.height);
    assert.ok(changedPixels>0.001,'Il carrello deve muoversi anche nel fotogramma WebGL.');
  }
  if (flat) {assert.equal(render,'tavola 2D'); await bank.locator('[data-pista-piana] svg').waitFor();}
  await capture('pista');
  await page.goto(base+'/#laboratori');
  const search = page.getByRole('searchbox',{name:'Cerca un argomento'});
  await search.fill('lente');
  const link = page.locator('a[href^="#banco/SIM-C5-L10-02/"]');
  await link.press('Enter');
  await page.locator('[name=prediction]').first().check();
  await page.locator('[data-predict] button').press('Enter');
  await page.locator('[data-guide]').waitFor();
  assert.ok((await page.locator('[data-readings]').innerText()).length>0);
  await capture('lente');
  await page.getByRole('link',{name:'Torna all’attività'}).press('Enter');
  assert.equal(await search.inputValue(),'lente');
  await page.waitForFunction(() => document.activeElement?.getAttribute('href')?.startsWith('#banco/SIM-C5-L10-02/'));
  assert.deepEqual(errors,[]);
  const evidence = {profile,url:base,os:os.type()+' '+os.release(),engine:name,version:browser.version(),viewport,
    emulatedTouch:mobile||tablet,reducedMotion:true,render,changedPixels,states,keyboardFocus:true,restoredAnswer:true,pageErrors:errors};
  await writeFile(path.join(output,profile+'.json'),JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify(evidence));
} catch (failure) {
  const state = await page.evaluate(() => ({heading:document.querySelector('main h1')?.textContent,
    focus:document.activeElement?.id, response:document.querySelector('#campo-riscontro')?.textContent,
    alert:document.querySelector('[role=alert]')?.textContent}));
  console.error(JSON.stringify({profile,state,errors}));
  throw failure;
} finally {
  await context.request.post(base+'/api/logout',{headers:{'X-Astra-Request':'1'},data:{}}).catch(()=>{});
  await browser.close();
}
