import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = process.env.ASTRA_RESULTS || path.join(root, 'var/arch/browser/edizioni');
const json = async file => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const course = await json('content/C5.json');
const reviewed = new Set(Object.keys(await json('tests/fixtures/c5-edizione-v1.json')));
const texts = course.filter(row => reviewed.has(row.id));
const sensor = texts.find(row => row.id === 'C5-Q039');
const bench = (await json('content/esperienze-C5.json')).find(row => row.id === 'SIM-C5-L06-01');
const data = await mkdtemp(path.join(tmpdir(), 'officina-edizioni-'));
const boot = "from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()";
const server = spawn('python3', ['-uc', boot], {cwd: root, env: {...process.env, ASTRA_DATA: data}, stdio: ['ignore','pipe','inherit']});

async function readEdition(page, base, record) {
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

async function audit(page) {
  const result = await page.evaluate(async () => {
    const tags = ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa'];
    const a = await axe.run(document, {runOnly: {type: 'tag', values: tags}});
    return {overflow: document.documentElement.scrollWidth-innerWidth,
      violations: a.violations.map(v => ({id:v.id, targets:v.nodes.map(n => n.target)})),
      incomplete: a.incomplete.map(v => v.id)};
  });
  assert.deepEqual(result.violations, []);
  assert.ok(result.overflow <= 1);
  return result;
}
async function capture(page, element, file) {
  await element.evaluate(el => el.scrollIntoView({block:'start', behavior:'instant'}));
  await page.screenshot({path:path.join(output,file+'.png'), animations:'disabled'});
}

async function projection(page, base, profile) {
  const {copy, widths} = await readEdition(page, base, sensor);
  const img = copy.locator('figure img');
  await img.evaluate(el => el.decode());
  assert.equal(await img.getAttribute('alt'), sensor.blocks.find(b => b.type==='figure').text);
  await capture(page, copy, profile+'-sensore');
  const full = await audit(page);
  const area = page.locator('.feedback');
  await area.getByRole('button',{name:'Un passaggio alla volta',exact:true}).press('Enter');
  const next = area.getByRole('button',{name:'Avanti',exact:true});
  const positions = [];
  for (let i=0; i<sensor.blocks.length; i++) {
    const status = await area.locator('.lettura-stato').innerText();
    assert.ok(!positions.includes(status));
    positions.push(status);
    if (!await next.isEnabled()) break;
    await next.press('Enter');
  }
  assert.ok(positions.length>1 && !await next.isEnabled());
  const show = area.getByRole('button',{name:'Mostra tutto'});
  assert.ok(await show.evaluate(el => document.activeElement===el));
  await show.press('Enter');
  return {widths, positions, full};
}

async function fields(page, base, profile, fallback) {
  await page.goto(base+'/#materiale/'+bench.skill+'/C5');
  const origin = page.locator('a[href^="#banco/'+bench.id+'/"]');
  assert.ok((await origin.locator('xpath=../..').innerText()).includes(bench.anchor));
  await origin.press('Enter');
  await page.getByRole('heading',{name:bench.title,level:1}).waitFor();
  await page.getByText(bench.summary,{exact:true}).waitFor();
  await page.getByLabel('Diminuisce',{exact:true}).check();
  await page.locator('[data-predict] button').press('Enter');
  assert.equal(await page.locator('[data-explain]').innerText(),bench.interpretation);
  assert.equal(await page.locator('[data-view=side]').isDisabled(),fallback);
  const slider = page.locator('#bp-x');
  await slider.press('Home');
  const observations = [];
  const readout = page.locator('[data-readings] > div').filter({hasText:bench.measure.label}).locator('strong');
  const electric=page.locator('[data-readings] > div').filter({hasText:'Campo elettrico in P'}).locator('strong');
  for (const [angle, expected] of [[0,0],[90,10],[180,0],[270,-10]]) {
    while (Number(await slider.inputValue()) < angle) await slider.press('ArrowRight');
    assert.equal(Number(await slider.inputValue()),angle);
    const value = (await readout.innerText()).trim().replace('−','-');
    assert.equal(value, expected+' nT');
    const electricReading=(await electric.innerText()).trim().replace('−','-');
    assert.equal(electricReading,expected*0.3+' V/m');
    observations.push({angle,value,electricReading});
    if (angle===180) {
      if (!fallback) await capture(page,page.locator('.bench-stage'),profile+'-campi-3d');
      await page.locator('[data-view=diagram]').press('Enter');
      await page.locator('[data-drawing]:visible svg').getByText('P',{exact:true}).waitFor();
      assert.equal((await readout.innerText()).trim(),value);
      await capture(page,page.locator('.bench-stage'),profile+'-campi-nulli');
    }
  }
  const access = await audit(page);
  await page.getByRole('link',{name:'Torna all’attività'}).press('Enter');
  await origin.waitFor();
  assert.ok(await origin.evaluate(el => el===document.activeElement),'focus sul paragrafo di origine');
  return {observations, access, returned:bench.skill};
}

try {
  await mkdir(output,{recursive:true});
  const base = 'http://127.0.0.1:'+String((await once(server.stdout,'data'))[0]).trim();
  const reports=[];
  for (const [engine,width,height] of [[chromium,1440,900],[chromium,320,740],[webkit,1440,900],[webkit,390,844]]) {
    const browser = await engine.launch(engine===chromium ? {channel:'chrome',args:['--enable-unsafe-swiftshader']} : {});
    const profile=engine.name()+'-'+width, fallback=width<500;
    try {
      const context=await browser.newContext({viewport:{width,height},locale:'it-IT',hasTouch:fallback,isMobile:fallback,reducedMotion:'reduce'});
      await context.addInitScript({path:path.join(root,'node_modules/axe-core/axe.min.js')});
      if (fallback) await context.addInitScript(() => {
        const original=HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind.includes('webgl') ? null : original.call(this,kind,...args);};
      });
      assert.ok((await context.request.post(base+'/api/demo',{headers:{'X-Astra-Request':'1'},data:{}})).ok());
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',error => errors.push(error.message));
      const report={profile,fallback,projection:await projection(page,base,profile)};
      report.fields=await fields(page,base,profile,fallback);
      if(width===320) {
        report.materials={};
        for(const record of texts) {
          const {widths,copy}=await readEdition(page,base,record);
          report.materials[record.id]=widths;
          if(['C5-L04','C5-Q041'].includes(record.id)) await capture(page,copy,profile+'-'+record.id);
        }
      }
      assert.deepEqual(errors,[]);
      reports.push(report);
    } finally {await browser.close();}
  }
  const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
  await writeFile(path.join(output,'edizioni.json'),JSON.stringify({sha,reports},null,2)+'\n');
  console.log('PASS · quattro profili, proiezione del sensore, campi con segno e ritorno al paragrafo, '+texts.length+' materiali verificati a 320 px.');
} finally {
  const closed=once(server,'exit');
  server.kill();
  await closed;
  await rm(data,{recursive:true,force:true});
}
