import assert from 'node:assert/strict';
import path from 'node:path';
import {readFile, writeFile, mkdir, mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';
import vm from 'node:vm';

const dossier = fileURLToPath(new URL('../', import.meta.url));
const product = path.resolve(dossier,'../../../../officina-di-fisica');
const req = createRequire(path.join(process.env.OFFICINA_DEPS || product,'package.json'));
const {chromium,webkit}=req('playwright');
const axeFile=req.resolve('axe-core/axe.min.js');
const destination=process.argv[2] || await mkdtemp(path.join(tmpdir(),'tre-direzioni-'));
await mkdir(destination,{recursive:true});
const file=pathToFileURL(path.join(dossier,'confronto.html')).href;
const lib=await readFile(path.join(dossier,'prototipi/moto.js'),'utf8');
const model=vm.runInNewContext(lib+'\nmoto');
const records=JSON.parse(await readFile(path.join(product,'content/C1.json'),'utf8'));
const source=records.find(r=>r.id==='C1-Q027');
assert.equal(source.version,2);
assert.equal(model.osserva(5).x,source.answer.value);
let clockSamples=0;
for(let d=0;d<=8;d++) {
  let position=0, distance=0;
  for(let half=0;half<=(4+d)*2;half++) {
    if(half){const velocity=half<=8?3:-2;position+=velocity/2;distance+=Math.abs(velocity)/2}
    const frame=model.osserva(d,half/2);
    assert.equal(frame.x,position);assert.equal(frame.distanza,distance);assert.ok(distance>=Math.abs(position));
    clockSamples++;
  }
}
for(const invalid of [-1,8.5,9,NaN])assert.throws(()=>model.osserva(invalid));
const cases=[],auditTags=['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa'];
const sourceDemo=await readFile(path.join(dossier,'confronto.html'));
const summary={source:{id:source.id,rev:source.version,result_m:source.answer.value},clockSamples,htmlBytes:sourceDemo.length,
  playwright:req('playwright/package.json').version,axe:req('axe-core/package.json').version,axeTags:auditTags,cases};
const screens=[['desktop',1440,900],['tablet',768,1024],['mobile',390,844],['stretto',320,740]];
async function check(page,key,selector){
  await page.locator(selector).first().waitFor();
  await page.evaluate(()=>document.fonts.ready);
  const dimensions=await page.evaluate(()=>[innerWidth,document.documentElement.scrollWidth]);
  assert.ok(dimensions[1]<=dimensions[0]+1,key+' overflow '+dimensions);
  assert.equal(await page.locator('h1:visible').count(),1,key+' h1');
}
async function noteAxe(p,c,label) {
  await p.addScriptTag({path:axeFile});
  const raw=await p.evaluate(async tags=>await window.axe.run(document,{runOnly:{type:'tag',values:tags}}),auditTags);
  c.axe.push({state:label,violations:raw.violations.map(v=>[v.id,v.nodes.length]),review:raw.incomplete.map(v=>[v.id,v.nodes.length])});
  assert.deepEqual(raw.violations.map(v=>[v.id,v.nodes.map(n=>n.target)]),[],c.browser+' '+c.format+' '+label);
}
async function fill(p,s,v){await p.locator(s).fill(v)}
async function screenshot(p,c,label) {
  if(c.browser!=='chromium'||!['desktop','mobile'].includes(c.format))return;
  await p.screenshot({path:path.join(destination,label+'-'+c.format+'.png'),animations:'disabled'});
}
async function finish(p,c) {
  await p.locator('#to-transfer').click();
  await check(p,'trasferimento','#tx');
  await fill(p,'#tx','26');await p.getByRole('button',{name:'Controlla il risultato'}).click();
  assert.match(await p.locator('#tx-message').innerText(),/distanza totale/);
  await fill(p,'#tx','−2,0');await p.getByRole('button',{name:'Controlla il risultato'}).click();
  assert.match(await p.locator('#tx-message').innerText(),/Hai ottenuto −2 m/);
  await noteAxe(p,c,'trasferimento');
  await p.reload();await check(p,'ripresa','#tx');
  assert.match(await p.locator('#tx-message').innerText(),/Hai ottenuto −2 m/);
  await p.getByRole('button',{name:'Ricomincia la prova'}).click();
}
for(const [browserName,engine] of Object.entries({chromium,webkit})){
  const browser=await engine.launch();
  try{
    for(const [format,width,height] of screens){
      const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:width<=390,hasTouch:width<=768,reducedMotion:'reduce'});
      const page=await context.newPage(), errors=[], network=[];
      page.on('pageerror',e=>errors.push(String(e)));
      page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
      page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url())});
      await context.route(/^https?:/, r=>r.abort());
      if(browserName==='chromium')await context.setOffline(true);
      await page.goto(file);await check(page,'indice','h1');
      await screenshot(page,{browser:browserName,format},'confronto');
      await page.keyboard.press(browserName==='webkit'?'Alt+Tab':'Tab');assert.equal(await page.locator(':focus').innerText(),'Vai al contenuto');
      await page.keyboard.press('Enter');assert.equal(await page.locator(':focus').getAttribute('id'),'lavoro');
      for(const key of ['passo','campo','margine']){
        const c={browser:browserName,version:browser.version(),format,width,height,concept:key,axe:[]};
        cases.push(c);
        await page.locator('a[href="#'+key+'"]').click();
        const first={passo:'#prediction .primary',campo:'#predict',margine:'#notebook .primary'}[key];
        await check(page,key,first);
        c.firstAction=await page.locator(first).evaluate(b=>({bottom:Math.round(b.getBoundingClientRect().bottom),inViewport:b.getBoundingClientRect().bottom<=innerHeight}));
        assert.ok(c.firstAction.inViewport,key+' azione iniziale fuori schermo a '+width);
        await screenshot(page,c,key);await noteAxe(page,c,'ingresso');
        if(width===320){
          const spacing=await page.addStyleTag({content:'body *:not(svg *){line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} p:not(:empty){margin-bottom:2em!important}'});
          await check(page,'spaziatura '+key,first);await spacing.evaluate(e=>e.remove());
          c.textSpacingReflow=true;
        }
        if(key==='passo'){
          await page.locator('#prediction .primary').click();assert.match(await page.locator('#prediction-message').innerText(),/Scegli/);
          await page.locator('#hint summary').click();
          await page.getByLabel('Più indietro').check();await page.locator('#prediction .primary').click();
          assert.match(await page.locator('.session').innerText(),/Rivedi la previsione/);
          assert.match(await page.locator('.session').innerText(),/22 m/);
          await screenshot(page,c,'passo-controllo');await noteAxe(page,c,'riscontro');
        } else if(key==='campo'){
          await page.locator('#table').click();assert.equal(await page.locator('tbody tr').last().innerText(),'Ritorno\t5\t−2');
          await page.locator('#chart').click();await page.locator('#duration').focus();await page.keyboard.press('Home');
          assert.equal(await page.locator('#seconds').innerText(),'0 s');assert.ok(await page.locator('#less').isDisabled());
          await page.keyboard.press('End');assert.ok(await page.locator('#more').isDisabled());
          for(let i=0;i<3;i++)await page.locator('#less').click();
          await page.locator('#predict').click();await page.getByLabel('Più avanti').check();await page.locator('#prediction .primary').click();
          assert.match(await page.locator('#phase').innerText(),/\+2 m/);
          await page.locator('#space summary').click();await page.locator('#timeline').focus();await page.keyboard.press('Home');
          for(let i=0;i<4;i++)await page.keyboard.press('ArrowRight');
          assert.match(await page.locator('#instant').innerText(),/\+12 m/);
          const right=await page.locator('#spatial svg polygon').first().getAttribute('points');
          await page.selectOption('#angle','-30');
          assert.notEqual(await page.locator('#spatial svg polygon').first().getAttribute('points'),right);
          await page.locator('#timeline').focus();await page.keyboard.press('End');
          assert.match(await page.locator('#spatial svg').getAttribute('aria-label'),/\+2 metri/);
          await page.locator('#space').scrollIntoViewIfNeeded();await screenshot(page,c,'campo-pista');await noteAxe(page,c,'pista');
          await page.locator('#more').click();assert.equal(await page.locator('#timeline').count(),0);
          await page.locator('#predict').click();await page.getByLabel('Alla partenza').check();await page.locator('#prediction .primary').click();
          assert.match(await page.locator('#phase').innerText(),/finale 0 m/);
        } else {
          await page.getByText('Leggi la fonte',{exact:true}).click();
          assert.match(await page.locator('.book-tools details').innerText(),/C1-Q027, versione 2/);
          assert.ok((await page.locator('.book-tools details').innerText()).includes(source.prompt));
          await page.getByText('Leggi la fonte',{exact:true}).click();
          await fill(page,'#n0','12');await fill(page,'#n1','10');await fill(page,'#n2','22');await page.locator('#notebook .primary').click();
          assert.equal(await page.locator(':focus').getAttribute('id'),'n1');assert.match(await page.locator('#note1').innerText(),/negativo/);
          await screenshot(page,c,'margine-errore');await noteAxe(page,c,'errore');
          await page.emulateMedia({media:'print'});assert.ok(await page.locator('.print-only').isVisible());assert.ok(await page.locator('#notebook').isHidden());
          if(browserName==='chromium'&&format==='desktop')await page.pdf({path:path.join(destination,'scheda-margine.pdf'),preferCSSPageSize:true});
          await page.emulateMedia({media:'screen'});await fill(page,'#n1','−10');await fill(page,'#n2','+2');await page.locator('#notebook .primary').click();
          assert.match(await page.locator('#phase').innerText(),/tre passaggi/);
        }
        await finish(page,c);
        await page.locator('header a').click();
      }
      assert.deepEqual(network,[]);assert.deepEqual(errors,[]);await context.close();
    }
  } finally {await browser.close()}
}
await writeFile(path.join(destination,'esiti.json'),JSON.stringify(summary,null,2)+'\n');
console.log(cases.length+' percorsi completi, '+cases.reduce((n,c)=>n+c.axe.length,0)+' scansioni axe, '+clockSamples+' campioni fisici. '+destination);
