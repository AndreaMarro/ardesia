// Import a discipline, publish it, then use the same student interface as the physics courses.
import assert from 'node:assert/strict';
import {spawn, spawnSync} from 'node:child_process';
import {createHash, randomBytes} from 'node:crypto';
import {once} from 'node:events';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium, webkit} from 'playwright';
import Ajv2020 from 'ajv/dist/2020.js';
import {PNG} from 'pngjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const storage = await fs.mkdtemp(path.join(tmpdir(),'officina-contratti-'));
const evidence = path.resolve(process.env.ASTRA_RESULTS || path.join(root,'var/arch/browser'));
await fs.mkdir(evidence,{recursive:true});
const env = {...process.env, ASTRA_DATA:storage, ASTRA_EXTENSIONS:path.join(root,'examples/extensions'), ASTRA_LOG:'1'};
const executable = 'from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); server=ThreadingHTTPServer(("127.0.0.1",0),Handler); print(server.server_port,flush=True); server.serve_forever()';
const service = spawn('python3',['-uc',executable],{cwd:root,env,stdio:['ignore','pipe','pipe']});
const logs = [];
service.stderr.on('data',(data)=>logs.push(String(data)));
const errors = [], audits = [], measures = {}, rendering = {}, browsers = [];
const axe = await fs.readFile(path.join(root,'node_modules/axe-core/axe.min.js'),'utf8');
const vitals = await fs.readFile(path.join(root,'node_modules/web-vitals/dist/web-vitals.iife.js'),'utf8');
const sample = JSON.parse(await fs.readFile(path.join(root,'examples/geometria.json')));
const key = sample.records.at(-1).id;
const auth = {'X-Astra-Request':'1'};
let url;
async function post(page,route,body) {
  const response = await page.request.post(url+'api/'+route,{headers:auth,data:body});
  assert.ok(response.ok(), route+' '+response.status()+' '+await response.text());
  return response.json();
}
async function go(page, route, selector) {
  // A direct-entry test starts with a new document, apart from the click-through journeys below.
  if (page.url() !== 'about:blank') await page.goto('about:blank');
  await page.goto(url+'#'+route);
  await page.locator(selector).first().waitFor({state:'visible'});
  await page.waitForFunction(()=>!document.querySelector('main')?.hasAttribute('aria-busy'));
}
async function audit(page, label) {
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1),label+' · reflow');
  await page.evaluate(axe);
  const report = await page.evaluate(async () => {
    const result = await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa']}});
    const summarize=(rule)=>({id:rule.id,nodes:rule.nodes.map((n)=>n.target.join(' '))});
    return {violations:result.violations.map(summarize),incomplete:result.incomplete.map(summarize),passed:result.passes.length};
  });
  audits.push({page:label,...report});
  if (report.violations.length) console.log(label, JSON.stringify(report.violations));
}
async function shot(page, label, locator) {
  await page.evaluate(()=>document.fonts.ready);
  await (locator || page).screenshot({path:path.join(evidence,label+'.png'),animations:'disabled'});
}
async function baseline(svg) {
  const file = path.join(root,'tests/fixtures/area-tavola.png');
  // Normalise the diagram viewport alone, keeping its viewBox and actual rendering code.
  await svg.evaluate((el)=>{el.style.width='300px'; el.style.height='168px';});
  const capture = await svg.screenshot({animations:'disabled'});
  if (process.env.ASTRA_RECORD_GOLDEN==='1') await fs.writeFile(file,capture);
  const a=PNG.sync.read(capture), b=PNG.sync.read(await fs.readFile(file));
  assert.equal(a.width,b.width); assert.equal(a.height,b.height);
  let changed=0;
  for(let i=0;i<a.data.length;i+=4) if ([0,1,2].some((j)=>Math.abs(a.data[i+j]-b.data[i+j])>40)) changed++;
  assert.ok(changed/(a.width*a.height)<0.025,'Regressione della tavola '+changed+' pixel');
  await svg.evaluate((el)=>{el.style.removeProperty('width');el.style.removeProperty('height');});
}
async function install(page) {
  const ticket = randomBytes(32).toString('base64url');
  const prep = spawnSync('python3',['-c',"from server.store import *;import sys;d=connect();d.execute('INSERT INTO tickets VALUES(?,?)',(sys.argv[1],NOW()+180));d.commit();d.close()",createHash('sha256').update(ticket).digest('hex')],{cwd:root,env});
  assert.equal(prep.status,0);
  await post(page,'owner',{ticket});
  await go(page,'autore/lotti','#check-batch');
  await page.getByText('Incolla il contenuto JSON',{exact:true}).click();
  await page.locator('#batch-source').fill(JSON.stringify(sample));
  await page.locator('#check-batch').click();
  await page.getByText(/3 materiali controllati/).waitFor();
  await page.locator('#commit-batch').click();
  await page.getByText(/3 materiali importati/).waitFor();
  const targets = Object.fromEntries(sample.records.map((r)=>[r.id,1]));
  await post(page,'author/publish',{targets});
  const libraryReply = await page.request.get(url+'api/author/editorial-library/GEO');
  assert.ok(libraryReply.ok());
  const library = await libraryReply.json();
  const librarySchema=await (await page.request.get(url+'api/v1/schemas/library-v1.schema.json')).json();
  assert.ok(new Ajv2020().compile(librarySchema)(library));
  assert.deepEqual(library.records.map(r=>r.id),['GEO-L01']);
  assert.equal(library.records[0].blocks[0].text,sample.records[1].blocks[0].text);
  await page.getByText('Rivedi una proposta di aiuto didattico',{exact:true}).click();
  const proposal={objectId:'GEO-L01',version:1,passage:0,strategy:'confronta-le-misure'};
  await page.locator('#scaffold-source').fill(JSON.stringify(proposal));
  await page.locator('#preview-scaffold').click();
  await page.locator('#approve-scaffold').waitFor();
  assert.ok((await page.locator('#scaffold-review blockquote').innerText()).includes('tre file'));
  await audit(page,'desktop-autore');
  await page.locator('#approve-scaffold').click();
  await page.getByText('Aiuto salvato nella bozza 2.').waitFor();
  const draftCheck=await page.request.get(url+'api/item/GEO-L01');
  assert.equal((await draftCheck.json()).scaffold,undefined);
  await page.getByRole('link',{name:'Rileggi la bozza'}).click();
  await page.locator('#review-publish').click();
  await page.locator('#editor-confirm').click();
  await page.locator('#review-withdraw').waitFor();
}
async function learner(browser, profile) {
  const mobile=profile!=='desktop', flat=profile==='mobile-tavola';
  const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1365,height:900},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1,reducedMotion:'reduce'});
  await ctx.addInitScript((flat)=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(kind,...args){
      if(flat && kind.includes('webgl')) return null;
      const gl=original.call(this,kind,...args);
      if(kind==='webgl2' && gl && !gl.officinaObserved){
        const draw=gl.drawElements;
        gl.drawElements=function(...values){const result=draw.apply(gl,values);gl.canvas.dataset.painted='yes';return result;};
        gl.officinaObserved=true;
      }
      return gl;
    };
  },flat);
  const page=await ctx.newPage(); page.setDefaultTimeout(10000);
  page.on('pageerror',(err)=>errors.push(err.message));
  const anonymous=await page.request.get(url+'api/v1/courses/GEO/learning-path');
  assert.equal(anonymous.status(),401);
  await post(page,'demo',{});
  const denied=await page.request.post(url+'api/author/scaffold',{headers:auth,data:{commit:false}});
  assert.equal(denied.status(),403);
  const contract=await (await page.request.get(url+'api/v1/schemas/pathway-v1.schema.json')).json();
  const roadmap=await (await page.request.get(url+'api/v1/courses/GEO/learning-path')).json();
  const accepts=new Ajv2020().compile(contract);
  assert.ok(accepts(roadmap),JSON.stringify(accepts.errors));
  assert.deepEqual(roadmap.lessons[0].resources.experiment,[key]);
  await go(page,'corso/GEO/lezioni','[data-learning-path]');
  const toggle=page.locator('[data-learning-path] summary');
  await toggle.focus();await page.keyboard.press('Enter');
  await page.getByRole('link',{name:'Apri la lezione',exact:true}).waitFor();
  assert.ok(await page.getByText(/Famiglie di problemi tentate senza aiuto/).isVisible());
  await audit(page,profile+'-prerequisiti');
  if(!mobile) await shot(page,'percorso-desktop');
  await page.getByRole('link',{name:'Apri la lezione',exact:true}).click();
  await page.getByText('Confronta le misure',{exact:true}).first().click();
  const target=page.locator('a[href^="#banco/'+key+'/"]').first();
  await target.waitFor();
  await audit(page,profile+'-lezione');
  await target.click();
  const lab=page.locator('[data-bench="'+key+'"]');
  await lab.waitFor();
  await lab.locator(flat?'.bench-diagram':'canvas[data-painted=yes]').waitFor();
  if(!flat){
    rendering[profile]=await lab.locator('canvas').evaluate(el=>{
      const gl=el.getContext('webgl2'); const info=gl?.getExtension('WEBGL_debug_renderer_info');
      return info?gl.getParameter(info.UNMASKED_RENDERER_WEBGL):'WebGL2';
    });
  }
  if(!mobile){
    const focus=lab.locator('[data-focus]');
    await focus.focus(); await page.keyboard.press('Enter');
    await page.locator('dialog[open]').waitFor();
    await page.keyboard.press('Escape');
    assert.ok(await focus.evaluate(el=>el===document.activeElement));
  }
  await lab.locator('[name=prediction]').nth(2).check();
  await lab.locator('[data-predict] button').click();
  const read=lab.locator('[data-readings] div').nth(1).locator('strong');
  assert.match(await read.innerText(),/6 cm²/);
  await lab.locator('[data-compare]').click();
  assert.match(await read.innerText(),/15 cm²/);
  await audit(page,profile+'-strumento');
  await lab.locator('.bench-instrument').scrollIntoViewIfNeeded();
  await shot(page,'tassellazione-'+profile);
  if(flat) await baseline(lab.locator('.bench-diagram'));
  await lab.locator('[data-next]').click();
  await lab.locator('[data-comparison] figure').nth(1).waitFor();
  assert.equal(await lab.locator('[data-comparison] svg[role=img]').count(),2);
  await audit(page,profile+'-confronto');
  if(!mobile) await shot(page,'confronto-desktop',lab.locator('[data-comparison]'));
  await lab.locator('[data-pair-next]').click();
  await lab.locator('[data-next]').click();
  await lab.locator('[data-next]').click();
  await lab.locator('[data-check="0"]').waitFor();
  await audit(page,profile+'-verifica');
  if(mobile){
    await page.setViewportSize({width:320,height:640});
    await audit(page,profile+'-320px');
  }
  await ctx.close();
}
async function performanceRun(browser) {
  const context=await browser.newContext({viewport:{width:1365,height:900}});
  const page=await context.newPage();
  await page.addInitScript({content:vitals+"\nwindow.officinaVitals={}; for (const fn of ['onLCP','onCLS','onINP']) webVitals[fn](m=>window.officinaVitals[m.name]=m.value,{reportAllChanges:true,durationThreshold:16});"});
  await go(page,'home','main h1');
  await page.locator('nav[aria-label="Navigazione principale"] a[href="#percorsi"]').click();
  await page.locator('main h1').waitFor();
  await page.locator('nav[aria-label="Navigazione principale"] a[href="#laboratori"]').click();
  await page.locator('#simulazioni-voci').waitFor();
  const observer=page.waitForFunction(()=>Object.hasOwn(window.officinaVitals,'INP'),null,{timeout:6000});
  // A short keyboard interaction in each animation frame generates trusted input even on fast machines.
  for(let i=0;i<12;i++) await page.keyboard.press('Tab');
  await observer;
  // web-vitals finalises the current document when its visibility changes.
  const other=await page.context().newPage();
  await other.bringToFront();
  Object.assign(measures,await page.evaluate(()=>window.officinaVitals));
  assert.ok([measures.LCP,measures.INP,measures.CLS].every(Number.isFinite),JSON.stringify(measures));
  assert.ok(measures.LCP<2500 && measures.INP<200 && measures.CLS<=0.1,JSON.stringify(measures));
  await page.context().close();
}
try {
  const [port]=await Promise.race([once(service.stdout,'data'),once(service,'exit').then(()=>{throw Error(logs.join(''));})]);
  url='http://127.0.0.1:'+String(port).trim()+'/';
  const opts=process.env.ASTRA_CHROME?{executablePath:process.env.ASTRA_CHROME}:{channel:'chrome'};
  const desktop=await chromium.launch({...opts,headless:process.env.ASTRA_HEADED!=='1',args:process.platform==='linux'?['--enable-unsafe-swiftshader']:[]});
  browsers.push(desktop);
  const author=await desktop.newPage();author.setDefaultTimeout(12000);
  await install(author);
  await go(author,'autore','main h1');
  await audit(author,'desktop-archivio-autore');
  await go(author,'edizioni','.tablebox');
  await audit(author,'desktop-edizioni');
  await author.close();
  await learner(desktop,'desktop');
  const safari=await webkit.launch();browsers.push(safari);
  await learner(safari,'mobile-tavola');
  await learner(safari,'mobile-webgl');
  const smoke=await desktop.newPage();
  await go(smoke,'home','main h1');
  await smoke.locator('.skip').focus();await smoke.keyboard.press('Enter');
  assert.equal(await smoke.evaluate(()=>document.activeElement.id),'main');
  await audit(smoke,'desktop-home');
  await go(smoke,'accedi/nuovo/studio','#auth');
  await audit(smoke,'desktop-registrazione');
  await post(smoke,'register',{email:'prova@example.invalid',password:'Prova-locale-2026'});
  await smoke.reload();
  await go(smoke,'acquisto/C1','#order');
  await audit(smoke,'desktop-riepilogo-ordine');
  await post(smoke,'logout',{});
  await post(smoke,'demo',{});
  await smoke.reload();
  await go(smoke,'corso/C1','main .c1-paths');
  await audit(smoke,'desktop-orientamento-C1');
  await go(smoke,'materiale/C1-L004/C1','.bench-topic');
  await audit(smoke,'desktop-lezione-C1');
  await go(smoke,'materiale/C1-Q027/C1','#single');
  await smoke.locator('#single').click();
  await smoke.getByLabel('Risposta numerica in m',{exact:true}).fill('2');
  await audit(smoke,'desktop-risposta');
  await smoke.getByRole('button',{name:'Verifica risposta'}).click();
  await smoke.getByRole('button',{name:'Un passaggio alla volta'}).click();
  await audit(smoke,'desktop-soluzione-progressiva');
  await go(smoke,'laboratori','#simulazioni-voci');
  await audit(smoke,'desktop-indice-laboratori');
  await go(smoke,'sprint','.method-intro');
  await audit(smoke,'desktop-esame-rapido');
  await go(smoke,'allenamento/C6','#exam-1');
  await audit(smoke,'desktop-esame-C6');
  await smoke.locator('#exam-1').click();
  await smoke.locator('#clock').waitFor();
  await audit(smoke,'desktop-fascicolo-C6');
  await smoke.close();
  await performanceRun(desktop);
  const entries=logs.join('').split('\n').filter(s=>s.startsWith('{')).map(line=>JSON.parse(line));
  assert.ok(entries.some(entry=>entry.status===403 && /^[a-f0-9]{16}$/.test(entry.requestId)));
  assert.ok(entries.every(entry=>Object.keys(entry).sort().join() === 'bytes,component,durationMs,method,requestId,status'));
  assert.deepEqual(errors,[]);
  assert.deepEqual(audits.filter((item)=>item.violations.length).map((r)=>r.page),[],'Violazioni WCAG');
  console.log(JSON.stringify({pagine:audits.length,misure:measures,grafica:rendering}));
} finally {
  await fs.writeFile(path.join(evidence,'revisione.json'),JSON.stringify({audits,measures,rendering,errors},null,2)+'\n');
  for(const browser of browsers) await browser.close();
  if(service.exitCode===null && service.signalCode===null){ const ended=once(service,'exit');service.kill();await ended;}
  await fs.rm(storage,{recursive:true,force:true});
}
