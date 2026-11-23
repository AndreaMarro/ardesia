import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {misuraFluidi} from './browser-fluidi.mjs';
import { chromium, webkit } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = process.env.ASTRA_RESULTS || path.join(root, 'var/arch/browser/edizioni');
const json = async file => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const course = await json('content/C5.json');
const reviewed = new Set(Object.keys(await json('tests/fixtures/c5-edizione-v1.json')));
const texts = course.filter(row => reviewed.has(row.id));
const sensor = texts.find(row => row.id === 'C5-Q039');
const mechanics = await json('content/C1.json');
const mechanicsIds = new Set(Object.keys(await json('tests/fixtures/c1-edizione-v1.json')));
const mechanicsTexts = mechanics.filter(row => mechanicsIds.has(row.id));
const friction = mechanics.find(row => row.id === 'C1-Q078');
const secants = (await json('content/esperienze-C1.json')).filter(row =>
  ['SIM-C1-L003-03','SIM-C1-L003-04'].includes(row.id));
const fluids = await json('content/C2.json');
const fluidIds = new Set(Object.keys(await json('tests/fixtures/c2-edizione-v1.json')));
const fluidTexts = fluids.filter(row => fluidIds.has(row.id));
const probe = fluids.find(row => row.id==='C2-Q062');
const fluidBenches = (await json('content/esperienze-C2.json')).filter(row => fluidIds.has(row.id));
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

async function illustratedSolution(page, base, profile, record, name) {
  const {copy, widths} = await readEdition(page, base, record);
  const img = copy.locator('figure img');
  await img.evaluate(el => el.decode());
  assert.equal(await img.getAttribute('alt'), record.blocks.find(b => b.type==='figure').text);
  await capture(page, name==='sensore' ? copy : img, profile+'-'+name);
  const full = await audit(page);
  const area = page.locator('.feedback');
  await area.getByRole('button',{name:'Un passaggio alla volta',exact:true}).press('Enter');
  const next = area.getByRole('button',{name:'Avanti',exact:true});
  const positions = [];
  for (let i=0; i<record.blocks.length; i++) {
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

async function delayedReader(page, base, keyboard) {
  // Il link è già usabile mentre il modulo opzionale del lettore è ancora in arrivo.
  const bench=secants[1], module='**/preferenze-lettura.js';
  let release;
  const held=new Promise(resolve=>{release=resolve;});
  await page.route(module,async route=>{await held; await route.continue();},{times:1});
  const requested=page.waitForRequest(module);
  const origin=page.locator('a[href^="#banco/'+bench.id+'/"]');
  try {
    await page.goto(base+'/#materiale/'+bench.skill+'/C1',{waitUntil:'domcontentloaded'});
    await requested;
    assert.equal(await page.locator('main').getAttribute('aria-busy'),'true');
    if(keyboard) await origin.press('Enter');
    else await origin.click();
    await page.waitForURL('**/#banco/**');
  } finally {release();}
  await page.getByRole('link',{name:'Torna all’attività'}).press('Enter');
  await origin.waitFor();
  await page.locator('main:not([aria-busy])').waitFor();
  assert.ok(await origin.evaluate(el=>el===document.activeElement), 'focus dopo il caricamento tardivo');
  return keyboard ? 'tastiera' : 'puntatore';
}

async function focusedDuringLoading(context, base, profile) {
  const page = await context.newPage();
  const module = '**/preferenze-lettura.js';
  const bench = secants[1];
  let resume;
  const held = new Promise(resolve => { resume = resolve; });
  await page.route(module, async route => { await held; await route.continue(); }, {times:1});
  try {
    const requested = page.waitForRequest(module);
    await page.goto(base+'/#materiale/'+bench.skill+'/C1', {waitUntil:'domcontentloaded'});
    await requested;
    const origin = page.locator('a[href^="#banco/'+bench.id+'/"]');
    assert.equal(await page.locator('main').getAttribute('aria-busy'),'true');
    await origin.focus();
    const readingHere = () => origin.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return el===document.activeElement && scrollY>0 && rect.bottom>0 && rect.top<innerHeight;
    });
    assert.ok(await readingHere(), 'collegamento raggiunto durante il caricamento');
    resume();
    await page.locator('main:not([aria-busy])').waitFor();
    assert.ok(await readingHere(), 'il completamento della lezione conserva il controllo scelto in vista');
    await page.screenshot({path:path.join(output,profile+'-focus-lettore.png'), animations:'disabled'});
    await page.keyboard.press('Enter');
    await page.getByRole('heading',{name:bench.title,level:1}).waitFor();
    await page.locator('main:not([aria-busy])').waitFor();
    assert.ok(await page.locator('main').evaluate(el=>document.activeElement===el),'annuncio del banco appena aperto');
    await page.getByRole('link',{name:'Torna all’attività'}).press('Enter');
    await origin.waitFor();
    await page.locator('main:not([aria-busy])').waitFor();
    assert.ok(await origin.evaluate(el=>document.activeElement===el),'ritorno al collegamento scelto');
    return bench.id;
  } finally {
    resume();
    await page.close();
  }
}

async function readSecant(page, base, profile, bench, fallback) {
  await page.goto(base+'/#materiale/'+bench.skill+'/C1');
  const origin=page.locator('a[href^="#banco/'+bench.id+'/"]');
  assert.ok((await origin.locator('xpath=../..').innerText()).includes(bench.anchor));
  await origin.press('Enter');
  await page.getByRole('heading',{name:bench.title,level:1}).waitFor();
  await page.getByLabel('Aumenta',{exact:true}).check();
  await page.locator('[data-predict] button').press('Enter');
  assert.equal(await page.locator('[data-explain]').innerText(),bench.interpretation);
  assert.equal(await page.locator('[data-view=side]').isDisabled(),fallback);
  await page.locator('[data-view=diagram]').press('Enter');
  await page.locator('[data-drawing]:visible svg').waitFor();
  const slider=page.locator('#bp-x');
  const readout=page.locator('[data-readings] > div').filter({hasText:bench.measure.label}).locator('strong');
  const unit=bench.id.endsWith('03') ? 'm/s' : 'm/s²';
  await slider.press('Home');
  const observations=[];
  for (const [dt,expected] of [[.25,'2,25'],[1,'3'],[2,'4']]) {
    while(Number(await slider.inputValue())<dt) await slider.press('ArrowRight');
    assert.equal(Number(await slider.inputValue()),dt);
    const value=(await readout.innerText()).trim();
    assert.equal(value,expected+' '+unit);
    observations.push({dt,value});
    if(dt===1) {
      const drawer=page.locator('[data-plots]');
      if(!await drawer.evaluate(el=>el.open)) await drawer.locator('summary').press('Enter');
      const graph=drawer.locator('figure').filter({hasText:'Secante fra gli estremi'});
      assert.ok((await graph.locator('svg').getAttribute('aria-label')).includes('Tempo dalla prima lettura (s)'));
      assert.equal(await graph.locator('svg path[stroke-dasharray="5 4"]').count(),1);
      if (fallback) {
        const size=await graph.locator('svg text').first().evaluate(el=>
          parseFloat(getComputedStyle(el).fontSize)*el.getScreenCTM().a);
        assert.ok(size>=12,'dimensione in pixel CSS delle etichette della secante: '+size);
      }
      if(bench.id.endsWith('04')) await capture(page,graph,profile+'-secante');
    }
  }
  const access=await audit(page);
  await page.getByRole('link',{name:'Torna all’attività'}).press('Enter');
  await origin.waitFor();
  await page.locator('main:not([aria-busy])').waitFor();
  assert.ok(await origin.evaluate(el=>el===document.activeElement),'ritorno da '+bench.id);
  return {id:bench.id,observations,access};
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
      const late=await delayedReader(page,base,fallback);
      const focusedLink=await focusedDuringLoading(context,base,profile);
      const report={profile,fallback,late,focusedLink,projection:await illustratedSolution(page,base,profile,sensor,'sensore')};
      report.fields=await fields(page,base,profile,fallback);
      report.mechanics={friction:await illustratedSolution(page,base,profile,friction,'attrito'),secants:[]};
      for (const secant of secants) report.mechanics.secants.push(await readSecant(page,base,profile,secant,fallback));
      report.fluids={probe:await illustratedSolution(page,base,profile,probe,'sezione'), benches:[]};
      for(const bench of fluidBenches)
        report.fluids.benches.push(await misuraFluidi(page,base,profile,bench,fallback,{capture,audit}));
      if(width===320) {
        report.fluids.materials={};
        for(const record of fluidTexts) {
          const {copy,widths}=await readEdition(page,base,record);
          report.fluids.materials[record.id]=widths;
          if(record.id==='C2-E016') await capture(page,copy,profile+'-'+record.id);
        }
        report.mechanics.materials={};
        for(const record of mechanicsTexts) {
          const {copy,widths}=await readEdition(page,base,record);
          report.mechanics.materials[record.id]=widths;
          if (record.id==='C1-Q007') await capture(page,copy,profile+'-'+record.id);
        }
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
  console.log('PASS · quattro profili · sensore e campi, attrito e secanti · C5 '+texts.length+' e C1 '+mechanicsTexts.length+' e C2 '+fluidTexts.length+' materiali a 320 px.');
} finally {
  const closed=once(server,'exit');
  server.kill();
  await closed;
  await rm(data,{recursive:true,force:true});
}
